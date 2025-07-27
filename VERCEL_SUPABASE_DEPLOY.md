# Configuración Vercel + Supabase - 100% GRATIS

## PASO 1: Crear cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up con GitHub
4. Crear nuevo proyecto:
   - **Project name:** tablero-pavas
   - **Database Password:** (genera una fuerte, guárdala)
   - **Region:** US East (Ohio)
   - Click "Create new project"

## PASO 2: Obtener credenciales de Supabase

En tu dashboard de Supabase:
1. Ve a **Settings** → **Database**
2. En **Connection parameters** encontrarás:
   - **Host:** tu-proyecto.supabase.co
   - **Database name:** postgres
   - **Port:** 5432
   - **Username:** postgres
   - **Password:** (la que pusiste al crear)

3. También ve a **Settings** → **API** y copia:
   - **Project URL:** https://tu-proyecto.supabase.co
   - **anon public key:** eyJ0eXAiOiJKV1Q...

## PASO 3: Deploy en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Sign up con GitHub
3. **Add New** → **Project**
4. Importa **TableroPavas**
5. En **Environment Variables** agrega:

```
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
DB_HOST=[host de supabase]
DB_USER=postgres
DB_PASSWORD=[tu password]
DB_NAME=postgres
DB_PORT=5432
JWT_SECRET=tu_jwt_secreto_super_seguro
NODE_ENV=production
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1Q...
```

6. Click **Deploy**

## PASO 4: Importar datos a Supabase

Una vez desplegado, necesitarás migrar tu BD:

1. En Supabase, ve a **SQL Editor**
2. Crea las tablas copiando tu estructura MySQL
3. Importa los datos usando el panel de Supabase

## 🎉 RESULTADO

Tu proyecto estará en: `https://tablero-pavas.vercel.app`

- ✅ **Hosting:** Gratis para siempre
- ✅ **Base de datos:** 500MB gratis
- ✅ **SSL:** Incluido
- ✅ **Deploy automático:** Con cada git push

## Costos: $0.00 USD 💰
