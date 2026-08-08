package com.apnashehar.controller;

import com.apnashehar.dto.request.CommentRequest;
import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.dto.response.CommentResponse;
import com.apnashehar.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Comment Controller - REST APIs for comments
 */
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Comment management APIs")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    @Operation(summary = "Add comment to complaint")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @Valid @RequestBody CommentRequest request) {
        CommentResponse response = commentService.addComment(request);
        return new ResponseEntity<>(
                ApiResponse.success("Comment added successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/complaint/{complaintId}")
    @Operation(summary = "Get comments for complaint")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComplaintComments(
            @PathVariable Long complaintId) {
        List<CommentResponse> response = commentService.getComplaintComments(complaintId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update comment")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long id,
            @RequestParam String commentText) {
        CommentResponse response = commentService.updateComment(id, commentText);
        return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete comment")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
    }

    @GetMapping("/complaint/{complaintId}/count")
    @Operation(summary = "Get comment count for complaint")
    public ResponseEntity<ApiResponse<Long>> getCommentCount(@PathVariable Long complaintId) {
        Long count = commentService.getCommentCount(complaintId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}