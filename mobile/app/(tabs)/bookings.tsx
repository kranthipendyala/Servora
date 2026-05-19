import { ScrollView, Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import { CalendarX, ChevronRight } from "lucide-react-native";
import { useMyBookings } from "@/lib/queries";

const STATUS_COLORS: Record<string, string> = {
  pending:    "text-amber-700 bg-amber-50",
  confirmed:  "text-primary-700 bg-primary-50",
  in_progress:"text-blue-700 bg-blue-50",
  completed:  "text-emerald-700 bg-emerald-50",
  cancelled:  "text-red-700 bg-red-50",
  refunded:   "text-gray-700 bg-gray-100",
};

export default function BookingsScreen() {
  const { data, isLoading } = useMyBookings();
  const bookings = data?.bookings ?? [];

  if (!isLoading && bookings.length === 0) {
    return (
      <View className="flex-1 bg-bg items-center justify-center px-8">
        <View className="w-16 h-16 rounded-2xl bg-primary-50 items-center justify-center mb-4">
          <CalendarX size={28} color="#145224" />
        </View>
        <Text className="text-text text-xl font-semibold">No bookings yet</Text>
        <Text className="text-muted text-center mt-2 leading-relaxed">
          Find a verified vendor and book your first service.
        </Text>
        <Link href="/(tabs)/categories" asChild>
          <Pressable className="mt-6 bg-primary-700 rounded-xl px-6 py-3">
            <Text className="text-white font-semibold">Browse services</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-6 pt-6 pb-12">
        <Text className="text-muted text-xs uppercase tracking-widest">Your activity</Text>
        <Text className="text-text text-2xl mt-2 mb-6 font-semibold">My bookings</Text>

        {bookings.map((b) => (
          <Link key={b.id} href={`/booking/${b.id}` as any} asChild>
            <Pressable className="bg-surface rounded-2xl p-4 mb-3 border border-border">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-text font-semibold">Booking #{b.id}</Text>
                <View className={`px-2 py-1 rounded-md ${STATUS_COLORS[b.status] ?? ""}`}>
                  <Text className="text-xs font-medium capitalize">{b.status.replace("_", " ")}</Text>
                </View>
              </View>
              <Text className="text-muted text-sm">
                ₹{(b.amount_paise / 100).toFixed(0)} · {new Date(b.created_at).toLocaleDateString()}
              </Text>
              <View className="flex-row items-center justify-end mt-2">
                <Text className="text-primary-700 text-sm font-medium">View details</Text>
                <ChevronRight size={14} color="#145224" />
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
