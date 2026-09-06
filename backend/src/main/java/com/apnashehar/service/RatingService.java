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
     * Submit rating for an official
     */
    @Transactional
    public RatingResponse submitRating(RatingRequest request) {
        UserPrincipal currentUser = getCurrentUser();
        
        // Validate complaint exists and is resolved
        Complaint complaint = complaintRepository.findById(request.getComplaintId())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", request.getComplaintId()));
        
        // Only complaint owner can rate
        if (!complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only rate officials for your own complaints");
        }
        
        // Complaint must be resolved
        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new BadRequestException("You can only rate officials for resolved complaints");
        }
        
        // Must have an assigned official
        if (complaint.getAssignedTo() == null) {
            throw new BadRequestException("No official assigned to this complaint");
        }
        
        // Check if already rated
        if (ratingRepository.existsByCitizenIdAndComplaintId(currentUser.getId(), request.getComplaintId())) {
            throw new BadRequestException("You have already rated this official for this complaint");
        }
        
        // Create rating
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
     * Get ratings for an official
     */
    public PagedResponse<RatingResponse> getOfficialRatings(Long officialId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OfficialRating> ratingsPage = ratingRepository.findByOfficialIdOrderByCreatedAtDesc(officialId, pageable);
        
        List<RatingResponse> ratings = ratingsPage.getContent().stream()
                .map(this::mapToRatingResponse)
                .toList();
        
        return PagedResponse.<RatingResponse>builder()
                .content(ratings)
                .page(ratingsPage.getNumber())
                .size(ratingsPage.getSize())
                .totalElements(ratingsPage.getTotalElements())
                .totalPages(ratingsPage.getTotalPages())
                .first(ratingsPage.isFirst())
                .last(ratingsPage.isLast())
                .build();
    }

    /**
     * Get official performance statistics
     */
    public OfficialStatsResponse getOfficialStats(Long officialId) {
        // Verify official exists
        User official = userRepository.findById(officialId)
                .orElseThrow(() -> new ResourceNotFoundException("Official", "id", officialId));
        
        // Calculate stats
        Double avgRating = ratingRepository.getAverageRatingByOfficialId(officialId);
        Long totalRatings = ratingRepository.countByOfficialId(officialId);
        
        // Rating distribution
        List<Object[]> distribution = ratingRepository.getRatingDistributionByOfficialId(officialId);
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        for (Object[] row : distribution) {
            ratingDistribution.put((Integer) row[0], ((Number) row[1]).longValue());
        }
        
        // Complaint stats
        Long totalResolved = complaintRepository.countByAssignedToIdAndStatus(officialId, ComplaintStatus.RESOLVED);
        Long pending = complaintRepository.countByAssignedToIdAndStatusIn(officialId, 
                List.of(ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS));
        
        // This month's complaints
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        Long thisMonthComplaints = complaintRepository.countByAssignedToIdAndCreatedAtAfter(officialId, monthStart);
        
        return OfficialStatsResponse.builder()
                .officialId(officialId)
                .officialName(official.getName())
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
     * Get top-rated officials leaderboard
     */
    public List<OfficialStatsResponse> getTopRatedOfficials(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> topOfficials = ratingRepository.getTopRatedOfficials(3L, pageable); // Min 3 ratings
        
        return topOfficials.stream()
                .map(row -> {
                    Long officialId = ((Number) row[0]).longValue();
                    String officialName = (String) row[1];
                    Double avgRating = ((Number) row[2]).doubleValue();
                    Long totalRatings = ((Number) row[3]).longValue();
                    
                    return OfficialStatsResponse.builder()
                            .officialId(officialId)
                            .officialName(officialName)
                            .averageRating(Math.round(avgRating * 100.0) / 100.0)
                            .totalRatings(totalRatings)
                            .build();
                })
                .toList();
    }

    /**
     * Check if citizen can rate this complaint
     */
    public boolean canRateComplaint(Long complaintId) {
        UserPrincipal currentUser = getCurrentUser();
        
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElse(null);
        
        if (complaint == null || 
            !complaint.getCreatedBy().getId().equals(currentUser.getId()) ||
            complaint.getStatus() != ComplaintStatus.RESOLVED ||
            complaint.getAssignedTo() == null) {
            return false;
        }
        
        return !ratingRepository.existsByCitizenIdAndComplaintId(currentUser.getId(), complaintId);
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
                .citizenName(rating.getIsAnonymous() ? "Anonymous" : rating.getCitizen().getName())
                .officialId(rating.getOfficial().getId())
                .officialName(rating.getOfficial().getName())
                .officialRole(rating.getOfficial().getRole().name())
                .build();
    }
}