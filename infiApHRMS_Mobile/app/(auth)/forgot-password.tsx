import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { forgotPassword } from '../../services/auth';
import { useAppTheme } from '@/context/ThemeContext';

export default function ForgotPassword() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => ForgotPasswordStyles(colors), [colors]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendResetLink = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    try {
      setLoading(true);
      await forgotPassword(email.trim());
      setSent(true);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
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

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Reset your password</Text>
            <Text style={styles.subtitle}>
              Enter the email address associated with your account and we’ll send you a link to reset your password.
            </Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="at-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
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

            {sent ? (
              <View style={[styles.button, { backgroundColor: colors.success }]}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>Reset link sent!</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                activeOpacity={0.8}
                onPress={handleSendResetLink}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.card} />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.card} style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Back to Sign In */}
            <View style={styles.backContainer}>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity style={styles.backButton}>
                  <Ionicons name="arrow-back" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.backText}>Back to Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
            {sent && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>
                  If this email exists in our system, a reset link has been sent. Check your inbox (and spam folder).
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/reset-password')}>
                  <Text style={styles.enterTokenLink}>Already have a reset token? Enter it here</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Having trouble? <Text style={styles.footerLink}>Contact support</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ForgotPasswordStyles(colors: any) {
  return StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 30,
    width: '100%',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.card,
    height: 50,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    height: '100%',
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  buttonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '500',
  },
  successBox: {
    marginTop: 16,
    backgroundColor: colors.primaryBg,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.success,
  },
  successText: {
    fontSize: 13,
    color: colors.success,
    lineHeight: 20,
    textAlign: 'center',
  },
  enterTokenLink: {
    marginTop: 10,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
}
