package com.apnashehar.service;

import com.apnashehar.dto.request.CommentRequest;
import com.apnashehar.dto.response.CommentResponse;
import com.apnashehar.entity.Comment;
import com.apnashehar.entity.Complaint;
import com.apnashehar.entity.User;
import com.apnashehar.enums.NotificationType;
import com.apnashehar.exception.BadRequestException;
import com.apnashehar.exception.ResourceNotFoundException;
import com.apnashehar.mapper.CommentMapper;
import com.apnashehar.repository.CommentRepository;
import com.apnashehar.repository.ComplaintRepository;
import com.apnashehar.repository.UserRepository;
import com.apnashehar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Comment Service - Business logic for comments
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;
    private final NotificationService notificationService;

    /**
     * Add comment to complaint
     */
    @Transactional
    public CommentResponse addComment(CommentRequest request) {
        UserPrincipal currentUser = getCurrentUser();

        Complaint complaint = complaintRepository.findByIdAndIsDeletedFalse(request.getComplaintId())
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", request.getComplaintId()));

        User user = userRepository.findByIdAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        Comment comment = Comment.builder()
                .commentText(request.getCommentText())
                .complaint(complaint)
                .user(user)
                .isOfficial(request.getIsOfficial() != null && request.getIsOfficial())
                .build();

        // Handle reply to another comment
        if (request.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findByIdAndIsDeletedFalse(request.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", request.getParentCommentId()));
            comment.setParentComment(parentComment);
        }

        comment = commentRepository.save(comment);

        // Send notification to complaint creator
        if (!complaint.getCreatedBy().getId().equals(currentUser.getId())) {
            notificationService.createNotification(
                    complaint.getCreatedBy().getId(),
                    "New Comment",
                    "Someone commented on your complaint #" + complaint.getComplaintId(),
                    NotificationType.NEW_COMMENT,
                    complaint.getId()
            );
        }

        log.info("Comment added to complaint {} by user {}", request.getComplaintId(), currentUser.getId());

        return commentMapper.toResponse(comment);
    }

    /**
     * Get comments for complaint
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getComplaintComments(Long complaintId) {
        List<Comment> topLevelComments = commentRepository
                .findByComplaintIdAndParentCommentIsNullAndIsDeletedFalseOrderByCreatedAtAsc(complaintId);

        return topLevelComments.stream()
                .map(this::buildCommentResponseWithReplies)
                .collect(Collectors.toList());
    }

    /**
     * Update comment
     */
    @Transactional
    public CommentResponse updateComment(Long commentId, String newText) {
        UserPrincipal currentUser = getCurrentUser();

        Comment comment = commentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only update your own comments");
        }

        comment.setCommentText(newText);
        comment = commentRepository.save(comment);

        log.info("Comment {} updated by user {}", commentId, currentUser.getId());

        return commentMapper.toResponse(comment);
    }

    /**
     * Delete comment
     */
    @Transactional
    public void deleteComment(Long commentId) {
        UserPrincipal currentUser = getCurrentUser();

        Comment comment = commentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own comments");
        }

        comment.setIsDeleted(true);
        commentRepository.save(comment);

        log.info("Comment {} deleted by user {}", commentId, currentUser.getId());
    }

    /**
     * Get comment count for complaint
     */
    @Transactional(readOnly = true)
    public Long getCommentCount(Long complaintId) {
        return commentRepository.countByComplaintId(complaintId);
    }

    /**
     * Build comment response with nested replies
     */
    private CommentResponse buildCommentResponseWithReplies(Comment comment) {
        CommentResponse response = commentMapper.toResponse(comment);

        List<Comment> replies = commentRepository.findByParentCommentIdAndIsDeletedFalseOrderByCreatedAtAsc(comment.getId());
        List<CommentResponse> replyResponses = replies.stream()
                .map(this::buildCommentResponseWithReplies)
                .collect(Collectors.toList());

        response.setReplies(replyResponses);
        return response;
    }

    private UserPrincipal getCurrentUser() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}