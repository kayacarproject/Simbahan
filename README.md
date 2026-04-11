# Simbahan 🕍
> Your parish, in your pocket

Catholic parish mobile app built with Expo (React Native).

---

## Stack
- Expo SDK 51 + Expo Router (file-based)
- Zustand (state)
- NativeWind v4 (Tailwind styling)
- Reanimated v3 (animations)
- react-native-calendars
- Local JSON data only (no backend)

---

## Setup

### 1. Install dependencies
```bash
cd Simbahan
npm install
```

### 2. Start dev server
```bash
npx expo start
```

### 3. Run on Android
```bash
npx expo run:android
```

---

## Folder Structure
```
simbahan/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── onboarding.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx          ← Home
│   │   ├── announcements.tsx
│   │   ├── schedule.tsx
│   │   └── parish.tsx
│   ├── _layout.tsx            ← Root layout (fonts + hydration)
│   └── index.tsx              ← Redirect guard
├── components/ui/
│   ├── AnnouncementCard.tsx
│   ├── MassTimeCard.tsx
│   └── SectionHeader.tsx
├── constants/
│   └── theme.ts
├── data/
│   ├── announcements.json
│   ├── massSchedule.json
│   └── parish.json
├── hooks/
│   └── useAnnouncements.ts
├── store/
│   ├── authStore.ts
│   └── bookmarkStore.ts
└── utils/
    └── dateUtils.ts
```

---

## Design Tokens
| Token      | Value     |
|------------|-----------|
| Primary    | `#1A2B5E` |
| Accent     | `#C9922A` |
| Error      | `#9B1D20` |
| Success    | `#2D6A4F` |
| Background | `#FAFAF5` |
| Text       | `#1A1A1A` |

---

## Performance Notes
- All lists use `FlatList` with `removeClippedSubviews`, `initialNumToRender=5`, `maxToRenderPerBatch=5`
- All list items wrapped in `React.memo()`
- No inline functions in JSX (all handlers via `useCallback`)
- Images via `expo-image` with `transition={200}`
- Animations use `useNativeDriver` via Reanimated v3 shared values
