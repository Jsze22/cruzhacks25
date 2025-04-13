import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import config from '../config';

const screenWidth = Dimensions.get('window').width;

export default function TablePage() {
  const router = useRouter();
  const [checkins, setCheckins] = useState([]);

  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        const res = await fetch(`${config.BACKEND_URL}/api/checkins`);
        const data = await res.json();
        setCheckins(data);
      } catch (error) {
        console.error("Failed to load check-ins:", error);
      }
    };

    fetchCheckins();
  }, []);

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.headerCell]}>Name</Text>
      <Text style={[styles.cell, styles.headerCell]}>Status</Text>
      <Text style={[styles.cell, styles.headerCell]}>Time</Text>
      <Text style={[styles.cell, styles.headerCell]}>Distance</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.username}</Text>
      <Text style={styles.cell}>{item.arrival}</Text>
      <Text style={styles.cell}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
      <Text style={styles.cell}>{item.distance}m</Text>
    </View>
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
      ]).start(() => router.push('/AdminPage'));
    };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }], opacity: fadeAnim }}>
        <Text style={styles.title}>Attendance Table</Text>
        {renderHeader()}
        <FlatList
          data={checkins}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <View style={styles.backButtonContainer}>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 30,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 10,
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#555',
  },
  cell: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#ffd700',
  },
  backButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
