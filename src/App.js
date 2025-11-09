import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SplashScreen from './screens/SplashScreen'
import LoginScreen from './screens/LoginScreen'
import SignUpScreen from './screens/SignUpScreen'
import Home from './screens/Home'
import KYCStatusScreen from './screens/KYCStatusScreen'
import KYCVerificationScreen from './screens/KYCVerificationScreen'
import DocumentUploadDashboard from './screens/upload_doc/DocumentUploadDashboard'
import DocumentPickerScreen from './screens/upload_doc/DocumentPickerScreen'
import CreditReportScreen from './screens/CreditReportScreen'

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentScreen, setCurrentScreen] = useState('Login')
  const [screenParams, setScreenParams] = useState({})

  useEffect(() => {
    // Simulate app initialization/loading work
    const timer = setTimeout(() => setIsAppReady(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Show login screen after splash
    if (isAppReady && !isAuthenticated) {
      setCurrentScreen('Login')
    }
  }, [isAppReady, isAuthenticated])

  const handleLogin = (userData) => {
    // Handle successful login
    console.log('=== HANDLE LOGIN CALLED ===');
    console.log('User logged in:', userData);
    console.log('Setting isAuthenticated to true');
    setIsAuthenticated(true)
    console.log('Redirecting to Home...');
    setCurrentScreen('Home')
    // After authentication, redirect directly to Home
  }

  const handleSignUp = (userData) => {
    // Handle successful signup
    console.log('=== HANDLE SIGNUP CALLED ===');
    console.log('User signed up:', userData);
    console.log('Setting isAuthenticated to true');
    setIsAuthenticated(true)
    console.log('Redirecting to Home...');
    setCurrentScreen('Home')
    // After authentication, redirect directly to Home
  }

  const navigation = {
    navigate: (screenName, params = {}) => {
      setCurrentScreen(screenName)
      setScreenParams(params)
    },
    goBack: () => {
      // Determine where to go back based on current screen
      if (['Login', 'SignUp'].includes(currentScreen)) {
        setCurrentScreen('Login')
      } else {
        setCurrentScreen('Home')
      }
      setScreenParams({})
    },
    // Add a method to handle logout if needed
    logout: () => {
      setIsAuthenticated(false)
      setCurrentScreen('Login')
      setScreenParams({})
    },
    // Add callbacks for auth
    onLoginSuccess: handleLogin,
    onSignUpSuccess: handleSignUp
  }

  if (!isAppReady) {
    // Show splash screen while app is initializing
    return <SplashScreen navigation={{ replace: () => {} }} />
  }

  const renderCurrentScreen = () => {
    // If not authenticated, show auth screens
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'SignUp':
          return (
            <SignUpScreen 
              navigation={navigation}
            />
          )
        case 'Login':
        default:
          return (
            <LoginScreen 
              navigation={navigation}
            />
          )
      }
    }

    // If authenticated, show main app screens
    switch (currentScreen) {
      case 'KYCStatus':
        return (
          <KYCStatusScreen 
            navigation={navigation} 
            route={{ params: screenParams }} 
          />
        )
      case 'DocumentPicker':
        return (
          <DocumentPickerScreen
            navigation={navigation}
            route={{ params: screenParams }}
          />
        )
      case 'DocumentUpload':
        return (
          <DocumentUploadDashboard 
            navigation={navigation} 
            route={{ params: screenParams }} 
          />
        )
      case 'KYCVerification':
        return (
          <KYCVerificationScreen 
            navigation={navigation} 
            route={{ params: screenParams }} 
          />
        )
      case 'CreditReport':
        return (
          <CreditReportScreen 
            navigation={navigation} 
            route={{ params: screenParams }} 
          />
        )
      case 'Home':
      default:
        return (
          <Home 
            navigation={navigation} 
            route={{ params: {} }} 
          />
        )
    }
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {renderCurrentScreen()}
      </View>
    </SafeAreaProvider>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})