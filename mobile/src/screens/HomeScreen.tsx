import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';
import {
  getFeaturedBusinesses,
  getPopularCategories,
  getCities,
} from '../services/api';
import {detectLocation, loadCity} from '../services/location';
import BusinessCard from '../components/BusinessCard';
import CategoryCard from '../components/CategoryCard';
import CityCard from '../components/CityCard';
import LocationBanner from '../components/LocationBanner';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import type {Business, Category, City} from '../types';
import type {HomeStackScreenProps} from '../navigation/types';

type Props = HomeStackScreenProps<'HomeMain'>;

export default function HomeScreen({navigation}: Props) {
  const [currentCity, setCurrentCity] = useState({
    name: '',
    slug: '',
    source: 'default' as 'gps' | 'ip' | 'manual' | 'default',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const savedCity = await loadCity();
      let cityInfo;
      if (savedCity) {
        cityInfo = savedCity;
      } else {
        cityInfo = await detectLocation();
      }
      setCurrentCity(cityInfo);

      const [categoriesRes, businessesRes, citiesRes] = await Promise.all([
        getPopularCategories(),
        getFeaturedBusinesses(cityInfo.slug),
        getCities(),
      ]);

      if (categoriesRes.status && Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      }
      if (businessesRes.status && Array.isArray(businessesRes.data)) {
        setFeaturedBusinesses(businessesRes.data);
      }
      if (citiesRes.status && Array.isArray(citiesRes.data)) {
        setCities(citiesRes.data.slice(0, 10));
      }
    } catch (err) {
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      const checkCity = async () => {
        const saved = await loadCity();
        if (saved && saved.slug !== currentCity.slug) {
          loadData();
        }
      };
      checkCity();
    }, [currentCity.slug, loadData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleBusinessPress = (business: Business) => {
    navigation.navigate('BusinessDetail', {
      citySlug: business.city_slug,
      businessSlug: business.slug,
      businessName: business.name,
    });
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoryListing', {
      categorySlug: category.slug,
      categoryName: category.name,
      citySlug: currentCity.slug,
    });
  };

  const handleCityPress = (name: string, slug: string) => {
    navigation.navigate('CitySelect');
  };

  const handleChangeCity = () => {
    navigation.navigate('CitySelect');
  };

  if (loading) {
    return <LoadingSpinner message="Loading Servora..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={() => loadData()} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Servora</Text>
            <Text style={styles.headerSubtitle}>Find trusted services near you</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {}}
            activeOpacity={0.7}>
            <Icon name="notifications-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('SearchTab' as any)}
          activeOpacity={0.8}>
          <Icon name="search-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>
            Search for services, businesses...
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        {currentCity.name ? (
          <LocationBanner
            cityName={currentCity.name}
            source={currentCity.source}
            onChangeCity={handleChangeCity}
          />
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CategoriesTab' as any)}
              activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}>
            {categories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={handleCategoryPress}
                compact
              />
            ))}
            {categories.length === 0 && (
              <Text style={styles.emptyText}>No categories available</Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Businesses</Text>
          </View>
          {featuredBusinesses.length > 0 ? (
            featuredBusinesses.map(business => (
              <BusinessCard
                key={business.id}
                business={business}
                onPress={handleBusinessPress}
              />
            ))
          ) : (
            <View style={styles.emptySection}>
              <Icon name="business-outline" size={40} color={Colors.gray300} />
              <Text style={styles.emptyText}>
                No featured businesses in {currentCity.name || 'your area'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Cities</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityScroll}>
            {cities.map(city => (
              <CityCard
                key={city.id}
                name={city.name}
                slug={city.slug}
                onPress={handleCityPress}
                compact
                isSelected={city.slug === currentCity.slug}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray300,
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Shadows.md,
  },
  searchPlaceholder: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.accent,
  },
  categoryScroll: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
  },
  cityScroll: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.sm,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  bottomPadding: {
    height: Spacing.xxxl,
  },
});
