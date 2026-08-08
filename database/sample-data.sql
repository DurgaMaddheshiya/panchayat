-- Sample Data for Apna Shehar
USE apna_shehar_db;

-- Insert Categories
INSERT INTO categories (category_name, description, icon, color_code, is_active, display_order) VALUES
('Road Damage', 'Potholes, broken roads, cracks', '🛣️', '#FF6B6B', TRUE, 1),
('Water Supply', 'Water shortage, pipeline issues', '💧', '#4ECDC4', TRUE, 2),
('Electricity', 'Power cuts, transformer issues', '⚡', '#FFE66D', TRUE, 3),
('Drainage', 'Blocked drains, waterlogging', '🚰', '#95E1D3', TRUE, 4),
('Garbage Collection', 'Waste management issues', '🗑️', '#C7CEEA', TRUE, 5),
('Street Lights', 'Non-functional street lights', '💡', '#FFDAB9', TRUE, 6),
('Health', 'Healthcare facilities issues', '🏥', '#FF8B94', TRUE, 7),
('Education', 'School facilities problems', '📚', '#A8DADC', TRUE, 8),
('Government Schemes', 'Benefit schemes queries', '📋', '#F1FAEE', TRUE, 9),
('Public Safety', 'Safety and security issues', '🚨', '#E63946', TRUE, 10),
('Illegal Construction', 'Unauthorized constructions', '🏗️', '#FF9F1C', TRUE, 11),
('Environment', 'Pollution, tree cutting', '🌳', '#2EC4B6', TRUE, 12),
('Traffic', 'Traffic management issues', '🚦', '#FFC43D', TRUE, 13),
('Other', 'Miscellaneous complaints', '📌', '#B0B0B0', TRUE, 14);

-- Insert Wards
INSERT INTO wards (ward_number, ward_name, village_name, district, state, pincode, population, area_sq_km, is_active) VALUES
(1, 'Ward 1 - Central', 'Mumbai', 'Mumbai', 'Maharashtra', '400001', 50000, 5.5, TRUE),
(2, 'Ward 2 - North', 'Mumbai', 'Mumbai', 'Maharashtra', '400002', 45000, 6.2, TRUE),
(3, 'Ward 3 - South', 'Mumbai', 'Mumbai', 'Maharashtra', '400003', 55000, 4.8, TRUE),
(4, 'Ward 4 - East', 'Mumbai', 'Mumbai', 'Maharashtra', '400004', 48000, 5.0, TRUE),
(5, 'Ward 5 - West', 'Mumbai', 'Mumbai', 'Maharashtra', '400005', 52000, 7.1, TRUE),
(1, 'Ward 1', 'Patna', 'Patna', 'Bihar', '800001', 35000, 4.2, TRUE),
(2, 'Ward 2', 'Patna', 'Patna', 'Bihar', '800002', 38000, 3.9, TRUE),
(1, 'Ward 1', 'Bangalore', 'Bangalore Urban', 'Karnataka', '560001', 60000, 8.5, TRUE),
(2, 'Ward 2', 'Bangalore', 'Bangalore Urban', 'Karnataka', '560002', 58000, 7.8, TRUE);

-- Insert Sample Users (Password: Password@123)
INSERT INTO users (full_name, email, mobile, password, role, village, ward_number, address, district, state, pincode, is_verified, is_active) VALUES
('Admin User', 'admin@apnashehar.com', '9876543210', '$2a$10$N9qo8uLOickgx2ZMRZoMy.VJHXL.YfKWZKhBmFVtPgdQaFwJOmLva', 'ADMIN', 'Mumbai', 1, 'Admin Office, Central Mumbai', 'Mumbai', 'Maharashtra', '400001', TRUE, TRUE),
('Ramesh Kumar', 'mukhiya@apnashehar.com', '9876543211', '$2a$10$N9qo8uLOickgx2ZMRZoMy.VJHXL.YfKWZKhBmFVtPgdQaFwJOmLva', 'MUKHIYA', 'Mumbai', 1, 'Municipal Office, Mumbai', 'Mumbai', 'Maharashtra', '400001', TRUE, TRUE),
('Priya Sharma', 'socialworker@apnashehar.com', '9876543212', '$2a$10$N9qo8uLOickgx2ZMRZoMy.VJHXL.YfKWZKhBmFVtPgdQaFwJOmLva', 'SOCIAL_WORKER', 'Mumbai', 1, 'Ward 1 Office', 'Mumbai', 'Maharashtra', '400001', TRUE, TRUE),
('Amit Patel', 'citizen1@apnashehar.com', '9876543213', '$2a$10$N9qo8uLOickgx2ZMRZoMy.VJHXL.YfKWZKhBmFVtPgdQaFwJOmLva', 'CITIZEN', 'Mumbai', 1, 'Andheri East, Mumbai', 'Mumbai', 'Maharashtra', '400001', TRUE, TRUE),
('Sunita Verma', 'citizen2@apnashehar.com', '9876543214', '$2a$10$N9qo8uLOickgx2ZMRZoMy.VJHXL.YfKWZKhBmFVtPgdQaFwJOmLva', 'CITIZEN', 'Mumbai', 2, 'Bandra West, Mumbai', 'Mumbai', 'Maharashtra', '400002', TRUE, TRUE),
('Rajesh Singh', 'citizen3@apnashehar.com', '9876543215', '$2a$10$N9qo8uLOickgx2ZMRZoMy.VJHXL.YfKWZKhBmFVtPgdQaFwJOmLva', 'CITIZEN', 'Patna', 1, 'Gandhi Maidan, Patna', 'Patna', 'Bihar', '800001', TRUE, TRUE);

-- Insert Sample Complaints
INSERT INTO complaints (complaint_id, title, description, category, priority, status, address, village, ward_number, district, state, latitude, longitude, upvote_count, created_by_id) VALUES
('CMP20240001', 'Large Pothole on Main Road', 'There is a very large pothole on the main road near the market. It has been there for over 2 months and is causing accidents.', 'ROAD_DAMAGE', 'HIGH', 'SUBMITTED', 'Main Market Road, Andheri', 'Mumbai', 1, 'Mumbai', 'Maharashtra', 19.1136, 72.8697, 15, 4),
('CMP20240002', 'Water Shortage in Colony', 'Our colony has been facing severe water shortage for the past week. Water supply comes only for 1 hour daily.', 'WATER_SUPPLY', 'CRITICAL', 'UNDER_REVIEW', 'Green Park Colony, Bandra', 'Mumbai', 2, 'Mumbai', 'Maharashtra', 19.0596, 72.8295, 28, 5),
('CMP20240003', 'Street Lights Not Working', 'All street lights in our area have not been working for 3 days. This is causing safety concerns at night.', 'STREET_LIGHTS', 'MEDIUM', 'ASSIGNED', 'Linking Road, Bandra West', 'Mumbai', 2, 'Mumbai', 'Maharashtra', 19.0522, 72.8292, 12, 5),
('CMP20240004', 'Garbage Not Collected', 'Garbage has not been collected in our area for 5 days. It is creating unhygienic conditions and bad smell.', 'GARBAGE_COLLECTION', 'HIGH', 'IN_PROGRESS', 'Station Road, Andheri', 'Mumbai', 1, 'Mumbai', 'Maharashtra', 19.1197, 72.8464, 22, 4),
('CMP20240005', 'Illegal Construction Activity', 'Construction is happening without proper permissions in our neighborhood. It is blocking the road.', 'ILLEGAL_CONSTRUCTION', 'MEDIUM', 'SUBMITTED', 'Hill Road, Bandra', 'Mumbai', 2, 'Mumbai', 'Maharashtra', 19.0521, 72.8258, 8, 5);

-- Insert Sample Comments
INSERT INTO comments (comment_text, is_official, complaint_id, user_id) VALUES
('This pothole is really dangerous. I almost had an accident yesterday.', FALSE, 1, 5),
('We have assigned a team to inspect this issue. Will update soon.', TRUE, 1, 3),
('When will this be fixed? It has been pending for too long.', FALSE, 2, 4),
('Water tankers have been arranged as temporary solution.', TRUE, 2, 2),
('Thank you for the quick response!', FALSE, 2, 5);

-- Insert Sample Votes
INSERT INTO votes (complaint_id, user_id) VALUES
(1, 4),
(1, 5),
(1, 6),
(2, 4),
(2, 5),
(2, 6),
(3, 5),
(4, 4),
(4, 5);

-- Insert Sample Notifications
INSERT INTO notifications (title, message, type, is_read, reference_id, user_id) VALUES
('Complaint Submitted', 'Your complaint CMP20240001 has been submitted successfully', 'COMPLAINT_SUBMITTED', FALSE, 1, 4),
('Status Updated', 'Your complaint CMP20240002 status changed to UNDER_REVIEW', 'STATUS_CHANGED', FALSE, 2, 5),
('New Comment', 'Someone commented on your complaint CMP20240001', 'NEW_COMMENT', FALSE, 1, 4),
('Complaint Assigned', 'Complaint CMP20240003 has been assigned to you', 'COMPLAINT_ASSIGNED', FALSE, 3, 3);

COMMIT;