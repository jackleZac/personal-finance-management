import React from 'react';
import { Alert, View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/AuthContext';
import { getGenericIcon } from '@/assets/genericIconsMapping';

interface HeaderProps {
  title: string;
  variant?: 'home' | 'simple' | 'back' | 'backModal' | 'closeModal';
  onCreatePress?: () => void;
  onEditPress?: () => void;
  onCloseModalPress?: () => void;
  onBackModalPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  variant = 'simple', 
  onCreatePress, 
  onEditPress, 
  onCloseModalPress, 
  onBackModalPress }) => {
  const insets = useSafeAreaInsets();
  // Theme colors
  const HeaderBackgroundColor = useThemeColor({}, 'headerNavBackground');
  const iconColor = useThemeColor({}, 'icon');

  // Auth context
  const router = useRouter();

  // Retrieve the generic icon for the header
  const AddIcon = getGenericIcon('Add Icon')[0]?.source;
  const EditIcon = getGenericIcon('Pen Circle Icon')[0]?.source;
  const CloseIcon = getGenericIcon('Cancel Icon')[0]?.source;
  const LeftChevron = getGenericIcon('Left Chevron Icon')[0]?.source;
  const AngleLeft = getGenericIcon('Angle Left Icon')[0]?.source;
  const BellIcon = getGenericIcon('Bell Icon')[0]?.source;

  // Base styles common to all variants
  const baseStyles = {
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: HeaderBackgroundColor,
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Conditional styles based on variant
  const conditionalStyles = {
    ...(variant === 'home' || variant === 'simple' || variant === 'back'
      ? {}
      : { borderTopLeftRadius: 20, borderTopRightRadius: 20 }),
    ...(variant === 'backModal' || variant === 'closeModal'
      ? {}
      : { paddingTop: insets.top }),
  };

  // Fetch auth context
  const { userId, token, name, logout } = useAuth();

  return (
    <View
      style={[
        styles.header,
        baseStyles,
        conditionalStyles,
      ]}
    >
      {variant === 'back' ? (
        <>
          <TouchableOpacity onPress={() => router.back()}>
            <AngleLeft width={24} height={24} fill={iconColor}/>
          </TouchableOpacity>
          <ThemedText type="h3" style={styles.backTitle}>
            {title}
          </ThemedText>
          {onEditPress ? (
            <TouchableOpacity style={styles.iconButton} onPress={onEditPress}>
              <EditIcon width={28} height={28} fill="#3C8CE7" />
            </TouchableOpacity>
          ) : (
            <View style={styles.menuPlaceholder} />
          )}
          {variant === 'back' && onCreatePress && (
            <TouchableOpacity style={styles.iconButton} onPress={onCreatePress}>
              <AddIcon width={28} height={28} fill="#3C8CE7"/>
            </TouchableOpacity>
          )}
        </>
      ) : variant === 'backModal' ? (
        <>
          <TouchableOpacity onPress={onBackModalPress}>
            <LeftChevron width={28} height={28} fill="#cccccc"/>
          </TouchableOpacity>
          <ThemedText type="h3" style={styles.backTitle}>
            {title}
          </ThemedText>
          <View style={styles.menuPlaceholder} />
          {onCreatePress && (
            <TouchableOpacity onPress={onCreatePress}>
              <AddIcon width={28} height={28} fill="#3C8CE7" />
            </TouchableOpacity>
          )}
        </>
      ) : variant === 'closeModal' ? (
        <>
          <TouchableOpacity onPress={onCloseModalPress}>
            <View style={styles.closeButton}>
              <CloseIcon width={28} height={28} fill="#cccccc"/>
            </View>
          </TouchableOpacity>
          <ThemedText type="h3" style={styles.backTitle}>
            {title}
          </ThemedText>
          <View style={styles.menuPlaceholder} />
          {onCreatePress && (
            <TouchableOpacity onPress={onCreatePress}>
              <AddIcon width={28} height={28} fill="#3C8CE7" />
            </TouchableOpacity>
          )}
        </>
      ) : (
        <>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          <View style={styles.iconContainer}>
            {variant === 'home' && (
              <>
                <TouchableOpacity 
                  style={styles.iconButton}
                  onPress={() => router.push('/notification')}
                >
                  <BellIcon width={24} height={24} fill="#1db8e7ff"/>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.profileIcon}
                  onPress={handleLogout}
                >
                  {
                    token && userId && name ? (
                      <Text style={styles.profileText}>
                        {name?.charAt(0).toUpperCase()}
                      </Text>
                    ) : (
                      <Text style={styles.profileText}>?</Text>
                    )
                  }
                </TouchableOpacity>
              </>
            )}
            {variant === 'simple' && onCreatePress && (
              <TouchableOpacity style={styles.iconButton} onPress={onCreatePress}>
                <AddIcon width={28} height={28} fill="#3C8CE7"/>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 108,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    borderRadius: 100,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  backTitle: {
    flex: 1,
    marginHorizontal: 'auto',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuPlaceholder: {
    width: 24,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0a788eff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontFamily: 'NotoSansGeorgian-Regular',
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default Header;