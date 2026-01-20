import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+353');
    const [verificationId, setVerificationId] = useState(null);
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const recaptchaVerifier = useRef(null);
    const inputRefs = useRef([]);

    const firebaseConfig = auth.app.options;

    const handleCodeChange = (text, index) => {
        const newCode = [...verificationCode];
        newCode[index] = text;
        setVerificationCode(newCode);

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
        const trimmedPhone = phoneNumber.trim();
        if (!trimmedPhone) {
            setError("The mobile number can not be empty");
            return;
        }

        const fullPhoneNumber = `${countryCode}${trimmedPhone}`;

        // Basic validation matching their logic
        if (fullPhoneNumber.length < 10) {
            setError("Please provide a valid mobile number");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            const vId = await phoneProvider.verifyPhoneNumber(
                fullPhoneNumber,
                recaptchaVerifier.current
            );
            setVerificationId(vId);
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <FirebaseRecaptchaVerifierModal
                    ref={recaptchaVerifier}
                    firebaseConfig={firebaseConfig}
                    attemptInvisibleVerification={true}
                />

                {/* Top Bar */}
                <View style={styles.topBar}>
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                    />
                    <TouchableOpacity onPress={() => navigation.replace('Home')} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>
                        {verificationId ? "Verify Phone" : "Welcome back"}
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        {verificationId
                            ? `Enter the code sent to ${countryCode} ${phoneNumber}`
                            : "Sign in or create an account to continue"
                        }
                    </Text>

                    {!verificationId ? (
                        <View style={styles.formContainer}>
                            <View style={styles.inputRow}>
                                <TextInput
                                    value={countryCode}
                                    onChangeText={setCountryCode}
                                    style={[styles.input, styles.countryCodeInput]}
                                    keyboardType="phone-pad"
                                />
                                <TextInput
                                    placeholder="Phone Number"
                                    placeholderTextColor="#94a3b8"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    style={[styles.input, styles.phoneInput]}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={sendVerification}
                                disabled={loading}
                                style={[styles.button, styles.continueButton, loading && styles.buttonDisabled]}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? "Sending..." : "Continue"}
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                disabled={true} // Google auth not requested yet
                                style={[styles.button, styles.googleButton]}
                            >
                                <Text style={styles.googleButtonText}>Continue with Google</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.formContainer}>
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
                                        textAlign="center"
                                    />
                                ))}
                            </View>
                            <TouchableOpacity
                                onPress={confirmCode}
                                disabled={loading}
                                style={[styles.button, styles.continueButton, loading && styles.buttonDisabled]}
                            >
                                <Text style={styles.buttonText}>
                                    {loading ? "Verifying..." : "Confirm & Login"}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setVerificationId(null)} style={styles.centerLink}>
                                <Text style={styles.linkText}>Change Phone Number</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <Text style={styles.footerLinkBold}>Terms of Services</Text> and{' '}
                        <Text style={styles.footerLinkBold}>Privacy Policies</Text>
                    </Text>
                </View>
            </ScrollView>

            <Snackbar
                visible={!!error}
                onDismiss={() => setError('')}
                action={{
                    label: 'Dismiss',
                    onPress: () => setError(''),
                    textColor: 'white'
                }}
                style={styles.snackbar}
            >
                {error}
            </Snackbar>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 25,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: Platform.OS === 'ios' ? 60 : 40,
        width: '100%',
    },
    logo: {
        width: 140,
        height: 60,
        resizeMode: 'contain',
    },
    skipButton: {
        paddingVertical: 10,
    },
    skipText: {
        color: '#0ea5e9', // sky-500
        fontSize: 16,
        fontWeight: '600',
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 40,
        width: '100%',
    },
    heroTitle: {
        fontSize: 34,
        fontWeight: '700',
        color: '#020617', // slate-950
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#94a3b8', // slate-400
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 35,
        fontWeight: '400',
    },
    formContainer: {
        width: '100%',
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f8fafc', // slate-50
        borderColor: '#e2e8f0', // slate-200
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 18,
        fontSize: 16,
        color: '#020617',
    },
    countryCodeInput: {
        width: 85,
        marginRight: 10,
    },
    phoneInput: {
        flex: 1,
    },
    button: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    continueButton: {
        backgroundColor: '#0ea5e9', // sky-500
    },
    buttonDisabled: {
        backgroundColor: '#94a3b8',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        marginHorizontal: 15,
        color: '#94a3b8',
        fontWeight: '600',
    },
    googleButton: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowOpacity: 0.05,
    },
    googleButtonText: {
        color: '#020617',
        fontSize: 16,
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        width: '100%',
    },
    otpInput: {
        width: (width - 100) / 6,
        height: 60,
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        borderRadius: 12,
        fontSize: 22,
        fontWeight: '700',
        color: '#020617',
    },
    centerLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#64748b', // slate-600
        textAlign: 'center',
        lineHeight: 20,
    },
    footerLinkBold: {
        color: '#020617',
        fontWeight: '700',
    },
    snackbar: {
        backgroundColor: '#ef4444',
    }
});
