import { FlatList, Text, View, Pressable, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { ChevronRight, Calendar, Filter } from "lucide-react-native";
import { useState } from "react";
import { useVendorBookings } from "@/lib/queries";

const FILTERS = ["all", "pending", "confirmed", "in_progress", "completed"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_COLORS: Record<string, string> = {
  pending:     "text-amber-700 bg-amber-50",
  confirmed:   "text-primary-700 bg-primary-50",
  in_progress: "text-blue-700 bg-blue-50",
  completed:   "text-emerald-700 bg-emerald-50",
  cancelled:   "text-red-700 bg-red-50",
  refunded:    "text-gray-700 bg-gray-100",
};

export default function VendorBookings() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading } = useVendorBookings(filter === "all" ? undefined : filter);
  const bookings = data?.bookings ?? [];

  return (
    <View className="flex-1 bg-bg">
      {/* Filter chips */}
      <View className="px-5 pt-4 pb-2 border-b border-border bg-surface">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={(f) => f}
          ItemSeparatorComponent={() => <View className="w-2" />}
          renderItem={({ item: f }) => (
            <Pressable
              onPress={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full border ${
                filter === f ? "bg-primary-700 border-primary-700" : "bg-bg border-border"
              }`}
            >
              <Text className={`text-xs capitalize ${filter === f ? "text-white font-semibold" : "text-text"}`}>
                {f === "all" ? "All" : f.replace("_", " ")}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {isLoading && (
        <View className="py-12 items-center">
          <ActivityIndicator color="#145224" />
        </View>
      )}

      {!isLoading && bookings.length === 0 && (
        <View className="flex-1 items-center justify-center px-8 -mt-12">
          <View className="w-14 h-14 rounded-2xl bg-primary-50 items-center justify-center mb-3">
            <Calendar size={24} color="#145224" />
          </View>
          <Text className="text-text font-semibold">No bookings yet</Text>
          <Text className="text-muted text-sm text-center mt-1">
            New bookings will appear here. Make sure your services are active and your availability is set.
          </Text>
        </View>
      )}

      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={bookings}
        keyExtractor={(b) => String(b.id)}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item: b }) => (
          <Link href={`/booking/${b.id}` as any} asChild>
            <Pressable className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-text font-semibold">{b.customer_name ?? `Booking #${b.id}`}</Text>
                <View className={`px-2 py-1 rounded-md ${STATUS_COLORS[b.status] ?? ""}`}>
                  <Text className="text-[10px] font-medium capitalize">{b.status.replace("_", " ")}</Text>
                </View>
              </View>
              <Text className="text-muted text-xs">
                {b.service_name ? `${b.service_name} · ` : ""}
                ₹{(b.amount_paise / 100).toFixed(0)}
                {b.scheduled_at ? ` · ${new Date(b.scheduled_at).toLocaleString()}` : ""}
              </Text>
              <View className="flex-row items-center justify-end mt-2">
                <Text className="text-primary-700 text-sm font-medium">Details</Text>
                <ChevronRight size={14} color="#145224" />
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
