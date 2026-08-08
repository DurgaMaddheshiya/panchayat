package com.apnashehar.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Ward Entity - For managing wards/villages
 */
@Entity
@Table(name = "wards", 
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_ward_village", columnNames = {"ward_number", "village_name"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ward extends BaseEntity {

    @Column(name = "ward_number", nullable = false)
    private Integer wardNumber;

    @Column(name = "ward_name", length = 100)
    private String wardName;

    @Column(name = "village_name", nullable = false, length = 100)
    private String villageName;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "pincode", length = 10)
    private String pincode;

    @Column(name = "population")
    private Integer population;

    @Column(name = "area_sq_km")
    private Double areaSqKm;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Ward boundaries (optional for future mapping)
    @Column(name = "boundary_coordinates", columnDefinition = "TEXT")
    private String boundaryCoordinates; // JSON format for polygon coordinates
}