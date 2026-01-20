import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Snackbar } from 'react-native-paper';

export default function RegisterScreen({ navigation, route }) {
    const { phoneNumber, countryCode } = route.params;
    const [firstName, setFirstName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = () => {
        if (!firstName.trim()) {
            setError("The first name cannot be empty");
            return;
        }
        navigation.navigate('Location', { phoneNumber, countryCode, firstName });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
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
                    <Text style={styles.heroTitle}>Your Details</Text>
                    <Text style={styles.heroSubtitle}>Help us know you better</Text>

                    <View style={styles.formContainer}>
                        <TextInput
                            placeholder="First Name"
                            placeholderTextColor="#94a3b8"
                            value={firstName}
                            onChangeText={setFirstName}
                            style={styles.input}
                        />

                        <TouchableOpacity
                            onPress={handleContinue}
                            disabled={loading}
                            style={[styles.button, styles.continueButton, loading && styles.buttonDisabled]}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Saving..." : "Continue"}
                            </Text>
                        </TouchableOpacity>
                    </View>
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
    input: {
        backgroundColor: '#f8fafc', // slate-50
        borderColor: '#e2e8f0', // slate-200
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 18,
        fontSize: 16,
        color: '#020617',
        marginBottom: 20,
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
