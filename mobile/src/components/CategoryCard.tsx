import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';
import type {Category} from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  compact?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  'auto-repair': 'car-outline',
  'car-service': 'car-sport-outline',
  'bike-service': 'bicycle-outline',
  'ac-repair': 'snow-outline',
  plumbing: 'water-outline',
  electrical: 'flash-outline',
  carpentry: 'hammer-outline',
  painting: 'color-palette-outline',
  cleaning: 'sparkles-outline',
  'pest-control': 'bug-outline',
  appliances: 'tv-outline',
  welding: 'construct-outline',
  fabrication: 'build-outline',
  'home-repair': 'home-outline',
  construction: 'business-outline',
  interiors: 'bed-outline',
  gardening: 'leaf-outline',
  shifting: 'cube-outline',
  default: 'settings-outline',
};

function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] || CATEGORY_ICONS.default;
}

export default function CategoryCard({
  category,
  onPress,
  compact = false,
}: CategoryCardProps) {
  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={() => onPress(category)}
        activeOpacity={0.7}>
        <View style={styles.compactIconWrapper}>
          <Icon
            name={getCategoryIcon(category.slug)}
            size={24}
            color={Colors.primary}
          />
        </View>
        <Text style={styles.compactName} numberOfLines={2}>
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(category)}
      activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <Icon
          name={getCategoryIcon(category.slug)}
          size={28}
          color={Colors.primary}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {category.name}
        </Text>
        {category.business_count > 0 && (
          <Text style={styles.count}>
            {category.business_count} business
            {category.business_count !== 1 ? 'es' : ''}
          </Text>
        )}
      </View>
      <Icon name="chevron-forward" size={18} color={Colors.gray300} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    ...Shadows.sm,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  count: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  compactContainer: {
    width: 80,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  compactIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  compactName: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
