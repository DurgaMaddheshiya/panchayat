package com.apnashehar.repository;

import com.apnashehar.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Category Repository Interface
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByIdAndIsDeletedFalse(Long id);

    Optional<Category> findByCategoryNameAndIsDeletedFalse(String categoryName);

    List<Category> findByIsActiveAndIsDeletedFalseOrderByDisplayOrderAsc(Boolean isActive);

    Page<Category> findByIsDeletedFalseOrderByDisplayOrderAsc(Pageable pageable);

    boolean existsByCategoryNameAndIsDeletedFalse(String categoryName);

    @Query("SELECT c FROM Category c WHERE c.isDeleted = false AND " +
           "LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "ORDER BY c.displayOrder ASC")
    Page<Category> searchCategoriesByName(@Param("name") String name, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Category c WHERE c.isActive = true AND c.isDeleted = false")
    Long countActiveCategories();
}