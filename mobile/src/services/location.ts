import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, PermissionsAndroid} from 'react-native';

const CITY_KEY = '@selected_city';
const CITY_SLUG_KEY = '@selected_city_slug';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface DetectedCity {
  name: string;
  slug: string;
  source: 'gps' | 'ip' | 'manual' | 'default';
}

const KNOWN_CITIES: Array<{name: string; slug: string; aliases: string[]}> = [
  {name: 'Mumbai', slug: 'mumbai', aliases: ['mumbai', 'bombay', 'thane', 'navi mumbai']},
  {name: 'Delhi', slug: 'delhi', aliases: ['delhi', 'new delhi', 'noida', 'gurgaon', 'gurugram']},
  {name: 'Bangalore', slug: 'bangalore', aliases: ['bangalore', 'bengaluru']},
  {name: 'Hyderabad', slug: 'hyderabad', aliases: ['hyderabad', 'secunderabad']},
  {name: 'Chennai', slug: 'chennai', aliases: ['chennai', 'madras']},
  {name: 'Kolkata', slug: 'kolkata', aliases: ['kolkata', 'calcutta']},
  {name: 'Pune', slug: 'pune', aliases: ['pune', 'pimpri', 'chinchwad']},
  {name: 'Ahmedabad', slug: 'ahmedabad', aliases: ['ahmedabad', 'ahmadabad']},
  {name: 'Jaipur', slug: 'jaipur', aliases: ['jaipur']},
  {name: 'Lucknow', slug: 'lucknow', aliases: ['lucknow']},
  {name: 'Chandigarh', slug: 'chandigarh', aliases: ['chandigarh']},
  {name: 'Indore', slug: 'indore', aliases: ['indore']},
  {name: 'Bhopal', slug: 'bhopal', aliases: ['bhopal']},
  {name: 'Surat', slug: 'surat', aliases: ['surat']},
  {name: 'Nagpur', slug: 'nagpur', aliases: ['nagpur']},
  {name: 'Patna', slug: 'patna', aliases: ['patna']},
  {name: 'Kochi', slug: 'kochi', aliases: ['kochi', 'cochin', 'ernakulam']},
  {name: 'Coimbatore', slug: 'coimbatore', aliases: ['coimbatore']},
  {name: 'Visakhapatnam', slug: 'visakhapatnam', aliases: ['visakhapatnam', 'vizag']},
  {name: 'Vadodara', slug: 'vadodara', aliases: ['vadodara', 'baroda']},
];

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await Geolocation.requestAuthorization('whenInUse');
    return status === 'granted';
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Servora needs access to your location to show nearby services.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
        buttonNeutral: 'Ask Later',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }

  return false;
}

function getCurrentPosition(): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
}

async function reverseGeocode(coords: LocationCoords): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Servora/1.0',
        },
      },
    );
    const data = await response.json();
    if (data.address) {
      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.county ||
        null
      );
    }
    return null;
  } catch {
    return null;
  }
}

function matchCity(cityName: string): DetectedCity | null {
  const lower = cityName.toLowerCase().trim();
  for (const city of KNOWN_CITIES) {
    for (const alias of city.aliases) {
      if (lower.includes(alias) || alias.includes(lower)) {
        return {
          name: city.name,
          slug: city.slug,
          source: 'gps',
        };
      }
    }
  }
  return null;
}

export async function detectLocation(): Promise<DetectedCity> {
  try {
    const hasPermission = await requestLocationPermission();
    if (hasPermission) {
      const coords = await getCurrentPosition();
      const cityName = await reverseGeocode(coords);
      if (cityName) {
        const matched = matchCity(cityName);
        if (matched) {
          await saveCity(matched.name, matched.slug);
          return matched;
        }
      }
    }
  } catch {
    // GPS failed, try IP detection
  }

  try {
    return await detectByIp();
  } catch {
    // IP detection also failed
  }

  return {
    name: 'Mumbai',
    slug: 'mumbai',
    source: 'default',
  };
}

async function detectByIp(): Promise<DetectedCity> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    if (data.city) {
      const matched = matchCity(data.city);
      if (matched) {
        matched.source = 'ip';
        await saveCity(matched.name, matched.slug);
        return matched;
      }
    }
  } catch {
    // silently fail
  }

  return {
    name: 'Mumbai',
    slug: 'mumbai',
    source: 'default',
  };
}

export async function saveCity(name: string, slug: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CITY_KEY, name);
    await AsyncStorage.setItem(CITY_SLUG_KEY, slug);
  } catch {
    // silently fail
  }
}

export async function loadCity(): Promise<DetectedCity | null> {
  try {
    const name = await AsyncStorage.getItem(CITY_KEY);
    const slug = await AsyncStorage.getItem(CITY_SLUG_KEY);
    if (name && slug) {
      return {name, slug, source: 'manual'};
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveRecentCity(name: string, slug: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem('@recent_cities');
    let cities: Array<{name: string; slug: string}> = existing
      ? JSON.parse(existing)
      : [];
    cities = cities.filter(c => c.slug !== slug);
    cities.unshift({name, slug});
    cities = cities.slice(0, 5);
    await AsyncStorage.setItem('@recent_cities', JSON.stringify(cities));
  } catch {
    // silently fail
  }
}

export async function getRecentCities(): Promise<
  Array<{name: string; slug: string}>
> {
  try {
    const data = await AsyncStorage.getItem('@recent_cities');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveRecentSearch(query: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem('@recent_searches');
    let searches: string[] = existing ? JSON.parse(existing) : [];
    searches = searches.filter(s => s !== query);
    searches.unshift(query);
    searches = searches.slice(0, 10);
    await AsyncStorage.setItem('@recent_searches', JSON.stringify(searches));
  } catch {
    // silently fail
  }
}

export async function getRecentSearches(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem('@recent_searches');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem('@recent_searches');
  } catch {
    // silently fail
  }
}

export {KNOWN_CITIES};

export default {
  detectLocation,
  saveCity,
  loadCity,
  saveRecentCity,
  getRecentCities,
  saveRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  KNOWN_CITIES,
};
