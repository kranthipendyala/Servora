import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';

interface CityCardProps {
  name: string;
  slug: string;
  businessCount?: number;
  onPress: (name: string, slug: string) => void;
  compact?: boolean;
  isSelected?: boolean;
}

export default function CityCard({
  name,
  slug,
  businessCount,
  onPress,
  compact = false,
  isSelected = false,
}: CityCardProps) {
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, isSelected && styles.compactSelected]}
        onPress={() => onPress(name, slug)}
        activeOpacity={0.7}>
        <View style={[styles.compactIcon, isSelected && styles.compactIconSelected]}>
          <Icon
            name="location"
            size={20}
            color={isSelected ? Colors.white : Colors.primary}
          />
        </View>
        <Text
          style={[styles.compactName, isSelected && styles.compactNameSelected]}
          numberOfLines={1}>
          {name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selected]}
      onPress={() => onPress(name, slug)}
      activeOpacity={0.7}>
      <View style={styles.left}>
        <Icon name="location-outline" size={22} color={Colors.primary} />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {businessCount !== undefined && businessCount > 0 && (
            <Text style={styles.count}>
              {businessCount} business{businessCount !== 1 ? 'es' : ''}
            </Text>
          )}
        </View>
      </View>
      {isSelected && (
        <Icon name="checkmark-circle" size={22} color={Colors.green} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.blueLight,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  info: {
    marginLeft: Spacing.md,
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
    alignItems: 'center',
    marginRight: Spacing.lg,
    width: 70,
  },
  compactSelected: {},
  compactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  compactIconSelected: {
    backgroundColor: Colors.primary,
  },
  compactName: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  compactNameSelected: {
    color: Colors.primary,
    fontWeight: Fonts.weights.bold,
  },
});
