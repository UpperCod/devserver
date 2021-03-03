import { c, useProp } from "atomico";
import { useReflectInputState } from "../../hooks/use-reflect-input-state.js";

const style = /*css */ `
    :host{
      display: inline-block;
      margin: .5rem 0px;
    }
    .checkbox{
        width: 1.75rem;
        height: 1.75rem;
        padding: .25rem;
        cursor: pointer;
        border: .1rem solid var(--input-checkbox_border);
        border-radius: 100%;
        background: var(--input_background);
        box-shadow: var(--input_shadow);
        box-sizing: border-box;
        position: relative;
    }
    .fill{
        width: 100%;
        height: 100%;
        background: var(--input-checkbox_fill);
        border-radius: 100%;
        transform: scale(.75);
        transition: .25s ease all;
        
    }
    slot[name="icon"]{
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg{
      display: block;
      opacity: 0;
    }
    :host([checked]) .fill{
      background: var(--input-checkbox_fill-active);
      transform: scale(1);
    }
    :host([checked]) .fill svg{
      opacity: 1;
    }
`;

function radio({ name, value }) {
  const [checked, setChecked] = useProp("checked");
  const [, refContainer] = useReflectInputState({
    type: "radio",
    name,
    value,
    checked,
    setChecked,
  });
  return (
    <host shadowDom>
      <style>{style}</style>
      <button ref={refContainer} class="checkbox">
        <div class="fill"></div>
      </button>
    </host>
  );
}

radio.props = {
  checked: { type: Boolean, reflect: true },
  name: String,
  value: null,
};

export const InputRadio = c(radio);
