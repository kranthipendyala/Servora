import { ScrollView, Text, View, Pressable } from "react-native";
import { Link } from "expo-router";
import {
  Wrench, Zap, Wind, Sparkles, PaintBucket, Hammer,
  Sofa, Bug, Droplet, ShieldCheck, Wifi, Car,
} from "lucide-react-native";

const ALL_CATEGORIES = [
  { slug: "plumbing",      title: "Plumbing",         icon: Wrench },
  { slug: "electrical",    title: "Electrical",       icon: Zap },
  { slug: "ac-repair",     title: "AC repair",        icon: Wind },
  { slug: "cleaning",      title: "Home cleaning",    icon: Sparkles },
  { slug: "painting",      title: "Painting",         icon: PaintBucket },
  { slug: "carpentry",     title: "Carpentry",        icon: Hammer },
  { slug: "furniture",     title: "Furniture",        icon: Sofa },
  { slug: "pest-control",  title: "Pest control",     icon: Bug },
  { slug: "water-purifier",title: "Water purifier",   icon: Droplet },
  { slug: "security",      title: "Security systems", icon: ShieldCheck },
  { slug: "internet",      title: "Wi-Fi & networking", icon: Wifi },
  { slug: "vehicle",       title: "Vehicle service",  icon: Car },
] as const;

export default function CategoriesScreen() {
  return (
    <ScrollView className="flex-1 bg-bg">
      <View className="px-6 pt-6 pb-12">
        <Text className="text-muted text-xs uppercase tracking-widest">All services</Text>
        <Text className="text-text text-2xl mt-2 mb-6 font-semibold">What do you need today?</Text>

        <View className="flex-row flex-wrap -mx-2">
          {ALL_CATEGORIES.map((c) => {
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
    </ScrollView>
  );
}
