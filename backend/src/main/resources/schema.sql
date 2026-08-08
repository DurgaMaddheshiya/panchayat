-- Apna Shehar Database Schema
-- MySQL DDL Script

-- Create Database
CREATE DATABASE IF NOT EXISTS apna_shehar_db
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE apna_shehar_db;

-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('CITIZEN', 'SOCIAL_WORKER', 'MUKHIYA', 'ADMIN') NOT NULL,
    profile_image VARCHAR(500),
    village VARCHAR(100),
    ward_number INT,
    address VARCHAR(500),
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_mobile (mobile),
    INDEX idx_role (role),
    INDEX idx_ward (ward_number)
);

-- Categories Table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon VARCHAR(10),
    color_code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Wards Table
CREATE TABLE wards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ward_number INT NOT NULL,
    ward_name VARCHAR(100),
    village_name VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    population INT,
    area_sq_km DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    boundary_coordinates TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_ward_village (ward_number, village_name)
);

-- Complaints Table
CREATE TABLE complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('ROAD_DAMAGE', 'WATER_SUPPLY', 'ELECTRICITY', 'DRAINAGE', 
                  'GARBAGE_COLLECTION', 'STREET_LIGHTS', 'HEALTH', 'EDUCATION',
                  'GOVERNMENT_SCHEMES', 'PUBLIC_SAFETY', 'ILLEGAL_CONSTRUCTION',
                  'ENVIRONMENT', 'TRAFFIC', 'OTHER') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 
                'ON_HOLD', 'RESOLVED', 'REJECTED') NOT NULL,
    address VARCHAR(500) NOT NULL,
    village VARCHAR(100),
    ward_number INT,
    district VARCHAR(100),
    state VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    google_maps_url VARCHAR(1000),
    upvote_count INT DEFAULT 0,
    resolved_at TIMESTAMP NULL,
    admin_remarks TEXT,
    created_by_id BIGINT NOT NULL,
    assigned_to_id BIGINT,
    resolved_by_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_ward (ward_number),
    INDEX idx_created_by (created_by_id),
    INDEX idx_assigned_to (assigned_to_id),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Comments Table
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comment_text TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    complaint_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_comment_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_comment (parent_comment_id),
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Votes Table
CREATE TABLE votes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_user_id (user_id),
    UNIQUE KEY uk_user_complaint (user_id, complaint_id),
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Attachments Table
CREATE TABLE attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000) NOT NULL,
    file_type ENUM('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER') NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    complaint_id BIGINT,
    comment_id BIGINT,
    uploaded_by_id BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_complaint_id (complaint_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_uploaded_by (uploaded_by_id),
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT chk_attachment_reference CHECK (
        (complaint_id IS NOT NULL AND comment_id IS NULL) OR
        (complaint_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('COMPLAINT_SUBMITTED', 'COMPLAINT_ASSIGNED', 'STATUS_CHANGED',
              'COMPLAINT_RESOLVED', 'NEW_COMMENT', 'ADMIN_ANNOUNCEMENT',
              'UPVOTE_RECEIVED', 'SYSTEM_ALERT') NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reference_id BIGINT,
    action_url VARCHAR(500),
    user_id BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create triggers for complaint_id generation
DELIMITER $$
CREATE TRIGGER generate_complaint_id 
    BEFORE INSERT ON complaints 
    FOR EACH ROW 
BEGIN 
    IF NEW.complaint_id IS NULL OR NEW.complaint_id = '' THEN
        SET NEW.complaint_id = CONCAT('CMP', YEAR(NOW()), LPAD(MONTH(NOW()), 2, '0'), 
                                     LPAD(DAY(NOW()), 2, '0'), LPAD(NEW.id, 6, '0'));
    END IF;
END$$
DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_complaints_location ON complaints(latitude, longitude);
CREATE INDEX idx_complaints_date_range ON complaints(created_at, status);
CREATE INDEX idx_users_location ON users(village, ward_number);
CREATE FULLTEXT INDEX idx_complaints_search ON complaints(title, description);
CREATE FULLTEXT INDEX idx_comments_search ON comments(comment_text);