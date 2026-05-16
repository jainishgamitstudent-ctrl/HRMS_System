import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useUser } from '../../context/UserContext';
import Header from '../../components/layout/Header';
import { useImagePicker } from '@/hooks/useImagePicker';
import { resolveImageSource } from '@/utils/image';
import { updateEmployeeProfile } from '@/services/auth';
import { UI } from '@/constants/ui';

import { useAppTheme } from '@/context/ThemeContext';
export default function EditProfilePage() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => EditProfileStyles(colors), [colors]);
  const { user, syncUserFromApi } = useUser();
  const [name, setName] = useState(user.name);
  const [designation, setDesignation] = useState(user.role);
  const [department, setDepartment] = useState(user.department);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(
    typeof user.avatar === 'string' ? user.avatar : null
  );
  const [profileImagePayload, setProfileImagePayload] = useState<string | undefined>(
    typeof user.avatar === 'string' ? user.avatar : undefined
  );
  const [isSaving, setIsSaving] = useState(false);

  const { showImagePickerOptions } = useImagePicker();

  const handlePickImage = () => {
    showImagePickerOptions((image) => {
      setAvatarUri(image.uri);
      setProfileImagePayload(image.uploadValue);
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter your full name.');
      return;
    }

    if (phone.trim()) {
      const digitsOnly = phone.trim().replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        Alert.alert('Invalid Phone', 'Mobile number must be exactly 10 digits.');
        return;
      }
    }

    try {
      setIsSaving(true);
      const response = await updateEmployeeProfile({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        department: department.trim(),
        designation: designation.trim(),
        profileImage: profileImagePayload,
      });

      syncUserFromApi({
        _id: response.data.id,
        ...response.data,
        role: response.data.systemRole as any,
        designation: response.data.role,
        profileImage: response.data.avatar,
      });

      Alert.alert('Profile Updated', 'Your profile changes have been saved.');
      router.back();
    } catch (error) {
      Alert.alert('Save Failed', error instanceof Error ? error.message : 'Unable to save your profile right now.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <Header title="Edit Profile" showBack={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <View style={styles.avatarWrap}>
              <Image
                source={resolveImageSource(avatarUri || user.avatar)}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraBtn} onPress={handlePickImage} activeOpacity={0.85}>
                <Ionicons name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.heroTitle}>Keep your details current</Text>
            <Text style={styles.heroSubtitle}>Update your phone, address, role details, and profile picture.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter full name"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter mobile number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, styles.readOnlyInputWrapper]}>
                  <Text style={styles.readOnlyText} numberOfLines={1}>
                    {user.email}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Department</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={department}
                    onChangeText={setDepartment}
                    placeholder="Enter department"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Designation</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={designation}
                    onChangeText={setDesignation}
                    placeholder="Enter designation"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your address"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function EditProfileStyles(colors: any) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 14,
      paddingTop: 20,
      paddingBottom: 44,
    },
    heroCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 14,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarWrap: {
      position: 'relative',
      marginBottom: 10,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: '#e2e8f0',
    },
    cameraBtn: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.surface,
    },
    heroTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
      marginBottom: 3,
    },
    heroSubtitle: {
      fontSize: 11,
      lineHeight: 16,
      color: '#fff',
      textAlign: 'center',
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    twoColumnRow: {
      flexDirection: 'row',
      gap: 8,
    },
    halfWidth: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: 12,
    },
    label: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 5,
      textTransform: 'uppercase',
    },
    inputWrapper: {
      minHeight: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    readOnlyInputWrapper: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.borderLight,
    },
    input: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    readOnlyText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textMuted,
    },
    textAreaWrapper: {
      minHeight: 88,
      paddingVertical: 10,
    },
    textArea: {
      minHeight: 56,
    },
    actions: {
      gap: 10,
      marginTop: 12,
    },
    saveBtn: {
      minHeight: 46,
      borderRadius: 12,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    saveBtnDisabled: {
      opacity: 0.75,
    },
    saveBtnText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    cancelBtn: {
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    cancelBtnText: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: '600',
    },
  });
}
