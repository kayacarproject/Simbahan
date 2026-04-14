import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  BackHandler,
  Platform,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import GradientView from '../../components/ui/GradientView';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, Radius } from '../../constants/Layout';
import { AppText, Card, Badge } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { apiRegister, getPublicData } from '../../services/ApiHandler';
import Api from '../../services/api';

type Church = {
  _id?: string;
  id?: string;
  name: string;
  diocese?: string;
  address?: string;
  members?: number;
  image?: string;
  [key: string]: unknown;
};

function getChurchId(c: Church): string {
  return (c._id ?? c.id ?? '') as string;
}

export default function JoinChurchScreen() {
  const { formData } = useLocalSearchParams<{ formData?: string }>();

  const parsedFormData = useMemo(() => {
    if (!formData) return null;
    try {
      const parsed = JSON.parse(formData as string);
      console.log('[JOIN-CHURCH] Received Data:', { ...parsed, password: `(${parsed.password?.length ?? 0} chars)` });
      return parsed;
    } catch {
      return null;
    }
  }, [formData]);

  const [query, setQuery]               = useState('');
  const [churchList, setChurchList]     = useState<Church[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [message, setMessage]           = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);

  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const loginStore   = useAuthStore((s) => s.login);
  const { showToast } = useToast();

  // ── Android back button — go back, never exit ──────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (modalVisible) { setModalVisible(false); return true; }
        router.back();
        return true;
      });
      return () => sub.remove();
    }, [modalVisible]),
  );

  // ── Fetch church list on mount ─────────────────────────────────────────────
  const fetchChurchList = useCallback(async () => {
    setFetchLoading(true);

    const body = {
      appName:    Api.appName,
      moduleName: 'church',
      query:      {},
      limit:      20,
      skip:       0,
      sortBy:     'createdAt',
      order:      'descending' as const,
    };

    console.log('[JOIN-CHURCH] Fetch Body:', body);

    try {
      const data = await getPublicData(body);

      if (data?.success === true) {
        const list: Church[] = data?.data ?? [];
        console.log('[JOIN-CHURCH] Church List:', list);
        setChurchList(list);
      } else {
        showToast({ type: 'error', message: data?.message || 'No churches found.' });
        setChurchList([]);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Something went wrong.';
      console.log('[JOIN-CHURCH] Fetch Error:', msg);
      showToast({ type: 'error', message: msg });
      setChurchList([]);
    } finally {
      setFetchLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchChurchList(); }, []);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      churchList.filter(
        (c) =>
          query.trim() === '' ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          (c.diocese ?? '').toLowerCase().includes(query.toLowerCase()),
      ),
    [query, churchList],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleRequest = useCallback((church: Church) => {
    setSelectedChurch(church);
    setModalVisible(true);
  }, []);

  const handleSubmit = useCallback(async () => {
    setModalVisible(false);

    if (!parsedFormData) {
      showToast({ type: 'error', message: 'Registration data missing. Please go back and try again.' });
      return;
    }

    setLoading(true);

    const body = {
      ...parsedFormData,
      churchId: selectedChurch?._id ?? selectedChurch?.id,
    };

    console.log('[FINAL REGISTER BODY]:', { ...body, password: `(${body.password?.length ?? 0} chars)` });

    try {
      const data = await apiRegister(body);

      if (data?.status === 'success') {
        const token  = data?.data?.access_token;
        const userId = data?.data?.user?.id ?? data?.data?.user?._id ?? '';

        console.log('[FINAL REGISTER] Token  :', token  ? token.slice(0, 20) + '…' : 'none');
        console.log('[FINAL REGISTER] UserID :', userId || '(not in response)');

        if (token) {
          await SecureStore.setItemAsync('access_token', token);
          if (userId) await SecureStore.setItemAsync('user_id', userId);
        }

        await loginStore(userId || undefined);
        setSuccess(true);
      } else {
        showToast({ type: 'error', message: data?.message || 'Registration failed. Please try again.' });
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Something went wrong. Please try again.';
      console.log('[FINAL REGISTER] Error:', error?.response?.data || error.message);
      showToast({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  }, [parsedFormData, selectedChurch, loginStore, showToast]);

  const handleSkip = useCallback(async () => {
    await setOnboarded();
    router.replace('/home');
  }, [setOnboarded]);

  // ── List helpers ───────────────────────────────────────────────────────────
  const keyExtractor = useCallback((item: Church) => getChurchId(item), []);

  const renderChurch = useCallback(
    ({ item }: ListRenderItemInfo<Church>) => (
      <Card style={styles.churchCard}>
        {item.image ? (
          <Image source={{ uri: item.image as string }} style={styles.churchImage} contentFit="cover" transition={200} />
        ) : null}
        <View style={styles.churchBody}>
          <AppText variant="headingSm" color={Colors.navy}>{item.name}</AppText>
          {item.address ? (
            <View style={styles.churchMeta}>
              <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
              <AppText variant="caption" color={Colors.textMuted} style={styles.metaText}>{item.address as string}</AppText>
            </View>
          ) : null}
          {item.diocese ? (
            <AppText variant="caption" color={Colors.textMuted}>{item.diocese as string}</AppText>
          ) : null}
          <View style={styles.churchFooter}>
            {item.members != null ? (
              <Badge label={`${Number(item.members).toLocaleString()} members`} variant="navy" />
            ) : <View />}
            <TouchableOpacity
              onPress={() => handleRequest(item)}
              style={styles.requestBtn}
              accessible
              accessibilityLabel={`Request to join ${item.name}`}
              activeOpacity={0.8}
            >
              <AppText variant="label" color={Colors.textInverse}>Request to Join</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    ),
    [handleRequest],
  );

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <SafeAreaView style={styles.successScreen} edges={['top', 'bottom']}>
        <View style={styles.successContent}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={40} color={Colors.textInverse} />
          </View>
          <AppText variant="displaySm" color={Colors.navy} style={styles.successTitle}>
            Request Sent!
          </AppText>
          <AppText variant="bodyMd" color={Colors.textSecondary} style={styles.successSub}>
            Your request to join {selectedChurch?.name} has been submitted. You'll be notified once approved.
          </AppText>
          <TouchableOpacity
            onPress={() => router.replace('/home')}
            style={styles.backLoginBtn}
            accessible
            accessibilityLabel="Go to Home"
            activeOpacity={0.8}
          >
            <AppText variant="label" color={Colors.textInverse}>Go to Home</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkip}
            accessible
            accessibilityLabel="Skip approval and enter app"
            style={styles.skipLink}
          >
            <AppText variant="bodySm" color={Colors.navy}>Skip Approval → Enter App</AppText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main screen ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GradientView colors={[Colors.gold, Colors.goldLight]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessible
          accessibilityLabel="Go back"
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.navy} />
        </TouchableOpacity>
        <AppText variant="headingMd" color={Colors.navy}>Find Your Parish</AppText>
        <AppText variant="bodySm" color={Colors.navyDark} style={styles.headerSub}>
          Search and request to join your church
        </AppText>
      </GradientView>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by church name or diocese..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          accessible
          accessibilityLabel="Search churches"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} accessible accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderChurch}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        ListEmptyComponent={
          fetchLoading ? (
            <ActivityIndicator size="large" color={Colors.navy} style={{ marginTop: Spacing.xxl }} />
          ) : (
            <AppText variant="bodyMd" color={Colors.textMuted} style={styles.emptyText}>
              No churches found.
            </AppText>
          )
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <AppText variant="headingMd" color={Colors.navy} style={styles.modalTitle}>
              Request to Join
            </AppText>
            {selectedChurch && (
              <AppText variant="bodyMd" color={Colors.textSecondary} style={styles.modalChurch}>
                {selectedChurch.name}
              </AppText>
            )}
            <AppText variant="label" color={Colors.textSecondary} style={styles.modalLabel}>
              Message (optional)
            </AppText>
            <TextInput
              style={styles.messageInput}
              placeholder="Introduce yourself to the parish..."
              placeholderTextColor={Colors.textMuted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              accessible
              accessibilityLabel="Message to parish"
            />
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, loading && { opacity: 0.6 }]}
              disabled={loading}
              accessible
              accessibilityLabel="Submit request"
              activeOpacity={0.8}
            >
              <AppText variant="label" color={Colors.textInverse}>
                {loading ? 'Submitting…' : 'Submit Request'}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              accessible
              accessibilityLabel="Cancel"
              style={styles.cancelBtn}
            >
              <AppText variant="bodyMd" color={Colors.textMuted}>Cancel</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.lg },
  backBtn: { marginBottom: Spacing.sm },
  headerSub: { marginTop: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    margin: Spacing.md, paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.textInverse, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, height: 44,
  },
  searchIcon: { marginRight: Spacing.xs },
  searchInput: { flex: 1, ...Typography.bodyMd, color: Colors.textPrimary, height: 44 },
  list: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xxl },
  emptyText: { textAlign: 'center', marginTop: Spacing.xxl },
  churchCard: { marginBottom: Spacing.md, padding: 0, overflow: 'hidden' },
  churchImage: { width: '100%', height: 130 },
  churchBody: { padding: Spacing.md },
  churchMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 2 },
  metaText: { marginLeft: 4 },
  churchFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  requestBtn: { backgroundColor: Colors.navy, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.textInverse,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Spacing.lg, paddingBottom: Spacing.xxl,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.md },
  modalTitle: { marginBottom: Spacing.xs },
  modalChurch: { marginBottom: Spacing.md },
  modalLabel: { marginBottom: Spacing.xs },
  messageInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    padding: Spacing.sm, ...Typography.bodyMd, color: Colors.textPrimary,
    height: 100, textAlignVertical: 'top', marginBottom: Spacing.md, backgroundColor: Colors.cream,
  },
  submitBtn: { backgroundColor: Colors.navy, borderRadius: Radius.md, height: 48, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  cancelBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  successScreen: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' },
  successContent: { alignItems: 'center', paddingHorizontal: Spacing.xl },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  successTitle: { textAlign: 'center', marginBottom: Spacing.sm },
  successSub: { textAlign: 'center', marginBottom: Spacing.xl },
  backLoginBtn: { backgroundColor: Colors.navy, borderRadius: Radius.md, height: 48, paddingHorizontal: Spacing.xl, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  skipLink: { paddingVertical: Spacing.sm },
});
