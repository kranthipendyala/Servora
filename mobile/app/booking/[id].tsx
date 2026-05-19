import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useBooking } from "@/lib/queries";

const STATUS_LABEL: Record<string, string> = {
  pending:     "Awaiting confirmation",
  confirmed:   "Confirmed",
  in_progress: "Vendor on the way",
  completed:   "Completed",
  cancelled:   "Cancelled",
  refunded:    "Refunded",
};

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: b, isLoading } = useBooking(Number(id));

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

  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-6 pt-8 pb-12">
        <Text className="text-muted text-xs uppercase tracking-widest">Booking #{b.id}</Text>
        <Text className="text-text text-2xl mt-2 font-semibold">
          {STATUS_LABEL[b.status] ?? b.status}
        </Text>

        <View className="mt-6 bg-surface rounded-2xl p-5 border border-border">
          <Row label="Amount" value={`₹${(b.amount_paise / 100).toFixed(0)}`} />
          <Row label="Booked" value={new Date(b.created_at).toLocaleString()} />
          {b.scheduled_at && (
            <Row label="Scheduled for" value={new Date(b.scheduled_at).toLocaleString()} />
          )}
          <Row label="Customer" value={b.customer_name} />
          <Row label="Phone" value={b.customer_phone} />
          {!!b.notes && <Row label="Notes" value={b.notes} />}
        </View>
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-3 border-b border-border last:border-0">
      <Text className="text-muted">{label}</Text>
      <Text className="text-text font-medium flex-1 text-right">{value}</Text>
    </View>
  );
}
