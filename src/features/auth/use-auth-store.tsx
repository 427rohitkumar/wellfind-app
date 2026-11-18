import type { AuthUser, TokenType } from '@/lib/auth/utils';

import { create } from 'zustand';
import {
  getStoredUser,
  getToken,
  removeStoredUser,
  removeToken,
  setStoredUser,
  setToken,
} from '@/lib/auth/utils';
import { createSelectors } from '@/lib/utils';

type AuthState = {
  token: TokenType | null;
  user: AuthUser | null;
  status: 'idle' | 'signOut' | 'signIn';
  signIn: (data: TokenType, user: AuthUser) => void;
  signOut: () => void;
  hydrate: () => void;
};

const _useAuthStore = create<AuthState>((set, get) => ({
  status: 'idle',
  token: null,
  user: null,
  signIn: (token, user) => {
    setToken(token);
    setStoredUser(user);
    set({ status: 'signIn', token, user });
  },
  signOut: () => {
    removeToken();
    removeStoredUser();
    set({ status: 'signOut', token: null, user: null });
  },
  hydrate: () => {
    try {
      const userToken = getToken();
      const user = getStoredUser();
      if (userToken !== null && user !== null) {
        set({ status: 'signIn', token: userToken, user });
      }
      else {
        get().signOut();
      }
    }
    catch (e) {
      console.error(e);
      get().signOut();
    }
  },
}));

export const useAuthStore = createSelectors(_useAuthStore);

export const signOut = () => _useAuthStore.getState().signOut();
export function signIn(token: TokenType, user: AuthUser) {
  return _useAuthStore.getState().signIn(token, user);
}
export const hydrateAuth = () => _useAuthStore.getState().hydrate();
export const getAuthState = () => _useAuthStore.getState();
