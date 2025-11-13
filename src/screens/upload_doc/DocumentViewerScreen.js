import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Share,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { deleteDocumentMetadata } from '../../config/cloudinaryConfig';

const { width, height } = Dimensions.get('window');

const DocumentViewerScreen = ({ route, navigation }) => {
  const { document } = route.params;
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Determine file type
  const isPDF = document?.fileType?.includes('pdf') || 
                document?.mimeType?.includes('pdf') ||
                document?.cloudinaryUrl?.includes('.pdf');
  
  const isImage = document?.fileType?.includes('image') || 
                  document?.mimeType?.startsWith('image') ||
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(document?.cloudinaryUrl);

  useEffect(() => {
    // Simulate loading time for smooth UX
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  // Share document
  const handleShare = async () => {
    try {
      const shareUrl = document?.cloudinaryUrl || document?.url || document?.uri;
      
      if (!shareUrl) {
        Alert.alert('Error', 'No shareable URL available');
        return;
      }

      const result = await Share.share({
        message: `Check out this document: ${document?.fileName || 'Document'}\n\n${shareUrl}`,
        title: document?.fileName || 'Document',
      });

      if (result.action === Share.sharedAction) {
        console.log('Document shared successfully');
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share document');
    }
  };

  // Download/Open document
  const handleDownload = async () => {
    try {
      const downloadUrl = document?.cloudinaryUrl || document?.url || document?.uri;
      
      if (!downloadUrl) {
        Alert.alert('Error', 'No download URL available');
        return;
      }

      Alert.alert(
        'Open Document',
        'This will open the document in your browser where you can view or download it.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open',
            onPress: async () => {
              try {
                const supported = await Linking.canOpenURL(downloadUrl);
                if (supported) {
                  await Linking.openURL(downloadUrl);
                } else {
                  Alert.alert('Error', 'Cannot open this URL');
                }
              } catch (error) {
                console.error('Open error:', error);
                Alert.alert('Error', 'Failed to open document');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Download preparation error:', error);
      Alert.alert('Error', 'Failed to prepare download');
    }
  };

  // Open in browser
  const handleOpenInBrowser = async () => {
    try {
      const browserUrl = document?.cloudinaryUrl || document?.url || document?.uri;
      
      if (!browserUrl) {
        Alert.alert('Error', 'No URL available');
        return;
      }

      const supported = await Linking.canOpenURL(browserUrl);
      if (supported) {
        await Linking.openURL(browserUrl);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      console.error('Browser open error:', error);
      Alert.alert('Error', 'Failed to open in browser');
    }
  };

  // Delete document
  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteDocumentMetadata(document.id);
              if (result.success) {
                Alert.alert('Success', 'Document deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
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

  // Show document info
  const handleShowInfo = () => {
    const uploadDate = document?.uploadedAt 
      ? new Date(document.uploadedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Unknown';

    const info = `
📄 File Name: ${document?.fileName || 'Unknown'}

📊 File Size: ${document?.fileSize || 'Unknown'}

📅 Uploaded: ${uploadDate}

🗂️ Document Type: ${document?.documentType || 'Unknown'}

🔗 Status: ${document?.status || 'Uploaded'}

☁️ Cloudinary ID: ${document?.cloudinaryPublicId || 'N/A'}
    `.trim();

    Alert.alert('Document Information', info, [{ text: 'OK' }]);
  };

  const documentUrl = document?.cloudinaryUrl || document?.url || document?.uri;

  if (!documentUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>No document URL available</Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.goBackButton}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Text style={styles.headerIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {document?.fileName || 'Document'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {document?.fileSize || 'Unknown size'} • {document?.documentType || 'Document'}
          </Text>
        </View>

        <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
          <Text style={styles.headerIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Document Viewer */}
      <View style={styles.viewerContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E40AF" />
            <Text style={styles.loadingText}>Loading document...</Text>
          </View>
        ) : isPDF ? (
          <View style={styles.pdfContainer}>
            <View style={styles.pdfPlaceholder}>
              <Text style={styles.pdfIcon}>📄</Text>
              <Text style={styles.pdfTitle}>PDF Document</Text>
              <Text style={styles.pdfSubtitle}>{document?.fileName}</Text>
              <Text style={styles.pdfDescription}>
                PDF preview is not available in app.{'\n'}
                Open in browser to view the document.
              </Text>
              <TouchableOpacity 
                onPress={handleOpenInBrowser} 
                style={styles.openBrowserButton}
              >
                <Text style={styles.openBrowserButtonText}>🌐 Open in Browser</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isImage ? (
          <ScrollView
            contentContainerStyle={styles.imageScrollContainer}
            maximumZoomScale={3}
            minimumZoomScale={0.5}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {imageError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorText}>Failed to load image</Text>
                <TouchableOpacity onPress={handleOpenInBrowser} style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Open in Browser</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Image
                source={{ uri: documentUrl }}
                style={[styles.image, { transform: [{ scale: zoom }] }]}
                resizeMode="contain"
                onError={() => setImageError(true)}
                onLoadEnd={() => console.log('Image loaded successfully')}
              />
            )}
          </ScrollView>
        ) : (
          <View style={styles.unsupportedContainer}>
            <Text style={styles.unsupportedIcon}>📄</Text>
            <Text style={styles.unsupportedText}>
              Preview not available for this file type
            </Text>
            <Text style={styles.unsupportedSubtext}>
              {document?.fileType || 'Unknown format'}
            </Text>
            <TouchableOpacity onPress={handleOpenInBrowser} style={styles.browserButton}>
              <Text style={styles.browserButtonText}>🌐 Open in Browser</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Zoom Controls (for images only) */}
      {!loading && isImage && !imageError && (
        <View style={styles.zoomControls}>
          <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
            <Text style={styles.zoomIcon}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={resetZoom} style={styles.zoomButton}>
            <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
            <Text style={styles.zoomIcon}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Action Bar */}
      {!loading && (
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>↗️</Text>
            </View>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>⬇️</Text>
            </View>
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShowInfo} style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>ℹ️</Text>
            </View>
            <Text style={styles.actionText}>Info</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerIcon: {
    fontSize: 20,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  viewerContainer: {
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
  },
  pdfContainer: {
    flex: 1,
  },
  pdfPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pdfIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  pdfTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  pdfSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  pdfDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  openBrowserButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  openBrowserButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageScrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.7,
    padding: 20,
  },
  image: {
    width: width - 40,
    height: height * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1E40AF',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  unsupportedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  unsupportedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  unsupportedText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  unsupportedSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  browserButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  browserButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  goBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1E40AF',
    borderRadius: 12,
  },
  goBackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  zoomIcon: {
    fontSize: 24,
    color: '#1E40AF',
    fontWeight: '600',
  },
  zoomText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default DocumentViewerScreen;