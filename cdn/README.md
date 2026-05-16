# EO Mascot Widget

Widget reutilizable para agregar la mascota robot o arana a cualquier pagina.

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
    variant: "robot"
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

- `variant`: `"robot"`, `"spider"` o `"stickman"`.
- `pickerTarget`: elemento donde se insertan los botones de seleccion.
- `phrases`: arreglo de frases para el robot.
- `spiderPhrases`: arreglo de frases para la arana.
- `stickmanPhrases`: arreglo de frases para el stickman.
- `moveMs`: frecuencia de movimiento en milisegundos.
- `speakMs`: frecuencia de frases en milisegundos.
- `headerSpace`: espacio superior reservado para evitar headers fijos.

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
