import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Platform, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAppTheme } from '@/context/ThemeContext';
import {
  clearPendingTwoFactorChallenge,
  getPendingTwoFactorChallenge,
  resendTwoFactorCode,
  storePendingTwoFactorChallenge,
  storeAuthSession,
  verifyTwoFactorCode,
} from '../../services/auth';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TwoFactorAuth() {
  const { colors } = useAppTheme();
  const styles = useMemo(() => TwoFactorAuthStyles(colors), [colors]);
  const { updateUser, syncUserFromApi } = useUser();
  const params = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState<string>('');
  const [timer, setTimer] = useState(54);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [challengeEmail, setChallengeEmail] = useState<string>('');
  const [pendingUserId, setPendingUserId] = useState<string>('');
  const CODE_LENGTH = 6;

  const dashboardRoute = '/(employee)' as const;
  const dashboardLabel = 'Employee Dashboard';

  const progressWidth = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Initial fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const loadPendingChallenge = async () => {
      const challenge = await getPendingTwoFactorChallenge();
      if (!challenge?.userId) {
        Alert.alert('Session Expired', 'Please sign in again to request a new verification code.');
        router.replace('/(auth)/sign-in');
        return;
      }

      setPendingUserId(challenge.userId);
      setChallengeEmail(challenge.email || String(params.email || ''));
    };

    loadPendingChallenge();
  }, [params.email]);

  // Handle countdown timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0 && !isSuccess) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, isSuccess]);

  const handleKeyPress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'backspace') {
      setCode((prev) => prev.slice(0, -1));
    } else if (code.length < CODE_LENGTH) {
      setCode((prev) => prev + key);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.replace(dashboardRoute);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, dashboardRoute]);

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) return;

    try {
      setIsVerifying(true);
      const response = await verifyTwoFactorCode({
        userId: pendingUserId,
        otp: code,
      });

      await storeAuthSession({
        token: response.token,
        role: response.role,
        user: response.user,
      });
      await clearPendingTwoFactorChallenge();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSuccess(true);
      syncUserFromApi(response.user);
      updateUser({ systemRole: response.role });
      
      Animated.timing(progressWidth, {
        toValue: 100,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();

      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'Unable to verify the code.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!pendingUserId && !challengeEmail) {
      Alert.alert('Session Expired', 'Please sign in again to request a new verification code.');
      router.replace('/(auth)/sign-in');
      return;
    }

    try {
      setIsResending(true);
      const response = await resendTwoFactorCode({
        userId: pendingUserId || undefined,
        email: challengeEmail || undefined,
      });

      await storePendingTwoFactorChallenge({
        email: challengeEmail,
        userId: response.userId,
      });

      setPendingUserId(response.userId);
      setCode('');
      setTimer(54);
      Alert.alert('Code Sent', response.message);
    } catch (error) {
      Alert.alert('Resend Failed', error instanceof Error ? error.message : 'Unable to resend the verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const renderNumpad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.numpadContainer}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numpadRow}>
            {row.map((key, colIndex) => {
              if (key === '') {
                return <View key={`empty-${colIndex}`} style={styles.numpadKey} />;
              }
              
              const isBackspace = key === 'backspace';
              
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.numpadKey}
                  onPress={() => handleKeyPress(key)}
                  activeOpacity={0.6}
                >
                  {isBackspace ? (
                    <Ionicons name="backspace-outline" size={28} color="#4b5563" />
                  ) : (
                    <Text style={styles.numpadText}>{key}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <LinearGradient
          colors={['#f8faff', '#f1f5f9']}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
          <View style={styles.successContent}>
            <View style={styles.successIconOuter}>
              <Animated.View style={[styles.successIconInner, { transform: [{ scale: checkmarkScale }] }]}>
                <Ionicons name="checkmark" size={40} color="#fff" />
              </Animated.View>
            </View>
            
            <Text style={styles.successTitle}>Verified!</Text>
            <Text style={styles.successSubtitle}>
              Authenticating your {dashboardLabel.toLowerCase()} session...
            </Text>

            <View style={styles.roleBadge}>
              <Ionicons name="person" size={14} color="#007AFF" />
              <Text style={styles.roleBadgeText}>Signing in as Employee</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <Animated.View style={[styles.progressBarFill, { width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }) }]} />
            </View>

            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={() => router.replace(dashboardRoute)}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Enter Dashboard</Text>
              <Ionicons name="enter-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <LinearGradient
        colors={['#f1f5ff', '#e2e8f0']}
        style={StyleSheet.absoluteFill}
      />
      
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        {/* Header Icon Section */}
        <View style={styles.headerIconWrapper}>
          <LinearGradient
            colors={['#007AFF', '#007AFF']}
            style={styles.headerIconGradient}
          >
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Secure Login</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent a 6-digit verification code to {challengeEmail || 'your email'}. Please enter it below.
        </Text>
        {/* Code Input Boxes */}
        <View style={styles.codeContainer}>
          {Array.from({ length: CODE_LENGTH }).map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.codeBox, 
                code.length === index && styles.codeBoxActive,
                code.length > index && styles.codeBoxFilled
              ]}
            >
              <Text style={styles.codeText}>
                {code[index] || ''}
              </Text>
              {code.length === index && !isSuccess && (
                <View style={styles.cursor} />
              )}
            </View>
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          style={[styles.verifyButton, (code.length !== CODE_LENGTH || isVerifying) && styles.verifyButtonDisabled]} 
          onPress={handleVerify}
          disabled={code.length !== CODE_LENGTH || isVerifying}
          activeOpacity={0.8}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text style={styles.verifyButtonText}>Verify Account</Text>
              <Ionicons name="finger-print-outline" size={20} color="#fff" style={styles.verifyButtonIcon} />
            </>
          )}
        </TouchableOpacity>

        {/* Resend Code Section */}
        <View style={styles.resendWrapper}>
          <Text style={styles.resendInfo}>Didn’t get code? </Text>
          {timer > 0 ? (
            <Text style={styles.timerInfo}>Wait {timer}s</Text>
          ) : (
            <TouchableOpacity
              disabled={isResending}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleResend();
              }}
            >
              <Text style={[styles.resendAction, isResending && styles.resendActionDisabled]}>
                {isResending ? 'Sending...' : 'Resend Now'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Numpad */}
        {renderNumpad()}

        {/* Elegant Footer with Back Button */}
        <View style={styles.elegantFooter}>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity 
              style={styles.elegantBackButton}
              activeOpacity={0.6}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={styles.backButtonIconCircle}>
                <Ionicons name="chevron-back" size={18} color="#007AFF" />
              </View>
              <Text style={styles.elegantBackButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

function TwoFactorAuthStyles(colors: any) {
  return StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.card,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 36,
    paddingTop: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  headerIconWrapper: {
    marginBottom: 16,
  },
  headerIconGradient: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 26,
    paddingHorizontal: 30,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  codeBox: {
    flex: 1,
    maxWidth: 46,
    height: 58,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  codeBoxActive: {
    borderColor: '#007AFF',
    backgroundColor: colors.card,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  codeBoxFilled: {
    borderColor: '#007AFF',
    backgroundColor: colors.card,
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: '#007AFF',
    position: 'absolute',
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 18,
    height: 56,
    width: SCREEN_WIDTH * 0.8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  verifyButtonDisabled: {
    backgroundColor: '#c7d2fe',
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  verifyButtonIcon: {
    marginLeft: 10,
  },
  resendWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  resendInfo: {
    fontSize: 13,
    color: colors.textMuted,
  },
  timerInfo: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  resendAction: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '700',
  },
  resendActionDisabled: {
    opacity: 0.6,
  },
  numpadContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  numpadKey: {
    width: '30%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadText: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  elegantFooter: {
    width: '100%',
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: colors.background,
    paddingVertical: 18,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
  },
  elegantBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  elegantBackButtonText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    marginBottom: 30,
  },
  roleBadgeText: {
    color: '#5b21b6',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarContainer: {
    width: '85%',
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 40,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  continueButton: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    height: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
}
