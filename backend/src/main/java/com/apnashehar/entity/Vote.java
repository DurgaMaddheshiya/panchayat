package com.apnashehar.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Vote Entity - For upvoting complaints
 */
@Entity
@Table(name = "votes", 
    indexes = {
        @Index(name = "idx_complaint_id", columnList = "complaint_id"),
        @Index(name = "idx_user_id", columnList = "user_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_complaint", columnNames = {"user_id", "complaint_id"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}