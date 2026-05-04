import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleProp,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/AuthContext';
import { useRouter } from 'expo-router';
import { getCurrentMonthDates } from '@/utils/dateUtils';
import { fetchAccounts, fetchMonthToDateBalance } from '@/api/accountApi';
import { fetchUserDetails } from '@/api/userApi';
import { fetchTransactions } from '@/api/transactionApi';
import { fetchPastWeeklyCashflow } from '@/api/cashflowApi';
import { fetchIncomeExpenseBreakdown } from '@/api/accountApi';
import { getIconsById, getUncategorizedIcon } from '@/assets/categoryMapping';
import { getGenericIcon } from '@/assets/genericIconsMapping';
import { getIconsByCurrency } from '@/assets/flagMapping';
import Error from '@/components/Error';
import {
  Account as AccountType,
  Transaction as TransactionType,
  AccountsResponse,
  BreakdownItem
} from '@/types/types';
import Header from '@/components/Header';
import AccountCard from '@/components/AccountCard';
import CreateAccountCard from '@/components/CreateAccountCard';
import InfoModal from '@/components/InfoModal';
import WebSocketService from '@/api/webSocketService';

type DonutMode = 'asset' | 'debt' | 'income' | 'expense';

type DonutChartItem = {
  value: number;
  text: string;
  percentage: number;
  color: string;
};

const screenWidth = Dimensions.get('window').width;

const CUSTOM_COLORS = ['#FF5733', '#FFC300', '#C70039', '#900C3F', '#34D399'];
const DEFAULT_COLOR = '#808080';

export default function Home() {
  // State for Net Worth widget
  const [netWorth, setNetWorth] = useState(0);
  const [baseCurrency, setBaseCurrency] = useState('MYR');
  const [NetWorthModalVisible, setNetWorthModalVisible] = useState(false);
  
  // State for Overview section
  const [overviewAccounts, setOverviewAccounts] = useState<AccountType[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<AccountType[]>([]);
  const [debtAccounts, setDebtAccounts] = useState<AccountType[]>([]);
  const [mtdChange, setMtdChange] = useState(0);
  const [mtdPercentage, setMtdPercentage] = useState(0);
  const [viewMode, setViewMode] = useState<'assets' | 'debts'>('assets');
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  // State for unified donut chart
  const [donutMode, setDonutMode] = useState<DonutMode>('asset');
  const [donutData, setDonutData] = useState<DonutChartItem[]>([]);
  const [donutTotal, setDonutTotal] = useState(0);
  const [donutLoading, setDonutLoading] = useState(true);
  const [donutError, setDonutError] = useState('');

  // State for Weekly Cashflows Widget
  const [weeklyCashflows, setWeeklyCashflows] = useState<any[]>([]);
  const [cashflowLoading, setCashflowLoading] = useState(true);
  const [cashflowError, setCashflowError] = useState('');

  // State for List of Transactions
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState('');

  // Auth states
  const { userId, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'icon');
  const chartSize = screenWidth * 0.7;

  const FlagComponent = getIconsByCurrency(baseCurrency)[0]?.source;
  const AngleSmallRightIcon = getGenericIcon("Angle Small Right Icon")[0].source;

  // Fetch overview data
  const fetchOverviewData = useCallback(async () => {
    if (!userId || !token) return;

    try {
      setOverviewLoading(true);
      setOverviewError('');

      // Fetch user details
      const userResponse = await fetchUserDetails(token);
      const userBaseCurrency = userResponse.user.base_currency;
      setBaseCurrency(userBaseCurrency);

      // Fetch accounts
      const accountsResponse: AccountsResponse = await fetchAccounts(token);

      const fetchedAssetAccounts = accountsResponse.assets || [];
      const fetchedDebtAccounts = accountsResponse.debt || [];

      setAssetAccounts(fetchedAssetAccounts);
      setDebtAccounts(fetchedDebtAccounts);

      const fetchedOverviewAccounts =
        viewMode === 'assets'
          ? fetchedAssetAccounts
          : fetchedDebtAccounts;

      setOverviewAccounts(fetchedOverviewAccounts);
      setNetWorth(Math.round(accountsResponse.net_worth) || 0);

      // Fetch MTD balance
      const mtdResponse = await fetchMonthToDateBalance(token);
      setMtdChange(mtdResponse.mtd_change);
      setMtdPercentage(mtdResponse.mtd_percentage);
      setBaseCurrency(mtdResponse.base_currency || userBaseCurrency);
    } catch (err: any) {
      console.error('Overview error:', err);
      setOverviewError(err.message || 'Error loading overview data.');
      setOverviewAccounts([]);
      setAssetAccounts([]);
      setDebtAccounts([]);
      setMtdChange(0);
      setMtdPercentage(0);
      setNetWorth(0);
    } finally {
      setOverviewLoading(false);
    }
  }, [userId, token, viewMode]);

  useEffect(() => {
    if (userId && token) {
      fetchOverviewData();
    }
  }, [userId, token, viewMode, fetchOverviewData]);

  const fetchDonutData = useCallback(async () => {
    if (!token) return;

    try {
      setDonutLoading(true);
      setDonutError('');

      if (donutMode === 'asset' || donutMode === 'debt') {
        const selectedAccounts =
          donutMode === 'asset'
            ? assetAccounts
            : debtAccounts;

        const total = selectedAccounts.reduce(
          (sum, account) => sum + Math.abs(account.converted_balance || 0),
          0
        );

        const formatted = selectedAccounts.map((account, index) => {
          const value = Math.abs(account.converted_balance || 0);

          return {
            value,
            text: account.name,
            percentage: total > 0 ? (value / total) * 100 : 0,
            color: CUSTOM_COLORS[index % CUSTOM_COLORS.length],
          };
        });

        setDonutData(formatted);
        setDonutTotal(total);
        return;
      }

      const { startDate, endDate } = getCurrentMonthDates();

      const res = await fetchIncomeExpenseBreakdown(
        token,
        donutMode,
        startDate,
        endDate
      );

      const accounts = res.accounts ?? [];
      const allBreakdownItems = accounts.flatMap(
        account => account.breakdown ?? []
      );

      const groupedBreakdown = allBreakdownItems.reduce((acc, item) => {
        const categoryId = item.category_id;

        if (!acc[categoryId]) {
          acc[categoryId] = {
            category_id: item.category_id,
            category_name: item.category_name,
            amount: 0,
            percentage: 0,
            icon_id: item.icon_id,
          };
        }

        acc[categoryId].amount += item.amount;

        return acc;
      }, {} as Record<string, BreakdownItem>);

      const groupedItems = Object.values(groupedBreakdown);

      const total = groupedItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      const formatted = groupedItems.map((item, index) => ({
        value: item.amount,
        text: item.category_name,
        percentage: total > 0 ? (item.amount / total) * 100 : 0,
        color: CUSTOM_COLORS[index % CUSTOM_COLORS.length],
      }));

      setDonutData(formatted);
      setDonutTotal(total);
    } catch (err: any) {
      console.error('Donut chart error:', err);
      setDonutError(err.message || 'Error loading donut chart');
      setDonutData([]);
      setDonutTotal(0);
    } finally {
      setDonutLoading(false);
    }
  }, [token, donutMode, assetAccounts, debtAccounts]);

  useEffect(() => {
    if (token) fetchDonutData();
  }, [token, fetchDonutData]);

  const rebuildAssetDebtDonut = useCallback(
  (
    mode: 'asset' | 'debt',
    assets: AccountType[],
    debts: AccountType[]
  ) => {
    const selectedAccounts = mode === 'asset' ? assets : debts;

    const total = selectedAccounts.reduce(
      (sum, account) => sum + Math.abs(account.converted_balance || 0),
      0
    );

    const formatted = selectedAccounts.map((account, index) => {
      const value = Math.abs(account.converted_balance || 0);

      return {
        value,
        text: account.name,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: CUSTOM_COLORS[index % CUSTOM_COLORS.length],
      };
    });

    setDonutData(formatted);
    setDonutTotal(total);
  },
  []
);

  const rebuildIncomeExpenseDonut = useCallback(
    (selectedData: any) => {
      const accounts = selectedData?.accounts ?? [];

      const allBreakdownItems = accounts.flatMap(
        (account: any) => account.breakdown ?? []
      );

      const groupedBreakdown = allBreakdownItems.reduce(
        (acc: Record<string, BreakdownItem>, item: BreakdownItem) => {
          const categoryId = item.category_id;

          if (!acc[categoryId]) {
            acc[categoryId] = {
              category_id: item.category_id,
              category_name: item.category_name,
              amount: 0,
              percentage: 0,
              icon_id: item.icon_id,
            };
          }

          acc[categoryId].amount += item.amount;

          return acc;
        },
        {}
      );

      const groupedItems = Object.values(groupedBreakdown) as BreakdownItem[];

      const total = groupedItems.reduce(
        (sum: number, item: BreakdownItem) => sum + item.amount,
        0
      );

      const formatted = groupedItems.map((item, index) => ({
        value: item.amount,
        text: item.category_name,
        percentage: total > 0 ? (item.amount / total) * 100 : 0,
        color: CUSTOM_COLORS[index % CUSTOM_COLORS.length],
      }));

      setDonutData(formatted);
      setDonutTotal(total);
    },
    []
  );

  // Fetch weekly cashflows
  const fetchCashflowData = useCallback(async () => {
    if (!token) return;

    try {
      setCashflowLoading(true);
      setCashflowError('');

      const { startDate, endDate } = getCurrentMonthDates();

      const response = await fetchPastWeeklyCashflow(token, startDate, endDate);

      const data = response.past_weekly_cashflows || [];

      setWeeklyCashflows(data);
    } catch (err: any) {
      console.error('Cashflow error:', err);
      setCashflowError(err.message || 'Error loading cashflows');
      setWeeklyCashflows([]);
    } finally {
      setCashflowLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchCashflowData();
  }, [token, fetchCashflowData]);

  const formatWeekLabel = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);

    return `${s.getDate()} - ${e.getDate()}`;
  };

  // Fetch a list of transactions
  const fetchTransactionsData = useCallback(async () => {
    if (!userId || !token) return;
    try {
      setTransactionsLoading(true);
      setTransactionsError('');

      const { startDate, endDate } = getCurrentMonthDates();
      const transactionsResponse = await fetchTransactions(token, startDate, endDate);
      const fetchedTransactions = transactionsResponse.transactions || [];
      
      // Sort transactions by date (newest first) and take only first 10
      const sortedTransactions = fetchedTransactions
        .sort((a: TransactionType, b: TransactionType) => {
          return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
        })
        .slice(0, 10);
      
      setTransactions(sortedTransactions);
    } catch (err: any) {
        console.error('Transactions error:', err);
        setTransactionsError(err.message || 'Error loading transactions data.');
        setTransactions([]);
    } finally {
        setTransactionsLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (userId && token) fetchTransactionsData();
  }, [userId, token,  fetchTransactionsData]);

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: TransactionType }) => {
    const isExpense = item.type === 'expense';

    // Get category icon
    const CategoryComponent = getIconsById(item.icon_id)[0].source;
    // Fallback to uncategorized icon if no matching icon found
    const UnCategorizedIcon = getUncategorizedIcon();

    return (
      <View style={[styles.transactionItem, { borderBottomColor: borderColor }]}>
        <View style={styles.iconContainer}>
          {CategoryComponent ? (
            <CategoryComponent width={36} height={36} />
          ) : (
            <UnCategorizedIcon width={36} height={36} />
          )}
        </View>
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionDescription, { color: textColor }]}>{item.category_name}</Text>
          <Text style={[styles.transactionAccount, { color: iconColor }]}>{item.account_name}</Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, { color: isExpense ? '#FF3B30' : '#34C759' }]}>
            {isExpense ? '-' : '+'}{item.amount}
          </Text>
          <Text style={[styles.transactionDate, { color: iconColor }]}>
            {new Date(item.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
      </View>
    );
  };

  // Websockets (real-time updates)
  useEffect(() => {
    if (!userId || !token) return;

    WebSocketService.initialize(token);

    const handleAccountsUpdate = (data: AccountsResponse) => {
      console.log('Socket: accounts update received');

      const fetchedAssetAccounts = data.assets || [];
      const fetchedDebtAccounts = data.debt || [];

      setAssetAccounts(fetchedAssetAccounts);
      setDebtAccounts(fetchedDebtAccounts);

      setOverviewAccounts(
        viewMode === 'assets' ? fetchedAssetAccounts : fetchedDebtAccounts
      );

      setNetWorth(Math.round(data.net_worth) || 0);

      if (donutMode === 'asset' || donutMode === 'debt') {
        rebuildAssetDebtDonut(
          donutMode,
          fetchedAssetAccounts,
          fetchedDebtAccounts
        );
      }
    };

    const handleMtdUpdate = (data: any) => {
      console.log('Socket: MTD update received');

      setMtdChange(data.mtd_change || 0);
      setMtdPercentage(data.mtd_percentage || 0);

      if (data.base_currency) {
        setBaseCurrency(data.base_currency);
      }
    };

    const handleCashFlowsUpdate = (data: any) => {
      console.log('Socket: cashflows update received');

      setWeeklyCashflows(data.past_weekly_cashflows || []);
    };

    const handleTransactionsUpdate = (data: any) => {
      console.log('Socket: transactions update received');

      const fetchedTransactions = data.transactions || [];

      const sortedTransactions = fetchedTransactions
        .sort((a: TransactionType, b: TransactionType) => {
          return (
            new Date(b.transaction_date).getTime() -
            new Date(a.transaction_date).getTime()
          );
        })
        .slice(0, 10);

      setTransactions(sortedTransactions);
    };

    const handleIncomeExpenseUpdate = (data: any) => {
      console.log('Socket: income/expense update received');

      if (donutMode !== 'income' && donutMode !== 'expense') return;

      const selectedData = data[donutMode];

      rebuildIncomeExpenseDonut(selectedData);
    };

    WebSocketService.on(
      'net_worth_and_list_of_accounts_update',
      handleAccountsUpdate
    );

    WebSocketService.on(
      'month_to_date_balance_update',
      handleMtdUpdate
    );

    WebSocketService.on(
      'cash_flows_update',
      handleCashFlowsUpdate
    );

    WebSocketService.on(
      'list_of_transactions_update',
      handleTransactionsUpdate
    );

    WebSocketService.on(
      'income_expense_update',
      handleIncomeExpenseUpdate
    );

    return () => {
      WebSocketService.off(
        'net_worth_and_list_of_accounts_update',
        handleAccountsUpdate
      );

      WebSocketService.off(
        'month_to_date_balance_update',
        handleMtdUpdate
      );

      WebSocketService.off(
        'cash_flows_update',
        handleCashFlowsUpdate
      );

      WebSocketService.off(
        'list_of_transactions_update',
        handleTransactionsUpdate
      );

      WebSocketService.off(
        'income_expense_update',
        handleIncomeExpenseUpdate
      );
    };
  }, [
    userId,
    token,
    viewMode,
    donutMode,
    rebuildAssetDebtDonut,
    rebuildIncomeExpenseDonut,
  ]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Home" variant="home" />
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Net Worth Section */}
        <View style={[styles.netWorthContainer, { backgroundColor: secondaryBackgroundColor }]}>
          <TouchableOpacity
            onPress={() => setNetWorthModalVisible(true)}
          >
            <Text style={[styles.netWorthTitle, { color: textColor }]}>Net Worth ℹ️</Text>
          </TouchableOpacity>
          <View style={styles.netWorthRow}>
            {FlagComponent && <FlagComponent width={28} height={28} />}
            <Text style={[styles.netWorthAmount, { color: textColor }]}>{netWorth}</Text>
          </View>
          <Text style={[styles.currencyText, { color: iconColor }]}>converted into {baseCurrency.toUpperCase()}</Text>
        </View>

        {/* List of Accounts */}
          <View style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: textColor, marginBottom: 8 }]}>
              Accounts
            </Text>

          {overviewLoading ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color="#0047AB" />
            </View>
          ) : (
            <FlatList
              data={[...overviewAccounts, { isCreateCard: true }]}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingVertical: 12, paddingHorizontal: 4 }}
              keyExtractor={(item: any) =>
                item.isCreateCard ? 'create-card' : item.account_id.toString()
              }
              renderItem={({ item }: { item: any }) => {
                if (item.isCreateCard) {
                  return (
                    <CreateAccountCard
                      onPress={() => router.push('/home')}
                    />
                  );
                }

                return (
                  <AccountCard
                    account={item}
                    percentage={item.target_amount ? Math.min((item.balance / item.target_amount!) * 100, 100) : 0}
                    onPress={() =>
                      router.push({
                        pathname: '/accountDetails',
                        params: { account: JSON.stringify(item) },
                      })
                    }
                  />
                );
              }}
            />
          )}
        </View>

        {/* Donut Chart */}
        <View style={[styles.overviewContainer, { backgroundColor: secondaryBackgroundColor }]}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                donutMode === 'asset' && styles.activeToggle,
              ]}
              onPress={() => setDonutMode('asset')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: textColor },
                  donutMode === 'asset' && styles.activeToggleText,
                ]}
              >
                Asset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                donutMode === 'debt' && styles.activeToggle,
              ]}
              onPress={() => setDonutMode('debt')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: textColor },
                  donutMode === 'debt' && styles.activeToggleText,
                ]}
              >
                Debt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                donutMode === 'income' && styles.activeToggle,
              ]}
              onPress={() => setDonutMode('income')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: textColor },
                  donutMode === 'income' && styles.activeToggleText,
                ]}
              >
                Income
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                donutMode === 'expense' && styles.activeToggle,
              ]}
              onPress={() => setDonutMode('expense')}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: textColor },
                  donutMode === 'expense' && styles.activeToggleText,
                ]}
              >
                Expense
              </Text>
            </TouchableOpacity>
          </View>

          {donutLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator color="#0047AB" />
            </View>
          ) : (
            <>
              <View style={styles.chartContainer}>
                <PieChart
                  data={
                    donutError || donutTotal === 0
                      ? [
                          {
                            value: 100,
                            text: 'No Data',
                            percentage: 100,
                            color: DEFAULT_COLOR,
                          },
                        ]
                      : donutData
                  }
                  radius={chartSize / 2}
                  innerRadius={chartSize * 0.3}
                  textColor={textColor}
                  textSize={12}
                  showText={false}
                  donut
                  innerCircleColor={secondaryBackgroundColor}
                />

                <View style={styles.chartOverlay}>
                  <Text style={[styles.totalBalance, { color: textColor }]}>
                    {donutError
                      ? '0'
                      : donutTotal < 1000
                      ? `${donutTotal.toFixed(2)}`
                      : `${(donutTotal / 1000).toFixed(1)}K`}
                  </Text>

                  <Text style={{ fontSize: 12, color: iconColor }}>
                    {donutMode.toUpperCase()}
                  </Text>

                  {(donutMode === 'asset' || donutMode === 'debt') && (
                    <Text style={styles.balanceChange}>
                      <Text
                        style={{
                          color: overviewError
                            ? iconColor
                            : mtdChange > 0
                            ? '#25ab00ff'
                            : mtdChange < 0
                            ? '#FF3B30'
                            : iconColor,
                        }}
                      >
                        ({overviewError ? '0.0' : mtdPercentage.toFixed(1)}%) MTD
                      </Text>
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.legendContainer}>
                {donutError || donutTotal === 0 ? (
                  <View style={styles.legendItem}>
                    <View
                      style={[
                        styles.legendColor,
                        { backgroundColor: DEFAULT_COLOR },
                      ]}
                    />
                    <Text style={[styles.legendText, { color: iconColor }]}>
                      No Data 100%
                    </Text>
                  </View>
                ) : (
                  donutData.map((item, index) => (
                    <View key={`${item.text}-${index}`} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendColor,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={[styles.legendText, { color: iconColor }]}>
                        {item.text} {item.percentage.toFixed(0)}%
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </>
          )}
        </View>
        
        {/* Weekly Cash flows (past 4 weeks) */}
        <View style={[styles.cashflowContainer, { backgroundColor: secondaryBackgroundColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Weekly Cash Flows
          </Text>

          {cashflowLoading ? (
            <View style={{ height: 240, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color="#0047AB" />
            </View>
          ) : (
            <View style={styles.cashflowChartWrapper}>
              {(() => {
                const chartData =
                  weeklyCashflows.length > 0
                    ? weeklyCashflows
                    : [
                        { week_start: '', week_end: '', net_cashflow: 0, label: 'W1' },
                        { week_start: '', week_end: '', net_cashflow: 0, label: 'W2' },
                        { week_start: '', week_end: '', net_cashflow: 0, label: 'W3' },
                        { week_start: '', week_end: '', net_cashflow: 0, label: 'W4' },
                      ];

                const maxValue = Math.max(
                  ...weeklyCashflows.map(w => Math.abs(w.net_cashflow || 0)),
                  1
                );

                const yLabels = [
                  maxValue,
                  maxValue * 0.75,
                  maxValue * 0.5,
                  maxValue * 0.25,
                  0,
                ];

                const formatYAxisValue = (value: number) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(1)}K`;
                  }

                  return value.toFixed(0);
                };

                return (
                  <View style={styles.cashflowChartRow}>
                    {/* Y-axis values */}
                    <View style={styles.yAxisLabelsContainer}>
                      {yLabels.map((labelValue, index) => (
                        <Text
                          key={index}
                          style={[styles.yAxisLabel, { color: iconColor }]}
                        >
                          {formatYAxisValue(labelValue)}
                        </Text>
                      ))}
                    </View>

                    {/* Chart Area */}
                    <View style={styles.cashflowChartArea}>
                      {/* Y Axis */}
                      <View style={[styles.yAxis, { backgroundColor: borderColor }]} />

                      {/* Bars */}
                      <View style={styles.barContainer}>
                        {chartData.map((item, index) => {
                          const value = item.net_cashflow || 0;

                          const height =
                            weeklyCashflows.length === 0
                              ? 0
                              : (Math.abs(value) / maxValue) * 120;

                          const color =
                            value > 0
                              ? '#22C55E'
                              : value < 0
                              ? '#F59E0B'
                              : '#9CA3AF';

                          const label =
                            weeklyCashflows.length === 0
                              ? item.label
                              : formatWeekLabel(item.week_start, item.week_end);

                          return (
                            <View key={index} style={styles.barItem}>
                              <View style={styles.barSlot}>
                                {weeklyCashflows.length > 0 && (
                                  <Text style={[styles.barValue, { color: iconColor }]}>
                                    {value >= 1000 || value <= -1000
                                      ? `${value < 0 ? '-' : ''}${(Math.abs(value) / 1000).toFixed(1)}K`
                                      : value.toFixed(0)}
                                  </Text>
                                )}                        
                                <View
                                  style={[
                                    styles.bar,
                                    {
                                      height,
                                      backgroundColor: color,
                                    },
                                  ]}
                                />
                              </View>

                              <Text style={[styles.barLabel, { color: iconColor }]}>
                                {label}
                              </Text>
                            </View>
                          );
                        })}
                      </View>

                      {/* X Axis */}
                      <View style={[styles.xAxis, { backgroundColor: borderColor }]} />
                    </View>
                  </View>
                );
              })()}

              {weeklyCashflows.length === 0 && (
                <Text style={[styles.noCashflowText, { color: iconColor }]}>
                  No cashflow data
                </Text>
              )}
            </View>
          )}
        </View>
          
        {/* Recent Transactions Section */}
        <View style={[styles.transactionsContainer, { backgroundColor: secondaryBackgroundColor }]}>
          <TouchableOpacity
            style={styles.transactionsHeader}
            onPress={() => router.push({ pathname: '/transactionsList' })}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Transactions</Text>
            <AngleSmallRightIcon width={24} height={24} fill={iconColor}/>
          </TouchableOpacity>
          {transactionsLoading ? (
            <View style={[ styles.centered, { marginVertical: 16 }]}>
              <ActivityIndicator color="#0047AB" />
            </View>
          ) : transactionsError ? (
            <View style={styles.centered}>
              <Error message='An error occured.' />
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.centered}>
              <Error message='No transactions found.' />
            </View>
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              keyExtractor={(item: TransactionType) => item.transaction_id.toString()}
              style={styles.transactionList as StyleProp<ViewStyle>}
              refreshing={transactionsLoading}
              initialNumToRender={5}
              maxToRenderPerBatch={10}
            />
          )}
        </View>
      </ScrollView>

      {/* Info Modal */}
      <InfoModal 
        visible={NetWorthModalVisible}
        onClose={() => setNetWorthModalVisible(false)}
        title="Net Worth Information"
        content="Net Worth is calculated as the total value of your assets minus your liabilities. It provides a snapshot of your overall financial health."
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  netWorthContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center',
  },
  netWorthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  netWorthTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  netWorthAmount: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 8,
  },
  currencyText: {
    fontSize: 12,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 300,
  },
  chartOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  totalBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceChange: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  cashflowContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cashflowChartWrapper: {
    marginTop: 20,
    position: 'relative',
    minHeight: 190,
  },
  cashflowChartArea: {
    flex: 1,
    height: 160,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  cashflowChartRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  yAxisLabelsContainer: {
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginRight: 8,
    width: 42,
  },
  yAxisLabel: {
    fontSize: 10,
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 1,
    height: 150,
  },
  xAxis: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 26,
    height: 1,
  },
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
  },
  barSlot: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  noCashflowText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
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
    minHeight: 250,
  },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionAccount: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
  },
});