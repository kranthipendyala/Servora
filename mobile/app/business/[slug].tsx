import { ScrollView, Text, View, Pressable, Linking, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Phone, MapPin, Star, ShieldCheck, ChevronRight } from "lucide-react-native";
import { useBusiness } from "@/lib/queries";

export default function BusinessDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: business, isLoading } = useBusiness(slug);

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#145224" />
      </View>
    );
  }

  if (!business) {
    return (
      <View className="flex-1 bg-bg items-center justify-center p-8">
        <Text className="text-text text-lg font-semibold">Vendor not found</Text>
        <Text className="text-muted mt-2">This listing may have been removed.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-bg">
      {/* Header */}
      <View className="px-6 pt-8 pb-6 bg-primary-700">
        <Text className="text-cream/80 text-xs uppercase tracking-widest">
          {business.categories?.[0]?.name ?? "Verified vendor"}
        </Text>
        <Text className="text-white mt-2 text-2xl leading-tight font-semibold">
          {business.name}
        </Text>
        <View className="flex-row items-center gap-3 mt-3">
          <View className="flex-row items-center gap-1">
            <Star size={14} color="#FBBF24" fill="#FBBF24" />
            <Text className="text-cream font-medium">
              {business.avg_rating?.toFixed(1) ?? "—"}
            </Text>
            <Text className="text-cream/70 text-sm">
              ({business.total_reviews ?? 0} reviews)
            </Text>
          </View>
          {!!business.is_verified && (
            <View className="flex-row items-center gap-1">
              <ShieldCheck size={14} color="#FBBF24" />
              <Text className="text-cream/90 text-sm">Verified</Text>
            </View>
          )}
        </View>
      </View>

      {/* CTAs */}
      <View className="flex-row gap-3 px-6 -mt-4">
        <Pressable
          onPress={() => business.phone && Linking.openURL(`tel:${business.phone}`)}
          className="flex-1 bg-white border border-border rounded-xl px-4 py-3 flex-row items-center justify-center gap-2"
        >
          <Phone size={16} color="#145224" />
          <Text className="text-primary-700 font-semibold">Call now</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/business/${slug}/book` as any)}
          className="flex-1 bg-primary-700 rounded-xl px-4 py-3 flex-row items-center justify-center gap-2"
        >
          <Text className="text-white font-semibold">Book a service</Text>
        </Pressable>
      </View>

      {/* About */}
      {!!business.description && (
        <View className="px-6 mt-8">
          <Text className="text-muted text-xs uppercase tracking-widest mb-2">About</Text>
          <Text className="text-text leading-relaxed">{business.description}</Text>
        </View>
      )}

      {/* Address */}
      {!!business.address && (
        <View className="px-6 mt-6 flex-row gap-3">
          <MapPin size={18} color="#6B7280" />
          <View className="flex-1">
            <Text className="text-text">{business.address}</Text>
            <Text className="text-muted text-sm mt-1">
              {business.locality_name ? `${business.locality_name}, ` : ""}{business.city_name}
            </Text>
          </View>
        </View>
      )}

      {/* Categories */}
      {!!business.categories?.length && (
        <View className="px-6 mt-8">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">Services offered</Text>
          <View className="flex-row flex-wrap gap-2">
            {business.categories.map((c) => (
              <View key={c.id} className="px-3 py-1.5 rounded-full bg-primary-50">
                <Text className="text-primary-700 text-sm font-medium">{c.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Service areas */}
      {!!business.service_areas?.length && (
        <View className="px-6 mt-8 mb-12">
          <Text className="text-muted text-xs uppercase tracking-widest mb-3">Service areas</Text>
          {business.service_areas.map((a) => (
            <View key={a.id} className="flex-row items-center justify-between py-2 border-b border-border">
              <Text className="text-text">{a.city_name}</Text>
              <ChevronRight size={14} color="#6B7280" />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
