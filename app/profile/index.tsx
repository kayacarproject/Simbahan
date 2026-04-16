import React, { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { View, ScrollView, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../components/ui/AppText';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import WebLayout from '../../components/ui/WebLayout';
import { ProfileHeroShimmer, ProfileCardShimmer } from '../../components/skeletons/ProfileShimmer';
import { Spacing, Radius } from '../../constants/Layout';
import { useChurchStore } from '../../store/churchStore';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';
import { getDataPublic } from '../../services/ApiHandler';
import { getUserId } from '../../services/authService';
import Api from '../../services/Api';
import { useChurchData } from '../../hooks/useChurchData';

type AppUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  birthDate: string;
  civilStatus: string;
  barangay: string;
  municipality: string;
  avatar: string | null;
  profile: string | null;
  role: string;
  roleId: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  createdDate: string;
  companyId: string[];
};

const isWeb = Platform.OS === 'web';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const donations = useChurchStore((s) => s.donations);
  const showToast = useUiStore((s) => s.showToast);

  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userId = await getUserId();
      console.log('[PROFILE] userId from storage:', userId);
      const body = {
        appName: Api.appName, moduleName: 'appuser',
        query: userId ? { _id: userId } : {},
        limit: 1, skip: 0, sortBy: 'createdAt', order: 'descending' as const,
      };
      console.log('[PROFILE] Request:', body);
      const data = await getDataPublic(body);
      if (data?.success === true && data.data?.length > 0) {
        const raw = data.data[0];
        console.log('[PROFILE] Response:', raw);
        console.log('[PROFILE] profile field:', raw.profile);
        console.log('[PROFILE] avatar field:', raw.avatar);
        setUser(raw);
      } else {
        console.log('[PROFILE] No data:', data?.message);
        setUser(null);
      }
    } catch (e: any) {
      const msg = e?.message === 'Session expired'
        ? 'Session expired. Please log in again.'
        : 'Hindi ma-load ang profile. Subukan muli.';
      console.log('[PROFILE] Error:', e?.response?.data || e.message);
      showToast(msg, 'error');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useFocusEffect(useCallback(() => { fetchProfile(); }, [fetchProfile]));

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const myDonations = donations.filter((d) => d.memberId === user?._id);
  const totalDonated = myDonations.reduce((s, d) => s + d.amount, 0);
  const handleEdit = useCallback(() => router.push('/profile/edit' as never), []);
  const openSidebar = useUiStore((s) => s.openSidebar);
  const { church } = useChurchData();

  // ── Dynamic styles ────────────────────────────────────────────────────────
  const s = StyleSheet.create({
    screen:      { flex: 1, backgroundColor: theme.background },
    header:      { backgroundColor: theme.primaryDark, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl + Spacing.lg },
    headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    editBtn:     { padding: Spacing.xs },
    heroCard:    { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: Radius.md, marginHorizontal: Spacing.md, marginTop: -(Spacing.xl), padding: Spacing.lg, alignItems: 'center' as const, gap: Spacing.sm },
    avatarWrap:  { position: 'relative' as const, alignItems: 'center' as const, justifyContent: 'center' as const },
    avatarBorder:{ position: 'absolute' as const, top: -3, left: -3, right: -3, bottom: -3, borderRadius: 9999, borderWidth: 2, borderColor: theme.accent },
    heroName:    { textAlign: 'center' as const, marginTop: Spacing.sm },
    card:        { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: Radius.md, padding: Spacing.md, margin: Spacing.md, marginBottom: 0, gap: Spacing.xs },
    cardTitle:   { marginBottom: Spacing.xs },
    infoRow:     { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.sm, paddingVertical: Spacing.xs },
    infoLabel:   { width: 100 },
    ministryBadges: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: Spacing.xs },
    donationCard:{ flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: theme.accentPale, borderWidth: 1, borderColor: theme.accent + '66', borderRadius: Radius.md, padding: Spacing.md, margin: Spacing.md, marginBottom: 0, gap: Spacing.sm },
    scroll:      { paddingBottom: Spacing.xxl },
  });

  function InfoRow({ icon, label, value, onPress }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string; value: string; onPress?: () => void;
  }) {
    const inner = (
      <View style={s.infoRow}>
        <Ionicons name={icon} size={16} color={theme.accent} />
        <AppText variant="bodySm" color={theme.textMuted} style={s.infoLabel}>{label}</AppText>
        <AppText variant="bodyMd" color={onPress ? theme.primary : theme.text} style={{ flex: 1 }}>
          {value || '—'}
        </AppText>
        {onPress && <Ionicons name="open-outline" size={14} color={theme.primary} />}
      </View>
    );
    if (onPress) return <TouchableOpacity onPress={onPress} accessible accessibilityLabel={label}>{inner}</TouchableOpacity>;
    return inner;
  }

  const content = (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View style={s.headerRow}>
          {!isWeb && (
            <TouchableOpacity onPress={openSidebar} style={s.editBtn} accessible accessibilityLabel="Open menu" activeOpacity={0.7}>
              <Ionicons name="menu" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <AppText variant="displaySm" color={theme.textInverse}>Profile</AppText>
          <TouchableOpacity onPress={handleEdit} style={s.editBtn} accessible accessibilityLabel="I-edit ang profile">
            <Ionicons name="create-outline" size={22} color={theme.accentLight} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <>
          <ProfileHeroShimmer />
          <ProfileCardShimmer rows={3} />
          <ProfileCardShimmer rows={2} />
          <ProfileCardShimmer rows={2} />
        </>
      ) : (
        <>
          {/* Hero */}
          <View style={s.heroCard}>
            <View style={s.avatarWrap}>
              <Avatar uri={user?.profile ?? user?.avatar ?? undefined} name={fullName} size="lg" />
              <View style={s.avatarBorder} />
            </View>
            <AppText variant="displaySm" color={theme.primary} style={s.heroName}>{fullName || '—'}</AppText>
            <AppText variant="caption" color={theme.textMuted}>{user?.role ?? '—'}</AppText>
          </View>

          {/* Personal */}
          <View style={s.card}>
            <AppText variant="headingSm" color={theme.primary} style={s.cardTitle}>Personal</AppText>
            <InfoRow icon="calendar-outline" label="Kaarawan"      value={user?.birthDate ?? ''} />
            <InfoRow icon="location-outline" label="Barangay"      value={user?.barangay ?? ''} />
            <InfoRow icon="map-outline"      label="Munisipalidad" value={user?.municipality ?? ''} />
            <InfoRow icon="heart-outline"    label="Katayuan"      value={user?.civilStatus ?? ''} />
          </View>

          {/* Contact */}
          <View style={s.card}>
            <AppText variant="headingSm" color={theme.primary} style={s.cardTitle}>Pakikipag-ugnayan</AppText>
            <InfoRow icon="call-outline" label="Telepono" value={user?.mobile ?? ''}
              onPress={user?.mobile ? () => Linking.openURL(`tel:${user.mobile}`) : undefined} />
            <InfoRow icon="mail-outline" label="Email" value={user?.email ?? ''}
              onPress={user?.email ? () => Linking.openURL(`mailto:${user.email}`) : undefined} />
          </View>

          {/* Church */}
          <View style={s.card}>
            <AppText variant="headingSm" color={theme.primary} style={s.cardTitle}>Simbahan</AppText>
            <InfoRow icon="business-outline" label="Parokya"   value={church.name} />
            <InfoRow icon="calendar-outline" label="Sumali"    value={user?.createdDate ?? ''} />
            <InfoRow icon="ribbon-outline"   label="Tungkulin" value={user?.role ?? ''} />
          </View>

          {/* Ministries */}
          <View style={s.card}>
            <AppText variant="headingSm" color={theme.primary} style={s.cardTitle}>Mga Ministeryo</AppText>
            {user?.companyId && user.companyId.length > 0 ? (
              <View style={s.ministryBadges}>
                {user.companyId.map((m) => <Badge key={m} label={m} variant="gold" size="md" />)}
              </View>
            ) : (
              <EmptyState icon="ribbon-outline" title="Walang ministeryo" message="Hindi pa miyembro ng anumang ministeryo." />
            )}
          </View>

          {/* Donation summary */}
          <View style={s.donationCard}>
            <Ionicons name="gift-outline" size={20} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <AppText variant="displaySm" color={theme.primary}>₱{totalDonated.toLocaleString('en-PH')}</AppText>
              <AppText variant="caption" color={theme.textMuted}>{myDonations.length} donasyon</AppText>
            </View>
            <TouchableOpacity onPress={() => router.push('/donations/history' as never)} accessible accessibilityLabel="Tingnan ang kasaysayan ng donasyon">
              <AppText variant="label" color={theme.primary}>Kasaysayan →</AppText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  if (isWeb) return <WebLayout>{content}</WebLayout>;
  return <SafeAreaView style={s.screen} edges={['top']}>{content}</SafeAreaView>;
}
