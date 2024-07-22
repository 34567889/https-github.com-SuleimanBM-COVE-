import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig'; // Ensure this path is correct
import { useRouter } from 'expo-router';

const avatars = [
  { id: '1', imageUrl: require('../../assets/images/Profile.png') },
  { id: '2', imageUrl: require("../../assets/images/Profile.png")},
  // Add more avatars as needed
];

const {height} = Dimensions.get("window");

export default function ProfilePicture() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const storage = getStorage();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage || !currentUserId) return;

    const response = await fetch(selectedImage);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile_pictures/${currentUserId}.jpg`);
    
    try {
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(firestore, 'userDetails', currentUserId), {
        profilePicture: downloadURL
      });

      Alert.alert("Profile picture updated successfully!");
      router.push("./(nav)");
    } catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert("Error uploading image.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{top: 150}}>
        <Text style={styles.header}>Choose profile picture</Text>
        
        <View style={styles.profileCircle}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.addIcon} />
          ) : (
            <Image style={styles.addIcon} source={require("../../assets/images/BlackLogo.png")} />
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={pickImage}
          >
            <Image style={styles.addButtonIcon} source={require("../../assets/images/add plus Large.png")} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.subHeader}>or choose a Cove avatar</Text>
        <FlatList
          data={avatars}
          keyExtractor={(item) => item.id}
          numColumns={4}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.avatarCircle}>
              <Image style={styles.avatarImage} source={item.imageUrl} />
            </TouchableOpacity>
          )}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.nextButton} onPress={uploadImage}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={() => router.push("./(nav)")}>
            <Text style={styles.skipText}>skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: "center",
    top: 30,
    backgroundColor: '#efefef',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  profileCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  addIcon: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  addButton: {
    height: 40,
    width: 40,
    backgroundColor: '#800000',
    borderRadius: 50,
    alignItems: "center",
    justifyContent: 'center',
    position: 'absolute',
    left: 160,
    bottom: 120,
  },
  addButtonIcon: {
    height: 20,
    width: 20,
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  avatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  buttonContainer: {
    bottom: 220,
    gap: 5,
  },
  nextButton: {
    backgroundColor: '#8B0000',
    width: 320,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: "center",
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  skipButton: {
    width: 320,
    height: 50,
    borderColor: "#800000",
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: "center",
  },
  skipText: {
    color: '#8B0000',
    fontSize: 16,
  },
});
