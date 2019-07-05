const isFunc = source => typeof source === "function";

const dispatchBaker = (source, dispatch) => (...bakerArgs) => (...args) =>
  dispatch(source(...bakerArgs, ...args));

const overrideComponent = (component, actionsDict) => {
  const _view = component.view;
  component.view = (vnode, ...args) => {
    const _vnode = { ...vnode, ...actionsDict };
    return _view(_vnode, ...args);
  };
};

const processActions = (actions, dispatch) => {
  if (isFunc(actions) === true) {
    return actions(dispatch);
  } else if (typeof actions === "object") {
    let toReturn = {};
    for (key in actions) {
      if (isFunc(actions[key])) {
        toReturn[key] = dispatchBaker(actions[key], dispatch);
      }
    }
    return toReturn;
  }
  return {};
};

function buildContainer() {
  return {
    setup: function(store, mithril) {
      this._store = store;
      this._m = mithril;
    },
    ...this
  };
}

const defaultContainer = new buildContainer();

const provider = (rootComponent, container = defaultContainer) => {
  const { _store, _m } = container;
  _store.on("@changed", _m.redraw);
  return isFunc(rootComponent) ? new rootComponent() : rootComponent;
};

const connect = (
  selector,
  actions,
  container = defaultContainer
) => Component => ({
  view(vnode, a, children) {
    const {
      _m,
      _store: { dispatch, get }
    } = container;
    const actionsDict = processActions(actions, dispatch);
    const state = selector(get());
    const _component = isFunc(Component) ? new Component() : Component;
    overrideComponent(_component, actionsDict);
    return _m(
      _component,
      {
        dispatch,
        ...actionsDict,
        ...a,
        ...state
      },
      children
    );
  }
});

module.exports = {
  buildContainer,
  container: defaultContainer,
  provider,
  connect
};
