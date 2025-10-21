import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', // primary, secondary, ghost
  size = 'medium', // small, medium, large
  loading = false,
  disabled = false,
  icon = null,
  style
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${size}`]];
    
    if (disabled || loading) {
      return [...baseStyle, styles.buttonDisabled, style];
    }
    
    if (variant === 'ghost') {
      return [...baseStyle, styles.buttonGhost, style];
    }
    
    return [...baseStyle, style];
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#F59E0B' : '#1C1917'} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={[
            styles.buttonText,
            styles[`buttonText_${size}`],
            variant === 'ghost' && styles.buttonTextGhost,
            (disabled || loading) && styles.buttonTextDisabled
          ]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={getButtonStyle()}
      >
        <LinearGradient
          colors={['#F59E0B', '#D97706', '#B45309']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={getButtonStyle()}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  button_small: {
    height: 40,
  },
  button_medium: {
    height: 52,
  },
  button_large: {
    height: 60,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonGhost: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
    color: '#1C1917',
  },
  buttonText_small: {
    fontSize: 14,
  },
  buttonText_medium: {
    fontSize: 16,
  },
  buttonText_large: {
    fontSize: 18,
  },
  buttonTextGhost: {
    color: '#F59E0B',
  },
  buttonTextDisabled: {
    color: '#78716C',
  },
  icon: {
    marginRight: 8,
    fontSize: 20,
  },
});