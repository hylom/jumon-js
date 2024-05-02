// jumon.js - JUst html element MONitor

function _parseArguments(argString) {
  const rex = /^("[^"]*"|'[^']*'|[^"',]+)(\s*,\s*(?:"[^"]*"|'[^']*'|[^"',]+))*$/s;
  const results = [];
  let s = argString.trim();
  let m = rex.exec(s);
  while (m) {
    if (m[2] === undefined) {
      results.unshift(m[1].trim());
      break;
    }
    s = s.substring(0, s.length - m[2].length);
    results.unshift(m[2].replace(/^[ ,]+/, "").trim());
    m = rex.exec(s);
  }

  // remove quote/double-quote from string
  for (let i = 0; i < results.length; i++) {
    const t = results[i];
    if (t.startsWith(`"`) || t.startsWith(`'`)) {
      results[i] = t.substring(1, t.length - 1);
      continue;
    }
    const n = Number(t);
    if (!isNaN(n)) {
      results[i] = n;
    }
  }
  return results;
}

export function copyObject(obj) {
  return Object.fromEntries(Object.entries(obj));
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
      this._methods = {};
      initialValue = initialValue || {};
      if (element) {
        this._bindToDom(element);
      } else {
        this._bindToDom();
      }
    }

    addMethods(methods) {
      Object.assign(this, methods);
    }

    addMethod(name, method) {
      this[name] = method;
    }

    _bindToDom(root, obj) {
      // add event listner to variables
      root = root || document;

      root
        .querySelectorAll('[jumon-text]')
        .forEach(elem => {
          this._bindText(elem, obj);
        });

      root
        .querySelectorAll('[jumon-bind]')
        .forEach(elem => {
          this._bindElem(elem, obj);
        });

      root
        .querySelectorAll('[jumon-bind-to]')
        .forEach(elem => {
          this._bindAttribute(root, elem, obj);
        });

      root
        .querySelectorAll('[jumon-listen]')
        .forEach(elem => {
          this._bindEventHandlerV1(root, elem, obj);
        });

      root
        .querySelectorAll('[jumon-listener]')
        .forEach(elem => {
          this._bindEventHandler(root, elem, obj);
        });

      root
        .querySelectorAll('[jumon-bind-renderer]')
        .forEach(elem => {
          this._bindRenderer(root, elem, obj);
        });

      root
        .querySelectorAll('[jumon-foreach]')
        .forEach(elem => {
          this._bindForeach(root, elem, obj);
        });
    }

    _bindEventHandlerV1(root, elem, obj) {
      // format is: "event:method"
      obj = obj || this;
      const bindTo = elem.getAttribute('jumon-listen');
      const t = bindTo.split(':');
      const event = t.shift();
      const method = t.join(':');

      if (!event || !method) {
        console.error(`[jumon] invalid 'jumon-listen' value: ${bindTo}`);
        return;
      }

      // use `arguments` special variable, so arrow function is not available.
      elem.addEventListener(event, function () {
        const handler = obj[method];
        if (!handler) {
          console.error(`[jumon] listen: no handler method found; value: ${method}`);
          return undefined;
        }
        return handler.apply(obj, arguments);
      });
    }

    _bindEventHandler(root, elem, obj) {
      // format is: "event:method"
      obj = obj || this;
      const bindTo = elem.getAttribute('jumon-listener');
      const t = bindTo.split(':');
      const event = t.shift();
      const rest = t.join(':').trim();
      const rexFuncName =  /^([^(]+)\((.*)\)/s;
      const m = rexFuncName.exec(rest);
      let method = rest;
      let args = [];
      if (m) {
        method = m[1];
        if (m[2].length) {
          args = _parseArguments(m[2]);
          if (args.length == 0) {
            console.error(`[jumon] invalud 'jumon-listerner' argument: ${bindTo}`);
          }
        }
      }
      if (!event || !method) {
        console.error(`[jumon] invalid 'jumon-listener' value: ${bindTo}`);
        return;
      }

      elem.addEventListener(event, () => {
        const handler = obj[method];
        if (!handler) {
          console.error(`[jumon] listen: no handler method found; value: ${method}`);
          return undefined;
        }
        return handler.apply(obj, args);
      });
    }

    _bindAttribute(root, elem, obj) {
      obj = obj || this;
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
          const fn = obj[converter];
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

    _bindText(elem, obj) {
      obj = obj || this;
      const bindTo = elem.getAttribute('jumon-text');
      Object.defineProperty(obj, bindTo, {
        enumerable: true,
        configurable: true,
        // define getter
        get: () => {
          let v = elem.textContent;
          return v;
        },
        // define setter
        set: v => {
          elem.textContent = v;
        },
      });
    }
    
    _bindElem(elem, obj) {
      obj = obj || this;
      const bindTo = elem.getAttribute('jumon-bind');
      const type = elem.getAttribute('jumon-type');
      const inputType = (elem.getAttribute('type') || "").toLowerCase();

      // TODO:  configurable should be false!
      Object.defineProperty(obj, bindTo, {
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
      elem.addEventListener('change', this._changeHandler.bind(this));
    }

    _changeHandler(ev) {
      this.emit('update');
    }

    _bindRenderer(root, elem, obj) {
      // format is: "renderer:property"
      obj = obj || this;
      const bind = elem.getAttribute('jumon-bind-renderer');
      const t = bind.split(':');
      const renderer = t.shift();
      const property = t.shift();

      this._bindTemplate(elem, property, renderer, this[property]);
    }

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

    _bindForeach(root, elem, obj) {
      obj = obj || this;
      const bindTo = elem.getAttribute('jumon-foreach');
      Object.defineProperty(obj, bindTo, {
        enumerable: true,
        configurable: true,
        get: () => {
        },
        set: v => {
        },
      });
    }
  };
}

export const Jumon = JumonBuilder(Object);
