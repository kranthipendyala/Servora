import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';
import {getBusinessServices} from '../services/api';
import type {Service} from '../types';
import type {HomeStackScreenProps} from '../navigation/types';

export default function ServiceListScreen({
  route,
  navigation,
}: HomeStackScreenProps<'ServiceList'>) {
  const {businessSlug, businessName} = route.params;
  const [services, setServices] = useState<Service[]>([]);
  const [businessId, setBusinessId] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, [businessSlug]);

  const loadServices = async () => {
    const res = await getBusinessServices(businessSlug);
    if (res.status && res.data) {
      const data = res.data as any;
      setServices(data.services || []);
      if (data.business) {
        setBusinessId(data.business.id);
      }
    }
    setLoading(false);
  };

  const renderService = ({item}: {item: Service}) => {
    const effectivePrice = item.discounted_price || item.base_price;
    const hasDiscount = item.discounted_price && item.discounted_price < item.base_price;

    return (
      <View style={styles.serviceCard}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          {item.short_description && (
            <Text style={styles.serviceDesc}>{item.short_description}</Text>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.duration}>{item.duration_minutes} min</Text>
            {item.category_name && (
              <Text style={styles.category}>{item.category_name}</Text>
            )}
          </View>
          {item.variants && item.variants.length > 0 && (
            <Text style={styles.variantCount}>
              {item.variants.length} option{item.variants.length > 1 ? 's' : ''} available
            </Text>
          )}
        </View>
        <View style={styles.priceSection}>
          {hasDiscount && (
            <Text style={styles.originalPrice}>₹{item.base_price}</Text>
          )}
          <Text style={styles.price}>₹{effectivePrice}</Text>
          <Text style={styles.priceUnit}>
            {item.price_unit === 'per_hour'
              ? '/hr'
              : item.price_unit === 'per_sqft'
              ? '/sqft'
              : ''}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={Colors.accent}
        style={styles.loader}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={item => String(item.id)}
        renderItem={renderService}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No services available</Text>
          </View>
        }
      />

      {services.length > 0 && businessId > 0 && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            navigation.navigate('BookingFlow', {
              businessSlug,
              businessName,
              businessId,
            })
          }>
          <Text style={styles.bookButtonText}>Book a Service</Text>
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
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  list: {
    padding: Spacing.lg,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold as any,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  serviceDesc: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  duration: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },
  category: {
    fontSize: Fonts.sizes.xs,
    color: Colors.accent,
  },
  variantCount: {
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
  priceSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  originalPrice: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold as any,
    color: Colors.primary,
  },
  priceUnit: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textMuted,
  },
  bookButton: {
    backgroundColor: Colors.accent,
    margin: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.bold as any,
  },
  emptyContainer: {
    padding: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Fonts.sizes.base,
    color: Colors.textMuted,
  },
});
