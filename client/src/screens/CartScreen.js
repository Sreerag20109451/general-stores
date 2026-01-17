import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, Alert } from 'react-native';
import { Text, Button, Card, IconButton, Divider, ActivityIndicator } from 'react-native-paper';
import { useCart } from '../context/CartContext';
import * as Location from 'expo-location';
import { STORE_LOCATION } from '../constants/Config';

export default function CartScreen({ navigation }) {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const [loadingLocation, setLoadingLocation] = useState(false);

    // Haversine formula to calculate distance in km
    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);  // deg2rad below
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
            ;
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    }

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180)
    }

    const handleCheckout = async () => {
        setLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const distance = getDistanceFromLatLonInKm(
                latitude,
                longitude,
                STORE_LOCATION.latitude,
                STORE_LOCATION.longitude
            );

            console.log(`User Location: ${latitude}, ${longitude}`);
            console.log(`Distance to store: ${distance.toFixed(2)} km`);

            if (distance <= STORE_LOCATION.radiusKm) {
                navigation.navigate('Checkout');
            } else {
                Alert.alert(
                    'Out of Delivery Range',
                    `You are ${distance.toFixed(1)}km away. We only deliver within ${STORE_LOCATION.radiusKm}km.`
                );
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Could not verify location.');
        } finally {
            setLoadingLocation(false);
        }
    };

    const renderCartItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <Image source={{ uri: item.image || 'https://via.placeholder.com/80' }} style={styles.image} />
                <View style={styles.itemDetails}>
                    <Text variant="titleMedium">{item.name}</Text>
                    <Text>₹{item.price} / {item.unit}</Text>
                    <View style={styles.quantityContainer}>
                        <IconButton icon="minus" size={20} onPress={() => updateQuantity(item.id, item.quantity - 1)} />
                        <Text style={styles.quantity}>{item.quantity}</Text>
                        <IconButton icon="plus" size={20} onPress={() => updateQuantity(item.id, item.quantity + 1)} />
                    </View>
                </View>
                <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                <IconButton icon="delete" iconColor="red" onPress={() => removeFromCart(item.id)} />
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text variant="headlineSmall">Your cart is empty</Text>
                    <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.button}>
                        Start Shopping
                    </Button>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                    />
                    <View style={styles.footer}>
                        <Divider />
                        <View style={styles.totalContainer}>
                            <Text variant="titleLarge">Total:</Text>
                            <Text variant="headlineSmall" style={{ color: '#6200ee', fontWeight: 'bold' }}>
                                ₹{getCartTotal()}
                            </Text>
                        </View>
                        <Button
                            mode="contained"
                            onPress={handleCheckout}
                            style={styles.checkoutButton}
                            loading={loadingLocation}
                            disabled={loadingLocation}
                        >
                            Proceed to Location Check
                        </Button>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 10,
    },
    card: {
        marginBottom: 10,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 5,
    },
    itemDetails: {
        flex: 1,
        marginLeft: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantity: {
        marginHorizontal: 5,
        fontWeight: 'bold',
    },
    itemTotal: {
        fontWeight: 'bold',
        marginRight: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 20,
        backgroundColor: '#fff',
        elevation: 10,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        alignItems: 'center',
    },
    button: {
        marginTop: 20,
    },
    checkoutButton: {
        paddingVertical: 6,
    }
});
