import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export const StatusBadge = ({ 
  status, // verified, pending, rejected, active
  label,
  size = 'medium', // small, medium, large
  style
}) => {
  const getStatusConfig = () => {
    const configs = {
      verified: {
        bgColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        textColor: '#10B981',
        icon: '✓',
      },
      pending: {
        bgColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 0.4)',
        textColor: '#F59E0B',
        icon: '⏳',
      },
      rejected: {
        bgColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.4)',
        textColor: '#EF4444',
        icon: '✗',
      },
      active: {
        bgColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 0.4)',
        textColor: '#3B82F6',
        icon: '●',
      },
    };
    
    return configs[status] || configs.pending;
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, styles[`container_${size}`], style]}>
      <BlurView
        intensity={15}
        tint="dark"
        style={[
          styles.badge,
          { 
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
          }
        ]}
      >
        <Text style={[styles.icon, styles[`icon_${size}`], { color: config.textColor }]}>
          {config.icon}
        </Text>
        <Text style={[styles.text, styles[`text_${size}`], { color: config.textColor }]}>
          {label || status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  container_small: {
    height: 24,
  },
  container_medium: {
    height: 32,
  },
  container_large: {
    height: 40,
  },
  badge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  icon: {
    marginRight: 6,
  },
  icon_small: {
    fontSize: 10,
  },
  icon_medium: {
    fontSize: 12,
  },
  icon_large: {
    fontSize: 14,
  },
  text: {
    fontWeight: '600',
  },
  text_small: {
    fontSize: 11,
  },
  text_medium: {
    fontSize: 13,
  },
  text_large: {
    fontSize: 15,
  },
});