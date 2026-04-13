# 2.5 Examen Tema 1: Graficación 2D 🚀
### Proyecto: DC Orbital Defense System

Este proyecto es una aplicación web interactiva que utiliza **Canvas API** y **Programación Orientada a Objetos en JavaScript** para crear un videojuego de defensa orbital basado en los héroes de la Liga de la Justicia.

---

## 👤 Datos del Alumno
* **Nombre:** [Antonio Duran Islas]
* **Número de Control:** `23200830`
* **Materia:** Graficación 2D
* **Fecha:** Abril 2026

---

## 🎮 Descripción del Juego
El sistema permite al usuario seleccionar entre dos héroes icónicos (**Superman** y **Batman**) para defender la órbita terrestre de amenazas espaciales. 

### Características principales:
* **Motor de Dificultad Dinámica:** La velocidad y frecuencia de los enemigos aumentan progresivamente con cada nivel alcanzado.
* **Interfaz HUD Moderna:** Barra de salud reactiva, contador de puntuación y visualización de récord máximo (High Score) almacenado en `localStorage`.
* **Identidad Visual:** El sistema adapta sus colores (Cian para Superman, Amarillo para Batman) y banda sonora según el personaje elegido.
* **Efectos Visuales:** Sistema de partículas para explosiones, vibración de pantalla (*screen shake*) al recibir daño y animaciones de brillo neón.

---

## 🛠️ Tecnologías Utilizadas
* **HTML5 & CSS3:** Estructura y diseño basado en *Glassmorphism*.
* **Bootstrap 5.3:** Framework para el layout responsivo y componentes de la UI (Navbars, Progress Bars).
* **JavaScript (Vanilla):** Lógica del juego, renderizado en Canvas, gestión de colisiones y persistencia de datos.
* **Canvas API:** Dibujo de sprites, láseres y fondos espaciales.

---

## 📂 Estructura del Proyecto
```text
/
├── index.html          # Estructura principal y HUD
├── assets/
│   ├── css/
│   │   └── style.css   # Estilos, efectos neón y animaciones
│   ├── js/
│   │   └── main.js    # Motor del juego y lógica de colisiones
│   ├── img/            # Sprites, fondos y favicon
│   └── audio/          # Temas musicales y efectos
└── README.md           # Documentación del proyecto