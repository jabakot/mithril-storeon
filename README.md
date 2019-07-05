# mithril-storeon

Super simple connector between Mithril and Storeon

There are 2 methods in this package - buildContainer and connect.

By default there is "global container" which can be imported as container.

You can separate containers by passing them as last argument for provider and connect functions.

## Container

An abstraction that bounds store, mithril and subscribes to "@changed".
Setup method after initialization.

#### Default flow

```javascript
import m from "mithril";
import { container } from "mithril-storeon";

container.setup(store, m); // m for mithril
//  container._store = strore;
//  container._m = m;
```

#### buildContainer

Encapsulates store, can be passes as last argument for connect.

```javascript
import m from "mithril";
import { buildContainer } from "mithril-storeon";

const myLovelyContainer = new buildContainer();
myLovelyContainer.setup(store, m); // m for mithril
//  myLovelyContainer._store = strore;
//  myLovelyContainer._m = m;
```

### connect

Links state selector and actions with component.

```javascript
import m from "mithril";
import createStore from "storeon";
import { container, connect } from "../mithril-storeon";

const frt = store => {
  store.on("@init", () => ({ fruit: "apple" }));
  store.on("Banana!", (store, payload) => ({ fruit: payload }));
};

const store = createStore([frt]);

container.setup(store, m);

// basic component
const _fruitComponent = () => ({
  view: vnode => {
    const { fruit, setBanana } = vnode.attrs;
    console.log(vnode.attrs);
    return m("div", { onclick: setBanana }, `My favorite fruit is  - ${fruit}`);
  }
});

// connected component
const myFavoriteFruit = connect(
  // state selector
  state => ({ fruit: state.fruit }),
  // actions
  dispatch => ({
    setBanana: () => dispatch("Banana!", "banana!")
  })
)(_fruitComponent);

export const root = () => ({
  view: vn => m("div", { class: "root" }, [m(myFavoriteFruit)])
});

document.addEventListener("DOMContentLoaded", () =>
  m.mount(document.body, root)
);

```

#### Separating stores

```javascript
import m from "mithril";
import createStore from "storeon";
import { buildContainer, connect } from "../mithril-storeon";

const red = store => {
  store.on("@init", () => ({ color: "red" }));
};
const green = store => {
  store.on("@init", () => ({ color: "green" }));
};

const redStore = createStore([red]);
const greenStore = createStore([green]);

const redContainer = buildContainer();
redContainer.setup(redStore, m);
const greenContainer = buildContainer();
greenContainer.setup(greenStore, m);

// basic component
const _color = () => ({
  view: vnode => {
    const { color } = vnode.attrs;
    return m("div", `My favorite color is  - ${color}`);
  }
});

// connected component
export const redColor = connect(
  state => ({ color: state.color }),
  undefined,
  redContainer
)(_color);

export const greenColor = connect(
  state => ({ color: state.color }),
  undefined,
  greenContainer
)(_color);

export const root = () => ({
  view: vn => m("div", { class: "root" }, [m(redColor), m(greenColor)])
});
```
