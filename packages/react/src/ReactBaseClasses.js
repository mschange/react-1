/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import invariant from 'shared/invariant';

import ReactNoopUpdateQueue from './ReactNoopUpdateQueue';

const emptyObject = {};
if (__DEV__) {
  Object.freeze(emptyObject);
}

/**
 * Base class helpers for the updating state of a component.
 * 相当于Es6
 * class Component {
 *   constructor(props, context, updater) {
 *    this.props = props
      this.context = context
      this.refs = emptyObject
      this.updater = updater || ReactNoopUpdateQueue 
 *   }
 * }
 *
 */
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  // 如果一个组件有字符串引用，我们将分配一个不同的对象
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
}

// 用户判断是React.Component
Component.prototype.isReactComponent = {};

/**
 * @param {object|function} partialState
 * @param {?function} callback Called after state is updated.
 * @final
 * @protected
 * setState({
 *
 * }, callbck)
 */
// 在Component原型挂载setState
Component.prototype.setState = function(partialState, callback) {
  invariant(
    typeof partialState === 'object' ||
      typeof partialState === 'function' ||
      partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
      'function which returns an object of state variables.',
  );
  // 执行setState
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};

/**
 * @param {?function} callback Called after update is complete.
 * @final
 * @protected
 */
// 在原型上面挂载forceUpdate
Component.prototype.forceUpdate = function(callback) {
  // 执行forceUpdate
  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
};

/**
 * Deprecated APIs. These APIs used to exist on classic React classes but since
 * we would like to deprecate them, we're not going to move them over to this
 * modern base class. Instead, we define a getter that warns if it's accessed.
 */
if (__DEV__) {
  const deprecatedAPIs = {
    isMounted: [
      'isMounted',
      'Instead, make sure to clean up subscriptions and pending requests in ' +
        'componentWillUnmount to prevent memory leaks.',
    ],
    replaceState: [
      'replaceState',
      'Refactor your code to use setState instead (see ' +
        'https://github.com/facebook/react/issues/3236).',
    ],
  };
  const defineDeprecationWarning = function(methodName, info) {
    Object.defineProperty(Component.prototype, methodName, {
      get: function() {
        console.warn(
          '%s(...) is deprecated in plain JavaScript React classes. %s',
          info[0],
          info[1],
        );
        return undefined;
      },
    });
  };
  for (const fnName in deprecatedAPIs) {
    if (deprecatedAPIs.hasOwnProperty(fnName)) {
      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
    }
  }
}

// 设置一个空的对象，并把原型指向了Component
function ComponentDummy() {}
ComponentDummy.prototype = Component.prototype;

/**
 * PureComponent组件， 跟Component类似
 *
 * class PureComponent {
 *   constructor(props, context, updater) {
 *     this.props = props;
 *     this.context = context;
 *     this.refs = emptyObject;
 *     this.updater = updater || ReactNoopUpdateQqueue;
 *   }
 * }
 */
function PureComponent(props, context, updater) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}
// PureComponent的原型指向了一个空对象ComponentDummy，对象的原型指向了Component的原型
const pureComponentPrototype = (PureComponent.prototype = new ComponentDummy());
pureComponentPrototype.constructor = PureComponent;
// 避免这些方法的额外原型跳转
Object.assign(pureComponentPrototype, Component.prototype);
pureComponentPrototype.isPureReactComponent = true;

export {Component, PureComponent};

