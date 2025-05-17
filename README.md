# 🎧 Sound Therapy App

Una aplicación enfocada en mejorar la salud y el bienestar mediante el uso terapéutico del sonido y sus frecuencias. Ideal para estudio, relajación, alivio del tinnitus y más.

## 📸 1. Introducción

![ImagenesApp](https://github.com/user-attachments/assets/01c3f6f4-31d4-408a-aef6-1846f02bf9de)


La **Sound Therapy App** permite a los usuarios explorar el poder de las frecuencias del sonido aplicadas a distintos contextos cotidianos y de salud. Desde mejorar la concentración hasta aliviar síntomas de tinnitus, esta herramienta busca ofrecer soluciones prácticas e innovadoras.

## 💡 2. Sobre el Proyecto

Este proyecto consiste en una aplicación que genera sonidos a frecuencias específicas con fines terapéuticos y funcionales. Está dividida en secciones como: sonidos para estudiar, sonidos para desestresarse, sonidos relajantes, sonidos para dormir, e incluso sonidos diseñados para personas que padecen tinnitus crónico.

Se incluyen sonidos conocidos como **colores del sonido** (blanco, rosa, marrón), los cuales han demostrado ser útiles en distintos contextos, incluyendo el alivio del tinnitus.

## 📋 3. Tabla de Contenidos de la App

- **Inicio**
  - Bienvenida
  - Breve explicación del uso de sonidos en la salud
  - Sonidos Recomendados según la Hora del Día
    - Mañana (energía, enfoque)
    - Tarde (productividad ligera, transición)
    - Noche (relajación, descanso, pre-sueño)
  
- **Frecuencias Manuales**
  - Selector de frecuencia personalizada (Hz)
  - Control de duración y volumen
  - Modo prueba de frecuencias

- **Sonidos por Actividad**
  - Para estudiar
  - Para meditar
  - Para relajarse
  - Para dormir
  - Para desestresarse

- **Terapia para Tinnitus**
  - Qué es el tinnitus
  - Sonidos para alivio: blanco, rosa, marrón
  - Frecuencias calibradas
  - Consejos de uso

- **Colores del Sonido**
  - Explicación y diferencias (blanco, rosa, marrón)
  - Aplicaciones terapéuticas
  - Comparativa visual o auditiva

- **Favoritos y Recientes**
  - Guardar combinaciones favoritas
  - Acceso rápido a sonidos recientes

- **Acerca de / Información**
  - Objetivo del proyecto
  - Fuentes científicas y referencias
  - Créditos y contacto

## 🎯 4. Propósito del Proyecto

La aplicación busca brindar una herramienta accesible e innovadora para ayudar a las personas a comprender y aprovechar los beneficios de las frecuencias del sonido. Esto incluye desde mejorar hábitos como el estudio, hasta proporcionar alivio para condiciones poco tratadas como el tinnitus crónico. Muchas personas desconocen el potencial terapéutico de los sonidos, y esta app busca llenar ese vacío.

## 🧰 5. Tecnologías

- **Figma**: Para diseñar el wireframe, mockup y la guía de colores.
- **Ionic Framework**: Framework principal para el desarrollo multiplataforma.
- **Capacitor**: Para integración con funcionalidades nativas de Android.
- **Android Studio**: Para pruebas, emulación y empaquetado en Android.
- **TypeScript**: Lenguaje principal para la lógica de la app.
- **SCSS**: Para estilos y diseño responsive.

## 💻 6. Entorno de Desarrollo

El desarrollo se realiza en **Visual Studio Code** utilizando **Ionic** como base para la creación de la app. La aplicación se compila y prueba en **Android Studio** para asegurar compatibilidad con dispositivos móviles Android.

## 🗂️ 7. Estructura de Archivos

```bash
sound-therapy-app/
│
├── android/                   # Proyecto Android generado por Capacitor
│
├── capacitor.config.ts        # Configuración de Capacitor
├── ionic.config.json          # Configuración del proyecto Ionic
├── package.json               # Dependencias y scripts del proyecto
├── tsconfig.json              # Configuración de TypeScript
│
├── resources/                 # Iconos y splash screens
│
├── src/                       # Código fuente principal
│   ├── app/
│   ├── assets/
│   │   ├── audio/             # Sonidos organizados por tipo
│   │   ├── icons/
│   │   └── img/
│   ├── pages/
│   ├── services/
│   └── theme/
│
├── www/                       # Archivos generados tras la build
│
├── figma-design/              # Diseños UX/UI en Figma
│
└── README.md

