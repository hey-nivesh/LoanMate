// src/screens/SplashScreen.js (Enhanced Version with Lottie)

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Text
} from 'react-native';  
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedLoadingDots from '../components/common/AnimatedLoadingDots';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Start all animations
    startAnimations();

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Navigate after completion
    const timer = setTimeout(() => {
      navigation.replace('CustomerSearch');
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, []);

  const startAnimations = () => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2800,
      useNativeDriver: false
    }).start();

    // Continuous rotation for decorative element
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true
      })
    ).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1E40AF"
        translucent={false}
      />

      {/* Animated background */}
      <View style={styles.backgroundContainer}>
        {/* Gradient overlay */}
        <View style={styles.gradientOverlay} />

        {/* Rotating decorative ring */}
        <Animated.View
          style={[
            styles.decorativeRing,
            { transform: [{ rotate: spin }] }
          ]}
        >
          <View style={styles.ring} />
        </Animated.View>
      </View>

      {/* Main content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideUpAnim }
            ]
          }
        ]}
      >
        {/* Logo container with glow */}
        <View style={styles.logoWrapper}>
          {/* Outer glow rings */}
          <View style={[styles.glowRing, styles.glowRing1]} />
          <View style={[styles.glowRing, styles.glowRing2]} />
          <View style={[styles.glowRing, styles.glowRing3]} />

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/loanmate_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* App name with gradient effect */}
        <Text style={styles.appName}>LoanMate</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Quick Loan Application</Text>

        {/* Version info */}
        <Text style={styles.version}>v1.0.0</Text>
      </Animated.View>

      {/* Loading section */}
      <Animated.View
        style={[
          styles.loadingSection,
          { opacity: fadeAnim }
        ]}
      >
        {/* Loading text */}
        <Text style={styles.loadingText}>Loading your experience</Text>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth }
              ]}
            >
              {/* Shimmer effect */}
              <View style={styles.shimmer} />
            </Animated.View>
          </View>

          {/* Progress percentage */}
          <Text style={styles.progressText}>{loadingProgress}%</Text>
        </View>

        {/* Animated dots */}
        <AnimatedLoadingDots
          color="rgba(255, 255, 255, 0.8)"
          size={10}
        />
      </Animated.View>

      {/* Floating particles */}
      <View style={styles.particlesContainer}>
        <View style={[styles.particle, styles.particle1]} />
        <View style={[styles.particle, styles.particle2]} />
        <View style={[styles.particle, styles.particle3]} />
        <View style={[styles.particle, styles.particle4]} />
      </View>

      {/* Bottom branding */}
      <Animated.View
        style={[
          styles.brandingContainer,
          { opacity: fadeAnim }
        ]}
      >
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
    justifyContent: 'space-between'
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden'
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 32, 87, 0.3)'
  },
  decorativeRing: {
    position: 'absolute',
    top: height * 0.15,
    left: width / 2 - 150,
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center'
  },
  ring: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100
  },
  logoWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  glowRing1: {
    width: 220,
    height: 220
  },
  glowRing2: {
    width: 180,
    height: 180
  },
  glowRing3: {
    width: 140,
    height: 140
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },
  logo: {
    width: 120,
    height: 120
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 3,
    textShadowColor: 'rgba(16, 185, 129, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    letterSpacing: 1.5,
    marginBottom: 8
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8
  },
  loadingSection: {
    width: '100%',
    paddingHorizontal: 40,
    paddingBottom: 120,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: 0.5
  },
  progressContainer: {
    width: '100%',
    marginBottom: 25
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }]
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontWeight: '600'
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none'
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  particle1: {
    top: '20%',
    left: '10%',
    width: 6,
    height: 6,
    borderRadius: 3
  },
  particle2: {
    top: '40%',
    right: '15%',
    width: 8,
    height: 8,
    borderRadius: 4
  },
  particle3: {
    top: '60%',
    left: '20%'
  },
  particle4: {
    top: '80%',
    right: '25%',
    width: 5,
    height: 5,
    borderRadius: 2.5
  },
  brandingContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center'
  },
  brandingText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4
  },
  brandingName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1
  }
});

export default SplashScreen;