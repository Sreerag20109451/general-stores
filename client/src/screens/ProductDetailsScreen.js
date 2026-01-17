import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Title, Paragraph } from 'react-native-paper';
import { useCart } from '../context/CartContext';

export default function ProductDetailsScreen({ route, navigation }) {
    const { product } = route.params;
    const { addToCart } = useCart();

    const handleAddToCart = () => {
        addToCart(product);
        navigation.navigate('Cart');
    };

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: product.image || 'https://via.placeholder.com/300' }} style={styles.image} />
            <View style={styles.content}>
                <Title style={styles.title}>{product.name}</Title>
                <Text variant="titleLarge" style={styles.price}>₹{product.price} / {product.unit}</Text>
                <Paragraph style={styles.description}>
                    {product.description || 'No description available for this product.'}
                </Paragraph>

                <View style={styles.infoRow}>
                    <Text>Category: {product.category}</Text>
                    <Text style={{ color: product.inStock ? 'green' : 'red' }}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Text>
                </View>

                <Button
                    mode="contained"
                    onPress={handleAddToCart}
                    style={styles.button}
                    disabled={!product.inStock}
                >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 300,
        resizeMode: 'cover',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    price: {
        fontSize: 20,
        color: '#6200ee',
        marginVertical: 10,
    },
    description: {
        marginBottom: 20,
        lineHeight: 22,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    button: {
        marginTop: 10,
        paddingVertical: 6,
    },
});
