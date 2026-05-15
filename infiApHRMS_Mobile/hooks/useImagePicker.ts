import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export type PickedImage = {
  uri: string;
  uploadValue: string;
};

export const useImagePicker = () => {
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (libraryStatus !== 'granted' || cameraStatus !== 'granted') {
        Alert.alert(
          'Permissions Required', 
          'Sorry, we need camera and library permissions to make this work!'
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const toPickedImage = (asset: ImagePicker.ImagePickerAsset): PickedImage => {
    const mimeType = asset.mimeType || 'image/jpeg';
    const uploadValue = asset.base64
      ? `data:${mimeType};base64,${asset.base64}`
      : asset.uri;

    return {
      uri: asset.uri,
      uploadValue,
    };
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      return toPickedImage(result.assets[0]);
    }
    return null;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      return toPickedImage(result.assets[0]);
    }
    return null;
  };

  const showImagePickerOptions = async (onImagePicked: (image: PickedImage) => void) => {
    Alert.alert(
      'Select Photo',
      'Choose an option to upload your profile photo',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const image = await takePhoto();
            if (image) onImagePicked(image);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const image = await pickImage();
            if (image) onImagePicked(image);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return {
    pickImage,
    takePhoto,
    showImagePickerOptions,
  };
};
