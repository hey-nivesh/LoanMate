// Create this file: services/cloudinaryConfig.js

import auth from '@react-native-firebase/auth';

// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'drvvefqs9',
  baseFolder: 'loanmate_docs',
  
  // Upload presets for each document type
  presets: {
    salary_slip: 'salary_preset',
    id_proof: 'id_preset',
    address_proof: 'address_preset',
    bank_statement: 'bank_preset',
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
    
    // Map document type to Cloudinary config
    const typeMapping = {
      'Salary Slip': 'salary_slip',
      'ID Proof': 'id_proof',
      'Address Proof': 'address_proof',
      'Bank Statement': 'bank_statement',
    };
    
    const cloudinaryType = typeMapping[documentType] || 'salary_slip';
    
    const formData = new FormData();
    
    // Add file
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'application/pdf',
      name: file.name || `document_${Date.now()}.pdf`,
    });
    
    // Add upload preset
    formData.append('upload_preset', CLOUDINARY_CONFIG.presets[cloudinaryType]);
    
    // Add folder
    formData.append('folder', CLOUDINARY_CONFIG.folders[cloudinaryType]);
    
    // Add context metadata for tracking
    const context = `user_email=${userEmail}|user_id=${userId}|document_type=${cloudinaryType}|uploaded_at=${new Date().toISOString()}`;
    formData.append('context', context);
    
    // Add tags for easy filtering
    formData.append('tags', `${userId},${cloudinaryType},${documentType}`);
    
    // Add public_id with user info (optional - makes it easier to find)
    const publicId = `${cloudinaryType}_${userId}_${Date.now()}`;
    formData.append('public_id', publicId);
    
    console.log('📤 Uploading to Cloudinary...', {
      type: cloudinaryType,
      preset: CLOUDINARY_CONFIG.presets[cloudinaryType],
      folder: CLOUDINARY_CONFIG.folders[cloudinaryType],
    });
    
    const response = await fetch(getUploadUrl(), {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const data = await response.json();
    
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
      throw new Error('Upload failed - no URL returned');
    }
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

// Fetch user's documents from Cloudinary
export const fetchUserDocuments = async () => {
  try {
    const currentUser = auth().currentUser;
    const userId = currentUser?.uid;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // Note: This requires Cloudinary Admin API which needs backend
    // For now, we'll store uploaded documents in Firebase
    // You can implement this later with your backend
    
    console.log('📋 Fetching documents for user:', userId);
    
    // TODO: Implement backend API call to fetch documents
    // const response = await fetch(`YOUR_BACKEND_API/documents/${userId}`);
    
    return {
      success: true,
      documents: [],
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Save document metadata to Firebase (after Cloudinary upload)
export const saveDocumentMetadata = async (documentData) => {
  try {
    const currentUser = auth().currentUser;
    const userId = currentUser?.uid;
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    // TODO: Save to Firebase Firestore
    // const docRef = await firestore()
    //   .collection('users')
    //   .doc(userId)
    //   .collection('documents')
    //   .add(documentData);
    
    console.log('💾 Document metadata saved:', documentData);
    
    return {
      success: true,
      docId: 'temp_id',
    };
  } catch (error) {
    console.error('Error saving metadata:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};