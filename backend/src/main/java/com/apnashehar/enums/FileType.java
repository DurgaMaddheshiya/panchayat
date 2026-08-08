package com.apnashehar.enums;

/**
 * File Types for Attachments
 */
public enum FileType {
    IMAGE("Image"),
    VIDEO("Video"),
    DOCUMENT("Document"),
    OTHER("Other");

    private final String displayName;

    FileType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}