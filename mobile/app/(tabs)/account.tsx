import { ScrollView, Text, View, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import {
  User, MapPin, Bell, FileText, ShieldCheck, LogOut, ChevronRight, Store,
} from "lucide-react-native";
import { useCurrentUser, useLogout } from "@/lib/queries";

const ROWS = [
  { href: "/account/profile",       title: "Profile",          icon: User },
  { href: "/account/addresses",     title: "Saved addresses",  icon: MapPin },
  { href: "/account/notifications", title: "Notifications",    icon: Bell },
  { href: "/account/legal",         title: "Terms & privacy",  icon: FileText },
  { href: "/account/help",          title: "Help & support",   icon: ShieldCheck },
] as const;

export default function AccountScreen() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-6 pt-6 pb-12">
        <Text className="text-muted text-xs uppercase tracking-widest">You</Text>
        <Text className="text-text text-2xl mt-2 mb-6 font-semibold">
          {user ? `Hi, ${user.name?.split(" ")[0] ?? "there"}` : "Welcome"}
        </Text>

        {!user && (
          <Pressable
            onPress={() => router.push("/login")}
            className="bg-primary-700 rounded-2xl p-5 mb-6"
          >
            <Text className="text-white font-semibold text-base">Sign in to Servora</Text>
            <Text className="text-cream/80 text-sm mt-1">Track bookings, save favourites, and chat with vendors.</Text>
          </Pressable>
        )}

        {ROWS.map((r) => {
          const Icon = r.icon;
          return (
            <Link key={r.href} href={r.href as any} asChild>
              <Pressable className="bg-surface rounded-2xl p-4 mb-2 border border-border flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                  <Icon size={18} color="#145224" />
                </View>
                <Text className="flex-1 text-text font-medium">{r.title}</Text>
                <ChevronRight size={18} color="#6B7280" />
              </Pressable>
            </Link>
          );
        })}

        {/* Vendor entry — opens the separate vendor app or web vendor dashboard */}
        <View className="mt-6 bg-cream rounded-2xl p-5 border border-border">
          <View className="flex-row items-center gap-3 mb-2">
            <Store size={20} color="#145224" />
            <Text className="text-text font-semibold">Are you a service provider?</Text>
          </View>
          <Text className="text-muted text-sm leading-relaxed">
            List your business on Servora and reach customers in your city.
          </Text>
          <Link href="/vendor-signup" asChild>
            <Pressable className="mt-4 bg-primary-700 rounded-xl px-4 py-3 self-start">
              <Text className="text-white font-semibold text-sm">Become a vendor</Text>
            </Pressable>
          </Link>
        </View>

        {user && (
          <Pressable
            onPress={() => logout.mutate()}
            className="mt-8 flex-row items-center justify-center gap-2 py-3"
          >
            <LogOut size={16} color="#B91C1C" />
            <Text className="text-red-700 font-semibold">Sign out</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
