import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Account as AccountType } from '@/types/types';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getIconsByCurrency } from '@/assets/flagMapping';
import { getGenericIcon } from '@/assets/genericIconsMapping';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

type Props = {
  account: AccountType;
  percentage?: number;
  onPress?: () => void;
};

export default function AccountCard({ account, percentage = 0, onPress }: Props) {
  const backgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const iconColor = useThemeColor({}, 'icon');

  const Flag = getIconsByCurrency(account.currency)[0]?.source;
  const AngleRightIcon = getGenericIcon('Angle Small Right Icon')[0]?.source;

  const formattedBalance = Number(account.balance || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor }]}
    >
      <View style={styles.topRow}>
        <View style={styles.currencyRow}>
          {Flag && <Flag width={54} height={36} />}
          <Text style={[styles.currencyText, { color: secondaryTextColor }]}>
            {account.currency}
          </Text>
        </View>

        {AngleRightIcon && (
          <AngleRightIcon width={26} height={26} fill={iconColor} />
        )}
      </View>

      <Text style={[styles.accountName, { color: textColor }]}>
        {account.name}
      </Text>

      <Text style={[styles.accountType, { color: secondaryTextColor }]}>
        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
      </Text>

      <View style={styles.bottomRow}>
        <Text style={[styles.balance, { color: textColor }]}>
          {formattedBalance}
        </Text>

        <AnimatedCircularProgress
          size={60}
          width={10}
          fill={percentage}
          tintColor="#23AFC4"
          backgroundColor="#E5E7EB"
          rotation={0}
          lineCap="round"
        >
          {() => (
            <Text style={[styles.percentageText, { color: secondaryTextColor }]}>
              {Math.round(percentage)}%
            </Text>
          )}
        </AnimatedCircularProgress>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    height: 200,
    borderRadius: 14,
    padding: 18,
    marginRight: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '700',
  },
  accountName: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  accountType: {
    marginTop: 14,
    fontSize: 14,
  },
  bottomRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balance: {
    fontSize: 28,
    fontWeight: '800',
  },
  percentageText: {
    fontSize: 17,
    fontWeight: '500',
  },
});