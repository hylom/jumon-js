import { makeComponent } from '../../lib/jumon-component.js';

const template = `
<div class="root">
  <div class="indicator">
    <span class="operation" jumon-text="operation"></span>
    <input class="value" jumon-bind="currentValue" jumon-type="Number" value="0">
  </div>
  <div class="number-buttons">
    <button jumon-listener="click:setNumber(1)">1</button>
    <button jumon-listener="click:setNumber(2)">2</button>
    <button jumon-listener="click:setNumber(3)">3</button>
    <button jumon-listener="click:setNumber(4)">4</button>
    <button jumon-listener="click:setNumber(5)">5</button>
    <button jumon-listener="click:setNumber(6)">6</button>
    <button jumon-listener="click:setNumber(7)">7</button>
    <button jumon-listener="click:setNumber(8)">8</button>
    <button jumon-listener="click:setNumber(9)">9</button>
    <button jumon-listener="click:setNumber(0)">0</button>
  </div>
  <div class="action-buttons">
    <button jumon-listener="click:setOperation('+')">+</button>
    <button jumon-listener="click:setOperation('-')">-</button>
    <button jumon-listener="click:setOperation('*')">*</button>
    <button jumon-listener="click:setOperation('/')">/</button>
    <button jumon-listener="click:run()">=</button>
    <button jumon-listener="click:allClear">AC</button>
  </div>
  <div class="history">
    <div class="history-header">history:</div>
    <div class="history-items">
      <template jumon-foreach="history in histories">
        <div class="history-item" jumon-text="history"></div>
      </template>
    <button jumon-listener="click:clearHistory">clear history</button>
  </div>
</div>
`;

const css = `
.root {
  display: inline-block;
  border: 1px solid lightgray;
  padding: 4px;
}
.indicator {
  margin-bottom: 4px;
}
.operation {
  display: inline-block;
  width: 1em;
}
.number-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  column-gap: 4px;
  row-gap: 4px;
  margin-bottom: 4px;
}
.action-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  column-gap: 4px;
  row-gap: 4px;
  margin-bottom: 4px;
}
.history-header {
  color: #888;
  font-size: 80%;
}
.history-item {
  border: 1px solid lightgray;
  border-radius: 4px;
  background: #FAFAFA;
  color: #888;
  padding: 4px;
  font-size: 90%;
  margin-bottom: 4px;
}
button { display: block; }
`;

class TinyCalculator extends HTMLElement {
  constructor() {
    super();
    this._isEntered = false;
    this._lastValue = 0;
    this._stack = [];
  }
  setNumber(num) {
    if (this._isEntered) {
      this.currentValue = num;
      this._isEntered = false;
    } else {
      this.currentValue = this.currentValue * 10 + num;
    }
  }
  setOperation(operation) {
    if (!this._isEntered) {
      this._isEntered = true;
      this._lastValue = this.currentValue;
      this._stack.push(this.currentValue);
      if (this.operation) {
        this.run(true);
      }
    } else if (!this.operation) {
      this._stack.push(this.currentValue);
    }
    this.operation = operation;
  }
  allClear() {
    this.operation = "";
    this.currentValue = 0;
    this._lastValue = 0;
    this._isEntered = false;
    this._stack = [];
  }
  run(cont=false) {
    this._stack.push(this.operation);
    this._stack.push(this.currentValue);
    if (this.operation == "+") {
      this.currentValue += this._lastValue;
    } else if (this.operation == "-") {
      this.currentValue = this._lastValue - this.currentValue;
    } else if (this.operation == "*") {
      this.currentValue *= this._lastValue;
    } else if (this.operation == "/") {
      this.currentValue = this._lastValue / this.currentValue;
    }
    if (!cont) {
      this._stack.push("=");
      this._stack.push(this.currentValue);
      console.log(this._stack.join("  "));
      this.histories.push(this._stack.join(" "));
      this._stack = [];
    }
    this._isEntered = true;
    this._lastValue = this.currentValue;
    this.operation = "";
  }
  clearHistory() {
    this.histories.splice(0, this.histories.length);
  }
}

makeComponent("tiny-calculator", template, {
  baseClass: TinyCalculator,
  styleSheet: css,
});

