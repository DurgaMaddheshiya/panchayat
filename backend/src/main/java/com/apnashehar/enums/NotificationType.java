package com.apnashehar.enums;

/**
 * Notification Types
 */
public enum NotificationType {
    COMPLAINT_SUBMITTED("Complaint Submitted"),
    COMPLAINT_ASSIGNED("Complaint Assigned"),
    STATUS_CHANGED("Status Changed"),
    COMPLAINT_RESOLVED("Complaint Resolved"),
    NEW_COMMENT("New Comment"),
    ADMIN_ANNOUNCEMENT("Admin Announcement"),
    UPVOTE_RECEIVED("Upvote Received"),
    SYSTEM_ALERT("System Alert");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}