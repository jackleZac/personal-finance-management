import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/AuthContext';
import { updateBaseCurrency } from '@/api/userApi';
import { UserResponse } from '@/types/types';
import { flagMapping } from '@/assets/flagMapping';
import { SvgProps } from 'react-native-svg';
import Button from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

type FlagMapping = {
  id: number;
  icon: string;
  currency: string;
  country: string;
  source: React.FC<SvgProps>;
};

export default function UpdateBaseCurrency() {
  const params = useLocalSearchParams<{ base_currency?: string }>();
  const router = useRouter();

  const { token, userId } = useAuth();
  const initialCurrency = params.base_currency || 'MYR';
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    flagMapping.some((c: FlagMapping) => c.currency === initialCurrency) ? initialCurrency : 'MYR'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCurrencyChanged, setIsCurrencyChanged] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const searchInputBackground = useThemeColor({}, 'searchInputBackground');

  useEffect(() => {
    setIsCurrencyChanged(selectedCurrency !== initialCurrency);
  }, [selectedCurrency, initialCurrency]);

  const handleUpdateCurrency = async () => {
    if (!isCurrencyChanged) {
      setError('No changes made to base currency');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!token) {
        Alert.alert('Error', 'No authentication token found. Please log in again.', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
        return;
      }

      if (!userId) {
        setError('User ID is missing');
        return;
      }

      const updatedData = { base_currency: selectedCurrency };

      const response: UserResponse = await updateBaseCurrency(token, userId, updatedData);

      if (response.status === 200) {
        Alert.alert('Success', 'Base currency updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        setError(response.message || 'Failed to update base currency');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the base currency');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrencyItem = ({ item }: { item: FlagMapping }) => {
    const FlagComponent = item.source;
    return (
      <TouchableOpacity
        style={[styles.currencyItem, { borderBottomColor: borderColor }]}
        onPress={() => {
          setSelectedCurrency(item.currency);
          setModalVisible(false);
        }}
      >
        <View style={styles.iconContainer}>
          {FlagComponent ? (
            <FlagComponent width={30} height={20} />
          ) : (
            <Text style={[styles.fallbackIcon, { color: iconColor }]}>?</Text>
          )}
        </View>
        <Text style={[styles.currencyItemText, { color: textColor }]}>
          {`${item.currency} - ${item.country.charAt(0).toUpperCase() + item.country.slice(1)}`}
        </Text>
      </TouchableOpacity>
    );
  };

  const currentCurrency = flagMapping.find((c: FlagMapping) => c.currency === selectedCurrency);
  const currentCurrencyLabel = currentCurrency
    ? `${currentCurrency.currency} - ${currentCurrency.country.charAt(0).toUpperCase() + currentCurrency.country.slice(1)}`
    : 'Select Currency';
  const CurrentFlagComponent = currentCurrency ? currentCurrency.source : null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Update Base Currency" variant="back" />
      <View style={styles.formContainer}>
        {/* Base Currency Section */}
        <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Base Currency</Text>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: iconColor }]}>Selected Currency</Text>
            <TouchableOpacity
              style={[styles.pickerContainer, { backgroundColor: searchInputBackground }]}
              onPress={() => setModalVisible(true)}
            >
              <View style={styles.pickerContent}>
                {CurrentFlagComponent && (
                  <CurrentFlagComponent width={30} height={20} />
                )}
                <Text style={[styles.pickerText, { color: textColor }]}>{currentCurrencyLabel}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Update Button */}
        <Button
            onPress={handleUpdateCurrency}
            title={'Save'}
            buttonType="create"
            disabled={loading}
        />
      </View>

      {/* Modal*/}
      <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: secondaryBackgroundColor }]}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Select Base Currency</Text>
              <FlatList
                data={flagMapping}
                renderItem={renderCurrencyItem}
                keyExtractor={(item: FlagMapping) => item.id.toString()}
                style={styles.currencyList}
              />
            </View>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  section: {
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as 'bold',
    marginBottom: 20,
    textTransform: 'uppercase' as 'uppercase',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase' as 'uppercase',
  },
  pickerContainer: {
    borderRadius: 8,
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    textAlign: 'left',
    marginLeft: 10,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as 'bold',
    textTransform: 'uppercase' as 'uppercase',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    maxHeight: '70%',
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as 'bold',
    marginBottom: 15,
  },
  currencyList: {
    maxHeight: '80%',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  currencyItemText: {
    fontSize: 16,
    marginLeft: 10,
  },
  iconContainer: {
    marginRight: 15,
  },
  fallbackIcon: {
    fontSize: 24,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold' as 'bold',
  },
});