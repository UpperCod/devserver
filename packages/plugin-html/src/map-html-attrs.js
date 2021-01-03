const TAG = /<\w+(-\w+){0,}\s+([^>]+)>/g;
const ATTR = /([\w-]+)=(?:\"((\.){0,2}\/[^\"]+)\"|\'((\.){0,2}\/[^\']+)\')/g;
/**
 *
 * @param {string} code
 * @param {(value:string,attribute:string)=>string} map
 */
export const mapHtmlAttrs = (code, map) =>
    code.replace(TAG, (all) =>
        all.replace(ATTR, (all, attr, value) => `${attr}="${map(value, attr)}"`)
    );
