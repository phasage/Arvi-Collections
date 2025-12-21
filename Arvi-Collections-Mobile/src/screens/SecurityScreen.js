import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

export default function SecurityScreen({ navigation }) {
  const { user, token } = useAuth();
  const [mfaStatus, setMfaStatus] = useState({
    mfaEnabled: false,
    availableMethods: [],
    enabledMethods: []
  });
  const [loading, setLoading] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedMFAMethod, setSelectedMFAMethod] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadMFAStatus();
  }, []);

  const loadMFAStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/mfa/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMfaStatus(data.data);
      }
    } catch (error) {
      console.error('Error loading MFA status:', error);
    }
  };

  const setupMFA = async (method) => {
    setLoading(true);
    try {
      let endpoint = '';
      let body = { method };

      switch (method) {
        case 'totp':
          endpoint = '/mfa/setup/totp';
          break;
        case 'sms':
          endpoint = '/mfa/setup/sms';
          body.phoneNumber = phoneNumber;
          break;
        case 'email':
          endpoint = '/mfa/setup/email';
          break;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        if (method === 'totp' && data.data.qrCode) {
          setQrCode(data.data.qrCode);
        }
        
        Alert.alert('Success', data.message);
        setSelectedMFAMethod(method);
      } else {
        Alert.alert('Error', data.message || 'Failed to setup MFA');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to setup MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyMFASetup = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/mfa/verify-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          method: selectedMFAMethod,
          code: verificationCode,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', data.message);
        setShowMFASetup(false);
        setSelectedMFAMethod(null);
        setVerificationCode('');
        setQrCode(null);
        loadMFAStatus();
      } else {
        Alert.alert('Error', data.message || 'Invalid verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Password changed successfully');
        setShowPasswordReset(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async (method) => {
    Alert.alert(
      'Disable MFA',
      `Are you sure you want to disable ${method.toUpperCase()} authentication?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            // In a real app, you'd need to verify with current MFA code
            Alert.alert('Info', 'MFA disable functionality requires additional verification');
          },
        },
      ]
    );
  };

  const renderMFAMethod = (method, enabled) => {
    const methodInfo = {
      totp: {
        title: 'Authenticator App',
        description: 'Use Google Authenticator, Authy, or similar apps',
        icon: 'shield-checkmark-outline',
      },
      sms: {
        title: 'SMS Verification',
        description: 'Receive codes via text message',
        icon: 'chatbubble-outline',
      },
      email: {
        title: 'Email Verification',
        description: 'Receive codes via email',
        icon: 'mail-outline',
      },
    };

    const info = methodInfo[method];

    return (
      <View key={method} style={styles.mfaMethodCard}>
        <View style={styles.mfaMethodInfo}>
          <Ionicons name={info.icon} size={24} color="#667eea" />
          <View style={styles.mfaMethodText}>
            <Text style={styles.mfaMethodTitle}>{info.title}</Text>
            <Text style={styles.mfaMethodDescription}>{info.description}</Text>
          </View>
        </View>
        
        <View style={styles.mfaMethodActions}>
          {enabled ? (
            <View style={styles.enabledBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
              <Text style={styles.enabledText}>Enabled</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.setupButton}
              onPress={() => {
                setSelectedMFAMethod(method);
                setShowMFASetup(true);
              }}
            >
              <Text style={styles.setupButtonText}>Setup</Text>
            </TouchableOpacity>
          )}
          
          {enabled && (
            <TouchableOpacity
              style={styles.disableButton}
              onPress={() => disableMFA(method)}
            >
              <Text style={styles.disableButtonText}>Disable</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>Security Settings</Text>
        <Text style={styles.headerSubtitle}>Protect your account</Text>
      </LinearGradient>

      {/* Password Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Password</Text>
        
        <TouchableOpacity
          style={styles.securityItem}
          onPress={() => setShowPasswordReset(true)}
        >
          <View style={styles.securityItemLeft}>
            <Ionicons name="key-outline" size={24} color="#667eea" />
            <View style={styles.securityItemText}>
              <Text style={styles.securityItemTitle}>Change Password</Text>
              <Text style={styles.securityItemDescription}>
                Update your account password
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Multi-Factor Authentication */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Multi-Factor Authentication</Text>
        <Text style={styles.sectionDescription}>
          Add an extra layer of security to your account
        </Text>
        
        <View style={styles.mfaStatus}>
          <View style={styles.mfaStatusInfo}>
            <Ionicons 
              name={mfaStatus.mfaEnabled ? "shield-checkmark" : "shield-outline"} 
              size={24} 
              color={mfaStatus.mfaEnabled ? "#4caf50" : "#999"} 
            />
            <Text style={[
              styles.mfaStatusText,
              { color: mfaStatus.mfaEnabled ? "#4caf50" : "#999" }
            ]}>
              MFA is {mfaStatus.mfaEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </View>
        </View>

        {['totp', 'sms', 'email'].map(method => 
          renderMFAMethod(method, mfaStatus.enabledMethods.includes(method))
        )}
      </View>

      {/* Security Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Tips</Text>
        
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color="#ff9500" />
          <Text style={styles.tipText}>
            Use a strong, unique password and enable MFA for maximum security
          </Text>
        </View>
        
        <View style={styles.tipCard}>
          <Ionicons name="warning-outline" size={20} color="#ff3b30" />
          <Text style={styles.tipText}>
            Never share your verification codes with anyone
          </Text>
        </View>
      </View>

      {/* MFA Setup Modal */}
      <Modal
        visible={showMFASetup}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Setup {selectedMFAMethod?.toUpperCase()} Authentication
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowMFASetup(false);
                setSelectedMFAMethod(null);
                setQrCode(null);
                setVerificationCode('');
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedMFAMethod === 'totp' && (
              <View style={styles.totpSetup}>
                <Text style={styles.setupInstructions}>
                  1. Install an authenticator app like Google Authenticator or Authy
                </Text>
                <Text style={styles.setupInstructions}>
                  2. Scan the QR code below or enter the secret manually
                </Text>
                
                {!qrCode ? (
                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => setupMFA('totp')}
                    disabled={loading}
                  >
                    <Text style={styles.generateButtonText}>
                      {loading ? 'Generating...' : 'Generate QR Code'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qrCodeContainer}>
                    <Image source={{ uri: qrCode }} style={styles.qrCode} />
                  </View>
                )}
                
                <Text style={styles.setupInstructions}>
                  3. Enter the 6-digit code from your authenticator app
                </Text>
              </View>
            )}

            {selectedMFAMethod === 'sms' && (
              <View style={styles.smsSetup}>
                <Text style={styles.setupInstructions}>
                  Enter your phone number to receive SMS verification codes
                </Text>
                
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
                
                <TouchableOpacity
                  style={styles.sendCodeButton}
                  onPress={() => setupMFA('sms')}
                  disabled={loading || !phoneNumber}
                >
                  <Text style={styles.sendCodeButtonText}>
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedMFAMethod === 'email' && (
              <View style={styles.emailSetup}>
                <Text style={styles.setupInstructions}>
                  A verification code will be sent to your registered email address: {user?.email}
                </Text>
                
                <TouchableOpacity
                  style={styles.sendCodeButton}
                  onPress={() => setupMFA('email')}
                  disabled={loading}
                >
                  <Text style={styles.sendCodeButtonText}>
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {(qrCode || selectedMFAMethod === 'sms' || selectedMFAMethod === 'email') && (
              <View style={styles.verificationSection}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="Enter 6-digit verification code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="numeric"
                  maxLength={6}
                />
                
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={verifyMFASetup}
                  disabled={loading || verificationCode.length !== 6}
                >
                  <Text style={styles.verifyButtonText}>
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordReset}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity
              onPress={() => {
                setShowPasswordReset(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.passwordForm}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              
              <TextInput
                style={styles.passwordInput}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                <Text style={styles.requirementText}>• At least 8 characters</Text>
                <Text style={styles.requirementText}>• Include uppercase and lowercase letters</Text>
                <Text style={styles.requirementText}>• Include at least one number</Text>
                <Text style={styles.requirementText}>• Include at least one special character</Text>
              </View>
              
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={changePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              >
                <Text style={styles.changePasswordButtonText}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    margin: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityItemText: {
    marginLeft: 15,
    flex: 1,
  },
  securityItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  securityItemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mfaStatus: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mfaStatusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mfaStatusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  mfaMethodCard: {
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
  mfaMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mfaMethodText: {
    marginLeft: 15,
    flex: 1,
  },
  mfaMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  mfaMethodDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mfaMethodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enabledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  enabledText: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  setupButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  disableButton: {
    backgroundColor: '#ff4757',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disableButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  totpSetup: {
    alignItems: 'center',
  },
  setupInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  smsSetup: {
    alignItems: 'center',
  },
  emailSetup: {
    alignItems: 'center',
  },
  phoneInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  sendCodeButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  sendCodeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verificationSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  codeInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
  },
  verifyButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordForm: {
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  passwordRequirements: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  changePasswordButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});