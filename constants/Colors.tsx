/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000000',
    secondaryText: '#000000ff',
    background: '#F3F3F3', // main background
    border: '#CCCCCC',
    secondaryBackground: '#FFFFFF', // cards and modals
    headerNavBackground: '#FFFFFF', // header and navigation bars
    tint: tintColorLight,
    icon: '#000000',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    searchInputBackground: '#F0F0F0',
    selectedTabBackground: '#1520A6',
    filterButtonBackground: '#E0E0E0',
    filterContainerBackground: '#FFFFFF',
  },
  dark: {
    text: '#ffffff',
    secondaryText: '#ffffff',
    background: '#151718', // main background
    border: '#A9A9A9',
    secondaryBackground: '#494F55', // cards and modals
    headerNavBackground: '#151718', // header and navigation bars
    tint: tintColorDark,
    icon: '#ffffff',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    searchInputBackground: '#687076',
    selectedTabBackground: '#1a3c8e',
    filterButtonBackground: '#687076',
    filterContainerBackground: '#151718',
  },
};