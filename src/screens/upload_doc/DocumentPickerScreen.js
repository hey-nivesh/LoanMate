import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import { pick, types } from '@react-native-documents/picker';
import { uploadDocumentToCloudinary, saveDocumentMetadata } from '../../config/cloudinaryConfig.js';
import {CLOUDINARY_CONFIG} from '../../config/cloudinaryConfig.js';

const DocumentPickerScreen = ({ navigation, route }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewType, setPreviewType] = useState(null);

  const documentType = route?.params?.documentType || {};
  const customerId = route?.params?.customerId;

  const handleChooseFromGallery = () => {
    ImagePicker.openPicker({
      width: 2000,
      height: 2000,
      cropping: true,
      compressImageQuality: 0.8,
      mediaType: 'photo',
      includeBase64: false,
    }).then((image) => {
      setSelectedFile({
        uri: image.path,
        type: image.mime,
        name: image.filename || `image_${Date.now()}.jpg`,
        size: image.size,
      });
      setPreviewType('image');
    }).catch((error) => {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to pick image from gallery');
      }
    });
  };

  const handleTakePhoto = () => {
    ImagePicker.openCamera({
      width: 2000,
      height: 2000,
      cropping: true,
      compressImageQuality: 0.8,
      mediaType: 'photo',
      includeBase64: false,
    }).then((image) => {
      setSelectedFile({
        uri: image.path,
        type: image.mime,
        name: `photo_${Date.now()}.jpg`,
        size: image.size,
      });
      setPreviewType('image');
    }).catch((error) => {
      if (error.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', 'Failed to capture photo');
      }
    });
  };

  const handleChoosePDF = async () => {
    try {
      const result = await pick({
        type: [types.pdf],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const file = result[0];
        
        if (file.size && file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        setSelectedFile({
          uri: file.uri,
          type: file.type || 'application/pdf',
          name: file.name,
          size: file.size,
        });
        setPreviewType('pdf');
      }
    } catch (err) {
      if (err.message !== 'User canceled document picker') {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleRemoveFile = () => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (previewType === 'image') {
              ImagePicker.clean().catch(() => {});
            }
            setSelectedFile(null);
            setPreviewType(null);
          },
        },
      ]
    );
  };

  const handleUploadToCloudinary = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Cloudinary
      const result = await uploadDocumentToCloudinary(
        selectedFile,
        documentType.type
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        // Save metadata
        const metadata = {
          documentType: documentType.type,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          fileType: selectedFile.type,
          cloudinaryUrl: result.data.url,
          cloudinaryPublicId: result.data.publicId,
          uploadedAt: new Date().toISOString(),
          status: 'uploaded',
        };

        await saveDocumentMetadata(metadata);

        Alert.alert(
          'Success! 🎉',
          'Document uploaded successfully to Cloudinary',
          [
            {
              text: 'Upload Another',
              onPress: () => {
                setSelectedFile(null);
                setPreviewType(null);
                setUploading(false);
                setUploadProgress(0);
              },
            },
            {
              text: 'Go Back',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Please try again');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const PickerButton = ({ icon, title, description, onPress, color }) => (
    <TouchableOpacity
      style={[styles.pickerButton, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={uploading}
    >
      <View style={[styles.pickerIconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.pickerIcon}>{icon}</Text>
      </View>
      <View style={styles.pickerContent}>
        <Text style={styles.pickerTitle}>{title}</Text>
        <Text style={styles.pickerDescription}>{description}</Text>
      </View>
      <Text style={[styles.pickerArrow, { color: color }]}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={uploading}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Document</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.documentTypeCard}>
          <View style={[styles.documentTypeIcon, { backgroundColor: documentType.color + '20' }]}>
            <Text style={styles.documentTypeIconText}>{documentType.icon}</Text>
          </View>
          <Text style={styles.documentTypeName}>{documentType.type}</Text>
          <Text style={styles.documentTypeDescription}>{documentType.description}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>☁️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Cloudinary Upload</Text>
            <Text style={styles.infoDescription}>
              • Secure cloud storage{'\n'}
              • Accepted formats: PDF, JPG, PNG{'\n'}
              • Maximum file size: 5MB{'\n'}
              • Document must be clear and legible
            </Text>
          </View>
        </View>

        {!selectedFile && (
          <>
            <Text style={styles.sectionTitle}>Choose Upload Method</Text>

            <PickerButton
              icon="🖼️"
              title="Choose from Gallery"
              description="Select an image from your gallery"
              color="#3B82F6"
              onPress={handleChooseFromGallery}
            />

            <PickerButton
              icon="📷"
              title="Take Photo"
              description="Capture document using camera"
              color="#10B981"
              onPress={handleTakePhoto}
            />

            <PickerButton
              icon="📄"
              title="Choose PDF"
              description="Select a PDF document"
              color="#8B5CF6"
              onPress={handleChoosePDF}
            />
          </>
        )}

        {selectedFile && (
          <>
            <Text style={styles.sectionTitle}>File Preview</Text>

            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Selected File</Text>
                {!uploading && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={handleRemoveFile}
                  >
                    <Text style={styles.removeButtonText}>✕ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              {previewType === 'image' ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedFile.uri }}
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.pdfPreviewContainer}>
                  <Text style={styles.pdfIcon}>📄</Text>
                  <Text style={styles.pdfText}>PDF Document</Text>
                  <Text style={styles.pdfSubtext}>Ready to upload</Text>
                </View>
              )}

              <View style={styles.fileInfoContainer}>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>File Name:</Text>
                  <Text style={styles.fileInfoValue} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>File Size:</Text>
                  <Text style={styles.fileInfoValue}>
                    {formatFileSize(selectedFile.size)}
                  </Text>
                </View>
                <View style={styles.fileInfoRow}>
                  <Text style={styles.fileInfoLabel}>File Type:</Text>
                  <Text style={styles.fileInfoValue}>
                    {selectedFile.type || 'Unknown'}
                  </Text>
                </View>
              </View>

              {/* Upload Progress */}
              {uploading && (
                <View style={styles.uploadProgressContainer}>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${uploadProgress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.uploadProgressText}>
                    Uploading to Cloudinary... {uploadProgress}%
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {selectedFile && !uploading && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadToCloudinary}
          >
            <Text style={styles.uploadButtonText}>
              ☁️ Upload to Cloudinary
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {uploading && (
        <View style={styles.footer}>
          <View style={styles.uploadingButton}>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text style={styles.uploadingButtonText}>Uploading...</Text>
          </View>
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
  documentTypeCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentTypeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentTypeIconText: {
    fontSize: 48,
  },
  documentTypeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  documentTypeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
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
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  pickerButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pickerIcon: {
    fontSize: 32,
  },
  pickerContent: {
    flex: 1,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  pickerDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  pickerArrow: {
    fontSize: 24,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  imagePreviewContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  pdfPreviewContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pdfIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  pdfText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  pdfSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
  fileInfoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  fileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    width: '35%',
  },
  fileInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  uploadProgressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  uploadProgressText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  uploadButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingButton: {
    backgroundColor: '#6B7280',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  uploadingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

export default DocumentPickerScreen;