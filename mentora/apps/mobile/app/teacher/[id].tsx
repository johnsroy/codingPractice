/**
 * Teacher detail screen.
 *
 * Shows the teacher's full profile, subjects/grades, and their upcoming
 * sessions (both group and 1:1) so a student can book a coaching slot.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ClassSession, UserPublic } from '@mentora/shared';
import { SUBJECTS, GRADES } from '@mentora/shared';
import { useAuth } from '../../src/lib/auth';
import { usersApi, sessionsApi } from '../../src/lib/api';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Heading, AppText } from '../../src/components/Typography';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { StarRating } from '../../src/components/StarRating';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { EmptyState } from '../../src/components/EmptyState';
import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
} from '../../src/components/theme';
import { formatSessionTime, displayPrice } from '../../src/lib/utils';

export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [teacher, setTeacher] = useState<UserPublic | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        usersApi.getTeacher(token, id),
        // List upcoming sessions for this teacher.
        // The API supports filtering by mine=false; we filter client-side.
        sessionsApi.list(token, { upcoming: true }),
      ]);
      setTeacher(t);
      // Filter sessions taught by this teacher.
      setSessions(s.items.filter((sess) => sess.teacherId === id));
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner message="Loading profile…" />;
  if (!teacher) {
    return <EmptyState icon="🔍" title="Teacher not found" description="This profile could not be loaded." />;
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      {/* Hero */}
      <View style={styles.hero}>
        <Avatar name={teacher.name} uri={teacher.avatarUrl} size={80} />
        <View style={styles.heroText}>
          <Heading level={2}>{teacher.name}</Heading>
          {teacher.headline && <AppText style={styles.headline}>{teacher.headline}</AppText>}
          <View style={styles.heroMeta}>
            {teacher.rating != null && <StarRating rating={teacher.rating} />}
            {teacher.verified && <Badge label="Verified" color="green" />}
          </View>
        </View>
      </View>

      {/* Stats strip */}
      <View style={styles.statsRow}>
        {teacher.yearsExperience != null && (
          <StatBox value={`${teacher.yearsExperience}y`} label="Experience" />
        )}
        {teacher.hourlyRateCents != null && (
          <StatBox value={displayPrice(teacher.hourlyRateCents)} label="Per hour" />
        )}
        {teacher.subjects && teacher.subjects.length > 0 && (
          <StatBox value={String(teacher.subjects.length)} label="Subjects" />
        )}
      </View>

      {/* Bio */}
      {teacher.bio && (
        <View style={styles.section}>
          <Heading level={3}>About</Heading>
          <AppText style={styles.bio}>{teacher.bio}</AppText>
        </View>
      )}

      {/* Subjects */}
      {teacher.subjects && teacher.subjects.length > 0 && (
        <View style={styles.section}>
          <Heading level={3} style={styles.sectionTitle}>Subjects</Heading>
          <View style={styles.chipRow}>
            {teacher.subjects.map((sid) => {
              const s = SUBJECTS.find((x) => x.id === sid);
              return (
                <Badge
                  key={sid}
                  label={s ? `${s.emoji} ${s.label}` : sid}
                  color="blue"
                />
              );
            })}
          </View>
        </View>
      )}

      {/* Grades */}
      {teacher.grades && teacher.grades.length > 0 && (
        <View style={styles.section}>
          <Heading level={3} style={styles.sectionTitle}>Grade levels</Heading>
          <View style={styles.chipRow}>
            {teacher.grades.map((gid) => {
              const g = GRADES.find((x) => x.id === gid);
              return <Badge key={gid} label={g?.label ?? gid} color="amber" />;
            })}
          </View>
        </View>
      )}

      {/* Available sessions */}
      <View style={styles.section}>
        <Heading level={3} style={styles.sectionTitle}>Available sessions</Heading>
        {sessions.length === 0 ? (
          <AppText style={styles.noSessions}>No upcoming sessions scheduled yet.</AppText>
        ) : (
          sessions.map((s) => (
            <Card
              key={s.id}
              onPress={() => router.push(`/session/${s.id}`)}
              style={styles.sessionCard}
              accessibilityLabel={`${s.title}, ${formatSessionTime(s.startsAt)}`}
            >
              <Text style={styles.sessionTitle}>{s.title}</Text>
              <Text style={styles.sessionTime}>{formatSessionTime(s.startsAt)}</Text>
              <View style={styles.sessionMeta}>
                <Badge
                  label={s.kind === 'one_on_one' ? '1:1 Coaching' : 'Group class'}
                  color={s.kind === 'one_on_one' ? 'amber' : 'blue'}
                />
                <Text style={styles.sessionPrice}>{displayPrice(s.priceCents)}</Text>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Book 1:1 CTA */}
      <Card style={styles.bookCard}>
        <Text style={styles.bookTitle}>Book a 1:1 coaching session</Text>
        <AppText style={styles.bookDesc}>
          Work with {teacher.name} one-on-one at your own pace and schedule.
        </AppText>
        <Button
          label={`Book 1:1${teacher.hourlyRateCents != null ? ` · ${displayPrice(teacher.hourlyRateCents)}/hr` : ''}`}
          onPress={() => {
            // Push to the first available 1:1 session, or show the classes tab.
            const oneOnOne = sessions.find((s) => s.kind === 'one_on_one');
            if (oneOnOne) {
              router.push(`/session/${oneOnOne.id}`);
            } else {
              router.push('/(tabs)/browse');
            }
          }}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.sm }}
        />
      </Card>
    </Screen>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg, alignItems: 'flex-start' },
  heroText: { flex: 1 },
  headline: { color: Colors.textSecondary, marginTop: 2, fontStyle: 'italic' },
  heroMeta: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center', marginTop: Spacing.xs, flexWrap: 'wrap' },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.sm },
  bio: { color: Colors.textSecondary, lineHeight: FontSize.base * 1.6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  noSessions: { color: Colors.textMuted },
  sessionCard: { marginBottom: Spacing.sm },
  sessionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  sessionTime: { fontSize: FontSize.sm, color: Colors.primary, marginTop: 2 },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  sessionPrice: { fontSize: FontSize.sm, color: Colors.textSecondary },
  bookCard: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    marginBottom: Spacing.xl,
  },
  bookTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  bookDesc: { color: Colors.textSecondary, marginTop: Spacing.xs },
});
