import { makeComponent } from '../../lib/jumon-component.js';

const template = `
<div>
  <span class="op-indicator" jumon-text="operation"></span>
  <input class="indicator" jumon-bind="currentValue" jumon-type="Number" value="0">
  <div class="number-buttons">
    <button jumon-listener="click:clickNumber(1)">1</button>
    <button jumon-listener="click:clickNumber(2)">2</button>
    <button jumon-listener="click:clickNumber(3)">3</button>
    <button jumon-listener="click:clickNumber(4)">4</button>
    <button jumon-listener="click:clickNumber(5)">5</button>
    <button jumon-listener="click:clickNumber(6)">6</button>
    <button jumon-listener="click:clickNumber(7)">7</button>
    <button jumon-listener="click:clickNumber(8)">8</button>
    <button jumon-listener="click:clickNumber(9)">9</button>
    <button jumon-listener="click:clickNumber(0)">0</button>
  </div>
  <div class="action-buttons">
    <button jumon-listener="click:clickOperation('+')">+</button>
    <button jumon-listener="click:clickOperation('-')">-</button>
    <button jumon-listener="click:clickOperation('*')">*</button>
    <button jumon-listener="click:clickOperation('/')">/</button>
    <button jumon-listener="click:run()">=</button>
    <button jumon-listener="click:allClear">AC</button>
  </div>
</div>
`;

class TinyCalculator extends HTMLElement {
  constructor() {
    super();
    this._isEntered = false;
    this._lastValue = 0;
  }
  connected() {}
  clickNumber(num) {
    if (this._isEntered) {
      this.currentValue = num;
      this._isEntered = false;
    } else {
      this.currentValue = this.currentValue * 10 + num;
    }
  }
  clickOperation(operation) {
    if (!this._isEntered && this.operation) {
      this.run();
    } else {
      this._isEntered = true;
      this._lastValue = this.currentValue;
    }
    this.operation = operation;
  }
  allClear() {
    this.operation = "";
    this.currentValue = 0;
    this._lastValue = 0;
    this._isEntered = false;
  }
  run() {
    if (this.operation == "+") {
      this.currentValue += this._lastValue;
    } else if (this.operation == "-") {
      this.currentValue -= this._lastValue;
    } else if (this.operation == "*") {
      this.currentValue *= this._lastValue;
    } else if (this.operation == "/") {
      this.currentValue /= this._lastValue;
    }
    this._isEntered = true;
    this._lastValue = this.currentValue;
    this.operation = "";
  }
}

makeComponent("tiny-calculator", template, { baseClass: TinyCalculator });

