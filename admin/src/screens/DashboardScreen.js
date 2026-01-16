import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';

export default function DashboardScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={styles.header}>Dashboard</Text>

            <View style={styles.grid}>
                <Card style={styles.card} onPress={() => navigation.navigate('Inventory')}>
                    <Card.Content>
                        <Text variant="titleLarge">Inventory</Text>
                        <Text variant="bodyMedium">Manage items</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.card} onPress={() => navigation.navigate('Orders')}>
                    <Card.Content>
                        <Text variant="titleLarge">Orders</Text>
                        <Text variant="bodyMedium">View & Update</Text>
                    </Card.Content>
                </Card>

                <Card style={styles.card} onPress={() => navigation.navigate('Payments')}>
                    <Card.Content>
                        <Text variant="titleLarge">Payments</Text>
                        <Text variant="bodyMedium">Track payments</Text>
                    </Card.Content>
                </Card>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    header: {
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 15,
    }
});
