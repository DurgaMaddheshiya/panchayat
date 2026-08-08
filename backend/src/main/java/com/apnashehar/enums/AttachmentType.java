package com.apnashehar.enums;

/**
 * Attachment Types
 */
public enum AttachmentType {
    IMAGE("Image"),
    VIDEO("Video"),
    DOCUMENT("Document");

    private final String displayName;

    AttachmentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
