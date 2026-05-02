import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  Alert, 
  TouchableWithoutFeedback, 
  Keyboard, 
  StyleSheet, 
  Dimensions } from 'react-native';
import { useAuth } from '@/hooks/AuthContext';
import Modal from 'react-native-modal';
import { Account as AccountType, Category as CategoryType } from '@/types/types';
import SelectCategory from '@/components/SelectCategory';
import SelectAccount from '@/components/SelectAccount';
import { createTransaction } from '@/api/transactionApi';
import OptionItem from '@/components/OptionItem';
import Button from '@/components/Button';
import DatePicker from '@/components/DatePicker';
import { months } from '@/utils/dateUtils';
import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

interface CreateTransactionProps {
  onClose: () => void;
}

const CreateTransaction: React.FC<CreateTransactionProps> = ({ onClose }) => {
  const { token, userId } = useAuth();

  // Theme colors
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  // Local state
  const [amount, setAmount] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedAccountName, setSelectedAccountName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [selectedCategoryIcon, setSelectedCategoryIcon] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'expense' | 'income' | ''>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isDateModalVisible, setIsDateModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [tempDay, setTempDay] = useState<string>('');
  const [tempMonth, setTempMonth] = useState<string>('');
  const [tempYear, setTempYear] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<string>('');

  // Set the current date
  useEffect(() => {
    const today = new Date();
    setTempDay(today.getDate().toString());
    setTempMonth(months[today.getMonth()]);
    setTempYear(today.getFullYear().toString());
    setSelectedDate('Today');
  }, []);

  // Convert selected date to ISO 8601
  const getFormattedDateForApi = () => {
    if (selectedDate === 'Today') {
      return new Date().toISOString();
    }
    const monthIndex = months.indexOf(tempMonth);
    const date = new Date(Date.UTC(parseInt(tempYear), monthIndex, parseInt(tempDay)));
    return date.toISOString();
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (!amount || !selectedCategory || !selectedAccount || !selectedType || !selectedCurrency) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!token || !userId) {
      Alert.alert('Error', 'Authentication details are missing. Please log in again.');
      return;
    }

    setIsLoading(true);

    const transactionData = {
      user_id: parseInt(userId),
      account_id: parseInt(selectedAccount),
      category_id: parseInt(selectedCategory),
      amount: amount,
      type: selectedType,
      description: notes || '',
      currency: selectedCurrency,
      transaction_date: getFormattedDateForApi(),
    };

    try {
      await createTransaction(token, transactionData);
      Alert.alert('Success', 'Transaction created successfully!');
      setAmount(0);
      setSelectedAccount('');
      setSelectedAccountName('');
      setSelectedCategory('');
      setSelectedCategoryName('');
      setSelectedCategoryIcon(null);
      setSelectedType('');
      setSelectedCurrency('USD');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to create transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: secondaryBackgroundColor, borderColor }]}>
        <View style={styles.formContainer}>
          <TextInput
            style={[styles.amountInput, { color: textColor }]}
            value={amount.toString()}
            onChangeText={text => setAmount(parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={iconColor}
            returnKeyType="done"
            onFocus={() => console.log('Amount TextInput focused')}
          />
          <Text style={[styles.amountLabel, { color: secondaryTextColor }]}>Amount in account currency</Text>
          <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
            <OptionItem
              icon="Dollar Icon"
              label="Select account"
              value={selectedAccountName}
              onPress={() => setIsAccountModalVisible(true)}
            />
            <OptionItem
              icon="Calendar Icon"
              label="Select date"
              value={selectedDate}
              onPress={() => setIsDateModalVisible(true)}
            />
            <OptionItem
              icon="Price Tag Icon"
              label="Select category"
              value={selectedCategoryName}
              value2={selectedType ? `(${selectedType})` : ''}
              onPress={() => setIsCategoryModalVisible(true)}
            />
            <OptionItem
              icon="Writing Icon"
              label="Notes"
              value={notes}
              onPress={() => {}}
            />
          </ScrollView>
          <Button 
            onPress={handleConfirm} 
            title="Save" 
            buttonType="create" 
            disabled={isLoading}
          />
        </View>

        <Modal
          isVisible={isAccountModalVisible}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          onBackdropPress={() => setIsAccountModalVisible(false)}
          style={styles.subModal}
          backdropColor="black"
          backdropOpacity={0.5}
        >
          <SelectAccount
            onClose={() => setIsAccountModalVisible(false)}
            onSelect={(account: AccountType) => {
              setSelectedAccount(account.account_id.toString());
              setSelectedAccountName(account.name);
              setSelectedCurrency(account.currency);
              setIsAccountModalVisible(false);
            }}
          />
        </Modal>
        <Modal
          isVisible={isCategoryModalVisible}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          onBackdropPress={() => setIsCategoryModalVisible(false)}
          style={styles.subModal}
          backdropColor="black"
          backdropOpacity={0.5}
        >
          <SelectCategory
            onClose={() => setIsCategoryModalVisible(false)}
            onSelect={(category: CategoryType, iconId: string | null) => {
              setSelectedCategory(category.category_id.toString());
              setSelectedCategoryName(category.name);
              setSelectedCategoryIcon(iconId);
              setSelectedType(category.type as 'expense' | 'income');
              setIsCategoryModalVisible(false);
            }}
          />
        </Modal>
        <Modal
          isVisible={isDateModalVisible}
          animationIn="slideInRight"
          animationOut="slideOutRight"
          onBackdropPress={() => setIsDateModalVisible(false)}
          style={styles.subModal}
          backdropColor="black"
          backdropOpacity={0.5}
        >
          <DatePicker
            isVisible={isDateModalVisible}
            onClose={() => setIsDateModalVisible(false)}
            onConfirm={(day, month, year) => {
              setTempDay(day);
              setTempMonth(month);
              setTempYear(year);
              const formattedDate = `${parseInt(day)} ${month} ${year}`;
              setSelectedDate(formattedDate);
            }}
            initialDay={tempDay}
            initialMonth={tempMonth}
            initialYear={tempYear}
          />
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.95,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'visible',
    elevation: 5,
    borderWidth: 1,
  },
  subModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 108,
    paddingBottom: 16,
  },
  amountInput: {
    fontSize: 80,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  amountLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  scrollView: {
    flex: 1,
  },
});

export default CreateTransaction;