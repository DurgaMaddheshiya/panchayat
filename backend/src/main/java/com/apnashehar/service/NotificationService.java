package com.apnashehar.service;

import com.apnashehar.dto.response.NotificationResponse;
import com.apnashehar.entity.Notification;
import com.apnashehar.entity.User;
import com.apnashehar.enums.NotificationType;
import com.apnashehar.exception.ResourceNotFoundException;
import com.apnashehar.mapper.NotificationMapper;
import com.apnashehar.repository.NotificationRepository;
import com.apnashehar.repository.UserRepository;
import com.apnashehar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Notification Service - Business logic for notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    /**
     * Create notification for user
     */
    @Transactional
    public NotificationResponse createNotification(Long userId, String title, String message, 
                                                   NotificationType type, Long referenceId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .user(user)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Notification created for user: {}, type: {}", userId, type);

        return notificationMapper.toResponse(notification);
    }

    /**
     * Get user notifications
     */
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getUserNotifications(Pageable pageable) {
        UserPrincipal currentUser = getCurrentUser();
        return notificationRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(
                currentUser.getId(), pageable)
                .map(notificationMapper::toResponse);
    }

    /**
     * Get unread notifications count
     */
    @Transactional(readOnly = true)
    public Long getUnreadCount() {
        UserPrincipal currentUser = getCurrentUser();
        return notificationRepository.countUnreadNotificationsByUserId(currentUser.getId());
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        UserPrincipal currentUser = getCurrentUser();
        notificationRepository.markAsReadByIdAndUserId(notificationId, currentUser.getId());
        log.info("Notification {} marked as read by user: {}", notificationId, currentUser.getId());
    }

    /**
     * Mark all notifications as read
     */
    @Transactional
    public void markAllAsRead() {
        UserPrincipal currentUser = getCurrentUser();
        notificationRepository.markAllAsReadByUserId(currentUser.getId());
        log.info("All notifications marked as read for user: {}", currentUser.getId());
    }

    /**
     * Delete notification
     */
    @Transactional
    public void deleteNotification(Long notificationId) {
        UserPrincipal currentUser = getCurrentUser();
        Notification notification = notificationRepository.findByIdAndIsDeletedFalse(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Notification", "id", notificationId);
        }

        notification.setIsDeleted(true);
        notificationRepository.save(notification);
        log.info("Notification {} deleted by user: {}", notificationId, currentUser.getId());
    }

    /**
     * Send notification to multiple users
     */
    @Transactional
    public void sendBulkNotification(List<Long> userIds, String title, String message, NotificationType type) {
        for (Long userId : userIds) {
            try {
                createNotification(userId, title, message, type, null);
            } catch (Exception e) {
                log.error("Failed to send notification to user: {}", userId, e);
            }
        }
        log.info("Bulk notification sent to {} users", userIds.size());
    }

    private UserPrincipal getCurrentUser() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}