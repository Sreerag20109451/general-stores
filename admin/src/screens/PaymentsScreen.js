import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, List } from 'react-native-paper';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function PaymentsScreen() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'payments'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPayments(list);
            setLoading(false);
        }, (error) => {
            console.error(error);
            Alert.alert("Error", "Failed to fetch payments");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.row}>
                    <View>
                        <Text variant="titleMedium">₹{item.amount}</Text>
                        <Text variant="bodySmall" style={{ color: 'gray' }}>{item.method}</Text>
                    </View>
                    <Chip
                        icon={item.status === 'success' ? 'check' : 'alert-circle'}
                        mode="outlined"
                        style={{ borderColor: item.status === 'success' ? 'green' : 'orange' }}
                        textStyle={{ color: item.status === 'success' ? 'green' : 'orange' }}
                    >
                        {item.status.toUpperCase()}
                    </Chip>
                </View>
                <List.Item
                    title={`Order ID: ${item.orderId}`}
                    description={item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleString() : 'Just now'}
                    left={props => <List.Icon {...props} icon="receipt" />}
                />
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={payments}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No payments recorded yet.</Text>}
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    }
});
