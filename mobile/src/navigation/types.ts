import type {NavigatorScreenParams} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';

export type HomeStackParamList = {
  HomeMain: undefined;
  BusinessDetail: {citySlug: string; businessSlug: string; businessName?: string};
  CategoryListing: {categorySlug: string; categoryName: string; citySlug?: string};
  CitySelect: undefined;
  ServiceList: {businessSlug: string; businessName: string};
  BookingFlow: {businessSlug: string; businessName: string; businessId: number};
  BookingConfirmation: {bookingId: number; bookingNumber: string};
};

export type SearchStackParamList = {
  SearchMain: undefined;
  BusinessDetail: {citySlug: string; businessSlug: string; businessName?: string};
  CategoryListing: {categorySlug: string; categoryName: string; citySlug?: string};
};

export type BookingsStackParamList = {
  BookingsMain: undefined;
  BookingDetail: {bookingId: number};
};

export type CategoriesStackParamList = {
  CategoriesMain: undefined;
  CategoryListing: {categorySlug: string; categoryName: string; citySlug?: string};
  BusinessDetail: {citySlug: string; businessSlug: string; businessName?: string};
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Login: undefined;
  Register: undefined;
  Settings: undefined;
  MyAddresses: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  BookingsTab: NavigatorScreenParams<BookingsStackParamList>;
  CategoriesTab: NavigatorScreenParams<CategoriesStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;

export type SearchStackScreenProps<T extends keyof SearchStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SearchStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;

export type BookingsStackScreenProps<T extends keyof BookingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<BookingsStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;

export type CategoriesStackScreenProps<T extends keyof CategoriesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<CategoriesStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;
