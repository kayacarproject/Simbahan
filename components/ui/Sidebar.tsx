import React, { useEffect, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import AppText from './AppText';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useTheme } from '../../theme/ThemeContext';
import { useLogout } from '../../hooks/useLogout';
import churchData from '../../data/church.json';

const SIDEBAR_W = 280;

type NavItem = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
  route: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Tahanan',  icon: 'home-outline',   activeIcon: 'home',   route: '/home'        },
  { label: 'Higit Pa', icon: 'grid-outline',   activeIcon: 'grid',   route: '/(tabs)/more' },
  { label: 'Profile',  icon: 'person-outline', activeIcon: 'person', route: '/profile'     },
];

const NavRow = React.memo(({ item, isActive, onPress }: {
  item: NavItem; isActive: boolean; onPress: (route: string) => void;
}) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onPress(item.route)}
      activeOpacity={0.75}
      accessible
      accessibilityLabel={item.label}
      style={[
        styles.navItem,
        isActive && { backgroundColor: theme.accentPale },
      ]}
    >
      {isActive && <View style={[styles.activeBar, { backgroundColor: theme.accent }]} />}
      <View style={[
        styles.navIconWrap,
        { backgroundColor: theme.surface2 },
        isActive && { backgroundColor: theme.accentPale },
      ]}>
        <Ionicons
          name={isActive ? item.activeIcon : item.icon}
          size={20}
          color={isActive ? theme.accent : theme.textSecondary}
        />
      </View>
      <AppText
        variant="bodyMd"
        color={isActive ? theme.primary : theme.textSecondary}
        style={isActive ? styles.navLabelActive : undefined}
      >
        {item.label}
      </AppText>
    </TouchableOpacity>
  );
});

export default function Sidebar() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isOpen = useUiStore((s) => s.sidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { logout } = useLogout();
  const pathname = usePathname();

  const translateX = useSharedValue(-SIDEBAR_W);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withTiming(isOpen ? 0 : -SIDEBAR_W, { duration: 280 });
    overlayOpacity.value = withTiming(isOpen ? 1 : 0, { duration: 280 });
  }, [isOpen]);

  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    pointerEvents: isOpen ? 'auto' : 'none',
  }));

  const navigate = useCallback((route: string) => {
    closeSidebar();
    setTimeout(() => router.push(route as never), 50);
  }, [closeSidebar]);

  const handleLogout = useCallback(async () => {
    closeSidebar();
    await logout();
  }, [closeSidebar, logout]);

  if (Platform.OS === 'web') return null;

  return (
    <>
      <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar} />
      </Animated.View>

      <Animated.View style={[
        styles.drawer,
        drawerStyle,
        { paddingTop: insets.top, backgroundColor: theme.background },
      ]}>
        {/* Header */}
        <View style={styles.drawerHeader}>
          <View style={[styles.crossBadge, { backgroundColor: theme.primary }]}>
            <AppText variant="headingMd" color={Colors.textInverse}>✝</AppText>
          </View>
          <View style={styles.headerText}>
            <AppText variant="headingSm" color={theme.primary}>{churchData.name}</AppText>
            <AppText variant="caption" color={theme.textMuted} numberOfLines={1}>
              {currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Your parish, in your pocket'}
            </AppText>
          </View>
          <TouchableOpacity onPress={closeSidebar} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Nav items */}
        <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
          {NAV_ITEMS.map((item) => {
            const cleanRoute = item.route.replace('/(tabs)', '');
            const isActive =
              pathname === item.route ||
              pathname === cleanRoute ||
              (item.route !== '/home' && cleanRoute !== '/' && pathname.startsWith(cleanRoute));
            return <NavRow key={item.label} item={item} isActive={isActive} onPress={navigate} />;
          })}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + Spacing.md }]}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.75}
            accessible
            accessibilityLabel="Logout"
            style={styles.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.danger} />
            <AppText variant="bodyMd" color={theme.danger}>Mag-logout</AppText>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay:          { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 100 },
  drawer:           { position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, zIndex: 101 },
  drawerHeader:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, gap: Spacing.sm },
  crossBadge:       { width: 40, height: 40, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  headerText:       { flex: 1 },
  closeBtn:         { padding: Spacing.xs },
  divider:          { height: 1, marginHorizontal: Spacing.md },
  navList:          { flex: 1, paddingTop: Spacing.sm },
  navItem:          { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.md, marginHorizontal: Spacing.sm, borderRadius: Radius.sm, marginBottom: 2, gap: Spacing.sm, position: 'relative' },
  activeBar:        { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2 },
  navIconWrap:      { width: 34, height: 34, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  navLabelActive:   { fontFamily: 'DMSans_500Medium' },
  drawerFooter:     { paddingTop: Spacing.sm },
  logoutBtn:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
});
