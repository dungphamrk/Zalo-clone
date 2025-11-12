# Tóm tắt các thay đổi Backend

## Tổng quan
Tài liệu này mô tả các endpoint và chức năng mới đã được implement trong backend để hỗ trợ tích hợp với front-end.

## Các endpoint mới đã implement

### 1. Authentication - Refresh Token ✅

#### `POST /api/v1/auth/refresh`
**Mô tả:** Làm mới access token bằng refresh token

**Request:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "statusCode": 200,
  "data": {
    "items": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  }
}
```

**Files đã thay đổi:**
- `JwtProvider.java` - Thêm `generateRefreshToken()` và `validateRefreshToken()`
- `AuthService.java` - Thêm `refreshToken()` method và cập nhật `login()` để generate refresh token thực sự
- `IAuthService.java` - Thêm interface method
- `AuthController.java` - Thêm endpoint `/refresh`
- `RefreshTokenRequest.java` - DTO mới
- `RefreshTokenResponse.java` - DTO mới
- `JwtResponse.java` - Xóa hardcode refreshToken

### 2. Conversations ✅

#### `GET /api/v1/conversations`
**Mô tả:** Lấy danh sách tất cả conversations của user hiện tại, sắp xếp theo lastMessageAt

**Response:**
```json
{
  "success": true,
  "message": "Get conversations successfully",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "type": "PRIVATE",
        "title": "1_2",
        "avatarUrl": null,
        "creatorId": 1,
        "createdAt": "2024-01-01T12:00:00",
        "lastMessageAt": "2024-01-01T13:00:00",
        "members": [...]
      }
    ]
  }
}
```

#### `GET /api/v1/conversations/{conversationId}`
**Mô tả:** Lấy chi tiết một conversation (chỉ nếu user là member)

**Response:**
```json
{
  "success": true,
  "message": "Get conversation successfully",
  "statusCode": 200,
  "data": {
    "items": {
      "id": 1,
      "type": "PRIVATE",
      "title": "1_2",
      "members": [...]
    }
  }
}
```

**Files đã thay đổi:**
- `IConversationMemberRepository.java` - Thêm `findByUser()`
- `IConversationService.java` - Thêm `getConversationsByUser()` và `getConversationById()`
- `ConversationService.java` - Implement các method mới
- `ConversationController.java` - Thêm 2 endpoints mới và cập nhật response format

### 3. Users/Profile ✅

#### `GET /api/v1/users/me`
**Mô tả:** Lấy thông tin profile của user hiện tại

**Response:**
```json
{
  "success": true,
  "message": "Get profile successfully",
  "statusCode": 200,
  "data": {
    "items": {
      "id": 1,
      "username": "user123",
      "email": "user@example.com",
      "status": "ACTIVE",
      "profile": {
        "displayName": "User Name",
        "avatarUrl": "https://...",
        "gender": "MALE",
        "birthday": "2000-01-01"
      }
    }
  }
}
```

#### `POST /api/v1/users/me/avatar`
**Mô tả:** Upload avatar cho user hiện tại (sử dụng Cloudinary)

**Request:** multipart/form-data với field `avatar`

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "statusCode": 200,
  "data": {
    "items": {
      "avatarUrl": "https://res.cloudinary.com/...",
      "displayName": "User Name",
      "gender": "MALE",
      "birthday": "2000-01-01"
    }
  }
}
```

**Files đã thay đổi:**
- `IUserService.java` - Thêm `getCurrentUserProfile()` và `uploadAvatar()`
- `UserService.java` - Implement các method mới
- `UserController.java` - Thêm 2 endpoints mới

### 4. Stories ✅

#### `GET /api/v1/stories`
**Mô tả:** Lấy danh sách stories active (chưa hết hạn) của bạn bè và user hiện tại

**Response:**
```json
{
  "success": true,
  "message": "Get stories successfully",
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 1,
        "userName": "User Name",
        "userAvatar": "https://...",
        "mediaUrl": "https://...",
        "mediaType": "image",
        "createdAt": "2024-01-01T12:00:00",
        "expiresAt": "2024-01-02T12:00:00",
        "isViewed": false
      }
    ]
  }
}
```

**Files đã tạo mới:**
- `Story.java` - Entity mới
- `StoryResponse.java` - DTO mới
- `IStoryRepository.java` - Repository mới
- `StoryController.java` - Controller mới

### 5. Comments - Replies ✅

#### `POST /api/v1/comments/{commentId}/replies`
**Mô tả:** Thêm reply cho một comment

**Request:**
```json
{
  "content": "Reply content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Trả lời bình luận thành công",
  "statusCode": 201,
  "data": {
    "items": {
      "id": 123,
      "content": "Reply content",
      "user": {...},
      "createdAt": "2024-01-01T12:00:00",
      "parentId": 1,
      "replyToUsername": "user123"
    }
  }
}
```

**Files đã thay đổi:**
- `ICommentService.java` - Thêm `createReply()`
- `CommentServiceImpl.java` - Implement `createReply()`
- `CommentController.java` - Thêm endpoint mới
- `ReplyRequest.java` - DTO mới

## Cải thiện Refresh Token

### Trước đây:
- `JwtResponse.refreshToken` được hardcode = "123456789"
- Không có endpoint refresh token

### Bây giờ:
- ✅ Generate refresh token thực sự với JWT (có type="refresh")
- ✅ Refresh token có thời gian hết hạn riêng (24 giờ)
- ✅ Validate refresh token với tokenVersion
- ✅ Endpoint `/auth/refresh` hoạt động đầy đủ
- ✅ Login response trả về refresh token thực sự

## Cấu trúc Response

Tất cả endpoints mới đều trả về format `APIResponse<T>`:

```json
{
  "success": boolean,
  "message": string,
  "statusCode": number,
  "data": {
    "items": T  // T có thể là object hoặc array
  } | null,
  "errors": ErrorDetail[] | null,
  "timestamp": string
}
```

## Database Changes

### Story Table (mới)
Cần tạo migration hoặc để JPA tự tạo table `stories`:
- `id` (Long, PK)
- `user_id` (Long, FK to users)
- `media_url` (String)
- `media_type` (String)
- `created_at` (LocalDateTime)
- `expires_at` (LocalDateTime)
- `is_active` (Boolean)

## Testing Checklist

- [ ] Test POST /auth/refresh với valid refresh token
- [ ] Test POST /auth/refresh với invalid/expired refresh token
- [ ] Test GET /conversations - lấy danh sách conversations
- [ ] Test GET /conversations/{id} - lấy chi tiết conversation
- [ ] Test GET /conversations/{id} với user không phải member (should fail)
- [ ] Test GET /users/me - lấy profile hiện tại
- [ ] Test POST /users/me/avatar - upload avatar
- [ ] Test GET /stories - lấy danh sách stories
- [ ] Test POST /comments/{commentId}/replies - thêm reply
- [ ] Test login và verify refresh token được generate đúng

## Notes

1. **Story Entity**: Đã tạo entity mới nhưng chưa có endpoint để tạo story. Có thể thêm sau nếu cần.

2. **Conversation Sorting**: Conversations được sort theo `lastMessageAt` descending (mới nhất trước).

3. **Avatar Upload**: Sử dụng Cloudinary service đã có sẵn trong project.

4. **Refresh Token**: Refresh token được validate với tokenVersion để đảm bảo security (khi logout, tokenVersion tăng lên làm invalidate tất cả tokens cũ).

5. **Response Format**: Tất cả endpoints đều trả về `APIResponse<T>` format để nhất quán với front-end.

