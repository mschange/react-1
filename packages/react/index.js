/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

// Keep in sync with https://github.com/facebook/flow/blob/master/lib/react.js
export type StatelessFunctionalComponent<
  P,
> = React$StatelessFunctionalComponent<P>;
export type ComponentType<-P> = React$ComponentType<P>;
export type AbstractComponent<
  -Config,
  +Instance = mixed,
> = React$AbstractComponent<Config, Instance>;
export type ElementType = React$ElementType;
export type Element<+C> = React$Element<C>;
export type Key = React$Key;
export type Ref<C> = React$Ref<C>;
export type Node = React$Node;
export type Context<T> = React$Context<T>;
export type Portal = React$Portal;
export type ElementProps<C> = React$ElementProps<C>;
export type ElementConfig<C> = React$ElementConfig<C>;
export type ElementRef<C> = React$ElementRef<C>;
export type Config<Props, DefaultProps> = React$Config<Props, DefaultProps>;
export type ChildrenArray<+T> = $ReadOnlyArray<ChildrenArray<T>> | T;
export type Interaction = {
  name: string,
  timestamp: number,
  ...
};

// react抛出来的方法
export {
  // this.props.children
  Children,
  // 创建ref
  createRef,
  // 组件
  Component,
  // 组件
  PureComponent,
  // 创建上下文
  createContext,
  // 创建ref
  forwardRef,
  lazy,
  memo,
  // hooks里面的useCallback
  useCallback,
  // hooks里面创建上下文
  useContext,
  // hooks创建useEffect
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useLayoutEffect,
  // hooks
  useMemo,
  // hooks
  useReducer,
  // hooks
  useRef,
  // hooks
  useState,
  useMutableSource,
  useMutableSource as unstable_useMutableSource,
  createMutableSource,
  createMutableSource as unstable_createMutableSource,
  // 空标签
  /**
   * <>
   *  <p>这就是Fragment</p>
   * </>
   */
  Fragment,
  Profiler,
  unstable_DebugTracingMode,
  StrictMode,
  Suspense,
  // React.createElement()负责生成虚拟domReactDOM.render()将虚拟dom转化为真实dom
  createElement,
  // 克隆组件
  cloneElement,
  isValidElement,
  version,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  createFactory,
  useTransition,
  useTransition as unstable_useTransition,
  startTransition,
  startTransition as unstable_startTransition,
  useDeferredValue,
  useDeferredValue as unstable_useDeferredValue,
  SuspenseList,
  SuspenseList as unstable_SuspenseList,
  unstable_LegacyHidden,
  unstable_Scope,
  unstable_useOpaqueIdentifier,
  unstable_getCacheForType,
  unstable_Cache,
  unstable_useCacheRefresh,
} from './src/React';
