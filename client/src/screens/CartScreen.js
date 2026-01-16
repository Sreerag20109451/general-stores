import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function CartScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text variant="headlineMedium">Your Cart</Text>
            <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
                Continue Shopping
            </Button>
            <Button mode="contained" onPress={() => console.log('Checkout')} style={styles.button}>
                Checkout
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 20,
        width: 200,
    },
});
