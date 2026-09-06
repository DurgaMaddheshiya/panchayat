package com.apnashehar.controller;

import com.apnashehar.dto.request.ComplaintRequest;
import com.apnashehar.dto.request.ComplaintStatusUpdateRequest;
import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.dto.response.ComplaintResponse;
import com.apnashehar.enums.ComplaintCategory;
import com.apnashehar.enums.ComplaintStatus;
import com.apnashehar.enums.Priority;
import com.apnashehar.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Complaint Controller - REST APIs for complaint management
 */
@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@Tag(name = "Complaints", description = "Complaint management APIs")
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @Operation(summary = "Create new complaint")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody ComplaintRequest request) {
        ComplaintResponse response = complaintService.createComplaint(request);
        return new ResponseEntity<>(
                ApiResponse.success("Complaint created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get complaint by ID")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(@PathVariable Long id) {
        ComplaintResponse response = complaintService.getComplaintById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all complaints with pagination")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getAllComplaints(Pageable pageable) {
        Page<ComplaintResponse> response = complaintService.getAllComplaints(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/assigned-to-me")
    @PreAuthorize("hasAnyRole('OFFICIAL', 'SOCIAL_WORKER', 'ADMIN')")
    @Operation(summary = "Get complaints assigned to current official")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getAssignedComplaints(Pageable pageable) {
        Page<ComplaintResponse> response = complaintService.getAssignedComplaints(pageable);
        return ResponseEntity.ok(ApiResponse.success("Assigned complaints fetched", response));
    }

    @GetMapping("/my-complaints")
    @Operation(summary = "Get current user's complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getMyComplaints(Pageable pageable) {
        Page<ComplaintResponse> response = complaintService.getUserComplaints(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update complaint")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintRequest request) {
        ComplaintResponse response = complaintService.updateComplaint(id, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete complaint")
    public ResponseEntity<ApiResponse<Void>> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted successfully", null));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('MUKHIYA', 'ADMIN')")
    @Operation(summary = "Assign complaint to user")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
            @PathVariable Long id,
            @RequestParam Long assigneeId) {
        ComplaintResponse response = complaintService.assignComplaint(id, assigneeId);
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SOCIAL_WORKER', 'MUKHIYA', 'ADMIN')")
    @Operation(summary = "Update complaint status")
    public ResponseEntity<ApiResponse<ComplaintResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintStatusUpdateRequest request) {
        ComplaintResponse response = complaintService.updateStatus(
                id, request.getStatus(), request.getOfficialRemarks());
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> searchComplaints(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) ComplaintCategory category,
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String village,
            @RequestParam(required = false) Integer wardNumber,
            Pageable pageable) {
        Page<ComplaintResponse> response = complaintService.searchComplaints(
                title, description, category, status, priority, village, wardNumber, null, null, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending complaints")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getTrendingComplaints(Pageable pageable) {
        Page<ComplaintResponse> response = complaintService.getTrendingComplaints(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/by-status/{status}")
    @Operation(summary = "Get complaints by status")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getComplaintsByStatus(
            @PathVariable ComplaintStatus status,
            Pageable pageable) {
        Page<ComplaintResponse> response = complaintService.getComplaintsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/by-category/{category}")
    @Operation(summary = "Get complaints by category")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getComplaintsByCategory(
            @PathVariable ComplaintCategory category,
            Pageable pageable) {
        Page<ComplaintResponse> response = complaintService.getComplaintsByCategory(category, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get deleted complaints (Admin only)")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> getDeletedComplaints(Pageable pageable) {
        Page<ComplaintResponse> response = complaintService.getDeletedComplaints(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}