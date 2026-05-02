import { View } from 'react-native';
import { Tabs } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ title: 'Home' }}/>
        <Tabs.Screen
          name="createTransaction"
          options={{ title: 'Transaction' }}
        />
        <Tabs.Screen
          name="budget"
          options={{ title: 'Budget' }}
        />
        <Tabs.Screen
          name="settings"
          options={{ title: 'Settings' }}
        />
      </Tabs>
    </View>
  );
}