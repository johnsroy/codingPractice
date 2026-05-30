/**
 * Course detail screen.
 *
 * Shows full course info, the teacher, lesson count, and an Enroll CTA.
 * Enrolled users see a "Go to My Classes" shortcut instead.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Course } from '@mentora/shared';
import { useAuth } from '../../src/lib/auth';
import { coursesApi } from '../../src/lib/api';
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
import { displayPrice, subjectLabel, gradeLabel } from '../../src/lib/utils';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const load = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const c = await coursesApi.getById(token, id);
      setCourse(c);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  async function handleEnroll() {
    if (!token || !id) return;
    setEnrolling(true);
    try {
      await coursesApi.enroll(token, id);
      setEnrolled(true);
      Alert.alert(
        'Enrolled!',
        'You have successfully enrolled in this course. Check your Classes tab for upcoming sessions.',
        [
          {
            text: 'View My Classes',
            onPress: () => router.push('/(tabs)/classes'),
          },
          { text: 'Stay here' },
        ]
      );
    } catch (e: unknown) {
      Alert.alert(
        'Enrolment failed',
        e instanceof Error ? e.message : 'Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) return <LoadingSpinner message="Loading course…" />;
  if (!course) {
    return <EmptyState icon="🔍" title="Course not found" />;
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      {/* Cover image placeholder */}
      {course.coverImageUrl ? (
        // In production replace with <Image> — omitted to avoid native image dep
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverEmoji}>📚</Text>
        </View>
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.coverEmoji}>📚</Text>
        </View>
      )}

      {/* Meta chips */}
      <View style={styles.chipRow}>
        <Badge label={subjectLabel(course.subjectId)} color="blue" />
        <Badge label={gradeLabel(course.gradeId)} color="amber" />
        <Badge label={course.status} color={course.status === 'published' ? 'green' : 'grey'} />
      </View>

      {/* Title */}
      <Heading level={1} style={styles.title}>{course.title}</Heading>

      {/* Rating + enrollment count */}
      <View style={styles.metaRow}>
        {course.rating != null && <StarRating rating={course.rating} />}
        {course.enrolledCount != null && (
          <Text style={styles.metaText}>{course.enrolledCount} students</Text>
        )}
        {course.lessonCount != null && (
          <Text style={styles.metaText}>{course.lessonCount} lessons</Text>
        )}
      </View>

      {/* Teacher card */}
      {course.teacher && (
        <Card
          onPress={() => router.push(`/teacher/${course.teacher!.id}`)}
          style={styles.teacherCard}
          accessibilityLabel={`Teacher: ${course.teacher.name}`}
        >
          <View style={styles.teacherRow}>
            <Avatar name={course.teacher.name} uri={course.teacher.avatarUrl} size={48} />
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>{course.teacher.name}</Text>
              {course.teacher.headline && (
                <Text style={styles.teacherHeadline} numberOfLines={1}>
                  {course.teacher.headline}
                </Text>
              )}
            </View>
            <Text style={styles.viewProfile}>View →</Text>
          </View>
        </Card>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Heading level={3} style={styles.sectionTitle}>About this course</Heading>
        <AppText style={styles.description}>{course.description}</AppText>
      </View>

      {/* Pricing + enroll CTA */}
      <Card style={styles.enrollCard}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{displayPrice(course.priceCents)}</Text>
          {course.priceCents === 0 && (
            <Text style={styles.priceSub}>Included with your subscription</Text>
          )}
        </View>

        {enrolled ? (
          <Button
            label="Go to My Classes"
            onPress={() => router.push('/(tabs)/classes')}
            fullWidth
            size="lg"
            variant="secondary"
          />
        ) : (
          <Button
            label={
              course.priceCents === 0
                ? 'Enrol for free'
                : `Enrol — ${displayPrice(course.priceCents)}`
            }
            onPress={handleEnroll}
            loading={enrolling}
            disabled={enrolling}
            fullWidth
            size="lg"
          />
        )}

        <Text style={styles.enrollDisclaimer}>
          Enrolment gives you access to all lessons and materials for this course.
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  coverPlaceholder: {
    height: 160,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  coverEmoji: { fontSize: 56 },
  chipRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm, flexWrap: 'wrap' },
  title: { marginBottom: Spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md, flexWrap: 'wrap' },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  teacherCard: { marginBottom: Spacing.lg },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  teacherHeadline: { fontSize: FontSize.sm, color: Colors.textSecondary },
  viewProfile: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { marginBottom: Spacing.sm },
  description: { color: Colors.textSecondary, lineHeight: FontSize.base * 1.6 },
  enrollCard: { marginBottom: Spacing.xl, backgroundColor: Colors.surface },
  priceRow: { marginBottom: Spacing.md },
  price: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.textPrimary },
  priceSub: { fontSize: FontSize.sm, color: Colors.success, marginTop: 2 },
  enrollDisclaimer: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
