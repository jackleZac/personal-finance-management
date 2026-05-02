import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getGenericIcon } from '@/assets/genericIconsMapping';
import { useThemeColor } from '@/hooks/useThemeColor';

/*
 OptionItem is a reusable components for several modals:
  - CreateTransaction
  - CreateAccount
  - CreateBudget
  - CreateCategory
*/

interface OptionItemProps {
  icon: string; // Name of the icon (e.g., 'Calendar Icon', 'Price Tag Icon')
  label: string;
  value?: string; // Optional for cases where renderValue is used
  value2?: string; // Optional second value (e.g., for category type - expense/income)
  onPress?: () => void; // Optional for read-only cases like Notes
  renderValue?: () => ReactNode; // Optional for custom value rendering (e.g., TextInput)
  fill?: string; // Optional fill color for SVG icon
}

const OptionItem: React.FC<OptionItemProps> = ({ icon, label, value, value2, onPress, renderValue, fill = '#fff' }) => {
  // Retrieve the icon data based on the icon name
  const IconData = getGenericIcon(icon)[0].source;
  // Get Angle Small Right icon
  const AngleSmallRightIcon = getGenericIcon('Angle Small Right Icon')[0].source;

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <TouchableOpacity style={styles.option} onPress={onPress} disabled={!onPress}>
      {/* Icon and label/value container */}
      <View style={styles.optionContent}>
        {IconData ? (
          // Render SVG icon with specified fill color
          <View style={styles.iconContainer}>
            <IconData width={24} height={24} fill={fill} />
          </View>
        ) : (
          // Fallback if icon not found
          <Text style={styles.fallbackIcon}>?</Text>
        )}
        {
          value ? (
            <>
              <Text style={[styles.optionValue, { color: textColor }]}>{value || ''}</Text>
            </>
          ) : (
            <Text style={[styles.optionText, { color: secondaryTextColor }]}>{label}</Text>
          )
        }
        {value2 ? (
          <>
          <View style={[ styles.value2 ]}>
            <Text style={ styles.value2Text }>{value2.toLocaleUpperCase().replace('(', '').replace(')', '') || ''}</Text>
          </View>
          </>
        ) : null
        }
      </View>
      {/* Custom value or navigation arrow container */}
      <View style={styles.valueContainer}>
        {renderValue ? (
          renderValue()
        ) : (
          <>
            <AngleSmallRightIcon width={24} height={24} fill={iconColor}/>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#777',
  },
  optionValue: {
    marginLeft: 16,
    fontSize: 16,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1CA9C9',
    borderRadius: 100,
  },
  fallbackIcon: {
    fontSize: 24,
    color: '#888',
  },
  value2: {
    backgroundColor: '#7830ffff',
    marginLeft: 8,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  value2Text: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  }
});

export default OptionItem;