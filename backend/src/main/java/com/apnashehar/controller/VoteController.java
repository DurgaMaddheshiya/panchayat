package com.apnashehar.controller;

import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.service.VoteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Vote Controller - REST APIs for voting system
 */
@RestController
@RequestMapping("/api/votes")
@RequiredArgsConstructor
@Tag(name = "Votes", description = "Voting system APIs")
public class VoteController {

    private final VoteService voteService;

    @PostMapping("/complaint/{complaintId}/upvote")
    @Operation(summary = "Upvote a complaint")
    public ResponseEntity<ApiResponse<Void>> upvoteComplaint(@PathVariable Long complaintId) {
        voteService.upvoteComplaint(complaintId);
        return ResponseEntity.ok(ApiResponse.success("Complaint upvoted successfully", null));
    }

    @DeleteMapping("/complaint/{complaintId}/upvote")
    @Operation(summary = "Remove upvote from complaint")
    public ResponseEntity<ApiResponse<Void>> removeUpvote(@PathVariable Long complaintId) {
        voteService.removeUpvote(complaintId);
        return ResponseEntity.ok(ApiResponse.success("Upvote removed successfully", null));
    }

    @GetMapping("/complaint/{complaintId}/has-upvoted")
    @Operation(summary = "Check if user has upvoted complaint")
    public ResponseEntity<ApiResponse<Boolean>> hasUserUpvoted(@PathVariable Long complaintId) {
        Boolean hasUpvoted = voteService.hasUserUpvoted(complaintId);
        return ResponseEntity.ok(ApiResponse.success(hasUpvoted));
    }

    @GetMapping("/complaint/{complaintId}/count")
    @Operation(summary = "Get vote count for complaint")
    public ResponseEntity<ApiResponse<Long>> getVoteCount(@PathVariable Long complaintId) {
        Long count = voteService.getVoteCount(complaintId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}