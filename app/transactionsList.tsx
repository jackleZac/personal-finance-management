import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { fetchTransactions } from '@/api/transactionApi';
import { fetchAccounts } from '@/api/accountApi';
import { fetchCategories } from '@/api/categoryApi';
import { getCurrentMonthDates } from '@/utils/dateUtils';
import { useAuth } from '@/hooks/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getIconsById, getUncategorizedIcon } from '@/assets/categoryMapping';
import { Account as AccountType, Transaction as TransactionType, Category as CategoryType, AccountsResponse } from '@/types/types';
import Header from '@/components/Header';
import { SvgProps } from 'react-native-svg';
import WebSocketService from '@/api/webSocketService';

type CategoryDetails = {
  name: string;
  icon_id: string;
};

type CategoryDetailsMap = {
  [key: number]: CategoryDetails;
};

type CategoryDisplay = {
  name: string;
  icon: React.FC<SvgProps> | null;
};

type CategoryDisplayMap = {
  [key: number]: CategoryDisplay;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [showRecurring, setShowRecurring] = useState<boolean>(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [categoryDisplayMap, setCategoryDisplayMap] = useState<CategoryDisplayMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { userId, token } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackground = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const filterTabBackground = useThemeColor({}, 'filterButtonBackground');
  const iconColor = useThemeColor({}, 'icon');
  const filterContainerBackground = useThemeColor({}, 'filterContainerBackground');

  const accountMap = accounts.reduce((acc: { [key: number]: string }, account) => {
    acc[account.account_id] = account.name;
    return acc;
  }, {});

  const loadData = async (accountId?: number, recurring?: boolean) => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      const { startDate, endDate } = getCurrentMonthDates();
      const transactionsResponse = await fetchTransactions(token, startDate, endDate, accountId);
      // Filter transactions based on recurring status if showRecurring is true
      const filteredTransactions = recurring 
        ? (transactionsResponse.transactions || []).filter((tx: TransactionType) => tx.is_recurring)
        : transactionsResponse.transactions || [];
      
      // Sort transactions by date (newest first)
      const sortedTransactions = filteredTransactions.sort((a: TransactionType, b: TransactionType) => {
        return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
      });
      
      setTransactions(sortedTransactions);
      
      const accountsResponse: AccountsResponse = await fetchAccounts(token);
      const fetchedAllAccounts = [...(accountsResponse.assets || []), ...(accountsResponse.debt || [])];
      setAccounts(fetchedAllAccounts);

      const categoryResponse = await fetchCategories(token);
      const categories = categoryResponse.categories || [];
      setCategories(categories);

      const categoryDetailsMap: CategoryDetailsMap = categories.reduce((acc: CategoryDetailsMap, category: CategoryType) => {
        acc[category.category_id] = {
          name: category.name,
          icon_id: category.icon_id,
        };
        return acc;
      }, {});

      const categoriesWithIcons: CategoryDisplayMap = Object.keys(categoryDetailsMap).reduce((acc: CategoryDisplayMap, categoryId: string) => {
        const category = categoryDetailsMap[parseInt(categoryId)];
        const matchingIcons = getIconsById(parseInt(category.icon_id));
        const iconComponent = matchingIcons.length > 0 ? matchingIcons[0].source : null;

        acc[parseInt(categoryId)] = {
          name: category.name,
          icon: iconComponent,
        };
        return acc;
      }, {});
      setCategoryDisplayMap(categoriesWithIcons);
    } catch (err) {
      console.error(err);
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedAccountId ?? undefined, showRecurring);
  }, [selectedAccountId, showRecurring]);

    // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (userId && token) {
      // Initialize WebSocket with token
      WebSocketService.initialize(token);

      // Listen for a list of transaction updates from backend
      WebSocketService.on('list_of_transactions_update', (data) => {
        console.log('Received list of transactions update:', data);
        // Reload all data with current filters
        loadData(selectedAccountId ?? undefined, showRecurring);
      });
      
      // Listen for a list of account updates from backend
      WebSocketService.on('net_worth_and_list_of_accounts_update', (data) => {
        console.log('Received list of accounts update:', data);
        // Reload all data with current filters
        loadData(selectedAccountId ?? undefined, showRecurring);
      });

      // Listen for category updates from backend
      WebSocketService.on('categories_update', (data) => {
        console.log('Received categories update:', data);
        // Reload all data with current filters
        loadData(selectedAccountId ?? undefined, showRecurring);
      });
    };

    // Cleanup: Remove listener on unmount
    return () => {
      WebSocketService.on('list_of_transactions_update', () => {});  // Empty callback to remove
      WebSocketService.on('net_worth_and_list_of_accounts_update', () => {});  // Empty callback to remove
      WebSocketService.on('categories_update', () => {});  // Empty callback to remove
    };
  }, [userId, token]);

  const renderFilterTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[ styles.tabContainer, { backgroundColor: filterContainerBackground}]}>
      {/* "All" Tab */}
      <TouchableOpacity
        style={[
          styles.tab, 
          { backgroundColor: filterTabBackground },
          selectedAccountId === null && !showRecurring && styles.tabActive
        ]}
        onPress={() => {
          setSelectedAccountId(null);
          setShowRecurring(false);
        }}
      >
        <Text style={[styles.tabText, { color: secondaryTextColor }, selectedAccountId === null && !showRecurring && styles.tabTextActive]}>All</Text>
      </TouchableOpacity>
      {/* "Recurring" Tab */}
      <TouchableOpacity
        style={[
          styles.tab, 
          { backgroundColor: filterTabBackground },
          showRecurring && styles.tabActive]}
        onPress={() => {
          setSelectedAccountId(null);
          setShowRecurring(true);
        }}
      >
        <Text style={[styles.tabText, { color: secondaryTextColor }, showRecurring && styles.tabTextActive]}>Recurring</Text>
      </TouchableOpacity>
      {/* "Accounts" Tab */}
      {accounts.map((account) => (
        <TouchableOpacity
          key={account.account_id}
          style={[
            styles.tab, 
            { backgroundColor: filterTabBackground },
            selectedAccountId === account.account_id && !showRecurring && styles.tabActive
          ]}
          onPress={() => {
            setSelectedAccountId(account.account_id);
            setShowRecurring(false);
          }}
        >
          <Text
            style={[
              styles.tabText,
              { color: secondaryTextColor },
              selectedAccountId === account.account_id && !showRecurring && styles.tabTextActive,
            ]}
          >
            {account.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTransactionItem = ({ item }: { item: TransactionType }) => {
    const category = categories.find(cat => cat.category_id === item.category_id) || { name: 'Unknown Category', icon_id: '0' };
    const isExpense = item.type === 'expense';
    const accountName = accountMap[item.account_id] || 'Unknown Account';
    
    const categoryDisplay = categoryDisplayMap[item.category_id] || { name: 'Unknown', icon: null };
    const CategoryIcon = categoryDisplay.icon;

    // Fallback to Uncategorized icon if no category icon found
    const UncategorizedIcon = getUncategorizedIcon();

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/transactionDetails',
            params: {
              transaction: JSON.stringify(item),
              categories: JSON.stringify(categories),
              accounts: JSON.stringify(accounts),
            },
          })
        }
      >
        <View style={[styles.transactionItem, { backgroundColor: secondaryBackground }]}>
          <View
            style={[
              styles.iconContainer,
            ]}
          >
            {CategoryIcon ? (
              <CategoryIcon width={36} height={36} /> 
            ) : (
              <UncategorizedIcon width={36} height={36} />
            )}
          </View>

          <View style={styles.transactionDetails}>
            <Text style={[styles.transactionDescription, { color: textColor }]}>
              {category.name}
            </Text>
            <Text style={[styles.transactionAccount, { color: textColor }]}>
              {accountName}
            </Text>
          </View>
          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, { color: isExpense ? 'red' : 'green' }]}>
              {isExpense ? '-' : '+'}
              {item.amount}
            </Text>
            <Text style={[styles.transactionDate, { color: textColor }]}>
              {new Date(item.transaction_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header 
        title='Transactions'
        variant='back'
      />
      {renderFilterTabs()}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#0000ff" />
        </View>
      ) : transactions.length === 0 ? (
        <View style={[styles.errorContainer, { backgroundColor: backgroundColor }]}>
          <Text style={{ textAlign: 'center' }}>No transactions found.</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.transaction_id.toString()}
          style={[styles.transactionList, { backgroundColor }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0.2,
    borderBottomColor: '#F3F4F6',
    borderRadius: 8,
    marginVertical: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  transactionAccount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  fallbackIcon: {
    fontSize: 24,
    color: '#888',
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
});