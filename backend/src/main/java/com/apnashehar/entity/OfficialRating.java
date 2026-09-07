package com.apnashehar.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * OfficialRating Entity - Citizens can rate officials' performance after complaint resolution
 */
@Entity
@Table(name = "official_ratings",
    indexes = {
        @Index(name = "idx_official_rating_official", columnList = "official_id"),
        @Index(name = "idx_official_rating_complaint", columnList = "complaint_id"),
        @Index(name = "idx_official_rating_citizen", columnList = "citizen_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class OfficialRating extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "official_id", nullable = false)
    private User official;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "is_anonymous", nullable = false)
    private Boolean isAnonymous = false;
}