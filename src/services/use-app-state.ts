import { useSyncExternalStore } from 'react';
import { loadAppState, subscribeToAppState } from './storage';

export function useAppState() {
  return useSyncExternalStore(subscribeToAppState, loadAppState, loadAppState);
}
