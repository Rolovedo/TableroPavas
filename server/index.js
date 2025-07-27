// Configuración para Vercel
export default function handler(req, res) {
  return new Promise((resolve) => {
    // Import the main app
    const app = require('./app.js');
    
    // Handle the request
    app(req, res);
    resolve();
  });
}
