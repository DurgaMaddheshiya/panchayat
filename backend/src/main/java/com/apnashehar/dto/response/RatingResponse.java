package com.apnashehar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for Official Rating
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingResponse {

    private Long id;
    private Long complaintId;
    private String complaintTitle;
    private Integer rating;
    private String feedback;
    private Boolean isAnonymous;
    private LocalDateTime createdAt;

    // Citizen details (null if anonymous)
    private Long citizenId;
    private String citizenName;

    // Official details
    private Long officialId;
    private String officialName;
    private String officialRole;
}