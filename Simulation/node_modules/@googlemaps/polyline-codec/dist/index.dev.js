var polyline = (function (exports) {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var check = function (it) {
	  return it && it.Math == Math && it;
	}; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028


	var global$l = // eslint-disable-next-line es-x/no-global-this -- safe
	check(typeof globalThis == 'object' && globalThis) || check(typeof window == 'object' && window) || // eslint-disable-next-line no-restricted-globals -- safe
	check(typeof self == 'object' && self) || check(typeof commonjsGlobal == 'object' && commonjsGlobal) || // eslint-disable-next-line no-new-func -- fallback
	function () {
	  return this;
	}() || Function('return this')();

	var objectGetOwnPropertyDescriptor = {};

	var fails$8 = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var fails$7 = fails$8; // Detect IE8's incomplete defineProperty implementation

	var descriptors = !fails$7(function () {
	  // eslint-disable-next-line es-x/no-object-defineproperty -- required for testing
	  return Object.defineProperty({}, 1, {
	    get: function () {
	      return 7;
	    }
	  })[1] != 7;
	});

	var fails$6 = fails$8;
	var functionBindNative = !fails$6(function () {
	  // eslint-disable-next-line es-x/no-function-prototype-bind -- safe
	  var test = function () {
	    /* empty */
	  }.bind(); // eslint-disable-next-line no-prototype-builtins -- safe


	  return typeof test != 'function' || test.hasOwnProperty('prototype');
	});

	var NATIVE_BIND$1 = functionBindNative;
	var call$4 = Function.prototype.call;
	var functionCall = NATIVE_BIND$1 ? call$4.bind(call$4) : function () {
	  return call$4.apply(call$4, arguments);
	};

	var objectPropertyIsEnumerable = {};

	var $propertyIsEnumerable = {}.propertyIsEnumerable; // eslint-disable-next-line es-x/no-object-getownpropertydescriptor -- safe

	var getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

	var NASHORN_BUG = getOwnPropertyDescriptor$1 && !$propertyIsEnumerable.call({
	  1: 2
	}, 1); // `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable

	objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor$1(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable;

	var createPropertyDescriptor$2 = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var NATIVE_BIND = functionBindNative;
	var FunctionPrototype$1 = Function.prototype;
	var bind = FunctionPrototype$1.bind;
	var call$3 = FunctionPrototype$1.call;
	var uncurryThis$a = NATIVE_BIND && bind.bind(call$3, call$3);
	var functionUncurryThis = NATIVE_BIND ? function (fn) {
	  return fn && uncurryThis$a(fn);
	} : function (fn) {
	  return fn && function () {
	    return call$3.apply(fn, arguments);
	  };
	};

	var uncurryThis$9 = functionUncurryThis;
	var toString$1 = uncurryThis$9({}.toString);
	var stringSlice = uncurryThis$9(''.slice);

	var classofRaw = function (it) {
	  return stringSlice(toString$1(it), 8, -1);
	};

	var global$k = global$l;
	var uncurryThis$8 = functionUncurryThis;
	var fails$5 = fails$8;
	var classof = classofRaw;
	var Object$3 = global$k.Object;
	var split = uncurryThis$8(''.split); // fallback for non-array-like ES3 and non-enumerable old V8 strings

	var indexedObject = fails$5(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !Object$3('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classof(it) == 'String' ? split(it, '') : Object$3(it);
	} : Object$3;

	var global$j = global$l;
	var TypeError$6 = global$j.TypeError; // `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible

	var requireObjectCoercible$2 = function (it) {
	  if (it == undefined) throw TypeError$6("Can't call method on " + it);
	  return it;
	};

	var IndexedObject$1 = indexedObject;
	var requireObjectCoercible$1 = requireObjectCoercible$2;

	var toIndexedObject$4 = function (it) {
	  return IndexedObject$1(requireObjectCoercible$1(it));
	};

	// https://tc39.es/ecma262/#sec-iscallable

	var isCallable$9 = function (argument) {
	  return typeof argument == 'function';
	};

	var isCallable$8 = isCallable$9;

	var isObject$5 = function (it) {
	  return typeof it == 'object' ? it !== null : isCallable$8(it);
	};

	var global$i = global$l;
	var isCallable$7 = isCallable$9;

	var aFunction = function (argument) {
	  return isCallable$7(argument) ? argument : undefined;
	};

	var getBuiltIn$3 = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(global$i[namespace]) : global$i[namespace] && global$i[namespace][method];
	};

	var uncurryThis$7 = functionUncurryThis;
	var objectIsPrototypeOf = uncurryThis$7({}.isPrototypeOf);

	var getBuiltIn$2 = getBuiltIn$3;
	var engineUserAgent = getBuiltIn$2('navigator', 'userAgent') || '';

	var global$h = global$l;
	var userAgent = engineUserAgent;
	var process = global$h.process;
	var Deno = global$h.Deno;
	var versions = process && process.versions || Deno && Deno.version;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.'); // in old Chrome, versions of V8 isn't V8 = Chrome / 10
	  // but their correct versions are not interesting for us

	  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
	} // BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
	// so check `userAgent` even if `.v8` exists, but 0


	if (!version && userAgent) {
	  match = userAgent.match(/Edge\/(\d+)/);

	  if (!match || match[1] >= 74) {
	    match = userAgent.match(/Chrome\/(\d+)/);
	    if (match) version = +match[1];
	  }
	}

	var engineV8Version = version;

	/* eslint-disable es-x/no-symbol -- required for testing */
	var V8_VERSION = engineV8Version;
	var fails$4 = fails$8; // eslint-disable-next-line es-x/no-object-getownpropertysymbols -- required for testing

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails$4(function () {
	  var symbol = Symbol(); // Chrome 38 Symbol has incorrect toString conversion
	  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances

	  return !String(symbol) || !(Object(symbol) instanceof Symbol) || // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	  !Symbol.sham && V8_VERSION && V8_VERSION < 41;
	});

	/* eslint-disable es-x/no-symbol -- required for testing */
	var NATIVE_SYMBOL$1 = nativeSymbol;
	var useSymbolAsUid = NATIVE_SYMBOL$1 && !Symbol.sham && typeof Symbol.iterator == 'symbol';

	var global$g = global$l;
	var getBuiltIn$1 = getBuiltIn$3;
	var isCallable$6 = isCallable$9;
	var isPrototypeOf = objectIsPrototypeOf;
	var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;
	var Object$2 = global$g.Object;
	var isSymbol$2 = USE_SYMBOL_AS_UID$1 ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  var $Symbol = getBuiltIn$1('Symbol');
	  return isCallable$6($Symbol) && isPrototypeOf($Symbol.prototype, Object$2(it));
	};

	var global$f = global$l;
	var String$2 = global$f.String;

	var tryToString$1 = function (argument) {
	  try {
	    return String$2(argument);
	  } catch (error) {
	    return 'Object';
	  }
	};

	var global$e = global$l;
	var isCallable$5 = isCallable$9;
	var tryToString = tryToString$1;
	var TypeError$5 = global$e.TypeError; // `Assert: IsCallable(argument) is true`

	var aCallable$1 = function (argument) {
	  if (isCallable$5(argument)) return argument;
	  throw TypeError$5(tryToString(argument) + ' is not a function');
	};

	var aCallable = aCallable$1; // `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod

	var getMethod$1 = function (V, P) {
	  var func = V[P];
	  return func == null ? undefined : aCallable(func);
	};

	var global$d = global$l;
	var call$2 = functionCall;
	var isCallable$4 = isCallable$9;
	var isObject$4 = isObject$5;
	var TypeError$4 = global$d.TypeError; // `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive

	var ordinaryToPrimitive$1 = function (input, pref) {
	  var fn, val;
	  if (pref === 'string' && isCallable$4(fn = input.toString) && !isObject$4(val = call$2(fn, input))) return val;
	  if (isCallable$4(fn = input.valueOf) && !isObject$4(val = call$2(fn, input))) return val;
	  if (pref !== 'string' && isCallable$4(fn = input.toString) && !isObject$4(val = call$2(fn, input))) return val;
	  throw TypeError$4("Can't convert object to primitive value");
	};

	var shared$3 = {exports: {}};

	var global$c = global$l; // eslint-disable-next-line es-x/no-object-defineproperty -- safe

	var defineProperty = Object.defineProperty;

	var setGlobal$3 = function (key, value) {
	  try {
	    defineProperty(global$c, key, {
	      value: value,
	      configurable: true,
	      writable: true
	    });
	  } catch (error) {
	    global$c[key] = value;
	  }

	  return value;
	};

	var global$b = global$l;
	var setGlobal$2 = setGlobal$3;
	var SHARED = '__core-js_shared__';
	var store$3 = global$b[SHARED] || setGlobal$2(SHARED, {});
	var sharedStore = store$3;

	var store$2 = sharedStore;
	(shared$3.exports = function (key, value) {
	  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.22.3',
	  mode: 'global',
	  copyright: '© 2014-2022 Denis Pushkarev (zloirock.ru)',
	  license: 'https://github.com/zloirock/core-js/blob/v3.22.3/LICENSE',
	  source: 'https://github.com/zloirock/core-js'
	});

	var global$a = global$l;
	var requireObjectCoercible = requireObjectCoercible$2;
	var Object$1 = global$a.Object; // `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject

	var toObject$1 = function (argument) {
	  return Object$1(requireObjectCoercible(argument));
	};

	var uncurryThis$6 = functionUncurryThis;
	var toObject = toObject$1;
	var hasOwnProperty = uncurryThis$6({}.hasOwnProperty); // `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	// eslint-disable-next-line es-x/no-object-hasown -- safe

	var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
	  return hasOwnProperty(toObject(it), key);
	};

	var uncurryThis$5 = functionUncurryThis;
	var id = 0;
	var postfix = Math.random();
	var toString = uncurryThis$5(1.0.toString);

	var uid$2 = function (key) {
	  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
	};

	var global$9 = global$l;
	var shared$2 = shared$3.exports;
	var hasOwn$6 = hasOwnProperty_1;
	var uid$1 = uid$2;
	var NATIVE_SYMBOL = nativeSymbol;
	var USE_SYMBOL_AS_UID = useSymbolAsUid;
	var WellKnownSymbolsStore = shared$2('wks');
	var Symbol$1 = global$9.Symbol;
	var symbolFor = Symbol$1 && Symbol$1['for'];
	var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$1;

	var wellKnownSymbol$1 = function (name) {
	  if (!hasOwn$6(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == 'string')) {
	    var description = 'Symbol.' + name;

	    if (NATIVE_SYMBOL && hasOwn$6(Symbol$1, name)) {
	      WellKnownSymbolsStore[name] = Symbol$1[name];
	    } else if (USE_SYMBOL_AS_UID && symbolFor) {
	      WellKnownSymbolsStore[name] = symbolFor(description);
	    } else {
	      WellKnownSymbolsStore[name] = createWellKnownSymbol(description);
	    }
	  }

	  return WellKnownSymbolsStore[name];
	};

	var global$8 = global$l;
	var call$1 = functionCall;
	var isObject$3 = isObject$5;
	var isSymbol$1 = isSymbol$2;
	var getMethod = getMethod$1;
	var ordinaryToPrimitive = ordinaryToPrimitive$1;
	var wellKnownSymbol = wellKnownSymbol$1;
	var TypeError$3 = global$8.TypeError;
	var TO_PRIMITIVE = wellKnownSymbol('toPrimitive'); // `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive

	var toPrimitive$1 = function (input, pref) {
	  if (!isObject$3(input) || isSymbol$1(input)) return input;
	  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
	  var result;

	  if (exoticToPrim) {
	    if (pref === undefined) pref = 'default';
	    result = call$1(exoticToPrim, input, pref);
	    if (!isObject$3(result) || isSymbol$1(result)) return result;
	    throw TypeError$3("Can't convert object to primitive value");
	  }

	  if (pref === undefined) pref = 'number';
	  return ordinaryToPrimitive(input, pref);
	};

	var toPrimitive = toPrimitive$1;
	var isSymbol = isSymbol$2; // `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey

	var toPropertyKey$2 = function (argument) {
	  var key = toPrimitive(argument, 'string');
	  return isSymbol(key) ? key : key + '';
	};

	var global$7 = global$l;
	var isObject$2 = isObject$5;
	var document = global$7.document; // typeof document.createElement is 'object' in old IE

	var EXISTS$1 = isObject$2(document) && isObject$2(document.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS$1 ? document.createElement(it) : {};
	};

	var DESCRIPTORS$5 = descriptors;
	var fails$3 = fails$8;
	var createElement = documentCreateElement; // Thanks to IE8 for its funny defineProperty

	var ie8DomDefine = !DESCRIPTORS$5 && !fails$3(function () {
	  // eslint-disable-next-line es-x/no-object-defineproperty -- required for testing
	  return Object.defineProperty(createElement('div'), 'a', {
	    get: function () {
	      return 7;
	    }
	  }).a != 7;
	});

	var DESCRIPTORS$4 = descriptors;
	var call = functionCall;
	var propertyIsEnumerableModule = objectPropertyIsEnumerable;
	var createPropertyDescriptor$1 = createPropertyDescriptor$2;
	var toIndexedObject$3 = toIndexedObject$4;
	var toPropertyKey$1 = toPropertyKey$2;
	var hasOwn$5 = hasOwnProperty_1;
	var IE8_DOM_DEFINE$1 = ie8DomDefine; // eslint-disable-next-line es-x/no-object-getownpropertydescriptor -- safe

	var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor

	objectGetOwnPropertyDescriptor.f = DESCRIPTORS$4 ? $getOwnPropertyDescriptor$1 : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject$3(O);
	  P = toPropertyKey$1(P);
	  if (IE8_DOM_DEFINE$1) try {
	    return $getOwnPropertyDescriptor$1(O, P);
	  } catch (error) {
	    /* empty */
	  }
	  if (hasOwn$5(O, P)) return createPropertyDescriptor$1(!call(propertyIsEnumerableModule.f, O, P), O[P]);
	};

	var objectDefineProperty = {};

	var DESCRIPTORS$3 = descriptors;
	var fails$2 = fails$8; // V8 ~ Chrome 36-
	// https://bugs.chromium.org/p/v8/issues/detail?id=3334

	var v8PrototypeDefineBug = DESCRIPTORS$3 && fails$2(function () {
	  // eslint-disable-next-line es-x/no-object-defineproperty -- required for testing
	  return Object.defineProperty(function () {
	    /* empty */
	  }, 'prototype', {
	    value: 42,
	    writable: false
	  }).prototype != 42;
	});

	var global$6 = global$l;
	var isObject$1 = isObject$5;
	var String$1 = global$6.String;
	var TypeError$2 = global$6.TypeError; // `Assert: Type(argument) is Object`

	var anObject$2 = function (argument) {
	  if (isObject$1(argument)) return argument;
	  throw TypeError$2(String$1(argument) + ' is not an object');
	};

	var global$5 = global$l;
	var DESCRIPTORS$2 = descriptors;
	var IE8_DOM_DEFINE = ie8DomDefine;
	var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
	var anObject$1 = anObject$2;
	var toPropertyKey = toPropertyKey$2;
	var TypeError$1 = global$5.TypeError; // eslint-disable-next-line es-x/no-object-defineproperty -- safe

	var $defineProperty = Object.defineProperty; // eslint-disable-next-line es-x/no-object-getownpropertydescriptor -- safe

	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
	var ENUMERABLE = 'enumerable';
	var CONFIGURABLE$1 = 'configurable';
	var WRITABLE = 'writable'; // `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty

	objectDefineProperty.f = DESCRIPTORS$2 ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
	  anObject$1(O);
	  P = toPropertyKey(P);
	  anObject$1(Attributes);

	  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
	    var current = $getOwnPropertyDescriptor(O, P);

	    if (current && current[WRITABLE]) {
	      O[P] = Attributes.value;
	      Attributes = {
	        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
	        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
	        writable: false
	      };
	    }
	  }

	  return $defineProperty(O, P, Attributes);
	} : $defineProperty : function defineProperty(O, P, Attributes) {
	  anObject$1(O);
	  P = toPropertyKey(P);
	  anObject$1(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return $defineProperty(O, P, Attributes);
	  } catch (error) {
	    /* empty */
	  }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError$1('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var DESCRIPTORS$1 = descriptors;
	var definePropertyModule$1 = objectDefineProperty;
	var createPropertyDescriptor = createPropertyDescriptor$2;
	var createNonEnumerableProperty$3 = DESCRIPTORS$1 ? function (object, key, value) {
	  return definePropertyModule$1.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var redefine$1 = {exports: {}};

	var uncurryThis$4 = functionUncurryThis;
	var isCallable$3 = isCallable$9;
	var store$1 = sharedStore;
	var functionToString = uncurryThis$4(Function.toString); // this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper

	if (!isCallable$3(store$1.inspectSource)) {
	  store$1.inspectSource = function (it) {
	    return functionToString(it);
	  };
	}

	var inspectSource$2 = store$1.inspectSource;

	var global$4 = global$l;
	var isCallable$2 = isCallable$9;
	var inspectSource$1 = inspectSource$2;
	var WeakMap$1 = global$4.WeakMap;
	var nativeWeakMap = isCallable$2(WeakMap$1) && /native code/.test(inspectSource$1(WeakMap$1));

	var shared$1 = shared$3.exports;
	var uid = uid$2;
	var keys = shared$1('keys');

	var sharedKey$1 = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys$3 = {};

	var NATIVE_WEAK_MAP = nativeWeakMap;
	var global$3 = global$l;
	var uncurryThis$3 = functionUncurryThis;
	var isObject = isObject$5;
	var createNonEnumerableProperty$2 = createNonEnumerableProperty$3;
	var hasOwn$4 = hasOwnProperty_1;
	var shared = sharedStore;
	var sharedKey = sharedKey$1;
	var hiddenKeys$2 = hiddenKeys$3;
	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var TypeError = global$3.TypeError;
	var WeakMap = global$3.WeakMap;
	var set, get, has;

	var enforce = function (it) {
	  return has(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;

	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    }

	    return state;
	  };
	};

	if (NATIVE_WEAK_MAP || shared.state) {
	  var store = shared.state || (shared.state = new WeakMap());
	  var wmget = uncurryThis$3(store.get);
	  var wmhas = uncurryThis$3(store.has);
	  var wmset = uncurryThis$3(store.set);

	  set = function (it, metadata) {
	    if (wmhas(store, it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    wmset(store, it, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return wmget(store, it) || {};
	  };

	  has = function (it) {
	    return wmhas(store, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys$2[STATE] = true;

	  set = function (it, metadata) {
	    if (hasOwn$4(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    createNonEnumerableProperty$2(it, STATE, metadata);
	    return metadata;
	  };

	  get = function (it) {
	    return hasOwn$4(it, STATE) ? it[STATE] : {};
	  };

	  has = function (it) {
	    return hasOwn$4(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var DESCRIPTORS = descriptors;
	var hasOwn$3 = hasOwnProperty_1;
	var FunctionPrototype = Function.prototype; // eslint-disable-next-line es-x/no-object-getownpropertydescriptor -- safe

	var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;
	var EXISTS = hasOwn$3(FunctionPrototype, 'name'); // additional protection from minified / mangled / dropped function names

	var PROPER = EXISTS && function something() {
	  /* empty */
	}.name === 'something';

	var CONFIGURABLE = EXISTS && (!DESCRIPTORS || DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable);
	var functionName = {
	  EXISTS: EXISTS,
	  PROPER: PROPER,
	  CONFIGURABLE: CONFIGURABLE
	};

	var global$2 = global$l;
	var isCallable$1 = isCallable$9;
	var hasOwn$2 = hasOwnProperty_1;
	var createNonEnumerableProperty$1 = createNonEnumerableProperty$3;
	var setGlobal$1 = setGlobal$3;
	var inspectSource = inspectSource$2;
	var InternalStateModule = internalState;
	var CONFIGURABLE_FUNCTION_NAME = functionName.CONFIGURABLE;
	var getInternalState = InternalStateModule.get;
	var enforceInternalState = InternalStateModule.enforce;
	var TEMPLATE = String(String).split('String');
	(redefine$1.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  var name = options && options.name !== undefined ? options.name : key;
	  var state;

	  if (isCallable$1(value)) {
	    if (String(name).slice(0, 7) === 'Symbol(') {
	      name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
	    }

	    if (!hasOwn$2(value, 'name') || CONFIGURABLE_FUNCTION_NAME && value.name !== name) {
	      createNonEnumerableProperty$1(value, 'name', name);
	    }

	    state = enforceInternalState(value);

	    if (!state.source) {
	      state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
	    }
	  }

	  if (O === global$2) {
	    if (simple) O[key] = value;else setGlobal$1(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }

	  if (simple) O[key] = value;else createNonEnumerableProperty$1(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return isCallable$1(this) && getInternalState(this).source || inspectSource(this);
	});

	var objectGetOwnPropertyNames = {};

	var ceil = Math.ceil;
	var floor = Math.floor; // `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity

	var toIntegerOrInfinity$2 = function (argument) {
	  var number = +argument; // eslint-disable-next-line no-self-compare -- safe

	  return number !== number || number === 0 ? 0 : (number > 0 ? floor : ceil)(number);
	};

	var toIntegerOrInfinity$1 = toIntegerOrInfinity$2;
	var max = Math.max;
	var min$1 = Math.min; // Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

	var toAbsoluteIndex$1 = function (index, length) {
	  var integer = toIntegerOrInfinity$1(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var toIntegerOrInfinity = toIntegerOrInfinity$2;
	var min = Math.min; // `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength

	var toLength$1 = function (argument) {
	  return argument > 0 ? min(toIntegerOrInfinity(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var toLength = toLength$1; // `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike

	var lengthOfArrayLike$1 = function (obj) {
	  return toLength(obj.length);
	};

	var toIndexedObject$2 = toIndexedObject$4;
	var toAbsoluteIndex = toAbsoluteIndex$1;
	var lengthOfArrayLike = lengthOfArrayLike$1; // `Array.prototype.{ indexOf, includes }` methods implementation

	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject$2($this);
	    var length = lengthOfArrayLike(O);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value; // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare -- NaN check

	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++]; // eslint-disable-next-line no-self-compare -- NaN check

	      if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
	    } else for (; length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    }
	    return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var uncurryThis$2 = functionUncurryThis;
	var hasOwn$1 = hasOwnProperty_1;
	var toIndexedObject$1 = toIndexedObject$4;
	var indexOf = arrayIncludes.indexOf;
	var hiddenKeys$1 = hiddenKeys$3;
	var push = uncurryThis$2([].push);

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject$1(object);
	  var i = 0;
	  var result = [];
	  var key;

	  for (key in O) !hasOwn$1(hiddenKeys$1, key) && hasOwn$1(O, key) && push(result, key); // Don't enum bug & hidden keys


	  while (names.length > i) if (hasOwn$1(O, key = names[i++])) {
	    ~indexOf(result, key) || push(result, key);
	  }

	  return result;
	};

	var enumBugKeys$1 = ['constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

	var internalObjectKeys = objectKeysInternal;
	var enumBugKeys = enumBugKeys$1;
	var hiddenKeys = enumBugKeys.concat('length', 'prototype'); // `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	// eslint-disable-next-line es-x/no-object-getownpropertynames -- safe

	objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return internalObjectKeys(O, hiddenKeys);
	};

	var objectGetOwnPropertySymbols = {};

	objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

	var getBuiltIn = getBuiltIn$3;
	var uncurryThis$1 = functionUncurryThis;
	var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
	var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
	var anObject = anObject$2;
	var concat = uncurryThis$1([].concat); // all object keys, includes non-enumerable and symbols

	var ownKeys$1 = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = getOwnPropertyNamesModule.f(anObject(it));
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
	  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
	};

	var hasOwn = hasOwnProperty_1;
	var ownKeys = ownKeys$1;
	var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
	var definePropertyModule = objectDefineProperty;

	var copyConstructorProperties$1 = function (target, source, exceptions) {
	  var keys = ownKeys(source);
	  var defineProperty = definePropertyModule.f;
	  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;

	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];

	    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
	      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	    }
	  }
	};

	var fails$1 = fails$8;
	var isCallable = isCallable$9;
	var replacement = /#|\.prototype\./;

	var isForced$1 = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true : value == NATIVE ? false : isCallable(detection) ? fails$1(detection) : !!detection;
	};

	var normalize = isForced$1.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced$1.data = {};
	var NATIVE = isForced$1.NATIVE = 'N';
	var POLYFILL = isForced$1.POLYFILL = 'P';
	var isForced_1 = isForced$1;

	var global$1 = global$l;
	var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	var createNonEnumerableProperty = createNonEnumerableProperty$3;
	var redefine = redefine$1.exports;
	var setGlobal = setGlobal$3;
	var copyConstructorProperties = copyConstructorProperties$1;
	var isForced = isForced_1;
	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	  options.name        - the .name of the function if it does not match the key
	*/

	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;

	  if (GLOBAL) {
	    target = global$1;
	  } else if (STATIC) {
	    target = global$1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global$1[TARGET] || {}).prototype;
	  }

	  if (target) for (key in source) {
	    sourceProperty = source[key];

	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];

	    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced); // contained in target

	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty == typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    } // add a flag to not completely full polyfills


	    if (options.sham || targetProperty && targetProperty.sham) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    } // extend global


	    redefine(target, key, sourceProperty, options);
	  }
	};

	var fails = fails$8;

	var arrayMethodIsStrict$1 = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call -- required for testing
	    method.call(null, argument || function () {
	      return 1;
	    }, 1);
	  });
	};

	var $ = _export;
	var uncurryThis = functionUncurryThis;
	var IndexedObject = indexedObject;
	var toIndexedObject = toIndexedObject$4;
	var arrayMethodIsStrict = arrayMethodIsStrict$1;
	var un$Join = uncurryThis([].join);
	var ES3_STRINGS = IndexedObject != Object;
	var STRICT_METHOD = arrayMethodIsStrict('join', ','); // `Array.prototype.join` method
	// https://tc39.es/ecma262/#sec-array.prototype.join

	$({
	  target: 'Array',
	  proto: true,
	  forced: ES3_STRINGS || !STRICT_METHOD
	}, {
	  join: function join(separator) {
	    return un$Join(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});

	/**
	 * Copyright 2020 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *      http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */

	/**
	 * Decodes an encoded path string into a sequence of LatLngs.
	 *
	 * See {@link https://developers.google.com/maps/documentation/utilities/polylinealgorithm}
	 *
	 *  #### Example
	 *
	 * ```js
	 * import { decode } from "@googlemaps/polyline-codec";
	 *
	 * const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
	 * console.log(decode(encoded, 5));
	 * // [
	 * //   [38.5, -120.2],
	 * //   [40.7, -120.95],
	 * //   [43.252, -126.453],
	 * // ]
	 * ```
	 */
	var decode = function decode(encodedPath, precision) {
	  if (precision === void 0) {
	    precision = 5;
	  }

	  var factor = Math.pow(10, precision);
	  var len = encodedPath.length; // For speed we preallocate to an upper bound on the final length, then
	  // truncate the array before returning.

	  var path = new Array(Math.floor(encodedPath.length / 2));
	  var index = 0;
	  var lat = 0;
	  var lng = 0;
	  var pointIndex = 0; // This code has been profiled and optimized, so don't modify it without
	  // measuring its performance.

	  for (; index < len; ++pointIndex) {
	    // Fully unrolling the following loops speeds things up about 5%.
	    var result = 1;
	    var shift = 0;
	    var b = void 0;

	    do {
	      // Invariant: "result" is current partial result plus (1 << shift).
	      // The following line effectively clears this bit by decrementing "b".
	      b = encodedPath.charCodeAt(index++) - 63 - 1;
	      result += b << shift;
	      shift += 5;
	    } while (b >= 0x1f); // See note above.


	    lat += result & 1 ? ~(result >> 1) : result >> 1;
	    result = 1;
	    shift = 0;

	    do {
	      b = encodedPath.charCodeAt(index++) - 63 - 1;
	      result += b << shift;
	      shift += 5;
	    } while (b >= 0x1f);

	    lng += result & 1 ? ~(result >> 1) : result >> 1;
	    path[pointIndex] = [lat / factor, lng / factor];
	  } // truncate array


	  path.length = pointIndex;
	  return path;
	};
	/**
	 * Polyline encodes an array of objects having lat and lng properties.
	 *
	 * See {@link https://developers.google.com/maps/documentation/utilities/polylinealgorithm}
	 *
	 * #### Example
	 *
	 * ```js
	 * import { encode } from "@googlemaps/polyline-codec";
	 *
	 * const path = [
	 *   [38.5, -120.2],
	 *   [40.7, -120.95],
	 *   [43.252, -126.453],
	 * ];
	 * console.log(encode(path, 5));
	 * // "_p~iF~ps|U_ulLnnqC_mqNvxq`@"
	 * ```
	 */

	var encode = function encode(path, precision) {
	  if (precision === void 0) {
	    precision = 5;
	  }

	  var factor = Math.pow(10, precision);

	  var transform = function latLngToFixed(latLng) {
	    if (!Array.isArray(latLng)) {
	      latLng = [latLng.lat, latLng.lng];
	    }

	    return [round(latLng[0] * factor), round(latLng[1] * factor)];
	  };

	  return polylineEncodeLine(path, transform);
	};
	/**
	 * Encodes a generic polyline; optionally performing a transform on each point
	 * before encoding it.
	 *
	 * @ignore
	 */

	var polylineEncodeLine = function polylineEncodeLine(array, transform) {
	  var v = [];
	  var start = [0, 0];
	  var end;

	  for (var i = 0, I = array.length; i < I; ++i) {
	    // In order to prevent drift (from quantizing deltas), we explicitly convert
	    // coordinates to fixed-precision to obtain integer deltas.
	    end = transform(array[i]); // Push the next edge

	    polylineEncodeSigned(round(end[0]) - round(start[0]), v); // lat

	    polylineEncodeSigned(round(end[1]) - round(start[1]), v); // lng

	    start = end;
	  }

	  return v.join("");
	};
	/**
	 * Encodes the given value in our compact polyline format, appending the
	 * encoded value to the given array of strings.
	 *
	 * @ignore
	 */

	var polylineEncodeSigned = function polylineEncodeSigned(value, array) {
	  return polylineEncodeUnsigned(value < 0 ? ~(value << 1) : value << 1, array);
	};
	/**
	 * Helper function for encodeSigned.
	 *
	 * @ignore
	 */


	var polylineEncodeUnsigned = function polylineEncodeUnsigned(value, array) {
	  while (value >= 0x20) {
	    array.push(String.fromCharCode((0x20 | value & 0x1f) + 63));
	    value >>= 5;
	  }

	  array.push(String.fromCharCode(value + 63));
	  return array;
	};
	/**
	 * @ignore
	 */


	var round = function round(v) {
	  return Math.floor(Math.abs(v) + 0.5) * (v >= 0 ? 1 : -1);
	};

	exports.decode = decode;
	exports.encode = encode;
	exports.polylineEncodeLine = polylineEncodeLine;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({});
