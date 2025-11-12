import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ProfileScreen from './screens/ProfileScreen';
import Home from './screens/Home';
import KYCStatusScreen from './screens/KYCStatusScreen';
import KYCVerificationScreen from './screens/KYCVerificationScreen';
import DocumentUploadDashboard from './screens/upload_doc/DocumentUploadDashboard';
import DocumentPickerScreen from './screens/upload_doc/DocumentPickerScreen';
import CreditReportScreen from './screens/CreditReportScreen';

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [screenParams, setScreenParams] = useState({});

  // --- 1️⃣ Splash delay (simulated loading) ---
  useEffect(() => {
    const timer = setTimeout(() => setIsAppReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  // --- 2️⃣ Firebase listener for persistent login ---
  useEffect(() => {
    if (!isAppReady) return; // Wait for splash to complete

    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        console.log('✅ User already logged in:', user.email);
        const userInfo = {
          name: user.displayName || 'User',
          email: user.email,
          uid: user.uid,
        };
        setIsAuthenticated(true);
        setUserData(userInfo);
        setCurrentScreen('Home');
        setScreenParams(userInfo);
      } else {
        console.log('🔒 No user session found');
        setIsAuthenticated(false);
        setUserData(null);
        setCurrentScreen('Login');
      }
    });

    return unsubscribe; // Clean up listener
  }, [isAppReady]);

  // --- 3️⃣ Handle successful login/signup ---
  const handleLogin = user => {
    console.log('=== HANDLE LOGIN CALLED ===');
    console.log('User logged in:', user);
    setIsAuthenticated(true);
    setUserData(user);
    setCurrentScreen('Home');
    setScreenParams(user);
  };

  const handleSignUp = user => {
    console.log('=== HANDLE SIGNUP CALLED ===');
    console.log('User signed up:', user);
    setIsAuthenticated(true);
    setUserData(user);
    setCurrentScreen('Home');
    setScreenParams(user);
  };

  // --- 4️⃣ Navigation object for manual screen control ---
  const navigation = {
    navigate: (screenName, params = {}) => {
      setCurrentScreen(screenName);
      setScreenParams(params);
    },
    goBack: () => {
      if (['Login', 'SignUp'].includes(currentScreen)) {
        setCurrentScreen('Login');
      } else {
        setCurrentScreen('Home');
      }
      setScreenParams({});
    },
    logout: async () => {
      try {
        await auth().signOut();
        console.log('🚪 User logged out successfully');
      } catch (error) {
        console.error('Logout error:', error);
      }
      setIsAuthenticated(false);
      setUserData(null);
      setCurrentScreen('Login');
      setScreenParams({});
    },
    onLoginSuccess: handleLogin,
    onSignUpSuccess: handleSignUp,
    // Add userData to navigation object so it's accessible in all screens
    userData: userData,
  };

  // --- 5️⃣ Splash state handling ---
  if (!isAppReady) {
    return <SplashScreen navigation={{ replace: () => {} }} />;
  }

  // --- 6️⃣ Main screen rendering logic ---
  const renderCurrentScreen = () => {
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'SignUp':
          return <SignUpScreen navigation={navigation} />;
        case 'Login':
        default:
          return <LoginScreen navigation={navigation} />;
      }
    }

    switch (currentScreen) {
      case 'Profile':
        return (
          <ProfileScreen
            navigation={navigation}
            route={{ params: { userData, ...screenParams } }}
          />
        );
      case 'KYCStatus':
        return (
          <KYCStatusScreen
            navigation={navigation}
            route={{ params: screenParams }}
          />
        );
      case 'DocumentPicker':
        return (
          <DocumentPickerScreen
            navigation={navigation}
            route={{ params: screenParams }}
          />
        );
      case 'DocumentUpload':
        return (
          <DocumentUploadDashboard
            navigation={navigation}
            route={{ params: screenParams }}
          />
        );
      case 'KYCVerification':
        return (
          <KYCVerificationScreen
            navigation={navigation}
            route={{ params: screenParams }}
          />
        );
      case 'CreditReport':
        return (
          <CreditReportScreen
            navigation={navigation}
            route={{ params: screenParams }}
          />
        );
      case 'Home':
      default:
        return (
          <Home
            navigation={navigation}
            route={{ params: screenParams }}
          />
        );
    }
  };

  // --- 7️⃣ Render final output ---
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {isAppReady ? renderCurrentScreen() : (
          <View style={styles.loadingScreen}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});