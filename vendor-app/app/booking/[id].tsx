import { ScrollView, Text, View, Pressable, Linking, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Phone, MapPin, CalendarCheck, CheckCircle2, XCircle, Play, Receipt } from "lucide-react-native";
import { useVendorBooking, useAcceptBooking, useRejectBooking, useStartBooking, useCompleteBooking, useCollectPayment } from "@/lib/queries";
import { formatINR } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  pending:     "Awaiting your response",
  confirmed:   "Confirmed",
  in_progress: "In progress",
  completed:   "Completed",
  cancelled:   "Cancelled",
  refunded:    "Refunded",
};

export default function VendorBookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Number(id);
  const { data: b, isLoading } = useVendorBooking(bookingId);

  const accept   = useAcceptBooking();
  const reject   = useRejectBooking();
  const start    = useStartBooking();
  const complete = useCompleteBooking();
  const collect  = useCollectPayment();

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#145224" />
      </View>
    );
  }

  if (!b) {
    return (
      <View className="flex-1 bg-bg items-center justify-center p-8">
        <Text className="text-text text-lg font-semibold">Booking not found</Text>
      </View>
    );
  }

  const askThen = (verb: string, fn: () => void) =>
    Alert.alert(`${verb} booking?`, `This will ${verb.toLowerCase()} booking #${b.id}.`, [
      { text: "Cancel", style: "cancel" },
      { text: verb, style: verb === "Reject" ? "destructive" : "default", onPress: fn },
    ]);

  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-5 pt-6 pb-3">
        <Text className="text-muted text-xs uppercase tracking-widest">Booking #{b.id}</Text>
        <Text className="text-text text-2xl mt-2 font-semibold">{STATUS_LABEL[b.status] ?? b.status}</Text>
      </View>

      {/* Customer card */}
      <View className="px-5 mt-3">
        <View className="bg-surface rounded-2xl border border-border p-4">
          <Text className="text-muted text-xs uppercase tracking-widest mb-2">Customer</Text>
          <Text className="text-text font-semibold">{b.customer_name}</Text>
          <View className="mt-3 flex-row gap-2">
            {!!b.customer_phone && (
              <Pressable
                onPress={() => Linking.openURL(`tel:${b.customer_phone}`)}
                className="flex-1 bg-primary-700 rounded-xl py-2.5 flex-row items-center justify-center gap-2"
              >
                <Phone color="#fff" size={14} />
                <Text className="text-white text-sm font-semibold">Call</Text>
              </Pressable>
            )}
            {!!b.address && (
              <Pressable
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(b.address)}`)}
                className="flex-1 bg-cream border border-border rounded-xl py-2.5 flex-row items-center justify-center gap-2"
              >
                <MapPin color="#145224" size={14} />
                <Text className="text-primary-700 text-sm font-semibold">Directions</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Details */}
      <View className="px-5 mt-3">
        <View className="bg-surface rounded-2xl border border-border p-4">
          {b.service_name && <Row label="Service"     value={b.service_name} />}
          <Row label="Amount" value={formatINR(b.amount_paise)} />
          {b.scheduled_at && <Row label="Scheduled"   value={new Date(b.scheduled_at).toLocaleString()} />}
          <Row label="Created" value={new Date(b.created_at).toLocaleString()} />
          {b.address && <Row label="Address"          value={b.address} />}
          {b.notes   && <Row label="Notes"            value={b.notes} />}
        </View>
      </View>

      {/* Actions */}
      <View className="px-5 mt-6 mb-12 gap-2">
        {b.status === "pending" && (
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => askThen("Accept", () => accept.mutate(b.id))}
              className="flex-1 bg-primary-700 rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              <CheckCircle2 color="#fff" size={16} />
              <Text className="text-white font-semibold">Accept</Text>
            </Pressable>
            <Pressable
              onPress={() => askThen("Reject", () => reject.mutate(b.id))}
              className="flex-1 bg-red-600 rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              <XCircle color="#fff" size={16} />
              <Text className="text-white font-semibold">Reject</Text>
            </Pressable>
          </View>
        )}

        {b.status === "confirmed" && (
          <Pressable
            onPress={() => askThen("Start", () => start.mutate(b.id))}
            className="bg-primary-700 rounded-xl py-3 flex-row items-center justify-center gap-2"
          >
            <Play color="#fff" size={16} />
            <Text className="text-white font-semibold">Start job</Text>
          </Pressable>
        )}

        {b.status === "in_progress" && (
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => askThen("Complete", () => complete.mutate(b.id))}
              className="flex-1 bg-primary-700 rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              <CalendarCheck color="#fff" size={16} />
              <Text className="text-white font-semibold">Mark complete</Text>
            </Pressable>
            <Pressable
              onPress={() => askThen("Collect payment for", () => collect.mutate(b.id))}
              className="flex-1 bg-cream border border-border rounded-xl py-3 flex-row items-center justify-center gap-2"
            >
              <Receipt color="#145224" size={16} />
              <Text className="text-primary-700 font-semibold">Collect cash</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2.5 border-b border-border last:border-0">
      <Text className="text-muted text-sm">{label}</Text>
      <Text className="text-text text-sm font-medium flex-1 text-right ml-3">{value}</Text>
    </View>
  );
}
