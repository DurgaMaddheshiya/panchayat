package com.apnashehar.repository;

import com.apnashehar.entity.User;
import com.apnashehar.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * User Repository Interface
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    
    Optional<User> findByMobile(String mobile);

    Optional<User> findByEmailAndIsDeletedFalse(String email);

    Optional<User> findByMobileAndIsDeletedFalse(String mobile);

    Optional<User> findByIdAndIsDeletedFalse(Long id);

    Optional<User> findByVerificationTokenAndIsDeletedFalse(String verificationToken);

    Optional<User> findByResetTokenAndIsDeletedFalse(String resetToken);

    boolean existsByEmail(String email);
    
    boolean existsByMobile(String mobile);

    boolean existsByEmailAndIsDeletedFalse(String email);

    boolean existsByMobileAndIsDeletedFalse(String mobile);

    List<User> findByRoleAndIsDeletedFalse(UserRole role);

    List<User> findByVillageAndIsDeletedFalse(String village);

    List<User> findByVillageAndWardNumberAndIsDeletedFalse(String village, Integer wardNumber);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.village = :village AND u.isDeleted = false")
    List<User> findSocialWorkersByVillage(@Param("role") UserRole role, @Param("village") String village);

    @Query("SELECT u FROM User u WHERE u.role = 'MUKHIYA' AND u.village = :village AND u.isDeleted = false")
    List<User> findMukhiyasByVillage(@Param("village") String village);

    @Query("SELECT u FROM User u WHERE u.isDeleted = false AND " +
           "(:name IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:village IS NULL OR LOWER(u.village) LIKE LOWER(CONCAT('%', :village, '%')))")
    Page<User> searchUsers(@Param("name") String name,
                          @Param("email") String email,
                          @Param("role") UserRole role,
                          @Param("village") String village,
                          Pageable pageable);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isDeleted = false")
    Long countByRole(@Param("role") UserRole role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true AND u.isDeleted = false")
    Long countActiveUsers();

    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = false AND u.isDeleted = false")
    Long countInactiveUsers();

    Page<User> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    Long countByIsVerifiedAndIsActive(Boolean isVerified, Boolean isActive);

    @Query("SELECT u.village, COUNT(u) FROM User u WHERE u.isDeleted = false GROUP BY u.village")
    List<Object[]> getUserCountByVillage();

    /**
     * Delete all unverified users who are NOT admins.
     * Called on startup to clean up fake/test registrations.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM User u WHERE u.isVerified = false AND u.role != com.apnashehar.enums.UserRole.ADMIN")
    int deleteUnverifiedNonAdminUsers();
}