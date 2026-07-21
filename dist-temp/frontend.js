var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/scheduler/cjs/scheduler.production.js
var require_scheduler_production = __commonJS((exports) => {
  function push(heap, node) {
    var index = heap.length;
    heap.push(node);
    a:
      for (;0 < index; ) {
        var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
        if (0 < compare(parent, node))
          heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
        else
          break a;
      }
  }
  function peek(heap) {
    return heap.length === 0 ? null : heap[0];
  }
  function pop(heap) {
    if (heap.length === 0)
      return null;
    var first = heap[0], last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      a:
        for (var index = 0, length = heap.length, halfLength = length >>> 1;index < halfLength; ) {
          var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
          if (0 > compare(left, last))
            rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
          else if (rightIndex < length && 0 > compare(right, last))
            heap[index] = right, heap[rightIndex] = last, index = rightIndex;
          else
            break a;
        }
    }
    return first;
  }
  function compare(a, b) {
    var diff = a.sortIndex - b.sortIndex;
    return diff !== 0 ? diff : a.id - b.id;
  }
  exports.unstable_now = undefined;
  if (typeof performance === "object" && typeof performance.now === "function") {
    localPerformance = performance;
    exports.unstable_now = function() {
      return localPerformance.now();
    };
  } else {
    localDate = Date, initialTime = localDate.now();
    exports.unstable_now = function() {
      return localDate.now() - initialTime;
    };
  }
  var localPerformance;
  var localDate;
  var initialTime;
  var taskQueue = [];
  var timerQueue = [];
  var taskIdCounter = 1;
  var currentTask = null;
  var currentPriorityLevel = 3;
  var isPerformingWork = false;
  var isHostCallbackScheduled = false;
  var isHostTimeoutScheduled = false;
  var needsPaint = false;
  var localSetTimeout = typeof setTimeout === "function" ? setTimeout : null;
  var localClearTimeout = typeof clearTimeout === "function" ? clearTimeout : null;
  var localSetImmediate = typeof setImmediate !== "undefined" ? setImmediate : null;
  function advanceTimers(currentTime) {
    for (var timer = peek(timerQueue);timer !== null; ) {
      if (timer.callback === null)
        pop(timerQueue);
      else if (timer.startTime <= currentTime)
        pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
      else
        break;
      timer = peek(timerQueue);
    }
  }
  function handleTimeout(currentTime) {
    isHostTimeoutScheduled = false;
    advanceTimers(currentTime);
    if (!isHostCallbackScheduled)
      if (peek(taskQueue) !== null)
        isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline());
      else {
        var firstTimer = peek(timerQueue);
        firstTimer !== null && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
      }
  }
  var isMessageLoopRunning = false;
  var taskTimeoutID = -1;
  var frameInterval = 5;
  var startTime = -1;
  function shouldYieldToHost() {
    return needsPaint ? true : exports.unstable_now() - startTime < frameInterval ? false : true;
  }
  function performWorkUntilDeadline() {
    needsPaint = false;
    if (isMessageLoopRunning) {
      var currentTime = exports.unstable_now();
      startTime = currentTime;
      var hasMoreWork = true;
      try {
        a: {
          isHostCallbackScheduled = false;
          isHostTimeoutScheduled && (isHostTimeoutScheduled = false, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
          isPerformingWork = true;
          var previousPriorityLevel = currentPriorityLevel;
          try {
            b: {
              advanceTimers(currentTime);
              for (currentTask = peek(taskQueue);currentTask !== null && !(currentTask.expirationTime > currentTime && shouldYieldToHost()); ) {
                var callback = currentTask.callback;
                if (typeof callback === "function") {
                  currentTask.callback = null;
                  currentPriorityLevel = currentTask.priorityLevel;
                  var continuationCallback = callback(currentTask.expirationTime <= currentTime);
                  currentTime = exports.unstable_now();
                  if (typeof continuationCallback === "function") {
                    currentTask.callback = continuationCallback;
                    advanceTimers(currentTime);
                    hasMoreWork = true;
                    break b;
                  }
                  currentTask === peek(taskQueue) && pop(taskQueue);
                  advanceTimers(currentTime);
                } else
                  pop(taskQueue);
                currentTask = peek(taskQueue);
              }
              if (currentTask !== null)
                hasMoreWork = true;
              else {
                var firstTimer = peek(timerQueue);
                firstTimer !== null && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
                hasMoreWork = false;
              }
            }
            break a;
          } finally {
            currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = false;
          }
          hasMoreWork = undefined;
        }
      } finally {
        hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = false;
      }
    }
  }
  var schedulePerformWorkUntilDeadline;
  if (typeof localSetImmediate === "function")
    schedulePerformWorkUntilDeadline = function() {
      localSetImmediate(performWorkUntilDeadline);
    };
  else if (typeof MessageChannel !== "undefined") {
    channel = new MessageChannel, port = channel.port2;
    channel.port1.onmessage = performWorkUntilDeadline;
    schedulePerformWorkUntilDeadline = function() {
      port.postMessage(null);
    };
  } else
    schedulePerformWorkUntilDeadline = function() {
      localSetTimeout(performWorkUntilDeadline, 0);
    };
  var channel;
  var port;
  function requestHostTimeout(callback, ms) {
    taskTimeoutID = localSetTimeout(function() {
      callback(exports.unstable_now());
    }, ms);
  }
  exports.unstable_IdlePriority = 5;
  exports.unstable_ImmediatePriority = 1;
  exports.unstable_LowPriority = 4;
  exports.unstable_NormalPriority = 3;
  exports.unstable_Profiling = null;
  exports.unstable_UserBlockingPriority = 2;
  exports.unstable_cancelCallback = function(task) {
    task.callback = null;
  };
  exports.unstable_forceFrameRate = function(fps) {
    0 > fps || 125 < fps ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : frameInterval = 0 < fps ? Math.floor(1000 / fps) : 5;
  };
  exports.unstable_getCurrentPriorityLevel = function() {
    return currentPriorityLevel;
  };
  exports.unstable_next = function(eventHandler) {
    switch (currentPriorityLevel) {
      case 1:
      case 2:
      case 3:
        var priorityLevel = 3;
        break;
      default:
        priorityLevel = currentPriorityLevel;
    }
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;
    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
  exports.unstable_requestPaint = function() {
    needsPaint = true;
  };
  exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
    switch (priorityLevel) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        priorityLevel = 3;
    }
    var previousPriorityLevel = currentPriorityLevel;
    currentPriorityLevel = priorityLevel;
    try {
      return eventHandler();
    } finally {
      currentPriorityLevel = previousPriorityLevel;
    }
  };
  exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
    var currentTime = exports.unstable_now();
    typeof options === "object" && options !== null ? (options = options.delay, options = typeof options === "number" && 0 < options ? currentTime + options : currentTime) : options = currentTime;
    switch (priorityLevel) {
      case 1:
        var timeout = -1;
        break;
      case 2:
        timeout = 250;
        break;
      case 5:
        timeout = 1073741823;
        break;
      case 4:
        timeout = 1e4;
        break;
      default:
        timeout = 5000;
    }
    timeout = options + timeout;
    priorityLevel = {
      id: taskIdCounter++,
      callback,
      priorityLevel,
      startTime: options,
      expirationTime: timeout,
      sortIndex: -1
    };
    options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), peek(taskQueue) === null && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = true, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = true, isMessageLoopRunning || (isMessageLoopRunning = true, schedulePerformWorkUntilDeadline())));
    return priorityLevel;
  };
  exports.unstable_shouldYield = shouldYieldToHost;
  exports.unstable_wrapCallback = function(callback) {
    var parentPriorityLevel = currentPriorityLevel;
    return function() {
      var previousPriorityLevel = currentPriorityLevel;
      currentPriorityLevel = parentPriorityLevel;
      try {
        return callback.apply(this, arguments);
      } finally {
        currentPriorityLevel = previousPriorityLevel;
      }
    };
  };
});

// node_modules/scheduler/index.js
var require_scheduler = __commonJS((exports, module) => {
  if (true) {
    module.exports = require_scheduler_production();
  } else {}
});

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS((exports) => {
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
  var REACT_PORTAL_TYPE = Symbol.for("react.portal");
  var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
  var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
  var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
  var REACT_CONTEXT_TYPE = Symbol.for("react.context");
  var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
  var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
  var REACT_MEMO_TYPE = Symbol.for("react.memo");
  var REACT_LAZY_TYPE = Symbol.for("react.lazy");
  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (maybeIterable === null || typeof maybeIterable !== "object")
      return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return typeof maybeIterable === "function" ? maybeIterable : null;
  }
  var ReactNoopUpdateQueue = {
    isMounted: function() {
      return false;
    },
    enqueueForceUpdate: function() {},
    enqueueReplaceState: function() {},
    enqueueSetState: function() {}
  };
  var assign = Object.assign;
  var emptyObject = {};
  function Component(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  Component.prototype.isReactComponent = {};
  Component.prototype.setState = function(partialState, callback) {
    if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null)
      throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, partialState, callback, "setState");
  };
  Component.prototype.forceUpdate = function(callback) {
    this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
  };
  function ComponentDummy() {}
  ComponentDummy.prototype = Component.prototype;
  function PureComponent(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    this.updater = updater || ReactNoopUpdateQueue;
  }
  var pureComponentPrototype = PureComponent.prototype = new ComponentDummy;
  pureComponentPrototype.constructor = PureComponent;
  assign(pureComponentPrototype, Component.prototype);
  pureComponentPrototype.isPureReactComponent = true;
  var isArrayImpl = Array.isArray;
  var ReactSharedInternals = { H: null, A: null, T: null, S: null, V: null };
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function ReactElement(type, key, self, source, owner, props) {
    self = props.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: self !== undefined ? self : null,
      props
    };
  }
  function cloneAndReplaceKey(oldElement, newKey) {
    return ReactElement(oldElement.type, newKey, undefined, undefined, undefined, oldElement.props);
  }
  function isValidElement(object) {
    return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }
  function escape(key) {
    var escaperLookup = { "=": "=0", ":": "=2" };
    return "$" + key.replace(/[=:]/g, function(match) {
      return escaperLookup[match];
    });
  }
  var userProvidedKeyEscapeRegex = /\/+/g;
  function getElementKey(element, index) {
    return typeof element === "object" && element !== null && element.key != null ? escape("" + element.key) : index.toString(36);
  }
  function noop$1() {}
  function resolveThenable(thenable) {
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenable.reason;
      default:
        switch (typeof thenable.status === "string" ? thenable.then(noop$1, noop$1) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
          thenable.status === "pending" && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
        }, function(error) {
          thenable.status === "pending" && (thenable.status = "rejected", thenable.reason = error);
        })), thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
        }
    }
    throw thenable;
  }
  function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    var type = typeof children;
    if (type === "undefined" || type === "boolean")
      children = null;
    var invokeCallback = false;
    if (children === null)
      invokeCallback = true;
    else
      switch (type) {
        case "bigint":
        case "string":
        case "number":
          invokeCallback = true;
          break;
        case "object":
          switch (children.$$typeof) {
            case REACT_ELEMENT_TYPE:
            case REACT_PORTAL_TYPE:
              invokeCallback = true;
              break;
            case REACT_LAZY_TYPE:
              return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
          }
      }
    if (invokeCallback)
      return callback = callback(children), invokeCallback = nameSoFar === "" ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", invokeCallback != null && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
        return c;
      })) : callback != null && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (callback.key == null || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
    invokeCallback = 0;
    var nextNamePrefix = nameSoFar === "" ? "." : nameSoFar + ":";
    if (isArrayImpl(children))
      for (var i = 0;i < children.length; i++)
        nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
    else if (i = getIteratorFn(children), typeof i === "function")
      for (children = i.call(children), i = 0;!(nameSoFar = children.next()).done; )
        nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
    else if (type === "object") {
      if (typeof children.then === "function")
        return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
      array = String(children);
      throw Error("Objects are not valid as a React child (found: " + (array === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
    }
    return invokeCallback;
  }
  function mapChildren(children, func, context) {
    if (children == null)
      return children;
    var result = [], count = 0;
    mapIntoArray(children, result, "", "", function(child) {
      return func.call(context, child, count++);
    });
    return result;
  }
  function lazyInitializer(payload) {
    if (payload._status === -1) {
      var ctor = payload._result;
      ctor = ctor();
      ctor.then(function(moduleObject) {
        if (payload._status === 0 || payload._status === -1)
          payload._status = 1, payload._result = moduleObject;
      }, function(error) {
        if (payload._status === 0 || payload._status === -1)
          payload._status = 2, payload._result = error;
      });
      payload._status === -1 && (payload._status = 0, payload._result = ctor);
    }
    if (payload._status === 1)
      return payload._result.default;
    throw payload._result;
  }
  var reportGlobalError = typeof reportError === "function" ? reportError : function(error) {
    if (typeof window === "object" && typeof window.ErrorEvent === "function") {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: typeof error === "object" && error !== null && typeof error.message === "string" ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event))
        return;
    } else if (typeof process === "object" && typeof process.emit === "function") {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  };
  function noop() {}
  exports.Children = {
    map: mapChildren,
    forEach: function(children, forEachFunc, forEachContext) {
      mapChildren(children, function() {
        forEachFunc.apply(this, arguments);
      }, forEachContext);
    },
    count: function(children) {
      var n = 0;
      mapChildren(children, function() {
        n++;
      });
      return n;
    },
    toArray: function(children) {
      return mapChildren(children, function(child) {
        return child;
      }) || [];
    },
    only: function(children) {
      if (!isValidElement(children))
        throw Error("React.Children.only expected to receive a single React element child.");
      return children;
    }
  };
  exports.Component = Component;
  exports.Fragment = REACT_FRAGMENT_TYPE;
  exports.Profiler = REACT_PROFILER_TYPE;
  exports.PureComponent = PureComponent;
  exports.StrictMode = REACT_STRICT_MODE_TYPE;
  exports.Suspense = REACT_SUSPENSE_TYPE;
  exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
  exports.__COMPILER_RUNTIME = {
    __proto__: null,
    c: function(size) {
      return ReactSharedInternals.H.useMemoCache(size);
    }
  };
  exports.cache = function(fn) {
    return function() {
      return fn.apply(null, arguments);
    };
  };
  exports.cloneElement = function(element, config, children) {
    if (element === null || element === undefined)
      throw Error("The argument must be a React element, but you passed " + element + ".");
    var props = assign({}, element.props), key = element.key, owner = undefined;
    if (config != null)
      for (propName in config.ref !== undefined && (owner = undefined), config.key !== undefined && (key = "" + config.key), config)
        !hasOwnProperty.call(config, propName) || propName === "key" || propName === "__self" || propName === "__source" || propName === "ref" && config.ref === undefined || (props[propName] = config[propName]);
    var propName = arguments.length - 2;
    if (propName === 1)
      props.children = children;
    else if (1 < propName) {
      for (var childArray = Array(propName), i = 0;i < propName; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    return ReactElement(element.type, key, undefined, undefined, owner, props);
  };
  exports.createContext = function(defaultValue) {
    defaultValue = {
      $$typeof: REACT_CONTEXT_TYPE,
      _currentValue: defaultValue,
      _currentValue2: defaultValue,
      _threadCount: 0,
      Provider: null,
      Consumer: null
    };
    defaultValue.Provider = defaultValue;
    defaultValue.Consumer = {
      $$typeof: REACT_CONSUMER_TYPE,
      _context: defaultValue
    };
    return defaultValue;
  };
  exports.createElement = function(type, config, children) {
    var propName, props = {}, key = null;
    if (config != null)
      for (propName in config.key !== undefined && (key = "" + config.key), config)
        hasOwnProperty.call(config, propName) && propName !== "key" && propName !== "__self" && propName !== "__source" && (props[propName] = config[propName]);
    var childrenLength = arguments.length - 2;
    if (childrenLength === 1)
      props.children = children;
    else if (1 < childrenLength) {
      for (var childArray = Array(childrenLength), i = 0;i < childrenLength; i++)
        childArray[i] = arguments[i + 2];
      props.children = childArray;
    }
    if (type && type.defaultProps)
      for (propName in childrenLength = type.defaultProps, childrenLength)
        props[propName] === undefined && (props[propName] = childrenLength[propName]);
    return ReactElement(type, key, undefined, undefined, null, props);
  };
  exports.createRef = function() {
    return { current: null };
  };
  exports.forwardRef = function(render) {
    return { $$typeof: REACT_FORWARD_REF_TYPE, render };
  };
  exports.isValidElement = isValidElement;
  exports.lazy = function(ctor) {
    return {
      $$typeof: REACT_LAZY_TYPE,
      _payload: { _status: -1, _result: ctor },
      _init: lazyInitializer
    };
  };
  exports.memo = function(type, compare) {
    return {
      $$typeof: REACT_MEMO_TYPE,
      type,
      compare: compare === undefined ? null : compare
    };
  };
  exports.startTransition = function(scope) {
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    try {
      var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
      onStartTransitionFinish !== null && onStartTransitionFinish(currentTransition, returnValue);
      typeof returnValue === "object" && returnValue !== null && typeof returnValue.then === "function" && returnValue.then(noop, reportGlobalError);
    } catch (error) {
      reportGlobalError(error);
    } finally {
      ReactSharedInternals.T = prevTransition;
    }
  };
  exports.unstable_useCacheRefresh = function() {
    return ReactSharedInternals.H.useCacheRefresh();
  };
  exports.use = function(usable) {
    return ReactSharedInternals.H.use(usable);
  };
  exports.useActionState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useActionState(action, initialState, permalink);
  };
  exports.useCallback = function(callback, deps) {
    return ReactSharedInternals.H.useCallback(callback, deps);
  };
  exports.useContext = function(Context) {
    return ReactSharedInternals.H.useContext(Context);
  };
  exports.useDebugValue = function() {};
  exports.useDeferredValue = function(value, initialValue) {
    return ReactSharedInternals.H.useDeferredValue(value, initialValue);
  };
  exports.useEffect = function(create, createDeps, update) {
    var dispatcher = ReactSharedInternals.H;
    if (typeof update === "function")
      throw Error("useEffect CRUD overload is not enabled in this build of React.");
    return dispatcher.useEffect(create, createDeps);
  };
  exports.useId = function() {
    return ReactSharedInternals.H.useId();
  };
  exports.useImperativeHandle = function(ref, create, deps) {
    return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
  };
  exports.useInsertionEffect = function(create, deps) {
    return ReactSharedInternals.H.useInsertionEffect(create, deps);
  };
  exports.useLayoutEffect = function(create, deps) {
    return ReactSharedInternals.H.useLayoutEffect(create, deps);
  };
  exports.useMemo = function(create, deps) {
    return ReactSharedInternals.H.useMemo(create, deps);
  };
  exports.useOptimistic = function(passthrough, reducer) {
    return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
  };
  exports.useReducer = function(reducer, initialArg, init) {
    return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
  };
  exports.useRef = function(initialValue) {
    return ReactSharedInternals.H.useRef(initialValue);
  };
  exports.useState = function(initialState) {
    return ReactSharedInternals.H.useState(initialState);
  };
  exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
    return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  };
  exports.useTransition = function() {
    return ReactSharedInternals.H.useTransition();
  };
  exports.version = "19.1.1";
});

// node_modules/react/index.js
var require_react = __commonJS((exports, module) => {
  if (true) {
    module.exports = require_react_production();
  } else {}
});

// node_modules/react-dom/cjs/react-dom.production.js
var require_react_dom_production = __commonJS((exports) => {
  var React = __toESM(require_react(), 1);
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2;i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function noop() {}
  var Internals = {
    d: {
      f: noop,
      r: function() {
        throw Error(formatProdErrorMessage(522));
      },
      D: noop,
      C: noop,
      L: noop,
      m: noop,
      X: noop,
      S: noop,
      M: noop
    },
    p: 0,
    findDOMNode: null
  };
  var REACT_PORTAL_TYPE = Symbol.for("react.portal");
  function createPortal$1(children, containerInfo, implementation) {
    var key = 3 < arguments.length && arguments[3] !== undefined ? arguments[3] : null;
    return {
      $$typeof: REACT_PORTAL_TYPE,
      key: key == null ? null : "" + key,
      children,
      containerInfo,
      implementation
    };
  }
  var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  function getCrossOriginStringAs(as, input) {
    if (as === "font")
      return "";
    if (typeof input === "string")
      return input === "use-credentials" ? input : "";
  }
  exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
  exports.createPortal = function(children, container) {
    var key = 2 < arguments.length && arguments[2] !== undefined ? arguments[2] : null;
    if (!container || container.nodeType !== 1 && container.nodeType !== 9 && container.nodeType !== 11)
      throw Error(formatProdErrorMessage(299));
    return createPortal$1(children, container, null, key);
  };
  exports.flushSync = function(fn) {
    var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
    try {
      if (ReactSharedInternals.T = null, Internals.p = 2, fn)
        return fn();
    } finally {
      ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
    }
  };
  exports.preconnect = function(href, options) {
    typeof href === "string" && (options ? (options = options.crossOrigin, options = typeof options === "string" ? options === "use-credentials" ? options : "" : undefined) : options = null, Internals.d.C(href, options));
  };
  exports.prefetchDNS = function(href) {
    typeof href === "string" && Internals.d.D(href);
  };
  exports.preinit = function(href, options) {
    if (typeof href === "string" && options && typeof options.as === "string") {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = typeof options.integrity === "string" ? options.integrity : undefined, fetchPriority = typeof options.fetchPriority === "string" ? options.fetchPriority : undefined;
      as === "style" ? Internals.d.S(href, typeof options.precedence === "string" ? options.precedence : undefined, {
        crossOrigin,
        integrity,
        fetchPriority
      }) : as === "script" && Internals.d.X(href, {
        crossOrigin,
        integrity,
        fetchPriority,
        nonce: typeof options.nonce === "string" ? options.nonce : undefined
      });
    }
  };
  exports.preinitModule = function(href, options) {
    if (typeof href === "string")
      if (typeof options === "object" && options !== null) {
        if (options.as == null || options.as === "script") {
          var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
          Internals.d.M(href, {
            crossOrigin,
            integrity: typeof options.integrity === "string" ? options.integrity : undefined,
            nonce: typeof options.nonce === "string" ? options.nonce : undefined
          });
        }
      } else
        options == null && Internals.d.M(href);
  };
  exports.preload = function(href, options) {
    if (typeof href === "string" && typeof options === "object" && options !== null && typeof options.as === "string") {
      var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
      Internals.d.L(href, as, {
        crossOrigin,
        integrity: typeof options.integrity === "string" ? options.integrity : undefined,
        nonce: typeof options.nonce === "string" ? options.nonce : undefined,
        type: typeof options.type === "string" ? options.type : undefined,
        fetchPriority: typeof options.fetchPriority === "string" ? options.fetchPriority : undefined,
        referrerPolicy: typeof options.referrerPolicy === "string" ? options.referrerPolicy : undefined,
        imageSrcSet: typeof options.imageSrcSet === "string" ? options.imageSrcSet : undefined,
        imageSizes: typeof options.imageSizes === "string" ? options.imageSizes : undefined,
        media: typeof options.media === "string" ? options.media : undefined
      });
    }
  };
  exports.preloadModule = function(href, options) {
    if (typeof href === "string")
      if (options) {
        var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
        Internals.d.m(href, {
          as: typeof options.as === "string" && options.as !== "script" ? options.as : undefined,
          crossOrigin,
          integrity: typeof options.integrity === "string" ? options.integrity : undefined
        });
      } else
        Internals.d.m(href);
  };
  exports.requestFormReset = function(form) {
    Internals.d.r(form);
  };
  exports.unstable_batchedUpdates = function(fn, a) {
    return fn(a);
  };
  exports.useFormState = function(action, initialState, permalink) {
    return ReactSharedInternals.H.useFormState(action, initialState, permalink);
  };
  exports.useFormStatus = function() {
    return ReactSharedInternals.H.useHostTransitionStatus();
  };
  exports.version = "19.1.1";
});

// node_modules/react-dom/index.js
var require_react_dom = __commonJS((exports, module) => {
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    if (false) {}
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  if (true) {
    checkDCE();
    module.exports = require_react_dom_production();
  } else {}
});

// node_modules/react-dom/cjs/react-dom-client.production.js
var require_react_dom_client_production = __commonJS((exports) => {
  var Scheduler = __toESM(require_scheduler(), 1);
  var React = __toESM(require_react(), 1);
  var ReactDOM = __toESM(require_react_dom(), 1);
  function formatProdErrorMessage(code) {
    var url = "https://react.dev/errors/" + code;
    if (1 < arguments.length) {
      url += "?args[]=" + encodeURIComponent(arguments[1]);
      for (var i = 2;i < arguments.length; i++)
        url += "&args[]=" + encodeURIComponent(arguments[i]);
    }
    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  function isValidContainer(node) {
    return !(!node || node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11);
  }
  function getNearestMountedFiber(fiber) {
    var node = fiber, nearestMounted = fiber;
    if (fiber.alternate)
      for (;node.return; )
        node = node.return;
    else {
      fiber = node;
      do
        node = fiber, (node.flags & 4098) !== 0 && (nearestMounted = node.return), fiber = node.return;
      while (fiber);
    }
    return node.tag === 3 ? nearestMounted : null;
  }
  function getSuspenseInstanceFromFiber(fiber) {
    if (fiber.tag === 13) {
      var suspenseState = fiber.memoizedState;
      suspenseState === null && (fiber = fiber.alternate, fiber !== null && (suspenseState = fiber.memoizedState));
      if (suspenseState !== null)
        return suspenseState.dehydrated;
    }
    return null;
  }
  function assertIsMounted(fiber) {
    if (getNearestMountedFiber(fiber) !== fiber)
      throw Error(formatProdErrorMessage(188));
  }
  function findCurrentFiberUsingSlowPath(fiber) {
    var alternate = fiber.alternate;
    if (!alternate) {
      alternate = getNearestMountedFiber(fiber);
      if (alternate === null)
        throw Error(formatProdErrorMessage(188));
      return alternate !== fiber ? null : fiber;
    }
    for (var a = fiber, b = alternate;; ) {
      var parentA = a.return;
      if (parentA === null)
        break;
      var parentB = parentA.alternate;
      if (parentB === null) {
        b = parentA.return;
        if (b !== null) {
          a = b;
          continue;
        }
        break;
      }
      if (parentA.child === parentB.child) {
        for (parentB = parentA.child;parentB; ) {
          if (parentB === a)
            return assertIsMounted(parentA), fiber;
          if (parentB === b)
            return assertIsMounted(parentA), alternate;
          parentB = parentB.sibling;
        }
        throw Error(formatProdErrorMessage(188));
      }
      if (a.return !== b.return)
        a = parentA, b = parentB;
      else {
        for (var didFindChild = false, child$0 = parentA.child;child$0; ) {
          if (child$0 === a) {
            didFindChild = true;
            a = parentA;
            b = parentB;
            break;
          }
          if (child$0 === b) {
            didFindChild = true;
            b = parentA;
            a = parentB;
            break;
          }
          child$0 = child$0.sibling;
        }
        if (!didFindChild) {
          for (child$0 = parentB.child;child$0; ) {
            if (child$0 === a) {
              didFindChild = true;
              a = parentB;
              b = parentA;
              break;
            }
            if (child$0 === b) {
              didFindChild = true;
              b = parentB;
              a = parentA;
              break;
            }
            child$0 = child$0.sibling;
          }
          if (!didFindChild)
            throw Error(formatProdErrorMessage(189));
        }
      }
      if (a.alternate !== b)
        throw Error(formatProdErrorMessage(190));
    }
    if (a.tag !== 3)
      throw Error(formatProdErrorMessage(188));
    return a.stateNode.current === a ? fiber : alternate;
  }
  function findCurrentHostFiberImpl(node) {
    var tag = node.tag;
    if (tag === 5 || tag === 26 || tag === 27 || tag === 6)
      return node;
    for (node = node.child;node !== null; ) {
      tag = findCurrentHostFiberImpl(node);
      if (tag !== null)
        return tag;
      node = node.sibling;
    }
    return null;
  }
  var assign = Object.assign;
  var REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element");
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
  var REACT_PORTAL_TYPE = Symbol.for("react.portal");
  var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
  var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
  var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
  var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
  var REACT_CONTEXT_TYPE = Symbol.for("react.context");
  var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
  var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
  var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
  var REACT_MEMO_TYPE = Symbol.for("react.memo");
  var REACT_LAZY_TYPE = Symbol.for("react.lazy");
  Symbol.for("react.scope");
  var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
  Symbol.for("react.legacy_hidden");
  Symbol.for("react.tracing_marker");
  var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
  Symbol.for("react.view_transition");
  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
  function getIteratorFn(maybeIterable) {
    if (maybeIterable === null || typeof maybeIterable !== "object")
      return null;
    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
    return typeof maybeIterable === "function" ? maybeIterable : null;
  }
  var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
  function getComponentNameFromType(type) {
    if (type == null)
      return null;
    if (typeof type === "function")
      return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
    if (typeof type === "string")
      return type;
    switch (type) {
      case REACT_FRAGMENT_TYPE:
        return "Fragment";
      case REACT_PROFILER_TYPE:
        return "Profiler";
      case REACT_STRICT_MODE_TYPE:
        return "StrictMode";
      case REACT_SUSPENSE_TYPE:
        return "Suspense";
      case REACT_SUSPENSE_LIST_TYPE:
        return "SuspenseList";
      case REACT_ACTIVITY_TYPE:
        return "Activity";
    }
    if (typeof type === "object")
      switch (type.$$typeof) {
        case REACT_PORTAL_TYPE:
          return "Portal";
        case REACT_CONTEXT_TYPE:
          return (type.displayName || "Context") + ".Provider";
        case REACT_CONSUMER_TYPE:
          return (type._context.displayName || "Context") + ".Consumer";
        case REACT_FORWARD_REF_TYPE:
          var innerType = type.render;
          type = type.displayName;
          type || (type = innerType.displayName || innerType.name || "", type = type !== "" ? "ForwardRef(" + type + ")" : "ForwardRef");
          return type;
        case REACT_MEMO_TYPE:
          return innerType = type.displayName || null, innerType !== null ? innerType : getComponentNameFromType(type.type) || "Memo";
        case REACT_LAZY_TYPE:
          innerType = type._payload;
          type = type._init;
          try {
            return getComponentNameFromType(type(innerType));
          } catch (x) {}
      }
    return null;
  }
  var isArrayImpl = Array.isArray;
  var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
  var sharedNotPendingObject = {
    pending: false,
    data: null,
    method: null,
    action: null
  };
  var valueStack = [];
  var index = -1;
  function createCursor(defaultValue) {
    return { current: defaultValue };
  }
  function pop(cursor) {
    0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
  }
  function push(cursor, value) {
    index++;
    valueStack[index] = cursor.current;
    cursor.current = value;
  }
  var contextStackCursor = createCursor(null);
  var contextFiberStackCursor = createCursor(null);
  var rootInstanceStackCursor = createCursor(null);
  var hostTransitionProviderCursor = createCursor(null);
  function pushHostContainer(fiber, nextRootInstance) {
    push(rootInstanceStackCursor, nextRootInstance);
    push(contextFiberStackCursor, fiber);
    push(contextStackCursor, null);
    switch (nextRootInstance.nodeType) {
      case 9:
      case 11:
        fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
        break;
      default:
        if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI)
          nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
        else
          switch (fiber) {
            case "svg":
              fiber = 1;
              break;
            case "math":
              fiber = 2;
              break;
            default:
              fiber = 0;
          }
    }
    pop(contextStackCursor);
    push(contextStackCursor, fiber);
  }
  function popHostContainer() {
    pop(contextStackCursor);
    pop(contextFiberStackCursor);
    pop(rootInstanceStackCursor);
  }
  function pushHostContext(fiber) {
    fiber.memoizedState !== null && push(hostTransitionProviderCursor, fiber);
    var context = contextStackCursor.current;
    var JSCompiler_inline_result = getChildHostContextProd(context, fiber.type);
    context !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
  }
  function popHostContext(fiber) {
    contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
    hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var scheduleCallback$3 = Scheduler.unstable_scheduleCallback;
  var cancelCallback$1 = Scheduler.unstable_cancelCallback;
  var shouldYield = Scheduler.unstable_shouldYield;
  var requestPaint = Scheduler.unstable_requestPaint;
  var now = Scheduler.unstable_now;
  var getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
  var ImmediatePriority = Scheduler.unstable_ImmediatePriority;
  var UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
  var NormalPriority$1 = Scheduler.unstable_NormalPriority;
  var LowPriority = Scheduler.unstable_LowPriority;
  var IdlePriority = Scheduler.unstable_IdlePriority;
  var log$1 = Scheduler.log;
  var unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
  var rendererID = null;
  var injectedHook = null;
  function setIsStrictModeForDevtools(newIsStrictMode) {
    typeof log$1 === "function" && unstable_setDisableYieldValue(newIsStrictMode);
    if (injectedHook && typeof injectedHook.setStrictMode === "function")
      try {
        injectedHook.setStrictMode(rendererID, newIsStrictMode);
      } catch (err) {}
  }
  var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
  var log = Math.log;
  var LN2 = Math.LN2;
  function clz32Fallback(x) {
    x >>>= 0;
    return x === 0 ? 32 : 31 - (log(x) / LN2 | 0) | 0;
  }
  var nextTransitionLane = 256;
  var nextRetryLane = 4194304;
  function getHighestPriorityLanes(lanes) {
    var pendingSyncLanes = lanes & 42;
    if (pendingSyncLanes !== 0)
      return pendingSyncLanes;
    switch (lanes & -lanes) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
        return 64;
      case 128:
        return 128;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return lanes & 4194048;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return lanes & 62914560;
      case 67108864:
        return 67108864;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 0;
      default:
        return lanes;
    }
  }
  function getNextLanes(root2, wipLanes, rootHasPendingCommit) {
    var pendingLanes = root2.pendingLanes;
    if (pendingLanes === 0)
      return 0;
    var nextLanes = 0, suspendedLanes = root2.suspendedLanes, pingedLanes = root2.pingedLanes;
    root2 = root2.warmLanes;
    var nonIdlePendingLanes = pendingLanes & 134217727;
    nonIdlePendingLanes !== 0 ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, pendingLanes !== 0 ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, pingedLanes !== 0 ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root2, rootHasPendingCommit !== 0 && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, nonIdlePendingLanes !== 0 ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : pingedLanes !== 0 ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root2, rootHasPendingCommit !== 0 && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
    return nextLanes === 0 ? 0 : wipLanes !== 0 && wipLanes !== nextLanes && (wipLanes & suspendedLanes) === 0 && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || suspendedLanes === 32 && (rootHasPendingCommit & 4194048) !== 0) ? wipLanes : nextLanes;
  }
  function checkIfRootIsPrerendering(root2, renderLanes2) {
    return (root2.pendingLanes & ~(root2.suspendedLanes & ~root2.pingedLanes) & renderLanes2) === 0;
  }
  function computeExpirationTime(lane, currentTime) {
    switch (lane) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 64:
        return currentTime + 250;
      case 16:
      case 32:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return currentTime + 5000;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        return -1;
      case 67108864:
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function claimNextTransitionLane() {
    var lane = nextTransitionLane;
    nextTransitionLane <<= 1;
    (nextTransitionLane & 4194048) === 0 && (nextTransitionLane = 256);
    return lane;
  }
  function claimNextRetryLane() {
    var lane = nextRetryLane;
    nextRetryLane <<= 1;
    (nextRetryLane & 62914560) === 0 && (nextRetryLane = 4194304);
    return lane;
  }
  function createLaneMap(initial) {
    for (var laneMap = [], i = 0;31 > i; i++)
      laneMap.push(initial);
    return laneMap;
  }
  function markRootUpdated$1(root2, updateLane) {
    root2.pendingLanes |= updateLane;
    updateLane !== 268435456 && (root2.suspendedLanes = 0, root2.pingedLanes = 0, root2.warmLanes = 0);
  }
  function markRootFinished(root2, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
    var previouslyPendingLanes = root2.pendingLanes;
    root2.pendingLanes = remainingLanes;
    root2.suspendedLanes = 0;
    root2.pingedLanes = 0;
    root2.warmLanes = 0;
    root2.expiredLanes &= remainingLanes;
    root2.entangledLanes &= remainingLanes;
    root2.errorRecoveryDisabledLanes &= remainingLanes;
    root2.shellSuspendCounter = 0;
    var { entanglements, expirationTimes, hiddenUpdates } = root2;
    for (remainingLanes = previouslyPendingLanes & ~remainingLanes;0 < remainingLanes; ) {
      var index$5 = 31 - clz32(remainingLanes), lane = 1 << index$5;
      entanglements[index$5] = 0;
      expirationTimes[index$5] = -1;
      var hiddenUpdatesForLane = hiddenUpdates[index$5];
      if (hiddenUpdatesForLane !== null)
        for (hiddenUpdates[index$5] = null, index$5 = 0;index$5 < hiddenUpdatesForLane.length; index$5++) {
          var update = hiddenUpdatesForLane[index$5];
          update !== null && (update.lane &= -536870913);
        }
      remainingLanes &= ~lane;
    }
    spawnedLane !== 0 && markSpawnedDeferredLane(root2, spawnedLane, 0);
    suspendedRetryLanes !== 0 && updatedLanes === 0 && root2.tag !== 0 && (root2.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
  }
  function markSpawnedDeferredLane(root2, spawnedLane, entangledLanes) {
    root2.pendingLanes |= spawnedLane;
    root2.suspendedLanes &= ~spawnedLane;
    var spawnedLaneIndex = 31 - clz32(spawnedLane);
    root2.entangledLanes |= spawnedLane;
    root2.entanglements[spawnedLaneIndex] = root2.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 4194090;
  }
  function markRootEntangled(root2, entangledLanes) {
    var rootEntangledLanes = root2.entangledLanes |= entangledLanes;
    for (root2 = root2.entanglements;rootEntangledLanes; ) {
      var index$6 = 31 - clz32(rootEntangledLanes), lane = 1 << index$6;
      lane & entangledLanes | root2[index$6] & entangledLanes && (root2[index$6] |= entangledLanes);
      rootEntangledLanes &= ~lane;
    }
  }
  function getBumpedLaneForHydrationByLane(lane) {
    switch (lane) {
      case 2:
        lane = 1;
        break;
      case 8:
        lane = 4;
        break;
      case 32:
        lane = 16;
        break;
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
        lane = 128;
        break;
      case 268435456:
        lane = 134217728;
        break;
      default:
        lane = 0;
    }
    return lane;
  }
  function lanesToEventPriority(lanes) {
    lanes &= -lanes;
    return 2 < lanes ? 8 < lanes ? (lanes & 134217727) !== 0 ? 32 : 268435456 : 8 : 2;
  }
  function resolveUpdatePriority() {
    var updatePriority = ReactDOMSharedInternals.p;
    if (updatePriority !== 0)
      return updatePriority;
    updatePriority = window.event;
    return updatePriority === undefined ? 32 : getEventPriority(updatePriority.type);
  }
  function runWithPriority(priority, fn) {
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      return ReactDOMSharedInternals.p = priority, fn();
    } finally {
      ReactDOMSharedInternals.p = previousPriority;
    }
  }
  var randomKey = Math.random().toString(36).slice(2);
  var internalInstanceKey = "__reactFiber$" + randomKey;
  var internalPropsKey = "__reactProps$" + randomKey;
  var internalContainerInstanceKey = "__reactContainer$" + randomKey;
  var internalEventHandlersKey = "__reactEvents$" + randomKey;
  var internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
  var internalEventHandlesSetKey = "__reactHandles$" + randomKey;
  var internalRootNodeResourcesKey = "__reactResources$" + randomKey;
  var internalHoistableMarker = "__reactMarker$" + randomKey;
  function detachDeletedInstance(node) {
    delete node[internalInstanceKey];
    delete node[internalPropsKey];
    delete node[internalEventHandlersKey];
    delete node[internalEventHandlerListenersKey];
    delete node[internalEventHandlesSetKey];
  }
  function getClosestInstanceFromNode(targetNode) {
    var targetInst = targetNode[internalInstanceKey];
    if (targetInst)
      return targetInst;
    for (var parentNode = targetNode.parentNode;parentNode; ) {
      if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
        parentNode = targetInst.alternate;
        if (targetInst.child !== null || parentNode !== null && parentNode.child !== null)
          for (targetNode = getParentSuspenseInstance(targetNode);targetNode !== null; ) {
            if (parentNode = targetNode[internalInstanceKey])
              return parentNode;
            targetNode = getParentSuspenseInstance(targetNode);
          }
        return targetInst;
      }
      targetNode = parentNode;
      parentNode = targetNode.parentNode;
    }
    return null;
  }
  function getInstanceFromNode(node) {
    if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
      var tag = node.tag;
      if (tag === 5 || tag === 6 || tag === 13 || tag === 26 || tag === 27 || tag === 3)
        return node;
    }
    return null;
  }
  function getNodeFromInstance(inst) {
    var tag = inst.tag;
    if (tag === 5 || tag === 26 || tag === 27 || tag === 6)
      return inst.stateNode;
    throw Error(formatProdErrorMessage(33));
  }
  function getResourcesFromRoot(root2) {
    var resources = root2[internalRootNodeResourcesKey];
    resources || (resources = root2[internalRootNodeResourcesKey] = { hoistableStyles: new Map, hoistableScripts: new Map });
    return resources;
  }
  function markNodeAsHoistable(node) {
    node[internalHoistableMarker] = true;
  }
  var allNativeEvents = new Set;
  var registrationNameDependencies = {};
  function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    registerDirectEvent(registrationName + "Capture", dependencies);
  }
  function registerDirectEvent(registrationName, dependencies) {
    registrationNameDependencies[registrationName] = dependencies;
    for (registrationName = 0;registrationName < dependencies.length; registrationName++)
      allNativeEvents.add(dependencies[registrationName]);
  }
  var VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$");
  var illegalAttributeNameCache = {};
  var validatedAttributeNameCache = {};
  function isAttributeNameSafe(attributeName) {
    if (hasOwnProperty.call(validatedAttributeNameCache, attributeName))
      return true;
    if (hasOwnProperty.call(illegalAttributeNameCache, attributeName))
      return false;
    if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName))
      return validatedAttributeNameCache[attributeName] = true;
    illegalAttributeNameCache[attributeName] = true;
    return false;
  }
  function setValueForAttribute(node, name, value) {
    if (isAttributeNameSafe(name))
      if (value === null)
        node.removeAttribute(name);
      else {
        switch (typeof value) {
          case "undefined":
          case "function":
          case "symbol":
            node.removeAttribute(name);
            return;
          case "boolean":
            var prefix$8 = name.toLowerCase().slice(0, 5);
            if (prefix$8 !== "data-" && prefix$8 !== "aria-") {
              node.removeAttribute(name);
              return;
            }
        }
        node.setAttribute(name, "" + value);
      }
  }
  function setValueForKnownAttribute(node, name, value) {
    if (value === null)
      node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          node.removeAttribute(name);
          return;
      }
      node.setAttribute(name, "" + value);
    }
  }
  function setValueForNamespacedAttribute(node, namespace, name, value) {
    if (value === null)
      node.removeAttribute(name);
    else {
      switch (typeof value) {
        case "undefined":
        case "function":
        case "symbol":
        case "boolean":
          node.removeAttribute(name);
          return;
      }
      node.setAttributeNS(namespace, name, "" + value);
    }
  }
  var prefix;
  var suffix;
  function describeBuiltInComponentFrame(name) {
    if (prefix === undefined)
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || "";
        suffix = -1 < x.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
      }
    return `
` + prefix + name + suffix;
  }
  var reentry = false;
  function describeNativeComponentFrame(fn, construct) {
    if (!fn || reentry)
      return "";
    reentry = true;
    var previousPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = undefined;
    try {
      var RunInRootFrame = {
        DetermineComponentFrameRoot: function() {
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  var control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x$9) {
                  control = x$9;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x$10) {
                control = x$10;
              }
              (Fake = fn()) && typeof Fake.catch === "function" && Fake.catch(function() {});
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string")
              return [sample.stack, control.stack];
          }
          return [null, null];
        }
      };
      RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
      var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
      namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
      var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
      if (sampleStack && controlStack) {
        var sampleLines = sampleStack.split(`
`), controlLines = controlStack.split(`
`);
        for (namePropDescriptor = RunInRootFrame = 0;RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
          RunInRootFrame++;
        for (;namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot"); )
          namePropDescriptor++;
        if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
          for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1;1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
            namePropDescriptor--;
        for (;1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
          if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
            if (RunInRootFrame !== 1 || namePropDescriptor !== 1) {
              do
                if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
                  var frame = `
` + sampleLines[RunInRootFrame].replace(" at new ", " at ");
                  fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
                  return frame;
                }
              while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
            }
            break;
          }
      }
    } finally {
      reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
    }
    return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
  }
  function describeFiber(fiber) {
    switch (fiber.tag) {
      case 26:
      case 27:
      case 5:
        return describeBuiltInComponentFrame(fiber.type);
      case 16:
        return describeBuiltInComponentFrame("Lazy");
      case 13:
        return describeBuiltInComponentFrame("Suspense");
      case 19:
        return describeBuiltInComponentFrame("SuspenseList");
      case 0:
      case 15:
        return describeNativeComponentFrame(fiber.type, false);
      case 11:
        return describeNativeComponentFrame(fiber.type.render, false);
      case 1:
        return describeNativeComponentFrame(fiber.type, true);
      case 31:
        return describeBuiltInComponentFrame("Activity");
      default:
        return "";
    }
  }
  function getStackByFiberInDevAndProd(workInProgress2) {
    try {
      var info = "";
      do
        info += describeFiber(workInProgress2), workInProgress2 = workInProgress2.return;
      while (workInProgress2);
      return info;
    } catch (x) {
      return `
Error generating stack: ` + x.message + `
` + x.stack;
    }
  }
  function getToStringValue(value) {
    switch (typeof value) {
      case "bigint":
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return value;
      case "object":
        return value;
      default:
        return "";
    }
  }
  function isCheckable(elem) {
    var type = elem.type;
    return (elem = elem.nodeName) && elem.toLowerCase() === "input" && (type === "checkbox" || type === "radio");
  }
  function trackValueOnNode(node) {
    var valueField = isCheckable(node) ? "checked" : "value", descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField), currentValue = "" + node[valueField];
    if (!node.hasOwnProperty(valueField) && typeof descriptor !== "undefined" && typeof descriptor.get === "function" && typeof descriptor.set === "function") {
      var { get, set } = descriptor;
      Object.defineProperty(node, valueField, {
        configurable: true,
        get: function() {
          return get.call(this);
        },
        set: function(value) {
          currentValue = "" + value;
          set.call(this, value);
        }
      });
      Object.defineProperty(node, valueField, {
        enumerable: descriptor.enumerable
      });
      return {
        getValue: function() {
          return currentValue;
        },
        setValue: function(value) {
          currentValue = "" + value;
        },
        stopTracking: function() {
          node._valueTracker = null;
          delete node[valueField];
        }
      };
    }
  }
  function track(node) {
    node._valueTracker || (node._valueTracker = trackValueOnNode(node));
  }
  function updateValueIfChanged(node) {
    if (!node)
      return false;
    var tracker = node._valueTracker;
    if (!tracker)
      return true;
    var lastValue = tracker.getValue();
    var value = "";
    node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
    node = value;
    return node !== lastValue ? (tracker.setValue(node), true) : false;
  }
  function getActiveElement(doc) {
    doc = doc || (typeof document !== "undefined" ? document : undefined);
    if (typeof doc === "undefined")
      return null;
    try {
      return doc.activeElement || doc.body;
    } catch (e) {
      return doc.body;
    }
  }
  var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
  function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
    return value.replace(escapeSelectorAttributeValueInsideDoubleQuotesRegex, function(ch) {
      return "\\" + ch.charCodeAt(0).toString(16) + " ";
    });
  }
  function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
    element.name = "";
    type != null && typeof type !== "function" && typeof type !== "symbol" && typeof type !== "boolean" ? element.type = type : element.removeAttribute("type");
    if (value != null)
      if (type === "number") {
        if (value === 0 && element.value === "" || element.value != value)
          element.value = "" + getToStringValue(value);
      } else
        element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
    else
      type !== "submit" && type !== "reset" || element.removeAttribute("value");
    value != null ? setDefaultValue(element, type, getToStringValue(value)) : defaultValue != null ? setDefaultValue(element, type, getToStringValue(defaultValue)) : lastDefaultValue != null && element.removeAttribute("value");
    checked == null && defaultChecked != null && (element.defaultChecked = !!defaultChecked);
    checked != null && (element.checked = checked && typeof checked !== "function" && typeof checked !== "symbol");
    name != null && typeof name !== "function" && typeof name !== "symbol" && typeof name !== "boolean" ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
  }
  function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating2) {
    type != null && typeof type !== "function" && typeof type !== "symbol" && typeof type !== "boolean" && (element.type = type);
    if (value != null || defaultValue != null) {
      if (!(type !== "submit" && type !== "reset" || value !== undefined && value !== null))
        return;
      defaultValue = defaultValue != null ? "" + getToStringValue(defaultValue) : "";
      value = value != null ? "" + getToStringValue(value) : defaultValue;
      isHydrating2 || value === element.value || (element.value = value);
      element.defaultValue = value;
    }
    checked = checked != null ? checked : defaultChecked;
    checked = typeof checked !== "function" && typeof checked !== "symbol" && !!checked;
    element.checked = isHydrating2 ? element.checked : !!checked;
    element.defaultChecked = !!checked;
    name != null && typeof name !== "function" && typeof name !== "symbol" && typeof name !== "boolean" && (element.name = name);
  }
  function setDefaultValue(node, type, value) {
    type === "number" && getActiveElement(node.ownerDocument) === node || node.defaultValue === "" + value || (node.defaultValue = "" + value);
  }
  function updateOptions(node, multiple, propValue, setDefaultSelected) {
    node = node.options;
    if (multiple) {
      multiple = {};
      for (var i = 0;i < propValue.length; i++)
        multiple["$" + propValue[i]] = true;
      for (propValue = 0;propValue < node.length; propValue++)
        i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = true);
    } else {
      propValue = "" + getToStringValue(propValue);
      multiple = null;
      for (i = 0;i < node.length; i++) {
        if (node[i].value === propValue) {
          node[i].selected = true;
          setDefaultSelected && (node[i].defaultSelected = true);
          return;
        }
        multiple !== null || node[i].disabled || (multiple = node[i]);
      }
      multiple !== null && (multiple.selected = true);
    }
  }
  function updateTextarea(element, value, defaultValue) {
    if (value != null && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), defaultValue == null)) {
      element.defaultValue !== value && (element.defaultValue = value);
      return;
    }
    element.defaultValue = defaultValue != null ? "" + getToStringValue(defaultValue) : "";
  }
  function initTextarea(element, value, defaultValue, children) {
    if (value == null) {
      if (children != null) {
        if (defaultValue != null)
          throw Error(formatProdErrorMessage(92));
        if (isArrayImpl(children)) {
          if (1 < children.length)
            throw Error(formatProdErrorMessage(93));
          children = children[0];
        }
        defaultValue = children;
      }
      defaultValue == null && (defaultValue = "");
      value = defaultValue;
    }
    defaultValue = getToStringValue(value);
    element.defaultValue = defaultValue;
    children = element.textContent;
    children === defaultValue && children !== "" && children !== null && (element.value = children);
  }
  function setTextContent(node, text) {
    if (text) {
      var firstChild = node.firstChild;
      if (firstChild && firstChild === node.lastChild && firstChild.nodeType === 3) {
        firstChild.nodeValue = text;
        return;
      }
    }
    node.textContent = text;
  }
  var unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
  function setValueForStyle(style2, styleName, value) {
    var isCustomProperty = styleName.indexOf("--") === 0;
    value == null || typeof value === "boolean" || value === "" ? isCustomProperty ? style2.setProperty(styleName, "") : styleName === "float" ? style2.cssFloat = "" : style2[styleName] = "" : isCustomProperty ? style2.setProperty(styleName, value) : typeof value !== "number" || value === 0 || unitlessNumbers.has(styleName) ? styleName === "float" ? style2.cssFloat = value : style2[styleName] = ("" + value).trim() : style2[styleName] = value + "px";
  }
  function setValueForStyles(node, styles, prevStyles) {
    if (styles != null && typeof styles !== "object")
      throw Error(formatProdErrorMessage(62));
    node = node.style;
    if (prevStyles != null) {
      for (var styleName in prevStyles)
        !prevStyles.hasOwnProperty(styleName) || styles != null && styles.hasOwnProperty(styleName) || (styleName.indexOf("--") === 0 ? node.setProperty(styleName, "") : styleName === "float" ? node.cssFloat = "" : node[styleName] = "");
      for (var styleName$16 in styles)
        styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && setValueForStyle(node, styleName$16, styleName);
    } else
      for (var styleName$17 in styles)
        styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
  }
  function isCustomElement(tagName) {
    if (tagName.indexOf("-") === -1)
      return false;
    switch (tagName) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return false;
      default:
        return true;
    }
  }
  var aliases = new Map([
    ["acceptCharset", "accept-charset"],
    ["htmlFor", "for"],
    ["httpEquiv", "http-equiv"],
    ["crossOrigin", "crossorigin"],
    ["accentHeight", "accent-height"],
    ["alignmentBaseline", "alignment-baseline"],
    ["arabicForm", "arabic-form"],
    ["baselineShift", "baseline-shift"],
    ["capHeight", "cap-height"],
    ["clipPath", "clip-path"],
    ["clipRule", "clip-rule"],
    ["colorInterpolation", "color-interpolation"],
    ["colorInterpolationFilters", "color-interpolation-filters"],
    ["colorProfile", "color-profile"],
    ["colorRendering", "color-rendering"],
    ["dominantBaseline", "dominant-baseline"],
    ["enableBackground", "enable-background"],
    ["fillOpacity", "fill-opacity"],
    ["fillRule", "fill-rule"],
    ["floodColor", "flood-color"],
    ["floodOpacity", "flood-opacity"],
    ["fontFamily", "font-family"],
    ["fontSize", "font-size"],
    ["fontSizeAdjust", "font-size-adjust"],
    ["fontStretch", "font-stretch"],
    ["fontStyle", "font-style"],
    ["fontVariant", "font-variant"],
    ["fontWeight", "font-weight"],
    ["glyphName", "glyph-name"],
    ["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
    ["glyphOrientationVertical", "glyph-orientation-vertical"],
    ["horizAdvX", "horiz-adv-x"],
    ["horizOriginX", "horiz-origin-x"],
    ["imageRendering", "image-rendering"],
    ["letterSpacing", "letter-spacing"],
    ["lightingColor", "lighting-color"],
    ["markerEnd", "marker-end"],
    ["markerMid", "marker-mid"],
    ["markerStart", "marker-start"],
    ["overlinePosition", "overline-position"],
    ["overlineThickness", "overline-thickness"],
    ["paintOrder", "paint-order"],
    ["panose-1", "panose-1"],
    ["pointerEvents", "pointer-events"],
    ["renderingIntent", "rendering-intent"],
    ["shapeRendering", "shape-rendering"],
    ["stopColor", "stop-color"],
    ["stopOpacity", "stop-opacity"],
    ["strikethroughPosition", "strikethrough-position"],
    ["strikethroughThickness", "strikethrough-thickness"],
    ["strokeDasharray", "stroke-dasharray"],
    ["strokeDashoffset", "stroke-dashoffset"],
    ["strokeLinecap", "stroke-linecap"],
    ["strokeLinejoin", "stroke-linejoin"],
    ["strokeMiterlimit", "stroke-miterlimit"],
    ["strokeOpacity", "stroke-opacity"],
    ["strokeWidth", "stroke-width"],
    ["textAnchor", "text-anchor"],
    ["textDecoration", "text-decoration"],
    ["textRendering", "text-rendering"],
    ["transformOrigin", "transform-origin"],
    ["underlinePosition", "underline-position"],
    ["underlineThickness", "underline-thickness"],
    ["unicodeBidi", "unicode-bidi"],
    ["unicodeRange", "unicode-range"],
    ["unitsPerEm", "units-per-em"],
    ["vAlphabetic", "v-alphabetic"],
    ["vHanging", "v-hanging"],
    ["vIdeographic", "v-ideographic"],
    ["vMathematical", "v-mathematical"],
    ["vectorEffect", "vector-effect"],
    ["vertAdvY", "vert-adv-y"],
    ["vertOriginX", "vert-origin-x"],
    ["vertOriginY", "vert-origin-y"],
    ["wordSpacing", "word-spacing"],
    ["writingMode", "writing-mode"],
    ["xmlnsXlink", "xmlns:xlink"],
    ["xHeight", "x-height"]
  ]);
  var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
  function sanitizeURL(url) {
    return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
  }
  var currentReplayingEvent = null;
  function getEventTarget(nativeEvent) {
    nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
    nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
    return nativeEvent.nodeType === 3 ? nativeEvent.parentNode : nativeEvent;
  }
  var restoreTarget = null;
  var restoreQueue = null;
  function restoreStateOfTarget(target) {
    var internalInstance = getInstanceFromNode(target);
    if (internalInstance && (target = internalInstance.stateNode)) {
      var props = target[internalPropsKey] || null;
      a:
        switch (target = internalInstance.stateNode, internalInstance.type) {
          case "input":
            updateInput(target, props.value, props.defaultValue, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name);
            internalInstance = props.name;
            if (props.type === "radio" && internalInstance != null) {
              for (props = target;props.parentNode; )
                props = props.parentNode;
              props = props.querySelectorAll('input[name="' + escapeSelectorAttributeValueInsideDoubleQuotes("" + internalInstance) + '"][type="radio"]');
              for (internalInstance = 0;internalInstance < props.length; internalInstance++) {
                var otherNode = props[internalInstance];
                if (otherNode !== target && otherNode.form === target.form) {
                  var otherProps = otherNode[internalPropsKey] || null;
                  if (!otherProps)
                    throw Error(formatProdErrorMessage(90));
                  updateInput(otherNode, otherProps.value, otherProps.defaultValue, otherProps.defaultValue, otherProps.checked, otherProps.defaultChecked, otherProps.type, otherProps.name);
                }
              }
              for (internalInstance = 0;internalInstance < props.length; internalInstance++)
                otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
            }
            break a;
          case "textarea":
            updateTextarea(target, props.value, props.defaultValue);
            break a;
          case "select":
            internalInstance = props.value, internalInstance != null && updateOptions(target, !!props.multiple, internalInstance, false);
        }
    }
  }
  var isInsideEventHandler = false;
  function batchedUpdates$1(fn, a, b) {
    if (isInsideEventHandler)
      return fn(a, b);
    isInsideEventHandler = true;
    try {
      var JSCompiler_inline_result = fn(a);
      return JSCompiler_inline_result;
    } finally {
      if (isInsideEventHandler = false, restoreTarget !== null || restoreQueue !== null) {
        if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn))
          for (a = 0;a < fn.length; a++)
            restoreStateOfTarget(fn[a]);
      }
    }
  }
  function getListener(inst, registrationName) {
    var stateNode = inst.stateNode;
    if (stateNode === null)
      return null;
    var props = stateNode[internalPropsKey] || null;
    if (props === null)
      return null;
    stateNode = props[registrationName];
    a:
      switch (registrationName) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          (props = !props.disabled) || (inst = inst.type, props = !(inst === "button" || inst === "input" || inst === "select" || inst === "textarea"));
          inst = !props;
          break a;
        default:
          inst = false;
      }
    if (inst)
      return null;
    if (stateNode && typeof stateNode !== "function")
      throw Error(formatProdErrorMessage(231, registrationName, typeof stateNode));
    return stateNode;
  }
  var canUseDOM = !(typeof window === "undefined" || typeof window.document === "undefined" || typeof window.document.createElement === "undefined");
  var passiveBrowserEventsSupported = false;
  if (canUseDOM)
    try {
      options = {};
      Object.defineProperty(options, "passive", {
        get: function() {
          passiveBrowserEventsSupported = true;
        }
      });
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (e) {
      passiveBrowserEventsSupported = false;
    }
  var options;
  var root = null;
  var startText = null;
  var fallbackText = null;
  function getData() {
    if (fallbackText)
      return fallbackText;
    var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
    for (start = 0;start < startLength && startValue[start] === endValue[start]; start++)
      ;
    var minEnd = startLength - start;
    for (end = 1;end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++)
      ;
    return fallbackText = endValue.slice(start, 1 < end ? 1 - end : undefined);
  }
  function getEventCharCode(nativeEvent) {
    var keyCode = nativeEvent.keyCode;
    "charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, nativeEvent === 0 && keyCode === 13 && (nativeEvent = 13)) : nativeEvent = keyCode;
    nativeEvent === 10 && (nativeEvent = 13);
    return 32 <= nativeEvent || nativeEvent === 13 ? nativeEvent : 0;
  }
  function functionThatReturnsTrue() {
    return true;
  }
  function functionThatReturnsFalse() {
    return false;
  }
  function createSyntheticEvent(Interface) {
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
      this._reactName = reactName;
      this._targetInst = targetInst;
      this.type = reactEventType;
      this.nativeEvent = nativeEvent;
      this.target = nativeEventTarget;
      this.currentTarget = null;
      for (var propName in Interface)
        Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
      this.isDefaultPrevented = (nativeEvent.defaultPrevented != null ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false) ? functionThatReturnsTrue : functionThatReturnsFalse;
      this.isPropagationStopped = functionThatReturnsFalse;
      return this;
    }
    assign(SyntheticBaseEvent.prototype, {
      preventDefault: function() {
        this.defaultPrevented = true;
        var event = this.nativeEvent;
        event && (event.preventDefault ? event.preventDefault() : typeof event.returnValue !== "unknown" && (event.returnValue = false), this.isDefaultPrevented = functionThatReturnsTrue);
      },
      stopPropagation: function() {
        var event = this.nativeEvent;
        event && (event.stopPropagation ? event.stopPropagation() : typeof event.cancelBubble !== "unknown" && (event.cancelBubble = true), this.isPropagationStopped = functionThatReturnsTrue);
      },
      persist: function() {},
      isPersistent: functionThatReturnsTrue
    });
    return SyntheticBaseEvent;
  }
  var EventInterface = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function(event) {
      return event.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0
  };
  var SyntheticEvent = createSyntheticEvent(EventInterface);
  var UIEventInterface = assign({}, EventInterface, { view: 0, detail: 0 });
  var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
  var lastMovementX;
  var lastMovementY;
  var lastMouseEvent;
  var MouseEventInterface = assign({}, UIEventInterface, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: getEventModifierState,
    button: 0,
    buttons: 0,
    relatedTarget: function(event) {
      return event.relatedTarget === undefined ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
    },
    movementX: function(event) {
      if ("movementX" in event)
        return event.movementX;
      event !== lastMouseEvent && (lastMouseEvent && event.type === "mousemove" ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
      return lastMovementX;
    },
    movementY: function(event) {
      return "movementY" in event ? event.movementY : lastMovementY;
    }
  });
  var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
  var DragEventInterface = assign({}, MouseEventInterface, { dataTransfer: 0 });
  var SyntheticDragEvent = createSyntheticEvent(DragEventInterface);
  var FocusEventInterface = assign({}, UIEventInterface, { relatedTarget: 0 });
  var SyntheticFocusEvent = createSyntheticEvent(FocusEventInterface);
  var AnimationEventInterface = assign({}, EventInterface, {
    animationName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  });
  var SyntheticAnimationEvent = createSyntheticEvent(AnimationEventInterface);
  var ClipboardEventInterface = assign({}, EventInterface, {
    clipboardData: function(event) {
      return "clipboardData" in event ? event.clipboardData : window.clipboardData;
    }
  });
  var SyntheticClipboardEvent = createSyntheticEvent(ClipboardEventInterface);
  var CompositionEventInterface = assign({}, EventInterface, { data: 0 });
  var SyntheticCompositionEvent = createSyntheticEvent(CompositionEventInterface);
  var normalizeKey = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  };
  var translateToKey = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  };
  var modifierKeyToProp = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey"
  };
  function modifierStateGetter(keyArg) {
    var nativeEvent = this.nativeEvent;
    return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : false;
  }
  function getEventModifierState() {
    return modifierStateGetter;
  }
  var KeyboardEventInterface = assign({}, UIEventInterface, {
    key: function(nativeEvent) {
      if (nativeEvent.key) {
        var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
        if (key !== "Unidentified")
          return key;
      }
      return nativeEvent.type === "keypress" ? (nativeEvent = getEventCharCode(nativeEvent), nativeEvent === 13 ? "Enter" : String.fromCharCode(nativeEvent)) : nativeEvent.type === "keydown" || nativeEvent.type === "keyup" ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: getEventModifierState,
    charCode: function(event) {
      return event.type === "keypress" ? getEventCharCode(event) : 0;
    },
    keyCode: function(event) {
      return event.type === "keydown" || event.type === "keyup" ? event.keyCode : 0;
    },
    which: function(event) {
      return event.type === "keypress" ? getEventCharCode(event) : event.type === "keydown" || event.type === "keyup" ? event.keyCode : 0;
    }
  });
  var SyntheticKeyboardEvent = createSyntheticEvent(KeyboardEventInterface);
  var PointerEventInterface = assign({}, MouseEventInterface, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0
  });
  var SyntheticPointerEvent = createSyntheticEvent(PointerEventInterface);
  var TouchEventInterface = assign({}, UIEventInterface, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: getEventModifierState
  });
  var SyntheticTouchEvent = createSyntheticEvent(TouchEventInterface);
  var TransitionEventInterface = assign({}, EventInterface, {
    propertyName: 0,
    elapsedTime: 0,
    pseudoElement: 0
  });
  var SyntheticTransitionEvent = createSyntheticEvent(TransitionEventInterface);
  var WheelEventInterface = assign({}, MouseEventInterface, {
    deltaX: function(event) {
      return "deltaX" in event ? event.deltaX : ("wheelDeltaX" in event) ? -event.wheelDeltaX : 0;
    },
    deltaY: function(event) {
      return "deltaY" in event ? event.deltaY : ("wheelDeltaY" in event) ? -event.wheelDeltaY : ("wheelDelta" in event) ? -event.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  });
  var SyntheticWheelEvent = createSyntheticEvent(WheelEventInterface);
  var ToggleEventInterface = assign({}, EventInterface, {
    newState: 0,
    oldState: 0
  });
  var SyntheticToggleEvent = createSyntheticEvent(ToggleEventInterface);
  var END_KEYCODES = [9, 13, 27, 32];
  var canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
  var documentMode = null;
  canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
  var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
  var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode);
  var SPACEBAR_CHAR = String.fromCharCode(32);
  var hasSpaceKeypress = false;
  function isFallbackCompositionEnd(domEventName, nativeEvent) {
    switch (domEventName) {
      case "keyup":
        return END_KEYCODES.indexOf(nativeEvent.keyCode) !== -1;
      case "keydown":
        return nativeEvent.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return true;
      default:
        return false;
    }
  }
  function getDataFromCustomEvent(nativeEvent) {
    nativeEvent = nativeEvent.detail;
    return typeof nativeEvent === "object" && "data" in nativeEvent ? nativeEvent.data : null;
  }
  var isComposing = false;
  function getNativeBeforeInputChars(domEventName, nativeEvent) {
    switch (domEventName) {
      case "compositionend":
        return getDataFromCustomEvent(nativeEvent);
      case "keypress":
        if (nativeEvent.which !== 32)
          return null;
        hasSpaceKeypress = true;
        return SPACEBAR_CHAR;
      case "textInput":
        return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
      default:
        return null;
    }
  }
  function getFallbackBeforeInputChars(domEventName, nativeEvent) {
    if (isComposing)
      return domEventName === "compositionend" || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = false, domEventName) : null;
    switch (domEventName) {
      case "paste":
        return null;
      case "keypress":
        if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
          if (nativeEvent.char && 1 < nativeEvent.char.length)
            return nativeEvent.char;
          if (nativeEvent.which)
            return String.fromCharCode(nativeEvent.which);
        }
        return null;
      case "compositionend":
        return useFallbackCompositionData && nativeEvent.locale !== "ko" ? null : nativeEvent.data;
      default:
        return null;
    }
  }
  var supportedInputTypes = {
    color: true,
    date: true,
    datetime: true,
    "datetime-local": true,
    email: true,
    month: true,
    number: true,
    password: true,
    range: true,
    search: true,
    tel: true,
    text: true,
    time: true,
    url: true,
    week: true
  };
  function isTextInputElement(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName === "input" ? !!supportedInputTypes[elem.type] : nodeName === "textarea" ? true : false;
  }
  function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
    restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
    inst = accumulateTwoPhaseListeners(inst, "onChange");
    0 < inst.length && (nativeEvent = new SyntheticEvent("onChange", "change", null, nativeEvent, target), dispatchQueue.push({ event: nativeEvent, listeners: inst }));
  }
  var activeElement$1 = null;
  var activeElementInst$1 = null;
  function runEventInBatch(dispatchQueue) {
    processDispatchQueue(dispatchQueue, 0);
  }
  function getInstIfValueChanged(targetInst) {
    var targetNode = getNodeFromInstance(targetInst);
    if (updateValueIfChanged(targetNode))
      return targetInst;
  }
  function getTargetInstForChangeEvent(domEventName, targetInst) {
    if (domEventName === "change")
      return targetInst;
  }
  var isInputEventSupported = false;
  if (canUseDOM) {
    if (canUseDOM) {
      isSupported$jscomp$inline_417 = "oninput" in document;
      if (!isSupported$jscomp$inline_417) {
        element$jscomp$inline_418 = document.createElement("div");
        element$jscomp$inline_418.setAttribute("oninput", "return;");
        isSupported$jscomp$inline_417 = typeof element$jscomp$inline_418.oninput === "function";
      }
      JSCompiler_inline_result$jscomp$282 = isSupported$jscomp$inline_417;
    } else
      JSCompiler_inline_result$jscomp$282 = false;
    isInputEventSupported = JSCompiler_inline_result$jscomp$282 && (!document.documentMode || 9 < document.documentMode);
  }
  var JSCompiler_inline_result$jscomp$282;
  var isSupported$jscomp$inline_417;
  var element$jscomp$inline_418;
  function stopWatchingForValueChange() {
    activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
  }
  function handlePropertyChange(nativeEvent) {
    if (nativeEvent.propertyName === "value" && getInstIfValueChanged(activeElementInst$1)) {
      var dispatchQueue = [];
      createAndAccumulateChangeEvent(dispatchQueue, activeElementInst$1, nativeEvent, getEventTarget(nativeEvent));
      batchedUpdates$1(runEventInBatch, dispatchQueue);
    }
  }
  function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
    domEventName === "focusin" ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : domEventName === "focusout" && stopWatchingForValueChange();
  }
  function getTargetInstForInputEventPolyfill(domEventName) {
    if (domEventName === "selectionchange" || domEventName === "keyup" || domEventName === "keydown")
      return getInstIfValueChanged(activeElementInst$1);
  }
  function getTargetInstForClickEvent(domEventName, targetInst) {
    if (domEventName === "click")
      return getInstIfValueChanged(targetInst);
  }
  function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
    if (domEventName === "input" || domEventName === "change")
      return getInstIfValueChanged(targetInst);
  }
  function is(x, y) {
    return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = typeof Object.is === "function" ? Object.is : is;
  function shallowEqual(objA, objB) {
    if (objectIs(objA, objB))
      return true;
    if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null)
      return false;
    var keysA = Object.keys(objA), keysB = Object.keys(objB);
    if (keysA.length !== keysB.length)
      return false;
    for (keysB = 0;keysB < keysA.length; keysB++) {
      var currentKey = keysA[keysB];
      if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
        return false;
    }
    return true;
  }
  function getLeafNode(node) {
    for (;node && node.firstChild; )
      node = node.firstChild;
    return node;
  }
  function getNodeForCharacterOffset(root2, offset) {
    var node = getLeafNode(root2);
    root2 = 0;
    for (var nodeEnd;node; ) {
      if (node.nodeType === 3) {
        nodeEnd = root2 + node.textContent.length;
        if (root2 <= offset && nodeEnd >= offset)
          return { node, offset: offset - root2 };
        root2 = nodeEnd;
      }
      a: {
        for (;node; ) {
          if (node.nextSibling) {
            node = node.nextSibling;
            break a;
          }
          node = node.parentNode;
        }
        node = undefined;
      }
      node = getLeafNode(node);
    }
  }
  function containsNode(outerNode, innerNode) {
    return outerNode && innerNode ? outerNode === innerNode ? true : outerNode && outerNode.nodeType === 3 ? false : innerNode && innerNode.nodeType === 3 ? containsNode(outerNode, innerNode.parentNode) : ("contains" in outerNode) ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : false : false;
  }
  function getActiveElementDeep(containerInfo) {
    containerInfo = containerInfo != null && containerInfo.ownerDocument != null && containerInfo.ownerDocument.defaultView != null ? containerInfo.ownerDocument.defaultView : window;
    for (var element = getActiveElement(containerInfo.document);element instanceof containerInfo.HTMLIFrameElement; ) {
      try {
        var JSCompiler_inline_result = typeof element.contentWindow.location.href === "string";
      } catch (err) {
        JSCompiler_inline_result = false;
      }
      if (JSCompiler_inline_result)
        containerInfo = element.contentWindow;
      else
        break;
      element = getActiveElement(containerInfo.document);
    }
    return element;
  }
  function hasSelectionCapabilities(elem) {
    var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
    return nodeName && (nodeName === "input" && (elem.type === "text" || elem.type === "search" || elem.type === "tel" || elem.type === "url" || elem.type === "password") || nodeName === "textarea" || elem.contentEditable === "true");
  }
  var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode;
  var activeElement = null;
  var activeElementInst = null;
  var lastSelection = null;
  var mouseDown = false;
  function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
    var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : nativeEventTarget.nodeType === 9 ? nativeEventTarget : nativeEventTarget.ownerDocument;
    mouseDown || activeElement == null || activeElement !== getActiveElement(doc) || (doc = activeElement, ("selectionStart" in doc) && hasSelectionCapabilities(doc) ? doc = { start: doc.selectionStart, end: doc.selectionEnd } : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
      anchorNode: doc.anchorNode,
      anchorOffset: doc.anchorOffset,
      focusNode: doc.focusNode,
      focusOffset: doc.focusOffset
    }), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent("onSelect", "select", null, nativeEvent, nativeEventTarget), dispatchQueue.push({ event: nativeEvent, listeners: doc }), nativeEvent.target = activeElement)));
  }
  function makePrefixMap(styleProp, eventName) {
    var prefixes = {};
    prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
    prefixes["Webkit" + styleProp] = "webkit" + eventName;
    prefixes["Moz" + styleProp] = "moz" + eventName;
    return prefixes;
  }
  var vendorPrefixes = {
    animationend: makePrefixMap("Animation", "AnimationEnd"),
    animationiteration: makePrefixMap("Animation", "AnimationIteration"),
    animationstart: makePrefixMap("Animation", "AnimationStart"),
    transitionrun: makePrefixMap("Transition", "TransitionRun"),
    transitionstart: makePrefixMap("Transition", "TransitionStart"),
    transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
    transitionend: makePrefixMap("Transition", "TransitionEnd")
  };
  var prefixedEventNames = {};
  var style = {};
  canUseDOM && (style = document.createElement("div").style, ("AnimationEvent" in window) || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), ("TransitionEvent" in window) || delete vendorPrefixes.transitionend.transition);
  function getVendorPrefixedEventName(eventName) {
    if (prefixedEventNames[eventName])
      return prefixedEventNames[eventName];
    if (!vendorPrefixes[eventName])
      return eventName;
    var prefixMap = vendorPrefixes[eventName], styleProp;
    for (styleProp in prefixMap)
      if (prefixMap.hasOwnProperty(styleProp) && styleProp in style)
        return prefixedEventNames[eventName] = prefixMap[styleProp];
    return eventName;
  }
  var ANIMATION_END = getVendorPrefixedEventName("animationend");
  var ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
  var ANIMATION_START = getVendorPrefixedEventName("animationstart");
  var TRANSITION_RUN = getVendorPrefixedEventName("transitionrun");
  var TRANSITION_START = getVendorPrefixedEventName("transitionstart");
  var TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel");
  var TRANSITION_END = getVendorPrefixedEventName("transitionend");
  var topLevelEventsToReactNames = new Map;
  var simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  simpleEventPluginEvents.push("scrollEnd");
  function registerSimpleEvent(domEventName, reactName) {
    topLevelEventsToReactNames.set(domEventName, reactName);
    registerTwoPhaseEvent(reactName, [domEventName]);
  }
  var CapturedStacks = new WeakMap;
  function createCapturedValueAtFiber(value, source) {
    if (typeof value === "object" && value !== null) {
      var existing = CapturedStacks.get(value);
      if (existing !== undefined)
        return existing;
      source = {
        value,
        source,
        stack: getStackByFiberInDevAndProd(source)
      };
      CapturedStacks.set(value, source);
      return source;
    }
    return {
      value,
      source,
      stack: getStackByFiberInDevAndProd(source)
    };
  }
  var concurrentQueues = [];
  var concurrentQueuesIndex = 0;
  var concurrentlyUpdatedLanes = 0;
  function finishQueueingConcurrentUpdates() {
    for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0;i < endIndex; ) {
      var fiber = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var queue = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var update = concurrentQueues[i];
      concurrentQueues[i++] = null;
      var lane = concurrentQueues[i];
      concurrentQueues[i++] = null;
      if (queue !== null && update !== null) {
        var pending = queue.pending;
        pending === null ? update.next = update : (update.next = pending.next, pending.next = update);
        queue.pending = update;
      }
      lane !== 0 && markUpdateLaneFromFiberToRoot(fiber, update, lane);
    }
  }
  function enqueueUpdate$1(fiber, queue, update, lane) {
    concurrentQueues[concurrentQueuesIndex++] = fiber;
    concurrentQueues[concurrentQueuesIndex++] = queue;
    concurrentQueues[concurrentQueuesIndex++] = update;
    concurrentQueues[concurrentQueuesIndex++] = lane;
    concurrentlyUpdatedLanes |= lane;
    fiber.lanes |= lane;
    fiber = fiber.alternate;
    fiber !== null && (fiber.lanes |= lane);
  }
  function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
    enqueueUpdate$1(fiber, queue, update, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function enqueueConcurrentRenderForLane(fiber, lane) {
    enqueueUpdate$1(fiber, null, null, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
    sourceFiber.lanes |= lane;
    var alternate = sourceFiber.alternate;
    alternate !== null && (alternate.lanes |= lane);
    for (var isHidden = false, parent = sourceFiber.return;parent !== null; )
      parent.childLanes |= lane, alternate = parent.alternate, alternate !== null && (alternate.childLanes |= lane), parent.tag === 22 && (sourceFiber = parent.stateNode, sourceFiber === null || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
    return sourceFiber.tag === 3 ? (parent = sourceFiber.stateNode, isHidden && update !== null && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], alternate === null ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
  }
  function getRootForUpdatedFiber(sourceFiber) {
    if (50 < nestedUpdateCount)
      throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
    for (var parent = sourceFiber.return;parent !== null; )
      sourceFiber = parent, parent = sourceFiber.return;
    return sourceFiber.tag === 3 ? sourceFiber.stateNode : null;
  }
  var emptyContextObject = {};
  function FiberNode(tag, pendingProps, key, mode) {
    this.tag = tag;
    this.key = key;
    this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
    this.index = 0;
    this.refCleanup = this.ref = null;
    this.pendingProps = pendingProps;
    this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
    this.mode = mode;
    this.subtreeFlags = this.flags = 0;
    this.deletions = null;
    this.childLanes = this.lanes = 0;
    this.alternate = null;
  }
  function createFiberImplClass(tag, pendingProps, key, mode) {
    return new FiberNode(tag, pendingProps, key, mode);
  }
  function shouldConstruct(Component) {
    Component = Component.prototype;
    return !(!Component || !Component.isReactComponent);
  }
  function createWorkInProgress(current, pendingProps) {
    var workInProgress2 = current.alternate;
    workInProgress2 === null ? (workInProgress2 = createFiberImplClass(current.tag, pendingProps, current.key, current.mode), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
    workInProgress2.flags = current.flags & 65011712;
    workInProgress2.childLanes = current.childLanes;
    workInProgress2.lanes = current.lanes;
    workInProgress2.child = current.child;
    workInProgress2.memoizedProps = current.memoizedProps;
    workInProgress2.memoizedState = current.memoizedState;
    workInProgress2.updateQueue = current.updateQueue;
    pendingProps = current.dependencies;
    workInProgress2.dependencies = pendingProps === null ? null : { lanes: pendingProps.lanes, firstContext: pendingProps.firstContext };
    workInProgress2.sibling = current.sibling;
    workInProgress2.index = current.index;
    workInProgress2.ref = current.ref;
    workInProgress2.refCleanup = current.refCleanup;
    return workInProgress2;
  }
  function resetWorkInProgress(workInProgress2, renderLanes2) {
    workInProgress2.flags &= 65011714;
    var current = workInProgress2.alternate;
    current === null ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies = renderLanes2 === null ? null : {
      lanes: renderLanes2.lanes,
      firstContext: renderLanes2.firstContext
    });
    return workInProgress2;
  }
  function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
    var fiberTag = 0;
    owner = type;
    if (typeof type === "function")
      shouldConstruct(type) && (fiberTag = 1);
    else if (typeof type === "string")
      fiberTag = isHostHoistableType(type, pendingProps, contextStackCursor.current) ? 26 : type === "html" || type === "head" || type === "body" ? 27 : 5;
    else
      a:
        switch (type) {
          case REACT_ACTIVITY_TYPE:
            return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
          case REACT_FRAGMENT_TYPE:
            return createFiberFromFragment(pendingProps.children, mode, lanes, key);
          case REACT_STRICT_MODE_TYPE:
            fiberTag = 8;
            mode |= 24;
            break;
          case REACT_PROFILER_TYPE:
            return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
          case REACT_SUSPENSE_TYPE:
            return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
          case REACT_SUSPENSE_LIST_TYPE:
            return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
          default:
            if (typeof type === "object" && type !== null)
              switch (type.$$typeof) {
                case REACT_PROVIDER_TYPE:
                case REACT_CONTEXT_TYPE:
                  fiberTag = 10;
                  break a;
                case REACT_CONSUMER_TYPE:
                  fiberTag = 9;
                  break a;
                case REACT_FORWARD_REF_TYPE:
                  fiberTag = 11;
                  break a;
                case REACT_MEMO_TYPE:
                  fiberTag = 14;
                  break a;
                case REACT_LAZY_TYPE:
                  fiberTag = 16;
                  owner = null;
                  break a;
              }
            fiberTag = 29;
            pendingProps = Error(formatProdErrorMessage(130, type === null ? "null" : typeof type, ""));
            owner = null;
        }
    key = createFiberImplClass(fiberTag, pendingProps, key, mode);
    key.elementType = type;
    key.type = owner;
    key.lanes = lanes;
    return key;
  }
  function createFiberFromFragment(elements, mode, lanes, key) {
    elements = createFiberImplClass(7, elements, key, mode);
    elements.lanes = lanes;
    return elements;
  }
  function createFiberFromText(content, mode, lanes) {
    content = createFiberImplClass(6, content, null, mode);
    content.lanes = lanes;
    return content;
  }
  function createFiberFromPortal(portal, mode, lanes) {
    mode = createFiberImplClass(4, portal.children !== null ? portal.children : [], portal.key, mode);
    mode.lanes = lanes;
    mode.stateNode = {
      containerInfo: portal.containerInfo,
      pendingChildren: null,
      implementation: portal.implementation
    };
    return mode;
  }
  var forkStack = [];
  var forkStackIndex = 0;
  var treeForkProvider = null;
  var treeForkCount = 0;
  var idStack = [];
  var idStackIndex = 0;
  var treeContextProvider = null;
  var treeContextId = 1;
  var treeContextOverflow = "";
  function pushTreeFork(workInProgress2, totalChildren) {
    forkStack[forkStackIndex++] = treeForkCount;
    forkStack[forkStackIndex++] = treeForkProvider;
    treeForkProvider = workInProgress2;
    treeForkCount = totalChildren;
  }
  function pushTreeId(workInProgress2, totalChildren, index2) {
    idStack[idStackIndex++] = treeContextId;
    idStack[idStackIndex++] = treeContextOverflow;
    idStack[idStackIndex++] = treeContextProvider;
    treeContextProvider = workInProgress2;
    var baseIdWithLeadingBit = treeContextId;
    workInProgress2 = treeContextOverflow;
    var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
    baseIdWithLeadingBit &= ~(1 << baseLength);
    index2 += 1;
    var length = 32 - clz32(totalChildren) + baseLength;
    if (30 < length) {
      var numberOfOverflowBits = baseLength - baseLength % 5;
      length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
      baseIdWithLeadingBit >>= numberOfOverflowBits;
      baseLength -= numberOfOverflowBits;
      treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index2 << baseLength | baseIdWithLeadingBit;
      treeContextOverflow = length + workInProgress2;
    } else
      treeContextId = 1 << length | index2 << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
  }
  function pushMaterializedTreeId(workInProgress2) {
    workInProgress2.return !== null && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
  }
  function popTreeContext(workInProgress2) {
    for (;workInProgress2 === treeForkProvider; )
      treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
    for (;workInProgress2 === treeContextProvider; )
      treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
  }
  var hydrationParentFiber = null;
  var nextHydratableInstance = null;
  var isHydrating = false;
  var hydrationErrors = null;
  var rootOrSingletonContext = false;
  var HydrationMismatchException = Error(formatProdErrorMessage(519));
  function throwOnHydrationMismatch(fiber) {
    var error = Error(formatProdErrorMessage(418, ""));
    queueHydrationError(createCapturedValueAtFiber(error, fiber));
    throw HydrationMismatchException;
  }
  function prepareToHydrateHostInstance(fiber) {
    var { stateNode: instance, type, memoizedProps: props } = fiber;
    instance[internalInstanceKey] = fiber;
    instance[internalPropsKey] = props;
    switch (type) {
      case "dialog":
        listenToNonDelegatedEvent("cancel", instance);
        listenToNonDelegatedEvent("close", instance);
        break;
      case "iframe":
      case "object":
      case "embed":
        listenToNonDelegatedEvent("load", instance);
        break;
      case "video":
      case "audio":
        for (type = 0;type < mediaEventTypes.length; type++)
          listenToNonDelegatedEvent(mediaEventTypes[type], instance);
        break;
      case "source":
        listenToNonDelegatedEvent("error", instance);
        break;
      case "img":
      case "image":
      case "link":
        listenToNonDelegatedEvent("error", instance);
        listenToNonDelegatedEvent("load", instance);
        break;
      case "details":
        listenToNonDelegatedEvent("toggle", instance);
        break;
      case "input":
        listenToNonDelegatedEvent("invalid", instance);
        initInput(instance, props.value, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name, true);
        track(instance);
        break;
      case "select":
        listenToNonDelegatedEvent("invalid", instance);
        break;
      case "textarea":
        listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children), track(instance);
    }
    type = props.children;
    typeof type !== "string" && typeof type !== "number" && typeof type !== "bigint" || instance.textContent === "" + type || props.suppressHydrationWarning === true || checkForUnmatchedText(instance.textContent, type) ? (props.popover != null && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), props.onScroll != null && listenToNonDelegatedEvent("scroll", instance), props.onScrollEnd != null && listenToNonDelegatedEvent("scrollend", instance), props.onClick != null && (instance.onclick = noop$1), instance = true) : instance = false;
    instance || throwOnHydrationMismatch(fiber);
  }
  function popToNextHostParent(fiber) {
    for (hydrationParentFiber = fiber.return;hydrationParentFiber; )
      switch (hydrationParentFiber.tag) {
        case 5:
        case 13:
          rootOrSingletonContext = false;
          return;
        case 27:
        case 3:
          rootOrSingletonContext = true;
          return;
        default:
          hydrationParentFiber = hydrationParentFiber.return;
      }
  }
  function popHydrationState(fiber) {
    if (fiber !== hydrationParentFiber)
      return false;
    if (!isHydrating)
      return popToNextHostParent(fiber), isHydrating = true, false;
    var tag = fiber.tag, JSCompiler_temp;
    if (JSCompiler_temp = tag !== 3 && tag !== 27) {
      if (JSCompiler_temp = tag === 5)
        JSCompiler_temp = fiber.type, JSCompiler_temp = !(JSCompiler_temp !== "form" && JSCompiler_temp !== "button") || shouldSetTextContent(fiber.type, fiber.memoizedProps);
      JSCompiler_temp = !JSCompiler_temp;
    }
    JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
    popToNextHostParent(fiber);
    if (tag === 13) {
      fiber = fiber.memoizedState;
      fiber = fiber !== null ? fiber.dehydrated : null;
      if (!fiber)
        throw Error(formatProdErrorMessage(317));
      a: {
        fiber = fiber.nextSibling;
        for (tag = 0;fiber; ) {
          if (fiber.nodeType === 8)
            if (JSCompiler_temp = fiber.data, JSCompiler_temp === "/$") {
              if (tag === 0) {
                nextHydratableInstance = getNextHydratable(fiber.nextSibling);
                break a;
              }
              tag--;
            } else
              JSCompiler_temp !== "$" && JSCompiler_temp !== "$!" && JSCompiler_temp !== "$?" || tag++;
          fiber = fiber.nextSibling;
        }
        nextHydratableInstance = null;
      }
    } else
      tag === 27 ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
    return true;
  }
  function resetHydrationState() {
    nextHydratableInstance = hydrationParentFiber = null;
    isHydrating = false;
  }
  function upgradeHydrationErrorsToRecoverable() {
    var queuedErrors = hydrationErrors;
    queuedErrors !== null && (workInProgressRootRecoverableErrors === null ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, queuedErrors), hydrationErrors = null);
    return queuedErrors;
  }
  function queueHydrationError(error) {
    hydrationErrors === null ? hydrationErrors = [error] : hydrationErrors.push(error);
  }
  var valueCursor = createCursor(null);
  var currentlyRenderingFiber$1 = null;
  var lastContextDependency = null;
  function pushProvider(providerFiber, context, nextValue) {
    push(valueCursor, context._currentValue);
    context._currentValue = nextValue;
  }
  function popProvider(context) {
    context._currentValue = valueCursor.current;
    pop(valueCursor);
  }
  function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
    for (;parent !== null; ) {
      var alternate = parent.alternate;
      (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, alternate !== null && (alternate.childLanes |= renderLanes2)) : alternate !== null && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
      if (parent === propagationRoot)
        break;
      parent = parent.return;
    }
  }
  function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
    var fiber = workInProgress2.child;
    fiber !== null && (fiber.return = workInProgress2);
    for (;fiber !== null; ) {
      var list = fiber.dependencies;
      if (list !== null) {
        var nextFiber = fiber.child;
        list = list.firstContext;
        a:
          for (;list !== null; ) {
            var dependency = list;
            list = fiber;
            for (var i = 0;i < contexts.length; i++)
              if (dependency.context === contexts[i]) {
                list.lanes |= renderLanes2;
                dependency = list.alternate;
                dependency !== null && (dependency.lanes |= renderLanes2);
                scheduleContextWorkOnParentPath(list.return, renderLanes2, workInProgress2);
                forcePropagateEntireTree || (nextFiber = null);
                break a;
              }
            list = dependency.next;
          }
      } else if (fiber.tag === 18) {
        nextFiber = fiber.return;
        if (nextFiber === null)
          throw Error(formatProdErrorMessage(341));
        nextFiber.lanes |= renderLanes2;
        list = nextFiber.alternate;
        list !== null && (list.lanes |= renderLanes2);
        scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
        nextFiber = null;
      } else
        nextFiber = fiber.child;
      if (nextFiber !== null)
        nextFiber.return = fiber;
      else
        for (nextFiber = fiber;nextFiber !== null; ) {
          if (nextFiber === workInProgress2) {
            nextFiber = null;
            break;
          }
          fiber = nextFiber.sibling;
          if (fiber !== null) {
            fiber.return = nextFiber.return;
            nextFiber = fiber;
            break;
          }
          nextFiber = nextFiber.return;
        }
      fiber = nextFiber;
    }
  }
  function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
    current = null;
    for (var parent = workInProgress2, isInsidePropagationBailout = false;parent !== null; ) {
      if (!isInsidePropagationBailout) {
        if ((parent.flags & 524288) !== 0)
          isInsidePropagationBailout = true;
        else if ((parent.flags & 262144) !== 0)
          break;
      }
      if (parent.tag === 10) {
        var currentParent = parent.alternate;
        if (currentParent === null)
          throw Error(formatProdErrorMessage(387));
        currentParent = currentParent.memoizedProps;
        if (currentParent !== null) {
          var context = parent.type;
          objectIs(parent.pendingProps.value, currentParent.value) || (current !== null ? current.push(context) : current = [context]);
        }
      } else if (parent === hostTransitionProviderCursor.current) {
        currentParent = parent.alternate;
        if (currentParent === null)
          throw Error(formatProdErrorMessage(387));
        currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (current !== null ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
      }
      parent = parent.return;
    }
    current !== null && propagateContextChanges(workInProgress2, current, renderLanes2, forcePropagateEntireTree);
    workInProgress2.flags |= 262144;
  }
  function checkIfContextChanged(currentDependencies) {
    for (currentDependencies = currentDependencies.firstContext;currentDependencies !== null; ) {
      if (!objectIs(currentDependencies.context._currentValue, currentDependencies.memoizedValue))
        return true;
      currentDependencies = currentDependencies.next;
    }
    return false;
  }
  function prepareToReadContext(workInProgress2) {
    currentlyRenderingFiber$1 = workInProgress2;
    lastContextDependency = null;
    workInProgress2 = workInProgress2.dependencies;
    workInProgress2 !== null && (workInProgress2.firstContext = null);
  }
  function readContext(context) {
    return readContextForConsumer(currentlyRenderingFiber$1, context);
  }
  function readContextDuringReconciliation(consumer, context) {
    currentlyRenderingFiber$1 === null && prepareToReadContext(consumer);
    return readContextForConsumer(consumer, context);
  }
  function readContextForConsumer(consumer, context) {
    var value = context._currentValue;
    context = { context, memoizedValue: value, next: null };
    if (lastContextDependency === null) {
      if (consumer === null)
        throw Error(formatProdErrorMessage(308));
      lastContextDependency = context;
      consumer.dependencies = { lanes: 0, firstContext: context };
      consumer.flags |= 524288;
    } else
      lastContextDependency = lastContextDependency.next = context;
    return value;
  }
  var AbortControllerLocal = typeof AbortController !== "undefined" ? AbortController : function() {
    var listeners = [], signal = this.signal = {
      aborted: false,
      addEventListener: function(type, listener) {
        listeners.push(listener);
      }
    };
    this.abort = function() {
      signal.aborted = true;
      listeners.forEach(function(listener) {
        return listener();
      });
    };
  };
  var scheduleCallback$2 = Scheduler.unstable_scheduleCallback;
  var NormalPriority = Scheduler.unstable_NormalPriority;
  var CacheContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Consumer: null,
    Provider: null,
    _currentValue: null,
    _currentValue2: null,
    _threadCount: 0
  };
  function createCache() {
    return {
      controller: new AbortControllerLocal,
      data: new Map,
      refCount: 0
    };
  }
  function releaseCache(cache) {
    cache.refCount--;
    cache.refCount === 0 && scheduleCallback$2(NormalPriority, function() {
      cache.controller.abort();
    });
  }
  var currentEntangledListeners = null;
  var currentEntangledPendingCount = 0;
  var currentEntangledLane = 0;
  var currentEntangledActionThenable = null;
  function entangleAsyncAction(transition, thenable) {
    if (currentEntangledListeners === null) {
      var entangledListeners = currentEntangledListeners = [];
      currentEntangledPendingCount = 0;
      currentEntangledLane = requestTransitionLane();
      currentEntangledActionThenable = {
        status: "pending",
        value: undefined,
        then: function(resolve) {
          entangledListeners.push(resolve);
        }
      };
    }
    currentEntangledPendingCount++;
    thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
    return thenable;
  }
  function pingEngtangledActionScope() {
    if (--currentEntangledPendingCount === 0 && currentEntangledListeners !== null) {
      currentEntangledActionThenable !== null && (currentEntangledActionThenable.status = "fulfilled");
      var listeners = currentEntangledListeners;
      currentEntangledListeners = null;
      currentEntangledLane = 0;
      currentEntangledActionThenable = null;
      for (var i = 0;i < listeners.length; i++)
        (0, listeners[i])();
    }
  }
  function chainThenableValue(thenable, result) {
    var listeners = [], thenableWithOverride = {
      status: "pending",
      value: null,
      reason: null,
      then: function(resolve) {
        listeners.push(resolve);
      }
    };
    thenable.then(function() {
      thenableWithOverride.status = "fulfilled";
      thenableWithOverride.value = result;
      for (var i = 0;i < listeners.length; i++)
        (0, listeners[i])(result);
    }, function(error) {
      thenableWithOverride.status = "rejected";
      thenableWithOverride.reason = error;
      for (error = 0;error < listeners.length; error++)
        (0, listeners[error])(undefined);
    });
    return thenableWithOverride;
  }
  var prevOnStartTransitionFinish = ReactSharedInternals.S;
  ReactSharedInternals.S = function(transition, returnValue) {
    typeof returnValue === "object" && returnValue !== null && typeof returnValue.then === "function" && entangleAsyncAction(transition, returnValue);
    prevOnStartTransitionFinish !== null && prevOnStartTransitionFinish(transition, returnValue);
  };
  var resumedCache = createCursor(null);
  function peekCacheFromPool() {
    var cacheResumedFromPreviousRender = resumedCache.current;
    return cacheResumedFromPreviousRender !== null ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
  }
  function pushTransition(offscreenWorkInProgress, prevCachePool) {
    prevCachePool === null ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
  }
  function getSuspendedCache() {
    var cacheFromPool = peekCacheFromPool();
    return cacheFromPool === null ? null : { parent: CacheContext._currentValue, pool: cacheFromPool };
  }
  var SuspenseException = Error(formatProdErrorMessage(460));
  var SuspenseyCommitException = Error(formatProdErrorMessage(474));
  var SuspenseActionException = Error(formatProdErrorMessage(542));
  var noopSuspenseyCommitThenable = { then: function() {} };
  function isThenableResolved(thenable) {
    thenable = thenable.status;
    return thenable === "fulfilled" || thenable === "rejected";
  }
  function noop$3() {}
  function trackUsedThenable(thenableState2, thenable, index2) {
    index2 = thenableState2[index2];
    index2 === undefined ? thenableState2.push(thenable) : index2 !== thenable && (thenable.then(noop$3, noop$3), thenable = index2);
    switch (thenable.status) {
      case "fulfilled":
        return thenable.value;
      case "rejected":
        throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
      default:
        if (typeof thenable.status === "string")
          thenable.then(noop$3, noop$3);
        else {
          thenableState2 = workInProgressRoot;
          if (thenableState2 !== null && 100 < thenableState2.shellSuspendCounter)
            throw Error(formatProdErrorMessage(482));
          thenableState2 = thenable;
          thenableState2.status = "pending";
          thenableState2.then(function(fulfilledValue) {
            if (thenable.status === "pending") {
              var fulfilledThenable = thenable;
              fulfilledThenable.status = "fulfilled";
              fulfilledThenable.value = fulfilledValue;
            }
          }, function(error) {
            if (thenable.status === "pending") {
              var rejectedThenable = thenable;
              rejectedThenable.status = "rejected";
              rejectedThenable.reason = error;
            }
          });
        }
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
        }
        suspendedThenable = thenable;
        throw SuspenseException;
    }
  }
  var suspendedThenable = null;
  function getSuspendedThenable() {
    if (suspendedThenable === null)
      throw Error(formatProdErrorMessage(459));
    var thenable = suspendedThenable;
    suspendedThenable = null;
    return thenable;
  }
  function checkIfUseWrappedInAsyncCatch(rejectedReason) {
    if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
      throw Error(formatProdErrorMessage(483));
  }
  var hasForceUpdate = false;
  function initializeUpdateQueue(fiber) {
    fiber.updateQueue = {
      baseState: fiber.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
      callbacks: null
    };
  }
  function cloneUpdateQueue(current, workInProgress2) {
    current = current.updateQueue;
    workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
      baseState: current.baseState,
      firstBaseUpdate: current.firstBaseUpdate,
      lastBaseUpdate: current.lastBaseUpdate,
      shared: current.shared,
      callbacks: null
    });
  }
  function createUpdate(lane) {
    return { lane, tag: 0, payload: null, callback: null, next: null };
  }
  function enqueueUpdate(fiber, update, lane) {
    var updateQueue = fiber.updateQueue;
    if (updateQueue === null)
      return null;
    updateQueue = updateQueue.shared;
    if ((executionContext & 2) !== 0) {
      var pending = updateQueue.pending;
      pending === null ? update.next = update : (update.next = pending.next, pending.next = update);
      updateQueue.pending = update;
      update = getRootForUpdatedFiber(fiber);
      markUpdateLaneFromFiberToRoot(fiber, null, lane);
      return update;
    }
    enqueueUpdate$1(fiber, updateQueue, update, lane);
    return getRootForUpdatedFiber(fiber);
  }
  function entangleTransitions(root2, fiber, lane) {
    fiber = fiber.updateQueue;
    if (fiber !== null && (fiber = fiber.shared, (lane & 4194048) !== 0)) {
      var queueLanes = fiber.lanes;
      queueLanes &= root2.pendingLanes;
      lane |= queueLanes;
      fiber.lanes = lane;
      markRootEntangled(root2, lane);
    }
  }
  function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
    var { updateQueue: queue, alternate: current } = workInProgress2;
    if (current !== null && (current = current.updateQueue, queue === current)) {
      var newFirst = null, newLast = null;
      queue = queue.firstBaseUpdate;
      if (queue !== null) {
        do {
          var clone = {
            lane: queue.lane,
            tag: queue.tag,
            payload: queue.payload,
            callback: null,
            next: null
          };
          newLast === null ? newFirst = newLast = clone : newLast = newLast.next = clone;
          queue = queue.next;
        } while (queue !== null);
        newLast === null ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
      } else
        newFirst = newLast = capturedUpdate;
      queue = {
        baseState: current.baseState,
        firstBaseUpdate: newFirst,
        lastBaseUpdate: newLast,
        shared: current.shared,
        callbacks: current.callbacks
      };
      workInProgress2.updateQueue = queue;
      return;
    }
    workInProgress2 = queue.lastBaseUpdate;
    workInProgress2 === null ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
    queue.lastBaseUpdate = capturedUpdate;
  }
  var didReadFromEntangledAsyncAction = false;
  function suspendIfUpdateReadFromEntangledAsyncAction() {
    if (didReadFromEntangledAsyncAction) {
      var entangledActionThenable = currentEntangledActionThenable;
      if (entangledActionThenable !== null)
        throw entangledActionThenable;
    }
  }
  function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
    didReadFromEntangledAsyncAction = false;
    var queue = workInProgress$jscomp$0.updateQueue;
    hasForceUpdate = false;
    var { firstBaseUpdate, lastBaseUpdate } = queue, pendingQueue = queue.shared.pending;
    if (pendingQueue !== null) {
      queue.shared.pending = null;
      var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
      lastPendingUpdate.next = null;
      lastBaseUpdate === null ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
      lastBaseUpdate = lastPendingUpdate;
      var current = workInProgress$jscomp$0.alternate;
      current !== null && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (pendingQueue === null ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
    }
    if (firstBaseUpdate !== null) {
      var newState = queue.baseState;
      lastBaseUpdate = 0;
      current = firstPendingUpdate = lastPendingUpdate = null;
      pendingQueue = firstBaseUpdate;
      do {
        var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
        if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
          updateLane !== 0 && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
          current !== null && (current = current.next = {
            lane: 0,
            tag: pendingQueue.tag,
            payload: pendingQueue.payload,
            callback: null,
            next: null
          });
          a: {
            var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
            updateLane = props;
            var instance = instance$jscomp$0;
            switch (update.tag) {
              case 1:
                workInProgress2 = update.payload;
                if (typeof workInProgress2 === "function") {
                  newState = workInProgress2.call(instance, newState, updateLane);
                  break a;
                }
                newState = workInProgress2;
                break a;
              case 3:
                workInProgress2.flags = workInProgress2.flags & -65537 | 128;
              case 0:
                workInProgress2 = update.payload;
                updateLane = typeof workInProgress2 === "function" ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
                if (updateLane === null || updateLane === undefined)
                  break a;
                newState = assign({}, newState, updateLane);
                break a;
              case 2:
                hasForceUpdate = true;
            }
          }
          updateLane = pendingQueue.callback;
          updateLane !== null && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, isHiddenUpdate === null ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
        } else
          isHiddenUpdate = {
            lane: updateLane,
            tag: pendingQueue.tag,
            payload: pendingQueue.payload,
            callback: pendingQueue.callback,
            next: null
          }, current === null ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
        pendingQueue = pendingQueue.next;
        if (pendingQueue === null)
          if (pendingQueue = queue.shared.pending, pendingQueue === null)
            break;
          else
            isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
      } while (1);
      current === null && (lastPendingUpdate = newState);
      queue.baseState = lastPendingUpdate;
      queue.firstBaseUpdate = firstPendingUpdate;
      queue.lastBaseUpdate = current;
      firstBaseUpdate === null && (queue.shared.lanes = 0);
      workInProgressRootSkippedLanes |= lastBaseUpdate;
      workInProgress$jscomp$0.lanes = lastBaseUpdate;
      workInProgress$jscomp$0.memoizedState = newState;
    }
  }
  function callCallback(callback, context) {
    if (typeof callback !== "function")
      throw Error(formatProdErrorMessage(191, callback));
    callback.call(context);
  }
  function commitCallbacks(updateQueue, context) {
    var callbacks = updateQueue.callbacks;
    if (callbacks !== null)
      for (updateQueue.callbacks = null, updateQueue = 0;updateQueue < callbacks.length; updateQueue++)
        callCallback(callbacks[updateQueue], context);
  }
  var currentTreeHiddenStackCursor = createCursor(null);
  var prevEntangledRenderLanesCursor = createCursor(0);
  function pushHiddenContext(fiber, context) {
    fiber = entangledRenderLanes;
    push(prevEntangledRenderLanesCursor, fiber);
    push(currentTreeHiddenStackCursor, context);
    entangledRenderLanes = fiber | context.baseLanes;
  }
  function reuseHiddenContextOnStack() {
    push(prevEntangledRenderLanesCursor, entangledRenderLanes);
    push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
  }
  function popHiddenContext() {
    entangledRenderLanes = prevEntangledRenderLanesCursor.current;
    pop(currentTreeHiddenStackCursor);
    pop(prevEntangledRenderLanesCursor);
  }
  var renderLanes = 0;
  var currentlyRenderingFiber = null;
  var currentHook = null;
  var workInProgressHook = null;
  var didScheduleRenderPhaseUpdate = false;
  var didScheduleRenderPhaseUpdateDuringThisPass = false;
  var shouldDoubleInvokeUserFnsInHooksDEV = false;
  var localIdCounter = 0;
  var thenableIndexCounter$1 = 0;
  var thenableState$1 = null;
  var globalClientIdCounter = 0;
  function throwInvalidHookError() {
    throw Error(formatProdErrorMessage(321));
  }
  function areHookInputsEqual(nextDeps, prevDeps) {
    if (prevDeps === null)
      return false;
    for (var i = 0;i < prevDeps.length && i < nextDeps.length; i++)
      if (!objectIs(nextDeps[i], prevDeps[i]))
        return false;
    return true;
  }
  function renderWithHooks(current, workInProgress2, Component, props, secondArg, nextRenderLanes) {
    renderLanes = nextRenderLanes;
    currentlyRenderingFiber = workInProgress2;
    workInProgress2.memoizedState = null;
    workInProgress2.updateQueue = null;
    workInProgress2.lanes = 0;
    ReactSharedInternals.H = current === null || current.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
    shouldDoubleInvokeUserFnsInHooksDEV = false;
    nextRenderLanes = Component(props, secondArg);
    shouldDoubleInvokeUserFnsInHooksDEV = false;
    didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(workInProgress2, Component, props, secondArg));
    finishRenderingHooks(current);
    return nextRenderLanes;
  }
  function finishRenderingHooks(current) {
    ReactSharedInternals.H = ContextOnlyDispatcher;
    var didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;
    renderLanes = 0;
    workInProgressHook = currentHook = currentlyRenderingFiber = null;
    didScheduleRenderPhaseUpdate = false;
    thenableIndexCounter$1 = 0;
    thenableState$1 = null;
    if (didRenderTooFewHooks)
      throw Error(formatProdErrorMessage(300));
    current === null || didReceiveUpdate || (current = current.dependencies, current !== null && checkIfContextChanged(current) && (didReceiveUpdate = true));
  }
  function renderWithHooksAgain(workInProgress2, Component, props, secondArg) {
    currentlyRenderingFiber = workInProgress2;
    var numberOfReRenders = 0;
    do {
      didScheduleRenderPhaseUpdateDuringThisPass && (thenableState$1 = null);
      thenableIndexCounter$1 = 0;
      didScheduleRenderPhaseUpdateDuringThisPass = false;
      if (25 <= numberOfReRenders)
        throw Error(formatProdErrorMessage(301));
      numberOfReRenders += 1;
      workInProgressHook = currentHook = null;
      if (workInProgress2.updateQueue != null) {
        var children = workInProgress2.updateQueue;
        children.lastEffect = null;
        children.events = null;
        children.stores = null;
        children.memoCache != null && (children.memoCache.index = 0);
      }
      ReactSharedInternals.H = HooksDispatcherOnRerender;
      children = Component(props, secondArg);
    } while (didScheduleRenderPhaseUpdateDuringThisPass);
    return children;
  }
  function TransitionAwareHostComponent() {
    var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
    maybeThenable = typeof maybeThenable.then === "function" ? useThenable(maybeThenable) : maybeThenable;
    dispatcher = dispatcher.useState()[0];
    (currentHook !== null ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
    return maybeThenable;
  }
  function checkDidRenderIdHook() {
    var didRenderIdHook = localIdCounter !== 0;
    localIdCounter = 0;
    return didRenderIdHook;
  }
  function bailoutHooks(current, workInProgress2, lanes) {
    workInProgress2.updateQueue = current.updateQueue;
    workInProgress2.flags &= -2053;
    current.lanes &= ~lanes;
  }
  function resetHooksOnUnwind(workInProgress2) {
    if (didScheduleRenderPhaseUpdate) {
      for (workInProgress2 = workInProgress2.memoizedState;workInProgress2 !== null; ) {
        var queue = workInProgress2.queue;
        queue !== null && (queue.pending = null);
        workInProgress2 = workInProgress2.next;
      }
      didScheduleRenderPhaseUpdate = false;
    }
    renderLanes = 0;
    workInProgressHook = currentHook = currentlyRenderingFiber = null;
    didScheduleRenderPhaseUpdateDuringThisPass = false;
    thenableIndexCounter$1 = localIdCounter = 0;
    thenableState$1 = null;
  }
  function mountWorkInProgressHook() {
    var hook = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null
    };
    workInProgressHook === null ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
    return workInProgressHook;
  }
  function updateWorkInProgressHook() {
    if (currentHook === null) {
      var nextCurrentHook = currentlyRenderingFiber.alternate;
      nextCurrentHook = nextCurrentHook !== null ? nextCurrentHook.memoizedState : null;
    } else
      nextCurrentHook = currentHook.next;
    var nextWorkInProgressHook = workInProgressHook === null ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
    if (nextWorkInProgressHook !== null)
      workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
    else {
      if (nextCurrentHook === null) {
        if (currentlyRenderingFiber.alternate === null)
          throw Error(formatProdErrorMessage(467));
        throw Error(formatProdErrorMessage(310));
      }
      currentHook = nextCurrentHook;
      nextCurrentHook = {
        memoizedState: currentHook.memoizedState,
        baseState: currentHook.baseState,
        baseQueue: currentHook.baseQueue,
        queue: currentHook.queue,
        next: null
      };
      workInProgressHook === null ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
    }
    return workInProgressHook;
  }
  function createFunctionComponentUpdateQueue() {
    return { lastEffect: null, events: null, stores: null, memoCache: null };
  }
  function useThenable(thenable) {
    var index2 = thenableIndexCounter$1;
    thenableIndexCounter$1 += 1;
    thenableState$1 === null && (thenableState$1 = []);
    thenable = trackUsedThenable(thenableState$1, thenable, index2);
    index2 = currentlyRenderingFiber;
    (workInProgressHook === null ? index2.memoizedState : workInProgressHook.next) === null && (index2 = index2.alternate, ReactSharedInternals.H = index2 === null || index2.memoizedState === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
    return thenable;
  }
  function use(usable) {
    if (usable !== null && typeof usable === "object") {
      if (typeof usable.then === "function")
        return useThenable(usable);
      if (usable.$$typeof === REACT_CONTEXT_TYPE)
        return readContext(usable);
    }
    throw Error(formatProdErrorMessage(438, String(usable)));
  }
  function useMemoCache(size) {
    var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
    updateQueue !== null && (memoCache = updateQueue.memoCache);
    if (memoCache == null) {
      var current = currentlyRenderingFiber.alternate;
      current !== null && (current = current.updateQueue, current !== null && (current = current.memoCache, current != null && (memoCache = {
        data: current.data.map(function(array) {
          return array.slice();
        }),
        index: 0
      })));
    }
    memoCache == null && (memoCache = { data: [], index: 0 });
    updateQueue === null && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
    updateQueue.memoCache = memoCache;
    updateQueue = memoCache.data[memoCache.index];
    if (updateQueue === undefined)
      for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0;current < size; current++)
        updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
    memoCache.index++;
    return updateQueue;
  }
  function basicStateReducer(state, action) {
    return typeof action === "function" ? action(state) : action;
  }
  function updateReducer(reducer) {
    var hook = updateWorkInProgressHook();
    return updateReducerImpl(hook, currentHook, reducer);
  }
  function updateReducerImpl(hook, current, reducer) {
    var queue = hook.queue;
    if (queue === null)
      throw Error(formatProdErrorMessage(311));
    queue.lastRenderedReducer = reducer;
    var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
    if (pendingQueue !== null) {
      if (baseQueue !== null) {
        var baseFirst = baseQueue.next;
        baseQueue.next = pendingQueue.next;
        pendingQueue.next = baseFirst;
      }
      current.baseQueue = baseQueue = pendingQueue;
      queue.pending = null;
    }
    pendingQueue = hook.baseState;
    if (baseQueue === null)
      hook.memoizedState = pendingQueue;
    else {
      current = baseQueue.next;
      var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$32 = false;
      do {
        var updateLane = update.lane & -536870913;
        if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
          var revertLane = update.revertLane;
          if (revertLane === 0)
            newBaseQueueLast !== null && (newBaseQueueLast = newBaseQueueLast.next = {
              lane: 0,
              revertLane: 0,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$32 = true);
          else if ((renderLanes & revertLane) === revertLane) {
            update = update.next;
            revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$32 = true);
            continue;
          } else
            updateLane = {
              lane: 0,
              revertLane: update.revertLane,
              action: update.action,
              hasEagerState: update.hasEagerState,
              eagerState: update.eagerState,
              next: null
            }, newBaseQueueLast === null ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
          updateLane = update.action;
          shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
          pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
        } else
          revertLane = {
            lane: updateLane,
            revertLane: update.revertLane,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next: null
          }, newBaseQueueLast === null ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
        update = update.next;
      } while (update !== null && update !== current);
      newBaseQueueLast === null ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
      if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$32 && (reducer = currentEntangledActionThenable, reducer !== null)))
        throw reducer;
      hook.memoizedState = pendingQueue;
      hook.baseState = baseFirst;
      hook.baseQueue = newBaseQueueLast;
      queue.lastRenderedState = pendingQueue;
    }
    baseQueue === null && (queue.lanes = 0);
    return [hook.memoizedState, queue.dispatch];
  }
  function rerenderReducer(reducer) {
    var hook = updateWorkInProgressHook(), queue = hook.queue;
    if (queue === null)
      throw Error(formatProdErrorMessage(311));
    queue.lastRenderedReducer = reducer;
    var { dispatch, pending: lastRenderPhaseUpdate } = queue, newState = hook.memoizedState;
    if (lastRenderPhaseUpdate !== null) {
      queue.pending = null;
      var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
      do
        newState = reducer(newState, update.action), update = update.next;
      while (update !== lastRenderPhaseUpdate);
      objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
      hook.memoizedState = newState;
      hook.baseQueue === null && (hook.baseState = newState);
      queue.lastRenderedState = newState;
    }
    return [newState, dispatch];
  }
  function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
    var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
    if (isHydrating$jscomp$0) {
      if (getServerSnapshot === undefined)
        throw Error(formatProdErrorMessage(407));
      getServerSnapshot = getServerSnapshot();
    } else
      getServerSnapshot = getSnapshot();
    var snapshotChanged = !objectIs((currentHook || hook).memoizedState, getServerSnapshot);
    snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
    hook = hook.queue;
    var create = subscribeToStore.bind(null, fiber, hook, subscribe);
    updateEffectImpl(2048, 8, create, [subscribe]);
    if (hook.getSnapshot !== getSnapshot || snapshotChanged || workInProgressHook !== null && workInProgressHook.memoizedState.tag & 1) {
      fiber.flags |= 2048;
      pushSimpleEffect(9, createEffectInstance(), updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot), null);
      if (workInProgressRoot === null)
        throw Error(formatProdErrorMessage(349));
      isHydrating$jscomp$0 || (renderLanes & 124) !== 0 || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
    }
    return getServerSnapshot;
  }
  function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
    fiber.flags |= 16384;
    fiber = { getSnapshot, value: renderedSnapshot };
    getSnapshot = currentlyRenderingFiber.updateQueue;
    getSnapshot === null ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, renderedSnapshot === null ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
  }
  function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
    inst.value = nextSnapshot;
    inst.getSnapshot = getSnapshot;
    checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
  }
  function subscribeToStore(fiber, inst, subscribe) {
    return subscribe(function() {
      checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
    });
  }
  function checkIfSnapshotChanged(inst) {
    var latestGetSnapshot = inst.getSnapshot;
    inst = inst.value;
    try {
      var nextValue = latestGetSnapshot();
      return !objectIs(inst, nextValue);
    } catch (error) {
      return true;
    }
  }
  function forceStoreRerender(fiber) {
    var root2 = enqueueConcurrentRenderForLane(fiber, 2);
    root2 !== null && scheduleUpdateOnFiber(root2, fiber, 2);
  }
  function mountStateImpl(initialState) {
    var hook = mountWorkInProgressHook();
    if (typeof initialState === "function") {
      var initialStateInitializer = initialState;
      initialState = initialStateInitializer();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          initialStateInitializer();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
    }
    hook.memoizedState = hook.baseState = initialState;
    hook.queue = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: basicStateReducer,
      lastRenderedState: initialState
    };
    return hook;
  }
  function updateOptimisticImpl(hook, current, passthrough, reducer) {
    hook.baseState = passthrough;
    return updateReducerImpl(hook, currentHook, typeof reducer === "function" ? reducer : basicStateReducer);
  }
  function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
    if (isRenderPhaseUpdate(fiber))
      throw Error(formatProdErrorMessage(485));
    fiber = actionQueue.action;
    if (fiber !== null) {
      var actionNode = {
        payload,
        action: fiber,
        next: null,
        isTransition: true,
        status: "pending",
        value: null,
        reason: null,
        listeners: [],
        then: function(listener) {
          actionNode.listeners.push(listener);
        }
      };
      ReactSharedInternals.T !== null ? setPendingState(true) : actionNode.isTransition = false;
      setState(actionNode);
      setPendingState = actionQueue.pending;
      setPendingState === null ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
    }
  }
  function runActionStateAction(actionQueue, node) {
    var { action, payload } = node, prevState = actionQueue.state;
    if (node.isTransition) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
        onStartTransitionFinish !== null && onStartTransitionFinish(currentTransition, returnValue);
        handleActionReturnValue(actionQueue, node, returnValue);
      } catch (error) {
        onActionError(actionQueue, node, error);
      } finally {
        ReactSharedInternals.T = prevTransition;
      }
    } else
      try {
        prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
      } catch (error$38) {
        onActionError(actionQueue, node, error$38);
      }
  }
  function handleActionReturnValue(actionQueue, node, returnValue) {
    returnValue !== null && typeof returnValue === "object" && typeof returnValue.then === "function" ? returnValue.then(function(nextState) {
      onActionSuccess(actionQueue, node, nextState);
    }, function(error) {
      return onActionError(actionQueue, node, error);
    }) : onActionSuccess(actionQueue, node, returnValue);
  }
  function onActionSuccess(actionQueue, actionNode, nextState) {
    actionNode.status = "fulfilled";
    actionNode.value = nextState;
    notifyActionListeners(actionNode);
    actionQueue.state = nextState;
    actionNode = actionQueue.pending;
    actionNode !== null && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
  }
  function onActionError(actionQueue, actionNode, error) {
    var last = actionQueue.pending;
    actionQueue.pending = null;
    if (last !== null) {
      last = last.next;
      do
        actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
      while (actionNode !== last);
    }
    actionQueue.action = null;
  }
  function notifyActionListeners(actionNode) {
    actionNode = actionNode.listeners;
    for (var i = 0;i < actionNode.length; i++)
      (0, actionNode[i])();
  }
  function actionStateReducer(oldState, newState) {
    return newState;
  }
  function mountActionState(action, initialStateProp) {
    if (isHydrating) {
      var ssrFormState = workInProgressRoot.formState;
      if (ssrFormState !== null) {
        a: {
          var JSCompiler_inline_result = currentlyRenderingFiber;
          if (isHydrating) {
            if (nextHydratableInstance) {
              b: {
                var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
                for (var inRootOrSingleton = rootOrSingletonContext;JSCompiler_inline_result$jscomp$0.nodeType !== 8; ) {
                  if (!inRootOrSingleton) {
                    JSCompiler_inline_result$jscomp$0 = null;
                    break b;
                  }
                  JSCompiler_inline_result$jscomp$0 = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
                  if (JSCompiler_inline_result$jscomp$0 === null) {
                    JSCompiler_inline_result$jscomp$0 = null;
                    break b;
                  }
                }
                inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
                JSCompiler_inline_result$jscomp$0 = inRootOrSingleton === "F!" || inRootOrSingleton === "F" ? JSCompiler_inline_result$jscomp$0 : null;
              }
              if (JSCompiler_inline_result$jscomp$0) {
                nextHydratableInstance = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
                JSCompiler_inline_result = JSCompiler_inline_result$jscomp$0.data === "F!";
                break a;
              }
            }
            throwOnHydrationMismatch(JSCompiler_inline_result);
          }
          JSCompiler_inline_result = false;
        }
        JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
      }
    }
    ssrFormState = mountWorkInProgressHook();
    ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
    JSCompiler_inline_result = {
      pending: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: actionStateReducer,
      lastRenderedState: initialStateProp
    };
    ssrFormState.queue = JSCompiler_inline_result;
    ssrFormState = dispatchSetState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result);
    JSCompiler_inline_result.dispatch = ssrFormState;
    JSCompiler_inline_result = mountStateImpl(false);
    inRootOrSingleton = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, false, JSCompiler_inline_result.queue);
    JSCompiler_inline_result = mountWorkInProgressHook();
    JSCompiler_inline_result$jscomp$0 = {
      state: initialStateProp,
      dispatch: null,
      action,
      pending: null
    };
    JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
    ssrFormState = dispatchActionState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result$jscomp$0, inRootOrSingleton, ssrFormState);
    JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
    JSCompiler_inline_result.memoizedState = action;
    return [initialStateProp, ssrFormState, false];
  }
  function updateActionState(action) {
    var stateHook = updateWorkInProgressHook();
    return updateActionStateImpl(stateHook, currentHook, action);
  }
  function updateActionStateImpl(stateHook, currentStateHook, action) {
    currentStateHook = updateReducerImpl(stateHook, currentStateHook, actionStateReducer)[0];
    stateHook = updateReducer(basicStateReducer)[0];
    if (typeof currentStateHook === "object" && currentStateHook !== null && typeof currentStateHook.then === "function")
      try {
        var state = useThenable(currentStateHook);
      } catch (x) {
        if (x === SuspenseException)
          throw SuspenseActionException;
        throw x;
      }
    else
      state = currentStateHook;
    currentStateHook = updateWorkInProgressHook();
    var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
    action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(9, createEffectInstance(), actionStateActionEffect.bind(null, actionQueue, action), null));
    return [state, dispatch, stateHook];
  }
  function actionStateActionEffect(actionQueue, action) {
    actionQueue.action = action;
  }
  function rerenderActionState(action) {
    var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
    if (currentStateHook !== null)
      return updateActionStateImpl(stateHook, currentStateHook, action);
    updateWorkInProgressHook();
    stateHook = stateHook.memoizedState;
    currentStateHook = updateWorkInProgressHook();
    var dispatch = currentStateHook.queue.dispatch;
    currentStateHook.memoizedState = action;
    return [stateHook, dispatch, false];
  }
  function pushSimpleEffect(tag, inst, create, createDeps) {
    tag = { tag, create, deps: createDeps, inst, next: null };
    inst = currentlyRenderingFiber.updateQueue;
    inst === null && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
    create = inst.lastEffect;
    create === null ? inst.lastEffect = tag.next = tag : (createDeps = create.next, create.next = tag, tag.next = createDeps, inst.lastEffect = tag);
    return tag;
  }
  function createEffectInstance() {
    return { destroy: undefined, resource: undefined };
  }
  function updateRef() {
    return updateWorkInProgressHook().memoizedState;
  }
  function mountEffectImpl(fiberFlags, hookFlags, create, createDeps) {
    var hook = mountWorkInProgressHook();
    createDeps = createDeps === undefined ? null : createDeps;
    currentlyRenderingFiber.flags |= fiberFlags;
    hook.memoizedState = pushSimpleEffect(1 | hookFlags, createEffectInstance(), create, createDeps);
  }
  function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
    var hook = updateWorkInProgressHook();
    deps = deps === undefined ? null : deps;
    var inst = hook.memoizedState.inst;
    currentHook !== null && deps !== null && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(1 | hookFlags, inst, create, deps));
  }
  function mountEffect(create, createDeps) {
    mountEffectImpl(8390656, 8, create, createDeps);
  }
  function updateEffect(create, createDeps) {
    updateEffectImpl(2048, 8, create, createDeps);
  }
  function updateInsertionEffect(create, deps) {
    return updateEffectImpl(4, 2, create, deps);
  }
  function updateLayoutEffect(create, deps) {
    return updateEffectImpl(4, 4, create, deps);
  }
  function imperativeHandleEffect(create, ref) {
    if (typeof ref === "function") {
      create = create();
      var refCleanup = ref(create);
      return function() {
        typeof refCleanup === "function" ? refCleanup() : ref(null);
      };
    }
    if (ref !== null && ref !== undefined)
      return create = create(), ref.current = create, function() {
        ref.current = null;
      };
  }
  function updateImperativeHandle(ref, create, deps) {
    deps = deps !== null && deps !== undefined ? deps.concat([ref]) : null;
    updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
  }
  function mountDebugValue() {}
  function updateCallback(callback, deps) {
    var hook = updateWorkInProgressHook();
    deps = deps === undefined ? null : deps;
    var prevState = hook.memoizedState;
    if (deps !== null && areHookInputsEqual(deps, prevState[1]))
      return prevState[0];
    hook.memoizedState = [callback, deps];
    return callback;
  }
  function updateMemo(nextCreate, deps) {
    var hook = updateWorkInProgressHook();
    deps = deps === undefined ? null : deps;
    var prevState = hook.memoizedState;
    if (deps !== null && areHookInputsEqual(deps, prevState[1]))
      return prevState[0];
    prevState = nextCreate();
    if (shouldDoubleInvokeUserFnsInHooksDEV) {
      setIsStrictModeForDevtools(true);
      try {
        nextCreate();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }
    hook.memoizedState = [prevState, deps];
    return prevState;
  }
  function mountDeferredValueImpl(hook, value, initialValue) {
    if (initialValue === undefined || (renderLanes & 1073741824) !== 0)
      return hook.memoizedState = value;
    hook.memoizedState = initialValue;
    hook = requestDeferredLane();
    currentlyRenderingFiber.lanes |= hook;
    workInProgressRootSkippedLanes |= hook;
    return initialValue;
  }
  function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
    if (objectIs(value, prevValue))
      return value;
    if (currentTreeHiddenStackCursor.current !== null)
      return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
    if ((renderLanes & 42) === 0)
      return didReceiveUpdate = true, hook.memoizedState = value;
    hook = requestDeferredLane();
    currentlyRenderingFiber.lanes |= hook;
    workInProgressRootSkippedLanes |= hook;
    return prevValue;
  }
  function startTransition(fiber, queue, pendingState, finishedState, callback) {
    var previousPriority = ReactDOMSharedInternals.p;
    ReactDOMSharedInternals.p = previousPriority !== 0 && 8 > previousPriority ? previousPriority : 8;
    var prevTransition = ReactSharedInternals.T, currentTransition = {};
    ReactSharedInternals.T = currentTransition;
    dispatchOptimisticSetState(fiber, false, queue, pendingState);
    try {
      var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
      onStartTransitionFinish !== null && onStartTransitionFinish(currentTransition, returnValue);
      if (returnValue !== null && typeof returnValue === "object" && typeof returnValue.then === "function") {
        var thenableForFinishedState = chainThenableValue(returnValue, finishedState);
        dispatchSetStateInternal(fiber, queue, thenableForFinishedState, requestUpdateLane(fiber));
      } else
        dispatchSetStateInternal(fiber, queue, finishedState, requestUpdateLane(fiber));
    } catch (error) {
      dispatchSetStateInternal(fiber, queue, { then: function() {}, status: "rejected", reason: error }, requestUpdateLane());
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function noop$2() {}
  function startHostTransition(formFiber, pendingState, action, formData) {
    if (formFiber.tag !== 5)
      throw Error(formatProdErrorMessage(476));
    var queue = ensureFormComponentIsStateful(formFiber).queue;
    startTransition(formFiber, queue, pendingState, sharedNotPendingObject, action === null ? noop$2 : function() {
      requestFormReset$1(formFiber);
      return action(formData);
    });
  }
  function ensureFormComponentIsStateful(formFiber) {
    var existingStateHook = formFiber.memoizedState;
    if (existingStateHook !== null)
      return existingStateHook;
    existingStateHook = {
      memoizedState: sharedNotPendingObject,
      baseState: sharedNotPendingObject,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: sharedNotPendingObject
      },
      next: null
    };
    var initialResetState = {};
    existingStateHook.next = {
      memoizedState: initialResetState,
      baseState: initialResetState,
      baseQueue: null,
      queue: {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: basicStateReducer,
        lastRenderedState: initialResetState
      },
      next: null
    };
    formFiber.memoizedState = existingStateHook;
    formFiber = formFiber.alternate;
    formFiber !== null && (formFiber.memoizedState = existingStateHook);
    return existingStateHook;
  }
  function requestFormReset$1(formFiber) {
    var resetStateQueue = ensureFormComponentIsStateful(formFiber).next.queue;
    dispatchSetStateInternal(formFiber, resetStateQueue, {}, requestUpdateLane());
  }
  function useHostTransitionStatus() {
    return readContext(HostTransitionContext);
  }
  function updateId() {
    return updateWorkInProgressHook().memoizedState;
  }
  function updateRefresh() {
    return updateWorkInProgressHook().memoizedState;
  }
  function refreshCache(fiber) {
    for (var provider = fiber.return;provider !== null; ) {
      switch (provider.tag) {
        case 24:
        case 3:
          var lane = requestUpdateLane();
          fiber = createUpdate(lane);
          var root$41 = enqueueUpdate(provider, fiber, lane);
          root$41 !== null && (scheduleUpdateOnFiber(root$41, provider, lane), entangleTransitions(root$41, provider, lane));
          provider = { cache: createCache() };
          fiber.payload = provider;
          return;
      }
      provider = provider.return;
    }
  }
  function dispatchReducerAction(fiber, queue, action) {
    var lane = requestUpdateLane();
    action = {
      lane,
      revertLane: 0,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), action !== null && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
  }
  function dispatchSetState(fiber, queue, action) {
    var lane = requestUpdateLane();
    dispatchSetStateInternal(fiber, queue, action, lane);
  }
  function dispatchSetStateInternal(fiber, queue, action, lane) {
    var update = {
      lane,
      revertLane: 0,
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    if (isRenderPhaseUpdate(fiber))
      enqueueRenderPhaseUpdate(queue, update);
    else {
      var alternate = fiber.alternate;
      if (fiber.lanes === 0 && (alternate === null || alternate.lanes === 0) && (alternate = queue.lastRenderedReducer, alternate !== null))
        try {
          var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
          update.hasEagerState = true;
          update.eagerState = eagerState;
          if (objectIs(eagerState, currentState))
            return enqueueUpdate$1(fiber, queue, update, 0), workInProgressRoot === null && finishQueueingConcurrentUpdates(), false;
        } catch (error) {} finally {}
      action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
      if (action !== null)
        return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
    }
    return false;
  }
  function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
    action = {
      lane: 2,
      revertLane: requestTransitionLane(),
      action,
      hasEagerState: false,
      eagerState: null,
      next: null
    };
    if (isRenderPhaseUpdate(fiber)) {
      if (throwIfDuringRender)
        throw Error(formatProdErrorMessage(479));
    } else
      throwIfDuringRender = enqueueConcurrentHookUpdate(fiber, queue, action, 2), throwIfDuringRender !== null && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
  }
  function isRenderPhaseUpdate(fiber) {
    var alternate = fiber.alternate;
    return fiber === currentlyRenderingFiber || alternate !== null && alternate === currentlyRenderingFiber;
  }
  function enqueueRenderPhaseUpdate(queue, update) {
    didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
    var pending = queue.pending;
    pending === null ? update.next = update : (update.next = pending.next, pending.next = update);
    queue.pending = update;
  }
  function entangleTransitionUpdate(root2, queue, lane) {
    if ((lane & 4194048) !== 0) {
      var queueLanes = queue.lanes;
      queueLanes &= root2.pendingLanes;
      lane |= queueLanes;
      queue.lanes = lane;
      markRootEntangled(root2, lane);
    }
  }
  var ContextOnlyDispatcher = {
    readContext,
    use,
    useCallback: throwInvalidHookError,
    useContext: throwInvalidHookError,
    useEffect: throwInvalidHookError,
    useImperativeHandle: throwInvalidHookError,
    useLayoutEffect: throwInvalidHookError,
    useInsertionEffect: throwInvalidHookError,
    useMemo: throwInvalidHookError,
    useReducer: throwInvalidHookError,
    useRef: throwInvalidHookError,
    useState: throwInvalidHookError,
    useDebugValue: throwInvalidHookError,
    useDeferredValue: throwInvalidHookError,
    useTransition: throwInvalidHookError,
    useSyncExternalStore: throwInvalidHookError,
    useId: throwInvalidHookError,
    useHostTransitionStatus: throwInvalidHookError,
    useFormState: throwInvalidHookError,
    useActionState: throwInvalidHookError,
    useOptimistic: throwInvalidHookError,
    useMemoCache: throwInvalidHookError,
    useCacheRefresh: throwInvalidHookError
  };
  var HooksDispatcherOnMount = {
    readContext,
    use,
    useCallback: function(callback, deps) {
      mountWorkInProgressHook().memoizedState = [
        callback,
        deps === undefined ? null : deps
      ];
      return callback;
    },
    useContext: readContext,
    useEffect: mountEffect,
    useImperativeHandle: function(ref, create, deps) {
      deps = deps !== null && deps !== undefined ? deps.concat([ref]) : null;
      mountEffectImpl(4194308, 4, imperativeHandleEffect.bind(null, create, ref), deps);
    },
    useLayoutEffect: function(create, deps) {
      return mountEffectImpl(4194308, 4, create, deps);
    },
    useInsertionEffect: function(create, deps) {
      mountEffectImpl(4, 2, create, deps);
    },
    useMemo: function(nextCreate, deps) {
      var hook = mountWorkInProgressHook();
      deps = deps === undefined ? null : deps;
      var nextValue = nextCreate();
      if (shouldDoubleInvokeUserFnsInHooksDEV) {
        setIsStrictModeForDevtools(true);
        try {
          nextCreate();
        } finally {
          setIsStrictModeForDevtools(false);
        }
      }
      hook.memoizedState = [nextValue, deps];
      return nextValue;
    },
    useReducer: function(reducer, initialArg, init) {
      var hook = mountWorkInProgressHook();
      if (init !== undefined) {
        var initialState = init(initialArg);
        if (shouldDoubleInvokeUserFnsInHooksDEV) {
          setIsStrictModeForDevtools(true);
          try {
            init(initialArg);
          } finally {
            setIsStrictModeForDevtools(false);
          }
        }
      } else
        initialState = initialArg;
      hook.memoizedState = hook.baseState = initialState;
      reducer = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: reducer,
        lastRenderedState: initialState
      };
      hook.queue = reducer;
      reducer = reducer.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, reducer);
      return [hook.memoizedState, reducer];
    },
    useRef: function(initialValue) {
      var hook = mountWorkInProgressHook();
      initialValue = { current: initialValue };
      return hook.memoizedState = initialValue;
    },
    useState: function(initialState) {
      initialState = mountStateImpl(initialState);
      var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
      queue.dispatch = dispatch;
      return [initialState.memoizedState, dispatch];
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = mountWorkInProgressHook();
      return mountDeferredValueImpl(hook, value, initialValue);
    },
    useTransition: function() {
      var stateHook = mountStateImpl(false);
      stateHook = startTransition.bind(null, currentlyRenderingFiber, stateHook.queue, true, false);
      mountWorkInProgressHook().memoizedState = stateHook;
      return [false, stateHook];
    },
    useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
      var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
      if (isHydrating) {
        if (getServerSnapshot === undefined)
          throw Error(formatProdErrorMessage(407));
        getServerSnapshot = getServerSnapshot();
      } else {
        getServerSnapshot = getSnapshot();
        if (workInProgressRoot === null)
          throw Error(formatProdErrorMessage(349));
        (workInProgressRootRenderLanes & 124) !== 0 || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
      }
      hook.memoizedState = getServerSnapshot;
      var inst = { value: getServerSnapshot, getSnapshot };
      hook.queue = inst;
      mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
        subscribe
      ]);
      fiber.flags |= 2048;
      pushSimpleEffect(9, createEffectInstance(), updateStoreInstance.bind(null, fiber, inst, getServerSnapshot, getSnapshot), null);
      return getServerSnapshot;
    },
    useId: function() {
      var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
      if (isHydrating) {
        var JSCompiler_inline_result = treeContextOverflow;
        var idWithLeadingBit = treeContextId;
        JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
        identifierPrefix = "«" + identifierPrefix + "R" + JSCompiler_inline_result;
        JSCompiler_inline_result = localIdCounter++;
        0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
        identifierPrefix += "»";
      } else
        JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "«" + identifierPrefix + "r" + JSCompiler_inline_result.toString(32) + "»";
      return hook.memoizedState = identifierPrefix;
    },
    useHostTransitionStatus,
    useFormState: mountActionState,
    useActionState: mountActionState,
    useOptimistic: function(passthrough) {
      var hook = mountWorkInProgressHook();
      hook.memoizedState = hook.baseState = passthrough;
      var queue = {
        pending: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: null,
        lastRenderedState: null
      };
      hook.queue = queue;
      hook = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, true, queue);
      queue.dispatch = hook;
      return [passthrough, hook];
    },
    useMemoCache,
    useCacheRefresh: function() {
      return mountWorkInProgressHook().memoizedState = refreshCache.bind(null, currentlyRenderingFiber);
    }
  };
  var HooksDispatcherOnUpdate = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: updateReducer,
    useRef: updateRef,
    useState: function() {
      return updateReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
    },
    useTransition: function() {
      var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        typeof booleanOrThenable === "boolean" ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: updateActionState,
    useActionState: updateActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  var HooksDispatcherOnRerender = {
    readContext,
    use,
    useCallback: updateCallback,
    useContext: readContext,
    useEffect: updateEffect,
    useImperativeHandle: updateImperativeHandle,
    useInsertionEffect: updateInsertionEffect,
    useLayoutEffect: updateLayoutEffect,
    useMemo: updateMemo,
    useReducer: rerenderReducer,
    useRef: updateRef,
    useState: function() {
      return rerenderReducer(basicStateReducer);
    },
    useDebugValue: mountDebugValue,
    useDeferredValue: function(value, initialValue) {
      var hook = updateWorkInProgressHook();
      return currentHook === null ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
    },
    useTransition: function() {
      var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
      return [
        typeof booleanOrThenable === "boolean" ? booleanOrThenable : useThenable(booleanOrThenable),
        start
      ];
    },
    useSyncExternalStore: updateSyncExternalStore,
    useId: updateId,
    useHostTransitionStatus,
    useFormState: rerenderActionState,
    useActionState: rerenderActionState,
    useOptimistic: function(passthrough, reducer) {
      var hook = updateWorkInProgressHook();
      if (currentHook !== null)
        return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
      hook.baseState = passthrough;
      return [passthrough, hook.queue.dispatch];
    },
    useMemoCache,
    useCacheRefresh: updateRefresh
  };
  var thenableState = null;
  var thenableIndexCounter = 0;
  function unwrapThenable(thenable) {
    var index2 = thenableIndexCounter;
    thenableIndexCounter += 1;
    thenableState === null && (thenableState = []);
    return trackUsedThenable(thenableState, thenable, index2);
  }
  function coerceRef(workInProgress2, element) {
    element = element.props.ref;
    workInProgress2.ref = element !== undefined ? element : null;
  }
  function throwOnInvalidObjectType(returnFiber, newChild) {
    if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
      throw Error(formatProdErrorMessage(525));
    returnFiber = Object.prototype.toString.call(newChild);
    throw Error(formatProdErrorMessage(31, returnFiber === "[object Object]" ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber));
  }
  function resolveLazy(lazyType) {
    var init = lazyType._init;
    return init(lazyType._payload);
  }
  function createChildReconciler(shouldTrackSideEffects) {
    function deleteChild(returnFiber, childToDelete) {
      if (shouldTrackSideEffects) {
        var deletions = returnFiber.deletions;
        deletions === null ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
      }
    }
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
      if (!shouldTrackSideEffects)
        return null;
      for (;currentFirstChild !== null; )
        deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
      return null;
    }
    function mapRemainingChildren(currentFirstChild) {
      for (var existingChildren = new Map;currentFirstChild !== null; )
        currentFirstChild.key !== null ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
      return existingChildren;
    }
    function useFiber(fiber, pendingProps) {
      fiber = createWorkInProgress(fiber, pendingProps);
      fiber.index = 0;
      fiber.sibling = null;
      return fiber;
    }
    function placeChild(newFiber, lastPlacedIndex, newIndex) {
      newFiber.index = newIndex;
      if (!shouldTrackSideEffects)
        return newFiber.flags |= 1048576, lastPlacedIndex;
      newIndex = newFiber.alternate;
      if (newIndex !== null)
        return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
      newFiber.flags |= 67108866;
      return lastPlacedIndex;
    }
    function placeSingleChild(newFiber) {
      shouldTrackSideEffects && newFiber.alternate === null && (newFiber.flags |= 67108866);
      return newFiber;
    }
    function updateTextNode(returnFiber, current, textContent, lanes) {
      if (current === null || current.tag !== 6)
        return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
      current = useFiber(current, textContent);
      current.return = returnFiber;
      return current;
    }
    function updateElement(returnFiber, current, element, lanes) {
      var elementType = element.type;
      if (elementType === REACT_FRAGMENT_TYPE)
        return updateFragment(returnFiber, current, element.props.children, lanes, element.key);
      if (current !== null && (current.elementType === elementType || typeof elementType === "object" && elementType !== null && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
        return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
      current = createFiberFromTypeAndProps(element.type, element.key, element.props, null, returnFiber.mode, lanes);
      coerceRef(current, element);
      current.return = returnFiber;
      return current;
    }
    function updatePortal(returnFiber, current, portal, lanes) {
      if (current === null || current.tag !== 4 || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
        return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
      current = useFiber(current, portal.children || []);
      current.return = returnFiber;
      return current;
    }
    function updateFragment(returnFiber, current, fragment, lanes, key) {
      if (current === null || current.tag !== 7)
        return current = createFiberFromFragment(fragment, returnFiber.mode, lanes, key), current.return = returnFiber, current;
      current = useFiber(current, fragment);
      current.return = returnFiber;
      return current;
    }
    function createChild(returnFiber, newChild, lanes) {
      if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number" || typeof newChild === "bigint")
        return newChild = createFiberFromText("" + newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
      if (typeof newChild === "object" && newChild !== null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
          case REACT_PORTAL_TYPE:
            return newChild = createFiberFromPortal(newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
          case REACT_LAZY_TYPE:
            var init = newChild._init;
            newChild = init(newChild._payload);
            return createChild(returnFiber, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return newChild = createFiberFromFragment(newChild, returnFiber.mode, lanes, null), newChild.return = returnFiber, newChild;
        if (typeof newChild.then === "function")
          return createChild(returnFiber, unwrapThenable(newChild), lanes);
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return createChild(returnFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
        throwOnInvalidObjectType(returnFiber, newChild);
      }
      return null;
    }
    function updateSlot(returnFiber, oldFiber, newChild, lanes) {
      var key = oldFiber !== null ? oldFiber.key : null;
      if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number" || typeof newChild === "bigint")
        return key !== null ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
      if (typeof newChild === "object" && newChild !== null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
          case REACT_PORTAL_TYPE:
            return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
          case REACT_LAZY_TYPE:
            return key = newChild._init, newChild = key(newChild._payload), updateSlot(returnFiber, oldFiber, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return key !== null ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
        if (typeof newChild.then === "function")
          return updateSlot(returnFiber, oldFiber, unwrapThenable(newChild), lanes);
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return updateSlot(returnFiber, oldFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
        throwOnInvalidObjectType(returnFiber, newChild);
      }
      return null;
    }
    function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
      if (typeof newChild === "string" && newChild !== "" || typeof newChild === "number" || typeof newChild === "bigint")
        return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
      if (typeof newChild === "object" && newChild !== null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return existingChildren = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
          case REACT_PORTAL_TYPE:
            return existingChildren = existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
          case REACT_LAZY_TYPE:
            var init = newChild._init;
            newChild = init(newChild._payload);
            return updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes);
        }
        if (isArrayImpl(newChild) || getIteratorFn(newChild))
          return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
        if (typeof newChild.then === "function")
          return updateFromMap(existingChildren, returnFiber, newIdx, unwrapThenable(newChild), lanes);
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return updateFromMap(existingChildren, returnFiber, newIdx, readContextDuringReconciliation(returnFiber, newChild), lanes);
        throwOnInvalidObjectType(returnFiber, newChild);
      }
      return null;
    }
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null;oldFiber !== null && newIdx < newChildren.length; newIdx++) {
        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
        var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
        if (newFiber === null) {
          oldFiber === null && (oldFiber = nextOldFiber);
          break;
        }
        shouldTrackSideEffects && oldFiber && newFiber.alternate === null && deleteChild(returnFiber, oldFiber);
        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
        previousNewFiber === null ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
      }
      if (newIdx === newChildren.length)
        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
      if (oldFiber === null) {
        for (;newIdx < newChildren.length; newIdx++)
          oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), oldFiber !== null && (currentFirstChild = placeChild(oldFiber, currentFirstChild, newIdx), previousNewFiber === null ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      for (oldFiber = mapRemainingChildren(oldFiber);newIdx < newChildren.length; newIdx++)
        nextOldFiber = updateFromMap(oldFiber, returnFiber, newIdx, newChildren[newIdx], lanes), nextOldFiber !== null && (shouldTrackSideEffects && nextOldFiber.alternate !== null && oldFiber.delete(nextOldFiber.key === null ? newIdx : nextOldFiber.key), currentFirstChild = placeChild(nextOldFiber, currentFirstChild, newIdx), previousNewFiber === null ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
      shouldTrackSideEffects && oldFiber.forEach(function(child) {
        return deleteChild(returnFiber, child);
      });
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
      if (newChildren == null)
        throw Error(formatProdErrorMessage(151));
      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next();oldFiber !== null && !step.done; newIdx++, step = newChildren.next()) {
        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
        var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
        if (newFiber === null) {
          oldFiber === null && (oldFiber = nextOldFiber);
          break;
        }
        shouldTrackSideEffects && oldFiber && newFiber.alternate === null && deleteChild(returnFiber, oldFiber);
        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
        previousNewFiber === null ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
        previousNewFiber = newFiber;
        oldFiber = nextOldFiber;
      }
      if (step.done)
        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
      if (oldFiber === null) {
        for (;!step.done; newIdx++, step = newChildren.next())
          step = createChild(returnFiber, step.value, lanes), step !== null && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), previousNewFiber === null ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
        isHydrating && pushTreeFork(returnFiber, newIdx);
        return resultingFirstChild;
      }
      for (oldFiber = mapRemainingChildren(oldFiber);!step.done; newIdx++, step = newChildren.next())
        step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), step !== null && (shouldTrackSideEffects && step.alternate !== null && oldFiber.delete(step.key === null ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), previousNewFiber === null ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
      shouldTrackSideEffects && oldFiber.forEach(function(child) {
        return deleteChild(returnFiber, child);
      });
      isHydrating && pushTreeFork(returnFiber, newIdx);
      return resultingFirstChild;
    }
    function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
      typeof newChild === "object" && newChild !== null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null && (newChild = newChild.props.children);
      if (typeof newChild === "object" && newChild !== null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            a: {
              for (var key = newChild.key;currentFirstChild !== null; ) {
                if (currentFirstChild.key === key) {
                  key = newChild.type;
                  if (key === REACT_FRAGMENT_TYPE) {
                    if (currentFirstChild.tag === 7) {
                      deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
                      lanes = useFiber(currentFirstChild, newChild.props.children);
                      lanes.return = returnFiber;
                      returnFiber = lanes;
                      break a;
                    }
                  } else if (currentFirstChild.elementType === key || typeof key === "object" && key !== null && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
                    deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
                    lanes = useFiber(currentFirstChild, newChild.props);
                    coerceRef(lanes, newChild);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  }
                  deleteRemainingChildren(returnFiber, currentFirstChild);
                  break;
                } else
                  deleteChild(returnFiber, currentFirstChild);
                currentFirstChild = currentFirstChild.sibling;
              }
              newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(newChild.props.children, returnFiber.mode, lanes, newChild.key), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
            }
            return placeSingleChild(returnFiber);
          case REACT_PORTAL_TYPE:
            a: {
              for (key = newChild.key;currentFirstChild !== null; ) {
                if (currentFirstChild.key === key)
                  if (currentFirstChild.tag === 4 && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
                    deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
                    lanes = useFiber(currentFirstChild, newChild.children || []);
                    lanes.return = returnFiber;
                    returnFiber = lanes;
                    break a;
                  } else {
                    deleteRemainingChildren(returnFiber, currentFirstChild);
                    break;
                  }
                else
                  deleteChild(returnFiber, currentFirstChild);
                currentFirstChild = currentFirstChild.sibling;
              }
              lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
              lanes.return = returnFiber;
              returnFiber = lanes;
            }
            return placeSingleChild(returnFiber);
          case REACT_LAZY_TYPE:
            return key = newChild._init, newChild = key(newChild._payload), reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
        }
        if (isArrayImpl(newChild))
          return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
        if (getIteratorFn(newChild)) {
          key = getIteratorFn(newChild);
          if (typeof key !== "function")
            throw Error(formatProdErrorMessage(150));
          newChild = key.call(newChild);
          return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);
        }
        if (typeof newChild.then === "function")
          return reconcileChildFibersImpl(returnFiber, currentFirstChild, unwrapThenable(newChild), lanes);
        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
          return reconcileChildFibersImpl(returnFiber, currentFirstChild, readContextDuringReconciliation(returnFiber, newChild), lanes);
        throwOnInvalidObjectType(returnFiber, newChild);
      }
      return typeof newChild === "string" && newChild !== "" || typeof newChild === "number" || typeof newChild === "bigint" ? (newChild = "" + newChild, currentFirstChild !== null && currentFirstChild.tag === 6 ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
    }
    return function(returnFiber, currentFirstChild, newChild, lanes) {
      try {
        thenableIndexCounter = 0;
        var firstChildFiber = reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
        thenableState = null;
        return firstChildFiber;
      } catch (x) {
        if (x === SuspenseException || x === SuspenseActionException)
          throw x;
        var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
        fiber.lanes = lanes;
        fiber.return = returnFiber;
        return fiber;
      } finally {}
    };
  }
  var reconcileChildFibers = createChildReconciler(true);
  var mountChildFibers = createChildReconciler(false);
  var suspenseHandlerStackCursor = createCursor(null);
  var shellBoundary = null;
  function pushPrimaryTreeSuspenseHandler(handler) {
    var current = handler.alternate;
    push(suspenseStackCursor, suspenseStackCursor.current & 1);
    push(suspenseHandlerStackCursor, handler);
    shellBoundary === null && (current === null || currentTreeHiddenStackCursor.current !== null ? shellBoundary = handler : current.memoizedState !== null && (shellBoundary = handler));
  }
  function pushOffscreenSuspenseHandler(fiber) {
    if (fiber.tag === 22) {
      if (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), shellBoundary === null) {
        var current = fiber.alternate;
        current !== null && current.memoizedState !== null && (shellBoundary = fiber);
      }
    } else
      reuseSuspenseHandlerOnStack(fiber);
  }
  function reuseSuspenseHandlerOnStack() {
    push(suspenseStackCursor, suspenseStackCursor.current);
    push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
  }
  function popSuspenseHandler(fiber) {
    pop(suspenseHandlerStackCursor);
    shellBoundary === fiber && (shellBoundary = null);
    pop(suspenseStackCursor);
  }
  var suspenseStackCursor = createCursor(0);
  function findFirstSuspended(row) {
    for (var node = row;node !== null; ) {
      if (node.tag === 13) {
        var state = node.memoizedState;
        if (state !== null && (state = state.dehydrated, state === null || state.data === "$?" || isSuspenseInstanceFallback(state)))
          return node;
      } else if (node.tag === 19 && node.memoizedProps.revealOrder !== undefined) {
        if ((node.flags & 128) !== 0)
          return node;
      } else if (node.child !== null) {
        node.child.return = node;
        node = node.child;
        continue;
      }
      if (node === row)
        break;
      for (;node.sibling === null; ) {
        if (node.return === null || node.return === row)
          return null;
        node = node.return;
      }
      node.sibling.return = node.return;
      node = node.sibling;
    }
    return null;
  }
  function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
    ctor = workInProgress2.memoizedState;
    getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
    getDerivedStateFromProps = getDerivedStateFromProps === null || getDerivedStateFromProps === undefined ? ctor : assign({}, ctor, getDerivedStateFromProps);
    workInProgress2.memoizedState = getDerivedStateFromProps;
    workInProgress2.lanes === 0 && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
  }
  var classComponentUpdater = {
    enqueueSetState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.payload = payload;
      callback !== undefined && callback !== null && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      payload !== null && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueReplaceState: function(inst, payload, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 1;
      update.payload = payload;
      callback !== undefined && callback !== null && (update.callback = callback);
      payload = enqueueUpdate(inst, update, lane);
      payload !== null && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
    },
    enqueueForceUpdate: function(inst, callback) {
      inst = inst._reactInternals;
      var lane = requestUpdateLane(), update = createUpdate(lane);
      update.tag = 2;
      callback !== undefined && callback !== null && (update.callback = callback);
      callback = enqueueUpdate(inst, update, lane);
      callback !== null && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
    }
  };
  function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
    workInProgress2 = workInProgress2.stateNode;
    return typeof workInProgress2.shouldComponentUpdate === "function" ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
  }
  function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
    workInProgress2 = instance.state;
    typeof instance.componentWillReceiveProps === "function" && instance.componentWillReceiveProps(newProps, nextContext);
    typeof instance.UNSAFE_componentWillReceiveProps === "function" && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
    instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
  }
  function resolveClassComponentProps(Component, baseProps) {
    var newProps = baseProps;
    if ("ref" in baseProps) {
      newProps = {};
      for (var propName in baseProps)
        propName !== "ref" && (newProps[propName] = baseProps[propName]);
    }
    if (Component = Component.defaultProps) {
      newProps === baseProps && (newProps = assign({}, newProps));
      for (var propName$73 in Component)
        newProps[propName$73] === undefined && (newProps[propName$73] = Component[propName$73]);
    }
    return newProps;
  }
  var reportGlobalError = typeof reportError === "function" ? reportError : function(error) {
    if (typeof window === "object" && typeof window.ErrorEvent === "function") {
      var event = new window.ErrorEvent("error", {
        bubbles: true,
        cancelable: true,
        message: typeof error === "object" && error !== null && typeof error.message === "string" ? String(error.message) : String(error),
        error
      });
      if (!window.dispatchEvent(event))
        return;
    } else if (typeof process === "object" && typeof process.emit === "function") {
      process.emit("uncaughtException", error);
      return;
    }
    console.error(error);
  };
  function defaultOnUncaughtError(error) {
    reportGlobalError(error);
  }
  function defaultOnCaughtError(error) {
    console.error(error);
  }
  function defaultOnRecoverableError(error) {
    reportGlobalError(error);
  }
  function logUncaughtError(root2, errorInfo) {
    try {
      var onUncaughtError = root2.onUncaughtError;
      onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
    } catch (e$74) {
      setTimeout(function() {
        throw e$74;
      });
    }
  }
  function logCaughtError(root2, boundary, errorInfo) {
    try {
      var onCaughtError = root2.onCaughtError;
      onCaughtError(errorInfo.value, {
        componentStack: errorInfo.stack,
        errorBoundary: boundary.tag === 1 ? boundary.stateNode : null
      });
    } catch (e$75) {
      setTimeout(function() {
        throw e$75;
      });
    }
  }
  function createRootErrorUpdate(root2, errorInfo, lane) {
    lane = createUpdate(lane);
    lane.tag = 3;
    lane.payload = { element: null };
    lane.callback = function() {
      logUncaughtError(root2, errorInfo);
    };
    return lane;
  }
  function createClassErrorUpdate(lane) {
    lane = createUpdate(lane);
    lane.tag = 3;
    return lane;
  }
  function initializeClassErrorUpdate(update, root2, fiber, errorInfo) {
    var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
    if (typeof getDerivedStateFromError === "function") {
      var error = errorInfo.value;
      update.payload = function() {
        return getDerivedStateFromError(error);
      };
      update.callback = function() {
        logCaughtError(root2, fiber, errorInfo);
      };
    }
    var inst = fiber.stateNode;
    inst !== null && typeof inst.componentDidCatch === "function" && (update.callback = function() {
      logCaughtError(root2, fiber, errorInfo);
      typeof getDerivedStateFromError !== "function" && (legacyErrorBoundariesThatAlreadyFailed === null ? legacyErrorBoundariesThatAlreadyFailed = new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
      var stack = errorInfo.stack;
      this.componentDidCatch(errorInfo.value, {
        componentStack: stack !== null ? stack : ""
      });
    });
  }
  function throwException(root2, returnFiber, sourceFiber, value, rootRenderLanes) {
    sourceFiber.flags |= 32768;
    if (value !== null && typeof value === "object" && typeof value.then === "function") {
      returnFiber = sourceFiber.alternate;
      returnFiber !== null && propagateParentContextChanges(returnFiber, sourceFiber, rootRenderLanes, true);
      sourceFiber = suspenseHandlerStackCursor.current;
      if (sourceFiber !== null) {
        switch (sourceFiber.tag) {
          case 13:
            return shellBoundary === null ? renderDidSuspendDelayIfPossible() : sourceFiber.alternate === null && workInProgressRootExitStatus === 0 && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, returnFiber === null ? sourceFiber.updateQueue = new Set([value]) : returnFiber.add(value), attachPingListener(root2, value, rootRenderLanes)), false;
          case 22:
            return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, returnFiber === null ? (returnFiber = {
              transitions: null,
              markerInstances: null,
              retryQueue: new Set([value])
            }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, sourceFiber === null ? returnFiber.retryQueue = new Set([value]) : sourceFiber.add(value)), attachPingListener(root2, value, rootRenderLanes)), false;
        }
        throw Error(formatProdErrorMessage(435, sourceFiber.tag));
      }
      attachPingListener(root2, value, rootRenderLanes);
      renderDidSuspendDelayIfPossible();
      return false;
    }
    if (isHydrating)
      return returnFiber = suspenseHandlerStackCursor.current, returnFiber !== null ? ((returnFiber.flags & 65536) === 0 && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root2 = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root2, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
        cause: value
      }), queueHydrationError(createCapturedValueAtFiber(returnFiber, sourceFiber))), root2 = root2.current.alternate, root2.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root2.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(root2.stateNode, value, rootRenderLanes), enqueueCapturedUpdate(root2, rootRenderLanes), workInProgressRootExitStatus !== 4 && (workInProgressRootExitStatus = 2)), false;
    var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
    wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
    workInProgressRootConcurrentErrors === null ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
    workInProgressRootExitStatus !== 4 && (workInProgressRootExitStatus = 2);
    if (returnFiber === null)
      return true;
    value = createCapturedValueAtFiber(value, sourceFiber);
    sourceFiber = returnFiber;
    do {
      switch (sourceFiber.tag) {
        case 3:
          return sourceFiber.flags |= 65536, root2 = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root2, root2 = createRootErrorUpdate(sourceFiber.stateNode, value, root2), enqueueCapturedUpdate(sourceFiber, root2), false;
        case 1:
          if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, (sourceFiber.flags & 128) === 0 && (typeof returnFiber.getDerivedStateFromError === "function" || wrapperError !== null && typeof wrapperError.componentDidCatch === "function" && (legacyErrorBoundariesThatAlreadyFailed === null || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError))))
            return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(rootRenderLanes, root2, sourceFiber, value), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
      }
      sourceFiber = sourceFiber.return;
    } while (sourceFiber !== null);
    return false;
  }
  var SelectiveHydrationException = Error(formatProdErrorMessage(461));
  var didReceiveUpdate = false;
  function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
    workInProgress2.child = current === null ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(workInProgress2, current.child, nextChildren, renderLanes2);
  }
  function updateForwardRef(current, workInProgress2, Component, nextProps, renderLanes2) {
    Component = Component.render;
    var ref = workInProgress2.ref;
    if ("ref" in nextProps) {
      var propsWithoutRef = {};
      for (var key in nextProps)
        key !== "ref" && (propsWithoutRef[key] = nextProps[key]);
    } else
      propsWithoutRef = nextProps;
    prepareToReadContext(workInProgress2);
    nextProps = renderWithHooks(current, workInProgress2, Component, propsWithoutRef, ref, renderLanes2);
    key = checkDidRenderIdHook();
    if (current !== null && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && key && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    return workInProgress2.child;
  }
  function updateMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    if (current === null) {
      var type = Component.type;
      if (typeof type === "function" && !shouldConstruct(type) && type.defaultProps === undefined && Component.compare === null)
        return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(current, workInProgress2, type, nextProps, renderLanes2);
      current = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress2, workInProgress2.mode, renderLanes2);
      current.ref = workInProgress2.ref;
      current.return = workInProgress2;
      return workInProgress2.child = current;
    }
    type = current.child;
    if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
      var prevProps = type.memoizedProps;
      Component = Component.compare;
      Component = Component !== null ? Component : shallowEqual;
      if (Component(prevProps, nextProps) && current.ref === workInProgress2.ref)
        return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    workInProgress2.flags |= 1;
    current = createWorkInProgress(type, nextProps);
    current.ref = workInProgress2.ref;
    current.return = workInProgress2;
    return workInProgress2.child = current;
  }
  function updateSimpleMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    if (current !== null) {
      var prevProps = current.memoizedProps;
      if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
        if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
          (current.flags & 131072) !== 0 && (didReceiveUpdate = true);
        else
          return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    }
    return updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2);
  }
  function updateOffscreenComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, nextChildren = nextProps.children, prevState = current !== null ? current.memoizedState : null;
    if (nextProps.mode === "hidden") {
      if ((workInProgress2.flags & 128) !== 0) {
        nextProps = prevState !== null ? prevState.baseLanes | renderLanes2 : renderLanes2;
        if (current !== null) {
          nextChildren = workInProgress2.child = current.child;
          for (prevState = 0;nextChildren !== null; )
            prevState = prevState | nextChildren.lanes | nextChildren.childLanes, nextChildren = nextChildren.sibling;
          workInProgress2.childLanes = prevState & ~nextProps;
        } else
          workInProgress2.childLanes = 0, workInProgress2.child = null;
        return deferHiddenOffscreenComponent(current, workInProgress2, nextProps, renderLanes2);
      }
      if ((renderLanes2 & 536870912) !== 0)
        workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, current !== null && pushTransition(workInProgress2, prevState !== null ? prevState.cachePool : null), prevState !== null ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
      else
        return workInProgress2.lanes = workInProgress2.childLanes = 536870912, deferHiddenOffscreenComponent(current, workInProgress2, prevState !== null ? prevState.baseLanes | renderLanes2 : renderLanes2, renderLanes2);
    } else
      prevState !== null ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(workInProgress2), workInProgress2.memoizedState = null) : (current !== null && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack(workInProgress2));
    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
    return workInProgress2.child;
  }
  function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2) {
    var JSCompiler_inline_result = peekCacheFromPool();
    JSCompiler_inline_result = JSCompiler_inline_result === null ? null : { parent: CacheContext._currentValue, pool: JSCompiler_inline_result };
    workInProgress2.memoizedState = {
      baseLanes: nextBaseLanes,
      cachePool: JSCompiler_inline_result
    };
    current !== null && pushTransition(workInProgress2, null);
    reuseHiddenContextOnStack();
    pushOffscreenSuspenseHandler(workInProgress2);
    current !== null && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
    return null;
  }
  function markRef(current, workInProgress2) {
    var ref = workInProgress2.ref;
    if (ref === null)
      current !== null && current.ref !== null && (workInProgress2.flags |= 4194816);
    else {
      if (typeof ref !== "function" && typeof ref !== "object")
        throw Error(formatProdErrorMessage(284));
      if (current === null || current.ref !== ref)
        workInProgress2.flags |= 4194816;
    }
  }
  function updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    prepareToReadContext(workInProgress2);
    Component = renderWithHooks(current, workInProgress2, Component, nextProps, undefined, renderLanes2);
    nextProps = checkDidRenderIdHook();
    if (current !== null && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, Component, renderLanes2);
    return workInProgress2.child;
  }
  function replayFunctionComponent(current, workInProgress2, nextProps, Component, secondArg, renderLanes2) {
    prepareToReadContext(workInProgress2);
    workInProgress2.updateQueue = null;
    nextProps = renderWithHooksAgain(workInProgress2, Component, nextProps, secondArg);
    finishRenderingHooks(current);
    Component = checkDidRenderIdHook();
    if (current !== null && !didReceiveUpdate)
      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    isHydrating && Component && pushMaterializedTreeId(workInProgress2);
    workInProgress2.flags |= 1;
    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
    return workInProgress2.child;
  }
  function updateClassComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
    prepareToReadContext(workInProgress2);
    if (workInProgress2.stateNode === null) {
      var context = emptyContextObject, contextType = Component.contextType;
      typeof contextType === "object" && contextType !== null && (context = readContext(contextType));
      context = new Component(nextProps, context);
      workInProgress2.memoizedState = context.state !== null && context.state !== undefined ? context.state : null;
      context.updater = classComponentUpdater;
      workInProgress2.stateNode = context;
      context._reactInternals = workInProgress2;
      context = workInProgress2.stateNode;
      context.props = nextProps;
      context.state = workInProgress2.memoizedState;
      context.refs = {};
      initializeUpdateQueue(workInProgress2);
      contextType = Component.contextType;
      context.context = typeof contextType === "object" && contextType !== null ? readContext(contextType) : emptyContextObject;
      context.state = workInProgress2.memoizedState;
      contextType = Component.getDerivedStateFromProps;
      typeof contextType === "function" && (applyDerivedStateFromProps(workInProgress2, Component, contextType, nextProps), context.state = workInProgress2.memoizedState);
      typeof Component.getDerivedStateFromProps === "function" || typeof context.getSnapshotBeforeUpdate === "function" || typeof context.UNSAFE_componentWillMount !== "function" && typeof context.componentWillMount !== "function" || (contextType = context.state, typeof context.componentWillMount === "function" && context.componentWillMount(), typeof context.UNSAFE_componentWillMount === "function" && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
      typeof context.componentDidMount === "function" && (workInProgress2.flags |= 4194308);
      nextProps = true;
    } else if (current === null) {
      context = workInProgress2.stateNode;
      var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
      context.props = oldProps;
      var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
      contextType = emptyContextObject;
      typeof contextType$jscomp$0 === "object" && contextType$jscomp$0 !== null && (contextType = readContext(contextType$jscomp$0));
      var getDerivedStateFromProps = Component.getDerivedStateFromProps;
      contextType$jscomp$0 = typeof getDerivedStateFromProps === "function" || typeof context.getSnapshotBeforeUpdate === "function";
      unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
      contextType$jscomp$0 || typeof context.UNSAFE_componentWillReceiveProps !== "function" && typeof context.componentWillReceiveProps !== "function" || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(workInProgress2, context, nextProps, contextType);
      hasForceUpdate = false;
      var oldState = workInProgress2.memoizedState;
      context.state = oldState;
      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
      suspendIfUpdateReadFromEntangledAsyncAction();
      oldContext = workInProgress2.memoizedState;
      unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? (typeof getDerivedStateFromProps === "function" && (applyDerivedStateFromProps(workInProgress2, Component, getDerivedStateFromProps, nextProps), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(workInProgress2, Component, oldProps, nextProps, oldState, oldContext, contextType)) ? (contextType$jscomp$0 || typeof context.UNSAFE_componentWillMount !== "function" && typeof context.componentWillMount !== "function" || (typeof context.componentWillMount === "function" && context.componentWillMount(), typeof context.UNSAFE_componentWillMount === "function" && context.UNSAFE_componentWillMount()), typeof context.componentDidMount === "function" && (workInProgress2.flags |= 4194308)) : (typeof context.componentDidMount === "function" && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : (typeof context.componentDidMount === "function" && (workInProgress2.flags |= 4194308), nextProps = false);
    } else {
      context = workInProgress2.stateNode;
      cloneUpdateQueue(current, workInProgress2);
      contextType = workInProgress2.memoizedProps;
      contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
      context.props = contextType$jscomp$0;
      getDerivedStateFromProps = workInProgress2.pendingProps;
      oldState = context.context;
      oldContext = Component.contextType;
      oldProps = emptyContextObject;
      typeof oldContext === "object" && oldContext !== null && (oldProps = readContext(oldContext));
      unresolvedOldProps = Component.getDerivedStateFromProps;
      (oldContext = typeof unresolvedOldProps === "function" || typeof context.getSnapshotBeforeUpdate === "function") || typeof context.UNSAFE_componentWillReceiveProps !== "function" && typeof context.componentWillReceiveProps !== "function" || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(workInProgress2, context, nextProps, oldProps);
      hasForceUpdate = false;
      oldState = workInProgress2.memoizedState;
      context.state = oldState;
      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
      suspendIfUpdateReadFromEntangledAsyncAction();
      var newState = workInProgress2.memoizedState;
      contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || current !== null && current.dependencies !== null && checkIfContextChanged(current.dependencies) ? (typeof unresolvedOldProps === "function" && (applyDerivedStateFromProps(workInProgress2, Component, unresolvedOldProps, nextProps), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(workInProgress2, Component, contextType$jscomp$0, nextProps, oldState, newState, oldProps) || current !== null && current.dependencies !== null && checkIfContextChanged(current.dependencies)) ? (oldContext || typeof context.UNSAFE_componentWillUpdate !== "function" && typeof context.componentWillUpdate !== "function" || (typeof context.componentWillUpdate === "function" && context.componentWillUpdate(nextProps, newState, oldProps), typeof context.UNSAFE_componentWillUpdate === "function" && context.UNSAFE_componentWillUpdate(nextProps, newState, oldProps)), typeof context.componentDidUpdate === "function" && (workInProgress2.flags |= 4), typeof context.getSnapshotBeforeUpdate === "function" && (workInProgress2.flags |= 1024)) : (typeof context.componentDidUpdate !== "function" || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), typeof context.getSnapshotBeforeUpdate !== "function" || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : (typeof context.componentDidUpdate !== "function" || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), typeof context.getSnapshotBeforeUpdate !== "function" || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
    }
    context = nextProps;
    markRef(current, workInProgress2);
    nextProps = (workInProgress2.flags & 128) !== 0;
    context || nextProps ? (context = workInProgress2.stateNode, Component = nextProps && typeof Component.getDerivedStateFromError !== "function" ? null : context.render(), workInProgress2.flags |= 1, current !== null && nextProps ? (workInProgress2.child = reconcileChildFibers(workInProgress2, current.child, null, renderLanes2), workInProgress2.child = reconcileChildFibers(workInProgress2, null, Component, renderLanes2)) : reconcileChildren(current, workInProgress2, Component, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
    return current;
  }
  function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
    resetHydrationState();
    workInProgress2.flags |= 256;
    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
    return workInProgress2.child;
  }
  var SUSPENDED_MARKER = {
    dehydrated: null,
    treeContext: null,
    retryLane: 0,
    hydrationErrors: null
  };
  function mountSuspenseOffscreenState(renderLanes2) {
    return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
  }
  function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
    current = current !== null ? current.childLanes & ~renderLanes2 : 0;
    primaryTreeDidDefer && (current |= workInProgressDeferredLane);
    return current;
  }
  function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = (workInProgress2.flags & 128) !== 0, JSCompiler_temp;
    (JSCompiler_temp = didSuspend) || (JSCompiler_temp = current !== null && current.memoizedState === null ? false : (suspenseStackCursor.current & 2) !== 0);
    JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
    JSCompiler_temp = (workInProgress2.flags & 32) !== 0;
    workInProgress2.flags &= -33;
    if (current === null) {
      if (isHydrating) {
        showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack(workInProgress2);
        if (isHydrating) {
          var nextInstance = nextHydratableInstance, JSCompiler_temp$jscomp$0;
          if (JSCompiler_temp$jscomp$0 = nextInstance) {
            c: {
              JSCompiler_temp$jscomp$0 = nextInstance;
              for (nextInstance = rootOrSingletonContext;JSCompiler_temp$jscomp$0.nodeType !== 8; ) {
                if (!nextInstance) {
                  nextInstance = null;
                  break c;
                }
                JSCompiler_temp$jscomp$0 = getNextHydratable(JSCompiler_temp$jscomp$0.nextSibling);
                if (JSCompiler_temp$jscomp$0 === null) {
                  nextInstance = null;
                  break c;
                }
              }
              nextInstance = JSCompiler_temp$jscomp$0;
            }
            nextInstance !== null ? (workInProgress2.memoizedState = {
              dehydrated: nextInstance,
              treeContext: treeContextProvider !== null ? { id: treeContextId, overflow: treeContextOverflow } : null,
              retryLane: 536870912,
              hydrationErrors: null
            }, JSCompiler_temp$jscomp$0 = createFiberImplClass(18, null, null, 0), JSCompiler_temp$jscomp$0.stateNode = nextInstance, JSCompiler_temp$jscomp$0.return = workInProgress2, workInProgress2.child = JSCompiler_temp$jscomp$0, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, JSCompiler_temp$jscomp$0 = true) : JSCompiler_temp$jscomp$0 = false;
          }
          JSCompiler_temp$jscomp$0 || throwOnHydrationMismatch(workInProgress2);
        }
        nextInstance = workInProgress2.memoizedState;
        if (nextInstance !== null && (nextInstance = nextInstance.dehydrated, nextInstance !== null))
          return isSuspenseInstanceFallback(nextInstance) ? workInProgress2.lanes = 32 : workInProgress2.lanes = 536870912, null;
        popSuspenseHandler(workInProgress2);
      }
      nextInstance = nextProps.children;
      nextProps = nextProps.fallback;
      if (showFallback)
        return reuseSuspenseHandlerOnStack(workInProgress2), showFallback = workInProgress2.mode, nextInstance = mountWorkInProgressOffscreenFiber({ mode: "hidden", children: nextInstance }, showFallback), nextProps = createFiberFromFragment(nextProps, showFallback, renderLanes2, null), nextInstance.return = workInProgress2, nextProps.return = workInProgress2, nextInstance.sibling = nextProps, workInProgress2.child = nextInstance, showFallback = workInProgress2.child, showFallback.memoizedState = mountSuspenseOffscreenState(renderLanes2), showFallback.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes2), workInProgress2.memoizedState = SUSPENDED_MARKER, nextProps;
      pushPrimaryTreeSuspenseHandler(workInProgress2);
      return mountSuspensePrimaryChildren(workInProgress2, nextInstance);
    }
    JSCompiler_temp$jscomp$0 = current.memoizedState;
    if (JSCompiler_temp$jscomp$0 !== null && (nextInstance = JSCompiler_temp$jscomp$0.dehydrated, nextInstance !== null)) {
      if (didSuspend)
        workInProgress2.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, workInProgress2 = retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2)) : workInProgress2.memoizedState !== null ? (reuseSuspenseHandlerOnStack(workInProgress2), workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null) : (reuseSuspenseHandlerOnStack(workInProgress2), showFallback = nextProps.fallback, nextInstance = workInProgress2.mode, nextProps = mountWorkInProgressOffscreenFiber({ mode: "visible", children: nextProps.children }, nextInstance), showFallback = createFiberFromFragment(showFallback, nextInstance, renderLanes2, null), showFallback.flags |= 2, nextProps.return = workInProgress2, showFallback.return = workInProgress2, nextProps.sibling = showFallback, workInProgress2.child = nextProps, reconcileChildFibers(workInProgress2, current.child, null, renderLanes2), nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes2), workInProgress2.memoizedState = SUSPENDED_MARKER, workInProgress2 = showFallback);
      else if (pushPrimaryTreeSuspenseHandler(workInProgress2), isSuspenseInstanceFallback(nextInstance)) {
        JSCompiler_temp = nextInstance.nextSibling && nextInstance.nextSibling.dataset;
        if (JSCompiler_temp)
          var digest = JSCompiler_temp.dgst;
        JSCompiler_temp = digest;
        nextProps = Error(formatProdErrorMessage(419));
        nextProps.stack = "";
        nextProps.digest = JSCompiler_temp;
        queueHydrationError({ value: nextProps, source: null, stack: null });
        workInProgress2 = retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2);
      } else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress2, renderLanes2, false), JSCompiler_temp = (renderLanes2 & current.childLanes) !== 0, didReceiveUpdate || JSCompiler_temp) {
        JSCompiler_temp = workInProgressRoot;
        if (JSCompiler_temp !== null && (nextProps = renderLanes2 & -renderLanes2, nextProps = (nextProps & 42) !== 0 ? 1 : getBumpedLaneForHydrationByLane(nextProps), nextProps = (nextProps & (JSCompiler_temp.suspendedLanes | renderLanes2)) !== 0 ? 0 : nextProps, nextProps !== 0 && nextProps !== JSCompiler_temp$jscomp$0.retryLane))
          throw JSCompiler_temp$jscomp$0.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
        nextInstance.data === "$?" || renderDidSuspendDelayIfPossible();
        workInProgress2 = retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2);
      } else
        nextInstance.data === "$?" ? (workInProgress2.flags |= 192, workInProgress2.child = current.child, workInProgress2 = null) : (current = JSCompiler_temp$jscomp$0.treeContext, nextHydratableInstance = getNextHydratable(nextInstance.nextSibling), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, current !== null && (idStack[idStackIndex++] = treeContextId, idStack[idStackIndex++] = treeContextOverflow, idStack[idStackIndex++] = treeContextProvider, treeContextId = current.id, treeContextOverflow = current.overflow, treeContextProvider = workInProgress2), workInProgress2 = mountSuspensePrimaryChildren(workInProgress2, nextProps.children), workInProgress2.flags |= 4096);
      return workInProgress2;
    }
    if (showFallback)
      return reuseSuspenseHandlerOnStack(workInProgress2), showFallback = nextProps.fallback, nextInstance = workInProgress2.mode, JSCompiler_temp$jscomp$0 = current.child, digest = JSCompiler_temp$jscomp$0.sibling, nextProps = createWorkInProgress(JSCompiler_temp$jscomp$0, {
        mode: "hidden",
        children: nextProps.children
      }), nextProps.subtreeFlags = JSCompiler_temp$jscomp$0.subtreeFlags & 65011712, digest !== null ? showFallback = createWorkInProgress(digest, showFallback) : (showFallback = createFiberFromFragment(showFallback, nextInstance, renderLanes2, null), showFallback.flags |= 2), showFallback.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = showFallback, workInProgress2.child = nextProps, nextProps = showFallback, showFallback = workInProgress2.child, nextInstance = current.child.memoizedState, nextInstance === null ? nextInstance = mountSuspenseOffscreenState(renderLanes2) : (JSCompiler_temp$jscomp$0 = nextInstance.cachePool, JSCompiler_temp$jscomp$0 !== null ? (digest = CacheContext._currentValue, JSCompiler_temp$jscomp$0 = JSCompiler_temp$jscomp$0.parent !== digest ? { parent: digest, pool: digest } : JSCompiler_temp$jscomp$0) : JSCompiler_temp$jscomp$0 = getSuspendedCache(), nextInstance = {
        baseLanes: nextInstance.baseLanes | renderLanes2,
        cachePool: JSCompiler_temp$jscomp$0
      }), showFallback.memoizedState = nextInstance, showFallback.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes2), workInProgress2.memoizedState = SUSPENDED_MARKER, nextProps;
    pushPrimaryTreeSuspenseHandler(workInProgress2);
    renderLanes2 = current.child;
    current = renderLanes2.sibling;
    renderLanes2 = createWorkInProgress(renderLanes2, {
      mode: "visible",
      children: nextProps.children
    });
    renderLanes2.return = workInProgress2;
    renderLanes2.sibling = null;
    current !== null && (JSCompiler_temp = workInProgress2.deletions, JSCompiler_temp === null ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
    workInProgress2.child = renderLanes2;
    workInProgress2.memoizedState = null;
    return renderLanes2;
  }
  function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
    primaryChildren = mountWorkInProgressOffscreenFiber({ mode: "visible", children: primaryChildren }, workInProgress2.mode);
    primaryChildren.return = workInProgress2;
    return workInProgress2.child = primaryChildren;
  }
  function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
    offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
    offscreenProps.lanes = 0;
    offscreenProps.stateNode = {
      _visibility: 1,
      _pendingMarkers: null,
      _retryCache: null,
      _transitions: null
    };
    return offscreenProps;
  }
  function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
    current = mountSuspensePrimaryChildren(workInProgress2, workInProgress2.pendingProps.children);
    current.flags |= 2;
    workInProgress2.memoizedState = null;
    return current;
  }
  function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
    fiber.lanes |= renderLanes2;
    var alternate = fiber.alternate;
    alternate !== null && (alternate.lanes |= renderLanes2);
    scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
  }
  function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode) {
    var renderState = workInProgress2.memoizedState;
    renderState === null ? workInProgress2.memoizedState = {
      isBackwards,
      rendering: null,
      renderingStartTime: 0,
      last: lastContentRow,
      tail,
      tailMode
    } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode);
  }
  function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
    var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
    reconcileChildren(current, workInProgress2, nextProps.children, renderLanes2);
    nextProps = suspenseStackCursor.current;
    if ((nextProps & 2) !== 0)
      nextProps = nextProps & 1 | 2, workInProgress2.flags |= 128;
    else {
      if (current !== null && (current.flags & 128) !== 0)
        a:
          for (current = workInProgress2.child;current !== null; ) {
            if (current.tag === 13)
              current.memoizedState !== null && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
            else if (current.tag === 19)
              scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
            else if (current.child !== null) {
              current.child.return = current;
              current = current.child;
              continue;
            }
            if (current === workInProgress2)
              break a;
            for (;current.sibling === null; ) {
              if (current.return === null || current.return === workInProgress2)
                break a;
              current = current.return;
            }
            current.sibling.return = current.return;
            current = current.sibling;
          }
      nextProps &= 1;
    }
    push(suspenseStackCursor, nextProps);
    switch (revealOrder) {
      case "forwards":
        renderLanes2 = workInProgress2.child;
        for (revealOrder = null;renderLanes2 !== null; )
          current = renderLanes2.alternate, current !== null && findFirstSuspended(current) === null && (revealOrder = renderLanes2), renderLanes2 = renderLanes2.sibling;
        renderLanes2 = revealOrder;
        renderLanes2 === null ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null);
        initSuspenseListRenderState(workInProgress2, false, revealOrder, renderLanes2, tailMode);
        break;
      case "backwards":
        renderLanes2 = null;
        revealOrder = workInProgress2.child;
        for (workInProgress2.child = null;revealOrder !== null; ) {
          current = revealOrder.alternate;
          if (current !== null && findFirstSuspended(current) === null) {
            workInProgress2.child = revealOrder;
            break;
          }
          current = revealOrder.sibling;
          revealOrder.sibling = renderLanes2;
          renderLanes2 = revealOrder;
          revealOrder = current;
        }
        initSuspenseListRenderState(workInProgress2, true, renderLanes2, null, tailMode);
        break;
      case "together":
        initSuspenseListRenderState(workInProgress2, false, null, null, undefined);
        break;
      default:
        workInProgress2.memoizedState = null;
    }
    return workInProgress2.child;
  }
  function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
    current !== null && (workInProgress2.dependencies = current.dependencies);
    workInProgressRootSkippedLanes |= workInProgress2.lanes;
    if ((renderLanes2 & workInProgress2.childLanes) === 0)
      if (current !== null) {
        if (propagateParentContextChanges(current, workInProgress2, renderLanes2, false), (renderLanes2 & workInProgress2.childLanes) === 0)
          return null;
      } else
        return null;
    if (current !== null && workInProgress2.child !== current.child)
      throw Error(formatProdErrorMessage(153));
    if (workInProgress2.child !== null) {
      current = workInProgress2.child;
      renderLanes2 = createWorkInProgress(current, current.pendingProps);
      workInProgress2.child = renderLanes2;
      for (renderLanes2.return = workInProgress2;current.sibling !== null; )
        current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
      renderLanes2.sibling = null;
    }
    return workInProgress2.child;
  }
  function checkScheduledUpdateOrContext(current, renderLanes2) {
    if ((current.lanes & renderLanes2) !== 0)
      return true;
    current = current.dependencies;
    return current !== null && checkIfContextChanged(current) ? true : false;
  }
  function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
    switch (workInProgress2.tag) {
      case 3:
        pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
        resetHydrationState();
        break;
      case 27:
      case 5:
        pushHostContext(workInProgress2);
        break;
      case 4:
        pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
        break;
      case 10:
        pushProvider(workInProgress2, workInProgress2.type, workInProgress2.memoizedProps.value);
        break;
      case 13:
        var state = workInProgress2.memoizedState;
        if (state !== null) {
          if (state.dehydrated !== null)
            return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
          if ((renderLanes2 & workInProgress2.child.childLanes) !== 0)
            return updateSuspenseComponent(current, workInProgress2, renderLanes2);
          pushPrimaryTreeSuspenseHandler(workInProgress2);
          current = bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
          return current !== null ? current.sibling : null;
        }
        pushPrimaryTreeSuspenseHandler(workInProgress2);
        break;
      case 19:
        var didSuspendBefore = (current.flags & 128) !== 0;
        state = (renderLanes2 & workInProgress2.childLanes) !== 0;
        state || (propagateParentContextChanges(current, workInProgress2, renderLanes2, false), state = (renderLanes2 & workInProgress2.childLanes) !== 0);
        if (didSuspendBefore) {
          if (state)
            return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
          workInProgress2.flags |= 128;
        }
        didSuspendBefore = workInProgress2.memoizedState;
        didSuspendBefore !== null && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
        push(suspenseStackCursor, suspenseStackCursor.current);
        if (state)
          break;
        else
          return null;
      case 22:
      case 23:
        return workInProgress2.lanes = 0, updateOffscreenComponent(current, workInProgress2, renderLanes2);
      case 24:
        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
    }
    return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
  }
  function beginWork(current, workInProgress2, renderLanes2) {
    if (current !== null)
      if (current.memoizedProps !== workInProgress2.pendingProps)
        didReceiveUpdate = true;
      else {
        if (!checkScheduledUpdateOrContext(current, renderLanes2) && (workInProgress2.flags & 128) === 0)
          return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2);
        didReceiveUpdate = (current.flags & 131072) !== 0 ? true : false;
      }
    else
      didReceiveUpdate = false, isHydrating && (workInProgress2.flags & 1048576) !== 0 && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
    workInProgress2.lanes = 0;
    switch (workInProgress2.tag) {
      case 16:
        a: {
          current = workInProgress2.pendingProps;
          var lazyComponent = workInProgress2.elementType, init = lazyComponent._init;
          lazyComponent = init(lazyComponent._payload);
          workInProgress2.type = lazyComponent;
          if (typeof lazyComponent === "function")
            shouldConstruct(lazyComponent) ? (current = resolveClassComponentProps(lazyComponent, current), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(null, workInProgress2, lazyComponent, current, renderLanes2)) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(null, workInProgress2, lazyComponent, current, renderLanes2));
          else {
            if (lazyComponent !== undefined && lazyComponent !== null) {
              if (init = lazyComponent.$$typeof, init === REACT_FORWARD_REF_TYPE) {
                workInProgress2.tag = 11;
                workInProgress2 = updateForwardRef(null, workInProgress2, lazyComponent, current, renderLanes2);
                break a;
              } else if (init === REACT_MEMO_TYPE) {
                workInProgress2.tag = 14;
                workInProgress2 = updateMemoComponent(null, workInProgress2, lazyComponent, current, renderLanes2);
                break a;
              }
            }
            workInProgress2 = getComponentNameFromType(lazyComponent) || lazyComponent;
            throw Error(formatProdErrorMessage(306, workInProgress2, ""));
          }
        }
        return workInProgress2;
      case 0:
        return updateFunctionComponent(current, workInProgress2, workInProgress2.type, workInProgress2.pendingProps, renderLanes2);
      case 1:
        return lazyComponent = workInProgress2.type, init = resolveClassComponentProps(lazyComponent, workInProgress2.pendingProps), updateClassComponent(current, workInProgress2, lazyComponent, init, renderLanes2);
      case 3:
        a: {
          pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo);
          if (current === null)
            throw Error(formatProdErrorMessage(387));
          lazyComponent = workInProgress2.pendingProps;
          var prevState = workInProgress2.memoizedState;
          init = prevState.element;
          cloneUpdateQueue(current, workInProgress2);
          processUpdateQueue(workInProgress2, lazyComponent, null, renderLanes2);
          var nextState = workInProgress2.memoizedState;
          lazyComponent = nextState.cache;
          pushProvider(workInProgress2, CacheContext, lazyComponent);
          lazyComponent !== prevState.cache && propagateContextChanges(workInProgress2, [CacheContext], renderLanes2, true);
          suspendIfUpdateReadFromEntangledAsyncAction();
          lazyComponent = nextState.element;
          if (prevState.isDehydrated)
            if (prevState = {
              element: lazyComponent,
              isDehydrated: false,
              cache: nextState.cache
            }, workInProgress2.updateQueue.baseState = prevState, workInProgress2.memoizedState = prevState, workInProgress2.flags & 256) {
              workInProgress2 = mountHostRootWithoutHydrating(current, workInProgress2, lazyComponent, renderLanes2);
              break a;
            } else if (lazyComponent !== init) {
              init = createCapturedValueAtFiber(Error(formatProdErrorMessage(424)), workInProgress2);
              queueHydrationError(init);
              workInProgress2 = mountHostRootWithoutHydrating(current, workInProgress2, lazyComponent, renderLanes2);
              break a;
            } else {
              current = workInProgress2.stateNode.containerInfo;
              switch (current.nodeType) {
                case 9:
                  current = current.body;
                  break;
                default:
                  current = current.nodeName === "HTML" ? current.ownerDocument.body : current;
              }
              nextHydratableInstance = getNextHydratable(current.firstChild);
              hydrationParentFiber = workInProgress2;
              isHydrating = true;
              hydrationErrors = null;
              rootOrSingletonContext = true;
              renderLanes2 = mountChildFibers(workInProgress2, null, lazyComponent, renderLanes2);
              for (workInProgress2.child = renderLanes2;renderLanes2; )
                renderLanes2.flags = renderLanes2.flags & -3 | 4096, renderLanes2 = renderLanes2.sibling;
            }
          else {
            resetHydrationState();
            if (lazyComponent === init) {
              workInProgress2 = bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
              break a;
            }
            reconcileChildren(current, workInProgress2, lazyComponent, renderLanes2);
          }
          workInProgress2 = workInProgress2.child;
        }
        return workInProgress2;
      case 26:
        return markRef(current, workInProgress2), current === null ? (renderLanes2 = getResource(workInProgress2.type, null, workInProgress2.pendingProps, null)) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (renderLanes2 = workInProgress2.type, current = workInProgress2.pendingProps, lazyComponent = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current).createElement(renderLanes2), lazyComponent[internalInstanceKey] = workInProgress2, lazyComponent[internalPropsKey] = current, setInitialProperties(lazyComponent, renderLanes2, current), markNodeAsHoistable(lazyComponent), workInProgress2.stateNode = lazyComponent) : workInProgress2.memoizedState = getResource(workInProgress2.type, current.memoizedProps, workInProgress2.pendingProps, current.memoizedState), null;
      case 27:
        return pushHostContext(workInProgress2), current === null && isHydrating && (lazyComponent = workInProgress2.stateNode = resolveSingletonInstance(workInProgress2.type, workInProgress2.pendingProps, rootInstanceStackCursor.current), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, init = nextHydratableInstance, isSingletonScope(workInProgress2.type) ? (previousHydratableOnEnteringScopedSingleton = init, nextHydratableInstance = getNextHydratable(lazyComponent.firstChild)) : nextHydratableInstance = init), reconcileChildren(current, workInProgress2, workInProgress2.pendingProps.children, renderLanes2), markRef(current, workInProgress2), current === null && (workInProgress2.flags |= 4194304), workInProgress2.child;
      case 5:
        if (current === null && isHydrating) {
          if (init = lazyComponent = nextHydratableInstance)
            lazyComponent = canHydrateInstance(lazyComponent, workInProgress2.type, workInProgress2.pendingProps, rootOrSingletonContext), lazyComponent !== null ? (workInProgress2.stateNode = lazyComponent, hydrationParentFiber = workInProgress2, nextHydratableInstance = getNextHydratable(lazyComponent.firstChild), rootOrSingletonContext = false, init = true) : init = false;
          init || throwOnHydrationMismatch(workInProgress2);
        }
        pushHostContext(workInProgress2);
        init = workInProgress2.type;
        prevState = workInProgress2.pendingProps;
        nextState = current !== null ? current.memoizedProps : null;
        lazyComponent = prevState.children;
        shouldSetTextContent(init, prevState) ? lazyComponent = null : nextState !== null && shouldSetTextContent(init, nextState) && (workInProgress2.flags |= 32);
        workInProgress2.memoizedState !== null && (init = renderWithHooks(current, workInProgress2, TransitionAwareHostComponent, null, null, renderLanes2), HostTransitionContext._currentValue = init);
        markRef(current, workInProgress2);
        reconcileChildren(current, workInProgress2, lazyComponent, renderLanes2);
        return workInProgress2.child;
      case 6:
        if (current === null && isHydrating) {
          if (current = renderLanes2 = nextHydratableInstance)
            renderLanes2 = canHydrateTextInstance(renderLanes2, workInProgress2.pendingProps, rootOrSingletonContext), renderLanes2 !== null ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
          current || throwOnHydrationMismatch(workInProgress2);
        }
        return null;
      case 13:
        return updateSuspenseComponent(current, workInProgress2, renderLanes2);
      case 4:
        return pushHostContainer(workInProgress2, workInProgress2.stateNode.containerInfo), lazyComponent = workInProgress2.pendingProps, current === null ? workInProgress2.child = reconcileChildFibers(workInProgress2, null, lazyComponent, renderLanes2) : reconcileChildren(current, workInProgress2, lazyComponent, renderLanes2), workInProgress2.child;
      case 11:
        return updateForwardRef(current, workInProgress2, workInProgress2.type, workInProgress2.pendingProps, renderLanes2);
      case 7:
        return reconcileChildren(current, workInProgress2, workInProgress2.pendingProps, renderLanes2), workInProgress2.child;
      case 8:
        return reconcileChildren(current, workInProgress2, workInProgress2.pendingProps.children, renderLanes2), workInProgress2.child;
      case 12:
        return reconcileChildren(current, workInProgress2, workInProgress2.pendingProps.children, renderLanes2), workInProgress2.child;
      case 10:
        return lazyComponent = workInProgress2.pendingProps, pushProvider(workInProgress2, workInProgress2.type, lazyComponent.value), reconcileChildren(current, workInProgress2, lazyComponent.children, renderLanes2), workInProgress2.child;
      case 9:
        return init = workInProgress2.type._context, lazyComponent = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), init = readContext(init), lazyComponent = lazyComponent(init), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, lazyComponent, renderLanes2), workInProgress2.child;
      case 14:
        return updateMemoComponent(current, workInProgress2, workInProgress2.type, workInProgress2.pendingProps, renderLanes2);
      case 15:
        return updateSimpleMemoComponent(current, workInProgress2, workInProgress2.type, workInProgress2.pendingProps, renderLanes2);
      case 19:
        return updateSuspenseListComponent(current, workInProgress2, renderLanes2);
      case 31:
        return lazyComponent = workInProgress2.pendingProps, renderLanes2 = workInProgress2.mode, lazyComponent = {
          mode: lazyComponent.mode,
          children: lazyComponent.children
        }, current === null ? (renderLanes2 = mountWorkInProgressOffscreenFiber(lazyComponent, renderLanes2), renderLanes2.ref = workInProgress2.ref, workInProgress2.child = renderLanes2, renderLanes2.return = workInProgress2, workInProgress2 = renderLanes2) : (renderLanes2 = createWorkInProgress(current.child, lazyComponent), renderLanes2.ref = workInProgress2.ref, workInProgress2.child = renderLanes2, renderLanes2.return = workInProgress2, workInProgress2 = renderLanes2), workInProgress2;
      case 22:
        return updateOffscreenComponent(current, workInProgress2, renderLanes2);
      case 24:
        return prepareToReadContext(workInProgress2), lazyComponent = readContext(CacheContext), current === null ? (init = peekCacheFromPool(), init === null && (init = workInProgressRoot, prevState = createCache(), init.pooledCache = prevState, prevState.refCount++, prevState !== null && (init.pooledCacheLanes |= renderLanes2), init = prevState), workInProgress2.memoizedState = {
          parent: lazyComponent,
          cache: init
        }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, init)) : ((current.lanes & renderLanes2) !== 0 && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), init = current.memoizedState, prevState = workInProgress2.memoizedState, init.parent !== lazyComponent ? (init = { parent: lazyComponent, cache: lazyComponent }, workInProgress2.memoizedState = init, workInProgress2.lanes === 0 && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = init), pushProvider(workInProgress2, CacheContext, lazyComponent)) : (lazyComponent = prevState.cache, pushProvider(workInProgress2, CacheContext, lazyComponent), lazyComponent !== init.cache && propagateContextChanges(workInProgress2, [CacheContext], renderLanes2, true))), reconcileChildren(current, workInProgress2, workInProgress2.pendingProps.children, renderLanes2), workInProgress2.child;
      case 29:
        throw workInProgress2.pendingProps;
    }
    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
  }
  function markUpdate(workInProgress2) {
    workInProgress2.flags |= 4;
  }
  function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
    if (resource.type !== "stylesheet" || (resource.state.loading & 4) !== 0)
      workInProgress2.flags &= -16777217;
    else if (workInProgress2.flags |= 16777216, !preloadResource(resource)) {
      resource = suspenseHandlerStackCursor.current;
      if (resource !== null && ((workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? shellBoundary !== null : (workInProgressRootRenderLanes & 62914560) !== workInProgressRootRenderLanes && (workInProgressRootRenderLanes & 536870912) === 0 || resource !== shellBoundary))
        throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
      workInProgress2.flags |= 8192;
    }
  }
  function scheduleRetryEffect(workInProgress2, retryQueue) {
    retryQueue !== null && (workInProgress2.flags |= 4);
    workInProgress2.flags & 16384 && (retryQueue = workInProgress2.tag !== 22 ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
  }
  function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
    if (!isHydrating)
      switch (renderState.tailMode) {
        case "hidden":
          hasRenderedATailFallback = renderState.tail;
          for (var lastTailNode = null;hasRenderedATailFallback !== null; )
            hasRenderedATailFallback.alternate !== null && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
          lastTailNode === null ? renderState.tail = null : lastTailNode.sibling = null;
          break;
        case "collapsed":
          lastTailNode = renderState.tail;
          for (var lastTailNode$113 = null;lastTailNode !== null; )
            lastTailNode.alternate !== null && (lastTailNode$113 = lastTailNode), lastTailNode = lastTailNode.sibling;
          lastTailNode$113 === null ? hasRenderedATailFallback || renderState.tail === null ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$113.sibling = null;
      }
  }
  function bubbleProperties(completedWork) {
    var didBailout = completedWork.alternate !== null && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
    if (didBailout)
      for (var child$114 = completedWork.child;child$114 !== null; )
        newChildLanes |= child$114.lanes | child$114.childLanes, subtreeFlags |= child$114.subtreeFlags & 65011712, subtreeFlags |= child$114.flags & 65011712, child$114.return = completedWork, child$114 = child$114.sibling;
    else
      for (child$114 = completedWork.child;child$114 !== null; )
        newChildLanes |= child$114.lanes | child$114.childLanes, subtreeFlags |= child$114.subtreeFlags, subtreeFlags |= child$114.flags, child$114.return = completedWork, child$114 = child$114.sibling;
    completedWork.subtreeFlags |= subtreeFlags;
    completedWork.childLanes = newChildLanes;
    return didBailout;
  }
  function completeWork(current, workInProgress2, renderLanes2) {
    var newProps = workInProgress2.pendingProps;
    popTreeContext(workInProgress2);
    switch (workInProgress2.tag) {
      case 31:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return bubbleProperties(workInProgress2), null;
      case 1:
        return bubbleProperties(workInProgress2), null;
      case 3:
        renderLanes2 = workInProgress2.stateNode;
        newProps = null;
        current !== null && (newProps = current.memoizedState.cache);
        workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
        popProvider(CacheContext);
        popHostContainer();
        renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
        if (current === null || current.child === null)
          popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : current === null || current.memoizedState.isDehydrated && (workInProgress2.flags & 256) === 0 || (workInProgress2.flags |= 1024, upgradeHydrationErrorsToRecoverable());
        bubbleProperties(workInProgress2);
        return null;
      case 26:
        return renderLanes2 = workInProgress2.memoizedState, current === null ? (markUpdate(workInProgress2), renderLanes2 !== null ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, renderLanes2)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217)) : renderLanes2 ? renderLanes2 !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(workInProgress2, renderLanes2)) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (current.memoizedProps !== newProps && markUpdate(workInProgress2), bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217), null;
      case 27:
        popHostContext(workInProgress2);
        renderLanes2 = rootInstanceStackCursor.current;
        var type = workInProgress2.type;
        if (current !== null && workInProgress2.stateNode != null)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (!newProps) {
            if (workInProgress2.stateNode === null)
              throw Error(formatProdErrorMessage(166));
            bubbleProperties(workInProgress2);
            return null;
          }
          current = contextStackCursor.current;
          popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2, current) : (current = resolveSingletonInstance(type, newProps, renderLanes2), workInProgress2.stateNode = current, markUpdate(workInProgress2));
        }
        bubbleProperties(workInProgress2);
        return null;
      case 5:
        popHostContext(workInProgress2);
        renderLanes2 = workInProgress2.type;
        if (current !== null && workInProgress2.stateNode != null)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (!newProps) {
            if (workInProgress2.stateNode === null)
              throw Error(formatProdErrorMessage(166));
            bubbleProperties(workInProgress2);
            return null;
          }
          current = contextStackCursor.current;
          if (popHydrationState(workInProgress2))
            prepareToHydrateHostInstance(workInProgress2, current);
          else {
            type = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current);
            switch (current) {
              case 1:
                current = type.createElementNS("http://www.w3.org/2000/svg", renderLanes2);
                break;
              case 2:
                current = type.createElementNS("http://www.w3.org/1998/Math/MathML", renderLanes2);
                break;
              default:
                switch (renderLanes2) {
                  case "svg":
                    current = type.createElementNS("http://www.w3.org/2000/svg", renderLanes2);
                    break;
                  case "math":
                    current = type.createElementNS("http://www.w3.org/1998/Math/MathML", renderLanes2);
                    break;
                  case "script":
                    current = type.createElement("div");
                    current.innerHTML = "<script></script>";
                    current = current.removeChild(current.firstChild);
                    break;
                  case "select":
                    current = typeof newProps.is === "string" ? type.createElement("select", { is: newProps.is }) : type.createElement("select");
                    newProps.multiple ? current.multiple = true : newProps.size && (current.size = newProps.size);
                    break;
                  default:
                    current = typeof newProps.is === "string" ? type.createElement(renderLanes2, { is: newProps.is }) : type.createElement(renderLanes2);
                }
            }
            current[internalInstanceKey] = workInProgress2;
            current[internalPropsKey] = newProps;
            a:
              for (type = workInProgress2.child;type !== null; ) {
                if (type.tag === 5 || type.tag === 6)
                  current.appendChild(type.stateNode);
                else if (type.tag !== 4 && type.tag !== 27 && type.child !== null) {
                  type.child.return = type;
                  type = type.child;
                  continue;
                }
                if (type === workInProgress2)
                  break a;
                for (;type.sibling === null; ) {
                  if (type.return === null || type.return === workInProgress2)
                    break a;
                  type = type.return;
                }
                type.sibling.return = type.return;
                type = type.sibling;
              }
            workInProgress2.stateNode = current;
            a:
              switch (setInitialProperties(current, renderLanes2, newProps), renderLanes2) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  current = !!newProps.autoFocus;
                  break a;
                case "img":
                  current = true;
                  break a;
                default:
                  current = false;
              }
            current && markUpdate(workInProgress2);
          }
        }
        bubbleProperties(workInProgress2);
        workInProgress2.flags &= -16777217;
        return null;
      case 6:
        if (current && workInProgress2.stateNode != null)
          current.memoizedProps !== newProps && markUpdate(workInProgress2);
        else {
          if (typeof newProps !== "string" && workInProgress2.stateNode === null)
            throw Error(formatProdErrorMessage(166));
          current = rootInstanceStackCursor.current;
          if (popHydrationState(workInProgress2)) {
            current = workInProgress2.stateNode;
            renderLanes2 = workInProgress2.memoizedProps;
            newProps = null;
            type = hydrationParentFiber;
            if (type !== null)
              switch (type.tag) {
                case 27:
                case 5:
                  newProps = type.memoizedProps;
              }
            current[internalInstanceKey] = workInProgress2;
            current = current.nodeValue === renderLanes2 || newProps !== null && newProps.suppressHydrationWarning === true || checkForUnmatchedText(current.nodeValue, renderLanes2) ? true : false;
            current || throwOnHydrationMismatch(workInProgress2);
          } else
            current = getOwnerDocumentFromRootContainer(current).createTextNode(newProps), current[internalInstanceKey] = workInProgress2, workInProgress2.stateNode = current;
        }
        bubbleProperties(workInProgress2);
        return null;
      case 13:
        newProps = workInProgress2.memoizedState;
        if (current === null || current.memoizedState !== null && current.memoizedState.dehydrated !== null) {
          type = popHydrationState(workInProgress2);
          if (newProps !== null && newProps.dehydrated !== null) {
            if (current === null) {
              if (!type)
                throw Error(formatProdErrorMessage(318));
              type = workInProgress2.memoizedState;
              type = type !== null ? type.dehydrated : null;
              if (!type)
                throw Error(formatProdErrorMessage(317));
              type[internalInstanceKey] = workInProgress2;
            } else
              resetHydrationState(), (workInProgress2.flags & 128) === 0 && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
            bubbleProperties(workInProgress2);
            type = false;
          } else
            type = upgradeHydrationErrorsToRecoverable(), current !== null && current.memoizedState !== null && (current.memoizedState.hydrationErrors = type), type = true;
          if (!type) {
            if (workInProgress2.flags & 256)
              return popSuspenseHandler(workInProgress2), workInProgress2;
            popSuspenseHandler(workInProgress2);
            return null;
          }
        }
        popSuspenseHandler(workInProgress2);
        if ((workInProgress2.flags & 128) !== 0)
          return workInProgress2.lanes = renderLanes2, workInProgress2;
        renderLanes2 = newProps !== null;
        current = current !== null && current.memoizedState !== null;
        if (renderLanes2) {
          newProps = workInProgress2.child;
          type = null;
          newProps.alternate !== null && newProps.alternate.memoizedState !== null && newProps.alternate.memoizedState.cachePool !== null && (type = newProps.alternate.memoizedState.cachePool.pool);
          var cache$127 = null;
          newProps.memoizedState !== null && newProps.memoizedState.cachePool !== null && (cache$127 = newProps.memoizedState.cachePool.pool);
          cache$127 !== type && (newProps.flags |= 2048);
        }
        renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
        scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
        bubbleProperties(workInProgress2);
        return null;
      case 4:
        return popHostContainer(), current === null && listenToAllSupportedEvents(workInProgress2.stateNode.containerInfo), bubbleProperties(workInProgress2), null;
      case 10:
        return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
      case 19:
        pop(suspenseStackCursor);
        type = workInProgress2.memoizedState;
        if (type === null)
          return bubbleProperties(workInProgress2), null;
        newProps = (workInProgress2.flags & 128) !== 0;
        cache$127 = type.rendering;
        if (cache$127 === null)
          if (newProps)
            cutOffTailIfNeeded(type, false);
          else {
            if (workInProgressRootExitStatus !== 0 || current !== null && (current.flags & 128) !== 0)
              for (current = workInProgress2.child;current !== null; ) {
                cache$127 = findFirstSuspended(current);
                if (cache$127 !== null) {
                  workInProgress2.flags |= 128;
                  cutOffTailIfNeeded(type, false);
                  current = cache$127.updateQueue;
                  workInProgress2.updateQueue = current;
                  scheduleRetryEffect(workInProgress2, current);
                  workInProgress2.subtreeFlags = 0;
                  current = renderLanes2;
                  for (renderLanes2 = workInProgress2.child;renderLanes2 !== null; )
                    resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
                  push(suspenseStackCursor, suspenseStackCursor.current & 1 | 2);
                  return workInProgress2.child;
                }
                current = current.sibling;
              }
            type.tail !== null && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, newProps = true, cutOffTailIfNeeded(type, false), workInProgress2.lanes = 4194304);
          }
        else {
          if (!newProps)
            if (current = findFirstSuspended(cache$127), current !== null) {
              if (workInProgress2.flags |= 128, newProps = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(type, true), type.tail === null && type.tailMode === "hidden" && !cache$127.alternate && !isHydrating)
                return bubbleProperties(workInProgress2), null;
            } else
              2 * now() - type.renderingStartTime > workInProgressRootRenderTargetTime && renderLanes2 !== 536870912 && (workInProgress2.flags |= 128, newProps = true, cutOffTailIfNeeded(type, false), workInProgress2.lanes = 4194304);
          type.isBackwards ? (cache$127.sibling = workInProgress2.child, workInProgress2.child = cache$127) : (current = type.last, current !== null ? current.sibling = cache$127 : workInProgress2.child = cache$127, type.last = cache$127);
        }
        if (type.tail !== null)
          return workInProgress2 = type.tail, type.rendering = workInProgress2, type.tail = workInProgress2.sibling, type.renderingStartTime = now(), workInProgress2.sibling = null, current = suspenseStackCursor.current, push(suspenseStackCursor, newProps ? current & 1 | 2 : current & 1), workInProgress2;
        bubbleProperties(workInProgress2);
        return null;
      case 22:
      case 23:
        return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = workInProgress2.memoizedState !== null, current !== null ? current.memoizedState !== null !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? (renderLanes2 & 536870912) !== 0 && (workInProgress2.flags & 128) === 0 && (bubbleProperties(workInProgress2), workInProgress2.subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, renderLanes2 !== null && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, current !== null && current.memoizedState !== null && current.memoizedState.cachePool !== null && (renderLanes2 = current.memoizedState.cachePool.pool), newProps = null, workInProgress2.memoizedState !== null && workInProgress2.memoizedState.cachePool !== null && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), current !== null && pop(resumedCache), null;
      case 24:
        return renderLanes2 = null, current !== null && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
      case 25:
        return null;
      case 30:
        return null;
    }
    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
  }
  function unwindWork(current, workInProgress2) {
    popTreeContext(workInProgress2);
    switch (workInProgress2.tag) {
      case 1:
        return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 3:
        return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, (current & 65536) !== 0 && (current & 128) === 0 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 26:
      case 27:
      case 5:
        return popHostContext(workInProgress2), null;
      case 13:
        popSuspenseHandler(workInProgress2);
        current = workInProgress2.memoizedState;
        if (current !== null && current.dehydrated !== null) {
          if (workInProgress2.alternate === null)
            throw Error(formatProdErrorMessage(340));
          resetHydrationState();
        }
        current = workInProgress2.flags;
        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 19:
        return pop(suspenseStackCursor), null;
      case 4:
        return popHostContainer(), null;
      case 10:
        return popProvider(workInProgress2.type), null;
      case 22:
      case 23:
        return popSuspenseHandler(workInProgress2), popHiddenContext(), current !== null && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
      case 24:
        return popProvider(CacheContext), null;
      case 25:
        return null;
      default:
        return null;
    }
  }
  function unwindInterruptedWork(current, interruptedWork) {
    popTreeContext(interruptedWork);
    switch (interruptedWork.tag) {
      case 3:
        popProvider(CacheContext);
        popHostContainer();
        break;
      case 26:
      case 27:
      case 5:
        popHostContext(interruptedWork);
        break;
      case 4:
        popHostContainer();
        break;
      case 13:
        popSuspenseHandler(interruptedWork);
        break;
      case 19:
        pop(suspenseStackCursor);
        break;
      case 10:
        popProvider(interruptedWork.type);
        break;
      case 22:
      case 23:
        popSuspenseHandler(interruptedWork);
        popHiddenContext();
        current !== null && pop(resumedCache);
        break;
      case 24:
        popProvider(CacheContext);
    }
  }
  function commitHookEffectListMount(flags, finishedWork) {
    try {
      var updateQueue = finishedWork.updateQueue, lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
      if (lastEffect !== null) {
        var firstEffect = lastEffect.next;
        updateQueue = firstEffect;
        do {
          if ((updateQueue.tag & flags) === flags) {
            lastEffect = undefined;
            var { create, inst } = updateQueue;
            lastEffect = create();
            inst.destroy = lastEffect;
          }
          updateQueue = updateQueue.next;
        } while (updateQueue !== firstEffect);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
    try {
      var updateQueue = finishedWork.updateQueue, lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
      if (lastEffect !== null) {
        var firstEffect = lastEffect.next;
        updateQueue = firstEffect;
        do {
          if ((updateQueue.tag & flags) === flags) {
            var inst = updateQueue.inst, destroy = inst.destroy;
            if (destroy !== undefined) {
              inst.destroy = undefined;
              lastEffect = finishedWork;
              var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
              try {
                destroy_();
              } catch (error) {
                captureCommitPhaseError(lastEffect, nearestMountedAncestor, error);
              }
            }
          }
          updateQueue = updateQueue.next;
        } while (updateQueue !== firstEffect);
      }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitClassCallbacks(finishedWork) {
    var updateQueue = finishedWork.updateQueue;
    if (updateQueue !== null) {
      var instance = finishedWork.stateNode;
      try {
        commitCallbacks(updateQueue, instance);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
    }
  }
  function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
    instance.props = resolveClassComponentProps(current.type, current.memoizedProps);
    instance.state = current.memoizedState;
    try {
      instance.componentWillUnmount();
    } catch (error) {
      captureCommitPhaseError(current, nearestMountedAncestor, error);
    }
  }
  function safelyAttachRef(current, nearestMountedAncestor) {
    try {
      var ref = current.ref;
      if (ref !== null) {
        switch (current.tag) {
          case 26:
          case 27:
          case 5:
            var instanceToUse = current.stateNode;
            break;
          case 30:
            instanceToUse = current.stateNode;
            break;
          default:
            instanceToUse = current.stateNode;
        }
        typeof ref === "function" ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
      }
    } catch (error) {
      captureCommitPhaseError(current, nearestMountedAncestor, error);
    }
  }
  function safelyDetachRef(current, nearestMountedAncestor) {
    var { ref, refCleanup } = current;
    if (ref !== null)
      if (typeof refCleanup === "function")
        try {
          refCleanup();
        } catch (error) {
          captureCommitPhaseError(current, nearestMountedAncestor, error);
        } finally {
          current.refCleanup = null, current = current.alternate, current != null && (current.refCleanup = null);
        }
      else if (typeof ref === "function")
        try {
          ref(null);
        } catch (error$143) {
          captureCommitPhaseError(current, nearestMountedAncestor, error$143);
        }
      else
        ref.current = null;
  }
  function commitHostMount(finishedWork) {
    var { type, memoizedProps: props, stateNode: instance } = finishedWork;
    try {
      a:
        switch (type) {
          case "button":
          case "input":
          case "select":
          case "textarea":
            props.autoFocus && instance.focus();
            break a;
          case "img":
            props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
        }
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function commitHostUpdate(finishedWork, newProps, oldProps) {
    try {
      var domElement = finishedWork.stateNode;
      updateProperties(domElement, finishedWork.type, oldProps, newProps);
      domElement[internalPropsKey] = newProps;
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  function isHostParent(fiber) {
    return fiber.tag === 5 || fiber.tag === 3 || fiber.tag === 26 || fiber.tag === 27 && isSingletonScope(fiber.type) || fiber.tag === 4;
  }
  function getHostSibling(fiber) {
    a:
      for (;; ) {
        for (;fiber.sibling === null; ) {
          if (fiber.return === null || isHostParent(fiber.return))
            return null;
          fiber = fiber.return;
        }
        fiber.sibling.return = fiber.return;
        for (fiber = fiber.sibling;fiber.tag !== 5 && fiber.tag !== 6 && fiber.tag !== 18; ) {
          if (fiber.tag === 27 && isSingletonScope(fiber.type))
            continue a;
          if (fiber.flags & 2)
            continue a;
          if (fiber.child === null || fiber.tag === 4)
            continue a;
          else
            fiber.child.return = fiber, fiber = fiber.child;
        }
        if (!(fiber.flags & 2))
          return fiber.stateNode;
      }
  }
  function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
    var tag = node.tag;
    if (tag === 5 || tag === 6)
      node = node.stateNode, before ? (parent.nodeType === 9 ? parent.body : parent.nodeName === "HTML" ? parent.ownerDocument.body : parent).insertBefore(node, before) : (before = parent.nodeType === 9 ? parent.body : parent.nodeName === "HTML" ? parent.ownerDocument.body : parent, before.appendChild(node), parent = parent._reactRootContainer, parent !== null && parent !== undefined || before.onclick !== null || (before.onclick = noop$1));
    else if (tag !== 4 && (tag === 27 && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, node !== null))
      for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;node !== null; )
        insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
  }
  function insertOrAppendPlacementNode(node, before, parent) {
    var tag = node.tag;
    if (tag === 5 || tag === 6)
      node = node.stateNode, before ? parent.insertBefore(node, before) : parent.appendChild(node);
    else if (tag !== 4 && (tag === 27 && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, node !== null))
      for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling;node !== null; )
        insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
  }
  function commitHostSingletonAcquisition(finishedWork) {
    var { stateNode: singleton, memoizedProps: props } = finishedWork;
    try {
      for (var type = finishedWork.type, attributes = singleton.attributes;attributes.length; )
        singleton.removeAttributeNode(attributes[0]);
      setInitialProperties(singleton, type, props);
      singleton[internalInstanceKey] = finishedWork;
      singleton[internalPropsKey] = props;
    } catch (error) {
      captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }
  }
  var offscreenSubtreeIsHidden = false;
  var offscreenSubtreeWasHidden = false;
  var needsFormReset = false;
  var PossiblyWeakSet = typeof WeakSet === "function" ? WeakSet : Set;
  var nextEffect = null;
  function commitBeforeMutationEffects(root2, firstChild) {
    root2 = root2.containerInfo;
    eventsEnabled = _enabled;
    root2 = getActiveElementDeep(root2);
    if (hasSelectionCapabilities(root2)) {
      if ("selectionStart" in root2)
        var JSCompiler_temp = {
          start: root2.selectionStart,
          end: root2.selectionEnd
        };
      else
        a: {
          JSCompiler_temp = (JSCompiler_temp = root2.ownerDocument) && JSCompiler_temp.defaultView || window;
          var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
          if (selection && selection.rangeCount !== 0) {
            JSCompiler_temp = selection.anchorNode;
            var { anchorOffset, focusNode } = selection;
            selection = selection.focusOffset;
            try {
              JSCompiler_temp.nodeType, focusNode.nodeType;
            } catch (e$20) {
              JSCompiler_temp = null;
              break a;
            }
            var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root2, parentNode = null;
            b:
              for (;; ) {
                for (var next;; ) {
                  node !== JSCompiler_temp || anchorOffset !== 0 && node.nodeType !== 3 || (start = length + anchorOffset);
                  node !== focusNode || selection !== 0 && node.nodeType !== 3 || (end = length + selection);
                  node.nodeType === 3 && (length += node.nodeValue.length);
                  if ((next = node.firstChild) === null)
                    break;
                  parentNode = node;
                  node = next;
                }
                for (;; ) {
                  if (node === root2)
                    break b;
                  parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
                  parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
                  if ((next = node.nextSibling) !== null)
                    break;
                  node = parentNode;
                  parentNode = node.parentNode;
                }
                node = next;
              }
            JSCompiler_temp = start === -1 || end === -1 ? null : { start, end };
          } else
            JSCompiler_temp = null;
        }
      JSCompiler_temp = JSCompiler_temp || { start: 0, end: 0 };
    } else
      JSCompiler_temp = null;
    selectionInformation = { focusedElem: root2, selectionRange: JSCompiler_temp };
    _enabled = false;
    for (nextEffect = firstChild;nextEffect !== null; )
      if (firstChild = nextEffect, root2 = firstChild.child, (firstChild.subtreeFlags & 1024) !== 0 && root2 !== null)
        root2.return = firstChild, nextEffect = root2;
      else
        for (;nextEffect !== null; ) {
          firstChild = nextEffect;
          focusNode = firstChild.alternate;
          root2 = firstChild.flags;
          switch (firstChild.tag) {
            case 0:
              break;
            case 11:
            case 15:
              break;
            case 1:
              if ((root2 & 1024) !== 0 && focusNode !== null) {
                root2 = undefined;
                JSCompiler_temp = firstChild;
                anchorOffset = focusNode.memoizedProps;
                focusNode = focusNode.memoizedState;
                selection = JSCompiler_temp.stateNode;
                try {
                  var resolvedPrevProps = resolveClassComponentProps(JSCompiler_temp.type, anchorOffset, JSCompiler_temp.elementType === JSCompiler_temp.type);
                  root2 = selection.getSnapshotBeforeUpdate(resolvedPrevProps, focusNode);
                  selection.__reactInternalSnapshotBeforeUpdate = root2;
                } catch (error) {
                  captureCommitPhaseError(JSCompiler_temp, JSCompiler_temp.return, error);
                }
              }
              break;
            case 3:
              if ((root2 & 1024) !== 0) {
                if (root2 = firstChild.stateNode.containerInfo, JSCompiler_temp = root2.nodeType, JSCompiler_temp === 9)
                  clearContainerSparingly(root2);
                else if (JSCompiler_temp === 1)
                  switch (root2.nodeName) {
                    case "HEAD":
                    case "HTML":
                    case "BODY":
                      clearContainerSparingly(root2);
                      break;
                    default:
                      root2.textContent = "";
                  }
              }
              break;
            case 5:
            case 26:
            case 27:
            case 6:
            case 4:
            case 17:
              break;
            default:
              if ((root2 & 1024) !== 0)
                throw Error(formatProdErrorMessage(163));
          }
          root2 = firstChild.sibling;
          if (root2 !== null) {
            root2.return = firstChild.return;
            nextEffect = root2;
            break;
          }
          nextEffect = firstChild.return;
        }
  }
  function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
    var flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitHookEffectListMount(5, finishedWork);
        break;
      case 1:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        if (flags & 4)
          if (finishedRoot = finishedWork.stateNode, current === null)
            try {
              finishedRoot.componentDidMount();
            } catch (error) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          else {
            var prevProps = resolveClassComponentProps(finishedWork.type, current.memoizedProps);
            current = current.memoizedState;
            try {
              finishedRoot.componentDidUpdate(prevProps, current, finishedRoot.__reactInternalSnapshotBeforeUpdate);
            } catch (error$142) {
              captureCommitPhaseError(finishedWork, finishedWork.return, error$142);
            }
          }
        flags & 64 && commitClassCallbacks(finishedWork);
        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 3:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        if (flags & 64 && (finishedRoot = finishedWork.updateQueue, finishedRoot !== null)) {
          current = null;
          if (finishedWork.child !== null)
            switch (finishedWork.child.tag) {
              case 27:
              case 5:
                current = finishedWork.child.stateNode;
                break;
              case 1:
                current = finishedWork.child.stateNode;
            }
          try {
            commitCallbacks(finishedRoot, current);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        break;
      case 27:
        current === null && flags & 4 && commitHostSingletonAcquisition(finishedWork);
      case 26:
      case 5:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        current === null && flags & 4 && commitHostMount(finishedWork);
        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
        break;
      case 12:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        break;
      case 13:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
        flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
        flags & 64 && (finishedRoot = finishedWork.memoizedState, finishedRoot !== null && (finishedRoot = finishedRoot.dehydrated, finishedRoot !== null && (finishedWork = retryDehydratedSuspenseBoundary.bind(null, finishedWork), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
        break;
      case 22:
        flags = finishedWork.memoizedState !== null || offscreenSubtreeIsHidden;
        if (!flags) {
          current = current !== null && current.memoizedState !== null || offscreenSubtreeWasHidden;
          prevProps = offscreenSubtreeIsHidden;
          var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
          offscreenSubtreeIsHidden = flags;
          (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, (finishedWork.subtreeFlags & 8772) !== 0) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
          offscreenSubtreeIsHidden = prevProps;
          offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        }
        break;
      case 30:
        break;
      default:
        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
    }
  }
  function detachFiberAfterEffects(fiber) {
    var alternate = fiber.alternate;
    alternate !== null && (fiber.alternate = null, detachFiberAfterEffects(alternate));
    fiber.child = null;
    fiber.deletions = null;
    fiber.sibling = null;
    fiber.tag === 5 && (alternate = fiber.stateNode, alternate !== null && detachDeletedInstance(alternate));
    fiber.stateNode = null;
    fiber.return = null;
    fiber.dependencies = null;
    fiber.memoizedProps = null;
    fiber.memoizedState = null;
    fiber.pendingProps = null;
    fiber.stateNode = null;
    fiber.updateQueue = null;
  }
  var hostParent = null;
  var hostParentIsContainer = false;
  function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
    for (parent = parent.child;parent !== null; )
      commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
  }
  function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
    if (injectedHook && typeof injectedHook.onCommitFiberUnmount === "function")
      try {
        injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
      } catch (err) {}
    switch (deletedFiber.tag) {
      case 26:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
        deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
        break;
      case 27:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
        var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
        isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
        releaseSingletonInstance(deletedFiber.stateNode);
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        break;
      case 5:
        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
      case 6:
        prevHostParent = hostParent;
        prevHostParentIsContainer = hostParentIsContainer;
        hostParent = null;
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        if (hostParent !== null)
          if (hostParentIsContainer)
            try {
              (hostParent.nodeType === 9 ? hostParent.body : hostParent.nodeName === "HTML" ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode);
            } catch (error) {
              captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
            }
          else
            try {
              hostParent.removeChild(deletedFiber.stateNode);
            } catch (error) {
              captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
            }
        break;
      case 18:
        hostParent !== null && (hostParentIsContainer ? (finishedRoot = hostParent, clearSuspenseBoundary(finishedRoot.nodeType === 9 ? finishedRoot.body : finishedRoot.nodeName === "HTML" ? finishedRoot.ownerDocument.body : finishedRoot, deletedFiber.stateNode), retryIfBlockedOn(finishedRoot)) : clearSuspenseBoundary(hostParent, deletedFiber.stateNode));
        break;
      case 4:
        prevHostParent = hostParent;
        prevHostParentIsContainer = hostParentIsContainer;
        hostParent = deletedFiber.stateNode.containerInfo;
        hostParentIsContainer = true;
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        offscreenSubtreeWasHidden || commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
        offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
        break;
      case 1:
        offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, typeof prevHostParent.componentWillUnmount === "function" && safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, prevHostParent));
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
        break;
      case 21:
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
        break;
      case 22:
        offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || deletedFiber.memoizedState !== null;
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
        offscreenSubtreeWasHidden = prevHostParent;
        break;
      default:
        recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
    }
  }
  function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
    if (finishedWork.memoizedState === null && (finishedRoot = finishedWork.alternate, finishedRoot !== null && (finishedRoot = finishedRoot.memoizedState, finishedRoot !== null && (finishedRoot = finishedRoot.dehydrated, finishedRoot !== null))))
      try {
        retryIfBlockedOn(finishedRoot);
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
  }
  function getRetryCache(finishedWork) {
    switch (finishedWork.tag) {
      case 13:
      case 19:
        var retryCache = finishedWork.stateNode;
        retryCache === null && (retryCache = finishedWork.stateNode = new PossiblyWeakSet);
        return retryCache;
      case 22:
        return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, retryCache === null && (retryCache = finishedWork._retryCache = new PossiblyWeakSet), retryCache;
      default:
        throw Error(formatProdErrorMessage(435, finishedWork.tag));
    }
  }
  function attachSuspenseRetryListeners(finishedWork, wakeables) {
    var retryCache = getRetryCache(finishedWork);
    wakeables.forEach(function(wakeable) {
      var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
      retryCache.has(wakeable) || (retryCache.add(wakeable), wakeable.then(retry, retry));
    });
  }
  function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
    var deletions = parentFiber.deletions;
    if (deletions !== null)
      for (var i = 0;i < deletions.length; i++) {
        var childToDelete = deletions[i], root2 = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
        a:
          for (;parent !== null; ) {
            switch (parent.tag) {
              case 27:
                if (isSingletonScope(parent.type)) {
                  hostParent = parent.stateNode;
                  hostParentIsContainer = false;
                  break a;
                }
                break;
              case 5:
                hostParent = parent.stateNode;
                hostParentIsContainer = false;
                break a;
              case 3:
              case 4:
                hostParent = parent.stateNode.containerInfo;
                hostParentIsContainer = true;
                break a;
            }
            parent = parent.return;
          }
        if (hostParent === null)
          throw Error(formatProdErrorMessage(160));
        commitDeletionEffectsOnFiber(root2, returnFiber, childToDelete);
        hostParent = null;
        hostParentIsContainer = false;
        root2 = childToDelete.alternate;
        root2 !== null && (root2.return = null);
        childToDelete.return = null;
      }
    if (parentFiber.subtreeFlags & 13878)
      for (parentFiber = parentFiber.child;parentFiber !== null; )
        commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
  }
  var currentHoistableRoot = null;
  function commitMutationEffectsOnFiber(finishedWork, root2) {
    var { alternate: current, flags } = finishedWork;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
        break;
      case 1:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || current === null || safelyDetachRef(current, current.return));
        flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, finishedWork !== null && (flags = finishedWork.callbacks, flags !== null && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = current === null ? flags : current.concat(flags))));
        break;
      case 26:
        var hoistableRoot = currentHoistableRoot;
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || current === null || safelyDetachRef(current, current.return));
        if (flags & 4) {
          var currentResource = current !== null ? current.memoizedState : null;
          flags = finishedWork.memoizedState;
          if (current === null)
            if (flags === null)
              if (finishedWork.stateNode === null) {
                a: {
                  flags = finishedWork.type;
                  current = finishedWork.memoizedProps;
                  hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
                  b:
                    switch (flags) {
                      case "title":
                        currentResource = hoistableRoot.getElementsByTagName("title")[0];
                        if (!currentResource || currentResource[internalHoistableMarker] || currentResource[internalInstanceKey] || currentResource.namespaceURI === "http://www.w3.org/2000/svg" || currentResource.hasAttribute("itemprop"))
                          currentResource = hoistableRoot.createElement(flags), hoistableRoot.head.insertBefore(currentResource, hoistableRoot.querySelector("head > title"));
                        setInitialProperties(currentResource, flags, current);
                        currentResource[internalInstanceKey] = finishedWork;
                        markNodeAsHoistable(currentResource);
                        flags = currentResource;
                        break a;
                      case "link":
                        var maybeNodes = getHydratableHoistableCache("link", "href", hoistableRoot).get(flags + (current.href || ""));
                        if (maybeNodes) {
                          for (var i = 0;i < maybeNodes.length; i++)
                            if (currentResource = maybeNodes[i], currentResource.getAttribute("href") === (current.href == null || current.href === "" ? null : current.href) && currentResource.getAttribute("rel") === (current.rel == null ? null : current.rel) && currentResource.getAttribute("title") === (current.title == null ? null : current.title) && currentResource.getAttribute("crossorigin") === (current.crossOrigin == null ? null : current.crossOrigin)) {
                              maybeNodes.splice(i, 1);
                              break b;
                            }
                        }
                        currentResource = hoistableRoot.createElement(flags);
                        setInitialProperties(currentResource, flags, current);
                        hoistableRoot.head.appendChild(currentResource);
                        break;
                      case "meta":
                        if (maybeNodes = getHydratableHoistableCache("meta", "content", hoistableRoot).get(flags + (current.content || ""))) {
                          for (i = 0;i < maybeNodes.length; i++)
                            if (currentResource = maybeNodes[i], currentResource.getAttribute("content") === (current.content == null ? null : "" + current.content) && currentResource.getAttribute("name") === (current.name == null ? null : current.name) && currentResource.getAttribute("property") === (current.property == null ? null : current.property) && currentResource.getAttribute("http-equiv") === (current.httpEquiv == null ? null : current.httpEquiv) && currentResource.getAttribute("charset") === (current.charSet == null ? null : current.charSet)) {
                              maybeNodes.splice(i, 1);
                              break b;
                            }
                        }
                        currentResource = hoistableRoot.createElement(flags);
                        setInitialProperties(currentResource, flags, current);
                        hoistableRoot.head.appendChild(currentResource);
                        break;
                      default:
                        throw Error(formatProdErrorMessage(468, flags));
                    }
                  currentResource[internalInstanceKey] = finishedWork;
                  markNodeAsHoistable(currentResource);
                  flags = currentResource;
                }
                finishedWork.stateNode = flags;
              } else
                mountHoistable(hoistableRoot, finishedWork.type, finishedWork.stateNode);
            else
              finishedWork.stateNode = acquireResource(hoistableRoot, flags, finishedWork.memoizedProps);
          else
            currentResource !== flags ? (currentResource === null ? current.stateNode !== null && (current = current.stateNode, current.parentNode.removeChild(current)) : currentResource.count--, flags === null ? mountHoistable(hoistableRoot, finishedWork.type, finishedWork.stateNode) : acquireResource(hoistableRoot, flags, finishedWork.memoizedProps)) : flags === null && finishedWork.stateNode !== null && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
        }
        break;
      case 27:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || current === null || safelyDetachRef(current, current.return));
        current !== null && flags & 4 && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
        break;
      case 5:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 512 && (offscreenSubtreeWasHidden || current === null || safelyDetachRef(current, current.return));
        if (finishedWork.flags & 32) {
          hoistableRoot = finishedWork.stateNode;
          try {
            setTextContent(hoistableRoot, "");
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        flags & 4 && finishedWork.stateNode != null && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(finishedWork, hoistableRoot, current !== null ? current.memoizedProps : hoistableRoot));
        flags & 1024 && (needsFormReset = true);
        break;
      case 6:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        if (flags & 4) {
          if (finishedWork.stateNode === null)
            throw Error(formatProdErrorMessage(162));
          flags = finishedWork.memoizedProps;
          current = finishedWork.stateNode;
          try {
            current.nodeValue = flags;
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        }
        break;
      case 3:
        tagCaches = null;
        hoistableRoot = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(root2.containerInfo);
        recursivelyTraverseMutationEffects(root2, finishedWork);
        currentHoistableRoot = hoistableRoot;
        commitReconciliationEffects(finishedWork);
        if (flags & 4 && current !== null && current.memoizedState.isDehydrated)
          try {
            retryIfBlockedOn(root2.containerInfo);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
        break;
      case 4:
        flags = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(finishedWork.stateNode.containerInfo);
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        currentHoistableRoot = flags;
        break;
      case 12:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        break;
      case 13:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        finishedWork.child.flags & 8192 && finishedWork.memoizedState !== null !== (current !== null && current.memoizedState !== null) && (globalMostRecentFallbackTime = now());
        flags & 4 && (flags = finishedWork.updateQueue, flags !== null && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 22:
        hoistableRoot = finishedWork.memoizedState !== null;
        var wasHidden = current !== null && current.memoizedState !== null, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
        recursivelyTraverseMutationEffects(root2, finishedWork);
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
        commitReconciliationEffects(finishedWork);
        if (flags & 8192)
          a:
            for (root2 = finishedWork.stateNode, root2._visibility = hoistableRoot ? root2._visibility & -2 : root2._visibility | 1, hoistableRoot && (current === null || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), current = null, root2 = finishedWork;; ) {
              if (root2.tag === 5 || root2.tag === 26) {
                if (current === null) {
                  wasHidden = current = root2;
                  try {
                    if (currentResource = wasHidden.stateNode, hoistableRoot)
                      maybeNodes = currentResource.style, typeof maybeNodes.setProperty === "function" ? maybeNodes.setProperty("display", "none", "important") : maybeNodes.display = "none";
                    else {
                      i = wasHidden.stateNode;
                      var styleProp = wasHidden.memoizedProps.style, display = styleProp !== undefined && styleProp !== null && styleProp.hasOwnProperty("display") ? styleProp.display : null;
                      i.style.display = display == null || typeof display === "boolean" ? "" : ("" + display).trim();
                    }
                  } catch (error) {
                    captureCommitPhaseError(wasHidden, wasHidden.return, error);
                  }
                }
              } else if (root2.tag === 6) {
                if (current === null) {
                  wasHidden = root2;
                  try {
                    wasHidden.stateNode.nodeValue = hoistableRoot ? "" : wasHidden.memoizedProps;
                  } catch (error) {
                    captureCommitPhaseError(wasHidden, wasHidden.return, error);
                  }
                }
              } else if ((root2.tag !== 22 && root2.tag !== 23 || root2.memoizedState === null || root2 === finishedWork) && root2.child !== null) {
                root2.child.return = root2;
                root2 = root2.child;
                continue;
              }
              if (root2 === finishedWork)
                break a;
              for (;root2.sibling === null; ) {
                if (root2.return === null || root2.return === finishedWork)
                  break a;
                current === root2 && (current = null);
                root2 = root2.return;
              }
              current === root2 && (current = null);
              root2.sibling.return = root2.return;
              root2 = root2.sibling;
            }
        flags & 4 && (flags = finishedWork.updateQueue, flags !== null && (current = flags.retryQueue, current !== null && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
        break;
      case 19:
        recursivelyTraverseMutationEffects(root2, finishedWork);
        commitReconciliationEffects(finishedWork);
        flags & 4 && (flags = finishedWork.updateQueue, flags !== null && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
        break;
      case 30:
        break;
      case 21:
        break;
      default:
        recursivelyTraverseMutationEffects(root2, finishedWork), commitReconciliationEffects(finishedWork);
    }
  }
  function commitReconciliationEffects(finishedWork) {
    var flags = finishedWork.flags;
    if (flags & 2) {
      try {
        for (var hostParentFiber, parentFiber = finishedWork.return;parentFiber !== null; ) {
          if (isHostParent(parentFiber)) {
            hostParentFiber = parentFiber;
            break;
          }
          parentFiber = parentFiber.return;
        }
        if (hostParentFiber == null)
          throw Error(formatProdErrorMessage(160));
        switch (hostParentFiber.tag) {
          case 27:
            var parent = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before, parent);
            break;
          case 5:
            var parent$144 = hostParentFiber.stateNode;
            hostParentFiber.flags & 32 && (setTextContent(parent$144, ""), hostParentFiber.flags &= -33);
            var before$145 = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before$145, parent$144);
            break;
          case 3:
          case 4:
            var parent$146 = hostParentFiber.stateNode.containerInfo, before$147 = getHostSibling(finishedWork);
            insertOrAppendPlacementNodeIntoContainer(finishedWork, before$147, parent$146);
            break;
          default:
            throw Error(formatProdErrorMessage(161));
        }
      } catch (error) {
        captureCommitPhaseError(finishedWork, finishedWork.return, error);
      }
      finishedWork.flags &= -3;
    }
    flags & 4096 && (finishedWork.flags &= -4097);
  }
  function recursivelyResetForms(parentFiber) {
    if (parentFiber.subtreeFlags & 1024)
      for (parentFiber = parentFiber.child;parentFiber !== null; ) {
        var fiber = parentFiber;
        recursivelyResetForms(fiber);
        fiber.tag === 5 && fiber.flags & 1024 && fiber.stateNode.reset();
        parentFiber = parentFiber.sibling;
      }
  }
  function recursivelyTraverseLayoutEffects(root2, parentFiber) {
    if (parentFiber.subtreeFlags & 8772)
      for (parentFiber = parentFiber.child;parentFiber !== null; )
        commitLayoutEffectOnFiber(root2, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
  }
  function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
    for (parentFiber = parentFiber.child;parentFiber !== null; ) {
      var finishedWork = parentFiber;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
          commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 1:
          safelyDetachRef(finishedWork, finishedWork.return);
          var instance = finishedWork.stateNode;
          typeof instance.componentWillUnmount === "function" && safelyCallComponentWillUnmount(finishedWork, finishedWork.return, instance);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 27:
          releaseSingletonInstance(finishedWork.stateNode);
        case 26:
        case 5:
          safelyDetachRef(finishedWork, finishedWork.return);
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 22:
          finishedWork.memoizedState === null && recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        case 30:
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
          break;
        default:
          recursivelyTraverseDisappearLayoutEffects(finishedWork);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
    includeWorkInProgressEffects = includeWorkInProgressEffects && (parentFiber.subtreeFlags & 8772) !== 0;
    for (parentFiber = parentFiber.child;parentFiber !== null; ) {
      var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
          commitHookEffectListMount(4, finishedWork);
          break;
        case 1:
          recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
          current = finishedWork;
          finishedRoot = current.stateNode;
          if (typeof finishedRoot.componentDidMount === "function")
            try {
              finishedRoot.componentDidMount();
            } catch (error) {
              captureCommitPhaseError(current, current.return, error);
            }
          current = finishedWork;
          finishedRoot = current.updateQueue;
          if (finishedRoot !== null) {
            var instance = current.stateNode;
            try {
              var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
              if (hiddenCallbacks !== null)
                for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0;finishedRoot < hiddenCallbacks.length; finishedRoot++)
                  callCallback(hiddenCallbacks[finishedRoot], instance);
            } catch (error) {
              captureCommitPhaseError(current, current.return, error);
            }
          }
          includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 27:
          commitHostSingletonAcquisition(finishedWork);
        case 26:
        case 5:
          recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
          includeWorkInProgressEffects && current === null && flags & 4 && commitHostMount(finishedWork);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 12:
          recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
          break;
        case 13:
          recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
          includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
          break;
        case 22:
          finishedWork.memoizedState === null && recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
          safelyAttachRef(finishedWork, finishedWork.return);
          break;
        case 30:
          break;
        default:
          recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, includeWorkInProgressEffects);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function commitOffscreenPassiveMountEffects(current, finishedWork) {
    var previousCache = null;
    current !== null && current.memoizedState !== null && current.memoizedState.cachePool !== null && (previousCache = current.memoizedState.cachePool.pool);
    current = null;
    finishedWork.memoizedState !== null && finishedWork.memoizedState.cachePool !== null && (current = finishedWork.memoizedState.cachePool.pool);
    current !== previousCache && (current != null && current.refCount++, previousCache != null && releaseCache(previousCache));
  }
  function commitCachePassiveMountEffect(current, finishedWork) {
    current = null;
    finishedWork.alternate !== null && (current = finishedWork.alternate.memoizedState.cache);
    finishedWork = finishedWork.memoizedState.cache;
    finishedWork !== current && (finishedWork.refCount++, current != null && releaseCache(current));
  }
  function recursivelyTraversePassiveMountEffects(root2, parentFiber, committedLanes, committedTransitions) {
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child;parentFiber !== null; )
        commitPassiveMountOnFiber(root2, parentFiber, committedLanes, committedTransitions), parentFiber = parentFiber.sibling;
  }
  function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
    var flags = finishedWork.flags;
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
        flags & 2048 && commitHookEffectListMount(9, finishedWork);
        break;
      case 1:
        recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
        break;
      case 3:
        recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
        flags & 2048 && (finishedRoot = null, finishedWork.alternate !== null && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, finishedRoot != null && releaseCache(finishedRoot)));
        break;
      case 12:
        if (flags & 2048) {
          recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
          finishedRoot = finishedWork.stateNode;
          try {
            var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
            typeof onPostCommit === "function" && onPostCommit(id, finishedWork.alternate === null ? "mount" : "update", finishedRoot.passiveEffectDuration, -0);
          } catch (error) {
            captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
        } else
          recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
        break;
      case 13:
        recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
        break;
      case 23:
        break;
      case 22:
        _finishedWork$memoize2 = finishedWork.stateNode;
        id = finishedWork.alternate;
        finishedWork.memoizedState !== null ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, (finishedWork.subtreeFlags & 10256) !== 0));
        flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
        break;
      case 24:
        recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
        flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
        break;
      default:
        recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
    }
  }
  function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
    includeWorkInProgressEffects = includeWorkInProgressEffects && (parentFiber.subtreeFlags & 10256) !== 0;
    for (parentFiber = parentFiber.child;parentFiber !== null; ) {
      var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
      switch (finishedWork.tag) {
        case 0:
        case 11:
        case 15:
          recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
          commitHookEffectListMount(8, finishedWork);
          break;
        case 23:
          break;
        case 22:
          var instance = finishedWork.stateNode;
          finishedWork.memoizedState !== null ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects));
          includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
          break;
        case 24:
          recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
          includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
          break;
        default:
          recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child;parentFiber !== null; ) {
        var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
        switch (finishedWork.tag) {
          case 22:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
            break;
          case 24:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
            flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
            break;
          default:
            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
        }
        parentFiber = parentFiber.sibling;
      }
  }
  var suspenseyCommitFlag = 8192;
  function recursivelyAccumulateSuspenseyCommit(parentFiber) {
    if (parentFiber.subtreeFlags & suspenseyCommitFlag)
      for (parentFiber = parentFiber.child;parentFiber !== null; )
        accumulateSuspenseyCommitOnFiber(parentFiber), parentFiber = parentFiber.sibling;
  }
  function accumulateSuspenseyCommitOnFiber(fiber) {
    switch (fiber.tag) {
      case 26:
        recursivelyAccumulateSuspenseyCommit(fiber);
        fiber.flags & suspenseyCommitFlag && fiber.memoizedState !== null && suspendResource(currentHoistableRoot, fiber.memoizedState, fiber.memoizedProps);
        break;
      case 5:
        recursivelyAccumulateSuspenseyCommit(fiber);
        break;
      case 3:
      case 4:
        var previousHoistableRoot = currentHoistableRoot;
        currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
        recursivelyAccumulateSuspenseyCommit(fiber);
        currentHoistableRoot = previousHoistableRoot;
        break;
      case 22:
        fiber.memoizedState === null && (previousHoistableRoot = fiber.alternate, previousHoistableRoot !== null && previousHoistableRoot.memoizedState !== null ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber));
        break;
      default:
        recursivelyAccumulateSuspenseyCommit(fiber);
    }
  }
  function detachAlternateSiblings(parentFiber) {
    var previousFiber = parentFiber.alternate;
    if (previousFiber !== null && (parentFiber = previousFiber.child, parentFiber !== null)) {
      previousFiber.child = null;
      do
        previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
      while (parentFiber !== null);
    }
  }
  function recursivelyTraversePassiveUnmountEffects(parentFiber) {
    var deletions = parentFiber.deletions;
    if ((parentFiber.flags & 16) !== 0) {
      if (deletions !== null)
        for (var i = 0;i < deletions.length; i++) {
          var childToDelete = deletions[i];
          nextEffect = childToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
        }
      detachAlternateSiblings(parentFiber);
    }
    if (parentFiber.subtreeFlags & 10256)
      for (parentFiber = parentFiber.child;parentFiber !== null; )
        commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
  }
  function commitPassiveUnmountOnFiber(finishedWork) {
    switch (finishedWork.tag) {
      case 0:
      case 11:
      case 15:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
        break;
      case 3:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      case 12:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      case 22:
        var instance = finishedWork.stateNode;
        finishedWork.memoizedState !== null && instance._visibility & 2 && (finishedWork.return === null || finishedWork.return.tag !== 13) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
        break;
      default:
        recursivelyTraversePassiveUnmountEffects(finishedWork);
    }
  }
  function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
    var deletions = parentFiber.deletions;
    if ((parentFiber.flags & 16) !== 0) {
      if (deletions !== null)
        for (var i = 0;i < deletions.length; i++) {
          var childToDelete = deletions[i];
          nextEffect = childToDelete;
          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
        }
      detachAlternateSiblings(parentFiber);
    }
    for (parentFiber = parentFiber.child;parentFiber !== null; ) {
      deletions = parentFiber;
      switch (deletions.tag) {
        case 0:
        case 11:
        case 15:
          commitHookEffectListUnmount(8, deletions, deletions.return);
          recursivelyTraverseDisconnectPassiveEffects(deletions);
          break;
        case 22:
          i = deletions.stateNode;
          i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
          break;
        default:
          recursivelyTraverseDisconnectPassiveEffects(deletions);
      }
      parentFiber = parentFiber.sibling;
    }
  }
  function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
    for (;nextEffect !== null; ) {
      var fiber = nextEffect;
      switch (fiber.tag) {
        case 0:
        case 11:
        case 15:
          commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
          break;
        case 23:
        case 22:
          if (fiber.memoizedState !== null && fiber.memoizedState.cachePool !== null) {
            var cache = fiber.memoizedState.cachePool.pool;
            cache != null && cache.refCount++;
          }
          break;
        case 24:
          releaseCache(fiber.memoizedState.cache);
      }
      cache = fiber.child;
      if (cache !== null)
        cache.return = fiber, nextEffect = cache;
      else
        a:
          for (fiber = deletedSubtreeRoot;nextEffect !== null; ) {
            cache = nextEffect;
            var { sibling, return: returnFiber } = cache;
            detachFiberAfterEffects(cache);
            if (cache === fiber) {
              nextEffect = null;
              break a;
            }
            if (sibling !== null) {
              sibling.return = returnFiber;
              nextEffect = sibling;
              break a;
            }
            nextEffect = returnFiber;
          }
    }
  }
  var DefaultAsyncDispatcher = {
    getCacheForType: function(resourceType) {
      var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
      cacheForType === undefined && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
      return cacheForType;
    }
  };
  var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
  var executionContext = 0;
  var workInProgressRoot = null;
  var workInProgress = null;
  var workInProgressRootRenderLanes = 0;
  var workInProgressSuspendedReason = 0;
  var workInProgressThrownValue = null;
  var workInProgressRootDidSkipSuspendedSiblings = false;
  var workInProgressRootIsPrerendering = false;
  var workInProgressRootDidAttachPingListener = false;
  var entangledRenderLanes = 0;
  var workInProgressRootExitStatus = 0;
  var workInProgressRootSkippedLanes = 0;
  var workInProgressRootInterleavedUpdatedLanes = 0;
  var workInProgressRootPingedLanes = 0;
  var workInProgressDeferredLane = 0;
  var workInProgressSuspendedRetryLanes = 0;
  var workInProgressRootConcurrentErrors = null;
  var workInProgressRootRecoverableErrors = null;
  var workInProgressRootDidIncludeRecursiveRenderUpdate = false;
  var globalMostRecentFallbackTime = 0;
  var workInProgressRootRenderTargetTime = Infinity;
  var workInProgressTransitions = null;
  var legacyErrorBoundariesThatAlreadyFailed = null;
  var pendingEffectsStatus = 0;
  var pendingEffectsRoot = null;
  var pendingFinishedWork = null;
  var pendingEffectsLanes = 0;
  var pendingEffectsRemainingLanes = 0;
  var pendingPassiveTransitions = null;
  var pendingRecoverableErrors = null;
  var nestedUpdateCount = 0;
  var rootWithNestedUpdates = null;
  function requestUpdateLane() {
    if ((executionContext & 2) !== 0 && workInProgressRootRenderLanes !== 0)
      return workInProgressRootRenderLanes & -workInProgressRootRenderLanes;
    if (ReactSharedInternals.T !== null) {
      var actionScopeLane = currentEntangledLane;
      return actionScopeLane !== 0 ? actionScopeLane : requestTransitionLane();
    }
    return resolveUpdatePriority();
  }
  function requestDeferredLane() {
    workInProgressDeferredLane === 0 && (workInProgressDeferredLane = (workInProgressRootRenderLanes & 536870912) === 0 || isHydrating ? claimNextTransitionLane() : 536870912);
    var suspenseHandler = suspenseHandlerStackCursor.current;
    suspenseHandler !== null && (suspenseHandler.flags |= 32);
    return workInProgressDeferredLane;
  }
  function scheduleUpdateOnFiber(root2, fiber, lane) {
    if (root2 === workInProgressRoot && (workInProgressSuspendedReason === 2 || workInProgressSuspendedReason === 9) || root2.cancelPendingCommit !== null)
      prepareFreshStack(root2, 0), markRootSuspended(root2, workInProgressRootRenderLanes, workInProgressDeferredLane, false);
    markRootUpdated$1(root2, lane);
    if ((executionContext & 2) === 0 || root2 !== workInProgressRoot)
      root2 === workInProgressRoot && ((executionContext & 2) === 0 && (workInProgressRootInterleavedUpdatedLanes |= lane), workInProgressRootExitStatus === 4 && markRootSuspended(root2, workInProgressRootRenderLanes, workInProgressDeferredLane, false)), ensureRootIsScheduled(root2);
  }
  function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
    if ((executionContext & 6) !== 0)
      throw Error(formatProdErrorMessage(327));
    var shouldTimeSlice = !forceSync && (lanes & 124) === 0 && (lanes & root$jscomp$0.expiredLanes) === 0 || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
    do {
      if (exitStatus === 0) {
        workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
        break;
      } else {
        forceSync = root$jscomp$0.current.alternate;
        if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
          exitStatus = renderRootSync(root$jscomp$0, lanes, false);
          renderWasConcurrent = false;
          continue;
        }
        if (exitStatus === 2) {
          renderWasConcurrent = lanes;
          if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
            var JSCompiler_inline_result = 0;
          else
            JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = JSCompiler_inline_result !== 0 ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
          if (JSCompiler_inline_result !== 0) {
            lanes = JSCompiler_inline_result;
            a: {
              var root2 = root$jscomp$0;
              exitStatus = workInProgressRootConcurrentErrors;
              var wasRootDehydrated = root2.current.memoizedState.isDehydrated;
              wasRootDehydrated && (prepareFreshStack(root2, JSCompiler_inline_result).flags |= 256);
              JSCompiler_inline_result = renderRootSync(root2, JSCompiler_inline_result, false);
              if (JSCompiler_inline_result !== 2) {
                if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
                  root2.errorRecoveryDisabledLanes |= renderWasConcurrent;
                  workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
                  exitStatus = 4;
                  break a;
                }
                renderWasConcurrent = workInProgressRootRecoverableErrors;
                workInProgressRootRecoverableErrors = exitStatus;
                renderWasConcurrent !== null && (workInProgressRootRecoverableErrors === null ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, renderWasConcurrent));
              }
              exitStatus = JSCompiler_inline_result;
            }
            renderWasConcurrent = false;
            if (exitStatus !== 2)
              continue;
          }
        }
        if (exitStatus === 1) {
          prepareFreshStack(root$jscomp$0, 0);
          markRootSuspended(root$jscomp$0, lanes, 0, true);
          break;
        }
        a: {
          shouldTimeSlice = root$jscomp$0;
          renderWasConcurrent = exitStatus;
          switch (renderWasConcurrent) {
            case 0:
            case 1:
              throw Error(formatProdErrorMessage(345));
            case 4:
              if ((lanes & 4194048) !== lanes)
                break;
            case 6:
              markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
              break a;
            case 2:
              workInProgressRootRecoverableErrors = null;
              break;
            case 3:
            case 5:
              break;
            default:
              throw Error(formatProdErrorMessage(329));
          }
          if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
            markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
            if (getNextLanes(shouldTimeSlice, 0, true) !== 0)
              break a;
            shouldTimeSlice.timeoutHandle = scheduleTimeout(commitRootWhenReady.bind(null, shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, 2, -0, 0), exitStatus);
            break a;
          }
          commitRootWhenReady(shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, 0, -0, 0);
        }
      }
      break;
    } while (1);
    ensureRootIsScheduled(root$jscomp$0);
  }
  function commitRootWhenReady(root2, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
    root2.timeoutHandle = -1;
    suspendedCommitReason = finishedWork.subtreeFlags;
    if (suspendedCommitReason & 8192 || (suspendedCommitReason & 16785408) === 16785408) {
      if (suspendedState = { stylesheets: null, count: 0, unsuspend: noop }, accumulateSuspenseyCommitOnFiber(finishedWork), suspendedCommitReason = waitForCommitToBeReady(), suspendedCommitReason !== null) {
        root2.cancelPendingCommit = suspendedCommitReason(commitRoot.bind(null, root2, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, exitStatus, 1, completedRenderStartTime, completedRenderEndTime));
        markRootSuspended(root2, lanes, spawnedLane, !didSkipSuspendedSiblings);
        return;
      }
    }
    commitRoot(root2, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes);
  }
  function isRenderConsistentWithExternalStores(finishedWork) {
    for (var node = finishedWork;; ) {
      var tag = node.tag;
      if ((tag === 0 || tag === 11 || tag === 15) && node.flags & 16384 && (tag = node.updateQueue, tag !== null && (tag = tag.stores, tag !== null)))
        for (var i = 0;i < tag.length; i++) {
          var check = tag[i], getSnapshot = check.getSnapshot;
          check = check.value;
          try {
            if (!objectIs(getSnapshot(), check))
              return false;
          } catch (error) {
            return false;
          }
        }
      tag = node.child;
      if (node.subtreeFlags & 16384 && tag !== null)
        tag.return = node, node = tag;
      else {
        if (node === finishedWork)
          break;
        for (;node.sibling === null; ) {
          if (node.return === null || node.return === finishedWork)
            return true;
          node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
      }
    }
    return true;
  }
  function markRootSuspended(root2, suspendedLanes, spawnedLane, didAttemptEntireTree) {
    suspendedLanes &= ~workInProgressRootPingedLanes;
    suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
    root2.suspendedLanes |= suspendedLanes;
    root2.pingedLanes &= ~suspendedLanes;
    didAttemptEntireTree && (root2.warmLanes |= suspendedLanes);
    didAttemptEntireTree = root2.expirationTimes;
    for (var lanes = suspendedLanes;0 < lanes; ) {
      var index$4 = 31 - clz32(lanes), lane = 1 << index$4;
      didAttemptEntireTree[index$4] = -1;
      lanes &= ~lane;
    }
    spawnedLane !== 0 && markSpawnedDeferredLane(root2, spawnedLane, suspendedLanes);
  }
  function flushSyncWork$1() {
    return (executionContext & 6) === 0 ? (flushSyncWorkAcrossRoots_impl(0, false), false) : true;
  }
  function resetWorkInProgressStack() {
    if (workInProgress !== null) {
      if (workInProgressSuspendedReason === 0)
        var interruptedWork = workInProgress.return;
      else
        interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState = null, thenableIndexCounter = 0, interruptedWork = workInProgress;
      for (;interruptedWork !== null; )
        unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
      workInProgress = null;
    }
  }
  function prepareFreshStack(root2, lanes) {
    var timeoutHandle = root2.timeoutHandle;
    timeoutHandle !== -1 && (root2.timeoutHandle = -1, cancelTimeout(timeoutHandle));
    timeoutHandle = root2.cancelPendingCommit;
    timeoutHandle !== null && (root2.cancelPendingCommit = null, timeoutHandle());
    resetWorkInProgressStack();
    workInProgressRoot = root2;
    workInProgress = timeoutHandle = createWorkInProgress(root2.current, null);
    workInProgressRootRenderLanes = lanes;
    workInProgressSuspendedReason = 0;
    workInProgressThrownValue = null;
    workInProgressRootDidSkipSuspendedSiblings = false;
    workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root2, lanes);
    workInProgressRootDidAttachPingListener = false;
    workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
    workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
    workInProgressRootDidIncludeRecursiveRenderUpdate = false;
    (lanes & 8) !== 0 && (lanes |= lanes & 32);
    var allEntangledLanes = root2.entangledLanes;
    if (allEntangledLanes !== 0)
      for (root2 = root2.entanglements, allEntangledLanes &= lanes;0 < allEntangledLanes; ) {
        var index$2 = 31 - clz32(allEntangledLanes), lane = 1 << index$2;
        lanes |= root2[index$2];
        allEntangledLanes &= ~lane;
      }
    entangledRenderLanes = lanes;
    finishQueueingConcurrentUpdates();
    return timeoutHandle;
  }
  function handleThrow(root2, thrownValue) {
    currentlyRenderingFiber = null;
    ReactSharedInternals.H = ContextOnlyDispatcher;
    thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : thrownValue !== null && typeof thrownValue === "object" && typeof thrownValue.then === "function" ? 6 : 1;
    workInProgressThrownValue = thrownValue;
    workInProgress === null && (workInProgressRootExitStatus = 1, logUncaughtError(root2, createCapturedValueAtFiber(thrownValue, root2.current)));
  }
  function pushDispatcher() {
    var prevDispatcher = ReactSharedInternals.H;
    ReactSharedInternals.H = ContextOnlyDispatcher;
    return prevDispatcher === null ? ContextOnlyDispatcher : prevDispatcher;
  }
  function pushAsyncDispatcher() {
    var prevAsyncDispatcher = ReactSharedInternals.A;
    ReactSharedInternals.A = DefaultAsyncDispatcher;
    return prevAsyncDispatcher;
  }
  function renderDidSuspendDelayIfPossible() {
    workInProgressRootExitStatus = 4;
    workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && suspenseHandlerStackCursor.current !== null || (workInProgressRootIsPrerendering = true);
    (workInProgressRootSkippedLanes & 134217727) === 0 && (workInProgressRootInterleavedUpdatedLanes & 134217727) === 0 || workInProgressRoot === null || markRootSuspended(workInProgressRoot, workInProgressRootRenderLanes, workInProgressDeferredLane, false);
  }
  function renderRootSync(root2, lanes, shouldYieldForPrerendering) {
    var prevExecutionContext = executionContext;
    executionContext |= 2;
    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
    if (workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes)
      workInProgressTransitions = null, prepareFreshStack(root2, lanes);
    lanes = false;
    var exitStatus = workInProgressRootExitStatus;
    a:
      do
        try {
          if (workInProgressSuspendedReason !== 0 && workInProgress !== null) {
            var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
            switch (workInProgressSuspendedReason) {
              case 8:
                resetWorkInProgressStack();
                exitStatus = 6;
                break a;
              case 3:
              case 2:
              case 9:
              case 6:
                suspenseHandlerStackCursor.current === null && (lanes = true);
                var reason = workInProgressSuspendedReason;
                workInProgressSuspendedReason = 0;
                workInProgressThrownValue = null;
                throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
                if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
                  exitStatus = 0;
                  break a;
                }
                break;
              default:
                reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, reason);
            }
          }
          workLoopSync();
          exitStatus = workInProgressRootExitStatus;
          break;
        } catch (thrownValue$167) {
          handleThrow(root2, thrownValue$167);
        }
      while (1);
    lanes && root2.shellSuspendCounter++;
    lastContextDependency = currentlyRenderingFiber$1 = null;
    executionContext = prevExecutionContext;
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    workInProgress === null && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
    return exitStatus;
  }
  function workLoopSync() {
    for (;workInProgress !== null; )
      performUnitOfWork(workInProgress);
  }
  function renderRootConcurrent(root2, lanes) {
    var prevExecutionContext = executionContext;
    executionContext |= 2;
    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
    workInProgressRoot !== root2 || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root2, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root2, lanes);
    a:
      do
        try {
          if (workInProgressSuspendedReason !== 0 && workInProgress !== null) {
            lanes = workInProgress;
            var thrownValue = workInProgressThrownValue;
            b:
              switch (workInProgressSuspendedReason) {
                case 1:
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root2, lanes, thrownValue, 1);
                  break;
                case 2:
                case 9:
                  if (isThenableResolved(thrownValue)) {
                    workInProgressSuspendedReason = 0;
                    workInProgressThrownValue = null;
                    replaySuspendedUnitOfWork(lanes);
                    break;
                  }
                  lanes = function() {
                    workInProgressSuspendedReason !== 2 && workInProgressSuspendedReason !== 9 || workInProgressRoot !== root2 || (workInProgressSuspendedReason = 7);
                    ensureRootIsScheduled(root2);
                  };
                  thrownValue.then(lanes, lanes);
                  break a;
                case 3:
                  workInProgressSuspendedReason = 7;
                  break a;
                case 4:
                  workInProgressSuspendedReason = 5;
                  break a;
                case 7:
                  isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root2, lanes, thrownValue, 7));
                  break;
                case 5:
                  var resource = null;
                  switch (workInProgress.tag) {
                    case 26:
                      resource = workInProgress.memoizedState;
                    case 5:
                    case 27:
                      var hostFiber = workInProgress;
                      if (resource ? preloadResource(resource) : 1) {
                        workInProgressSuspendedReason = 0;
                        workInProgressThrownValue = null;
                        var sibling = hostFiber.sibling;
                        if (sibling !== null)
                          workInProgress = sibling;
                        else {
                          var returnFiber = hostFiber.return;
                          returnFiber !== null ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
                        }
                        break b;
                      }
                  }
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root2, lanes, thrownValue, 5);
                  break;
                case 6:
                  workInProgressSuspendedReason = 0;
                  workInProgressThrownValue = null;
                  throwAndUnwindWorkLoop(root2, lanes, thrownValue, 6);
                  break;
                case 8:
                  resetWorkInProgressStack();
                  workInProgressRootExitStatus = 6;
                  break a;
                default:
                  throw Error(formatProdErrorMessage(462));
              }
          }
          workLoopConcurrentByScheduler();
          break;
        } catch (thrownValue$169) {
          handleThrow(root2, thrownValue$169);
        }
      while (1);
    lastContextDependency = currentlyRenderingFiber$1 = null;
    ReactSharedInternals.H = prevDispatcher;
    ReactSharedInternals.A = prevAsyncDispatcher;
    executionContext = prevExecutionContext;
    if (workInProgress !== null)
      return 0;
    workInProgressRoot = null;
    workInProgressRootRenderLanes = 0;
    finishQueueingConcurrentUpdates();
    return workInProgressRootExitStatus;
  }
  function workLoopConcurrentByScheduler() {
    for (;workInProgress !== null && !shouldYield(); )
      performUnitOfWork(workInProgress);
  }
  function performUnitOfWork(unitOfWork) {
    var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    next === null ? completeUnitOfWork(unitOfWork) : workInProgress = next;
  }
  function replaySuspendedUnitOfWork(unitOfWork) {
    var next = unitOfWork;
    var current = next.alternate;
    switch (next.tag) {
      case 15:
      case 0:
        next = replayFunctionComponent(current, next, next.pendingProps, next.type, undefined, workInProgressRootRenderLanes);
        break;
      case 11:
        next = replayFunctionComponent(current, next, next.pendingProps, next.type.render, next.ref, workInProgressRootRenderLanes);
        break;
      case 5:
        resetHooksOnUnwind(next);
      default:
        unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
    }
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    next === null ? completeUnitOfWork(unitOfWork) : workInProgress = next;
  }
  function throwAndUnwindWorkLoop(root2, unitOfWork, thrownValue, suspendedReason) {
    lastContextDependency = currentlyRenderingFiber$1 = null;
    resetHooksOnUnwind(unitOfWork);
    thenableState = null;
    thenableIndexCounter = 0;
    var returnFiber = unitOfWork.return;
    try {
      if (throwException(root2, returnFiber, unitOfWork, thrownValue, workInProgressRootRenderLanes)) {
        workInProgressRootExitStatus = 1;
        logUncaughtError(root2, createCapturedValueAtFiber(thrownValue, root2.current));
        workInProgress = null;
        return;
      }
    } catch (error) {
      if (returnFiber !== null)
        throw workInProgress = returnFiber, error;
      workInProgressRootExitStatus = 1;
      logUncaughtError(root2, createCapturedValueAtFiber(thrownValue, root2.current));
      workInProgress = null;
      return;
    }
    if (unitOfWork.flags & 32768) {
      if (isHydrating || suspendedReason === 1)
        root2 = true;
      else if (workInProgressRootIsPrerendering || (workInProgressRootRenderLanes & 536870912) !== 0)
        root2 = false;
      else if (workInProgressRootDidSkipSuspendedSiblings = root2 = true, suspendedReason === 2 || suspendedReason === 9 || suspendedReason === 3 || suspendedReason === 6)
        suspendedReason = suspenseHandlerStackCursor.current, suspendedReason !== null && suspendedReason.tag === 13 && (suspendedReason.flags |= 16384);
      unwindUnitOfWork(unitOfWork, root2);
    } else
      completeUnitOfWork(unitOfWork);
  }
  function completeUnitOfWork(unitOfWork) {
    var completedWork = unitOfWork;
    do {
      if ((completedWork.flags & 32768) !== 0) {
        unwindUnitOfWork(completedWork, workInProgressRootDidSkipSuspendedSiblings);
        return;
      }
      unitOfWork = completedWork.return;
      var next = completeWork(completedWork.alternate, completedWork, entangledRenderLanes);
      if (next !== null) {
        workInProgress = next;
        return;
      }
      completedWork = completedWork.sibling;
      if (completedWork !== null) {
        workInProgress = completedWork;
        return;
      }
      workInProgress = completedWork = unitOfWork;
    } while (completedWork !== null);
    workInProgressRootExitStatus === 0 && (workInProgressRootExitStatus = 5);
  }
  function unwindUnitOfWork(unitOfWork, skipSiblings) {
    do {
      var next = unwindWork(unitOfWork.alternate, unitOfWork);
      if (next !== null) {
        next.flags &= 32767;
        workInProgress = next;
        return;
      }
      next = unitOfWork.return;
      next !== null && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
      if (!skipSiblings && (unitOfWork = unitOfWork.sibling, unitOfWork !== null)) {
        workInProgress = unitOfWork;
        return;
      }
      workInProgress = unitOfWork = next;
    } while (unitOfWork !== null);
    workInProgressRootExitStatus = 6;
    workInProgress = null;
  }
  function commitRoot(root2, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
    root2.cancelPendingCommit = null;
    do
      flushPendingEffects();
    while (pendingEffectsStatus !== 0);
    if ((executionContext & 6) !== 0)
      throw Error(formatProdErrorMessage(327));
    if (finishedWork !== null) {
      if (finishedWork === root2.current)
        throw Error(formatProdErrorMessage(177));
      didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
      didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
      markRootFinished(root2, lanes, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes);
      root2 === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
      pendingFinishedWork = finishedWork;
      pendingEffectsRoot = root2;
      pendingEffectsLanes = lanes;
      pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
      pendingPassiveTransitions = transitions;
      pendingRecoverableErrors = recoverableErrors;
      (finishedWork.subtreeFlags & 10256) !== 0 || (finishedWork.flags & 10256) !== 0 ? (root2.callbackNode = null, root2.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
        flushPassiveEffects(true);
        return null;
      })) : (root2.callbackNode = null, root2.callbackPriority = 0);
      recoverableErrors = (finishedWork.flags & 13878) !== 0;
      if ((finishedWork.subtreeFlags & 13878) !== 0 || recoverableErrors) {
        recoverableErrors = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        transitions = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        spawnedLane = executionContext;
        executionContext |= 4;
        try {
          commitBeforeMutationEffects(root2, finishedWork, lanes);
        } finally {
          executionContext = spawnedLane, ReactDOMSharedInternals.p = transitions, ReactSharedInternals.T = recoverableErrors;
        }
      }
      pendingEffectsStatus = 1;
      flushMutationEffects();
      flushLayoutEffects();
      flushSpawnedWork();
    }
  }
  function flushMutationEffects() {
    if (pendingEffectsStatus === 1) {
      pendingEffectsStatus = 0;
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = (finishedWork.flags & 13878) !== 0;
      if ((finishedWork.subtreeFlags & 13878) !== 0 || rootMutationHasEffect) {
        rootMutationHasEffect = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        try {
          commitMutationEffectsOnFiber(finishedWork, root2);
          var priorSelectionInformation = selectionInformation, curFocusedElem = getActiveElementDeep(root2.containerInfo), priorFocusedElem = priorSelectionInformation.focusedElem, priorSelectionRange = priorSelectionInformation.selectionRange;
          if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(priorFocusedElem.ownerDocument.documentElement, priorFocusedElem)) {
            if (priorSelectionRange !== null && hasSelectionCapabilities(priorFocusedElem)) {
              var { start, end } = priorSelectionRange;
              end === undefined && (end = start);
              if ("selectionStart" in priorFocusedElem)
                priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(end, priorFocusedElem.value.length);
              else {
                var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
                if (win.getSelection) {
                  var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = priorSelectionRange.end === undefined ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
                  !selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
                  var startMarker = getNodeForCharacterOffset(priorFocusedElem, start$jscomp$0), endMarker = getNodeForCharacterOffset(priorFocusedElem, end$jscomp$0);
                  if (startMarker && endMarker && (selection.rangeCount !== 1 || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
                    var range = doc.createRange();
                    range.setStart(startMarker.node, startMarker.offset);
                    selection.removeAllRanges();
                    start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
                  }
                }
              }
            }
            doc = [];
            for (selection = priorFocusedElem;selection = selection.parentNode; )
              selection.nodeType === 1 && doc.push({
                element: selection,
                left: selection.scrollLeft,
                top: selection.scrollTop
              });
            typeof priorFocusedElem.focus === "function" && priorFocusedElem.focus();
            for (priorFocusedElem = 0;priorFocusedElem < doc.length; priorFocusedElem++) {
              var info = doc[priorFocusedElem];
              info.element.scrollLeft = info.left;
              info.element.scrollTop = info.top;
            }
          }
          _enabled = !!eventsEnabled;
          selectionInformation = eventsEnabled = null;
        } finally {
          executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
        }
      }
      root2.current = finishedWork;
      pendingEffectsStatus = 2;
    }
  }
  function flushLayoutEffects() {
    if (pendingEffectsStatus === 2) {
      pendingEffectsStatus = 0;
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = (finishedWork.flags & 8772) !== 0;
      if ((finishedWork.subtreeFlags & 8772) !== 0 || rootHasLayoutEffect) {
        rootHasLayoutEffect = ReactSharedInternals.T;
        ReactSharedInternals.T = null;
        var previousPriority = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        var prevExecutionContext = executionContext;
        executionContext |= 4;
        try {
          commitLayoutEffectOnFiber(root2, finishedWork.alternate, finishedWork);
        } finally {
          executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
        }
      }
      pendingEffectsStatus = 3;
    }
  }
  function flushSpawnedWork() {
    if (pendingEffectsStatus === 4 || pendingEffectsStatus === 3) {
      pendingEffectsStatus = 0;
      requestPaint();
      var root2 = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
      (finishedWork.subtreeFlags & 10256) !== 0 || (finishedWork.flags & 10256) !== 0 ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root2, root2.pendingLanes));
      var remainingLanes = root2.pendingLanes;
      remainingLanes === 0 && (legacyErrorBoundariesThatAlreadyFailed = null);
      lanesToEventPriority(lanes);
      finishedWork = finishedWork.stateNode;
      if (injectedHook && typeof injectedHook.onCommitFiberRoot === "function")
        try {
          injectedHook.onCommitFiberRoot(rendererID, finishedWork, undefined, (finishedWork.current.flags & 128) === 128);
        } catch (err) {}
      if (recoverableErrors !== null) {
        finishedWork = ReactSharedInternals.T;
        remainingLanes = ReactDOMSharedInternals.p;
        ReactDOMSharedInternals.p = 2;
        ReactSharedInternals.T = null;
        try {
          for (var onRecoverableError = root2.onRecoverableError, i = 0;i < recoverableErrors.length; i++) {
            var recoverableError = recoverableErrors[i];
            onRecoverableError(recoverableError.value, {
              componentStack: recoverableError.stack
            });
          }
        } finally {
          ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = remainingLanes;
        }
      }
      (pendingEffectsLanes & 3) !== 0 && flushPendingEffects();
      ensureRootIsScheduled(root2);
      remainingLanes = root2.pendingLanes;
      (lanes & 4194090) !== 0 && (remainingLanes & 42) !== 0 ? root2 === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root2) : nestedUpdateCount = 0;
      flushSyncWorkAcrossRoots_impl(0, false);
    }
  }
  function releaseRootPooledCache(root2, remainingLanes) {
    (root2.pooledCacheLanes &= remainingLanes) === 0 && (remainingLanes = root2.pooledCache, remainingLanes != null && (root2.pooledCache = null, releaseCache(remainingLanes)));
  }
  function flushPendingEffects(wasDelayedCommit) {
    flushMutationEffects();
    flushLayoutEffects();
    flushSpawnedWork();
    return flushPassiveEffects(wasDelayedCommit);
  }
  function flushPassiveEffects() {
    if (pendingEffectsStatus !== 5)
      return false;
    var root2 = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
    pendingEffectsRemainingLanes = 0;
    var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
      ReactSharedInternals.T = null;
      renderPriority = pendingPassiveTransitions;
      pendingPassiveTransitions = null;
      var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
      pendingEffectsStatus = 0;
      pendingFinishedWork = pendingEffectsRoot = null;
      pendingEffectsLanes = 0;
      if ((executionContext & 6) !== 0)
        throw Error(formatProdErrorMessage(331));
      var prevExecutionContext = executionContext;
      executionContext |= 4;
      commitPassiveUnmountOnFiber(root$jscomp$0.current);
      commitPassiveMountOnFiber(root$jscomp$0, root$jscomp$0.current, lanes, renderPriority);
      executionContext = prevExecutionContext;
      flushSyncWorkAcrossRoots_impl(0, false);
      if (injectedHook && typeof injectedHook.onPostCommitFiberRoot === "function")
        try {
          injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
        } catch (err) {}
      return true;
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root2, remainingLanes);
    }
  }
  function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
    sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
    sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
    rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
    rootFiber !== null && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
  }
  function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
    if (sourceFiber.tag === 3)
      captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
    else
      for (;nearestMountedAncestor !== null; ) {
        if (nearestMountedAncestor.tag === 3) {
          captureCommitPhaseErrorOnRoot(nearestMountedAncestor, sourceFiber, error);
          break;
        } else if (nearestMountedAncestor.tag === 1) {
          var instance = nearestMountedAncestor.stateNode;
          if (typeof nearestMountedAncestor.type.getDerivedStateFromError === "function" || typeof instance.componentDidCatch === "function" && (legacyErrorBoundariesThatAlreadyFailed === null || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
            sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
            error = createClassErrorUpdate(2);
            instance = enqueueUpdate(nearestMountedAncestor, error, 2);
            instance !== null && (initializeClassErrorUpdate(error, instance, nearestMountedAncestor, sourceFiber), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
            break;
          }
        }
        nearestMountedAncestor = nearestMountedAncestor.return;
      }
  }
  function attachPingListener(root2, wakeable, lanes) {
    var pingCache = root2.pingCache;
    if (pingCache === null) {
      pingCache = root2.pingCache = new PossiblyWeakMap;
      var threadIDs = new Set;
      pingCache.set(wakeable, threadIDs);
    } else
      threadIDs = pingCache.get(wakeable), threadIDs === undefined && (threadIDs = new Set, pingCache.set(wakeable, threadIDs));
    threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root2 = pingSuspendedRoot.bind(null, root2, wakeable, lanes), wakeable.then(root2, root2));
  }
  function pingSuspendedRoot(root2, wakeable, pingedLanes) {
    var pingCache = root2.pingCache;
    pingCache !== null && pingCache.delete(wakeable);
    root2.pingedLanes |= root2.suspendedLanes & pingedLanes;
    root2.warmLanes &= ~pingedLanes;
    workInProgressRoot === root2 && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (workInProgressRootExitStatus === 4 || workInProgressRootExitStatus === 3 && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? (executionContext & 2) === 0 && prepareFreshStack(root2, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
    ensureRootIsScheduled(root2);
  }
  function retryTimedOutBoundary(boundaryFiber, retryLane) {
    retryLane === 0 && (retryLane = claimNextRetryLane());
    boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
    boundaryFiber !== null && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
  }
  function retryDehydratedSuspenseBoundary(boundaryFiber) {
    var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
    suspenseState !== null && (retryLane = suspenseState.retryLane);
    retryTimedOutBoundary(boundaryFiber, retryLane);
  }
  function resolveRetryWakeable(boundaryFiber, wakeable) {
    var retryLane = 0;
    switch (boundaryFiber.tag) {
      case 13:
        var retryCache = boundaryFiber.stateNode;
        var suspenseState = boundaryFiber.memoizedState;
        suspenseState !== null && (retryLane = suspenseState.retryLane);
        break;
      case 19:
        retryCache = boundaryFiber.stateNode;
        break;
      case 22:
        retryCache = boundaryFiber.stateNode._retryCache;
        break;
      default:
        throw Error(formatProdErrorMessage(314));
    }
    retryCache !== null && retryCache.delete(wakeable);
    retryTimedOutBoundary(boundaryFiber, retryLane);
  }
  function scheduleCallback$1(priorityLevel, callback) {
    return scheduleCallback$3(priorityLevel, callback);
  }
  var firstScheduledRoot = null;
  var lastScheduledRoot = null;
  var didScheduleMicrotask = false;
  var mightHavePendingSyncWork = false;
  var isFlushingWork = false;
  var currentEventTransitionLane = 0;
  function ensureRootIsScheduled(root2) {
    root2 !== lastScheduledRoot && root2.next === null && (lastScheduledRoot === null ? firstScheduledRoot = lastScheduledRoot = root2 : lastScheduledRoot = lastScheduledRoot.next = root2);
    mightHavePendingSyncWork = true;
    didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
  }
  function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
    if (!isFlushingWork && mightHavePendingSyncWork) {
      isFlushingWork = true;
      do {
        var didPerformSomeWork = false;
        for (var root$174 = firstScheduledRoot;root$174 !== null; ) {
          if (!onlyLegacy)
            if (syncTransitionLanes !== 0) {
              var pendingLanes = root$174.pendingLanes;
              if (pendingLanes === 0)
                var JSCompiler_inline_result = 0;
              else {
                var { suspendedLanes, pingedLanes } = root$174;
                JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
                JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
                JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
              }
              JSCompiler_inline_result !== 0 && (didPerformSomeWork = true, performSyncWorkOnRoot(root$174, JSCompiler_inline_result));
            } else
              JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(root$174, root$174 === workInProgressRoot ? JSCompiler_inline_result : 0, root$174.cancelPendingCommit !== null || root$174.timeoutHandle !== -1), (JSCompiler_inline_result & 3) === 0 || checkIfRootIsPrerendering(root$174, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root$174, JSCompiler_inline_result));
          root$174 = root$174.next;
        }
      } while (didPerformSomeWork);
      isFlushingWork = false;
    }
  }
  function processRootScheduleInImmediateTask() {
    processRootScheduleInMicrotask();
  }
  function processRootScheduleInMicrotask() {
    mightHavePendingSyncWork = didScheduleMicrotask = false;
    var syncTransitionLanes = 0;
    currentEventTransitionLane !== 0 && (shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane), currentEventTransitionLane = 0);
    for (var currentTime = now(), prev = null, root2 = firstScheduledRoot;root2 !== null; ) {
      var next = root2.next, nextLanes = scheduleTaskForRootDuringMicrotask(root2, currentTime);
      if (nextLanes === 0)
        root2.next = null, prev === null ? firstScheduledRoot = next : prev.next = next, next === null && (lastScheduledRoot = prev);
      else if (prev = root2, syncTransitionLanes !== 0 || (nextLanes & 3) !== 0)
        mightHavePendingSyncWork = true;
      root2 = next;
    }
    flushSyncWorkAcrossRoots_impl(syncTransitionLanes, false);
  }
  function scheduleTaskForRootDuringMicrotask(root2, currentTime) {
    for (var { suspendedLanes, pingedLanes, expirationTimes } = root2, lanes = root2.pendingLanes & -62914561;0 < lanes; ) {
      var index$3 = 31 - clz32(lanes), lane = 1 << index$3, expirationTime = expirationTimes[index$3];
      if (expirationTime === -1) {
        if ((lane & suspendedLanes) === 0 || (lane & pingedLanes) !== 0)
          expirationTimes[index$3] = computeExpirationTime(lane, currentTime);
      } else
        expirationTime <= currentTime && (root2.expiredLanes |= lane);
      lanes &= ~lane;
    }
    currentTime = workInProgressRoot;
    suspendedLanes = workInProgressRootRenderLanes;
    suspendedLanes = getNextLanes(root2, root2 === currentTime ? suspendedLanes : 0, root2.cancelPendingCommit !== null || root2.timeoutHandle !== -1);
    pingedLanes = root2.callbackNode;
    if (suspendedLanes === 0 || root2 === currentTime && (workInProgressSuspendedReason === 2 || workInProgressSuspendedReason === 9) || root2.cancelPendingCommit !== null)
      return pingedLanes !== null && pingedLanes !== null && cancelCallback$1(pingedLanes), root2.callbackNode = null, root2.callbackPriority = 0;
    if ((suspendedLanes & 3) === 0 || checkIfRootIsPrerendering(root2, suspendedLanes)) {
      currentTime = suspendedLanes & -suspendedLanes;
      if (currentTime === root2.callbackPriority)
        return currentTime;
      pingedLanes !== null && cancelCallback$1(pingedLanes);
      switch (lanesToEventPriority(suspendedLanes)) {
        case 2:
        case 8:
          suspendedLanes = UserBlockingPriority;
          break;
        case 32:
          suspendedLanes = NormalPriority$1;
          break;
        case 268435456:
          suspendedLanes = IdlePriority;
          break;
        default:
          suspendedLanes = NormalPriority$1;
      }
      pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root2);
      suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
      root2.callbackPriority = currentTime;
      root2.callbackNode = suspendedLanes;
      return currentTime;
    }
    pingedLanes !== null && pingedLanes !== null && cancelCallback$1(pingedLanes);
    root2.callbackPriority = 2;
    root2.callbackNode = null;
    return 2;
  }
  function performWorkOnRootViaSchedulerTask(root2, didTimeout) {
    if (pendingEffectsStatus !== 0 && pendingEffectsStatus !== 5)
      return root2.callbackNode = null, root2.callbackPriority = 0, null;
    var originalCallbackNode = root2.callbackNode;
    if (flushPendingEffects(true) && root2.callbackNode !== originalCallbackNode)
      return null;
    var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
    workInProgressRootRenderLanes$jscomp$0 = getNextLanes(root2, root2 === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0, root2.cancelPendingCommit !== null || root2.timeoutHandle !== -1);
    if (workInProgressRootRenderLanes$jscomp$0 === 0)
      return null;
    performWorkOnRoot(root2, workInProgressRootRenderLanes$jscomp$0, didTimeout);
    scheduleTaskForRootDuringMicrotask(root2, now());
    return root2.callbackNode != null && root2.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root2) : null;
  }
  function performSyncWorkOnRoot(root2, lanes) {
    if (flushPendingEffects())
      return null;
    performWorkOnRoot(root2, lanes, true);
  }
  function scheduleImmediateRootScheduleTask() {
    scheduleMicrotask(function() {
      (executionContext & 6) !== 0 ? scheduleCallback$3(ImmediatePriority, processRootScheduleInImmediateTask) : processRootScheduleInMicrotask();
    });
  }
  function requestTransitionLane() {
    currentEventTransitionLane === 0 && (currentEventTransitionLane = claimNextTransitionLane());
    return currentEventTransitionLane;
  }
  function coerceFormActionProp(actionProp) {
    return actionProp == null || typeof actionProp === "symbol" || typeof actionProp === "boolean" ? null : typeof actionProp === "function" ? actionProp : sanitizeURL("" + actionProp);
  }
  function createFormDataWithSubmitter(form, submitter) {
    var temp = submitter.ownerDocument.createElement("input");
    temp.name = submitter.name;
    temp.value = submitter.value;
    form.id && temp.setAttribute("form", form.id);
    submitter.parentNode.insertBefore(temp, submitter);
    form = new FormData(form);
    temp.parentNode.removeChild(temp);
    return form;
  }
  function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
    if (domEventName === "submit" && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
      var action = coerceFormActionProp((nativeEventTarget[internalPropsKey] || null).action), submitter = nativeEvent.submitter;
      submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), domEventName !== null && (action = domEventName, submitter = null));
      var event = new SyntheticEvent("action", "action", null, nativeEvent, nativeEventTarget);
      dispatchQueue.push({
        event,
        listeners: [
          {
            instance: null,
            listener: function() {
              if (nativeEvent.defaultPrevented) {
                if (currentEventTransitionLane !== 0) {
                  var formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget);
                  startHostTransition(maybeTargetInst, {
                    pending: true,
                    data: formData,
                    method: nativeEventTarget.method,
                    action
                  }, null, formData);
                }
              } else
                typeof action === "function" && (event.preventDefault(), formData = submitter ? createFormDataWithSubmitter(nativeEventTarget, submitter) : new FormData(nativeEventTarget), startHostTransition(maybeTargetInst, {
                  pending: true,
                  data: formData,
                  method: nativeEventTarget.method,
                  action
                }, action, formData));
            },
            currentTarget: nativeEventTarget
          }
        ]
      });
    }
  }
  for (i$jscomp$inline_1528 = 0;i$jscomp$inline_1528 < simpleEventPluginEvents.length; i$jscomp$inline_1528++) {
    eventName$jscomp$inline_1529 = simpleEventPluginEvents[i$jscomp$inline_1528], domEventName$jscomp$inline_1530 = eventName$jscomp$inline_1529.toLowerCase(), capitalizedEvent$jscomp$inline_1531 = eventName$jscomp$inline_1529[0].toUpperCase() + eventName$jscomp$inline_1529.slice(1);
    registerSimpleEvent(domEventName$jscomp$inline_1530, "on" + capitalizedEvent$jscomp$inline_1531);
  }
  var eventName$jscomp$inline_1529;
  var domEventName$jscomp$inline_1530;
  var capitalizedEvent$jscomp$inline_1531;
  var i$jscomp$inline_1528;
  registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
  registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
  registerSimpleEvent(ANIMATION_START, "onAnimationStart");
  registerSimpleEvent("dblclick", "onDoubleClick");
  registerSimpleEvent("focusin", "onFocus");
  registerSimpleEvent("focusout", "onBlur");
  registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
  registerSimpleEvent(TRANSITION_START, "onTransitionStart");
  registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
  registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
  registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
  registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
  registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
  registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
  registerTwoPhaseEvent("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
  registerTwoPhaseEvent("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
  registerTwoPhaseEvent("onBeforeInput", [
    "compositionend",
    "keypress",
    "textInput",
    "paste"
  ]);
  registerTwoPhaseEvent("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
  registerTwoPhaseEvent("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
  registerTwoPhaseEvent("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
  var nonDelegatedEvents = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes));
  function processDispatchQueue(dispatchQueue, eventSystemFlags) {
    eventSystemFlags = (eventSystemFlags & 4) !== 0;
    for (var i = 0;i < dispatchQueue.length; i++) {
      var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
      _dispatchQueue$i = _dispatchQueue$i.listeners;
      a: {
        var previousInstance = undefined;
        if (eventSystemFlags)
          for (var i$jscomp$0 = _dispatchQueue$i.length - 1;0 <= i$jscomp$0; i$jscomp$0--) {
            var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
            _dispatchListeners$i = _dispatchListeners$i.listener;
            if (instance !== previousInstance && event.isPropagationStopped())
              break a;
            previousInstance = _dispatchListeners$i;
            event.currentTarget = currentTarget;
            try {
              previousInstance(event);
            } catch (error) {
              reportGlobalError(error);
            }
            event.currentTarget = null;
            previousInstance = instance;
          }
        else
          for (i$jscomp$0 = 0;i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
            _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
            instance = _dispatchListeners$i.instance;
            currentTarget = _dispatchListeners$i.currentTarget;
            _dispatchListeners$i = _dispatchListeners$i.listener;
            if (instance !== previousInstance && event.isPropagationStopped())
              break a;
            previousInstance = _dispatchListeners$i;
            event.currentTarget = currentTarget;
            try {
              previousInstance(event);
            } catch (error) {
              reportGlobalError(error);
            }
            event.currentTarget = null;
            previousInstance = instance;
          }
      }
    }
  }
  function listenToNonDelegatedEvent(domEventName, targetElement) {
    var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
    JSCompiler_inline_result === undefined && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = new Set);
    var listenerSetKey = domEventName + "__bubble";
    JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, false), JSCompiler_inline_result.add(listenerSetKey));
  }
  function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
    var eventSystemFlags = 0;
    isCapturePhaseListener && (eventSystemFlags |= 4);
    addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
  }
  var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
  function listenToAllSupportedEvents(rootContainerElement) {
    if (!rootContainerElement[listeningMarker]) {
      rootContainerElement[listeningMarker] = true;
      allNativeEvents.forEach(function(domEventName) {
        domEventName !== "selectionchange" && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, false, rootContainerElement), listenToNativeEvent(domEventName, true, rootContainerElement));
      });
      var ownerDocument = rootContainerElement.nodeType === 9 ? rootContainerElement : rootContainerElement.ownerDocument;
      ownerDocument === null || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = true, listenToNativeEvent("selectionchange", false, ownerDocument));
    }
  }
  function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
    switch (getEventPriority(domEventName)) {
      case 2:
        var listenerWrapper = dispatchDiscreteEvent;
        break;
      case 8:
        listenerWrapper = dispatchContinuousEvent;
        break;
      default:
        listenerWrapper = dispatchEvent;
    }
    eventSystemFlags = listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
    listenerWrapper = undefined;
    !passiveBrowserEventsSupported || domEventName !== "touchstart" && domEventName !== "touchmove" && domEventName !== "wheel" || (listenerWrapper = true);
    isCapturePhaseListener ? listenerWrapper !== undefined ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
      capture: true,
      passive: listenerWrapper
    }) : targetContainer.addEventListener(domEventName, eventSystemFlags, true) : listenerWrapper !== undefined ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
      passive: listenerWrapper
    }) : targetContainer.addEventListener(domEventName, eventSystemFlags, false);
  }
  function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
    var ancestorInst = targetInst$jscomp$0;
    if ((eventSystemFlags & 1) === 0 && (eventSystemFlags & 2) === 0 && targetInst$jscomp$0 !== null)
      a:
        for (;; ) {
          if (targetInst$jscomp$0 === null)
            return;
          var nodeTag = targetInst$jscomp$0.tag;
          if (nodeTag === 3 || nodeTag === 4) {
            var container = targetInst$jscomp$0.stateNode.containerInfo;
            if (container === targetContainer)
              break;
            if (nodeTag === 4)
              for (nodeTag = targetInst$jscomp$0.return;nodeTag !== null; ) {
                var grandTag = nodeTag.tag;
                if ((grandTag === 3 || grandTag === 4) && nodeTag.stateNode.containerInfo === targetContainer)
                  return;
                nodeTag = nodeTag.return;
              }
            for (;container !== null; ) {
              nodeTag = getClosestInstanceFromNode(container);
              if (nodeTag === null)
                return;
              grandTag = nodeTag.tag;
              if (grandTag === 5 || grandTag === 6 || grandTag === 26 || grandTag === 27) {
                targetInst$jscomp$0 = ancestorInst = nodeTag;
                continue a;
              }
              container = container.parentNode;
            }
          }
          targetInst$jscomp$0 = targetInst$jscomp$0.return;
        }
    batchedUpdates$1(function() {
      var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
      a: {
        var reactName = topLevelEventsToReactNames.get(domEventName);
        if (reactName !== undefined) {
          var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
          switch (domEventName) {
            case "keypress":
              if (getEventCharCode(nativeEvent) === 0)
                break a;
            case "keydown":
            case "keyup":
              SyntheticEventCtor = SyntheticKeyboardEvent;
              break;
            case "focusin":
              reactEventType = "focus";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "focusout":
              reactEventType = "blur";
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "beforeblur":
            case "afterblur":
              SyntheticEventCtor = SyntheticFocusEvent;
              break;
            case "click":
              if (nativeEvent.button === 2)
                break a;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              SyntheticEventCtor = SyntheticMouseEvent;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              SyntheticEventCtor = SyntheticDragEvent;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              SyntheticEventCtor = SyntheticTouchEvent;
              break;
            case ANIMATION_END:
            case ANIMATION_ITERATION:
            case ANIMATION_START:
              SyntheticEventCtor = SyntheticAnimationEvent;
              break;
            case TRANSITION_END:
              SyntheticEventCtor = SyntheticTransitionEvent;
              break;
            case "scroll":
            case "scrollend":
              SyntheticEventCtor = SyntheticUIEvent;
              break;
            case "wheel":
              SyntheticEventCtor = SyntheticWheelEvent;
              break;
            case "copy":
            case "cut":
            case "paste":
              SyntheticEventCtor = SyntheticClipboardEvent;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              SyntheticEventCtor = SyntheticPointerEvent;
              break;
            case "toggle":
            case "beforetoggle":
              SyntheticEventCtor = SyntheticToggleEvent;
          }
          var inCapturePhase = (eventSystemFlags & 4) !== 0, accumulateTargetOnly = !inCapturePhase && (domEventName === "scroll" || domEventName === "scrollend"), reactEventName = inCapturePhase ? reactName !== null ? reactName + "Capture" : null : reactName;
          inCapturePhase = [];
          for (var instance = targetInst, lastHostComponent;instance !== null; ) {
            var _instance = instance;
            lastHostComponent = _instance.stateNode;
            _instance = _instance.tag;
            _instance !== 5 && _instance !== 26 && _instance !== 27 || lastHostComponent === null || reactEventName === null || (_instance = getListener(instance, reactEventName), _instance != null && inCapturePhase.push(createDispatchListener(instance, _instance, lastHostComponent)));
            if (accumulateTargetOnly)
              break;
            instance = instance.return;
          }
          0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget), dispatchQueue.push({ event: reactName, listeners: inCapturePhase }));
        }
      }
      if ((eventSystemFlags & 7) === 0) {
        a: {
          reactName = domEventName === "mouseover" || domEventName === "pointerover";
          SyntheticEventCtor = domEventName === "mouseout" || domEventName === "pointerout";
          if (reactName && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey]))
            break a;
          if (SyntheticEventCtor || reactName) {
            reactName = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (reactName = nativeEventTarget.ownerDocument) ? reactName.defaultView || reactName.parentWindow : window;
            if (SyntheticEventCtor) {
              if (reactEventType = nativeEvent.relatedTarget || nativeEvent.toElement, SyntheticEventCtor = targetInst, reactEventType = reactEventType ? getClosestInstanceFromNode(reactEventType) : null, reactEventType !== null && (accumulateTargetOnly = getNearestMountedFiber(reactEventType), inCapturePhase = reactEventType.tag, reactEventType !== accumulateTargetOnly || inCapturePhase !== 5 && inCapturePhase !== 27 && inCapturePhase !== 6))
                reactEventType = null;
            } else
              SyntheticEventCtor = null, reactEventType = targetInst;
            if (SyntheticEventCtor !== reactEventType) {
              inCapturePhase = SyntheticMouseEvent;
              _instance = "onMouseLeave";
              reactEventName = "onMouseEnter";
              instance = "mouse";
              if (domEventName === "pointerout" || domEventName === "pointerover")
                inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
              accumulateTargetOnly = SyntheticEventCtor == null ? reactName : getNodeFromInstance(SyntheticEventCtor);
              lastHostComponent = reactEventType == null ? reactName : getNodeFromInstance(reactEventType);
              reactName = new inCapturePhase(_instance, instance + "leave", SyntheticEventCtor, nativeEvent, nativeEventTarget);
              reactName.target = accumulateTargetOnly;
              reactName.relatedTarget = lastHostComponent;
              _instance = null;
              getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(reactEventName, instance + "enter", reactEventType, nativeEvent, nativeEventTarget), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
              accumulateTargetOnly = _instance;
              if (SyntheticEventCtor && reactEventType)
                b: {
                  inCapturePhase = SyntheticEventCtor;
                  reactEventName = reactEventType;
                  instance = 0;
                  for (lastHostComponent = inCapturePhase;lastHostComponent; lastHostComponent = getParent(lastHostComponent))
                    instance++;
                  lastHostComponent = 0;
                  for (_instance = reactEventName;_instance; _instance = getParent(_instance))
                    lastHostComponent++;
                  for (;0 < instance - lastHostComponent; )
                    inCapturePhase = getParent(inCapturePhase), instance--;
                  for (;0 < lastHostComponent - instance; )
                    reactEventName = getParent(reactEventName), lastHostComponent--;
                  for (;instance--; ) {
                    if (inCapturePhase === reactEventName || reactEventName !== null && inCapturePhase === reactEventName.alternate)
                      break b;
                    inCapturePhase = getParent(inCapturePhase);
                    reactEventName = getParent(reactEventName);
                  }
                  inCapturePhase = null;
                }
              else
                inCapturePhase = null;
              SyntheticEventCtor !== null && accumulateEnterLeaveListenersForEvent(dispatchQueue, reactName, SyntheticEventCtor, inCapturePhase, false);
              reactEventType !== null && accumulateTargetOnly !== null && accumulateEnterLeaveListenersForEvent(dispatchQueue, accumulateTargetOnly, reactEventType, inCapturePhase, true);
            }
          }
        }
        a: {
          reactName = targetInst ? getNodeFromInstance(targetInst) : window;
          SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
          if (SyntheticEventCtor === "select" || SyntheticEventCtor === "input" && reactName.type === "file")
            var getTargetInstFunc = getTargetInstForChangeEvent;
          else if (isTextInputElement(reactName))
            if (isInputEventSupported)
              getTargetInstFunc = getTargetInstForInputOrChangeEvent;
            else {
              getTargetInstFunc = getTargetInstForInputEventPolyfill;
              var handleEventFunc = handleEventsForInputEventPolyfill;
            }
          else
            SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || SyntheticEventCtor.toLowerCase() !== "input" || reactName.type !== "checkbox" && reactName.type !== "radio" ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
          if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
            createAndAccumulateChangeEvent(dispatchQueue, getTargetInstFunc, nativeEvent, nativeEventTarget);
            break a;
          }
          handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
          domEventName === "focusout" && targetInst && reactName.type === "number" && targetInst.memoizedProps.value != null && setDefaultValue(reactName, "number", reactName.value);
        }
        handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
        switch (domEventName) {
          case "focusin":
            if (isTextInputElement(handleEventFunc) || handleEventFunc.contentEditable === "true")
              activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
            break;
          case "focusout":
            lastSelection = activeElementInst = activeElement = null;
            break;
          case "mousedown":
            mouseDown = true;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            mouseDown = false;
            constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
            break;
          case "selectionchange":
            if (skipSelectionChangeEvent)
              break;
          case "keydown":
          case "keyup":
            constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
        }
        var fallbackData;
        if (canUseCompositionEvent)
          b: {
            switch (domEventName) {
              case "compositionstart":
                var eventType = "onCompositionStart";
                break b;
              case "compositionend":
                eventType = "onCompositionEnd";
                break b;
              case "compositionupdate":
                eventType = "onCompositionUpdate";
                break b;
            }
            eventType = undefined;
          }
        else
          isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : domEventName === "keydown" && nativeEvent.keyCode === 229 && (eventType = "onCompositionStart");
        eventType && (useFallbackCompositionData && nativeEvent.locale !== "ko" && (isComposing || eventType !== "onCompositionStart" ? eventType === "onCompositionEnd" && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = ("value" in root) ? root.value : root.textContent, isComposing = true)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget), dispatchQueue.push({ event: eventType, listeners: handleEventFunc }), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), fallbackData !== null && (eventType.data = fallbackData))));
        if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent))
          eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent("onBeforeInput", "beforeinput", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
            event: handleEventFunc,
            listeners: eventType
          }), handleEventFunc.data = fallbackData);
        extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
      }
      processDispatchQueue(dispatchQueue, eventSystemFlags);
    });
  }
  function createDispatchListener(instance, listener, currentTarget) {
    return {
      instance,
      listener,
      currentTarget
    };
  }
  function accumulateTwoPhaseListeners(targetFiber, reactName) {
    for (var captureName = reactName + "Capture", listeners = [];targetFiber !== null; ) {
      var _instance2 = targetFiber, stateNode = _instance2.stateNode;
      _instance2 = _instance2.tag;
      _instance2 !== 5 && _instance2 !== 26 && _instance2 !== 27 || stateNode === null || (_instance2 = getListener(targetFiber, captureName), _instance2 != null && listeners.unshift(createDispatchListener(targetFiber, _instance2, stateNode)), _instance2 = getListener(targetFiber, reactName), _instance2 != null && listeners.push(createDispatchListener(targetFiber, _instance2, stateNode)));
      if (targetFiber.tag === 3)
        return listeners;
      targetFiber = targetFiber.return;
    }
    return [];
  }
  function getParent(inst) {
    if (inst === null)
      return null;
    do
      inst = inst.return;
    while (inst && inst.tag !== 5 && inst.tag !== 27);
    return inst ? inst : null;
  }
  function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
    for (var registrationName = event._reactName, listeners = [];target !== null && target !== common; ) {
      var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
      _instance3 = _instance3.tag;
      if (alternate !== null && alternate === common)
        break;
      _instance3 !== 5 && _instance3 !== 26 && _instance3 !== 27 || stateNode === null || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), stateNode != null && listeners.unshift(createDispatchListener(target, stateNode, alternate))) : inCapturePhase || (stateNode = getListener(target, registrationName), stateNode != null && listeners.push(createDispatchListener(target, stateNode, alternate))));
      target = target.return;
    }
    listeners.length !== 0 && dispatchQueue.push({ event, listeners });
  }
  var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
  var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
  function normalizeMarkupForTextOrAttribute(markup) {
    return (typeof markup === "string" ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, `
`).replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
  }
  function checkForUnmatchedText(serverText, clientText) {
    clientText = normalizeMarkupForTextOrAttribute(clientText);
    return normalizeMarkupForTextOrAttribute(serverText) === clientText ? true : false;
  }
  function noop$1() {}
  function setProp(domElement, tag, key, value, props, prevValue) {
    switch (key) {
      case "children":
        typeof value === "string" ? tag === "body" || tag === "textarea" && value === "" || setTextContent(domElement, value) : (typeof value === "number" || typeof value === "bigint") && tag !== "body" && setTextContent(domElement, "" + value);
        break;
      case "className":
        setValueForKnownAttribute(domElement, "class", value);
        break;
      case "tabIndex":
        setValueForKnownAttribute(domElement, "tabindex", value);
        break;
      case "dir":
      case "role":
      case "viewBox":
      case "width":
      case "height":
        setValueForKnownAttribute(domElement, key, value);
        break;
      case "style":
        setValueForStyles(domElement, value, prevValue);
        break;
      case "data":
        if (tag !== "object") {
          setValueForKnownAttribute(domElement, "data", value);
          break;
        }
      case "src":
      case "href":
        if (value === "" && (tag !== "a" || key !== "href")) {
          domElement.removeAttribute(key);
          break;
        }
        if (value == null || typeof value === "function" || typeof value === "symbol" || typeof value === "boolean") {
          domElement.removeAttribute(key);
          break;
        }
        value = sanitizeURL("" + value);
        domElement.setAttribute(key, value);
        break;
      case "action":
      case "formAction":
        if (typeof value === "function") {
          domElement.setAttribute(key, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
          break;
        } else
          typeof prevValue === "function" && (key === "formAction" ? (tag !== "input" && setProp(domElement, tag, "name", props.name, props, null), setProp(domElement, tag, "formEncType", props.formEncType, props, null), setProp(domElement, tag, "formMethod", props.formMethod, props, null), setProp(domElement, tag, "formTarget", props.formTarget, props, null)) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
        if (value == null || typeof value === "symbol" || typeof value === "boolean") {
          domElement.removeAttribute(key);
          break;
        }
        value = sanitizeURL("" + value);
        domElement.setAttribute(key, value);
        break;
      case "onClick":
        value != null && (domElement.onclick = noop$1);
        break;
      case "onScroll":
        value != null && listenToNonDelegatedEvent("scroll", domElement);
        break;
      case "onScrollEnd":
        value != null && listenToNonDelegatedEvent("scrollend", domElement);
        break;
      case "dangerouslySetInnerHTML":
        if (value != null) {
          if (typeof value !== "object" || !("__html" in value))
            throw Error(formatProdErrorMessage(61));
          key = value.__html;
          if (key != null) {
            if (props.children != null)
              throw Error(formatProdErrorMessage(60));
            domElement.innerHTML = key;
          }
        }
        break;
      case "multiple":
        domElement.multiple = value && typeof value !== "function" && typeof value !== "symbol";
        break;
      case "muted":
        domElement.muted = value && typeof value !== "function" && typeof value !== "symbol";
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "ref":
        break;
      case "autoFocus":
        break;
      case "xlinkHref":
        if (value == null || typeof value === "function" || typeof value === "boolean" || typeof value === "symbol") {
          domElement.removeAttribute("xlink:href");
          break;
        }
        key = sanitizeURL("" + value);
        domElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", key);
        break;
      case "contentEditable":
      case "spellCheck":
      case "draggable":
      case "value":
      case "autoReverse":
      case "externalResourcesRequired":
      case "focusable":
      case "preserveAlpha":
        value != null && typeof value !== "function" && typeof value !== "symbol" ? domElement.setAttribute(key, "" + value) : domElement.removeAttribute(key);
        break;
      case "inert":
      case "allowFullScreen":
      case "async":
      case "autoPlay":
      case "controls":
      case "default":
      case "defer":
      case "disabled":
      case "disablePictureInPicture":
      case "disableRemotePlayback":
      case "formNoValidate":
      case "hidden":
      case "loop":
      case "noModule":
      case "noValidate":
      case "open":
      case "playsInline":
      case "readOnly":
      case "required":
      case "reversed":
      case "scoped":
      case "seamless":
      case "itemScope":
        value && typeof value !== "function" && typeof value !== "symbol" ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
        break;
      case "capture":
      case "download":
        value === true ? domElement.setAttribute(key, "") : value !== false && value != null && typeof value !== "function" && typeof value !== "symbol" ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
        break;
      case "cols":
      case "rows":
      case "size":
      case "span":
        value != null && typeof value !== "function" && typeof value !== "symbol" && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
        break;
      case "rowSpan":
      case "start":
        value == null || typeof value === "function" || typeof value === "symbol" || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
        break;
      case "popover":
        listenToNonDelegatedEvent("beforetoggle", domElement);
        listenToNonDelegatedEvent("toggle", domElement);
        setValueForAttribute(domElement, "popover", value);
        break;
      case "xlinkActuate":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:actuate", value);
        break;
      case "xlinkArcrole":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:arcrole", value);
        break;
      case "xlinkRole":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:role", value);
        break;
      case "xlinkShow":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:show", value);
        break;
      case "xlinkTitle":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:title", value);
        break;
      case "xlinkType":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:type", value);
        break;
      case "xmlBase":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:base", value);
        break;
      case "xmlLang":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:lang", value);
        break;
      case "xmlSpace":
        setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:space", value);
        break;
      case "is":
        setValueForAttribute(domElement, "is", value);
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!(2 < key.length) || key[0] !== "o" && key[0] !== "O" || key[1] !== "n" && key[1] !== "N")
          key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
    }
  }
  function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
    switch (key) {
      case "style":
        setValueForStyles(domElement, value, prevValue);
        break;
      case "dangerouslySetInnerHTML":
        if (value != null) {
          if (typeof value !== "object" || !("__html" in value))
            throw Error(formatProdErrorMessage(61));
          key = value.__html;
          if (key != null) {
            if (props.children != null)
              throw Error(formatProdErrorMessage(60));
            domElement.innerHTML = key;
          }
        }
        break;
      case "children":
        typeof value === "string" ? setTextContent(domElement, value) : (typeof value === "number" || typeof value === "bigint") && setTextContent(domElement, "" + value);
        break;
      case "onScroll":
        value != null && listenToNonDelegatedEvent("scroll", domElement);
        break;
      case "onScrollEnd":
        value != null && listenToNonDelegatedEvent("scrollend", domElement);
        break;
      case "onClick":
        value != null && (domElement.onclick = noop$1);
        break;
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
      case "innerHTML":
      case "ref":
        break;
      case "innerText":
      case "textContent":
        break;
      default:
        if (!registrationNameDependencies.hasOwnProperty(key))
          a: {
            if (key[0] === "o" && key[1] === "n" && (props = key.endsWith("Capture"), tag = key.slice(2, props ? key.length - 7 : undefined), prevValue = domElement[internalPropsKey] || null, prevValue = prevValue != null ? prevValue[key] : null, typeof prevValue === "function" && domElement.removeEventListener(tag, prevValue, props), typeof value === "function")) {
              typeof prevValue !== "function" && prevValue !== null && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
              domElement.addEventListener(tag, value, props);
              break a;
            }
            key in domElement ? domElement[key] = value : value === true ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
          }
    }
  }
  function setInitialProperties(domElement, tag, props) {
    switch (tag) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "img":
        listenToNonDelegatedEvent("error", domElement);
        listenToNonDelegatedEvent("load", domElement);
        var hasSrc = false, hasSrcSet = false, propKey;
        for (propKey in props)
          if (props.hasOwnProperty(propKey)) {
            var propValue = props[propKey];
            if (propValue != null)
              switch (propKey) {
                case "src":
                  hasSrc = true;
                  break;
                case "srcSet":
                  hasSrcSet = true;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  throw Error(formatProdErrorMessage(137, tag));
                default:
                  setProp(domElement, tag, propKey, propValue, props, null);
              }
          }
        hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
        hasSrc && setProp(domElement, tag, "src", props.src, props, null);
        return;
      case "input":
        listenToNonDelegatedEvent("invalid", domElement);
        var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
        for (hasSrc in props)
          if (props.hasOwnProperty(hasSrc)) {
            var propValue$188 = props[hasSrc];
            if (propValue$188 != null)
              switch (hasSrc) {
                case "name":
                  hasSrcSet = propValue$188;
                  break;
                case "type":
                  propValue = propValue$188;
                  break;
                case "checked":
                  checked = propValue$188;
                  break;
                case "defaultChecked":
                  defaultChecked = propValue$188;
                  break;
                case "value":
                  propKey = propValue$188;
                  break;
                case "defaultValue":
                  defaultValue = propValue$188;
                  break;
                case "children":
                case "dangerouslySetInnerHTML":
                  if (propValue$188 != null)
                    throw Error(formatProdErrorMessage(137, tag));
                  break;
                default:
                  setProp(domElement, tag, hasSrc, propValue$188, props, null);
              }
          }
        initInput(domElement, propKey, defaultValue, checked, defaultChecked, propValue, hasSrcSet, false);
        track(domElement);
        return;
      case "select":
        listenToNonDelegatedEvent("invalid", domElement);
        hasSrc = propValue = propKey = null;
        for (hasSrcSet in props)
          if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], defaultValue != null))
            switch (hasSrcSet) {
              case "value":
                propKey = defaultValue;
                break;
              case "defaultValue":
                propValue = defaultValue;
                break;
              case "multiple":
                hasSrc = defaultValue;
              default:
                setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
            }
        tag = propKey;
        props = propValue;
        domElement.multiple = !!hasSrc;
        tag != null ? updateOptions(domElement, !!hasSrc, tag, false) : props != null && updateOptions(domElement, !!hasSrc, props, true);
        return;
      case "textarea":
        listenToNonDelegatedEvent("invalid", domElement);
        propKey = hasSrcSet = hasSrc = null;
        for (propValue in props)
          if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], defaultValue != null))
            switch (propValue) {
              case "value":
                hasSrc = defaultValue;
                break;
              case "defaultValue":
                hasSrcSet = defaultValue;
                break;
              case "children":
                propKey = defaultValue;
                break;
              case "dangerouslySetInnerHTML":
                if (defaultValue != null)
                  throw Error(formatProdErrorMessage(91));
                break;
              default:
                setProp(domElement, tag, propValue, defaultValue, props, null);
            }
        initTextarea(domElement, hasSrc, hasSrcSet, propKey);
        track(domElement);
        return;
      case "option":
        for (checked in props)
          if (props.hasOwnProperty(checked) && (hasSrc = props[checked], hasSrc != null))
            switch (checked) {
              case "selected":
                domElement.selected = hasSrc && typeof hasSrc !== "function" && typeof hasSrc !== "symbol";
                break;
              default:
                setProp(domElement, tag, checked, hasSrc, props, null);
            }
        return;
      case "dialog":
        listenToNonDelegatedEvent("beforetoggle", domElement);
        listenToNonDelegatedEvent("toggle", domElement);
        listenToNonDelegatedEvent("cancel", domElement);
        listenToNonDelegatedEvent("close", domElement);
        break;
      case "iframe":
      case "object":
        listenToNonDelegatedEvent("load", domElement);
        break;
      case "video":
      case "audio":
        for (hasSrc = 0;hasSrc < mediaEventTypes.length; hasSrc++)
          listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
        break;
      case "image":
        listenToNonDelegatedEvent("error", domElement);
        listenToNonDelegatedEvent("load", domElement);
        break;
      case "details":
        listenToNonDelegatedEvent("toggle", domElement);
        break;
      case "embed":
      case "source":
      case "link":
        listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
      case "area":
      case "base":
      case "br":
      case "col":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "track":
      case "wbr":
      case "menuitem":
        for (defaultChecked in props)
          if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], hasSrc != null))
            switch (defaultChecked) {
              case "children":
              case "dangerouslySetInnerHTML":
                throw Error(formatProdErrorMessage(137, tag));
              default:
                setProp(domElement, tag, defaultChecked, hasSrc, props, null);
            }
        return;
      default:
        if (isCustomElement(tag)) {
          for (propValue$188 in props)
            props.hasOwnProperty(propValue$188) && (hasSrc = props[propValue$188], hasSrc !== undefined && setPropOnCustomElement(domElement, tag, propValue$188, hasSrc, props, undefined));
          return;
        }
    }
    for (defaultValue in props)
      props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], hasSrc != null && setProp(domElement, tag, defaultValue, hasSrc, props, null));
  }
  function updateProperties(domElement, tag, lastProps, nextProps) {
    switch (tag) {
      case "div":
      case "span":
      case "svg":
      case "path":
      case "a":
      case "g":
      case "p":
      case "li":
        break;
      case "input":
        var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
        for (propKey in lastProps) {
          var lastProp = lastProps[propKey];
          if (lastProps.hasOwnProperty(propKey) && lastProp != null)
            switch (propKey) {
              case "checked":
                break;
              case "value":
                break;
              case "defaultValue":
                lastDefaultValue = lastProp;
              default:
                nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
            }
        }
        for (var propKey$205 in nextProps) {
          var propKey = nextProps[propKey$205];
          lastProp = lastProps[propKey$205];
          if (nextProps.hasOwnProperty(propKey$205) && (propKey != null || lastProp != null))
            switch (propKey$205) {
              case "type":
                type = propKey;
                break;
              case "name":
                name = propKey;
                break;
              case "checked":
                checked = propKey;
                break;
              case "defaultChecked":
                defaultChecked = propKey;
                break;
              case "value":
                value = propKey;
                break;
              case "defaultValue":
                defaultValue = propKey;
                break;
              case "children":
              case "dangerouslySetInnerHTML":
                if (propKey != null)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                propKey !== lastProp && setProp(domElement, tag, propKey$205, propKey, nextProps, lastProp);
            }
        }
        updateInput(domElement, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name);
        return;
      case "select":
        propKey = value = defaultValue = propKey$205 = null;
        for (type in lastProps)
          if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && lastDefaultValue != null)
            switch (type) {
              case "value":
                break;
              case "multiple":
                propKey = lastDefaultValue;
              default:
                nextProps.hasOwnProperty(type) || setProp(domElement, tag, type, null, nextProps, lastDefaultValue);
            }
        for (name in nextProps)
          if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (type != null || lastDefaultValue != null))
            switch (name) {
              case "value":
                propKey$205 = type;
                break;
              case "defaultValue":
                defaultValue = type;
                break;
              case "multiple":
                value = type;
              default:
                type !== lastDefaultValue && setProp(domElement, tag, name, type, nextProps, lastDefaultValue);
            }
        tag = defaultValue;
        lastProps = value;
        nextProps = propKey;
        propKey$205 != null ? updateOptions(domElement, !!lastProps, propKey$205, false) : !!nextProps !== !!lastProps && (tag != null ? updateOptions(domElement, !!lastProps, tag, true) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", false));
        return;
      case "textarea":
        propKey = propKey$205 = null;
        for (defaultValue in lastProps)
          if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && name != null && !nextProps.hasOwnProperty(defaultValue))
            switch (defaultValue) {
              case "value":
                break;
              case "children":
                break;
              default:
                setProp(domElement, tag, defaultValue, null, nextProps, name);
            }
        for (value in nextProps)
          if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (name != null || type != null))
            switch (value) {
              case "value":
                propKey$205 = name;
                break;
              case "defaultValue":
                propKey = name;
                break;
              case "children":
                break;
              case "dangerouslySetInnerHTML":
                if (name != null)
                  throw Error(formatProdErrorMessage(91));
                break;
              default:
                name !== type && setProp(domElement, tag, value, name, nextProps, type);
            }
        updateTextarea(domElement, propKey$205, propKey);
        return;
      case "option":
        for (var propKey$221 in lastProps)
          if (propKey$205 = lastProps[propKey$221], lastProps.hasOwnProperty(propKey$221) && propKey$205 != null && !nextProps.hasOwnProperty(propKey$221))
            switch (propKey$221) {
              case "selected":
                domElement.selected = false;
                break;
              default:
                setProp(domElement, tag, propKey$221, null, nextProps, propKey$205);
            }
        for (lastDefaultValue in nextProps)
          if (propKey$205 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$205 !== propKey && (propKey$205 != null || propKey != null))
            switch (lastDefaultValue) {
              case "selected":
                domElement.selected = propKey$205 && typeof propKey$205 !== "function" && typeof propKey$205 !== "symbol";
                break;
              default:
                setProp(domElement, tag, lastDefaultValue, propKey$205, nextProps, propKey);
            }
        return;
      case "img":
      case "link":
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "keygen":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
      case "menuitem":
        for (var propKey$226 in lastProps)
          propKey$205 = lastProps[propKey$226], lastProps.hasOwnProperty(propKey$226) && propKey$205 != null && !nextProps.hasOwnProperty(propKey$226) && setProp(domElement, tag, propKey$226, null, nextProps, propKey$205);
        for (checked in nextProps)
          if (propKey$205 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$205 !== propKey && (propKey$205 != null || propKey != null))
            switch (checked) {
              case "children":
              case "dangerouslySetInnerHTML":
                if (propKey$205 != null)
                  throw Error(formatProdErrorMessage(137, tag));
                break;
              default:
                setProp(domElement, tag, checked, propKey$205, nextProps, propKey);
            }
        return;
      default:
        if (isCustomElement(tag)) {
          for (var propKey$231 in lastProps)
            propKey$205 = lastProps[propKey$231], lastProps.hasOwnProperty(propKey$231) && propKey$205 !== undefined && !nextProps.hasOwnProperty(propKey$231) && setPropOnCustomElement(domElement, tag, propKey$231, undefined, nextProps, propKey$205);
          for (defaultChecked in nextProps)
            propKey$205 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$205 === propKey || propKey$205 === undefined && propKey === undefined || setPropOnCustomElement(domElement, tag, defaultChecked, propKey$205, nextProps, propKey);
          return;
        }
    }
    for (var propKey$236 in lastProps)
      propKey$205 = lastProps[propKey$236], lastProps.hasOwnProperty(propKey$236) && propKey$205 != null && !nextProps.hasOwnProperty(propKey$236) && setProp(domElement, tag, propKey$236, null, nextProps, propKey$205);
    for (lastProp in nextProps)
      propKey$205 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$205 === propKey || propKey$205 == null && propKey == null || setProp(domElement, tag, lastProp, propKey$205, nextProps, propKey);
  }
  var eventsEnabled = null;
  var selectionInformation = null;
  function getOwnerDocumentFromRootContainer(rootContainerElement) {
    return rootContainerElement.nodeType === 9 ? rootContainerElement : rootContainerElement.ownerDocument;
  }
  function getOwnHostContext(namespaceURI) {
    switch (namespaceURI) {
      case "http://www.w3.org/2000/svg":
        return 1;
      case "http://www.w3.org/1998/Math/MathML":
        return 2;
      default:
        return 0;
    }
  }
  function getChildHostContextProd(parentNamespace, type) {
    if (parentNamespace === 0)
      switch (type) {
        case "svg":
          return 1;
        case "math":
          return 2;
        default:
          return 0;
      }
    return parentNamespace === 1 && type === "foreignObject" ? 0 : parentNamespace;
  }
  function shouldSetTextContent(type, props) {
    return type === "textarea" || type === "noscript" || typeof props.children === "string" || typeof props.children === "number" || typeof props.children === "bigint" || typeof props.dangerouslySetInnerHTML === "object" && props.dangerouslySetInnerHTML !== null && props.dangerouslySetInnerHTML.__html != null;
  }
  var currentPopstateTransitionEvent = null;
  function shouldAttemptEagerTransition() {
    var event = window.event;
    if (event && event.type === "popstate") {
      if (event === currentPopstateTransitionEvent)
        return false;
      currentPopstateTransitionEvent = event;
      return true;
    }
    currentPopstateTransitionEvent = null;
    return false;
  }
  var scheduleTimeout = typeof setTimeout === "function" ? setTimeout : undefined;
  var cancelTimeout = typeof clearTimeout === "function" ? clearTimeout : undefined;
  var localPromise = typeof Promise === "function" ? Promise : undefined;
  var scheduleMicrotask = typeof queueMicrotask === "function" ? queueMicrotask : typeof localPromise !== "undefined" ? function(callback) {
    return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
  } : scheduleTimeout;
  function handleErrorInNextTick(error) {
    setTimeout(function() {
      throw error;
    });
  }
  function isSingletonScope(type) {
    return type === "head";
  }
  function clearSuspenseBoundary(parentInstance, suspenseInstance) {
    var node = suspenseInstance, possiblePreambleContribution = 0, depth = 0;
    do {
      var nextNode = node.nextSibling;
      parentInstance.removeChild(node);
      if (nextNode && nextNode.nodeType === 8)
        if (node = nextNode.data, node === "/$") {
          if (0 < possiblePreambleContribution && 8 > possiblePreambleContribution) {
            node = possiblePreambleContribution;
            var ownerDocument = parentInstance.ownerDocument;
            node & 1 && releaseSingletonInstance(ownerDocument.documentElement);
            node & 2 && releaseSingletonInstance(ownerDocument.body);
            if (node & 4)
              for (node = ownerDocument.head, releaseSingletonInstance(node), ownerDocument = node.firstChild;ownerDocument; ) {
                var { nextSibling: nextNode$jscomp$0, nodeName } = ownerDocument;
                ownerDocument[internalHoistableMarker] || nodeName === "SCRIPT" || nodeName === "STYLE" || nodeName === "LINK" && ownerDocument.rel.toLowerCase() === "stylesheet" || node.removeChild(ownerDocument);
                ownerDocument = nextNode$jscomp$0;
              }
          }
          if (depth === 0) {
            parentInstance.removeChild(nextNode);
            retryIfBlockedOn(suspenseInstance);
            return;
          }
          depth--;
        } else
          node === "$" || node === "$?" || node === "$!" ? depth++ : possiblePreambleContribution = node.charCodeAt(0) - 48;
      else
        possiblePreambleContribution = 0;
      node = nextNode;
    } while (node);
    retryIfBlockedOn(suspenseInstance);
  }
  function clearContainerSparingly(container) {
    var nextNode = container.firstChild;
    nextNode && nextNode.nodeType === 10 && (nextNode = nextNode.nextSibling);
    for (;nextNode; ) {
      var node = nextNode;
      nextNode = nextNode.nextSibling;
      switch (node.nodeName) {
        case "HTML":
        case "HEAD":
        case "BODY":
          clearContainerSparingly(node);
          detachDeletedInstance(node);
          continue;
        case "SCRIPT":
        case "STYLE":
          continue;
        case "LINK":
          if (node.rel.toLowerCase() === "stylesheet")
            continue;
      }
      container.removeChild(node);
    }
  }
  function canHydrateInstance(instance, type, props, inRootOrSingleton) {
    for (;instance.nodeType === 1; ) {
      var anyProps = props;
      if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
        if (!inRootOrSingleton && (instance.nodeName !== "INPUT" || instance.type !== "hidden"))
          break;
      } else if (!inRootOrSingleton)
        if (type === "input" && instance.type === "hidden") {
          var name = anyProps.name == null ? null : "" + anyProps.name;
          if (anyProps.type === "hidden" && instance.getAttribute("name") === name)
            return instance;
        } else
          return instance;
      else if (!instance[internalHoistableMarker])
        switch (type) {
          case "meta":
            if (!instance.hasAttribute("itemprop"))
              break;
            return instance;
          case "link":
            name = instance.getAttribute("rel");
            if (name === "stylesheet" && instance.hasAttribute("data-precedence"))
              break;
            else if (name !== anyProps.rel || instance.getAttribute("href") !== (anyProps.href == null || anyProps.href === "" ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (anyProps.crossOrigin == null ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (anyProps.title == null ? null : anyProps.title))
              break;
            return instance;
          case "style":
            if (instance.hasAttribute("data-precedence"))
              break;
            return instance;
          case "script":
            name = instance.getAttribute("src");
            if ((name !== (anyProps.src == null ? null : anyProps.src) || instance.getAttribute("type") !== (anyProps.type == null ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (anyProps.crossOrigin == null ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop"))
              break;
            return instance;
          default:
            return instance;
        }
      instance = getNextHydratable(instance.nextSibling);
      if (instance === null)
        break;
    }
    return null;
  }
  function canHydrateTextInstance(instance, text, inRootOrSingleton) {
    if (text === "")
      return null;
    for (;instance.nodeType !== 3; ) {
      if ((instance.nodeType !== 1 || instance.nodeName !== "INPUT" || instance.type !== "hidden") && !inRootOrSingleton)
        return null;
      instance = getNextHydratable(instance.nextSibling);
      if (instance === null)
        return null;
    }
    return instance;
  }
  function isSuspenseInstanceFallback(instance) {
    return instance.data === "$!" || instance.data === "$?" && instance.ownerDocument.readyState === "complete";
  }
  function registerSuspenseInstanceRetry(instance, callback) {
    var ownerDocument = instance.ownerDocument;
    if (instance.data !== "$?" || ownerDocument.readyState === "complete")
      callback();
    else {
      var listener = function() {
        callback();
        ownerDocument.removeEventListener("DOMContentLoaded", listener);
      };
      ownerDocument.addEventListener("DOMContentLoaded", listener);
      instance._reactRetry = listener;
    }
  }
  function getNextHydratable(node) {
    for (;node != null; node = node.nextSibling) {
      var nodeType = node.nodeType;
      if (nodeType === 1 || nodeType === 3)
        break;
      if (nodeType === 8) {
        nodeType = node.data;
        if (nodeType === "$" || nodeType === "$!" || nodeType === "$?" || nodeType === "F!" || nodeType === "F")
          break;
        if (nodeType === "/$")
          return null;
      }
    }
    return node;
  }
  var previousHydratableOnEnteringScopedSingleton = null;
  function getParentSuspenseInstance(targetInstance) {
    targetInstance = targetInstance.previousSibling;
    for (var depth = 0;targetInstance; ) {
      if (targetInstance.nodeType === 8) {
        var data = targetInstance.data;
        if (data === "$" || data === "$!" || data === "$?") {
          if (depth === 0)
            return targetInstance;
          depth--;
        } else
          data === "/$" && depth++;
      }
      targetInstance = targetInstance.previousSibling;
    }
    return null;
  }
  function resolveSingletonInstance(type, props, rootContainerInstance) {
    props = getOwnerDocumentFromRootContainer(rootContainerInstance);
    switch (type) {
      case "html":
        type = props.documentElement;
        if (!type)
          throw Error(formatProdErrorMessage(452));
        return type;
      case "head":
        type = props.head;
        if (!type)
          throw Error(formatProdErrorMessage(453));
        return type;
      case "body":
        type = props.body;
        if (!type)
          throw Error(formatProdErrorMessage(454));
        return type;
      default:
        throw Error(formatProdErrorMessage(451));
    }
  }
  function releaseSingletonInstance(instance) {
    for (var attributes = instance.attributes;attributes.length; )
      instance.removeAttributeNode(attributes[0]);
    detachDeletedInstance(instance);
  }
  var preloadPropsMap = new Map;
  var preconnectsSet = new Set;
  function getHoistableRoot(container) {
    return typeof container.getRootNode === "function" ? container.getRootNode() : container.nodeType === 9 ? container : container.ownerDocument;
  }
  var previousDispatcher = ReactDOMSharedInternals.d;
  ReactDOMSharedInternals.d = {
    f: flushSyncWork,
    r: requestFormReset,
    D: prefetchDNS,
    C: preconnect,
    L: preload,
    m: preloadModule,
    X: preinitScript,
    S: preinitStyle,
    M: preinitModuleScript
  };
  function flushSyncWork() {
    var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
    return previousWasRendering || wasRendering;
  }
  function requestFormReset(form) {
    var formInst = getInstanceFromNode(form);
    formInst !== null && formInst.tag === 5 && formInst.type === "form" ? requestFormReset$1(formInst) : previousDispatcher.r(form);
  }
  var globalDocument = typeof document === "undefined" ? null : document;
  function preconnectAs(rel, href, crossOrigin) {
    var ownerDocument = globalDocument;
    if (ownerDocument && typeof href === "string" && href) {
      var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
      limitedEscapedHref = 'link[rel="' + rel + '"][href="' + limitedEscapedHref + '"]';
      typeof crossOrigin === "string" && (limitedEscapedHref += '[crossorigin="' + crossOrigin + '"]');
      preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = { rel, crossOrigin, href }, ownerDocument.querySelector(limitedEscapedHref) === null && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
    }
  }
  function prefetchDNS(href) {
    previousDispatcher.D(href);
    preconnectAs("dns-prefetch", href, null);
  }
  function preconnect(href, crossOrigin) {
    previousDispatcher.C(href, crossOrigin);
    preconnectAs("preconnect", href, crossOrigin);
  }
  function preload(href, as, options2) {
    previousDispatcher.L(href, as, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href && as) {
      var preloadSelector = 'link[rel="preload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"]';
      as === "image" ? options2 && options2.imageSrcSet ? (preloadSelector += '[imagesrcset="' + escapeSelectorAttributeValueInsideDoubleQuotes(options2.imageSrcSet) + '"]', typeof options2.imageSizes === "string" && (preloadSelector += '[imagesizes="' + escapeSelectorAttributeValueInsideDoubleQuotes(options2.imageSizes) + '"]')) : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]' : preloadSelector += '[href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]';
      var key = preloadSelector;
      switch (as) {
        case "style":
          key = getStyleKey(href);
          break;
        case "script":
          key = getScriptKey(href);
      }
      preloadPropsMap.has(key) || (href = assign({
        rel: "preload",
        href: as === "image" && options2 && options2.imageSrcSet ? undefined : href,
        as
      }, options2), preloadPropsMap.set(key, href), ownerDocument.querySelector(preloadSelector) !== null || as === "style" && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || as === "script" && ownerDocument.querySelector(getScriptSelectorFromKey(key)) || (as = ownerDocument.createElement("link"), setInitialProperties(as, "link", href), markNodeAsHoistable(as), ownerDocument.head.appendChild(as)));
    }
  }
  function preloadModule(href, options2) {
    previousDispatcher.m(href, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href) {
      var as = options2 && typeof options2.as === "string" ? options2.as : "script", preloadSelector = 'link[rel="modulepreload"][as="' + escapeSelectorAttributeValueInsideDoubleQuotes(as) + '"][href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"]', key = preloadSelector;
      switch (as) {
        case "audioworklet":
        case "paintworklet":
        case "serviceworker":
        case "sharedworker":
        case "worker":
        case "script":
          key = getScriptKey(href);
      }
      if (!preloadPropsMap.has(key) && (href = assign({ rel: "modulepreload", href }, options2), preloadPropsMap.set(key, href), ownerDocument.querySelector(preloadSelector) === null)) {
        switch (as) {
          case "audioworklet":
          case "paintworklet":
          case "serviceworker":
          case "sharedworker":
          case "worker":
          case "script":
            if (ownerDocument.querySelector(getScriptSelectorFromKey(key)))
              return;
        }
        as = ownerDocument.createElement("link");
        setInitialProperties(as, "link", href);
        markNodeAsHoistable(as);
        ownerDocument.head.appendChild(as);
      }
    }
  }
  function preinitStyle(href, precedence, options2) {
    previousDispatcher.S(href, precedence, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && href) {
      var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
      precedence = precedence || "default";
      var resource = styles.get(key);
      if (!resource) {
        var state = { loading: 0, preload: null };
        if (resource = ownerDocument.querySelector(getStylesheetSelectorFromKey(key)))
          state.loading = 5;
        else {
          href = assign({ rel: "stylesheet", href, "data-precedence": precedence }, options2);
          (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options2);
          var link = resource = ownerDocument.createElement("link");
          markNodeAsHoistable(link);
          setInitialProperties(link, "link", href);
          link._p = new Promise(function(resolve, reject) {
            link.onload = resolve;
            link.onerror = reject;
          });
          link.addEventListener("load", function() {
            state.loading |= 1;
          });
          link.addEventListener("error", function() {
            state.loading |= 2;
          });
          state.loading |= 4;
          insertStylesheet(resource, precedence, ownerDocument);
        }
        resource = {
          type: "stylesheet",
          instance: resource,
          count: 1,
          state
        };
        styles.set(key, resource);
      }
    }
  }
  function preinitScript(src, options2) {
    previousDispatcher.X(src, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && src) {
      var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
      resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }, scripts.set(key, resource));
    }
  }
  function preinitModuleScript(src, options2) {
    previousDispatcher.M(src, options2);
    var ownerDocument = globalDocument;
    if (ownerDocument && src) {
      var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
      resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({ src, async: true, type: "module" }, options2), (options2 = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options2), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
        type: "script",
        instance: resource,
        count: 1,
        state: null
      }, scripts.set(key, resource));
    }
  }
  function getResource(type, currentProps, pendingProps, currentResource) {
    var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
    if (!JSCompiler_inline_result)
      throw Error(formatProdErrorMessage(446));
    switch (type) {
      case "meta":
      case "title":
        return null;
      case "style":
        return typeof pendingProps.precedence === "string" && typeof pendingProps.href === "string" ? (currentProps = getStyleKey(pendingProps.href), pendingProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
          type: "style",
          instance: null,
          count: 0,
          state: null
        }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
      case "link":
        if (pendingProps.rel === "stylesheet" && typeof pendingProps.href === "string" && typeof pendingProps.precedence === "string") {
          type = getStyleKey(pendingProps.href);
          var styles$244 = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, resource$245 = styles$244.get(type);
          resource$245 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$245 = {
            type: "stylesheet",
            instance: null,
            count: 0,
            state: { loading: 0, preload: null }
          }, styles$244.set(type, resource$245), (styles$244 = JSCompiler_inline_result.querySelector(getStylesheetSelectorFromKey(type))) && !styles$244._p && (resource$245.instance = styles$244, resource$245.state.loading = 5), preloadPropsMap.has(type) || (pendingProps = {
            rel: "preload",
            as: "style",
            href: pendingProps.href,
            crossOrigin: pendingProps.crossOrigin,
            integrity: pendingProps.integrity,
            media: pendingProps.media,
            hrefLang: pendingProps.hrefLang,
            referrerPolicy: pendingProps.referrerPolicy
          }, preloadPropsMap.set(type, pendingProps), styles$244 || preloadStylesheet(JSCompiler_inline_result, type, pendingProps, resource$245.state)));
          if (currentProps && currentResource === null)
            throw Error(formatProdErrorMessage(528, ""));
          return resource$245;
        }
        if (currentProps && currentResource !== null)
          throw Error(formatProdErrorMessage(529, ""));
        return null;
      case "script":
        return currentProps = pendingProps.async, pendingProps = pendingProps.src, typeof pendingProps === "string" && currentProps && typeof currentProps !== "function" && typeof currentProps !== "symbol" ? (currentProps = getScriptKey(pendingProps), pendingProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableScripts, currentResource = pendingProps.get(currentProps), currentResource || (currentResource = {
          type: "script",
          instance: null,
          count: 0,
          state: null
        }, pendingProps.set(currentProps, currentResource)), currentResource) : { type: "void", instance: null, count: 0, state: null };
      default:
        throw Error(formatProdErrorMessage(444, type));
    }
  }
  function getStyleKey(href) {
    return 'href="' + escapeSelectorAttributeValueInsideDoubleQuotes(href) + '"';
  }
  function getStylesheetSelectorFromKey(key) {
    return 'link[rel="stylesheet"][' + key + "]";
  }
  function stylesheetPropsFromRawProps(rawProps) {
    return assign({}, rawProps, {
      "data-precedence": rawProps.precedence,
      precedence: null
    });
  }
  function preloadStylesheet(ownerDocument, key, preloadProps, state) {
    ownerDocument.querySelector('link[rel="preload"][as="style"][' + key + "]") ? state.loading = 1 : (key = ownerDocument.createElement("link"), state.preload = key, key.addEventListener("load", function() {
      return state.loading |= 1;
    }), key.addEventListener("error", function() {
      return state.loading |= 2;
    }), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key));
  }
  function getScriptKey(src) {
    return '[src="' + escapeSelectorAttributeValueInsideDoubleQuotes(src) + '"]';
  }
  function getScriptSelectorFromKey(key) {
    return "script[async]" + key;
  }
  function acquireResource(hoistableRoot, resource, props) {
    resource.count++;
    if (resource.instance === null)
      switch (resource.type) {
        case "style":
          var instance = hoistableRoot.querySelector('style[data-href~="' + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + '"]');
          if (instance)
            return resource.instance = instance, markNodeAsHoistable(instance), instance;
          var styleProps = assign({}, props, {
            "data-href": props.href,
            "data-precedence": props.precedence,
            href: null,
            precedence: null
          });
          instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement("style");
          markNodeAsHoistable(instance);
          setInitialProperties(instance, "style", styleProps);
          insertStylesheet(instance, props.precedence, hoistableRoot);
          return resource.instance = instance;
        case "stylesheet":
          styleProps = getStyleKey(props.href);
          var instance$250 = hoistableRoot.querySelector(getStylesheetSelectorFromKey(styleProps));
          if (instance$250)
            return resource.state.loading |= 4, resource.instance = instance$250, markNodeAsHoistable(instance$250), instance$250;
          instance = stylesheetPropsFromRawProps(props);
          (styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
          instance$250 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
          markNodeAsHoistable(instance$250);
          var linkInstance = instance$250;
          linkInstance._p = new Promise(function(resolve, reject) {
            linkInstance.onload = resolve;
            linkInstance.onerror = reject;
          });
          setInitialProperties(instance$250, "link", instance);
          resource.state.loading |= 4;
          insertStylesheet(instance$250, props.precedence, hoistableRoot);
          return resource.instance = instance$250;
        case "script":
          instance$250 = getScriptKey(props.src);
          if (styleProps = hoistableRoot.querySelector(getScriptSelectorFromKey(instance$250)))
            return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
          instance = props;
          if (styleProps = preloadPropsMap.get(instance$250))
            instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
          hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
          styleProps = hoistableRoot.createElement("script");
          markNodeAsHoistable(styleProps);
          setInitialProperties(styleProps, "link", instance);
          hoistableRoot.head.appendChild(styleProps);
          return resource.instance = styleProps;
        case "void":
          return null;
        default:
          throw Error(formatProdErrorMessage(443, resource.type));
      }
    else
      resource.type === "stylesheet" && (resource.state.loading & 4) === 0 && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
    return resource.instance;
  }
  function insertStylesheet(instance, precedence, root2) {
    for (var nodes = root2.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0;i < nodes.length; i++) {
      var node = nodes[i];
      if (node.dataset.precedence === precedence)
        prior = node;
      else if (prior !== last)
        break;
    }
    prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = root2.nodeType === 9 ? root2.head : root2, precedence.insertBefore(instance, precedence.firstChild));
  }
  function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
    stylesheetProps.crossOrigin == null && (stylesheetProps.crossOrigin = preloadProps.crossOrigin);
    stylesheetProps.referrerPolicy == null && (stylesheetProps.referrerPolicy = preloadProps.referrerPolicy);
    stylesheetProps.title == null && (stylesheetProps.title = preloadProps.title);
  }
  function adoptPreloadPropsForScript(scriptProps, preloadProps) {
    scriptProps.crossOrigin == null && (scriptProps.crossOrigin = preloadProps.crossOrigin);
    scriptProps.referrerPolicy == null && (scriptProps.referrerPolicy = preloadProps.referrerPolicy);
    scriptProps.integrity == null && (scriptProps.integrity = preloadProps.integrity);
  }
  var tagCaches = null;
  function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
    if (tagCaches === null) {
      var cache = new Map;
      var caches = tagCaches = new Map;
      caches.set(ownerDocument, cache);
    } else
      caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = new Map, caches.set(ownerDocument, cache));
    if (cache.has(type))
      return cache;
    cache.set(type, null);
    ownerDocument = ownerDocument.getElementsByTagName(type);
    for (caches = 0;caches < ownerDocument.length; caches++) {
      var node = ownerDocument[caches];
      if (!(node[internalHoistableMarker] || node[internalInstanceKey] || type === "link" && node.getAttribute("rel") === "stylesheet") && node.namespaceURI !== "http://www.w3.org/2000/svg") {
        var nodeKey = node.getAttribute(keyAttribute) || "";
        nodeKey = type + nodeKey;
        var existing = cache.get(nodeKey);
        existing ? existing.push(node) : cache.set(nodeKey, [node]);
      }
    }
    return cache;
  }
  function mountHoistable(hoistableRoot, type, instance) {
    hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
    hoistableRoot.head.insertBefore(instance, type === "title" ? hoistableRoot.querySelector("head > title") : null);
  }
  function isHostHoistableType(type, props, hostContext) {
    if (hostContext === 1 || props.itemProp != null)
      return false;
    switch (type) {
      case "meta":
      case "title":
        return true;
      case "style":
        if (typeof props.precedence !== "string" || typeof props.href !== "string" || props.href === "")
          break;
        return true;
      case "link":
        if (typeof props.rel !== "string" || typeof props.href !== "string" || props.href === "" || props.onLoad || props.onError)
          break;
        switch (props.rel) {
          case "stylesheet":
            return type = props.disabled, typeof props.precedence === "string" && type == null;
          default:
            return true;
        }
      case "script":
        if (props.async && typeof props.async !== "function" && typeof props.async !== "symbol" && !props.onLoad && !props.onError && props.src && typeof props.src === "string")
          return true;
    }
    return false;
  }
  function preloadResource(resource) {
    return resource.type === "stylesheet" && (resource.state.loading & 3) === 0 ? false : true;
  }
  var suspendedState = null;
  function noop() {}
  function suspendResource(hoistableRoot, resource, props) {
    if (suspendedState === null)
      throw Error(formatProdErrorMessage(475));
    var state = suspendedState;
    if (resource.type === "stylesheet" && (typeof props.media !== "string" || matchMedia(props.media).matches !== false) && (resource.state.loading & 4) === 0) {
      if (resource.instance === null) {
        var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(getStylesheetSelectorFromKey(key));
        if (instance) {
          hoistableRoot = instance._p;
          hoistableRoot !== null && typeof hoistableRoot === "object" && typeof hoistableRoot.then === "function" && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
          resource.state.loading |= 4;
          resource.instance = instance;
          markNodeAsHoistable(instance);
          return;
        }
        instance = hoistableRoot.ownerDocument || hoistableRoot;
        props = stylesheetPropsFromRawProps(props);
        (key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
        instance = instance.createElement("link");
        markNodeAsHoistable(instance);
        var linkInstance = instance;
        linkInstance._p = new Promise(function(resolve, reject) {
          linkInstance.onload = resolve;
          linkInstance.onerror = reject;
        });
        setInitialProperties(instance, "link", props);
        resource.instance = instance;
      }
      state.stylesheets === null && (state.stylesheets = new Map);
      state.stylesheets.set(resource, hoistableRoot);
      (hoistableRoot = resource.state.preload) && (resource.state.loading & 3) === 0 && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
    }
  }
  function waitForCommitToBeReady() {
    if (suspendedState === null)
      throw Error(formatProdErrorMessage(475));
    var state = suspendedState;
    state.stylesheets && state.count === 0 && insertSuspendedStylesheets(state, state.stylesheets);
    return 0 < state.count ? function(commit) {
      var stylesheetTimer = setTimeout(function() {
        state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
        if (state.unsuspend) {
          var unsuspend = state.unsuspend;
          state.unsuspend = null;
          unsuspend();
        }
      }, 60000);
      state.unsuspend = commit;
      return function() {
        state.unsuspend = null;
        clearTimeout(stylesheetTimer);
      };
    } : null;
  }
  function onUnsuspend() {
    this.count--;
    if (this.count === 0) {
      if (this.stylesheets)
        insertSuspendedStylesheets(this, this.stylesheets);
      else if (this.unsuspend) {
        var unsuspend = this.unsuspend;
        this.unsuspend = null;
        unsuspend();
      }
    }
  }
  var precedencesByRoot = null;
  function insertSuspendedStylesheets(state, resources) {
    state.stylesheets = null;
    state.unsuspend !== null && (state.count++, precedencesByRoot = new Map, resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
  }
  function insertStylesheetIntoRoot(root2, resource) {
    if (!(resource.state.loading & 4)) {
      var precedences = precedencesByRoot.get(root2);
      if (precedences)
        var last = precedences.get(null);
      else {
        precedences = new Map;
        precedencesByRoot.set(root2, precedences);
        for (var nodes = root2.querySelectorAll("link[data-precedence],style[data-precedence]"), i = 0;i < nodes.length; i++) {
          var node = nodes[i];
          if (node.nodeName === "LINK" || node.getAttribute("media") !== "not all")
            precedences.set(node.dataset.precedence, node), last = node;
        }
        last && precedences.set(null, last);
      }
      nodes = resource.instance;
      node = nodes.getAttribute("data-precedence");
      i = precedences.get(node) || last;
      i === last && precedences.set(null, nodes);
      precedences.set(node, nodes);
      this.count++;
      last = onUnsuspend.bind(this);
      nodes.addEventListener("load", last);
      nodes.addEventListener("error", last);
      i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root2 = root2.nodeType === 9 ? root2.head : root2, root2.insertBefore(nodes, root2.firstChild));
      resource.state.loading |= 4;
    }
  }
  var HostTransitionContext = {
    $$typeof: REACT_CONTEXT_TYPE,
    Provider: null,
    Consumer: null,
    _currentValue: sharedNotPendingObject,
    _currentValue2: sharedNotPendingObject,
    _threadCount: 0
  };
  function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, formState) {
    this.tag = 1;
    this.containerInfo = containerInfo;
    this.pingCache = this.current = this.pendingChildren = null;
    this.timeoutHandle = -1;
    this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
    this.callbackPriority = 0;
    this.expirationTimes = createLaneMap(-1);
    this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
    this.entanglements = createLaneMap(0);
    this.hiddenUpdates = createLaneMap(null);
    this.identifierPrefix = identifierPrefix;
    this.onUncaughtError = onUncaughtError;
    this.onCaughtError = onCaughtError;
    this.onRecoverableError = onRecoverableError;
    this.pooledCache = null;
    this.pooledCacheLanes = 0;
    this.formState = formState;
    this.incompleteTransitions = new Map;
  }
  function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, transitionCallbacks, formState) {
    containerInfo = new FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, formState);
    tag = 1;
    isStrictMode === true && (tag |= 24);
    isStrictMode = createFiberImplClass(3, null, null, tag);
    containerInfo.current = isStrictMode;
    isStrictMode.stateNode = containerInfo;
    tag = createCache();
    tag.refCount++;
    containerInfo.pooledCache = tag;
    tag.refCount++;
    isStrictMode.memoizedState = {
      element: initialChildren,
      isDehydrated: hydrate,
      cache: tag
    };
    initializeUpdateQueue(isStrictMode);
    return containerInfo;
  }
  function getContextForSubtree(parentComponent) {
    if (!parentComponent)
      return emptyContextObject;
    parentComponent = emptyContextObject;
    return parentComponent;
  }
  function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
    parentComponent = getContextForSubtree(parentComponent);
    container.context === null ? container.context = parentComponent : container.pendingContext = parentComponent;
    container = createUpdate(lane);
    container.payload = { element };
    callback = callback === undefined ? null : callback;
    callback !== null && (container.callback = callback);
    element = enqueueUpdate(rootFiber, container, lane);
    element !== null && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
  }
  function markRetryLaneImpl(fiber, retryLane) {
    fiber = fiber.memoizedState;
    if (fiber !== null && fiber.dehydrated !== null) {
      var a = fiber.retryLane;
      fiber.retryLane = a !== 0 && a < retryLane ? a : retryLane;
    }
  }
  function markRetryLaneIfNotHydrated(fiber, retryLane) {
    markRetryLaneImpl(fiber, retryLane);
    (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
  }
  function attemptContinuousHydration(fiber) {
    if (fiber.tag === 13) {
      var root2 = enqueueConcurrentRenderForLane(fiber, 67108864);
      root2 !== null && scheduleUpdateOnFiber(root2, fiber, 67108864);
      markRetryLaneIfNotHydrated(fiber, 67108864);
    }
  }
  var _enabled = true;
  function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var prevTransition = ReactSharedInternals.T;
    ReactSharedInternals.T = null;
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    var prevTransition = ReactSharedInternals.T;
    ReactSharedInternals.T = null;
    var previousPriority = ReactDOMSharedInternals.p;
    try {
      ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    } finally {
      ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
    }
  }
  function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (_enabled) {
      var blockedOn = findInstanceBlockingEvent(nativeEvent);
      if (blockedOn === null)
        dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer), clearIfContinuousEvent(domEventName, nativeEvent);
      else if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent))
        nativeEvent.stopPropagation();
      else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
        for (;blockedOn !== null; ) {
          var fiber = getInstanceFromNode(blockedOn);
          if (fiber !== null)
            switch (fiber.tag) {
              case 3:
                fiber = fiber.stateNode;
                if (fiber.current.memoizedState.isDehydrated) {
                  var lanes = getHighestPriorityLanes(fiber.pendingLanes);
                  if (lanes !== 0) {
                    var root2 = fiber;
                    root2.pendingLanes |= 2;
                    for (root2.entangledLanes |= 2;lanes; ) {
                      var lane = 1 << 31 - clz32(lanes);
                      root2.entanglements[1] |= lane;
                      lanes &= ~lane;
                    }
                    ensureRootIsScheduled(fiber);
                    (executionContext & 6) === 0 && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, false));
                  }
                }
                break;
              case 13:
                root2 = enqueueConcurrentRenderForLane(fiber, 2), root2 !== null && scheduleUpdateOnFiber(root2, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
            }
          fiber = findInstanceBlockingEvent(nativeEvent);
          fiber === null && dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
          if (fiber === blockedOn)
            break;
          blockedOn = fiber;
        }
        blockedOn !== null && nativeEvent.stopPropagation();
      } else
        dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
    }
  }
  function findInstanceBlockingEvent(nativeEvent) {
    nativeEvent = getEventTarget(nativeEvent);
    return findInstanceBlockingTarget(nativeEvent);
  }
  var return_targetInst = null;
  function findInstanceBlockingTarget(targetNode) {
    return_targetInst = null;
    targetNode = getClosestInstanceFromNode(targetNode);
    if (targetNode !== null) {
      var nearestMounted = getNearestMountedFiber(targetNode);
      if (nearestMounted === null)
        targetNode = null;
      else {
        var tag = nearestMounted.tag;
        if (tag === 13) {
          targetNode = getSuspenseInstanceFromFiber(nearestMounted);
          if (targetNode !== null)
            return targetNode;
          targetNode = null;
        } else if (tag === 3) {
          if (nearestMounted.stateNode.current.memoizedState.isDehydrated)
            return nearestMounted.tag === 3 ? nearestMounted.stateNode.containerInfo : null;
          targetNode = null;
        } else
          nearestMounted !== targetNode && (targetNode = null);
      }
    }
    return_targetInst = targetNode;
    return null;
  }
  function getEventPriority(domEventName) {
    switch (domEventName) {
      case "beforetoggle":
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "toggle":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 2;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 8;
      case "message":
        switch (getCurrentPriorityLevel()) {
          case ImmediatePriority:
            return 2;
          case UserBlockingPriority:
            return 8;
          case NormalPriority$1:
          case LowPriority:
            return 32;
          case IdlePriority:
            return 268435456;
          default:
            return 32;
        }
      default:
        return 32;
    }
  }
  var hasScheduledReplayAttempt = false;
  var queuedFocus = null;
  var queuedDrag = null;
  var queuedMouse = null;
  var queuedPointers = new Map;
  var queuedPointerCaptures = new Map;
  var queuedExplicitHydrationTargets = [];
  var discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
  function clearIfContinuousEvent(domEventName, nativeEvent) {
    switch (domEventName) {
      case "focusin":
      case "focusout":
        queuedFocus = null;
        break;
      case "dragenter":
      case "dragleave":
        queuedDrag = null;
        break;
      case "mouseover":
      case "mouseout":
        queuedMouse = null;
        break;
      case "pointerover":
      case "pointerout":
        queuedPointers.delete(nativeEvent.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        queuedPointerCaptures.delete(nativeEvent.pointerId);
    }
  }
  function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    if (existingQueuedEvent === null || existingQueuedEvent.nativeEvent !== nativeEvent)
      return existingQueuedEvent = {
        blockedOn,
        domEventName,
        eventSystemFlags,
        nativeEvent,
        targetContainers: [targetContainer]
      }, blockedOn !== null && (blockedOn = getInstanceFromNode(blockedOn), blockedOn !== null && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
    existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
    blockedOn = existingQueuedEvent.targetContainers;
    targetContainer !== null && blockedOn.indexOf(targetContainer) === -1 && blockedOn.push(targetContainer);
    return existingQueuedEvent;
  }
  function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    switch (domEventName) {
      case "focusin":
        return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), true;
      case "dragenter":
        return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), true;
      case "mouseover":
        return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), true;
      case "pointerover":
        var pointerId = nativeEvent.pointerId;
        queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent));
        return true;
      case "gotpointercapture":
        return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)), true;
    }
    return false;
  }
  function attemptExplicitHydrationTarget(queuedTarget) {
    var targetInst = getClosestInstanceFromNode(queuedTarget.target);
    if (targetInst !== null) {
      var nearestMounted = getNearestMountedFiber(targetInst);
      if (nearestMounted !== null) {
        if (targetInst = nearestMounted.tag, targetInst === 13) {
          if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), targetInst !== null) {
            queuedTarget.blockedOn = targetInst;
            runWithPriority(queuedTarget.priority, function() {
              if (nearestMounted.tag === 13) {
                var lane = requestUpdateLane();
                lane = getBumpedLaneForHydrationByLane(lane);
                var root2 = enqueueConcurrentRenderForLane(nearestMounted, lane);
                root2 !== null && scheduleUpdateOnFiber(root2, nearestMounted, lane);
                markRetryLaneIfNotHydrated(nearestMounted, lane);
              }
            });
            return;
          }
        } else if (targetInst === 3 && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
          queuedTarget.blockedOn = nearestMounted.tag === 3 ? nearestMounted.stateNode.containerInfo : null;
          return;
        }
      }
    }
    queuedTarget.blockedOn = null;
  }
  function attemptReplayContinuousQueuedEvent(queuedEvent) {
    if (queuedEvent.blockedOn !== null)
      return false;
    for (var targetContainers = queuedEvent.targetContainers;0 < targetContainers.length; ) {
      var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
      if (nextBlockedOn === null) {
        nextBlockedOn = queuedEvent.nativeEvent;
        var nativeEventClone = new nextBlockedOn.constructor(nextBlockedOn.type, nextBlockedOn);
        currentReplayingEvent = nativeEventClone;
        nextBlockedOn.target.dispatchEvent(nativeEventClone);
        currentReplayingEvent = null;
      } else
        return targetContainers = getInstanceFromNode(nextBlockedOn), targetContainers !== null && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, false;
      targetContainers.shift();
    }
    return true;
  }
  function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
    attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
  }
  function replayUnblockedEvents() {
    hasScheduledReplayAttempt = false;
    queuedFocus !== null && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
    queuedDrag !== null && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
    queuedMouse !== null && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
    queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
    queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
  }
  function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
    queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = true, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents)));
  }
  var lastScheduledReplayQueue = null;
  function scheduleReplayQueueIfNeeded(formReplayingQueue) {
    lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, function() {
      lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
      for (var i = 0;i < formReplayingQueue.length; i += 3) {
        var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
        if (typeof submitterOrAction !== "function")
          if (findInstanceBlockingTarget(submitterOrAction || form) === null)
            continue;
          else
            break;
        var formInst = getInstanceFromNode(form);
        formInst !== null && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(formInst, {
          pending: true,
          data: formData,
          method: form.method,
          action: submitterOrAction
        }, submitterOrAction, formData));
      }
    }));
  }
  function retryIfBlockedOn(unblocked) {
    function unblock(queuedEvent) {
      return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
    }
    queuedFocus !== null && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
    queuedDrag !== null && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
    queuedMouse !== null && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
    queuedPointers.forEach(unblock);
    queuedPointerCaptures.forEach(unblock);
    for (var i = 0;i < queuedExplicitHydrationTargets.length; i++) {
      var queuedTarget = queuedExplicitHydrationTargets[i];
      queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
    }
    for (;0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], i.blockedOn === null); )
      attemptExplicitHydrationTarget(i), i.blockedOn === null && queuedExplicitHydrationTargets.shift();
    i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
    if (i != null)
      for (queuedTarget = 0;queuedTarget < i.length; queuedTarget += 3) {
        var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
        if (typeof submitterOrAction === "function")
          formProps || scheduleReplayQueueIfNeeded(i);
        else if (formProps) {
          var action = null;
          if (submitterOrAction && submitterOrAction.hasAttribute("formAction"))
            if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null)
              action = formProps.formAction;
            else {
              if (findInstanceBlockingTarget(form) !== null)
                continue;
            }
          else
            action = formProps.action;
          typeof action === "function" ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
          scheduleReplayQueueIfNeeded(i);
        }
      }
  }
  function ReactDOMRoot(internalRoot) {
    this._internalRoot = internalRoot;
  }
  ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
    var root2 = this._internalRoot;
    if (root2 === null)
      throw Error(formatProdErrorMessage(409));
    var current = root2.current, lane = requestUpdateLane();
    updateContainerImpl(current, lane, children, root2, null, null);
  };
  ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
    var root2 = this._internalRoot;
    if (root2 !== null) {
      this._internalRoot = null;
      var container = root2.containerInfo;
      updateContainerImpl(root2.current, 2, null, root2, null, null);
      flushSyncWork$1();
      container[internalContainerInstanceKey] = null;
    }
  };
  function ReactDOMHydrationRoot(internalRoot) {
    this._internalRoot = internalRoot;
  }
  ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
    if (target) {
      var updatePriority = resolveUpdatePriority();
      target = { blockedOn: null, target, priority: updatePriority };
      for (var i = 0;i < queuedExplicitHydrationTargets.length && updatePriority !== 0 && updatePriority < queuedExplicitHydrationTargets[i].priority; i++)
        ;
      queuedExplicitHydrationTargets.splice(i, 0, target);
      i === 0 && attemptExplicitHydrationTarget(target);
    }
  };
  var isomorphicReactPackageVersion$jscomp$inline_1785 = React.version;
  if (isomorphicReactPackageVersion$jscomp$inline_1785 !== "19.1.1")
    throw Error(formatProdErrorMessage(527, isomorphicReactPackageVersion$jscomp$inline_1785, "19.1.1"));
  ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
    var fiber = componentOrElement._reactInternals;
    if (fiber === undefined) {
      if (typeof componentOrElement.render === "function")
        throw Error(formatProdErrorMessage(188));
      componentOrElement = Object.keys(componentOrElement).join(",");
      throw Error(formatProdErrorMessage(268, componentOrElement));
    }
    componentOrElement = findCurrentFiberUsingSlowPath(fiber);
    componentOrElement = componentOrElement !== null ? findCurrentHostFiberImpl(componentOrElement) : null;
    componentOrElement = componentOrElement === null ? null : componentOrElement.stateNode;
    return componentOrElement;
  };
  var internals$jscomp$inline_2256 = {
    bundleType: 0,
    version: "19.1.1",
    rendererPackageName: "react-dom",
    currentDispatcherRef: ReactSharedInternals,
    reconcilerVersion: "19.1.1"
  };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined") {
    hook$jscomp$inline_2257 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook$jscomp$inline_2257.isDisabled && hook$jscomp$inline_2257.supportsFiber)
      try {
        rendererID = hook$jscomp$inline_2257.inject(internals$jscomp$inline_2256), injectedHook = hook$jscomp$inline_2257;
      } catch (err) {}
  }
  var hook$jscomp$inline_2257;
  exports.createRoot = function(container, options2) {
    if (!isValidContainer(container))
      throw Error(formatProdErrorMessage(299));
    var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, transitionCallbacks = null;
    options2 !== null && options2 !== undefined && (options2.unstable_strictMode === true && (isStrictMode = true), options2.identifierPrefix !== undefined && (identifierPrefix = options2.identifierPrefix), options2.onUncaughtError !== undefined && (onUncaughtError = options2.onUncaughtError), options2.onCaughtError !== undefined && (onCaughtError = options2.onCaughtError), options2.onRecoverableError !== undefined && (onRecoverableError = options2.onRecoverableError), options2.unstable_transitionCallbacks !== undefined && (transitionCallbacks = options2.unstable_transitionCallbacks));
    options2 = createFiberRoot(container, 1, false, null, null, isStrictMode, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, transitionCallbacks, null);
    container[internalContainerInstanceKey] = options2.current;
    listenToAllSupportedEvents(container);
    return new ReactDOMRoot(options2);
  };
  exports.hydrateRoot = function(container, initialChildren, options2) {
    if (!isValidContainer(container))
      throw Error(formatProdErrorMessage(299));
    var isStrictMode = false, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError, transitionCallbacks = null, formState = null;
    options2 !== null && options2 !== undefined && (options2.unstable_strictMode === true && (isStrictMode = true), options2.identifierPrefix !== undefined && (identifierPrefix = options2.identifierPrefix), options2.onUncaughtError !== undefined && (onUncaughtError = options2.onUncaughtError), options2.onCaughtError !== undefined && (onCaughtError = options2.onCaughtError), options2.onRecoverableError !== undefined && (onRecoverableError = options2.onRecoverableError), options2.unstable_transitionCallbacks !== undefined && (transitionCallbacks = options2.unstable_transitionCallbacks), options2.formState !== undefined && (formState = options2.formState));
    initialChildren = createFiberRoot(container, 1, true, initialChildren, options2 != null ? options2 : null, isStrictMode, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, transitionCallbacks, formState);
    initialChildren.context = getContextForSubtree(null);
    options2 = initialChildren.current;
    isStrictMode = requestUpdateLane();
    isStrictMode = getBumpedLaneForHydrationByLane(isStrictMode);
    identifierPrefix = createUpdate(isStrictMode);
    identifierPrefix.callback = null;
    enqueueUpdate(options2, identifierPrefix, isStrictMode);
    options2 = isStrictMode;
    initialChildren.current.lanes = options2;
    markRootUpdated$1(initialChildren, options2);
    ensureRootIsScheduled(initialChildren);
    container[internalContainerInstanceKey] = initialChildren.current;
    listenToAllSupportedEvents(container);
    return new ReactDOMHydrationRoot(initialChildren);
  };
  exports.version = "19.1.1";
});

// node_modules/react-dom/client.js
var require_client = __commonJS((exports, module) => {
  function checkDCE() {
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
      return;
    }
    if (false) {}
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
    } catch (err) {
      console.error(err);
    }
  }
  if (true) {
    checkDCE();
    module.exports = require_react_dom_client_production();
  } else {}
});

// node_modules/react/cjs/react-jsx-runtime.production.js
var require_react_jsx_runtime_production = __commonJS((exports) => {
  var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
  var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
  function jsxProd(type, config, maybeKey) {
    var key = null;
    maybeKey !== undefined && (key = "" + maybeKey);
    config.key !== undefined && (key = "" + config.key);
    if ("key" in config) {
      maybeKey = {};
      for (var propName in config)
        propName !== "key" && (maybeKey[propName] = config[propName]);
    } else
      maybeKey = config;
    config = maybeKey.ref;
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type,
      key,
      ref: config !== undefined ? config : null,
      props: maybeKey
    };
  }
  exports.Fragment = REACT_FRAGMENT_TYPE;
  exports.jsx = jsxProd;
  exports.jsxs = jsxProd;
});

// node_modules/react/jsx-runtime.js
var require_jsx_runtime = __commonJS((exports, module) => {
  if (true) {
    module.exports = require_react_jsx_runtime_production();
  } else {}
});

// src/frontend.tsx
var import_client = __toESM(require_client(), 1);

// src/App.tsx
var import_react = __toESM(require_react(), 1);

// src/logo.png
var logo_default = "./logo-251ev98e.png";

// src/assets/artwork/AlanTuring.jpg
var AlanTuring_default = "./AlanTuring-bxsxjeqr.jpg";

// src/assets/artwork/apj-abdul-kalam-15.jpg
var apj_abdul_kalam_15_default = "./apj-abdul-kalam-15-eaqtfh4r.jpg";

// src/assets/artwork/Arijit Singh.jpg
var Arijit_Singh_default = "./Arijit Singh-gt40wndh.jpg";

// src/assets/artwork/ARMAAN MALIK.jpg
var ARMAAN_MALIK_default = "./ARMAAN MALIK-nc21nswh.jpg";

// src/assets/artwork/boy-indian-national-flag-green-grass-43060893.jpg
var boy_indian_national_flag_green_grass_43060893_default = "./boy-indian-national-flag-green-grass-43060893-v698486f.jpg";

// src/assets/artwork/clg.jpg
var clg_default = "./clg-s2yyg000.jpg";

// src/assets/artwork/Darshan.jpg
var Darshan_default = "./Darshan-hbrsfvw8.jpg";

// src/assets/artwork/DHONI.jpg
var DHONI_default = "./DHONI-j6ptcxn4.jpg";

// src/assets/artwork/GOPAL.png
var GOPAL_default = "./GOPAL-jrgrw8wa.png";

// src/assets/artwork/hanumanji.jpg
var hanumanji_default = "./hanumanji-kna61q3k.jpg";

// src/assets/artwork/johan-cruyff-footballer-coach-14-august-1994-HN8YNYjpg.jpg
var johan_cruyff_footballer_coach_14_august_1994_HN8YNYjpg_default = "./johan-cruyff-footballer-coach-14-august-1994-HN8YNYjpg-wm9dpynx.jpg";

// src/assets/artwork/MAA DURGA.jpg
var MAA_DURGA_default = "./MAA DURGA-hvvefgwk.jpg";

// src/assets/artwork/Maa Jagadhatri.jpg
var Maa_Jagadhatri_default = "./Maa Jagadhatri-hbvwe5fx.jpg";

// src/assets/artwork/MAA KALI.jpeg
var MAA_KALI_default = "./MAA KALI-5j33phkz.jpeg";

// src/assets/artwork/MAA KALI.png
var MAA_KALI_default2 = "./MAA KALI-9aq9yk8v.png";

// src/assets/artwork/MAA SARADA.jpg
var MAA_SARADA_default = "./MAA SARADA-crv2z64v.jpg";

// src/assets/artwork/Maaa.jpg
var Maaa_default = "./Maaa-ar84xgmq.jpg";

// src/assets/artwork/maaDurga.jpg
var maaDurga_default = "./maaDurga-ac2xvww5.jpg";

// src/assets/artwork/maaKali.jpg
var maaKali_default = "./maaKali-brx3a5yj.jpg";

// src/assets/artwork/MAHADEV.png
var MAHADEV_default = "./MAHADEV-y3g97pw9.png";

// src/assets/artwork/messi.jpg
var messi_default = "./messi-1a30rw8s.jpg";

// src/assets/artwork/NETAJI.jpg
var NETAJI_default = "./NETAJI-hp0m71pk.jpg";

// src/assets/artwork/NetajiD.jpg
var NetajiD_default = "./NetajiD-5c0n3r0w.jpg";

// src/assets/artwork/Pranab Mukherjee.jpg
var Pranab_Mukherjee_default = "./Pranab Mukherjee-2kcbgzjm.jpg";

// src/assets/artwork/Rabi Tthakur.jpg
var Rabi_Tthakur_default = "./Rabi Tthakur-epp932yz.jpg";

// src/assets/artwork/rohit sharma.jpg
var rohit_sharma_default = "./rohit sharma-tt22et4f.jpg";

// src/assets/artwork/Ronaldo.jpg
var Ronaldo_default = "./Ronaldo-kpn19wvq.jpg";

// src/assets/artwork/RupamIslam.jpg
var RupamIslam_default = "./RupamIslam-xqm3km68.jpg";

// src/assets/artwork/sanampuri-ms-paint portrait.jpg
var sanampuri_ms_paint_portrait_default = "./sanampuri-ms-paint portrait-gkf3gvqa.jpg";

// src/assets/artwork/Satyajit Ray.jpg
var Satyajit_Ray_default = "./Satyajit Ray-w2vw4dv2.jpg";

// src/assets/artwork/Sharodiya.jpg
var Sharodiya_default = "./Sharodiya-tpfz478t.jpg";

// src/assets/artwork/Soumitra Chatterjee.jpg
var Soumitra_Chatterjee_default = "./Soumitra Chatterjee-1s3frme1.jpg";

// src/assets/artwork/Sourav Ganguly.jpg
var Sourav_Ganguly_default = "./Sourav Ganguly-mbppbkft.jpg";

// src/assets/artwork/SSR.jpg
var SSR_default = "./SSR-jjhfs60v.jpg";

// src/assets/artwork/SUMEDH.jpg
var SUMEDH_default = "./SUMEDH-2pj2ewpq.jpg";

// src/assets/artwork/swami vivekanand standing hd photo (2).jpg
var swami_vivekanand_standing_hd_photo_2__default = "./swami vivekanand standing hd photo (2)-qtcgg40q.jpg";

// src/assets/artwork/Vidyasagar.jpg
var Vidyasagar_default = "./Vidyasagar-gggxtep7.jpg";

// src/assets/artwork/ViratKohli.jpg
var ViratKohli_default = "./ViratKohli-nmg8jrvg.jpg";

// src/App.tsx
var jsx_runtime = __toESM(require_jsx_runtime(), 1);
var AnimatedBackground = () => {
  const [particles, setParticles] = import_react.useState([]);
  const [auroraParticles, setAuroraParticles] = import_react.useState([]);
  const codeSnippets = [
    "const developer = 'awesome';",
    "function createMagic() {",
    "  return innovation;",
    "}",
    "npm install success",
    "git commit -m 'dreams'",
    "while(coding) { learn(); }",
    "export default creativity;",
    "async await future() {",
    "console.log('Hello World!');",
    "import React from 'react';",
    "useState('motivated');",
    "useEffect(() => {inspire()});",
    "const skills = ['JS', 'React'];",
    "return <Amazing />;"
  ];
  const matrixChars = ["0010", "1010", "0101", "010101", "C", "C++", "Java", "Python", "JS", "TS", "HTML", "CSS", "Node", "React", "Vue", "AWS", "Git"];
  import_react.useEffect(() => {
    const createParticles = () => {
      const newParticles = [];
      for (let i = 0;i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speed: Math.random() * 0.3 + 0.1,
          char: matrixChars[Math.floor(Math.random() * matrixChars.length)] || "0"
        });
      }
      setParticles(newParticles);
    };
    const createAuroraParticles = () => {
      const newAuroraParticles = [];
      for (let i = 0;i < 50; i++) {
        newAuroraParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          hue: Math.random() * 60 + 200,
          life: Math.random(),
          size: Math.random() * 3 + 1
        });
      }
      setAuroraParticles(newAuroraParticles);
    };
    createParticles();
    createAuroraParticles();
    const resizeHandler = () => {
      createParticles();
      createAuroraParticles();
    };
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, []);
  import_react.useEffect(() => {
    const animateParticles = () => {
      setParticles((prev) => prev.map((particle) => ({
        ...particle,
        y: particle.y > window.innerHeight ? -20 : particle.y + particle.speed,
        x: particle.x + Math.sin(particle.y * 0.01) * 0.3
      })));
      setAuroraParticles((prev) => prev.map((particle) => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        life: particle.life - 0.003,
        ...particle.x < 0 && { x: window.innerWidth },
        ...particle.x > window.innerWidth && { x: 0 },
        ...particle.y < 0 && { y: window.innerHeight },
        ...particle.y > window.innerHeight && { y: 0 },
        ...particle.life <= 0 && {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          life: 1,
          hue: Math.random() * 60 + 200
        }
      })));
    };
    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsx_runtime.jsxs("div", {
    className: "fixed inset-0 overflow-hidden pointer-events-none z-0",
    children: [
      /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "aurora-waves",
        children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx_runtime.jsx("div", {
          className: `aurora-wave aurora-wave-${i + 1}`,
          style: {
            animationDelay: `${i * 2}s`,
            animationDuration: `${8 + i * 2}s`
          }
        }, i))
      }),
      auroraParticles.map((particle) => /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "absolute aurora-particle",
        style: {
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          opacity: particle.life * 0.6,
          background: `radial-gradient(circle, 
              hsla(${particle.hue}, 80%, 60%, ${particle.life * 0.8}) 0%, 
              hsla(${particle.hue + 20}, 70%, 50%, ${particle.life * 0.4}) 30%, 
              transparent 70%)`,
          width: `${particle.size * 30}px`,
          height: `${particle.size * 30}px`,
          borderRadius: "50%",
          filter: "blur(1px)"
        }
      }, particle.id)),
      /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "aurora-orbs",
        children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx_runtime.jsx("div", {
          className: "aurora-orb",
          style: {
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 80 + 10}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
            "--hue": `${200 + i * 30}deg`
          }
        }, i))
      }),
      particles.map((particle) => /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "absolute text-green-400 opacity-10 font-mono text-sm animate-pulse",
        style: {
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          transform: `translateY(${particle.y}px)`,
          animation: "matrix-fall 15s linear infinite"
        },
        children: particle.char
      }, particle.id)),
      /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "absolute inset-0 opacity-60",
        children: codeSnippets.slice(0, 8).map((snippet, index) => /* @__PURE__ */ jsx_runtime.jsx("div", {
          className: "absolute text-blue-300/20 font-mono text-xs rotate-12 select-none animate-float-code",
          style: {
            left: `${index * 15 % 90}%`,
            top: `${index * 12 % 80}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${8 + index % 3}s`
          },
          children: snippet
        }, index))
      }),
      /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "absolute inset-0 opacity-30",
        children: [...Array(4)].map((_, index) => /* @__PURE__ */ jsx_runtime.jsx("div", {
          className: `absolute rounded-full opacity-20 animate-float-shapes ${index % 2 === 0 ? "bg-blue-400" : "bg-purple-400"}`,
          style: {
            left: `${index * 25 % 100}%`,
            top: `${index * 30 % 100}%`,
            width: `${40 + index * 15}px`,
            height: `${40 + index * 15}px`,
            animationDelay: `${index * 1.5}s`,
            animationDuration: `${20 + index % 5}s`
          }
        }, index))
      }),
      /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "absolute top-0 left-0 w-full h-full opacity-3",
        children: [...Array(10)].map((_, index) => /* @__PURE__ */ jsx_runtime.jsx("div", {
          className: "absolute top-0 animate-binary-rain font-mono text-green-300 text-xs",
          style: {
            left: `${index * 10}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${12 + index % 3}s`
          },
          children: Array.from({ length: 15 }, (_2, i) => /* @__PURE__ */ jsx_runtime.jsx("div", {
            className: "mb-3",
            children: Math.random() > 0.5 ? "1" : "0"
          }, i))
        }, index))
      })
    ]
  });
};
var Navigation = () => {
  const [activeSection, setActiveSection] = import_react.useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = import_react.useState(false);
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };
  return /* @__PURE__ */ jsx_runtime.jsx("nav", {
    className: "fixed top-0 left-0 right-0 z-50 bg-[#242424]/95 backdrop-blur-sm border-b border-gray-700",
    children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
      className: "max-w-6xl mx-auto px-4 py-3",
      children: [
        /* @__PURE__ */ jsx_runtime.jsxs("div", {
          className: "flex justify-between items-center",
          children: [
            /* @__PURE__ */ jsx_runtime.jsx("div", {
              className: "text-lg sm:text-xl font-bold text-white",
              children: "SHRIOMA PAL"
            }),
            /* @__PURE__ */ jsx_runtime.jsx("div", {
              className: "hidden md:flex space-x-6",
              children: ["home", "about", "projects", "skills", "achievements", "hobbies", "contact"].map((section) => /* @__PURE__ */ jsx_runtime.jsx("button", {
                onClick: () => scrollToSection(section),
                className: `capitalize px-3 py-1 rounded transition-colors ${activeSection === section ? "text-blue-400 bg-blue-400/10" : "text-gray-300 hover:text-white"}`,
                children: section
              }, section))
            }),
            /* @__PURE__ */ jsx_runtime.jsx("button", {
              className: "md:hidden text-white p-2",
              onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen),
              "aria-label": "Toggle mobile menu",
              children: /* @__PURE__ */ jsx_runtime.jsx("svg", {
                className: "w-6 h-6",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: isMobileMenuOpen ? /* @__PURE__ */ jsx_runtime.jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M6 18L18 6M6 6l12 12"
                }) : /* @__PURE__ */ jsx_runtime.jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M4 6h16M4 12h16M4 18h16"
                })
              })
            })
          ]
        }),
        isMobileMenuOpen && /* @__PURE__ */ jsx_runtime.jsx("div", {
          className: "md:hidden mt-4 pb-4 border-t border-gray-700",
          children: /* @__PURE__ */ jsx_runtime.jsx("div", {
            className: "flex flex-col space-y-2 pt-4",
            children: ["home", "about", "projects", "skills", "achievements", "hobbies", "contact"].map((section) => /* @__PURE__ */ jsx_runtime.jsx("button", {
              onClick: () => scrollToSection(section),
              className: `capitalize px-3 py-2 rounded text-left transition-colors ${activeSection === section ? "text-blue-400 bg-blue-400/10" : "text-gray-300 hover:text-white hover:bg-gray-700/50"}`,
              children: section
            }, section))
          })
        })
      ]
    })
  });
};
var Hero = () => {
  const LogoFallback = () => /* @__PURE__ */ jsx_runtime.jsx("div", {
    className: "w-48 h-48 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg",
    children: /* @__PURE__ */ jsx_runtime.jsxs("svg", {
      width: "120",
      height: "120",
      viewBox: "0 0 100 100",
      className: "text-white",
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("circle", {
          cx: "50",
          cy: "50",
          r: "40",
          fill: "currentColor",
          opacity: "0.2"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("text", {
          x: "50",
          y: "60",
          fontSize: "24",
          fontWeight: "bold",
          textAnchor: "middle",
          fill: "currentColor",
          children: "LOGO"
        })
      ]
    })
  });
  const [logoError, setLogoError] = import_react.useState(false);
  const titles = [
    "Aspiring Java Developer",
    "Fullstack Developer",
    "AI/ML Explorer",
    "Cybersecurity Enthusiast"
  ];
  const [currentTitleIndex, setCurrentTitleIndex] = import_react.useState(0);
  const [displayedText, setDisplayedText] = import_react.useState("");
  const [isTyping, setIsTyping] = import_react.useState(true);
  const [showCursor, setShowCursor] = import_react.useState(true);
  const [charIndex, setCharIndex] = import_react.useState(0);
  import_react.useEffect(() => {
    const interval = setInterval(() => {
      const currentTitle = titles[currentTitleIndex];
      if (!currentTitle)
        return;
      if (isTyping) {
        if (charIndex <= currentTitle.length) {
          setDisplayedText(currentTitle.slice(0, charIndex));
          setCharIndex((prev) => prev + 1);
        } else {
          setTimeout(() => setIsTyping(false), 1500);
        }
      } else {
        if (charIndex > 0) {
          setCharIndex((prev) => prev - 1);
          setDisplayedText(currentTitle.slice(0, charIndex - 1));
        } else {
          setCurrentTitleIndex((prev) => (prev + 1) % titles.length);
          setIsTyping(true);
          setCharIndex(0);
        }
      }
    }, isTyping ? 100 : 50);
    return () => clearInterval(interval);
  }, [currentTitleIndex, isTyping, charIndex, titles]);
  import_react.useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ jsx_runtime.jsx("section", {
    id: "home",
    className: "min-h-screen flex items-center justify-center px-4 pt-20",
    children: /* @__PURE__ */ jsx_runtime.jsx("div", {
      className: "max-w-6xl mx-auto w-full",
      children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
        className: "grid md:grid-cols-2 gap-8 md:gap-12 items-center",
        children: [
          /* @__PURE__ */ jsx_runtime.jsx("div", {
            className: "flex justify-center md:justify-start order-1 md:order-1",
            children: !logoError ? /* @__PURE__ */ jsx_runtime.jsx("div", {
              className: "w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg",
              children: /* @__PURE__ */ jsx_runtime.jsx("img", {
                src: logo_default,
                alt: "Logo",
                className: "w-full h-full object-contain rounded-full",
                onError: (e) => {
                  console.log("Logo failed to load from:", logo_default);
                  setLogoError(true);
                },
                onLoad: () => {
                  console.log("Logo loaded successfully from:", logo_default);
                }
              })
            }) : /* @__PURE__ */ jsx_runtime.jsx("div", {
              className: "w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-lg",
              children: /* @__PURE__ */ jsx_runtime.jsxs("svg", {
                width: "140",
                height: "140",
                viewBox: "0 0 100 100",
                className: "text-white",
                children: [
                  /* @__PURE__ */ jsx_runtime.jsx("circle", {
                    cx: "50",
                    cy: "50",
                    r: "40",
                    fill: "currentColor",
                    opacity: "0.2"
                  }),
                  /* @__PURE__ */ jsx_runtime.jsx("text", {
                    x: "50",
                    y: "60",
                    fontSize: "24",
                    fontWeight: "bold",
                    textAnchor: "middle",
                    fill: "currentColor",
                    children: "LOGO"
                  })
                ]
              })
            })
          }),
          /* @__PURE__ */ jsx_runtime.jsxs("div", {
            className: "text-center md:text-left order-2 md:order-2",
            children: [
              /* @__PURE__ */ jsx_runtime.jsxs("h1", {
                className: "text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent leading-tight px-2",
                children: [
                  "Hello, There!",
                  /* @__PURE__ */ jsx_runtime.jsx("br", {}),
                  "Welcome to My World!"
                ]
              }),
              /* @__PURE__ */ jsx_runtime.jsx("div", {
                className: "text-2xl sm:text-2xl md:text-3xl text-gray-300 mb-8 md:mb-10 h-16 sm:h-16 md:h-18 flex items-center justify-center md:justify-start px-2",
                children: /* @__PURE__ */ jsx_runtime.jsxs("span", {
                  className: "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-semibold text-center md:text-left",
                  children: [
                    displayedText,
                    /* @__PURE__ */ jsx_runtime.jsx("span", {
                      className: `inline-block w-0.5 h-10 bg-blue-400 ml-1 ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100`,
                      children: "|"
                    })
                  ]
                })
              }),
              /* @__PURE__ */ jsx_runtime.jsxs("div", {
                className: "flex flex-col gap-4 justify-center md:justify-start px-4",
                children: [
                  /* @__PURE__ */ jsx_runtime.jsxs("div", {
                    className: "flex flex-col sm:flex-row gap-4",
                    children: [
                      /* @__PURE__ */ jsx_runtime.jsxs("a", {
                        href: "/My-Resume.pdf?v=20250503",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl",
                        children: [
                          /* @__PURE__ */ jsx_runtime.jsxs("svg", {
                            className: "w-6 h-6",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: [
                              /* @__PURE__ */ jsx_runtime.jsx("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              }),
                              /* @__PURE__ */ jsx_runtime.jsx("path", {
                                strokeLinecap: "round",
                                strokeLinejoin: "round",
                                strokeWidth: 2,
                                d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              })
                            ]
                          }),
                          "View Resume"
                        ]
                      }),
                      /* @__PURE__ */ jsx_runtime.jsxs("a", {
                        href: "/My-Resume.pdf?v=20250503",
                        download: "My-Resume.pdf",
                        className: "px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-3 text-lg font-medium shadow-lg hover:shadow-xl",
                        children: [
                          /* @__PURE__ */ jsx_runtime.jsx("svg", {
                            className: "w-6 h-6",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: 2,
                              d: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            })
                          }),
                          "Download Resume"
                        ]
                      })
                    ]
                  }),
                  /* @__PURE__ */ jsx_runtime.jsx("button", {
                    className: "px-8 py-4 border-2 border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors text-lg font-medium shadow-lg hover:shadow-xl",
                    children: "Get In Touch"
                  })
                ]
              })
            ]
          })
        ]
      })
    })
  });
};
var About = () => {
  return /* @__PURE__ */ jsx_runtime.jsx("section", {
    id: "about",
    className: "py-16 sm:py-20 px-4",
    children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
      className: "max-w-4xl mx-auto",
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("h2", {
          className: "text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12",
          children: "About Me"
        }),
        /* @__PURE__ */ jsx_runtime.jsxs("div", {
          className: "grid md:grid-cols-2 gap-8 md:gap-12 items-center",
          children: [
            /* @__PURE__ */ jsx_runtime.jsxs("div", {
              className: "order-2 md:order-1",
              children: [
                /* @__PURE__ */ jsx_runtime.jsx("p", {
                  className: "text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed",
                  children: "I'm a passionate developer with a love for creating beautiful, functional, and user-friendly applications. With expertise in modern web technologies, I enjoy turning complex problems into simple, elegant solutions."
                }),
                /* @__PURE__ */ jsx_runtime.jsx("p", {
                  className: "text-base sm:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed",
                  children: "When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or enjoying the great outdoors."
                }),
                /* @__PURE__ */ jsx_runtime.jsx("div", {
                  className: "flex flex-wrap gap-2",
                  children: ["React", "TypeScript", "Node.js", "Python", "AWS"].map((tech) => /* @__PURE__ */ jsx_runtime.jsx("span", {
                    className: "px-2 sm:px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs sm:text-sm",
                    children: tech
                  }, tech))
                })
              ]
            }),
            /* @__PURE__ */ jsx_runtime.jsxs("div", {
              className: "space-y-3 sm:space-y-4 order-1 md:order-2",
              children: [
                /* @__PURE__ */ jsx_runtime.jsxs("div", {
                  className: "bg-gray-800 p-4 sm:p-6 rounded-lg",
                  children: [
                    /* @__PURE__ */ jsx_runtime.jsx("h3", {
                      className: "text-lg sm:text-xl font-semibold mb-2",
                      children: "\uD83D\uDE80 Fast Learner"
                    }),
                    /* @__PURE__ */ jsx_runtime.jsx("p", {
                      className: "text-sm sm:text-base text-gray-300",
                      children: "Always eager to learn new technologies and stay up-to-date with industry trends."
                    })
                  ]
                }),
                /* @__PURE__ */ jsx_runtime.jsxs("div", {
                  className: "bg-gray-800 p-4 sm:p-6 rounded-lg",
                  children: [
                    /* @__PURE__ */ jsx_runtime.jsx("h3", {
                      className: "text-lg sm:text-xl font-semibold mb-2",
                      children: "\uD83C\uDFAF Problem Solver"
                    }),
                    /* @__PURE__ */ jsx_runtime.jsx("p", {
                      className: "text-sm sm:text-base text-gray-300",
                      children: "Love tackling complex challenges and finding creative solutions."
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    })
  });
};
var Projects = () => {
  const [visibleProjects, setVisibleProjects] = import_react.useState([]);
  const projectsRef = import_react.useRef(null);
  const projects = [
    {
      title: "\uD83E\uDE7AMedFlow-OpenEnv",
      description: "A reinforcement learning-based hospital triage simulator that optimizes patient assignment, queue management, and resource allocation. Built with OpenEnv, FastAPI, and Python, featuring trained RL agents evaluated across multiple healthcare scenarios.",
      image: "\uD83C\uDFE5",
      tech: ["OpenEnv", "Python", "FastAPI", "Reinforcement Learning", "HTMLL", "CSS"],
      demo: "https://shriom23-medflow-openenv.hf.space/",
      code: "https://github.com/shriom17/MedFlow-OpenEnv"
    },
    {
      title: "\uD83D\uDE9C KisanMitra - Smart Agricultural Advisory",
      description: "An innovative all-in-one collaborative platform empowering farmers with live weather alerts, AI-powered soil analysis, crop disease detection, real-time market prices, and expert agricultural guidance.",
      image: "\uD83D\uDC68‍\uD83C\uDF3E",
      tech: ["React.js", "Python Flask", "Socket.io", "MongoDB", "AI/ML"],
      demo: "https://agri-guru-pied.vercel.app/",
      code: "https://github.com/shriom17/AgriGuru"
    },
    {
      title: "\uD83E\uDDE0 MindScape - Mental Health Tracker",
      description: "A revolutionary platform analyzing social media usage patterns to track mental health indicators. Provides personalized wellness recommendations and motivational content from ancient wisdom texts like the Bhagavad Gita.",
      image: "\uD83E\uDDE0",
      tech: ["React.js", "Python Flask", "Tinny Llama", "MongoDB", "NLP"],
      demo: "Coming Soon",
      code: "https://github.com/shriom17/MindScape"
    }
  ];
  import_react.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          projects.forEach((_, index) => {
            setTimeout(() => {
              setVisibleProjects((prev) => {
                const newVisible = [...prev];
                newVisible[index] = true;
                return newVisible;
              });
            }, index * 200);
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    if (projectsRef.current) {
      observer.observe(projectsRef.current);
    }
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsx_runtime.jsx("section", {
    id: "projects",
    className: "py-16 sm:py-20 px-4 bg-gray-900",
    children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
      className: "max-w-6xl mx-auto",
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("h2", {
          className: "text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12",
          children: "Featured Projects"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("div", {
          ref: projectsRef,
          className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-10",
          children: projects.map((project, index) => /* @__PURE__ */ jsx_runtime.jsx("div", {
            className: `bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl border border-gray-700 hover:border-gray-600 ${visibleProjects[index] ? "translate-x-0 opacity-100" : "translate-x-[-100px] opacity-0"}`,
            style: {
              transitionDelay: visibleProjects[index] ? "0ms" : `${index * 200}ms`
            },
            children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
              className: "p-6 sm:p-6 text-center",
              children: [
                /* @__PURE__ */ jsx_runtime.jsx("div", {
                  className: "mb-6 sm:mb-6 h-40 sm:h-36 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-gray-600 hover:border-blue-400 transition-colors duration-300",
                  children: project.image.includes(".jpg") || project.image.includes(".png") || project.image.includes(".jpeg") ? /* @__PURE__ */ jsx_runtime.jsx("img", {
                    src: project.image,
                    alt: project.title,
                    className: "w-full h-full object-cover rounded-xl shadow-md",
                    onError: (e) => {
                      console.error("Image failed to load:", project.image);
                      const target = e.target;
                      target.style.display = "none";
                    },
                    onLoad: () => {
                      console.log("Image loaded successfully:", project.image);
                    }
                  }) : /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-6xl sm:text-7xl lg:text-8xl transform hover:scale-110 transition-transform duration-300 filter drop-shadow-lg",
                    children: project.image
                  })
                }),
                /* @__PURE__ */ jsx_runtime.jsx("h3", {
                  className: "text-2xl sm:text-2xl font-bold mb-4 sm:mb-4 text-white",
                  children: project.title
                }),
                /* @__PURE__ */ jsx_runtime.jsx("p", {
                  className: "text-base sm:text-base text-gray-300 mb-6 sm:mb-6 leading-relaxed min-h-[5rem] sm:min-h-[5rem]",
                  children: project.description
                }),
                /* @__PURE__ */ jsx_runtime.jsx("div", {
                  className: "flex flex-wrap gap-3 sm:gap-3 mb-6 sm:mb-6 justify-center",
                  children: project.tech.map((tech) => /* @__PURE__ */ jsx_runtime.jsx("span", {
                    className: "px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm sm:text-sm rounded-full font-medium shadow-md hover:shadow-lg transition-shadow",
                    children: tech
                  }, tech))
                }),
                /* @__PURE__ */ jsx_runtime.jsxs("div", {
                  className: "flex gap-6 sm:gap-6 justify-center text-base sm:text-base",
                  children: [
                    /* @__PURE__ */ jsx_runtime.jsxs("a", {
                      href: project.demo,
                      className: "flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg",
                      children: [
                        /* @__PURE__ */ jsx_runtime.jsx("svg", {
                          className: "w-4 h-4",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24",
                          children: /* @__PURE__ */ jsx_runtime.jsx("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          })
                        }),
                        "Live Demo"
                      ]
                    }),
                    /* @__PURE__ */ jsx_runtime.jsxs("a", {
                      href: project.code,
                      className: "flex items-center gap-2 px-5 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors font-medium",
                      children: [
                        /* @__PURE__ */ jsx_runtime.jsx("svg", {
                          className: "w-4 h-4",
                          fill: "currentColor",
                          viewBox: "0 0 24 24",
                          children: /* @__PURE__ */ jsx_runtime.jsx("path", {
                            d: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                          })
                        }),
                        "Source Code"
                      ]
                    })
                  ]
                })
              ]
            })
          }, index))
        })
      ]
    })
  });
};
var Skills = () => {
  const [visibleSkills, setVisibleSkills] = import_react.useState([]);
  const skillsRef = import_react.useRef(null);
  const TechLogo = ({ name, children }) => /* @__PURE__ */ jsx_runtime.jsxs("div", {
    className: "group relative",
    children: [
      /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "w-16 h-16 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-gray-900 rounded-xl border border-gray-700 hover:border-blue-400 transition-all duration-300 hover:scale-110 hover:bg-gray-700",
        children
      }),
      /* @__PURE__ */ jsx_runtime.jsx("span", {
        className: "absolute -bottom-10 sm:-bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap",
        children: name
      })
    ]
  });
  const skillCategories = [
    {
      title: "Frontend",
      skills: [
        {
          name: "React",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-blue-400",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zM17.992 16.255l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.139s-2.018 3.25-5.535 4.139l-.473.121zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zM16.795 22.677c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.823 6.855l-.133.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.75 7.24zM7.206 22.677A2.38 2.38 0 0 1 6 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 0 0 2.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501zM12 16.878c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a30.672 30.672 0 0 1 5.033 0l.234.02.134.193a30.086 30.086 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z"
            })
          })
        },
        {
          name: "TypeScript",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-blue-600",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0H1.125zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
            })
          })
        },
        {
          name: "Next.js",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-white",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474s.012 1.0884.108 1.7476c.652 4.506 3.8591 8.2919 8.2087 9.6945.7789.2511 1.6.4223 2.5337.5255.3636.04 1.9354.04 2.299 0 1.6117-.1783 2.9772-.577 4.3237-1.2643.2065-.1056.2464-.1337.2183-.1573-.0188-.0139-.8987-1.1938-1.9543-2.62l-1.919-2.592-2.4047-3.5583c-1.3231-1.9564-2.4117-3.556-2.4211-3.556-.0094-.0026-.0187 1.5787-.0235 3.509-.0067 3.3802-.0093 3.5162-.0516 3.596-.061.115-.108.1618-.2064.2134-.075.0374-.1408.0445-.5429.0445h-.4570l-.0736-.047c-.0275-.0188-.0736-.0623-.1062-.1024l-.0442-.0697.0562-4.2991.0562-4.3057.0842-.0592c.0456-.0343.1168-.0686.1736-.0686.0262 0 .3584.1526.7354.3391 1.0068.5014 1.8909.9252 3.2094 1.5344l.7716.3537 2.2094-2.9618c1.2127-1.6284 2.2015-2.9618 2.2015-2.9618s-.9791-.632-1.5025-.9504c-1.6284-1.0051-2.8284-1.6283-4.1012-2.1247L12.7 1.075c-.2065-.1056-.3776-.1921-.3776-.1921-.0094 0-.0188 1.9071-.0234 4.2457l-.0047 4.2437-.7514-1.1512-.7514-1.1512V5.3475V1.075l.0953-.0592C8.2 .9504 8.2703.9362 8.3846.9362c.1049 0 .2508.0139.3354.0328.0797.0187.1049.0328.1049.0797 0 .0422-.7718 1.2525-1.7145 2.6927l-1.7145 2.6177v3.0409h1.096v-2.6177l1.715-2.6927c.943-1.44 1.715-2.6507 1.715-2.6927 0-.0469.0252-.061.1049-.0797.0846-.0189.2305-.0328.3354-.0328.1143 0 .1846.0234.2508.0797l.0953.0592v4.2717l-.0047-4.2437-.0234-4.2457c0-2.3386-.0094-4.2457-.0188-4.2457 0 0-.171.0865-.3776.1921z"
            })
          })
        },
        {
          name: "TailwindCSS",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-cyan-400",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"
            })
          })
        },
        {
          name: "Vue.js",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-green-500",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"
            })
          })
        },
        {
          name: "HTML/CSS",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-orange-500",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z"
            })
          })
        }
      ]
    },
    {
      title: "Backend",
      skills: [
        {
          name: "Node.js",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-green-600",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.570,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.275-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z"
            })
          })
        },
        {
          name: "Java",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-orange-600",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"
            })
          })
        },
        {
          name: "Python",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-yellow-400",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"
            })
          })
        },
        {
          name: "PostgreSQL",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-blue-600",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M23.5594,14.7228a.5269.5269,0,0,0-.0563-.2764c-.1947-.6772-.7073-1.4061-1.2344-1.7439a2.3775,2.3775,0,0,0-.8909-.2714,3.0123,3.0123,0,0,0,.2354-.9544c.0049-.0383.0049-.0994.0049-.1377,0-.9389-.0979-1.8777-.3393-2.7661-.4287-1.5943-1.2491-2.8776-2.5851-3.7662C17.5645,4.9532,16.0442,4.4854,14.4317,4.4854h-.0146A12.3965,12.3965,0,0,0,11.709,4.7227a11.6139,11.6139,0,0,0-5.4519,2.6475C4.6132,8.5265,3.7976,10.0479,3.4632,11.7287a11.8543,11.8543,0,0,0-.1321,1.9286c0,.2764.0049.5577.0244.834.0195.2764.0586.5577.1074.834a6.9275,6.9275,0,0,0,.9105,2.8287,4.6946,4.6946,0,0,0,2.4652,2.0115,7.0266,7.0266,0,0,0,1.6875.2764c.5577,0,1.1348-.0683,1.6875-.2764.6406-.2373,1.2393-.6016,1.8018-1.0059.5577.4043,1.1563.7686,1.8018,1.0059.5527.208,1.1298.2764,1.6875.2764a7.0266,7.0266,0,0,0,1.6875-.2764,4.6946,4.6946,0,0,0,2.4652-2.0115,6.9275,6.9275,0,0,0,.9105-2.8287c.0488-.2764.0879-.5577.1074-.834.0195-.2764.0244-.5577.0244-.834A11.8543,11.8543,0,0,0,23.5594,14.7228ZM8.9639,17.6123a6.1806,6.1806,0,0,1-1.24.0928,5.0645,5.0645,0,0,1-1.1935-.1465,3.4.3405,0,0,1-1.7637-1.4258,5.7762,5.7762,0,0,1-.7226-2.2461c-.0488-.208-.0879-.4209-.1025-.6348-.0146-.2139-.0244-.4336-.0244-.6465a10.0893,10.0893,0,0,1,.1123-1.6777c.2861-1.4746.9836-2.7207,2.0654-3.7061A9.6426,9.6426,0,0,1,10.5176,5.91a10.2887,10.2887,0,0,1,2.3555-.2275h.0146a7.7576,7.7576,0,0,1,3.584.8447c1.0479.6836,1.6875,1.8018,2.0166,3.1094.1953.7764.2861,1.5625.2861,2.3486,0,.0488,0,.0928-.0049.1416a2.1934,2.1934,0,0,0-.4727-.0537,3.5454,3.5454,0,0,0-1.9043.5625c-.6836.458-1.23,1.1572-1.6396,1.9531a13.9347,13.9347,0,0,0-.9932,3.0811A15.1518,15.1518,0,0,0,13.5127,19.1c-.0488.5088-.0732,1.0225-.0732,1.5361,0,.2666.0146.5332.0293.7998-.6064.3242-1.2276.4844-1.8408.4844A5.0645,5.0645,0,0,1,8.9639,17.6123Z"
            })
          })
        },
        {
          name: "MongoDB",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-green-600",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0111.91 24h.481c.114-1.032.284-2.056.51-3.07.417-.296.604-.463.85-.693a11.342 11.342 0 003.639-8.464c.01-.814-.103-1.662-.197-2.218zm-5.336 8.195s0-8.291.275-8.29c.213 0 .49 10.695.49 10.695-.381-.045-.765-1.76-.765-2.405z"
            })
          })
        },
        {
          name: "Redis",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-red-500",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M10.5 2.661l.54.997-3.233 1.815 3.233 1.815-.54.997L6.5 6.456l-3 1.74L6.5 9.935l3-.54V8.15l3.233-1.815L9.5 4.52v1.245l-3 .54V4.52l3.233-1.815L6.5 1.816V3.85l3-.54V2.065zm6.487 0l.54.997-3.233 1.815 3.233 1.815-.54.997L13 6.456l-3 1.74L13 9.935l3-.54V8.15l3.233-1.815L16 4.52v1.245l-3 .54V4.52l3.233-1.815L13 1.816V3.85l3-.54V2.065zm-13.487 7.32l.54.997-3.233 1.815 3.233 1.815-.54.997L0 12.776l-3 1.74 3 1.74 3-.54v-1.245l3.233-1.815L3 11.84v1.245l-3 .54v-1.245l3.233-1.815L0 8.776V10.81l3-.54V8.025z"
            })
          })
        }
      ]
    },
    {
      title: "Tools & Others",
      skills: [
        {
          name: "Git",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-orange-600",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.217-.091-.424-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"
            })
          })
        },
        {
          name: "Docker",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-blue-500",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.186m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338 0-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983 0 1.94-.09 2.844-.267a12.024 12.024 0 003.614-1.707 11.136 11.136 0 002.042-2.611 10.972 10.972 0 001.294-2.156c.836.015 2.084-.36 2.776-1.345.16-.226.284-.473.369-.736l.075-.28-.219-.162z"
            })
          })
        },
        {
          name: "AWS",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-orange-400",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335c-.072.048-.144.070-.215.070-.088 0-.176-.040-.264-.127a2.65 2.65 0 01-.319-.415 6.788 6.788 0 01-.271-.535c-.68.802-1.534 1.203-2.56 1.203-.735 0-1.319-.207-1.751-.623-.433-.415-.648-.968-.648-1.658 0-.735.256-1.327.775-1.774.52-.448 1.212-.67 2.088-.67.288 0 .583.024.895.064.32.048.648.112.991.2v-.656c0-.68-.144-1.151-.424-1.423-.288-.271-.775-.407-1.478-.407-.32 0-.648.040-.99.111-.344.08-.679.183-.99.32-.144.063-.248.103-.320.119-.071.016-.12.024-.151.024-.136 0-.2-.096-.2-.296v-.464c0-.152.024-.264.08-.336.055-.072.152-.144.296-.216.32-.168.703-.305 1.15-.417.449-.111.93-.168 1.447-.168 1.103 0 1.911.248 2.432.744.513.496.775 1.248.775 2.256l-.016 2.976zm-3.537 1.311c.279 0 .567-.048.879-.151.32-.104.602-.271.863-.496.16-.144.279-.304.352-.479.072-.176.112-.383.112-.624v-.296a6.436 6.436 0 00-.775-.151 7.19 7.19 0 00-.8-.048c-.567 0-.99.111-1.279.328-.288.224-.44.536-.44.96 0 .391.096.68.304.88.199.2.487.296.792.296l-.008.001zm6.319 1.631c-.168 0-.279-.032-.336-.088-.056-.064-.104-.176-.151-.344L7.215 5.28c-.048-.168-.072-.279-.072-.336 0-.136.064-.207.2-.207h.8c.175 0 .295.032.343.088.064.064.104.176.151.344l1.751 6.87 1.615-6.87c.04-.168.088-.279.151-.344.064-.056.184-.088.344-.088h.647c.175 0 .295.032.344.088.063.064.111.176.151.344l1.639 6.958 1.8-6.958c.048-.168.104-.279.152-.344.063-.056.183-.088.343-.088h.759c.136 0 .208.064.208.207 0 .04-.008.088-.016.144-.016.056-.04.135-.088.24L14.26 12.546c-.048.168-.104.279-.151.344-.056.056-.176.088-.336.088h-.695c-.175 0-.295-.032-.344-.088-.063-.064-.111-.184-.151-.344L11.047 6.1l-1.543 6.447c-.04.168-.088.279-.151.344-.056.056-.176.088-.344.088h-.695l-.007.001zm10.553.336c-.431 0-.863-.048-1.295-.151-.431-.096-.742-.2-.934-.32-.12-.071-.2-.151-.24-.223-.04-.08-.056-.16-.056-.248v-.48c0-.2.072-.296.208-.296.056 0 .111.016.175.032.056.024.144.056.24.096.335.144.679.248 1.047.312.367.071.727.104 1.094.104.583 0 1.038-.104 1.367-.304.328-.208.488-.496.488-.88 0-.256-.08-.479-.24-.671-.159-.2-.455-.375-.879-.537l-1.259-.399c-.639-.2-1.111-.496-1.423-.886-.312-.391-.464-.838-.464-1.343 0-.383.08-.719.248-1.015.168-.296.392-.543.688-.751.295-.2.639-.368 1.047-.479.415-.111.846-.168 1.295-.168.192 0 .391.016.583.032.2.024.383.056.575.104.175.048.34.104.488.16.151.064.279.127.367.2.112.095.2.183.248.295.048.104.08.215.08.336v.448c0 .2-.072.304-.208.304-.08 0-.2-.032-.359-.104-.535-.239-1.135-.36-1.8-.36-.52 0-.934.088-1.239.272-.304.183-.456.44-.456.774 0 .255.088.471.263.655.176.183.48.359.912.527l1.234.391c.628.2 1.08.479 1.36.846.287.359.424.774.424 1.239 0 .399-.08.751-.24 1.06-.16.32-.384.583-.681.798-.295.224-.647.391-1.062.511-.423.111-.871.168-1.351.168l.016.001z"
            })
          })
        },
        {
          name: "Figma",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-purple-500",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.019 3.019 3.019h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117v-6.038H8.148z"
            })
          })
        },
        {
          name: "Jest",
          logo: /* @__PURE__ */ jsx_runtime.jsx("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-red-600",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: /* @__PURE__ */ jsx_runtime.jsx("path", {
              d: "M22.251 11.82a3.117 3.117 0 0 0-2.328-3.01L22.911 0H8.104L11.092 8.81a3.116 3.116 0 0 0-2.244 2.988c0 1.245.7 2.328 1.726 2.844-.538 1.677-2.093 2.844-3.96 2.844-2.16 0-4.04-1.735-4.04-3.947 0-.888.307-1.681.792-2.344H0C0 17.311 4.689 22 10.297 22c4.793 0 8.785-3.312 9.861-7.742 1.144-.35 1.976-1.41 1.976-2.69-.028-.682-.26-1.336-.69-1.837zM4.689 11.82c0-4.221 3.497-7.669 7.718-7.669s7.718 3.448 7.718 7.669-3.497 7.669-7.718 7.669-7.718-3.448-7.718-7.669z"
            })
          })
        },
        {
          name: "CI/CD",
          logo: /* @__PURE__ */ jsx_runtime.jsxs("svg", {
            className: "w-10 h-10 sm:w-8 sm:h-8 text-green-500",
            viewBox: "0 0 24 24",
            fill: "currentColor",
            children: [
              /* @__PURE__ */ jsx_runtime.jsx("path", {
                d: "M8.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              }),
              /* @__PURE__ */ jsx_runtime.jsx("path", {
                d: "M4 6V5a2 2 0 012-2h12a2 2 0 012 2v1h1a1 1 0 011 1v10a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H6a2 2 0 01-2-2v-1H3a1 1 0 01-1-1V7a1 1 0 011-1h1zm2-1v14h12V5H6z"
              })
            ]
          })
        }
      ]
    }
  ];
  import_react.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const totalSkills = skillCategories.reduce((acc, category) => acc + category.skills.length, 0);
          skillCategories.forEach((category, categoryIndex) => {
            category.skills.forEach((_, skillIndex) => {
              const globalIndex = skillCategories.slice(0, categoryIndex).reduce((acc, cat) => acc + cat.skills.length, 0) + skillIndex;
              setTimeout(() => {
                setVisibleSkills((prev) => {
                  const newVisible = [...prev];
                  newVisible[globalIndex] = true;
                  return newVisible;
                });
              }, globalIndex * 100);
            });
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    if (skillsRef.current) {
      observer.observe(skillsRef.current);
    }
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsx_runtime.jsx("section", {
    id: "skills",
    className: "py-16 sm:py-20 px-4",
    children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
      className: "max-w-6xl mx-auto",
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("h2", {
          className: "text-4xl sm:text-4xl font-bold text-center mb-10 sm:mb-12",
          children: "Skills & Technologies"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("div", {
          ref: skillsRef,
          className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-12",
          children: skillCategories.map((category, categoryIndex) => /* @__PURE__ */ jsx_runtime.jsxs("div", {
            className: "text-center",
            children: [
              /* @__PURE__ */ jsx_runtime.jsx("h3", {
                className: "text-2xl sm:text-2xl font-semibold mb-6 sm:mb-6 lg:mb-8 text-blue-400",
                children: category.title
              }),
              /* @__PURE__ */ jsx_runtime.jsx("div", {
                className: "grid grid-cols-3 gap-4 sm:gap-4 lg:gap-6 justify-items-center",
                children: category.skills.map((skill, skillIndex) => {
                  const globalIndex = skillCategories.slice(0, categoryIndex).reduce((acc, cat) => acc + cat.skills.length, 0) + skillIndex;
                  return /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: `transform transition-all duration-500 ${visibleSkills[globalIndex] ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`,
                    style: {
                      transitionDelay: visibleSkills[globalIndex] ? "0ms" : `${globalIndex * 100}ms`
                    },
                    children: /* @__PURE__ */ jsx_runtime.jsx(TechLogo, {
                      name: skill.name,
                      children: skill.logo
                    })
                  }, skillIndex);
                })
              })
            ]
          }, categoryIndex))
        })
      ]
    })
  });
};
var Achievements = () => {
  const [isVisible, setIsVisible] = import_react.useState(false);
  const achievementRef = import_react.useRef(null);
  const achievements = [
    {
      title: "National Finalist",
      event: "Meta Pytorch OpenEnv Hackathon 2026",
      description: "Selected as Top 2.8%  National Finalist among Seventy thousand participants in one of the most prestigious global hackathons",
      icon: "\uD83C\uDFC6",
      year: "2026",
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "National Finalist",
      event: "Infosys Global Hackathon 2025",
      description: "Selected as Top 33 National Finalist among two thousand participants in one of the most prestigious global hackathons",
      icon: "\uD83C\uDFC6",
      year: "2025",
      color: "from-yellow-400 to-orange-500"
    },
    {
      title: "National Finalist",
      event: "Build With Gemini 2025",
      description: "Selected as Top 20 National Finalist among one thousand participants in one of the most prestigious global hackathons",
      icon: "\uD83C\uDFC6",
      year: "2025",
      color: "from-green-400 to-green-600"
    },
    {
      title: "Top 200",
      event: "Paranox",
      description: "Recognized as the top 200 participants in Paranox 2.0",
      icon: "\uD83C\uDFC5",
      year: "2025",
      color: "from-purple-400 to-purple-600"
    }
  ];
  import_react.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    if (achievementRef.current) {
      observer.observe(achievementRef.current);
    }
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ jsx_runtime.jsx("section", {
    id: "achievements",
    className: "py-20 px-4 bg-gray-900",
    children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
      className: "max-w-4xl mx-auto",
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("h2", {
          className: "text-4xl font-bold text-center mb-12",
          children: "Achievements"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("div", {
          ref: achievementRef,
          className: "space-y-6",
          children: achievements.map((achievement, index) => /* @__PURE__ */ jsx_runtime.jsxs("div", {
            className: `relative bg-gray-800 rounded-lg p-8 border-l-4 border-yellow-400 shadow-xl transition-all duration-700 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-[-50px] opacity-0"}`,
            style: {
              transitionDelay: `${index * 200}ms`
            },
            children: [
              /* @__PURE__ */ jsx_runtime.jsxs("div", {
                className: "flex items-start gap-6",
                children: [
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: `text-6xl p-4 rounded-full bg-gradient-to-r ${achievement.color} shadow-lg flex items-center justify-center`,
                    children: achievement.icon
                  }),
                  /* @__PURE__ */ jsx_runtime.jsxs("div", {
                    className: "flex-1",
                    children: [
                      /* @__PURE__ */ jsx_runtime.jsxs("div", {
                        className: "flex items-center gap-4 mb-2",
                        children: [
                          /* @__PURE__ */ jsx_runtime.jsx("h3", {
                            className: "text-2xl font-bold text-white",
                            children: achievement.title
                          }),
                          /* @__PURE__ */ jsx_runtime.jsx("span", {
                            className: "px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold",
                            children: achievement.year
                          })
                        ]
                      }),
                      /* @__PURE__ */ jsx_runtime.jsx("h4", {
                        className: "text-xl font-semibold text-yellow-400 mb-3",
                        children: achievement.event
                      }),
                      /* @__PURE__ */ jsx_runtime.jsx("p", {
                        className: "text-gray-300 leading-relaxed",
                        children: achievement.description
                      })
                    ]
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime.jsx("div", {
                className: "absolute top-4 right-4 opacity-10",
                children: /* @__PURE__ */ jsx_runtime.jsx("svg", {
                  width: "60",
                  height: "60",
                  viewBox: "0 0 24 24",
                  fill: "currentColor",
                  children: /* @__PURE__ */ jsx_runtime.jsx("path", {
                    d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  })
                })
              })
            ]
          }, index))
        })
      ]
    })
  });
};
var Hobbies = () => {
  const [currentCard, setCurrentCard] = import_react.useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = import_react.useState(true);
  const [showModal, setShowModal] = import_react.useState(false);
  const [modalImage, setModalImage] = import_react.useState(null);
  const hobbiesRef = import_react.useRef(null);
  const drawings = [
    {
      title: "Digital Portrait of Messi",
      description: "Digital art portrait of the football legend",
      image: messi_default,
      category: "Sports Art"
    },
    {
      title: "MS Dhoni Cricket Art",
      description: "Captain Cool in action - cricket artwork",
      image: DHONI_default,
      category: "Sports Art"
    },
    {
      title: "Lord Hanuman",
      description: "Spiritual artwork with devotional essence",
      image: hanumanji_default,
      category: "Spiritual Art"
    },
    {
      title: "Netaji Subhas Chandra Bose",
      description: "Tribute artwork to the great freedom fighter",
      image: NetajiD_default,
      category: "Historical Figures"
    },
    {
      title: "Maa Durga",
      description: "Divine goddess artwork with traditional essence",
      image: MAA_DURGA_default,
      category: "Spiritual Art"
    },
    {
      title: "Cristiano Ronaldo",
      description: "Football superstar digital portrait",
      image: Ronaldo_default,
      category: "Sports Art"
    },
    {
      title: "Swami Vivekananda",
      description: "Portrait of the great spiritual leader",
      image: swami_vivekanand_standing_hd_photo_2__default,
      category: "Historical Figures"
    },
    {
      title: "APJ Abdul Kalam",
      description: "People's President tribute artwork",
      image: apj_abdul_kalam_15_default,
      category: "Historical Figures"
    },
    {
      title: "Alan Turing",
      description: "Father of computer science and artificial intelligence",
      image: AlanTuring_default,
      category: "Historical Figures"
    },
    {
      title: "Arijit Singh",
      description: "Voice of Bollywood - musical legend",
      image: Arijit_Singh_default,
      category: "Music Artists"
    },
    {
      title: "Armaan Malik",
      description: "Contemporary music sensation",
      image: ARMAAN_MALIK_default,
      category: "Music Artists"
    },
    {
      title: "Patriotic Spirit",
      description: "Boy with Indian flag representing national pride",
      image: boy_indian_national_flag_green_grass_43060893_default,
      category: "Patriotic Art"
    },
    {
      title: "College Memories",
      description: "Capturing college life moments",
      image: clg_default,
      category: "Personal Art"
    },
    {
      title: "Darshan",
      description: "Portrait artwork with spiritual essence",
      image: Darshan_default,
      category: "Portraits"
    },
    {
      title: "Gopal",
      description: "Divine child Krishna artwork",
      image: GOPAL_default,
      category: "Spiritual Art"
    },
    {
      title: "Johan Cruyff",
      description: "Football legend and coach tribute",
      image: johan_cruyff_footballer_coach_14_august_1994_HN8YNYjpg_default,
      category: "Sports Art"
    },
    {
      title: "Maa Jagadhatri",
      description: "Divine mother goddess artwork",
      image: Maa_Jagadhatri_default,
      category: "Spiritual Art"
    },
    {
      title: "Maa Kali",
      description: "Fierce goddess of time and change",
      image: MAA_KALI_default,
      category: "Spiritual Art"
    },
    {
      title: "Maa Kali - Divine Power",
      description: "Another interpretation of the divine mother",
      image: MAA_KALI_default2,
      category: "Spiritual Art"
    },
    {
      title: "Maa Sarada",
      description: "Holy mother spiritual artwork",
      image: MAA_SARADA_default,
      category: "Spiritual Art"
    },
    {
      title: "Divine Mother",
      description: "Spiritual essence of motherhood",
      image: Maaa_default,
      category: "Spiritual Art"
    },
    {
      title: "Maa Durga - Alternate",
      description: "Another beautiful rendition of goddess Durga",
      image: maaDurga_default,
      category: "Spiritual Art"
    },
    {
      title: "Maa Kali - Artistic Vision",
      description: "Artistic interpretation of divine power",
      image: maaKali_default,
      category: "Spiritual Art"
    },
    {
      title: "Mahadev",
      description: "Lord Shiva - the supreme deity",
      image: MAHADEV_default,
      category: "Spiritual Art"
    },
    {
      title: "Netaji - Freedom Fighter",
      description: "Another tribute to Subhas Chandra Bose",
      image: NETAJI_default,
      category: "Historical Figures"
    },
    {
      title: "Pranab Mukherjee",
      description: "Former President of India tribute",
      image: Pranab_Mukherjee_default,
      category: "Historical Figures"
    },
    {
      title: "Rabindranath Tagore",
      description: "Nobel laureate poet and philosopher",
      image: Rabi_Tthakur_default,
      category: "Historical Figures"
    },
    {
      title: "Rohit Sharma",
      description: "Cricket captain and batting maestro",
      image: rohit_sharma_default,
      category: "Sports Art"
    },
    {
      title: "Rupam Islam",
      description: "Rock music legend from Bengal",
      image: RupamIslam_default,
      category: "Music Artists"
    },
    {
      title: "Sanam Puri",
      description: "MS Paint portrait of the singer",
      image: sanampuri_ms_paint_portrait_default,
      category: "Music Artists"
    },
    {
      title: "Satyajit Ray",
      description: "Master filmmaker and storyteller",
      image: Satyajit_Ray_default,
      category: "Historical Figures"
    },
    {
      title: "Sharodiya",
      description: "Autumn festival celebration artwork",
      image: Sharodiya_default,
      category: "Cultural Art"
    },
    {
      title: "Soumitra Chatterjee",
      description: "Legendary Bengali actor tribute",
      image: Soumitra_Chatterjee_default,
      category: "Cultural Icons"
    },
    {
      title: "Sourav Ganguly",
      description: "Captain of Indian cricket team",
      image: Sourav_Ganguly_default,
      category: "Sports Art"
    },
    {
      title: "Sushant Singh Rajput",
      description: "Tribute to the talented actor",
      image: SSR_default,
      category: "Cultural Icons"
    },
    {
      title: "Sumedh",
      description: "Portrait artwork with artistic flair",
      image: SUMEDH_default,
      category: "Portraits"
    },
    {
      title: "Ishwar Chandra Vidyasagar",
      description: "Social reformer and educator tribute",
      image: Vidyasagar_default,
      category: "Historical Figures"
    },
    {
      title: "Virat Kohli",
      description: "Cricket superstar and former captain",
      image: ViratKohli_default,
      category: "Sports Art"
    }
  ];
  import_react.useEffect(() => {
    if (!isAutoPlaying)
      return;
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % drawings.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, drawings.length]);
  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % drawings.length);
    setIsAutoPlaying(false);
  };
  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + drawings.length) % drawings.length);
    setIsAutoPlaying(false);
  };
  const goToCard = (index) => {
    setCurrentCard(index);
    setIsAutoPlaying(false);
  };
  const openModal = (drawing) => {
    setModalImage(drawing);
    setShowModal(true);
    setIsAutoPlaying(false);
  };
  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
  };
  return /* @__PURE__ */ jsx_runtime.jsxs("section", {
    id: "hobbies",
    className: "py-20 px-4 relative overflow-hidden",
    children: [
      /* @__PURE__ */ jsx_runtime.jsxs("div", {
        className: "max-w-6xl mx-auto",
        children: [
          /* @__PURE__ */ jsx_runtime.jsxs("div", {
            className: "text-center mb-16",
            children: [
              /* @__PURE__ */ jsx_runtime.jsx("h2", {
                className: "text-4xl font-bold mb-4",
                children: "Welcome to My Art Gallery"
              }),
              /* @__PURE__ */ jsx_runtime.jsx("p", {
                className: "text-xl text-gray-300",
                children: "When I'm not coding, I express my creativity through drawing and digital art"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime.jsxs("div", {
            ref: hobbiesRef,
            className: "relative h-[500px] perspective-1000 flex items-center justify-center",
            onMouseEnter: () => setIsAutoPlaying(false),
            onMouseLeave: () => setIsAutoPlaying(true),
            children: [
              /* @__PURE__ */ jsx_runtime.jsx("div", {
                className: "relative w-full h-full preserve-3d",
                children: drawings.map((drawing, index) => {
                  const isActive = index === currentCard;
                  const isPrev = index === (currentCard - 1 + drawings.length) % drawings.length;
                  const isNext = index === (currentCard + 1) % drawings.length;
                  let transformClass = "";
                  let zIndex = 0;
                  let opacity = 0.3;
                  if (isActive) {
                    transformClass = "translate-x-0 rotate-y-0 scale-110";
                    zIndex = 30;
                    opacity = 1;
                  } else if (isPrev) {
                    transformClass = "-translate-x-80 rotate-y-45 scale-90";
                    zIndex = 20;
                    opacity = 0.7;
                  } else if (isNext) {
                    transformClass = "translate-x-80 rotate-y-[-45deg] scale-90";
                    zIndex = 20;
                    opacity = 0.7;
                  } else {
                    transformClass = "translate-x-0 rotate-y-90 scale-75";
                    zIndex = 10;
                    opacity = 0.1;
                  }
                  return /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: `absolute inset-0 max-w-sm mx-auto transition-all duration-700 ease-in-out transform preserve-3d cursor-pointer ${transformClass}`,
                    style: {
                      zIndex,
                      opacity,
                      transform: `${transformClass.replace("rotate-y-", "rotateY(").replace("rotate-y-[-45deg]", "rotateY(-45deg)")}`.replace("scale-", " scale(")
                    },
                    onClick: () => goToCard(index),
                    children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
                      className: "relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 hover:border-blue-400 transition-all duration-300",
                      children: [
                        /* @__PURE__ */ jsx_runtime.jsxs("div", {
                          className: "h-64 overflow-hidden relative",
                          children: [
                            /* @__PURE__ */ jsx_runtime.jsx("img", {
                              src: drawing.image,
                              alt: drawing.title,
                              className: "w-full h-full object-cover",
                              onError: (e) => {
                                const target = e.target;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <div class="text-white text-center p-6">
                                  <div class="text-6xl mb-4">\uD83C\uDFA8</div>
                                  <h3 class="text-lg font-semibold mb-2">${drawing.title}</h3>
                                </div>
                              </div>
                            `;
                                }
                              }
                            }),
                            /* @__PURE__ */ jsx_runtime.jsx("div", {
                              className: "absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"
                            })
                          ]
                        }),
                        /* @__PURE__ */ jsx_runtime.jsxs("div", {
                          className: "p-6 space-y-4",
                          children: [
                            /* @__PURE__ */ jsx_runtime.jsxs("div", {
                              className: "flex items-center justify-between",
                              children: [
                                /* @__PURE__ */ jsx_runtime.jsx("h3", {
                                  className: "text-xl font-bold text-white truncate",
                                  children: drawing.title
                                }),
                                /* @__PURE__ */ jsx_runtime.jsx("span", {
                                  className: "px-3 py-1 bg-blue-600 text-white rounded-full text-xs whitespace-nowrap",
                                  children: drawing.category
                                })
                              ]
                            }),
                            /* @__PURE__ */ jsx_runtime.jsx("p", {
                              className: "text-gray-300 text-sm leading-relaxed",
                              children: drawing.description
                            }),
                            /* @__PURE__ */ jsx_runtime.jsxs("div", {
                              className: "flex gap-3 pt-2",
                              children: [
                                /* @__PURE__ */ jsx_runtime.jsx("button", {
                                  onClick: () => openModal(drawing),
                                  className: "flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-200 text-sm font-medium",
                                  children: "View Full Size"
                                }),
                                /* @__PURE__ */ jsx_runtime.jsx("button", {
                                  className: "px-4 py-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 text-sm",
                                  children: "❤️"
                                })
                              ]
                            })
                          ]
                        }),
                        /* @__PURE__ */ jsx_runtime.jsxs("div", {
                          className: "absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs",
                          children: [
                            index + 1,
                            " / ",
                            drawings.length
                          ]
                        })
                      ]
                    })
                  }, index);
                })
              }),
              /* @__PURE__ */ jsx_runtime.jsx("button", {
                onClick: prevCard,
                className: "absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110",
                children: "←"
              }),
              /* @__PURE__ */ jsx_runtime.jsx("button", {
                onClick: nextCard,
                className: "absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110",
                children: "→"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime.jsx("div", {
            className: "flex justify-center mt-8 space-x-2",
            children: drawings.map((_, index) => /* @__PURE__ */ jsx_runtime.jsx("button", {
              onClick: () => goToCard(index),
              className: `w-3 h-3 rounded-full transition-all duration-200 ${index === currentCard ? "bg-blue-500 scale-125" : "bg-gray-600 hover:bg-gray-400"}`
            }, index))
          }),
          /* @__PURE__ */ jsx_runtime.jsx("div", {
            className: "text-center mt-6",
            children: /* @__PURE__ */ jsx_runtime.jsx("button", {
              onClick: () => setIsAutoPlaying(!isAutoPlaying),
              className: "text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto",
              children: isAutoPlaying ? "⏸️ Pause Auto-Play" : "▶️ Resume Auto-Play"
            })
          }),
          /* @__PURE__ */ jsx_runtime.jsxs("div", {
            className: "grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center",
            children: [
              /* @__PURE__ */ jsx_runtime.jsxs("div", {
                className: "bg-gray-800 p-6 rounded-lg",
                children: [
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-2xl font-bold text-blue-400",
                    children: drawings.length
                  }),
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-gray-300 text-sm",
                    children: "Total Artworks"
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime.jsxs("div", {
                className: "bg-gray-800 p-6 rounded-lg",
                children: [
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-2xl font-bold text-green-400",
                    children: "4"
                  }),
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-gray-300 text-sm",
                    children: "Art Categories"
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime.jsxs("div", {
                className: "bg-gray-800 p-6 rounded-lg",
                children: [
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-2xl font-bold text-purple-400",
                    children: "2+"
                  }),
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-gray-300 text-sm",
                    children: "Years Experience"
                  })
                ]
              }),
              /* @__PURE__ */ jsx_runtime.jsxs("div", {
                className: "bg-gray-800 p-6 rounded-lg",
                children: [
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-2xl font-bold text-yellow-400",
                    children: "∞"
                  }),
                  /* @__PURE__ */ jsx_runtime.jsx("div", {
                    className: "text-gray-300 text-sm",
                    children: "Passion Level"
                  })
                ]
              })
            ]
          })
        ]
      }),
      showModal && modalImage && /* @__PURE__ */ jsx_runtime.jsx("div", {
        className: "fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4",
        onClick: closeModal,
        children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
          className: "relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsx_runtime.jsx("button", {
              onClick: closeModal,
              className: "absolute top-4 right-4 z-60 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110",
              children: /* @__PURE__ */ jsx_runtime.jsx("svg", {
                className: "w-6 h-6",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsx_runtime.jsx("path", {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M6 18L18 6M6 6l12 12"
                })
              })
            }),
            /* @__PURE__ */ jsx_runtime.jsxs("div", {
              className: "flex flex-col lg:flex-row gap-6 max-w-full max-h-full",
              children: [
                /* @__PURE__ */ jsx_runtime.jsx("div", {
                  className: "flex-1 flex items-center justify-center",
                  children: /* @__PURE__ */ jsx_runtime.jsx("img", {
                    src: modalImage.image,
                    alt: modalImage.title,
                    className: "max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  })
                }),
                /* @__PURE__ */ jsx_runtime.jsxs("div", {
                  className: "lg:w-80 flex flex-col justify-center space-y-4 text-white",
                  children: [
                    /* @__PURE__ */ jsx_runtime.jsx("h3", {
                      className: "text-3xl font-bold",
                      children: modalImage.title
                    }),
                    /* @__PURE__ */ jsx_runtime.jsx("p", {
                      className: "text-gray-300 text-lg leading-relaxed",
                      children: modalImage.description
                    }),
                    /* @__PURE__ */ jsx_runtime.jsx("div", {
                      className: "pt-4",
                      children: /* @__PURE__ */ jsx_runtime.jsx("button", {
                        onClick: closeModal,
                        className: "bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors duration-200 font-medium",
                        children: "Close"
                      })
                    })
                  ]
                })
              ]
            })
          ]
        })
      })
    ]
  });
};
var Contact = () => {
  return /* @__PURE__ */ jsx_runtime.jsx("section", {
    id: "contact",
    className: "py-16 sm:py-20 px-4 bg-gray-800",
    children: /* @__PURE__ */ jsx_runtime.jsxs("div", {
      className: "max-w-4xl mx-auto text-center",
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("h2", {
          className: "text-3xl sm:text-4xl font-bold mb-8 sm:mb-12",
          children: "Get In Touch"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("p", {
          className: "text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed",
          children: "I'm always interested in new opportunities and collaborations. Let's create something amazing together!"
        }),
        /* @__PURE__ */ jsx_runtime.jsxs("div", {
          className: "flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center",
          children: [
            /* @__PURE__ */ jsx_runtime.jsxs("a", {
              href: "mailto:shriomapal@gmail.com",
              className: "flex items-center gap-2 px-4 sm:px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center",
              children: [
                /* @__PURE__ */ jsx_runtime.jsxs("svg", {
                  className: "w-5 h-5",
                  fill: "currentColor",
                  viewBox: "0 0 20 20",
                  children: [
                    /* @__PURE__ */ jsx_runtime.jsx("path", {
                      d: "M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                    }),
                    /* @__PURE__ */ jsx_runtime.jsx("path", {
                      d: "M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                    })
                  ]
                }),
                "Email Me"
              ]
            }),
            /* @__PURE__ */ jsx_runtime.jsxs("a", {
              href: "https://www.linkedin.com/in/shrioma-pal-8176aa268/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-2 px-4 sm:px-6 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center",
              children: [
                /* @__PURE__ */ jsx_runtime.jsx("svg", {
                  className: "w-5 h-5",
                  fill: "currentColor",
                  viewBox: "0 0 20 20",
                  children: /* @__PURE__ */ jsx_runtime.jsx("path", {
                    fillRule: "evenodd",
                    d: "M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z",
                    clipRule: "evenodd"
                  })
                }),
                "LinkedIn"
              ]
            }),
            /* @__PURE__ */ jsx_runtime.jsxs("a", {
              href: "https://github.com/shriom17",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-2 px-4 sm:px-6 py-3 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center",
              children: [
                /* @__PURE__ */ jsx_runtime.jsx("svg", {
                  className: "w-5 h-5",
                  fill: "currentColor",
                  viewBox: "0 0 20 20",
                  children: /* @__PURE__ */ jsx_runtime.jsx("path", {
                    fillRule: "evenodd",
                    d: "M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z",
                    clipRule: "evenodd"
                  })
                }),
                "GitHub"
              ]
            })
          ]
        }),
        /* @__PURE__ */ jsx_runtime.jsxs("div", {
          className: "mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700",
          children: [
            /* @__PURE__ */ jsx_runtime.jsx("p", {
              className: "text-sm sm:text-base text-gray-400 mb-4",
              children: "Feel free to reach out via any of the platforms above"
            }),
            /* @__PURE__ */ jsx_runtime.jsxs("div", {
              className: "flex flex-col sm:flex-row gap-2 sm:gap-6 justify-center items-center text-xs sm:text-sm text-gray-500",
              children: [
                /* @__PURE__ */ jsx_runtime.jsx("span", {
                  children: "\uD83D\uDCE7 shriomapal@gmail.com"
                }),
                /* @__PURE__ */ jsx_runtime.jsx("span", {
                  className: "hidden sm:inline",
                  children: "•"
                }),
                /* @__PURE__ */ jsx_runtime.jsx("span", {
                  children: "\uD83C\uDF0D Available for remote opportunities"
                })
              ]
            })
          ]
        })
      ]
    })
  });
};
function App() {
  return /* @__PURE__ */ jsx_runtime.jsxs("div", {
    className: "min-h-screen bg-[#242424] text-white relative",
    children: [
      /* @__PURE__ */ jsx_runtime.jsx(AnimatedBackground, {}),
      /* @__PURE__ */ jsx_runtime.jsxs("div", {
        className: "relative z-10",
        children: [
          /* @__PURE__ */ jsx_runtime.jsx(Navigation, {}),
          /* @__PURE__ */ jsx_runtime.jsx(Hero, {}),
          /* @__PURE__ */ jsx_runtime.jsx(About, {}),
          /* @__PURE__ */ jsx_runtime.jsx(Projects, {}),
          /* @__PURE__ */ jsx_runtime.jsx(Skills, {}),
          /* @__PURE__ */ jsx_runtime.jsx(Achievements, {}),
          /* @__PURE__ */ jsx_runtime.jsx(Hobbies, {}),
          /* @__PURE__ */ jsx_runtime.jsx(Contact, {})
        ]
      })
    ]
  });
}

// src/frontend.tsx
var jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function start() {
  const root = import_client.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ jsx_runtime2.jsx(App, {}));
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

//# debugId=77ACE229C979F6B564756E2164756E21
