// src/components/common/AnimatedLoadingDots.js

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const AnimatedLoadingDots = ({ color = 'rgba(255, 255, 255, 0.8)', size = 8 }) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animValue, delay) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true
          })
        ])
      );
    };

    // Start animations with staggered delays
    Animated.parallel([
      createAnimation(dot1Anim, 0),
      createAnimation(dot2Anim, 200),
      createAnimation(dot3Anim, 400)
    ]).start();
  }, []);

  const animateDot = (animValue) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1]
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2]
        })
      }
    ]
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          animateDot(dot1Anim)
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          animateDot(dot2Anim)
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          animateDot(dot3Anim)
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    marginHorizontal: 4
  }
});

export default AnimatedLoadingDots;