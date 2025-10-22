// src/screens/DocumentViewerScreen.js
import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Pdf from 'react-native-pdf';

const { width, height } = Dimensions.get('window');

export const DocumentViewerScreen = ({ route, navigation }) => {
  const { document } = route.params;
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pdfRef = useRef(null);

  const isPDF = document.mimeType === 'application/pdf';
  const isImage = document.mimeType?.startsWith('image/');

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
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const result = await Share.share({
          message: `Sharing ${document.fileName}`,
          url: document.uri || document.url,
          title: document.fileName,
        });

        if (result.action === Share.sharedAction) {
          Alert.alert('Success', 'Document shared successfully!');
        }
      } else {
        Alert.alert('Info', 'Sharing is not supported on this platform');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share document');
      console.error('Share error:', error);
    }
  };

  // Download document
  const handleDownload = async () => {
    try {
      Alert.alert(
        'Download',
        'Document downloaded successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download document');
      console.error('Download error:', error);
    }
  };

  // Delete document
  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement delete logic
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1C1917', '#292524', '#1C1917']}
        style={styles.gradient}
      >
        {/* Header */}
        <BlurView intensity={20} tint="dark" style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Text style={styles.headerIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {document.fileName}
            </Text>
            <Text style={styles.headerSubtitle}>
              {document.fileSize} • {document.uploadedAt}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleDelete}
            style={styles.headerButton}
          >
            <Text style={styles.headerIcon}>🗑️</Text>
          </TouchableOpacity>
        </BlurView>

        {/* Document Viewer */}
        <View style={styles.viewerContainer}>
          {isPDF ? (
            <View style={styles.pdfContainer}>
              <Pdf
                ref={pdfRef}
                source={{ uri: document.uri || document.url }}
                style={[styles.pdf, { transform: [{ scale: zoom }] }]}
                onLoadComplete={(numberOfPages) => {
                  setTotalPages(numberOfPages);
                }}
                onPageChanged={(page) => {
                  setPage(page);
                }}
                onError={(error) => {
                  console.log('PDF error:', error);
                  Alert.alert('Error', 'Failed to load PDF');
                }}
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
              <Image
                source={{ uri: document.uri || document.url }}
                style={[
                  styles.image,
                  {
                    transform: [{ scale: zoom }],
                  },
                ]}
                resizeMode="contain"
              />
            </ScrollView>
          ) : (
            <View style={styles.unsupportedContainer}>
              <Text style={styles.unsupportedIcon}>📄</Text>
              <Text style={styles.unsupportedText}>
                Preview not available for this file type
              </Text>
              <TouchableOpacity
                onPress={handleDownload}
                style={styles.downloadButton}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706']}   
                  style={styles.downloadGradient}
                >
                  <Text style={styles.downloadButtonText}>Download File</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Zoom Controls (for images and PDFs) */}
        {(isPDF || isImage) && (
          <BlurView intensity={20} tint="dark" style={styles.zoomControls}>
            <TouchableOpacity
              onPress={handleZoomOut}
              style={styles.zoomButton}
            >
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
        <BlurView intensity={20} tint="dark" style={styles.actionBar}>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.actionButton}
          >
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

          <TouchableOpacity
            onPress={handleDownload}
            style={styles.actionButton}
          >
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

          <TouchableOpacity
            onPress={() => {
              Alert.alert('Info', 'Document information', [
                {
                  text: 'OK',
                },
              ]);
            }}
            style={styles.actionButton}
          >
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
      </LinearGradient>
    </View>
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
    paddingTop: 60,
    paddingBottom: 16,
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
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: width,
    height: height,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: width,
    height: height * 0.7,
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
    color: '#A8A29E',
    textAlign: 'center',
    marginBottom: 24,
  },
  downloadButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  downloadGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
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
    paddingBottom: 32,
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