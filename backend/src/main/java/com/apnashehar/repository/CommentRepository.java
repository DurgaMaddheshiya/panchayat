package com.apnashehar.repository;

import com.apnashehar.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Comment Repository Interface
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    Optional<Comment> findByIdAndIsDeletedFalse(Long id);

    List<Comment> findByComplaintIdAndIsDeletedFalseOrderByCreatedAtAsc(Long complaintId);

    List<Comment> findByComplaintIdAndParentCommentIsNullAndIsDeletedFalseOrderByCreatedAtAsc(Long complaintId);

    List<Comment> findByParentCommentIdAndIsDeletedFalseOrderByCreatedAtAsc(Long parentCommentId);

    Page<Comment> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.complaint.id = :complaintId AND c.isDeleted = false")
    Long countByComplaintId(@Param("complaintId") Long complaintId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user.id = :userId AND c.isDeleted = false")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.isOfficial = true AND c.isDeleted = false")
    Long countOfficialComments();

    @Query("SELECT c FROM Comment c WHERE c.complaint.id = :complaintId AND c.isOfficial = true AND c.isDeleted = false ORDER BY c.createdAt DESC")
    List<Comment> findOfficialCommentsByComplaintId(@Param("complaintId") Long complaintId);
}