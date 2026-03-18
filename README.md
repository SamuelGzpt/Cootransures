# COONTRASURES

Plataforma web oficial para la Cooperativa de Transportadores Cootransures. Este proyecto consiste en una aplicación web moderna (React) y un servidor backend (Node.js) para la gestión de información, servicios y reportes de la cooperativa.

## 🚀 Características

- **Landing Page Interactiva**: Diseño moderno con animaciones suaves utilizando GSAP.
- **Gestión de Servicios**: Visualización de servicios de transporte (Empresarial, Turístico, Escolar).
- **Noticias**: Sección de novedades y actualizaciones.
- **Panel Administrativo**: Login seguro para administradores.
- **Carga de Reportes**: Sistema seguro para subir archivos PDF de reportes (balance social, estados financieros, etc.).
- **Backend API**: Servidor Express con conexión a base de datos PostgreSQL.

## 🛠️ Tecnologías Utilizadas

### Frontend (Cliente)
- **React 19**: Biblioteca de interfaz de usuario.
- **TypeScript**: Tipado estático para mayor robustez.
- **Vite**: Entorno de desarrollo y build tool rápido.
- **GSAP**: Animaciones avanzadas.
- **CSS Modules / Variables**: Estilizado personalizado.
- **React Router**: Navegación SPA.

### Backend (Servidor)
- **Node.js & Express**: API RESTful.
- **PostgreSQL**: Base de datos relacional.
- **Multer**: Manejo de subida de archivos.
- **Helmet & Rate Limit**: Seguridad básica.



## 📂 Estructura del Proyecto

```
Coontrasures/
├── public/              # Archivos estáticos
├── src/                 # Código fuente del Frontend
│   ├── components/      # Componentes React reutilizables
│   ├── pages/           # Páginas principales
│   ├── styles/          # Estilos globales
│   └── main.tsx         # Punto de entrada
├── server/              # Código del Backend
│   ├── db/              # Configuración de base de datos
│   ├── uploads/         # Carpeta donde se guardan los reportes
│   └── index.js         # Archivo principal del servidor
├── package.json         # Dependencias del Frontend
└── README.md            # Documentación
```

## 📄 Licencia

Este proyecto es para uso exclusivo de Cootransures.
