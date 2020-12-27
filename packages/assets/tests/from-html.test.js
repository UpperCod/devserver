import test from "ava";
import { mapHtml } from "../src/assets.js";

test("replace", (t) => {
    const code = `<img src="./my-image.jpg"/>`;

    t.is(
        mapHtml(code, () => "image.png"),
        code.replace("./my-image.jpg", "image.png")
    );
});
