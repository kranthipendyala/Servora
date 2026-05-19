import { FlatList, Text, View, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Link } from "expo-router";
import { Star, ChevronRight, ShieldCheck } from "lucide-react-native";
import { useBusinessesByCategory } from "@/lib/queries";

export default function CategoryListing() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, isLoading } = useBusinessesByCategory(slug);
  const businesses = data?.businesses ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#145224" />
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-bg"
      contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      data={businesses}
      keyExtractor={(b) => String(b.id)}
      ListHeaderComponent={() => (
        <View className="mb-4">
          <Text className="text-muted text-xs uppercase tracking-widest">{slug?.replace(/-/g, " ")}</Text>
          <Text className="text-text text-2xl mt-2 font-semibold">
            {businesses.length} verified vendors
          </Text>
        </View>
      )}
      ItemSeparatorComponent={() => <View className="h-3" />}
      renderItem={({ item: b }) => (
        <Link href={`/business/${b.slug}` as any} asChild>
          <Pressable className="bg-surface rounded-2xl p-4 border border-border flex-row items-center gap-4">
            <View className="w-14 h-14 rounded-xl bg-primary-50 items-center justify-center">
              <Text className="text-primary-700 font-bold">{b.name.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-text font-semibold">{b.name}</Text>
                {!!b.is_verified && <ShieldCheck size={14} color="#145224" />}
              </View>
              <View className="flex-row items-center gap-3 mt-1">
                <View className="flex-row items-center gap-1">
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text className="text-muted text-sm">{b.avg_rating?.toFixed(1) ?? "—"}</Text>
                  <Text className="text-muted text-sm">({b.total_reviews ?? 0})</Text>
                </View>
                <Text className="text-muted text-sm">·</Text>
                <Text className="text-muted text-sm">{b.city_name}</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#6B7280" />
          </Pressable>
        </Link>
      )}
      ListEmptyComponent={() => (
        <View className="items-center py-12">
          <Text className="text-text font-semibold">No vendors yet</Text>
          <Text className="text-muted text-center mt-2">We're adding vendors in your city.</Text>
        </View>
      )}
    />
  );
}
