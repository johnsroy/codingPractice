/**
 * Tab bar layout — 5 tabs, role-aware labels.
 *
 * Teachers see "Dashboard" (their stats) instead of a browse-centric Home.
 * Tab icons are large (26 pt) for both seniors and children.
 */

import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Text } from 'react-native';
import { useAuth } from '../../src/lib/auth';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { Colors, FontSize } from '../../src/components/theme';

/** Simple emoji icon component — avoids a vector-icon dependency. */
function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 22 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  // Not logged in — send back to auth flow.
  if (!user) return <Redirect href="/(auth)/welcome" />;

  const isTeacher = user.role === 'TEACHER';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: '600' },
        tabBarStyle: {
          borderTopColor: Colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        headerShown: false,
      }}
    >
      {/* Tab 1: Home / Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: isTeacher ? 'Dashboard' : 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={focused ? '🏠' : '🏡'} />
          ),
          tabBarAccessibilityLabel: isTeacher ? 'Teacher dashboard' : 'Home',
        }}
      />

      {/* Tab 2: Browse */}
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={focused ? '🔍' : '🔎'} />
          ),
          tabBarAccessibilityLabel: 'Browse teachers and courses',
        }}
      />

      {/* Tab 3: My Classes */}
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={focused ? '📅' : '🗓️'} />
          ),
          tabBarAccessibilityLabel: 'My classes and sessions',
        }}
      />

      {/* Tab 4: AI Tutor */}
      <Tabs.Screen
        name="tutor"
        options={{
          title: 'AI Tutor',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={focused ? '🤖' : '💬'} />
          ),
          tabBarAccessibilityLabel: 'AI tutor chat',
        }}
      />

      {/* Tab 5: Account */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={focused ? '👤' : '🧑'} />
          ),
          tabBarAccessibilityLabel: 'My account and subscription',
        }}
      />
    </Tabs>
  );
}
