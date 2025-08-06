import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView
} from 'react-native';
import axios from 'axios';
import IP from '../components/config';

export default function UsuarioScreen({ route }) {
  const { userData, onLogout } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'telefono' | 'contrasena'
  const [inputValue, setInputValue] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Para confirmar la nueva contraseña
  const [loading, setLoading] = useState(false);

  const nombreCompleto = `${userData.nombre} ${userData.primerApell}${userData.segundoApell ? ' ' + userData.segundoApell : ''}`;
  const rolTexto = userData.idRol === 1 ? 'Administrador' : userData.idRol === 2 ? 'Usuario' : 'Desconocido';
  const BASE_URL = IP;

  const openModal = (type) => {
    setModalType(type);
    setInputValue('');
    setCurrentPassword('');
    setConfirmNewPassword('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (modalType === 'telefono') {
      if (!inputValue.trim()) {
        Alert.alert('Error', 'El número de teléfono no puede estar vacío.');
        return;
      }
    } else if (modalType === 'contrasena') {
      if (!currentPassword.trim() || !inputValue.trim()) {
        Alert.alert('Error', 'Debes llenar ambas contraseñas.');
        return;
      }
      if (inputValue.trim() !== confirmNewPassword.trim()) {
        Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
        return;
      }
    }

    setLoading(true);
    try {
      if (modalType === 'telefono') {
        const res = await axios.put(`${BASE_URL}/usuario/${userData.id}/telefono`, {
          numTel: inputValue.trim(),
        });
        if (res.status === 200) {
          Alert.alert('Éxito', 'Número de teléfono actualizado correctamente.');
          userData.numTel = inputValue.trim();
          setModalVisible(false);
        }
      } else if (modalType === 'contrasena') {
        const res = await axios.put(`${BASE_URL}/usuario/${userData.id}/contrasena`, {
          contrasenaActual: currentPassword.trim(),
          contrasenaNueva: inputValue.trim(),
        });
        if (res.status === 200) {
          Alert.alert('Éxito', 'Contraseña actualizada correctamente.');
          setModalVisible(false);
        }
      }
    } catch (error) {
      if (error.response && error.response.data?.error) {
        Alert.alert('Error', error.response.data.error);
      } else {
        Alert.alert('Error', 'No se pudo actualizar. Intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <Text style={styles.welcomeText}>Mi Perfil</Text>
            <Text style={styles.userName}>Información Personal</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: '#66BB6A' }]} />
              <Text style={styles.statusText}>Cuenta Activa</Text>
            </View>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.iconText}>👤</Text>
            </View>
            <Text style={styles.sectionTitle}>INFORMACIÓN DEL USUARIO</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image source={require('../assets/Usuario.png')} style={styles.avatar} />
              <View style={styles.roleIndicator}>
                <Text style={styles.roleText}>{rolTexto}</Text>
              </View>
            </View>
            
            <Text style={styles.fullName}>{nombreCompleto}</Text>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Text style={styles.infoIconText}>📧</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Correo Electrónico</Text>
                  <Text style={styles.infoValue}>{userData.correo}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Text style={styles.infoIconText}>📱</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Número de Teléfono</Text>
                  <Text style={styles.infoValue}>{userData.numTel || 'No disponible'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <Text style={styles.infoIconText}>🔑</Text>
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tipo de Usuario</Text>
                  <Text style={styles.infoValue}>{rolTexto}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.iconText}>⚙️</Text>
            </View>
            <Text style={styles.sectionTitle}>CONFIGURACIÓN DE CUENTA</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { borderLeftColor: '#2196F3' }]} 
              onPress={() => openModal('telefono')}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                  <Text style={styles.actionIconText}>📱</Text>
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Cambiar Teléfono</Text>
                  <Text style={styles.actionSubtitle}>Actualizar número de contacto</Text>
                </View>
                <Text style={[styles.actionArrow, { color: '#2196F3' }]}>›</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { borderLeftColor: '#FF9800' }]} 
              onPress={() => openModal('contrasena')}
            >
              <View style={styles.actionContent}>
                <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                  <Text style={styles.actionIconText}>🔒</Text>
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Cambiar Contraseña</Text>
                  <Text style={styles.actionSubtitle}>Actualizar credenciales de acceso</Text>
                </View>
                <Text style={[styles.actionArrow, { color: '#FF9800' }]}>›</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.iconText}>🚪</Text>
            </View>
            <Text style={styles.sectionTitle}>SESIÓN</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <View style={styles.logoutContent}>
              <Text style={styles.logoutIcon}>🔓</Text>
              <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIcon, { 
                backgroundColor: modalType === 'telefono' ? '#E3F2FD' : '#FFF3E0' 
              }]}>
                <Text style={styles.modalIconText}>
                  {modalType === 'telefono' ? '📱' : '🔒'}
                </Text>
              </View>
              <Text style={styles.modalTitle}>
                {modalType === 'telefono' ? 'Actualizar Teléfono' : 'Cambiar Contraseña'}
              </Text>
            </View>

            {modalType === 'telefono' ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nuevo número de teléfono</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ingresa tu nuevo número"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={inputValue}
                  onChangeText={setInputValue}
                  editable={!loading}
                  autoFocus
                />
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña actual</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ingresa tu contraseña actual"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  editable={!loading}
                  autoFocus
                />
                
                <Text style={styles.inputLabel}>Nueva contraseña</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ingresa tu nueva contraseña"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={inputValue}
                  onChangeText={setInputValue}
                  editable={!loading}
                />
                
                <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  editable={!loading}
                />
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? '⏳ Guardando...' : '💾 Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContainer: {
    marginBottom: 25,
  },
  headerGradient: {
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#A5D6A7',
    fontWeight: '500',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  roleIndicator: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoIconText: {
    fontSize: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#1B5E20',
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  actionArrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconText: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
