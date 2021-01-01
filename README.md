# @devserver/cli

Minimalist development server, focused on providing support for JS modules, HTML, CSS and assets, with module resolution based on NPM and CDN.

Example:

<table width="100%">
<tr>
<td>

**src/custom-element.js**

</td>

<td>

**src/index.html**

</td>

</tr>
<tr>
<td>

```js
import { c } from "atomico";
import html from "atomico/html";

function component() {
    return html`<host>web app</host>`;
}

customElements.define("custom-element", c(component));
```

</td>
<td>

```html
<script src="./custom-element.js" type="module"></script>
<custom-element></custom-element>
```

</td>

</tr>
</table>

**The files are manipulated on demand of the HTML, the transformations are limited to only solve the imports.**

## Dev mode

Development mode launches a server whose file context is associated with a specific folder.

```bash
npx devserver dev <src>
## example 1
npm devserver dev src
## example 2
npm devserver dev site
```

### Options

| flag    | descripcion                              |
| ------- | ---------------------------------------- |
| `--cdn` | NPM dependencies are resolved from a CDN |
| `--ssl` | enable the use of http2 + ssl            |

## Build mode

```bash
# step 1
npm install @devserver/build
# step 2
npx devserver build src/*.html public
```

The export is selective based on expressions, always keep in the expression an origin since this allows to generate resolutions from the origin, example `/utils.js`.

### Options

| flag       | descripcion                                  |
| ---------- | -------------------------------------------- |
| `--href`   | Add a path prefix for assets in an HTML file |
| `--minify` | minify the js code                           |

## Module import rule.

Local imports must associate with the extension as [Deno](https://github.com/denoland/deno).
