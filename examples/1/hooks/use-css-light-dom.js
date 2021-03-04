// import { useHost, useLayoutEffect, useState } from "atomico";
import { cssToObject } from "@uppercod/css-to-object";

let count = 0;
/**
 *
 * @param {string} id
 * @param {any} json
 */
const serialize = (id, json, parent = "") => {
    const rules = [];
    const host = [];
    for (const prop in json) {
        if (typeof json[prop] == "object") {
            rules.push(...serialize(id, json[prop], prop));
        } else {
            host.push(prop + ":" + json[prop]);
        }
    }

    return /@/.test(parent)
        ? [`${parent}{${rule(id, host)}${rules.join("")}}`]
        : [rule(id + parent, host), ...rules];
};

/**
 * @returns {(template:TemplateStringsArray,...args:string[])=>string}
 */
export function useCssLightDom() {
    const host = useHost();
    const [styles] = useState(() => {
        host.style = host.current.appendChild(document.createElement("style"));
        host.id = `S` + count++;
        return [];
    });

    useLayoutEffect(() => {
        const { current } = host;
        styles.forEach((style, index) =>
            serialize(
                current.localName + " ." + host.id + index,
                cssToObject(style)
            ).forEach((rule, subIndex) => {
                console.log(rule);
                host.style.sheet.insertRule(rule, subIndex);
            })
        );
    });

    return (template, ...args) => {
        const content = template.reduce(
            (part, index) => part + (args[index] || "")
        );
        const iid = styles.indexOf(content);
        return host.id + (~iid ? iid : styles.push(content) - 1);
    };
}
