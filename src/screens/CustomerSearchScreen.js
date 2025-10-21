import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomerSearchScreen = ({ visible, onClose, onCustomerFound }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);

  // Static users for testing
  const staticUsers = [
    {
      mobile: '9876543210',
      email: 'rajesh.kumar@email.com',
      customerId: '12345',
      name: 'Rajesh Kumar',
      creditScore: 780,
      kycVerified: true,
      preApprovedAmount: '3,00,000',
    },
    {
      mobile: '9876543211',
      email: 'priya.sharma@email.com',
      customerId: '12346',
      name: 'Priya Sharma',
      creditScore: 720,
      kycVerified: true,
      preApprovedAmount: '2,50,000',
    },
    {
      mobile: '9876543212',
      email: 'amit.verma@email.com',
      customerId: '12347',
      name: 'Amit Verma',
      creditScore: 650,
      kycVerified: false,
      preApprovedAmount: '1,50,000',
    },
    {
      mobile: '9876543213',
      email: 'sneha.patel@email.com',
      customerId: '12348',
      name: 'Sneha Patel',
      creditScore: 810,
      kycVerified: true,
      preApprovedAmount: '5,00,000',
    },
  ];

  const findCustomer = () => {
    if (!mobileNumber && !email && !customerId) {
      Alert.alert('Error', 'Please enter at least one identifier');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      let foundCustomer = null;

      if (mobileNumber) {
        foundCustomer = staticUsers.find(user => user.mobile === mobileNumber);
      } else if (email) {
        foundCustomer = staticUsers.find(user => user.email === email);
      } else if (customerId) {
        foundCustomer = staticUsers.find(user => user.customerId === customerId);
      }

      setLoading(false);

      if (foundCustomer) {
        setMobileNumber('');
        setEmail('');
        setCustomerId('');
        onCustomerFound(foundCustomer);
        onClose();
      } else {
        Alert.alert(
          'Not Found',
          'Customer not found. Please check your details.\n\nTest Users:\n• 9876543210\n• rajesh.kumar@email.com\n• 12345'
        );
      }
    }, 1000);
  };

  const clearFields = () => {
    setMobileNumber('');
    setEmail('');
    setCustomerId('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContent}>
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Find Your Profile</Text>
              <Text style={styles.formSubtitle}>
                Enter any one of the following details
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Mobile Number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={mobileNumber}
                  onChangeText={(text) => {
                    setMobileNumber(text);
                    setEmail('');
                    setCustomerId('');
                  }}
                  maxLength={10}
                />
              </View>

              <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setMobileNumber('');
                    setCustomerId('');
                  }}
                />
              </View>

              <View style={styles.orContainer}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Customer ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Customer ID"
                  placeholderTextColor="#9CA3AF"
                  value={customerId}
                  onChangeText={(text) => {
                    setCustomerId(text);
                    setMobileNumber('');
                    setEmail('');
                  }}
                />
              </View>

              <TouchableOpacity
                style={styles.findButton}
                onPress={findCustomer}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.findButtonText}>Find My Profile</Text>
                )}
              </TouchableOpacity>

              <View style={styles.helpContainer}>
                <Text style={styles.helpText}>New Customer?</Text>
                <TouchableOpacity>
                  <Text style={styles.helpLink}> Register Here</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.helpIcon}>
                <Text style={styles.helpIconText}>❓ Need Help?</Text>
              </TouchableOpacity>
            </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingVertical: 32,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  orText: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 16,
    fontWeight: '600',
  },
  findButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
  },
  helpLink: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
  helpIcon: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  helpIconText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '600',
  },
});

export default CustomerSearchScreen;