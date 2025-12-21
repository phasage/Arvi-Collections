import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../config/api';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        loadFeaturedProducts(),
        loadCategories(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/products/featured`);
      const data = await response.json();
      if (data.success) {
        setFeaturedProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading featured products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.slice(0, 4)); // Show only first 4 categories
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Alert.alert('Success', `${product.name} added to cart!`);
  };

  const renderFeaturedProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/200' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart-outline" size={16} color="#fff" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Products', { categoryId: item._id })}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.categoryGradient}
      >
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>
              {user ? `Welcome back, ${user.name}!` : 'Welcome to'}
            </Text>
            <Text style={styles.brandName}>Arvi's Collection</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Featured Products Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featuredProducts}
          renderItem={renderFeaturedProduct}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Products')}
          >
            <Ionicons name="grid-outline" size={32} color="#667eea" />
            <Text style={styles.actionText}>Browse Products</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="cart-outline" size={32} color="#667eea" />
            <Text style={styles.actionText}>View Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => user ? navigation.navigate('Orders') : navigation.navigate('Login')}
          >
            <Ionicons name="receipt-outline" size={32} color="#667eea" />
            <Text style={styles.actionText}>My Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={32} color="#667eea" />
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  brandName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryCard: {
    width: 150,
    height: 100,
    marginRight: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categoryDescription: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  productsList: {
    paddingRight: 20,
  },
  productCard: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 10,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: 8,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});