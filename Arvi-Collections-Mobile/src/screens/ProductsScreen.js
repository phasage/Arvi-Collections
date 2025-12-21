import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { API_BASE } from '../config/api';

export default function ProductsScreen({ navigation, route }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.categoryId || '');

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadCategories(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      let url = `${API_BASE}/products`;
      const params = new URLSearchParams();
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
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

  const handleSearch = () => {
    loadProducts();
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    Alert.alert('Success', `${product.name} added to cart!`);
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ uri: item.images?.[0]?.url || 'https://via.placeholder.com/200' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      {item.onSale && (
        <View style={styles.saleBadge}>
          <Text style={styles.saleText}>SALE</Text>
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productBrand}>{item.brand || 'Arvi\'s Collection'}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${item.price}</Text>
          {item.comparePrice && (
            <Text style={styles.comparePrice}>${item.comparePrice}</Text>
          )}
        </View>
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
      style={[
        styles.categoryChip,
        selectedCategory === item._id && styles.selectedCategoryChip
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item._id ? '' : item._id)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item._id && styles.selectedCategoryChipText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              loadProducts();
            }}>
              <Ionicons name="close-outline" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={[{ _id: '', name: 'All' }, ...categories]}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id || 'all'}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoriesList: {
    paddingHorizontal: 15,
  },
  categoryChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedCategoryChip: {
    backgroundColor: '#667eea',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  productsList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  saleBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  comparePrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});