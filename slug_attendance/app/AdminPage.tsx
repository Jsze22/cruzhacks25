import { View, StyleSheet, SafeAreaView, Text, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import Button from '@/components/Button';
import { useState, useRef, useCallback } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';
import * as Location from 'expo-location';

const screenWidth = Dimensions.get('window').width;

export default function AdminPage() {
  const router = useRouter();
  const [newCode, setNewCode] = useState('');
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // effects for transitioning to other pages
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

  // when back button is pressed it will go back to index.tsx with effects
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

  // when submit button is pressed, code will be generated and location as well
  const handleGenerate = async () => {
    console.log("Admin created code:", newCode);

    // variable for the code the admin generated
    const adminCode = newCode;

    let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }
      
        let location = await Location.getCurrentPositionAsync({});
        console.log(`Latitude: ${location.coords.latitude}\nLongitude: ${location.coords.longitude}`);

        // variables of latitude and longitude of admin
        const adminLat = location.coords.latitude;
        const adminLong = location.coords.longitude;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{
        ...styles.content,
        transform: [{ translateX: slideAnim }],
        opacity: fadeAnim
      }}>
        <Text style={styles.title}>Admin Code Generator</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter new code"
          placeholderTextColor="#888"
          value={newCode}
          onChangeText={setNewCode}
        />
        <View style={styles.buttonContainer}>
          <Button label="Generate Code" onPress={handleGenerate} />
          <Button label="Back" onPress={handleBack} />
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
