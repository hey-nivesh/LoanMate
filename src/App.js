import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SplashScreen from './screens/SplashScreen'
import Home from './screens/Home'
import CustomerSearchScreen from './screens/CustomerSearchScreen'
import KYCStatusScreen from './screens/KYCStatusScreen'
import KYCVerificationScreen from './screens/KYCVerificationScreen'
import DocumentUploadDashboard from './screens/upload_doc/DocumentUploadDashboard'
import DocumentPickerScreen from './screens/upload_doc/DocumentPickerScreen'
import CreditReportScreen from './screens/CreditReportScreen'

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerData, setCustomerData] = useState(null)
  const [currentScreen, setCurrentScreen] = useState('Home')
  const [screenParams, setScreenParams] = useState({})

  useEffect(() => {
    // Simulate app initialization/loading work
    const timer = setTimeout(() => setIsAppReady(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Show customer search after app is ready
    if (isAppReady) {
      setShowCustomerSearch(true)
    }
  }, [isAppReady])

  const handleCustomerFound = (customer) => {
    setCustomerData(customer)
    setShowCustomerSearch(false)
  }

  const handleCloseSearch = () => {
    setShowCustomerSearch(false)
  }

  const navigation = {
    navigate: (screenName, params = {}) => {
      setCurrentScreen(screenName)
      setScreenParams(params)
    },
    goBack: () => {
      setCurrentScreen('Home')
      setScreenParams({})
    }
  }

  if (!isAppReady) {
    // Provide a minimal navigation stub so SplashScreen doesn't error
    return <SplashScreen navigation={{ replace: () => {} }} />
  }

  const renderCurrentScreen = () => {
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
            route={{ params: { customerId: customerData?.customerId } }} 
            customerData={customerData}
          />
        )
    }
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {renderCurrentScreen()}
        
        <CustomerSearchScreen
          visible={showCustomerSearch}
          onClose={handleCloseSearch}
          onCustomerFound={handleCustomerFound}
        />
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