package com.apnashehar.service;

import com.apnashehar.dto.response.DashboardStatsResponse;
import com.apnashehar.enums.ComplaintStatus;
import com.apnashehar.enums.UserRole;
import com.apnashehar.repository.ComplaintRepository;
import com.apnashehar.repository.UserRepository;
import com.apnashehar.repository.VoteRepository;
import com.apnashehar.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard Service - Business logic for dashboard statistics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final VoteRepository voteRepository;
    private final CommentRepository commentRepository;

    /**
     * Get comprehensive dashboard statistics
     */
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        // Complaint statistics
        Long totalComplaints = complaintRepository.countTotalComplaints();
        Long pendingComplaints = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        Long inProgressComplaints = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        Long resolvedComplaints = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        Long rejectedComplaints = complaintRepository.countByStatus(ComplaintStatus.REJECTED);

        // Calculate resolution rate
        Double resolutionRate = totalComplaints > 0 
                ? (resolvedComplaints.doubleValue() / totalComplaints.doubleValue()) * 100 
                : 0.0;

        // Average resolution time
        Double avgResolutionDays = complaintRepository.getAverageResolutionTimeInDays();

        // Category-wise stats
        Map<String, Long> categoryWiseStats = new HashMap<>();
        List<Object[]> categoryStats = complaintRepository.getComplaintCountByCategory();
        for (Object[] stat : categoryStats) {
            categoryWiseStats.put(stat[0].toString(), (Long) stat[1]);
        }

        // Priority-wise stats
        Map<String, Long> priorityWiseStats = new HashMap<>();
        List<Object[]> priorityStats = complaintRepository.getComplaintCountByPriority();
        for (Object[] stat : priorityStats) {
            priorityWiseStats.put(stat[0].toString(), (Long) stat[1]);
        }

        // Monthly stats
        Map<String, Long> monthlyStats = new HashMap<>();
        List<Object[]> monthlyData = complaintRepository.getMonthlyComplaintStats();
        for (Object[] data : monthlyData) {
            monthlyStats.put(data[0].toString(), (Long) data[1]);
        }

        // Ward-wise stats
        Map<String, Long> wardWiseStats = new HashMap<>();
        List<Object[]> wardData = complaintRepository.getComplaintCountByVillage();
        for (Object[] data : wardData) {
            wardWiseStats.put(data[0].toString(), (Long) data[1]);
        }

        // User statistics
        Long totalUsers = userRepository.countActiveUsers();
        Long totalVotes = voteRepository.countTotalVotes();
        Long totalComments = commentRepository.count();

        return DashboardStatsResponse.builder()
                .totalComplaints(totalComplaints)
                .pendingComplaints(pendingComplaints)
                .inProgressComplaints(inProgressComplaints)
                .resolvedComplaints(resolvedComplaints)
                .rejectedComplaints(rejectedComplaints)
                .resolutionRate(resolutionRate)
                .avgResolutionDays(avgResolutionDays != null ? avgResolutionDays : 0.0)
                .categoryWiseStats(categoryWiseStats)
                .priorityWiseStats(priorityWiseStats)
                .monthlyStats(monthlyStats)
                .wardWiseStats(wardWiseStats)
                .totalUsers(totalUsers)
                .totalVotes(totalVotes)
                .totalComments(totalComments)
                .build();
    }

    /**
     * Get citizen-specific dashboard stats
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCitizenDashboardStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        Long myComplaints = complaintRepository.countComplaintsByUser(userId);
        Long myPendingComplaints = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        Long myResolvedComplaints = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        Long myVotes = voteRepository.countByUserId(userId);
        Long myComments = commentRepository.countByUserId(userId);

        stats.put("myComplaints", myComplaints);
        stats.put("myPendingComplaints", myPendingComplaints);
        stats.put("myResolvedComplaints", myResolvedComplaints);
        stats.put("myVotes", myVotes);
        stats.put("myComments", myComments);

        return stats;
    }

    /**
     * Get social worker dashboard stats
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getSocialWorkerDashboardStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        
        Long assignedComplaints = complaintRepository.countAssignedComplaintsByUser(userId);
        Long inProgressComplaints = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        Long resolvedByMe = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);

        stats.put("assignedComplaints", assignedComplaints);
        stats.put("inProgressComplaints", inProgressComplaints);
        stats.put("resolvedByMe", resolvedByMe);

        return stats;
    }
}