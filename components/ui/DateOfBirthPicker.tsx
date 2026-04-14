import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Spacing, Radius } from '../../constants/Layout';
import { Typography } from '../../constants/Typography';
import AppText from './AppText';

// Lazy-import so web bundle never pulls in the native module
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface Props {
  value: Date | null;
  onChange: (date: Date) => void;
  label?: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ISO string for HTML date input (YYYY-MM-DD)
function toISODate(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

export default function DateOfBirthPicker({ value, onChange, label = 'Date of Birth' }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const handleNativeChange = useCallback(
    (_: any, selected?: Date) => {
      setShowPicker(Platform.OS === 'ios'); // keep open on iOS until dismissed
      if (selected) onChange(selected);
    },
    [onChange],
  );

  // ── Web: native HTML date input ────────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={styles.fieldWrap}>
        <AppText variant="label" color={Colors.textSecondary} style={styles.fieldLabel}>
          {label}
        </AppText>
        <View style={styles.inputRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} style={styles.icon} />
          <input
            type="date"
            value={toISODate(value)}
            max={toISODate(new Date())}
            onChange={(e) => {
              if (e.target.value) onChange(new Date(e.target.value));
            }}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              ...Typography.bodyMd,
              color: value ? Colors.textPrimary : Colors.textMuted,
              outline: 'none',
              cursor: 'pointer',
              height: 44,
              fontFamily: 'DMSans_400Regular, sans-serif',
            } as any}
          />
        </View>
      </View>
    );
  }

  // ── Mobile: tap to open DateTimePicker ────────────────────────────────────
  return (
    <View style={styles.fieldWrap}>
      <AppText variant="label" color={Colors.textSecondary} style={styles.fieldLabel}>
        {label}
      </AppText>

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.inputRow}
        activeOpacity={0.7}
        accessible
        accessibilityLabel={`Select ${label}`}
      >
        <AppText
          variant="bodyMd"
          color={value ? Colors.textPrimary : Colors.textMuted}
          style={styles.dateText}
        >
          {value ? formatDate(value) : 'Select date'}
        </AppText>
        <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
      </TouchableOpacity>

      {showPicker && DateTimePicker && (
        <DateTimePicker
          value={value ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={handleNativeChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: Spacing.sm },
  fieldLabel: { marginBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    height: 44,
    backgroundColor: Colors.cream,
  },
  icon: { marginRight: Spacing.xs },
  dateText: { flex: 1 },
});
