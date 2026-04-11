import { AppTheme } from './light';

export const darkTheme: AppTheme = {
  mode: 'dark',

  // ── Surfaces ──────────────────────────────────────────────────────────────
  background:       '#0F1117',
  surface:          '#1A1D27',
  surface2:         '#22263A',

  // ── Text ──────────────────────────────────────────────────────────────────
  text:             '#F0F0F0',
  textSecondary:    '#B0B4C8',
  textMuted:        '#6B7080',
  textInverse:      '#0F1117',

  // ── Brand ─────────────────────────────────────────────────────────────────
  primary:          '#4A6FD4',   // lighter navy for dark bg contrast
  primaryLight:     '#6B8FE8',
  primaryDark:      '#1A2B5E',
  accent:           '#E0A83A',   // slightly brighter gold
  accentLight:      '#F0C060',
  accentPale:       '#3A2E10',
  danger:           '#E05060',
  dangerPale:       '#3A1520',
  success:          '#4A9A70',
  successPale:      '#1A3028',

  // ── Borders ───────────────────────────────────────────────────────────────
  border:           '#2E3248',
  borderDark:       '#404468',

  // ── Inputs ────────────────────────────────────────────────────────────────
  inputBackground:  '#1A1D27',
  inputBorder:      '#2E3248',
  inputBorderFocus: '#4A6FD4',
  inputText:        '#F0F0F0',
  inputPlaceholder: '#6B7080',

  // ── Navigation ────────────────────────────────────────────────────────────
  navBackground:    '#0A0D18',
  navText:          '#F0F0F0',
  navActive:        '#E0A83A',
  tabBackground:    '#1A1D27',
  tabActive:        '#4A6FD4',
  tabInactive:      '#6B7080',

  // ── Overlay ───────────────────────────────────────────────────────────────
  overlay:          'rgba(0,0,0,0.7)',
};
