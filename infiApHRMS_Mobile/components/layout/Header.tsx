import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '../../context/SidebarContext';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  backIconName?: keyof typeof Ionicons.glyphMap;
  hideLogo?: boolean;
  hideSidebar?: boolean;
}

const Header = ({ title, subtitle, showBack, onBackPress, rightElement, backIconName, hideLogo, hideSidebar }: HeaderProps) => {
  const { openSidebar } = useSidebar();
  const { colors } = useAppTheme();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      height: 60,
    },
    leftSection: {
      width: 80,
      alignItems: 'flex-start',
    },
    centerSection: {
      flex: 1,
      alignItems: 'center',
    },
    rightSection: {
      width: 80,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
    },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerLogo: {
      width: 55,
      height: 40,
    },
    titleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '600',
      marginTop: 0,
    },
  }), [colors]);

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconBtn} activeOpacity={0.75}>
              <Ionicons name={backIconName || "chevron-back"} size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : !hideLogo ? (
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          ) : <View style={{ width: 24 }} />}
        </View>

        <View style={styles.centerSection}>
          {title ? (
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
              {subtitle ? <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text> : null}
            </View>
          ) : null}
        </View>

        <View style={styles.rightSection}>
          {rightElement}
          {!hideSidebar && (
            <TouchableOpacity onPress={openSidebar} style={styles.iconBtn} activeOpacity={0.75}>
              <Ionicons name="menu-outline" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
