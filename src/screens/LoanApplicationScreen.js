import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://loanmate-database.onrender.com/api';

const LoanApplicationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    monthlySalary: '',
    existingLoans: '',
    totalEMI: '',
    loanAmountRequested: '',
    employmentType: 'Salaried',
    loanPurpose: '',
    tenureMonths: '12',
  });

  const [selectedLTV, setSelectedLTV] = useState(90);
  const [loading, setLoading] = useState(false);

  // Test API connection on mount
  React.useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/test`);
        const data = await response.json();
        console.log('✅ API Connection:', data);
      } catch (error) {
        console.error('❌ API Connection Failed:', error);
      }
    };
    testAPI();
  }, []);

  const ltvOptions = [90, 70, 50];
  const employmentTypes = ['Salaried', 'Self-Employed', 'Business'];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateLoanDetails = () => {
    const amount = parseFloat(formData.loanAmountRequested) || 0;
    const tenure = parseInt(formData.tenureMonths) || 12;
    const apr = 24;
    
    const monthlyRate = apr / 100 / 12;
    const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    return {
      amount: amount.toFixed(2),
      apr: apr,
      emi: emi.toFixed(2),
      tenure: tenure
    };
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || 
        !formData.monthlySalary || !formData.loanAmountRequested) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (formData.phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/apply-loan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          monthlySalary: parseFloat(formData.monthlySalary),
          existingLoans: parseFloat(formData.existingLoans) || 0,
          totalEMI: parseFloat(formData.totalEMI) || 0,
          loanAmountRequested: parseFloat(formData.loanAmountRequested),
          tenureMonths: parseInt(formData.tenureMonths),
          ltvPercentage: selectedLTV,
          creditScore: 750,
          eligibility: 'Approved',
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          'Success',
          'Your loan application has been submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to submit application');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Loan application error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loanDetails = calculateLoanDetails();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Get Loan</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => updateField('fullName', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              keyboardType="phone-pad"
              maxLength={10}
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Employment Type</Text>
            <View style={styles.chipContainer}>
              {employmentTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.chip,
                    formData.employmentType === type && styles.chipSelected
                  ]}
                  onPress={() => updateField('employmentType', type)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.employmentType === type && styles.chipTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Monthly Salary *</Text>
            <TextInput
              style={styles.input}
              placeholder="₹ Enter amount"
              keyboardType="numeric"
              value={formData.monthlySalary}
              onChangeText={(text) => updateField('monthlySalary', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Existing Loans (if any)</Text>
            <TextInput
              style={styles.input}
              placeholder="₹ 0"
              keyboardType="numeric"
              value={formData.existingLoans}
              onChangeText={(text) => updateField('existingLoans', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Total Monthly EMI</Text>
            <TextInput
              style={styles.input}
              placeholder="₹ 0"
              keyboardType="numeric"
              value={formData.totalEMI}
              onChangeText={(text) => updateField('totalEMI', text)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Loan Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="₹ Enter amount"
              keyboardType="numeric"
              value={formData.loanAmountRequested}
              onChangeText={(text) => updateField('loanAmountRequested', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Loan Purpose</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Education, Medical, Business"
              value={formData.loanPurpose}
              onChangeText={(text) => updateField('loanPurpose', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tenure (Months)</Text>
            <TextInput
              style={styles.input}
              placeholder="12"
              keyboardType="numeric"
              value={formData.tenureMonths}
              onChangeText={(text) => updateField('tenureMonths', text)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loan to Value (LTV)</Text>
          <Text style={styles.sectionDescription}>
            Percentage of your collateral value that you can borrow.
          </Text>
          
          <View style={styles.ltvContainer}>
            {ltvOptions.map((ltv) => (
              <TouchableOpacity
                key={ltv}
                style={[
                  styles.ltvButton,
                  selectedLTV === ltv && styles.ltvButtonSelected
                ]}
                onPress={() => setSelectedLTV(ltv)}
              >
                <Text style={[
                  styles.ltvText,
                  selectedLTV === ltv && styles.ltvTextSelected
                ]}>
                  {ltv}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {formData.loanAmountRequested && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryAmount}>₹{loanDetails.amount}</Text>
              <View style={styles.aprBadge}>
                <Text style={styles.aprText}>{loanDetails.apr}% APR</Text>
              </View>
            </View>
            
            <Text style={styles.summaryDescription}>
              Borrowed amount must be repaid in {loanDetails.tenure} months
            </Text>

            <View style={styles.emiInfo}>
              <Text style={styles.emiLabel}>Estimated Monthly EMI:</Text>
              <Text style={styles.emiAmount}>₹{loanDetails.emi}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Get Loan</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          By clicking Get Loan, I expressly agree to the Terms of Service
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1e3a8a',
  },
  backButton: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  chipTextSelected: {
    color: '#fff',
  },
  ltvContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  ltvButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  ltvButtonSelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  ltvText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748b',
  },
  ltvTextSelected: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 24,
    borderRadius: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  aprBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aprText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  summaryDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 16,
  },
  emiInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  emiLabel: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  emiAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  terms: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 40,
    lineHeight: 18,
  },
});

export default LoanApplicationScreen;