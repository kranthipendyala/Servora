import {StyleSheet} from 'react-native';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from './index';

export const CommonStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexRowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenPadding: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    ...Shadows.md,
  },
  cardFlat: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
  },
  sectionHeaderTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  sectionHeaderLink: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.accent,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.red,
  },
  errorText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.red,
    marginTop: Spacing.xs,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
  },
  buttonPrimaryText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
  },
  buttonAccent: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
  },
  buttonAccentText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
  },
  buttonGreen: {
    backgroundColor: Colors.green,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
  },
  buttonGreenText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
  },
  buttonOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexDirection: 'row' as const,
  },
  buttonOutlineText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start' as const,
  },
  badgeVerified: {
    backgroundColor: Colors.blueLight,
  },
  badgeVerifiedText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
    color: Colors.blue,
  },
  badgeFeatured: {
    backgroundColor: '#FFF3E0',
  },
  badgeFeaturedText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
    color: Colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  chip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  chipTextActive: {
    color: Colors.white,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray200,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  avatarText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.xxxxl,
  },
  emptyText: {
    fontSize: Fonts.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
    marginTop: Spacing.lg,
  },
  listFooter: {
    paddingVertical: Spacing.xl,
    alignItems: 'center' as const,
  },
});

export default CommonStyles;
