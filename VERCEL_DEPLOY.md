# Vercel Deployment Guide para TableroPavas

## 1. Configurar PlanetScale (Base de Datos)

1. Ve a [planetscale.com](https://planetscale.com) y crea cuenta
2. Crea nueva base de datos: "tablero-pavas"
3. En la región "us-east-1"
4. Ve a "Connect" y obtén las credenciales
5. Copia la connection string que se ve así:
   ```
   mysql://username:password@host/database?sslaccept=strict
   ```

## 2. Variables de Entorno para Vercel

En tu dashboard de Vercel, configura estas variables:

### Base de Datos:
- `DB_HOST`: el host de PlanetScale
- `DB_USER`: el usuario de PlanetScale  
- `DB_PASSWORD`: la contraseña de PlanetScale
- `DB_NAME`: tablero-pavas
- `DB_PORT`: 3306

### JWT y Seguridad:
- `JWT_SECRET`: tu_jwt_secret_aqui
- `NODE_ENV`: production

### CORS:
- `FRONTEND_URL`: https://tu-proyecto.vercel.app

## 3. Configurar Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu cuenta de GitHub
3. Importa el repositorio "TableroPavas"
4. Vercel detectará automáticamente que es un proyecto React
5. En "Environment Variables" agrega todas las variables de arriba
6. Click "Deploy"

## 4. Subir Base de Datos

Una vez desplegado, necesitarás importar tus tablas a PlanetScale:

1. Exporta tu BD actual con:
   ```bash
   mysqldump -u root -p tablero_pavas > backup.sql
   ```

2. Importa a PlanetScale usando su CLI o interfaz web

## 5. URL Final

Tu proyecto estará disponible en:
`https://tablero-pavas.vercel.app` (o el nombre que elijas)

¡Y se actualizará automáticamente con cada git push!
