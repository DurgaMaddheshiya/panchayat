package com.apnashehar.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicStatsResponse {
    private Long totalComplaints;
    private Long resolvedComplaints;
    private Long activeUsers;
    private Double resolutionRate;
    private String avgResponseTime;
    private Map<String, Long> complaintsByCategory;
    private Map<String, Long> complaintsByStatus;
}
