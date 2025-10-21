import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

export const Card = ({ 
  children, 
  style, 
  onPress,
  variant = 'default', // default, elevated, flat
  blurIntensity = 20
}) => {
  const cardContent = (
    <BlurView
      intensity={blurIntensity}
      tint="dark"
      style={[
        styles.card,
        styles[`card_${variant}`],
        style
      ]}
    >
      <View style={styles.cardInner}>
        {children}
      </View>
    </BlurView>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(41, 37, 36, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(120, 113, 108, 0.2)',
  },
  card_default: {
    // Default card style
  },
  card_elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card_flat: {
    borderWidth: 0,
    backgroundColor: 'rgba(41, 37, 36, 0.4)',
  },
  cardInner: {
    padding: 20,
  },
});