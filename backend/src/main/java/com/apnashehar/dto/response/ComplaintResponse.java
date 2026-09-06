package com.apnashehar.dto.response;

import com.apnashehar.enums.ComplaintCategory;
import com.apnashehar.enums.ComplaintStatus;
import com.apnashehar.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Complaint Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private Long id;
    private String complaintId;  // Added complaint ID field
    private String title;
    private String description;
    private ComplaintCategory category;
    private Priority priority;
    private ComplaintStatus status;
    private String address;
    private String village;
    private Integer wardNumber;
    private String district;
    private String state;
    private Double latitude;
    private Double longitude;
    private String googleMapsUrl;
    private LocalDateTime resolvedAt;
    private String adminRemarks;
    private Integer upvoteCount;
    private Boolean isAnonymous;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User details
    private UserResponse createdBy;
    private UserResponse assignedTo;
    private UserResponse resolvedBy;

    // Related data
    private List<AttachmentResponse> attachments;
    private Integer commentCount;
    private Boolean hasUserVoted;
    private Boolean hasUserUpvoted;
}
