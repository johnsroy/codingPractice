/**
 * Screen — page-level wrapper providing safe-area insets, background colour,
 * and a consistent scroll container.
 *
 * Usage:
 *   <Screen scrollable>
 *     <Heading>My Page</Heading>
 *   </Screen>
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from './theme';

export interface ScreenProps {
  children: React.ReactNode;
  /** Wrap in ScrollView? Default true. */
  scrollable?: boolean;
  /** Called on pull-to-refresh. Only used when scrollable=true. */
  onRefresh?: () => void;
  refreshing?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Remove default horizontal padding. */
  noPadding?: boolean;
}

export function Screen({
  children,
  scrollable = true,
  onRefresh,
  refreshing = false,
  style,
  contentStyle,
  noPadding = false,
}: ScreenProps) {
  const inner = scrollable ? (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        !noPadding && styles.padded,
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, !noPadding && styles.padded, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {inner}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  padded: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
});
