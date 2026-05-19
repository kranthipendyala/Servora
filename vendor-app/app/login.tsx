import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneLoginSchema } from "@servora/shared";
import { useSendOtp } from "@/lib/queries";
import type { z } from "zod";

type FormValues = z.infer<typeof phoneLoginSchema>;

export default function VendorLogin() {
  const router = useRouter();
  const sendOtp = useSendOtp();
  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { phone: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await sendOtp.mutateAsync(values);
      router.push({ pathname: "/otp", params: { phone: values.phone } } as any);
    } catch (e: any) {
      Alert.alert("Could not send OTP", e?.message ?? "Try again in a moment.");
    }
  };

  return (
    <View className="flex-1 bg-bg px-6 pt-10">
      <Text className="text-text text-3xl font-semibold">Sign in as a vendor</Text>
      <Text className="text-muted mt-2 leading-relaxed">
        Enter your registered phone — we'll send a one-time code.
      </Text>

      <View className="mt-8">
        <Text className="text-muted text-sm mb-2">Phone</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="+91 90000 00000"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-text"
            />
          )}
        />
        {errors.phone && (
          <Text className="text-red-700 text-sm mt-2">{errors.phone.message}</Text>
        )}
      </View>

      <Pressable
        disabled={sendOtp.isPending}
        onPress={handleSubmit(onSubmit)}
        className="mt-6 bg-primary-700 rounded-xl py-4 items-center"
      >
        {sendOtp.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">Send OTP</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push("/onboarding")} className="mt-6">
        <Text className="text-primary-700 text-center text-sm font-medium">
          New vendor? Set up your business →
        </Text>
      </Pressable>
    </View>
  );
}
