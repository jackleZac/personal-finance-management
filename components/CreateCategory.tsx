import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, TouchableWithoutFeedback, Keyboard, StyleSheet, Dimensions } from 'react-native';
import { createCategories } from '@/api/categoryApi';
import Modal from 'react-native-modal';
import { useAuth } from '@/hooks/AuthContext';
import { getIconsById, categoryMapping } from '@/assets/categoryMapping';
import OptionItem from '@/components/OptionItem';
import Button from '@/components/Button';
import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

// ------------------------ SelectIcon Component ------------------------

interface SelectIconProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (iconId: string, iconName: string) => void;
}

const SelectIconModal: React.FC<SelectIconProps> = ({ isVisible, onClose, onSave }) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  // Function to handle saving the selected icon
  const handleSave = (selectedIconId: string, selectedIconName: string) => {
    onSave(selectedIconId, selectedIconName);
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
      <View style={[styles.modalContainer, { backgroundColor }]}>
        {/* Header */}
        <Header
          title="Select Icon"
          variant="backModal"
          onBackModalPress={onClose}
        />
        {/* Icon List */}
        <ScrollView style={styles.modalFormContainer}>
          {categoryMapping.map((category) => {
            // Get the icon component based on the category mapping
            const IconComponent = getIconsById(category.id)[0]?.source || null;
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.iconItem, { backgroundColor: secondaryBackgroundColor }]}
                onPress={() => {
                  const selectedId = category.id.toString();
                  const selectedName = category.name;
                  handleSave(selectedId, selectedName);
                }}
              >
                {/* Use the icon from categoryMapping */}
                {IconComponent ? (
                  <IconComponent width={24} height={24} />
                ) : (
                  <Text style={[styles.fallbackIcon, { color: iconColor }]}>?</Text>
                )}
                <Text style={[styles.iconText, { color: textColor }]}>{category.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

// ------------------------ EnterNameModal Component -----------------------------

interface EnterNameProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (targetAmount: string) => void;
  initialName: string;
}

const EnterNameModal: React.FC<EnterNameProps> = ({ isVisible, onClose, onSave, initialName }) => {
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
        {/* Header */}
        <Header
          title="Enter Name"
          variant="backModal"
          onBackModalPress={onClose}
        />
        <View style={styles.modalFormContainer}>
          {/* Input Field */}
          <TextInput
            style={[styles.modalInput, { 
              borderColor: borderColor,
              backgroundColor: searchInputBackground,
              color: textColor
            }]}
            value={name}
            onChangeText={setName}
            placeholder="Category Name"
            placeholderTextColor={iconColor}
          />
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={handleSave}>
          <Text style={styles.confirmButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

// ------------------------ Main CreateCategory Component ------------------------

interface CreateCategoryProps {
  onClose: () => void;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({ onClose }) => {
  const [isSelectIconModalVisible, setIsSelectIconModalVisible] = useState(false);
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('income');
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);

  const [name, setName] = useState('');
  const [iconId, setIconId] = useState('');
  const [iconName, setIconName] = useState('');
  const { token, userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Theme colors
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleConfirm = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    };

    if (!iconId) {
      Alert.alert('Error', 'Please select an icon for the category');
      return;
    };

    const categoryData = {
      user_id: userId,
      name: name.toString().trim(),
      type: categoryType.toString().toLowerCase(),
      icon_id: iconId.toString(),
    };

    try {
      if (!token || !userId) {
        Alert.alert('Error', 'User authentication failed. Please log in again.');
        return;
      }
      const response = await createCategories(token, categoryData);
      Alert.alert('Success', 'Category created successfully');
      setName('');
      setIconId('');
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }

    onClose();
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: secondaryBackgroundColor, borderColor }]}>
          {/* Header */}
          <Header
            title="Create Category"
            variant="closeModal"
            onCloseModalPress={onClose}
          />
          <View style={styles.formContainer}>
            {/* Category Type Toggle */}
            <View style={styles.typeContainer}>
              <Text style={[styles.label, { color: textColor }]}>What is it for?</Text>
              <View style={styles.typeToogle}>
                <TouchableOpacity onPress={() => setCategoryType('income')}>
                  <Text style={[styles.typeText, { color: textColor }, categoryType === 'income' && styles.typeTextActive]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setCategoryType('expense')}>
                  <Text style={[styles.typeText, { color: textColor }, categoryType === 'expense' && styles.typeTextActive]}>Expense</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={{ flex: 1 }}>
              <OptionItem
                icon="Writing Icon"
                label="Enter name"
                value={name}
                onPress={() => setIsNameModalVisible(true)}
              />
              <OptionItem
                icon="Pie Chart Icon"
                label="Select icon"
                value={iconName}
                onPress={() => setIsSelectIconModalVisible(true)}
              />
            </ScrollView>
          </View>
          {/* Save button */}
          <Button
            onPress={handleConfirm}
            title="Save"
            buttonType="create"
            disabled={isLoading}
            />
        </View>
      </TouchableWithoutFeedback>

      {/* Enter Name Modal */}
      <EnterNameModal
          isVisible={isNameModalVisible}
          onClose={() => setIsNameModalVisible(false)}
          onSave={(newName) => setName(newName)}
          initialName={name}
        />

      {/* Select Icon Modal */}
      <SelectIconModal
          isVisible={isSelectIconModalVisible}
          onClose={() => setIsSelectIconModalVisible(false)}
          onSave={(iconId: string, iconName: string) => {
            setIconId(iconId);
            setIconName(iconName);
            setIsSelectIconModalVisible(false);
          }}
      />
    </>
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
  iconItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 12,
    borderBottomWidth: 0.2,
    borderBottomColor: '#eee',
    borderRadius: 8,
    marginBottom: 5,
  },
  iconText: {
    marginLeft: 10,
    fontSize: 16,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    marginTop: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
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
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 100,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  closeIconContainer: {
    backgroundColor: '#cccccc',
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
  },
  typeContainer: {
    alignItems: 'center',
    gap: 12,
  },
  typeToogle: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  typeText: {
    padding: 10,
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeTextActive: {
    backgroundColor: '#0047AB',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  selectIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  confirmButton: {
    backgroundColor: '#246BFD',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  confirmButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  fallbackIcon: {
    fontSize: 24,
  },
});

export default CreateCategory;