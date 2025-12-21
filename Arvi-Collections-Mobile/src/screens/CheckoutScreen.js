import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../config/api';

export default function CheckoutScreen({ navigation }) {
  const { user, token, isAuthenticated } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: user?.name || '',
  });

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to place an order', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    // Validation
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city) {
      Alert.alert('Error', 'Please fill in all shipping address fields');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
        Alert.alert('Error', 'Please fill in all card details');
        return;
      }
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        subtotal,
        shipping,
        tax,
        total,
      };

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        Alert.alert(
          'Order Placed!',
          `Your order #${data.data.orderNumber} has been placed successfully.`,
          [
            {
              text: 'View Orders',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
                navigation.navigate('Orders');
              },
            },
          ]
        );
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some items to checkout</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Image
              source={{ uri: item.image || 'https://via.placeholder.com/60' }}
              style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                ${item.price} x {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={shippingAddress.fullName}
          onChangeText={(text) => setShippingAddress({ ...shippingAddress, fullName: text })}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={shippingAddress.address}
          onChangeText={(text) => setShippingAddress({ ...shippingAddress, address: text })}
        />
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="City"
            value={shippingAddress.city}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="State"
            value={shippingAddress.state}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, state: text })}
          />
        </View>
        
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="ZIP Code"
            value={shippingAddress.zipCode}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, zipCode: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Country"
            value={shippingAddress.country}
            onChangeText={(text) => setShippingAddress({ ...shippingAddress, country: text })}
          />
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'card' && styles.selectedPaymentOption]}
          onPress={() => setPaymentMethod('card')}
        >
          <Ionicons name="card-outline" size={24} color="#667eea" />
          <Text style={styles.paymentOptionText}>Credit/Debit Card</Text>
          <Ionicons 
            name={paymentMethod === 'card' ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color="#667eea" 
          />
        </TouchableOpacity>

        {paymentMethod === 'card' && (
          <View style={styles.cardForm}>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              value={cardDetails.cardNumber}
              onChangeText={(text) => setCardDetails({ ...cardDetails, cardNumber: text })}
              keyboardType="numeric"
              maxLength={19}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Cardholder Name"
              value={cardDetails.cardholderName}
              onChangeText={(text) => setCardDetails({ ...cardDetails, cardholderName: text })}
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                value={cardDetails.expiryDate}
                onChangeText={(text) => setCardDetails({ ...cardDetails, expiryDate: text })}
                keyboardType="numeric"
                maxLength={5}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                value={cardDetails.cvv}
                onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'paypal' && styles.selectedPaymentOption]}
          onPress={() => setPaymentMethod('paypal')}
        >
          <Ionicons name="logo-paypal" size={24} color="#667eea" />
          <Text style={styles.paymentOptionText}>PayPal</Text>
          <Ionicons 
            name={paymentMethod === 'paypal' ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color="#667eea" 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentOption, paymentMethod === 'cod' && styles.selectedPaymentOption]}
          onPress={() => setPaymentMethod('cod')}
        >
          <Ionicons name="cash-outline" size={24} color="#667eea" />
          <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
          <Ionicons 
            name={paymentMethod === 'cod' ? "radio-button-on" : "radio-button-off"} 
            size={24} 
            color="#667eea" 
          />
        </TouchableOpacity>
      </View>

      {/* Order Total */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Total</Text>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Shipping:</Text>
          <Text style={styles.totalValue}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax:</Text>
          <Text style={styles.totalValue}>${tax.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total:</Text>
          <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, loading && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.placeOrderGradient}
          >
            <Text style={styles.placeOrderButtonText}>
              {loading ? 'Placing Order...' : `Place Order - $${total.toFixed(2)}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  shopButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 12,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#eee',
    marginBottom: 10,
  },
  selectedPaymentOption: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  paymentOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 15,
  },
  cardForm: {
    marginTop: 15,
    marginBottom: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalRow: {
    borderTopWidth: 2,
    borderTopColor: '#eee',
    paddingTop: 15,
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  bottomContainer: {
    padding: 15,
  },
  placeOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});