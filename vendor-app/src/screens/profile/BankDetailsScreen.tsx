import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {getBankDetails, saveBankDetails} from '../../services/api';
import type {BankDetails} from '../../types';
import type {ProfileScreenProps} from '../../navigation/types';

export default function BankDetailsScreen({}: ProfileScreenProps<'BankDetails'>) {
  const [holderName, setHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBankDetails = useCallback(async () => {
    try {
      const res = await getBankDetails();
      if (res.status && res.data) {
        const d = res.data;
        setHolderName(d.account_holder_name || '');
        setAccountNumber(d.account_number || '');
        setConfirmAccountNumber(d.account_number || '');
        setIfscCode(d.ifsc_code || '');
        setBankName(d.bank_name || '');
        setBranchName(d.branch_name || '');
        setUpiId(d.upi_id || '');
        setIsVerified(d.is_verified);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBankDetails();
  }, [loadBankDetails]);

  async function handleSave() {
    if (!holderName.trim()) {
      Alert.alert('Error', 'Account holder name is required.');
      return;
    }
    if (!accountNumber.trim()) {
      Alert.alert('Error', 'Account number is required.');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      Alert.alert('Error', 'Account numbers do not match.');
      return;
    }
    if (!ifscCode.trim()) {
      Alert.alert('Error', 'IFSC code is required.');
      return;
    }
    if (!bankName.trim()) {
      Alert.alert('Error', 'Bank name is required.');
      return;
    }

    setSaving(true);
    try {
      const res = await saveBankDetails({
        account_holder_name: holderName.trim(),
        account_number: accountNumber.trim(),
        ifsc_code: ifscCode.trim().toUpperCase(),
        bank_name: bankName.trim(),
        branch_name: branchName.trim() || undefined,
        upi_id: upiId.trim() || undefined,
      });

      if (res.status) {
        setIsVerified(false);
        Alert.alert('Success', 'Bank details saved successfully. Verification is pending.');
      } else {
        Alert.alert('Error', res.message || 'Failed to save bank details.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {isVerified && (
          <View style={styles.verifiedBanner}>
            <Icon name="checkmark-circle" size={20} color={Colors.greenDark} />
            <Text style={styles.verifiedText}>
              Bank details verified
            </Text>
          </View>
        )}

        <View style={[styles.card, Shadows.sm]}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Holder Name *</Text>
            <TextInput
              style={styles.input}
              value={holderName}
              onChangeText={setHolderName}
              placeholder="Full name as per bank records"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number *</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder="Enter account number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Account Number *</Text>
            <TextInput
              style={[
                styles.input,
                confirmAccountNumber &&
                  confirmAccountNumber !== accountNumber &&
                  styles.inputError,
              ]}
              value={confirmAccountNumber}
              onChangeText={setConfirmAccountNumber}
              placeholder="Re-enter account number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
            />
            {confirmAccountNumber &&
              confirmAccountNumber !== accountNumber && (
                <Text style={styles.errorText}>Account numbers do not match</Text>
              )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>IFSC Code *</Text>
            <TextInput
              style={styles.input}
              value={ifscCode}
              onChangeText={setIfscCode}
              placeholder="e.g., SBIN0001234"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              maxLength={11}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Name *</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g., State Bank of India"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Branch Name</Text>
            <TextInput
              style={styles.input}
              value={branchName}
              onChangeText={setBranchName}
              placeholder="e.g., Main Branch"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        </View>

        <View style={[styles.card, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Icon name="card-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>UPI (Optional)</Text>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>UPI ID</Text>
            <TextInput
              style={styles.input}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="e.g., vendor@upi"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save Bank Details</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your bank details are encrypted and stored securely. They are used
          solely for processing payouts.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#D1FAE5',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  verifiedText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.greenDark,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
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
  input: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.red,
  },
  errorText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.red,
    marginTop: Spacing.xs,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  disclaimer: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.lg,
  },
});
