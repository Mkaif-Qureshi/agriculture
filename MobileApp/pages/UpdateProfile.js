import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Keyboard } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { theme } from '../theme.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { BACKEND_URL } from '../backendConfig';

const API_URL = `${BACKEND_URL}`;

const UpdateProfile = () => {
  const [userData, setUserData] = useState({
    bio: "",
    email: "",
    gender: "",
    phoneNo: "",
    profilePic: "",
    role: "",
    username: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: ""
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [token, setToken] = useState(null);
  
  // Create a ref to store form data temporarily while editing
  const formDataRef = useRef({...userData});

  async function getLoggedInUserDetails() {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('token');
      setToken(userToken);
      
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        formDataRef.current = {...parsedUser}; // Initialize form data ref
        console.log(parsedUser);
      } else {
        console.log('No user found');
      }
    } catch (error) {
      console.error('Error reading user from AsyncStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle input changes without updating main state during editing
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      formDataRef.current = {
        ...formDataRef.current,
        [parent]: {
          ...formDataRef.current[parent],
          [child]: value
        }
      };
    } else {
      formDataRef.current = {
        ...formDataRef.current,
        [field]: value
      };
    }
  };

  const handleSaveProfile = async () => {
      try {
          setIsLoading(true);
          console.log("one")
      
      // Update main state with form data before saving
      setUserData(formDataRef.current);
      
      // Send updated profile data to the backend
      console.log(`${BACKEND_URL}/users/profile`)
      const response = await axios.put(
        `${BACKEND_URL}/users/profile`,
        formDataRef.current,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Update local storage with updated user data
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user || formDataRef.current));
        setUserData(response.data.user || formDataRef.current);
        
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        throw new Error(response.data?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImageToBackend = async (uri) => {
    try {
      // Create form data for the upload
      const formData = new FormData();
      
      // Get file name and type from URI
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Add file to form data
      formData.append('profileImage', {
        uri: uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });
      
      // Send to your backend API
      const response = await axios.post(
        `${API_URL}/upload/profile-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.imageUrl) {
        formDataRef.current.profilePic = response.data.imageUrl;
        return response.data.imageUrl;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.7,
    };
  
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('Image Picker Error: ', response.errorMessage);
        alert('Error selecting image');
      } else {
        try {
          setUploading(true);
          const imageUrl = await uploadImageToBackend(response.assets[0].uri);
          // Update both ref and state for immediate UI feedback
          formDataRef.current.profilePic = imageUrl;
          setUserData(prev => ({ ...prev, profilePic: imageUrl }));
        } catch (error) {
          alert("Failed to upload image");
        } finally {
          setUploading(false);
        }
      }
    });
  };

  useEffect(() => {
    getLoggedInUserDetails();
  }, []);

  // Start editing mode - initialize form data ref
  const startEditing = () => {
    formDataRef.current = {...userData};
    setIsEditing(true);
  };

  // Cancel editing - reset form data ref and exit editing mode
  const cancelEditing = () => {
    formDataRef.current = {...userData};
    setIsEditing(false);
    Keyboard.dismiss();
  };

  // ProfileItem component that doesn't re-render on every keystroke
  const ProfileItem = ({ label, field, editable = true }) => {
    // Get the nested value
    const getValue = () => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return isEditing 
          ? (formDataRef.current[parent]?.[child] || '') 
          : (userData[parent]?.[child] || '');
      }
      return isEditing ? (formDataRef.current[field] || '') : (userData[field] || '');
    };
    
    const displayValue = getValue();
    
    return (
      <View style={styles.profileItem}>
        <Text style={styles.label}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={styles.input}
            defaultValue={displayValue.toString()}
            onChangeText={(text) => handleInputChange(field, text)}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <Text style={styles.value}>{displayValue || "Not provided"}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={theme.container}>
      <Header text="Update Profile" />
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <Text>Loading profile details...</Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled" // Important for keyboard persistence
        >
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              {uploading ? (
                <View style={styles.imageUploadingPlaceholder}>
                  <Text>Uploading...</Text>
                </View>
              ) : (
                <>
                  {userData.profilePic ? (
                    <Image source={{ uri: userData.profilePic }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Text style={styles.profileImagePlaceholderText}>
                        {userData.username ? userData.username.charAt(0).toUpperCase() : "U"}
                      </Text>
                    </View>
                  )}
                </>
              )}
              
              {isEditing && (
                <TouchableOpacity style={styles.editImageButton} onPress={pickImage}>
                  <MaterialIcons name="edit" size={18} color={theme.white} />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.username}>{userData.username}</Text>
            <Text style={styles.role}>{userData.role}</Text>
            
            {!isEditing && (
              <TouchableOpacity 
                style={[styles.editButton, { backgroundColor: theme.primary }]}
                onPress={startEditing}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <ProfileItem label="Username" field="username" />
            <ProfileItem label="Email" field="email" />
            <ProfileItem label="Phone" field="phoneNo" />
            <ProfileItem label="Gender" field="gender" />
            <ProfileItem label="Role" field="role" editable={false} />
            <ProfileItem label="Bio" field="bio" />
            
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Location</Text>
            <ProfileItem label="Address" field="location.address" />
            <ProfileItem label="City" field="location.city" />
            <ProfileItem label="State" field="location.state" />
            <ProfileItem label="Country" field="location.country" />
            <ProfileItem label="Pincode" field="location.pincode" />
            
            {isEditing && (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.border }]}
                  onPress={cancelEditing}
                >
                  <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: theme.primary }]}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    color: theme.white,
    fontFamily: theme.font.bold,
  },
  imageUploadingPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: theme.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.white,
  },
  username: {
    fontSize: theme.fs3,
    fontFamily: theme.font.bold,
    color: theme.text,
    marginBottom: 5,
  },
  role: {
    fontSize: theme.fs6,
    fontFamily: theme.font.regular,
    color: theme.text2,
    marginBottom: 20,
  },
  editButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: theme.r2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: theme.white,
    fontFamily: theme.font.bold,
    fontSize: theme.fs6,
  },
  detailsContainer: {
    backgroundColor: theme.card,
    borderRadius: theme.r2,
    padding: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: theme.fs5,
    fontFamily: theme.font.bold,
    color: theme.text,
    marginBottom: 15,
  },
  profileItem: {
    marginBottom: 15,
  },
  label: {
    fontSize: theme.fs7,
    fontFamily: theme.font.bold,
    color: theme.text2,
    marginBottom: 5,
  },
  value: {
    fontSize: theme.fs6,
    fontFamily: theme.font.regular,
    color: theme.text,
    paddingVertical: 8,
  },
  input: {
    fontSize: theme.fs6,
    fontFamily: theme.font.regular,
    color: theme.text,
    backgroundColor: theme.white,
    borderRadius: theme.r3,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 0.48,
    paddingVertical: 12,
    borderRadius: theme.r2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});