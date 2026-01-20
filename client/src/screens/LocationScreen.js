import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Snackbar, Button as PaperButton } from 'react-native-paper';
import * as Location from 'expo-location';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

export default function LocationScreen({ navigation, route }) {
    const { phoneNumber, countryCode, firstName } = route.params;
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getCurrentLocation = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
            setError('Location captured!');
        } catch (err) {
            setError('Error getting location: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!address.trim()) {
            setError("Address is required");
            return;
        }

        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                setError("No authenticated user found");
                return;
            }

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                firstName,
                phoneNumber: `${countryCode}${phoneNumber}`,
                address,
                landmark,
                location: location ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                } : null,
                createdAt: new Date().toISOString()
            });

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
                    <Text style={styles.heroTitle}>Delivery Address</Text>
                    <Text style={styles.heroSubtitle}>Where should we deliver your groceries?</Text>

                    <View style={styles.formContainer}>
                        <TouchableOpacity
                            onPress={getCurrentLocation}
                            style={styles.locationButton}
                        >
                            <Text style={styles.locationButtonText}>
                                {location ? "Location Captured ✓" : "Use Current Location"}
                            </Text>
                        </TouchableOpacity>

                        <TextInput
                            placeholder="Address Line"
                            placeholderTextColor="#94a3b8"
                            value={address}
                            onChangeText={setAddress}
                            style={styles.input}
                            multiline
                        />

                        <TextInput
                            placeholder="Landmark (Optional)"
                            placeholderTextColor="#94a3b8"
                            value={landmark}
                            onChangeText={setLandmark}
                            style={styles.input}
                        />

                        <TouchableOpacity
                            onPress={handleSaveProfile}
                            disabled={loading}
                            style={[styles.button, styles.continueButton, loading && styles.buttonDisabled]}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? "Saving..." : "Finish Registration"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer Section */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Your location is used to find nearby stores and provide delivery estimates.
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
    locationButton: {
        backgroundColor: '#f0f9ff', // sky-50
        borderColor: '#0ea5e9',
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    locationButtonText: {
        color: '#0ea5e9',
        fontWeight: '600',
        fontSize: 15,
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
        marginBottom: 15,
    },
    button: {
        height: 56,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
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
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 18,
    },
    snackbar: {
        backgroundColor: '#ef4444',
    }
});
