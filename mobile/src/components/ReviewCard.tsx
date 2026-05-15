import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';
import RatingStars from './RatingStars';
import type {Review} from '../types';

interface ReviewCardProps {
  review: Review;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ReviewCard({review}: ReviewCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(review.user_name)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{review.user_name}</Text>
          <View style={styles.ratingDate}>
            <RatingStars rating={review.rating} size={12} />
            <Text style={styles.date}>{formatDate(review.created_at)}</Text>
          </View>
        </View>
      </View>
      {review.title ? <Text style={styles.title}>{review.title}</Text> : null}
      {review.comment ? (
        <Text style={styles.comment}>{review.comment}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  ratingDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  title: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  comment: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
