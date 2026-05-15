import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';
import {getBusinesses} from '../services/api';
import {loadCity} from '../services/location';
import BusinessCard from '../components/BusinessCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import type {Business} from '../types';
import type {HomeStackScreenProps} from '../navigation/types';

type Props = HomeStackScreenProps<'CategoryListing'>;

export default function CategoryListingScreen({route, navigation}: Props) {
  const {categorySlug, categoryName, citySlug: routeCitySlug} = route.params;

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [citySlug, setCitySlug] = useState(routeCitySlug || '');
  const [cityName, setCityName] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'reviews' | 'newest'>('relevance');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterVerified, setFilterVerified] = useState(false);

  const loadData = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      try {
        if (pageNum === 1 && !isRefresh) {
          setLoading(true);
        }
        setError(null);

        let effectiveCitySlug = citySlug;
        if (!effectiveCitySlug) {
          const city = await loadCity();
          if (city) {
            effectiveCitySlug = city.slug;
            setCitySlug(city.slug);
            setCityName(city.name);
          }
        }

        const response = await getBusinesses({
          category: categorySlug,
          city: effectiveCitySlug,
          sort: sortBy,
          rating: filterRating || undefined,
          verified: filterVerified || undefined,
          page: pageNum,
          per_page: 15,
        });

        if (response.status && Array.isArray(response.data)) {
          if (pageNum === 1) {
            setBusinesses(response.data);
          } else {
            setBusinesses(prev => [...prev, ...response.data]);
          }
          setTotal(response.total || response.data.length);
          setHasMore(
            response.data.length >= 15 &&
              (response.total ? pageNum * 15 < response.total : true),
          );
          setPage(pageNum);
        } else {
          if (pageNum === 1) {
            setBusinesses([]);
          }
          setHasMore(false);
        }
      } catch {
        setError('Failed to load businesses. Please try again.');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [categorySlug, citySlug, sortBy, filterRating, filterVerified],
  );

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadData(page + 1);
    }
  };

  const handleBusinessPress = (business: Business) => {
    navigation.navigate('BusinessDetail', {
      citySlug: business.city_slug,
      businessSlug: business.slug,
      businessName: business.name,
    });
  };

  const renderHeader = () => (
    <View style={styles.headerInfo}>
      <Text style={styles.resultCount}>
        {total > 0
          ? `${total} ${categoryName} business${total !== 1 ? 'es' : ''}${
              cityName ? ` in ${cityName}` : ''
            }`
          : `${categoryName}${cityName ? ` in ${cityName}` : ''}`}
      </Text>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <FlatList
        horizontal
        data={[
          {
            key: 'sort-relevance',
            label: 'Relevant',
            active: sortBy === 'relevance',
            onPress: () => setSortBy('relevance'),
          },
          {
            key: 'sort-rating',
            label: 'Top Rated',
            active: sortBy === 'rating',
            onPress: () => setSortBy('rating'),
            icon: 'star',
          },
          {
            key: 'sort-reviews',
            label: 'Most Reviews',
            active: sortBy === 'reviews',
            onPress: () => setSortBy('reviews'),
          },
          {
            key: 'sort-newest',
            label: 'Newest',
            active: sortBy === 'newest',
            onPress: () => setSortBy('newest'),
          },
          {
            key: 'filter-verified',
            label: 'Verified',
            active: filterVerified,
            onPress: () => setFilterVerified(!filterVerified),
            icon: 'checkmark-circle',
          },
          {
            key: 'filter-4star',
            label: '4+ Stars',
            active: filterRating === 4,
            onPress: () => setFilterRating(filterRating === 4 ? null : 4),
          },
          {
            key: 'filter-3star',
            label: '3+ Stars',
            active: filterRating === 3,
            onPress: () => setFilterRating(filterRating === 3 ? null : 3),
          },
        ]}
        keyExtractor={item => item.key}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[styles.chip, item.active && styles.chipActive]}
            onPress={item.onPress}
            activeOpacity={0.7}>
            {item.icon && (
              <Icon
                name={item.icon}
                size={12}
                color={item.active ? Colors.white : Colors.textSecondary}
                style={styles.chipIcon}
              />
            )}
            <Text
              style={[
                styles.chipText,
                item.active && styles.chipTextActive,
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner message={`Loading ${categoryName}...`} />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={() => loadData(1)} />;
  }

  return (
    <View style={styles.container}>
      {renderFilters()}
      <FlatList
        data={businesses}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <BusinessCard business={item} onPress={handleBusinessPress} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="business-outline"
            title="No businesses found"
            message={`No ${categoryName} businesses found${
              cityName ? ` in ${cityName}` : ''
            }. Try changing your filters.`}
          />
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          businesses.length === 0 ? styles.emptyList : styles.list
        }
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filtersContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chipsScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipIcon: {
    marginRight: 4,
  },
  chipText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  chipTextActive: {
    color: Colors.white,
  },
  headerInfo: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  resultCount: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
});
