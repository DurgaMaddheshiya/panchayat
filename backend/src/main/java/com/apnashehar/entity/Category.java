package com.apnashehar.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Category Entity - For managing complaint categories dynamically
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Column(name = "category_name", nullable = false, unique = true, length = 100)
    private String categoryName;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "icon", length = 10)
    private String icon;

    @Column(name = "color_code", length = 10)
    private String colorCode;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "display_order")
    private Integer displayOrder;
}