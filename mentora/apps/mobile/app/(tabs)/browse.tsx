/**
 * Browse tab — search and filter teachers and courses.
 *
 * Two sub-sections: Teachers and Courses, each with subject/grade filters.
 * Results are cards that navigate to detail screens.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SUBJECTS, GRADES } from '@mentora/shared';
import type { Course, UserPublic } from '@mentora/shared';
import { useAuth } from '../../src/lib/auth';
import { coursesApi, usersApi } from '../../src/lib/api';
import { Screen } from '../../src/components/Screen';
import { Card } from '../../src/components/Card';
import { Heading } from '../../src/components/Typography';
import { Avatar } from '../../src/components/Avatar';
import { StarRating } from '../../src/components/StarRating';
import { Badge } from '../../src/components/Badge';
import { LoadingSpinner } from '../../src/components/LoadingSpinner';
import { EmptyState } from '../../src/components/EmptyState';
import {
  Colors,
  FontSize,
  FontWeight,
  MIN_TOUCH_TARGET,
  Radius,
  Spacing,
} from '../../src/components/theme';
import { displayPrice, subjectLabel, gradeLabel } from '../../src/lib/utils';

type Tab = 'courses' | 'teachers';

export default function BrowseScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('courses');
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');

  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (tab === 'courses') {
        const res = await coursesApi.list(token, { q: query, subject, grade });
        setCourses(res.items);
      } else {
        const res = await usersApi.listTeachers(token, { q: query, subject, grade });
        setTeachers(res.items);
      }
    } finally {
      setLoading(false);
    }
  }, [token, tab, query, subject, grade]);

  // Run search whenever filters change.
  useEffect(() => { search(); }, [search]);

  return (
    <Screen scrollable={false} noPadding>
      {/* Search header */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={tab === 'courses' ? 'Search courses…' : 'Search teachers…'}
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={search}
          accessibilityLabel="Search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        {(['courses', 'teachers'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            accessible
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t }}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'courses' ? 'Courses' : 'Teachers'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter chips */}
      <FilterChips subject={subject} onSubject={setSubject} grade={grade} onGrade={setGrade} />

      {/* Results */}
      {loading ? (
        <LoadingSpinner message="Searching…" />
      ) : tab === 'courses' ? (
        <FlatList
          data={courses}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={() => router.push(`/course/${item.id}`)} />
          )}
          ListEmptyComponent={
            <EmptyState icon="🔍" title="No courses found" description="Try different keywords or filters." />
          }
        />
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TeacherCard teacher={item} onPress={() => router.push(`/teacher/${item.id}`)} />
          )}
          ListEmptyComponent={
            <EmptyState icon="🔍" title="No teachers found" description="Try different keywords or filters." />
          }
        />
      )}
    </Screen>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterChips({
  subject, onSubject, grade, onGrade,
}: { subject: string; onSubject: (s: string) => void; grade: string; onGrade: (g: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
    >
      {/* Subject chips */}
      {SUBJECTS.map((s) => (
        <TouchableOpacity
          key={s.id}
          onPress={() => onSubject(subject === s.id ? '' : s.id)}
          accessible
          accessibilityRole="checkbox"
          accessibilityState={{ checked: subject === s.id }}
          accessibilityLabel={`Filter by ${s.label}`}
          style={[styles.chip, subject === s.id && styles.chipActive]}
        >
          <Text style={[styles.chipText, subject === s.id && styles.chipTextActive]}>
            {s.emoji} {s.label}
          </Text>
        </TouchableOpacity>
      ))}
      {/* Grade chips */}
      {GRADES.filter((g) => g.order % 3 === 1).map((g) => (
        <TouchableOpacity
          key={g.id}
          onPress={() => onGrade(grade === g.id ? '' : g.id)}
          accessible
          accessibilityRole="checkbox"
          accessibilityState={{ checked: grade === g.id }}
          accessibilityLabel={`Filter by ${g.label}`}
          style={[styles.chip, grade === g.id && styles.chipActive]}
        >
          <Text style={[styles.chipText, grade === g.id && styles.chipTextActive]}>
            {g.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function CourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.resultCard} accessibilityLabel={course.title}>
      <Text style={styles.resultTitle} numberOfLines={2}>{course.title}</Text>
      <Text style={styles.resultSub} numberOfLines={1}>
        {subjectLabel(course.subjectId)} · {gradeLabel(course.gradeId)}
      </Text>
      {course.teacher && (
        <Text style={styles.resultMeta}>with {course.teacher.name}</Text>
      )}
      <View style={styles.resultFooter}>
        {course.rating != null && <StarRating rating={course.rating} size={13} />}
        <Badge label={displayPrice(course.priceCents)} color={course.priceCents === 0 ? 'green' : 'blue'} />
      </View>
    </Card>
  );
}

function TeacherCard({ teacher, onPress }: { teacher: UserPublic; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.resultCard} accessibilityLabel={teacher.name}>
      <View style={styles.teacherRow}>
        <Avatar name={teacher.name} uri={teacher.avatarUrl} size={52} />
        <View style={styles.teacherInfo}>
          <Text style={styles.resultTitle}>{teacher.name}</Text>
          {teacher.headline && (
            <Text style={styles.resultSub} numberOfLines={1}>{teacher.headline}</Text>
          )}
          <View style={styles.teacherMeta}>
            {teacher.rating != null && <StarRating rating={teacher.rating} size={13} />}
            {teacher.yearsExperience != null && (
              <Text style={styles.resultMeta}>{teacher.yearsExperience}y exp</Text>
            )}
            {teacher.hourlyRateCents != null && (
              <Badge label={`${displayPrice(teacher.hourlyRateCents)}/hr`} color="amber" />
            )}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    minHeight: MIN_TOUCH_TARGET,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  tabBtn: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  tabLabelActive: { color: '#fff' },
  chips: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minHeight: 32,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  resultCard: { marginBottom: 0 },
  resultTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  resultSub: { fontSize: FontSize.sm, color: Colors.textSecondary },
  resultMeta: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  teacherRow: { flexDirection: 'row', gap: Spacing.md },
  teacherInfo: { flex: 1 },
  teacherMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
    flexWrap: 'wrap',
  },
});
