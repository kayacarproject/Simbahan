import { TextStyle } from 'react-native';

const playfair = 'PlayfairDisplay_700Bold';
const playfairMd = 'PlayfairDisplay_600SemiBold';
const sans = 'DMSans_400Regular';
const sansMd = 'DMSans_500Medium';

export const Typography: Record<string, TextStyle> = {
  displayLg: { fontFamily: playfair, fontSize: 36, lineHeight: 44 },
  displayMd: { fontFamily: playfair, fontSize: 28, lineHeight: 36 },
  displaySm: { fontFamily: playfair, fontSize: 22, lineHeight: 30 },
  headingMd: { fontFamily: playfairMd, fontSize: 18, lineHeight: 26 },
  headingSm: { fontFamily: playfairMd, fontSize: 15, lineHeight: 22 },
  bodyLg: { fontFamily: sans, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: sans, fontSize: 14, lineHeight: 22 },
  bodySm: { fontFamily: sans, fontSize: 12, lineHeight: 18 },
  caption: { fontFamily: sans, fontSize: 11, lineHeight: 16 },
  label: { fontFamily: sansMd, fontSize: 12, lineHeight: 16 },
};
