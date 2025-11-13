// cloudinaryConfig.js - UPDATED with correct preset names

import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'drvvefqs9',
  baseFolder: 'loanmate_docs',
  
  // Upload presets - UPDATED to match your Cloudinary dashboard
  presets: {
    salary_slip: 'salary_preset',      // matches "salary_preset" in your dashboard
    id_proof: 'id_preset',              // matches "id_preset" 
    address_proof: 'address_preset',    // matches "address_preset"
    bank_statement: 'bank_preset',      // matches "bank_preset"
  },
  
  // Folder paths for each document type
  folders: {
    salary_slip: 'loanmate_docs/salary_slip',
    id_proof: 'loanmate_docs/id_proof',
    address_proof: 'loanmate_docs/address_proof',
    bank_statement: 'loanmate_docs/bank_statement',
  },
};

// Get upload URL for document type
export const getUploadUrl = () => {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`;
};

// Upload document to Cloudinary
export const uploadDocumentToCloudinary = async (file, documentType) => {
  try {
    const currentUser = auth().currentUser;
    const userEmail = currentUser?.email || 'unknown';
    const userId = currentUser?.uid || 'unknown';
    
    console.log('🔐 Current user:', userId, userEmail);
    
    // Map document type to Cloudinary config
    const typeMapping = {
      'Salary Slip': 'salary_slip',
      'ID Proof': 'id_proof',
      'Address Proof': 'address_proof',
      'Bank Statement': 'bank_statement',
    };
    
    const cloudinaryType = typeMapping[documentType] || 'salary_slip';
    const uploadPreset = CLOUDINARY_CONFIG.presets[cloudinaryType];
    
    console.log('📋 Document type mapping:', {
      documentType,
      cloudinaryType,
      uploadPreset,
    });

    // Check if upload preset exists
    if (!uploadPreset) {
      throw new Error(`No upload preset found for ${documentType}`);
    }
    
    const formData = new FormData();
    
    // Add file
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.name || `document_${Date.now()}.pdf`,
    });
    
    // Add upload preset
    formData.append('upload_preset', uploadPreset);
    
    // Add folder
    formData.append('folder', CLOUDINARY_CONFIG.folders[cloudinaryType]);
    
    // Add context metadata for tracking
    const context = `user_email=${userEmail}|user_id=${userId}|document_type=${cloudinaryType}|uploaded_at=${new Date().toISOString()}`;
    formData.append('context', context);
    
    // Add tags for easy filtering
    formData.append('tags', `${userId},${cloudinaryType},${documentType}`);
    
    // Add public_id with user info
    const publicId = `${cloudinaryType}_${userId}_${Date.now()}`;
    formData.append('public_id', publicId);
    
    console.log('📤 Uploading to Cloudinary...', {
      url: getUploadUrl(),
      type: cloudinaryType,
      preset: uploadPreset,
      folder: CLOUDINARY_CONFIG.folders[cloudinaryType],
    });
    
    const response = await fetch(getUploadUrl(), {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    
    console.log('📦 Response data:', data);
    
    if (data.secure_url) {
      console.log('✅ Upload successful:', data.secure_url);
      return {
        success: true,
        data: {
          url: data.secure_url,
          publicId: data.public_id,
          assetId: data.asset_id,
          format: data.format,
          resourceType: data.resource_type,
          bytes: data.bytes,
          createdAt: data.created_at,
          context: data.context,
          tags: data.tags,
          folder: data.folder,
        },
      };
    } else {
      // Log the error from Cloudinary
      console.error('❌ Cloudinary error response:', data);
      throw new Error(data.error?.message || 'Upload failed - no URL returned');
    }
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

// Fetch user's documents from AsyncStorage
export const fetchUserDocuments = async () => {
  try {
    const currentUser = auth().currentUser;
    const userId = currentUser?.uid;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    console.log('📋 Fetching documents for user:', userId);
    
    // Get all document keys for this user
    const keys = await AsyncStorage.getAllKeys();
    const userDocKeys = keys.filter(key => key.startsWith(`document_${userId}_`));
    
    if (userDocKeys.length === 0) {
      return {
        success: true,
        documents: [],
      };
    }
    
    // Get all documents
    const documentData = await AsyncStorage.multiGet(userDocKeys);
    const documents = documentData
      .map(([key, value]) => {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error('Error parsing document:', e);
          return null;
        }
      })
      .filter(doc => doc !== null);
    
    console.log(`✅ Found ${documents.length} documents`);
    
    return {
      success: true,
      documents: documents,
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return {
      success: false,
      error: error.message,
      documents: [],
    };
  }
};

// Save document metadata to AsyncStorage (after Cloudinary upload)
export const saveDocumentMetadata = async (documentData) => {
  try {
    const currentUser = auth().currentUser;
    const userId = currentUser?.uid;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Create unique document ID with timestamp
    const timestamp = Date.now();
    const docId = `document_${userId}_${timestamp}`;
    
    // Add additional metadata
    const documentWithMetadata = {
      ...documentData,
      id: docId,
      userId: userId,
      uploadedAt: new Date().toISOString(),
      timestamp: timestamp,
    };
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(docId, JSON.stringify(documentWithMetadata));
    
    console.log('💾 Document metadata saved:', docId);
    console.log('📄 Document data:', documentWithMetadata);
    
    return {
      success: true,
      docId: docId,
      document: documentWithMetadata,
    };
  } catch (error) {
    console.error('Error saving metadata:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete document from AsyncStorage
export const deleteDocumentMetadata = async (docId) => {
  try {
    await AsyncStorage.removeItem(docId);
    console.log('🗑️ Document deleted:', docId);
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get single document by ID
export const getDocumentById = async (docId) => {
  try {
    const docData = await AsyncStorage.getItem(docId);
    if (docData) {
      return {
        success: true,
        document: JSON.parse(docData),
      };
    }
    return {
      success: false,
      error: 'Document not found',
    };
  } catch (error) {
    console.error('Error getting document:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};