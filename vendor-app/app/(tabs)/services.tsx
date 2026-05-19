import { FlatList, Text, View, Pressable, Switch, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { Plus, Tag, IndianRupee, Clock, ChevronRight } from "lucide-react-native";
import { useMyServices, useToggleServiceActive } from "@/lib/queries";
import { formatINR } from "@/lib/format";

export default function VendorServices() {
  const router = useRouter();
  const { data, isLoading } = useMyServices();
  const services = data?.services ?? [];
  const toggle = useToggleServiceActive();

  return (
    <View className="flex-1 bg-bg">
      <View className="px-5 pt-4 pb-3 border-b border-border bg-surface flex-row items-center justify-between">
        <View>
          <Text className="text-text font-semibold">Your services</Text>
          <Text className="text-muted text-xs mt-0.5">{services.length} listed</Text>
        </View>
        <Pressable
          onPress={() => router.push("/service/new")}
          className="bg-primary-700 rounded-xl px-3 py-2 flex-row items-center gap-1"
        >
          <Plus color="#fff" size={14} />
          <Text className="text-white text-xs font-semibold">Add</Text>
        </Pressable>
      </View>

      {isLoading && (
        <View className="py-12 items-center">
          <ActivityIndicator color="#145224" />
        </View>
      )}

      {!isLoading && services.length === 0 && (
        <View className="flex-1 items-center justify-center px-8 -mt-12">
          <View className="w-14 h-14 rounded-2xl bg-primary-50 items-center justify-center mb-3">
            <Tag size={24} color="#145224" />
          </View>
          <Text className="text-text font-semibold">No services yet</Text>
          <Text className="text-muted text-sm text-center mt-1 mb-4">
            Add at least one service so customers can book you.
          </Text>
          <Pressable
            onPress={() => router.push("/service/new")}
            className="bg-primary-700 rounded-xl px-5 py-3"
          >
            <Text className="text-white font-semibold">Create service</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        contentContainerStyle={{ padding: 20 }}
        data={services}
        keyExtractor={(s) => String(s.id)}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item: s }) => (
          <Link href={`/service/${s.id}` as any} asChild>
            <Pressable className="bg-surface rounded-2xl p-4 border border-border">
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                  <Tag size={16} color="#145224" />
                </View>
                <View className="flex-1">
                  <Text className="text-text font-semibold">{s.name}</Text>
                  {!!s.short_description && (
                    <Text className="text-muted text-xs mt-1 leading-relaxed" numberOfLines={2}>
                      {s.short_description}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-3 mt-2">
                    <View className="flex-row items-center gap-1">
                      <IndianRupee size={11} color="#6B7280" />
                      <Text className="text-muted text-xs">{formatINR(s.base_price * 100)}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Clock size={11} color="#6B7280" />
                      <Text className="text-muted text-xs">{s.duration_minutes ?? 60}m</Text>
                    </View>
                  </View>
                </View>
                <Switch
                  value={!!s.is_active}
                  onValueChange={(v) => toggle.mutate({ id: s.id, is_active: v })}
                  trackColor={{ true: "#145224" }}
                />
              </View>
              <View className="flex-row items-center justify-end mt-2">
                <Text className="text-primary-700 text-sm font-medium">Edit</Text>
                <ChevronRight size={14} color="#145224" />
              </View>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
