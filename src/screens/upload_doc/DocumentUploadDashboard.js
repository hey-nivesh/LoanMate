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

const DocumentUploadDashboard = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [uploadStats, setUploadStats] = useState(null);
  const customerId = route?.params?.customerId || '#12345';

  useEffect(() => {
    fetchUploadStats();
  }, []);

  const fetchUploadStats = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUploadStats({
        totalDocuments: 8,
        uploadedDocuments: 3,
        pendingDocuments: 3,
        verifiedDocuments: 2,
        documentTypes: [
          {
            id: 1,
            type: 'Salary Slip',
            icon: '💰',
            description: 'Upload your recent salary slips',
            uploadedCount: 2,
            requiredCount: 3,
            status: 'pending', // pending, completed, not_started
            color: '#3B82F6',
          },
          {
            id: 2,
            type: 'ID Proof',
            icon: '🆔',
            description: 'PAN Card or Aadhaar Card',
            uploadedCount: 1,
            requiredCount: 2,
            status: 'pending',
            color: '#8B5CF6',
          },
          {
            id: 3,
            type: 'Address Proof',
            icon: '🏠',
            description: 'Utility bill or rent agreement',
            uploadedCount: 0,
            requiredCount: 1,
            status: 'not_started',
            color: '#EC4899',
          },
          {
            id: 4,
            type: 'Bank Statement',
            icon: '🏦',
            description: 'Last 3 months bank statements',
            uploadedCount: 0,
            requiredCount: 3,
            status: 'not_started',
            color: '#10B981',
          },
        ],
      });
      setLoading(false);
    }, 1000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { text: 'Completed', color: '#10B981', bgColor: '#D1FAE5' };
      case 'pending':
        return { text: 'In Progress', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'not_started':
        return { text: 'Not Started', color: '#6B7280', bgColor: '#F3F4F6' };
      default:
        return { text: 'Unknown', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  };

  const handleDocumentTypePress = (documentType) => {
    navigation.navigate('DocumentPicker', {
      documentType: documentType,
      customerId: customerId,
    });
  };

  const DocumentTypeCard = ({ documentType }) => {
    const statusBadge = getStatusBadge(documentType.status);
    const progressPercentage = (documentType.uploadedCount / documentType.requiredCount) * 100;

    return (
      <TouchableOpacity
        style={styles.documentCard}
        onPress={() => handleDocumentTypePress(documentType)}
        activeOpacity={0.7}
      >
        <View style={[styles.documentIconContainer, { backgroundColor: documentType.color + '20' }]}>
          <Text style={styles.documentIcon}>{documentType.icon}</Text>
        </View>

        <View style={styles.documentContent}>
          <View style={styles.documentHeader}>
            <Text style={styles.documentType}>{documentType.type}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
              <Text style={[styles.statusText, { color: statusBadge.color }]}>
                {statusBadge.text}
              </Text>
            </View>
          </View>

          <Text style={styles.documentDescription}>{documentType.description}</Text>

          <View style={styles.documentFooter}>
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Progress</Text>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercentage}%`,
                      backgroundColor: documentType.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {documentType.uploadedCount}/{documentType.requiredCount} Documents
              </Text>
            </View>

            <View style={styles.uploadButtonContainer}>
              <View style={[styles.uploadButton, { backgroundColor: documentType.color }]}>
                <Text style={styles.uploadButtonText}>Upload →</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  const overallProgress = uploadStats
    ? (uploadStats.uploadedDocuments / uploadStats.totalDocuments) * 100
    : 0;

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
        <Text style={styles.headerTitle}>Upload Documents</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Alert.alert('Help', 'Upload all required documents to process your loan application.')}
        >
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Upload Progress</Text>
            <Text style={styles.statsPercentage}>{Math.round(overallProgress)}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[styles.progressBarFill, { width: `${overallProgress}%`, backgroundColor: '#1E40AF' }]}
            />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{uploadStats?.uploadedDocuments || 0}</Text>
              <Text style={styles.statLabel}>Uploaded</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {uploadStats?.pendingDocuments || 0}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {uploadStats?.verifiedDocuments || 0}
              </Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Document Requirements</Text>
            <Text style={styles.infoDescription}>
              Please upload clear, legible copies of all required documents. Accepted formats: PDF, JPG, PNG (Max 5MB per file)
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Document Categories</Text>

        {uploadStats?.documentTypes.map((documentType) => (
          <DocumentTypeCard key={documentType.id} documentType={documentType} />
        ))}

        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('DocumentsList', { customerId: customerId })}
        >
          <Text style={styles.viewAllButtonText}>📄 View All Uploaded Documents</Text>
        </TouchableOpacity>

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
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statsPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
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
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    padding: 16,
  },
  documentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentIcon: {
    fontSize: 36,
  },
  documentContent: {
    flex: 1,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  documentDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressSection: {
    flex: 1,
    marginRight: 12,
  },
  progressLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
  },
  uploadButtonContainer: {
    justifyContent: 'flex-end',
  },
  uploadButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  bottomPadding: {
    height: 24,
  },
});

export default DocumentUploadDashboard;