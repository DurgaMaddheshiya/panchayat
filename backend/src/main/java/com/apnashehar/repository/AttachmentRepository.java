package com.apnashehar.repository;

import com.apnashehar.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Attachment Repository Interface
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    Optional<Attachment> findByIdAndIsDeletedFalse(Long id);

    List<Attachment> findByComplaintIdAndIsDeletedFalseOrderByCreatedAtAsc(Long complaintId);

    List<Attachment> findByFileTypeAndIsDeletedFalse(String fileType);

    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.complaint.id = :complaintId AND a.isDeleted = false")
    Long countByComplaintId(@Param("complaintId") Long complaintId);

    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.isDeleted = false")
    Long countTotalAttachments();

    @Query("SELECT SUM(a.fileSize) FROM Attachment a WHERE a.isDeleted = false")
    Long getTotalStorageUsed();

    @Query("SELECT a.fileType, COUNT(a) FROM Attachment a WHERE a.isDeleted = false GROUP BY a.fileType")
    List<Object[]> getFileTypeStats();
}