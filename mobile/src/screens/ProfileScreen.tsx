import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius, Shadows} from '../theme';
import {getToken, getSavedUser, logout} from '../services/api';
import type {User} from '../types';
import type {ProfileStackScreenProps} from '../navigation/types';

type Props = ProfileStackScreenProps<'ProfileMain'>;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileScreen({navigation}: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        const token = await getToken();
        setIsLoggedIn(!!token);
        if (token) {
          const savedUser = await getSavedUser();
          setUser(savedUser);
        } else {
          setUser(null);
        }
      };
      checkAuth();
    }, []),
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch {
            // still clear local state
          } finally {
            setIsLoggedIn(false);
            setUser(null);
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestContent}>
          <View style={styles.guestIconWrapper}>
            <Icon name="person-circle-outline" size={80} color={Colors.gray300} />
          </View>
          <Text style={styles.guestTitle}>Welcome to Servora</Text>
          <Text style={styles.guestSubtitle}>
            Login or create an account to manage your reviews, enquiries, and more.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}>
            <Icon name="log-in-outline" size={20} color={Colors.white} />
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}>
            <Icon name="person-add-outline" size={20} color={Colors.accent} />
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user ? getInitials(user.name) : 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          {user?.phone ? (
            <Text style={styles.userPhone}>{user.phone}</Text>
          ) : null}
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>My Activity</Text>
        <MenuItem
          icon="chatbubbles-outline"
          label="My Reviews"
          onPress={() => {}}
        />
        <MenuItem
          icon="mail-outline"
          label="My Enquiries"
          onPress={() => {}}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Settings</Text>
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <MenuItem
          icon="location-outline"
          label="Change City"
          onPress={() =>
            navigation.navigate('HomeTab' as any, {screen: 'CitySelect'})
          }
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Support</Text>
        <MenuItem
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => {}}
        />
        <MenuItem
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => {}}
        />
        <MenuItem
          icon="shield-outline"
          label="Privacy Policy"
          onPress={() => {}}
        />
        <MenuItem
          icon="information-circle-outline"
          label="About"
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loggingOut}
        activeOpacity={0.7}>
        <Icon name="log-out-outline" size={20} color={Colors.red} />
        <Text style={styles.logoutText}>
          {loggingOut ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.version}>Servora v1.0.0</Text>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}>
      <Icon name={icon} size={22} color={Colors.textSecondary} />
      <Text style={styles.menuItemLabel}>{label}</Text>
      {badge ? (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Icon name="chevron-forward" size={18} color={Colors.gray300} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  guestContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  guestContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
  },
  guestIconWrapper: {
    marginBottom: Spacing.lg,
  },
  guestTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
    width: '100%',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    marginLeft: Spacing.sm,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
    width: '100%',
  },
  registerButtonText: {
    color: Colors.accent,
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    marginLeft: Spacing.sm,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: Spacing.xl,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: Fonts.sizes.md,
    color: Colors.gray300,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: Fonts.sizes.md,
    color: Colors.gray300,
  },
  menuSection: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  menuSectionTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
    marginLeft: Spacing.lg,
  },
  menuBadge: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginRight: Spacing.sm,
  },
  menuBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
    color: Colors.white,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  logoutText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.red,
    marginLeft: Spacing.sm,
  },
  version: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  bottomPadding: {
    height: Spacing.xxxl,
  },
});
