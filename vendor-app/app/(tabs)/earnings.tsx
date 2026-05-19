import { ScrollView, Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import { Wallet, TrendingUp, Receipt, ChevronRight, Banknote } from "lucide-react-native";
import { useVendorEarnings, useRecentPayouts } from "@/lib/queries";
import { formatINR } from "@/lib/format";

export default function VendorEarnings() {
  const { data: earnings } = useVendorEarnings();
  const { data: payoutsResp } = useRecentPayouts();
  const payouts = payoutsResp?.payouts ?? [];

  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-5 pt-6 pb-3">
        <Text className="text-muted text-xs uppercase tracking-widest">Earnings</Text>
        <Text className="text-text text-2xl mt-2 font-semibold">{formatINR(earnings?.total_revenue_paise ?? 0)}</Text>
        <Text className="text-muted text-xs mt-1">Lifetime, net of commission</Text>
      </View>

      {/* Stat cards */}
      <View className="px-5 mt-3">
        <View className="rounded-2xl bg-surface border border-border p-5">
          <View className="flex-row items-center gap-2">
            <Wallet color="#145224" size={16} />
            <Text className="text-text font-semibold">Available to withdraw</Text>
          </View>
          <Text className="text-text text-3xl mt-3 font-semibold">{formatINR(earnings?.available_paise ?? 0)}</Text>
          <Text className="text-muted text-xs mt-1">
            Next payout: {earnings?.next_payout_date ?? "—"}
          </Text>
          <Link href="/payouts/request" asChild>
            <Pressable className="mt-4 bg-primary-700 rounded-xl px-4 py-3 self-start flex-row items-center gap-2">
              <Banknote color="#fff" size={14} />
              <Text className="text-white font-semibold text-sm">Request payout</Text>
            </Pressable>
          </Link>
        </View>

        <View className="flex-row gap-3 mt-3">
          <View className="flex-1 rounded-2xl bg-surface border border-border p-4">
            <TrendingUp color="#145224" size={16} />
            <Text className="text-text text-xl mt-3 font-semibold">{formatINR(earnings?.this_month_paise ?? 0)}</Text>
            <Text className="text-muted text-xs mt-1">This month</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-surface border border-border p-4">
            <Receipt color="#145224" size={16} />
            <Text className="text-text text-xl mt-3 font-semibold">{earnings?.completed_bookings ?? 0}</Text>
            <Text className="text-muted text-xs mt-1">Completed jobs</Text>
          </View>
        </View>
      </View>

      {/* Recent payouts */}
      <View className="px-5 mt-6 mb-12">
        <View className="flex-row items-end justify-between mb-3">
          <Text className="text-text font-semibold">Recent payouts</Text>
          <Link href="/payouts" className="text-primary-700 text-sm font-medium">
            See all
          </Link>
        </View>
        {payouts.length === 0 ? (
          <View className="rounded-2xl bg-surface border border-border p-6 items-center">
            <Text className="text-muted text-sm">No payouts yet.</Text>
          </View>
        ) : (
          payouts.slice(0, 5).map((p) => (
            <Link key={p.id} href={`/payouts/${p.id}` as any} asChild>
              <Pressable className="bg-surface rounded-2xl p-4 mb-2 border border-border flex-row items-center justify-between">
                <View>
                  <Text className="text-text font-semibold">{formatINR(p.amount_paise)}</Text>
                  <Text className="text-muted text-xs mt-0.5">
                    {new Date(p.created_at).toLocaleDateString()} · {p.status}
                  </Text>
                </View>
                <ChevronRight size={16} color="#6B7280" />
              </Pressable>
            </Link>
          ))
        )}
      </View>
    </ScrollView>
  );
}
