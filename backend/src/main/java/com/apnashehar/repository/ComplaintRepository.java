package com.apnashehar.repository;

import com.apnashehar.entity.Complaint;
import com.apnashehar.enums.ComplaintCategory;
import com.apnashehar.enums.ComplaintStatus;
import com.apnashehar.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Complaint Repository Interface
 */
@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    Optional<Complaint> findByIdAndIsDeletedFalse(Long id);

    Page<Complaint> findByIsDeletedFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<Complaint> findByCreatedById(Long userId, Pageable pageable);

    Page<Complaint> findByCreatedByIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Complaint> findByAssignedToIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Complaint> findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(ComplaintStatus status, Pageable pageable);

    Page<Complaint> findByIsDeletedTrueOrderByUpdatedAtDesc(Pageable pageable);

    List<Complaint> findByStatus(ComplaintStatus status);

    Page<Complaint> findByCategoryAndIsDeletedFalseOrderByCreatedAtDesc(ComplaintCategory category, Pageable pageable);

    Page<Complaint> findByVillageAndIsDeletedFalseOrderByCreatedAtDesc(String village, Pageable pageable);

    Page<Complaint> findByVillageAndWardNumberAndIsDeletedFalseOrderByCreatedAtDesc(String village, Integer wardNumber, Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.isDeleted = false AND " +
           "(:title IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:description IS NULL OR LOWER(c.description) LIKE LOWER(CONCAT('%', :description, '%'))) AND " +
           "(:category IS NULL OR c.category = :category) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:village IS NULL OR LOWER(c.village) LIKE LOWER(CONCAT('%', :village, '%'))) AND " +
           "(:wardNumber IS NULL OR c.wardNumber = :wardNumber) AND " +
           "(:createdById IS NULL OR c.createdBy.id = :createdById) AND " +
           "(:assignedToId IS NULL OR c.assignedTo.id = :assignedToId) " +
           "ORDER BY c.upvoteCount DESC, c.createdAt DESC")
    Page<Complaint> searchComplaints(@Param("title") String title,
                                   @Param("description") String description,
                                   @Param("category") ComplaintCategory category,
                                   @Param("status") ComplaintStatus status,
                                   @Param("priority") Priority priority,
                                   @Param("village") String village,
                                   @Param("wardNumber") Integer wardNumber,
                                   @Param("createdById") Long createdById,
                                   @Param("assignedToId") Long assignedToId,
                                   Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.isDeleted = false AND " +
           "c.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY c.createdAt DESC")
    Page<Complaint> findComplaintsByDateRange(@Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate,
                                            Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE c.isDeleted = false AND " +
           "c.latitude BETWEEN :minLat AND :maxLat AND " +
           "c.longitude BETWEEN :minLong AND :maxLong " +
           "ORDER BY c.upvoteCount DESC")
    List<Complaint> findComplaintsInArea(@Param("minLat") Double minLat,
                                       @Param("maxLat") Double maxLat,
                                       @Param("minLong") Double minLong,
                                       @Param("maxLong") Double maxLong);

    @Query("SELECT c FROM Complaint c WHERE c.isDeleted = false AND c.upvoteCount >= :minVotes " +
           "ORDER BY c.upvoteCount DESC, c.createdAt DESC")
    Page<Complaint> findTrendingComplaints(@Param("minVotes") Integer minVotes, Pageable pageable);

    // Statistics Queries
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.isDeleted = false")
    Long countTotalComplaints();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status AND c.isDeleted = false")
    Long countByStatus(@Param("status") ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.category = :category AND c.isDeleted = false")
    Long countByCategory(@Param("category") ComplaintCategory category);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.priority = :priority AND c.isDeleted = false")
    Long countByPriority(@Param("priority") Priority priority);

    @Query("SELECT c.category, COUNT(c) FROM Complaint c WHERE c.isDeleted = false GROUP BY c.category")
    List<Object[]> getComplaintCountByCategory();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c WHERE c.isDeleted = false GROUP BY c.status")
    List<Object[]> getComplaintCountByStatus();

    @Query("SELECT c.priority, COUNT(c) FROM Complaint c WHERE c.isDeleted = false GROUP BY c.priority")
    List<Object[]> getComplaintCountByPriority();

    @Query("SELECT c.village, COUNT(c) FROM Complaint c WHERE c.isDeleted = false GROUP BY c.village")
    List<Object[]> getComplaintCountByVillage();

    @Query(value = "SELECT YEAR(created_at), MONTH(created_at), COUNT(*) " +
                   "FROM complaints WHERE is_deleted = false " +
                   "GROUP BY YEAR(created_at), MONTH(created_at) " +
                   "ORDER BY YEAR(created_at) DESC, MONTH(created_at) DESC",
           nativeQuery = true)
    List<Object[]> getMonthlyComplaintStats();

    @Query(value = "SELECT AVG(DATEDIFF('DAY', created_at, resolved_at)) FROM complaints " +
                   "WHERE status = 'RESOLVED' AND resolved_at IS NOT NULL AND is_deleted = false",
           nativeQuery = true)
    Double getAverageResolutionTimeInDays();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.createdBy.id = :userId AND c.isDeleted = false")
    Long countComplaintsByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.assignedTo.id = :userId AND c.isDeleted = false")
    Long countAssignedComplaintsByUser(@Param("userId") Long userId);

    // Additional queries for rating service
    Long countByAssignedToIdAndStatus(Long assignedToId, ComplaintStatus status);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.assignedTo.id = :assignedToId AND c.status IN :statuses AND c.isDeleted = false")
    Long countByAssignedToIdAndStatusIn(@Param("assignedToId") Long assignedToId, @Param("statuses") List<ComplaintStatus> statuses);
    
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.assignedTo.id = :assignedToId AND c.createdAt >= :date AND c.isDeleted = false")
    Long countByAssignedToIdAndCreatedAtAfter(@Param("assignedToId") Long assignedToId, @Param("date") LocalDateTime date);
}