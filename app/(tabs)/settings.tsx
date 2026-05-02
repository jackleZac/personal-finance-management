import React, { useState, useEffect } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { fetchUserDetails } from '@/api/userApi';
import { downloadMonthlyReport } from '@/api/reportApi';
import { User as UserType } from '@/types/types';
import { useAuth } from '@/hooks/AuthContext';
import { getGenericIcon } from '@/assets/genericIconsMapping';
import { useThemeColor } from '@/hooks/useThemeColor';

type ProfileParams = {
  name: string;
  email: string;
  status: string;
  subscription_plan: string;
  subscription_start_date: string;
  subscription_end_date: string;
  next_payment_due_date: string;
  trial_remaining_days: string;
  created_at: string;
  updated_at: string;
};

type CurrencyParams = {
  base_currency: string;
};

export default function Settings() {
  const router = useRouter();
  const { token, userId } = useAuth();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const iconColor = useThemeColor({}, 'icon');

  // Get Angle Small Right Icon
  const AngleSmallRightIcon = getGenericIcon("Angle Small Right Icon")[0].source;

  useEffect(() => {
    const loadUserDetails = async () => {
      if (!token || !userId) {
        setError('Authentication details missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserDetails(token);
        setUserProfile(data.user || null);
      } catch (error: any) {
        console.error('Error fetching user details:', error.message);
        setError('Failed to load user details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadUserDetails();
  }, []);

  const navigateToProfileDetails = () => {
    if (!userProfile) return;

    const params: ProfileParams = {
      name: userProfile.name || '',
      email: userProfile.email || '',
      status: userProfile.status || '',
      subscription_plan: userProfile.subscription_plan || '',
      subscription_start_date: userProfile.subscription_start_date || '',
      subscription_end_date: userProfile.subscription_end_date || '',
      next_payment_due_date: userProfile.next_payment_due_date || '',
      trial_remaining_days: String(userProfile.trial_remaining_days || ''),
      created_at: userProfile.created_at || '',
      updated_at: userProfile.updated_at || '',
    };

    router.push({ pathname: '/profileDetails', params });
  };

  const navigateToBaseCurrency = () => {
    if (!userProfile) return;

    const params: CurrencyParams = {
      base_currency: userProfile.base_currency || '',
    };

    router.push({ 
      pathname: '/updateBaseCurrency', params });
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Header title="Settings" variant="simple" />
      <ScrollView>
        {/* User Profile */}
        <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
          <TouchableOpacity
            style={styles.item}
            onPress={navigateToProfileDetails}
            disabled={!userProfile}
          >
            <View style={styles.itemContent}>
              {userProfile ? (
                <>
                  <View style={{ flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 36 }}>
                    <View style={{ backgroundColor: '#0a788eff', width: 60, height: 60, borderRadius: 36, justifyContent: 'center', marginBottom: 4, alignItems: 'center' }}>
                      <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 24 }}>{userProfile.name.charAt(0).toLocaleUpperCase()}</Text>
                    </View>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: textColor }}>Hey, {userProfile.name}! 👋</Text>
                  </View>
                  <Text style={[styles.itemTitle, { color: textColor }]}>Profile Details</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={[ styles.itemValue, { flexDirection: 'row', gap: 8, marginTop: 4 } ]}>
                      <Text style={{ color: secondaryTextColor }}>{userProfile.email}</Text>
                      <Text style={{ fontSize: 8, backgroundColor: '#18358dff', color: '#fff',fontWeight: 'bold', paddingHorizontal: 4, paddingVertical: 4, borderRadius: 4 }}>{userProfile.subscription_plan.toLocaleUpperCase()}</Text>
                    </View>
                    <AngleSmallRightIcon width={24} height={24} fill={iconColor}/>
                  </View>
                </>
              ) : (
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={[styles.itemTitle, { color: textColor }]}>Profile Details</Text>
                  <Text style={[styles.itemValue, { color: secondaryTextColor }]}>Please Log In</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Base Currency */}
        <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
          <TouchableOpacity
            style={styles.item}
            onPress={navigateToBaseCurrency}
            disabled={!userProfile}
          >
            <View style={styles.itemContent}>
              <Text style={[styles.itemTitle, { color: textColor }]}>Base Currency</Text>
              {userProfile ? (
                <Text style={[styles.itemValue, { color: secondaryTextColor }]}>
                  {userProfile.base_currency || 'Not set'}
                </Text>
              ) : (
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={[styles.itemValue, { color: secondaryTextColor }]}>Please Log In</Text>
                </TouchableOpacity>
              )}
            </View>
            <AngleSmallRightIcon width={24} height={24} fill={iconColor}/>
          </TouchableOpacity>
        </View>

        {/* Custom Categories */}
        <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/customCategories'
              })
            }
            style={styles.item}
          >
            <View>
              <Text style={[styles.itemTitle, { color: textColor }]}>Custom Categories</Text>
              <Text style={[styles.itemValue, { color: secondaryTextColor }]}>Click Here to Manage</Text>
            </View>
            <AngleSmallRightIcon width={24} height={24} fill={iconColor}/>
          </TouchableOpacity>
        </View>

        {/* Button for Downloading Report*/}
        <View style={styles.downloadReportBtn}>
          <Button
              title="Download Monthly Report"
              onPress={() => {
                if (token && userId) {
                  downloadMonthlyReport(userId, token)
                } else {
                  Alert.alert('Something went wrong!');
                }
              }}
          />
        </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 14,
    marginTop: 2,
  },
  downloadReportBtn: {
    marginTop: 20,
    paddingVertical: 24,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});