/**
 * compare 2 array
 * ```js
 * isEqualArray([1,2,3,4],[1,2,3,4]) // true
 * isEqualArray([1,2,3,4],[1,2,3])   // false
 * isEqualArray([5,1,2,3],[1,2,3,5]) // false
 * isEqualArray([],[]) // true
 * ```
 * @param {any[]} before
 * @param {any[]} after
 * @returns {boolean}
 */
/**
 * Determine if the value is considered a function
 * @param {any} value
 */
const isFunction = (value) => typeof value == "function";

/**
 * Determines if the value is considered an object
 * @param {any} value
 */
const isObject = (value) => typeof value == "object";

/**
 * The Any type avoids the validation of prop types
 * @type {null}
 **/
const Any = null;

/**
 * Attributes considered as valid boleanos
 * @type {Array<true|1|""|"1"|"true">}
 **/
const TRUE_VALUES = [true, 1, "", "1", "true"];

/**
 * Constructs the setter and getter of the associated property
 * only if it is not defined in the prototype
 * @param {Object} proto
 * @param {string} prop
 * @param {any} schema
 * @param {Object<string,string>} attrs
 * @param {Object<string,any>} values
 */
function setPrototype(proto, prop, schema, attrs, values) {
    /**@type {Schema} */
    let { type, reflect, event, value, attr = getAttr(prop) } =
        isObject(schema) && schema != Any ? schema : { type: schema };

    let isCallable = !(type == Function || type == Any);

    Object.defineProperty(proto, prop, {
        /**
         * @this {import("./custom-element").BaseContext}
         * @param {any} newValue
         */
        set(newValue) {
            let oldValue = this[prop];

            let { error, value } = filterValue(
                type,
                isCallable && isFunction(newValue)
                    ? newValue(oldValue)
                    : newValue
            );

            if (error && value != null) {
                throw {
                    message: `The value defined for prop '${prop}' must be of type '${type.name}'`,
                    value,
                    target: this,
                };
            }

            if (oldValue == value) return;

            this._props[prop] = value;

            this.update();
            /**
             * 1.7.0 >, this position reduces the amount of updates to the DOM and render
             */
            if (event) dispatchEvent(this, event);
            /**
             * attribute mirroring must occur if component is mounted
             */
            this.updated.then(() => {
                if (reflect) {
                    this._ignoreAttr = attr;
                    reflectValue(this, type, attr, this[prop]);
                    this._ignoreAttr = null;
                }
            });
        },
        /**
         * @this {import("./custom-element").BaseContext}
         */
        get() {
            return this._props[prop];
        },
    });

    if (value != null) {
        values[prop] = value;
    }

    attrs[attr] = prop;
}

/**
 * Dispatch an event
 * @param {Element} node - DOM node to dispatch the event
 * @param {InternalEvent & InternalEventInit} event - Event to dispatch on node
 */
const dispatchEvent = (
    node,
    { type, base = CustomEvent, ...eventInit }
) => node.dispatchEvent(new base(type, eventInit));

/**
 * Transform a Camel Case string to a Kebab case
 * @param {string} prop - string to apply the format
 * @returns {string}
 */
const getAttr = (prop) => prop.replace(/([A-Z])/g, "-$1").toLowerCase();

/**
 * reflects an attribute value of the given element as context
 * @param {Element} context
 * @param {any} type
 * @param {string} attr
 * @param {any} value
 */
const reflectValue = (context, type, attr, value) =>
    value == null || (type == Boolean && !value)
        ? context.removeAttribute(attr)
        : context.setAttribute(
              attr,
              isObject(value)
                  ? JSON.stringify(value)
                  : type == Boolean
                  ? ""
                  : value
          );

/**
 * Filter the values based on their type
 * @param {any} type
 * @param {any} value
 * @returns {{error?:boolean,value:any}}
 */
function filterValue(type, value) {
    if (type == Any) return { value };

    try {
        if (type == Boolean) {
            value = TRUE_VALUES.includes(value);
        } else if (typeof value == "string") {
            value =
                type == Number
                    ? Number(value)
                    : type == Object || type == Array
                    ? JSON.parse(value)
                    : value;
        }
        if ({}.toString.call(value) == `[object ${type.name}]`) {
            return { value, error: type == Number && Number.isNaN(value) };
        }
    } catch (e) {}

    return { value, error: true };
}

/**
 * Type any, used to avoid type validation.
 * @typedef {null} Any
 */

/**
 * @typedef {Object} InternalEventInit
 * @property {typeof CustomEvent|typeof Event} [base] -
 * @property {boolean} [bubbles] - indicating whether the event bubbles. The default is false.
 * @property {boolean} [cancelable] - indicating whether the event will trigger listeners outside of a shadow root.
 * @property {boolean} [composed] - indicating whether the event will trigger listeners outside of a shadow root.
 * @property {any} [detail] - indicating whether the event will trigger listeners outside of a shadow root.
 */

/**
 * Interface used by dispatchEvent to automate event firing
 * @typedef {Object} InternalEvent
 * @property {string} type - type of event to dispatch.
 */

/**
 * @typedef {Object} Schema
 * @property {any} [type] - data type to be worked as property and attribute
 * @property {string} [attr] - allows customizing the name as an attribute by skipping the camelCase format
 * @property {boolean} [reflect] - reflects property as attribute of node
 * @property {InternalEvent} [event] - Allows to emit an event every time the property changes
 * @property {any} [value] - defines a default value when instantiating the component
 */

/**
 * @type {Ref}
 * HOOK_CURRENT_REF is defined in synchronous execution time at the moment
 * of rendering a hook, this variable allows sharing
 * its context only when executed by load.
 */
/**
 *
 * @param {()=>void} render
 * @param {any} host
 */
function createHooks(render, host) {
    /**
     * @type {Object<string,Hook>}
     * map of states associated with an increasing position
     **/
    let hooks = {};
    /**
     * @template T,R
     * @param {(param:T)=>R} callback
     * @param {T} param
     * @returns {R}
     */
    function load(callback, param) {
        let resolve = callback(param);
        return resolve;
    }

    /**
     * announces that the updates have finished allowing the
     * execution of the collectors
     * @param {boolean} [unmounted]
     */
    function updated(unmounted) {
        for (let index in hooks) {
            let hook = hooks[index];
            if (hook[1]) hook[0] = hook[1](hook[0], unmounted);
        }
        // if unmounted is defined, the stored states will be destroyed
        if (unmounted) hooks = {};
    }

    return {
        load,
        updated,
    };
}

/**
 * @typedef {[any,CollectorHook]} Hook
 */

/**
 * @callback RenderHook
 * @param {any} state
 * @returns {any}
 */

/**
 * @callback CollectorHook
 * @param {any} state
 * @param {boolean} [unmounted]
 * @returns {any}
 */

/**
 * @typedef {Object} Ref
 * @property {()=>void} render
 * @property {any} host
 * @property {(hook:RenderHook,collector:CollectorHook)=>any} use
 */

// Object used to know which properties are extracted directly
// from the node to verify 2 if they have changed
const FROM_PROP = {
    id: 1,
    className: 1,
    checked: 1,
    value: 1,
    selected: 1,
};
// Map of attributes that escape the property analysis
const WITH_ATTR = {
    list: 1,
    type: 1,
    size: 1,
    form: 1,
    width: 1,
    height: 1,
    src: 1,
};
// Immutable for comparison of empty properties
const EMPTY_PROPS = {};
// Immutable for empty children comparison
const EMPTY_CHILDREN = [];
// Used to identify text type nodes when using Node.nodeType
const TYPE_TEXT = 3;
// Alias for document
const $ = document;
// Internal marker to know if the vdom comes from Atomico
const vdom = Symbol();
// Symbol used to retrieve the key that associates the node to the keyes
const KEY = Symbol();
// Default ID used to store the VDom state
const ID = Symbol();
/**
 * @param {string|null|RawNode} type
 * @param {object} [p]
 * @param  {...any} children
 * @returns {Vdom}
 */
function h(type, p, ...children) {
    let props = p || EMPTY_PROPS;

    children = flat(props.children || children, type == "style");

    if (!children.length) {
        children = EMPTY_CHILDREN;
    }

    return {
        vdom,
        type,
        props,
        children,
        key: props.key,
        shadow: props.shadowDom,
        //@ts-ignore
        raw: type instanceof Node,
    };
}

/**
 * Create or update a node
 * Node: The declaration of types through JSDOC does not allow to compress
 * the exploration of the parameters
 * @param {any} vnode
 * @param {RawNode} node
 * @param {ID} [id]
 * @param {boolean} [isSvg]
 */

function render(vnode, node, id = ID, isSvg) {
    let isNewNode;
    // If the node maintains the source vnode it escapes from the update tree
    if (node && node[id] && node[id].vnode == vnode) return node;
    // Injecting object out of Atomico context
    if (vnode && vnode.type && vnode.vdom != vdom) return node;

    // The process only continues when you may need to create a node
    if (vnode != null || !node) {
        isSvg = isSvg || vnode.type == "svg";
        isNewNode =
            vnode.type != "host" &&
            (vnode.raw
                ? node != vnode.type
                : node
                ? node.localName != vnode.type
                : !node);
        if (isNewNode) {
            let nextNode;
            if (vnode.type != null) {
                nextNode = vnode.raw
                    ? vnode.type
                    : isSvg
                    ? $.createElementNS(
                          "http://www.w3.org/2000/svg",
                          vnode.type
                      )
                    : $.createElement(
                          vnode.type,
                          vnode.is ? { is: vnode.is } : undefined
                      );
            } else {
                return $.createTextNode(vnode + "");
            }

            node = nextNode;
        }
    }
    if (node.nodeType == TYPE_TEXT) {
        if (!vnode.raw) {
            let text = vnode + "";
            if (node.data != text) {
                node.data = text || "";
            }
        }
        return node;
    }

    /**
     * @type {Vdom}
     */
    let oldVNode = node[id] ? node[id].vnode : EMPTY_PROPS;
    /**
     * @type {Vdom["props"]}
     */
    let oldVnodeProps = oldVNode.props || EMPTY_PROPS;
    /**
     * @type {Vdom["children"]}
     */
    let oldVnodeChildren = oldVNode.children || EMPTY_CHILDREN;
    /**
     * @type {Handlers}
     */
    let handlers = isNewNode || !node[id] ? {} : node[id].handlers;

    let childNodes = node[id] && node[id].childNodes;

    if (vnode.shadow) {
        if (!node.shadowRoot) {
            node.attachShadow({ mode: "open" });
        }
    }

    if (vnode.props != oldVnodeProps) {
        diffProps(node, oldVnodeProps, vnode.props, handlers, isSvg);
    }

    if (vnode.children != oldVnodeChildren) {
        let nextParent = vnode.shadow ? node.shadowRoot : node;
        childNodes = renderChildren(
            vnode.children,
            /**
             * @todo for hydration use attribute and send childNodes
             */
            childNodes || [],
            nextParent,
            id,
            // add support to foreignObject, children will escape from svg
            isSvg && vnode.type == "foreignObject" ? false : isSvg
        );
    }

    node[id] = { vnode, handlers, childNodes };

    return node;
}
/**
 * This method should only be executed from render,
 * it allows rendering the children of the virtual-dom
 * @param {FlatParamMap} children
 * @param {Nodes} childNodes
 * @param {RawNode|ShadowRoot} parent
 * @param {any} id
 * @param {boolean} isSvg
 */
function renderChildren(children, childNodes, parent, id, isSvg) {
    let keyes = children._;
    let childrenLenght = children.length;
    let childNodesLength = childNodes.length;
    let index = keyes
        ? 0
        : childNodesLength > childrenLenght
        ? childrenLenght
        : childNodesLength;
    let nextChildNodes = [];

    let fragmentMark = childNodes[id];
    if (!fragmentMark) {
        fragmentMark = parent.appendChild($.createTextNode(""));
    }

    nextChildNodes[id] = fragmentMark;

    for (; index < childNodesLength; index++) {
        let childNode = childNodes[index];
        if (keyes) {
            let key = childNode[KEY];
            if (keyes.has(key)) {
                keyes.set(key, childNode);
                continue;
            }
        }
        /**
         * @todo for hydration accept list and array management
         */
        // if (childNodes.splice) {
        childNodes.splice(index, 1);
        // }
        index--;
        childNodesLength--;
        childNode.remove();
    }

    for (let i = 0; i < childrenLenght; i++) {
        let child = children[i];
        let indexChildNode = childNodes[i];
        let key = keyes ? child.key : i;
        let childNode = keyes ? keyes.get(key) : indexChildNode;

        if (keyes && childNode) {
            if (childNode != indexChildNode) {
                parent.insertBefore(childNode, indexChildNode);
            }
        }

        if (keyes && child.key == null) continue;

        let nextChildNode = render(child, childNode, id, isSvg);

        if (!childNode) {
            parent.insertBefore(nextChildNode, childNodes[i] || fragmentMark);
        } else if (nextChildNode != childNode) {
            parent.replaceChild(nextChildNode, childNode);
        }
        nextChildNodes.push(nextChildNode);
    }
    return nextChildNodes;
}

/**
 *
 * @param {RawNode} node
 * @param {Object} props
 * @param {Object} nextProps
 * @param {boolean} isSvg
 * @param {Object} handlers
 **/
function diffProps(node, props, nextProps, handlers, isSvg) {
    for (let key in props) {
        if (!(key in nextProps)) {
            setProperty(node, key, props[key], null, isSvg, handlers);
        }
    }
    for (let key in nextProps) {
        setProperty(node, key, props[key], nextProps[key], isSvg, handlers);
    }
}

/**
 *
 * @param {RawNode} node
 * @param {string} key
 * @param {any} prevValue
 * @param {any} nextValue
 * @param {boolean} isSvg
 * @param {Handlers} handlers
 */
function setProperty(node, key, prevValue, nextValue, isSvg, handlers) {
    key = key == "class" && !isSvg ? "className" : key;
    // define empty value
    prevValue = prevValue == null ? null : prevValue;
    nextValue = nextValue == null ? null : nextValue;

    if (key in node && FROM_PROP[key]) {
        prevValue = node[key];
    }

    if (nextValue === prevValue || key == "shadowDom") return;

    if (
        key[0] == "o" &&
        key[1] == "n" &&
        (isFunction(nextValue) || isFunction(prevValue))
    ) {
        setEvent(node, key, nextValue, handlers);
    } else if (key == "key") {
        node[KEY] = nextValue;
    } else if (key == "ref") {
        if (nextValue) nextValue.current = node;
    } else if (key == "style") {
        let style = node.style;

        prevValue = prevValue || "";
        nextValue = nextValue || "";

        let prevIsObject = isObject(prevValue);
        let nextIsObject = isObject(nextValue);

        if (prevIsObject) {
            for (let key in prevValue) {
                if (nextIsObject) {
                    if (!(key in nextValue)) setPropertyStyle(style, key, null);
                } else {
                    break;
                }
            }
        }

        if (nextIsObject) {
            for (let key in nextValue) {
                let value = nextValue[key];
                if (prevIsObject && prevValue[key] === value) continue;
                setPropertyStyle(style, key, value);
            }
        } else {
            style.cssText = nextValue;
        }
    } else {
        if (
            (!isSvg && !WITH_ATTR[key] && key in node) ||
            isFunction(nextValue) ||
            isFunction(prevValue)
        ) {
            node[key] = nextValue == null ? "" : nextValue;
        } else if (nextValue == null) {
            node.removeAttribute(key);
        } else {
            node.setAttribute(
                key,
                isObject(nextValue) ? JSON.stringify(nextValue) : nextValue
            );
        }
    }
}

/**
 *
 * @param {RawNode} node
 * @param {string} type
 * @param {Listener} [nextHandler]
 * @param {Handlers} [handlers]
 */
function setEvent(node, type, nextHandler, handlers) {
    // get the name of the event to use
    type = type.slice(type[2] == "-" ? 3 : 2);
    // add handleEvent to handlers
    if (!handlers.handleEvent) {
        /**
         * {@link https://developer.mozilla.org/es/docs/Web/API/EventTarget/addEventListener#The_value_of_this_within_the_handler}
         **/
        handlers.handleEvent = (event) =>
            handlers[event.type].call(node, event);
    }
    if (nextHandler) {
        // create the subscriber if it does not exist
        if (!handlers[type]) {
            node.addEventListener(type, handlers);
        }
        // update the associated event
        handlers[type] = nextHandler;
    } else {
        // 	delete the associated event
        if (handlers[type]) {
            node.removeEventListener(type, handlers);
            delete handlers[type];
        }
    }
}
/**
 *
 * @param {*} style
 * @param {string} key
 * @param {string} value
 */
function setPropertyStyle(style, key, value) {
    let method = "setProperty";
    if (value == null) {
        method = "removeProperty";
        value = null;
    }
    if (~key.indexOf("-")) {
        style[method](key, value);
    } else {
        style[key] = value;
    }
}
/**
 * @param {Array<any>} children
 * @param {boolean} [saniate] - If true, children only accept text strings
 * @param {FlatParamMap} map
 * @returns {FlatParamMap}
 */
function flat(children, saniate, map = []) {
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (child) {
            if (Array.isArray(child)) {
                flat(child, saniate, map);
                continue;
            }
            if (child.key != null) {
                if (!map._) map._ = new Map();

                map._.set(child.key, 0);
            }
        }
        let type = typeof child;
        child =
            child == null ||
            type == "boolean" ||
            type == "function" ||
            (type == "object" && (child.vdom != vdom || saniate))
                ? ""
                : child;
        if (saniate) {
            map[0] = (map[0] || "") + child;
        } else {
            map.push(child);
        }
    }
    return map;
}

/**
 * @typedef {object} Vdom
 * @property {any} type
 * @property {symbol} vdom
 * @property {Object<string,any>} props
 * @property {FlatParamMap} [children]
 * @property {any} [key]
 * @property {boolean} [raw]
 * @property {boolean} [shadow]
 */

/**
 *
 * @typedef {Object} HandleEvent
 * @property {(event:Event|CustomEvent)=>any} handleEvent
 */

/**
 *
 * @typedef {(event:Event|CustomEvent)=>any} Listener
 */

/**
 * @typedef {Object<string,Listener> & HandleEvent } Handlers
 */

/**
 * @typedef {Object<string,any>} StyleFill
 */

/**
 * @typedef {Object} Style
 * @property {string} cssText
 */

/**
 * @typedef { any } RawNode
 */

/**
 * @typedef {symbol|string} ID
 */

/**
 * @typedef {Array<any> & {_?:Map<any,any>}} FlatParamMap
 */

/**
 * @typedef {ChildNode[] & {splice?:any}} Nodes
 */

/**
 * This function isolates the context used to dispatch updates to the DOM and associate update
 * @param {import("./custom-element").BaseContext} context
 * @param {(props:object)=>object} component
 */
async function setup(context, component) {
    let symbolId = Symbol();
    let hooks = createHooks();
    let prevent;

    // symbolId allows to obtain the symbol id that stores the state of the virtual-dom
    context.symbolId = symbolId;

    context.mounted = new Promise((resolve) => (context.mount = resolve));

    context.unmounted = new Promise((resolve) => (context.unmount = resolve));

    context.update = async () => {
        if (!prevent) {
            prevent = true;
            /**@type {(value:any)=>void} */
            let resolveUpdate;
            context.updated = new Promise(
                (resolve) => (resolveUpdate = resolve)
            ).then(hooks.updated);

            await context.mounted;

            render(
                hooks.load(component, { ...context._props }),
                context,
                symbolId
            );

            prevent = false;

            resolveUpdate();
        }
    };

    await context.unmounted;

    hooks.updated(true);
}

/**
 *
 * @param {any} component
 * @param {Base} [Base]
 */
function c(component, Base = HTMLElement) {
    /**
     * @type {Object<string,string>}
     */
    let attrs = {};
    /**
     * @type {Object<string,string>}
     */
    let values = {};

    let { props } = component;

    class Element extends Base {
        /**
         * @this BaseContext
         */
        constructor() {
            super();

            this._props = {};

            setup(this, component);

            for (let prop in values) this[prop] = values[prop];

            this.update();
        }
        /**
         * @this BaseContext
         */
        connectedCallback() {
            this.mount();
        }
        /**
         * @this BaseContext
         */
        disconnectedCallback() {
            this.unmount();
        }
        /**
         * @this BaseContext
         * @param {string} attr
         * @param {(string|null)} oldValue
         * @param {(string|null)} value
         */
        attributeChangedCallback(attr, oldValue, value) {
            if (attr === this._ignoreAttr || oldValue === value) return;
            // Choose the property name to send the update
            this[attrs[attr]] = value;
        }
    }

    for (let prop in props) {
        setPrototype(Element.prototype, prop, props[prop], attrs, values);
    }

    Element.observedAttributes = Object.keys(attrs);

    return Element;
}

/**
 * @typedef {typeof HTMLElement} Base
 */

/**
 * @typedef {Object} Context
 * @property {(value:any)=>void} mount
 * @property {(value:any)=>void} unmount
 * @property {Promise<void>} mounted
 * @property {Promise<void>} unmounted
 * @property {Promise<void>} updated
 * @property {()=>Promise<void>} update
 * @property {Object<string,any>} _props
 * @property {string} [_ignoreAttr]
 * @property {symbol} [symbolId]  - symbolId allows to obtain the symbol id that stores the state of the virtual-dom
 */

/**
 * @typedef {HTMLElement & Context} BaseContext
 */

var n=function(t,s,r,e){var u;s[0]=0;for(var h=1;h<s.length;h++){var p=s[h++],a=s[h]?(s[0]|=p?1:2,r[s[h++]]):s[++h];3===p?e[0]=a:4===p?e[1]=Object.assign(e[1]||{},a):5===p?(e[1]=e[1]||{})[s[++h]]=a:6===p?e[1][s[++h]]+=a+"":p?(u=t.apply(a,n(t,a,r,["",null])),e.push(u),a[0]?s[0]|=2:(s[h-2]=0,s[h]=u)):e.push(a);}return e},t=new Map;function htm(s){var r=t.get(this);return r||(r=new Map,t.set(this,r)),(r=n(this,r.get(s)||(r.set(s,r=function(n){for(var t,s,r=1,e="",u="",h=[0],p=function(n){1===r&&(n||(e=e.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?h.push(0,n,e):3===r&&(n||e)?(h.push(3,n,e),r=2):2===r&&"..."===e&&n?h.push(4,n,0):2===r&&e&&!n?h.push(5,0,!0,e):r>=5&&((e||!n&&5===r)&&(h.push(r,0,e,s),r=6),n&&(h.push(r,n,0,s),r=6)),e="";},a=0;a<n.length;a++){a&&(1===r&&p(),p(a));for(var l=0;l<n[a].length;l++)t=n[a][l],1===r?"<"===t?(p(),h=[h],r=3):e+=t:4===r?"--"===e&&">"===t?(r=1,e=""):e=t+e[0]:u?t===u?u="":e+=t:'"'===t||"'"===t?u=t:">"===t?(p(),r=1):r&&("="===t?(r=5,s=e,e=""):"/"===t&&(r<5||">"===n[a][l+1])?(p(),3===r&&(h=h[0]),r=h,(h=h[0]).push(2,0,r),r=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(p(),r=2):e+=t),3===r&&"!--"===e&&(r=4,h=h[0]);}return p(),h}(s)),r),arguments,[])).length>1?r:r[0]}

const html = htm.bind(h);

function component() {
  return html`<host>component-2</host>`;
}

customElements.define("component-2", c(component));

function component$1() {
  return html`<host>component-1</host>`;
}

customElements.define("component-1", c(component$1));
