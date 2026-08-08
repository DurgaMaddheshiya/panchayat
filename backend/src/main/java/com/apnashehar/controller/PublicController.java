package com.apnashehar.controller;

import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.dto.response.PublicStatsResponse;
import com.apnashehar.service.PublicStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
@Tag(name = "Public", description = "Public endpoints - no authentication required")
public class PublicController {

    private final PublicStatsService publicStatsService;

    @GetMapping("/stats")
    @Operation(summary = "Get public statistics", description = "Get overall platform statistics for landing page")
    public ResponseEntity<ApiResponse<PublicStatsResponse>> getPublicStats() {
        PublicStatsResponse stats = publicStatsService.getPublicStats();
        return ResponseEntity.ok(ApiResponse.success("Public statistics retrieved successfully", stats));
    }
}
