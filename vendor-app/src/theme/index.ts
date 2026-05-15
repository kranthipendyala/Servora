import {Platform} from 'react-native';

export const Colors = {
  primary: '#003366',
  primaryDark: '#002244',
  primaryLight: '#004488',
  accent: '#059669',
  accentDark: '#047857',
  accentLight: '#34D399',
  green: '#22C55E',
  greenDark: '#16A34A',
  greenLight: '#4ADE80',
  red: '#EF4444',
  redLight: '#FEE2E2',
  yellow: '#F59E0B',
  yellowLight: '#FEF3C7',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  background: '#F3F4F6',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
  star: '#F59E0B',
  starEmpty: '#D1D5DB',
  verified: '#3B82F6',
  featured: '#059669',
};

export const Fonts = {
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  families: {
    regular: Platform.select({ios: 'System', android: 'Roboto'}) as string,
    medium: Platform.select({ios: 'System', android: 'Roboto'}) as string,
    bold: Platform.select({ios: 'System', android: 'Roboto'}) as string,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 999,
};

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: Colors.black,
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: Colors.black,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.12,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: Colors.black,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
  xl: Platform.select({
    ios: {
      shadowColor: Colors.black,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.2,
      shadowRadius: 12,
    },
    android: {
      elevation: 12,
    },
  }),
};

export const HitSlop = {
  sm: {top: 8, bottom: 8, left: 8, right: 8},
  md: {top: 12, bottom: 12, left: 12, right: 12},
  lg: {top: 16, bottom: 16, left: 16, right: 16},
};

export default {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Shadows,
  HitSlop,
};
