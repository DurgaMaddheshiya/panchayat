package com.apnashehar.controller;

import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.dto.response.DashboardStatsResponse;
import com.apnashehar.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Dashboard Controller - REST APIs for dashboard statistics
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard statistics APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('OFFICIAL', 'ADMIN')")
    @Operation(summary = "Get comprehensive dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse response = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getAdminDashboardStats() {
        DashboardStatsResponse response = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/citizen/{userId}")
    @Operation(summary = "Get citizen dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCitizenDashboardStats(
            @PathVariable Long userId) {
        Map<String, Object> response = dashboardService.getCitizenDashboardStats(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/social-worker/{userId}")
    @PreAuthorize("hasAnyRole('SOCIAL_WORKER', 'OFFICIAL', 'ADMIN')")
    @Operation(summary = "Get social worker dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSocialWorkerDashboardStats(
            @PathVariable Long userId) {
        Map<String, Object> response = dashboardService.getSocialWorkerDashboardStats(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}