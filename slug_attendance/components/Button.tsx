import { StyleSheet, View, Pressable, Text, Animated } from 'react-native';
import React, { useRef } from 'react';
import { Dimensions } from 'react-native';

type Props = {
  label: string;
  onPress?: () => void;
};

export default function Button({ label, onPress }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <View style={styles.buttonContainer}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: pressed ? '#005fdb' : '#007aff',
              shadowOpacity: pressed ? 0.1 : 0.3,
            },
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.buttonLabel}>{label}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  buttonContainer: {
    width: screenWidth - 40,
    height: 68,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: 14,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
