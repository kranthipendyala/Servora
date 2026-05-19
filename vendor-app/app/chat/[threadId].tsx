import {
  View, Text, TextInput, FlatList, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Send } from "lucide-react-native";
import { useChatMessages, useSendChatMessage } from "@/lib/queries";

export default function VendorChatThread() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const id = Number(threadId);
  const { data, isLoading } = useChatMessages(id);
  const send = useSendChatMessage(id);
  const [text, setText] = useState("");

  const messages = data?.messages ?? [];

  const onSend = () => {
    const body = text.trim();
    if (!body) return;
    send.mutate({ body });
    setText("");
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#145224" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <View className="flex-1 bg-bg">
        <FlatList
          inverted
          contentContainerStyle={{ padding: 16, gap: 8 }}
          data={[...messages].reverse()}
          keyExtractor={(m) => String(m.id)}
          renderItem={({ item: m }) => {
            const mine = m.from === "vendor";
            return (
              <View className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "bg-primary-700 self-end" : "bg-surface border border-border self-start"}`}>
                <Text className={mine ? "text-white" : "text-text"}>{m.body}</Text>
                <Text className={`text-[10px] mt-1 ${mine ? "text-cream/80" : "text-muted"}`}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View className="items-center py-12">
              <Text className="text-muted">No messages yet — say hello.</Text>
            </View>
          )}
        />

        <View className="flex-row items-end gap-2 px-3 py-2 border-t border-border bg-surface">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor="#9CA3AF"
            multiline
            className="flex-1 bg-bg rounded-2xl px-4 py-2 text-text"
            style={{ maxHeight: 120 }}
          />
          <Pressable
            onPress={onSend}
            disabled={!text.trim() || send.isPending}
            className={`w-10 h-10 rounded-full items-center justify-center ${text.trim() ? "bg-primary-700" : "bg-muted/30"}`}
          >
            <Send size={16} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
