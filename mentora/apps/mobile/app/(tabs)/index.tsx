/**
 * Home / Dashboard tab.
 *
 * Students: upcoming sessions, recently enrolled courses, and a quick
 *           AI tutor prompt.
 * Teachers: their upcoming sessions to run, quick stats strip.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { ClassSession, Course } from '@mentora/shared';
import { useAuth } from '../../src/lib/auth';
import { sessionsApi, coursesApi } from '../../src/lib/api';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Heading, AppText } from '../../src/components/Typography';
import { Avatar } from '../../src/components/Avatar';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { EmptyState } from '../../src/components/EmptyState';
import { Badge } from '../../src/components/Badge';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/components/theme';
import { formatSessionTime } from '../../src/lib/utils';

export default function HomeScreen() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = user?.role === 'TEACHER';

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sessRes, courseRes] = await Promise.allSettled([
        sessionsApi.list(token, { mine: true, upcoming: true }),
        isTeacher ? Promise.resolve(null) : coursesApi.list(token, { page: 1 }),
      ]);
      if (sessRes.status === 'fulfilled') setSessions(sessRes.value.items.slice(0, 5));
      if (courseRes.status === 'fulfilled' && courseRes.value)
        setCourses(courseRes.value.items.slice(0, 4));
    } finally {
      setLoading(false);
    }
  }, [token, isTeacher]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner message="Loading…" />;

  const greeting = getGreeting();

  return (
    <Screen onRefresh={load} refreshing={loading}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Heading level={2}>{greeting}, {user?.name?.split(' ')[0] ?? 'there'}!</Heading>
          <AppText style={styles.headerSub}>
            {isTeacher ? 'Your teaching dashboard' : 'Your learning journey continues'}
          </AppText>
        </View>
        <Avatar name={user?.name ?? '?'} uri={user?.avatarUrl} size={48} />
      </View>

      {/* Upcoming sessions section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isTeacher ? 'Your upcoming sessions' : 'Upcoming classes'}
          </Text>
          <Button
            label="See all"
            onPress={() => router.push('/(tabs)/classes')}
            variant="ghost"
            size="sm"
          />
        </View>

        {sessions.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No upcoming sessions"
            description={
              isTeacher
                ? 'Create a session to start teaching.'
                : 'Browse courses to book your first class.'
            }
            actionLabel={isTeacher ? 'Create session' : 'Browse courses'}
            onAction={() =>
              router.push(isTeacher ? '/(tabs)/classes' : '/(tabs)/browse')
            }
          />
        ) : (
          sessions.map((s) => (
            <Card
              key={s.id}
              onPress={() => router.push(`/session/${s.id}`)}
              style={styles.sessionCard}
              accessibilityLabel={`${s.title}, ${formatSessionTime(s.startsAt)}`}
            >
              <View style={styles.sessionRow}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle} numberOfLines={1}>{s.title}</Text>
                  <Text style={styles.sessionTime}>{formatSessionTime(s.startsAt)}</Text>
                  <Text style={styles.sessionMeta}>
                    {s.durationMinutes} min · {s.kind === 'one_on_one' ? '1:1' : 'Group'}
                  </Text>
                </View>
                <Badge
                  label={s.status === 'live' ? 'LIVE' : 'Upcoming'}
                  color={s.status === 'live' ? 'green' : 'blue'}
                />
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Courses section (students only) */}
      {!isTeacher && courses.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue learning</Text>
            <Button
              label="See all"
              onPress={() => router.push('/(tabs)/browse')}
              variant="ghost"
              size="sm"
            />
          </View>
          {courses.map((c) => (
            <Card
              key={c.id}
              onPress={() => router.push(`/course/${c.id}`)}
              style={styles.courseCard}
              accessibilityLabel={c.title}
            >
              <Text style={styles.courseTitle} numberOfLines={2}>{c.title}</Text>
              {c.teacher && (
                <Text style={styles.courseTeacher}>
                  with {c.teacher.name}
                </Text>
              )}
            </Card>
          ))}
        </View>
      )}

      {/* Quick AI tutor CTA */}
      {!isTeacher && (
        <Card style={styles.aiCard}>
          <Text style={styles.aiTitle}>🤖 Ask the AI Tutor</Text>
          <AppText style={styles.aiDesc}>
            Stuck on homework? Get a plain-language explanation in seconds.
          </AppText>
          <Button
            label="Open AI Tutor"
            onPress={() => router.push('/(tabs)/tutor')}
            size="md"
            style={styles.aiBtn}
          />
        </Card>
      )}
    </Screen>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerText: { flex: 1, paddingRight: Spacing.sm },
  headerSub: { color: Colors.textSecondary, marginTop: 2 },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sessionCard: { marginBottom: Spacing.sm },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sessionInfo: { flex: 1, paddingRight: Spacing.sm },
  sessionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  sessionTime: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginTop: 2,
  },
  sessionMeta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  courseCard: { marginBottom: Spacing.sm },
  courseTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  courseTeacher: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  aiTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  aiDesc: { color: Colors.textSecondary, marginBottom: Spacing.md },
  aiBtn: { alignSelf: 'flex-start' },
});
