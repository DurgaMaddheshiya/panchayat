package com.apnashehar.service;

import com.apnashehar.dto.request.LoginRequest;
import com.apnashehar.dto.request.RegisterRequest;
import com.apnashehar.dto.response.AuthResponse;
import com.apnashehar.entity.User;
import com.apnashehar.enums.UserRole;
import com.apnashehar.exception.BadRequestException;
import com.apnashehar.repository.UserRepository;
import com.apnashehar.security.JwtTokenProvider;
import com.apnashehar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Authentication Service - Handles user registration and login
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EmailVerificationService emailVerificationService;
    private final EmailService emailService;

    /**
     * Register new user with email verification.
     * PUBLIC registration only allows CITIZEN role.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // --- Role restriction ---
        UserRole requestedRole = request.getRole() != null ? request.getRole() : UserRole.CITIZEN;
        if (requestedRole != UserRole.CITIZEN) {
            throw new BadRequestException(
                "Self-registration is only allowed for CITIZEN role. " +
                "Contact an admin to create OFFICIAL / SOCIAL_WORKER / ADMIN accounts."
            );
        }

        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        // Validate mobile uniqueness
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new BadRequestException("Mobile number is already registered");
        }

        // Verify OTP - check both unused and recently used (within 10 min)
        if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            throw new BadRequestException("Email verification OTP is required");
        }

        boolean otpValid = emailVerificationService.verifyOtpForRegistration(
                request.getEmail(), request.getOtp()
        );
        if (!otpValid) {
            throw new BadRequestException("Invalid or expired OTP. Please request a new one.");
        }

        // Create new citizen user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CITIZEN)
                .village(request.getVillage())
                .wardNumber(request.getWardNumber())
                .address(request.getAddress())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .isVerified(true) // Email is now verified
                .isActive(true)
                .verificationToken(UUID.randomUUID().toString())
                .build();

        user = userRepository.save(user);
        log.info("New CITIZEN registered with verified email: {}", user.getEmail());

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .build();
    }

    /**
     * Admin-only: create OFFICIAL / SOCIAL_WORKER / ADMIN accounts.
     */
    @Transactional
    public AuthResponse createUserByAdmin(RegisterRequest request, UserPrincipal adminUser) {
        if (adminUser.getRole() != UserRole.ADMIN) {
            throw new com.apnashehar.exception.UnauthorizedException("Only admins can create privileged accounts");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new BadRequestException("Mobile number is already registered");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.CITIZEN;

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .village(request.getVillage())
                .wardNumber(request.getWardNumber())
                .address(request.getAddress())
                .district(request.getDistrict())
                .state(request.getState())
                .pincode(request.getPincode())
                .isVerified(true)
                .isActive(true)
                .verificationToken(UUID.randomUUID().toString())
                .build();

        user = userRepository.save(user);
        log.info("Admin {} created user: {} with role: {}", adminUser.getEmail(), user.getEmail(), role);

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    /**
     * Login user
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmailOrMobile(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        log.info("User logged in: {}", userPrincipal.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .fullName(userPrincipal.getFullName())
                .role(userPrincipal.getRole())
                .build();
    }

    /**
     * Forgot Password - Send OTP to registered email
     */
    @Transactional
    public void forgotPassword(String email) {
        // Check if user exists - don't reveal if email exists or not (security)
        boolean userExists = userRepository.existsByEmail(email.toLowerCase());
        if (!userExists) {
            // Still return success to prevent email enumeration attack
            log.info("Forgot password requested for non-existent email: {}", email);
            return;
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElse(null);

        if (user == null || !user.getIsActive()) {
            log.info("Forgot password requested for inactive/deleted user: {}", email);
            return;
        }

        // Send OTP via email verification service
        emailVerificationService.sendVerificationOtp(email, user.getFullName());
        log.info("Password reset OTP sent to: {}", email);
    }

    /**
     * Reset Password - Verify OTP and set new password
     */
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        // Verify OTP
        boolean otpValid = emailVerificationService.verifyOtpForRegistration(email, otp);
        if (!otpValid) {
            throw new BadRequestException("Invalid or expired OTP. Please request a new one.");
        }

        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new BadRequestException("User not found with this email"));

        if (!user.getIsActive()) {
            throw new BadRequestException("Your account is inactive. Contact admin.");
        }

        // Set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset successfully for: {}", email);
    }

    /**
     * Refresh access token
     */
    public AuthResponse refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities()
        );

        String newAccessToken = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
