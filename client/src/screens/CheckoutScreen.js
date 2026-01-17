import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Text, Button, RadioButton, Divider, ActivityIndicator } from 'react-native-paper';
import { useCart } from '../context/CartContext';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MERCHANT_Details } from '../constants/Config';

export default function CheckoutScreen({ navigation }) {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);

    const handlePlaceOrder = async () => {
        setLoading(true);
        const totalAmount = getCartTotal();

        if (paymentMethod === 'UPI') {
            const upiUrl = `upi://pay?pa=${MERCHANT_Details.vpa}&pn=${MERCHANT_Details.name}&am=${totalAmount}&cu=INR`;
            try {
                const supported = await Linking.canOpenURL(upiUrl);
                if (supported) {
                    await Linking.openURL(upiUrl);
                    // In a real app, you would wait for a response or use a library that handles callbacks
                    // For now, we assume user completes it and we verify later manually or trust the flow
                    // Ideally, we show a "Confirm Payment" dialog? 
                    // Let's just create the order as Pending Payment for now.
                } else {
                    Alert.alert('Error', 'No UPI app found on this device');
                    setLoading(false); // Stop loading if UPI app not found
                    return;
                }
            } catch (err) {
                console.error('An error occurred', err);
                Alert.alert('Error', 'Failed to open UPI app');
                setLoading(false); // Stop loading if UPI app opening failed
                return;
            }
        }

        try {
            const orderData = {
                userId: auth.currentUser?.uid || 'guest',
                items: cartItems,
                total: totalAmount,
                status: 'pending',
                paymentMethod,
                paymentStatus: paymentMethod === 'COD' ? 'pending' : 'initiated', // Basic tracking
                createdAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);

            // Also create a payment record as per plan
            await addDoc(collection(db, 'payments'), {
                orderId: docRef.id,
                userId: auth.currentUser?.uid || 'guest',
                amount: totalAmount,
                method: paymentMethod,
                status: 'pending',
                timestamp: serverTimestamp(),
            });

            clearCart();
            Alert.alert('Success', 'Order placed successfully!');
            navigation.navigate('Home');
        } catch (error) {
            console.error("Error placing order: ", error);
            Alert.alert('Error', 'Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text variant="headlineSmall" style={styles.header}>Checkout</Text>

            <View style={styles.section}>
                <Text variant="titleMedium">Order Summary</Text>
                <Divider style={styles.divider} />
                {cartItems.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                        <Text>{item.name} x {item.quantity}</Text>
                        <Text>₹{item.price * item.quantity}</Text>
                    </View>
                ))}
                <Divider style={styles.divider} />
                <View style={styles.totalRow}>
                    <Text variant="titleLarge">Total</Text>
                    <Text variant="titleLarge">₹{getCartTotal()}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text variant="titleMedium">Payment Method</Text>
                <Divider style={styles.divider} />
                <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
                    <RadioButton.Item label="Cash on Delivery" value="COD" />
                    <RadioButton.Item label="UPI" value="UPI" />
                </RadioButton.Group>
            </View>

            <Button
                mode="contained"
                onPress={handlePlaceOrder}
                loading={loading}
                disabled={loading}
                style={styles.button}
            >
                Place Order
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 30,
    },
    divider: {
        marginVertical: 10,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        paddingVertical: 6,
        marginBottom: 50,
    }
});
