import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts, Spacing, BorderRadius} from '../theme';
import {logout, getToken} from '../services/api';
import {loadCity} from '../services/location';
import type {ProfileStackScreenProps} from '../navigation/types';

type Props = ProfileStackScreenProps<'Settings'>;

export default function SettingsScreen({navigation}: Props) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currentCity, setCurrentCity] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const city = await loadCity();
        if (city) {
          setCurrentCity(city.name);
        }
        const token = await getToken();
        setIsLoggedIn(!!token);
      };
      load();
    }, []),
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch {
            // still proceed
          }
          navigation.popToTop();
        },
      },
    ]);
  };

  const handleChangeCity = () => {
    navigation.navigate('ProfileMain');
    setTimeout(() => {
      navigation.navigate('HomeTab' as any, {screen: 'CitySelect'});
    }, 100);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Location Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleChangeCity}
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <Icon name="location-outline" size={22} color={Colors.textSecondary} />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Current City</Text>
              <Text style={styles.settingValue}>
                {currentCity || 'Not selected'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={18} color={Colors.gray300} />
        </TouchableOpacity>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Icon
              name="notifications-outline"
              size={22}
              color={Colors.textSecondary}
            />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive updates about new businesses and offers
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{false: Colors.gray300, true: Colors.greenLight}}
            thumbColor={notificationsEnabled ? Colors.green : Colors.gray400}
          />
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            Linking.openURL('https://servora.com/about')
          }
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <Icon
              name="information-circle-outline"
              size={22}
              color={Colors.textSecondary}
            />
            <Text style={styles.settingLabel}>About Servora</Text>
          </View>
          <Icon name="open-outline" size={16} color={Colors.gray300} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            Linking.openURL('https://servora.com/terms')
          }
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <Icon
              name="document-text-outline"
              size={22}
              color={Colors.textSecondary}
            />
            <Text style={styles.settingLabel}>Terms of Service</Text>
          </View>
          <Icon name="open-outline" size={16} color={Colors.gray300} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            Linking.openURL('https://servora.com/privacy')
          }
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <Icon
              name="shield-outline"
              size={22}
              color={Colors.textSecondary}
            />
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </View>
          <Icon name="open-outline" size={16} color={Colors.gray300} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            Linking.openURL('mailto:support@servora.com')
          }
          activeOpacity={0.7}>
          <View style={styles.settingLeft}>
            <Icon
              name="mail-outline"
              size={22}
              color={Colors.textSecondary}
            />
            <Text style={styles.settingLabel}>Contact Support</Text>
          </View>
          <Icon name="open-outline" size={16} color={Colors.gray300} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      {isLoggedIn && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}>
          <Icon name="log-out-outline" size={20} color={Colors.red} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Servora</Text>
        <Text style={styles.versionNumber}>Version 1.0.0 (Build 1)</Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    backgroundColor: Colors.surface,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: Spacing.lg,
    flex: 1,
  },
  settingLabel: {
    fontSize: Fonts.sizes.base,
    color: Colors.textPrimary,
    marginLeft: Spacing.lg,
  },
  settingValue: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingDescription: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoutText: {
    fontSize: Fonts.sizes.base,
    fontWeight: Fonts.weights.semibold,
    color: Colors.red,
    marginLeft: Spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  versionText: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    color: Colors.textMuted,
  },
  versionNumber: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  bottomPadding: {
    height: Spacing.xxxl,
  },
});
