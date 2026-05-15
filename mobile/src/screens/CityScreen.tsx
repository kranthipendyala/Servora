import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';
import {getCities} from '../services/api';
import {
  detectLocation,
  saveCity,
  loadCity,
  saveRecentCity,
  getRecentCities,
} from '../services/location';
import CityCard from '../components/CityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import type {City} from '../types';
import type {HomeStackScreenProps} from '../navigation/types';

type Props = HomeStackScreenProps<'CitySelect'>;

export default function CityScreen({navigation}: Props) {
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [recentCities, setRecentCities] = useState<Array<{name: string; slug: string}>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [citiesRes, currentCity, recent] = await Promise.all([
        getCities(),
        loadCity(),
        getRecentCities(),
      ]);

      if (citiesRes.status && Array.isArray(citiesRes.data)) {
        setCities(citiesRes.data);
        setFilteredCities(citiesRes.data);
      } else {
        setError('Failed to load cities');
      }

      if (currentCity) {
        setSelectedSlug(currentCity.slug);
      }
      setRecentCities(recent);
    } catch {
      setError('Failed to load cities. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.state?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchQuery, cities]);

  const handleDetectLocation = async () => {
    setDetecting(true);
    try {
      const detected = await detectLocation();
      await saveCity(detected.name, detected.slug);
      await saveRecentCity(detected.name, detected.slug);
      Alert.alert(
        'Location Detected',
        `Your location has been set to ${detected.name}.`,
        [{text: 'OK', onPress: () => navigation.goBack()}],
      );
    } catch {
      Alert.alert('Error', 'Could not detect your location. Please select a city manually.');
    } finally {
      setDetecting(false);
    }
  };

  const handleCitySelect = async (name: string, slug: string) => {
    await saveCity(name, slug);
    await saveRecentCity(name, slug);
    setSelectedSlug(slug);
    navigation.goBack();
  };

  const renderDetectButton = () => (
    <TouchableOpacity
      style={styles.detectButton}
      onPress={handleDetectLocation}
      activeOpacity={0.7}
      disabled={detecting}>
      {detecting ? (
        <ActivityIndicator size="small" color={Colors.white} />
      ) : (
        <Icon name="navigate" size={20} color={Colors.white} />
      )}
      <Text style={styles.detectButtonText}>
        {detecting ? 'Detecting...' : 'Detect My Location'}
      </Text>
    </TouchableOpacity>
  );

  const renderRecentCities = () => {
    if (recentCities.length === 0 || searchQuery.trim()) {
      return null;
    }

    return (
      <View style={styles.recentSection}>
        <Text style={styles.sectionLabel}>Recent Cities</Text>
        {recentCities.map((city, index) => (
          <CityCard
            key={`recent-${index}`}
            name={city.name}
            slug={city.slug}
            onPress={handleCitySelect}
            isSelected={city.slug === selectedSlug}
          />
        ))}
      </View>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.detectContainer}>{renderDetectButton()}</View>
      {renderRecentCities()}
      <View style={styles.allCitiesHeader}>
        <Text style={styles.sectionLabel}>
          {searchQuery.trim() ? 'Search Results' : 'All Cities'}
        </Text>
        <Text style={styles.cityCount}>
          {filteredCities.length} cities
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Loading cities..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={loadData} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Icon name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search cities..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="close-circle" size={18} color={Colors.gray300} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredCities}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <CityCard
            name={item.name}
            slug={item.slug}
            businessCount={item.business_count}
            onPress={handleCitySelect}
            isSelected={item.slug === selectedSlug}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="location-outline" size={48} color={Colors.gray300} />
            <Text style={styles.emptyText}>
              {searchQuery
                ? `No cities matching "${searchQuery}"`
                : 'No cities available'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  detectContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    ...Shadows.md,
  },
  detectButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    marginLeft: Spacing.sm,
  },
  recentSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  allCitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  cityCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
  },
  list: {
    paddingBottom: Spacing.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxxl,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
