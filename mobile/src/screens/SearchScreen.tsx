import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';
import {searchBusinesses} from '../services/api';
import {
  loadCity,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
} from '../services/location';
import BusinessCard from '../components/BusinessCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import type {Business} from '../types';
import type {SearchStackScreenProps} from '../navigation/types';

type Props = SearchStackScreenProps<'SearchMain'>;

export default function SearchScreen({navigation}: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [citySlug, setCitySlug] = useState('');
  const [cityName, setCityName] = useState('');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterVerified, setFilterVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'reviews'>('relevance');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      const city = await loadCity();
      if (city) {
        setCitySlug(city.slug);
        setCityName(city.name);
      }
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    };
    loadInitialData();
  }, []);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        return;
      }

      setLoading(true);
      setHasSearched(true);
      Keyboard.dismiss();

      await saveRecentSearch(searchQuery.trim());
      const searches = await getRecentSearches();
      setRecentSearches(searches);

      try {
        const response = await searchBusinesses(searchQuery.trim(), citySlug);
        if (response.status && Array.isArray(response.data)) {
          setResults(response.data);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [citySlug],
  );

  const handleSubmit = () => {
    performSearch(query);
  };

  const handleRecentPress = (search: string) => {
    setQuery(search);
    performSearch(search);
  };

  const handleClearRecent = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  };

  const handleBusinessPress = (business: Business) => {
    navigation.navigate('BusinessDetail', {
      citySlug: business.city_slug,
      businessSlug: business.slug,
      businessName: business.name,
    });
  };

  const getFilteredResults = (): Business[] => {
    let filtered = [...results];

    if (filterRating) {
      filtered = filtered.filter(b => b.average_rating >= filterRating);
    }
    if (filterVerified) {
      filtered = filtered.filter(b => b.is_verified);
    }

    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.average_rating - a.average_rating);
        break;
      case 'reviews':
        filtered.sort((a, b) => b.review_count - a.review_count);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredResults = getFilteredResults();

  const renderFilters = () => {
    if (!hasSearched || results.length === 0) {
      return null;
    }

    return (
      <View style={styles.filtersContainer}>
        <ScrollChips>
          <TouchableOpacity
            style={[styles.chip, sortBy === 'relevance' && styles.chipActive]}
            onPress={() => setSortBy('relevance')}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.chipText,
                sortBy === 'relevance' && styles.chipTextActive,
              ]}>
              Relevant
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, sortBy === 'rating' && styles.chipActive]}
            onPress={() => setSortBy('rating')}
            activeOpacity={0.7}>
            <Icon
              name="star"
              size={12}
              color={sortBy === 'rating' ? Colors.white : Colors.textSecondary}
            />
            <Text
              style={[
                styles.chipText,
                styles.chipTextWithIcon,
                sortBy === 'rating' && styles.chipTextActive,
              ]}>
              Rating
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, sortBy === 'reviews' && styles.chipActive]}
            onPress={() => setSortBy('reviews')}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.chipText,
                sortBy === 'reviews' && styles.chipTextActive,
              ]}>
              Most Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filterVerified && styles.chipActive]}
            onPress={() => setFilterVerified(!filterVerified)}
            activeOpacity={0.7}>
            <Icon
              name="checkmark-circle"
              size={12}
              color={filterVerified ? Colors.white : Colors.textSecondary}
            />
            <Text
              style={[
                styles.chipText,
                styles.chipTextWithIcon,
                filterVerified && styles.chipTextActive,
              ]}>
              Verified
            </Text>
          </TouchableOpacity>
          {[4, 3].map(rating => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.chip,
                filterRating === rating && styles.chipActive,
              ]}
              onPress={() =>
                setFilterRating(filterRating === rating ? null : rating)
              }
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.chipText,
                  filterRating === rating && styles.chipTextActive,
                ]}>
                {rating}+ Stars
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollChips>
      </View>
    );
  };

  const renderRecentSearches = () => {
    if (hasSearched || recentSearches.length === 0) {
      return null;
    }

    return (
      <View style={styles.recentContainer}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Searches</Text>
          <TouchableOpacity onPress={handleClearRecent} activeOpacity={0.7}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        {recentSearches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentItem}
            onPress={() => handleRecentPress(search)}
            activeOpacity={0.7}>
            <Icon name="time-outline" size={18} color={Colors.textMuted} />
            <Text style={styles.recentItemText}>{search}</Text>
            <Icon name="arrow-forward" size={16} color={Colors.gray300} />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.searchBarContainer}>
          <Icon name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search for services, businesses..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={handleSubmit}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                setHasSearched(false);
                setResults([]);
              }}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="close-circle" size={20} color={Colors.gray300} />
            </TouchableOpacity>
          )}
        </View>
        {cityName ? (
          <View style={styles.cityRow}>
            <Icon name="location" size={14} color={Colors.accentLight} />
            <Text style={styles.cityText}>{cityName}</Text>
          </View>
        ) : null}
      </View>

      {renderFilters()}

      {loading ? (
        <LoadingSpinner message="Searching..." />
      ) : hasSearched ? (
        <FlatList
          data={filteredResults}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <BusinessCard business={item} onPress={handleBusinessPress} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No results found"
              message={`We couldn't find any businesses matching "${query}". Try a different search term.`}
            />
          }
          contentContainerStyle={
            filteredResults.length === 0 ? styles.emptyList : styles.list
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderRecentSearches()
      )}
    </View>
  );
}

function ScrollChips({children}: {children: React.ReactNode}) {
  return (
    <FlatList
      horizontal
      data={React.Children.toArray(children)}
      renderItem={({item}) => <>{item}</>}
      keyExtractor={(_, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsScroll}
    />
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
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
    marginLeft: Spacing.sm,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  cityText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray300,
    marginLeft: Spacing.xs,
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
  chipText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  chipTextWithIcon: {
    marginLeft: 4,
  },
  chipTextActive: {
    color: Colors.white,
  },
  list: {
    paddingVertical: Spacing.sm,
  },
  emptyList: {
    flexGrow: 1,
  },
  recentContainer: {
    paddingTop: Spacing.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  recentTitle: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
  },
  clearText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.accent,
    fontWeight: Fonts.weights.medium,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  recentItemText: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.md,
  },
});
