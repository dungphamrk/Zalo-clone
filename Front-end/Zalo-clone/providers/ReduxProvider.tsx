import { store } from '@/store';
import React from 'react';
import { Provider } from 'react-redux';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}

