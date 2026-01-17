import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, Button, Card, Title, Paragraph, Searchbar, ActivityIndicator, FAB } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function HomeScreen({ navigation }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const theme = useTheme();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // In a real app, you might paginate this
            const q = query(collection(db, 'products'), where('inStock', '==', true));
            const querySnapshot = await getDocs(q);
            const productsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productsList);
        } catch (error) {
            console.error("Error fetching products: ", error);
        } finally {
            setLoading(false);
        }
    };

    const renderProductItem = ({ item }) => (
        <Card style={styles.card} onPress={() => navigation.navigate('ProductDetails', { product: item })}>
            <Card.Cover source={{ uri: item.image || 'https://via.placeholder.com/150' }} />
            <Card.Content>
                <Title>{item.name}</Title>
                <Paragraph>₹{item.price} / {item.unit}</Paragraph>
            </Card.Content>
            <Card.Actions>
                <Button mode="contained" onPress={() => console.log('Add to cart', item)}>Add</Button>
            </Card.Actions>
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Searchbar
                    placeholder="Search items..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderProductItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    numColumns={2}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text>No products found.</Text>
                        </View>
                    }
                />
            )}

            <FAB
                icon="cart"
                style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
                onPress={() => navigation.navigate('Cart')}
                label="Cart"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 10,
        backgroundColor: '#fff',
        elevation: 2,
    },
    searchBar: {
        borderRadius: 8,
    },
    listContent: {
        padding: 10,
    },
    card: {
        flex: 1,
        margin: 5,
        marginBottom: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
