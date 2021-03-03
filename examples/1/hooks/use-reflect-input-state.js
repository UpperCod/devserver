import { h, useEffect, useRef, useEvent } from "atomico";
import { useRender } from "@atomico/kit/use-render";
import { useParent } from "./use-parent.js";

/**
 * Create a visible input to reflect the state of the webcomponent in the form
 * @param {Props} props
 * @returns {[
 *  import("atomico").Ref<HTMLInputElement>,
 *  import("atomico").Ref,
 *  ()=>void
 * ]}
 */
export function useReflectInputState({ type, name, ...props }) {
  const refInput = useRef();
  const refContainer = useRef();

  const dispatchConnectedLabel = useEvent("ConnectedLabel", {
    bubbles: true,
    composed: true,
    cancelable: true,
  });

  useRender(
    () =>
      h("input", {
        type,
        name,
        ...props,
        ref: refInput,
        "data-reflect": name,
        slot: "input",
        tabindex: -1,
      }),
    [props]
  );

  const form = useParent("form");
  /**
   * This effect tries to establish connection with a label to cancel
   * the default event association and giving control of focus and click to the label.
   */
  useEffect(() => {
    // The label to avoid the connection must make use of event.preventDefault()
    if (
      dispatchConnectedLabel(() => {
        props.setChecked((value) => !value);
      }) &&
      refContainer.current
    ) {
      refContainer.current.addEventListener("click", toggle);
      return () => refContainer.current.removeEventListener("click", toggle);
    }
  }, []);
  /**
   * This effect allows an effort from the form to
   * synchronize the radio inputs with the scope of the form
   */
  useEffect(() => {
    if (type != "radio" || !props.setChecked) return;
    const handler = (ev) => {
      if (ev.target.name == name && form.current[name].length) {
        [...form.current[name]]
          .filter((target) => target.dataset.reflect == name)
          .forEach((target) => (target.checked = target == ev.target));

        props.setChecked(refInput.current.checked);
      }
    };
    form.current.addEventListener("change", handler);
    return () => form.current.removeEventListener("change", handler);
  }, [name, type]);

  const toggle = () => {
    refInput.current.click();
    props.setChecked && props.setChecked(refInput.current.checked);
  };

  return [refInput, refContainer, toggle];
}

/**
 * @typedef { Object } Props
 * @property {string} type
 * @property {string} name
 * @property {any} value
 * @property {boolean} [required]
 * @property {boolean} [checked]
 * @property {(checked:boolean)=>void} [setChecked]
 */
