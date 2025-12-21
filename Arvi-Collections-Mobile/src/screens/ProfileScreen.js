import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert('Success', 'You have been logged out');
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.guestHeader}>
          <Ionicons name="person-circle-outline" size={80} color="#fff" />
          <Text style={styles.guestTitle}>Welcome to Arvi's Collection</Text>
          <Text style={styles.guestSubtitle}>Sign in to access your account</Text>
        </LinearGradient>

        <View style={styles.guestContent}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.loginGradient}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>

          <View style={styles.guestFeatures}>
            <Text style={styles.featuresTitle}>Benefits of signing in:</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#667eea" />
              <Text style={styles.featureText}>Track your orders</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#667eea" />
              <Text style={styles.featureText}>Save your favorite items</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#667eea" />
              <Text style={styles.featureText}>Faster checkout</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#667eea" />
              <Text style={styles.featureText}>Exclusive offers</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#fff" />
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="person-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="receipt-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>My Orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Addresses</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="language-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="moon-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Dark Mode</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="document-text-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#667eea" />
              <Text style={styles.menuItemText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ff4757" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  guestHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  guestSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 10,
  },
  guestContent: {
    padding: 30,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  loginGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667eea',
    marginBottom: 30,
  },
  registerButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestFeatures: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#ff4757',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4757',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 30,
    marginBottom: 20,
  },
});
