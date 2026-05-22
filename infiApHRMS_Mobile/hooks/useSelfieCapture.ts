/**
 * Enterprise Selfie Capture Hook
 * Handles camera permission, selfie capture, and validation
 * Uses expo-image-picker for cross-platform compatibility
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export type SelfieCaptureResult = {
  uri: string;
  base64?: string;
  width: number;
  height: number;
};

export type SelfieValidation = {
  isValid: boolean;
  message: string;
};

const SELFIE_MIN_WIDTH = 320;
const SELFIE_MIN_HEIGHT = 320;

export const useSelfieCapture = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  /**
   * Request camera permission
   */
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    const { status: existingStatus } = await ImagePicker.getCameraPermissionsAsync();
    if (existingStatus === 'granted') {
      return true;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access to capture a selfie for attendance verification.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => { /* Open app settings */ } },
        ]
      );
      return false;
    }
    return true;
  }, []);

  /**
   * Capture selfie using camera
   */
  const captureSelfie = useCallback(async (): Promise<SelfieCaptureResult | null> => {
    setIsCapturing(true);

    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      const uri = asset.uri ?? '';
      if (!uri) {
        return null;
      }
      const selfieResult: SelfieCaptureResult = {
        uri,
        base64: asset.base64 ?? undefined,
        width: asset.width || 0,
        height: asset.height || 0,
      };

      setPreviewUri(uri);
      return selfieResult;
    } catch (error) {
      Alert.alert('Camera Error', 'Failed to capture selfie. Please try again.');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [requestCameraPermission]);

  /**
   * Validate selfie quality
   */
  const validateSelfie = useCallback((selfie: SelfieCaptureResult): SelfieValidation => {
    if (selfie.width < SELFIE_MIN_WIDTH || selfie.height < SELFIE_MIN_HEIGHT) {
      return {
        isValid: false,
        message: `Selfie resolution too low. Minimum required: ${SELFIE_MIN_WIDTH}x${SELFIE_MIN_HEIGHT}px.`,
      };
    }

    if (!selfie.base64 && !selfie.uri) {
      return {
        isValid: false,
        message: 'Invalid selfie data. Please capture again.',
      };
    }

    return {
      isValid: true,
      message: 'Selfie validation passed.',
    };
  }, []);

  /**
   * Clear preview
   */
  const clearSelfie = useCallback(() => {
    setPreviewUri(null);
  }, []);

  return {
    isCapturing,
    previewUri,
    captureSelfie,
    validateSelfie,
    clearSelfie,
    requestCameraPermission,
  };
};
