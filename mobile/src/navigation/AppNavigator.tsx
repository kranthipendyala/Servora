import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {Colors, Fonts} from '../theme';
import type {
  TabParamList,
  HomeStackParamList,
  SearchStackParamList,
  BookingsStackParamList,
  CategoriesStackParamList,
  ProfileStackParamList,
} from './types';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryListingScreen from '../screens/CategoryListingScreen';
import BusinessDetailScreen from '../screens/BusinessDetailScreen';
import CityScreen from '../screens/CityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import ServiceListScreen from '../screens/ServiceListScreen';

const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const CategoriesStack = createNativeStackNavigator<CategoriesStackParamList>();
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

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={defaultScreenOptions}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="BusinessDetail"
        component={BusinessDetailScreen}
        options={({route}) => ({
          title: route.params.businessName || 'Business Details',
        })}
      />
      <HomeStack.Screen
        name="CategoryListing"
        component={CategoryListingScreen}
        options={({route}) => ({
          title: route.params.categoryName,
        })}
      />
      <HomeStack.Screen
        name="CitySelect"
        component={CityScreen}
        options={{title: 'Select City'}}
      />
      <HomeStack.Screen
        name="ServiceList"
        component={ServiceListScreen}
        options={({route}) => ({
          title: `${route.params.businessName} - Services`,
        })}
      />
    </HomeStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={defaultScreenOptions}>
      <SearchStack.Screen
        name="SearchMain"
        component={SearchScreen}
        options={{headerShown: false}}
      />
      <SearchStack.Screen
        name="BusinessDetail"
        component={BusinessDetailScreen}
        options={({route}) => ({
          title: route.params.businessName || 'Business Details',
        })}
      />
      <SearchStack.Screen
        name="CategoryListing"
        component={CategoryListingScreen}
        options={({route}) => ({
          title: route.params.categoryName,
        })}
      />
    </SearchStack.Navigator>
  );
}

function BookingsStackNavigator() {
  return (
    <BookingsStack.Navigator screenOptions={defaultScreenOptions}>
      <BookingsStack.Screen
        name="BookingsMain"
        component={MyBookingsScreen}
        options={{title: 'My Bookings'}}
      />
      <BookingsStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{title: 'Booking Details'}}
      />
    </BookingsStack.Navigator>
  );
}

function CategoriesStackNavigator() {
  return (
    <CategoriesStack.Navigator screenOptions={defaultScreenOptions}>
      <CategoriesStack.Screen
        name="CategoriesMain"
        component={CategoriesScreen}
        options={{title: 'Categories'}}
      />
      <CategoriesStack.Screen
        name="CategoryListing"
        component={CategoryListingScreen}
        options={({route}) => ({
          title: route.params.categoryName,
        })}
      />
      <CategoriesStack.Screen
        name="BusinessDetail"
        component={BusinessDetailScreen}
        options={({route}) => ({
          title: route.params.businessName || 'Business Details',
        })}
      />
    </CategoriesStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={defaultScreenOptions}>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{title: 'My Profile'}}
      />
      <ProfileStack.Screen
        name="Login"
        component={LoginScreen}
        options={{title: 'Login'}}
      />
      <ProfileStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{title: 'Create Account'}}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: 'Settings'}}
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
    case 'HomeTab':
      iconName = focused ? 'home' : 'home-outline';
      break;
    case 'SearchTab':
      iconName = focused ? 'search' : 'search-outline';
      break;
    case 'BookingsTab':
      iconName = focused ? 'calendar' : 'calendar-outline';
      break;
    case 'CategoriesTab':
      iconName = focused ? 'grid' : 'grid-outline';
      break;
    case 'ProfileTab':
      iconName = focused ? 'person' : 'person-outline';
      break;
    default:
      iconName = 'ellipse-outline';
  }

  return {name: iconName, color};
}

export default function AppNavigator() {
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
        name="HomeTab"
        component={HomeStackNavigator}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{tabBarLabel: 'Search'}}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsStackNavigator}
        options={{tabBarLabel: 'Bookings'}}
      />
      <Tab.Screen
        name="CategoriesTab"
        component={CategoriesStackNavigator}
        options={{tabBarLabel: 'Categories'}}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}
