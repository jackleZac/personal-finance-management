import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/AuthContext';
import { fetchBudgets } from '@/api/budgetApi';
import { fetchCategories } from '@/api/categoryApi';
import { BudgetType as BudgetTypeEnum, Budget as BudgetType, Category as CategoryType } from '@/types/types';
import { getIconsById } from '@/assets/categoryMapping';
import { BudgetItem as SubBudgetItem } from '@/types/types';
import Header from '@/components/Header';
import WebSocketService from '@/api/webSocketService';

export default function BudgetsList() {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackground = useThemeColor({}, 'secondaryBackground');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault')
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const filterButtonColor = useThemeColor({}, 'filterButtonBackground');
  const filterContainerBackground = useThemeColor({}, 'filterContainerBackground');

  // Auth Context
  const router = useRouter();
  const { token, userId } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState<string | BudgetTypeEnum>('All');
  const [allBudgets, setAllBudgets] = useState<BudgetType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch budgets and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!token || !userId) {
          setError('User not authenticated. Please log in again.');
          return;
        }
        setLoading(true);
        setError('');
        const [budgetData, categoryData] = await Promise.all([
          fetchBudgets(token),
          fetchCategories(token),
        ]);
        console.log('Budget Data:', budgetData);
        console.log('Category Data:', categoryData);
        setAllBudgets(budgetData.budgets || []);
        setCategories(categoryData.categories || []);
      } catch (error: any) {
        console.error('Error fetching data:', error.message);
        setError('Unable to load budgets. Please try again later.');
        setAllBudgets([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, userId]);

  // Filter budgets based on selected filter using useMemo
  const subBudgets = useMemo(() => {
    if (selectedFilter === 'All') {
      return allBudgets;
    }
    return allBudgets.filter((budget) => budget.type === selectedFilter);
  }, [selectedFilter, allBudgets]);

  // Map sub-budgets to display items
  const subBudgetItems: SubBudgetItem[] = subBudgets
    .filter((budget) => budget.budget_limit != null)
    .map((budget) => {
      const category = categories.find((cat) => cat.category_id === budget.category_id);
      const iconId = category?.icon_id || String(budget.category_id);
      // Log type mismatch warning
      if (category && budget.type !== category.type) {
        console.warn(
          `Type mismatch: Budget ${budget.budget_id} has type "${budget.type}", but category ${category.category_id} has type "${category.type}"`
        );
      }
      return {
        budget_id: budget.budget_id,
        budget_limit: budget.budget_limit,
        spent_amount: budget.spent_amount ?? 0, // Default to 0 if null
        category_name: category?.name || 'Unknown',
        category_id: budget.category_id,
        icon_id: iconId,
        MatchedIcon: getIconsById(parseInt(iconId))[0]?.source || (() => <Text>?</Text>),
      };
    });

  // Log subBudgetItems for debugging
  useEffect(() => {
    console.log('subBudgets:', subBudgets);
    console.log('subBudgetItems:', subBudgetItems);
  }, [subBudgets, subBudgetItems]);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
      if (userId && token) {
        // Initialize WebSocket with token
        WebSocketService.initialize(token);
  
        // Listen for net worth updates from backend
        WebSocketService.on('list_of_budgets_update', (data) => {
          console.log('Received list of budgets update:', data);
          // Refetch a list of budgets to update the list
          fetchBudgets(token).then((data) => {setAllBudgets(data.budgets || [])});
        });
      };
  
      // Cleanup: Remove listener on unmount
      return () => {
        WebSocketService.on('list_of_budgets_update', () => {});  // Empty callback to remove
      };
    }, [userId, token]);

  // Render each sub-budget item
  const renderSubBudgetItem = ({ item }: { item: SubBudgetItem }) => {
    const remaining = item.budget_limit - item.spent_amount;
    const progress = item.budget_limit > 0 ? (item.spent_amount / item.budget_limit) * 100 : 0;
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/budgetTrends',
            params: {
              budgetId: item.budget_id.toString(),
              spentAmount: item.spent_amount.toString(),
              categoryName: item.category_name,
              categoryId: item.category_id?.toString() || '',
              budgetLimit: item.budget_limit.toString(),
              icon_id: item.icon_id,
            },
          })
        }
      >
        <View style={[ styles.subBudgetItem, { backgroundColor: secondaryBackground }]}>
          <View style={styles.subBudgetLeft}>
            <View style={styles.subBudgetIcon}>
              {item.MatchedIcon ? (
                <item.MatchedIcon width={36} height={36} />
              ) : (
                <Text>?</Text>
              )}
            </View>
            <View style={styles.subBudgetDetails}>
              <Text style={[styles.subBudgetName, { color: textColor }]}>{item.category_name}</Text>
              <View style={[styles.progressBar, { width: '100%' }]}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={styles.amountInfo}>
                <Text style={styles.remainingText} numberOfLines={1}>
                  Spent {item.spent_amount.toFixed(1)}
                </Text>
                <Text style={styles.remainingText} numberOfLines={1}>
                  {remaining.toFixed(1)} Left
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      if (!token || !userId) {
        setError('User not authenticated. Please log in again.');
        return;
      }
      setLoading(true);
      const [budgetData, categoryData] = await Promise.all([
        fetchBudgets(token),
        fetchCategories(token),
      ]);
      setAllBudgets(budgetData.budgets || []);
      setCategories(categoryData.categories || []);
    } catch (error: any) {
      console.error('Error refreshing data:', error.message);
      setError('Unable to refresh budgets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* Custom Header with Back Button */}
      <Header title="All Budgets" variant="back" />

      <View style={styles.container}>
        {/* Filter Buttons */}
        <View style={[styles.filterContainer, { backgroundColor: filterContainerBackground}]}>
          {['All', BudgetTypeEnum.Wants, BudgetTypeEnum.Needs, BudgetTypeEnum.Savings].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                { backgroundColor: filterButtonColor},
                selectedFilter === filter && styles.selectedFilterButton,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: secondaryTextColor },
                  selectedFilter === filter && styles.selectedFilterText,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={{ flex: 1, padding: 16, backgroundColor: backgroundColor }}>
          {/* Loading/Error State */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#0000ff" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>An error occurred.</Text>
            </View>
          ) : subBudgetItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No budgets found.</Text>
            </View>
          ) : (
            <FlatList
              data={subBudgetItems}
              renderItem={renderSubBudgetItem}
              keyExtractor={(item) => item.budget_id.toString()}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              style={styles.subBudgetList}
              refreshing={loading}
              onRefresh={handleRefresh}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4682B4',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  menuPlaceholder: {
    width: 24,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectedFilterButton: {
    backgroundColor: '#4682B4',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  subBudgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
  },
  subBudgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subBudgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4682B4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  subBudgetDetails: {
    flex: 1,
    gap: 8,
  },
  subBudgetName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4682B4',
    borderRadius: 4,
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  remainingText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#fff', 
    backgroundColor: '#5D3FD3', 
    borderRadius: 8, 
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 36,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  subBudgetList: {
    flex: 1,
  },
});