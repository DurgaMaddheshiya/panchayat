package com.apnashehar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Dashboard Statistics Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private Long totalComplaints;
    private Long pendingComplaints;
    private Long inProgressComplaints;
    private Long resolvedComplaints;
    private Long rejectedComplaints;
    
    private Double resolutionRate;
    private Double avgResolutionDays;
    
    private Map<String, Long> categoryWiseStats;
    private Map<String, Long> priorityWiseStats;
    private Map<String, Long> monthlyStats;
    private Map<String, Long> wardWiseStats;
    
    private Long totalUsers;
    private Long totalVotes;
    private Long totalComments;
}