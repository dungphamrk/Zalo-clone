# Configuration Guide

## Environment Variables

Tạo file `.env` trong thư mục gốc với nội dung:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Hoặc cho production:

```
EXPO_PUBLIC_API_URL=https://api.yourapp.com/api
```

## API Client Configuration

File `api/client.ts` đã được cấu hình sẵn:
- Tự động thêm Authorization header khi có token
- Handle errors tự động
- Support GET, POST, PUT, PATCH, DELETE

## Redux Store

Store đã được cấu hình với:
- `auth` slice: Quản lý authentication state
- `chat` slice: Quản lý chat state

Thêm slice mới trong `store/index.ts`:

```typescript
import myReducer from './slices/mySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    my: myReducer, // Thêm vào đây
  },
});
```

## TanStack Query

Query client đã được cấu hình với:
- Retry: 1 lần
- Stale time: 5 phút
- Tắt refetch on window focus

Sửa trong `providers/QueryProvider.tsx` nếu cần.

