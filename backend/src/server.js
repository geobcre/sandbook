import "dotenv/config";
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor Sandbook corriendo en puerto ${PORT}`);
  console.log(`📱 PWA disponible en: http://localhost:${PORT}`);
});