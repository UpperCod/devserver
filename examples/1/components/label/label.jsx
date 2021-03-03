import { useSlot } from "@atomico/kit/use-slot";
import { c, useRef } from "atomico";

const style = /*css*/ `
  button{
    background: none;
    padding: 0;
    border: 0;
    text-align: left;
    max-width: 100%;
  }
  slot{
    display: grid;
    grid-gap: var(--label_gap, 1rem);
    grid-template-columns: repeat(var(--c), auto);
    align-items: flex-start;
  }
`;

function label() {
  const refSlot = useRef();
  const refInput = useRef();
  const slot = useSlot(refSlot);

  return (
    <host
      shadowDom
      onConnectedLabel={(ev) => {
        ev.stopPropagation();
        refInput.current = ev.detail;
        ev.preventDefault();
      }}
    >
      <style>{style}</style>
      <button
        onclick={(ev) => {
          ev.stopPropagation();
          refInput.current();
        }}
      >
        <slot ref={refSlot} style={`--c:${slot.length}`}></slot>
      </button>
    </host>
  );
}

export const Label = c(label);
