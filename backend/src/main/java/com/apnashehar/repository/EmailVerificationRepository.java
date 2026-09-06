package com.apnashehar.repository;

import com.apnashehar.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findByEmailAndOtpAndIsUsedFalse(String email, String otp);

    Optional<EmailVerification> findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(String email);

    // Check if OTP was recently used (to handle double-call from frontend)
    @Query("SELECT e FROM EmailVerification e WHERE e.email = :email AND e.otp = :otp AND e.isUsed = true AND e.createdAt > :since")
    Optional<EmailVerification> findByEmailAndOtpAndRecentlyUsed(String email, String otp, LocalDateTime since);

    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerification e WHERE e.expiryTime < :now")
    void deleteExpiredVerifications(LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE EmailVerification e SET e.isUsed = true WHERE e.email = :email AND e.isUsed = false")
    void markAllAsUsedForEmail(String email);
}