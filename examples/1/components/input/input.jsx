import { c, useProp, useRef } from "atomico";
import { useSlot } from "@atomico/kit/use-slot";
import { useReflectInputState } from "../../hooks/use-reflect-input-state.js";

export const inputStyle = /*css*/ `
    :host{
        display: block;
        background: var(--input_background);
        box-shadow: var(--input_shadow);
        border-radius: var(--input_radius);   
    }
    .label,
    .icon{
        box-sizing: border-box;
        display: flex;
        align-items: center;
    }
    .label{
      padding: 0px .5rem 0px 1.25rem ;
    }
    .icon{
      padding: 0px .25rem 0px 1.25rem ;
    }
    .icon:not(.hidden) + .label:not(.hidden){
      padding-left: .75rem;
    }
    .hidden{
      display: none;
    }
    .row{
        width: 100%;
        min-height: 3.125rem;
        display: flex;
        position: relative;
    }
    .input {
      flex: 0%;
      min-height: 100%;
      position: relative;
    }
    .input input{
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        font-family: unset;
        font-size: 1rem;
        padding: 0px 1rem;
        box-sizing: border-box;
        position: relative;
        z-index: 2;
    }
    .input input::placeholder{
      color: var(--input_placeholder);
    }
    .line{
        width: calc(100% - 2rem);
        height: .1rem;
        position: absolute;
        background: var(--input_line);
        left: 50%;
        bottom: 0px;
        transform: translateX(-50%);
    }
    ::slotted(input[slot="input"]){
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0px;
      left: 0px;
      opacity: 0;
      border: none;
      padding: 0;
    }
`;

export const inputProps = {
  name: String,
  type: String,
  value: null,
  pattern: String,
  min: Number,
  max: Number,
  minLength: Number,
  maxLength: Number,
  placeholder: String,
  required: Boolean,
  checked: Boolean,
};

function input({ type, name, required, ...props }) {
  const [value, setValue] = useProp("value");
  const refLabel = useRef();
  const refIcon = useRef();
  const slotLabel = useSlot(refLabel);
  const slotIcon = useSlot(refIcon);
  const [refInput] = useReflectInputState({
    type,
    name,
    required,
    value,
    ...props,
  });

  return (
    <host shadowDom checkValidity={() => refInput.current.checkValidity()}>
      <style>{inputStyle}</style>
      <label class="row">
        <div class={`icon ${slotIcon.length ? "" : "hidden"}`}>
          <slot ref={refIcon} name="icon"></slot>
        </div>
        <div class={`label ${slotLabel.length ? "" : "hidden"}`}>
          <slot ref={refLabel}></slot>
        </div>
        <div class="input">
          <slot name="input"></slot>
          <input
            {...props}
            type={type}
            value={value}
            ref={refInput}
            oninput={({ target }) => setValue(target.value)}
          />
          <div class="line"></div>
        </div>
      </label>
    </host>
  );
}

input.props = inputProps;

export const Input = c(input);
