import React from 'react';
import {View, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors} from '../theme';

interface RatingStarsProps {
  rating: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  showEmpty?: boolean;
}

export default function RatingStars({
  rating,
  size = 16,
  color = Colors.star,
  emptyColor = Colors.starEmpty,
  showEmpty = true,
}: RatingStarsProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const totalStars = 5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Icon key={`full-${i}`} name="star" size={size} color={color} style={styles.star} />,
    );
  }

  if (hasHalf) {
    stars.push(
      <Icon key="half" name="star-half" size={size} color={color} style={styles.star} />,
    );
  }

  if (showEmpty) {
    const emptyCount = totalStars - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < emptyCount; i++) {
      stars.push(
        <Icon
          key={`empty-${i}`}
          name="star-outline"
          size={size}
          color={emptyColor}
          style={styles.star}
        />,
      );
    }
  }

  return <View style={styles.container}>{stars}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 1,
  },
});
