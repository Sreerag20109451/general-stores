import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { Button, Text, Snackbar } from 'react-native-paper';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useTheme } from 'react-native-paper';

export default function LoginScreen({ navigation }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+353');
    const [verificationId, setVerificationId] = useState(null);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const recaptchaVerifier = useRef(null);
    const inputRefs = useRef([]);
    const theme = useTheme();

    const firebaseConfig = auth.app.options;

    const handleCodeChange = (text, index) => {
        const newCode = [...verificationCode];
        newCode[index] = text;
        setVerificationCode(newCode);

        // Move to next input if text is entered
        if (text && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleBackspace = (key, index) => {
        if (key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const sendVerification = async () => {
        if (!phoneNumber) {
            setError("Please enter a phone number.");
            return;
        }
        setLoading(true);
        setError('');
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;

        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneProvider.verifyPhoneNumber(
                fullPhoneNumber,
                recaptchaVerifier.current
            );
            setVerificationId(verificationId);
            setError('');
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const confirmCode = async () => {
        const codeString = verificationCode.join('');
        if (codeString.length !== 6) {
            setError("Please enter the complete 6-digit code.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const credential = PhoneAuthProvider.credential(
                verificationId,
                codeString
            );
            await signInWithCredential(auth, credential);
            navigation.replace('Home');
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-5 justify-between">
            {/* Top Bar */}
            <View className="flex-row items-end justify-between mt-5">
                <Image
                    source={require('../../assets/logo.png')}
                    style={{ width: 120, height: 120, resizeMode: 'contain' }}
                    className="h-20 w-20"
                />
                <TouchableOpacity onPress={() => navigation.replace('Home')} className="mb-8">
                    <Text className="text-sky-500 font-semibold">Skip</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View className="w-full flex-col items-center mb-10">
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={firebaseConfig}
                    attemptInvisibleVerification={true}
                />

                <Text className="text-4xl font-semibold text-slate-950 text-center">
                    {verificationId ? "Verify Phone" : "Welcome back"}
                </Text>
                <Text className="text-md mt-4 font-light text-slate-400 text-center mb-8">
                    {verificationId
                        ? `Enter the code sent to ${countryCode} ${phoneNumber}`
                        : "Sign in or create an account to continue"
                    }
                </Text>

                {!verificationId ? (
                    <View className="w-full max-w-sm">
                        <View className="flex-row mb-4">
                            <TextInput
                                value={countryCode}
                                onChangeText={setCountryCode}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 mr-2 w-20 text-slate-900 font-medium"
                                keyboardType="phone-pad"
                            />
                            <TextInput
                                placeholder="Phone Number"
                                placeholderTextColor="#94a3b8"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                autoComplete="tel"
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 flex-1 text-slate-900 font-medium"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={sendVerification}
                            disabled={loading}
                            className={`h-14 w-full rounded-xl items-center justify-center shadow-sm ${loading ? 'bg-sky-300' : 'bg-sky-500'}`}
                        >
                            <Text className="text-md font-semibold text-slate-50">
                                {loading ? "Sending..." : "Continue"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="w-full max-w-sm">
                        <View className="flex-row justify-between mb-6">
                            {verificationCode.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => inputRefs.current[index] = ref}
                                    value={digit}
                                    onChangeText={(text) => handleCodeChange(text, index)}
                                    onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-semibold text-slate-900"
                                    textAlign="center"
                                />
                            ))}
                        </View>
                        <TouchableOpacity
                            onPress={confirmCode}
                            disabled={loading}
                            className={`h-14 w-full rounded-xl items-center justify-center shadow-sm mb-4 ${loading ? 'bg-sky-300' : 'bg-sky-500'}`}
                        >
                            <Text className="text-md font-semibold text-slate-50">
                                {loading ? "Verifying..." : "Confirm & Login"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setVerificationId(null)} className="items-center">
                            <Text className="text-slate-500 font-medium">Change Phone Number</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Error Snackbar via simple Text for now to match design or keep logic */}
                {/* Keeping logic but styling it naturally if possible, or using Paper's Snackbar as before but styled? 
                    Let's use a conditional Text for error to fit the custom design better than a floating snackbar if desired, 
                    but sticking to the existing Snackbar component for functionality is safer. 
                    I'll keep the Snackbar but wrapper needs to be right.
                */}
            </View>

            {/* Footer */}
            <View className="mb-5">
                <Text className="text-md text-center font-light text-slate-600">
                    By continuing, you agree to our{' '}
                    <Text className="font-semibold text-slate-900">Terms of Services</Text> and{' '}
                    <Text className="font-semibold text-slate-900">Privacy Policies</Text>
                </Text>
            </View>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError('')}
                action={{
                    label: 'Dismiss',
                    onPress: () => setError(''),
                    textColor: 'white'
                }}
                className="bg-red-500 mb-20"
            >
                {error}
            </Snackbar>
        </View>
    );
}

// Removing StyleSheet since we use NativeWind
const styles = {};
