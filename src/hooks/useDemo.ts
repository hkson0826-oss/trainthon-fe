import { useSyncExternalStore } from 'react';
import { currentUser, getDemoState, subscribeDemo } from '@/services/demoStore';

export function useDemoState() {
  return useSyncExternalStore(subscribeDemo, getDemoState, getDemoState);
}

export function useCurrentUser() {
  useDemoState();
  return currentUser();
}
