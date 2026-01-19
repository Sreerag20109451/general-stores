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
                    <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>Enter your phone number to continue</Text>
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
                    <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>Enter the 6-digit code sent to {countryCode}{phoneNumber}</Text>
                    <View style={styles.otpContainer}>
                        {verificationCode.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => inputRefs.current[index] = ref}
                                value={digit}
                                onChangeText={(text) => handleCodeChange(text, index)}
                                onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                style={styles.otpInput}
                                mode="outlined"
                                textAlign="center"
                            />
                        ))}
                    </View>
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
        backgroundColor: 'transparent',
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 30,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'white',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    otpInput: {
        width: 45,
        height: 50,
        backgroundColor: 'white',
        textAlign: 'center',
        justifyContent: 'center',
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
