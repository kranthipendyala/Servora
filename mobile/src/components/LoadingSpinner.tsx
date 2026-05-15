import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';
import {Colors, Fonts, Spacing} from '../theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = 'Loading...',
  size = 'large',
  color = Colors.primary,
  fullScreen = true,
}: LoadingSpinnerProps) {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return <View style={styles.inline}>{content}</View>;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  inline: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  message: {
    marginTop: Spacing.md,
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
});
