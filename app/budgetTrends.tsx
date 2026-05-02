import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/AuthContext';
import { fetchBudgetTrend } from '@/api/budgetApi';
import Error from '@/components/Error';
import { 
  BudgetTrendTransaction as BudgetTrendTransactionType, 
  BudgetTrend as BudgetTrendType, 
  Budget as BudgetType 
} from '@/types/types';
import Header from '@/components/Header';
import WebSocketService from '@/api/webSocketService';

// Get screen dimensions for responsive sizing
const { width: screenWidth } = Dimensions.get('window');

export default function BudgetTrends() {
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token, userId } = useAuth();

  // Parse params with type safety
  const budgetId = params.budgetId ? parseInt(params.budgetId as string, 10) : undefined;
  const categoryName = params.categoryName as string | undefined;
  const iconId = params.icon_id as string | undefined; 

  const [budget, setBudget] = useState<BudgetType | null>(null);
  const [transactions, setTransactions] = useState<BudgetTrendTransactionType[]>([]);
  const [budgetTrends, setBudgetTrends] = useState<BudgetTrendType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Log params and budget for debugging
  useEffect(() => {
    console.log('Navigation params:', params);
    console.log('Budget state:', budget);
  }, [params, budget]);

  // Fetch transactions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Validate required params
        if (!token || !userId || !budgetId) return;

        const response = await fetchBudgetTrend(token, budgetId);
        console.log('fetchBudgetTrend response:', response);
        setBudget(response.budget);
        setBudgetTrends(response.budget_trend);
        setTransactions(response.transactions);
      } catch (error: any) {
        console.error('Error fetching budget trend:', error.message);
        setError('Unable to load trends. Please try again later.');
        setBudget(null);
        setBudgetTrends([]);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, userId, budgetId]);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (userId && token) {
      // Initialize WebSocket with token
      WebSocketService.initialize(token);

      // Listen for net worth updates from backend
      WebSocketService.on('budget_trend_update', (data) => {
        console.log('Received budget trend update:', data);
        // Refetch overview data to update net worth, pie chart, etc.
        fetchBudgetTrend(token, budgetId).then((data) => {setBudgetTrends(data.budget_trend || [])});
      });
    }

    // Cleanup: Remove listener on unmount
    return () => {
      WebSocketService.on('budget_trend_update', () => {});  // Empty callback to remove
    };
  }, [userId, token]);

  // Prepare chart data
  const barChartData = budgetTrends.map((item) => ({
    value: error ? 0 : item.amount,
    label: item.month,
    frontColor: '#4682B4',
  }));

  const budgetLineData = budgetTrends.map(() => ({
    value: error || !budget ? 0 : budget.budget_limit,
  }));

  // Render each transaction
  const renderTransactionItem = ({ item }: { item: BudgetTrendTransactionType }) => (
    <View style={[styles.transactionItem, { borderBottomColor: borderColor }]}>
      <View style={styles.transactionLeft}>
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionDescription, { color: textColor }]}>
            {item.account_name}
          </Text>
          <Text style={[styles.transactionDate, { color: iconColor }]}>
            {new Date(item.transaction_date).toLocaleDateString()}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: textColor }]}>
          RM{item.amount.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  // Calculate spacing for charts
  const containerPadding = 32;
  const chartScreenWidth = Dimensions.get('window').width - 72 - containerPadding;

  return (
    <View style={{ flex: 1, backgroundColor: secondaryBackgroundColor }}>
      <Header
        title={budget ? `${categoryName} Trend` : 'Loading...'}
        variant="back"
        onEditPress={() =>
          budget &&
          router.push({
            pathname: '/updateBudget',
            params: {
              budget_id: budget.budget_id.toString(),
              budget_limit: budget.budget_limit.toString(),
              category_id: budget.category_id.toString(),
              type: budget.type,
              notification_enabled: budget.notification_enabled ? 'true' : 'false',
              spent_amount: (budget.spent_amount ?? 0).toString(),
              status: budget.status,
              created_at: budget.created_at || new Date().toISOString(),
              icon: iconId || 'default', // Use icon_id from params
            },
          })
        }
      />

      <ScrollView style={[ styles.container, { backgroundColor: backgroundColor }]}>
        <View style={[styles.chartContainer, { backgroundColor: secondaryBackgroundColor }]}>
          <Text style={[styles.chartTitle, { color: textColor }]}>
            Spending vs Budget
          </Text>
          <View style={{ backgroundColor: '#FF6347', padding: 8, borderRadius: 4, alignSelf: 'flex-start', marginVertical: 8 }}>
            <Text style={[styles.budgetLineText, { color: '#FFF' }]}>
              Limit RM{budget ? budget.budget_limit.toFixed(2) : '0.00'}
            </Text>
          </View>
          {error ? (
            <Error message='Unable to load chart data.' />
          ) : (
            <>
              <View style={styles.chartWrapper}>
                <BarChart
                  data={barChartData}
                  width={chartScreenWidth}
                  height={220}
                  barWidth={60}
                  spacing={20}
                  noOfSections={5}
                  barBorderRadius={4}
                  frontColor="#4682B4"
                  formatYLabel={(value) => {
                    const num = parseFloat(value);
                      if (num >= 1000) {
                        return `${(num / 1000).toFixed(1)}K`;
                      }
                      return num.toFixed(0);
                  }}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  xAxisLabelTextStyle={{ fontSize: 14, color: iconColor, width: 60 }}
                  yAxisTextStyle={{ fontSize: 10, color: iconColor }}
                  hideRules
                  showFractionalValues={false}
                  roundToDigits={0}
                  maxValue={Math.max(...barChartData.map(d => d.value), budget?.budget_limit || 0) * 1.2}
                />
                <View style={styles.lineOverlay}>
                  <LineChart
                    data={budgetLineData}
                    width={chartScreenWidth}
                    height={220}
                    color="#f08d2aff"
                    thickness={2}
                    strokeDashArray={[5, 5]}
                    hideAxesAndRules
                    initialSpacing={0}
                    adjustToWidth
                    maxValue={Math.max(...barChartData.map(d => d.value), budget?.budget_limit || 0) * 1.2}
                  />
                </View>
              </View>
            </>
          )}
        </View>
        {/* Recent Transactions Section */}
        <View style={[styles.transactionsContainer, { backgroundColor: secondaryBackgroundColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Recent Transactions
          </Text>
          {error ? (
            <Error message='An error occured.' />
          ) : transactions.length === 0 && !loading ? (
            <Error message='No transactions found.' />
          ) : 
          (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.transaction_id.toString()}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              style={styles.transactionList}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: iconColor }]}>
                  {error ? 'No transactions due to error.' : 'No transactions found.'}
                </Text>
              }
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chartContainer: {
    borderRadius: 12,
    marginVertical: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  transactionsContainer: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 36,
  },
  chartWrapper: {
    position: 'relative',
    height: 260,
    width: screenWidth * 0.7,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth * 0.7,
    height: 200,
  },
  budgetLineText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 220,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});