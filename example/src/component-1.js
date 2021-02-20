import { c } from "atomico";
import { html } from "atomico/html";
import { href } from "../assets/vars.css?text";
import "./demo.js";

function component() {
    console.log(import("./sub/dinamic-import.js"));
    return html`<host shadowDom>
        <link rel="stylesheet" href=${href} />
    </host>`;
}

customElements.define("component-1", c(component));
