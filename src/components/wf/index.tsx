import type { ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ArrowLeft } from '@/components/ui/icons';

export const COLORS = {
  bg: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  navy: '#101D36',
  teal: '#0D9488',
  tealLight: '#35D0BA',
  text: '#0F172A',
  muted: '#64748B',
  danger: '#DC2626',
  warn: '#D97706',
  ok: '#16A34A',
  info: '#0284C7',
};

export type Tone = 'ok' | 'warn' | 'danger' | 'info' | 'muted';

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  ok: { bg: '#DCFCE7', fg: '#15803D' },
  warn: { bg: '#FEF3C7', fg: '#B45309' },
  danger: { bg: '#FEE2E2', fg: '#B91C1C' },
  info: { bg: '#E0F2FE', fg: '#0369A1' },
  muted: { bg: '#F1F5F9', fg: '#475569' },
};

export function Badge({ label, tone = 'muted' }: { label: string; tone?: Tone }) {
  const t = TONE_STYLES[tone];
  return (
    <View style={[s.badge, { backgroundColor: t.bg }]}>
      <Text style={[s.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function prettify(value?: string | null) {
  if (!value)
    return '—';
  return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const STATUS_TONES: Record<string, Tone> = {
  new: 'info',
  contacted: 'warn',
  in_progress: 'warn',
  converted: 'ok',
  allocated: 'ok',
  closed: 'muted',
  under_review: 'warn',
  shortlisted: 'info',
  evaluation_completed: 'info',
  approved: 'ok',
  rejected: 'danger',
  assigned: 'info',
  accepted: 'warn',
  active: 'ok',
  completed: 'ok',
  cancelled: 'muted',
  inactive: 'muted',
  paused: 'warn',
  suspended: 'danger',
  blocked: 'danger',
  free: 'ok',
  eligible: 'info',
};

export function StatusBadge({ status }: { status?: string | null }) {
  return <Badge label={prettify(status)} tone={STATUS_TONES[status ?? ''] ?? 'muted'} />;
}

type ScreenProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  bottomInset?: number;
};

/** Standard screen shell: dark navy header + light scrollable body. */
export function Screen({
  title,
  subtitle,
  onBack,
  right,
  children,
  scroll = true,
  refreshing,
  onRefresh,
  bottomInset = 24,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={s.screen}>
      <StatusBar style="light" backgroundColor={COLORS.navy} />
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        {onBack
          ? (
              <Pressable onPress={onBack} hitSlop={12} style={s.backBtn} accessibilityLabel="Back">
                <ArrowLeft color="#FFFFFF" width={20} height={20} />
              </Pressable>
            )
          : null}
        <View style={s.headerText}>
          <Text style={s.headerTitle} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={s.headerSubtitle} numberOfLines={2}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {scroll
        ? (
            <ScrollView
              contentContainerStyle={[s.body, { paddingBottom: insets.bottom + bottomInset }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                onRefresh
                  ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={COLORS.teal} />
                  : undefined
              }
            >
              {children}
            </ScrollView>
          )
        : (
            <View style={s.flex}>{children}</View>
          )}
    </View>
  );
}

export function Card({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionTitle}>{children}</Text>
      {action}
    </View>
  );
}

export function StatCard({
  label,
  value,
  tone = 'info',
  helper,
}: {
  label: string;
  value: string | number;
  tone?: Tone;
  helper?: string;
}) {
  return (
    <View style={s.stat}>
      <Text style={[s.statValue, { color: TONE_STYLES[tone].fg }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {helper ? <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>{helper}</Text> : null}
    </View>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value === undefined || value === null || value === '' ? '—' : String(value)}</Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={s.center}>
      <ActivityIndicator color={COLORS.teal} size="large" />
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <View style={s.center}>
      <Text style={s.emptyTitle}>{title}</Text>
      {message ? <Text style={s.emptyMsg}>{message}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={s.center}>
      <Text style={s.emptyTitle}>Something went wrong</Text>
      <Text style={s.emptyMsg}>{message}</Text>
      {onRetry ? <Button label="Retry" onPress={onRetry} variant="outline" style={{ marginTop: 14 }} /> : null}
    </View>
  );
}

/** Renders loading / error / empty / content for a React Query result. */
export function QueryState({
  isLoading,
  error,
  isEmpty,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  onRetry,
  children,
}: {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (isLoading)
    return <Loading />;
  if (error)
    return <ErrorState message={error} onRetry={onRetry} />;
  if (isEmpty)
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return <>{children}</>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger' | 'dangerOutline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const palette = {
    primary: { bg: COLORS.tealLight, fg: COLORS.navy, border: COLORS.tealLight },
    outline: { bg: '#FFFFFF', fg: COLORS.navy, border: COLORS.border },
    danger: { bg: COLORS.danger, fg: '#FFFFFF', border: COLORS.danger },
    dangerOutline: { bg: '#FFFFFF', fg: COLORS.danger, border: '#FCA5A5' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: palette.bg, borderColor: palette.border },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator size="small" color={palette.fg} />
        : <Text style={[s.btnText, { color: palette.fg }]}>{label}</Text>}
    </Pressable>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[s.chip, active && s.chipActive]}
          >
            <Text style={[s.chipText, active && s.chipTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Field({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label?: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={s.fieldLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#94A3B8"
        {...props}
        style={[s.input, props.multiline && { minHeight: 80, textAlignVertical: 'top' }, props.style]}
      />
    </View>
  );
}

export function SearchBar(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      placeholderTextColor="#94A3B8"
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      {...props}
      style={[s.input, { marginBottom: 12 }, props.style]}
    />
  );
}

export function formatDate(iso?: string | null) {
  if (!iso)
    return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()))
    return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(setV, delay, value);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#14213D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', fontFamily: 'Inter' },
  headerSubtitle: { color: '#CAD5E8', fontSize: 13, marginTop: 2, fontFamily: 'Inter' },
  body: { padding: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, fontFamily: 'Inter' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '700', fontFamily: 'Inter' },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  statValue: { fontSize: 26, fontWeight: '800', fontFamily: 'Inter' },
  statLabel: { fontSize: 12, color: COLORS.muted, marginTop: 2, fontFamily: 'Inter' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, gap: 12 },
  infoLabel: { fontSize: 13, color: COLORS.muted, fontFamily: 'Inter' },
  infoValue: { fontSize: 13, color: COLORS.text, fontWeight: '600', flexShrink: 1, textAlign: 'right', fontFamily: 'Inter' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, textAlign: 'center', fontFamily: 'Inter' },
  emptyMsg: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginTop: 6, fontFamily: 'Inter' },
  btn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnText: { fontSize: 14, fontWeight: '700', fontFamily: 'Inter' },
  chips: { gap: 8, paddingBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.navy, borderColor: COLORS.navy },
  chipText: { fontSize: 13, color: COLORS.muted, fontWeight: '600', fontFamily: 'Inter' },
  chipTextActive: { color: '#FFFFFF' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: COLORS.muted, marginBottom: 6, fontFamily: 'Inter' },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'Inter',
  },
});
