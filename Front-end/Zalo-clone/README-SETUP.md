# Setup Guide - Redux Toolkit & TanStack Query

## ✅ Đã cài đặt thành công

Dự án đã được cấu hình với:
- ✅ Redux Toolkit (@reduxjs/toolkit)
- ✅ React Redux (react-redux)
- ✅ TanStack Query (@tanstack/react-query)

## 📁 Cấu trúc thư mục mới

```
store/
├── index.ts              # Redux store configuration
├── hooks.ts              # Typed hooks (useAppDispatch, useAppSelector)
└── slices/
    ├── authSlice.ts      # Authentication state management
    ├── chatSlice.ts      # Chat state management
    └── index.ts          # Export all slices

api/
├── client.ts             # API client với authentication
└── queries/
    ├── auth.ts           # Auth API hooks (login, register, logout)
    ├── chat.ts           # Chat API hooks (getChats, sendMessage)
    ├── contacts.ts       # Contacts API hooks
    └── index.ts          # Export all queries

providers/
├── ReduxProvider.tsx     # Redux Provider wrapper
└── QueryProvider.tsx     # TanStack Query Provider wrapper

types/
└── api.ts                # Common API types
```

## 🚀 Cách sử dụng

### 1. Redux Toolkit - State Management

#### Sử dụng trong component:

```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleLogin = () => {
    dispatch(loginSuccess({
      user: { id: '1', name: 'John', phone: '0912345678' },
      token: 'token-here'
    }));
  };

  return <View>...</View>;
}
```

### 2. TanStack Query - Server State

#### Fetch data:

```typescript
import { useChats } from '@/api/queries/chat';

function ChatList() {
  const { data: chats, isLoading, error } = useChats();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error: {error.message}</Text>;

  return <FlatList data={chats} ... />;
}
```

#### Mutations (POST/PUT/DELETE):

```typescript
import { useSendMessage } from '@/api/queries/chat';

function ChatInput({ chatId }) {
  const sendMessage = useSendMessage();

  const handleSend = () => {
    sendMessage.mutate(
      { chatId, text: 'Hello!' },
      {
        onSuccess: (data) => console.log('Sent:', data),
        onError: (error) => console.error('Error:', error),
      }
    );
  };

  return <Button onPress={handleSend} disabled={sendMessage.isPending} />;
}
```

### 3. Kết hợp Redux + TanStack Query

```typescript
import { useAppDispatch } from '@/store/hooks';
import { useLogin } from '@/api/queries/auth';
import { loginSuccess } from '@/store/slices/authSlice';

function LoginScreen() {
  const dispatch = useAppDispatch();
  const loginMutation = useLogin();

  const handleLogin = (phone: string, password: string) => {
    loginMutation.mutate(
      { phone, password },
      {
        onSuccess: (response) => {
          // Update Redux store
          dispatch(loginSuccess(response.data));
        },
      }
    );
  };
}
```

## 🔧 Cấu hình Backend

### 1. Tạo file .env

Copy `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Sau đó sửa URL trong `.env`:
```
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api
```

### 2. Backend API Format

Backend cần trả về format:

```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Optional message"
}
```

### 3. Authentication Token

Token được tự động thêm vào headers khi đã set:

```typescript
import { apiClient } from '@/api/client';
apiClient.setToken('your-token');
```

## 📚 Tài liệu tham khảo

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)

## 🎯 Next Steps

1. **Kết nối Backend**: Cập nhật `EXPO_PUBLIC_API_URL` trong `.env`
2. **Test API**: Sử dụng các hooks trong `api/queries/` để test kết nối
3. **Update Components**: Tích hợp Redux và TanStack Query vào các màn hình hiện có
4. **Add More Slices**: Tạo thêm slices cho các features khác (contacts, profile, etc.)

## 📝 Ví dụ

Xem file `examples/ReduxQueryExample.tsx` để xem ví dụ đầy đủ về cách sử dụng.

## ⚠️ Lưu ý

- Redux dùng cho **client state** (auth, UI state, preferences)
- TanStack Query dùng cho **server state** (API data, caching, sync)
- Kết hợp cả hai để có state management mạnh mẽ

