/*
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
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
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
              backgroundColor: pressed ? '#3399FF' : '#007AFF',
              shadowOpacity: pressed ? 0.2 : 0.4,
              transform: [{ scale: pressed ? 0.97 : 1 }],
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
    width: screenWidth - 60,
    height: 60,
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 16,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
  },
});
*/

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Animated,
} from 'react-native';

type Props = {
  label: string;
  onPress?: () => void;
  backgroundImage?: any;
};

export default function Button({ label, onPress, backgroundImage }: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const content = (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.button,
          backgroundImage ? styles.transparent : styles.defaultBackground,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  );

  if (backgroundImage) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          style={styles.background}
          imageStyle={styles.image}
        >
          {content}
        </ImageBackground>
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    height: 60,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    borderRadius: 16,
    opacity: 0.25,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  defaultBackground: {
    backgroundColor: '#003c6c',
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  pressed: {
    backgroundColor: '#fdc700',
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
  },
});
