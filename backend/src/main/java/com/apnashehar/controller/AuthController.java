package com.apnashehar.controller;

import com.apnashehar.dto.request.ForgotPasswordRequest;
import com.apnashehar.dto.request.LoginRequest;
import com.apnashehar.dto.request.RegisterRequest;
import com.apnashehar.dto.request.ResetPasswordRequest;
import com.apnashehar.dto.request.SendOtpRequest;
import com.apnashehar.dto.request.VerifyOtpRequest;
import com.apnashehar.dto.response.ApiResponse;
import com.apnashehar.dto.response.AuthResponse;
import com.apnashehar.security.UserPrincipal;
import com.apnashehar.service.AuthService;
import com.apnashehar.service.EmailVerificationService;
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
 * Authentication Controller - Handles registration, login, and email verification
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/send-otp")
    @Operation(summary = "Send OTP to email for verification")
    public ResponseEntity<ApiResponse<String>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        emailVerificationService.sendVerificationOtp(request.getEmail(), request.getFullName());
        return ResponseEntity.ok(
            ApiResponse.success("OTP sent successfully to your email", "OTP_SENT")
        );
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP for email")
    public ResponseEntity<ApiResponse<String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        boolean isValid = emailVerificationService.verifyOtp(request.getEmail(), request.getOtp());
        if (isValid) {
            return ResponseEntity.ok(
                ApiResponse.success("Email verified successfully", "EMAIL_VERIFIED")
            );
        } else {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Invalid or expired OTP")
            );
        }
    }

    @PostMapping("/register")
    @Operation(summary = "Register new CITIZEN account (requires verified email)")
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

    @PostMapping("/forgot-password")
    @Operation(summary = "Send OTP to email for password reset")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        // Always return success to prevent email enumeration
        return ResponseEntity.ok(
            ApiResponse.success("If this email is registered, you will receive an OTP shortly.", "OTP_SENT")
        );
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using OTP")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(
            ApiResponse.success("Password reset successfully! Please login with your new password.", "PASSWORD_RESET")
        );
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }
}
