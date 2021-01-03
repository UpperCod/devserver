import test from "ava";
import { mapHtmlAttrs } from "../src/map-html-attrs.js";

test("replace", (t) => {
    const code = `<img src="./my-image.jpg"/>`;

    t.is(
        mapHtmlAttrs(code, () => "image.png"),
        code.replace("./my-image.jpg", "image.png")
    );
});
