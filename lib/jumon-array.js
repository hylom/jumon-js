import { Jumon } from "./jumon.js";

export class JumonArray extends Array {
  constructor(templateElem, bindTo) {
    super();
    // create deep clone of the template element
    this._template = templateElem.cloneNode(true);
    this._bindTo = bindTo;
  }

  _removeItem(index) {
    if (this.length == 0) {
      // array is blank;
      return false;
    }
    if (this.length == 1) {
      const placeholder = document.createElement("template");
      placeholder.setAttribute("jumon-foreach", this._bindTo);
      this[index].getBoundElement().replaceWith(placeholder);
      this._bound = placeholder;
    } else {
      this[index].getBoundElement().remove();
    }
    return true;
  }

  _pop() { return super.pop(); }

  pop() {
    if (this._removeItem(this.length - 1)) {
      return this._pop();
    }
    return undefined;
  }

  _push(...items) { super.push(...items); }

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

  reverse() { console.error("JumonArray#reverse() is not implemented!"); }

  _shift() { return super.shift(); }
  shift() {
    if (this._removeItem(0)) {
      return this._shift();
    }
    return undefined;
  }

  
  sort() { console.error("JumonArray#sort() is not implemented!"); }
  splice(start, deleteCount, ...items) {
    console.error("JumonArray#splice() is not implemented!");
  }

  _unshift(...items) { return super.unshift(...items); }
  unshift(...items) {
      for (let item of items) {
      const newElem = this._template.cloneNode(true);
      if (this.length == 0) {
        this._bound.replaceWith(newElem);
      } else {
        this[0].getBoundElement()
          .insertAdjacentElement("beforebegin", newElem);
      }
      const o = new Jumon(newElem, item);
      this._unshift(o);
    }
  }

}
