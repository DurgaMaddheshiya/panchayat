package com.apnashehar.service;

import com.apnashehar.dto.request.RatingRequest;
import com.apnashehar.dto.response.OfficialStatsResponse;
import com.apnashehar.dto.response.PagedResponse;
import com.apnashehar.dto.response.RatingResponse;
import com.apnashehar.entity.Complaint;
import com.apnashehar.entity.OfficialRating;
import com.apnashehar.entity.User;
import com.apnashehar.enums.ComplaintStatus;
import com.apnashehar.exception.BadRequestException;
import com.apnashehar.exception.ResourceNotFoundException;
import com.apnashehar.repository.ComplaintRepository;
import com.apnashehar.repository.OfficialRatingRepository;
import com.apnashehar.repository.UserRepository;
import com.apnashehar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for managing official ratings and feedback
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RatingService {

    private final OfficialRatingRepository ratingRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    /**
     * Submit rating for an official (only complaint owner, only resolved)
     */
    @Transactional
    public RatingResponse submitRating(RatingRequest request) {
        UserPrincipal currentUser = getCurrentUser();

        Complaint complaint = complaintRepository.findById(request.getComplaintId())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", request.getComplaintId()));

        if (!complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only rate officials for your own complaints");
        }
        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new BadRequestException("You can only rate officials for resolved complaints");
        }
        if (complaint.getAssignedTo() == null) {
            throw new BadRequestException("No official assigned to this complaint");
        }
        if (ratingRepository.existsByCitizenIdAndComplaintId(currentUser.getId(), request.getComplaintId())) {
            throw new BadRequestException("You have already rated this official for this complaint");
        }

        OfficialRating rating = OfficialRating.builder()
                .complaint(complaint)
                .citizen(complaint.getCreatedBy())
                .official(complaint.getAssignedTo())
                .rating(request.getRating())
                .feedback(request.getFeedback())
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .build();

        rating = ratingRepository.save(rating);

        log.info("Rating submitted: {} stars for official {} by citizen {}",
                request.getRating(), complaint.getAssignedTo().getId(), currentUser.getId());

        return mapToRatingResponse(rating);
    }

    /**
     * Get ratings for an official (paginated)
     */
    public PagedResponse<RatingResponse> getOfficialRatings(Long officialId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OfficialRating> ratingsPage = ratingRepository.findByOfficialIdOrderByCreatedAtDesc(officialId, pageable);

        List<RatingResponse> ratings = ratingsPage.getContent().stream()
                .map(this::mapToRatingResponse)
                .toList();

        return PagedResponse.<RatingResponse>builder()
                .content(ratings)
                .pageNumber(ratingsPage.getNumber())
                .pageSize(ratingsPage.getSize())
                .totalElements(ratingsPage.getTotalElements())
                .totalPages(ratingsPage.getTotalPages())
                .first(ratingsPage.isFirst())
                .last(ratingsPage.isLast())
                .hasNext(!ratingsPage.isLast())
                .hasPrevious(!ratingsPage.isFirst())
                .build();
    }

    /**
     * Get official performance statistics
     */
    public OfficialStatsResponse getOfficialStats(Long officialId) {
        User official = userRepository.findById(officialId)
                .orElseThrow(() -> new ResourceNotFoundException("Official", "id", officialId));

        Double avgRating = ratingRepository.getAverageRatingByOfficialId(officialId);
        Long totalRatings = ratingRepository.countByOfficialId(officialId);

        List<Object[]> distribution = ratingRepository.getRatingDistributionByOfficialId(officialId);
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (Object[] row : distribution) {
            ratingDistribution.put((Integer) row[0], ((Number) row[1]).longValue());
        }

        Long totalResolved = complaintRepository.countByAssignedToIdAndStatus(officialId, ComplaintStatus.RESOLVED);
        Long pending = complaintRepository.countByAssignedToIdAndStatusIn(officialId,
                List.of(ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS));
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        Long thisMonthComplaints = complaintRepository.countByAssignedToIdAndCreatedAtAfter(officialId, monthStart);

        return OfficialStatsResponse.builder()
                .officialId(officialId)
                .officialName(official.getFullName())   // fixed: getFullName() not getName()
                .officialRole(official.getRole().name())
                .averageRating(avgRating != null ? Math.round(avgRating * 100.0) / 100.0 : 0.0)
                .totalRatings(totalRatings != null ? totalRatings : 0L)
                .totalComplaintsResolved(totalResolved != null ? totalResolved : 0L)
                .ratingDistribution(ratingDistribution)
                .complaintsThisMonth(thisMonthComplaints != null ? thisMonthComplaints : 0L)
                .pendingComplaints(pending != null ? pending : 0L)
                .build();
    }

    /**
     * Get top-rated officials leaderboard (min 1 rating)
     */
    public List<OfficialStatsResponse> getTopRatedOfficials(int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<Object[]> topOfficials = ratingRepository.getTopRatedOfficials(1L, pageable);

            return topOfficials.stream()
                    .map(row -> OfficialStatsResponse.builder()
                            .officialId(((Number) row[0]).longValue())
                            .officialName((String) row[1])
                            .averageRating(Math.round(((Number) row[2]).doubleValue() * 100.0) / 100.0)
                            .totalRatings(((Number) row[3]).longValue())
                            .build())
                    .toList();
        } catch (Exception e) {
            log.error("Leaderboard query failed: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Check if current user can rate this complaint.
     * Safe - returns false on any error (non-citizen, not owner, already rated, etc.)
     */
    public boolean canRateComplaint(Long complaintId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal currentUser)) {
                return false;
            }

            Complaint complaint = complaintRepository.findById(complaintId).orElse(null);
            if (complaint == null) return false;
            if (!complaint.getCreatedBy().getId().equals(currentUser.getId())) return false;
            if (complaint.getStatus() != ComplaintStatus.RESOLVED) return false;
            if (complaint.getAssignedTo() == null) return false;

            return !ratingRepository.existsByCitizenIdAndComplaintId(currentUser.getId(), complaintId);

        } catch (Exception e) {
            log.debug("canRateComplaint check failed: {}", e.getMessage());
            return false;
        }
    }

    private UserPrincipal getCurrentUser() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private RatingResponse mapToRatingResponse(OfficialRating rating) {
        return RatingResponse.builder()
                .id(rating.getId())
                .complaintId(rating.getComplaint().getId())
                .complaintTitle(rating.getComplaint().getTitle())
                .rating(rating.getRating())
                .feedback(rating.getFeedback())
                .isAnonymous(rating.getIsAnonymous())
                .createdAt(rating.getCreatedAt())
                .citizenId(rating.getIsAnonymous() ? null : rating.getCitizen().getId())
                .citizenName(rating.getIsAnonymous() ? "Anonymous" : rating.getCitizen().getFullName())  // fixed
                .officialId(rating.getOfficial().getId())
                .officialName(rating.getOfficial().getFullName())   // fixed
                .officialRole(rating.getOfficial().getRole().name())
                .build();
    }
}
