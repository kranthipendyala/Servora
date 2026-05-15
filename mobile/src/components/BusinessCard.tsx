import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';
import RatingStars from './RatingStars';
import type {Business} from '../types';

interface BusinessCardProps {
  business: Business;
  onPress: (business: Business) => void;
}

export default function BusinessCard({business, onPress}: BusinessCardProps) {
  const handleCall = () => {
    const phone = business.phone || business.mobile;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEnquiry = () => {
    onPress(business);
  };

  const imageSource = business.logo
    ? {uri: business.logo}
    : undefined;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(business)}
      activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="business-outline" size={32} color={Colors.gray300} />
            </View>
          )}
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {business.name}
            </Text>
            {business.is_verified && (
              <View style={styles.verifiedBadge}>
                <Icon name="checkmark-circle" size={14} color={Colors.verified} />
              </View>
            )}
          </View>

          {business.is_featured && (
            <View style={styles.featuredBadge}>
              <Icon name="star" size={10} color={Colors.accent} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}

          <View style={styles.ratingRow}>
            <RatingStars rating={business.average_rating} size={14} />
            <Text style={styles.ratingText}>
              {business.average_rating > 0
                ? business.average_rating.toFixed(1)
                : 'New'}
            </Text>
            {business.review_count > 0 && (
              <Text style={styles.reviewCount}>
                ({business.review_count} review
                {business.review_count !== 1 ? 's' : ''})
              </Text>
            )}
          </View>

          {business.categories && business.categories.length > 0 && (
            <Text style={styles.category} numberOfLines={1}>
              {business.categories.map(c => c.name).join(', ')}
            </Text>
          )}

          <View style={styles.addressRow}>
            <Icon name="location-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.address} numberOfLines={1}>
              {business.locality
                ? `${business.locality}, ${business.city_name}`
                : business.address || business.city_name}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        {(business.phone || business.mobile) && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
            activeOpacity={0.7}>
            <Icon name="call" size={16} color={Colors.white} />
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.enquiryButton}
          onPress={handleEnquiry}
          activeOpacity={0.7}>
          <Icon name="chatbubble-outline" size={16} color={Colors.primary} />
          <Text style={styles.enquiryButtonText}>Enquiry</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
    ...Shadows.md,
  },
  content: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: Spacing.xs,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  featuredText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
    color: Colors.accent,
    marginLeft: 3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
  },
  reviewCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  category: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginLeft: 3,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.green,
    paddingVertical: Spacing.md,
  },
  callButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    marginLeft: Spacing.sm,
  },
  enquiryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: Colors.divider,
  },
  enquiryButtonText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    marginLeft: Spacing.sm,
  },
});
