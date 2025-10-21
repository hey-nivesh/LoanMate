import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export const ServiceCard = ({
  title,
  description,
  icon,
  onPress,
  gradient = ['#F59E0B', '#D97706'],
  style
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={styles.card}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Text style={styles.icon}>{icon}</Text>
          </LinearGradient>
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 8,
    minHeight: 160,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(41, 37, 36, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(120, 113, 108, 0.2)',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E7E5E4',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    color: '#A8A29E',
    textAlign: 'center',
    lineHeight: 16,
  },
});