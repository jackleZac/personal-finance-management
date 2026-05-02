import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, Dimensions } from 'react-native';
import { createBudget } from '@/api/budgetApi';
import Modal from 'react-native-modal';
import { useAuth } from '@/hooks/AuthContext';
import { fetchCategories } from '@/api/categoryApi';
import { Category as CategoryType } from '@/types/types';
import SelectCategory from '@/components/SelectCategory';
import OptionItem from '@/components/OptionItem';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

interface CreateBudgetProps {
    onClose: () => void;
};

// --------------------------------- SelectType Component ---------------------------------
interface SelectTypeProps {
    onClose: () => void;
    onSelect: (type: string) => void;
};

const VALID_BUDGET_TYPES = [
    { key: "wants", label: "Wants", icon: "🎉" },
    { key: "needs", label: "Needs", icon: "🏠" },
    { key: "savings", label: "Savings", icon: "💰" }
];

const SelectType: React.FC<SelectTypeProps> = ({ onClose, onSelect }) => {
    // Theme colors
    const backgroundColor = useThemeColor({}, 'background');
    const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');

    return (
        <View style={[styles.modalContainer, { backgroundColor: secondaryBackgroundColor }]}>
            {/* Header */}
            <Header
                title="Select Type"
                variant="backModal"
                onBackModalPress={onClose}
            />

            {/* List of Budget Types */}
            <View style={styles.scrollView}>
                {VALID_BUDGET_TYPES.map(({ key, label, icon }) => (
                    <TouchableOpacity
                        key={key}
                        style={[styles.modalIconItem, { backgroundColor: backgroundColor }]}
                        onPress={() => {
                            onSelect(key); // only return "wants" | "needs" | "savings"
                            onClose();
                        }}
                    >
                        <Text style={[styles.modalIconText, { color: textColor }]}>
                            {icon}  {label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

// --------------------------------- Main CreateBudget Component ---------------------------------
const CreateBudget: React.FC<CreateBudgetProps> = ({ onClose }) => {
    const [amount, setAmount] = useState(0);
    const [categoryId, setCategoryId] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [iconId, setIconId] = useState('')
    const [budgetType, setBudgetType] = useState<'Wants' | 'Needs' | 'Savings'>('Wants');
    const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
    const [isTypeModalVisible, setIsTypeModalVisible] = useState(false);
    const [categories, setCategories] = useState<CategoryType[]>([])
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const {token, userId} = useAuth();

    // Theme colors
    const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'border');

    useEffect(() => {
            const loadData = async () => {
                if (!token || !userId) {
                    setError('User not authenticated');
                    setLoading(false);
                    return;
                }
                try {
                    setLoading(true);
                    setError('');
                    const data = await fetchCategories(token);
                    console.log('Fetched categories:', data.categories);
                    setCategories(data.categories || []);
                } catch (error: any) {
                    console.error('Error fetching categories:', error);
                    setError(`Failed to load categories: ${error.message}`);
                    setCategories([]);
                } finally {
                    setLoading(false);
                }
            };
    
            loadData();
        }, [token, userId]);

    const handleConfirm = async () => {
        // Validate inputs
        if (!amount || amount <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        };
        if (!categoryId) {
            Alert.alert('Error', 'Please select a category');
            return;
        };
        if (!iconId) {
            Alert.alert('Error', 'Please select an icon');
            return;
        };
        if (!budgetType) {
            Alert.alert('Error', 'Please select a type');
            return;
        };

        const budgetData = {
            user_id: userId,
            budget_limit: amount,
            category_id: categoryId,
            icon_id: iconId,
            type: budgetType,
        };

        try {
            const response = await createBudget(token ?? '', userId ?? '', budgetData);
            Alert.alert('Success', 'Budget created successfully');
            setCategoryId('');
        } catch (error) {
            console.error('Error creating budget:', error);
            Alert.alert('Error', 'Failed to create budget. Please try again.');
        } finally {
            setLoading(false);
        };

        onClose();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, { backgroundColor: secondaryBackgroundColor, borderColor }]}>
                {/* Header */}
                <Header
                    title="Create Budget"
                    variant="closeModal"
                    onCloseModalPress={onClose}
                />
                <View style={styles.formContainer}>
                    {/* Amount */}
                    <TextInput 
                        style={[styles.amountText, { color: textColor }]}
                        value={amount.toString()}
                        onChangeText={text => setAmount(Number(text))}
                        keyboardType='numeric'
                        placeholder='0.00'
                        placeholderTextColor={iconColor}
                        returnKeyType='done'
                    />
                    <Text style={[styles.allocationText, { color: iconColor }]}>How much allocation for this budget?</Text>

                    <ScrollView style={styles.scrollView}>
                        {/* Category */}
                        <OptionItem
                            icon="Price Tag Icon"
                            label="Select category"
                            value={categoryName}
                            onPress={() => setIsCategoryModalVisible(true)}
                        />
                        {/* Type */}
                        <OptionItem
                            icon="Pie Chart Icon"
                            label="Select type"
                            value={budgetType}
                            onPress={() => setIsTypeModalVisible(true)}
                        />
                    </ScrollView>
                </View>
                {/* Save button */}
                <Button
                    onPress={handleConfirm}
                    title="Create"
                    buttonType="create"
                    disabled={loading}
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
                        context="budget"
                        onClose={() => setIsCategoryModalVisible(false)}
                        onSelect={(category: CategoryType, icon_id) => {
                            setCategoryId(category.category_id.toString());
                            setCategoryName(category.name.toString());
                            setIconId(icon_id || '');
                        }}
                    />
                </Modal>

                {/* Type Modal */}
                <Modal
                    isVisible={isTypeModalVisible}
                    animationIn="slideInRight"
                    animationOut="slideOutRight"
                    onBackdropPress={() => setIsTypeModalVisible(false)}
                    style={styles.modal}
                >
                    <SelectType
                        onClose={() => setIsTypeModalVisible(false)}
                        onSelect={(type: string) => {
                            if (type === 'wants' || type === 'needs' || type === 'savings') {
                                setBudgetType(type.charAt(0).toUpperCase() + type.slice(1) as 'Wants' | 'Needs' | 'Savings');
                            }
                        }}
                    />
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
};

// --------------------------------- StyleSheet ---------------------------------
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
    amountText: {
        fontSize: 80,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
        marginTop: 6,
    },
    allocationText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 30,
    },
    scrollView: {
        flex: 1,
    },
    confirmButton: {
        backgroundColor: '#246BFD',
        paddingVertical: 16,
        borderRadius: 5,
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContainer: {
        paddingHorizontal: 20,
        height: '95%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalCloseButton: {
        marginRight: 10,
    },
    modalHeaderText: {
        fontSize: 18,
        fontWeight: '500',
    },
    modalIconItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 5
    },
    modalIconText: {
        fontSize: 16,
        marginLeft: 10,
    },
});

export default CreateBudget;