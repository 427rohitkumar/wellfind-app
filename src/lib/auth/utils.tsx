import { getItem, removeItem, setItem } from '@/lib/storage';

const TOKEN = 'token';
const USER = 'auth-user';

export type UserRole = 'super_admin' | 'admin' | 'teacher';

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole | string;
  status?: string;
};

export type TokenType = {
  access: string;
  refresh?: string;
};

export const getToken = () => getItem<TokenType>(TOKEN);
export const removeToken = () => removeItem(TOKEN);
export const setToken = (value: TokenType) => setItem<TokenType>(TOKEN, value);

export const getStoredUser = () => getItem<AuthUser>(USER);
export const setStoredUser = (value: AuthUser) => setItem<AuthUser>(USER, value);
export const removeStoredUser = () => removeItem(USER);

export function isAdminRole(role?: string | null) {
  return role === 'super_admin' || role === 'admin';
}
