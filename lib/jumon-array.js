import { Jumon } from "./jumon.js";

export class JumonArray extends Array {
  constructor(templateElem, bindTo) {
    super();
    // create deep clone of the template element
    this._template = templateElem.cloneNode(true);
    this._bindTo = bindTo;
  }

  pop() {
    if (this.length == 0) {
      // array is blank;
      return undefined;
    }
    if (this.length == 1) {
      const placeholder = document.createElement("template");
      placeholder.setAttribute("jumon-foreach", this._bindTo);
      this[this.length-1].getBoundElement().replaceWith(placeholder);
      this._bound = placeholder;
    } else {
      this[this.length-1].getBoundElement().remove();
    }
    return this._pop();
  }

  _pop() { return super.pop(); }

  push(...items) {
    for (let item of items) {
      const newElem = this._template.cloneNode(true);
      if (this.length == 0) {
        this._bound.replaceWith(newElem);
      } else {
        this[this.length-1].getBoundElement()
          .insertAdjacentElement("afterend", newElem);
      }
      const o = new Jumon(newElem, item);
      this._push(o);
    }
  }

  _push(...items) { super.push(...items); }

  reverse() {}
  shift() {}
  sort() {}
  splice(start, deleteCount, ...items) {}
  unshift(...items) {}
}
