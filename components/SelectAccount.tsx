import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { Account as AccountType } from '@/types/types';
import { useAuth } from '@/hooks/AuthContext';
import { fetchAccounts } from '@/api/accountApi'; 
import Header from '@/components/Header';
import { getIconsByCurrency } from '@/assets/flagMapping';
import { useThemeColor } from '@/hooks/useThemeColor';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

// ------------------------ SelectAccount Component ------------------------
// Note: SelectAccount is rendered as a modal in CreateTransaction and selectAccount
interface SelectAccountProps {
  onClose: () => void;
  onSelect: (account: AccountType) => void;
}

const SelectAccount: React.FC<SelectAccountProps> = ({ onClose, onSelect }) => {
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, userId } = useAuth();

  // Theme colors
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  const fetchAccountsData = async () => { 
    if (!token || !userId) {
      setError('Authentication details missing');
      return;
    };
    setIsLoading(true);
    try {
      const response = await fetchAccounts(token, 'All');
      // Combine assets and debts, filter out accounts with provider_id
      // Note: provider_id indicates linked accounts from external providers
      const assets = (response.assets || []).filter(
        (account: AccountType) => !account.provider_id
      );
      const debts = (response.debt || []).filter(
        (account: AccountType) => !account.provider_id
      );
      
      // Combine both arrays
      const allAccounts = [...assets, ...debts];
      setAccounts(allAccounts);

    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsData();
  }, [token, userId]);

  // Handle account selection
  const handleSelectAccount = (account: AccountType) => {
    onSelect(account);
    onClose();
  };

  // Render accounts
  const renderAccountItem = ({ item }: { item: AccountType }) => {
    // Get the flag icon based on the currency
    const matchingFlags = getIconsByCurrency(item.currency.toUpperCase());
    
    // This FlagComponent will now be the React component itself
    const FlagComponent = matchingFlags[0].source;

    return (
      <TouchableOpacity style={[styles.accountItem, { backgroundColor: secondaryBackgroundColor }]} onPress={() => handleSelectAccount(item)}>
        <FlagComponent width={24} height={24} />
        <View>
          <View style={styles.accountDetails}>
            <Text style={[styles.accountName, { color: textColor }]}>{item.name}</Text>
            <Text style={[styles.accountType, { color: secondaryTextColor }]}>{item.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  };

  if (isLoading && accounts.length === 0) {
    return (
      <View style={styles.container}>
        <Header 
        title="Select Account" 
        variant="backModal"
        onBackModalPress={onClose} />
        <View style={[styles.formContainer, { justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor }]}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  } else if (error && accounts.length === 0) {
    return (
      <View style={styles.container}>
        <Header 
        title="Select Account" 
        variant="backModal"
        onBackModalPress={onClose} />
        <View style={[styles.formContainer, { justifyContent: 'center', alignItems: 'center', flex: 1, backgroundColor }]}>
          <Text style={styles.errorText}>No accounts available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[ styles.container, { backgroundColor, borderColor } ]}>
      {/* Header */}
      <Header 
        title="Select Account" 
        variant="backModal"
        onBackModalPress={onClose} />

      <View style={styles.formContainer}>
        {/* Loading and Error States */}
        {isLoading && <ActivityIndicator color="#0000ff" />}
        {error && <Text style={styles.errorText}>An error occurred</Text>}

        {/* Render accounts */}
        <FlatList
          data={accounts}
          renderItem={renderAccountItem}
          keyExtractor={(item) => item.account_id.toString()}
          ListEmptyComponent={<Text>No accounts found</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.95,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'visible',
    elevation: 5,
    borderWidth: 1,
  },
  formContainer: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
    borderBottomWidth: 0.2,
    borderBottomColor: '#eee',
    borderRadius: 8,
    marginBottom: 5,
  },
  accountDetails: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountType: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#cccccc',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    alignSelf: 'center',
    marginVertical: 20,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default SelectAccount;