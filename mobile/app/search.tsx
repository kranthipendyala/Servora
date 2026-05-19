import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { Search as SearchIcon, X, Star, ChevronRight } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useSearchBusinesses } from "@/lib/queries";

export default function SearchScreen() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const { data, isFetching } = useSearchBusinesses(debounced);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const businesses = data?.businesses ?? [];

  return (
    <View className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-3 bg-surface border-b border-border">
        <View className="flex-row items-center gap-3 bg-bg rounded-xl px-4 py-3">
          <SearchIcon size={20} color="#6B7280" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Find a service near you"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-text"
            autoFocus
          />
          {!!q && (
            <Pressable onPress={() => setQ("")} hitSlop={10}>
              <X size={18} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      {isFetching && (
        <View className="py-8 items-center">
          <ActivityIndicator color="#145224" />
        </View>
      )}

      {!isFetching && debounced.length < 2 && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-muted text-center">
            Start typing — try "plumber", "AC repair", or "deep cleaning".
          </Text>
        </View>
      )}

      {!isFetching && debounced.length >= 2 && businesses.length === 0 && (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-text font-semibold">No matches for "{debounced}"</Text>
          <Text className="text-muted text-center mt-2">
            Try a broader term or pick a category from the home screen.
          </Text>
        </View>
      )}

      <FlatList
        contentContainerStyle={{ padding: 24 }}
        data={businesses}
        keyExtractor={(b) => String(b.id)}
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item: b }) => (
          <Link href={`/business/${b.slug}` as any} asChild>
            <Pressable className="bg-surface rounded-2xl p-4 border border-border flex-row items-center gap-4">
              <View className="w-12 h-12 rounded-xl bg-primary-50 items-center justify-center">
                <Text className="text-primary-700 font-bold text-sm">
                  {b.name.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-text font-semibold">{b.name}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text className="text-muted text-sm">
                    {b.avg_rating?.toFixed(1) ?? "—"} · {b.city_name}
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color="#6B7280" />
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
