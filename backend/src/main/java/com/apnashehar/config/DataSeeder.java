package com.apnashehar.config;

import com.apnashehar.entity.User;
import com.apnashehar.enums.UserRole;
import com.apnashehar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default ADMIN user on first startup if none exists.
 *
 * Credentials are loaded from environment variables:
 *   ADMIN_EMAIL    (default: admin@apnashehar.com)
 *   ADMIN_PASSWORD (default: Admin@123 - CHANGE IN PRODUCTION!)
 *
 * Set these in your .env or hosting environment before first deploy.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email:admin@apnashehar.com}")
    private String adminEmail;

    @Value("${admin.password:Admin@123}")
    private String adminPassword;

    @Value("${admin.fullname:System Admin}")
    private String adminFullName;

    @Override
    public void run(String... args) {
        seedAdmin();
        cleanupUnverifiedUsers();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin already exists — skipping seed.");
            return;
        }

        User admin = User.builder()
                .fullName(adminFullName)
                .email(adminEmail)
                .mobile("9000000000")
                .password(passwordEncoder.encode(adminPassword))
                .role(UserRole.ADMIN)
                .isVerified(true)
                .isActive(true)
                .build();

        userRepository.save(admin);
        log.warn("=================================================");
        log.warn("  DEFAULT ADMIN CREATED");
        log.warn("  Email   : {}", adminEmail);
        log.warn("  CHANGE THE PASSWORD AFTER FIRST LOGIN!");
        log.warn("=================================================");
    }

    private void cleanupUnverifiedUsers() {
        int deleted = userRepository.deleteUnverifiedNonAdminUsers();
        if (deleted > 0) {
            log.info("Cleaned up {} unverified non-admin user(s) on startup.", deleted);
        }
    }
}

    @Override
    public void run(String... args) {
        seedAdmin();
        cleanupUnverifiedUsers();
    }

    private void seedAdmin() {
        String adminEmail = "admin@apnashehar.com";
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Default admin already exists — skipping seed.");
            return;
        }

        User admin = User.builder()
                .fullName("System Admin")
                .email(adminEmail)
                .mobile("9000000000")
                .password(passwordEncoder.encode("Admin@123"))
                .role(UserRole.ADMIN)
                .isVerified(true)
                .isActive(true)
                .build();

        userRepository.save(admin);
        log.warn("=================================================");
        log.warn("  DEFAULT ADMIN CREATED");
        log.warn("  Email   : admin@apnashehar.com");
        log.warn("  Password: Admin@123");
        log.warn("  CHANGE THIS PASSWORD AFTER FIRST LOGIN!");
        log.warn("=================================================");
    }

    /**
     * Delete all unverified users on startup (except ADMINs).
     * This cleans up fake/test registrations that never verified their email.
     */
    private void cleanupUnverifiedUsers() {
        int deleted = userRepository.deleteUnverifiedNonAdminUsers();
        if (deleted > 0) {
            log.info("Cleaned up {} unverified non-admin user(s) on startup.", deleted);
        }
    }
}
