import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts} from '../theme';
import {getToken} from '../services/api';
import type {
  AuthStackParamList,
  DashboardStackParamList,
  BookingsStackParamList,
  ServicesStackParamList,
  EarningsStackParamList,
  ProfileStackParamList,
  TabParamList,
  RootStackParamList,
} from './types';

import LoginScreen from '../screens/auth/LoginScreen';
import DashboardScreen from '../screens/home/DashboardScreen';
import BookingListScreen from '../screens/bookings/BookingListScreen';
import BookingDetailScreen from '../screens/bookings/BookingDetailScreen';
import MyServicesScreen from '../screens/services/MyServicesScreen';
import AddServiceScreen from '../screens/services/AddServiceScreen';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SubscriptionScreen from '../screens/profile/SubscriptionScreen';
import BankDetailsScreen from '../screens/profile/BankDetailsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();
const EarningsStack = createNativeStackNavigator<EarningsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: Colors.primary,
  },
  headerTintColor: Colors.white,
  headerTitleStyle: {
    fontWeight: Fonts.weights.semibold,
    fontSize: Fonts.sizes.lg,
  },
  headerBackTitleVisible: false,
};

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={defaultScreenOptions}>
      <DashboardStack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{title: 'Dashboard'}}
      />
      <DashboardStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{title: 'Booking Details'}}
      />
    </DashboardStack.Navigator>
  );
}

function BookingsStackNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={defaultScreenOptions}>
      <BookingsStack.Screen
        name="BookingsMain"
        component={BookingListScreen}
        options={{title: 'Bookings'}}
      />
      <BookingsStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{title: 'Booking Details'}}
      />
    </BookingsStack.Navigator>
  );
}

function ServicesStackNavigator() {
  return (
    <ServicesStack.Navigator screenOptions={defaultScreenOptions}>
      <ServicesStack.Screen
        name="ServicesMain"
        component={MyServicesScreen}
        options={{title: 'My Services'}}
      />
      <ServicesStack.Screen
        name="AddService"
        component={AddServiceScreen}
        options={({route}) => ({
          title: route.params?.serviceId ? 'Edit Service' : 'Add Service',
        })}
      />
    </ServicesStack.Navigator>
  );
}

function EarningsStackNavigator() {
  return (
    <EarningsStack.Navigator screenOptions={defaultScreenOptions}>
      <EarningsStack.Screen
        name="EarningsMain"
        component={EarningsScreen}
        options={{title: 'Earnings'}}
      />
    </EarningsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={defaultScreenOptions}>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{title: 'Profile'}}
      />
      <ProfileStack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{title: 'Subscription'}}
      />
      <ProfileStack.Screen
        name="BankDetails"
        component={BankDetailsScreen}
        options={{title: 'Bank Details'}}
      />
    </ProfileStack.Navigator>
  );
}

function getTabIcon(
  routeName: string,
  focused: boolean,
): {name: string; color: string} {
  let iconName: string;
  const color = focused ? Colors.accent : Colors.gray400;

  switch (routeName) {
    case 'DashboardTab':
      iconName = focused ? 'grid' : 'grid-outline';
      break;
    case 'BookingsTab':
      iconName = focused ? 'calendar' : 'calendar-outline';
      break;
    case 'ServicesTab':
      iconName = focused ? 'construct' : 'construct-outline';
      break;
    case 'EarningsTab':
      iconName = focused ? 'wallet' : 'wallet-outline';
      break;
    case 'ProfileTab':
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'ellipse-outline';
  }

  return {name: iconName, color};
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, size}) => {
          const {name, color} = getTabIcon(route.name, focused);
          return <Icon name={name} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 4,
          paddingBottom: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: Fonts.sizes.xs,
          fontWeight: Fonts.weights.medium,
        },
      })}>
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{tabBarLabel: 'Dashboard'}}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStackNavigator}
        options={{tabBarLabel: 'Bookings'}}
      />
      <Tab.Screen
        name="ServicesTab"
        component={ServicesStackNavigator}
        options={{tabBarLabel: 'Services'}}
      />
      <Tab.Screen
        name="EarningsTab"
        component={EarningsStackNavigator}
        options={{tabBarLabel: 'Earnings'}}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = await getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
