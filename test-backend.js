// Script de prueba para verificar la conexión con el backend
const testBackendConnection = async () => {
  try {
    console.log('🔍 Probando conexión con el backend...');
    
    // Probar endpoint básico
    const response = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sistema.com',
        password: 'Admin123!'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend conectado exitosamente!');
      console.log('🔑 Token recibido:', data.access_token ? 'SÍ' : 'NO');
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Error del backend:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    return false;
  }
};

// Ejecutar la prueba
testBackendConnection();
