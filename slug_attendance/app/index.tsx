import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useRef, useCallback, useEffect } from 'react';
import { Image } from 'expo-image';
import Button from '@/components/Button';
import * as Notifications from 'expo-notifications';
import config from "../config";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const PlaceholderImage = require('@/assets/images/ucsc_campus.jpeg');
const PatternBackground = require('@/assets/images/ucsc_logo.png');

const GRID_ROWS = 14;
const GRID_COLS = 10;




export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${config.BACKEND_URL}/api/ping-status`);
        const data = await res.json();
  
        if (data.shouldPing) {
          console.log("Ping received from backend!");
  
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "⏰ Class Reminder",
              body: "Tap to view travel estimates to class.",
              data: { screen: "ETAPage" },
            },
            trigger: null, // Trigger immediately
          });
        }
      } catch (err) {
        console.error("Ping check failed:", err);
      }
    }, 10000); // check every 10 seconds
  
    return () => clearInterval(interval);
  }, []);
  

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -screenWidth,
        duration: 7900,
        useNativeDriver: true,
      })
    ).start();
  }, []);

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

  const handleAdmin = () => {
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
    ]).start(() => router.push('/AdminPage'));
  };

  const handleEstimate = () => {
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
    ]).start(() => router.push('/ETAPage'));
  };

  const renderGrid = (keyPrefix: string) => {
    return (
      <View key={keyPrefix} style={styles.gridBlock}>
        {Array.from({ length: GRID_ROWS }).map((_, row) => (
          <View key={`${keyPrefix}-row-${row}`} style={styles.gridRow}>
            {Array.from({ length: GRID_COLS }).map((_, col) => (
              <Image
                key={`${keyPrefix}-cell-${row}-${col}`}
                source={PatternBackground}
                style={styles.gridTile}
                contentFit="contain"
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Grid */}
      <Animated.View
        style={[
          styles.scrollingGrid,
          { transform: [{ translateX: scrollX }] },
        ]}
      >
        {renderGrid('main')}
        {renderGrid('loop')}
      </Animated.View>

      {/* Foreground Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Slug Attendance</Text>
        <View style={styles.imageWrapper}>
          <Image source={PlaceholderImage} style={styles.image} />
        </View>
        <View style={styles.footerContainer}>
          <Button label="Student Login" onPress={handleLogin} />
          <Button label="Admin Login" onPress={handleAdmin} />
          <Button label="Estimated ETA" onPress={handleEstimate} />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    overflow: 'hidden',
  },
  scrollingGrid: {
    position: 'absolute',
    flexDirection: 'row',
    width: screenWidth * 2,
    height: '100%',
    opacity: 0.08,
    zIndex: -1,
  },
  gridBlock: {
    width: screenWidth,
    flexDirection: 'column',
    padding: 0,
    margin: 0,
  },
  gridRow: {
    flexDirection: 'row',
    padding: 0,
    margin: 0,
  },
  gridTile: {
    width: screenWidth / GRID_COLS,
    height: screenHeight / GRID_ROWS,
    margin: 0,
    padding: 0,
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
    gap: 12,
  },
});
