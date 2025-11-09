import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignIn = async () => {
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to Terms & Conditions');
      return;
    }
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      const userData = {
        name: user.displayName || 'User',
        email: user.email,
        uid: user.uid,
      };
      console.log('Login success:', userData);
      if (navigation && navigation.onLoginSuccess) {
        navigation.onLoginSuccess(userData);
      }
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google sign in');
    // Add actual Google OAuth if enabled
  };

  const handleFacebookSignIn = () => {
    console.log('Facebook sign in');
    // Add Facebook OAuth if enabled
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1f1f" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Logo / Tagline */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/loanmate_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Your one on one loan buddy</Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Text style={styles.inputIcon}>✉</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="you@email.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter password.."
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms and Conditions */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}>
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, !agreedToTerms && styles.buttonDisabled]}
            onPress={handleSignIn}
            activeOpacity={0.8}
            disabled={!agreedToTerms}>
            <Text style={styles.signInButtonText}>Sign in</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleFacebookSignIn}
              activeOpacity={0.8}>
              <Text style={styles.facebookIcon}>f</Text>
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? Go to </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a1f1f',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#10b981',
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0a1f1f',
    letterSpacing: 2,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 12,
  },
  tagline: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2f2f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a4f4f',
    paddingHorizontal: 14,
    height: 54,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIcon: {
    fontSize: 18,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
    opacity: 0.7,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2a4f4f',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    color: '#ccc',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  linkText: {
    color: '#10b981',
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signInButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2a4f4f',
  },
  dividerText: {
    color: '#999',
    fontSize: 13,
    marginHorizontal: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2f2f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a4f4f',
    paddingHorizontal: 20,
    paddingVertical: 14,
    flex: 1,
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    marginRight: 8,
    fontWeight: 'bold',
    color: '#fff',
  },
  facebookIcon: {
    fontSize: 20,
    marginRight: 8,
    fontWeight: 'bold',
    color: '#4267B2',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signUpText: {
    color: '#999',
    fontSize: 14,
  },
  signUpLink: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;