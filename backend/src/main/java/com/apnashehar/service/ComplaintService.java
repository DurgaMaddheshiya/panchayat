package com.apnashehar.service;

import com.apnashehar.dto.request.ComplaintRequest;
import com.apnashehar.dto.response.ComplaintResponse;
import com.apnashehar.dto.response.UserResponse;
import com.apnashehar.entity.Complaint;
import com.apnashehar.entity.User;
import com.apnashehar.enums.ComplaintStatus;
import com.apnashehar.enums.NotificationType;
import com.apnashehar.enums.UserRole;
import com.apnashehar.exception.BadRequestException;
import com.apnashehar.exception.ResourceNotFoundException;
import com.apnashehar.exception.UnauthorizedException;
import com.apnashehar.repository.ComplaintRepository;
import com.apnashehar.repository.UserRepository;
import com.apnashehar.repository.VoteRepository;
import com.apnashehar.security.UserPrincipal;
import com.apnashehar.util.ComplaintIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Complaint Service - Business logic for complaints
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final ComplaintIdGenerator complaintIdGenerator;
    private final NotificationService notificationService;

    /**
     * Create new complaint
     */
    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request) {
        UserPrincipal currentUser = getCurrentUser();
        
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Complaint complaint = Complaint.builder()
                .complaintId(complaintIdGenerator.generateComplaintId())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(ComplaintStatus.SUBMITTED)
                .address(request.getAddress())
                .village(request.getVillage())
                .wardNumber(request.getWardNumber())
                .district(request.getDistrict())
                .state(request.getState())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .upvoteCount(0)
                .createdBy(user)
                .build();

        complaint = complaintRepository.save(complaint);
        log.info("New complaint created: {} by user: {}", complaint.getComplaintId(), user.getEmail());

        // Send notification
        notificationService.createNotification(
                user.getId(),
                "Complaint Submitted",
                "Your complaint " + complaint.getComplaintId() + " has been submitted successfully",
                NotificationType.COMPLAINT_SUBMITTED,
                complaint.getId()
        );

        return mapToComplaintResponse(complaint, currentUser.getId());
    }

    /**
     * Get complaint by ID
     */
    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long id) {
        UserPrincipal currentUser = getCurrentUser();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        return mapToComplaintResponse(complaint, currentUser.getId());
    }

    /**
     * Get all complaints with pagination
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getAllComplaints(Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return complaintRepository.findAll(pageable)
                .map(complaint -> mapToComplaintResponse(complaint, currentUser.getId()));
    }

    /**
     * Get user's complaints
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getUserComplaints(Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return complaintRepository.findByCreatedById(currentUser.getId(), pageable)
                .map(complaint -> mapToComplaintResponse(complaint, currentUser.getId()));
    }

    /**
     * Update complaint
     */
    @Transactional
    public ComplaintResponse updateComplaint(Long id, ComplaintRequest request) {
        UserPrincipal currentUser = getCurrentUser();
        
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        // Only complaint creator can update before assignment
        if (!complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You don't have permission to update this complaint");
        }

        if (complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new BadRequestException("Complaint cannot be updated after it's assigned");
        }

        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setPriority(request.getPriority());
        complaint.setAddress(request.getAddress());
        complaint.setVillage(request.getVillage());
        complaint.setWardNumber(request.getWardNumber());
        complaint.setDistrict(request.getDistrict());
        complaint.setState(request.getState());
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());

        complaint = complaintRepository.save(complaint);
        log.info("Complaint updated: {}", complaint.getComplaintId());

        return mapToComplaintResponse(complaint, currentUser.getId());
    }

    /**
     * Delete complaint
     */
    @Transactional
    public void deleteComplaint(Long id) {
        UserPrincipal currentUser = getCurrentUser();
        
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        boolean isOwner = complaint.getCreatedBy().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You don't have permission to delete this complaint");
        }

        // Owners can only delete SUBMITTED complaints; admins can delete anytime
        if (!isAdmin && complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new BadRequestException("Complaint cannot be deleted after it has been reviewed");
        }

        complaint.setIsDeleted(true);
        complaintRepository.save(complaint);
        log.info("Complaint deleted: {} by user: {}", complaint.getComplaintId(), currentUser.getEmail());
    }

    /**
     * Get complaints assigned to current logged-in official
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getAssignedComplaints(Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return complaintRepository
                .findByAssignedToIdAndIsDeletedFalseOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(c -> mapToComplaintResponse(c, currentUser.getId()));
    }

    /**
     * Assign complaint to user
     */
    @Transactional
    public ComplaintResponse assignComplaint(Long id, Long assigneeId) {
        UserPrincipal currentUser = getCurrentUser();
        
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        User assignee = userRepository.findById(assigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", assigneeId));

        complaint.setAssignedTo(assignee);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint = complaintRepository.save(complaint);

        // Send notification to assignee
        notificationService.createNotification(
                assigneeId,
                "Complaint Assigned",
                "Complaint " + complaint.getComplaintId() + " has been assigned to you",
                NotificationType.COMPLAINT_ASSIGNED,
                complaint.getId()
        );

        // Send notification to complaint creator
        notificationService.createNotification(
                complaint.getCreatedBy().getId(),
                "Complaint Assigned",
                "Your complaint " + complaint.getComplaintId() + " has been assigned",
                NotificationType.COMPLAINT_ASSIGNED,
                complaint.getId()
        );

        log.info("Complaint {} assigned to user: {}", complaint.getComplaintId(), assignee.getEmail());

        return mapToComplaintResponse(complaint, currentUser.getId());
    }

    /**
     * Update complaint status
     */
    @Transactional
    public ComplaintResponse updateStatus(Long id, ComplaintStatus status, String remarks) {
        UserPrincipal currentUser = getCurrentUser();
        
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));

        complaint.setStatus(status);
        if (remarks != null && !remarks.isEmpty()) {
            complaint.setAdminRemarks(remarks);
        }

        if (status == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(java.time.LocalDateTime.now());
            User resolver = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));
            complaint.setResolvedBy(resolver);
        }

        complaint = complaintRepository.save(complaint);

        // Send notification
        notificationService.createNotification(
                complaint.getCreatedBy().getId(),
                "Status Updated",
                "Your complaint " + complaint.getComplaintId() + " status is now " + status.getDisplayName(),
                NotificationType.STATUS_CHANGED,
                complaint.getId()
        );

        log.info("Complaint {} status updated to: {}", complaint.getComplaintId(), status);

        return mapToComplaintResponse(complaint, currentUser.getId());
    }

    /**
     * Search complaints
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> searchComplaints(String search, Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return complaintRepository.searchComplaints(search, search, null, null,
                null, null, null, null, null, pageable)
                .map(complaint -> mapToComplaintResponse(complaint, currentUser.getId()));
    }

    /**
     * Search complaints with all filters
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> searchComplaints(String title, String description,
                                                    com.apnashehar.enums.ComplaintCategory category,
                                                    com.apnashehar.enums.ComplaintStatus status,
                                                    com.apnashehar.enums.Priority priority,
                                                    String village, Integer wardNumber,
                                                    Long createdById, Long assignedToId,
                                                    Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return complaintRepository.searchComplaints(title, description, category, status, 
                priority, village, wardNumber, createdById, assignedToId, pageable)
                .map(complaint -> mapToComplaintResponse(complaint, currentUser.getId()));
    }

    /**
     * Get trending complaints
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getTrendingComplaints(Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return complaintRepository.findTrendingComplaints(5, pageable)
                .map(complaint -> mapToComplaintResponse(complaint, currentUser.getId()));
    }

    /**
     * Get complaints by status
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getComplaintsByStatus(ComplaintStatus status, Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return complaintRepository.findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(status, pageable)
                .map(complaint -> mapToComplaintResponse(complaint, currentUser.getId()));
    }

    /**
     * Get complaints by category
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getComplaintsByCategory(com.apnashehar.enums.ComplaintCategory category, 
                                                           Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return complaintRepository.findByCategoryAndIsDeletedFalseOrderByCreatedAtDesc(category, pageable)
                .map(complaint -> mapToComplaintResponse(complaint, currentUser.getId()));
    }

    /**
     * Get deleted complaints (Admin only)
     */
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getDeletedComplaints(Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        
        // Only admin can view deleted complaints
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new UnauthorizedException("Only admins can view deleted complaints");
        }
        
        return complaintRepository.findByIsDeletedTrueOrderByUpdatedAtDesc(pageable)
                .map(complaint -> mapToComplaintResponse(complaint, currentUser.getId()));
    }

    /**
     * Get current authenticated user
     */
    private UserPrincipal getCurrentUser() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    /**
     * Map Complaint entity to ComplaintResponse DTO
     */
    private ComplaintResponse mapToComplaintResponse(Complaint complaint, Long currentUserId) {
        boolean hasUserUpvoted = voteRepository.existsByComplaintIdAndUserId(complaint.getId(), currentUserId);
        
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .priority(complaint.getPriority())
                .status(complaint.getStatus())
                .address(complaint.getAddress())
                .village(complaint.getVillage())
                .wardNumber(complaint.getWardNumber())
                .district(complaint.getDistrict())
                .state(complaint.getState())
                .latitude(complaint.getLatitude())
                .longitude(complaint.getLongitude())
                .upvoteCount(complaint.getUpvoteCount())
                .hasUserUpvoted(hasUserUpvoted)
                .adminRemarks(complaint.getAdminRemarks())
                .resolvedAt(complaint.getResolvedAt())
                .createdBy(mapToUserResponse(complaint.getCreatedBy()))
                .assignedTo(complaint.getAssignedTo() != null ? mapToUserResponse(complaint.getAssignedTo()) : null)
                .resolvedBy(complaint.getResolvedBy() != null ? mapToUserResponse(complaint.getResolvedBy()) : null)
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    /**
     * Map User entity to UserResponse DTO
     */
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .build();
    }
}
