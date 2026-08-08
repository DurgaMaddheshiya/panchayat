package com.apnashehar.repository;

import com.apnashehar.entity.Ward;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Ward Repository Interface
 */
@Repository
public interface WardRepository extends JpaRepository<Ward, Long> {

    Optional<Ward> findByIdAndIsDeletedFalse(Long id);

    Optional<Ward> findByWardNumberAndVillageNameAndIsDeletedFalse(Integer wardNumber, String villageName);

    List<Ward> findByVillageNameAndIsDeletedFalseOrderByWardNumberAsc(String villageName);

    List<Ward> findByDistrictAndIsDeletedFalseOrderByVillageNameAsc(String district);

    List<Ward> findByStateAndIsDeletedFalseOrderByDistrictAscVillageNameAsc(String state);

    List<Ward> findByIsActiveAndIsDeletedFalseOrderByVillageNameAscWardNumberAsc(Boolean isActive);

    Page<Ward> findByIsDeletedFalseOrderByVillageNameAscWardNumberAsc(Pageable pageable);

    boolean existsByWardNumberAndVillageNameAndIsDeletedFalse(Integer wardNumber, String villageName);

    @Query("SELECT w FROM Ward w WHERE w.isDeleted = false AND " +
           "(:villageName IS NULL OR LOWER(w.villageName) LIKE LOWER(CONCAT('%', :villageName, '%'))) AND " +
           "(:district IS NULL OR LOWER(w.district) LIKE LOWER(CONCAT('%', :district, '%'))) AND " +
           "(:state IS NULL OR LOWER(w.state) LIKE LOWER(CONCAT('%', :state, '%'))) AND " +
           "(:wardNumber IS NULL OR w.wardNumber = :wardNumber) " +
           "ORDER BY w.villageName ASC, w.wardNumber ASC")
    Page<Ward> searchWards(@Param("villageName") String villageName,
                          @Param("district") String district,
                          @Param("state") String state,
                          @Param("wardNumber") Integer wardNumber,
                          Pageable pageable);

    @Query("SELECT DISTINCT w.villageName FROM Ward w WHERE w.isActive = true AND w.isDeleted = false ORDER BY w.villageName")
    List<String> findAllActiveVillageNames();

    @Query("SELECT DISTINCT w.district FROM Ward w WHERE w.isActive = true AND w.isDeleted = false ORDER BY w.district")
    List<String> findAllActiveDistricts();

    @Query("SELECT DISTINCT w.state FROM Ward w WHERE w.isActive = true AND w.isDeleted = false ORDER BY w.state")
    List<String> findAllActiveStates();

    @Query("SELECT COUNT(w) FROM Ward w WHERE w.isActive = true AND w.isDeleted = false")
    Long countActiveWards();
}