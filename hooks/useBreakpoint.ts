import { useWindowDimensions, Platform } from 'react-native';

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    // Platform.OS is set at build time — never misidentifies a wide tablet as web
    isWeb: Platform.OS === 'web',
    isTablet: width >= 600 && width < 768,
    isMobile: width < 600,
    width,
  };
}
