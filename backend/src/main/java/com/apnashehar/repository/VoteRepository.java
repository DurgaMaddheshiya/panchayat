package com.apnashehar.repository;

import com.apnashehar.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Vote Repository Interface
 */
@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    Optional<Vote> findByComplaintIdAndUserIdAndIsDeletedFalse(Long complaintId, Long userId);

    boolean existsByComplaintIdAndUserId(Long complaintId, Long userId);

    List<Vote> findByComplaintIdAndIsDeletedFalse(Long complaintId);

    List<Vote> findByUserIdAndIsDeletedFalse(Long userId);

    boolean existsByComplaintIdAndUserIdAndIsDeletedFalse(Long complaintId, Long userId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.complaint.id = :complaintId AND v.isDeleted = false")
    Long countByComplaintId(@Param("complaintId") Long complaintId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.user.id = :userId AND v.isDeleted = false")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(v) FROM Vote v WHERE v.isDeleted = false")
    Long countTotalVotes();

    @Query("SELECT v.complaint.id, COUNT(v) FROM Vote v WHERE v.isDeleted = false " +
           "GROUP BY v.complaint.id ORDER BY COUNT(v) DESC")
    List<Object[]> getMostVotedComplaints();
}