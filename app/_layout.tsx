import 'react-native-get-random-values';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NotificationProvider } from '@/hooks/NotificationContext';
import { useEffect, useState } from 'react';
import { ModalProvider } from '@/hooks/ModalContext';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import { TransactionProvider } from '@/hooks/TransactionContext';
import { AuthProvider, useAuth } from '@/hooks/AuthContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Separate component to handle auth-based navigation
function RootLayoutNav() {
  const { token, userId, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [initialNavigationDone, setInitialNavigationDone] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (initialNavigationDone) return;

    const isAuthenticated = !!(token && userId);
    console.log('Initial navigation:', { isAuthenticated });

    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/login');
    }
    
    setInitialNavigationDone(true);
  }, [isLoading, token, userId, initialNavigationDone]);

  // Handle authentication state changes after initial load
  useEffect(() => {
    if (isLoading || !initialNavigationDone) return;

    const inTabs = segments[0] === '(tabs)';
    const onAuthScreens = segments[0] === 'login' || segments[0] === 'signup';
    const isAuthenticated = !!(token && userId);

    console.log('Auth state changed:', { isAuthenticated, segments, inTabs, onAuthScreens });

    // If not authenticated but trying to access protected routes
    if (!isAuthenticated && inTabs) {
      console.log('Not authenticated, redirecting to login');
      router.replace('/login');
    }
    // Note: Removed the redirect from auth screens when authenticated
    // This allows manual navigation to login (for logout flows, etc.)
  }, [token, userId, segments, initialNavigationDone]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="accountDetails" options={{ title: 'Account Details' }} />
      <Stack.Screen name="budgetsList" options={{ title: 'Budget List' }} />
      <Stack.Screen name="budgetTrends" options={{ title: 'Budget Trends' }} />
      <Stack.Screen name="customCategories" options={{ title: 'Custom Categories' }} />
      <Stack.Screen name="notification" options={{ title: 'Notification' }} />
      <Stack.Screen name="profileDetails" options={{ title: 'Profile Details' }} />
      <Stack.Screen name="spendingHabits" options={{ title: 'Spending Habits' }} />
      <Stack.Screen name="transactionDetails" options={{ title: 'Transaction Details' }} />
      <Stack.Screen name="transactionsList" options={{ title: 'Transactions List' }} />
      <Stack.Screen name="updateAccount" options={{ title: 'Update Account' }} />
      <Stack.Screen name="updateBaseCurrency" options={{ title: 'Update Base Currency' }} />
      <Stack.Screen name="updateBudget" options={{ title: 'Update Budget' }} />
      <Stack.Screen name="updateCategory" options={{ title: 'Update Category' }} />
      <Stack.Screen name="updatePassword" options={{ title: 'Update Password' }} />
      <Stack.Screen name="updatePlan" options={{ title: 'Update Plan' }} />
      <Stack.Screen name="updateProfile" options={{ title: 'Update Profile' }} />
      <Stack.Screen name="updateTransaction" options={{ title: 'Update Transaction' }} />
      <Stack.Screen name="forgotPassword" options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="resetPassword" options={{ title: 'Reset Password' }} />
      <Stack.Screen
        name="createTransaction"
        options={{ presentation: 'modal', headerShown: false }}
      />
    </Stack>
  );
}

export default function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('Starting app initialization...');
        
        // Configure Google Sign In
        GoogleSignin.configure({
          webClientId: '879691933449-5671p88n8fci3vch8281ajpq0msv9tdv.apps.googleusercontent.com',
          scopes: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
          ],
          offlineAccess: false,
        });

        console.log('Google Sign In configured');
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (e) {
        console.error('Setup Error:', e);
      } finally {
        console.log('Setting app as ready');
        setAppIsReady(true);
        await SplashScreen.hideAsync();
        console.log('Splash screen hidden');
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0047AB" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <TransactionProvider>
          <ModalProvider>
            <RootLayoutNav />
          </ModalProvider>
        </TransactionProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}