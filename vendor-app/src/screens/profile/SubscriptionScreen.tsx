import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {
  getSubscriptionPlans,
  getCurrentSubscription,
  subscribe,
} from '../../services/api';
import type {SubscriptionPlan, Subscription} from '../../types';
import type {ProfileScreenProps} from '../../navigation/types';

export default function SubscriptionScreen({}: ProfileScreenProps<'Subscription'>) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const loadData = useCallback(async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        getSubscriptionPlans(),
        getCurrentSubscription(),
      ]);
      if (plansRes.status) setPlans(plansRes.data);
      if (subRes.status) setCurrent(subRes.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubscribe(planId: number) {
    Alert.alert(
      'Subscribe',
      `Subscribe to this plan (${billingCycle})?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Subscribe',
          onPress: async () => {
            setSubscribing(true);
            try {
              const res = await subscribe(planId, billingCycle);
              if (res.status) {
                setCurrent(res.data);
                Alert.alert('Success', 'Subscription activated!');
              } else {
                Alert.alert('Error', res.message || 'Failed to subscribe.');
              }
            } catch {
              Alert.alert('Error', 'Something went wrong.');
            } finally {
              setSubscribing(false);
            }
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Plan */}
      {current && (
        <View style={[styles.currentCard, Shadows.md]}>
          <View style={styles.currentHeader}>
            <Icon name="diamond" size={24} color={Colors.white} />
            <Text style={styles.currentTitle}>Current Plan</Text>
          </View>
          <Text style={styles.currentPlanName}>{current.plan_name}</Text>
          <View style={styles.currentDetails}>
            <Text style={styles.currentDetail}>
              Status: {current.status.charAt(0).toUpperCase() + current.status.slice(1)}
            </Text>
            <Text style={styles.currentDetail}>
              Billing: {current.billing_cycle}
            </Text>
            <Text style={styles.currentDetail}>
              Renews: {current.current_period_end}
            </Text>
            <Text style={styles.currentDetail}>
              ₹{current.amount}/
              {current.billing_cycle === 'monthly' ? 'mo' : 'yr'}
            </Text>
          </View>
        </View>
      )}

      {/* Billing Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            billingCycle === 'monthly' && styles.toggleBtnActive,
          ]}
          onPress={() => setBillingCycle('monthly')}>
          <Text
            style={[
              styles.toggleText,
              billingCycle === 'monthly' && styles.toggleTextActive,
            ]}>
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            billingCycle === 'yearly' && styles.toggleBtnActive,
          ]}
          onPress={() => setBillingCycle('yearly')}>
          <Text
            style={[
              styles.toggleText,
              billingCycle === 'yearly' && styles.toggleTextActive,
            ]}>
            Yearly (Save 20%)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Plans */}
      {plans.map(plan => {
        const price =
          billingCycle === 'monthly'
            ? plan.price_monthly
            : plan.price_yearly;
        const isCurrentPlan = current?.plan_id === plan.id;

        return (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              Shadows.sm,
              plan.is_popular && styles.planCardPopular,
            ]}>
            {plan.is_popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Most Popular</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>

            <View style={styles.planPriceRow}>
              <Text style={styles.planPrice}>
                ₹{price.toLocaleString()}
              </Text>
              <Text style={styles.planPeriod}>
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Icon
                    name="checkmark-circle"
                    size={18}
                    color={Colors.accent}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              <View style={styles.featureRow}>
                <Icon name="checkmark-circle" size={18} color={Colors.accent} />
                <Text style={styles.featureText}>
                  Up to {plan.max_services} services
                </Text>
              </View>
              <View style={styles.featureRow}>
                <Icon name="checkmark-circle" size={18} color={Colors.accent} />
                <Text style={styles.featureText}>
                  {plan.max_bookings_per_month} bookings/month
                </Text>
              </View>
              {plan.priority_listing && (
                <View style={styles.featureRow}>
                  <Icon
                    name="checkmark-circle"
                    size={18}
                    color={Colors.accent}
                  />
                  <Text style={styles.featureText}>Priority listing</Text>
                </View>
              )}
              {plan.analytics_access && (
                <View style={styles.featureRow}>
                  <Icon
                    name="checkmark-circle"
                    size={18}
                    color={Colors.accent}
                  />
                  <Text style={styles.featureText}>Analytics access</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.subscribeBtn,
                isCurrentPlan && styles.subscribeBtnCurrent,
                subscribing && styles.subscribeBtnDisabled,
              ]}
              onPress={() => handleSubscribe(plan.id)}
              disabled={isCurrentPlan || subscribing}>
              {subscribing ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text
                  style={[
                    styles.subscribeBtnText,
                    isCurrentPlan && styles.subscribeBtnTextCurrent,
                  ]}>
                  {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  currentCard: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  currentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  currentTitle: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: Fonts.weights.medium,
  },
  currentPlanName: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  currentDetails: {
    gap: Spacing.xs,
  },
  currentDetail: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.85)',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  toggleBtnActive: {
    backgroundColor: Colors.accent,
  },
  toggleText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  planCardPopular: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderBottomLeftRadius: BorderRadius.md,
  },
  popularBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
  },
  planName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  planDescription: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.lg,
  },
  planPrice: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.accent,
  },
  planPeriod: {
    fontSize: Fonts.sizes.base,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  featuresContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  subscribeBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  subscribeBtnCurrent: {
    backgroundColor: Colors.gray200,
  },
  subscribeBtnDisabled: {
    opacity: 0.7,
  },
  subscribeBtnText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  subscribeBtnTextCurrent: {
    color: Colors.textSecondary,
  },
});
