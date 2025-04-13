import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import axios from 'axios';
import Button from '@/components/Button';

const screenWidth = Dimensions.get('window').width;
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWNoYW5nOTMiLCJhIjoiY205ZXZtZ2M3MWY0ODJrcTNnYmltZ3V6ZSJ9.4XCPQXC4LrOhw4jKQTRUxw'; // <-- Replace this

const LOCATIONS = [
  { label: 'To McHenry Library', lat: 36.99584693486479, lng: -122.0588257792696 },
  { label: 'To Science & Engineering Library', lat: 36.99917952002756, lng: -122.0607817479879 },
  { label: 'To UCSC Gym', lat: 36.99364860100528, lng: -122.05451728400624 },
  { label: 'To Jack Baskin Engineering', lat: 37.000462835126974, lng: -122.06318748507618 },
  { label: 'To UCSC Quarry Plaza', lat: 36.997713713698154, lng: -122.0557358855456 },
  { label: 'To Humanities Lecture Hall', lat: 36.99841701963989, lng: -122.05455067787442 },
  { label: 'To Media Theater', lat: 36.995261396975565, lng: -122.06167032277186 },
  { label: 'To Kresge Lecture Hall', lat: 36.99897771975638, lng: -122.06628049548692},
];

export default function ETAPage() {
  const router = useRouter();
  const [etaMessage, setEtaMessage] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      slideAnim.setValue(screenWidth);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, [slideAnim, fadeAnim])
  );

  const handleBack = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => router.push('/'));
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setEtaMessage('Location permission denied.');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return location.coords;
  };

  const handleEstimate = async (lat: number, lng: number, label: string) => {
    const coords = await getCurrentLocation();
    if (!coords) return;

    const modes: ('walking' | 'driving' | 'cycling')[] = ['walking', 'driving', 'cycling'];
    const icons: Record<string, string> = {
      walking: '🚶',
      driving: '🚗',
      cycling: '🚴',
    };

    try {
      const results = await Promise.all(
        modes.map(async (mode) => {
          const response = await axios.get(
            `https://api.mapbox.com/directions/v5/mapbox/${mode}/${coords.longitude},${coords.latitude};${lng},${lat}`,
            {
              params: {
                access_token: MAPBOX_ACCESS_TOKEN,
                geometries: 'geojson',
              },
            }
          );

          const data = response.data;
          if (data.code !== 'Ok') return `${icons[mode]} N/A`;

          const route = data.routes[0];
          const minutes = route.duration / 60;
          const km = route.distance / 1000;

          const time =
            minutes >= 60
              ? `${Math.floor(minutes / 60)}h ${Math.round(minutes % 60)}m`
              : `${Math.round(minutes)} min`;

          return `${icons[mode]} ${time}`;
        })
      );

      const messages = results.filter(Boolean) as string[];
      setEtaMessage(`${label}\n\n${messages.join('\n')}`);
    } catch (error) {
      console.error('Mapbox error:', error);
      setEtaMessage('Failed to get ETAs from Mapbox.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.animatedContent,
          {
            transform: [{ translateX: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.title}>Estimate Travel Time</Text>

        <ScrollView contentContainerStyle={styles.buttonContainer}>
          {LOCATIONS.map((loc, idx) => (
            <Button
              key={idx}
              label={loc.label}
              onPress={() => handleEstimate(loc.lat, loc.lng, loc.label)}
            />
          ))}
        </ScrollView>

        <View style={styles.backButtonWrapper}>
          <Button label="Back" onPress={handleBack} />
        </View>

        {etaMessage && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{etaMessage}</Text>
            <Button label="Close" onPress={() => setEtaMessage(null)} />
          </View>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  animatedContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 40,
  },
  backButtonWrapper: {
    marginTop: 20,
  },
  banner: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 10,
  },
  bannerText: {
    color: '#fff',
    fontSize: 18, // Bigger font
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
});
