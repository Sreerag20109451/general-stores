import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text variant="headlineMedium">Home Screen</Text>
            <Text style={styles.subtitle}>Inventory will appear here</Text>
            <Button mode="contained" onPress={() => navigation.navigate('Cart')} style={styles.button}>
                Go to Cart
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    subtitle: {
        marginTop: 10,
        marginBottom: 20,
    },
    button: {
        marginTop: 20,
    },
});
