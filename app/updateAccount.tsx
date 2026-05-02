import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import { updateAccount, deleteAccount } from '@/api/accountApi';
import Header from '@/components/Header';
import { AccountType } from '@/types/types';
import Button from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function UpdateAccount() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, userId } = useAuth();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const searchInputBackground = useThemeColor({}, 'searchInputBackground');

  // Account details from params
  const accountId = params.accountId as string;
  const [name, setName] = useState<string>(params.accountName as string || '');
  const [currency, setCurrency] = useState<string>(params.currency as string || 'MYR');
  const [targetAmount, setTargetAmount] = useState<string>(params.targetAmount as string || '0');
  const balance = parseFloat(params.balance as string) || 0;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!accountId || !params.accountName || !params.balance) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Header title="Edit Account" variant="back" />
        <Text style={{ color: textColor }}>Error: Missing account details</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Account name is required');
      return;
    }
    if (isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) < 0) {
      setError('Target amount must be a valid number');
      return;
    }
    if (!currency.trim()) {
      setError('Currency is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (typeof token !== 'string' || typeof userId !== 'string') {
        throw new Error('User not authenticated');
      }

      const accountData = {
        account_id: parseInt(accountId, 10),
        user_id: parseInt(userId),
        currency: currency.trim(),
        name: name.trim(),
        type: AccountType.Cash, // type is not editable
        balance,
        target_amount: parseFloat(targetAmount),
      };

      await updateAccount(token, parseInt(accountId, 10), accountData);
      Alert.alert('Success', 'Account updated successfully');
      router.back();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to update account: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (typeof token !== 'string' || typeof userId !== 'string') {
                throw new Error('User not authenticated');
              }
              await deleteAccount(token, parseInt(accountId, 10));
              router.replace('/home'); // Navigate back to home
            } catch (error: unknown) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              console.error('Error deleting account:', errorMessage);
              Alert.alert('Error', `Failed to delete account: ${errorMessage}`);
            }
          },
        },
      ]
    );
  };

  return (
    <>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor }]}>
        <Header title="Edit Account" variant="back" />
        <View style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={[styles.label, { color: textColor }]}>Account Name</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: borderColor, 
              backgroundColor: searchInputBackground,
              color: textColor 
            }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter account name"
            placeholderTextColor={iconColor}
          />
          <Text style={[styles.label, { color: textColor }]}>Currency</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: borderColor, 
              backgroundColor: searchInputBackground,
              color: textColor 
            }]}
            value={currency}
            onChangeText={setCurrency}
            placeholder="Enter currency (e.g., USD)"
            placeholderTextColor={iconColor}
          />
          <Text style={[styles.label, { color: textColor }]}>Target Amount</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: borderColor, 
              backgroundColor: searchInputBackground,
              color: textColor 
            }]}
            value={targetAmount}
            onChangeText={setTargetAmount}
            placeholder="Enter target amount"
            placeholderTextColor={iconColor}
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            {/* Delete Account Button */}
            <Button
              onPress={handleDeleteAccount}
              title="Delete"
              buttonType="delete"
              disabled={loading}
            />

            {/* Save Changes Button */}
            <Button
              onPress={handleSave}
              title="Save"
              buttonType="update"
              disabled={loading || !name.trim() || !currency.trim() || isNaN(parseFloat(targetAmount)) || parseFloat(targetAmount) < 0}
            />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    gap: 12,
    justifyContent: 'space-between',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
});