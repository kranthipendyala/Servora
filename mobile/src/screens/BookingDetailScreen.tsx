import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';
import {getBookingDetail, cancelBooking} from '../services/api';
import type {Booking, BookingStatus} from '../types';
import type {BookingsStackScreenProps} from '../navigation/types';

const STATUS_STEPS: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
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

export default function BookingDetailScreen({
  route,
  navigation,
}: BookingsStackScreenProps<'BookingDetail'>) {
  const {bookingId} = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    const res = await getBookingDetail(bookingId);
    if (res.status && res.data) {
      setBooking(res.data);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const res = await cancelBooking(bookingId, 'Cancelled by customer');
            if (res.status) {
              loadBooking();
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.accent}
        style={styles.loader}
      />
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Booking not found</Text>
      </View>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(booking.status);
  const canCancel = ['pending', 'confirmed'].includes(booking.status);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Text style={styles.bookingNumber}>#{booking.booking_number}</Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: STATUS_COLORS[booking.status] + '20'},
          ]}>
          <Text
            style={[
              styles.statusText,
              {color: STATUS_COLORS[booking.status]},
            ]}>
            {booking.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Timeline */}
      {booking.status !== 'cancelled' && booking.status !== 'refunded' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isLast = index === STATUS_STEPS.length - 1;
              return (
                <View key={step} style={styles.timelineStep}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.dot,
                        isActive && styles.dotActive,
                      ]}
                    />
                    {!isLast && (
                      <View
                        style={[
                          styles.line,
                          isActive && index < currentStepIndex && styles.lineActive,
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                    ]}>
                    {step.replace('_', ' ').charAt(0).toUpperCase() +
                      step.replace('_', ' ').slice(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Business & Schedule */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Business</Text>
          <Text style={styles.value}>{booking.business_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{booking.scheduled_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{booking.scheduled_time}</Text>
        </View>
        {booking.vendor_name && (
          <View style={styles.row}>
            <Text style={styles.label}>Service Provider</Text>
            <Text style={styles.value}>{booking.vendor_name}</Text>
          </View>
        )}
      </View>

      {/* Services */}
      {booking.items && booking.items.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Services</Text>
          {booking.items.map((item, index) => (
            <View key={index} style={styles.serviceRow}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.service_name}</Text>
                {item.variant_name && (
                  <Text style={styles.variantName}>{item.variant_name}</Text>
                )}
                <Text style={styles.qty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.servicePrice}>₹{item.total_price}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Address */}
      {booking.address && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <Text style={styles.addressText}>
            {booking.address.address_line1}
            {booking.address.address_line2 &&
              '\n' + booking.address.address_line2}
            {'\n'}
            {booking.address.city_name} - {booking.address.pin_code}
          </Text>
        </View>
      )}

      {/* Price Breakdown */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Price Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>₹{booking.subtotal}</Text>
        </View>
        {booking.discount_amount > 0 && (
          <View style={styles.row}>
            <Text style={styles.label}>Discount</Text>
            <Text style={[styles.value, {color: Colors.green}]}>
              -₹{booking.discount_amount}
            </Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Tax (GST)</Text>
          <Text style={styles.value}>₹{booking.tax_amount}</Text>
        </View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{booking.total_amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  booking.payment_status === 'paid'
                    ? Colors.green
                    : Colors.yellow,
              },
            ]}>
            {booking.payment_status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Cancel button */}
      {canCancel && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}

      <View style={{height: 40}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textMuted,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  bookingNumber: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.primary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.bold as any,
  },
  card: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
  },
  value: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium as any,
  },
  // Timeline
  timeline: {
    paddingLeft: Spacing.sm,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 40,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.accent,
  },
  line: {
    width: 2,
    height: 28,
    backgroundColor: Colors.border,
  },
  lineActive: {
    backgroundColor: Colors.accent,
  },
  stepLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    paddingTop: -2,
  },
  stepLabelActive: {
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semibold as any,
  },
  // Services
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium as any,
    color: Colors.textPrimary,
  },
  variantName: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  qty: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold as any,
    color: Colors.textPrimary,
  },
  // Address
  addressText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  // Total
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.primary,
  },
  // Cancel
  cancelButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    backgroundColor: Colors.red,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold as any,
  },
});
