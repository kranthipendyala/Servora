import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';
import {register} from '../services/api';
import type {ProfileStackScreenProps} from '../navigation/types';

type Props = ProfileStackScreenProps<'Register'>;

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  general?: string;
}

export default function RegisterScreen({navigation}: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      if (response.status) {
        navigation.popToTop();
      } else {
        setErrors({general: response.message || 'Registration failed. Please try again.'});
      }
    } catch {
      setErrors({general: 'Network error. Please check your connection.'});
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({...prev, [field]: undefined}));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="person-add" size={36} color={Colors.white} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Servora today</Text>
        </View>

        <View style={styles.form}>
          {errors.general ? (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={18} color={Colors.red} />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
              <Icon name="person-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={text => {
                  setName(text);
                  clearError('name');
                }}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
              <Icon name="mail-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  clearError('email');
                }}
                placeholder="Enter your email"
                placeholderTextColor={Colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
              <Icon name="call-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={text => {
                  setPhone(text);
                  clearError('phone');
                }}
                placeholder="Enter your phone number"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <Icon name="lock-closed-outline" size={20} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  clearError('password');
                }}
                placeholder="Create a password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.7}>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.replace('Login')}
              activeOpacity={0.7}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.gray300,
  },
  form: {
    padding: Spacing.xl,
    marginTop: Spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.redLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  errorBannerText: {
    fontSize: Fonts.sizes.md,
    color: Colors.red,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
  },
  inputError: {
    borderColor: Colors.red,
  },
  input: {
    flex: 1,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.red,
    marginTop: Spacing.xs,
  },
  registerButton: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.md,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  loginText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.accent,
  },
});
