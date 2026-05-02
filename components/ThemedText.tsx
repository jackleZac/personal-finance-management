import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'h3' | 'small' | 'xxs' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'h3' ? styles.h3 : undefined,
        type === 'small' ? styles.small : undefined,
        type === 'xxs' ? styles.xxs : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: 'NotoSansGeorgian-Regular', // Normal text: Regular, size 14
    fontSize: 14,
    lineHeight: 21, // Adjusted lineHeight (1.5x fontSize for better readability)
  },
  defaultSemiBold: {
    fontFamily: 'NotoSansGeorgian-Bold', // Using Bold for semi-bold
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: 'NotoSansGeorgian-Bold', // h1: Bold, size 24
    fontSize: 24,
    lineHeight: 32, // Adjusted lineHeight for better readability
  },
  subtitle: {
    fontFamily: 'NotoSansGeorgian-Bold', // h2: Bold, size 17
    fontSize: 17,
    lineHeight: 24, // Adjusted lineHeight
  },
  h3: {
    fontFamily: 'NotoSansGeorgian-Bold', // h3: Bold, size 15
    fontSize: 15,
    lineHeight: 20, // Adjusted lineHeight
  },
  small: {
    fontFamily: 'NotoSansGeorgian-Regular', // Small text: Regular, size 12
    fontSize: 12,
    lineHeight: 18, // Adjusted lineHeight
  },
  xxs: {
    fontFamily: 'NotoSansGeorgian-Light', // XXS text: Light, size 10
    fontSize: 10,
    lineHeight: 15, // Adjusted lineHeight
  },
  link: {
    fontFamily: 'NotoSansGeorgian-Regular', // Link: Regular
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});