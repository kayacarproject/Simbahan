import { Colors } from '../constants/Colors';

export const lightTheme = {
  // ── Identity ──────────────────────────────────────────────────────────────
  mode: 'light' as const,

  // ── Surfaces ──────────────────────────────────────────────────────────────
  background:       Colors.cream,        // main screen bg
  surface:          Colors.textInverse,  // cards, modals, sheets
  surface2:         Colors.cream2,       // subtle secondary surface

  // ── Text ──────────────────────────────────────────────────────────────────
  text:             Colors.textPrimary,
  textSecondary:    Colors.textSecondary,
  textMuted:        Colors.textMuted,
  textInverse:      Colors.textInverse,

  // ── Brand ─────────────────────────────────────────────────────────────────
  primary:          Colors.navy,
  primaryLight:     Colors.navyLight,
  primaryDark:      Colors.navyDark,
  accent:           Colors.gold,
  accentLight:      Colors.goldLight,
  accentPale:       Colors.goldPale,
  danger:           Colors.crimson,
  dangerPale:       Colors.crimsonPale,
  success:          Colors.sage,
  successPale:      Colors.sagePale,

  // ── Borders ───────────────────────────────────────────────────────────────
  border:           Colors.border,
  borderDark:       Colors.borderDark,

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputBackground:  Colors.cream,
  inputBorder:      Colors.border,
  inputBorderFocus: Colors.navy,
  inputText:        Colors.textPrimary,
  inputPlaceholder: Colors.textMuted,

  // ── Navigation ────────────────────────────────────────────────────────────
  navBackground:    Colors.navyDark,
  navText:          Colors.textInverse,
  navActive:        Colors.gold,
  tabBackground:    Colors.textInverse,
  tabActive:        Colors.navy,
  tabInactive:      Colors.textMuted,

  // ── Overlay ───────────────────────────────────────────────────────────────
  overlay:          'rgba(0,0,0,0.5)',
} as const;

export type AppTheme = typeof lightTheme;
