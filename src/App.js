import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import SplashScreen from './screens/SplashScreen'
import Home from './screens/Home'
import CustomerSearchScreen from './screens/CustomerSearchScreen'

const App = () => {
  const [isAppReady, setIsAppReady] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [customerData, setCustomerData] = useState(null)

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

  if (!isAppReady) {
    // Provide a minimal navigation stub so SplashScreen doesn't error
    return <SplashScreen navigation={{ replace: () => {} }} />
  }

  return (
    <View style={styles.container}>
      <Home 
        navigation={{}} 
        route={{ params: { customerId: customerData?.customerId } }} 
        customerData={customerData}
      />
      
      <CustomerSearchScreen
        visible={showCustomerSearch}
        onClose={handleCloseSearch}
        onCustomerFound={handleCustomerFound}
      />
    </View>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})