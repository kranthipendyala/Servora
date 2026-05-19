import { ScrollView, Text, View, Pressable, TextInput } from "react-native";
import { Link, useRouter } from "expo-router";
import {
  Wrench, Zap, Wind, Sparkles, PaintBucket, Hammer,
  Search, ChevronRight,
} from "lucide-react-native";
import { useState } from "react";
import { useFeaturedBusinesses } from "@/lib/queries";

const CATEGORIES = [
  { slug: "plumbing",    title: "Plumbing",        icon: Wrench },
  { slug: "electrical",  title: "Electrical",      icon: Zap },
  { slug: "ac-repair",   title: "AC repair",       icon: Wind },
  { slug: "cleaning",    title: "Home cleaning",   icon: Sparkles },
  { slug: "painting",    title: "Painting",        icon: PaintBucket },
  { slug: "carpentry",   title: "Carpentry",       icon: Hammer },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const { data: featured } = useFeaturedBusinesses();

  return (
    <ScrollView className="flex-1 bg-bg">
      {/* Hero */}
      <View className="px-6 pt-10 pb-8 bg-primary-700">
        <Text className="text-cream uppercase tracking-widest text-xs">Verified home-service vendors</Text>
        <Text className="text-white mt-3 text-3xl leading-tight font-semibold">
          Trusted help{"\n"}for every home.
        </Text>
        <Text className="text-cream/80 mt-3 leading-relaxed">
          Book plumbers, electricians, AC technicians and more — vetted, rated, and on time.
        </Text>

        {/* Search bar */}
        <Pressable
          onPress={() => router.push("/search")}
          className="mt-6 flex-row items-center gap-3 bg-white rounded-xl px-4 py-3"
        >
          <Search size={20} color="#6B7280" />
          <TextInput
            value={q}
            onChangeText={setQ}
            onFocus={() => router.push("/search")}
            placeholder="Find a service near you"
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-text"
          />
        </Pressable>
      </View>

      {/* Categories grid */}
      <View className="px-6 mt-8">
        <Text className="text-muted text-xs uppercase tracking-widest">Browse by need</Text>
        <Text className="text-text text-2xl mt-2 mb-5 font-semibold">Popular services</Text>
        <View className="flex-row flex-wrap -mx-2">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <View key={c.slug} className="w-1/2 px-2 mb-4">
                <Link href={`/category/${c.slug}` as any} asChild>
                  <Pressable className="bg-surface rounded-2xl p-5 border border-border">
                    <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center mb-3">
                      <Icon size={20} color="#145224" />
                    </View>
                    <Text className="text-text font-semibold">{c.title}</Text>
                  </Pressable>
                </Link>
              </View>
            );
          })}
        </View>
      </View>

      {/* Featured vendors */}
      <View className="px-6 mt-8 mb-12">
        <View className="flex-row items-end justify-between mb-5">
          <View>
            <Text className="text-muted text-xs uppercase tracking-widest">Top rated</Text>
            <Text className="text-text text-2xl mt-2 font-semibold">Featured vendors</Text>
          </View>
          <Link href="/(tabs)/categories" className="text-primary-700 font-medium">
            See all <ChevronRight size={14} />
          </Link>
        </View>

        {featured?.businesses?.slice(0, 4).map((b) => (
          <Link key={b.id} href={`/business/${b.slug}` as any} asChild>
            <Pressable className="bg-surface rounded-2xl p-4 mb-3 border border-border flex-row items-center gap-4">
              <View className="w-14 h-14 rounded-xl bg-primary-50 items-center justify-center">
                <Text className="text-primary-700 font-bold">{b.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-text font-semibold">{b.name}</Text>
                <Text className="text-muted text-sm mt-1">
                  {b.city_name ?? ""} · ★ {b.avg_rating?.toFixed(1) ?? "—"} ({b.total_reviews ?? 0})
                </Text>
              </View>
              <ChevronRight size={18} color="#6B7280" />
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}
