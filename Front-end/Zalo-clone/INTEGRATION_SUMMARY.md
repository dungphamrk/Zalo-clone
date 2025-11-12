# Tóm tắt tích hợp Front-end và Backend

## Tổng quan
Tài liệu này mô tả các thay đổi đã thực hiện để tích hợp front-end (React Native/Expo) với backend (Spring Boot) và các vấn đề còn lại cần xử lý.

## Các thay đổi đã thực hiện

### 1. Response Format (`utils/response-data.ts`)
✅ **Đã cập nhật** để khớp với cấu trúc `APIResponse<T>` của backend:

```typescript
// Backend trả về:
{
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    items: T  // T có thể là object đơn hoặc array
  } | null;
  errors?: ErrorDetail[];
  timestamp?: string;
}
```

**Thay đổi:**
- Thêm interface `APIResponse<T>`, `DataResponse<T>`, `ErrorDetail`
- Cập nhật `SingleResponse<T>`, `ListResponse<T>`, `PaginationResponse<T>`
- Thêm `PageData<T>` cho Spring Page pagination

### 2. Chat Service (`services/chat/chat.service.ts`)
✅ **Đã cập nhật** để dùng endpoints `/conversations` thay vì `/chats`:

**Endpoints đã cập nhật:**
- `getMessages(conversationId, page, size)` → `GET /conversations/{id}/messages`
- `createOrGetPrivateChat(userId)` → `POST /conversations/private/{userId}`
- `createGroupChat(title, memberIds)` → `POST /conversations/group`

**Endpoints còn thiếu trong backend:**
- ❌ `GET /conversations` - Lấy danh sách tất cả conversations
- ❌ `GET /conversations/{id}` - Lấy chi tiết conversation
- ❌ `DELETE /conversations/{id}` - Xóa conversation

**Lưu ý:** Messages được gửi qua WebSocket (STOMP), không phải REST API.

### 3. Wall Service (`services/wall/wall.service.ts`)
✅ **Đã cập nhật** để dùng đúng endpoints của backend:

**Endpoints đã cập nhật:**
- `getMyPosts()` → `GET /posts/me`
- `getPostsByUser(userId)` → `GET /posts/other/{userId}`
- `getPostById(postId)` → `GET /posts/{postId}`
- `createPost(data)` → `POST /posts` (multipart/form-data)
- `toggleLikePost(postId)` → `POST /posts/{postId}/reaction`
- `addComment(postId, data)` → `POST /comments` (với postId trong body)
- `getCommentsByPostId(postId)` → `GET /comments/post/{postId}`

**Endpoints còn thiếu trong backend:**
- ❌ `GET /stories` - Lấy danh sách stories
- ❌ `POST /comments/{commentId}/replies` - Thêm reply cho comment

### 4. Profile Service (`services/profile/profile.service.ts`)
✅ **Đã cập nhật** để dùng đúng endpoints:

**Endpoints đã cập nhật:**
- `changePassword(data)` → `POST /users/change-password` (đổi từ PUT sang POST)
- `updateProfile(data)` → `PUT /users/me` (đổi từ multipart sang JSON)

**Endpoints còn thiếu trong backend:**
- ❌ `GET /users/me` hoặc `GET /users/profile` - Lấy thông tin profile hiện tại
- ❌ `POST /users/me/avatar` - Upload avatar riêng

**Lưu ý:** Thông tin profile hiện tại được trả về trong response login (`JwtResponse.user`).

### 5. Auth Service & Refresh Token
✅ **Đã cập nhật** hooks để xử lý response đúng cách:

**Thay đổi:**
- Cập nhật `useLogin` để truy cập `res.data.items` đúng cách
- Thêm null check cho response data

**Endpoints còn thiếu trong backend:**
- ❌ `POST /auth/refresh` - Refresh access token

**Lưu ý:** Hiện tại refresh token được hardcode trong `JwtResponse` (giá trị "123456789"). Cần implement logic refresh token thực sự.

### 6. Axios Instance (`utils/axios-instance.ts`)
✅ **Đã cập nhật** refresh token interceptor:

- Thêm TODO comment về endpoint refresh token chưa có
- Tạm thời disable refresh token functionality

## Các vấn đề đã được xử lý trong Backend ✅

### 1. Endpoints đã implement

#### Auth ✅
- ✅ `POST /api/v1/auth/refresh` - Refresh access token
  - Request: `{ refreshToken: string }`
  - Response: `APIResponse<{ accessToken: string, refreshToken: string }>`
  - **Đã implement:** JwtProvider.generateRefreshToken(), AuthService.refreshToken(), AuthController.handleRefresh()

#### Conversations ✅
- ✅ `GET /api/v1/conversations` - Lấy danh sách conversations của user hiện tại
  - Response: `APIResponse<List<ConversationResponse>>`
  - **Đã implement:** ConversationService.getConversationsByUser(), ConversationController.getConversations()
- ✅ `GET /api/v1/conversations/{id}` - Lấy chi tiết conversation
  - Response: `APIResponse<ConversationResponse>`
  - **Đã implement:** ConversationService.getConversationById(), ConversationController.getConversation()
- [ ] `DELETE /api/v1/conversations/{id}` - Xóa conversation (optional - chưa cần thiết)

#### Posts/Wall ✅
- ✅ `GET /api/v1/stories` - Lấy danh sách stories
  - Response: `APIResponse<List<StoryResponse>>`
  - **Đã implement:** Story entity, StoryRepository, StoryController.getStories()
- ✅ `POST /api/v1/comments/{commentId}/replies` - Thêm reply cho comment
  - Request: `{ content: string }`
  - Response: `APIResponse<CommentResponse>`
  - **Đã implement:** CommentService.createReply(), CommentController.createReply()

#### Users/Profile ✅
- ✅ `GET /api/v1/users/me` - Lấy thông tin profile hiện tại
  - Response: `APIResponse<UserResponse>`
  - **Đã implement:** UserService.getCurrentUserProfile(), UserController.getCurrentUserProfile()
- ✅ `POST /api/v1/users/me/avatar` - Upload avatar
  - Request: multipart/form-data với field `avatar`
  - Response: `APIResponse<UserProfileResponse>`
  - **Đã implement:** UserService.uploadAvatar(), UserController.uploadAvatar() (sử dụng Cloudinary)

### 2. Refresh Token ✅

- ✅ Generate refresh token thực sự trong `AuthService.login()`
- ✅ Implement refresh token logic trong `AuthService.refreshToken()`
- ✅ Thêm method `generateRefreshToken()` và `validateRefreshToken()` vào `JwtProvider`
- ✅ Thêm endpoint `/auth/refresh` trong `AuthController`

### 3. Pagination

Một số endpoints cần hỗ trợ pagination:
- [ ] `GET /posts` - Feed posts với pagination (hiện chỉ có `/posts/me` và `/posts/other/{userId}`)
- [ ] `GET /conversations` - Danh sách conversations với pagination

## Cấu trúc Response từ Backend

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "statusCode": 200,
  "data": {
    "items": <T>  // T có thể là object hoặc array
  },
  "errors": null,
  "timestamp": "2024-01-01 12:00:00"
}
```

### Paginated Response (Spring Page)
```json
{
  "success": true,
  "message": "Success",
  "statusCode": 200,
  "data": {
    "items": {
      "content": [...],
      "totalElements": 100,
      "totalPages": 10,
      "size": 10,
      "number": 0,
      "first": true,
      "last": false,
      "numberOfElements": 10,
      "empty": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "data": null,
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ],
  "timestamp": "2024-01-01 12:00:00"
}
```

## WebSocket/STOMP Configuration

Front-end đã được cấu hình để kết nối WebSocket:
- Endpoint: `ws://<BASE_URL>/ws?access_token=<token>`
- Topics: `/topic/chat/{conversationId}`
- App destinations: `/app/chat/{conversationId}`, `/app/chat.typing`, `/app/chat.read`

Backend WebSocket config đã có sẵn trong `WebSocketConfig.java`.

## Các file đã thay đổi

1. ✅ `utils/response-data.ts` - Cập nhật response interfaces
2. ✅ `services/chat/chat.service.ts` - Cập nhật endpoints
3. ✅ `services/wall/wall.service.ts` - Cập nhật endpoints
4. ✅ `services/profile/profile.service.ts` - Cập nhật endpoints
5. ✅ `hooks/auth/useAuth.ts` - Cập nhật xử lý response
6. ✅ `utils/axios-instance.ts` - Cập nhật refresh token logic

## Bước tiếp theo

1. ✅ **Backend:** Đã implement tất cả các endpoints còn thiếu
2. ✅ **Backend:** Đã implement refresh token logic thực sự
3. **Front-end:** Test các endpoints đã cập nhật
4. **Front-end:** Cập nhật UI components để sử dụng các service mới
5. **Database:** Tạo migration cho Story table (hoặc để JPA tự tạo)

## Lưu ý quan trọng

- ✅ Tất cả các service đã được cập nhật để match với backend endpoints
- ✅ Tất cả các endpoint front-end cần đã được implement trong backend
- ✅ Response format đã được chuẩn hóa để match với `APIResponse<T>` của backend
- ✅ WebSocket configuration đã sẵn sàng
- ✅ Refresh token đã được implement đầy đủ với validation

## Tóm tắt các thay đổi

### Front-end
- ✅ Cập nhật response format interfaces
- ✅ Cập nhật tất cả services để dùng đúng endpoints
- ✅ Cập nhật axios interceptor để dùng refresh token endpoint mới
- ✅ Cập nhật hooks để xử lý response đúng cách

### Backend
- ✅ Implement POST /auth/refresh
- ✅ Implement GET /conversations và GET /conversations/{id}
- ✅ Implement GET /users/me và POST /users/me/avatar
- ✅ Implement GET /stories
- ✅ Implement POST /comments/{commentId}/replies
- ✅ Cải thiện refresh token logic

Xem chi tiết trong `Back-end/ZaloClone-Server/BACKEND_CHANGES.md`

## Testing Checklist

- [ ] Test login/register với response format mới
- [ ] Test get messages từ conversation
- [ ] Test create private/group conversation
- [ ] Test get posts (own posts và other user posts)
- [ ] Test create post, like post, add comment
- [ ] Test get contacts/friends
- [ ] Test friend requests (send, accept, reject)
- [ ] Test WebSocket connection và message sending
- [ ] Test profile update
- [ ] Test change password

