import { c } from "atomico";
import { html } from "atomico/html";

function component() {
  return html`<host>component-2</host>`;
}

customElements.define("component-2", c(component));
