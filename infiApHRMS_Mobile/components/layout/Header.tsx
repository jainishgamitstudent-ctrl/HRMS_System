import React from 'react';
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
import { UI } from '@/constants/ui';

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

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={handleBack} style={styles.iconBtn} activeOpacity={0.75}>
              <Ionicons name={backIconName || "chevron-back"} size={24} color="#1e293b" />
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
            </View>
          ) : null}
        </View>

        <View style={styles.rightSection}>
          {rightElement}
          {!hideSidebar && (
            <TouchableOpacity onPress={openSidebar} style={styles.iconBtn} activeOpacity={0.75}>
              <Ionicons name="menu-outline" size={28} color="#1e293b" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: UI.colors.border,
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
    backgroundColor: UI.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: UI.colors.border,
  },
  headerLogo: {
    width: 55,
    height: 40,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: UI.type.section,
    fontWeight: '800',
    color: UI.colors.text,
  },
  headerSubtitle: {
    fontSize: UI.type.tiny,
    color: UI.colors.textMuted,
    fontWeight: '600',
    marginTop: 0,
  },
});

export default Header;
