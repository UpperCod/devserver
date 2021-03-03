import { Card } from "./card/card.jsx";
import { Input } from "./input/input.jsx";
import { InputToggle } from "./input-toggle/input-toggle.jsx";
import { InputCheckbox } from "./input-checkbox/input-checkbox.jsx";
import { InputRadio } from "./input-radio/input-radio.jsx";
import { Button } from "./button/button.jsx";
import { Label } from "./label/label.jsx";
import { Icon } from "./icon/icon.jsx";

customElements.define("formilk-card", Card);
customElements.define("formilk-input", Input);
customElements.define("formilk-input-toggle", InputToggle);
customElements.define("formilk-input-checkbox", InputCheckbox);
customElements.define("formilk-input-radio", InputRadio);
customElements.define("formilk-button", Button);
customElements.define("formilk-label", Label);
customElements.define("formilk-icon", Icon);