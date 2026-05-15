import type {NavigatorScreenParams} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {CompositeScreenProps} from '@react-navigation/native';

// ---- Auth Stack ----

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ---- Dashboard Stack ----

export type DashboardStackParamList = {
  DashboardMain: undefined;
  BookingDetail: {bookingId: number};
};

// ---- Bookings Stack ----

export type BookingsStackParamList = {
  BookingsMain: undefined;
  BookingDetail: {bookingId: number};
};

// ---- Services Stack ----

export type ServicesStackParamList = {
  ServicesMain: undefined;
  AddService: {serviceId?: number} | undefined;
};

// ---- Earnings Stack ----

export type EarningsStackParamList = {
  EarningsMain: undefined;
};

// ---- Profile Stack ----

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Subscription: undefined;
  BankDetails: undefined;
  Availability: undefined;
  Documents: undefined;
  Settings: undefined;
};

// ---- Tab Param List ----

export type TabParamList = {
  DashboardTab: NavigatorScreenParams<DashboardStackParamList>;
  BookingsTab: NavigatorScreenParams<BookingsStackParamList>;
  ServicesTab: NavigatorScreenParams<ServicesStackParamList>;
  EarningsTab: NavigatorScreenParams<EarningsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ---- Root Stack ----

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<TabParamList>;
};

// ---- Screen Props ----

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type DashboardScreenProps<T extends keyof DashboardStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DashboardStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;

export type BookingsScreenProps<T extends keyof BookingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<BookingsStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;

export type ServicesScreenProps<T extends keyof ServicesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ServicesStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;

export type EarningsScreenProps<T extends keyof EarningsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<EarningsStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    BottomTabScreenProps<TabParamList>
  >;
