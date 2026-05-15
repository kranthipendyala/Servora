import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  cityName?: string;
  onCityPress?: () => void;
  autoFocus?: boolean;
  showCitySelector?: boolean;
}

export default function SearchInput({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search for services...',
  cityName,
  onCityPress,
  autoFocus = false,
  showCitySelector = true,
}: SearchInputProps) {
  return (
    <View style={styles.container}>
      {showCitySelector && cityName && onCityPress && (
        <TouchableOpacity
          style={styles.citySelector}
          onPress={onCityPress}
          activeOpacity={0.7}>
          <Icon name="location" size={16} color={Colors.accent} />
          <Text style={styles.cityName} numberOfLines={1}>
            {cityName}
          </Text>
          <Icon name="chevron-down" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
      <View style={styles.inputWrapper}>
        <Icon
          name="search-outline"
          size={20}
          color={Colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="close-circle" size={20} color={Colors.gray300} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  cityName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
    marginRight: Spacing.xs,
    maxWidth: 150,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.md,
  },
});
