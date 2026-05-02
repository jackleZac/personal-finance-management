import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/hooks/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getGenericIcon } from '@/assets/genericIconsMapping';
import Constants from 'expo-constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const { signup, googleLogin } = useAuth();
  const router = useRouter();

  const apiCoreUrl = Constants.expoConfig?.extra?.apiCoreUrl;

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password);
      // Signup successful but user needs to verify email
      Alert.alert(
        'Registration Successful!',
        'Please check your email to verify your account before logging in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace({ pathname: '/login', params: { fromSignup: 'true' } }),
          },
        ]
      );
    } catch (error) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'message' in error
          ? (error as { message?: string }).message
          : 'An error occurred during sign-up.';
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo:', JSON.stringify(userInfo, null, 2));
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token received');
      }

      console.log('Google Sign-In Success - idToken:', idToken);

      // Send idToken to Flask backend
      const response = await fetch(`${apiCoreUrl}/register/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      const backendResult = await response.json();
      console.log('Backend response:', backendResult);
      if (!response.ok) {
        throw new Error(backendResult.message || 'Google sign-up failed');
      }

      await googleLogin(idToken); // Use googleLogin to store token
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert(
        'Google Sign-Up Failed',
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  // Get Google icon
  const GoogleIcon = getGenericIcon('Google Icon')[0]?.source;
  // Get Email icon
  const EmailIcon = getGenericIcon('Mail Icon')[0]?.source;

  return (
    <LinearGradient
      colors={['#3C8CE7', '#736EFE']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: '#FFF' }]}>Sign Up</Text>

        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: textColor, color: '#FFF' }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#FFF"
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { flex: 1, color: '#FFF' }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#FFF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password and Confirm Password Inputs */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: textColor, color: '#FFF' }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#FFF"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: textColor, color: '#FFF' }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#FFF"
              secureTextEntry
            />
          </View>

          {/* Sign Up Buttons */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FFFFFF' }]}
            onPress={handleSignup}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <EmailIcon width={26} height={26} style={styles.icon} color="#0047AB" />
              <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up with Email'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FFFFFF' }]}
            onPress={handleGoogleSignup}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              <GoogleIcon style={styles.icon} color="#DB4437" />
              <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'Sign Up with Google'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogin} style={styles.loginLink}>
            <Text style={[styles.loginText, { color: textColor }]}>
              I already have an account. Click here to login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, { backgroundColor: '#3C8CE7' }]} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  icon: {
    height: 24,
    width: 24,
    marginHorizontal: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 4,
  },
});