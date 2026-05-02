import { View, TouchableOpacity, Text } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { useModal } from '../hooks/ModalContext';
import { getGenericIcon } from '@/assets/genericIconsMapping';
import { BottomTabBarProps as NativeBottomTabBarProps } from '@react-navigation/bottom-tabs';

const CustomTabBar: React.FC<NativeBottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { setIsCreateTransactionVisible } = useModal();

  const NavBackgroundColor = useThemeColor({}, 'headerNavBackground');
  const tabIconDefault = useThemeColor({}, 'tabIconDefault');
  const tabIconSelected = useThemeColor({}, 'tabIconSelected');
  const borderColor = useThemeColor({ light: '#CCCCCC', dark: '#A9A9A9' }, 'border');


  const iconNameMap: { [key: string]: string } = {
    home: 'House Chimney Icon',
    createTransaction: 'Add Icon',
    budget: 'Pie Chart 2 Icon',
    settings: 'Settings Icon',
  };

return (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      height: 70,
      paddingBottom: 16,
      backgroundColor: NavBackgroundColor,
      borderTopWidth: 0.2,
      borderTopColor: borderColor,
    }}
  >
    {state.routes.map((route, index) => {
      const { options } = descriptors[route.key];
      const label = options.tabBarLabel ?? options.title ?? route.name;
      const isFocused = state.index === index;

      const labelElement =
        typeof label === 'function'
          ? label({
              focused: isFocused,
              color: isFocused ? tabIconSelected : tabIconDefault,
              position: 'below-icon',
              children: route.name,
            })
          : label;

      const onPress = () => {
        if (route.name === 'createTransaction') {
          setIsCreateTransactionVisible(true);
        }

        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      };

      const iconName = iconNameMap[route.name];
      const Icon = iconName ? getGenericIcon(iconName)[0]?.source : null;

      return (
        <TouchableOpacity
          key={route.key}
          onPress={onPress}
          style={{ alignItems: 'center', flex: 1 }}
        >
          {Icon ? (
            <Icon
              width={24}
              height={24}
              fill={isFocused ? tabIconSelected : tabIconDefault}
            />
          ) : (
            <Text>No Icon</Text>
          )}

        {typeof label === 'function' ? (
          labelElement
        ) : (
          <Text
            style={{
              color: isFocused ? tabIconSelected : tabIconDefault,
              fontSize: 10,
            }}
          >
            {route.name === 'createTransaction' ? 'Transactions' : labelElement}
          </Text>
        )}
        </TouchableOpacity>
      );
    })}
  </View>
);
};

export default CustomTabBar;