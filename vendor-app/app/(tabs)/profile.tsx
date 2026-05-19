import { ScrollView, Text, View, Pressable, Image, Switch } from "react-native";
import { Link, useRouter } from "expo-router";
import {
  Briefcase, MapPin, FileText, CreditCard, Star, Bell,
  HelpCircle, LogOut, ChevronRight, Crown, ShieldCheck,
} from "lucide-react-native";
import { useCurrentVendor, useToggleAvailable, useLogout } from "@/lib/queries";

const ROWS = [
  { href: "/profile/business",        title: "Business profile", icon: Briefcase },
  { href: "/profile/service-areas",   title: "Service areas",    icon: MapPin },
  { href: "/profile/documents",       title: "KYC documents",    icon: FileText },
  { href: "/profile/bank-details",    title: "Bank details",     icon: CreditCard },
  { href: "/profile/subscription",    title: "Subscription",     icon: Crown },
  { href: "/profile/reviews",         title: "Reviews",          icon: Star },
  { href: "/profile/notifications",   title: "Notifications",    icon: Bell },
  { href: "/profile/help",            title: "Help & support",   icon: HelpCircle },
] as const;

export default function VendorProfile() {
  const router = useRouter();
  const { data: vendor } = useCurrentVendor();
  const toggleAvailable = useToggleAvailable();
  const logout = useLogout();

  return (
    <ScrollView className="flex-1 bg-bg">
      {/* Header card */}
      <View className="px-5 pt-6 pb-4">
        <View className="bg-primary-700 rounded-2xl p-5">
          <View className="flex-row items-center gap-3">
            <View className="w-14 h-14 rounded-2xl bg-cream items-center justify-center">
              <Text className="text-primary-700 font-bold text-lg">
                {(vendor?.business_name ?? vendor?.name ?? "S").slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-white font-semibold">{vendor?.business_name ?? vendor?.name ?? "Your business"}</Text>
                {!!vendor?.is_verified && <ShieldCheck size={14} color="#FBBF24" />}
              </View>
              <Text className="text-cream/80 text-xs mt-1">{vendor?.city_name ?? "Add your city"}</Text>
            </View>
          </View>

          {/* Availability toggle */}
          <View className="mt-4 flex-row items-center justify-between bg-primary-800/40 rounded-xl px-3 py-2.5">
            <View>
              <Text className="text-white text-sm font-medium">Accepting bookings</Text>
              <Text className="text-cream/70 text-[11px]">Turn off when you're full or away</Text>
            </View>
            <Switch
              value={!!vendor?.is_available}
              onValueChange={(v) => toggleAvailable.mutate({ is_available: v })}
              trackColor={{ true: "#FBBF24" }}
            />
          </View>
        </View>
      </View>

      {/* Menu */}
      <View className="px-5">
        {ROWS.map(({ href, title, icon: Icon }) => (
          <Link key={href} href={href as any} asChild>
            <Pressable className="bg-surface rounded-2xl p-4 mb-2 border border-border flex-row items-center gap-4">
              <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                <Icon size={16} color="#145224" />
              </View>
              <Text className="flex-1 text-text font-medium">{title}</Text>
              <ChevronRight size={16} color="#6B7280" />
            </Pressable>
          </Link>
        ))}
      </View>

      <Pressable
        onPress={() => logout.mutate()}
        className="mt-6 mb-12 mx-5 flex-row items-center justify-center gap-2 py-3"
      >
        <LogOut size={14} color="#B91C1C" />
        <Text className="text-red-700 font-semibold">Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}
