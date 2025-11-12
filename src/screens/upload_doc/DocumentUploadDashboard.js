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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DocumentUploadDashboard = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const customerId = route?.params?.customerId || 'user_default';

  useEffect(() => {
    fetchUploadStatsFromCloudinary();
  }, []);

  const fetchUploadStatsFromCloudinary = async () => {
    try {
      setLoading(true);

      // Fetch all documents from AsyncStorage (where we saved them after upload)
      const allDocs = await getAllUploadedDocuments();
      
      // Group documents by type
      const documentsByType = {
        'Salary Slip': [],
        'ID Proof': [],
        'Address Proof': [],
        'Bank Statement': [],
      };

      allDocs.forEach(doc => {
        if (documentsByType[doc.documentType]) {
          documentsByType[doc.documentType].push(doc);
        }
      });

      // Calculate stats for each document type
      const documentTypes = [
        {
          id: 1,
          type: 'Salary Slip',
          icon: '💰',
          description: 'Upload your recent salary slips',
          uploadedCount: documentsByType['Salary Slip'].length,
          requiredCount: 3,
          color: '#3B82F6',
          documents: documentsByType['Salary Slip'],
        },
        {
          id: 2,
          type: 'ID Proof',
          icon: '🆔',
          description: 'PAN Card or Aadhaar Card',
          uploadedCount: documentsByType['ID Proof'].length,
          requiredCount: 2,
          color: '#8B5CF6',
          documents: documentsByType['ID Proof'],
        },
        {
          id: 3,
          type: 'Address Proof',
          icon: '🏠',
          description: 'Utility bill or rent agreement',
          uploadedCount: documentsByType['Address Proof'].length,
          requiredCount: 1,
          color: '#EC4899',
          documents: documentsByType['Address Proof'],
        },
        {
          id: 4,
          type: 'Bank Statement',
          icon: '🏦',
          description: 'Last 3 months bank statements',
          uploadedCount: documentsByType['Bank Statement'].length,
          requiredCount: 3,
          color: '#10B981',
          documents: documentsByType['Bank Statement'],
        },
      ];

      // Determine status for each type
      documentTypes.forEach(type => {
        if (type.uploadedCount === 0) {
          type.status = 'not_started';
        } else if (type.uploadedCount < type.requiredCount) {
          type.status = 'pending';
        } else {
          type.status = 'completed';
        }
      });

      // Calculate overall stats
      const totalRequired = documentTypes.reduce((sum, type) => sum + type.requiredCount, 0);
      const totalUploaded = documentTypes.reduce((sum, type) => sum + type.uploadedCount, 0);
      const totalPending = documentTypes.reduce((sum, type) => {
        return sum + Math.max(0, type.requiredCount - type.uploadedCount);
      }, 0);
      const totalVerified = documentTypes.filter(type => type.status === 'completed').length;

      setUploadStats({
        totalDocuments: totalRequired,
        uploadedDocuments: totalUploaded,
        pendingDocuments: totalPending,
        verifiedDocuments: totalVerified,
        documentTypes: documentTypes,
      });

      setUploadedDocuments(allDocs);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching upload stats:', error);
      Alert.alert('Error', 'Failed to load document statistics');
      setLoading(false);
    }
  };

  const getAllUploadedDocuments = async () => {
    try {
      // Get all documents from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const documentKeys = keys.filter(key => key.startsWith('document_'));
      const documentData = await AsyncStorage.multiGet(documentKeys);
      
      const documents = documentData
        .map(([key, value]) => {
          try {
            return JSON.parse(value);
          } catch (e) {
            return null;
          }
        })
        .filter(doc => doc !== null);

      return documents;
    } catch (error) {
      console.error('Error getting documents from storage:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUploadStatsFromCloudinary();
    setRefreshing(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { text: '✓ Completed', color: '#10B981', bgColor: '#D1FAE5' };
      case 'pending':
        return { text: '⏳ In Progress', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'not_started':
        return { text: '○ Not Started', color: '#6B7280', bgColor: '#F3F4F6' };
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

  const handleViewDocuments = (documentType) => {
    if (documentType.uploadedCount === 0) {
      Alert.alert(
        'No Documents',
        `You haven't uploaded any ${documentType.type} yet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload Now',
            onPress: () => handleDocumentTypePress(documentType),
          },
        ]
      );
      return;
    }

    navigation.navigate('DocumentsList', {
      documentType: documentType.type,
      documents: documentType.documents,
      customerId: customerId,
    });
  };

  const DocumentTypeCard = ({ documentType }) => {
    const statusBadge = getStatusBadge(documentType.status);
    const progressPercentage = (documentType.uploadedCount / documentType.requiredCount) * 100;

    return (
      <View style={styles.documentCard}>
        <TouchableOpacity
          style={styles.documentCardTouchable}
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
                <Text style={styles.progressLabel}>Upload Progress</Text>
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
                  {documentType.uploadedCount}/{documentType.requiredCount} Documents Uploaded
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: documentType.color }]}
            onPress={() => handleDocumentTypePress(documentType)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnIcon}>📤</Text>
            <Text style={styles.actionBtnText}>Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={() => handleViewDocuments(documentType)}
            activeOpacity={0.8}
            disabled={documentType.uploadedCount === 0}
          >
            <Text style={styles.actionBtnIcon}>👁️</Text>
            <Text style={[
              styles.actionBtnText,
              { color: documentType.uploadedCount === 0 ? '#9CA3AF' : '#1F2937' }
            ]}>
              View ({documentType.uploadedCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={styles.loadingText}>Loading your documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const overallProgress = uploadStats
    ? (uploadStats.uploadedDocuments / uploadStats.totalDocuments) * 100
    : 0;

  const isComplete = uploadStats && uploadStats.uploadedDocuments >= uploadStats.totalDocuments;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Upload</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Alert.alert(
            'Help',
            'Upload all required documents to complete your loan application.\n\n✓ Clear and legible copies\n✓ PDF, JPG, or PNG format\n✓ Maximum 5MB per file'
          )}
        >
          <Text style={styles.helpButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E40AF']}
            tintColor="#1E40AF"
          />
        }
      >
        {/* Overall Progress Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <View>
              <Text style={styles.statsTitle}>Overall Progress</Text>
              <Text style={styles.statsSubtitle}>
                {uploadStats?.uploadedDocuments || 0} of {uploadStats?.totalDocuments || 0} documents
              </Text>
            </View>
            <View style={styles.percentageCircle}>
              <Text style={styles.statsPercentage}>{Math.round(overallProgress)}%</Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${overallProgress}%`,
                  backgroundColor: isComplete ? '#10B981' : '#1E40AF',
                },
              ]}
            />
          </View>

          {isComplete && (
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>🎉 All Documents Uploaded!</Text>
            </View>
          )}

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.statIcon}>📤</Text>
              </View>
              <Text style={styles.statValue}>{uploadStats?.uploadedDocuments || 0}</Text>
              <Text style={styles.statLabel}>Uploaded</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.statIcon}>⏳</Text>
              </View>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                {uploadStats?.pendingDocuments || 0}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.statIcon}>✓</Text>
              </View>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {uploadStats?.verifiedDocuments || 0}
              </Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>☁️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Cloudinary Secure Storage</Text>
            <Text style={styles.infoDescription}>
              • All documents are securely stored in the cloud{'\n'}
              • Accepted formats: PDF, JPG, PNG{'\n'}
              • Maximum file size: 5MB per document{'\n'}
              • Pull down to refresh your upload status
            </Text>
          </View>
        </View>

        {/* Document Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Document Categories</Text>
          <Text style={styles.sectionSubtitle}>
            Tap on any category to upload documents
          </Text>
        </View>

        {uploadStats?.documentTypes.map((documentType) => (
          <DocumentTypeCard key={documentType.id} documentType={documentType} />
        ))}

        {/* View All Button */}
        {uploadStats && uploadStats.uploadedDocuments > 0 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('AllDocumentsList', {
              documents: uploadedDocuments,
              customerId: customerId,
            })}
          >
            <Text style={styles.viewAllButtonIcon}>📋</Text>
            <Text style={styles.viewAllButtonText}>
              View All Uploaded Documents ({uploadStats.uploadedDocuments})
            </Text>
          </TouchableOpacity>
        )}

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
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  percentageCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E40AF',
  },
  statsPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  completeBadge: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  completeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
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
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 60,
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
    marginBottom: 6,
  },
  infoDescription: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  documentCardTouchable: {
    flexDirection: 'row',
    padding: 16,
  },
  documentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
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
    marginBottom: 6,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
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
  },
  progressLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnSecondary: {
    backgroundColor: '#F3F4F6',
  },
  actionBtnIcon: {
    fontSize: 16,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 8,
    padding: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E40AF',
    gap: 12,
  },
  viewAllButtonIcon: {
    fontSize: 20,
  },
  viewAllButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E40AF',
  },
  bottomPadding: {
    height: 32,
  },
});

export default DocumentUploadDashboard;