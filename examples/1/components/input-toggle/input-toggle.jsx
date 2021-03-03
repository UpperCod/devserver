import { c, useProp } from "atomico";
import { useReflectInputState } from "../../hooks/use-reflect-input-state.js";

const style = /*css */ `
    :host{
      display: inline-block;
      margin: .5rem 0px;
    }
    .toggle{
        width: 2rem;
        padding: .25rem;
        border-radius: 5rem;
        cursor: pointer;
        border: .1rem solid var(--input-toggle_border);
        background: var(--input_background);
        box-shadow: var(--input_shadow);
        margin: auto 0px;
        position: relative;
        box-sizing: content-box;
    }
    .fill{
        width: 1rem;
        height: 1rem;
        background: var(--input-toggle_fill);
        border-radius: 100%;
        transition: .2s ease all;
        transform: scale(.75);
    }
    :host([checked]) .fill{
        transform: translateX(100%);
        background: var(--input-toggle_fill-active);
    }
`;

function inputToggle({ name, value }) {
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
      <button class="toggle" ref={refContainer}>
        <div class="fill">
          <slot></slot>
        </div>
      </button>
    </host>
  );
}

inputToggle.props = {
  checked: { type: Boolean, reflect: true },
  name: String,
  value: null,
};

export const InputToggle = c(inputToggle);
