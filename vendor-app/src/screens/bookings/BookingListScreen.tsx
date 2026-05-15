import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {
  getVendorBookings,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
} from '../../services/api';
import type {Booking, Pagination} from '../../types';
import type {BookingsScreenProps} from '../../navigation/types';

const STATUS_TABS = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, {bg: string; text: string}> = {
  pending: {bg: Colors.yellowLight, text: Colors.yellow},
  confirmed: {bg: Colors.blueLight, text: Colors.blue},
  in_progress: {bg: '#D1FAE5', text: Colors.accent},
  completed: {bg: '#D1FAE5', text: Colors.greenDark},
  cancelled: {bg: Colors.redLight, text: Colors.red},
};

export default function BookingListScreen({
  navigation,
}: BookingsScreenProps<'BookingsMain'>) {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);

  const loadBookings = useCallback(
    async (p: number, append = false) => {
      if (p === 1) setLoading(true);
      else setLoadingMore(true);

      try {
        const res = await getVendorBookings(p, activeTab);
        if (res.status) {
          setBookings(prev =>
            append ? [...prev, ...res.data.bookings] : res.data.bookings,
          );
          setPagination(res.data.pagination);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    setPage(1);
    loadBookings(1);
  }, [activeTab, loadBookings]);

  function loadMore() {
    if (!loadingMore && pagination && page < pagination.pages) {
      const next = page + 1;
      setPage(next);
      loadBookings(next, true);
    }
  }

  async function handleAction(
    action: 'accept' | 'reject' | 'start' | 'complete',
    id: number,
  ) {
    const actions = {
      accept: () => acceptBooking(id),
      reject: () => rejectBooking(id),
      start: () => startBooking(id),
      complete: () => completeBooking(id),
    };

    try {
      const res = await actions[action]();
      if (res.status) {
        loadBookings(1);
        Alert.alert('Success', `Booking ${action}ed successfully.`);
      } else {
        Alert.alert('Error', res.message || 'Action failed.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    }
  }

  function renderActions(booking: Booking) {
    switch (booking.status) {
      case 'pending':
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => handleAction('reject', booking.id)}>
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleAction('accept', booking.id)}>
              <Text style={styles.acceptBtnText}>Accept</Text>
            </TouchableOpacity>
          </View>
        );
      case 'confirmed':
        return (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => handleAction('start', booking.id)}>
            <Icon name="play" size={16} color={Colors.white} />
            <Text style={styles.startBtnText}>Start Job</Text>
          </TouchableOpacity>
        );
      case 'in_progress':
        return (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => handleAction('complete', booking.id)}>
            <Icon name="checkmark-circle" size={16} color={Colors.white} />
            <Text style={styles.completeBtnText}>Complete</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  }

  function renderBooking({item}: {item: Booking}) {
    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.pending;

    return (
      <TouchableOpacity
        style={[styles.bookingCard, Shadows.sm]}
        onPress={() => navigation.navigate('BookingDetail', {bookingId: item.id})}
        activeOpacity={0.7}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingNumber}>#{item.booking_number}</Text>
          <View style={[styles.statusBadge, {backgroundColor: statusColor.bg}]}>
            <Text style={[styles.statusText, {color: statusColor.text}]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        <View style={styles.bookingBody}>
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.customer_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {item.scheduled_date} at {item.scheduled_time}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="construct-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.items.map(i => i.service_name).join(', ')}
            </Text>
          </View>
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.amountText}>₹{item.total_amount.toLocaleString()}</Text>
          {renderActions(item)}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_TABS}
          keyExtractor={item => item}
          contentContainerStyle={styles.tabList}
          renderItem={({item}) => (
            <TouchableOpacity
              style={[styles.tab, activeTab === item && styles.tabActive]}
              onPress={() => setActiveTab(item)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === item && styles.tabTextActive,
                ]}>
                {STATUS_LABELS[item]}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="calendar-outline" size={64} color={Colors.gray300} />
          <Text style={styles.emptyTitle}>No bookings</Text>
          <Text style={styles.emptySubtitle}>
            No {STATUS_LABELS[activeTab].toLowerCase()} bookings found
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => String(item.id)}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={Colors.accent}
                style={styles.footerLoader}
              />
            ) : null
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
  tabContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.gray100,
  },
  tabActive: {
    backgroundColor: Colors.accent,
  },
  tabText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  listContent: {
    padding: Spacing.lg,
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
    marginBottom: Spacing.md,
  },
  bookingNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semibold,
  },
  bookingBody: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  amountText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.accent,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rejectBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.red,
  },
  rejectBtnText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.red,
  },
  acceptBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
  },
  acceptBtnText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.blue,
  },
  startBtnText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
  },
  completeBtnText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
  },
});
