import Constants from 'expo-constants';

declare module 'expo-constants' {
  interface Constants {
    expoConfig: {
      extra: {
        apiBaseUrl: string;
      };
    };
  }
}