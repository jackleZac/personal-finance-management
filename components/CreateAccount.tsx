import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    FlatList,
    TouchableWithoutFeedback,
    Keyboard,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '@/hooks/AuthContext';
import { createAccount } from '@/api/accountApi';
import { flagMapping } from '@/assets/flagMapping';
import OptionItem from '@/components/OptionItem';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getGenericIcon } from '@/assets/genericIconsMapping';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

interface CreateAccountProps {
    onClose: () => void;
}

const VALID_ACCOUNT_TYPES = ['cash', 'investment', 'debt'];

// ------------------------ EnterNameModal Component ------------------------
interface EnterNameModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    initialName: string;
}

const EnterNameModal: React.FC<EnterNameModalProps> = ({ isVisible, onClose, onSave, initialName }) => {
    const [name, setName] = useState(initialName);
    
    // Theme colors
    const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'border');
    const searchInputBackground = useThemeColor({}, 'searchInputBackground');

    const handleSave = () => {
        onSave(name);
        onClose();
    };

    return (
        <Modal 
            isVisible={isVisible} 
            animationIn="slideInRight" 
            animationOut="slideOutRight" 
            onBackdropPress={onClose}
            style={styles.modal}
        >
            <View style={[styles.modalContainer, { backgroundColor: secondaryBackgroundColor }]}>
                <Header
                    title="Enter Name"
                    variant="backModal"
                    onBackModalPress={onClose}
                />
                <View style={styles.modalFormContainer}>
                    <TextInput
                        style={[styles.modalInput, { 
                            borderColor: borderColor,
                            backgroundColor: searchInputBackground,
                            color: textColor
                        }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Account Name"
                        placeholderTextColor={iconColor}
                    />
                </View>
                <Button
                    onPress={handleSave}
                    title="Save"
                    buttonType="create"
                />
            </View>
        </Modal>
    );
};

// ------------------------ SelectCurrencyModal Component ------------------------
interface SelectCurrencyModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (currency: string) => void;
    initialCurrency: string;
}

interface FlagItem {
  id: number;
  icon: string;
  currency: string;
  country: string;
  source: any;
}

const SelectCurrencyModal: React.FC<SelectCurrencyModalProps> = ({ isVisible, onClose, onSelect, initialCurrency }) => {
  const [currency, setCurrency] = useState(initialCurrency);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const filterContainerBackground = useThemeColor({}, 'filterContainerBackground');
  const searchInputBackground = useThemeColor({}, 'searchInputBackground');
  
  const filteredCurrencies = flagMapping.filter(
    (item: FlagItem) =>
      item.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCurrency = (selectedCurrency: string) => {
    onSelect(selectedCurrency)
    setCurrency(selectedCurrency);
    onClose();
  };

  const renderCurrencyItem = ({ item }: { item: FlagItem }) => (
    <TouchableOpacity
      style={[styles.currencyItem, { backgroundColor: secondaryBackgroundColor, padding: 12, borderColor, borderRadius: 12, marginBottom: 6 }]}
      onPress={() => handleSelectCurrency(item.currency)}
    >
      <item.source width={30} height={20} style={styles.flagIcon} />
      <Text style={[styles.currencyText, { color: textColor }]}>{`${item.currency} - ${item.country}`}</Text>
      {currency === item.currency && (
        <Icon name="check" size={20} color="#007AFF" style={styles.checkIcon} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={[styles.modalContainer, { backgroundColor }]}>
        <Header
          title="Select Currency"
          variant="backModal"
          onBackModalPress={onClose}
        />
        <View style={{ paddingHorizontal: 24, backgroundColor: filterContainerBackground }}>
            <TextInput
                style={[
                    styles.modalInput, { 
                    borderColor: borderColor,
                    borderWidth: 0,
                    backgroundColor: searchInputBackground,
                    color: textColor
                }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search currency or country (e.g., MYR, Indonesia)"
                placeholderTextColor={iconColor}
            />
        </View>
        <View style={[styles.modalFormContainer, { backgroundColor,  }]}>
            <FlatList
                data={filteredCurrencies}
                renderItem={renderCurrencyItem}
                keyExtractor={(item) => item.id.toString()}
            />
            </View>
      </View>
    </Modal>
  );
};

// ------------------------ EnterTargetAmountModal Component ------------------------
interface EnterTargetAmountModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (targetAmount: number) => void;
    initialTargetAmount: number;
}

const EnterTargetAmountModal: React.FC<EnterTargetAmountModalProps> = ({ isVisible, onClose, onSave, initialTargetAmount }) => {
    const [targetAmount, setTargetAmount] = useState(initialTargetAmount);
    
    // Theme colors
    const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'border');
    const searchInputBackground = useThemeColor({}, 'searchInputBackground');
    
    const handleSave = () => {
        onSave(targetAmount);
        onClose();
    };

    return (
        <Modal 
        isVisible={isVisible} 
        animationIn="slideInRight" 
        animationOut="slideOutRight" 
        onBackdropPress={onClose}
        style={styles.modal}
        >
            <View style={[styles.modalContainer, { backgroundColor: secondaryBackgroundColor }]}>
                <Header
                    title="Enter Target Amount"
                    variant="backModal"
                    onBackModalPress={onClose}
                />
                <View style={styles.modalFormContainer}>
                    <TextInput
                        style={[styles.modalInput, { 
                            borderColor: borderColor,
                            backgroundColor: searchInputBackground,
                            color: textColor
                        }]}
                        value={targetAmount.toString()}
                        onChangeText={text => setTargetAmount(Number(text))}
                        placeholder="0"
                        placeholderTextColor={iconColor}
                        keyboardType="numeric"
                        returnKeyType='done'
                    />
                </View>
                <Button
                    onPress={handleSave}
                    title="Save"
                    buttonType="create"
                />
            </View>
        </Modal>
    );
};

// ------------------------ WriteNoteModal Component ------------------------
interface WriteNoteModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (note: string) => void;
    initialNote: string;
}

const WriteNoteModal: React.FC<WriteNoteModalProps> = ({ isVisible, onClose, onSave, initialNote }) => {
    const [note, setNote] = useState(initialNote);
    
    // Theme colors
    const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'border');
    const searchInputBackground = useThemeColor({}, 'searchInputBackground');

    const handleSave = () => {
        onSave(note);
        onClose();
    };

    return (
        <Modal 
        isVisible={isVisible} 
        animationIn="slideInRight" 
        animationOut="slideOutRight" 
        onBackdropPress={onClose}
        style={styles.modal}
        >
            <View style={[styles.modalContainer, { backgroundColor: secondaryBackgroundColor }]}>
                <Header
                    title="Write Note"
                    variant="backModal"
                    onBackModalPress={onClose}
                />
                <View style={styles.modalFormContainer}>
                    <TextInput
                    style={[styles.modalInput, { 
                        borderColor: borderColor,
                        backgroundColor: searchInputBackground,
                        color: textColor
                    }]}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Write note"
                    placeholderTextColor={iconColor}
                    multiline={true}
                    returnKeyType='done'
                    />
                </View>
                <Button
                    onPress={handleSave}
                    title="Save"
                    buttonType="create"
                />
            </View>
        </Modal>
    );
};

// ------------------------ SelectAccountTypeModal Component ------------------------
interface SelectAccountTypeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (accountType: string) => void;
  initialAccountType: string;
}

interface AccountTypeItem {
  id: string;
  type: string;
  icon: string;
}

const accountTypes: AccountTypeItem[] = [
  { id: '1', type: 'Cash', icon: 'Money Icon' },
  { id: '2', type: 'Investment', icon: 'Stock Icon' },
  { id: '3', type: 'Debt', icon: 'Credit Card Payment Icon' },
];

const SelectAccountTypeModal: React.FC<SelectAccountTypeModalProps> = ({ isVisible, onClose, onSelect, initialAccountType }) => {
  const [accountType, setAccountType] = useState(initialAccountType);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleSelectAccountType = (selectedAccountType: string) => {
    setAccountType(selectedAccountType);
    onSelect(selectedAccountType);
    onClose();
  };

  const renderAccountTypeItem = ({ item }: { item: AccountTypeItem }) => {
    // Get matching icon component
    const CategoryComponent = getGenericIcon(item.icon)[0]?.source;

    return (
        <TouchableOpacity
        style={[styles.accountTypeItem, { backgroundColor: backgroundColor }]}
        onPress={() => handleSelectAccountType(item.type)}
        > 
        <CategoryComponent width={30} height={30} />
        <Text style={[styles.accountTypeText, { color: textColor }]}>{item.type}</Text>
        {accountType === item.type && (
            <Icon name="check" size={20} color="#007AFF" style={styles.checkIcon} />
        )}
        </TouchableOpacity>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={[styles.modalContainer, { backgroundColor: secondaryBackgroundColor }]}>
        <Header 
          title="Select Account Type"
            variant="backModal"
            onBackModalPress={onClose}
        />
        <View style={styles.modalFormContainer}>
          <FlatList
            data={accountTypes}
            renderItem={renderAccountTypeItem}
            keyExtractor={(item) => item.id}
            style={styles.accountTypeList}
            />
        </View>
      </View>
    </Modal>
  );
};

// ------------------------ Main CreateAccount Component ------------------------
interface FastLinkData {
    accessToken: string;
    fastLinkURL: string;
    [key: string]: any;
}

const CreateAccount: React.FC<CreateAccountProps> = ({ onClose }) => {
    const [initialBalance, setInitialBalance] = useState(0);
    const [name, setName] = useState('');
    const [currency, setCurrency] = useState('');
    const [type, setType] = useState('');
    const [targetAmount, setTargetAmount] = useState(0);
    const [note, setNote] = useState('');
    const {token, userId} = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const [isNameModalVisible, setIsNameModalVisible] = useState(false);
    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
    const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
    const [isTargetAmountModalVisible, setIsTargetAmountModalVisible] = useState(false);
    const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);

    // Theme colors
    const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'border');
    const filterContainerBackground = useThemeColor({}, 'filterContainerBackground');

    // Handle manual account creation
    const handleConfirm = async () => {
        const trimmedName = name.trim();
        const trimmedType = type.trim();
        const trimmedCurrency = currency.trim();
        const trimmedNote = note.trim();

        if (!initialBalance || initialBalance < 0) {
            Alert.alert('Error', 'Please enter a valid initial balance');
            return;
        }

        if (!initialBalance && initialBalance <= 0 && type.toLowerCase() === 'investment') {
            Alert.alert('Error', 'Investment accounts must have an initial balance greater than zero');
            return;
        }

        if (!trimmedName) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }
        if (!trimmedType) {
            Alert.alert('Error', 'Please enter an account type');
            return;
        }
        if (!VALID_ACCOUNT_TYPES.includes(trimmedType.toLowerCase())) {
            Alert.alert('Error', `Invalid account type. Must be one of: ${VALID_ACCOUNT_TYPES.join(', ')}`);
            return;
        }
        if (!trimmedCurrency) {
            Alert.alert('Error', 'Please select a currency');
            return;
        }

        const accountData = {
            user_id: userId,
            name: trimmedName,
            type: trimmedType.toLowerCase(),
            currency: trimmedCurrency,
            target_amount: targetAmount,
            balance: initialBalance,
            description: trimmedNote || undefined,
        };

        console.log(accountData);

        if (!token || !userId) {
            Alert.alert('Error', 'Authentication error. Please log in again.');
            setLoading(false);
            return;
        }
        try {
            const response = await createAccount(token, accountData);
            Alert.alert('Success', 'Account created successfully');
            setInitialBalance(0);
            setName('');
            setCurrency('');
            setType('');
            setNote('');
            setTargetAmount(0);
        } catch (error) {
            console.error('Error creating account:', error);
            Alert.alert('Error', 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }

        onClose();
    };

    return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: secondaryBackgroundColor, borderColor }]}>
            <Header 
            title="Create Account" 
            variant='closeModal' 
            onCloseModalPress={onClose}
            />
            <View style={styles.formContainer}>
                <TextInput
                    style={[styles.balance, { color: textColor }]}
                    value={initialBalance.toString()}
                    onChangeText={text => setInitialBalance(Number(text))}
                    keyboardType='numeric'
                    placeholder='0.00'
                    placeholderTextColor={iconColor}
                    returnKeyType='done'
                />
                <Text style={[styles.enterInitialBalance, { color: iconColor }]}>Enter initial balance</Text>
                <ScrollView style={styles.scrollView}>
                    <OptionItem
                        icon="Writing Icon"
                        label="Enter name"
                        value={name}
                        onPress={() => setIsNameModalVisible(true)}
                    />
                    <OptionItem
                        icon="Dollar Icon"
                        label="Select currency"
                        value={currency}
                        onPress={() => setIsCurrencyModalVisible(true)}
                    />
                    <OptionItem
                        icon="Pie Chart Icon"
                        label="Enter target amount"
                        value={targetAmount > 0 ? targetAmount.toString() : ''}
                        onPress={() => setIsTargetAmountModalVisible(true)}
                    />
                    <OptionItem
                        icon="Writing Icon"
                        label="Write note"
                        value={note}
                        onPress={() => setIsNoteModalVisible(true)}
                    />
                    <OptionItem
                        icon="Pie Chart Icon"
                        label="Select account type"
                        value={type}
                        onPress={() => setIsTypeModalVisible(true)}
                    />
                </ScrollView>

                <Button
                    onPress={handleConfirm}
                    title="Save"
                    buttonType="create"
                />
            </View>
            
            <EnterNameModal
                isVisible={isNameModalVisible}
                onClose={() => setIsNameModalVisible(false)}
                onSave={(newName) => setName(newName)}
                initialName={name}
            />
            <SelectCurrencyModal
                    isVisible={isCurrencyModalVisible}
                    onClose={() => setIsCurrencyModalVisible(false)}
                    onSelect={(newCurrency) => setCurrency(newCurrency)}
                    initialCurrency={currency}
            />
            <EnterTargetAmountModal
                isVisible={isTargetAmountModalVisible}
                onClose={() => setIsTargetAmountModalVisible(false)}
                onSave={(newTargetAmount) => setTargetAmount(newTargetAmount)}
                initialTargetAmount={targetAmount}
            />
            <WriteNoteModal
                isVisible={isNoteModalVisible}
                onClose={() => setIsNoteModalVisible(false)}
                onSave={(newNote) => setNote(newNote)}
                initialNote={note}
            />
            <SelectAccountTypeModal
                isVisible={isTypeModalVisible}
                onClose={() => setIsTypeModalVisible(false)}
                onSelect={(newType) => setType(newType)}
                initialAccountType = {type}
            />
        </View>
    </TouchableWithoutFeedback>
    );
};

// ------------------------ StyleSheet ------------------------
const styles = StyleSheet.create({
    container: {
        height: screenHeight * 0.95,
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
    closeButton: {
        backgroundColor: '#cccccc',
        paddingVertical: 4,
        paddingHorizontal: 4,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fastLinkButton: {
        position: 'absolute', 
        marginTop: 550, 
        alignSelf: 'center', 
        width: '100%'
    },
    headerText: {
        fontSize: 18,
        fontWeight: '500',
    },
    balance: {
        fontSize: 80,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        marginTop: 6,
    },
    enterInitialBalance: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
    },
    scrollView: {
        flex: 1,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        marginLeft: 16,
    },
    optionValue: {
        fontSize: 16,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
        marginTop: 40,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalContainer: {
        height: '100%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalFormContainer: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
    },
    modalButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
    currencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
    },
    flagIcon: {
        marginRight: 10,
    },
    currencyText: {
        fontSize: 16,
        flex: 1,
    },
    checkIcon: {
        marginLeft: 10,
    },
    accountTypeList: {
        maxHeight: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    accountTypeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 5,
    },
    accountTypeText: {
        fontSize: 16,
        flex: 1,
        marginLeft: 12,
    },
    notesInput: {
        fontSize: 16,
        flex: 1,
    },
});

export default CreateAccount;