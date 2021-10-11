# JUMON.js - JUst html element MONitor

JUMON.js is simple DOM access library. This enables easily and readable access to DOM element from your code by binding DOM elements' attribute to Jumon object.

## How to use

### 1. Add 'jumon-*' attribute to HTML elements

```
<form>
  <input value="50" jumon-bind="width" jumon-type="Number">
  <input value="100" jumon-bind="height" jumon-type="Number">
</form>
```

### 2. import `Jumon` class and create instance

```
import { Jumon } from './jumon.js';
parameter = new Jumon();
```

### 3. access element's value via Jumon instance

```
// read text box's values
console.log(parameter.width);
console.log(parameter.height);

// update text box's value
parameter.width = 100;
parameter.height = 200;
```

## `jumon-*` attribute references

### `jumon-bind="propertyName"`

Bind the element's value to Jumon instance's `.propertyName` property.

Example:

```
<select jumon-bind="count">
  <option value="1" selected>1</option>
  <option value="2">2</option>
  <option value="3">3</option>
</select>
```

```
parameter = new Jumon();
console.log(parameter.count); // output: "1"
```

### `jumon-type="Number"`

Enable auto type conversion to Number. If value is not a number, conversion result is "NaN".

Example:

```
<select jumon-bind="count" jumon-type="Number">
  <option value="1" selected>1</option>
  <option value="2">2</option>
  <option value="3">3</option>
</select>
```

```
parameter = new Jumon();
console.log(parameter.count); // output: 1
```

### `jumon-bind-to="selector[attribute]"`

Bind the element's value to another element's attribue.

Example:

```
<input class="ratio" value="100" jumon-bind-to="#frame[height]">
<iframe src="https://example.com/" height="0"></iframe>
```

### `jumon-bind-to="converter:selector[attribute]"`

Bind the element's value to another element's attribue. the value is given to converter function, and then set its return value to the selected element's attribute.

Example:

```
<input class="ratio" value="100" jumon-bind-to="calcSize:#frame[height]">
<iframe src="https://example.com/" height="0"></iframe>
```

```
parameter = new Jumon();
parameter.calcSize(val => val * 2); // set the iframe's height to twice the value
```


### `jumon-bind-renderer="renderMethod:propertyName"`

Append the HTML which render method returns as the element's child.

Example:

```
<div jumon-bind-renderer="renderer:items">
</div>
```

```
parameter = new Jumon();
parameter.renderer = (param, index) => {
  return `<div>${index}: ${param.title}</div>`;
}
parameter.items = [
  {title: "foo"},
  {title: "bar"},
];
```

### `jumon-listen="click:listenerMethod"`

Add EventListner to the element.

Example:

```
<button jumon-listen="click:update">update</button>
```

```
parameter = new Jumon();
parameter.update = (event) {
  // When the button is clicked, this method is invoked.
};
```

## Copyright

2022, Hiromichi Matsushima (hylom) <hylom@hylom.net>.

## License

MIT License.
