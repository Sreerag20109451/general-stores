import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, Snackbar } from 'react-native-paper';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useTheme } from 'react-native-paper';

export default function LoginScreen({ navigation }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+353');
    const [verificationId, setVerificationId] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const recaptchaVerifier = useRef(null);
    const theme = useTheme();

    const firebaseConfig = auth.app.options;

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
        if (!verificationCode) {
            setError("Please enter the verification code.");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const credential = PhoneAuthProvider.credential(
                verificationId,
                verificationCode
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
        <View style={styles.container}>
            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={firebaseConfig}
                attemptInvisibleVerification={true}
            />

            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                {verificationId ? "Verify Phone" : "General Store Login"}
            </Text>

            {!verificationId ? (
                <>
                    <Text style={styles.subtitle}>Enter your phone number to continue</Text>
                    <View style={styles.row}>
                        <TextInput
                            label="Code"
                            value={countryCode}
                            onChangeText={setCountryCode}
                            style={[styles.input, { width: 90, marginRight: 10 }]}
                            mode="outlined"
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            label="Phone Number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            autoComplete="tel"
                            style={[styles.input, { flex: 1 }]}
                            mode="outlined"
                        />
                    </View>
                    <Button
                        mode="contained"
                        onPress={sendVerification}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                    >
                        Send Verification Code
                    </Button>
                </>
            ) : (
                <>
                    <Text style={styles.subtitle}>Enter the 6-digit code sent to {countryCode}{phoneNumber}</Text>
                    <TextInput
                        label="Verification Code"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="number-pad"
                        style={styles.input}
                        mode="outlined"
                    />
                    <Button
                        mode="contained"
                        onPress={confirmCode}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                    >
                        Confirm & Login
                    </Button>
                    <TouchableOpacity onPress={() => setVerificationId(null)} style={styles.link}>
                        <Text style={{ color: theme.colors.secondary }}>Change Phone Number</Text>
                    </TouchableOpacity>
                </>
            )}

            <Snackbar
                visible={!!error}
                onDismiss={() => setError('')}
                action={{
                    label: 'Dismiss',
                    onPress: () => setError(''),
                }}>
                {error}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'white',
    },
    button: {
        paddingVertical: 6,
        marginBottom: 10,
    },
    link: {
        alignItems: 'center',
        marginTop: 10,
    }
});
