# Paginis
A PDF flipbook website designed to make your life easier. It can take a PDF as input and generate a flipbook, whether it's a URL, local file, or a featured YouTube playlist to play while reading.


## Tech Stack
[![Tech Stack](https://skillicons.dev/icons?i=threejs,js,jquery,css,html,tailwindcss,svg)](https://skillicons.dev)


## Issues

### Flipbook pages are not visible/defective in PDF
Check the pdf if using the link Make sure that cross-origin resource sharing is enabled 

## File Structure
<details>
<summary>Click to expand!</summary>
This flipbook plugin is jQuery-based. Basically, you can copy the files in folder to your working directory. You don't need to include the lib folder..

```sh
└── 📁pdf-flipbook
    └── 📁lib
        └── 📁css
            └── min.css
            └── style.css
            └── themify-icons.min.css
        └── 📁fonts
            └── themify.eot
            └── themify.svg
            └── themify.ttf
            └── themify.woff
        └── 📁images
            └── 📁pdfjs
            └── 📁textures
                └── white.jpg
            └── loading.gif
            └── viewer.svg
        └── 📁js
            └── 📁libs
                └── 📁cmaps
                └── compatibility.js
                └── jquery.min.js
                └── mockup.min.js
                └── pdf.min.js
                └── pdf.worker.min.js
                └── three.min.js
            └── dflip.min.js
            └── load.js
            └── quotes.js
        └── 📁sound
            └── turn.mp3
            └── turn2.mp3
            └── turn2a.mp3
            └── turn3.mp3
    └── .gitignore
    └── index.html
    └── README.md

```

## File Template
And ensure the following files are included in the html.

CSS:
```css
<!-- Flipbook StyleSheet -->
<link href="http://www.yoursite.com/dflip/css/dflip.css" rel="stylesheet" type="text/css">

<!-- Icons Stylesheet -->
<link href="http://www.yoursite.com/dflip/css/themify-icons.css" rel="stylesheet" type="text/css">     
```
JavaScript:

Note: Include them just before </body> tag. Don't use them in head.

```javascript
<!-- jQuery 1.9.1 or above -->
<script src="http://www.yoursite.com/dflip/js/libs/jquery.min.js" type="text/javascript"></script>

<!-- Flipbook main Js file -->
<script src="http://www.yoursite.com/dflip/js/dflip.min.js" type="text/javascript"></script>     
```
Basic HTML Template
```html
    <html>
    <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Basic HTML Template</title>

    <!-- Flipbook StyleSheet -->
    <link href="http://www.yoursite.com/dflip/css/dflip.css" rel="stylesheet" type="text/css">

    <!-- Icons Stylesheet -->
    <link href="http://www.yoursite.com/dflip/css/themify-icons.css" rel="stylesheet" type="text/css">

    </head>
    <body>
    <div class="_df_thumb" id="df_manual_thumb" source="location of pdf.pdf" thumb="location of thumbnail.jpg"> PDF Example</div >
    <!-- Refer to other examples on how to create different types of flipbook -->

    <!-- jQuery 1.9.1 or above -->
    <script src="http://www.yoursite.com/dflip/js/libs/jquery.min.js" type="text/javascript"></script>

    <!-- Flipbook main Js file -->
    <script src="http://www.yoursite.com/dflip/js/dflip.min.js" type="text/javascript"></script>

    </body>
    </html>
```
Create Flipbook through Button lightbox.
```html
<div class="_df_button"
    source="http://www.yoursite.com/books/dflip manual.pdf"
    id="df_manual_button">
    Button
</div>
```
</details>
