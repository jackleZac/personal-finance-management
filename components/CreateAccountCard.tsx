import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getGenericIcon } from '@/assets/genericIconsMapping';

type Props = {
  onPress: () => void;
};

export default function CreateAccountCard({ onPress }: Props) {
  const lightBlue = '#E6F0FF';
  const darkBlue = '#0047AB';

  const PlusIcon = getGenericIcon('Add Icon')[0]?.source;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: lightBlue, borderColor: darkBlue }]}>
      <View style={styles.content}>
        {PlusIcon ? (
          <PlusIcon width={28} height={28} fill={darkBlue} />
        ) : (
          <Text style={{ fontSize: 28, color: darkBlue }}>+</Text>
        )}

        <Text style={[styles.text, { color: darkBlue }]}>
          Create Account
        </Text>
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
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});