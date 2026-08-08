package com.apnashehar.controller;

import com.apnashehar.dto.request.LoginRequest;
import com.apnashehar.dto.request.RegisterRequest;
import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.dto.response.AuthResponse;
import com.apnashehar.security.UserPrincipal;
import com.apnashehar.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller - Handles registration and login
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register new CITIZEN account (public)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(
                ApiResponse.success("User registered successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/admin/create-user")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: create OFFICIAL / SOCIAL_WORKER / ADMIN accounts")
    public ResponseEntity<ApiResponse<AuthResponse>> createUserByAdmin(
            @Valid @RequestBody RegisterRequest request,
            @AuthenticationPrincipal UserPrincipal adminUser) {
        AuthResponse response = authService.createUserByAdmin(request, adminUser);
        return new ResponseEntity<>(
                ApiResponse.success("User created successfully by admin", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }
}
