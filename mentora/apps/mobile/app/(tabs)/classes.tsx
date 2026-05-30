/**
 * My Classes tab — upcoming sessions and enrolled courses.
 *
 * Shows sessions with join/view buttons and enrolled course list.
 * Teachers see sessions they are hosting.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import type { ClassSession } from '@mentora/shared';
import { useAuth } from '../../src/lib/auth';
import { sessionsApi } from '../../src/lib/api';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Heading, AppText } from '../../src/components/Typography';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { EmptyState } from '../../src/components/EmptyState';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '../../src/components/theme';
import { formatSessionTime, displayPrice } from '../../src/lib/utils';

type FilterKind = 'all' | 'classroom' | 'one_on_one';

export default function ClassesScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const isTeacher = user?.role === 'TEACHER';

  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKind>('all');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await sessionsApi.list(token, { mine: true, upcoming: true });
      setSessions(res.items);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = sessions.filter((s) =>
    filter === 'all' ? true : s.kind === filter
  );

  if (loading) return <LoadingSpinner message="Loading classes…" />;

  return (
    <Screen scrollable={false} noPadding>
      {/* Header */}
      <View style={styles.header}>
        <Heading level={2}>
          {isTeacher ? 'Your sessions' : 'My classes'}
        </Heading>
        <AppText style={styles.headerSub}>
          {isTeacher
            ? 'Sessions you are scheduled to teach.'
            : 'Upcoming classes you are enrolled in.'}
        </AppText>
      </View>

      {/* Kind filter */}
      <View style={styles.filterRow}>
        {(['all', 'classroom', 'one_on_one'] as FilterKind[]).map((k) => {
          const label = k === 'all' ? 'All' : k === 'classroom' ? 'Group' : '1:1';
          return (
            <TouchableOpacity
              key={k}
              onPress={() => setFilter(k)}
              accessible
              accessibilityRole="radio"
              accessibilityState={{ checked: filter === k }}
              accessibilityLabel={`Filter ${label}`}
              style={[styles.filterChip, filter === k && styles.filterChipActive]}
            >
              <Text style={[styles.filterLabel, filter === k && styles.filterLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.list}
        onRefresh={load}
        refreshing={loading}
        renderItem={({ item: session }) => (
          <SessionCard
            session={session}
            isTeacher={isTeacher}
            onView={() => router.push(`/session/${session.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="📅"
            title="No sessions found"
            description={
              isTeacher
                ? 'You have no upcoming sessions. Create one from the web dashboard.'
                : 'Browse teachers and courses to book your first class.'
            }
            actionLabel={isTeacher ? undefined : 'Browse courses'}
            onAction={() => router.push('/(tabs)/browse')}
          />
        }
      />
    </Screen>
  );
}

function SessionCard({
  session,
  isTeacher,
  onView,
}: {
  session: ClassSession;
  isTeacher: boolean;
  onView: () => void;
}) {
  const isLive = session.status === 'live';
  const isPast = session.status === 'completed' || session.status === 'cancelled';

  return (
    <Card style={styles.card}>
      {/* Status badge + kind */}
      <View style={styles.cardHeader}>
        <Badge
          label={isLive ? 'LIVE' : session.status === 'cancelled' ? 'Cancelled' : session.status === 'completed' ? 'Done' : 'Upcoming'}
          color={isLive ? 'green' : isPast ? 'grey' : 'blue'}
        />
        <Badge
          label={session.kind === 'one_on_one' ? '1:1 Coaching' : 'Group'}
          color="amber"
        />
      </View>

      <Text style={styles.sessionTitle}>{session.title}</Text>
      <Text style={styles.sessionTime}>{formatSessionTime(session.startsAt)}</Text>
      <Text style={styles.sessionMeta}>
        {session.durationMinutes} min
        {session.priceCents > 0 ? ` · ${displayPrice(session.priceCents)}` : ' · Free'}
      </Text>

      {/* Action button */}
      {!isPast && (
        <Button
          label={isLive ? 'Join now' : isTeacher ? 'View session' : 'View & join'}
          onPress={onView}
          variant={isLive ? 'primary' : 'ghost'}
          size="sm"
          style={styles.cardAction}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerSub: { color: Colors.textSecondary, marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  filterLabelActive: { color: '#fff' },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 100 },
  card: { marginBottom: 0 },
  cardHeader: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm },
  sessionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  sessionTime: { fontSize: FontSize.sm, color: Colors.primary },
  sessionMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  cardAction: { alignSelf: 'flex-start', marginTop: Spacing.sm },
});
