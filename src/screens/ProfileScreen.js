import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImagePicker from 'react-native-image-crop-picker';
import auth from '@react-native-firebase/auth';

const ProfileScreen = ({ navigation, route }) => {
  const { userData } = route.params || {};
  
  // Dynamic data from Firebase/Auth
  const [userName, setUserName] = useState(userData?.name || 'Ahmad Dorwart');
  const [userEmail] = useState(userData?.email || 'ahmad@example.com');
  const [userId] = useState(userData?.uid || '31654513655');
  const [profileImage, setProfileImage] = useState(userData?.photoURL || null);
  const [uploading, setUploading] = useState(false);
  
  // Cloudinary config
  const CLOUDINARY_CLOUD_NAME = 'drvvefqs9';
  const CLOUDINARY_UPLOAD_PRESET = 'loanmate_avatar'; // Replace with your actual preset name
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  // Static data for now (will be fetched from backend later)
  const [profileStats] = useState({
    subscribers: '1.5k',
    subscribing: '1.2k',
    connected: '250',
    followers: '3.6k',
  });
  
  const [creditScore] = useState(750);
  const [kycStatus] = useState('Verified');
  const [preApprovedAmount] = useState(500000);
  
  const [activeTab, setActiveTab] = useState('Talkie');
  const [activeSectionTab, setActiveSectionTab] = useState('Talkie list');

  // Load user's photo from Firebase on mount
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser?.photoURL) {
      setProfileImage(currentUser.photoURL);
    }
  }, []);

  const handleImagePick = () => {
    Alert.alert(
      'Upload Profile Picture',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => openCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });
      uploadImageToCloudinary(image);
    } catch (error) {
      console.log('Camera error:', error);
    }
  };

  const openGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        compressImageQuality: 0.8,
      });
      uploadImageToCloudinary(image);
    } catch (error) {
      console.log('Gallery error:', error);
    }
  };

  const uploadImageToCloudinary = async (image) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image.path,
        type: image.mime,
        name: `profile_${userId}.jpg`,
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'avatars');
      
      console.log('Uploading to Cloudinary...');
      
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.secure_url) {
        console.log('✅ Upload successful:', data.secure_url);
        
        // Update local state
        setProfileImage(data.secure_url);
        
        // Update Firebase user profile
        const currentUser = auth().currentUser;
        if (currentUser) {
          await currentUser.updateProfile({
            photoURL: data.secure_url,
          });
          console.log('✅ Firebase profile updated');
        }
        
        Alert.alert('Success', 'Profile picture updated successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await navigation.logout();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getKYCStatusColor = () => {
    switch (kycStatus) {
      case 'Verified':
        return '#10b981';
      case 'Pending':
        return '#f59e0b';
      default:
        return '#ef4444';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0a3d2e" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        
        {/* Profile Avatar with Upload */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity 
            onPress={handleImagePick}
            activeOpacity={0.8}
            disabled={uploading}>
            <View style={styles.avatarWrapper}>
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                </View>
              )}
              
              {/* Camera Icon Overlay */}
              <View style={styles.cameraIconContainer}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#0a3d2e" />
                ) : (
                  <Text style={styles.cameraIcon}>📷</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <Text style={styles.userName}>{userName}</Text>
        <View style={styles.userIdContainer}>
          <Text style={styles.userId}>Uid: {userId}</Text>
          <TouchableOpacity>
            <Text style={styles.copyIcon}>📋</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards with Glassmorphism */}
        <View style={styles.statsContainer}>
          <View style={styles.glassCard}>
            <Text style={styles.statNumber}>{profileStats.subscribers}</Text>
            <Text style={styles.statLabel}>Subscribers</Text>
          </View>
          
          <View style={styles.glassCard}>
            <Text style={styles.statNumber}>{profileStats.subscribing}</Text>
            <Text style={styles.statLabel}>Subscribing</Text>
          </View>
          
          <View style={styles.glassCard}>
            <Text style={styles.statNumber}>{profileStats.connected}</Text>
            <Text style={styles.statLabel}>Connected</Text>
          </View>
          
          <View style={styles.glassCard}>
            <Text style={styles.statNumber}>{profileStats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Financial Info Section with Glassmorphism */}
        <View style={styles.financialSection}>
          <Text style={styles.sectionTitle}>Financial Information</Text>
          
          {/* Email */}
          <View style={styles.glassInfoCard}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userEmail}</Text>
          </View>

          {/* Credit Score */}
          <View style={styles.glassInfoCard}>
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.infoLabel}>Credit Score</Text>
                <Text style={[styles.infoValue, styles.creditScore]}>
                  {creditScore}
                </Text>
              </View>
              <View style={styles.scoreIndicator}>
                <Text style={styles.scoreRating}>
                  {creditScore >= 750 ? 'Excellent' : creditScore >= 650 ? 'Good' : 'Fair'}
                </Text>
              </View>
            </View>
          </View>

          {/* KYC Status */}
          <View style={styles.glassInfoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>KYC Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getKYCStatusColor() }]}>
                <Text style={styles.statusText}>{kycStatus}</Text>
              </View>
            </View>
          </View>

          {/* Pre-approved Amount */}
          <View style={styles.glassInfoCard}>
            <Text style={styles.infoLabel}>Pre-Approved Amount</Text>
            <Text style={[styles.infoValue, styles.amountValue]}>
              {preApprovedAmount ? formatCurrency(preApprovedAmount) : 'Not Available'}
            </Text>
            {preApprovedAmount > 0 && (
              <Text style={styles.infoSubtext}>Available for instant loan</Text>
            )}
          </View>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          {['Connections', 'Talkie Pro', 'Wallet', 'My Cards'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section Tabs */}
        <View style={styles.sectionTabsContainer}>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSectionTab === 'Talkie list' && styles.activeSectionTab,
            ]}
            onPress={() => setActiveSectionTab('Talkie list')}>
            <Text style={[
              styles.sectionTabText,
              activeSectionTab === 'Talkie list' && styles.activeSectionTabText,
            ]}>
              Talkie list
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.sectionTab,
              activeSectionTab === 'Community' && styles.activeSectionTab,
            ]}
            onPress={() => setActiveSectionTab('Community')}>
            <Text style={[
              styles.sectionTabText,
              activeSectionTab === 'Community' && styles.activeSectionTabText,
            ]}>
              Community
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Tabs */}
        <View style={styles.contentTabs}>
          {['Talkie 0', 'Story 0', 'Moment 0', 'Group Chat 0'].map((item) => (
            <TouchableOpacity key={item} style={styles.contentTab}>
              <Text style={styles.contentTabText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* No Data Section */}
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>📄</Text>
          <Text style={styles.noDataText}>No Data</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a3d2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0e68c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#f0e68c',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#f0e68c',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0a3d2e',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0e68c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0a3d2e',
  },
  cameraIcon: {
    fontSize: 18,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
  },
  userIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  userId: {
    fontSize: 14,
    color: '#ccc',
    marginRight: 8,
  },
  copyIcon: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    marginHorizontal: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#ccc',
    marginTop: 4,
  },
  financialSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f0e68c',
    marginBottom: 16,
  },
  glassInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoLabel: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  infoSubtext: {
    fontSize: 11,
    color: '#10b981',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f0e68c',
  },
  scoreIndicator: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreRating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f0e68c',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginHorizontal: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: 'rgba(240, 230, 140, 0.2)',
    borderColor: '#f0e68c',
  },
  tabText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#f0e68c',
    fontWeight: '700',
  },
  sectionTabsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 16,
    gap: 12,
  },
  sectionTab: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeSectionTab: {
    backgroundColor: '#f0e68c',
  },
  sectionTabText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  activeSectionTabText: {
    color: '#0a3d2e',
  },
  contentTabs: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contentTabText: {
    fontSize: 13,
    color: '#ccc',
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  noDataText: {
    fontSize: 16,
    color: '#ccc',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
});

export default ProfileScreen;