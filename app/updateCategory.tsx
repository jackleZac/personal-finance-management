import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '@/components/Header';
import { updateCategory, deleteCategory } from '@/api/categoryApi';
import { useAuth } from '@/hooks/AuthContext';
import { CategoryType } from '@/types/types';
import Button from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function UpdateCategory() {
  const router = useRouter();
  const { token, userId } = useAuth();
  const params = useLocalSearchParams();
  const { category_id, name, icon_id, type } = params;

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  const searchInputBackground = useThemeColor({}, 'searchInputBackground');

  const [categoryName, setCategoryName] = useState<string>(name as string || '');
  const [categoryType, setCategoryType] = useState<string>(type as string || CategoryType.Expense);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateCategory = async () => {
    if (!token || !userId) {
      Alert.alert('Error', 'Authentication details missing');
      return;
    }

    if (!categoryName.trim()) {
      Alert.alert('Error', 'Category name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const categoryData = {
        name: categoryName,
        icon_id: icon_id as string || 'default',
        type: categoryType,
      };
      await updateCategory(token, Number(category_id), categoryData);
      Alert.alert('Success', 'Category updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating category:', error.message);
      setError('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = () => {
    if (!token || !userId) {
      Alert.alert('Error', 'Authentication details missing');
      return;
    }

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteCategory(token, Number(category_id));
              Alert.alert('Success', 'Category deleted successfully', [
                { text: 'OK', onPress: () => router.replace('/customCategories') },
              ]);
            } catch (error: any) {
              console.error('Error deleting category:', error.message);
              setError('Failed to delete category. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const toggleCategoryType = () => {
    setCategoryType(
      categoryType === CategoryType.Expense ? CategoryType.Income : CategoryType.Expense
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: secondaryBackgroundColor }]}>
        <ActivityIndicator size="large" color="#0047AB" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: secondaryBackgroundColor }]}>
        <Header title="Edit Category" variant="back" />
        <View style={styles.content}>
          {/* Category Name Input */}
          <View style={[styles.section, { backgroundColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Category Name</Text>
            <TextInput
              style={[styles.input, { 
                color: textColor, 
                borderColor: borderColor,
                backgroundColor: searchInputBackground
              }]}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Enter category name"
              placeholderTextColor={iconColor}
            />
          </View>

          {/* Category Type Selector */}
          <View style={[styles.section, { backgroundColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Category Type</Text>
            <TouchableOpacity 
              style={[styles.typeSelector, { 
                borderColor: borderColor,
                backgroundColor: searchInputBackground
              }]} 
              onPress={toggleCategoryType}
            >
              <Text style={[styles.typeText, { color: textColor }]}>
                {categoryType.charAt(0).toUpperCase() + categoryType.slice(1)}
              </Text>
              <Icon name="swap-horiz" size={20} color={iconColor} />
            </TouchableOpacity>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={styles.buttonContainer}>
            {/* Delete Button */}
            <Button
              onPress={handleDeleteCategory}
              title="Delete"
              buttonType="delete"
              disabled={loading}
            />

            {/* Save Button */}
            <Button
              onPress={handleUpdateCategory}
              title="Save"
              buttonType="update"
              disabled={loading || !categoryName.trim()}
              />
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  typeText: {
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
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
});