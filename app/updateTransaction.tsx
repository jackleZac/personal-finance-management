import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '@/hooks/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { updateTransaction, deleteTransaction } from '@/api/transactionApi';
import { Transaction, Category, Account, TransactionType } from '@/types/types';
import Header from '@/components/Header';
import Button from '@/components/Button';
import SelectCategory from '@/components/SelectCategory';
import SelectAccount from '@/components/SelectAccount';
import DatePicker from '@/components/DatePicker';
import Modal from 'react-native-modal';
import { months } from '@/utils/dateUtils';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function UpdateTransaction() {
  const params = useLocalSearchParams();
  const transaction = JSON.parse(params.transaction as string) as Transaction;
  const categories = JSON.parse(params.categories as string) as Category[];
  const accounts = JSON.parse(params.accounts as string) as Account[];
  const { userId, token } = useAuth();

  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(transaction.transaction_date);
  const [categoryId, setCategoryId] = useState(transaction.category_id);
  const [accountId, setAccountId] = useState(transaction.account_id);
  const [description, setDescription] = useState(transaction.description || '');
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [isRecurring, setIsRecurring] = useState(transaction.is_recurring);
  const [loading, setLoading] = useState(false);
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [tempDay, setTempDay] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const [tempYear, setTempYear] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState(
    categories.find((cat) => cat.category_id === transaction.category_id)?.name || 'Select category'
  );
  const [selectedAccountName, setSelectedAccountName] = useState(
    accounts.find((acc) => acc.account_id === transaction.account_id)?.name || 'Select account'
  );

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const searchInputBackground = useThemeColor({}, 'searchInputBackground');

  // Initialize temp date values from transaction.transaction_date
  useEffect(() => {
    const dateObj = new Date(transaction.transaction_date);
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date, using current date as fallback');
      const today = new Date();
      setTempDay(today.getDate().toString());
      setTempMonth(months[today.getMonth()]);
      setTempYear(today.getFullYear().toString());
      setDate(today.toISOString().split('T')[0]);
    } else {
      setTempDay(dateObj.getDate().toString());
      setTempMonth(months[dateObj.getMonth()]);
      setTempYear(dateObj.getFullYear().toString());
    }
  }, [transaction.transaction_date]);

  const handleSave = async () => {
    if (!userId || !token) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    if (!categoryId || !accountId) {
      Alert.alert('Error', 'Please select a category and account.');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        account_id: accountId,
        amount: parseFloat(amount),
        date,
        category_id: categoryId,
        description: description || null,
        type,
        currency: transaction.currency,
        is_recurring: isRecurring,
      };

      await updateTransaction(token, userId, transaction.transaction_id, transactionData);
      Alert.alert('Success', 'Transaction updated successfully.', [
        { text: 'OK', onPress: () => { router.back(),  setTimeout(() => router.back(), 100); }},
      ]);
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userId || !token) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteTransaction(token, transaction.transaction_id);
              Alert.alert('Success', 'Transaction deleted successfully.', [
                { text: 'OK', onPress: () => { router.back(),  setTimeout(() => router.back(), 100); }},
              ]);
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Format date for display
  const formatDisplayDate = () => {
    if (!tempDay || !tempMonth || !tempYear) return date;
    return `${parseInt(tempDay)} ${tempMonth} ${tempYear}`;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Update Transaction" variant="back" />
      <View style={styles.container}>
        <ScrollView style={styles.formContainer}>
          {/* Amount */}
          <View style={[styles.card, { backgroundColor: secondaryBackgroundColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Amount</Text>
            <TextInput
              style={[styles.input, { 
                color: textColor, 
                borderColor: borderColor,
                backgroundColor: searchInputBackground
              }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={iconColor}
            />
          </View>

          {/* Date */}
          <View style={[styles.card, { backgroundColor: secondaryBackgroundColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Date</Text>
            <TouchableOpacity
              style={[styles.input, { 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderColor: borderColor,
                backgroundColor: searchInputBackground
              }]}
              onPress={() => setIsDateModalVisible(true)}
            >
              <Text style={[styles.inputText, { color: textColor }]}>{formatDisplayDate()}</Text>
              <View style={styles.iconContainer}>
                <Icon name="calendar-today" size={20} color={iconColor} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Category */}
          <View style={[styles.card, { backgroundColor: secondaryBackgroundColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Category</Text>
            <TouchableOpacity
              style={[styles.input, { 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderColor: borderColor,
                backgroundColor: searchInputBackground
              }]}
              onPress={() => setIsCategoryModalVisible(true)}
            >
              <Text style={[styles.inputText, { color: textColor }]}>{selectedCategoryName}</Text>
              <View style={styles.iconContainer}>
                <Icon name="category" size={20} color={iconColor} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Account */}
          <View style={[styles.card, { backgroundColor: secondaryBackgroundColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Account</Text>
            <TouchableOpacity
              style={[styles.input, { 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                borderColor: borderColor,
                backgroundColor: searchInputBackground
              }]}
              onPress={() => setIsAccountModalVisible(true)}
            >
              <Text style={[styles.inputText, { color: textColor }]}>{selectedAccountName}</Text>
              <View style={styles.iconContainer}>
                <Icon name="account-balance" size={20} color={iconColor} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={[styles.card, { backgroundColor: secondaryBackgroundColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Description</Text>
            <TextInput
              style={[styles.input, { 
                color: textColor, 
                height: 80, 
                textAlignVertical: 'top',
                borderColor: borderColor,
                backgroundColor: searchInputBackground
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description (optional)"
              placeholderTextColor={iconColor}
              multiline
            />
          </View>

          {/* Recurring */}
          <View style={[styles.card, { backgroundColor: secondaryBackgroundColor }]}>
            <View style={styles.recurringRow}>
              <Text style={[styles.label, { color: textColor }]}>Recurring</Text>
              <Switch
                value={isRecurring}
                onValueChange={setIsRecurring}
                trackColor={{ false: borderColor, true: '#0047AB' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </ScrollView>

        {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              onPress={handleDelete}
              title="Delete"
              buttonType="delete"
              disabled={loading}
            />
            <Button
              onPress={handleSave}
              title="Save"
              buttonType="update"
              disabled={loading}
            />
        </View>
      </View>

      {/* Date Picker Modal */}
      <DatePicker
        isVisible={isDateModalVisible}
        onClose={() => setIsDateModalVisible(false)}
        onConfirm={(day, month, year) => {
          setTempDay(day);
          setTempMonth(month);
          setTempYear(year);
          const monthIndex = months.indexOf(month);
          const formattedDate = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
          setDate(formattedDate);
        }}
        initialDay={tempDay}
        initialMonth={tempMonth}
        initialYear={tempYear}
      />

      {/* Category Selection Modal */}
      <Modal
        isVisible={isCategoryModalVisible}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        onBackdropPress={() => setIsCategoryModalVisible(false)}
        style={styles.modal}
      >
        <SelectCategory
          onClose={() => setIsCategoryModalVisible(false)}
          onSelect={(category: Category, iconId: string | null) => {
            setCategoryId(category.category_id);
            setSelectedCategoryName(category.name);
            setType(category.type as TransactionType);
            setIsCategoryModalVisible(false);
          }}
        />
      </Modal>

      {/* Account Selection Modal */}
      <Modal
        isVisible={isAccountModalVisible}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        onBackdropPress={() => setIsAccountModalVisible(false)}
        style={styles.modal}
      >
        <SelectAccount
          onClose={() => setIsAccountModalVisible(false)}
          onSelect={(account: Account) => {
            setAccountId(account.account_id);
            setSelectedAccountName(account.name);
            setIsAccountModalVisible(false);
          }}
        />
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
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 120,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
  },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
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
  iconContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1CA9C9',
    borderRadius: 100,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
});