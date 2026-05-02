import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title?: string;
  buttonType?: 'create' | 'update' | 'delete';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title = 'Save',
  buttonType = 'create',
  disabled = false,
  style,
  textStyle,
}) => {
  // Determine button styles based on buttonType
  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (buttonType === 'create') {
      return {
        ...baseStyle,
        backgroundColor: disabled ? '#ccc' : '#246BFD',
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
      };
    }

    if (buttonType === 'delete') {
      return {
        ...baseStyle,
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#FF3B30',
        paddingVertical: 16,
      };
    }

    // Update button
    return {
      ...baseStyle,
      flex: 1,
      backgroundColor: disabled ? '#ccc' : '#007AFF',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    };
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseTextStyle: TextStyle = {
      fontSize: 16,
      fontWeight: buttonType === 'delete' ? '500' : buttonType === 'create' ? '400' : '700',
    };

    if (buttonType === 'delete') {
      return {
        ...baseTextStyle,
        color: '#FF3B30',
      };
    }

    return {
      ...baseTextStyle,
      color: '#fff',
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;