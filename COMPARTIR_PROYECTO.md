# 🌐 Cómo Compartir el Proyecto Tablero Pavas

## Opción 1: Red Local (Recomendada - Más Rápida)

### Para compartir en la misma red WiFi:
1. Asegúrate de que Docker esté ejecutándose:
   ```bash
   docker ps
   ```

2. Comparte esta URL con la persona:
   **http://192.168.20.90**

3. La persona solo necesita:
   - Estar conectada a la misma red WiFi
   - Abrir un navegador web
   - Ir a la URL proporcionada

## Opción 2: Acceso desde Internet

### A. Usando ngrok (Gratis con registro)
1. Crea una cuenta en: https://dashboard.ngrok.com/signup
2. Copia tu authtoken desde: https://dashboard.ngrok.com/get-started/your-authtoken
3. Ejecuta en terminal:
   ```bash
   ngrok config add-authtoken TU_AUTHTOKEN_AQUI
   ngrok http 80
   ```
4. Comparte la URL que aparece (ej: https://abc123.ngrok.io)

### B. Usando LocalTunnel (Sin registro)
1. Instala localtunnel:
   ```bash
   npm install -g localtunnel
   ```
2. Crea el túnel:
   ```bash
   lt --port 80 --subdomain tablero-pavas-demo
   ```
3. Comparte la URL: https://tablero-pavas-demo.loca.lt

### C. Usando serveo.net (Sin registro)
1. Si tienes SSH instalado:
   ```bash
   ssh -R 80:localhost:80 serveo.net
   ```
2. Te dará una URL pública temporal

## Opción 3: Hosting Temporal en la Nube

### Usando Docker Hub + Play with Docker
1. Sube tu imagen a Docker Hub:
   ```bash
   docker tag tableropavascopia-frontend tunombre/tablero-pavas:latest
   docker push tunombre/tablero-pavas:latest
   ```
2. Usa Play with Docker (https://labs.play-with-docker.com/)
3. Crea instancia y ejecuta tu contenedor

## Verificación del Proyecto

Antes de compartir, verifica que todo funcione:

```bash
# Verificar contenedores
docker ps

# Probar acceso local
curl -I http://localhost
# o en navegador: http://localhost

# Verificar logs si hay problemas
docker logs tableropavascopia-frontend-1
docker logs tableropavascopia-backend-1
docker logs tableropavascopia-db-1
```

## Credenciales de Prueba

Para que la persona pueda probar el sistema, proporciona:
- Usuario de prueba (si existe)
- Contraseña de prueba
- Explicación básica de funcionalidades

## Notas Importantes

- **Red Local**: Más rápido, seguro, sin límites
- **Internet**: Más accesible, pero puede tener limitaciones de tiempo/ancho de banda
- **Firewall**: Asegúrate de que no bloquee las conexiones entrantes al puerto 80
- **Datos**: La base de datos MySQL está incluida en Docker, por lo que los datos persisten

## Comandos Útiles

```bash
# Reiniciar todos los servicios
docker-compose restart

# Ver logs en tiempo real
docker-compose logs -f

# Detener todo
docker-compose down

# Iniciar todo de nuevo
docker-compose up -d
```
