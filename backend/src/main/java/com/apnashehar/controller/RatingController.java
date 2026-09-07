package com.apnashehar.controller;

import com.apnashehar.dto.request.RatingRequest;
import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.dto.response.OfficialStatsResponse;
import com.apnashehar.dto.response.PagedResponse;
import com.apnashehar.dto.response.RatingResponse;
import com.apnashehar.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Official Rating and Feedback System
 */
@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@Tag(name = "Rating Management", description = "Official rating and feedback APIs")
public class RatingController {

    private final RatingService ratingService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Submit rating for an official (Citizens only)")
    public ResponseEntity<ApiResponse<RatingResponse>> submitRating(@Valid @RequestBody RatingRequest request) {
        RatingResponse rating = ratingService.submitRating(request);
        return new ResponseEntity<>(
                ApiResponse.success("Rating submitted successfully", rating),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/official/{officialId}")
    @Operation(summary = "Get all ratings for an official")
    public ResponseEntity<ApiResponse<PagedResponse<RatingResponse>>> getOfficialRatings(
            @PathVariable Long officialId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        PagedResponse<RatingResponse> ratings = ratingService.getOfficialRatings(officialId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Official ratings retrieved successfully", ratings));
    }

    @GetMapping("/official/{officialId}/stats")
    @Operation(summary = "Get performance statistics for an official")
    public ResponseEntity<ApiResponse<OfficialStatsResponse>> getOfficialStats(@PathVariable Long officialId) {
        OfficialStatsResponse stats = ratingService.getOfficialStats(officialId);
        return ResponseEntity.ok(ApiResponse.success("Official statistics retrieved successfully", stats));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Get top-rated officials leaderboard (public)")
    public ResponseEntity<ApiResponse<List<OfficialStatsResponse>>> getTopRatedOfficials(
            @RequestParam(defaultValue = "10") int limit) {
        List<OfficialStatsResponse> topOfficials = ratingService.getTopRatedOfficials(limit);
        return ResponseEntity.ok(ApiResponse.success("Top-rated officials retrieved successfully", topOfficials));
    }

    @GetMapping("/can-rate/{complaintId}")
    @Operation(summary = "Check if current user can rate this complaint")
    public ResponseEntity<ApiResponse<Boolean>> canRateComplaint(@PathVariable Long complaintId) {
        boolean canRate = ratingService.canRateComplaint(complaintId);
        return ResponseEntity.ok(ApiResponse.success("Rating eligibility checked", canRate));
    }
}