import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartScreen({ navigation }) {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Are you sure you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', onPress: () => removeFromCart(productId) },
        ]
      );
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to proceed with checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add some items to your cart first.');
      return;
    }

    navigation.navigate('Checkout');
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: clearCart, style: 'destructive' },
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item.id, item.quantity, -1)}
          >
            <Ionicons name="remove" size={16} color="#667eea" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => handleQuantityChange(item.id, item.quantity, 1)}
          >
            <Ionicons name="add" size={16} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeFromCart(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4757" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started</Text>
        <TouchableOpacity
          style={styles.shopNowBtn}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.shopNowText}>Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>${getCartTotal().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping:</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax:</Text>
          <Text style={styles.summaryValue}>${(getCartTotal() * 0.08).toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${(getCartTotal() * 1.08).toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearText: {
    color: '#ff4757',
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeBtn: {
    padding: 5,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  checkoutBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopNowBtn: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  shopNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});