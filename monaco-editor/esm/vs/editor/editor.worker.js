(() => {
  // node_modules/monaco-editor/esm/vs/base/common/errors.js
  var ErrorHandler = class {
    constructor() {
      this.listeners = [];
      this.unexpectedErrorHandler = function(e) {
        setTimeout(() => {
          if (e.stack) {
            throw new Error(e.message + "\n\n" + e.stack);
          }
          throw e;
        }, 0);
      };
    }
    emit(e) {
      this.listeners.forEach((listener) => {
        listener(e);
      });
    }
    onUnexpectedError(e) {
      this.unexpectedErrorHandler(e);
      this.emit(e);
    }
    onUnexpectedExternalError(e) {
      this.unexpectedErrorHandler(e);
    }
  };
  var errorHandler = new ErrorHandler();
  function onUnexpectedError(e) {
    if (!isPromiseCanceledError(e)) {
      errorHandler.onUnexpectedError(e);
    }
    return void 0;
  }
  function transformErrorForSerialization(error) {
    if (error instanceof Error) {
      let {name, message} = error;
      const stack = error.stacktrace || error.stack;
      return {
        $isError: true,
        name,
        message,
        stack
      };
    }
    return error;
  }
  var canceledName = "Canceled";
  function isPromiseCanceledError(error) {
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
  }

  // node_modules/monaco-editor/esm/vs/base/common/iterator.js
  var Iterable;
  (function(Iterable2) {
    function is(thing) {
      return thing && typeof thing === "object" && typeof thing[Symbol.iterator] === "function";
    }
    Iterable2.is = is;
    const _empty2 = Object.freeze([]);
    function empty() {
      return _empty2;
    }
    Iterable2.empty = empty;
    function* single(element) {
      yield element;
    }
    Iterable2.single = single;
    function from(iterable) {
      return iterable || _empty2;
    }
    Iterable2.from = from;
    function isEmpty(iterable) {
      return !iterable || iterable[Symbol.iterator]().next().done === true;
    }
    Iterable2.isEmpty = isEmpty;
    function first(iterable) {
      return iterable[Symbol.iterator]().next().value;
    }
    Iterable2.first = first;
    function some(iterable, predicate) {
      for (const element of iterable) {
        if (predicate(element)) {
          return true;
        }
      }
      return false;
    }
    Iterable2.some = some;
    function find(iterable, predicate) {
      for (const element of iterable) {
        if (predicate(element)) {
          return element;
        }
      }
      return void 0;
    }
    Iterable2.find = find;
    function* filter(iterable, predicate) {
      for (const element of iterable) {
        if (predicate(element)) {
          yield element;
        }
      }
    }
    Iterable2.filter = filter;
    function* map(iterable, fn) {
      let index = 0;
      for (const element of iterable) {
        yield fn(element, index++);
      }
    }
    Iterable2.map = map;
    function* concat(...iterables) {
      for (const iterable of iterables) {
        for (const element of iterable) {
          yield element;
        }
      }
    }
    Iterable2.concat = concat;
    function* concatNested(iterables) {
      for (const iterable of iterables) {
        for (const element of iterable) {
          yield element;
        }
      }
    }
    Iterable2.concatNested = concatNested;
    function reduce(iterable, reducer, initialValue) {
      let value = initialValue;
      for (const element of iterable) {
        value = reducer(value, element);
      }
      return value;
    }
    Iterable2.reduce = reduce;
    function* slice(arr, from2, to = arr.length) {
      if (from2 < 0) {
        from2 += arr.length;
      }
      if (to < 0) {
        to += arr.length;
      } else if (to > arr.length) {
        to = arr.length;
      }
      for (; from2 < to; from2++) {
        yield arr[from2];
      }
    }
    Iterable2.slice = slice;
    function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
      const consumed = [];
      if (atMost === 0) {
        return [consumed, iterable];
      }
      const iterator = iterable[Symbol.iterator]();
      for (let i = 0; i < atMost; i++) {
        const next = iterator.next();
        if (next.done) {
          return [consumed, Iterable2.empty()];
        }
        consumed.push(next.value);
      }
      return [consumed, {[Symbol.iterator]() {
        return iterator;
      }}];
    }
    Iterable2.consume = consume;
    function equals(a, b, comparator = (at, bt) => at === bt) {
      const ai = a[Symbol.iterator]();
      const bi = b[Symbol.iterator]();
      while (true) {
        const an = ai.next();
        const bn = bi.next();
        if (an.done !== bn.done) {
          return false;
        } else if (an.done) {
          return true;
        } else if (!comparator(an.value, bn.value)) {
          return false;
        }
      }
    }
    Iterable2.equals = equals;
  })(Iterable || (Iterable = {}));

  // node_modules/monaco-editor/esm/vs/base/common/lifecycle.js
  var TRACK_DISPOSABLES = false;
  var disposableTracker = null;
  if (TRACK_DISPOSABLES) {
    const __is_disposable_tracked__ = "__is_disposable_tracked__";
    disposableTracker = new class {
      trackDisposable(x) {
        const stack = new Error("Potentially leaked disposable").stack;
        setTimeout(() => {
          if (!x[__is_disposable_tracked__]) {
            console.log(stack);
          }
        }, 3e3);
      }
      markTracked(x) {
        if (x && x !== Disposable.None) {
          try {
            x[__is_disposable_tracked__] = true;
          } catch (_a2) {
          }
        }
      }
    }();
  }
  function markTracked(x) {
    if (!disposableTracker) {
      return;
    }
    disposableTracker.markTracked(x);
  }
  function trackDisposable(x) {
    if (!disposableTracker) {
      return x;
    }
    disposableTracker.trackDisposable(x);
    return x;
  }
  var MultiDisposeError = class extends Error {
    constructor(errors) {
      super(`Encountered errors while disposing of store. Errors: [${errors.join(", ")}]`);
      this.errors = errors;
    }
  };
  function dispose(arg) {
    if (Iterable.is(arg)) {
      let errors = [];
      for (const d of arg) {
        if (d) {
          markTracked(d);
          try {
            d.dispose();
          } catch (e) {
            errors.push(e);
          }
        }
      }
      if (errors.length === 1) {
        throw errors[0];
      } else if (errors.length > 1) {
        throw new MultiDisposeError(errors);
      }
      return Array.isArray(arg) ? [] : arg;
    } else if (arg) {
      markTracked(arg);
      arg.dispose();
      return arg;
    }
  }
  function combinedDisposable(...disposables) {
    disposables.forEach(markTracked);
    return toDisposable(() => dispose(disposables));
  }
  function toDisposable(fn) {
    const self2 = trackDisposable({
      dispose: () => {
        markTracked(self2);
        fn();
      }
    });
    return self2;
  }
  var DisposableStore = class {
    constructor() {
      this._toDispose = new Set();
      this._isDisposed = false;
    }
    dispose() {
      if (this._isDisposed) {
        return;
      }
      markTracked(this);
      this._isDisposed = true;
      this.clear();
    }
    clear() {
      try {
        dispose(this._toDispose.values());
      } finally {
        this._toDispose.clear();
      }
    }
    add(t) {
      if (!t) {
        return t;
      }
      if (t === this) {
        throw new Error("Cannot register a disposable on itself!");
      }
      markTracked(t);
      if (this._isDisposed) {
        if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
          console.warn(new Error("Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!").stack);
        }
      } else {
        this._toDispose.add(t);
      }
      return t;
    }
  };
  DisposableStore.DISABLE_DISPOSED_WARNING = false;
  var Disposable = class {
    constructor() {
      this._store = new DisposableStore();
      trackDisposable(this);
    }
    dispose() {
      markTracked(this);
      this._store.dispose();
    }
    _register(t) {
      if (t === this) {
        throw new Error("Cannot register a disposable on itself!");
      }
      return this._store.add(t);
    }
  };
  Disposable.None = Object.freeze({dispose() {
  }});

  // node_modules/monaco-editor/esm/vs/base/common/platform.js
  var _a;
  var LANGUAGE_DEFAULT = "en";
  var _isWindows = false;
  var _isMacintosh = false;
  var _isLinux = false;
  var _isLinuxSnap = false;
  var _isNative = false;
  var _isWeb = false;
  var _isIOS = false;
  var _locale = void 0;
  var _language = LANGUAGE_DEFAULT;
  var _translationsConfigFile = void 0;
  var _userAgent = void 0;
  var globals = typeof self === "object" ? self : typeof global === "object" ? global : {};
  var nodeProcess = void 0;
  if (typeof globals.vscode !== "undefined" && typeof globals.vscode.process !== "undefined") {
    nodeProcess = globals.vscode.process;
  } else if (typeof process !== "undefined") {
    nodeProcess = process;
  }
  var isElectronRenderer = typeof ((_a = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.versions) === null || _a === void 0 ? void 0 : _a.electron) === "string" && nodeProcess.type === "renderer";
  var isElectronSandboxed = isElectronRenderer && (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.sandboxed);
  var browserCodeLoadingCacheStrategy = (() => {
    if (isElectronSandboxed) {
      return "bypassHeatCheck";
    }
    const env2 = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.env["VSCODE_BROWSER_CODE_LOADING"];
    if (typeof env2 === "string") {
      if (env2 === "none" || env2 === "code" || env2 === "bypassHeatCheck" || env2 === "bypassHeatCheckAndEagerCompile") {
        return env2;
      }
      return "bypassHeatCheck";
    }
    return void 0;
  })();
  if (typeof navigator === "object" && !isElectronRenderer) {
    _userAgent = navigator.userAgent;
    _isWindows = _userAgent.indexOf("Windows") >= 0;
    _isMacintosh = _userAgent.indexOf("Macintosh") >= 0;
    _isIOS = (_userAgent.indexOf("Macintosh") >= 0 || _userAgent.indexOf("iPad") >= 0 || _userAgent.indexOf("iPhone") >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
    _isLinux = _userAgent.indexOf("Linux") >= 0;
    _isWeb = true;
    _locale = navigator.language;
    _language = _locale;
  } else if (typeof nodeProcess === "object") {
    _isWindows = nodeProcess.platform === "win32";
    _isMacintosh = nodeProcess.platform === "darwin";
    _isLinux = nodeProcess.platform === "linux";
    _isLinuxSnap = _isLinux && !!nodeProcess.env["SNAP"] && !!nodeProcess.env["SNAP_REVISION"];
    _locale = LANGUAGE_DEFAULT;
    _language = LANGUAGE_DEFAULT;
    const rawNlsConfig = nodeProcess.env["VSCODE_NLS_CONFIG"];
    if (rawNlsConfig) {
      try {
        const nlsConfig = JSON.parse(rawNlsConfig);
        const resolved = nlsConfig.availableLanguages["*"];
        _locale = nlsConfig.locale;
        _language = resolved ? resolved : LANGUAGE_DEFAULT;
        _translationsConfigFile = nlsConfig._translationsConfigFile;
      } catch (e) {
      }
    }
    _isNative = true;
  } else {
    console.error("Unable to resolve platform.");
  }
  var _platform = 0;
  if (_isMacintosh) {
    _platform = 1;
  } else if (_isWindows) {
    _platform = 3;
  } else if (_isLinux) {
    _platform = 2;
  }
  var isWindows = _isWindows;
  var isMacintosh = _isMacintosh;
  var setImmediate = function defineSetImmediate() {
    if (globals.setImmediate) {
      return globals.setImmediate.bind(globals);
    }
    if (typeof globals.postMessage === "function" && !globals.importScripts) {
      let pending = [];
      globals.addEventListener("message", (e) => {
        if (e.data && e.data.vscodeSetImmediateId) {
          for (let i = 0, len = pending.length; i < len; i++) {
            const candidate = pending[i];
            if (candidate.id === e.data.vscodeSetImmediateId) {
              pending.splice(i, 1);
              candidate.callback();
              return;
            }
          }
        }
      });
      let lastId = 0;
      return (callback) => {
        const myId = ++lastId;
        pending.push({
          id: myId,
          callback
        });
        globals.postMessage({vscodeSetImmediateId: myId}, "*");
      };
    }
    if (typeof (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.nextTick) === "function") {
      return nodeProcess.nextTick.bind(nodeProcess);
    }
    const _promise = Promise.resolve();
    return (callback) => _promise.then(callback);
  }();

  // node_modules/monaco-editor/esm/vs/base/common/types.js
  function getAllPropertyNames(obj) {
    let res = [];
    let proto = Object.getPrototypeOf(obj);
    while (Object.prototype !== proto) {
      res = res.concat(Object.getOwnPropertyNames(proto));
      proto = Object.getPrototypeOf(proto);
    }
    return res;
  }
  function getAllMethodNames(obj) {
    const methods = [];
    for (const prop of getAllPropertyNames(obj)) {
      if (typeof obj[prop] === "function") {
        methods.push(prop);
      }
    }
    return methods;
  }
  function createProxyObject(methodNames, invoke) {
    const createProxyMethod = (method) => {
      return function() {
        const args = Array.prototype.slice.call(arguments, 0);
        return invoke(method, args);
      };
    };
    let result = {};
    for (const methodName of methodNames) {
      result[methodName] = createProxyMethod(methodName);
    }
    return result;
  }

  // node_modules/monaco-editor/esm/vs/base/common/worker/simpleWorker.js
  var INITIALIZE = "$initialize";
  var SimpleWorkerProtocol = class {
    constructor(handler) {
      this._workerId = -1;
      this._handler = handler;
      this._lastSentReq = 0;
      this._pendingReplies = Object.create(null);
    }
    setWorkerId(workerId) {
      this._workerId = workerId;
    }
    sendMessage(method, args) {
      let req = String(++this._lastSentReq);
      return new Promise((resolve2, reject) => {
        this._pendingReplies[req] = {
          resolve: resolve2,
          reject
        };
        this._send({
          vsWorker: this._workerId,
          req,
          method,
          args
        });
      });
    }
    handleMessage(message) {
      if (!message || !message.vsWorker) {
        return;
      }
      if (this._workerId !== -1 && message.vsWorker !== this._workerId) {
        return;
      }
      this._handleMessage(message);
    }
    _handleMessage(msg) {
      if (msg.seq) {
        let replyMessage = msg;
        if (!this._pendingReplies[replyMessage.seq]) {
          console.warn("Got reply to unknown seq");
          return;
        }
        let reply = this._pendingReplies[replyMessage.seq];
        delete this._pendingReplies[replyMessage.seq];
        if (replyMessage.err) {
          let err = replyMessage.err;
          if (replyMessage.err.$isError) {
            err = new Error();
            err.name = replyMessage.err.name;
            err.message = replyMessage.err.message;
            err.stack = replyMessage.err.stack;
          }
          reply.reject(err);
          return;
        }
        reply.resolve(replyMessage.res);
        return;
      }
      let requestMessage = msg;
      let req = requestMessage.req;
      let result = this._handler.handleMessage(requestMessage.method, requestMessage.args);
      result.then((r) => {
        this._send({
          vsWorker: this._workerId,
          seq: req,
          res: r,
          err: void 0
        });
      }, (e) => {
        if (e.detail instanceof Error) {
          e.detail = transformErrorForSerialization(e.detail);
        }
        this._send({
          vsWorker: this._workerId,
          seq: req,
          res: void 0,
          err: transformErrorForSerialization(e)
        });
      });
    }
    _send(msg) {
      let transfer = [];
      if (msg.req) {
        const m = msg;
        for (let i = 0; i < m.args.length; i++) {
          if (m.args[i] instanceof ArrayBuffer) {
            transfer.push(m.args[i]);
          }
        }
      } else {
        const m = msg;
        if (m.res instanceof ArrayBuffer) {
          transfer.push(m.res);
        }
      }
      this._handler.sendMessage(msg, transfer);
    }
  };
  var SimpleWorkerServer = class {
    constructor(postMessage, requestHandlerFactory) {
      this._requestHandlerFactory = requestHandlerFactory;
      this._requestHandler = null;
      this._protocol = new SimpleWorkerProtocol({
        sendMessage: (msg, transfer) => {
          postMessage(msg, transfer);
        },
        handleMessage: (method, args) => this._handleMessage(method, args)
      });
    }
    onmessage(msg) {
      this._protocol.handleMessage(msg);
    }
    _handleMessage(method, args) {
      if (method === INITIALIZE) {
        return this.initialize(args[0], args[1], args[2], args[3]);
      }
      if (!this._requestHandler || typeof this._requestHandler[method] !== "function") {
        return Promise.reject(new Error("Missing requestHandler or method: " + method));
      }
      try {
        return Promise.resolve(this._requestHandler[method].apply(this._requestHandler, args));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    initialize(workerId, loaderConfig, moduleId, hostMethods) {
      this._protocol.setWorkerId(workerId);
      const proxyMethodRequest = (method, args) => {
        return this._protocol.sendMessage(method, args);
      };
      const hostProxy = createProxyObject(hostMethods, proxyMethodRequest);
      if (this._requestHandlerFactory) {
        this._requestHandler = this._requestHandlerFactory(hostProxy);
        return Promise.resolve(getAllMethodNames(this._requestHandler));
      }
      if (loaderConfig) {
        if (typeof loaderConfig.baseUrl !== "undefined") {
          delete loaderConfig["baseUrl"];
        }
        if (typeof loaderConfig.paths !== "undefined") {
          if (typeof loaderConfig.paths.vs !== "undefined") {
            delete loaderConfig.paths["vs"];
          }
        }
        if (typeof loaderConfig.trustedTypesPolicy !== void 0) {
          delete loaderConfig["trustedTypesPolicy"];
        }
        loaderConfig.catchError = true;
        self.require.config(loaderConfig);
      }
      return new Promise((resolve2, reject) => {
        self.require([moduleId], (module) => {
          this._requestHandler = module.create(hostProxy);
          if (!this._requestHandler) {
            reject(new Error(`No RequestHandler!`));
            return;
          }
          resolve2(getAllMethodNames(this._requestHandler));
        }, reject);
      });
    }
  };

  // node_modules/monaco-editor/esm/vs/base/common/diff/diffChange.js
  var DiffChange = class {
    constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
      this.originalStart = originalStart;
      this.originalLength = originalLength;
      this.modifiedStart = modifiedStart;
      this.modifiedLength = modifiedLength;
    }
    getOriginalEnd() {
      return this.originalStart + this.originalLength;
    }
    getModifiedEnd() {
      return this.modifiedStart + this.modifiedLength;
    }
  };

  // node_modules/monaco-editor/esm/vs/base/common/strings.js
  function splitLines(str) {
    return str.split(/\r\n|\r|\n/);
  }
  function firstNonWhitespaceIndex(str) {
    for (let i = 0, len = str.length; i < len; i++) {
      const chCode = str.charCodeAt(i);
      if (chCode !== 32 && chCode !== 9) {
        return i;
      }
    }
    return -1;
  }
  function lastNonWhitespaceIndex(str, startIndex = str.length - 1) {
    for (let i = startIndex; i >= 0; i--) {
      const chCode = str.charCodeAt(i);
      if (chCode !== 32 && chCode !== 9) {
        return i;
      }
    }
    return -1;
  }
  function isHighSurrogate(charCode) {
    return 55296 <= charCode && charCode <= 56319;
  }
  function isLowSurrogate(charCode) {
    return 56320 <= charCode && charCode <= 57343;
  }
  function computeCodePoint(highSurrogate, lowSurrogate) {
    return (highSurrogate - 55296 << 10) + (lowSurrogate - 56320) + 65536;
  }
  var UTF8_BOM_CHARACTER = String.fromCharCode(65279);
  var GraphemeBreakTree = class {
    constructor() {
      this._data = getGraphemeBreakRawData();
    }
    static getInstance() {
      if (!GraphemeBreakTree._INSTANCE) {
        GraphemeBreakTree._INSTANCE = new GraphemeBreakTree();
      }
      return GraphemeBreakTree._INSTANCE;
    }
    getGraphemeBreakType(codePoint) {
      if (codePoint < 32) {
        if (codePoint === 10) {
          return 3;
        }
        if (codePoint === 13) {
          return 2;
        }
        return 4;
      }
      if (codePoint < 127) {
        return 0;
      }
      const data = this._data;
      const nodeCount = data.length / 3;
      let nodeIndex = 1;
      while (nodeIndex <= nodeCount) {
        if (codePoint < data[3 * nodeIndex]) {
          nodeIndex = 2 * nodeIndex;
        } else if (codePoint > data[3 * nodeIndex + 1]) {
          nodeIndex = 2 * nodeIndex + 1;
        } else {
          return data[3 * nodeIndex + 2];
        }
      }
      return 0;
    }
  };
  GraphemeBreakTree._INSTANCE = null;
  function getGraphemeBreakRawData() {
    return JSON.parse("[0,0,0,51592,51592,11,44424,44424,11,72251,72254,5,7150,7150,7,48008,48008,11,55176,55176,11,128420,128420,14,3276,3277,5,9979,9980,14,46216,46216,11,49800,49800,11,53384,53384,11,70726,70726,5,122915,122916,5,129320,129327,14,2558,2558,5,5906,5908,5,9762,9763,14,43360,43388,8,45320,45320,11,47112,47112,11,48904,48904,11,50696,50696,11,52488,52488,11,54280,54280,11,70082,70083,1,71350,71350,7,73111,73111,5,127892,127893,14,128726,128727,14,129473,129474,14,2027,2035,5,2901,2902,5,3784,3789,5,6754,6754,5,8418,8420,5,9877,9877,14,11088,11088,14,44008,44008,5,44872,44872,11,45768,45768,11,46664,46664,11,47560,47560,11,48456,48456,11,49352,49352,11,50248,50248,11,51144,51144,11,52040,52040,11,52936,52936,11,53832,53832,11,54728,54728,11,69811,69814,5,70459,70460,5,71096,71099,7,71998,71998,5,72874,72880,5,119149,119149,7,127374,127374,14,128335,128335,14,128482,128482,14,128765,128767,14,129399,129400,14,129680,129685,14,1476,1477,5,2377,2380,7,2759,2760,5,3137,3140,7,3458,3459,7,4153,4154,5,6432,6434,5,6978,6978,5,7675,7679,5,9723,9726,14,9823,9823,14,9919,9923,14,10035,10036,14,42736,42737,5,43596,43596,5,44200,44200,11,44648,44648,11,45096,45096,11,45544,45544,11,45992,45992,11,46440,46440,11,46888,46888,11,47336,47336,11,47784,47784,11,48232,48232,11,48680,48680,11,49128,49128,11,49576,49576,11,50024,50024,11,50472,50472,11,50920,50920,11,51368,51368,11,51816,51816,11,52264,52264,11,52712,52712,11,53160,53160,11,53608,53608,11,54056,54056,11,54504,54504,11,54952,54952,11,68108,68111,5,69933,69940,5,70197,70197,7,70498,70499,7,70845,70845,5,71229,71229,5,71727,71735,5,72154,72155,5,72344,72345,5,73023,73029,5,94095,94098,5,121403,121452,5,126981,127182,14,127538,127546,14,127990,127990,14,128391,128391,14,128445,128449,14,128500,128505,14,128752,128752,14,129160,129167,14,129356,129356,14,129432,129442,14,129648,129651,14,129751,131069,14,173,173,4,1757,1757,1,2274,2274,1,2494,2494,5,2641,2641,5,2876,2876,5,3014,3016,7,3262,3262,7,3393,3396,5,3570,3571,7,3968,3972,5,4228,4228,7,6086,6086,5,6679,6680,5,6912,6915,5,7080,7081,5,7380,7392,5,8252,8252,14,9096,9096,14,9748,9749,14,9784,9786,14,9833,9850,14,9890,9894,14,9938,9938,14,9999,9999,14,10085,10087,14,12349,12349,14,43136,43137,7,43454,43456,7,43755,43755,7,44088,44088,11,44312,44312,11,44536,44536,11,44760,44760,11,44984,44984,11,45208,45208,11,45432,45432,11,45656,45656,11,45880,45880,11,46104,46104,11,46328,46328,11,46552,46552,11,46776,46776,11,47000,47000,11,47224,47224,11,47448,47448,11,47672,47672,11,47896,47896,11,48120,48120,11,48344,48344,11,48568,48568,11,48792,48792,11,49016,49016,11,49240,49240,11,49464,49464,11,49688,49688,11,49912,49912,11,50136,50136,11,50360,50360,11,50584,50584,11,50808,50808,11,51032,51032,11,51256,51256,11,51480,51480,11,51704,51704,11,51928,51928,11,52152,52152,11,52376,52376,11,52600,52600,11,52824,52824,11,53048,53048,11,53272,53272,11,53496,53496,11,53720,53720,11,53944,53944,11,54168,54168,11,54392,54392,11,54616,54616,11,54840,54840,11,55064,55064,11,65438,65439,5,69633,69633,5,69837,69837,1,70018,70018,7,70188,70190,7,70368,70370,7,70465,70468,7,70712,70719,5,70835,70840,5,70850,70851,5,71132,71133,5,71340,71340,7,71458,71461,5,71985,71989,7,72002,72002,7,72193,72202,5,72281,72283,5,72766,72766,7,72885,72886,5,73104,73105,5,92912,92916,5,113824,113827,4,119173,119179,5,121505,121519,5,125136,125142,5,127279,127279,14,127489,127490,14,127570,127743,14,127900,127901,14,128254,128254,14,128369,128370,14,128400,128400,14,128425,128432,14,128468,128475,14,128489,128494,14,128715,128720,14,128745,128745,14,128759,128760,14,129004,129023,14,129296,129304,14,129340,129342,14,129388,129392,14,129404,129407,14,129454,129455,14,129485,129487,14,129659,129663,14,129719,129727,14,917536,917631,5,13,13,2,1160,1161,5,1564,1564,4,1807,1807,1,2085,2087,5,2363,2363,7,2402,2403,5,2507,2508,7,2622,2624,7,2691,2691,7,2786,2787,5,2881,2884,5,3006,3006,5,3072,3072,5,3170,3171,5,3267,3268,7,3330,3331,7,3406,3406,1,3538,3540,5,3655,3662,5,3897,3897,5,4038,4038,5,4184,4185,5,4352,4447,8,6068,6069,5,6155,6157,5,6448,6449,7,6742,6742,5,6783,6783,5,6966,6970,5,7042,7042,7,7143,7143,7,7212,7219,5,7412,7412,5,8206,8207,4,8294,8303,4,8596,8601,14,9410,9410,14,9742,9742,14,9757,9757,14,9770,9770,14,9794,9794,14,9828,9828,14,9855,9855,14,9882,9882,14,9900,9903,14,9929,9933,14,9963,9967,14,9987,9988,14,10006,10006,14,10062,10062,14,10175,10175,14,11744,11775,5,42607,42607,5,43043,43044,7,43263,43263,5,43444,43445,7,43569,43570,5,43698,43700,5,43766,43766,5,44032,44032,11,44144,44144,11,44256,44256,11,44368,44368,11,44480,44480,11,44592,44592,11,44704,44704,11,44816,44816,11,44928,44928,11,45040,45040,11,45152,45152,11,45264,45264,11,45376,45376,11,45488,45488,11,45600,45600,11,45712,45712,11,45824,45824,11,45936,45936,11,46048,46048,11,46160,46160,11,46272,46272,11,46384,46384,11,46496,46496,11,46608,46608,11,46720,46720,11,46832,46832,11,46944,46944,11,47056,47056,11,47168,47168,11,47280,47280,11,47392,47392,11,47504,47504,11,47616,47616,11,47728,47728,11,47840,47840,11,47952,47952,11,48064,48064,11,48176,48176,11,48288,48288,11,48400,48400,11,48512,48512,11,48624,48624,11,48736,48736,11,48848,48848,11,48960,48960,11,49072,49072,11,49184,49184,11,49296,49296,11,49408,49408,11,49520,49520,11,49632,49632,11,49744,49744,11,49856,49856,11,49968,49968,11,50080,50080,11,50192,50192,11,50304,50304,11,50416,50416,11,50528,50528,11,50640,50640,11,50752,50752,11,50864,50864,11,50976,50976,11,51088,51088,11,51200,51200,11,51312,51312,11,51424,51424,11,51536,51536,11,51648,51648,11,51760,51760,11,51872,51872,11,51984,51984,11,52096,52096,11,52208,52208,11,52320,52320,11,52432,52432,11,52544,52544,11,52656,52656,11,52768,52768,11,52880,52880,11,52992,52992,11,53104,53104,11,53216,53216,11,53328,53328,11,53440,53440,11,53552,53552,11,53664,53664,11,53776,53776,11,53888,53888,11,54000,54000,11,54112,54112,11,54224,54224,11,54336,54336,11,54448,54448,11,54560,54560,11,54672,54672,11,54784,54784,11,54896,54896,11,55008,55008,11,55120,55120,11,64286,64286,5,66272,66272,5,68900,68903,5,69762,69762,7,69817,69818,5,69927,69931,5,70003,70003,5,70070,70078,5,70094,70094,7,70194,70195,7,70206,70206,5,70400,70401,5,70463,70463,7,70475,70477,7,70512,70516,5,70722,70724,5,70832,70832,5,70842,70842,5,70847,70848,5,71088,71089,7,71102,71102,7,71219,71226,5,71231,71232,5,71342,71343,7,71453,71455,5,71463,71467,5,71737,71738,5,71995,71996,5,72000,72000,7,72145,72147,7,72160,72160,5,72249,72249,7,72273,72278,5,72330,72342,5,72752,72758,5,72850,72871,5,72882,72883,5,73018,73018,5,73031,73031,5,73109,73109,5,73461,73462,7,94031,94031,5,94192,94193,7,119142,119142,7,119155,119162,4,119362,119364,5,121476,121476,5,122888,122904,5,123184,123190,5,126976,126979,14,127184,127231,14,127344,127345,14,127405,127461,14,127514,127514,14,127561,127567,14,127778,127779,14,127896,127896,14,127985,127986,14,127995,127999,5,128326,128328,14,128360,128366,14,128378,128378,14,128394,128397,14,128405,128406,14,128422,128423,14,128435,128443,14,128453,128464,14,128479,128480,14,128484,128487,14,128496,128498,14,128640,128709,14,128723,128724,14,128736,128741,14,128747,128748,14,128755,128755,14,128762,128762,14,128981,128991,14,129096,129103,14,129292,129292,14,129311,129311,14,129329,129330,14,129344,129349,14,129360,129374,14,129394,129394,14,129402,129402,14,129413,129425,14,129445,129450,14,129466,129471,14,129483,129483,14,129511,129535,14,129653,129655,14,129667,129670,14,129705,129711,14,129731,129743,14,917505,917505,4,917760,917999,5,10,10,3,127,159,4,768,879,5,1471,1471,5,1536,1541,1,1648,1648,5,1767,1768,5,1840,1866,5,2070,2073,5,2137,2139,5,2307,2307,7,2366,2368,7,2382,2383,7,2434,2435,7,2497,2500,5,2519,2519,5,2563,2563,7,2631,2632,5,2677,2677,5,2750,2752,7,2763,2764,7,2817,2817,5,2879,2879,5,2891,2892,7,2914,2915,5,3008,3008,5,3021,3021,5,3076,3076,5,3146,3149,5,3202,3203,7,3264,3265,7,3271,3272,7,3298,3299,5,3390,3390,5,3402,3404,7,3426,3427,5,3535,3535,5,3544,3550,7,3635,3635,7,3763,3763,7,3893,3893,5,3953,3966,5,3981,3991,5,4145,4145,7,4157,4158,5,4209,4212,5,4237,4237,5,4520,4607,10,5970,5971,5,6071,6077,5,6089,6099,5,6277,6278,5,6439,6440,5,6451,6456,7,6683,6683,5,6744,6750,5,6765,6770,7,6846,6846,5,6964,6964,5,6972,6972,5,7019,7027,5,7074,7077,5,7083,7085,5,7146,7148,7,7154,7155,7,7222,7223,5,7394,7400,5,7416,7417,5,8204,8204,5,8233,8233,4,8288,8292,4,8413,8416,5,8482,8482,14,8986,8987,14,9193,9203,14,9654,9654,14,9733,9733,14,9745,9745,14,9752,9752,14,9760,9760,14,9766,9766,14,9774,9775,14,9792,9792,14,9800,9811,14,9825,9826,14,9831,9831,14,9852,9853,14,9872,9873,14,9880,9880,14,9885,9887,14,9896,9897,14,9906,9916,14,9926,9927,14,9936,9936,14,9941,9960,14,9974,9974,14,9982,9985,14,9992,9997,14,10002,10002,14,10017,10017,14,10055,10055,14,10071,10071,14,10145,10145,14,11013,11015,14,11503,11505,5,12334,12335,5,12951,12951,14,42612,42621,5,43014,43014,5,43047,43047,7,43204,43205,5,43335,43345,5,43395,43395,7,43450,43451,7,43561,43566,5,43573,43574,5,43644,43644,5,43710,43711,5,43758,43759,7,44005,44005,5,44012,44012,7,44060,44060,11,44116,44116,11,44172,44172,11,44228,44228,11,44284,44284,11,44340,44340,11,44396,44396,11,44452,44452,11,44508,44508,11,44564,44564,11,44620,44620,11,44676,44676,11,44732,44732,11,44788,44788,11,44844,44844,11,44900,44900,11,44956,44956,11,45012,45012,11,45068,45068,11,45124,45124,11,45180,45180,11,45236,45236,11,45292,45292,11,45348,45348,11,45404,45404,11,45460,45460,11,45516,45516,11,45572,45572,11,45628,45628,11,45684,45684,11,45740,45740,11,45796,45796,11,45852,45852,11,45908,45908,11,45964,45964,11,46020,46020,11,46076,46076,11,46132,46132,11,46188,46188,11,46244,46244,11,46300,46300,11,46356,46356,11,46412,46412,11,46468,46468,11,46524,46524,11,46580,46580,11,46636,46636,11,46692,46692,11,46748,46748,11,46804,46804,11,46860,46860,11,46916,46916,11,46972,46972,11,47028,47028,11,47084,47084,11,47140,47140,11,47196,47196,11,47252,47252,11,47308,47308,11,47364,47364,11,47420,47420,11,47476,47476,11,47532,47532,11,47588,47588,11,47644,47644,11,47700,47700,11,47756,47756,11,47812,47812,11,47868,47868,11,47924,47924,11,47980,47980,11,48036,48036,11,48092,48092,11,48148,48148,11,48204,48204,11,48260,48260,11,48316,48316,11,48372,48372,11,48428,48428,11,48484,48484,11,48540,48540,11,48596,48596,11,48652,48652,11,48708,48708,11,48764,48764,11,48820,48820,11,48876,48876,11,48932,48932,11,48988,48988,11,49044,49044,11,49100,49100,11,49156,49156,11,49212,49212,11,49268,49268,11,49324,49324,11,49380,49380,11,49436,49436,11,49492,49492,11,49548,49548,11,49604,49604,11,49660,49660,11,49716,49716,11,49772,49772,11,49828,49828,11,49884,49884,11,49940,49940,11,49996,49996,11,50052,50052,11,50108,50108,11,50164,50164,11,50220,50220,11,50276,50276,11,50332,50332,11,50388,50388,11,50444,50444,11,50500,50500,11,50556,50556,11,50612,50612,11,50668,50668,11,50724,50724,11,50780,50780,11,50836,50836,11,50892,50892,11,50948,50948,11,51004,51004,11,51060,51060,11,51116,51116,11,51172,51172,11,51228,51228,11,51284,51284,11,51340,51340,11,51396,51396,11,51452,51452,11,51508,51508,11,51564,51564,11,51620,51620,11,51676,51676,11,51732,51732,11,51788,51788,11,51844,51844,11,51900,51900,11,51956,51956,11,52012,52012,11,52068,52068,11,52124,52124,11,52180,52180,11,52236,52236,11,52292,52292,11,52348,52348,11,52404,52404,11,52460,52460,11,52516,52516,11,52572,52572,11,52628,52628,11,52684,52684,11,52740,52740,11,52796,52796,11,52852,52852,11,52908,52908,11,52964,52964,11,53020,53020,11,53076,53076,11,53132,53132,11,53188,53188,11,53244,53244,11,53300,53300,11,53356,53356,11,53412,53412,11,53468,53468,11,53524,53524,11,53580,53580,11,53636,53636,11,53692,53692,11,53748,53748,11,53804,53804,11,53860,53860,11,53916,53916,11,53972,53972,11,54028,54028,11,54084,54084,11,54140,54140,11,54196,54196,11,54252,54252,11,54308,54308,11,54364,54364,11,54420,54420,11,54476,54476,11,54532,54532,11,54588,54588,11,54644,54644,11,54700,54700,11,54756,54756,11,54812,54812,11,54868,54868,11,54924,54924,11,54980,54980,11,55036,55036,11,55092,55092,11,55148,55148,11,55216,55238,9,65056,65071,5,65529,65531,4,68097,68099,5,68159,68159,5,69446,69456,5,69688,69702,5,69808,69810,7,69815,69816,7,69821,69821,1,69888,69890,5,69932,69932,7,69957,69958,7,70016,70017,5,70067,70069,7,70079,70080,7,70089,70092,5,70095,70095,5,70191,70193,5,70196,70196,5,70198,70199,5,70367,70367,5,70371,70378,5,70402,70403,7,70462,70462,5,70464,70464,5,70471,70472,7,70487,70487,5,70502,70508,5,70709,70711,7,70720,70721,7,70725,70725,7,70750,70750,5,70833,70834,7,70841,70841,7,70843,70844,7,70846,70846,7,70849,70849,7,71087,71087,5,71090,71093,5,71100,71101,5,71103,71104,5,71216,71218,7,71227,71228,7,71230,71230,7,71339,71339,5,71341,71341,5,71344,71349,5,71351,71351,5,71456,71457,7,71462,71462,7,71724,71726,7,71736,71736,7,71984,71984,5,71991,71992,7,71997,71997,7,71999,71999,1,72001,72001,1,72003,72003,5,72148,72151,5,72156,72159,7,72164,72164,7,72243,72248,5,72250,72250,1,72263,72263,5,72279,72280,7,72324,72329,1,72343,72343,7,72751,72751,7,72760,72765,5,72767,72767,5,72873,72873,7,72881,72881,7,72884,72884,7,73009,73014,5,73020,73021,5,73030,73030,1,73098,73102,7,73107,73108,7,73110,73110,7,73459,73460,5,78896,78904,4,92976,92982,5,94033,94087,7,94180,94180,5,113821,113822,5,119141,119141,5,119143,119145,5,119150,119154,5,119163,119170,5,119210,119213,5,121344,121398,5,121461,121461,5,121499,121503,5,122880,122886,5,122907,122913,5,122918,122922,5,123628,123631,5,125252,125258,5,126980,126980,14,127183,127183,14,127245,127247,14,127340,127343,14,127358,127359,14,127377,127386,14,127462,127487,6,127491,127503,14,127535,127535,14,127548,127551,14,127568,127569,14,127744,127777,14,127780,127891,14,127894,127895,14,127897,127899,14,127902,127984,14,127987,127989,14,127991,127994,14,128000,128253,14,128255,128317,14,128329,128334,14,128336,128359,14,128367,128368,14,128371,128377,14,128379,128390,14,128392,128393,14,128398,128399,14,128401,128404,14,128407,128419,14,128421,128421,14,128424,128424,14,128433,128434,14,128444,128444,14,128450,128452,14,128465,128467,14,128476,128478,14,128481,128481,14,128483,128483,14,128488,128488,14,128495,128495,14,128499,128499,14,128506,128591,14,128710,128714,14,128721,128722,14,128725,128725,14,128728,128735,14,128742,128744,14,128746,128746,14,128749,128751,14,128753,128754,14,128756,128758,14,128761,128761,14,128763,128764,14,128884,128895,14,128992,129003,14,129036,129039,14,129114,129119,14,129198,129279,14,129293,129295,14,129305,129310,14,129312,129319,14,129328,129328,14,129331,129338,14,129343,129343,14,129351,129355,14,129357,129359,14,129375,129387,14,129393,129393,14,129395,129398,14,129401,129401,14,129403,129403,14,129408,129412,14,129426,129431,14,129443,129444,14,129451,129453,14,129456,129465,14,129472,129472,14,129475,129482,14,129484,129484,14,129488,129510,14,129536,129647,14,129652,129652,14,129656,129658,14,129664,129666,14,129671,129679,14,129686,129704,14,129712,129718,14,129728,129730,14,129744,129750,14,917504,917504,4,917506,917535,4,917632,917759,4,918000,921599,4,0,9,4,11,12,4,14,31,4,169,169,14,174,174,14,1155,1159,5,1425,1469,5,1473,1474,5,1479,1479,5,1552,1562,5,1611,1631,5,1750,1756,5,1759,1764,5,1770,1773,5,1809,1809,5,1958,1968,5,2045,2045,5,2075,2083,5,2089,2093,5,2259,2273,5,2275,2306,5,2362,2362,5,2364,2364,5,2369,2376,5,2381,2381,5,2385,2391,5,2433,2433,5,2492,2492,5,2495,2496,7,2503,2504,7,2509,2509,5,2530,2531,5,2561,2562,5,2620,2620,5,2625,2626,5,2635,2637,5,2672,2673,5,2689,2690,5,2748,2748,5,2753,2757,5,2761,2761,7,2765,2765,5,2810,2815,5,2818,2819,7,2878,2878,5,2880,2880,7,2887,2888,7,2893,2893,5,2903,2903,5,2946,2946,5,3007,3007,7,3009,3010,7,3018,3020,7,3031,3031,5,3073,3075,7,3134,3136,5,3142,3144,5,3157,3158,5,3201,3201,5,3260,3260,5,3263,3263,5,3266,3266,5,3270,3270,5,3274,3275,7,3285,3286,5,3328,3329,5,3387,3388,5,3391,3392,7,3398,3400,7,3405,3405,5,3415,3415,5,3457,3457,5,3530,3530,5,3536,3537,7,3542,3542,5,3551,3551,5,3633,3633,5,3636,3642,5,3761,3761,5,3764,3772,5,3864,3865,5,3895,3895,5,3902,3903,7,3967,3967,7,3974,3975,5,3993,4028,5,4141,4144,5,4146,4151,5,4155,4156,7,4182,4183,7,4190,4192,5,4226,4226,5,4229,4230,5,4253,4253,5,4448,4519,9,4957,4959,5,5938,5940,5,6002,6003,5,6070,6070,7,6078,6085,7,6087,6088,7,6109,6109,5,6158,6158,4,6313,6313,5,6435,6438,7,6441,6443,7,6450,6450,5,6457,6459,5,6681,6682,7,6741,6741,7,6743,6743,7,6752,6752,5,6757,6764,5,6771,6780,5,6832,6845,5,6847,6848,5,6916,6916,7,6965,6965,5,6971,6971,7,6973,6977,7,6979,6980,7,7040,7041,5,7073,7073,7,7078,7079,7,7082,7082,7,7142,7142,5,7144,7145,5,7149,7149,5,7151,7153,5,7204,7211,7,7220,7221,7,7376,7378,5,7393,7393,7,7405,7405,5,7415,7415,7,7616,7673,5,8203,8203,4,8205,8205,13,8232,8232,4,8234,8238,4,8265,8265,14,8293,8293,4,8400,8412,5,8417,8417,5,8421,8432,5,8505,8505,14,8617,8618,14,9000,9000,14,9167,9167,14,9208,9210,14,9642,9643,14,9664,9664,14,9728,9732,14,9735,9741,14,9743,9744,14,9746,9746,14,9750,9751,14,9753,9756,14,9758,9759,14,9761,9761,14,9764,9765,14,9767,9769,14,9771,9773,14,9776,9783,14,9787,9791,14,9793,9793,14,9795,9799,14,9812,9822,14,9824,9824,14,9827,9827,14,9829,9830,14,9832,9832,14,9851,9851,14,9854,9854,14,9856,9861,14,9874,9876,14,9878,9879,14,9881,9881,14,9883,9884,14,9888,9889,14,9895,9895,14,9898,9899,14,9904,9905,14,9917,9918,14,9924,9925,14,9928,9928,14,9934,9935,14,9937,9937,14,9939,9940,14,9961,9962,14,9968,9973,14,9975,9978,14,9981,9981,14,9986,9986,14,9989,9989,14,9998,9998,14,10000,10001,14,10004,10004,14,10013,10013,14,10024,10024,14,10052,10052,14,10060,10060,14,10067,10069,14,10083,10084,14,10133,10135,14,10160,10160,14,10548,10549,14,11035,11036,14,11093,11093,14,11647,11647,5,12330,12333,5,12336,12336,14,12441,12442,5,12953,12953,14,42608,42610,5,42654,42655,5,43010,43010,5,43019,43019,5,43045,43046,5,43052,43052,5,43188,43203,7,43232,43249,5,43302,43309,5,43346,43347,7,43392,43394,5,43443,43443,5,43446,43449,5,43452,43453,5,43493,43493,5,43567,43568,7,43571,43572,7,43587,43587,5,43597,43597,7,43696,43696,5,43703,43704,5,43713,43713,5,43756,43757,5,43765,43765,7,44003,44004,7,44006,44007,7,44009,44010,7,44013,44013,5,44033,44059,12,44061,44087,12,44089,44115,12,44117,44143,12,44145,44171,12,44173,44199,12,44201,44227,12,44229,44255,12,44257,44283,12,44285,44311,12,44313,44339,12,44341,44367,12,44369,44395,12,44397,44423,12,44425,44451,12,44453,44479,12,44481,44507,12,44509,44535,12,44537,44563,12,44565,44591,12,44593,44619,12,44621,44647,12,44649,44675,12,44677,44703,12,44705,44731,12,44733,44759,12,44761,44787,12,44789,44815,12,44817,44843,12,44845,44871,12,44873,44899,12,44901,44927,12,44929,44955,12,44957,44983,12,44985,45011,12,45013,45039,12,45041,45067,12,45069,45095,12,45097,45123,12,45125,45151,12,45153,45179,12,45181,45207,12,45209,45235,12,45237,45263,12,45265,45291,12,45293,45319,12,45321,45347,12,45349,45375,12,45377,45403,12,45405,45431,12,45433,45459,12,45461,45487,12,45489,45515,12,45517,45543,12,45545,45571,12,45573,45599,12,45601,45627,12,45629,45655,12,45657,45683,12,45685,45711,12,45713,45739,12,45741,45767,12,45769,45795,12,45797,45823,12,45825,45851,12,45853,45879,12,45881,45907,12,45909,45935,12,45937,45963,12,45965,45991,12,45993,46019,12,46021,46047,12,46049,46075,12,46077,46103,12,46105,46131,12,46133,46159,12,46161,46187,12,46189,46215,12,46217,46243,12,46245,46271,12,46273,46299,12,46301,46327,12,46329,46355,12,46357,46383,12,46385,46411,12,46413,46439,12,46441,46467,12,46469,46495,12,46497,46523,12,46525,46551,12,46553,46579,12,46581,46607,12,46609,46635,12,46637,46663,12,46665,46691,12,46693,46719,12,46721,46747,12,46749,46775,12,46777,46803,12,46805,46831,12,46833,46859,12,46861,46887,12,46889,46915,12,46917,46943,12,46945,46971,12,46973,46999,12,47001,47027,12,47029,47055,12,47057,47083,12,47085,47111,12,47113,47139,12,47141,47167,12,47169,47195,12,47197,47223,12,47225,47251,12,47253,47279,12,47281,47307,12,47309,47335,12,47337,47363,12,47365,47391,12,47393,47419,12,47421,47447,12,47449,47475,12,47477,47503,12,47505,47531,12,47533,47559,12,47561,47587,12,47589,47615,12,47617,47643,12,47645,47671,12,47673,47699,12,47701,47727,12,47729,47755,12,47757,47783,12,47785,47811,12,47813,47839,12,47841,47867,12,47869,47895,12,47897,47923,12,47925,47951,12,47953,47979,12,47981,48007,12,48009,48035,12,48037,48063,12,48065,48091,12,48093,48119,12,48121,48147,12,48149,48175,12,48177,48203,12,48205,48231,12,48233,48259,12,48261,48287,12,48289,48315,12,48317,48343,12,48345,48371,12,48373,48399,12,48401,48427,12,48429,48455,12,48457,48483,12,48485,48511,12,48513,48539,12,48541,48567,12,48569,48595,12,48597,48623,12,48625,48651,12,48653,48679,12,48681,48707,12,48709,48735,12,48737,48763,12,48765,48791,12,48793,48819,12,48821,48847,12,48849,48875,12,48877,48903,12,48905,48931,12,48933,48959,12,48961,48987,12,48989,49015,12,49017,49043,12,49045,49071,12,49073,49099,12,49101,49127,12,49129,49155,12,49157,49183,12,49185,49211,12,49213,49239,12,49241,49267,12,49269,49295,12,49297,49323,12,49325,49351,12,49353,49379,12,49381,49407,12,49409,49435,12,49437,49463,12,49465,49491,12,49493,49519,12,49521,49547,12,49549,49575,12,49577,49603,12,49605,49631,12,49633,49659,12,49661,49687,12,49689,49715,12,49717,49743,12,49745,49771,12,49773,49799,12,49801,49827,12,49829,49855,12,49857,49883,12,49885,49911,12,49913,49939,12,49941,49967,12,49969,49995,12,49997,50023,12,50025,50051,12,50053,50079,12,50081,50107,12,50109,50135,12,50137,50163,12,50165,50191,12,50193,50219,12,50221,50247,12,50249,50275,12,50277,50303,12,50305,50331,12,50333,50359,12,50361,50387,12,50389,50415,12,50417,50443,12,50445,50471,12,50473,50499,12,50501,50527,12,50529,50555,12,50557,50583,12,50585,50611,12,50613,50639,12,50641,50667,12,50669,50695,12,50697,50723,12,50725,50751,12,50753,50779,12,50781,50807,12,50809,50835,12,50837,50863,12,50865,50891,12,50893,50919,12,50921,50947,12,50949,50975,12,50977,51003,12,51005,51031,12,51033,51059,12,51061,51087,12,51089,51115,12,51117,51143,12,51145,51171,12,51173,51199,12,51201,51227,12,51229,51255,12,51257,51283,12,51285,51311,12,51313,51339,12,51341,51367,12,51369,51395,12,51397,51423,12,51425,51451,12,51453,51479,12,51481,51507,12,51509,51535,12,51537,51563,12,51565,51591,12,51593,51619,12,51621,51647,12,51649,51675,12,51677,51703,12,51705,51731,12,51733,51759,12,51761,51787,12,51789,51815,12,51817,51843,12,51845,51871,12,51873,51899,12,51901,51927,12,51929,51955,12,51957,51983,12,51985,52011,12,52013,52039,12,52041,52067,12,52069,52095,12,52097,52123,12,52125,52151,12,52153,52179,12,52181,52207,12,52209,52235,12,52237,52263,12,52265,52291,12,52293,52319,12,52321,52347,12,52349,52375,12,52377,52403,12,52405,52431,12,52433,52459,12,52461,52487,12,52489,52515,12,52517,52543,12,52545,52571,12,52573,52599,12,52601,52627,12,52629,52655,12,52657,52683,12,52685,52711,12,52713,52739,12,52741,52767,12,52769,52795,12,52797,52823,12,52825,52851,12,52853,52879,12,52881,52907,12,52909,52935,12,52937,52963,12,52965,52991,12,52993,53019,12,53021,53047,12,53049,53075,12,53077,53103,12,53105,53131,12,53133,53159,12,53161,53187,12,53189,53215,12,53217,53243,12,53245,53271,12,53273,53299,12,53301,53327,12,53329,53355,12,53357,53383,12,53385,53411,12,53413,53439,12,53441,53467,12,53469,53495,12,53497,53523,12,53525,53551,12,53553,53579,12,53581,53607,12,53609,53635,12,53637,53663,12,53665,53691,12,53693,53719,12,53721,53747,12,53749,53775,12,53777,53803,12,53805,53831,12,53833,53859,12,53861,53887,12,53889,53915,12,53917,53943,12,53945,53971,12,53973,53999,12,54001,54027,12,54029,54055,12,54057,54083,12,54085,54111,12,54113,54139,12,54141,54167,12,54169,54195,12,54197,54223,12,54225,54251,12,54253,54279,12,54281,54307,12,54309,54335,12,54337,54363,12,54365,54391,12,54393,54419,12,54421,54447,12,54449,54475,12,54477,54503,12,54505,54531,12,54533,54559,12,54561,54587,12,54589,54615,12,54617,54643,12,54645,54671,12,54673,54699,12,54701,54727,12,54729,54755,12,54757,54783,12,54785,54811,12,54813,54839,12,54841,54867,12,54869,54895,12,54897,54923,12,54925,54951,12,54953,54979,12,54981,55007,12,55009,55035,12,55037,55063,12,55065,55091,12,55093,55119,12,55121,55147,12,55149,55175,12,55177,55203,12,55243,55291,10,65024,65039,5,65279,65279,4,65520,65528,4,66045,66045,5,66422,66426,5,68101,68102,5,68152,68154,5,68325,68326,5,69291,69292,5,69632,69632,7,69634,69634,7,69759,69761,5]");
  }

  // node_modules/monaco-editor/esm/vs/base/common/hash.js
  function numberHash(val, initialHashVal) {
    return (initialHashVal << 5) - initialHashVal + val | 0;
  }
  function stringHash(s, hashVal) {
    hashVal = numberHash(149417, hashVal);
    for (let i = 0, length = s.length; i < length; i++) {
      hashVal = numberHash(s.charCodeAt(i), hashVal);
    }
    return hashVal;
  }
  function leftRotate(value, bits, totalBits = 32) {
    const delta = totalBits - bits;
    const mask = ~((1 << delta) - 1);
    return (value << bits | (mask & value) >>> delta) >>> 0;
  }
  function fill(dest, index = 0, count = dest.byteLength, value = 0) {
    for (let i = 0; i < count; i++) {
      dest[index + i] = value;
    }
  }
  function leftPad(value, length, char = "0") {
    while (value.length < length) {
      value = char + value;
    }
    return value;
  }
  function toHexString(bufferOrValue, bitsize = 32) {
    if (bufferOrValue instanceof ArrayBuffer) {
      return Array.from(new Uint8Array(bufferOrValue)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return leftPad((bufferOrValue >>> 0).toString(16), bitsize / 4);
  }
  var StringSHA1 = class {
    constructor() {
      this._h0 = 1732584193;
      this._h1 = 4023233417;
      this._h2 = 2562383102;
      this._h3 = 271733878;
      this._h4 = 3285377520;
      this._buff = new Uint8Array(64 + 3);
      this._buffDV = new DataView(this._buff.buffer);
      this._buffLen = 0;
      this._totalLen = 0;
      this._leftoverHighSurrogate = 0;
      this._finished = false;
    }
    update(str) {
      const strLen = str.length;
      if (strLen === 0) {
        return;
      }
      const buff = this._buff;
      let buffLen = this._buffLen;
      let leftoverHighSurrogate = this._leftoverHighSurrogate;
      let charCode;
      let offset;
      if (leftoverHighSurrogate !== 0) {
        charCode = leftoverHighSurrogate;
        offset = -1;
        leftoverHighSurrogate = 0;
      } else {
        charCode = str.charCodeAt(0);
        offset = 0;
      }
      while (true) {
        let codePoint = charCode;
        if (isHighSurrogate(charCode)) {
          if (offset + 1 < strLen) {
            const nextCharCode = str.charCodeAt(offset + 1);
            if (isLowSurrogate(nextCharCode)) {
              offset++;
              codePoint = computeCodePoint(charCode, nextCharCode);
            } else {
              codePoint = 65533;
            }
          } else {
            leftoverHighSurrogate = charCode;
            break;
          }
        } else if (isLowSurrogate(charCode)) {
          codePoint = 65533;
        }
        buffLen = this._push(buff, buffLen, codePoint);
        offset++;
        if (offset < strLen) {
          charCode = str.charCodeAt(offset);
        } else {
          break;
        }
      }
      this._buffLen = buffLen;
      this._leftoverHighSurrogate = leftoverHighSurrogate;
    }
    _push(buff, buffLen, codePoint) {
      if (codePoint < 128) {
        buff[buffLen++] = codePoint;
      } else if (codePoint < 2048) {
        buff[buffLen++] = 192 | (codePoint & 1984) >>> 6;
        buff[buffLen++] = 128 | (codePoint & 63) >>> 0;
      } else if (codePoint < 65536) {
        buff[buffLen++] = 224 | (codePoint & 61440) >>> 12;
        buff[buffLen++] = 128 | (codePoint & 4032) >>> 6;
        buff[buffLen++] = 128 | (codePoint & 63) >>> 0;
      } else {
        buff[buffLen++] = 240 | (codePoint & 1835008) >>> 18;
        buff[buffLen++] = 128 | (codePoint & 258048) >>> 12;
        buff[buffLen++] = 128 | (codePoint & 4032) >>> 6;
        buff[buffLen++] = 128 | (codePoint & 63) >>> 0;
      }
      if (buffLen >= 64) {
        this._step();
        buffLen -= 64;
        this._totalLen += 64;
        buff[0] = buff[64 + 0];
        buff[1] = buff[64 + 1];
        buff[2] = buff[64 + 2];
      }
      return buffLen;
    }
    digest() {
      if (!this._finished) {
        this._finished = true;
        if (this._leftoverHighSurrogate) {
          this._leftoverHighSurrogate = 0;
          this._buffLen = this._push(this._buff, this._buffLen, 65533);
        }
        this._totalLen += this._buffLen;
        this._wrapUp();
      }
      return toHexString(this._h0) + toHexString(this._h1) + toHexString(this._h2) + toHexString(this._h3) + toHexString(this._h4);
    }
    _wrapUp() {
      this._buff[this._buffLen++] = 128;
      fill(this._buff, this._buffLen);
      if (this._buffLen > 56) {
        this._step();
        fill(this._buff);
      }
      const ml = 8 * this._totalLen;
      this._buffDV.setUint32(56, Math.floor(ml / 4294967296), false);
      this._buffDV.setUint32(60, ml % 4294967296, false);
      this._step();
    }
    _step() {
      const bigBlock32 = StringSHA1._bigBlock32;
      const data = this._buffDV;
      for (let j = 0; j < 64; j += 4) {
        bigBlock32.setUint32(j, data.getUint32(j, false), false);
      }
      for (let j = 64; j < 320; j += 4) {
        bigBlock32.setUint32(j, leftRotate(bigBlock32.getUint32(j - 12, false) ^ bigBlock32.getUint32(j - 32, false) ^ bigBlock32.getUint32(j - 56, false) ^ bigBlock32.getUint32(j - 64, false), 1), false);
      }
      let a = this._h0;
      let b = this._h1;
      let c = this._h2;
      let d = this._h3;
      let e = this._h4;
      let f, k;
      let temp;
      for (let j = 0; j < 80; j++) {
        if (j < 20) {
          f = b & c | ~b & d;
          k = 1518500249;
        } else if (j < 40) {
          f = b ^ c ^ d;
          k = 1859775393;
        } else if (j < 60) {
          f = b & c | b & d | c & d;
          k = 2400959708;
        } else {
          f = b ^ c ^ d;
          k = 3395469782;
        }
        temp = leftRotate(a, 5) + f + e + k + bigBlock32.getUint32(j * 4, false) & 4294967295;
        e = d;
        d = c;
        c = leftRotate(b, 30);
        b = a;
        a = temp;
      }
      this._h0 = this._h0 + a & 4294967295;
      this._h1 = this._h1 + b & 4294967295;
      this._h2 = this._h2 + c & 4294967295;
      this._h3 = this._h3 + d & 4294967295;
      this._h4 = this._h4 + e & 4294967295;
    }
  };
  StringSHA1._bigBlock32 = new DataView(new ArrayBuffer(320));

  // node_modules/monaco-editor/esm/vs/base/common/diff/diff.js
  var StringDiffSequence = class {
    constructor(source) {
      this.source = source;
    }
    getElements() {
      const source = this.source;
      const characters = new Int32Array(source.length);
      for (let i = 0, len = source.length; i < len; i++) {
        characters[i] = source.charCodeAt(i);
      }
      return characters;
    }
  };
  function stringDiff(original, modified, pretty) {
    return new LcsDiff(new StringDiffSequence(original), new StringDiffSequence(modified)).ComputeDiff(pretty).changes;
  }
  var Debug = class {
    static Assert(condition, message) {
      if (!condition) {
        throw new Error(message);
      }
    }
  };
  var MyArray = class {
    static Copy(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
      for (let i = 0; i < length; i++) {
        destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
      }
    }
    static Copy2(sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
      for (let i = 0; i < length; i++) {
        destinationArray[destinationIndex + i] = sourceArray[sourceIndex + i];
      }
    }
  };
  var DiffChangeHelper = class {
    constructor() {
      this.m_changes = [];
      this.m_originalStart = 1073741824;
      this.m_modifiedStart = 1073741824;
      this.m_originalCount = 0;
      this.m_modifiedCount = 0;
    }
    MarkNextChange() {
      if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
        this.m_changes.push(new DiffChange(this.m_originalStart, this.m_originalCount, this.m_modifiedStart, this.m_modifiedCount));
      }
      this.m_originalCount = 0;
      this.m_modifiedCount = 0;
      this.m_originalStart = 1073741824;
      this.m_modifiedStart = 1073741824;
    }
    AddOriginalElement(originalIndex, modifiedIndex) {
      this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
      this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
      this.m_originalCount++;
    }
    AddModifiedElement(originalIndex, modifiedIndex) {
      this.m_originalStart = Math.min(this.m_originalStart, originalIndex);
      this.m_modifiedStart = Math.min(this.m_modifiedStart, modifiedIndex);
      this.m_modifiedCount++;
    }
    getChanges() {
      if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
        this.MarkNextChange();
      }
      return this.m_changes;
    }
    getReverseChanges() {
      if (this.m_originalCount > 0 || this.m_modifiedCount > 0) {
        this.MarkNextChange();
      }
      this.m_changes.reverse();
      return this.m_changes;
    }
  };
  var LcsDiff = class {
    constructor(originalSequence, modifiedSequence, continueProcessingPredicate = null) {
      this.ContinueProcessingPredicate = continueProcessingPredicate;
      const [originalStringElements, originalElementsOrHash, originalHasStrings] = LcsDiff._getElements(originalSequence);
      const [modifiedStringElements, modifiedElementsOrHash, modifiedHasStrings] = LcsDiff._getElements(modifiedSequence);
      this._hasStrings = originalHasStrings && modifiedHasStrings;
      this._originalStringElements = originalStringElements;
      this._originalElementsOrHash = originalElementsOrHash;
      this._modifiedStringElements = modifiedStringElements;
      this._modifiedElementsOrHash = modifiedElementsOrHash;
      this.m_forwardHistory = [];
      this.m_reverseHistory = [];
    }
    static _isStringArray(arr) {
      return arr.length > 0 && typeof arr[0] === "string";
    }
    static _getElements(sequence) {
      const elements = sequence.getElements();
      if (LcsDiff._isStringArray(elements)) {
        const hashes = new Int32Array(elements.length);
        for (let i = 0, len = elements.length; i < len; i++) {
          hashes[i] = stringHash(elements[i], 0);
        }
        return [elements, hashes, true];
      }
      if (elements instanceof Int32Array) {
        return [[], elements, false];
      }
      return [[], new Int32Array(elements), false];
    }
    ElementsAreEqual(originalIndex, newIndex) {
      if (this._originalElementsOrHash[originalIndex] !== this._modifiedElementsOrHash[newIndex]) {
        return false;
      }
      return this._hasStrings ? this._originalStringElements[originalIndex] === this._modifiedStringElements[newIndex] : true;
    }
    OriginalElementsAreEqual(index1, index2) {
      if (this._originalElementsOrHash[index1] !== this._originalElementsOrHash[index2]) {
        return false;
      }
      return this._hasStrings ? this._originalStringElements[index1] === this._originalStringElements[index2] : true;
    }
    ModifiedElementsAreEqual(index1, index2) {
      if (this._modifiedElementsOrHash[index1] !== this._modifiedElementsOrHash[index2]) {
        return false;
      }
      return this._hasStrings ? this._modifiedStringElements[index1] === this._modifiedStringElements[index2] : true;
    }
    ComputeDiff(pretty) {
      return this._ComputeDiff(0, this._originalElementsOrHash.length - 1, 0, this._modifiedElementsOrHash.length - 1, pretty);
    }
    _ComputeDiff(originalStart, originalEnd, modifiedStart, modifiedEnd, pretty) {
      const quitEarlyArr = [false];
      let changes = this.ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr);
      if (pretty) {
        changes = this.PrettifyChanges(changes);
      }
      return {
        quitEarly: quitEarlyArr[0],
        changes
      };
    }
    ComputeDiffRecursive(originalStart, originalEnd, modifiedStart, modifiedEnd, quitEarlyArr) {
      quitEarlyArr[0] = false;
      while (originalStart <= originalEnd && modifiedStart <= modifiedEnd && this.ElementsAreEqual(originalStart, modifiedStart)) {
        originalStart++;
        modifiedStart++;
      }
      while (originalEnd >= originalStart && modifiedEnd >= modifiedStart && this.ElementsAreEqual(originalEnd, modifiedEnd)) {
        originalEnd--;
        modifiedEnd--;
      }
      if (originalStart > originalEnd || modifiedStart > modifiedEnd) {
        let changes;
        if (modifiedStart <= modifiedEnd) {
          Debug.Assert(originalStart === originalEnd + 1, "originalStart should only be one more than originalEnd");
          changes = [
            new DiffChange(originalStart, 0, modifiedStart, modifiedEnd - modifiedStart + 1)
          ];
        } else if (originalStart <= originalEnd) {
          Debug.Assert(modifiedStart === modifiedEnd + 1, "modifiedStart should only be one more than modifiedEnd");
          changes = [
            new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, 0)
          ];
        } else {
          Debug.Assert(originalStart === originalEnd + 1, "originalStart should only be one more than originalEnd");
          Debug.Assert(modifiedStart === modifiedEnd + 1, "modifiedStart should only be one more than modifiedEnd");
          changes = [];
        }
        return changes;
      }
      const midOriginalArr = [0];
      const midModifiedArr = [0];
      const result = this.ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr);
      const midOriginal = midOriginalArr[0];
      const midModified = midModifiedArr[0];
      if (result !== null) {
        return result;
      } else if (!quitEarlyArr[0]) {
        const leftChanges = this.ComputeDiffRecursive(originalStart, midOriginal, modifiedStart, midModified, quitEarlyArr);
        let rightChanges = [];
        if (!quitEarlyArr[0]) {
          rightChanges = this.ComputeDiffRecursive(midOriginal + 1, originalEnd, midModified + 1, modifiedEnd, quitEarlyArr);
        } else {
          rightChanges = [
            new DiffChange(midOriginal + 1, originalEnd - (midOriginal + 1) + 1, midModified + 1, modifiedEnd - (midModified + 1) + 1)
          ];
        }
        return this.ConcatenateChanges(leftChanges, rightChanges);
      }
      return [
        new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
      ];
    }
    WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr) {
      let forwardChanges = null;
      let reverseChanges = null;
      let changeHelper = new DiffChangeHelper();
      let diagonalMin = diagonalForwardStart;
      let diagonalMax = diagonalForwardEnd;
      let diagonalRelative = midOriginalArr[0] - midModifiedArr[0] - diagonalForwardOffset;
      let lastOriginalIndex = -1073741824;
      let historyIndex = this.m_forwardHistory.length - 1;
      do {
        const diagonal = diagonalRelative + diagonalForwardBase;
        if (diagonal === diagonalMin || diagonal < diagonalMax && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1]) {
          originalIndex = forwardPoints[diagonal + 1];
          modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
          if (originalIndex < lastOriginalIndex) {
            changeHelper.MarkNextChange();
          }
          lastOriginalIndex = originalIndex;
          changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex);
          diagonalRelative = diagonal + 1 - diagonalForwardBase;
        } else {
          originalIndex = forwardPoints[diagonal - 1] + 1;
          modifiedIndex = originalIndex - diagonalRelative - diagonalForwardOffset;
          if (originalIndex < lastOriginalIndex) {
            changeHelper.MarkNextChange();
          }
          lastOriginalIndex = originalIndex - 1;
          changeHelper.AddOriginalElement(originalIndex, modifiedIndex + 1);
          diagonalRelative = diagonal - 1 - diagonalForwardBase;
        }
        if (historyIndex >= 0) {
          forwardPoints = this.m_forwardHistory[historyIndex];
          diagonalForwardBase = forwardPoints[0];
          diagonalMin = 1;
          diagonalMax = forwardPoints.length - 1;
        }
      } while (--historyIndex >= -1);
      forwardChanges = changeHelper.getReverseChanges();
      if (quitEarlyArr[0]) {
        let originalStartPoint = midOriginalArr[0] + 1;
        let modifiedStartPoint = midModifiedArr[0] + 1;
        if (forwardChanges !== null && forwardChanges.length > 0) {
          const lastForwardChange = forwardChanges[forwardChanges.length - 1];
          originalStartPoint = Math.max(originalStartPoint, lastForwardChange.getOriginalEnd());
          modifiedStartPoint = Math.max(modifiedStartPoint, lastForwardChange.getModifiedEnd());
        }
        reverseChanges = [
          new DiffChange(originalStartPoint, originalEnd - originalStartPoint + 1, modifiedStartPoint, modifiedEnd - modifiedStartPoint + 1)
        ];
      } else {
        changeHelper = new DiffChangeHelper();
        diagonalMin = diagonalReverseStart;
        diagonalMax = diagonalReverseEnd;
        diagonalRelative = midOriginalArr[0] - midModifiedArr[0] - diagonalReverseOffset;
        lastOriginalIndex = 1073741824;
        historyIndex = deltaIsEven ? this.m_reverseHistory.length - 1 : this.m_reverseHistory.length - 2;
        do {
          const diagonal = diagonalRelative + diagonalReverseBase;
          if (diagonal === diagonalMin || diagonal < diagonalMax && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1]) {
            originalIndex = reversePoints[diagonal + 1] - 1;
            modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
            if (originalIndex > lastOriginalIndex) {
              changeHelper.MarkNextChange();
            }
            lastOriginalIndex = originalIndex + 1;
            changeHelper.AddOriginalElement(originalIndex + 1, modifiedIndex + 1);
            diagonalRelative = diagonal + 1 - diagonalReverseBase;
          } else {
            originalIndex = reversePoints[diagonal - 1];
            modifiedIndex = originalIndex - diagonalRelative - diagonalReverseOffset;
            if (originalIndex > lastOriginalIndex) {
              changeHelper.MarkNextChange();
            }
            lastOriginalIndex = originalIndex;
            changeHelper.AddModifiedElement(originalIndex + 1, modifiedIndex + 1);
            diagonalRelative = diagonal - 1 - diagonalReverseBase;
          }
          if (historyIndex >= 0) {
            reversePoints = this.m_reverseHistory[historyIndex];
            diagonalReverseBase = reversePoints[0];
            diagonalMin = 1;
            diagonalMax = reversePoints.length - 1;
          }
        } while (--historyIndex >= -1);
        reverseChanges = changeHelper.getChanges();
      }
      return this.ConcatenateChanges(forwardChanges, reverseChanges);
    }
    ComputeRecursionPoint(originalStart, originalEnd, modifiedStart, modifiedEnd, midOriginalArr, midModifiedArr, quitEarlyArr) {
      let originalIndex = 0, modifiedIndex = 0;
      let diagonalForwardStart = 0, diagonalForwardEnd = 0;
      let diagonalReverseStart = 0, diagonalReverseEnd = 0;
      originalStart--;
      modifiedStart--;
      midOriginalArr[0] = 0;
      midModifiedArr[0] = 0;
      this.m_forwardHistory = [];
      this.m_reverseHistory = [];
      const maxDifferences = originalEnd - originalStart + (modifiedEnd - modifiedStart);
      const numDiagonals = maxDifferences + 1;
      const forwardPoints = new Int32Array(numDiagonals);
      const reversePoints = new Int32Array(numDiagonals);
      const diagonalForwardBase = modifiedEnd - modifiedStart;
      const diagonalReverseBase = originalEnd - originalStart;
      const diagonalForwardOffset = originalStart - modifiedStart;
      const diagonalReverseOffset = originalEnd - modifiedEnd;
      const delta = diagonalReverseBase - diagonalForwardBase;
      const deltaIsEven = delta % 2 === 0;
      forwardPoints[diagonalForwardBase] = originalStart;
      reversePoints[diagonalReverseBase] = originalEnd;
      quitEarlyArr[0] = false;
      for (let numDifferences = 1; numDifferences <= maxDifferences / 2 + 1; numDifferences++) {
        let furthestOriginalIndex = 0;
        let furthestModifiedIndex = 0;
        diagonalForwardStart = this.ClipDiagonalBound(diagonalForwardBase - numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
        diagonalForwardEnd = this.ClipDiagonalBound(diagonalForwardBase + numDifferences, numDifferences, diagonalForwardBase, numDiagonals);
        for (let diagonal = diagonalForwardStart; diagonal <= diagonalForwardEnd; diagonal += 2) {
          if (diagonal === diagonalForwardStart || diagonal < diagonalForwardEnd && forwardPoints[diagonal - 1] < forwardPoints[diagonal + 1]) {
            originalIndex = forwardPoints[diagonal + 1];
          } else {
            originalIndex = forwardPoints[diagonal - 1] + 1;
          }
          modifiedIndex = originalIndex - (diagonal - diagonalForwardBase) - diagonalForwardOffset;
          const tempOriginalIndex = originalIndex;
          while (originalIndex < originalEnd && modifiedIndex < modifiedEnd && this.ElementsAreEqual(originalIndex + 1, modifiedIndex + 1)) {
            originalIndex++;
            modifiedIndex++;
          }
          forwardPoints[diagonal] = originalIndex;
          if (originalIndex + modifiedIndex > furthestOriginalIndex + furthestModifiedIndex) {
            furthestOriginalIndex = originalIndex;
            furthestModifiedIndex = modifiedIndex;
          }
          if (!deltaIsEven && Math.abs(diagonal - diagonalReverseBase) <= numDifferences - 1) {
            if (originalIndex >= reversePoints[diagonal]) {
              midOriginalArr[0] = originalIndex;
              midModifiedArr[0] = modifiedIndex;
              if (tempOriginalIndex <= reversePoints[diagonal] && 1447 > 0 && numDifferences <= 1447 + 1) {
                return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
              } else {
                return null;
              }
            }
          }
        }
        const matchLengthOfLongest = (furthestOriginalIndex - originalStart + (furthestModifiedIndex - modifiedStart) - numDifferences) / 2;
        if (this.ContinueProcessingPredicate !== null && !this.ContinueProcessingPredicate(furthestOriginalIndex, matchLengthOfLongest)) {
          quitEarlyArr[0] = true;
          midOriginalArr[0] = furthestOriginalIndex;
          midModifiedArr[0] = furthestModifiedIndex;
          if (matchLengthOfLongest > 0 && 1447 > 0 && numDifferences <= 1447 + 1) {
            return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
          } else {
            originalStart++;
            modifiedStart++;
            return [
              new DiffChange(originalStart, originalEnd - originalStart + 1, modifiedStart, modifiedEnd - modifiedStart + 1)
            ];
          }
        }
        diagonalReverseStart = this.ClipDiagonalBound(diagonalReverseBase - numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
        diagonalReverseEnd = this.ClipDiagonalBound(diagonalReverseBase + numDifferences, numDifferences, diagonalReverseBase, numDiagonals);
        for (let diagonal = diagonalReverseStart; diagonal <= diagonalReverseEnd; diagonal += 2) {
          if (diagonal === diagonalReverseStart || diagonal < diagonalReverseEnd && reversePoints[diagonal - 1] >= reversePoints[diagonal + 1]) {
            originalIndex = reversePoints[diagonal + 1] - 1;
          } else {
            originalIndex = reversePoints[diagonal - 1];
          }
          modifiedIndex = originalIndex - (diagonal - diagonalReverseBase) - diagonalReverseOffset;
          const tempOriginalIndex = originalIndex;
          while (originalIndex > originalStart && modifiedIndex > modifiedStart && this.ElementsAreEqual(originalIndex, modifiedIndex)) {
            originalIndex--;
            modifiedIndex--;
          }
          reversePoints[diagonal] = originalIndex;
          if (deltaIsEven && Math.abs(diagonal - diagonalForwardBase) <= numDifferences) {
            if (originalIndex <= forwardPoints[diagonal]) {
              midOriginalArr[0] = originalIndex;
              midModifiedArr[0] = modifiedIndex;
              if (tempOriginalIndex >= forwardPoints[diagonal] && 1447 > 0 && numDifferences <= 1447 + 1) {
                return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
              } else {
                return null;
              }
            }
          }
        }
        if (numDifferences <= 1447) {
          let temp = new Int32Array(diagonalForwardEnd - diagonalForwardStart + 2);
          temp[0] = diagonalForwardBase - diagonalForwardStart + 1;
          MyArray.Copy2(forwardPoints, diagonalForwardStart, temp, 1, diagonalForwardEnd - diagonalForwardStart + 1);
          this.m_forwardHistory.push(temp);
          temp = new Int32Array(diagonalReverseEnd - diagonalReverseStart + 2);
          temp[0] = diagonalReverseBase - diagonalReverseStart + 1;
          MyArray.Copy2(reversePoints, diagonalReverseStart, temp, 1, diagonalReverseEnd - diagonalReverseStart + 1);
          this.m_reverseHistory.push(temp);
        }
      }
      return this.WALKTRACE(diagonalForwardBase, diagonalForwardStart, diagonalForwardEnd, diagonalForwardOffset, diagonalReverseBase, diagonalReverseStart, diagonalReverseEnd, diagonalReverseOffset, forwardPoints, reversePoints, originalIndex, originalEnd, midOriginalArr, modifiedIndex, modifiedEnd, midModifiedArr, deltaIsEven, quitEarlyArr);
    }
    PrettifyChanges(changes) {
      for (let i = 0; i < changes.length; i++) {
        const change = changes[i];
        const originalStop = i < changes.length - 1 ? changes[i + 1].originalStart : this._originalElementsOrHash.length;
        const modifiedStop = i < changes.length - 1 ? changes[i + 1].modifiedStart : this._modifiedElementsOrHash.length;
        const checkOriginal = change.originalLength > 0;
        const checkModified = change.modifiedLength > 0;
        while (change.originalStart + change.originalLength < originalStop && change.modifiedStart + change.modifiedLength < modifiedStop && (!checkOriginal || this.OriginalElementsAreEqual(change.originalStart, change.originalStart + change.originalLength)) && (!checkModified || this.ModifiedElementsAreEqual(change.modifiedStart, change.modifiedStart + change.modifiedLength))) {
          change.originalStart++;
          change.modifiedStart++;
        }
        let mergedChangeArr = [null];
        if (i < changes.length - 1 && this.ChangesOverlap(changes[i], changes[i + 1], mergedChangeArr)) {
          changes[i] = mergedChangeArr[0];
          changes.splice(i + 1, 1);
          i--;
          continue;
        }
      }
      for (let i = changes.length - 1; i >= 0; i--) {
        const change = changes[i];
        let originalStop = 0;
        let modifiedStop = 0;
        if (i > 0) {
          const prevChange = changes[i - 1];
          originalStop = prevChange.originalStart + prevChange.originalLength;
          modifiedStop = prevChange.modifiedStart + prevChange.modifiedLength;
        }
        const checkOriginal = change.originalLength > 0;
        const checkModified = change.modifiedLength > 0;
        let bestDelta = 0;
        let bestScore = this._boundaryScore(change.originalStart, change.originalLength, change.modifiedStart, change.modifiedLength);
        for (let delta = 1; ; delta++) {
          const originalStart = change.originalStart - delta;
          const modifiedStart = change.modifiedStart - delta;
          if (originalStart < originalStop || modifiedStart < modifiedStop) {
            break;
          }
          if (checkOriginal && !this.OriginalElementsAreEqual(originalStart, originalStart + change.originalLength)) {
            break;
          }
          if (checkModified && !this.ModifiedElementsAreEqual(modifiedStart, modifiedStart + change.modifiedLength)) {
            break;
          }
          const touchingPreviousChange = originalStart === originalStop && modifiedStart === modifiedStop;
          const score = (touchingPreviousChange ? 5 : 0) + this._boundaryScore(originalStart, change.originalLength, modifiedStart, change.modifiedLength);
          if (score > bestScore) {
            bestScore = score;
            bestDelta = delta;
          }
        }
        change.originalStart -= bestDelta;
        change.modifiedStart -= bestDelta;
        const mergedChangeArr = [null];
        if (i > 0 && this.ChangesOverlap(changes[i - 1], changes[i], mergedChangeArr)) {
          changes[i - 1] = mergedChangeArr[0];
          changes.splice(i, 1);
          i++;
          continue;
        }
      }
      if (this._hasStrings) {
        for (let i = 1, len = changes.length; i < len; i++) {
          const aChange = changes[i - 1];
          const bChange = changes[i];
          const matchedLength = bChange.originalStart - aChange.originalStart - aChange.originalLength;
          const aOriginalStart = aChange.originalStart;
          const bOriginalEnd = bChange.originalStart + bChange.originalLength;
          const abOriginalLength = bOriginalEnd - aOriginalStart;
          const aModifiedStart = aChange.modifiedStart;
          const bModifiedEnd = bChange.modifiedStart + bChange.modifiedLength;
          const abModifiedLength = bModifiedEnd - aModifiedStart;
          if (matchedLength < 5 && abOriginalLength < 20 && abModifiedLength < 20) {
            const t = this._findBetterContiguousSequence(aOriginalStart, abOriginalLength, aModifiedStart, abModifiedLength, matchedLength);
            if (t) {
              const [originalMatchStart, modifiedMatchStart] = t;
              if (originalMatchStart !== aChange.originalStart + aChange.originalLength || modifiedMatchStart !== aChange.modifiedStart + aChange.modifiedLength) {
                aChange.originalLength = originalMatchStart - aChange.originalStart;
                aChange.modifiedLength = modifiedMatchStart - aChange.modifiedStart;
                bChange.originalStart = originalMatchStart + matchedLength;
                bChange.modifiedStart = modifiedMatchStart + matchedLength;
                bChange.originalLength = bOriginalEnd - bChange.originalStart;
                bChange.modifiedLength = bModifiedEnd - bChange.modifiedStart;
              }
            }
          }
        }
      }
      return changes;
    }
    _findBetterContiguousSequence(originalStart, originalLength, modifiedStart, modifiedLength, desiredLength) {
      if (originalLength < desiredLength || modifiedLength < desiredLength) {
        return null;
      }
      const originalMax = originalStart + originalLength - desiredLength + 1;
      const modifiedMax = modifiedStart + modifiedLength - desiredLength + 1;
      let bestScore = 0;
      let bestOriginalStart = 0;
      let bestModifiedStart = 0;
      for (let i = originalStart; i < originalMax; i++) {
        for (let j = modifiedStart; j < modifiedMax; j++) {
          const score = this._contiguousSequenceScore(i, j, desiredLength);
          if (score > 0 && score > bestScore) {
            bestScore = score;
            bestOriginalStart = i;
            bestModifiedStart = j;
          }
        }
      }
      if (bestScore > 0) {
        return [bestOriginalStart, bestModifiedStart];
      }
      return null;
    }
    _contiguousSequenceScore(originalStart, modifiedStart, length) {
      let score = 0;
      for (let l = 0; l < length; l++) {
        if (!this.ElementsAreEqual(originalStart + l, modifiedStart + l)) {
          return 0;
        }
        score += this._originalStringElements[originalStart + l].length;
      }
      return score;
    }
    _OriginalIsBoundary(index) {
      if (index <= 0 || index >= this._originalElementsOrHash.length - 1) {
        return true;
      }
      return this._hasStrings && /^\s*$/.test(this._originalStringElements[index]);
    }
    _OriginalRegionIsBoundary(originalStart, originalLength) {
      if (this._OriginalIsBoundary(originalStart) || this._OriginalIsBoundary(originalStart - 1)) {
        return true;
      }
      if (originalLength > 0) {
        const originalEnd = originalStart + originalLength;
        if (this._OriginalIsBoundary(originalEnd - 1) || this._OriginalIsBoundary(originalEnd)) {
          return true;
        }
      }
      return false;
    }
    _ModifiedIsBoundary(index) {
      if (index <= 0 || index >= this._modifiedElementsOrHash.length - 1) {
        return true;
      }
      return this._hasStrings && /^\s*$/.test(this._modifiedStringElements[index]);
    }
    _ModifiedRegionIsBoundary(modifiedStart, modifiedLength) {
      if (this._ModifiedIsBoundary(modifiedStart) || this._ModifiedIsBoundary(modifiedStart - 1)) {
        return true;
      }
      if (modifiedLength > 0) {
        const modifiedEnd = modifiedStart + modifiedLength;
        if (this._ModifiedIsBoundary(modifiedEnd - 1) || this._ModifiedIsBoundary(modifiedEnd)) {
          return true;
        }
      }
      return false;
    }
    _boundaryScore(originalStart, originalLength, modifiedStart, modifiedLength) {
      const originalScore = this._OriginalRegionIsBoundary(originalStart, originalLength) ? 1 : 0;
      const modifiedScore = this._ModifiedRegionIsBoundary(modifiedStart, modifiedLength) ? 1 : 0;
      return originalScore + modifiedScore;
    }
    ConcatenateChanges(left, right) {
      let mergedChangeArr = [];
      if (left.length === 0 || right.length === 0) {
        return right.length > 0 ? right : left;
      } else if (this.ChangesOverlap(left[left.length - 1], right[0], mergedChangeArr)) {
        const result = new Array(left.length + right.length - 1);
        MyArray.Copy(left, 0, result, 0, left.length - 1);
        result[left.length - 1] = mergedChangeArr[0];
        MyArray.Copy(right, 1, result, left.length, right.length - 1);
        return result;
      } else {
        const result = new Array(left.length + right.length);
        MyArray.Copy(left, 0, result, 0, left.length);
        MyArray.Copy(right, 0, result, left.length, right.length);
        return result;
      }
    }
    ChangesOverlap(left, right, mergedChangeArr) {
      Debug.Assert(left.originalStart <= right.originalStart, "Left change is not less than or equal to right change");
      Debug.Assert(left.modifiedStart <= right.modifiedStart, "Left change is not less than or equal to right change");
      if (left.originalStart + left.originalLength >= right.originalStart || left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
        const originalStart = left.originalStart;
        let originalLength = left.originalLength;
        const modifiedStart = left.modifiedStart;
        let modifiedLength = left.modifiedLength;
        if (left.originalStart + left.originalLength >= right.originalStart) {
          originalLength = right.originalStart + right.originalLength - left.originalStart;
        }
        if (left.modifiedStart + left.modifiedLength >= right.modifiedStart) {
          modifiedLength = right.modifiedStart + right.modifiedLength - left.modifiedStart;
        }
        mergedChangeArr[0] = new DiffChange(originalStart, originalLength, modifiedStart, modifiedLength);
        return true;
      } else {
        mergedChangeArr[0] = null;
        return false;
      }
    }
    ClipDiagonalBound(diagonal, numDifferences, diagonalBaseIndex, numDiagonals) {
      if (diagonal >= 0 && diagonal < numDiagonals) {
        return diagonal;
      }
      const diagonalsBelow = diagonalBaseIndex;
      const diagonalsAbove = numDiagonals - diagonalBaseIndex - 1;
      const diffEven = numDifferences % 2 === 0;
      if (diagonal < 0) {
        const lowerBoundEven = diagonalsBelow % 2 === 0;
        return diffEven === lowerBoundEven ? 0 : 1;
      } else {
        const upperBoundEven = diagonalsAbove % 2 === 0;
        return diffEven === upperBoundEven ? numDiagonals - 1 : numDiagonals - 2;
      }
    }
  };

  // node_modules/monaco-editor/esm/vs/base/common/process.js
  var safeProcess;
  if (typeof globals.vscode !== "undefined" && typeof globals.vscode.process !== "undefined") {
    const sandboxProcess = globals.vscode.process;
    safeProcess = {
      get platform() {
        return sandboxProcess.platform;
      },
      get env() {
        return sandboxProcess.env;
      },
      cwd() {
        return sandboxProcess.cwd();
      },
      nextTick(callback) {
        return setImmediate(callback);
      }
    };
  } else if (typeof process !== "undefined") {
    safeProcess = {
      get platform() {
        return process.platform;
      },
      get env() {
        return process.env;
      },
      cwd() {
        return process.env["VSCODE_CWD"] || process.cwd();
      },
      nextTick(callback) {
        return process.nextTick(callback);
      }
    };
  } else {
    safeProcess = {
      get platform() {
        return isWindows ? "win32" : isMacintosh ? "darwin" : "linux";
      },
      nextTick(callback) {
        return setImmediate(callback);
      },
      get env() {
        return {};
      },
      cwd() {
        return "/";
      }
    };
  }
  var cwd = safeProcess.cwd;
  var env = safeProcess.env;
  var platform = safeProcess.platform;

  // node_modules/monaco-editor/esm/vs/base/common/path.js
  var CHAR_UPPERCASE_A = 65;
  var CHAR_LOWERCASE_A = 97;
  var CHAR_UPPERCASE_Z = 90;
  var CHAR_LOWERCASE_Z = 122;
  var CHAR_DOT = 46;
  var CHAR_FORWARD_SLASH = 47;
  var CHAR_BACKWARD_SLASH = 92;
  var CHAR_COLON = 58;
  var CHAR_QUESTION_MARK = 63;
  var ErrorInvalidArgType = class extends Error {
    constructor(name, expected, actual) {
      let determiner;
      if (typeof expected === "string" && expected.indexOf("not ") === 0) {
        determiner = "must not be";
        expected = expected.replace(/^not /, "");
      } else {
        determiner = "must be";
      }
      const type = name.indexOf(".") !== -1 ? "property" : "argument";
      let msg = `The "${name}" ${type} ${determiner} of type ${expected}`;
      msg += `. Received type ${typeof actual}`;
      super(msg);
      this.code = "ERR_INVALID_ARG_TYPE";
    }
  };
  function validateString(value, name) {
    if (typeof value !== "string") {
      throw new ErrorInvalidArgType(name, "string", value);
    }
  }
  function isPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
  }
  function isPosixPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH;
  }
  function isWindowsDeviceRoot(code) {
    return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z || code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
  }
  function normalizeString(path, allowAboveRoot, separator, isPathSeparator2) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code = 0;
    for (let i = 0; i <= path.length; ++i) {
      if (i < path.length) {
        code = path.charCodeAt(i);
      } else if (isPathSeparator2(code)) {
        break;
      } else {
        code = CHAR_FORWARD_SLASH;
      }
      if (isPathSeparator2(code)) {
        if (lastSlash === i - 1 || dots === 1) {
        } else if (dots === 2) {
          if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== CHAR_DOT || res.charCodeAt(res.length - 2) !== CHAR_DOT) {
            if (res.length > 2) {
              const lastSlashIndex = res.lastIndexOf(separator);
              if (lastSlashIndex === -1) {
                res = "";
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
              }
              lastSlash = i;
              dots = 0;
              continue;
            } else if (res.length !== 0) {
              res = "";
              lastSegmentLength = 0;
              lastSlash = i;
              dots = 0;
              continue;
            }
          }
          if (allowAboveRoot) {
            res += res.length > 0 ? `${separator}..` : "..";
            lastSegmentLength = 2;
          }
        } else {
          if (res.length > 0) {
            res += `${separator}${path.slice(lastSlash + 1, i)}`;
          } else {
            res = path.slice(lastSlash + 1, i);
          }
          lastSegmentLength = i - lastSlash - 1;
        }
        lastSlash = i;
        dots = 0;
      } else if (code === CHAR_DOT && dots !== -1) {
        ++dots;
      } else {
        dots = -1;
      }
    }
    return res;
  }
  function _format(sep2, pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
      throw new ErrorInvalidArgType("pathObject", "Object", pathObject);
    }
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || `${pathObject.name || ""}${pathObject.ext || ""}`;
    if (!dir) {
      return base;
    }
    return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep2}${base}`;
  }
  var win32 = {
    resolve(...pathSegments) {
      let resolvedDevice = "";
      let resolvedTail = "";
      let resolvedAbsolute = false;
      for (let i = pathSegments.length - 1; i >= -1; i--) {
        let path;
        if (i >= 0) {
          path = pathSegments[i];
          validateString(path, "path");
          if (path.length === 0) {
            continue;
          }
        } else if (resolvedDevice.length === 0) {
          path = cwd();
        } else {
          path = env[`=${resolvedDevice}`] || cwd();
          if (path === void 0 || path.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() && path.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
            path = `${resolvedDevice}\\`;
          }
        }
        const len = path.length;
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len === 1) {
          if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute = true;
          }
        } else if (isPathSeparator(code)) {
          isAbsolute = true;
          if (isPathSeparator(path.charCodeAt(1))) {
            let j = 2;
            let last = j;
            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              const firstPart = path.slice(last, j);
              last = j;
              while (j < len && isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j < len && j !== last) {
                last = j;
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                  j++;
                }
                if (j === len || j !== last) {
                  device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                  rootEnd = j;
                }
              }
            }
          } else {
            rootEnd = 1;
          }
        } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
          device = path.slice(0, 2);
          rootEnd = 2;
          if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
            isAbsolute = true;
            rootEnd = 3;
          }
        }
        if (device.length > 0) {
          if (resolvedDevice.length > 0) {
            if (device.toLowerCase() !== resolvedDevice.toLowerCase()) {
              continue;
            }
          } else {
            resolvedDevice = device;
          }
        }
        if (resolvedAbsolute) {
          if (resolvedDevice.length > 0) {
            break;
          }
        } else {
          resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
          resolvedAbsolute = isAbsolute;
          if (isAbsolute && resolvedDevice.length > 0) {
            break;
          }
        }
      }
      resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
      return resolvedAbsolute ? `${resolvedDevice}\\${resolvedTail}` : `${resolvedDevice}${resolvedTail}` || ".";
    },
    normalize(path) {
      validateString(path, "path");
      const len = path.length;
      if (len === 0) {
        return ".";
      }
      let rootEnd = 0;
      let device;
      let isAbsolute = false;
      const code = path.charCodeAt(0);
      if (len === 1) {
        return isPosixPathSeparator(code) ? "\\" : path;
      }
      if (isPathSeparator(code)) {
        isAbsolute = true;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j = 2;
          let last = j;
          while (j < len && !isPathSeparator(path.charCodeAt(j))) {
            j++;
          }
          if (j < len && j !== last) {
            const firstPart = path.slice(last, j);
            last = j;
            while (j < len && isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j === len) {
                return `\\\\${firstPart}\\${path.slice(last)}\\`;
              }
              if (j !== last) {
                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                rootEnd = j;
              }
            }
          }
        } else {
          rootEnd = 1;
        }
      } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
        device = path.slice(0, 2);
        rootEnd = 2;
        if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
          isAbsolute = true;
          rootEnd = 3;
        }
      }
      let tail = rootEnd < len ? normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator) : "";
      if (tail.length === 0 && !isAbsolute) {
        tail = ".";
      }
      if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
      }
      if (device === void 0) {
        return isAbsolute ? `\\${tail}` : tail;
      }
      return isAbsolute ? `${device}\\${tail}` : `${device}${tail}`;
    },
    isAbsolute(path) {
      validateString(path, "path");
      const len = path.length;
      if (len === 0) {
        return false;
      }
      const code = path.charCodeAt(0);
      return isPathSeparator(code) || len > 2 && isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON && isPathSeparator(path.charCodeAt(2));
    },
    join(...paths2) {
      if (paths2.length === 0) {
        return ".";
      }
      let joined;
      let firstPart;
      for (let i = 0; i < paths2.length; ++i) {
        const arg = paths2[i];
        validateString(arg, "path");
        if (arg.length > 0) {
          if (joined === void 0) {
            joined = firstPart = arg;
          } else {
            joined += `\\${arg}`;
          }
        }
      }
      if (joined === void 0) {
        return ".";
      }
      let needsReplace = true;
      let slashCount = 0;
      if (typeof firstPart === "string" && isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1 && isPathSeparator(firstPart.charCodeAt(1))) {
          ++slashCount;
          if (firstLen > 2) {
            if (isPathSeparator(firstPart.charCodeAt(2))) {
              ++slashCount;
            } else {
              needsReplace = false;
            }
          }
        }
      }
      if (needsReplace) {
        while (slashCount < joined.length && isPathSeparator(joined.charCodeAt(slashCount))) {
          slashCount++;
        }
        if (slashCount >= 2) {
          joined = `\\${joined.slice(slashCount)}`;
        }
      }
      return win32.normalize(joined);
    },
    relative(from, to) {
      validateString(from, "from");
      validateString(to, "to");
      if (from === to) {
        return "";
      }
      const fromOrig = win32.resolve(from);
      const toOrig = win32.resolve(to);
      if (fromOrig === toOrig) {
        return "";
      }
      from = fromOrig.toLowerCase();
      to = toOrig.toLowerCase();
      if (from === to) {
        return "";
      }
      let fromStart = 0;
      while (fromStart < from.length && from.charCodeAt(fromStart) === CHAR_BACKWARD_SLASH) {
        fromStart++;
      }
      let fromEnd = from.length;
      while (fromEnd - 1 > fromStart && from.charCodeAt(fromEnd - 1) === CHAR_BACKWARD_SLASH) {
        fromEnd--;
      }
      const fromLen = fromEnd - fromStart;
      let toStart = 0;
      while (toStart < to.length && to.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
        toStart++;
      }
      let toEnd = to.length;
      while (toEnd - 1 > toStart && to.charCodeAt(toEnd - 1) === CHAR_BACKWARD_SLASH) {
        toEnd--;
      }
      const toLen = toEnd - toStart;
      const length = fromLen < toLen ? fromLen : toLen;
      let lastCommonSep = -1;
      let i = 0;
      for (; i < length; i++) {
        const fromCode = from.charCodeAt(fromStart + i);
        if (fromCode !== to.charCodeAt(toStart + i)) {
          break;
        } else if (fromCode === CHAR_BACKWARD_SLASH) {
          lastCommonSep = i;
        }
      }
      if (i !== length) {
        if (lastCommonSep === -1) {
          return toOrig;
        }
      } else {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
            return toOrig.slice(toStart + i + 1);
          }
          if (i === 2) {
            return toOrig.slice(toStart + i);
          }
        }
        if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
            lastCommonSep = i;
          } else if (i === 2) {
            lastCommonSep = 3;
          }
        }
        if (lastCommonSep === -1) {
          lastCommonSep = 0;
        }
      }
      let out = "";
      for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
        if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
          out += out.length === 0 ? ".." : "\\..";
        }
      }
      toStart += lastCommonSep;
      if (out.length > 0) {
        return `${out}${toOrig.slice(toStart, toEnd)}`;
      }
      if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
        ++toStart;
      }
      return toOrig.slice(toStart, toEnd);
    },
    toNamespacedPath(path) {
      if (typeof path !== "string") {
        return path;
      }
      if (path.length === 0) {
        return "";
      }
      const resolvedPath = win32.resolve(path);
      if (resolvedPath.length <= 2) {
        return path;
      }
      if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
        if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
          const code = resolvedPath.charCodeAt(2);
          if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
            return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
          }
        }
      } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0)) && resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
        return `\\\\?\\${resolvedPath}`;
      }
      return path;
    },
    dirname(path) {
      validateString(path, "path");
      const len = path.length;
      if (len === 0) {
        return ".";
      }
      let rootEnd = -1;
      let offset = 0;
      const code = path.charCodeAt(0);
      if (len === 1) {
        return isPathSeparator(code) ? path : ".";
      }
      if (isPathSeparator(code)) {
        rootEnd = offset = 1;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j = 2;
          let last = j;
          while (j < len && !isPathSeparator(path.charCodeAt(j))) {
            j++;
          }
          if (j < len && j !== last) {
            last = j;
            while (j < len && isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j === len) {
                return path;
              }
              if (j !== last) {
                rootEnd = offset = j + 1;
              }
            }
          }
        }
      } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
        rootEnd = len > 2 && isPathSeparator(path.charCodeAt(2)) ? 3 : 2;
        offset = rootEnd;
      }
      let end = -1;
      let matchedSlash = true;
      for (let i = len - 1; i >= offset; --i) {
        if (isPathSeparator(path.charCodeAt(i))) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
          matchedSlash = false;
        }
      }
      if (end === -1) {
        if (rootEnd === -1) {
          return ".";
        }
        end = rootEnd;
      }
      return path.slice(0, end);
    },
    basename(path, ext) {
      if (ext !== void 0) {
        validateString(ext, "ext");
      }
      validateString(path, "path");
      let start = 0;
      let end = -1;
      let matchedSlash = true;
      let i;
      if (path.length >= 2 && isWindowsDeviceRoot(path.charCodeAt(0)) && path.charCodeAt(1) === CHAR_COLON) {
        start = 2;
      }
      if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
        if (ext === path) {
          return "";
        }
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= start; --i) {
          const code = path.charCodeAt(i);
          if (isPathSeparator(code)) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
            if (firstNonSlashEnd === -1) {
              matchedSlash = false;
              firstNonSlashEnd = i + 1;
            }
            if (extIdx >= 0) {
              if (code === ext.charCodeAt(extIdx)) {
                if (--extIdx === -1) {
                  end = i;
                }
              } else {
                extIdx = -1;
                end = firstNonSlashEnd;
              }
            }
          }
        }
        if (start === end) {
          end = firstNonSlashEnd;
        } else if (end === -1) {
          end = path.length;
        }
        return path.slice(start, end);
      }
      for (i = path.length - 1; i >= start; --i) {
        if (isPathSeparator(path.charCodeAt(i))) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
      }
      if (end === -1) {
        return "";
      }
      return path.slice(start, end);
    },
    extname(path) {
      validateString(path, "path");
      let start = 0;
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let preDotState = 0;
      if (path.length >= 2 && path.charCodeAt(1) === CHAR_COLON && isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
      }
      for (let i = path.length - 1; i >= start; --i) {
        const code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
      }
      return path.slice(startDot, end);
    },
    format: _format.bind(null, "\\"),
    parse(path) {
      validateString(path, "path");
      const ret = {root: "", dir: "", base: "", ext: "", name: ""};
      if (path.length === 0) {
        return ret;
      }
      const len = path.length;
      let rootEnd = 0;
      let code = path.charCodeAt(0);
      if (len === 1) {
        if (isPathSeparator(code)) {
          ret.root = ret.dir = path;
          return ret;
        }
        ret.base = ret.name = path;
        return ret;
      }
      if (isPathSeparator(code)) {
        rootEnd = 1;
        if (isPathSeparator(path.charCodeAt(1))) {
          let j = 2;
          let last = j;
          while (j < len && !isPathSeparator(path.charCodeAt(j))) {
            j++;
          }
          if (j < len && j !== last) {
            last = j;
            while (j < len && isPathSeparator(path.charCodeAt(j))) {
              j++;
            }
            if (j < len && j !== last) {
              last = j;
              while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                j++;
              }
              if (j === len) {
                rootEnd = j;
              } else if (j !== last) {
                rootEnd = j + 1;
              }
            }
          }
        }
      } else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
        if (len <= 2) {
          ret.root = ret.dir = path;
          return ret;
        }
        rootEnd = 2;
        if (isPathSeparator(path.charCodeAt(2))) {
          if (len === 3) {
            ret.root = ret.dir = path;
            return ret;
          }
          rootEnd = 3;
        }
      }
      if (rootEnd > 0) {
        ret.root = path.slice(0, rootEnd);
      }
      let startDot = -1;
      let startPart = rootEnd;
      let end = -1;
      let matchedSlash = true;
      let i = path.length - 1;
      let preDotState = 0;
      for (; i >= rootEnd; --i) {
        code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (end !== -1) {
        if (startDot === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          ret.base = ret.name = path.slice(startPart, end);
        } else {
          ret.name = path.slice(startPart, startDot);
          ret.base = path.slice(startPart, end);
          ret.ext = path.slice(startDot, end);
        }
      }
      if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
      } else {
        ret.dir = ret.root;
      }
      return ret;
    },
    sep: "\\",
    delimiter: ";",
    win32: null,
    posix: null
  };
  var posix = {
    resolve(...pathSegments) {
      let resolvedPath = "";
      let resolvedAbsolute = false;
      for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        const path = i >= 0 ? pathSegments[i] : cwd();
        validateString(path, "path");
        if (path.length === 0) {
          continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      }
      resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
      if (resolvedAbsolute) {
        return `/${resolvedPath}`;
      }
      return resolvedPath.length > 0 ? resolvedPath : ".";
    },
    normalize(path) {
      validateString(path, "path");
      if (path.length === 0) {
        return ".";
      }
      const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
      path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
      if (path.length === 0) {
        if (isAbsolute) {
          return "/";
        }
        return trailingSeparator ? "./" : ".";
      }
      if (trailingSeparator) {
        path += "/";
      }
      return isAbsolute ? `/${path}` : path;
    },
    isAbsolute(path) {
      validateString(path, "path");
      return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    },
    join(...paths2) {
      if (paths2.length === 0) {
        return ".";
      }
      let joined;
      for (let i = 0; i < paths2.length; ++i) {
        const arg = paths2[i];
        validateString(arg, "path");
        if (arg.length > 0) {
          if (joined === void 0) {
            joined = arg;
          } else {
            joined += `/${arg}`;
          }
        }
      }
      if (joined === void 0) {
        return ".";
      }
      return posix.normalize(joined);
    },
    relative(from, to) {
      validateString(from, "from");
      validateString(to, "to");
      if (from === to) {
        return "";
      }
      from = posix.resolve(from);
      to = posix.resolve(to);
      if (from === to) {
        return "";
      }
      const fromStart = 1;
      const fromEnd = from.length;
      const fromLen = fromEnd - fromStart;
      const toStart = 1;
      const toLen = to.length - toStart;
      const length = fromLen < toLen ? fromLen : toLen;
      let lastCommonSep = -1;
      let i = 0;
      for (; i < length; i++) {
        const fromCode = from.charCodeAt(fromStart + i);
        if (fromCode !== to.charCodeAt(toStart + i)) {
          break;
        } else if (fromCode === CHAR_FORWARD_SLASH) {
          lastCommonSep = i;
        }
      }
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
            return to.slice(toStart + i + 1);
          }
          if (i === 0) {
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
            lastCommonSep = i;
          } else if (i === 0) {
            lastCommonSep = 0;
          }
        }
      }
      let out = "";
      for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
        if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
          out += out.length === 0 ? ".." : "/..";
        }
      }
      return `${out}${to.slice(toStart + lastCommonSep)}`;
    },
    toNamespacedPath(path) {
      return path;
    },
    dirname(path) {
      validateString(path, "path");
      if (path.length === 0) {
        return ".";
      }
      const hasRoot = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      let end = -1;
      let matchedSlash = true;
      for (let i = path.length - 1; i >= 1; --i) {
        if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
          matchedSlash = false;
        }
      }
      if (end === -1) {
        return hasRoot ? "/" : ".";
      }
      if (hasRoot && end === 1) {
        return "//";
      }
      return path.slice(0, end);
    },
    basename(path, ext) {
      if (ext !== void 0) {
        validateString(ext, "ext");
      }
      validateString(path, "path");
      let start = 0;
      let end = -1;
      let matchedSlash = true;
      let i;
      if (ext !== void 0 && ext.length > 0 && ext.length <= path.length) {
        if (ext === path) {
          return "";
        }
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for (i = path.length - 1; i >= 0; --i) {
          const code = path.charCodeAt(i);
          if (code === CHAR_FORWARD_SLASH) {
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
            if (firstNonSlashEnd === -1) {
              matchedSlash = false;
              firstNonSlashEnd = i + 1;
            }
            if (extIdx >= 0) {
              if (code === ext.charCodeAt(extIdx)) {
                if (--extIdx === -1) {
                  end = i;
                }
              } else {
                extIdx = -1;
                end = firstNonSlashEnd;
              }
            }
          }
        }
        if (start === end) {
          end = firstNonSlashEnd;
        } else if (end === -1) {
          end = path.length;
        }
        return path.slice(start, end);
      }
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            start = i + 1;
            break;
          }
        } else if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
      }
      if (end === -1) {
        return "";
      }
      return path.slice(start, end);
    },
    extname(path) {
      validateString(path, "path");
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let preDotState = 0;
      for (let i = path.length - 1; i >= 0; --i) {
        const code = path.charCodeAt(i);
        if (code === CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
      }
      return path.slice(startDot, end);
    },
    format: _format.bind(null, "/"),
    parse(path) {
      validateString(path, "path");
      const ret = {root: "", dir: "", base: "", ext: "", name: ""};
      if (path.length === 0) {
        return ret;
      }
      const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
      let start;
      if (isAbsolute) {
        ret.root = "/";
        start = 1;
      } else {
        start = 0;
      }
      let startDot = -1;
      let startPart = 0;
      let end = -1;
      let matchedSlash = true;
      let i = path.length - 1;
      let preDotState = 0;
      for (; i >= start; --i) {
        const code = path.charCodeAt(i);
        if (code === CHAR_FORWARD_SLASH) {
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
        if (end === -1) {
          matchedSlash = false;
          end = i + 1;
        }
        if (code === CHAR_DOT) {
          if (startDot === -1) {
            startDot = i;
          } else if (preDotState !== 1) {
            preDotState = 1;
          }
        } else if (startDot !== -1) {
          preDotState = -1;
        }
      }
      if (end !== -1) {
        const start2 = startPart === 0 && isAbsolute ? 1 : startPart;
        if (startDot === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
          ret.base = ret.name = path.slice(start2, end);
        } else {
          ret.name = path.slice(start2, startDot);
          ret.base = path.slice(start2, end);
          ret.ext = path.slice(startDot, end);
        }
      }
      if (startPart > 0) {
        ret.dir = path.slice(0, startPart - 1);
      } else if (isAbsolute) {
        ret.dir = "/";
      }
      return ret;
    },
    sep: "/",
    delimiter: ":",
    win32: null,
    posix: null
  };
  posix.win32 = win32.win32 = win32;
  posix.posix = win32.posix = posix;
  var normalize = platform === "win32" ? win32.normalize : posix.normalize;
  var resolve = platform === "win32" ? win32.resolve : posix.resolve;
  var relative = platform === "win32" ? win32.relative : posix.relative;
  var dirname = platform === "win32" ? win32.dirname : posix.dirname;
  var basename = platform === "win32" ? win32.basename : posix.basename;
  var extname = platform === "win32" ? win32.extname : posix.extname;
  var sep = platform === "win32" ? win32.sep : posix.sep;

  // node_modules/monaco-editor/esm/vs/base/common/uri.js
  var _schemePattern = /^\w[\w\d+.-]*$/;
  var _singleSlashStart = /^\//;
  var _doubleSlashStart = /^\/\//;
  function _validateUri(ret, _strict) {
    if (!ret.scheme && _strict) {
      throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
    }
    if (ret.scheme && !_schemePattern.test(ret.scheme)) {
      throw new Error("[UriError]: Scheme contains illegal characters.");
    }
    if (ret.path) {
      if (ret.authority) {
        if (!_singleSlashStart.test(ret.path)) {
          throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
        }
      } else {
        if (_doubleSlashStart.test(ret.path)) {
          throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
        }
      }
    }
  }
  function _schemeFix(scheme, _strict) {
    if (!scheme && !_strict) {
      return "file";
    }
    return scheme;
  }
  function _referenceResolution(scheme, path) {
    switch (scheme) {
      case "https":
      case "http":
      case "file":
        if (!path) {
          path = _slash;
        } else if (path[0] !== _slash) {
          path = _slash + path;
        }
        break;
    }
    return path;
  }
  var _empty = "";
  var _slash = "/";
  var _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  var URI = class {
    constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
      if (typeof schemeOrData === "object") {
        this.scheme = schemeOrData.scheme || _empty;
        this.authority = schemeOrData.authority || _empty;
        this.path = schemeOrData.path || _empty;
        this.query = schemeOrData.query || _empty;
        this.fragment = schemeOrData.fragment || _empty;
      } else {
        this.scheme = _schemeFix(schemeOrData, _strict);
        this.authority = authority || _empty;
        this.path = _referenceResolution(this.scheme, path || _empty);
        this.query = query || _empty;
        this.fragment = fragment || _empty;
        _validateUri(this, _strict);
      }
    }
    static isUri(thing) {
      if (thing instanceof URI) {
        return true;
      }
      if (!thing) {
        return false;
      }
      return typeof thing.authority === "string" && typeof thing.fragment === "string" && typeof thing.path === "string" && typeof thing.query === "string" && typeof thing.scheme === "string" && typeof thing.fsPath === "string" && typeof thing.with === "function" && typeof thing.toString === "function";
    }
    get fsPath() {
      return uriToFsPath(this, false);
    }
    with(change) {
      if (!change) {
        return this;
      }
      let {scheme, authority, path, query, fragment} = change;
      if (scheme === void 0) {
        scheme = this.scheme;
      } else if (scheme === null) {
        scheme = _empty;
      }
      if (authority === void 0) {
        authority = this.authority;
      } else if (authority === null) {
        authority = _empty;
      }
      if (path === void 0) {
        path = this.path;
      } else if (path === null) {
        path = _empty;
      }
      if (query === void 0) {
        query = this.query;
      } else if (query === null) {
        query = _empty;
      }
      if (fragment === void 0) {
        fragment = this.fragment;
      } else if (fragment === null) {
        fragment = _empty;
      }
      if (scheme === this.scheme && authority === this.authority && path === this.path && query === this.query && fragment === this.fragment) {
        return this;
      }
      return new Uri(scheme, authority, path, query, fragment);
    }
    static parse(value, _strict = false) {
      const match = _regexp.exec(value);
      if (!match) {
        return new Uri(_empty, _empty, _empty, _empty, _empty);
      }
      return new Uri(match[2] || _empty, percentDecode(match[4] || _empty), percentDecode(match[5] || _empty), percentDecode(match[7] || _empty), percentDecode(match[9] || _empty), _strict);
    }
    static file(path) {
      let authority = _empty;
      if (isWindows) {
        path = path.replace(/\\/g, _slash);
      }
      if (path[0] === _slash && path[1] === _slash) {
        const idx = path.indexOf(_slash, 2);
        if (idx === -1) {
          authority = path.substring(2);
          path = _slash;
        } else {
          authority = path.substring(2, idx);
          path = path.substring(idx) || _slash;
        }
      }
      return new Uri("file", authority, path, _empty, _empty);
    }
    static from(components) {
      const result = new Uri(components.scheme, components.authority, components.path, components.query, components.fragment);
      _validateUri(result, true);
      return result;
    }
    static joinPath(uri, ...pathFragment) {
      if (!uri.path) {
        throw new Error(`[UriError]: cannot call joinPath on URI without path`);
      }
      let newPath;
      if (isWindows && uri.scheme === "file") {
        newPath = URI.file(win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
      } else {
        newPath = posix.join(uri.path, ...pathFragment);
      }
      return uri.with({path: newPath});
    }
    toString(skipEncoding = false) {
      return _asFormatted(this, skipEncoding);
    }
    toJSON() {
      return this;
    }
    static revive(data) {
      if (!data) {
        return data;
      } else if (data instanceof URI) {
        return data;
      } else {
        const result = new Uri(data);
        result._formatted = data.external;
        result._fsPath = data._sep === _pathSepMarker ? data.fsPath : null;
        return result;
      }
    }
  };
  var _pathSepMarker = isWindows ? 1 : void 0;
  var Uri = class extends URI {
    constructor() {
      super(...arguments);
      this._formatted = null;
      this._fsPath = null;
    }
    get fsPath() {
      if (!this._fsPath) {
        this._fsPath = uriToFsPath(this, false);
      }
      return this._fsPath;
    }
    toString(skipEncoding = false) {
      if (!skipEncoding) {
        if (!this._formatted) {
          this._formatted = _asFormatted(this, false);
        }
        return this._formatted;
      } else {
        return _asFormatted(this, true);
      }
    }
    toJSON() {
      const res = {
        $mid: 1
      };
      if (this._fsPath) {
        res.fsPath = this._fsPath;
        res._sep = _pathSepMarker;
      }
      if (this._formatted) {
        res.external = this._formatted;
      }
      if (this.path) {
        res.path = this.path;
      }
      if (this.scheme) {
        res.scheme = this.scheme;
      }
      if (this.authority) {
        res.authority = this.authority;
      }
      if (this.query) {
        res.query = this.query;
      }
      if (this.fragment) {
        res.fragment = this.fragment;
      }
      return res;
    }
  };
  var encodeTable = {
    [58]: "%3A",
    [47]: "%2F",
    [63]: "%3F",
    [35]: "%23",
    [91]: "%5B",
    [93]: "%5D",
    [64]: "%40",
    [33]: "%21",
    [36]: "%24",
    [38]: "%26",
    [39]: "%27",
    [40]: "%28",
    [41]: "%29",
    [42]: "%2A",
    [43]: "%2B",
    [44]: "%2C",
    [59]: "%3B",
    [61]: "%3D",
    [32]: "%20"
  };
  function encodeURIComponentFast(uriComponent, allowSlash) {
    let res = void 0;
    let nativeEncodePos = -1;
    for (let pos = 0; pos < uriComponent.length; pos++) {
      const code = uriComponent.charCodeAt(pos);
      if (code >= 97 && code <= 122 || code >= 65 && code <= 90 || code >= 48 && code <= 57 || code === 45 || code === 46 || code === 95 || code === 126 || allowSlash && code === 47) {
        if (nativeEncodePos !== -1) {
          res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
          nativeEncodePos = -1;
        }
        if (res !== void 0) {
          res += uriComponent.charAt(pos);
        }
      } else {
        if (res === void 0) {
          res = uriComponent.substr(0, pos);
        }
        const escaped = encodeTable[code];
        if (escaped !== void 0) {
          if (nativeEncodePos !== -1) {
            res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
            nativeEncodePos = -1;
          }
          res += escaped;
        } else if (nativeEncodePos === -1) {
          nativeEncodePos = pos;
        }
      }
    }
    if (nativeEncodePos !== -1) {
      res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
    }
    return res !== void 0 ? res : uriComponent;
  }
  function encodeURIComponentMinimal(path) {
    let res = void 0;
    for (let pos = 0; pos < path.length; pos++) {
      const code = path.charCodeAt(pos);
      if (code === 35 || code === 63) {
        if (res === void 0) {
          res = path.substr(0, pos);
        }
        res += encodeTable[code];
      } else {
        if (res !== void 0) {
          res += path[pos];
        }
      }
    }
    return res !== void 0 ? res : path;
  }
  function uriToFsPath(uri, keepDriveLetterCasing) {
    let value;
    if (uri.authority && uri.path.length > 1 && uri.scheme === "file") {
      value = `//${uri.authority}${uri.path}`;
    } else if (uri.path.charCodeAt(0) === 47 && (uri.path.charCodeAt(1) >= 65 && uri.path.charCodeAt(1) <= 90 || uri.path.charCodeAt(1) >= 97 && uri.path.charCodeAt(1) <= 122) && uri.path.charCodeAt(2) === 58) {
      if (!keepDriveLetterCasing) {
        value = uri.path[1].toLowerCase() + uri.path.substr(2);
      } else {
        value = uri.path.substr(1);
      }
    } else {
      value = uri.path;
    }
    if (isWindows) {
      value = value.replace(/\//g, "\\");
    }
    return value;
  }
  function _asFormatted(uri, skipEncoding) {
    const encoder = !skipEncoding ? encodeURIComponentFast : encodeURIComponentMinimal;
    let res = "";
    let {scheme, authority, path, query, fragment} = uri;
    if (scheme) {
      res += scheme;
      res += ":";
    }
    if (authority || scheme === "file") {
      res += _slash;
      res += _slash;
    }
    if (authority) {
      let idx = authority.indexOf("@");
      if (idx !== -1) {
        const userinfo = authority.substr(0, idx);
        authority = authority.substr(idx + 1);
        idx = userinfo.indexOf(":");
        if (idx === -1) {
          res += encoder(userinfo, false);
        } else {
          res += encoder(userinfo.substr(0, idx), false);
          res += ":";
          res += encoder(userinfo.substr(idx + 1), false);
        }
        res += "@";
      }
      authority = authority.toLowerCase();
      idx = authority.indexOf(":");
      if (idx === -1) {
        res += encoder(authority, false);
      } else {
        res += encoder(authority.substr(0, idx), false);
        res += authority.substr(idx);
      }
    }
    if (path) {
      if (path.length >= 3 && path.charCodeAt(0) === 47 && path.charCodeAt(2) === 58) {
        const code = path.charCodeAt(1);
        if (code >= 65 && code <= 90) {
          path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`;
        }
      } else if (path.length >= 2 && path.charCodeAt(1) === 58) {
        const code = path.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`;
        }
      }
      res += encoder(path, true);
    }
    if (query) {
      res += "?";
      res += encoder(query, false);
    }
    if (fragment) {
      res += "#";
      res += !skipEncoding ? encodeURIComponentFast(fragment, false) : fragment;
    }
    return res;
  }
  function decodeURIComponentGraceful(str) {
    try {
      return decodeURIComponent(str);
    } catch (_a2) {
      if (str.length > 3) {
        return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
      } else {
        return str;
      }
    }
  }
  var _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
  function percentDecode(str) {
    if (!str.match(_rEncodedAsHex)) {
      return str;
    }
    return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
  }

  // node_modules/monaco-editor/esm/vs/editor/common/core/position.js
  var Position = class {
    constructor(lineNumber, column) {
      this.lineNumber = lineNumber;
      this.column = column;
    }
    with(newLineNumber = this.lineNumber, newColumn = this.column) {
      if (newLineNumber === this.lineNumber && newColumn === this.column) {
        return this;
      } else {
        return new Position(newLineNumber, newColumn);
      }
    }
    delta(deltaLineNumber = 0, deltaColumn = 0) {
      return this.with(this.lineNumber + deltaLineNumber, this.column + deltaColumn);
    }
    equals(other) {
      return Position.equals(this, other);
    }
    static equals(a, b) {
      if (!a && !b) {
        return true;
      }
      return !!a && !!b && a.lineNumber === b.lineNumber && a.column === b.column;
    }
    isBefore(other) {
      return Position.isBefore(this, other);
    }
    static isBefore(a, b) {
      if (a.lineNumber < b.lineNumber) {
        return true;
      }
      if (b.lineNumber < a.lineNumber) {
        return false;
      }
      return a.column < b.column;
    }
    isBeforeOrEqual(other) {
      return Position.isBeforeOrEqual(this, other);
    }
    static isBeforeOrEqual(a, b) {
      if (a.lineNumber < b.lineNumber) {
        return true;
      }
      if (b.lineNumber < a.lineNumber) {
        return false;
      }
      return a.column <= b.column;
    }
    static compare(a, b) {
      let aLineNumber = a.lineNumber | 0;
      let bLineNumber = b.lineNumber | 0;
      if (aLineNumber === bLineNumber) {
        let aColumn = a.column | 0;
        let bColumn = b.column | 0;
        return aColumn - bColumn;
      }
      return aLineNumber - bLineNumber;
    }
    clone() {
      return new Position(this.lineNumber, this.column);
    }
    toString() {
      return "(" + this.lineNumber + "," + this.column + ")";
    }
    static lift(pos) {
      return new Position(pos.lineNumber, pos.column);
    }
    static isIPosition(obj) {
      return obj && typeof obj.lineNumber === "number" && typeof obj.column === "number";
    }
  };

  // node_modules/monaco-editor/esm/vs/editor/common/core/range.js
  var Range = class {
    constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
      if (startLineNumber > endLineNumber || startLineNumber === endLineNumber && startColumn > endColumn) {
        this.startLineNumber = endLineNumber;
        this.startColumn = endColumn;
        this.endLineNumber = startLineNumber;
        this.endColumn = startColumn;
      } else {
        this.startLineNumber = startLineNumber;
        this.startColumn = startColumn;
        this.endLineNumber = endLineNumber;
        this.endColumn = endColumn;
      }
    }
    isEmpty() {
      return Range.isEmpty(this);
    }
    static isEmpty(range) {
      return range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn;
    }
    containsPosition(position) {
      return Range.containsPosition(this, position);
    }
    static containsPosition(range, position) {
      if (position.lineNumber < range.startLineNumber || position.lineNumber > range.endLineNumber) {
        return false;
      }
      if (position.lineNumber === range.startLineNumber && position.column < range.startColumn) {
        return false;
      }
      if (position.lineNumber === range.endLineNumber && position.column > range.endColumn) {
        return false;
      }
      return true;
    }
    containsRange(range) {
      return Range.containsRange(this, range);
    }
    static containsRange(range, otherRange) {
      if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
        return false;
      }
      if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
        return false;
      }
      if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn < range.startColumn) {
        return false;
      }
      if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn > range.endColumn) {
        return false;
      }
      return true;
    }
    strictContainsRange(range) {
      return Range.strictContainsRange(this, range);
    }
    static strictContainsRange(range, otherRange) {
      if (otherRange.startLineNumber < range.startLineNumber || otherRange.endLineNumber < range.startLineNumber) {
        return false;
      }
      if (otherRange.startLineNumber > range.endLineNumber || otherRange.endLineNumber > range.endLineNumber) {
        return false;
      }
      if (otherRange.startLineNumber === range.startLineNumber && otherRange.startColumn <= range.startColumn) {
        return false;
      }
      if (otherRange.endLineNumber === range.endLineNumber && otherRange.endColumn >= range.endColumn) {
        return false;
      }
      return true;
    }
    plusRange(range) {
      return Range.plusRange(this, range);
    }
    static plusRange(a, b) {
      let startLineNumber;
      let startColumn;
      let endLineNumber;
      let endColumn;
      if (b.startLineNumber < a.startLineNumber) {
        startLineNumber = b.startLineNumber;
        startColumn = b.startColumn;
      } else if (b.startLineNumber === a.startLineNumber) {
        startLineNumber = b.startLineNumber;
        startColumn = Math.min(b.startColumn, a.startColumn);
      } else {
        startLineNumber = a.startLineNumber;
        startColumn = a.startColumn;
      }
      if (b.endLineNumber > a.endLineNumber) {
        endLineNumber = b.endLineNumber;
        endColumn = b.endColumn;
      } else if (b.endLineNumber === a.endLineNumber) {
        endLineNumber = b.endLineNumber;
        endColumn = Math.max(b.endColumn, a.endColumn);
      } else {
        endLineNumber = a.endLineNumber;
        endColumn = a.endColumn;
      }
      return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }
    intersectRanges(range) {
      return Range.intersectRanges(this, range);
    }
    static intersectRanges(a, b) {
      let resultStartLineNumber = a.startLineNumber;
      let resultStartColumn = a.startColumn;
      let resultEndLineNumber = a.endLineNumber;
      let resultEndColumn = a.endColumn;
      let otherStartLineNumber = b.startLineNumber;
      let otherStartColumn = b.startColumn;
      let otherEndLineNumber = b.endLineNumber;
      let otherEndColumn = b.endColumn;
      if (resultStartLineNumber < otherStartLineNumber) {
        resultStartLineNumber = otherStartLineNumber;
        resultStartColumn = otherStartColumn;
      } else if (resultStartLineNumber === otherStartLineNumber) {
        resultStartColumn = Math.max(resultStartColumn, otherStartColumn);
      }
      if (resultEndLineNumber > otherEndLineNumber) {
        resultEndLineNumber = otherEndLineNumber;
        resultEndColumn = otherEndColumn;
      } else if (resultEndLineNumber === otherEndLineNumber) {
        resultEndColumn = Math.min(resultEndColumn, otherEndColumn);
      }
      if (resultStartLineNumber > resultEndLineNumber) {
        return null;
      }
      if (resultStartLineNumber === resultEndLineNumber && resultStartColumn > resultEndColumn) {
        return null;
      }
      return new Range(resultStartLineNumber, resultStartColumn, resultEndLineNumber, resultEndColumn);
    }
    equalsRange(other) {
      return Range.equalsRange(this, other);
    }
    static equalsRange(a, b) {
      return !!a && !!b && a.startLineNumber === b.startLineNumber && a.startColumn === b.startColumn && a.endLineNumber === b.endLineNumber && a.endColumn === b.endColumn;
    }
    getEndPosition() {
      return Range.getEndPosition(this);
    }
    static getEndPosition(range) {
      return new Position(range.endLineNumber, range.endColumn);
    }
    getStartPosition() {
      return Range.getStartPosition(this);
    }
    static getStartPosition(range) {
      return new Position(range.startLineNumber, range.startColumn);
    }
    toString() {
      return "[" + this.startLineNumber + "," + this.startColumn + " -> " + this.endLineNumber + "," + this.endColumn + "]";
    }
    setEndPosition(endLineNumber, endColumn) {
      return new Range(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
    }
    setStartPosition(startLineNumber, startColumn) {
      return new Range(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
    }
    collapseToStart() {
      return Range.collapseToStart(this);
    }
    static collapseToStart(range) {
      return new Range(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
    }
    static fromPositions(start, end = start) {
      return new Range(start.lineNumber, start.column, end.lineNumber, end.column);
    }
    static lift(range) {
      if (!range) {
        return null;
      }
      return new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
    }
    static isIRange(obj) {
      return obj && typeof obj.startLineNumber === "number" && typeof obj.startColumn === "number" && typeof obj.endLineNumber === "number" && typeof obj.endColumn === "number";
    }
    static areIntersectingOrTouching(a, b) {
      if (a.endLineNumber < b.startLineNumber || a.endLineNumber === b.startLineNumber && a.endColumn < b.startColumn) {
        return false;
      }
      if (b.endLineNumber < a.startLineNumber || b.endLineNumber === a.startLineNumber && b.endColumn < a.startColumn) {
        return false;
      }
      return true;
    }
    static areIntersecting(a, b) {
      if (a.endLineNumber < b.startLineNumber || a.endLineNumber === b.startLineNumber && a.endColumn <= b.startColumn) {
        return false;
      }
      if (b.endLineNumber < a.startLineNumber || b.endLineNumber === a.startLineNumber && b.endColumn <= a.startColumn) {
        return false;
      }
      return true;
    }
    static compareRangesUsingStarts(a, b) {
      if (a && b) {
        const aStartLineNumber = a.startLineNumber | 0;
        const bStartLineNumber = b.startLineNumber | 0;
        if (aStartLineNumber === bStartLineNumber) {
          const aStartColumn = a.startColumn | 0;
          const bStartColumn = b.startColumn | 0;
          if (aStartColumn === bStartColumn) {
            const aEndLineNumber = a.endLineNumber | 0;
            const bEndLineNumber = b.endLineNumber | 0;
            if (aEndLineNumber === bEndLineNumber) {
              const aEndColumn = a.endColumn | 0;
              const bEndColumn = b.endColumn | 0;
              return aEndColumn - bEndColumn;
            }
            return aEndLineNumber - bEndLineNumber;
          }
          return aStartColumn - bStartColumn;
        }
        return aStartLineNumber - bStartLineNumber;
      }
      const aExists = a ? 1 : 0;
      const bExists = b ? 1 : 0;
      return aExists - bExists;
    }
    static compareRangesUsingEnds(a, b) {
      if (a.endLineNumber === b.endLineNumber) {
        if (a.endColumn === b.endColumn) {
          if (a.startLineNumber === b.startLineNumber) {
            return a.startColumn - b.startColumn;
          }
          return a.startLineNumber - b.startLineNumber;
        }
        return a.endColumn - b.endColumn;
      }
      return a.endLineNumber - b.endLineNumber;
    }
    static spansMultipleLines(range) {
      return range.endLineNumber > range.startLineNumber;
    }
  };

  // node_modules/monaco-editor/esm/vs/editor/common/diff/diffComputer.js
  var MINIMUM_MATCHING_CHARACTER_LENGTH = 3;
  function computeDiff(originalSequence, modifiedSequence, continueProcessingPredicate, pretty) {
    const diffAlgo = new LcsDiff(originalSequence, modifiedSequence, continueProcessingPredicate);
    return diffAlgo.ComputeDiff(pretty);
  }
  var LineSequence = class {
    constructor(lines) {
      const startColumns = [];
      const endColumns = [];
      for (let i = 0, length = lines.length; i < length; i++) {
        startColumns[i] = getFirstNonBlankColumn(lines[i], 1);
        endColumns[i] = getLastNonBlankColumn(lines[i], 1);
      }
      this.lines = lines;
      this._startColumns = startColumns;
      this._endColumns = endColumns;
    }
    getElements() {
      const elements = [];
      for (let i = 0, len = this.lines.length; i < len; i++) {
        elements[i] = this.lines[i].substring(this._startColumns[i] - 1, this._endColumns[i] - 1);
      }
      return elements;
    }
    getStartLineNumber(i) {
      return i + 1;
    }
    getEndLineNumber(i) {
      return i + 1;
    }
    createCharSequence(shouldIgnoreTrimWhitespace, startIndex, endIndex) {
      const charCodes = [];
      const lineNumbers = [];
      const columns = [];
      let len = 0;
      for (let index = startIndex; index <= endIndex; index++) {
        const lineContent = this.lines[index];
        const startColumn = shouldIgnoreTrimWhitespace ? this._startColumns[index] : 1;
        const endColumn = shouldIgnoreTrimWhitespace ? this._endColumns[index] : lineContent.length + 1;
        for (let col = startColumn; col < endColumn; col++) {
          charCodes[len] = lineContent.charCodeAt(col - 1);
          lineNumbers[len] = index + 1;
          columns[len] = col;
          len++;
        }
      }
      return new CharSequence(charCodes, lineNumbers, columns);
    }
  };
  var CharSequence = class {
    constructor(charCodes, lineNumbers, columns) {
      this._charCodes = charCodes;
      this._lineNumbers = lineNumbers;
      this._columns = columns;
    }
    getElements() {
      return this._charCodes;
    }
    getStartLineNumber(i) {
      return this._lineNumbers[i];
    }
    getStartColumn(i) {
      return this._columns[i];
    }
    getEndLineNumber(i) {
      return this._lineNumbers[i];
    }
    getEndColumn(i) {
      return this._columns[i] + 1;
    }
  };
  var CharChange = class {
    constructor(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn) {
      this.originalStartLineNumber = originalStartLineNumber;
      this.originalStartColumn = originalStartColumn;
      this.originalEndLineNumber = originalEndLineNumber;
      this.originalEndColumn = originalEndColumn;
      this.modifiedStartLineNumber = modifiedStartLineNumber;
      this.modifiedStartColumn = modifiedStartColumn;
      this.modifiedEndLineNumber = modifiedEndLineNumber;
      this.modifiedEndColumn = modifiedEndColumn;
    }
    static createFromDiffChange(diffChange, originalCharSequence, modifiedCharSequence) {
      let originalStartLineNumber;
      let originalStartColumn;
      let originalEndLineNumber;
      let originalEndColumn;
      let modifiedStartLineNumber;
      let modifiedStartColumn;
      let modifiedEndLineNumber;
      let modifiedEndColumn;
      if (diffChange.originalLength === 0) {
        originalStartLineNumber = 0;
        originalStartColumn = 0;
        originalEndLineNumber = 0;
        originalEndColumn = 0;
      } else {
        originalStartLineNumber = originalCharSequence.getStartLineNumber(diffChange.originalStart);
        originalStartColumn = originalCharSequence.getStartColumn(diffChange.originalStart);
        originalEndLineNumber = originalCharSequence.getEndLineNumber(diffChange.originalStart + diffChange.originalLength - 1);
        originalEndColumn = originalCharSequence.getEndColumn(diffChange.originalStart + diffChange.originalLength - 1);
      }
      if (diffChange.modifiedLength === 0) {
        modifiedStartLineNumber = 0;
        modifiedStartColumn = 0;
        modifiedEndLineNumber = 0;
        modifiedEndColumn = 0;
      } else {
        modifiedStartLineNumber = modifiedCharSequence.getStartLineNumber(diffChange.modifiedStart);
        modifiedStartColumn = modifiedCharSequence.getStartColumn(diffChange.modifiedStart);
        modifiedEndLineNumber = modifiedCharSequence.getEndLineNumber(diffChange.modifiedStart + diffChange.modifiedLength - 1);
        modifiedEndColumn = modifiedCharSequence.getEndColumn(diffChange.modifiedStart + diffChange.modifiedLength - 1);
      }
      return new CharChange(originalStartLineNumber, originalStartColumn, originalEndLineNumber, originalEndColumn, modifiedStartLineNumber, modifiedStartColumn, modifiedEndLineNumber, modifiedEndColumn);
    }
  };
  function postProcessCharChanges(rawChanges) {
    if (rawChanges.length <= 1) {
      return rawChanges;
    }
    const result = [rawChanges[0]];
    let prevChange = result[0];
    for (let i = 1, len = rawChanges.length; i < len; i++) {
      const currChange = rawChanges[i];
      const originalMatchingLength = currChange.originalStart - (prevChange.originalStart + prevChange.originalLength);
      const modifiedMatchingLength = currChange.modifiedStart - (prevChange.modifiedStart + prevChange.modifiedLength);
      const matchingLength = Math.min(originalMatchingLength, modifiedMatchingLength);
      if (matchingLength < MINIMUM_MATCHING_CHARACTER_LENGTH) {
        prevChange.originalLength = currChange.originalStart + currChange.originalLength - prevChange.originalStart;
        prevChange.modifiedLength = currChange.modifiedStart + currChange.modifiedLength - prevChange.modifiedStart;
      } else {
        result.push(currChange);
        prevChange = currChange;
      }
    }
    return result;
  }
  var LineChange = class {
    constructor(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges) {
      this.originalStartLineNumber = originalStartLineNumber;
      this.originalEndLineNumber = originalEndLineNumber;
      this.modifiedStartLineNumber = modifiedStartLineNumber;
      this.modifiedEndLineNumber = modifiedEndLineNumber;
      this.charChanges = charChanges;
    }
    static createFromDiffResult(shouldIgnoreTrimWhitespace, diffChange, originalLineSequence, modifiedLineSequence, continueCharDiff, shouldComputeCharChanges, shouldPostProcessCharChanges) {
      let originalStartLineNumber;
      let originalEndLineNumber;
      let modifiedStartLineNumber;
      let modifiedEndLineNumber;
      let charChanges = void 0;
      if (diffChange.originalLength === 0) {
        originalStartLineNumber = originalLineSequence.getStartLineNumber(diffChange.originalStart) - 1;
        originalEndLineNumber = 0;
      } else {
        originalStartLineNumber = originalLineSequence.getStartLineNumber(diffChange.originalStart);
        originalEndLineNumber = originalLineSequence.getEndLineNumber(diffChange.originalStart + diffChange.originalLength - 1);
      }
      if (diffChange.modifiedLength === 0) {
        modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(diffChange.modifiedStart) - 1;
        modifiedEndLineNumber = 0;
      } else {
        modifiedStartLineNumber = modifiedLineSequence.getStartLineNumber(diffChange.modifiedStart);
        modifiedEndLineNumber = modifiedLineSequence.getEndLineNumber(diffChange.modifiedStart + diffChange.modifiedLength - 1);
      }
      if (shouldComputeCharChanges && diffChange.originalLength > 0 && diffChange.originalLength < 20 && diffChange.modifiedLength > 0 && diffChange.modifiedLength < 20 && continueCharDiff()) {
        const originalCharSequence = originalLineSequence.createCharSequence(shouldIgnoreTrimWhitespace, diffChange.originalStart, diffChange.originalStart + diffChange.originalLength - 1);
        const modifiedCharSequence = modifiedLineSequence.createCharSequence(shouldIgnoreTrimWhitespace, diffChange.modifiedStart, diffChange.modifiedStart + diffChange.modifiedLength - 1);
        let rawChanges = computeDiff(originalCharSequence, modifiedCharSequence, continueCharDiff, true).changes;
        if (shouldPostProcessCharChanges) {
          rawChanges = postProcessCharChanges(rawChanges);
        }
        charChanges = [];
        for (let i = 0, length = rawChanges.length; i < length; i++) {
          charChanges.push(CharChange.createFromDiffChange(rawChanges[i], originalCharSequence, modifiedCharSequence));
        }
      }
      return new LineChange(originalStartLineNumber, originalEndLineNumber, modifiedStartLineNumber, modifiedEndLineNumber, charChanges);
    }
  };
  var DiffComputer = class {
    constructor(originalLines, modifiedLines, opts) {
      this.shouldComputeCharChanges = opts.shouldComputeCharChanges;
      this.shouldPostProcessCharChanges = opts.shouldPostProcessCharChanges;
      this.shouldIgnoreTrimWhitespace = opts.shouldIgnoreTrimWhitespace;
      this.shouldMakePrettyDiff = opts.shouldMakePrettyDiff;
      this.originalLines = originalLines;
      this.modifiedLines = modifiedLines;
      this.original = new LineSequence(originalLines);
      this.modified = new LineSequence(modifiedLines);
      this.continueLineDiff = createContinueProcessingPredicate(opts.maxComputationTime);
      this.continueCharDiff = createContinueProcessingPredicate(opts.maxComputationTime === 0 ? 0 : Math.min(opts.maxComputationTime, 5e3));
    }
    computeDiff() {
      if (this.original.lines.length === 1 && this.original.lines[0].length === 0) {
        if (this.modified.lines.length === 1 && this.modified.lines[0].length === 0) {
          return {
            quitEarly: false,
            changes: []
          };
        }
        return {
          quitEarly: false,
          changes: [{
            originalStartLineNumber: 1,
            originalEndLineNumber: 1,
            modifiedStartLineNumber: 1,
            modifiedEndLineNumber: this.modified.lines.length,
            charChanges: [{
              modifiedEndColumn: 0,
              modifiedEndLineNumber: 0,
              modifiedStartColumn: 0,
              modifiedStartLineNumber: 0,
              originalEndColumn: 0,
              originalEndLineNumber: 0,
              originalStartColumn: 0,
              originalStartLineNumber: 0
            }]
          }]
        };
      }
      if (this.modified.lines.length === 1 && this.modified.lines[0].length === 0) {
        return {
          quitEarly: false,
          changes: [{
            originalStartLineNumber: 1,
            originalEndLineNumber: this.original.lines.length,
            modifiedStartLineNumber: 1,
            modifiedEndLineNumber: 1,
            charChanges: [{
              modifiedEndColumn: 0,
              modifiedEndLineNumber: 0,
              modifiedStartColumn: 0,
              modifiedStartLineNumber: 0,
              originalEndColumn: 0,
              originalEndLineNumber: 0,
              originalStartColumn: 0,
              originalStartLineNumber: 0
            }]
          }]
        };
      }
      const diffResult = computeDiff(this.original, this.modified, this.continueLineDiff, this.shouldMakePrettyDiff);
      const rawChanges = diffResult.changes;
      const quitEarly = diffResult.quitEarly;
      if (this.shouldIgnoreTrimWhitespace) {
        const lineChanges = [];
        for (let i = 0, length = rawChanges.length; i < length; i++) {
          lineChanges.push(LineChange.createFromDiffResult(this.shouldIgnoreTrimWhitespace, rawChanges[i], this.original, this.modified, this.continueCharDiff, this.shouldComputeCharChanges, this.shouldPostProcessCharChanges));
        }
        return {
          quitEarly,
          changes: lineChanges
        };
      }
      const result = [];
      let originalLineIndex = 0;
      let modifiedLineIndex = 0;
      for (let i = -1, len = rawChanges.length; i < len; i++) {
        const nextChange = i + 1 < len ? rawChanges[i + 1] : null;
        const originalStop = nextChange ? nextChange.originalStart : this.originalLines.length;
        const modifiedStop = nextChange ? nextChange.modifiedStart : this.modifiedLines.length;
        while (originalLineIndex < originalStop && modifiedLineIndex < modifiedStop) {
          const originalLine = this.originalLines[originalLineIndex];
          const modifiedLine = this.modifiedLines[modifiedLineIndex];
          if (originalLine !== modifiedLine) {
            {
              let originalStartColumn = getFirstNonBlankColumn(originalLine, 1);
              let modifiedStartColumn = getFirstNonBlankColumn(modifiedLine, 1);
              while (originalStartColumn > 1 && modifiedStartColumn > 1) {
                const originalChar = originalLine.charCodeAt(originalStartColumn - 2);
                const modifiedChar = modifiedLine.charCodeAt(modifiedStartColumn - 2);
                if (originalChar !== modifiedChar) {
                  break;
                }
                originalStartColumn--;
                modifiedStartColumn--;
              }
              if (originalStartColumn > 1 || modifiedStartColumn > 1) {
                this._pushTrimWhitespaceCharChange(result, originalLineIndex + 1, 1, originalStartColumn, modifiedLineIndex + 1, 1, modifiedStartColumn);
              }
            }
            {
              let originalEndColumn = getLastNonBlankColumn(originalLine, 1);
              let modifiedEndColumn = getLastNonBlankColumn(modifiedLine, 1);
              const originalMaxColumn = originalLine.length + 1;
              const modifiedMaxColumn = modifiedLine.length + 1;
              while (originalEndColumn < originalMaxColumn && modifiedEndColumn < modifiedMaxColumn) {
                const originalChar = originalLine.charCodeAt(originalEndColumn - 1);
                const modifiedChar = originalLine.charCodeAt(modifiedEndColumn - 1);
                if (originalChar !== modifiedChar) {
                  break;
                }
                originalEndColumn++;
                modifiedEndColumn++;
              }
              if (originalEndColumn < originalMaxColumn || modifiedEndColumn < modifiedMaxColumn) {
                this._pushTrimWhitespaceCharChange(result, originalLineIndex + 1, originalEndColumn, originalMaxColumn, modifiedLineIndex + 1, modifiedEndColumn, modifiedMaxColumn);
              }
            }
          }
          originalLineIndex++;
          modifiedLineIndex++;
        }
        if (nextChange) {
          result.push(LineChange.createFromDiffResult(this.shouldIgnoreTrimWhitespace, nextChange, this.original, this.modified, this.continueCharDiff, this.shouldComputeCharChanges, this.shouldPostProcessCharChanges));
          originalLineIndex += nextChange.originalLength;
          modifiedLineIndex += nextChange.modifiedLength;
        }
      }
      return {
        quitEarly,
        changes: result
      };
    }
    _pushTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
      if (this._mergeTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn)) {
        return;
      }
      let charChanges = void 0;
      if (this.shouldComputeCharChanges) {
        charChanges = [new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn)];
      }
      result.push(new LineChange(originalLineNumber, originalLineNumber, modifiedLineNumber, modifiedLineNumber, charChanges));
    }
    _mergeTrimWhitespaceCharChange(result, originalLineNumber, originalStartColumn, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedEndColumn) {
      const len = result.length;
      if (len === 0) {
        return false;
      }
      const prevChange = result[len - 1];
      if (prevChange.originalEndLineNumber === 0 || prevChange.modifiedEndLineNumber === 0) {
        return false;
      }
      if (prevChange.originalEndLineNumber + 1 === originalLineNumber && prevChange.modifiedEndLineNumber + 1 === modifiedLineNumber) {
        prevChange.originalEndLineNumber = originalLineNumber;
        prevChange.modifiedEndLineNumber = modifiedLineNumber;
        if (this.shouldComputeCharChanges && prevChange.charChanges) {
          prevChange.charChanges.push(new CharChange(originalLineNumber, originalStartColumn, originalLineNumber, originalEndColumn, modifiedLineNumber, modifiedStartColumn, modifiedLineNumber, modifiedEndColumn));
        }
        return true;
      }
      return false;
    }
  };
  function getFirstNonBlankColumn(txt, defaultValue) {
    const r = firstNonWhitespaceIndex(txt);
    if (r === -1) {
      return defaultValue;
    }
    return r + 1;
  }
  function getLastNonBlankColumn(txt, defaultValue) {
    const r = lastNonWhitespaceIndex(txt);
    if (r === -1) {
      return defaultValue;
    }
    return r + 2;
  }
  function createContinueProcessingPredicate(maximumRuntime) {
    if (maximumRuntime === 0) {
      return () => true;
    }
    const startTime = Date.now();
    return () => {
      return Date.now() - startTime < maximumRuntime;
    };
  }

  // node_modules/monaco-editor/esm/vs/base/common/uint.js
  function toUint8(v) {
    if (v < 0) {
      return 0;
    }
    if (v > 255) {
      return 255;
    }
    return v | 0;
  }
  function toUint32(v) {
    if (v < 0) {
      return 0;
    }
    if (v > 4294967295) {
      return 4294967295;
    }
    return v | 0;
  }

  // node_modules/monaco-editor/esm/vs/editor/common/viewModel/prefixSumComputer.js
  var PrefixSumIndexOfResult = class {
    constructor(index, remainder) {
      this.index = index;
      this.remainder = remainder;
    }
  };
  var PrefixSumComputer = class {
    constructor(values) {
      this.values = values;
      this.prefixSum = new Uint32Array(values.length);
      this.prefixSumValidIndex = new Int32Array(1);
      this.prefixSumValidIndex[0] = -1;
    }
    insertValues(insertIndex, insertValues) {
      insertIndex = toUint32(insertIndex);
      const oldValues = this.values;
      const oldPrefixSum = this.prefixSum;
      const insertValuesLen = insertValues.length;
      if (insertValuesLen === 0) {
        return false;
      }
      this.values = new Uint32Array(oldValues.length + insertValuesLen);
      this.values.set(oldValues.subarray(0, insertIndex), 0);
      this.values.set(oldValues.subarray(insertIndex), insertIndex + insertValuesLen);
      this.values.set(insertValues, insertIndex);
      if (insertIndex - 1 < this.prefixSumValidIndex[0]) {
        this.prefixSumValidIndex[0] = insertIndex - 1;
      }
      this.prefixSum = new Uint32Array(this.values.length);
      if (this.prefixSumValidIndex[0] >= 0) {
        this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
      }
      return true;
    }
    changeValue(index, value) {
      index = toUint32(index);
      value = toUint32(value);
      if (this.values[index] === value) {
        return false;
      }
      this.values[index] = value;
      if (index - 1 < this.prefixSumValidIndex[0]) {
        this.prefixSumValidIndex[0] = index - 1;
      }
      return true;
    }
    removeValues(startIndex, cnt) {
      startIndex = toUint32(startIndex);
      cnt = toUint32(cnt);
      const oldValues = this.values;
      const oldPrefixSum = this.prefixSum;
      if (startIndex >= oldValues.length) {
        return false;
      }
      let maxCnt = oldValues.length - startIndex;
      if (cnt >= maxCnt) {
        cnt = maxCnt;
      }
      if (cnt === 0) {
        return false;
      }
      this.values = new Uint32Array(oldValues.length - cnt);
      this.values.set(oldValues.subarray(0, startIndex), 0);
      this.values.set(oldValues.subarray(startIndex + cnt), startIndex);
      this.prefixSum = new Uint32Array(this.values.length);
      if (startIndex - 1 < this.prefixSumValidIndex[0]) {
        this.prefixSumValidIndex[0] = startIndex - 1;
      }
      if (this.prefixSumValidIndex[0] >= 0) {
        this.prefixSum.set(oldPrefixSum.subarray(0, this.prefixSumValidIndex[0] + 1));
      }
      return true;
    }
    getTotalValue() {
      if (this.values.length === 0) {
        return 0;
      }
      return this._getAccumulatedValue(this.values.length - 1);
    }
    getAccumulatedValue(index) {
      if (index < 0) {
        return 0;
      }
      index = toUint32(index);
      return this._getAccumulatedValue(index);
    }
    _getAccumulatedValue(index) {
      if (index <= this.prefixSumValidIndex[0]) {
        return this.prefixSum[index];
      }
      let startIndex = this.prefixSumValidIndex[0] + 1;
      if (startIndex === 0) {
        this.prefixSum[0] = this.values[0];
        startIndex++;
      }
      if (index >= this.values.length) {
        index = this.values.length - 1;
      }
      for (let i = startIndex; i <= index; i++) {
        this.prefixSum[i] = this.prefixSum[i - 1] + this.values[i];
      }
      this.prefixSumValidIndex[0] = Math.max(this.prefixSumValidIndex[0], index);
      return this.prefixSum[index];
    }
    getIndexOf(accumulatedValue) {
      accumulatedValue = Math.floor(accumulatedValue);
      this.getTotalValue();
      let low = 0;
      let high = this.values.length - 1;
      let mid = 0;
      let midStop = 0;
      let midStart = 0;
      while (low <= high) {
        mid = low + (high - low) / 2 | 0;
        midStop = this.prefixSum[mid];
        midStart = midStop - this.values[mid];
        if (accumulatedValue < midStart) {
          high = mid - 1;
        } else if (accumulatedValue >= midStop) {
          low = mid + 1;
        } else {
          break;
        }
      }
      return new PrefixSumIndexOfResult(mid, accumulatedValue - midStart);
    }
  };

  // node_modules/monaco-editor/esm/vs/editor/common/model/mirrorTextModel.js
  var MirrorTextModel = class {
    constructor(uri, lines, eol, versionId) {
      this._uri = uri;
      this._lines = lines;
      this._eol = eol;
      this._versionId = versionId;
      this._lineStarts = null;
      this._cachedTextValue = null;
    }
    dispose() {
      this._lines.length = 0;
    }
    get version() {
      return this._versionId;
    }
    getText() {
      if (this._cachedTextValue === null) {
        this._cachedTextValue = this._lines.join(this._eol);
      }
      return this._cachedTextValue;
    }
    onEvents(e) {
      if (e.eol && e.eol !== this._eol) {
        this._eol = e.eol;
        this._lineStarts = null;
      }
      const changes = e.changes;
      for (const change of changes) {
        this._acceptDeleteRange(change.range);
        this._acceptInsertText(new Position(change.range.startLineNumber, change.range.startColumn), change.text);
      }
      this._versionId = e.versionId;
      this._cachedTextValue = null;
    }
    _ensureLineStarts() {
      if (!this._lineStarts) {
        const eolLength = this._eol.length;
        const linesLength = this._lines.length;
        const lineStartValues = new Uint32Array(linesLength);
        for (let i = 0; i < linesLength; i++) {
          lineStartValues[i] = this._lines[i].length + eolLength;
        }
        this._lineStarts = new PrefixSumComputer(lineStartValues);
      }
    }
    _setLineText(lineIndex, newValue) {
      this._lines[lineIndex] = newValue;
      if (this._lineStarts) {
        this._lineStarts.changeValue(lineIndex, this._lines[lineIndex].length + this._eol.length);
      }
    }
    _acceptDeleteRange(range) {
      if (range.startLineNumber === range.endLineNumber) {
        if (range.startColumn === range.endColumn) {
          return;
        }
        this._setLineText(range.startLineNumber - 1, this._lines[range.startLineNumber - 1].substring(0, range.startColumn - 1) + this._lines[range.startLineNumber - 1].substring(range.endColumn - 1));
        return;
      }
      this._setLineText(range.startLineNumber - 1, this._lines[range.startLineNumber - 1].substring(0, range.startColumn - 1) + this._lines[range.endLineNumber - 1].substring(range.endColumn - 1));
      this._lines.splice(range.startLineNumber, range.endLineNumber - range.startLineNumber);
      if (this._lineStarts) {
        this._lineStarts.removeValues(range.startLineNumber, range.endLineNumber - range.startLineNumber);
      }
    }
    _acceptInsertText(position, insertText) {
      if (insertText.length === 0) {
        return;
      }
      let insertLines = splitLines(insertText);
      if (insertLines.length === 1) {
        this._setLineText(position.lineNumber - 1, this._lines[position.lineNumber - 1].substring(0, position.column - 1) + insertLines[0] + this._lines[position.lineNumber - 1].substring(position.column - 1));
        return;
      }
      insertLines[insertLines.length - 1] += this._lines[position.lineNumber - 1].substring(position.column - 1);
      this._setLineText(position.lineNumber - 1, this._lines[position.lineNumber - 1].substring(0, position.column - 1) + insertLines[0]);
      let newLengths = new Uint32Array(insertLines.length - 1);
      for (let i = 1; i < insertLines.length; i++) {
        this._lines.splice(position.lineNumber + i - 1, 0, insertLines[i]);
        newLengths[i - 1] = insertLines[i].length + this._eol.length;
      }
      if (this._lineStarts) {
        this._lineStarts.insertValues(position.lineNumber, newLengths);
      }
    }
  };

  // node_modules/monaco-editor/esm/vs/editor/common/model/wordHelper.js
  var USUAL_WORD_SEPARATORS = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";
  function createWordRegExp(allowInWords = "") {
    let source = "(-?\\d*\\.\\d\\w*)|([^";
    for (const sep2 of USUAL_WORD_SEPARATORS) {
      if (allowInWords.indexOf(sep2) >= 0) {
        continue;
      }
      source += "\\" + sep2;
    }
    source += "\\s]+)";
    return new RegExp(source, "g");
  }
  var DEFAULT_WORD_REGEXP = createWordRegExp();
  function ensureValidWordDefinition(wordDefinition) {
    let result = DEFAULT_WORD_REGEXP;
    if (wordDefinition && wordDefinition instanceof RegExp) {
      if (!wordDefinition.global) {
        let flags = "g";
        if (wordDefinition.ignoreCase) {
          flags += "i";
        }
        if (wordDefinition.multiline) {
          flags += "m";
        }
        if (wordDefinition.unicode) {
          flags += "u";
        }
        result = new RegExp(wordDefinition.source, flags);
      } else {
        result = wordDefinition;
      }
    }
    result.lastIndex = 0;
    return result;
  }
  var _defaultConfig = {
    maxLen: 1e3,
    windowSize: 15,
    timeBudget: 150
  };
  function getWordAtText(column, wordDefinition, text, textOffset, config = _defaultConfig) {
    if (text.length > config.maxLen) {
      let start = column - config.maxLen / 2;
      if (start < 0) {
        start = 0;
      } else {
        textOffset += start;
      }
      text = text.substring(start, column + config.maxLen / 2);
      return getWordAtText(column, wordDefinition, text, textOffset, config);
    }
    const t1 = Date.now();
    const pos = column - 1 - textOffset;
    let prevRegexIndex = -1;
    let match = null;
    for (let i = 1; ; i++) {
      if (Date.now() - t1 >= config.timeBudget) {
        break;
      }
      const regexIndex = pos - config.windowSize * i;
      wordDefinition.lastIndex = Math.max(0, regexIndex);
      const thisMatch = _findRegexMatchEnclosingPosition(wordDefinition, text, pos, prevRegexIndex);
      if (!thisMatch && match) {
        break;
      }
      match = thisMatch;
      if (regexIndex <= 0) {
        break;
      }
      prevRegexIndex = regexIndex;
    }
    if (match) {
      let result = {
        word: match[0],
        startColumn: textOffset + 1 + match.index,
        endColumn: textOffset + 1 + match.index + match[0].length
      };
      wordDefinition.lastIndex = 0;
      return result;
    }
    return null;
  }
  function _findRegexMatchEnclosingPosition(wordDefinition, text, pos, stopPos) {
    let match;
    while (match = wordDefinition.exec(text)) {
      const matchIndex = match.index || 0;
      if (matchIndex <= pos && wordDefinition.lastIndex >= pos) {
        return match;
      } else if (stopPos > 0 && matchIndex > stopPos) {
        return null;
      }
    }
    return null;
  }

  // node_modules/monaco-editor/esm/vs/editor/common/core/characterClassifier.js
  var CharacterClassifier = class {
    constructor(_defaultValue) {
      let defaultValue = toUint8(_defaultValue);
      this._defaultValue = defaultValue;
      this._asciiMap = CharacterClassifier._createAsciiMap(defaultValue);
      this._map = new Map();
    }
    static _createAsciiMap(defaultValue) {
      let asciiMap = new Uint8Array(256);
      for (let i = 0; i < 256; i++) {
        asciiMap[i] = defaultValue;
      }
      return asciiMap;
    }
    set(charCode, _value) {
      let value = toUint8(_value);
      if (charCode >= 0 && charCode < 256) {
        this._asciiMap[charCode] = value;
      } else {
        this._map.set(charCode, value);
      }
    }
    get(charCode) {
      if (charCode >= 0 && charCode < 256) {
        return this._asciiMap[charCode];
      } else {
        return this._map.get(charCode) || this._defaultValue;
      }
    }
  };

  // node_modules/monaco-editor/esm/vs/editor/common/modes/linkComputer.js
  var Uint8Matrix = class {
    constructor(rows, cols, defaultValue) {
      const data = new Uint8Array(rows * cols);
      for (let i = 0, len = rows * cols; i < len; i++) {
        data[i] = defaultValue;
      }
      this._data = data;
      this.rows = rows;
      this.cols = cols;
    }
    get(row, col) {
      return this._data[row * this.cols + col];
    }
    set(row, col, value) {
      this._data[row * this.cols + col] = value;
    }
  };
  var StateMachine = class {
    constructor(edges) {
      let maxCharCode = 0;
      let maxState = 0;
      for (let i = 0, len = edges.length; i < len; i++) {
        let [from, chCode, to] = edges[i];
        if (chCode > maxCharCode) {
          maxCharCode = chCode;
        }
        if (from > maxState) {
          maxState = from;
        }
        if (to > maxState) {
          maxState = to;
        }
      }
      maxCharCode++;
      maxState++;
      let states = new Uint8Matrix(maxState, maxCharCode, 0);
      for (let i = 0, len = edges.length; i < len; i++) {
        let [from, chCode, to] = edges[i];
        states.set(from, chCode, to);
      }
      this._states = states;
      this._maxCharCode = maxCharCode;
    }
    nextState(currentState, chCode) {
      if (chCode < 0 || chCode >= this._maxCharCode) {
        return 0;
      }
      return this._states.get(currentState, chCode);
    }
  };
  var _stateMachine = null;
  function getStateMachine() {
    if (_stateMachine === null) {
      _stateMachine = new StateMachine([
        [1, 104, 2],
        [1, 72, 2],
        [1, 102, 6],
        [1, 70, 6],
        [2, 116, 3],
        [2, 84, 3],
        [3, 116, 4],
        [3, 84, 4],
        [4, 112, 5],
        [4, 80, 5],
        [5, 115, 9],
        [5, 83, 9],
        [5, 58, 10],
        [6, 105, 7],
        [6, 73, 7],
        [7, 108, 8],
        [7, 76, 8],
        [8, 101, 9],
        [8, 69, 9],
        [9, 58, 10],
        [10, 47, 11],
        [11, 47, 12]
      ]);
    }
    return _stateMachine;
  }
  var _classifier = null;
  function getClassifier() {
    if (_classifier === null) {
      _classifier = new CharacterClassifier(0);
      const FORCE_TERMINATION_CHARACTERS = ` 	<>'"\u3001\u3002\uFF61\uFF64\uFF0C\uFF0E\uFF1A\uFF1B\u2018\u3008\u300C\u300E\u3014\uFF08\uFF3B\uFF5B\uFF62\uFF63\uFF5D\uFF3D\uFF09\u3015\u300F\u300D\u3009\u2019\uFF40\uFF5E\u2026`;
      for (let i = 0; i < FORCE_TERMINATION_CHARACTERS.length; i++) {
        _classifier.set(FORCE_TERMINATION_CHARACTERS.charCodeAt(i), 1);
      }
      const CANNOT_END_WITH_CHARACTERS = ".,;";
      for (let i = 0; i < CANNOT_END_WITH_CHARACTERS.length; i++) {
        _classifier.set(CANNOT_END_WITH_CHARACTERS.charCodeAt(i), 2);
      }
    }
    return _classifier;
  }
  var LinkComputer = class {
    static _createLink(classifier, line, lineNumber, linkBeginIndex, linkEndIndex) {
      let lastIncludedCharIndex = linkEndIndex - 1;
      do {
        const chCode = line.charCodeAt(lastIncludedCharIndex);
        const chClass = classifier.get(chCode);
        if (chClass !== 2) {
          break;
        }
        lastIncludedCharIndex--;
      } while (lastIncludedCharIndex > linkBeginIndex);
      if (linkBeginIndex > 0) {
        const charCodeBeforeLink = line.charCodeAt(linkBeginIndex - 1);
        const lastCharCodeInLink = line.charCodeAt(lastIncludedCharIndex);
        if (charCodeBeforeLink === 40 && lastCharCodeInLink === 41 || charCodeBeforeLink === 91 && lastCharCodeInLink === 93 || charCodeBeforeLink === 123 && lastCharCodeInLink === 125) {
          lastIncludedCharIndex--;
        }
      }
      return {
        range: {
          startLineNumber: lineNumber,
          startColumn: linkBeginIndex + 1,
          endLineNumber: lineNumber,
          endColumn: lastIncludedCharIndex + 2
        },
        url: line.substring(linkBeginIndex, lastIncludedCharIndex + 1)
      };
    }
    static computeLinks(model, stateMachine = getStateMachine()) {
      const classifier = getClassifier();
      let result = [];
      for (let i = 1, lineCount = model.getLineCount(); i <= lineCount; i++) {
        const line = model.getLineContent(i);
        const len = line.length;
        let j = 0;
        let linkBeginIndex = 0;
        let linkBeginChCode = 0;
        let state = 1;
        let hasOpenParens = false;
        let hasOpenSquareBracket = false;
        let inSquareBrackets = false;
        let hasOpenCurlyBracket = false;
        while (j < len) {
          let resetStateMachine = false;
          const chCode = line.charCodeAt(j);
          if (state === 13) {
            let chClass;
            switch (chCode) {
              case 40:
                hasOpenParens = true;
                chClass = 0;
                break;
              case 41:
                chClass = hasOpenParens ? 0 : 1;
                break;
              case 91:
                inSquareBrackets = true;
                hasOpenSquareBracket = true;
                chClass = 0;
                break;
              case 93:
                inSquareBrackets = false;
                chClass = hasOpenSquareBracket ? 0 : 1;
                break;
              case 123:
                hasOpenCurlyBracket = true;
                chClass = 0;
                break;
              case 125:
                chClass = hasOpenCurlyBracket ? 0 : 1;
                break;
              case 39:
                chClass = linkBeginChCode === 34 || linkBeginChCode === 96 ? 0 : 1;
                break;
              case 34:
                chClass = linkBeginChCode === 39 || linkBeginChCode === 96 ? 0 : 1;
                break;
              case 96:
                chClass = linkBeginChCode === 39 || linkBeginChCode === 34 ? 0 : 1;
                break;
              case 42:
                chClass = linkBeginChCode === 42 ? 1 : 0;
                break;
              case 124:
                chClass = linkBeginChCode === 124 ? 1 : 0;
                break;
              case 32:
                chClass = inSquareBrackets ? 0 : 1;
                break;
              default:
                chClass = classifier.get(chCode);
            }
            if (chClass === 1) {
              result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, j));
              resetStateMachine = true;
            }
          } else if (state === 12) {
            let chClass;
            if (chCode === 91) {
              hasOpenSquareBracket = true;
              chClass = 0;
            } else {
              chClass = classifier.get(chCode);
            }
            if (chClass === 1) {
              resetStateMachine = true;
            } else {
              state = 13;
            }
          } else {
            state = stateMachine.nextState(state, chCode);
            if (state === 0) {
              resetStateMachine = true;
            }
          }
          if (resetStateMachine) {
            state = 1;
            hasOpenParens = false;
            hasOpenSquareBracket = false;
            hasOpenCurlyBracket = false;
            linkBeginIndex = j + 1;
            linkBeginChCode = chCode;
          }
          j++;
        }
        if (state === 13) {
          result.push(LinkComputer._createLink(classifier, line, i, linkBeginIndex, len));
        }
      }
      return result;
    }
  };
  function computeLinks(model) {
    if (!model || typeof model.getLineCount !== "function" || typeof model.getLineContent !== "function") {
      return [];
    }
    return LinkComputer.computeLinks(model);
  }

  // node_modules/monaco-editor/esm/vs/editor/common/modes/supports/inplaceReplaceSupport.js
  var BasicInplaceReplace = class {
    constructor() {
      this._defaultValueSet = [
        ["true", "false"],
        ["True", "False"],
        ["Private", "Public", "Friend", "ReadOnly", "Partial", "Protected", "WriteOnly"],
        ["public", "protected", "private"]
      ];
    }
    navigateValueSet(range1, text1, range2, text2, up) {
      if (range1 && text1) {
        let result = this.doNavigateValueSet(text1, up);
        if (result) {
          return {
            range: range1,
            value: result
          };
        }
      }
      if (range2 && text2) {
        let result = this.doNavigateValueSet(text2, up);
        if (result) {
          return {
            range: range2,
            value: result
          };
        }
      }
      return null;
    }
    doNavigateValueSet(text, up) {
      let numberResult = this.numberReplace(text, up);
      if (numberResult !== null) {
        return numberResult;
      }
      return this.textReplace(text, up);
    }
    numberReplace(value, up) {
      let precision = Math.pow(10, value.length - (value.lastIndexOf(".") + 1));
      let n1 = Number(value);
      let n2 = parseFloat(value);
      if (!isNaN(n1) && !isNaN(n2) && n1 === n2) {
        if (n1 === 0 && !up) {
          return null;
        } else {
          n1 = Math.floor(n1 * precision);
          n1 += up ? precision : -precision;
          return String(n1 / precision);
        }
      }
      return null;
    }
    textReplace(value, up) {
      return this.valueSetsReplace(this._defaultValueSet, value, up);
    }
    valueSetsReplace(valueSets, value, up) {
      let result = null;
      for (let i = 0, len = valueSets.length; result === null && i < len; i++) {
        result = this.valueSetReplace(valueSets[i], value, up);
      }
      return result;
    }
    valueSetReplace(valueSet, value, up) {
      let idx = valueSet.indexOf(value);
      if (idx >= 0) {
        idx += up ? 1 : -1;
        if (idx < 0) {
          idx = valueSet.length - 1;
        } else {
          idx %= valueSet.length;
        }
        return valueSet[idx];
      }
      return null;
    }
  };
  BasicInplaceReplace.INSTANCE = new BasicInplaceReplace();

  // node_modules/monaco-editor/esm/vs/base/common/linkedList.js
  var Node = class {
    constructor(element) {
      this.element = element;
      this.next = Node.Undefined;
      this.prev = Node.Undefined;
    }
  };
  Node.Undefined = new Node(void 0);
  var LinkedList = class {
    constructor() {
      this._first = Node.Undefined;
      this._last = Node.Undefined;
      this._size = 0;
    }
    get size() {
      return this._size;
    }
    isEmpty() {
      return this._first === Node.Undefined;
    }
    clear() {
      let node = this._first;
      while (node !== Node.Undefined) {
        const next = node.next;
        node.prev = Node.Undefined;
        node.next = Node.Undefined;
        node = next;
      }
      this._first = Node.Undefined;
      this._last = Node.Undefined;
      this._size = 0;
    }
    unshift(element) {
      return this._insert(element, false);
    }
    push(element) {
      return this._insert(element, true);
    }
    _insert(element, atTheEnd) {
      const newNode = new Node(element);
      if (this._first === Node.Undefined) {
        this._first = newNode;
        this._last = newNode;
      } else if (atTheEnd) {
        const oldLast = this._last;
        this._last = newNode;
        newNode.prev = oldLast;
        oldLast.next = newNode;
      } else {
        const oldFirst = this._first;
        this._first = newNode;
        newNode.next = oldFirst;
        oldFirst.prev = newNode;
      }
      this._size += 1;
      let didRemove = false;
      return () => {
        if (!didRemove) {
          didRemove = true;
          this._remove(newNode);
        }
      };
    }
    shift() {
      if (this._first === Node.Undefined) {
        return void 0;
      } else {
        const res = this._first.element;
        this._remove(this._first);
        return res;
      }
    }
    pop() {
      if (this._last === Node.Undefined) {
        return void 0;
      } else {
        const res = this._last.element;
        this._remove(this._last);
        return res;
      }
    }
    _remove(node) {
      if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
        const anchor = node.prev;
        anchor.next = node.next;
        node.next.prev = anchor;
      } else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
        this._first = Node.Undefined;
        this._last = Node.Undefined;
      } else if (node.next === Node.Undefined) {
        this._last = this._last.prev;
        this._last.next = Node.Undefined;
      } else if (node.prev === Node.Undefined) {
        this._first = this._first.next;
        this._first.prev = Node.Undefined;
      }
      this._size -= 1;
    }
    *[Symbol.iterator]() {
      let node = this._first;
      while (node !== Node.Undefined) {
        yield node.element;
        node = node.next;
      }
    }
  };

  // node_modules/monaco-editor/esm/vs/base/common/stopwatch.js
  var hasPerformanceNow = globals.performance && typeof globals.performance.now === "function";
  var StopWatch = class {
    constructor(highResolution) {
      this._highResolution = hasPerformanceNow && highResolution;
      this._startTime = this._now();
      this._stopTime = -1;
    }
    static create(highResolution = true) {
      return new StopWatch(highResolution);
    }
    stop() {
      this._stopTime = this._now();
    }
    elapsed() {
      if (this._stopTime !== -1) {
        return this._stopTime - this._startTime;
      }
      return this._now() - this._startTime;
    }
    _now() {
      return this._highResolution ? globals.performance.now() : Date.now();
    }
  };

  // node_modules/monaco-editor/esm/vs/base/common/event.js
  var Event;
  (function(Event2) {
    Event2.None = () => Disposable.None;
    function once(event) {
      return (listener, thisArgs = null, disposables) => {
        let didFire = false;
        let result;
        result = event((e) => {
          if (didFire) {
            return;
          } else if (result) {
            result.dispose();
          } else {
            didFire = true;
          }
          return listener.call(thisArgs, e);
        }, null, disposables);
        if (didFire) {
          result.dispose();
        }
        return result;
      };
    }
    Event2.once = once;
    function map(event, map2) {
      return snapshot((listener, thisArgs = null, disposables) => event((i) => listener.call(thisArgs, map2(i)), null, disposables));
    }
    Event2.map = map;
    function forEach(event, each) {
      return snapshot((listener, thisArgs = null, disposables) => event((i) => {
        each(i);
        listener.call(thisArgs, i);
      }, null, disposables));
    }
    Event2.forEach = forEach;
    function filter(event, filter2) {
      return snapshot((listener, thisArgs = null, disposables) => event((e) => filter2(e) && listener.call(thisArgs, e), null, disposables));
    }
    Event2.filter = filter;
    function signal(event) {
      return event;
    }
    Event2.signal = signal;
    function any(...events) {
      return (listener, thisArgs = null, disposables) => combinedDisposable(...events.map((event) => event((e) => listener.call(thisArgs, e), null, disposables)));
    }
    Event2.any = any;
    function reduce(event, merge, initial) {
      let output = initial;
      return map(event, (e) => {
        output = merge(output, e);
        return output;
      });
    }
    Event2.reduce = reduce;
    function snapshot(event) {
      let listener;
      const emitter = new Emitter({
        onFirstListenerAdd() {
          listener = event(emitter.fire, emitter);
        },
        onLastListenerRemove() {
          listener.dispose();
        }
      });
      return emitter.event;
    }
    Event2.snapshot = snapshot;
    function debounce(event, merge, delay = 100, leading = false, leakWarningThreshold) {
      let subscription;
      let output = void 0;
      let handle = void 0;
      let numDebouncedCalls = 0;
      const emitter = new Emitter({
        leakWarningThreshold,
        onFirstListenerAdd() {
          subscription = event((cur) => {
            numDebouncedCalls++;
            output = merge(output, cur);
            if (leading && !handle) {
              emitter.fire(output);
              output = void 0;
            }
            clearTimeout(handle);
            handle = setTimeout(() => {
              const _output = output;
              output = void 0;
              handle = void 0;
              if (!leading || numDebouncedCalls > 1) {
                emitter.fire(_output);
              }
              numDebouncedCalls = 0;
            }, delay);
          });
        },
        onLastListenerRemove() {
          subscription.dispose();
        }
      });
      return emitter.event;
    }
    Event2.debounce = debounce;
    function stopwatch(event) {
      const start = new Date().getTime();
      return map(once(event), (_) => new Date().getTime() - start);
    }
    Event2.stopwatch = stopwatch;
    function latch(event, equals = (a, b) => a === b) {
      let firstCall = true;
      let cache;
      return filter(event, (value) => {
        const shouldEmit = firstCall || !equals(value, cache);
        firstCall = false;
        cache = value;
        return shouldEmit;
      });
    }
    Event2.latch = latch;
    function split(event, isT) {
      return [
        Event2.filter(event, isT),
        Event2.filter(event, (e) => !isT(e))
      ];
    }
    Event2.split = split;
    function buffer(event, nextTick = false, _buffer = []) {
      let buffer2 = _buffer.slice();
      let listener = event((e) => {
        if (buffer2) {
          buffer2.push(e);
        } else {
          emitter.fire(e);
        }
      });
      const flush = () => {
        if (buffer2) {
          buffer2.forEach((e) => emitter.fire(e));
        }
        buffer2 = null;
      };
      const emitter = new Emitter({
        onFirstListenerAdd() {
          if (!listener) {
            listener = event((e) => emitter.fire(e));
          }
        },
        onFirstListenerDidAdd() {
          if (buffer2) {
            if (nextTick) {
              setTimeout(flush);
            } else {
              flush();
            }
          }
        },
        onLastListenerRemove() {
          if (listener) {
            listener.dispose();
          }
          listener = null;
        }
      });
      return emitter.event;
    }
    Event2.buffer = buffer;
    class ChainableEvent {
      constructor(event) {
        this.event = event;
      }
      map(fn) {
        return new ChainableEvent(map(this.event, fn));
      }
      forEach(fn) {
        return new ChainableEvent(forEach(this.event, fn));
      }
      filter(fn) {
        return new ChainableEvent(filter(this.event, fn));
      }
      reduce(merge, initial) {
        return new ChainableEvent(reduce(this.event, merge, initial));
      }
      latch() {
        return new ChainableEvent(latch(this.event));
      }
      debounce(merge, delay = 100, leading = false, leakWarningThreshold) {
        return new ChainableEvent(debounce(this.event, merge, delay, leading, leakWarningThreshold));
      }
      on(listener, thisArgs, disposables) {
        return this.event(listener, thisArgs, disposables);
      }
      once(listener, thisArgs, disposables) {
        return once(this.event)(listener, thisArgs, disposables);
      }
    }
    function chain(event) {
      return new ChainableEvent(event);
    }
    Event2.chain = chain;
    function fromNodeEventEmitter(emitter, eventName, map2 = (id) => id) {
      const fn = (...args) => result.fire(map2(...args));
      const onFirstListenerAdd = () => emitter.on(eventName, fn);
      const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
      const result = new Emitter({onFirstListenerAdd, onLastListenerRemove});
      return result.event;
    }
    Event2.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromDOMEventEmitter(emitter, eventName, map2 = (id) => id) {
      const fn = (...args) => result.fire(map2(...args));
      const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
      const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
      const result = new Emitter({onFirstListenerAdd, onLastListenerRemove});
      return result.event;
    }
    Event2.fromDOMEventEmitter = fromDOMEventEmitter;
    function fromPromise(promise) {
      const emitter = new Emitter();
      let shouldEmit = false;
      promise.then(void 0, () => null).then(() => {
        if (!shouldEmit) {
          setTimeout(() => emitter.fire(void 0), 0);
        } else {
          emitter.fire(void 0);
        }
      });
      shouldEmit = true;
      return emitter.event;
    }
    Event2.fromPromise = fromPromise;
    function toPromise(event) {
      return new Promise((resolve2) => once(event)(resolve2));
    }
    Event2.toPromise = toPromise;
  })(Event || (Event = {}));
  var EventProfiling = class {
    constructor(name) {
      this._listenerCount = 0;
      this._invocationCount = 0;
      this._elapsedOverall = 0;
      this._name = `${name}_${EventProfiling._idPool++}`;
    }
    start(listenerCount) {
      this._stopWatch = new StopWatch(true);
      this._listenerCount = listenerCount;
    }
    stop() {
      if (this._stopWatch) {
        const elapsed = this._stopWatch.elapsed();
        this._elapsedOverall += elapsed;
        this._invocationCount += 1;
        console.info(`did FIRE ${this._name}: elapsed_ms: ${elapsed.toFixed(5)}, listener: ${this._listenerCount} (elapsed_overall: ${this._elapsedOverall.toFixed(2)}, invocations: ${this._invocationCount})`);
        this._stopWatch = void 0;
      }
    }
  };
  EventProfiling._idPool = 0;
  var _globalLeakWarningThreshold = -1;
  var LeakageMonitor = class {
    constructor(customThreshold, name = Math.random().toString(18).slice(2, 5)) {
      this.customThreshold = customThreshold;
      this.name = name;
      this._warnCountdown = 0;
    }
    dispose() {
      if (this._stacks) {
        this._stacks.clear();
      }
    }
    check(listenerCount) {
      let threshold = _globalLeakWarningThreshold;
      if (typeof this.customThreshold === "number") {
        threshold = this.customThreshold;
      }
      if (threshold <= 0 || listenerCount < threshold) {
        return void 0;
      }
      if (!this._stacks) {
        this._stacks = new Map();
      }
      const stack = new Error().stack.split("\n").slice(3).join("\n");
      const count = this._stacks.get(stack) || 0;
      this._stacks.set(stack, count + 1);
      this._warnCountdown -= 1;
      if (this._warnCountdown <= 0) {
        this._warnCountdown = threshold * 0.5;
        let topStack;
        let topCount = 0;
        for (const [stack2, count2] of this._stacks) {
          if (!topStack || topCount < count2) {
            topStack = stack2;
            topCount = count2;
          }
        }
        console.warn(`[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`);
        console.warn(topStack);
      }
      return () => {
        const count2 = this._stacks.get(stack) || 0;
        this._stacks.set(stack, count2 - 1);
      };
    }
  };
  var Emitter = class {
    constructor(options) {
      var _a2;
      this._disposed = false;
      this._options = options;
      this._leakageMon = _globalLeakWarningThreshold > 0 ? new LeakageMonitor(this._options && this._options.leakWarningThreshold) : void 0;
      this._perfMon = ((_a2 = this._options) === null || _a2 === void 0 ? void 0 : _a2._profName) ? new EventProfiling(this._options._profName) : void 0;
    }
    get event() {
      if (!this._event) {
        this._event = (listener, thisArgs, disposables) => {
          var _a2;
          if (!this._listeners) {
            this._listeners = new LinkedList();
          }
          const firstListener = this._listeners.isEmpty();
          if (firstListener && this._options && this._options.onFirstListenerAdd) {
            this._options.onFirstListenerAdd(this);
          }
          const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs]);
          if (firstListener && this._options && this._options.onFirstListenerDidAdd) {
            this._options.onFirstListenerDidAdd(this);
          }
          if (this._options && this._options.onListenerDidAdd) {
            this._options.onListenerDidAdd(this, listener, thisArgs);
          }
          const removeMonitor = (_a2 = this._leakageMon) === null || _a2 === void 0 ? void 0 : _a2.check(this._listeners.size);
          let result;
          result = {
            dispose: () => {
              if (removeMonitor) {
                removeMonitor();
              }
              result.dispose = Emitter._noop;
              if (!this._disposed) {
                remove();
                if (this._options && this._options.onLastListenerRemove) {
                  const hasListeners = this._listeners && !this._listeners.isEmpty();
                  if (!hasListeners) {
                    this._options.onLastListenerRemove(this);
                  }
                }
              }
            }
          };
          if (disposables instanceof DisposableStore) {
            disposables.add(result);
          } else if (Array.isArray(disposables)) {
            disposables.push(result);
          }
          return result;
        };
      }
      return this._event;
    }
    fire(event) {
      var _a2, _b;
      if (this._listeners) {
        if (!this._deliveryQueue) {
          this._deliveryQueue = new LinkedList();
        }
        for (let listener of this._listeners) {
          this._deliveryQueue.push([listener, event]);
        }
        (_a2 = this._perfMon) === null || _a2 === void 0 ? void 0 : _a2.start(this._deliveryQueue.size);
        while (this._deliveryQueue.size > 0) {
          const [listener, event2] = this._deliveryQueue.shift();
          try {
            if (typeof listener === "function") {
              listener.call(void 0, event2);
            } else {
              listener[0].call(listener[1], event2);
            }
          } catch (e) {
            onUnexpectedError(e);
          }
        }
        (_b = this._perfMon) === null || _b === void 0 ? void 0 : _b.stop();
      }
    }
    dispose() {
      var _a2, _b, _c, _d, _e;
      if (!this._disposed) {
        this._disposed = true;
        (_a2 = this._listeners) === null || _a2 === void 0 ? void 0 : _a2.clear();
        (_b = this._deliveryQueue) === null || _b === void 0 ? void 0 : _b.clear();
        (_d = (_c = this._options) === null || _c === void 0 ? void 0 : _c.onLastListenerRemove) === null || _d === void 0 ? void 0 : _d.call(_c);
        (_e = this._leakageMon) === null || _e === void 0 ? void 0 : _e.dispose();
      }
    }
  };
  Emitter._noop = function() {
  };

  // node_modules/monaco-editor/esm/vs/base/common/cancellation.js
  var shortcutEvent = Object.freeze(function(callback, context) {
    const handle = setTimeout(callback.bind(context), 0);
    return {dispose() {
      clearTimeout(handle);
    }};
  });
  var CancellationToken;
  (function(CancellationToken2) {
    function isCancellationToken(thing) {
      if (thing === CancellationToken2.None || thing === CancellationToken2.Cancelled) {
        return true;
      }
      if (thing instanceof MutableToken) {
        return true;
      }
      if (!thing || typeof thing !== "object") {
        return false;
      }
      return typeof thing.isCancellationRequested === "boolean" && typeof thing.onCancellationRequested === "function";
    }
    CancellationToken2.isCancellationToken = isCancellationToken;
    CancellationToken2.None = Object.freeze({
      isCancellationRequested: false,
      onCancellationRequested: Event.None
    });
    CancellationToken2.Cancelled = Object.freeze({
      isCancellationRequested: true,
      onCancellationRequested: shortcutEvent
    });
  })(CancellationToken || (CancellationToken = {}));
  var MutableToken = class {
    constructor() {
      this._isCancelled = false;
      this._emitter = null;
    }
    cancel() {
      if (!this._isCancelled) {
        this._isCancelled = true;
        if (this._emitter) {
          this._emitter.fire(void 0);
          this.dispose();
        }
      }
    }
    get isCancellationRequested() {
      return this._isCancelled;
    }
    get onCancellationRequested() {
      if (this._isCancelled) {
        return shortcutEvent;
      }
      if (!this._emitter) {
        this._emitter = new Emitter();
      }
      return this._emitter.event;
    }
    dispose() {
      if (this._emitter) {
        this._emitter.dispose();
        this._emitter = null;
      }
    }
  };
  var CancellationTokenSource = class {
    constructor(parent) {
      this._token = void 0;
      this._parentListener = void 0;
      this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
    }
    get token() {
      if (!this._token) {
        this._token = new MutableToken();
      }
      return this._token;
    }
    cancel() {
      if (!this._token) {
        this._token = CancellationToken.Cancelled;
      } else if (this._token instanceof MutableToken) {
        this._token.cancel();
      }
    }
    dispose(cancel = false) {
      if (cancel) {
        this.cancel();
      }
      if (this._parentListener) {
        this._parentListener.dispose();
      }
      if (!this._token) {
        this._token = CancellationToken.None;
      } else if (this._token instanceof MutableToken) {
        this._token.dispose();
      }
    }
  };

  // node_modules/monaco-editor/esm/vs/base/common/keyCodes.js
  var KeyCodeStrMap = class {
    constructor() {
      this._keyCodeToStr = [];
      this._strToKeyCode = Object.create(null);
    }
    define(keyCode, str) {
      this._keyCodeToStr[keyCode] = str;
      this._strToKeyCode[str.toLowerCase()] = keyCode;
    }
    keyCodeToStr(keyCode) {
      return this._keyCodeToStr[keyCode];
    }
    strToKeyCode(str) {
      return this._strToKeyCode[str.toLowerCase()] || 0;
    }
  };
  var uiMap = new KeyCodeStrMap();
  var userSettingsUSMap = new KeyCodeStrMap();
  var userSettingsGeneralMap = new KeyCodeStrMap();
  (function() {
    function define(keyCode, uiLabel, usUserSettingsLabel = uiLabel, generalUserSettingsLabel = usUserSettingsLabel) {
      uiMap.define(keyCode, uiLabel);
      userSettingsUSMap.define(keyCode, usUserSettingsLabel);
      userSettingsGeneralMap.define(keyCode, generalUserSettingsLabel);
    }
    define(0, "unknown");
    define(1, "Backspace");
    define(2, "Tab");
    define(3, "Enter");
    define(4, "Shift");
    define(5, "Ctrl");
    define(6, "Alt");
    define(7, "PauseBreak");
    define(8, "CapsLock");
    define(9, "Escape");
    define(10, "Space");
    define(11, "PageUp");
    define(12, "PageDown");
    define(13, "End");
    define(14, "Home");
    define(15, "LeftArrow", "Left");
    define(16, "UpArrow", "Up");
    define(17, "RightArrow", "Right");
    define(18, "DownArrow", "Down");
    define(19, "Insert");
    define(20, "Delete");
    define(21, "0");
    define(22, "1");
    define(23, "2");
    define(24, "3");
    define(25, "4");
    define(26, "5");
    define(27, "6");
    define(28, "7");
    define(29, "8");
    define(30, "9");
    define(31, "A");
    define(32, "B");
    define(33, "C");
    define(34, "D");
    define(35, "E");
    define(36, "F");
    define(37, "G");
    define(38, "H");
    define(39, "I");
    define(40, "J");
    define(41, "K");
    define(42, "L");
    define(43, "M");
    define(44, "N");
    define(45, "O");
    define(46, "P");
    define(47, "Q");
    define(48, "R");
    define(49, "S");
    define(50, "T");
    define(51, "U");
    define(52, "V");
    define(53, "W");
    define(54, "X");
    define(55, "Y");
    define(56, "Z");
    define(57, "Meta");
    define(58, "ContextMenu");
    define(59, "F1");
    define(60, "F2");
    define(61, "F3");
    define(62, "F4");
    define(63, "F5");
    define(64, "F6");
    define(65, "F7");
    define(66, "F8");
    define(67, "F9");
    define(68, "F10");
    define(69, "F11");
    define(70, "F12");
    define(71, "F13");
    define(72, "F14");
    define(73, "F15");
    define(74, "F16");
    define(75, "F17");
    define(76, "F18");
    define(77, "F19");
    define(78, "NumLock");
    define(79, "ScrollLock");
    define(80, ";", ";", "OEM_1");
    define(81, "=", "=", "OEM_PLUS");
    define(82, ",", ",", "OEM_COMMA");
    define(83, "-", "-", "OEM_MINUS");
    define(84, ".", ".", "OEM_PERIOD");
    define(85, "/", "/", "OEM_2");
    define(86, "`", "`", "OEM_3");
    define(110, "ABNT_C1");
    define(111, "ABNT_C2");
    define(87, "[", "[", "OEM_4");
    define(88, "\\", "\\", "OEM_5");
    define(89, "]", "]", "OEM_6");
    define(90, "'", "'", "OEM_7");
    define(91, "OEM_8");
    define(92, "OEM_102");
    define(93, "NumPad0");
    define(94, "NumPad1");
    define(95, "NumPad2");
    define(96, "NumPad3");
    define(97, "NumPad4");
    define(98, "NumPad5");
    define(99, "NumPad6");
    define(100, "NumPad7");
    define(101, "NumPad8");
    define(102, "NumPad9");
    define(103, "NumPad_Multiply");
    define(104, "NumPad_Add");
    define(105, "NumPad_Separator");
    define(106, "NumPad_Subtract");
    define(107, "NumPad_Decimal");
    define(108, "NumPad_Divide");
  })();
  var KeyCodeUtils;
  (function(KeyCodeUtils2) {
    function toString(keyCode) {
      return uiMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils2.toString = toString;
    function fromString(key) {
      return uiMap.strToKeyCode(key);
    }
    KeyCodeUtils2.fromString = fromString;
    function toUserSettingsUS(keyCode) {
      return userSettingsUSMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils2.toUserSettingsUS = toUserSettingsUS;
    function toUserSettingsGeneral(keyCode) {
      return userSettingsGeneralMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils2.toUserSettingsGeneral = toUserSettingsGeneral;
    function fromUserSettings(key) {
      return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
    }
    KeyCodeUtils2.fromUserSettings = fromUserSettings;
  })(KeyCodeUtils || (KeyCodeUtils = {}));
  function KeyChord(firstPart, secondPart) {
    const chordPart = (secondPart & 65535) << 16 >>> 0;
    return (firstPart | chordPart) >>> 0;
  }

  // node_modules/monaco-editor/esm/vs/editor/common/core/selection.js
  var Selection = class extends Range {
    constructor(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn) {
      super(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn);
      this.selectionStartLineNumber = selectionStartLineNumber;
      this.selectionStartColumn = selectionStartColumn;
      this.positionLineNumber = positionLineNumber;
      this.positionColumn = positionColumn;
    }
    toString() {
      return "[" + this.selectionStartLineNumber + "," + this.selectionStartColumn + " -> " + this.positionLineNumber + "," + this.positionColumn + "]";
    }
    equalsSelection(other) {
      return Selection.selectionsEqual(this, other);
    }
    static selectionsEqual(a, b) {
      return a.selectionStartLineNumber === b.selectionStartLineNumber && a.selectionStartColumn === b.selectionStartColumn && a.positionLineNumber === b.positionLineNumber && a.positionColumn === b.positionColumn;
    }
    getDirection() {
      if (this.selectionStartLineNumber === this.startLineNumber && this.selectionStartColumn === this.startColumn) {
        return 0;
      }
      return 1;
    }
    setEndPosition(endLineNumber, endColumn) {
      if (this.getDirection() === 0) {
        return new Selection(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
      }
      return new Selection(endLineNumber, endColumn, this.startLineNumber, this.startColumn);
    }
    getPosition() {
      return new Position(this.positionLineNumber, this.positionColumn);
    }
    setStartPosition(startLineNumber, startColumn) {
      if (this.getDirection() === 0) {
        return new Selection(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
      }
      return new Selection(this.endLineNumber, this.endColumn, startLineNumber, startColumn);
    }
    static fromPositions(start, end = start) {
      return new Selection(start.lineNumber, start.column, end.lineNumber, end.column);
    }
    static liftSelection(sel) {
      return new Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
    }
    static selectionsArrEqual(a, b) {
      if (a && !b || !a && b) {
        return false;
      }
      if (!a && !b) {
        return true;
      }
      if (a.length !== b.length) {
        return false;
      }
      for (let i = 0, len = a.length; i < len; i++) {
        if (!this.selectionsEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
    static isISelection(obj) {
      return obj && typeof obj.selectionStartLineNumber === "number" && typeof obj.selectionStartColumn === "number" && typeof obj.positionLineNumber === "number" && typeof obj.positionColumn === "number";
    }
    static createWithDirection(startLineNumber, startColumn, endLineNumber, endColumn, direction) {
      if (direction === 0) {
        return new Selection(startLineNumber, startColumn, endLineNumber, endColumn);
      }
      return new Selection(endLineNumber, endColumn, startLineNumber, startColumn);
    }
  };

  // node_modules/monaco-editor/esm/vs/editor/common/core/token.js
  var Token = class {
    constructor(offset, type, language) {
      this.offset = offset | 0;
      this.type = type;
      this.language = language;
    }
    toString() {
      return "(" + this.offset + ", " + this.type + ")";
    }
  };

  // node_modules/monaco-editor/esm/vs/editor/common/standalone/standaloneEnums.js
  var AccessibilitySupport;
  (function(AccessibilitySupport2) {
    AccessibilitySupport2[AccessibilitySupport2["Unknown"] = 0] = "Unknown";
    AccessibilitySupport2[AccessibilitySupport2["Disabled"] = 1] = "Disabled";
    AccessibilitySupport2[AccessibilitySupport2["Enabled"] = 2] = "Enabled";
  })(AccessibilitySupport || (AccessibilitySupport = {}));
  var CompletionItemInsertTextRule;
  (function(CompletionItemInsertTextRule2) {
    CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["KeepWhitespace"] = 1] = "KeepWhitespace";
    CompletionItemInsertTextRule2[CompletionItemInsertTextRule2["InsertAsSnippet"] = 4] = "InsertAsSnippet";
  })(CompletionItemInsertTextRule || (CompletionItemInsertTextRule = {}));
  var CompletionItemKind;
  (function(CompletionItemKind2) {
    CompletionItemKind2[CompletionItemKind2["Method"] = 0] = "Method";
    CompletionItemKind2[CompletionItemKind2["Function"] = 1] = "Function";
    CompletionItemKind2[CompletionItemKind2["Constructor"] = 2] = "Constructor";
    CompletionItemKind2[CompletionItemKind2["Field"] = 3] = "Field";
    CompletionItemKind2[CompletionItemKind2["Variable"] = 4] = "Variable";
    CompletionItemKind2[CompletionItemKind2["Class"] = 5] = "Class";
    CompletionItemKind2[CompletionItemKind2["Struct"] = 6] = "Struct";
    CompletionItemKind2[CompletionItemKind2["Interface"] = 7] = "Interface";
    CompletionItemKind2[CompletionItemKind2["Module"] = 8] = "Module";
    CompletionItemKind2[CompletionItemKind2["Property"] = 9] = "Property";
    CompletionItemKind2[CompletionItemKind2["Event"] = 10] = "Event";
    CompletionItemKind2[CompletionItemKind2["Operator"] = 11] = "Operator";
    CompletionItemKind2[CompletionItemKind2["Unit"] = 12] = "Unit";
    CompletionItemKind2[CompletionItemKind2["Value"] = 13] = "Value";
    CompletionItemKind2[CompletionItemKind2["Constant"] = 14] = "Constant";
    CompletionItemKind2[CompletionItemKind2["Enum"] = 15] = "Enum";
    CompletionItemKind2[CompletionItemKind2["EnumMember"] = 16] = "EnumMember";
    CompletionItemKind2[CompletionItemKind2["Keyword"] = 17] = "Keyword";
    CompletionItemKind2[CompletionItemKind2["Text"] = 18] = "Text";
    CompletionItemKind2[CompletionItemKind2["Color"] = 19] = "Color";
    CompletionItemKind2[CompletionItemKind2["File"] = 20] = "File";
    CompletionItemKind2[CompletionItemKind2["Reference"] = 21] = "Reference";
    CompletionItemKind2[CompletionItemKind2["Customcolor"] = 22] = "Customcolor";
    CompletionItemKind2[CompletionItemKind2["Folder"] = 23] = "Folder";
    CompletionItemKind2[CompletionItemKind2["TypeParameter"] = 24] = "TypeParameter";
    CompletionItemKind2[CompletionItemKind2["User"] = 25] = "User";
    CompletionItemKind2[CompletionItemKind2["Issue"] = 26] = "Issue";
    CompletionItemKind2[CompletionItemKind2["Snippet"] = 27] = "Snippet";
  })(CompletionItemKind || (CompletionItemKind = {}));
  var CompletionItemTag;
  (function(CompletionItemTag2) {
    CompletionItemTag2[CompletionItemTag2["Deprecated"] = 1] = "Deprecated";
  })(CompletionItemTag || (CompletionItemTag = {}));
  var CompletionTriggerKind;
  (function(CompletionTriggerKind2) {
    CompletionTriggerKind2[CompletionTriggerKind2["Invoke"] = 0] = "Invoke";
    CompletionTriggerKind2[CompletionTriggerKind2["TriggerCharacter"] = 1] = "TriggerCharacter";
    CompletionTriggerKind2[CompletionTriggerKind2["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
  })(CompletionTriggerKind || (CompletionTriggerKind = {}));
  var ContentWidgetPositionPreference;
  (function(ContentWidgetPositionPreference2) {
    ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["EXACT"] = 0] = "EXACT";
    ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["ABOVE"] = 1] = "ABOVE";
    ContentWidgetPositionPreference2[ContentWidgetPositionPreference2["BELOW"] = 2] = "BELOW";
  })(ContentWidgetPositionPreference || (ContentWidgetPositionPreference = {}));
  var CursorChangeReason;
  (function(CursorChangeReason2) {
    CursorChangeReason2[CursorChangeReason2["NotSet"] = 0] = "NotSet";
    CursorChangeReason2[CursorChangeReason2["ContentFlush"] = 1] = "ContentFlush";
    CursorChangeReason2[CursorChangeReason2["RecoverFromMarkers"] = 2] = "RecoverFromMarkers";
    CursorChangeReason2[CursorChangeReason2["Explicit"] = 3] = "Explicit";
    CursorChangeReason2[CursorChangeReason2["Paste"] = 4] = "Paste";
    CursorChangeReason2[CursorChangeReason2["Undo"] = 5] = "Undo";
    CursorChangeReason2[CursorChangeReason2["Redo"] = 6] = "Redo";
  })(CursorChangeReason || (CursorChangeReason = {}));
  var DefaultEndOfLine;
  (function(DefaultEndOfLine2) {
    DefaultEndOfLine2[DefaultEndOfLine2["LF"] = 1] = "LF";
    DefaultEndOfLine2[DefaultEndOfLine2["CRLF"] = 2] = "CRLF";
  })(DefaultEndOfLine || (DefaultEndOfLine = {}));
  var DocumentHighlightKind;
  (function(DocumentHighlightKind2) {
    DocumentHighlightKind2[DocumentHighlightKind2["Text"] = 0] = "Text";
    DocumentHighlightKind2[DocumentHighlightKind2["Read"] = 1] = "Read";
    DocumentHighlightKind2[DocumentHighlightKind2["Write"] = 2] = "Write";
  })(DocumentHighlightKind || (DocumentHighlightKind = {}));
  var EditorAutoIndentStrategy;
  (function(EditorAutoIndentStrategy2) {
    EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["None"] = 0] = "None";
    EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Keep"] = 1] = "Keep";
    EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Brackets"] = 2] = "Brackets";
    EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Advanced"] = 3] = "Advanced";
    EditorAutoIndentStrategy2[EditorAutoIndentStrategy2["Full"] = 4] = "Full";
  })(EditorAutoIndentStrategy || (EditorAutoIndentStrategy = {}));
  var EditorOption;
  (function(EditorOption2) {
    EditorOption2[EditorOption2["acceptSuggestionOnCommitCharacter"] = 0] = "acceptSuggestionOnCommitCharacter";
    EditorOption2[EditorOption2["acceptSuggestionOnEnter"] = 1] = "acceptSuggestionOnEnter";
    EditorOption2[EditorOption2["accessibilitySupport"] = 2] = "accessibilitySupport";
    EditorOption2[EditorOption2["accessibilityPageSize"] = 3] = "accessibilityPageSize";
    EditorOption2[EditorOption2["ariaLabel"] = 4] = "ariaLabel";
    EditorOption2[EditorOption2["autoClosingBrackets"] = 5] = "autoClosingBrackets";
    EditorOption2[EditorOption2["autoClosingDelete"] = 6] = "autoClosingDelete";
    EditorOption2[EditorOption2["autoClosingOvertype"] = 7] = "autoClosingOvertype";
    EditorOption2[EditorOption2["autoClosingQuotes"] = 8] = "autoClosingQuotes";
    EditorOption2[EditorOption2["autoIndent"] = 9] = "autoIndent";
    EditorOption2[EditorOption2["automaticLayout"] = 10] = "automaticLayout";
    EditorOption2[EditorOption2["autoSurround"] = 11] = "autoSurround";
    EditorOption2[EditorOption2["codeLens"] = 12] = "codeLens";
    EditorOption2[EditorOption2["codeLensFontFamily"] = 13] = "codeLensFontFamily";
    EditorOption2[EditorOption2["codeLensFontSize"] = 14] = "codeLensFontSize";
    EditorOption2[EditorOption2["colorDecorators"] = 15] = "colorDecorators";
    EditorOption2[EditorOption2["columnSelection"] = 16] = "columnSelection";
    EditorOption2[EditorOption2["comments"] = 17] = "comments";
    EditorOption2[EditorOption2["contextmenu"] = 18] = "contextmenu";
    EditorOption2[EditorOption2["copyWithSyntaxHighlighting"] = 19] = "copyWithSyntaxHighlighting";
    EditorOption2[EditorOption2["cursorBlinking"] = 20] = "cursorBlinking";
    EditorOption2[EditorOption2["cursorSmoothCaretAnimation"] = 21] = "cursorSmoothCaretAnimation";
    EditorOption2[EditorOption2["cursorStyle"] = 22] = "cursorStyle";
    EditorOption2[EditorOption2["cursorSurroundingLines"] = 23] = "cursorSurroundingLines";
    EditorOption2[EditorOption2["cursorSurroundingLinesStyle"] = 24] = "cursorSurroundingLinesStyle";
    EditorOption2[EditorOption2["cursorWidth"] = 25] = "cursorWidth";
    EditorOption2[EditorOption2["disableLayerHinting"] = 26] = "disableLayerHinting";
    EditorOption2[EditorOption2["disableMonospaceOptimizations"] = 27] = "disableMonospaceOptimizations";
    EditorOption2[EditorOption2["domReadOnly"] = 28] = "domReadOnly";
    EditorOption2[EditorOption2["dragAndDrop"] = 29] = "dragAndDrop";
    EditorOption2[EditorOption2["emptySelectionClipboard"] = 30] = "emptySelectionClipboard";
    EditorOption2[EditorOption2["extraEditorClassName"] = 31] = "extraEditorClassName";
    EditorOption2[EditorOption2["fastScrollSensitivity"] = 32] = "fastScrollSensitivity";
    EditorOption2[EditorOption2["find"] = 33] = "find";
    EditorOption2[EditorOption2["fixedOverflowWidgets"] = 34] = "fixedOverflowWidgets";
    EditorOption2[EditorOption2["folding"] = 35] = "folding";
    EditorOption2[EditorOption2["foldingStrategy"] = 36] = "foldingStrategy";
    EditorOption2[EditorOption2["foldingHighlight"] = 37] = "foldingHighlight";
    EditorOption2[EditorOption2["unfoldOnClickAfterEndOfLine"] = 38] = "unfoldOnClickAfterEndOfLine";
    EditorOption2[EditorOption2["fontFamily"] = 39] = "fontFamily";
    EditorOption2[EditorOption2["fontInfo"] = 40] = "fontInfo";
    EditorOption2[EditorOption2["fontLigatures"] = 41] = "fontLigatures";
    EditorOption2[EditorOption2["fontSize"] = 42] = "fontSize";
    EditorOption2[EditorOption2["fontWeight"] = 43] = "fontWeight";
    EditorOption2[EditorOption2["formatOnPaste"] = 44] = "formatOnPaste";
    EditorOption2[EditorOption2["formatOnType"] = 45] = "formatOnType";
    EditorOption2[EditorOption2["glyphMargin"] = 46] = "glyphMargin";
    EditorOption2[EditorOption2["gotoLocation"] = 47] = "gotoLocation";
    EditorOption2[EditorOption2["hideCursorInOverviewRuler"] = 48] = "hideCursorInOverviewRuler";
    EditorOption2[EditorOption2["highlightActiveIndentGuide"] = 49] = "highlightActiveIndentGuide";
    EditorOption2[EditorOption2["hover"] = 50] = "hover";
    EditorOption2[EditorOption2["inDiffEditor"] = 51] = "inDiffEditor";
    EditorOption2[EditorOption2["inlineSuggest"] = 52] = "inlineSuggest";
    EditorOption2[EditorOption2["letterSpacing"] = 53] = "letterSpacing";
    EditorOption2[EditorOption2["lightbulb"] = 54] = "lightbulb";
    EditorOption2[EditorOption2["lineDecorationsWidth"] = 55] = "lineDecorationsWidth";
    EditorOption2[EditorOption2["lineHeight"] = 56] = "lineHeight";
    EditorOption2[EditorOption2["lineNumbers"] = 57] = "lineNumbers";
    EditorOption2[EditorOption2["lineNumbersMinChars"] = 58] = "lineNumbersMinChars";
    EditorOption2[EditorOption2["linkedEditing"] = 59] = "linkedEditing";
    EditorOption2[EditorOption2["links"] = 60] = "links";
    EditorOption2[EditorOption2["matchBrackets"] = 61] = "matchBrackets";
    EditorOption2[EditorOption2["minimap"] = 62] = "minimap";
    EditorOption2[EditorOption2["mouseStyle"] = 63] = "mouseStyle";
    EditorOption2[EditorOption2["mouseWheelScrollSensitivity"] = 64] = "mouseWheelScrollSensitivity";
    EditorOption2[EditorOption2["mouseWheelZoom"] = 65] = "mouseWheelZoom";
    EditorOption2[EditorOption2["multiCursorMergeOverlapping"] = 66] = "multiCursorMergeOverlapping";
    EditorOption2[EditorOption2["multiCursorModifier"] = 67] = "multiCursorModifier";
    EditorOption2[EditorOption2["multiCursorPaste"] = 68] = "multiCursorPaste";
    EditorOption2[EditorOption2["occurrencesHighlight"] = 69] = "occurrencesHighlight";
    EditorOption2[EditorOption2["overviewRulerBorder"] = 70] = "overviewRulerBorder";
    EditorOption2[EditorOption2["overviewRulerLanes"] = 71] = "overviewRulerLanes";
    EditorOption2[EditorOption2["padding"] = 72] = "padding";
    EditorOption2[EditorOption2["parameterHints"] = 73] = "parameterHints";
    EditorOption2[EditorOption2["peekWidgetDefaultFocus"] = 74] = "peekWidgetDefaultFocus";
    EditorOption2[EditorOption2["definitionLinkOpensInPeek"] = 75] = "definitionLinkOpensInPeek";
    EditorOption2[EditorOption2["quickSuggestions"] = 76] = "quickSuggestions";
    EditorOption2[EditorOption2["quickSuggestionsDelay"] = 77] = "quickSuggestionsDelay";
    EditorOption2[EditorOption2["readOnly"] = 78] = "readOnly";
    EditorOption2[EditorOption2["renameOnType"] = 79] = "renameOnType";
    EditorOption2[EditorOption2["renderControlCharacters"] = 80] = "renderControlCharacters";
    EditorOption2[EditorOption2["renderIndentGuides"] = 81] = "renderIndentGuides";
    EditorOption2[EditorOption2["renderFinalNewline"] = 82] = "renderFinalNewline";
    EditorOption2[EditorOption2["renderLineHighlight"] = 83] = "renderLineHighlight";
    EditorOption2[EditorOption2["renderLineHighlightOnlyWhenFocus"] = 84] = "renderLineHighlightOnlyWhenFocus";
    EditorOption2[EditorOption2["renderValidationDecorations"] = 85] = "renderValidationDecorations";
    EditorOption2[EditorOption2["renderWhitespace"] = 86] = "renderWhitespace";
    EditorOption2[EditorOption2["revealHorizontalRightPadding"] = 87] = "revealHorizontalRightPadding";
    EditorOption2[EditorOption2["roundedSelection"] = 88] = "roundedSelection";
    EditorOption2[EditorOption2["rulers"] = 89] = "rulers";
    EditorOption2[EditorOption2["scrollbar"] = 90] = "scrollbar";
    EditorOption2[EditorOption2["scrollBeyondLastColumn"] = 91] = "scrollBeyondLastColumn";
    EditorOption2[EditorOption2["scrollBeyondLastLine"] = 92] = "scrollBeyondLastLine";
    EditorOption2[EditorOption2["scrollPredominantAxis"] = 93] = "scrollPredominantAxis";
    EditorOption2[EditorOption2["selectionClipboard"] = 94] = "selectionClipboard";
    EditorOption2[EditorOption2["selectionHighlight"] = 95] = "selectionHighlight";
    EditorOption2[EditorOption2["selectOnLineNumbers"] = 96] = "selectOnLineNumbers";
    EditorOption2[EditorOption2["showFoldingControls"] = 97] = "showFoldingControls";
    EditorOption2[EditorOption2["showUnused"] = 98] = "showUnused";
    EditorOption2[EditorOption2["snippetSuggestions"] = 99] = "snippetSuggestions";
    EditorOption2[EditorOption2["smartSelect"] = 100] = "smartSelect";
    EditorOption2[EditorOption2["smoothScrolling"] = 101] = "smoothScrolling";
    EditorOption2[EditorOption2["stickyTabStops"] = 102] = "stickyTabStops";
    EditorOption2[EditorOption2["stopRenderingLineAfter"] = 103] = "stopRenderingLineAfter";
    EditorOption2[EditorOption2["suggest"] = 104] = "suggest";
    EditorOption2[EditorOption2["suggestFontSize"] = 105] = "suggestFontSize";
    EditorOption2[EditorOption2["suggestLineHeight"] = 106] = "suggestLineHeight";
    EditorOption2[EditorOption2["suggestOnTriggerCharacters"] = 107] = "suggestOnTriggerCharacters";
    EditorOption2[EditorOption2["suggestSelection"] = 108] = "suggestSelection";
    EditorOption2[EditorOption2["tabCompletion"] = 109] = "tabCompletion";
    EditorOption2[EditorOption2["tabIndex"] = 110] = "tabIndex";
    EditorOption2[EditorOption2["unusualLineTerminators"] = 111] = "unusualLineTerminators";
    EditorOption2[EditorOption2["useShadowDOM"] = 112] = "useShadowDOM";
    EditorOption2[EditorOption2["useTabStops"] = 113] = "useTabStops";
    EditorOption2[EditorOption2["wordSeparators"] = 114] = "wordSeparators";
    EditorOption2[EditorOption2["wordWrap"] = 115] = "wordWrap";
    EditorOption2[EditorOption2["wordWrapBreakAfterCharacters"] = 116] = "wordWrapBreakAfterCharacters";
    EditorOption2[EditorOption2["wordWrapBreakBeforeCharacters"] = 117] = "wordWrapBreakBeforeCharacters";
    EditorOption2[EditorOption2["wordWrapColumn"] = 118] = "wordWrapColumn";
    EditorOption2[EditorOption2["wordWrapOverride1"] = 119] = "wordWrapOverride1";
    EditorOption2[EditorOption2["wordWrapOverride2"] = 120] = "wordWrapOverride2";
    EditorOption2[EditorOption2["wrappingIndent"] = 121] = "wrappingIndent";
    EditorOption2[EditorOption2["wrappingStrategy"] = 122] = "wrappingStrategy";
    EditorOption2[EditorOption2["showDeprecated"] = 123] = "showDeprecated";
    EditorOption2[EditorOption2["inlayHints"] = 124] = "inlayHints";
    EditorOption2[EditorOption2["editorClassName"] = 125] = "editorClassName";
    EditorOption2[EditorOption2["pixelRatio"] = 126] = "pixelRatio";
    EditorOption2[EditorOption2["tabFocusMode"] = 127] = "tabFocusMode";
    EditorOption2[EditorOption2["layoutInfo"] = 128] = "layoutInfo";
    EditorOption2[EditorOption2["wrappingInfo"] = 129] = "wrappingInfo";
  })(EditorOption || (EditorOption = {}));
  var EndOfLinePreference;
  (function(EndOfLinePreference2) {
    EndOfLinePreference2[EndOfLinePreference2["TextDefined"] = 0] = "TextDefined";
    EndOfLinePreference2[EndOfLinePreference2["LF"] = 1] = "LF";
    EndOfLinePreference2[EndOfLinePreference2["CRLF"] = 2] = "CRLF";
  })(EndOfLinePreference || (EndOfLinePreference = {}));
  var EndOfLineSequence;
  (function(EndOfLineSequence2) {
    EndOfLineSequence2[EndOfLineSequence2["LF"] = 0] = "LF";
    EndOfLineSequence2[EndOfLineSequence2["CRLF"] = 1] = "CRLF";
  })(EndOfLineSequence || (EndOfLineSequence = {}));
  var IndentAction;
  (function(IndentAction2) {
    IndentAction2[IndentAction2["None"] = 0] = "None";
    IndentAction2[IndentAction2["Indent"] = 1] = "Indent";
    IndentAction2[IndentAction2["IndentOutdent"] = 2] = "IndentOutdent";
    IndentAction2[IndentAction2["Outdent"] = 3] = "Outdent";
  })(IndentAction || (IndentAction = {}));
  var InlayHintKind;
  (function(InlayHintKind2) {
    InlayHintKind2[InlayHintKind2["Other"] = 0] = "Other";
    InlayHintKind2[InlayHintKind2["Type"] = 1] = "Type";
    InlayHintKind2[InlayHintKind2["Parameter"] = 2] = "Parameter";
  })(InlayHintKind || (InlayHintKind = {}));
  var InlineCompletionTriggerKind;
  (function(InlineCompletionTriggerKind2) {
    InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Automatic"] = 0] = "Automatic";
    InlineCompletionTriggerKind2[InlineCompletionTriggerKind2["Explicit"] = 1] = "Explicit";
  })(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
  var KeyCode;
  (function(KeyCode2) {
    KeyCode2[KeyCode2["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
    KeyCode2[KeyCode2["Unknown"] = 0] = "Unknown";
    KeyCode2[KeyCode2["Backspace"] = 1] = "Backspace";
    KeyCode2[KeyCode2["Tab"] = 2] = "Tab";
    KeyCode2[KeyCode2["Enter"] = 3] = "Enter";
    KeyCode2[KeyCode2["Shift"] = 4] = "Shift";
    KeyCode2[KeyCode2["Ctrl"] = 5] = "Ctrl";
    KeyCode2[KeyCode2["Alt"] = 6] = "Alt";
    KeyCode2[KeyCode2["PauseBreak"] = 7] = "PauseBreak";
    KeyCode2[KeyCode2["CapsLock"] = 8] = "CapsLock";
    KeyCode2[KeyCode2["Escape"] = 9] = "Escape";
    KeyCode2[KeyCode2["Space"] = 10] = "Space";
    KeyCode2[KeyCode2["PageUp"] = 11] = "PageUp";
    KeyCode2[KeyCode2["PageDown"] = 12] = "PageDown";
    KeyCode2[KeyCode2["End"] = 13] = "End";
    KeyCode2[KeyCode2["Home"] = 14] = "Home";
    KeyCode2[KeyCode2["LeftArrow"] = 15] = "LeftArrow";
    KeyCode2[KeyCode2["UpArrow"] = 16] = "UpArrow";
    KeyCode2[KeyCode2["RightArrow"] = 17] = "RightArrow";
    KeyCode2[KeyCode2["DownArrow"] = 18] = "DownArrow";
    KeyCode2[KeyCode2["Insert"] = 19] = "Insert";
    KeyCode2[KeyCode2["Delete"] = 20] = "Delete";
    KeyCode2[KeyCode2["KEY_0"] = 21] = "KEY_0";
    KeyCode2[KeyCode2["KEY_1"] = 22] = "KEY_1";
    KeyCode2[KeyCode2["KEY_2"] = 23] = "KEY_2";
    KeyCode2[KeyCode2["KEY_3"] = 24] = "KEY_3";
    KeyCode2[KeyCode2["KEY_4"] = 25] = "KEY_4";
    KeyCode2[KeyCode2["KEY_5"] = 26] = "KEY_5";
    KeyCode2[KeyCode2["KEY_6"] = 27] = "KEY_6";
    KeyCode2[KeyCode2["KEY_7"] = 28] = "KEY_7";
    KeyCode2[KeyCode2["KEY_8"] = 29] = "KEY_8";
    KeyCode2[KeyCode2["KEY_9"] = 30] = "KEY_9";
    KeyCode2[KeyCode2["KEY_A"] = 31] = "KEY_A";
    KeyCode2[KeyCode2["KEY_B"] = 32] = "KEY_B";
    KeyCode2[KeyCode2["KEY_C"] = 33] = "KEY_C";
    KeyCode2[KeyCode2["KEY_D"] = 34] = "KEY_D";
    KeyCode2[KeyCode2["KEY_E"] = 35] = "KEY_E";
    KeyCode2[KeyCode2["KEY_F"] = 36] = "KEY_F";
    KeyCode2[KeyCode2["KEY_G"] = 37] = "KEY_G";
    KeyCode2[KeyCode2["KEY_H"] = 38] = "KEY_H";
    KeyCode2[KeyCode2["KEY_I"] = 39] = "KEY_I";
    KeyCode2[KeyCode2["KEY_J"] = 40] = "KEY_J";
    KeyCode2[KeyCode2["KEY_K"] = 41] = "KEY_K";
    KeyCode2[KeyCode2["KEY_L"] = 42] = "KEY_L";
    KeyCode2[KeyCode2["KEY_M"] = 43] = "KEY_M";
    KeyCode2[KeyCode2["KEY_N"] = 44] = "KEY_N";
    KeyCode2[KeyCode2["KEY_O"] = 45] = "KEY_O";
    KeyCode2[KeyCode2["KEY_P"] = 46] = "KEY_P";
    KeyCode2[KeyCode2["KEY_Q"] = 47] = "KEY_Q";
    KeyCode2[KeyCode2["KEY_R"] = 48] = "KEY_R";
    KeyCode2[KeyCode2["KEY_S"] = 49] = "KEY_S";
    KeyCode2[KeyCode2["KEY_T"] = 50] = "KEY_T";
    KeyCode2[KeyCode2["KEY_U"] = 51] = "KEY_U";
    KeyCode2[KeyCode2["KEY_V"] = 52] = "KEY_V";
    KeyCode2[KeyCode2["KEY_W"] = 53] = "KEY_W";
    KeyCode2[KeyCode2["KEY_X"] = 54] = "KEY_X";
    KeyCode2[KeyCode2["KEY_Y"] = 55] = "KEY_Y";
    KeyCode2[KeyCode2["KEY_Z"] = 56] = "KEY_Z";
    KeyCode2[KeyCode2["Meta"] = 57] = "Meta";
    KeyCode2[KeyCode2["ContextMenu"] = 58] = "ContextMenu";
    KeyCode2[KeyCode2["F1"] = 59] = "F1";
    KeyCode2[KeyCode2["F2"] = 60] = "F2";
    KeyCode2[KeyCode2["F3"] = 61] = "F3";
    KeyCode2[KeyCode2["F4"] = 62] = "F4";
    KeyCode2[KeyCode2["F5"] = 63] = "F5";
    KeyCode2[KeyCode2["F6"] = 64] = "F6";
    KeyCode2[KeyCode2["F7"] = 65] = "F7";
    KeyCode2[KeyCode2["F8"] = 66] = "F8";
    KeyCode2[KeyCode2["F9"] = 67] = "F9";
    KeyCode2[KeyCode2["F10"] = 68] = "F10";
    KeyCode2[KeyCode2["F11"] = 69] = "F11";
    KeyCode2[KeyCode2["F12"] = 70] = "F12";
    KeyCode2[KeyCode2["F13"] = 71] = "F13";
    KeyCode2[KeyCode2["F14"] = 72] = "F14";
    KeyCode2[KeyCode2["F15"] = 73] = "F15";
    KeyCode2[KeyCode2["F16"] = 74] = "F16";
    KeyCode2[KeyCode2["F17"] = 75] = "F17";
    KeyCode2[KeyCode2["F18"] = 76] = "F18";
    KeyCode2[KeyCode2["F19"] = 77] = "F19";
    KeyCode2[KeyCode2["NumLock"] = 78] = "NumLock";
    KeyCode2[KeyCode2["ScrollLock"] = 79] = "ScrollLock";
    KeyCode2[KeyCode2["US_SEMICOLON"] = 80] = "US_SEMICOLON";
    KeyCode2[KeyCode2["US_EQUAL"] = 81] = "US_EQUAL";
    KeyCode2[KeyCode2["US_COMMA"] = 82] = "US_COMMA";
    KeyCode2[KeyCode2["US_MINUS"] = 83] = "US_MINUS";
    KeyCode2[KeyCode2["US_DOT"] = 84] = "US_DOT";
    KeyCode2[KeyCode2["US_SLASH"] = 85] = "US_SLASH";
    KeyCode2[KeyCode2["US_BACKTICK"] = 86] = "US_BACKTICK";
    KeyCode2[KeyCode2["US_OPEN_SQUARE_BRACKET"] = 87] = "US_OPEN_SQUARE_BRACKET";
    KeyCode2[KeyCode2["US_BACKSLASH"] = 88] = "US_BACKSLASH";
    KeyCode2[KeyCode2["US_CLOSE_SQUARE_BRACKET"] = 89] = "US_CLOSE_SQUARE_BRACKET";
    KeyCode2[KeyCode2["US_QUOTE"] = 90] = "US_QUOTE";
    KeyCode2[KeyCode2["OEM_8"] = 91] = "OEM_8";
    KeyCode2[KeyCode2["OEM_102"] = 92] = "OEM_102";
    KeyCode2[KeyCode2["NUMPAD_0"] = 93] = "NUMPAD_0";
    KeyCode2[KeyCode2["NUMPAD_1"] = 94] = "NUMPAD_1";
    KeyCode2[KeyCode2["NUMPAD_2"] = 95] = "NUMPAD_2";
    KeyCode2[KeyCode2["NUMPAD_3"] = 96] = "NUMPAD_3";
    KeyCode2[KeyCode2["NUMPAD_4"] = 97] = "NUMPAD_4";
    KeyCode2[KeyCode2["NUMPAD_5"] = 98] = "NUMPAD_5";
    KeyCode2[KeyCode2["NUMPAD_6"] = 99] = "NUMPAD_6";
    KeyCode2[KeyCode2["NUMPAD_7"] = 100] = "NUMPAD_7";
    KeyCode2[KeyCode2["NUMPAD_8"] = 101] = "NUMPAD_8";
    KeyCode2[KeyCode2["NUMPAD_9"] = 102] = "NUMPAD_9";
    KeyCode2[KeyCode2["NUMPAD_MULTIPLY"] = 103] = "NUMPAD_MULTIPLY";
    KeyCode2[KeyCode2["NUMPAD_ADD"] = 104] = "NUMPAD_ADD";
    KeyCode2[KeyCode2["NUMPAD_SEPARATOR"] = 105] = "NUMPAD_SEPARATOR";
    KeyCode2[KeyCode2["NUMPAD_SUBTRACT"] = 106] = "NUMPAD_SUBTRACT";
    KeyCode2[KeyCode2["NUMPAD_DECIMAL"] = 107] = "NUMPAD_DECIMAL";
    KeyCode2[KeyCode2["NUMPAD_DIVIDE"] = 108] = "NUMPAD_DIVIDE";
    KeyCode2[KeyCode2["KEY_IN_COMPOSITION"] = 109] = "KEY_IN_COMPOSITION";
    KeyCode2[KeyCode2["ABNT_C1"] = 110] = "ABNT_C1";
    KeyCode2[KeyCode2["ABNT_C2"] = 111] = "ABNT_C2";
    KeyCode2[KeyCode2["MAX_VALUE"] = 112] = "MAX_VALUE";
  })(KeyCode || (KeyCode = {}));
  var MarkerSeverity;
  (function(MarkerSeverity2) {
    MarkerSeverity2[MarkerSeverity2["Hint"] = 1] = "Hint";
    MarkerSeverity2[MarkerSeverity2["Info"] = 2] = "Info";
    MarkerSeverity2[MarkerSeverity2["Warning"] = 4] = "Warning";
    MarkerSeverity2[MarkerSeverity2["Error"] = 8] = "Error";
  })(MarkerSeverity || (MarkerSeverity = {}));
  var MarkerTag;
  (function(MarkerTag2) {
    MarkerTag2[MarkerTag2["Unnecessary"] = 1] = "Unnecessary";
    MarkerTag2[MarkerTag2["Deprecated"] = 2] = "Deprecated";
  })(MarkerTag || (MarkerTag = {}));
  var MinimapPosition;
  (function(MinimapPosition2) {
    MinimapPosition2[MinimapPosition2["Inline"] = 1] = "Inline";
    MinimapPosition2[MinimapPosition2["Gutter"] = 2] = "Gutter";
  })(MinimapPosition || (MinimapPosition = {}));
  var MouseTargetType;
  (function(MouseTargetType2) {
    MouseTargetType2[MouseTargetType2["UNKNOWN"] = 0] = "UNKNOWN";
    MouseTargetType2[MouseTargetType2["TEXTAREA"] = 1] = "TEXTAREA";
    MouseTargetType2[MouseTargetType2["GUTTER_GLYPH_MARGIN"] = 2] = "GUTTER_GLYPH_MARGIN";
    MouseTargetType2[MouseTargetType2["GUTTER_LINE_NUMBERS"] = 3] = "GUTTER_LINE_NUMBERS";
    MouseTargetType2[MouseTargetType2["GUTTER_LINE_DECORATIONS"] = 4] = "GUTTER_LINE_DECORATIONS";
    MouseTargetType2[MouseTargetType2["GUTTER_VIEW_ZONE"] = 5] = "GUTTER_VIEW_ZONE";
    MouseTargetType2[MouseTargetType2["CONTENT_TEXT"] = 6] = "CONTENT_TEXT";
    MouseTargetType2[MouseTargetType2["CONTENT_EMPTY"] = 7] = "CONTENT_EMPTY";
    MouseTargetType2[MouseTargetType2["CONTENT_VIEW_ZONE"] = 8] = "CONTENT_VIEW_ZONE";
    MouseTargetType2[MouseTargetType2["CONTENT_WIDGET"] = 9] = "CONTENT_WIDGET";
    MouseTargetType2[MouseTargetType2["OVERVIEW_RULER"] = 10] = "OVERVIEW_RULER";
    MouseTargetType2[MouseTargetType2["SCROLLBAR"] = 11] = "SCROLLBAR";
    MouseTargetType2[MouseTargetType2["OVERLAY_WIDGET"] = 12] = "OVERLAY_WIDGET";
    MouseTargetType2[MouseTargetType2["OUTSIDE_EDITOR"] = 13] = "OUTSIDE_EDITOR";
  })(MouseTargetType || (MouseTargetType = {}));
  var OverlayWidgetPositionPreference;
  (function(OverlayWidgetPositionPreference2) {
    OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["TOP_RIGHT_CORNER"] = 0] = "TOP_RIGHT_CORNER";
    OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["BOTTOM_RIGHT_CORNER"] = 1] = "BOTTOM_RIGHT_CORNER";
    OverlayWidgetPositionPreference2[OverlayWidgetPositionPreference2["TOP_CENTER"] = 2] = "TOP_CENTER";
  })(OverlayWidgetPositionPreference || (OverlayWidgetPositionPreference = {}));
  var OverviewRulerLane;
  (function(OverviewRulerLane2) {
    OverviewRulerLane2[OverviewRulerLane2["Left"] = 1] = "Left";
    OverviewRulerLane2[OverviewRulerLane2["Center"] = 2] = "Center";
    OverviewRulerLane2[OverviewRulerLane2["Right"] = 4] = "Right";
    OverviewRulerLane2[OverviewRulerLane2["Full"] = 7] = "Full";
  })(OverviewRulerLane || (OverviewRulerLane = {}));
  var RenderLineNumbersType;
  (function(RenderLineNumbersType2) {
    RenderLineNumbersType2[RenderLineNumbersType2["Off"] = 0] = "Off";
    RenderLineNumbersType2[RenderLineNumbersType2["On"] = 1] = "On";
    RenderLineNumbersType2[RenderLineNumbersType2["Relative"] = 2] = "Relative";
    RenderLineNumbersType2[RenderLineNumbersType2["Interval"] = 3] = "Interval";
    RenderLineNumbersType2[RenderLineNumbersType2["Custom"] = 4] = "Custom";
  })(RenderLineNumbersType || (RenderLineNumbersType = {}));
  var RenderMinimap;
  (function(RenderMinimap2) {
    RenderMinimap2[RenderMinimap2["None"] = 0] = "None";
    RenderMinimap2[RenderMinimap2["Text"] = 1] = "Text";
    RenderMinimap2[RenderMinimap2["Blocks"] = 2] = "Blocks";
  })(RenderMinimap || (RenderMinimap = {}));
  var ScrollType;
  (function(ScrollType2) {
    ScrollType2[ScrollType2["Smooth"] = 0] = "Smooth";
    ScrollType2[ScrollType2["Immediate"] = 1] = "Immediate";
  })(ScrollType || (ScrollType = {}));
  var ScrollbarVisibility;
  (function(ScrollbarVisibility2) {
    ScrollbarVisibility2[ScrollbarVisibility2["Auto"] = 1] = "Auto";
    ScrollbarVisibility2[ScrollbarVisibility2["Hidden"] = 2] = "Hidden";
    ScrollbarVisibility2[ScrollbarVisibility2["Visible"] = 3] = "Visible";
  })(ScrollbarVisibility || (ScrollbarVisibility = {}));
  var SelectionDirection;
  (function(SelectionDirection2) {
    SelectionDirection2[SelectionDirection2["LTR"] = 0] = "LTR";
    SelectionDirection2[SelectionDirection2["RTL"] = 1] = "RTL";
  })(SelectionDirection || (SelectionDirection = {}));
  var SignatureHelpTriggerKind;
  (function(SignatureHelpTriggerKind2) {
    SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["Invoke"] = 1] = "Invoke";
    SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["TriggerCharacter"] = 2] = "TriggerCharacter";
    SignatureHelpTriggerKind2[SignatureHelpTriggerKind2["ContentChange"] = 3] = "ContentChange";
  })(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
  var SymbolKind;
  (function(SymbolKind2) {
    SymbolKind2[SymbolKind2["File"] = 0] = "File";
    SymbolKind2[SymbolKind2["Module"] = 1] = "Module";
    SymbolKind2[SymbolKind2["Namespace"] = 2] = "Namespace";
    SymbolKind2[SymbolKind2["Package"] = 3] = "Package";
    SymbolKind2[SymbolKind2["Class"] = 4] = "Class";
    SymbolKind2[SymbolKind2["Method"] = 5] = "Method";
    SymbolKind2[SymbolKind2["Property"] = 6] = "Property";
    SymbolKind2[SymbolKind2["Field"] = 7] = "Field";
    SymbolKind2[SymbolKind2["Constructor"] = 8] = "Constructor";
    SymbolKind2[SymbolKind2["Enum"] = 9] = "Enum";
    SymbolKind2[SymbolKind2["Interface"] = 10] = "Interface";
    SymbolKind2[SymbolKind2["Function"] = 11] = "Function";
    SymbolKind2[SymbolKind2["Variable"] = 12] = "Variable";
    SymbolKind2[SymbolKind2["Constant"] = 13] = "Constant";
    SymbolKind2[SymbolKind2["String"] = 14] = "String";
    SymbolKind2[SymbolKind2["Number"] = 15] = "Number";
    SymbolKind2[SymbolKind2["Boolean"] = 16] = "Boolean";
    SymbolKind2[SymbolKind2["Array"] = 17] = "Array";
    SymbolKind2[SymbolKind2["Object"] = 18] = "Object";
    SymbolKind2[SymbolKind2["Key"] = 19] = "Key";
    SymbolKind2[SymbolKind2["Null"] = 20] = "Null";
    SymbolKind2[SymbolKind2["EnumMember"] = 21] = "EnumMember";
    SymbolKind2[SymbolKind2["Struct"] = 22] = "Struct";
    SymbolKind2[SymbolKind2["Event"] = 23] = "Event";
    SymbolKind2[SymbolKind2["Operator"] = 24] = "Operator";
    SymbolKind2[SymbolKind2["TypeParameter"] = 25] = "TypeParameter";
  })(SymbolKind || (SymbolKind = {}));
  var SymbolTag;
  (function(SymbolTag2) {
    SymbolTag2[SymbolTag2["Deprecated"] = 1] = "Deprecated";
  })(SymbolTag || (SymbolTag = {}));
  var TextEditorCursorBlinkingStyle;
  (function(TextEditorCursorBlinkingStyle2) {
    TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Hidden"] = 0] = "Hidden";
    TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Blink"] = 1] = "Blink";
    TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Smooth"] = 2] = "Smooth";
    TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Phase"] = 3] = "Phase";
    TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Expand"] = 4] = "Expand";
    TextEditorCursorBlinkingStyle2[TextEditorCursorBlinkingStyle2["Solid"] = 5] = "Solid";
  })(TextEditorCursorBlinkingStyle || (TextEditorCursorBlinkingStyle = {}));
  var TextEditorCursorStyle;
  (function(TextEditorCursorStyle2) {
    TextEditorCursorStyle2[TextEditorCursorStyle2["Line"] = 1] = "Line";
    TextEditorCursorStyle2[TextEditorCursorStyle2["Block"] = 2] = "Block";
    TextEditorCursorStyle2[TextEditorCursorStyle2["Underline"] = 3] = "Underline";
    TextEditorCursorStyle2[TextEditorCursorStyle2["LineThin"] = 4] = "LineThin";
    TextEditorCursorStyle2[TextEditorCursorStyle2["BlockOutline"] = 5] = "BlockOutline";
    TextEditorCursorStyle2[TextEditorCursorStyle2["UnderlineThin"] = 6] = "UnderlineThin";
  })(TextEditorCursorStyle || (TextEditorCursorStyle = {}));
  var TrackedRangeStickiness;
  (function(TrackedRangeStickiness2) {
    TrackedRangeStickiness2[TrackedRangeStickiness2["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
    TrackedRangeStickiness2[TrackedRangeStickiness2["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
    TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
    TrackedRangeStickiness2[TrackedRangeStickiness2["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
  })(TrackedRangeStickiness || (TrackedRangeStickiness = {}));
  var WrappingIndent;
  (function(WrappingIndent2) {
    WrappingIndent2[WrappingIndent2["None"] = 0] = "None";
    WrappingIndent2[WrappingIndent2["Same"] = 1] = "Same";
    WrappingIndent2[WrappingIndent2["Indent"] = 2] = "Indent";
    WrappingIndent2[WrappingIndent2["DeepIndent"] = 3] = "DeepIndent";
  })(WrappingIndent || (WrappingIndent = {}));

  // node_modules/monaco-editor/esm/vs/editor/common/standalone/standaloneBase.js
  var KeyMod = class {
    static chord(firstPart, secondPart) {
      return KeyChord(firstPart, secondPart);
    }
  };
  KeyMod.CtrlCmd = 2048;
  KeyMod.Shift = 1024;
  KeyMod.Alt = 512;
  KeyMod.WinCtrl = 256;
  function createMonacoBaseAPI() {
    return {
      editor: void 0,
      languages: void 0,
      CancellationTokenSource,
      Emitter,
      KeyCode,
      KeyMod,
      Position,
      Range,
      Selection,
      SelectionDirection,
      MarkerSeverity,
      MarkerTag,
      Uri: URI,
      Token
    };
  }

  // node_modules/monaco-editor/esm/vs/editor/common/services/editorSimpleWorker.js
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve2) {
        resolve2(value);
      });
    }
    return new (P || (P = Promise))(function(resolve2, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var MirrorModel = class extends MirrorTextModel {
    get uri() {
      return this._uri;
    }
    get eol() {
      return this._eol;
    }
    getValue() {
      return this.getText();
    }
    getLinesContent() {
      return this._lines.slice(0);
    }
    getLineCount() {
      return this._lines.length;
    }
    getLineContent(lineNumber) {
      return this._lines[lineNumber - 1];
    }
    getWordAtPosition(position, wordDefinition) {
      let wordAtText = getWordAtText(position.column, ensureValidWordDefinition(wordDefinition), this._lines[position.lineNumber - 1], 0);
      if (wordAtText) {
        return new Range(position.lineNumber, wordAtText.startColumn, position.lineNumber, wordAtText.endColumn);
      }
      return null;
    }
    words(wordDefinition) {
      const lines = this._lines;
      const wordenize = this._wordenize.bind(this);
      let lineNumber = 0;
      let lineText = "";
      let wordRangesIdx = 0;
      let wordRanges = [];
      return {
        *[Symbol.iterator]() {
          while (true) {
            if (wordRangesIdx < wordRanges.length) {
              const value = lineText.substring(wordRanges[wordRangesIdx].start, wordRanges[wordRangesIdx].end);
              wordRangesIdx += 1;
              yield value;
            } else {
              if (lineNumber < lines.length) {
                lineText = lines[lineNumber];
                wordRanges = wordenize(lineText, wordDefinition);
                wordRangesIdx = 0;
                lineNumber += 1;
              } else {
                break;
              }
            }
          }
        }
      };
    }
    getLineWords(lineNumber, wordDefinition) {
      let content = this._lines[lineNumber - 1];
      let ranges = this._wordenize(content, wordDefinition);
      let words = [];
      for (const range of ranges) {
        words.push({
          word: content.substring(range.start, range.end),
          startColumn: range.start + 1,
          endColumn: range.end + 1
        });
      }
      return words;
    }
    _wordenize(content, wordDefinition) {
      const result = [];
      let match;
      wordDefinition.lastIndex = 0;
      while (match = wordDefinition.exec(content)) {
        if (match[0].length === 0) {
          break;
        }
        result.push({start: match.index, end: match.index + match[0].length});
      }
      return result;
    }
    getValueInRange(range) {
      range = this._validateRange(range);
      if (range.startLineNumber === range.endLineNumber) {
        return this._lines[range.startLineNumber - 1].substring(range.startColumn - 1, range.endColumn - 1);
      }
      let lineEnding = this._eol;
      let startLineIndex = range.startLineNumber - 1;
      let endLineIndex = range.endLineNumber - 1;
      let resultLines = [];
      resultLines.push(this._lines[startLineIndex].substring(range.startColumn - 1));
      for (let i = startLineIndex + 1; i < endLineIndex; i++) {
        resultLines.push(this._lines[i]);
      }
      resultLines.push(this._lines[endLineIndex].substring(0, range.endColumn - 1));
      return resultLines.join(lineEnding);
    }
    offsetAt(position) {
      position = this._validatePosition(position);
      this._ensureLineStarts();
      return this._lineStarts.getAccumulatedValue(position.lineNumber - 2) + (position.column - 1);
    }
    positionAt(offset) {
      offset = Math.floor(offset);
      offset = Math.max(0, offset);
      this._ensureLineStarts();
      let out = this._lineStarts.getIndexOf(offset);
      let lineLength = this._lines[out.index].length;
      return {
        lineNumber: 1 + out.index,
        column: 1 + Math.min(out.remainder, lineLength)
      };
    }
    _validateRange(range) {
      const start = this._validatePosition({lineNumber: range.startLineNumber, column: range.startColumn});
      const end = this._validatePosition({lineNumber: range.endLineNumber, column: range.endColumn});
      if (start.lineNumber !== range.startLineNumber || start.column !== range.startColumn || end.lineNumber !== range.endLineNumber || end.column !== range.endColumn) {
        return {
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endLineNumber: end.lineNumber,
          endColumn: end.column
        };
      }
      return range;
    }
    _validatePosition(position) {
      if (!Position.isIPosition(position)) {
        throw new Error("bad position");
      }
      let {lineNumber, column} = position;
      let hasChanged = false;
      if (lineNumber < 1) {
        lineNumber = 1;
        column = 1;
        hasChanged = true;
      } else if (lineNumber > this._lines.length) {
        lineNumber = this._lines.length;
        column = this._lines[lineNumber - 1].length + 1;
        hasChanged = true;
      } else {
        let maxCharacter = this._lines[lineNumber - 1].length + 1;
        if (column < 1) {
          column = 1;
          hasChanged = true;
        } else if (column > maxCharacter) {
          column = maxCharacter;
          hasChanged = true;
        }
      }
      if (!hasChanged) {
        return position;
      } else {
        return {lineNumber, column};
      }
    }
  };
  var EditorSimpleWorker = class {
    constructor(host, foreignModuleFactory) {
      this._host = host;
      this._models = Object.create(null);
      this._foreignModuleFactory = foreignModuleFactory;
      this._foreignModule = null;
    }
    dispose() {
      this._models = Object.create(null);
    }
    _getModel(uri) {
      return this._models[uri];
    }
    _getModels() {
      let all = [];
      Object.keys(this._models).forEach((key) => all.push(this._models[key]));
      return all;
    }
    acceptNewModel(data) {
      this._models[data.url] = new MirrorModel(URI.parse(data.url), data.lines, data.EOL, data.versionId);
    }
    acceptModelChanged(strURL, e) {
      if (!this._models[strURL]) {
        return;
      }
      let model = this._models[strURL];
      model.onEvents(e);
    }
    acceptRemovedModel(strURL) {
      if (!this._models[strURL]) {
        return;
      }
      delete this._models[strURL];
    }
    computeDiff(originalUrl, modifiedUrl, ignoreTrimWhitespace, maxComputationTime) {
      return __awaiter(this, void 0, void 0, function* () {
        const original = this._getModel(originalUrl);
        const modified = this._getModel(modifiedUrl);
        if (!original || !modified) {
          return null;
        }
        const originalLines = original.getLinesContent();
        const modifiedLines = modified.getLinesContent();
        const diffComputer = new DiffComputer(originalLines, modifiedLines, {
          shouldComputeCharChanges: true,
          shouldPostProcessCharChanges: true,
          shouldIgnoreTrimWhitespace: ignoreTrimWhitespace,
          shouldMakePrettyDiff: true,
          maxComputationTime
        });
        const diffResult = diffComputer.computeDiff();
        const identical = diffResult.changes.length > 0 ? false : this._modelsAreIdentical(original, modified);
        return {
          quitEarly: diffResult.quitEarly,
          identical,
          changes: diffResult.changes
        };
      });
    }
    _modelsAreIdentical(original, modified) {
      const originalLineCount = original.getLineCount();
      const modifiedLineCount = modified.getLineCount();
      if (originalLineCount !== modifiedLineCount) {
        return false;
      }
      for (let line = 1; line <= originalLineCount; line++) {
        const originalLine = original.getLineContent(line);
        const modifiedLine = modified.getLineContent(line);
        if (originalLine !== modifiedLine) {
          return false;
        }
      }
      return true;
    }
    computeMoreMinimalEdits(modelUrl, edits) {
      return __awaiter(this, void 0, void 0, function* () {
        const model = this._getModel(modelUrl);
        if (!model) {
          return edits;
        }
        const result = [];
        let lastEol = void 0;
        edits = edits.slice(0).sort((a, b) => {
          if (a.range && b.range) {
            return Range.compareRangesUsingStarts(a.range, b.range);
          }
          let aRng = a.range ? 0 : 1;
          let bRng = b.range ? 0 : 1;
          return aRng - bRng;
        });
        for (let {range, text, eol} of edits) {
          if (typeof eol === "number") {
            lastEol = eol;
          }
          if (Range.isEmpty(range) && !text) {
            continue;
          }
          const original = model.getValueInRange(range);
          text = text.replace(/\r\n|\n|\r/g, model.eol);
          if (original === text) {
            continue;
          }
          if (Math.max(text.length, original.length) > EditorSimpleWorker._diffLimit) {
            result.push({range, text});
            continue;
          }
          const changes = stringDiff(original, text, false);
          const editOffset = model.offsetAt(Range.lift(range).getStartPosition());
          for (const change of changes) {
            const start = model.positionAt(editOffset + change.originalStart);
            const end = model.positionAt(editOffset + change.originalStart + change.originalLength);
            const newEdit = {
              text: text.substr(change.modifiedStart, change.modifiedLength),
              range: {startLineNumber: start.lineNumber, startColumn: start.column, endLineNumber: end.lineNumber, endColumn: end.column}
            };
            if (model.getValueInRange(newEdit.range) !== newEdit.text) {
              result.push(newEdit);
            }
          }
        }
        if (typeof lastEol === "number") {
          result.push({eol: lastEol, text: "", range: {startLineNumber: 0, startColumn: 0, endLineNumber: 0, endColumn: 0}});
        }
        return result;
      });
    }
    computeLinks(modelUrl) {
      return __awaiter(this, void 0, void 0, function* () {
        let model = this._getModel(modelUrl);
        if (!model) {
          return null;
        }
        return computeLinks(model);
      });
    }
    textualSuggest(modelUrls, leadingWord, wordDef, wordDefFlags) {
      return __awaiter(this, void 0, void 0, function* () {
        const sw = new StopWatch(true);
        const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
        const seen = new Set();
        outer:
          for (let url of modelUrls) {
            const model = this._getModel(url);
            if (!model) {
              continue;
            }
            for (let word of model.words(wordDefRegExp)) {
              if (word === leadingWord || !isNaN(Number(word))) {
                continue;
              }
              seen.add(word);
              if (seen.size > EditorSimpleWorker._suggestionsLimit) {
                break outer;
              }
            }
          }
        return {words: Array.from(seen), duration: sw.elapsed()};
      });
    }
    computeWordRanges(modelUrl, range, wordDef, wordDefFlags) {
      return __awaiter(this, void 0, void 0, function* () {
        let model = this._getModel(modelUrl);
        if (!model) {
          return Object.create(null);
        }
        const wordDefRegExp = new RegExp(wordDef, wordDefFlags);
        const result = Object.create(null);
        for (let line = range.startLineNumber; line < range.endLineNumber; line++) {
          let words = model.getLineWords(line, wordDefRegExp);
          for (const word of words) {
            if (!isNaN(Number(word.word))) {
              continue;
            }
            let array = result[word.word];
            if (!array) {
              array = [];
              result[word.word] = array;
            }
            array.push({
              startLineNumber: line,
              startColumn: word.startColumn,
              endLineNumber: line,
              endColumn: word.endColumn
            });
          }
        }
        return result;
      });
    }
    navigateValueSet(modelUrl, range, up, wordDef, wordDefFlags) {
      return __awaiter(this, void 0, void 0, function* () {
        let model = this._getModel(modelUrl);
        if (!model) {
          return null;
        }
        let wordDefRegExp = new RegExp(wordDef, wordDefFlags);
        if (range.startColumn === range.endColumn) {
          range = {
            startLineNumber: range.startLineNumber,
            startColumn: range.startColumn,
            endLineNumber: range.endLineNumber,
            endColumn: range.endColumn + 1
          };
        }
        let selectionText = model.getValueInRange(range);
        let wordRange = model.getWordAtPosition({lineNumber: range.startLineNumber, column: range.startColumn}, wordDefRegExp);
        if (!wordRange) {
          return null;
        }
        let word = model.getValueInRange(wordRange);
        let result = BasicInplaceReplace.INSTANCE.navigateValueSet(range, selectionText, wordRange, word, up);
        return result;
      });
    }
    loadForeignModule(moduleId, createData, foreignHostMethods) {
      const proxyMethodRequest = (method, args) => {
        return this._host.fhr(method, args);
      };
      const foreignHost = createProxyObject(foreignHostMethods, proxyMethodRequest);
      let ctx = {
        host: foreignHost,
        getMirrorModels: () => {
          return this._getModels();
        }
      };
      if (this._foreignModuleFactory) {
        this._foreignModule = this._foreignModuleFactory(ctx, createData);
        return Promise.resolve(getAllMethodNames(this._foreignModule));
      }
      return Promise.reject(new Error(`Unexpected usage`));
    }
    fmr(method, args) {
      if (!this._foreignModule || typeof this._foreignModule[method] !== "function") {
        return Promise.reject(new Error("Missing requestHandler or method: " + method));
      }
      try {
        return Promise.resolve(this._foreignModule[method].apply(this._foreignModule, args));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  };
  EditorSimpleWorker._diffLimit = 1e5;
  EditorSimpleWorker._suggestionsLimit = 1e4;
  if (typeof importScripts === "function") {
    globals.monaco = createMonacoBaseAPI();
  }

  // node_modules/monaco-editor/esm/vs/editor/editor.worker.js
  var initialized = false;
  function initialize(foreignModule) {
    if (initialized) {
      return;
    }
    initialized = true;
    const simpleWorker = new SimpleWorkerServer((msg) => {
      self.postMessage(msg);
    }, (host) => new EditorSimpleWorker(host, foreignModule));
    self.onmessage = (e) => {
      simpleWorker.onmessage(e.data);
    };
  }
  self.onmessage = (e) => {
    if (!initialized) {
      initialize(null);
    }
  };
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL2Vycm9ycy5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvYmFzZS9jb21tb24vaXRlcmF0b3IuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL2xpZmVjeWNsZS5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvYmFzZS9jb21tb24vcGxhdGZvcm0uanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL3R5cGVzLmpzIiwgIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yL2VzbS92cy9iYXNlL2NvbW1vbi93b3JrZXIvc2ltcGxlV29ya2VyLmpzIiwgIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yL2VzbS92cy9iYXNlL2NvbW1vbi9kaWZmL2RpZmZDaGFuZ2UuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL3N0cmluZ3MuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL2hhc2guanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL2RpZmYvZGlmZi5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvYmFzZS9jb21tb24vcHJvY2Vzcy5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvYmFzZS9jb21tb24vcGF0aC5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvYmFzZS9jb21tb24vdXJpLmpzIiwgIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yL2VzbS92cy9lZGl0b3IvY29tbW9uL2NvcmUvcG9zaXRpb24uanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2VkaXRvci9jb21tb24vY29yZS9yYW5nZS5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvZWRpdG9yL2NvbW1vbi9kaWZmL2RpZmZDb21wdXRlci5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvYmFzZS9jb21tb24vdWludC5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvZWRpdG9yL2NvbW1vbi92aWV3TW9kZWwvcHJlZml4U3VtQ29tcHV0ZXIuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2VkaXRvci9jb21tb24vbW9kZWwvbWlycm9yVGV4dE1vZGVsLmpzIiwgIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yL2VzbS92cy9lZGl0b3IvY29tbW9uL21vZGVsL3dvcmRIZWxwZXIuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2VkaXRvci9jb21tb24vY29yZS9jaGFyYWN0ZXJDbGFzc2lmaWVyLmpzIiwgIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yL2VzbS92cy9lZGl0b3IvY29tbW9uL21vZGVzL2xpbmtDb21wdXRlci5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvZWRpdG9yL2NvbW1vbi9tb2Rlcy9zdXBwb3J0cy9pbnBsYWNlUmVwbGFjZVN1cHBvcnQuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL2xpbmtlZExpc3QuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL3N0b3B3YXRjaC5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvYmFzZS9jb21tb24vZXZlbnQuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2Jhc2UvY29tbW9uL2NhbmNlbGxhdGlvbi5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvYmFzZS9jb21tb24va2V5Q29kZXMuanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2VkaXRvci9jb21tb24vY29yZS9zZWxlY3Rpb24uanMiLCAiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL21vbmFjby1lZGl0b3IvZXNtL3ZzL2VkaXRvci9jb21tb24vY29yZS90b2tlbi5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvZWRpdG9yL2NvbW1vbi9zdGFuZGFsb25lL3N0YW5kYWxvbmVFbnVtcy5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvZWRpdG9yL2NvbW1vbi9zdGFuZGFsb25lL3N0YW5kYWxvbmVCYXNlLmpzIiwgIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9tb25hY28tZWRpdG9yL2VzbS92cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL2VkaXRvclNpbXBsZVdvcmtlci5qcyIsICIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvbW9uYWNvLWVkaXRvci9lc20vdnMvZWRpdG9yL2VkaXRvci53b3JrZXIuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIEF2b2lkIGNpcmN1bGFyIGRlcGVuZGVuY3kgb24gRXZlbnRFbWl0dGVyIGJ5IGltcGxlbWVudGluZyBhIHN1YnNldCBvZiB0aGUgaW50ZXJmYWNlLlxyXG5leHBvcnQgY2xhc3MgRXJyb3JIYW5kbGVyIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0gW107XHJcbiAgICAgICAgdGhpcy51bmV4cGVjdGVkRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZS5zdGFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlLm1lc3NhZ2UgKyAnXFxuXFxuJyArIGUuc3RhY2spO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGVtaXQoZSkge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyKGUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgb25VbmV4cGVjdGVkRXJyb3IoZSkge1xyXG4gICAgICAgIHRoaXMudW5leHBlY3RlZEVycm9ySGFuZGxlcihlKTtcclxuICAgICAgICB0aGlzLmVtaXQoZSk7XHJcbiAgICB9XHJcbiAgICAvLyBGb3IgZXh0ZXJuYWwgZXJyb3JzLCB3ZSBkb24ndCB3YW50IHRoZSBsaXN0ZW5lcnMgdG8gYmUgY2FsbGVkXHJcbiAgICBvblVuZXhwZWN0ZWRFeHRlcm5hbEVycm9yKGUpIHtcclxuICAgICAgICB0aGlzLnVuZXhwZWN0ZWRFcnJvckhhbmRsZXIoZSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNvbnN0IGVycm9ySGFuZGxlciA9IG5ldyBFcnJvckhhbmRsZXIoKTtcclxuZXhwb3J0IGZ1bmN0aW9uIG9uVW5leHBlY3RlZEVycm9yKGUpIHtcclxuICAgIC8vIGlnbm9yZSBlcnJvcnMgZnJvbSBjYW5jZWxsZWQgcHJvbWlzZXNcclxuICAgIGlmICghaXNQcm9taXNlQ2FuY2VsZWRFcnJvcihlKSkge1xyXG4gICAgICAgIGVycm9ySGFuZGxlci5vblVuZXhwZWN0ZWRFcnJvcihlKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIG9uVW5leHBlY3RlZEV4dGVybmFsRXJyb3IoZSkge1xyXG4gICAgLy8gaWdub3JlIGVycm9ycyBmcm9tIGNhbmNlbGxlZCBwcm9taXNlc1xyXG4gICAgaWYgKCFpc1Byb21pc2VDYW5jZWxlZEVycm9yKGUpKSB7XHJcbiAgICAgICAgZXJyb3JIYW5kbGVyLm9uVW5leHBlY3RlZEV4dGVybmFsRXJyb3IoZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1FcnJvckZvclNlcmlhbGl6YXRpb24oZXJyb3IpIHtcclxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XHJcbiAgICAgICAgbGV0IHsgbmFtZSwgbWVzc2FnZSB9ID0gZXJyb3I7XHJcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBlcnJvci5zdGFja3RyYWNlIHx8IGVycm9yLnN0YWNrO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICRpc0Vycm9yOiB0cnVlLFxyXG4gICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICBtZXNzYWdlLFxyXG4gICAgICAgICAgICBzdGFja1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICAvLyByZXR1cm4gYXMgaXNcclxuICAgIHJldHVybiBlcnJvcjtcclxufVxyXG5jb25zdCBjYW5jZWxlZE5hbWUgPSAnQ2FuY2VsZWQnO1xyXG4vKipcclxuICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBlcnJvciBpcyBhIHByb21pc2UgaW4gY2FuY2VsZWQgc3RhdGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1Byb21pc2VDYW5jZWxlZEVycm9yKGVycm9yKSB7XHJcbiAgICByZXR1cm4gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnJvci5uYW1lID09PSBjYW5jZWxlZE5hbWUgJiYgZXJyb3IubWVzc2FnZSA9PT0gY2FuY2VsZWROYW1lO1xyXG59XHJcbi8qKlxyXG4gKiBSZXR1cm5zIGFuIGVycm9yIHRoYXQgc2lnbmFscyBjYW5jZWxsYXRpb24uXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY2FuY2VsZWQoKSB7XHJcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihjYW5jZWxlZE5hbWUpO1xyXG4gICAgZXJyb3IubmFtZSA9IGVycm9yLm1lc3NhZ2U7XHJcbiAgICByZXR1cm4gZXJyb3I7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlsbGVnYWxBcmd1bWVudChuYW1lKSB7XHJcbiAgICBpZiAobmFtZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRXJyb3IoYElsbGVnYWwgYXJndW1lbnQ6ICR7bmFtZX1gKTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBuZXcgRXJyb3IoJ0lsbGVnYWwgYXJndW1lbnQnKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaWxsZWdhbFN0YXRlKG5hbWUpIHtcclxuICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihgSWxsZWdhbCBzdGF0ZTogJHtuYW1lfWApO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcignSWxsZWdhbCBzdGF0ZScpO1xyXG4gICAgfVxyXG59XHJcbiIsICIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuZXhwb3J0IHZhciBJdGVyYWJsZTtcclxuKGZ1bmN0aW9uIChJdGVyYWJsZSkge1xyXG4gICAgZnVuY3Rpb24gaXModGhpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpbmcgJiYgdHlwZW9mIHRoaW5nID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGhpbmdbU3ltYm9sLml0ZXJhdG9yXSA9PT0gJ2Z1bmN0aW9uJztcclxuICAgIH1cclxuICAgIEl0ZXJhYmxlLmlzID0gaXM7XHJcbiAgICBjb25zdCBfZW1wdHkgPSBPYmplY3QuZnJlZXplKFtdKTtcclxuICAgIGZ1bmN0aW9uIGVtcHR5KCkge1xyXG4gICAgICAgIHJldHVybiBfZW1wdHk7XHJcbiAgICB9XHJcbiAgICBJdGVyYWJsZS5lbXB0eSA9IGVtcHR5O1xyXG4gICAgZnVuY3Rpb24qIHNpbmdsZShlbGVtZW50KSB7XHJcbiAgICAgICAgeWllbGQgZWxlbWVudDtcclxuICAgIH1cclxuICAgIEl0ZXJhYmxlLnNpbmdsZSA9IHNpbmdsZTtcclxuICAgIGZ1bmN0aW9uIGZyb20oaXRlcmFibGUpIHtcclxuICAgICAgICByZXR1cm4gaXRlcmFibGUgfHwgX2VtcHR5O1xyXG4gICAgfVxyXG4gICAgSXRlcmFibGUuZnJvbSA9IGZyb207XHJcbiAgICBmdW5jdGlvbiBpc0VtcHR5KGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgcmV0dXJuICFpdGVyYWJsZSB8fCBpdGVyYWJsZVtTeW1ib2wuaXRlcmF0b3JdKCkubmV4dCgpLmRvbmUgPT09IHRydWU7XHJcbiAgICB9XHJcbiAgICBJdGVyYWJsZS5pc0VtcHR5ID0gaXNFbXB0eTtcclxuICAgIGZ1bmN0aW9uIGZpcnN0KGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlW1N5bWJvbC5pdGVyYXRvcl0oKS5uZXh0KCkudmFsdWU7XHJcbiAgICB9XHJcbiAgICBJdGVyYWJsZS5maXJzdCA9IGZpcnN0O1xyXG4gICAgZnVuY3Rpb24gc29tZShpdGVyYWJsZSwgcHJlZGljYXRlKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIEl0ZXJhYmxlLnNvbWUgPSBzb21lO1xyXG4gICAgZnVuY3Rpb24gZmluZChpdGVyYWJsZSwgcHJlZGljYXRlKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUoZWxlbWVudCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBJdGVyYWJsZS5maW5kID0gZmluZDtcclxuICAgIGZ1bmN0aW9uKiBmaWx0ZXIoaXRlcmFibGUsIHByZWRpY2F0ZSkge1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKGVsZW1lbnQpKSB7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCBlbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgSXRlcmFibGUuZmlsdGVyID0gZmlsdGVyO1xyXG4gICAgZnVuY3Rpb24qIG1hcChpdGVyYWJsZSwgZm4pIHtcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICB5aWVsZCBmbihlbGVtZW50LCBpbmRleCsrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBJdGVyYWJsZS5tYXAgPSBtYXA7XHJcbiAgICBmdW5jdGlvbiogY29uY2F0KC4uLml0ZXJhYmxlcykge1xyXG4gICAgICAgIGZvciAoY29uc3QgaXRlcmFibGUgb2YgaXRlcmFibGVzKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWxlbWVudCBvZiBpdGVyYWJsZSkge1xyXG4gICAgICAgICAgICAgICAgeWllbGQgZWxlbWVudDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEl0ZXJhYmxlLmNvbmNhdCA9IGNvbmNhdDtcclxuICAgIGZ1bmN0aW9uKiBjb25jYXROZXN0ZWQoaXRlcmFibGVzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBpdGVyYWJsZSBvZiBpdGVyYWJsZXMpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB5aWVsZCBlbGVtZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgSXRlcmFibGUuY29uY2F0TmVzdGVkID0gY29uY2F0TmVzdGVkO1xyXG4gICAgZnVuY3Rpb24gcmVkdWNlKGl0ZXJhYmxlLCByZWR1Y2VyLCBpbml0aWFsVmFsdWUpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBpbml0aWFsVmFsdWU7XHJcbiAgICAgICAgZm9yIChjb25zdCBlbGVtZW50IG9mIGl0ZXJhYmxlKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gcmVkdWNlcih2YWx1ZSwgZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuICAgIEl0ZXJhYmxlLnJlZHVjZSA9IHJlZHVjZTtcclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhbiBpdGVyYWJsZSBzbGljZSBvZiB0aGUgYXJyYXksIHdpdGggdGhlIHNhbWUgc2VtYW50aWNzIGFzIGBhcnJheS5zbGljZSgpYC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24qIHNsaWNlKGFyciwgZnJvbSwgdG8gPSBhcnIubGVuZ3RoKSB7XHJcbiAgICAgICAgaWYgKGZyb20gPCAwKSB7XHJcbiAgICAgICAgICAgIGZyb20gKz0gYXJyLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRvIDwgMCkge1xyXG4gICAgICAgICAgICB0byArPSBhcnIubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0byA+IGFyci5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdG8gPSBhcnIubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKDsgZnJvbSA8IHRvOyBmcm9tKyspIHtcclxuICAgICAgICAgICAgeWllbGQgYXJyW2Zyb21dO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIEl0ZXJhYmxlLnNsaWNlID0gc2xpY2U7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN1bWVzIGBhdE1vc3RgIGVsZW1lbnRzIGZyb20gaXRlcmFibGUgYW5kIHJldHVybnMgdGhlIGNvbnN1bWVkIGVsZW1lbnRzLFxyXG4gICAgICogYW5kIGFuIGl0ZXJhYmxlIGZvciB0aGUgcmVzdCBvZiB0aGUgZWxlbWVudHMuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNvbnN1bWUoaXRlcmFibGUsIGF0TW9zdCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xyXG4gICAgICAgIGNvbnN0IGNvbnN1bWVkID0gW107XHJcbiAgICAgICAgaWYgKGF0TW9zdCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gW2NvbnN1bWVkLCBpdGVyYWJsZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gaXRlcmFibGVbU3ltYm9sLml0ZXJhdG9yXSgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXRNb3N0OyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbmV4dCA9IGl0ZXJhdG9yLm5leHQoKTtcclxuICAgICAgICAgICAgaWYgKG5leHQuZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtjb25zdW1lZCwgSXRlcmFibGUuZW1wdHkoKV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3VtZWQucHVzaChuZXh0LnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtjb25zdW1lZCwgeyBbU3ltYm9sLml0ZXJhdG9yXSgpIHsgcmV0dXJuIGl0ZXJhdG9yOyB9IH1dO1xyXG4gICAgfVxyXG4gICAgSXRlcmFibGUuY29uc3VtZSA9IGNvbnN1bWU7XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgd2hldGhlciB0aGUgaXRlcmFibGVzIGFyZSB0aGUgc2FtZSBsZW5ndGggYW5kIGFsbCBpdGVtcyBhcmVcclxuICAgICAqIGVxdWFsIHVzaW5nIHRoZSBjb21wYXJhdG9yIGZ1bmN0aW9uLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBlcXVhbHMoYSwgYiwgY29tcGFyYXRvciA9IChhdCwgYnQpID0+IGF0ID09PSBidCkge1xyXG4gICAgICAgIGNvbnN0IGFpID0gYVtTeW1ib2wuaXRlcmF0b3JdKCk7XHJcbiAgICAgICAgY29uc3QgYmkgPSBiW1N5bWJvbC5pdGVyYXRvcl0oKTtcclxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICBjb25zdCBhbiA9IGFpLm5leHQoKTtcclxuICAgICAgICAgICAgY29uc3QgYm4gPSBiaS5uZXh0KCk7XHJcbiAgICAgICAgICAgIGlmIChhbi5kb25lICE9PSBibi5kb25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoYW4uZG9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIWNvbXBhcmF0b3IoYW4udmFsdWUsIGJuLnZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgSXRlcmFibGUuZXF1YWxzID0gZXF1YWxzO1xyXG59KShJdGVyYWJsZSB8fCAoSXRlcmFibGUgPSB7fSkpO1xyXG4iLCAiaW1wb3J0IHsgSXRlcmFibGUgfSBmcm9tICcuL2l0ZXJhdG9yLmpzJztcclxuLyoqXHJcbiAqIEVuYWJsZXMgbG9nZ2luZyBvZiBwb3RlbnRpYWxseSBsZWFrZWQgZGlzcG9zYWJsZXMuXHJcbiAqXHJcbiAqIEEgZGlzcG9zYWJsZSBpcyBjb25zaWRlcmVkIGxlYWtlZCBpZiBpdCBpcyBub3QgZGlzcG9zZWQgb3Igbm90IHJlZ2lzdGVyZWQgYXMgdGhlIGNoaWxkIG9mXHJcbiAqIGFub3RoZXIgZGlzcG9zYWJsZS4gVGhpcyB0cmFja2luZyBpcyB2ZXJ5IHNpbXBsZSBhbiBvbmx5IHdvcmtzIGZvciBjbGFzc2VzIHRoYXQgZWl0aGVyXHJcbiAqIGV4dGVuZCBEaXNwb3NhYmxlIG9yIHVzZSBhIERpc3Bvc2FibGVTdG9yZS4gVGhpcyBtZWFucyB0aGVyZSBhcmUgYSBsb3Qgb2YgZmFsc2UgcG9zaXRpdmVzLlxyXG4gKi9cclxuY29uc3QgVFJBQ0tfRElTUE9TQUJMRVMgPSBmYWxzZTtcclxubGV0IGRpc3Bvc2FibGVUcmFja2VyID0gbnVsbDtcclxuaWYgKFRSQUNLX0RJU1BPU0FCTEVTKSB7XHJcbiAgICBjb25zdCBfX2lzX2Rpc3Bvc2FibGVfdHJhY2tlZF9fID0gJ19faXNfZGlzcG9zYWJsZV90cmFja2VkX18nO1xyXG4gICAgZGlzcG9zYWJsZVRyYWNrZXIgPSBuZXcgY2xhc3Mge1xyXG4gICAgICAgIHRyYWNrRGlzcG9zYWJsZSh4KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCdQb3RlbnRpYWxseSBsZWFrZWQgZGlzcG9zYWJsZScpLnN0YWNrO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICgheFtfX2lzX2Rpc3Bvc2FibGVfdHJhY2tlZF9fXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHN0YWNrKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMzAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hcmtUcmFja2VkKHgpIHtcclxuICAgICAgICAgICAgaWYgKHggJiYgeCAhPT0gRGlzcG9zYWJsZS5Ob25lKSB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhbX19pc19kaXNwb3NhYmxlX3RyYWNrZWRfX10gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKF9hKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbm9vcFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5mdW5jdGlvbiBtYXJrVHJhY2tlZCh4KSB7XHJcbiAgICBpZiAoIWRpc3Bvc2FibGVUcmFja2VyKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgZGlzcG9zYWJsZVRyYWNrZXIubWFya1RyYWNrZWQoeCk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHRyYWNrRGlzcG9zYWJsZSh4KSB7XHJcbiAgICBpZiAoIWRpc3Bvc2FibGVUcmFja2VyKSB7XHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcbiAgICBkaXNwb3NhYmxlVHJhY2tlci50cmFja0Rpc3Bvc2FibGUoeCk7XHJcbiAgICByZXR1cm4geDtcclxufVxyXG5leHBvcnQgY2xhc3MgTXVsdGlEaXNwb3NlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XHJcbiAgICBjb25zdHJ1Y3RvcihlcnJvcnMpIHtcclxuICAgICAgICBzdXBlcihgRW5jb3VudGVyZWQgZXJyb3JzIHdoaWxlIGRpc3Bvc2luZyBvZiBzdG9yZS4gRXJyb3JzOiBbJHtlcnJvcnMuam9pbignLCAnKX1dYCk7XHJcbiAgICAgICAgdGhpcy5lcnJvcnMgPSBlcnJvcnM7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRGlzcG9zYWJsZSh0aGluZykge1xyXG4gICAgcmV0dXJuIHR5cGVvZiB0aGluZy5kaXNwb3NlID09PSAnZnVuY3Rpb24nICYmIHRoaW5nLmRpc3Bvc2UubGVuZ3RoID09PSAwO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlKGFyZykge1xyXG4gICAgaWYgKEl0ZXJhYmxlLmlzKGFyZykpIHtcclxuICAgICAgICBsZXQgZXJyb3JzID0gW107XHJcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGFyZykge1xyXG4gICAgICAgICAgICBpZiAoZCkge1xyXG4gICAgICAgICAgICAgICAgbWFya1RyYWNrZWQoZCk7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIGQuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aHJvdyBlcnJvcnNbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGVycm9ycy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBNdWx0aURpc3Bvc2VFcnJvcihlcnJvcnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShhcmcpID8gW10gOiBhcmc7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChhcmcpIHtcclxuICAgICAgICBtYXJrVHJhY2tlZChhcmcpO1xyXG4gICAgICAgIGFyZy5kaXNwb3NlKCk7XHJcbiAgICAgICAgcmV0dXJuIGFyZztcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY29tYmluZWREaXNwb3NhYmxlKC4uLmRpc3Bvc2FibGVzKSB7XHJcbiAgICBkaXNwb3NhYmxlcy5mb3JFYWNoKG1hcmtUcmFja2VkKTtcclxuICAgIHJldHVybiB0b0Rpc3Bvc2FibGUoKCkgPT4gZGlzcG9zZShkaXNwb3NhYmxlcykpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiB0b0Rpc3Bvc2FibGUoZm4pIHtcclxuICAgIGNvbnN0IHNlbGYgPSB0cmFja0Rpc3Bvc2FibGUoe1xyXG4gICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcclxuICAgICAgICAgICAgbWFya1RyYWNrZWQoc2VsZik7XHJcbiAgICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gc2VsZjtcclxufVxyXG5leHBvcnQgY2xhc3MgRGlzcG9zYWJsZVN0b3JlIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX3RvRGlzcG9zZSA9IG5ldyBTZXQoKTtcclxuICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIERpc3Bvc2Ugb2YgYWxsIHJlZ2lzdGVyZWQgZGlzcG9zYWJsZXMgYW5kIG1hcmsgdGhpcyBvYmplY3QgYXMgZGlzcG9zZWQuXHJcbiAgICAgKlxyXG4gICAgICogQW55IGZ1dHVyZSBkaXNwb3NhYmxlcyBhZGRlZCB0byB0aGlzIG9iamVjdCB3aWxsIGJlIGRpc3Bvc2VkIG9mIG9uIGBhZGRgLlxyXG4gICAgICovXHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rpc3Bvc2VkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbWFya1RyYWNrZWQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNwb3NlIG9mIGFsbCByZWdpc3RlcmVkIGRpc3Bvc2FibGVzIGJ1dCBkbyBub3QgbWFyayB0aGlzIG9iamVjdCBhcyBkaXNwb3NlZC5cclxuICAgICAqL1xyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgZGlzcG9zZSh0aGlzLl90b0Rpc3Bvc2UudmFsdWVzKCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHtcclxuICAgICAgICAgICAgdGhpcy5fdG9EaXNwb3NlLmNsZWFyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYWRkKHQpIHtcclxuICAgICAgICBpZiAoIXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0ID09PSB0aGlzKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJlZ2lzdGVyIGEgZGlzcG9zYWJsZSBvbiBpdHNlbGYhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hcmtUcmFja2VkKHQpO1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0Rpc3Bvc2VkKSB7XHJcbiAgICAgICAgICAgIGlmICghRGlzcG9zYWJsZVN0b3JlLkRJU0FCTEVfRElTUE9TRURfV0FSTklORykge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKG5ldyBFcnJvcignVHJ5aW5nIHRvIGFkZCBhIGRpc3Bvc2FibGUgdG8gYSBEaXNwb3NhYmxlU3RvcmUgdGhhdCBoYXMgYWxyZWFkeSBiZWVuIGRpc3Bvc2VkIG9mLiBUaGUgYWRkZWQgb2JqZWN0IHdpbGwgYmUgbGVha2VkIScpLnN0YWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fdG9EaXNwb3NlLmFkZCh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbn1cclxuRGlzcG9zYWJsZVN0b3JlLkRJU0FCTEVfRElTUE9TRURfV0FSTklORyA9IGZhbHNlO1xyXG5leHBvcnQgY2xhc3MgRGlzcG9zYWJsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9zdG9yZSA9IG5ldyBEaXNwb3NhYmxlU3RvcmUoKTtcclxuICAgICAgICB0cmFja0Rpc3Bvc2FibGUodGhpcyk7XHJcbiAgICB9XHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIG1hcmtUcmFja2VkKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX3N0b3JlLmRpc3Bvc2UoKTtcclxuICAgIH1cclxuICAgIF9yZWdpc3Rlcih0KSB7XHJcbiAgICAgICAgaWYgKHQgPT09IHRoaXMpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcmVnaXN0ZXIgYSBkaXNwb3NhYmxlIG9uIGl0c2VsZiEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3JlLmFkZCh0KTtcclxuICAgIH1cclxufVxyXG5EaXNwb3NhYmxlLk5vbmUgPSBPYmplY3QuZnJlZXplKHsgZGlzcG9zZSgpIHsgfSB9KTtcclxuLyoqXHJcbiAqIE1hbmFnZXMgdGhlIGxpZmVjeWNsZSBvZiBhIGRpc3Bvc2FibGUgdmFsdWUgdGhhdCBtYXkgYmUgY2hhbmdlZC5cclxuICpcclxuICogVGhpcyBlbnN1cmVzIHRoYXQgd2hlbiB0aGUgZGlzcG9zYWJsZSB2YWx1ZSBpcyBjaGFuZ2VkLCB0aGUgcHJldmlvdXNseSBoZWxkIGRpc3Bvc2FibGUgaXMgZGlzcG9zZWQgb2YuIFlvdSBjYW5cclxuICogYWxzbyByZWdpc3RlciBhIGBNdXRhYmxlRGlzcG9zYWJsZWAgb24gYSBgRGlzcG9zYWJsZWAgdG8gZW5zdXJlIGl0IGlzIGF1dG9tYXRpY2FsbHkgY2xlYW5lZCB1cC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBNdXRhYmxlRGlzcG9zYWJsZSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gZmFsc2U7XHJcbiAgICAgICAgdHJhY2tEaXNwb3NhYmxlKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgZ2V0IHZhbHVlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pc0Rpc3Bvc2VkID8gdW5kZWZpbmVkIDogdGhpcy5fdmFsdWU7XHJcbiAgICB9XHJcbiAgICBzZXQgdmFsdWUodmFsdWUpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgaWYgKHRoaXMuX2lzRGlzcG9zZWQgfHwgdmFsdWUgPT09IHRoaXMuX3ZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgKF9hID0gdGhpcy5fdmFsdWUpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5kaXNwb3NlKCk7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIG1hcmtUcmFja2VkKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIGNsZWFyKCkge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcclxuICAgICAgICBtYXJrVHJhY2tlZCh0aGlzKTtcclxuICAgICAgICAoX2EgPSB0aGlzLl92YWx1ZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmRpc3Bvc2UoKTtcclxuICAgICAgICB0aGlzLl92YWx1ZSA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgSW1tb3J0YWxSZWZlcmVuY2Uge1xyXG4gICAgY29uc3RydWN0b3Iob2JqZWN0KSB7XHJcbiAgICAgICAgdGhpcy5vYmplY3QgPSBvYmplY3Q7XHJcbiAgICB9XHJcbiAgICBkaXNwb3NlKCkgeyB9XHJcbn1cclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG52YXIgX2E7XHJcbmNvbnN0IExBTkdVQUdFX0RFRkFVTFQgPSAnZW4nO1xyXG5sZXQgX2lzV2luZG93cyA9IGZhbHNlO1xyXG5sZXQgX2lzTWFjaW50b3NoID0gZmFsc2U7XHJcbmxldCBfaXNMaW51eCA9IGZhbHNlO1xyXG5sZXQgX2lzTGludXhTbmFwID0gZmFsc2U7XHJcbmxldCBfaXNOYXRpdmUgPSBmYWxzZTtcclxubGV0IF9pc1dlYiA9IGZhbHNlO1xyXG5sZXQgX2lzSU9TID0gZmFsc2U7XHJcbmxldCBfbG9jYWxlID0gdW5kZWZpbmVkO1xyXG5sZXQgX2xhbmd1YWdlID0gTEFOR1VBR0VfREVGQVVMVDtcclxubGV0IF90cmFuc2xhdGlvbnNDb25maWdGaWxlID0gdW5kZWZpbmVkO1xyXG5sZXQgX3VzZXJBZ2VudCA9IHVuZGVmaW5lZDtcclxuZXhwb3J0IGNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHNlbGYgPT09ICdvYmplY3QnID8gc2VsZiA6IHR5cGVvZiBnbG9iYWwgPT09ICdvYmplY3QnID8gZ2xvYmFsIDoge30pO1xyXG5sZXQgbm9kZVByb2Nlc3MgPSB1bmRlZmluZWQ7XHJcbmlmICh0eXBlb2YgZ2xvYmFscy52c2NvZGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBnbG9iYWxzLnZzY29kZS5wcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgLy8gTmF0aXZlIGVudmlyb25tZW50IChzYW5kYm94ZWQpXHJcbiAgICBub2RlUHJvY2VzcyA9IGdsb2JhbHMudnNjb2RlLnByb2Nlc3M7XHJcbn1cclxuZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAvLyBOYXRpdmUgZW52aXJvbm1lbnQgKG5vbi1zYW5kYm94ZWQpXHJcbiAgICBub2RlUHJvY2VzcyA9IHByb2Nlc3M7XHJcbn1cclxuY29uc3QgaXNFbGVjdHJvblJlbmRlcmVyID0gdHlwZW9mICgoX2EgPSBub2RlUHJvY2VzcyA9PT0gbnVsbCB8fCBub2RlUHJvY2VzcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZVByb2Nlc3MudmVyc2lvbnMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5lbGVjdHJvbikgPT09ICdzdHJpbmcnICYmIG5vZGVQcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcic7XHJcbmV4cG9ydCBjb25zdCBpc0VsZWN0cm9uU2FuZGJveGVkID0gaXNFbGVjdHJvblJlbmRlcmVyICYmIChub2RlUHJvY2VzcyA9PT0gbnVsbCB8fCBub2RlUHJvY2VzcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZVByb2Nlc3Muc2FuZGJveGVkKTtcclxuZXhwb3J0IGNvbnN0IGJyb3dzZXJDb2RlTG9hZGluZ0NhY2hlU3RyYXRlZ3kgPSAoKCkgPT4ge1xyXG4gICAgLy8gQWx3YXlzIGVuYWJsZWQgd2hlbiBzYW5kYm94IGlzIGVuYWJsZWRcclxuICAgIGlmIChpc0VsZWN0cm9uU2FuZGJveGVkKSB7XHJcbiAgICAgICAgcmV0dXJuICdieXBhc3NIZWF0Q2hlY2snO1xyXG4gICAgfVxyXG4gICAgLy8gT3RoZXJ3aXNlLCBvbmx5IGVuYWJsZWQgY29uZGl0aW9uYWxseVxyXG4gICAgY29uc3QgZW52ID0gbm9kZVByb2Nlc3MgPT09IG51bGwgfHwgbm9kZVByb2Nlc3MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IG5vZGVQcm9jZXNzLmVudlsnVlNDT0RFX0JST1dTRVJfQ09ERV9MT0FESU5HJ107XHJcbiAgICBpZiAodHlwZW9mIGVudiA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBpZiAoZW52ID09PSAnbm9uZScgfHwgZW52ID09PSAnY29kZScgfHwgZW52ID09PSAnYnlwYXNzSGVhdENoZWNrJyB8fCBlbnYgPT09ICdieXBhc3NIZWF0Q2hlY2tBbmRFYWdlckNvbXBpbGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlbnY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAnYnlwYXNzSGVhdENoZWNrJztcclxuICAgIH1cclxuICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbn0pKCk7XHJcbmV4cG9ydCBjb25zdCBpc1ByZWZlcnJpbmdCcm93c2VyQ29kZUxvYWQgPSB0eXBlb2YgYnJvd3NlckNvZGVMb2FkaW5nQ2FjaGVTdHJhdGVneSA9PT0gJ3N0cmluZyc7XHJcbi8vIFdlYiBlbnZpcm9ubWVudFxyXG5pZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ29iamVjdCcgJiYgIWlzRWxlY3Ryb25SZW5kZXJlcikge1xyXG4gICAgX3VzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XHJcbiAgICBfaXNXaW5kb3dzID0gX3VzZXJBZ2VudC5pbmRleE9mKCdXaW5kb3dzJykgPj0gMDtcclxuICAgIF9pc01hY2ludG9zaCA9IF91c2VyQWdlbnQuaW5kZXhPZignTWFjaW50b3NoJykgPj0gMDtcclxuICAgIF9pc0lPUyA9IChfdXNlckFnZW50LmluZGV4T2YoJ01hY2ludG9zaCcpID49IDAgfHwgX3VzZXJBZ2VudC5pbmRleE9mKCdpUGFkJykgPj0gMCB8fCBfdXNlckFnZW50LmluZGV4T2YoJ2lQaG9uZScpID49IDApICYmICEhbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzICYmIG5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDA7XHJcbiAgICBfaXNMaW51eCA9IF91c2VyQWdlbnQuaW5kZXhPZignTGludXgnKSA+PSAwO1xyXG4gICAgX2lzV2ViID0gdHJ1ZTtcclxuICAgIF9sb2NhbGUgPSBuYXZpZ2F0b3IubGFuZ3VhZ2U7XHJcbiAgICBfbGFuZ3VhZ2UgPSBfbG9jYWxlO1xyXG59XHJcbi8vIE5hdGl2ZSBlbnZpcm9ubWVudFxyXG5lbHNlIGlmICh0eXBlb2Ygbm9kZVByb2Nlc3MgPT09ICdvYmplY3QnKSB7XHJcbiAgICBfaXNXaW5kb3dzID0gKG5vZGVQcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInKTtcclxuICAgIF9pc01hY2ludG9zaCA9IChub2RlUHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpO1xyXG4gICAgX2lzTGludXggPSAobm9kZVByb2Nlc3MucGxhdGZvcm0gPT09ICdsaW51eCcpO1xyXG4gICAgX2lzTGludXhTbmFwID0gX2lzTGludXggJiYgISFub2RlUHJvY2Vzcy5lbnZbJ1NOQVAnXSAmJiAhIW5vZGVQcm9jZXNzLmVudlsnU05BUF9SRVZJU0lPTiddO1xyXG4gICAgX2xvY2FsZSA9IExBTkdVQUdFX0RFRkFVTFQ7XHJcbiAgICBfbGFuZ3VhZ2UgPSBMQU5HVUFHRV9ERUZBVUxUO1xyXG4gICAgY29uc3QgcmF3TmxzQ29uZmlnID0gbm9kZVByb2Nlc3MuZW52WydWU0NPREVfTkxTX0NPTkZJRyddO1xyXG4gICAgaWYgKHJhd05sc0NvbmZpZykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5sc0NvbmZpZyA9IEpTT04ucGFyc2UocmF3TmxzQ29uZmlnKTtcclxuICAgICAgICAgICAgY29uc3QgcmVzb2x2ZWQgPSBubHNDb25maWcuYXZhaWxhYmxlTGFuZ3VhZ2VzWycqJ107XHJcbiAgICAgICAgICAgIF9sb2NhbGUgPSBubHNDb25maWcubG9jYWxlO1xyXG4gICAgICAgICAgICAvLyBWU0NvZGUncyBkZWZhdWx0IGxhbmd1YWdlIGlzICdlbidcclxuICAgICAgICAgICAgX2xhbmd1YWdlID0gcmVzb2x2ZWQgPyByZXNvbHZlZCA6IExBTkdVQUdFX0RFRkFVTFQ7XHJcbiAgICAgICAgICAgIF90cmFuc2xhdGlvbnNDb25maWdGaWxlID0gbmxzQ29uZmlnLl90cmFuc2xhdGlvbnNDb25maWdGaWxlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIF9pc05hdGl2ZSA9IHRydWU7XHJcbn1cclxuLy8gVW5rbm93biBlbnZpcm9ubWVudFxyXG5lbHNlIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ1VuYWJsZSB0byByZXNvbHZlIHBsYXRmb3JtLicpO1xyXG59XHJcbmxldCBfcGxhdGZvcm0gPSAwIC8qIFdlYiAqLztcclxuaWYgKF9pc01hY2ludG9zaCkge1xyXG4gICAgX3BsYXRmb3JtID0gMSAvKiBNYWMgKi87XHJcbn1cclxuZWxzZSBpZiAoX2lzV2luZG93cykge1xyXG4gICAgX3BsYXRmb3JtID0gMyAvKiBXaW5kb3dzICovO1xyXG59XHJcbmVsc2UgaWYgKF9pc0xpbnV4KSB7XHJcbiAgICBfcGxhdGZvcm0gPSAyIC8qIExpbnV4ICovO1xyXG59XHJcbmV4cG9ydCBjb25zdCBpc1dpbmRvd3MgPSBfaXNXaW5kb3dzO1xyXG5leHBvcnQgY29uc3QgaXNNYWNpbnRvc2ggPSBfaXNNYWNpbnRvc2g7XHJcbmV4cG9ydCBjb25zdCBpc0xpbnV4ID0gX2lzTGludXg7XHJcbmV4cG9ydCBjb25zdCBpc05hdGl2ZSA9IF9pc05hdGl2ZTtcclxuZXhwb3J0IGNvbnN0IGlzV2ViID0gX2lzV2ViO1xyXG5leHBvcnQgY29uc3QgaXNJT1MgPSBfaXNJT1M7XHJcbmV4cG9ydCBjb25zdCB1c2VyQWdlbnQgPSBfdXNlckFnZW50O1xyXG5leHBvcnQgY29uc3Qgc2V0SW1tZWRpYXRlID0gKGZ1bmN0aW9uIGRlZmluZVNldEltbWVkaWF0ZSgpIHtcclxuICAgIGlmIChnbG9iYWxzLnNldEltbWVkaWF0ZSkge1xyXG4gICAgICAgIHJldHVybiBnbG9iYWxzLnNldEltbWVkaWF0ZS5iaW5kKGdsb2JhbHMpO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiBnbG9iYWxzLnBvc3RNZXNzYWdlID09PSAnZnVuY3Rpb24nICYmICFnbG9iYWxzLmltcG9ydFNjcmlwdHMpIHtcclxuICAgICAgICBsZXQgcGVuZGluZyA9IFtdO1xyXG4gICAgICAgIGdsb2JhbHMuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChlKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlLmRhdGEgJiYgZS5kYXRhLnZzY29kZVNldEltbWVkaWF0ZUlkKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGVuZGluZy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZSA9IHBlbmRpbmdbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZS5pZCA9PT0gZS5kYXRhLnZzY29kZVNldEltbWVkaWF0ZUlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmcuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5kaWRhdGUuY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGxldCBsYXN0SWQgPSAwO1xyXG4gICAgICAgIHJldHVybiAoY2FsbGJhY2spID0+IHtcclxuICAgICAgICAgICAgY29uc3QgbXlJZCA9ICsrbGFzdElkO1xyXG4gICAgICAgICAgICBwZW5kaW5nLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgaWQ6IG15SWQsXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2tcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGdsb2JhbHMucG9zdE1lc3NhZ2UoeyB2c2NvZGVTZXRJbW1lZGlhdGVJZDogbXlJZCB9LCAnKicpO1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBpZiAodHlwZW9mIChub2RlUHJvY2VzcyA9PT0gbnVsbCB8fCBub2RlUHJvY2VzcyA9PT0gdm9pZCAwID8gdm9pZCAwIDogbm9kZVByb2Nlc3MubmV4dFRpY2spID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgcmV0dXJuIG5vZGVQcm9jZXNzLm5leHRUaWNrLmJpbmQobm9kZVByb2Nlc3MpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgX3Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcclxuICAgIHJldHVybiAoY2FsbGJhY2spID0+IF9wcm9taXNlLnRoZW4oY2FsbGJhY2spO1xyXG59KSgpO1xyXG5leHBvcnQgY29uc3QgT1MgPSAoX2lzTWFjaW50b3NoIHx8IF9pc0lPUyA/IDIgLyogTWFjaW50b3NoICovIDogKF9pc1dpbmRvd3MgPyAxIC8qIFdpbmRvd3MgKi8gOiAzIC8qIExpbnV4ICovKSk7XHJcbmxldCBfaXNMaXR0bGVFbmRpYW4gPSB0cnVlO1xyXG5sZXQgX2lzTGl0dGxlRW5kaWFuQ29tcHV0ZWQgPSBmYWxzZTtcclxuZXhwb3J0IGZ1bmN0aW9uIGlzTGl0dGxlRW5kaWFuKCkge1xyXG4gICAgaWYgKCFfaXNMaXR0bGVFbmRpYW5Db21wdXRlZCkge1xyXG4gICAgICAgIF9pc0xpdHRsZUVuZGlhbkNvbXB1dGVkID0gdHJ1ZTtcclxuICAgICAgICBjb25zdCB0ZXN0ID0gbmV3IFVpbnQ4QXJyYXkoMik7XHJcbiAgICAgICAgdGVzdFswXSA9IDE7XHJcbiAgICAgICAgdGVzdFsxXSA9IDI7XHJcbiAgICAgICAgY29uc3QgdmlldyA9IG5ldyBVaW50MTZBcnJheSh0ZXN0LmJ1ZmZlcik7XHJcbiAgICAgICAgX2lzTGl0dGxlRW5kaWFuID0gKHZpZXdbMF0gPT09ICgyIDw8IDgpICsgMSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX2lzTGl0dGxlRW5kaWFuO1xyXG59XHJcbiIsICIvKipcclxuICogQHJldHVybnMgd2hldGhlciB0aGUgcHJvdmlkZWQgcGFyYW1ldGVyIGlzIGEgSmF2YVNjcmlwdCBBcnJheSBvciBub3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNBcnJheShhcnJheSkge1xyXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyYXkpO1xyXG59XHJcbi8qKlxyXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBwcm92aWRlZCBwYXJhbWV0ZXIgaXMgYSBKYXZhU2NyaXB0IFN0cmluZyBvciBub3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNTdHJpbmcoc3RyKSB7XHJcbiAgICByZXR1cm4gKHR5cGVvZiBzdHIgPT09ICdzdHJpbmcnKTtcclxufVxyXG4vKipcclxuICpcclxuICogQHJldHVybnMgd2hldGhlciB0aGUgcHJvdmlkZWQgcGFyYW1ldGVyIGlzIG9mIHR5cGUgYG9iamVjdGAgYnV0ICoqbm90KipcclxuICpcdGBudWxsYCwgYW4gYGFycmF5YCwgYSBgcmVnZXhwYCwgbm9yIGEgYGRhdGVgLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xyXG4gICAgLy8gVGhlIG1ldGhvZCBjYW4ndCBkbyBhIHR5cGUgY2FzdCBzaW5jZSB0aGVyZSBhcmUgdHlwZSAobGlrZSBzdHJpbmdzKSB3aGljaFxyXG4gICAgLy8gYXJlIHN1YmNsYXNzZXMgb2YgYW55IHB1dCBub3QgcG9zaXR2ZWx5IG1hdGNoZWQgYnkgdGhlIGZ1bmN0aW9uLiBIZW5jZSB0eXBlXHJcbiAgICAvLyBuYXJyb3dpbmcgcmVzdWx0cyBpbiB3cm9uZyByZXN1bHRzLlxyXG4gICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnXHJcbiAgICAgICAgJiYgb2JqICE9PSBudWxsXHJcbiAgICAgICAgJiYgIUFycmF5LmlzQXJyYXkob2JqKVxyXG4gICAgICAgICYmICEob2JqIGluc3RhbmNlb2YgUmVnRXhwKVxyXG4gICAgICAgICYmICEob2JqIGluc3RhbmNlb2YgRGF0ZSk7XHJcbn1cclxuLyoqXHJcbiAqIEluICoqY29udHJhc3QqKiB0byBqdXN0IGNoZWNraW5nIGB0eXBlb2ZgIHRoaXMgd2lsbCByZXR1cm4gYGZhbHNlYCBmb3IgYE5hTmAuXHJcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHBhcmFtZXRlciBpcyBhIEphdmFTY3JpcHQgTnVtYmVyIG9yIG5vdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlcihvYmopIHtcclxuICAgIHJldHVybiAodHlwZW9mIG9iaiA9PT0gJ251bWJlcicgJiYgIWlzTmFOKG9iaikpO1xyXG59XHJcbi8qKlxyXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBwcm92aWRlZCBwYXJhbWV0ZXIgaXMgYSBKYXZhU2NyaXB0IEJvb2xlYW4gb3Igbm90LlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQm9vbGVhbihvYmopIHtcclxuICAgIHJldHVybiAob2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UpO1xyXG59XHJcbi8qKlxyXG4gKiBAcmV0dXJucyB3aGV0aGVyIHRoZSBwcm92aWRlZCBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVW5kZWZpbmVkKG9iaikge1xyXG4gICAgcmV0dXJuICh0eXBlb2Ygb2JqID09PSAndW5kZWZpbmVkJyk7XHJcbn1cclxuLyoqXHJcbiAqIEByZXR1cm5zIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHBhcmFtZXRlciBpcyB1bmRlZmluZWQgb3IgbnVsbC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1VuZGVmaW5lZE9yTnVsbChvYmopIHtcclxuICAgIHJldHVybiAoaXNVbmRlZmluZWQob2JqKSB8fCBvYmogPT09IG51bGwpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRUeXBlKGNvbmRpdGlvbiwgdHlwZSkge1xyXG4gICAgaWYgKCFjb25kaXRpb24pIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodHlwZSA/IGBVbmV4cGVjdGVkIHR5cGUsIGV4cGVjdGVkICcke3R5cGV9J2AgOiAnVW5leHBlY3RlZCB0eXBlJyk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIEFzc2VydHMgdGhhdCB0aGUgYXJndW1lbnQgcGFzc2VkIGluIGlzIG5laXRoZXIgdW5kZWZpbmVkIG5vciBudWxsLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydElzRGVmaW5lZChhcmcpIHtcclxuICAgIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhcmcpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBc3NlcnRpb24gRmFpbGVkOiBhcmd1bWVudCBpcyB1bmRlZmluZWQgb3IgbnVsbCcpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyZztcclxufVxyXG4vKipcclxuICogQHJldHVybnMgd2hldGhlciB0aGUgcHJvdmlkZWQgcGFyYW1ldGVyIGlzIGEgSmF2YVNjcmlwdCBGdW5jdGlvbiBvciBub3QuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihvYmopIHtcclxuICAgIHJldHVybiAodHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uc3RyYWludHMoYXJncywgY29uc3RyYWludHMpIHtcclxuICAgIGNvbnN0IGxlbiA9IE1hdGgubWluKGFyZ3MubGVuZ3RoLCBjb25zdHJhaW50cy5sZW5ndGgpO1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgIHZhbGlkYXRlQ29uc3RyYWludChhcmdzW2ldLCBjb25zdHJhaW50c1tpXSk7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29uc3RyYWludChhcmcsIGNvbnN0cmFpbnQpIHtcclxuICAgIGlmIChpc1N0cmluZyhjb25zdHJhaW50KSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXJnICE9PSBjb25zdHJhaW50KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgYXJndW1lbnQgZG9lcyBub3QgbWF0Y2ggY29uc3RyYWludDogdHlwZW9mICR7Y29uc3RyYWludH1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChpc0Z1bmN0aW9uKGNvbnN0cmFpbnQpKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGFyZyBpbnN0YW5jZW9mIGNvbnN0cmFpbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYXRjaCAoX2EpIHtcclxuICAgICAgICAgICAgLy8gaWdub3JlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghaXNVbmRlZmluZWRPck51bGwoYXJnKSAmJiBhcmcuY29uc3RydWN0b3IgPT09IGNvbnN0cmFpbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY29uc3RyYWludC5sZW5ndGggPT09IDEgJiYgY29uc3RyYWludC5jYWxsKHVuZGVmaW5lZCwgYXJnKSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgYXJndW1lbnQgZG9lcyBub3QgbWF0Y2ggb25lIG9mIHRoZXNlIGNvbnN0cmFpbnRzOiBhcmcgaW5zdGFuY2VvZiBjb25zdHJhaW50LCBhcmcuY29uc3RydWN0b3IgPT09IGNvbnN0cmFpbnQsIG5vciBjb25zdHJhaW50KGFyZykgPT09IHRydWVgKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWxsUHJvcGVydHlOYW1lcyhvYmopIHtcclxuICAgIGxldCByZXMgPSBbXTtcclxuICAgIGxldCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopO1xyXG4gICAgd2hpbGUgKE9iamVjdC5wcm90b3R5cGUgIT09IHByb3RvKSB7XHJcbiAgICAgICAgcmVzID0gcmVzLmNvbmNhdChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90bykpO1xyXG4gICAgICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXM7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEFsbE1ldGhvZE5hbWVzKG9iaikge1xyXG4gICAgY29uc3QgbWV0aG9kcyA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBwcm9wIG9mIGdldEFsbFByb3BlcnR5TmFtZXMob2JqKSkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqW3Byb3BdID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgIG1ldGhvZHMucHVzaChwcm9wKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWV0aG9kcztcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUHJveHlPYmplY3QobWV0aG9kTmFtZXMsIGludm9rZSkge1xyXG4gICAgY29uc3QgY3JlYXRlUHJveHlNZXRob2QgPSAobWV0aG9kKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY29uc3QgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnZva2UobWV0aG9kLCBhcmdzKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuICAgIGxldCByZXN1bHQgPSB7fTtcclxuICAgIGZvciAoY29uc3QgbWV0aG9kTmFtZSBvZiBtZXRob2ROYW1lcykge1xyXG4gICAgICAgIHJlc3VsdFttZXRob2ROYW1lXSA9IGNyZWF0ZVByb3h5TWV0aG9kKG1ldGhvZE5hbWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG4vKipcclxuICogQ29udmVydHMgbnVsbCB0byB1bmRlZmluZWQsIHBhc3NlcyBhbGwgb3RoZXIgdmFsdWVzIHRocm91Z2guXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gd2l0aE51bGxBc1VuZGVmaW5lZCh4KSB7XHJcbiAgICByZXR1cm4geCA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IHg7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydE5ldmVyKHZhbHVlKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VucmVhY2hhYmxlJyk7XHJcbn1cclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5pbXBvcnQgeyB0cmFuc2Zvcm1FcnJvckZvclNlcmlhbGl6YXRpb24gfSBmcm9tICcuLi9lcnJvcnMuanMnO1xyXG5pbXBvcnQgeyBEaXNwb3NhYmxlIH0gZnJvbSAnLi4vbGlmZWN5Y2xlLmpzJztcclxuaW1wb3J0IHsgaXNXZWIgfSBmcm9tICcuLi9wbGF0Zm9ybS5qcyc7XHJcbmltcG9ydCAqIGFzIHR5cGVzIGZyb20gJy4uL3R5cGVzLmpzJztcclxuY29uc3QgSU5JVElBTElaRSA9ICckaW5pdGlhbGl6ZSc7XHJcbmxldCB3ZWJXb3JrZXJXYXJuaW5nTG9nZ2VkID0gZmFsc2U7XHJcbmV4cG9ydCBmdW5jdGlvbiBsb2dPbmNlV2ViV29ya2VyV2FybmluZyhlcnIpIHtcclxuICAgIGlmICghaXNXZWIpIHtcclxuICAgICAgICAvLyBydW5uaW5nIHRlc3RzXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKCF3ZWJXb3JrZXJXYXJuaW5nTG9nZ2VkKSB7XHJcbiAgICAgICAgd2ViV29ya2VyV2FybmluZ0xvZ2dlZCA9IHRydWU7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCdDb3VsZCBub3QgY3JlYXRlIHdlYiB3b3JrZXIocykuIEZhbGxpbmcgYmFjayB0byBsb2FkaW5nIHdlYiB3b3JrZXIgY29kZSBpbiBtYWluIHRocmVhZCwgd2hpY2ggbWlnaHQgY2F1c2UgVUkgZnJlZXplcy4gUGxlYXNlIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L21vbmFjby1lZGl0b3IjZmFxJyk7XHJcbiAgICB9XHJcbiAgICBjb25zb2xlLndhcm4oZXJyLm1lc3NhZ2UpO1xyXG59XHJcbmNsYXNzIFNpbXBsZVdvcmtlclByb3RvY29sIHtcclxuICAgIGNvbnN0cnVjdG9yKGhhbmRsZXIpIHtcclxuICAgICAgICB0aGlzLl93b3JrZXJJZCA9IC0xO1xyXG4gICAgICAgIHRoaXMuX2hhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgICAgIHRoaXMuX2xhc3RTZW50UmVxID0gMDtcclxuICAgICAgICB0aGlzLl9wZW5kaW5nUmVwbGllcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgICB9XHJcbiAgICBzZXRXb3JrZXJJZCh3b3JrZXJJZCkge1xyXG4gICAgICAgIHRoaXMuX3dvcmtlcklkID0gd29ya2VySWQ7XHJcbiAgICB9XHJcbiAgICBzZW5kTWVzc2FnZShtZXRob2QsIGFyZ3MpIHtcclxuICAgICAgICBsZXQgcmVxID0gU3RyaW5nKCsrdGhpcy5fbGFzdFNlbnRSZXEpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdSZXBsaWVzW3JlcV0gPSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlOiByZXNvbHZlLFxyXG4gICAgICAgICAgICAgICAgcmVqZWN0OiByZWplY3RcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgdGhpcy5fc2VuZCh7XHJcbiAgICAgICAgICAgICAgICB2c1dvcmtlcjogdGhpcy5fd29ya2VySWQsXHJcbiAgICAgICAgICAgICAgICByZXE6IHJlcSxcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIGhhbmRsZU1lc3NhZ2UobWVzc2FnZSkge1xyXG4gICAgICAgIGlmICghbWVzc2FnZSB8fCAhbWVzc2FnZS52c1dvcmtlcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl93b3JrZXJJZCAhPT0gLTEgJiYgbWVzc2FnZS52c1dvcmtlciAhPT0gdGhpcy5fd29ya2VySWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpO1xyXG4gICAgfVxyXG4gICAgX2hhbmRsZU1lc3NhZ2UobXNnKSB7XHJcbiAgICAgICAgaWYgKG1zZy5zZXEpIHtcclxuICAgICAgICAgICAgbGV0IHJlcGx5TWVzc2FnZSA9IG1zZztcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl9wZW5kaW5nUmVwbGllc1tyZXBseU1lc3NhZ2Uuc2VxXSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdHb3QgcmVwbHkgdG8gdW5rbm93biBzZXEnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgcmVwbHkgPSB0aGlzLl9wZW5kaW5nUmVwbGllc1tyZXBseU1lc3NhZ2Uuc2VxXTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3BlbmRpbmdSZXBsaWVzW3JlcGx5TWVzc2FnZS5zZXFdO1xyXG4gICAgICAgICAgICBpZiAocmVwbHlNZXNzYWdlLmVycikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGVyciA9IHJlcGx5TWVzc2FnZS5lcnI7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVwbHlNZXNzYWdlLmVyci4kaXNFcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVyciA9IG5ldyBFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVyci5uYW1lID0gcmVwbHlNZXNzYWdlLmVyci5uYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gcmVwbHlNZXNzYWdlLmVyci5tZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVyci5zdGFjayA9IHJlcGx5TWVzc2FnZS5lcnIuc3RhY2s7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXBseS5yZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXBseS5yZXNvbHZlKHJlcGx5TWVzc2FnZS5yZXMpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCByZXF1ZXN0TWVzc2FnZSA9IG1zZztcclxuICAgICAgICBsZXQgcmVxID0gcmVxdWVzdE1lc3NhZ2UucmVxO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLl9oYW5kbGVyLmhhbmRsZU1lc3NhZ2UocmVxdWVzdE1lc3NhZ2UubWV0aG9kLCByZXF1ZXN0TWVzc2FnZS5hcmdzKTtcclxuICAgICAgICByZXN1bHQudGhlbigocikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLl9zZW5kKHtcclxuICAgICAgICAgICAgICAgIHZzV29ya2VyOiB0aGlzLl93b3JrZXJJZCxcclxuICAgICAgICAgICAgICAgIHNlcTogcmVxLFxyXG4gICAgICAgICAgICAgICAgcmVzOiByLFxyXG4gICAgICAgICAgICAgICAgZXJyOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSwgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKGUuZGV0YWlsIGluc3RhbmNlb2YgRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIC8vIExvYWRpbmcgZXJyb3JzIGhhdmUgYSBkZXRhaWwgcHJvcGVydHkgdGhhdCBwb2ludHMgdG8gdGhlIGFjdHVhbCBlcnJvclxyXG4gICAgICAgICAgICAgICAgZS5kZXRhaWwgPSB0cmFuc2Zvcm1FcnJvckZvclNlcmlhbGl6YXRpb24oZS5kZXRhaWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3NlbmQoe1xyXG4gICAgICAgICAgICAgICAgdnNXb3JrZXI6IHRoaXMuX3dvcmtlcklkLFxyXG4gICAgICAgICAgICAgICAgc2VxOiByZXEsXHJcbiAgICAgICAgICAgICAgICByZXM6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIGVycjogdHJhbnNmb3JtRXJyb3JGb3JTZXJpYWxpemF0aW9uKGUpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgX3NlbmQobXNnKSB7XHJcbiAgICAgICAgbGV0IHRyYW5zZmVyID0gW107XHJcbiAgICAgICAgaWYgKG1zZy5yZXEpIHtcclxuICAgICAgICAgICAgY29uc3QgbSA9IG1zZztcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtLmFyZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChtLmFyZ3NbaV0gaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyLnB1c2gobS5hcmdzW2ldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgbSA9IG1zZztcclxuICAgICAgICAgICAgaWYgKG0ucmVzIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcclxuICAgICAgICAgICAgICAgIHRyYW5zZmVyLnB1c2gobS5yZXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2hhbmRsZXIuc2VuZE1lc3NhZ2UobXNnLCB0cmFuc2Zlcik7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIE1haW4gdGhyZWFkIHNpZGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBTaW1wbGVXb3JrZXJDbGllbnQgZXh0ZW5kcyBEaXNwb3NhYmxlIHtcclxuICAgIGNvbnN0cnVjdG9yKHdvcmtlckZhY3RvcnksIG1vZHVsZUlkLCBob3N0KSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICBsZXQgbGF6eVByb3h5UmVqZWN0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl93b3JrZXIgPSB0aGlzLl9yZWdpc3Rlcih3b3JrZXJGYWN0b3J5LmNyZWF0ZSgndnMvYmFzZS9jb21tb24vd29ya2VyL3NpbXBsZVdvcmtlcicsIChtc2cpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5fcHJvdG9jb2wuaGFuZGxlTWVzc2FnZShtc2cpO1xyXG4gICAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICAgICAgLy8gaW4gRmlyZWZveCwgd2ViIHdvcmtlcnMgZmFpbCBsYXppbHkgOihcclxuICAgICAgICAgICAgLy8gd2Ugd2lsbCByZWplY3QgdGhlIHByb3h5XHJcbiAgICAgICAgICAgIGlmIChsYXp5UHJveHlSZWplY3QpIHtcclxuICAgICAgICAgICAgICAgIGxhenlQcm94eVJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHRoaXMuX3Byb3RvY29sID0gbmV3IFNpbXBsZVdvcmtlclByb3RvY29sKHtcclxuICAgICAgICAgICAgc2VuZE1lc3NhZ2U6IChtc2csIHRyYW5zZmVyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl93b3JrZXIucG9zdE1lc3NhZ2UobXNnLCB0cmFuc2Zlcik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGhhbmRsZU1lc3NhZ2U6IChtZXRob2QsIGFyZ3MpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaG9zdFttZXRob2RdICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTWlzc2luZyBtZXRob2QgJyArIG1ldGhvZCArICcgb24gbWFpbiB0aHJlYWQgaG9zdC4nKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoaG9zdFttZXRob2RdLmFwcGx5KGhvc3QsIGFyZ3MpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fcHJvdG9jb2wuc2V0V29ya2VySWQodGhpcy5fd29ya2VyLmdldElkKCkpO1xyXG4gICAgICAgIC8vIEdhdGhlciBsb2FkZXIgY29uZmlndXJhdGlvblxyXG4gICAgICAgIGxldCBsb2FkZXJDb25maWd1cmF0aW9uID0gbnVsbDtcclxuICAgICAgICBpZiAodHlwZW9mIHNlbGYucmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHNlbGYucmVxdWlyZS5nZXRDb25maWcgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIE1vbmFjbyBBTUQgTG9hZGVyXHJcbiAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24gPSBzZWxmLnJlcXVpcmUuZ2V0Q29uZmlnKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBzZWxmLnJlcXVpcmVqcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb25maWd1cmF0aW9uIGZyb20gcmVxdWlyZWpzXHJcbiAgICAgICAgICAgIGxvYWRlckNvbmZpZ3VyYXRpb24gPSBzZWxmLnJlcXVpcmVqcy5zLmNvbnRleHRzLl8uY29uZmlnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBob3N0TWV0aG9kcyA9IHR5cGVzLmdldEFsbE1ldGhvZE5hbWVzKGhvc3QpO1xyXG4gICAgICAgIC8vIFNlbmQgaW5pdGlhbGl6ZSBtZXNzYWdlXHJcbiAgICAgICAgdGhpcy5fb25Nb2R1bGVMb2FkZWQgPSB0aGlzLl9wcm90b2NvbC5zZW5kTWVzc2FnZShJTklUSUFMSVpFLCBbXHJcbiAgICAgICAgICAgIHRoaXMuX3dvcmtlci5nZXRJZCgpLFxyXG4gICAgICAgICAgICBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGxvYWRlckNvbmZpZ3VyYXRpb24pKSxcclxuICAgICAgICAgICAgbW9kdWxlSWQsXHJcbiAgICAgICAgICAgIGhvc3RNZXRob2RzLFxyXG4gICAgICAgIF0pO1xyXG4gICAgICAgIC8vIENyZWF0ZSBwcm94eSB0byBsb2FkZWQgY29kZVxyXG4gICAgICAgIGNvbnN0IHByb3h5TWV0aG9kUmVxdWVzdCA9IChtZXRob2QsIGFyZ3MpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlcXVlc3QobWV0aG9kLCBhcmdzKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuX2xhenlQcm94eSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgbGF6eVByb3h5UmVqZWN0ID0gcmVqZWN0O1xyXG4gICAgICAgICAgICB0aGlzLl9vbk1vZHVsZUxvYWRlZC50aGVuKChhdmFpbGFibGVNZXRob2RzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHR5cGVzLmNyZWF0ZVByb3h5T2JqZWN0KGF2YWlsYWJsZU1ldGhvZHMsIHByb3h5TWV0aG9kUmVxdWVzdCkpO1xyXG4gICAgICAgICAgICB9LCAoZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fb25FcnJvcignV29ya2VyIGZhaWxlZCB0byBsb2FkICcgKyBtb2R1bGVJZCwgZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgZ2V0UHJveHlPYmplY3QoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xhenlQcm94eTtcclxuICAgIH1cclxuICAgIF9yZXF1ZXN0KG1ldGhvZCwgYXJncykge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX29uTW9kdWxlTG9hZGVkLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcHJvdG9jb2wuc2VuZE1lc3NhZ2UobWV0aG9kLCBhcmdzKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XHJcbiAgICAgICAgICAgIH0sIHJlamVjdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBfb25FcnJvcihtZXNzYWdlLCBlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgY29uc29sZS5pbmZvKGVycm9yKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogV29ya2VyIHNpZGVcclxuICovXHJcbmV4cG9ydCBjbGFzcyBTaW1wbGVXb3JrZXJTZXJ2ZXIge1xyXG4gICAgY29uc3RydWN0b3IocG9zdE1lc3NhZ2UsIHJlcXVlc3RIYW5kbGVyRmFjdG9yeSkge1xyXG4gICAgICAgIHRoaXMuX3JlcXVlc3RIYW5kbGVyRmFjdG9yeSA9IHJlcXVlc3RIYW5kbGVyRmFjdG9yeTtcclxuICAgICAgICB0aGlzLl9yZXF1ZXN0SGFuZGxlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fcHJvdG9jb2wgPSBuZXcgU2ltcGxlV29ya2VyUHJvdG9jb2woe1xyXG4gICAgICAgICAgICBzZW5kTWVzc2FnZTogKG1zZywgdHJhbnNmZXIpID0+IHtcclxuICAgICAgICAgICAgICAgIHBvc3RNZXNzYWdlKG1zZywgdHJhbnNmZXIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBoYW5kbGVNZXNzYWdlOiAobWV0aG9kLCBhcmdzKSA9PiB0aGlzLl9oYW5kbGVNZXNzYWdlKG1ldGhvZCwgYXJncylcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIG9ubWVzc2FnZShtc2cpIHtcclxuICAgICAgICB0aGlzLl9wcm90b2NvbC5oYW5kbGVNZXNzYWdlKG1zZyk7XHJcbiAgICB9XHJcbiAgICBfaGFuZGxlTWVzc2FnZShtZXRob2QsIGFyZ3MpIHtcclxuICAgICAgICBpZiAobWV0aG9kID09PSBJTklUSUFMSVpFKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmluaXRpYWxpemUoYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5fcmVxdWVzdEhhbmRsZXIgfHwgdHlwZW9mIHRoaXMuX3JlcXVlc3RIYW5kbGVyW21ldGhvZF0gIT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTWlzc2luZyByZXF1ZXN0SGFuZGxlciBvciBtZXRob2Q6ICcgKyBtZXRob2QpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9yZXF1ZXN0SGFuZGxlclttZXRob2RdLmFwcGx5KHRoaXMuX3JlcXVlc3RIYW5kbGVyLCBhcmdzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpbml0aWFsaXplKHdvcmtlcklkLCBsb2FkZXJDb25maWcsIG1vZHVsZUlkLCBob3N0TWV0aG9kcykge1xyXG4gICAgICAgIHRoaXMuX3Byb3RvY29sLnNldFdvcmtlcklkKHdvcmtlcklkKTtcclxuICAgICAgICBjb25zdCBwcm94eU1ldGhvZFJlcXVlc3QgPSAobWV0aG9kLCBhcmdzKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wcm90b2NvbC5zZW5kTWVzc2FnZShtZXRob2QsIGFyZ3MpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgY29uc3QgaG9zdFByb3h5ID0gdHlwZXMuY3JlYXRlUHJveHlPYmplY3QoaG9zdE1ldGhvZHMsIHByb3h5TWV0aG9kUmVxdWVzdCk7XHJcbiAgICAgICAgaWYgKHRoaXMuX3JlcXVlc3RIYW5kbGVyRmFjdG9yeSkge1xyXG4gICAgICAgICAgICAvLyBzdGF0aWMgcmVxdWVzdCBoYW5kbGVyXHJcbiAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RIYW5kbGVyID0gdGhpcy5fcmVxdWVzdEhhbmRsZXJGYWN0b3J5KGhvc3RQcm94eSk7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHlwZXMuZ2V0QWxsTWV0aG9kTmFtZXModGhpcy5fcmVxdWVzdEhhbmRsZXIpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGxvYWRlckNvbmZpZykge1xyXG4gICAgICAgICAgICAvLyBSZW1vdmUgJ2Jhc2VVcmwnLCBoYW5kbGluZyBpdCBpcyBiZXlvbmQgc2NvcGUgZm9yIG5vd1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvYWRlckNvbmZpZy5iYXNlVXJsICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvYWRlckNvbmZpZ1snYmFzZVVybCddO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbG9hZGVyQ29uZmlnLnBhdGhzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsb2FkZXJDb25maWcucGF0aHMudnMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGxvYWRlckNvbmZpZy5wYXRoc1sndnMnXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxvYWRlckNvbmZpZy50cnVzdGVkVHlwZXNQb2xpY3kgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgdXNlLCBpdCBoYXMgYmVlbiBkZXN0cm95ZWQgZHVyaW5nIHNlcmlhbGl6ZVxyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGxvYWRlckNvbmZpZ1sndHJ1c3RlZFR5cGVzUG9saWN5J107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gU2luY2UgdGhpcyBpcyBpbiBhIHdlYiB3b3JrZXIsIGVuYWJsZSBjYXRjaGluZyBlcnJvcnNcclxuICAgICAgICAgICAgbG9hZGVyQ29uZmlnLmNhdGNoRXJyb3IgPSB0cnVlO1xyXG4gICAgICAgICAgICBzZWxmLnJlcXVpcmUuY29uZmlnKGxvYWRlckNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIC8vIFVzZSB0aGUgZ2xvYmFsIHJlcXVpcmUgdG8gYmUgc3VyZSB0byBnZXQgdGhlIGdsb2JhbCBjb25maWdcclxuICAgICAgICAgICAgc2VsZi5yZXF1aXJlKFttb2R1bGVJZF0sIChtb2R1bGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3JlcXVlc3RIYW5kbGVyID0gbW9kdWxlLmNyZWF0ZShob3N0UHJveHkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9yZXF1ZXN0SGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYE5vIFJlcXVlc3RIYW5kbGVyIWApKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHR5cGVzLmdldEFsbE1ldGhvZE5hbWVzKHRoaXMuX3JlcXVlc3RIYW5kbGVyKSk7XHJcbiAgICAgICAgICAgIH0sIHJlamVjdCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIENhbGxlZCBvbiB0aGUgd29ya2VyIHNpZGVcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUocG9zdE1lc3NhZ2UpIHtcclxuICAgIHJldHVybiBuZXcgU2ltcGxlV29ya2VyU2VydmVyKHBvc3RNZXNzYWdlLCBudWxsKTtcclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGluZm9ybWF0aW9uIGFib3V0IGEgc3BlY2lmaWMgZGlmZmVyZW5jZSBiZXR3ZWVuIHR3byBzZXF1ZW5jZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRGlmZkNoYW5nZSB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgRGlmZkNoYW5nZSB3aXRoIHRoZSBnaXZlbiBzZXF1ZW5jZSBpbmZvcm1hdGlvblxyXG4gICAgICogYW5kIGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9yaWdpbmFsU3RhcnQsIG9yaWdpbmFsTGVuZ3RoLCBtb2RpZmllZFN0YXJ0LCBtb2RpZmllZExlbmd0aCkge1xyXG4gICAgICAgIC8vRGVidWcuQXNzZXJ0KG9yaWdpbmFsTGVuZ3RoID4gMCB8fCBtb2RpZmllZExlbmd0aCA+IDAsIFwib3JpZ2luYWxMZW5ndGggYW5kIG1vZGlmaWVkTGVuZ3RoIGNhbm5vdCBib3RoIGJlIDw9IDBcIik7XHJcbiAgICAgICAgdGhpcy5vcmlnaW5hbFN0YXJ0ID0gb3JpZ2luYWxTdGFydDtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsTGVuZ3RoID0gb3JpZ2luYWxMZW5ndGg7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZFN0YXJ0ID0gbW9kaWZpZWRTdGFydDtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkTGVuZ3RoID0gbW9kaWZpZWRMZW5ndGg7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBlbmQgcG9pbnQgKGV4Y2x1c2l2ZSkgb2YgdGhlIGNoYW5nZSBpbiB0aGUgb3JpZ2luYWwgc2VxdWVuY2UuXHJcbiAgICAgKi9cclxuICAgIGdldE9yaWdpbmFsRW5kKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9yaWdpbmFsU3RhcnQgKyB0aGlzLm9yaWdpbmFsTGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZW5kIHBvaW50IChleGNsdXNpdmUpIG9mIHRoZSBjaGFuZ2UgaW4gdGhlIG1vZGlmaWVkIHNlcXVlbmNlLlxyXG4gICAgICovXHJcbiAgICBnZXRNb2RpZmllZEVuZCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5tb2RpZmllZFN0YXJ0ICsgdGhpcy5tb2RpZmllZExlbmd0aDtcclxuICAgIH1cclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0ZhbHN5T3JXaGl0ZXNwYWNlKHN0cikge1xyXG4gICAgaWYgKCFzdHIgfHwgdHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBzdHIudHJpbSgpLmxlbmd0aCA9PT0gMDtcclxufVxyXG5jb25zdCBfZm9ybWF0UmVnZXhwID0gL3soXFxkKyl9L2c7XHJcbi8qKlxyXG4gKiBIZWxwZXIgdG8gcHJvZHVjZSBhIHN0cmluZyB3aXRoIGEgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cy4gSW5zZXJ0IHZhcmlhYmxlIHNlZ21lbnRzXHJcbiAqIGludG8gdGhlIHN0cmluZyB1c2luZyB0aGUge259IG5vdGF0aW9uIHdoZXJlIE4gaXMgdGhlIGluZGV4IG9mIHRoZSBhcmd1bWVudCBmb2xsb3dpbmcgdGhlIHN0cmluZy5cclxuICogQHBhcmFtIHZhbHVlIHN0cmluZyB0byB3aGljaCBmb3JtYXR0aW5nIGlzIGFwcGxpZWRcclxuICogQHBhcmFtIGFyZ3MgcmVwbGFjZW1lbnRzIGZvciB7bn0tZW50cmllc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdCh2YWx1ZSwgLi4uYXJncykge1xyXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoX2Zvcm1hdFJlZ2V4cCwgZnVuY3Rpb24gKG1hdGNoLCBncm91cCkge1xyXG4gICAgICAgIGNvbnN0IGlkeCA9IHBhcnNlSW50KGdyb3VwLCAxMCk7XHJcbiAgICAgICAgcmV0dXJuIGlzTmFOKGlkeCkgfHwgaWR4IDwgMCB8fCBpZHggPj0gYXJncy5sZW5ndGggP1xyXG4gICAgICAgICAgICBtYXRjaCA6XHJcbiAgICAgICAgICAgIGFyZ3NbaWR4XTtcclxuICAgIH0pO1xyXG59XHJcbi8qKlxyXG4gKiBDb252ZXJ0cyBIVE1MIGNoYXJhY3RlcnMgaW5zaWRlIHRoZSBzdHJpbmcgdG8gdXNlIGVudGl0aWVzIGluc3RlYWQuIE1ha2VzIHRoZSBzdHJpbmcgc2FmZSBmcm9tXHJcbiAqIGJlaW5nIHVzZWQgZS5nLiBpbiBIVE1MRWxlbWVudC5pbm5lckhUTUwuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlKGh0bWwpIHtcclxuICAgIHJldHVybiBodG1sLnJlcGxhY2UoL1s8PiZdL2csIGZ1bmN0aW9uIChtYXRjaCkge1xyXG4gICAgICAgIHN3aXRjaCAobWF0Y2gpIHtcclxuICAgICAgICAgICAgY2FzZSAnPCc6IHJldHVybiAnJmx0Oyc7XHJcbiAgICAgICAgICAgIGNhc2UgJz4nOiByZXR1cm4gJyZndDsnO1xyXG4gICAgICAgICAgICBjYXNlICcmJzogcmV0dXJuICcmYW1wOyc7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IHJldHVybiBtYXRjaDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG4vKipcclxuICogRXNjYXBlcyByZWd1bGFyIGV4cHJlc3Npb24gY2hhcmFjdGVycyBpbiBhIGdpdmVuIHN0cmluZ1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cENoYXJhY3RlcnModmFsdWUpIHtcclxuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bXFxcXFxce1xcfVxcKlxcK1xcP1xcfFxcXlxcJFxcLlxcW1xcXVxcKFxcKV0vZywgJ1xcXFwkJicpO1xyXG59XHJcbi8qKlxyXG4gKiBSZW1vdmVzIGFsbCBvY2N1cnJlbmNlcyBvZiBuZWVkbGUgZnJvbSB0aGUgYmVnaW5uaW5nIGFuZCBlbmQgb2YgaGF5c3RhY2suXHJcbiAqIEBwYXJhbSBoYXlzdGFjayBzdHJpbmcgdG8gdHJpbVxyXG4gKiBAcGFyYW0gbmVlZGxlIHRoZSB0aGluZyB0byB0cmltIChkZWZhdWx0IGlzIGEgYmxhbmspXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gdHJpbShoYXlzdGFjaywgbmVlZGxlID0gJyAnKSB7XHJcbiAgICBjb25zdCB0cmltbWVkID0gbHRyaW0oaGF5c3RhY2ssIG5lZWRsZSk7XHJcbiAgICByZXR1cm4gcnRyaW0odHJpbW1lZCwgbmVlZGxlKTtcclxufVxyXG4vKipcclxuICogUmVtb3ZlcyBhbGwgb2NjdXJyZW5jZXMgb2YgbmVlZGxlIGZyb20gdGhlIGJlZ2lubmluZyBvZiBoYXlzdGFjay5cclxuICogQHBhcmFtIGhheXN0YWNrIHN0cmluZyB0byB0cmltXHJcbiAqIEBwYXJhbSBuZWVkbGUgdGhlIHRoaW5nIHRvIHRyaW1cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsdHJpbShoYXlzdGFjaywgbmVlZGxlKSB7XHJcbiAgICBpZiAoIWhheXN0YWNrIHx8ICFuZWVkbGUpIHtcclxuICAgICAgICByZXR1cm4gaGF5c3RhY2s7XHJcbiAgICB9XHJcbiAgICBjb25zdCBuZWVkbGVMZW4gPSBuZWVkbGUubGVuZ3RoO1xyXG4gICAgaWYgKG5lZWRsZUxlbiA9PT0gMCB8fCBoYXlzdGFjay5sZW5ndGggPT09IDApIHtcclxuICAgICAgICByZXR1cm4gaGF5c3RhY2s7XHJcbiAgICB9XHJcbiAgICBsZXQgb2Zmc2V0ID0gMDtcclxuICAgIHdoaWxlIChoYXlzdGFjay5pbmRleE9mKG5lZWRsZSwgb2Zmc2V0KSA9PT0gb2Zmc2V0KSB7XHJcbiAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0ICsgbmVlZGxlTGVuO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGhheXN0YWNrLnN1YnN0cmluZyhvZmZzZXQpO1xyXG59XHJcbi8qKlxyXG4gKiBSZW1vdmVzIGFsbCBvY2N1cnJlbmNlcyBvZiBuZWVkbGUgZnJvbSB0aGUgZW5kIG9mIGhheXN0YWNrLlxyXG4gKiBAcGFyYW0gaGF5c3RhY2sgc3RyaW5nIHRvIHRyaW1cclxuICogQHBhcmFtIG5lZWRsZSB0aGUgdGhpbmcgdG8gdHJpbVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJ0cmltKGhheXN0YWNrLCBuZWVkbGUpIHtcclxuICAgIGlmICghaGF5c3RhY2sgfHwgIW5lZWRsZSkge1xyXG4gICAgICAgIHJldHVybiBoYXlzdGFjaztcclxuICAgIH1cclxuICAgIGNvbnN0IG5lZWRsZUxlbiA9IG5lZWRsZS5sZW5ndGgsIGhheXN0YWNrTGVuID0gaGF5c3RhY2subGVuZ3RoO1xyXG4gICAgaWYgKG5lZWRsZUxlbiA9PT0gMCB8fCBoYXlzdGFja0xlbiA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiBoYXlzdGFjaztcclxuICAgIH1cclxuICAgIGxldCBvZmZzZXQgPSBoYXlzdGFja0xlbiwgaWR4ID0gLTE7XHJcbiAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgIGlkeCA9IGhheXN0YWNrLmxhc3RJbmRleE9mKG5lZWRsZSwgb2Zmc2V0IC0gMSk7XHJcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEgfHwgaWR4ICsgbmVlZGxlTGVuICE9PSBvZmZzZXQpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpZHggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvZmZzZXQgPSBpZHg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaGF5c3RhY2suc3Vic3RyaW5nKDAsIG9mZnNldCk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRTaW1wbGUyUmVnRXhwUGF0dGVybihwYXR0ZXJuKSB7XHJcbiAgICByZXR1cm4gcGF0dGVybi5yZXBsYWNlKC9bXFwtXFxcXFxce1xcfVxcK1xcP1xcfFxcXlxcJFxcLlxcLFxcW1xcXVxcKFxcKVxcI1xcc10vZywgJ1xcXFwkJicpLnJlcGxhY2UoL1tcXCpdL2csICcuKicpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpcFdpbGRjYXJkcyhwYXR0ZXJuKSB7XHJcbiAgICByZXR1cm4gcGF0dGVybi5yZXBsYWNlKC9cXCovZywgJycpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZWdFeHAoc2VhcmNoU3RyaW5nLCBpc1JlZ2V4LCBvcHRpb25zID0ge30pIHtcclxuICAgIGlmICghc2VhcmNoU3RyaW5nKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY3JlYXRlIHJlZ2V4IGZyb20gZW1wdHkgc3RyaW5nJyk7XHJcbiAgICB9XHJcbiAgICBpZiAoIWlzUmVnZXgpIHtcclxuICAgICAgICBzZWFyY2hTdHJpbmcgPSBlc2NhcGVSZWdFeHBDaGFyYWN0ZXJzKHNlYXJjaFN0cmluZyk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy53aG9sZVdvcmQpIHtcclxuICAgICAgICBpZiAoIS9cXEIvLnRlc3Qoc2VhcmNoU3RyaW5nLmNoYXJBdCgwKSkpIHtcclxuICAgICAgICAgICAgc2VhcmNoU3RyaW5nID0gJ1xcXFxiJyArIHNlYXJjaFN0cmluZztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEvXFxCLy50ZXN0KHNlYXJjaFN0cmluZy5jaGFyQXQoc2VhcmNoU3RyaW5nLmxlbmd0aCAtIDEpKSkge1xyXG4gICAgICAgICAgICBzZWFyY2hTdHJpbmcgPSBzZWFyY2hTdHJpbmcgKyAnXFxcXGInO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGxldCBtb2RpZmllcnMgPSAnJztcclxuICAgIGlmIChvcHRpb25zLmdsb2JhbCkge1xyXG4gICAgICAgIG1vZGlmaWVycyArPSAnZyc7XHJcbiAgICB9XHJcbiAgICBpZiAoIW9wdGlvbnMubWF0Y2hDYXNlKSB7XHJcbiAgICAgICAgbW9kaWZpZXJzICs9ICdpJztcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLm11bHRpbGluZSkge1xyXG4gICAgICAgIG1vZGlmaWVycyArPSAnbSc7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy51bmljb2RlKSB7XHJcbiAgICAgICAgbW9kaWZpZXJzICs9ICd1JztcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgUmVnRXhwKHNlYXJjaFN0cmluZywgbW9kaWZpZXJzKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcmVnRXhwTGVhZHNUb0VuZGxlc3NMb29wKHJlZ2V4cCkge1xyXG4gICAgLy8gRXhpdCBlYXJseSBpZiBpdCdzIG9uZSBvZiB0aGVzZSBzcGVjaWFsIGNhc2VzIHdoaWNoIGFyZSBtZWFudCB0byBtYXRjaFxyXG4gICAgLy8gYWdhaW5zdCBhbiBlbXB0eSBzdHJpbmdcclxuICAgIGlmIChyZWdleHAuc291cmNlID09PSAnXicgfHwgcmVnZXhwLnNvdXJjZSA9PT0gJ14kJyB8fCByZWdleHAuc291cmNlID09PSAnJCcgfHwgcmVnZXhwLnNvdXJjZSA9PT0gJ15cXFxccyokJykge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIC8vIFdlIGNoZWNrIGFnYWluc3QgYW4gZW1wdHkgc3RyaW5nLiBJZiB0aGUgcmVndWxhciBleHByZXNzaW9uIGRvZXNuJ3QgYWR2YW5jZVxyXG4gICAgLy8gKGUuZy4gZW5kcyBpbiBhbiBlbmRsZXNzIGxvb3ApIGl0IHdpbGwgbWF0Y2ggYW4gZW1wdHkgc3RyaW5nLlxyXG4gICAgY29uc3QgbWF0Y2ggPSByZWdleHAuZXhlYygnJyk7XHJcbiAgICByZXR1cm4gISEobWF0Y2ggJiYgcmVnZXhwLmxhc3RJbmRleCA9PT0gMCk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHJlZ0V4cEZsYWdzKHJlZ2V4cCkge1xyXG4gICAgcmV0dXJuIChyZWdleHAuZ2xvYmFsID8gJ2cnIDogJycpXHJcbiAgICAgICAgKyAocmVnZXhwLmlnbm9yZUNhc2UgPyAnaScgOiAnJylcclxuICAgICAgICArIChyZWdleHAubXVsdGlsaW5lID8gJ20nIDogJycpXHJcbiAgICAgICAgKyAocmVnZXhwIC8qIHN0YW5kYWxvbmUgZWRpdG9yIGNvbXBpbGF0aW9uICovLnVuaWNvZGUgPyAndScgOiAnJyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0TGluZXMoc3RyKSB7XHJcbiAgICByZXR1cm4gc3RyLnNwbGl0KC9cXHJcXG58XFxyfFxcbi8pO1xyXG59XHJcbi8qKlxyXG4gKiBSZXR1cm5zIGZpcnN0IGluZGV4IG9mIHRoZSBzdHJpbmcgdGhhdCBpcyBub3Qgd2hpdGVzcGFjZS5cclxuICogSWYgc3RyaW5nIGlzIGVtcHR5IG9yIGNvbnRhaW5zIG9ubHkgd2hpdGVzcGFjZXMsIHJldHVybnMgLTFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBmaXJzdE5vbldoaXRlc3BhY2VJbmRleChzdHIpIHtcclxuICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBjb25zdCBjaENvZGUgPSBzdHIuY2hhckNvZGVBdChpKTtcclxuICAgICAgICBpZiAoY2hDb2RlICE9PSAzMiAvKiBTcGFjZSAqLyAmJiBjaENvZGUgIT09IDkgLyogVGFiICovKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufVxyXG4vKipcclxuICogUmV0dXJucyB0aGUgbGVhZGluZyB3aGl0ZXNwYWNlIG9mIHRoZSBzdHJpbmcuXHJcbiAqIElmIHRoZSBzdHJpbmcgY29udGFpbnMgb25seSB3aGl0ZXNwYWNlcywgcmV0dXJucyBlbnRpcmUgc3RyaW5nXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGVhZGluZ1doaXRlc3BhY2Uoc3RyLCBzdGFydCA9IDAsIGVuZCA9IHN0ci5sZW5ndGgpIHtcclxuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgY2hDb2RlID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgaWYgKGNoQ29kZSAhPT0gMzIgLyogU3BhY2UgKi8gJiYgY2hDb2RlICE9PSA5IC8qIFRhYiAqLykge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyLnN1YnN0cmluZyhzdGFydCwgaSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0ci5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XHJcbn1cclxuLyoqXHJcbiAqIFJldHVybnMgbGFzdCBpbmRleCBvZiB0aGUgc3RyaW5nIHRoYXQgaXMgbm90IHdoaXRlc3BhY2UuXHJcbiAqIElmIHN0cmluZyBpcyBlbXB0eSBvciBjb250YWlucyBvbmx5IHdoaXRlc3BhY2VzLCByZXR1cm5zIC0xXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGFzdE5vbldoaXRlc3BhY2VJbmRleChzdHIsIHN0YXJ0SW5kZXggPSBzdHIubGVuZ3RoIC0gMSkge1xyXG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0SW5kZXg7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgY29uc3QgY2hDb2RlID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgaWYgKGNoQ29kZSAhPT0gMzIgLyogU3BhY2UgKi8gJiYgY2hDb2RlICE9PSA5IC8qIFRhYiAqLykge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gLTE7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xyXG4gICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYSA+IGIpIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlU3Vic3RyaW5nKGEsIGIsIGFTdGFydCA9IDAsIGFFbmQgPSBhLmxlbmd0aCwgYlN0YXJ0ID0gMCwgYkVuZCA9IGIubGVuZ3RoKSB7XHJcbiAgICBmb3IgKDsgYVN0YXJ0IDwgYUVuZCAmJiBiU3RhcnQgPCBiRW5kOyBhU3RhcnQrKywgYlN0YXJ0KyspIHtcclxuICAgICAgICBsZXQgY29kZUEgPSBhLmNoYXJDb2RlQXQoYVN0YXJ0KTtcclxuICAgICAgICBsZXQgY29kZUIgPSBiLmNoYXJDb2RlQXQoYlN0YXJ0KTtcclxuICAgICAgICBpZiAoY29kZUEgPCBjb2RlQikge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGNvZGVBID4gY29kZUIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3QgYUxlbiA9IGFFbmQgLSBhU3RhcnQ7XHJcbiAgICBjb25zdCBiTGVuID0gYkVuZCAtIGJTdGFydDtcclxuICAgIGlmIChhTGVuIDwgYkxlbikge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGFMZW4gPiBiTGVuKSB7XHJcbiAgICAgICAgcmV0dXJuIDE7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gMDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZUlnbm9yZUNhc2UoYSwgYikge1xyXG4gICAgcmV0dXJuIGNvbXBhcmVTdWJzdHJpbmdJZ25vcmVDYXNlKGEsIGIsIDAsIGEubGVuZ3RoLCAwLCBiLmxlbmd0aCk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVTdWJzdHJpbmdJZ25vcmVDYXNlKGEsIGIsIGFTdGFydCA9IDAsIGFFbmQgPSBhLmxlbmd0aCwgYlN0YXJ0ID0gMCwgYkVuZCA9IGIubGVuZ3RoKSB7XHJcbiAgICBmb3IgKDsgYVN0YXJ0IDwgYUVuZCAmJiBiU3RhcnQgPCBiRW5kOyBhU3RhcnQrKywgYlN0YXJ0KyspIHtcclxuICAgICAgICBsZXQgY29kZUEgPSBhLmNoYXJDb2RlQXQoYVN0YXJ0KTtcclxuICAgICAgICBsZXQgY29kZUIgPSBiLmNoYXJDb2RlQXQoYlN0YXJ0KTtcclxuICAgICAgICBpZiAoY29kZUEgPT09IGNvZGVCKSB7XHJcbiAgICAgICAgICAgIC8vIGVxdWFsXHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkaWZmID0gY29kZUEgLSBjb2RlQjtcclxuICAgICAgICBpZiAoZGlmZiA9PT0gMzIgJiYgaXNVcHBlckFzY2lpTGV0dGVyKGNvZGVCKSkgeyAvL2NvZGVCID1bNjUtOTBdICYmIGNvZGVBID1bOTctMTIyXVxyXG4gICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZGlmZiA9PT0gLTMyICYmIGlzVXBwZXJBc2NpaUxldHRlcihjb2RlQSkpIHsgLy9jb2RlQiA9Wzk3LTEyMl0gJiYgY29kZUEgPVs2NS05MF1cclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0xvd2VyQXNjaWlMZXR0ZXIoY29kZUEpICYmIGlzTG93ZXJBc2NpaUxldHRlcihjb2RlQikpIHtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgcmV0dXJuIGRpZmY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZVN1YnN0cmluZyhhLnRvTG93ZXJDYXNlKCksIGIudG9Mb3dlckNhc2UoKSwgYVN0YXJ0LCBhRW5kLCBiU3RhcnQsIGJFbmQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNvbnN0IGFMZW4gPSBhRW5kIC0gYVN0YXJ0O1xyXG4gICAgY29uc3QgYkxlbiA9IGJFbmQgLSBiU3RhcnQ7XHJcbiAgICBpZiAoYUxlbiA8IGJMZW4pIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmIChhTGVuID4gYkxlbikge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIDA7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlzTG93ZXJBc2NpaUxldHRlcihjb2RlKSB7XHJcbiAgICByZXR1cm4gY29kZSA+PSA5NyAvKiBhICovICYmIGNvZGUgPD0gMTIyIC8qIHogKi87XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlzVXBwZXJBc2NpaUxldHRlcihjb2RlKSB7XHJcbiAgICByZXR1cm4gY29kZSA+PSA2NSAvKiBBICovICYmIGNvZGUgPD0gOTAgLyogWiAqLztcclxufVxyXG5mdW5jdGlvbiBpc0FzY2lpTGV0dGVyKGNvZGUpIHtcclxuICAgIHJldHVybiBpc0xvd2VyQXNjaWlMZXR0ZXIoY29kZSkgfHwgaXNVcHBlckFzY2lpTGV0dGVyKGNvZGUpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHNJZ25vcmVDYXNlKGEsIGIpIHtcclxuICAgIHJldHVybiBhLmxlbmd0aCA9PT0gYi5sZW5ndGggJiYgZG9FcXVhbHNJZ25vcmVDYXNlKGEsIGIpO1xyXG59XHJcbmZ1bmN0aW9uIGRvRXF1YWxzSWdub3JlQ2FzZShhLCBiLCBzdG9wQXQgPSBhLmxlbmd0aCkge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdG9wQXQ7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGNvZGVBID0gYS5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgIGNvbnN0IGNvZGVCID0gYi5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgIGlmIChjb2RlQSA9PT0gY29kZUIpIHtcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGEteiBBLVpcclxuICAgICAgICBpZiAoaXNBc2NpaUxldHRlcihjb2RlQSkgJiYgaXNBc2NpaUxldHRlcihjb2RlQikpIHtcclxuICAgICAgICAgICAgY29uc3QgZGlmZiA9IE1hdGguYWJzKGNvZGVBIC0gY29kZUIpO1xyXG4gICAgICAgICAgICBpZiAoZGlmZiAhPT0gMCAmJiBkaWZmICE9PSAzMikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFueSBvdGhlciBjaGFyY29kZVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlQSkudG9Mb3dlckNhc2UoKSAhPT0gU3RyaW5nLmZyb21DaGFyQ29kZShjb2RlQikudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0c1dpdGhJZ25vcmVDYXNlKHN0ciwgY2FuZGlkYXRlKSB7XHJcbiAgICBjb25zdCBjYW5kaWRhdGVMZW5ndGggPSBjYW5kaWRhdGUubGVuZ3RoO1xyXG4gICAgaWYgKGNhbmRpZGF0ZS5sZW5ndGggPiBzdHIubGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRvRXF1YWxzSWdub3JlQ2FzZShzdHIsIGNhbmRpZGF0ZSwgY2FuZGlkYXRlTGVuZ3RoKTtcclxufVxyXG4vKipcclxuICogQHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgY29tbW9uIHByZWZpeCBvZiB0aGUgdHdvIHN0cmluZ3MuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29tbW9uUHJlZml4TGVuZ3RoKGEsIGIpIHtcclxuICAgIGxldCBpLCBsZW4gPSBNYXRoLm1pbihhLmxlbmd0aCwgYi5sZW5ndGgpO1xyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGEuY2hhckNvZGVBdChpKSAhPT0gYi5jaGFyQ29kZUF0KGkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBsZW47XHJcbn1cclxuLyoqXHJcbiAqIEByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIGNvbW1vbiBzdWZmaXggb2YgdGhlIHR3byBzdHJpbmdzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbW1vblN1ZmZpeExlbmd0aChhLCBiKSB7XHJcbiAgICBsZXQgaSwgbGVuID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTtcclxuICAgIGNvbnN0IGFMYXN0SW5kZXggPSBhLmxlbmd0aCAtIDE7XHJcbiAgICBjb25zdCBiTGFzdEluZGV4ID0gYi5sZW5ndGggLSAxO1xyXG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGEuY2hhckNvZGVBdChhTGFzdEluZGV4IC0gaSkgIT09IGIuY2hhckNvZGVBdChiTGFzdEluZGV4IC0gaSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGxlbjtcclxufVxyXG4vKipcclxuICogU2VlIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvU3Vycm9nYXRlX3BhaXJcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0hpZ2hTdXJyb2dhdGUoY2hhckNvZGUpIHtcclxuICAgIHJldHVybiAoMHhEODAwIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IDB4REJGRik7XHJcbn1cclxuLyoqXHJcbiAqIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N1cnJvZ2F0ZV9wYWlyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gaXNMb3dTdXJyb2dhdGUoY2hhckNvZGUpIHtcclxuICAgIHJldHVybiAoMHhEQzAwIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IDB4REZGRik7XHJcbn1cclxuLyoqXHJcbiAqIFNlZSBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1N1cnJvZ2F0ZV9wYWlyXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUNvZGVQb2ludChoaWdoU3Vycm9nYXRlLCBsb3dTdXJyb2dhdGUpIHtcclxuICAgIHJldHVybiAoKGhpZ2hTdXJyb2dhdGUgLSAweEQ4MDApIDw8IDEwKSArIChsb3dTdXJyb2dhdGUgLSAweERDMDApICsgMHgxMDAwMDtcclxufVxyXG4vKipcclxuICogZ2V0IHRoZSBjb2RlIHBvaW50IHRoYXQgYmVnaW5zIGF0IG9mZnNldCBgb2Zmc2V0YFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldE5leHRDb2RlUG9pbnQoc3RyLCBsZW4sIG9mZnNldCkge1xyXG4gICAgY29uc3QgY2hhckNvZGUgPSBzdHIuY2hhckNvZGVBdChvZmZzZXQpO1xyXG4gICAgaWYgKGlzSGlnaFN1cnJvZ2F0ZShjaGFyQ29kZSkgJiYgb2Zmc2V0ICsgMSA8IGxlbikge1xyXG4gICAgICAgIGNvbnN0IG5leHRDaGFyQ29kZSA9IHN0ci5jaGFyQ29kZUF0KG9mZnNldCArIDEpO1xyXG4gICAgICAgIGlmIChpc0xvd1N1cnJvZ2F0ZShuZXh0Q2hhckNvZGUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wdXRlQ29kZVBvaW50KGNoYXJDb2RlLCBuZXh0Q2hhckNvZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjaGFyQ29kZTtcclxufVxyXG4vKipcclxuICogZ2V0IHRoZSBjb2RlIHBvaW50IHRoYXQgZW5kcyByaWdodCBiZWZvcmUgb2Zmc2V0IGBvZmZzZXRgXHJcbiAqL1xyXG5mdW5jdGlvbiBnZXRQcmV2Q29kZVBvaW50KHN0ciwgb2Zmc2V0KSB7XHJcbiAgICBjb25zdCBjaGFyQ29kZSA9IHN0ci5jaGFyQ29kZUF0KG9mZnNldCAtIDEpO1xyXG4gICAgaWYgKGlzTG93U3Vycm9nYXRlKGNoYXJDb2RlKSAmJiBvZmZzZXQgPiAxKSB7XHJcbiAgICAgICAgY29uc3QgcHJldkNoYXJDb2RlID0gc3RyLmNoYXJDb2RlQXQob2Zmc2V0IC0gMik7XHJcbiAgICAgICAgaWYgKGlzSGlnaFN1cnJvZ2F0ZShwcmV2Q2hhckNvZGUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wdXRlQ29kZVBvaW50KHByZXZDaGFyQ29kZSwgY2hhckNvZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBjaGFyQ29kZTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gbmV4dENoYXJMZW5ndGgoc3RyLCBvZmZzZXQpIHtcclxuICAgIGNvbnN0IGdyYXBoZW1lQnJlYWtUcmVlID0gR3JhcGhlbWVCcmVha1RyZWUuZ2V0SW5zdGFuY2UoKTtcclxuICAgIGNvbnN0IGluaXRpYWxPZmZzZXQgPSBvZmZzZXQ7XHJcbiAgICBjb25zdCBsZW4gPSBzdHIubGVuZ3RoO1xyXG4gICAgY29uc3QgaW5pdGlhbENvZGVQb2ludCA9IGdldE5leHRDb2RlUG9pbnQoc3RyLCBsZW4sIG9mZnNldCk7XHJcbiAgICBvZmZzZXQgKz0gKGluaXRpYWxDb2RlUG9pbnQgPj0gNjU1MzYgLyogVU5JQ09ERV9TVVBQTEVNRU5UQVJZX1BMQU5FX0JFR0lOICovID8gMiA6IDEpO1xyXG4gICAgbGV0IGdyYXBoZW1lQnJlYWtUeXBlID0gZ3JhcGhlbWVCcmVha1RyZWUuZ2V0R3JhcGhlbWVCcmVha1R5cGUoaW5pdGlhbENvZGVQb2ludCk7XHJcbiAgICB3aGlsZSAob2Zmc2V0IDwgbGVuKSB7XHJcbiAgICAgICAgY29uc3QgbmV4dENvZGVQb2ludCA9IGdldE5leHRDb2RlUG9pbnQoc3RyLCBsZW4sIG9mZnNldCk7XHJcbiAgICAgICAgY29uc3QgbmV4dEdyYXBoZW1lQnJlYWtUeXBlID0gZ3JhcGhlbWVCcmVha1RyZWUuZ2V0R3JhcGhlbWVCcmVha1R5cGUobmV4dENvZGVQb2ludCk7XHJcbiAgICAgICAgaWYgKGJyZWFrQmV0d2VlbkdyYXBoZW1lQnJlYWtUeXBlKGdyYXBoZW1lQnJlYWtUeXBlLCBuZXh0R3JhcGhlbWVCcmVha1R5cGUpKSB7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvZmZzZXQgKz0gKG5leHRDb2RlUG9pbnQgPj0gNjU1MzYgLyogVU5JQ09ERV9TVVBQTEVNRU5UQVJZX1BMQU5FX0JFR0lOICovID8gMiA6IDEpO1xyXG4gICAgICAgIGdyYXBoZW1lQnJlYWtUeXBlID0gbmV4dEdyYXBoZW1lQnJlYWtUeXBlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIChvZmZzZXQgLSBpbml0aWFsT2Zmc2V0KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcHJldkNoYXJMZW5ndGgoc3RyLCBvZmZzZXQpIHtcclxuICAgIGNvbnN0IGdyYXBoZW1lQnJlYWtUcmVlID0gR3JhcGhlbWVCcmVha1RyZWUuZ2V0SW5zdGFuY2UoKTtcclxuICAgIGNvbnN0IGluaXRpYWxPZmZzZXQgPSBvZmZzZXQ7XHJcbiAgICBjb25zdCBpbml0aWFsQ29kZVBvaW50ID0gZ2V0UHJldkNvZGVQb2ludChzdHIsIG9mZnNldCk7XHJcbiAgICBvZmZzZXQgLT0gKGluaXRpYWxDb2RlUG9pbnQgPj0gNjU1MzYgLyogVU5JQ09ERV9TVVBQTEVNRU5UQVJZX1BMQU5FX0JFR0lOICovID8gMiA6IDEpO1xyXG4gICAgbGV0IGdyYXBoZW1lQnJlYWtUeXBlID0gZ3JhcGhlbWVCcmVha1RyZWUuZ2V0R3JhcGhlbWVCcmVha1R5cGUoaW5pdGlhbENvZGVQb2ludCk7XHJcbiAgICB3aGlsZSAob2Zmc2V0ID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHByZXZDb2RlUG9pbnQgPSBnZXRQcmV2Q29kZVBvaW50KHN0ciwgb2Zmc2V0KTtcclxuICAgICAgICBjb25zdCBwcmV2R3JhcGhlbWVCcmVha1R5cGUgPSBncmFwaGVtZUJyZWFrVHJlZS5nZXRHcmFwaGVtZUJyZWFrVHlwZShwcmV2Q29kZVBvaW50KTtcclxuICAgICAgICBpZiAoYnJlYWtCZXR3ZWVuR3JhcGhlbWVCcmVha1R5cGUocHJldkdyYXBoZW1lQnJlYWtUeXBlLCBncmFwaGVtZUJyZWFrVHlwZSkpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9mZnNldCAtPSAocHJldkNvZGVQb2ludCA+PSA2NTUzNiAvKiBVTklDT0RFX1NVUFBMRU1FTlRBUllfUExBTkVfQkVHSU4gKi8gPyAyIDogMSk7XHJcbiAgICAgICAgZ3JhcGhlbWVCcmVha1R5cGUgPSBwcmV2R3JhcGhlbWVCcmVha1R5cGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gKGluaXRpYWxPZmZzZXQgLSBvZmZzZXQpO1xyXG59XHJcbi8qKlxyXG4gKiBBIG1hbnVhbCBkZWNvZGluZyBvZiBhIFVURjggc3RyaW5nLlxyXG4gKiBVc2Ugb25seSBpbiBlbnZpcm9ubWVudHMgd2hpY2ggZG8gbm90IG9mZmVyIG5hdGl2ZSBjb252ZXJzaW9uIG1ldGhvZHMhXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlVVRGOChidWZmZXIpIHtcclxuICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1VURi04XHJcbiAgICBjb25zdCBsZW4gPSBidWZmZXIuYnl0ZUxlbmd0aDtcclxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xyXG4gICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICB3aGlsZSAob2Zmc2V0IDwgbGVuKSB7XHJcbiAgICAgICAgY29uc3QgdjAgPSBidWZmZXJbb2Zmc2V0XTtcclxuICAgICAgICBsZXQgY29kZVBvaW50O1xyXG4gICAgICAgIGlmICh2MCA+PSAwYjExMTEwMDAwICYmIG9mZnNldCArIDMgPCBsZW4pIHtcclxuICAgICAgICAgICAgLy8gNCBieXRlc1xyXG4gICAgICAgICAgICBjb2RlUG9pbnQgPSAoKCgoYnVmZmVyW29mZnNldCsrXSAmIDBiMDAwMDAxMTEpIDw8IDE4KSA+Pj4gMClcclxuICAgICAgICAgICAgICAgIHwgKCgoYnVmZmVyW29mZnNldCsrXSAmIDBiMDAxMTExMTEpIDw8IDEyKSA+Pj4gMClcclxuICAgICAgICAgICAgICAgIHwgKCgoYnVmZmVyW29mZnNldCsrXSAmIDBiMDAxMTExMTEpIDw8IDYpID4+PiAwKVxyXG4gICAgICAgICAgICAgICAgfCAoKChidWZmZXJbb2Zmc2V0KytdICYgMGIwMDExMTExMSkgPDwgMCkgPj4+IDApKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodjAgPj0gMGIxMTEwMDAwMCAmJiBvZmZzZXQgKyAyIDwgbGVuKSB7XHJcbiAgICAgICAgICAgIC8vIDMgYnl0ZXNcclxuICAgICAgICAgICAgY29kZVBvaW50ID0gKCgoKGJ1ZmZlcltvZmZzZXQrK10gJiAwYjAwMDAxMTExKSA8PCAxMikgPj4+IDApXHJcbiAgICAgICAgICAgICAgICB8ICgoKGJ1ZmZlcltvZmZzZXQrK10gJiAwYjAwMTExMTExKSA8PCA2KSA+Pj4gMClcclxuICAgICAgICAgICAgICAgIHwgKCgoYnVmZmVyW29mZnNldCsrXSAmIDBiMDAxMTExMTEpIDw8IDApID4+PiAwKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHYwID49IDBiMTEwMDAwMDAgJiYgb2Zmc2V0ICsgMSA8IGxlbikge1xyXG4gICAgICAgICAgICAvLyAyIGJ5dGVzXHJcbiAgICAgICAgICAgIGNvZGVQb2ludCA9ICgoKChidWZmZXJbb2Zmc2V0KytdICYgMGIwMDAxMTExMSkgPDwgNikgPj4+IDApXHJcbiAgICAgICAgICAgICAgICB8ICgoKGJ1ZmZlcltvZmZzZXQrK10gJiAwYjAwMTExMTExKSA8PCAwKSA+Pj4gMCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gMSBieXRlXHJcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGJ1ZmZlcltvZmZzZXQrK107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgoY29kZVBvaW50ID49IDAgJiYgY29kZVBvaW50IDw9IDB4RDdGRikgfHwgKGNvZGVQb2ludCA+PSAweEUwMDAgJiYgY29kZVBvaW50IDw9IDB4RkZGRikpIHtcclxuICAgICAgICAgICAgLy8gQmFzaWMgTXVsdGlsaW5ndWFsIFBsYW5lXHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoY29kZVBvaW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGNvZGVQb2ludCA+PSAweDAxMDAwMCAmJiBjb2RlUG9pbnQgPD0gMHgxMEZGRkYpIHtcclxuICAgICAgICAgICAgLy8gU3VwcGxlbWVudGFyeSBQbGFuZXNcclxuICAgICAgICAgICAgY29uc3QgdVByaW1lID0gY29kZVBvaW50IC0gMHgxMDAwMDtcclxuICAgICAgICAgICAgY29uc3QgdzEgPSAweEQ4MDAgKyAoKHVQcmltZSAmIDBiMTExMTExMTExMTAwMDAwMDAwMDApID4+PiAxMCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHcyID0gMHhEQzAwICsgKCh1UHJpbWUgJiAwYjAwMDAwMDAwMDAxMTExMTExMTExKSA+Pj4gMCk7XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUodzEpKTtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZSh3MikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gaWxsZWdhbCBjb2RlIHBvaW50XHJcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdC5qb2luKCcnKTtcclxufVxyXG4vKipcclxuICogR2VuZXJhdGVkIHVzaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9hbGV4ZGltYS91bmljb2RlLXV0aWxzL2Jsb2IvbWFzdGVyL2dlbmVyYXRlLXJ0bC10ZXN0LmpzXHJcbiAqL1xyXG5jb25zdCBDT05UQUlOU19SVEwgPSAvKD86W1xcdTA1QkVcXHUwNUMwXFx1MDVDM1xcdTA1QzZcXHUwNUQwLVxcdTA1RjRcXHUwNjA4XFx1MDYwQlxcdTA2MERcXHUwNjFCLVxcdTA2NEFcXHUwNjZELVxcdTA2NkZcXHUwNjcxLVxcdTA2RDVcXHUwNkU1XFx1MDZFNlxcdTA2RUVcXHUwNkVGXFx1MDZGQS1cXHUwNzEwXFx1MDcxMi1cXHUwNzJGXFx1MDc0RC1cXHUwN0E1XFx1MDdCMS1cXHUwN0VBXFx1MDdGNFxcdTA3RjVcXHUwN0ZBLVxcdTA4MTVcXHUwODFBXFx1MDgyNFxcdTA4MjhcXHUwODMwLVxcdTA4NThcXHUwODVFLVxcdTA4QkRcXHUyMDBGXFx1RkIxRFxcdUZCMUYtXFx1RkIyOFxcdUZCMkEtXFx1RkQzRFxcdUZENTAtXFx1RkRGQ1xcdUZFNzAtXFx1RkVGQ118XFx1RDgwMltcXHVEQzAwLVxcdUREMUJcXHVERDIwLVxcdURFMDBcXHVERTEwLVxcdURFMzNcXHVERTQwLVxcdURFRTRcXHVERUVCLVxcdURGMzVcXHVERjQwLVxcdURGRkZdfFxcdUQ4MDNbXFx1REMwMC1cXHVEQ0ZGXXxcXHVEODNBW1xcdURDMDAtXFx1RENDRlxcdUREMDAtXFx1REQ0M1xcdURENTAtXFx1REZGRl18XFx1RDgzQltcXHVEQzAwLVxcdURFQkJdKS87XHJcbi8qKlxyXG4gKiBSZXR1cm5zIHRydWUgaWYgYHN0cmAgY29udGFpbnMgYW55IFVuaWNvZGUgY2hhcmFjdGVyIHRoYXQgaXMgY2xhc3NpZmllZCBhcyBcIlJcIiBvciBcIkFMXCIuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNSVEwoc3RyKSB7XHJcbiAgICByZXR1cm4gQ09OVEFJTlNfUlRMLnRlc3Qoc3RyKTtcclxufVxyXG4vKipcclxuICogR2VuZXJhdGVkIHVzaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS9hbGV4ZGltYS91bmljb2RlLXV0aWxzL2Jsb2IvbWFzdGVyL2dlbmVyYXRlLWVtb2ppLXRlc3QuanNcclxuICovXHJcbmNvbnN0IENPTlRBSU5TX0VNT0pJID0gLyg/OltcXHUyMzFBXFx1MjMxQlxcdTIzRjBcXHUyM0YzXFx1MjYwMC1cXHUyN0JGXFx1MkI1MFxcdTJCNTVdfFxcdUQ4M0NbXFx1RERFNi1cXHVEREZGXFx1REYwMC1cXHVERkZGXXxcXHVEODNEW1xcdURDMDAtXFx1REU0RlxcdURFODAtXFx1REVGQ1xcdURGRTAtXFx1REZFQl18XFx1RDgzRVtcXHVERDAwLVxcdURERkZcXHVERTcwLVxcdURFRDZdKS87XHJcbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc0Vtb2ppKHN0cikge1xyXG4gICAgcmV0dXJuIENPTlRBSU5TX0VNT0pJLnRlc3Qoc3RyKTtcclxufVxyXG5jb25zdCBJU19CQVNJQ19BU0NJSSA9IC9eW1xcdFxcblxcclxceDIwLVxceDdFXSokLztcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiBgc3RyYCBjb250YWlucyBvbmx5IGJhc2ljIEFTQ0lJIGNoYXJhY3RlcnMgaW4gdGhlIHJhbmdlIDMyIC0gMTI2IChpbmNsdWRpbmcgMzIgYW5kIDEyNikgb3IgXFxuLCBcXHIsIFxcdFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzQmFzaWNBU0NJSShzdHIpIHtcclxuICAgIHJldHVybiBJU19CQVNJQ19BU0NJSS50ZXN0KHN0cik7XHJcbn1cclxuZXhwb3J0IGNvbnN0IFVOVVNVQUxfTElORV9URVJNSU5BVE9SUyA9IC9bXFx1MjAyOFxcdTIwMjldLzsgLy8gTElORSBTRVBBUkFUT1IgKExTKSBvciBQQVJBR1JBUEggU0VQQVJBVE9SIChQUylcclxuLyoqXHJcbiAqIFJldHVybnMgdHJ1ZSBpZiBgc3RyYCBjb250YWlucyB1bnVzdWFsIGxpbmUgdGVybWluYXRvcnMsIGxpa2UgTFMgb3IgUFNcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb250YWluc1VudXN1YWxMaW5lVGVybWluYXRvcnMoc3RyKSB7XHJcbiAgICByZXR1cm4gVU5VU1VBTF9MSU5FX1RFUk1JTkFUT1JTLnRlc3Qoc3RyKTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY29udGFpbnNGdWxsV2lkdGhDaGFyYWN0ZXIoc3RyKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgaWYgKGlzRnVsbFdpZHRoQ2hhcmFjdGVyKHN0ci5jaGFyQ29kZUF0KGkpKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVsbFdpZHRoQ2hhcmFjdGVyKGNoYXJDb2RlKSB7XHJcbiAgICAvLyBEbyBhIGNoZWFwIHRyaWNrIHRvIGJldHRlciBzdXBwb3J0IHdyYXBwaW5nIG9mIHdpZGUgY2hhcmFjdGVycywgdHJlYXQgdGhlbSBhcyAyIGNvbHVtbnNcclxuICAgIC8vIGh0dHA6Ly9qcmdyYXBoaXgubmV0L3Jlc2VhcmNoL3VuaWNvZGVfYmxvY2tzLnBocFxyXG4gICAgLy8gICAgICAgICAgMkU4MCBcdTIwMTQgMkVGRiAgIENKSyBSYWRpY2FscyBTdXBwbGVtZW50XHJcbiAgICAvLyAgICAgICAgICAyRjAwIFx1MjAxNCAyRkRGICAgS2FuZ3hpIFJhZGljYWxzXHJcbiAgICAvLyAgICAgICAgICAyRkYwIFx1MjAxNCAyRkZGICAgSWRlb2dyYXBoaWMgRGVzY3JpcHRpb24gQ2hhcmFjdGVyc1xyXG4gICAgLy8gICAgICAgICAgMzAwMCBcdTIwMTQgMzAzRiAgIENKSyBTeW1ib2xzIGFuZCBQdW5jdHVhdGlvblxyXG4gICAgLy8gICAgICAgICAgMzA0MCBcdTIwMTQgMzA5RiAgIEhpcmFnYW5hXHJcbiAgICAvLyAgICAgICAgICAzMEEwIFx1MjAxNCAzMEZGICAgS2F0YWthbmFcclxuICAgIC8vICAgICAgICAgIDMxMDAgXHUyMDE0IDMxMkYgICBCb3BvbW9mb1xyXG4gICAgLy8gICAgICAgICAgMzEzMCBcdTIwMTQgMzE4RiAgIEhhbmd1bCBDb21wYXRpYmlsaXR5IEphbW9cclxuICAgIC8vICAgICAgICAgIDMxOTAgXHUyMDE0IDMxOUYgICBLYW5idW5cclxuICAgIC8vICAgICAgICAgIDMxQTAgXHUyMDE0IDMxQkYgICBCb3BvbW9mbyBFeHRlbmRlZFxyXG4gICAgLy8gICAgICAgICAgMzFGMCBcdTIwMTQgMzFGRiAgIEthdGFrYW5hIFBob25ldGljIEV4dGVuc2lvbnNcclxuICAgIC8vICAgICAgICAgIDMyMDAgXHUyMDE0IDMyRkYgICBFbmNsb3NlZCBDSksgTGV0dGVycyBhbmQgTW9udGhzXHJcbiAgICAvLyAgICAgICAgICAzMzAwIFx1MjAxNCAzM0ZGICAgQ0pLIENvbXBhdGliaWxpdHlcclxuICAgIC8vICAgICAgICAgIDM0MDAgXHUyMDE0IDREQkYgICBDSksgVW5pZmllZCBJZGVvZ3JhcGhzIEV4dGVuc2lvbiBBXHJcbiAgICAvLyAgICAgICAgICA0REMwIFx1MjAxNCA0REZGICAgWWlqaW5nIEhleGFncmFtIFN5bWJvbHNcclxuICAgIC8vICAgICAgICAgIDRFMDAgXHUyMDE0IDlGRkYgICBDSksgVW5pZmllZCBJZGVvZ3JhcGhzXHJcbiAgICAvLyAgICAgICAgICBBMDAwIFx1MjAxNCBBNDhGICAgWWkgU3lsbGFibGVzXHJcbiAgICAvLyAgICAgICAgICBBNDkwIFx1MjAxNCBBNENGICAgWWkgUmFkaWNhbHNcclxuICAgIC8vICAgICAgICAgIEFDMDAgXHUyMDE0IEQ3QUYgICBIYW5ndWwgU3lsbGFibGVzXHJcbiAgICAvLyBbSUdOT1JFXSBEODAwIFx1MjAxNCBEQjdGICAgSGlnaCBTdXJyb2dhdGVzXHJcbiAgICAvLyBbSUdOT1JFXSBEQjgwIFx1MjAxNCBEQkZGICAgSGlnaCBQcml2YXRlIFVzZSBTdXJyb2dhdGVzXHJcbiAgICAvLyBbSUdOT1JFXSBEQzAwIFx1MjAxNCBERkZGICAgTG93IFN1cnJvZ2F0ZXNcclxuICAgIC8vIFtJR05PUkVdIEUwMDAgXHUyMDE0IEY4RkYgICBQcml2YXRlIFVzZSBBcmVhXHJcbiAgICAvLyAgICAgICAgICBGOTAwIFx1MjAxNCBGQUZGICAgQ0pLIENvbXBhdGliaWxpdHkgSWRlb2dyYXBoc1xyXG4gICAgLy8gW0lHTk9SRV0gRkIwMCBcdTIwMTQgRkI0RiAgIEFscGhhYmV0aWMgUHJlc2VudGF0aW9uIEZvcm1zXHJcbiAgICAvLyBbSUdOT1JFXSBGQjUwIFx1MjAxNCBGREZGICAgQXJhYmljIFByZXNlbnRhdGlvbiBGb3Jtcy1BXHJcbiAgICAvLyBbSUdOT1JFXSBGRTAwIFx1MjAxNCBGRTBGICAgVmFyaWF0aW9uIFNlbGVjdG9yc1xyXG4gICAgLy8gW0lHTk9SRV0gRkUyMCBcdTIwMTQgRkUyRiAgIENvbWJpbmluZyBIYWxmIE1hcmtzXHJcbiAgICAvLyBbSUdOT1JFXSBGRTMwIFx1MjAxNCBGRTRGICAgQ0pLIENvbXBhdGliaWxpdHkgRm9ybXNcclxuICAgIC8vIFtJR05PUkVdIEZFNTAgXHUyMDE0IEZFNkYgICBTbWFsbCBGb3JtIFZhcmlhbnRzXHJcbiAgICAvLyBbSUdOT1JFXSBGRTcwIFx1MjAxNCBGRUZGICAgQXJhYmljIFByZXNlbnRhdGlvbiBGb3Jtcy1CXHJcbiAgICAvLyAgICAgICAgICBGRjAwIFx1MjAxNCBGRkVGICAgSGFsZndpZHRoIGFuZCBGdWxsd2lkdGggRm9ybXNcclxuICAgIC8vICAgICAgICAgICAgICAgW2h0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hhbGZ3aWR0aF9hbmRfZnVsbHdpZHRoX2Zvcm1zXVxyXG4gICAgLy8gICAgICAgICAgICAgICBvZiB3aGljaCBGRjAxIC0gRkY1RSBmdWxsd2lkdGggQVNDSUkgb2YgMjEgdG8gN0VcclxuICAgIC8vIFtJR05PUkVdICAgIGFuZCBGRjY1IC0gRkZEQyBoYWxmd2lkdGggb2YgS2F0YWthbmEgYW5kIEhhbmd1bFxyXG4gICAgLy8gW0lHTk9SRV0gRkZGMCBcdTIwMTQgRkZGRiAgIFNwZWNpYWxzXHJcbiAgICBjaGFyQ29kZSA9ICtjaGFyQ29kZTsgLy8gQHBlcmZcclxuICAgIHJldHVybiAoKGNoYXJDb2RlID49IDB4MkU4MCAmJiBjaGFyQ29kZSA8PSAweEQ3QUYpXHJcbiAgICAgICAgfHwgKGNoYXJDb2RlID49IDB4RjkwMCAmJiBjaGFyQ29kZSA8PSAweEZBRkYpXHJcbiAgICAgICAgfHwgKGNoYXJDb2RlID49IDB4RkYwMSAmJiBjaGFyQ29kZSA8PSAweEZGNUUpKTtcclxufVxyXG4vKipcclxuICogQSBmYXN0IGZ1bmN0aW9uICh0aGVyZWZvcmUgaW1wcmVjaXNlKSB0byBjaGVjayBpZiBjb2RlIHBvaW50cyBhcmUgZW1vamlzLlxyXG4gKiBHZW5lcmF0ZWQgdXNpbmcgaHR0cHM6Ly9naXRodWIuY29tL2FsZXhkaW1hL3VuaWNvZGUtdXRpbHMvYmxvYi9tYXN0ZXIvZ2VuZXJhdGUtZW1vamktdGVzdC5qc1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGlzRW1vamlJbXByZWNpc2UoeCkge1xyXG4gICAgcmV0dXJuICgoeCA+PSAweDFGMUU2ICYmIHggPD0gMHgxRjFGRikgfHwgKHggPT09IDg5ODYpIHx8ICh4ID09PSA4OTg3KSB8fCAoeCA9PT0gOTIwMClcclxuICAgICAgICB8fCAoeCA9PT0gOTIwMykgfHwgKHggPj0gOTcyOCAmJiB4IDw9IDEwMTc1KSB8fCAoeCA9PT0gMTEwODgpIHx8ICh4ID09PSAxMTA5MylcclxuICAgICAgICB8fCAoeCA+PSAxMjc3NDQgJiYgeCA8PSAxMjg1OTEpIHx8ICh4ID49IDEyODY0MCAmJiB4IDw9IDEyODc2NClcclxuICAgICAgICB8fCAoeCA+PSAxMjg5OTIgJiYgeCA8PSAxMjkwMDMpIHx8ICh4ID49IDEyOTI4MCAmJiB4IDw9IDEyOTUzNSlcclxuICAgICAgICB8fCAoeCA+PSAxMjk2NDggJiYgeCA8PSAxMjk3NTApKTtcclxufVxyXG4vLyAtLSBVVEYtOCBCT01cclxuZXhwb3J0IGNvbnN0IFVURjhfQk9NX0NIQVJBQ1RFUiA9IFN0cmluZy5mcm9tQ2hhckNvZGUoNjUyNzkgLyogVVRGOF9CT00gKi8pO1xyXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRzV2l0aFVURjhCT00oc3RyKSB7XHJcbiAgICByZXR1cm4gISEoc3RyICYmIHN0ci5sZW5ndGggPiAwICYmIHN0ci5jaGFyQ29kZUF0KDApID09PSA2NTI3OSAvKiBVVEY4X0JPTSAqLyk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbnRhaW5zVXBwZXJjYXNlQ2hhcmFjdGVyKHRhcmdldCwgaWdub3JlRXNjYXBlZENoYXJzID0gZmFsc2UpIHtcclxuICAgIGlmICghdGFyZ2V0KSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaWYgKGlnbm9yZUVzY2FwZWRDaGFycykge1xyXG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5yZXBsYWNlKC9cXFxcLi9nLCAnJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGFyZ2V0LnRvTG93ZXJDYXNlKCkgIT09IHRhcmdldDtcclxufVxyXG4vKipcclxuICogUHJvZHVjZXMgJ2EnLSd6JywgZm9sbG93ZWQgYnkgJ0EnLSdaJy4uLiBmb2xsb3dlZCBieSAnYSctJ3onLCBldGMuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gc2luZ2xlTGV0dGVySGFzaChuKSB7XHJcbiAgICBjb25zdCBMRVRURVJTX0NOVCA9ICg5MCAvKiBaICovIC0gNjUgLyogQSAqLyArIDEpO1xyXG4gICAgbiA9IG4gJSAoMiAqIExFVFRFUlNfQ05UKTtcclxuICAgIGlmIChuIDwgTEVUVEVSU19DTlQpIHtcclxuICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSg5NyAvKiBhICovICsgbik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSg2NSAvKiBBICovICsgbiAtIExFVFRFUlNfQ05UKTtcclxufVxyXG4vLyNyZWdpb24gVW5pY29kZSBHcmFwaGVtZSBCcmVha1xyXG5leHBvcnQgZnVuY3Rpb24gZ2V0R3JhcGhlbWVCcmVha1R5cGUoY29kZVBvaW50KSB7XHJcbiAgICBjb25zdCBncmFwaGVtZUJyZWFrVHJlZSA9IEdyYXBoZW1lQnJlYWtUcmVlLmdldEluc3RhbmNlKCk7XHJcbiAgICByZXR1cm4gZ3JhcGhlbWVCcmVha1RyZWUuZ2V0R3JhcGhlbWVCcmVha1R5cGUoY29kZVBvaW50KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gYnJlYWtCZXR3ZWVuR3JhcGhlbWVCcmVha1R5cGUoYnJlYWtUeXBlQSwgYnJlYWtUeXBlQikge1xyXG4gICAgLy8gaHR0cDovL3d3dy51bmljb2RlLm9yZy9yZXBvcnRzL3RyMjkvI0dyYXBoZW1lX0NsdXN0ZXJfQm91bmRhcnlfUnVsZXNcclxuICAgIC8vICEhISBMZXQncyBtYWtlIHRoZSBjb21tb24gY2FzZSBhIGJpdCBmYXN0ZXJcclxuICAgIGlmIChicmVha1R5cGVBID09PSAwIC8qIE90aGVyICovKSB7XHJcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vd3d3LnVuaWNvZGUub3JnL1B1YmxpYy8xMy4wLjAvdWNkL2F1eGlsaWFyeS9HcmFwaGVtZUJyZWFrVGVzdC0xMy4wLjBkMTAuaHRtbCN0YWJsZVxyXG4gICAgICAgIHJldHVybiAoYnJlYWtUeXBlQiAhPT0gNSAvKiBFeHRlbmQgKi8gJiYgYnJlYWtUeXBlQiAhPT0gNyAvKiBTcGFjaW5nTWFyayAqLyk7XHJcbiAgICB9XHJcbiAgICAvLyBEbyBub3QgYnJlYWsgYmV0d2VlbiBhIENSIGFuZCBMRi4gT3RoZXJ3aXNlLCBicmVhayBiZWZvcmUgYW5kIGFmdGVyIGNvbnRyb2xzLlxyXG4gICAgLy8gR0IzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENSIFx1MDBENyBMRlxyXG4gICAgLy8gR0I0ICAgICAgICAgICAgICAgICAgICAgICAoQ29udHJvbCB8IENSIHwgTEYpIFx1MDBGN1xyXG4gICAgLy8gR0I1ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MDBGNyAoQ29udHJvbCB8IENSIHwgTEYpXHJcbiAgICBpZiAoYnJlYWtUeXBlQSA9PT0gMiAvKiBDUiAqLykge1xyXG4gICAgICAgIGlmIChicmVha1R5cGVCID09PSAzIC8qIExGICovKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gR0IzXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGJyZWFrVHlwZUEgPT09IDQgLyogQ29udHJvbCAqLyB8fCBicmVha1R5cGVBID09PSAyIC8qIENSICovIHx8IGJyZWFrVHlwZUEgPT09IDMgLyogTEYgKi8pIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gR0I0XHJcbiAgICB9XHJcbiAgICBpZiAoYnJlYWtUeXBlQiA9PT0gNCAvKiBDb250cm9sICovIHx8IGJyZWFrVHlwZUIgPT09IDIgLyogQ1IgKi8gfHwgYnJlYWtUeXBlQiA9PT0gMyAvKiBMRiAqLykge1xyXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBHQjVcclxuICAgIH1cclxuICAgIC8vIERvIG5vdCBicmVhayBIYW5ndWwgc3lsbGFibGUgc2VxdWVuY2VzLlxyXG4gICAgLy8gR0I2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMIFx1MDBENyAoTCB8IFYgfCBMViB8IExWVClcclxuICAgIC8vIEdCNyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoTFYgfCBWKSBcdTAwRDcgKFYgfCBUKVxyXG4gICAgLy8gR0I4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKExWVCB8IFQpIFx1MDBENyBUXHJcbiAgICBpZiAoYnJlYWtUeXBlQSA9PT0gOCAvKiBMICovKSB7XHJcbiAgICAgICAgaWYgKGJyZWFrVHlwZUIgPT09IDggLyogTCAqLyB8fCBicmVha1R5cGVCID09PSA5IC8qIFYgKi8gfHwgYnJlYWtUeXBlQiA9PT0gMTEgLyogTFYgKi8gfHwgYnJlYWtUeXBlQiA9PT0gMTIgLyogTFZUICovKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gR0I2XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKGJyZWFrVHlwZUEgPT09IDExIC8qIExWICovIHx8IGJyZWFrVHlwZUEgPT09IDkgLyogViAqLykge1xyXG4gICAgICAgIGlmIChicmVha1R5cGVCID09PSA5IC8qIFYgKi8gfHwgYnJlYWtUeXBlQiA9PT0gMTAgLyogVCAqLykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIEdCN1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChicmVha1R5cGVBID09PSAxMiAvKiBMVlQgKi8gfHwgYnJlYWtUeXBlQSA9PT0gMTAgLyogVCAqLykge1xyXG4gICAgICAgIGlmIChicmVha1R5cGVCID09PSAxMCAvKiBUICovKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gR0I4XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gRG8gbm90IGJyZWFrIGJlZm9yZSBleHRlbmRpbmcgY2hhcmFjdGVycyBvciBaV0ouXHJcbiAgICAvLyBHQjkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXHUwMEQ3IChFeHRlbmQgfCBaV0opXHJcbiAgICBpZiAoYnJlYWtUeXBlQiA9PT0gNSAvKiBFeHRlbmQgKi8gfHwgYnJlYWtUeXBlQiA9PT0gMTMgLyogWldKICovKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBHQjlcclxuICAgIH1cclxuICAgIC8vIFRoZSBHQjlhIGFuZCBHQjliIHJ1bGVzIG9ubHkgYXBwbHkgdG8gZXh0ZW5kZWQgZ3JhcGhlbWUgY2x1c3RlcnM6XHJcbiAgICAvLyBEbyBub3QgYnJlYWsgYmVmb3JlIFNwYWNpbmdNYXJrcywgb3IgYWZ0ZXIgUHJlcGVuZCBjaGFyYWN0ZXJzLlxyXG4gICAgLy8gR0I5YSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFx1MDBENyBTcGFjaW5nTWFya1xyXG4gICAgLy8gR0I5YiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQcmVwZW5kIFx1MDBEN1xyXG4gICAgaWYgKGJyZWFrVHlwZUIgPT09IDcgLyogU3BhY2luZ01hcmsgKi8pIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIEdCOWFcclxuICAgIH1cclxuICAgIGlmIChicmVha1R5cGVBID09PSAxIC8qIFByZXBlbmQgKi8pIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIEdCOWJcclxuICAgIH1cclxuICAgIC8vIERvIG5vdCBicmVhayB3aXRoaW4gZW1vamkgbW9kaWZpZXIgc2VxdWVuY2VzIG9yIGVtb2ppIHp3aiBzZXF1ZW5jZXMuXHJcbiAgICAvLyBHQjExICAgIFxccHtFeHRlbmRlZF9QaWN0b2dyYXBoaWN9IEV4dGVuZCogWldKIFx1MDBENyBcXHB7RXh0ZW5kZWRfUGljdG9ncmFwaGljfVxyXG4gICAgaWYgKGJyZWFrVHlwZUEgPT09IDEzIC8qIFpXSiAqLyAmJiBicmVha1R5cGVCID09PSAxNCAvKiBFeHRlbmRlZF9QaWN0b2dyYXBoaWMgKi8pIHtcclxuICAgICAgICAvLyBOb3RlOiB3ZSBhcmUgbm90IGltcGxlbWVudGluZyB0aGUgcnVsZSBlbnRpcmVseSBoZXJlIHRvIGF2b2lkIGludHJvZHVjaW5nIHN0YXRlc1xyXG4gICAgICAgIHJldHVybiBmYWxzZTsgLy8gR0IxMVxyXG4gICAgfVxyXG4gICAgLy8gR0IxMiAgICAgICAgICAgICAgICAgICAgICAgICAgc290IChSSSBSSSkqIFJJIFx1MDBENyBSSVxyXG4gICAgLy8gR0IxMyAgICAgICAgICAgICAgICAgICAgICAgIFteUkldIChSSSBSSSkqIFJJIFx1MDBENyBSSVxyXG4gICAgaWYgKGJyZWFrVHlwZUEgPT09IDYgLyogUmVnaW9uYWxfSW5kaWNhdG9yICovICYmIGJyZWFrVHlwZUIgPT09IDYgLyogUmVnaW9uYWxfSW5kaWNhdG9yICovKSB7XHJcbiAgICAgICAgLy8gTm90ZTogd2UgYXJlIG5vdCBpbXBsZW1lbnRpbmcgdGhlIHJ1bGUgZW50aXJlbHkgaGVyZSB0byBhdm9pZCBpbnRyb2R1Y2luZyBzdGF0ZXNcclxuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIEdCMTIgJiBHQjEzXHJcbiAgICB9XHJcbiAgICAvLyBHQjk5OSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbnkgXHUwMEY3IEFueVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuY2xhc3MgR3JhcGhlbWVCcmVha1RyZWUge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YSA9IGdldEdyYXBoZW1lQnJlYWtSYXdEYXRhKCk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKSB7XHJcbiAgICAgICAgaWYgKCFHcmFwaGVtZUJyZWFrVHJlZS5fSU5TVEFOQ0UpIHtcclxuICAgICAgICAgICAgR3JhcGhlbWVCcmVha1RyZWUuX0lOU1RBTkNFID0gbmV3IEdyYXBoZW1lQnJlYWtUcmVlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBHcmFwaGVtZUJyZWFrVHJlZS5fSU5TVEFOQ0U7XHJcbiAgICB9XHJcbiAgICBnZXRHcmFwaGVtZUJyZWFrVHlwZShjb2RlUG9pbnQpIHtcclxuICAgICAgICAvLyAhISEgTGV0J3MgbWFrZSA3Yml0IEFTQ0lJIGEgYml0IGZhc3RlcjogMC4uMzFcclxuICAgICAgICBpZiAoY29kZVBvaW50IDwgMzIpIHtcclxuICAgICAgICAgICAgaWYgKGNvZGVQb2ludCA9PT0gMTAgLyogTGluZUZlZWQgKi8pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAzIC8qIExGICovO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlUG9pbnQgPT09IDEzIC8qIENhcnJpYWdlUmV0dXJuICovKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMiAvKiBDUiAqLztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gNCAvKiBDb250cm9sICovO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAhISEgTGV0J3MgbWFrZSA3Yml0IEFTQ0lJIGEgYml0IGZhc3RlcjogMzIuLjEyNlxyXG4gICAgICAgIGlmIChjb2RlUG9pbnQgPCAxMjcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDAgLyogT3RoZXIgKi87XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9kYXRhO1xyXG4gICAgICAgIGNvbnN0IG5vZGVDb3VudCA9IGRhdGEubGVuZ3RoIC8gMztcclxuICAgICAgICBsZXQgbm9kZUluZGV4ID0gMTtcclxuICAgICAgICB3aGlsZSAobm9kZUluZGV4IDw9IG5vZGVDb3VudCkge1xyXG4gICAgICAgICAgICBpZiAoY29kZVBvaW50IDwgZGF0YVszICogbm9kZUluZGV4XSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZ28gbGVmdFxyXG4gICAgICAgICAgICAgICAgbm9kZUluZGV4ID0gMiAqIG5vZGVJbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChjb2RlUG9pbnQgPiBkYXRhWzMgKiBub2RlSW5kZXggKyAxXSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZ28gcmlnaHRcclxuICAgICAgICAgICAgICAgIG5vZGVJbmRleCA9IDIgKiBub2RlSW5kZXggKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gaGl0XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YVszICogbm9kZUluZGV4ICsgMl07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDAgLyogT3RoZXIgKi87XHJcbiAgICB9XHJcbn1cclxuR3JhcGhlbWVCcmVha1RyZWUuX0lOU1RBTkNFID0gbnVsbDtcclxuZnVuY3Rpb24gZ2V0R3JhcGhlbWVCcmVha1Jhd0RhdGEoKSB7XHJcbiAgICAvLyBnZW5lcmF0ZWQgdXNpbmcgaHR0cHM6Ly9naXRodWIuY29tL2FsZXhkaW1hL3VuaWNvZGUtdXRpbHMvYmxvYi9tYXN0ZXIvZ2VuZXJhdGUtZ3JhcGhlbWUtYnJlYWsuanNcclxuICAgIHJldHVybiBKU09OLnBhcnNlKCdbMCwwLDAsNTE1OTIsNTE1OTIsMTEsNDQ0MjQsNDQ0MjQsMTEsNzIyNTEsNzIyNTQsNSw3MTUwLDcxNTAsNyw0ODAwOCw0ODAwOCwxMSw1NTE3Niw1NTE3NiwxMSwxMjg0MjAsMTI4NDIwLDE0LDMyNzYsMzI3Nyw1LDk5NzksOTk4MCwxNCw0NjIxNiw0NjIxNiwxMSw0OTgwMCw0OTgwMCwxMSw1MzM4NCw1MzM4NCwxMSw3MDcyNiw3MDcyNiw1LDEyMjkxNSwxMjI5MTYsNSwxMjkzMjAsMTI5MzI3LDE0LDI1NTgsMjU1OCw1LDU5MDYsNTkwOCw1LDk3NjIsOTc2MywxNCw0MzM2MCw0MzM4OCw4LDQ1MzIwLDQ1MzIwLDExLDQ3MTEyLDQ3MTEyLDExLDQ4OTA0LDQ4OTA0LDExLDUwNjk2LDUwNjk2LDExLDUyNDg4LDUyNDg4LDExLDU0MjgwLDU0MjgwLDExLDcwMDgyLDcwMDgzLDEsNzEzNTAsNzEzNTAsNyw3MzExMSw3MzExMSw1LDEyNzg5MiwxMjc4OTMsMTQsMTI4NzI2LDEyODcyNywxNCwxMjk0NzMsMTI5NDc0LDE0LDIwMjcsMjAzNSw1LDI5MDEsMjkwMiw1LDM3ODQsMzc4OSw1LDY3NTQsNjc1NCw1LDg0MTgsODQyMCw1LDk4NzcsOTg3NywxNCwxMTA4OCwxMTA4OCwxNCw0NDAwOCw0NDAwOCw1LDQ0ODcyLDQ0ODcyLDExLDQ1NzY4LDQ1NzY4LDExLDQ2NjY0LDQ2NjY0LDExLDQ3NTYwLDQ3NTYwLDExLDQ4NDU2LDQ4NDU2LDExLDQ5MzUyLDQ5MzUyLDExLDUwMjQ4LDUwMjQ4LDExLDUxMTQ0LDUxMTQ0LDExLDUyMDQwLDUyMDQwLDExLDUyOTM2LDUyOTM2LDExLDUzODMyLDUzODMyLDExLDU0NzI4LDU0NzI4LDExLDY5ODExLDY5ODE0LDUsNzA0NTksNzA0NjAsNSw3MTA5Niw3MTA5OSw3LDcxOTk4LDcxOTk4LDUsNzI4NzQsNzI4ODAsNSwxMTkxNDksMTE5MTQ5LDcsMTI3Mzc0LDEyNzM3NCwxNCwxMjgzMzUsMTI4MzM1LDE0LDEyODQ4MiwxMjg0ODIsMTQsMTI4NzY1LDEyODc2NywxNCwxMjkzOTksMTI5NDAwLDE0LDEyOTY4MCwxMjk2ODUsMTQsMTQ3NiwxNDc3LDUsMjM3NywyMzgwLDcsMjc1OSwyNzYwLDUsMzEzNywzMTQwLDcsMzQ1OCwzNDU5LDcsNDE1Myw0MTU0LDUsNjQzMiw2NDM0LDUsNjk3OCw2OTc4LDUsNzY3NSw3Njc5LDUsOTcyMyw5NzI2LDE0LDk4MjMsOTgyMywxNCw5OTE5LDk5MjMsMTQsMTAwMzUsMTAwMzYsMTQsNDI3MzYsNDI3MzcsNSw0MzU5Niw0MzU5Niw1LDQ0MjAwLDQ0MjAwLDExLDQ0NjQ4LDQ0NjQ4LDExLDQ1MDk2LDQ1MDk2LDExLDQ1NTQ0LDQ1NTQ0LDExLDQ1OTkyLDQ1OTkyLDExLDQ2NDQwLDQ2NDQwLDExLDQ2ODg4LDQ2ODg4LDExLDQ3MzM2LDQ3MzM2LDExLDQ3Nzg0LDQ3Nzg0LDExLDQ4MjMyLDQ4MjMyLDExLDQ4NjgwLDQ4NjgwLDExLDQ5MTI4LDQ5MTI4LDExLDQ5NTc2LDQ5NTc2LDExLDUwMDI0LDUwMDI0LDExLDUwNDcyLDUwNDcyLDExLDUwOTIwLDUwOTIwLDExLDUxMzY4LDUxMzY4LDExLDUxODE2LDUxODE2LDExLDUyMjY0LDUyMjY0LDExLDUyNzEyLDUyNzEyLDExLDUzMTYwLDUzMTYwLDExLDUzNjA4LDUzNjA4LDExLDU0MDU2LDU0MDU2LDExLDU0NTA0LDU0NTA0LDExLDU0OTUyLDU0OTUyLDExLDY4MTA4LDY4MTExLDUsNjk5MzMsNjk5NDAsNSw3MDE5Nyw3MDE5Nyw3LDcwNDk4LDcwNDk5LDcsNzA4NDUsNzA4NDUsNSw3MTIyOSw3MTIyOSw1LDcxNzI3LDcxNzM1LDUsNzIxNTQsNzIxNTUsNSw3MjM0NCw3MjM0NSw1LDczMDIzLDczMDI5LDUsOTQwOTUsOTQwOTgsNSwxMjE0MDMsMTIxNDUyLDUsMTI2OTgxLDEyNzE4MiwxNCwxMjc1MzgsMTI3NTQ2LDE0LDEyNzk5MCwxMjc5OTAsMTQsMTI4MzkxLDEyODM5MSwxNCwxMjg0NDUsMTI4NDQ5LDE0LDEyODUwMCwxMjg1MDUsMTQsMTI4NzUyLDEyODc1MiwxNCwxMjkxNjAsMTI5MTY3LDE0LDEyOTM1NiwxMjkzNTYsMTQsMTI5NDMyLDEyOTQ0MiwxNCwxMjk2NDgsMTI5NjUxLDE0LDEyOTc1MSwxMzEwNjksMTQsMTczLDE3Myw0LDE3NTcsMTc1NywxLDIyNzQsMjI3NCwxLDI0OTQsMjQ5NCw1LDI2NDEsMjY0MSw1LDI4NzYsMjg3Niw1LDMwMTQsMzAxNiw3LDMyNjIsMzI2Miw3LDMzOTMsMzM5Niw1LDM1NzAsMzU3MSw3LDM5NjgsMzk3Miw1LDQyMjgsNDIyOCw3LDYwODYsNjA4Niw1LDY2NzksNjY4MCw1LDY5MTIsNjkxNSw1LDcwODAsNzA4MSw1LDczODAsNzM5Miw1LDgyNTIsODI1MiwxNCw5MDk2LDkwOTYsMTQsOTc0OCw5NzQ5LDE0LDk3ODQsOTc4NiwxNCw5ODMzLDk4NTAsMTQsOTg5MCw5ODk0LDE0LDk5MzgsOTkzOCwxNCw5OTk5LDk5OTksMTQsMTAwODUsMTAwODcsMTQsMTIzNDksMTIzNDksMTQsNDMxMzYsNDMxMzcsNyw0MzQ1NCw0MzQ1Niw3LDQzNzU1LDQzNzU1LDcsNDQwODgsNDQwODgsMTEsNDQzMTIsNDQzMTIsMTEsNDQ1MzYsNDQ1MzYsMTEsNDQ3NjAsNDQ3NjAsMTEsNDQ5ODQsNDQ5ODQsMTEsNDUyMDgsNDUyMDgsMTEsNDU0MzIsNDU0MzIsMTEsNDU2NTYsNDU2NTYsMTEsNDU4ODAsNDU4ODAsMTEsNDYxMDQsNDYxMDQsMTEsNDYzMjgsNDYzMjgsMTEsNDY1NTIsNDY1NTIsMTEsNDY3NzYsNDY3NzYsMTEsNDcwMDAsNDcwMDAsMTEsNDcyMjQsNDcyMjQsMTEsNDc0NDgsNDc0NDgsMTEsNDc2NzIsNDc2NzIsMTEsNDc4OTYsNDc4OTYsMTEsNDgxMjAsNDgxMjAsMTEsNDgzNDQsNDgzNDQsMTEsNDg1NjgsNDg1NjgsMTEsNDg3OTIsNDg3OTIsMTEsNDkwMTYsNDkwMTYsMTEsNDkyNDAsNDkyNDAsMTEsNDk0NjQsNDk0NjQsMTEsNDk2ODgsNDk2ODgsMTEsNDk5MTIsNDk5MTIsMTEsNTAxMzYsNTAxMzYsMTEsNTAzNjAsNTAzNjAsMTEsNTA1ODQsNTA1ODQsMTEsNTA4MDgsNTA4MDgsMTEsNTEwMzIsNTEwMzIsMTEsNTEyNTYsNTEyNTYsMTEsNTE0ODAsNTE0ODAsMTEsNTE3MDQsNTE3MDQsMTEsNTE5MjgsNTE5MjgsMTEsNTIxNTIsNTIxNTIsMTEsNTIzNzYsNTIzNzYsMTEsNTI2MDAsNTI2MDAsMTEsNTI4MjQsNTI4MjQsMTEsNTMwNDgsNTMwNDgsMTEsNTMyNzIsNTMyNzIsMTEsNTM0OTYsNTM0OTYsMTEsNTM3MjAsNTM3MjAsMTEsNTM5NDQsNTM5NDQsMTEsNTQxNjgsNTQxNjgsMTEsNTQzOTIsNTQzOTIsMTEsNTQ2MTYsNTQ2MTYsMTEsNTQ4NDAsNTQ4NDAsMTEsNTUwNjQsNTUwNjQsMTEsNjU0MzgsNjU0MzksNSw2OTYzMyw2OTYzMyw1LDY5ODM3LDY5ODM3LDEsNzAwMTgsNzAwMTgsNyw3MDE4OCw3MDE5MCw3LDcwMzY4LDcwMzcwLDcsNzA0NjUsNzA0NjgsNyw3MDcxMiw3MDcxOSw1LDcwODM1LDcwODQwLDUsNzA4NTAsNzA4NTEsNSw3MTEzMiw3MTEzMyw1LDcxMzQwLDcxMzQwLDcsNzE0NTgsNzE0NjEsNSw3MTk4NSw3MTk4OSw3LDcyMDAyLDcyMDAyLDcsNzIxOTMsNzIyMDIsNSw3MjI4MSw3MjI4Myw1LDcyNzY2LDcyNzY2LDcsNzI4ODUsNzI4ODYsNSw3MzEwNCw3MzEwNSw1LDkyOTEyLDkyOTE2LDUsMTEzODI0LDExMzgyNyw0LDExOTE3MywxMTkxNzksNSwxMjE1MDUsMTIxNTE5LDUsMTI1MTM2LDEyNTE0Miw1LDEyNzI3OSwxMjcyNzksMTQsMTI3NDg5LDEyNzQ5MCwxNCwxMjc1NzAsMTI3NzQzLDE0LDEyNzkwMCwxMjc5MDEsMTQsMTI4MjU0LDEyODI1NCwxNCwxMjgzNjksMTI4MzcwLDE0LDEyODQwMCwxMjg0MDAsMTQsMTI4NDI1LDEyODQzMiwxNCwxMjg0NjgsMTI4NDc1LDE0LDEyODQ4OSwxMjg0OTQsMTQsMTI4NzE1LDEyODcyMCwxNCwxMjg3NDUsMTI4NzQ1LDE0LDEyODc1OSwxMjg3NjAsMTQsMTI5MDA0LDEyOTAyMywxNCwxMjkyOTYsMTI5MzA0LDE0LDEyOTM0MCwxMjkzNDIsMTQsMTI5Mzg4LDEyOTM5MiwxNCwxMjk0MDQsMTI5NDA3LDE0LDEyOTQ1NCwxMjk0NTUsMTQsMTI5NDg1LDEyOTQ4NywxNCwxMjk2NTksMTI5NjYzLDE0LDEyOTcxOSwxMjk3MjcsMTQsOTE3NTM2LDkxNzYzMSw1LDEzLDEzLDIsMTE2MCwxMTYxLDUsMTU2NCwxNTY0LDQsMTgwNywxODA3LDEsMjA4NSwyMDg3LDUsMjM2MywyMzYzLDcsMjQwMiwyNDAzLDUsMjUwNywyNTA4LDcsMjYyMiwyNjI0LDcsMjY5MSwyNjkxLDcsMjc4NiwyNzg3LDUsMjg4MSwyODg0LDUsMzAwNiwzMDA2LDUsMzA3MiwzMDcyLDUsMzE3MCwzMTcxLDUsMzI2NywzMjY4LDcsMzMzMCwzMzMxLDcsMzQwNiwzNDA2LDEsMzUzOCwzNTQwLDUsMzY1NSwzNjYyLDUsMzg5NywzODk3LDUsNDAzOCw0MDM4LDUsNDE4NCw0MTg1LDUsNDM1Miw0NDQ3LDgsNjA2OCw2MDY5LDUsNjE1NSw2MTU3LDUsNjQ0OCw2NDQ5LDcsNjc0Miw2NzQyLDUsNjc4Myw2NzgzLDUsNjk2Niw2OTcwLDUsNzA0Miw3MDQyLDcsNzE0Myw3MTQzLDcsNzIxMiw3MjE5LDUsNzQxMiw3NDEyLDUsODIwNiw4MjA3LDQsODI5NCw4MzAzLDQsODU5Niw4NjAxLDE0LDk0MTAsOTQxMCwxNCw5NzQyLDk3NDIsMTQsOTc1Nyw5NzU3LDE0LDk3NzAsOTc3MCwxNCw5Nzk0LDk3OTQsMTQsOTgyOCw5ODI4LDE0LDk4NTUsOTg1NSwxNCw5ODgyLDk4ODIsMTQsOTkwMCw5OTAzLDE0LDk5MjksOTkzMywxNCw5OTYzLDk5NjcsMTQsOTk4Nyw5OTg4LDE0LDEwMDA2LDEwMDA2LDE0LDEwMDYyLDEwMDYyLDE0LDEwMTc1LDEwMTc1LDE0LDExNzQ0LDExNzc1LDUsNDI2MDcsNDI2MDcsNSw0MzA0Myw0MzA0NCw3LDQzMjYzLDQzMjYzLDUsNDM0NDQsNDM0NDUsNyw0MzU2OSw0MzU3MCw1LDQzNjk4LDQzNzAwLDUsNDM3NjYsNDM3NjYsNSw0NDAzMiw0NDAzMiwxMSw0NDE0NCw0NDE0NCwxMSw0NDI1Niw0NDI1NiwxMSw0NDM2OCw0NDM2OCwxMSw0NDQ4MCw0NDQ4MCwxMSw0NDU5Miw0NDU5MiwxMSw0NDcwNCw0NDcwNCwxMSw0NDgxNiw0NDgxNiwxMSw0NDkyOCw0NDkyOCwxMSw0NTA0MCw0NTA0MCwxMSw0NTE1Miw0NTE1MiwxMSw0NTI2NCw0NTI2NCwxMSw0NTM3Niw0NTM3NiwxMSw0NTQ4OCw0NTQ4OCwxMSw0NTYwMCw0NTYwMCwxMSw0NTcxMiw0NTcxMiwxMSw0NTgyNCw0NTgyNCwxMSw0NTkzNiw0NTkzNiwxMSw0NjA0OCw0NjA0OCwxMSw0NjE2MCw0NjE2MCwxMSw0NjI3Miw0NjI3MiwxMSw0NjM4NCw0NjM4NCwxMSw0NjQ5Niw0NjQ5NiwxMSw0NjYwOCw0NjYwOCwxMSw0NjcyMCw0NjcyMCwxMSw0NjgzMiw0NjgzMiwxMSw0Njk0NCw0Njk0NCwxMSw0NzA1Niw0NzA1NiwxMSw0NzE2OCw0NzE2OCwxMSw0NzI4MCw0NzI4MCwxMSw0NzM5Miw0NzM5MiwxMSw0NzUwNCw0NzUwNCwxMSw0NzYxNiw0NzYxNiwxMSw0NzcyOCw0NzcyOCwxMSw0Nzg0MCw0Nzg0MCwxMSw0Nzk1Miw0Nzk1MiwxMSw0ODA2NCw0ODA2NCwxMSw0ODE3Niw0ODE3NiwxMSw0ODI4OCw0ODI4OCwxMSw0ODQwMCw0ODQwMCwxMSw0ODUxMiw0ODUxMiwxMSw0ODYyNCw0ODYyNCwxMSw0ODczNiw0ODczNiwxMSw0ODg0OCw0ODg0OCwxMSw0ODk2MCw0ODk2MCwxMSw0OTA3Miw0OTA3MiwxMSw0OTE4NCw0OTE4NCwxMSw0OTI5Niw0OTI5NiwxMSw0OTQwOCw0OTQwOCwxMSw0OTUyMCw0OTUyMCwxMSw0OTYzMiw0OTYzMiwxMSw0OTc0NCw0OTc0NCwxMSw0OTg1Niw0OTg1NiwxMSw0OTk2OCw0OTk2OCwxMSw1MDA4MCw1MDA4MCwxMSw1MDE5Miw1MDE5MiwxMSw1MDMwNCw1MDMwNCwxMSw1MDQxNiw1MDQxNiwxMSw1MDUyOCw1MDUyOCwxMSw1MDY0MCw1MDY0MCwxMSw1MDc1Miw1MDc1MiwxMSw1MDg2NCw1MDg2NCwxMSw1MDk3Niw1MDk3NiwxMSw1MTA4OCw1MTA4OCwxMSw1MTIwMCw1MTIwMCwxMSw1MTMxMiw1MTMxMiwxMSw1MTQyNCw1MTQyNCwxMSw1MTUzNiw1MTUzNiwxMSw1MTY0OCw1MTY0OCwxMSw1MTc2MCw1MTc2MCwxMSw1MTg3Miw1MTg3MiwxMSw1MTk4NCw1MTk4NCwxMSw1MjA5Niw1MjA5NiwxMSw1MjIwOCw1MjIwOCwxMSw1MjMyMCw1MjMyMCwxMSw1MjQzMiw1MjQzMiwxMSw1MjU0NCw1MjU0NCwxMSw1MjY1Niw1MjY1NiwxMSw1Mjc2OCw1Mjc2OCwxMSw1Mjg4MCw1Mjg4MCwxMSw1Mjk5Miw1Mjk5MiwxMSw1MzEwNCw1MzEwNCwxMSw1MzIxNiw1MzIxNiwxMSw1MzMyOCw1MzMyOCwxMSw1MzQ0MCw1MzQ0MCwxMSw1MzU1Miw1MzU1MiwxMSw1MzY2NCw1MzY2NCwxMSw1Mzc3Niw1Mzc3NiwxMSw1Mzg4OCw1Mzg4OCwxMSw1NDAwMCw1NDAwMCwxMSw1NDExMiw1NDExMiwxMSw1NDIyNCw1NDIyNCwxMSw1NDMzNiw1NDMzNiwxMSw1NDQ0OCw1NDQ0OCwxMSw1NDU2MCw1NDU2MCwxMSw1NDY3Miw1NDY3MiwxMSw1NDc4NCw1NDc4NCwxMSw1NDg5Niw1NDg5NiwxMSw1NTAwOCw1NTAwOCwxMSw1NTEyMCw1NTEyMCwxMSw2NDI4Niw2NDI4Niw1LDY2MjcyLDY2MjcyLDUsNjg5MDAsNjg5MDMsNSw2OTc2Miw2OTc2Miw3LDY5ODE3LDY5ODE4LDUsNjk5MjcsNjk5MzEsNSw3MDAwMyw3MDAwMyw1LDcwMDcwLDcwMDc4LDUsNzAwOTQsNzAwOTQsNyw3MDE5NCw3MDE5NSw3LDcwMjA2LDcwMjA2LDUsNzA0MDAsNzA0MDEsNSw3MDQ2Myw3MDQ2Myw3LDcwNDc1LDcwNDc3LDcsNzA1MTIsNzA1MTYsNSw3MDcyMiw3MDcyNCw1LDcwODMyLDcwODMyLDUsNzA4NDIsNzA4NDIsNSw3MDg0Nyw3MDg0OCw1LDcxMDg4LDcxMDg5LDcsNzExMDIsNzExMDIsNyw3MTIxOSw3MTIyNiw1LDcxMjMxLDcxMjMyLDUsNzEzNDIsNzEzNDMsNyw3MTQ1Myw3MTQ1NSw1LDcxNDYzLDcxNDY3LDUsNzE3MzcsNzE3MzgsNSw3MTk5NSw3MTk5Niw1LDcyMDAwLDcyMDAwLDcsNzIxNDUsNzIxNDcsNyw3MjE2MCw3MjE2MCw1LDcyMjQ5LDcyMjQ5LDcsNzIyNzMsNzIyNzgsNSw3MjMzMCw3MjM0Miw1LDcyNzUyLDcyNzU4LDUsNzI4NTAsNzI4NzEsNSw3Mjg4Miw3Mjg4Myw1LDczMDE4LDczMDE4LDUsNzMwMzEsNzMwMzEsNSw3MzEwOSw3MzEwOSw1LDczNDYxLDczNDYyLDcsOTQwMzEsOTQwMzEsNSw5NDE5Miw5NDE5Myw3LDExOTE0MiwxMTkxNDIsNywxMTkxNTUsMTE5MTYyLDQsMTE5MzYyLDExOTM2NCw1LDEyMTQ3NiwxMjE0NzYsNSwxMjI4ODgsMTIyOTA0LDUsMTIzMTg0LDEyMzE5MCw1LDEyNjk3NiwxMjY5NzksMTQsMTI3MTg0LDEyNzIzMSwxNCwxMjczNDQsMTI3MzQ1LDE0LDEyNzQwNSwxMjc0NjEsMTQsMTI3NTE0LDEyNzUxNCwxNCwxMjc1NjEsMTI3NTY3LDE0LDEyNzc3OCwxMjc3NzksMTQsMTI3ODk2LDEyNzg5NiwxNCwxMjc5ODUsMTI3OTg2LDE0LDEyNzk5NSwxMjc5OTksNSwxMjgzMjYsMTI4MzI4LDE0LDEyODM2MCwxMjgzNjYsMTQsMTI4Mzc4LDEyODM3OCwxNCwxMjgzOTQsMTI4Mzk3LDE0LDEyODQwNSwxMjg0MDYsMTQsMTI4NDIyLDEyODQyMywxNCwxMjg0MzUsMTI4NDQzLDE0LDEyODQ1MywxMjg0NjQsMTQsMTI4NDc5LDEyODQ4MCwxNCwxMjg0ODQsMTI4NDg3LDE0LDEyODQ5NiwxMjg0OTgsMTQsMTI4NjQwLDEyODcwOSwxNCwxMjg3MjMsMTI4NzI0LDE0LDEyODczNiwxMjg3NDEsMTQsMTI4NzQ3LDEyODc0OCwxNCwxMjg3NTUsMTI4NzU1LDE0LDEyODc2MiwxMjg3NjIsMTQsMTI4OTgxLDEyODk5MSwxNCwxMjkwOTYsMTI5MTAzLDE0LDEyOTI5MiwxMjkyOTIsMTQsMTI5MzExLDEyOTMxMSwxNCwxMjkzMjksMTI5MzMwLDE0LDEyOTM0NCwxMjkzNDksMTQsMTI5MzYwLDEyOTM3NCwxNCwxMjkzOTQsMTI5Mzk0LDE0LDEyOTQwMiwxMjk0MDIsMTQsMTI5NDEzLDEyOTQyNSwxNCwxMjk0NDUsMTI5NDUwLDE0LDEyOTQ2NiwxMjk0NzEsMTQsMTI5NDgzLDEyOTQ4MywxNCwxMjk1MTEsMTI5NTM1LDE0LDEyOTY1MywxMjk2NTUsMTQsMTI5NjY3LDEyOTY3MCwxNCwxMjk3MDUsMTI5NzExLDE0LDEyOTczMSwxMjk3NDMsMTQsOTE3NTA1LDkxNzUwNSw0LDkxNzc2MCw5MTc5OTksNSwxMCwxMCwzLDEyNywxNTksNCw3NjgsODc5LDUsMTQ3MSwxNDcxLDUsMTUzNiwxNTQxLDEsMTY0OCwxNjQ4LDUsMTc2NywxNzY4LDUsMTg0MCwxODY2LDUsMjA3MCwyMDczLDUsMjEzNywyMTM5LDUsMjMwNywyMzA3LDcsMjM2NiwyMzY4LDcsMjM4MiwyMzgzLDcsMjQzNCwyNDM1LDcsMjQ5NywyNTAwLDUsMjUxOSwyNTE5LDUsMjU2MywyNTYzLDcsMjYzMSwyNjMyLDUsMjY3NywyNjc3LDUsMjc1MCwyNzUyLDcsMjc2MywyNzY0LDcsMjgxNywyODE3LDUsMjg3OSwyODc5LDUsMjg5MSwyODkyLDcsMjkxNCwyOTE1LDUsMzAwOCwzMDA4LDUsMzAyMSwzMDIxLDUsMzA3NiwzMDc2LDUsMzE0NiwzMTQ5LDUsMzIwMiwzMjAzLDcsMzI2NCwzMjY1LDcsMzI3MSwzMjcyLDcsMzI5OCwzMjk5LDUsMzM5MCwzMzkwLDUsMzQwMiwzNDA0LDcsMzQyNiwzNDI3LDUsMzUzNSwzNTM1LDUsMzU0NCwzNTUwLDcsMzYzNSwzNjM1LDcsMzc2MywzNzYzLDcsMzg5MywzODkzLDUsMzk1MywzOTY2LDUsMzk4MSwzOTkxLDUsNDE0NSw0MTQ1LDcsNDE1Nyw0MTU4LDUsNDIwOSw0MjEyLDUsNDIzNyw0MjM3LDUsNDUyMCw0NjA3LDEwLDU5NzAsNTk3MSw1LDYwNzEsNjA3Nyw1LDYwODksNjA5OSw1LDYyNzcsNjI3OCw1LDY0MzksNjQ0MCw1LDY0NTEsNjQ1Niw3LDY2ODMsNjY4Myw1LDY3NDQsNjc1MCw1LDY3NjUsNjc3MCw3LDY4NDYsNjg0Niw1LDY5NjQsNjk2NCw1LDY5NzIsNjk3Miw1LDcwMTksNzAyNyw1LDcwNzQsNzA3Nyw1LDcwODMsNzA4NSw1LDcxNDYsNzE0OCw3LDcxNTQsNzE1NSw3LDcyMjIsNzIyMyw1LDczOTQsNzQwMCw1LDc0MTYsNzQxNyw1LDgyMDQsODIwNCw1LDgyMzMsODIzMyw0LDgyODgsODI5Miw0LDg0MTMsODQxNiw1LDg0ODIsODQ4MiwxNCw4OTg2LDg5ODcsMTQsOTE5Myw5MjAzLDE0LDk2NTQsOTY1NCwxNCw5NzMzLDk3MzMsMTQsOTc0NSw5NzQ1LDE0LDk3NTIsOTc1MiwxNCw5NzYwLDk3NjAsMTQsOTc2Niw5NzY2LDE0LDk3NzQsOTc3NSwxNCw5NzkyLDk3OTIsMTQsOTgwMCw5ODExLDE0LDk4MjUsOTgyNiwxNCw5ODMxLDk4MzEsMTQsOTg1Miw5ODUzLDE0LDk4NzIsOTg3MywxNCw5ODgwLDk4ODAsMTQsOTg4NSw5ODg3LDE0LDk4OTYsOTg5NywxNCw5OTA2LDk5MTYsMTQsOTkyNiw5OTI3LDE0LDk5MzYsOTkzNiwxNCw5OTQxLDk5NjAsMTQsOTk3NCw5OTc0LDE0LDk5ODIsOTk4NSwxNCw5OTkyLDk5OTcsMTQsMTAwMDIsMTAwMDIsMTQsMTAwMTcsMTAwMTcsMTQsMTAwNTUsMTAwNTUsMTQsMTAwNzEsMTAwNzEsMTQsMTAxNDUsMTAxNDUsMTQsMTEwMTMsMTEwMTUsMTQsMTE1MDMsMTE1MDUsNSwxMjMzNCwxMjMzNSw1LDEyOTUxLDEyOTUxLDE0LDQyNjEyLDQyNjIxLDUsNDMwMTQsNDMwMTQsNSw0MzA0Nyw0MzA0Nyw3LDQzMjA0LDQzMjA1LDUsNDMzMzUsNDMzNDUsNSw0MzM5NSw0MzM5NSw3LDQzNDUwLDQzNDUxLDcsNDM1NjEsNDM1NjYsNSw0MzU3Myw0MzU3NCw1LDQzNjQ0LDQzNjQ0LDUsNDM3MTAsNDM3MTEsNSw0Mzc1OCw0Mzc1OSw3LDQ0MDA1LDQ0MDA1LDUsNDQwMTIsNDQwMTIsNyw0NDA2MCw0NDA2MCwxMSw0NDExNiw0NDExNiwxMSw0NDE3Miw0NDE3MiwxMSw0NDIyOCw0NDIyOCwxMSw0NDI4NCw0NDI4NCwxMSw0NDM0MCw0NDM0MCwxMSw0NDM5Niw0NDM5NiwxMSw0NDQ1Miw0NDQ1MiwxMSw0NDUwOCw0NDUwOCwxMSw0NDU2NCw0NDU2NCwxMSw0NDYyMCw0NDYyMCwxMSw0NDY3Niw0NDY3NiwxMSw0NDczMiw0NDczMiwxMSw0NDc4OCw0NDc4OCwxMSw0NDg0NCw0NDg0NCwxMSw0NDkwMCw0NDkwMCwxMSw0NDk1Niw0NDk1NiwxMSw0NTAxMiw0NTAxMiwxMSw0NTA2OCw0NTA2OCwxMSw0NTEyNCw0NTEyNCwxMSw0NTE4MCw0NTE4MCwxMSw0NTIzNiw0NTIzNiwxMSw0NTI5Miw0NTI5MiwxMSw0NTM0OCw0NTM0OCwxMSw0NTQwNCw0NTQwNCwxMSw0NTQ2MCw0NTQ2MCwxMSw0NTUxNiw0NTUxNiwxMSw0NTU3Miw0NTU3MiwxMSw0NTYyOCw0NTYyOCwxMSw0NTY4NCw0NTY4NCwxMSw0NTc0MCw0NTc0MCwxMSw0NTc5Niw0NTc5NiwxMSw0NTg1Miw0NTg1MiwxMSw0NTkwOCw0NTkwOCwxMSw0NTk2NCw0NTk2NCwxMSw0NjAyMCw0NjAyMCwxMSw0NjA3Niw0NjA3NiwxMSw0NjEzMiw0NjEzMiwxMSw0NjE4OCw0NjE4OCwxMSw0NjI0NCw0NjI0NCwxMSw0NjMwMCw0NjMwMCwxMSw0NjM1Niw0NjM1NiwxMSw0NjQxMiw0NjQxMiwxMSw0NjQ2OCw0NjQ2OCwxMSw0NjUyNCw0NjUyNCwxMSw0NjU4MCw0NjU4MCwxMSw0NjYzNiw0NjYzNiwxMSw0NjY5Miw0NjY5MiwxMSw0Njc0OCw0Njc0OCwxMSw0NjgwNCw0NjgwNCwxMSw0Njg2MCw0Njg2MCwxMSw0NjkxNiw0NjkxNiwxMSw0Njk3Miw0Njk3MiwxMSw0NzAyOCw0NzAyOCwxMSw0NzA4NCw0NzA4NCwxMSw0NzE0MCw0NzE0MCwxMSw0NzE5Niw0NzE5NiwxMSw0NzI1Miw0NzI1MiwxMSw0NzMwOCw0NzMwOCwxMSw0NzM2NCw0NzM2NCwxMSw0NzQyMCw0NzQyMCwxMSw0NzQ3Niw0NzQ3NiwxMSw0NzUzMiw0NzUzMiwxMSw0NzU4OCw0NzU4OCwxMSw0NzY0NCw0NzY0NCwxMSw0NzcwMCw0NzcwMCwxMSw0Nzc1Niw0Nzc1NiwxMSw0NzgxMiw0NzgxMiwxMSw0Nzg2OCw0Nzg2OCwxMSw0NzkyNCw0NzkyNCwxMSw0Nzk4MCw0Nzk4MCwxMSw0ODAzNiw0ODAzNiwxMSw0ODA5Miw0ODA5MiwxMSw0ODE0OCw0ODE0OCwxMSw0ODIwNCw0ODIwNCwxMSw0ODI2MCw0ODI2MCwxMSw0ODMxNiw0ODMxNiwxMSw0ODM3Miw0ODM3MiwxMSw0ODQyOCw0ODQyOCwxMSw0ODQ4NCw0ODQ4NCwxMSw0ODU0MCw0ODU0MCwxMSw0ODU5Niw0ODU5NiwxMSw0ODY1Miw0ODY1MiwxMSw0ODcwOCw0ODcwOCwxMSw0ODc2NCw0ODc2NCwxMSw0ODgyMCw0ODgyMCwxMSw0ODg3Niw0ODg3NiwxMSw0ODkzMiw0ODkzMiwxMSw0ODk4OCw0ODk4OCwxMSw0OTA0NCw0OTA0NCwxMSw0OTEwMCw0OTEwMCwxMSw0OTE1Niw0OTE1NiwxMSw0OTIxMiw0OTIxMiwxMSw0OTI2OCw0OTI2OCwxMSw0OTMyNCw0OTMyNCwxMSw0OTM4MCw0OTM4MCwxMSw0OTQzNiw0OTQzNiwxMSw0OTQ5Miw0OTQ5MiwxMSw0OTU0OCw0OTU0OCwxMSw0OTYwNCw0OTYwNCwxMSw0OTY2MCw0OTY2MCwxMSw0OTcxNiw0OTcxNiwxMSw0OTc3Miw0OTc3MiwxMSw0OTgyOCw0OTgyOCwxMSw0OTg4NCw0OTg4NCwxMSw0OTk0MCw0OTk0MCwxMSw0OTk5Niw0OTk5NiwxMSw1MDA1Miw1MDA1MiwxMSw1MDEwOCw1MDEwOCwxMSw1MDE2NCw1MDE2NCwxMSw1MDIyMCw1MDIyMCwxMSw1MDI3Niw1MDI3NiwxMSw1MDMzMiw1MDMzMiwxMSw1MDM4OCw1MDM4OCwxMSw1MDQ0NCw1MDQ0NCwxMSw1MDUwMCw1MDUwMCwxMSw1MDU1Niw1MDU1NiwxMSw1MDYxMiw1MDYxMiwxMSw1MDY2OCw1MDY2OCwxMSw1MDcyNCw1MDcyNCwxMSw1MDc4MCw1MDc4MCwxMSw1MDgzNiw1MDgzNiwxMSw1MDg5Miw1MDg5MiwxMSw1MDk0OCw1MDk0OCwxMSw1MTAwNCw1MTAwNCwxMSw1MTA2MCw1MTA2MCwxMSw1MTExNiw1MTExNiwxMSw1MTE3Miw1MTE3MiwxMSw1MTIyOCw1MTIyOCwxMSw1MTI4NCw1MTI4NCwxMSw1MTM0MCw1MTM0MCwxMSw1MTM5Niw1MTM5NiwxMSw1MTQ1Miw1MTQ1MiwxMSw1MTUwOCw1MTUwOCwxMSw1MTU2NCw1MTU2NCwxMSw1MTYyMCw1MTYyMCwxMSw1MTY3Niw1MTY3NiwxMSw1MTczMiw1MTczMiwxMSw1MTc4OCw1MTc4OCwxMSw1MTg0NCw1MTg0NCwxMSw1MTkwMCw1MTkwMCwxMSw1MTk1Niw1MTk1NiwxMSw1MjAxMiw1MjAxMiwxMSw1MjA2OCw1MjA2OCwxMSw1MjEyNCw1MjEyNCwxMSw1MjE4MCw1MjE4MCwxMSw1MjIzNiw1MjIzNiwxMSw1MjI5Miw1MjI5MiwxMSw1MjM0OCw1MjM0OCwxMSw1MjQwNCw1MjQwNCwxMSw1MjQ2MCw1MjQ2MCwxMSw1MjUxNiw1MjUxNiwxMSw1MjU3Miw1MjU3MiwxMSw1MjYyOCw1MjYyOCwxMSw1MjY4NCw1MjY4NCwxMSw1Mjc0MCw1Mjc0MCwxMSw1Mjc5Niw1Mjc5NiwxMSw1Mjg1Miw1Mjg1MiwxMSw1MjkwOCw1MjkwOCwxMSw1Mjk2NCw1Mjk2NCwxMSw1MzAyMCw1MzAyMCwxMSw1MzA3Niw1MzA3NiwxMSw1MzEzMiw1MzEzMiwxMSw1MzE4OCw1MzE4OCwxMSw1MzI0NCw1MzI0NCwxMSw1MzMwMCw1MzMwMCwxMSw1MzM1Niw1MzM1NiwxMSw1MzQxMiw1MzQxMiwxMSw1MzQ2OCw1MzQ2OCwxMSw1MzUyNCw1MzUyNCwxMSw1MzU4MCw1MzU4MCwxMSw1MzYzNiw1MzYzNiwxMSw1MzY5Miw1MzY5MiwxMSw1Mzc0OCw1Mzc0OCwxMSw1MzgwNCw1MzgwNCwxMSw1Mzg2MCw1Mzg2MCwxMSw1MzkxNiw1MzkxNiwxMSw1Mzk3Miw1Mzk3MiwxMSw1NDAyOCw1NDAyOCwxMSw1NDA4NCw1NDA4NCwxMSw1NDE0MCw1NDE0MCwxMSw1NDE5Niw1NDE5NiwxMSw1NDI1Miw1NDI1MiwxMSw1NDMwOCw1NDMwOCwxMSw1NDM2NCw1NDM2NCwxMSw1NDQyMCw1NDQyMCwxMSw1NDQ3Niw1NDQ3NiwxMSw1NDUzMiw1NDUzMiwxMSw1NDU4OCw1NDU4OCwxMSw1NDY0NCw1NDY0NCwxMSw1NDcwMCw1NDcwMCwxMSw1NDc1Niw1NDc1NiwxMSw1NDgxMiw1NDgxMiwxMSw1NDg2OCw1NDg2OCwxMSw1NDkyNCw1NDkyNCwxMSw1NDk4MCw1NDk4MCwxMSw1NTAzNiw1NTAzNiwxMSw1NTA5Miw1NTA5MiwxMSw1NTE0OCw1NTE0OCwxMSw1NTIxNiw1NTIzOCw5LDY1MDU2LDY1MDcxLDUsNjU1MjksNjU1MzEsNCw2ODA5Nyw2ODA5OSw1LDY4MTU5LDY4MTU5LDUsNjk0NDYsNjk0NTYsNSw2OTY4OCw2OTcwMiw1LDY5ODA4LDY5ODEwLDcsNjk4MTUsNjk4MTYsNyw2OTgyMSw2OTgyMSwxLDY5ODg4LDY5ODkwLDUsNjk5MzIsNjk5MzIsNyw2OTk1Nyw2OTk1OCw3LDcwMDE2LDcwMDE3LDUsNzAwNjcsNzAwNjksNyw3MDA3OSw3MDA4MCw3LDcwMDg5LDcwMDkyLDUsNzAwOTUsNzAwOTUsNSw3MDE5MSw3MDE5Myw1LDcwMTk2LDcwMTk2LDUsNzAxOTgsNzAxOTksNSw3MDM2Nyw3MDM2Nyw1LDcwMzcxLDcwMzc4LDUsNzA0MDIsNzA0MDMsNyw3MDQ2Miw3MDQ2Miw1LDcwNDY0LDcwNDY0LDUsNzA0NzEsNzA0NzIsNyw3MDQ4Nyw3MDQ4Nyw1LDcwNTAyLDcwNTA4LDUsNzA3MDksNzA3MTEsNyw3MDcyMCw3MDcyMSw3LDcwNzI1LDcwNzI1LDcsNzA3NTAsNzA3NTAsNSw3MDgzMyw3MDgzNCw3LDcwODQxLDcwODQxLDcsNzA4NDMsNzA4NDQsNyw3MDg0Niw3MDg0Niw3LDcwODQ5LDcwODQ5LDcsNzEwODcsNzEwODcsNSw3MTA5MCw3MTA5Myw1LDcxMTAwLDcxMTAxLDUsNzExMDMsNzExMDQsNSw3MTIxNiw3MTIxOCw3LDcxMjI3LDcxMjI4LDcsNzEyMzAsNzEyMzAsNyw3MTMzOSw3MTMzOSw1LDcxMzQxLDcxMzQxLDUsNzEzNDQsNzEzNDksNSw3MTM1MSw3MTM1MSw1LDcxNDU2LDcxNDU3LDcsNzE0NjIsNzE0NjIsNyw3MTcyNCw3MTcyNiw3LDcxNzM2LDcxNzM2LDcsNzE5ODQsNzE5ODQsNSw3MTk5MSw3MTk5Miw3LDcxOTk3LDcxOTk3LDcsNzE5OTksNzE5OTksMSw3MjAwMSw3MjAwMSwxLDcyMDAzLDcyMDAzLDUsNzIxNDgsNzIxNTEsNSw3MjE1Niw3MjE1OSw3LDcyMTY0LDcyMTY0LDcsNzIyNDMsNzIyNDgsNSw3MjI1MCw3MjI1MCwxLDcyMjYzLDcyMjYzLDUsNzIyNzksNzIyODAsNyw3MjMyNCw3MjMyOSwxLDcyMzQzLDcyMzQzLDcsNzI3NTEsNzI3NTEsNyw3Mjc2MCw3Mjc2NSw1LDcyNzY3LDcyNzY3LDUsNzI4NzMsNzI4NzMsNyw3Mjg4MSw3Mjg4MSw3LDcyODg0LDcyODg0LDcsNzMwMDksNzMwMTQsNSw3MzAyMCw3MzAyMSw1LDczMDMwLDczMDMwLDEsNzMwOTgsNzMxMDIsNyw3MzEwNyw3MzEwOCw3LDczMTEwLDczMTEwLDcsNzM0NTksNzM0NjAsNSw3ODg5Niw3ODkwNCw0LDkyOTc2LDkyOTgyLDUsOTQwMzMsOTQwODcsNyw5NDE4MCw5NDE4MCw1LDExMzgyMSwxMTM4MjIsNSwxMTkxNDEsMTE5MTQxLDUsMTE5MTQzLDExOTE0NSw1LDExOTE1MCwxMTkxNTQsNSwxMTkxNjMsMTE5MTcwLDUsMTE5MjEwLDExOTIxMyw1LDEyMTM0NCwxMjEzOTgsNSwxMjE0NjEsMTIxNDYxLDUsMTIxNDk5LDEyMTUwMyw1LDEyMjg4MCwxMjI4ODYsNSwxMjI5MDcsMTIyOTEzLDUsMTIyOTE4LDEyMjkyMiw1LDEyMzYyOCwxMjM2MzEsNSwxMjUyNTIsMTI1MjU4LDUsMTI2OTgwLDEyNjk4MCwxNCwxMjcxODMsMTI3MTgzLDE0LDEyNzI0NSwxMjcyNDcsMTQsMTI3MzQwLDEyNzM0MywxNCwxMjczNTgsMTI3MzU5LDE0LDEyNzM3NywxMjczODYsMTQsMTI3NDYyLDEyNzQ4Nyw2LDEyNzQ5MSwxMjc1MDMsMTQsMTI3NTM1LDEyNzUzNSwxNCwxMjc1NDgsMTI3NTUxLDE0LDEyNzU2OCwxMjc1NjksMTQsMTI3NzQ0LDEyNzc3NywxNCwxMjc3ODAsMTI3ODkxLDE0LDEyNzg5NCwxMjc4OTUsMTQsMTI3ODk3LDEyNzg5OSwxNCwxMjc5MDIsMTI3OTg0LDE0LDEyNzk4NywxMjc5ODksMTQsMTI3OTkxLDEyNzk5NCwxNCwxMjgwMDAsMTI4MjUzLDE0LDEyODI1NSwxMjgzMTcsMTQsMTI4MzI5LDEyODMzNCwxNCwxMjgzMzYsMTI4MzU5LDE0LDEyODM2NywxMjgzNjgsMTQsMTI4MzcxLDEyODM3NywxNCwxMjgzNzksMTI4MzkwLDE0LDEyODM5MiwxMjgzOTMsMTQsMTI4Mzk4LDEyODM5OSwxNCwxMjg0MDEsMTI4NDA0LDE0LDEyODQwNywxMjg0MTksMTQsMTI4NDIxLDEyODQyMSwxNCwxMjg0MjQsMTI4NDI0LDE0LDEyODQzMywxMjg0MzQsMTQsMTI4NDQ0LDEyODQ0NCwxNCwxMjg0NTAsMTI4NDUyLDE0LDEyODQ2NSwxMjg0NjcsMTQsMTI4NDc2LDEyODQ3OCwxNCwxMjg0ODEsMTI4NDgxLDE0LDEyODQ4MywxMjg0ODMsMTQsMTI4NDg4LDEyODQ4OCwxNCwxMjg0OTUsMTI4NDk1LDE0LDEyODQ5OSwxMjg0OTksMTQsMTI4NTA2LDEyODU5MSwxNCwxMjg3MTAsMTI4NzE0LDE0LDEyODcyMSwxMjg3MjIsMTQsMTI4NzI1LDEyODcyNSwxNCwxMjg3MjgsMTI4NzM1LDE0LDEyODc0MiwxMjg3NDQsMTQsMTI4NzQ2LDEyODc0NiwxNCwxMjg3NDksMTI4NzUxLDE0LDEyODc1MywxMjg3NTQsMTQsMTI4NzU2LDEyODc1OCwxNCwxMjg3NjEsMTI4NzYxLDE0LDEyODc2MywxMjg3NjQsMTQsMTI4ODg0LDEyODg5NSwxNCwxMjg5OTIsMTI5MDAzLDE0LDEyOTAzNiwxMjkwMzksMTQsMTI5MTE0LDEyOTExOSwxNCwxMjkxOTgsMTI5Mjc5LDE0LDEyOTI5MywxMjkyOTUsMTQsMTI5MzA1LDEyOTMxMCwxNCwxMjkzMTIsMTI5MzE5LDE0LDEyOTMyOCwxMjkzMjgsMTQsMTI5MzMxLDEyOTMzOCwxNCwxMjkzNDMsMTI5MzQzLDE0LDEyOTM1MSwxMjkzNTUsMTQsMTI5MzU3LDEyOTM1OSwxNCwxMjkzNzUsMTI5Mzg3LDE0LDEyOTM5MywxMjkzOTMsMTQsMTI5Mzk1LDEyOTM5OCwxNCwxMjk0MDEsMTI5NDAxLDE0LDEyOTQwMywxMjk0MDMsMTQsMTI5NDA4LDEyOTQxMiwxNCwxMjk0MjYsMTI5NDMxLDE0LDEyOTQ0MywxMjk0NDQsMTQsMTI5NDUxLDEyOTQ1MywxNCwxMjk0NTYsMTI5NDY1LDE0LDEyOTQ3MiwxMjk0NzIsMTQsMTI5NDc1LDEyOTQ4MiwxNCwxMjk0ODQsMTI5NDg0LDE0LDEyOTQ4OCwxMjk1MTAsMTQsMTI5NTM2LDEyOTY0NywxNCwxMjk2NTIsMTI5NjUyLDE0LDEyOTY1NiwxMjk2NTgsMTQsMTI5NjY0LDEyOTY2NiwxNCwxMjk2NzEsMTI5Njc5LDE0LDEyOTY4NiwxMjk3MDQsMTQsMTI5NzEyLDEyOTcxOCwxNCwxMjk3MjgsMTI5NzMwLDE0LDEyOTc0NCwxMjk3NTAsMTQsOTE3NTA0LDkxNzUwNCw0LDkxNzUwNiw5MTc1MzUsNCw5MTc2MzIsOTE3NzU5LDQsOTE4MDAwLDkyMTU5OSw0LDAsOSw0LDExLDEyLDQsMTQsMzEsNCwxNjksMTY5LDE0LDE3NCwxNzQsMTQsMTE1NSwxMTU5LDUsMTQyNSwxNDY5LDUsMTQ3MywxNDc0LDUsMTQ3OSwxNDc5LDUsMTU1MiwxNTYyLDUsMTYxMSwxNjMxLDUsMTc1MCwxNzU2LDUsMTc1OSwxNzY0LDUsMTc3MCwxNzczLDUsMTgwOSwxODA5LDUsMTk1OCwxOTY4LDUsMjA0NSwyMDQ1LDUsMjA3NSwyMDgzLDUsMjA4OSwyMDkzLDUsMjI1OSwyMjczLDUsMjI3NSwyMzA2LDUsMjM2MiwyMzYyLDUsMjM2NCwyMzY0LDUsMjM2OSwyMzc2LDUsMjM4MSwyMzgxLDUsMjM4NSwyMzkxLDUsMjQzMywyNDMzLDUsMjQ5MiwyNDkyLDUsMjQ5NSwyNDk2LDcsMjUwMywyNTA0LDcsMjUwOSwyNTA5LDUsMjUzMCwyNTMxLDUsMjU2MSwyNTYyLDUsMjYyMCwyNjIwLDUsMjYyNSwyNjI2LDUsMjYzNSwyNjM3LDUsMjY3MiwyNjczLDUsMjY4OSwyNjkwLDUsMjc0OCwyNzQ4LDUsMjc1MywyNzU3LDUsMjc2MSwyNzYxLDcsMjc2NSwyNzY1LDUsMjgxMCwyODE1LDUsMjgxOCwyODE5LDcsMjg3OCwyODc4LDUsMjg4MCwyODgwLDcsMjg4NywyODg4LDcsMjg5MywyODkzLDUsMjkwMywyOTAzLDUsMjk0NiwyOTQ2LDUsMzAwNywzMDA3LDcsMzAwOSwzMDEwLDcsMzAxOCwzMDIwLDcsMzAzMSwzMDMxLDUsMzA3MywzMDc1LDcsMzEzNCwzMTM2LDUsMzE0MiwzMTQ0LDUsMzE1NywzMTU4LDUsMzIwMSwzMjAxLDUsMzI2MCwzMjYwLDUsMzI2MywzMjYzLDUsMzI2NiwzMjY2LDUsMzI3MCwzMjcwLDUsMzI3NCwzMjc1LDcsMzI4NSwzMjg2LDUsMzMyOCwzMzI5LDUsMzM4NywzMzg4LDUsMzM5MSwzMzkyLDcsMzM5OCwzNDAwLDcsMzQwNSwzNDA1LDUsMzQxNSwzNDE1LDUsMzQ1NywzNDU3LDUsMzUzMCwzNTMwLDUsMzUzNiwzNTM3LDcsMzU0MiwzNTQyLDUsMzU1MSwzNTUxLDUsMzYzMywzNjMzLDUsMzYzNiwzNjQyLDUsMzc2MSwzNzYxLDUsMzc2NCwzNzcyLDUsMzg2NCwzODY1LDUsMzg5NSwzODk1LDUsMzkwMiwzOTAzLDcsMzk2NywzOTY3LDcsMzk3NCwzOTc1LDUsMzk5Myw0MDI4LDUsNDE0MSw0MTQ0LDUsNDE0Niw0MTUxLDUsNDE1NSw0MTU2LDcsNDE4Miw0MTgzLDcsNDE5MCw0MTkyLDUsNDIyNiw0MjI2LDUsNDIyOSw0MjMwLDUsNDI1Myw0MjUzLDUsNDQ0OCw0NTE5LDksNDk1Nyw0OTU5LDUsNTkzOCw1OTQwLDUsNjAwMiw2MDAzLDUsNjA3MCw2MDcwLDcsNjA3OCw2MDg1LDcsNjA4Nyw2MDg4LDcsNjEwOSw2MTA5LDUsNjE1OCw2MTU4LDQsNjMxMyw2MzEzLDUsNjQzNSw2NDM4LDcsNjQ0MSw2NDQzLDcsNjQ1MCw2NDUwLDUsNjQ1Nyw2NDU5LDUsNjY4MSw2NjgyLDcsNjc0MSw2NzQxLDcsNjc0Myw2NzQzLDcsNjc1Miw2NzUyLDUsNjc1Nyw2NzY0LDUsNjc3MSw2NzgwLDUsNjgzMiw2ODQ1LDUsNjg0Nyw2ODQ4LDUsNjkxNiw2OTE2LDcsNjk2NSw2OTY1LDUsNjk3MSw2OTcxLDcsNjk3Myw2OTc3LDcsNjk3OSw2OTgwLDcsNzA0MCw3MDQxLDUsNzA3Myw3MDczLDcsNzA3OCw3MDc5LDcsNzA4Miw3MDgyLDcsNzE0Miw3MTQyLDUsNzE0NCw3MTQ1LDUsNzE0OSw3MTQ5LDUsNzE1MSw3MTUzLDUsNzIwNCw3MjExLDcsNzIyMCw3MjIxLDcsNzM3Niw3Mzc4LDUsNzM5Myw3MzkzLDcsNzQwNSw3NDA1LDUsNzQxNSw3NDE1LDcsNzYxNiw3NjczLDUsODIwMyw4MjAzLDQsODIwNSw4MjA1LDEzLDgyMzIsODIzMiw0LDgyMzQsODIzOCw0LDgyNjUsODI2NSwxNCw4MjkzLDgyOTMsNCw4NDAwLDg0MTIsNSw4NDE3LDg0MTcsNSw4NDIxLDg0MzIsNSw4NTA1LDg1MDUsMTQsODYxNyw4NjE4LDE0LDkwMDAsOTAwMCwxNCw5MTY3LDkxNjcsMTQsOTIwOCw5MjEwLDE0LDk2NDIsOTY0MywxNCw5NjY0LDk2NjQsMTQsOTcyOCw5NzMyLDE0LDk3MzUsOTc0MSwxNCw5NzQzLDk3NDQsMTQsOTc0Niw5NzQ2LDE0LDk3NTAsOTc1MSwxNCw5NzUzLDk3NTYsMTQsOTc1OCw5NzU5LDE0LDk3NjEsOTc2MSwxNCw5NzY0LDk3NjUsMTQsOTc2Nyw5NzY5LDE0LDk3NzEsOTc3MywxNCw5Nzc2LDk3ODMsMTQsOTc4Nyw5NzkxLDE0LDk3OTMsOTc5MywxNCw5Nzk1LDk3OTksMTQsOTgxMiw5ODIyLDE0LDk4MjQsOTgyNCwxNCw5ODI3LDk4MjcsMTQsOTgyOSw5ODMwLDE0LDk4MzIsOTgzMiwxNCw5ODUxLDk4NTEsMTQsOTg1NCw5ODU0LDE0LDk4NTYsOTg2MSwxNCw5ODc0LDk4NzYsMTQsOTg3OCw5ODc5LDE0LDk4ODEsOTg4MSwxNCw5ODgzLDk4ODQsMTQsOTg4OCw5ODg5LDE0LDk4OTUsOTg5NSwxNCw5ODk4LDk4OTksMTQsOTkwNCw5OTA1LDE0LDk5MTcsOTkxOCwxNCw5OTI0LDk5MjUsMTQsOTkyOCw5OTI4LDE0LDk5MzQsOTkzNSwxNCw5OTM3LDk5MzcsMTQsOTkzOSw5OTQwLDE0LDk5NjEsOTk2MiwxNCw5OTY4LDk5NzMsMTQsOTk3NSw5OTc4LDE0LDk5ODEsOTk4MSwxNCw5OTg2LDk5ODYsMTQsOTk4OSw5OTg5LDE0LDk5OTgsOTk5OCwxNCwxMDAwMCwxMDAwMSwxNCwxMDAwNCwxMDAwNCwxNCwxMDAxMywxMDAxMywxNCwxMDAyNCwxMDAyNCwxNCwxMDA1MiwxMDA1MiwxNCwxMDA2MCwxMDA2MCwxNCwxMDA2NywxMDA2OSwxNCwxMDA4MywxMDA4NCwxNCwxMDEzMywxMDEzNSwxNCwxMDE2MCwxMDE2MCwxNCwxMDU0OCwxMDU0OSwxNCwxMTAzNSwxMTAzNiwxNCwxMTA5MywxMTA5MywxNCwxMTY0NywxMTY0Nyw1LDEyMzMwLDEyMzMzLDUsMTIzMzYsMTIzMzYsMTQsMTI0NDEsMTI0NDIsNSwxMjk1MywxMjk1MywxNCw0MjYwOCw0MjYxMCw1LDQyNjU0LDQyNjU1LDUsNDMwMTAsNDMwMTAsNSw0MzAxOSw0MzAxOSw1LDQzMDQ1LDQzMDQ2LDUsNDMwNTIsNDMwNTIsNSw0MzE4OCw0MzIwMyw3LDQzMjMyLDQzMjQ5LDUsNDMzMDIsNDMzMDksNSw0MzM0Niw0MzM0Nyw3LDQzMzkyLDQzMzk0LDUsNDM0NDMsNDM0NDMsNSw0MzQ0Niw0MzQ0OSw1LDQzNDUyLDQzNDUzLDUsNDM0OTMsNDM0OTMsNSw0MzU2Nyw0MzU2OCw3LDQzNTcxLDQzNTcyLDcsNDM1ODcsNDM1ODcsNSw0MzU5Nyw0MzU5Nyw3LDQzNjk2LDQzNjk2LDUsNDM3MDMsNDM3MDQsNSw0MzcxMyw0MzcxMyw1LDQzNzU2LDQzNzU3LDUsNDM3NjUsNDM3NjUsNyw0NDAwMyw0NDAwNCw3LDQ0MDA2LDQ0MDA3LDcsNDQwMDksNDQwMTAsNyw0NDAxMyw0NDAxMyw1LDQ0MDMzLDQ0MDU5LDEyLDQ0MDYxLDQ0MDg3LDEyLDQ0MDg5LDQ0MTE1LDEyLDQ0MTE3LDQ0MTQzLDEyLDQ0MTQ1LDQ0MTcxLDEyLDQ0MTczLDQ0MTk5LDEyLDQ0MjAxLDQ0MjI3LDEyLDQ0MjI5LDQ0MjU1LDEyLDQ0MjU3LDQ0MjgzLDEyLDQ0Mjg1LDQ0MzExLDEyLDQ0MzEzLDQ0MzM5LDEyLDQ0MzQxLDQ0MzY3LDEyLDQ0MzY5LDQ0Mzk1LDEyLDQ0Mzk3LDQ0NDIzLDEyLDQ0NDI1LDQ0NDUxLDEyLDQ0NDUzLDQ0NDc5LDEyLDQ0NDgxLDQ0NTA3LDEyLDQ0NTA5LDQ0NTM1LDEyLDQ0NTM3LDQ0NTYzLDEyLDQ0NTY1LDQ0NTkxLDEyLDQ0NTkzLDQ0NjE5LDEyLDQ0NjIxLDQ0NjQ3LDEyLDQ0NjQ5LDQ0Njc1LDEyLDQ0Njc3LDQ0NzAzLDEyLDQ0NzA1LDQ0NzMxLDEyLDQ0NzMzLDQ0NzU5LDEyLDQ0NzYxLDQ0Nzg3LDEyLDQ0Nzg5LDQ0ODE1LDEyLDQ0ODE3LDQ0ODQzLDEyLDQ0ODQ1LDQ0ODcxLDEyLDQ0ODczLDQ0ODk5LDEyLDQ0OTAxLDQ0OTI3LDEyLDQ0OTI5LDQ0OTU1LDEyLDQ0OTU3LDQ0OTgzLDEyLDQ0OTg1LDQ1MDExLDEyLDQ1MDEzLDQ1MDM5LDEyLDQ1MDQxLDQ1MDY3LDEyLDQ1MDY5LDQ1MDk1LDEyLDQ1MDk3LDQ1MTIzLDEyLDQ1MTI1LDQ1MTUxLDEyLDQ1MTUzLDQ1MTc5LDEyLDQ1MTgxLDQ1MjA3LDEyLDQ1MjA5LDQ1MjM1LDEyLDQ1MjM3LDQ1MjYzLDEyLDQ1MjY1LDQ1MjkxLDEyLDQ1MjkzLDQ1MzE5LDEyLDQ1MzIxLDQ1MzQ3LDEyLDQ1MzQ5LDQ1Mzc1LDEyLDQ1Mzc3LDQ1NDAzLDEyLDQ1NDA1LDQ1NDMxLDEyLDQ1NDMzLDQ1NDU5LDEyLDQ1NDYxLDQ1NDg3LDEyLDQ1NDg5LDQ1NTE1LDEyLDQ1NTE3LDQ1NTQzLDEyLDQ1NTQ1LDQ1NTcxLDEyLDQ1NTczLDQ1NTk5LDEyLDQ1NjAxLDQ1NjI3LDEyLDQ1NjI5LDQ1NjU1LDEyLDQ1NjU3LDQ1NjgzLDEyLDQ1Njg1LDQ1NzExLDEyLDQ1NzEzLDQ1NzM5LDEyLDQ1NzQxLDQ1NzY3LDEyLDQ1NzY5LDQ1Nzk1LDEyLDQ1Nzk3LDQ1ODIzLDEyLDQ1ODI1LDQ1ODUxLDEyLDQ1ODUzLDQ1ODc5LDEyLDQ1ODgxLDQ1OTA3LDEyLDQ1OTA5LDQ1OTM1LDEyLDQ1OTM3LDQ1OTYzLDEyLDQ1OTY1LDQ1OTkxLDEyLDQ1OTkzLDQ2MDE5LDEyLDQ2MDIxLDQ2MDQ3LDEyLDQ2MDQ5LDQ2MDc1LDEyLDQ2MDc3LDQ2MTAzLDEyLDQ2MTA1LDQ2MTMxLDEyLDQ2MTMzLDQ2MTU5LDEyLDQ2MTYxLDQ2MTg3LDEyLDQ2MTg5LDQ2MjE1LDEyLDQ2MjE3LDQ2MjQzLDEyLDQ2MjQ1LDQ2MjcxLDEyLDQ2MjczLDQ2Mjk5LDEyLDQ2MzAxLDQ2MzI3LDEyLDQ2MzI5LDQ2MzU1LDEyLDQ2MzU3LDQ2MzgzLDEyLDQ2Mzg1LDQ2NDExLDEyLDQ2NDEzLDQ2NDM5LDEyLDQ2NDQxLDQ2NDY3LDEyLDQ2NDY5LDQ2NDk1LDEyLDQ2NDk3LDQ2NTIzLDEyLDQ2NTI1LDQ2NTUxLDEyLDQ2NTUzLDQ2NTc5LDEyLDQ2NTgxLDQ2NjA3LDEyLDQ2NjA5LDQ2NjM1LDEyLDQ2NjM3LDQ2NjYzLDEyLDQ2NjY1LDQ2NjkxLDEyLDQ2NjkzLDQ2NzE5LDEyLDQ2NzIxLDQ2NzQ3LDEyLDQ2NzQ5LDQ2Nzc1LDEyLDQ2Nzc3LDQ2ODAzLDEyLDQ2ODA1LDQ2ODMxLDEyLDQ2ODMzLDQ2ODU5LDEyLDQ2ODYxLDQ2ODg3LDEyLDQ2ODg5LDQ2OTE1LDEyLDQ2OTE3LDQ2OTQzLDEyLDQ2OTQ1LDQ2OTcxLDEyLDQ2OTczLDQ2OTk5LDEyLDQ3MDAxLDQ3MDI3LDEyLDQ3MDI5LDQ3MDU1LDEyLDQ3MDU3LDQ3MDgzLDEyLDQ3MDg1LDQ3MTExLDEyLDQ3MTEzLDQ3MTM5LDEyLDQ3MTQxLDQ3MTY3LDEyLDQ3MTY5LDQ3MTk1LDEyLDQ3MTk3LDQ3MjIzLDEyLDQ3MjI1LDQ3MjUxLDEyLDQ3MjUzLDQ3Mjc5LDEyLDQ3MjgxLDQ3MzA3LDEyLDQ3MzA5LDQ3MzM1LDEyLDQ3MzM3LDQ3MzYzLDEyLDQ3MzY1LDQ3MzkxLDEyLDQ3MzkzLDQ3NDE5LDEyLDQ3NDIxLDQ3NDQ3LDEyLDQ3NDQ5LDQ3NDc1LDEyLDQ3NDc3LDQ3NTAzLDEyLDQ3NTA1LDQ3NTMxLDEyLDQ3NTMzLDQ3NTU5LDEyLDQ3NTYxLDQ3NTg3LDEyLDQ3NTg5LDQ3NjE1LDEyLDQ3NjE3LDQ3NjQzLDEyLDQ3NjQ1LDQ3NjcxLDEyLDQ3NjczLDQ3Njk5LDEyLDQ3NzAxLDQ3NzI3LDEyLDQ3NzI5LDQ3NzU1LDEyLDQ3NzU3LDQ3NzgzLDEyLDQ3Nzg1LDQ3ODExLDEyLDQ3ODEzLDQ3ODM5LDEyLDQ3ODQxLDQ3ODY3LDEyLDQ3ODY5LDQ3ODk1LDEyLDQ3ODk3LDQ3OTIzLDEyLDQ3OTI1LDQ3OTUxLDEyLDQ3OTUzLDQ3OTc5LDEyLDQ3OTgxLDQ4MDA3LDEyLDQ4MDA5LDQ4MDM1LDEyLDQ4MDM3LDQ4MDYzLDEyLDQ4MDY1LDQ4MDkxLDEyLDQ4MDkzLDQ4MTE5LDEyLDQ4MTIxLDQ4MTQ3LDEyLDQ4MTQ5LDQ4MTc1LDEyLDQ4MTc3LDQ4MjAzLDEyLDQ4MjA1LDQ4MjMxLDEyLDQ4MjMzLDQ4MjU5LDEyLDQ4MjYxLDQ4Mjg3LDEyLDQ4Mjg5LDQ4MzE1LDEyLDQ4MzE3LDQ4MzQzLDEyLDQ4MzQ1LDQ4MzcxLDEyLDQ4MzczLDQ4Mzk5LDEyLDQ4NDAxLDQ4NDI3LDEyLDQ4NDI5LDQ4NDU1LDEyLDQ4NDU3LDQ4NDgzLDEyLDQ4NDg1LDQ4NTExLDEyLDQ4NTEzLDQ4NTM5LDEyLDQ4NTQxLDQ4NTY3LDEyLDQ4NTY5LDQ4NTk1LDEyLDQ4NTk3LDQ4NjIzLDEyLDQ4NjI1LDQ4NjUxLDEyLDQ4NjUzLDQ4Njc5LDEyLDQ4NjgxLDQ4NzA3LDEyLDQ4NzA5LDQ4NzM1LDEyLDQ4NzM3LDQ4NzYzLDEyLDQ4NzY1LDQ4NzkxLDEyLDQ4NzkzLDQ4ODE5LDEyLDQ4ODIxLDQ4ODQ3LDEyLDQ4ODQ5LDQ4ODc1LDEyLDQ4ODc3LDQ4OTAzLDEyLDQ4OTA1LDQ4OTMxLDEyLDQ4OTMzLDQ4OTU5LDEyLDQ4OTYxLDQ4OTg3LDEyLDQ4OTg5LDQ5MDE1LDEyLDQ5MDE3LDQ5MDQzLDEyLDQ5MDQ1LDQ5MDcxLDEyLDQ5MDczLDQ5MDk5LDEyLDQ5MTAxLDQ5MTI3LDEyLDQ5MTI5LDQ5MTU1LDEyLDQ5MTU3LDQ5MTgzLDEyLDQ5MTg1LDQ5MjExLDEyLDQ5MjEzLDQ5MjM5LDEyLDQ5MjQxLDQ5MjY3LDEyLDQ5MjY5LDQ5Mjk1LDEyLDQ5Mjk3LDQ5MzIzLDEyLDQ5MzI1LDQ5MzUxLDEyLDQ5MzUzLDQ5Mzc5LDEyLDQ5MzgxLDQ5NDA3LDEyLDQ5NDA5LDQ5NDM1LDEyLDQ5NDM3LDQ5NDYzLDEyLDQ5NDY1LDQ5NDkxLDEyLDQ5NDkzLDQ5NTE5LDEyLDQ5NTIxLDQ5NTQ3LDEyLDQ5NTQ5LDQ5NTc1LDEyLDQ5NTc3LDQ5NjAzLDEyLDQ5NjA1LDQ5NjMxLDEyLDQ5NjMzLDQ5NjU5LDEyLDQ5NjYxLDQ5Njg3LDEyLDQ5Njg5LDQ5NzE1LDEyLDQ5NzE3LDQ5NzQzLDEyLDQ5NzQ1LDQ5NzcxLDEyLDQ5NzczLDQ5Nzk5LDEyLDQ5ODAxLDQ5ODI3LDEyLDQ5ODI5LDQ5ODU1LDEyLDQ5ODU3LDQ5ODgzLDEyLDQ5ODg1LDQ5OTExLDEyLDQ5OTEzLDQ5OTM5LDEyLDQ5OTQxLDQ5OTY3LDEyLDQ5OTY5LDQ5OTk1LDEyLDQ5OTk3LDUwMDIzLDEyLDUwMDI1LDUwMDUxLDEyLDUwMDUzLDUwMDc5LDEyLDUwMDgxLDUwMTA3LDEyLDUwMTA5LDUwMTM1LDEyLDUwMTM3LDUwMTYzLDEyLDUwMTY1LDUwMTkxLDEyLDUwMTkzLDUwMjE5LDEyLDUwMjIxLDUwMjQ3LDEyLDUwMjQ5LDUwMjc1LDEyLDUwMjc3LDUwMzAzLDEyLDUwMzA1LDUwMzMxLDEyLDUwMzMzLDUwMzU5LDEyLDUwMzYxLDUwMzg3LDEyLDUwMzg5LDUwNDE1LDEyLDUwNDE3LDUwNDQzLDEyLDUwNDQ1LDUwNDcxLDEyLDUwNDczLDUwNDk5LDEyLDUwNTAxLDUwNTI3LDEyLDUwNTI5LDUwNTU1LDEyLDUwNTU3LDUwNTgzLDEyLDUwNTg1LDUwNjExLDEyLDUwNjEzLDUwNjM5LDEyLDUwNjQxLDUwNjY3LDEyLDUwNjY5LDUwNjk1LDEyLDUwNjk3LDUwNzIzLDEyLDUwNzI1LDUwNzUxLDEyLDUwNzUzLDUwNzc5LDEyLDUwNzgxLDUwODA3LDEyLDUwODA5LDUwODM1LDEyLDUwODM3LDUwODYzLDEyLDUwODY1LDUwODkxLDEyLDUwODkzLDUwOTE5LDEyLDUwOTIxLDUwOTQ3LDEyLDUwOTQ5LDUwOTc1LDEyLDUwOTc3LDUxMDAzLDEyLDUxMDA1LDUxMDMxLDEyLDUxMDMzLDUxMDU5LDEyLDUxMDYxLDUxMDg3LDEyLDUxMDg5LDUxMTE1LDEyLDUxMTE3LDUxMTQzLDEyLDUxMTQ1LDUxMTcxLDEyLDUxMTczLDUxMTk5LDEyLDUxMjAxLDUxMjI3LDEyLDUxMjI5LDUxMjU1LDEyLDUxMjU3LDUxMjgzLDEyLDUxMjg1LDUxMzExLDEyLDUxMzEzLDUxMzM5LDEyLDUxMzQxLDUxMzY3LDEyLDUxMzY5LDUxMzk1LDEyLDUxMzk3LDUxNDIzLDEyLDUxNDI1LDUxNDUxLDEyLDUxNDUzLDUxNDc5LDEyLDUxNDgxLDUxNTA3LDEyLDUxNTA5LDUxNTM1LDEyLDUxNTM3LDUxNTYzLDEyLDUxNTY1LDUxNTkxLDEyLDUxNTkzLDUxNjE5LDEyLDUxNjIxLDUxNjQ3LDEyLDUxNjQ5LDUxNjc1LDEyLDUxNjc3LDUxNzAzLDEyLDUxNzA1LDUxNzMxLDEyLDUxNzMzLDUxNzU5LDEyLDUxNzYxLDUxNzg3LDEyLDUxNzg5LDUxODE1LDEyLDUxODE3LDUxODQzLDEyLDUxODQ1LDUxODcxLDEyLDUxODczLDUxODk5LDEyLDUxOTAxLDUxOTI3LDEyLDUxOTI5LDUxOTU1LDEyLDUxOTU3LDUxOTgzLDEyLDUxOTg1LDUyMDExLDEyLDUyMDEzLDUyMDM5LDEyLDUyMDQxLDUyMDY3LDEyLDUyMDY5LDUyMDk1LDEyLDUyMDk3LDUyMTIzLDEyLDUyMTI1LDUyMTUxLDEyLDUyMTUzLDUyMTc5LDEyLDUyMTgxLDUyMjA3LDEyLDUyMjA5LDUyMjM1LDEyLDUyMjM3LDUyMjYzLDEyLDUyMjY1LDUyMjkxLDEyLDUyMjkzLDUyMzE5LDEyLDUyMzIxLDUyMzQ3LDEyLDUyMzQ5LDUyMzc1LDEyLDUyMzc3LDUyNDAzLDEyLDUyNDA1LDUyNDMxLDEyLDUyNDMzLDUyNDU5LDEyLDUyNDYxLDUyNDg3LDEyLDUyNDg5LDUyNTE1LDEyLDUyNTE3LDUyNTQzLDEyLDUyNTQ1LDUyNTcxLDEyLDUyNTczLDUyNTk5LDEyLDUyNjAxLDUyNjI3LDEyLDUyNjI5LDUyNjU1LDEyLDUyNjU3LDUyNjgzLDEyLDUyNjg1LDUyNzExLDEyLDUyNzEzLDUyNzM5LDEyLDUyNzQxLDUyNzY3LDEyLDUyNzY5LDUyNzk1LDEyLDUyNzk3LDUyODIzLDEyLDUyODI1LDUyODUxLDEyLDUyODUzLDUyODc5LDEyLDUyODgxLDUyOTA3LDEyLDUyOTA5LDUyOTM1LDEyLDUyOTM3LDUyOTYzLDEyLDUyOTY1LDUyOTkxLDEyLDUyOTkzLDUzMDE5LDEyLDUzMDIxLDUzMDQ3LDEyLDUzMDQ5LDUzMDc1LDEyLDUzMDc3LDUzMTAzLDEyLDUzMTA1LDUzMTMxLDEyLDUzMTMzLDUzMTU5LDEyLDUzMTYxLDUzMTg3LDEyLDUzMTg5LDUzMjE1LDEyLDUzMjE3LDUzMjQzLDEyLDUzMjQ1LDUzMjcxLDEyLDUzMjczLDUzMjk5LDEyLDUzMzAxLDUzMzI3LDEyLDUzMzI5LDUzMzU1LDEyLDUzMzU3LDUzMzgzLDEyLDUzMzg1LDUzNDExLDEyLDUzNDEzLDUzNDM5LDEyLDUzNDQxLDUzNDY3LDEyLDUzNDY5LDUzNDk1LDEyLDUzNDk3LDUzNTIzLDEyLDUzNTI1LDUzNTUxLDEyLDUzNTUzLDUzNTc5LDEyLDUzNTgxLDUzNjA3LDEyLDUzNjA5LDUzNjM1LDEyLDUzNjM3LDUzNjYzLDEyLDUzNjY1LDUzNjkxLDEyLDUzNjkzLDUzNzE5LDEyLDUzNzIxLDUzNzQ3LDEyLDUzNzQ5LDUzNzc1LDEyLDUzNzc3LDUzODAzLDEyLDUzODA1LDUzODMxLDEyLDUzODMzLDUzODU5LDEyLDUzODYxLDUzODg3LDEyLDUzODg5LDUzOTE1LDEyLDUzOTE3LDUzOTQzLDEyLDUzOTQ1LDUzOTcxLDEyLDUzOTczLDUzOTk5LDEyLDU0MDAxLDU0MDI3LDEyLDU0MDI5LDU0MDU1LDEyLDU0MDU3LDU0MDgzLDEyLDU0MDg1LDU0MTExLDEyLDU0MTEzLDU0MTM5LDEyLDU0MTQxLDU0MTY3LDEyLDU0MTY5LDU0MTk1LDEyLDU0MTk3LDU0MjIzLDEyLDU0MjI1LDU0MjUxLDEyLDU0MjUzLDU0Mjc5LDEyLDU0MjgxLDU0MzA3LDEyLDU0MzA5LDU0MzM1LDEyLDU0MzM3LDU0MzYzLDEyLDU0MzY1LDU0MzkxLDEyLDU0MzkzLDU0NDE5LDEyLDU0NDIxLDU0NDQ3LDEyLDU0NDQ5LDU0NDc1LDEyLDU0NDc3LDU0NTAzLDEyLDU0NTA1LDU0NTMxLDEyLDU0NTMzLDU0NTU5LDEyLDU0NTYxLDU0NTg3LDEyLDU0NTg5LDU0NjE1LDEyLDU0NjE3LDU0NjQzLDEyLDU0NjQ1LDU0NjcxLDEyLDU0NjczLDU0Njk5LDEyLDU0NzAxLDU0NzI3LDEyLDU0NzI5LDU0NzU1LDEyLDU0NzU3LDU0NzgzLDEyLDU0Nzg1LDU0ODExLDEyLDU0ODEzLDU0ODM5LDEyLDU0ODQxLDU0ODY3LDEyLDU0ODY5LDU0ODk1LDEyLDU0ODk3LDU0OTIzLDEyLDU0OTI1LDU0OTUxLDEyLDU0OTUzLDU0OTc5LDEyLDU0OTgxLDU1MDA3LDEyLDU1MDA5LDU1MDM1LDEyLDU1MDM3LDU1MDYzLDEyLDU1MDY1LDU1MDkxLDEyLDU1MDkzLDU1MTE5LDEyLDU1MTIxLDU1MTQ3LDEyLDU1MTQ5LDU1MTc1LDEyLDU1MTc3LDU1MjAzLDEyLDU1MjQzLDU1MjkxLDEwLDY1MDI0LDY1MDM5LDUsNjUyNzksNjUyNzksNCw2NTUyMCw2NTUyOCw0LDY2MDQ1LDY2MDQ1LDUsNjY0MjIsNjY0MjYsNSw2ODEwMSw2ODEwMiw1LDY4MTUyLDY4MTU0LDUsNjgzMjUsNjgzMjYsNSw2OTI5MSw2OTI5Miw1LDY5NjMyLDY5NjMyLDcsNjk2MzQsNjk2MzQsNyw2OTc1OSw2OTc2MSw1XScpO1xyXG59XHJcbi8vI2VuZHJlZ2lvblxyXG4vKipcclxuICogQ29tcHV0ZXMgdGhlIG9mZnNldCBhZnRlciBwZXJmb3JtaW5nIGEgbGVmdCBkZWxldGUgb24gdGhlIGdpdmVuIHN0cmluZyxcclxuICogd2hpbGUgY29uc2lkZXJpbmcgdW5pY29kZSBncmFwaGVtZS9lbW9qaSBydWxlcy5cclxuKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGdldExlZnREZWxldGVPZmZzZXQob2Zmc2V0LCBzdHIpIHtcclxuICAgIGlmIChvZmZzZXQgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIC8vIFRyeSB0byBkZWxldGUgZW1vamkgcGFydC5cclxuICAgIGNvbnN0IGVtb2ppT2Zmc2V0ID0gZ2V0T2Zmc2V0QmVmb3JlTGFzdEVtb2ppQ29tcG9uZW50KG9mZnNldCwgc3RyKTtcclxuICAgIGlmIChlbW9qaU9mZnNldCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgcmV0dXJuIGVtb2ppT2Zmc2V0O1xyXG4gICAgfVxyXG4gICAgLy8gT3RoZXJ3aXNlLCBqdXN0IHNraXAgYSBzaW5nbGUgY29kZSBwb2ludC5cclxuICAgIGNvbnN0IGNvZGVQb2ludCA9IGdldFByZXZDb2RlUG9pbnQoc3RyLCBvZmZzZXQpO1xyXG4gICAgb2Zmc2V0IC09IGdldFVURjE2TGVuZ3RoKGNvZGVQb2ludCk7XHJcbiAgICByZXR1cm4gb2Zmc2V0O1xyXG59XHJcbmZ1bmN0aW9uIGdldE9mZnNldEJlZm9yZUxhc3RFbW9qaUNvbXBvbmVudChvZmZzZXQsIHN0cikge1xyXG4gICAgLy8gU2VlIGh0dHBzOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHI1MS90cjUxLTE0Lmh0bWwjRUJORl9hbmRfUmVnZXggZm9yIHRoZVxyXG4gICAgLy8gc3RydWN0dXJlIG9mIGVtb2ppcy5cclxuICAgIGxldCBjb2RlUG9pbnQgPSBnZXRQcmV2Q29kZVBvaW50KHN0ciwgb2Zmc2V0KTtcclxuICAgIG9mZnNldCAtPSBnZXRVVEYxNkxlbmd0aChjb2RlUG9pbnQpO1xyXG4gICAgLy8gU2tpcCBtb2RpZmllcnNcclxuICAgIHdoaWxlICgoaXNFbW9qaU1vZGlmaWVyKGNvZGVQb2ludCkgfHwgY29kZVBvaW50ID09PSA2NTAzOSAvKiBlbW9qaVZhcmlhbnRTZWxlY3RvciAqLyB8fCBjb2RlUG9pbnQgPT09IDg0MTkgLyogZW5jbG9zaW5nS2V5Q2FwICovKSkge1xyXG4gICAgICAgIGlmIChvZmZzZXQgPT09IDApIHtcclxuICAgICAgICAgICAgLy8gQ2Fubm90IHNraXAgbW9kaWZpZXIsIG5vIHByZWNlZGluZyBlbW9qaSBiYXNlLlxyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb2RlUG9pbnQgPSBnZXRQcmV2Q29kZVBvaW50KHN0ciwgb2Zmc2V0KTtcclxuICAgICAgICBvZmZzZXQgLT0gZ2V0VVRGMTZMZW5ndGgoY29kZVBvaW50KTtcclxuICAgIH1cclxuICAgIC8vIEV4cGVjdCBiYXNlIGVtb2ppXHJcbiAgICBpZiAoIWlzRW1vamlJbXByZWNpc2UoY29kZVBvaW50KSkge1xyXG4gICAgICAgIC8vIFVuZXhwZWN0ZWQgY29kZSBwb2ludCwgbm90IGEgdmFsaWQgZW1vamkuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIGlmIChvZmZzZXQgPj0gMCkge1xyXG4gICAgICAgIC8vIFNraXAgb3B0aW9uYWwgWldKIGNvZGUgcG9pbnRzIHRoYXQgY29tYmluZSBtdWx0aXBsZSBlbW9qaXMuXHJcbiAgICAgICAgLy8gSW4gdGhlb3J5LCB3ZSBzaG91bGQgY2hlY2sgaWYgdGhhdCBaV0ogYWN0dWFsbHkgY29tYmluZXMgbXVsdGlwbGUgZW1vamlzXHJcbiAgICAgICAgLy8gdG8gcHJldmVudCBkZWxldGluZyBaV0pzIGluIHNpdHVhdGlvbnMgd2UgZGlkbid0IGFjY291bnQgZm9yLlxyXG4gICAgICAgIGNvbnN0IG9wdGlvbmFsWndqQ29kZVBvaW50ID0gZ2V0UHJldkNvZGVQb2ludChzdHIsIG9mZnNldCk7XHJcbiAgICAgICAgaWYgKG9wdGlvbmFsWndqQ29kZVBvaW50ID09PSA4MjA1IC8qIHp3aiAqLykge1xyXG4gICAgICAgICAgICBvZmZzZXQgLT0gZ2V0VVRGMTZMZW5ndGgob3B0aW9uYWxad2pDb2RlUG9pbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBvZmZzZXQ7XHJcbn1cclxuZnVuY3Rpb24gZ2V0VVRGMTZMZW5ndGgoY29kZVBvaW50KSB7XHJcbiAgICByZXR1cm4gY29kZVBvaW50ID49IDY1NTM2IC8qIFVOSUNPREVfU1VQUExFTUVOVEFSWV9QTEFORV9CRUdJTiAqLyA/IDIgOiAxO1xyXG59XHJcbmZ1bmN0aW9uIGlzRW1vamlNb2RpZmllcihjb2RlUG9pbnQpIHtcclxuICAgIHJldHVybiAweDFGM0ZCIDw9IGNvZGVQb2ludCAmJiBjb2RlUG9pbnQgPD0gMHgxRjNGRjtcclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCAqIGFzIHN0cmluZ3MgZnJvbSAnLi9zdHJpbmdzLmpzJztcclxuLyoqXHJcbiAqIFJldHVybiBhIGhhc2ggdmFsdWUgZm9yIGFuIG9iamVjdC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNoKG9iaikge1xyXG4gICAgcmV0dXJuIGRvSGFzaChvYmosIDApO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBkb0hhc2gob2JqLCBoYXNoVmFsKSB7XHJcbiAgICBzd2l0Y2ggKHR5cGVvZiBvYmopIHtcclxuICAgICAgICBjYXNlICdvYmplY3QnOlxyXG4gICAgICAgICAgICBpZiAob2JqID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtYmVySGFzaCgzNDksIGhhc2hWYWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5SGFzaChvYmosIGhhc2hWYWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBvYmplY3RIYXNoKG9iaiwgaGFzaFZhbCk7XHJcbiAgICAgICAgY2FzZSAnc3RyaW5nJzpcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ0hhc2gob2JqLCBoYXNoVmFsKTtcclxuICAgICAgICBjYXNlICdib29sZWFuJzpcclxuICAgICAgICAgICAgcmV0dXJuIGJvb2xlYW5IYXNoKG9iaiwgaGFzaFZhbCk7XHJcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcclxuICAgICAgICAgICAgcmV0dXJuIG51bWJlckhhc2gob2JqLCBoYXNoVmFsKTtcclxuICAgICAgICBjYXNlICd1bmRlZmluZWQnOlxyXG4gICAgICAgICAgICByZXR1cm4gbnVtYmVySGFzaCg5MzcsIGhhc2hWYWwpO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBudW1iZXJIYXNoKDYxNywgaGFzaFZhbCk7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gbnVtYmVySGFzaCh2YWwsIGluaXRpYWxIYXNoVmFsKSB7XHJcbiAgICByZXR1cm4gKCgoaW5pdGlhbEhhc2hWYWwgPDwgNSkgLSBpbml0aWFsSGFzaFZhbCkgKyB2YWwpIHwgMDsgLy8gaGFzaFZhbCAqIDMxICsgY2gsIGtlZXAgYXMgaW50MzJcclxufVxyXG5mdW5jdGlvbiBib29sZWFuSGFzaChiLCBpbml0aWFsSGFzaFZhbCkge1xyXG4gICAgcmV0dXJuIG51bWJlckhhc2goYiA/IDQzMyA6IDg2MywgaW5pdGlhbEhhc2hWYWwpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdIYXNoKHMsIGhhc2hWYWwpIHtcclxuICAgIGhhc2hWYWwgPSBudW1iZXJIYXNoKDE0OTQxNywgaGFzaFZhbCk7XHJcbiAgICBmb3IgKGxldCBpID0gMCwgbGVuZ3RoID0gcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGhhc2hWYWwgPSBudW1iZXJIYXNoKHMuY2hhckNvZGVBdChpKSwgaGFzaFZhbCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gaGFzaFZhbDtcclxufVxyXG5mdW5jdGlvbiBhcnJheUhhc2goYXJyLCBpbml0aWFsSGFzaFZhbCkge1xyXG4gICAgaW5pdGlhbEhhc2hWYWwgPSBudW1iZXJIYXNoKDEwNDU3OSwgaW5pdGlhbEhhc2hWYWwpO1xyXG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoKGhhc2hWYWwsIGl0ZW0pID0+IGRvSGFzaChpdGVtLCBoYXNoVmFsKSwgaW5pdGlhbEhhc2hWYWwpO1xyXG59XHJcbmZ1bmN0aW9uIG9iamVjdEhhc2gob2JqLCBpbml0aWFsSGFzaFZhbCkge1xyXG4gICAgaW5pdGlhbEhhc2hWYWwgPSBudW1iZXJIYXNoKDE4MTM4NywgaW5pdGlhbEhhc2hWYWwpO1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikuc29ydCgpLnJlZHVjZSgoaGFzaFZhbCwga2V5KSA9PiB7XHJcbiAgICAgICAgaGFzaFZhbCA9IHN0cmluZ0hhc2goa2V5LCBoYXNoVmFsKTtcclxuICAgICAgICByZXR1cm4gZG9IYXNoKG9ialtrZXldLCBoYXNoVmFsKTtcclxuICAgIH0sIGluaXRpYWxIYXNoVmFsKTtcclxufVxyXG5mdW5jdGlvbiBsZWZ0Um90YXRlKHZhbHVlLCBiaXRzLCB0b3RhbEJpdHMgPSAzMikge1xyXG4gICAgLy8gZGVsdGEgKyBiaXRzID0gdG90YWxCaXRzXHJcbiAgICBjb25zdCBkZWx0YSA9IHRvdGFsQml0cyAtIGJpdHM7XHJcbiAgICAvLyBBbGwgb25lcywgZXhwZWN0IGBkZWx0YWAgemVyb3MgYWxpZ25lZCB0byB0aGUgcmlnaHRcclxuICAgIGNvbnN0IG1hc2sgPSB+KCgxIDw8IGRlbHRhKSAtIDEpO1xyXG4gICAgLy8gSm9pbiAodmFsdWUgbGVmdC1zaGlmdGVkIGBiaXRzYCBiaXRzKSB3aXRoIChtYXNrZWQgdmFsdWUgcmlnaHQtc2hpZnRlZCBgZGVsdGFgIGJpdHMpXHJcbiAgICByZXR1cm4gKCh2YWx1ZSA8PCBiaXRzKSB8ICgobWFzayAmIHZhbHVlKSA+Pj4gZGVsdGEpKSA+Pj4gMDtcclxufVxyXG5mdW5jdGlvbiBmaWxsKGRlc3QsIGluZGV4ID0gMCwgY291bnQgPSBkZXN0LmJ5dGVMZW5ndGgsIHZhbHVlID0gMCkge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgZGVzdFtpbmRleCArIGldID0gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gbGVmdFBhZCh2YWx1ZSwgbGVuZ3RoLCBjaGFyID0gJzAnKSB7XHJcbiAgICB3aGlsZSAodmFsdWUubGVuZ3RoIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgdmFsdWUgPSBjaGFyICsgdmFsdWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdmFsdWU7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHRvSGV4U3RyaW5nKGJ1ZmZlck9yVmFsdWUsIGJpdHNpemUgPSAzMikge1xyXG4gICAgaWYgKGJ1ZmZlck9yVmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGJ1ZmZlck9yVmFsdWUpKS5tYXAoYiA9PiBiLnRvU3RyaW5nKDE2KS5wYWRTdGFydCgyLCAnMCcpKS5qb2luKCcnKTtcclxuICAgIH1cclxuICAgIHJldHVybiBsZWZ0UGFkKChidWZmZXJPclZhbHVlID4+PiAwKS50b1N0cmluZygxNiksIGJpdHNpemUgLyA0KTtcclxufVxyXG4vKipcclxuICogQSBTSEExIGltcGxlbWVudGF0aW9uIHRoYXQgd29ya3Mgd2l0aCBzdHJpbmdzIGFuZCBkb2VzIG5vdCBhbGxvY2F0ZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTdHJpbmdTSEExIHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuX2gwID0gMHg2NzQ1MjMwMTtcclxuICAgICAgICB0aGlzLl9oMSA9IDB4RUZDREFCODk7XHJcbiAgICAgICAgdGhpcy5faDIgPSAweDk4QkFEQ0ZFO1xyXG4gICAgICAgIHRoaXMuX2gzID0gMHgxMDMyNTQ3NjtcclxuICAgICAgICB0aGlzLl9oNCA9IDB4QzNEMkUxRjA7XHJcbiAgICAgICAgdGhpcy5fYnVmZiA9IG5ldyBVaW50OEFycmF5KDY0IC8qIEJMT0NLX1NJWkUgKi8gKyAzIC8qIHRvIGZpdCBhbnkgdXRmLTggKi8pO1xyXG4gICAgICAgIHRoaXMuX2J1ZmZEViA9IG5ldyBEYXRhVmlldyh0aGlzLl9idWZmLmJ1ZmZlcik7XHJcbiAgICAgICAgdGhpcy5fYnVmZkxlbiA9IDA7XHJcbiAgICAgICAgdGhpcy5fdG90YWxMZW4gPSAwO1xyXG4gICAgICAgIHRoaXMuX2xlZnRvdmVySGlnaFN1cnJvZ2F0ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fZmluaXNoZWQgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShzdHIpIHtcclxuICAgICAgICBjb25zdCBzdHJMZW4gPSBzdHIubGVuZ3RoO1xyXG4gICAgICAgIGlmIChzdHJMZW4gPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBidWZmID0gdGhpcy5fYnVmZjtcclxuICAgICAgICBsZXQgYnVmZkxlbiA9IHRoaXMuX2J1ZmZMZW47XHJcbiAgICAgICAgbGV0IGxlZnRvdmVySGlnaFN1cnJvZ2F0ZSA9IHRoaXMuX2xlZnRvdmVySGlnaFN1cnJvZ2F0ZTtcclxuICAgICAgICBsZXQgY2hhckNvZGU7XHJcbiAgICAgICAgbGV0IG9mZnNldDtcclxuICAgICAgICBpZiAobGVmdG92ZXJIaWdoU3Vycm9nYXRlICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGNoYXJDb2RlID0gbGVmdG92ZXJIaWdoU3Vycm9nYXRlO1xyXG4gICAgICAgICAgICBvZmZzZXQgPSAtMTtcclxuICAgICAgICAgICAgbGVmdG92ZXJIaWdoU3Vycm9nYXRlID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNoYXJDb2RlID0gc3RyLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlICh0cnVlKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2RlUG9pbnQgPSBjaGFyQ29kZTtcclxuICAgICAgICAgICAgaWYgKHN0cmluZ3MuaXNIaWdoU3Vycm9nYXRlKGNoYXJDb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldCArIDEgPCBzdHJMZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXh0Q2hhckNvZGUgPSBzdHIuY2hhckNvZGVBdChvZmZzZXQgKyAxKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RyaW5ncy5pc0xvd1N1cnJvZ2F0ZShuZXh0Q2hhckNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2RlUG9pbnQgPSBzdHJpbmdzLmNvbXB1dGVDb2RlUG9pbnQoY2hhckNvZGUsIG5leHRDaGFyQ29kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbGxlZ2FsID0+IHVuaWNvZGUgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvZGVQb2ludCA9IDY1NTMzIC8qIFVOSUNPREVfUkVQTEFDRU1FTlQgKi87XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGFzdCBjaGFyYWN0ZXIgaXMgYSBzdXJyb2dhdGUgcGFpclxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnRvdmVySGlnaFN1cnJvZ2F0ZSA9IGNoYXJDb2RlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHN0cmluZ3MuaXNMb3dTdXJyb2dhdGUoY2hhckNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBpbGxlZ2FsID0+IHVuaWNvZGUgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXHJcbiAgICAgICAgICAgICAgICBjb2RlUG9pbnQgPSA2NTUzMyAvKiBVTklDT0RFX1JFUExBQ0VNRU5UICovO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJ1ZmZMZW4gPSB0aGlzLl9wdXNoKGJ1ZmYsIGJ1ZmZMZW4sIGNvZGVQb2ludCk7XHJcbiAgICAgICAgICAgIG9mZnNldCsrO1xyXG4gICAgICAgICAgICBpZiAob2Zmc2V0IDwgc3RyTGVuKSB7XHJcbiAgICAgICAgICAgICAgICBjaGFyQ29kZSA9IHN0ci5jaGFyQ29kZUF0KG9mZnNldCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9idWZmTGVuID0gYnVmZkxlbjtcclxuICAgICAgICB0aGlzLl9sZWZ0b3ZlckhpZ2hTdXJyb2dhdGUgPSBsZWZ0b3ZlckhpZ2hTdXJyb2dhdGU7XHJcbiAgICB9XHJcbiAgICBfcHVzaChidWZmLCBidWZmTGVuLCBjb2RlUG9pbnQpIHtcclxuICAgICAgICBpZiAoY29kZVBvaW50IDwgMHgwMDgwKSB7XHJcbiAgICAgICAgICAgIGJ1ZmZbYnVmZkxlbisrXSA9IGNvZGVQb2ludDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoY29kZVBvaW50IDwgMHgwODAwKSB7XHJcbiAgICAgICAgICAgIGJ1ZmZbYnVmZkxlbisrXSA9IDBiMTEwMDAwMDAgfCAoKGNvZGVQb2ludCAmIDBiMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTEwMDAwMDApID4+PiA2KTtcclxuICAgICAgICAgICAgYnVmZltidWZmTGVuKytdID0gMGIxMDAwMDAwMCB8ICgoY29kZVBvaW50ICYgMGIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTExMSkgPj4+IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XHJcbiAgICAgICAgICAgIGJ1ZmZbYnVmZkxlbisrXSA9IDBiMTExMDAwMDAgfCAoKGNvZGVQb2ludCAmIDBiMDAwMDAwMDAwMDAwMDAwMDExMTEwMDAwMDAwMDAwMDApID4+PiAxMik7XHJcbiAgICAgICAgICAgIGJ1ZmZbYnVmZkxlbisrXSA9IDBiMTAwMDAwMDAgfCAoKGNvZGVQb2ludCAmIDBiMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDApID4+PiA2KTtcclxuICAgICAgICAgICAgYnVmZltidWZmTGVuKytdID0gMGIxMDAwMDAwMCB8ICgoY29kZVBvaW50ICYgMGIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTExMSkgPj4+IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgYnVmZltidWZmTGVuKytdID0gMGIxMTExMDAwMCB8ICgoY29kZVBvaW50ICYgMGIwMDAwMDAwMDAwMDExMTAwMDAwMDAwMDAwMDAwMDAwMCkgPj4+IDE4KTtcclxuICAgICAgICAgICAgYnVmZltidWZmTGVuKytdID0gMGIxMDAwMDAwMCB8ICgoY29kZVBvaW50ICYgMGIwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMCkgPj4+IDEyKTtcclxuICAgICAgICAgICAgYnVmZltidWZmTGVuKytdID0gMGIxMDAwMDAwMCB8ICgoY29kZVBvaW50ICYgMGIwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMCkgPj4+IDYpO1xyXG4gICAgICAgICAgICBidWZmW2J1ZmZMZW4rK10gPSAwYjEwMDAwMDAwIHwgKChjb2RlUG9pbnQgJiAwYjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTExKSA+Pj4gMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChidWZmTGVuID49IDY0IC8qIEJMT0NLX1NJWkUgKi8pIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RlcCgpO1xyXG4gICAgICAgICAgICBidWZmTGVuIC09IDY0IC8qIEJMT0NLX1NJWkUgKi87XHJcbiAgICAgICAgICAgIHRoaXMuX3RvdGFsTGVuICs9IDY0IC8qIEJMT0NLX1NJWkUgKi87XHJcbiAgICAgICAgICAgIC8vIHRha2UgbGFzdCAzIGluIGNhc2Ugb2YgVVRGOCBvdmVyZmxvd1xyXG4gICAgICAgICAgICBidWZmWzBdID0gYnVmZls2NCAvKiBCTE9DS19TSVpFICovICsgMF07XHJcbiAgICAgICAgICAgIGJ1ZmZbMV0gPSBidWZmWzY0IC8qIEJMT0NLX1NJWkUgKi8gKyAxXTtcclxuICAgICAgICAgICAgYnVmZlsyXSA9IGJ1ZmZbNjQgLyogQkxPQ0tfU0laRSAqLyArIDJdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYnVmZkxlbjtcclxuICAgIH1cclxuICAgIGRpZ2VzdCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2ZpbmlzaGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpbmlzaGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2xlZnRvdmVySGlnaFN1cnJvZ2F0ZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gaWxsZWdhbCA9PiB1bmljb2RlIHJlcGxhY2VtZW50IGNoYXJhY3RlclxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbGVmdG92ZXJIaWdoU3Vycm9nYXRlID0gMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2J1ZmZMZW4gPSB0aGlzLl9wdXNoKHRoaXMuX2J1ZmYsIHRoaXMuX2J1ZmZMZW4sIDY1NTMzIC8qIFVOSUNPREVfUkVQTEFDRU1FTlQgKi8pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX3RvdGFsTGVuICs9IHRoaXMuX2J1ZmZMZW47XHJcbiAgICAgICAgICAgIHRoaXMuX3dyYXBVcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG9IZXhTdHJpbmcodGhpcy5faDApICsgdG9IZXhTdHJpbmcodGhpcy5faDEpICsgdG9IZXhTdHJpbmcodGhpcy5faDIpICsgdG9IZXhTdHJpbmcodGhpcy5faDMpICsgdG9IZXhTdHJpbmcodGhpcy5faDQpO1xyXG4gICAgfVxyXG4gICAgX3dyYXBVcCgpIHtcclxuICAgICAgICB0aGlzLl9idWZmW3RoaXMuX2J1ZmZMZW4rK10gPSAweDgwO1xyXG4gICAgICAgIGZpbGwodGhpcy5fYnVmZiwgdGhpcy5fYnVmZkxlbik7XHJcbiAgICAgICAgaWYgKHRoaXMuX2J1ZmZMZW4gPiA1Nikge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGVwKCk7XHJcbiAgICAgICAgICAgIGZpbGwodGhpcy5fYnVmZik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRoaXMgd2lsbCBmaXQgYmVjYXVzZSB0aGUgbWFudGlzc2EgY2FuIGNvdmVyIHVwIHRvIDUyIGJpdHNcclxuICAgICAgICBjb25zdCBtbCA9IDggKiB0aGlzLl90b3RhbExlbjtcclxuICAgICAgICB0aGlzLl9idWZmRFYuc2V0VWludDMyKDU2LCBNYXRoLmZsb29yKG1sIC8gNDI5NDk2NzI5NiksIGZhbHNlKTtcclxuICAgICAgICB0aGlzLl9idWZmRFYuc2V0VWludDMyKDYwLCBtbCAlIDQyOTQ5NjcyOTYsIGZhbHNlKTtcclxuICAgICAgICB0aGlzLl9zdGVwKCk7XHJcbiAgICB9XHJcbiAgICBfc3RlcCgpIHtcclxuICAgICAgICBjb25zdCBiaWdCbG9jazMyID0gU3RyaW5nU0hBMS5fYmlnQmxvY2szMjtcclxuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5fYnVmZkRWO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNjQgLyogMTYqNCAqLzsgaiArPSA0KSB7XHJcbiAgICAgICAgICAgIGJpZ0Jsb2NrMzIuc2V0VWludDMyKGosIGRhdGEuZ2V0VWludDMyKGosIGZhbHNlKSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBqID0gNjQ7IGogPCAzMjAgLyogODAqNCAqLzsgaiArPSA0KSB7XHJcbiAgICAgICAgICAgIGJpZ0Jsb2NrMzIuc2V0VWludDMyKGosIGxlZnRSb3RhdGUoKGJpZ0Jsb2NrMzIuZ2V0VWludDMyKGogLSAxMiwgZmFsc2UpIF4gYmlnQmxvY2szMi5nZXRVaW50MzIoaiAtIDMyLCBmYWxzZSkgXiBiaWdCbG9jazMyLmdldFVpbnQzMihqIC0gNTYsIGZhbHNlKSBeIGJpZ0Jsb2NrMzIuZ2V0VWludDMyKGogLSA2NCwgZmFsc2UpKSwgMSksIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGEgPSB0aGlzLl9oMDtcclxuICAgICAgICBsZXQgYiA9IHRoaXMuX2gxO1xyXG4gICAgICAgIGxldCBjID0gdGhpcy5faDI7XHJcbiAgICAgICAgbGV0IGQgPSB0aGlzLl9oMztcclxuICAgICAgICBsZXQgZSA9IHRoaXMuX2g0O1xyXG4gICAgICAgIGxldCBmLCBrO1xyXG4gICAgICAgIGxldCB0ZW1wO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgODA7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoaiA8IDIwKSB7XHJcbiAgICAgICAgICAgICAgICBmID0gKGIgJiBjKSB8ICgofmIpICYgZCk7XHJcbiAgICAgICAgICAgICAgICBrID0gMHg1QTgyNzk5OTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChqIDwgNDApIHtcclxuICAgICAgICAgICAgICAgIGYgPSBiIF4gYyBeIGQ7XHJcbiAgICAgICAgICAgICAgICBrID0gMHg2RUQ5RUJBMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChqIDwgNjApIHtcclxuICAgICAgICAgICAgICAgIGYgPSAoYiAmIGMpIHwgKGIgJiBkKSB8IChjICYgZCk7XHJcbiAgICAgICAgICAgICAgICBrID0gMHg4RjFCQkNEQztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGYgPSBiIF4gYyBeIGQ7XHJcbiAgICAgICAgICAgICAgICBrID0gMHhDQTYyQzFENjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0ZW1wID0gKGxlZnRSb3RhdGUoYSwgNSkgKyBmICsgZSArIGsgKyBiaWdCbG9jazMyLmdldFVpbnQzMihqICogNCwgZmFsc2UpKSAmIDB4ZmZmZmZmZmY7XHJcbiAgICAgICAgICAgIGUgPSBkO1xyXG4gICAgICAgICAgICBkID0gYztcclxuICAgICAgICAgICAgYyA9IGxlZnRSb3RhdGUoYiwgMzApO1xyXG4gICAgICAgICAgICBiID0gYTtcclxuICAgICAgICAgICAgYSA9IHRlbXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2gwID0gKHRoaXMuX2gwICsgYSkgJiAweGZmZmZmZmZmO1xyXG4gICAgICAgIHRoaXMuX2gxID0gKHRoaXMuX2gxICsgYikgJiAweGZmZmZmZmZmO1xyXG4gICAgICAgIHRoaXMuX2gyID0gKHRoaXMuX2gyICsgYykgJiAweGZmZmZmZmZmO1xyXG4gICAgICAgIHRoaXMuX2gzID0gKHRoaXMuX2gzICsgZCkgJiAweGZmZmZmZmZmO1xyXG4gICAgICAgIHRoaXMuX2g0ID0gKHRoaXMuX2g0ICsgZSkgJiAweGZmZmZmZmZmO1xyXG4gICAgfVxyXG59XHJcblN0cmluZ1NIQTEuX2JpZ0Jsb2NrMzIgPSBuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDMyMCkpOyAvLyA4MCAqIDQgPSAzMjBcclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5pbXBvcnQgeyBEaWZmQ2hhbmdlIH0gZnJvbSAnLi9kaWZmQ2hhbmdlLmpzJztcclxuaW1wb3J0IHsgc3RyaW5nSGFzaCB9IGZyb20gJy4uL2hhc2guanMnO1xyXG5leHBvcnQgY2xhc3MgU3RyaW5nRGlmZlNlcXVlbmNlIHtcclxuICAgIGNvbnN0cnVjdG9yKHNvdXJjZSkge1xyXG4gICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xyXG4gICAgfVxyXG4gICAgZ2V0RWxlbWVudHMoKSB7XHJcbiAgICAgICAgY29uc3Qgc291cmNlID0gdGhpcy5zb3VyY2U7XHJcbiAgICAgICAgY29uc3QgY2hhcmFjdGVycyA9IG5ldyBJbnQzMkFycmF5KHNvdXJjZS5sZW5ndGgpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBzb3VyY2UubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgY2hhcmFjdGVyc1tpXSA9IHNvdXJjZS5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2hhcmFjdGVycztcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5nRGlmZihvcmlnaW5hbCwgbW9kaWZpZWQsIHByZXR0eSkge1xyXG4gICAgcmV0dXJuIG5ldyBMY3NEaWZmKG5ldyBTdHJpbmdEaWZmU2VxdWVuY2Uob3JpZ2luYWwpLCBuZXcgU3RyaW5nRGlmZlNlcXVlbmNlKG1vZGlmaWVkKSkuQ29tcHV0ZURpZmYocHJldHR5KS5jaGFuZ2VzO1xyXG59XHJcbi8vXHJcbi8vIFRoZSBjb2RlIGJlbG93IGhhcyBiZWVuIHBvcnRlZCBmcm9tIGEgQyMgaW1wbGVtZW50YXRpb24gaW4gVlNcclxuLy9cclxuZXhwb3J0IGNsYXNzIERlYnVnIHtcclxuICAgIHN0YXRpYyBBc3NlcnQoY29uZGl0aW9uLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgaWYgKCFjb25kaXRpb24pIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgTXlBcnJheSB7XHJcbiAgICAvKipcclxuICAgICAqIENvcGllcyBhIHJhbmdlIG9mIGVsZW1lbnRzIGZyb20gYW4gQXJyYXkgc3RhcnRpbmcgYXQgdGhlIHNwZWNpZmllZCBzb3VyY2UgaW5kZXggYW5kIHBhc3Rlc1xyXG4gICAgICogdGhlbSB0byBhbm90aGVyIEFycmF5IHN0YXJ0aW5nIGF0IHRoZSBzcGVjaWZpZWQgZGVzdGluYXRpb24gaW5kZXguIFRoZSBsZW5ndGggYW5kIHRoZSBpbmRleGVzXHJcbiAgICAgKiBhcmUgc3BlY2lmaWVkIGFzIDY0LWJpdCBpbnRlZ2Vycy5cclxuICAgICAqIHNvdXJjZUFycmF5OlxyXG4gICAgICpcdFx0VGhlIEFycmF5IHRoYXQgY29udGFpbnMgdGhlIGRhdGEgdG8gY29weS5cclxuICAgICAqIHNvdXJjZUluZGV4OlxyXG4gICAgICpcdFx0QSA2NC1iaXQgaW50ZWdlciB0aGF0IHJlcHJlc2VudHMgdGhlIGluZGV4IGluIHRoZSBzb3VyY2VBcnJheSBhdCB3aGljaCBjb3B5aW5nIGJlZ2lucy5cclxuICAgICAqIGRlc3RpbmF0aW9uQXJyYXk6XHJcbiAgICAgKlx0XHRUaGUgQXJyYXkgdGhhdCByZWNlaXZlcyB0aGUgZGF0YS5cclxuICAgICAqIGRlc3RpbmF0aW9uSW5kZXg6XHJcbiAgICAgKlx0XHRBIDY0LWJpdCBpbnRlZ2VyIHRoYXQgcmVwcmVzZW50cyB0aGUgaW5kZXggaW4gdGhlIGRlc3RpbmF0aW9uQXJyYXkgYXQgd2hpY2ggc3RvcmluZyBiZWdpbnMuXHJcbiAgICAgKiBsZW5ndGg6XHJcbiAgICAgKlx0XHRBIDY0LWJpdCBpbnRlZ2VyIHRoYXQgcmVwcmVzZW50cyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIHRvIGNvcHkuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBDb3B5KHNvdXJjZUFycmF5LCBzb3VyY2VJbmRleCwgZGVzdGluYXRpb25BcnJheSwgZGVzdGluYXRpb25JbmRleCwgbGVuZ3RoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbkFycmF5W2Rlc3RpbmF0aW9uSW5kZXggKyBpXSA9IHNvdXJjZUFycmF5W3NvdXJjZUluZGV4ICsgaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIENvcHkyKHNvdXJjZUFycmF5LCBzb3VyY2VJbmRleCwgZGVzdGluYXRpb25BcnJheSwgZGVzdGluYXRpb25JbmRleCwgbGVuZ3RoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBkZXN0aW5hdGlvbkFycmF5W2Rlc3RpbmF0aW9uSW5kZXggKyBpXSA9IHNvdXJjZUFycmF5W3NvdXJjZUluZGV4ICsgaV07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBBIHV0aWxpdHkgY2xhc3Mgd2hpY2ggaGVscHMgdG8gY3JlYXRlIHRoZSBzZXQgb2YgRGlmZkNoYW5nZXMgZnJvbVxyXG4gKiBhIGRpZmZlcmVuY2Ugb3BlcmF0aW9uLiBUaGlzIGNsYXNzIGFjY2VwdHMgb3JpZ2luYWwgRGlmZkVsZW1lbnRzIGFuZFxyXG4gKiBtb2RpZmllZCBEaWZmRWxlbWVudHMgdGhhdCBhcmUgaW52b2x2ZWQgaW4gYSBwYXJ0aWN1bGFyIGNoYW5nZS4gVGhlXHJcbiAqIE1hcmt0TmV4dENoYW5nZSgpIG1ldGhvZCBjYW4gYmUgY2FsbGVkIHRvIG1hcmsgdGhlIHNlcGFyYXRpb24gYmV0d2VlblxyXG4gKiBkaXN0aW5jdCBjaGFuZ2VzLiBBdCB0aGUgZW5kLCB0aGUgQ2hhbmdlcyBwcm9wZXJ0eSBjYW4gYmUgY2FsbGVkIHRvIHJldHJpZXZlXHJcbiAqIHRoZSBjb25zdHJ1Y3RlZCBjaGFuZ2VzLlxyXG4gKi9cclxuY2xhc3MgRGlmZkNoYW5nZUhlbHBlciB7XHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgRGlmZkNoYW5nZUhlbHBlciBmb3IgdGhlIGdpdmVuIERpZmZTZXF1ZW5jZXMuXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMubV9jaGFuZ2VzID0gW107XHJcbiAgICAgICAgdGhpcy5tX29yaWdpbmFsU3RhcnQgPSAxMDczNzQxODI0IC8qIE1BWF9TQUZFX1NNQUxMX0lOVEVHRVIgKi87XHJcbiAgICAgICAgdGhpcy5tX21vZGlmaWVkU3RhcnQgPSAxMDczNzQxODI0IC8qIE1BWF9TQUZFX1NNQUxMX0lOVEVHRVIgKi87XHJcbiAgICAgICAgdGhpcy5tX29yaWdpbmFsQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMubV9tb2RpZmllZENvdW50ID0gMDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogTWFya3MgdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCBjaGFuZ2UgaW4gdGhlIHNldCBvZiBkaWZmZXJlbmNlcy5cclxuICAgICAqL1xyXG4gICAgTWFya05leHRDaGFuZ2UoKSB7XHJcbiAgICAgICAgLy8gT25seSBhZGQgdG8gdGhlIGxpc3QgaWYgdGhlcmUgaXMgc29tZXRoaW5nIHRvIGFkZFxyXG4gICAgICAgIGlmICh0aGlzLm1fb3JpZ2luYWxDb3VudCA+IDAgfHwgdGhpcy5tX21vZGlmaWVkQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgbmV3IGNoYW5nZSB0byBvdXIgbGlzdFxyXG4gICAgICAgICAgICB0aGlzLm1fY2hhbmdlcy5wdXNoKG5ldyBEaWZmQ2hhbmdlKHRoaXMubV9vcmlnaW5hbFN0YXJ0LCB0aGlzLm1fb3JpZ2luYWxDb3VudCwgdGhpcy5tX21vZGlmaWVkU3RhcnQsIHRoaXMubV9tb2RpZmllZENvdW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFJlc2V0IGZvciB0aGUgbmV4dCBjaGFuZ2VcclxuICAgICAgICB0aGlzLm1fb3JpZ2luYWxDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5tX21vZGlmaWVkQ291bnQgPSAwO1xyXG4gICAgICAgIHRoaXMubV9vcmlnaW5hbFN0YXJ0ID0gMTA3Mzc0MTgyNCAvKiBNQVhfU0FGRV9TTUFMTF9JTlRFR0VSICovO1xyXG4gICAgICAgIHRoaXMubV9tb2RpZmllZFN0YXJ0ID0gMTA3Mzc0MTgyNCAvKiBNQVhfU0FGRV9TTUFMTF9JTlRFR0VSICovO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBvcmlnaW5hbCBlbGVtZW50IGF0IHRoZSBnaXZlbiBwb3NpdGlvbiB0byB0aGUgZWxlbWVudHNcclxuICAgICAqIGFmZmVjdGVkIGJ5IHRoZSBjdXJyZW50IGNoYW5nZS4gVGhlIG1vZGlmaWVkIGluZGV4IGdpdmVzIGNvbnRleHRcclxuICAgICAqIHRvIHRoZSBjaGFuZ2UgcG9zaXRpb24gd2l0aCByZXNwZWN0IHRvIHRoZSBvcmlnaW5hbCBzZXF1ZW5jZS5cclxuICAgICAqIEBwYXJhbSBvcmlnaW5hbEluZGV4IFRoZSBpbmRleCBvZiB0aGUgb3JpZ2luYWwgZWxlbWVudCB0byBhZGQuXHJcbiAgICAgKiBAcGFyYW0gbW9kaWZpZWRJbmRleCBUaGUgaW5kZXggb2YgdGhlIG1vZGlmaWVkIGVsZW1lbnQgdGhhdCBwcm92aWRlcyBjb3JyZXNwb25kaW5nIHBvc2l0aW9uIGluIHRoZSBtb2RpZmllZCBzZXF1ZW5jZS5cclxuICAgICAqL1xyXG4gICAgQWRkT3JpZ2luYWxFbGVtZW50KG9yaWdpbmFsSW5kZXgsIG1vZGlmaWVkSW5kZXgpIHtcclxuICAgICAgICAvLyBUaGUgJ3RydWUnIHN0YXJ0IGluZGV4IGlzIHRoZSBzbWFsbGVzdCBvZiB0aGUgb25lcyB3ZSd2ZSBzZWVuXHJcbiAgICAgICAgdGhpcy5tX29yaWdpbmFsU3RhcnQgPSBNYXRoLm1pbih0aGlzLm1fb3JpZ2luYWxTdGFydCwgb3JpZ2luYWxJbmRleCk7XHJcbiAgICAgICAgdGhpcy5tX21vZGlmaWVkU3RhcnQgPSBNYXRoLm1pbih0aGlzLm1fbW9kaWZpZWRTdGFydCwgbW9kaWZpZWRJbmRleCk7XHJcbiAgICAgICAgdGhpcy5tX29yaWdpbmFsQ291bnQrKztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgbW9kaWZpZWQgZWxlbWVudCBhdCB0aGUgZ2l2ZW4gcG9zaXRpb24gdG8gdGhlIGVsZW1lbnRzXHJcbiAgICAgKiBhZmZlY3RlZCBieSB0aGUgY3VycmVudCBjaGFuZ2UuIFRoZSBvcmlnaW5hbCBpbmRleCBnaXZlcyBjb250ZXh0XHJcbiAgICAgKiB0byB0aGUgY2hhbmdlIHBvc2l0aW9uIHdpdGggcmVzcGVjdCB0byB0aGUgbW9kaWZpZWQgc2VxdWVuY2UuXHJcbiAgICAgKiBAcGFyYW0gb3JpZ2luYWxJbmRleCBUaGUgaW5kZXggb2YgdGhlIG9yaWdpbmFsIGVsZW1lbnQgdGhhdCBwcm92aWRlcyBjb3JyZXNwb25kaW5nIHBvc2l0aW9uIGluIHRoZSBvcmlnaW5hbCBzZXF1ZW5jZS5cclxuICAgICAqIEBwYXJhbSBtb2RpZmllZEluZGV4IFRoZSBpbmRleCBvZiB0aGUgbW9kaWZpZWQgZWxlbWVudCB0byBhZGQuXHJcbiAgICAgKi9cclxuICAgIEFkZE1vZGlmaWVkRWxlbWVudChvcmlnaW5hbEluZGV4LCBtb2RpZmllZEluZGV4KSB7XHJcbiAgICAgICAgLy8gVGhlICd0cnVlJyBzdGFydCBpbmRleCBpcyB0aGUgc21hbGxlc3Qgb2YgdGhlIG9uZXMgd2UndmUgc2VlblxyXG4gICAgICAgIHRoaXMubV9vcmlnaW5hbFN0YXJ0ID0gTWF0aC5taW4odGhpcy5tX29yaWdpbmFsU3RhcnQsIG9yaWdpbmFsSW5kZXgpO1xyXG4gICAgICAgIHRoaXMubV9tb2RpZmllZFN0YXJ0ID0gTWF0aC5taW4odGhpcy5tX21vZGlmaWVkU3RhcnQsIG1vZGlmaWVkSW5kZXgpO1xyXG4gICAgICAgIHRoaXMubV9tb2RpZmllZENvdW50Kys7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlcyBhbGwgb2YgdGhlIGNoYW5nZXMgbWFya2VkIGJ5IHRoZSBjbGFzcy5cclxuICAgICAqL1xyXG4gICAgZ2V0Q2hhbmdlcygpIHtcclxuICAgICAgICBpZiAodGhpcy5tX29yaWdpbmFsQ291bnQgPiAwIHx8IHRoaXMubV9tb2RpZmllZENvdW50ID4gMCkge1xyXG4gICAgICAgICAgICAvLyBGaW5pc2ggdXAgb24gd2hhdGV2ZXIgaXMgbGVmdFxyXG4gICAgICAgICAgICB0aGlzLk1hcmtOZXh0Q2hhbmdlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLm1fY2hhbmdlcztcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmVzIGFsbCBvZiB0aGUgY2hhbmdlcyBtYXJrZWQgYnkgdGhlIGNsYXNzIGluIHRoZSByZXZlcnNlIG9yZGVyXHJcbiAgICAgKi9cclxuICAgIGdldFJldmVyc2VDaGFuZ2VzKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm1fb3JpZ2luYWxDb3VudCA+IDAgfHwgdGhpcy5tX21vZGlmaWVkQ291bnQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIEZpbmlzaCB1cCBvbiB3aGF0ZXZlciBpcyBsZWZ0XHJcbiAgICAgICAgICAgIHRoaXMuTWFya05leHRDaGFuZ2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tX2NoYW5nZXMucmV2ZXJzZSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1fY2hhbmdlcztcclxuICAgIH1cclxufVxyXG4vKipcclxuICogQW4gaW1wbGVtZW50YXRpb24gb2YgdGhlIGRpZmZlcmVuY2UgYWxnb3JpdGhtIGRlc2NyaWJlZCBpblxyXG4gKiBcIkFuIE8oTkQpIERpZmZlcmVuY2UgQWxnb3JpdGhtIGFuZCBpdHMgdmFyaWF0aW9uc1wiIGJ5IEV1Z2VuZSBXLiBNeWVyc1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExjc0RpZmYge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIHRoZSBEaWZmRmluZGVyXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKG9yaWdpbmFsU2VxdWVuY2UsIG1vZGlmaWVkU2VxdWVuY2UsIGNvbnRpbnVlUHJvY2Vzc2luZ1ByZWRpY2F0ZSA9IG51bGwpIHtcclxuICAgICAgICB0aGlzLkNvbnRpbnVlUHJvY2Vzc2luZ1ByZWRpY2F0ZSA9IGNvbnRpbnVlUHJvY2Vzc2luZ1ByZWRpY2F0ZTtcclxuICAgICAgICBjb25zdCBbb3JpZ2luYWxTdHJpbmdFbGVtZW50cywgb3JpZ2luYWxFbGVtZW50c09ySGFzaCwgb3JpZ2luYWxIYXNTdHJpbmdzXSA9IExjc0RpZmYuX2dldEVsZW1lbnRzKG9yaWdpbmFsU2VxdWVuY2UpO1xyXG4gICAgICAgIGNvbnN0IFttb2RpZmllZFN0cmluZ0VsZW1lbnRzLCBtb2RpZmllZEVsZW1lbnRzT3JIYXNoLCBtb2RpZmllZEhhc1N0cmluZ3NdID0gTGNzRGlmZi5fZ2V0RWxlbWVudHMobW9kaWZpZWRTZXF1ZW5jZSk7XHJcbiAgICAgICAgdGhpcy5faGFzU3RyaW5ncyA9IChvcmlnaW5hbEhhc1N0cmluZ3MgJiYgbW9kaWZpZWRIYXNTdHJpbmdzKTtcclxuICAgICAgICB0aGlzLl9vcmlnaW5hbFN0cmluZ0VsZW1lbnRzID0gb3JpZ2luYWxTdHJpbmdFbGVtZW50cztcclxuICAgICAgICB0aGlzLl9vcmlnaW5hbEVsZW1lbnRzT3JIYXNoID0gb3JpZ2luYWxFbGVtZW50c09ySGFzaDtcclxuICAgICAgICB0aGlzLl9tb2RpZmllZFN0cmluZ0VsZW1lbnRzID0gbW9kaWZpZWRTdHJpbmdFbGVtZW50cztcclxuICAgICAgICB0aGlzLl9tb2RpZmllZEVsZW1lbnRzT3JIYXNoID0gbW9kaWZpZWRFbGVtZW50c09ySGFzaDtcclxuICAgICAgICB0aGlzLm1fZm9yd2FyZEhpc3RvcnkgPSBbXTtcclxuICAgICAgICB0aGlzLm1fcmV2ZXJzZUhpc3RvcnkgPSBbXTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBfaXNTdHJpbmdBcnJheShhcnIpIHtcclxuICAgICAgICByZXR1cm4gKGFyci5sZW5ndGggPiAwICYmIHR5cGVvZiBhcnJbMF0gPT09ICdzdHJpbmcnKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBfZ2V0RWxlbWVudHMoc2VxdWVuY2UpIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IHNlcXVlbmNlLmdldEVsZW1lbnRzKCk7XHJcbiAgICAgICAgaWYgKExjc0RpZmYuX2lzU3RyaW5nQXJyYXkoZWxlbWVudHMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhc2hlcyA9IG5ldyBJbnQzMkFycmF5KGVsZW1lbnRzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaGFzaGVzW2ldID0gc3RyaW5nSGFzaChlbGVtZW50c1tpXSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFtlbGVtZW50cywgaGFzaGVzLCB0cnVlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVsZW1lbnRzIGluc3RhbmNlb2YgSW50MzJBcnJheSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW1tdLCBlbGVtZW50cywgZmFsc2VdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW1tdLCBuZXcgSW50MzJBcnJheShlbGVtZW50cyksIGZhbHNlXTtcclxuICAgIH1cclxuICAgIEVsZW1lbnRzQXJlRXF1YWwob3JpZ2luYWxJbmRleCwgbmV3SW5kZXgpIHtcclxuICAgICAgICBpZiAodGhpcy5fb3JpZ2luYWxFbGVtZW50c09ySGFzaFtvcmlnaW5hbEluZGV4XSAhPT0gdGhpcy5fbW9kaWZpZWRFbGVtZW50c09ySGFzaFtuZXdJbmRleF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hhc1N0cmluZ3MgPyB0aGlzLl9vcmlnaW5hbFN0cmluZ0VsZW1lbnRzW29yaWdpbmFsSW5kZXhdID09PSB0aGlzLl9tb2RpZmllZFN0cmluZ0VsZW1lbnRzW25ld0luZGV4XSA6IHRydWUpO1xyXG4gICAgfVxyXG4gICAgT3JpZ2luYWxFbGVtZW50c0FyZUVxdWFsKGluZGV4MSwgaW5kZXgyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX29yaWdpbmFsRWxlbWVudHNPckhhc2hbaW5kZXgxXSAhPT0gdGhpcy5fb3JpZ2luYWxFbGVtZW50c09ySGFzaFtpbmRleDJdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9oYXNTdHJpbmdzID8gdGhpcy5fb3JpZ2luYWxTdHJpbmdFbGVtZW50c1tpbmRleDFdID09PSB0aGlzLl9vcmlnaW5hbFN0cmluZ0VsZW1lbnRzW2luZGV4Ml0gOiB0cnVlKTtcclxuICAgIH1cclxuICAgIE1vZGlmaWVkRWxlbWVudHNBcmVFcXVhbChpbmRleDEsIGluZGV4Mikge1xyXG4gICAgICAgIGlmICh0aGlzLl9tb2RpZmllZEVsZW1lbnRzT3JIYXNoW2luZGV4MV0gIT09IHRoaXMuX21vZGlmaWVkRWxlbWVudHNPckhhc2hbaW5kZXgyXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAodGhpcy5faGFzU3RyaW5ncyA/IHRoaXMuX21vZGlmaWVkU3RyaW5nRWxlbWVudHNbaW5kZXgxXSA9PT0gdGhpcy5fbW9kaWZpZWRTdHJpbmdFbGVtZW50c1tpbmRleDJdIDogdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBDb21wdXRlRGlmZihwcmV0dHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fQ29tcHV0ZURpZmYoMCwgdGhpcy5fb3JpZ2luYWxFbGVtZW50c09ySGFzaC5sZW5ndGggLSAxLCAwLCB0aGlzLl9tb2RpZmllZEVsZW1lbnRzT3JIYXNoLmxlbmd0aCAtIDEsIHByZXR0eSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENvbXB1dGVzIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSBvcmlnaW5hbCBhbmQgbW9kaWZpZWQgaW5wdXRcclxuICAgICAqIHNlcXVlbmNlcyBvbiB0aGUgYm91bmRlZCByYW5nZS5cclxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSB0d28gaW5wdXQgc2VxdWVuY2VzLlxyXG4gICAgICovXHJcbiAgICBfQ29tcHV0ZURpZmYob3JpZ2luYWxTdGFydCwgb3JpZ2luYWxFbmQsIG1vZGlmaWVkU3RhcnQsIG1vZGlmaWVkRW5kLCBwcmV0dHkpIHtcclxuICAgICAgICBjb25zdCBxdWl0RWFybHlBcnIgPSBbZmFsc2VdO1xyXG4gICAgICAgIGxldCBjaGFuZ2VzID0gdGhpcy5Db21wdXRlRGlmZlJlY3Vyc2l2ZShvcmlnaW5hbFN0YXJ0LCBvcmlnaW5hbEVuZCwgbW9kaWZpZWRTdGFydCwgbW9kaWZpZWRFbmQsIHF1aXRFYXJseUFycik7XHJcbiAgICAgICAgaWYgKHByZXR0eSkge1xyXG4gICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGNsZWFuIHVwIHRoZSBjb21wdXRlZCBkaWZmIHRvIGJlIG1vcmUgaW50dWl0aXZlXHJcbiAgICAgICAgICAgIC8vIGJ1dCBpdCB0dXJucyBvdXQgdGhpcyBjYW5ub3QgYmUgZG9uZSBjb3JyZWN0bHkgdW50aWwgdGhlIGVudGlyZSBzZXRcclxuICAgICAgICAgICAgLy8gb2YgZGlmZnMgaGF2ZSBiZWVuIGNvbXB1dGVkXHJcbiAgICAgICAgICAgIGNoYW5nZXMgPSB0aGlzLlByZXR0aWZ5Q2hhbmdlcyhjaGFuZ2VzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcXVpdEVhcmx5OiBxdWl0RWFybHlBcnJbMF0sXHJcbiAgICAgICAgICAgIGNoYW5nZXM6IGNoYW5nZXNcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBQcml2YXRlIGhlbHBlciBtZXRob2Qgd2hpY2ggY29tcHV0ZXMgdGhlIGRpZmZlcmVuY2VzIG9uIHRoZSBib3VuZGVkIHJhbmdlXHJcbiAgICAgKiByZWN1cnNpdmVseS5cclxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHRoZSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHRoZSB0d28gaW5wdXQgc2VxdWVuY2VzLlxyXG4gICAgICovXHJcbiAgICBDb21wdXRlRGlmZlJlY3Vyc2l2ZShvcmlnaW5hbFN0YXJ0LCBvcmlnaW5hbEVuZCwgbW9kaWZpZWRTdGFydCwgbW9kaWZpZWRFbmQsIHF1aXRFYXJseUFycikge1xyXG4gICAgICAgIHF1aXRFYXJseUFyclswXSA9IGZhbHNlO1xyXG4gICAgICAgIC8vIEZpbmQgdGhlIHN0YXJ0IG9mIHRoZSBkaWZmZXJlbmNlc1xyXG4gICAgICAgIHdoaWxlIChvcmlnaW5hbFN0YXJ0IDw9IG9yaWdpbmFsRW5kICYmIG1vZGlmaWVkU3RhcnQgPD0gbW9kaWZpZWRFbmQgJiYgdGhpcy5FbGVtZW50c0FyZUVxdWFsKG9yaWdpbmFsU3RhcnQsIG1vZGlmaWVkU3RhcnQpKSB7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsU3RhcnQrKztcclxuICAgICAgICAgICAgbW9kaWZpZWRTdGFydCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBGaW5kIHRoZSBlbmQgb2YgdGhlIGRpZmZlcmVuY2VzXHJcbiAgICAgICAgd2hpbGUgKG9yaWdpbmFsRW5kID49IG9yaWdpbmFsU3RhcnQgJiYgbW9kaWZpZWRFbmQgPj0gbW9kaWZpZWRTdGFydCAmJiB0aGlzLkVsZW1lbnRzQXJlRXF1YWwob3JpZ2luYWxFbmQsIG1vZGlmaWVkRW5kKSkge1xyXG4gICAgICAgICAgICBvcmlnaW5hbEVuZC0tO1xyXG4gICAgICAgICAgICBtb2RpZmllZEVuZC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJbiB0aGUgc3BlY2lhbCBjYXNlIHdoZXJlIHdlIGVpdGhlciBoYXZlIGFsbCBpbnNlcnRpb25zIG9yIGFsbCBkZWxldGlvbnMgb3IgdGhlIHNlcXVlbmNlcyBhcmUgaWRlbnRpY2FsXHJcbiAgICAgICAgaWYgKG9yaWdpbmFsU3RhcnQgPiBvcmlnaW5hbEVuZCB8fCBtb2RpZmllZFN0YXJ0ID4gbW9kaWZpZWRFbmQpIHtcclxuICAgICAgICAgICAgbGV0IGNoYW5nZXM7XHJcbiAgICAgICAgICAgIGlmIChtb2RpZmllZFN0YXJ0IDw9IG1vZGlmaWVkRW5kKSB7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Zy5Bc3NlcnQob3JpZ2luYWxTdGFydCA9PT0gb3JpZ2luYWxFbmQgKyAxLCAnb3JpZ2luYWxTdGFydCBzaG91bGQgb25seSBiZSBvbmUgbW9yZSB0aGFuIG9yaWdpbmFsRW5kJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBBbGwgaW5zZXJ0aW9uc1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlcyA9IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRGlmZkNoYW5nZShvcmlnaW5hbFN0YXJ0LCAwLCBtb2RpZmllZFN0YXJ0LCBtb2RpZmllZEVuZCAtIG1vZGlmaWVkU3RhcnQgKyAxKVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChvcmlnaW5hbFN0YXJ0IDw9IG9yaWdpbmFsRW5kKSB7XHJcbiAgICAgICAgICAgICAgICBEZWJ1Zy5Bc3NlcnQobW9kaWZpZWRTdGFydCA9PT0gbW9kaWZpZWRFbmQgKyAxLCAnbW9kaWZpZWRTdGFydCBzaG91bGQgb25seSBiZSBvbmUgbW9yZSB0aGFuIG1vZGlmaWVkRW5kJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBBbGwgZGVsZXRpb25zXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBEaWZmQ2hhbmdlKG9yaWdpbmFsU3RhcnQsIG9yaWdpbmFsRW5kIC0gb3JpZ2luYWxTdGFydCArIDEsIG1vZGlmaWVkU3RhcnQsIDApXHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgRGVidWcuQXNzZXJ0KG9yaWdpbmFsU3RhcnQgPT09IG9yaWdpbmFsRW5kICsgMSwgJ29yaWdpbmFsU3RhcnQgc2hvdWxkIG9ubHkgYmUgb25lIG1vcmUgdGhhbiBvcmlnaW5hbEVuZCcpO1xyXG4gICAgICAgICAgICAgICAgRGVidWcuQXNzZXJ0KG1vZGlmaWVkU3RhcnQgPT09IG1vZGlmaWVkRW5kICsgMSwgJ21vZGlmaWVkU3RhcnQgc2hvdWxkIG9ubHkgYmUgb25lIG1vcmUgdGhhbiBtb2RpZmllZEVuZCcpO1xyXG4gICAgICAgICAgICAgICAgLy8gSWRlbnRpY2FsIHNlcXVlbmNlcyAtIE5vIGRpZmZlcmVuY2VzXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VzID0gW107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGNoYW5nZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRoaXMgcHJvYmxlbSBjYW4gYmUgc29sdmVkIHVzaW5nIHRoZSBEaXZpZGUtQW5kLUNvbnF1ZXIgdGVjaG5pcXVlLlxyXG4gICAgICAgIGNvbnN0IG1pZE9yaWdpbmFsQXJyID0gWzBdO1xyXG4gICAgICAgIGNvbnN0IG1pZE1vZGlmaWVkQXJyID0gWzBdO1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuQ29tcHV0ZVJlY3Vyc2lvblBvaW50KG9yaWdpbmFsU3RhcnQsIG9yaWdpbmFsRW5kLCBtb2RpZmllZFN0YXJ0LCBtb2RpZmllZEVuZCwgbWlkT3JpZ2luYWxBcnIsIG1pZE1vZGlmaWVkQXJyLCBxdWl0RWFybHlBcnIpO1xyXG4gICAgICAgIGNvbnN0IG1pZE9yaWdpbmFsID0gbWlkT3JpZ2luYWxBcnJbMF07XHJcbiAgICAgICAgY29uc3QgbWlkTW9kaWZpZWQgPSBtaWRNb2RpZmllZEFyclswXTtcclxuICAgICAgICBpZiAocmVzdWx0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIFJlc3VsdCBpcyBub3QtbnVsbCB3aGVuIHRoZXJlIHdhcyBlbm91Z2ggbWVtb3J5IHRvIGNvbXB1dGUgdGhlIGNoYW5nZXMgd2hpbGVcclxuICAgICAgICAgICAgLy8gc2VhcmNoaW5nIGZvciB0aGUgcmVjdXJzaW9uIHBvaW50XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCFxdWl0RWFybHlBcnJbMF0pIHtcclxuICAgICAgICAgICAgLy8gV2UgY2FuIGJyZWFrIHRoZSBwcm9ibGVtIGRvd24gcmVjdXJzaXZlbHkgYnkgZmluZGluZyB0aGUgY2hhbmdlcyBpbiB0aGVcclxuICAgICAgICAgICAgLy8gRmlyc3QgSGFsZjogICAob3JpZ2luYWxTdGFydCwgbW9kaWZpZWRTdGFydCkgdG8gKG1pZE9yaWdpbmFsLCBtaWRNb2RpZmllZClcclxuICAgICAgICAgICAgLy8gU2Vjb25kIEhhbGY6ICAobWlkT3JpZ2luYWwgKyAxLCBtaW5Nb2RpZmllZCArIDEpIHRvIChvcmlnaW5hbEVuZCwgbW9kaWZpZWRFbmQpXHJcbiAgICAgICAgICAgIC8vIE5PVEU6IENvbXB1dGVEaWZmKCkgaXMgaW5jbHVzaXZlLCB0aGVyZWZvcmUgdGhlIHNlY29uZCByYW5nZSBzdGFydHMgb24gdGhlIG5leHQgcG9pbnRcclxuICAgICAgICAgICAgY29uc3QgbGVmdENoYW5nZXMgPSB0aGlzLkNvbXB1dGVEaWZmUmVjdXJzaXZlKG9yaWdpbmFsU3RhcnQsIG1pZE9yaWdpbmFsLCBtb2RpZmllZFN0YXJ0LCBtaWRNb2RpZmllZCwgcXVpdEVhcmx5QXJyKTtcclxuICAgICAgICAgICAgbGV0IHJpZ2h0Q2hhbmdlcyA9IFtdO1xyXG4gICAgICAgICAgICBpZiAoIXF1aXRFYXJseUFyclswXSkge1xyXG4gICAgICAgICAgICAgICAgcmlnaHRDaGFuZ2VzID0gdGhpcy5Db21wdXRlRGlmZlJlY3Vyc2l2ZShtaWRPcmlnaW5hbCArIDEsIG9yaWdpbmFsRW5kLCBtaWRNb2RpZmllZCArIDEsIG1vZGlmaWVkRW5kLCBxdWl0RWFybHlBcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgZGlkJ3QgaGF2ZSB0aW1lIHRvIGZpbmlzaCB0aGUgZmlyc3QgaGFsZiwgc28gd2UgZG9uJ3QgaGF2ZSB0aW1lIHRvIGNvbXB1dGUgdGhpcyBoYWxmLlxyXG4gICAgICAgICAgICAgICAgLy8gQ29uc2lkZXIgdGhlIGVudGlyZSByZXN0IG9mIHRoZSBzZXF1ZW5jZSBkaWZmZXJlbnQuXHJcbiAgICAgICAgICAgICAgICByaWdodENoYW5nZXMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IERpZmZDaGFuZ2UobWlkT3JpZ2luYWwgKyAxLCBvcmlnaW5hbEVuZCAtIChtaWRPcmlnaW5hbCArIDEpICsgMSwgbWlkTW9kaWZpZWQgKyAxLCBtb2RpZmllZEVuZCAtIChtaWRNb2RpZmllZCArIDEpICsgMSlcclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuQ29uY2F0ZW5hdGVDaGFuZ2VzKGxlZnRDaGFuZ2VzLCByaWdodENoYW5nZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJZiB3ZSBoaXQgaGVyZSwgd2UgcXVpdCBlYXJseSwgYW5kIHNvIGNhbid0IHJldHVybiBhbnl0aGluZyBtZWFuaW5nZnVsXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgbmV3IERpZmZDaGFuZ2Uob3JpZ2luYWxTdGFydCwgb3JpZ2luYWxFbmQgLSBvcmlnaW5hbFN0YXJ0ICsgMSwgbW9kaWZpZWRTdGFydCwgbW9kaWZpZWRFbmQgLSBtb2RpZmllZFN0YXJ0ICsgMSlcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgV0FMS1RSQUNFKGRpYWdvbmFsRm9yd2FyZEJhc2UsIGRpYWdvbmFsRm9yd2FyZFN0YXJ0LCBkaWFnb25hbEZvcndhcmRFbmQsIGRpYWdvbmFsRm9yd2FyZE9mZnNldCwgZGlhZ29uYWxSZXZlcnNlQmFzZSwgZGlhZ29uYWxSZXZlcnNlU3RhcnQsIGRpYWdvbmFsUmV2ZXJzZUVuZCwgZGlhZ29uYWxSZXZlcnNlT2Zmc2V0LCBmb3J3YXJkUG9pbnRzLCByZXZlcnNlUG9pbnRzLCBvcmlnaW5hbEluZGV4LCBvcmlnaW5hbEVuZCwgbWlkT3JpZ2luYWxBcnIsIG1vZGlmaWVkSW5kZXgsIG1vZGlmaWVkRW5kLCBtaWRNb2RpZmllZEFyciwgZGVsdGFJc0V2ZW4sIHF1aXRFYXJseUFycikge1xyXG4gICAgICAgIGxldCBmb3J3YXJkQ2hhbmdlcyA9IG51bGw7XHJcbiAgICAgICAgbGV0IHJldmVyc2VDaGFuZ2VzID0gbnVsbDtcclxuICAgICAgICAvLyBGaXJzdCwgd2FsayBiYWNrd2FyZCB0aHJvdWdoIHRoZSBmb3J3YXJkIGRpYWdvbmFscyBoaXN0b3J5XHJcbiAgICAgICAgbGV0IGNoYW5nZUhlbHBlciA9IG5ldyBEaWZmQ2hhbmdlSGVscGVyKCk7XHJcbiAgICAgICAgbGV0IGRpYWdvbmFsTWluID0gZGlhZ29uYWxGb3J3YXJkU3RhcnQ7XHJcbiAgICAgICAgbGV0IGRpYWdvbmFsTWF4ID0gZGlhZ29uYWxGb3J3YXJkRW5kO1xyXG4gICAgICAgIGxldCBkaWFnb25hbFJlbGF0aXZlID0gKG1pZE9yaWdpbmFsQXJyWzBdIC0gbWlkTW9kaWZpZWRBcnJbMF0pIC0gZGlhZ29uYWxGb3J3YXJkT2Zmc2V0O1xyXG4gICAgICAgIGxldCBsYXN0T3JpZ2luYWxJbmRleCA9IC0xMDczNzQxODI0IC8qIE1JTl9TQUZFX1NNQUxMX0lOVEVHRVIgKi87XHJcbiAgICAgICAgbGV0IGhpc3RvcnlJbmRleCA9IHRoaXMubV9mb3J3YXJkSGlzdG9yeS5sZW5ndGggLSAxO1xyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgLy8gR2V0IHRoZSBkaWFnb25hbCBpbmRleCBmcm9tIHRoZSByZWxhdGl2ZSBkaWFnb25hbCBudW1iZXJcclxuICAgICAgICAgICAgY29uc3QgZGlhZ29uYWwgPSBkaWFnb25hbFJlbGF0aXZlICsgZGlhZ29uYWxGb3J3YXJkQmFzZTtcclxuICAgICAgICAgICAgLy8gRmlndXJlIG91dCB3aGVyZSB3ZSBjYW1lIGZyb21cclxuICAgICAgICAgICAgaWYgKGRpYWdvbmFsID09PSBkaWFnb25hbE1pbiB8fCAoZGlhZ29uYWwgPCBkaWFnb25hbE1heCAmJiBmb3J3YXJkUG9pbnRzW2RpYWdvbmFsIC0gMV0gPCBmb3J3YXJkUG9pbnRzW2RpYWdvbmFsICsgMV0pKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBWZXJ0aWNhbCBsaW5lICh0aGUgZWxlbWVudCBpcyBhbiBpbnNlcnQpXHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEluZGV4ID0gZm9yd2FyZFBvaW50c1tkaWFnb25hbCArIDFdO1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRJbmRleCA9IG9yaWdpbmFsSW5kZXggLSBkaWFnb25hbFJlbGF0aXZlIC0gZGlhZ29uYWxGb3J3YXJkT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsSW5kZXggPCBsYXN0T3JpZ2luYWxJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZUhlbHBlci5NYXJrTmV4dENoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGFzdE9yaWdpbmFsSW5kZXggPSBvcmlnaW5hbEluZGV4O1xyXG4gICAgICAgICAgICAgICAgY2hhbmdlSGVscGVyLkFkZE1vZGlmaWVkRWxlbWVudChvcmlnaW5hbEluZGV4ICsgMSwgbW9kaWZpZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBkaWFnb25hbFJlbGF0aXZlID0gKGRpYWdvbmFsICsgMSkgLSBkaWFnb25hbEZvcndhcmRCYXNlOyAvL1NldHVwIGZvciB0aGUgbmV4dCBpdGVyYXRpb25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEhvcml6b250YWwgbGluZSAodGhlIGVsZW1lbnQgaXMgYSBkZWxldGlvbilcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggPSBmb3J3YXJkUG9pbnRzW2RpYWdvbmFsIC0gMV0gKyAxO1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRJbmRleCA9IG9yaWdpbmFsSW5kZXggLSBkaWFnb25hbFJlbGF0aXZlIC0gZGlhZ29uYWxGb3J3YXJkT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsSW5kZXggPCBsYXN0T3JpZ2luYWxJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZUhlbHBlci5NYXJrTmV4dENoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGFzdE9yaWdpbmFsSW5kZXggPSBvcmlnaW5hbEluZGV4IC0gMTtcclxuICAgICAgICAgICAgICAgIGNoYW5nZUhlbHBlci5BZGRPcmlnaW5hbEVsZW1lbnQob3JpZ2luYWxJbmRleCwgbW9kaWZpZWRJbmRleCArIDEpO1xyXG4gICAgICAgICAgICAgICAgZGlhZ29uYWxSZWxhdGl2ZSA9IChkaWFnb25hbCAtIDEpIC0gZGlhZ29uYWxGb3J3YXJkQmFzZTsgLy9TZXR1cCBmb3IgdGhlIG5leHQgaXRlcmF0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGhpc3RvcnlJbmRleCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3J3YXJkUG9pbnRzID0gdGhpcy5tX2ZvcndhcmRIaXN0b3J5W2hpc3RvcnlJbmRleF07XHJcbiAgICAgICAgICAgICAgICBkaWFnb25hbEZvcndhcmRCYXNlID0gZm9yd2FyZFBvaW50c1swXTsgLy9XZSBzdG9yZWQgdGhpcyBpbiB0aGUgZmlyc3Qgc3BvdFxyXG4gICAgICAgICAgICAgICAgZGlhZ29uYWxNaW4gPSAxO1xyXG4gICAgICAgICAgICAgICAgZGlhZ29uYWxNYXggPSBmb3J3YXJkUG9pbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IHdoaWxlICgtLWhpc3RvcnlJbmRleCA+PSAtMSk7XHJcbiAgICAgICAgLy8gSXJvbmljYWxseSwgd2UgZ2V0IHRoZSBmb3J3YXJkIGNoYW5nZXMgYXMgdGhlIHJldmVyc2Ugb2YgdGhlXHJcbiAgICAgICAgLy8gb3JkZXIgd2UgYWRkZWQgdGhlbSBzaW5jZSB3ZSB0ZWNobmljYWxseSBhZGRlZCB0aGVtIGJhY2t3YXJkc1xyXG4gICAgICAgIGZvcndhcmRDaGFuZ2VzID0gY2hhbmdlSGVscGVyLmdldFJldmVyc2VDaGFuZ2VzKCk7XHJcbiAgICAgICAgaWYgKHF1aXRFYXJseUFyclswXSkge1xyXG4gICAgICAgICAgICAvLyBUT0RPOiBDYWxjdWxhdGUgYSBwYXJ0aWFsIGZyb20gdGhlIHJldmVyc2UgZGlhZ29uYWxzLlxyXG4gICAgICAgICAgICAvLyAgICAgICBGb3Igbm93LCBqdXN0IGFzc3VtZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBtaWRPcmlnaW5hbC9taWRNb2RpZmllZCBwb2ludCBpcyBhIGRpZmZcclxuICAgICAgICAgICAgbGV0IG9yaWdpbmFsU3RhcnRQb2ludCA9IG1pZE9yaWdpbmFsQXJyWzBdICsgMTtcclxuICAgICAgICAgICAgbGV0IG1vZGlmaWVkU3RhcnRQb2ludCA9IG1pZE1vZGlmaWVkQXJyWzBdICsgMTtcclxuICAgICAgICAgICAgaWYgKGZvcndhcmRDaGFuZ2VzICE9PSBudWxsICYmIGZvcndhcmRDaGFuZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RGb3J3YXJkQ2hhbmdlID0gZm9yd2FyZENoYW5nZXNbZm9yd2FyZENoYW5nZXMubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFN0YXJ0UG9pbnQgPSBNYXRoLm1heChvcmlnaW5hbFN0YXJ0UG9pbnQsIGxhc3RGb3J3YXJkQ2hhbmdlLmdldE9yaWdpbmFsRW5kKCkpO1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRTdGFydFBvaW50ID0gTWF0aC5tYXgobW9kaWZpZWRTdGFydFBvaW50LCBsYXN0Rm9yd2FyZENoYW5nZS5nZXRNb2RpZmllZEVuZCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXZlcnNlQ2hhbmdlcyA9IFtcclxuICAgICAgICAgICAgICAgIG5ldyBEaWZmQ2hhbmdlKG9yaWdpbmFsU3RhcnRQb2ludCwgb3JpZ2luYWxFbmQgLSBvcmlnaW5hbFN0YXJ0UG9pbnQgKyAxLCBtb2RpZmllZFN0YXJ0UG9pbnQsIG1vZGlmaWVkRW5kIC0gbW9kaWZpZWRTdGFydFBvaW50ICsgMSlcclxuICAgICAgICAgICAgXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIE5vdyB3YWxrIGJhY2t3YXJkIHRocm91Z2ggdGhlIHJldmVyc2UgZGlhZ29uYWxzIGhpc3RvcnlcclxuICAgICAgICAgICAgY2hhbmdlSGVscGVyID0gbmV3IERpZmZDaGFuZ2VIZWxwZXIoKTtcclxuICAgICAgICAgICAgZGlhZ29uYWxNaW4gPSBkaWFnb25hbFJldmVyc2VTdGFydDtcclxuICAgICAgICAgICAgZGlhZ29uYWxNYXggPSBkaWFnb25hbFJldmVyc2VFbmQ7XHJcbiAgICAgICAgICAgIGRpYWdvbmFsUmVsYXRpdmUgPSAobWlkT3JpZ2luYWxBcnJbMF0gLSBtaWRNb2RpZmllZEFyclswXSkgLSBkaWFnb25hbFJldmVyc2VPZmZzZXQ7XHJcbiAgICAgICAgICAgIGxhc3RPcmlnaW5hbEluZGV4ID0gMTA3Mzc0MTgyNCAvKiBNQVhfU0FGRV9TTUFMTF9JTlRFR0VSICovO1xyXG4gICAgICAgICAgICBoaXN0b3J5SW5kZXggPSAoZGVsdGFJc0V2ZW4pID8gdGhpcy5tX3JldmVyc2VIaXN0b3J5Lmxlbmd0aCAtIDEgOiB0aGlzLm1fcmV2ZXJzZUhpc3RvcnkubGVuZ3RoIC0gMjtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBkaWFnb25hbCBpbmRleCBmcm9tIHRoZSByZWxhdGl2ZSBkaWFnb25hbCBudW1iZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpYWdvbmFsID0gZGlhZ29uYWxSZWxhdGl2ZSArIGRpYWdvbmFsUmV2ZXJzZUJhc2U7XHJcbiAgICAgICAgICAgICAgICAvLyBGaWd1cmUgb3V0IHdoZXJlIHdlIGNhbWUgZnJvbVxyXG4gICAgICAgICAgICAgICAgaWYgKGRpYWdvbmFsID09PSBkaWFnb25hbE1pbiB8fCAoZGlhZ29uYWwgPCBkaWFnb25hbE1heCAmJiByZXZlcnNlUG9pbnRzW2RpYWdvbmFsIC0gMV0gPj0gcmV2ZXJzZVBvaW50c1tkaWFnb25hbCArIDFdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEhvcml6b250YWwgbGluZSAodGhlIGVsZW1lbnQgaXMgYSBkZWxldGlvbikpXHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxJbmRleCA9IHJldmVyc2VQb2ludHNbZGlhZ29uYWwgKyAxXSAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRJbmRleCA9IG9yaWdpbmFsSW5kZXggLSBkaWFnb25hbFJlbGF0aXZlIC0gZGlhZ29uYWxSZXZlcnNlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbEluZGV4ID4gbGFzdE9yaWdpbmFsSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlSGVscGVyLk1hcmtOZXh0Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RPcmlnaW5hbEluZGV4ID0gb3JpZ2luYWxJbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlSGVscGVyLkFkZE9yaWdpbmFsRWxlbWVudChvcmlnaW5hbEluZGV4ICsgMSwgbW9kaWZpZWRJbmRleCArIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRpYWdvbmFsUmVsYXRpdmUgPSAoZGlhZ29uYWwgKyAxKSAtIGRpYWdvbmFsUmV2ZXJzZUJhc2U7IC8vU2V0dXAgZm9yIHRoZSBuZXh0IGl0ZXJhdGlvblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVmVydGljYWwgbGluZSAodGhlIGVsZW1lbnQgaXMgYW4gaW5zZXJ0aW9uKVxyXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggPSByZXZlcnNlUG9pbnRzW2RpYWdvbmFsIC0gMV07XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRJbmRleCA9IG9yaWdpbmFsSW5kZXggLSBkaWFnb25hbFJlbGF0aXZlIC0gZGlhZ29uYWxSZXZlcnNlT2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbEluZGV4ID4gbGFzdE9yaWdpbmFsSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlSGVscGVyLk1hcmtOZXh0Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RPcmlnaW5hbEluZGV4ID0gb3JpZ2luYWxJbmRleDtcclxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2VIZWxwZXIuQWRkTW9kaWZpZWRFbGVtZW50KG9yaWdpbmFsSW5kZXggKyAxLCBtb2RpZmllZEluZGV4ICsgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlhZ29uYWxSZWxhdGl2ZSA9IChkaWFnb25hbCAtIDEpIC0gZGlhZ29uYWxSZXZlcnNlQmFzZTsgLy9TZXR1cCBmb3IgdGhlIG5leHQgaXRlcmF0aW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaGlzdG9yeUluZGV4ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXZlcnNlUG9pbnRzID0gdGhpcy5tX3JldmVyc2VIaXN0b3J5W2hpc3RvcnlJbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgZGlhZ29uYWxSZXZlcnNlQmFzZSA9IHJldmVyc2VQb2ludHNbMF07IC8vV2Ugc3RvcmVkIHRoaXMgaW4gdGhlIGZpcnN0IHNwb3RcclxuICAgICAgICAgICAgICAgICAgICBkaWFnb25hbE1pbiA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlhZ29uYWxNYXggPSByZXZlcnNlUG9pbnRzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKC0taGlzdG9yeUluZGV4ID49IC0xKTtcclxuICAgICAgICAgICAgLy8gVGhlcmUgYXJlIGNhc2VzIHdoZXJlIHRoZSByZXZlcnNlIGhpc3Rvcnkgd2lsbCBmaW5kIGRpZmZzIHRoYXRcclxuICAgICAgICAgICAgLy8gYXJlIGNvcnJlY3QsIGJ1dCBub3QgaW50dWl0aXZlLCBzbyB3ZSBuZWVkIHNoaWZ0IHRoZW0uXHJcbiAgICAgICAgICAgIHJldmVyc2VDaGFuZ2VzID0gY2hhbmdlSGVscGVyLmdldENoYW5nZXMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuQ29uY2F0ZW5hdGVDaGFuZ2VzKGZvcndhcmRDaGFuZ2VzLCByZXZlcnNlQ2hhbmdlcyk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIHRoZSByYW5nZSB0byBjb21wdXRlIHRoZSBkaWZmIG9uLCB0aGlzIG1ldGhvZCBmaW5kcyB0aGUgcG9pbnQ6XHJcbiAgICAgKiAobWlkT3JpZ2luYWwsIG1pZE1vZGlmaWVkKVxyXG4gICAgICogdGhhdCBleGlzdHMgaW4gdGhlIG1pZGRsZSBvZiB0aGUgTENTIG9mIHRoZSB0d28gc2VxdWVuY2VzIGFuZFxyXG4gICAgICogaXMgdGhlIHBvaW50IGF0IHdoaWNoIHRoZSBMQ1MgcHJvYmxlbSBtYXkgYmUgYnJva2VuIGRvd24gcmVjdXJzaXZlbHkuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCB3aWxsIHRyeSB0byBrZWVwIHRoZSBMQ1MgdHJhY2UgaW4gbWVtb3J5LiBJZiB0aGUgTENTIHJlY3Vyc2lvblxyXG4gICAgICogcG9pbnQgaXMgY2FsY3VsYXRlZCBhbmQgdGhlIGZ1bGwgdHJhY2UgaXMgYXZhaWxhYmxlIGluIG1lbW9yeSwgdGhlbiB0aGlzIG1ldGhvZFxyXG4gICAgICogd2lsbCByZXR1cm4gdGhlIGNoYW5nZSBsaXN0LlxyXG4gICAgICogQHBhcmFtIG9yaWdpbmFsU3RhcnQgVGhlIHN0YXJ0IGJvdW5kIG9mIHRoZSBvcmlnaW5hbCBzZXF1ZW5jZSByYW5nZVxyXG4gICAgICogQHBhcmFtIG9yaWdpbmFsRW5kIFRoZSBlbmQgYm91bmQgb2YgdGhlIG9yaWdpbmFsIHNlcXVlbmNlIHJhbmdlXHJcbiAgICAgKiBAcGFyYW0gbW9kaWZpZWRTdGFydCBUaGUgc3RhcnQgYm91bmQgb2YgdGhlIG1vZGlmaWVkIHNlcXVlbmNlIHJhbmdlXHJcbiAgICAgKiBAcGFyYW0gbW9kaWZpZWRFbmQgVGhlIGVuZCBib3VuZCBvZiB0aGUgbW9kaWZpZWQgc2VxdWVuY2UgcmFuZ2VcclxuICAgICAqIEBwYXJhbSBtaWRPcmlnaW5hbCBUaGUgbWlkZGxlIHBvaW50IG9mIHRoZSBvcmlnaW5hbCBzZXF1ZW5jZSByYW5nZVxyXG4gICAgICogQHBhcmFtIG1pZE1vZGlmaWVkIFRoZSBtaWRkbGUgcG9pbnQgb2YgdGhlIG1vZGlmaWVkIHNlcXVlbmNlIHJhbmdlXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgZGlmZiBjaGFuZ2VzLCBpZiBhdmFpbGFibGUsIG90aGVyd2lzZSBudWxsXHJcbiAgICAgKi9cclxuICAgIENvbXB1dGVSZWN1cnNpb25Qb2ludChvcmlnaW5hbFN0YXJ0LCBvcmlnaW5hbEVuZCwgbW9kaWZpZWRTdGFydCwgbW9kaWZpZWRFbmQsIG1pZE9yaWdpbmFsQXJyLCBtaWRNb2RpZmllZEFyciwgcXVpdEVhcmx5QXJyKSB7XHJcbiAgICAgICAgbGV0IG9yaWdpbmFsSW5kZXggPSAwLCBtb2RpZmllZEluZGV4ID0gMDtcclxuICAgICAgICBsZXQgZGlhZ29uYWxGb3J3YXJkU3RhcnQgPSAwLCBkaWFnb25hbEZvcndhcmRFbmQgPSAwO1xyXG4gICAgICAgIGxldCBkaWFnb25hbFJldmVyc2VTdGFydCA9IDAsIGRpYWdvbmFsUmV2ZXJzZUVuZCA9IDA7XHJcbiAgICAgICAgLy8gVG8gdHJhdmVyc2UgdGhlIGVkaXQgZ3JhcGggYW5kIHByb2R1Y2UgdGhlIHByb3BlciBMQ1MsIG91ciBhY3R1YWxcclxuICAgICAgICAvLyBzdGFydCBwb3NpdGlvbiBpcyBqdXN0IG91dHNpZGUgdGhlIGdpdmVuIGJvdW5kYXJ5XHJcbiAgICAgICAgb3JpZ2luYWxTdGFydC0tO1xyXG4gICAgICAgIG1vZGlmaWVkU3RhcnQtLTtcclxuICAgICAgICAvLyBXZSBzZXQgdGhlc2UgdXAgdG8gbWFrZSB0aGUgY29tcGlsZXIgaGFwcHksIGJ1dCB0aGV5IHdpbGxcclxuICAgICAgICAvLyBiZSByZXBsYWNlZCBiZWZvcmUgd2UgcmV0dXJuIHdpdGggdGhlIGFjdHVhbCByZWN1cnNpb24gcG9pbnRcclxuICAgICAgICBtaWRPcmlnaW5hbEFyclswXSA9IDA7XHJcbiAgICAgICAgbWlkTW9kaWZpZWRBcnJbMF0gPSAwO1xyXG4gICAgICAgIC8vIENsZWFyIG91dCB0aGUgaGlzdG9yeVxyXG4gICAgICAgIHRoaXMubV9mb3J3YXJkSGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIHRoaXMubV9yZXZlcnNlSGlzdG9yeSA9IFtdO1xyXG4gICAgICAgIC8vIEVhY2ggY2VsbCBpbiB0aGUgdHdvIGFycmF5cyBjb3JyZXNwb25kcyB0byBhIGRpYWdvbmFsIGluIHRoZSBlZGl0IGdyYXBoLlxyXG4gICAgICAgIC8vIFRoZSBpbnRlZ2VyIHZhbHVlIGluIHRoZSBjZWxsIHJlcHJlc2VudHMgdGhlIG9yaWdpbmFsSW5kZXggb2YgdGhlIGZ1cnRoZXN0XHJcbiAgICAgICAgLy8gcmVhY2hpbmcgcG9pbnQgZm91bmQgc28gZmFyIHRoYXQgZW5kcyBpbiB0aGF0IGRpYWdvbmFsLlxyXG4gICAgICAgIC8vIFRoZSBtb2RpZmllZEluZGV4IGNhbiBiZSBjb21wdXRlZCBtYXRoZW1hdGljYWxseSBmcm9tIHRoZSBvcmlnaW5hbEluZGV4IGFuZCB0aGUgZGlhZ29uYWwgbnVtYmVyLlxyXG4gICAgICAgIGNvbnN0IG1heERpZmZlcmVuY2VzID0gKG9yaWdpbmFsRW5kIC0gb3JpZ2luYWxTdGFydCkgKyAobW9kaWZpZWRFbmQgLSBtb2RpZmllZFN0YXJ0KTtcclxuICAgICAgICBjb25zdCBudW1EaWFnb25hbHMgPSBtYXhEaWZmZXJlbmNlcyArIDE7XHJcbiAgICAgICAgY29uc3QgZm9yd2FyZFBvaW50cyA9IG5ldyBJbnQzMkFycmF5KG51bURpYWdvbmFscyk7XHJcbiAgICAgICAgY29uc3QgcmV2ZXJzZVBvaW50cyA9IG5ldyBJbnQzMkFycmF5KG51bURpYWdvbmFscyk7XHJcbiAgICAgICAgLy8gZGlhZ29uYWxGb3J3YXJkQmFzZTogSW5kZXggaW50byBmb3J3YXJkUG9pbnRzIG9mIHRoZSBkaWFnb25hbCB3aGljaCBwYXNzZXMgdGhyb3VnaCAob3JpZ2luYWxTdGFydCwgbW9kaWZpZWRTdGFydClcclxuICAgICAgICAvLyBkaWFnb25hbFJldmVyc2VCYXNlOiBJbmRleCBpbnRvIHJldmVyc2VQb2ludHMgb2YgdGhlIGRpYWdvbmFsIHdoaWNoIHBhc3NlcyB0aHJvdWdoIChvcmlnaW5hbEVuZCwgbW9kaWZpZWRFbmQpXHJcbiAgICAgICAgY29uc3QgZGlhZ29uYWxGb3J3YXJkQmFzZSA9IChtb2RpZmllZEVuZCAtIG1vZGlmaWVkU3RhcnQpO1xyXG4gICAgICAgIGNvbnN0IGRpYWdvbmFsUmV2ZXJzZUJhc2UgPSAob3JpZ2luYWxFbmQgLSBvcmlnaW5hbFN0YXJ0KTtcclxuICAgICAgICAvLyBkaWFnb25hbEZvcndhcmRPZmZzZXQ6IEdlb21ldHJpYyBvZmZzZXQgd2hpY2ggYWxsb3dzIG1vZGlmaWVkSW5kZXggdG8gYmUgY29tcHV0ZWQgZnJvbSBvcmlnaW5hbEluZGV4IGFuZCB0aGVcclxuICAgICAgICAvLyAgICBkaWFnb25hbCBudW1iZXIgKHJlbGF0aXZlIHRvIGRpYWdvbmFsRm9yd2FyZEJhc2UpXHJcbiAgICAgICAgLy8gZGlhZ29uYWxSZXZlcnNlT2Zmc2V0OiBHZW9tZXRyaWMgb2Zmc2V0IHdoaWNoIGFsbG93cyBtb2RpZmllZEluZGV4IHRvIGJlIGNvbXB1dGVkIGZyb20gb3JpZ2luYWxJbmRleCBhbmQgdGhlXHJcbiAgICAgICAgLy8gICAgZGlhZ29uYWwgbnVtYmVyIChyZWxhdGl2ZSB0byBkaWFnb25hbFJldmVyc2VCYXNlKVxyXG4gICAgICAgIGNvbnN0IGRpYWdvbmFsRm9yd2FyZE9mZnNldCA9IChvcmlnaW5hbFN0YXJ0IC0gbW9kaWZpZWRTdGFydCk7XHJcbiAgICAgICAgY29uc3QgZGlhZ29uYWxSZXZlcnNlT2Zmc2V0ID0gKG9yaWdpbmFsRW5kIC0gbW9kaWZpZWRFbmQpO1xyXG4gICAgICAgIC8vIGRlbHRhOiBUaGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBlbmQgZGlhZ29uYWwgYW5kIHRoZSBzdGFydCBkaWFnb25hbC4gVGhpcyBpcyB1c2VkIHRvIHJlbGF0ZSBkaWFnb25hbCBudW1iZXJzXHJcbiAgICAgICAgLy8gICByZWxhdGl2ZSB0byB0aGUgc3RhcnQgZGlhZ29uYWwgd2l0aCBkaWFnb25hbCBudW1iZXJzIHJlbGF0aXZlIHRvIHRoZSBlbmQgZGlhZ29uYWwuXHJcbiAgICAgICAgLy8gVGhlIEV2ZW4vT2Rkbi1uZXNzIG9mIHRoaXMgZGVsdGEgaXMgaW1wb3J0YW50IGZvciBkZXRlcm1pbmluZyB3aGVuIHdlIHNob3VsZCBjaGVjayBmb3Igb3ZlcmxhcFxyXG4gICAgICAgIGNvbnN0IGRlbHRhID0gZGlhZ29uYWxSZXZlcnNlQmFzZSAtIGRpYWdvbmFsRm9yd2FyZEJhc2U7XHJcbiAgICAgICAgY29uc3QgZGVsdGFJc0V2ZW4gPSAoZGVsdGEgJSAyID09PSAwKTtcclxuICAgICAgICAvLyBIZXJlIHdlIHNldCB1cCB0aGUgc3RhcnQgYW5kIGVuZCBwb2ludHMgYXMgdGhlIGZ1cnRoZXN0IHBvaW50cyBmb3VuZCBzbyBmYXJcclxuICAgICAgICAvLyBpbiBib3RoIHRoZSBmb3J3YXJkIGFuZCByZXZlcnNlIGRpcmVjdGlvbnMsIHJlc3BlY3RpdmVseVxyXG4gICAgICAgIGZvcndhcmRQb2ludHNbZGlhZ29uYWxGb3J3YXJkQmFzZV0gPSBvcmlnaW5hbFN0YXJ0O1xyXG4gICAgICAgIHJldmVyc2VQb2ludHNbZGlhZ29uYWxSZXZlcnNlQmFzZV0gPSBvcmlnaW5hbEVuZDtcclxuICAgICAgICAvLyBSZW1lbWJlciBpZiB3ZSBxdWl0IGVhcmx5LCBhbmQgdGh1cyBuZWVkIHRvIGRvIGEgYmVzdC1lZmZvcnQgcmVzdWx0IGluc3RlYWQgb2YgYSByZWFsIHJlc3VsdC5cclxuICAgICAgICBxdWl0RWFybHlBcnJbMF0gPSBmYWxzZTtcclxuICAgICAgICAvLyBBIGNvdXBsZSBvZiBwb2ludHM6XHJcbiAgICAgICAgLy8gLS1XaXRoIHRoaXMgbWV0aG9kLCB3ZSBpdGVyYXRlIG9uIHRoZSBudW1iZXIgb2YgZGlmZmVyZW5jZXMgYmV0d2VlbiB0aGUgdHdvIHNlcXVlbmNlcy5cclxuICAgICAgICAvLyAgIFRoZSBtb3JlIGRpZmZlcmVuY2VzIHRoZXJlIGFjdHVhbGx5IGFyZSwgdGhlIGxvbmdlciB0aGlzIHdpbGwgdGFrZS5cclxuICAgICAgICAvLyAtLUFsc28sIGFzIHRoZSBudW1iZXIgb2YgZGlmZmVyZW5jZXMgaW5jcmVhc2VzLCB3ZSBoYXZlIHRvIHNlYXJjaCBvbiBkaWFnb25hbHMgZnVydGhlclxyXG4gICAgICAgIC8vICAgYXdheSBmcm9tIHRoZSByZWZlcmVuY2UgZGlhZ29uYWwgKHdoaWNoIGlzIGRpYWdvbmFsRm9yd2FyZEJhc2UgZm9yIGZvcndhcmQsIGRpYWdvbmFsUmV2ZXJzZUJhc2UgZm9yIHJldmVyc2UpLlxyXG4gICAgICAgIC8vIC0tV2UgZXh0ZW5kIG9uIGV2ZW4gZGlhZ29uYWxzIChyZWxhdGl2ZSB0byB0aGUgcmVmZXJlbmNlIGRpYWdvbmFsKSBvbmx5IHdoZW4gbnVtRGlmZmVyZW5jZXNcclxuICAgICAgICAvLyAgIGlzIGV2ZW4gYW5kIG9kZCBkaWFnb25hbHMgb25seSB3aGVuIG51bURpZmZlcmVuY2VzIGlzIG9kZC5cclxuICAgICAgICBmb3IgKGxldCBudW1EaWZmZXJlbmNlcyA9IDE7IG51bURpZmZlcmVuY2VzIDw9IChtYXhEaWZmZXJlbmNlcyAvIDIpICsgMTsgbnVtRGlmZmVyZW5jZXMrKykge1xyXG4gICAgICAgICAgICBsZXQgZnVydGhlc3RPcmlnaW5hbEluZGV4ID0gMDtcclxuICAgICAgICAgICAgbGV0IGZ1cnRoZXN0TW9kaWZpZWRJbmRleCA9IDA7XHJcbiAgICAgICAgICAgIC8vIFJ1biB0aGUgYWxnb3JpdGhtIGluIHRoZSBmb3J3YXJkIGRpcmVjdGlvblxyXG4gICAgICAgICAgICBkaWFnb25hbEZvcndhcmRTdGFydCA9IHRoaXMuQ2xpcERpYWdvbmFsQm91bmQoZGlhZ29uYWxGb3J3YXJkQmFzZSAtIG51bURpZmZlcmVuY2VzLCBudW1EaWZmZXJlbmNlcywgZGlhZ29uYWxGb3J3YXJkQmFzZSwgbnVtRGlhZ29uYWxzKTtcclxuICAgICAgICAgICAgZGlhZ29uYWxGb3J3YXJkRW5kID0gdGhpcy5DbGlwRGlhZ29uYWxCb3VuZChkaWFnb25hbEZvcndhcmRCYXNlICsgbnVtRGlmZmVyZW5jZXMsIG51bURpZmZlcmVuY2VzLCBkaWFnb25hbEZvcndhcmRCYXNlLCBudW1EaWFnb25hbHMpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBkaWFnb25hbCA9IGRpYWdvbmFsRm9yd2FyZFN0YXJ0OyBkaWFnb25hbCA8PSBkaWFnb25hbEZvcndhcmRFbmQ7IGRpYWdvbmFsICs9IDIpIHtcclxuICAgICAgICAgICAgICAgIC8vIFNURVAgMTogV2UgZXh0ZW5kIHRoZSBmdXJ0aGVzdCByZWFjaGluZyBwb2ludCBpbiB0aGUgcHJlc2VudCBkaWFnb25hbFxyXG4gICAgICAgICAgICAgICAgLy8gYnkgbG9va2luZyBhdCB0aGUgZGlhZ29uYWxzIGFib3ZlIGFuZCBiZWxvdyBhbmQgcGlja2luZyB0aGUgb25lIHdob3NlIHBvaW50XHJcbiAgICAgICAgICAgICAgICAvLyBpcyBmdXJ0aGVyIGF3YXkgZnJvbSB0aGUgc3RhcnQgcG9pbnQgKG9yaWdpbmFsU3RhcnQsIG1vZGlmaWVkU3RhcnQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlhZ29uYWwgPT09IGRpYWdvbmFsRm9yd2FyZFN0YXJ0IHx8IChkaWFnb25hbCA8IGRpYWdvbmFsRm9yd2FyZEVuZCAmJiBmb3J3YXJkUG9pbnRzW2RpYWdvbmFsIC0gMV0gPCBmb3J3YXJkUG9pbnRzW2RpYWdvbmFsICsgMV0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxJbmRleCA9IGZvcndhcmRQb2ludHNbZGlhZ29uYWwgKyAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggPSBmb3J3YXJkUG9pbnRzW2RpYWdvbmFsIC0gMV0gKyAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRJbmRleCA9IG9yaWdpbmFsSW5kZXggLSAoZGlhZ29uYWwgLSBkaWFnb25hbEZvcndhcmRCYXNlKSAtIGRpYWdvbmFsRm9yd2FyZE9mZnNldDtcclxuICAgICAgICAgICAgICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgb3JpZ2luYWxJbmRleCBzbyB3ZSBjYW4gdGVzdCBmb3IgZmFsc2Ugb3ZlcmxhcCBpbiBzdGVwIDNcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBPcmlnaW5hbEluZGV4ID0gb3JpZ2luYWxJbmRleDtcclxuICAgICAgICAgICAgICAgIC8vIFNURVAgMjogV2UgY2FuIGNvbnRpbnVlIHRvIGV4dGVuZCB0aGUgZnVydGhlc3QgcmVhY2hpbmcgcG9pbnQgaW4gdGhlIHByZXNlbnQgZGlhZ29uYWxcclxuICAgICAgICAgICAgICAgIC8vIHNvIGxvbmcgYXMgdGhlIGVsZW1lbnRzIGFyZSBlcXVhbC5cclxuICAgICAgICAgICAgICAgIHdoaWxlIChvcmlnaW5hbEluZGV4IDwgb3JpZ2luYWxFbmQgJiYgbW9kaWZpZWRJbmRleCA8IG1vZGlmaWVkRW5kICYmIHRoaXMuRWxlbWVudHNBcmVFcXVhbChvcmlnaW5hbEluZGV4ICsgMSwgbW9kaWZpZWRJbmRleCArIDEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkSW5kZXgrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvcndhcmRQb2ludHNbZGlhZ29uYWxdID0gb3JpZ2luYWxJbmRleDtcclxuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbEluZGV4ICsgbW9kaWZpZWRJbmRleCA+IGZ1cnRoZXN0T3JpZ2luYWxJbmRleCArIGZ1cnRoZXN0TW9kaWZpZWRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1cnRoZXN0T3JpZ2luYWxJbmRleCA9IG9yaWdpbmFsSW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVydGhlc3RNb2RpZmllZEluZGV4ID0gbW9kaWZpZWRJbmRleDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIFNURVAgMzogSWYgZGVsdGEgaXMgb2RkIChvdmVybGFwIGZpcnN0IGhhcHBlbnMgb24gZm9yd2FyZCB3aGVuIGRlbHRhIGlzIG9kZClcclxuICAgICAgICAgICAgICAgIC8vIGFuZCBkaWFnb25hbCBpcyBpbiB0aGUgcmFuZ2Ugb2YgcmV2ZXJzZSBkaWFnb25hbHMgY29tcHV0ZWQgZm9yIG51bURpZmZlcmVuY2VzLTFcclxuICAgICAgICAgICAgICAgIC8vICh0aGUgcHJldmlvdXMgaXRlcmF0aW9uOyB3ZSBoYXZlbid0IGNvbXB1dGVkIHJldmVyc2UgZGlhZ29uYWxzIGZvciBudW1EaWZmZXJlbmNlcyB5ZXQpXHJcbiAgICAgICAgICAgICAgICAvLyB0aGVuIGNoZWNrIGZvciBvdmVybGFwLlxyXG4gICAgICAgICAgICAgICAgaWYgKCFkZWx0YUlzRXZlbiAmJiBNYXRoLmFicyhkaWFnb25hbCAtIGRpYWdvbmFsUmV2ZXJzZUJhc2UpIDw9IChudW1EaWZmZXJlbmNlcyAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsSW5kZXggPj0gcmV2ZXJzZVBvaW50c1tkaWFnb25hbF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWlkT3JpZ2luYWxBcnJbMF0gPSBvcmlnaW5hbEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWRNb2RpZmllZEFyclswXSA9IG1vZGlmaWVkSW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZW1wT3JpZ2luYWxJbmRleCA8PSByZXZlcnNlUG9pbnRzW2RpYWdvbmFsXSAmJiAxNDQ3IC8qIE1heERpZmZlcmVuY2VzSGlzdG9yeSAqLyA+IDAgJiYgbnVtRGlmZmVyZW5jZXMgPD0gKDE0NDcgLyogTWF4RGlmZmVyZW5jZXNIaXN0b3J5ICovICsgMSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJJTkdPISBXZSBvdmVybGFwcGVkLCBhbmQgd2UgaGF2ZSB0aGUgZnVsbCB0cmFjZSBpbiBtZW1vcnkhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5XQUxLVFJBQ0UoZGlhZ29uYWxGb3J3YXJkQmFzZSwgZGlhZ29uYWxGb3J3YXJkU3RhcnQsIGRpYWdvbmFsRm9yd2FyZEVuZCwgZGlhZ29uYWxGb3J3YXJkT2Zmc2V0LCBkaWFnb25hbFJldmVyc2VCYXNlLCBkaWFnb25hbFJldmVyc2VTdGFydCwgZGlhZ29uYWxSZXZlcnNlRW5kLCBkaWFnb25hbFJldmVyc2VPZmZzZXQsIGZvcndhcmRQb2ludHMsIHJldmVyc2VQb2ludHMsIG9yaWdpbmFsSW5kZXgsIG9yaWdpbmFsRW5kLCBtaWRPcmlnaW5hbEFyciwgbW9kaWZpZWRJbmRleCwgbW9kaWZpZWRFbmQsIG1pZE1vZGlmaWVkQXJyLCBkZWx0YUlzRXZlbiwgcXVpdEVhcmx5QXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVpdGhlciBmYWxzZSBvdmVybGFwLCBvciB3ZSBkaWRuJ3QgaGF2ZSBlbm91Z2ggbWVtb3J5IGZvciB0aGUgZnVsbCB0cmFjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCByZXR1cm4gdGhlIHJlY3Vyc2lvbiBwb2ludFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHdlIHNob3VsZCBiZSBxdWl0dGluZyBlYXJseSwgYmVmb3JlIG1vdmluZyBvbiB0byB0aGUgbmV4dCBpdGVyYXRpb24uXHJcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoTGVuZ3RoT2ZMb25nZXN0ID0gKChmdXJ0aGVzdE9yaWdpbmFsSW5kZXggLSBvcmlnaW5hbFN0YXJ0KSArIChmdXJ0aGVzdE1vZGlmaWVkSW5kZXggLSBtb2RpZmllZFN0YXJ0KSAtIG51bURpZmZlcmVuY2VzKSAvIDI7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLkNvbnRpbnVlUHJvY2Vzc2luZ1ByZWRpY2F0ZSAhPT0gbnVsbCAmJiAhdGhpcy5Db250aW51ZVByb2Nlc3NpbmdQcmVkaWNhdGUoZnVydGhlc3RPcmlnaW5hbEluZGV4LCBtYXRjaExlbmd0aE9mTG9uZ2VzdCkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIGNhbid0IGZpbmlzaCwgc28gc2tpcCBhaGVhZCB0byBnZW5lcmF0aW5nIGEgcmVzdWx0IGZyb20gd2hhdCB3ZSBoYXZlLlxyXG4gICAgICAgICAgICAgICAgcXVpdEVhcmx5QXJyWzBdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIC8vIFVzZSB0aGUgZnVydGhlc3QgZGlzdGFuY2Ugd2UgZ290IGluIHRoZSBmb3J3YXJkIGRpcmVjdGlvbi5cclxuICAgICAgICAgICAgICAgIG1pZE9yaWdpbmFsQXJyWzBdID0gZnVydGhlc3RPcmlnaW5hbEluZGV4O1xyXG4gICAgICAgICAgICAgICAgbWlkTW9kaWZpZWRBcnJbMF0gPSBmdXJ0aGVzdE1vZGlmaWVkSW5kZXg7XHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hMZW5ndGhPZkxvbmdlc3QgPiAwICYmIDE0NDcgLyogTWF4RGlmZmVyZW5jZXNIaXN0b3J5ICovID4gMCAmJiBudW1EaWZmZXJlbmNlcyA8PSAoMTQ0NyAvKiBNYXhEaWZmZXJlbmNlc0hpc3RvcnkgKi8gKyAxKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVub3VnaCBvZiB0aGUgaGlzdG9yeSBpcyBpbiBtZW1vcnkgdG8gd2FsayBpdCBiYWNrd2FyZHNcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5XQUxLVFJBQ0UoZGlhZ29uYWxGb3J3YXJkQmFzZSwgZGlhZ29uYWxGb3J3YXJkU3RhcnQsIGRpYWdvbmFsRm9yd2FyZEVuZCwgZGlhZ29uYWxGb3J3YXJkT2Zmc2V0LCBkaWFnb25hbFJldmVyc2VCYXNlLCBkaWFnb25hbFJldmVyc2VTdGFydCwgZGlhZ29uYWxSZXZlcnNlRW5kLCBkaWFnb25hbFJldmVyc2VPZmZzZXQsIGZvcndhcmRQb2ludHMsIHJldmVyc2VQb2ludHMsIG9yaWdpbmFsSW5kZXgsIG9yaWdpbmFsRW5kLCBtaWRPcmlnaW5hbEFyciwgbW9kaWZpZWRJbmRleCwgbW9kaWZpZWRFbmQsIG1pZE1vZGlmaWVkQXJyLCBkZWx0YUlzRXZlbiwgcXVpdEVhcmx5QXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGRpZG4ndCBhY3R1YWxseSByZW1lbWJlciBlbm91Z2ggb2YgdGhlIGhpc3RvcnkuXHJcbiAgICAgICAgICAgICAgICAgICAgLy9TaW5jZSB3ZSBhcmUgcXVpdGluZyB0aGUgZGlmZiBlYXJseSwgd2UgbmVlZCB0byBzaGlmdCBiYWNrIHRoZSBvcmlnaW5hbFN0YXJ0IGFuZCBtb2RpZmllZCBzdGFydFxyXG4gICAgICAgICAgICAgICAgICAgIC8vYmFjayBpbnRvIHRoZSBib3VuZGFyeSBsaW1pdHMgc2luY2Ugd2UgZGVjcmVtZW50ZWQgdGhlaXIgdmFsdWUgYWJvdmUgYmV5b25kIHRoZSBib3VuZGFyeSBsaW1pdC5cclxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFN0YXJ0Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRTdGFydCsrO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEaWZmQ2hhbmdlKG9yaWdpbmFsU3RhcnQsIG9yaWdpbmFsRW5kIC0gb3JpZ2luYWxTdGFydCArIDEsIG1vZGlmaWVkU3RhcnQsIG1vZGlmaWVkRW5kIC0gbW9kaWZpZWRTdGFydCArIDEpXHJcbiAgICAgICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBSdW4gdGhlIGFsZ29yaXRobSBpbiB0aGUgcmV2ZXJzZSBkaXJlY3Rpb25cclxuICAgICAgICAgICAgZGlhZ29uYWxSZXZlcnNlU3RhcnQgPSB0aGlzLkNsaXBEaWFnb25hbEJvdW5kKGRpYWdvbmFsUmV2ZXJzZUJhc2UgLSBudW1EaWZmZXJlbmNlcywgbnVtRGlmZmVyZW5jZXMsIGRpYWdvbmFsUmV2ZXJzZUJhc2UsIG51bURpYWdvbmFscyk7XHJcbiAgICAgICAgICAgIGRpYWdvbmFsUmV2ZXJzZUVuZCA9IHRoaXMuQ2xpcERpYWdvbmFsQm91bmQoZGlhZ29uYWxSZXZlcnNlQmFzZSArIG51bURpZmZlcmVuY2VzLCBudW1EaWZmZXJlbmNlcywgZGlhZ29uYWxSZXZlcnNlQmFzZSwgbnVtRGlhZ29uYWxzKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgZGlhZ29uYWwgPSBkaWFnb25hbFJldmVyc2VTdGFydDsgZGlhZ29uYWwgPD0gZGlhZ29uYWxSZXZlcnNlRW5kOyBkaWFnb25hbCArPSAyKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTVEVQIDE6IFdlIGV4dGVuZCB0aGUgZnVydGhlc3QgcmVhY2hpbmcgcG9pbnQgaW4gdGhlIHByZXNlbnQgZGlhZ29uYWxcclxuICAgICAgICAgICAgICAgIC8vIGJ5IGxvb2tpbmcgYXQgdGhlIGRpYWdvbmFscyBhYm92ZSBhbmQgYmVsb3cgYW5kIHBpY2tpbmcgdGhlIG9uZSB3aG9zZSBwb2ludFxyXG4gICAgICAgICAgICAgICAgLy8gaXMgZnVydGhlciBhd2F5IGZyb20gdGhlIHN0YXJ0IHBvaW50IChvcmlnaW5hbEVuZCwgbW9kaWZpZWRFbmQpXHJcbiAgICAgICAgICAgICAgICBpZiAoZGlhZ29uYWwgPT09IGRpYWdvbmFsUmV2ZXJzZVN0YXJ0IHx8IChkaWFnb25hbCA8IGRpYWdvbmFsUmV2ZXJzZUVuZCAmJiByZXZlcnNlUG9pbnRzW2RpYWdvbmFsIC0gMV0gPj0gcmV2ZXJzZVBvaW50c1tkaWFnb25hbCArIDFdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsSW5kZXggPSByZXZlcnNlUG9pbnRzW2RpYWdvbmFsICsgMV0gLSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxJbmRleCA9IHJldmVyc2VQb2ludHNbZGlhZ29uYWwgLSAxXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG1vZGlmaWVkSW5kZXggPSBvcmlnaW5hbEluZGV4IC0gKGRpYWdvbmFsIC0gZGlhZ29uYWxSZXZlcnNlQmFzZSkgLSBkaWFnb25hbFJldmVyc2VPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAvLyBTYXZlIHRoZSBjdXJyZW50IG9yaWdpbmFsSW5kZXggc28gd2UgY2FuIHRlc3QgZm9yIGZhbHNlIG92ZXJsYXBcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBPcmlnaW5hbEluZGV4ID0gb3JpZ2luYWxJbmRleDtcclxuICAgICAgICAgICAgICAgIC8vIFNURVAgMjogV2UgY2FuIGNvbnRpbnVlIHRvIGV4dGVuZCB0aGUgZnVydGhlc3QgcmVhY2hpbmcgcG9pbnQgaW4gdGhlIHByZXNlbnQgZGlhZ29uYWxcclxuICAgICAgICAgICAgICAgIC8vIGFzIGxvbmcgYXMgdGhlIGVsZW1lbnRzIGFyZSBlcXVhbC5cclxuICAgICAgICAgICAgICAgIHdoaWxlIChvcmlnaW5hbEluZGV4ID4gb3JpZ2luYWxTdGFydCAmJiBtb2RpZmllZEluZGV4ID4gbW9kaWZpZWRTdGFydCAmJiB0aGlzLkVsZW1lbnRzQXJlRXF1YWwob3JpZ2luYWxJbmRleCwgbW9kaWZpZWRJbmRleCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbEluZGV4LS07XHJcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRJbmRleC0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV2ZXJzZVBvaW50c1tkaWFnb25hbF0gPSBvcmlnaW5hbEluZGV4O1xyXG4gICAgICAgICAgICAgICAgLy8gU1RFUCA0OiBJZiBkZWx0YSBpcyBldmVuIChvdmVybGFwIGZpcnN0IGhhcHBlbnMgb24gcmV2ZXJzZSB3aGVuIGRlbHRhIGlzIGV2ZW4pXHJcbiAgICAgICAgICAgICAgICAvLyBhbmQgZGlhZ29uYWwgaXMgaW4gdGhlIHJhbmdlIG9mIGZvcndhcmQgZGlhZ29uYWxzIGNvbXB1dGVkIGZvciBudW1EaWZmZXJlbmNlc1xyXG4gICAgICAgICAgICAgICAgLy8gdGhlbiBjaGVjayBmb3Igb3ZlcmxhcC5cclxuICAgICAgICAgICAgICAgIGlmIChkZWx0YUlzRXZlbiAmJiBNYXRoLmFicyhkaWFnb25hbCAtIGRpYWdvbmFsRm9yd2FyZEJhc2UpIDw9IG51bURpZmZlcmVuY2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsSW5kZXggPD0gZm9yd2FyZFBvaW50c1tkaWFnb25hbF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWlkT3JpZ2luYWxBcnJbMF0gPSBvcmlnaW5hbEluZGV4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaWRNb2RpZmllZEFyclswXSA9IG1vZGlmaWVkSW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZW1wT3JpZ2luYWxJbmRleCA+PSBmb3J3YXJkUG9pbnRzW2RpYWdvbmFsXSAmJiAxNDQ3IC8qIE1heERpZmZlcmVuY2VzSGlzdG9yeSAqLyA+IDAgJiYgbnVtRGlmZmVyZW5jZXMgPD0gKDE0NDcgLyogTWF4RGlmZmVyZW5jZXNIaXN0b3J5ICovICsgMSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEJJTkdPISBXZSBvdmVybGFwcGVkLCBhbmQgd2UgaGF2ZSB0aGUgZnVsbCB0cmFjZSBpbiBtZW1vcnkhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5XQUxLVFJBQ0UoZGlhZ29uYWxGb3J3YXJkQmFzZSwgZGlhZ29uYWxGb3J3YXJkU3RhcnQsIGRpYWdvbmFsRm9yd2FyZEVuZCwgZGlhZ29uYWxGb3J3YXJkT2Zmc2V0LCBkaWFnb25hbFJldmVyc2VCYXNlLCBkaWFnb25hbFJldmVyc2VTdGFydCwgZGlhZ29uYWxSZXZlcnNlRW5kLCBkaWFnb25hbFJldmVyc2VPZmZzZXQsIGZvcndhcmRQb2ludHMsIHJldmVyc2VQb2ludHMsIG9yaWdpbmFsSW5kZXgsIG9yaWdpbmFsRW5kLCBtaWRPcmlnaW5hbEFyciwgbW9kaWZpZWRJbmRleCwgbW9kaWZpZWRFbmQsIG1pZE1vZGlmaWVkQXJyLCBkZWx0YUlzRXZlbiwgcXVpdEVhcmx5QXJyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEVpdGhlciBmYWxzZSBvdmVybGFwLCBvciB3ZSBkaWRuJ3QgaGF2ZSBlbm91Z2ggbWVtb3J5IGZvciB0aGUgZnVsbCB0cmFjZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSnVzdCByZXR1cm4gdGhlIHJlY3Vyc2lvbiBwb2ludFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gU2F2ZSBjdXJyZW50IHZlY3RvcnMgdG8gaGlzdG9yeSBiZWZvcmUgdGhlIG5leHQgaXRlcmF0aW9uXHJcbiAgICAgICAgICAgIGlmIChudW1EaWZmZXJlbmNlcyA8PSAxNDQ3IC8qIE1heERpZmZlcmVuY2VzSGlzdG9yeSAqLykge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgYXJlIGFsbG9jYXRpbmcgc3BhY2UgZm9yIG9uZSBleHRyYSBpbnQsIHdoaWNoIHdlIGZpbGwgd2l0aFxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIGluZGV4IG9mIHRoZSBkaWFnb25hbCBiYXNlIGluZGV4XHJcbiAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IG5ldyBJbnQzMkFycmF5KGRpYWdvbmFsRm9yd2FyZEVuZCAtIGRpYWdvbmFsRm9yd2FyZFN0YXJ0ICsgMik7XHJcbiAgICAgICAgICAgICAgICB0ZW1wWzBdID0gZGlhZ29uYWxGb3J3YXJkQmFzZSAtIGRpYWdvbmFsRm9yd2FyZFN0YXJ0ICsgMTtcclxuICAgICAgICAgICAgICAgIE15QXJyYXkuQ29weTIoZm9yd2FyZFBvaW50cywgZGlhZ29uYWxGb3J3YXJkU3RhcnQsIHRlbXAsIDEsIGRpYWdvbmFsRm9yd2FyZEVuZCAtIGRpYWdvbmFsRm9yd2FyZFN0YXJ0ICsgMSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1fZm9yd2FyZEhpc3RvcnkucHVzaCh0ZW1wKTtcclxuICAgICAgICAgICAgICAgIHRlbXAgPSBuZXcgSW50MzJBcnJheShkaWFnb25hbFJldmVyc2VFbmQgLSBkaWFnb25hbFJldmVyc2VTdGFydCArIDIpO1xyXG4gICAgICAgICAgICAgICAgdGVtcFswXSA9IGRpYWdvbmFsUmV2ZXJzZUJhc2UgLSBkaWFnb25hbFJldmVyc2VTdGFydCArIDE7XHJcbiAgICAgICAgICAgICAgICBNeUFycmF5LkNvcHkyKHJldmVyc2VQb2ludHMsIGRpYWdvbmFsUmV2ZXJzZVN0YXJ0LCB0ZW1wLCAxLCBkaWFnb25hbFJldmVyc2VFbmQgLSBkaWFnb25hbFJldmVyc2VTdGFydCArIDEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tX3JldmVyc2VIaXN0b3J5LnB1c2godGVtcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgd2UgZ290IGhlcmUsIHRoZW4gd2UgaGF2ZSB0aGUgZnVsbCB0cmFjZSBpbiBoaXN0b3J5LiBXZSBqdXN0IGhhdmUgdG8gY29udmVydCBpdCB0byBhIGNoYW5nZSBsaXN0XHJcbiAgICAgICAgLy8gTk9URTogVGhpcyBwYXJ0IGlzIGEgYml0IG1lc3N5XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuV0FMS1RSQUNFKGRpYWdvbmFsRm9yd2FyZEJhc2UsIGRpYWdvbmFsRm9yd2FyZFN0YXJ0LCBkaWFnb25hbEZvcndhcmRFbmQsIGRpYWdvbmFsRm9yd2FyZE9mZnNldCwgZGlhZ29uYWxSZXZlcnNlQmFzZSwgZGlhZ29uYWxSZXZlcnNlU3RhcnQsIGRpYWdvbmFsUmV2ZXJzZUVuZCwgZGlhZ29uYWxSZXZlcnNlT2Zmc2V0LCBmb3J3YXJkUG9pbnRzLCByZXZlcnNlUG9pbnRzLCBvcmlnaW5hbEluZGV4LCBvcmlnaW5hbEVuZCwgbWlkT3JpZ2luYWxBcnIsIG1vZGlmaWVkSW5kZXgsIG1vZGlmaWVkRW5kLCBtaWRNb2RpZmllZEFyciwgZGVsdGFJc0V2ZW4sIHF1aXRFYXJseUFycik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFNoaWZ0cyB0aGUgZ2l2ZW4gY2hhbmdlcyB0byBwcm92aWRlIGEgbW9yZSBpbnR1aXRpdmUgZGlmZi5cclxuICAgICAqIFdoaWxlIHRoZSBmaXJzdCBlbGVtZW50IGluIGEgZGlmZiBtYXRjaGVzIHRoZSBmaXJzdCBlbGVtZW50IGFmdGVyIHRoZSBkaWZmLFxyXG4gICAgICogd2Ugc2hpZnQgdGhlIGRpZmYgZG93bi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gY2hhbmdlcyBUaGUgbGlzdCBvZiBjaGFuZ2VzIHRvIHNoaWZ0XHJcbiAgICAgKiBAcmV0dXJucyBUaGUgc2hpZnRlZCBjaGFuZ2VzXHJcbiAgICAgKi9cclxuICAgIFByZXR0aWZ5Q2hhbmdlcyhjaGFuZ2VzKSB7XHJcbiAgICAgICAgLy8gU2hpZnQgYWxsIHRoZSBjaGFuZ2VzIGRvd24gZmlyc3RcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoYW5nZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgY2hhbmdlID0gY2hhbmdlc1tpXTtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxTdG9wID0gKGkgPCBjaGFuZ2VzLmxlbmd0aCAtIDEpID8gY2hhbmdlc1tpICsgMV0ub3JpZ2luYWxTdGFydCA6IHRoaXMuX29yaWdpbmFsRWxlbWVudHNPckhhc2gubGVuZ3RoO1xyXG4gICAgICAgICAgICBjb25zdCBtb2RpZmllZFN0b3AgPSAoaSA8IGNoYW5nZXMubGVuZ3RoIC0gMSkgPyBjaGFuZ2VzW2kgKyAxXS5tb2RpZmllZFN0YXJ0IDogdGhpcy5fbW9kaWZpZWRFbGVtZW50c09ySGFzaC5sZW5ndGg7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrT3JpZ2luYWwgPSBjaGFuZ2Uub3JpZ2luYWxMZW5ndGggPiAwO1xyXG4gICAgICAgICAgICBjb25zdCBjaGVja01vZGlmaWVkID0gY2hhbmdlLm1vZGlmaWVkTGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgd2hpbGUgKGNoYW5nZS5vcmlnaW5hbFN0YXJ0ICsgY2hhbmdlLm9yaWdpbmFsTGVuZ3RoIDwgb3JpZ2luYWxTdG9wICYmXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2UubW9kaWZpZWRTdGFydCArIGNoYW5nZS5tb2RpZmllZExlbmd0aCA8IG1vZGlmaWVkU3RvcCAmJlxyXG4gICAgICAgICAgICAgICAgKCFjaGVja09yaWdpbmFsIHx8IHRoaXMuT3JpZ2luYWxFbGVtZW50c0FyZUVxdWFsKGNoYW5nZS5vcmlnaW5hbFN0YXJ0LCBjaGFuZ2Uub3JpZ2luYWxTdGFydCArIGNoYW5nZS5vcmlnaW5hbExlbmd0aCkpICYmXHJcbiAgICAgICAgICAgICAgICAoIWNoZWNrTW9kaWZpZWQgfHwgdGhpcy5Nb2RpZmllZEVsZW1lbnRzQXJlRXF1YWwoY2hhbmdlLm1vZGlmaWVkU3RhcnQsIGNoYW5nZS5tb2RpZmllZFN0YXJ0ICsgY2hhbmdlLm1vZGlmaWVkTGVuZ3RoKSkpIHtcclxuICAgICAgICAgICAgICAgIGNoYW5nZS5vcmlnaW5hbFN0YXJ0Kys7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2UubW9kaWZpZWRTdGFydCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtZXJnZWRDaGFuZ2VBcnIgPSBbbnVsbF07XHJcbiAgICAgICAgICAgIGlmIChpIDwgY2hhbmdlcy5sZW5ndGggLSAxICYmIHRoaXMuQ2hhbmdlc092ZXJsYXAoY2hhbmdlc1tpXSwgY2hhbmdlc1tpICsgMV0sIG1lcmdlZENoYW5nZUFycikpIHtcclxuICAgICAgICAgICAgICAgIGNoYW5nZXNbaV0gPSBtZXJnZWRDaGFuZ2VBcnJbMF07XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VzLnNwbGljZShpICsgMSwgMSk7XHJcbiAgICAgICAgICAgICAgICBpLS07XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBTaGlmdCBjaGFuZ2VzIGJhY2sgdXAgdW50aWwgd2UgaGl0IGVtcHR5IG9yIHdoaXRlc3BhY2Utb25seSBsaW5lc1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBjaGFuZ2VzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYW5nZSA9IGNoYW5nZXNbaV07XHJcbiAgICAgICAgICAgIGxldCBvcmlnaW5hbFN0b3AgPSAwO1xyXG4gICAgICAgICAgICBsZXQgbW9kaWZpZWRTdG9wID0gMDtcclxuICAgICAgICAgICAgaWYgKGkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2Q2hhbmdlID0gY2hhbmdlc1tpIC0gMV07XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFN0b3AgPSBwcmV2Q2hhbmdlLm9yaWdpbmFsU3RhcnQgKyBwcmV2Q2hhbmdlLm9yaWdpbmFsTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRTdG9wID0gcHJldkNoYW5nZS5tb2RpZmllZFN0YXJ0ICsgcHJldkNoYW5nZS5tb2RpZmllZExlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBjaGVja09yaWdpbmFsID0gY2hhbmdlLm9yaWdpbmFsTGVuZ3RoID4gMDtcclxuICAgICAgICAgICAgY29uc3QgY2hlY2tNb2RpZmllZCA9IGNoYW5nZS5tb2RpZmllZExlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgIGxldCBiZXN0RGVsdGEgPSAwO1xyXG4gICAgICAgICAgICBsZXQgYmVzdFNjb3JlID0gdGhpcy5fYm91bmRhcnlTY29yZShjaGFuZ2Uub3JpZ2luYWxTdGFydCwgY2hhbmdlLm9yaWdpbmFsTGVuZ3RoLCBjaGFuZ2UubW9kaWZpZWRTdGFydCwgY2hhbmdlLm1vZGlmaWVkTGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgZGVsdGEgPSAxOzsgZGVsdGErKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxTdGFydCA9IGNoYW5nZS5vcmlnaW5hbFN0YXJ0IC0gZGVsdGE7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RpZmllZFN0YXJ0ID0gY2hhbmdlLm1vZGlmaWVkU3RhcnQgLSBkZWx0YTtcclxuICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbFN0YXJ0IDwgb3JpZ2luYWxTdG9wIHx8IG1vZGlmaWVkU3RhcnQgPCBtb2RpZmllZFN0b3ApIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjaGVja09yaWdpbmFsICYmICF0aGlzLk9yaWdpbmFsRWxlbWVudHNBcmVFcXVhbChvcmlnaW5hbFN0YXJ0LCBvcmlnaW5hbFN0YXJ0ICsgY2hhbmdlLm9yaWdpbmFsTGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoZWNrTW9kaWZpZWQgJiYgIXRoaXMuTW9kaWZpZWRFbGVtZW50c0FyZUVxdWFsKG1vZGlmaWVkU3RhcnQsIG1vZGlmaWVkU3RhcnQgKyBjaGFuZ2UubW9kaWZpZWRMZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0b3VjaGluZ1ByZXZpb3VzQ2hhbmdlID0gKG9yaWdpbmFsU3RhcnQgPT09IG9yaWdpbmFsU3RvcCAmJiBtb2RpZmllZFN0YXJ0ID09PSBtb2RpZmllZFN0b3ApO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSAoKHRvdWNoaW5nUHJldmlvdXNDaGFuZ2UgPyA1IDogMClcclxuICAgICAgICAgICAgICAgICAgICArIHRoaXMuX2JvdW5kYXJ5U2NvcmUob3JpZ2luYWxTdGFydCwgY2hhbmdlLm9yaWdpbmFsTGVuZ3RoLCBtb2RpZmllZFN0YXJ0LCBjaGFuZ2UubW9kaWZpZWRMZW5ndGgpKTtcclxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3RTY29yZSA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJlc3REZWx0YSA9IGRlbHRhO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoYW5nZS5vcmlnaW5hbFN0YXJ0IC09IGJlc3REZWx0YTtcclxuICAgICAgICAgICAgY2hhbmdlLm1vZGlmaWVkU3RhcnQgLT0gYmVzdERlbHRhO1xyXG4gICAgICAgICAgICBjb25zdCBtZXJnZWRDaGFuZ2VBcnIgPSBbbnVsbF07XHJcbiAgICAgICAgICAgIGlmIChpID4gMCAmJiB0aGlzLkNoYW5nZXNPdmVybGFwKGNoYW5nZXNbaSAtIDFdLCBjaGFuZ2VzW2ldLCBtZXJnZWRDaGFuZ2VBcnIpKSB7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VzW2kgLSAxXSA9IG1lcmdlZENoYW5nZUFyclswXTtcclxuICAgICAgICAgICAgICAgIGNoYW5nZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVGhlcmUgY291bGQgYmUgbXVsdGlwbGUgbG9uZ2VzdCBjb21tb24gc3Vic3RyaW5ncy5cclxuICAgICAgICAvLyBHaXZlIHByZWZlcmVuY2UgdG8gdGhlIG9uZXMgY29udGFpbmluZyBsb25nZXIgbGluZXNcclxuICAgICAgICBpZiAodGhpcy5faGFzU3RyaW5ncykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMSwgbGVuID0gY2hhbmdlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYUNoYW5nZSA9IGNoYW5nZXNbaSAtIDFdO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYkNoYW5nZSA9IGNoYW5nZXNbaV07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVkTGVuZ3RoID0gYkNoYW5nZS5vcmlnaW5hbFN0YXJ0IC0gYUNoYW5nZS5vcmlnaW5hbFN0YXJ0IC0gYUNoYW5nZS5vcmlnaW5hbExlbmd0aDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFPcmlnaW5hbFN0YXJ0ID0gYUNoYW5nZS5vcmlnaW5hbFN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYk9yaWdpbmFsRW5kID0gYkNoYW5nZS5vcmlnaW5hbFN0YXJ0ICsgYkNoYW5nZS5vcmlnaW5hbExlbmd0aDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFiT3JpZ2luYWxMZW5ndGggPSBiT3JpZ2luYWxFbmQgLSBhT3JpZ2luYWxTdGFydDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFNb2RpZmllZFN0YXJ0ID0gYUNoYW5nZS5tb2RpZmllZFN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYk1vZGlmaWVkRW5kID0gYkNoYW5nZS5tb2RpZmllZFN0YXJ0ICsgYkNoYW5nZS5tb2RpZmllZExlbmd0aDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFiTW9kaWZpZWRMZW5ndGggPSBiTW9kaWZpZWRFbmQgLSBhTW9kaWZpZWRTdGFydDtcclxuICAgICAgICAgICAgICAgIC8vIEF2b2lkIHdhc3RpbmcgYSBsb3Qgb2YgdGltZSB3aXRoIHRoZXNlIHNlYXJjaGVzXHJcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlZExlbmd0aCA8IDUgJiYgYWJPcmlnaW5hbExlbmd0aCA8IDIwICYmIGFiTW9kaWZpZWRMZW5ndGggPCAyMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSB0aGlzLl9maW5kQmV0dGVyQ29udGlndW91c1NlcXVlbmNlKGFPcmlnaW5hbFN0YXJ0LCBhYk9yaWdpbmFsTGVuZ3RoLCBhTW9kaWZpZWRTdGFydCwgYWJNb2RpZmllZExlbmd0aCwgbWF0Y2hlZExlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW29yaWdpbmFsTWF0Y2hTdGFydCwgbW9kaWZpZWRNYXRjaFN0YXJ0XSA9IHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbE1hdGNoU3RhcnQgIT09IGFDaGFuZ2Uub3JpZ2luYWxTdGFydCArIGFDaGFuZ2Uub3JpZ2luYWxMZW5ndGggfHwgbW9kaWZpZWRNYXRjaFN0YXJ0ICE9PSBhQ2hhbmdlLm1vZGlmaWVkU3RhcnQgKyBhQ2hhbmdlLm1vZGlmaWVkTGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzd2l0Y2ggdG8gYW5vdGhlciBzZXF1ZW5jZSB0aGF0IGhhcyBhIGJldHRlciBzY29yZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYUNoYW5nZS5vcmlnaW5hbExlbmd0aCA9IG9yaWdpbmFsTWF0Y2hTdGFydCAtIGFDaGFuZ2Uub3JpZ2luYWxTdGFydDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFDaGFuZ2UubW9kaWZpZWRMZW5ndGggPSBtb2RpZmllZE1hdGNoU3RhcnQgLSBhQ2hhbmdlLm1vZGlmaWVkU3RhcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiQ2hhbmdlLm9yaWdpbmFsU3RhcnQgPSBvcmlnaW5hbE1hdGNoU3RhcnQgKyBtYXRjaGVkTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYkNoYW5nZS5tb2RpZmllZFN0YXJ0ID0gbW9kaWZpZWRNYXRjaFN0YXJ0ICsgbWF0Y2hlZExlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJDaGFuZ2Uub3JpZ2luYWxMZW5ndGggPSBiT3JpZ2luYWxFbmQgLSBiQ2hhbmdlLm9yaWdpbmFsU3RhcnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiQ2hhbmdlLm1vZGlmaWVkTGVuZ3RoID0gYk1vZGlmaWVkRW5kIC0gYkNoYW5nZS5tb2RpZmllZFN0YXJ0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjaGFuZ2VzO1xyXG4gICAgfVxyXG4gICAgX2ZpbmRCZXR0ZXJDb250aWd1b3VzU2VxdWVuY2Uob3JpZ2luYWxTdGFydCwgb3JpZ2luYWxMZW5ndGgsIG1vZGlmaWVkU3RhcnQsIG1vZGlmaWVkTGVuZ3RoLCBkZXNpcmVkTGVuZ3RoKSB7XHJcbiAgICAgICAgaWYgKG9yaWdpbmFsTGVuZ3RoIDwgZGVzaXJlZExlbmd0aCB8fCBtb2RpZmllZExlbmd0aCA8IGRlc2lyZWRMZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsTWF4ID0gb3JpZ2luYWxTdGFydCArIG9yaWdpbmFsTGVuZ3RoIC0gZGVzaXJlZExlbmd0aCArIDE7XHJcbiAgICAgICAgY29uc3QgbW9kaWZpZWRNYXggPSBtb2RpZmllZFN0YXJ0ICsgbW9kaWZpZWRMZW5ndGggLSBkZXNpcmVkTGVuZ3RoICsgMTtcclxuICAgICAgICBsZXQgYmVzdFNjb3JlID0gMDtcclxuICAgICAgICBsZXQgYmVzdE9yaWdpbmFsU3RhcnQgPSAwO1xyXG4gICAgICAgIGxldCBiZXN0TW9kaWZpZWRTdGFydCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IG9yaWdpbmFsU3RhcnQ7IGkgPCBvcmlnaW5hbE1heDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBtb2RpZmllZFN0YXJ0OyBqIDwgbW9kaWZpZWRNYXg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSB0aGlzLl9jb250aWd1b3VzU2VxdWVuY2VTY29yZShpLCBqLCBkZXNpcmVkTGVuZ3RoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA+IDAgJiYgc2NvcmUgPiBiZXN0U2NvcmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0U2NvcmUgPSBzY29yZTtcclxuICAgICAgICAgICAgICAgICAgICBiZXN0T3JpZ2luYWxTdGFydCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1vZGlmaWVkU3RhcnQgPSBqO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChiZXN0U2NvcmUgPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbYmVzdE9yaWdpbmFsU3RhcnQsIGJlc3RNb2RpZmllZFN0YXJ0XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBfY29udGlndW91c1NlcXVlbmNlU2NvcmUob3JpZ2luYWxTdGFydCwgbW9kaWZpZWRTdGFydCwgbGVuZ3RoKSB7XHJcbiAgICAgICAgbGV0IHNjb3JlID0gMDtcclxuICAgICAgICBmb3IgKGxldCBsID0gMDsgbCA8IGxlbmd0aDsgbCsrKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5FbGVtZW50c0FyZUVxdWFsKG9yaWdpbmFsU3RhcnQgKyBsLCBtb2RpZmllZFN0YXJ0ICsgbCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNjb3JlICs9IHRoaXMuX29yaWdpbmFsU3RyaW5nRWxlbWVudHNbb3JpZ2luYWxTdGFydCArIGxdLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHNjb3JlO1xyXG4gICAgfVxyXG4gICAgX09yaWdpbmFsSXNCb3VuZGFyeShpbmRleCkge1xyXG4gICAgICAgIGlmIChpbmRleCA8PSAwIHx8IGluZGV4ID49IHRoaXMuX29yaWdpbmFsRWxlbWVudHNPckhhc2gubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl9oYXNTdHJpbmdzICYmIC9eXFxzKiQvLnRlc3QodGhpcy5fb3JpZ2luYWxTdHJpbmdFbGVtZW50c1tpbmRleF0pKTtcclxuICAgIH1cclxuICAgIF9PcmlnaW5hbFJlZ2lvbklzQm91bmRhcnkob3JpZ2luYWxTdGFydCwgb3JpZ2luYWxMZW5ndGgpIHtcclxuICAgICAgICBpZiAodGhpcy5fT3JpZ2luYWxJc0JvdW5kYXJ5KG9yaWdpbmFsU3RhcnQpIHx8IHRoaXMuX09yaWdpbmFsSXNCb3VuZGFyeShvcmlnaW5hbFN0YXJ0IC0gMSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvcmlnaW5hbExlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxFbmQgPSBvcmlnaW5hbFN0YXJ0ICsgb3JpZ2luYWxMZW5ndGg7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9PcmlnaW5hbElzQm91bmRhcnkob3JpZ2luYWxFbmQgLSAxKSB8fCB0aGlzLl9PcmlnaW5hbElzQm91bmRhcnkob3JpZ2luYWxFbmQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBfTW9kaWZpZWRJc0JvdW5kYXJ5KGluZGV4KSB7XHJcbiAgICAgICAgaWYgKGluZGV4IDw9IDAgfHwgaW5kZXggPj0gdGhpcy5fbW9kaWZpZWRFbGVtZW50c09ySGFzaC5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKHRoaXMuX2hhc1N0cmluZ3MgJiYgL15cXHMqJC8udGVzdCh0aGlzLl9tb2RpZmllZFN0cmluZ0VsZW1lbnRzW2luZGV4XSkpO1xyXG4gICAgfVxyXG4gICAgX01vZGlmaWVkUmVnaW9uSXNCb3VuZGFyeShtb2RpZmllZFN0YXJ0LCBtb2RpZmllZExlbmd0aCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9Nb2RpZmllZElzQm91bmRhcnkobW9kaWZpZWRTdGFydCkgfHwgdGhpcy5fTW9kaWZpZWRJc0JvdW5kYXJ5KG1vZGlmaWVkU3RhcnQgLSAxKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vZGlmaWVkTGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBtb2RpZmllZEVuZCA9IG1vZGlmaWVkU3RhcnQgKyBtb2RpZmllZExlbmd0aDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX01vZGlmaWVkSXNCb3VuZGFyeShtb2RpZmllZEVuZCAtIDEpIHx8IHRoaXMuX01vZGlmaWVkSXNCb3VuZGFyeShtb2RpZmllZEVuZCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIF9ib3VuZGFyeVNjb3JlKG9yaWdpbmFsU3RhcnQsIG9yaWdpbmFsTGVuZ3RoLCBtb2RpZmllZFN0YXJ0LCBtb2RpZmllZExlbmd0aCkge1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsU2NvcmUgPSAodGhpcy5fT3JpZ2luYWxSZWdpb25Jc0JvdW5kYXJ5KG9yaWdpbmFsU3RhcnQsIG9yaWdpbmFsTGVuZ3RoKSA/IDEgOiAwKTtcclxuICAgICAgICBjb25zdCBtb2RpZmllZFNjb3JlID0gKHRoaXMuX01vZGlmaWVkUmVnaW9uSXNCb3VuZGFyeShtb2RpZmllZFN0YXJ0LCBtb2RpZmllZExlbmd0aCkgPyAxIDogMCk7XHJcbiAgICAgICAgcmV0dXJuIChvcmlnaW5hbFNjb3JlICsgbW9kaWZpZWRTY29yZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENvbmNhdGVuYXRlcyB0aGUgdHdvIGlucHV0IERpZmZDaGFuZ2UgbGlzdHMgYW5kIHJldHVybnMgdGhlIHJlc3VsdGluZ1xyXG4gICAgICogbGlzdC5cclxuICAgICAqIEBwYXJhbSBUaGUgbGVmdCBjaGFuZ2VzXHJcbiAgICAgKiBAcGFyYW0gVGhlIHJpZ2h0IGNoYW5nZXNcclxuICAgICAqIEByZXR1cm5zIFRoZSBjb25jYXRlbmF0ZWQgbGlzdFxyXG4gICAgICovXHJcbiAgICBDb25jYXRlbmF0ZUNoYW5nZXMobGVmdCwgcmlnaHQpIHtcclxuICAgICAgICBsZXQgbWVyZ2VkQ2hhbmdlQXJyID0gW107XHJcbiAgICAgICAgaWYgKGxlZnQubGVuZ3RoID09PSAwIHx8IHJpZ2h0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gKHJpZ2h0Lmxlbmd0aCA+IDApID8gcmlnaHQgOiBsZWZ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLkNoYW5nZXNPdmVybGFwKGxlZnRbbGVmdC5sZW5ndGggLSAxXSwgcmlnaHRbMF0sIG1lcmdlZENoYW5nZUFycikpIHtcclxuICAgICAgICAgICAgLy8gU2luY2Ugd2UgYnJlYWsgdGhlIHByb2JsZW0gZG93biByZWN1cnNpdmVseSwgaXQgaXMgcG9zc2libGUgdGhhdCB3ZVxyXG4gICAgICAgICAgICAvLyBtaWdodCByZWN1cnNlIGluIHRoZSBtaWRkbGUgb2YgYSBjaGFuZ2UgdGhlcmVieSBzcGxpdHRpbmcgaXQgaW50b1xyXG4gICAgICAgICAgICAvLyB0d28gY2hhbmdlcy4gSGVyZSBpbiB0aGUgY29tYmluaW5nIHN0YWdlLCB3ZSBkZXRlY3QgYW5kIGZ1c2UgdGhvc2VcclxuICAgICAgICAgICAgLy8gY2hhbmdlcyBiYWNrIHRvZ2V0aGVyXHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShsZWZ0Lmxlbmd0aCArIHJpZ2h0Lmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBNeUFycmF5LkNvcHkobGVmdCwgMCwgcmVzdWx0LCAwLCBsZWZ0Lmxlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICByZXN1bHRbbGVmdC5sZW5ndGggLSAxXSA9IG1lcmdlZENoYW5nZUFyclswXTtcclxuICAgICAgICAgICAgTXlBcnJheS5Db3B5KHJpZ2h0LCAxLCByZXN1bHQsIGxlZnQubGVuZ3RoLCByaWdodC5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheShsZWZ0Lmxlbmd0aCArIHJpZ2h0Lmxlbmd0aCk7XHJcbiAgICAgICAgICAgIE15QXJyYXkuQ29weShsZWZ0LCAwLCByZXN1bHQsIDAsIGxlZnQubGVuZ3RoKTtcclxuICAgICAgICAgICAgTXlBcnJheS5Db3B5KHJpZ2h0LCAwLCByZXN1bHQsIGxlZnQubGVuZ3RoLCByaWdodC5sZW5ndGgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSB0d28gY2hhbmdlcyBvdmVybGFwIGFuZCBjYW4gYmUgbWVyZ2VkIGludG8gYSBzaW5nbGVcclxuICAgICAqIGNoYW5nZVxyXG4gICAgICogQHBhcmFtIGxlZnQgVGhlIGxlZnQgY2hhbmdlXHJcbiAgICAgKiBAcGFyYW0gcmlnaHQgVGhlIHJpZ2h0IGNoYW5nZVxyXG4gICAgICogQHBhcmFtIG1lcmdlZENoYW5nZSBUaGUgbWVyZ2VkIGNoYW5nZSBpZiB0aGUgdHdvIG92ZXJsYXAsIG51bGwgb3RoZXJ3aXNlXHJcbiAgICAgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSB0d28gY2hhbmdlcyBvdmVybGFwXHJcbiAgICAgKi9cclxuICAgIENoYW5nZXNPdmVybGFwKGxlZnQsIHJpZ2h0LCBtZXJnZWRDaGFuZ2VBcnIpIHtcclxuICAgICAgICBEZWJ1Zy5Bc3NlcnQobGVmdC5vcmlnaW5hbFN0YXJ0IDw9IHJpZ2h0Lm9yaWdpbmFsU3RhcnQsICdMZWZ0IGNoYW5nZSBpcyBub3QgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHJpZ2h0IGNoYW5nZScpO1xyXG4gICAgICAgIERlYnVnLkFzc2VydChsZWZ0Lm1vZGlmaWVkU3RhcnQgPD0gcmlnaHQubW9kaWZpZWRTdGFydCwgJ0xlZnQgY2hhbmdlIGlzIG5vdCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gcmlnaHQgY2hhbmdlJyk7XHJcbiAgICAgICAgaWYgKGxlZnQub3JpZ2luYWxTdGFydCArIGxlZnQub3JpZ2luYWxMZW5ndGggPj0gcmlnaHQub3JpZ2luYWxTdGFydCB8fCBsZWZ0Lm1vZGlmaWVkU3RhcnQgKyBsZWZ0Lm1vZGlmaWVkTGVuZ3RoID49IHJpZ2h0Lm1vZGlmaWVkU3RhcnQpIHtcclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxTdGFydCA9IGxlZnQub3JpZ2luYWxTdGFydDtcclxuICAgICAgICAgICAgbGV0IG9yaWdpbmFsTGVuZ3RoID0gbGVmdC5vcmlnaW5hbExlbmd0aDtcclxuICAgICAgICAgICAgY29uc3QgbW9kaWZpZWRTdGFydCA9IGxlZnQubW9kaWZpZWRTdGFydDtcclxuICAgICAgICAgICAgbGV0IG1vZGlmaWVkTGVuZ3RoID0gbGVmdC5tb2RpZmllZExlbmd0aDtcclxuICAgICAgICAgICAgaWYgKGxlZnQub3JpZ2luYWxTdGFydCArIGxlZnQub3JpZ2luYWxMZW5ndGggPj0gcmlnaHQub3JpZ2luYWxTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgb3JpZ2luYWxMZW5ndGggPSByaWdodC5vcmlnaW5hbFN0YXJ0ICsgcmlnaHQub3JpZ2luYWxMZW5ndGggLSBsZWZ0Lm9yaWdpbmFsU3RhcnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxlZnQubW9kaWZpZWRTdGFydCArIGxlZnQubW9kaWZpZWRMZW5ndGggPj0gcmlnaHQubW9kaWZpZWRTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRMZW5ndGggPSByaWdodC5tb2RpZmllZFN0YXJ0ICsgcmlnaHQubW9kaWZpZWRMZW5ndGggLSBsZWZ0Lm1vZGlmaWVkU3RhcnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVyZ2VkQ2hhbmdlQXJyWzBdID0gbmV3IERpZmZDaGFuZ2Uob3JpZ2luYWxTdGFydCwgb3JpZ2luYWxMZW5ndGgsIG1vZGlmaWVkU3RhcnQsIG1vZGlmaWVkTGVuZ3RoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBtZXJnZWRDaGFuZ2VBcnJbMF0gPSBudWxsO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHVzZWQgdG8gY2xpcCBhIGRpYWdvbmFsIGluZGV4IHRvIHRoZSByYW5nZSBvZiB2YWxpZFxyXG4gICAgICogZGlhZ29uYWxzLiBUaGlzIGFsc28gZGVjaWRlcyB3aGV0aGVyIG9yIG5vdCB0aGUgZGlhZ29uYWwgaW5kZXgsXHJcbiAgICAgKiBpZiBpdCBleGNlZWRzIHRoZSBib3VuZGFyeSwgc2hvdWxkIGJlIGNsaXBwZWQgdG8gdGhlIGJvdW5kYXJ5IG9yIGNsaXBwZWRcclxuICAgICAqIG9uZSBpbnNpZGUgdGhlIGJvdW5kYXJ5IGRlcGVuZGluZyBvbiB0aGUgRXZlbi9PZGQgc3RhdHVzIG9mIHRoZSBib3VuZGFyeVxyXG4gICAgICogYW5kIG51bURpZmZlcmVuY2VzLlxyXG4gICAgICogQHBhcmFtIGRpYWdvbmFsIFRoZSBpbmRleCBvZiB0aGUgZGlhZ29uYWwgdG8gY2xpcC5cclxuICAgICAqIEBwYXJhbSBudW1EaWZmZXJlbmNlcyBUaGUgY3VycmVudCBudW1iZXIgb2YgZGlmZmVyZW5jZXMgYmVpbmcgaXRlcmF0ZWQgdXBvbi5cclxuICAgICAqIEBwYXJhbSBkaWFnb25hbEJhc2VJbmRleCBUaGUgYmFzZSByZWZlcmVuY2UgZGlhZ29uYWwuXHJcbiAgICAgKiBAcGFyYW0gbnVtRGlhZ29uYWxzIFRoZSB0b3RhbCBudW1iZXIgb2YgZGlhZ29uYWxzLlxyXG4gICAgICogQHJldHVybnMgVGhlIGNsaXBwZWQgZGlhZ29uYWwgaW5kZXguXHJcbiAgICAgKi9cclxuICAgIENsaXBEaWFnb25hbEJvdW5kKGRpYWdvbmFsLCBudW1EaWZmZXJlbmNlcywgZGlhZ29uYWxCYXNlSW5kZXgsIG51bURpYWdvbmFscykge1xyXG4gICAgICAgIGlmIChkaWFnb25hbCA+PSAwICYmIGRpYWdvbmFsIDwgbnVtRGlhZ29uYWxzKSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGhpbmcgdG8gY2xpcCwgaXRzIGluIHJhbmdlXHJcbiAgICAgICAgICAgIHJldHVybiBkaWFnb25hbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZGlhZ29uYWxzQmVsb3c6IFRoZSBudW1iZXIgb2YgZGlhZ29uYWxzIGJlbG93IHRoZSByZWZlcmVuY2UgZGlhZ29uYWxcclxuICAgICAgICAvLyBkaWFnb25hbHNBYm92ZTogVGhlIG51bWJlciBvZiBkaWFnb25hbHMgYWJvdmUgdGhlIHJlZmVyZW5jZSBkaWFnb25hbFxyXG4gICAgICAgIGNvbnN0IGRpYWdvbmFsc0JlbG93ID0gZGlhZ29uYWxCYXNlSW5kZXg7XHJcbiAgICAgICAgY29uc3QgZGlhZ29uYWxzQWJvdmUgPSBudW1EaWFnb25hbHMgLSBkaWFnb25hbEJhc2VJbmRleCAtIDE7XHJcbiAgICAgICAgY29uc3QgZGlmZkV2ZW4gPSAobnVtRGlmZmVyZW5jZXMgJSAyID09PSAwKTtcclxuICAgICAgICBpZiAoZGlhZ29uYWwgPCAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxvd2VyQm91bmRFdmVuID0gKGRpYWdvbmFsc0JlbG93ICUgMiA9PT0gMCk7XHJcbiAgICAgICAgICAgIHJldHVybiAoZGlmZkV2ZW4gPT09IGxvd2VyQm91bmRFdmVuKSA/IDAgOiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgdXBwZXJCb3VuZEV2ZW4gPSAoZGlhZ29uYWxzQWJvdmUgJSAyID09PSAwKTtcclxuICAgICAgICAgICAgcmV0dXJuIChkaWZmRXZlbiA9PT0gdXBwZXJCb3VuZEV2ZW4pID8gbnVtRGlhZ29uYWxzIC0gMSA6IG51bURpYWdvbmFscyAtIDI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsICIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuaW1wb3J0IHsgaXNXaW5kb3dzLCBpc01hY2ludG9zaCwgc2V0SW1tZWRpYXRlLCBnbG9iYWxzIH0gZnJvbSAnLi9wbGF0Zm9ybS5qcyc7XHJcbmxldCBzYWZlUHJvY2VzcztcclxuLy8gTmF0aXZlIHNhbmRib3ggZW52aXJvbm1lbnRcclxuaWYgKHR5cGVvZiBnbG9iYWxzLnZzY29kZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGdsb2JhbHMudnNjb2RlLnByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICBjb25zdCBzYW5kYm94UHJvY2VzcyA9IGdsb2JhbHMudnNjb2RlLnByb2Nlc3M7XHJcbiAgICBzYWZlUHJvY2VzcyA9IHtcclxuICAgICAgICBnZXQgcGxhdGZvcm0oKSB7IHJldHVybiBzYW5kYm94UHJvY2Vzcy5wbGF0Zm9ybTsgfSxcclxuICAgICAgICBnZXQgZW52KCkgeyByZXR1cm4gc2FuZGJveFByb2Nlc3MuZW52OyB9LFxyXG4gICAgICAgIGN3ZCgpIHsgcmV0dXJuIHNhbmRib3hQcm9jZXNzLmN3ZCgpOyB9LFxyXG4gICAgICAgIG5leHRUaWNrKGNhbGxiYWNrKSB7IHJldHVybiBzZXRJbW1lZGlhdGUoY2FsbGJhY2spOyB9XHJcbiAgICB9O1xyXG59XHJcbi8vIE5hdGl2ZSBub2RlLmpzIGVudmlyb25tZW50XHJcbmVsc2UgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgc2FmZVByb2Nlc3MgPSB7XHJcbiAgICAgICAgZ2V0IHBsYXRmb3JtKCkgeyByZXR1cm4gcHJvY2Vzcy5wbGF0Zm9ybTsgfSxcclxuICAgICAgICBnZXQgZW52KCkgeyByZXR1cm4gcHJvY2Vzcy5lbnY7IH0sXHJcbiAgICAgICAgY3dkKCkgeyByZXR1cm4gcHJvY2Vzcy5lbnZbJ1ZTQ09ERV9DV0QnXSB8fCBwcm9jZXNzLmN3ZCgpOyB9LFxyXG4gICAgICAgIG5leHRUaWNrKGNhbGxiYWNrKSB7IHJldHVybiBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrKTsgfVxyXG4gICAgfTtcclxufVxyXG4vLyBXZWIgZW52aXJvbm1lbnRcclxuZWxzZSB7XHJcbiAgICBzYWZlUHJvY2VzcyA9IHtcclxuICAgICAgICAvLyBTdXBwb3J0ZWRcclxuICAgICAgICBnZXQgcGxhdGZvcm0oKSB7IHJldHVybiBpc1dpbmRvd3MgPyAnd2luMzInIDogaXNNYWNpbnRvc2ggPyAnZGFyd2luJyA6ICdsaW51eCc7IH0sXHJcbiAgICAgICAgbmV4dFRpY2soY2FsbGJhY2spIHsgcmV0dXJuIHNldEltbWVkaWF0ZShjYWxsYmFjayk7IH0sXHJcbiAgICAgICAgLy8gVW5zdXBwb3J0ZWRcclxuICAgICAgICBnZXQgZW52KCkgeyByZXR1cm4ge307IH0sXHJcbiAgICAgICAgY3dkKCkgeyByZXR1cm4gJy8nOyB9XHJcbiAgICB9O1xyXG59XHJcbi8qKlxyXG4gKiBQcm92aWRlcyBzYWZlIGFjY2VzcyB0byB0aGUgYGN3ZGAgcHJvcGVydHkgaW4gbm9kZS5qcywgc2FuZGJveGVkIG9yIHdlYlxyXG4gKiBlbnZpcm9ubWVudHMuXHJcbiAqXHJcbiAqIE5vdGU6IGluIHdlYiwgdGhpcyBwcm9wZXJ0eSBpcyBoYXJkY29kZWQgdG8gYmUgYC9gLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGN3ZCA9IHNhZmVQcm9jZXNzLmN3ZDtcclxuLyoqXHJcbiAqIFByb3ZpZGVzIHNhZmUgYWNjZXNzIHRvIHRoZSBgZW52YCBwcm9wZXJ0eSBpbiBub2RlLmpzLCBzYW5kYm94ZWQgb3Igd2ViXHJcbiAqIGVudmlyb25tZW50cy5cclxuICpcclxuICogTm90ZTogaW4gd2ViLCB0aGlzIHByb3BlcnR5IGlzIGhhcmRjb2RlZCB0byBiZSBge31gLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVudiA9IHNhZmVQcm9jZXNzLmVudjtcclxuLyoqXHJcbiAqIFByb3ZpZGVzIHNhZmUgYWNjZXNzIHRvIHRoZSBgcGxhdGZvcm1gIHByb3BlcnR5IGluIG5vZGUuanMsIHNhbmRib3hlZCBvciB3ZWJcclxuICogZW52aXJvbm1lbnRzLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHBsYXRmb3JtID0gc2FmZVByb2Nlc3MucGxhdGZvcm07XHJcbiIsICIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuLy8gTk9URTogVlNDb2RlJ3MgY29weSBvZiBub2RlanMgcGF0aCBsaWJyYXJ5IHRvIGJlIHVzYWJsZSBpbiBjb21tb24gKG5vbi1ub2RlKSBuYW1lc3BhY2VcclxuLy8gQ29waWVkIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9ibG9iL3YxMi44LjEvbGliL3BhdGguanNcclxuLyoqXHJcbiAqIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxyXG4gKlxyXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxyXG4gKiBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXHJcbiAqIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xyXG4gKiB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXHJcbiAqIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcclxuICogcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXHJcbiAqIGZvbGxvd2luZyBjb25kaXRpb25zOlxyXG4gKlxyXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxyXG4gKiBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cclxuICpcclxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xyXG4gKiBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXHJcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cclxuICogTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXHJcbiAqIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxyXG4gKiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXHJcbiAqIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyBwcm9jZXNzIGZyb20gJy4vcHJvY2Vzcy5qcyc7XHJcbmNvbnN0IENIQVJfVVBQRVJDQVNFX0EgPSA2NTsgLyogQSAqL1xyXG5jb25zdCBDSEFSX0xPV0VSQ0FTRV9BID0gOTc7IC8qIGEgKi9cclxuY29uc3QgQ0hBUl9VUFBFUkNBU0VfWiA9IDkwOyAvKiBaICovXHJcbmNvbnN0IENIQVJfTE9XRVJDQVNFX1ogPSAxMjI7IC8qIHogKi9cclxuY29uc3QgQ0hBUl9ET1QgPSA0NjsgLyogLiAqL1xyXG5jb25zdCBDSEFSX0ZPUldBUkRfU0xBU0ggPSA0NzsgLyogLyAqL1xyXG5jb25zdCBDSEFSX0JBQ0tXQVJEX1NMQVNIID0gOTI7IC8qIFxcICovXHJcbmNvbnN0IENIQVJfQ09MT04gPSA1ODsgLyogOiAqL1xyXG5jb25zdCBDSEFSX1FVRVNUSU9OX01BUksgPSA2MzsgLyogPyAqL1xyXG5jbGFzcyBFcnJvckludmFsaWRBcmdUeXBlIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IobmFtZSwgZXhwZWN0ZWQsIGFjdHVhbCkge1xyXG4gICAgICAgIC8vIGRldGVybWluZXI6ICdtdXN0IGJlJyBvciAnbXVzdCBub3QgYmUnXHJcbiAgICAgICAgbGV0IGRldGVybWluZXI7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBleHBlY3RlZCA9PT0gJ3N0cmluZycgJiYgZXhwZWN0ZWQuaW5kZXhPZignbm90ICcpID09PSAwKSB7XHJcbiAgICAgICAgICAgIGRldGVybWluZXIgPSAnbXVzdCBub3QgYmUnO1xyXG4gICAgICAgICAgICBleHBlY3RlZCA9IGV4cGVjdGVkLnJlcGxhY2UoL15ub3QgLywgJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZGV0ZXJtaW5lciA9ICdtdXN0IGJlJztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdHlwZSA9IG5hbWUuaW5kZXhPZignLicpICE9PSAtMSA/ICdwcm9wZXJ0eScgOiAnYXJndW1lbnQnO1xyXG4gICAgICAgIGxldCBtc2cgPSBgVGhlIFwiJHtuYW1lfVwiICR7dHlwZX0gJHtkZXRlcm1pbmVyfSBvZiB0eXBlICR7ZXhwZWN0ZWR9YDtcclxuICAgICAgICBtc2cgKz0gYC4gUmVjZWl2ZWQgdHlwZSAke3R5cGVvZiBhY3R1YWx9YDtcclxuICAgICAgICBzdXBlcihtc2cpO1xyXG4gICAgICAgIHRoaXMuY29kZSA9ICdFUlJfSU5WQUxJRF9BUkdfVFlQRSc7XHJcbiAgICB9XHJcbn1cclxuZnVuY3Rpb24gdmFsaWRhdGVTdHJpbmcodmFsdWUsIG5hbWUpIHtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9ySW52YWxpZEFyZ1R5cGUobmFtZSwgJ3N0cmluZycsIHZhbHVlKTtcclxuICAgIH1cclxufVxyXG5mdW5jdGlvbiBpc1BhdGhTZXBhcmF0b3IoY29kZSkge1xyXG4gICAgcmV0dXJuIGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCB8fCBjb2RlID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIO1xyXG59XHJcbmZ1bmN0aW9uIGlzUG9zaXhQYXRoU2VwYXJhdG9yKGNvZGUpIHtcclxuICAgIHJldHVybiBjb2RlID09PSBDSEFSX0ZPUldBUkRfU0xBU0g7XHJcbn1cclxuZnVuY3Rpb24gaXNXaW5kb3dzRGV2aWNlUm9vdChjb2RlKSB7XHJcbiAgICByZXR1cm4gY29kZSA+PSBDSEFSX1VQUEVSQ0FTRV9BICYmIGNvZGUgPD0gQ0hBUl9VUFBFUkNBU0VfWiB8fFxyXG4gICAgICAgIGNvZGUgPj0gQ0hBUl9MT1dFUkNBU0VfQSAmJiBjb2RlIDw9IENIQVJfTE9XRVJDQVNFX1o7XHJcbn1cclxuLy8gUmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIHdpdGggZGlyZWN0b3J5IG5hbWVzXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVN0cmluZyhwYXRoLCBhbGxvd0Fib3ZlUm9vdCwgc2VwYXJhdG9yLCBpc1BhdGhTZXBhcmF0b3IpIHtcclxuICAgIGxldCByZXMgPSAnJztcclxuICAgIGxldCBsYXN0U2VnbWVudExlbmd0aCA9IDA7XHJcbiAgICBsZXQgbGFzdFNsYXNoID0gLTE7XHJcbiAgICBsZXQgZG90cyA9IDA7XHJcbiAgICBsZXQgY29kZSA9IDA7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBwYXRoLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgaWYgKGkgPCBwYXRoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpc1BhdGhTZXBhcmF0b3IoY29kZSkpIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb2RlID0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKGNvZGUpKSB7XHJcbiAgICAgICAgICAgIGlmIChsYXN0U2xhc2ggPT09IGkgLSAxIHx8IGRvdHMgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIC8vIE5PT1BcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkb3RzID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA8IDIgfHwgbGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHxcclxuICAgICAgICAgICAgICAgICAgICByZXMuY2hhckNvZGVBdChyZXMubGVuZ3RoIC0gMSkgIT09IENIQVJfRE9UIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmNoYXJDb2RlQXQocmVzLmxlbmd0aCAtIDIpICE9PSBDSEFSX0RPVCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0U2xhc2hJbmRleCA9IHJlcy5sYXN0SW5kZXhPZihzZXBhcmF0b3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFNsYXNoSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXMgPSAnJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IHJlcy5zbGljZSgwLCBsYXN0U2xhc2hJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IHJlcy5sZW5ndGggLSAxIC0gcmVzLmxhc3RJbmRleE9mKHNlcGFyYXRvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG90cyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXMubGVuZ3RoICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9ICcnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvdHMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gcmVzLmxlbmd0aCA+IDAgPyBgJHtzZXBhcmF0b3J9Li5gIDogJy4uJztcclxuICAgICAgICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMgKz0gYCR7c2VwYXJhdG9yfSR7cGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKX1gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzID0gcGF0aC5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gaSAtIGxhc3RTbGFzaCAtIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGFzdFNsYXNoID0gaTtcclxuICAgICAgICAgICAgZG90cyA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGNvZGUgPT09IENIQVJfRE9UICYmIGRvdHMgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICsrZG90cztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGRvdHMgPSAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG59XHJcbmZ1bmN0aW9uIF9mb3JtYXQoc2VwLCBwYXRoT2JqZWN0KSB7XHJcbiAgICBpZiAocGF0aE9iamVjdCA9PT0gbnVsbCB8fCB0eXBlb2YgcGF0aE9iamVjdCAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3JJbnZhbGlkQXJnVHlwZSgncGF0aE9iamVjdCcsICdPYmplY3QnLCBwYXRoT2JqZWN0KTtcclxuICAgIH1cclxuICAgIGNvbnN0IGRpciA9IHBhdGhPYmplY3QuZGlyIHx8IHBhdGhPYmplY3Qucm9vdDtcclxuICAgIGNvbnN0IGJhc2UgPSBwYXRoT2JqZWN0LmJhc2UgfHxcclxuICAgICAgICBgJHtwYXRoT2JqZWN0Lm5hbWUgfHwgJyd9JHtwYXRoT2JqZWN0LmV4dCB8fCAnJ31gO1xyXG4gICAgaWYgKCFkaXIpIHtcclxuICAgICAgICByZXR1cm4gYmFzZTtcclxuICAgIH1cclxuICAgIHJldHVybiBkaXIgPT09IHBhdGhPYmplY3Qucm9vdCA/IGAke2Rpcn0ke2Jhc2V9YCA6IGAke2Rpcn0ke3NlcH0ke2Jhc2V9YDtcclxufVxyXG5leHBvcnQgY29uc3Qgd2luMzIgPSB7XHJcbiAgICAvLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXHJcbiAgICByZXNvbHZlKC4uLnBhdGhTZWdtZW50cykge1xyXG4gICAgICAgIGxldCByZXNvbHZlZERldmljZSA9ICcnO1xyXG4gICAgICAgIGxldCByZXNvbHZlZFRhaWwgPSAnJztcclxuICAgICAgICBsZXQgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBwYXRoU2VnbWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMTsgaS0tKSB7XHJcbiAgICAgICAgICAgIGxldCBwYXRoO1xyXG4gICAgICAgICAgICBpZiAoaSA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aFNlZ21lbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcclxuICAgICAgICAgICAgICAgIC8vIFNraXAgZW1wdHkgZW50cmllc1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAocmVzb2x2ZWREZXZpY2UubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoID0gcHJvY2Vzcy5jd2QoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFdpbmRvd3MgaGFzIHRoZSBjb25jZXB0IG9mIGRyaXZlLXNwZWNpZmljIGN1cnJlbnQgd29ya2luZ1xyXG4gICAgICAgICAgICAgICAgLy8gZGlyZWN0b3JpZXMuIElmIHdlJ3ZlIHJlc29sdmVkIGEgZHJpdmUgbGV0dGVyIGJ1dCBub3QgeWV0IGFuXHJcbiAgICAgICAgICAgICAgICAvLyBhYnNvbHV0ZSBwYXRoLCBnZXQgY3dkIGZvciB0aGF0IGRyaXZlLCBvciB0aGUgcHJvY2VzcyBjd2QgaWZcclxuICAgICAgICAgICAgICAgIC8vIHRoZSBkcml2ZSBjd2QgaXMgbm90IGF2YWlsYWJsZS4gV2UncmUgc3VyZSB0aGUgZGV2aWNlIGlzIG5vdFxyXG4gICAgICAgICAgICAgICAgLy8gYSBVTkMgcGF0aCBhdCB0aGlzIHBvaW50cywgYmVjYXVzZSBVTkMgcGF0aHMgYXJlIGFsd2F5cyBhYnNvbHV0ZS5cclxuICAgICAgICAgICAgICAgIHBhdGggPSBwcm9jZXNzLmVudltgPSR7cmVzb2x2ZWREZXZpY2V9YF0gfHwgcHJvY2Vzcy5jd2QoKTtcclxuICAgICAgICAgICAgICAgIC8vIFZlcmlmeSB0aGF0IGEgY3dkIHdhcyBmb3VuZCBhbmQgdGhhdCBpdCBhY3R1YWxseSBwb2ludHNcclxuICAgICAgICAgICAgICAgIC8vIHRvIG91ciBkcml2ZS4gSWYgbm90LCBkZWZhdWx0IHRvIHRoZSBkcml2ZSdzIHJvb3QuXHJcbiAgICAgICAgICAgICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5zbGljZSgwLCAyKS50b0xvd2VyQ2FzZSgpICE9PSByZXNvbHZlZERldmljZS50b0xvd2VyQ2FzZSgpICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhdGguY2hhckNvZGVBdCgyKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhdGggPSBgJHtyZXNvbHZlZERldmljZX1cXFxcYDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBsZW4gPSBwYXRoLmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IHJvb3RFbmQgPSAwO1xyXG4gICAgICAgICAgICBsZXQgZGV2aWNlID0gJyc7XHJcbiAgICAgICAgICAgIGxldCBpc0Fic29sdXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgICAgIC8vIFRyeSB0byBtYXRjaCBhIHJvb3RcclxuICAgICAgICAgICAgaWYgKGxlbiA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihjb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGBwYXRoYCBjb250YWlucyBqdXN0IGEgcGF0aCBzZXBhcmF0b3JcclxuICAgICAgICAgICAgICAgICAgICByb290RW5kID0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpc0Fic29sdXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChpc1BhdGhTZXBhcmF0b3IoY29kZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIFBvc3NpYmxlIFVOQyByb290XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBzdGFydGVkIHdpdGggYSBzZXBhcmF0b3IsIHdlIGtub3cgd2UgYXQgbGVhc3QgaGF2ZSBhblxyXG4gICAgICAgICAgICAgICAgLy8gYWJzb2x1dGUgcGF0aCBvZiBzb21lIGtpbmQgKFVOQyBvciBvdGhlcndpc2UpXHJcbiAgICAgICAgICAgICAgICBpc0Fic29sdXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmIChpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KDEpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoZWQgZG91YmxlIHBhdGggc2VwYXJhdG9yIGF0IGJlZ2lubmluZ1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBqID0gMjtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbGFzdCA9IGo7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTWF0Y2ggMSBvciBtb3JlIG5vbi1wYXRoIHNlcGFyYXRvcnNcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IGxlbiAmJiAhaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdChqKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaiA8IGxlbiAmJiBqICE9PSBsYXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpcnN0UGFydCA9IHBhdGguc2xpY2UobGFzdCwgaik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoZWQhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBqO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYXRjaCAxIG9yIG1vcmUgcGF0aCBzZXBhcmF0b3JzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgbGVuICYmIGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoaikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogPCBsZW4gJiYgaiAhPT0gbGFzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWF0Y2hlZCFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBqO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWF0Y2ggMSBvciBtb3JlIG5vbi1wYXRoIHNlcGFyYXRvcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgbGVuICYmICFpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KGopKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGorKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqID09PSBsZW4gfHwgaiAhPT0gbGFzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgYSBVTkMgcm9vdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZSA9IGBcXFxcXFxcXCR7Zmlyc3RQYXJ0fVxcXFwke3BhdGguc2xpY2UobGFzdCwgail9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290RW5kID0gajtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHJvb3RFbmQgPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGlzV2luZG93c0RldmljZVJvb3QoY29kZSkgJiZcclxuICAgICAgICAgICAgICAgIHBhdGguY2hhckNvZGVBdCgxKSA9PT0gQ0hBUl9DT0xPTikge1xyXG4gICAgICAgICAgICAgICAgLy8gUG9zc2libGUgZGV2aWNlIHJvb3RcclxuICAgICAgICAgICAgICAgIGRldmljZSA9IHBhdGguc2xpY2UoMCwgMik7XHJcbiAgICAgICAgICAgICAgICByb290RW5kID0gMjtcclxuICAgICAgICAgICAgICAgIGlmIChsZW4gPiAyICYmIGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoMikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJlYXQgc2VwYXJhdG9yIGZvbGxvd2luZyBkcml2ZSBuYW1lIGFzIGFuIGFic29sdXRlIHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAvLyBpbmRpY2F0b3JcclxuICAgICAgICAgICAgICAgICAgICBpc0Fic29sdXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICByb290RW5kID0gMztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGV2aWNlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlZERldmljZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRldmljZS50b0xvd2VyQ2FzZSgpICE9PSByZXNvbHZlZERldmljZS50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgcGF0aCBwb2ludHMgdG8gYW5vdGhlciBkZXZpY2Ugc28gaXQgaXMgbm90IGFwcGxpY2FibGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZWREZXZpY2UgPSBkZXZpY2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlc29sdmVkQWJzb2x1dGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlZERldmljZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlZFRhaWwgPSBgJHtwYXRoLnNsaWNlKHJvb3RFbmQpfVxcXFwke3Jlc29sdmVkVGFpbH1gO1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGlzQWJzb2x1dGU7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNBYnNvbHV0ZSAmJiByZXNvbHZlZERldmljZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsXHJcbiAgICAgICAgLy8gYnV0IGhhbmRsZSByZWxhdGl2ZSBwYXRocyB0byBiZSBzYWZlIChtaWdodCBoYXBwZW4gd2hlbiBwcm9jZXNzLmN3ZCgpXHJcbiAgICAgICAgLy8gZmFpbHMpXHJcbiAgICAgICAgLy8gTm9ybWFsaXplIHRoZSB0YWlsIHBhdGhcclxuICAgICAgICByZXNvbHZlZFRhaWwgPSBub3JtYWxpemVTdHJpbmcocmVzb2x2ZWRUYWlsLCAhcmVzb2x2ZWRBYnNvbHV0ZSwgJ1xcXFwnLCBpc1BhdGhTZXBhcmF0b3IpO1xyXG4gICAgICAgIHJldHVybiByZXNvbHZlZEFic29sdXRlID9cclxuICAgICAgICAgICAgYCR7cmVzb2x2ZWREZXZpY2V9XFxcXCR7cmVzb2x2ZWRUYWlsfWAgOlxyXG4gICAgICAgICAgICBgJHtyZXNvbHZlZERldmljZX0ke3Jlc29sdmVkVGFpbH1gIHx8ICcuJztcclxuICAgIH0sXHJcbiAgICBub3JtYWxpemUocGF0aCkge1xyXG4gICAgICAgIHZhbGlkYXRlU3RyaW5nKHBhdGgsICdwYXRoJyk7XHJcbiAgICAgICAgY29uc3QgbGVuID0gcGF0aC5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbiA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJy4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcm9vdEVuZCA9IDA7XHJcbiAgICAgICAgbGV0IGRldmljZTtcclxuICAgICAgICBsZXQgaXNBYnNvbHV0ZSA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIGEgcm9vdFxyXG4gICAgICAgIGlmIChsZW4gPT09IDEpIHtcclxuICAgICAgICAgICAgLy8gYHBhdGhgIGNvbnRhaW5zIGp1c3QgYSBzaW5nbGUgY2hhciwgZXhpdCBlYXJseSB0byBhdm9pZFxyXG4gICAgICAgICAgICAvLyB1bm5lY2Vzc2FyeSB3b3JrXHJcbiAgICAgICAgICAgIHJldHVybiBpc1Bvc2l4UGF0aFNlcGFyYXRvcihjb2RlKSA/ICdcXFxcJyA6IHBhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc1BhdGhTZXBhcmF0b3IoY29kZSkpIHtcclxuICAgICAgICAgICAgLy8gUG9zc2libGUgVU5DIHJvb3RcclxuICAgICAgICAgICAgLy8gSWYgd2Ugc3RhcnRlZCB3aXRoIGEgc2VwYXJhdG9yLCB3ZSBrbm93IHdlIGF0IGxlYXN0IGhhdmUgYW4gYWJzb2x1dGVcclxuICAgICAgICAgICAgLy8gcGF0aCBvZiBzb21lIGtpbmQgKFVOQyBvciBvdGhlcndpc2UpXHJcbiAgICAgICAgICAgIGlzQWJzb2x1dGUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdCgxKSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIE1hdGNoZWQgZG91YmxlIHBhdGggc2VwYXJhdG9yIGF0IGJlZ2lubmluZ1xyXG4gICAgICAgICAgICAgICAgbGV0IGogPSAyO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhc3QgPSBqO1xyXG4gICAgICAgICAgICAgICAgLy8gTWF0Y2ggMSBvciBtb3JlIG5vbi1wYXRoIHNlcGFyYXRvcnNcclxuICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgbGVuICYmICFpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KGopKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGorKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChqIDwgbGVuICYmIGogIT09IGxhc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaXJzdFBhcnQgPSBwYXRoLnNsaWNlKGxhc3QsIGopO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoZWQhXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdCA9IGo7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTWF0Y2ggMSBvciBtb3JlIHBhdGggc2VwYXJhdG9yc1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgbGVuICYmIGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoaikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGorKztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGogPCBsZW4gJiYgaiAhPT0gbGFzdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYXRjaGVkIVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0ID0gajtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWF0Y2ggMSBvciBtb3JlIG5vbi1wYXRoIHNlcGFyYXRvcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGogPCBsZW4gJiYgIWlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoaikpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogPT09IGxlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgbWF0Y2hlZCBhIFVOQyByb290IG9ubHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJldHVybiB0aGUgbm9ybWFsaXplZCB2ZXJzaW9uIG9mIHRoZSBVTkMgcm9vdCBzaW5jZSB0aGVyZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXMgbm90aGluZyBsZWZ0IHRvIHByb2Nlc3NcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgXFxcXFxcXFwke2ZpcnN0UGFydH1cXFxcJHtwYXRoLnNsaWNlKGxhc3QpfVxcXFxgO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqICE9PSBsYXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIGEgVU5DIHJvb3Qgd2l0aCBsZWZ0b3ZlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZSA9IGBcXFxcXFxcXCR7Zmlyc3RQYXJ0fVxcXFwke3BhdGguc2xpY2UobGFzdCwgail9YDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RFbmQgPSBqO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcm9vdEVuZCA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNXaW5kb3dzRGV2aWNlUm9vdChjb2RlKSAmJiBwYXRoLmNoYXJDb2RlQXQoMSkgPT09IENIQVJfQ09MT04pIHtcclxuICAgICAgICAgICAgLy8gUG9zc2libGUgZGV2aWNlIHJvb3RcclxuICAgICAgICAgICAgZGV2aWNlID0gcGF0aC5zbGljZSgwLCAyKTtcclxuICAgICAgICAgICAgcm9vdEVuZCA9IDI7XHJcbiAgICAgICAgICAgIGlmIChsZW4gPiAyICYmIGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoMikpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBUcmVhdCBzZXBhcmF0b3IgZm9sbG93aW5nIGRyaXZlIG5hbWUgYXMgYW4gYWJzb2x1dGUgcGF0aFxyXG4gICAgICAgICAgICAgICAgLy8gaW5kaWNhdG9yXHJcbiAgICAgICAgICAgICAgICBpc0Fic29sdXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHJvb3RFbmQgPSAzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0YWlsID0gcm9vdEVuZCA8IGxlbiA/XHJcbiAgICAgICAgICAgIG5vcm1hbGl6ZVN0cmluZyhwYXRoLnNsaWNlKHJvb3RFbmQpLCAhaXNBYnNvbHV0ZSwgJ1xcXFwnLCBpc1BhdGhTZXBhcmF0b3IpIDpcclxuICAgICAgICAgICAgJyc7XHJcbiAgICAgICAgaWYgKHRhaWwubGVuZ3RoID09PSAwICYmICFpc0Fic29sdXRlKSB7XHJcbiAgICAgICAgICAgIHRhaWwgPSAnLic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0YWlsLmxlbmd0aCA+IDAgJiYgaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdChsZW4gLSAxKSkpIHtcclxuICAgICAgICAgICAgdGFpbCArPSAnXFxcXCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZXZpY2UgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXNBYnNvbHV0ZSA/IGBcXFxcJHt0YWlsfWAgOiB0YWlsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXNBYnNvbHV0ZSA/IGAke2RldmljZX1cXFxcJHt0YWlsfWAgOiBgJHtkZXZpY2V9JHt0YWlsfWA7XHJcbiAgICB9LFxyXG4gICAgaXNBYnNvbHV0ZShwYXRoKSB7XHJcbiAgICAgICAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcclxuICAgICAgICBjb25zdCBsZW4gPSBwYXRoLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgY29kZSA9IHBhdGguY2hhckNvZGVBdCgwKTtcclxuICAgICAgICByZXR1cm4gaXNQYXRoU2VwYXJhdG9yKGNvZGUpIHx8XHJcbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIGRldmljZSByb290XHJcbiAgICAgICAgICAgIGxlbiA+IDIgJiZcclxuICAgICAgICAgICAgICAgIGlzV2luZG93c0RldmljZVJvb3QoY29kZSkgJiZcclxuICAgICAgICAgICAgICAgIHBhdGguY2hhckNvZGVBdCgxKSA9PT0gQ0hBUl9DT0xPTiAmJlxyXG4gICAgICAgICAgICAgICAgaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdCgyKSk7XHJcbiAgICB9LFxyXG4gICAgam9pbiguLi5wYXRocykge1xyXG4gICAgICAgIGlmIChwYXRocy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcuJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGpvaW5lZDtcclxuICAgICAgICBsZXQgZmlyc3RQYXJ0O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aHMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgY29uc3QgYXJnID0gcGF0aHNbaV07XHJcbiAgICAgICAgICAgIHZhbGlkYXRlU3RyaW5nKGFyZywgJ3BhdGgnKTtcclxuICAgICAgICAgICAgaWYgKGFyZy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBqb2luZWQgPSBmaXJzdFBhcnQgPSBhcmc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBqb2luZWQgKz0gYFxcXFwke2FyZ31gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChqb2luZWQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJy4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB0aGUgam9pbmVkIHBhdGggZG9lc24ndCBzdGFydCB3aXRoIHR3byBzbGFzaGVzLCBiZWNhdXNlXHJcbiAgICAgICAgLy8gbm9ybWFsaXplKCkgd2lsbCBtaXN0YWtlIGl0IGZvciBhbiBVTkMgcGF0aCB0aGVuLlxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgLy8gVGhpcyBzdGVwIGlzIHNraXBwZWQgd2hlbiBpdCBpcyB2ZXJ5IGNsZWFyIHRoYXQgdGhlIHVzZXIgYWN0dWFsbHlcclxuICAgICAgICAvLyBpbnRlbmRlZCB0byBwb2ludCBhdCBhbiBVTkMgcGF0aC4gVGhpcyBpcyBhc3N1bWVkIHdoZW4gdGhlIGZpcnN0XHJcbiAgICAgICAgLy8gbm9uLWVtcHR5IHN0cmluZyBhcmd1bWVudHMgc3RhcnRzIHdpdGggZXhhY3RseSB0d28gc2xhc2hlcyBmb2xsb3dlZCBieVxyXG4gICAgICAgIC8vIGF0IGxlYXN0IG9uZSBtb3JlIG5vbi1zbGFzaCBjaGFyYWN0ZXIuXHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBOb3RlIHRoYXQgZm9yIG5vcm1hbGl6ZSgpIHRvIHRyZWF0IGEgcGF0aCBhcyBhbiBVTkMgcGF0aCBpdCBuZWVkcyB0b1xyXG4gICAgICAgIC8vIGhhdmUgYXQgbGVhc3QgMiBjb21wb25lbnRzLCBzbyB3ZSBkb24ndCBmaWx0ZXIgZm9yIHRoYXQgaGVyZS5cclxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoYXQgdGhlIHVzZXIgY2FuIHVzZSBqb2luIHRvIGNvbnN0cnVjdCBVTkMgcGF0aHMgZnJvbVxyXG4gICAgICAgIC8vIGEgc2VydmVyIG5hbWUgYW5kIGEgc2hhcmUgbmFtZTsgZm9yIGV4YW1wbGU6XHJcbiAgICAgICAgLy8gICBwYXRoLmpvaW4oJy8vc2VydmVyJywgJ3NoYXJlJykgLT4gJ1xcXFxcXFxcc2VydmVyXFxcXHNoYXJlXFxcXCcpXHJcbiAgICAgICAgbGV0IG5lZWRzUmVwbGFjZSA9IHRydWU7XHJcbiAgICAgICAgbGV0IHNsYXNoQ291bnQgPSAwO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZmlyc3RQYXJ0ID09PSAnc3RyaW5nJyAmJiBpc1BhdGhTZXBhcmF0b3IoZmlyc3RQYXJ0LmNoYXJDb2RlQXQoMCkpKSB7XHJcbiAgICAgICAgICAgICsrc2xhc2hDb3VudDtcclxuICAgICAgICAgICAgY29uc3QgZmlyc3RMZW4gPSBmaXJzdFBhcnQubGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAoZmlyc3RMZW4gPiAxICYmIGlzUGF0aFNlcGFyYXRvcihmaXJzdFBhcnQuY2hhckNvZGVBdCgxKSkpIHtcclxuICAgICAgICAgICAgICAgICsrc2xhc2hDb3VudDtcclxuICAgICAgICAgICAgICAgIGlmIChmaXJzdExlbiA+IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKGZpcnN0UGFydC5jaGFyQ29kZUF0KDIpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3NsYXNoQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIGEgVU5DIHBhdGggaW4gdGhlIGZpcnN0IHBhcnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmVlZHNSZXBsYWNlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChuZWVkc1JlcGxhY2UpIHtcclxuICAgICAgICAgICAgLy8gRmluZCBhbnkgbW9yZSBjb25zZWN1dGl2ZSBzbGFzaGVzIHdlIG5lZWQgdG8gcmVwbGFjZVxyXG4gICAgICAgICAgICB3aGlsZSAoc2xhc2hDb3VudCA8IGpvaW5lZC5sZW5ndGggJiZcclxuICAgICAgICAgICAgICAgIGlzUGF0aFNlcGFyYXRvcihqb2luZWQuY2hhckNvZGVBdChzbGFzaENvdW50KSkpIHtcclxuICAgICAgICAgICAgICAgIHNsYXNoQ291bnQrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBzbGFzaGVzIGlmIG5lZWRlZFxyXG4gICAgICAgICAgICBpZiAoc2xhc2hDb3VudCA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBqb2luZWQgPSBgXFxcXCR7am9pbmVkLnNsaWNlKHNsYXNoQ291bnQpfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHdpbjMyLm5vcm1hbGl6ZShqb2luZWQpO1xyXG4gICAgfSxcclxuICAgIC8vIEl0IHdpbGwgc29sdmUgdGhlIHJlbGF0aXZlIHBhdGggZnJvbSBgZnJvbWAgdG8gYHRvYCwgZm9yIGluc3RhbmNlOlxyXG4gICAgLy8gIGZyb20gPSAnQzpcXFxcb3JhbmRlYVxcXFx0ZXN0XFxcXGFhYSdcclxuICAgIC8vICB0byA9ICdDOlxcXFxvcmFuZGVhXFxcXGltcGxcXFxcYmJiJ1xyXG4gICAgLy8gVGhlIG91dHB1dCBvZiB0aGUgZnVuY3Rpb24gc2hvdWxkIGJlOiAnLi5cXFxcLi5cXFxcaW1wbFxcXFxiYmInXHJcbiAgICByZWxhdGl2ZShmcm9tLCB0bykge1xyXG4gICAgICAgIHZhbGlkYXRlU3RyaW5nKGZyb20sICdmcm9tJyk7XHJcbiAgICAgICAgdmFsaWRhdGVTdHJpbmcodG8sICd0bycpO1xyXG4gICAgICAgIGlmIChmcm9tID09PSB0bykge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZyb21PcmlnID0gd2luMzIucmVzb2x2ZShmcm9tKTtcclxuICAgICAgICBjb25zdCB0b09yaWcgPSB3aW4zMi5yZXNvbHZlKHRvKTtcclxuICAgICAgICBpZiAoZnJvbU9yaWcgPT09IHRvT3JpZykge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZyb20gPSBmcm9tT3JpZy50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIHRvID0gdG9PcmlnLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKGZyb20gPT09IHRvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xyXG4gICAgICAgIGxldCBmcm9tU3RhcnQgPSAwO1xyXG4gICAgICAgIHdoaWxlIChmcm9tU3RhcnQgPCBmcm9tLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICBmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0KSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICBmcm9tU3RhcnQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBiYWNrc2xhc2hlcyAoYXBwbGljYWJsZSB0byBVTkMgcGF0aHMgb25seSlcclxuICAgICAgICBsZXQgZnJvbUVuZCA9IGZyb20ubGVuZ3RoO1xyXG4gICAgICAgIHdoaWxlIChmcm9tRW5kIC0gMSA+IGZyb21TdGFydCAmJlxyXG4gICAgICAgICAgICBmcm9tLmNoYXJDb2RlQXQoZnJvbUVuZCAtIDEpID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIKSB7XHJcbiAgICAgICAgICAgIGZyb21FbmQtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZnJvbUxlbiA9IGZyb21FbmQgLSBmcm9tU3RhcnQ7XHJcbiAgICAgICAgLy8gVHJpbSBhbnkgbGVhZGluZyBiYWNrc2xhc2hlc1xyXG4gICAgICAgIGxldCB0b1N0YXJ0ID0gMDtcclxuICAgICAgICB3aGlsZSAodG9TdGFydCA8IHRvLmxlbmd0aCAmJlxyXG4gICAgICAgICAgICB0by5jaGFyQ29kZUF0KHRvU3RhcnQpID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIKSB7XHJcbiAgICAgICAgICAgIHRvU3RhcnQrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVHJpbSB0cmFpbGluZyBiYWNrc2xhc2hlcyAoYXBwbGljYWJsZSB0byBVTkMgcGF0aHMgb25seSlcclxuICAgICAgICBsZXQgdG9FbmQgPSB0by5sZW5ndGg7XHJcbiAgICAgICAgd2hpbGUgKHRvRW5kIC0gMSA+IHRvU3RhcnQgJiZcclxuICAgICAgICAgICAgdG8uY2hhckNvZGVBdCh0b0VuZCAtIDEpID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIKSB7XHJcbiAgICAgICAgICAgIHRvRW5kLS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRvTGVuID0gdG9FbmQgLSB0b1N0YXJ0O1xyXG4gICAgICAgIC8vIENvbXBhcmUgcGF0aHMgdG8gZmluZCB0aGUgbG9uZ2VzdCBjb21tb24gcGF0aCBmcm9tIHJvb3RcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBmcm9tTGVuIDwgdG9MZW4gPyBmcm9tTGVuIDogdG9MZW47XHJcbiAgICAgICAgbGV0IGxhc3RDb21tb25TZXAgPSAtMTtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBmcm9tQ29kZSA9IGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKTtcclxuICAgICAgICAgICAgaWYgKGZyb21Db2RlICE9PSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZnJvbUNvZGUgPT09IENIQVJfQkFDS1dBUkRfU0xBU0gpIHtcclxuICAgICAgICAgICAgICAgIGxhc3RDb21tb25TZXAgPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFdlIGZvdW5kIGEgbWlzbWF0Y2ggYmVmb3JlIHRoZSBmaXJzdCBjb21tb24gcGF0aCBzZXBhcmF0b3Igd2FzIHNlZW4sIHNvXHJcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBvcmlnaW5hbCBgdG9gLlxyXG4gICAgICAgIGlmIChpICE9PSBsZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKGxhc3RDb21tb25TZXAgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdG9PcmlnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodG9MZW4gPiBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGBmcm9tYCBpcyB0aGUgZXhhY3QgYmFzZSBwYXRoIGZvciBgdG9gLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPSdDOlxcXFxmb29cXFxcYmFyJzsgdG89J0M6XFxcXGZvb1xcXFxiYXJcXFxcYmF6J1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0b09yaWcuc2xpY2UodG9TdGFydCArIGkgKyAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBkZXZpY2Ugcm9vdC5cclxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nQzpcXFxcJzsgdG89J0M6XFxcXGZvbydcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG9PcmlnLnNsaWNlKHRvU3RhcnQgKyBpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZnJvbUxlbiA+IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYGZyb21gLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPSdDOlxcXFxmb29cXFxcYmFyJzsgdG89J0M6XFxcXGZvbydcclxuICAgICAgICAgICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gaTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGkgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBnZXQgaGVyZSBpZiBgdG9gIGlzIHRoZSBkZXZpY2Ugcm9vdC5cclxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nQzpcXFxcZm9vXFxcXGJhcic7IHRvPSdDOlxcXFwnXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IDM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGxhc3RDb21tb25TZXAgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgb3V0ID0gJyc7XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgdGhlIHJlbGF0aXZlIHBhdGggYmFzZWQgb24gdGhlIHBhdGggZGlmZmVyZW5jZSBiZXR3ZWVuIGB0b2AgYW5kXHJcbiAgICAgICAgLy8gYGZyb21gXHJcbiAgICAgICAgZm9yIChpID0gZnJvbVN0YXJ0ICsgbGFzdENvbW1vblNlcCArIDE7IGkgPD0gZnJvbUVuZDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChpID09PSBmcm9tRW5kIHx8IGZyb20uY2hhckNvZGVBdChpKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAgICAgb3V0ICs9IG91dC5sZW5ndGggPT09IDAgPyAnLi4nIDogJ1xcXFwuLic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdG9TdGFydCArPSBsYXN0Q29tbW9uU2VwO1xyXG4gICAgICAgIC8vIExhc3RseSwgYXBwZW5kIHRoZSByZXN0IG9mIHRoZSBkZXN0aW5hdGlvbiAoYHRvYCkgcGF0aCB0aGF0IGNvbWVzIGFmdGVyXHJcbiAgICAgICAgLy8gdGhlIGNvbW1vbiBwYXRoIHBhcnRzXHJcbiAgICAgICAgaWYgKG91dC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgJHtvdXR9JHt0b09yaWcuc2xpY2UodG9TdGFydCwgdG9FbmQpfWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0b09yaWcuY2hhckNvZGVBdCh0b1N0YXJ0KSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICArK3RvU3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0b09yaWcuc2xpY2UodG9TdGFydCwgdG9FbmQpO1xyXG4gICAgfSxcclxuICAgIHRvTmFtZXNwYWNlZFBhdGgocGF0aCkge1xyXG4gICAgICAgIC8vIE5vdGU6IHRoaXMgd2lsbCAqcHJvYmFibHkqIHRocm93IHNvbWV3aGVyZS5cclxuICAgICAgICBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwYXRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZXNvbHZlZFBhdGggPSB3aW4zMi5yZXNvbHZlKHBhdGgpO1xyXG4gICAgICAgIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoIDw9IDIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXNvbHZlZFBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAvLyBQb3NzaWJsZSBVTkMgcm9vdFxyXG4gICAgICAgICAgICBpZiAocmVzb2x2ZWRQYXRoLmNoYXJDb2RlQXQoMSkgPT09IENIQVJfQkFDS1dBUkRfU0xBU0gpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSByZXNvbHZlZFBhdGguY2hhckNvZGVBdCgyKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2RlICE9PSBDSEFSX1FVRVNUSU9OX01BUksgJiYgY29kZSAhPT0gQ0hBUl9ET1QpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBNYXRjaGVkIG5vbi1sb25nIFVOQyByb290LCBjb252ZXJ0IHRoZSBwYXRoIHRvIGEgbG9uZyBVTkMgcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBgXFxcXFxcXFw/XFxcXFVOQ1xcXFwke3Jlc29sdmVkUGF0aC5zbGljZSgyKX1gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzV2luZG93c0RldmljZVJvb3QocmVzb2x2ZWRQYXRoLmNoYXJDb2RlQXQoMCkpICYmXHJcbiAgICAgICAgICAgIHJlc29sdmVkUGF0aC5jaGFyQ29kZUF0KDEpID09PSBDSEFSX0NPTE9OICYmXHJcbiAgICAgICAgICAgIHJlc29sdmVkUGF0aC5jaGFyQ29kZUF0KDIpID09PSBDSEFSX0JBQ0tXQVJEX1NMQVNIKSB7XHJcbiAgICAgICAgICAgIC8vIE1hdGNoZWQgZGV2aWNlIHJvb3QsIGNvbnZlcnQgdGhlIHBhdGggdG8gYSBsb25nIFVOQyBwYXRoXHJcbiAgICAgICAgICAgIHJldHVybiBgXFxcXFxcXFw/XFxcXCR7cmVzb2x2ZWRQYXRofWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXRoO1xyXG4gICAgfSxcclxuICAgIGRpcm5hbWUocGF0aCkge1xyXG4gICAgICAgIHZhbGlkYXRlU3RyaW5nKHBhdGgsICdwYXRoJyk7XHJcbiAgICAgICAgY29uc3QgbGVuID0gcGF0aC5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbiA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJy4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcm9vdEVuZCA9IC0xO1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICAgIGNvbnN0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgaWYgKGxlbiA9PT0gMSkge1xyXG4gICAgICAgICAgICAvLyBgcGF0aGAgY29udGFpbnMganVzdCBhIHBhdGggc2VwYXJhdG9yLCBleGl0IGVhcmx5IHRvIGF2b2lkXHJcbiAgICAgICAgICAgIC8vIHVubmVjZXNzYXJ5IHdvcmsgb3IgYSBkb3QuXHJcbiAgICAgICAgICAgIHJldHVybiBpc1BhdGhTZXBhcmF0b3IoY29kZSkgPyBwYXRoIDogJy4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUcnkgdG8gbWF0Y2ggYSByb290XHJcbiAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihjb2RlKSkge1xyXG4gICAgICAgICAgICAvLyBQb3NzaWJsZSBVTkMgcm9vdFxyXG4gICAgICAgICAgICByb290RW5kID0gb2Zmc2V0ID0gMTtcclxuICAgICAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoMSkpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBNYXRjaGVkIGRvdWJsZSBwYXRoIHNlcGFyYXRvciBhdCBiZWdpbm5pbmdcclxuICAgICAgICAgICAgICAgIGxldCBqID0gMjtcclxuICAgICAgICAgICAgICAgIGxldCBsYXN0ID0gajtcclxuICAgICAgICAgICAgICAgIC8vIE1hdGNoIDEgb3IgbW9yZSBub24tcGF0aCBzZXBhcmF0b3JzXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IGxlbiAmJiAhaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdChqKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoaiA8IGxlbiAmJiBqICE9PSBsYXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTWF0Y2hlZCFcclxuICAgICAgICAgICAgICAgICAgICBsYXN0ID0gajtcclxuICAgICAgICAgICAgICAgICAgICAvLyBNYXRjaCAxIG9yIG1vcmUgcGF0aCBzZXBhcmF0b3JzXHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGogPCBsZW4gJiYgaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdChqKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaisrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaiA8IGxlbiAmJiBqICE9PSBsYXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoZWQhXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3QgPSBqO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBNYXRjaCAxIG9yIG1vcmUgbm9uLXBhdGggc2VwYXJhdG9yc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IGxlbiAmJiAhaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdChqKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGorKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaiA9PT0gbGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIGEgVU5DIHJvb3Qgb25seVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGogIT09IGxhc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgYSBVTkMgcm9vdCB3aXRoIGxlZnRvdmVyc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gT2Zmc2V0IGJ5IDEgdG8gaW5jbHVkZSB0aGUgc2VwYXJhdG9yIGFmdGVyIHRoZSBVTkMgcm9vdCB0b1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJlYXQgaXQgYXMgYSBcIm5vcm1hbCByb290XCIgb24gdG9wIG9mIGEgKFVOQykgcm9vdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdEVuZCA9IG9mZnNldCA9IGogKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIGRldmljZSByb290XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGlzV2luZG93c0RldmljZVJvb3QoY29kZSkgJiYgcGF0aC5jaGFyQ29kZUF0KDEpID09PSBDSEFSX0NPTE9OKSB7XHJcbiAgICAgICAgICAgIHJvb3RFbmQgPSBsZW4gPiAyICYmIGlzUGF0aFNlcGFyYXRvcihwYXRoLmNoYXJDb2RlQXQoMikpID8gMyA6IDI7XHJcbiAgICAgICAgICAgIG9mZnNldCA9IHJvb3RFbmQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBlbmQgPSAtMTtcclxuICAgICAgICBsZXQgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gbGVuIC0gMTsgaSA+PSBvZmZzZXQ7IC0taSkge1xyXG4gICAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdChpKSkpIHtcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gaTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICBpZiAocm9vdEVuZCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAnLic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZW5kID0gcm9vdEVuZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhdGguc2xpY2UoMCwgZW5kKTtcclxuICAgIH0sXHJcbiAgICBiYXNlbmFtZShwYXRoLCBleHQpIHtcclxuICAgICAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdmFsaWRhdGVTdHJpbmcoZXh0LCAnZXh0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbGlkYXRlU3RyaW5nKHBhdGgsICdwYXRoJyk7XHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBsZXQgZW5kID0gLTE7XHJcbiAgICAgICAgbGV0IG1hdGNoZWRTbGFzaCA9IHRydWU7XHJcbiAgICAgICAgbGV0IGk7XHJcbiAgICAgICAgLy8gQ2hlY2sgZm9yIGEgZHJpdmUgbGV0dGVyIHByZWZpeCBzbyBhcyBub3QgdG8gbWlzdGFrZSB0aGUgZm9sbG93aW5nXHJcbiAgICAgICAgLy8gcGF0aCBzZXBhcmF0b3IgYXMgYW4gZXh0cmEgc2VwYXJhdG9yIGF0IHRoZSBlbmQgb2YgdGhlIHBhdGggdGhhdCBjYW4gYmVcclxuICAgICAgICAvLyBkaXNyZWdhcmRlZFxyXG4gICAgICAgIGlmIChwYXRoLmxlbmd0aCA+PSAyICYmXHJcbiAgICAgICAgICAgIGlzV2luZG93c0RldmljZVJvb3QocGF0aC5jaGFyQ29kZUF0KDApKSAmJlxyXG4gICAgICAgICAgICBwYXRoLmNoYXJDb2RlQXQoMSkgPT09IENIQVJfQ09MT04pIHtcclxuICAgICAgICAgICAgc3RhcnQgPSAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgZXh0Lmxlbmd0aCA+IDAgJiYgZXh0Lmxlbmd0aCA8PSBwYXRoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAoZXh0ID09PSBwYXRoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGV4dElkeCA9IGV4dC5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBsZXQgZmlyc3ROb25TbGFzaEVuZCA9IC0xO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gc3RhcnQ7IC0taSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29kZSA9IHBhdGguY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgICAgIGlmIChpc1BhdGhTZXBhcmF0b3IoY29kZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHNlcGFyYXRvcnMgYXQgdGhlIGVuZCBvZiB0aGUgc3RyaW5nLCBzdG9wIG5vd1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdE5vblNsYXNoRW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgcmVtZW1iZXIgdGhpcyBpbmRleCBpbiBjYXNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgaXQgaWYgdGhlIGV4dGVuc2lvbiBlbmRzIHVwIG5vdCBtYXRjaGluZ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3ROb25TbGFzaEVuZCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXh0SWR4ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVHJ5IHRvIG1hdGNoIHRoZSBleHBsaWNpdCBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IGV4dC5jaGFyQ29kZUF0KGV4dElkeCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICgtLWV4dElkeCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIHRoZSBleHRlbnNpb24sIHNvIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91ciBwYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tcG9uZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5kID0gaTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dGVuc2lvbiBkb2VzIG5vdCBtYXRjaCwgc28gb3VyIHJlc3VsdCBpcyB0aGUgZW50aXJlIHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbXBvbmVudFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0SWR4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBmaXJzdE5vblNsYXNoRW5kO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdGFydCA9PT0gZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBlbmQgPSBmaXJzdE5vblNsYXNoRW5kO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGVuZCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGVuZCA9IHBhdGgubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gc3RhcnQ7IC0taSkge1xyXG4gICAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdChpKSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChlbmQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgdGhlIGZpcnN0IG5vbi1wYXRoIHNlcGFyYXRvciwgbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyXHJcbiAgICAgICAgICAgICAgICAvLyBwYXRoIGNvbXBvbmVudFxyXG4gICAgICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBlbmQgPSBpICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgfSxcclxuICAgIGV4dG5hbWUocGF0aCkge1xyXG4gICAgICAgIHZhbGlkYXRlU3RyaW5nKHBhdGgsICdwYXRoJyk7XHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBsZXQgc3RhcnREb3QgPSAtMTtcclxuICAgICAgICBsZXQgc3RhcnRQYXJ0ID0gMDtcclxuICAgICAgICBsZXQgZW5kID0gLTE7XHJcbiAgICAgICAgbGV0IG1hdGNoZWRTbGFzaCA9IHRydWU7XHJcbiAgICAgICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxyXG4gICAgICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXHJcbiAgICAgICAgbGV0IHByZURvdFN0YXRlID0gMDtcclxuICAgICAgICAvLyBDaGVjayBmb3IgYSBkcml2ZSBsZXR0ZXIgcHJlZml4IHNvIGFzIG5vdCB0byBtaXN0YWtlIHRoZSBmb2xsb3dpbmdcclxuICAgICAgICAvLyBwYXRoIHNlcGFyYXRvciBhcyBhbiBleHRyYSBzZXBhcmF0b3IgYXQgdGhlIGVuZCBvZiB0aGUgcGF0aCB0aGF0IGNhbiBiZVxyXG4gICAgICAgIC8vIGRpc3JlZ2FyZGVkXHJcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID49IDIgJiZcclxuICAgICAgICAgICAgcGF0aC5jaGFyQ29kZUF0KDEpID09PSBDSEFSX0NPTE9OICYmXHJcbiAgICAgICAgICAgIGlzV2luZG93c0RldmljZVJvb3QocGF0aC5jaGFyQ29kZUF0KDApKSkge1xyXG4gICAgICAgICAgICBzdGFydCA9IHN0YXJ0UGFydCA9IDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gc3RhcnQ7IC0taSkge1xyXG4gICAgICAgICAgICBjb25zdCBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKGNvZGUpKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxyXG4gICAgICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0UGFydCA9IGkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCBtYXJrIHRoaXMgYXMgdGhlIGVuZCBvZiBvdXJcclxuICAgICAgICAgICAgICAgIC8vIGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgbWF0Y2hlZFNsYXNoID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBlbmQgPSBpICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29kZSA9PT0gQ0hBUl9ET1QpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgb3VyIGZpcnN0IGRvdCwgbWFyayBpdCBhcyB0aGUgc3RhcnQgb2Ygb3VyIGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RG90ID0gaTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHByZURvdFN0YXRlICE9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJlRG90U3RhdGUgPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHN0YXJ0RG90ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBhbmQgbm9uLXBhdGggc2VwYXJhdG9yIGJlZm9yZSBvdXIgZG90LCBzbyB3ZSBzaG91bGRcclxuICAgICAgICAgICAgICAgIC8vIGhhdmUgYSBnb29kIGNoYW5jZSBhdCBoYXZpbmcgYSBub24tZW1wdHkgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHxcclxuICAgICAgICAgICAgZW5kID09PSAtMSB8fFxyXG4gICAgICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGNoYXJhY3RlciBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGRvdFxyXG4gICAgICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxyXG4gICAgICAgICAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXHJcbiAgICAgICAgICAgIChwcmVEb3RTdGF0ZSA9PT0gMSAmJlxyXG4gICAgICAgICAgICAgICAgc3RhcnREb3QgPT09IGVuZCAtIDEgJiZcclxuICAgICAgICAgICAgICAgIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xyXG4gICAgfSxcclxuICAgIGZvcm1hdDogX2Zvcm1hdC5iaW5kKG51bGwsICdcXFxcJyksXHJcbiAgICBwYXJzZShwYXRoKSB7XHJcbiAgICAgICAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcclxuICAgICAgICBjb25zdCByZXQgPSB7IHJvb3Q6ICcnLCBkaXI6ICcnLCBiYXNlOiAnJywgZXh0OiAnJywgbmFtZTogJycgfTtcclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJldDtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbGVuID0gcGF0aC5sZW5ndGg7XHJcbiAgICAgICAgbGV0IHJvb3RFbmQgPSAwO1xyXG4gICAgICAgIGxldCBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xyXG4gICAgICAgIGlmIChsZW4gPT09IDEpIHtcclxuICAgICAgICAgICAgaWYgKGlzUGF0aFNlcGFyYXRvcihjb2RlKSkge1xyXG4gICAgICAgICAgICAgICAgLy8gYHBhdGhgIGNvbnRhaW5zIGp1c3QgYSBwYXRoIHNlcGFyYXRvciwgZXhpdCBlYXJseSB0byBhdm9pZFxyXG4gICAgICAgICAgICAgICAgLy8gdW5uZWNlc3Nhcnkgd29ya1xyXG4gICAgICAgICAgICAgICAgcmV0LnJvb3QgPSByZXQuZGlyID0gcGF0aDtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGg7XHJcbiAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIFRyeSB0byBtYXRjaCBhIHJvb3RcclxuICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKGNvZGUpKSB7XHJcbiAgICAgICAgICAgIC8vIFBvc3NpYmxlIFVOQyByb290XHJcbiAgICAgICAgICAgIHJvb3RFbmQgPSAxO1xyXG4gICAgICAgICAgICBpZiAoaXNQYXRoU2VwYXJhdG9yKHBhdGguY2hhckNvZGVBdCgxKSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIE1hdGNoZWQgZG91YmxlIHBhdGggc2VwYXJhdG9yIGF0IGJlZ2lubmluZ1xyXG4gICAgICAgICAgICAgICAgbGV0IGogPSAyO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxhc3QgPSBqO1xyXG4gICAgICAgICAgICAgICAgLy8gTWF0Y2ggMSBvciBtb3JlIG5vbi1wYXRoIHNlcGFyYXRvcnNcclxuICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgbGVuICYmICFpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KGopKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGorKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChqIDwgbGVuICYmIGogIT09IGxhc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBNYXRjaGVkIVxyXG4gICAgICAgICAgICAgICAgICAgIGxhc3QgPSBqO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoIDEgb3IgbW9yZSBwYXRoIHNlcGFyYXRvcnNcclxuICAgICAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IGxlbiAmJiBpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KGopKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBqKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChqIDwgbGVuICYmIGogIT09IGxhc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTWF0Y2hlZCFcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdCA9IGo7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE1hdGNoIDEgb3IgbW9yZSBub24tcGF0aCBzZXBhcmF0b3JzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChqIDwgbGVuICYmICFpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KGopKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaisrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqID09PSBsZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgYSBVTkMgcm9vdCBvbmx5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb290RW5kID0gajtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChqICE9PSBsYXN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBtYXRjaGVkIGEgVU5DIHJvb3Qgd2l0aCBsZWZ0b3ZlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb3RFbmQgPSBqICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChpc1dpbmRvd3NEZXZpY2VSb290KGNvZGUpICYmIHBhdGguY2hhckNvZGVBdCgxKSA9PT0gQ0hBUl9DT0xPTikge1xyXG4gICAgICAgICAgICAvLyBQb3NzaWJsZSBkZXZpY2Ugcm9vdFxyXG4gICAgICAgICAgICBpZiAobGVuIDw9IDIpIHtcclxuICAgICAgICAgICAgICAgIC8vIGBwYXRoYCBjb250YWlucyBqdXN0IGEgZHJpdmUgcm9vdCwgZXhpdCBlYXJseSB0byBhdm9pZFxyXG4gICAgICAgICAgICAgICAgLy8gdW5uZWNlc3Nhcnkgd29ya1xyXG4gICAgICAgICAgICAgICAgcmV0LnJvb3QgPSByZXQuZGlyID0gcGF0aDtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcm9vdEVuZCA9IDI7XHJcbiAgICAgICAgICAgIGlmIChpc1BhdGhTZXBhcmF0b3IocGF0aC5jaGFyQ29kZUF0KDIpKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGxlbiA9PT0gMykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGBwYXRoYCBjb250YWlucyBqdXN0IGEgZHJpdmUgcm9vdCwgZXhpdCBlYXJseSB0byBhdm9pZFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHVubmVjZXNzYXJ5IHdvcmtcclxuICAgICAgICAgICAgICAgICAgICByZXQucm9vdCA9IHJldC5kaXIgPSBwYXRoO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByb290RW5kID0gMztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocm9vdEVuZCA+IDApIHtcclxuICAgICAgICAgICAgcmV0LnJvb3QgPSBwYXRoLnNsaWNlKDAsIHJvb3RFbmQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc3RhcnREb3QgPSAtMTtcclxuICAgICAgICBsZXQgc3RhcnRQYXJ0ID0gcm9vdEVuZDtcclxuICAgICAgICBsZXQgZW5kID0gLTE7XHJcbiAgICAgICAgbGV0IG1hdGNoZWRTbGFzaCA9IHRydWU7XHJcbiAgICAgICAgbGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgLy8gVHJhY2sgdGhlIHN0YXRlIG9mIGNoYXJhY3RlcnMgKGlmIGFueSkgd2Ugc2VlIGJlZm9yZSBvdXIgZmlyc3QgZG90IGFuZFxyXG4gICAgICAgIC8vIGFmdGVyIGFueSBwYXRoIHNlcGFyYXRvciB3ZSBmaW5kXHJcbiAgICAgICAgbGV0IHByZURvdFN0YXRlID0gMDtcclxuICAgICAgICAvLyBHZXQgbm9uLWRpciBpbmZvXHJcbiAgICAgICAgZm9yICg7IGkgPj0gcm9vdEVuZDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgIGlmIChpc1BhdGhTZXBhcmF0b3IoY29kZSkpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxyXG4gICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGVuZCA9IGkgKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSBDSEFSX0RPVCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREb3QgPSBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxyXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIHByZURvdFN0YXRlID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVuZCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSB8fFxyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IGEgbm9uLWRvdCBjaGFyYWN0ZXIgaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBkb3RcclxuICAgICAgICAgICAgICAgIHByZURvdFN0YXRlID09PSAwIHx8XHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgKHJpZ2h0LW1vc3QpIHRyaW1tZWQgcGF0aCBjb21wb25lbnQgaXMgZXhhY3RseSAnLi4nXHJcbiAgICAgICAgICAgICAgICAocHJlRG90U3RhdGUgPT09IDEgJiZcclxuICAgICAgICAgICAgICAgICAgICBzdGFydERvdCA9PT0gZW5kIC0gMSAmJlxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0RG90ID09PSBzdGFydFBhcnQgKyAxKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0LmJhc2UgPSByZXQubmFtZSA9IHBhdGguc2xpY2Uoc3RhcnRQYXJ0LCBlbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgc3RhcnREb3QpO1xyXG4gICAgICAgICAgICAgICAgcmV0LmJhc2UgPSBwYXRoLnNsaWNlKHN0YXJ0UGFydCwgZW5kKTtcclxuICAgICAgICAgICAgICAgIHJldC5leHQgPSBwYXRoLnNsaWNlKHN0YXJ0RG90LCBlbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIElmIHRoZSBkaXJlY3RvcnkgaXMgdGhlIHJvb3QsIHVzZSB0aGUgZW50aXJlIHJvb3QgYXMgdGhlIGBkaXJgIGluY2x1ZGluZ1xyXG4gICAgICAgIC8vIHRoZSB0cmFpbGluZyBzbGFzaCBpZiBhbnkgKGBDOlxcYWJjYCAtPiBgQzpcXGApLiBPdGhlcndpc2UsIHN0cmlwIG91dCB0aGVcclxuICAgICAgICAvLyB0cmFpbGluZyBzbGFzaCAoYEM6XFxhYmNcXGRlZmAgLT4gYEM6XFxhYmNgKS5cclxuICAgICAgICBpZiAoc3RhcnRQYXJ0ID4gMCAmJiBzdGFydFBhcnQgIT09IHJvb3RFbmQpIHtcclxuICAgICAgICAgICAgcmV0LmRpciA9IHBhdGguc2xpY2UoMCwgc3RhcnRQYXJ0IC0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXQuZGlyID0gcmV0LnJvb3Q7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9LFxyXG4gICAgc2VwOiAnXFxcXCcsXHJcbiAgICBkZWxpbWl0ZXI6ICc7JyxcclxuICAgIHdpbjMyOiBudWxsLFxyXG4gICAgcG9zaXg6IG51bGxcclxufTtcclxuZXhwb3J0IGNvbnN0IHBvc2l4ID0ge1xyXG4gICAgLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxyXG4gICAgcmVzb2x2ZSguLi5wYXRoU2VnbWVudHMpIHtcclxuICAgICAgICBsZXQgcmVzb2x2ZWRQYXRoID0gJyc7XHJcbiAgICAgICAgbGV0IHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gcGF0aFNlZ21lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xyXG4gICAgICAgICAgICBjb25zdCBwYXRoID0gaSA+PSAwID8gcGF0aFNlZ21lbnRzW2ldIDogcHJvY2Vzcy5jd2QoKTtcclxuICAgICAgICAgICAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcclxuICAgICAgICAgICAgLy8gU2tpcCBlbXB0eSBlbnRyaWVzXHJcbiAgICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzb2x2ZWRQYXRoID0gYCR7cGF0aH0vJHtyZXNvbHZlZFBhdGh9YDtcclxuICAgICAgICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50IHRoZSBwYXRoIHNob3VsZCBiZSByZXNvbHZlZCB0byBhIGZ1bGwgYWJzb2x1dGUgcGF0aCwgYnV0XHJcbiAgICAgICAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXHJcbiAgICAgICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXHJcbiAgICAgICAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplU3RyaW5nKHJlc29sdmVkUGF0aCwgIXJlc29sdmVkQWJzb2x1dGUsICcvJywgaXNQb3NpeFBhdGhTZXBhcmF0b3IpO1xyXG4gICAgICAgIGlmIChyZXNvbHZlZEFic29sdXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgLyR7cmVzb2x2ZWRQYXRofWA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNvbHZlZFBhdGgubGVuZ3RoID4gMCA/IHJlc29sdmVkUGF0aCA6ICcuJztcclxuICAgIH0sXHJcbiAgICBub3JtYWxpemUocGF0aCkge1xyXG4gICAgICAgIHZhbGlkYXRlU3RyaW5nKHBhdGgsICdwYXRoJyk7XHJcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnLic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGlzQWJzb2x1dGUgPSBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IENIQVJfRk9SV0FSRF9TTEFTSDtcclxuICAgICAgICBjb25zdCB0cmFpbGluZ1NlcGFyYXRvciA9IHBhdGguY2hhckNvZGVBdChwYXRoLmxlbmd0aCAtIDEpID09PSBDSEFSX0ZPUldBUkRfU0xBU0g7XHJcbiAgICAgICAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXHJcbiAgICAgICAgcGF0aCA9IG5vcm1hbGl6ZVN0cmluZyhwYXRoLCAhaXNBYnNvbHV0ZSwgJy8nLCBpc1Bvc2l4UGF0aFNlcGFyYXRvcik7XHJcbiAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChpc0Fic29sdXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJy8nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cmFpbGluZ1NlcGFyYXRvciA/ICcuLycgOiAnLic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0cmFpbGluZ1NlcGFyYXRvcikge1xyXG4gICAgICAgICAgICBwYXRoICs9ICcvJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlzQWJzb2x1dGUgPyBgLyR7cGF0aH1gIDogcGF0aDtcclxuICAgIH0sXHJcbiAgICBpc0Fic29sdXRlKHBhdGgpIHtcclxuICAgICAgICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xyXG4gICAgICAgIHJldHVybiBwYXRoLmxlbmd0aCA+IDAgJiYgcGF0aC5jaGFyQ29kZUF0KDApID09PSBDSEFSX0ZPUldBUkRfU0xBU0g7XHJcbiAgICB9LFxyXG4gICAgam9pbiguLi5wYXRocykge1xyXG4gICAgICAgIGlmIChwYXRocy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcuJztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGpvaW5lZDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGhzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZyA9IHBhdGhzW2ldO1xyXG4gICAgICAgICAgICB2YWxpZGF0ZVN0cmluZyhhcmcsICdwYXRoJyk7XHJcbiAgICAgICAgICAgIGlmIChhcmcubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGpvaW5lZCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgam9pbmVkID0gYXJnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgam9pbmVkICs9IGAvJHthcmd9YDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoam9pbmVkID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcuJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBvc2l4Lm5vcm1hbGl6ZShqb2luZWQpO1xyXG4gICAgfSxcclxuICAgIHJlbGF0aXZlKGZyb20sIHRvKSB7XHJcbiAgICAgICAgdmFsaWRhdGVTdHJpbmcoZnJvbSwgJ2Zyb20nKTtcclxuICAgICAgICB2YWxpZGF0ZVN0cmluZyh0bywgJ3RvJyk7XHJcbiAgICAgICAgaWYgKGZyb20gPT09IHRvKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVHJpbSBsZWFkaW5nIGZvcndhcmQgc2xhc2hlcy5cclxuICAgICAgICBmcm9tID0gcG9zaXgucmVzb2x2ZShmcm9tKTtcclxuICAgICAgICB0byA9IHBvc2l4LnJlc29sdmUodG8pO1xyXG4gICAgICAgIGlmIChmcm9tID09PSB0bykge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZyb21TdGFydCA9IDE7XHJcbiAgICAgICAgY29uc3QgZnJvbUVuZCA9IGZyb20ubGVuZ3RoO1xyXG4gICAgICAgIGNvbnN0IGZyb21MZW4gPSBmcm9tRW5kIC0gZnJvbVN0YXJ0O1xyXG4gICAgICAgIGNvbnN0IHRvU3RhcnQgPSAxO1xyXG4gICAgICAgIGNvbnN0IHRvTGVuID0gdG8ubGVuZ3RoIC0gdG9TdGFydDtcclxuICAgICAgICAvLyBDb21wYXJlIHBhdGhzIHRvIGZpbmQgdGhlIGxvbmdlc3QgY29tbW9uIHBhdGggZnJvbSByb290XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gKGZyb21MZW4gPCB0b0xlbiA/IGZyb21MZW4gOiB0b0xlbik7XHJcbiAgICAgICAgbGV0IGxhc3RDb21tb25TZXAgPSAtMTtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBmcm9tQ29kZSA9IGZyb20uY2hhckNvZGVBdChmcm9tU3RhcnQgKyBpKTtcclxuICAgICAgICAgICAgaWYgKGZyb21Db2RlICE9PSB0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZnJvbUNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGkgPT09IGxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAodG9MZW4gPiBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0by5jaGFyQ29kZUF0KHRvU3RhcnQgKyBpKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSBleGFjdCBiYXNlIHBhdGggZm9yIGB0b2AuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy9mb28vYmFyJzsgdG89Jy9mb28vYmFyL2JheidcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkgKyAxKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYGZyb21gIGlzIHRoZSByb290XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRm9yIGV4YW1wbGU6IGZyb209Jy8nOyB0bz0nL2ZvbydcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdG8uc2xpY2UodG9TdGFydCArIGkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGZyb21MZW4gPiBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmcm9tLmNoYXJDb2RlQXQoZnJvbVN0YXJ0ICsgaSkgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIGdldCBoZXJlIGlmIGB0b2AgaXMgdGhlIGV4YWN0IGJhc2UgcGF0aCBmb3IgYGZyb21gLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEZvciBleGFtcGxlOiBmcm9tPScvZm9vL2Jhci9iYXonOyB0bz0nL2Zvby9iYXInXHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdENvbW1vblNlcCA9IGk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UgZ2V0IGhlcmUgaWYgYHRvYCBpcyB0aGUgcm9vdC5cclxuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgZXhhbXBsZTogZnJvbT0nL2Zvby9iYXInOyB0bz0nLydcclxuICAgICAgICAgICAgICAgICAgICBsYXN0Q29tbW9uU2VwID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgb3V0ID0gJyc7XHJcbiAgICAgICAgLy8gR2VuZXJhdGUgdGhlIHJlbGF0aXZlIHBhdGggYmFzZWQgb24gdGhlIHBhdGggZGlmZmVyZW5jZSBiZXR3ZWVuIGB0b2BcclxuICAgICAgICAvLyBhbmQgYGZyb21gLlxyXG4gICAgICAgIGZvciAoaSA9IGZyb21TdGFydCArIGxhc3RDb21tb25TZXAgKyAxOyBpIDw9IGZyb21FbmQ7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAoaSA9PT0gZnJvbUVuZCB8fCBmcm9tLmNoYXJDb2RlQXQoaSkgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAgICAgb3V0ICs9IG91dC5sZW5ndGggPT09IDAgPyAnLi4nIDogJy8uLic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTGFzdGx5LCBhcHBlbmQgdGhlIHJlc3Qgb2YgdGhlIGRlc3RpbmF0aW9uIChgdG9gKSBwYXRoIHRoYXQgY29tZXMgYWZ0ZXJcclxuICAgICAgICAvLyB0aGUgY29tbW9uIHBhdGggcGFydHMuXHJcbiAgICAgICAgcmV0dXJuIGAke291dH0ke3RvLnNsaWNlKHRvU3RhcnQgKyBsYXN0Q29tbW9uU2VwKX1gO1xyXG4gICAgfSxcclxuICAgIHRvTmFtZXNwYWNlZFBhdGgocGF0aCkge1xyXG4gICAgICAgIC8vIE5vbi1vcCBvbiBwb3NpeCBzeXN0ZW1zXHJcbiAgICAgICAgcmV0dXJuIHBhdGg7XHJcbiAgICB9LFxyXG4gICAgZGlybmFtZShwYXRoKSB7XHJcbiAgICAgICAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuICcuJztcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgaGFzUm9vdCA9IHBhdGguY2hhckNvZGVBdCgwKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIO1xyXG4gICAgICAgIGxldCBlbmQgPSAtMTtcclxuICAgICAgICBsZXQgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKGxldCBpID0gcGF0aC5sZW5ndGggLSAxOyBpID49IDE7IC0taSkge1xyXG4gICAgICAgICAgICBpZiAocGF0aC5jaGFyQ29kZUF0KGkpID09PSBDSEFSX0ZPUldBUkRfU0xBU0gpIHtcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gaTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaGFzUm9vdCA/ICcvJyA6ICcuJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGhhc1Jvb3QgJiYgZW5kID09PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnLy8nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF0aC5zbGljZSgwLCBlbmQpO1xyXG4gICAgfSxcclxuICAgIGJhc2VuYW1lKHBhdGgsIGV4dCkge1xyXG4gICAgICAgIGlmIChleHQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YWxpZGF0ZVN0cmluZyhleHQsICdleHQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsaWRhdGVTdHJpbmcocGF0aCwgJ3BhdGgnKTtcclxuICAgICAgICBsZXQgc3RhcnQgPSAwO1xyXG4gICAgICAgIGxldCBlbmQgPSAtMTtcclxuICAgICAgICBsZXQgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICBsZXQgaTtcclxuICAgICAgICBpZiAoZXh0ICE9PSB1bmRlZmluZWQgJiYgZXh0Lmxlbmd0aCA+IDAgJiYgZXh0Lmxlbmd0aCA8PSBwYXRoLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpZiAoZXh0ID09PSBwYXRoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IGV4dElkeCA9IGV4dC5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBsZXQgZmlyc3ROb25TbGFzaEVuZCA9IC0xO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0gcGF0aC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvZGUgPT09IENIQVJfRk9SV0FSRF9TTEFTSCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaGVkU2xhc2gpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0Tm9uU2xhc2hFbmQgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIHNhdyB0aGUgZmlyc3Qgbm9uLXBhdGggc2VwYXJhdG9yLCByZW1lbWJlciB0aGlzIGluZGV4IGluIGNhc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UgbmVlZCBpdCBpZiB0aGUgZXh0ZW5zaW9uIGVuZHMgdXAgbm90IG1hdGNoaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdE5vblNsYXNoRW5kID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChleHRJZHggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUcnkgdG8gbWF0Y2ggdGhlIGV4cGxpY2l0IGV4dGVuc2lvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29kZSA9PT0gZXh0LmNoYXJDb2RlQXQoZXh0SWR4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC0tZXh0SWR4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIG1hdGNoZWQgdGhlIGV4dGVuc2lvbiwgc28gbWFyayB0aGlzIGFzIHRoZSBlbmQgb2Ygb3VyIHBhdGhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0ZW5zaW9uIGRvZXMgbm90IG1hdGNoLCBzbyBvdXIgcmVzdWx0IGlzIHRoZSBlbnRpcmUgcGF0aFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tcG9uZW50XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHRJZHggPSAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHN0YXJ0ID09PSBlbmQpIHtcclxuICAgICAgICAgICAgICAgIGVuZCA9IGZpcnN0Tm9uU2xhc2hFbmQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgZW5kID0gcGF0aC5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcclxuICAgICAgICAgICAgaWYgKHBhdGguY2hhckNvZGVBdChpKSA9PT0gQ0hBUl9GT1JXQVJEX1NMQVNIKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgcGF0aCBzZXBhcmF0b3IgdGhhdCB3YXMgbm90IHBhcnQgb2YgYSBzZXQgb2YgcGF0aFxyXG4gICAgICAgICAgICAgICAgLy8gc2VwYXJhdG9ycyBhdCB0aGUgZW5kIG9mIHRoZSBzdHJpbmcsIHN0b3Agbm93XHJcbiAgICAgICAgICAgICAgICBpZiAoIW1hdGNoZWRTbGFzaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxyXG4gICAgICAgICAgICAgICAgLy8gcGF0aCBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgIG1hdGNoZWRTbGFzaCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgZW5kID0gaSArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcGF0aC5zbGljZShzdGFydCwgZW5kKTtcclxuICAgIH0sXHJcbiAgICBleHRuYW1lKHBhdGgpIHtcclxuICAgICAgICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xyXG4gICAgICAgIGxldCBzdGFydERvdCA9IC0xO1xyXG4gICAgICAgIGxldCBzdGFydFBhcnQgPSAwO1xyXG4gICAgICAgIGxldCBlbmQgPSAtMTtcclxuICAgICAgICBsZXQgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXHJcbiAgICAgICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcclxuICAgICAgICBsZXQgcHJlRG90U3RhdGUgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBwYXRoLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSBDSEFSX0ZPUldBUkRfU0xBU0gpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxyXG4gICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGVuZCA9IGkgKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSBDSEFSX0RPVCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREb3QgPSBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxyXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIHByZURvdFN0YXRlID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHN0YXJ0RG90ID09PSAtMSB8fFxyXG4gICAgICAgICAgICBlbmQgPT09IC0xIHx8XHJcbiAgICAgICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XHJcbiAgICAgICAgICAgIHByZURvdFN0YXRlID09PSAwIHx8XHJcbiAgICAgICAgICAgIC8vIFRoZSAocmlnaHQtbW9zdCkgdHJpbW1lZCBwYXRoIGNvbXBvbmVudCBpcyBleGFjdGx5ICcuLidcclxuICAgICAgICAgICAgKHByZURvdFN0YXRlID09PSAxICYmXHJcbiAgICAgICAgICAgICAgICBzdGFydERvdCA9PT0gZW5kIC0gMSAmJlxyXG4gICAgICAgICAgICAgICAgc3RhcnREb3QgPT09IHN0YXJ0UGFydCArIDEpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnREb3QsIGVuZCk7XHJcbiAgICB9LFxyXG4gICAgZm9ybWF0OiBfZm9ybWF0LmJpbmQobnVsbCwgJy8nKSxcclxuICAgIHBhcnNlKHBhdGgpIHtcclxuICAgICAgICB2YWxpZGF0ZVN0cmluZyhwYXRoLCAncGF0aCcpO1xyXG4gICAgICAgIGNvbnN0IHJldCA9IHsgcm9vdDogJycsIGRpcjogJycsIGJhc2U6ICcnLCBleHQ6ICcnLCBuYW1lOiAnJyB9O1xyXG4gICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBpc0Fic29sdXRlID0gcGF0aC5jaGFyQ29kZUF0KDApID09PSBDSEFSX0ZPUldBUkRfU0xBU0g7XHJcbiAgICAgICAgbGV0IHN0YXJ0O1xyXG4gICAgICAgIGlmIChpc0Fic29sdXRlKSB7XHJcbiAgICAgICAgICAgIHJldC5yb290ID0gJy8nO1xyXG4gICAgICAgICAgICBzdGFydCA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzdGFydCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBzdGFydERvdCA9IC0xO1xyXG4gICAgICAgIGxldCBzdGFydFBhcnQgPSAwO1xyXG4gICAgICAgIGxldCBlbmQgPSAtMTtcclxuICAgICAgICBsZXQgbWF0Y2hlZFNsYXNoID0gdHJ1ZTtcclxuICAgICAgICBsZXQgaSA9IHBhdGgubGVuZ3RoIC0gMTtcclxuICAgICAgICAvLyBUcmFjayB0aGUgc3RhdGUgb2YgY2hhcmFjdGVycyAoaWYgYW55KSB3ZSBzZWUgYmVmb3JlIG91ciBmaXJzdCBkb3QgYW5kXHJcbiAgICAgICAgLy8gYWZ0ZXIgYW55IHBhdGggc2VwYXJhdG9yIHdlIGZpbmRcclxuICAgICAgICBsZXQgcHJlRG90U3RhdGUgPSAwO1xyXG4gICAgICAgIC8vIEdldCBub24tZGlyIGluZm9cclxuICAgICAgICBmb3IgKDsgaSA+PSBzdGFydDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSBDSEFSX0ZPUldBUkRfU0xBU0gpIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBwYXRoIHNlcGFyYXRvciB0aGF0IHdhcyBub3QgcGFydCBvZiBhIHNldCBvZiBwYXRoXHJcbiAgICAgICAgICAgICAgICAvLyBzZXBhcmF0b3JzIGF0IHRoZSBlbmQgb2YgdGhlIHN0cmluZywgc3RvcCBub3dcclxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hlZFNsYXNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRQYXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZW5kID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2Ugc2F3IHRoZSBmaXJzdCBub24tcGF0aCBzZXBhcmF0b3IsIG1hcmsgdGhpcyBhcyB0aGUgZW5kIG9mIG91clxyXG4gICAgICAgICAgICAgICAgLy8gZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBtYXRjaGVkU2xhc2ggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGVuZCA9IGkgKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjb2RlID09PSBDSEFSX0RPVCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBvdXIgZmlyc3QgZG90LCBtYXJrIGl0IGFzIHRoZSBzdGFydCBvZiBvdXIgZXh0ZW5zaW9uXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnREb3QgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREb3QgPSBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocHJlRG90U3RhdGUgIT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmVEb3RTdGF0ZSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhcnREb3QgIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBzYXcgYSBub24tZG90IGFuZCBub24tcGF0aCBzZXBhcmF0b3IgYmVmb3JlIG91ciBkb3QsIHNvIHdlIHNob3VsZFxyXG4gICAgICAgICAgICAgICAgLy8gaGF2ZSBhIGdvb2QgY2hhbmNlIGF0IGhhdmluZyBhIG5vbi1lbXB0eSBleHRlbnNpb25cclxuICAgICAgICAgICAgICAgIHByZURvdFN0YXRlID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVuZCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBzdGFydFBhcnQgPT09IDAgJiYgaXNBYnNvbHV0ZSA/IDEgOiBzdGFydFBhcnQ7XHJcbiAgICAgICAgICAgIGlmIChzdGFydERvdCA9PT0gLTEgfHxcclxuICAgICAgICAgICAgICAgIC8vIFdlIHNhdyBhIG5vbi1kb3QgY2hhcmFjdGVyIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgZG90XHJcbiAgICAgICAgICAgICAgICBwcmVEb3RTdGF0ZSA9PT0gMCB8fFxyXG4gICAgICAgICAgICAgICAgLy8gVGhlIChyaWdodC1tb3N0KSB0cmltbWVkIHBhdGggY29tcG9uZW50IGlzIGV4YWN0bHkgJy4uJ1xyXG4gICAgICAgICAgICAgICAgKHByZURvdFN0YXRlID09PSAxICYmXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnREb3QgPT09IGVuZCAtIDEgJiZcclxuICAgICAgICAgICAgICAgICAgICBzdGFydERvdCA9PT0gc3RhcnRQYXJ0ICsgMSkpIHtcclxuICAgICAgICAgICAgICAgIHJldC5iYXNlID0gcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0LCBlbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0Lm5hbWUgPSBwYXRoLnNsaWNlKHN0YXJ0LCBzdGFydERvdCk7XHJcbiAgICAgICAgICAgICAgICByZXQuYmFzZSA9IHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XHJcbiAgICAgICAgICAgICAgICByZXQuZXh0ID0gcGF0aC5zbGljZShzdGFydERvdCwgZW5kKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3RhcnRQYXJ0ID4gMCkge1xyXG4gICAgICAgICAgICByZXQuZGlyID0gcGF0aC5zbGljZSgwLCBzdGFydFBhcnQgLSAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoaXNBYnNvbHV0ZSkge1xyXG4gICAgICAgICAgICByZXQuZGlyID0gJy8nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfSxcclxuICAgIHNlcDogJy8nLFxyXG4gICAgZGVsaW1pdGVyOiAnOicsXHJcbiAgICB3aW4zMjogbnVsbCxcclxuICAgIHBvc2l4OiBudWxsXHJcbn07XHJcbnBvc2l4LndpbjMyID0gd2luMzIud2luMzIgPSB3aW4zMjtcclxucG9zaXgucG9zaXggPSB3aW4zMi5wb3NpeCA9IHBvc2l4O1xyXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplID0gKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyB3aW4zMi5ub3JtYWxpemUgOiBwb3NpeC5ub3JtYWxpemUpO1xyXG5leHBvcnQgY29uc3QgcmVzb2x2ZSA9IChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gd2luMzIucmVzb2x2ZSA6IHBvc2l4LnJlc29sdmUpO1xyXG5leHBvcnQgY29uc3QgcmVsYXRpdmUgPSAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/IHdpbjMyLnJlbGF0aXZlIDogcG9zaXgucmVsYXRpdmUpO1xyXG5leHBvcnQgY29uc3QgZGlybmFtZSA9IChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gd2luMzIuZGlybmFtZSA6IHBvc2l4LmRpcm5hbWUpO1xyXG5leHBvcnQgY29uc3QgYmFzZW5hbWUgPSAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/IHdpbjMyLmJhc2VuYW1lIDogcG9zaXguYmFzZW5hbWUpO1xyXG5leHBvcnQgY29uc3QgZXh0bmFtZSA9IChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInID8gd2luMzIuZXh0bmFtZSA6IHBvc2l4LmV4dG5hbWUpO1xyXG5leHBvcnQgY29uc3Qgc2VwID0gKHByb2Nlc3MucGxhdGZvcm0gPT09ICd3aW4zMicgPyB3aW4zMi5zZXAgOiBwb3NpeC5zZXApO1xyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCB7IGlzV2luZG93cyB9IGZyb20gJy4vcGxhdGZvcm0uanMnO1xyXG5pbXBvcnQgKiBhcyBwYXRocyBmcm9tICcuL3BhdGguanMnO1xyXG5jb25zdCBfc2NoZW1lUGF0dGVybiA9IC9eXFx3W1xcd1xcZCsuLV0qJC87XHJcbmNvbnN0IF9zaW5nbGVTbGFzaFN0YXJ0ID0gL15cXC8vO1xyXG5jb25zdCBfZG91YmxlU2xhc2hTdGFydCA9IC9eXFwvXFwvLztcclxuZnVuY3Rpb24gX3ZhbGlkYXRlVXJpKHJldCwgX3N0cmljdCkge1xyXG4gICAgLy8gc2NoZW1lLCBtdXN0IGJlIHNldFxyXG4gICAgaWYgKCFyZXQuc2NoZW1lICYmIF9zdHJpY3QpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFtVcmlFcnJvcl06IFNjaGVtZSBpcyBtaXNzaW5nOiB7c2NoZW1lOiBcIlwiLCBhdXRob3JpdHk6IFwiJHtyZXQuYXV0aG9yaXR5fVwiLCBwYXRoOiBcIiR7cmV0LnBhdGh9XCIsIHF1ZXJ5OiBcIiR7cmV0LnF1ZXJ5fVwiLCBmcmFnbWVudDogXCIke3JldC5mcmFnbWVudH1cIn1gKTtcclxuICAgIH1cclxuICAgIC8vIHNjaGVtZSwgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi0zLjFcclxuICAgIC8vIEFMUEhBICooIEFMUEhBIC8gRElHSVQgLyBcIitcIiAvIFwiLVwiIC8gXCIuXCIgKVxyXG4gICAgaWYgKHJldC5zY2hlbWUgJiYgIV9zY2hlbWVQYXR0ZXJuLnRlc3QocmV0LnNjaGVtZSkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tVcmlFcnJvcl06IFNjaGVtZSBjb250YWlucyBpbGxlZ2FsIGNoYXJhY3RlcnMuJyk7XHJcbiAgICB9XHJcbiAgICAvLyBwYXRoLCBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I3NlY3Rpb24tMy4zXHJcbiAgICAvLyBJZiBhIFVSSSBjb250YWlucyBhbiBhdXRob3JpdHkgY29tcG9uZW50LCB0aGVuIHRoZSBwYXRoIGNvbXBvbmVudFxyXG4gICAgLy8gbXVzdCBlaXRoZXIgYmUgZW1wdHkgb3IgYmVnaW4gd2l0aCBhIHNsYXNoIChcIi9cIikgY2hhcmFjdGVyLiAgSWYgYSBVUklcclxuICAgIC8vIGRvZXMgbm90IGNvbnRhaW4gYW4gYXV0aG9yaXR5IGNvbXBvbmVudCwgdGhlbiB0aGUgcGF0aCBjYW5ub3QgYmVnaW5cclxuICAgIC8vIHdpdGggdHdvIHNsYXNoIGNoYXJhY3RlcnMgKFwiLy9cIikuXHJcbiAgICBpZiAocmV0LnBhdGgpIHtcclxuICAgICAgICBpZiAocmV0LmF1dGhvcml0eSkge1xyXG4gICAgICAgICAgICBpZiAoIV9zaW5nbGVTbGFzaFN0YXJ0LnRlc3QocmV0LnBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1tVcmlFcnJvcl06IElmIGEgVVJJIGNvbnRhaW5zIGFuIGF1dGhvcml0eSBjb21wb25lbnQsIHRoZW4gdGhlIHBhdGggY29tcG9uZW50IG11c3QgZWl0aGVyIGJlIGVtcHR5IG9yIGJlZ2luIHdpdGggYSBzbGFzaCAoXCIvXCIpIGNoYXJhY3RlcicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoX2RvdWJsZVNsYXNoU3RhcnQudGVzdChyZXQucGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignW1VyaUVycm9yXTogSWYgYSBVUkkgZG9lcyBub3QgY29udGFpbiBhbiBhdXRob3JpdHkgY29tcG9uZW50LCB0aGVuIHRoZSBwYXRoIGNhbm5vdCBiZWdpbiB3aXRoIHR3byBzbGFzaCBjaGFyYWN0ZXJzIChcIi8vXCIpJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8gZm9yIGEgd2hpbGUgd2UgYWxsb3dlZCB1cmlzICp3aXRob3V0KiBzY2hlbWVzIGFuZCB0aGlzIGlzIHRoZSBtaWdyYXRpb25cclxuLy8gZm9yIHRoZW0sIGUuZy4gYW4gdXJpIHdpdGhvdXQgc2NoZW1lIGFuZCB3aXRob3V0IHN0cmljdC1tb2RlIHdhcm5zIGFuZCBmYWxsc1xyXG4vLyBiYWNrIHRvIHRoZSBmaWxlLXNjaGVtZS4gdGhhdCBzaG91bGQgY2F1c2UgdGhlIGxlYXN0IGNhcm5hZ2UgYW5kIHN0aWxsIGJlIGFcclxuLy8gY2xlYXIgd2FybmluZ1xyXG5mdW5jdGlvbiBfc2NoZW1lRml4KHNjaGVtZSwgX3N0cmljdCkge1xyXG4gICAgaWYgKCFzY2hlbWUgJiYgIV9zdHJpY3QpIHtcclxuICAgICAgICByZXR1cm4gJ2ZpbGUnO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHNjaGVtZTtcclxufVxyXG4vLyBpbXBsZW1lbnRzIGEgYml0IG9mIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I3NlY3Rpb24tNVxyXG5mdW5jdGlvbiBfcmVmZXJlbmNlUmVzb2x1dGlvbihzY2hlbWUsIHBhdGgpIHtcclxuICAgIC8vIHRoZSBzbGFzaC1jaGFyYWN0ZXIgaXMgb3VyICdkZWZhdWx0IGJhc2UnIGFzIHdlIGRvbid0XHJcbiAgICAvLyBzdXBwb3J0IGNvbnN0cnVjdGluZyBVUklzIHJlbGF0aXZlIHRvIG90aGVyIFVSSXMuIFRoaXNcclxuICAgIC8vIGFsc28gbWVhbnMgdGhhdCB3ZSBhbHRlciBhbmQgcG90ZW50aWFsbHkgYnJlYWsgcGF0aHMuXHJcbiAgICAvLyBzZWUgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi01LjEuNFxyXG4gICAgc3dpdGNoIChzY2hlbWUpIHtcclxuICAgICAgICBjYXNlICdodHRwcyc6XHJcbiAgICAgICAgY2FzZSAnaHR0cCc6XHJcbiAgICAgICAgY2FzZSAnZmlsZSc6XHJcbiAgICAgICAgICAgIGlmICghcGF0aCkge1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IF9zbGFzaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChwYXRoWzBdICE9PSBfc2xhc2gpIHtcclxuICAgICAgICAgICAgICAgIHBhdGggPSBfc2xhc2ggKyBwYXRoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBhdGg7XHJcbn1cclxuY29uc3QgX2VtcHR5ID0gJyc7XHJcbmNvbnN0IF9zbGFzaCA9ICcvJztcclxuY29uc3QgX3JlZ2V4cCA9IC9eKChbXjovPyNdKz8pOik/KFxcL1xcLyhbXi8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT8vO1xyXG4vKipcclxuICogVW5pZm9ybSBSZXNvdXJjZSBJZGVudGlmaWVyIChVUkkpIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYuXHJcbiAqIFRoaXMgY2xhc3MgaXMgYSBzaW1wbGUgcGFyc2VyIHdoaWNoIGNyZWF0ZXMgdGhlIGJhc2ljIGNvbXBvbmVudCBwYXJ0c1xyXG4gKiAoaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTMpIHdpdGggbWluaW1hbCB2YWxpZGF0aW9uXHJcbiAqIGFuZCBlbmNvZGluZy5cclxuICpcclxuICogYGBgdHh0XHJcbiAqICAgICAgIGZvbzovL2V4YW1wbGUuY29tOjgwNDIvb3Zlci90aGVyZT9uYW1lPWZlcnJldCNub3NlXHJcbiAqICAgICAgIFxcXy8gICBcXF9fX19fX19fX19fX19fL1xcX19fX19fX19fLyBcXF9fX19fX19fXy8gXFxfXy9cclxuICogICAgICAgIHwgICAgICAgICAgIHwgICAgICAgICAgICB8ICAgICAgICAgICAgfCAgICAgICAgfFxyXG4gKiAgICAgc2NoZW1lICAgICBhdXRob3JpdHkgICAgICAgcGF0aCAgICAgICAgcXVlcnkgICBmcmFnbWVudFxyXG4gKiAgICAgICAgfCAgIF9fX19fX19fX19fX19fX19fX19fX3xfX1xyXG4gKiAgICAgICAvIFxcIC8gICAgICAgICAgICAgICAgICAgICAgICBcXFxyXG4gKiAgICAgICB1cm46ZXhhbXBsZTphbmltYWw6ZmVycmV0Om5vc2VcclxuICogYGBgXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVVJJIHtcclxuICAgIC8qKlxyXG4gICAgICogQGludGVybmFsXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHNjaGVtZU9yRGF0YSwgYXV0aG9yaXR5LCBwYXRoLCBxdWVyeSwgZnJhZ21lbnQsIF9zdHJpY3QgPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2Ygc2NoZW1lT3JEYXRhID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICB0aGlzLnNjaGVtZSA9IHNjaGVtZU9yRGF0YS5zY2hlbWUgfHwgX2VtcHR5O1xyXG4gICAgICAgICAgICB0aGlzLmF1dGhvcml0eSA9IHNjaGVtZU9yRGF0YS5hdXRob3JpdHkgfHwgX2VtcHR5O1xyXG4gICAgICAgICAgICB0aGlzLnBhdGggPSBzY2hlbWVPckRhdGEucGF0aCB8fCBfZW1wdHk7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnkgPSBzY2hlbWVPckRhdGEucXVlcnkgfHwgX2VtcHR5O1xyXG4gICAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gc2NoZW1lT3JEYXRhLmZyYWdtZW50IHx8IF9lbXB0eTtcclxuICAgICAgICAgICAgLy8gbm8gdmFsaWRhdGlvbiBiZWNhdXNlIGl0J3MgdGhpcyBVUklcclxuICAgICAgICAgICAgLy8gdGhhdCBjcmVhdGVzIHVyaSBjb21wb25lbnRzLlxyXG4gICAgICAgICAgICAvLyBfdmFsaWRhdGVVcmkodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNjaGVtZSA9IF9zY2hlbWVGaXgoc2NoZW1lT3JEYXRhLCBfc3RyaWN0KTtcclxuICAgICAgICAgICAgdGhpcy5hdXRob3JpdHkgPSBhdXRob3JpdHkgfHwgX2VtcHR5O1xyXG4gICAgICAgICAgICB0aGlzLnBhdGggPSBfcmVmZXJlbmNlUmVzb2x1dGlvbih0aGlzLnNjaGVtZSwgcGF0aCB8fCBfZW1wdHkpO1xyXG4gICAgICAgICAgICB0aGlzLnF1ZXJ5ID0gcXVlcnkgfHwgX2VtcHR5O1xyXG4gICAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gZnJhZ21lbnQgfHwgX2VtcHR5O1xyXG4gICAgICAgICAgICBfdmFsaWRhdGVVcmkodGhpcywgX3N0cmljdCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc3RhdGljIGlzVXJpKHRoaW5nKSB7XHJcbiAgICAgICAgaWYgKHRoaW5nIGluc3RhbmNlb2YgVVJJKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGluZy5hdXRob3JpdHkgPT09ICdzdHJpbmcnXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiB0aGluZy5mcmFnbWVudCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgJiYgdHlwZW9mIHRoaW5nLnBhdGggPT09ICdzdHJpbmcnXHJcbiAgICAgICAgICAgICYmIHR5cGVvZiB0aGluZy5xdWVyeSA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgJiYgdHlwZW9mIHRoaW5nLnNjaGVtZSA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgJiYgdHlwZW9mIHRoaW5nLmZzUGF0aCA9PT0gJ3N0cmluZydcclxuICAgICAgICAgICAgJiYgdHlwZW9mIHRoaW5nLndpdGggPT09ICdmdW5jdGlvbidcclxuICAgICAgICAgICAgJiYgdHlwZW9mIHRoaW5nLnRvU3RyaW5nID09PSAnZnVuY3Rpb24nO1xyXG4gICAgfVxyXG4gICAgLy8gLS0tLSBmaWxlc3lzdGVtIHBhdGggLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGNvcnJlc3BvbmRpbmcgZmlsZSBzeXN0ZW0gcGF0aCBvZiB0aGlzIFVSSS5cclxuICAgICAqIFdpbGwgaGFuZGxlIFVOQyBwYXRocywgbm9ybWFsaXplcyB3aW5kb3dzIGRyaXZlIGxldHRlcnMgdG8gbG93ZXItY2FzZSwgYW5kIHVzZXMgdGhlXHJcbiAgICAgKiBwbGF0Zm9ybSBzcGVjaWZpYyBwYXRoIHNlcGFyYXRvci5cclxuICAgICAqXHJcbiAgICAgKiAqIFdpbGwgKm5vdCogdmFsaWRhdGUgdGhlIHBhdGggZm9yIGludmFsaWQgY2hhcmFjdGVycyBhbmQgc2VtYW50aWNzLlxyXG4gICAgICogKiBXaWxsICpub3QqIGxvb2sgYXQgdGhlIHNjaGVtZSBvZiB0aGlzIFVSSS5cclxuICAgICAqICogVGhlIHJlc3VsdCBzaGFsbCAqbm90KiBiZSB1c2VkIGZvciBkaXNwbGF5IHB1cnBvc2VzIGJ1dCBmb3IgYWNjZXNzaW5nIGEgZmlsZSBvbiBkaXNrLlxyXG4gICAgICpcclxuICAgICAqXHJcbiAgICAgKiBUaGUgKmRpZmZlcmVuY2UqIHRvIGBVUkkjcGF0aGAgaXMgdGhlIHVzZSBvZiB0aGUgcGxhdGZvcm0gc3BlY2lmaWMgc2VwYXJhdG9yIGFuZCB0aGUgaGFuZGxpbmdcclxuICAgICAqIG9mIFVOQyBwYXRocy4gU2VlIHRoZSBiZWxvdyBzYW1wbGUgb2YgYSBmaWxlLXVyaSB3aXRoIGFuIGF1dGhvcml0eSAoVU5DIHBhdGgpLlxyXG4gICAgICpcclxuICAgICAqIGBgYHRzXHJcbiAgICAgICAgY29uc3QgdSA9IFVSSS5wYXJzZSgnZmlsZTovL3NlcnZlci9jJC9mb2xkZXIvZmlsZS50eHQnKVxyXG4gICAgICAgIHUuYXV0aG9yaXR5ID09PSAnc2VydmVyJ1xyXG4gICAgICAgIHUucGF0aCA9PT0gJy9zaGFyZXMvYyQvZmlsZS50eHQnXHJcbiAgICAgICAgdS5mc1BhdGggPT09ICdcXFxcc2VydmVyXFxjJFxcZm9sZGVyXFxmaWxlLnR4dCdcclxuICAgIGBgYFxyXG4gICAgICpcclxuICAgICAqIFVzaW5nIGBVUkkjcGF0aGAgdG8gcmVhZCBhIGZpbGUgKHVzaW5nIGZzLWFwaXMpIHdvdWxkIG5vdCBiZSBlbm91Z2ggYmVjYXVzZSBwYXJ0cyBvZiB0aGUgcGF0aCxcclxuICAgICAqIG5hbWVseSB0aGUgc2VydmVyIG5hbWUsIHdvdWxkIGJlIG1pc3NpbmcuIFRoZXJlZm9yZSBgVVJJI2ZzUGF0aGAgZXhpc3RzIC0gaXQncyBzdWdhciB0byBlYXNlIHdvcmtpbmdcclxuICAgICAqIHdpdGggVVJJcyB0aGF0IHJlcHJlc2VudCBmaWxlcyBvbiBkaXNrIChgZmlsZWAgc2NoZW1lKS5cclxuICAgICAqL1xyXG4gICAgZ2V0IGZzUGF0aCgpIHtcclxuICAgICAgICAvLyBpZiAodGhpcy5zY2hlbWUgIT09ICdmaWxlJykge1xyXG4gICAgICAgIC8vIFx0Y29uc29sZS53YXJuKGBbVXJpRXJyb3JdIGNhbGxpbmcgZnNQYXRoIHdpdGggc2NoZW1lICR7dGhpcy5zY2hlbWV9YCk7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIHJldHVybiB1cmlUb0ZzUGF0aCh0aGlzLCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICAvLyAtLS0tIG1vZGlmeSB0byBuZXcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgd2l0aChjaGFuZ2UpIHtcclxuICAgICAgICBpZiAoIWNoYW5nZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHsgc2NoZW1lLCBhdXRob3JpdHksIHBhdGgsIHF1ZXJ5LCBmcmFnbWVudCB9ID0gY2hhbmdlO1xyXG4gICAgICAgIGlmIChzY2hlbWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBzY2hlbWUgPSB0aGlzLnNjaGVtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoc2NoZW1lID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHNjaGVtZSA9IF9lbXB0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGF1dGhvcml0eSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGF1dGhvcml0eSA9IHRoaXMuYXV0aG9yaXR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhdXRob3JpdHkgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgYXV0aG9yaXR5ID0gX2VtcHR5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocGF0aCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHBhdGggPSB0aGlzLnBhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHBhdGggPT09IG51bGwpIHtcclxuICAgICAgICAgICAgcGF0aCA9IF9lbXB0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHF1ZXJ5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcXVlcnkgPSB0aGlzLnF1ZXJ5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChxdWVyeSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBxdWVyeSA9IF9lbXB0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGZyYWdtZW50ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgZnJhZ21lbnQgPSB0aGlzLmZyYWdtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChmcmFnbWVudCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBmcmFnbWVudCA9IF9lbXB0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdGhpcy5zY2hlbWVcclxuICAgICAgICAgICAgJiYgYXV0aG9yaXR5ID09PSB0aGlzLmF1dGhvcml0eVxyXG4gICAgICAgICAgICAmJiBwYXRoID09PSB0aGlzLnBhdGhcclxuICAgICAgICAgICAgJiYgcXVlcnkgPT09IHRoaXMucXVlcnlcclxuICAgICAgICAgICAgJiYgZnJhZ21lbnQgPT09IHRoaXMuZnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVXJpKHNjaGVtZSwgYXV0aG9yaXR5LCBwYXRoLCBxdWVyeSwgZnJhZ21lbnQpO1xyXG4gICAgfVxyXG4gICAgLy8gLS0tLSBwYXJzZSAmIHZhbGlkYXRlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFVSSSBmcm9tIGEgc3RyaW5nLCBlLmcuIGBodHRwOi8vd3d3Lm1zZnQuY29tL3NvbWUvcGF0aGAsXHJcbiAgICAgKiBgZmlsZTovLy91c3IvaG9tZWAsIG9yIGBzY2hlbWU6d2l0aC9wYXRoYC5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgQSBzdHJpbmcgd2hpY2ggcmVwcmVzZW50cyBhbiBVUkkgKHNlZSBgVVJJI3RvU3RyaW5nYCkuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBwYXJzZSh2YWx1ZSwgX3N0cmljdCA9IGZhbHNlKSB7XHJcbiAgICAgICAgY29uc3QgbWF0Y2ggPSBfcmVnZXhwLmV4ZWModmFsdWUpO1xyXG4gICAgICAgIGlmICghbWF0Y2gpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVcmkoX2VtcHR5LCBfZW1wdHksIF9lbXB0eSwgX2VtcHR5LCBfZW1wdHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFVyaShtYXRjaFsyXSB8fCBfZW1wdHksIHBlcmNlbnREZWNvZGUobWF0Y2hbNF0gfHwgX2VtcHR5KSwgcGVyY2VudERlY29kZShtYXRjaFs1XSB8fCBfZW1wdHkpLCBwZXJjZW50RGVjb2RlKG1hdGNoWzddIHx8IF9lbXB0eSksIHBlcmNlbnREZWNvZGUobWF0Y2hbOV0gfHwgX2VtcHR5KSwgX3N0cmljdCk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgVVJJIGZyb20gYSBmaWxlIHN5c3RlbSBwYXRoLCBlLmcuIGBjOlxcbXlcXGZpbGVzYCxcclxuICAgICAqIGAvdXNyL2hvbWVgLCBvciBgXFxcXHNlcnZlclxcc2hhcmVcXHNvbWVcXHBhdGhgLlxyXG4gICAgICpcclxuICAgICAqIFRoZSAqZGlmZmVyZW5jZSogYmV0d2VlbiBgVVJJI3BhcnNlYCBhbmQgYFVSSSNmaWxlYCBpcyB0aGF0IHRoZSBsYXR0ZXIgdHJlYXRzIHRoZSBhcmd1bWVudFxyXG4gICAgICogYXMgcGF0aCwgbm90IGFzIHN0cmluZ2lmaWVkLXVyaS4gRS5nLiBgVVJJLmZpbGUocGF0aClgIGlzICoqbm90IHRoZSBzYW1lIGFzKipcclxuICAgICAqIGBVUkkucGFyc2UoJ2ZpbGU6Ly8nICsgcGF0aClgIGJlY2F1c2UgdGhlIHBhdGggbWlnaHQgY29udGFpbiBjaGFyYWN0ZXJzIHRoYXQgYXJlXHJcbiAgICAgKiBpbnRlcnByZXRlZCAoIyBhbmQgPykuIFNlZSB0aGUgZm9sbG93aW5nIHNhbXBsZTpcclxuICAgICAqIGBgYHRzXHJcbiAgICBjb25zdCBnb29kID0gVVJJLmZpbGUoJy9jb2RpbmcvYyMvcHJvamVjdDEnKTtcclxuICAgIGdvb2Quc2NoZW1lID09PSAnZmlsZSc7XHJcbiAgICBnb29kLnBhdGggPT09ICcvY29kaW5nL2MjL3Byb2plY3QxJztcclxuICAgIGdvb2QuZnJhZ21lbnQgPT09ICcnO1xyXG4gICAgY29uc3QgYmFkID0gVVJJLnBhcnNlKCdmaWxlOi8vJyArICcvY29kaW5nL2MjL3Byb2plY3QxJyk7XHJcbiAgICBiYWQuc2NoZW1lID09PSAnZmlsZSc7XHJcbiAgICBiYWQucGF0aCA9PT0gJy9jb2RpbmcvYyc7IC8vIHBhdGggaXMgbm93IGJyb2tlblxyXG4gICAgYmFkLmZyYWdtZW50ID09PSAnL3Byb2plY3QxJztcclxuICAgIGBgYFxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBwYXRoIEEgZmlsZSBzeXN0ZW0gcGF0aCAoc2VlIGBVUkkjZnNQYXRoYClcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGZpbGUocGF0aCkge1xyXG4gICAgICAgIGxldCBhdXRob3JpdHkgPSBfZW1wdHk7XHJcbiAgICAgICAgLy8gbm9ybWFsaXplIHRvIGZ3ZC1zbGFzaGVzIG9uIHdpbmRvd3MsXHJcbiAgICAgICAgLy8gb24gb3RoZXIgc3lzdGVtcyBid2Qtc2xhc2hlcyBhcmUgdmFsaWRcclxuICAgICAgICAvLyBmaWxlbmFtZSBjaGFyYWN0ZXIsIGVnIC9mXFxvby9iYVxcci50eHRcclxuICAgICAgICBpZiAoaXNXaW5kb3dzKSB7XHJcbiAgICAgICAgICAgIHBhdGggPSBwYXRoLnJlcGxhY2UoL1xcXFwvZywgX3NsYXNoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgZm9yIGF1dGhvcml0eSBhcyB1c2VkIGluIFVOQyBzaGFyZXNcclxuICAgICAgICAvLyBvciB1c2UgdGhlIHBhdGggYXMgZ2l2ZW5cclxuICAgICAgICBpZiAocGF0aFswXSA9PT0gX3NsYXNoICYmIHBhdGhbMV0gPT09IF9zbGFzaCkge1xyXG4gICAgICAgICAgICBjb25zdCBpZHggPSBwYXRoLmluZGV4T2YoX3NsYXNoLCAyKTtcclxuICAgICAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGF1dGhvcml0eSA9IHBhdGguc3Vic3RyaW5nKDIpO1xyXG4gICAgICAgICAgICAgICAgcGF0aCA9IF9zbGFzaDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGF1dGhvcml0eSA9IHBhdGguc3Vic3RyaW5nKDIsIGlkeCk7XHJcbiAgICAgICAgICAgICAgICBwYXRoID0gcGF0aC5zdWJzdHJpbmcoaWR4KSB8fCBfc2xhc2g7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBVcmkoJ2ZpbGUnLCBhdXRob3JpdHksIHBhdGgsIF9lbXB0eSwgX2VtcHR5KTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBmcm9tKGNvbXBvbmVudHMpIHtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgVXJpKGNvbXBvbmVudHMuc2NoZW1lLCBjb21wb25lbnRzLmF1dGhvcml0eSwgY29tcG9uZW50cy5wYXRoLCBjb21wb25lbnRzLnF1ZXJ5LCBjb21wb25lbnRzLmZyYWdtZW50KTtcclxuICAgICAgICBfdmFsaWRhdGVVcmkocmVzdWx0LCB0cnVlKTtcclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBKb2luIGEgVVJJIHBhdGggd2l0aCBwYXRoIGZyYWdtZW50cyBhbmQgbm9ybWFsaXplcyB0aGUgcmVzdWx0aW5nIHBhdGguXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHVyaSBUaGUgaW5wdXQgVVJJLlxyXG4gICAgICogQHBhcmFtIHBhdGhGcmFnbWVudCBUaGUgcGF0aCBmcmFnbWVudCB0byBhZGQgdG8gdGhlIFVSSSBwYXRoLlxyXG4gICAgICogQHJldHVybnMgVGhlIHJlc3VsdGluZyBVUkkuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBqb2luUGF0aCh1cmksIC4uLnBhdGhGcmFnbWVudCkge1xyXG4gICAgICAgIGlmICghdXJpLnBhdGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBbVXJpRXJyb3JdOiBjYW5ub3QgY2FsbCBqb2luUGF0aCBvbiBVUkkgd2l0aG91dCBwYXRoYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBuZXdQYXRoO1xyXG4gICAgICAgIGlmIChpc1dpbmRvd3MgJiYgdXJpLnNjaGVtZSA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgICAgICAgIG5ld1BhdGggPSBVUkkuZmlsZShwYXRocy53aW4zMi5qb2luKHVyaVRvRnNQYXRoKHVyaSwgdHJ1ZSksIC4uLnBhdGhGcmFnbWVudCkpLnBhdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuZXdQYXRoID0gcGF0aHMucG9zaXguam9pbih1cmkucGF0aCwgLi4ucGF0aEZyYWdtZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVyaS53aXRoKHsgcGF0aDogbmV3UGF0aCB9KTtcclxuICAgIH1cclxuICAgIC8vIC0tLS0gcHJpbnRpbmcvZXh0ZXJuYWxpemUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gZm9yIHRoaXMgVVJJLiBJdCdzIGd1YXJhbnRlZWQgdGhhdCBjYWxsaW5nXHJcbiAgICAgKiBgVVJJLnBhcnNlYCB3aXRoIHRoZSByZXN1bHQgb2YgdGhpcyBmdW5jdGlvbiBjcmVhdGVzIGFuIFVSSSB3aGljaCBpcyBlcXVhbFxyXG4gICAgICogdG8gdGhpcyBVUkkuXHJcbiAgICAgKlxyXG4gICAgICogKiBUaGUgcmVzdWx0IHNoYWxsICpub3QqIGJlIHVzZWQgZm9yIGRpc3BsYXkgcHVycG9zZXMgYnV0IGZvciBleHRlcm5hbGl6YXRpb24gb3IgdHJhbnNwb3J0LlxyXG4gICAgICogKiBUaGUgcmVzdWx0IHdpbGwgYmUgZW5jb2RlZCB1c2luZyB0aGUgcGVyY2VudGFnZSBlbmNvZGluZyBhbmQgZW5jb2RpbmcgaGFwcGVucyBtb3N0bHlcclxuICAgICAqIGlnbm9yZSB0aGUgc2NoZW1lLXNwZWNpZmljIGVuY29kaW5nIHJ1bGVzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBza2lwRW5jb2RpbmcgRG8gbm90IGVuY29kZSB0aGUgcmVzdWx0LCBkZWZhdWx0IGlzIGBmYWxzZWBcclxuICAgICAqL1xyXG4gICAgdG9TdHJpbmcoc2tpcEVuY29kaW5nID0gZmFsc2UpIHtcclxuICAgICAgICByZXR1cm4gX2FzRm9ybWF0dGVkKHRoaXMsIHNraXBFbmNvZGluZyk7XHJcbiAgICB9XHJcbiAgICB0b0pTT04oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgcmV2aXZlKGRhdGEpIHtcclxuICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGRhdGEgaW5zdGFuY2VvZiBVUkkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgVXJpKGRhdGEpO1xyXG4gICAgICAgICAgICByZXN1bHQuX2Zvcm1hdHRlZCA9IGRhdGEuZXh0ZXJuYWw7XHJcbiAgICAgICAgICAgIHJlc3VsdC5fZnNQYXRoID0gZGF0YS5fc2VwID09PSBfcGF0aFNlcE1hcmtlciA/IGRhdGEuZnNQYXRoIDogbnVsbDtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuY29uc3QgX3BhdGhTZXBNYXJrZXIgPSBpc1dpbmRvd3MgPyAxIDogdW5kZWZpbmVkO1xyXG4vLyBUaGlzIGNsYXNzIGV4aXN0cyBzbyB0aGF0IFVSSSBpcyBjb21wYXRpYmlsZSB3aXRoIHZzY29kZS5VcmkgKEFQSSkuXHJcbmNsYXNzIFVyaSBleHRlbmRzIFVSSSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlciguLi5hcmd1bWVudHMpO1xyXG4gICAgICAgIHRoaXMuX2Zvcm1hdHRlZCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZnNQYXRoID0gbnVsbDtcclxuICAgIH1cclxuICAgIGdldCBmc1BhdGgoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9mc1BhdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5fZnNQYXRoID0gdXJpVG9Gc1BhdGgodGhpcywgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZnNQYXRoO1xyXG4gICAgfVxyXG4gICAgdG9TdHJpbmcoc2tpcEVuY29kaW5nID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoIXNraXBFbmNvZGluZykge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2Zvcm1hdHRlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZm9ybWF0dGVkID0gX2FzRm9ybWF0dGVkKHRoaXMsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZm9ybWF0dGVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgY2FjaGUgdGhhdFxyXG4gICAgICAgICAgICByZXR1cm4gX2FzRm9ybWF0dGVkKHRoaXMsIHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRvSlNPTigpIHtcclxuICAgICAgICBjb25zdCByZXMgPSB7XHJcbiAgICAgICAgICAgICRtaWQ6IDFcclxuICAgICAgICB9O1xyXG4gICAgICAgIC8vIGNhY2hlZCBzdGF0ZVxyXG4gICAgICAgIGlmICh0aGlzLl9mc1BhdGgpIHtcclxuICAgICAgICAgICAgcmVzLmZzUGF0aCA9IHRoaXMuX2ZzUGF0aDtcclxuICAgICAgICAgICAgcmVzLl9zZXAgPSBfcGF0aFNlcE1hcmtlcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuX2Zvcm1hdHRlZCkge1xyXG4gICAgICAgICAgICByZXMuZXh0ZXJuYWwgPSB0aGlzLl9mb3JtYXR0ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHVyaSBjb21wb25lbnRzXHJcbiAgICAgICAgaWYgKHRoaXMucGF0aCkge1xyXG4gICAgICAgICAgICByZXMucGF0aCA9IHRoaXMucGF0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2NoZW1lKSB7XHJcbiAgICAgICAgICAgIHJlcy5zY2hlbWUgPSB0aGlzLnNjaGVtZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuYXV0aG9yaXR5KSB7XHJcbiAgICAgICAgICAgIHJlcy5hdXRob3JpdHkgPSB0aGlzLmF1dGhvcml0eTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMucXVlcnkpIHtcclxuICAgICAgICAgICAgcmVzLnF1ZXJ5ID0gdGhpcy5xdWVyeTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuZnJhZ21lbnQpIHtcclxuICAgICAgICAgICAgcmVzLmZyYWdtZW50ID0gdGhpcy5mcmFnbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH1cclxufVxyXG4vLyByZXNlcnZlZCBjaGFyYWN0ZXJzOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTIuMlxyXG5jb25zdCBlbmNvZGVUYWJsZSA9IHtcclxuICAgIFs1OCAvKiBDb2xvbiAqL106ICclM0EnLFxyXG4gICAgWzQ3IC8qIFNsYXNoICovXTogJyUyRicsXHJcbiAgICBbNjMgLyogUXVlc3Rpb25NYXJrICovXTogJyUzRicsXHJcbiAgICBbMzUgLyogSGFzaCAqL106ICclMjMnLFxyXG4gICAgWzkxIC8qIE9wZW5TcXVhcmVCcmFja2V0ICovXTogJyU1QicsXHJcbiAgICBbOTMgLyogQ2xvc2VTcXVhcmVCcmFja2V0ICovXTogJyU1RCcsXHJcbiAgICBbNjQgLyogQXRTaWduICovXTogJyU0MCcsXHJcbiAgICBbMzMgLyogRXhjbGFtYXRpb25NYXJrICovXTogJyUyMScsXHJcbiAgICBbMzYgLyogRG9sbGFyU2lnbiAqL106ICclMjQnLFxyXG4gICAgWzM4IC8qIEFtcGVyc2FuZCAqL106ICclMjYnLFxyXG4gICAgWzM5IC8qIFNpbmdsZVF1b3RlICovXTogJyUyNycsXHJcbiAgICBbNDAgLyogT3BlblBhcmVuICovXTogJyUyOCcsXHJcbiAgICBbNDEgLyogQ2xvc2VQYXJlbiAqL106ICclMjknLFxyXG4gICAgWzQyIC8qIEFzdGVyaXNrICovXTogJyUyQScsXHJcbiAgICBbNDMgLyogUGx1cyAqL106ICclMkInLFxyXG4gICAgWzQ0IC8qIENvbW1hICovXTogJyUyQycsXHJcbiAgICBbNTkgLyogU2VtaWNvbG9uICovXTogJyUzQicsXHJcbiAgICBbNjEgLyogRXF1YWxzICovXTogJyUzRCcsXHJcbiAgICBbMzIgLyogU3BhY2UgKi9dOiAnJTIwJyxcclxufTtcclxuZnVuY3Rpb24gZW5jb2RlVVJJQ29tcG9uZW50RmFzdCh1cmlDb21wb25lbnQsIGFsbG93U2xhc2gpIHtcclxuICAgIGxldCByZXMgPSB1bmRlZmluZWQ7XHJcbiAgICBsZXQgbmF0aXZlRW5jb2RlUG9zID0gLTE7XHJcbiAgICBmb3IgKGxldCBwb3MgPSAwOyBwb3MgPCB1cmlDb21wb25lbnQubGVuZ3RoOyBwb3MrKykge1xyXG4gICAgICAgIGNvbnN0IGNvZGUgPSB1cmlDb21wb25lbnQuY2hhckNvZGVBdChwb3MpO1xyXG4gICAgICAgIC8vIHVucmVzZXJ2ZWQgY2hhcmFjdGVyczogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi0yLjNcclxuICAgICAgICBpZiAoKGNvZGUgPj0gOTcgLyogYSAqLyAmJiBjb2RlIDw9IDEyMiAvKiB6ICovKVxyXG4gICAgICAgICAgICB8fCAoY29kZSA+PSA2NSAvKiBBICovICYmIGNvZGUgPD0gOTAgLyogWiAqLylcclxuICAgICAgICAgICAgfHwgKGNvZGUgPj0gNDggLyogRGlnaXQwICovICYmIGNvZGUgPD0gNTcgLyogRGlnaXQ5ICovKVxyXG4gICAgICAgICAgICB8fCBjb2RlID09PSA0NSAvKiBEYXNoICovXHJcbiAgICAgICAgICAgIHx8IGNvZGUgPT09IDQ2IC8qIFBlcmlvZCAqL1xyXG4gICAgICAgICAgICB8fCBjb2RlID09PSA5NSAvKiBVbmRlcmxpbmUgKi9cclxuICAgICAgICAgICAgfHwgY29kZSA9PT0gMTI2IC8qIFRpbGRlICovXHJcbiAgICAgICAgICAgIHx8IChhbGxvd1NsYXNoICYmIGNvZGUgPT09IDQ3IC8qIFNsYXNoICovKSkge1xyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB3ZSBhcmUgZGVsYXlpbmcgbmF0aXZlIGVuY29kZVxyXG4gICAgICAgICAgICBpZiAobmF0aXZlRW5jb2RlUG9zICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmVzICs9IGVuY29kZVVSSUNvbXBvbmVudCh1cmlDb21wb25lbnQuc3Vic3RyaW5nKG5hdGl2ZUVuY29kZVBvcywgcG9zKSk7XHJcbiAgICAgICAgICAgICAgICBuYXRpdmVFbmNvZGVQb3MgPSAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB3ZSB3cml0ZSBpbnRvIGEgbmV3IHN0cmluZyAoYnkgZGVmYXVsdCB3ZSB0cnkgdG8gcmV0dXJuIHRoZSBwYXJhbSlcclxuICAgICAgICAgICAgaWYgKHJlcyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXMgKz0gdXJpQ29tcG9uZW50LmNoYXJBdChwb3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBlbmNvZGluZyBuZWVkZWQsIHdlIG5lZWQgdG8gYWxsb2NhdGUgYSBuZXcgc3RyaW5nXHJcbiAgICAgICAgICAgIGlmIChyZXMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmVzID0gdXJpQ29tcG9uZW50LnN1YnN0cigwLCBwb3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIHdpdGggZGVmYXVsdCB0YWJsZSBmaXJzdFxyXG4gICAgICAgICAgICBjb25zdCBlc2NhcGVkID0gZW5jb2RlVGFibGVbY29kZV07XHJcbiAgICAgICAgICAgIGlmIChlc2NhcGVkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHdlIGFyZSBkZWxheWluZyBuYXRpdmUgZW5jb2RlXHJcbiAgICAgICAgICAgICAgICBpZiAobmF0aXZlRW5jb2RlUG9zICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcyArPSBlbmNvZGVVUklDb21wb25lbnQodXJpQ29tcG9uZW50LnN1YnN0cmluZyhuYXRpdmVFbmNvZGVQb3MsIHBvcykpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5hdGl2ZUVuY29kZVBvcyA9IC0xO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gYXBwZW5kIGVzY2FwZWQgdmFyaWFudCB0byByZXN1bHRcclxuICAgICAgICAgICAgICAgIHJlcyArPSBlc2NhcGVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG5hdGl2ZUVuY29kZVBvcyA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIC8vIHVzZSBuYXRpdmUgZW5jb2RlIG9ubHkgd2hlbiBuZWVkZWRcclxuICAgICAgICAgICAgICAgIG5hdGl2ZUVuY29kZVBvcyA9IHBvcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChuYXRpdmVFbmNvZGVQb3MgIT09IC0xKSB7XHJcbiAgICAgICAgcmVzICs9IGVuY29kZVVSSUNvbXBvbmVudCh1cmlDb21wb25lbnQuc3Vic3RyaW5nKG5hdGl2ZUVuY29kZVBvcykpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlcyAhPT0gdW5kZWZpbmVkID8gcmVzIDogdXJpQ29tcG9uZW50O1xyXG59XHJcbmZ1bmN0aW9uIGVuY29kZVVSSUNvbXBvbmVudE1pbmltYWwocGF0aCkge1xyXG4gICAgbGV0IHJlcyA9IHVuZGVmaW5lZDtcclxuICAgIGZvciAobGV0IHBvcyA9IDA7IHBvcyA8IHBhdGgubGVuZ3RoOyBwb3MrKykge1xyXG4gICAgICAgIGNvbnN0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQocG9zKTtcclxuICAgICAgICBpZiAoY29kZSA9PT0gMzUgLyogSGFzaCAqLyB8fCBjb2RlID09PSA2MyAvKiBRdWVzdGlvbk1hcmsgKi8pIHtcclxuICAgICAgICAgICAgaWYgKHJlcyA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICByZXMgPSBwYXRoLnN1YnN0cigwLCBwb3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlcyArPSBlbmNvZGVUYWJsZVtjb2RlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChyZXMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmVzICs9IHBhdGhbcG9zXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXMgIT09IHVuZGVmaW5lZCA/IHJlcyA6IHBhdGg7XHJcbn1cclxuLyoqXHJcbiAqIENvbXB1dGUgYGZzUGF0aGAgZm9yIHRoZSBnaXZlbiB1cmlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiB1cmlUb0ZzUGF0aCh1cmksIGtlZXBEcml2ZUxldHRlckNhc2luZykge1xyXG4gICAgbGV0IHZhbHVlO1xyXG4gICAgaWYgKHVyaS5hdXRob3JpdHkgJiYgdXJpLnBhdGgubGVuZ3RoID4gMSAmJiB1cmkuc2NoZW1lID09PSAnZmlsZScpIHtcclxuICAgICAgICAvLyB1bmMgcGF0aDogZmlsZTovL3NoYXJlcy9jJC9mYXIvYm9vXHJcbiAgICAgICAgdmFsdWUgPSBgLy8ke3VyaS5hdXRob3JpdHl9JHt1cmkucGF0aH1gO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodXJpLnBhdGguY2hhckNvZGVBdCgwKSA9PT0gNDcgLyogU2xhc2ggKi9cclxuICAgICAgICAmJiAodXJpLnBhdGguY2hhckNvZGVBdCgxKSA+PSA2NSAvKiBBICovICYmIHVyaS5wYXRoLmNoYXJDb2RlQXQoMSkgPD0gOTAgLyogWiAqLyB8fCB1cmkucGF0aC5jaGFyQ29kZUF0KDEpID49IDk3IC8qIGEgKi8gJiYgdXJpLnBhdGguY2hhckNvZGVBdCgxKSA8PSAxMjIgLyogeiAqLylcclxuICAgICAgICAmJiB1cmkucGF0aC5jaGFyQ29kZUF0KDIpID09PSA1OCAvKiBDb2xvbiAqLykge1xyXG4gICAgICAgIGlmICgha2VlcERyaXZlTGV0dGVyQ2FzaW5nKSB7XHJcbiAgICAgICAgICAgIC8vIHdpbmRvd3MgZHJpdmUgbGV0dGVyOiBmaWxlOi8vL2M6L2Zhci9ib29cclxuICAgICAgICAgICAgdmFsdWUgPSB1cmkucGF0aFsxXS50b0xvd2VyQ2FzZSgpICsgdXJpLnBhdGguc3Vic3RyKDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB1cmkucGF0aC5zdWJzdHIoMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgLy8gb3RoZXIgcGF0aFxyXG4gICAgICAgIHZhbHVlID0gdXJpLnBhdGg7XHJcbiAgICB9XHJcbiAgICBpZiAoaXNXaW5kb3dzKSB7XHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXC8vZywgJ1xcXFwnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxufVxyXG4vKipcclxuICogQ3JlYXRlIHRoZSBleHRlcm5hbCB2ZXJzaW9uIG9mIGEgdXJpXHJcbiAqL1xyXG5mdW5jdGlvbiBfYXNGb3JtYXR0ZWQodXJpLCBza2lwRW5jb2RpbmcpIHtcclxuICAgIGNvbnN0IGVuY29kZXIgPSAhc2tpcEVuY29kaW5nXHJcbiAgICAgICAgPyBlbmNvZGVVUklDb21wb25lbnRGYXN0XHJcbiAgICAgICAgOiBlbmNvZGVVUklDb21wb25lbnRNaW5pbWFsO1xyXG4gICAgbGV0IHJlcyA9ICcnO1xyXG4gICAgbGV0IHsgc2NoZW1lLCBhdXRob3JpdHksIHBhdGgsIHF1ZXJ5LCBmcmFnbWVudCB9ID0gdXJpO1xyXG4gICAgaWYgKHNjaGVtZSkge1xyXG4gICAgICAgIHJlcyArPSBzY2hlbWU7XHJcbiAgICAgICAgcmVzICs9ICc6JztcclxuICAgIH1cclxuICAgIGlmIChhdXRob3JpdHkgfHwgc2NoZW1lID09PSAnZmlsZScpIHtcclxuICAgICAgICByZXMgKz0gX3NsYXNoO1xyXG4gICAgICAgIHJlcyArPSBfc2xhc2g7XHJcbiAgICB9XHJcbiAgICBpZiAoYXV0aG9yaXR5KSB7XHJcbiAgICAgICAgbGV0IGlkeCA9IGF1dGhvcml0eS5pbmRleE9mKCdAJyk7XHJcbiAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgLy8gPHVzZXI+QDxhdXRoPlxyXG4gICAgICAgICAgICBjb25zdCB1c2VyaW5mbyA9IGF1dGhvcml0eS5zdWJzdHIoMCwgaWR4KTtcclxuICAgICAgICAgICAgYXV0aG9yaXR5ID0gYXV0aG9yaXR5LnN1YnN0cihpZHggKyAxKTtcclxuICAgICAgICAgICAgaWR4ID0gdXNlcmluZm8uaW5kZXhPZignOicpO1xyXG4gICAgICAgICAgICBpZiAoaWR4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmVzICs9IGVuY29kZXIodXNlcmluZm8sIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIDx1c2VyPjo8cGFzcz5APGF1dGg+XHJcbiAgICAgICAgICAgICAgICByZXMgKz0gZW5jb2Rlcih1c2VyaW5mby5zdWJzdHIoMCwgaWR4KSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgcmVzICs9ICc6JztcclxuICAgICAgICAgICAgICAgIHJlcyArPSBlbmNvZGVyKHVzZXJpbmZvLnN1YnN0cihpZHggKyAxKSwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlcyArPSAnQCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGF1dGhvcml0eSA9IGF1dGhvcml0eS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlkeCA9IGF1dGhvcml0eS5pbmRleE9mKCc6Jyk7XHJcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgcmVzICs9IGVuY29kZXIoYXV0aG9yaXR5LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyA8YXV0aD46PHBvcnQ+XHJcbiAgICAgICAgICAgIHJlcyArPSBlbmNvZGVyKGF1dGhvcml0eS5zdWJzdHIoMCwgaWR4KSwgZmFsc2UpO1xyXG4gICAgICAgICAgICByZXMgKz0gYXV0aG9yaXR5LnN1YnN0cihpZHgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGlmIChwYXRoKSB7XHJcbiAgICAgICAgLy8gbG93ZXItY2FzZSB3aW5kb3dzIGRyaXZlIGxldHRlcnMgaW4gL0M6L2ZmZiBvciBDOi9mZmZcclxuICAgICAgICBpZiAocGF0aC5sZW5ndGggPj0gMyAmJiBwYXRoLmNoYXJDb2RlQXQoMCkgPT09IDQ3IC8qIFNsYXNoICovICYmIHBhdGguY2hhckNvZGVBdCgyKSA9PT0gNTggLyogQ29sb24gKi8pIHtcclxuICAgICAgICAgICAgY29uc3QgY29kZSA9IHBhdGguY2hhckNvZGVBdCgxKTtcclxuICAgICAgICAgICAgaWYgKGNvZGUgPj0gNjUgLyogQSAqLyAmJiBjb2RlIDw9IDkwIC8qIFogKi8pIHtcclxuICAgICAgICAgICAgICAgIHBhdGggPSBgLyR7U3RyaW5nLmZyb21DaGFyQ29kZShjb2RlICsgMzIpfToke3BhdGguc3Vic3RyKDMpfWA7IC8vIFwiL2M6XCIubGVuZ3RoID09PSAzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAocGF0aC5sZW5ndGggPj0gMiAmJiBwYXRoLmNoYXJDb2RlQXQoMSkgPT09IDU4IC8qIENvbG9uICovKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNvZGUgPSBwYXRoLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgICAgIGlmIChjb2RlID49IDY1IC8qIEEgKi8gJiYgY29kZSA8PSA5MCAvKiBaICovKSB7XHJcbiAgICAgICAgICAgICAgICBwYXRoID0gYCR7U3RyaW5nLmZyb21DaGFyQ29kZShjb2RlICsgMzIpfToke3BhdGguc3Vic3RyKDIpfWA7IC8vIFwiL2M6XCIubGVuZ3RoID09PSAzXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZW5jb2RlIHRoZSByZXN0IG9mIHRoZSBwYXRoXHJcbiAgICAgICAgcmVzICs9IGVuY29kZXIocGF0aCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBpZiAocXVlcnkpIHtcclxuICAgICAgICByZXMgKz0gJz8nO1xyXG4gICAgICAgIHJlcyArPSBlbmNvZGVyKHF1ZXJ5LCBmYWxzZSk7XHJcbiAgICB9XHJcbiAgICBpZiAoZnJhZ21lbnQpIHtcclxuICAgICAgICByZXMgKz0gJyMnO1xyXG4gICAgICAgIHJlcyArPSAhc2tpcEVuY29kaW5nID8gZW5jb2RlVVJJQ29tcG9uZW50RmFzdChmcmFnbWVudCwgZmFsc2UpIDogZnJhZ21lbnQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzO1xyXG59XHJcbi8vIC0tLSBkZWNvZGVcclxuZnVuY3Rpb24gZGVjb2RlVVJJQ29tcG9uZW50R3JhY2VmdWwoc3RyKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChfYSkge1xyXG4gICAgICAgIGlmIChzdHIubGVuZ3RoID4gMykge1xyXG4gICAgICAgICAgICByZXR1cm4gc3RyLnN1YnN0cigwLCAzKSArIGRlY29kZVVSSUNvbXBvbmVudEdyYWNlZnVsKHN0ci5zdWJzdHIoMykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuY29uc3QgX3JFbmNvZGVkQXNIZXggPSAvKCVbMC05QS1aYS16XVswLTlBLVphLXpdKSsvZztcclxuZnVuY3Rpb24gcGVyY2VudERlY29kZShzdHIpIHtcclxuICAgIGlmICghc3RyLm1hdGNoKF9yRW5jb2RlZEFzSGV4KSkge1xyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UoX3JFbmNvZGVkQXNIZXgsIChtYXRjaCkgPT4gZGVjb2RlVVJJQ29tcG9uZW50R3JhY2VmdWwobWF0Y2gpKTtcclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbi8qKlxyXG4gKiBBIHBvc2l0aW9uIGluIHRoZSBlZGl0b3IuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUG9zaXRpb24ge1xyXG4gICAgY29uc3RydWN0b3IobGluZU51bWJlciwgY29sdW1uKSB7XHJcbiAgICAgICAgdGhpcy5saW5lTnVtYmVyID0gbGluZU51bWJlcjtcclxuICAgICAgICB0aGlzLmNvbHVtbiA9IGNvbHVtbjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IHBvc2l0aW9uIGZyb20gdGhpcyBwb3NpdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbmV3TGluZU51bWJlciBuZXcgbGluZSBudW1iZXJcclxuICAgICAqIEBwYXJhbSBuZXdDb2x1bW4gbmV3IGNvbHVtblxyXG4gICAgICovXHJcbiAgICB3aXRoKG5ld0xpbmVOdW1iZXIgPSB0aGlzLmxpbmVOdW1iZXIsIG5ld0NvbHVtbiA9IHRoaXMuY29sdW1uKSB7XHJcbiAgICAgICAgaWYgKG5ld0xpbmVOdW1iZXIgPT09IHRoaXMubGluZU51bWJlciAmJiBuZXdDb2x1bW4gPT09IHRoaXMuY29sdW1uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQb3NpdGlvbihuZXdMaW5lTnVtYmVyLCBuZXdDb2x1bW4pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRGVyaXZlIGEgbmV3IHBvc2l0aW9uIGZyb20gdGhpcyBwb3NpdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gZGVsdGFMaW5lTnVtYmVyIGxpbmUgbnVtYmVyIGRlbHRhXHJcbiAgICAgKiBAcGFyYW0gZGVsdGFDb2x1bW4gY29sdW1uIGRlbHRhXHJcbiAgICAgKi9cclxuICAgIGRlbHRhKGRlbHRhTGluZU51bWJlciA9IDAsIGRlbHRhQ29sdW1uID0gMCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLndpdGgodGhpcy5saW5lTnVtYmVyICsgZGVsdGFMaW5lTnVtYmVyLCB0aGlzLmNvbHVtbiArIGRlbHRhQ29sdW1uKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiB0aGlzIHBvc2l0aW9uIGVxdWFscyBvdGhlciBwb3NpdGlvblxyXG4gICAgICovXHJcbiAgICBlcXVhbHMob3RoZXIpIHtcclxuICAgICAgICByZXR1cm4gUG9zaXRpb24uZXF1YWxzKHRoaXMsIG90aGVyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiBwb3NpdGlvbiBgYWAgZXF1YWxzIHBvc2l0aW9uIGBiYFxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZXF1YWxzKGEsIGIpIHtcclxuICAgICAgICBpZiAoIWEgJiYgIWIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAoISFhICYmXHJcbiAgICAgICAgICAgICEhYiAmJlxyXG4gICAgICAgICAgICBhLmxpbmVOdW1iZXIgPT09IGIubGluZU51bWJlciAmJlxyXG4gICAgICAgICAgICBhLmNvbHVtbiA9PT0gYi5jb2x1bW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IGlmIHRoaXMgcG9zaXRpb24gaXMgYmVmb3JlIG90aGVyIHBvc2l0aW9uLlxyXG4gICAgICogSWYgdGhlIHR3byBwb3NpdGlvbnMgYXJlIGVxdWFsLCB0aGUgcmVzdWx0IHdpbGwgYmUgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIGlzQmVmb3JlKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIFBvc2l0aW9uLmlzQmVmb3JlKHRoaXMsIG90aGVyKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiBwb3NpdGlvbiBgYWAgaXMgYmVmb3JlIHBvc2l0aW9uIGBiYC5cclxuICAgICAqIElmIHRoZSB0d28gcG9zaXRpb25zIGFyZSBlcXVhbCwgdGhlIHJlc3VsdCB3aWxsIGJlIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNCZWZvcmUoYSwgYikge1xyXG4gICAgICAgIGlmIChhLmxpbmVOdW1iZXIgPCBiLmxpbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChiLmxpbmVOdW1iZXIgPCBhLmxpbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gYS5jb2x1bW4gPCBiLmNvbHVtbjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiB0aGlzIHBvc2l0aW9uIGlzIGJlZm9yZSBvdGhlciBwb3NpdGlvbi5cclxuICAgICAqIElmIHRoZSB0d28gcG9zaXRpb25zIGFyZSBlcXVhbCwgdGhlIHJlc3VsdCB3aWxsIGJlIHRydWUuXHJcbiAgICAgKi9cclxuICAgIGlzQmVmb3JlT3JFcXVhbChvdGhlcikge1xyXG4gICAgICAgIHJldHVybiBQb3NpdGlvbi5pc0JlZm9yZU9yRXF1YWwodGhpcywgb3RoZXIpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IGlmIHBvc2l0aW9uIGBhYCBpcyBiZWZvcmUgcG9zaXRpb24gYGJgLlxyXG4gICAgICogSWYgdGhlIHR3byBwb3NpdGlvbnMgYXJlIGVxdWFsLCB0aGUgcmVzdWx0IHdpbGwgYmUgdHJ1ZS5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGlzQmVmb3JlT3JFcXVhbChhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEubGluZU51bWJlciA8IGIubGluZU51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGIubGluZU51bWJlciA8IGEubGluZU51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhLmNvbHVtbiA8PSBiLmNvbHVtbjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQSBmdW5jdGlvbiB0aGF0IGNvbXBhcmVzIHBvc2l0aW9ucywgdXNlZnVsIGZvciBzb3J0aW5nXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjb21wYXJlKGEsIGIpIHtcclxuICAgICAgICBsZXQgYUxpbmVOdW1iZXIgPSBhLmxpbmVOdW1iZXIgfCAwO1xyXG4gICAgICAgIGxldCBiTGluZU51bWJlciA9IGIubGluZU51bWJlciB8IDA7XHJcbiAgICAgICAgaWYgKGFMaW5lTnVtYmVyID09PSBiTGluZU51bWJlcikge1xyXG4gICAgICAgICAgICBsZXQgYUNvbHVtbiA9IGEuY29sdW1uIHwgMDtcclxuICAgICAgICAgICAgbGV0IGJDb2x1bW4gPSBiLmNvbHVtbiB8IDA7XHJcbiAgICAgICAgICAgIHJldHVybiBhQ29sdW1uIC0gYkNvbHVtbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFMaW5lTnVtYmVyIC0gYkxpbmVOdW1iZXI7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENsb25lIHRoaXMgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIGNsb25lKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUG9zaXRpb24odGhpcy5saW5lTnVtYmVyLCB0aGlzLmNvbHVtbik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnQgdG8gYSBodW1hbi1yZWFkYWJsZSByZXByZXNlbnRhdGlvbi5cclxuICAgICAqL1xyXG4gICAgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuICcoJyArIHRoaXMubGluZU51bWJlciArICcsJyArIHRoaXMuY29sdW1uICsgJyknO1xyXG4gICAgfVxyXG4gICAgLy8gLS0tXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIGBQb3NpdGlvbmAgZnJvbSBhbiBgSVBvc2l0aW9uYC5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGxpZnQocG9zKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3NpdGlvbihwb3MubGluZU51bWJlciwgcG9zLmNvbHVtbik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRlc3QgaWYgYG9iamAgaXMgYW4gYElQb3NpdGlvbmAuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBpc0lQb3NpdGlvbihvYmopIHtcclxuICAgICAgICByZXR1cm4gKG9ialxyXG4gICAgICAgICAgICAmJiAodHlwZW9mIG9iai5saW5lTnVtYmVyID09PSAnbnVtYmVyJylcclxuICAgICAgICAgICAgJiYgKHR5cGVvZiBvYmouY29sdW1uID09PSAnbnVtYmVyJykpO1xyXG4gICAgfVxyXG59XHJcbiIsICIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuL3Bvc2l0aW9uLmpzJztcclxuLyoqXHJcbiAqIEEgcmFuZ2UgaW4gdGhlIGVkaXRvci4gKHN0YXJ0TGluZU51bWJlcixzdGFydENvbHVtbikgaXMgPD0gKGVuZExpbmVOdW1iZXIsZW5kQ29sdW1uKVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFJhbmdlIHtcclxuICAgIGNvbnN0cnVjdG9yKHN0YXJ0TGluZU51bWJlciwgc3RhcnRDb2x1bW4sIGVuZExpbmVOdW1iZXIsIGVuZENvbHVtbikge1xyXG4gICAgICAgIGlmICgoc3RhcnRMaW5lTnVtYmVyID4gZW5kTGluZU51bWJlcikgfHwgKHN0YXJ0TGluZU51bWJlciA9PT0gZW5kTGluZU51bWJlciAmJiBzdGFydENvbHVtbiA+IGVuZENvbHVtbikpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGFydExpbmVOdW1iZXIgPSBlbmRMaW5lTnVtYmVyO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0Q29sdW1uID0gZW5kQ29sdW1uO1xyXG4gICAgICAgICAgICB0aGlzLmVuZExpbmVOdW1iZXIgPSBzdGFydExpbmVOdW1iZXI7XHJcbiAgICAgICAgICAgIHRoaXMuZW5kQ29sdW1uID0gc3RhcnRDb2x1bW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0TGluZU51bWJlciA9IHN0YXJ0TGluZU51bWJlcjtcclxuICAgICAgICAgICAgdGhpcy5zdGFydENvbHVtbiA9IHN0YXJ0Q29sdW1uO1xyXG4gICAgICAgICAgICB0aGlzLmVuZExpbmVOdW1iZXIgPSBlbmRMaW5lTnVtYmVyO1xyXG4gICAgICAgICAgICB0aGlzLmVuZENvbHVtbiA9IGVuZENvbHVtbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRlc3QgaWYgdGhpcyByYW5nZSBpcyBlbXB0eS5cclxuICAgICAqL1xyXG4gICAgaXNFbXB0eSgpIHtcclxuICAgICAgICByZXR1cm4gUmFuZ2UuaXNFbXB0eSh0aGlzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiBgcmFuZ2VgIGlzIGVtcHR5LlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNFbXB0eShyYW5nZSkge1xyXG4gICAgICAgIHJldHVybiAocmFuZ2Uuc3RhcnRMaW5lTnVtYmVyID09PSByYW5nZS5lbmRMaW5lTnVtYmVyICYmIHJhbmdlLnN0YXJ0Q29sdW1uID09PSByYW5nZS5lbmRDb2x1bW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IGlmIHBvc2l0aW9uIGlzIGluIHRoaXMgcmFuZ2UuIElmIHRoZSBwb3NpdGlvbiBpcyBhdCB0aGUgZWRnZXMsIHdpbGwgcmV0dXJuIHRydWUuXHJcbiAgICAgKi9cclxuICAgIGNvbnRhaW5zUG9zaXRpb24ocG9zaXRpb24pIHtcclxuICAgICAgICByZXR1cm4gUmFuZ2UuY29udGFpbnNQb3NpdGlvbih0aGlzLCBwb3NpdGlvbik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRlc3QgaWYgYHBvc2l0aW9uYCBpcyBpbiBgcmFuZ2VgLiBJZiB0aGUgcG9zaXRpb24gaXMgYXQgdGhlIGVkZ2VzLCB3aWxsIHJldHVybiB0cnVlLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY29udGFpbnNQb3NpdGlvbihyYW5nZSwgcG9zaXRpb24pIHtcclxuICAgICAgICBpZiAocG9zaXRpb24ubGluZU51bWJlciA8IHJhbmdlLnN0YXJ0TGluZU51bWJlciB8fCBwb3NpdGlvbi5saW5lTnVtYmVyID4gcmFuZ2UuZW5kTGluZU51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwb3NpdGlvbi5saW5lTnVtYmVyID09PSByYW5nZS5zdGFydExpbmVOdW1iZXIgJiYgcG9zaXRpb24uY29sdW1uIDwgcmFuZ2Uuc3RhcnRDb2x1bW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocG9zaXRpb24ubGluZU51bWJlciA9PT0gcmFuZ2UuZW5kTGluZU51bWJlciAmJiBwb3NpdGlvbi5jb2x1bW4gPiByYW5nZS5lbmRDb2x1bW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiByYW5nZSBpcyBpbiB0aGlzIHJhbmdlLiBJZiB0aGUgcmFuZ2UgaXMgZXF1YWwgdG8gdGhpcyByYW5nZSwgd2lsbCByZXR1cm4gdHJ1ZS5cclxuICAgICAqL1xyXG4gICAgY29udGFpbnNSYW5nZShyYW5nZSkge1xyXG4gICAgICAgIHJldHVybiBSYW5nZS5jb250YWluc1JhbmdlKHRoaXMsIHJhbmdlKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiBgb3RoZXJSYW5nZWAgaXMgaW4gYHJhbmdlYC4gSWYgdGhlIHJhbmdlcyBhcmUgZXF1YWwsIHdpbGwgcmV0dXJuIHRydWUuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBjb250YWluc1JhbmdlKHJhbmdlLCBvdGhlclJhbmdlKSB7XHJcbiAgICAgICAgaWYgKG90aGVyUmFuZ2Uuc3RhcnRMaW5lTnVtYmVyIDwgcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyIHx8IG90aGVyUmFuZ2UuZW5kTGluZU51bWJlciA8IHJhbmdlLnN0YXJ0TGluZU51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvdGhlclJhbmdlLnN0YXJ0TGluZU51bWJlciA+IHJhbmdlLmVuZExpbmVOdW1iZXIgfHwgb3RoZXJSYW5nZS5lbmRMaW5lTnVtYmVyID4gcmFuZ2UuZW5kTGluZU51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvdGhlclJhbmdlLnN0YXJ0TGluZU51bWJlciA9PT0gcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyICYmIG90aGVyUmFuZ2Uuc3RhcnRDb2x1bW4gPCByYW5nZS5zdGFydENvbHVtbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvdGhlclJhbmdlLmVuZExpbmVOdW1iZXIgPT09IHJhbmdlLmVuZExpbmVOdW1iZXIgJiYgb3RoZXJSYW5nZS5lbmRDb2x1bW4gPiByYW5nZS5lbmRDb2x1bW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiBgcmFuZ2VgIGlzIHN0cmljdGx5IGluIHRoaXMgcmFuZ2UuIGByYW5nZWAgbXVzdCBzdGFydCBhZnRlciBhbmQgZW5kIGJlZm9yZSB0aGlzIHJhbmdlIGZvciB0aGUgcmVzdWx0IHRvIGJlIHRydWUuXHJcbiAgICAgKi9cclxuICAgIHN0cmljdENvbnRhaW5zUmFuZ2UocmFuZ2UpIHtcclxuICAgICAgICByZXR1cm4gUmFuZ2Uuc3RyaWN0Q29udGFpbnNSYW5nZSh0aGlzLCByYW5nZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRlc3QgaWYgYG90aGVyUmFuZ2VgIGlzIHN0cmluY3RseSBpbiBgcmFuZ2VgIChtdXN0IHN0YXJ0IGFmdGVyLCBhbmQgZW5kIGJlZm9yZSkuIElmIHRoZSByYW5nZXMgYXJlIGVxdWFsLCB3aWxsIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHN0cmljdENvbnRhaW5zUmFuZ2UocmFuZ2UsIG90aGVyUmFuZ2UpIHtcclxuICAgICAgICBpZiAob3RoZXJSYW5nZS5zdGFydExpbmVOdW1iZXIgPCByYW5nZS5zdGFydExpbmVOdW1iZXIgfHwgb3RoZXJSYW5nZS5lbmRMaW5lTnVtYmVyIDwgcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG90aGVyUmFuZ2Uuc3RhcnRMaW5lTnVtYmVyID4gcmFuZ2UuZW5kTGluZU51bWJlciB8fCBvdGhlclJhbmdlLmVuZExpbmVOdW1iZXIgPiByYW5nZS5lbmRMaW5lTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG90aGVyUmFuZ2Uuc3RhcnRMaW5lTnVtYmVyID09PSByYW5nZS5zdGFydExpbmVOdW1iZXIgJiYgb3RoZXJSYW5nZS5zdGFydENvbHVtbiA8PSByYW5nZS5zdGFydENvbHVtbikge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChvdGhlclJhbmdlLmVuZExpbmVOdW1iZXIgPT09IHJhbmdlLmVuZExpbmVOdW1iZXIgJiYgb3RoZXJSYW5nZS5lbmRDb2x1bW4gPj0gcmFuZ2UuZW5kQ29sdW1uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEEgcmV1bmlvbiBvZiB0aGUgdHdvIHJhbmdlcy5cclxuICAgICAqIFRoZSBzbWFsbGVzdCBwb3NpdGlvbiB3aWxsIGJlIHVzZWQgYXMgdGhlIHN0YXJ0IHBvaW50LCBhbmQgdGhlIGxhcmdlc3Qgb25lIGFzIHRoZSBlbmQgcG9pbnQuXHJcbiAgICAgKi9cclxuICAgIHBsdXNSYW5nZShyYW5nZSkge1xyXG4gICAgICAgIHJldHVybiBSYW5nZS5wbHVzUmFuZ2UodGhpcywgcmFuZ2UpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHJldW5pb24gb2YgdGhlIHR3byByYW5nZXMuXHJcbiAgICAgKiBUaGUgc21hbGxlc3QgcG9zaXRpb24gd2lsbCBiZSB1c2VkIGFzIHRoZSBzdGFydCBwb2ludCwgYW5kIHRoZSBsYXJnZXN0IG9uZSBhcyB0aGUgZW5kIHBvaW50LlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcGx1c1JhbmdlKGEsIGIpIHtcclxuICAgICAgICBsZXQgc3RhcnRMaW5lTnVtYmVyO1xyXG4gICAgICAgIGxldCBzdGFydENvbHVtbjtcclxuICAgICAgICBsZXQgZW5kTGluZU51bWJlcjtcclxuICAgICAgICBsZXQgZW5kQ29sdW1uO1xyXG4gICAgICAgIGlmIChiLnN0YXJ0TGluZU51bWJlciA8IGEuc3RhcnRMaW5lTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHN0YXJ0TGluZU51bWJlciA9IGIuc3RhcnRMaW5lTnVtYmVyO1xyXG4gICAgICAgICAgICBzdGFydENvbHVtbiA9IGIuc3RhcnRDb2x1bW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGIuc3RhcnRMaW5lTnVtYmVyID09PSBhLnN0YXJ0TGluZU51bWJlcikge1xyXG4gICAgICAgICAgICBzdGFydExpbmVOdW1iZXIgPSBiLnN0YXJ0TGluZU51bWJlcjtcclxuICAgICAgICAgICAgc3RhcnRDb2x1bW4gPSBNYXRoLm1pbihiLnN0YXJ0Q29sdW1uLCBhLnN0YXJ0Q29sdW1uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHN0YXJ0TGluZU51bWJlciA9IGEuc3RhcnRMaW5lTnVtYmVyO1xyXG4gICAgICAgICAgICBzdGFydENvbHVtbiA9IGEuc3RhcnRDb2x1bW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChiLmVuZExpbmVOdW1iZXIgPiBhLmVuZExpbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgZW5kTGluZU51bWJlciA9IGIuZW5kTGluZU51bWJlcjtcclxuICAgICAgICAgICAgZW5kQ29sdW1uID0gYi5lbmRDb2x1bW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGIuZW5kTGluZU51bWJlciA9PT0gYS5lbmRMaW5lTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGVuZExpbmVOdW1iZXIgPSBiLmVuZExpbmVOdW1iZXI7XHJcbiAgICAgICAgICAgIGVuZENvbHVtbiA9IE1hdGgubWF4KGIuZW5kQ29sdW1uLCBhLmVuZENvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBlbmRMaW5lTnVtYmVyID0gYS5lbmRMaW5lTnVtYmVyO1xyXG4gICAgICAgICAgICBlbmRDb2x1bW4gPSBhLmVuZENvbHVtbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydExpbmVOdW1iZXIsIHN0YXJ0Q29sdW1uLCBlbmRMaW5lTnVtYmVyLCBlbmRDb2x1bW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBIGludGVyc2VjdGlvbiBvZiB0aGUgdHdvIHJhbmdlcy5cclxuICAgICAqL1xyXG4gICAgaW50ZXJzZWN0UmFuZ2VzKHJhbmdlKSB7XHJcbiAgICAgICAgcmV0dXJuIFJhbmdlLmludGVyc2VjdFJhbmdlcyh0aGlzLCByYW5nZSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIEEgaW50ZXJzZWN0aW9uIG9mIHRoZSB0d28gcmFuZ2VzLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaW50ZXJzZWN0UmFuZ2VzKGEsIGIpIHtcclxuICAgICAgICBsZXQgcmVzdWx0U3RhcnRMaW5lTnVtYmVyID0gYS5zdGFydExpbmVOdW1iZXI7XHJcbiAgICAgICAgbGV0IHJlc3VsdFN0YXJ0Q29sdW1uID0gYS5zdGFydENvbHVtbjtcclxuICAgICAgICBsZXQgcmVzdWx0RW5kTGluZU51bWJlciA9IGEuZW5kTGluZU51bWJlcjtcclxuICAgICAgICBsZXQgcmVzdWx0RW5kQ29sdW1uID0gYS5lbmRDb2x1bW47XHJcbiAgICAgICAgbGV0IG90aGVyU3RhcnRMaW5lTnVtYmVyID0gYi5zdGFydExpbmVOdW1iZXI7XHJcbiAgICAgICAgbGV0IG90aGVyU3RhcnRDb2x1bW4gPSBiLnN0YXJ0Q29sdW1uO1xyXG4gICAgICAgIGxldCBvdGhlckVuZExpbmVOdW1iZXIgPSBiLmVuZExpbmVOdW1iZXI7XHJcbiAgICAgICAgbGV0IG90aGVyRW5kQ29sdW1uID0gYi5lbmRDb2x1bW47XHJcbiAgICAgICAgaWYgKHJlc3VsdFN0YXJ0TGluZU51bWJlciA8IG90aGVyU3RhcnRMaW5lTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdFN0YXJ0TGluZU51bWJlciA9IG90aGVyU3RhcnRMaW5lTnVtYmVyO1xyXG4gICAgICAgICAgICByZXN1bHRTdGFydENvbHVtbiA9IG90aGVyU3RhcnRDb2x1bW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdFN0YXJ0TGluZU51bWJlciA9PT0gb3RoZXJTdGFydExpbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgcmVzdWx0U3RhcnRDb2x1bW4gPSBNYXRoLm1heChyZXN1bHRTdGFydENvbHVtbiwgb3RoZXJTdGFydENvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXN1bHRFbmRMaW5lTnVtYmVyID4gb3RoZXJFbmRMaW5lTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdEVuZExpbmVOdW1iZXIgPSBvdGhlckVuZExpbmVOdW1iZXI7XHJcbiAgICAgICAgICAgIHJlc3VsdEVuZENvbHVtbiA9IG90aGVyRW5kQ29sdW1uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChyZXN1bHRFbmRMaW5lTnVtYmVyID09PSBvdGhlckVuZExpbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgcmVzdWx0RW5kQ29sdW1uID0gTWF0aC5taW4ocmVzdWx0RW5kQ29sdW1uLCBvdGhlckVuZENvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIENoZWNrIGlmIHNlbGVjdGlvbiBpcyBub3cgZW1wdHlcclxuICAgICAgICBpZiAocmVzdWx0U3RhcnRMaW5lTnVtYmVyID4gcmVzdWx0RW5kTGluZU51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlc3VsdFN0YXJ0TGluZU51bWJlciA9PT0gcmVzdWx0RW5kTGluZU51bWJlciAmJiByZXN1bHRTdGFydENvbHVtbiA+IHJlc3VsdEVuZENvbHVtbikge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShyZXN1bHRTdGFydExpbmVOdW1iZXIsIHJlc3VsdFN0YXJ0Q29sdW1uLCByZXN1bHRFbmRMaW5lTnVtYmVyLCByZXN1bHRFbmRDb2x1bW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IGlmIHRoaXMgcmFuZ2UgZXF1YWxzIG90aGVyLlxyXG4gICAgICovXHJcbiAgICBlcXVhbHNSYW5nZShvdGhlcikge1xyXG4gICAgICAgIHJldHVybiBSYW5nZS5lcXVhbHNSYW5nZSh0aGlzLCBvdGhlcik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRlc3QgaWYgcmFuZ2UgYGFgIGVxdWFscyBgYmAuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBlcXVhbHNSYW5nZShhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuICghIWEgJiZcclxuICAgICAgICAgICAgISFiICYmXHJcbiAgICAgICAgICAgIGEuc3RhcnRMaW5lTnVtYmVyID09PSBiLnN0YXJ0TGluZU51bWJlciAmJlxyXG4gICAgICAgICAgICBhLnN0YXJ0Q29sdW1uID09PSBiLnN0YXJ0Q29sdW1uICYmXHJcbiAgICAgICAgICAgIGEuZW5kTGluZU51bWJlciA9PT0gYi5lbmRMaW5lTnVtYmVyICYmXHJcbiAgICAgICAgICAgIGEuZW5kQ29sdW1uID09PSBiLmVuZENvbHVtbik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0aGUgZW5kIHBvc2l0aW9uICh3aGljaCB3aWxsIGJlIGFmdGVyIG9yIGVxdWFsIHRvIHRoZSBzdGFydCBwb3NpdGlvbilcclxuICAgICAqL1xyXG4gICAgZ2V0RW5kUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIFJhbmdlLmdldEVuZFBvc2l0aW9uKHRoaXMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm4gdGhlIGVuZCBwb3NpdGlvbiAod2hpY2ggd2lsbCBiZSBhZnRlciBvciBlcXVhbCB0byB0aGUgc3RhcnQgcG9zaXRpb24pXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBnZXRFbmRQb3NpdGlvbihyYW5nZSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUG9zaXRpb24ocmFuZ2UuZW5kTGluZU51bWJlciwgcmFuZ2UuZW5kQ29sdW1uKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBzdGFydCBwb3NpdGlvbiAod2hpY2ggd2lsbCBiZSBiZWZvcmUgb3IgZXF1YWwgdG8gdGhlIGVuZCBwb3NpdGlvbilcclxuICAgICAqL1xyXG4gICAgZ2V0U3RhcnRQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gUmFuZ2UuZ2V0U3RhcnRQb3NpdGlvbih0aGlzKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRoZSBzdGFydCBwb3NpdGlvbiAod2hpY2ggd2lsbCBiZSBiZWZvcmUgb3IgZXF1YWwgdG8gdGhlIGVuZCBwb3NpdGlvbilcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldFN0YXJ0UG9zaXRpb24ocmFuZ2UpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHJhbmdlLnN0YXJ0TGluZU51bWJlciwgcmFuZ2Uuc3RhcnRDb2x1bW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUcmFuc2Zvcm0gdG8gYSB1c2VyIHByZXNlbnRhYmxlIHN0cmluZyByZXByZXNlbnRhdGlvbi5cclxuICAgICAqL1xyXG4gICAgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuICdbJyArIHRoaXMuc3RhcnRMaW5lTnVtYmVyICsgJywnICsgdGhpcy5zdGFydENvbHVtbiArICcgLT4gJyArIHRoaXMuZW5kTGluZU51bWJlciArICcsJyArIHRoaXMuZW5kQ29sdW1uICsgJ10nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgcmFuZ2UgdXNpbmcgdGhpcyByYW5nZSdzIHN0YXJ0IHBvc2l0aW9uLCBhbmQgdXNpbmcgZW5kTGluZU51bWJlciBhbmQgZW5kQ29sdW1uIGFzIHRoZSBlbmQgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIHNldEVuZFBvc2l0aW9uKGVuZExpbmVOdW1iZXIsIGVuZENvbHVtbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmFuZ2UodGhpcy5zdGFydExpbmVOdW1iZXIsIHRoaXMuc3RhcnRDb2x1bW4sIGVuZExpbmVOdW1iZXIsIGVuZENvbHVtbik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyByYW5nZSB1c2luZyB0aGlzIHJhbmdlJ3MgZW5kIHBvc2l0aW9uLCBhbmQgdXNpbmcgc3RhcnRMaW5lTnVtYmVyIGFuZCBzdGFydENvbHVtbiBhcyB0aGUgc3RhcnQgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIHNldFN0YXJ0UG9zaXRpb24oc3RhcnRMaW5lTnVtYmVyLCBzdGFydENvbHVtbikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUmFuZ2Uoc3RhcnRMaW5lTnVtYmVyLCBzdGFydENvbHVtbiwgdGhpcy5lbmRMaW5lTnVtYmVyLCB0aGlzLmVuZENvbHVtbik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBlbXB0eSByYW5nZSB1c2luZyB0aGlzIHJhbmdlJ3Mgc3RhcnQgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIGNvbGxhcHNlVG9TdGFydCgpIHtcclxuICAgICAgICByZXR1cm4gUmFuZ2UuY29sbGFwc2VUb1N0YXJ0KHRoaXMpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgZW1wdHkgcmFuZ2UgdXNpbmcgdGhpcyByYW5nZSdzIHN0YXJ0IHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY29sbGFwc2VUb1N0YXJ0KHJhbmdlKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZS5zdGFydExpbmVOdW1iZXIsIHJhbmdlLnN0YXJ0Q29sdW1uLCByYW5nZS5zdGFydExpbmVOdW1iZXIsIHJhbmdlLnN0YXJ0Q29sdW1uKTtcclxuICAgIH1cclxuICAgIC8vIC0tLVxyXG4gICAgc3RhdGljIGZyb21Qb3NpdGlvbnMoc3RhcnQsIGVuZCA9IHN0YXJ0KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydC5saW5lTnVtYmVyLCBzdGFydC5jb2x1bW4sIGVuZC5saW5lTnVtYmVyLCBlbmQuY29sdW1uKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBsaWZ0KHJhbmdlKSB7XHJcbiAgICAgICAgaWYgKCFyYW5nZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZS5zdGFydExpbmVOdW1iZXIsIHJhbmdlLnN0YXJ0Q29sdW1uLCByYW5nZS5lbmRMaW5lTnVtYmVyLCByYW5nZS5lbmRDb2x1bW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IGlmIGBvYmpgIGlzIGFuIGBJUmFuZ2VgLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNJUmFuZ2Uob2JqKSB7XHJcbiAgICAgICAgcmV0dXJuIChvYmpcclxuICAgICAgICAgICAgJiYgKHR5cGVvZiBvYmouc3RhcnRMaW5lTnVtYmVyID09PSAnbnVtYmVyJylcclxuICAgICAgICAgICAgJiYgKHR5cGVvZiBvYmouc3RhcnRDb2x1bW4gPT09ICdudW1iZXInKVxyXG4gICAgICAgICAgICAmJiAodHlwZW9mIG9iai5lbmRMaW5lTnVtYmVyID09PSAnbnVtYmVyJylcclxuICAgICAgICAgICAgJiYgKHR5cGVvZiBvYmouZW5kQ29sdW1uID09PSAnbnVtYmVyJykpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IGlmIHRoZSB0d28gcmFuZ2VzIGFyZSB0b3VjaGluZyBpbiBhbnkgd2F5LlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXJlSW50ZXJzZWN0aW5nT3JUb3VjaGluZyhhLCBiKSB7XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgYGFgIGlzIGJlZm9yZSBgYmBcclxuICAgICAgICBpZiAoYS5lbmRMaW5lTnVtYmVyIDwgYi5zdGFydExpbmVOdW1iZXIgfHwgKGEuZW5kTGluZU51bWJlciA9PT0gYi5zdGFydExpbmVOdW1iZXIgJiYgYS5lbmRDb2x1bW4gPCBiLnN0YXJ0Q29sdW1uKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIENoZWNrIGlmIGBiYCBpcyBiZWZvcmUgYGFgXHJcbiAgICAgICAgaWYgKGIuZW5kTGluZU51bWJlciA8IGEuc3RhcnRMaW5lTnVtYmVyIHx8IChiLmVuZExpbmVOdW1iZXIgPT09IGEuc3RhcnRMaW5lTnVtYmVyICYmIGIuZW5kQ29sdW1uIDwgYS5zdGFydENvbHVtbikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUaGVzZSByYW5nZXMgbXVzdCBpbnRlcnNlY3RcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiB0aGUgdHdvIHJhbmdlcyBhcmUgaW50ZXJzZWN0aW5nLiBJZiB0aGUgcmFuZ2VzIGFyZSB0b3VjaGluZyBpdCByZXR1cm5zIHRydWUuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhcmVJbnRlcnNlY3RpbmcoYSwgYikge1xyXG4gICAgICAgIC8vIENoZWNrIGlmIGBhYCBpcyBiZWZvcmUgYGJgXHJcbiAgICAgICAgaWYgKGEuZW5kTGluZU51bWJlciA8IGIuc3RhcnRMaW5lTnVtYmVyIHx8IChhLmVuZExpbmVOdW1iZXIgPT09IGIuc3RhcnRMaW5lTnVtYmVyICYmIGEuZW5kQ29sdW1uIDw9IGIuc3RhcnRDb2x1bW4pKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gQ2hlY2sgaWYgYGJgIGlzIGJlZm9yZSBgYWBcclxuICAgICAgICBpZiAoYi5lbmRMaW5lTnVtYmVyIDwgYS5zdGFydExpbmVOdW1iZXIgfHwgKGIuZW5kTGluZU51bWJlciA9PT0gYS5zdGFydExpbmVOdW1iZXIgJiYgYi5lbmRDb2x1bW4gPD0gYS5zdGFydENvbHVtbikpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUaGVzZSByYW5nZXMgbXVzdCBpbnRlcnNlY3RcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQSBmdW5jdGlvbiB0aGF0IGNvbXBhcmVzIHJhbmdlcywgdXNlZnVsIGZvciBzb3J0aW5nIHJhbmdlc1xyXG4gICAgICogSXQgd2lsbCBmaXJzdCBjb21wYXJlIHJhbmdlcyBvbiB0aGUgc3RhcnRQb3NpdGlvbiBhbmQgdGhlbiBvbiB0aGUgZW5kUG9zaXRpb25cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGNvbXBhcmVSYW5nZXNVc2luZ1N0YXJ0cyhhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgJiYgYikge1xyXG4gICAgICAgICAgICBjb25zdCBhU3RhcnRMaW5lTnVtYmVyID0gYS5zdGFydExpbmVOdW1iZXIgfCAwO1xyXG4gICAgICAgICAgICBjb25zdCBiU3RhcnRMaW5lTnVtYmVyID0gYi5zdGFydExpbmVOdW1iZXIgfCAwO1xyXG4gICAgICAgICAgICBpZiAoYVN0YXJ0TGluZU51bWJlciA9PT0gYlN0YXJ0TGluZU51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYVN0YXJ0Q29sdW1uID0gYS5zdGFydENvbHVtbiB8IDA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBiU3RhcnRDb2x1bW4gPSBiLnN0YXJ0Q29sdW1uIHwgMDtcclxuICAgICAgICAgICAgICAgIGlmIChhU3RhcnRDb2x1bW4gPT09IGJTdGFydENvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFFbmRMaW5lTnVtYmVyID0gYS5lbmRMaW5lTnVtYmVyIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBiRW5kTGluZU51bWJlciA9IGIuZW5kTGluZU51bWJlciB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFFbmRMaW5lTnVtYmVyID09PSBiRW5kTGluZU51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhRW5kQ29sdW1uID0gYS5lbmRDb2x1bW4gfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiRW5kQ29sdW1uID0gYi5lbmRDb2x1bW4gfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYUVuZENvbHVtbiAtIGJFbmRDb2x1bW47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhRW5kTGluZU51bWJlciAtIGJFbmRMaW5lTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFTdGFydENvbHVtbiAtIGJTdGFydENvbHVtbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYVN0YXJ0TGluZU51bWJlciAtIGJTdGFydExpbmVOdW1iZXI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFFeGlzdHMgPSAoYSA/IDEgOiAwKTtcclxuICAgICAgICBjb25zdCBiRXhpc3RzID0gKGIgPyAxIDogMCk7XHJcbiAgICAgICAgcmV0dXJuIGFFeGlzdHMgLSBiRXhpc3RzO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBBIGZ1bmN0aW9uIHRoYXQgY29tcGFyZXMgcmFuZ2VzLCB1c2VmdWwgZm9yIHNvcnRpbmcgcmFuZ2VzXHJcbiAgICAgKiBJdCB3aWxsIGZpcnN0IGNvbXBhcmUgcmFuZ2VzIG9uIHRoZSBlbmRQb3NpdGlvbiBhbmQgdGhlbiBvbiB0aGUgc3RhcnRQb3NpdGlvblxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY29tcGFyZVJhbmdlc1VzaW5nRW5kcyhhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEuZW5kTGluZU51bWJlciA9PT0gYi5lbmRMaW5lTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGlmIChhLmVuZENvbHVtbiA9PT0gYi5lbmRDb2x1bW4pIHtcclxuICAgICAgICAgICAgICAgIGlmIChhLnN0YXJ0TGluZU51bWJlciA9PT0gYi5zdGFydExpbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYS5zdGFydENvbHVtbiAtIGIuc3RhcnRDb2x1bW47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5zdGFydExpbmVOdW1iZXIgLSBiLnN0YXJ0TGluZU51bWJlcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gYS5lbmRDb2x1bW4gLSBiLmVuZENvbHVtbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGEuZW5kTGluZU51bWJlciAtIGIuZW5kTGluZU51bWJlcjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGVzdCBpZiB0aGUgcmFuZ2Ugc3BhbnMgbXVsdGlwbGUgbGluZXMuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzcGFuc011bHRpcGxlTGluZXMocmFuZ2UpIHtcclxuICAgICAgICByZXR1cm4gcmFuZ2UuZW5kTGluZU51bWJlciA+IHJhbmdlLnN0YXJ0TGluZU51bWJlcjtcclxuICAgIH1cclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCB7IExjc0RpZmYgfSBmcm9tICcuLi8uLi8uLi9iYXNlL2NvbW1vbi9kaWZmL2RpZmYuanMnO1xyXG5pbXBvcnQgKiBhcyBzdHJpbmdzIGZyb20gJy4uLy4uLy4uL2Jhc2UvY29tbW9uL3N0cmluZ3MuanMnO1xyXG5jb25zdCBNSU5JTVVNX01BVENISU5HX0NIQVJBQ1RFUl9MRU5HVEggPSAzO1xyXG5mdW5jdGlvbiBjb21wdXRlRGlmZihvcmlnaW5hbFNlcXVlbmNlLCBtb2RpZmllZFNlcXVlbmNlLCBjb250aW51ZVByb2Nlc3NpbmdQcmVkaWNhdGUsIHByZXR0eSkge1xyXG4gICAgY29uc3QgZGlmZkFsZ28gPSBuZXcgTGNzRGlmZihvcmlnaW5hbFNlcXVlbmNlLCBtb2RpZmllZFNlcXVlbmNlLCBjb250aW51ZVByb2Nlc3NpbmdQcmVkaWNhdGUpO1xyXG4gICAgcmV0dXJuIGRpZmZBbGdvLkNvbXB1dGVEaWZmKHByZXR0eSk7XHJcbn1cclxuY2xhc3MgTGluZVNlcXVlbmNlIHtcclxuICAgIGNvbnN0cnVjdG9yKGxpbmVzKSB7XHJcbiAgICAgICAgY29uc3Qgc3RhcnRDb2x1bW5zID0gW107XHJcbiAgICAgICAgY29uc3QgZW5kQ29sdW1ucyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSBsaW5lcy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBzdGFydENvbHVtbnNbaV0gPSBnZXRGaXJzdE5vbkJsYW5rQ29sdW1uKGxpbmVzW2ldLCAxKTtcclxuICAgICAgICAgICAgZW5kQ29sdW1uc1tpXSA9IGdldExhc3ROb25CbGFua0NvbHVtbihsaW5lc1tpXSwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubGluZXMgPSBsaW5lcztcclxuICAgICAgICB0aGlzLl9zdGFydENvbHVtbnMgPSBzdGFydENvbHVtbnM7XHJcbiAgICAgICAgdGhpcy5fZW5kQ29sdW1ucyA9IGVuZENvbHVtbnM7XHJcbiAgICB9XHJcbiAgICBnZXRFbGVtZW50cygpIHtcclxuICAgICAgICBjb25zdCBlbGVtZW50cyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB0aGlzLmxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnRzW2ldID0gdGhpcy5saW5lc1tpXS5zdWJzdHJpbmcodGhpcy5fc3RhcnRDb2x1bW5zW2ldIC0gMSwgdGhpcy5fZW5kQ29sdW1uc1tpXSAtIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZWxlbWVudHM7XHJcbiAgICB9XHJcbiAgICBnZXRTdGFydExpbmVOdW1iZXIoaSkge1xyXG4gICAgICAgIHJldHVybiBpICsgMTtcclxuICAgIH1cclxuICAgIGdldEVuZExpbmVOdW1iZXIoaSkge1xyXG4gICAgICAgIHJldHVybiBpICsgMTtcclxuICAgIH1cclxuICAgIGNyZWF0ZUNoYXJTZXF1ZW5jZShzaG91bGRJZ25vcmVUcmltV2hpdGVzcGFjZSwgc3RhcnRJbmRleCwgZW5kSW5kZXgpIHtcclxuICAgICAgICBjb25zdCBjaGFyQ29kZXMgPSBbXTtcclxuICAgICAgICBjb25zdCBsaW5lTnVtYmVycyA9IFtdO1xyXG4gICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbXTtcclxuICAgICAgICBsZXQgbGVuID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IHN0YXJ0SW5kZXg7IGluZGV4IDw9IGVuZEluZGV4OyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmVDb250ZW50ID0gdGhpcy5saW5lc1tpbmRleF07XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0Q29sdW1uID0gKHNob3VsZElnbm9yZVRyaW1XaGl0ZXNwYWNlID8gdGhpcy5fc3RhcnRDb2x1bW5zW2luZGV4XSA6IDEpO1xyXG4gICAgICAgICAgICBjb25zdCBlbmRDb2x1bW4gPSAoc2hvdWxkSWdub3JlVHJpbVdoaXRlc3BhY2UgPyB0aGlzLl9lbmRDb2x1bW5zW2luZGV4XSA6IGxpbmVDb250ZW50Lmxlbmd0aCArIDEpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjb2wgPSBzdGFydENvbHVtbjsgY29sIDwgZW5kQ29sdW1uOyBjb2wrKykge1xyXG4gICAgICAgICAgICAgICAgY2hhckNvZGVzW2xlbl0gPSBsaW5lQ29udGVudC5jaGFyQ29kZUF0KGNvbCAtIDEpO1xyXG4gICAgICAgICAgICAgICAgbGluZU51bWJlcnNbbGVuXSA9IGluZGV4ICsgMTtcclxuICAgICAgICAgICAgICAgIGNvbHVtbnNbbGVuXSA9IGNvbDtcclxuICAgICAgICAgICAgICAgIGxlbisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgQ2hhclNlcXVlbmNlKGNoYXJDb2RlcywgbGluZU51bWJlcnMsIGNvbHVtbnMpO1xyXG4gICAgfVxyXG59XHJcbmNsYXNzIENoYXJTZXF1ZW5jZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihjaGFyQ29kZXMsIGxpbmVOdW1iZXJzLCBjb2x1bW5zKSB7XHJcbiAgICAgICAgdGhpcy5fY2hhckNvZGVzID0gY2hhckNvZGVzO1xyXG4gICAgICAgIHRoaXMuX2xpbmVOdW1iZXJzID0gbGluZU51bWJlcnM7XHJcbiAgICAgICAgdGhpcy5fY29sdW1ucyA9IGNvbHVtbnM7XHJcbiAgICB9XHJcbiAgICBnZXRFbGVtZW50cygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2hhckNvZGVzO1xyXG4gICAgfVxyXG4gICAgZ2V0U3RhcnRMaW5lTnVtYmVyKGkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGluZU51bWJlcnNbaV07XHJcbiAgICB9XHJcbiAgICBnZXRTdGFydENvbHVtbihpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbHVtbnNbaV07XHJcbiAgICB9XHJcbiAgICBnZXRFbmRMaW5lTnVtYmVyKGkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGluZU51bWJlcnNbaV07XHJcbiAgICB9XHJcbiAgICBnZXRFbmRDb2x1bW4oaSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb2x1bW5zW2ldICsgMTtcclxuICAgIH1cclxufVxyXG5jbGFzcyBDaGFyQ2hhbmdlIHtcclxuICAgIGNvbnN0cnVjdG9yKG9yaWdpbmFsU3RhcnRMaW5lTnVtYmVyLCBvcmlnaW5hbFN0YXJ0Q29sdW1uLCBvcmlnaW5hbEVuZExpbmVOdW1iZXIsIG9yaWdpbmFsRW5kQ29sdW1uLCBtb2RpZmllZFN0YXJ0TGluZU51bWJlciwgbW9kaWZpZWRTdGFydENvbHVtbiwgbW9kaWZpZWRFbmRMaW5lTnVtYmVyLCBtb2RpZmllZEVuZENvbHVtbikge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxTdGFydExpbmVOdW1iZXIgPSBvcmlnaW5hbFN0YXJ0TGluZU51bWJlcjtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsU3RhcnRDb2x1bW4gPSBvcmlnaW5hbFN0YXJ0Q29sdW1uO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxFbmRMaW5lTnVtYmVyID0gb3JpZ2luYWxFbmRMaW5lTnVtYmVyO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxFbmRDb2x1bW4gPSBvcmlnaW5hbEVuZENvbHVtbjtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkU3RhcnRMaW5lTnVtYmVyID0gbW9kaWZpZWRTdGFydExpbmVOdW1iZXI7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZFN0YXJ0Q29sdW1uID0gbW9kaWZpZWRTdGFydENvbHVtbjtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkRW5kTGluZU51bWJlciA9IG1vZGlmaWVkRW5kTGluZU51bWJlcjtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkRW5kQ29sdW1uID0gbW9kaWZpZWRFbmRDb2x1bW47XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgY3JlYXRlRnJvbURpZmZDaGFuZ2UoZGlmZkNoYW5nZSwgb3JpZ2luYWxDaGFyU2VxdWVuY2UsIG1vZGlmaWVkQ2hhclNlcXVlbmNlKSB7XHJcbiAgICAgICAgbGV0IG9yaWdpbmFsU3RhcnRMaW5lTnVtYmVyO1xyXG4gICAgICAgIGxldCBvcmlnaW5hbFN0YXJ0Q29sdW1uO1xyXG4gICAgICAgIGxldCBvcmlnaW5hbEVuZExpbmVOdW1iZXI7XHJcbiAgICAgICAgbGV0IG9yaWdpbmFsRW5kQ29sdW1uO1xyXG4gICAgICAgIGxldCBtb2RpZmllZFN0YXJ0TGluZU51bWJlcjtcclxuICAgICAgICBsZXQgbW9kaWZpZWRTdGFydENvbHVtbjtcclxuICAgICAgICBsZXQgbW9kaWZpZWRFbmRMaW5lTnVtYmVyO1xyXG4gICAgICAgIGxldCBtb2RpZmllZEVuZENvbHVtbjtcclxuICAgICAgICBpZiAoZGlmZkNoYW5nZS5vcmlnaW5hbExlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBvcmlnaW5hbFN0YXJ0TGluZU51bWJlciA9IDA7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsU3RhcnRDb2x1bW4gPSAwO1xyXG4gICAgICAgICAgICBvcmlnaW5hbEVuZExpbmVOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICBvcmlnaW5hbEVuZENvbHVtbiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBvcmlnaW5hbFN0YXJ0TGluZU51bWJlciA9IG9yaWdpbmFsQ2hhclNlcXVlbmNlLmdldFN0YXJ0TGluZU51bWJlcihkaWZmQ2hhbmdlLm9yaWdpbmFsU3RhcnQpO1xyXG4gICAgICAgICAgICBvcmlnaW5hbFN0YXJ0Q29sdW1uID0gb3JpZ2luYWxDaGFyU2VxdWVuY2UuZ2V0U3RhcnRDb2x1bW4oZGlmZkNoYW5nZS5vcmlnaW5hbFN0YXJ0KTtcclxuICAgICAgICAgICAgb3JpZ2luYWxFbmRMaW5lTnVtYmVyID0gb3JpZ2luYWxDaGFyU2VxdWVuY2UuZ2V0RW5kTGluZU51bWJlcihkaWZmQ2hhbmdlLm9yaWdpbmFsU3RhcnQgKyBkaWZmQ2hhbmdlLm9yaWdpbmFsTGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsRW5kQ29sdW1uID0gb3JpZ2luYWxDaGFyU2VxdWVuY2UuZ2V0RW5kQ29sdW1uKGRpZmZDaGFuZ2Uub3JpZ2luYWxTdGFydCArIGRpZmZDaGFuZ2Uub3JpZ2luYWxMZW5ndGggLSAxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpZmZDaGFuZ2UubW9kaWZpZWRMZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgbW9kaWZpZWRTdGFydExpbmVOdW1iZXIgPSAwO1xyXG4gICAgICAgICAgICBtb2RpZmllZFN0YXJ0Q29sdW1uID0gMDtcclxuICAgICAgICAgICAgbW9kaWZpZWRFbmRMaW5lTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgbW9kaWZpZWRFbmRDb2x1bW4gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbW9kaWZpZWRTdGFydExpbmVOdW1iZXIgPSBtb2RpZmllZENoYXJTZXF1ZW5jZS5nZXRTdGFydExpbmVOdW1iZXIoZGlmZkNoYW5nZS5tb2RpZmllZFN0YXJ0KTtcclxuICAgICAgICAgICAgbW9kaWZpZWRTdGFydENvbHVtbiA9IG1vZGlmaWVkQ2hhclNlcXVlbmNlLmdldFN0YXJ0Q29sdW1uKGRpZmZDaGFuZ2UubW9kaWZpZWRTdGFydCk7XHJcbiAgICAgICAgICAgIG1vZGlmaWVkRW5kTGluZU51bWJlciA9IG1vZGlmaWVkQ2hhclNlcXVlbmNlLmdldEVuZExpbmVOdW1iZXIoZGlmZkNoYW5nZS5tb2RpZmllZFN0YXJ0ICsgZGlmZkNoYW5nZS5tb2RpZmllZExlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBtb2RpZmllZEVuZENvbHVtbiA9IG1vZGlmaWVkQ2hhclNlcXVlbmNlLmdldEVuZENvbHVtbihkaWZmQ2hhbmdlLm1vZGlmaWVkU3RhcnQgKyBkaWZmQ2hhbmdlLm1vZGlmaWVkTGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgQ2hhckNoYW5nZShvcmlnaW5hbFN0YXJ0TGluZU51bWJlciwgb3JpZ2luYWxTdGFydENvbHVtbiwgb3JpZ2luYWxFbmRMaW5lTnVtYmVyLCBvcmlnaW5hbEVuZENvbHVtbiwgbW9kaWZpZWRTdGFydExpbmVOdW1iZXIsIG1vZGlmaWVkU3RhcnRDb2x1bW4sIG1vZGlmaWVkRW5kTGluZU51bWJlciwgbW9kaWZpZWRFbmRDb2x1bW4pO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIHBvc3RQcm9jZXNzQ2hhckNoYW5nZXMocmF3Q2hhbmdlcykge1xyXG4gICAgaWYgKHJhd0NoYW5nZXMubGVuZ3RoIDw9IDEpIHtcclxuICAgICAgICByZXR1cm4gcmF3Q2hhbmdlcztcclxuICAgIH1cclxuICAgIGNvbnN0IHJlc3VsdCA9IFtyYXdDaGFuZ2VzWzBdXTtcclxuICAgIGxldCBwcmV2Q2hhbmdlID0gcmVzdWx0WzBdO1xyXG4gICAgZm9yIChsZXQgaSA9IDEsIGxlbiA9IHJhd0NoYW5nZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICBjb25zdCBjdXJyQ2hhbmdlID0gcmF3Q2hhbmdlc1tpXTtcclxuICAgICAgICBjb25zdCBvcmlnaW5hbE1hdGNoaW5nTGVuZ3RoID0gY3VyckNoYW5nZS5vcmlnaW5hbFN0YXJ0IC0gKHByZXZDaGFuZ2Uub3JpZ2luYWxTdGFydCArIHByZXZDaGFuZ2Uub3JpZ2luYWxMZW5ndGgpO1xyXG4gICAgICAgIGNvbnN0IG1vZGlmaWVkTWF0Y2hpbmdMZW5ndGggPSBjdXJyQ2hhbmdlLm1vZGlmaWVkU3RhcnQgLSAocHJldkNoYW5nZS5tb2RpZmllZFN0YXJ0ICsgcHJldkNoYW5nZS5tb2RpZmllZExlbmd0aCk7XHJcbiAgICAgICAgLy8gQm90aCBvZiB0aGUgYWJvdmUgc2hvdWxkIGJlIGVxdWFsLCBidXQgdGhlIGNvbnRpbnVlUHJvY2Vzc2luZ1ByZWRpY2F0ZSBtYXkgcHJldmVudCB0aGlzIGZyb20gYmVpbmcgdHJ1ZVxyXG4gICAgICAgIGNvbnN0IG1hdGNoaW5nTGVuZ3RoID0gTWF0aC5taW4ob3JpZ2luYWxNYXRjaGluZ0xlbmd0aCwgbW9kaWZpZWRNYXRjaGluZ0xlbmd0aCk7XHJcbiAgICAgICAgaWYgKG1hdGNoaW5nTGVuZ3RoIDwgTUlOSU1VTV9NQVRDSElOR19DSEFSQUNURVJfTEVOR1RIKSB7XHJcbiAgICAgICAgICAgIC8vIE1lcmdlIHRoZSBjdXJyZW50IGNoYW5nZSBpbnRvIHRoZSBwcmV2aW91cyBvbmVcclxuICAgICAgICAgICAgcHJldkNoYW5nZS5vcmlnaW5hbExlbmd0aCA9IChjdXJyQ2hhbmdlLm9yaWdpbmFsU3RhcnQgKyBjdXJyQ2hhbmdlLm9yaWdpbmFsTGVuZ3RoKSAtIHByZXZDaGFuZ2Uub3JpZ2luYWxTdGFydDtcclxuICAgICAgICAgICAgcHJldkNoYW5nZS5tb2RpZmllZExlbmd0aCA9IChjdXJyQ2hhbmdlLm1vZGlmaWVkU3RhcnQgKyBjdXJyQ2hhbmdlLm1vZGlmaWVkTGVuZ3RoKSAtIHByZXZDaGFuZ2UubW9kaWZpZWRTdGFydDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgY3VycmVudCBjaGFuZ2VcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2goY3VyckNoYW5nZSk7XHJcbiAgICAgICAgICAgIHByZXZDaGFuZ2UgPSBjdXJyQ2hhbmdlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuY2xhc3MgTGluZUNoYW5nZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcmlnaW5hbFN0YXJ0TGluZU51bWJlciwgb3JpZ2luYWxFbmRMaW5lTnVtYmVyLCBtb2RpZmllZFN0YXJ0TGluZU51bWJlciwgbW9kaWZpZWRFbmRMaW5lTnVtYmVyLCBjaGFyQ2hhbmdlcykge1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxTdGFydExpbmVOdW1iZXIgPSBvcmlnaW5hbFN0YXJ0TGluZU51bWJlcjtcclxuICAgICAgICB0aGlzLm9yaWdpbmFsRW5kTGluZU51bWJlciA9IG9yaWdpbmFsRW5kTGluZU51bWJlcjtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkU3RhcnRMaW5lTnVtYmVyID0gbW9kaWZpZWRTdGFydExpbmVOdW1iZXI7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZEVuZExpbmVOdW1iZXIgPSBtb2RpZmllZEVuZExpbmVOdW1iZXI7XHJcbiAgICAgICAgdGhpcy5jaGFyQ2hhbmdlcyA9IGNoYXJDaGFuZ2VzO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGNyZWF0ZUZyb21EaWZmUmVzdWx0KHNob3VsZElnbm9yZVRyaW1XaGl0ZXNwYWNlLCBkaWZmQ2hhbmdlLCBvcmlnaW5hbExpbmVTZXF1ZW5jZSwgbW9kaWZpZWRMaW5lU2VxdWVuY2UsIGNvbnRpbnVlQ2hhckRpZmYsIHNob3VsZENvbXB1dGVDaGFyQ2hhbmdlcywgc2hvdWxkUG9zdFByb2Nlc3NDaGFyQ2hhbmdlcykge1xyXG4gICAgICAgIGxldCBvcmlnaW5hbFN0YXJ0TGluZU51bWJlcjtcclxuICAgICAgICBsZXQgb3JpZ2luYWxFbmRMaW5lTnVtYmVyO1xyXG4gICAgICAgIGxldCBtb2RpZmllZFN0YXJ0TGluZU51bWJlcjtcclxuICAgICAgICBsZXQgbW9kaWZpZWRFbmRMaW5lTnVtYmVyO1xyXG4gICAgICAgIGxldCBjaGFyQ2hhbmdlcyA9IHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAoZGlmZkNoYW5nZS5vcmlnaW5hbExlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBvcmlnaW5hbFN0YXJ0TGluZU51bWJlciA9IG9yaWdpbmFsTGluZVNlcXVlbmNlLmdldFN0YXJ0TGluZU51bWJlcihkaWZmQ2hhbmdlLm9yaWdpbmFsU3RhcnQpIC0gMTtcclxuICAgICAgICAgICAgb3JpZ2luYWxFbmRMaW5lTnVtYmVyID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsU3RhcnRMaW5lTnVtYmVyID0gb3JpZ2luYWxMaW5lU2VxdWVuY2UuZ2V0U3RhcnRMaW5lTnVtYmVyKGRpZmZDaGFuZ2Uub3JpZ2luYWxTdGFydCk7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsRW5kTGluZU51bWJlciA9IG9yaWdpbmFsTGluZVNlcXVlbmNlLmdldEVuZExpbmVOdW1iZXIoZGlmZkNoYW5nZS5vcmlnaW5hbFN0YXJ0ICsgZGlmZkNoYW5nZS5vcmlnaW5hbExlbmd0aCAtIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGlmZkNoYW5nZS5tb2RpZmllZExlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBtb2RpZmllZFN0YXJ0TGluZU51bWJlciA9IG1vZGlmaWVkTGluZVNlcXVlbmNlLmdldFN0YXJ0TGluZU51bWJlcihkaWZmQ2hhbmdlLm1vZGlmaWVkU3RhcnQpIC0gMTtcclxuICAgICAgICAgICAgbW9kaWZpZWRFbmRMaW5lTnVtYmVyID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG1vZGlmaWVkU3RhcnRMaW5lTnVtYmVyID0gbW9kaWZpZWRMaW5lU2VxdWVuY2UuZ2V0U3RhcnRMaW5lTnVtYmVyKGRpZmZDaGFuZ2UubW9kaWZpZWRTdGFydCk7XHJcbiAgICAgICAgICAgIG1vZGlmaWVkRW5kTGluZU51bWJlciA9IG1vZGlmaWVkTGluZVNlcXVlbmNlLmdldEVuZExpbmVOdW1iZXIoZGlmZkNoYW5nZS5tb2RpZmllZFN0YXJ0ICsgZGlmZkNoYW5nZS5tb2RpZmllZExlbmd0aCAtIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc2hvdWxkQ29tcHV0ZUNoYXJDaGFuZ2VzICYmIGRpZmZDaGFuZ2Uub3JpZ2luYWxMZW5ndGggPiAwICYmIGRpZmZDaGFuZ2Uub3JpZ2luYWxMZW5ndGggPCAyMCAmJiBkaWZmQ2hhbmdlLm1vZGlmaWVkTGVuZ3RoID4gMCAmJiBkaWZmQ2hhbmdlLm1vZGlmaWVkTGVuZ3RoIDwgMjAgJiYgY29udGludWVDaGFyRGlmZigpKSB7XHJcbiAgICAgICAgICAgIC8vIENvbXB1dGUgY2hhcmFjdGVyIGNoYW5nZXMgZm9yIGRpZmYgY2h1bmtzIG9mIGF0IG1vc3QgMjAgbGluZXMuLi5cclxuICAgICAgICAgICAgY29uc3Qgb3JpZ2luYWxDaGFyU2VxdWVuY2UgPSBvcmlnaW5hbExpbmVTZXF1ZW5jZS5jcmVhdGVDaGFyU2VxdWVuY2Uoc2hvdWxkSWdub3JlVHJpbVdoaXRlc3BhY2UsIGRpZmZDaGFuZ2Uub3JpZ2luYWxTdGFydCwgZGlmZkNoYW5nZS5vcmlnaW5hbFN0YXJ0ICsgZGlmZkNoYW5nZS5vcmlnaW5hbExlbmd0aCAtIDEpO1xyXG4gICAgICAgICAgICBjb25zdCBtb2RpZmllZENoYXJTZXF1ZW5jZSA9IG1vZGlmaWVkTGluZVNlcXVlbmNlLmNyZWF0ZUNoYXJTZXF1ZW5jZShzaG91bGRJZ25vcmVUcmltV2hpdGVzcGFjZSwgZGlmZkNoYW5nZS5tb2RpZmllZFN0YXJ0LCBkaWZmQ2hhbmdlLm1vZGlmaWVkU3RhcnQgKyBkaWZmQ2hhbmdlLm1vZGlmaWVkTGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgICAgIGxldCByYXdDaGFuZ2VzID0gY29tcHV0ZURpZmYob3JpZ2luYWxDaGFyU2VxdWVuY2UsIG1vZGlmaWVkQ2hhclNlcXVlbmNlLCBjb250aW51ZUNoYXJEaWZmLCB0cnVlKS5jaGFuZ2VzO1xyXG4gICAgICAgICAgICBpZiAoc2hvdWxkUG9zdFByb2Nlc3NDaGFyQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAgICAgcmF3Q2hhbmdlcyA9IHBvc3RQcm9jZXNzQ2hhckNoYW5nZXMocmF3Q2hhbmdlcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hhckNoYW5nZXMgPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHJhd0NoYW5nZXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGNoYXJDaGFuZ2VzLnB1c2goQ2hhckNoYW5nZS5jcmVhdGVGcm9tRGlmZkNoYW5nZShyYXdDaGFuZ2VzW2ldLCBvcmlnaW5hbENoYXJTZXF1ZW5jZSwgbW9kaWZpZWRDaGFyU2VxdWVuY2UpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IExpbmVDaGFuZ2Uob3JpZ2luYWxTdGFydExpbmVOdW1iZXIsIG9yaWdpbmFsRW5kTGluZU51bWJlciwgbW9kaWZpZWRTdGFydExpbmVOdW1iZXIsIG1vZGlmaWVkRW5kTGluZU51bWJlciwgY2hhckNoYW5nZXMpO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBEaWZmQ29tcHV0ZXIge1xyXG4gICAgY29uc3RydWN0b3Iob3JpZ2luYWxMaW5lcywgbW9kaWZpZWRMaW5lcywgb3B0cykge1xyXG4gICAgICAgIHRoaXMuc2hvdWxkQ29tcHV0ZUNoYXJDaGFuZ2VzID0gb3B0cy5zaG91bGRDb21wdXRlQ2hhckNoYW5nZXM7XHJcbiAgICAgICAgdGhpcy5zaG91bGRQb3N0UHJvY2Vzc0NoYXJDaGFuZ2VzID0gb3B0cy5zaG91bGRQb3N0UHJvY2Vzc0NoYXJDaGFuZ2VzO1xyXG4gICAgICAgIHRoaXMuc2hvdWxkSWdub3JlVHJpbVdoaXRlc3BhY2UgPSBvcHRzLnNob3VsZElnbm9yZVRyaW1XaGl0ZXNwYWNlO1xyXG4gICAgICAgIHRoaXMuc2hvdWxkTWFrZVByZXR0eURpZmYgPSBvcHRzLnNob3VsZE1ha2VQcmV0dHlEaWZmO1xyXG4gICAgICAgIHRoaXMub3JpZ2luYWxMaW5lcyA9IG9yaWdpbmFsTGluZXM7XHJcbiAgICAgICAgdGhpcy5tb2RpZmllZExpbmVzID0gbW9kaWZpZWRMaW5lcztcclxuICAgICAgICB0aGlzLm9yaWdpbmFsID0gbmV3IExpbmVTZXF1ZW5jZShvcmlnaW5hbExpbmVzKTtcclxuICAgICAgICB0aGlzLm1vZGlmaWVkID0gbmV3IExpbmVTZXF1ZW5jZShtb2RpZmllZExpbmVzKTtcclxuICAgICAgICB0aGlzLmNvbnRpbnVlTGluZURpZmYgPSBjcmVhdGVDb250aW51ZVByb2Nlc3NpbmdQcmVkaWNhdGUob3B0cy5tYXhDb21wdXRhdGlvblRpbWUpO1xyXG4gICAgICAgIHRoaXMuY29udGludWVDaGFyRGlmZiA9IGNyZWF0ZUNvbnRpbnVlUHJvY2Vzc2luZ1ByZWRpY2F0ZShvcHRzLm1heENvbXB1dGF0aW9uVGltZSA9PT0gMCA/IDAgOiBNYXRoLm1pbihvcHRzLm1heENvbXB1dGF0aW9uVGltZSwgNTAwMCkpOyAvLyBuZXZlciBydW4gYWZ0ZXIgNXMgZm9yIGNoYXJhY3RlciBjaGFuZ2VzLi4uXHJcbiAgICB9XHJcbiAgICBjb21wdXRlRGlmZigpIHtcclxuICAgICAgICBpZiAodGhpcy5vcmlnaW5hbC5saW5lcy5sZW5ndGggPT09IDEgJiYgdGhpcy5vcmlnaW5hbC5saW5lc1swXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgLy8gZW1wdHkgb3JpZ2luYWwgPT4gZmFzdCBwYXRoXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGlmaWVkLmxpbmVzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLm1vZGlmaWVkLmxpbmVzWzBdLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICBxdWl0RWFybHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZXM6IFtdXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBxdWl0RWFybHk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgY2hhbmdlczogW3tcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxTdGFydExpbmVOdW1iZXI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsRW5kTGluZU51bWJlcjogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRTdGFydExpbmVOdW1iZXI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkRW5kTGluZU51bWJlcjogdGhpcy5tb2RpZmllZC5saW5lcy5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJDaGFuZ2VzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkRW5kQ29sdW1uOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkRW5kTGluZU51bWJlcjogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RpZmllZFN0YXJ0Q29sdW1uOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkU3RhcnRMaW5lTnVtYmVyOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsRW5kQ29sdW1uOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsRW5kTGluZU51bWJlcjogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFN0YXJ0Q29sdW1uOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsU3RhcnRMaW5lTnVtYmVyOiAwXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1vZGlmaWVkLmxpbmVzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLm1vZGlmaWVkLmxpbmVzWzBdLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBlbXB0eSBtb2RpZmllZCA9PiBmYXN0IHBhdGhcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHF1aXRFYXJseTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBjaGFuZ2VzOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbFN0YXJ0TGluZU51bWJlcjogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxFbmRMaW5lTnVtYmVyOiB0aGlzLm9yaWdpbmFsLmxpbmVzLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRTdGFydExpbmVOdW1iZXI6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkRW5kTGluZU51bWJlcjogMSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hhckNoYW5nZXM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRFbmRDb2x1bW46IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRFbmRMaW5lTnVtYmVyOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkU3RhcnRDb2x1bW46IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRTdGFydExpbmVOdW1iZXI6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxFbmRDb2x1bW46IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxFbmRMaW5lTnVtYmVyOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsU3RhcnRDb2x1bW46IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxTdGFydExpbmVOdW1iZXI6IDBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGlmZlJlc3VsdCA9IGNvbXB1dGVEaWZmKHRoaXMub3JpZ2luYWwsIHRoaXMubW9kaWZpZWQsIHRoaXMuY29udGludWVMaW5lRGlmZiwgdGhpcy5zaG91bGRNYWtlUHJldHR5RGlmZik7XHJcbiAgICAgICAgY29uc3QgcmF3Q2hhbmdlcyA9IGRpZmZSZXN1bHQuY2hhbmdlcztcclxuICAgICAgICBjb25zdCBxdWl0RWFybHkgPSBkaWZmUmVzdWx0LnF1aXRFYXJseTtcclxuICAgICAgICAvLyBUaGUgZGlmZiBpcyBhbHdheXMgY29tcHV0ZWQgd2l0aCBpZ25vcmluZyB0cmltIHdoaXRlc3BhY2VcclxuICAgICAgICAvLyBUaGlzIGVuc3VyZXMgd2UgZ2V0IHRoZSBwcmV0dGllc3QgZGlmZlxyXG4gICAgICAgIGlmICh0aGlzLnNob3VsZElnbm9yZVRyaW1XaGl0ZXNwYWNlKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmVDaGFuZ2VzID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSByYXdDaGFuZ2VzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5lQ2hhbmdlcy5wdXNoKExpbmVDaGFuZ2UuY3JlYXRlRnJvbURpZmZSZXN1bHQodGhpcy5zaG91bGRJZ25vcmVUcmltV2hpdGVzcGFjZSwgcmF3Q2hhbmdlc1tpXSwgdGhpcy5vcmlnaW5hbCwgdGhpcy5tb2RpZmllZCwgdGhpcy5jb250aW51ZUNoYXJEaWZmLCB0aGlzLnNob3VsZENvbXB1dGVDaGFyQ2hhbmdlcywgdGhpcy5zaG91bGRQb3N0UHJvY2Vzc0NoYXJDaGFuZ2VzKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHF1aXRFYXJseTogcXVpdEVhcmx5LFxyXG4gICAgICAgICAgICAgICAgY2hhbmdlczogbGluZUNoYW5nZXNcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gTmVlZCB0byBwb3N0LXByb2Nlc3MgYW5kIGludHJvZHVjZSBjaGFuZ2VzIHdoZXJlIHRoZSB0cmltIHdoaXRlc3BhY2UgaXMgZGlmZmVyZW50XHJcbiAgICAgICAgLy8gTm90ZSB0aGF0IHdlIGFyZSBsb29waW5nIHN0YXJ0aW5nIGF0IC0xIHRvIGFsc28gY292ZXIgdGhlIGxpbmVzIGJlZm9yZSB0aGUgZmlyc3QgY2hhbmdlXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICAgICAgbGV0IG9yaWdpbmFsTGluZUluZGV4ID0gMDtcclxuICAgICAgICBsZXQgbW9kaWZpZWRMaW5lSW5kZXggPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAtMSAvKiAhISEhICovLCBsZW4gPSByYXdDaGFuZ2VzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5leHRDaGFuZ2UgPSAoaSArIDEgPCBsZW4gPyByYXdDaGFuZ2VzW2kgKyAxXSA6IG51bGwpO1xyXG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbFN0b3AgPSAobmV4dENoYW5nZSA/IG5leHRDaGFuZ2Uub3JpZ2luYWxTdGFydCA6IHRoaXMub3JpZ2luYWxMaW5lcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBjb25zdCBtb2RpZmllZFN0b3AgPSAobmV4dENoYW5nZSA/IG5leHRDaGFuZ2UubW9kaWZpZWRTdGFydCA6IHRoaXMubW9kaWZpZWRMaW5lcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB3aGlsZSAob3JpZ2luYWxMaW5lSW5kZXggPCBvcmlnaW5hbFN0b3AgJiYgbW9kaWZpZWRMaW5lSW5kZXggPCBtb2RpZmllZFN0b3ApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTGluZSA9IHRoaXMub3JpZ2luYWxMaW5lc1tvcmlnaW5hbExpbmVJbmRleF07XHJcbiAgICAgICAgICAgICAgICBjb25zdCBtb2RpZmllZExpbmUgPSB0aGlzLm1vZGlmaWVkTGluZXNbbW9kaWZpZWRMaW5lSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsTGluZSAhPT0gbW9kaWZpZWRMaW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlc2UgbGluZXMgZGlmZmVyIG9ubHkgaW4gdHJpbSB3aGl0ZXNwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgdGhlIGxlYWRpbmcgd2hpdGVzcGFjZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9yaWdpbmFsU3RhcnRDb2x1bW4gPSBnZXRGaXJzdE5vbkJsYW5rQ29sdW1uKG9yaWdpbmFsTGluZSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtb2RpZmllZFN0YXJ0Q29sdW1uID0gZ2V0Rmlyc3ROb25CbGFua0NvbHVtbihtb2RpZmllZExpbmUsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAob3JpZ2luYWxTdGFydENvbHVtbiA+IDEgJiYgbW9kaWZpZWRTdGFydENvbHVtbiA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQ2hhciA9IG9yaWdpbmFsTGluZS5jaGFyQ29kZUF0KG9yaWdpbmFsU3RhcnRDb2x1bW4gLSAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVkQ2hhciA9IG1vZGlmaWVkTGluZS5jaGFyQ29kZUF0KG1vZGlmaWVkU3RhcnRDb2x1bW4gLSAyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbENoYXIgIT09IG1vZGlmaWVkQ2hhcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxTdGFydENvbHVtbi0tO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9kaWZpZWRTdGFydENvbHVtbi0tO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbFN0YXJ0Q29sdW1uID4gMSB8fCBtb2RpZmllZFN0YXJ0Q29sdW1uID4gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHVzaFRyaW1XaGl0ZXNwYWNlQ2hhckNoYW5nZShyZXN1bHQsIG9yaWdpbmFsTGluZUluZGV4ICsgMSwgMSwgb3JpZ2luYWxTdGFydENvbHVtbiwgbW9kaWZpZWRMaW5lSW5kZXggKyAxLCAxLCBtb2RpZmllZFN0YXJ0Q29sdW1uKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB0aGUgdHJhaWxpbmcgd2hpdGVzcGFjZVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG9yaWdpbmFsRW5kQ29sdW1uID0gZ2V0TGFzdE5vbkJsYW5rQ29sdW1uKG9yaWdpbmFsTGluZSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBtb2RpZmllZEVuZENvbHVtbiA9IGdldExhc3ROb25CbGFua0NvbHVtbihtb2RpZmllZExpbmUsIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbE1heENvbHVtbiA9IG9yaWdpbmFsTGluZS5sZW5ndGggKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtb2RpZmllZE1heENvbHVtbiA9IG1vZGlmaWVkTGluZS5sZW5ndGggKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAob3JpZ2luYWxFbmRDb2x1bW4gPCBvcmlnaW5hbE1heENvbHVtbiAmJiBtb2RpZmllZEVuZENvbHVtbiA8IG1vZGlmaWVkTWF4Q29sdW1uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmlnaW5hbENoYXIgPSBvcmlnaW5hbExpbmUuY2hhckNvZGVBdChvcmlnaW5hbEVuZENvbHVtbiAtIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbW9kaWZpZWRDaGFyID0gb3JpZ2luYWxMaW5lLmNoYXJDb2RlQXQobW9kaWZpZWRFbmRDb2x1bW4gLSAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbENoYXIgIT09IG1vZGlmaWVkQ2hhcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxFbmRDb2x1bW4rKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGlmaWVkRW5kQ29sdW1uKys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9yaWdpbmFsRW5kQ29sdW1uIDwgb3JpZ2luYWxNYXhDb2x1bW4gfHwgbW9kaWZpZWRFbmRDb2x1bW4gPCBtb2RpZmllZE1heENvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHVzaFRyaW1XaGl0ZXNwYWNlQ2hhckNoYW5nZShyZXN1bHQsIG9yaWdpbmFsTGluZUluZGV4ICsgMSwgb3JpZ2luYWxFbmRDb2x1bW4sIG9yaWdpbmFsTWF4Q29sdW1uLCBtb2RpZmllZExpbmVJbmRleCArIDEsIG1vZGlmaWVkRW5kQ29sdW1uLCBtb2RpZmllZE1heENvbHVtbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbExpbmVJbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgbW9kaWZpZWRMaW5lSW5kZXgrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobmV4dENoYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gRW1pdCB0aGUgYWN0dWFsIGNoYW5nZVxyXG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goTGluZUNoYW5nZS5jcmVhdGVGcm9tRGlmZlJlc3VsdCh0aGlzLnNob3VsZElnbm9yZVRyaW1XaGl0ZXNwYWNlLCBuZXh0Q2hhbmdlLCB0aGlzLm9yaWdpbmFsLCB0aGlzLm1vZGlmaWVkLCB0aGlzLmNvbnRpbnVlQ2hhckRpZmYsIHRoaXMuc2hvdWxkQ29tcHV0ZUNoYXJDaGFuZ2VzLCB0aGlzLnNob3VsZFBvc3RQcm9jZXNzQ2hhckNoYW5nZXMpKTtcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsTGluZUluZGV4ICs9IG5leHRDaGFuZ2Uub3JpZ2luYWxMZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBtb2RpZmllZExpbmVJbmRleCArPSBuZXh0Q2hhbmdlLm1vZGlmaWVkTGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHF1aXRFYXJseTogcXVpdEVhcmx5LFxyXG4gICAgICAgICAgICBjaGFuZ2VzOiByZXN1bHRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgX3B1c2hUcmltV2hpdGVzcGFjZUNoYXJDaGFuZ2UocmVzdWx0LCBvcmlnaW5hbExpbmVOdW1iZXIsIG9yaWdpbmFsU3RhcnRDb2x1bW4sIG9yaWdpbmFsRW5kQ29sdW1uLCBtb2RpZmllZExpbmVOdW1iZXIsIG1vZGlmaWVkU3RhcnRDb2x1bW4sIG1vZGlmaWVkRW5kQ29sdW1uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX21lcmdlVHJpbVdoaXRlc3BhY2VDaGFyQ2hhbmdlKHJlc3VsdCwgb3JpZ2luYWxMaW5lTnVtYmVyLCBvcmlnaW5hbFN0YXJ0Q29sdW1uLCBvcmlnaW5hbEVuZENvbHVtbiwgbW9kaWZpZWRMaW5lTnVtYmVyLCBtb2RpZmllZFN0YXJ0Q29sdW1uLCBtb2RpZmllZEVuZENvbHVtbikpIHtcclxuICAgICAgICAgICAgLy8gTWVyZ2VkIGludG8gcHJldmlvdXNcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgY2hhckNoYW5nZXMgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkQ29tcHV0ZUNoYXJDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIGNoYXJDaGFuZ2VzID0gW25ldyBDaGFyQ2hhbmdlKG9yaWdpbmFsTGluZU51bWJlciwgb3JpZ2luYWxTdGFydENvbHVtbiwgb3JpZ2luYWxMaW5lTnVtYmVyLCBvcmlnaW5hbEVuZENvbHVtbiwgbW9kaWZpZWRMaW5lTnVtYmVyLCBtb2RpZmllZFN0YXJ0Q29sdW1uLCBtb2RpZmllZExpbmVOdW1iZXIsIG1vZGlmaWVkRW5kQ29sdW1uKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdC5wdXNoKG5ldyBMaW5lQ2hhbmdlKG9yaWdpbmFsTGluZU51bWJlciwgb3JpZ2luYWxMaW5lTnVtYmVyLCBtb2RpZmllZExpbmVOdW1iZXIsIG1vZGlmaWVkTGluZU51bWJlciwgY2hhckNoYW5nZXMpKTtcclxuICAgIH1cclxuICAgIF9tZXJnZVRyaW1XaGl0ZXNwYWNlQ2hhckNoYW5nZShyZXN1bHQsIG9yaWdpbmFsTGluZU51bWJlciwgb3JpZ2luYWxTdGFydENvbHVtbiwgb3JpZ2luYWxFbmRDb2x1bW4sIG1vZGlmaWVkTGluZU51bWJlciwgbW9kaWZpZWRTdGFydENvbHVtbiwgbW9kaWZpZWRFbmRDb2x1bW4pIHtcclxuICAgICAgICBjb25zdCBsZW4gPSByZXN1bHQubGVuZ3RoO1xyXG4gICAgICAgIGlmIChsZW4gPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBwcmV2Q2hhbmdlID0gcmVzdWx0W2xlbiAtIDFdO1xyXG4gICAgICAgIGlmIChwcmV2Q2hhbmdlLm9yaWdpbmFsRW5kTGluZU51bWJlciA9PT0gMCB8fCBwcmV2Q2hhbmdlLm1vZGlmaWVkRW5kTGluZU51bWJlciA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBEb24ndCBtZXJnZSB3aXRoIGluc2VydHMvZGVsZXRlc1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChwcmV2Q2hhbmdlLm9yaWdpbmFsRW5kTGluZU51bWJlciArIDEgPT09IG9yaWdpbmFsTGluZU51bWJlciAmJiBwcmV2Q2hhbmdlLm1vZGlmaWVkRW5kTGluZU51bWJlciArIDEgPT09IG1vZGlmaWVkTGluZU51bWJlcikge1xyXG4gICAgICAgICAgICBwcmV2Q2hhbmdlLm9yaWdpbmFsRW5kTGluZU51bWJlciA9IG9yaWdpbmFsTGluZU51bWJlcjtcclxuICAgICAgICAgICAgcHJldkNoYW5nZS5tb2RpZmllZEVuZExpbmVOdW1iZXIgPSBtb2RpZmllZExpbmVOdW1iZXI7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3VsZENvbXB1dGVDaGFyQ2hhbmdlcyAmJiBwcmV2Q2hhbmdlLmNoYXJDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICBwcmV2Q2hhbmdlLmNoYXJDaGFuZ2VzLnB1c2gobmV3IENoYXJDaGFuZ2Uob3JpZ2luYWxMaW5lTnVtYmVyLCBvcmlnaW5hbFN0YXJ0Q29sdW1uLCBvcmlnaW5hbExpbmVOdW1iZXIsIG9yaWdpbmFsRW5kQ29sdW1uLCBtb2RpZmllZExpbmVOdW1iZXIsIG1vZGlmaWVkU3RhcnRDb2x1bW4sIG1vZGlmaWVkTGluZU51bWJlciwgbW9kaWZpZWRFbmRDb2x1bW4pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmZ1bmN0aW9uIGdldEZpcnN0Tm9uQmxhbmtDb2x1bW4odHh0LCBkZWZhdWx0VmFsdWUpIHtcclxuICAgIGNvbnN0IHIgPSBzdHJpbmdzLmZpcnN0Tm9uV2hpdGVzcGFjZUluZGV4KHR4dCk7XHJcbiAgICBpZiAociA9PT0gLTEpIHtcclxuICAgICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHIgKyAxO1xyXG59XHJcbmZ1bmN0aW9uIGdldExhc3ROb25CbGFua0NvbHVtbih0eHQsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgY29uc3QgciA9IHN0cmluZ3MubGFzdE5vbldoaXRlc3BhY2VJbmRleCh0eHQpO1xyXG4gICAgaWYgKHIgPT09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiByICsgMjtcclxufVxyXG5mdW5jdGlvbiBjcmVhdGVDb250aW51ZVByb2Nlc3NpbmdQcmVkaWNhdGUobWF4aW11bVJ1bnRpbWUpIHtcclxuICAgIGlmIChtYXhpbXVtUnVudGltZSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAoKSA9PiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBzdGFydFRpbWUgPCBtYXhpbXVtUnVudGltZTtcclxuICAgIH07XHJcbn1cclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5leHBvcnQgZnVuY3Rpb24gdG9VaW50OCh2KSB7XHJcbiAgICBpZiAodiA8IDApIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGlmICh2ID4gMjU1IC8qIE1BWF9VSU5UXzggKi8pIHtcclxuICAgICAgICByZXR1cm4gMjU1IC8qIE1BWF9VSU5UXzggKi87XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdiB8IDA7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHRvVWludDMyKHYpIHtcclxuICAgIGlmICh2IDwgMCkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKHYgPiA0Mjk0OTY3Mjk1IC8qIE1BWF9VSU5UXzMyICovKSB7XHJcbiAgICAgICAgcmV0dXJuIDQyOTQ5NjcyOTUgLyogTUFYX1VJTlRfMzIgKi87XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdiB8IDA7XHJcbn1cclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5pbXBvcnQgeyB0b1VpbnQzMiB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvY29tbW9uL3VpbnQuanMnO1xyXG5leHBvcnQgY2xhc3MgUHJlZml4U3VtSW5kZXhPZlJlc3VsdCB7XHJcbiAgICBjb25zdHJ1Y3RvcihpbmRleCwgcmVtYWluZGVyKSB7XHJcbiAgICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHRoaXMucmVtYWluZGVyID0gcmVtYWluZGVyO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBQcmVmaXhTdW1Db21wdXRlciB7XHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZXMpIHtcclxuICAgICAgICB0aGlzLnZhbHVlcyA9IHZhbHVlcztcclxuICAgICAgICB0aGlzLnByZWZpeFN1bSA9IG5ldyBVaW50MzJBcnJheSh2YWx1ZXMubGVuZ3RoKTtcclxuICAgICAgICB0aGlzLnByZWZpeFN1bVZhbGlkSW5kZXggPSBuZXcgSW50MzJBcnJheSgxKTtcclxuICAgICAgICB0aGlzLnByZWZpeFN1bVZhbGlkSW5kZXhbMF0gPSAtMTtcclxuICAgIH1cclxuICAgIGluc2VydFZhbHVlcyhpbnNlcnRJbmRleCwgaW5zZXJ0VmFsdWVzKSB7XHJcbiAgICAgICAgaW5zZXJ0SW5kZXggPSB0b1VpbnQzMihpbnNlcnRJbmRleCk7XHJcbiAgICAgICAgY29uc3Qgb2xkVmFsdWVzID0gdGhpcy52YWx1ZXM7XHJcbiAgICAgICAgY29uc3Qgb2xkUHJlZml4U3VtID0gdGhpcy5wcmVmaXhTdW07XHJcbiAgICAgICAgY29uc3QgaW5zZXJ0VmFsdWVzTGVuID0gaW5zZXJ0VmFsdWVzLmxlbmd0aDtcclxuICAgICAgICBpZiAoaW5zZXJ0VmFsdWVzTGVuID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy52YWx1ZXMgPSBuZXcgVWludDMyQXJyYXkob2xkVmFsdWVzLmxlbmd0aCArIGluc2VydFZhbHVlc0xlbik7XHJcbiAgICAgICAgdGhpcy52YWx1ZXMuc2V0KG9sZFZhbHVlcy5zdWJhcnJheSgwLCBpbnNlcnRJbmRleCksIDApO1xyXG4gICAgICAgIHRoaXMudmFsdWVzLnNldChvbGRWYWx1ZXMuc3ViYXJyYXkoaW5zZXJ0SW5kZXgpLCBpbnNlcnRJbmRleCArIGluc2VydFZhbHVlc0xlbik7XHJcbiAgICAgICAgdGhpcy52YWx1ZXMuc2V0KGluc2VydFZhbHVlcywgaW5zZXJ0SW5kZXgpO1xyXG4gICAgICAgIGlmIChpbnNlcnRJbmRleCAtIDEgPCB0aGlzLnByZWZpeFN1bVZhbGlkSW5kZXhbMF0pIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVmaXhTdW1WYWxpZEluZGV4WzBdID0gaW5zZXJ0SW5kZXggLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnByZWZpeFN1bSA9IG5ldyBVaW50MzJBcnJheSh0aGlzLnZhbHVlcy5sZW5ndGgpO1xyXG4gICAgICAgIGlmICh0aGlzLnByZWZpeFN1bVZhbGlkSW5kZXhbMF0gPj0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnByZWZpeFN1bS5zZXQob2xkUHJlZml4U3VtLnN1YmFycmF5KDAsIHRoaXMucHJlZml4U3VtVmFsaWRJbmRleFswXSArIDEpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBjaGFuZ2VWYWx1ZShpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICBpbmRleCA9IHRvVWludDMyKGluZGV4KTtcclxuICAgICAgICB2YWx1ZSA9IHRvVWludDMyKHZhbHVlKTtcclxuICAgICAgICBpZiAodGhpcy52YWx1ZXNbaW5kZXhdID09PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmFsdWVzW2luZGV4XSA9IHZhbHVlO1xyXG4gICAgICAgIGlmIChpbmRleCAtIDEgPCB0aGlzLnByZWZpeFN1bVZhbGlkSW5kZXhbMF0pIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVmaXhTdW1WYWxpZEluZGV4WzBdID0gaW5kZXggLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJlbW92ZVZhbHVlcyhzdGFydEluZGV4LCBjbnQpIHtcclxuICAgICAgICBzdGFydEluZGV4ID0gdG9VaW50MzIoc3RhcnRJbmRleCk7XHJcbiAgICAgICAgY250ID0gdG9VaW50MzIoY250KTtcclxuICAgICAgICBjb25zdCBvbGRWYWx1ZXMgPSB0aGlzLnZhbHVlcztcclxuICAgICAgICBjb25zdCBvbGRQcmVmaXhTdW0gPSB0aGlzLnByZWZpeFN1bTtcclxuICAgICAgICBpZiAoc3RhcnRJbmRleCA+PSBvbGRWYWx1ZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IG1heENudCA9IG9sZFZhbHVlcy5sZW5ndGggLSBzdGFydEluZGV4O1xyXG4gICAgICAgIGlmIChjbnQgPj0gbWF4Q250KSB7XHJcbiAgICAgICAgICAgIGNudCA9IG1heENudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNudCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudmFsdWVzID0gbmV3IFVpbnQzMkFycmF5KG9sZFZhbHVlcy5sZW5ndGggLSBjbnQpO1xyXG4gICAgICAgIHRoaXMudmFsdWVzLnNldChvbGRWYWx1ZXMuc3ViYXJyYXkoMCwgc3RhcnRJbmRleCksIDApO1xyXG4gICAgICAgIHRoaXMudmFsdWVzLnNldChvbGRWYWx1ZXMuc3ViYXJyYXkoc3RhcnRJbmRleCArIGNudCksIHN0YXJ0SW5kZXgpO1xyXG4gICAgICAgIHRoaXMucHJlZml4U3VtID0gbmV3IFVpbnQzMkFycmF5KHRoaXMudmFsdWVzLmxlbmd0aCk7XHJcbiAgICAgICAgaWYgKHN0YXJ0SW5kZXggLSAxIDwgdGhpcy5wcmVmaXhTdW1WYWxpZEluZGV4WzBdKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlZml4U3VtVmFsaWRJbmRleFswXSA9IHN0YXJ0SW5kZXggLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5wcmVmaXhTdW1WYWxpZEluZGV4WzBdID49IDApIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVmaXhTdW0uc2V0KG9sZFByZWZpeFN1bS5zdWJhcnJheSgwLCB0aGlzLnByZWZpeFN1bVZhbGlkSW5kZXhbMF0gKyAxKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgZ2V0VG90YWxWYWx1ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy52YWx1ZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0QWNjdW11bGF0ZWRWYWx1ZSh0aGlzLnZhbHVlcy5sZW5ndGggLSAxKTtcclxuICAgIH1cclxuICAgIGdldEFjY3VtdWxhdGVkVmFsdWUoaW5kZXgpIHtcclxuICAgICAgICBpZiAoaW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmRleCA9IHRvVWludDMyKGluZGV4KTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0QWNjdW11bGF0ZWRWYWx1ZShpbmRleCk7XHJcbiAgICB9XHJcbiAgICBfZ2V0QWNjdW11bGF0ZWRWYWx1ZShpbmRleCkge1xyXG4gICAgICAgIGlmIChpbmRleCA8PSB0aGlzLnByZWZpeFN1bVZhbGlkSW5kZXhbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJlZml4U3VtW2luZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSB0aGlzLnByZWZpeFN1bVZhbGlkSW5kZXhbMF0gKyAxO1xyXG4gICAgICAgIGlmIChzdGFydEluZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucHJlZml4U3VtWzBdID0gdGhpcy52YWx1ZXNbMF07XHJcbiAgICAgICAgICAgIHN0YXJ0SW5kZXgrKztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGluZGV4ID49IHRoaXMudmFsdWVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMudmFsdWVzLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDw9IGluZGV4OyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5wcmVmaXhTdW1baV0gPSB0aGlzLnByZWZpeFN1bVtpIC0gMV0gKyB0aGlzLnZhbHVlc1tpXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wcmVmaXhTdW1WYWxpZEluZGV4WzBdID0gTWF0aC5tYXgodGhpcy5wcmVmaXhTdW1WYWxpZEluZGV4WzBdLCBpbmRleCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucHJlZml4U3VtW2luZGV4XTtcclxuICAgIH1cclxuICAgIGdldEluZGV4T2YoYWNjdW11bGF0ZWRWYWx1ZSkge1xyXG4gICAgICAgIGFjY3VtdWxhdGVkVmFsdWUgPSBNYXRoLmZsb29yKGFjY3VtdWxhdGVkVmFsdWUpOyAvL0BwZXJmXHJcbiAgICAgICAgLy8gQ29tcHV0ZSBhbGwgc3VtcyAodG8gZ2V0IGEgZnVsbHkgdmFsaWQgcHJlZml4U3VtKVxyXG4gICAgICAgIHRoaXMuZ2V0VG90YWxWYWx1ZSgpO1xyXG4gICAgICAgIGxldCBsb3cgPSAwO1xyXG4gICAgICAgIGxldCBoaWdoID0gdGhpcy52YWx1ZXMubGVuZ3RoIC0gMTtcclxuICAgICAgICBsZXQgbWlkID0gMDtcclxuICAgICAgICBsZXQgbWlkU3RvcCA9IDA7XHJcbiAgICAgICAgbGV0IG1pZFN0YXJ0ID0gMDtcclxuICAgICAgICB3aGlsZSAobG93IDw9IGhpZ2gpIHtcclxuICAgICAgICAgICAgbWlkID0gbG93ICsgKChoaWdoIC0gbG93KSAvIDIpIHwgMDtcclxuICAgICAgICAgICAgbWlkU3RvcCA9IHRoaXMucHJlZml4U3VtW21pZF07XHJcbiAgICAgICAgICAgIG1pZFN0YXJ0ID0gbWlkU3RvcCAtIHRoaXMudmFsdWVzW21pZF07XHJcbiAgICAgICAgICAgIGlmIChhY2N1bXVsYXRlZFZhbHVlIDwgbWlkU3RhcnQpIHtcclxuICAgICAgICAgICAgICAgIGhpZ2ggPSBtaWQgLSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGFjY3VtdWxhdGVkVmFsdWUgPj0gbWlkU3RvcCkge1xyXG4gICAgICAgICAgICAgICAgbG93ID0gbWlkICsgMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgUHJlZml4U3VtSW5kZXhPZlJlc3VsdChtaWQsIGFjY3VtdWxhdGVkVmFsdWUgLSBtaWRTdGFydCk7XHJcbiAgICB9XHJcbn1cclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5pbXBvcnQgeyBzcGxpdExpbmVzIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9jb21tb24vc3RyaW5ncy5qcyc7XHJcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi4vY29yZS9wb3NpdGlvbi5qcyc7XHJcbmltcG9ydCB7IFByZWZpeFN1bUNvbXB1dGVyIH0gZnJvbSAnLi4vdmlld01vZGVsL3ByZWZpeFN1bUNvbXB1dGVyLmpzJztcclxuZXhwb3J0IGNsYXNzIE1pcnJvclRleHRNb2RlbCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih1cmksIGxpbmVzLCBlb2wsIHZlcnNpb25JZCkge1xyXG4gICAgICAgIHRoaXMuX3VyaSA9IHVyaTtcclxuICAgICAgICB0aGlzLl9saW5lcyA9IGxpbmVzO1xyXG4gICAgICAgIHRoaXMuX2VvbCA9IGVvbDtcclxuICAgICAgICB0aGlzLl92ZXJzaW9uSWQgPSB2ZXJzaW9uSWQ7XHJcbiAgICAgICAgdGhpcy5fbGluZVN0YXJ0cyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVkVGV4dFZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5fbGluZXMubGVuZ3RoID0gMDtcclxuICAgIH1cclxuICAgIGdldCB2ZXJzaW9uKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92ZXJzaW9uSWQ7XHJcbiAgICB9XHJcbiAgICBnZXRUZXh0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWRUZXh0VmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fY2FjaGVkVGV4dFZhbHVlID0gdGhpcy5fbGluZXMuam9pbih0aGlzLl9lb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkVGV4dFZhbHVlO1xyXG4gICAgfVxyXG4gICAgb25FdmVudHMoZSkge1xyXG4gICAgICAgIGlmIChlLmVvbCAmJiBlLmVvbCAhPT0gdGhpcy5fZW9sKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VvbCA9IGUuZW9sO1xyXG4gICAgICAgICAgICB0aGlzLl9saW5lU3RhcnRzID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gVXBkYXRlIG15IGxpbmVzXHJcbiAgICAgICAgY29uc3QgY2hhbmdlcyA9IGUuY2hhbmdlcztcclxuICAgICAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2FjY2VwdERlbGV0ZVJhbmdlKGNoYW5nZS5yYW5nZSk7XHJcbiAgICAgICAgICAgIHRoaXMuX2FjY2VwdEluc2VydFRleHQobmV3IFBvc2l0aW9uKGNoYW5nZS5yYW5nZS5zdGFydExpbmVOdW1iZXIsIGNoYW5nZS5yYW5nZS5zdGFydENvbHVtbiksIGNoYW5nZS50ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fdmVyc2lvbklkID0gZS52ZXJzaW9uSWQ7XHJcbiAgICAgICAgdGhpcy5fY2FjaGVkVGV4dFZhbHVlID0gbnVsbDtcclxuICAgIH1cclxuICAgIF9lbnN1cmVMaW5lU3RhcnRzKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fbGluZVN0YXJ0cykge1xyXG4gICAgICAgICAgICBjb25zdCBlb2xMZW5ndGggPSB0aGlzLl9lb2wubGVuZ3RoO1xyXG4gICAgICAgICAgICBjb25zdCBsaW5lc0xlbmd0aCA9IHRoaXMuX2xpbmVzLmxlbmd0aDtcclxuICAgICAgICAgICAgY29uc3QgbGluZVN0YXJ0VmFsdWVzID0gbmV3IFVpbnQzMkFycmF5KGxpbmVzTGVuZ3RoKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lc0xlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5lU3RhcnRWYWx1ZXNbaV0gPSB0aGlzLl9saW5lc1tpXS5sZW5ndGggKyBlb2xMZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fbGluZVN0YXJ0cyA9IG5ldyBQcmVmaXhTdW1Db21wdXRlcihsaW5lU3RhcnRWYWx1ZXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQWxsIGNoYW5nZXMgdG8gYSBsaW5lJ3MgdGV4dCBnbyB0aHJvdWdoIHRoaXMgbWV0aG9kXHJcbiAgICAgKi9cclxuICAgIF9zZXRMaW5lVGV4dChsaW5lSW5kZXgsIG5ld1ZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fbGluZXNbbGluZUluZGV4XSA9IG5ld1ZhbHVlO1xyXG4gICAgICAgIGlmICh0aGlzLl9saW5lU3RhcnRzKSB7XHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBwcmVmaXggc3VtXHJcbiAgICAgICAgICAgIHRoaXMuX2xpbmVTdGFydHMuY2hhbmdlVmFsdWUobGluZUluZGV4LCB0aGlzLl9saW5lc1tsaW5lSW5kZXhdLmxlbmd0aCArIHRoaXMuX2VvbC5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIF9hY2NlcHREZWxldGVSYW5nZShyYW5nZSkge1xyXG4gICAgICAgIGlmIChyYW5nZS5zdGFydExpbmVOdW1iZXIgPT09IHJhbmdlLmVuZExpbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgaWYgKHJhbmdlLnN0YXJ0Q29sdW1uID09PSByYW5nZS5lbmRDb2x1bW4pIHtcclxuICAgICAgICAgICAgICAgIC8vIE5vdGhpbmcgdG8gZGVsZXRlXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gRGVsZXRlIHRleHQgb24gdGhlIGFmZmVjdGVkIGxpbmVcclxuICAgICAgICAgICAgdGhpcy5fc2V0TGluZVRleHQocmFuZ2Uuc3RhcnRMaW5lTnVtYmVyIC0gMSwgdGhpcy5fbGluZXNbcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyIC0gMV0uc3Vic3RyaW5nKDAsIHJhbmdlLnN0YXJ0Q29sdW1uIC0gMSlcclxuICAgICAgICAgICAgICAgICsgdGhpcy5fbGluZXNbcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyIC0gMV0uc3Vic3RyaW5nKHJhbmdlLmVuZENvbHVtbiAtIDEpKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUYWtlIHJlbWFpbmluZyB0ZXh0IG9uIGxhc3QgbGluZSBhbmQgYXBwZW5kIGl0IHRvIHJlbWFpbmluZyB0ZXh0IG9uIGZpcnN0IGxpbmVcclxuICAgICAgICB0aGlzLl9zZXRMaW5lVGV4dChyYW5nZS5zdGFydExpbmVOdW1iZXIgLSAxLCB0aGlzLl9saW5lc1tyYW5nZS5zdGFydExpbmVOdW1iZXIgLSAxXS5zdWJzdHJpbmcoMCwgcmFuZ2Uuc3RhcnRDb2x1bW4gLSAxKVxyXG4gICAgICAgICAgICArIHRoaXMuX2xpbmVzW3JhbmdlLmVuZExpbmVOdW1iZXIgLSAxXS5zdWJzdHJpbmcocmFuZ2UuZW5kQ29sdW1uIC0gMSkpO1xyXG4gICAgICAgIC8vIERlbGV0ZSBtaWRkbGUgbGluZXNcclxuICAgICAgICB0aGlzLl9saW5lcy5zcGxpY2UocmFuZ2Uuc3RhcnRMaW5lTnVtYmVyLCByYW5nZS5lbmRMaW5lTnVtYmVyIC0gcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyKTtcclxuICAgICAgICBpZiAodGhpcy5fbGluZVN0YXJ0cykge1xyXG4gICAgICAgICAgICAvLyB1cGRhdGUgcHJlZml4IHN1bVxyXG4gICAgICAgICAgICB0aGlzLl9saW5lU3RhcnRzLnJlbW92ZVZhbHVlcyhyYW5nZS5zdGFydExpbmVOdW1iZXIsIHJhbmdlLmVuZExpbmVOdW1iZXIgLSByYW5nZS5zdGFydExpbmVOdW1iZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIF9hY2NlcHRJbnNlcnRUZXh0KHBvc2l0aW9uLCBpbnNlcnRUZXh0KSB7XHJcbiAgICAgICAgaWYgKGluc2VydFRleHQubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGhpbmcgdG8gaW5zZXJ0XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGluc2VydExpbmVzID0gc3BsaXRMaW5lcyhpbnNlcnRUZXh0KTtcclxuICAgICAgICBpZiAoaW5zZXJ0TGluZXMubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgIC8vIEluc2VydGluZyB0ZXh0IG9uIG9uZSBsaW5lXHJcbiAgICAgICAgICAgIHRoaXMuX3NldExpbmVUZXh0KHBvc2l0aW9uLmxpbmVOdW1iZXIgLSAxLCB0aGlzLl9saW5lc1twb3NpdGlvbi5saW5lTnVtYmVyIC0gMV0uc3Vic3RyaW5nKDAsIHBvc2l0aW9uLmNvbHVtbiAtIDEpXHJcbiAgICAgICAgICAgICAgICArIGluc2VydExpbmVzWzBdXHJcbiAgICAgICAgICAgICAgICArIHRoaXMuX2xpbmVzW3Bvc2l0aW9uLmxpbmVOdW1iZXIgLSAxXS5zdWJzdHJpbmcocG9zaXRpb24uY29sdW1uIC0gMSkpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEFwcGVuZCBvdmVyZmxvd2luZyB0ZXh0IGZyb20gZmlyc3QgbGluZSB0byB0aGUgZW5kIG9mIHRleHQgdG8gaW5zZXJ0XHJcbiAgICAgICAgaW5zZXJ0TGluZXNbaW5zZXJ0TGluZXMubGVuZ3RoIC0gMV0gKz0gdGhpcy5fbGluZXNbcG9zaXRpb24ubGluZU51bWJlciAtIDFdLnN1YnN0cmluZyhwb3NpdGlvbi5jb2x1bW4gLSAxKTtcclxuICAgICAgICAvLyBEZWxldGUgb3ZlcmZsb3dpbmcgdGV4dCBmcm9tIGZpcnN0IGxpbmUgYW5kIGluc2VydCB0ZXh0IG9uIGZpcnN0IGxpbmVcclxuICAgICAgICB0aGlzLl9zZXRMaW5lVGV4dChwb3NpdGlvbi5saW5lTnVtYmVyIC0gMSwgdGhpcy5fbGluZXNbcG9zaXRpb24ubGluZU51bWJlciAtIDFdLnN1YnN0cmluZygwLCBwb3NpdGlvbi5jb2x1bW4gLSAxKVxyXG4gICAgICAgICAgICArIGluc2VydExpbmVzWzBdKTtcclxuICAgICAgICAvLyBJbnNlcnQgbmV3IGxpbmVzICYgc3RvcmUgbGVuZ3Roc1xyXG4gICAgICAgIGxldCBuZXdMZW5ndGhzID0gbmV3IFVpbnQzMkFycmF5KGluc2VydExpbmVzLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgaW5zZXJ0TGluZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5fbGluZXMuc3BsaWNlKHBvc2l0aW9uLmxpbmVOdW1iZXIgKyBpIC0gMSwgMCwgaW5zZXJ0TGluZXNbaV0pO1xyXG4gICAgICAgICAgICBuZXdMZW5ndGhzW2kgLSAxXSA9IGluc2VydExpbmVzW2ldLmxlbmd0aCArIHRoaXMuX2VvbC5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9saW5lU3RhcnRzKSB7XHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBwcmVmaXggc3VtXHJcbiAgICAgICAgICAgIHRoaXMuX2xpbmVTdGFydHMuaW5zZXJ0VmFsdWVzKHBvc2l0aW9uLmxpbmVOdW1iZXIsIG5ld0xlbmd0aHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmV4cG9ydCBjb25zdCBVU1VBTF9XT1JEX1NFUEFSQVRPUlMgPSAnYH4hQCMkJV4mKigpLT0rW3tdfVxcXFx8OzpcXCdcIiwuPD4vPyc7XHJcbi8qKlxyXG4gKiBDcmVhdGUgYSB3b3JkIGRlZmluaXRpb24gcmVndWxhciBleHByZXNzaW9uIGJhc2VkIG9uIGRlZmF1bHQgd29yZCBzZXBhcmF0b3JzLlxyXG4gKiBPcHRpb25hbGx5IHByb3ZpZGUgYWxsb3dlZCBzZXBhcmF0b3JzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGluIHdvcmRzLlxyXG4gKlxyXG4gKiBUaGUgZGVmYXVsdCB3b3VsZCBsb29rIGxpa2UgdGhpczpcclxuICogLygtP1xcZCpcXC5cXGRcXHcqKXwoW15cXGBcXH5cXCFcXEBcXCNcXCRcXCVcXF5cXCZcXCpcXChcXClcXC1cXD1cXCtcXFtcXHtcXF1cXH1cXFxcXFx8XFw7XFw6XFwnXFxcIlxcLFxcLlxcPFxcPlxcL1xcP1xcc10rKS9nXHJcbiAqL1xyXG5mdW5jdGlvbiBjcmVhdGVXb3JkUmVnRXhwKGFsbG93SW5Xb3JkcyA9ICcnKSB7XHJcbiAgICBsZXQgc291cmNlID0gJygtP1xcXFxkKlxcXFwuXFxcXGRcXFxcdyopfChbXic7XHJcbiAgICBmb3IgKGNvbnN0IHNlcCBvZiBVU1VBTF9XT1JEX1NFUEFSQVRPUlMpIHtcclxuICAgICAgICBpZiAoYWxsb3dJbldvcmRzLmluZGV4T2Yoc2VwKSA+PSAwKSB7XHJcbiAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzb3VyY2UgKz0gJ1xcXFwnICsgc2VwO1xyXG4gICAgfVxyXG4gICAgc291cmNlICs9ICdcXFxcc10rKSc7XHJcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsICdnJyk7XHJcbn1cclxuLy8gY2F0Y2hlcyBudW1iZXJzIChpbmNsdWRpbmcgZmxvYXRpbmcgbnVtYmVycykgaW4gdGhlIGZpcnN0IGdyb3VwLCBhbmQgYWxwaGFudW0gaW4gdGhlIHNlY29uZFxyXG5leHBvcnQgY29uc3QgREVGQVVMVF9XT1JEX1JFR0VYUCA9IGNyZWF0ZVdvcmRSZWdFeHAoKTtcclxuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVZhbGlkV29yZERlZmluaXRpb24od29yZERlZmluaXRpb24pIHtcclxuICAgIGxldCByZXN1bHQgPSBERUZBVUxUX1dPUkRfUkVHRVhQO1xyXG4gICAgaWYgKHdvcmREZWZpbml0aW9uICYmICh3b3JkRGVmaW5pdGlvbiBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcclxuICAgICAgICBpZiAoIXdvcmREZWZpbml0aW9uLmdsb2JhbCkge1xyXG4gICAgICAgICAgICBsZXQgZmxhZ3MgPSAnZyc7XHJcbiAgICAgICAgICAgIGlmICh3b3JkRGVmaW5pdGlvbi5pZ25vcmVDYXNlKSB7XHJcbiAgICAgICAgICAgICAgICBmbGFncyArPSAnaSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHdvcmREZWZpbml0aW9uLm11bHRpbGluZSkge1xyXG4gICAgICAgICAgICAgICAgZmxhZ3MgKz0gJ20nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3b3JkRGVmaW5pdGlvbi51bmljb2RlKSB7XHJcbiAgICAgICAgICAgICAgICBmbGFncyArPSAndSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmVzdWx0ID0gbmV3IFJlZ0V4cCh3b3JkRGVmaW5pdGlvbi5zb3VyY2UsIGZsYWdzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHdvcmREZWZpbml0aW9uO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJlc3VsdC5sYXN0SW5kZXggPSAwO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5jb25zdCBfZGVmYXVsdENvbmZpZyA9IHtcclxuICAgIG1heExlbjogMTAwMCxcclxuICAgIHdpbmRvd1NpemU6IDE1LFxyXG4gICAgdGltZUJ1ZGdldDogMTUwXHJcbn07XHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRXb3JkQXRUZXh0KGNvbHVtbiwgd29yZERlZmluaXRpb24sIHRleHQsIHRleHRPZmZzZXQsIGNvbmZpZyA9IF9kZWZhdWx0Q29uZmlnKSB7XHJcbiAgICBpZiAodGV4dC5sZW5ndGggPiBjb25maWcubWF4TGVuKSB7XHJcbiAgICAgICAgLy8gZG9uJ3QgdGhyb3cgc3RyaW5ncyB0aGF0IGxvbmcgYXQgdGhlIHJlZ2V4cFxyXG4gICAgICAgIC8vIGJ1dCB1c2UgYSBzdWItc3RyaW5nIGluIHdoaWNoIGEgd29yZCBtdXN0IG9jY3VyXHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gY29sdW1uIC0gY29uZmlnLm1heExlbiAvIDI7XHJcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkge1xyXG4gICAgICAgICAgICBzdGFydCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0ZXh0T2Zmc2V0ICs9IHN0YXJ0O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoc3RhcnQsIGNvbHVtbiArIGNvbmZpZy5tYXhMZW4gLyAyKTtcclxuICAgICAgICByZXR1cm4gZ2V0V29yZEF0VGV4dChjb2x1bW4sIHdvcmREZWZpbml0aW9uLCB0ZXh0LCB0ZXh0T2Zmc2V0LCBjb25maWcpO1xyXG4gICAgfVxyXG4gICAgY29uc3QgdDEgPSBEYXRlLm5vdygpO1xyXG4gICAgY29uc3QgcG9zID0gY29sdW1uIC0gMSAtIHRleHRPZmZzZXQ7XHJcbiAgICBsZXQgcHJldlJlZ2V4SW5kZXggPSAtMTtcclxuICAgIGxldCBtYXRjaCA9IG51bGw7XHJcbiAgICBmb3IgKGxldCBpID0gMTs7IGkrKykge1xyXG4gICAgICAgIC8vIGNoZWNrIHRpbWUgYnVkZ2V0XHJcbiAgICAgICAgaWYgKERhdGUubm93KCkgLSB0MSA+PSBjb25maWcudGltZUJ1ZGdldCkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmVzZXQgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSByZWdleHAgc2hvdWxkIHN0YXJ0IG1hdGNoaW5nLCBhbHNvIGtub3cgd2hlcmUgaXRcclxuICAgICAgICAvLyBzaG91bGQgc3RvcCBzbyB0aGF0IHN1YnNlcXVlbnQgc2VhcmNoIGRvbid0IHJlcGVhdCBwcmV2aW91cyBzZWFyY2hlc1xyXG4gICAgICAgIGNvbnN0IHJlZ2V4SW5kZXggPSBwb3MgLSBjb25maWcud2luZG93U2l6ZSAqIGk7XHJcbiAgICAgICAgd29yZERlZmluaXRpb24ubGFzdEluZGV4ID0gTWF0aC5tYXgoMCwgcmVnZXhJbmRleCk7XHJcbiAgICAgICAgY29uc3QgdGhpc01hdGNoID0gX2ZpbmRSZWdleE1hdGNoRW5jbG9zaW5nUG9zaXRpb24od29yZERlZmluaXRpb24sIHRleHQsIHBvcywgcHJldlJlZ2V4SW5kZXgpO1xyXG4gICAgICAgIGlmICghdGhpc01hdGNoICYmIG1hdGNoKSB7XHJcbiAgICAgICAgICAgIC8vIHN0b3A6IHdlIGhhdmUgc29tZXRoaW5nXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBtYXRjaCA9IHRoaXNNYXRjaDtcclxuICAgICAgICAvLyBzdG9wOiBzZWFyY2hlZCBhdCBzdGFydFxyXG4gICAgICAgIGlmIChyZWdleEluZGV4IDw9IDApIHtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByZXZSZWdleEluZGV4ID0gcmVnZXhJbmRleDtcclxuICAgIH1cclxuICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgIHdvcmQ6IG1hdGNoWzBdLFxyXG4gICAgICAgICAgICBzdGFydENvbHVtbjogdGV4dE9mZnNldCArIDEgKyBtYXRjaC5pbmRleCxcclxuICAgICAgICAgICAgZW5kQ29sdW1uOiB0ZXh0T2Zmc2V0ICsgMSArIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoXHJcbiAgICAgICAgfTtcclxuICAgICAgICB3b3JkRGVmaW5pdGlvbi5sYXN0SW5kZXggPSAwO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxufVxyXG5mdW5jdGlvbiBfZmluZFJlZ2V4TWF0Y2hFbmNsb3NpbmdQb3NpdGlvbih3b3JkRGVmaW5pdGlvbiwgdGV4dCwgcG9zLCBzdG9wUG9zKSB7XHJcbiAgICBsZXQgbWF0Y2g7XHJcbiAgICB3aGlsZSAobWF0Y2ggPSB3b3JkRGVmaW5pdGlvbi5leGVjKHRleHQpKSB7XHJcbiAgICAgICAgY29uc3QgbWF0Y2hJbmRleCA9IG1hdGNoLmluZGV4IHx8IDA7XHJcbiAgICAgICAgaWYgKG1hdGNoSW5kZXggPD0gcG9zICYmIHdvcmREZWZpbml0aW9uLmxhc3RJbmRleCA+PSBwb3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChzdG9wUG9zID4gMCAmJiBtYXRjaEluZGV4ID4gc3RvcFBvcykge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbnVsbDtcclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCB7IHRvVWludDggfSBmcm9tICcuLi8uLi8uLi9iYXNlL2NvbW1vbi91aW50LmpzJztcclxuLyoqXHJcbiAqIEEgZmFzdCBjaGFyYWN0ZXIgY2xhc3NpZmllciB0aGF0IHVzZXMgYSBjb21wYWN0IGFycmF5IGZvciBBU0NJSSB2YWx1ZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2hhcmFjdGVyQ2xhc3NpZmllciB7XHJcbiAgICBjb25zdHJ1Y3RvcihfZGVmYXVsdFZhbHVlKSB7XHJcbiAgICAgICAgbGV0IGRlZmF1bHRWYWx1ZSA9IHRvVWludDgoX2RlZmF1bHRWYWx1ZSk7XHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdFZhbHVlID0gZGVmYXVsdFZhbHVlO1xyXG4gICAgICAgIHRoaXMuX2FzY2lpTWFwID0gQ2hhcmFjdGVyQ2xhc3NpZmllci5fY3JlYXRlQXNjaWlNYXAoZGVmYXVsdFZhbHVlKTtcclxuICAgICAgICB0aGlzLl9tYXAgPSBuZXcgTWFwKCk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgX2NyZWF0ZUFzY2lpTWFwKGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgICAgIGxldCBhc2NpaU1hcCA9IG5ldyBVaW50OEFycmF5KDI1Nik7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7IGkrKykge1xyXG4gICAgICAgICAgICBhc2NpaU1hcFtpXSA9IGRlZmF1bHRWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFzY2lpTWFwO1xyXG4gICAgfVxyXG4gICAgc2V0KGNoYXJDb2RlLCBfdmFsdWUpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSB0b1VpbnQ4KF92YWx1ZSk7XHJcbiAgICAgICAgaWYgKGNoYXJDb2RlID49IDAgJiYgY2hhckNvZGUgPCAyNTYpIHtcclxuICAgICAgICAgICAgdGhpcy5fYXNjaWlNYXBbY2hhckNvZGVdID0gdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9tYXAuc2V0KGNoYXJDb2RlLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0KGNoYXJDb2RlKSB7XHJcbiAgICAgICAgaWYgKGNoYXJDb2RlID49IDAgJiYgY2hhckNvZGUgPCAyNTYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2FzY2lpTWFwW2NoYXJDb2RlXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiAodGhpcy5fbWFwLmdldChjaGFyQ29kZSkgfHwgdGhpcy5fZGVmYXVsdFZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIENoYXJhY3RlclNldCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9hY3R1YWwgPSBuZXcgQ2hhcmFjdGVyQ2xhc3NpZmllcigwIC8qIEZhbHNlICovKTtcclxuICAgIH1cclxuICAgIGFkZChjaGFyQ29kZSkge1xyXG4gICAgICAgIHRoaXMuX2FjdHVhbC5zZXQoY2hhckNvZGUsIDEgLyogVHJ1ZSAqLyk7XHJcbiAgICB9XHJcbiAgICBoYXMoY2hhckNvZGUpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuX2FjdHVhbC5nZXQoY2hhckNvZGUpID09PSAxIC8qIFRydWUgKi8pO1xyXG4gICAgfVxyXG59XHJcbiIsICIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuaW1wb3J0IHsgQ2hhcmFjdGVyQ2xhc3NpZmllciB9IGZyb20gJy4uL2NvcmUvY2hhcmFjdGVyQ2xhc3NpZmllci5qcyc7XHJcbmV4cG9ydCBjbGFzcyBVaW50OE1hdHJpeCB7XHJcbiAgICBjb25zdHJ1Y3Rvcihyb3dzLCBjb2xzLCBkZWZhdWx0VmFsdWUpIHtcclxuICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkocm93cyAqIGNvbHMpO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSByb3dzICogY29sczsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGRhdGFbaV0gPSBkZWZhdWx0VmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2RhdGEgPSBkYXRhO1xyXG4gICAgICAgIHRoaXMucm93cyA9IHJvd3M7XHJcbiAgICAgICAgdGhpcy5jb2xzID0gY29scztcclxuICAgIH1cclxuICAgIGdldChyb3csIGNvbCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhW3JvdyAqIHRoaXMuY29scyArIGNvbF07XHJcbiAgICB9XHJcbiAgICBzZXQocm93LCBjb2wsIHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0YVtyb3cgKiB0aGlzLmNvbHMgKyBjb2xdID0gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZSB7XHJcbiAgICBjb25zdHJ1Y3RvcihlZGdlcykge1xyXG4gICAgICAgIGxldCBtYXhDaGFyQ29kZSA9IDA7XHJcbiAgICAgICAgbGV0IG1heFN0YXRlID0gMCAvKiBJbnZhbGlkICovO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSBlZGdlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgW2Zyb20sIGNoQ29kZSwgdG9dID0gZWRnZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChjaENvZGUgPiBtYXhDaGFyQ29kZSkge1xyXG4gICAgICAgICAgICAgICAgbWF4Q2hhckNvZGUgPSBjaENvZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGZyb20gPiBtYXhTdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgbWF4U3RhdGUgPSBmcm9tO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0byA+IG1heFN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBtYXhTdGF0ZSA9IHRvO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1heENoYXJDb2RlKys7XHJcbiAgICAgICAgbWF4U3RhdGUrKztcclxuICAgICAgICBsZXQgc3RhdGVzID0gbmV3IFVpbnQ4TWF0cml4KG1heFN0YXRlLCBtYXhDaGFyQ29kZSwgMCAvKiBJbnZhbGlkICovKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gZWRnZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IFtmcm9tLCBjaENvZGUsIHRvXSA9IGVkZ2VzW2ldO1xyXG4gICAgICAgICAgICBzdGF0ZXMuc2V0KGZyb20sIGNoQ29kZSwgdG8pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zdGF0ZXMgPSBzdGF0ZXM7XHJcbiAgICAgICAgdGhpcy5fbWF4Q2hhckNvZGUgPSBtYXhDaGFyQ29kZTtcclxuICAgIH1cclxuICAgIG5leHRTdGF0ZShjdXJyZW50U3RhdGUsIGNoQ29kZSkge1xyXG4gICAgICAgIGlmIChjaENvZGUgPCAwIHx8IGNoQ29kZSA+PSB0aGlzLl9tYXhDaGFyQ29kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gMCAvKiBJbnZhbGlkICovO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fc3RhdGVzLmdldChjdXJyZW50U3RhdGUsIGNoQ29kZSk7XHJcbiAgICB9XHJcbn1cclxuLy8gU3RhdGUgbWFjaGluZSBmb3IgaHR0cDovLyBvciBodHRwczovLyBvciBmaWxlOi8vXHJcbmxldCBfc3RhdGVNYWNoaW5lID0gbnVsbDtcclxuZnVuY3Rpb24gZ2V0U3RhdGVNYWNoaW5lKCkge1xyXG4gICAgaWYgKF9zdGF0ZU1hY2hpbmUgPT09IG51bGwpIHtcclxuICAgICAgICBfc3RhdGVNYWNoaW5lID0gbmV3IFN0YXRlTWFjaGluZShbXHJcbiAgICAgICAgICAgIFsxIC8qIFN0YXJ0ICovLCAxMDQgLyogaCAqLywgMiAvKiBIICovXSxcclxuICAgICAgICAgICAgWzEgLyogU3RhcnQgKi8sIDcyIC8qIEggKi8sIDIgLyogSCAqL10sXHJcbiAgICAgICAgICAgIFsxIC8qIFN0YXJ0ICovLCAxMDIgLyogZiAqLywgNiAvKiBGICovXSxcclxuICAgICAgICAgICAgWzEgLyogU3RhcnQgKi8sIDcwIC8qIEYgKi8sIDYgLyogRiAqL10sXHJcbiAgICAgICAgICAgIFsyIC8qIEggKi8sIDExNiAvKiB0ICovLCAzIC8qIEhUICovXSxcclxuICAgICAgICAgICAgWzIgLyogSCAqLywgODQgLyogVCAqLywgMyAvKiBIVCAqL10sXHJcbiAgICAgICAgICAgIFszIC8qIEhUICovLCAxMTYgLyogdCAqLywgNCAvKiBIVFQgKi9dLFxyXG4gICAgICAgICAgICBbMyAvKiBIVCAqLywgODQgLyogVCAqLywgNCAvKiBIVFQgKi9dLFxyXG4gICAgICAgICAgICBbNCAvKiBIVFQgKi8sIDExMiAvKiBwICovLCA1IC8qIEhUVFAgKi9dLFxyXG4gICAgICAgICAgICBbNCAvKiBIVFQgKi8sIDgwIC8qIFAgKi8sIDUgLyogSFRUUCAqL10sXHJcbiAgICAgICAgICAgIFs1IC8qIEhUVFAgKi8sIDExNSAvKiBzICovLCA5IC8qIEJlZm9yZUNvbG9uICovXSxcclxuICAgICAgICAgICAgWzUgLyogSFRUUCAqLywgODMgLyogUyAqLywgOSAvKiBCZWZvcmVDb2xvbiAqL10sXHJcbiAgICAgICAgICAgIFs1IC8qIEhUVFAgKi8sIDU4IC8qIENvbG9uICovLCAxMCAvKiBBZnRlckNvbG9uICovXSxcclxuICAgICAgICAgICAgWzYgLyogRiAqLywgMTA1IC8qIGkgKi8sIDcgLyogRkkgKi9dLFxyXG4gICAgICAgICAgICBbNiAvKiBGICovLCA3MyAvKiBJICovLCA3IC8qIEZJICovXSxcclxuICAgICAgICAgICAgWzcgLyogRkkgKi8sIDEwOCAvKiBsICovLCA4IC8qIEZJTCAqL10sXHJcbiAgICAgICAgICAgIFs3IC8qIEZJICovLCA3NiAvKiBMICovLCA4IC8qIEZJTCAqL10sXHJcbiAgICAgICAgICAgIFs4IC8qIEZJTCAqLywgMTAxIC8qIGUgKi8sIDkgLyogQmVmb3JlQ29sb24gKi9dLFxyXG4gICAgICAgICAgICBbOCAvKiBGSUwgKi8sIDY5IC8qIEUgKi8sIDkgLyogQmVmb3JlQ29sb24gKi9dLFxyXG4gICAgICAgICAgICBbOSAvKiBCZWZvcmVDb2xvbiAqLywgNTggLyogQ29sb24gKi8sIDEwIC8qIEFmdGVyQ29sb24gKi9dLFxyXG4gICAgICAgICAgICBbMTAgLyogQWZ0ZXJDb2xvbiAqLywgNDcgLyogU2xhc2ggKi8sIDExIC8qIEFsbW9zdFRoZXJlICovXSxcclxuICAgICAgICAgICAgWzExIC8qIEFsbW9zdFRoZXJlICovLCA0NyAvKiBTbGFzaCAqLywgMTIgLyogRW5kICovXSxcclxuICAgICAgICBdKTtcclxuICAgIH1cclxuICAgIHJldHVybiBfc3RhdGVNYWNoaW5lO1xyXG59XHJcbmxldCBfY2xhc3NpZmllciA9IG51bGw7XHJcbmZ1bmN0aW9uIGdldENsYXNzaWZpZXIoKSB7XHJcbiAgICBpZiAoX2NsYXNzaWZpZXIgPT09IG51bGwpIHtcclxuICAgICAgICBfY2xhc3NpZmllciA9IG5ldyBDaGFyYWN0ZXJDbGFzc2lmaWVyKDAgLyogTm9uZSAqLyk7XHJcbiAgICAgICAgY29uc3QgRk9SQ0VfVEVSTUlOQVRJT05fQ0hBUkFDVEVSUyA9ICcgXFx0PD5cXCdcXFwiXHUzMDAxXHUzMDAyXHVGRjYxXHVGRjY0XHVGRjBDXHVGRjBFXHVGRjFBXHVGRjFCXHUyMDE4XHUzMDA4XHUzMDBDXHUzMDBFXHUzMDE0XHVGRjA4XHVGRjNCXHVGRjVCXHVGRjYyXHVGRjYzXHVGRjVEXHVGRjNEXHVGRjA5XHUzMDE1XHUzMDBGXHUzMDBEXHUzMDA5XHUyMDE5XHVGRjQwXHVGRjVFXHUyMDI2JztcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IEZPUkNFX1RFUk1JTkFUSU9OX0NIQVJBQ1RFUlMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgX2NsYXNzaWZpZXIuc2V0KEZPUkNFX1RFUk1JTkFUSU9OX0NIQVJBQ1RFUlMuY2hhckNvZGVBdChpKSwgMSAvKiBGb3JjZVRlcm1pbmF0aW9uICovKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgQ0FOTk9UX0VORF9XSVRIX0NIQVJBQ1RFUlMgPSAnLiw7JztcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IENBTk5PVF9FTkRfV0lUSF9DSEFSQUNURVJTLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIF9jbGFzc2lmaWVyLnNldChDQU5OT1RfRU5EX1dJVEhfQ0hBUkFDVEVSUy5jaGFyQ29kZUF0KGkpLCAyIC8qIENhbm5vdEVuZEluICovKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX2NsYXNzaWZpZXI7XHJcbn1cclxuZXhwb3J0IGNsYXNzIExpbmtDb21wdXRlciB7XHJcbiAgICBzdGF0aWMgX2NyZWF0ZUxpbmsoY2xhc3NpZmllciwgbGluZSwgbGluZU51bWJlciwgbGlua0JlZ2luSW5kZXgsIGxpbmtFbmRJbmRleCkge1xyXG4gICAgICAgIC8vIERvIG5vdCBhbGxvdyB0byBlbmQgbGluayBpbiBjZXJ0YWluIGNoYXJhY3RlcnMuLi5cclxuICAgICAgICBsZXQgbGFzdEluY2x1ZGVkQ2hhckluZGV4ID0gbGlua0VuZEluZGV4IC0gMTtcclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoQ29kZSA9IGxpbmUuY2hhckNvZGVBdChsYXN0SW5jbHVkZWRDaGFySW5kZXgpO1xyXG4gICAgICAgICAgICBjb25zdCBjaENsYXNzID0gY2xhc3NpZmllci5nZXQoY2hDb2RlKTtcclxuICAgICAgICAgICAgaWYgKGNoQ2xhc3MgIT09IDIgLyogQ2Fubm90RW5kSW4gKi8pIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxhc3RJbmNsdWRlZENoYXJJbmRleC0tO1xyXG4gICAgICAgIH0gd2hpbGUgKGxhc3RJbmNsdWRlZENoYXJJbmRleCA+IGxpbmtCZWdpbkluZGV4KTtcclxuICAgICAgICAvLyBIYW5kbGUgbGlua3MgZW5jbG9zZWQgaW4gcGFyZW5zLCBzcXVhcmUgYnJhY2tldHMgYW5kIGN1cmx5cy5cclxuICAgICAgICBpZiAobGlua0JlZ2luSW5kZXggPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNoYXJDb2RlQmVmb3JlTGluayA9IGxpbmUuY2hhckNvZGVBdChsaW5rQmVnaW5JbmRleCAtIDEpO1xyXG4gICAgICAgICAgICBjb25zdCBsYXN0Q2hhckNvZGVJbkxpbmsgPSBsaW5lLmNoYXJDb2RlQXQobGFzdEluY2x1ZGVkQ2hhckluZGV4KTtcclxuICAgICAgICAgICAgaWYgKChjaGFyQ29kZUJlZm9yZUxpbmsgPT09IDQwIC8qIE9wZW5QYXJlbiAqLyAmJiBsYXN0Q2hhckNvZGVJbkxpbmsgPT09IDQxIC8qIENsb3NlUGFyZW4gKi8pXHJcbiAgICAgICAgICAgICAgICB8fCAoY2hhckNvZGVCZWZvcmVMaW5rID09PSA5MSAvKiBPcGVuU3F1YXJlQnJhY2tldCAqLyAmJiBsYXN0Q2hhckNvZGVJbkxpbmsgPT09IDkzIC8qIENsb3NlU3F1YXJlQnJhY2tldCAqLylcclxuICAgICAgICAgICAgICAgIHx8IChjaGFyQ29kZUJlZm9yZUxpbmsgPT09IDEyMyAvKiBPcGVuQ3VybHlCcmFjZSAqLyAmJiBsYXN0Q2hhckNvZGVJbkxpbmsgPT09IDEyNSAvKiBDbG9zZUN1cmx5QnJhY2UgKi8pKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEbyBub3QgZW5kIGluICkgaWYgKCBpcyBiZWZvcmUgdGhlIGxpbmsgc3RhcnRcclxuICAgICAgICAgICAgICAgIC8vIERvIG5vdCBlbmQgaW4gXSBpZiBbIGlzIGJlZm9yZSB0aGUgbGluayBzdGFydFxyXG4gICAgICAgICAgICAgICAgLy8gRG8gbm90IGVuZCBpbiB9IGlmIHsgaXMgYmVmb3JlIHRoZSBsaW5rIHN0YXJ0XHJcbiAgICAgICAgICAgICAgICBsYXN0SW5jbHVkZWRDaGFySW5kZXgtLTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByYW5nZToge1xyXG4gICAgICAgICAgICAgICAgc3RhcnRMaW5lTnVtYmVyOiBsaW5lTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgc3RhcnRDb2x1bW46IGxpbmtCZWdpbkluZGV4ICsgMSxcclxuICAgICAgICAgICAgICAgIGVuZExpbmVOdW1iZXI6IGxpbmVOdW1iZXIsXHJcbiAgICAgICAgICAgICAgICBlbmRDb2x1bW46IGxhc3RJbmNsdWRlZENoYXJJbmRleCArIDJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdXJsOiBsaW5lLnN1YnN0cmluZyhsaW5rQmVnaW5JbmRleCwgbGFzdEluY2x1ZGVkQ2hhckluZGV4ICsgMSlcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGNvbXB1dGVMaW5rcyhtb2RlbCwgc3RhdGVNYWNoaW5lID0gZ2V0U3RhdGVNYWNoaW5lKCkpIHtcclxuICAgICAgICBjb25zdCBjbGFzc2lmaWVyID0gZ2V0Q2xhc3NpZmllcigpO1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMSwgbGluZUNvdW50ID0gbW9kZWwuZ2V0TGluZUNvdW50KCk7IGkgPD0gbGluZUNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbGluZSA9IG1vZGVsLmdldExpbmVDb250ZW50KGkpO1xyXG4gICAgICAgICAgICBjb25zdCBsZW4gPSBsaW5lLmxlbmd0aDtcclxuICAgICAgICAgICAgbGV0IGogPSAwO1xyXG4gICAgICAgICAgICBsZXQgbGlua0JlZ2luSW5kZXggPSAwO1xyXG4gICAgICAgICAgICBsZXQgbGlua0JlZ2luQ2hDb2RlID0gMDtcclxuICAgICAgICAgICAgbGV0IHN0YXRlID0gMSAvKiBTdGFydCAqLztcclxuICAgICAgICAgICAgbGV0IGhhc09wZW5QYXJlbnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IGhhc09wZW5TcXVhcmVCcmFja2V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCBpblNxdWFyZUJyYWNrZXRzID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCBoYXNPcGVuQ3VybHlCcmFja2V0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHdoaWxlIChqIDwgbGVuKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzZXRTdGF0ZU1hY2hpbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNoQ29kZSA9IGxpbmUuY2hhckNvZGVBdChqKTtcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gMTMgLyogQWNjZXB0ICovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNoQ2xhc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChjaENvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0MCAvKiBPcGVuUGFyZW4gKi86XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNPcGVuUGFyZW5zID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoQ2xhc3MgPSAwIC8qIE5vbmUgKi87XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSA0MSAvKiBDbG9zZVBhcmVuICovOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hDbGFzcyA9IChoYXNPcGVuUGFyZW5zID8gMCAvKiBOb25lICovIDogMSAvKiBGb3JjZVRlcm1pbmF0aW9uICovKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDkxIC8qIE9wZW5TcXVhcmVCcmFja2V0ICovOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5TcXVhcmVCcmFja2V0cyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNPcGVuU3F1YXJlQnJhY2tldCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaENsYXNzID0gMCAvKiBOb25lICovO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgOTMgLyogQ2xvc2VTcXVhcmVCcmFja2V0ICovOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5TcXVhcmVCcmFja2V0cyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hDbGFzcyA9IChoYXNPcGVuU3F1YXJlQnJhY2tldCA/IDAgLyogTm9uZSAqLyA6IDEgLyogRm9yY2VUZXJtaW5hdGlvbiAqLyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMjMgLyogT3BlbkN1cmx5QnJhY2UgKi86XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNPcGVuQ3VybHlCcmFja2V0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoQ2xhc3MgPSAwIC8qIE5vbmUgKi87XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMjUgLyogQ2xvc2VDdXJseUJyYWNlICovOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hDbGFzcyA9IChoYXNPcGVuQ3VybHlCcmFja2V0ID8gMCAvKiBOb25lICovIDogMSAvKiBGb3JjZVRlcm1pbmF0aW9uICovKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBUaGUgZm9sbG93aW5nIHRocmVlIHJ1bGVzIG1ha2UgaXQgdGhhdCAnIG9yIFwiIG9yIGAgYXJlIGFsbG93ZWQgaW5zaWRlIGxpbmtzIGlmIHRoZSBsaW5rIGJlZ2FuIHdpdGggYSBkaWZmZXJlbnQgb25lICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgMzkgLyogU2luZ2xlUXVvdGUgKi86XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaENsYXNzID0gKGxpbmtCZWdpbkNoQ29kZSA9PT0gMzQgLyogRG91YmxlUXVvdGUgKi8gfHwgbGlua0JlZ2luQ2hDb2RlID09PSA5NiAvKiBCYWNrVGljayAqLykgPyAwIC8qIE5vbmUgKi8gOiAxIC8qIEZvcmNlVGVybWluYXRpb24gKi87XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAzNCAvKiBEb3VibGVRdW90ZSAqLzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoQ2xhc3MgPSAobGlua0JlZ2luQ2hDb2RlID09PSAzOSAvKiBTaW5nbGVRdW90ZSAqLyB8fCBsaW5rQmVnaW5DaENvZGUgPT09IDk2IC8qIEJhY2tUaWNrICovKSA/IDAgLyogTm9uZSAqLyA6IDEgLyogRm9yY2VUZXJtaW5hdGlvbiAqLztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDk2IC8qIEJhY2tUaWNrICovOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hDbGFzcyA9IChsaW5rQmVnaW5DaENvZGUgPT09IDM5IC8qIFNpbmdsZVF1b3RlICovIHx8IGxpbmtCZWdpbkNoQ29kZSA9PT0gMzQgLyogRG91YmxlUXVvdGUgKi8pID8gMCAvKiBOb25lICovIDogMSAvKiBGb3JjZVRlcm1pbmF0aW9uICovO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgNDIgLyogQXN0ZXJpc2sgKi86XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBgKmAgdGVybWluYXRlcyBhIGxpbmsgaWYgdGhlIGxpbmsgYmVnYW4gd2l0aCBgKmBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoQ2xhc3MgPSAobGlua0JlZ2luQ2hDb2RlID09PSA0MiAvKiBBc3RlcmlzayAqLykgPyAxIC8qIEZvcmNlVGVybWluYXRpb24gKi8gOiAwIC8qIE5vbmUgKi87XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAxMjQgLyogUGlwZSAqLzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGB8YCB0ZXJtaW5hdGVzIGEgbGluayBpZiB0aGUgbGluayBiZWdhbiB3aXRoIGB8YFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hDbGFzcyA9IChsaW5rQmVnaW5DaENvZGUgPT09IDEyNCAvKiBQaXBlICovKSA/IDEgLyogRm9yY2VUZXJtaW5hdGlvbiAqLyA6IDAgLyogTm9uZSAqLztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlIDMyIC8qIFNwYWNlICovOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYCBgIGFsbG93IHNwYWNlIGluIGJldHdlZW4gWyBhbmQgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hDbGFzcyA9IChpblNxdWFyZUJyYWNrZXRzID8gMCAvKiBOb25lICovIDogMSAvKiBGb3JjZVRlcm1pbmF0aW9uICovKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hDbGFzcyA9IGNsYXNzaWZpZXIuZ2V0KGNoQ29kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGNoYXJhY3RlciB0ZXJtaW5hdGVzIGxpbmtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hDbGFzcyA9PT0gMSAvKiBGb3JjZVRlcm1pbmF0aW9uICovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKExpbmtDb21wdXRlci5fY3JlYXRlTGluayhjbGFzc2lmaWVyLCBsaW5lLCBpLCBsaW5rQmVnaW5JbmRleCwgaikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldFN0YXRlTWFjaGluZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RhdGUgPT09IDEyIC8qIEVuZCAqLykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjaENsYXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaENvZGUgPT09IDkxIC8qIE9wZW5TcXVhcmVCcmFja2V0ICovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEFsbG93IGZvciB0aGUgYXV0aG9yaXR5IHBhcnQgdG8gY29udGFpbiBpcHY2IGFkZHJlc3NlcyB3aGljaCBjb250YWluIFsgYW5kIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzT3BlblNxdWFyZUJyYWNrZXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjaENsYXNzID0gMCAvKiBOb25lICovO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hDbGFzcyA9IGNsYXNzaWZpZXIuZ2V0KGNoQ29kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIGNoYXJhY3RlciB0ZXJtaW5hdGVzIGxpbmtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hDbGFzcyA9PT0gMSAvKiBGb3JjZVRlcm1pbmF0aW9uICovKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0U3RhdGVNYWNoaW5lID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gMTMgLyogQWNjZXB0ICovO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlID0gc3RhdGVNYWNoaW5lLm5leHRTdGF0ZShzdGF0ZSwgY2hDb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdGUgPT09IDAgLyogSW52YWxpZCAqLykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNldFN0YXRlTWFjaGluZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHJlc2V0U3RhdGVNYWNoaW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSAxIC8qIFN0YXJ0ICovO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhc09wZW5QYXJlbnMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBoYXNPcGVuU3F1YXJlQnJhY2tldCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGhhc09wZW5DdXJseUJyYWNrZXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAvLyBSZWNvcmQgd2hlcmUgdGhlIGxpbmsgc3RhcnRlZFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmtCZWdpbkluZGV4ID0gaiArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlua0JlZ2luQ2hDb2RlID0gY2hDb2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gMTMgLyogQWNjZXB0ICovKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChMaW5rQ29tcHV0ZXIuX2NyZWF0ZUxpbmsoY2xhc3NpZmllciwgbGluZSwgaSwgbGlua0JlZ2luSW5kZXgsIGxlbikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIFJldHVybnMgYW4gYXJyYXkgb2YgYWxsIGxpbmtzIGNvbnRhaW5zIGluIHRoZSBwcm92aWRlZFxyXG4gKiBkb2N1bWVudC4gKk5vdGUqIHRoYXQgdGhpcyBvcGVyYXRpb24gaXMgY29tcHV0YXRpb25hbFxyXG4gKiBleHBlbnNpdmUgYW5kIHNob3VsZCBub3QgcnVuIGluIHRoZSBVSSB0aHJlYWQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gY29tcHV0ZUxpbmtzKG1vZGVsKSB7XHJcbiAgICBpZiAoIW1vZGVsIHx8IHR5cGVvZiBtb2RlbC5nZXRMaW5lQ291bnQgIT09ICdmdW5jdGlvbicgfHwgdHlwZW9mIG1vZGVsLmdldExpbmVDb250ZW50ICE9PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgLy8gVW5rbm93biBjYWxsZXIhXHJcbiAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIExpbmtDb21wdXRlci5jb21wdXRlTGlua3MobW9kZWwpO1xyXG59XHJcbiIsICIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuZXhwb3J0IGNsYXNzIEJhc2ljSW5wbGFjZVJlcGxhY2Uge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdFZhbHVlU2V0ID0gW1xyXG4gICAgICAgICAgICBbJ3RydWUnLCAnZmFsc2UnXSxcclxuICAgICAgICAgICAgWydUcnVlJywgJ0ZhbHNlJ10sXHJcbiAgICAgICAgICAgIFsnUHJpdmF0ZScsICdQdWJsaWMnLCAnRnJpZW5kJywgJ1JlYWRPbmx5JywgJ1BhcnRpYWwnLCAnUHJvdGVjdGVkJywgJ1dyaXRlT25seSddLFxyXG4gICAgICAgICAgICBbJ3B1YmxpYycsICdwcm90ZWN0ZWQnLCAncHJpdmF0ZSddLFxyXG4gICAgICAgIF07XHJcbiAgICB9XHJcbiAgICBuYXZpZ2F0ZVZhbHVlU2V0KHJhbmdlMSwgdGV4dDEsIHJhbmdlMiwgdGV4dDIsIHVwKSB7XHJcbiAgICAgICAgaWYgKHJhbmdlMSAmJiB0ZXh0MSkge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5kb05hdmlnYXRlVmFsdWVTZXQodGV4dDEsIHVwKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICByYW5nZTogcmFuZ2UxLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJhbmdlMiAmJiB0ZXh0Mikge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gdGhpcy5kb05hdmlnYXRlVmFsdWVTZXQodGV4dDIsIHVwKTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICByYW5nZTogcmFuZ2UyLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiByZXN1bHRcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBkb05hdmlnYXRlVmFsdWVTZXQodGV4dCwgdXApIHtcclxuICAgICAgICBsZXQgbnVtYmVyUmVzdWx0ID0gdGhpcy5udW1iZXJSZXBsYWNlKHRleHQsIHVwKTtcclxuICAgICAgICBpZiAobnVtYmVyUmVzdWx0ICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudW1iZXJSZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLnRleHRSZXBsYWNlKHRleHQsIHVwKTtcclxuICAgIH1cclxuICAgIG51bWJlclJlcGxhY2UodmFsdWUsIHVwKSB7XHJcbiAgICAgICAgbGV0IHByZWNpc2lvbiA9IE1hdGgucG93KDEwLCB2YWx1ZS5sZW5ndGggLSAodmFsdWUubGFzdEluZGV4T2YoJy4nKSArIDEpKTtcclxuICAgICAgICBsZXQgbjEgPSBOdW1iZXIodmFsdWUpO1xyXG4gICAgICAgIGxldCBuMiA9IHBhcnNlRmxvYXQodmFsdWUpO1xyXG4gICAgICAgIGlmICghaXNOYU4objEpICYmICFpc05hTihuMikgJiYgbjEgPT09IG4yKSB7XHJcbiAgICAgICAgICAgIGlmIChuMSA9PT0gMCAmJiAhdXApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBkb24ndCBkbyBuZWdhdGl2ZVxyXG4gICAgICAgICAgICAgICAgLy9cdFx0XHR9IGVsc2UgaWYobjEgPT09IDkgJiYgdXApIHtcclxuICAgICAgICAgICAgICAgIC8vXHRcdFx0XHRyZXR1cm4gbnVsbDsgLy8gZG9uJ3QgaW5zZXJ0IDEwIGludG8gYSBudW1iZXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG4xID0gTWF0aC5mbG9vcihuMSAqIHByZWNpc2lvbik7XHJcbiAgICAgICAgICAgICAgICBuMSArPSB1cCA/IHByZWNpc2lvbiA6IC1wcmVjaXNpb247XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nKG4xIC8gcHJlY2lzaW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHRleHRSZXBsYWNlKHZhbHVlLCB1cCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlU2V0c1JlcGxhY2UodGhpcy5fZGVmYXVsdFZhbHVlU2V0LCB2YWx1ZSwgdXApO1xyXG4gICAgfVxyXG4gICAgdmFsdWVTZXRzUmVwbGFjZSh2YWx1ZVNldHMsIHZhbHVlLCB1cCkge1xyXG4gICAgICAgIGxldCByZXN1bHQgPSBudWxsO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBsZW4gPSB2YWx1ZVNldHMubGVuZ3RoOyByZXN1bHQgPT09IG51bGwgJiYgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJlc3VsdCA9IHRoaXMudmFsdWVTZXRSZXBsYWNlKHZhbHVlU2V0c1tpXSwgdmFsdWUsIHVwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIHZhbHVlU2V0UmVwbGFjZSh2YWx1ZVNldCwgdmFsdWUsIHVwKSB7XHJcbiAgICAgICAgbGV0IGlkeCA9IHZhbHVlU2V0LmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgIGlmIChpZHggPj0gMCkge1xyXG4gICAgICAgICAgICBpZHggKz0gdXAgPyArMSA6IC0xO1xyXG4gICAgICAgICAgICBpZiAoaWR4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgaWR4ID0gdmFsdWVTZXQubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlkeCAlPSB2YWx1ZVNldC5sZW5ndGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlU2V0W2lkeF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcbkJhc2ljSW5wbGFjZVJlcGxhY2UuSU5TVEFOQ0UgPSBuZXcgQmFzaWNJbnBsYWNlUmVwbGFjZSgpO1xyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmNsYXNzIE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5uZXh0ID0gTm9kZS5VbmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5wcmV2ID0gTm9kZS5VbmRlZmluZWQ7XHJcbiAgICB9XHJcbn1cclxuTm9kZS5VbmRlZmluZWQgPSBuZXcgTm9kZSh1bmRlZmluZWQpO1xyXG5leHBvcnQgY2xhc3MgTGlua2VkTGlzdCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9maXJzdCA9IE5vZGUuVW5kZWZpbmVkO1xyXG4gICAgICAgIHRoaXMuX2xhc3QgPSBOb2RlLlVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl9zaXplID0gMDtcclxuICAgIH1cclxuICAgIGdldCBzaXplKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaXplO1xyXG4gICAgfVxyXG4gICAgaXNFbXB0eSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmlyc3QgPT09IE5vZGUuVW5kZWZpbmVkO1xyXG4gICAgfVxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9maXJzdDtcclxuICAgICAgICB3aGlsZSAobm9kZSAhPT0gTm9kZS5VbmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV4dCA9IG5vZGUubmV4dDtcclxuICAgICAgICAgICAgbm9kZS5wcmV2ID0gTm9kZS5VbmRlZmluZWQ7XHJcbiAgICAgICAgICAgIG5vZGUubmV4dCA9IE5vZGUuVW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBub2RlID0gbmV4dDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fZmlyc3QgPSBOb2RlLlVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl9sYXN0ID0gTm9kZS5VbmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fc2l6ZSA9IDA7XHJcbiAgICB9XHJcbiAgICB1bnNoaWZ0KGVsZW1lbnQpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faW5zZXJ0KGVsZW1lbnQsIGZhbHNlKTtcclxuICAgIH1cclxuICAgIHB1c2goZWxlbWVudCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pbnNlcnQoZWxlbWVudCwgdHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBfaW5zZXJ0KGVsZW1lbnQsIGF0VGhlRW5kKSB7XHJcbiAgICAgICAgY29uc3QgbmV3Tm9kZSA9IG5ldyBOb2RlKGVsZW1lbnQpO1xyXG4gICAgICAgIGlmICh0aGlzLl9maXJzdCA9PT0gTm9kZS5VbmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5fZmlyc3QgPSBuZXdOb2RlO1xyXG4gICAgICAgICAgICB0aGlzLl9sYXN0ID0gbmV3Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoYXRUaGVFbmQpIHtcclxuICAgICAgICAgICAgLy8gcHVzaFxyXG4gICAgICAgICAgICBjb25zdCBvbGRMYXN0ID0gdGhpcy5fbGFzdDtcclxuICAgICAgICAgICAgdGhpcy5fbGFzdCA9IG5ld05vZGU7XHJcbiAgICAgICAgICAgIG5ld05vZGUucHJldiA9IG9sZExhc3Q7XHJcbiAgICAgICAgICAgIG9sZExhc3QubmV4dCA9IG5ld05vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB1bnNoaWZ0XHJcbiAgICAgICAgICAgIGNvbnN0IG9sZEZpcnN0ID0gdGhpcy5fZmlyc3Q7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZpcnN0ID0gbmV3Tm9kZTtcclxuICAgICAgICAgICAgbmV3Tm9kZS5uZXh0ID0gb2xkRmlyc3Q7XHJcbiAgICAgICAgICAgIG9sZEZpcnN0LnByZXYgPSBuZXdOb2RlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9zaXplICs9IDE7XHJcbiAgICAgICAgbGV0IGRpZFJlbW92ZSA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICghZGlkUmVtb3ZlKSB7XHJcbiAgICAgICAgICAgICAgICBkaWRSZW1vdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fcmVtb3ZlKG5ld05vZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHNoaWZ0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9maXJzdCA9PT0gTm9kZS5VbmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IHRoaXMuX2ZpcnN0LmVsZW1lbnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbW92ZSh0aGlzLl9maXJzdCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcG9wKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9sYXN0ID09PSBOb2RlLlVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcmVzID0gdGhpcy5fbGFzdC5lbGVtZW50O1xyXG4gICAgICAgICAgICB0aGlzLl9yZW1vdmUodGhpcy5fbGFzdCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgX3JlbW92ZShub2RlKSB7XHJcbiAgICAgICAgaWYgKG5vZGUucHJldiAhPT0gTm9kZS5VbmRlZmluZWQgJiYgbm9kZS5uZXh0ICE9PSBOb2RlLlVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAvLyBtaWRkbGVcclxuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gbm9kZS5wcmV2O1xyXG4gICAgICAgICAgICBhbmNob3IubmV4dCA9IG5vZGUubmV4dDtcclxuICAgICAgICAgICAgbm9kZS5uZXh0LnByZXYgPSBhbmNob3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG5vZGUucHJldiA9PT0gTm9kZS5VbmRlZmluZWQgJiYgbm9kZS5uZXh0ID09PSBOb2RlLlVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAvLyBvbmx5IG5vZGVcclxuICAgICAgICAgICAgdGhpcy5fZmlyc3QgPSBOb2RlLlVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5fbGFzdCA9IE5vZGUuVW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChub2RlLm5leHQgPT09IE5vZGUuVW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIC8vIGxhc3RcclxuICAgICAgICAgICAgdGhpcy5fbGFzdCA9IHRoaXMuX2xhc3QucHJldjtcclxuICAgICAgICAgICAgdGhpcy5fbGFzdC5uZXh0ID0gTm9kZS5VbmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKG5vZGUucHJldiA9PT0gTm9kZS5VbmRlZmluZWQpIHtcclxuICAgICAgICAgICAgLy8gZmlyc3RcclxuICAgICAgICAgICAgdGhpcy5fZmlyc3QgPSB0aGlzLl9maXJzdC5uZXh0O1xyXG4gICAgICAgICAgICB0aGlzLl9maXJzdC5wcmV2ID0gTm9kZS5VbmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGRvbmVcclxuICAgICAgICB0aGlzLl9zaXplIC09IDE7XHJcbiAgICB9XHJcbiAgICAqW1N5bWJvbC5pdGVyYXRvcl0oKSB7XHJcbiAgICAgICAgbGV0IG5vZGUgPSB0aGlzLl9maXJzdDtcclxuICAgICAgICB3aGlsZSAobm9kZSAhPT0gTm9kZS5VbmRlZmluZWQpIHtcclxuICAgICAgICAgICAgeWllbGQgbm9kZS5lbGVtZW50O1xyXG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCB7IGdsb2JhbHMgfSBmcm9tICcuL3BsYXRmb3JtLmpzJztcclxuY29uc3QgaGFzUGVyZm9ybWFuY2VOb3cgPSAoZ2xvYmFscy5wZXJmb3JtYW5jZSAmJiB0eXBlb2YgZ2xvYmFscy5wZXJmb3JtYW5jZS5ub3cgPT09ICdmdW5jdGlvbicpO1xyXG5leHBvcnQgY2xhc3MgU3RvcFdhdGNoIHtcclxuICAgIGNvbnN0cnVjdG9yKGhpZ2hSZXNvbHV0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5faGlnaFJlc29sdXRpb24gPSBoYXNQZXJmb3JtYW5jZU5vdyAmJiBoaWdoUmVzb2x1dGlvbjtcclxuICAgICAgICB0aGlzLl9zdGFydFRpbWUgPSB0aGlzLl9ub3coKTtcclxuICAgICAgICB0aGlzLl9zdG9wVGltZSA9IC0xO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGNyZWF0ZShoaWdoUmVzb2x1dGlvbiA9IHRydWUpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFN0b3BXYXRjaChoaWdoUmVzb2x1dGlvbik7XHJcbiAgICB9XHJcbiAgICBzdG9wKCkge1xyXG4gICAgICAgIHRoaXMuX3N0b3BUaW1lID0gdGhpcy5fbm93KCk7XHJcbiAgICB9XHJcbiAgICBlbGFwc2VkKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zdG9wVGltZSAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3BUaW1lIC0gdGhpcy5fc3RhcnRUaW1lO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fbm93KCkgLSB0aGlzLl9zdGFydFRpbWU7XHJcbiAgICB9XHJcbiAgICBfbm93KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9oaWdoUmVzb2x1dGlvbiA/IGdsb2JhbHMucGVyZm9ybWFuY2Uubm93KCkgOiBEYXRlLm5vdygpO1xyXG4gICAgfVxyXG59XHJcbiIsICIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxuaW1wb3J0IHsgb25VbmV4cGVjdGVkRXJyb3IgfSBmcm9tICcuL2Vycm9ycy5qcyc7XHJcbmltcG9ydCB7IERpc3Bvc2FibGUsIGNvbWJpbmVkRGlzcG9zYWJsZSwgRGlzcG9zYWJsZVN0b3JlIH0gZnJvbSAnLi9saWZlY3ljbGUuanMnO1xyXG5pbXBvcnQgeyBMaW5rZWRMaXN0IH0gZnJvbSAnLi9saW5rZWRMaXN0LmpzJztcclxuaW1wb3J0IHsgU3RvcFdhdGNoIH0gZnJvbSAnLi9zdG9wd2F0Y2guanMnO1xyXG5leHBvcnQgdmFyIEV2ZW50O1xyXG4oZnVuY3Rpb24gKEV2ZW50KSB7XHJcbiAgICBFdmVudC5Ob25lID0gKCkgPT4gRGlzcG9zYWJsZS5Ob25lO1xyXG4gICAgLyoqXHJcbiAgICAgKiBHaXZlbiBhbiBldmVudCwgcmV0dXJucyBhbm90aGVyIGV2ZW50IHdoaWNoIG9ubHkgZmlyZXMgb25jZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gb25jZShldmVudCkge1xyXG4gICAgICAgIHJldHVybiAobGlzdGVuZXIsIHRoaXNBcmdzID0gbnVsbCwgZGlzcG9zYWJsZXMpID0+IHtcclxuICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGlzLCBpbiBjYXNlIHRoZSBldmVudCBmaXJlcyBkdXJpbmcgdGhlIGxpc3RlbmVyIGNhbGxcclxuICAgICAgICAgICAgbGV0IGRpZEZpcmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdDtcclxuICAgICAgICAgICAgcmVzdWx0ID0gZXZlbnQoZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlkRmlyZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkaWRGaXJlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBsaXN0ZW5lci5jYWxsKHRoaXNBcmdzLCBlKTtcclxuICAgICAgICAgICAgfSwgbnVsbCwgZGlzcG9zYWJsZXMpO1xyXG4gICAgICAgICAgICBpZiAoZGlkRmlyZSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0LmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICBFdmVudC5vbmNlID0gb25jZTtcclxuICAgIC8qKlxyXG4gICAgICogR2l2ZW4gYW4gZXZlbnQgYW5kIGEgYG1hcGAgZnVuY3Rpb24sIHJldHVybnMgYW5vdGhlciBldmVudCB3aGljaCBtYXBzIGVhY2ggZWxlbWVudFxyXG4gICAgICogdGhyb3VnaCB0aGUgbWFwcGluZyBmdW5jdGlvbi5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gbWFwKGV2ZW50LCBtYXApIHtcclxuICAgICAgICByZXR1cm4gc25hcHNob3QoKGxpc3RlbmVyLCB0aGlzQXJncyA9IG51bGwsIGRpc3Bvc2FibGVzKSA9PiBldmVudChpID0+IGxpc3RlbmVyLmNhbGwodGhpc0FyZ3MsIG1hcChpKSksIG51bGwsIGRpc3Bvc2FibGVzKSk7XHJcbiAgICB9XHJcbiAgICBFdmVudC5tYXAgPSBtYXA7XHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIGFuIGV2ZW50IGFuZCBhbiBgZWFjaGAgZnVuY3Rpb24sIHJldHVybnMgYW5vdGhlciBpZGVudGljYWwgZXZlbnQgYW5kIGNhbGxzXHJcbiAgICAgKiB0aGUgYGVhY2hgIGZ1bmN0aW9uIHBlciBlYWNoIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGZvckVhY2goZXZlbnQsIGVhY2gpIHtcclxuICAgICAgICByZXR1cm4gc25hcHNob3QoKGxpc3RlbmVyLCB0aGlzQXJncyA9IG51bGwsIGRpc3Bvc2FibGVzKSA9PiBldmVudChpID0+IHsgZWFjaChpKTsgbGlzdGVuZXIuY2FsbCh0aGlzQXJncywgaSk7IH0sIG51bGwsIGRpc3Bvc2FibGVzKSk7XHJcbiAgICB9XHJcbiAgICBFdmVudC5mb3JFYWNoID0gZm9yRWFjaDtcclxuICAgIGZ1bmN0aW9uIGZpbHRlcihldmVudCwgZmlsdGVyKSB7XHJcbiAgICAgICAgcmV0dXJuIHNuYXBzaG90KChsaXN0ZW5lciwgdGhpc0FyZ3MgPSBudWxsLCBkaXNwb3NhYmxlcykgPT4gZXZlbnQoZSA9PiBmaWx0ZXIoZSkgJiYgbGlzdGVuZXIuY2FsbCh0aGlzQXJncywgZSksIG51bGwsIGRpc3Bvc2FibGVzKSk7XHJcbiAgICB9XHJcbiAgICBFdmVudC5maWx0ZXIgPSBmaWx0ZXI7XHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIGFuIGV2ZW50LCByZXR1cm5zIHRoZSBzYW1lIGV2ZW50IGJ1dCB0eXBlZCBhcyBgRXZlbnQ8dm9pZD5gLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzaWduYWwoZXZlbnQpIHtcclxuICAgICAgICByZXR1cm4gZXZlbnQ7XHJcbiAgICB9XHJcbiAgICBFdmVudC5zaWduYWwgPSBzaWduYWw7XHJcbiAgICBmdW5jdGlvbiBhbnkoLi4uZXZlbnRzKSB7XHJcbiAgICAgICAgcmV0dXJuIChsaXN0ZW5lciwgdGhpc0FyZ3MgPSBudWxsLCBkaXNwb3NhYmxlcykgPT4gY29tYmluZWREaXNwb3NhYmxlKC4uLmV2ZW50cy5tYXAoZXZlbnQgPT4gZXZlbnQoZSA9PiBsaXN0ZW5lci5jYWxsKHRoaXNBcmdzLCBlKSwgbnVsbCwgZGlzcG9zYWJsZXMpKSk7XHJcbiAgICB9XHJcbiAgICBFdmVudC5hbnkgPSBhbnk7XHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIGFuIGV2ZW50IGFuZCBhIGBtZXJnZWAgZnVuY3Rpb24sIHJldHVybnMgYW5vdGhlciBldmVudCB3aGljaCBtYXBzIGVhY2ggZWxlbWVudFxyXG4gICAgICogYW5kIHRoZSBjdW11bGF0aXZlIHJlc3VsdCB0aHJvdWdoIHRoZSBgbWVyZ2VgIGZ1bmN0aW9uLiBTaW1pbGFyIHRvIGBtYXBgLCBidXQgd2l0aCBtZW1vcnkuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJlZHVjZShldmVudCwgbWVyZ2UsIGluaXRpYWwpIHtcclxuICAgICAgICBsZXQgb3V0cHV0ID0gaW5pdGlhbDtcclxuICAgICAgICByZXR1cm4gbWFwKGV2ZW50LCBlID0+IHtcclxuICAgICAgICAgICAgb3V0cHV0ID0gbWVyZ2Uob3V0cHV0LCBlKTtcclxuICAgICAgICAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIEV2ZW50LnJlZHVjZSA9IHJlZHVjZTtcclxuICAgIC8qKlxyXG4gICAgICogR2l2ZW4gYSBjaGFpbiBvZiBldmVudCBwcm9jZXNzaW5nIGZ1bmN0aW9ucyAoZmlsdGVyLCBtYXAsIGV0YyksIGVhY2hcclxuICAgICAqIGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCBwZXIgZXZlbnQgJiBwZXIgbGlzdGVuZXIuIFNuYXBzaG90dGluZyBhbiBldmVudFxyXG4gICAgICogY2hhaW4gYWxsb3dzIGVhY2ggZnVuY3Rpb24gdG8gYmUgaW52b2tlZCBqdXN0IG9uY2UgcGVyIGV2ZW50LlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzbmFwc2hvdChldmVudCkge1xyXG4gICAgICAgIGxldCBsaXN0ZW5lcjtcclxuICAgICAgICBjb25zdCBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoe1xyXG4gICAgICAgICAgICBvbkZpcnN0TGlzdGVuZXJBZGQoKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IGV2ZW50KGVtaXR0ZXIuZmlyZSwgZW1pdHRlcik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uTGFzdExpc3RlbmVyUmVtb3ZlKCkge1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGVtaXR0ZXIuZXZlbnQ7XHJcbiAgICB9XHJcbiAgICBFdmVudC5zbmFwc2hvdCA9IHNuYXBzaG90O1xyXG4gICAgZnVuY3Rpb24gZGVib3VuY2UoZXZlbnQsIG1lcmdlLCBkZWxheSA9IDEwMCwgbGVhZGluZyA9IGZhbHNlLCBsZWFrV2FybmluZ1RocmVzaG9sZCkge1xyXG4gICAgICAgIGxldCBzdWJzY3JpcHRpb247XHJcbiAgICAgICAgbGV0IG91dHB1dCA9IHVuZGVmaW5lZDtcclxuICAgICAgICBsZXQgaGFuZGxlID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIGxldCBudW1EZWJvdW5jZWRDYWxscyA9IDA7XHJcbiAgICAgICAgY29uc3QgZW1pdHRlciA9IG5ldyBFbWl0dGVyKHtcclxuICAgICAgICAgICAgbGVha1dhcm5pbmdUaHJlc2hvbGQsXHJcbiAgICAgICAgICAgIG9uRmlyc3RMaXN0ZW5lckFkZCgpIHtcclxuICAgICAgICAgICAgICAgIHN1YnNjcmlwdGlvbiA9IGV2ZW50KGN1ciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbnVtRGVib3VuY2VkQ2FsbHMrKztcclxuICAgICAgICAgICAgICAgICAgICBvdXRwdXQgPSBtZXJnZShvdXRwdXQsIGN1cik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlYWRpbmcgJiYgIWhhbmRsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbWl0dGVyLmZpcmUob3V0cHV0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlKTtcclxuICAgICAgICAgICAgICAgICAgICBoYW5kbGUgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgX291dHB1dCA9IG91dHB1dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbGVhZGluZyB8fCBudW1EZWJvdW5jZWRDYWxscyA+IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuZmlyZShfb3V0cHV0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW1EZWJvdW5jZWRDYWxscyA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uTGFzdExpc3RlbmVyUmVtb3ZlKCkge1xyXG4gICAgICAgICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBlbWl0dGVyLmV2ZW50O1xyXG4gICAgfVxyXG4gICAgRXZlbnQuZGVib3VuY2UgPSBkZWJvdW5jZTtcclxuICAgIC8qKlxyXG4gICAgICogR2l2ZW4gYW4gZXZlbnQsIGl0IHJldHVybnMgYW5vdGhlciBldmVudCB3aGljaCBmaXJlcyBvbmx5IG9uY2UgYW5kIGFzIHNvb24gYXNcclxuICAgICAqIHRoZSBpbnB1dCBldmVudCBlbWl0cy4gVGhlIGV2ZW50IGRhdGEgaXMgdGhlIG51bWJlciBvZiBtaWxsaXMgaXQgdG9vayBmb3IgdGhlXHJcbiAgICAgKiBldmVudCB0byBmaXJlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBzdG9wd2F0Y2goZXZlbnQpIHtcclxuICAgICAgICBjb25zdCBzdGFydCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHJldHVybiBtYXAob25jZShldmVudCksIF8gPT4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydCk7XHJcbiAgICB9XHJcbiAgICBFdmVudC5zdG9wd2F0Y2ggPSBzdG9wd2F0Y2g7XHJcbiAgICAvKipcclxuICAgICAqIEdpdmVuIGFuIGV2ZW50LCBpdCByZXR1cm5zIGFub3RoZXIgZXZlbnQgd2hpY2ggZmlyZXMgb25seSB3aGVuIHRoZSBldmVudFxyXG4gICAgICogZWxlbWVudCBjaGFuZ2VzLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBsYXRjaChldmVudCwgZXF1YWxzID0gKGEsIGIpID0+IGEgPT09IGIpIHtcclxuICAgICAgICBsZXQgZmlyc3RDYWxsID0gdHJ1ZTtcclxuICAgICAgICBsZXQgY2FjaGU7XHJcbiAgICAgICAgcmV0dXJuIGZpbHRlcihldmVudCwgdmFsdWUgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBzaG91bGRFbWl0ID0gZmlyc3RDYWxsIHx8ICFlcXVhbHModmFsdWUsIGNhY2hlKTtcclxuICAgICAgICAgICAgZmlyc3RDYWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhY2hlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHJldHVybiBzaG91bGRFbWl0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgRXZlbnQubGF0Y2ggPSBsYXRjaDtcclxuICAgIC8qKlxyXG4gICAgICogR2l2ZW4gYW4gZXZlbnQsIGl0IHJldHVybnMgYW5vdGhlciBldmVudCB3aGljaCBmaXJlcyBvbmx5IHdoZW4gdGhlIGV2ZW50XHJcbiAgICAgKiBlbGVtZW50IGNoYW5nZXMuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHNwbGl0KGV2ZW50LCBpc1QpIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICBFdmVudC5maWx0ZXIoZXZlbnQsIGlzVCksXHJcbiAgICAgICAgICAgIEV2ZW50LmZpbHRlcihldmVudCwgZSA9PiAhaXNUKGUpKSxcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgRXZlbnQuc3BsaXQgPSBzcGxpdDtcclxuICAgIC8qKlxyXG4gICAgICogQnVmZmVycyB0aGUgcHJvdmlkZWQgZXZlbnQgdW50aWwgYSBmaXJzdCBsaXN0ZW5lciBjb21lc1xyXG4gICAgICogYWxvbmcsIGF0IHdoaWNoIHBvaW50IGZpcmUgYWxsIHRoZSBldmVudHMgYXQgb25jZSBhbmRcclxuICAgICAqIHBpcGUgdGhlIGV2ZW50IGZyb20gdGhlbiBvbi5cclxuICAgICAqXHJcbiAgICAgKiBgYGB0eXBlc2NyaXB0XHJcbiAgICAgKiBjb25zdCBlbWl0dGVyID0gbmV3IEVtaXR0ZXI8bnVtYmVyPigpO1xyXG4gICAgICogY29uc3QgZXZlbnQgPSBlbWl0dGVyLmV2ZW50O1xyXG4gICAgICogY29uc3QgYnVmZmVyZWRFdmVudCA9IGJ1ZmZlcihldmVudCk7XHJcbiAgICAgKlxyXG4gICAgICogZW1pdHRlci5maXJlKDEpO1xyXG4gICAgICogZW1pdHRlci5maXJlKDIpO1xyXG4gICAgICogZW1pdHRlci5maXJlKDMpO1xyXG4gICAgICogLy8gbm90aGluZy4uLlxyXG4gICAgICpcclxuICAgICAqIGNvbnN0IGxpc3RlbmVyID0gYnVmZmVyZWRFdmVudChudW0gPT4gY29uc29sZS5sb2cobnVtKSk7XHJcbiAgICAgKiAvLyAxLCAyLCAzXHJcbiAgICAgKlxyXG4gICAgICogZW1pdHRlci5maXJlKDQpO1xyXG4gICAgICogLy8gNFxyXG4gICAgICogYGBgXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGJ1ZmZlcihldmVudCwgbmV4dFRpY2sgPSBmYWxzZSwgX2J1ZmZlciA9IFtdKSB7XHJcbiAgICAgICAgbGV0IGJ1ZmZlciA9IF9idWZmZXIuc2xpY2UoKTtcclxuICAgICAgICBsZXQgbGlzdGVuZXIgPSBldmVudChlID0+IHtcclxuICAgICAgICAgICAgaWYgKGJ1ZmZlcikge1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyLnB1c2goZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbWl0dGVyLmZpcmUoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBjb25zdCBmbHVzaCA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKGJ1ZmZlcikge1xyXG4gICAgICAgICAgICAgICAgYnVmZmVyLmZvckVhY2goZSA9PiBlbWl0dGVyLmZpcmUoZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJ1ZmZlciA9IG51bGw7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBjb25zdCBlbWl0dGVyID0gbmV3IEVtaXR0ZXIoe1xyXG4gICAgICAgICAgICBvbkZpcnN0TGlzdGVuZXJBZGQoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIgPSBldmVudChlID0+IGVtaXR0ZXIuZmlyZShlKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uRmlyc3RMaXN0ZW5lckRpZEFkZCgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChidWZmZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dFRpY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbHVzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25MYXN0TGlzdGVuZXJSZW1vdmUoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lciA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZW1pdHRlci5ldmVudDtcclxuICAgIH1cclxuICAgIEV2ZW50LmJ1ZmZlciA9IGJ1ZmZlcjtcclxuICAgIGNsYXNzIENoYWluYWJsZUV2ZW50IHtcclxuICAgICAgICBjb25zdHJ1Y3RvcihldmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50ID0gZXZlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG1hcChmbikge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENoYWluYWJsZUV2ZW50KG1hcCh0aGlzLmV2ZW50LCBmbikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3JFYWNoKGZuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ2hhaW5hYmxlRXZlbnQoZm9yRWFjaCh0aGlzLmV2ZW50LCBmbikpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaWx0ZXIoZm4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDaGFpbmFibGVFdmVudChmaWx0ZXIodGhpcy5ldmVudCwgZm4pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVkdWNlKG1lcmdlLCBpbml0aWFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ2hhaW5hYmxlRXZlbnQocmVkdWNlKHRoaXMuZXZlbnQsIG1lcmdlLCBpbml0aWFsKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxhdGNoKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IENoYWluYWJsZUV2ZW50KGxhdGNoKHRoaXMuZXZlbnQpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGVib3VuY2UobWVyZ2UsIGRlbGF5ID0gMTAwLCBsZWFkaW5nID0gZmFsc2UsIGxlYWtXYXJuaW5nVGhyZXNob2xkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ2hhaW5hYmxlRXZlbnQoZGVib3VuY2UodGhpcy5ldmVudCwgbWVyZ2UsIGRlbGF5LCBsZWFkaW5nLCBsZWFrV2FybmluZ1RocmVzaG9sZCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvbihsaXN0ZW5lciwgdGhpc0FyZ3MsIGRpc3Bvc2FibGVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV2ZW50KGxpc3RlbmVyLCB0aGlzQXJncywgZGlzcG9zYWJsZXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvbmNlKGxpc3RlbmVyLCB0aGlzQXJncywgZGlzcG9zYWJsZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG9uY2UodGhpcy5ldmVudCkobGlzdGVuZXIsIHRoaXNBcmdzLCBkaXNwb3NhYmxlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gY2hhaW4oZXZlbnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IENoYWluYWJsZUV2ZW50KGV2ZW50KTtcclxuICAgIH1cclxuICAgIEV2ZW50LmNoYWluID0gY2hhaW47XHJcbiAgICBmdW5jdGlvbiBmcm9tTm9kZUV2ZW50RW1pdHRlcihlbWl0dGVyLCBldmVudE5hbWUsIG1hcCA9IGlkID0+IGlkKSB7XHJcbiAgICAgICAgY29uc3QgZm4gPSAoLi4uYXJncykgPT4gcmVzdWx0LmZpcmUobWFwKC4uLmFyZ3MpKTtcclxuICAgICAgICBjb25zdCBvbkZpcnN0TGlzdGVuZXJBZGQgPSAoKSA9PiBlbWl0dGVyLm9uKGV2ZW50TmFtZSwgZm4pO1xyXG4gICAgICAgIGNvbnN0IG9uTGFzdExpc3RlbmVyUmVtb3ZlID0gKCkgPT4gZW1pdHRlci5yZW1vdmVMaXN0ZW5lcihldmVudE5hbWUsIGZuKTtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgRW1pdHRlcih7IG9uRmlyc3RMaXN0ZW5lckFkZCwgb25MYXN0TGlzdGVuZXJSZW1vdmUgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5ldmVudDtcclxuICAgIH1cclxuICAgIEV2ZW50LmZyb21Ob2RlRXZlbnRFbWl0dGVyID0gZnJvbU5vZGVFdmVudEVtaXR0ZXI7XHJcbiAgICBmdW5jdGlvbiBmcm9tRE9NRXZlbnRFbWl0dGVyKGVtaXR0ZXIsIGV2ZW50TmFtZSwgbWFwID0gaWQgPT4gaWQpIHtcclxuICAgICAgICBjb25zdCBmbiA9ICguLi5hcmdzKSA9PiByZXN1bHQuZmlyZShtYXAoLi4uYXJncykpO1xyXG4gICAgICAgIGNvbnN0IG9uRmlyc3RMaXN0ZW5lckFkZCA9ICgpID0+IGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZuKTtcclxuICAgICAgICBjb25zdCBvbkxhc3RMaXN0ZW5lclJlbW92ZSA9ICgpID0+IGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGZuKTtcclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZXcgRW1pdHRlcih7IG9uRmlyc3RMaXN0ZW5lckFkZCwgb25MYXN0TGlzdGVuZXJSZW1vdmUgfSk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5ldmVudDtcclxuICAgIH1cclxuICAgIEV2ZW50LmZyb21ET01FdmVudEVtaXR0ZXIgPSBmcm9tRE9NRXZlbnRFbWl0dGVyO1xyXG4gICAgZnVuY3Rpb24gZnJvbVByb21pc2UocHJvbWlzZSkge1xyXG4gICAgICAgIGNvbnN0IGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICAgIGxldCBzaG91bGRFbWl0ID0gZmFsc2U7XHJcbiAgICAgICAgcHJvbWlzZVxyXG4gICAgICAgICAgICAudGhlbih1bmRlZmluZWQsICgpID0+IG51bGwpXHJcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKCFzaG91bGRFbWl0KSB7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGVtaXR0ZXIuZmlyZSh1bmRlZmluZWQpLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVtaXR0ZXIuZmlyZSh1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2hvdWxkRW1pdCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIGVtaXR0ZXIuZXZlbnQ7XHJcbiAgICB9XHJcbiAgICBFdmVudC5mcm9tUHJvbWlzZSA9IGZyb21Qcm9taXNlO1xyXG4gICAgZnVuY3Rpb24gdG9Qcm9taXNlKGV2ZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gb25jZShldmVudCkocmVzb2x2ZSkpO1xyXG4gICAgfVxyXG4gICAgRXZlbnQudG9Qcm9taXNlID0gdG9Qcm9taXNlO1xyXG59KShFdmVudCB8fCAoRXZlbnQgPSB7fSkpO1xyXG5jbGFzcyBFdmVudFByb2ZpbGluZyB7XHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lKSB7XHJcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJDb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5faW52b2NhdGlvbkNvdW50ID0gMDtcclxuICAgICAgICB0aGlzLl9lbGFwc2VkT3ZlcmFsbCA9IDA7XHJcbiAgICAgICAgdGhpcy5fbmFtZSA9IGAke25hbWV9XyR7RXZlbnRQcm9maWxpbmcuX2lkUG9vbCsrfWA7XHJcbiAgICB9XHJcbiAgICBzdGFydChsaXN0ZW5lckNvdW50KSB7XHJcbiAgICAgICAgdGhpcy5fc3RvcFdhdGNoID0gbmV3IFN0b3BXYXRjaCh0cnVlKTtcclxuICAgICAgICB0aGlzLl9saXN0ZW5lckNvdW50ID0gbGlzdGVuZXJDb3VudDtcclxuICAgIH1cclxuICAgIHN0b3AoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3N0b3BXYXRjaCkge1xyXG4gICAgICAgICAgICBjb25zdCBlbGFwc2VkID0gdGhpcy5fc3RvcFdhdGNoLmVsYXBzZWQoKTtcclxuICAgICAgICAgICAgdGhpcy5fZWxhcHNlZE92ZXJhbGwgKz0gZWxhcHNlZDtcclxuICAgICAgICAgICAgdGhpcy5faW52b2NhdGlvbkNvdW50ICs9IDE7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhgZGlkIEZJUkUgJHt0aGlzLl9uYW1lfTogZWxhcHNlZF9tczogJHtlbGFwc2VkLnRvRml4ZWQoNSl9LCBsaXN0ZW5lcjogJHt0aGlzLl9saXN0ZW5lckNvdW50fSAoZWxhcHNlZF9vdmVyYWxsOiAke3RoaXMuX2VsYXBzZWRPdmVyYWxsLnRvRml4ZWQoMil9LCBpbnZvY2F0aW9uczogJHt0aGlzLl9pbnZvY2F0aW9uQ291bnR9KWApO1xyXG4gICAgICAgICAgICB0aGlzLl9zdG9wV2F0Y2ggPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbkV2ZW50UHJvZmlsaW5nLl9pZFBvb2wgPSAwO1xyXG5sZXQgX2dsb2JhbExlYWtXYXJuaW5nVGhyZXNob2xkID0gLTE7XHJcbmNsYXNzIExlYWthZ2VNb25pdG9yIHtcclxuICAgIGNvbnN0cnVjdG9yKGN1c3RvbVRocmVzaG9sZCwgbmFtZSA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMTgpLnNsaWNlKDIsIDUpKSB7XHJcbiAgICAgICAgdGhpcy5jdXN0b21UaHJlc2hvbGQgPSBjdXN0b21UaHJlc2hvbGQ7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLl93YXJuQ291bnRkb3duID0gMDtcclxuICAgIH1cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3N0YWNrcykge1xyXG4gICAgICAgICAgICB0aGlzLl9zdGFja3MuY2xlYXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjaGVjayhsaXN0ZW5lckNvdW50KSB7XHJcbiAgICAgICAgbGV0IHRocmVzaG9sZCA9IF9nbG9iYWxMZWFrV2FybmluZ1RocmVzaG9sZDtcclxuICAgICAgICBpZiAodHlwZW9mIHRoaXMuY3VzdG9tVGhyZXNob2xkID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICB0aHJlc2hvbGQgPSB0aGlzLmN1c3RvbVRocmVzaG9sZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRocmVzaG9sZCA8PSAwIHx8IGxpc3RlbmVyQ291bnQgPCB0aHJlc2hvbGQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9zdGFja3MpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3RhY2tzID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrLnNwbGl0KCdcXG4nKS5zbGljZSgzKS5qb2luKCdcXG4nKTtcclxuICAgICAgICBjb25zdCBjb3VudCA9ICh0aGlzLl9zdGFja3MuZ2V0KHN0YWNrKSB8fCAwKTtcclxuICAgICAgICB0aGlzLl9zdGFja3Muc2V0KHN0YWNrLCBjb3VudCArIDEpO1xyXG4gICAgICAgIHRoaXMuX3dhcm5Db3VudGRvd24gLT0gMTtcclxuICAgICAgICBpZiAodGhpcy5fd2FybkNvdW50ZG93biA8PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgd2FybiBvbiBmaXJzdCBleGNlZWQgYW5kIHRoZW4gZXZlcnkgdGltZSB0aGUgbGltaXRcclxuICAgICAgICAgICAgLy8gaXMgZXhjZWVkZWQgYnkgNTAlIGFnYWluXHJcbiAgICAgICAgICAgIHRoaXMuX3dhcm5Db3VudGRvd24gPSB0aHJlc2hvbGQgKiAwLjU7XHJcbiAgICAgICAgICAgIC8vIGZpbmQgbW9zdCBmcmVxdWVudCBsaXN0ZW5lciBhbmQgcHJpbnQgd2FybmluZ1xyXG4gICAgICAgICAgICBsZXQgdG9wU3RhY2s7XHJcbiAgICAgICAgICAgIGxldCB0b3BDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgW3N0YWNrLCBjb3VudF0gb2YgdGhpcy5fc3RhY2tzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRvcFN0YWNrIHx8IHRvcENvdW50IDwgY291bnQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0b3BTdGFjayA9IHN0YWNrO1xyXG4gICAgICAgICAgICAgICAgICAgIHRvcENvdW50ID0gY291bnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS53YXJuKGBbJHt0aGlzLm5hbWV9XSBwb3RlbnRpYWwgbGlzdGVuZXIgTEVBSyBkZXRlY3RlZCwgaGF2aW5nICR7bGlzdGVuZXJDb3VudH0gbGlzdGVuZXJzIGFscmVhZHkuIE1PU1QgZnJlcXVlbnQgbGlzdGVuZXIgKCR7dG9wQ291bnR9KTpgKTtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKHRvcFN0YWNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY291bnQgPSAodGhpcy5fc3RhY2tzLmdldChzdGFjaykgfHwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0YWNrcy5zZXQoc3RhY2ssIGNvdW50IC0gMSk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogVGhlIEVtaXR0ZXIgY2FuIGJlIHVzZWQgdG8gZXhwb3NlIGFuIEV2ZW50IHRvIHRoZSBwdWJsaWNcclxuICogdG8gZmlyZSBpdCBmcm9tIHRoZSBpbnNpZGVzLlxyXG4gKiBTYW1wbGU6XHJcbiAgICBjbGFzcyBEb2N1bWVudCB7XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgX29uRGlkQ2hhbmdlID0gbmV3IEVtaXR0ZXI8KHZhbHVlOnN0cmluZyk9PmFueT4oKTtcclxuXHJcbiAgICAgICAgcHVibGljIG9uRGlkQ2hhbmdlID0gdGhpcy5fb25EaWRDaGFuZ2UuZXZlbnQ7XHJcblxyXG4gICAgICAgIC8vIGdldHRlci1zdHlsZVxyXG4gICAgICAgIC8vIGdldCBvbkRpZENoYW5nZSgpOiBFdmVudDwodmFsdWU6c3RyaW5nKT0+YW55PiB7XHJcbiAgICAgICAgLy8gXHRyZXR1cm4gdGhpcy5fb25EaWRDaGFuZ2UuZXZlbnQ7XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBwcml2YXRlIF9kb0l0KCkge1xyXG4gICAgICAgICAgICAvLy4uLlxyXG4gICAgICAgICAgICB0aGlzLl9vbkRpZENoYW5nZS5maXJlKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRW1pdHRlciB7XHJcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIHRoaXMuX2Rpc3Bvc2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5fbGVha2FnZU1vbiA9IF9nbG9iYWxMZWFrV2FybmluZ1RocmVzaG9sZCA+IDAgPyBuZXcgTGVha2FnZU1vbml0b3IodGhpcy5fb3B0aW9ucyAmJiB0aGlzLl9vcHRpb25zLmxlYWtXYXJuaW5nVGhyZXNob2xkKSA6IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLl9wZXJmTW9uID0gKChfYSA9IHRoaXMuX29wdGlvbnMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5fcHJvZk5hbWUpID8gbmV3IEV2ZW50UHJvZmlsaW5nKHRoaXMuX29wdGlvbnMuX3Byb2ZOYW1lKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogRm9yIHRoZSBwdWJsaWMgdG8gYWxsb3cgdG8gc3Vic2NyaWJlXHJcbiAgICAgKiB0byBldmVudHMgZnJvbSB0aGlzIEVtaXR0ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0IGV2ZW50KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fZXZlbnQgPSAobGlzdGVuZXIsIHRoaXNBcmdzLCBkaXNwb3NhYmxlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9saXN0ZW5lcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMgPSBuZXcgTGlua2VkTGlzdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZmlyc3RMaXN0ZW5lciA9IHRoaXMuX2xpc3RlbmVycy5pc0VtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3RMaXN0ZW5lciAmJiB0aGlzLl9vcHRpb25zICYmIHRoaXMuX29wdGlvbnMub25GaXJzdExpc3RlbmVyQWRkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9ucy5vbkZpcnN0TGlzdGVuZXJBZGQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZW1vdmUgPSB0aGlzLl9saXN0ZW5lcnMucHVzaCghdGhpc0FyZ3MgPyBsaXN0ZW5lciA6IFtsaXN0ZW5lciwgdGhpc0FyZ3NdKTtcclxuICAgICAgICAgICAgICAgIGlmIChmaXJzdExpc3RlbmVyICYmIHRoaXMuX29wdGlvbnMgJiYgdGhpcy5fb3B0aW9ucy5vbkZpcnN0TGlzdGVuZXJEaWRBZGQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vcHRpb25zLm9uRmlyc3RMaXN0ZW5lckRpZEFkZCh0aGlzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vcHRpb25zICYmIHRoaXMuX29wdGlvbnMub25MaXN0ZW5lckRpZEFkZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29wdGlvbnMub25MaXN0ZW5lckRpZEFkZCh0aGlzLCBsaXN0ZW5lciwgdGhpc0FyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgYW5kIHJlY29yZCB0aGlzIGVtaXR0ZXIgZm9yIHBvdGVudGlhbCBsZWFrYWdlXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZW1vdmVNb25pdG9yID0gKF9hID0gdGhpcy5fbGVha2FnZU1vbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmNoZWNrKHRoaXMuX2xpc3RlbmVycy5zaXplKTtcclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQ7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtb3ZlTW9uaXRvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTW9uaXRvcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5kaXNwb3NlID0gRW1pdHRlci5fbm9vcDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9kaXNwb3NlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fb3B0aW9ucyAmJiB0aGlzLl9vcHRpb25zLm9uTGFzdExpc3RlbmVyUmVtb3ZlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzTGlzdGVuZXJzID0gKHRoaXMuX2xpc3RlbmVycyAmJiAhdGhpcy5fbGlzdGVuZXJzLmlzRW1wdHkoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFoYXNMaXN0ZW5lcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb3B0aW9ucy5vbkxhc3RMaXN0ZW5lclJlbW92ZSh0aGlzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpc3Bvc2FibGVzIGluc3RhbmNlb2YgRGlzcG9zYWJsZVN0b3JlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcG9zYWJsZXMuYWRkKHJlc3VsdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRpc3Bvc2FibGVzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3Bvc2FibGVzLnB1c2gocmVzdWx0KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudDtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVG8gYmUga2VwdCBwcml2YXRlIHRvIGZpcmUgYW4gZXZlbnQgdG9cclxuICAgICAqIHN1YnNjcmliZXJzXHJcbiAgICAgKi9cclxuICAgIGZpcmUoZXZlbnQpIHtcclxuICAgICAgICB2YXIgX2EsIF9iO1xyXG4gICAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnMpIHtcclxuICAgICAgICAgICAgLy8gcHV0IGFsbCBbbGlzdGVuZXIsZXZlbnRdLXBhaXJzIGludG8gZGVsaXZlcnkgcXVldWVcclxuICAgICAgICAgICAgLy8gdGhlbiBlbWl0IGFsbCBldmVudC4gYW4gaW5uZXIvbmVzdGVkIGV2ZW50IG1pZ2h0IGJlXHJcbiAgICAgICAgICAgIC8vIHRoZSBkcml2ZXIgb2YgdGhpc1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuX2RlbGl2ZXJ5UXVldWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RlbGl2ZXJ5UXVldWUgPSBuZXcgTGlua2VkTGlzdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuX2xpc3RlbmVycykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZGVsaXZlcnlRdWV1ZS5wdXNoKFtsaXN0ZW5lciwgZXZlbnRdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBzdGFydC9zdG9wIHBlcmZvcm1hbmNlIGluc2lnaHQgY29sbGVjdGlvblxyXG4gICAgICAgICAgICAoX2EgPSB0aGlzLl9wZXJmTW9uKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Euc3RhcnQodGhpcy5fZGVsaXZlcnlRdWV1ZS5zaXplKTtcclxuICAgICAgICAgICAgd2hpbGUgKHRoaXMuX2RlbGl2ZXJ5UXVldWUuc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IFtsaXN0ZW5lciwgZXZlbnRdID0gdGhpcy5fZGVsaXZlcnlRdWV1ZS5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyLmNhbGwodW5kZWZpbmVkLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lclswXS5jYWxsKGxpc3RlbmVyWzFdLCBldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvblVuZXhwZWN0ZWRFcnJvcihlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAoX2IgPSB0aGlzLl9wZXJmTW9uKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Iuc3RvcCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZTtcclxuICAgICAgICBpZiAoIXRoaXMuX2Rpc3Bvc2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2Rpc3Bvc2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgKF9hID0gdGhpcy5fbGlzdGVuZXJzKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2xlYXIoKTtcclxuICAgICAgICAgICAgKF9iID0gdGhpcy5fZGVsaXZlcnlRdWV1ZSkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIChfZCA9IChfYyA9IHRoaXMuX29wdGlvbnMpID09PSBudWxsIHx8IF9jID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYy5vbkxhc3RMaXN0ZW5lclJlbW92ZSkgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmNhbGwoX2MpO1xyXG4gICAgICAgICAgICAoX2UgPSB0aGlzLl9sZWFrYWdlTW9uKSA9PT0gbnVsbCB8fCBfZSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2UuZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5FbWl0dGVyLl9ub29wID0gZnVuY3Rpb24gKCkgeyB9O1xyXG5leHBvcnQgY2xhc3MgUGF1c2VhYmxlRW1pdHRlciBleHRlbmRzIEVtaXR0ZXIge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMuX2lzUGF1c2VkID0gMDtcclxuICAgICAgICB0aGlzLl9ldmVudFF1ZXVlID0gbmV3IExpbmtlZExpc3QoKTtcclxuICAgICAgICB0aGlzLl9tZXJnZUZuID0gb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb25zLm1lcmdlO1xyXG4gICAgfVxyXG4gICAgcGF1c2UoKSB7XHJcbiAgICAgICAgdGhpcy5faXNQYXVzZWQrKztcclxuICAgIH1cclxuICAgIHJlc3VtZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5faXNQYXVzZWQgIT09IDAgJiYgLS10aGlzLl9pc1BhdXNlZCA9PT0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fbWVyZ2VGbikge1xyXG4gICAgICAgICAgICAgICAgLy8gdXNlIHRoZSBtZXJnZSBmdW5jdGlvbiB0byBjcmVhdGUgYSBzaW5nbGUgY29tcG9zaXRlXHJcbiAgICAgICAgICAgICAgICAvLyBldmVudC4gbWFrZSBhIGNvcHkgaW4gY2FzZSBmaXJpbmcgcGF1c2VzIHRoaXMgZW1pdHRlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gQXJyYXkuZnJvbSh0aGlzLl9ldmVudFF1ZXVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50UXVldWUuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgIHN1cGVyLmZpcmUodGhpcy5fbWVyZ2VGbihldmVudHMpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIG5vIG1lcmdpbmcsIGZpcmUgZWFjaCBldmVudCBpbmRpdmlkdWFsbHkgYW5kIHRlc3RcclxuICAgICAgICAgICAgICAgIC8vIHRoYXQgdGhpcyBlbWl0dGVyIGlzbid0IHBhdXNlZCBoYWxmd2F5IHRocm91Z2hcclxuICAgICAgICAgICAgICAgIHdoaWxlICghdGhpcy5faXNQYXVzZWQgJiYgdGhpcy5fZXZlbnRRdWV1ZS5zaXplICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3VwZXIuZmlyZSh0aGlzLl9ldmVudFF1ZXVlLnNoaWZ0KCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZmlyZShldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9saXN0ZW5lcnMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzUGF1c2VkICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudFF1ZXVlLnB1c2goZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3VwZXIuZmlyZShldmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIFRoZSBFdmVudEJ1ZmZlcmVyIGlzIHVzZWZ1bCBpbiBzaXR1YXRpb25zIGluIHdoaWNoIHlvdSB3YW50XHJcbiAqIHRvIGRlbGF5IGZpcmluZyB5b3VyIGV2ZW50cyBkdXJpbmcgc29tZSBjb2RlLlxyXG4gKiBZb3UgY2FuIHdyYXAgdGhhdCBjb2RlIGFuZCBiZSBzdXJlIHRoYXQgdGhlIGV2ZW50IHdpbGwgbm90XHJcbiAqIGJlIGZpcmVkIGR1cmluZyB0aGF0IHdyYXAuXHJcbiAqXHJcbiAqIGBgYFxyXG4gKiBjb25zdCBlbWl0dGVyOiBFbWl0dGVyO1xyXG4gKiBjb25zdCBkZWxheWVyID0gbmV3IEV2ZW50RGVsYXllcigpO1xyXG4gKiBjb25zdCBkZWxheWVkRXZlbnQgPSBkZWxheWVyLndyYXBFdmVudChlbWl0dGVyLmV2ZW50KTtcclxuICpcclxuICogZGVsYXllZEV2ZW50KGNvbnNvbGUubG9nKTtcclxuICpcclxuICogZGVsYXllci5idWZmZXJFdmVudHMoKCkgPT4ge1xyXG4gKiAgIGVtaXR0ZXIuZmlyZSgpOyAvLyBldmVudCB3aWxsIG5vdCBiZSBmaXJlZCB5ZXRcclxuICogfSk7XHJcbiAqXHJcbiAqIC8vIGV2ZW50IHdpbGwgb25seSBiZSBmaXJlZCBhdCB0aGlzIHBvaW50XHJcbiAqIGBgYFxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEV2ZW50QnVmZmVyZXIge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5idWZmZXJzID0gW107XHJcbiAgICB9XHJcbiAgICB3cmFwRXZlbnQoZXZlbnQpIHtcclxuICAgICAgICByZXR1cm4gKGxpc3RlbmVyLCB0aGlzQXJncywgZGlzcG9zYWJsZXMpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50KGkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy5idWZmZXJzW3RoaXMuYnVmZmVycy5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgIGlmIChidWZmZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICBidWZmZXIucHVzaCgoKSA9PiBsaXN0ZW5lci5jYWxsKHRoaXNBcmdzLCBpKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lci5jYWxsKHRoaXNBcmdzLCBpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdW5kZWZpbmVkLCBkaXNwb3NhYmxlcyk7XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGJ1ZmZlckV2ZW50cyhmbikge1xyXG4gICAgICAgIGNvbnN0IGJ1ZmZlciA9IFtdO1xyXG4gICAgICAgIHRoaXMuYnVmZmVycy5wdXNoKGJ1ZmZlcik7XHJcbiAgICAgICAgY29uc3QgciA9IGZuKCk7XHJcbiAgICAgICAgdGhpcy5idWZmZXJzLnBvcCgpO1xyXG4gICAgICAgIGJ1ZmZlci5mb3JFYWNoKGZsdXNoID0+IGZsdXNoKCkpO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBBIFJlbGF5IGlzIGFuIGV2ZW50IGZvcndhcmRlciB3aGljaCBmdW5jdGlvbnMgYXMgYSByZXBsdWdhYmJsZSBldmVudCBwaXBlLlxyXG4gKiBPbmNlIGNyZWF0ZWQsIHlvdSBjYW4gY29ubmVjdCBhbiBpbnB1dCBldmVudCB0byBpdCBhbmQgaXQgd2lsbCBzaW1wbHkgZm9yd2FyZFxyXG4gKiBldmVudHMgZnJvbSB0aGF0IGlucHV0IGV2ZW50IHRocm91Z2ggaXRzIG93biBgZXZlbnRgIHByb3BlcnR5LiBUaGUgYGlucHV0YFxyXG4gKiBjYW4gYmUgY2hhbmdlZCBhdCBhbnkgcG9pbnQgaW4gdGltZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBSZWxheSB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmxpc3RlbmluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaW5wdXRFdmVudCA9IEV2ZW50Lk5vbmU7XHJcbiAgICAgICAgdGhpcy5pbnB1dEV2ZW50TGlzdGVuZXIgPSBEaXNwb3NhYmxlLk5vbmU7XHJcbiAgICAgICAgdGhpcy5lbWl0dGVyID0gbmV3IEVtaXR0ZXIoe1xyXG4gICAgICAgICAgICBvbkZpcnN0TGlzdGVuZXJEaWRBZGQ6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGlzdGVuaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXRFdmVudExpc3RlbmVyID0gdGhpcy5pbnB1dEV2ZW50KHRoaXMuZW1pdHRlci5maXJlLCB0aGlzLmVtaXR0ZXIpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkxhc3RMaXN0ZW5lclJlbW92ZTogKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saXN0ZW5pbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXRFdmVudExpc3RlbmVyLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZXZlbnQgPSB0aGlzLmVtaXR0ZXIuZXZlbnQ7XHJcbiAgICB9XHJcbiAgICBzZXQgaW5wdXQoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLmlucHV0RXZlbnQgPSBldmVudDtcclxuICAgICAgICBpZiAodGhpcy5saXN0ZW5pbmcpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dEV2ZW50TGlzdGVuZXIuZGlzcG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0RXZlbnRMaXN0ZW5lciA9IGV2ZW50KHRoaXMuZW1pdHRlci5maXJlLCB0aGlzLmVtaXR0ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5pbnB1dEV2ZW50TGlzdGVuZXIuZGlzcG9zZSgpO1xyXG4gICAgICAgIHRoaXMuZW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgICB9XHJcbn1cclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5pbXBvcnQgeyBFbWl0dGVyLCBFdmVudCB9IGZyb20gJy4vZXZlbnQuanMnO1xyXG5jb25zdCBzaG9ydGN1dEV2ZW50ID0gT2JqZWN0LmZyZWV6ZShmdW5jdGlvbiAoY2FsbGJhY2ssIGNvbnRleHQpIHtcclxuICAgIGNvbnN0IGhhbmRsZSA9IHNldFRpbWVvdXQoY2FsbGJhY2suYmluZChjb250ZXh0KSwgMCk7XHJcbiAgICByZXR1cm4geyBkaXNwb3NlKCkgeyBjbGVhclRpbWVvdXQoaGFuZGxlKTsgfSB9O1xyXG59KTtcclxuZXhwb3J0IHZhciBDYW5jZWxsYXRpb25Ub2tlbjtcclxuKGZ1bmN0aW9uIChDYW5jZWxsYXRpb25Ub2tlbikge1xyXG4gICAgZnVuY3Rpb24gaXNDYW5jZWxsYXRpb25Ub2tlbih0aGluZykge1xyXG4gICAgICAgIGlmICh0aGluZyA9PT0gQ2FuY2VsbGF0aW9uVG9rZW4uTm9uZSB8fCB0aGluZyA9PT0gQ2FuY2VsbGF0aW9uVG9rZW4uQ2FuY2VsbGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpbmcgaW5zdGFuY2VvZiBNdXRhYmxlVG9rZW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpbmcgfHwgdHlwZW9mIHRoaW5nICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0eXBlb2YgdGhpbmcuaXNDYW5jZWxsYXRpb25SZXF1ZXN0ZWQgPT09ICdib29sZWFuJ1xyXG4gICAgICAgICAgICAmJiB0eXBlb2YgdGhpbmcub25DYW5jZWxsYXRpb25SZXF1ZXN0ZWQgPT09ICdmdW5jdGlvbic7XHJcbiAgICB9XHJcbiAgICBDYW5jZWxsYXRpb25Ub2tlbi5pc0NhbmNlbGxhdGlvblRva2VuID0gaXNDYW5jZWxsYXRpb25Ub2tlbjtcclxuICAgIENhbmNlbGxhdGlvblRva2VuLk5vbmUgPSBPYmplY3QuZnJlZXplKHtcclxuICAgICAgICBpc0NhbmNlbGxhdGlvblJlcXVlc3RlZDogZmFsc2UsXHJcbiAgICAgICAgb25DYW5jZWxsYXRpb25SZXF1ZXN0ZWQ6IEV2ZW50Lk5vbmVcclxuICAgIH0pO1xyXG4gICAgQ2FuY2VsbGF0aW9uVG9rZW4uQ2FuY2VsbGVkID0gT2JqZWN0LmZyZWV6ZSh7XHJcbiAgICAgICAgaXNDYW5jZWxsYXRpb25SZXF1ZXN0ZWQ6IHRydWUsXHJcbiAgICAgICAgb25DYW5jZWxsYXRpb25SZXF1ZXN0ZWQ6IHNob3J0Y3V0RXZlbnRcclxuICAgIH0pO1xyXG59KShDYW5jZWxsYXRpb25Ub2tlbiB8fCAoQ2FuY2VsbGF0aW9uVG9rZW4gPSB7fSkpO1xyXG5jbGFzcyBNdXRhYmxlVG9rZW4ge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5faXNDYW5jZWxsZWQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9lbWl0dGVyID0gbnVsbDtcclxuICAgIH1cclxuICAgIGNhbmNlbCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzQ2FuY2VsbGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzQ2FuY2VsbGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2VtaXR0ZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIuZmlyZSh1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXQgaXNDYW5jZWxsYXRpb25SZXF1ZXN0ZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzQ2FuY2VsbGVkO1xyXG4gICAgfVxyXG4gICAgZ2V0IG9uQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pc0NhbmNlbGxlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2hvcnRjdXRFdmVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLl9lbWl0dGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5ldmVudDtcclxuICAgIH1cclxuICAgIGRpc3Bvc2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2VtaXR0ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQ2FuY2VsbGF0aW9uVG9rZW5Tb3VyY2Uge1xyXG4gICAgY29uc3RydWN0b3IocGFyZW50KSB7XHJcbiAgICAgICAgdGhpcy5fdG9rZW4gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fcGFyZW50TGlzdGVuZXIgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy5fcGFyZW50TGlzdGVuZXIgPSBwYXJlbnQgJiYgcGFyZW50Lm9uQ2FuY2VsbGF0aW9uUmVxdWVzdGVkKHRoaXMuY2FuY2VsLCB0aGlzKTtcclxuICAgIH1cclxuICAgIGdldCB0b2tlbigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3Rva2VuKSB7XHJcbiAgICAgICAgICAgIC8vIGJlIGxhenkgYW5kIGNyZWF0ZSB0aGUgdG9rZW4gb25seSB3aGVuXHJcbiAgICAgICAgICAgIC8vIGFjdHVhbGx5IG5lZWRlZFxyXG4gICAgICAgICAgICB0aGlzLl90b2tlbiA9IG5ldyBNdXRhYmxlVG9rZW4oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Rva2VuO1xyXG4gICAgfVxyXG4gICAgY2FuY2VsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fdG9rZW4pIHtcclxuICAgICAgICAgICAgLy8gc2F2ZSBhbiBvYmplY3QgYnkgcmV0dXJuaW5nIHRoZSBkZWZhdWx0XHJcbiAgICAgICAgICAgIC8vIGNhbmNlbGxlZCB0b2tlbiB3aGVuIGNhbmNlbGxhdGlvbiBoYXBwZW5zXHJcbiAgICAgICAgICAgIC8vIGJlZm9yZSBzb21lb25lIGFza3MgZm9yIHRoZSB0b2tlblxyXG4gICAgICAgICAgICB0aGlzLl90b2tlbiA9IENhbmNlbGxhdGlvblRva2VuLkNhbmNlbGxlZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5fdG9rZW4gaW5zdGFuY2VvZiBNdXRhYmxlVG9rZW4pIHtcclxuICAgICAgICAgICAgLy8gYWN0dWFsbHkgY2FuY2VsXHJcbiAgICAgICAgICAgIHRoaXMuX3Rva2VuLmNhbmNlbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRpc3Bvc2UoY2FuY2VsID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoY2FuY2VsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLl9wYXJlbnRMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLl9wYXJlbnRMaXN0ZW5lci5kaXNwb3NlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5fdG9rZW4pIHtcclxuICAgICAgICAgICAgLy8gZW5zdXJlIHRvIGluaXRpYWxpemUgd2l0aCBhbiBlbXB0eSB0b2tlbiBpZiB3ZSBoYWQgbm9uZVxyXG4gICAgICAgICAgICB0aGlzLl90b2tlbiA9IENhbmNlbGxhdGlvblRva2VuLk5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX3Rva2VuIGluc3RhbmNlb2YgTXV0YWJsZVRva2VuKSB7XHJcbiAgICAgICAgICAgIC8vIGFjdHVhbGx5IGRpc3Bvc2VcclxuICAgICAgICAgICAgdGhpcy5fdG9rZW4uZGlzcG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCB7IGlsbGVnYWxBcmd1bWVudCB9IGZyb20gJy4vZXJyb3JzLmpzJztcclxuY2xhc3MgS2V5Q29kZVN0ck1hcCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLl9rZXlDb2RlVG9TdHIgPSBbXTtcclxuICAgICAgICB0aGlzLl9zdHJUb0tleUNvZGUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gICAgfVxyXG4gICAgZGVmaW5lKGtleUNvZGUsIHN0cikge1xyXG4gICAgICAgIHRoaXMuX2tleUNvZGVUb1N0cltrZXlDb2RlXSA9IHN0cjtcclxuICAgICAgICB0aGlzLl9zdHJUb0tleUNvZGVbc3RyLnRvTG93ZXJDYXNlKCldID0ga2V5Q29kZTtcclxuICAgIH1cclxuICAgIGtleUNvZGVUb1N0cihrZXlDb2RlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleUNvZGVUb1N0cltrZXlDb2RlXTtcclxuICAgIH1cclxuICAgIHN0clRvS2V5Q29kZShzdHIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3RyVG9LZXlDb2RlW3N0ci50b0xvd2VyQ2FzZSgpXSB8fCAwIC8qIFVua25vd24gKi87XHJcbiAgICB9XHJcbn1cclxuY29uc3QgdWlNYXAgPSBuZXcgS2V5Q29kZVN0ck1hcCgpO1xyXG5jb25zdCB1c2VyU2V0dGluZ3NVU01hcCA9IG5ldyBLZXlDb2RlU3RyTWFwKCk7XHJcbmNvbnN0IHVzZXJTZXR0aW5nc0dlbmVyYWxNYXAgPSBuZXcgS2V5Q29kZVN0ck1hcCgpO1xyXG4oZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gZGVmaW5lKGtleUNvZGUsIHVpTGFiZWwsIHVzVXNlclNldHRpbmdzTGFiZWwgPSB1aUxhYmVsLCBnZW5lcmFsVXNlclNldHRpbmdzTGFiZWwgPSB1c1VzZXJTZXR0aW5nc0xhYmVsKSB7XHJcbiAgICAgICAgdWlNYXAuZGVmaW5lKGtleUNvZGUsIHVpTGFiZWwpO1xyXG4gICAgICAgIHVzZXJTZXR0aW5nc1VTTWFwLmRlZmluZShrZXlDb2RlLCB1c1VzZXJTZXR0aW5nc0xhYmVsKTtcclxuICAgICAgICB1c2VyU2V0dGluZ3NHZW5lcmFsTWFwLmRlZmluZShrZXlDb2RlLCBnZW5lcmFsVXNlclNldHRpbmdzTGFiZWwpO1xyXG4gICAgfVxyXG4gICAgZGVmaW5lKDAgLyogVW5rbm93biAqLywgJ3Vua25vd24nKTtcclxuICAgIGRlZmluZSgxIC8qIEJhY2tzcGFjZSAqLywgJ0JhY2tzcGFjZScpO1xyXG4gICAgZGVmaW5lKDIgLyogVGFiICovLCAnVGFiJyk7XHJcbiAgICBkZWZpbmUoMyAvKiBFbnRlciAqLywgJ0VudGVyJyk7XHJcbiAgICBkZWZpbmUoNCAvKiBTaGlmdCAqLywgJ1NoaWZ0Jyk7XHJcbiAgICBkZWZpbmUoNSAvKiBDdHJsICovLCAnQ3RybCcpO1xyXG4gICAgZGVmaW5lKDYgLyogQWx0ICovLCAnQWx0Jyk7XHJcbiAgICBkZWZpbmUoNyAvKiBQYXVzZUJyZWFrICovLCAnUGF1c2VCcmVhaycpO1xyXG4gICAgZGVmaW5lKDggLyogQ2Fwc0xvY2sgKi8sICdDYXBzTG9jaycpO1xyXG4gICAgZGVmaW5lKDkgLyogRXNjYXBlICovLCAnRXNjYXBlJyk7XHJcbiAgICBkZWZpbmUoMTAgLyogU3BhY2UgKi8sICdTcGFjZScpO1xyXG4gICAgZGVmaW5lKDExIC8qIFBhZ2VVcCAqLywgJ1BhZ2VVcCcpO1xyXG4gICAgZGVmaW5lKDEyIC8qIFBhZ2VEb3duICovLCAnUGFnZURvd24nKTtcclxuICAgIGRlZmluZSgxMyAvKiBFbmQgKi8sICdFbmQnKTtcclxuICAgIGRlZmluZSgxNCAvKiBIb21lICovLCAnSG9tZScpO1xyXG4gICAgZGVmaW5lKDE1IC8qIExlZnRBcnJvdyAqLywgJ0xlZnRBcnJvdycsICdMZWZ0Jyk7XHJcbiAgICBkZWZpbmUoMTYgLyogVXBBcnJvdyAqLywgJ1VwQXJyb3cnLCAnVXAnKTtcclxuICAgIGRlZmluZSgxNyAvKiBSaWdodEFycm93ICovLCAnUmlnaHRBcnJvdycsICdSaWdodCcpO1xyXG4gICAgZGVmaW5lKDE4IC8qIERvd25BcnJvdyAqLywgJ0Rvd25BcnJvdycsICdEb3duJyk7XHJcbiAgICBkZWZpbmUoMTkgLyogSW5zZXJ0ICovLCAnSW5zZXJ0Jyk7XHJcbiAgICBkZWZpbmUoMjAgLyogRGVsZXRlICovLCAnRGVsZXRlJyk7XHJcbiAgICBkZWZpbmUoMjEgLyogS0VZXzAgKi8sICcwJyk7XHJcbiAgICBkZWZpbmUoMjIgLyogS0VZXzEgKi8sICcxJyk7XHJcbiAgICBkZWZpbmUoMjMgLyogS0VZXzIgKi8sICcyJyk7XHJcbiAgICBkZWZpbmUoMjQgLyogS0VZXzMgKi8sICczJyk7XHJcbiAgICBkZWZpbmUoMjUgLyogS0VZXzQgKi8sICc0Jyk7XHJcbiAgICBkZWZpbmUoMjYgLyogS0VZXzUgKi8sICc1Jyk7XHJcbiAgICBkZWZpbmUoMjcgLyogS0VZXzYgKi8sICc2Jyk7XHJcbiAgICBkZWZpbmUoMjggLyogS0VZXzcgKi8sICc3Jyk7XHJcbiAgICBkZWZpbmUoMjkgLyogS0VZXzggKi8sICc4Jyk7XHJcbiAgICBkZWZpbmUoMzAgLyogS0VZXzkgKi8sICc5Jyk7XHJcbiAgICBkZWZpbmUoMzEgLyogS0VZX0EgKi8sICdBJyk7XHJcbiAgICBkZWZpbmUoMzIgLyogS0VZX0IgKi8sICdCJyk7XHJcbiAgICBkZWZpbmUoMzMgLyogS0VZX0MgKi8sICdDJyk7XHJcbiAgICBkZWZpbmUoMzQgLyogS0VZX0QgKi8sICdEJyk7XHJcbiAgICBkZWZpbmUoMzUgLyogS0VZX0UgKi8sICdFJyk7XHJcbiAgICBkZWZpbmUoMzYgLyogS0VZX0YgKi8sICdGJyk7XHJcbiAgICBkZWZpbmUoMzcgLyogS0VZX0cgKi8sICdHJyk7XHJcbiAgICBkZWZpbmUoMzggLyogS0VZX0ggKi8sICdIJyk7XHJcbiAgICBkZWZpbmUoMzkgLyogS0VZX0kgKi8sICdJJyk7XHJcbiAgICBkZWZpbmUoNDAgLyogS0VZX0ogKi8sICdKJyk7XHJcbiAgICBkZWZpbmUoNDEgLyogS0VZX0sgKi8sICdLJyk7XHJcbiAgICBkZWZpbmUoNDIgLyogS0VZX0wgKi8sICdMJyk7XHJcbiAgICBkZWZpbmUoNDMgLyogS0VZX00gKi8sICdNJyk7XHJcbiAgICBkZWZpbmUoNDQgLyogS0VZX04gKi8sICdOJyk7XHJcbiAgICBkZWZpbmUoNDUgLyogS0VZX08gKi8sICdPJyk7XHJcbiAgICBkZWZpbmUoNDYgLyogS0VZX1AgKi8sICdQJyk7XHJcbiAgICBkZWZpbmUoNDcgLyogS0VZX1EgKi8sICdRJyk7XHJcbiAgICBkZWZpbmUoNDggLyogS0VZX1IgKi8sICdSJyk7XHJcbiAgICBkZWZpbmUoNDkgLyogS0VZX1MgKi8sICdTJyk7XHJcbiAgICBkZWZpbmUoNTAgLyogS0VZX1QgKi8sICdUJyk7XHJcbiAgICBkZWZpbmUoNTEgLyogS0VZX1UgKi8sICdVJyk7XHJcbiAgICBkZWZpbmUoNTIgLyogS0VZX1YgKi8sICdWJyk7XHJcbiAgICBkZWZpbmUoNTMgLyogS0VZX1cgKi8sICdXJyk7XHJcbiAgICBkZWZpbmUoNTQgLyogS0VZX1ggKi8sICdYJyk7XHJcbiAgICBkZWZpbmUoNTUgLyogS0VZX1kgKi8sICdZJyk7XHJcbiAgICBkZWZpbmUoNTYgLyogS0VZX1ogKi8sICdaJyk7XHJcbiAgICBkZWZpbmUoNTcgLyogTWV0YSAqLywgJ01ldGEnKTtcclxuICAgIGRlZmluZSg1OCAvKiBDb250ZXh0TWVudSAqLywgJ0NvbnRleHRNZW51Jyk7XHJcbiAgICBkZWZpbmUoNTkgLyogRjEgKi8sICdGMScpO1xyXG4gICAgZGVmaW5lKDYwIC8qIEYyICovLCAnRjInKTtcclxuICAgIGRlZmluZSg2MSAvKiBGMyAqLywgJ0YzJyk7XHJcbiAgICBkZWZpbmUoNjIgLyogRjQgKi8sICdGNCcpO1xyXG4gICAgZGVmaW5lKDYzIC8qIEY1ICovLCAnRjUnKTtcclxuICAgIGRlZmluZSg2NCAvKiBGNiAqLywgJ0Y2Jyk7XHJcbiAgICBkZWZpbmUoNjUgLyogRjcgKi8sICdGNycpO1xyXG4gICAgZGVmaW5lKDY2IC8qIEY4ICovLCAnRjgnKTtcclxuICAgIGRlZmluZSg2NyAvKiBGOSAqLywgJ0Y5Jyk7XHJcbiAgICBkZWZpbmUoNjggLyogRjEwICovLCAnRjEwJyk7XHJcbiAgICBkZWZpbmUoNjkgLyogRjExICovLCAnRjExJyk7XHJcbiAgICBkZWZpbmUoNzAgLyogRjEyICovLCAnRjEyJyk7XHJcbiAgICBkZWZpbmUoNzEgLyogRjEzICovLCAnRjEzJyk7XHJcbiAgICBkZWZpbmUoNzIgLyogRjE0ICovLCAnRjE0Jyk7XHJcbiAgICBkZWZpbmUoNzMgLyogRjE1ICovLCAnRjE1Jyk7XHJcbiAgICBkZWZpbmUoNzQgLyogRjE2ICovLCAnRjE2Jyk7XHJcbiAgICBkZWZpbmUoNzUgLyogRjE3ICovLCAnRjE3Jyk7XHJcbiAgICBkZWZpbmUoNzYgLyogRjE4ICovLCAnRjE4Jyk7XHJcbiAgICBkZWZpbmUoNzcgLyogRjE5ICovLCAnRjE5Jyk7XHJcbiAgICBkZWZpbmUoNzggLyogTnVtTG9jayAqLywgJ051bUxvY2snKTtcclxuICAgIGRlZmluZSg3OSAvKiBTY3JvbGxMb2NrICovLCAnU2Nyb2xsTG9jaycpO1xyXG4gICAgZGVmaW5lKDgwIC8qIFVTX1NFTUlDT0xPTiAqLywgJzsnLCAnOycsICdPRU1fMScpO1xyXG4gICAgZGVmaW5lKDgxIC8qIFVTX0VRVUFMICovLCAnPScsICc9JywgJ09FTV9QTFVTJyk7XHJcbiAgICBkZWZpbmUoODIgLyogVVNfQ09NTUEgKi8sICcsJywgJywnLCAnT0VNX0NPTU1BJyk7XHJcbiAgICBkZWZpbmUoODMgLyogVVNfTUlOVVMgKi8sICctJywgJy0nLCAnT0VNX01JTlVTJyk7XHJcbiAgICBkZWZpbmUoODQgLyogVVNfRE9UICovLCAnLicsICcuJywgJ09FTV9QRVJJT0QnKTtcclxuICAgIGRlZmluZSg4NSAvKiBVU19TTEFTSCAqLywgJy8nLCAnLycsICdPRU1fMicpO1xyXG4gICAgZGVmaW5lKDg2IC8qIFVTX0JBQ0tUSUNLICovLCAnYCcsICdgJywgJ09FTV8zJyk7XHJcbiAgICBkZWZpbmUoMTEwIC8qIEFCTlRfQzEgKi8sICdBQk5UX0MxJyk7XHJcbiAgICBkZWZpbmUoMTExIC8qIEFCTlRfQzIgKi8sICdBQk5UX0MyJyk7XHJcbiAgICBkZWZpbmUoODcgLyogVVNfT1BFTl9TUVVBUkVfQlJBQ0tFVCAqLywgJ1snLCAnWycsICdPRU1fNCcpO1xyXG4gICAgZGVmaW5lKDg4IC8qIFVTX0JBQ0tTTEFTSCAqLywgJ1xcXFwnLCAnXFxcXCcsICdPRU1fNScpO1xyXG4gICAgZGVmaW5lKDg5IC8qIFVTX0NMT1NFX1NRVUFSRV9CUkFDS0VUICovLCAnXScsICddJywgJ09FTV82Jyk7XHJcbiAgICBkZWZpbmUoOTAgLyogVVNfUVVPVEUgKi8sICdcXCcnLCAnXFwnJywgJ09FTV83Jyk7XHJcbiAgICBkZWZpbmUoOTEgLyogT0VNXzggKi8sICdPRU1fOCcpO1xyXG4gICAgZGVmaW5lKDkyIC8qIE9FTV8xMDIgKi8sICdPRU1fMTAyJyk7XHJcbiAgICBkZWZpbmUoOTMgLyogTlVNUEFEXzAgKi8sICdOdW1QYWQwJyk7XHJcbiAgICBkZWZpbmUoOTQgLyogTlVNUEFEXzEgKi8sICdOdW1QYWQxJyk7XHJcbiAgICBkZWZpbmUoOTUgLyogTlVNUEFEXzIgKi8sICdOdW1QYWQyJyk7XHJcbiAgICBkZWZpbmUoOTYgLyogTlVNUEFEXzMgKi8sICdOdW1QYWQzJyk7XHJcbiAgICBkZWZpbmUoOTcgLyogTlVNUEFEXzQgKi8sICdOdW1QYWQ0Jyk7XHJcbiAgICBkZWZpbmUoOTggLyogTlVNUEFEXzUgKi8sICdOdW1QYWQ1Jyk7XHJcbiAgICBkZWZpbmUoOTkgLyogTlVNUEFEXzYgKi8sICdOdW1QYWQ2Jyk7XHJcbiAgICBkZWZpbmUoMTAwIC8qIE5VTVBBRF83ICovLCAnTnVtUGFkNycpO1xyXG4gICAgZGVmaW5lKDEwMSAvKiBOVU1QQURfOCAqLywgJ051bVBhZDgnKTtcclxuICAgIGRlZmluZSgxMDIgLyogTlVNUEFEXzkgKi8sICdOdW1QYWQ5Jyk7XHJcbiAgICBkZWZpbmUoMTAzIC8qIE5VTVBBRF9NVUxUSVBMWSAqLywgJ051bVBhZF9NdWx0aXBseScpO1xyXG4gICAgZGVmaW5lKDEwNCAvKiBOVU1QQURfQUREICovLCAnTnVtUGFkX0FkZCcpO1xyXG4gICAgZGVmaW5lKDEwNSAvKiBOVU1QQURfU0VQQVJBVE9SICovLCAnTnVtUGFkX1NlcGFyYXRvcicpO1xyXG4gICAgZGVmaW5lKDEwNiAvKiBOVU1QQURfU1VCVFJBQ1QgKi8sICdOdW1QYWRfU3VidHJhY3QnKTtcclxuICAgIGRlZmluZSgxMDcgLyogTlVNUEFEX0RFQ0lNQUwgKi8sICdOdW1QYWRfRGVjaW1hbCcpO1xyXG4gICAgZGVmaW5lKDEwOCAvKiBOVU1QQURfRElWSURFICovLCAnTnVtUGFkX0RpdmlkZScpO1xyXG59KSgpO1xyXG5leHBvcnQgdmFyIEtleUNvZGVVdGlscztcclxuKGZ1bmN0aW9uIChLZXlDb2RlVXRpbHMpIHtcclxuICAgIGZ1bmN0aW9uIHRvU3RyaW5nKGtleUNvZGUpIHtcclxuICAgICAgICByZXR1cm4gdWlNYXAua2V5Q29kZVRvU3RyKGtleUNvZGUpO1xyXG4gICAgfVxyXG4gICAgS2V5Q29kZVV0aWxzLnRvU3RyaW5nID0gdG9TdHJpbmc7XHJcbiAgICBmdW5jdGlvbiBmcm9tU3RyaW5nKGtleSkge1xyXG4gICAgICAgIHJldHVybiB1aU1hcC5zdHJUb0tleUNvZGUoa2V5KTtcclxuICAgIH1cclxuICAgIEtleUNvZGVVdGlscy5mcm9tU3RyaW5nID0gZnJvbVN0cmluZztcclxuICAgIGZ1bmN0aW9uIHRvVXNlclNldHRpbmdzVVMoa2V5Q29kZSkge1xyXG4gICAgICAgIHJldHVybiB1c2VyU2V0dGluZ3NVU01hcC5rZXlDb2RlVG9TdHIoa2V5Q29kZSk7XHJcbiAgICB9XHJcbiAgICBLZXlDb2RlVXRpbHMudG9Vc2VyU2V0dGluZ3NVUyA9IHRvVXNlclNldHRpbmdzVVM7XHJcbiAgICBmdW5jdGlvbiB0b1VzZXJTZXR0aW5nc0dlbmVyYWwoa2V5Q29kZSkge1xyXG4gICAgICAgIHJldHVybiB1c2VyU2V0dGluZ3NHZW5lcmFsTWFwLmtleUNvZGVUb1N0cihrZXlDb2RlKTtcclxuICAgIH1cclxuICAgIEtleUNvZGVVdGlscy50b1VzZXJTZXR0aW5nc0dlbmVyYWwgPSB0b1VzZXJTZXR0aW5nc0dlbmVyYWw7XHJcbiAgICBmdW5jdGlvbiBmcm9tVXNlclNldHRpbmdzKGtleSkge1xyXG4gICAgICAgIHJldHVybiB1c2VyU2V0dGluZ3NVU01hcC5zdHJUb0tleUNvZGUoa2V5KSB8fCB1c2VyU2V0dGluZ3NHZW5lcmFsTWFwLnN0clRvS2V5Q29kZShrZXkpO1xyXG4gICAgfVxyXG4gICAgS2V5Q29kZVV0aWxzLmZyb21Vc2VyU2V0dGluZ3MgPSBmcm9tVXNlclNldHRpbmdzO1xyXG59KShLZXlDb2RlVXRpbHMgfHwgKEtleUNvZGVVdGlscyA9IHt9KSk7XHJcbmV4cG9ydCBmdW5jdGlvbiBLZXlDaG9yZChmaXJzdFBhcnQsIHNlY29uZFBhcnQpIHtcclxuICAgIGNvbnN0IGNob3JkUGFydCA9ICgoc2Vjb25kUGFydCAmIDB4MDAwMEZGRkYpIDw8IDE2KSA+Pj4gMDtcclxuICAgIHJldHVybiAoZmlyc3RQYXJ0IHwgY2hvcmRQYXJ0KSA+Pj4gMDtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlS2V5YmluZGluZyhrZXliaW5kaW5nLCBPUykge1xyXG4gICAgaWYgKGtleWJpbmRpbmcgPT09IDApIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnN0IGZpcnN0UGFydCA9IChrZXliaW5kaW5nICYgMHgwMDAwRkZGRikgPj4+IDA7XHJcbiAgICBjb25zdCBjaG9yZFBhcnQgPSAoa2V5YmluZGluZyAmIDB4RkZGRjAwMDApID4+PiAxNjtcclxuICAgIGlmIChjaG9yZFBhcnQgIT09IDApIHtcclxuICAgICAgICByZXR1cm4gbmV3IENob3JkS2V5YmluZGluZyhbXHJcbiAgICAgICAgICAgIGNyZWF0ZVNpbXBsZUtleWJpbmRpbmcoZmlyc3RQYXJ0LCBPUyksXHJcbiAgICAgICAgICAgIGNyZWF0ZVNpbXBsZUtleWJpbmRpbmcoY2hvcmRQYXJ0LCBPUylcclxuICAgICAgICBdKTtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXcgQ2hvcmRLZXliaW5kaW5nKFtjcmVhdGVTaW1wbGVLZXliaW5kaW5nKGZpcnN0UGFydCwgT1MpXSk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNpbXBsZUtleWJpbmRpbmcoa2V5YmluZGluZywgT1MpIHtcclxuICAgIGNvbnN0IGN0cmxDbWQgPSAoa2V5YmluZGluZyAmIDIwNDggLyogQ3RybENtZCAqLyA/IHRydWUgOiBmYWxzZSk7XHJcbiAgICBjb25zdCB3aW5DdHJsID0gKGtleWJpbmRpbmcgJiAyNTYgLyogV2luQ3RybCAqLyA/IHRydWUgOiBmYWxzZSk7XHJcbiAgICBjb25zdCBjdHJsS2V5ID0gKE9TID09PSAyIC8qIE1hY2ludG9zaCAqLyA/IHdpbkN0cmwgOiBjdHJsQ21kKTtcclxuICAgIGNvbnN0IHNoaWZ0S2V5ID0gKGtleWJpbmRpbmcgJiAxMDI0IC8qIFNoaWZ0ICovID8gdHJ1ZSA6IGZhbHNlKTtcclxuICAgIGNvbnN0IGFsdEtleSA9IChrZXliaW5kaW5nICYgNTEyIC8qIEFsdCAqLyA/IHRydWUgOiBmYWxzZSk7XHJcbiAgICBjb25zdCBtZXRhS2V5ID0gKE9TID09PSAyIC8qIE1hY2ludG9zaCAqLyA/IGN0cmxDbWQgOiB3aW5DdHJsKTtcclxuICAgIGNvbnN0IGtleUNvZGUgPSAoa2V5YmluZGluZyAmIDI1NSAvKiBLZXlDb2RlICovKTtcclxuICAgIHJldHVybiBuZXcgU2ltcGxlS2V5YmluZGluZyhjdHJsS2V5LCBzaGlmdEtleSwgYWx0S2V5LCBtZXRhS2V5LCBrZXlDb2RlKTtcclxufVxyXG5leHBvcnQgY2xhc3MgU2ltcGxlS2V5YmluZGluZyB7XHJcbiAgICBjb25zdHJ1Y3RvcihjdHJsS2V5LCBzaGlmdEtleSwgYWx0S2V5LCBtZXRhS2V5LCBrZXlDb2RlKSB7XHJcbiAgICAgICAgdGhpcy5jdHJsS2V5ID0gY3RybEtleTtcclxuICAgICAgICB0aGlzLnNoaWZ0S2V5ID0gc2hpZnRLZXk7XHJcbiAgICAgICAgdGhpcy5hbHRLZXkgPSBhbHRLZXk7XHJcbiAgICAgICAgdGhpcy5tZXRhS2V5ID0gbWV0YUtleTtcclxuICAgICAgICB0aGlzLmtleUNvZGUgPSBrZXlDb2RlO1xyXG4gICAgfVxyXG4gICAgZXF1YWxzKG90aGVyKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmN0cmxLZXkgPT09IG90aGVyLmN0cmxLZXlcclxuICAgICAgICAgICAgJiYgdGhpcy5zaGlmdEtleSA9PT0gb3RoZXIuc2hpZnRLZXlcclxuICAgICAgICAgICAgJiYgdGhpcy5hbHRLZXkgPT09IG90aGVyLmFsdEtleVxyXG4gICAgICAgICAgICAmJiB0aGlzLm1ldGFLZXkgPT09IG90aGVyLm1ldGFLZXlcclxuICAgICAgICAgICAgJiYgdGhpcy5rZXlDb2RlID09PSBvdGhlci5rZXlDb2RlKTtcclxuICAgIH1cclxuICAgIGlzTW9kaWZpZXJLZXkoKSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmtleUNvZGUgPT09IDAgLyogVW5rbm93biAqL1xyXG4gICAgICAgICAgICB8fCB0aGlzLmtleUNvZGUgPT09IDUgLyogQ3RybCAqL1xyXG4gICAgICAgICAgICB8fCB0aGlzLmtleUNvZGUgPT09IDU3IC8qIE1ldGEgKi9cclxuICAgICAgICAgICAgfHwgdGhpcy5rZXlDb2RlID09PSA2IC8qIEFsdCAqL1xyXG4gICAgICAgICAgICB8fCB0aGlzLmtleUNvZGUgPT09IDQgLyogU2hpZnQgKi8pO1xyXG4gICAgfVxyXG4gICAgdG9DaG9yZCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IENob3JkS2V5YmluZGluZyhbdGhpc10pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBEb2VzIHRoaXMga2V5YmluZGluZyByZWZlciB0byB0aGUga2V5IGNvZGUgb2YgYSBtb2RpZmllciBhbmQgaXQgYWxzbyBoYXMgdGhlIG1vZGlmaWVyIGZsYWc/XHJcbiAgICAgKi9cclxuICAgIGlzRHVwbGljYXRlTW9kaWZpZXJDYXNlKCkge1xyXG4gICAgICAgIHJldHVybiAoKHRoaXMuY3RybEtleSAmJiB0aGlzLmtleUNvZGUgPT09IDUgLyogQ3RybCAqLylcclxuICAgICAgICAgICAgfHwgKHRoaXMuc2hpZnRLZXkgJiYgdGhpcy5rZXlDb2RlID09PSA0IC8qIFNoaWZ0ICovKVxyXG4gICAgICAgICAgICB8fCAodGhpcy5hbHRLZXkgJiYgdGhpcy5rZXlDb2RlID09PSA2IC8qIEFsdCAqLylcclxuICAgICAgICAgICAgfHwgKHRoaXMubWV0YUtleSAmJiB0aGlzLmtleUNvZGUgPT09IDU3IC8qIE1ldGEgKi8pKTtcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgQ2hvcmRLZXliaW5kaW5nIHtcclxuICAgIGNvbnN0cnVjdG9yKHBhcnRzKSB7XHJcbiAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBpbGxlZ2FsQXJndW1lbnQoYHBhcnRzYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGFydHMgPSBwYXJ0cztcclxuICAgIH1cclxufVxyXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRLZXliaW5kaW5nUGFydCB7XHJcbiAgICBjb25zdHJ1Y3RvcihjdHJsS2V5LCBzaGlmdEtleSwgYWx0S2V5LCBtZXRhS2V5LCBrYkxhYmVsLCBrYkFyaWFMYWJlbCkge1xyXG4gICAgICAgIHRoaXMuY3RybEtleSA9IGN0cmxLZXk7XHJcbiAgICAgICAgdGhpcy5zaGlmdEtleSA9IHNoaWZ0S2V5O1xyXG4gICAgICAgIHRoaXMuYWx0S2V5ID0gYWx0S2V5O1xyXG4gICAgICAgIHRoaXMubWV0YUtleSA9IG1ldGFLZXk7XHJcbiAgICAgICAgdGhpcy5rZXlMYWJlbCA9IGtiTGFiZWw7XHJcbiAgICAgICAgdGhpcy5rZXlBcmlhTGFiZWwgPSBrYkFyaWFMYWJlbDtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogQSByZXNvbHZlZCBrZXliaW5kaW5nLiBDYW4gYmUgYSBzaW1wbGUga2V5YmluZGluZyBvciBhIGNob3JkIGtleWJpbmRpbmcuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUmVzb2x2ZWRLZXliaW5kaW5nIHtcclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi9wb3NpdGlvbi5qcyc7XHJcbmltcG9ydCB7IFJhbmdlIH0gZnJvbSAnLi9yYW5nZS5qcyc7XHJcbi8qKlxyXG4gKiBBIHNlbGVjdGlvbiBpbiB0aGUgZWRpdG9yLlxyXG4gKiBUaGUgc2VsZWN0aW9uIGlzIGEgcmFuZ2UgdGhhdCBoYXMgYW4gb3JpZW50YXRpb24uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2VsZWN0aW9uIGV4dGVuZHMgUmFuZ2Uge1xyXG4gICAgY29uc3RydWN0b3Ioc2VsZWN0aW9uU3RhcnRMaW5lTnVtYmVyLCBzZWxlY3Rpb25TdGFydENvbHVtbiwgcG9zaXRpb25MaW5lTnVtYmVyLCBwb3NpdGlvbkNvbHVtbikge1xyXG4gICAgICAgIHN1cGVyKHNlbGVjdGlvblN0YXJ0TGluZU51bWJlciwgc2VsZWN0aW9uU3RhcnRDb2x1bW4sIHBvc2l0aW9uTGluZU51bWJlciwgcG9zaXRpb25Db2x1bW4pO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uU3RhcnRMaW5lTnVtYmVyID0gc2VsZWN0aW9uU3RhcnRMaW5lTnVtYmVyO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uU3RhcnRDb2x1bW4gPSBzZWxlY3Rpb25TdGFydENvbHVtbjtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uTGluZU51bWJlciA9IHBvc2l0aW9uTGluZU51bWJlcjtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uQ29sdW1uID0gcG9zaXRpb25Db2x1bW47XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRyYW5zZm9ybSB0byBhIGh1bWFuLXJlYWRhYmxlIHJlcHJlc2VudGF0aW9uLlxyXG4gICAgICovXHJcbiAgICB0b1N0cmluZygpIHtcclxuICAgICAgICByZXR1cm4gJ1snICsgdGhpcy5zZWxlY3Rpb25TdGFydExpbmVOdW1iZXIgKyAnLCcgKyB0aGlzLnNlbGVjdGlvblN0YXJ0Q29sdW1uICsgJyAtPiAnICsgdGhpcy5wb3NpdGlvbkxpbmVOdW1iZXIgKyAnLCcgKyB0aGlzLnBvc2l0aW9uQ29sdW1uICsgJ10nO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IGlmIGVxdWFscyBvdGhlciBzZWxlY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGVxdWFsc1NlbGVjdGlvbihvdGhlcikge1xyXG4gICAgICAgIHJldHVybiAoU2VsZWN0aW9uLnNlbGVjdGlvbnNFcXVhbCh0aGlzLCBvdGhlcikpO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXN0IGlmIHRoZSB0d28gc2VsZWN0aW9ucyBhcmUgZXF1YWwuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZWxlY3Rpb25zRXF1YWwoYSwgYikge1xyXG4gICAgICAgIHJldHVybiAoYS5zZWxlY3Rpb25TdGFydExpbmVOdW1iZXIgPT09IGIuc2VsZWN0aW9uU3RhcnRMaW5lTnVtYmVyICYmXHJcbiAgICAgICAgICAgIGEuc2VsZWN0aW9uU3RhcnRDb2x1bW4gPT09IGIuc2VsZWN0aW9uU3RhcnRDb2x1bW4gJiZcclxuICAgICAgICAgICAgYS5wb3NpdGlvbkxpbmVOdW1iZXIgPT09IGIucG9zaXRpb25MaW5lTnVtYmVyICYmXHJcbiAgICAgICAgICAgIGEucG9zaXRpb25Db2x1bW4gPT09IGIucG9zaXRpb25Db2x1bW4pO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgZGlyZWN0aW9ucyAoTFRSIG9yIFJUTCkuXHJcbiAgICAgKi9cclxuICAgIGdldERpcmVjdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb25TdGFydExpbmVOdW1iZXIgPT09IHRoaXMuc3RhcnRMaW5lTnVtYmVyICYmIHRoaXMuc2VsZWN0aW9uU3RhcnRDb2x1bW4gPT09IHRoaXMuc3RhcnRDb2x1bW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIDAgLyogTFRSICovO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMSAvKiBSVEwgKi87XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBzZWxlY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBgcG9zaXRpb25MaW5lTnVtYmVyYCBhbmQgYHBvc2l0aW9uQ29sdW1uYC5cclxuICAgICAqL1xyXG4gICAgc2V0RW5kUG9zaXRpb24oZW5kTGluZU51bWJlciwgZW5kQ29sdW1uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0RGlyZWN0aW9uKCkgPT09IDAgLyogTFRSICovKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuc3RhcnRMaW5lTnVtYmVyLCB0aGlzLnN0YXJ0Q29sdW1uLCBlbmRMaW5lTnVtYmVyLCBlbmRDb2x1bW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbihlbmRMaW5lTnVtYmVyLCBlbmRDb2x1bW4sIHRoaXMuc3RhcnRMaW5lTnVtYmVyLCB0aGlzLnN0YXJ0Q29sdW1uKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBwb3NpdGlvbiBhdCBgcG9zaXRpb25MaW5lTnVtYmVyYCBhbmQgYHBvc2l0aW9uQ29sdW1uYC5cclxuICAgICAqL1xyXG4gICAgZ2V0UG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3NpdGlvbih0aGlzLnBvc2l0aW9uTGluZU51bWJlciwgdGhpcy5wb3NpdGlvbkNvbHVtbik7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBzZWxlY3Rpb24gd2l0aCBhIGRpZmZlcmVudCBgc2VsZWN0aW9uU3RhcnRMaW5lTnVtYmVyYCBhbmQgYHNlbGVjdGlvblN0YXJ0Q29sdW1uYC5cclxuICAgICAqL1xyXG4gICAgc2V0U3RhcnRQb3NpdGlvbihzdGFydExpbmVOdW1iZXIsIHN0YXJ0Q29sdW1uKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0RGlyZWN0aW9uKCkgPT09IDAgLyogTFRSICovKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHN0YXJ0TGluZU51bWJlciwgc3RhcnRDb2x1bW4sIHRoaXMuZW5kTGluZU51bWJlciwgdGhpcy5lbmRDb2x1bW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLmVuZExpbmVOdW1iZXIsIHRoaXMuZW5kQ29sdW1uLCBzdGFydExpbmVOdW1iZXIsIHN0YXJ0Q29sdW1uKTtcclxuICAgIH1cclxuICAgIC8vIC0tLS1cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgYFNlbGVjdGlvbmAgZnJvbSBvbmUgb3IgdHdvIHBvc2l0aW9uc1xyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZnJvbVBvc2l0aW9ucyhzdGFydCwgZW5kID0gc3RhcnQpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdGFydC5saW5lTnVtYmVyLCBzdGFydC5jb2x1bW4sIGVuZC5saW5lTnVtYmVyLCBlbmQuY29sdW1uKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgYFNlbGVjdGlvbmAgZnJvbSBhbiBgSVNlbGVjdGlvbmAuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBsaWZ0U2VsZWN0aW9uKHNlbCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHNlbC5zZWxlY3Rpb25TdGFydExpbmVOdW1iZXIsIHNlbC5zZWxlY3Rpb25TdGFydENvbHVtbiwgc2VsLnBvc2l0aW9uTGluZU51bWJlciwgc2VsLnBvc2l0aW9uQ29sdW1uKTtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogYGFgIGVxdWFscyBgYmAuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzZWxlY3Rpb25zQXJyRXF1YWwoYSwgYikge1xyXG4gICAgICAgIGlmIChhICYmICFiIHx8ICFhICYmIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWEgJiYgIWIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gYS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2VsZWN0aW9uc0VxdWFsKGFbaV0sIGJbaV0pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIFRlc3QgaWYgYG9iamAgaXMgYW4gYElTZWxlY3Rpb25gLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgaXNJU2VsZWN0aW9uKG9iaikge1xyXG4gICAgICAgIHJldHVybiAob2JqXHJcbiAgICAgICAgICAgICYmICh0eXBlb2Ygb2JqLnNlbGVjdGlvblN0YXJ0TGluZU51bWJlciA9PT0gJ251bWJlcicpXHJcbiAgICAgICAgICAgICYmICh0eXBlb2Ygb2JqLnNlbGVjdGlvblN0YXJ0Q29sdW1uID09PSAnbnVtYmVyJylcclxuICAgICAgICAgICAgJiYgKHR5cGVvZiBvYmoucG9zaXRpb25MaW5lTnVtYmVyID09PSAnbnVtYmVyJylcclxuICAgICAgICAgICAgJiYgKHR5cGVvZiBvYmoucG9zaXRpb25Db2x1bW4gPT09ICdudW1iZXInKSk7XHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSB3aXRoIGEgZGlyZWN0aW9uLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgY3JlYXRlV2l0aERpcmVjdGlvbihzdGFydExpbmVOdW1iZXIsIHN0YXJ0Q29sdW1uLCBlbmRMaW5lTnVtYmVyLCBlbmRDb2x1bW4sIGRpcmVjdGlvbikge1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDAgLyogTFRSICovKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHN0YXJ0TGluZU51bWJlciwgc3RhcnRDb2x1bW4sIGVuZExpbmVOdW1iZXIsIGVuZENvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKGVuZExpbmVOdW1iZXIsIGVuZENvbHVtbiwgc3RhcnRMaW5lTnVtYmVyLCBzdGFydENvbHVtbik7XHJcbiAgICB9XHJcbn1cclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG5leHBvcnQgY2xhc3MgVG9rZW4ge1xyXG4gICAgY29uc3RydWN0b3Iob2Zmc2V0LCB0eXBlLCBsYW5ndWFnZSkge1xyXG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0IHwgMDsgLy8gQHBlcmZcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMubGFuZ3VhZ2UgPSBsYW5ndWFnZTtcclxuICAgIH1cclxuICAgIHRvU3RyaW5nKCkge1xyXG4gICAgICAgIHJldHVybiAnKCcgKyB0aGlzLm9mZnNldCArICcsICcgKyB0aGlzLnR5cGUgKyAnKSc7XHJcbiAgICB9XHJcbn1cclxuZXhwb3J0IGNsYXNzIFRva2VuaXphdGlvblJlc3VsdCB7XHJcbiAgICBjb25zdHJ1Y3Rvcih0b2tlbnMsIGVuZFN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy50b2tlbnMgPSB0b2tlbnM7XHJcbiAgICAgICAgdGhpcy5lbmRTdGF0ZSA9IGVuZFN0YXRlO1xyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBjbGFzcyBUb2tlbml6YXRpb25SZXN1bHQyIHtcclxuICAgIGNvbnN0cnVjdG9yKHRva2VucywgZW5kU3RhdGUpIHtcclxuICAgICAgICB0aGlzLnRva2VucyA9IHRva2VucztcclxuICAgICAgICB0aGlzLmVuZFN0YXRlID0gZW5kU3RhdGU7XHJcbiAgICB9XHJcbn1cclxuIiwgIi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAqICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xyXG4vLyBUSElTIElTIEEgR0VORVJBVEVEIEZJTEUuIERPIE5PVCBFRElUIERJUkVDVExZLlxyXG5leHBvcnQgdmFyIEFjY2Vzc2liaWxpdHlTdXBwb3J0O1xyXG4oZnVuY3Rpb24gKEFjY2Vzc2liaWxpdHlTdXBwb3J0KSB7XHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgc2hvdWxkIGJlIHRoZSBicm93c2VyIGNhc2Ugd2hlcmUgaXQgaXMgbm90IGtub3duIGlmIGEgc2NyZWVuIHJlYWRlciBpcyBhdHRhY2hlZCBvciBuby5cclxuICAgICAqL1xyXG4gICAgQWNjZXNzaWJpbGl0eVN1cHBvcnRbQWNjZXNzaWJpbGl0eVN1cHBvcnRbXCJVbmtub3duXCJdID0gMF0gPSBcIlVua25vd25cIjtcclxuICAgIEFjY2Vzc2liaWxpdHlTdXBwb3J0W0FjY2Vzc2liaWxpdHlTdXBwb3J0W1wiRGlzYWJsZWRcIl0gPSAxXSA9IFwiRGlzYWJsZWRcIjtcclxuICAgIEFjY2Vzc2liaWxpdHlTdXBwb3J0W0FjY2Vzc2liaWxpdHlTdXBwb3J0W1wiRW5hYmxlZFwiXSA9IDJdID0gXCJFbmFibGVkXCI7XHJcbn0pKEFjY2Vzc2liaWxpdHlTdXBwb3J0IHx8IChBY2Nlc3NpYmlsaXR5U3VwcG9ydCA9IHt9KSk7XHJcbmV4cG9ydCB2YXIgQ29tcGxldGlvbkl0ZW1JbnNlcnRUZXh0UnVsZTtcclxuKGZ1bmN0aW9uIChDb21wbGV0aW9uSXRlbUluc2VydFRleHRSdWxlKSB7XHJcbiAgICAvKipcclxuICAgICAqIEFkanVzdCB3aGl0ZXNwYWNlL2luZGVudGF0aW9uIG9mIG11bHRpbGluZSBpbnNlcnQgdGV4dHMgdG9cclxuICAgICAqIG1hdGNoIHRoZSBjdXJyZW50IGxpbmUgaW5kZW50YXRpb24uXHJcbiAgICAgKi9cclxuICAgIENvbXBsZXRpb25JdGVtSW5zZXJ0VGV4dFJ1bGVbQ29tcGxldGlvbkl0ZW1JbnNlcnRUZXh0UnVsZVtcIktlZXBXaGl0ZXNwYWNlXCJdID0gMV0gPSBcIktlZXBXaGl0ZXNwYWNlXCI7XHJcbiAgICAvKipcclxuICAgICAqIGBpbnNlcnRUZXh0YCBpcyBhIHNuaXBwZXQuXHJcbiAgICAgKi9cclxuICAgIENvbXBsZXRpb25JdGVtSW5zZXJ0VGV4dFJ1bGVbQ29tcGxldGlvbkl0ZW1JbnNlcnRUZXh0UnVsZVtcIkluc2VydEFzU25pcHBldFwiXSA9IDRdID0gXCJJbnNlcnRBc1NuaXBwZXRcIjtcclxufSkoQ29tcGxldGlvbkl0ZW1JbnNlcnRUZXh0UnVsZSB8fCAoQ29tcGxldGlvbkl0ZW1JbnNlcnRUZXh0UnVsZSA9IHt9KSk7XHJcbmV4cG9ydCB2YXIgQ29tcGxldGlvbkl0ZW1LaW5kO1xyXG4oZnVuY3Rpb24gKENvbXBsZXRpb25JdGVtS2luZCkge1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIk1ldGhvZFwiXSA9IDBdID0gXCJNZXRob2RcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJGdW5jdGlvblwiXSA9IDFdID0gXCJGdW5jdGlvblwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIkNvbnN0cnVjdG9yXCJdID0gMl0gPSBcIkNvbnN0cnVjdG9yXCI7XHJcbiAgICBDb21wbGV0aW9uSXRlbUtpbmRbQ29tcGxldGlvbkl0ZW1LaW5kW1wiRmllbGRcIl0gPSAzXSA9IFwiRmllbGRcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJWYXJpYWJsZVwiXSA9IDRdID0gXCJWYXJpYWJsZVwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIkNsYXNzXCJdID0gNV0gPSBcIkNsYXNzXCI7XHJcbiAgICBDb21wbGV0aW9uSXRlbUtpbmRbQ29tcGxldGlvbkl0ZW1LaW5kW1wiU3RydWN0XCJdID0gNl0gPSBcIlN0cnVjdFwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIkludGVyZmFjZVwiXSA9IDddID0gXCJJbnRlcmZhY2VcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJNb2R1bGVcIl0gPSA4XSA9IFwiTW9kdWxlXCI7XHJcbiAgICBDb21wbGV0aW9uSXRlbUtpbmRbQ29tcGxldGlvbkl0ZW1LaW5kW1wiUHJvcGVydHlcIl0gPSA5XSA9IFwiUHJvcGVydHlcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJFdmVudFwiXSA9IDEwXSA9IFwiRXZlbnRcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJPcGVyYXRvclwiXSA9IDExXSA9IFwiT3BlcmF0b3JcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJVbml0XCJdID0gMTJdID0gXCJVbml0XCI7XHJcbiAgICBDb21wbGV0aW9uSXRlbUtpbmRbQ29tcGxldGlvbkl0ZW1LaW5kW1wiVmFsdWVcIl0gPSAxM10gPSBcIlZhbHVlXCI7XHJcbiAgICBDb21wbGV0aW9uSXRlbUtpbmRbQ29tcGxldGlvbkl0ZW1LaW5kW1wiQ29uc3RhbnRcIl0gPSAxNF0gPSBcIkNvbnN0YW50XCI7XHJcbiAgICBDb21wbGV0aW9uSXRlbUtpbmRbQ29tcGxldGlvbkl0ZW1LaW5kW1wiRW51bVwiXSA9IDE1XSA9IFwiRW51bVwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIkVudW1NZW1iZXJcIl0gPSAxNl0gPSBcIkVudW1NZW1iZXJcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJLZXl3b3JkXCJdID0gMTddID0gXCJLZXl3b3JkXCI7XHJcbiAgICBDb21wbGV0aW9uSXRlbUtpbmRbQ29tcGxldGlvbkl0ZW1LaW5kW1wiVGV4dFwiXSA9IDE4XSA9IFwiVGV4dFwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIkNvbG9yXCJdID0gMTldID0gXCJDb2xvclwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIkZpbGVcIl0gPSAyMF0gPSBcIkZpbGVcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJSZWZlcmVuY2VcIl0gPSAyMV0gPSBcIlJlZmVyZW5jZVwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIkN1c3RvbWNvbG9yXCJdID0gMjJdID0gXCJDdXN0b21jb2xvclwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIkZvbGRlclwiXSA9IDIzXSA9IFwiRm9sZGVyXCI7XHJcbiAgICBDb21wbGV0aW9uSXRlbUtpbmRbQ29tcGxldGlvbkl0ZW1LaW5kW1wiVHlwZVBhcmFtZXRlclwiXSA9IDI0XSA9IFwiVHlwZVBhcmFtZXRlclwiO1xyXG4gICAgQ29tcGxldGlvbkl0ZW1LaW5kW0NvbXBsZXRpb25JdGVtS2luZFtcIlVzZXJcIl0gPSAyNV0gPSBcIlVzZXJcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJJc3N1ZVwiXSA9IDI2XSA9IFwiSXNzdWVcIjtcclxuICAgIENvbXBsZXRpb25JdGVtS2luZFtDb21wbGV0aW9uSXRlbUtpbmRbXCJTbmlwcGV0XCJdID0gMjddID0gXCJTbmlwcGV0XCI7XHJcbn0pKENvbXBsZXRpb25JdGVtS2luZCB8fCAoQ29tcGxldGlvbkl0ZW1LaW5kID0ge30pKTtcclxuZXhwb3J0IHZhciBDb21wbGV0aW9uSXRlbVRhZztcclxuKGZ1bmN0aW9uIChDb21wbGV0aW9uSXRlbVRhZykge1xyXG4gICAgQ29tcGxldGlvbkl0ZW1UYWdbQ29tcGxldGlvbkl0ZW1UYWdbXCJEZXByZWNhdGVkXCJdID0gMV0gPSBcIkRlcHJlY2F0ZWRcIjtcclxufSkoQ29tcGxldGlvbkl0ZW1UYWcgfHwgKENvbXBsZXRpb25JdGVtVGFnID0ge30pKTtcclxuLyoqXHJcbiAqIEhvdyBhIHN1Z2dlc3QgcHJvdmlkZXIgd2FzIHRyaWdnZXJlZC5cclxuICovXHJcbmV4cG9ydCB2YXIgQ29tcGxldGlvblRyaWdnZXJLaW5kO1xyXG4oZnVuY3Rpb24gKENvbXBsZXRpb25UcmlnZ2VyS2luZCkge1xyXG4gICAgQ29tcGxldGlvblRyaWdnZXJLaW5kW0NvbXBsZXRpb25UcmlnZ2VyS2luZFtcIkludm9rZVwiXSA9IDBdID0gXCJJbnZva2VcIjtcclxuICAgIENvbXBsZXRpb25UcmlnZ2VyS2luZFtDb21wbGV0aW9uVHJpZ2dlcktpbmRbXCJUcmlnZ2VyQ2hhcmFjdGVyXCJdID0gMV0gPSBcIlRyaWdnZXJDaGFyYWN0ZXJcIjtcclxuICAgIENvbXBsZXRpb25UcmlnZ2VyS2luZFtDb21wbGV0aW9uVHJpZ2dlcktpbmRbXCJUcmlnZ2VyRm9ySW5jb21wbGV0ZUNvbXBsZXRpb25zXCJdID0gMl0gPSBcIlRyaWdnZXJGb3JJbmNvbXBsZXRlQ29tcGxldGlvbnNcIjtcclxufSkoQ29tcGxldGlvblRyaWdnZXJLaW5kIHx8IChDb21wbGV0aW9uVHJpZ2dlcktpbmQgPSB7fSkpO1xyXG4vKipcclxuICogQSBwb3NpdGlvbmluZyBwcmVmZXJlbmNlIGZvciByZW5kZXJpbmcgY29udGVudCB3aWRnZXRzLlxyXG4gKi9cclxuZXhwb3J0IHZhciBDb250ZW50V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlO1xyXG4oZnVuY3Rpb24gKENvbnRlbnRXaWRnZXRQb3NpdGlvblByZWZlcmVuY2UpIHtcclxuICAgIC8qKlxyXG4gICAgICogUGxhY2UgdGhlIGNvbnRlbnQgd2lkZ2V0IGV4YWN0bHkgYXQgYSBwb3NpdGlvblxyXG4gICAgICovXHJcbiAgICBDb250ZW50V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlW0NvbnRlbnRXaWRnZXRQb3NpdGlvblByZWZlcmVuY2VbXCJFWEFDVFwiXSA9IDBdID0gXCJFWEFDVFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBQbGFjZSB0aGUgY29udGVudCB3aWRnZXQgYWJvdmUgYSBwb3NpdGlvblxyXG4gICAgICovXHJcbiAgICBDb250ZW50V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlW0NvbnRlbnRXaWRnZXRQb3NpdGlvblByZWZlcmVuY2VbXCJBQk9WRVwiXSA9IDFdID0gXCJBQk9WRVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBQbGFjZSB0aGUgY29udGVudCB3aWRnZXQgYmVsb3cgYSBwb3NpdGlvblxyXG4gICAgICovXHJcbiAgICBDb250ZW50V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlW0NvbnRlbnRXaWRnZXRQb3NpdGlvblByZWZlcmVuY2VbXCJCRUxPV1wiXSA9IDJdID0gXCJCRUxPV1wiO1xyXG59KShDb250ZW50V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlIHx8IChDb250ZW50V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlID0ge30pKTtcclxuLyoqXHJcbiAqIERlc2NyaWJlcyB0aGUgcmVhc29uIHRoZSBjdXJzb3IgaGFzIGNoYW5nZWQgaXRzIHBvc2l0aW9uLlxyXG4gKi9cclxuZXhwb3J0IHZhciBDdXJzb3JDaGFuZ2VSZWFzb247XHJcbihmdW5jdGlvbiAoQ3Vyc29yQ2hhbmdlUmVhc29uKSB7XHJcbiAgICAvKipcclxuICAgICAqIFVua25vd24gb3Igbm90IHNldC5cclxuICAgICAqL1xyXG4gICAgQ3Vyc29yQ2hhbmdlUmVhc29uW0N1cnNvckNoYW5nZVJlYXNvbltcIk5vdFNldFwiXSA9IDBdID0gXCJOb3RTZXRcIjtcclxuICAgIC8qKlxyXG4gICAgICogQSBgbW9kZWwuc2V0VmFsdWUoKWAgd2FzIGNhbGxlZC5cclxuICAgICAqL1xyXG4gICAgQ3Vyc29yQ2hhbmdlUmVhc29uW0N1cnNvckNoYW5nZVJlYXNvbltcIkNvbnRlbnRGbHVzaFwiXSA9IDFdID0gXCJDb250ZW50Rmx1c2hcIjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGBtb2RlbGAgaGFzIGJlZW4gY2hhbmdlZCBvdXRzaWRlIG9mIHRoaXMgY3Vyc29yIGFuZCB0aGUgY3Vyc29yIHJlY292ZXJzIGl0cyBwb3NpdGlvbiBmcm9tIGFzc29jaWF0ZWQgbWFya2Vycy5cclxuICAgICAqL1xyXG4gICAgQ3Vyc29yQ2hhbmdlUmVhc29uW0N1cnNvckNoYW5nZVJlYXNvbltcIlJlY292ZXJGcm9tTWFya2Vyc1wiXSA9IDJdID0gXCJSZWNvdmVyRnJvbU1hcmtlcnNcIjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlcmUgd2FzIGFuIGV4cGxpY2l0IHVzZXIgZ2VzdHVyZS5cclxuICAgICAqL1xyXG4gICAgQ3Vyc29yQ2hhbmdlUmVhc29uW0N1cnNvckNoYW5nZVJlYXNvbltcIkV4cGxpY2l0XCJdID0gM10gPSBcIkV4cGxpY2l0XCI7XHJcbiAgICAvKipcclxuICAgICAqIFRoZXJlIHdhcyBhIFBhc3RlLlxyXG4gICAgICovXHJcbiAgICBDdXJzb3JDaGFuZ2VSZWFzb25bQ3Vyc29yQ2hhbmdlUmVhc29uW1wiUGFzdGVcIl0gPSA0XSA9IFwiUGFzdGVcIjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlcmUgd2FzIGFuIFVuZG8uXHJcbiAgICAgKi9cclxuICAgIEN1cnNvckNoYW5nZVJlYXNvbltDdXJzb3JDaGFuZ2VSZWFzb25bXCJVbmRvXCJdID0gNV0gPSBcIlVuZG9cIjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlcmUgd2FzIGEgUmVkby5cclxuICAgICAqL1xyXG4gICAgQ3Vyc29yQ2hhbmdlUmVhc29uW0N1cnNvckNoYW5nZVJlYXNvbltcIlJlZG9cIl0gPSA2XSA9IFwiUmVkb1wiO1xyXG59KShDdXJzb3JDaGFuZ2VSZWFzb24gfHwgKEN1cnNvckNoYW5nZVJlYXNvbiA9IHt9KSk7XHJcbi8qKlxyXG4gKiBUaGUgZGVmYXVsdCBlbmQgb2YgbGluZSB0byB1c2Ugd2hlbiBpbnN0YW50aWF0aW5nIG1vZGVscy5cclxuICovXHJcbmV4cG9ydCB2YXIgRGVmYXVsdEVuZE9mTGluZTtcclxuKGZ1bmN0aW9uIChEZWZhdWx0RW5kT2ZMaW5lKSB7XHJcbiAgICAvKipcclxuICAgICAqIFVzZSBsaW5lIGZlZWQgKFxcbikgYXMgdGhlIGVuZCBvZiBsaW5lIGNoYXJhY3Rlci5cclxuICAgICAqL1xyXG4gICAgRGVmYXVsdEVuZE9mTGluZVtEZWZhdWx0RW5kT2ZMaW5lW1wiTEZcIl0gPSAxXSA9IFwiTEZcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXNlIGNhcnJpYWdlIHJldHVybiBhbmQgbGluZSBmZWVkIChcXHJcXG4pIGFzIHRoZSBlbmQgb2YgbGluZSBjaGFyYWN0ZXIuXHJcbiAgICAgKi9cclxuICAgIERlZmF1bHRFbmRPZkxpbmVbRGVmYXVsdEVuZE9mTGluZVtcIkNSTEZcIl0gPSAyXSA9IFwiQ1JMRlwiO1xyXG59KShEZWZhdWx0RW5kT2ZMaW5lIHx8IChEZWZhdWx0RW5kT2ZMaW5lID0ge30pKTtcclxuLyoqXHJcbiAqIEEgZG9jdW1lbnQgaGlnaGxpZ2h0IGtpbmQuXHJcbiAqL1xyXG5leHBvcnQgdmFyIERvY3VtZW50SGlnaGxpZ2h0S2luZDtcclxuKGZ1bmN0aW9uIChEb2N1bWVudEhpZ2hsaWdodEtpbmQpIHtcclxuICAgIC8qKlxyXG4gICAgICogQSB0ZXh0dWFsIG9jY3VycmVuY2UuXHJcbiAgICAgKi9cclxuICAgIERvY3VtZW50SGlnaGxpZ2h0S2luZFtEb2N1bWVudEhpZ2hsaWdodEtpbmRbXCJUZXh0XCJdID0gMF0gPSBcIlRleHRcIjtcclxuICAgIC8qKlxyXG4gICAgICogUmVhZC1hY2Nlc3Mgb2YgYSBzeW1ib2wsIGxpa2UgcmVhZGluZyBhIHZhcmlhYmxlLlxyXG4gICAgICovXHJcbiAgICBEb2N1bWVudEhpZ2hsaWdodEtpbmRbRG9jdW1lbnRIaWdobGlnaHRLaW5kW1wiUmVhZFwiXSA9IDFdID0gXCJSZWFkXCI7XHJcbiAgICAvKipcclxuICAgICAqIFdyaXRlLWFjY2VzcyBvZiBhIHN5bWJvbCwgbGlrZSB3cml0aW5nIHRvIGEgdmFyaWFibGUuXHJcbiAgICAgKi9cclxuICAgIERvY3VtZW50SGlnaGxpZ2h0S2luZFtEb2N1bWVudEhpZ2hsaWdodEtpbmRbXCJXcml0ZVwiXSA9IDJdID0gXCJXcml0ZVwiO1xyXG59KShEb2N1bWVudEhpZ2hsaWdodEtpbmQgfHwgKERvY3VtZW50SGlnaGxpZ2h0S2luZCA9IHt9KSk7XHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIGF1dG8gaW5kZW50YXRpb24gaW4gdGhlIGVkaXRvclxyXG4gKi9cclxuZXhwb3J0IHZhciBFZGl0b3JBdXRvSW5kZW50U3RyYXRlZ3k7XHJcbihmdW5jdGlvbiAoRWRpdG9yQXV0b0luZGVudFN0cmF0ZWd5KSB7XHJcbiAgICBFZGl0b3JBdXRvSW5kZW50U3RyYXRlZ3lbRWRpdG9yQXV0b0luZGVudFN0cmF0ZWd5W1wiTm9uZVwiXSA9IDBdID0gXCJOb25lXCI7XHJcbiAgICBFZGl0b3JBdXRvSW5kZW50U3RyYXRlZ3lbRWRpdG9yQXV0b0luZGVudFN0cmF0ZWd5W1wiS2VlcFwiXSA9IDFdID0gXCJLZWVwXCI7XHJcbiAgICBFZGl0b3JBdXRvSW5kZW50U3RyYXRlZ3lbRWRpdG9yQXV0b0luZGVudFN0cmF0ZWd5W1wiQnJhY2tldHNcIl0gPSAyXSA9IFwiQnJhY2tldHNcIjtcclxuICAgIEVkaXRvckF1dG9JbmRlbnRTdHJhdGVneVtFZGl0b3JBdXRvSW5kZW50U3RyYXRlZ3lbXCJBZHZhbmNlZFwiXSA9IDNdID0gXCJBZHZhbmNlZFwiO1xyXG4gICAgRWRpdG9yQXV0b0luZGVudFN0cmF0ZWd5W0VkaXRvckF1dG9JbmRlbnRTdHJhdGVneVtcIkZ1bGxcIl0gPSA0XSA9IFwiRnVsbFwiO1xyXG59KShFZGl0b3JBdXRvSW5kZW50U3RyYXRlZ3kgfHwgKEVkaXRvckF1dG9JbmRlbnRTdHJhdGVneSA9IHt9KSk7XHJcbmV4cG9ydCB2YXIgRWRpdG9yT3B0aW9uO1xyXG4oZnVuY3Rpb24gKEVkaXRvck9wdGlvbikge1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImFjY2VwdFN1Z2dlc3Rpb25PbkNvbW1pdENoYXJhY3RlclwiXSA9IDBdID0gXCJhY2NlcHRTdWdnZXN0aW9uT25Db21taXRDaGFyYWN0ZXJcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJhY2NlcHRTdWdnZXN0aW9uT25FbnRlclwiXSA9IDFdID0gXCJhY2NlcHRTdWdnZXN0aW9uT25FbnRlclwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImFjY2Vzc2liaWxpdHlTdXBwb3J0XCJdID0gMl0gPSBcImFjY2Vzc2liaWxpdHlTdXBwb3J0XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiYWNjZXNzaWJpbGl0eVBhZ2VTaXplXCJdID0gM10gPSBcImFjY2Vzc2liaWxpdHlQYWdlU2l6ZVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImFyaWFMYWJlbFwiXSA9IDRdID0gXCJhcmlhTGFiZWxcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJhdXRvQ2xvc2luZ0JyYWNrZXRzXCJdID0gNV0gPSBcImF1dG9DbG9zaW5nQnJhY2tldHNcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJhdXRvQ2xvc2luZ0RlbGV0ZVwiXSA9IDZdID0gXCJhdXRvQ2xvc2luZ0RlbGV0ZVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImF1dG9DbG9zaW5nT3ZlcnR5cGVcIl0gPSA3XSA9IFwiYXV0b0Nsb3NpbmdPdmVydHlwZVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImF1dG9DbG9zaW5nUXVvdGVzXCJdID0gOF0gPSBcImF1dG9DbG9zaW5nUXVvdGVzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiYXV0b0luZGVudFwiXSA9IDldID0gXCJhdXRvSW5kZW50XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiYXV0b21hdGljTGF5b3V0XCJdID0gMTBdID0gXCJhdXRvbWF0aWNMYXlvdXRcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJhdXRvU3Vycm91bmRcIl0gPSAxMV0gPSBcImF1dG9TdXJyb3VuZFwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImNvZGVMZW5zXCJdID0gMTJdID0gXCJjb2RlTGVuc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImNvZGVMZW5zRm9udEZhbWlseVwiXSA9IDEzXSA9IFwiY29kZUxlbnNGb250RmFtaWx5XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiY29kZUxlbnNGb250U2l6ZVwiXSA9IDE0XSA9IFwiY29kZUxlbnNGb250U2l6ZVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImNvbG9yRGVjb3JhdG9yc1wiXSA9IDE1XSA9IFwiY29sb3JEZWNvcmF0b3JzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiY29sdW1uU2VsZWN0aW9uXCJdID0gMTZdID0gXCJjb2x1bW5TZWxlY3Rpb25cIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJjb21tZW50c1wiXSA9IDE3XSA9IFwiY29tbWVudHNcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJjb250ZXh0bWVudVwiXSA9IDE4XSA9IFwiY29udGV4dG1lbnVcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJjb3B5V2l0aFN5bnRheEhpZ2hsaWdodGluZ1wiXSA9IDE5XSA9IFwiY29weVdpdGhTeW50YXhIaWdobGlnaHRpbmdcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJjdXJzb3JCbGlua2luZ1wiXSA9IDIwXSA9IFwiY3Vyc29yQmxpbmtpbmdcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJjdXJzb3JTbW9vdGhDYXJldEFuaW1hdGlvblwiXSA9IDIxXSA9IFwiY3Vyc29yU21vb3RoQ2FyZXRBbmltYXRpb25cIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJjdXJzb3JTdHlsZVwiXSA9IDIyXSA9IFwiY3Vyc29yU3R5bGVcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJjdXJzb3JTdXJyb3VuZGluZ0xpbmVzXCJdID0gMjNdID0gXCJjdXJzb3JTdXJyb3VuZGluZ0xpbmVzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiY3Vyc29yU3Vycm91bmRpbmdMaW5lc1N0eWxlXCJdID0gMjRdID0gXCJjdXJzb3JTdXJyb3VuZGluZ0xpbmVzU3R5bGVcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJjdXJzb3JXaWR0aFwiXSA9IDI1XSA9IFwiY3Vyc29yV2lkdGhcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJkaXNhYmxlTGF5ZXJIaW50aW5nXCJdID0gMjZdID0gXCJkaXNhYmxlTGF5ZXJIaW50aW5nXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZGlzYWJsZU1vbm9zcGFjZU9wdGltaXphdGlvbnNcIl0gPSAyN10gPSBcImRpc2FibGVNb25vc3BhY2VPcHRpbWl6YXRpb25zXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZG9tUmVhZE9ubHlcIl0gPSAyOF0gPSBcImRvbVJlYWRPbmx5XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZHJhZ0FuZERyb3BcIl0gPSAyOV0gPSBcImRyYWdBbmREcm9wXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZW1wdHlTZWxlY3Rpb25DbGlwYm9hcmRcIl0gPSAzMF0gPSBcImVtcHR5U2VsZWN0aW9uQ2xpcGJvYXJkXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZXh0cmFFZGl0b3JDbGFzc05hbWVcIl0gPSAzMV0gPSBcImV4dHJhRWRpdG9yQ2xhc3NOYW1lXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZmFzdFNjcm9sbFNlbnNpdGl2aXR5XCJdID0gMzJdID0gXCJmYXN0U2Nyb2xsU2Vuc2l0aXZpdHlcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJmaW5kXCJdID0gMzNdID0gXCJmaW5kXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZml4ZWRPdmVyZmxvd1dpZGdldHNcIl0gPSAzNF0gPSBcImZpeGVkT3ZlcmZsb3dXaWRnZXRzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZm9sZGluZ1wiXSA9IDM1XSA9IFwiZm9sZGluZ1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImZvbGRpbmdTdHJhdGVneVwiXSA9IDM2XSA9IFwiZm9sZGluZ1N0cmF0ZWd5XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZm9sZGluZ0hpZ2hsaWdodFwiXSA9IDM3XSA9IFwiZm9sZGluZ0hpZ2hsaWdodFwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInVuZm9sZE9uQ2xpY2tBZnRlckVuZE9mTGluZVwiXSA9IDM4XSA9IFwidW5mb2xkT25DbGlja0FmdGVyRW5kT2ZMaW5lXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZm9udEZhbWlseVwiXSA9IDM5XSA9IFwiZm9udEZhbWlseVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImZvbnRJbmZvXCJdID0gNDBdID0gXCJmb250SW5mb1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImZvbnRMaWdhdHVyZXNcIl0gPSA0MV0gPSBcImZvbnRMaWdhdHVyZXNcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJmb250U2l6ZVwiXSA9IDQyXSA9IFwiZm9udFNpemVcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJmb250V2VpZ2h0XCJdID0gNDNdID0gXCJmb250V2VpZ2h0XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZm9ybWF0T25QYXN0ZVwiXSA9IDQ0XSA9IFwiZm9ybWF0T25QYXN0ZVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImZvcm1hdE9uVHlwZVwiXSA9IDQ1XSA9IFwiZm9ybWF0T25UeXBlXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZ2x5cGhNYXJnaW5cIl0gPSA0Nl0gPSBcImdseXBoTWFyZ2luXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiZ290b0xvY2F0aW9uXCJdID0gNDddID0gXCJnb3RvTG9jYXRpb25cIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJoaWRlQ3Vyc29ySW5PdmVydmlld1J1bGVyXCJdID0gNDhdID0gXCJoaWRlQ3Vyc29ySW5PdmVydmlld1J1bGVyXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiaGlnaGxpZ2h0QWN0aXZlSW5kZW50R3VpZGVcIl0gPSA0OV0gPSBcImhpZ2hsaWdodEFjdGl2ZUluZGVudEd1aWRlXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiaG92ZXJcIl0gPSA1MF0gPSBcImhvdmVyXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wiaW5EaWZmRWRpdG9yXCJdID0gNTFdID0gXCJpbkRpZmZFZGl0b3JcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJpbmxpbmVTdWdnZXN0XCJdID0gNTJdID0gXCJpbmxpbmVTdWdnZXN0XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wibGV0dGVyU3BhY2luZ1wiXSA9IDUzXSA9IFwibGV0dGVyU3BhY2luZ1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImxpZ2h0YnVsYlwiXSA9IDU0XSA9IFwibGlnaHRidWxiXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wibGluZURlY29yYXRpb25zV2lkdGhcIl0gPSA1NV0gPSBcImxpbmVEZWNvcmF0aW9uc1dpZHRoXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wibGluZUhlaWdodFwiXSA9IDU2XSA9IFwibGluZUhlaWdodFwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImxpbmVOdW1iZXJzXCJdID0gNTddID0gXCJsaW5lTnVtYmVyc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImxpbmVOdW1iZXJzTWluQ2hhcnNcIl0gPSA1OF0gPSBcImxpbmVOdW1iZXJzTWluQ2hhcnNcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJsaW5rZWRFZGl0aW5nXCJdID0gNTldID0gXCJsaW5rZWRFZGl0aW5nXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wibGlua3NcIl0gPSA2MF0gPSBcImxpbmtzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wibWF0Y2hCcmFja2V0c1wiXSA9IDYxXSA9IFwibWF0Y2hCcmFja2V0c1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcIm1pbmltYXBcIl0gPSA2Ml0gPSBcIm1pbmltYXBcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJtb3VzZVN0eWxlXCJdID0gNjNdID0gXCJtb3VzZVN0eWxlXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wibW91c2VXaGVlbFNjcm9sbFNlbnNpdGl2aXR5XCJdID0gNjRdID0gXCJtb3VzZVdoZWVsU2Nyb2xsU2Vuc2l0aXZpdHlcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJtb3VzZVdoZWVsWm9vbVwiXSA9IDY1XSA9IFwibW91c2VXaGVlbFpvb21cIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJtdWx0aUN1cnNvck1lcmdlT3ZlcmxhcHBpbmdcIl0gPSA2Nl0gPSBcIm11bHRpQ3Vyc29yTWVyZ2VPdmVybGFwcGluZ1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcIm11bHRpQ3Vyc29yTW9kaWZpZXJcIl0gPSA2N10gPSBcIm11bHRpQ3Vyc29yTW9kaWZpZXJcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJtdWx0aUN1cnNvclBhc3RlXCJdID0gNjhdID0gXCJtdWx0aUN1cnNvclBhc3RlXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wib2NjdXJyZW5jZXNIaWdobGlnaHRcIl0gPSA2OV0gPSBcIm9jY3VycmVuY2VzSGlnaGxpZ2h0XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wib3ZlcnZpZXdSdWxlckJvcmRlclwiXSA9IDcwXSA9IFwib3ZlcnZpZXdSdWxlckJvcmRlclwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcIm92ZXJ2aWV3UnVsZXJMYW5lc1wiXSA9IDcxXSA9IFwib3ZlcnZpZXdSdWxlckxhbmVzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wicGFkZGluZ1wiXSA9IDcyXSA9IFwicGFkZGluZ1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInBhcmFtZXRlckhpbnRzXCJdID0gNzNdID0gXCJwYXJhbWV0ZXJIaW50c1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInBlZWtXaWRnZXREZWZhdWx0Rm9jdXNcIl0gPSA3NF0gPSBcInBlZWtXaWRnZXREZWZhdWx0Rm9jdXNcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJkZWZpbml0aW9uTGlua09wZW5zSW5QZWVrXCJdID0gNzVdID0gXCJkZWZpbml0aW9uTGlua09wZW5zSW5QZWVrXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wicXVpY2tTdWdnZXN0aW9uc1wiXSA9IDc2XSA9IFwicXVpY2tTdWdnZXN0aW9uc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInF1aWNrU3VnZ2VzdGlvbnNEZWxheVwiXSA9IDc3XSA9IFwicXVpY2tTdWdnZXN0aW9uc0RlbGF5XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wicmVhZE9ubHlcIl0gPSA3OF0gPSBcInJlYWRPbmx5XCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wicmVuYW1lT25UeXBlXCJdID0gNzldID0gXCJyZW5hbWVPblR5cGVcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJyZW5kZXJDb250cm9sQ2hhcmFjdGVyc1wiXSA9IDgwXSA9IFwicmVuZGVyQ29udHJvbENoYXJhY3RlcnNcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJyZW5kZXJJbmRlbnRHdWlkZXNcIl0gPSA4MV0gPSBcInJlbmRlckluZGVudEd1aWRlc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInJlbmRlckZpbmFsTmV3bGluZVwiXSA9IDgyXSA9IFwicmVuZGVyRmluYWxOZXdsaW5lXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wicmVuZGVyTGluZUhpZ2hsaWdodFwiXSA9IDgzXSA9IFwicmVuZGVyTGluZUhpZ2hsaWdodFwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInJlbmRlckxpbmVIaWdobGlnaHRPbmx5V2hlbkZvY3VzXCJdID0gODRdID0gXCJyZW5kZXJMaW5lSGlnaGxpZ2h0T25seVdoZW5Gb2N1c1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInJlbmRlclZhbGlkYXRpb25EZWNvcmF0aW9uc1wiXSA9IDg1XSA9IFwicmVuZGVyVmFsaWRhdGlvbkRlY29yYXRpb25zXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wicmVuZGVyV2hpdGVzcGFjZVwiXSA9IDg2XSA9IFwicmVuZGVyV2hpdGVzcGFjZVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInJldmVhbEhvcml6b250YWxSaWdodFBhZGRpbmdcIl0gPSA4N10gPSBcInJldmVhbEhvcml6b250YWxSaWdodFBhZGRpbmdcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJyb3VuZGVkU2VsZWN0aW9uXCJdID0gODhdID0gXCJyb3VuZGVkU2VsZWN0aW9uXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wicnVsZXJzXCJdID0gODldID0gXCJydWxlcnNcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzY3JvbGxiYXJcIl0gPSA5MF0gPSBcInNjcm9sbGJhclwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInNjcm9sbEJleW9uZExhc3RDb2x1bW5cIl0gPSA5MV0gPSBcInNjcm9sbEJleW9uZExhc3RDb2x1bW5cIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzY3JvbGxCZXlvbmRMYXN0TGluZVwiXSA9IDkyXSA9IFwic2Nyb2xsQmV5b25kTGFzdExpbmVcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzY3JvbGxQcmVkb21pbmFudEF4aXNcIl0gPSA5M10gPSBcInNjcm9sbFByZWRvbWluYW50QXhpc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInNlbGVjdGlvbkNsaXBib2FyZFwiXSA9IDk0XSA9IFwic2VsZWN0aW9uQ2xpcGJvYXJkXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wic2VsZWN0aW9uSGlnaGxpZ2h0XCJdID0gOTVdID0gXCJzZWxlY3Rpb25IaWdobGlnaHRcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzZWxlY3RPbkxpbmVOdW1iZXJzXCJdID0gOTZdID0gXCJzZWxlY3RPbkxpbmVOdW1iZXJzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wic2hvd0ZvbGRpbmdDb250cm9sc1wiXSA9IDk3XSA9IFwic2hvd0ZvbGRpbmdDb250cm9sc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInNob3dVbnVzZWRcIl0gPSA5OF0gPSBcInNob3dVbnVzZWRcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzbmlwcGV0U3VnZ2VzdGlvbnNcIl0gPSA5OV0gPSBcInNuaXBwZXRTdWdnZXN0aW9uc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInNtYXJ0U2VsZWN0XCJdID0gMTAwXSA9IFwic21hcnRTZWxlY3RcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzbW9vdGhTY3JvbGxpbmdcIl0gPSAxMDFdID0gXCJzbW9vdGhTY3JvbGxpbmdcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzdGlja3lUYWJTdG9wc1wiXSA9IDEwMl0gPSBcInN0aWNreVRhYlN0b3BzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wic3RvcFJlbmRlcmluZ0xpbmVBZnRlclwiXSA9IDEwM10gPSBcInN0b3BSZW5kZXJpbmdMaW5lQWZ0ZXJcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzdWdnZXN0XCJdID0gMTA0XSA9IFwic3VnZ2VzdFwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInN1Z2dlc3RGb250U2l6ZVwiXSA9IDEwNV0gPSBcInN1Z2dlc3RGb250U2l6ZVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInN1Z2dlc3RMaW5lSGVpZ2h0XCJdID0gMTA2XSA9IFwic3VnZ2VzdExpbmVIZWlnaHRcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJzdWdnZXN0T25UcmlnZ2VyQ2hhcmFjdGVyc1wiXSA9IDEwN10gPSBcInN1Z2dlc3RPblRyaWdnZXJDaGFyYWN0ZXJzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wic3VnZ2VzdFNlbGVjdGlvblwiXSA9IDEwOF0gPSBcInN1Z2dlc3RTZWxlY3Rpb25cIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJ0YWJDb21wbGV0aW9uXCJdID0gMTA5XSA9IFwidGFiQ29tcGxldGlvblwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInRhYkluZGV4XCJdID0gMTEwXSA9IFwidGFiSW5kZXhcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJ1bnVzdWFsTGluZVRlcm1pbmF0b3JzXCJdID0gMTExXSA9IFwidW51c3VhbExpbmVUZXJtaW5hdG9yc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInVzZVNoYWRvd0RPTVwiXSA9IDExMl0gPSBcInVzZVNoYWRvd0RPTVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInVzZVRhYlN0b3BzXCJdID0gMTEzXSA9IFwidXNlVGFiU3RvcHNcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJ3b3JkU2VwYXJhdG9yc1wiXSA9IDExNF0gPSBcIndvcmRTZXBhcmF0b3JzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wid29yZFdyYXBcIl0gPSAxMTVdID0gXCJ3b3JkV3JhcFwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcIndvcmRXcmFwQnJlYWtBZnRlckNoYXJhY3RlcnNcIl0gPSAxMTZdID0gXCJ3b3JkV3JhcEJyZWFrQWZ0ZXJDaGFyYWN0ZXJzXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wid29yZFdyYXBCcmVha0JlZm9yZUNoYXJhY3RlcnNcIl0gPSAxMTddID0gXCJ3b3JkV3JhcEJyZWFrQmVmb3JlQ2hhcmFjdGVyc1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcIndvcmRXcmFwQ29sdW1uXCJdID0gMTE4XSA9IFwid29yZFdyYXBDb2x1bW5cIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJ3b3JkV3JhcE92ZXJyaWRlMVwiXSA9IDExOV0gPSBcIndvcmRXcmFwT3ZlcnJpZGUxXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wid29yZFdyYXBPdmVycmlkZTJcIl0gPSAxMjBdID0gXCJ3b3JkV3JhcE92ZXJyaWRlMlwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcIndyYXBwaW5nSW5kZW50XCJdID0gMTIxXSA9IFwid3JhcHBpbmdJbmRlbnRcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJ3cmFwcGluZ1N0cmF0ZWd5XCJdID0gMTIyXSA9IFwid3JhcHBpbmdTdHJhdGVneVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInNob3dEZXByZWNhdGVkXCJdID0gMTIzXSA9IFwic2hvd0RlcHJlY2F0ZWRcIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJpbmxheUhpbnRzXCJdID0gMTI0XSA9IFwiaW5sYXlIaW50c1wiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcImVkaXRvckNsYXNzTmFtZVwiXSA9IDEyNV0gPSBcImVkaXRvckNsYXNzTmFtZVwiO1xyXG4gICAgRWRpdG9yT3B0aW9uW0VkaXRvck9wdGlvbltcInBpeGVsUmF0aW9cIl0gPSAxMjZdID0gXCJwaXhlbFJhdGlvXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1widGFiRm9jdXNNb2RlXCJdID0gMTI3XSA9IFwidGFiRm9jdXNNb2RlXCI7XHJcbiAgICBFZGl0b3JPcHRpb25bRWRpdG9yT3B0aW9uW1wibGF5b3V0SW5mb1wiXSA9IDEyOF0gPSBcImxheW91dEluZm9cIjtcclxuICAgIEVkaXRvck9wdGlvbltFZGl0b3JPcHRpb25bXCJ3cmFwcGluZ0luZm9cIl0gPSAxMjldID0gXCJ3cmFwcGluZ0luZm9cIjtcclxufSkoRWRpdG9yT3B0aW9uIHx8IChFZGl0b3JPcHRpb24gPSB7fSkpO1xyXG4vKipcclxuICogRW5kIG9mIGxpbmUgY2hhcmFjdGVyIHByZWZlcmVuY2UuXHJcbiAqL1xyXG5leHBvcnQgdmFyIEVuZE9mTGluZVByZWZlcmVuY2U7XHJcbihmdW5jdGlvbiAoRW5kT2ZMaW5lUHJlZmVyZW5jZSkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgdGhlIGVuZCBvZiBsaW5lIGNoYXJhY3RlciBpZGVudGlmaWVkIGluIHRoZSB0ZXh0IGJ1ZmZlci5cclxuICAgICAqL1xyXG4gICAgRW5kT2ZMaW5lUHJlZmVyZW5jZVtFbmRPZkxpbmVQcmVmZXJlbmNlW1wiVGV4dERlZmluZWRcIl0gPSAwXSA9IFwiVGV4dERlZmluZWRcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXNlIGxpbmUgZmVlZCAoXFxuKSBhcyB0aGUgZW5kIG9mIGxpbmUgY2hhcmFjdGVyLlxyXG4gICAgICovXHJcbiAgICBFbmRPZkxpbmVQcmVmZXJlbmNlW0VuZE9mTGluZVByZWZlcmVuY2VbXCJMRlwiXSA9IDFdID0gXCJMRlwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgY2FycmlhZ2UgcmV0dXJuIGFuZCBsaW5lIGZlZWQgKFxcclxcbikgYXMgdGhlIGVuZCBvZiBsaW5lIGNoYXJhY3Rlci5cclxuICAgICAqL1xyXG4gICAgRW5kT2ZMaW5lUHJlZmVyZW5jZVtFbmRPZkxpbmVQcmVmZXJlbmNlW1wiQ1JMRlwiXSA9IDJdID0gXCJDUkxGXCI7XHJcbn0pKEVuZE9mTGluZVByZWZlcmVuY2UgfHwgKEVuZE9mTGluZVByZWZlcmVuY2UgPSB7fSkpO1xyXG4vKipcclxuICogRW5kIG9mIGxpbmUgY2hhcmFjdGVyIHByZWZlcmVuY2UuXHJcbiAqL1xyXG5leHBvcnQgdmFyIEVuZE9mTGluZVNlcXVlbmNlO1xyXG4oZnVuY3Rpb24gKEVuZE9mTGluZVNlcXVlbmNlKSB7XHJcbiAgICAvKipcclxuICAgICAqIFVzZSBsaW5lIGZlZWQgKFxcbikgYXMgdGhlIGVuZCBvZiBsaW5lIGNoYXJhY3Rlci5cclxuICAgICAqL1xyXG4gICAgRW5kT2ZMaW5lU2VxdWVuY2VbRW5kT2ZMaW5lU2VxdWVuY2VbXCJMRlwiXSA9IDBdID0gXCJMRlwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2UgY2FycmlhZ2UgcmV0dXJuIGFuZCBsaW5lIGZlZWQgKFxcclxcbikgYXMgdGhlIGVuZCBvZiBsaW5lIGNoYXJhY3Rlci5cclxuICAgICAqL1xyXG4gICAgRW5kT2ZMaW5lU2VxdWVuY2VbRW5kT2ZMaW5lU2VxdWVuY2VbXCJDUkxGXCJdID0gMV0gPSBcIkNSTEZcIjtcclxufSkoRW5kT2ZMaW5lU2VxdWVuY2UgfHwgKEVuZE9mTGluZVNlcXVlbmNlID0ge30pKTtcclxuLyoqXHJcbiAqIERlc2NyaWJlcyB3aGF0IHRvIGRvIHdpdGggdGhlIGluZGVudGF0aW9uIHdoZW4gcHJlc3NpbmcgRW50ZXIuXHJcbiAqL1xyXG5leHBvcnQgdmFyIEluZGVudEFjdGlvbjtcclxuKGZ1bmN0aW9uIChJbmRlbnRBY3Rpb24pIHtcclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0IG5ldyBsaW5lIGFuZCBjb3B5IHRoZSBwcmV2aW91cyBsaW5lJ3MgaW5kZW50YXRpb24uXHJcbiAgICAgKi9cclxuICAgIEluZGVudEFjdGlvbltJbmRlbnRBY3Rpb25bXCJOb25lXCJdID0gMF0gPSBcIk5vbmVcIjtcclxuICAgIC8qKlxyXG4gICAgICogSW5zZXJ0IG5ldyBsaW5lIGFuZCBpbmRlbnQgb25jZSAocmVsYXRpdmUgdG8gdGhlIHByZXZpb3VzIGxpbmUncyBpbmRlbnRhdGlvbikuXHJcbiAgICAgKi9cclxuICAgIEluZGVudEFjdGlvbltJbmRlbnRBY3Rpb25bXCJJbmRlbnRcIl0gPSAxXSA9IFwiSW5kZW50XCI7XHJcbiAgICAvKipcclxuICAgICAqIEluc2VydCB0d28gbmV3IGxpbmVzOlxyXG4gICAgICogIC0gdGhlIGZpcnN0IG9uZSBpbmRlbnRlZCB3aGljaCB3aWxsIGhvbGQgdGhlIGN1cnNvclxyXG4gICAgICogIC0gdGhlIHNlY29uZCBvbmUgYXQgdGhlIHNhbWUgaW5kZW50YXRpb24gbGV2ZWxcclxuICAgICAqL1xyXG4gICAgSW5kZW50QWN0aW9uW0luZGVudEFjdGlvbltcIkluZGVudE91dGRlbnRcIl0gPSAyXSA9IFwiSW5kZW50T3V0ZGVudFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbnNlcnQgbmV3IGxpbmUgYW5kIG91dGRlbnQgb25jZSAocmVsYXRpdmUgdG8gdGhlIHByZXZpb3VzIGxpbmUncyBpbmRlbnRhdGlvbikuXHJcbiAgICAgKi9cclxuICAgIEluZGVudEFjdGlvbltJbmRlbnRBY3Rpb25bXCJPdXRkZW50XCJdID0gM10gPSBcIk91dGRlbnRcIjtcclxufSkoSW5kZW50QWN0aW9uIHx8IChJbmRlbnRBY3Rpb24gPSB7fSkpO1xyXG5leHBvcnQgdmFyIElubGF5SGludEtpbmQ7XHJcbihmdW5jdGlvbiAoSW5sYXlIaW50S2luZCkge1xyXG4gICAgSW5sYXlIaW50S2luZFtJbmxheUhpbnRLaW5kW1wiT3RoZXJcIl0gPSAwXSA9IFwiT3RoZXJcIjtcclxuICAgIElubGF5SGludEtpbmRbSW5sYXlIaW50S2luZFtcIlR5cGVcIl0gPSAxXSA9IFwiVHlwZVwiO1xyXG4gICAgSW5sYXlIaW50S2luZFtJbmxheUhpbnRLaW5kW1wiUGFyYW1ldGVyXCJdID0gMl0gPSBcIlBhcmFtZXRlclwiO1xyXG59KShJbmxheUhpbnRLaW5kIHx8IChJbmxheUhpbnRLaW5kID0ge30pKTtcclxuLyoqXHJcbiAqIEhvdyBhbiB7QGxpbmsgSW5saW5lQ29tcGxldGlvbnNQcm92aWRlciBpbmxpbmUgY29tcGxldGlvbiBwcm92aWRlcn0gd2FzIHRyaWdnZXJlZC5cclxuICovXHJcbmV4cG9ydCB2YXIgSW5saW5lQ29tcGxldGlvblRyaWdnZXJLaW5kO1xyXG4oZnVuY3Rpb24gKElubGluZUNvbXBsZXRpb25UcmlnZ2VyS2luZCkge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb21wbGV0aW9uIHdhcyB0cmlnZ2VyZWQgYXV0b21hdGljYWxseSB3aGlsZSBlZGl0aW5nLlxyXG4gICAgICogSXQgaXMgc3VmZmljaWVudCB0byByZXR1cm4gYSBzaW5nbGUgY29tcGxldGlvbiBpdGVtIGluIHRoaXMgY2FzZS5cclxuICAgICAqL1xyXG4gICAgSW5saW5lQ29tcGxldGlvblRyaWdnZXJLaW5kW0lubGluZUNvbXBsZXRpb25UcmlnZ2VyS2luZFtcIkF1dG9tYXRpY1wiXSA9IDBdID0gXCJBdXRvbWF0aWNcIjtcclxuICAgIC8qKlxyXG4gICAgICogQ29tcGxldGlvbiB3YXMgdHJpZ2dlcmVkIGV4cGxpY2l0bHkgYnkgYSB1c2VyIGdlc3R1cmUuXHJcbiAgICAgKiBSZXR1cm4gbXVsdGlwbGUgY29tcGxldGlvbiBpdGVtcyB0byBlbmFibGUgY3ljbGluZyB0aHJvdWdoIHRoZW0uXHJcbiAgICAgKi9cclxuICAgIElubGluZUNvbXBsZXRpb25UcmlnZ2VyS2luZFtJbmxpbmVDb21wbGV0aW9uVHJpZ2dlcktpbmRbXCJFeHBsaWNpdFwiXSA9IDFdID0gXCJFeHBsaWNpdFwiO1xyXG59KShJbmxpbmVDb21wbGV0aW9uVHJpZ2dlcktpbmQgfHwgKElubGluZUNvbXBsZXRpb25UcmlnZ2VyS2luZCA9IHt9KSk7XHJcbi8qKlxyXG4gKiBWaXJ0dWFsIEtleSBDb2RlcywgdGhlIHZhbHVlIGRvZXMgbm90IGhvbGQgYW55IGluaGVyZW50IG1lYW5pbmcuXHJcbiAqIEluc3BpcmVkIHNvbWV3aGF0IGZyb20gaHR0cHM6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS93aW5kb3dzL2Rlc2t0b3AvZGQzNzU3MzEodj12cy44NSkuYXNweFxyXG4gKiBCdXQgdGhlc2UgYXJlIFwibW9yZSBnZW5lcmFsXCIsIGFzIHRoZXkgc2hvdWxkIHdvcmsgYWNyb3NzIGJyb3dzZXJzICYgT1Ngcy5cclxuICovXHJcbmV4cG9ydCB2YXIgS2V5Q29kZTtcclxuKGZ1bmN0aW9uIChLZXlDb2RlKSB7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJEZXBlbmRzT25LYkxheW91dFwiXSA9IC0xXSA9IFwiRGVwZW5kc09uS2JMYXlvdXRcIjtcclxuICAgIC8qKlxyXG4gICAgICogUGxhY2VkIGZpcnN0IHRvIGNvdmVyIHRoZSAwIHZhbHVlIG9mIHRoZSBlbnVtLlxyXG4gICAgICovXHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJVbmtub3duXCJdID0gMF0gPSBcIlVua25vd25cIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkJhY2tzcGFjZVwiXSA9IDFdID0gXCJCYWNrc3BhY2VcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIlRhYlwiXSA9IDJdID0gXCJUYWJcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkVudGVyXCJdID0gM10gPSBcIkVudGVyXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJTaGlmdFwiXSA9IDRdID0gXCJTaGlmdFwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiQ3RybFwiXSA9IDVdID0gXCJDdHJsXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJBbHRcIl0gPSA2XSA9IFwiQWx0XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJQYXVzZUJyZWFrXCJdID0gN10gPSBcIlBhdXNlQnJlYWtcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkNhcHNMb2NrXCJdID0gOF0gPSBcIkNhcHNMb2NrXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJFc2NhcGVcIl0gPSA5XSA9IFwiRXNjYXBlXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJTcGFjZVwiXSA9IDEwXSA9IFwiU3BhY2VcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIlBhZ2VVcFwiXSA9IDExXSA9IFwiUGFnZVVwXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJQYWdlRG93blwiXSA9IDEyXSA9IFwiUGFnZURvd25cIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkVuZFwiXSA9IDEzXSA9IFwiRW5kXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJIb21lXCJdID0gMTRdID0gXCJIb21lXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJMZWZ0QXJyb3dcIl0gPSAxNV0gPSBcIkxlZnRBcnJvd1wiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiVXBBcnJvd1wiXSA9IDE2XSA9IFwiVXBBcnJvd1wiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiUmlnaHRBcnJvd1wiXSA9IDE3XSA9IFwiUmlnaHRBcnJvd1wiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiRG93bkFycm93XCJdID0gMThdID0gXCJEb3duQXJyb3dcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkluc2VydFwiXSA9IDE5XSA9IFwiSW5zZXJ0XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJEZWxldGVcIl0gPSAyMF0gPSBcIkRlbGV0ZVwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZXzBcIl0gPSAyMV0gPSBcIktFWV8wXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfMVwiXSA9IDIyXSA9IFwiS0VZXzFcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV8yXCJdID0gMjNdID0gXCJLRVlfMlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZXzNcIl0gPSAyNF0gPSBcIktFWV8zXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfNFwiXSA9IDI1XSA9IFwiS0VZXzRcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV81XCJdID0gMjZdID0gXCJLRVlfNVwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZXzZcIl0gPSAyN10gPSBcIktFWV82XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfN1wiXSA9IDI4XSA9IFwiS0VZXzdcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV84XCJdID0gMjldID0gXCJLRVlfOFwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZXzlcIl0gPSAzMF0gPSBcIktFWV85XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfQVwiXSA9IDMxXSA9IFwiS0VZX0FcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9CXCJdID0gMzJdID0gXCJLRVlfQlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZX0NcIl0gPSAzM10gPSBcIktFWV9DXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfRFwiXSA9IDM0XSA9IFwiS0VZX0RcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9FXCJdID0gMzVdID0gXCJLRVlfRVwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZX0ZcIl0gPSAzNl0gPSBcIktFWV9GXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfR1wiXSA9IDM3XSA9IFwiS0VZX0dcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9IXCJdID0gMzhdID0gXCJLRVlfSFwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZX0lcIl0gPSAzOV0gPSBcIktFWV9JXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfSlwiXSA9IDQwXSA9IFwiS0VZX0pcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9LXCJdID0gNDFdID0gXCJLRVlfS1wiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZX0xcIl0gPSA0Ml0gPSBcIktFWV9MXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfTVwiXSA9IDQzXSA9IFwiS0VZX01cIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9OXCJdID0gNDRdID0gXCJLRVlfTlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZX09cIl0gPSA0NV0gPSBcIktFWV9PXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfUFwiXSA9IDQ2XSA9IFwiS0VZX1BcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9RXCJdID0gNDddID0gXCJLRVlfUVwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZX1JcIl0gPSA0OF0gPSBcIktFWV9SXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfU1wiXSA9IDQ5XSA9IFwiS0VZX1NcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9UXCJdID0gNTBdID0gXCJLRVlfVFwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZX1VcIl0gPSA1MV0gPSBcIktFWV9VXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfVlwiXSA9IDUyXSA9IFwiS0VZX1ZcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9XXCJdID0gNTNdID0gXCJLRVlfV1wiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiS0VZX1hcIl0gPSA1NF0gPSBcIktFWV9YXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJLRVlfWVwiXSA9IDU1XSA9IFwiS0VZX1lcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9aXCJdID0gNTZdID0gXCJLRVlfWlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiTWV0YVwiXSA9IDU3XSA9IFwiTWV0YVwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiQ29udGV4dE1lbnVcIl0gPSA1OF0gPSBcIkNvbnRleHRNZW51XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJGMVwiXSA9IDU5XSA9IFwiRjFcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkYyXCJdID0gNjBdID0gXCJGMlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiRjNcIl0gPSA2MV0gPSBcIkYzXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJGNFwiXSA9IDYyXSA9IFwiRjRcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkY1XCJdID0gNjNdID0gXCJGNVwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiRjZcIl0gPSA2NF0gPSBcIkY2XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJGN1wiXSA9IDY1XSA9IFwiRjdcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkY4XCJdID0gNjZdID0gXCJGOFwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiRjlcIl0gPSA2N10gPSBcIkY5XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJGMTBcIl0gPSA2OF0gPSBcIkYxMFwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiRjExXCJdID0gNjldID0gXCJGMTFcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkYxMlwiXSA9IDcwXSA9IFwiRjEyXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJGMTNcIl0gPSA3MV0gPSBcIkYxM1wiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiRjE0XCJdID0gNzJdID0gXCJGMTRcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkYxNVwiXSA9IDczXSA9IFwiRjE1XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJGMTZcIl0gPSA3NF0gPSBcIkYxNlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiRjE3XCJdID0gNzVdID0gXCJGMTdcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkYxOFwiXSA9IDc2XSA9IFwiRjE4XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJGMTlcIl0gPSA3N10gPSBcIkYxOVwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiTnVtTG9ja1wiXSA9IDc4XSA9IFwiTnVtTG9ja1wiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiU2Nyb2xsTG9ja1wiXSA9IDc5XSA9IFwiU2Nyb2xsTG9ja1wiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGZvciBtaXNjZWxsYW5lb3VzIGNoYXJhY3RlcnM7IGl0IGNhbiB2YXJ5IGJ5IGtleWJvYXJkLlxyXG4gICAgICogRm9yIHRoZSBVUyBzdGFuZGFyZCBrZXlib2FyZCwgdGhlICc7Oicga2V5XHJcbiAgICAgKi9cclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIlVTX1NFTUlDT0xPTlwiXSA9IDgwXSA9IFwiVVNfU0VNSUNPTE9OXCI7XHJcbiAgICAvKipcclxuICAgICAqIEZvciBhbnkgY291bnRyeS9yZWdpb24sIHRoZSAnKycga2V5XHJcbiAgICAgKiBGb3IgdGhlIFVTIHN0YW5kYXJkIGtleWJvYXJkLCB0aGUgJz0rJyBrZXlcclxuICAgICAqL1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiVVNfRVFVQUxcIl0gPSA4MV0gPSBcIlVTX0VRVUFMXCI7XHJcbiAgICAvKipcclxuICAgICAqIEZvciBhbnkgY291bnRyeS9yZWdpb24sIHRoZSAnLCcga2V5XHJcbiAgICAgKiBGb3IgdGhlIFVTIHN0YW5kYXJkIGtleWJvYXJkLCB0aGUgJyw8JyBrZXlcclxuICAgICAqL1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiVVNfQ09NTUFcIl0gPSA4Ml0gPSBcIlVTX0NPTU1BXCI7XHJcbiAgICAvKipcclxuICAgICAqIEZvciBhbnkgY291bnRyeS9yZWdpb24sIHRoZSAnLScga2V5XHJcbiAgICAgKiBGb3IgdGhlIFVTIHN0YW5kYXJkIGtleWJvYXJkLCB0aGUgJy1fJyBrZXlcclxuICAgICAqL1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiVVNfTUlOVVNcIl0gPSA4M10gPSBcIlVTX01JTlVTXCI7XHJcbiAgICAvKipcclxuICAgICAqIEZvciBhbnkgY291bnRyeS9yZWdpb24sIHRoZSAnLicga2V5XHJcbiAgICAgKiBGb3IgdGhlIFVTIHN0YW5kYXJkIGtleWJvYXJkLCB0aGUgJy4+JyBrZXlcclxuICAgICAqL1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiVVNfRE9UXCJdID0gODRdID0gXCJVU19ET1RcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBmb3IgbWlzY2VsbGFuZW91cyBjaGFyYWN0ZXJzOyBpdCBjYW4gdmFyeSBieSBrZXlib2FyZC5cclxuICAgICAqIEZvciB0aGUgVVMgc3RhbmRhcmQga2V5Ym9hcmQsIHRoZSAnLz8nIGtleVxyXG4gICAgICovXHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJVU19TTEFTSFwiXSA9IDg1XSA9IFwiVVNfU0xBU0hcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBmb3IgbWlzY2VsbGFuZW91cyBjaGFyYWN0ZXJzOyBpdCBjYW4gdmFyeSBieSBrZXlib2FyZC5cclxuICAgICAqIEZvciB0aGUgVVMgc3RhbmRhcmQga2V5Ym9hcmQsIHRoZSAnYH4nIGtleVxyXG4gICAgICovXHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJVU19CQUNLVElDS1wiXSA9IDg2XSA9IFwiVVNfQkFDS1RJQ0tcIjtcclxuICAgIC8qKlxyXG4gICAgICogVXNlZCBmb3IgbWlzY2VsbGFuZW91cyBjaGFyYWN0ZXJzOyBpdCBjYW4gdmFyeSBieSBrZXlib2FyZC5cclxuICAgICAqIEZvciB0aGUgVVMgc3RhbmRhcmQga2V5Ym9hcmQsIHRoZSAnW3snIGtleVxyXG4gICAgICovXHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJVU19PUEVOX1NRVUFSRV9CUkFDS0VUXCJdID0gODddID0gXCJVU19PUEVOX1NRVUFSRV9CUkFDS0VUXCI7XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgZm9yIG1pc2NlbGxhbmVvdXMgY2hhcmFjdGVyczsgaXQgY2FuIHZhcnkgYnkga2V5Ym9hcmQuXHJcbiAgICAgKiBGb3IgdGhlIFVTIHN0YW5kYXJkIGtleWJvYXJkLCB0aGUgJ1xcfCcga2V5XHJcbiAgICAgKi9cclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIlVTX0JBQ0tTTEFTSFwiXSA9IDg4XSA9IFwiVVNfQkFDS1NMQVNIXCI7XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgZm9yIG1pc2NlbGxhbmVvdXMgY2hhcmFjdGVyczsgaXQgY2FuIHZhcnkgYnkga2V5Ym9hcmQuXHJcbiAgICAgKiBGb3IgdGhlIFVTIHN0YW5kYXJkIGtleWJvYXJkLCB0aGUgJ119JyBrZXlcclxuICAgICAqL1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiVVNfQ0xPU0VfU1FVQVJFX0JSQUNLRVRcIl0gPSA4OV0gPSBcIlVTX0NMT1NFX1NRVUFSRV9CUkFDS0VUXCI7XHJcbiAgICAvKipcclxuICAgICAqIFVzZWQgZm9yIG1pc2NlbGxhbmVvdXMgY2hhcmFjdGVyczsgaXQgY2FuIHZhcnkgYnkga2V5Ym9hcmQuXHJcbiAgICAgKiBGb3IgdGhlIFVTIHN0YW5kYXJkIGtleWJvYXJkLCB0aGUgJydcIicga2V5XHJcbiAgICAgKi9cclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIlVTX1FVT1RFXCJdID0gOTBdID0gXCJVU19RVU9URVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBVc2VkIGZvciBtaXNjZWxsYW5lb3VzIGNoYXJhY3RlcnM7IGl0IGNhbiB2YXJ5IGJ5IGtleWJvYXJkLlxyXG4gICAgICovXHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJPRU1fOFwiXSA9IDkxXSA9IFwiT0VNXzhcIjtcclxuICAgIC8qKlxyXG4gICAgICogRWl0aGVyIHRoZSBhbmdsZSBicmFja2V0IGtleSBvciB0aGUgYmFja3NsYXNoIGtleSBvbiB0aGUgUlQgMTAyLWtleSBrZXlib2FyZC5cclxuICAgICAqL1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiT0VNXzEwMlwiXSA9IDkyXSA9IFwiT0VNXzEwMlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiTlVNUEFEXzBcIl0gPSA5M10gPSBcIk5VTVBBRF8wXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfMVwiXSA9IDk0XSA9IFwiTlVNUEFEXzFcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIk5VTVBBRF8yXCJdID0gOTVdID0gXCJOVU1QQURfMlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiTlVNUEFEXzNcIl0gPSA5Nl0gPSBcIk5VTVBBRF8zXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfNFwiXSA9IDk3XSA9IFwiTlVNUEFEXzRcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIk5VTVBBRF81XCJdID0gOThdID0gXCJOVU1QQURfNVwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiTlVNUEFEXzZcIl0gPSA5OV0gPSBcIk5VTVBBRF82XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfN1wiXSA9IDEwMF0gPSBcIk5VTVBBRF83XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfOFwiXSA9IDEwMV0gPSBcIk5VTVBBRF84XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfOVwiXSA9IDEwMl0gPSBcIk5VTVBBRF85XCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfTVVMVElQTFlcIl0gPSAxMDNdID0gXCJOVU1QQURfTVVMVElQTFlcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIk5VTVBBRF9BRERcIl0gPSAxMDRdID0gXCJOVU1QQURfQUREXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfU0VQQVJBVE9SXCJdID0gMTA1XSA9IFwiTlVNUEFEX1NFUEFSQVRPUlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiTlVNUEFEX1NVQlRSQUNUXCJdID0gMTA2XSA9IFwiTlVNUEFEX1NVQlRSQUNUXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfREVDSU1BTFwiXSA9IDEwN10gPSBcIk5VTVBBRF9ERUNJTUFMXCI7XHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJOVU1QQURfRElWSURFXCJdID0gMTA4XSA9IFwiTlVNUEFEX0RJVklERVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb3ZlciBhbGwga2V5IGNvZGVzIHdoZW4gSU1FIGlzIHByb2Nlc3NpbmcgaW5wdXQuXHJcbiAgICAgKi9cclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIktFWV9JTl9DT01QT1NJVElPTlwiXSA9IDEwOV0gPSBcIktFWV9JTl9DT01QT1NJVElPTlwiO1xyXG4gICAgS2V5Q29kZVtLZXlDb2RlW1wiQUJOVF9DMVwiXSA9IDExMF0gPSBcIkFCTlRfQzFcIjtcclxuICAgIEtleUNvZGVbS2V5Q29kZVtcIkFCTlRfQzJcIl0gPSAxMTFdID0gXCJBQk5UX0MyXCI7XHJcbiAgICAvKipcclxuICAgICAqIFBsYWNlZCBsYXN0IHRvIGNvdmVyIHRoZSBsZW5ndGggb2YgdGhlIGVudW0uXHJcbiAgICAgKiBQbGVhc2UgZG8gbm90IGRlcGVuZCBvbiB0aGlzIHZhbHVlIVxyXG4gICAgICovXHJcbiAgICBLZXlDb2RlW0tleUNvZGVbXCJNQVhfVkFMVUVcIl0gPSAxMTJdID0gXCJNQVhfVkFMVUVcIjtcclxufSkoS2V5Q29kZSB8fCAoS2V5Q29kZSA9IHt9KSk7XHJcbmV4cG9ydCB2YXIgTWFya2VyU2V2ZXJpdHk7XHJcbihmdW5jdGlvbiAoTWFya2VyU2V2ZXJpdHkpIHtcclxuICAgIE1hcmtlclNldmVyaXR5W01hcmtlclNldmVyaXR5W1wiSGludFwiXSA9IDFdID0gXCJIaW50XCI7XHJcbiAgICBNYXJrZXJTZXZlcml0eVtNYXJrZXJTZXZlcml0eVtcIkluZm9cIl0gPSAyXSA9IFwiSW5mb1wiO1xyXG4gICAgTWFya2VyU2V2ZXJpdHlbTWFya2VyU2V2ZXJpdHlbXCJXYXJuaW5nXCJdID0gNF0gPSBcIldhcm5pbmdcIjtcclxuICAgIE1hcmtlclNldmVyaXR5W01hcmtlclNldmVyaXR5W1wiRXJyb3JcIl0gPSA4XSA9IFwiRXJyb3JcIjtcclxufSkoTWFya2VyU2V2ZXJpdHkgfHwgKE1hcmtlclNldmVyaXR5ID0ge30pKTtcclxuZXhwb3J0IHZhciBNYXJrZXJUYWc7XHJcbihmdW5jdGlvbiAoTWFya2VyVGFnKSB7XHJcbiAgICBNYXJrZXJUYWdbTWFya2VyVGFnW1wiVW5uZWNlc3NhcnlcIl0gPSAxXSA9IFwiVW5uZWNlc3NhcnlcIjtcclxuICAgIE1hcmtlclRhZ1tNYXJrZXJUYWdbXCJEZXByZWNhdGVkXCJdID0gMl0gPSBcIkRlcHJlY2F0ZWRcIjtcclxufSkoTWFya2VyVGFnIHx8IChNYXJrZXJUYWcgPSB7fSkpO1xyXG4vKipcclxuICogUG9zaXRpb24gaW4gdGhlIG1pbmltYXAgdG8gcmVuZGVyIHRoZSBkZWNvcmF0aW9uLlxyXG4gKi9cclxuZXhwb3J0IHZhciBNaW5pbWFwUG9zaXRpb247XHJcbihmdW5jdGlvbiAoTWluaW1hcFBvc2l0aW9uKSB7XHJcbiAgICBNaW5pbWFwUG9zaXRpb25bTWluaW1hcFBvc2l0aW9uW1wiSW5saW5lXCJdID0gMV0gPSBcIklubGluZVwiO1xyXG4gICAgTWluaW1hcFBvc2l0aW9uW01pbmltYXBQb3NpdGlvbltcIkd1dHRlclwiXSA9IDJdID0gXCJHdXR0ZXJcIjtcclxufSkoTWluaW1hcFBvc2l0aW9uIHx8IChNaW5pbWFwUG9zaXRpb24gPSB7fSkpO1xyXG4vKipcclxuICogVHlwZSBvZiBoaXQgZWxlbWVudCB3aXRoIHRoZSBtb3VzZSBpbiB0aGUgZWRpdG9yLlxyXG4gKi9cclxuZXhwb3J0IHZhciBNb3VzZVRhcmdldFR5cGU7XHJcbihmdW5jdGlvbiAoTW91c2VUYXJnZXRUeXBlKSB7XHJcbiAgICAvKipcclxuICAgICAqIE1vdXNlIGlzIG9uIHRvcCBvZiBhbiB1bmtub3duIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIE1vdXNlVGFyZ2V0VHlwZVtNb3VzZVRhcmdldFR5cGVbXCJVTktOT1dOXCJdID0gMF0gPSBcIlVOS05PV05cIjtcclxuICAgIC8qKlxyXG4gICAgICogTW91c2UgaXMgb24gdG9wIG9mIHRoZSB0ZXh0YXJlYSB1c2VkIGZvciBpbnB1dC5cclxuICAgICAqL1xyXG4gICAgTW91c2VUYXJnZXRUeXBlW01vdXNlVGFyZ2V0VHlwZVtcIlRFWFRBUkVBXCJdID0gMV0gPSBcIlRFWFRBUkVBXCI7XHJcbiAgICAvKipcclxuICAgICAqIE1vdXNlIGlzIG9uIHRvcCBvZiB0aGUgZ2x5cGggbWFyZ2luXHJcbiAgICAgKi9cclxuICAgIE1vdXNlVGFyZ2V0VHlwZVtNb3VzZVRhcmdldFR5cGVbXCJHVVRURVJfR0xZUEhfTUFSR0lOXCJdID0gMl0gPSBcIkdVVFRFUl9HTFlQSF9NQVJHSU5cIjtcclxuICAgIC8qKlxyXG4gICAgICogTW91c2UgaXMgb24gdG9wIG9mIHRoZSBsaW5lIG51bWJlcnNcclxuICAgICAqL1xyXG4gICAgTW91c2VUYXJnZXRUeXBlW01vdXNlVGFyZ2V0VHlwZVtcIkdVVFRFUl9MSU5FX05VTUJFUlNcIl0gPSAzXSA9IFwiR1VUVEVSX0xJTkVfTlVNQkVSU1wiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBNb3VzZSBpcyBvbiB0b3Agb2YgdGhlIGxpbmUgZGVjb3JhdGlvbnNcclxuICAgICAqL1xyXG4gICAgTW91c2VUYXJnZXRUeXBlW01vdXNlVGFyZ2V0VHlwZVtcIkdVVFRFUl9MSU5FX0RFQ09SQVRJT05TXCJdID0gNF0gPSBcIkdVVFRFUl9MSU5FX0RFQ09SQVRJT05TXCI7XHJcbiAgICAvKipcclxuICAgICAqIE1vdXNlIGlzIG9uIHRvcCBvZiB0aGUgd2hpdGVzcGFjZSBsZWZ0IGluIHRoZSBndXR0ZXIgYnkgYSB2aWV3IHpvbmUuXHJcbiAgICAgKi9cclxuICAgIE1vdXNlVGFyZ2V0VHlwZVtNb3VzZVRhcmdldFR5cGVbXCJHVVRURVJfVklFV19aT05FXCJdID0gNV0gPSBcIkdVVFRFUl9WSUVXX1pPTkVcIjtcclxuICAgIC8qKlxyXG4gICAgICogTW91c2UgaXMgb24gdG9wIG9mIHRleHQgaW4gdGhlIGNvbnRlbnQuXHJcbiAgICAgKi9cclxuICAgIE1vdXNlVGFyZ2V0VHlwZVtNb3VzZVRhcmdldFR5cGVbXCJDT05URU5UX1RFWFRcIl0gPSA2XSA9IFwiQ09OVEVOVF9URVhUXCI7XHJcbiAgICAvKipcclxuICAgICAqIE1vdXNlIGlzIG9uIHRvcCBvZiBlbXB0eSBzcGFjZSBpbiB0aGUgY29udGVudCAoZS5nLiBhZnRlciBsaW5lIHRleHQgb3IgYmVsb3cgbGFzdCBsaW5lKVxyXG4gICAgICovXHJcbiAgICBNb3VzZVRhcmdldFR5cGVbTW91c2VUYXJnZXRUeXBlW1wiQ09OVEVOVF9FTVBUWVwiXSA9IDddID0gXCJDT05URU5UX0VNUFRZXCI7XHJcbiAgICAvKipcclxuICAgICAqIE1vdXNlIGlzIG9uIHRvcCBvZiBhIHZpZXcgem9uZSBpbiB0aGUgY29udGVudC5cclxuICAgICAqL1xyXG4gICAgTW91c2VUYXJnZXRUeXBlW01vdXNlVGFyZ2V0VHlwZVtcIkNPTlRFTlRfVklFV19aT05FXCJdID0gOF0gPSBcIkNPTlRFTlRfVklFV19aT05FXCI7XHJcbiAgICAvKipcclxuICAgICAqIE1vdXNlIGlzIG9uIHRvcCBvZiBhIGNvbnRlbnQgd2lkZ2V0LlxyXG4gICAgICovXHJcbiAgICBNb3VzZVRhcmdldFR5cGVbTW91c2VUYXJnZXRUeXBlW1wiQ09OVEVOVF9XSURHRVRcIl0gPSA5XSA9IFwiQ09OVEVOVF9XSURHRVRcIjtcclxuICAgIC8qKlxyXG4gICAgICogTW91c2UgaXMgb24gdG9wIG9mIHRoZSBkZWNvcmF0aW9ucyBvdmVydmlldyBydWxlci5cclxuICAgICAqL1xyXG4gICAgTW91c2VUYXJnZXRUeXBlW01vdXNlVGFyZ2V0VHlwZVtcIk9WRVJWSUVXX1JVTEVSXCJdID0gMTBdID0gXCJPVkVSVklFV19SVUxFUlwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBNb3VzZSBpcyBvbiB0b3Agb2YgYSBzY3JvbGxiYXIuXHJcbiAgICAgKi9cclxuICAgIE1vdXNlVGFyZ2V0VHlwZVtNb3VzZVRhcmdldFR5cGVbXCJTQ1JPTExCQVJcIl0gPSAxMV0gPSBcIlNDUk9MTEJBUlwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBNb3VzZSBpcyBvbiB0b3Agb2YgYW4gb3ZlcmxheSB3aWRnZXQuXHJcbiAgICAgKi9cclxuICAgIE1vdXNlVGFyZ2V0VHlwZVtNb3VzZVRhcmdldFR5cGVbXCJPVkVSTEFZX1dJREdFVFwiXSA9IDEyXSA9IFwiT1ZFUkxBWV9XSURHRVRcIjtcclxuICAgIC8qKlxyXG4gICAgICogTW91c2UgaXMgb3V0c2lkZSBvZiB0aGUgZWRpdG9yLlxyXG4gICAgICovXHJcbiAgICBNb3VzZVRhcmdldFR5cGVbTW91c2VUYXJnZXRUeXBlW1wiT1VUU0lERV9FRElUT1JcIl0gPSAxM10gPSBcIk9VVFNJREVfRURJVE9SXCI7XHJcbn0pKE1vdXNlVGFyZ2V0VHlwZSB8fCAoTW91c2VUYXJnZXRUeXBlID0ge30pKTtcclxuLyoqXHJcbiAqIEEgcG9zaXRpb25pbmcgcHJlZmVyZW5jZSBmb3IgcmVuZGVyaW5nIG92ZXJsYXkgd2lkZ2V0cy5cclxuICovXHJcbmV4cG9ydCB2YXIgT3ZlcmxheVdpZGdldFBvc2l0aW9uUHJlZmVyZW5jZTtcclxuKGZ1bmN0aW9uIChPdmVybGF5V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlKSB7XHJcbiAgICAvKipcclxuICAgICAqIFBvc2l0aW9uIHRoZSBvdmVybGF5IHdpZGdldCBpbiB0aGUgdG9wIHJpZ2h0IGNvcm5lclxyXG4gICAgICovXHJcbiAgICBPdmVybGF5V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlW092ZXJsYXlXaWRnZXRQb3NpdGlvblByZWZlcmVuY2VbXCJUT1BfUklHSFRfQ09STkVSXCJdID0gMF0gPSBcIlRPUF9SSUdIVF9DT1JORVJcIjtcclxuICAgIC8qKlxyXG4gICAgICogUG9zaXRpb24gdGhlIG92ZXJsYXkgd2lkZ2V0IGluIHRoZSBib3R0b20gcmlnaHQgY29ybmVyXHJcbiAgICAgKi9cclxuICAgIE92ZXJsYXlXaWRnZXRQb3NpdGlvblByZWZlcmVuY2VbT3ZlcmxheVdpZGdldFBvc2l0aW9uUHJlZmVyZW5jZVtcIkJPVFRPTV9SSUdIVF9DT1JORVJcIl0gPSAxXSA9IFwiQk9UVE9NX1JJR0hUX0NPUk5FUlwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBQb3NpdGlvbiB0aGUgb3ZlcmxheSB3aWRnZXQgaW4gdGhlIHRvcCBjZW50ZXJcclxuICAgICAqL1xyXG4gICAgT3ZlcmxheVdpZGdldFBvc2l0aW9uUHJlZmVyZW5jZVtPdmVybGF5V2lkZ2V0UG9zaXRpb25QcmVmZXJlbmNlW1wiVE9QX0NFTlRFUlwiXSA9IDJdID0gXCJUT1BfQ0VOVEVSXCI7XHJcbn0pKE92ZXJsYXlXaWRnZXRQb3NpdGlvblByZWZlcmVuY2UgfHwgKE92ZXJsYXlXaWRnZXRQb3NpdGlvblByZWZlcmVuY2UgPSB7fSkpO1xyXG4vKipcclxuICogVmVydGljYWwgTGFuZSBpbiB0aGUgb3ZlcnZpZXcgcnVsZXIgb2YgdGhlIGVkaXRvci5cclxuICovXHJcbmV4cG9ydCB2YXIgT3ZlcnZpZXdSdWxlckxhbmU7XHJcbihmdW5jdGlvbiAoT3ZlcnZpZXdSdWxlckxhbmUpIHtcclxuICAgIE92ZXJ2aWV3UnVsZXJMYW5lW092ZXJ2aWV3UnVsZXJMYW5lW1wiTGVmdFwiXSA9IDFdID0gXCJMZWZ0XCI7XHJcbiAgICBPdmVydmlld1J1bGVyTGFuZVtPdmVydmlld1J1bGVyTGFuZVtcIkNlbnRlclwiXSA9IDJdID0gXCJDZW50ZXJcIjtcclxuICAgIE92ZXJ2aWV3UnVsZXJMYW5lW092ZXJ2aWV3UnVsZXJMYW5lW1wiUmlnaHRcIl0gPSA0XSA9IFwiUmlnaHRcIjtcclxuICAgIE92ZXJ2aWV3UnVsZXJMYW5lW092ZXJ2aWV3UnVsZXJMYW5lW1wiRnVsbFwiXSA9IDddID0gXCJGdWxsXCI7XHJcbn0pKE92ZXJ2aWV3UnVsZXJMYW5lIHx8IChPdmVydmlld1J1bGVyTGFuZSA9IHt9KSk7XHJcbmV4cG9ydCB2YXIgUmVuZGVyTGluZU51bWJlcnNUeXBlO1xyXG4oZnVuY3Rpb24gKFJlbmRlckxpbmVOdW1iZXJzVHlwZSkge1xyXG4gICAgUmVuZGVyTGluZU51bWJlcnNUeXBlW1JlbmRlckxpbmVOdW1iZXJzVHlwZVtcIk9mZlwiXSA9IDBdID0gXCJPZmZcIjtcclxuICAgIFJlbmRlckxpbmVOdW1iZXJzVHlwZVtSZW5kZXJMaW5lTnVtYmVyc1R5cGVbXCJPblwiXSA9IDFdID0gXCJPblwiO1xyXG4gICAgUmVuZGVyTGluZU51bWJlcnNUeXBlW1JlbmRlckxpbmVOdW1iZXJzVHlwZVtcIlJlbGF0aXZlXCJdID0gMl0gPSBcIlJlbGF0aXZlXCI7XHJcbiAgICBSZW5kZXJMaW5lTnVtYmVyc1R5cGVbUmVuZGVyTGluZU51bWJlcnNUeXBlW1wiSW50ZXJ2YWxcIl0gPSAzXSA9IFwiSW50ZXJ2YWxcIjtcclxuICAgIFJlbmRlckxpbmVOdW1iZXJzVHlwZVtSZW5kZXJMaW5lTnVtYmVyc1R5cGVbXCJDdXN0b21cIl0gPSA0XSA9IFwiQ3VzdG9tXCI7XHJcbn0pKFJlbmRlckxpbmVOdW1iZXJzVHlwZSB8fCAoUmVuZGVyTGluZU51bWJlcnNUeXBlID0ge30pKTtcclxuZXhwb3J0IHZhciBSZW5kZXJNaW5pbWFwO1xyXG4oZnVuY3Rpb24gKFJlbmRlck1pbmltYXApIHtcclxuICAgIFJlbmRlck1pbmltYXBbUmVuZGVyTWluaW1hcFtcIk5vbmVcIl0gPSAwXSA9IFwiTm9uZVwiO1xyXG4gICAgUmVuZGVyTWluaW1hcFtSZW5kZXJNaW5pbWFwW1wiVGV4dFwiXSA9IDFdID0gXCJUZXh0XCI7XHJcbiAgICBSZW5kZXJNaW5pbWFwW1JlbmRlck1pbmltYXBbXCJCbG9ja3NcIl0gPSAyXSA9IFwiQmxvY2tzXCI7XHJcbn0pKFJlbmRlck1pbmltYXAgfHwgKFJlbmRlck1pbmltYXAgPSB7fSkpO1xyXG5leHBvcnQgdmFyIFNjcm9sbFR5cGU7XHJcbihmdW5jdGlvbiAoU2Nyb2xsVHlwZSkge1xyXG4gICAgU2Nyb2xsVHlwZVtTY3JvbGxUeXBlW1wiU21vb3RoXCJdID0gMF0gPSBcIlNtb290aFwiO1xyXG4gICAgU2Nyb2xsVHlwZVtTY3JvbGxUeXBlW1wiSW1tZWRpYXRlXCJdID0gMV0gPSBcIkltbWVkaWF0ZVwiO1xyXG59KShTY3JvbGxUeXBlIHx8IChTY3JvbGxUeXBlID0ge30pKTtcclxuZXhwb3J0IHZhciBTY3JvbGxiYXJWaXNpYmlsaXR5O1xyXG4oZnVuY3Rpb24gKFNjcm9sbGJhclZpc2liaWxpdHkpIHtcclxuICAgIFNjcm9sbGJhclZpc2liaWxpdHlbU2Nyb2xsYmFyVmlzaWJpbGl0eVtcIkF1dG9cIl0gPSAxXSA9IFwiQXV0b1wiO1xyXG4gICAgU2Nyb2xsYmFyVmlzaWJpbGl0eVtTY3JvbGxiYXJWaXNpYmlsaXR5W1wiSGlkZGVuXCJdID0gMl0gPSBcIkhpZGRlblwiO1xyXG4gICAgU2Nyb2xsYmFyVmlzaWJpbGl0eVtTY3JvbGxiYXJWaXNpYmlsaXR5W1wiVmlzaWJsZVwiXSA9IDNdID0gXCJWaXNpYmxlXCI7XHJcbn0pKFNjcm9sbGJhclZpc2liaWxpdHkgfHwgKFNjcm9sbGJhclZpc2liaWxpdHkgPSB7fSkpO1xyXG4vKipcclxuICogVGhlIGRpcmVjdGlvbiBvZiBhIHNlbGVjdGlvbi5cclxuICovXHJcbmV4cG9ydCB2YXIgU2VsZWN0aW9uRGlyZWN0aW9uO1xyXG4oZnVuY3Rpb24gKFNlbGVjdGlvbkRpcmVjdGlvbikge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2VsZWN0aW9uIHN0YXJ0cyBhYm92ZSB3aGVyZSBpdCBlbmRzLlxyXG4gICAgICovXHJcbiAgICBTZWxlY3Rpb25EaXJlY3Rpb25bU2VsZWN0aW9uRGlyZWN0aW9uW1wiTFRSXCJdID0gMF0gPSBcIkxUUlwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2VsZWN0aW9uIHN0YXJ0cyBiZWxvdyB3aGVyZSBpdCBlbmRzLlxyXG4gICAgICovXHJcbiAgICBTZWxlY3Rpb25EaXJlY3Rpb25bU2VsZWN0aW9uRGlyZWN0aW9uW1wiUlRMXCJdID0gMV0gPSBcIlJUTFwiO1xyXG59KShTZWxlY3Rpb25EaXJlY3Rpb24gfHwgKFNlbGVjdGlvbkRpcmVjdGlvbiA9IHt9KSk7XHJcbmV4cG9ydCB2YXIgU2lnbmF0dXJlSGVscFRyaWdnZXJLaW5kO1xyXG4oZnVuY3Rpb24gKFNpZ25hdHVyZUhlbHBUcmlnZ2VyS2luZCkge1xyXG4gICAgU2lnbmF0dXJlSGVscFRyaWdnZXJLaW5kW1NpZ25hdHVyZUhlbHBUcmlnZ2VyS2luZFtcIkludm9rZVwiXSA9IDFdID0gXCJJbnZva2VcIjtcclxuICAgIFNpZ25hdHVyZUhlbHBUcmlnZ2VyS2luZFtTaWduYXR1cmVIZWxwVHJpZ2dlcktpbmRbXCJUcmlnZ2VyQ2hhcmFjdGVyXCJdID0gMl0gPSBcIlRyaWdnZXJDaGFyYWN0ZXJcIjtcclxuICAgIFNpZ25hdHVyZUhlbHBUcmlnZ2VyS2luZFtTaWduYXR1cmVIZWxwVHJpZ2dlcktpbmRbXCJDb250ZW50Q2hhbmdlXCJdID0gM10gPSBcIkNvbnRlbnRDaGFuZ2VcIjtcclxufSkoU2lnbmF0dXJlSGVscFRyaWdnZXJLaW5kIHx8IChTaWduYXR1cmVIZWxwVHJpZ2dlcktpbmQgPSB7fSkpO1xyXG4vKipcclxuICogQSBzeW1ib2wga2luZC5cclxuICovXHJcbmV4cG9ydCB2YXIgU3ltYm9sS2luZDtcclxuKGZ1bmN0aW9uIChTeW1ib2xLaW5kKSB7XHJcbiAgICBTeW1ib2xLaW5kW1N5bWJvbEtpbmRbXCJGaWxlXCJdID0gMF0gPSBcIkZpbGVcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIk1vZHVsZVwiXSA9IDFdID0gXCJNb2R1bGVcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIk5hbWVzcGFjZVwiXSA9IDJdID0gXCJOYW1lc3BhY2VcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIlBhY2thZ2VcIl0gPSAzXSA9IFwiUGFja2FnZVwiO1xyXG4gICAgU3ltYm9sS2luZFtTeW1ib2xLaW5kW1wiQ2xhc3NcIl0gPSA0XSA9IFwiQ2xhc3NcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIk1ldGhvZFwiXSA9IDVdID0gXCJNZXRob2RcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIlByb3BlcnR5XCJdID0gNl0gPSBcIlByb3BlcnR5XCI7XHJcbiAgICBTeW1ib2xLaW5kW1N5bWJvbEtpbmRbXCJGaWVsZFwiXSA9IDddID0gXCJGaWVsZFwiO1xyXG4gICAgU3ltYm9sS2luZFtTeW1ib2xLaW5kW1wiQ29uc3RydWN0b3JcIl0gPSA4XSA9IFwiQ29uc3RydWN0b3JcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIkVudW1cIl0gPSA5XSA9IFwiRW51bVwiO1xyXG4gICAgU3ltYm9sS2luZFtTeW1ib2xLaW5kW1wiSW50ZXJmYWNlXCJdID0gMTBdID0gXCJJbnRlcmZhY2VcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIkZ1bmN0aW9uXCJdID0gMTFdID0gXCJGdW5jdGlvblwiO1xyXG4gICAgU3ltYm9sS2luZFtTeW1ib2xLaW5kW1wiVmFyaWFibGVcIl0gPSAxMl0gPSBcIlZhcmlhYmxlXCI7XHJcbiAgICBTeW1ib2xLaW5kW1N5bWJvbEtpbmRbXCJDb25zdGFudFwiXSA9IDEzXSA9IFwiQ29uc3RhbnRcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIlN0cmluZ1wiXSA9IDE0XSA9IFwiU3RyaW5nXCI7XHJcbiAgICBTeW1ib2xLaW5kW1N5bWJvbEtpbmRbXCJOdW1iZXJcIl0gPSAxNV0gPSBcIk51bWJlclwiO1xyXG4gICAgU3ltYm9sS2luZFtTeW1ib2xLaW5kW1wiQm9vbGVhblwiXSA9IDE2XSA9IFwiQm9vbGVhblwiO1xyXG4gICAgU3ltYm9sS2luZFtTeW1ib2xLaW5kW1wiQXJyYXlcIl0gPSAxN10gPSBcIkFycmF5XCI7XHJcbiAgICBTeW1ib2xLaW5kW1N5bWJvbEtpbmRbXCJPYmplY3RcIl0gPSAxOF0gPSBcIk9iamVjdFwiO1xyXG4gICAgU3ltYm9sS2luZFtTeW1ib2xLaW5kW1wiS2V5XCJdID0gMTldID0gXCJLZXlcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIk51bGxcIl0gPSAyMF0gPSBcIk51bGxcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIkVudW1NZW1iZXJcIl0gPSAyMV0gPSBcIkVudW1NZW1iZXJcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIlN0cnVjdFwiXSA9IDIyXSA9IFwiU3RydWN0XCI7XHJcbiAgICBTeW1ib2xLaW5kW1N5bWJvbEtpbmRbXCJFdmVudFwiXSA9IDIzXSA9IFwiRXZlbnRcIjtcclxuICAgIFN5bWJvbEtpbmRbU3ltYm9sS2luZFtcIk9wZXJhdG9yXCJdID0gMjRdID0gXCJPcGVyYXRvclwiO1xyXG4gICAgU3ltYm9sS2luZFtTeW1ib2xLaW5kW1wiVHlwZVBhcmFtZXRlclwiXSA9IDI1XSA9IFwiVHlwZVBhcmFtZXRlclwiO1xyXG59KShTeW1ib2xLaW5kIHx8IChTeW1ib2xLaW5kID0ge30pKTtcclxuZXhwb3J0IHZhciBTeW1ib2xUYWc7XHJcbihmdW5jdGlvbiAoU3ltYm9sVGFnKSB7XHJcbiAgICBTeW1ib2xUYWdbU3ltYm9sVGFnW1wiRGVwcmVjYXRlZFwiXSA9IDFdID0gXCJEZXByZWNhdGVkXCI7XHJcbn0pKFN5bWJvbFRhZyB8fCAoU3ltYm9sVGFnID0ge30pKTtcclxuLyoqXHJcbiAqIFRoZSBraW5kIG9mIGFuaW1hdGlvbiBpbiB3aGljaCB0aGUgZWRpdG9yJ3MgY3Vyc29yIHNob3VsZCBiZSByZW5kZXJlZC5cclxuICovXHJcbmV4cG9ydCB2YXIgVGV4dEVkaXRvckN1cnNvckJsaW5raW5nU3R5bGU7XHJcbihmdW5jdGlvbiAoVGV4dEVkaXRvckN1cnNvckJsaW5raW5nU3R5bGUpIHtcclxuICAgIC8qKlxyXG4gICAgICogSGlkZGVuXHJcbiAgICAgKi9cclxuICAgIFRleHRFZGl0b3JDdXJzb3JCbGlua2luZ1N0eWxlW1RleHRFZGl0b3JDdXJzb3JCbGlua2luZ1N0eWxlW1wiSGlkZGVuXCJdID0gMF0gPSBcIkhpZGRlblwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBCbGlua2luZ1xyXG4gICAgICovXHJcbiAgICBUZXh0RWRpdG9yQ3Vyc29yQmxpbmtpbmdTdHlsZVtUZXh0RWRpdG9yQ3Vyc29yQmxpbmtpbmdTdHlsZVtcIkJsaW5rXCJdID0gMV0gPSBcIkJsaW5rXCI7XHJcbiAgICAvKipcclxuICAgICAqIEJsaW5raW5nIHdpdGggc21vb3RoIGZhZGluZ1xyXG4gICAgICovXHJcbiAgICBUZXh0RWRpdG9yQ3Vyc29yQmxpbmtpbmdTdHlsZVtUZXh0RWRpdG9yQ3Vyc29yQmxpbmtpbmdTdHlsZVtcIlNtb290aFwiXSA9IDJdID0gXCJTbW9vdGhcIjtcclxuICAgIC8qKlxyXG4gICAgICogQmxpbmtpbmcgd2l0aCBwcm9sb25nZWQgZmlsbGVkIHN0YXRlIGFuZCBzbW9vdGggZmFkaW5nXHJcbiAgICAgKi9cclxuICAgIFRleHRFZGl0b3JDdXJzb3JCbGlua2luZ1N0eWxlW1RleHRFZGl0b3JDdXJzb3JCbGlua2luZ1N0eWxlW1wiUGhhc2VcIl0gPSAzXSA9IFwiUGhhc2VcIjtcclxuICAgIC8qKlxyXG4gICAgICogRXhwYW5kIGNvbGxhcHNlIGFuaW1hdGlvbiBvbiB0aGUgeSBheGlzXHJcbiAgICAgKi9cclxuICAgIFRleHRFZGl0b3JDdXJzb3JCbGlua2luZ1N0eWxlW1RleHRFZGl0b3JDdXJzb3JCbGlua2luZ1N0eWxlW1wiRXhwYW5kXCJdID0gNF0gPSBcIkV4cGFuZFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBOby1CbGlua2luZ1xyXG4gICAgICovXHJcbiAgICBUZXh0RWRpdG9yQ3Vyc29yQmxpbmtpbmdTdHlsZVtUZXh0RWRpdG9yQ3Vyc29yQmxpbmtpbmdTdHlsZVtcIlNvbGlkXCJdID0gNV0gPSBcIlNvbGlkXCI7XHJcbn0pKFRleHRFZGl0b3JDdXJzb3JCbGlua2luZ1N0eWxlIHx8IChUZXh0RWRpdG9yQ3Vyc29yQmxpbmtpbmdTdHlsZSA9IHt9KSk7XHJcbi8qKlxyXG4gKiBUaGUgc3R5bGUgaW4gd2hpY2ggdGhlIGVkaXRvcidzIGN1cnNvciBzaG91bGQgYmUgcmVuZGVyZWQuXHJcbiAqL1xyXG5leHBvcnQgdmFyIFRleHRFZGl0b3JDdXJzb3JTdHlsZTtcclxuKGZ1bmN0aW9uIChUZXh0RWRpdG9yQ3Vyc29yU3R5bGUpIHtcclxuICAgIC8qKlxyXG4gICAgICogQXMgYSB2ZXJ0aWNhbCBsaW5lIChzaXR0aW5nIGJldHdlZW4gdHdvIGNoYXJhY3RlcnMpLlxyXG4gICAgICovXHJcbiAgICBUZXh0RWRpdG9yQ3Vyc29yU3R5bGVbVGV4dEVkaXRvckN1cnNvclN0eWxlW1wiTGluZVwiXSA9IDFdID0gXCJMaW5lXCI7XHJcbiAgICAvKipcclxuICAgICAqIEFzIGEgYmxvY2sgKHNpdHRpbmcgb24gdG9wIG9mIGEgY2hhcmFjdGVyKS5cclxuICAgICAqL1xyXG4gICAgVGV4dEVkaXRvckN1cnNvclN0eWxlW1RleHRFZGl0b3JDdXJzb3JTdHlsZVtcIkJsb2NrXCJdID0gMl0gPSBcIkJsb2NrXCI7XHJcbiAgICAvKipcclxuICAgICAqIEFzIGEgaG9yaXpvbnRhbCBsaW5lIChzaXR0aW5nIHVuZGVyIGEgY2hhcmFjdGVyKS5cclxuICAgICAqL1xyXG4gICAgVGV4dEVkaXRvckN1cnNvclN0eWxlW1RleHRFZGl0b3JDdXJzb3JTdHlsZVtcIlVuZGVybGluZVwiXSA9IDNdID0gXCJVbmRlcmxpbmVcIjtcclxuICAgIC8qKlxyXG4gICAgICogQXMgYSB0aGluIHZlcnRpY2FsIGxpbmUgKHNpdHRpbmcgYmV0d2VlbiB0d28gY2hhcmFjdGVycykuXHJcbiAgICAgKi9cclxuICAgIFRleHRFZGl0b3JDdXJzb3JTdHlsZVtUZXh0RWRpdG9yQ3Vyc29yU3R5bGVbXCJMaW5lVGhpblwiXSA9IDRdID0gXCJMaW5lVGhpblwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcyBhbiBvdXRsaW5lZCBibG9jayAoc2l0dGluZyBvbiB0b3Agb2YgYSBjaGFyYWN0ZXIpLlxyXG4gICAgICovXHJcbiAgICBUZXh0RWRpdG9yQ3Vyc29yU3R5bGVbVGV4dEVkaXRvckN1cnNvclN0eWxlW1wiQmxvY2tPdXRsaW5lXCJdID0gNV0gPSBcIkJsb2NrT3V0bGluZVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBBcyBhIHRoaW4gaG9yaXpvbnRhbCBsaW5lIChzaXR0aW5nIHVuZGVyIGEgY2hhcmFjdGVyKS5cclxuICAgICAqL1xyXG4gICAgVGV4dEVkaXRvckN1cnNvclN0eWxlW1RleHRFZGl0b3JDdXJzb3JTdHlsZVtcIlVuZGVybGluZVRoaW5cIl0gPSA2XSA9IFwiVW5kZXJsaW5lVGhpblwiO1xyXG59KShUZXh0RWRpdG9yQ3Vyc29yU3R5bGUgfHwgKFRleHRFZGl0b3JDdXJzb3JTdHlsZSA9IHt9KSk7XHJcbi8qKlxyXG4gKiBEZXNjcmliZXMgdGhlIGJlaGF2aW9yIG9mIGRlY29yYXRpb25zIHdoZW4gdHlwaW5nL2VkaXRpbmcgbmVhciB0aGVpciBlZGdlcy5cclxuICogTm90ZTogUGxlYXNlIGRvIG5vdCBlZGl0IHRoZSB2YWx1ZXMsIGFzIHRoZXkgdmVyeSBjYXJlZnVsbHkgbWF0Y2ggYERlY29yYXRpb25SYW5nZUJlaGF2aW9yYFxyXG4gKi9cclxuZXhwb3J0IHZhciBUcmFja2VkUmFuZ2VTdGlja2luZXNzO1xyXG4oZnVuY3Rpb24gKFRyYWNrZWRSYW5nZVN0aWNraW5lc3MpIHtcclxuICAgIFRyYWNrZWRSYW5nZVN0aWNraW5lc3NbVHJhY2tlZFJhbmdlU3RpY2tpbmVzc1tcIkFsd2F5c0dyb3dzV2hlblR5cGluZ0F0RWRnZXNcIl0gPSAwXSA9IFwiQWx3YXlzR3Jvd3NXaGVuVHlwaW5nQXRFZGdlc1wiO1xyXG4gICAgVHJhY2tlZFJhbmdlU3RpY2tpbmVzc1tUcmFja2VkUmFuZ2VTdGlja2luZXNzW1wiTmV2ZXJHcm93c1doZW5UeXBpbmdBdEVkZ2VzXCJdID0gMV0gPSBcIk5ldmVyR3Jvd3NXaGVuVHlwaW5nQXRFZGdlc1wiO1xyXG4gICAgVHJhY2tlZFJhbmdlU3RpY2tpbmVzc1tUcmFja2VkUmFuZ2VTdGlja2luZXNzW1wiR3Jvd3NPbmx5V2hlblR5cGluZ0JlZm9yZVwiXSA9IDJdID0gXCJHcm93c09ubHlXaGVuVHlwaW5nQmVmb3JlXCI7XHJcbiAgICBUcmFja2VkUmFuZ2VTdGlja2luZXNzW1RyYWNrZWRSYW5nZVN0aWNraW5lc3NbXCJHcm93c09ubHlXaGVuVHlwaW5nQWZ0ZXJcIl0gPSAzXSA9IFwiR3Jvd3NPbmx5V2hlblR5cGluZ0FmdGVyXCI7XHJcbn0pKFRyYWNrZWRSYW5nZVN0aWNraW5lc3MgfHwgKFRyYWNrZWRSYW5nZVN0aWNraW5lc3MgPSB7fSkpO1xyXG4vKipcclxuICogRGVzY3JpYmVzIGhvdyB0byBpbmRlbnQgd3JhcHBlZCBsaW5lcy5cclxuICovXHJcbmV4cG9ydCB2YXIgV3JhcHBpbmdJbmRlbnQ7XHJcbihmdW5jdGlvbiAoV3JhcHBpbmdJbmRlbnQpIHtcclxuICAgIC8qKlxyXG4gICAgICogTm8gaW5kZW50YXRpb24gPT4gd3JhcHBlZCBsaW5lcyBiZWdpbiBhdCBjb2x1bW4gMS5cclxuICAgICAqL1xyXG4gICAgV3JhcHBpbmdJbmRlbnRbV3JhcHBpbmdJbmRlbnRbXCJOb25lXCJdID0gMF0gPSBcIk5vbmVcIjtcclxuICAgIC8qKlxyXG4gICAgICogU2FtZSA9PiB3cmFwcGVkIGxpbmVzIGdldCB0aGUgc2FtZSBpbmRlbnRhdGlvbiBhcyB0aGUgcGFyZW50LlxyXG4gICAgICovXHJcbiAgICBXcmFwcGluZ0luZGVudFtXcmFwcGluZ0luZGVudFtcIlNhbWVcIl0gPSAxXSA9IFwiU2FtZVwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBJbmRlbnQgPT4gd3JhcHBlZCBsaW5lcyBnZXQgKzEgaW5kZW50YXRpb24gdG93YXJkIHRoZSBwYXJlbnQuXHJcbiAgICAgKi9cclxuICAgIFdyYXBwaW5nSW5kZW50W1dyYXBwaW5nSW5kZW50W1wiSW5kZW50XCJdID0gMl0gPSBcIkluZGVudFwiO1xyXG4gICAgLyoqXHJcbiAgICAgKiBEZWVwSW5kZW50ID0+IHdyYXBwZWQgbGluZXMgZ2V0ICsyIGluZGVudGF0aW9uIHRvd2FyZCB0aGUgcGFyZW50LlxyXG4gICAgICovXHJcbiAgICBXcmFwcGluZ0luZGVudFtXcmFwcGluZ0luZGVudFtcIkRlZXBJbmRlbnRcIl0gPSAzXSA9IFwiRGVlcEluZGVudFwiO1xyXG59KShXcmFwcGluZ0luZGVudCB8fCAoV3JhcHBpbmdJbmRlbnQgPSB7fSkpO1xyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCB7IENhbmNlbGxhdGlvblRva2VuU291cmNlIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9jb21tb24vY2FuY2VsbGF0aW9uLmpzJztcclxuaW1wb3J0IHsgRW1pdHRlciB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvY29tbW9uL2V2ZW50LmpzJztcclxuaW1wb3J0IHsgS2V5Q2hvcmQgfSBmcm9tICcuLi8uLi8uLi9iYXNlL2NvbW1vbi9rZXlDb2Rlcy5qcyc7XHJcbmltcG9ydCB7IFVSSSB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvY29tbW9uL3VyaS5qcyc7XHJcbmltcG9ydCB7IFBvc2l0aW9uIH0gZnJvbSAnLi4vY29yZS9wb3NpdGlvbi5qcyc7XHJcbmltcG9ydCB7IFJhbmdlIH0gZnJvbSAnLi4vY29yZS9yYW5nZS5qcyc7XHJcbmltcG9ydCB7IFNlbGVjdGlvbiB9IGZyb20gJy4uL2NvcmUvc2VsZWN0aW9uLmpzJztcclxuaW1wb3J0IHsgVG9rZW4gfSBmcm9tICcuLi9jb3JlL3Rva2VuLmpzJztcclxuaW1wb3J0ICogYXMgc3RhbmRhbG9uZUVudW1zIGZyb20gJy4vc3RhbmRhbG9uZUVudW1zLmpzJztcclxuZXhwb3J0IGNsYXNzIEtleU1vZCB7XHJcbiAgICBzdGF0aWMgY2hvcmQoZmlyc3RQYXJ0LCBzZWNvbmRQYXJ0KSB7XHJcbiAgICAgICAgcmV0dXJuIEtleUNob3JkKGZpcnN0UGFydCwgc2Vjb25kUGFydCk7XHJcbiAgICB9XHJcbn1cclxuS2V5TW9kLkN0cmxDbWQgPSAyMDQ4IC8qIEN0cmxDbWQgKi87XHJcbktleU1vZC5TaGlmdCA9IDEwMjQgLyogU2hpZnQgKi87XHJcbktleU1vZC5BbHQgPSA1MTIgLyogQWx0ICovO1xyXG5LZXlNb2QuV2luQ3RybCA9IDI1NiAvKiBXaW5DdHJsICovO1xyXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9uYWNvQmFzZUFQSSgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZWRpdG9yOiB1bmRlZmluZWQsXHJcbiAgICAgICAgbGFuZ3VhZ2VzOiB1bmRlZmluZWQsXHJcbiAgICAgICAgQ2FuY2VsbGF0aW9uVG9rZW5Tb3VyY2U6IENhbmNlbGxhdGlvblRva2VuU291cmNlLFxyXG4gICAgICAgIEVtaXR0ZXI6IEVtaXR0ZXIsXHJcbiAgICAgICAgS2V5Q29kZTogc3RhbmRhbG9uZUVudW1zLktleUNvZGUsXHJcbiAgICAgICAgS2V5TW9kOiBLZXlNb2QsXHJcbiAgICAgICAgUG9zaXRpb246IFBvc2l0aW9uLFxyXG4gICAgICAgIFJhbmdlOiBSYW5nZSxcclxuICAgICAgICBTZWxlY3Rpb246IFNlbGVjdGlvbixcclxuICAgICAgICBTZWxlY3Rpb25EaXJlY3Rpb246IHN0YW5kYWxvbmVFbnVtcy5TZWxlY3Rpb25EaXJlY3Rpb24sXHJcbiAgICAgICAgTWFya2VyU2V2ZXJpdHk6IHN0YW5kYWxvbmVFbnVtcy5NYXJrZXJTZXZlcml0eSxcclxuICAgICAgICBNYXJrZXJUYWc6IHN0YW5kYWxvbmVFbnVtcy5NYXJrZXJUYWcsXHJcbiAgICAgICAgVXJpOiBVUkksXHJcbiAgICAgICAgVG9rZW46IFRva2VuXHJcbiAgICB9O1xyXG59XHJcbiIsICIvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqICBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxyXG4gKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cclxudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5pbXBvcnQgeyBzdHJpbmdEaWZmIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9jb21tb24vZGlmZi9kaWZmLmpzJztcclxuaW1wb3J0IHsgZ2xvYmFscyB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvY29tbW9uL3BsYXRmb3JtLmpzJztcclxuaW1wb3J0IHsgVVJJIH0gZnJvbSAnLi4vLi4vLi4vYmFzZS9jb21tb24vdXJpLmpzJztcclxuaW1wb3J0IHsgUG9zaXRpb24gfSBmcm9tICcuLi9jb3JlL3Bvc2l0aW9uLmpzJztcclxuaW1wb3J0IHsgUmFuZ2UgfSBmcm9tICcuLi9jb3JlL3JhbmdlLmpzJztcclxuaW1wb3J0IHsgRGlmZkNvbXB1dGVyIH0gZnJvbSAnLi4vZGlmZi9kaWZmQ29tcHV0ZXIuanMnO1xyXG5pbXBvcnQgeyBNaXJyb3JUZXh0TW9kZWwgYXMgQmFzZU1pcnJvck1vZGVsIH0gZnJvbSAnLi4vbW9kZWwvbWlycm9yVGV4dE1vZGVsLmpzJztcclxuaW1wb3J0IHsgZW5zdXJlVmFsaWRXb3JkRGVmaW5pdGlvbiwgZ2V0V29yZEF0VGV4dCB9IGZyb20gJy4uL21vZGVsL3dvcmRIZWxwZXIuanMnO1xyXG5pbXBvcnQgeyBjb21wdXRlTGlua3MgfSBmcm9tICcuLi9tb2Rlcy9saW5rQ29tcHV0ZXIuanMnO1xyXG5pbXBvcnQgeyBCYXNpY0lucGxhY2VSZXBsYWNlIH0gZnJvbSAnLi4vbW9kZXMvc3VwcG9ydHMvaW5wbGFjZVJlcGxhY2VTdXBwb3J0LmpzJztcclxuaW1wb3J0IHsgY3JlYXRlTW9uYWNvQmFzZUFQSSB9IGZyb20gJy4uL3N0YW5kYWxvbmUvc3RhbmRhbG9uZUJhc2UuanMnO1xyXG5pbXBvcnQgKiBhcyB0eXBlcyBmcm9tICcuLi8uLi8uLi9iYXNlL2NvbW1vbi90eXBlcy5qcyc7XHJcbmltcG9ydCB7IFN0b3BXYXRjaCB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvY29tbW9uL3N0b3B3YXRjaC5qcyc7XHJcbi8qKlxyXG4gKiBAaW50ZXJuYWxcclxuICovXHJcbmNsYXNzIE1pcnJvck1vZGVsIGV4dGVuZHMgQmFzZU1pcnJvck1vZGVsIHtcclxuICAgIGdldCB1cmkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3VyaTtcclxuICAgIH1cclxuICAgIGdldCBlb2woKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2VvbDtcclxuICAgIH1cclxuICAgIGdldFZhbHVlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFRleHQoKTtcclxuICAgIH1cclxuICAgIGdldExpbmVzQ29udGVudCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGluZXMuc2xpY2UoMCk7XHJcbiAgICB9XHJcbiAgICBnZXRMaW5lQ291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xpbmVzLmxlbmd0aDtcclxuICAgIH1cclxuICAgIGdldExpbmVDb250ZW50KGxpbmVOdW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGluZXNbbGluZU51bWJlciAtIDFdO1xyXG4gICAgfVxyXG4gICAgZ2V0V29yZEF0UG9zaXRpb24ocG9zaXRpb24sIHdvcmREZWZpbml0aW9uKSB7XHJcbiAgICAgICAgbGV0IHdvcmRBdFRleHQgPSBnZXRXb3JkQXRUZXh0KHBvc2l0aW9uLmNvbHVtbiwgZW5zdXJlVmFsaWRXb3JkRGVmaW5pdGlvbih3b3JkRGVmaW5pdGlvbiksIHRoaXMuX2xpbmVzW3Bvc2l0aW9uLmxpbmVOdW1iZXIgLSAxXSwgMCk7XHJcbiAgICAgICAgaWYgKHdvcmRBdFRleHQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBSYW5nZShwb3NpdGlvbi5saW5lTnVtYmVyLCB3b3JkQXRUZXh0LnN0YXJ0Q29sdW1uLCBwb3NpdGlvbi5saW5lTnVtYmVyLCB3b3JkQXRUZXh0LmVuZENvbHVtbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgd29yZHMod29yZERlZmluaXRpb24pIHtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IHRoaXMuX2xpbmVzO1xyXG4gICAgICAgIGNvbnN0IHdvcmRlbml6ZSA9IHRoaXMuX3dvcmRlbml6ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIGxldCBsaW5lTnVtYmVyID0gMDtcclxuICAgICAgICBsZXQgbGluZVRleHQgPSAnJztcclxuICAgICAgICBsZXQgd29yZFJhbmdlc0lkeCA9IDA7XHJcbiAgICAgICAgbGV0IHdvcmRSYW5nZXMgPSBbXTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAqW1N5bWJvbC5pdGVyYXRvcl0oKSB7XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3b3JkUmFuZ2VzSWR4IDwgd29yZFJhbmdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBsaW5lVGV4dC5zdWJzdHJpbmcod29yZFJhbmdlc1t3b3JkUmFuZ2VzSWR4XS5zdGFydCwgd29yZFJhbmdlc1t3b3JkUmFuZ2VzSWR4XS5lbmQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3b3JkUmFuZ2VzSWR4ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxpbmVOdW1iZXIgPCBsaW5lcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVUZXh0ID0gbGluZXNbbGluZU51bWJlcl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JkUmFuZ2VzID0gd29yZGVuaXplKGxpbmVUZXh0LCB3b3JkRGVmaW5pdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JkUmFuZ2VzSWR4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVOdW1iZXIgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIGdldExpbmVXb3JkcyhsaW5lTnVtYmVyLCB3b3JkRGVmaW5pdGlvbikge1xyXG4gICAgICAgIGxldCBjb250ZW50ID0gdGhpcy5fbGluZXNbbGluZU51bWJlciAtIDFdO1xyXG4gICAgICAgIGxldCByYW5nZXMgPSB0aGlzLl93b3JkZW5pemUoY29udGVudCwgd29yZERlZmluaXRpb24pO1xyXG4gICAgICAgIGxldCB3b3JkcyA9IFtdO1xyXG4gICAgICAgIGZvciAoY29uc3QgcmFuZ2Ugb2YgcmFuZ2VzKSB7XHJcbiAgICAgICAgICAgIHdvcmRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgd29yZDogY29udGVudC5zdWJzdHJpbmcocmFuZ2Uuc3RhcnQsIHJhbmdlLmVuZCksXHJcbiAgICAgICAgICAgICAgICBzdGFydENvbHVtbjogcmFuZ2Uuc3RhcnQgKyAxLFxyXG4gICAgICAgICAgICAgICAgZW5kQ29sdW1uOiByYW5nZS5lbmQgKyAxXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gd29yZHM7XHJcbiAgICB9XHJcbiAgICBfd29yZGVuaXplKGNvbnRlbnQsIHdvcmREZWZpbml0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gW107XHJcbiAgICAgICAgbGV0IG1hdGNoO1xyXG4gICAgICAgIHdvcmREZWZpbml0aW9uLmxhc3RJbmRleCA9IDA7IC8vIHJlc2V0IGxhc3RJbmRleCBqdXN0IHRvIGJlIHN1cmVcclxuICAgICAgICB3aGlsZSAobWF0Y2ggPSB3b3JkRGVmaW5pdGlvbi5leGVjKGNvbnRlbnQpKSB7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaFswXS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIGl0IGRpZCBtYXRjaCB0aGUgZW1wdHkgc3RyaW5nXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXN1bHQucHVzaCh7IHN0YXJ0OiBtYXRjaC5pbmRleCwgZW5kOiBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxuICAgIGdldFZhbHVlSW5SYW5nZShyYW5nZSkge1xyXG4gICAgICAgIHJhbmdlID0gdGhpcy5fdmFsaWRhdGVSYW5nZShyYW5nZSk7XHJcbiAgICAgICAgaWYgKHJhbmdlLnN0YXJ0TGluZU51bWJlciA9PT0gcmFuZ2UuZW5kTGluZU51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbGluZXNbcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyIC0gMV0uc3Vic3RyaW5nKHJhbmdlLnN0YXJ0Q29sdW1uIC0gMSwgcmFuZ2UuZW5kQ29sdW1uIC0gMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBsaW5lRW5kaW5nID0gdGhpcy5fZW9sO1xyXG4gICAgICAgIGxldCBzdGFydExpbmVJbmRleCA9IHJhbmdlLnN0YXJ0TGluZU51bWJlciAtIDE7XHJcbiAgICAgICAgbGV0IGVuZExpbmVJbmRleCA9IHJhbmdlLmVuZExpbmVOdW1iZXIgLSAxO1xyXG4gICAgICAgIGxldCByZXN1bHRMaW5lcyA9IFtdO1xyXG4gICAgICAgIHJlc3VsdExpbmVzLnB1c2godGhpcy5fbGluZXNbc3RhcnRMaW5lSW5kZXhdLnN1YnN0cmluZyhyYW5nZS5zdGFydENvbHVtbiAtIDEpKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gc3RhcnRMaW5lSW5kZXggKyAxOyBpIDwgZW5kTGluZUluZGV4OyBpKyspIHtcclxuICAgICAgICAgICAgcmVzdWx0TGluZXMucHVzaCh0aGlzLl9saW5lc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc3VsdExpbmVzLnB1c2godGhpcy5fbGluZXNbZW5kTGluZUluZGV4XS5zdWJzdHJpbmcoMCwgcmFuZ2UuZW5kQ29sdW1uIC0gMSkpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHRMaW5lcy5qb2luKGxpbmVFbmRpbmcpO1xyXG4gICAgfVxyXG4gICAgb2Zmc2V0QXQocG9zaXRpb24pIHtcclxuICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX3ZhbGlkYXRlUG9zaXRpb24ocG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMuX2Vuc3VyZUxpbmVTdGFydHMoKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGluZVN0YXJ0cy5nZXRBY2N1bXVsYXRlZFZhbHVlKHBvc2l0aW9uLmxpbmVOdW1iZXIgLSAyKSArIChwb3NpdGlvbi5jb2x1bW4gLSAxKTtcclxuICAgIH1cclxuICAgIHBvc2l0aW9uQXQob2Zmc2V0KSB7XHJcbiAgICAgICAgb2Zmc2V0ID0gTWF0aC5mbG9vcihvZmZzZXQpO1xyXG4gICAgICAgIG9mZnNldCA9IE1hdGgubWF4KDAsIG9mZnNldCk7XHJcbiAgICAgICAgdGhpcy5fZW5zdXJlTGluZVN0YXJ0cygpO1xyXG4gICAgICAgIGxldCBvdXQgPSB0aGlzLl9saW5lU3RhcnRzLmdldEluZGV4T2Yob2Zmc2V0KTtcclxuICAgICAgICBsZXQgbGluZUxlbmd0aCA9IHRoaXMuX2xpbmVzW291dC5pbmRleF0ubGVuZ3RoO1xyXG4gICAgICAgIC8vIEVuc3VyZSB3ZSByZXR1cm4gYSB2YWxpZCBwb3NpdGlvblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGxpbmVOdW1iZXI6IDEgKyBvdXQuaW5kZXgsXHJcbiAgICAgICAgICAgIGNvbHVtbjogMSArIE1hdGgubWluKG91dC5yZW1haW5kZXIsIGxpbmVMZW5ndGgpXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIF92YWxpZGF0ZVJhbmdlKHJhbmdlKSB7XHJcbiAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLl92YWxpZGF0ZVBvc2l0aW9uKHsgbGluZU51bWJlcjogcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyLCBjb2x1bW46IHJhbmdlLnN0YXJ0Q29sdW1uIH0pO1xyXG4gICAgICAgIGNvbnN0IGVuZCA9IHRoaXMuX3ZhbGlkYXRlUG9zaXRpb24oeyBsaW5lTnVtYmVyOiByYW5nZS5lbmRMaW5lTnVtYmVyLCBjb2x1bW46IHJhbmdlLmVuZENvbHVtbiB9KTtcclxuICAgICAgICBpZiAoc3RhcnQubGluZU51bWJlciAhPT0gcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyXHJcbiAgICAgICAgICAgIHx8IHN0YXJ0LmNvbHVtbiAhPT0gcmFuZ2Uuc3RhcnRDb2x1bW5cclxuICAgICAgICAgICAgfHwgZW5kLmxpbmVOdW1iZXIgIT09IHJhbmdlLmVuZExpbmVOdW1iZXJcclxuICAgICAgICAgICAgfHwgZW5kLmNvbHVtbiAhPT0gcmFuZ2UuZW5kQ29sdW1uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBzdGFydExpbmVOdW1iZXI6IHN0YXJ0LmxpbmVOdW1iZXIsXHJcbiAgICAgICAgICAgICAgICBzdGFydENvbHVtbjogc3RhcnQuY29sdW1uLFxyXG4gICAgICAgICAgICAgICAgZW5kTGluZU51bWJlcjogZW5kLmxpbmVOdW1iZXIsXHJcbiAgICAgICAgICAgICAgICBlbmRDb2x1bW46IGVuZC5jb2x1bW5cclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJhbmdlO1xyXG4gICAgfVxyXG4gICAgX3ZhbGlkYXRlUG9zaXRpb24ocG9zaXRpb24pIHtcclxuICAgICAgICBpZiAoIVBvc2l0aW9uLmlzSVBvc2l0aW9uKHBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JhZCBwb3NpdGlvbicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgeyBsaW5lTnVtYmVyLCBjb2x1bW4gfSA9IHBvc2l0aW9uO1xyXG4gICAgICAgIGxldCBoYXNDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKGxpbmVOdW1iZXIgPCAxKSB7XHJcbiAgICAgICAgICAgIGxpbmVOdW1iZXIgPSAxO1xyXG4gICAgICAgICAgICBjb2x1bW4gPSAxO1xyXG4gICAgICAgICAgICBoYXNDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGluZU51bWJlciA+IHRoaXMuX2xpbmVzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBsaW5lTnVtYmVyID0gdGhpcy5fbGluZXMubGVuZ3RoO1xyXG4gICAgICAgICAgICBjb2x1bW4gPSB0aGlzLl9saW5lc1tsaW5lTnVtYmVyIC0gMV0ubGVuZ3RoICsgMTtcclxuICAgICAgICAgICAgaGFzQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgbWF4Q2hhcmFjdGVyID0gdGhpcy5fbGluZXNbbGluZU51bWJlciAtIDFdLmxlbmd0aCArIDE7XHJcbiAgICAgICAgICAgIGlmIChjb2x1bW4gPCAxKSB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW4gPSAxO1xyXG4gICAgICAgICAgICAgICAgaGFzQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoY29sdW1uID4gbWF4Q2hhcmFjdGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb2x1bW4gPSBtYXhDaGFyYWN0ZXI7XHJcbiAgICAgICAgICAgICAgICBoYXNDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWhhc0NoYW5nZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBvc2l0aW9uO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHsgbGluZU51bWJlciwgY29sdW1uIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiBAaW50ZXJuYWxcclxuICovXHJcbmV4cG9ydCBjbGFzcyBFZGl0b3JTaW1wbGVXb3JrZXIge1xyXG4gICAgY29uc3RydWN0b3IoaG9zdCwgZm9yZWlnbk1vZHVsZUZhY3RvcnkpIHtcclxuICAgICAgICB0aGlzLl9ob3N0ID0gaG9zdDtcclxuICAgICAgICB0aGlzLl9tb2RlbHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gICAgICAgIHRoaXMuX2ZvcmVpZ25Nb2R1bGVGYWN0b3J5ID0gZm9yZWlnbk1vZHVsZUZhY3Rvcnk7XHJcbiAgICAgICAgdGhpcy5fZm9yZWlnbk1vZHVsZSA9IG51bGw7XHJcbiAgICB9XHJcbiAgICBkaXNwb3NlKCkge1xyXG4gICAgICAgIHRoaXMuX21vZGVscyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XHJcbiAgICB9XHJcbiAgICBfZ2V0TW9kZWwodXJpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vZGVsc1t1cmldO1xyXG4gICAgfVxyXG4gICAgX2dldE1vZGVscygpIHtcclxuICAgICAgICBsZXQgYWxsID0gW107XHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy5fbW9kZWxzKS5mb3JFYWNoKChrZXkpID0+IGFsbC5wdXNoKHRoaXMuX21vZGVsc1trZXldKSk7XHJcbiAgICAgICAgcmV0dXJuIGFsbDtcclxuICAgIH1cclxuICAgIGFjY2VwdE5ld01vZGVsKGRhdGEpIHtcclxuICAgICAgICB0aGlzLl9tb2RlbHNbZGF0YS51cmxdID0gbmV3IE1pcnJvck1vZGVsKFVSSS5wYXJzZShkYXRhLnVybCksIGRhdGEubGluZXMsIGRhdGEuRU9MLCBkYXRhLnZlcnNpb25JZCk7XHJcbiAgICB9XHJcbiAgICBhY2NlcHRNb2RlbENoYW5nZWQoc3RyVVJMLCBlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9tb2RlbHNbc3RyVVJMXSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBtb2RlbCA9IHRoaXMuX21vZGVsc1tzdHJVUkxdO1xyXG4gICAgICAgIG1vZGVsLm9uRXZlbnRzKGUpO1xyXG4gICAgfVxyXG4gICAgYWNjZXB0UmVtb3ZlZE1vZGVsKHN0clVSTCkge1xyXG4gICAgICAgIGlmICghdGhpcy5fbW9kZWxzW3N0clVSTF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWxldGUgdGhpcy5fbW9kZWxzW3N0clVSTF07XHJcbiAgICB9XHJcbiAgICAvLyAtLS0tIEJFR0lOIGRpZmYgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIGNvbXB1dGVEaWZmKG9yaWdpbmFsVXJsLCBtb2RpZmllZFVybCwgaWdub3JlVHJpbVdoaXRlc3BhY2UsIG1heENvbXB1dGF0aW9uVGltZSkge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsID0gdGhpcy5fZ2V0TW9kZWwob3JpZ2luYWxVcmwpO1xyXG4gICAgICAgICAgICBjb25zdCBtb2RpZmllZCA9IHRoaXMuX2dldE1vZGVsKG1vZGlmaWVkVXJsKTtcclxuICAgICAgICAgICAgaWYgKCFvcmlnaW5hbCB8fCAhbW9kaWZpZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsTGluZXMgPSBvcmlnaW5hbC5nZXRMaW5lc0NvbnRlbnQoKTtcclxuICAgICAgICAgICAgY29uc3QgbW9kaWZpZWRMaW5lcyA9IG1vZGlmaWVkLmdldExpbmVzQ29udGVudCgpO1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmQ29tcHV0ZXIgPSBuZXcgRGlmZkNvbXB1dGVyKG9yaWdpbmFsTGluZXMsIG1vZGlmaWVkTGluZXMsIHtcclxuICAgICAgICAgICAgICAgIHNob3VsZENvbXB1dGVDaGFyQ2hhbmdlczogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNob3VsZFBvc3RQcm9jZXNzQ2hhckNoYW5nZXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzaG91bGRJZ25vcmVUcmltV2hpdGVzcGFjZTogaWdub3JlVHJpbVdoaXRlc3BhY2UsXHJcbiAgICAgICAgICAgICAgICBzaG91bGRNYWtlUHJldHR5RGlmZjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG1heENvbXB1dGF0aW9uVGltZTogbWF4Q29tcHV0YXRpb25UaW1lXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjb25zdCBkaWZmUmVzdWx0ID0gZGlmZkNvbXB1dGVyLmNvbXB1dGVEaWZmKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkZW50aWNhbCA9IChkaWZmUmVzdWx0LmNoYW5nZXMubGVuZ3RoID4gMCA/IGZhbHNlIDogdGhpcy5fbW9kZWxzQXJlSWRlbnRpY2FsKG9yaWdpbmFsLCBtb2RpZmllZCkpO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcXVpdEVhcmx5OiBkaWZmUmVzdWx0LnF1aXRFYXJseSxcclxuICAgICAgICAgICAgICAgIGlkZW50aWNhbDogaWRlbnRpY2FsLFxyXG4gICAgICAgICAgICAgICAgY2hhbmdlczogZGlmZlJlc3VsdC5jaGFuZ2VzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBfbW9kZWxzQXJlSWRlbnRpY2FsKG9yaWdpbmFsLCBtb2RpZmllZCkge1xyXG4gICAgICAgIGNvbnN0IG9yaWdpbmFsTGluZUNvdW50ID0gb3JpZ2luYWwuZ2V0TGluZUNvdW50KCk7XHJcbiAgICAgICAgY29uc3QgbW9kaWZpZWRMaW5lQ291bnQgPSBtb2RpZmllZC5nZXRMaW5lQ291bnQoKTtcclxuICAgICAgICBpZiAob3JpZ2luYWxMaW5lQ291bnQgIT09IG1vZGlmaWVkTGluZUNvdW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yIChsZXQgbGluZSA9IDE7IGxpbmUgPD0gb3JpZ2luYWxMaW5lQ291bnQ7IGxpbmUrKykge1xyXG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbExpbmUgPSBvcmlnaW5hbC5nZXRMaW5lQ29udGVudChsaW5lKTtcclxuICAgICAgICAgICAgY29uc3QgbW9kaWZpZWRMaW5lID0gbW9kaWZpZWQuZ2V0TGluZUNvbnRlbnQobGluZSk7XHJcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbExpbmUgIT09IG1vZGlmaWVkTGluZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY29tcHV0ZU1vcmVNaW5pbWFsRWRpdHMobW9kZWxVcmwsIGVkaXRzKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgY29uc3QgbW9kZWwgPSB0aGlzLl9nZXRNb2RlbChtb2RlbFVybCk7XHJcbiAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlZGl0cztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcclxuICAgICAgICAgICAgbGV0IGxhc3RFb2wgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGVkaXRzID0gZWRpdHMuc2xpY2UoMCkuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGEucmFuZ2UgJiYgYi5yYW5nZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBSYW5nZS5jb21wYXJlUmFuZ2VzVXNpbmdTdGFydHMoYS5yYW5nZSwgYi5yYW5nZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBlb2wgb25seSBjaGFuZ2VzIHNob3VsZCBnbyB0byB0aGUgZW5kXHJcbiAgICAgICAgICAgICAgICBsZXQgYVJuZyA9IGEucmFuZ2UgPyAwIDogMTtcclxuICAgICAgICAgICAgICAgIGxldCBiUm5nID0gYi5yYW5nZSA/IDAgOiAxO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFSbmcgLSBiUm5nO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZm9yIChsZXQgeyByYW5nZSwgdGV4dCwgZW9sIH0gb2YgZWRpdHMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZW9sID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxhc3RFb2wgPSBlb2w7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoUmFuZ2UuaXNFbXB0eShyYW5nZSkgJiYgIXRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBlbXB0eSBjaGFuZ2VcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsID0gbW9kZWwuZ2V0VmFsdWVJblJhbmdlKHJhbmdlKTtcclxuICAgICAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcclxcbnxcXG58XFxyL2csIG1vZGVsLmVvbCk7XHJcbiAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWwgPT09IHRleHQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBub29wXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgZGlmZiB3b24ndCB0YWtlIHRvbyBsb25nXHJcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5tYXgodGV4dC5sZW5ndGgsIG9yaWdpbmFsLmxlbmd0aCkgPiBFZGl0b3JTaW1wbGVXb3JrZXIuX2RpZmZMaW1pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHsgcmFuZ2UsIHRleHQgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBjb21wdXRlIGRpZmYgYmV0d2VlbiBvcmlnaW5hbCBhbmQgZWRpdC50ZXh0XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjaGFuZ2VzID0gc3RyaW5nRGlmZihvcmlnaW5hbCwgdGV4dCwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZWRpdE9mZnNldCA9IG1vZGVsLm9mZnNldEF0KFJhbmdlLmxpZnQocmFuZ2UpLmdldFN0YXJ0UG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoYW5nZSBvZiBjaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBtb2RlbC5wb3NpdGlvbkF0KGVkaXRPZmZzZXQgKyBjaGFuZ2Uub3JpZ2luYWxTdGFydCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gbW9kZWwucG9zaXRpb25BdChlZGl0T2Zmc2V0ICsgY2hhbmdlLm9yaWdpbmFsU3RhcnQgKyBjaGFuZ2Uub3JpZ2luYWxMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0VkaXQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHRleHQuc3Vic3RyKGNoYW5nZS5tb2RpZmllZFN0YXJ0LCBjaGFuZ2UubW9kaWZpZWRMZW5ndGgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICByYW5nZTogeyBzdGFydExpbmVOdW1iZXI6IHN0YXJ0LmxpbmVOdW1iZXIsIHN0YXJ0Q29sdW1uOiBzdGFydC5jb2x1bW4sIGVuZExpbmVOdW1iZXI6IGVuZC5saW5lTnVtYmVyLCBlbmRDb2x1bW46IGVuZC5jb2x1bW4gfVxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGVsLmdldFZhbHVlSW5SYW5nZShuZXdFZGl0LnJhbmdlKSAhPT0gbmV3RWRpdC50ZXh0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5ld0VkaXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGxhc3RFb2wgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7IGVvbDogbGFzdEVvbCwgdGV4dDogJycsIHJhbmdlOiB7IHN0YXJ0TGluZU51bWJlcjogMCwgc3RhcnRDb2x1bW46IDAsIGVuZExpbmVOdW1iZXI6IDAsIGVuZENvbHVtbjogMCB9IH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyAtLS0tIEVORCBtaW5pbWFsIGVkaXRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgY29tcHV0ZUxpbmtzKG1vZGVsVXJsKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgbGV0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwobW9kZWxVcmwpO1xyXG4gICAgICAgICAgICBpZiAoIW1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gY29tcHV0ZUxpbmtzKG1vZGVsKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHRleHR1YWxTdWdnZXN0KG1vZGVsVXJscywgbGVhZGluZ1dvcmQsIHdvcmREZWYsIHdvcmREZWZGbGFncykge1xyXG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN3ID0gbmV3IFN0b3BXYXRjaCh0cnVlKTtcclxuICAgICAgICAgICAgY29uc3Qgd29yZERlZlJlZ0V4cCA9IG5ldyBSZWdFeHAod29yZERlZiwgd29yZERlZkZsYWdzKTtcclxuICAgICAgICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcclxuICAgICAgICAgICAgb3V0ZXI6IGZvciAobGV0IHVybCBvZiBtb2RlbFVybHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwodXJsKTtcclxuICAgICAgICAgICAgICAgIGlmICghbW9kZWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHdvcmQgb2YgbW9kZWwud29yZHMod29yZERlZlJlZ0V4cCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod29yZCA9PT0gbGVhZGluZ1dvcmQgfHwgIWlzTmFOKE51bWJlcih3b3JkKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHNlZW4uYWRkKHdvcmQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWVuLnNpemUgPiBFZGl0b3JTaW1wbGVXb3JrZXIuX3N1Z2dlc3Rpb25zTGltaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWsgb3V0ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB7IHdvcmRzOiBBcnJheS5mcm9tKHNlZW4pLCBkdXJhdGlvbjogc3cuZWxhcHNlZCgpIH07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyAtLS0tIEVORCBzdWdnZXN0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyNyZWdpb24gLS0gd29yZCByYW5nZXMgLS1cclxuICAgIGNvbXB1dGVXb3JkUmFuZ2VzKG1vZGVsVXJsLCByYW5nZSwgd29yZERlZiwgd29yZERlZkZsYWdzKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgbGV0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwobW9kZWxVcmwpO1xyXG4gICAgICAgICAgICBpZiAoIW1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB3b3JkRGVmUmVnRXhwID0gbmV3IFJlZ0V4cCh3b3JkRGVmLCB3b3JkRGVmRmxhZ3MpO1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBsaW5lID0gcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyOyBsaW5lIDwgcmFuZ2UuZW5kTGluZU51bWJlcjsgbGluZSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgd29yZHMgPSBtb2RlbC5nZXRMaW5lV29yZHMobGluZSwgd29yZERlZlJlZ0V4cCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHdvcmQgb2Ygd29yZHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTmFOKE51bWJlcih3b3JkLndvcmQpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGFycmF5ID0gcmVzdWx0W3dvcmQud29yZF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcnJheSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbd29yZC53b3JkXSA9IGFycmF5O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRMaW5lTnVtYmVyOiBsaW5lLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydENvbHVtbjogd29yZC5zdGFydENvbHVtbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kTGluZU51bWJlcjogbGluZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kQ29sdW1uOiB3b3JkLmVuZENvbHVtblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyNlbmRyZWdpb25cclxuICAgIG5hdmlnYXRlVmFsdWVTZXQobW9kZWxVcmwsIHJhbmdlLCB1cCwgd29yZERlZiwgd29yZERlZkZsYWdzKSB7XHJcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcclxuICAgICAgICAgICAgbGV0IG1vZGVsID0gdGhpcy5fZ2V0TW9kZWwobW9kZWxVcmwpO1xyXG4gICAgICAgICAgICBpZiAoIW1vZGVsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgd29yZERlZlJlZ0V4cCA9IG5ldyBSZWdFeHAod29yZERlZiwgd29yZERlZkZsYWdzKTtcclxuICAgICAgICAgICAgaWYgKHJhbmdlLnN0YXJ0Q29sdW1uID09PSByYW5nZS5lbmRDb2x1bW4pIHtcclxuICAgICAgICAgICAgICAgIHJhbmdlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0TGluZU51bWJlcjogcmFuZ2Uuc3RhcnRMaW5lTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0Q29sdW1uOiByYW5nZS5zdGFydENvbHVtbixcclxuICAgICAgICAgICAgICAgICAgICBlbmRMaW5lTnVtYmVyOiByYW5nZS5lbmRMaW5lTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZENvbHVtbjogcmFuZ2UuZW5kQ29sdW1uICsgMVxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgc2VsZWN0aW9uVGV4dCA9IG1vZGVsLmdldFZhbHVlSW5SYW5nZShyYW5nZSk7XHJcbiAgICAgICAgICAgIGxldCB3b3JkUmFuZ2UgPSBtb2RlbC5nZXRXb3JkQXRQb3NpdGlvbih7IGxpbmVOdW1iZXI6IHJhbmdlLnN0YXJ0TGluZU51bWJlciwgY29sdW1uOiByYW5nZS5zdGFydENvbHVtbiB9LCB3b3JkRGVmUmVnRXhwKTtcclxuICAgICAgICAgICAgaWYgKCF3b3JkUmFuZ2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB3b3JkID0gbW9kZWwuZ2V0VmFsdWVJblJhbmdlKHdvcmRSYW5nZSk7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBCYXNpY0lucGxhY2VSZXBsYWNlLklOU1RBTkNFLm5hdmlnYXRlVmFsdWVTZXQocmFuZ2UsIHNlbGVjdGlvblRleHQsIHdvcmRSYW5nZSwgd29yZCwgdXApO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy8gLS0tLSBCRUdJTiBmb3JlaWduIG1vZHVsZSBzdXBwb3J0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBsb2FkRm9yZWlnbk1vZHVsZShtb2R1bGVJZCwgY3JlYXRlRGF0YSwgZm9yZWlnbkhvc3RNZXRob2RzKSB7XHJcbiAgICAgICAgY29uc3QgcHJveHlNZXRob2RSZXF1ZXN0ID0gKG1ldGhvZCwgYXJncykgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faG9zdC5maHIobWV0aG9kLCBhcmdzKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGNvbnN0IGZvcmVpZ25Ib3N0ID0gdHlwZXMuY3JlYXRlUHJveHlPYmplY3QoZm9yZWlnbkhvc3RNZXRob2RzLCBwcm94eU1ldGhvZFJlcXVlc3QpO1xyXG4gICAgICAgIGxldCBjdHggPSB7XHJcbiAgICAgICAgICAgIGhvc3Q6IGZvcmVpZ25Ib3N0LFxyXG4gICAgICAgICAgICBnZXRNaXJyb3JNb2RlbHM6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZXRNb2RlbHMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKHRoaXMuX2ZvcmVpZ25Nb2R1bGVGYWN0b3J5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2ZvcmVpZ25Nb2R1bGUgPSB0aGlzLl9mb3JlaWduTW9kdWxlRmFjdG9yeShjdHgsIGNyZWF0ZURhdGEpO1xyXG4gICAgICAgICAgICAvLyBzdGF0aWMgZm9yZWluZyBtb2R1bGVcclxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0eXBlcy5nZXRBbGxNZXRob2ROYW1lcyh0aGlzLl9mb3JlaWduTW9kdWxlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIEVTTS1jb21tZW50LWJlZ2luXHJcbiAgICAgICAgLy8gXHRcdHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAvLyBcdFx0XHRyZXF1aXJlKFttb2R1bGVJZF0sIChmb3JlaWduTW9kdWxlOiB7IGNyZWF0ZTogSUZvcmVpZ25Nb2R1bGVGYWN0b3J5IH0pID0+IHtcclxuICAgICAgICAvLyBcdFx0XHRcdHRoaXMuX2ZvcmVpZ25Nb2R1bGUgPSBmb3JlaWduTW9kdWxlLmNyZWF0ZShjdHgsIGNyZWF0ZURhdGEpO1xyXG4gICAgICAgIC8vIFxyXG4gICAgICAgIC8vIFx0XHRcdFx0cmVzb2x2ZSh0eXBlcy5nZXRBbGxNZXRob2ROYW1lcyh0aGlzLl9mb3JlaWduTW9kdWxlKSk7XHJcbiAgICAgICAgLy8gXHJcbiAgICAgICAgLy8gXHRcdFx0fSwgcmVqZWN0KTtcclxuICAgICAgICAvLyBcdFx0fSk7XHJcbiAgICAgICAgLy8gRVNNLWNvbW1lbnQtZW5kXHJcbiAgICAgICAgLy8gRVNNLXVuY29tbWVudC1iZWdpblxyXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgdXNhZ2VgKSk7XHJcbiAgICAgICAgLy8gRVNNLXVuY29tbWVudC1lbmRcclxuICAgIH1cclxuICAgIC8vIGZvcmVpZ24gbWV0aG9kIHJlcXVlc3RcclxuICAgIGZtcihtZXRob2QsIGFyZ3MpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX2ZvcmVpZ25Nb2R1bGUgfHwgdHlwZW9mIHRoaXMuX2ZvcmVpZ25Nb2R1bGVbbWV0aG9kXSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdNaXNzaW5nIHJlcXVlc3RIYW5kbGVyIG9yIG1ldGhvZDogJyArIG1ldGhvZCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2ZvcmVpZ25Nb2R1bGVbbWV0aG9kXS5hcHBseSh0aGlzLl9mb3JlaWduTW9kdWxlLCBhcmdzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLy8gLS0tLSBFTkQgZGlmZiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAtLS0tIEJFR0lOIG1pbmltYWwgZWRpdHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbkVkaXRvclNpbXBsZVdvcmtlci5fZGlmZkxpbWl0ID0gMTAwMDAwO1xyXG4vLyAtLS0tIEJFR0lOIHN1Z2dlc3QgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuRWRpdG9yU2ltcGxlV29ya2VyLl9zdWdnZXN0aW9uc0xpbWl0ID0gMTAwMDA7XHJcbi8qKlxyXG4gKiBDYWxsZWQgb24gdGhlIHdvcmtlciBzaWRlXHJcbiAqIEBpbnRlcm5hbFxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZShob3N0KSB7XHJcbiAgICByZXR1cm4gbmV3IEVkaXRvclNpbXBsZVdvcmtlcihob3N0LCBudWxsKTtcclxufVxyXG5pZiAodHlwZW9mIGltcG9ydFNjcmlwdHMgPT09ICdmdW5jdGlvbicpIHtcclxuICAgIC8vIFJ1bm5pbmcgaW4gYSB3ZWIgd29ya2VyXHJcbiAgICBnbG9iYWxzLm1vbmFjbyA9IGNyZWF0ZU1vbmFjb0Jhc2VBUEkoKTtcclxufVxyXG4iLCAiLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICogIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cclxuICotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXHJcbmltcG9ydCB7IFNpbXBsZVdvcmtlclNlcnZlciB9IGZyb20gJy4uL2Jhc2UvY29tbW9uL3dvcmtlci9zaW1wbGVXb3JrZXIuanMnO1xyXG5pbXBvcnQgeyBFZGl0b3JTaW1wbGVXb3JrZXIgfSBmcm9tICcuL2NvbW1vbi9zZXJ2aWNlcy9lZGl0b3JTaW1wbGVXb3JrZXIuanMnO1xyXG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemUoZm9yZWlnbk1vZHVsZSkge1xyXG4gICAgaWYgKGluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgY29uc3Qgc2ltcGxlV29ya2VyID0gbmV3IFNpbXBsZVdvcmtlclNlcnZlcigobXNnKSA9PiB7XHJcbiAgICAgICAgc2VsZi5wb3N0TWVzc2FnZShtc2cpO1xyXG4gICAgfSwgKGhvc3QpID0+IG5ldyBFZGl0b3JTaW1wbGVXb3JrZXIoaG9zdCwgZm9yZWlnbk1vZHVsZSkpO1xyXG4gICAgc2VsZi5vbm1lc3NhZ2UgPSAoZSkgPT4ge1xyXG4gICAgICAgIHNpbXBsZVdvcmtlci5vbm1lc3NhZ2UoZS5kYXRhKTtcclxuICAgIH07XHJcbn1cclxuc2VsZi5vbm1lc3NhZ2UgPSAoZSkgPT4ge1xyXG4gICAgLy8gSWdub3JlIGZpcnN0IG1lc3NhZ2UgaW4gdGhpcyBjYXNlIGFuZCBpbml0aWFsaXplIGlmIG5vdCB5ZXQgaW5pdGlhbGl6ZWRcclxuICAgIGlmICghaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICBpbml0aWFsaXplKG51bGwpO1xy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
