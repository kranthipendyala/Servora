import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {
  getBookingDetail,
  acceptBooking,
  rejectBooking,
  startBooking,
  completeBooking,
} from '../../services/api';
import type {Booking} from '../../types';
import type {BookingsScreenProps} from '../../navigation/types';

const STATUS_COLORS: Record<string, {bg: string; text: string}> = {
  pending: {bg: Colors.yellowLight, text: Colors.yellow},
  confirmed: {bg: Colors.blueLight, text: Colors.blue},
  in_progress: {bg: '#D1FAE5', text: Colors.accent},
  completed: {bg: '#D1FAE5', text: Colors.greenDark},
  cancelled: {bg: Colors.redLight, text: Colors.red},
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function BookingDetailScreen({
  route,
  navigation,
}: BookingsScreenProps<'BookingDetail'>) {
  const {bookingId} = route.params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const loadBooking = useCallback(async () => {
    try {
      const res = await getBookingDetail(bookingId);
      if (res.status) {
        setBooking(res.data);
      } else {
        Alert.alert('Error', res.message || 'Failed to load booking.');
        navigation.goBack();
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [bookingId, navigation]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  async function handleAccept() {
    setActionLoading(true);
    try {
      const res = await acceptBooking(bookingId);
      if (res.status) {
        setBooking(res.data);
        Alert.alert('Success', 'Booking accepted.');
      } else {
        Alert.alert('Error', res.message || 'Failed to accept.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    setActionLoading(true);
    try {
      const res = await rejectBooking(bookingId, rejectReason);
      if (res.status) {
        setBooking(res.data);
        setShowRejectInput(false);
        Alert.alert('Done', 'Booking rejected.');
      } else {
        Alert.alert('Error', res.message || 'Failed to reject.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStart() {
    setActionLoading(true);
    try {
      const res = await startBooking(bookingId);
      if (res.status) {
        setBooking(res.data);
        Alert.alert('Success', 'Job started.');
      } else {
        Alert.alert('Error', res.message || 'Failed to start.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleComplete() {
    setActionLoading(true);
    try {
      const res = await completeBooking(bookingId, notes || undefined);
      if (res.status) {
        setBooking(res.data);
        Alert.alert('Success', 'Job completed.');
      } else {
        Alert.alert('Error', res.message || 'Failed to complete.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading || !booking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  const statusColor = STATUS_COLORS[booking.status] || STATUS_COLORS.pending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, {backgroundColor: statusColor.bg}]}>
        <Text style={[styles.statusBannerText, {color: statusColor.text}]}>
          {STATUS_LABELS[booking.status]}
        </Text>
      </View>

      {/* Booking Info */}
      <View style={[styles.card, Shadows.sm]}>
        <Text style={styles.cardTitle}>Booking Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Booking #</Text>
          <Text style={styles.infoValue}>{booking.booking_number}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{booking.scheduled_date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Time</Text>
          <Text style={styles.infoValue}>{booking.scheduled_time}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Payment</Text>
          <Text style={styles.infoValue}>
            {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </View>

      {/* Customer Details */}
      <View style={[styles.card, Shadows.sm]}>
        <Text style={styles.cardTitle}>Customer Details</Text>
        <View style={styles.customerRow}>
          <Icon name="person-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.customerText}>{booking.customer_name}</Text>
        </View>
        <View style={styles.customerRow}>
          <Icon name="call-outline" size={18} color={Colors.textSecondary} />
          <Text style={styles.customerText}>{booking.customer_phone}</Text>
        </View>
        {booking.customer_email && (
          <View style={styles.customerRow}>
            <Icon name="mail-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.customerText}>{booking.customer_email}</Text>
          </View>
        )}
        {booking.address && (
          <View style={styles.customerRow}>
            <Icon name="location-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.customerText}>
              {booking.address.line1}
              {booking.address.line2 ? `, ${booking.address.line2}` : ''}
              {`, ${booking.address.city} - ${booking.address.pincode}`}
            </Text>
          </View>
        )}
      </View>

      {/* Service Items */}
      <View style={[styles.card, Shadows.sm]}>
        <Text style={styles.cardTitle}>Service Items</Text>
        {booking.items.map(item => (
          <View key={item.id} style={styles.serviceItem}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.service_name}</Text>
              {item.variant_name && (
                <Text style={styles.variantName}>{item.variant_name}</Text>
              )}
              <Text style={styles.serviceQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.servicePrice}>
              ₹{item.total_price.toLocaleString()}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>
            ₹{booking.subtotal.toLocaleString()}
          </Text>
        </View>
        {booking.discount_amount > 0 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={[styles.priceValue, {color: Colors.accent}]}>
              -₹{booking.discount_amount.toLocaleString()}
            </Text>
          </View>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Tax</Text>
          <Text style={styles.priceValue}>
            ₹{booking.tax_amount.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ₹{booking.total_amount.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {booking.customer_notes && (
        <View style={[styles.card, Shadows.sm]}>
          <Text style={styles.cardTitle}>Customer Notes</Text>
          <Text style={styles.notesText}>{booking.customer_notes}</Text>
        </View>
      )}

      {booking.vendor_notes && (
        <View style={[styles.card, Shadows.sm]}>
          <Text style={styles.cardTitle}>Your Notes</Text>
          <Text style={styles.notesText}>{booking.vendor_notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      {booking.status === 'pending' && (
        <View style={styles.actionSection}>
          {showRejectInput && (
            <TextInput
              style={styles.reasonInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Reason for rejection (optional)"
              placeholderTextColor={Colors.textMuted}
              multiline
            />
          )}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={handleReject}
              disabled={actionLoading}>
              <Text style={styles.rejectBtnText}>
                {showRejectInput ? 'Confirm Reject' : 'Reject'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              disabled={actionLoading}>
              {actionLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.acceptBtnText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {booking.status === 'confirmed' && (
        <TouchableOpacity
          style={styles.startJobBtn}
          onPress={handleStart}
          disabled={actionLoading}>
          {actionLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Icon name="play" size={20} color={Colors.white} />
              <Text style={styles.startJobBtnText}>Start Job</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {booking.status === 'in_progress' && (
        <View style={styles.actionSection}>
          <TextInput
            style={styles.reasonInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Completion notes (optional)"
            placeholderTextColor={Colors.textMuted}
            multiline
          />
          <TouchableOpacity
            style={styles.completeJobBtn}
            onPress={handleComplete}
            disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <>
                <Icon name="checkmark-circle" size={20} color={Colors.white} />
                <Text style={styles.completeJobBtnText}>Mark Complete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {booking.cancellation_reason && (
        <View style={[styles.card, Shadows.sm, {borderLeftWidth: 3, borderLeftColor: Colors.red}]}>
          <Text style={styles.cardTitle}>Cancellation Reason</Text>
          <Text style={styles.notesText}>{booking.cancellation_reason}</Text>
        </View>
      )}
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
  statusBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statusBannerText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  infoLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  customerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    flex: 1,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  serviceInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  serviceName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  variantName: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  serviceQty: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.accent,
  },
  notesText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionSection: {
    marginBottom: Spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  reasonInput: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.red,
    alignItems: 'center',
  },
  rejectBtnText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.red,
  },
  acceptBtn: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  startJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.blue,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  startJobBtnText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  completeJobBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  completeJobBtnText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
});
