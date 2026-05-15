import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';
import {getBusiness, getBusinessReviews, submitReview, submitEnquiry, getToken, getBusinesses} from '../services/api';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import BusinessCard from '../components/BusinessCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import type {Business, Review, RatingBreakdown} from '../types';
import type {HomeStackScreenProps} from '../navigation/types';

type Props = HomeStackScreenProps<'BusinessDetail'>;

export default function BusinessDetailScreen({route, navigation}: Props) {
  const {citySlug, businessSlug} = route.params;

  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown | null>(null);
  const [relatedBusinesses, setRelatedBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const businessRes = await getBusiness(citySlug, businessSlug);
      if (businessRes.status && businessRes.data) {
        setBusiness(businessRes.data);
        navigation.setOptions({title: businessRes.data.name});

        const [reviewsRes, relatedRes] = await Promise.all([
          getBusinessReviews(businessRes.data.id),
          getBusinesses({
            city: citySlug,
            category: businessRes.data.categories?.[0]?.slug,
            per_page: 5,
          }),
        ]);

        if (reviewsRes.status && reviewsRes.data) {
          setReviews(reviewsRes.data.reviews || []);
          setRatingBreakdown(reviewsRes.data.breakdown || null);
        }

        if (relatedRes.status && Array.isArray(relatedRes.data)) {
          setRelatedBusinesses(
            relatedRes.data.filter(b => b.id !== businessRes.data.id).slice(0, 3),
          );
        }
      } else {
        setError(businessRes.message || 'Failed to load business details');
      }
    } catch {
      setError('Failed to load business details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [citySlug, businessSlug, navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCall = () => {
    const phone = business?.phone || business?.mobile;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsApp = () => {
    const wa = business?.whatsapp || business?.mobile || business?.phone;
    if (wa) {
      const cleaned = wa.replace(/[^0-9]/g, '');
      const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`;
      Linking.openURL(`https://wa.me/${number}?text=Hi, I found your business on Servora. I would like to inquire about your services.`);
    }
  };

  const handleShare = async () => {
    if (!business) return;
    try {
      await Share.share({
        title: business.name,
        message: `Check out ${business.name} on Servora!\n${business.address || ''}`,
      });
    } catch {
      // silently fail
    }
  };

  const handleOpenMap = () => {
    if (!business) return;
    const addr = encodeURIComponent(
      `${business.address || ''}, ${business.city_name || ''}`,
    );
    if (business.latitude && business.longitude) {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`,
      );
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${addr}`);
    }
  };

  const handleSubmitReview = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Login Required', 'Please login to write a review.', [
        {text: 'Cancel'},
        {
          text: 'Login',
          onPress: () => navigation.navigate('ProfileTab' as any, {screen: 'Login'}),
        },
      ]);
      return;
    }

    if (!reviewComment.trim()) {
      Alert.alert('Error', 'Please write a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await submitReview({
        business_id: business!.id,
        rating: reviewRating,
        title: reviewTitle.trim(),
        comment: reviewComment.trim(),
      });

      if (response.status) {
        Alert.alert('Success', 'Your review has been submitted successfully.');
        setShowReviewForm(false);
        setReviewTitle('');
        setReviewComment('');
        setReviewRating(5);
        loadData(true);
      } else {
        Alert.alert('Error', response.message || 'Failed to submit review.');
      }
    } catch {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitEnquiry = async () => {
    if (!enquiryName.trim() || !enquiryPhone.trim() || !enquiryMessage.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setSubmittingEnquiry(true);
    try {
      const response = await submitEnquiry({
        business_id: business!.id,
        name: enquiryName.trim(),
        email: enquiryEmail.trim(),
        phone: enquiryPhone.trim(),
        message: enquiryMessage.trim(),
      });

      if (response.status) {
        Alert.alert('Success', 'Your enquiry has been sent successfully.');
        setShowEnquiryForm(false);
        setEnquiryName('');
        setEnquiryEmail('');
        setEnquiryPhone('');
        setEnquiryMessage('');
      } else {
        Alert.alert('Error', response.message || 'Failed to send enquiry.');
      }
    } catch {
      Alert.alert('Error', 'Failed to send enquiry. Please try again.');
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const handleRelatedBusinessPress = (biz: Business) => {
    navigation.push('BusinessDetail', {
      citySlug: biz.city_slug,
      businessSlug: biz.slug,
      businessName: biz.name,
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading business details..." />;
  }

  if (error || !business) {
    return (
      <ErrorView
        message={error || 'Business not found'}
        onRetry={() => loadData()}
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadData(true);
          }}
          colors={[Colors.primary]}
        />
      }>
      {/* Cover Image */}
      <View style={styles.coverContainer}>
        {business.cover_image || business.logo ? (
          <Image
            source={{uri: business.cover_image || business.logo}}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Icon name="business" size={64} color={Colors.gray300} />
          </View>
        )}
      </View>

      {/* Business Info */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.businessName}>{business.name}</Text>
          {business.is_verified && (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={18} color={Colors.verified} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {business.is_featured && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={12} color={Colors.accent} />
            <Text style={styles.featuredText}>Featured Business</Text>
          </View>
        )}

        <View style={styles.ratingRow}>
          <RatingStars rating={business.average_rating} size={18} />
          <Text style={styles.ratingValue}>
            {business.average_rating > 0
              ? business.average_rating.toFixed(1)
              : 'New'}
          </Text>
          <Text style={styles.reviewCountText}>
            ({business.review_count} review
            {business.review_count !== 1 ? 's' : ''})
          </Text>
        </View>

        {business.categories && business.categories.length > 0 && (
          <View style={styles.categoriesRow}>
            {business.categories.map(cat => (
              <View key={cat.id} style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{cat.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {(business.phone || business.mobile) && (
          <TouchableOpacity style={styles.actionButton} onPress={handleCall} activeOpacity={0.7}>
            <View style={[styles.actionIcon, {backgroundColor: Colors.green}]}>
              <Icon name="call" size={20} color={Colors.white} />
            </View>
            <Text style={styles.actionLabel}>Call</Text>
          </TouchableOpacity>
        )}
        {(business.whatsapp || business.mobile || business.phone) && (
          <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp} activeOpacity={0.7}>
            <View style={[styles.actionIcon, {backgroundColor: '#25D366'}]}>
              <Icon name="logo-whatsapp" size={20} color={Colors.white} />
            </View>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionButton} onPress={handleShare} activeOpacity={0.7}>
          <View style={[styles.actionIcon, {backgroundColor: Colors.primary}]}>
            <Icon name="share-social" size={20} color={Colors.white} />
          </View>
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowEnquiryForm(!showEnquiryForm)}
          activeOpacity={0.7}>
          <View style={[styles.actionIcon, {backgroundColor: Colors.accent}]}>
            <Icon name="chatbubble-ellipses" size={20} color={Colors.white} />
          </View>
          <Text style={styles.actionLabel}>Enquiry</Text>
        </TouchableOpacity>
      </View>

      {/* Enquiry Form */}
      {showEnquiryForm && (
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Send Enquiry</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Your Name *"
            placeholderTextColor={Colors.textMuted}
            value={enquiryName}
            onChangeText={setEnquiryName}
          />
          <TextInput
            style={styles.formInput}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={enquiryEmail}
            onChangeText={setEnquiryEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.formInput}
            placeholder="Phone Number *"
            placeholderTextColor={Colors.textMuted}
            value={enquiryPhone}
            onChangeText={setEnquiryPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Your Message *"
            placeholderTextColor={Colors.textMuted}
            value={enquiryMessage}
            onChangeText={setEnquiryMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitButton, submittingEnquiry && styles.buttonDisabled]}
            onPress={handleSubmitEnquiry}
            disabled={submittingEnquiry}
            activeOpacity={0.7}>
            <Text style={styles.submitButtonText}>
              {submittingEnquiry ? 'Sending...' : 'Send Enquiry'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Address */}
      {(business.address || business.city_name) && (
        <TouchableOpacity style={styles.detailSection} onPress={handleOpenMap} activeOpacity={0.7}>
          <View style={styles.detailRow}>
            <Icon name="location-outline" size={22} color={Colors.accent} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>
                {[business.address, business.locality, business.city_name, business.pincode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
            <Icon name="navigate-outline" size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      )}

      {/* Phone */}
      {(business.phone || business.mobile) && (
        <TouchableOpacity style={styles.detailSection} onPress={handleCall} activeOpacity={0.7}>
          <View style={styles.detailRow}>
            <Icon name="call-outline" size={22} color={Colors.green} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>
                {business.phone || business.mobile}
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      )}

      {/* Email */}
      {business.email && (
        <TouchableOpacity
          style={styles.detailSection}
          onPress={() => Linking.openURL(`mailto:${business.email}`)}
          activeOpacity={0.7}>
          <View style={styles.detailRow}>
            <Icon name="mail-outline" size={22} color={Colors.blue} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{business.email}</Text>
            </View>
            <Icon name="chevron-forward" size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      )}

      {/* Website */}
      {business.website && (
        <TouchableOpacity
          style={styles.detailSection}
          onPress={() => Linking.openURL(business.website)}
          activeOpacity={0.7}>
          <View style={styles.detailRow}>
            <Icon name="globe-outline" size={22} color={Colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Website</Text>
              <Text style={[styles.detailValue, styles.linkText]}>
                {business.website}
              </Text>
            </View>
            <Icon name="open-outline" size={18} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>
      )}

      {/* Working Hours */}
      {business.working_hours && business.working_hours.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="time-outline" size={18} color={Colors.textPrimary} />
            {'  '}Business Hours
          </Text>
          <View style={styles.hoursContainer}>
            {business.working_hours.map((hours, index) => (
              <View key={index} style={styles.hoursRow}>
                <Text style={styles.dayName}>{hours.day}</Text>
                <Text
                  style={[
                    styles.hoursValue,
                    hours.is_closed && styles.closedText,
                  ]}>
                  {hours.is_closed
                    ? 'Closed'
                    : `${hours.open_time} - ${hours.close_time}`}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Description */}
      {business.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.descriptionText}>{business.description}</Text>
        </View>
      )}

      {/* Rating Breakdown */}
      {ratingBreakdown && ratingBreakdown.total > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
          <View style={styles.ratingBreakdown}>
            <View style={styles.ratingOverview}>
              <Text style={styles.ratingBig}>
                {ratingBreakdown.average.toFixed(1)}
              </Text>
              <RatingStars rating={ratingBreakdown.average} size={16} />
              <Text style={styles.totalReviews}>
                {ratingBreakdown.total} review
                {ratingBreakdown.total !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.ratingBars}>
              {[
                {stars: 5, count: ratingBreakdown.five},
                {stars: 4, count: ratingBreakdown.four},
                {stars: 3, count: ratingBreakdown.three},
                {stars: 2, count: ratingBreakdown.two},
                {stars: 1, count: ratingBreakdown.one},
              ].map(item => (
                <View key={item.stars} style={styles.barRow}>
                  <Text style={styles.barLabel}>{item.stars}</Text>
                  <Icon name="star" size={10} color={Colors.star} />
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${
                            ratingBreakdown.total > 0
                              ? (item.count / ratingBreakdown.total) * 100
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </View>
      )}

      {/* Write Review Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.writeReviewButton}
          onPress={() => setShowReviewForm(!showReviewForm)}
          activeOpacity={0.7}>
          <Icon name="create-outline" size={18} color={Colors.primary} />
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      </View>

      {/* Review Form */}
      {showReviewForm && (
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Write Your Review</Text>
          <Text style={styles.formLabel}>Rating</Text>
          <View style={styles.ratingSelector}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setReviewRating(star)}
                activeOpacity={0.7}
                style={styles.starButton}>
                <Icon
                  name={star <= reviewRating ? 'star' : 'star-outline'}
                  size={32}
                  color={star <= reviewRating ? Colors.star : Colors.starEmpty}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.formInput}
            placeholder="Review Title (optional)"
            placeholderTextColor={Colors.textMuted}
            value={reviewTitle}
            onChangeText={setReviewTitle}
          />
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            placeholder="Write your review..."
            placeholderTextColor={Colors.textMuted}
            value={reviewComment}
            onChangeText={setReviewComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitButton, submittingReview && styles.buttonDisabled]}
            onPress={handleSubmitReview}
            disabled={submittingReview}
            activeOpacity={0.7}>
            <Text style={styles.submitButtonText}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Related Businesses */}
      {relatedBusinesses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Businesses</Text>
          {relatedBusinesses.map(biz => (
            <BusinessCard
              key={biz.id}
              business={biz}
              onPress={handleRelatedBusinessPress}
            />
          ))}
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  coverContainer: {
    height: 200,
    backgroundColor: Colors.gray100,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  businessName: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blueLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.sm,
  },
  verifiedText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
    color: Colors.verified,
    marginLeft: 3,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  featuredText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.accent,
    marginLeft: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ratingValue: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  reviewCountText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  categoryTagText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    marginTop: 1,
    ...Shadows.sm,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },
  detailSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  detailLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
  },
  linkText: {
    color: Colors.blue,
  },
  section: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  hoursContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  dayName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    width: 100,
  },
  hoursValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  closedText: {
    color: Colors.red,
    fontWeight: Fonts.weights.medium,
  },
  descriptionText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  ratingBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingOverview: {
    alignItems: 'center',
    marginRight: Spacing.xl,
  },
  ratingBig: {
    fontSize: Fonts.sizes.display,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  totalReviews: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  ratingBars: {
    flex: 1,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    width: 14,
    textAlign: 'right',
    marginRight: 3,
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: 3,
    marginHorizontal: Spacing.sm,
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.star,
    borderRadius: 3,
  },
  barCount: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
    width: 24,
    textAlign: 'right',
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  writeReviewText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    marginLeft: Spacing.sm,
  },
  formSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  formTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  ratingSelector: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  starButton: {
    marginRight: Spacing.sm,
  },
  formInput: {
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  bottomPadding: {
    height: Spacing.xxxl,
  },
});
