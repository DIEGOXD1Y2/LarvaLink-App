import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  TextInput, Modal, Alert
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
      <View style={styles.card}>
        <Image source={require('../assets/Usuario.png')} style={styles.image} />
        <Text style={styles.username}>{nombreCompleto}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Correo:</Text>
          <Text style={styles.info}>{userData.correo}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Teléfono:</Text>
          <Text style={styles.info}>{userData.numTel || 'No disponible'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Rol:</Text>
          <Text style={styles.info}>{rolTexto}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => openModal('telefono')}>
          <Text style={styles.buttonText}>Cambiar número de teléfono</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => openModal('contrasena')}>
          <Text style={styles.buttonText}>Cambiar contraseña</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'telefono' ? (
              <>
                <Text style={styles.modalTitle}>Actualizar número de teléfono</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nuevo número de teléfono"
                  keyboardType="phone-pad"
                  value={inputValue}
                  onChangeText={setInputValue}
                  editable={!loading}
                  autoFocus
                />
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Actualizar contraseña</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Contraseña actual"
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  editable={!loading}
                  autoFocus
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nueva contraseña"
                  secureTextEntry
                  value={inputValue}
                  onChangeText={setInputValue}
                  editable={!loading}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Confirmar nueva contraseña"
                  secureTextEntry
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  editable={!loading}
                />
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={{ color: '#333' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#4caf50' }]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={{ color: '#fff' }}>{loading ? 'Guardando...' : 'Guardar'}</Text>
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
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 4,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 18,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2e7d32',
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a4a4a',
  },
  info: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 14,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2e7d32',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#c8e6c9',
    backgroundColor: '#f9fff9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
    minHeight: 48,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
});
