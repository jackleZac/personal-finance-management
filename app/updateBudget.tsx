import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, ActivityIndicator, Alert, Switch, Keyboard, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import { updateBudget, deleteBudget } from '@/api/budgetApi';
import Header from '@/components/Header';
import { BudgetType } from '@/types/types';
import { Picker } from '@react-native-picker/picker';
import Button from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function UpdateBudget() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { token, userId } = useAuth();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const searchInputBackground = useThemeColor({}, 'searchInputBackground');

  // Budget details from params
  const budgetId = params.budget_id as string;
  const [budgetLimit, setBudgetLimit] = useState<string>(params.budget_limit as string || '0');
  const [type, setType] = useState<BudgetType>((params.type as BudgetType) || BudgetType.Needs);
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(
    params.notification_enabled === 'true'
  );
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const categoryId = params.category_id as string;
  const spentAmount = params.spent_amount as string;
  const status = params.status as string;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!budgetId || !categoryId || !params.budget_limit) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Header title="Edit Budget" variant="back" />
        <Text style={{ color: textColor }}>Error: Missing budget details</Text>
      </View>
    );
  }

  const handleUpdateBudget = async () => {
    if (isNaN(parseFloat(budgetLimit)) || parseFloat(budgetLimit) <= 0) {
      setError('Budget limit must be a valid positive number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (typeof token !== 'string' || typeof userId !== 'string') {
        throw new Error('User not authenticated');
      }

      // Format created_at to MySQL-compatible datetime (remove T and Z)
      const originalCreatedAt = params.created_at as string || new Date().toISOString();
      const formattedCreatedAt = originalCreatedAt.replace('T', ' ').replace('Z', '');

      const budgetData = {
        budget_id: parseInt(budgetId, 10),
        user_id: parseInt(userId, 10),
        category_id: parseInt(categoryId, 10),
        budget_limit: parseFloat(budgetLimit),
        spent_amount: parseFloat(spentAmount || '0'),
        type,
        notification_enabled: notificationEnabled,
        status: status || 'active',
        created_at: formattedCreatedAt,
        updated_at: new Date().toISOString().replace('T', ' ').replace('Z', ''),
      };

      await updateBudget(token, parseInt(budgetId, 10), budgetData);
      Alert.alert('Success', 'Budget updated successfully');
      router.back();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to update budget: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = () => {
    if (!token || !userId) {
      Alert.alert('Error', 'Authentication details missing');
      return;
    }

    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete this budget? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              setError('');
              await deleteBudget(token, parseInt(budgetId, 10));
              Alert.alert('Success', 'Budget deleted successfully', [
                { text: 'OK', onPress: () => router.replace('/budgetsList') },
              ]);
            } catch (err: unknown) {
              const errorMessage = err instanceof Error ? err.message : 'Unknown error';
              setError(`Failed to delete budget: ${errorMessage}`);
            } finally {
              setLoading(false);
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
          <Header title="Edit Budget" variant="back" />
          <View style={styles.formContainer}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Budget Limit Input */}
            <Text style={[styles.label, { color: textColor }]}>Budget Limit</Text>
            <TextInput
              style={[styles.input, { 
                borderColor: borderColor, 
                backgroundColor: searchInputBackground,
                color: textColor 
              }]}
              value={budgetLimit}
              onChangeText={setBudgetLimit}
              placeholder="Enter budget limit"
              placeholderTextColor={iconColor}
              keyboardType="numeric"
            />

            {/* Budget Type Display */}
            <Text style={[styles.label, { color: textColor }]}>Budget Type</Text>
            <TouchableOpacity 
              style={[styles.input, { 
                borderColor: borderColor, 
                backgroundColor: searchInputBackground 
              }]} 
              onPress={() => setShowPicker(true)}
            >
              <Text style={{ color: textColor }}>{type}</Text>
            </TouchableOpacity>

            {/* Notification Switch */}
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: textColor }]}>Enable Notifications</Text>
              <Switch
                value={notificationEnabled}
                onValueChange={setNotificationEnabled}
                trackColor={{ false: borderColor, true: '#007AFF' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.buttonContainer}>
              {/* Delete Button */}
              <Button
                onPress={handleDeleteBudget}
                title="Delete"
                buttonType="delete"
                disabled={loading}
              />

              {/* Confirm Button */}
              <Button
                onPress={handleUpdateBudget}
                  title="Save"
                  buttonType="update"
                  disabled={loading}
                />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Modal for Budget Type Picker */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPicker}
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: secondaryBackgroundColor }]}>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => {
                setType(itemValue as BudgetType);
                setShowPicker(false);
              }}
              style={[styles.picker, { color: textColor }]}
            >
              <Picker.Item label="Needs" value={BudgetType.Needs} />
              <Picker.Item label="Wants" value={BudgetType.Wants} />
              <Picker.Item label="Savings" value={BudgetType.Savings} />
            </Picker>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  picker: {
    height: 250,
    width: '100%',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});