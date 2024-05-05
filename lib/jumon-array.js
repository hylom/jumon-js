import { Jumon } from "./jumon.js";

export class JumonArray {
  constructor(templateElem, bindTo, localName) {
    this._array = new _JumonArrayCore(...arguments);
  }
}

export function makeJumonArray(templateElem, bindTo, localName) {
  const handler = {
    get(target, prop, receiver) {
      if (prop == "_array") {
        return target._array;
      }
      if (typeof prop !== "symbol" && Number.isInteger(Number(prop))) {
        return target._array.getAt(prop, true);
      }
      return target._array[prop];
    },
    set(target, prop, value, receiver) {
      //return Reflect.set(target._array, prop, value, receiver);
      target._array[prop] = value;
      return true;
    },
    has(target, prop) {
      return prop in target._array;
    }
  };
  return new Proxy(new JumonArray(...arguments), handler);
}

class _JumonArrayCore extends Array {
  constructor(templateElem, bindTo, localName) {
    super();
    // create deep clone of the template element
    Object.defineProperties(this, {
      _template: { value: templateElem.cloneNode(true),
                   enumerable: false, writable: true },
      _bindTo: { value: bindTo, enumerable: false, writable: true },
      _localName: { value: localName, enumerable: false, writable: true },
    });
  }

  getAt(index) {
    return this._export(this[index]);
  }

  bindElement(elem) {
    this._bound = elem;
  }

  getBoundElement(elem) {
    return this._bound;
  }

  setAt(index, value) {
    return this[index] = this._import(value);
  }

  _import(data) {
    if (this._localName !== undefined) {
      const obj = {};
      obj[this._localName] = data;
      return obj;
    }
    return data;
  }

  _export(data) {
    if (this._localName !== undefined) {
      return data[this._localName];
    }
    return data;
  }

  _removeItem(index) {
    if (this.length == 0) {
      // array is blank;
      return false;
    }
    if (this.length == 1) {
      const placeholder = document.createElement("template");
      placeholder.setAttribute("jumon-foreach", this._bindTo);
      this._array[index].getBoundElement().replaceWith(placeholder);
      this._bound = placeholder;
    } else {
      this._array[index].getBoundElement().remove();
    }
    return true;
  }

  _pop() { return super.pop(); }

  pop() {
    if (this._removeItem(this.length - 1)) {
      return this._export(this._pop());
    }
    return undefined;
  }

  _push(...items) { return super.push(...items); }

  push(...items) {
    for (let data of items) {
      const item = this._import(data);
      const newElem = this._template.cloneNode(true);
      if (this.length == 0) {
        this._bound.replaceWith(newElem);
      } else {
        this._array[this.length-1].getBoundElement()
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
      return this._export(this._shift());
    }
    return undefined;
  }

  
  sort() { console.error("JumonArray#sort() is not implemented!"); }
  splice(start, deleteCount, ...items) {
    console.error("JumonArray#splice() is not implemented!");
  }

  _unshift(...items) { return super.unshift(...items); }

  unshift(...items) {
    for (let data of items) {
      const item = this._import(data);
      const newElem = this._template.cloneNode(true);
      if (this.length == 0) {
        this._bound.replaceWith(newElem);
      } else {
        this._array[0].getBoundElement()
          .insertAdjacentElement("beforebegin", newElem);
      }
      const o = new Jumon(newElem, item);
      this._unshift(o);
    }
  }

}
