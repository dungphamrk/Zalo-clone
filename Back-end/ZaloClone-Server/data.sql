-- =====================================================
-- ZALO CLONE SERVER - TĂNG CƯỜNG DỮ LIỆU
-- Current time: 2025-11-11 04:02 PM +07
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- XÓA THEO THỨ TỰ CON → CHA (rất quan trọng!)
TRUNCATE TABLE message_reactions;
TRUNCATE TABLE message_statuses;
TRUNCATE TABLE attachments;
TRUNCATE TABLE messages;
TRUNCATE TABLE conversation_members;
TRUNCATE TABLE commentreaction;
TRUNCATE TABLE comment;
TRUNCATE TABLE postreaction;
TRUNCATE TABLE postmedia;
TRUNCATE TABLE friend_requests;
TRUNCATE TABLE friends;
TRUNCATE TABLE conversations;
TRUNCATE TABLE in_app_notifications;
TRUNCATE TABLE post;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. USERS (Đã có 10 bản ghi)
-- =====================================================
INSERT INTO users (id, email, username, password, role, status, createdAt, updatedAt) VALUES
                                                                                          (1, 'admin@zalo.vn', '0901000001', '$2a$12$adminhashedpassword1234567890', 'ADMIN', 'ACTIVE', '2025-01-01 00:00:00', '2025-01-01 00:00:00'),
                                                                                          (2, 'an@gmail.com', '0902123456', '$2a$12$anpass12345678901234567890', 'USER', 'ACTIVE', '2025-01-02 10:00:00', '2025-01-02 10:00:00'),
                                                                                          (3, 'binh@yahoo.com', '0903234567', '$2a$12$binhpass1234567890123456', 'USER', 'ACTIVE', '2025-01-03 11:00:00', '2025-01-03 11:00:00'),
                                                                                          (4, 'chi@hotmail.com', '0904345678', '$2a$12$chipass123456789012345678', 'USER', 'ACTIVE', '2025-01-04 12:00:00', '2025-01-04 12:00:00'),
                                                                                          (5, 'dung@zalo.vn', '0905456789', '$2a$12$dungpass1234567890123456', 'USER', 'ACTIVE', '2025-01-05 13:00:00', '2025-01-05 13:00:00'),
                                                                                          (6, 'emily@gmail.com', '0906567890', '$2a$12$emilypass12345678901234', 'USER', 'ACTIVE', '2025-01-06 14:00:00', '2025-01-06 14:00:00'),
                                                                                          (7, 'frank@outlook.com', '0907678901', '$2a$12$frankpass12345678901234', 'USER', 'ACTIVE', '2025-01-07 15:00:00', '2025-01-07 15:00:00'),
                                                                                          (8, 'grace@gmail.com', '0908789012', '$2a$12$gracepass12345678901234', 'USER', 'ACTIVE', '2025-01-08 16:00:00', '2025-01-08 16:00:00'),
                                                                                          (9, 'huy@company.com', '0909890123', '$2a$12$huyypass123456789012345', 'USER', 'ACTIVE', '2025-01-09 17:00:00', '2025-01-09 17:00:00'),
                                                                                          (10, 'iris@zalo.vn', '0910901234', '$2a$12$irisspass123456789012345', 'USER', 'ACTIVE', '2025-01-10 18:00:00', '2025-01-10 18:00:00')
ON DUPLICATE KEY UPDATE email = VALUES(email);

-- =====================================================
-- 2. USER_PROFILES (Đã có 10 bản ghi)
-- =====================================================
INSERT INTO user_profiles (id, userId, avatarUrl, displayName, birthday, gender, location, lastActive, presence) VALUES
                                                                                                                     (1, 1, 'https://i.pravatar.cc/150?img=1', 'Admin Zalo', '1990-01-01', 'MALE', 'Hà Nội', '2025-11-11 08:41:00', 'ONLINE'),
                                                                                                                     (2, 2, 'https://i.pravatar.cc/150?img=2', 'An Trần', '1998-05-15', 'FEMALE', 'TP.HCM', '2025-11-11 08:40:00', 'ONLINE'),
                                                                                                                     (3, 3, 'https://i.pravatar.cc/150?img=3', 'Bình Nguyễn', '1997-08-20', 'MALE', 'Đà Nẵng', '2025-11-11 08:39:00', 'OFFLINE'),
                                                                                                                     (4, 4, 'https://i.pravatar.cc/150?img=4', 'Chi Phạm', '1999-03-10', 'FEMALE', 'Hà Nội', '2025-11-11 08:38:00', 'ONLINE'),
                                                                                                                     (5, 5, 'https://i.pravatar.cc/150?img=5', 'Dũng Hồ', '1996-12-25', 'MALE', 'Cần Thơ', '2025-11-11 08:37:00', 'AWAY'),
                                                                                                                     (6, 6, 'https://i.pravatar.cc/150?img=6', 'Emily Võ', '2000-07-07', 'FEMALE', 'Hải Phòng', '2025-11-11 08:36:00', 'ONLINE'),
                                                                                                                     (7, 7, 'https://i.pravatar.cc/150?img=7', 'Frank Lê', '1995-11-11', 'MALE', 'Nha Trang', '2025-11-11 08:35:00', 'OFFLINE'),
                                                                                                                     (8, 8, 'https://i.pravatar.cc/150?img=8', 'Grace Ngô', '1998-09-09', 'FEMALE', 'Huế', '2025-11-11 08:34:00', 'ONLINE'),
                                                                                                                     (9, 9, 'https://i.pravatar.cc/150?img=9', 'Huy Trương', '1994-04-04', 'MALE', 'Vũng Tàu', '2025-11-11 08:33:00', 'AWAY'),
                                                                                                                     (10, 10, 'https://i.pravatar.cc/150?img=10', 'Iris Đỗ', '1999-06-30', 'FEMALE', 'Biên Hòa', '2025-11-11 08:32:00', 'ONLINE')
ON DUPLICATE KEY UPDATE displayName = VALUES(displayName);

-- =====================================================
-- 3. POSTS (Đã có 10 bản ghi)
-- =====================================================
INSERT INTO post (id, content, visibility, createdAt, user_id) VALUES
                                                                   (1, 'Chào mọi người! Mình mới vào nhóm.', 'PUBLIC', '2025-11-01 10:00:00', 2),
                                                                   (2, 'Hôm nay trời đẹp quá!', 'PRIVATE', '2025-11-02 11:00:00', 3),
                                                                   (3, 'Ai đi cafe tối nay không?', 'PUBLIC', '2025-11-03 12:00:00', 4),
                                                                   (4, 'Mình vừa xem phim hay lắm!', 'PRIVATE', '2025-11-04 13:00:00', 5),
                                                                   (5, 'Check-in quán mới ở Q1', 'PUBLIC', '2025-11-05 14:00:00', 6),
                                                                   (6, 'Cần tìm người đi phượt cuối tuần', 'PUBLIC', '2025-11-06 15:00:00', 7),
                                                                   (7, 'Ai biết chỗ sửa xe uy tín không?', 'PRIVATE', '2025-11-07 16:00:00', 8),
                                                                   (8, 'Mình mới mua điện thoại mới!', 'PUBLIC', '2025-11-08 17:00:00', 9),
                                                                   (9, 'Học online mệt quá', 'PRIVATE', '2025-11-09 18:00:00', 10),
                                                                   (10, 'Admin test hệ thống', 'PUBLIC', '2025-11-10 19:00:00', 1)
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- =====================================================
-- 4. postmedia (Tăng cường lên 10 bản ghi)
-- =====================================================
INSERT INTO postmedia (id, url, type, post_id) VALUES
                                                   (1, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'IMAGE', 1),
                                                   (2, 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80', 'VIDEO', 2),
                                                   (3, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', 'IMAGE', 3),
                                                   (4, 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80', 'IMAGE', 4),
                                                   (5, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80', 'IMAGE', 5),
                                                   (6, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', 'IMAGE', 6),
                                                   (7, 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', 'IMAGE', 7),
                                                   (8, 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80', 'VIDEO', 8),
                                                   (9, 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80', 'IMAGE', 9),
                                                   (10, 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?w=800&q=80', 'IMAGE', 10),
                                                   (11, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', 'IMAGE', 1),
                                                   (12, 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80', 'IMAGE', 2),
                                                   (13, 'https://images.unsplash.com/photo-1510784722466-f2aa9c52fff6?w=800&q=80', 'IMAGE', 3),
                                                   (14, 'https://picsum.photos/800/600?random=1', 'IMAGE', 4),
                                                   (15, 'https://picsum.photos/800/600?random=2', 'IMAGE', 5),
                                                   (16, 'https://picsum.photos/800/600?random=3', 'IMAGE', 6),
                                                   (17, 'https://picsum.photos/800/600?random=4', 'IMAGE', 7),
                                                   (18, 'https://picsum.photos/800/600?random=5', 'IMAGE', 8),
                                                   (19, 'https://picsum.photos/800/600?random=6', 'IMAGE', 9),
                                                   (20, 'https://picsum.photos/800/600?random=7', 'IMAGE', 10)
ON DUPLICATE KEY UPDATE url = VALUES(url);

-- =====================================================
-- 5. comment (Đã có 10 bản ghi)
-- =====================================================
INSERT INTO comment (id, content, createdAt, post_id, user_id, parent_comment_id) VALUES
                                                                                      (1, 'Chào bạn! Mình cũng mới', '2025-11-01 10:05:00', 1, 3, NULL),
                                                                                      (2, 'Trời đẹp thật!', '2025-11-02 11:10:00', 2, 4, NULL),
                                                                                      (3, 'Mình đi được!', '2025-11-03 12:15:00', 3, 5, NULL),
                                                                                      (4, 'Phim gì vậy bạn?', '2025-11-04 13:20:00', 4, 6, NULL),
                                                                                      (5, 'Quán nào vậy?', '2025-11-05 14:25:00', 5, 7, NULL),
                                                                                      (6, 'Mình biết chỗ tốt', '2025-11-07 16:30:00', 7, 9, NULL),
                                                                                      (7, 'Điện thoại gì?', '2025-11-08 17:35:00', 8, 10, NULL),
                                                                                      (8, 'Cố lên bạn!', '2025-11-09 18:40:00', 9, 2, NULL),
                                                                                      (9, 'Test comment admin', '2025-11-10 19:45:00', 10, 1, NULL),
                                                                                      (10, 'Reply comment', '2025-11-10 19:50:00', 10, 3, 9)
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- =====================================================
-- 6. postreaction (Đã có 10 bản ghi)
-- =====================================================
INSERT INTO postreaction (id, createdAt, post_id, user_id) VALUES
                                                               (1, '2025-11-01 10:10:00', 1, 4),
                                                               (2, '2025-11-02 11:15:00', 2, 5),
                                                               (3, '2025-11-03 12:20:00', 3, 6),
                                                               (4, '2025-11-04 13:25:00', 4, 7),
                                                               (5, '2025-11-05 14:30:00', 5, 8),
                                                               (6, '2025-11-06 15:35:00', 6, 9),
                                                               (7, '2025-11-07 16:40:00', 7, 10),
                                                               (8, '2025-11-08 17:45:00', 8, 2),
                                                               (9, '2025-11-09 18:50:00', 9, 3),
                                                               (10, '2025-11-10 19:55:00', 10, 4)
ON DUPLICATE KEY UPDATE createdAt = VALUES(createdAt);

-- =====================================================
-- 7. commentreaction (Tăng cường lên 10 bản ghi)
-- =====================================================
INSERT INTO commentreaction (id, createdAt, comment_id, user_id) VALUES
                                                                     (1, '2025-11-01 10:15:00', 1, 2),
                                                                     (2, '2025-11-02 11:20:00', 2, 3),
                                                                     (3, '2025-11-03 12:25:00', 3, 4),
                                                                     (4, '2025-11-04 13:30:00', 4, 5),
                                                                     (5, '2025-11-05 14:35:00', 5, 6),
                                                                     (6, '2025-11-07 16:35:00', 6, 7),
                                                                     (7, '2025-11-08 17:40:00', 7, 8),
                                                                     (8, '2025-11-09 18:45:00', 8, 9),
                                                                     (9, '2025-11-10 19:50:00', 9, 10),
                                                                     (10, '2025-11-10 19:55:00', 10, 1)
ON DUPLICATE KEY UPDATE createdAt = VALUES(createdAt);

-- =====================================================
-- 8. CONVERSATIONS (Đã có 4 bản ghi - Không tăng thêm)
-- =====================================================
INSERT INTO conversations (id, type, title, avatarUrl, createdBy, createdAt, lastMessageAt, isPublic) VALUES
                                                                                                          (1, 'PRIVATE', NULL, NULL, 2, '2025-11-01 09:00:00', '2025-11-11 08:05:00', FALSE), -- An(2) - Bình(3)
                                                                                                          (2, 'PRIVATE', NULL, NULL, 4, '2025-11-02 10:00:00', '2025-11-11 07:45:00', FALSE), -- Chi(4) - Dũng(5)
                                                                                                          (3, 'GROUP', 'Nhóm bạn thân', 'https://i.pravatar.cc/150?img=11', 4, '2025-11-03 11:00:00', '2025-11-11 08:41:00', TRUE), -- Group 1
                                                                                                          (4, 'GROUP', 'Dự án ABC', 'https://i.pravatar.cc/150?img=12', 1, '2025-11-04 12:00:00', '2025-11-11 08:20:00', FALSE) -- Group 2
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- =====================================================
-- 9. CONVERSATION_MEMBERS (Đã có 12 bản ghi)
-- =====================================================
INSERT INTO conversation_members (id, conversationId, userId, role, muteUntil) VALUES
                                                                                   (1, 1, 2, 'MEMBER', NULL),
                                                                                   (2, 1, 3, 'MEMBER', NULL), -- Conversation 1: 2, 3
                                                                                   (3, 2, 4, 'MEMBER', NULL),
                                                                                   (4, 2, 5, 'MEMBER', NULL), -- Conversation 2: 4, 5
                                                                                   (5, 3, 2, 'ADMIN', NULL),
                                                                                   (6, 3, 3, 'MEMBER', NULL),
                                                                                   (7, 3, 4, 'MEMBER', NULL),
                                                                                   (8, 3, 5, 'MEMBER', NULL),
                                                                                   (9, 3, 6, 'MEMBER', NULL), -- Conversation 3: 2, 3, 4, 5, 6
                                                                                   (10, 4, 1, 'OWNER', NULL),
                                                                                   (11, 4, 7, 'ADMIN', NULL),
                                                                                   (12, 4, 8, 'MEMBER', NULL), -- Conversation 4: 1, 7, 8
                                                                                   (13, 4, 9, 'MEMBER', NULL), -- Thêm thành viên cho Group 4
                                                                                   (14, 4, 10, 'MEMBER', NULL), -- Thêm thành viên cho Group 4
                                                                                   (15, 3, 7, 'MEMBER', NULL) -- Thêm thành viên cho Group 3
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- =====================================================
-- 10. MESSAGES (Đã có 50 bản ghi)
-- =====================================================
-- Dữ liệu này đã đủ số lượng, không cần tăng thêm.
INSERT INTO messages (id, conversationId, senderId, type, content, metadata, createdAt, editedAt, deleted, replyToId) VALUES
                                                                                                                          (1, 1, 2, 'TEXT', 'Chào bạn!', NULL, '2025-11-10 18:00:00', NULL, FALSE, NULL),
                                                                                                                          (2, 1, 3, 'TEXT', 'Chào!', NULL, '2025-11-10 18:01:00', NULL, FALSE, 1),
                                                                                                                          (3, 1, 2, 'TEXT', 'Bạn khỏe không?', NULL, '2025-11-10 18:02:00', NULL, FALSE, 2),
                                                                                                                          (4, 1, 3, 'TEXT', 'Mình ổn, cảm ơn!', NULL, '2025-11-10 18:03:00', NULL, FALSE, 3),
                                                                                                                          (5, 2, 4, 'TEXT', 'Sắp họp rồi mọi người', NULL, '2025-11-10 18:10:00', NULL, FALSE, NULL),
                                                                                                                          (6, 2, 4, 'TEXT', 'Ai tham gia thì phản hồi', NULL, '2025-11-10 18:12:00', NULL, FALSE, 5),
                                                                                                                          (7, 1, 2, 'IMAGE', '[image]', NULL, '2025-11-11 08:02:00', NULL, FALSE, NULL), -- Đã sửa senderId từ 5 -> 2
                                                                                                                          (8, 3, 6, 'TEXT', 'Chào cả nhóm!', NULL, '2025-11-03 11:05:00', NULL, FALSE, NULL),
                                                                                                                          (9, 3, 7, 'TEXT', 'Có ai đi cafe không?', NULL, '2025-11-03 11:07:00', NULL, FALSE, 8),
                                                                                                                          (10, 3, 8, 'TEXT', 'Tính đi tối nay', NULL, '2025-11-03 11:10:00', NULL, FALSE, 9),
                                                                                                                          (11, 4, 1, 'TEXT', 'Bắt đầu cuộc họp', NULL, '2025-11-04 12:05:00', NULL, FALSE, NULL),
                                                                                                                          (12, 4, 7, 'TEXT', 'OK, tôi có mặt', NULL, '2025-11-04 12:06:00', NULL, FALSE, 11),
                                                                                                                          (13, 1, 2, 'TEXT', 'Ai ở gần đây không?', NULL, '2025-11-05 09:00:00', NULL, FALSE, NULL),
                                                                                                                          (14, 1, 3, 'TEXT', 'Mình ở Q1', NULL, '2025-11-05 09:02:00', NULL, FALSE, 13),
                                                                                                                          (15, 2, 4, 'TEXT', 'Sao hôm qua tắt máy rồi?', NULL, '2025-11-06 14:00:00', NULL, FALSE, NULL), -- Đã sửa senderId từ 5 -> 4
                                                                                                                          (16, 2, 5, 'TEXT', 'Mạng lag quá', NULL, '2025-11-06 14:05:00', NULL, FALSE, 15), -- Đã sửa senderId từ 6 -> 5
                                                                                                                          (17, 3, 4, 'TEXT', 'Ai đi phượt thì báo mình', NULL, '2025-11-06 15:10:00', NULL, FALSE, NULL),
                                                                                                                          (18, 3, 7, 'TEXT', 'Mình tham gia được', NULL, '2025-11-06 15:12:00', NULL, FALSE, 17),
                                                                                                                          (19, 1, 2, 'TEXT', 'Có ai biết chỗ sửa xe không?', NULL, '2025-11-07 16:00:00', NULL, FALSE, NULL), -- Đã sửa senderId từ 8 -> 2
                                                                                                                          (20, 1, 3, 'TEXT', 'Mình biết, để t gửi địa chỉ', NULL, '2025-11-07 16:05:00', NULL, FALSE, 19), -- Đã sửa senderId từ 9 -> 3
                                                                                                                          (21, 2, 4, 'TEXT', 'Mới mua điện thoại xịn', NULL, '2025-11-08 17:00:00', NULL, FALSE, NULL), -- Đã sửa senderId từ 10 -> 4
                                                                                                                          (22, 2, 5, 'TEXT', 'Model gì vậy?', NULL, '2025-11-08 17:02:00', NULL, FALSE, 21), -- Đã sửa senderId từ 9 -> 5
                                                                                                                          (23, 3, 6, 'TEXT', 'Học online mệt quá', NULL, '2025-11-09 18:00:00', NULL, FALSE, NULL),
                                                                                                                          (24, 3, 2, 'TEXT', 'Cố lên bạn!', NULL, '2025-11-09 18:05:00', NULL, FALSE, 23),
                                                                                                                          (25, 4, 1, 'TEXT', 'Admin test hệ thống', NULL, '2025-11-10 19:00:00', NULL, FALSE, NULL),
                                                                                                                          (26, 4, 1, 'TEXT', 'Check permissions', NULL, '2025-11-10 19:01:00', NULL, FALSE, 25),
                                                                                                                          (27, 1, 2, 'TEXT', 'Đã fix lỗi rồi', NULL, '2025-11-10 19:10:00', NULL, FALSE, NULL), -- Đã sửa senderId từ 4 -> 2
                                                                                                                          (28, 1, 3, 'TEXT', 'Cảm ơn bạn!', NULL, '2025-11-10 19:12:00', NULL, FALSE, 27),
                                                                                                                          (29, 2, 4, 'TEXT', 'Ai rảnh tối nay không?', NULL, '2025-11-10 19:20:00', NULL, FALSE, NULL), -- Đã sửa senderId từ 5 -> 4
                                                                                                                          (30, 2, 5, 'TEXT', 'Mình rảnh, tối gặp nhé', NULL, '2025-11-10 19:22:00', NULL, FALSE, 29), -- Đã sửa senderId từ 6 -> 5
                                                                                                                          (31, 3, 7, 'TEXT', 'Chuẩn bị tài liệu xong chưa?', NULL, '2025-11-10 20:00:00', NULL, FALSE, NULL),
                                                                                                                          (32, 3, 4, 'TEXT', 'Sắp xong rồi', NULL, '2025-11-10 20:05:00', NULL, FALSE, 31),
                                                                                                                          (33, 1, 2, 'TEXT', 'Ai có link không?', NULL, '2025-11-10 20:10:00', NULL, FALSE, NULL),
                                                                                                                          (34, 1, 3, 'TEXT', 'Mình gửi rồi đó', NULL, '2025-11-10 20:12:00', NULL, FALSE, 33),
                                                                                                                          (35, 4, 8, 'TEXT', 'Đã deploy lên staging', NULL, '2025-11-11 07:00:00', NULL, FALSE, NULL),
                                                                                                                          (36, 4, 1, 'TEXT', 'Tôi review rồi', NULL, '2025-11-11 07:10:00', NULL, FALSE, 35),
                                                                                                                          (37, 3, 6, 'TEXT', 'Sáng mai họp 9h', NULL, '2025-11-11 07:20:00', NULL, FALSE, NULL),
                                                                                                                          (38, 3, 2, 'TEXT', 'Ok tôi tham gia', NULL, '2025-11-11 07:25:00', NULL, FALSE, 37),
                                                                                                                          (39, 1, 2, 'TEXT', 'Ai muốn ăn sáng không?', NULL, '2025-11-11 07:30:00', NULL, FALSE, NULL), -- Đã sửa senderId từ 5 -> 2
                                                                                                                          (40, 1, 3, 'TEXT', 'Mình ăn phở nhé', NULL, '2025-11-11 07:35:00', NULL, FALSE, 39), -- Đã sửa senderId từ 6 -> 3
                                                                                                                          (41, 2, 4, 'TEXT', 'Sắp xếp bàn giao', NULL, '2025-11-11 07:40:00', NULL, FALSE, NULL), -- Đã sửa senderId từ 7 -> 4
                                                                                                                          (42, 2, 5, 'TEXT', 'Đã cập nhật task', NULL, '2025-11-11 07:45:00', NULL, FALSE, 41), -- Đã sửa senderId từ 8 -> 5
                                                                                                                          (43, 3, 9, 'TEXT', 'Ai lên kế hoạch du lịch?', NULL, '2025-11-11 07:50:00', NULL, FALSE, NULL),
                                                                                                                          (44, 3, 10, 'TEXT', 'Mình đề xuất lịch cuối tháng', NULL, '2025-11-11 07:55:00', NULL, FALSE, 43),
                                                                                                                          (45, 1, 2, 'TEXT', 'Reminder: gửi báo cáo', NULL, '2025-11-11 08:00:00', NULL, FALSE, NULL),
                                                                                                                          (46, 1, 3, 'TEXT', 'Đã nhận', NULL, '2025-11-11 08:05:00', NULL, FALSE, 45),
                                                                                                                          (47, 4, 1, 'TEXT', 'Tối họp online', NULL, '2025-11-11 08:10:00', NULL, FALSE, NULL),
                                                                                                                          (48, 4, 7, 'TEXT', 'Ok, note lại', NULL, '2025-11-11 08:20:00', NULL, FALSE, 47),
                                                                                                                          (49, 3, 4, 'TEXT', 'Sắp tới gặp mặt nhé', NULL, '2025-11-11 08:30:00', NULL, FALSE, NULL),
                                                                                                                          (50, 3, 4, 'TEXT', 'Tối vui nhé mọi người!', NULL, '2025-11-11 08:41:00', NULL, FALSE, NULL)
ON DUPLICATE KEY UPDATE content = VALUES(content);


-- =====================================================
-- 11. ATTACHMENTS (Tăng cường lên 10 bản ghi)
-- =====================================================
INSERT INTO attachments (id, messageId, ownerUserId, url, storageKey, mime, size, thumbUrl, metadata, createdAt) VALUES
                                                                                                                     (1, 7, 2, 'https://files.zalo.vn/img7_1.jpg', 'msg7_img1', 'image/jpeg', 256000, 'https://thumb.zalo.vn/img7_1_thumb.jpg', NULL, '2025-11-11 08:02:00'),
                                                                                                                     (2, 1, 2, 'https://files.zalo.vn/img1_1.jpg', 'msg1_img1', 'image/jpeg', 150000, 'https://thumb.zalo.vn/img1_1_thumb.jpg', NULL, '2025-11-10 18:00:30'),
                                                                                                                     (3, 8, 6, 'https://files.zalo.vn/img8_1.mp4', 'msg8_vid1', 'video/mp4', 5000000, 'https://thumb.zalo.vn/img8_1_thumb.jpg', NULL, '2025-11-03 11:05:30'),
                                                                                                                     (4, 11, 1, 'https://files.zalo.vn/doc11_1.pdf', 'msg11_doc1', 'application/pdf', 1024000, NULL, NULL, '2025-11-04 12:05:30'),
                                                                                                                     (5, 17, 4, 'https://files.zalo.vn/img17_1.jpg', 'msg17_img1', 'image/jpeg', 300000, 'https://thumb.zalo.vn/img17_1_thumb.jpg', NULL, '2025-11-06 15:10:30'),
                                                                                                                     (6, 21, 4, 'https://files.zalo.vn/img21_1.jpg', 'msg21_img1', 'image/jpeg', 450000, 'https://thumb.zalo.vn/img21_1_thumb.jpg', NULL, '2025-11-08 17:00:30'),
                                                                                                                     (7, 25, 1, 'https://files.zalo.vn/img25_1.jpg', 'msg25_img1', 'image/jpeg', 200000, 'https://thumb.zalo.vn/img25_1_thumb.jpg', NULL, '2025-11-10 19:00:30'),
                                                                                                                     (8, 35, 8, 'https://files.zalo.vn/doc35_1.zip', 'msg35_doc1', 'application/zip', 7000000, NULL, NULL, '2025-11-11 07:00:30'),
                                                                                                                     (9, 43, 9, 'https://files.zalo.vn/img43_1.jpg', 'msg43_img1', 'image/jpeg', 350000, 'https://thumb.zalo.vn/img43_1_thumb.jpg', NULL, '2025-11-11 07:50:30'),
                                                                                                                     (10, 50, 4, 'https://files.zalo.vn/img50_1.gif', 'msg50_gif1', 'image/gif', 50000, 'https://thumb.zalo.vn/img50_1_thumb.jpg', NULL, '2025-11-11 08:41:30')
ON DUPLICATE KEY UPDATE url = VALUES(url);

-- =====================================================
-- 12. MESSAGE_STATUSES (Tăng cường lên 10 bản ghi)
-- =====================================================
INSERT INTO message_statuses (id, messageId, userId, status, updatedAt) VALUES
                                                                            (1, 1, 3, 'READ', '2025-11-10 18:05:00'),
                                                                            (2, 2, 2, 'READ', '2025-11-10 18:06:00'),
                                                                            (3, 5, 5, 'READ', '2025-11-10 18:15:00'), -- Convo 2: 4 gửi, 5 đọc
                                                                            (4, 6, 5, 'READ', '2025-11-10 18:16:00'), -- Convo 2: 4 gửi, 5 đọc
                                                                            (5, 8, 2, 'READ', '2025-11-03 11:10:00'), -- Convo 3: 6 gửi, 2 đọc
                                                                            (6, 8, 3, 'READ', '2025-11-03 11:11:00'), -- Convo 3: 6 gửi, 3 đọc
                                                                            (7, 11, 7, 'READ', '2025-11-04 12:08:00'), -- Convo 4: 1 gửi, 7 đọc
                                                                            (8, 11, 8, 'READ', '2025-11-04 12:09:00'), -- Convo 4: 1 gửi, 8 đọc
                                                                            (9, 35, 1, 'READ', '2025-11-11 07:05:00'), -- Convo 4: 8 gửi, 1 đọc
                                                                            (10, 47, 7, 'READ', '2025-11-11 08:15:00') -- Convo 4: 1 gửi, 7 đọc
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- =====================================================
-- 13. MESSAGE_REACTIONS (Tăng cường lên 10 bản ghi)
-- =====================================================
INSERT INTO message_reactions (id, messageId, userId, reaction, reactedAt) VALUES
                                                                               (1, 2, 2, 'LIKE', '2025-11-10 18:10:00'), -- 2 Like tin nhắn của 3
                                                                               (2, 4, 2, 'LOVE', '2025-11-10 18:15:00'), -- 2 Love tin nhắn của 3
                                                                               (3, 12, 1, 'HAHA', '2025-11-04 12:10:00'), -- 1 Haha tin nhắn của 7
                                                                               (4, 18, 4, 'WOW', '2025-11-06 15:15:00'), -- 4 Wow tin nhắn của 7
                                                                               (5, 20, 2, 'LIKE', '2025-11-07 16:10:00'), -- 2 Like tin nhắn của 3
                                                                               (6, 22, 4, 'LOVE', '2025-11-08 17:05:00'), -- 4 Love tin nhắn của 5
                                                                               (7, 30, 4, 'LIKE', '2025-11-10 19:25:00'), -- 4 Like tin nhắn của 5
                                                                               (8, 36, 7, 'HAHA', '2025-11-11 07:15:00'), -- 7 Haha tin nhắn của 1
                                                                               (9, 38, 6, 'LIKE', '2025-11-11 07:30:00'), -- 6 Like tin nhắn của 2
                                                                               (10, 46, 2, 'SAD', '2025-11-11 08:10:00') -- 2 Sad tin nhắn của 3
ON DUPLICATE KEY UPDATE reaction = VALUES(reaction);

-- =====================================================
-- 14. FRIENDS (Tăng cường lên 10 cặp (20 bản ghi))
-- =====================================================
INSERT INTO friends (id, userId, friendId, since) VALUES
                                                      (1, 2, 3, '2025-01-15 10:00:00'), -- An(2) - Bình(3)
                                                      (2, 3, 2, '2025-01-15 10:00:00'),
                                                      (3, 3, 1, '2025-02-20 12:30:00'), -- Bình(3) - Admin(1)
                                                      (4, 1, 3, '2025-02-20 12:30:00'),
                                                      (5, 3, 4, '2025-03-01 08:00:00'), -- Bình(3) - Chi(4)
                                                      (6, 4, 3, '2025-03-01 08:00:00'),
                                                      (7, 3, 5, '2025-04-10 15:45:00'), -- Bình(3) - Dũng(5)
                                                      (8, 5, 3, '2025-04-10 15:45:00'),
                                                      (9, 3, 6, '2025-05-05 11:15:00'), -- Bình(3) - Emily(6)
                                                      (10, 6, 3, '2025-05-05 11:15:00'),
                                                      (11, 3, 7, '2025-06-18 19:00:00'), -- Bình(3) - Frank(7)
                                                      (12, 7, 3, '2025-06-18 19:00:00'),
                                                      (13, 2, 4, '2025-07-01 09:30:00'), -- An(2) - Chi(4)
                                                      (14, 4, 2, '2025-07-01 09:30:00'),
                                                      (15, 5, 6, '2025-08-10 14:00:00'), -- Dũng(5) - Emily(6)
                                                      (16, 6, 5, '2025-08-10 14:00:00'),
                                                      (17, 7, 8, '2025-09-05 17:00:00'), -- Frank(7) - Grace(8)
                                                      (18, 8, 7, '2025-09-05 17:00:00'),
                                                      (19, 9, 10, '2025-10-20 20:00:00'), -- Huy(9) - Iris(10)
                                                      (20, 10, 9, '2025-10-20 20:00:00')
ON DUPLICATE KEY UPDATE since = VALUES(since);

-- =====================================================
-- 15. FRIEND_REQUESTS (Tăng cường lên 10 bản ghi)
-- =====================================================
INSERT INTO friend_requests (id, fromUserId, toUserId, message, createdAt) VALUES
                                                                               (1, 9, 2, 'Mình làm chung công ty', '2025-11-01 09:00:00'),
                                                                               (2, 10, 3, 'Chào bạn, làm quen nhé!', '2025-11-01 11:00:00'),
                                                                               (3, 1, 5, 'Admin muốn kết bạn', '2025-11-02 10:30:00'),
                                                                               (4, 6, 4, 'Gặp bạn ở quán cafe hôm trước', '2025-11-03 14:00:00'),
                                                                               (5, 7, 2, 'Bạn là bạn của Bình phải không?', '2025-11-04 16:30:00'),
                                                                               (6, 8, 1, 'Tôi là Grace, đồng nghiệp mới', '2025-11-05 18:00:00'),
                                                                               (7, 4, 9, 'Tôi là Chi, muốn kết bạn', '2025-11-06 09:00:00'),
                                                                               (8, 5, 10, 'Nhận thấy bạn qua nhóm chung', '2025-11-07 11:30:00'),
                                                                               (9, 2, 7, 'An muốn kết bạn với Frank', '2025-11-08 15:00:00'),
                                                                               (10, 3, 8, 'Bình muốn làm quen với Grace', '2025-11-09 17:30:00')
ON DUPLICATE KEY UPDATE message = VALUES(message);

-- =====================================================
-- 16. IN-APP NOTIFICATIONS (Thêm dữ liệu mẫu phục vụ frontend)
-- =====================================================
-- Lưu ý: cột userId trỏ tới bảng users.id; type theo enum NotificationType
INSERT INTO in_app_notifications (id, userId, type, referenceId, payload, seen, createdAt) VALUES
  -- An (2) nhận lời mời kết bạn từ Huy (9)
  (1, 2, 'FRIEND_REQUEST_RECEIVED', '1', 'Huy Trương đã gửi cho bạn một lời mời kết bạn.', FALSE, '2025-11-08 09:10:00'),
  -- Bình (3) nhận thông báo bài viết mới của Chi (4)
  (2, 3, 'NEW_POST', '3', 'Chi Phạm vừa đăng một bài viết mới.', FALSE, '2025-11-09 08:00:00'),
  -- Chi (4) nhận tin nhắn mới trong hội thoại 2 từ Dũng (5)
  (3, 4, 'NEW_MESSAGE', '15', 'Dũng Hồ đã gửi một tin nhắn mới.', TRUE, '2025-11-10 14:00:30'),
  -- Dũng (5) được chấp nhận lời mời từ Admin (1)
  (4, 5, 'FRIEND_REQUEST_ACCEPTED', '3', 'Admin Zalo đã chấp nhận lời mời kết bạn của bạn.', FALSE, '2025-11-10 20:00:00'),
  -- Emily (6) nhận thông báo hệ thống
  (5, 6, 'SYSTEM', NULL, 'Hệ thống sẽ bảo trì vào 00:00 hôm nay.', TRUE, '2025-11-10 21:30:00'),
  -- Frank (7) nhận bài viết mới từ Grace (8)
  (6, 7, 'NEW_POST', '8', 'Grace Ngô vừa đăng một bài viết mới.', FALSE, '2025-11-11 07:10:00'),
  -- Grace (8) nhận tin nhắn mới trong nhóm 4 từ Admin (1)
  (7, 8, 'NEW_MESSAGE', '47', 'Admin Zalo đã gửi một tin nhắn mới.', FALSE, '2025-11-11 08:10:10'),
  -- Huy (9) nhận phản hồi kết bạn bị từ chối từ Chi (4) (minh họa SYSTEM)
  (8, 9, 'SYSTEM', '7', 'Chi Phạm đã từ chối lời mời kết bạn của bạn.', TRUE, '2025-11-11 08:20:00'),
  -- Iris (10) nhận lời mời kết bạn từ Dũng (5)
  (9, 10, 'FRIEND_REQUEST_RECEIVED', '8', 'Dũng Hồ đã gửi cho bạn một lời mời kết bạn.', FALSE, '2025-11-11 08:25:00'),
  -- An (2) nhận tin nhắn mới từ Bình (3) trong hội thoại 1
  (10, 2, 'NEW_MESSAGE', '46', 'Bình Nguyễn đã gửi một tin nhắn mới.', FALSE, '2025-11-11 08:05:05')
ON DUPLICATE KEY UPDATE payload = VALUES(payload), seen = VALUES(seen), createdAt = VALUES(createdAt);