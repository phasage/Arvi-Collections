import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

export default function OrdersScreen({ navigation }) {
  const { user, token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        throw new Error(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#ff9500';
      case 'processing':
        return '#007aff';
      case 'shipped':
        return '#5856d6';
      case 'delivered':
        return '#34c759';
      case 'cancelled':
        return '#ff3b30';
      default:
        return '#8e8e93';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'build-outline';
      case 'shipped':
        return 'airplane-outline';
      case 'delivered':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order: item })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 3).map((orderItem, index) => (
          <View key={index} style={styles.orderItemRow}>
            <Image
              source={{ 
                uri: orderItem.product?.images?.[0]?.url || 'https://via.placeholder.com/50' 
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {orderItem.product?.name || 'Product'}
              </Text>
              <Text style={styles.itemDetails}>
                Qty: {orderItem.quantity} × ${orderItem.price}
              </Text>
            </View>
          </View>
        ))}
        {item.items.length > 3 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 3} more items
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total: </Text>
          <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Login Required</Text>
        <Text style={styles.emptySubtitle}>Please login to view your orders</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start shopping to see your orders here
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Products')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  loginButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  ordersList: {
    padding: 15,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  orderItems: {
    marginBottom: 15,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
  },
  moreItems: {
    fontSize: 12,
    color: '#667eea',
    fontStyle: 'italic',
    marginTop: 5,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
});