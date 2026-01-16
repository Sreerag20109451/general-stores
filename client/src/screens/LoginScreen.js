import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function LoginScreen({ navigation }) {
    const [phoneNumber, setPhoneNumber] = React.useState('');

    const handleLogin = () => {
        // TODO: Implement Firebase Phone Auth
        console.log('Login with:', phoneNumber);
        navigation.replace('Home');
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
            <TextInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                style={styles.input}
            />
            <Button mode="contained" onPress={handleLogin} style={styles.button}>
                Send OTP
            </Button>
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
        marginBottom: 40,
        fontWeight: 'bold',
    },
    input: {
        marginBottom: 20,
    },
    button: {
        paddingVertical: 6,
    },
});
