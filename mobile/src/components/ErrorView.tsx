import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
  icon?: string;
}

export default function ErrorView({
  message = 'Something went wrong. Please try again.',
  onRetry,
  icon = 'alert-circle-outline',
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={Colors.gray300} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.7}>
          <Icon name="refresh-outline" size={18} color={Colors.white} />
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingVertical: Spacing.xxxxl,
    backgroundColor: Colors.background,
  },
  message: {
    fontSize: Fonts.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    marginLeft: Spacing.sm,
  },
});
