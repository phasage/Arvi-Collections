import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE } from '../config/api';

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        throw new Error(data.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const renderCategory = ({ item, index }) => {
    const gradientColors = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#a8edea', '#fed6e3'],
    ];

    const colors = gradientColors[index % gradientColors.length];

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigation.navigate('Products', { categoryId: item._id })}
      >
        <LinearGradient colors={colors} style={styles.categoryGradient}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.categoryIconContainer}>
              <Ionicons name="grid-outline" size={40} color="#fff" />
            </View>
          )}
          
          <View style={styles.categoryOverlay}>
            <Text style={styles.categoryName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.categoryDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.categoryFooter}>
              <Text style={styles.productCount}>
                {item.productCount || 0} products
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.categoriesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="grid-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Categories Found</Text>
            <Text style={styles.emptySubtitle}>
              Categories will appear here when available
            </Text>
          </View>
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Shop by Category</Text>
            <Text style={styles.headerSubtitle}>
              Discover products organized by category
            </Text>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  categoriesList: {
    padding: 10,
  },
  categoryCard: {
    flex: 1,
    margin: 5,
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryGradient: {
    flex: 1,
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  categoryIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 10,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productCount: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
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
  },
});