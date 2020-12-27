# @devserver/assets

capture assets using regular expressions

## mapHtml

replace assets of html tags that declare attributes as relative or absolute paths

```js
import { mapHtml } from "@devserver/assets";

const code = `<img src="./my-image.jpg"/>`;

const html = mapHtml(code, () => "image.png"); // <img src="image.png"/>
```

## Todo

-   [ ] capture assets from CSS files
