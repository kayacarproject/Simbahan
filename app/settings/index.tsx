import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch, Alert, Modal, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GradientView from '../../components/ui/GradientView';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import WebLayout from '../../components/ui/WebLayout';
import { Spacing, Radius } from '../../constants/Layout';
import { useAuthStore } from '../../store/authStore';
import { useModule10Store } from '../../store/module10Store';
import { useTheme } from '../../theme/ThemeContext';
import { useCountryStore, COUNTRIES, ENABLE_COUNTRY_SELECTION } from '../../store/countryStore';
import { useChurchData } from '../../hooks/useChurchData';
import BackBar from '../../components/ui/BackBar';

const isWeb = Platform.OS === 'web';
const APP_VERSION = '1.0.0 (Module 10)';

function SettingRow({ icon, label, value, onPress, right }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string; value?: string; onPress?: () => void;
  right?: React.ReactNode;
}) {
  const { theme } = useTheme();
  const inner = (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: theme.surface2 }]}>
        <Ionicons name={icon} size={18} color={theme.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyMd" color={theme.text}>{label}</AppText>
        {value && <AppText variant="caption" color={theme.textMuted}>{value}</AppText>}
      </View>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />)}
    </View>
  );
  if (onPress) return (
    <TouchableOpacity onPress={onPress} accessible accessibilityLabel={label} activeOpacity={0.75}>
      {inner}
    </TouchableOpacity>
  );
  return inner;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionCard}>
      <AppText variant="label" color={theme.textMuted} style={styles.sectionLabel}>
        {title.toUpperCase()}
      </AppText>
      <View style={[styles.sectionBody, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, mode, toggleTheme } = useTheme();
  const logout = useAuthStore((s) => s.logout);
  const settings = useModule10Store((s) => s.settings);
  const updateSettings = useModule10Store((s) => s.updateSettings);
  const updateNotifSettings = useModule10Store((s) => s.updateNotifSettings);

  const country         = useCountryStore((s) => s.country);
  const resetCountry    = useCountryStore((s) => s.reset);
  const countryConfig   = country ? COUNTRIES[country] : null;

  const [aboutVisible, setAboutVisible] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const { church } = useChurchData();

  const handleChangeCountry = useCallback(() => {
    Alert.alert(
      'Change Country',
      'This will reset your country and language selection. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetCountry();
            router.replace('/country-select');
          },
        },
      ],
    );
  }, [resetCountry]);

  const handleChangeLanguage = useCallback(() => {
    router.push('/language-select' as never);
  }, []);

  const handleLogout = useCallback(() => {
    if (Platform.OS === 'web') {
      logout().then(() => router.replace('/(auth)/login'));
      return;
    }
    Alert.alert(
      'Mag-logout',
      'Sigurado ka bang gusto mong mag-logout?',
      [
        { text: 'Kanselahin', style: 'cancel' },
        { text: 'Mag-logout', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }},
      ]
    );
  }, [logout]);

  const toggle = useCallback((key: keyof typeof settings.notif) =>
    updateNotifSettings({ [key]: !settings.notif[key] }), [settings.notif, updateNotifSettings]);

  const divider = <View style={[styles.divider, { backgroundColor: theme.border }]} />;

  const content = (
    <>
      <BackBar />
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <GradientView colors={[theme.primaryDark, theme.primary]} style={styles.header}>
          <AppText variant="displaySm" color={theme.textInverse}>Mga Setting</AppText>
          <AppText variant="bodySm" color={theme.accentLight}>App preferences</AppText>
        </GradientView>

        {/* Appearance — dark mode toggle */}
        <SectionCard title="Hitsura">
          <SettingRow
            icon={mode === 'dark' ? 'moon' : 'sunny-outline'}
            label="Dark Mode"
            value={mode === 'dark' ? 'Naka-on' : 'Naka-off'}
            right={
              <Switch
                value={mode === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.textInverse}
                accessible
                accessibilityLabel="Toggle dark mode"
              />
            }
          />
        </SectionCard>

        {/* Account */}
        <SectionCard title="Account">
          <SettingRow icon="person-outline" label="I-edit ang Profile" onPress={() => router.push('/profile/edit' as never)} />
          {divider}
          <SettingRow icon="lock-closed-outline" label="Baguhin ang Password" onPress={() => setPwVisible(true)} />
          {divider}
          <SettingRow icon="business-outline" label="Aking Simbahan" value={church.name} />
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Mga Abiso">
          {([
            ['announcements',    'Mga Anunsyo',               'newspaper-outline'    ],
            ['events',           'Mga Kaganapan',              'star-outline'         ],
            ['sacraments',       'Mga Sakramento',             'water-outline'        ],
            ['dailyReadings',    'Pang-araw-araw na Pagbasa',  'book-outline'         ],
            ['fastingReminders', 'Paalala ng Pag-aayuno',      'alert-circle-outline' ],
          ] as [keyof typeof settings.notif, string, React.ComponentProps<typeof Ionicons>['name']][]).map(([key, label, icon], i) => (
            <React.Fragment key={key}>
              {i > 0 && divider}
              <SettingRow
                icon={icon}
                label={label}
                right={
                  <Switch
                    value={settings.notif[key]}
                    onValueChange={() => toggle(key)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={theme.textInverse}
                    accessible
                    accessibilityLabel={label}
                  />
                }
              />
            </React.Fragment>
          ))}
        </SectionCard>

        {/* Preferences */}
        <SectionCard title="Mga Kagustuhan">
          {ENABLE_COUNTRY_SELECTION && (
            <>
              <SettingRow
                icon="globe-outline"
                label="Country"
                value={countryConfig ? `${countryConfig.flag}  ${countryConfig.name}` : 'Not set'}
                onPress={handleChangeCountry}
              />
              {divider}
              <SettingRow
                icon="language-outline"
                label="Language"
                value={countryConfig?.availableLanguages.find(
                  (l) => l.code === useCountryStore.getState().language
                )?.nativeName ?? '—'}
                onPress={handleChangeLanguage}
              />
              {divider}
            </>
          )}
          <SettingRow
            icon="language-outline"
            label="Wika"
            value={settings.language}
            right={
              <TouchableOpacity
                onPress={() => updateSettings({ language: settings.language === 'Filipino' ? 'English' : 'Filipino' })}
                style={[styles.togglePill, { borderColor: theme.border }]}
                accessible
                accessibilityLabel="Palitan ang wika"
              >
                <AppText variant="label" color={theme.primary}>{settings.language}</AppText>
              </TouchableOpacity>
            }
          />
          {divider}
          <SettingRow
            icon="text-outline"
            label="Laki ng Teksto"
            value={settings.textSize}
            right={
              <TouchableOpacity
                onPress={() => {
                  const sizes = ['Small', 'Normal', 'Large'] as const;
                  const idx = sizes.indexOf(settings.textSize);
                  updateSettings({ textSize: sizes[(idx + 1) % 3] });
                }}
                style={[styles.togglePill, { borderColor: theme.border }]}
                accessible
                accessibilityLabel="Palitan ang laki ng teksto"
              >
                <AppText variant="label" color={theme.primary}>{settings.textSize}</AppText>
              </TouchableOpacity>
            }
          />
          {divider}
          <SettingRow
            icon="eye-outline"
            label="Makikita sa Direktoryo"
            right={
              <Switch
                value={settings.directoryVisible}
                onValueChange={(v) => updateSettings({ directoryVisible: v })}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.textInverse}
                accessible
                accessibilityLabel="Directory visibility"
              />
            }
          />
        </SectionCard>

        {/* About */}
        <SectionCard title="Tungkol sa App">
          <SettingRow icon="information-circle-outline" label="Bersyon ng App" value={APP_VERSION} />
          {divider}
          <SettingRow icon="business-outline" label="Parokya" value={church.name} />
          {divider}
          <SettingRow icon="globe-outline" label="Diyosesis" value={church.diocese} />
          {divider}
          <SettingRow icon="help-circle-outline" label="Tungkol sa Simbahan App" onPress={() => setAboutVisible(true)} />
        </SectionCard>

        {/* Logout */}
        <View style={styles.logoutWrap}>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: theme.danger + '44', backgroundColor: theme.dangerPale }]}
            accessible
            accessibilityLabel="Mag-logout"
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
            <AppText variant="headingSm" color={theme.danger}>Mag-logout</AppText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );

  return (
    <>
      {isWeb
        ? <WebLayout>{content}</WebLayout>
        : <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={['top']}>{content}</SafeAreaView>
      }

      {/* About modal */}
      <Modal visible={aboutVisible} transparent animationType="fade" onRequestClose={() => setAboutVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <AppText variant="headingMd" color={theme.primary}>✝ Simbahan App</AppText>
            <AppText variant="bodyMd" color={theme.textSecondary} style={{ textAlign: 'center' }}>
              Ang Simbahan App ay isang libreng mobile app para sa mga miyembro ng parokya. Dinisenyo para sa mas malalim na koneksyon sa pananampalataya at komunidad.
            </AppText>
            <AppText variant="caption" color={theme.textMuted}>Bersyon {APP_VERSION}</AppText>
            <AppButton label="Isara" onPress={() => setAboutVisible(false)} variant="ghost" />
          </View>
        </View>
      </Modal>

      {/* Change password modal */}
      <Modal visible={pwVisible} transparent animationType="slide" onRequestClose={() => setPwVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.modalCard, { backgroundColor: theme.surface }]}>
            <AppText variant="headingMd" color={theme.primary}>Baguhin ang Password</AppText>
            <AppText variant="bodyMd" color={theme.textSecondary} style={{ textAlign: 'center' }}>
              Ang feature na ito ay available sa susunod na update. Makipag-ugnayan sa opisina ng parokya para sa tulong.
            </AppText>
            <AppButton label="Isara" onPress={() => setPwVisible(false)} />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { paddingBottom: Spacing.xxl },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl, gap: 4 },
  sectionCard: { margin: Spacing.md, marginBottom: 0 },
  sectionLabel: { marginBottom: Spacing.xs, marginLeft: Spacing.xs, letterSpacing: 0.5 },
  sectionBody: { borderWidth: 1, borderRadius: Radius.md, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
  },
  settingIcon: {
    width: 32, height: 32, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, marginLeft: Spacing.md + 32 + Spacing.sm },
  togglePill: {
    borderWidth: 1, borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm, paddingVertical: 2,
  },
  logoutWrap: { margin: Spacing.md, marginTop: Spacing.lg },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, paddingVertical: Spacing.md,
  },
  modalOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl,
  },
  modalCard: {
    borderRadius: Radius.lg, padding: Spacing.xl,
    alignItems: 'center', gap: Spacing.md, width: '100%', maxWidth: 360,
  },
});
