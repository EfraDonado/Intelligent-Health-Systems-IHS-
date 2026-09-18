# Salud Monitor 🏥

Salud Monitor es una aplicación moderna (desarrollada con Vite, React y Tailwind CSS) diseñada para monitorear y gestionar sistemas de salud inteligentes. Recientemente se ha adaptado para funcionar como una aplicación de escritorio nativa utilizando Electron.

## Características Principales

*   **Aplicación Web a Escritorio**: Convertida completamente para correr de forma nativa en tu PC como `.exe`.
*   **Diseño Interfaz**: Componentes dinámicos, navegación sencilla e integración de gráficos para lectura de signos vitales e historial médico.
*   **Sin Errores de Navegación**: Configurada con `HashRouter` para evitar errores 404 al navegar localmente.

## Instalación y Desarrollo

### Requisitos Previos

*   Node.js (v18 o superior recomendado)
*   NPM

### Iniciar en modo Web (Desarrollo)

Para trabajar en el diseño y la interfaz como una página web normal:

```bash
npm run dev
```

### Iniciar en modo Escritorio (Desarrollo)

Para previsualizar cómo se verá la aplicación de escritorio usando Electron:

```bash
npm run electron:dev
```

### Generar el Instalador (.exe)

Para compilar la aplicación y crear un instalador final listo para distribución, ejecuta:

```bash
npm run build:exe
```

*Nota: Por configuración predeterminada, el proceso empaquetará los archivos temporales y generará el instalador final (`Salud Monitor Setup.exe`) en el disco `E:\SaludMonitorBuild` para prevenir que tu disco local (C:) se quede sin espacio libre.*

## Tecnologías Utilizadas

*   **Frontend:** React 19, Vite, Tailwind CSS, Recharts
*   **Empaquetador de Escritorio:** Electron, Electron-Builder
*   **Librerías Adicionales:** React Router DOM (HashRouter), jsPDF para reportes.
