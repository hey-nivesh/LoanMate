import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteDocumentMetadata } from '../../config/cloudinaryConfig';

const DocumentsListScreen = ({ navigation, route }) => {
  const { documentType, documents: initialDocuments, customerId } = route?.params || {};
  const [documents, setDocuments] = useState(initialDocuments || []);

  const handleViewDocument = (document) => {
    navigation.navigate('DocumentViewer', {
      document: document,
    });
  };

  const handleDeleteDocument = async (document) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.fileName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteDocumentMetadata(document.id);
              if (result.success) {
                // Remove from local state
                setDocuments(prev => prev.filter(doc => doc.id !== document.id));
                Alert.alert('Success', 'Document deleted successfully');
              } else {
                Alert.alert('Error', 'Failed to delete document');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (document) => {
    const isPDF = document?.fileType?.includes('pdf') || 
                  document?.mimeType?.includes('pdf') ||
                  document?.cloudinaryUrl?.includes('.pdf');
    
    return isPDF ? '📄' : '🖼️';
  };

  const DocumentCard = ({ document }) => {
    const isPDF = document?.fileType?.includes('pdf') || 
                  document?.mimeType?.includes('pdf') ||
                  document?.cloudinaryUrl?.includes('.pdf');

    return (
      <View style={styles.documentCard}>
        <TouchableOpacity
          style={styles.documentCardContent}
          onPress={() => handleViewDocument(document)}
          activeOpacity={0.7}
        >
          <View style={styles.documentPreview}>
            {isPDF ? (
              <View style={styles.pdfPreview}>
                <Text style={styles.pdfIcon}>📄</Text>
              </View>
            ) : (
              <Image
                source={{ uri: document.cloudinaryUrl }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={styles.documentInfo}>
            <Text style={styles.documentName} numberOfLines={2}>
              {document.fileName}
            </Text>
            <Text style={styles.documentMeta}>
              {document.fileSize} • {formatDate(document.uploadedAt)}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Uploaded</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewDocument(document)}
          >
            <Text style={styles.actionButtonIcon}>👁️</Text>
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteDocument(document)}
          >
            <Text style={styles.actionButtonIcon}>🗑️</Text>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{documentType}</Text>
          <Text style={styles.headerSubtitle}>
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Documents</Text>
            <Text style={styles.emptyDescription}>
              You haven't uploaded any {documentType} yet.
            </Text>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.uploadButtonText}>Upload Documents</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Tap on any document to view it in full screen. Swipe down to refresh.
              </Text>
            </View>

            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </>
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
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
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
  documentCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  documentPreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  pdfPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
  },
  pdfIcon: {
    fontSize: 40,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  documentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 20,
  },
  documentMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  documentActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  deleteButton: {
    borderLeftWidth: 1,
    borderLeftColor: '#F3F4F6',
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  uploadButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 32,
  },
});

export default DocumentsListScreen;