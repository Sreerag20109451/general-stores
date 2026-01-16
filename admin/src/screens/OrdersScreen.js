import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Linking, Platform, Alert } from 'react-native';
import { Text, Card, Button, Chip, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function OrdersScreen() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Real-time listener for orders
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setOrders(list);
            setLoading(false);
        }, (error) => {
            console.error(error);
            Alert.alert("Error", "Failed to fetch orders");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const openMaps = (location) => {
        // Falls back to Bangalore if location missing (demo purpose)
        const lat = location?.latitude || 12.9716;
        const lng = location?.longitude || 77.5946;

        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${lat},${lng}`;
        const label = 'Delivery Location';
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        Linking.openURL(url);
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: newStatus
            });
        } catch (err) {
            Alert.alert("Error", "Failed to update status");
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Title
                title={`Order #${item.id.slice(0, 5)}`}
                subtitle={`Total: ₹${item.total} | ${item.paymentMethod}`}
                right={(props) => <Chip mode="outlined" {...props} style={{ marginRight: 10 }}>{item.status.toUpperCase()}</Chip>}
            />
            <Card.Content>
                <Text variant="bodyMedium" style={{ marginBottom: 10 }}>Items:</Text>
                {item.items.map((prod, index) => (
                    <Text key={index} style={{ marginLeft: 10 }}>• {prod.name} x {prod.quantity}</Text>
                ))}
                <Divider style={{ marginVertical: 10 }} />
                <View style={styles.actions}>
                    <Button icon="map-marker" mode="outlined" onPress={() => openMaps(item.location)}>
                        View Location
                    </Button>

                    <View style={{ flexDirection: 'row', marginTop: 10, justifyContent: 'space-between' }}>
                        {item.status === 'pending' && (
                            <Button mode="contained" onPress={() => updateStatus(item.id, 'confirmed')} compact>
                                Confirm
                            </Button>
                        )}
                        {item.status === 'confirmed' && (
                            <Button mode="contained" buttonColor="orange" onPress={() => updateStatus(item.id, 'out_for_delivery')} compact>
                                Out for Delivery
                            </Button>
                        )}
                        {item.status === 'out_for_delivery' && (
                            <Button mode="contained" buttonColor="green" onPress={() => updateStatus(item.id, 'delivered')} compact>
                                Delivered
                            </Button>
                        )}
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No orders yet.</Text>}
                />
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
    actions: {
        marginTop: 10
    }
});
