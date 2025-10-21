import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  icon,
  rightIcon,
  onRightIconPress,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <BlurView
        intensity={15}
        tint="dark"
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#78716C"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && styles.inputMultiline
          ]}
        />
        
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer}>
            <Text style={styles.rightIcon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </BlurView>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E7E5E4',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(41, 37, 36, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(120, 113, 108, 0.2)',
    paddingHorizontal: 16,
    minHeight: 52,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: 'rgba(245, 158, 11, 0.5)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  inputContainerError: {
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  inputContainerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#E7E5E4',
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    color: '#A8A29E',
  },
  rightIconContainer: {
    padding: 4,
  },
  rightIcon: {
    fontSize: 20,
    color: '#A8A29E',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});