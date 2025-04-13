import { View, StyleSheet, SafeAreaView, Text, TextInput, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import config from "../config";
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

console.log("Backend URL:", config.BACKEND_URL);

const screenWidth = Dimensions.get('window').width;

interface SessionPayload {
  code: string;
  email: string
  name:string
  classroom: {
    lat: number;
    lng: number;
    radius: number;
  };
}



export async function setSession(payload :SessionPayload) {
  try {
    // Use the BACKEND_URL from your config file
    const response = await fetch(`${config.BACKEND_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    console.log("Session set response:", result);
    return result;  // Return the response data for further processing if needed
  } catch (error) {
    console.error("Error setting session:", error);
    throw error;  // Rethrow so it can be caught in the caller if necessary
  }
}


export default function CodePage() {
  const router = useRouter();
  const [code, setNewCode] = useState('');
  const [cruzID, setCruzID] = useState('');
  const [fullName, setFullName] = useState('');

  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
  }, [slideAnim, fadeAnim]);

  const handleLogout = () => {
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
      setTimeout(() => {
        Animated.timing(bannerOpacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 3000);
    });
  };

  const handleSubmit = async () => {
    if (!code.trim() || !cruzID.trim() || !fullName.trim()) return;

    console.log("Submitted Code:", code);
    console.log("CruzID:", cruzID);
    console.log("Full Name:", fullName);

    const adminCode = code;
    const email = cruzID;
    const name = fullName;

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(`Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`);
    const studentLat = location.coords.latitude;
    const studentLong = location.coords.longitude;

    // Clear inputs
    setNewCode('');
    setCruzID('');
    setFullName('');

    fadeInSuccessBanner();

    const payload = {
        code: adminCode,
        email: email,
        name: name,
        classroom: {
          lat: studentLat,
          lng: studentLong,
          radius: 1000,
        },
    };

    try {
      // Call the setSession function to send the payload to the back end
      const result = await setSession(payload);
      console.log("Session set response:", result);

      setNewCode('');
      fadeInSuccessBanner();
    } catch (error) {
      console.error("Error setting session:", error);
    }
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
  <SafeAreaView style={styles.container}>
    <Animated.View style={{
      ...styles.content,
      transform: [{ translateX: slideAnim }],
      opacity: fadeAnim
    }}>
      <Text style={styles.title}>Enter Code</Text>

      <Animated.View style={[styles.successBanner, { opacity: bannerOpacity }]}>
        <Text style={styles.successText}>Submitted successfully!</Text>
      </Animated.View>

      <TextInput
        style={styles.input}
        placeholder="Type Attendance code"
        placeholderTextColor="#888"
        value={code}
        onChangeText={setNewCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Your CruzID"
        placeholderTextColor="#888"
        value={cruzID}
        onChangeText={setCruzID}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Your Full Name"
        placeholderTextColor="#888"
        value={fullName}
        onChangeText={setFullName}
      />

      <View style={styles.buttonContainer}>
        <Button label="Submit" onPress={handleSubmit} />
        <Button label="Log Out" onPress={handleLogout} />
      </View>
    </Animated.View>
  </SafeAreaView>
</TouchableWithoutFeedback>

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
});
