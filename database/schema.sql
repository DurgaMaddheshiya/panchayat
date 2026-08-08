-- Apna Shehar Database Schema
-- Smart Digital Grievance Management System
-- MySQL Database

DROP DATABASE IF EXISTS apna_shehar_db;
CREATE DATABASE apna_shehar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_mobile (mobile),
    INDEX idx_role (role),
    INDEX idx_ward (ward_number),
    INDEX idx_village (village)
);

-- Categories Table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon VARCHAR(10),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Wards Table
CREATE TABLE wards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ward_number INT NOT NULL,
    village_name VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    population INT,
    area_sq_km DOUBLE,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_ward_village (ward_number, village_name)
);

-- Complaints Table
CREATE TABLE complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('ROAD_DAMAGE', 'WATER_SUPPLY', 'ELECTRICITY', 'DRAINAGE', 'GARBAGE_COLLECTION', 'STREET_LIGHTS', 'HEALTH', 'EDUCATION', 'GOVERNMENT_SCHEMES', 'PUBLIC_SAFETY', 'ILLEGAL_CONSTRUCTION', 'ENVIRONMENT', 'TRAFFIC', 'OTHER') NOT NULL,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'SUBMITTED',
    address VARCHAR(500) NOT NULL,
    village VARCHAR(100),
    ward_number INT,
    district VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    resolved_at TIMESTAMP NULL,
    official_remarks TEXT,
    vote_count INT DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_by_id BIGINT NOT NULL,
    assigned_to_id BIGINT,
    resolved_by_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_ward (ward_number),
    INDEX idx_village (village),
    INDEX idx_created_by (created_by_id),
    INDEX idx_assigned_to (assigned_to_id),
    INDEX idx_location (latitude, longitude),
    INDEX idx_created_at (created_at)
);

-- Attachments Table
CREATE TABLE attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    description VARCHAR(500),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    INDEX idx_complaint (complaint_id)
);

-- Comments Table
CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment_text TEXT NOT NULL,
    is_official BOOLEAN DEFAULT FALSE,
    attachment_url VARCHAR(500),
    parent_comment_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    
    INDEX idx_complaint (complaint_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_comment_id)
);

-- Votes Table
CREATE TABLE votes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_vote (complaint_id, user_id),
    INDEX idx_complaint (complaint_id),
    INDEX idx_user (user_id)
);

-- Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    link_url VARCHAR(500),
    complaint_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type)
);

-- Triggers for vote count
DELIMITER $$

CREATE TRIGGER vote_insert_trigger
    AFTER INSERT ON votes
    FOR EACH ROW
BEGIN
    UPDATE complaints 
    SET vote_count = (
        SELECT COUNT(*) 
        FROM votes 
        WHERE complaint_id = NEW.complaint_id AND is_deleted = FALSE
    )
    WHERE id = NEW.complaint_id;
END$$

CREATE TRIGGER vote_delete_trigger
    AFTER UPDATE ON votes
    FOR EACH ROW
BEGIN
    IF NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE THEN
        UPDATE complaints 
        SET vote_count = (
            SELECT COUNT(*) 
            FROM votes 
            WHERE complaint_id = NEW.complaint_id AND is_deleted = FALSE
        )
        WHERE id = NEW.complaint_id;
    END IF;
END$$

DELIMITER ;

-- Views for Dashboard Analytics
CREATE VIEW complaint_statistics AS
SELECT 
    COUNT(*) as total_complaints,
    SUM(CASE WHEN status = 'SUBMITTED' THEN 1 ELSE 0 END) as pending_complaints,
    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_complaints,
    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_complaints,
    SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_complaints,
    AVG(CASE WHEN resolved_at IS NOT NULL THEN 
        TIMESTAMPDIFF(DAY, created_at, resolved_at) 
        ELSE NULL END) as avg_resolution_days
FROM complaints 
WHERE is_deleted = FALSE;

CREATE VIEW category_wise_complaints AS
SELECT 
    category,
    COUNT(*) as complaint_count,
    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_count,
    ROUND((SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as resolution_percentage
FROM complaints 
WHERE is_deleted = FALSE
GROUP BY category
ORDER BY complaint_count DESC;

CREATE VIEW ward_wise_complaints AS
SELECT 
    village,
    ward_number,
    COUNT(*) as complaint_count,
    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolved_count
FROM complaints 
WHERE is_deleted = FALSE AND ward_number IS NOT NULL
GROUP BY village, ward_number
ORDER BY complaint_count DESC;

CREATE VIEW monthly_complaint_trends AS
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month,
    COUNT(*) as complaints_created,
    SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as complaints_resolved
FROM complaints 
WHERE is_deleted = FALSE
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC;