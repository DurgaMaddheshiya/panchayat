package com.apnashehar.repository;

import com.apnashehar.entity.OfficialRating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for OfficialRating entity
 */
@Repository
public interface OfficialRatingRepository extends JpaRepository<OfficialRating, Long> {

    /**
     * Check if citizen has already rated this official for this complaint
     */
    boolean existsByCitizenIdAndComplaintId(Long citizenId, Long complaintId);

    /**
     * Get rating by citizen and complaint
     */
    Optional<OfficialRating> findByCitizenIdAndComplaintId(Long citizenId, Long complaintId);

    /**
     * Get all ratings for an official
     */
    Page<OfficialRating> findByOfficialIdOrderByCreatedAtDesc(Long officialId, Pageable pageable);

    /**
     * Get all ratings by a citizen
     */
    Page<OfficialRating> findByCitizenIdOrderByCreatedAtDesc(Long citizenId, Pageable pageable);

    /**
     * Get ratings for a specific complaint
     */
    List<OfficialRating> findByComplaintIdOrderByCreatedAtDesc(Long complaintId);

    /**
     * Calculate average rating for an official
     */
    @Query("SELECT AVG(r.rating) FROM OfficialRating r WHERE r.official.id = :officialId")
    Double getAverageRatingByOfficialId(@Param("officialId") Long officialId);

    /**
     * Count total ratings for an official
     */
    Long countByOfficialId(Long officialId);

    /**
     * Get rating distribution for an official (count by rating value)
     */
    @Query("SELECT r.rating as rating, COUNT(r) as count FROM OfficialRating r WHERE r.official.id = :officialId GROUP BY r.rating ORDER BY r.rating")
    List<Object[]> getRatingDistributionByOfficialId(@Param("officialId") Long officialId);

    /**
     * Get top-rated officials
     */
    @Query("SELECT r.official.id as officialId, r.official.fullName as officialName, " +
           "AVG(r.rating) as avgRating, COUNT(r) as totalRatings " +
           "FROM OfficialRating r " +
           "GROUP BY r.official.id, r.official.fullName " +
           "HAVING COUNT(r) >= :minRatings " +
           "ORDER BY AVG(r.rating) DESC")
    List<Object[]> getTopRatedOfficials(@Param("minRatings") Long minRatings, Pageable pageable);

    /**
     * Get recent ratings for an official
     */
    @Query("SELECT r FROM OfficialRating r WHERE r.official.id = :officialId ORDER BY r.createdAt DESC")
    List<OfficialRating> getRecentRatingsByOfficialId(@Param("officialId") Long officialId, Pageable pageable);
}