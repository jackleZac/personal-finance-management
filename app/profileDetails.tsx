import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '@/components/Header';
import { formatDate } from '@/utils/dateUtils';
import { fetchUserPassword } from '@/api/userApi';
import { useAuth } from '@/hooks/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function ProfileDetails() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const [passwordStatus, setPasswordStatus] = useState<boolean | null>(null);
    const {token, userId} = useAuth();

    // Theme colors
    const backgroundColor = useThemeColor({}, 'background');
    const secondaryBackgroundColor = useThemeColor({}, 'secondaryBackground');
    const textColor = useThemeColor({}, 'text');
    const iconColor = useThemeColor({}, 'icon');
    const borderColor = useThemeColor({}, 'border');

    // Profile details from params with formatted dates
    const name = params.name as string;
    const email = params.email as string;
    const status = params.status as string;
    const subscription_plan = params.subscription_plan as string;
    const subscription_start_date = formatDate(params.subscription_start_date as string);
    const subscription_end_date = formatDate(params.subscription_end_date as string);
    const next_payment_due_date = formatDate(params.next_payment_due_date as string);
    const trial_remaining_days = params.trial_remaining_days as string;
    const created_at = formatDate(params.created_at as string, true);
    const updated_at = formatDate(params.updated_at as string, true);

    // Fetch status of user password
   useEffect(() => {
    const fetchPasswordStatus = async () => {
      if (token && userId) {
        try {
          const response = await fetchUserPassword(token, userId);
          console.log(response);
          if (response && response.status === 200) {
            setPasswordStatus(response.is_password_set);
          } else {
            setPasswordStatus(false);
          }
        } catch (error) {
          console.error('Error fetching password status:', error);
          setPasswordStatus(false);
        }
      }
    };

    fetchPasswordStatus();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <View style={[styles.outerContainer, { backgroundColor }]}>
                {/* Header */}
                <Header title={'Profile Details'} variant="back" />
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                >
                    {/* About You Section */}
                    <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
                        {/* Header with Name */}
                        <View style={styles.header}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{name.charAt(0).toLocaleUpperCase()}</Text>
                            </View>
                        </View>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Name</Text>
                            <Text style={[styles.value, { color: textColor }]}>{name}</Text>
                        </View>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Email</Text>
                            <Text style={[styles.value, { color: textColor }]}>{email}</Text>
                        </View>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Date Joined</Text>
                            <Text style={[styles.value, { color: textColor }]}>{created_at}</Text>
                        </View>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Last Update</Text>
                            <Text style={[styles.value, { color: textColor }]}>{updated_at}</Text>
                        </View>
                    </View>

                    {/* Password */}
                    <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Password</Text>
                            <Text style={[styles.value, { color: textColor }]}>{passwordStatus? 'Set' : 'Not Set'}</Text>
                        </View>
                    </View>

                    {/* Plan Details Section */}
                    <View style={[styles.section, { backgroundColor: secondaryBackgroundColor }]}>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Plan</Text>
                            <Text style={[styles.value, { color: textColor }]}>{subscription_plan || 'FREE'}</Text>
                        </View>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Free Trial</Text>
                            <Text style={[styles.value, { color: textColor }]}>{trial_remaining_days ? `${trial_remaining_days} days remaining` : 'Not Applicable'}</Text>
                        </View>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Subscriptions</Text>
                            <Text style={[styles.value, { color: textColor }]}>{subscription_plan ? 'Active' : 'Not Applicable'}</Text>
                        </View>
                        <View style={[styles.row, { borderBottomColor: borderColor }]}>
                            <Text style={[styles.label, { color: iconColor }]}>Next Payment</Text>
                            <Text style={[styles.value, { color: textColor }]}>{next_payment_due_date || 'Not Applicable'}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 60,
        backgroundColor: '#0a788eff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarText: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    section: {
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    label: {
        fontSize: 16,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
});