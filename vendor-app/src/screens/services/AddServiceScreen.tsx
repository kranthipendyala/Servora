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
import {createService, updateService, getVendorServices} from '../../services/api';
import type {ServiceVariant} from '../../types';
import type {ServicesScreenProps} from '../../navigation/types';

interface VariantForm {
  name: string;
  price: string;
  duration_minutes: string;
  description: string;
}

export default function AddServiceScreen({
  route,
  navigation,
}: ServicesScreenProps<'AddService'>) {
  const serviceId = route.params?.serviceId;
  const isEditing = !!serviceId;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState('service');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  const loadService = useCallback(async () => {
    if (!serviceId) return;
    try {
      const res = await getVendorServices();
      if (res.status) {
        const service = res.data.find(s => s.id === serviceId);
        if (service) {
          setName(service.name);
          setCategoryId(String(service.category_id));
          setBasePrice(String(service.base_price));
          setDiscountedPrice(
            service.discounted_price ? String(service.discounted_price) : '',
          );
          setPriceUnit(service.price_unit);
          setDuration(String(service.duration_minutes));
          setDescription(service.description || '');
          if (service.variants) {
            setVariants(
              service.variants.map(v => ({
                name: v.name,
                price: String(v.price),
                duration_minutes: String(v.duration_minutes),
                description: v.description || '',
              })),
            );
          }
        }
      }
    } catch {
      // silently fail
    } finally {
      setInitialLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    if (isEditing) {
      loadService();
    }
  }, [isEditing, loadService]);

  function addVariant() {
    setVariants(prev => [
      ...prev,
      {name: '', price: '', duration_minutes: '', description: ''},
    ]);
  }

  function removeVariant(index: number) {
    setVariants(prev => prev.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof VariantForm, value: string) {
    setVariants(prev =>
      prev.map((v, i) => (i === index ? {...v, [field]: value} : v)),
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Error', 'Service name is required.');
      return;
    }
    if (!categoryId.trim()) {
      Alert.alert('Error', 'Category is required.');
      return;
    }
    if (!basePrice.trim() || isNaN(Number(basePrice))) {
      Alert.alert('Error', 'Please enter a valid base price.');
      return;
    }
    if (!duration.trim() || isNaN(Number(duration))) {
      Alert.alert('Error', 'Please enter a valid duration.');
      return;
    }

    const variantData = variants
      .filter(v => v.name.trim() && v.price.trim())
      .map(v => ({
        name: v.name.trim(),
        price: Number(v.price),
        duration_minutes: Number(v.duration_minutes) || Number(duration),
        description: v.description.trim() || undefined,
      }));

    const data = {
      name: name.trim(),
      category_id: Number(categoryId),
      base_price: Number(basePrice),
      discounted_price: discountedPrice ? Number(discountedPrice) : undefined,
      price_unit: priceUnit,
      duration_minutes: Number(duration),
      description: description.trim() || undefined,
      variants: variantData.length > 0 ? variantData : undefined,
    };

    setLoading(true);
    try {
      const res = isEditing
        ? await updateService(serviceId!, data)
        : await createService(data);

      if (res.status) {
        Alert.alert('Success', `Service ${isEditing ? 'updated' : 'created'} successfully.`);
        navigation.goBack();
      } else {
        Alert.alert('Error', res.message || 'Failed to save service.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  const priceUnits = ['service', 'hour', 'sq_ft', 'unit', 'visit'];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <View style={[styles.card, Shadows.sm]}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., AC Repair"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category ID *</Text>
            <TextInput
              style={styles.input}
              value={categoryId}
              onChangeText={setCategoryId}
              placeholder="Enter category ID"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Base Price (₹) *</Text>
              <TextInput
                style={styles.input}
                value={basePrice}
                onChangeText={setBasePrice}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Discounted Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={discountedPrice}
                onChangeText={setDiscountedPrice}
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Unit *</Text>
            <View style={styles.unitRow}>
              {priceUnits.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitChip,
                    priceUnit === unit && styles.unitChipActive,
                  ]}
                  onPress={() => setPriceUnit(unit)}>
                  <Text
                    style={[
                      styles.unitChipText,
                      priceUnit === unit && styles.unitChipTextActive,
                    ]}>
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (minutes) *</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 60"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the service..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Variants Section */}
        <View style={[styles.card, Shadows.sm]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Variants</Text>
            <TouchableOpacity style={styles.addVariantBtn} onPress={addVariant}>
              <Icon name="add-circle-outline" size={20} color={Colors.accent} />
              <Text style={styles.addVariantText}>Add Variant</Text>
            </TouchableOpacity>
          </View>

          {variants.length === 0 ? (
            <Text style={styles.noVariantsText}>
              No variants added. Add variants for different pricing tiers.
            </Text>
          ) : (
            variants.map((variant, index) => (
              <View key={index} style={styles.variantCard}>
                <View style={styles.variantHeader}>
                  <Text style={styles.variantTitle}>Variant {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeVariant(index)}>
                    <Icon name="close-circle" size={22} color={Colors.red} />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  value={variant.name}
                  onChangeText={v => updateVariant(index, 'name', v)}
                  placeholder="Variant name"
                  placeholderTextColor={Colors.textMuted}
                />
                <View style={[styles.row, {marginTop: Spacing.sm}]}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    value={variant.price}
                    onChangeText={v => updateVariant(index, 'price', v)}
                    placeholder="Price"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    value={variant.duration_minutes}
                    onChangeText={v =>
                      updateVariant(index, 'duration_minutes', v)
                    }
                    placeholder="Duration (min)"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                  />
                </View>
                <TextInput
                  style={[styles.input, {marginTop: Spacing.sm}]}
                  value={variant.description}
                  onChangeText={v => updateVariant(index, 'description', v)}
                  placeholder="Description (optional)"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEditing ? 'Update Service' : 'Create Service'}
            </Text>
          )}
        </TouchableOpacity>
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  unitChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  unitChipText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
  },
  unitChipTextActive: {
    color: Colors.white,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  addVariantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addVariantText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.accent,
  },
  noVariantsText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  variantCard: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  variantTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
});
