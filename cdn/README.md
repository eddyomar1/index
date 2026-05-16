# EO Mascot Widget

Widget reutilizable para agregar las mascotas robot, arana o stickman a cualquier pagina.

## Uso desde GitHub Pages

Cuando este repositorio este publicado en GitHub Pages, incluye estos archivos:

```html
<link rel="stylesheet" href="https://eddyomar1.github.io/index/cdn/mascot-widget.css">
<script src="https://eddyomar1.github.io/index/cdn/mascot-widget.js"></script>
```

Inicializa el widget:

```html
<script>
  PortfolioMascot.init({
    variant: "random"
  });
</script>
```

## Con selector de mascota

Coloca un contenedor donde quieras mostrar los botones:

```html
<div id="mascot-picker"></div>

<script>
  PortfolioMascot.init({
    variant: "spider",
    pickerTarget: document.querySelector("#mascot-picker")
  });
</script>
```

## Opciones

- `variant`: `"robot"`, `"spider"`, `"stickman"` o `"random"`. Por defecto elige una mascota al azar.
- `pickerTarget`: elemento donde se insertan los botones de seleccion.
- `phrases`: arreglo de frases para el robot.
- `spiderPhrases`: arreglo de frases para la arana.
- `stickmanPhrases`: arreglo de frases para el stickman.
- `minMoveMs`: espera minima entre movimientos. Por defecto: `60000`.
- `maxMoveMs`: espera maxima entre movimientos. Por defecto: `300000`.
- `robotReturnMs`: tiempo que espera el robot fuera de pantalla antes de volver. Por defecto: `60000`.
- `headerSpace`: espacio superior reservado para evitar headers fijos.
- `stickmanStrideDistance`: pixeles aproximados que avanza por ciclo de paso.
- `stickmanStepMs`: duracion de cada ciclo de paso en milisegundos.

## Ejemplo con frases personalizadas

```html
<script>
  PortfolioMascot.init({
    variant: "robot",
    phrases: [
      "Bienvenido a mi pagina.",
      "Mira este proyecto primero.",
      "Puedes escribirme si tienes preguntas."
    ]
  });
</script>
```
