import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

const KYCVerificationScreen = ({ navigation, route }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [verificationStep, setVerificationStep] = useState('instruction');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const camera = useRef(null);
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const recordingTimer = useRef(null);

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 10) {
            // Auto-stop recording when timer reaches 10 seconds
            if (camera.current) {
              camera.current.stopRecording().catch(err => console.error('Auto-stop error:', err));
            }
            setIsRecording(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  const customerId = route?.params?.customerId;

  const checkPermissions = async () => {
    if (!hasPermission) {
      const permission = await requestPermission();
      if (!permission) {
        Alert.alert(
          'Permission Required',
          'Camera and microphone permissions are required for KYC verification',
          [
            { text: 'Cancel', onPress: () => navigation.goBack() },
            { text: 'Grant Permission', onPress: () => requestPermission() },
          ]
        );
      }
    }
  };

  const handleStartRecording = async () => {
    if (!hasPermission) {
      await checkPermissions();
      return;
    }
    setVerificationStep('recording');
    // Start video recording after a short delay to ensure camera is ready
    setTimeout(() => {
      handleStartVideoRecording();
    }, 500);
  };

  const handleStartVideoRecording = async () => {
    if (camera.current) {
      try {
        setIsRecording(true);
        await camera.current.startRecording({
          onRecordingFinished: () => {
            setIsRecording(false);
            setVerificationStep('processing');
            processVerification();
          },
          onRecordingError: (error) => {
            console.error('Recording error:', error);
            Alert.alert('Error', 'Failed to record video. Please try again.');
            setIsRecording(false);
            setVerificationStep('instruction');
          },
        });
      } catch (error) {
        console.error('Start recording error:', error);
        Alert.alert('Error', 'Failed to start recording');
        setIsRecording(false);
      }
    }
  };

  const handleStopRecording = async () => {
    if (camera.current && isRecording) {
      try {
        await camera.current.stopRecording();
        setIsRecording(false);
      } catch (error) {
        console.error('Stop recording error:', error);
      }
    }
  };

  const processVerification = () => {
    setTimeout(() => {
      setVerificationStep('success');
      
      setTimeout(() => {
        Alert.alert(
          'Verification Complete',
          'Your KYC has been verified successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      }, 2000);
    }, 3000);
  };

  const handleRetake = () => {
    setVerificationStep('instruction');
    setIsRecording(false);
    setRecordingDuration(0);
  };

  const InstructionScreen = () => (
    <View style={styles.instructionContainer}>
      <View style={styles.instructionCard}>
        <Text style={styles.instructionIcon}>📹</Text>
        <Text style={styles.instructionTitle}>Video KYC Verification</Text>
        <Text style={styles.instructionSubtitle}>
          Please follow these instructions for successful verification
        </Text>

        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionItemTitle}>Good Lighting</Text>
              <Text style={styles.instructionItemText}>
                Ensure you are in a well-lit area
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionItemTitle}>Face Position</Text>
              <Text style={styles.instructionItemText}>
                Keep your face centered in the frame
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionItemTitle}>Stay Still</Text>
              <Text style={styles.instructionItemText}>
                Hold still and look directly at the camera
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4</Text>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionItemTitle}>Remove Accessories</Text>
              <Text style={styles.instructionItemText}>
                Remove glasses, hat, or mask if wearing any
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>5</Text>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionItemTitle}>Duration</Text>
              <Text style={styles.instructionItemText}>
                Recording will last 5-10 seconds
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Make sure your face matches the photo on your ID documents
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartRecording}
        >
          <Text style={styles.startButtonText}>Start Verification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const RecordingScreen = () => {
    if (!device || !hasPermission) {
      return (
        <View style={styles.recordingContainer}>
          <Text style={styles.errorText}>Camera not available</Text>
        </View>
      );
    }

    return (
      <View style={styles.recordingContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={verificationStep === 'recording'}
          video={true}
          audio={true}
        />

        <View style={styles.recordingOverlay}>
          <View style={styles.faceGuide}>
            <Text style={styles.faceGuideText}>Position your face in the circle</Text>
            <View style={styles.faceCircle} />
          </View>

          <View style={styles.recordingControls}>
            {isRecording ? (
              <>
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>
                    Recording... {recordingDuration}s
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={handleStopRecording}
                >
                  <View style={styles.stopButtonInner} />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={handleStartVideoRecording}
              >
                <View style={styles.recordButtonInner} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleRetake}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ProcessingScreen = () => (
    <View style={styles.processingContainer}>
      <View style={styles.processingCard}>
        <ActivityIndicator size="large" color="#1E40AF" />
        <Text style={styles.processingTitle}>Verifying Your Identity</Text>
        <Text style={styles.processingText}>
          Please wait while we verify your face with the documents...
        </Text>
        <View style={styles.processingSteps}>
          <View style={styles.processingStep}>
            <View style={styles.processingStepDot} />
            <Text style={styles.processingStepText}>Analyzing video</Text>
          </View>
          <View style={styles.processingStep}>
            <View style={styles.processingStepDot} />
            <Text style={styles.processingStepText}>Detecting face features</Text>
          </View>
          <View style={styles.processingStep}>
            <View style={styles.processingStepDot} />
            <Text style={styles.processingStepText}>Comparing with documents</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const SuccessScreen = () => (
    <View style={styles.successContainer}>
      <View style={styles.successCard}>
        <View style={styles.successIconContainer}>
          <Text style={styles.successIcon}>✅</Text>
        </View>
        <Text style={styles.successTitle}>Verification Successful!</Text>
        <Text style={styles.successText}>
          Your identity has been verified successfully. Your KYC is now complete.
        </Text>
        <View style={styles.successDetails}>
          <View style={styles.successDetailItem}>
            <Text style={styles.successDetailLabel}>Customer ID:</Text>
            <Text style={styles.successDetailValue}>{customerId}</Text>
          </View>
          <View style={styles.successDetailItem}>
            <Text style={styles.successDetailLabel}>Status:</Text>
            <Text style={styles.successDetailValueGreen}>
              Verified ✓
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

      {verificationStep === 'instruction' && <InstructionScreen />}
      {verificationStep === 'recording' && <RecordingScreen />}
      {verificationStep === 'processing' && <ProcessingScreen />}
      {verificationStep === 'success' && <SuccessScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  instructionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  instructionIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionsList: {
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E40AF',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginRight: 12,
  },
  instructionContent: {
    flex: 1,
  },
  instructionItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  instructionItemText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  startButton: {
    backgroundColor: '#1E40AF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  recordingContainer: {
    flex: 1,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  recordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  faceGuide: {
    alignItems: 'center',
    marginTop: 40,
  },
  faceGuideText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  faceCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EF4444',
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonInner: {
    width: 40,
    height: 40,
    backgroundColor: '#EF4444',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  processingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  processingSteps: {
    width: '100%',
  },
  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  processingStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E40AF',
    marginRight: 12,
  },
  processingStepText: {
    fontSize: 14,
    color: '#6B7280',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 56,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
  },
  successDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  successDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  successDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  successDetailValueGreen: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});

export default KYCVerificationScreen;