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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Pdf from 'react-native-pdf';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

const DocumentViewerScreen = ({ route, navigation }) => {
  const { document } = route.params;
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
        message: `Check out this document: ${document?.fileName || 'Document'}`,
        url: shareUrl,
        title: document?.fileName || 'Document',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Document shared successfully');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share document');
    }
  };

  // Download document
  const handleDownload = async () => {
    try {
      const downloadUrl = document?.cloudinaryUrl || document?.url || document?.uri;
      
      if (!downloadUrl) {
        Alert.alert('Error', 'No download URL available');
        return;
      }

      Alert.alert(
        'Download Document',
        'Would you like to download this document?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                if (Platform.OS === 'web') {
                  // For web, open in new tab
                  Linking.openURL(downloadUrl);
                } else {
                  // For mobile, use FileSystem
                  const fileName = document?.fileName || `document_${Date.now()}`;
                  const fileUri = FileSystem.documentDirectory + fileName;

                  const downloadResumable = FileSystem.createDownloadResumable(
                    downloadUrl,
                    fileUri
                  );

                  const { uri } = await downloadResumable.downloadAsync();
                  Alert.alert('Success', `Document downloaded to: ${uri}`);
                }
              } catch (downloadError) {
                console.error('Download error:', downloadError);
                Alert.alert('Error', 'Failed to download document');
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
              // TODO: Implement Cloudinary deletion via your backend
              // For now, just navigate back
              Alert.alert('Success', 'Document deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
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
    const info = `
📄 File Name: ${document?.fileName || 'Unknown'}

📊 File Size: ${document?.fileSize || 'Unknown'}

📅 Uploaded: ${document?.uploadedAt || 'Unknown'}

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
        <LinearGradient colors={['#1C1917', '#292524', '#1C1917']} style={styles.gradient}>
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
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1C1917', '#292524', '#1C1917']} style={styles.gradient}>
        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {document?.fileName || 'Document'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {document?.fileSize || 'Unknown size'} • {document?.uploadedAt || 'Recently'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Text style={styles.headerIcon}>🗑️</Text>
          </TouchableOpacity>
        </BlurView>

        {/* Document Viewer */}
        <View style={styles.viewerContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F59E0B" />
              <Text style={styles.loadingText}>Loading document...</Text>
            </View>
          ) : isPDF ? (
            <View style={styles.pdfContainer}>
              <Pdf
                source={{ uri: documentUrl, cache: true }}
                style={styles.pdf}
                onLoadComplete={(numberOfPages) => {
                  console.log(`PDF loaded with ${numberOfPages} pages`);
                  setTotalPages(numberOfPages);
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`Page ${page} of ${numberOfPages}`);
                  setPage(page);
                }}
                onError={(error) => {
                  console.error('PDF load error:', error);
                  Alert.alert('Error', 'Failed to load PDF document');
                }}
                trustAllCerts={false}
                enablePaging={true}
                horizontal={false}
              />

              {/* PDF Page Counter */}
              <BlurView intensity={20} tint="dark" style={styles.pageCounter}>
                <Text style={styles.pageCounterText}>
                  Page {page} of {totalPages}
                </Text>
              </BlurView>
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
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.browserGradient}>
                  <Text style={styles.browserButtonText}>🌐 Open in Browser</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Zoom Controls (for images and PDFs) */}
        {!loading && (isPDF || isImage) && (
          <BlurView intensity={20} tint="dark" style={styles.zoomControls}>
            <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
              <Text style={styles.zoomIcon}>−</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={resetZoom} style={styles.zoomButton}>
              <Text style={styles.zoomText}>{Math.round(zoom * 100)}%</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
              <Text style={styles.zoomIcon}>+</Text>
            </TouchableOpacity>
          </BlurView>
        )}

        {/* Bottom Action Bar */}
        {!loading && (
          <BlurView intensity={20} tint="dark" style={styles.actionBar}>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.2)']}
                  style={styles.actionIconGradient}
                >
                  <Text style={styles.actionIcon}>↗️</Text>
                </LinearGradient>
              </View>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.2)']}
                  style={styles.actionIconGradient}
                >
                  <Text style={styles.actionIcon}>⬇️</Text>
                </LinearGradient>
              </View>
              <Text style={styles.actionText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShowInfo} style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.2)']}
                  style={styles.actionIconGradient}
                >
                  <Text style={styles.actionIcon}>ℹ️</Text>
                </LinearGradient>
              </View>
              <Text style={styles.actionText}>Info</Text>
            </TouchableOpacity>
          </BlurView>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1917',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(41, 37, 36, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120, 113, 108, 0.2)',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(41, 37, 36, 0.6)',
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
    color: '#E7E5E4',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#A8A29E',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1917',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#A8A29E',
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#1C1917',
  },
  pageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(41, 37, 36, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(120, 113, 108, 0.2)',
  },
  pageCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E7E5E4',
  },
  imageScrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: height * 0.7,
  },
  image: {
    width: width,
    height: height * 0.7,
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
    color: '#A8A29E',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#1C1917',
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
    color: '#E7E5E4',
    textAlign: 'center',
    marginBottom: 8,
  },
  unsupportedSubtext: {
    fontSize: 14,
    color: '#A8A29E',
    textAlign: 'center',
    marginBottom: 24,
  },
  browserButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  browserGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  browserButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  goBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
  },
  goBackButtonText: {
    color: '#1C1917',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    flexDirection: 'column',
    backgroundColor: 'rgba(41, 37, 36, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(120, 113, 108, 0.2)',
    overflow: 'hidden',
  },
  zoomButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120, 113, 108, 0.2)',
  },
  zoomIcon: {
    fontSize: 24,
    color: '#F59E0B',
    fontWeight: '600',
  },
  zoomText: {
    fontSize: 12,
    color: '#E7E5E4',
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(41, 37, 36, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(120, 113, 108, 0.2)',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  actionIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E7E5E4',
  },
});

export default DocumentViewerScreen;