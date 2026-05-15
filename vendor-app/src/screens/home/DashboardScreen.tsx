import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {getVendorStats, getVendorBookings, acceptBooking, rejectBooking} from '../../services/api';
import type {VendorStats, Booking} from '../../types';
import type {DashboardScreenProps} from '../../navigation/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
}

function StatCard({title, value, icon, color, bgColor}: StatCardProps) {
  return (
    <View style={[styles.statCard, Shadows.sm]}>
      <View style={[styles.statIconContainer, {backgroundColor: bgColor}]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

export default function DashboardScreen({
  navigation,
}: DashboardScreenProps<'DashboardMain'>) {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        getVendorStats(),
        getVendorBookings(1, 'pending'),
      ]);

      if (statsRes.status) {
        setStats(statsRes.data);
      }
      if (bookingsRes.status) {
        setPendingBookings(bookingsRes.data.bookings);
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
    loadData();
  }

  async function handleAccept(id: number) {
    try {
      const res = await acceptBooking(id);
      if (res.status) {
        setPendingBookings(prev => prev.filter(b => b.id !== id));
        Alert.alert('Success', 'Booking accepted.');
      } else {
        Alert.alert('Error', res.message || 'Failed to accept booking.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  }

  function handleReject(id: number) {
    Alert.alert('Reject Booking', 'Are you sure you want to reject this booking?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await rejectBooking(id);
            if (res.status) {
              setPendingBookings(prev => prev.filter(b => b.id !== id));
            } else {
              Alert.alert('Error', res.message || 'Failed to reject booking.');
            }
          } catch {
            Alert.alert('Error', 'Something went wrong.');
          }
        },
      },
    ]);
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
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Bookings"
          value={stats?.total_bookings ?? 0}
          icon="calendar"
          color={Colors.blue}
          bgColor={Colors.blueLight}
        />
        <StatCard
          title="Pending"
          value={stats?.pending_bookings ?? 0}
          icon="time"
          color={Colors.yellow}
          bgColor={Colors.yellowLight}
        />
        <StatCard
          title="Today's Jobs"
          value={stats?.today_jobs ?? 0}
          icon="today"
          color={Colors.accent}
          bgColor="#D1FAE5"
        />
        <StatCard
          title="Earnings"
          value={`₹${stats?.total_earnings?.toLocaleString() ?? 0}`}
          icon="wallet"
          color="#7C3AED"
          bgColor="#EDE9FE"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Bookings</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.getParent()?.navigate('BookingsTab', {
                screen: 'BookingsMain',
              })
            }>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {pendingBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="checkmark-circle-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyText}>No pending bookings</Text>
          </View>
        ) : (
          pendingBookings.map(booking => (
            <View key={booking.id} style={[styles.bookingCard, Shadows.sm]}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingNumber}>#{booking.booking_number}</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              </View>

              <Text style={styles.customerName}>{booking.customer_name}</Text>
              <Text style={styles.bookingMeta}>
                {booking.scheduled_date} at {booking.scheduled_time}
              </Text>
              <Text style={styles.bookingItems}>
                {booking.items.map(i => i.service_name).join(', ')}
              </Text>
              <Text style={styles.bookingAmount}>
                ₹{booking.total_amount.toLocaleString()}
              </Text>

              <View style={styles.bookingActions}>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleReject(booking.id)}>
                  <Icon name="close" size={18} color={Colors.red} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAccept(booking.id)}>
                  <Icon name="checkmark" size={18} color={Colors.white} />
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    margin: '1%',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  viewAllText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.accent,
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
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bookingNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
  },
  pendingBadge: {
    backgroundColor: Colors.yellowLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  pendingBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
    color: Colors.yellow,
  },
  customerName: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  bookingMeta: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  bookingItems: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  bookingAmount: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.accent,
    marginBottom: Spacing.md,
  },
  bookingActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.red,
    gap: Spacing.xs,
  },
  rejectBtnText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.red,
  },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
    gap: Spacing.xs,
  },
  acceptBtnText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
});
