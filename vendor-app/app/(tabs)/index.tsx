import { ScrollView, Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import {
  Calendar, TrendingUp, Star, Wallet, MessageCircle, ShieldCheck, ChevronRight, Tag,
} from "lucide-react-native";
import { useVendorDashboard, useUpcomingBookings, useCurrentVendor } from "@/lib/queries";
import { formatINR } from "@/lib/format";

export default function VendorDashboard() {
  const { data: vendor } = useCurrentVendor();
  const { data: stats } = useVendorDashboard();
  const { data: upcomingResp } = useUpcomingBookings();
  const upcoming = upcomingResp?.bookings ?? [];

  const kpis = [
    { Icon: Calendar,    label: "Bookings this month", value: String(stats?.bookings_this_month ?? "—"), trend: stats?.bookings_trend  ?? "" },
    { Icon: TrendingUp,  label: "Revenue",             value: formatINR((stats?.revenue_paise ?? 0)),    trend: stats?.revenue_trend   ?? "" },
    { Icon: Star,        label: "Avg rating",          value: stats?.avg_rating?.toFixed(2) ?? "—",      trend: stats?.rating_trend    ?? "" },
    { Icon: Wallet,      label: "Pending payout",      value: formatINR(stats?.pending_payout_paise ?? 0), trend: stats?.next_payout_date ?? "" },
  ];

  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-5 pt-6 pb-3">
        <View className="flex-row items-center gap-2">
          <ShieldCheck color="#145224" size={14} />
          <Text className="text-primary-700 uppercase tracking-widest text-[10px]">Servora Vendor</Text>
        </View>
        <Text className="text-text text-3xl mt-2 font-semibold">
          Hi, <Text className="text-primary-700">{vendor?.name?.split(" ")[0] ?? "there"}</Text>
        </Text>
        <Text className="text-muted text-sm mt-1">Here's your day at a glance.</Text>
      </View>

      {/* KPI grid */}
      <View className="px-5 mt-3">
        <View className="flex-row flex-wrap -mx-2">
          {kpis.map(({ Icon, label, value, trend }) => (
            <View key={label} className="w-1/2 px-2 mb-3">
              <View className="rounded-2xl bg-surface border border-border p-4">
                <View className="flex-row items-center justify-between">
                  <Icon color="#145224" size={18} />
                  {!!trend && <Text className="text-muted text-[11px]">{trend}</Text>}
                </View>
                <Text className="text-text text-2xl mt-3 font-semibold">{value}</Text>
                <Text className="text-muted text-[11px] mt-1">{label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Upcoming bookings */}
      <View className="px-5 mt-3">
        <View className="flex-row items-end justify-between mb-3">
          <Text className="text-text text-lg font-semibold">Today & tomorrow</Text>
          <Link href="/(tabs)/bookings" className="text-primary-700 text-sm font-medium">
            See all
          </Link>
        </View>
        {upcoming.length === 0 ? (
          <View className="rounded-2xl bg-surface border border-border p-6 items-center">
            <Calendar size={24} color="#9CA3AF" />
            <Text className="text-muted text-sm mt-2">No upcoming bookings.</Text>
          </View>
        ) : (
          upcoming.slice(0, 5).map((b) => (
            <Link key={b.id} href={`/booking/${b.id}` as any} asChild>
              <Pressable className="bg-surface rounded-2xl p-4 mb-2 border border-border flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                  <Text className="text-primary-700 font-bold text-xs">
                    {(b.customer_name ?? "C").slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text font-semibold">{b.customer_name ?? "Customer"}</Text>
                  <Text className="text-muted text-xs mt-0.5">
                    {b.service_name ?? "Service"} · {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : "Pending schedule"}
                  </Text>
                </View>
                <ChevronRight size={16} color="#6B7280" />
              </Pressable>
            </Link>
          ))
        )}
      </View>

      {/* Quick actions */}
      <View className="px-5 mt-6 mb-12 flex-row gap-3">
        <Link href="/(tabs)/services" asChild>
          <Pressable className="flex-1 bg-primary-700 rounded-xl py-3 items-center">
            <Tag color="#fff" size={16} />
            <Text className="text-white text-xs font-semibold mt-1">Add service</Text>
          </Pressable>
        </Link>
        <Link href="/chat" asChild>
          <Pressable className="flex-1 bg-cream rounded-xl py-3 items-center border border-border">
            <MessageCircle color="#145224" size={16} />
            <Text className="text-primary-700 text-xs font-semibold mt-1">Messages</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}
