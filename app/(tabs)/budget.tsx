import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { PieChart } from 'react-native-gifted-charts';
import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getIconsById, getUncategorizedIcon } from '@/assets/categoryMapping';
import { getGenericIcon } from '@/assets/genericIconsMapping';
import { useAuth } from '@/hooks/AuthContext';
import { fetchBudgets } from '@/api/budgetApi';
import { fetchCategories } from '@/api/categoryApi';
import { Budget as BudgetType, Category as CategoryType } from '@/types/types';
import Modal from 'react-native-modal';
import CreateBudget from '@/components/CreateBudget';
import { BudgetItem } from '@/types/types';
import WebSocketService from '@/api/webSocketService';

// Get screen dimensions for responsive sizing
const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  value: number;
  text: string;
  color: string;
}

export default function Budget() {
  const [budgets, setBudgets] = useState<BudgetType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const {token, userId} = useAuth();

  // A modal for creating a budget
  const [isCreateBudgetModalVisible, setIsCreateBudgetModalVisible] = useState(false);

  // Toggle state for budgeted vs actual view
  const [viewMode, setViewMode] = useState<'budgeted' | 'actual'>('budgeted');

  // Importing colors from the theme
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  // Calculate pie chart size
  const chartSize = screenWidth * 0.7;

  // Get angle small right icon
  const AngleSmallRightIcon = getGenericIcon('Angle Small Right Icon')[0]?.source;

  // Load budgets, categories, and base currency
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      if (!token || !userId) {
        throw new Error('Missing authentication token or user ID');
      }
      const [budgetData, categoryData] = await Promise.all([
        fetchBudgets(token),
        fetchCategories(token),
      ]);
      setBudgets(budgetData.budgets || []);
      setCategories(categoryData.categories || []);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching data:', errorMessage);
      setError('Failed to load budgets');
      setBudgets([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && userId) {
      loadData();
    }
  }, [token, userId]);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
      if (userId && token) {
        // Initialize WebSocket with token
        WebSocketService.initialize(token);
        
        // Listen for category list updates from backend
        WebSocketService.on('categories_update', (data) => {
          console.log('Received category update:', data);
          // Refetch overview data to update net worth, pie chart, etc.
          fetchCategories(token).then((categoryData) => {setCategories(categoryData.categories || [])});
        });

        // Listen for budget updates from backend
        WebSocketService.on('list_of_budgets_update', (data) => {
          console.log('Received budget update:', data);
          // Use the data directly from WebSocket instead of refetching
          if (data.budgets && Array.isArray(data.budgets)) {
            setBudgets(data.budgets);
          } else {
            // Fallback to refetch if data format is unexpected
            fetchBudgets(token).then((budgetData) => {
              setBudgets(budgetData.budgets || []);
            });
          }
        });
      }
  
      // Cleanup: Remove listener on unmount
      return () => {
        WebSocketService.on('categories_update', () => {});  // Empty callback to remove
        WebSocketService.on('list_of_budgets_update', () => {});  // Empty callback to remove
      };
    }, [userId, token]);

  const budgetItems: BudgetItem[] = budgets.map((budget) => {
    const category = categories.find((cat) => cat.category_id === budget.category_id) || ({} as CategoryType);

    return {
      budget_id: budget.budget_id,
      budget_limit: budget.budget_limit,
      spent_amount: budget.spent_amount ?? 0,
      category_name: category.name || 'Unknown',
      icon_id: category.icon_id,
      type: budget.type.toLowerCase(),
    };
  });

  // Calculate totals based on view mode
  const totalWants = budgetItems
    .filter((item) => item.type === 'wants')
    .reduce((sum, item) => sum + (viewMode === 'budgeted' ? item.budget_limit : item.spent_amount), 0);
  const totalNeeds = budgetItems
    .filter((item) => item.type === 'needs')
    .reduce((sum, item) => sum + (viewMode === 'budgeted' ? item.budget_limit : item.spent_amount), 0);
  const totalSavings = budgetItems
    .filter((item) => item.type === 'savings')
    .reduce((sum, item) => sum + (viewMode === 'budgeted' ? item.budget_limit : item.spent_amount), 0);

  // Calculate total based on view mode
  const totalAmount = totalWants + totalNeeds + totalSavings;

  // Calculate percentages
  const wantsPercentage = totalAmount ? (totalWants / totalAmount) * 100 : 0;
  const needsPercentage = totalAmount ? (totalNeeds / totalAmount) * 100 : 0;
  const savingsPercentage = totalAmount ? (totalSavings / totalAmount) * 100 : 0;

  // Check if all spent_amount are 0 in actual mode
  const allSpentAmountZero = viewMode === 'actual' && budgetItems.every((item) => item.spent_amount === 0);

  // Data for the pie chart
  const defaultChartData: ChartData[] = [
    { value: 0, text: 'Wants', color: '#FF6347' },
    { value: 0, text: 'Needs', color: '#4682B4' },
    { value: 0, text: 'Savings', color: '#FFD700' },
  ];

  const chartData: ChartData[] =
    budgets.length === 0 && !error && !loading
      ? [{ value: 100, text: 'No Budget', color: '#808080' }]
      : allSpentAmountZero
      ? [{ value: 100, text: 'No Spending', color: '#808080' }]
      : viewMode === 'budgeted' && totalWants === 0 && totalNeeds === 0 && totalSavings === 0
      ? [{ value: 100, text: 'No Budgeted Amounts', color: '#808080' }]
      : totalAmount > 0
      ? [
          { value: wantsPercentage, text: `Wants (${Math.round(wantsPercentage)}%)`, color: '#FF6347' },
          { value: needsPercentage, text: `Needs (${Math.round(needsPercentage)}%)`, color: '#4682B4' },
          { value: savingsPercentage, text: `Savings (${Math.round(savingsPercentage)}%)`, color: '#FFD700' },
        ]
      : defaultChartData;

  // Render budget item
  const renderBudgetItem = ({ item }: { item: BudgetItem }) => {
    const progress = item.budget_limit ? (item.spent_amount / item.budget_limit) * 100 : 0;
    
    const matchingIcons = getIconsById(parseInt(item.icon_id));
    const CategoryComponent = matchingIcons.length > 0 ? matchingIcons[0].source : null;

    // Fallback to uncategorized icon if no matching icon found
    const UnCategorizedIcon = getUncategorizedIcon();

    return (
      <View style={[styles.budgetItem, { backgroundColor: secondaryBackgroundColor }]}>
        <View style={styles.budgetLeft}>
          <View style={styles.iconContainer}>
            {CategoryComponent ? (
              <CategoryComponent width={36} height={36} />
            ) : (
              <UnCategorizedIcon width={36} height={36} />
            )}
          </View>
          <View style={styles.budgetDetails}>
            <View style={styles.amountInfo}>
              <Text style={[styles.budgetName, { color: textColor }]} numberOfLines={1}>
                {item.category_name}
              </Text>
              <Text style={styles.remainingText} numberOfLines={1}>
                  {item.spent_amount < item.budget_limit
                    ? `${(((item.budget_limit - item.spent_amount) / item.budget_limit) * 100).toFixed(0)}% Left`
                    : `${(((item.spent_amount - item.budget_limit) / item.budget_limit) * 100).toFixed(0)}% Over`}
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
              <View
                style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <Header 
          title="Budget" 
          variant="simple"
          onCreatePress={() => setIsCreateBudgetModalVisible(true)} 
        />
        <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Budget Overview Section */}
        <View style={[styles.overviewContainer, { backgroundColor: secondaryBackgroundColor }]}>
          {/* Pie Chart Container */}
          <View style={styles.chartContainer}>
            {/* Toggle Buttons */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'budgeted' && styles.activeToggle]}
                onPress={() => setViewMode('budgeted')}
              >
                <Text style={[styles.toggleText, { color: textColor }, viewMode === 'budgeted' && styles.activeToggleText]}>Budget</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'actual' && styles.activeToggle]}
                onPress={() => setViewMode('actual')}
              >
                <Text style={[styles.toggleText, { color: textColor }, viewMode === 'actual' && styles.activeToggleText]}>Actual</Text>
              </TouchableOpacity>
            </View>
            {/* Pie Chart */}
            <PieChart
              data={chartData}
              radius={chartSize / 2}
              innerRadius={chartSize * 0.3}
              textColor={textColor}
              textSize={12}
              showText={false}
              donut
              innerCircleColor={secondaryBackgroundColor}
            />
          </View>

          {/* Legend below the chart */}
          <View style={styles.legendBelowContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4682B4' }]} />
              <Text style={[styles.legendText, { color: secondaryTextColor }]}>
                Needs {allSpentAmountZero || error ? 0 : Math.round(needsPercentage)}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF6347' }]} />
              <Text style={[styles.legendText, { color: secondaryTextColor }]}>
                Wants {allSpentAmountZero || error ? 0 : Math.round(wantsPercentage)}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FFD700' }]} />
              <Text style={[styles.legendText, { color: secondaryTextColor }]}>
                Savings {allSpentAmountZero || error ? 0 : Math.round(savingsPercentage)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={[styles.progressContainer, { backgroundColor: secondaryBackgroundColor }]}>
          <TouchableOpacity
            style={styles.sectionTitleContainer}
            onPress={() => router.push('/budgetsList')}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>Progress This Month</Text>
            <AngleSmallRightIcon width={24} height={24} fill={iconColor}/>
          </TouchableOpacity>
          {loading ? (
              <View style={{ marginVertical: 16, height: 250, alignContent: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="#0047AB" />
              </View>
          ) : error ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: secondaryTextColor }]}>An error occured!</Text>
            </View>              
          ) : (
            <FlatList
              data={budgetItems}
              renderItem={renderBudgetItem}
              keyExtractor={(item) => item.budget_id.toString()}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: secondaryTextColor }]}>No budgets found.</Text>
                </View>
              }
          /> )}
          </View>
        </ScrollView>
      </View>

      {/* Create budget modal */}
      <Modal
        isVisible={isCreateBudgetModalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        onBackdropPress={() => setIsCreateBudgetModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <CreateBudget onClose={() => setIsCreateBudgetModalVisible(false)} />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overviewContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  progressContainer: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 36,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  chartContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    height: 320,
  },
  legendBelowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  budgetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  fallbackIcon: {
    fontSize: 24,
  },
  budgetDetails: {
    flex: 1,
    marginRight: 10,
  },
  amountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 20,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4682B4',
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 12,
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
    height: 300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 18,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: '#0047AB',
    borderColor: '#0047AB',
    borderRadius: 20,
  },
  toggleText: {
    fontSize: 14,
  },
  activeToggleText: {
    color: '#fff',
  },
});