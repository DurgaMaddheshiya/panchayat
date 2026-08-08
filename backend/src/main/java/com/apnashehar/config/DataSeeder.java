package com.apnashehar.config;

import com.apnashehar.entity.User;
import com.apnashehar.enums.UserRole;
import com.apnashehar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default ADMIN user on first startup if none exists.
 *
 * Default credentials:
 *   Email   : admin@apnashehar.com
 *   Password: Admin@123
 *
 * CHANGE the password immediately after first login in production!
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
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
}
