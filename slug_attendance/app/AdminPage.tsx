import { View, StyleSheet, SafeAreaView, Text, TextInput, Animated, Easing, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Button from '@/components/Button';
import { useState, useRef, useCallback } from 'react';
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;

export default function AdminPage() {
  const router = useRouter();
  const [newCode, setNewCode] = useState('');
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const bannerOpacity = useRef(new Animated.Value(0)).current;

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

  const fadeInSuccessBanner = () => {
    bannerOpacity.setValue(0);
    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => fadeOutSuccessBanner(), 4000);
    });
  };

  const fadeOutSuccessBanner = () => {
    Animated.timing(bannerOpacity, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const handleGenerate = async () => {
    if (!newCode.trim()) return;

    console.log("Admin created code:", newCode);
    const adminCode = newCode;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const adminLat = location.coords.latitude;
    const adminLong = location.coords.longitude;

    const payload = {
      code: adminCode,
      classroom: {
        lat: adminLat,
        lng: adminLong,
        radius: 1000,
      },
    };

    try {
      const response = await fetch('http://10.0.0.248:5001/api/setsession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("Session set response:", result);

      setNewCode('');
      fadeInSuccessBanner();
    } catch (error) {
      console.error("Error setting session:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          ...styles.content,
          transform: [{ translateX: slideAnim }],
          opacity: fadeAnim,
        }}
      >
        <Text style={styles.title}>Admin Code Generator</Text>

        <Animated.View style={[styles.successBanner, { opacity: bannerOpacity }]}>
          <Text style={styles.successText}>Code generated successfully!</Text>
        </Animated.View>

        <TextInput
          style={styles.input}
          placeholder="Generate New Attendance Code"
          placeholderTextColor="#888"
          value={newCode}
          onChangeText={setNewCode}
        />

        <View style={styles.buttonContainer}>
          <Button label="Generate Code" onPress={handleGenerate} />
          <Button label="Log Out" onPress={handleBack} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  successBanner: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 50,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#fff',
    fontSize: 16,
    backgroundColor: '#1f1f1f',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});
