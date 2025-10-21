import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';

const Home = ({ navigation, route }) => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route?.params?.customerId) {
      fetchCustomerData(route.params.customerId);
    }
  }, [route?.params?.customerId]);

  const fetchCustomerData = async (customerId) => {
    setLoading(true);
    try {
      // Replace with actual API call
      setTimeout(() => {
        setCustomerData({
          name: 'Rajesh Kumar',
          customerId: '#12345',
          creditScore: 780,
          kycVerified: false,
          preApprovedAmount: '3,00,000',
          recentActivity: [
            { text: 'Salary slip uploaded', time: '2h ago' },
            { text: 'KYC verified', time: '1 day ago' },
            { text: 'Credit report fetched', time: '3d ago' },
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      setLoading(false);
    }
  };

  const ServiceCard = ({ icon, title, description, onPress }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceIcon}>{icon}</Text>
      <Text style={styles.serviceTitle}>{title}</Text>
      <Text style={styles.serviceDescription}>{description}</Text>
      <TouchableOpacity style={styles.serviceButton} onPress={onPress}>
        <Text style={styles.serviceButtonText}>Open →</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>
            {customerData?.name?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.headerTitle}>LoanMate</Text>
        <TouchableOpacity style={styles.menuIcon}>
          <Text style={styles.menuIconText}>≡</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Welcome, {customerData?.name || 'User'}
          </Text>
          <Text style={styles.customerIdText}>
            Customer ID: {customerData?.customerId || 'N/A'}
          </Text>
        </View>

        <View style={styles.quickStatsCard}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Credit Score:</Text>
            <Text style={styles.statValue}>{customerData?.creditScore || '---'}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>KYC Status:</Text>
            <Text style={customerData?.kycVerified ? styles.statValueSuccess : styles.statValuePending}>
              {customerData?.kycVerified ? '✅ Verified' : '⏳ Pending'}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Pre-approved:</Text>
            <Text style={styles.statValue}>
              ₹{customerData?.preApprovedAmount || '0'}
            </Text>
          </View>
        </View>

        {!customerData?.kycVerified && (
          <View style={styles.kycAlertCard}>
            <View style={styles.kycAlertHeader}>
              <Text style={styles.kycAlertIcon}>⚠️</Text>
              <View style={styles.kycAlertTextContainer}>
                <Text style={styles.kycAlertTitle}>KYC Verification Required</Text>
                <Text style={styles.kycAlertDescription}>
                  Complete your KYC to unlock all features and get loan approval
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.kycVerifyButton}
              onPress={() => navigation.navigate('KYCStatus', { customerId: customerData?.customerId })}
            >
              <Text style={styles.kycVerifyButtonText}>Verify KYC Now</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Services</Text>

        <View style={styles.servicesGrid}>
          <ServiceCard
            icon="👤"
            title="CRM Service"
            description="Manage customer details and KYC"
            onPress={() => navigation.navigate('CustomerSearch')}
          />
          <ServiceCard
            icon="📁"
            title="Upload Docs"
            description="Upload required documents"
            onPress={() => navigation.navigate('DocumentUpload', {
              customerId: customerData?.customerId || '#12345'
            })}
          />
          <ServiceCard
            icon="📊"
            title="Credit Report"
            description="View credit score and report"
            onPress={() => navigation.navigate('CreditReport')}
          />
          <ServiceCard
            icon="💰"
            title="Loan Apply"
            description="Apply for new loan"
            onPress={() => navigation.navigate('LoanApplication')}
          />
        </View>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <View style={styles.activitySection}>
          {customerData?.recentActivity?.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  menuIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconText: {
    fontSize: 28,
    color: '#1F2937',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerIdText: {
    fontSize: 14,
    color: '#6B7280',
  },
  quickStatsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statValueSuccess: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  statValuePending: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F59E0B',
  },
  kycAlertCard: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  kycAlertHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  kycAlertIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  kycAlertTextContainer: {
    flex: 1,
  },
  kycAlertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  kycAlertDescription: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  kycVerifyButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  kycVerifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 0,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  serviceButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  serviceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activitySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E40AF',
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomPadding: {
    height: 24,
  },
});

export default Home;