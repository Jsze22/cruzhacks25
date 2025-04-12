import { View, StyleSheet, SafeAreaView, Text, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { useState, useEffect } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function CodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const slideAnim = useState(new Animated.Value(100))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

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

  const handleSubmit = () => {
    console.log("Submitted Code:", code);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ 
        ...styles.content, 
        transform: [{ translateX: slideAnim }],
        opacity: fadeAnim
      }}>
        <Text style={styles.title}>Enter Code</Text>
        <TextInput
          style={styles.input}
          placeholder="Type your code"
          placeholderTextColor="#888"
          value={code}
          onChangeText={setCode}
        />
        <View style={styles.buttonContainer}>
          <Button label="Submit" onPress={handleSubmit} />
          <Button label="Log Out" onPress={handleLogout} />
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