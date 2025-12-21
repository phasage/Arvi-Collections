import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      'Success',
      `${quantity} x ${product.name} added to cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]
    );
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigation.navigate('Checkout');
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: product.images?.[selectedImage]?.url || 'https://via.placeholder.com/400' 
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {product.onSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleText}>SALE</Text>
            </View>
          )}
          {product.images && product.images.length > 1 && (
            <ScrollView 
              horizontal 
              style={styles.thumbnailContainer}
              showsHorizontalScrollIndicator={false}
            >
              {product.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(index)}
                  style={[
                    styles.thumbnail,
                    selectedImage === index && styles.selectedThumbnail
                  ]}
                >
                  <Image
                    source={{ uri: image.url }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.brand}>{product.brand || 'Arvi\'s Collection'}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${product.price}</Text>
            {product.comparePrice && (
              <Text style={styles.comparePrice}>${product.comparePrice}</Text>
            )}
            {product.comparePrice && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                </Text>
              </View>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <Ionicons 
              name={product.stock > 0 ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={product.stock > 0 ? "#4caf50" : "#f44336"} 
            />
            <Text style={[
              styles.stockText,
              { color: product.stock > 0 ? "#4caf50" : "#f44336" }
            ]}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </Text>
          </View>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Quantity:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Ionicons name="remove" size={20} color="#667eea" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                >
                  <Ionicons name="add" size={20} color="#667eea" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Features</Text>
              {product.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#667eea" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value], index) => (
                <View key={index} style={styles.specItem}>
                  <Text style={styles.specKey}>{key}:</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      {product.stock > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={24} color="#667eea" />
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.buyNowButton}
            onPress={handleBuyNow}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.buyNowGradient}
            >
              <Text style={styles.buyNowButtonText}>Buy Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  imageContainer: {
    backgroundColor: '#fff',
  },
  mainImage: {
    width: width,
    height: width,
  },
  saleBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ff4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  thumbnailContainer: {
    padding: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#667eea',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  infoContainer: {
    padding: 20,
  },
  brand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
  },
  comparePrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  discountBadge: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 15,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  specItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 120,
  },
  specValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  bottomContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 15,
    marginRight: 10,
  },
  addToCartButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyNowGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buyNowButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
