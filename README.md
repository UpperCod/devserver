# webox

dev-server to create applications, sites or prototypes using only JS, HTML and CSS, **No transpilation**.

Example:

```html
<script src="./my-app.js"></script>
```

**The files to export are associated using the relative path wildcard whether it is `./`, `../` or `/`, the use of extensions is mandatory for the build**

```js
import { c } from "atomico";
import html from "atomico/html";

function component() {
  return html`<host>web app</host>`;
}
```

**The files are manipulated on demand of the HTML, the transformations are limited to only solve the imports.**

## Dev mode

```bash
npx webox dev src
```

## Build mode

```bash
# step 1
npm install @estack/build
# step 2
npx webox build src/*.html public
```

The export is selective using expressions or the file directly.
