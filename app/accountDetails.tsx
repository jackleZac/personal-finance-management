import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Header from '@/components/Header';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function AccountDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'border');

  // Account details
  const accountId = params.accountId as string;
  const accountName = params.accountName as string;
  const accountType = params.accountType as string;
  const targetAmount = parseFloat(params.targetAmount as string) || 0;
  const balance = parseFloat(params.balance as string);
  const currency = params.currency as string;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <Header 
        title={accountName} 
        variant="back"
        onEditPress={() =>
          router.push({
            pathname: '/updateAccount',
            params: { 
              accountId, 
              accountName, 
              currency, 
              targetAmount: targetAmount.toString(), 
              balance: balance.toString(), 
              accountType 
            },
          })
        } 
      />
    </View>
  );
}

