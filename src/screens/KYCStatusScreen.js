import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const KYCStatusScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState(null);
  const customerId = route?.params?.customerId;

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setKycData({
        overallStatus: 'pending', // verified, pending, rejected
        documents: [
          {
            id: 1,
            type: 'PAN Card',
            icon: '📇',
            status: 'verified', // verified, pending, rejected
            number: 'ABCDE1234F',
            verifiedDate: 'Jan 15, 2025',
            description: 'Permanent Account Number',
          },
          {
            id: 2,
            type: 'Aadhaar Card',
            icon: '🆔',
            status: 'pending',
            number: 'XXXX XXXX 5678',
            verifiedDate: null,
            description: 'Unique Identification Number',
          },
          {
            id: 3,
            type: 'Mobile Number',
            icon: '📱',
            status: 'verified',
            number: '+91 98765 43210',
            verifiedDate: 'Jan 10, 2025',
            description: 'Registered Mobile Number',
          },
          {
            id: 4,
            type: 'Address Proof',
            icon: '🏠',
            status: 'pending',
            number: 'Not Submitted',
            verifiedDate: null,
            description: 'Residential Address Verification',
          },
        ],
      });
      setLoading(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const handleVerifyDocument = (document) => {
    if (document.status === 'verified') {
      Alert.alert('Already Verified', `Your ${document.type} is already verified.`);
      return;
    }

    Alert.alert(
      'Verify Document',
      `Do you want to verify your ${document.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify Now',
          onPress: () => {
            navigation.navigate('KYCVerification', {
              documentType: document.type,
              customerId: customerId,
            });
          },
        },
      ]
    );
  };

  const handleCompleteKYC = () => {
    const allVerified = kycData?.documents.every(doc => doc.status === 'verified');
    
    if (allVerified) {
      Alert.alert('KYC Complete', 'All documents are verified!');
      return;
    }
  
    // Navigate to video verification
    navigation.navigate('KYCVerification', { customerId: customerId });
  };

  const handleDownloadCertificate = () => {
    Alert.alert(
      'Download Certificate',
      'Your KYC verification certificate will be downloaded.',
      [{ text: 'OK' }]
    );
  };

  const DocumentCard = ({ document }) => {
    const statusColor = getStatusColor(document.status);
    const statusIcon = getStatusIcon(document.status);
    const statusText = getStatusText(document.status);

    return (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <Text style={styles.documentIcon}>{document.icon}</Text>
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentType}>{document.type}</Text>
            <Text style={styles.documentDescription}>{document.description}</Text>
          </View>
        </View>

        <View style={styles.documentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Document Number:</Text>
            <Text style={styles.detailValue}>{document.number}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={styles.statusIcon}>{statusIcon}</Text>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
          </View>

          {document.verifiedDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Verified On:</Text>
              <Text style={styles.detailValue}>{document.verifiedDate}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.documentButton,
            document.status === 'verified' && styles.documentButtonVerified,
          ]}
          onPress={() => handleVerifyDocument(document)}
        >
          <Text style={styles.documentButtonText}>
            {document.status === 'verified' ? 'Re-verify' : 'Verify Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  const allVerified = kycData?.documents.every(doc => doc.status === 'verified');
  const verifiedCount = kycData?.documents.filter(doc => doc.status === 'verified').length || 0;
  const totalCount = kycData?.documents.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification Status</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.overallStatusCard}>
          <View style={styles.statusCircle}>
            <Text style={styles.statusCircleText}>
              {verifiedCount}/{totalCount}
            </Text>
          </View>
          <Text style={styles.overallStatusTitle}>
            {allVerified ? 'KYC Verified' : 'KYC Pending'}
          </Text>
          <Text style={styles.overallStatusDescription}>
            {allVerified
              ? 'All documents have been verified successfully'
              : `${verifiedCount} of ${totalCount} documents verified`}
          </Text>
          {allVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedBadgeText}>✅ Fully Verified</Text>
            </View>
          )}
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>Verification Progress</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(verifiedCount / totalCount) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((verifiedCount / totalCount) * 100)}% Complete
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Document Verification</Text>

        {kycData?.documents.map((document) => (
          <DocumentCard key={document.id} document={document} />
        ))}

        <View style={styles.actionButtonsContainer}>
          {allVerified ? (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadCertificate}
            >
              <Text style={styles.downloadButtonText}>📄 Download Certificate</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteKYC}
            >
              <Text style={styles.completeButtonText}>Complete KYC Now</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpIcon}>ℹ️</Text>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpDescription}>
              Contact our support team for assistance with KYC verification
            </Text>
            <TouchableOpacity style={styles.helpButton}>
              <Text style={styles.helpButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  overallStatusCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusCircleText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overallStatusTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  overallStatusDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
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
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  documentIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentIcon: {
    fontSize: 32,
  },
  documentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  documentType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  documentDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  documentButtonVerified: {
    backgroundColor: '#6B7280',
  },
  documentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helpCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
  },
  helpIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  helpButton: {
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    textDecorationLine: 'underline',
  },
  bottomPadding: {
    height: 24,
  },
});

export default KYCStatusScreen;