import { useState } from 'react';
import './MessageSender.css';

const ProductDetailsMessageSender = ({ isConnected, onMessageSent }) => {
    const [formData, setFormData] = useState({
      phone: '',
      caption: '',
      imageData: '',
    });
  
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [preview, setPreview] = useState('');
  
    const apiBaseUrl = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5111';
    const token = localStorage.getItem('token');
  
    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
  
      // Generar preview en tiempo real
      if (name === 'caption') {
        generatePreview({
          ...formData,
          [name]: value
        });
      }
    };
  
    // Manejar carga de imagen y convertirla a base64
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
  
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageData: reader.result // La imagen codificada en base64
        }));
      };
  
      if (file) {
        reader.readAsDataURL(file);
      }
    };
  
    // Generar preview del mensaje
    const generatePreview = (data) => {
      if (!data.caption) {
        setPreview('');
        return;
      }
  
      setPreview(`${data.caption}`);
    };
  
    // Validar formulario
    const validateForm = () => {
      if (!formData.phone.trim()) {
        setError('El número de teléfono es requerido');
        return false;
      }
  
      // Validar formato de teléfono
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        setError('El número de teléfono debe tener entre 10 y 15 dígitos');
        return false;
      }

      return true;
    };
  
    // Enviar mensaje
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!isConnected) {
        setError('Debes estar conectado a WhatsApp para enviar mensajes');
        return;
      }
  
      if (!validateForm()) {
        return;
      }
  
      setLoading(true);
      setError('');
      setSuccess('');
  
      try {
        const response = await fetch(`${apiBaseUrl}/api/send-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          if (data.errors) {
            const errorMessages = data.errors.map(err => `${err.field}: ${err.message}`).join(', ');
            throw new Error(errorMessages);
          }
          throw new Error(data.message || 'Error al enviar mensaje');
        }
  
        setSuccess(`Mensaje enviado exitosamente a ${formData.phone}`);
        
        // Limpiar formulario
        setFormData({
          phone: '',
          caption: '',
          imageData: '',
        });
        setPreview('');
  
        // Notificar al componente padre
        if (onMessageSent) {
          onMessageSent(data);
        }
  
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    // Limpiar mensajes
    const clearMessages = () => {
      setError('');
      setSuccess('');
    };

  return (
    <div className="message-sender">
      <h2>📱 Yuntas Publicidad - Enviar Mensaje WhatsApp</h2>
      
      {!isConnected && (
        <div className="warning-message">
          ⚠️ Debes estar conectado a WhatsApp para enviar mensajes
        </div>
      )}

      {error && (
        <div className="error-message" onClick={clearMessages}>
          ❌ {error}
          <span className="close-btn">×</span>
        </div>
      )}

      {success && (
        <div className="success-message" onClick={clearMessages}>
          ✅ {success}
          <span className="close-btn">×</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="message-form">
        <div className="form-group">
          <label htmlFor="phone">📞 Número de Teléfono *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Ej: +34 123 456 789"
            disabled={loading || !isConnected}
            required
          />
          <small>Formato: +34 123 456 789 o 123456789</small>
        </div>

        <div className="form-group">
          <label htmlFor="caption">📃 Descripción del Producto *</label>
          <textarea
            id="caption"
            name="caption"
            value={formData.caption}
            onChange={handleInputChange}
            placeholder="Escribe el mensaje con saltos de línea"
            disabled={loading || !isConnected}
            required
            rows={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUpload">🖼️ Subir Imagen</label>
          <input
            type="file"
            id="imageUpload"
            name="imageData"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading || !isConnected}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !isConnected}
        >
          {loading ? '⏳ Enviando...' : '📤 Enviar Mensaje'}
        </button>
      </form>

      {preview && (
        <div className="message-preview">
          <h3>👀 Vista Previa del Mensaje</h3>
          <div className="preview-content">
            <pre>{preview}</pre>
          </div>
          <div className="preview-info">
            <span>📱 Destinatario: {formData.phone || 'No especificado'}</span>
            <span>📊 Caracteres: {preview.length}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsMessageSender;
