package com.apnashehar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO for Official Performance Statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficialStatsResponse {

    private Long officialId;
    private String officialName;
    private String officialRole;
    private Double averageRating;
    private Long totalRatings;
    private Long totalComplaintsResolved;
    
    // Rating distribution (rating -> count)
    private Map<Integer, Long> ratingDistribution;
    
    // Performance metrics
    private Long complaintsThisMonth;
    private Double avgResolutionTimeHours;
    private Long pendingComplaints;
}