import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {getVendorStats, getPayouts} from '../../services/api';
import type {VendorStats, Payout, Pagination} from '../../types';
import type {EarningsScreenProps} from '../../navigation/types';

const PAYOUT_STATUS_COLORS: Record<string, {bg: string; text: string}> = {
  pending: {bg: Colors.yellowLight, text: Colors.yellow},
  processing: {bg: Colors.blueLight, text: Colors.blue},
  completed: {bg: '#D1FAE5', text: Colors.greenDark},
  failed: {bg: Colors.redLight, text: Colors.red},
};

export default function EarningsScreen({}: EarningsScreenProps<'EarningsMain'>) {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, payoutsRes] = await Promise.all([
        getVendorStats(),
        getPayouts(1),
      ]);
      if (statsRes.status) setStats(statsRes.data);
      if (payoutsRes.status) {
        setPayouts(payoutsRes.data.payouts);
        setPagination(payoutsRes.data.pagination);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function onRefresh() {
    setRefreshing(true);
    setPage(1);
    loadData();
  }

  async function loadMore() {
    if (!pagination || page >= pagination.pages) return;
    const next = page + 1;
    setPage(next);
    try {
      const res = await getPayouts(next);
      if (res.status) {
        setPayouts(prev => [...prev, ...res.data.payouts]);
        setPagination(res.data.pagination);
      }
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.accent]}
          tintColor={Colors.accent}
        />
      }>
      {/* Summary Cards */}
      <View style={[styles.summaryCard, Shadows.md]}>
        <View style={styles.summaryIconContainer}>
          <Icon name="wallet" size={28} color={Colors.white} />
        </View>
        <Text style={styles.summaryLabel}>Total Earnings</Text>
        <Text style={styles.summaryValue}>
          ₹{stats?.total_earnings?.toLocaleString() ?? '0'}
        </Text>
        <Text style={styles.summarySubtext}>
          This month: ₹{stats?.this_month_earnings?.toLocaleString() ?? '0'}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.miniStat, Shadows.sm]}>
          <Icon name="checkmark-circle" size={24} color={Colors.accent} />
          <Text style={styles.miniStatValue}>
            {stats?.completed_bookings ?? 0}
          </Text>
          <Text style={styles.miniStatLabel}>Completed Jobs</Text>
        </View>
        <View style={[styles.miniStat, Shadows.sm]}>
          <Icon name="star" size={24} color={Colors.star} />
          <Text style={styles.miniStatValue}>
            {stats?.average_rating?.toFixed(1) ?? '0.0'}
          </Text>
          <Text style={styles.miniStatLabel}>
            Avg Rating ({stats?.total_reviews ?? 0})
          </Text>
        </View>
      </View>

      {/* Payouts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Payouts</Text>

        {payouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="receipt-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyText}>No payouts yet</Text>
          </View>
        ) : (
          payouts.map(payout => {
            const statusColor =
              PAYOUT_STATUS_COLORS[payout.status] || PAYOUT_STATUS_COLORS.pending;

            return (
              <View key={payout.id} style={[styles.payoutCard, Shadows.sm]}>
                <View style={styles.payoutHeader}>
                  <View>
                    <Text style={styles.payoutAmount}>
                      ₹{payout.amount.toLocaleString()}
                    </Text>
                    <Text style={styles.payoutPeriod}>
                      {payout.period_start} - {payout.period_end}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.payoutBadge,
                      {backgroundColor: statusColor.bg},
                    ]}>
                    <Text
                      style={[
                        styles.payoutBadgeText,
                        {color: statusColor.text},
                      ]}>
                      {payout.status.charAt(0).toUpperCase() +
                        payout.status.slice(1)}
                    </Text>
                  </View>
                </View>
                <View style={styles.payoutFooter}>
                  <Text style={styles.payoutMeta}>
                    {payout.bookings_count} booking
                    {payout.bookings_count !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.payoutMeta}>
                    {payout.method}
                  </Text>
                  {payout.reference_id && (
                    <Text style={styles.payoutRef}>
                      Ref: {payout.reference_id}
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}

        {pagination && page < pagination.pages && (
          <View style={styles.loadMoreContainer}>
            <Text style={styles.loadMoreText} onPress={loadMore}>
              Load More
            </Text>
          </View>
        )}
      </View>
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
  summaryCard: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  summaryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  summarySubtext: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  miniStat: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  miniStatValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  miniStatLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  payoutCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  payoutAmount: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  payoutPeriod: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  payoutBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  payoutBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
  },
  payoutFooter: {
    flexDirection: 'row',
    gap: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  payoutMeta: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  payoutRef: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
  },
  loadMoreContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  loadMoreText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.accent,
  },
});
