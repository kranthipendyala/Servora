import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';

interface LocationBannerProps {
  cityName: string;
  source: 'gps' | 'ip' | 'manual' | 'default';
  onChangeCity: () => void;
}

export default function LocationBanner({
  cityName,
  source,
  onChangeCity,
}: LocationBannerProps) {
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const sourceIcon =
    source === 'gps'
      ? 'navigate'
      : source === 'ip'
        ? 'wifi'
        : 'location';
  const sourceLabel =
    source === 'gps'
      ? 'Detected via GPS'
      : source === 'ip'
        ? 'Detected via network'
        : source === 'manual'
          ? 'Selected city'
          : 'Default city';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY: slideAnim}],
          opacity: opacityAnim,
        },
      ]}>
      <View style={styles.left}>
        <Icon name={sourceIcon} size={16} color={Colors.accent} />
        <View style={styles.textContainer}>
          <Text style={styles.label}>Showing results for</Text>
          <Text style={styles.cityName}>{cityName}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.changeButton}
        onPress={onChangeCity}
        activeOpacity={0.7}>
        <Text style={styles.changeText}>Change</Text>
        <Icon name="chevron-forward" size={14} color={Colors.accent} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.blueLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: Spacing.sm,
  },
  label: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },
  cityName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.primary,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  changeText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.accent,
    marginRight: Spacing.xs,
  },
});
