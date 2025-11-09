import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '802079954139-l4euorsgks3tntc5pa20ej7t1ecnnmok.apps.googleusercontent.com', // <-- paste it here
      offlineAccess: true, // optional: set true if you need serverAuthCode
    });
  }, []);

  const handleSignUp = async () => {
    if (!agreedToTerms) {
      Alert.alert('Error', 'Please agree to Terms & Conditions');
      return;
    }
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await userCredential.user.updateProfile({ displayName: name });
      const userData = {
        name: name,
        email: userCredential.user.email,
        uid: userCredential.user.uid,
      };
      console.log('User created:', userData);
      if (navigation && navigation.onSignUpSuccess) {
        navigation.onSignUpSuccess(userData);
      }
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      // Sign in with Google
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();

      // Create Firebase credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in to Firebase with Google credential
      const userCredential = await auth().signInWithCredential(googleCredential);

      console.log('Google sign-in successful:', userCredential.user.displayName);
      Alert.alert('Welcome!', `Logged in as ${userCredential.user.displayName}`);
      // navigation.replace('Home');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', error.message);
    }
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

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Join LoanMate — Your trusted buddy for smarter loans.
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Text style={styles.inputIcon}>👤</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
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

          {/* Password */}
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
                <Text style={styles.eyeIcon}>👁</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password.."
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>👁</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
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

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, !agreedToTerms && styles.buttonDisabled]}
            onPress={handleSignUp}
            activeOpacity={0.8}
            disabled={!agreedToTerms}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign-In */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignUp}
              activeOpacity={0.8}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign In</Text>
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
    paddingTop: 30,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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
  signUpButton: {
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
  signUpButtonText: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  signInText: {
    color: '#999',
    fontSize: 14,
  },
  signInLink: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignUpScreen;