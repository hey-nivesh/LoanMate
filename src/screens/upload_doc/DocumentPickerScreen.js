import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const DocumentPickerScreen = ({ navigation, route }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewType, setPreviewType] = useState(null); // 'image' or 'pdf'

  const documentType = route?.params?.documentType || {};
  const customerId = route?.params?.customerId;

  const handleChooseFromGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 2000,
      maxHeight: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const file = response.assets[0];
        setSelectedFile({
          uri: file.uri,
          type: file.type,
          name: file.fileName || 'image.jpg',
          size: file.fileSize,
        });
        setPreviewType('image');
      }
    });
  };

  const handleTakePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 2000,
      maxHeight: 2000,
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const file = response.assets[0];
        setSelectedFile({
          uri: file.uri,
          type: file.type,
          name: file.fileName || 'photo.jpg',
          size: file.fileSize,
        });
        setPreviewType('image');
      }
    });
  };

  const handleChoosePDF = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });

      if (result && result.length > 0) {
        const file = result[0];
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        setSelectedFile({
          uri: file.uri,
          type: file.type,
          name: file.name,
          size: file.size,
        });
        setPreviewType('pdf');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled document picker');
      } else {
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
            setSelectedFile(null);
            setPreviewType(null);
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    // Navigate to upload details form
    navigation.navigate('UploadDetailsForm', {
      file: selectedFile,
      documentType: documentType,
      customerId: customerId,
    });
  };

  const PickerButton = ({ icon, title, description, onPress, color }) => (
    <TouchableOpacity
      style={[styles.pickerButton, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
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
          <Text style={styles.infoIcon}>ℹ️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>File Requirements</Text>
            <Text style={styles.infoDescription}>
              • Accepted formats: PDF, JPG, PNG{'\n'}
              • Maximum file size: 5MB{'\n'}
              • Document must be clear and legible{'\n'}
              • All corners should be visible
            </Text>
          </View>
        </View>

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

        {selectedFile && (
          <>
            <Text style={styles.sectionTitle}>File Preview</Text>

            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Selected File</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveFile}
                >
                  <Text style={styles.removeButtonText}>✕ Remove</Text>
                </TouchableOpacity>
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
                  <Text style={styles.pdfSubtext}>Preview not available</Text>
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
            </View>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {selectedFile && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>Continue to Upload</Text>
            )}
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
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  continueButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

export default DocumentPickerScreen;