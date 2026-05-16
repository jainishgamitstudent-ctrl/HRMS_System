import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@/context/UserContext';
import { useAppTheme } from '@/context/ThemeContext';
import {
  clearPendingTwoFactorChallenge,
  signInUser,
  storeAuthSession,
  storePendingTwoFactorChallenge,
} from '../../services/auth';

export default function SignIn() {
  const { syncUserFromApi } = useUser();
  const { colors } = useAppTheme();
  const styles = useMemo(() => ThemedStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert('Missing Info', 'Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Missing Info', 'Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await clearPendingTwoFactorChallenge();
      const response = await signInUser({
        email: normalizedEmail,
        password,
      });

      if (response.require2FA) {
        if (!response.userId) {
          Alert.alert('Sign In Failed', 'The server did not return a valid verification challenge.');
          return;
        }

        await storePendingTwoFactorChallenge({
          email: normalizedEmail,
          userId: response.userId,
        });

        router.replace({
          pathname: '/(auth)/two-factor-auth',
          params: { email: normalizedEmail },
        });
        return;
      }

      if (!response.token || !response.user || !response.role) {
        Alert.alert('Sign In Failed', 'The server did not return a valid login session.');
        return;
      }

      await storeAuthSession({
        token: response.token,
        role: response.role,
        user: response.user,
      });

      syncUserFromApi(response.user);
      const normalizedRole = (response.role || '').toString().trim().toLowerCase();
      if (normalizedRole === 'admin' || normalizedRole === 'main_admin' || normalizedRole === 'superadmin') {
        router.replace('/(admin)' as any);
      } else {
        router.replace('/(employee)');
      }
    } catch (error) {
      Alert.alert('Sign In Failed', error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={{ marginTop: 4 }} />
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Enter your credentials to access your{'\n'}enterprise dashboard
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.inputPlaceholder} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@company.com"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Password</Text>
                <Link href="/(auth)/forgot-password" asChild>
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </TouchableOpacity>
                </Link>
              </View>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.inputPlaceholder} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="........"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.inputPlaceholder} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={20}
                color={rememberMe ? colors.primary : colors.inputPlaceholder}
              />
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, isSubmitting && styles.signInButtonDisabled]}
              onPress={handleSignIn}
              activeOpacity={0.8}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 20 }} />

            <View style={styles.cardFooter}>
              <Text style={styles.noAccountText}>Don’t have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text style={styles.createAccountText}>Create an account</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.inputPlaceholder} />
              <Text style={styles.badgeText}>ENTERPRISE SECURE</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="cloud-done-outline" size={16} color={colors.inputPlaceholder} />
              <Text style={styles.badgeText}>99.9% UPTIME</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ThemedStyles(colors: any) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      padding: 24,
      justifyContent: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      marginTop: Platform.OS === 'ios' ? 40 : 20,
      marginLeft: -24,
    },
    headerLogo: {
      width: 150,
      height: 45,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 0,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
      marginBottom: 30,
      marginTop: 20,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 28,
    },
    inputGroup: {
      marginBottom: 20,
      zIndex: 10,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
    },
    roleSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 12,
      backgroundColor: colors.primaryBg,
      height: 52,
      paddingHorizontal: 16,
    },
    roleSelectorLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    roleSelectorText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
    },
    roleDropdown: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
      overflow: 'hidden',
    },
    roleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderLight,
    },
    roleOptionActive: {
      backgroundColor: colors.primaryBg,
    },
    roleOptionText: {
      fontSize: 15,
      color: colors.textMuted,
      fontWeight: '500',
    },
    roleOptionTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    passwordHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    forgotPassword: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      backgroundColor: colors.inputBg,
      height: 52,
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.inputText,
      height: '100%',
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    rememberMeText: {
      marginLeft: 8,
      fontSize: 14,
      color: colors.textSecondary,
    },
    signInButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      marginBottom: 24,
    },
    signInButtonDisabled: {
      opacity: 0.75,
    },
    signInText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '700',
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      marginHorizontal: 12,
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '500',
    },
    socialContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      height: 52,
      marginHorizontal: 6,
    },
    socialText: {
      marginLeft: 8,
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    cardFooter: {
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: 20,
      marginHorizontal: -24,
      backgroundColor: colors.surfaceAlt,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    noAccountText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    createAccountText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    badgesContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 24,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    badgeText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
      letterSpacing: 0.5,
    },
  });
}
