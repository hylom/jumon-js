import { JumonArray, makeJumonArray } from "./jumon-array.js";
import { parseArguments } from "./util.js";

function _isIn(elem, query) {
  return elem.matches(query)
    || elem.matches(`${query} *`);
}

function _EventReceiverBuilder(baseClass) {
  return class _EventReceiver extends baseClass {
    constructor() {
      super();
      this._eventHandlers = {};
      Object.defineProperty(this, '_eventHandlers', {
        enumerable: false,
      });
    }

    on(eventName, handler) {
      const handlers = this._eventHandlers[eventName] || [];
      handlers.push(handler);
      this._eventHandlers[eventName] = handlers;
    }

    emit(eventName, ...args) {
      const handlers = this._eventHandlers[eventName] || [];
      for (const handler of handlers) {
        handler.apply(null, args);
      }
    }
  };
}

export function JumonBuilder(baseClass) {
  const EventReceiver = _EventReceiverBuilder(baseClass);

  return class Jumon extends EventReceiver {
    constructor(element, initialValue) {
      super();
      initialValue = initialValue || {};

      // prepare hidden properties
      Object.defineProperties(this, {
        _bound: { value: element, enumerable: false, writable: true },
        _placeholders: { value: {}, enumerable: false },
      });

      if (element) {
        this._bindToDom(element, initialValue);
      } else {
        this._bindToDom(initialValue);
      }
    }

    addMethods(methods) {
      Object.assign(this, methods);
    }

    getBoundElement() {
      return this._bound;
    }

    _bindToDom(root, initialValue) {
      // add event listner to variables
      root = root || document;
      this._bound = root;

      // functions table
      const attributes = [
        ["[jumon-text]", elem => this._bindText(elem, initialValue)],
        ["[jumon-bind]", elem => this._bindValue(elem, initialValue)],
        ["[jumon-bind-to]", elem => this._bindAttribute(root, elem, initialValue)],
        ["[jumon-listen]", elem => this._bindEventHandlerV1(root, elem, initialValue)],
        ["[jumon-listener]", elem => this._bindEventHandler(root, elem, initialValue)],
        ["[jumon-bind-renderer]", elem => this._bindRenderer(root, elem, initialValue)],
        ["[jumon-placeholder]", elem => this._bindPlaceholder(root, elem, initialValue)],
        //["[jumon-foreach]", elem => this._bindForeach(root, elem, initialValue)],
      ];

      // to parse, temporary remove top-level "jumon-foreach" attribute.
      const hasForEach = root.getAttribute("jumon-foreach");
      if (hasForEach !== undefined) {
        root.removeAttribute("jumon-foreach");
      }

      for (const [key, func] of attributes) {
        // match for root itself
        if (root.matches(key)) {
          func(root);
        }
        // match for descendants
        root.querySelectorAll(key).forEach(elem => {
          if (!_isIn(elem, "[jumon-foreach]")) {
            func(elem);
          }
        });
      }
      // apply jumon-foreach
      root.querySelectorAll("[jumon-foreach]")
        .forEach(elem => this._bindForeach(root, elem, initialValue));

      if (hasForEach) {
        root.setAttribute("jumon-foreach", hasForEach);
      }
    }

    _bindEventHandlerV1(root, elem, initialValue) {
      // format is: "event:method"
      const bindTo = elem.getAttribute('jumon-listen');
      const t = bindTo.split(':');
      const event = t.shift();
      const method = t.join(':');

      if (!event || !method) {
        console.error(`[jumon] invalid 'jumon-listen' value: ${bindTo}`);
        return;
      }

      // use `arguments` special variable, so arrow function is not available.
      const that = this;
      elem.addEventListener(event, function () {
        const handler = that[method];
        if (!handler) {
          console.error(`[jumon] listen: no handler method found; value: ${method}`);
          return undefined;
        }
        return handler.apply(that, arguments);
      });
    }

    _bindEventHandler(root, elem, initialValue) {
      // format is: "event:method"
      const bindTo = elem.getAttribute('jumon-listener');
      const t = bindTo.split(':');
      const eventName = t.shift();
      const rest = t.join(':').trim();
      const rexFuncName =  /^([^(]+)\((.*)\)/s;
      const m = rexFuncName.exec(rest);
      let method;
      let args = [];
      if (!m) {
        // case 1: only handler name is given (example: `foo`)
        // in this case, event object is given as argument
        method = rest;
        args.push("event");
      } else {
        // case 2: function is given (example: `foo()`, `foo(1, 2)`
        method = m[1];
        if (m[2].length) {
          args = parseArguments(m[2]);
          if (args.length == 0) {
            console.error(`[jumon] invalid 'jumon-listerner' argument: ${bindTo}`);
          }
        }
      }
      if (!eventName || !method) {
        console.error(`[jumon] invalid 'jumon-listener' value: ${bindTo}`);
        return;
      }

      // search "event" argument and mark
      const eventArgIndex = args.findIndex(val => val === "event");

      // use `arguments` special variable, so arrow function is not available.
      const that = this;
      elem.addEventListener(eventName, function (event) {
        // create new argument array not to retain event object
        const newArgs = args.map((v, i) => (i == eventArgIndex ? event : v));
        const handler = that[method];
        if (!handler) {
          console.error(`[jumon] listen: no handler method found; value: ${method}`);
          return undefined;
        }
        return handler.apply(that, newArgs);
      });
    }

    _bindAttribute(root, elem, initialValue) {
      // format is: converter:#id[attribute]
      const bindTo = elem.getAttribute('jumon-bind-to');
      const type = elem.getAttribute('jumon-type');

      // parse bindTo attribute
      const rex = /^(?:([^:]+):)?#([^[]+)\[([^\]]+)\]$/;
      const m = bindTo.match(rex);
      if (!m) {
        console.error(`[jumon] invalid 'jumon-bind-to' value: ${bindTo}`);
        return;
      }
      const converter = m[1] ? m[1] : null;
      const id = m[2];
      const attribute = m[3];

      if (!id || !attribute) {
        console.error(`[jumon] invalid 'jumon-bind-to' value: ${bindTo}`);
        return;
      }

      elem.addEventListener('change', () => {
        let value = elem.value;
        if (type == 'Number') {
          value = Number(value);
        }
        if (converter) {
          const fn = this[converter];
          if (!fn) {
            console.error(`[jumon] no converter exists: ${converter}`);
            return;
          }
          value = fn(value);
        }
        root
          .querySelectorAll(`#${id}[${attribute}`)
          .forEach(elem => {
            elem.setAttribute(attribute, value);
          });
      });
    }

    _bindText(elem, initialValue) {
      const bindTo = elem.getAttribute('jumon-text');
      const type = elem.getAttribute('jumon-type');
      Object.defineProperty(this, bindTo, {
        enumerable: true,
        configurable: true,
        // define getter
        get: () => {
          let v = elem.textContent;
          if (type == 'Number') {
            v = Number(v);
          }
          return v;
        },
        // define setter
        set: v => {
          elem.textContent = v;
        },
      });

      if (initialValue[bindTo] != undefined) {
        this[bindTo] = initialValue[bindTo];
      }
    }
    
    _bindValue(elem, initialValue) {
      const bindTo = elem.getAttribute('jumon-bind');
      const type = elem.getAttribute('jumon-type');
      const inputType = (elem.getAttribute('type') || "").toLowerCase();
      // TODO:  configurable should be false!
      Object.defineProperty(this, bindTo, {
        enumerable: true,
        configurable: true,
        // define getter
        get: () => {
          if (inputType === 'checkbox') {
            return elem.checked;
          }
          let v = elem.value;
          if (type == 'Number') {
            v = Number(v);
          }
          return v;
        },
        // define setter
        set: v => {
          if (inputType === 'checkbox') {
            elem.checked = !!v;
            return;
          }
          elem.value = v;
          elem.dispatchEvent(new Event('change', {bubbles:true}));
        },
      });
      if (initialValue[bindTo] != undefined) {
        this[bindTo] = initialValue[bindTo];
      }
      elem.addEventListener('change', this._changeHandler.bind(this));
    }

    _changeHandler(ev) {
      this.emit('update');
    }

    // deprecated
    _bindRenderer(root, elem, initialValue) {
      // format is: "renderer:property"
      const bind = elem.getAttribute('jumon-bind-renderer');
      const t = bind.split(':');
      const renderer = t.shift();
      const property = t.shift();

      this._bindTemplate(elem, property, renderer, this[property]);
    }

    // deprecated
    _bindTemplate(elem, propName, generator, defaultValue) {
      Object.defineProperty(this, `_jumon_${propName}`, {
        enumerable: false,
        writable: true,
      });

      Object.defineProperty(this, propName, {
        enumerable: true,
        // define getter
        get: () => {
          return this[`_jumon_${propName}`];
        },
        // define setter
        set: v => {
          this[`_jumon_${propName}`] = v;
          this._renderTemplate(elem, propName, generator);
          if (Array.isArray(v)) {
            this._bindArray(elem, propName, generator);
          }
        },
      });

      if (typeof defaultValue !== 'undefined') {
        this[propName] = defaultValue;
      }
    }

    // deprecated
    _bindArray(elem, propName, generator) {
      // add hook for array functions
      const prop = this[`_jumon_${propName}`];
      if (Array.isArray(prop)) {
        const targetFns = [
          'push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'
        ];
        const that = this;
        for (const fn of targetFns) {
          prop[fn] = function () {
            const r = Array.prototype[fn].apply(prop, arguments);
            that._renderTemplate(elem, propName, generator);
            return r;
          };
        }
      }
    }

    // deprecated
    _renderTemplate(elem, propName, generator) {
      const val = this[`_jumon_${propName}`];
      if (typeof val !== 'object') {
        return;
      }
      if (typeof this[generator] === 'undefined') {
        console.error(`[jumon] invalid renderer: ${generator}`);
        return;
      }
      const fn = this[generator].bind(this);

      if (Array.isArray(val)) {
        elem.innerHTML = '';
        let index = 0;
        for (const v of val) {
          const html = fn(v, index, val);
          index++;
          const div = document.createElement('div');
          div.innerHTML = html;
          if (div.children.length > 1) {
            console.error(`[jumon] template must has only one root node!`);
            console.error(`[jumon] invalid generated html: ${html}`);
            console.error(`[jumon] invalid parsed html: ${div.innerHTML}`);
          }
          const child = div.children[0];
          elem.appendChild(child);
          this._bindToDom(child, v);
        }
        
      } else {
        const html = fn(val);
        elem.innerHTML = html;
        this._bindToDom(elem, val);
      }
    }

    _bindForeach(root, elem, initialValue) {
      const t = elem.getAttribute('jumon-foreach');
      const items = t.split(/\s+in\s/);
      if (items.length > 3) {
        console.error(`invalid value of jumon-foreach: "${t}"`);
        return;
      }
      const bindTo = items.length == 1 ? items[0].trim() : items[1].trim();
      const localName = items.length == 1 ? undefined : items[0].trim();
      
      if (this[bindTo] === undefined) {
        this[bindTo] = makeJumonArray(elem, bindTo, localName);
        //      } else if (!Array.isArray(this[bindTo])) {
      } else if (!this[bindTo] instanceof JumonArray) {
        console.debug(`.${bindTo} is not JumonArray!`);
      }

      if (elem.tagName == "TEMPLATE") {
        // template mode
        // template tag does not hold children directly,
        // so you need to access via `content` property.
        if (elem.content.children.length == 0) {
          console.error(`<template jumon-foreach="${bindTo}">  does not have children.`);
          return;
        }
        if (elem.content.children.length > 1) {
          console.error(`<template jumon-foreach="${bindTo}"> must have only one child.`);
          return;
        }
        this[bindTo]._template = elem.content.children[0];
        elem.content.children[0].remove();
        this[bindTo]._template.setAttribute("jumon-foreach", bindTo);
        //this[bindTo]._bound = elem;
        this[bindTo].bindElement(elem);
      } else {
        // non-template mode
        const newObj = new Jumon(elem, initialValue[bindTo]);
        this[bindTo]._push(newObj);
        //this[bindTo]._bound = elem;
        this[bindTo].bindElement(elem);
      }
    }

    _bindPlaceholder(root, elem, initialValue) {
      const bindTo = elem.getAttribute('jumon-placeholder');
      this._placeholders[bindTo] = { elem };
      Object.defineProperty(this, bindTo, {
        enumerable: true,
        configurable: true,
        // define getter
        get: () => {
          const bound = this._placeholders[bindTo];
          return bound.jObj;
        },
        // define setter
        set: v => {
          const bound = this._placeholders[bindTo];
          const oldElem = bound.elem;
          bound.jObj = v;
          bound.elem = v.getBoundElement();
          oldElem.replaceWith(bound.elem);
        },
      });
    }
  };

}

export const Jumon = JumonBuilder(Object);
