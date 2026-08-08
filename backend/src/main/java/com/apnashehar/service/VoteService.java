package com.apnashehar.service;

import com.apnashehar.entity.Complaint;
import com.apnashehar.entity.User;
import com.apnashehar.entity.Vote;
import com.apnashehar.enums.NotificationType;
import com.apnashehar.exception.BadRequestException;
import com.apnashehar.exception.ResourceNotFoundException;
import com.apnashehar.repository.ComplaintRepository;
import com.apnashehar.repository.UserRepository;
import com.apnashehar.repository.VoteRepository;
import com.apnashehar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Vote Service - Business logic for voting system
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VoteService {

    private final VoteRepository voteRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Upvote a complaint
     */
    @Transactional
    public void upvoteComplaint(Long complaintId) {
        UserPrincipal currentUser = getCurrentUser();
        
        Complaint complaint = complaintRepository.findByIdAndIsDeletedFalse(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", complaintId));

        User user = userRepository.findByIdAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Check if already voted
        if (voteRepository.existsByComplaintIdAndUserIdAndIsDeletedFalse(complaintId, currentUser.getId())) {
            throw new BadRequestException("You have already upvoted this complaint");
        }

        // Create vote
        Vote vote = Vote.builder()
                .complaint(complaint)
                .user(user)
                .build();

        voteRepository.save(vote);

        // Update complaint upvote count
        complaint.incrementUpvoteCount();
        complaintRepository.save(complaint);

        // Send notification to complaint creator
        if (!complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    complaint.getCreatedBy().getId(),
                    "Upvote Received",
                    "Your complaint #" + complaint.getComplaintId() + " received an upvote",
                    NotificationType.UPVOTE_RECEIVED,
                    complaintId
            );
        }

        log.info("User {} upvoted complaint {}", currentUser.getId(), complaintId);
    }

    /**
     * Remove upvote from complaint
     */
    @Transactional
    public void removeUpvote(Long complaintId) {
        UserPrincipal currentUser = getCurrentUser();

        Vote vote = voteRepository.findByComplaintIdAndUserIdAndIsDeletedFalse(complaintId, currentUser.getId())
                .orElseThrow(() -> new BadRequestException("You have not upvoted this complaint"));

        Complaint complaint = vote.getComplaint();

        // Soft delete vote
        vote.setIsDeleted(true);
        voteRepository.save(vote);

        // Update complaint upvote count
        complaint.decrementUpvoteCount();
        complaintRepository.save(complaint);

        log.info("User {} removed upvote from complaint {}", currentUser.getId(), complaintId);
    }

    /**
     * Check if user has upvoted complaint
     */
    @Transactional(readOnly = true)
    public Boolean hasUserUpvoted(Long complaintId) {
        UserPrincipal currentUser = getCurrentUser();
        return voteRepository.existsByComplaintIdAndUserIdAndIsDeletedFalse(complaintId, currentUser.getId());
    }

    /**
     * Get vote count for complaint
     */
    @Transactional(readOnly = true)
    public Long getVoteCount(Long complaintId) {
        return voteRepository.countByComplaintId(complaintId);
    }

    private UserPrincipal getCurrentUser() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}