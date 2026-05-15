import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {getVendorServices, updateService, deleteService} from '../../services/api';
import type {Service} from '../../types';
import type {ServicesScreenProps} from '../../navigation/types';

export default function MyServicesScreen({
  navigation,
}: ServicesScreenProps<'ServicesMain'>) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVendorServices();
      if (res.status) {
        setServices(res.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadServices();
    });
    return unsubscribe;
  }, [navigation, loadServices]);

  async function handleToggleActive(service: Service) {
    try {
      const res = await updateService(service.id, {
        name: service.name,
        category_id: service.category_id,
        base_price: service.base_price,
        price_unit: service.price_unit,
        duration_minutes: service.duration_minutes,
      });
      if (res.status) {
        setServices(prev =>
          prev.map(s =>
            s.id === service.id ? {...s, is_active: !s.is_active} : s,
          ),
        );
      }
    } catch {
      Alert.alert('Error', 'Failed to update service.');
    }
  }

  function handleDelete(id: number) {
    Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await deleteService(id);
            if (res.status) {
              setServices(prev => prev.filter(s => s.id !== id));
            } else {
              Alert.alert('Error', res.message || 'Failed to delete.');
            }
          } catch {
            Alert.alert('Error', 'Something went wrong.');
          }
        },
      },
    ]);
  }

  function renderService({item}: {item: Service}) {
    return (
      <View style={[styles.serviceCard, Shadows.sm]}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.name}</Text>
            {item.category_name && (
              <Text style={styles.categoryName}>{item.category_name}</Text>
            )}
          </View>
          <Switch
            value={item.is_active}
            onValueChange={() => handleToggleActive(item)}
            trackColor={{false: Colors.gray300, true: Colors.accentLight}}
            thumbColor={item.is_active ? Colors.accent : Colors.gray400}
          />
        </View>

        <View style={styles.serviceDetails}>
          <View style={styles.detailItem}>
            <Icon name="pricetag-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>
              ₹{item.discounted_price ?? item.base_price}
              {item.discounted_price && (
                <Text style={styles.strikePrice}> ₹{item.base_price}</Text>
              )}
              <Text style={styles.priceUnit}> /{item.price_unit}</Text>
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{item.duration_minutes} mins</Text>
          </View>
        </View>

        {item.variants && item.variants.length > 0 && (
          <Text style={styles.variantCount}>
            {item.variants.length} variant{item.variants.length > 1 ? 's' : ''}
          </Text>
        )}

        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate('AddService', {serviceId: item.id})
            }>
            <Icon name="create-outline" size={16} color={Colors.accent} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}>
            <Icon name="trash-outline" size={16} color={Colors.red} />
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="construct-outline" size={64} color={Colors.gray300} />
          <Text style={styles.emptyTitle}>No services yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first service to start receiving bookings
          </Text>
          <TouchableOpacity
            style={styles.addBtnLarge}
            onPress={() => navigation.navigate('AddService')}>
            <Icon name="add" size={20} color={Colors.white} />
            <Text style={styles.addBtnLargeText}>Add Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={item => String(item.id)}
          renderItem={renderService}
          contentContainerStyle={styles.listContent}
          numColumns={1}
        />
      )}

      {services.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddService')}>
          <Icon name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  addBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addBtnLargeText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.white,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 80,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  serviceInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  serviceName: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
  },
  categoryName: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium,
  },
  strikePrice: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
    fontWeight: Fonts.weights.regular,
  },
  priceUnit: {
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.regular,
  },
  variantCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.accent,
    marginBottom: Spacing.sm,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  editBtnText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.accent,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  deleteBtnText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.red,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xxl,
    right: Spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
});
