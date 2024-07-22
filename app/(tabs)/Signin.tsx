import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ScaledSheet } from 'react-native-size-matters';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const SignInScreen: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth();

  const handleSignIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, emailOrPhone, password);
      router.push('/(nav)'); // Redirect on successful sign-in
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in. Please check your credentials and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ top: 100 }}>
        <View style={{ alignItems: 'center', bottom: 30 }}>
          <Image source={require("../../assets/images/LogoRed.png")} />
        </View>
        <View>
          <View style={{ display: "flex", flexDirection: 'column', alignItems: 'center', top: 20, marginBottom: 60 }}>
            <Text style={styles.title}>Welcome back!</Text>
            <Text>We're so excited to see you again!</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
          />
          <TextInput
            style={[styles.input, { marginBottom: 2 }]}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Text style={styles.forgotPassword} onPress={() => router.push('/ForgotPassword')}>
            Forgot password?
          </Text>
          <TouchableOpacity style={styles.signin} onPress={handleSignIn}>
            <Text style={{ color: "#ffffff" }}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    top: 30,
    justifyContent: 'flex-start',
    alignItems: "center",
    backgroundColor: "#FAF2F2",
  },
  title: {
    fontSize: '24@ms',
    marginBottom: '2@mvs',
  },
  input: {
    height: 50,
    borderColor: '#D4D4D4',
    backgroundColor: "#D4D4D4",
    borderRadius: 8,
    borderWidth: 1,
    width: 320,
    marginBottom: 20,
    padding: 10,
  },
  forgotPassword: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: 0,
    color: '#800000',
  },
  signin: {
    top: 40,
    backgroundColor: "#800000",
    width: 320,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: "center",
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default SignInScreen;
