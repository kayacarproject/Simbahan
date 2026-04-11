import { Platform } from 'react-native';

/**
 * Returns `{ accessible: true }` on native only.
 * On web, `accessible` is not a valid DOM attribute and causes a React warning.
 */
export const a11y = Platform.OS !== 'web' ? { accessible: true as const } : {};
