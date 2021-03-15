/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import getComponentNameFromType from 'shared/getComponentNameFromType';
import invariant from 'shared/invariant';
import {REACT_ELEMENT_TYPE} from 'shared/ReactSymbols';

import ReactCurrentOwner from './ReactCurrentOwner';

const hasOwnProperty = Object.prototype.hasOwnProperty;

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

let specialPropKeyWarningShown,
  specialPropRefWarningShown,
  didWarnAboutStringRefs;

if (__DEV__) {
  didWarnAboutStringRefs = {};
}


// 判断config是否含义ref
function hasValidRef(config) {
  if (__DEV__) {
    if (hasOwnProperty.call(config, 'ref')) {
      const getter = Object.getOwnPropertyDescriptor(config, 'ref').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.ref !== undefined;
}

function hasValidKey(config) {
  if (__DEV__) {
    if (hasOwnProperty.call(config, 'key')) {
      const getter = Object.getOwnPropertyDescriptor(config, 'key').get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.key !== undefined;
}

function defineKeyPropWarningGetter(props, displayName) {
  const warnAboutAccessingKey = function() {
    if (__DEV__) {
      if (!specialPropKeyWarningShown) {
        specialPropKeyWarningShown = true;
        console.error(
          '%s: `key` is not a prop. Trying to access it will result ' +
            'in `undefined` being returned. If you need to access the same ' +
            'value within the child component, you should pass it as a different ' +
            'prop. (https://reactjs.org/link/special-props)',
          displayName,
        );
      }
    }
  };
  warnAboutAccessingKey.isReactWarning = true;
  Object.defineProperty(props, 'key', {
    get: warnAboutAccessingKey,
    configurable: true,
  });
}

function defineRefPropWarningGetter(props, displayName) {
  const warnAboutAccessingRef = function() {
    if (__DEV__) {
      if (!specialPropRefWarningShown) {
        specialPropRefWarningShown = true;
        console.error(
          '%s: `ref` is not a prop. Trying to access it will result ' +
            'in `undefined` being returned. If you need to access the same ' +
            'value within the child component, you should pass it as a different ' +
            'prop. (https://reactjs.org/link/special-props)',
          displayName,
        );
      }
    }
  };
  warnAboutAccessingRef.isReactWarning = true;
  Object.defineProperty(props, 'ref', {
    get: warnAboutAccessingRef,
    configurable: true,
  });
}

function warnIfStringRefCannotBeAutoConverted(config) {
  if (__DEV__) {
    if (
      typeof config.ref === 'string' &&
      ReactCurrentOwner.current &&
      config.__self &&
      ReactCurrentOwner.current.stateNode !== config.__self
    ) {
      const componentName = getComponentNameFromType(
        ReactCurrentOwner.current.type,
      );

      if (!didWarnAboutStringRefs[componentName]) {
        console.error(
          'Component "%s" contains the string ref "%s". ' +
            'Support for string refs will be removed in a future major release. ' +
            'This case cannot be automatically converted to an arrow function. ' +
            'We ask you to manually fix this case by using useRef() or createRef() instead. ' +
            'Learn more about using refs safely here: ' +
            'https://reactjs.org/link/strict-mode-string-ref',
          componentName,
          config.ref,
        );
        didWarnAboutStringRefs[componentName] = true;
      }
    }
  }
}

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * 工厂方法来创建新的React元素。这不再符合类模式，所以不要使用new来调用它。还有，检查实例
   不起作用。而是对$$typeof字段进行测试符号.for('反应元素）进行检查

 * @param {type为标签名称*} type
 * @param {props自定义的属性、方法，注意：props.children=childArray*} props
 * @param {key为null*} key
 * @param {string|object} ref
 * @param {*} owner
 * @param {null*} self
 * @param {null*} source
 * @internal
 */
const ReactElement = function(type, key, ref, self, source, owner, props) {
  const element = {
    // 这个标签允许我们唯一地将其标识为React元素
    $$typeof: REACT_ELEMENT_TYPE,

    // 属于元素的内置属性
    type: type,
    key: key,
    ref: ref,
    props: props,

    // 记录负责创建此元素的组件。
    _owner: owner,
  };

  if (__DEV__) {
    element._store = {};
    /**
     * 为了便于测试验证标志不可枚举（如果可能，应该包括我们运行测试的每个环境），可以忽略
     */
    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false,
    });
    // self和source是仅适用于开发人员的属性
    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self,
    });
    // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.
    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source,
    });
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};

/**
 * https://github.com/reactjs/rfcs/pull/107
 * @param {*} type
 * @param {object} props
 * @param {string} key
 */
export function jsx(type, config, maybeKey) {
  let propName;

  // Reserved names are extracted
  const props = {};

  let key = null;
  let ref = null;

  // Currently, key can be spread in as a prop. This causes a potential
  // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
  // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
  // but as an intermediary step, we will use jsxDEV for everything except
  // <div {...props} key="Hi" />, because we aren't currently able to tell if
  // key is explicitly declared to be undefined or not.
  if (maybeKey !== undefined) {
    key = '' + maybeKey;
  }

  if (hasValidKey(config)) {
    key = '' + config.key;
  }

  if (hasValidRef(config)) {
    ref = config.ref;
  }

  // Remaining properties are added to a new props object
  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }

  // Resolve default props
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  return ReactElement(
    type,
    key,
    ref,
    undefined,
    undefined,
    ReactCurrentOwner.current,
    props,
  );
}

/**
 * https://github.com/reactjs/rfcs/pull/107
 * @param {*} type
 * @param {object} props
 * @param {string} key
 */
export function jsxDEV(type, config, maybeKey, source, self) {
  let propName;

  // Reserved names are extracted
  const props = {};

  let key = null;
  let ref = null;

  // Currently, key can be spread in as a prop. This causes a potential
  // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
  // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
  // but as an intermediary step, we will use jsxDEV for everything except
  // <div {...props} key="Hi" />, because we aren't currently able to tell if
  // key is explicitly declared to be undefined or not.
  if (maybeKey !== undefined) {
    key = '' + maybeKey;
  }

  if (hasValidKey(config)) {
    key = '' + config.key;
  }

  if (hasValidRef(config)) {
    ref = config.ref;
    warnIfStringRefCannotBeAutoConverted(config);
  }

  // Remaining properties are added to a new props object
  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }

  // Resolve default props
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }

  if (key || ref) {
    const displayName =
      typeof type === 'function'
        ? type.displayName || type.name || 'Unknown'
        : type;
    if (key) {
      defineKeyPropWarningGetter(props, displayName);
    }
    if (ref) {
      defineRefPropWarningGetter(props, displayName);
    }
  }

  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}

/**
 * Create and return a new ReactElement of the given type.
 * See https://reactjs.org/docs/react-api.html#createelement
 */
/**
 * createElement()负责生成虚拟
 * @param {type接受的是标签名称*} type
 * @param {config接受的是包含的props，style，class等*} config
 * @param {children 子节点的VNode对象 || 父元素的文本内容*} children
 * @returns
 */
export function createElement(type, config, children) {
  let propName;

  // Reserved names are extracted
  const props = {};

  // 对于关键字处理
  let key = null;
  let ref = null;
  let self = null;
  let source = null;

  // 判断config是否有值
  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;

      if (__DEV__) {
        warnIfStringRefCannotBeAutoConverted(config);
      }
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // 对于children的处理，形参
  const childrenLength = arguments.length - 2;
  // length为1的情况，直接赋值
  if (childrenLength === 1) {
    props.children = children;
    // 大于1，进行循环赋值
  } else if (childrenLength > 1) {
    // 新建数组长度为childrenLength的数组
    const childArray = Array(childrenLength);
    // 循环并赋值
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    // 最终把得到的childArray赋值给props点children
    props.children = childArray;
  }

  // 是否存在默认的defaultProps
  if (type && type.defaultProps) {
    const defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  if (__DEV__) {
    if (key || ref) {
      const displayName =
        typeof type === 'function'
          ? type.displayName || type.name || 'Unknown'
          : type;
      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }
      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }
  }
  // 调用ReactElement方法，把处理的参数传递进去
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props,
  );
}

/**
 * Return a function that produces ReactElements of a given type.
 * See https://reactjs.org/docs/react-api.html#createfactory
 */
export function createFactory(type) {
  const factory = createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook: remove it
  factory.type = type;
  return factory;
}

export function cloneAndReplaceKey(oldElement, newKey) {
  const newElement = ReactElement(
    oldElement.type,
    newKey,
    oldElement.ref,
    oldElement._self,
    oldElement._source,
    oldElement._owner,
    oldElement.props,
  );

  return newElement;
}

/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://reactjs.org/docs/react-api.html#cloneelement
 */
export function cloneElement(element, config, children) {
  invariant(
    !(element === null || element === undefined),
    'React.cloneElement(...): The argument must be a React element, but you passed %s.',
    element,
  );

  let propName;

  // Original props are copied
  const props = Object.assign({}, element.props);

  // Reserved names are extracted
  let key = element.key;
  let ref = element.ref;
  // Self is preserved since the owner is preserved.
  const self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
  const source = element._source;

  // Owner will be preserved, unless ref is overridden
  let owner = element._owner;

  if (config != null) {
    if (hasValidRef(config)) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (hasValidKey(config)) {
      key = '' + config.key;
    }

    // Remaining properties override existing props
    let defaultProps;
    if (element.type && element.type.defaultProps) {
      defaultProps = element.type.defaultProps;
    }
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        if (config[propName] === undefined && defaultProps !== undefined) {
          // Resolve default props
          props[propName] = defaultProps[propName];
        } else {
          props[propName] = config[propName];
        }
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(element.type, key, ref, self, source, owner, props);
}

/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */
export function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
