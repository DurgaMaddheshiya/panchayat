package com.apnashehar.controller;

import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.dto.response.UserResponse;
import com.apnashehar.enums.UserRole;
import com.apnashehar.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin Controller - All admin-specific APIs under /api/admin/**
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management APIs")
public class AdminController {

    private final UserService userService;

    /**
     * GET /api/admin/users - Get all users paginated
     */
    @GetMapping("/users")
    @Operation(summary = "Get all users (paginated)")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }

    /**
     * GET /api/admin/users/{id} - Get user by ID
     */
    @GetMapping("/users/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * PUT /api/admin/users/{id} - Update user role and status
     */
    @PutMapping("/users/{id}")
    @Operation(summary = "Update user role/status")
    public ResponseEntity<ApiResponse<String>> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updateData) {

        UserRole role = null;
        Boolean isActive = null;

        if (updateData.containsKey("role")) {
            role = UserRole.valueOf(updateData.get("role").toString());
        }
        if (updateData.containsKey("isActive")) {
            isActive = (Boolean) updateData.get("isActive");
        }

        userService.updateUserByAdmin(id, role, isActive);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", "OK"));
    }

    /**
     * DELETE /api/admin/users/{id} - Delete user
     */
    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete user")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", "OK"));
    }

    /**
     * GET /api/admin/users/stats - User statistics
     */
    @GetMapping("/users/stats")
    @Operation(summary = "Get user statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats() {
        Map<String, Object> stats = userService.getUserStatistics();
        return ResponseEntity.ok(ApiResponse.success("User statistics fetched", stats));
    }

    /**
     * GET /api/admin/users/search - Search users
     */
    @GetMapping("/users/search")
    @Operation(summary = "Search users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) UserRole role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> users = userService.searchUsers(name, email, role, null, pageable);
        return ResponseEntity.ok(ApiResponse.success("Search results", users));
    }
}
