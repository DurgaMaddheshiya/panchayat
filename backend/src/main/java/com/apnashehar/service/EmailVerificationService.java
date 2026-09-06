package com.apnashehar.service;

import com.apnashehar.entity.EmailVerification;
import com.apnashehar.exception.BadRequestException;
import com.apnashehar.repository.EmailVerificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
public class EmailVerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public EmailVerificationService(EmailVerificationRepository emailVerificationRepository,
                                    EmailService emailService) {
        this.emailVerificationRepository = emailVerificationRepository;
        this.emailService = emailService;
    }

    @Transactional
    public void sendVerificationOtp(String email, String fullName) {
        // Check if there's a recent OTP (within 2 minutes)
        Optional<EmailVerification> recentOtp = emailVerificationRepository
                .findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(email);
        
        if (recentOtp.isPresent() && 
            recentOtp.get().getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(2))) {
            throw new BadRequestException("Please wait 2 minutes before requesting a new OTP");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", secureRandom.nextInt(1000000));

        // Save OTP to database
        EmailVerification verification = EmailVerification.builder()
                .email(email.toLowerCase())
                .otp(otp)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .isUsed(false)
                .build();

        emailVerificationRepository.save(verification);

        // Send email
        emailService.sendOtpEmail(email, otp, fullName);

        log.info("OTP sent to email: {}", email);
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        // Check unused OTP first (normal flow - first verification)
        Optional<EmailVerification> verificationOpt = emailVerificationRepository
                .findByEmailAndOtpAndIsUsedFalse(email.toLowerCase(), otp);

        if (verificationOpt.isEmpty()) {
            // Also check if it was recently used (within 5 minutes) - handles double-call from frontend
            Optional<EmailVerification> recentlyUsed = emailVerificationRepository
                    .findByEmailAndOtpAndRecentlyUsed(email.toLowerCase(), otp, LocalDateTime.now().minusMinutes(5));
            if (recentlyUsed.isPresent()) {
                log.info("OTP already verified (recently used) for email: {}", email);
                return true;
            }
            log.warn("Invalid OTP attempt for email: {}", email);
            return false;
        }

        EmailVerification verification = verificationOpt.get();

        // Check if expired
        if (verification.getExpiryTime().isBefore(LocalDateTime.now())) {
            log.warn("Expired OTP attempt for email: {}", email);
            return false;
        }

        // Mark as used
        verification.setIsUsed(true);
        emailVerificationRepository.save(verification);

        log.info("Email verified successfully: {}", email);
        return true;
    }

    // Clean up expired OTPs every hour
    @Scheduled(fixedRate = 3600000) // 1 hour
    @Transactional
    public void cleanupExpiredOtps() {
        emailVerificationRepository.deleteExpiredVerifications(LocalDateTime.now());
        log.debug("Cleaned up expired email verifications");
    }

    /**
     * Used during registration - accepts OTP that was already verified via /verify-otp endpoint.
     * Checks both unused and recently-used (within 15 min) OTPs.
     */
    @Transactional
    public boolean verifyOtpForRegistration(String email, String otp) {
        String emailLower = email.toLowerCase();

        // Case 1: OTP not yet used (user skipped /verify-otp step)
        Optional<EmailVerification> unused = emailVerificationRepository
                .findByEmailAndOtpAndIsUsedFalse(emailLower, otp);
        if (unused.isPresent()) {
            EmailVerification v = unused.get();
            if (v.getExpiryTime().isAfter(LocalDateTime.now())) {
                v.setIsUsed(true);
                emailVerificationRepository.save(v);
                log.info("OTP verified at registration for: {}", emailLower);
                return true;
            }
            log.warn("Expired OTP at registration for: {}", emailLower);
            return false;
        }

        // Case 2: OTP already used via /verify-otp (normal flow) - allow within 15 min
        Optional<EmailVerification> recentlyUsed = emailVerificationRepository
                .findByEmailAndOtpAndRecentlyUsed(emailLower, otp, LocalDateTime.now().minusMinutes(15));
        if (recentlyUsed.isPresent()) {
            log.info("OTP already verified (registration allowed) for: {}", emailLower);
            return true;
        }

        log.warn("OTP not found or too old for registration: {}", emailLower);
        return false;
    }
}