import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Alert,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');
const API_URL = 'https://loanmate-creditreport.onrender.com/api/generate-credit-report';

const CreditReportScreen = ({ navigation, route }) => {
  const { userData } = route.params || {};
  
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [creditData, setCreditData] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [animatedValue] = useState(new Animated.Value(0));

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    occupation: '',
    salary: '',
    currentEMI: '',
    existingLoans: '',
    creditCardOutstanding: '',
    defaultHistory: false,
    employment: 'employed',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const name = currentUser.displayName || userData?.name || '';
        const email = currentUser.email || userData?.email || '';
        setUserName(name);
        setUserEmail(email);
        setFormData(prev => ({ ...prev, name }));
      } else {
        setUserName(userData?.name || '');
        setUserEmail(userData?.email || '');
        setFormData(prev => ({ ...prev, name: userData?.name || '' }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.age || parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
      Alert.alert('Error', 'Please enter a valid age (18-100)');
      return false;
    }
    if (!formData.salary || parseInt(formData.salary) <= 0) {
      Alert.alert('Error', 'Please enter a valid monthly salary');
      return false;
    }
    if (!formData.currentEMI || parseInt(formData.currentEMI) < 0) {
      Alert.alert('Error', 'Please enter current EMI (enter 0 if none)');
      return false;
    }
    if (!formData.existingLoans || parseInt(formData.existingLoans) < 0) {
      Alert.alert('Error', 'Please enter number of existing loans (enter 0 if none)');
      return false;
    }
    if (!formData.creditCardOutstanding || parseInt(formData.creditCardOutstanding) < 0) {
      Alert.alert('Error', 'Please enter credit card outstanding (enter 0 if none)');
      return false;
    }
    return true;
  };

  const calculateCreditReport = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const requestData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        occupation: formData.occupation.trim() || 'Not Specified',
        salary: parseInt(formData.salary),
        currentEMI: parseInt(formData.currentEMI),
        existingLoans: parseInt(formData.existingLoans),
        defaultHistory: formData.defaultHistory,
        creditCardOutstanding: parseInt(formData.creditCardOutstanding),
        employment: formData.employment,
      };

      console.log('Sending request:', requestData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      
      if (data.success) {
        setCreditData(data);
        setShowForm(false);
        animateScore(data.creditStrength.score);
      } else {
        Alert.alert('Error', data.error || 'Failed to generate credit report');
      }
    } catch (error) {
      console.error('Error calculating credit report:', error);
      Alert.alert('Error', 'Unable to calculate credit report. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const animateScore = (score) => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  };

  const resetForm = () => {
    setShowForm(true);
    setCreditData(null);
    animatedValue.setValue(0);
  };

  const CreditScoreGauge = ({ score, rating }) => {
    const getColor = () => {
      if (score >= 80) return '#10b981';
      if (score >= 60) return '#3b82f6';
      if (score >= 40) return '#f59e0b';
      return '#ef4444';
    };

    const getGradientColors = () => {
      const colors = [];
      const segments = 12;
      for (let i = 0; i < segments; i++) {
        const segmentScore = (i / segments) * 100;
        if (segmentScore < 40) colors.push('#ef4444');
        else if (segmentScore < 60) colors.push('#f59e0b');
        else if (segmentScore < 80) colors.push('#3b82f6');
        else colors.push('#10b981');
      }
      return colors;
    };

    const gradientColors = getGradientColors();
    const totalSegments = 36;
    const filledSegments = Math.round((score / 100) * totalSegments * 0.75);

    return (
      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeCircle}>
          {Array.from({ length: totalSegments }).map((_, index) => {
            const angle = -135 + (index * 270) / totalSegments;
            const isFilled = index < filledSegments;
            const colorIndex = Math.floor((index / totalSegments) * gradientColors.length);
            
            return (
              <View
                key={index}
                style={[
                  styles.gaugeSegment,
                  {
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateX: 85 },
                    ],
                    backgroundColor: isFilled ? gradientColors[colorIndex] : '#e5e7eb',
                    opacity: isFilled ? 1 : 0.3,
                  },
                ]}
              />
            );
          })}
          
          <View style={styles.gaugeCenterCircle}>
            <Animated.Text style={styles.scoreText}>
              {animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0', `${Math.round(score)}`],
              })}
            </Animated.Text>
          </View>
        </View>
        
        <View style={[styles.ratingBadge, { backgroundColor: getColor() }]}>
          <Text style={styles.ratingText}>↑ {rating}</Text>
        </View>
      </View>
    );
  };

  const InfoCard = ({ label, value, status, statusColor }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoValue}>{value}</Text>
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (showForm) {
    return (
      <SafeAreaView style={styles.containerLight} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        <View style={styles.headerLight}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backIconLight}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleLight}>Credit Report Calculator</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.formScrollContent}>
            
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Enter Your Financial Details</Text>
              <Text style={styles.formSubtitle}>
                We'll calculate your credit score based on this information
              </Text>

              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#9ca3af"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              </View>

              {/* Age */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your age"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                />
              </View>

              {/* Occupation */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Occupation</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Software Developer"
                  placeholderTextColor="#9ca3af"
                  value={formData.occupation}
                  onChangeText={(value) => handleInputChange('occupation', value)}
                />
              </View>

              {/* Monthly Salary */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monthly Salary (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter monthly salary"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={formData.salary}
                  onChangeText={(value) => handleInputChange('salary', value)}
                />
              </View>

              {/* Current EMI */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Monthly EMI (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter total monthly EMI (0 if none)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={formData.currentEMI}
                  onChangeText={(value) => handleInputChange('currentEMI', value)}
                />
              </View>

              {/* Existing Loans */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Number of Existing Loans *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter number of loans (0 if none)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={formData.existingLoans}
                  onChangeText={(value) => handleInputChange('existingLoans', value)}
                />
              </View>

              {/* Credit Card Outstanding */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Credit Card Outstanding (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter outstanding amount (0 if none)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={formData.creditCardOutstanding}
                  onChangeText={(value) => handleInputChange('creditCardOutstanding', value)}
                />
              </View>

              {/* Default History */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Default History</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleInputChange('defaultHistory', false)}>
                    <View style={[
                      styles.radio,
                      !formData.defaultHistory && styles.radioSelected
                    ]}>
                      {!formData.defaultHistory && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>No Default</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleInputChange('defaultHistory', true)}>
                    <View style={[
                      styles.radio,
                      formData.defaultHistory && styles.radioSelected
                    ]}>
                      {formData.defaultHistory && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Have Defaults</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Employment Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Employment Status</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleInputChange('employment', 'employed')}>
                    <View style={[
                      styles.radio,
                      formData.employment === 'employed' && styles.radioSelected
                    ]}>
                      {formData.employment === 'employed' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Employed</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => handleInputChange('employment', 'self-employed')}>
                    <View style={[
                      styles.radio,
                      formData.employment === 'self-employed' && styles.radioSelected
                    ]}>
                      {formData.employment === 'self-employed' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioLabel}>Self-Employed</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Calculate Button */}
              <TouchableOpacity 
                style={[styles.calculateButton, loading && styles.calculateButtonDisabled]}
                onPress={calculateCreditReport}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.calculateButtonText}>
                    📊 Calculate Credit Report
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Report View
  const { creditStrength, debtAnalysis, riskFactors, loanEligibility } = creditData;

  return (
    <SafeAreaView style={styles.containerLight} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.headerLight}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIconLight}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitleLight}>Credit Report</Text>
        <TouchableOpacity onPress={resetForm}>
          <Text style={styles.editButton}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.greetingContainerLight}>
          <Text style={styles.greetingTextLight}>Hello, {formData.name}</Text>
          <Text style={styles.subGreetingTextLight}>
            Here is your credit report 😊
          </Text>
        </View>

        <CreditScoreGauge 
          score={creditStrength.score} 
          rating={creditStrength.rating}
        />

        {/* Unified Credit Report Card */}
        <View style={styles.unifiedReportCard}>
          <Text style={styles.reportCardTitle}>Credit Report Summary</Text>
          
          {/* Payment History */}
          <View style={styles.reportRow}>
            <View style={styles.reportRowLeft}>
              <Text style={styles.reportLabel}>Payment History</Text>
              <View style={styles.reportValueContainer}>
                <Text style={styles.reportValue}>
                  {riskFactors.defaultHistory ? '85%' : '100%'}
                </Text>
                <View style={[
                  styles.reportStatusBadge,
                  { backgroundColor: riskFactors.defaultHistory ? '#fee2e2' : '#d1fae5' }
                ]}>
                  <Text style={[
                    styles.reportStatusText,
                    { color: riskFactors.defaultHistory ? '#ef4444' : '#059669' }
                  ]}>
                    {riskFactors.defaultHistory ? 'Late payment' : 'Very good'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.reportDivider} />

          {/* Credit Card Use */}
          <View style={styles.reportRow}>
            <View style={styles.reportRowLeft}>
              <Text style={styles.reportLabel}>Credit Card Use</Text>
              <View style={styles.reportValueContainer}>
                <Text style={styles.reportValue}>
                  {riskFactors.creditCardUtilization.toFixed(1)}%
                </Text>
                <View style={[
                  styles.reportStatusBadge,
                  { backgroundColor: riskFactors.creditCardUtilization < 30 ? '#d1fae5' : '#fef3c7' }
                ]}>
                  <Text style={[
                    styles.reportStatusText,
                    { color: riskFactors.creditCardUtilization < 30 ? '#059669' : '#d97706' }
                  ]}>
                    {riskFactors.creditCardUtilization < 30 ? 'Very good' : 'High'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.reportDivider} />

          {/* Total Accounts */}
          <View style={styles.reportRow}>
            <View style={styles.reportRowLeft}>
              <Text style={styles.reportLabel}>Total Accounts</Text>
              <View style={styles.reportValueContainer}>
                <Text style={styles.reportValue}>{riskFactors.existingLoans}+</Text>
                <View style={[
                  styles.reportStatusBadge,
                  { backgroundColor: riskFactors.existingLoans > 3 ? '#fee2e2' : '#d1fae5' }
                ]}>
                  <Text style={[
                    styles.reportStatusText,
                    { color: riskFactors.existingLoans > 3 ? '#ef4444' : '#059669' }
                  ]}>
                    {riskFactors.existingLoans > 3 ? 'Too many' : 'Good mix'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.reportDivider} />

          {/* Debt-to-Income Ratio */}
          <View style={styles.reportRow}>
            <View style={styles.reportRowLeft}>
              <Text style={styles.reportLabel}>Debt-to-Income Ratio</Text>
              <View style={styles.reportValueContainer}>
                <Text style={styles.reportValue}>{debtAnalysis.dtiRatio}%</Text>
                <View style={[
                  styles.reportStatusBadge,
                  { 
                    backgroundColor: debtAnalysis.dtiRatio < 30 
                      ? '#d1fae5' 
                      : debtAnalysis.dtiRatio < 40 
                      ? '#fef3c7' 
                      : '#fee2e2' 
                  }
                ]}>
                  <Text style={[
                    styles.reportStatusText,
                    { 
                      color: debtAnalysis.dtiRatio < 30 
                        ? '#059669' 
                        : debtAnalysis.dtiRatio < 40 
                        ? '#d97706' 
                        : '#ef4444' 
                    }
                  ]}>
                    {debtAnalysis.dtiStatus}
                  </Text>
                </View>
              </View>
              <Text style={styles.reportSubtext}>
                Current EMI: ₹{debtAnalysis.totalCurrentEMI.toLocaleString('en-IN')} • Safe Limit: ₹{debtAnalysis.safeEMILimit.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.reportDivider} />

          {/* Loan Eligibility */}
          <View style={[styles.reportRow, styles.loanEligibilityRow]}>
            <View style={styles.reportRowLeft}>
              <Text style={styles.reportLabel}>💰 Loan Eligibility</Text>
              <Text style={styles.loanAmountUnified}>
                ₹{loanEligibility.minAmount.toLocaleString('en-IN')} - ₹{loanEligibility.maxAmount.toLocaleString('en-IN')}
              </Text>
              <View style={styles.loanDetailsRow}>
                <Text style={styles.loanDetailText}>
                  Tenure: {loanEligibility.recommendedTenure}
                </Text>
                <Text style={styles.loanDetailText}>•</Text>
                <Text style={styles.loanDetailText}>
                  Max EMI: ₹{loanEligibility.availableEMI.toLocaleString('en-IN')}/mo
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.recalculateButton}
          onPress={resetForm}>
          <Text style={styles.recalculateButtonText}>
            🔄 Recalculate with New Data
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containerLight: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerLight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIconLight: {
    fontSize: 28,
    color: '#111827',
  },
  headerTitleLight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  editButton: {
    fontSize: 20,
    padding: 10,
  },
  formScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#3b82f6',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
  },
  calculateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  calculateButtonDisabled: {
    opacity: 0.6,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  greetingContainerLight: {
    marginBottom: 24,
  },
  greetingTextLight: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subGreetingTextLight: {
    fontSize: 16,
    color: '#6b7280',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  gaugeCircle: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gaugeSegment: {
    position: 'absolute',
    width: 4,
    height: 20,
    borderRadius: 2,
    top: '50%',
    left: '50%',
    marginLeft: -2,
    marginTop: -10,
  },
  gaugeCenterCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreText: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#111827',
  },
  ratingBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  unifiedReportCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  reportCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  reportRow: {
    paddingVertical: 16,
  },
  reportRowLeft: {
    flex: 1,
  },
  reportLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  reportValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  reportStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 16,
  },
  reportDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  loanEligibilityRow: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: -20,
    marginBottom: -20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  loanAmountUnified: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
    marginBottom: 8,
  },
  loanDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  loanDetailText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  recalculateButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  recalculateButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreditReportScreen;