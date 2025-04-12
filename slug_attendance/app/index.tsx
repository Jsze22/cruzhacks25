import { View, StyleSheet, SafeAreaView, Text, Animated, Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useRef, useCallback } from 'react';
import { Image } from 'expo-image';
import Button from '@/components/Button';

const screenWidth = Dimensions.get('window').width;
const PlaceholderImage = require('@/assets/images/ucsc_campus.jpeg');

export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fadeAnim.setValue(0);
      slideAnim.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, [fadeAnim, slideAnim])
  );

  const handleLogin = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => router.push('/CodePage'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, {
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }],
      }]}>
        <Text style={styles.title}>Slug Attendance</Text>
        <View style={styles.imageWrapper}>
          <Image source={PlaceholderImage} style={styles.image} />
        </View>
        <View style={styles.footerContainer}>
          <Button label="Login" onPress={handleLogin} />
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
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    letterSpacing: 1,
  },
  imageWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 24,
    overflow: 'hidden',
    marginVertical: 30,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 24,
  },
  footerContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
