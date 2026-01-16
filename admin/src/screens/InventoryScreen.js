import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';
import { Text, FAB, Card, Button, TextInput, Modal, Portal, IconButton, ActivityIndicator } from 'react-native-paper';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function InventoryScreen() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [category, setCategory] = useState('Vegetables');
    const [image, setImage] = useState('https://via.placeholder.com/150');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(list);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const showModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setName(item.name);
            setPrice(String(item.price));
            setUnit(item.unit);
            setCategory(item.category);
            setImage(item.image);
        } else {
            setEditingItem(null);
            setName('');
            setPrice('');
            setUnit('kg');
            setCategory('Vegetables');
            setImage('https://via.placeholder.com/150');
        }
        setVisible(true);
    };

    const hideModal = () => setVisible(false);

    const handleSave = async () => {
        if (!name || !price) {
            Alert.alert('Validation', 'Name and Price are required');
            return;
        }
        setSaving(true);
        try {
            const productData = {
                name,
                price: parseFloat(price),
                unit,
                category,
                image,
                inStock: true,
                updatedAt: serverTimestamp(),
            };

            if (editingItem) {
                await updateDoc(doc(db, 'products', editingItem.id), productData);
            } else {
                await addDoc(collection(db, 'products'), {
                    ...productData,
                    createdAt: serverTimestamp(),
                });
            }

            hideModal();
            fetchProducts();
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Product",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: "destructive", onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'products', id));
                            fetchProducts();
                        } catch (err) {
                            Alert.alert("Error", "Failed to delete");
                        }
                    }
                }
            ]
        );
    };

    const addDummyData = async () => {
        const dummy = [
            { name: 'Onion', price: 40, unit: 'kg', category: 'Vegetables', inStock: true },
            { name: 'Potato', price: 30, unit: 'kg', category: 'Vegetables', inStock: true },
            { name: 'Tomato', price: 25, unit: 'kg', category: 'Vegetables', inStock: true },
            { name: 'Milk', price: 50, unit: 'L', category: 'Dairy', inStock: true },
            { name: 'Rice', price: 60, unit: 'kg', category: 'Grains', inStock: true },
        ];
        setLoading(true);
        try {
            // Use Promise.all to add them in parallel
            await Promise.all(dummy.map(p => addDoc(collection(db, 'products'), {
                ...p,
                image: 'https://via.placeholder.com/150',
                createdAt: serverTimestamp()
            })));
            fetchProducts();
            Alert.alert("Success", "Added 5 dummy items!");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Title
                title={item.name}
                subtitle={`₹${item.price}/${item.unit} | ${item.category}`}
                right={(props) => (
                    <View style={{ flexDirection: 'row' }}>
                        <IconButton {...props} icon="pencil" onPress={() => showModal(item)} />
                        <IconButton {...props} icon="delete" iconColor="red" onPress={() => handleDelete(item.id)} />
                    </View>
                )}
            />
        </Card>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text variant="titleMedium">Current Inventory</Text>
                <Button mode="text" onPress={addDummyData}>+ Add Dummy Data</Button>
            </View>

            {loading ? <ActivityIndicator style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No items in inventory.</Text>}
                />
            )}

            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.modal}>
                    <Text variant="headlineSmall" style={{ marginBottom: 20 }}>{editingItem ? 'Edit Product' : 'Add New Product'}</Text>
                    <ScrollView>
                        <TextInput label="Name" value={name} onChangeText={setName} style={styles.input} />
                        <TextInput label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
                        <TextInput label="Unit (kg, L, pcs)" value={unit} onChangeText={setUnit} style={styles.input} />
                        <TextInput label="Category" value={category} onChangeText={setCategory} style={styles.input} />
                        <TextInput label="Image URL" value={image} onChangeText={setImage} style={styles.input} />

                        <Button mode="contained" onPress={handleSave} loading={saving} style={styles.saveBtn}>
                            Save Product
                        </Button>
                        <Button onPress={hideModal} style={{ marginTop: 10 }}>Cancel</Button>
                    </ScrollView>
                </Modal>
            </Portal>

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => showModal(null)}
                label="Add Item"
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        elevation: 2
    },
    list: {
        padding: 10,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 10,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    modal: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
        maxHeight: '80%'
    },
    input: {
        marginBottom: 10,
        backgroundColor: 'white'
    },
    saveBtn: {
        marginTop: 10
    }
});
