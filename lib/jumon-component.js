import { JumonBuilder } from "./jumon.js";
import { copyObject } from "./util.js";

function _error(message) {
  console.error(message);
}

function _callIfExists(that, args, name) {
  if (args[name] === undefined) {
    return;
  }
  if (typeof args[name] === "function") {
    args[name].call(that);
  } else {
    _error(`${name} is not a function!`);
  }
}

function _buildElement(template, args) {
  const baseClass = args.baseClass || HTMLElement;
  class newElem extends JumonBuilder(baseClass) {
    constructor() {
      super();
      this.addMethods(args.methods || {});
      Object.assign(this, args.data || {});
    };
    async connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });
      if (args.styleSheet !== undefined) {
        const css = new CSSStyleSheet();
        await css.replace(args.styleSheet);
        shadow.adoptedStyleSheets.push(css);
      }
      shadow.innerHTML = template;
      this._bindToDom(shadow);
      _callIfExists(this, args, "connected");
    }
  }
  return newElem;
}

export function makeComponent(name, template, args={}) {
  console.debug(`make <${name}> component...`);
  const elementClass = _buildElement(template, args);
  customElements.define(name, elementClass);
}
