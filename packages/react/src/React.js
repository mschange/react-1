/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import ReactVersion from 'shared/ReactVersion';
import {
  REACT_FRAGMENT_TYPE,
  REACT_DEBUG_TRACING_MODE_TYPE,
  REACT_PROFILER_TYPE,
  REACT_STRICT_MODE_TYPE,
  REACT_SUSPENSE_TYPE,
  REACT_SUSPENSE_LIST_TYPE,
  REACT_LEGACY_HIDDEN_TYPE,
  REACT_SCOPE_TYPE,
  REACT_CACHE_TYPE,
} from 'shared/ReactSymbols';

import {Component, PureComponent} from './ReactBaseClasses';
// 导出的是创建ref
import {createRef} from './ReactCreateRef';
// 导出的是this.props.children的五个方法
import {forEach, map, count, toArray, only} from './ReactChildren';
// 导出的是createElement，createFactory，cloneElement方法
import {
  createElement as createElementProd,
  createFactory as createFactoryProd,
  cloneElement as cloneElementProd,
  isValidElement,
} from './ReactElement';
// 导出的是createContext，创建上下文content
import {createContext} from './ReactContext';
import {lazy} from './ReactLazy';
// 导出的也是创建ref的另一种形式
import {forwardRef} from './ReactForwardRef';
import {memo} from './ReactMemo';
// 导出react的hooks相关
import {
  getCacheForType,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useLayoutEffect,
  useMemo,
  useMutableSource,
  useReducer,
  useRef,
  useState,
  useTransition,
  useDeferredValue,
  useOpaqueIdentifier,
  useCacheRefresh,
} from './ReactHooks';
import {
  createElementWithValidation,
  createFactoryWithValidation,
  cloneElementWithValidation,
} from './ReactElementValidator';
import {createMutableSource} from './ReactMutableSource';
import ReactSharedInternals from './ReactSharedInternals';
import {startTransition} from './ReactStartTransition';

// TODO: Move this branching into the other module instead and just re-export.
const createElement = __DEV__ ? createElementWithValidation : createElementProd;
const cloneElement = __DEV__ ? cloneElementWithValidation : cloneElementProd;
const createFactory = __DEV__ ? createFactoryWithValidation : createFactoryProd;

/**
 * children提供了map，forEach，cout，toArray，only等方法
 */
const Children = {
  map,
  forEach,
  count,
  toArray,
  only,
};

export {
  Children,
  createMutableSource,
  createRef,
  Component,
  PureComponent,
  createContext,
  forwardRef,
  lazy,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useDebugValue,
  useLayoutEffect,
  useMemo,
  useMutableSource,
  useReducer,
  useRef,
  useState,
  REACT_FRAGMENT_TYPE as Fragment,
  REACT_PROFILER_TYPE as Profiler,
  REACT_STRICT_MODE_TYPE as StrictMode,
  REACT_DEBUG_TRACING_MODE_TYPE as unstable_DebugTracingMode,
  REACT_SUSPENSE_TYPE as Suspense,
  createElement,
  cloneElement,
  isValidElement,
  ReactVersion as version,
  ReactSharedInternals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  // Deprecated behind disableCreateFactory
  createFactory,
  // Concurrent Mode
  useTransition,
  startTransition,
  useDeferredValue,
  REACT_SUSPENSE_LIST_TYPE as SuspenseList,
  REACT_LEGACY_HIDDEN_TYPE as unstable_LegacyHidden,
  getCacheForType as unstable_getCacheForType,
  useCacheRefresh as unstable_useCacheRefresh,
  REACT_CACHE_TYPE as unstable_Cache,
  // enableScopeAPI
  REACT_SCOPE_TYPE as unstable_Scope,
  useOpaqueIdentifier as unstable_useOpaqueIdentifier,
};
