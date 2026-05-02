import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ErrorProps {
  message: string;
}

// Error component to display error messages
const Error: React.FC<ErrorProps> = ({ message }) => {
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  return (
    <View style={styles.centered}>
        <Text style={[ styles.errorText, { backgroundColor: secondaryBackgroundColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 300,
  },
  errorText: {
    fontSize: 16,
    color: '#888',
  },
});

export default Error;