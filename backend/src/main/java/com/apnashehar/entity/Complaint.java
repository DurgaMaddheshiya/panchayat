package com.apnashehar.entity;

import com.apnashehar.enums.ComplaintCategory;
import com.apnashehar.enums.ComplaintStatus;
import com.apnashehar.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Complaint Entity - Core entity for grievance management
 */
@Entity
@Table(name = "complaints", indexes = {
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_priority", columnList = "priority"),
    @Index(name = "idx_ward", columnList = "ward_number"),
    @Index(name = "idx_created_by", columnList = "created_by_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint extends BaseEntity {

    @Column(name = "complaint_id", unique = true, nullable = false, length = 20)
    private String complaintId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private ComplaintCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ComplaintStatus status;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "village", length = 100)
    private String village;

    @Column(name = "ward_number")
    private Integer wardNumber;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "google_maps_url", length = 1000)
    private String googleMapsUrl;

    @Column(name = "upvote_count")
    private Integer upvoteCount = 0;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "admin_remarks", columnDefinition = "TEXT")
    private String adminRemarks;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by_id")
    private User resolvedBy;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vote> votes = new ArrayList<>();

    // Helper methods
    public void incrementUpvoteCount() {
        this.upvoteCount = (this.upvoteCount == null ? 0 : this.upvoteCount) + 1;
    }

    public void decrementUpvoteCount() {
        this.upvoteCount = Math.max(0, (this.upvoteCount == null ? 0 : this.upvoteCount) - 1);
    }
}