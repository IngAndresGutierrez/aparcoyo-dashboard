/* eslint-disable @typescript-eslint/no-explicit-any */
// services/activateUser.ts
import axios from 'axios';

const API_BASE_URL = 'https://aparcoyo-back.onrender.com';

export const activateUserService = async (userId: string | number): Promise<any> => {
  try {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    const response = await axios.patch(
      `${API_BASE_URL}/apa/usuarios/${userId}`,
      {}, // Body vacío para PATCH
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error al activar usuario:', error);
    throw error;
  }
};