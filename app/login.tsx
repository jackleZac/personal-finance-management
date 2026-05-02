import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getGenericIcon } from '@/assets/genericIconsMapping';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const router = useRouter();
  const { fromSignup } = useLocalSearchParams();

  const apiCoreUrl = Constants.expoConfig?.extra?.apiCoreUrl;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      console.log('Sending login request:', { url: `${apiCoreUrl}/login`, method: 'POST', email, password });
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (error) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? (error as { message?: string }).message
        : 'An error occurred during login.';
      console.log('Login error:', errorMessage);
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token received');
      }

      console.log('Google Login Success - idToken:', idToken);

      await googleLogin(idToken);
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Google Login Error:', error);
      Alert.alert(
        'Google Login Failed',
        error instanceof Error ? error.message : 'An unknown error occurred.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgotPassword');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const EmailIcon = getGenericIcon('Mail Icon')[0]?.source;
  const GoogleIcon = getGenericIcon('Google Icon')[0]?.source;

  return (
    <LinearGradient
      colors={['#3C8CE7', '#736EFE']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: '#FFF' }]}>Login</Text>

        <View style={styles.form}>
          {fromSignup === 'true' && (
            <View style={styles.notificationBox}>
              <Text style={styles.notificationText}>
                🎉 Registration successful! Please verify your email before logging in.
              </Text>
            </View>
          )}
          
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

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: "#FFF", color: '#FFF' }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#FFF"
              secureTextEntry
            />
          </View>

          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FFFFFF' }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              {EmailIcon ? (
                <EmailIcon width={26} height={26} fill="#0047AB" />
              ) : (
                <Icon name="email" style={styles.icon} size={24} color="#0047AB" />
              )}
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login with Email'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FFFFFF' }]}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              {GoogleIcon ? (
                <GoogleIcon width={24} height={24} fill="#DB4437" />
              ) : (
                <Text style={styles.icon}>G</Text>
              )}
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login with Google'}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignUp} style={styles.signupLink}>
            <Text style={styles.signupText}>
              I don't have an account. Click here to sign up
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
  notificationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  notificationText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -10,
  },
  forgotPasswordText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
    gap: 12,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#FFF',
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