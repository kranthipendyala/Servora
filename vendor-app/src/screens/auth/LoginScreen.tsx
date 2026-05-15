import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {vendorLogin} from '../../services/api';
import type {AuthScreenProps} from '../../navigation/types';

type LoginMode = 'email' | 'phone';

export default function LoginScreen({navigation}: AuthScreenProps<'Login'>) {
  const [mode, setMode] = useState<LoginMode>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleEmailLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await vendorLogin(email.trim(), password);
      if (response.status) {
        const user = response.data.user;
        if (user.role !== 'vendor' && user.role !== 'business_owner') {
          Alert.alert(
            'Access Denied',
            'This app is for vendor/business accounts only. Please use the customer app.',
          );
          return;
        }
        // Navigation will be handled by auth state change in AppNavigator
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSendOtp() {
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }
    setOtpSent(true);
    Alert.alert('OTP Sent', 'A verification code has been sent to your phone.');
  }

  function handleVerifyOtp() {
    if (!otp.trim() || otp.trim().length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP.');
      return;
    }
    Alert.alert('Info', 'Phone OTP login coming soon.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="construct" size={48} color={Colors.white} />
          </View>
          <Text style={styles.title}>Servora Vendor</Text>
          <Text style={styles.subtitle}>Manage your business on the go</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'email' && styles.modeBtnActive]}
              onPress={() => setMode('email')}>
              <Text
                style={[
                  styles.modeBtnText,
                  mode === 'email' && styles.modeBtnTextActive,
                ]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'phone' && styles.modeBtnActive]}
              onPress={() => setMode('phone')}>
              <Text
                style={[
                  styles.modeBtnText,
                  mode === 'phone' && styles.modeBtnTextActive,
                ]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'email' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                  <Icon
                    name="mail-outline"
                    size={20}
                    color={Colors.gray400}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="vendor@example.com"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputContainer}>
                  <Icon
                    name="lock-closed-outline"
                    size={20}
                    color={Colors.gray400}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}>
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.gray400}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleEmailLogin}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.loginBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                  <Icon
                    name="call-outline"
                    size={20}
                    color={Colors.gray400}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {otpSent && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>OTP</Text>
                  <View style={styles.inputContainer}>
                    <Icon
                      name="keypad-outline"
                      size={20}
                      color={Colors.gray400}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="Enter OTP"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={otpSent ? handleVerifyOtp : handleSendOtp}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.loginBtnText}>
                    {otpSent ? 'Verify OTP' : 'Send OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Want to register your business?{' '}
          </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.accent,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Fonts.sizes.base,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    ...Shadows.lg,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    marginBottom: Spacing.xxl,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  modeBtnActive: {
    backgroundColor: Colors.accent,
  },
  modeBtnText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: Colors.white,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
  },
  passwordInput: {
    paddingRight: Spacing.xxxxl,
  },
  eyeIcon: {
    padding: Spacing.sm,
  },
  loginBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  forgotText: {
    fontSize: Fonts.sizes.md,
    color: Colors.accent,
    fontWeight: Fonts.weights.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  footerText: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
  },
  footerLink: {
    fontSize: Fonts.sizes.md,
    color: Colors.white,
    fontWeight: Fonts.weights.bold,
    textDecorationLine: 'underline',
  },
});
