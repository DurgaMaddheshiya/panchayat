package com.apnashehar.service;

import com.apnashehar.dto.request.UserRegistrationRequest;
import com.apnashehar.dto.response.UserResponse;
import com.apnashehar.entity.User;
import com.apnashehar.enums.UserRole;
import com.apnashehar.exception.BadRequestException;
import com.apnashehar.exception.ResourceNotFoundException;
import com.apnashehar.mapper.UserMapper;
import com.apnashehar.repository.UserRepository;
import com.apnashehar.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * User Service - Business logic for user management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    /**
     * Get current user profile
     */
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        UserPrincipal currentUser = getCurrentUser();
        User user = userRepository.findByIdAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        return userMapper.toResponse(user);
    }

    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return userMapper.toResponse(user);
    }

    /**
     * Update user profile
     */
    @Transactional
    public UserResponse updateProfile(UserRegistrationRequest request) {
        UserPrincipal currentUser = getCurrentUser();

        User user = userRepository.findByIdAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Update allowed fields
        user.setFullName(request.getFullName());
        user.setMobile(request.getMobile());
        user.setVillage(request.getVillage());
        user.setWardNumber(request.getWardNumber());
        user.setAddress(request.getAddress());
        user.setDistrict(request.getDistrict());
        user.setState(request.getState());
        user.setPincode(request.getPincode());

        user = userRepository.save(user);
        log.info("User profile updated: {}", user.getId());

        return userMapper.toResponse(user);
    }

    /**
     * Change password
     */
    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        UserPrincipal currentUser = getCurrentUser();

        User user = userRepository.findByIdAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getId());
    }

    /**
     * Get all users by role
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsersByRole(UserRole role, Pageable pageable) {
        return userRepository.searchUsers(null, null, role, null, pageable)
                .map(userMapper::toResponse);
    }

    /**
     * Search users
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String name, String email, UserRole role, 
                                         String village, Pageable pageable) {
        return userRepository.searchUsers(name, email, role, village, pageable)
                .map(userMapper::toResponse);
    }

    /**
     * Deactivate user account
     */
    @Transactional
    public void deactivateAccount() {
        UserPrincipal currentUser = getCurrentUser();

        User user = userRepository.findByIdAndIsDeletedFalse(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUser.getId()));

        user.setIsActive(false);
        userRepository.save(user);

        log.info("User account deactivated: {}", user.getId());
    }

    /**
     * Admin: Activate/Deactivate user
     */
    @Transactional
    public void toggleUserStatus(Long userId, Boolean isActive) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setIsActive(isActive);
        userRepository.save(user);

        log.info("User {} status changed to: {}", userId, isActive ? "Active" : "Inactive");
    }

    /**
     * Admin: Delete user (soft delete - admin cannot be deleted)
     */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Admin ko delete nahi kar sakte
        if (user.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Admin users cannot be deleted");
        }

        user.setIsDeleted(true);
        userRepository.save(user);

        log.info("User permanently deleted: {} ({})", user.getEmail(), userId);
    }

    /**
     * Get officials and social workers for assignment dropdown
     */
    @Transactional(readOnly = true)
    public java.util.List<UserResponse> getOfficials() {
        java.util.List<com.apnashehar.entity.User> officials = new java.util.ArrayList<>();
        officials.addAll(userRepository.findByRoleAndIsDeletedFalse(UserRole.OFFICIAL));
        officials.addAll(userRepository.findByRoleAndIsDeletedFalse(UserRole.SOCIAL_WORKER));
        officials.addAll(userRepository.findByRoleAndIsDeletedFalse(UserRole.ADMIN));
        return officials.stream()
                .filter(u -> u.getIsActive())
                .map(userMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get statistics
     */
    @Transactional(readOnly = true)
    public Long getTotalUserCount() {
        return userRepository.countActiveUsers();
    }

    @Transactional(readOnly = true)
    public Long getUserCountByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    /**
     * Admin: Get all users (paginated)
     */
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable)
                .map(userMapper::toResponse);
    }

    /**
     * Admin: Update user by admin
     */
    @Transactional
    public void updateUserByAdmin(Long userId, UserRole role, Boolean isActive) {
        User user = userRepository.findByIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (role != null) {
            user.setRole(role);
        }
        if (isActive != null) {
            user.setIsActive(isActive);
        }

        userRepository.save(user);
        log.info("User {} updated by admin - role: {}, active: {}", userId, role, isActive);
    }

    /**
     * Admin: Get user statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        Long totalUsers = userRepository.countActiveUsers();
        Long totalCitizens = userRepository.countByRole(UserRole.CITIZEN);
        Long totalSocialWorkers = userRepository.countByRole(UserRole.SOCIAL_WORKER);
        Long totalAdmins = userRepository.countByRole(UserRole.ADMIN);
        Long inactiveUsers = userRepository.countInactiveUsers();

        stats.put("totalUsers", totalUsers);
        stats.put("totalCitizens", totalCitizens);
        stats.put("totalSocialWorkers", totalSocialWorkers);
        stats.put("totalAdmins", totalAdmins);
        stats.put("inactiveUsers", inactiveUsers);
        stats.put("activeUsers", totalUsers - inactiveUsers);

        return stats;
    }

    private UserPrincipal getCurrentUser() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}