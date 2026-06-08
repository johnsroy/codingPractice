/**
 * Session detail / join screen.
 *
 * Calls POST /sessions/:id/join → VideoJoinTicket.
 * Displays ticket details (room name, identity, expiry) and shows a
 * prominent "Join Video" CTA.
 *
 * PRODUCTION NOTE: Real low-latency video uses the LiveKit SDK
 * (@livekit/react-native) which requires a custom dev build (EAS Build).
 * In this standard Expo Go build the video view is stubbed with a clear
 * placeholder that shows all ticket information.  When you add the LiveKit
 * native module, replace the <VideoPlaceholder> component with
 * <VideoConferenceView serverUrl={ticket.url} token={ticket.token} />.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ClassSession, VideoJoinTicket } from '@mentora/shared';
import { useAuth } from '../../src/lib/auth';
import { sessionsApi } from '../../src/lib/api';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Heading, AppText, Label } from '../../src/components/Typography';
import { Badge } from '../../src/components/Badge';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { EmptyState } from '../../src/components/EmptyState';
import {
  Colors,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
} from '../../src/components/theme';
import { formatSessionTime, displayPrice } from '../../src/lib/utils';

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<ClassSession | null>(null);
  const [ticket, setTicket] = useState<VideoJoinTicket | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [joiningVideo, setJoiningVideo] = useState(false);

  const loadSession = useCallback(async () => {
    if (!token || !id) return;
    setLoadingSession(true);
    try {
      const s = await sessionsApi.getById(token, id);
      setSession(s);
    } finally {
      setLoadingSession(false);
    }
  }, [token, id]);

  useEffect(() => { loadSession(); }, [loadSession]);

  async function handleBook() {
    if (!token || !id) return;
    try {
      await sessionsApi.book(token, id);
      Alert.alert('Booked!', 'You are registered for this session. Join when it goes live.');
    } catch (e: unknown) {
      Alert.alert('Booking failed', e instanceof Error ? e.message : 'Please try again.');
    }
  }

  async function handleJoinVideo() {
    if (!token || !id) return;
    setJoiningVideo(true);
    try {
      const t = await sessionsApi.join(token, id);
      setTicket(t);
    } catch (e: unknown) {
      Alert.alert(
        'Could not join',
        e instanceof Error ? e.message : 'Session may not have started yet.'
      );
    } finally {
      setJoiningVideo(false);
    }
  }

  if (loadingSession) return <LoadingSpinner message="Loading session…" />;
  if (!session) return <EmptyState icon="🔍" title="Session not found" />;

  const isTeacher = user?.role === 'TEACHER';
  const isLive = session.status === 'live';
  const isScheduled = session.status === 'scheduled';
  const isPast = session.status === 'completed' || session.status === 'cancelled';

  return (
    <Screen onRefresh={loadSession} refreshing={loadingSession}>
      {/* Status + kind */}
      <View style={styles.chipRow}>
        <Badge
          label={isLive ? 'LIVE NOW' : session.status}
          color={isLive ? 'green' : isPast ? 'grey' : 'blue'}
        />
        <Badge
          label={session.kind === 'one_on_one' ? '1:1 Coaching' : 'Group class'}
          color="amber"
        />
      </View>

      {/* Title */}
      <Heading level={1} style={styles.title}>{session.title}</Heading>

      {/* Session metadata card */}
      <Card style={styles.metaCard}>
        <MetaRow label="When" value={formatSessionTime(session.startsAt)} />
        <MetaRow label="Duration" value={`${session.durationMinutes} minutes`} />
        <MetaRow label="Price" value={displayPrice(session.priceCents)} />
        <MetaRow
          label="Capacity"
          value={
            session.capacity === 1
              ? '1:1 (private)'
              : `Up to ${session.capacity} students`
          }
        />
      </Card>

      {/* Video join area */}
      {ticket ? (
        <VideoPlaceholder ticket={ticket} />
      ) : (
        <>
          {isLive && (
            <Button
              label="Join video now"
              onPress={handleJoinVideo}
              loading={joiningVideo}
              disabled={joiningVideo}
              fullWidth
              size="lg"
              style={styles.primaryAction}
            />
          )}

          {isScheduled && !isTeacher && (
            <Button
              label="Book this session"
              onPress={handleBook}
              fullWidth
              size="lg"
              style={styles.primaryAction}
            />
          )}

          {isScheduled && isTeacher && (
            <Card style={styles.teacherNote}>
              <Text style={styles.teacherNoteText}>
                This session is scheduled. Students will be able to join when you start it from the web dashboard, or when it goes live here.
              </Text>
            </Card>
          )}

          {isPast && (
            <Card style={styles.pastNote}>
              <Text style={styles.pastNoteText}>
                This session has ended.
              </Text>
            </Card>
          )}
        </>
      )}

      {/* Room name hint (useful for testing/debugging) */}
      <View style={styles.roomHint}>
        <Text style={styles.roomHintText}>Room: {session.roomName}</Text>
      </View>
    </Screen>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={metaStyles.row}>
      <Text style={metaStyles.label}>{label}</Text>
      <Text style={metaStyles.value}>{value}</Text>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary },
  value: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1, textAlign: 'right' },
});

/**
 * VideoPlaceholder — shown after a successful POST /sessions/:id/join.
 *
 * In a production EAS build this would be replaced by the LiveKit
 * <VideoConferenceView> component once @livekit/react-native is linked.
 */
function VideoPlaceholder({ ticket }: { ticket: VideoJoinTicket }) {
  const expiresAt = new Date(ticket.expiresAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={videoStyles.container}>
      {/* Stub video area */}
      <View style={videoStyles.videoArea}>
        <Text style={videoStyles.videoEmoji}>🎥</Text>
        <Text style={videoStyles.videoTitle}>Video room ready</Text>
        <Text style={videoStyles.videoSub}>
          {ticket.provider === 'mock'
            ? 'Running in mock/development mode — no real video stream.'
            : 'Connecting to LiveKit room…'}
        </Text>
      </View>

      {/* Ticket details */}
      <Card style={videoStyles.ticketCard}>
        <Label style={videoStyles.ticketLabel}>Connection details</Label>
        <MetaRow label="Room" value={ticket.roomName} />
        <MetaRow label="Identity" value={ticket.identity} />
        <MetaRow label="Role" value={ticket.canPublish ? 'Publisher (you can share camera/mic)' : 'Viewer'} />
        <MetaRow label="Expires" value={expiresAt} />
        {ticket.provider === 'livekit' && (
          <MetaRow label="Server" value={ticket.url} />
        )}
      </Card>

      {/* In a real EAS build, open the LiveKit room via deep link or SDK */}
      {ticket.provider === 'livekit' && (
        <Button
          label="Open in LiveKit (native)"
          onPress={() => {
            // Replace with the LiveKit SDK call in a dev build.
            Linking.openURL(ticket.url).catch(() => null);
          }}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.md }}
        />
      )}

      <Text style={videoStyles.stub}>
        {'⚠️'} Video stub: The live @livekit/react-native SDK requires an EAS
        custom dev build. See README for setup instructions.
      </Text>
    </View>
  );
}

const videoStyles = StyleSheet.create({
  container: { marginTop: Spacing.md },
  videoArea: {
    height: 200,
    backgroundColor: '#111827',
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  videoEmoji: { fontSize: 48 },
  videoTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: '#fff' },
  videoSub: { fontSize: FontSize.sm, color: '#9ca3af', textAlign: 'center', paddingHorizontal: Spacing.lg },
  ticketCard: { marginBottom: Spacing.sm },
  ticketLabel: { marginBottom: Spacing.sm },
  stub: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: FontSize.xs * 1.6,
  },
});

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  title: { marginBottom: Spacing.md },
  metaCard: { marginBottom: Spacing.lg },
  primaryAction: { marginBottom: Spacing.md },
  teacherNote: {
    backgroundColor: Colors.infoLight,
    borderColor: Colors.info,
    marginBottom: Spacing.md,
  },
  teacherNoteText: { fontSize: FontSize.base, color: Colors.info, lineHeight: FontSize.base * 1.5 },
  pastNote: {
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  pastNoteText: { fontSize: FontSize.base, color: Colors.textSecondary },
  roomHint: { marginTop: Spacing.lg, alignItems: 'center' },
  roomHintText: { fontSize: FontSize.xs, color: Colors.textMuted },
});
