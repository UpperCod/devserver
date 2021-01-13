import path from "path";
import { watch } from "fs";

const hidden = /^([^\.]*(\/|\\)){0,1}\.([^w+])/;

export const createWatch = ({
    base,
    exclude = /node_modules/,
    listener,
    delay = 200,
}) => {
    let prevent;
    const debounce = (eventType, filename) => {
        if (!prevent) {
            prevent = {};
            setTimeout(() => {
                listener(prevent);
                prevent = false;
            }, delay);
        }
        prevent[path.join(base, filename)] = eventType;
    };
    watch(base, { recursive: true }, (eventType, filename) => {
        if (exclude.test(filename) || hidden.test(filename)) return;
        debounce(eventType, filename);
    });
};
