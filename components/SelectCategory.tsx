import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Dimensions} from 'react-native';
import Modal from 'react-native-modal';
import { fetchCategories } from '@/api/categoryApi';
import { getIconsById } from '@/assets/categoryMapping';
import { Category as CategoryType } from '@/types/types';
import CreateCategory from '@/components/CreateCategory';
import { useAuth } from '@/hooks/AuthContext';
import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';

// Get screen dimensions
const { height: screenHeight } = Dimensions.get('window');

// ------------------------ SelectAccount Component ------------------------
// Note: SelectCategory is rendered as a modal in CreateTransaction, updateTransaction, createBudget
interface SelectCategoryProps {
  onClose: () => void;
  onSelect: (category: CategoryType, iconId: string | null) => void;
  context?: 'transaction' | 'budget'; // Add context prop to differentiate usage
}

const SelectCategory: React.FC<SelectCategoryProps> = ({ onClose, onSelect, context = 'transaction' }) => {
  const [isCreateCategoryModalVisible, setIsCreateCategoryModalVisible] = useState(false);
  const [selectedType, setSelectedTypeFilter] = useState<'expense' | 'income'>('expense');
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, userId } = useAuth();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  // Determine if income should be shown based on context
  const showIncomeToggle = context === 'transaction';

  // Fetch categories
  const fetchCategoriesData = async () => {
    if (!token || !userId) {
      setError('Authentication details missing');
      return;
    };
    setIsLoading(true);
    try {
      const response = await fetchCategories(token);
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, [token, userId]);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.type === selectedType),
    [categories, selectedType]
  );

  // Handle category selection
  const handleSelectCategory = (category: CategoryType, iconId: string | null) => {
    onSelect(category, iconId);
    onClose();
  };

  const renderCategoryItem = ({ item }: { item: CategoryType }) => {
    const matchingcategories = getIconsById(parseInt(item.icon_id));
    const CategoryComponent = matchingcategories.length > 0 ? matchingcategories[0].source : null;
    const iconId = matchingcategories.length > 0 ? matchingcategories[0].id.toString() : null;

    return (
      <TouchableOpacity
        style={[styles.categoryItem, { backgroundColor: secondaryBackgroundColor }]}
        onPress={() => handleSelectCategory(item, iconId)}
        accessibilityLabel={`Select ${item.name} category`}
      >
        <View style={styles.iconContainer}>
          {CategoryComponent ? (
            <CategoryComponent width={36} height={36} />
          ) : (
            <Text style={[styles.fallbackIcon, { color: iconColor }]}>?</Text>
          )}
        </View>
        <View style={styles.categoryDetails}>
          <Text style={[styles.categoryName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.categoryType, { color: iconColor }]}>{item.type}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <Header
        title="Select Category"
        variant="backModal"
        onBackModalPress={onClose}
        onCreatePress={() => setIsCreateCategoryModalVisible(true)}
      />
      <View style={styles.formContainer}>
        {/* Toggle Section - Only show for transactions */}
        {showIncomeToggle ? (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, selectedType === 'expense' ? styles.toggleButtonActive : [styles.toggleButtonInactive, { backgroundColor: secondaryBackgroundColor }]]}
              onPress={() => setSelectedTypeFilter('expense')}
              accessibilityLabel="Select expense categories"
            >
              <Text style={[selectedType === 'expense' ? styles.toggleButtonTextActive : [styles.toggleButtonTextInactive, { color: iconColor }]]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, selectedType === 'income' ? styles.toggleButtonActive : [styles.toggleButtonInactive, { backgroundColor: secondaryBackgroundColor }]]}
              onPress={() => setSelectedTypeFilter('income')}
              accessibilityLabel="Select income categories"
            >
              <Text style={[selectedType === 'income' ? styles.toggleButtonTextActive : [styles.toggleButtonTextInactive, { color: iconColor }]]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Budget context - show info message
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: iconColor }]}>
              Note: Budgets only track expense categories
            </Text>
          </View>
        )}

        {/* Loading and Error States */}
        {isLoading && <ActivityIndicator color="#0047AB" />}

        {/* List of Categories */}
        {!isLoading && !error && (
          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.category_id.toString()}
            ListEmptyComponent={<Text style={[styles.emptyCategoryList, { color: iconColor }]}>No categories found</Text>}
          />
        )}
      </View>

      {/* Create Category Modal */}
      <Modal
        isVisible={isCreateCategoryModalVisible}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        onBackdropPress={() => setIsCreateCategoryModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <CreateCategory
          onClose={() => {
            setIsCreateCategoryModalVisible(false);
            fetchCategoriesData();
          }}
        />
      </Modal>
    </View>
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
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newCategoryButton: {
    backgroundColor: '#1CA9C9',
    padding: 4,
    borderRadius: 50,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    gap: 10,
    justifyContent: 'center',
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#0047AB',
  },
  toggleButtonInactive: {
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleButtonTextInactive: {
  },
  infoContainer: {
    backgroundColor: '#E8F4F8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0047AB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categoryItem: {
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
  emptyCategoryList: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  iconContainer: {
    marginRight: 15,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryType: {
    fontSize: 14,
  },
  fallbackIcon: {
    fontSize: 24,
  },
  loadingText: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  errorText: {
    alignSelf: 'center',
    marginVertical: 20,
    color: 'red',
  },
});

export default SelectCategory;