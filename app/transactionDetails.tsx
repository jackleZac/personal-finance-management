import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getIconsById, getUncategorizedIcon } from '@/assets/categoryMapping';
import { Transaction, Category, Account } from '@/types/types';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { SvgProps } from 'react-native-svg';

export default function TransactionDetails() {
  const params = useLocalSearchParams();
  const transaction = JSON.parse(params.transaction as string) as Transaction;
  const categories = JSON.parse(params.categories as string) as Category[];
  const accounts = JSON.parse(params.accounts as string) as Account[];

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  // Map categories and accounts for display
  const categoryMap = categories.reduce((acc: { [key: number]: Category }, cat) => {
    acc[cat.category_id] = cat;
    return acc;
  }, {});
  
  const accountMap = accounts.reduce((acc: { [key: number]: string }, account) => {
    acc[account.account_id] = account.name;
    return acc;
  }, {});

  const category = categoryMap[transaction.category_id] || { name: 'Unknown', icon_id: '0' };
  
  // Get the correct SVG icon component from categoryMapping
  const matchingIcons = getIconsById(parseInt(category.icon_id));
  const CategoryIcon: React.FC<SvgProps> | null = matchingIcons.length > 0 ? matchingIcons[0].source : null;
  
  // Fallback to Uncategorized icon if no category icon found
  const UncategorizedIcon = getUncategorizedIcon();
  
  const isExpense = transaction.type === 'expense';
  const accountName = accountMap[transaction.account_id] || 'Unknown Account';

  const handleEdit = () => {
    router.push({
      pathname: '/updateTransaction',
      params: {
        transaction: JSON.stringify(transaction),
        categories: JSON.stringify(categories),
        accounts: JSON.stringify(accounts),
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Transaction Details" variant="back" />
      <View style={styles.detailsContainer}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isExpense ? '#FECACA' : '#A7F3D0' },
          ]}
        >
          {CategoryIcon ? (
            <CategoryIcon width={60} height={60} />
          ) : (
            <UncategorizedIcon width={60} height={60} />
          )}
        </View>
        <Text style={[styles.categoryName, { color: textColor }]}>{category.name}</Text>
        <Text style={[styles.amount, { color: isExpense ? '#FF3B30' : '#34C759' }]}>
          {isExpense ? '-' : '+'}
          {transaction.amount} {transaction.currency}
        </Text>
        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Account:</Text>
          <Text style={[styles.value, { color: textColor }]}>{accountName}</Text>
        </View>
        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Date:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {new Date(transaction.transaction_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        {transaction.description && (
          <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: iconColor }]}>Description:</Text>
            <Text style={[styles.value, { color: textColor }]}>{transaction.description}</Text>
          </View>
        )}
        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Type:</Text>
          <Text style={[styles.value, { color: textColor }]}>{transaction.type}</Text>
        </View>
        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Recurring:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {transaction.is_recurring ? 'Yes' : 'No'}
          </Text>
        </View>
      </View>
      
      {/* Edit Button */}
      <Button
        title="Edit Transaction"
        onPress={handleEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});