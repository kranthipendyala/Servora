import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={qc}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#FAFAF7" },
            headerTitleStyle: { color: "#111111", fontWeight: "600", fontSize: 16 },
            headerTintColor: "#145224",
            contentStyle: { backgroundColor: "#FAFAF7" },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="booking/[id]" options={{ title: "Booking" }} />
          <Stack.Screen name="chat/[threadId]" options={{ title: "Chat" }} />
          <Stack.Screen name="login" options={{ title: "Sign in" }} />
          <Stack.Screen name="onboarding" options={{ title: "Set up your business" }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
