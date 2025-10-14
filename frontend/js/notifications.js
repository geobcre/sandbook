class NotificationManager {
    constructor() {
      this.isSupported = 'Notification' in window;
      this.permission = this.isSupported ? Notification.permission : 'denied';
    }
  
    async requestPermission() {
      if (!this.isSupported) {
        console.log('Las notificaciones no son compatibles con este navegador');
        return false;
      }
  
      if (this.permission === 'granted') {
        return true;
      }
  
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    }
  
    async sendNotification(title, options = {}) {
      if (!await this.requestPermission()) {
        return false;
      }
  
      const defaultOptions = {
        icon: './images/icon-192x192.png',
        badge: './images/icon-72x72.png',
        vibrate: [100, 50, 100],
        requireInteraction: false,
        ...options
      };
  
      const notification = new Notification(title, defaultOptions);
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
  
      return notification;
    }
  
    // Notificaciones específicas de Sandbook
    async notifyNewProduct(productName) {
      return this.sendNotification(
        '📚 Nuevo libro disponible',
        {
          body: `¡${productName} ya está disponible en Sandbook!`,
          tag: 'new-product'
        }
      );
    }
  
    async notifyOrderUpdate(orderId, status) {
      return this.sendNotification(
        '📦 Actualización de pedido',
        {
          body: `Tu pedido #${orderId} está ${status}`,
          tag: `order-${orderId}`
        }
      );
    }
  
    async notifyPromotion(title, description) {
      return this.sendNotification(
        `🎉 ${title}`,
        {
          body: description,
          tag: 'promotion'
        }
      );
    }
  }
  
  // Instancia global
  window.notificationManager = new NotificationManager();
  
  // Solicitar permisos cuando el usuario se registre
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
      window.notificationManager.requestPermission();
    }
  });