import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '@/components/Header';
import Button from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Account } from '@/types/types';

export default function AccountDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const account = JSON.parse(params.account as string) as Account;

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  const isDebt = account.type === 'debt';
  const isInvestment = account.type === 'investment';
  const isCash = account.type === 'cash';

  const balanceColor = isDebt ? '#FF3B30' : '#34C759';

  const handleEdit = () => {
    router.push({
      pathname: '/updateAccount',
      params: {
        accountId: account.account_id.toString(),
        accountName: account.name,
        currency: account.currency,
        targetAmount: account.target_amount?.toString() ?? '0',
        balance: account.balance.toString(),
        accountType: account.type,
      },
    });
  };

  const formatMoney = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '-';

    return `${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${account.currency}`;
  };

  const getAccountTypeLabel = () => {
    if (isCash) return 'Cash Account';
    if (isInvestment) return 'Investment Account';
    if (isDebt) return 'Debt Account';
    return 'Account';
  };

  const getAccountInitial = () => {
    return account.name?.charAt(0).toUpperCase() || '?';
  };

  // Calculate savings progress
  const hasTargetAmount = account.target_amount !== null && account.target_amount > 0;
  const targetProgress = hasTargetAmount
    ? Math.min((account.balance / account.target_amount!) * 100, 100)
    : null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Account Details" variant="back" />

      <View style={styles.detailsContainer}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDebt
                ? '#FECACA'
                : isInvestment
                ? '#BFDBFE'
                : '#A7F3D0',
            },
          ]}
        >
          <Text
            style={[
              styles.accountInitial,
              {
                color: isDebt
                  ? '#991B1B'
                  : isInvestment
                  ? '#1E3A8A'
                  : '#065F46',
              },
            ]}
          >
            {getAccountInitial()}
          </Text>
        </View>

        <Text style={[styles.accountName, { color: textColor }]}>
          {account.name}
        </Text>

        <Text style={[styles.accountType, { color: iconColor }]}>
          {getAccountTypeLabel()}
        </Text>

        <Text style={[styles.balance, { color: balanceColor }]}>
          {isDebt ? '-' : '+'}
          {formatMoney(account.balance)}
        </Text>

        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Account Type:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {account.type}
          </Text>
        </View>

        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Currency:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {account.currency}
          </Text>
        </View>

        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Balance:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {formatMoney(account.balance)}
          </Text>
        </View>

        {account.converted_balance !== undefined && account.converted_balance !== null && (
          <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: iconColor }]}>Converted Balance:</Text>
            <Text style={[styles.value, { color: textColor }]}>
              {account.converted_balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
        )}

      <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
        <Text style={[styles.label, { color: iconColor }]}>Target Amount</Text>
        <Text style={[styles.value, { color: textColor }]}>
          {account.target_amount !== null ? (
            formatMoney(account.target_amount)
          ) : (
            'Not Set'
          )}
        </Text>
      </View>          

      {hasTargetAmount && targetProgress !== null && (
        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Savings Progress:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {targetProgress.toFixed(1)}%
          </Text>
        </View>
      )}

      {account.percentage !== undefined && account.percentage !== null && (
        <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
          <Text style={[styles.label, { color: iconColor }]}>Portfolio Share:</Text>
          <Text style={[styles.value, { color: textColor }]}>
            {account.percentage.toFixed(1)}%
          </Text>
        </View>
      )}
      </View>

      <Button title="Edit Account" onPress={handleEdit} />
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
  accountInitial: {
    fontSize: 36,
    fontWeight: '700',
  },
  accountName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  accountType: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  balance: {
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
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    textTransform: 'capitalize',
  },
});