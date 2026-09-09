# Threaddit 🗺️📍

> **Trabajo de Fin de Grado (TFG)** — Plataforma social colaborativa orientada a comunidades temáticas geolocalizadas sobre mapas interactivos.

[![Stack](https://img.shields.io/badge/Stack-MERN-green.svg)](#stack-tecnológico)
[![Framework](https://img.shields.io/badge/Framework-Next.js-black?logo=next.js)](#stack-tecnológico)
[![Auth](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](#servicios-externos)
[![Database](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)](#servicios-externos)

---

## 📌 Descripción

**Threaddit** es una red social construida en torno al concepto de descubrimiento local a través de comunidades temáticas. Permite a los usuarios crear y unirse a grupos específicos de una región o temática (por ejemplo, *«Comer en Sevilla»*), donde las publicaciones no son simples textos, sino lugares, comercios y recomendaciones georreferenciadas.

Cada comunidad cuenta con un **mapa interactivo** integrado que muestra de forma visual todos los puntos compartidos por sus miembros, permitiendo explorar recomendaciones locales con imágenes, detalles y opiniones en tiempo real.

---

## 🚀 Funcionalidades Clave

* **Comunidades y Roles:**
  * Creación y administración de comunidades temáticas.
  * Sistema de roles: Administradores (moderación y gestión) y Miembros/Seguidores.
* **Mapa Interactivo y Filtros:**
  * Visualización espacial de publicaciones por coordenadas geográficas.
  * Filtrado dinámico de lugares dentro del mapa de cada comunidad.
* **Interacción Social Completa:**
  * Feed de publicaciones con soporte para imágenes y ubicaciones exactas.
  * Sistema de likes y comentarios anidados/hilos de conversación.
  * Seguimiento bidireccional: seguir a usuarios específicos y/o a comunidades enteras.
* **Perfiles y Ajustes:**
  * Perfil de usuario con historial de publicaciones y comunidades asociadas.
  * Panel de configuración de cuenta y preferencias.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React / Next.js, Tailwind CSS, Mapbox GL JS.
* **Backend:** Node.js, Next.js Server Actions & API Routes.
* **Base de Datos:** MongoDB con Mongoose (modelado relacional y geoespacial).
* **Servicios e Integraciones:**
  * **Clerk:** Gestión de sesiones, autenticación segura y roles.
  * **Uploadthing:** Subida optimizada y almacenamiento de imágenes.
  * **Mapbox:** Renderizado de teselas y mapas vectoriales interactivos.

---

## 📸 Capturas de Pantalla

| Mapa de Comunidad | Publicación y Detalle |
| :---: | :---: |
| ![Mapa Comunidad](https://via.placeholder.com/450x260?text=Vista+del+Mapa) | ![Feed Detalle](https://via.placeholder.com/450x260?text=Feed+y+Detalle) |

---

## ⚙️ Puesta en Marcha en Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio

git clone https://github.com/jorfigrom/Threaddit.git
cd Threaddit

### 2. Instalar dependencias

npm install

### 3. Configurar variables de entorno

Crea un archivo llamado .env o .env.local en la raíz del proyecto y añade las siguientes variables:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

MAPBOX_API_KEY=pk.eyJ1...

UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=tu_app_id

MONGODB_URL=mongodb+srv://usuario:password@cluster.mongodb.net/threaddit?retryWrites=true&w=majority

> Nota: Para obtener estas credenciales necesitas registrarte y generar las API keys correspondientes en Clerk (https://clerk.com/), Mapbox (https://www.mapbox.com/), Uploadthing (https://uploadthing.com/) y crear una base de datos en MongoDB Atlas (https://www.mongodb.com/).

### 4. Iniciar el servidor de desarrollo

npm run dev

Abre http://localhost:3000 en tu navegador para ver la aplicación en ejecución.

---

## 🎓 Contexto Académico

Este proyecto fue desarrollado como **Trabajo de Fin de Grado (TFG)**, con el objetivo de demostrar competencias en:
* Arquitectura fullstack con tecnologías modernas de JavaScript/TypeScript.
* Manejo e integración de APIs de terceros (autenticación, mapas vectoriales y almacenamiento multimedia).
* Modelado y persistencia de datos geoespaciales.

---

## 👤 Autor

* **Jorge Figueroa Romero** — [GitHub](https://github.com/jorfigrom)
