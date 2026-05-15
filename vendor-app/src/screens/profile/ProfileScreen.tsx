import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../../theme';
import {getProfile, vendorLogout, getSavedUser} from '../../services/api';
import type {User} from '../../types';
import type {ProfileScreenProps} from '../../navigation/types';

interface MenuItem {
  icon: string;
  label: string;
  screen?: keyof import('../../navigation/types').ProfileStackParamList;
  color?: string;
  onPress?: () => void;
}

export default function ProfileScreen({
  navigation,
}: ProfileScreenProps<'ProfileMain'>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const saved = await getSavedUser();
      if (saved) setUser(saved);

      const res = await getProfile();
      if (res.status) {
        setUser(res.data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await vendorLogout();
          // In a real app, this would trigger auth state change
          Alert.alert('Logged Out', 'Please restart the app.');
        },
      },
    ]);
  }

  const menuItems: MenuItem[] = [
    {
      icon: 'time-outline',
      label: 'Availability',
      screen: 'Availability',
    },
    {
      icon: 'card-outline',
      label: 'Bank Details',
      screen: 'BankDetails',
    },
    {
      icon: 'diamond-outline',
      label: 'Subscription',
      screen: 'Subscription',
    },
    {
      icon: 'document-text-outline',
      label: 'Documents',
      screen: 'Documents',
    },
    {
      icon: 'settings-outline',
      label: 'Settings',
      screen: 'Settings',
    },
    {
      icon: 'log-out-outline',
      label: 'Logout',
      color: Colors.red,
      onPress: handleLogout,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={[styles.profileCard, Shadows.md]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={36} color={Colors.white} />
          </View>
          {user?.is_verified && (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={20} color={Colors.verified} />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user?.name || 'Vendor'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        {user?.business_name && (
          <View style={styles.businessBadge}>
            <Icon name="business-outline" size={14} color={Colors.accent} />
            <Text style={styles.businessName}>{user.business_name}</Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={[styles.menuCard, Shadows.sm]}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && styles.menuItemBorder,
            ]}
            onPress={() => {
              if (item.onPress) {
                item.onPress();
              } else if (item.screen) {
                navigation.navigate(item.screen as any);
              }
            }}>
            <View style={styles.menuItemLeft}>
              <Icon
                name={item.icon}
                size={22}
                color={item.color || Colors.textSecondary}
              />
              <Text
                style={[
                  styles.menuItemLabel,
                  item.color ? {color: item.color} : {},
                ]}>
                {item.label}
              </Text>
            </View>
            <Icon
              name="chevron-forward"
              size={18}
              color={Colors.gray300}
            />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>Servora Vendor v1.0.0</Text>
    </ScrollView>
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
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 2,
  },
  userName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  userPhone: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  businessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    marginTop: Spacing.sm,
  },
  businessName: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
    color: Colors.accent,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemLabel: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.medium,
    color: Colors.textPrimary,
  },
  version: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
