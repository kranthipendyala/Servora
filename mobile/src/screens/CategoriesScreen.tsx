import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  SectionList,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';
import {getCategories} from '../services/api';
import {loadCity} from '../services/location';
import CategoryCard from '../components/CategoryCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorView from '../components/ErrorView';
import EmptyState from '../components/EmptyState';
import type {Category} from '../types';
import type {CategoriesStackScreenProps} from '../navigation/types';

type Props = CategoriesStackScreenProps<'CategoriesMain'>;

interface SectionData {
  title: string;
  data: Category[];
}

export default function CategoriesScreen({navigation}: Props) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [citySlug, setCitySlug] = useState('');

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const city = await loadCity();
      if (city) {
        setCitySlug(city.slug);
      }

      const response = await getCategories();
      if (response.status && Array.isArray(response.data)) {
        setAllCategories(response.data);
        buildSections(response.data, '');
      } else {
        setError(response.message || 'Failed to load categories');
      }
    } catch {
      setError('Failed to load categories. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const buildSections = (categories: Category[], query: string) => {
    const parentCategories = categories.filter(c => !c.parent_id);
    const childCategories = categories.filter(c => c.parent_id);

    let sectionList: SectionData[] = [];

    if (parentCategories.length > 0) {
      parentCategories.forEach(parent => {
        const children = childCategories.filter(
          c => c.parent_id === parent.id,
        );
        const allInSection = [parent, ...children];
        const filtered = query
          ? allInSection.filter(c =>
              c.name.toLowerCase().includes(query.toLowerCase()),
            )
          : allInSection;

        if (filtered.length > 0) {
          sectionList.push({
            title: parent.name,
            data: filtered,
          });
        }
      });
    } else {
      const filtered = query
        ? categories.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()),
          )
        : categories;

      if (filtered.length > 0) {
        sectionList.push({
          title: 'All Categories',
          data: filtered,
        });
      }
    }

    setSections(sectionList);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    buildSections(allCategories, searchQuery);
  }, [searchQuery, allCategories]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleCategoryPress = (category: Category) => {
    navigation.navigate('CategoryListing', {
      categorySlug: category.slug,
      categoryName: category.name,
      citySlug: citySlug || undefined,
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading categories..." />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={() => loadData()} />;
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
            placeholder="Filter categories..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <Icon
              name="close-circle"
              size={18}
              color={Colors.gray300}
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <CategoryCard category={item} onPress={handleCategoryPress} />
        )}
        renderSectionHeader={({section}) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="grid-outline"
            title="No categories found"
            message={
              searchQuery
                ? `No categories matching "${searchQuery}"`
                : 'No categories available at the moment.'
            }
          />
        }
        contentContainerStyle={
          sections.length === 0 ? styles.emptyList : styles.list
        }
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray100,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    backgroundColor: Colors.gray200,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
});
