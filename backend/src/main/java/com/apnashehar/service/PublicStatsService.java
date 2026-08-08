package com.apnashehar.service;

import com.apnashehar.dto.response.PublicStatsResponse;
import com.apnashehar.entity.Complaint;
import com.apnashehar.enums.ComplaintCategory;
import com.apnashehar.enums.ComplaintStatus;
import com.apnashehar.repository.ComplaintRepository;
import com.apnashehar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PublicStatsService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public PublicStatsResponse getPublicStats() {
        // Total complaints (not deleted)
        Long totalComplaints = complaintRepository.count();

        // Resolved complaints
        Long resolvedComplaints = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);

        // Active users (verified and active)
        Long activeUsers = userRepository.countByIsVerifiedAndIsActive(true, true);

        // Resolution rate
        Double resolutionRate = totalComplaints > 0 
            ? (resolvedComplaints.doubleValue() / totalComplaints.doubleValue()) * 100 
            : 0.0;

        // Average response time for resolved complaints
        String avgResponseTime = calculateAverageResponseTime();

        // Complaints by category
        Map<String, Long> complaintsByCategory = new HashMap<>();
        for (ComplaintCategory category : ComplaintCategory.values()) {
            Long count = complaintRepository.countByCategory(category);
            complaintsByCategory.put(category.name(), count);
        }

        // Complaints by status
        Map<String, Long> complaintsByStatus = new HashMap<>();
        for (ComplaintStatus status : ComplaintStatus.values()) {
            Long count = complaintRepository.countByStatus(status);
            complaintsByStatus.put(status.name(), count);
        }

        return PublicStatsResponse.builder()
                .totalComplaints(totalComplaints)
                .resolvedComplaints(resolvedComplaints)
                .activeUsers(activeUsers)
                .resolutionRate(Math.round(resolutionRate * 10.0) / 10.0) // Round to 1 decimal
                .avgResponseTime(avgResponseTime)
                .complaintsByCategory(complaintsByCategory)
                .complaintsByStatus(complaintsByStatus)
                .build();
    }

    private String calculateAverageResponseTime() {
        List<Complaint> resolvedComplaints = complaintRepository.findByStatus(ComplaintStatus.RESOLVED);
        
        if (resolvedComplaints.isEmpty()) {
            return "N/A";
        }

        long totalHours = 0;
        int count = 0;

        for (Complaint complaint : resolvedComplaints) {
            if (complaint.getCreatedAt() != null && complaint.getUpdatedAt() != null) {
                Duration duration = Duration.between(complaint.getCreatedAt(), complaint.getUpdatedAt());
                totalHours += duration.toHours();
                count++;
            }
        }

        if (count == 0) {
            return "N/A";
        }

        long avgHours = totalHours / count;
        
        if (avgHours < 24) {
            return avgHours + " hrs";
        } else {
            long days = avgHours / 24;
            return days + " days";
        }
    }
}
