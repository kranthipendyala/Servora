import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';
import {getMyBookings} from '../services/api';
import type {Booking, BookingStatus} from '../types';
import type {BookingsStackScreenProps} from '../navigation/types';

const STATUS_TABS: {label: string; value: string | undefined}[] = [
  {label: 'All', value: undefined},
  {label: 'Pending', value: 'pending'},
  {label: 'Confirmed', value: 'confirmed'},
  {label: 'Active', value: 'in_progress'},
  {label: 'Completed', value: 'completed'},
  {label: 'Cancelled', value: 'cancelled'},
];

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  assigned: '#6366F1',
  in_progress: '#8B5CF6',
  completed: '#22C55E',
  cancelled: '#EF4444',
  refunded: '#6B7280',
};

export default function MyBookingsScreen({
  navigation,
}: BookingsStackScreenProps<'BookingsMain'>) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

  const fetchBookings = useCallback(async () => {
    const res = await getMyBookings(1, activeTab);
    if (res.status && res.data) {
      setBookings(
        Array.isArray(res.data) ? res.data : (res.data as any).bookings || [],
      );
    }
    setLoading(false);
    setRefreshing(false);
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchBookings();
    }, [fetchBookings]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const renderBookingCard = ({item}: {item: Booking}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('BookingDetail', {bookingId: item.id})
      }>
      <View style={styles.cardHeader}>
        <Text style={styles.bookingNumber}>#{item.booking_number}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: STATUS_COLORS[item.status] + '20'},
          ]}>
          <Text
            style={[
              styles.statusText,
              {color: STATUS_COLORS[item.status]},
            ]}>
            {item.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.businessName}>{item.business_name}</Text>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>
          {item.scheduled_date} at {item.scheduled_time}
        </Text>
      </View>

      {item.items && item.items.length > 0 && (
        <Text style={styles.servicesText}>
          {item.items.map(i => i.service_name).join(', ')}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.totalAmount}>₹{item.total_amount}</Text>
        <Text
          style={[
            styles.paymentStatus,
            {
              color:
                item.payment_status === 'paid' ? Colors.green : Colors.yellow,
            },
          ]}>
          {item.payment_status.toUpperCase()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={STATUS_TABS}
        keyExtractor={item => item.label}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === item.value && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab(item.value);
              setLoading(true);
            }}>
            <Text
              style={[
                styles.tabText,
                activeTab === item.value && styles.activeTabText,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.tabBar}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.accent}
          style={styles.loader}
        />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No bookings found</Text>
          <Text style={styles.emptySubtext}>
            Book a service to see your bookings here
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => String(item.id)}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    maxHeight: 50,
    backgroundColor: Colors.white,
  },
  tabsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.background,
    marginRight: Spacing.xs,
  },
  activeTab: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium as any,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bookingNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold as any,
  },
  businessName: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold as any,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
  },
  value: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium as any,
  },
  servicesText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  totalAmount: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.textPrimary,
  },
  paymentStatus: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold as any,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold as any,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
