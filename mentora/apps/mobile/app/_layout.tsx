/**
 * Root layout — mounts the AuthProvider and the Expo Router <Slot>.
 *
 * The AuthProvider wraps the entire app so every screen can call useAuth().
 * Navigation is driven by the (auth) and (tabs) route groups below.
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/lib/auth';
import { Colors } from '../src/components/theme';

// Keep splash visible until auth bootstrap completes.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Auth context handles its own loading; we just ensure the splash
    // is hidden once the JS bundle is ready.
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          {/* Auth group — shown to unauthenticated users */}
          <Stack.Screen name="(auth)" />
          {/* Main tab group — shown once logged in */}
          <Stack.Screen name="(tabs)" />
          {/* Detail screens pushed on top of tabs */}
          <Stack.Screen
            name="teacher/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Teacher Profile',
              headerBackTitle: 'Back',
              headerTintColor: Colors.primary,
            }}
          />
          <Stack.Screen
            name="course/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Course Details',
              headerBackTitle: 'Back',
              headerTintColor: Colors.primary,
            }}
          />
          <Stack.Screen
            name="session/[id]"
            options={{
              headerShown: true,
              headerTitle: 'Session',
              headerBackTitle: 'Back',
              headerTintColor: Colors.primary,
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
