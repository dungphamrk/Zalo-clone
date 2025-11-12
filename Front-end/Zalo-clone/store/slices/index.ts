/**
 * Central export file for all slices
 * Import from here for cleaner imports
 * 
 * Note: To avoid naming conflicts, import directly from slice files
 * Example: import { loginSuccess } from '@/store/slices/authSlice'
 */

// Export types from interfaces (not from slices)
export type { User } from '@/types/interfaces/auth.interface';
export type { Chat, Message } from '@/types/interfaces/chat.interface';

// Export reducers (for store configuration)
export { default as authReducer } from './authSlice';
export { default as chatReducer } from './chatSlice';

