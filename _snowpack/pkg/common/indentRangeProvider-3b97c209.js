import { g as global, p as process, B as Buffer } from './process-c22ef109.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function _format(message, args) {
    let result;
    if (args.length === 0) {
        result = message;
    }
    else {
        result = message.replace(/\{(\d+)\}/g, function (match, rest) {
            const index = rest[0];
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }
    return result;
}
function localize(data, message, ...args) {
    return _format(message, args);
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var _a;
const LANGUAGE_DEFAULT = 'en';
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isNative = false;
let _isWeb = false;
let _isIOS = false;
let _locale = undefined;
let _language = LANGUAGE_DEFAULT;
let _translationsConfigFile = undefined;
let _userAgent = undefined;
const globals = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
let nodeProcess = undefined;
if (typeof globals.vscode !== 'undefined' && typeof globals.vscode.process !== 'undefined') {
    // Native environment (sandboxed)
    nodeProcess = globals.vscode.process;
}
else if (typeof process !== 'undefined') {
    // Native environment (non-sandboxed)
    nodeProcess = process;
}
const isElectronRenderer = typeof ((_a = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.versions) === null || _a === void 0 ? void 0 : _a.electron) === 'string' && nodeProcess.type === 'renderer';
const isElectronSandboxed = isElectronRenderer && (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.sandboxed);
const browserCodeLoadingCacheStrategy = (() => {
    // Always enabled when sandbox is enabled
    if (isElectronSandboxed) {
        return 'bypassHeatCheck';
    }
    // Otherwise, only enabled conditionally
    const env = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.env['VSCODE_BROWSER_CODE_LOADING'];
    if (typeof env === 'string') {
        if (env === 'none' || env === 'code' || env === 'bypassHeatCheck' || env === 'bypassHeatCheckAndEagerCompile') {
            return env;
        }
        return 'bypassHeatCheck';
    }
    return undefined;
})();
const isPreferringBrowserCodeLoad = typeof browserCodeLoadingCacheStrategy === 'string';
// Web environment
if (typeof navigator === 'object' && !isElectronRenderer) {
    _userAgent = navigator.userAgent;
    _isWindows = _userAgent.indexOf('Windows') >= 0;
    _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
    _isIOS = (_userAgent.indexOf('Macintosh') >= 0 || _userAgent.indexOf('iPad') >= 0 || _userAgent.indexOf('iPhone') >= 0) && !!navigator.maxTouchPoints && navigator.maxTouchPoints > 0;
    _isLinux = _userAgent.indexOf('Linux') >= 0;
    _isWeb = true;
    _locale = navigator.language;
    _language = _locale;
}
// Native environment
else if (typeof nodeProcess === 'object') {
    _isWindows = (nodeProcess.platform === 'win32');
    _isMacintosh = (nodeProcess.platform === 'darwin');
    _isLinux = (nodeProcess.platform === 'linux');
    _isLinux && !!nodeProcess.env['SNAP'] && !!nodeProcess.env['SNAP_REVISION'];
    _locale = LANGUAGE_DEFAULT;
    _language = LANGUAGE_DEFAULT;
    const rawNlsConfig = nodeProcess.env['VSCODE_NLS_CONFIG'];
    if (rawNlsConfig) {
        try {
            const nlsConfig = JSON.parse(rawNlsConfig);
            const resolved = nlsConfig.availableLanguages['*'];
            _locale = nlsConfig.locale;
            // VSCode's default language is 'en'
            _language = resolved ? resolved : LANGUAGE_DEFAULT;
            _translationsConfigFile = nlsConfig._translationsConfigFile;
        }
        catch (e) {
        }
    }
    _isNative = true;
}
// Unknown environment
else {
    console.error('Unable to resolve platform.');
}
const isWindows = _isWindows;
const isMacintosh = _isMacintosh;
const isLinux = _isLinux;
const isNative = _isNative;
const isWeb = _isWeb;
const isIOS = _isIOS;
const userAgent = _userAgent;
const setImmediate = (function defineSetImmediate() {
    if (globals.setImmediate) {
        return globals.setImmediate.bind(globals);
    }
    if (typeof globals.postMessage === 'function' && !globals.importScripts) {
        let pending = [];
        globals.addEventListener('message', (e) => {
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
                callback: callback
            });
            globals.postMessage({ vscodeSetImmediateId: myId }, '*');
        };
    }
    if (typeof (nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.nextTick) === 'function') {
        return nodeProcess.nextTick.bind(nodeProcess);
    }
    const _promise = Promise.resolve();
    return (callback) => _promise.then(callback);
})();
const OS = (_isMacintosh || _isIOS ? 2 /* Macintosh */ : (_isWindows ? 1 /* Windows */ : 3 /* Linux */));
let _isLittleEndian = true;
let _isLittleEndianComputed = false;
function isLittleEndian() {
    if (!_isLittleEndianComputed) {
        _isLittleEndianComputed = true;
        const test = new Uint8Array(2);
        test[0] = 1;
        test[1] = 2;
        const view = new Uint16Array(test.buffer);
        _isLittleEndian = (view[0] === (2 << 8) + 1);
    }
    return _isLittleEndian;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const USUAL_WORD_SEPARATORS = '`~!@#$%^&*()-=+[{]}\\|;:\'",.<>/?';
/**
 * Create a word definition regular expression based on default word separators.
 * Optionally provide allowed separators that should be included in words.
 *
 * The default would look like this:
 * /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g
 */
function createWordRegExp(allowInWords = '') {
    let source = '(-?\\d*\\.\\d\\w*)|([^';
    for (const sep of USUAL_WORD_SEPARATORS) {
        if (allowInWords.indexOf(sep) >= 0) {
            continue;
        }
        source += '\\' + sep;
    }
    source += '\\s]+)';
    return new RegExp(source, 'g');
}
// catches numbers (including floating numbers) in the first group, and alphanum in the second
const DEFAULT_WORD_REGEXP = createWordRegExp();
function ensureValidWordDefinition(wordDefinition) {
    let result = DEFAULT_WORD_REGEXP;
    if (wordDefinition && (wordDefinition instanceof RegExp)) {
        if (!wordDefinition.global) {
            let flags = 'g';
            if (wordDefinition.ignoreCase) {
                flags += 'i';
            }
            if (wordDefinition.multiline) {
                flags += 'm';
            }
            if (wordDefinition.unicode) {
                flags += 'u';
            }
            result = new RegExp(wordDefinition.source, flags);
        }
        else {
            result = wordDefinition;
        }
    }
    result.lastIndex = 0;
    return result;
}
const _defaultConfig = {
    maxLen: 1000,
    windowSize: 15,
    timeBudget: 150
};
function getWordAtText(column, wordDefinition, text, textOffset, config = _defaultConfig) {
    if (text.length > config.maxLen) {
        // don't throw strings that long at the regexp
        // but use a sub-string in which a word must occur
        let start = column - config.maxLen / 2;
        if (start < 0) {
            start = 0;
        }
        else {
            textOffset += start;
        }
        text = text.substring(start, column + config.maxLen / 2);
        return getWordAtText(column, wordDefinition, text, textOffset, config);
    }
    const t1 = Date.now();
    const pos = column - 1 - textOffset;
    let prevRegexIndex = -1;
    let match = null;
    for (let i = 1;; i++) {
        // check time budget
        if (Date.now() - t1 >= config.timeBudget) {
            break;
        }
        // reset the index at which the regexp should start matching, also know where it
        // should stop so that subsequent search don't repeat previous searches
        const regexIndex = pos - config.windowSize * i;
        wordDefinition.lastIndex = Math.max(0, regexIndex);
        const thisMatch = _findRegexMatchEnclosingPosition(wordDefinition, text, pos, prevRegexIndex);
        if (!thisMatch && match) {
            // stop: we have something
            break;
        }
        match = thisMatch;
        // stop: searched at start
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
        }
        else if (stopPos > 0 && matchIndex > stopPos) {
            return null;
        }
    }
    return null;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * @internal
 * The width of the minimap gutter, in pixels.
 */
const MINIMAP_GUTTER_WIDTH = 8;
//#endregion
/**
 * An event describing that the configuration of the editor has changed.
 */
class ConfigurationChangedEvent {
    /**
     * @internal
     */
    constructor(values) {
        this._values = values;
    }
    hasChanged(id) {
        return this._values[id];
    }
}
/**
 * @internal
 */
class ValidatedEditorOptions {
    constructor() {
        this._values = [];
    }
    _read(option) {
        return this._values[option];
    }
    get(id) {
        return this._values[id];
    }
    _write(option, value) {
        this._values[option] = value;
    }
}
/**
 * @internal
 */
class ComputeOptionsMemory {
    constructor() {
        this.stableMinimapLayoutInput = null;
        this.stableFitMaxMinimapScale = 0;
        this.stableFitRemainingWidth = 0;
    }
}
/**
 * @internal
 */
class BaseEditorOption {
    constructor(id, name, defaultValue, schema) {
        this.id = id;
        this.name = name;
        this.defaultValue = defaultValue;
        this.schema = schema;
    }
    compute(env, options, value) {
        return value;
    }
}
/**
 * @internal
 */
class ComputedEditorOption {
    constructor(id, deps = null) {
        this.schema = undefined;
        this.id = id;
        this.name = '_never_';
        this.defaultValue = undefined;
        this.deps = deps;
    }
    validate(input) {
        return this.defaultValue;
    }
}
class SimpleEditorOption {
    constructor(id, name, defaultValue, schema) {
        this.id = id;
        this.name = name;
        this.defaultValue = defaultValue;
        this.schema = schema;
    }
    validate(input) {
        if (typeof input === 'undefined') {
            return this.defaultValue;
        }
        return input;
    }
    compute(env, options, value) {
        return value;
    }
}
/**
 * @internal
 */
function boolean(value, defaultValue) {
    if (typeof value === 'undefined') {
        return defaultValue;
    }
    if (value === 'false') {
        // treat the string 'false' as false
        return false;
    }
    return Boolean(value);
}
class EditorBooleanOption extends SimpleEditorOption {
    constructor(id, name, defaultValue, schema = undefined) {
        if (typeof schema !== 'undefined') {
            schema.type = 'boolean';
            schema.default = defaultValue;
        }
        super(id, name, defaultValue, schema);
    }
    validate(input) {
        return boolean(input, this.defaultValue);
    }
}
class EditorIntOption extends SimpleEditorOption {
    constructor(id, name, defaultValue, minimum, maximum, schema = undefined) {
        if (typeof schema !== 'undefined') {
            schema.type = 'integer';
            schema.default = defaultValue;
            schema.minimum = minimum;
            schema.maximum = maximum;
        }
        super(id, name, defaultValue, schema);
        this.minimum = minimum;
        this.maximum = maximum;
    }
    static clampedInt(value, defaultValue, minimum, maximum) {
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        let r = parseInt(value, 10);
        if (isNaN(r)) {
            return defaultValue;
        }
        r = Math.max(minimum, r);
        r = Math.min(maximum, r);
        return r | 0;
    }
    validate(input) {
        return EditorIntOption.clampedInt(input, this.defaultValue, this.minimum, this.maximum);
    }
}
class EditorFloatOption extends SimpleEditorOption {
    constructor(id, name, defaultValue, validationFn, schema) {
        if (typeof schema !== 'undefined') {
            schema.type = 'number';
            schema.default = defaultValue;
        }
        super(id, name, defaultValue, schema);
        this.validationFn = validationFn;
    }
    static clamp(n, min, max) {
        if (n < min) {
            return min;
        }
        if (n > max) {
            return max;
        }
        return n;
    }
    static float(value, defaultValue) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'undefined') {
            return defaultValue;
        }
        const r = parseFloat(value);
        return (isNaN(r) ? defaultValue : r);
    }
    validate(input) {
        return this.validationFn(EditorFloatOption.float(input, this.defaultValue));
    }
}
class EditorStringOption extends SimpleEditorOption {
    static string(value, defaultValue) {
        if (typeof value !== 'string') {
            return defaultValue;
        }
        return value;
    }
    constructor(id, name, defaultValue, schema = undefined) {
        if (typeof schema !== 'undefined') {
            schema.type = 'string';
            schema.default = defaultValue;
        }
        super(id, name, defaultValue, schema);
    }
    validate(input) {
        return EditorStringOption.string(input, this.defaultValue);
    }
}
/**
 * @internal
 */
function stringSet(value, defaultValue, allowedValues) {
    if (typeof value !== 'string') {
        return defaultValue;
    }
    if (allowedValues.indexOf(value) === -1) {
        return defaultValue;
    }
    return value;
}
class EditorStringEnumOption extends SimpleEditorOption {
    constructor(id, name, defaultValue, allowedValues, schema = undefined) {
        if (typeof schema !== 'undefined') {
            schema.type = 'string';
            schema.enum = allowedValues;
            schema.default = defaultValue;
        }
        super(id, name, defaultValue, schema);
        this._allowedValues = allowedValues;
    }
    validate(input) {
        return stringSet(input, this.defaultValue, this._allowedValues);
    }
}
class EditorEnumOption extends BaseEditorOption {
    constructor(id, name, defaultValue, defaultStringValue, allowedValues, convert, schema = undefined) {
        if (typeof schema !== 'undefined') {
            schema.type = 'string';
            schema.enum = allowedValues;
            schema.default = defaultStringValue;
        }
        super(id, name, defaultValue, schema);
        this._allowedValues = allowedValues;
        this._convert = convert;
    }
    validate(input) {
        if (typeof input !== 'string') {
            return this.defaultValue;
        }
        if (this._allowedValues.indexOf(input) === -1) {
            return this.defaultValue;
        }
        return this._convert(input);
    }
}
//#endregion
//#region autoIndent
function _autoIndentFromString(autoIndent) {
    switch (autoIndent) {
        case 'none': return 0 /* None */;
        case 'keep': return 1 /* Keep */;
        case 'brackets': return 2 /* Brackets */;
        case 'advanced': return 3 /* Advanced */;
        case 'full': return 4 /* Full */;
    }
}
//#endregion
//#region accessibilitySupport
class EditorAccessibilitySupport extends BaseEditorOption {
    constructor() {
        super(2 /* accessibilitySupport */, 'accessibilitySupport', 0 /* Unknown */, {
            type: 'string',
            enum: ['auto', 'on', 'off'],
            enumDescriptions: [
                localize('accessibilitySupport.auto', "The editor will use platform APIs to detect when a Screen Reader is attached."),
                localize('accessibilitySupport.on', "The editor will be permanently optimized for usage with a Screen Reader. Word wrapping will be disabled."),
                localize('accessibilitySupport.off', "The editor will never be optimized for usage with a Screen Reader."),
            ],
            default: 'auto',
            description: localize('accessibilitySupport', "Controls whether the editor should run in a mode where it is optimized for screen readers. Setting to on will disable word wrapping.")
        });
    }
    validate(input) {
        switch (input) {
            case 'auto': return 0 /* Unknown */;
            case 'off': return 1 /* Disabled */;
            case 'on': return 2 /* Enabled */;
        }
        return this.defaultValue;
    }
    compute(env, options, value) {
        if (value === 0 /* Unknown */) {
            // The editor reads the `accessibilitySupport` from the environment
            return env.accessibilitySupport;
        }
        return value;
    }
}
class EditorComments extends BaseEditorOption {
    constructor() {
        const defaults = {
            insertSpace: true,
            ignoreEmptyLines: true,
        };
        super(17 /* comments */, 'comments', defaults, {
            'editor.comments.insertSpace': {
                type: 'boolean',
                default: defaults.insertSpace,
                description: localize('comments.insertSpace', "Controls whether a space character is inserted when commenting.")
            },
            'editor.comments.ignoreEmptyLines': {
                type: 'boolean',
                default: defaults.ignoreEmptyLines,
                description: localize('comments.ignoreEmptyLines', 'Controls if empty lines should be ignored with toggle, add or remove actions for line comments.')
            },
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            insertSpace: boolean(input.insertSpace, this.defaultValue.insertSpace),
            ignoreEmptyLines: boolean(input.ignoreEmptyLines, this.defaultValue.ignoreEmptyLines),
        };
    }
}
function _cursorBlinkingStyleFromString(cursorBlinkingStyle) {
    switch (cursorBlinkingStyle) {
        case 'blink': return 1 /* Blink */;
        case 'smooth': return 2 /* Smooth */;
        case 'phase': return 3 /* Phase */;
        case 'expand': return 4 /* Expand */;
        case 'solid': return 5 /* Solid */;
    }
}
//#endregion
//#region cursorStyle
/**
 * The style in which the editor's cursor should be rendered.
 */
var TextEditorCursorStyle;
(function (TextEditorCursorStyle) {
    /**
     * As a vertical line (sitting between two characters).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["Line"] = 1] = "Line";
    /**
     * As a block (sitting on top of a character).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["Block"] = 2] = "Block";
    /**
     * As a horizontal line (sitting under a character).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["Underline"] = 3] = "Underline";
    /**
     * As a thin vertical line (sitting between two characters).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["LineThin"] = 4] = "LineThin";
    /**
     * As an outlined block (sitting on top of a character).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["BlockOutline"] = 5] = "BlockOutline";
    /**
     * As a thin horizontal line (sitting under a character).
     */
    TextEditorCursorStyle[TextEditorCursorStyle["UnderlineThin"] = 6] = "UnderlineThin";
})(TextEditorCursorStyle || (TextEditorCursorStyle = {}));
function _cursorStyleFromString(cursorStyle) {
    switch (cursorStyle) {
        case 'line': return TextEditorCursorStyle.Line;
        case 'block': return TextEditorCursorStyle.Block;
        case 'underline': return TextEditorCursorStyle.Underline;
        case 'line-thin': return TextEditorCursorStyle.LineThin;
        case 'block-outline': return TextEditorCursorStyle.BlockOutline;
        case 'underline-thin': return TextEditorCursorStyle.UnderlineThin;
    }
}
//#endregion
//#region editorClassName
class EditorClassName extends ComputedEditorOption {
    constructor() {
        super(125 /* editorClassName */, [63 /* mouseStyle */, 31 /* extraEditorClassName */]);
    }
    compute(env, options, _) {
        const classNames = ['monaco-editor'];
        if (options.get(31 /* extraEditorClassName */)) {
            classNames.push(options.get(31 /* extraEditorClassName */));
        }
        if (env.extraEditorClassName) {
            classNames.push(env.extraEditorClassName);
        }
        if (options.get(63 /* mouseStyle */) === 'default') {
            classNames.push('mouse-default');
        }
        else if (options.get(63 /* mouseStyle */) === 'copy') {
            classNames.push('mouse-copy');
        }
        if (options.get(98 /* showUnused */)) {
            classNames.push('showUnused');
        }
        if (options.get(123 /* showDeprecated */)) {
            classNames.push('showDeprecated');
        }
        return classNames.join(' ');
    }
}
//#endregion
//#region emptySelectionClipboard
class EditorEmptySelectionClipboard extends EditorBooleanOption {
    constructor() {
        super(30 /* emptySelectionClipboard */, 'emptySelectionClipboard', true, { description: localize('emptySelectionClipboard', "Controls whether copying without a selection copies the current line.") });
    }
    compute(env, options, value) {
        return value && env.emptySelectionClipboard;
    }
}
class EditorFind extends BaseEditorOption {
    constructor() {
        const defaults = {
            cursorMoveOnType: true,
            seedSearchStringFromSelection: true,
            autoFindInSelection: 'never',
            globalFindClipboard: false,
            addExtraSpaceOnTop: true,
            loop: true
        };
        super(33 /* find */, 'find', defaults, {
            'editor.find.cursorMoveOnType': {
                type: 'boolean',
                default: defaults.cursorMoveOnType,
                description: localize('find.cursorMoveOnType', "Controls whether the cursor should jump to find matches while typing.")
            },
            'editor.find.seedSearchStringFromSelection': {
                type: 'boolean',
                default: defaults.seedSearchStringFromSelection,
                description: localize('find.seedSearchStringFromSelection', "Controls whether the search string in the Find Widget is seeded from the editor selection.")
            },
            'editor.find.autoFindInSelection': {
                type: 'string',
                enum: ['never', 'always', 'multiline'],
                default: defaults.autoFindInSelection,
                enumDescriptions: [
                    localize('editor.find.autoFindInSelection.never', 'Never turn on Find in selection automatically (default).'),
                    localize('editor.find.autoFindInSelection.always', 'Always turn on Find in selection automatically.'),
                    localize('editor.find.autoFindInSelection.multiline', 'Turn on Find in selection automatically when multiple lines of content are selected.')
                ],
                description: localize('find.autoFindInSelection', "Controls the condition for turning on find in selection automatically.")
            },
            'editor.find.globalFindClipboard': {
                type: 'boolean',
                default: defaults.globalFindClipboard,
                description: localize('find.globalFindClipboard', "Controls whether the Find Widget should read or modify the shared find clipboard on macOS."),
                included: isMacintosh
            },
            'editor.find.addExtraSpaceOnTop': {
                type: 'boolean',
                default: defaults.addExtraSpaceOnTop,
                description: localize('find.addExtraSpaceOnTop', "Controls whether the Find Widget should add extra lines on top of the editor. When true, you can scroll beyond the first line when the Find Widget is visible.")
            },
            'editor.find.loop': {
                type: 'boolean',
                default: defaults.loop,
                description: localize('find.loop', "Controls whether the search automatically restarts from the beginning (or the end) when no further matches can be found.")
            },
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            cursorMoveOnType: boolean(input.cursorMoveOnType, this.defaultValue.cursorMoveOnType),
            seedSearchStringFromSelection: boolean(input.seedSearchStringFromSelection, this.defaultValue.seedSearchStringFromSelection),
            autoFindInSelection: typeof _input.autoFindInSelection === 'boolean'
                ? (_input.autoFindInSelection ? 'always' : 'never')
                : stringSet(input.autoFindInSelection, this.defaultValue.autoFindInSelection, ['never', 'always', 'multiline']),
            globalFindClipboard: boolean(input.globalFindClipboard, this.defaultValue.globalFindClipboard),
            addExtraSpaceOnTop: boolean(input.addExtraSpaceOnTop, this.defaultValue.addExtraSpaceOnTop),
            loop: boolean(input.loop, this.defaultValue.loop),
        };
    }
}
//#endregion
//#region fontLigatures
/**
 * @internal
 */
class EditorFontLigatures extends BaseEditorOption {
    constructor() {
        super(41 /* fontLigatures */, 'fontLigatures', EditorFontLigatures.OFF, {
            anyOf: [
                {
                    type: 'boolean',
                    description: localize('fontLigatures', "Enables/Disables font ligatures ('calt' and 'liga' font features). Change this to a string for fine-grained control of the 'font-feature-settings' CSS property."),
                },
                {
                    type: 'string',
                    description: localize('fontFeatureSettings', "Explicit 'font-feature-settings' CSS property. A boolean can be passed instead if one only needs to turn on/off ligatures.")
                }
            ],
            description: localize('fontLigaturesGeneral', "Configures font ligatures or font features. Can be either a boolean to enable/disable ligatures or a string for the value of the CSS 'font-feature-settings' property."),
            default: false
        });
    }
    validate(input) {
        if (typeof input === 'undefined') {
            return this.defaultValue;
        }
        if (typeof input === 'string') {
            if (input === 'false') {
                return EditorFontLigatures.OFF;
            }
            if (input === 'true') {
                return EditorFontLigatures.ON;
            }
            return input;
        }
        if (Boolean(input)) {
            return EditorFontLigatures.ON;
        }
        return EditorFontLigatures.OFF;
    }
}
EditorFontLigatures.OFF = '"liga" off, "calt" off';
EditorFontLigatures.ON = '"liga" on, "calt" on';
//#endregion
//#region fontInfo
class EditorFontInfo extends ComputedEditorOption {
    constructor() {
        super(40 /* fontInfo */);
    }
    compute(env, options, _) {
        return env.fontInfo;
    }
}
//#endregion
//#region fontSize
class EditorFontSize extends SimpleEditorOption {
    constructor() {
        super(42 /* fontSize */, 'fontSize', EDITOR_FONT_DEFAULTS.fontSize, {
            type: 'number',
            minimum: 6,
            maximum: 100,
            default: EDITOR_FONT_DEFAULTS.fontSize,
            description: localize('fontSize', "Controls the font size in pixels.")
        });
    }
    validate(input) {
        let r = EditorFloatOption.float(input, this.defaultValue);
        if (r === 0) {
            return EDITOR_FONT_DEFAULTS.fontSize;
        }
        return EditorFloatOption.clamp(r, 6, 100);
    }
    compute(env, options, value) {
        // The final fontSize respects the editor zoom level.
        // So take the result from env.fontInfo
        return env.fontInfo.fontSize;
    }
}
//#endregion
//#region fontWeight
class EditorFontWeight extends BaseEditorOption {
    constructor() {
        super(43 /* fontWeight */, 'fontWeight', EDITOR_FONT_DEFAULTS.fontWeight, {
            anyOf: [
                {
                    type: 'number',
                    minimum: EditorFontWeight.MINIMUM_VALUE,
                    maximum: EditorFontWeight.MAXIMUM_VALUE,
                    errorMessage: localize('fontWeightErrorMessage', "Only \"normal\" and \"bold\" keywords or numbers between 1 and 1000 are allowed.")
                },
                {
                    type: 'string',
                    pattern: '^(normal|bold|1000|[1-9][0-9]{0,2})$'
                },
                {
                    enum: EditorFontWeight.SUGGESTION_VALUES
                }
            ],
            default: EDITOR_FONT_DEFAULTS.fontWeight,
            description: localize('fontWeight', "Controls the font weight. Accepts \"normal\" and \"bold\" keywords or numbers between 1 and 1000.")
        });
    }
    validate(input) {
        if (input === 'normal' || input === 'bold') {
            return input;
        }
        return String(EditorIntOption.clampedInt(input, EDITOR_FONT_DEFAULTS.fontWeight, EditorFontWeight.MINIMUM_VALUE, EditorFontWeight.MAXIMUM_VALUE));
    }
}
EditorFontWeight.SUGGESTION_VALUES = ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
EditorFontWeight.MINIMUM_VALUE = 1;
EditorFontWeight.MAXIMUM_VALUE = 1000;
class EditorGoToLocation extends BaseEditorOption {
    constructor() {
        const defaults = {
            multiple: 'peek',
            multipleDefinitions: 'peek',
            multipleTypeDefinitions: 'peek',
            multipleDeclarations: 'peek',
            multipleImplementations: 'peek',
            multipleReferences: 'peek',
            alternativeDefinitionCommand: 'editor.action.goToReferences',
            alternativeTypeDefinitionCommand: 'editor.action.goToReferences',
            alternativeDeclarationCommand: 'editor.action.goToReferences',
            alternativeImplementationCommand: '',
            alternativeReferenceCommand: '',
        };
        const jsonSubset = {
            type: 'string',
            enum: ['peek', 'gotoAndPeek', 'goto'],
            default: defaults.multiple,
            enumDescriptions: [
                localize('editor.gotoLocation.multiple.peek', 'Show peek view of the results (default)'),
                localize('editor.gotoLocation.multiple.gotoAndPeek', 'Go to the primary result and show a peek view'),
                localize('editor.gotoLocation.multiple.goto', 'Go to the primary result and enable peek-less navigation to others')
            ]
        };
        const alternativeCommandOptions = ['', 'editor.action.referenceSearch.trigger', 'editor.action.goToReferences', 'editor.action.peekImplementation', 'editor.action.goToImplementation', 'editor.action.peekTypeDefinition', 'editor.action.goToTypeDefinition', 'editor.action.peekDeclaration', 'editor.action.revealDeclaration', 'editor.action.peekDefinition', 'editor.action.revealDefinitionAside', 'editor.action.revealDefinition'];
        super(47 /* gotoLocation */, 'gotoLocation', defaults, {
            'editor.gotoLocation.multiple': {
                deprecationMessage: localize('editor.gotoLocation.multiple.deprecated', "This setting is deprecated, please use separate settings like 'editor.editor.gotoLocation.multipleDefinitions' or 'editor.editor.gotoLocation.multipleImplementations' instead."),
            },
            'editor.gotoLocation.multipleDefinitions': Object.assign({ description: localize('editor.editor.gotoLocation.multipleDefinitions', "Controls the behavior the 'Go to Definition'-command when multiple target locations exist.") }, jsonSubset),
            'editor.gotoLocation.multipleTypeDefinitions': Object.assign({ description: localize('editor.editor.gotoLocation.multipleTypeDefinitions', "Controls the behavior the 'Go to Type Definition'-command when multiple target locations exist.") }, jsonSubset),
            'editor.gotoLocation.multipleDeclarations': Object.assign({ description: localize('editor.editor.gotoLocation.multipleDeclarations', "Controls the behavior the 'Go to Declaration'-command when multiple target locations exist.") }, jsonSubset),
            'editor.gotoLocation.multipleImplementations': Object.assign({ description: localize('editor.editor.gotoLocation.multipleImplemenattions', "Controls the behavior the 'Go to Implementations'-command when multiple target locations exist.") }, jsonSubset),
            'editor.gotoLocation.multipleReferences': Object.assign({ description: localize('editor.editor.gotoLocation.multipleReferences', "Controls the behavior the 'Go to References'-command when multiple target locations exist.") }, jsonSubset),
            'editor.gotoLocation.alternativeDefinitionCommand': {
                type: 'string',
                default: defaults.alternativeDefinitionCommand,
                enum: alternativeCommandOptions,
                description: localize('alternativeDefinitionCommand', "Alternative command id that is being executed when the result of 'Go to Definition' is the current location.")
            },
            'editor.gotoLocation.alternativeTypeDefinitionCommand': {
                type: 'string',
                default: defaults.alternativeTypeDefinitionCommand,
                enum: alternativeCommandOptions,
                description: localize('alternativeTypeDefinitionCommand', "Alternative command id that is being executed when the result of 'Go to Type Definition' is the current location.")
            },
            'editor.gotoLocation.alternativeDeclarationCommand': {
                type: 'string',
                default: defaults.alternativeDeclarationCommand,
                enum: alternativeCommandOptions,
                description: localize('alternativeDeclarationCommand', "Alternative command id that is being executed when the result of 'Go to Declaration' is the current location.")
            },
            'editor.gotoLocation.alternativeImplementationCommand': {
                type: 'string',
                default: defaults.alternativeImplementationCommand,
                enum: alternativeCommandOptions,
                description: localize('alternativeImplementationCommand', "Alternative command id that is being executed when the result of 'Go to Implementation' is the current location.")
            },
            'editor.gotoLocation.alternativeReferenceCommand': {
                type: 'string',
                default: defaults.alternativeReferenceCommand,
                enum: alternativeCommandOptions,
                description: localize('alternativeReferenceCommand', "Alternative command id that is being executed when the result of 'Go to Reference' is the current location.")
            },
        });
    }
    validate(_input) {
        var _a, _b, _c, _d, _e;
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            multiple: stringSet(input.multiple, this.defaultValue.multiple, ['peek', 'gotoAndPeek', 'goto']),
            multipleDefinitions: (_a = input.multipleDefinitions) !== null && _a !== void 0 ? _a : stringSet(input.multipleDefinitions, 'peek', ['peek', 'gotoAndPeek', 'goto']),
            multipleTypeDefinitions: (_b = input.multipleTypeDefinitions) !== null && _b !== void 0 ? _b : stringSet(input.multipleTypeDefinitions, 'peek', ['peek', 'gotoAndPeek', 'goto']),
            multipleDeclarations: (_c = input.multipleDeclarations) !== null && _c !== void 0 ? _c : stringSet(input.multipleDeclarations, 'peek', ['peek', 'gotoAndPeek', 'goto']),
            multipleImplementations: (_d = input.multipleImplementations) !== null && _d !== void 0 ? _d : stringSet(input.multipleImplementations, 'peek', ['peek', 'gotoAndPeek', 'goto']),
            multipleReferences: (_e = input.multipleReferences) !== null && _e !== void 0 ? _e : stringSet(input.multipleReferences, 'peek', ['peek', 'gotoAndPeek', 'goto']),
            alternativeDefinitionCommand: EditorStringOption.string(input.alternativeDefinitionCommand, this.defaultValue.alternativeDefinitionCommand),
            alternativeTypeDefinitionCommand: EditorStringOption.string(input.alternativeTypeDefinitionCommand, this.defaultValue.alternativeTypeDefinitionCommand),
            alternativeDeclarationCommand: EditorStringOption.string(input.alternativeDeclarationCommand, this.defaultValue.alternativeDeclarationCommand),
            alternativeImplementationCommand: EditorStringOption.string(input.alternativeImplementationCommand, this.defaultValue.alternativeImplementationCommand),
            alternativeReferenceCommand: EditorStringOption.string(input.alternativeReferenceCommand, this.defaultValue.alternativeReferenceCommand),
        };
    }
}
class EditorHover extends BaseEditorOption {
    constructor() {
        const defaults = {
            enabled: true,
            delay: 300,
            sticky: true
        };
        super(50 /* hover */, 'hover', defaults, {
            'editor.hover.enabled': {
                type: 'boolean',
                default: defaults.enabled,
                description: localize('hover.enabled', "Controls whether the hover is shown.")
            },
            'editor.hover.delay': {
                type: 'number',
                default: defaults.delay,
                description: localize('hover.delay', "Controls the delay in milliseconds after which the hover is shown.")
            },
            'editor.hover.sticky': {
                type: 'boolean',
                default: defaults.sticky,
                description: localize('hover.sticky', "Controls whether the hover should remain visible when mouse is moved over it.")
            },
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            enabled: boolean(input.enabled, this.defaultValue.enabled),
            delay: EditorIntOption.clampedInt(input.delay, this.defaultValue.delay, 0, 10000),
            sticky: boolean(input.sticky, this.defaultValue.sticky)
        };
    }
}
/**
 * @internal
 */
class EditorLayoutInfoComputer extends ComputedEditorOption {
    constructor() {
        super(128 /* layoutInfo */, [
            46 /* glyphMargin */, 55 /* lineDecorationsWidth */, 35 /* folding */,
            62 /* minimap */, 90 /* scrollbar */, 57 /* lineNumbers */,
            58 /* lineNumbersMinChars */, 92 /* scrollBeyondLastLine */,
            115 /* wordWrap */, 118 /* wordWrapColumn */, 119 /* wordWrapOverride1 */, 120 /* wordWrapOverride2 */,
            2 /* accessibilitySupport */
        ]);
    }
    compute(env, options, _) {
        return EditorLayoutInfoComputer.computeLayout(options, {
            memory: env.memory,
            outerWidth: env.outerWidth,
            outerHeight: env.outerHeight,
            isDominatedByLongLines: env.isDominatedByLongLines,
            lineHeight: env.fontInfo.lineHeight,
            viewLineCount: env.viewLineCount,
            lineNumbersDigitCount: env.lineNumbersDigitCount,
            typicalHalfwidthCharacterWidth: env.fontInfo.typicalHalfwidthCharacterWidth,
            maxDigitWidth: env.fontInfo.maxDigitWidth,
            pixelRatio: env.pixelRatio
        });
    }
    static computeContainedMinimapLineCount(input) {
        const typicalViewportLineCount = input.height / input.lineHeight;
        const extraLinesBeyondLastLine = input.scrollBeyondLastLine ? (typicalViewportLineCount - 1) : 0;
        const desiredRatio = (input.viewLineCount + extraLinesBeyondLastLine) / (input.pixelRatio * input.height);
        const minimapLineCount = Math.floor(input.viewLineCount / desiredRatio);
        return { typicalViewportLineCount, extraLinesBeyondLastLine, desiredRatio, minimapLineCount };
    }
    static _computeMinimapLayout(input, memory) {
        const outerWidth = input.outerWidth;
        const outerHeight = input.outerHeight;
        const pixelRatio = input.pixelRatio;
        if (!input.minimap.enabled) {
            return {
                renderMinimap: 0 /* None */,
                minimapLeft: 0,
                minimapWidth: 0,
                minimapHeightIsEditorHeight: false,
                minimapIsSampling: false,
                minimapScale: 1,
                minimapLineHeight: 1,
                minimapCanvasInnerWidth: 0,
                minimapCanvasInnerHeight: Math.floor(pixelRatio * outerHeight),
                minimapCanvasOuterWidth: 0,
                minimapCanvasOuterHeight: outerHeight,
            };
        }
        // Can use memory if only the `viewLineCount` and `remainingWidth` have changed
        const stableMinimapLayoutInput = memory.stableMinimapLayoutInput;
        const couldUseMemory = (stableMinimapLayoutInput
            // && input.outerWidth === lastMinimapLayoutInput.outerWidth !!! INTENTIONAL OMITTED
            && input.outerHeight === stableMinimapLayoutInput.outerHeight
            && input.lineHeight === stableMinimapLayoutInput.lineHeight
            && input.typicalHalfwidthCharacterWidth === stableMinimapLayoutInput.typicalHalfwidthCharacterWidth
            && input.pixelRatio === stableMinimapLayoutInput.pixelRatio
            && input.scrollBeyondLastLine === stableMinimapLayoutInput.scrollBeyondLastLine
            && input.minimap.enabled === stableMinimapLayoutInput.minimap.enabled
            && input.minimap.side === stableMinimapLayoutInput.minimap.side
            && input.minimap.size === stableMinimapLayoutInput.minimap.size
            && input.minimap.showSlider === stableMinimapLayoutInput.minimap.showSlider
            && input.minimap.renderCharacters === stableMinimapLayoutInput.minimap.renderCharacters
            && input.minimap.maxColumn === stableMinimapLayoutInput.minimap.maxColumn
            && input.minimap.scale === stableMinimapLayoutInput.minimap.scale
            && input.verticalScrollbarWidth === stableMinimapLayoutInput.verticalScrollbarWidth
            // && input.viewLineCount === lastMinimapLayoutInput.viewLineCount !!! INTENTIONAL OMITTED
            // && input.remainingWidth === lastMinimapLayoutInput.remainingWidth !!! INTENTIONAL OMITTED
            && input.isViewportWrapping === stableMinimapLayoutInput.isViewportWrapping);
        const lineHeight = input.lineHeight;
        const typicalHalfwidthCharacterWidth = input.typicalHalfwidthCharacterWidth;
        const scrollBeyondLastLine = input.scrollBeyondLastLine;
        const minimapRenderCharacters = input.minimap.renderCharacters;
        let minimapScale = (pixelRatio >= 2 ? Math.round(input.minimap.scale * 2) : input.minimap.scale);
        const minimapMaxColumn = input.minimap.maxColumn;
        const minimapSize = input.minimap.size;
        const minimapSide = input.minimap.side;
        const verticalScrollbarWidth = input.verticalScrollbarWidth;
        const viewLineCount = input.viewLineCount;
        const remainingWidth = input.remainingWidth;
        const isViewportWrapping = input.isViewportWrapping;
        const baseCharHeight = minimapRenderCharacters ? 2 : 3;
        let minimapCanvasInnerHeight = Math.floor(pixelRatio * outerHeight);
        const minimapCanvasOuterHeight = minimapCanvasInnerHeight / pixelRatio;
        let minimapHeightIsEditorHeight = false;
        let minimapIsSampling = false;
        let minimapLineHeight = baseCharHeight * minimapScale;
        let minimapCharWidth = minimapScale / pixelRatio;
        let minimapWidthMultiplier = 1;
        if (minimapSize === 'fill' || minimapSize === 'fit') {
            const { typicalViewportLineCount, extraLinesBeyondLastLine, desiredRatio, minimapLineCount } = EditorLayoutInfoComputer.computeContainedMinimapLineCount({
                viewLineCount: viewLineCount,
                scrollBeyondLastLine: scrollBeyondLastLine,
                height: outerHeight,
                lineHeight: lineHeight,
                pixelRatio: pixelRatio
            });
            // ratio is intentionally not part of the layout to avoid the layout changing all the time
            // when doing sampling
            const ratio = viewLineCount / minimapLineCount;
            if (ratio > 1) {
                minimapHeightIsEditorHeight = true;
                minimapIsSampling = true;
                minimapScale = 1;
                minimapLineHeight = 1;
                minimapCharWidth = minimapScale / pixelRatio;
            }
            else {
                let fitBecomesFill = false;
                let maxMinimapScale = minimapScale + 1;
                if (minimapSize === 'fit') {
                    const effectiveMinimapHeight = Math.ceil((viewLineCount + extraLinesBeyondLastLine) * minimapLineHeight);
                    if (isViewportWrapping && couldUseMemory && remainingWidth <= memory.stableFitRemainingWidth) {
                        // There is a loop when using `fit` and viewport wrapping:
                        // - view line count impacts minimap layout
                        // - minimap layout impacts viewport width
                        // - viewport width impacts view line count
                        // To break the loop, once we go to a smaller minimap scale, we try to stick with it.
                        fitBecomesFill = true;
                        maxMinimapScale = memory.stableFitMaxMinimapScale;
                    }
                    else {
                        fitBecomesFill = (effectiveMinimapHeight > minimapCanvasInnerHeight);
                        if (isViewportWrapping && fitBecomesFill) {
                            // remember for next time
                            memory.stableMinimapLayoutInput = input;
                            memory.stableFitRemainingWidth = remainingWidth;
                        }
                        else {
                            memory.stableMinimapLayoutInput = null;
                            memory.stableFitRemainingWidth = 0;
                        }
                    }
                }
                if (minimapSize === 'fill' || fitBecomesFill) {
                    minimapHeightIsEditorHeight = true;
                    const configuredMinimapScale = minimapScale;
                    minimapLineHeight = Math.min(lineHeight * pixelRatio, Math.max(1, Math.floor(1 / desiredRatio)));
                    minimapScale = Math.min(maxMinimapScale, Math.max(1, Math.floor(minimapLineHeight / baseCharHeight)));
                    if (minimapScale > configuredMinimapScale) {
                        minimapWidthMultiplier = Math.min(2, minimapScale / configuredMinimapScale);
                    }
                    minimapCharWidth = minimapScale / pixelRatio / minimapWidthMultiplier;
                    minimapCanvasInnerHeight = Math.ceil((Math.max(typicalViewportLineCount, viewLineCount + extraLinesBeyondLastLine)) * minimapLineHeight);
                    if (isViewportWrapping && fitBecomesFill) {
                        memory.stableFitMaxMinimapScale = minimapScale;
                    }
                }
            }
        }
        // Given:
        // (leaving 2px for the cursor to have space after the last character)
        // viewportColumn = (contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth
        // minimapWidth = viewportColumn * minimapCharWidth
        // contentWidth = remainingWidth - minimapWidth
        // What are good values for contentWidth and minimapWidth ?
        // minimapWidth = ((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth) * minimapCharWidth
        // typicalHalfwidthCharacterWidth * minimapWidth = (contentWidth - verticalScrollbarWidth - 2) * minimapCharWidth
        // typicalHalfwidthCharacterWidth * minimapWidth = (remainingWidth - minimapWidth - verticalScrollbarWidth - 2) * minimapCharWidth
        // (typicalHalfwidthCharacterWidth + minimapCharWidth) * minimapWidth = (remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth
        // minimapWidth = ((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth) / (typicalHalfwidthCharacterWidth + minimapCharWidth)
        const minimapMaxWidth = Math.floor(minimapMaxColumn * minimapCharWidth);
        const minimapWidth = Math.min(minimapMaxWidth, Math.max(0, Math.floor(((remainingWidth - verticalScrollbarWidth - 2) * minimapCharWidth) / (typicalHalfwidthCharacterWidth + minimapCharWidth))) + MINIMAP_GUTTER_WIDTH);
        let minimapCanvasInnerWidth = Math.floor(pixelRatio * minimapWidth);
        const minimapCanvasOuterWidth = minimapCanvasInnerWidth / pixelRatio;
        minimapCanvasInnerWidth = Math.floor(minimapCanvasInnerWidth * minimapWidthMultiplier);
        const renderMinimap = (minimapRenderCharacters ? 1 /* Text */ : 2 /* Blocks */);
        const minimapLeft = (minimapSide === 'left' ? 0 : (outerWidth - minimapWidth - verticalScrollbarWidth));
        return {
            renderMinimap,
            minimapLeft,
            minimapWidth,
            minimapHeightIsEditorHeight,
            minimapIsSampling,
            minimapScale,
            minimapLineHeight,
            minimapCanvasInnerWidth,
            minimapCanvasInnerHeight,
            minimapCanvasOuterWidth,
            minimapCanvasOuterHeight,
        };
    }
    static computeLayout(options, env) {
        const outerWidth = env.outerWidth | 0;
        const outerHeight = env.outerHeight | 0;
        const lineHeight = env.lineHeight | 0;
        const lineNumbersDigitCount = env.lineNumbersDigitCount | 0;
        const typicalHalfwidthCharacterWidth = env.typicalHalfwidthCharacterWidth;
        const maxDigitWidth = env.maxDigitWidth;
        const pixelRatio = env.pixelRatio;
        const viewLineCount = env.viewLineCount;
        const wordWrapOverride2 = options.get(120 /* wordWrapOverride2 */);
        const wordWrapOverride1 = (wordWrapOverride2 === 'inherit' ? options.get(119 /* wordWrapOverride1 */) : wordWrapOverride2);
        const wordWrap = (wordWrapOverride1 === 'inherit' ? options.get(115 /* wordWrap */) : wordWrapOverride1);
        const wordWrapColumn = options.get(118 /* wordWrapColumn */);
        const accessibilitySupport = options.get(2 /* accessibilitySupport */);
        const isDominatedByLongLines = env.isDominatedByLongLines;
        const showGlyphMargin = options.get(46 /* glyphMargin */);
        const showLineNumbers = (options.get(57 /* lineNumbers */).renderType !== 0 /* Off */);
        const lineNumbersMinChars = options.get(58 /* lineNumbersMinChars */);
        const scrollBeyondLastLine = options.get(92 /* scrollBeyondLastLine */);
        const minimap = options.get(62 /* minimap */);
        const scrollbar = options.get(90 /* scrollbar */);
        const verticalScrollbarWidth = scrollbar.verticalScrollbarSize;
        const verticalScrollbarHasArrows = scrollbar.verticalHasArrows;
        const scrollbarArrowSize = scrollbar.arrowSize;
        const horizontalScrollbarHeight = scrollbar.horizontalScrollbarSize;
        const rawLineDecorationsWidth = options.get(55 /* lineDecorationsWidth */);
        const folding = options.get(35 /* folding */);
        let lineDecorationsWidth;
        if (typeof rawLineDecorationsWidth === 'string' && /^\d+(\.\d+)?ch$/.test(rawLineDecorationsWidth)) {
            const multiple = parseFloat(rawLineDecorationsWidth.substr(0, rawLineDecorationsWidth.length - 2));
            lineDecorationsWidth = EditorIntOption.clampedInt(multiple * typicalHalfwidthCharacterWidth, 0, 0, 1000);
        }
        else {
            lineDecorationsWidth = EditorIntOption.clampedInt(rawLineDecorationsWidth, 0, 0, 1000);
        }
        if (folding) {
            lineDecorationsWidth += 16;
        }
        let lineNumbersWidth = 0;
        if (showLineNumbers) {
            const digitCount = Math.max(lineNumbersDigitCount, lineNumbersMinChars);
            lineNumbersWidth = Math.round(digitCount * maxDigitWidth);
        }
        let glyphMarginWidth = 0;
        if (showGlyphMargin) {
            glyphMarginWidth = lineHeight;
        }
        let glyphMarginLeft = 0;
        let lineNumbersLeft = glyphMarginLeft + glyphMarginWidth;
        let decorationsLeft = lineNumbersLeft + lineNumbersWidth;
        let contentLeft = decorationsLeft + lineDecorationsWidth;
        const remainingWidth = outerWidth - glyphMarginWidth - lineNumbersWidth - lineDecorationsWidth;
        let isWordWrapMinified = false;
        let isViewportWrapping = false;
        let wrappingColumn = -1;
        if (accessibilitySupport !== 2 /* Enabled */) {
            // See https://github.com/microsoft/vscode/issues/27766
            // Never enable wrapping when a screen reader is attached
            // because arrow down etc. will not move the cursor in the way
            // a screen reader expects.
            if (wordWrapOverride1 === 'inherit' && isDominatedByLongLines) {
                // Force viewport width wrapping if model is dominated by long lines
                isWordWrapMinified = true;
                isViewportWrapping = true;
            }
            else if (wordWrap === 'on' || wordWrap === 'bounded') {
                isViewportWrapping = true;
            }
            else if (wordWrap === 'wordWrapColumn') {
                wrappingColumn = wordWrapColumn;
            }
        }
        const minimapLayout = EditorLayoutInfoComputer._computeMinimapLayout({
            outerWidth: outerWidth,
            outerHeight: outerHeight,
            lineHeight: lineHeight,
            typicalHalfwidthCharacterWidth: typicalHalfwidthCharacterWidth,
            pixelRatio: pixelRatio,
            scrollBeyondLastLine: scrollBeyondLastLine,
            minimap: minimap,
            verticalScrollbarWidth: verticalScrollbarWidth,
            viewLineCount: viewLineCount,
            remainingWidth: remainingWidth,
            isViewportWrapping: isViewportWrapping,
        }, env.memory || new ComputeOptionsMemory());
        if (minimapLayout.renderMinimap !== 0 /* None */ && minimapLayout.minimapLeft === 0) {
            // the minimap is rendered to the left, so move everything to the right
            glyphMarginLeft += minimapLayout.minimapWidth;
            lineNumbersLeft += minimapLayout.minimapWidth;
            decorationsLeft += minimapLayout.minimapWidth;
            contentLeft += minimapLayout.minimapWidth;
        }
        const contentWidth = remainingWidth - minimapLayout.minimapWidth;
        // (leaving 2px for the cursor to have space after the last character)
        const viewportColumn = Math.max(1, Math.floor((contentWidth - verticalScrollbarWidth - 2) / typicalHalfwidthCharacterWidth));
        const verticalArrowSize = (verticalScrollbarHasArrows ? scrollbarArrowSize : 0);
        if (isViewportWrapping) {
            // compute the actual wrappingColumn
            wrappingColumn = Math.max(1, viewportColumn);
            if (wordWrap === 'bounded') {
                wrappingColumn = Math.min(wrappingColumn, wordWrapColumn);
            }
        }
        return {
            width: outerWidth,
            height: outerHeight,
            glyphMarginLeft: glyphMarginLeft,
            glyphMarginWidth: glyphMarginWidth,
            lineNumbersLeft: lineNumbersLeft,
            lineNumbersWidth: lineNumbersWidth,
            decorationsLeft: decorationsLeft,
            decorationsWidth: lineDecorationsWidth,
            contentLeft: contentLeft,
            contentWidth: contentWidth,
            minimap: minimapLayout,
            viewportColumn: viewportColumn,
            isWordWrapMinified: isWordWrapMinified,
            isViewportWrapping: isViewportWrapping,
            wrappingColumn: wrappingColumn,
            verticalScrollbarWidth: verticalScrollbarWidth,
            horizontalScrollbarHeight: horizontalScrollbarHeight,
            overviewRuler: {
                top: verticalArrowSize,
                width: verticalScrollbarWidth,
                height: (outerHeight - 2 * verticalArrowSize),
                right: 0
            }
        };
    }
}
class EditorLightbulb extends BaseEditorOption {
    constructor() {
        const defaults = { enabled: true };
        super(54 /* lightbulb */, 'lightbulb', defaults, {
            'editor.lightbulb.enabled': {
                type: 'boolean',
                default: defaults.enabled,
                description: localize('codeActions', "Enables the code action lightbulb in the editor.")
            },
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            enabled: boolean(input.enabled, this.defaultValue.enabled)
        };
    }
}
class EditorInlayHints extends BaseEditorOption {
    constructor() {
        const defaults = { enabled: true, fontSize: 0, fontFamily: EDITOR_FONT_DEFAULTS.fontFamily };
        super(124 /* inlayHints */, 'inlayHints', defaults, {
            'editor.inlayHints.enabled': {
                type: 'boolean',
                default: defaults.enabled,
                description: localize('inlayHints.enable', "Enables the inlay hints in the editor.")
            },
            'editor.inlayHints.fontSize': {
                type: 'number',
                default: defaults.fontSize,
                description: localize('inlayHints.fontSize', "Controls font size of inlay hints in the editor. When set to `0`, the 90% of `#editor.fontSize#` is used.")
            },
            'editor.inlayHints.fontFamily': {
                type: 'string',
                default: defaults.fontFamily,
                description: localize('inlayHints.fontFamily', "Controls font family of inlay hints in the editor.")
            },
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            enabled: boolean(input.enabled, this.defaultValue.enabled),
            fontSize: EditorIntOption.clampedInt(input.fontSize, this.defaultValue.fontSize, 0, 100),
            fontFamily: EditorStringOption.string(input.fontFamily, this.defaultValue.fontFamily)
        };
    }
}
//#endregion
//#region lineHeight
class EditorLineHeight extends EditorIntOption {
    constructor() {
        super(56 /* lineHeight */, 'lineHeight', EDITOR_FONT_DEFAULTS.lineHeight, 0, 150, { description: localize('lineHeight', "Controls the line height. Use 0 to compute the line height from the font size.") });
    }
    compute(env, options, value) {
        // The lineHeight is computed from the fontSize if it is 0.
        // Moreover, the final lineHeight respects the editor zoom level.
        // So take the result from env.fontInfo
        return env.fontInfo.lineHeight;
    }
}
class EditorMinimap extends BaseEditorOption {
    constructor() {
        const defaults = {
            enabled: true,
            size: 'proportional',
            side: 'right',
            showSlider: 'mouseover',
            renderCharacters: true,
            maxColumn: 120,
            scale: 1,
        };
        super(62 /* minimap */, 'minimap', defaults, {
            'editor.minimap.enabled': {
                type: 'boolean',
                default: defaults.enabled,
                description: localize('minimap.enabled', "Controls whether the minimap is shown.")
            },
            'editor.minimap.size': {
                type: 'string',
                enum: ['proportional', 'fill', 'fit'],
                enumDescriptions: [
                    localize('minimap.size.proportional', "The minimap has the same size as the editor contents (and might scroll)."),
                    localize('minimap.size.fill', "The minimap will stretch or shrink as necessary to fill the height of the editor (no scrolling)."),
                    localize('minimap.size.fit', "The minimap will shrink as necessary to never be larger than the editor (no scrolling)."),
                ],
                default: defaults.size,
                description: localize('minimap.size', "Controls the size of the minimap.")
            },
            'editor.minimap.side': {
                type: 'string',
                enum: ['left', 'right'],
                default: defaults.side,
                description: localize('minimap.side', "Controls the side where to render the minimap.")
            },
            'editor.minimap.showSlider': {
                type: 'string',
                enum: ['always', 'mouseover'],
                default: defaults.showSlider,
                description: localize('minimap.showSlider', "Controls when the minimap slider is shown.")
            },
            'editor.minimap.scale': {
                type: 'number',
                default: defaults.scale,
                minimum: 1,
                maximum: 3,
                enum: [1, 2, 3],
                description: localize('minimap.scale', "Scale of content drawn in the minimap: 1, 2 or 3.")
            },
            'editor.minimap.renderCharacters': {
                type: 'boolean',
                default: defaults.renderCharacters,
                description: localize('minimap.renderCharacters', "Render the actual characters on a line as opposed to color blocks.")
            },
            'editor.minimap.maxColumn': {
                type: 'number',
                default: defaults.maxColumn,
                description: localize('minimap.maxColumn', "Limit the width of the minimap to render at most a certain number of columns.")
            }
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            enabled: boolean(input.enabled, this.defaultValue.enabled),
            size: stringSet(input.size, this.defaultValue.size, ['proportional', 'fill', 'fit']),
            side: stringSet(input.side, this.defaultValue.side, ['right', 'left']),
            showSlider: stringSet(input.showSlider, this.defaultValue.showSlider, ['always', 'mouseover']),
            renderCharacters: boolean(input.renderCharacters, this.defaultValue.renderCharacters),
            scale: EditorIntOption.clampedInt(input.scale, 1, 1, 3),
            maxColumn: EditorIntOption.clampedInt(input.maxColumn, this.defaultValue.maxColumn, 1, 10000),
        };
    }
}
//#endregion
//#region multiCursorModifier
function _multiCursorModifierFromString(multiCursorModifier) {
    if (multiCursorModifier === 'ctrlCmd') {
        return (isMacintosh ? 'metaKey' : 'ctrlKey');
    }
    return 'altKey';
}
class EditorPadding extends BaseEditorOption {
    constructor() {
        super(72 /* padding */, 'padding', { top: 0, bottom: 0 }, {
            'editor.padding.top': {
                type: 'number',
                default: 0,
                minimum: 0,
                maximum: 1000,
                description: localize('padding.top', "Controls the amount of space between the top edge of the editor and the first line.")
            },
            'editor.padding.bottom': {
                type: 'number',
                default: 0,
                minimum: 0,
                maximum: 1000,
                description: localize('padding.bottom', "Controls the amount of space between the bottom edge of the editor and the last line.")
            }
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            top: EditorIntOption.clampedInt(input.top, 0, 0, 1000),
            bottom: EditorIntOption.clampedInt(input.bottom, 0, 0, 1000)
        };
    }
}
class EditorParameterHints extends BaseEditorOption {
    constructor() {
        const defaults = {
            enabled: true,
            cycle: false
        };
        super(73 /* parameterHints */, 'parameterHints', defaults, {
            'editor.parameterHints.enabled': {
                type: 'boolean',
                default: defaults.enabled,
                description: localize('parameterHints.enabled', "Enables a pop-up that shows parameter documentation and type information as you type.")
            },
            'editor.parameterHints.cycle': {
                type: 'boolean',
                default: defaults.cycle,
                description: localize('parameterHints.cycle', "Controls whether the parameter hints menu cycles or closes when reaching the end of the list.")
            },
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            enabled: boolean(input.enabled, this.defaultValue.enabled),
            cycle: boolean(input.cycle, this.defaultValue.cycle)
        };
    }
}
//#endregion
//#region pixelRatio
class EditorPixelRatio extends ComputedEditorOption {
    constructor() {
        super(126 /* pixelRatio */);
    }
    compute(env, options, _) {
        return env.pixelRatio;
    }
}
class EditorQuickSuggestions extends BaseEditorOption {
    constructor() {
        const defaults = {
            other: true,
            comments: false,
            strings: false
        };
        super(76 /* quickSuggestions */, 'quickSuggestions', defaults, {
            anyOf: [
                {
                    type: 'boolean',
                },
                {
                    type: 'object',
                    properties: {
                        strings: {
                            type: 'boolean',
                            default: defaults.strings,
                            description: localize('quickSuggestions.strings', "Enable quick suggestions inside strings.")
                        },
                        comments: {
                            type: 'boolean',
                            default: defaults.comments,
                            description: localize('quickSuggestions.comments', "Enable quick suggestions inside comments.")
                        },
                        other: {
                            type: 'boolean',
                            default: defaults.other,
                            description: localize('quickSuggestions.other', "Enable quick suggestions outside of strings and comments.")
                        },
                    }
                }
            ],
            default: defaults,
            description: localize('quickSuggestions', "Controls whether suggestions should automatically show up while typing.")
        });
        this.defaultValue = defaults;
    }
    validate(_input) {
        if (typeof _input === 'boolean') {
            return _input;
        }
        if (_input && typeof _input === 'object') {
            const input = _input;
            const opts = {
                other: boolean(input.other, this.defaultValue.other),
                comments: boolean(input.comments, this.defaultValue.comments),
                strings: boolean(input.strings, this.defaultValue.strings),
            };
            if (opts.other && opts.comments && opts.strings) {
                return true; // all on
            }
            else if (!opts.other && !opts.comments && !opts.strings) {
                return false; // all off
            }
            else {
                return opts;
            }
        }
        return this.defaultValue;
    }
}
class EditorRenderLineNumbersOption extends BaseEditorOption {
    constructor() {
        super(57 /* lineNumbers */, 'lineNumbers', { renderType: 1 /* On */, renderFn: null }, {
            type: 'string',
            enum: ['off', 'on', 'relative', 'interval'],
            enumDescriptions: [
                localize('lineNumbers.off', "Line numbers are not rendered."),
                localize('lineNumbers.on', "Line numbers are rendered as absolute number."),
                localize('lineNumbers.relative', "Line numbers are rendered as distance in lines to cursor position."),
                localize('lineNumbers.interval', "Line numbers are rendered every 10 lines.")
            ],
            default: 'on',
            description: localize('lineNumbers', "Controls the display of line numbers.")
        });
    }
    validate(lineNumbers) {
        let renderType = this.defaultValue.renderType;
        let renderFn = this.defaultValue.renderFn;
        if (typeof lineNumbers !== 'undefined') {
            if (typeof lineNumbers === 'function') {
                renderType = 4 /* Custom */;
                renderFn = lineNumbers;
            }
            else if (lineNumbers === 'interval') {
                renderType = 3 /* Interval */;
            }
            else if (lineNumbers === 'relative') {
                renderType = 2 /* Relative */;
            }
            else if (lineNumbers === 'on') {
                renderType = 1 /* On */;
            }
            else {
                renderType = 0 /* Off */;
            }
        }
        return {
            renderType,
            renderFn
        };
    }
}
//#endregion
//#region renderValidationDecorations
/**
 * @internal
 */
function filterValidationDecorations(options) {
    const renderValidationDecorations = options.get(85 /* renderValidationDecorations */);
    if (renderValidationDecorations === 'editable') {
        return options.get(78 /* readOnly */);
    }
    return renderValidationDecorations === 'on' ? false : true;
}
class EditorRulers extends BaseEditorOption {
    constructor() {
        const defaults = [];
        const columnSchema = { type: 'number', description: localize('rulers.size', "Number of monospace characters at which this editor ruler will render.") };
        super(89 /* rulers */, 'rulers', defaults, {
            type: 'array',
            items: {
                anyOf: [
                    columnSchema,
                    {
                        type: [
                            'object'
                        ],
                        properties: {
                            column: columnSchema,
                            color: {
                                type: 'string',
                                description: localize('rulers.color', "Color of this editor ruler."),
                                format: 'color-hex'
                            }
                        }
                    }
                ]
            },
            default: defaults,
            description: localize('rulers', "Render vertical rulers after a certain number of monospace characters. Use multiple values for multiple rulers. No rulers are drawn if array is empty.")
        });
    }
    validate(input) {
        if (Array.isArray(input)) {
            let rulers = [];
            for (let _element of input) {
                if (typeof _element === 'number') {
                    rulers.push({
                        column: EditorIntOption.clampedInt(_element, 0, 0, 10000),
                        color: null
                    });
                }
                else if (_element && typeof _element === 'object') {
                    const element = _element;
                    rulers.push({
                        column: EditorIntOption.clampedInt(element.column, 0, 0, 10000),
                        color: element.color
                    });
                }
            }
            rulers.sort((a, b) => a.column - b.column);
            return rulers;
        }
        return this.defaultValue;
    }
}
function _scrollbarVisibilityFromString(visibility, defaultValue) {
    if (typeof visibility !== 'string') {
        return defaultValue;
    }
    switch (visibility) {
        case 'hidden': return 2 /* Hidden */;
        case 'visible': return 3 /* Visible */;
        default: return 1 /* Auto */;
    }
}
class EditorScrollbar extends BaseEditorOption {
    constructor() {
        super(90 /* scrollbar */, 'scrollbar', {
            vertical: 1 /* Auto */,
            horizontal: 1 /* Auto */,
            arrowSize: 11,
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            horizontalScrollbarSize: 12,
            horizontalSliderSize: 12,
            verticalScrollbarSize: 14,
            verticalSliderSize: 14,
            handleMouseWheel: true,
            alwaysConsumeMouseWheel: true,
            scrollByPage: false
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        const horizontalScrollbarSize = EditorIntOption.clampedInt(input.horizontalScrollbarSize, this.defaultValue.horizontalScrollbarSize, 0, 1000);
        const verticalScrollbarSize = EditorIntOption.clampedInt(input.verticalScrollbarSize, this.defaultValue.verticalScrollbarSize, 0, 1000);
        return {
            arrowSize: EditorIntOption.clampedInt(input.arrowSize, this.defaultValue.arrowSize, 0, 1000),
            vertical: _scrollbarVisibilityFromString(input.vertical, this.defaultValue.vertical),
            horizontal: _scrollbarVisibilityFromString(input.horizontal, this.defaultValue.horizontal),
            useShadows: boolean(input.useShadows, this.defaultValue.useShadows),
            verticalHasArrows: boolean(input.verticalHasArrows, this.defaultValue.verticalHasArrows),
            horizontalHasArrows: boolean(input.horizontalHasArrows, this.defaultValue.horizontalHasArrows),
            handleMouseWheel: boolean(input.handleMouseWheel, this.defaultValue.handleMouseWheel),
            alwaysConsumeMouseWheel: boolean(input.alwaysConsumeMouseWheel, this.defaultValue.alwaysConsumeMouseWheel),
            horizontalScrollbarSize: horizontalScrollbarSize,
            horizontalSliderSize: EditorIntOption.clampedInt(input.horizontalSliderSize, horizontalScrollbarSize, 0, 1000),
            verticalScrollbarSize: verticalScrollbarSize,
            verticalSliderSize: EditorIntOption.clampedInt(input.verticalSliderSize, verticalScrollbarSize, 0, 1000),
            scrollByPage: boolean(input.scrollByPage, this.defaultValue.scrollByPage),
        };
    }
}
/**
 * Configuration options for inline suggestions
 */
class InlineEditorSuggest extends BaseEditorOption {
    constructor() {
        const defaults = {
            enabled: false
        };
        super(52 /* inlineSuggest */, 'inlineSuggest', defaults, {
            'editor.inlineSuggest.enabled': {
                type: 'boolean',
                default: defaults.enabled,
                description: localize('inlineSuggest.enabled', "Controls whether to automatically show inline suggestions in the editor.")
            },
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            enabled: boolean(input.enabled, this.defaultValue.enabled),
        };
    }
}
class EditorSuggest extends BaseEditorOption {
    constructor() {
        const defaults = {
            insertMode: 'insert',
            filterGraceful: true,
            snippetsPreventQuickSuggestions: true,
            localityBonus: false,
            shareSuggestSelections: false,
            showIcons: true,
            showStatusBar: false,
            preview: false,
            showInlineDetails: true,
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showDeprecated: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showSnippets: true,
            showUsers: true,
            showIssues: true,
        };
        super(104 /* suggest */, 'suggest', defaults, {
            'editor.suggest.insertMode': {
                type: 'string',
                enum: ['insert', 'replace'],
                enumDescriptions: [
                    localize('suggest.insertMode.insert', "Insert suggestion without overwriting text right of the cursor."),
                    localize('suggest.insertMode.replace', "Insert suggestion and overwrite text right of the cursor."),
                ],
                default: defaults.insertMode,
                description: localize('suggest.insertMode', "Controls whether words are overwritten when accepting completions. Note that this depends on extensions opting into this feature.")
            },
            'editor.suggest.filterGraceful': {
                type: 'boolean',
                default: defaults.filterGraceful,
                description: localize('suggest.filterGraceful', "Controls whether filtering and sorting suggestions accounts for small typos.")
            },
            'editor.suggest.localityBonus': {
                type: 'boolean',
                default: defaults.localityBonus,
                description: localize('suggest.localityBonus', "Controls whether sorting favors words that appear close to the cursor.")
            },
            'editor.suggest.shareSuggestSelections': {
                type: 'boolean',
                default: defaults.shareSuggestSelections,
                markdownDescription: localize('suggest.shareSuggestSelections', "Controls whether remembered suggestion selections are shared between multiple workspaces and windows (needs `#editor.suggestSelection#`).")
            },
            'editor.suggest.snippetsPreventQuickSuggestions': {
                type: 'boolean',
                default: defaults.snippetsPreventQuickSuggestions,
                description: localize('suggest.snippetsPreventQuickSuggestions', "Controls whether an active snippet prevents quick suggestions.")
            },
            'editor.suggest.showIcons': {
                type: 'boolean',
                default: defaults.showIcons,
                description: localize('suggest.showIcons', "Controls whether to show or hide icons in suggestions.")
            },
            'editor.suggest.showStatusBar': {
                type: 'boolean',
                default: defaults.showStatusBar,
                description: localize('suggest.showStatusBar', "Controls the visibility of the status bar at the bottom of the suggest widget.")
            },
            'editor.suggest.preview': {
                type: 'boolean',
                default: defaults.preview,
                description: localize('suggest.preview', "Controls whether to preview the suggestion outcome in the editor.")
            },
            'editor.suggest.showInlineDetails': {
                type: 'boolean',
                default: defaults.showInlineDetails,
                description: localize('suggest.showInlineDetails', "Controls whether suggest details show inline with the label or only in the details widget")
            },
            'editor.suggest.maxVisibleSuggestions': {
                type: 'number',
                deprecationMessage: localize('suggest.maxVisibleSuggestions.dep', "This setting is deprecated. The suggest widget can now be resized."),
            },
            'editor.suggest.filteredTypes': {
                type: 'object',
                deprecationMessage: localize('deprecated', "This setting is deprecated, please use separate settings like 'editor.suggest.showKeywords' or 'editor.suggest.showSnippets' instead.")
            },
            'editor.suggest.showMethods': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showMethods', "When enabled IntelliSense shows `method`-suggestions.")
            },
            'editor.suggest.showFunctions': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showFunctions', "When enabled IntelliSense shows `function`-suggestions.")
            },
            'editor.suggest.showConstructors': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showConstructors', "When enabled IntelliSense shows `constructor`-suggestions.")
            },
            'editor.suggest.showDeprecated': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showDeprecated', "When enabled IntelliSense shows `deprecated`-suggestions.")
            },
            'editor.suggest.showFields': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showFields', "When enabled IntelliSense shows `field`-suggestions.")
            },
            'editor.suggest.showVariables': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showVariables', "When enabled IntelliSense shows `variable`-suggestions.")
            },
            'editor.suggest.showClasses': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showClasss', "When enabled IntelliSense shows `class`-suggestions.")
            },
            'editor.suggest.showStructs': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showStructs', "When enabled IntelliSense shows `struct`-suggestions.")
            },
            'editor.suggest.showInterfaces': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showInterfaces', "When enabled IntelliSense shows `interface`-suggestions.")
            },
            'editor.suggest.showModules': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showModules', "When enabled IntelliSense shows `module`-suggestions.")
            },
            'editor.suggest.showProperties': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showPropertys', "When enabled IntelliSense shows `property`-suggestions.")
            },
            'editor.suggest.showEvents': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showEvents', "When enabled IntelliSense shows `event`-suggestions.")
            },
            'editor.suggest.showOperators': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showOperators', "When enabled IntelliSense shows `operator`-suggestions.")
            },
            'editor.suggest.showUnits': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showUnits', "When enabled IntelliSense shows `unit`-suggestions.")
            },
            'editor.suggest.showValues': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showValues', "When enabled IntelliSense shows `value`-suggestions.")
            },
            'editor.suggest.showConstants': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showConstants', "When enabled IntelliSense shows `constant`-suggestions.")
            },
            'editor.suggest.showEnums': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showEnums', "When enabled IntelliSense shows `enum`-suggestions.")
            },
            'editor.suggest.showEnumMembers': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showEnumMembers', "When enabled IntelliSense shows `enumMember`-suggestions.")
            },
            'editor.suggest.showKeywords': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showKeywords', "When enabled IntelliSense shows `keyword`-suggestions.")
            },
            'editor.suggest.showWords': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showTexts', "When enabled IntelliSense shows `text`-suggestions.")
            },
            'editor.suggest.showColors': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showColors', "When enabled IntelliSense shows `color`-suggestions.")
            },
            'editor.suggest.showFiles': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showFiles', "When enabled IntelliSense shows `file`-suggestions.")
            },
            'editor.suggest.showReferences': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showReferences', "When enabled IntelliSense shows `reference`-suggestions.")
            },
            'editor.suggest.showCustomcolors': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showCustomcolors', "When enabled IntelliSense shows `customcolor`-suggestions.")
            },
            'editor.suggest.showFolders': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showFolders', "When enabled IntelliSense shows `folder`-suggestions.")
            },
            'editor.suggest.showTypeParameters': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showTypeParameters', "When enabled IntelliSense shows `typeParameter`-suggestions.")
            },
            'editor.suggest.showSnippets': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showSnippets', "When enabled IntelliSense shows `snippet`-suggestions.")
            },
            'editor.suggest.showUsers': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showUsers', "When enabled IntelliSense shows `user`-suggestions.")
            },
            'editor.suggest.showIssues': {
                type: 'boolean',
                default: true,
                markdownDescription: localize('editor.suggest.showIssues', "When enabled IntelliSense shows `issues`-suggestions.")
            }
        });
    }
    validate(_input) {
        if (!_input || typeof _input !== 'object') {
            return this.defaultValue;
        }
        const input = _input;
        return {
            insertMode: stringSet(input.insertMode, this.defaultValue.insertMode, ['insert', 'replace']),
            filterGraceful: boolean(input.filterGraceful, this.defaultValue.filterGraceful),
            snippetsPreventQuickSuggestions: boolean(input.snippetsPreventQuickSuggestions, this.defaultValue.filterGraceful),
            localityBonus: boolean(input.localityBonus, this.defaultValue.localityBonus),
            shareSuggestSelections: boolean(input.shareSuggestSelections, this.defaultValue.shareSuggestSelections),
            showIcons: boolean(input.showIcons, this.defaultValue.showIcons),
            showStatusBar: boolean(input.showStatusBar, this.defaultValue.showStatusBar),
            preview: boolean(input.preview, this.defaultValue.preview),
            showInlineDetails: boolean(input.showInlineDetails, this.defaultValue.showInlineDetails),
            showMethods: boolean(input.showMethods, this.defaultValue.showMethods),
            showFunctions: boolean(input.showFunctions, this.defaultValue.showFunctions),
            showConstructors: boolean(input.showConstructors, this.defaultValue.showConstructors),
            showDeprecated: boolean(input.showDeprecated, this.defaultValue.showDeprecated),
            showFields: boolean(input.showFields, this.defaultValue.showFields),
            showVariables: boolean(input.showVariables, this.defaultValue.showVariables),
            showClasses: boolean(input.showClasses, this.defaultValue.showClasses),
            showStructs: boolean(input.showStructs, this.defaultValue.showStructs),
            showInterfaces: boolean(input.showInterfaces, this.defaultValue.showInterfaces),
            showModules: boolean(input.showModules, this.defaultValue.showModules),
            showProperties: boolean(input.showProperties, this.defaultValue.showProperties),
            showEvents: boolean(input.showEvents, this.defaultValue.showEvents),
            showOperators: boolean(input.showOperators, this.defaultValue.showOperators),
            showUnits: boolean(input.showUnits, this.defaultValue.showUnits),
            showValues: boolean(input.showValues, this.defaultValue.showValues),
            showConstants: boolean(input.showConstants, this.defaultValue.showConstants),
            showEnums: boolean(input.showEnums, this.defaultValue.showEnums),
            showEnumMembers: boolean(input.showEnumMembers, this.defaultValue.showEnumMembers),
            showKeywords: boolean(input.showKeywords, this.defaultValue.showKeywords),
            showWords: boolean(input.showWords, this.defaultValue.showWords),
            showColors: boolean(input.showColors, this.defaultValue.showColors),
            showFiles: boolean(input.showFiles, this.defaultValue.showFiles),
            showReferences: boolean(input.showReferences, this.defaultValue.showReferences),
            showFolders: boolean(input.showFolders, this.defaultValue.showFolders),
            showTypeParameters: boolean(input.showTypeParameters, this.defaultValue.showTypeParameters),
            showSnippets: boolean(input.showSnippets, this.defaultValue.showSnippets),
            showUsers: boolean(input.showUsers, this.defaultValue.showUsers),
            showIssues: boolean(input.showIssues, this.defaultValue.showIssues),
        };
    }
}
class SmartSelect extends BaseEditorOption {
    constructor() {
        super(100 /* smartSelect */, 'smartSelect', {
            selectLeadingAndTrailingWhitespace: true
        }, {
            'editor.smartSelect.selectLeadingAndTrailingWhitespace': {
                description: localize('selectLeadingAndTrailingWhitespace', "Whether leading and trailing whitespace should always be selected."),
                default: true,
                type: 'boolean'
            }
        });
    }
    validate(input) {
        if (!input || typeof input !== 'object') {
            return this.defaultValue;
        }
        return {
            selectLeadingAndTrailingWhitespace: boolean(input.selectLeadingAndTrailingWhitespace, this.defaultValue.selectLeadingAndTrailingWhitespace)
        };
    }
}
//#endregion
//#region tabFocusMode
class EditorTabFocusMode extends ComputedEditorOption {
    constructor() {
        super(127 /* tabFocusMode */, [78 /* readOnly */]);
    }
    compute(env, options, _) {
        const readOnly = options.get(78 /* readOnly */);
        return (readOnly ? true : env.tabFocusMode);
    }
}
function _wrappingIndentFromString(wrappingIndent) {
    switch (wrappingIndent) {
        case 'none': return 0 /* None */;
        case 'same': return 1 /* Same */;
        case 'indent': return 2 /* Indent */;
        case 'deepIndent': return 3 /* DeepIndent */;
    }
}
class EditorWrappingInfoComputer extends ComputedEditorOption {
    constructor() {
        super(129 /* wrappingInfo */, [128 /* layoutInfo */]);
    }
    compute(env, options, _) {
        const layoutInfo = options.get(128 /* layoutInfo */);
        return {
            isDominatedByLongLines: env.isDominatedByLongLines,
            isWordWrapMinified: layoutInfo.isWordWrapMinified,
            isViewportWrapping: layoutInfo.isViewportWrapping,
            wrappingColumn: layoutInfo.wrappingColumn,
        };
    }
}
//#endregion
const DEFAULT_WINDOWS_FONT_FAMILY = 'Consolas, \'Courier New\', monospace';
const DEFAULT_MAC_FONT_FAMILY = 'Menlo, Monaco, \'Courier New\', monospace';
const DEFAULT_LINUX_FONT_FAMILY = '\'Droid Sans Mono\', \'monospace\', monospace, \'Droid Sans Fallback\'';
/**
 * @internal
 */
const EDITOR_FONT_DEFAULTS = {
    fontFamily: (isMacintosh ? DEFAULT_MAC_FONT_FAMILY : (isLinux ? DEFAULT_LINUX_FONT_FAMILY : DEFAULT_WINDOWS_FONT_FAMILY)),
    fontWeight: 'normal',
    fontSize: (isMacintosh ? 12 : 14),
    lineHeight: 0,
    letterSpacing: 0,
};
/**
 * @internal
 */
const EDITOR_MODEL_DEFAULTS = {
    tabSize: 4,
    indentSize: 4,
    insertSpaces: true,
    detectIndentation: true,
    trimAutoWhitespace: true,
    largeFileOptimizations: true
};
/**
 * @internal
 */
const editorOptionsRegistry = [];
function register(option) {
    editorOptionsRegistry[option.id] = option;
    return option;
}
/**
 * WORKAROUND: TS emits "any" for complex editor options values (anything except string, bool, enum, etc. ends up being "any")
 * @monacodtsreplace
 * /accessibilitySupport, any/accessibilitySupport, AccessibilitySupport/
 * /comments, any/comments, EditorCommentsOptions/
 * /find, any/find, EditorFindOptions/
 * /fontInfo, any/fontInfo, FontInfo/
 * /gotoLocation, any/gotoLocation, GoToLocationOptions/
 * /hover, any/hover, EditorHoverOptions/
 * /lightbulb, any/lightbulb, EditorLightbulbOptions/
 * /minimap, any/minimap, EditorMinimapOptions/
 * /parameterHints, any/parameterHints, InternalParameterHintOptions/
 * /quickSuggestions, any/quickSuggestions, ValidQuickSuggestionsOptions/
 * /suggest, any/suggest, InternalSuggestOptions/
 */
const EditorOptions = {
    acceptSuggestionOnCommitCharacter: register(new EditorBooleanOption(0 /* acceptSuggestionOnCommitCharacter */, 'acceptSuggestionOnCommitCharacter', true, { markdownDescription: localize('acceptSuggestionOnCommitCharacter', "Controls whether suggestions should be accepted on commit characters. For example, in JavaScript, the semi-colon (`;`) can be a commit character that accepts a suggestion and types that character.") })),
    acceptSuggestionOnEnter: register(new EditorStringEnumOption(1 /* acceptSuggestionOnEnter */, 'acceptSuggestionOnEnter', 'on', ['on', 'smart', 'off'], {
        markdownEnumDescriptions: [
            '',
            localize('acceptSuggestionOnEnterSmart', "Only accept a suggestion with `Enter` when it makes a textual change."),
            ''
        ],
        markdownDescription: localize('acceptSuggestionOnEnter', "Controls whether suggestions should be accepted on `Enter`, in addition to `Tab`. Helps to avoid ambiguity between inserting new lines or accepting suggestions.")
    })),
    accessibilitySupport: register(new EditorAccessibilitySupport()),
    accessibilityPageSize: register(new EditorIntOption(3 /* accessibilityPageSize */, 'accessibilityPageSize', 10, 1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, {
        description: localize('accessibilityPageSize', "Controls the number of lines in the editor that can be read out by a screen reader at once. When we detect a screen reader we automatically set the default to be 500. Warning: this has a performance implication for numbers larger than the default.")
    })),
    ariaLabel: register(new EditorStringOption(4 /* ariaLabel */, 'ariaLabel', localize('editorViewAccessibleLabel', "Editor content"))),
    autoClosingBrackets: register(new EditorStringEnumOption(5 /* autoClosingBrackets */, 'autoClosingBrackets', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
        enumDescriptions: [
            '',
            localize('editor.autoClosingBrackets.languageDefined', "Use language configurations to determine when to autoclose brackets."),
            localize('editor.autoClosingBrackets.beforeWhitespace', "Autoclose brackets only when the cursor is to the left of whitespace."),
            '',
        ],
        description: localize('autoClosingBrackets', "Controls whether the editor should automatically close brackets after the user adds an opening bracket.")
    })),
    autoClosingDelete: register(new EditorStringEnumOption(6 /* autoClosingDelete */, 'autoClosingDelete', 'auto', ['always', 'auto', 'never'], {
        enumDescriptions: [
            '',
            localize('editor.autoClosingDelete.auto', "Remove adjacent closing quotes or brackets only if they were automatically inserted."),
            '',
        ],
        description: localize('autoClosingDelete', "Controls whether the editor should remove adjacent closing quotes or brackets when deleting.")
    })),
    autoClosingOvertype: register(new EditorStringEnumOption(7 /* autoClosingOvertype */, 'autoClosingOvertype', 'auto', ['always', 'auto', 'never'], {
        enumDescriptions: [
            '',
            localize('editor.autoClosingOvertype.auto', "Type over closing quotes or brackets only if they were automatically inserted."),
            '',
        ],
        description: localize('autoClosingOvertype', "Controls whether the editor should type over closing quotes or brackets.")
    })),
    autoClosingQuotes: register(new EditorStringEnumOption(8 /* autoClosingQuotes */, 'autoClosingQuotes', 'languageDefined', ['always', 'languageDefined', 'beforeWhitespace', 'never'], {
        enumDescriptions: [
            '',
            localize('editor.autoClosingQuotes.languageDefined', "Use language configurations to determine when to autoclose quotes."),
            localize('editor.autoClosingQuotes.beforeWhitespace', "Autoclose quotes only when the cursor is to the left of whitespace."),
            '',
        ],
        description: localize('autoClosingQuotes', "Controls whether the editor should automatically close quotes after the user adds an opening quote.")
    })),
    autoIndent: register(new EditorEnumOption(9 /* autoIndent */, 'autoIndent', 4 /* Full */, 'full', ['none', 'keep', 'brackets', 'advanced', 'full'], _autoIndentFromString, {
        enumDescriptions: [
            localize('editor.autoIndent.none', "The editor will not insert indentation automatically."),
            localize('editor.autoIndent.keep', "The editor will keep the current line's indentation."),
            localize('editor.autoIndent.brackets', "The editor will keep the current line's indentation and honor language defined brackets."),
            localize('editor.autoIndent.advanced', "The editor will keep the current line's indentation, honor language defined brackets and invoke special onEnterRules defined by languages."),
            localize('editor.autoIndent.full', "The editor will keep the current line's indentation, honor language defined brackets, invoke special onEnterRules defined by languages, and honor indentationRules defined by languages."),
        ],
        description: localize('autoIndent', "Controls whether the editor should automatically adjust the indentation when users type, paste, move or indent lines.")
    })),
    automaticLayout: register(new EditorBooleanOption(10 /* automaticLayout */, 'automaticLayout', false)),
    autoSurround: register(new EditorStringEnumOption(11 /* autoSurround */, 'autoSurround', 'languageDefined', ['languageDefined', 'quotes', 'brackets', 'never'], {
        enumDescriptions: [
            localize('editor.autoSurround.languageDefined', "Use language configurations to determine when to automatically surround selections."),
            localize('editor.autoSurround.quotes', "Surround with quotes but not brackets."),
            localize('editor.autoSurround.brackets', "Surround with brackets but not quotes."),
            ''
        ],
        description: localize('autoSurround', "Controls whether the editor should automatically surround selections when typing quotes or brackets.")
    })),
    stickyTabStops: register(new EditorBooleanOption(102 /* stickyTabStops */, 'stickyTabStops', false, { description: localize('stickyTabStops', "Emulate selection behavior of tab characters when using spaces for indentation. Selection will stick to tab stops.") })),
    codeLens: register(new EditorBooleanOption(12 /* codeLens */, 'codeLens', true, { description: localize('codeLens', "Controls whether the editor shows CodeLens.") })),
    codeLensFontFamily: register(new EditorStringOption(13 /* codeLensFontFamily */, 'codeLensFontFamily', '', { description: localize('codeLensFontFamily', "Controls the font family for CodeLens.") })),
    codeLensFontSize: register(new EditorIntOption(14 /* codeLensFontSize */, 'codeLensFontSize', 0, 0, 100, {
        type: 'number',
        default: 0,
        minimum: 0,
        maximum: 100,
        description: localize('codeLensFontSize', "Controls the font size in pixels for CodeLens. When set to `0`, the 90% of `#editor.fontSize#` is used.")
    })),
    colorDecorators: register(new EditorBooleanOption(15 /* colorDecorators */, 'colorDecorators', true, { description: localize('colorDecorators', "Controls whether the editor should render the inline color decorators and color picker.") })),
    columnSelection: register(new EditorBooleanOption(16 /* columnSelection */, 'columnSelection', false, { description: localize('columnSelection', "Enable that the selection with the mouse and keys is doing column selection.") })),
    comments: register(new EditorComments()),
    contextmenu: register(new EditorBooleanOption(18 /* contextmenu */, 'contextmenu', true)),
    copyWithSyntaxHighlighting: register(new EditorBooleanOption(19 /* copyWithSyntaxHighlighting */, 'copyWithSyntaxHighlighting', true, { description: localize('copyWithSyntaxHighlighting', "Controls whether syntax highlighting should be copied into the clipboard.") })),
    cursorBlinking: register(new EditorEnumOption(20 /* cursorBlinking */, 'cursorBlinking', 1 /* Blink */, 'blink', ['blink', 'smooth', 'phase', 'expand', 'solid'], _cursorBlinkingStyleFromString, { description: localize('cursorBlinking', "Control the cursor animation style.") })),
    cursorSmoothCaretAnimation: register(new EditorBooleanOption(21 /* cursorSmoothCaretAnimation */, 'cursorSmoothCaretAnimation', false, { description: localize('cursorSmoothCaretAnimation', "Controls whether the smooth caret animation should be enabled.") })),
    cursorStyle: register(new EditorEnumOption(22 /* cursorStyle */, 'cursorStyle', TextEditorCursorStyle.Line, 'line', ['line', 'block', 'underline', 'line-thin', 'block-outline', 'underline-thin'], _cursorStyleFromString, { description: localize('cursorStyle', "Controls the cursor style.") })),
    cursorSurroundingLines: register(new EditorIntOption(23 /* cursorSurroundingLines */, 'cursorSurroundingLines', 0, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, { description: localize('cursorSurroundingLines', "Controls the minimal number of visible leading and trailing lines surrounding the cursor. Known as 'scrollOff' or 'scrollOffset' in some other editors.") })),
    cursorSurroundingLinesStyle: register(new EditorStringEnumOption(24 /* cursorSurroundingLinesStyle */, 'cursorSurroundingLinesStyle', 'default', ['default', 'all'], {
        enumDescriptions: [
            localize('cursorSurroundingLinesStyle.default', "`cursorSurroundingLines` is enforced only when triggered via the keyboard or API."),
            localize('cursorSurroundingLinesStyle.all', "`cursorSurroundingLines` is enforced always.")
        ],
        description: localize('cursorSurroundingLinesStyle', "Controls when `cursorSurroundingLines` should be enforced.")
    })),
    cursorWidth: register(new EditorIntOption(25 /* cursorWidth */, 'cursorWidth', 0, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, { markdownDescription: localize('cursorWidth', "Controls the width of the cursor when `#editor.cursorStyle#` is set to `line`.") })),
    disableLayerHinting: register(new EditorBooleanOption(26 /* disableLayerHinting */, 'disableLayerHinting', false)),
    disableMonospaceOptimizations: register(new EditorBooleanOption(27 /* disableMonospaceOptimizations */, 'disableMonospaceOptimizations', false)),
    domReadOnly: register(new EditorBooleanOption(28 /* domReadOnly */, 'domReadOnly', false)),
    dragAndDrop: register(new EditorBooleanOption(29 /* dragAndDrop */, 'dragAndDrop', true, { description: localize('dragAndDrop', "Controls whether the editor should allow moving selections via drag and drop.") })),
    emptySelectionClipboard: register(new EditorEmptySelectionClipboard()),
    extraEditorClassName: register(new EditorStringOption(31 /* extraEditorClassName */, 'extraEditorClassName', '')),
    fastScrollSensitivity: register(new EditorFloatOption(32 /* fastScrollSensitivity */, 'fastScrollSensitivity', 5, x => (x <= 0 ? 5 : x), { markdownDescription: localize('fastScrollSensitivity', "Scrolling speed multiplier when pressing `Alt`.") })),
    find: register(new EditorFind()),
    fixedOverflowWidgets: register(new EditorBooleanOption(34 /* fixedOverflowWidgets */, 'fixedOverflowWidgets', false)),
    folding: register(new EditorBooleanOption(35 /* folding */, 'folding', true, { description: localize('folding', "Controls whether the editor has code folding enabled.") })),
    foldingStrategy: register(new EditorStringEnumOption(36 /* foldingStrategy */, 'foldingStrategy', 'auto', ['auto', 'indentation'], {
        enumDescriptions: [
            localize('foldingStrategy.auto', "Use a language-specific folding strategy if available, else the indentation-based one."),
            localize('foldingStrategy.indentation', "Use the indentation-based folding strategy."),
        ],
        description: localize('foldingStrategy', "Controls the strategy for computing folding ranges.")
    })),
    foldingHighlight: register(new EditorBooleanOption(37 /* foldingHighlight */, 'foldingHighlight', true, { description: localize('foldingHighlight', "Controls whether the editor should highlight folded ranges.") })),
    unfoldOnClickAfterEndOfLine: register(new EditorBooleanOption(38 /* unfoldOnClickAfterEndOfLine */, 'unfoldOnClickAfterEndOfLine', false, { description: localize('unfoldOnClickAfterEndOfLine', "Controls whether clicking on the empty content after a folded line will unfold the line.") })),
    fontFamily: register(new EditorStringOption(39 /* fontFamily */, 'fontFamily', EDITOR_FONT_DEFAULTS.fontFamily, { description: localize('fontFamily', "Controls the font family.") })),
    fontInfo: register(new EditorFontInfo()),
    fontLigatures2: register(new EditorFontLigatures()),
    fontSize: register(new EditorFontSize()),
    fontWeight: register(new EditorFontWeight()),
    formatOnPaste: register(new EditorBooleanOption(44 /* formatOnPaste */, 'formatOnPaste', false, { description: localize('formatOnPaste', "Controls whether the editor should automatically format the pasted content. A formatter must be available and the formatter should be able to format a range in a document.") })),
    formatOnType: register(new EditorBooleanOption(45 /* formatOnType */, 'formatOnType', false, { description: localize('formatOnType', "Controls whether the editor should automatically format the line after typing.") })),
    glyphMargin: register(new EditorBooleanOption(46 /* glyphMargin */, 'glyphMargin', true, { description: localize('glyphMargin', "Controls whether the editor should render the vertical glyph margin. Glyph margin is mostly used for debugging.") })),
    gotoLocation: register(new EditorGoToLocation()),
    hideCursorInOverviewRuler: register(new EditorBooleanOption(48 /* hideCursorInOverviewRuler */, 'hideCursorInOverviewRuler', false, { description: localize('hideCursorInOverviewRuler', "Controls whether the cursor should be hidden in the overview ruler.") })),
    highlightActiveIndentGuide: register(new EditorBooleanOption(49 /* highlightActiveIndentGuide */, 'highlightActiveIndentGuide', true, { description: localize('highlightActiveIndentGuide', "Controls whether the editor should highlight the active indent guide.") })),
    hover: register(new EditorHover()),
    inDiffEditor: register(new EditorBooleanOption(51 /* inDiffEditor */, 'inDiffEditor', false)),
    letterSpacing: register(new EditorFloatOption(53 /* letterSpacing */, 'letterSpacing', EDITOR_FONT_DEFAULTS.letterSpacing, x => EditorFloatOption.clamp(x, -5, 20), { description: localize('letterSpacing', "Controls the letter spacing in pixels.") })),
    lightbulb: register(new EditorLightbulb()),
    lineDecorationsWidth: register(new SimpleEditorOption(55 /* lineDecorationsWidth */, 'lineDecorationsWidth', 10)),
    lineHeight: register(new EditorLineHeight()),
    lineNumbers: register(new EditorRenderLineNumbersOption()),
    lineNumbersMinChars: register(new EditorIntOption(58 /* lineNumbersMinChars */, 'lineNumbersMinChars', 5, 1, 300)),
    linkedEditing: register(new EditorBooleanOption(59 /* linkedEditing */, 'linkedEditing', false, { description: localize('linkedEditing', "Controls whether the editor has linked editing enabled. Depending on the language, related symbols, e.g. HTML tags, are updated while editing.") })),
    links: register(new EditorBooleanOption(60 /* links */, 'links', true, { description: localize('links', "Controls whether the editor should detect links and make them clickable.") })),
    matchBrackets: register(new EditorStringEnumOption(61 /* matchBrackets */, 'matchBrackets', 'always', ['always', 'near', 'never'], { description: localize('matchBrackets', "Highlight matching brackets.") })),
    minimap: register(new EditorMinimap()),
    mouseStyle: register(new EditorStringEnumOption(63 /* mouseStyle */, 'mouseStyle', 'text', ['text', 'default', 'copy'])),
    mouseWheelScrollSensitivity: register(new EditorFloatOption(64 /* mouseWheelScrollSensitivity */, 'mouseWheelScrollSensitivity', 1, x => (x === 0 ? 1 : x), { markdownDescription: localize('mouseWheelScrollSensitivity', "A multiplier to be used on the `deltaX` and `deltaY` of mouse wheel scroll events.") })),
    mouseWheelZoom: register(new EditorBooleanOption(65 /* mouseWheelZoom */, 'mouseWheelZoom', false, { markdownDescription: localize('mouseWheelZoom', "Zoom the font of the editor when using mouse wheel and holding `Ctrl`.") })),
    multiCursorMergeOverlapping: register(new EditorBooleanOption(66 /* multiCursorMergeOverlapping */, 'multiCursorMergeOverlapping', true, { description: localize('multiCursorMergeOverlapping', "Merge multiple cursors when they are overlapping.") })),
    multiCursorModifier: register(new EditorEnumOption(67 /* multiCursorModifier */, 'multiCursorModifier', 'altKey', 'alt', ['ctrlCmd', 'alt'], _multiCursorModifierFromString, {
        markdownEnumDescriptions: [
            localize('multiCursorModifier.ctrlCmd', "Maps to `Control` on Windows and Linux and to `Command` on macOS."),
            localize('multiCursorModifier.alt', "Maps to `Alt` on Windows and Linux and to `Option` on macOS.")
        ],
        markdownDescription: localize({
            key: 'multiCursorModifier',
            comment: [
                '- `ctrlCmd` refers to a value the setting can take and should not be localized.',
                '- `Control` and `Command` refer to the modifier keys Ctrl or Cmd on the keyboard and can be localized.'
            ]
        }, "The modifier to be used to add multiple cursors with the mouse. The Go To Definition and Open Link mouse gestures will adapt such that they do not conflict with the multicursor modifier. [Read more](https://code.visualstudio.com/docs/editor/codebasics#_multicursor-modifier).")
    })),
    multiCursorPaste: register(new EditorStringEnumOption(68 /* multiCursorPaste */, 'multiCursorPaste', 'spread', ['spread', 'full'], {
        markdownEnumDescriptions: [
            localize('multiCursorPaste.spread', "Each cursor pastes a single line of the text."),
            localize('multiCursorPaste.full', "Each cursor pastes the full text.")
        ],
        markdownDescription: localize('multiCursorPaste', "Controls pasting when the line count of the pasted text matches the cursor count.")
    })),
    occurrencesHighlight: register(new EditorBooleanOption(69 /* occurrencesHighlight */, 'occurrencesHighlight', true, { description: localize('occurrencesHighlight', "Controls whether the editor should highlight semantic symbol occurrences.") })),
    overviewRulerBorder: register(new EditorBooleanOption(70 /* overviewRulerBorder */, 'overviewRulerBorder', true, { description: localize('overviewRulerBorder', "Controls whether a border should be drawn around the overview ruler.") })),
    overviewRulerLanes: register(new EditorIntOption(71 /* overviewRulerLanes */, 'overviewRulerLanes', 3, 0, 3)),
    padding: register(new EditorPadding()),
    parameterHints: register(new EditorParameterHints()),
    peekWidgetDefaultFocus: register(new EditorStringEnumOption(74 /* peekWidgetDefaultFocus */, 'peekWidgetDefaultFocus', 'tree', ['tree', 'editor'], {
        enumDescriptions: [
            localize('peekWidgetDefaultFocus.tree', "Focus the tree when opening peek"),
            localize('peekWidgetDefaultFocus.editor', "Focus the editor when opening peek")
        ],
        description: localize('peekWidgetDefaultFocus', "Controls whether to focus the inline editor or the tree in the peek widget.")
    })),
    definitionLinkOpensInPeek: register(new EditorBooleanOption(75 /* definitionLinkOpensInPeek */, 'definitionLinkOpensInPeek', false, { description: localize('definitionLinkOpensInPeek', "Controls whether the Go to Definition mouse gesture always opens the peek widget.") })),
    quickSuggestions: register(new EditorQuickSuggestions()),
    quickSuggestionsDelay: register(new EditorIntOption(77 /* quickSuggestionsDelay */, 'quickSuggestionsDelay', 10, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, { description: localize('quickSuggestionsDelay', "Controls the delay in milliseconds after which quick suggestions will show up.") })),
    readOnly: register(new EditorBooleanOption(78 /* readOnly */, 'readOnly', false)),
    renameOnType: register(new EditorBooleanOption(79 /* renameOnType */, 'renameOnType', false, { description: localize('renameOnType', "Controls whether the editor auto renames on type."), markdownDeprecationMessage: localize('renameOnTypeDeprecate', "Deprecated, use `editor.linkedEditing` instead.") })),
    renderControlCharacters: register(new EditorBooleanOption(80 /* renderControlCharacters */, 'renderControlCharacters', false, { description: localize('renderControlCharacters', "Controls whether the editor should render control characters.") })),
    renderIndentGuides: register(new EditorBooleanOption(81 /* renderIndentGuides */, 'renderIndentGuides', true, { description: localize('renderIndentGuides', "Controls whether the editor should render indent guides.") })),
    renderFinalNewline: register(new EditorBooleanOption(82 /* renderFinalNewline */, 'renderFinalNewline', true, { description: localize('renderFinalNewline', "Render last line number when the file ends with a newline.") })),
    renderLineHighlight: register(new EditorStringEnumOption(83 /* renderLineHighlight */, 'renderLineHighlight', 'line', ['none', 'gutter', 'line', 'all'], {
        enumDescriptions: [
            '',
            '',
            '',
            localize('renderLineHighlight.all', "Highlights both the gutter and the current line."),
        ],
        description: localize('renderLineHighlight', "Controls how the editor should render the current line highlight.")
    })),
    renderLineHighlightOnlyWhenFocus: register(new EditorBooleanOption(84 /* renderLineHighlightOnlyWhenFocus */, 'renderLineHighlightOnlyWhenFocus', false, { description: localize('renderLineHighlightOnlyWhenFocus', "Controls if the editor should render the current line highlight only when the editor is focused.") })),
    renderValidationDecorations: register(new EditorStringEnumOption(85 /* renderValidationDecorations */, 'renderValidationDecorations', 'editable', ['editable', 'on', 'off'])),
    renderWhitespace: register(new EditorStringEnumOption(86 /* renderWhitespace */, 'renderWhitespace', 'selection', ['none', 'boundary', 'selection', 'trailing', 'all'], {
        enumDescriptions: [
            '',
            localize('renderWhitespace.boundary', "Render whitespace characters except for single spaces between words."),
            localize('renderWhitespace.selection', "Render whitespace characters only on selected text."),
            localize('renderWhitespace.trailing', "Render only trailing whitespace characters."),
            ''
        ],
        description: localize('renderWhitespace', "Controls how the editor should render whitespace characters.")
    })),
    revealHorizontalRightPadding: register(new EditorIntOption(87 /* revealHorizontalRightPadding */, 'revealHorizontalRightPadding', 30, 0, 1000)),
    roundedSelection: register(new EditorBooleanOption(88 /* roundedSelection */, 'roundedSelection', true, { description: localize('roundedSelection', "Controls whether selections should have rounded corners.") })),
    rulers: register(new EditorRulers()),
    scrollbar: register(new EditorScrollbar()),
    scrollBeyondLastColumn: register(new EditorIntOption(91 /* scrollBeyondLastColumn */, 'scrollBeyondLastColumn', 5, 0, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, { description: localize('scrollBeyondLastColumn', "Controls the number of extra characters beyond which the editor will scroll horizontally.") })),
    scrollBeyondLastLine: register(new EditorBooleanOption(92 /* scrollBeyondLastLine */, 'scrollBeyondLastLine', true, { description: localize('scrollBeyondLastLine', "Controls whether the editor will scroll beyond the last line.") })),
    scrollPredominantAxis: register(new EditorBooleanOption(93 /* scrollPredominantAxis */, 'scrollPredominantAxis', true, { description: localize('scrollPredominantAxis', "Scroll only along the predominant axis when scrolling both vertically and horizontally at the same time. Prevents horizontal drift when scrolling vertically on a trackpad.") })),
    selectionClipboard: register(new EditorBooleanOption(94 /* selectionClipboard */, 'selectionClipboard', true, {
        description: localize('selectionClipboard', "Controls whether the Linux primary clipboard should be supported."),
        included: isLinux
    })),
    selectionHighlight: register(new EditorBooleanOption(95 /* selectionHighlight */, 'selectionHighlight', true, { description: localize('selectionHighlight', "Controls whether the editor should highlight matches similar to the selection.") })),
    selectOnLineNumbers: register(new EditorBooleanOption(96 /* selectOnLineNumbers */, 'selectOnLineNumbers', true)),
    showFoldingControls: register(new EditorStringEnumOption(97 /* showFoldingControls */, 'showFoldingControls', 'mouseover', ['always', 'mouseover'], {
        enumDescriptions: [
            localize('showFoldingControls.always', "Always show the folding controls."),
            localize('showFoldingControls.mouseover', "Only show the folding controls when the mouse is over the gutter."),
        ],
        description: localize('showFoldingControls', "Controls when the folding controls on the gutter are shown.")
    })),
    showUnused: register(new EditorBooleanOption(98 /* showUnused */, 'showUnused', true, { description: localize('showUnused', "Controls fading out of unused code.") })),
    showDeprecated: register(new EditorBooleanOption(123 /* showDeprecated */, 'showDeprecated', true, { description: localize('showDeprecated', "Controls strikethrough deprecated variables.") })),
    inlayHints: register(new EditorInlayHints()),
    snippetSuggestions: register(new EditorStringEnumOption(99 /* snippetSuggestions */, 'snippetSuggestions', 'inline', ['top', 'bottom', 'inline', 'none'], {
        enumDescriptions: [
            localize('snippetSuggestions.top', "Show snippet suggestions on top of other suggestions."),
            localize('snippetSuggestions.bottom', "Show snippet suggestions below other suggestions."),
            localize('snippetSuggestions.inline', "Show snippets suggestions with other suggestions."),
            localize('snippetSuggestions.none', "Do not show snippet suggestions."),
        ],
        description: localize('snippetSuggestions', "Controls whether snippets are shown with other suggestions and how they are sorted.")
    })),
    smartSelect: register(new SmartSelect()),
    smoothScrolling: register(new EditorBooleanOption(101 /* smoothScrolling */, 'smoothScrolling', false, { description: localize('smoothScrolling', "Controls whether the editor will scroll using an animation.") })),
    stopRenderingLineAfter: register(new EditorIntOption(103 /* stopRenderingLineAfter */, 'stopRenderingLineAfter', 10000, -1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */)),
    suggest: register(new EditorSuggest()),
    inlineSuggest: register(new InlineEditorSuggest()),
    suggestFontSize: register(new EditorIntOption(105 /* suggestFontSize */, 'suggestFontSize', 0, 0, 1000, { markdownDescription: localize('suggestFontSize', "Font size for the suggest widget. When set to `0`, the value of `#editor.fontSize#` is used.") })),
    suggestLineHeight: register(new EditorIntOption(106 /* suggestLineHeight */, 'suggestLineHeight', 0, 0, 1000, { markdownDescription: localize('suggestLineHeight', "Line height for the suggest widget. When set to `0`, the value of `#editor.lineHeight#` is used. The minimum value is 8.") })),
    suggestOnTriggerCharacters: register(new EditorBooleanOption(107 /* suggestOnTriggerCharacters */, 'suggestOnTriggerCharacters', true, { description: localize('suggestOnTriggerCharacters', "Controls whether suggestions should automatically show up when typing trigger characters.") })),
    suggestSelection: register(new EditorStringEnumOption(108 /* suggestSelection */, 'suggestSelection', 'recentlyUsed', ['first', 'recentlyUsed', 'recentlyUsedByPrefix'], {
        markdownEnumDescriptions: [
            localize('suggestSelection.first', "Always select the first suggestion."),
            localize('suggestSelection.recentlyUsed', "Select recent suggestions unless further typing selects one, e.g. `console.| -> console.log` because `log` has been completed recently."),
            localize('suggestSelection.recentlyUsedByPrefix', "Select suggestions based on previous prefixes that have completed those suggestions, e.g. `co -> console` and `con -> const`."),
        ],
        description: localize('suggestSelection', "Controls how suggestions are pre-selected when showing the suggest list.")
    })),
    tabCompletion: register(new EditorStringEnumOption(109 /* tabCompletion */, 'tabCompletion', 'off', ['on', 'off', 'onlySnippets'], {
        enumDescriptions: [
            localize('tabCompletion.on', "Tab complete will insert the best matching suggestion when pressing tab."),
            localize('tabCompletion.off', "Disable tab completions."),
            localize('tabCompletion.onlySnippets', "Tab complete snippets when their prefix match. Works best when 'quickSuggestions' aren't enabled."),
        ],
        description: localize('tabCompletion', "Enables tab completions.")
    })),
    tabIndex: register(new EditorIntOption(110 /* tabIndex */, 'tabIndex', 0, -1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */)),
    unusualLineTerminators: register(new EditorStringEnumOption(111 /* unusualLineTerminators */, 'unusualLineTerminators', 'prompt', ['auto', 'off', 'prompt'], {
        enumDescriptions: [
            localize('unusualLineTerminators.auto', "Unusual line terminators are automatically removed."),
            localize('unusualLineTerminators.off', "Unusual line terminators are ignored."),
            localize('unusualLineTerminators.prompt', "Unusual line terminators prompt to be removed."),
        ],
        description: localize('unusualLineTerminators', "Remove unusual line terminators that might cause problems.")
    })),
    useShadowDOM: register(new EditorBooleanOption(112 /* useShadowDOM */, 'useShadowDOM', true)),
    useTabStops: register(new EditorBooleanOption(113 /* useTabStops */, 'useTabStops', true, { description: localize('useTabStops', "Inserting and deleting whitespace follows tab stops.") })),
    wordSeparators: register(new EditorStringOption(114 /* wordSeparators */, 'wordSeparators', USUAL_WORD_SEPARATORS, { description: localize('wordSeparators', "Characters that will be used as word separators when doing word related navigations or operations.") })),
    wordWrap: register(new EditorStringEnumOption(115 /* wordWrap */, 'wordWrap', 'off', ['off', 'on', 'wordWrapColumn', 'bounded'], {
        markdownEnumDescriptions: [
            localize('wordWrap.off', "Lines will never wrap."),
            localize('wordWrap.on', "Lines will wrap at the viewport width."),
            localize({
                key: 'wordWrap.wordWrapColumn',
                comment: [
                    '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
                ]
            }, "Lines will wrap at `#editor.wordWrapColumn#`."),
            localize({
                key: 'wordWrap.bounded',
                comment: [
                    '- viewport means the edge of the visible window size.',
                    '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
                ]
            }, "Lines will wrap at the minimum of viewport and `#editor.wordWrapColumn#`."),
        ],
        description: localize({
            key: 'wordWrap',
            comment: [
                '- \'off\', \'on\', \'wordWrapColumn\' and \'bounded\' refer to values the setting can take and should not be localized.',
                '- `editor.wordWrapColumn` refers to a different setting and should not be localized.'
            ]
        }, "Controls how lines should wrap.")
    })),
    wordWrapBreakAfterCharacters: register(new EditorStringOption(116 /* wordWrapBreakAfterCharacters */, 'wordWrapBreakAfterCharacters', ' \t})]?|/&.,;¢°′″‰℃、。｡､￠，．：；？！％・･ゝゞヽヾーァィゥェォッャュョヮヵヶぁぃぅぇぉっゃゅょゎゕゖㇰㇱㇲㇳㇴㇵㇶㇷㇸㇹㇺㇻㇼㇽㇾㇿ々〻ｧｨｩｪｫｬｭｮｯｰ”〉》」』】〕）］｝｣')),
    wordWrapBreakBeforeCharacters: register(new EditorStringOption(117 /* wordWrapBreakBeforeCharacters */, 'wordWrapBreakBeforeCharacters', '([{‘“〈《「『【〔（［｛｢£¥＄￡￥+＋')),
    wordWrapColumn: register(new EditorIntOption(118 /* wordWrapColumn */, 'wordWrapColumn', 80, 1, 1073741824 /* MAX_SAFE_SMALL_INTEGER */, {
        markdownDescription: localize({
            key: 'wordWrapColumn',
            comment: [
                '- `editor.wordWrap` refers to a different setting and should not be localized.',
                '- \'wordWrapColumn\' and \'bounded\' refer to values the different setting can take and should not be localized.'
            ]
        }, "Controls the wrapping column of the editor when `#editor.wordWrap#` is `wordWrapColumn` or `bounded`.")
    })),
    wordWrapOverride1: register(new EditorStringEnumOption(119 /* wordWrapOverride1 */, 'wordWrapOverride1', 'inherit', ['off', 'on', 'inherit'])),
    wordWrapOverride2: register(new EditorStringEnumOption(120 /* wordWrapOverride2 */, 'wordWrapOverride2', 'inherit', ['off', 'on', 'inherit'])),
    wrappingIndent: register(new EditorEnumOption(121 /* wrappingIndent */, 'wrappingIndent', 1 /* Same */, 'same', ['none', 'same', 'indent', 'deepIndent'], _wrappingIndentFromString, {
        enumDescriptions: [
            localize('wrappingIndent.none', "No indentation. Wrapped lines begin at column 1."),
            localize('wrappingIndent.same', "Wrapped lines get the same indentation as the parent."),
            localize('wrappingIndent.indent', "Wrapped lines get +1 indentation toward the parent."),
            localize('wrappingIndent.deepIndent', "Wrapped lines get +2 indentation toward the parent."),
        ],
        description: localize('wrappingIndent', "Controls the indentation of wrapped lines."),
    })),
    wrappingStrategy: register(new EditorStringEnumOption(122 /* wrappingStrategy */, 'wrappingStrategy', 'simple', ['simple', 'advanced'], {
        enumDescriptions: [
            localize('wrappingStrategy.simple', "Assumes that all characters are of the same width. This is a fast algorithm that works correctly for monospace fonts and certain scripts (like Latin characters) where glyphs are of equal width."),
            localize('wrappingStrategy.advanced', "Delegates wrapping points computation to the browser. This is a slow algorithm, that might cause freezes for large files, but it works correctly in all cases.")
        ],
        description: localize('wrappingStrategy', "Controls the algorithm that computes wrapping points.")
    })),
    // Leave these at the end (because they have dependencies!)
    editorClassName: register(new EditorClassName()),
    pixelRatio: register(new EditorPixelRatio()),
    tabFocusMode: register(new EditorTabFocusMode()),
    layoutInfo: register(new EditorLayoutInfoComputer()),
    wrappingInfo: register(new EditorWrappingInfoComputer())
};

// Avoid circular dependency on EventEmitter by implementing a subset of the interface.
class ErrorHandler {
    constructor() {
        this.listeners = [];
        this.unexpectedErrorHandler = function (e) {
            setTimeout(() => {
                if (e.stack) {
                    throw new Error(e.message + '\n\n' + e.stack);
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
    // For external errors, we don't want the listeners to be called
    onUnexpectedExternalError(e) {
        this.unexpectedErrorHandler(e);
    }
}
const errorHandler = new ErrorHandler();
function onUnexpectedError(e) {
    // ignore errors from cancelled promises
    if (!isPromiseCanceledError(e)) {
        errorHandler.onUnexpectedError(e);
    }
    return undefined;
}
function onUnexpectedExternalError(e) {
    // ignore errors from cancelled promises
    if (!isPromiseCanceledError(e)) {
        errorHandler.onUnexpectedExternalError(e);
    }
    return undefined;
}
function transformErrorForSerialization(error) {
    if (error instanceof Error) {
        let { name, message } = error;
        const stack = error.stacktrace || error.stack;
        return {
            $isError: true,
            name,
            message,
            stack
        };
    }
    // return as is
    return error;
}
const canceledName = 'Canceled';
/**
 * Checks if the given error is a promise in canceled state
 */
function isPromiseCanceledError(error) {
    return error instanceof Error && error.name === canceledName && error.message === canceledName;
}
/**
 * Returns an error that signals cancellation.
 */
function canceled() {
    const error = new Error(canceledName);
    error.name = error.message;
    return error;
}
function illegalArgument(name) {
    if (name) {
        return new Error(`Illegal argument: ${name}`);
    }
    else {
        return new Error('Illegal argument');
    }
}
function illegalState(name) {
    if (name) {
        return new Error(`Illegal state: ${name}`);
    }
    else {
        return new Error('Illegal state');
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var Iterable;
(function (Iterable) {
    function is(thing) {
        return thing && typeof thing === 'object' && typeof thing[Symbol.iterator] === 'function';
    }
    Iterable.is = is;
    const _empty = Object.freeze([]);
    function empty() {
        return _empty;
    }
    Iterable.empty = empty;
    function* single(element) {
        yield element;
    }
    Iterable.single = single;
    function from(iterable) {
        return iterable || _empty;
    }
    Iterable.from = from;
    function isEmpty(iterable) {
        return !iterable || iterable[Symbol.iterator]().next().done === true;
    }
    Iterable.isEmpty = isEmpty;
    function first(iterable) {
        return iterable[Symbol.iterator]().next().value;
    }
    Iterable.first = first;
    function some(iterable, predicate) {
        for (const element of iterable) {
            if (predicate(element)) {
                return true;
            }
        }
        return false;
    }
    Iterable.some = some;
    function find(iterable, predicate) {
        for (const element of iterable) {
            if (predicate(element)) {
                return element;
            }
        }
        return undefined;
    }
    Iterable.find = find;
    function* filter(iterable, predicate) {
        for (const element of iterable) {
            if (predicate(element)) {
                yield element;
            }
        }
    }
    Iterable.filter = filter;
    function* map(iterable, fn) {
        let index = 0;
        for (const element of iterable) {
            yield fn(element, index++);
        }
    }
    Iterable.map = map;
    function* concat(...iterables) {
        for (const iterable of iterables) {
            for (const element of iterable) {
                yield element;
            }
        }
    }
    Iterable.concat = concat;
    function* concatNested(iterables) {
        for (const iterable of iterables) {
            for (const element of iterable) {
                yield element;
            }
        }
    }
    Iterable.concatNested = concatNested;
    function reduce(iterable, reducer, initialValue) {
        let value = initialValue;
        for (const element of iterable) {
            value = reducer(value, element);
        }
        return value;
    }
    Iterable.reduce = reduce;
    /**
     * Returns an iterable slice of the array, with the same semantics as `array.slice()`.
     */
    function* slice(arr, from, to = arr.length) {
        if (from < 0) {
            from += arr.length;
        }
        if (to < 0) {
            to += arr.length;
        }
        else if (to > arr.length) {
            to = arr.length;
        }
        for (; from < to; from++) {
            yield arr[from];
        }
    }
    Iterable.slice = slice;
    /**
     * Consumes `atMost` elements from iterable and returns the consumed elements,
     * and an iterable for the rest of the elements.
     */
    function consume(iterable, atMost = Number.POSITIVE_INFINITY) {
        const consumed = [];
        if (atMost === 0) {
            return [consumed, iterable];
        }
        const iterator = iterable[Symbol.iterator]();
        for (let i = 0; i < atMost; i++) {
            const next = iterator.next();
            if (next.done) {
                return [consumed, Iterable.empty()];
            }
            consumed.push(next.value);
        }
        return [consumed, { [Symbol.iterator]() { return iterator; } }];
    }
    Iterable.consume = consume;
    /**
     * Returns whether the iterables are the same length and all items are
     * equal using the comparator function.
     */
    function equals(a, b, comparator = (at, bt) => at === bt) {
        const ai = a[Symbol.iterator]();
        const bi = b[Symbol.iterator]();
        while (true) {
            const an = ai.next();
            const bn = bi.next();
            if (an.done !== bn.done) {
                return false;
            }
            else if (an.done) {
                return true;
            }
            else if (!comparator(an.value, bn.value)) {
                return false;
            }
        }
    }
    Iterable.equals = equals;
})(Iterable || (Iterable = {}));

function markTracked(x) {
    {
        return;
    }
}
function trackDisposable(x) {
    {
        return x;
    }
}
class MultiDisposeError extends Error {
    constructor(errors) {
        super(`Encountered errors while disposing of store. Errors: [${errors.join(', ')}]`);
        this.errors = errors;
    }
}
function isDisposable(thing) {
    return typeof thing.dispose === 'function' && thing.dispose.length === 0;
}
function dispose(arg) {
    if (Iterable.is(arg)) {
        let errors = [];
        for (const d of arg) {
            if (d) {
                try {
                    d.dispose();
                }
                catch (e) {
                    errors.push(e);
                }
            }
        }
        if (errors.length === 1) {
            throw errors[0];
        }
        else if (errors.length > 1) {
            throw new MultiDisposeError(errors);
        }
        return Array.isArray(arg) ? [] : arg;
    }
    else if (arg) {
        arg.dispose();
        return arg;
    }
}
function combinedDisposable(...disposables) {
    disposables.forEach(markTracked);
    return toDisposable(() => dispose(disposables));
}
function toDisposable(fn) {
    const self = trackDisposable({
        dispose: () => {
            fn();
        }
    });
    return self;
}
class DisposableStore {
    constructor() {
        this._toDispose = new Set();
        this._isDisposed = false;
    }
    /**
     * Dispose of all registered disposables and mark this object as disposed.
     *
     * Any future disposables added to this object will be disposed of on `add`.
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        this._isDisposed = true;
        this.clear();
    }
    /**
     * Dispose of all registered disposables but do not mark this object as disposed.
     */
    clear() {
        try {
            dispose(this._toDispose.values());
        }
        finally {
            this._toDispose.clear();
        }
    }
    add(t) {
        if (!t) {
            return t;
        }
        if (t === this) {
            throw new Error('Cannot register a disposable on itself!');
        }
        if (this._isDisposed) {
            if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
                console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
            }
        }
        else {
            this._toDispose.add(t);
        }
        return t;
    }
}
DisposableStore.DISABLE_DISPOSED_WARNING = false;
class Disposable {
    constructor() {
        this._store = new DisposableStore();
    }
    dispose() {
        this._store.dispose();
    }
    _register(t) {
        if (t === this) {
            throw new Error('Cannot register a disposable on itself!');
        }
        return this._store.add(t);
    }
}
Disposable.None = Object.freeze({ dispose() { } });
/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */
class MutableDisposable {
    constructor() {
        this._isDisposed = false;
    }
    get value() {
        return this._isDisposed ? undefined : this._value;
    }
    set value(value) {
        var _a;
        if (this._isDisposed || value === this._value) {
            return;
        }
        (_a = this._value) === null || _a === void 0 ? void 0 : _a.dispose();
        this._value = value;
    }
    clear() {
        this.value = undefined;
    }
    dispose() {
        var _a;
        this._isDisposed = true;
        (_a = this._value) === null || _a === void 0 ? void 0 : _a.dispose();
        this._value = undefined;
    }
}
class ImmortalReference {
    constructor(object) {
        this.object = object;
    }
    dispose() { }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class Node {
    constructor(element) {
        this.element = element;
        this.next = Node.Undefined;
        this.prev = Node.Undefined;
    }
}
Node.Undefined = new Node(undefined);
class LinkedList {
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
        }
        else if (atTheEnd) {
            // push
            const oldLast = this._last;
            this._last = newNode;
            newNode.prev = oldLast;
            oldLast.next = newNode;
        }
        else {
            // unshift
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
            return undefined;
        }
        else {
            const res = this._first.element;
            this._remove(this._first);
            return res;
        }
    }
    pop() {
        if (this._last === Node.Undefined) {
            return undefined;
        }
        else {
            const res = this._last.element;
            this._remove(this._last);
            return res;
        }
    }
    _remove(node) {
        if (node.prev !== Node.Undefined && node.next !== Node.Undefined) {
            // middle
            const anchor = node.prev;
            anchor.next = node.next;
            node.next.prev = anchor;
        }
        else if (node.prev === Node.Undefined && node.next === Node.Undefined) {
            // only node
            this._first = Node.Undefined;
            this._last = Node.Undefined;
        }
        else if (node.next === Node.Undefined) {
            // last
            this._last = this._last.prev;
            this._last.next = Node.Undefined;
        }
        else if (node.prev === Node.Undefined) {
            // first
            this._first = this._first.next;
            this._first.prev = Node.Undefined;
        }
        // done
        this._size -= 1;
    }
    *[Symbol.iterator]() {
        let node = this._first;
        while (node !== Node.Undefined) {
            yield node.element;
            node = node.next;
        }
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const hasPerformanceNow = (globals.performance && typeof globals.performance.now === 'function');
class StopWatch {
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
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var Event;
(function (Event) {
    Event.None = () => Disposable.None;
    /**
     * Given an event, returns another event which only fires once.
     */
    function once(event) {
        return (listener, thisArgs = null, disposables) => {
            // we need this, in case the event fires during the listener call
            let didFire = false;
            let result;
            result = event(e => {
                if (didFire) {
                    return;
                }
                else if (result) {
                    result.dispose();
                }
                else {
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
    Event.once = once;
    /**
     * Given an event and a `map` function, returns another event which maps each element
     * through the mapping function.
     */
    function map(event, map) {
        return snapshot((listener, thisArgs = null, disposables) => event(i => listener.call(thisArgs, map(i)), null, disposables));
    }
    Event.map = map;
    /**
     * Given an event and an `each` function, returns another identical event and calls
     * the `each` function per each element.
     */
    function forEach(event, each) {
        return snapshot((listener, thisArgs = null, disposables) => event(i => { each(i); listener.call(thisArgs, i); }, null, disposables));
    }
    Event.forEach = forEach;
    function filter(event, filter) {
        return snapshot((listener, thisArgs = null, disposables) => event(e => filter(e) && listener.call(thisArgs, e), null, disposables));
    }
    Event.filter = filter;
    /**
     * Given an event, returns the same event but typed as `Event<void>`.
     */
    function signal(event) {
        return event;
    }
    Event.signal = signal;
    function any(...events) {
        return (listener, thisArgs = null, disposables) => combinedDisposable(...events.map(event => event(e => listener.call(thisArgs, e), null, disposables)));
    }
    Event.any = any;
    /**
     * Given an event and a `merge` function, returns another event which maps each element
     * and the cumulative result through the `merge` function. Similar to `map`, but with memory.
     */
    function reduce(event, merge, initial) {
        let output = initial;
        return map(event, e => {
            output = merge(output, e);
            return output;
        });
    }
    Event.reduce = reduce;
    /**
     * Given a chain of event processing functions (filter, map, etc), each
     * function will be invoked per event & per listener. Snapshotting an event
     * chain allows each function to be invoked just once per event.
     */
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
    Event.snapshot = snapshot;
    function debounce(event, merge, delay = 100, leading = false, leakWarningThreshold) {
        let subscription;
        let output = undefined;
        let handle = undefined;
        let numDebouncedCalls = 0;
        const emitter = new Emitter({
            leakWarningThreshold,
            onFirstListenerAdd() {
                subscription = event(cur => {
                    numDebouncedCalls++;
                    output = merge(output, cur);
                    if (leading && !handle) {
                        emitter.fire(output);
                        output = undefined;
                    }
                    clearTimeout(handle);
                    handle = setTimeout(() => {
                        const _output = output;
                        output = undefined;
                        handle = undefined;
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
    Event.debounce = debounce;
    /**
     * Given an event, it returns another event which fires only once and as soon as
     * the input event emits. The event data is the number of millis it took for the
     * event to fire.
     */
    function stopwatch(event) {
        const start = new Date().getTime();
        return map(once(event), _ => new Date().getTime() - start);
    }
    Event.stopwatch = stopwatch;
    /**
     * Given an event, it returns another event which fires only when the event
     * element changes.
     */
    function latch(event, equals = (a, b) => a === b) {
        let firstCall = true;
        let cache;
        return filter(event, value => {
            const shouldEmit = firstCall || !equals(value, cache);
            firstCall = false;
            cache = value;
            return shouldEmit;
        });
    }
    Event.latch = latch;
    /**
     * Given an event, it returns another event which fires only when the event
     * element changes.
     */
    function split(event, isT) {
        return [
            Event.filter(event, isT),
            Event.filter(event, e => !isT(e)),
        ];
    }
    Event.split = split;
    /**
     * Buffers the provided event until a first listener comes
     * along, at which point fire all the events at once and
     * pipe the event from then on.
     *
     * ```typescript
     * const emitter = new Emitter<number>();
     * const event = emitter.event;
     * const bufferedEvent = buffer(event);
     *
     * emitter.fire(1);
     * emitter.fire(2);
     * emitter.fire(3);
     * // nothing...
     *
     * const listener = bufferedEvent(num => console.log(num));
     * // 1, 2, 3
     *
     * emitter.fire(4);
     * // 4
     * ```
     */
    function buffer(event, nextTick = false, _buffer = []) {
        let buffer = _buffer.slice();
        let listener = event(e => {
            if (buffer) {
                buffer.push(e);
            }
            else {
                emitter.fire(e);
            }
        });
        const flush = () => {
            if (buffer) {
                buffer.forEach(e => emitter.fire(e));
            }
            buffer = null;
        };
        const emitter = new Emitter({
            onFirstListenerAdd() {
                if (!listener) {
                    listener = event(e => emitter.fire(e));
                }
            },
            onFirstListenerDidAdd() {
                if (buffer) {
                    if (nextTick) {
                        setTimeout(flush);
                    }
                    else {
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
    Event.buffer = buffer;
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
    Event.chain = chain;
    function fromNodeEventEmitter(emitter, eventName, map = id => id) {
        const fn = (...args) => result.fire(map(...args));
        const onFirstListenerAdd = () => emitter.on(eventName, fn);
        const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
        const result = new Emitter({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
    }
    Event.fromNodeEventEmitter = fromNodeEventEmitter;
    function fromDOMEventEmitter(emitter, eventName, map = id => id) {
        const fn = (...args) => result.fire(map(...args));
        const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
        const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
        const result = new Emitter({ onFirstListenerAdd, onLastListenerRemove });
        return result.event;
    }
    Event.fromDOMEventEmitter = fromDOMEventEmitter;
    function fromPromise(promise) {
        const emitter = new Emitter();
        let shouldEmit = false;
        promise
            .then(undefined, () => null)
            .then(() => {
            if (!shouldEmit) {
                setTimeout(() => emitter.fire(undefined), 0);
            }
            else {
                emitter.fire(undefined);
            }
        });
        shouldEmit = true;
        return emitter.event;
    }
    Event.fromPromise = fromPromise;
    function toPromise(event) {
        return new Promise(resolve => once(event)(resolve));
    }
    Event.toPromise = toPromise;
})(Event || (Event = {}));
class EventProfiling {
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
            this._stopWatch = undefined;
        }
    }
}
EventProfiling._idPool = 0;
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
    class Document {

        private readonly _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
class Emitter {
    constructor(options) {
        var _a;
        this._disposed = false;
        this._options = options;
        this._leakageMon =  undefined;
        this._perfMon = ((_a = this._options) === null || _a === void 0 ? void 0 : _a._profName) ? new EventProfiling(this._options._profName) : undefined;
    }
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event() {
        if (!this._event) {
            this._event = (listener, thisArgs, disposables) => {
                var _a;
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
                // check and record this emitter for potential leakage
                const removeMonitor = (_a = this._leakageMon) === null || _a === void 0 ? void 0 : _a.check(this._listeners.size);
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
                                const hasListeners = (this._listeners && !this._listeners.isEmpty());
                                if (!hasListeners) {
                                    this._options.onLastListenerRemove(this);
                                }
                            }
                        }
                    }
                };
                if (disposables instanceof DisposableStore) {
                    disposables.add(result);
                }
                else if (Array.isArray(disposables)) {
                    disposables.push(result);
                }
                return result;
            };
        }
        return this._event;
    }
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(event) {
        var _a, _b;
        if (this._listeners) {
            // put all [listener,event]-pairs into delivery queue
            // then emit all event. an inner/nested event might be
            // the driver of this
            if (!this._deliveryQueue) {
                this._deliveryQueue = new LinkedList();
            }
            for (let listener of this._listeners) {
                this._deliveryQueue.push([listener, event]);
            }
            // start/stop performance insight collection
            (_a = this._perfMon) === null || _a === void 0 ? void 0 : _a.start(this._deliveryQueue.size);
            while (this._deliveryQueue.size > 0) {
                const [listener, event] = this._deliveryQueue.shift();
                try {
                    if (typeof listener === 'function') {
                        listener.call(undefined, event);
                    }
                    else {
                        listener[0].call(listener[1], event);
                    }
                }
                catch (e) {
                    onUnexpectedError(e);
                }
            }
            (_b = this._perfMon) === null || _b === void 0 ? void 0 : _b.stop();
        }
    }
    dispose() {
        var _a, _b, _c, _d, _e;
        if (!this._disposed) {
            this._disposed = true;
            (_a = this._listeners) === null || _a === void 0 ? void 0 : _a.clear();
            (_b = this._deliveryQueue) === null || _b === void 0 ? void 0 : _b.clear();
            (_d = (_c = this._options) === null || _c === void 0 ? void 0 : _c.onLastListenerRemove) === null || _d === void 0 ? void 0 : _d.call(_c);
            (_e = this._leakageMon) === null || _e === void 0 ? void 0 : _e.dispose();
        }
    }
}
Emitter._noop = function () { };
class PauseableEmitter extends Emitter {
    constructor(options) {
        super(options);
        this._isPaused = 0;
        this._eventQueue = new LinkedList();
        this._mergeFn = options === null || options === void 0 ? void 0 : options.merge;
    }
    pause() {
        this._isPaused++;
    }
    resume() {
        if (this._isPaused !== 0 && --this._isPaused === 0) {
            if (this._mergeFn) {
                // use the merge function to create a single composite
                // event. make a copy in case firing pauses this emitter
                const events = Array.from(this._eventQueue);
                this._eventQueue.clear();
                super.fire(this._mergeFn(events));
            }
            else {
                // no merging, fire each event individually and test
                // that this emitter isn't paused halfway through
                while (!this._isPaused && this._eventQueue.size !== 0) {
                    super.fire(this._eventQueue.shift());
                }
            }
        }
    }
    fire(event) {
        if (this._listeners) {
            if (this._isPaused !== 0) {
                this._eventQueue.push(event);
            }
            else {
                super.fire(event);
            }
        }
    }
}
/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */
class EventBufferer {
    constructor() {
        this.buffers = [];
    }
    wrapEvent(event) {
        return (listener, thisArgs, disposables) => {
            return event(i => {
                const buffer = this.buffers[this.buffers.length - 1];
                if (buffer) {
                    buffer.push(() => listener.call(thisArgs, i));
                }
                else {
                    listener.call(thisArgs, i);
                }
            }, undefined, disposables);
        };
    }
    bufferEvents(fn) {
        const buffer = [];
        this.buffers.push(buffer);
        const r = fn();
        this.buffers.pop();
        buffer.forEach(flush => flush());
        return r;
    }
}
/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */
class Relay {
    constructor() {
        this.listening = false;
        this.inputEvent = Event.None;
        this.inputEventListener = Disposable.None;
        this.emitter = new Emitter({
            onFirstListenerDidAdd: () => {
                this.listening = true;
                this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
            },
            onLastListenerRemove: () => {
                this.listening = false;
                this.inputEventListener.dispose();
            }
        });
        this.event = this.emitter.event;
    }
    set input(event) {
        this.inputEvent = event;
        if (this.listening) {
            this.inputEventListener.dispose();
            this.inputEventListener = event(this.emitter.fire, this.emitter);
        }
    }
    dispose() {
        this.inputEventListener.dispose();
        this.emitter.dispose();
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const shortcutEvent = Object.freeze(function (callback, context) {
    const handle = setTimeout(callback.bind(context), 0);
    return { dispose() { clearTimeout(handle); } };
});
var CancellationToken;
(function (CancellationToken) {
    function isCancellationToken(thing) {
        if (thing === CancellationToken.None || thing === CancellationToken.Cancelled) {
            return true;
        }
        if (thing instanceof MutableToken) {
            return true;
        }
        if (!thing || typeof thing !== 'object') {
            return false;
        }
        return typeof thing.isCancellationRequested === 'boolean'
            && typeof thing.onCancellationRequested === 'function';
    }
    CancellationToken.isCancellationToken = isCancellationToken;
    CancellationToken.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: Event.None
    });
    CancellationToken.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: shortcutEvent
    });
})(CancellationToken || (CancellationToken = {}));
class MutableToken {
    constructor() {
        this._isCancelled = false;
        this._emitter = null;
    }
    cancel() {
        if (!this._isCancelled) {
            this._isCancelled = true;
            if (this._emitter) {
                this._emitter.fire(undefined);
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
}
class CancellationTokenSource {
    constructor(parent) {
        this._token = undefined;
        this._parentListener = undefined;
        this._parentListener = parent && parent.onCancellationRequested(this.cancel, this);
    }
    get token() {
        if (!this._token) {
            // be lazy and create the token only when
            // actually needed
            this._token = new MutableToken();
        }
        return this._token;
    }
    cancel() {
        if (!this._token) {
            // save an object by returning the default
            // cancelled token when cancellation happens
            // before someone asks for the token
            this._token = CancellationToken.Cancelled;
        }
        else if (this._token instanceof MutableToken) {
            // actually cancel
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
            // ensure to initialize with an empty token if we had none
            this._token = CancellationToken.None;
        }
        else if (this._token instanceof MutableToken) {
            // actually dispose
            this._token.dispose();
        }
    }
}

let safeProcess;
// Native sandbox environment
if (typeof globals.vscode !== 'undefined' && typeof globals.vscode.process !== 'undefined') {
    const sandboxProcess = globals.vscode.process;
    safeProcess = {
        get platform() { return sandboxProcess.platform; },
        get env() { return sandboxProcess.env; },
        cwd() { return sandboxProcess.cwd(); },
        nextTick(callback) { return setImmediate(callback); }
    };
}
// Native node.js environment
else if (typeof process !== 'undefined') {
    safeProcess = {
        get platform() { return process.platform; },
        get env() { return process.env; },
        cwd() { return process.env['VSCODE_CWD'] || process.cwd(); },
        nextTick(callback) { return process.nextTick(callback); }
    };
}
// Web environment
else {
    safeProcess = {
        // Supported
        get platform() { return isWindows ? 'win32' : isMacintosh ? 'darwin' : 'linux'; },
        nextTick(callback) { return setImmediate(callback); },
        // Unsupported
        get env() { return {}; },
        cwd() { return '/'; }
    };
}
/**
 * Provides safe access to the `cwd` property in node.js, sandboxed or web
 * environments.
 *
 * Note: in web, this property is hardcoded to be `/`.
 */
const cwd = safeProcess.cwd;
/**
 * Provides safe access to the `env` property in node.js, sandboxed or web
 * environments.
 *
 * Note: in web, this property is hardcoded to be `{}`.
 */
const env = safeProcess.env;
/**
 * Provides safe access to the `platform` property in node.js, sandboxed or web
 * environments.
 */
const platform = safeProcess.platform;

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const CHAR_UPPERCASE_A = 65; /* A */
const CHAR_LOWERCASE_A = 97; /* a */
const CHAR_UPPERCASE_Z = 90; /* Z */
const CHAR_LOWERCASE_Z = 122; /* z */
const CHAR_DOT = 46; /* . */
const CHAR_FORWARD_SLASH = 47; /* / */
const CHAR_BACKWARD_SLASH = 92; /* \ */
const CHAR_COLON = 58; /* : */
const CHAR_QUESTION_MARK = 63; /* ? */
class ErrorInvalidArgType extends Error {
    constructor(name, expected, actual) {
        // determiner: 'must be' or 'must not be'
        let determiner;
        if (typeof expected === 'string' && expected.indexOf('not ') === 0) {
            determiner = 'must not be';
            expected = expected.replace(/^not /, '');
        }
        else {
            determiner = 'must be';
        }
        const type = name.indexOf('.') !== -1 ? 'property' : 'argument';
        let msg = `The "${name}" ${type} ${determiner} of type ${expected}`;
        msg += `. Received type ${typeof actual}`;
        super(msg);
        this.code = 'ERR_INVALID_ARG_TYPE';
    }
}
function validateString(value, name) {
    if (typeof value !== 'string') {
        throw new ErrorInvalidArgType(name, 'string', value);
    }
}
function isPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
}
function isPosixPathSeparator(code) {
    return code === CHAR_FORWARD_SLASH;
}
function isWindowsDeviceRoot(code) {
    return code >= CHAR_UPPERCASE_A && code <= CHAR_UPPERCASE_Z ||
        code >= CHAR_LOWERCASE_A && code <= CHAR_LOWERCASE_Z;
}
// Resolves . and .. elements in a path with directory names
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
    let res = '';
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code = 0;
    for (let i = 0; i <= path.length; ++i) {
        if (i < path.length) {
            code = path.charCodeAt(i);
        }
        else if (isPathSeparator(code)) {
            break;
        }
        else {
            code = CHAR_FORWARD_SLASH;
        }
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) ;
            else if (dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 ||
                    res.charCodeAt(res.length - 1) !== CHAR_DOT ||
                    res.charCodeAt(res.length - 2) !== CHAR_DOT) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = '';
                            lastSegmentLength = 0;
                        }
                        else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                    else if (res.length !== 0) {
                        res = '';
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    res += res.length > 0 ? `${separator}..` : '..';
                    lastSegmentLength = 2;
                }
            }
            else {
                if (res.length > 0) {
                    res += `${separator}${path.slice(lastSlash + 1, i)}`;
                }
                else {
                    res = path.slice(lastSlash + 1, i);
                }
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        }
        else if (code === CHAR_DOT && dots !== -1) {
            ++dots;
        }
        else {
            dots = -1;
        }
    }
    return res;
}
function _format$1(sep, pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
        throw new ErrorInvalidArgType('pathObject', 'Object', pathObject);
    }
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base ||
        `${pathObject.name || ''}${pathObject.ext || ''}`;
    if (!dir) {
        return base;
    }
    return dir === pathObject.root ? `${dir}${base}` : `${dir}${sep}${base}`;
}
const win32 = {
    // path.resolve([from ...], to)
    resolve(...pathSegments) {
        let resolvedDevice = '';
        let resolvedTail = '';
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1; i--) {
            let path;
            if (i >= 0) {
                path = pathSegments[i];
                validateString(path, 'path');
                // Skip empty entries
                if (path.length === 0) {
                    continue;
                }
            }
            else if (resolvedDevice.length === 0) {
                path = cwd();
            }
            else {
                // Windows has the concept of drive-specific current working
                // directories. If we've resolved a drive letter but not yet an
                // absolute path, get cwd for that drive, or the process cwd if
                // the drive cwd is not available. We're sure the device is not
                // a UNC path at this points, because UNC paths are always absolute.
                path = env[`=${resolvedDevice}`] || cwd();
                // Verify that a cwd was found and that it actually points
                // to our drive. If not, default to the drive's root.
                if (path === undefined ||
                    path.slice(0, 2).toLowerCase() !== resolvedDevice.toLowerCase() &&
                        path.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
                    path = `${resolvedDevice}\\`;
                }
            }
            const len = path.length;
            let rootEnd = 0;
            let device = '';
            let isAbsolute = false;
            const code = path.charCodeAt(0);
            // Try to match a root
            if (len === 1) {
                if (isPathSeparator(code)) {
                    // `path` contains just a path separator
                    rootEnd = 1;
                    isAbsolute = true;
                }
            }
            else if (isPathSeparator(code)) {
                // Possible UNC root
                // If we started with a separator, we know we at least have an
                // absolute path of some kind (UNC or otherwise)
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    // Matched double path separator at beginning
                    let j = 2;
                    let last = j;
                    // Match 1 or more non-path separators
                    while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                        j++;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        // Matched!
                        last = j;
                        // Match 1 or more path separators
                        while (j < len && isPathSeparator(path.charCodeAt(j))) {
                            j++;
                        }
                        if (j < len && j !== last) {
                            // Matched!
                            last = j;
                            // Match 1 or more non-path separators
                            while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                                j++;
                            }
                            if (j === len || j !== last) {
                                // We matched a UNC root
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                }
                else {
                    rootEnd = 1;
                }
            }
            else if (isWindowsDeviceRoot(code) &&
                path.charCodeAt(1) === CHAR_COLON) {
                // Possible device root
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
                    // Treat separator following drive name as an absolute path
                    // indicator
                    isAbsolute = true;
                    rootEnd = 3;
                }
            }
            if (device.length > 0) {
                if (resolvedDevice.length > 0) {
                    if (device.toLowerCase() !== resolvedDevice.toLowerCase()) {
                        // This path points to another device so it is not applicable
                        continue;
                    }
                }
                else {
                    resolvedDevice = device;
                }
            }
            if (resolvedAbsolute) {
                if (resolvedDevice.length > 0) {
                    break;
                }
            }
            else {
                resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
                resolvedAbsolute = isAbsolute;
                if (isAbsolute && resolvedDevice.length > 0) {
                    break;
                }
            }
        }
        // At this point the path should be resolved to a full absolute path,
        // but handle relative paths to be safe (might happen when process.cwd()
        // fails)
        // Normalize the tail path
        resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, '\\', isPathSeparator);
        return resolvedAbsolute ?
            `${resolvedDevice}\\${resolvedTail}` :
            `${resolvedDevice}${resolvedTail}` || '.';
    },
    normalize(path) {
        validateString(path, 'path');
        const len = path.length;
        if (len === 0) {
            return '.';
        }
        let rootEnd = 0;
        let device;
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        // Try to match a root
        if (len === 1) {
            // `path` contains just a single char, exit early to avoid
            // unnecessary work
            return isPosixPathSeparator(code) ? '\\' : path;
        }
        if (isPathSeparator(code)) {
            // Possible UNC root
            // If we started with a separator, we know we at least have an absolute
            // path of some kind (UNC or otherwise)
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                // Matched double path separator at beginning
                let j = 2;
                let last = j;
                // Match 1 or more non-path separators
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                    j++;
                }
                if (j < len && j !== last) {
                    const firstPart = path.slice(last, j);
                    // Matched!
                    last = j;
                    // Match 1 or more path separators
                    while (j < len && isPathSeparator(path.charCodeAt(j))) {
                        j++;
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more non-path separators
                        while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                            j++;
                        }
                        if (j === len) {
                            // We matched a UNC root only
                            // Return the normalized version of the UNC root since there
                            // is nothing left to process
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        }
                        if (j !== last) {
                            // We matched a UNC root with leftovers
                            device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            }
            else {
                rootEnd = 1;
            }
        }
        else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
            // Possible device root
            device = path.slice(0, 2);
            rootEnd = 2;
            if (len > 2 && isPathSeparator(path.charCodeAt(2))) {
                // Treat separator following drive name as an absolute path
                // indicator
                isAbsolute = true;
                rootEnd = 3;
            }
        }
        let tail = rootEnd < len ?
            normalizeString(path.slice(rootEnd), !isAbsolute, '\\', isPathSeparator) :
            '';
        if (tail.length === 0 && !isAbsolute) {
            tail = '.';
        }
        if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
            tail += '\\';
        }
        if (device === undefined) {
            return isAbsolute ? `\\${tail}` : tail;
        }
        return isAbsolute ? `${device}\\${tail}` : `${device}${tail}`;
    },
    isAbsolute(path) {
        validateString(path, 'path');
        const len = path.length;
        if (len === 0) {
            return false;
        }
        const code = path.charCodeAt(0);
        return isPathSeparator(code) ||
            // Possible device root
            len > 2 &&
                isWindowsDeviceRoot(code) &&
                path.charCodeAt(1) === CHAR_COLON &&
                isPathSeparator(path.charCodeAt(2));
    },
    join(...paths) {
        if (paths.length === 0) {
            return '.';
        }
        let joined;
        let firstPart;
        for (let i = 0; i < paths.length; ++i) {
            const arg = paths[i];
            validateString(arg, 'path');
            if (arg.length > 0) {
                if (joined === undefined) {
                    joined = firstPart = arg;
                }
                else {
                    joined += `\\${arg}`;
                }
            }
        }
        if (joined === undefined) {
            return '.';
        }
        // Make sure that the joined path doesn't start with two slashes, because
        // normalize() will mistake it for an UNC path then.
        //
        // This step is skipped when it is very clear that the user actually
        // intended to point at an UNC path. This is assumed when the first
        // non-empty string arguments starts with exactly two slashes followed by
        // at least one more non-slash character.
        //
        // Note that for normalize() to treat a path as an UNC path it needs to
        // have at least 2 components, so we don't filter for that here.
        // This means that the user can use join to construct UNC paths from
        // a server name and a share name; for example:
        //   path.join('//server', 'share') -> '\\\\server\\share\\')
        let needsReplace = true;
        let slashCount = 0;
        if (typeof firstPart === 'string' && isPathSeparator(firstPart.charCodeAt(0))) {
            ++slashCount;
            const firstLen = firstPart.length;
            if (firstLen > 1 && isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) {
                        ++slashCount;
                    }
                    else {
                        // We matched a UNC path in the first part
                        needsReplace = false;
                    }
                }
            }
        }
        if (needsReplace) {
            // Find any more consecutive slashes we need to replace
            while (slashCount < joined.length &&
                isPathSeparator(joined.charCodeAt(slashCount))) {
                slashCount++;
            }
            // Replace the slashes if needed
            if (slashCount >= 2) {
                joined = `\\${joined.slice(slashCount)}`;
            }
        }
        return win32.normalize(joined);
    },
    // It will solve the relative path from `from` to `to`, for instance:
    //  from = 'C:\\orandea\\test\\aaa'
    //  to = 'C:\\orandea\\impl\\bbb'
    // The output of the function should be: '..\\..\\impl\\bbb'
    relative(from, to) {
        validateString(from, 'from');
        validateString(to, 'to');
        if (from === to) {
            return '';
        }
        const fromOrig = win32.resolve(from);
        const toOrig = win32.resolve(to);
        if (fromOrig === toOrig) {
            return '';
        }
        from = fromOrig.toLowerCase();
        to = toOrig.toLowerCase();
        if (from === to) {
            return '';
        }
        // Trim any leading backslashes
        let fromStart = 0;
        while (fromStart < from.length &&
            from.charCodeAt(fromStart) === CHAR_BACKWARD_SLASH) {
            fromStart++;
        }
        // Trim trailing backslashes (applicable to UNC paths only)
        let fromEnd = from.length;
        while (fromEnd - 1 > fromStart &&
            from.charCodeAt(fromEnd - 1) === CHAR_BACKWARD_SLASH) {
            fromEnd--;
        }
        const fromLen = fromEnd - fromStart;
        // Trim any leading backslashes
        let toStart = 0;
        while (toStart < to.length &&
            to.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
            toStart++;
        }
        // Trim trailing backslashes (applicable to UNC paths only)
        let toEnd = to.length;
        while (toEnd - 1 > toStart &&
            to.charCodeAt(toEnd - 1) === CHAR_BACKWARD_SLASH) {
            toEnd--;
        }
        const toLen = toEnd - toStart;
        // Compare paths to find the longest common path from root
        const length = fromLen < toLen ? fromLen : toLen;
        let lastCommonSep = -1;
        let i = 0;
        for (; i < length; i++) {
            const fromCode = from.charCodeAt(fromStart + i);
            if (fromCode !== to.charCodeAt(toStart + i)) {
                break;
            }
            else if (fromCode === CHAR_BACKWARD_SLASH) {
                lastCommonSep = i;
            }
        }
        // We found a mismatch before the first common path separator was seen, so
        // return the original `to`.
        if (i !== length) {
            if (lastCommonSep === -1) {
                return toOrig;
            }
        }
        else {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === CHAR_BACKWARD_SLASH) {
                    // We get here if `from` is the exact base path for `to`.
                    // For example: from='C:\\foo\\bar'; to='C:\\foo\\bar\\baz'
                    return toOrig.slice(toStart + i + 1);
                }
                if (i === 2) {
                    // We get here if `from` is the device root.
                    // For example: from='C:\\'; to='C:\\foo'
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === CHAR_BACKWARD_SLASH) {
                    // We get here if `to` is the exact base path for `from`.
                    // For example: from='C:\\foo\\bar'; to='C:\\foo'
                    lastCommonSep = i;
                }
                else if (i === 2) {
                    // We get here if `to` is the device root.
                    // For example: from='C:\\foo\\bar'; to='C:\\'
                    lastCommonSep = 3;
                }
            }
            if (lastCommonSep === -1) {
                lastCommonSep = 0;
            }
        }
        let out = '';
        // Generate the relative path based on the path difference between `to` and
        // `from`
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === CHAR_BACKWARD_SLASH) {
                out += out.length === 0 ? '..' : '\\..';
            }
        }
        toStart += lastCommonSep;
        // Lastly, append the rest of the destination (`to`) path that comes after
        // the common path parts
        if (out.length > 0) {
            return `${out}${toOrig.slice(toStart, toEnd)}`;
        }
        if (toOrig.charCodeAt(toStart) === CHAR_BACKWARD_SLASH) {
            ++toStart;
        }
        return toOrig.slice(toStart, toEnd);
    },
    toNamespacedPath(path) {
        // Note: this will *probably* throw somewhere.
        if (typeof path !== 'string') {
            return path;
        }
        if (path.length === 0) {
            return '';
        }
        const resolvedPath = win32.resolve(path);
        if (resolvedPath.length <= 2) {
            return path;
        }
        if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
            // Possible UNC root
            if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
                    // Matched non-long UNC root, convert the path to a long UNC path
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        }
        else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0)) &&
            resolvedPath.charCodeAt(1) === CHAR_COLON &&
            resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
            // Matched device root, convert the path to a long UNC path
            return `\\\\?\\${resolvedPath}`;
        }
        return path;
    },
    dirname(path) {
        validateString(path, 'path');
        const len = path.length;
        if (len === 0) {
            return '.';
        }
        let rootEnd = -1;
        let offset = 0;
        const code = path.charCodeAt(0);
        if (len === 1) {
            // `path` contains just a path separator, exit early to avoid
            // unnecessary work or a dot.
            return isPathSeparator(code) ? path : '.';
        }
        // Try to match a root
        if (isPathSeparator(code)) {
            // Possible UNC root
            rootEnd = offset = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                // Matched double path separator at beginning
                let j = 2;
                let last = j;
                // Match 1 or more non-path separators
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                    j++;
                }
                if (j < len && j !== last) {
                    // Matched!
                    last = j;
                    // Match 1 or more path separators
                    while (j < len && isPathSeparator(path.charCodeAt(j))) {
                        j++;
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more non-path separators
                        while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                            j++;
                        }
                        if (j === len) {
                            // We matched a UNC root only
                            return path;
                        }
                        if (j !== last) {
                            // We matched a UNC root with leftovers
                            // Offset by 1 to include the separator after the UNC root to
                            // treat it as a "normal root" on top of a (UNC) root
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
            // Possible device root
        }
        else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
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
            }
            else {
                // We saw the first non-path separator
                matchedSlash = false;
            }
        }
        if (end === -1) {
            if (rootEnd === -1) {
                return '.';
            }
            end = rootEnd;
        }
        return path.slice(0, end);
    },
    basename(path, ext) {
        if (ext !== undefined) {
            validateString(ext, 'ext');
        }
        validateString(path, 'path');
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        // Check for a drive letter prefix so as not to mistake the following
        // path separator as an extra separator at the end of the path that can be
        // disregarded
        if (path.length >= 2 &&
            isWindowsDeviceRoot(path.charCodeAt(0)) &&
            path.charCodeAt(1) === CHAR_COLON) {
            start = 2;
        }
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext === path) {
                return '';
            }
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for (i = path.length - 1; i >= start; --i) {
                const code = path.charCodeAt(i);
                if (isPathSeparator(code)) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else {
                    if (firstNonSlashEnd === -1) {
                        // We saw the first non-path separator, remember this index in case
                        // we need it if the extension ends up not matching
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        // Try to match the explicit extension
                        if (code === ext.charCodeAt(extIdx)) {
                            if (--extIdx === -1) {
                                // We matched the extension, so mark this as the end of our path
                                // component
                                end = i;
                            }
                        }
                        else {
                            // Extension does not match, so our result is the entire path
                            // component
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end) {
                end = firstNonSlashEnd;
            }
            else if (end === -1) {
                end = path.length;
            }
            return path.slice(start, end);
        }
        for (i = path.length - 1; i >= start; --i) {
            if (isPathSeparator(path.charCodeAt(i))) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            }
            else if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // path component
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) {
            return '';
        }
        return path.slice(start, end);
    },
    extname(path) {
        validateString(path, 'path');
        let start = 0;
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;
        // Check for a drive letter prefix so as not to mistake the following
        // path separator as an extra separator at the end of the path that can be
        // disregarded
        if (path.length >= 2 &&
            path.charCodeAt(1) === CHAR_COLON &&
            isWindowsDeviceRoot(path.charCodeAt(0))) {
            start = startPart = 2;
        }
        for (let i = path.length - 1; i >= start; --i) {
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === CHAR_DOT) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1) {
                    startDot = i;
                }
                else if (preDotState !== 1) {
                    preDotState = 1;
                }
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            (preDotState === 1 &&
                startDot === end - 1 &&
                startDot === startPart + 1)) {
            return '';
        }
        return path.slice(startDot, end);
    },
    format: _format$1.bind(null, '\\'),
    parse(path) {
        validateString(path, 'path');
        const ret = { root: '', dir: '', base: '', ext: '', name: '' };
        if (path.length === 0) {
            return ret;
        }
        const len = path.length;
        let rootEnd = 0;
        let code = path.charCodeAt(0);
        if (len === 1) {
            if (isPathSeparator(code)) {
                // `path` contains just a path separator, exit early to avoid
                // unnecessary work
                ret.root = ret.dir = path;
                return ret;
            }
            ret.base = ret.name = path;
            return ret;
        }
        // Try to match a root
        if (isPathSeparator(code)) {
            // Possible UNC root
            rootEnd = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                // Matched double path separator at beginning
                let j = 2;
                let last = j;
                // Match 1 or more non-path separators
                while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                    j++;
                }
                if (j < len && j !== last) {
                    // Matched!
                    last = j;
                    // Match 1 or more path separators
                    while (j < len && isPathSeparator(path.charCodeAt(j))) {
                        j++;
                    }
                    if (j < len && j !== last) {
                        // Matched!
                        last = j;
                        // Match 1 or more non-path separators
                        while (j < len && !isPathSeparator(path.charCodeAt(j))) {
                            j++;
                        }
                        if (j === len) {
                            // We matched a UNC root only
                            rootEnd = j;
                        }
                        else if (j !== last) {
                            // We matched a UNC root with leftovers
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        }
        else if (isWindowsDeviceRoot(code) && path.charCodeAt(1) === CHAR_COLON) {
            // Possible device root
            if (len <= 2) {
                // `path` contains just a drive root, exit early to avoid
                // unnecessary work
                ret.root = ret.dir = path;
                return ret;
            }
            rootEnd = 2;
            if (isPathSeparator(path.charCodeAt(2))) {
                if (len === 3) {
                    // `path` contains just a drive root, exit early to avoid
                    // unnecessary work
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
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;
        // Get non-dir info
        for (; i >= rootEnd; --i) {
            code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === CHAR_DOT) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1) {
                    startDot = i;
                }
                else if (preDotState !== 1) {
                    preDotState = 1;
                }
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (end !== -1) {
            if (startDot === -1 ||
                // We saw a non-dot character immediately before the dot
                preDotState === 0 ||
                // The (right-most) trimmed path component is exactly '..'
                (preDotState === 1 &&
                    startDot === end - 1 &&
                    startDot === startPart + 1)) {
                ret.base = ret.name = path.slice(startPart, end);
            }
            else {
                ret.name = path.slice(startPart, startDot);
                ret.base = path.slice(startPart, end);
                ret.ext = path.slice(startDot, end);
            }
        }
        // If the directory is the root, use the entire root as the `dir` including
        // the trailing slash if any (`C:\abc` -> `C:\`). Otherwise, strip out the
        // trailing slash (`C:\abc\def` -> `C:\abc`).
        if (startPart > 0 && startPart !== rootEnd) {
            ret.dir = path.slice(0, startPart - 1);
        }
        else {
            ret.dir = ret.root;
        }
        return ret;
    },
    sep: '\\',
    delimiter: ';',
    win32: null,
    posix: null
};
const posix = {
    // path.resolve([from ...], to)
    resolve(...pathSegments) {
        let resolvedPath = '';
        let resolvedAbsolute = false;
        for (let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
            const path = i >= 0 ? pathSegments[i] : cwd();
            validateString(path, 'path');
            // Skip empty entries
            if (path.length === 0) {
                continue;
            }
            resolvedPath = `${path}/${resolvedPath}`;
            resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        // Normalize the path
        resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, '/', isPosixPathSeparator);
        if (resolvedAbsolute) {
            return `/${resolvedPath}`;
        }
        return resolvedPath.length > 0 ? resolvedPath : '.';
    },
    normalize(path) {
        validateString(path, 'path');
        if (path.length === 0) {
            return '.';
        }
        const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;
        // Normalize the path
        path = normalizeString(path, !isAbsolute, '/', isPosixPathSeparator);
        if (path.length === 0) {
            if (isAbsolute) {
                return '/';
            }
            return trailingSeparator ? './' : '.';
        }
        if (trailingSeparator) {
            path += '/';
        }
        return isAbsolute ? `/${path}` : path;
    },
    isAbsolute(path) {
        validateString(path, 'path');
        return path.length > 0 && path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    },
    join(...paths) {
        if (paths.length === 0) {
            return '.';
        }
        let joined;
        for (let i = 0; i < paths.length; ++i) {
            const arg = paths[i];
            validateString(arg, 'path');
            if (arg.length > 0) {
                if (joined === undefined) {
                    joined = arg;
                }
                else {
                    joined += `/${arg}`;
                }
            }
        }
        if (joined === undefined) {
            return '.';
        }
        return posix.normalize(joined);
    },
    relative(from, to) {
        validateString(from, 'from');
        validateString(to, 'to');
        if (from === to) {
            return '';
        }
        // Trim leading forward slashes.
        from = posix.resolve(from);
        to = posix.resolve(to);
        if (from === to) {
            return '';
        }
        const fromStart = 1;
        const fromEnd = from.length;
        const fromLen = fromEnd - fromStart;
        const toStart = 1;
        const toLen = to.length - toStart;
        // Compare paths to find the longest common path from root
        const length = (fromLen < toLen ? fromLen : toLen);
        let lastCommonSep = -1;
        let i = 0;
        for (; i < length; i++) {
            const fromCode = from.charCodeAt(fromStart + i);
            if (fromCode !== to.charCodeAt(toStart + i)) {
                break;
            }
            else if (fromCode === CHAR_FORWARD_SLASH) {
                lastCommonSep = i;
            }
        }
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === CHAR_FORWARD_SLASH) {
                    // We get here if `from` is the exact base path for `to`.
                    // For example: from='/foo/bar'; to='/foo/bar/baz'
                    return to.slice(toStart + i + 1);
                }
                if (i === 0) {
                    // We get here if `from` is the root
                    // For example: from='/'; to='/foo'
                    return to.slice(toStart + i);
                }
            }
            else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === CHAR_FORWARD_SLASH) {
                    // We get here if `to` is the exact base path for `from`.
                    // For example: from='/foo/bar/baz'; to='/foo/bar'
                    lastCommonSep = i;
                }
                else if (i === 0) {
                    // We get here if `to` is the root.
                    // For example: from='/foo/bar'; to='/'
                    lastCommonSep = 0;
                }
            }
        }
        let out = '';
        // Generate the relative path based on the path difference between `to`
        // and `from`.
        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
            if (i === fromEnd || from.charCodeAt(i) === CHAR_FORWARD_SLASH) {
                out += out.length === 0 ? '..' : '/..';
            }
        }
        // Lastly, append the rest of the destination (`to`) path that comes after
        // the common path parts.
        return `${out}${to.slice(toStart + lastCommonSep)}`;
    },
    toNamespacedPath(path) {
        // Non-op on posix systems
        return path;
    },
    dirname(path) {
        validateString(path, 'path');
        if (path.length === 0) {
            return '.';
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
            }
            else {
                // We saw the first non-path separator
                matchedSlash = false;
            }
        }
        if (end === -1) {
            return hasRoot ? '/' : '.';
        }
        if (hasRoot && end === 1) {
            return '//';
        }
        return path.slice(0, end);
    },
    basename(path, ext) {
        if (ext !== undefined) {
            validateString(ext, 'ext');
        }
        validateString(path, 'path');
        let start = 0;
        let end = -1;
        let matchedSlash = true;
        let i;
        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
            if (ext === path) {
                return '';
            }
            let extIdx = ext.length - 1;
            let firstNonSlashEnd = -1;
            for (i = path.length - 1; i >= 0; --i) {
                const code = path.charCodeAt(i);
                if (code === CHAR_FORWARD_SLASH) {
                    // If we reached a path separator that was not part of a set of path
                    // separators at the end of the string, stop now
                    if (!matchedSlash) {
                        start = i + 1;
                        break;
                    }
                }
                else {
                    if (firstNonSlashEnd === -1) {
                        // We saw the first non-path separator, remember this index in case
                        // we need it if the extension ends up not matching
                        matchedSlash = false;
                        firstNonSlashEnd = i + 1;
                    }
                    if (extIdx >= 0) {
                        // Try to match the explicit extension
                        if (code === ext.charCodeAt(extIdx)) {
                            if (--extIdx === -1) {
                                // We matched the extension, so mark this as the end of our path
                                // component
                                end = i;
                            }
                        }
                        else {
                            // Extension does not match, so our result is the entire path
                            // component
                            extIdx = -1;
                            end = firstNonSlashEnd;
                        }
                    }
                }
            }
            if (start === end) {
                end = firstNonSlashEnd;
            }
            else if (end === -1) {
                end = path.length;
            }
            return path.slice(start, end);
        }
        for (i = path.length - 1; i >= 0; --i) {
            if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            }
            else if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // path component
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) {
            return '';
        }
        return path.slice(start, end);
    },
    extname(path) {
        validateString(path, 'path');
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;
        for (let i = path.length - 1; i >= 0; --i) {
            const code = path.charCodeAt(i);
            if (code === CHAR_FORWARD_SLASH) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === CHAR_DOT) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1) {
                    startDot = i;
                }
                else if (preDotState !== 1) {
                    preDotState = 1;
                }
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (startDot === -1 ||
            end === -1 ||
            // We saw a non-dot character immediately before the dot
            preDotState === 0 ||
            // The (right-most) trimmed path component is exactly '..'
            (preDotState === 1 &&
                startDot === end - 1 &&
                startDot === startPart + 1)) {
            return '';
        }
        return path.slice(startDot, end);
    },
    format: _format$1.bind(null, '/'),
    parse(path) {
        validateString(path, 'path');
        const ret = { root: '', dir: '', base: '', ext: '', name: '' };
        if (path.length === 0) {
            return ret;
        }
        const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
        let start;
        if (isAbsolute) {
            ret.root = '/';
            start = 1;
        }
        else {
            start = 0;
        }
        let startDot = -1;
        let startPart = 0;
        let end = -1;
        let matchedSlash = true;
        let i = path.length - 1;
        // Track the state of characters (if any) we see before our first dot and
        // after any path separator we find
        let preDotState = 0;
        // Get non-dir info
        for (; i >= start; --i) {
            const code = path.charCodeAt(i);
            if (code === CHAR_FORWARD_SLASH) {
                // If we reached a path separator that was not part of a set of path
                // separators at the end of the string, stop now
                if (!matchedSlash) {
                    startPart = i + 1;
                    break;
                }
                continue;
            }
            if (end === -1) {
                // We saw the first non-path separator, mark this as the end of our
                // extension
                matchedSlash = false;
                end = i + 1;
            }
            if (code === CHAR_DOT) {
                // If this is our first dot, mark it as the start of our extension
                if (startDot === -1) {
                    startDot = i;
                }
                else if (preDotState !== 1) {
                    preDotState = 1;
                }
            }
            else if (startDot !== -1) {
                // We saw a non-dot and non-path separator before our dot, so we should
                // have a good chance at having a non-empty extension
                preDotState = -1;
            }
        }
        if (end !== -1) {
            const start = startPart === 0 && isAbsolute ? 1 : startPart;
            if (startDot === -1 ||
                // We saw a non-dot character immediately before the dot
                preDotState === 0 ||
                // The (right-most) trimmed path component is exactly '..'
                (preDotState === 1 &&
                    startDot === end - 1 &&
                    startDot === startPart + 1)) {
                ret.base = ret.name = path.slice(start, end);
            }
            else {
                ret.name = path.slice(start, startDot);
                ret.base = path.slice(start, end);
                ret.ext = path.slice(startDot, end);
            }
        }
        if (startPart > 0) {
            ret.dir = path.slice(0, startPart - 1);
        }
        else if (isAbsolute) {
            ret.dir = '/';
        }
        return ret;
    },
    sep: '/',
    delimiter: ':',
    win32: null,
    posix: null
};
posix.win32 = win32.win32 = win32;
posix.posix = win32.posix = posix;
const normalize = (platform === 'win32' ? win32.normalize : posix.normalize);
const resolve = (platform === 'win32' ? win32.resolve : posix.resolve);
const relative = (platform === 'win32' ? win32.relative : posix.relative);
const dirname = (platform === 'win32' ? win32.dirname : posix.dirname);
const basename = (platform === 'win32' ? win32.basename : posix.basename);
const extname = (platform === 'win32' ? win32.extname : posix.extname);
const sep = (platform === 'win32' ? win32.sep : posix.sep);

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const _schemePattern = /^\w[\w\d+.-]*$/;
const _singleSlashStart = /^\//;
const _doubleSlashStart = /^\/\//;
function _validateUri(ret, _strict) {
    // scheme, must be set
    if (!ret.scheme && _strict) {
        throw new Error(`[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`);
    }
    // scheme, https://tools.ietf.org/html/rfc3986#section-3.1
    // ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
    if (ret.scheme && !_schemePattern.test(ret.scheme)) {
        throw new Error('[UriError]: Scheme contains illegal characters.');
    }
    // path, http://tools.ietf.org/html/rfc3986#section-3.3
    // If a URI contains an authority component, then the path component
    // must either be empty or begin with a slash ("/") character.  If a URI
    // does not contain an authority component, then the path cannot begin
    // with two slash characters ("//").
    if (ret.path) {
        if (ret.authority) {
            if (!_singleSlashStart.test(ret.path)) {
                throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
            }
        }
        else {
            if (_doubleSlashStart.test(ret.path)) {
                throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
            }
        }
    }
}
// for a while we allowed uris *without* schemes and this is the migration
// for them, e.g. an uri without scheme and without strict-mode warns and falls
// back to the file-scheme. that should cause the least carnage and still be a
// clear warning
function _schemeFix(scheme, _strict) {
    if (!scheme && !_strict) {
        return 'file';
    }
    return scheme;
}
// implements a bit of https://tools.ietf.org/html/rfc3986#section-5
function _referenceResolution(scheme, path) {
    // the slash-character is our 'default base' as we don't
    // support constructing URIs relative to other URIs. This
    // also means that we alter and potentially break paths.
    // see https://tools.ietf.org/html/rfc3986#section-5.1.4
    switch (scheme) {
        case 'https':
        case 'http':
        case 'file':
            if (!path) {
                path = _slash;
            }
            else if (path[0] !== _slash) {
                path = _slash + path;
            }
            break;
    }
    return path;
}
const _empty = '';
const _slash = '/';
const _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
/**
 * Uniform Resource Identifier (URI) http://tools.ietf.org/html/rfc3986.
 * This class is a simple parser which creates the basic component parts
 * (http://tools.ietf.org/html/rfc3986#section-3) with minimal validation
 * and encoding.
 *
 * ```txt
 *       foo://example.com:8042/over/there?name=ferret#nose
 *       \_/   \______________/\_________/ \_________/ \__/
 *        |           |            |            |        |
 *     scheme     authority       path        query   fragment
 *        |   _____________________|__
 *       / \ /                        \
 *       urn:example:animal:ferret:nose
 * ```
 */
class URI {
    /**
     * @internal
     */
    constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
        if (typeof schemeOrData === 'object') {
            this.scheme = schemeOrData.scheme || _empty;
            this.authority = schemeOrData.authority || _empty;
            this.path = schemeOrData.path || _empty;
            this.query = schemeOrData.query || _empty;
            this.fragment = schemeOrData.fragment || _empty;
            // no validation because it's this URI
            // that creates uri components.
            // _validateUri(this);
        }
        else {
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
        return typeof thing.authority === 'string'
            && typeof thing.fragment === 'string'
            && typeof thing.path === 'string'
            && typeof thing.query === 'string'
            && typeof thing.scheme === 'string'
            && typeof thing.fsPath === 'string'
            && typeof thing.with === 'function'
            && typeof thing.toString === 'function';
    }
    // ---- filesystem path -----------------------
    /**
     * Returns a string representing the corresponding file system path of this URI.
     * Will handle UNC paths, normalizes windows drive letters to lower-case, and uses the
     * platform specific path separator.
     *
     * * Will *not* validate the path for invalid characters and semantics.
     * * Will *not* look at the scheme of this URI.
     * * The result shall *not* be used for display purposes but for accessing a file on disk.
     *
     *
     * The *difference* to `URI#path` is the use of the platform specific separator and the handling
     * of UNC paths. See the below sample of a file-uri with an authority (UNC path).
     *
     * ```ts
        const u = URI.parse('file://server/c$/folder/file.txt')
        u.authority === 'server'
        u.path === '/shares/c$/file.txt'
        u.fsPath === '\\server\c$\folder\file.txt'
    ```
     *
     * Using `URI#path` to read a file (using fs-apis) would not be enough because parts of the path,
     * namely the server name, would be missing. Therefore `URI#fsPath` exists - it's sugar to ease working
     * with URIs that represent files on disk (`file` scheme).
     */
    get fsPath() {
        // if (this.scheme !== 'file') {
        // 	console.warn(`[UriError] calling fsPath with scheme ${this.scheme}`);
        // }
        return uriToFsPath(this, false);
    }
    // ---- modify to new -------------------------
    with(change) {
        if (!change) {
            return this;
        }
        let { scheme, authority, path, query, fragment } = change;
        if (scheme === undefined) {
            scheme = this.scheme;
        }
        else if (scheme === null) {
            scheme = _empty;
        }
        if (authority === undefined) {
            authority = this.authority;
        }
        else if (authority === null) {
            authority = _empty;
        }
        if (path === undefined) {
            path = this.path;
        }
        else if (path === null) {
            path = _empty;
        }
        if (query === undefined) {
            query = this.query;
        }
        else if (query === null) {
            query = _empty;
        }
        if (fragment === undefined) {
            fragment = this.fragment;
        }
        else if (fragment === null) {
            fragment = _empty;
        }
        if (scheme === this.scheme
            && authority === this.authority
            && path === this.path
            && query === this.query
            && fragment === this.fragment) {
            return this;
        }
        return new Uri(scheme, authority, path, query, fragment);
    }
    // ---- parse & validate ------------------------
    /**
     * Creates a new URI from a string, e.g. `http://www.msft.com/some/path`,
     * `file:///usr/home`, or `scheme:with/path`.
     *
     * @param value A string which represents an URI (see `URI#toString`).
     */
    static parse(value, _strict = false) {
        const match = _regexp.exec(value);
        if (!match) {
            return new Uri(_empty, _empty, _empty, _empty, _empty);
        }
        return new Uri(match[2] || _empty, percentDecode(match[4] || _empty), percentDecode(match[5] || _empty), percentDecode(match[7] || _empty), percentDecode(match[9] || _empty), _strict);
    }
    /**
     * Creates a new URI from a file system path, e.g. `c:\my\files`,
     * `/usr/home`, or `\\server\share\some\path`.
     *
     * The *difference* between `URI#parse` and `URI#file` is that the latter treats the argument
     * as path, not as stringified-uri. E.g. `URI.file(path)` is **not the same as**
     * `URI.parse('file://' + path)` because the path might contain characters that are
     * interpreted (# and ?). See the following sample:
     * ```ts
    const good = URI.file('/coding/c#/project1');
    good.scheme === 'file';
    good.path === '/coding/c#/project1';
    good.fragment === '';
    const bad = URI.parse('file://' + '/coding/c#/project1');
    bad.scheme === 'file';
    bad.path === '/coding/c'; // path is now broken
    bad.fragment === '/project1';
    ```
     *
     * @param path A file system path (see `URI#fsPath`)
     */
    static file(path) {
        let authority = _empty;
        // normalize to fwd-slashes on windows,
        // on other systems bwd-slashes are valid
        // filename character, eg /f\oo/ba\r.txt
        if (isWindows) {
            path = path.replace(/\\/g, _slash);
        }
        // check for authority as used in UNC shares
        // or use the path as given
        if (path[0] === _slash && path[1] === _slash) {
            const idx = path.indexOf(_slash, 2);
            if (idx === -1) {
                authority = path.substring(2);
                path = _slash;
            }
            else {
                authority = path.substring(2, idx);
                path = path.substring(idx) || _slash;
            }
        }
        return new Uri('file', authority, path, _empty, _empty);
    }
    static from(components) {
        const result = new Uri(components.scheme, components.authority, components.path, components.query, components.fragment);
        _validateUri(result, true);
        return result;
    }
    /**
     * Join a URI path with path fragments and normalizes the resulting path.
     *
     * @param uri The input URI.
     * @param pathFragment The path fragment to add to the URI path.
     * @returns The resulting URI.
     */
    static joinPath(uri, ...pathFragment) {
        if (!uri.path) {
            throw new Error(`[UriError]: cannot call joinPath on URI without path`);
        }
        let newPath;
        if (isWindows && uri.scheme === 'file') {
            newPath = URI.file(win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
        }
        else {
            newPath = posix.join(uri.path, ...pathFragment);
        }
        return uri.with({ path: newPath });
    }
    // ---- printing/externalize ---------------------------
    /**
     * Creates a string representation for this URI. It's guaranteed that calling
     * `URI.parse` with the result of this function creates an URI which is equal
     * to this URI.
     *
     * * The result shall *not* be used for display purposes but for externalization or transport.
     * * The result will be encoded using the percentage encoding and encoding happens mostly
     * ignore the scheme-specific encoding rules.
     *
     * @param skipEncoding Do not encode the result, default is `false`
     */
    toString(skipEncoding = false) {
        return _asFormatted(this, skipEncoding);
    }
    toJSON() {
        return this;
    }
    static revive(data) {
        if (!data) {
            return data;
        }
        else if (data instanceof URI) {
            return data;
        }
        else {
            const result = new Uri(data);
            result._formatted = data.external;
            result._fsPath = data._sep === _pathSepMarker ? data.fsPath : null;
            return result;
        }
    }
}
const _pathSepMarker = isWindows ? 1 : undefined;
// This class exists so that URI is compatibile with vscode.Uri (API).
class Uri extends URI {
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
        }
        else {
            // we don't cache that
            return _asFormatted(this, true);
        }
    }
    toJSON() {
        const res = {
            $mid: 1
        };
        // cached state
        if (this._fsPath) {
            res.fsPath = this._fsPath;
            res._sep = _pathSepMarker;
        }
        if (this._formatted) {
            res.external = this._formatted;
        }
        // uri components
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
}
// reserved characters: https://tools.ietf.org/html/rfc3986#section-2.2
const encodeTable = {
    [58 /* Colon */]: '%3A',
    [47 /* Slash */]: '%2F',
    [63 /* QuestionMark */]: '%3F',
    [35 /* Hash */]: '%23',
    [91 /* OpenSquareBracket */]: '%5B',
    [93 /* CloseSquareBracket */]: '%5D',
    [64 /* AtSign */]: '%40',
    [33 /* ExclamationMark */]: '%21',
    [36 /* DollarSign */]: '%24',
    [38 /* Ampersand */]: '%26',
    [39 /* SingleQuote */]: '%27',
    [40 /* OpenParen */]: '%28',
    [41 /* CloseParen */]: '%29',
    [42 /* Asterisk */]: '%2A',
    [43 /* Plus */]: '%2B',
    [44 /* Comma */]: '%2C',
    [59 /* Semicolon */]: '%3B',
    [61 /* Equals */]: '%3D',
    [32 /* Space */]: '%20',
};
function encodeURIComponentFast(uriComponent, allowSlash) {
    let res = undefined;
    let nativeEncodePos = -1;
    for (let pos = 0; pos < uriComponent.length; pos++) {
        const code = uriComponent.charCodeAt(pos);
        // unreserved characters: https://tools.ietf.org/html/rfc3986#section-2.3
        if ((code >= 97 /* a */ && code <= 122 /* z */)
            || (code >= 65 /* A */ && code <= 90 /* Z */)
            || (code >= 48 /* Digit0 */ && code <= 57 /* Digit9 */)
            || code === 45 /* Dash */
            || code === 46 /* Period */
            || code === 95 /* Underline */
            || code === 126 /* Tilde */
            || (allowSlash && code === 47 /* Slash */)) {
            // check if we are delaying native encode
            if (nativeEncodePos !== -1) {
                res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                nativeEncodePos = -1;
            }
            // check if we write into a new string (by default we try to return the param)
            if (res !== undefined) {
                res += uriComponent.charAt(pos);
            }
        }
        else {
            // encoding needed, we need to allocate a new string
            if (res === undefined) {
                res = uriComponent.substr(0, pos);
            }
            // check with default table first
            const escaped = encodeTable[code];
            if (escaped !== undefined) {
                // check if we are delaying native encode
                if (nativeEncodePos !== -1) {
                    res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                    nativeEncodePos = -1;
                }
                // append escaped variant to result
                res += escaped;
            }
            else if (nativeEncodePos === -1) {
                // use native encode only when needed
                nativeEncodePos = pos;
            }
        }
    }
    if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
    }
    return res !== undefined ? res : uriComponent;
}
function encodeURIComponentMinimal(path) {
    let res = undefined;
    for (let pos = 0; pos < path.length; pos++) {
        const code = path.charCodeAt(pos);
        if (code === 35 /* Hash */ || code === 63 /* QuestionMark */) {
            if (res === undefined) {
                res = path.substr(0, pos);
            }
            res += encodeTable[code];
        }
        else {
            if (res !== undefined) {
                res += path[pos];
            }
        }
    }
    return res !== undefined ? res : path;
}
/**
 * Compute `fsPath` for the given uri
 */
function uriToFsPath(uri, keepDriveLetterCasing) {
    let value;
    if (uri.authority && uri.path.length > 1 && uri.scheme === 'file') {
        // unc path: file://shares/c$/far/boo
        value = `//${uri.authority}${uri.path}`;
    }
    else if (uri.path.charCodeAt(0) === 47 /* Slash */
        && (uri.path.charCodeAt(1) >= 65 /* A */ && uri.path.charCodeAt(1) <= 90 /* Z */ || uri.path.charCodeAt(1) >= 97 /* a */ && uri.path.charCodeAt(1) <= 122 /* z */)
        && uri.path.charCodeAt(2) === 58 /* Colon */) {
        if (!keepDriveLetterCasing) {
            // windows drive letter: file:///c:/far/boo
            value = uri.path[1].toLowerCase() + uri.path.substr(2);
        }
        else {
            value = uri.path.substr(1);
        }
    }
    else {
        // other path
        value = uri.path;
    }
    if (isWindows) {
        value = value.replace(/\//g, '\\');
    }
    return value;
}
/**
 * Create the external version of a uri
 */
function _asFormatted(uri, skipEncoding) {
    const encoder = !skipEncoding
        ? encodeURIComponentFast
        : encodeURIComponentMinimal;
    let res = '';
    let { scheme, authority, path, query, fragment } = uri;
    if (scheme) {
        res += scheme;
        res += ':';
    }
    if (authority || scheme === 'file') {
        res += _slash;
        res += _slash;
    }
    if (authority) {
        let idx = authority.indexOf('@');
        if (idx !== -1) {
            // <user>@<auth>
            const userinfo = authority.substr(0, idx);
            authority = authority.substr(idx + 1);
            idx = userinfo.indexOf(':');
            if (idx === -1) {
                res += encoder(userinfo, false);
            }
            else {
                // <user>:<pass>@<auth>
                res += encoder(userinfo.substr(0, idx), false);
                res += ':';
                res += encoder(userinfo.substr(idx + 1), false);
            }
            res += '@';
        }
        authority = authority.toLowerCase();
        idx = authority.indexOf(':');
        if (idx === -1) {
            res += encoder(authority, false);
        }
        else {
            // <auth>:<port>
            res += encoder(authority.substr(0, idx), false);
            res += authority.substr(idx);
        }
    }
    if (path) {
        // lower-case windows drive letters in /C:/fff or C:/fff
        if (path.length >= 3 && path.charCodeAt(0) === 47 /* Slash */ && path.charCodeAt(2) === 58 /* Colon */) {
            const code = path.charCodeAt(1);
            if (code >= 65 /* A */ && code <= 90 /* Z */) {
                path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`; // "/c:".length === 3
            }
        }
        else if (path.length >= 2 && path.charCodeAt(1) === 58 /* Colon */) {
            const code = path.charCodeAt(0);
            if (code >= 65 /* A */ && code <= 90 /* Z */) {
                path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`; // "/c:".length === 3
            }
        }
        // encode the rest of the path
        res += encoder(path, true);
    }
    if (query) {
        res += '?';
        res += encoder(query, false);
    }
    if (fragment) {
        res += '#';
        res += !skipEncoding ? encodeURIComponentFast(fragment, false) : fragment;
    }
    return res;
}
// --- decode
function decodeURIComponentGraceful(str) {
    try {
        return decodeURIComponent(str);
    }
    catch (_a) {
        if (str.length > 3) {
            return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
        }
        else {
            return str;
        }
    }
}
const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
function percentDecode(str) {
    if (!str.match(_rEncodedAsHex)) {
        return str;
    }
    return str.replace(_rEncodedAsHex, (match) => decodeURIComponentGraceful(match));
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * A position in the editor.
 */
class Position {
    constructor(lineNumber, column) {
        this.lineNumber = lineNumber;
        this.column = column;
    }
    /**
     * Create a new position from this position.
     *
     * @param newLineNumber new line number
     * @param newColumn new column
     */
    with(newLineNumber = this.lineNumber, newColumn = this.column) {
        if (newLineNumber === this.lineNumber && newColumn === this.column) {
            return this;
        }
        else {
            return new Position(newLineNumber, newColumn);
        }
    }
    /**
     * Derive a new position from this position.
     *
     * @param deltaLineNumber line number delta
     * @param deltaColumn column delta
     */
    delta(deltaLineNumber = 0, deltaColumn = 0) {
        return this.with(this.lineNumber + deltaLineNumber, this.column + deltaColumn);
    }
    /**
     * Test if this position equals other position
     */
    equals(other) {
        return Position.equals(this, other);
    }
    /**
     * Test if position `a` equals position `b`
     */
    static equals(a, b) {
        if (!a && !b) {
            return true;
        }
        return (!!a &&
            !!b &&
            a.lineNumber === b.lineNumber &&
            a.column === b.column);
    }
    /**
     * Test if this position is before other position.
     * If the two positions are equal, the result will be false.
     */
    isBefore(other) {
        return Position.isBefore(this, other);
    }
    /**
     * Test if position `a` is before position `b`.
     * If the two positions are equal, the result will be false.
     */
    static isBefore(a, b) {
        if (a.lineNumber < b.lineNumber) {
            return true;
        }
        if (b.lineNumber < a.lineNumber) {
            return false;
        }
        return a.column < b.column;
    }
    /**
     * Test if this position is before other position.
     * If the two positions are equal, the result will be true.
     */
    isBeforeOrEqual(other) {
        return Position.isBeforeOrEqual(this, other);
    }
    /**
     * Test if position `a` is before position `b`.
     * If the two positions are equal, the result will be true.
     */
    static isBeforeOrEqual(a, b) {
        if (a.lineNumber < b.lineNumber) {
            return true;
        }
        if (b.lineNumber < a.lineNumber) {
            return false;
        }
        return a.column <= b.column;
    }
    /**
     * A function that compares positions, useful for sorting
     */
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
    /**
     * Clone this position.
     */
    clone() {
        return new Position(this.lineNumber, this.column);
    }
    /**
     * Convert to a human-readable representation.
     */
    toString() {
        return '(' + this.lineNumber + ',' + this.column + ')';
    }
    // ---
    /**
     * Create a `Position` from an `IPosition`.
     */
    static lift(pos) {
        return new Position(pos.lineNumber, pos.column);
    }
    /**
     * Test if `obj` is an `IPosition`.
     */
    static isIPosition(obj) {
        return (obj
            && (typeof obj.lineNumber === 'number')
            && (typeof obj.column === 'number'));
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * A range in the editor. (startLineNumber,startColumn) is <= (endLineNumber,endColumn)
 */
class Range {
    constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
        if ((startLineNumber > endLineNumber) || (startLineNumber === endLineNumber && startColumn > endColumn)) {
            this.startLineNumber = endLineNumber;
            this.startColumn = endColumn;
            this.endLineNumber = startLineNumber;
            this.endColumn = startColumn;
        }
        else {
            this.startLineNumber = startLineNumber;
            this.startColumn = startColumn;
            this.endLineNumber = endLineNumber;
            this.endColumn = endColumn;
        }
    }
    /**
     * Test if this range is empty.
     */
    isEmpty() {
        return Range.isEmpty(this);
    }
    /**
     * Test if `range` is empty.
     */
    static isEmpty(range) {
        return (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn);
    }
    /**
     * Test if position is in this range. If the position is at the edges, will return true.
     */
    containsPosition(position) {
        return Range.containsPosition(this, position);
    }
    /**
     * Test if `position` is in `range`. If the position is at the edges, will return true.
     */
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
    /**
     * Test if range is in this range. If the range is equal to this range, will return true.
     */
    containsRange(range) {
        return Range.containsRange(this, range);
    }
    /**
     * Test if `otherRange` is in `range`. If the ranges are equal, will return true.
     */
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
    /**
     * Test if `range` is strictly in this range. `range` must start after and end before this range for the result to be true.
     */
    strictContainsRange(range) {
        return Range.strictContainsRange(this, range);
    }
    /**
     * Test if `otherRange` is strinctly in `range` (must start after, and end before). If the ranges are equal, will return false.
     */
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
    /**
     * A reunion of the two ranges.
     * The smallest position will be used as the start point, and the largest one as the end point.
     */
    plusRange(range) {
        return Range.plusRange(this, range);
    }
    /**
     * A reunion of the two ranges.
     * The smallest position will be used as the start point, and the largest one as the end point.
     */
    static plusRange(a, b) {
        let startLineNumber;
        let startColumn;
        let endLineNumber;
        let endColumn;
        if (b.startLineNumber < a.startLineNumber) {
            startLineNumber = b.startLineNumber;
            startColumn = b.startColumn;
        }
        else if (b.startLineNumber === a.startLineNumber) {
            startLineNumber = b.startLineNumber;
            startColumn = Math.min(b.startColumn, a.startColumn);
        }
        else {
            startLineNumber = a.startLineNumber;
            startColumn = a.startColumn;
        }
        if (b.endLineNumber > a.endLineNumber) {
            endLineNumber = b.endLineNumber;
            endColumn = b.endColumn;
        }
        else if (b.endLineNumber === a.endLineNumber) {
            endLineNumber = b.endLineNumber;
            endColumn = Math.max(b.endColumn, a.endColumn);
        }
        else {
            endLineNumber = a.endLineNumber;
            endColumn = a.endColumn;
        }
        return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }
    /**
     * A intersection of the two ranges.
     */
    intersectRanges(range) {
        return Range.intersectRanges(this, range);
    }
    /**
     * A intersection of the two ranges.
     */
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
        }
        else if (resultStartLineNumber === otherStartLineNumber) {
            resultStartColumn = Math.max(resultStartColumn, otherStartColumn);
        }
        if (resultEndLineNumber > otherEndLineNumber) {
            resultEndLineNumber = otherEndLineNumber;
            resultEndColumn = otherEndColumn;
        }
        else if (resultEndLineNumber === otherEndLineNumber) {
            resultEndColumn = Math.min(resultEndColumn, otherEndColumn);
        }
        // Check if selection is now empty
        if (resultStartLineNumber > resultEndLineNumber) {
            return null;
        }
        if (resultStartLineNumber === resultEndLineNumber && resultStartColumn > resultEndColumn) {
            return null;
        }
        return new Range(resultStartLineNumber, resultStartColumn, resultEndLineNumber, resultEndColumn);
    }
    /**
     * Test if this range equals other.
     */
    equalsRange(other) {
        return Range.equalsRange(this, other);
    }
    /**
     * Test if range `a` equals `b`.
     */
    static equalsRange(a, b) {
        return (!!a &&
            !!b &&
            a.startLineNumber === b.startLineNumber &&
            a.startColumn === b.startColumn &&
            a.endLineNumber === b.endLineNumber &&
            a.endColumn === b.endColumn);
    }
    /**
     * Return the end position (which will be after or equal to the start position)
     */
    getEndPosition() {
        return Range.getEndPosition(this);
    }
    /**
     * Return the end position (which will be after or equal to the start position)
     */
    static getEndPosition(range) {
        return new Position(range.endLineNumber, range.endColumn);
    }
    /**
     * Return the start position (which will be before or equal to the end position)
     */
    getStartPosition() {
        return Range.getStartPosition(this);
    }
    /**
     * Return the start position (which will be before or equal to the end position)
     */
    static getStartPosition(range) {
        return new Position(range.startLineNumber, range.startColumn);
    }
    /**
     * Transform to a user presentable string representation.
     */
    toString() {
        return '[' + this.startLineNumber + ',' + this.startColumn + ' -> ' + this.endLineNumber + ',' + this.endColumn + ']';
    }
    /**
     * Create a new range using this range's start position, and using endLineNumber and endColumn as the end position.
     */
    setEndPosition(endLineNumber, endColumn) {
        return new Range(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
    }
    /**
     * Create a new range using this range's end position, and using startLineNumber and startColumn as the start position.
     */
    setStartPosition(startLineNumber, startColumn) {
        return new Range(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
    }
    /**
     * Create a new empty range using this range's start position.
     */
    collapseToStart() {
        return Range.collapseToStart(this);
    }
    /**
     * Create a new empty range using this range's start position.
     */
    static collapseToStart(range) {
        return new Range(range.startLineNumber, range.startColumn, range.startLineNumber, range.startColumn);
    }
    // ---
    static fromPositions(start, end = start) {
        return new Range(start.lineNumber, start.column, end.lineNumber, end.column);
    }
    static lift(range) {
        if (!range) {
            return null;
        }
        return new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
    }
    /**
     * Test if `obj` is an `IRange`.
     */
    static isIRange(obj) {
        return (obj
            && (typeof obj.startLineNumber === 'number')
            && (typeof obj.startColumn === 'number')
            && (typeof obj.endLineNumber === 'number')
            && (typeof obj.endColumn === 'number'));
    }
    /**
     * Test if the two ranges are touching in any way.
     */
    static areIntersectingOrTouching(a, b) {
        // Check if `a` is before `b`
        if (a.endLineNumber < b.startLineNumber || (a.endLineNumber === b.startLineNumber && a.endColumn < b.startColumn)) {
            return false;
        }
        // Check if `b` is before `a`
        if (b.endLineNumber < a.startLineNumber || (b.endLineNumber === a.startLineNumber && b.endColumn < a.startColumn)) {
            return false;
        }
        // These ranges must intersect
        return true;
    }
    /**
     * Test if the two ranges are intersecting. If the ranges are touching it returns true.
     */
    static areIntersecting(a, b) {
        // Check if `a` is before `b`
        if (a.endLineNumber < b.startLineNumber || (a.endLineNumber === b.startLineNumber && a.endColumn <= b.startColumn)) {
            return false;
        }
        // Check if `b` is before `a`
        if (b.endLineNumber < a.startLineNumber || (b.endLineNumber === a.startLineNumber && b.endColumn <= a.startColumn)) {
            return false;
        }
        // These ranges must intersect
        return true;
    }
    /**
     * A function that compares ranges, useful for sorting ranges
     * It will first compare ranges on the startPosition and then on the endPosition
     */
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
        const aExists = (a ? 1 : 0);
        const bExists = (b ? 1 : 0);
        return aExists - bExists;
    }
    /**
     * A function that compares ranges, useful for sorting ranges
     * It will first compare ranges on the endPosition and then on the startPosition
     */
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
    /**
     * Test if the range spans multiple lines.
     */
    static spansMultipleLines(range) {
        return range.endLineNumber > range.startLineNumber;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * A selection in the editor.
 * The selection is a range that has an orientation.
 */
class Selection extends Range {
    constructor(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn) {
        super(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn);
        this.selectionStartLineNumber = selectionStartLineNumber;
        this.selectionStartColumn = selectionStartColumn;
        this.positionLineNumber = positionLineNumber;
        this.positionColumn = positionColumn;
    }
    /**
     * Transform to a human-readable representation.
     */
    toString() {
        return '[' + this.selectionStartLineNumber + ',' + this.selectionStartColumn + ' -> ' + this.positionLineNumber + ',' + this.positionColumn + ']';
    }
    /**
     * Test if equals other selection.
     */
    equalsSelection(other) {
        return (Selection.selectionsEqual(this, other));
    }
    /**
     * Test if the two selections are equal.
     */
    static selectionsEqual(a, b) {
        return (a.selectionStartLineNumber === b.selectionStartLineNumber &&
            a.selectionStartColumn === b.selectionStartColumn &&
            a.positionLineNumber === b.positionLineNumber &&
            a.positionColumn === b.positionColumn);
    }
    /**
     * Get directions (LTR or RTL).
     */
    getDirection() {
        if (this.selectionStartLineNumber === this.startLineNumber && this.selectionStartColumn === this.startColumn) {
            return 0 /* LTR */;
        }
        return 1 /* RTL */;
    }
    /**
     * Create a new selection with a different `positionLineNumber` and `positionColumn`.
     */
    setEndPosition(endLineNumber, endColumn) {
        if (this.getDirection() === 0 /* LTR */) {
            return new Selection(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
        }
        return new Selection(endLineNumber, endColumn, this.startLineNumber, this.startColumn);
    }
    /**
     * Get the position at `positionLineNumber` and `positionColumn`.
     */
    getPosition() {
        return new Position(this.positionLineNumber, this.positionColumn);
    }
    /**
     * Create a new selection with a different `selectionStartLineNumber` and `selectionStartColumn`.
     */
    setStartPosition(startLineNumber, startColumn) {
        if (this.getDirection() === 0 /* LTR */) {
            return new Selection(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
        }
        return new Selection(this.endLineNumber, this.endColumn, startLineNumber, startColumn);
    }
    // ----
    /**
     * Create a `Selection` from one or two positions
     */
    static fromPositions(start, end = start) {
        return new Selection(start.lineNumber, start.column, end.lineNumber, end.column);
    }
    /**
     * Create a `Selection` from an `ISelection`.
     */
    static liftSelection(sel) {
        return new Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
    }
    /**
     * `a` equals `b`.
     */
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
    /**
     * Test if `obj` is an `ISelection`.
     */
    static isISelection(obj) {
        return (obj
            && (typeof obj.selectionStartLineNumber === 'number')
            && (typeof obj.selectionStartColumn === 'number')
            && (typeof obj.positionLineNumber === 'number')
            && (typeof obj.positionColumn === 'number'));
    }
    /**
     * Create with a direction.
     */
    static createWithDirection(startLineNumber, startColumn, endLineNumber, endColumn, direction) {
        if (direction === 0 /* LTR */) {
            return new Selection(startLineNumber, startColumn, endLineNumber, endColumn);
        }
        return new Selection(endLineNumber, endColumn, startLineNumber, startColumn);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class Token {
    constructor(offset, type, language) {
        this.offset = offset | 0; // @perf
        this.type = type;
        this.language = language;
    }
    toString() {
        return '(' + this.offset + ', ' + this.type + ')';
    }
}
class TokenizationResult {
    constructor(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
}
class TokenizationResult2 {
    constructor(tokens, endState) {
        this.tokens = tokens;
        this.endState = endState;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// ------ internal util
var _util;
(function (_util) {
    _util.serviceIds = new Map();
    _util.DI_TARGET = '$di$target';
    _util.DI_DEPENDENCIES = '$di$dependencies';
    function getServiceDependencies(ctor) {
        return ctor[_util.DI_DEPENDENCIES] || [];
    }
    _util.getServiceDependencies = getServiceDependencies;
})(_util || (_util = {}));
const IInstantiationService = createDecorator('instantiationService');
function storeServiceDependency(id, target, index, optional) {
    if (target[_util.DI_TARGET] === target) {
        target[_util.DI_DEPENDENCIES].push({ id, index, optional });
    }
    else {
        target[_util.DI_DEPENDENCIES] = [{ id, index, optional }];
        target[_util.DI_TARGET] = target;
    }
}
/**
 * The *only* valid way to create a {{ServiceIdentifier}}.
 */
function createDecorator(serviceId) {
    if (_util.serviceIds.has(serviceId)) {
        return _util.serviceIds.get(serviceId);
    }
    const id = function (target, key, index) {
        if (arguments.length !== 3) {
            throw new Error('@IServiceName-decorator can only be used to decorate a parameter');
        }
        storeServiceDependency(id, target, index, false);
    };
    id.toString = () => serviceId;
    _util.serviceIds.set(serviceId, id);
    return id;
}
/**
 * Mark a service dependency as optional.
 */
function optional(serviceIdentifier) {
    return function (target, key, index) {
        if (arguments.length !== 3) {
            throw new Error('@optional-decorator can only be used to decorate a parameter');
        }
        storeServiceDependency(serviceIdentifier, target, index, true);
    };
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function isThenable(obj) {
    return !!obj && typeof obj.then === 'function';
}
function createCancelablePromise(callback) {
    const source = new CancellationTokenSource();
    const thenable = callback(source.token);
    const promise = new Promise((resolve, reject) => {
        source.token.onCancellationRequested(() => {
            reject(canceled());
        });
        Promise.resolve(thenable).then(value => {
            source.dispose();
            resolve(value);
        }, err => {
            source.dispose();
            reject(err);
        });
    });
    return new class {
        cancel() {
            source.cancel();
        }
        then(resolve, reject) {
            return promise.then(resolve, reject);
        }
        catch(reject) {
            return this.then(undefined, reject);
        }
        finally(onfinally) {
            return promise.finally(onfinally);
        }
    };
}
function raceCancellation(promise, token, defaultValue) {
    return Promise.race([promise, new Promise(resolve => token.onCancellationRequested(() => resolve(defaultValue)))]);
}
/**
 * A helper to prevent accumulation of sequential async tasks.
 *
 * Imagine a mail man with the sole task of delivering letters. As soon as
 * a letter submitted for delivery, he drives to the destination, delivers it
 * and returns to his base. Imagine that during the trip, N more letters were submitted.
 * When the mail man returns, he picks those N letters and delivers them all in a
 * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
 *
 * The throttler implements this via the queue() method, by providing it a task
 * factory. Following the example:
 *
 * 		const throttler = new Throttler();
 * 		const letters = [];
 *
 * 		function deliver() {
 * 			const lettersToDeliver = letters;
 * 			letters = [];
 * 			return makeTheTrip(lettersToDeliver);
 * 		}
 *
 * 		function onLetterReceived(l) {
 * 			letters.push(l);
 * 			throttler.queue(deliver);
 * 		}
 */
class Throttler {
    constructor() {
        this.activePromise = null;
        this.queuedPromise = null;
        this.queuedPromiseFactory = null;
    }
    queue(promiseFactory) {
        if (this.activePromise) {
            this.queuedPromiseFactory = promiseFactory;
            if (!this.queuedPromise) {
                const onComplete = () => {
                    this.queuedPromise = null;
                    const result = this.queue(this.queuedPromiseFactory);
                    this.queuedPromiseFactory = null;
                    return result;
                };
                this.queuedPromise = new Promise(resolve => {
                    this.activePromise.then(onComplete, onComplete).then(resolve);
                });
            }
            return new Promise((resolve, reject) => {
                this.queuedPromise.then(resolve, reject);
            });
        }
        this.activePromise = promiseFactory();
        return new Promise((resolve, reject) => {
            this.activePromise.then((result) => {
                this.activePromise = null;
                resolve(result);
            }, (err) => {
                this.activePromise = null;
                reject(err);
            });
        });
    }
}
/**
 * A helper to delay (debounce) execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 * 		const delayer = new Delayer(WAITING_PERIOD);
 * 		const letters = [];
 *
 * 		function letterReceived(l) {
 * 			letters.push(l);
 * 			delayer.trigger(() => { return makeTheTrip(); });
 * 		}
 */
class Delayer {
    constructor(defaultDelay) {
        this.defaultDelay = defaultDelay;
        this.timeout = null;
        this.completionPromise = null;
        this.doResolve = null;
        this.doReject = null;
        this.task = null;
    }
    trigger(task, delay = this.defaultDelay) {
        this.task = task;
        this.cancelTimeout();
        if (!this.completionPromise) {
            this.completionPromise = new Promise((resolve, reject) => {
                this.doResolve = resolve;
                this.doReject = reject;
            }).then(() => {
                this.completionPromise = null;
                this.doResolve = null;
                if (this.task) {
                    const task = this.task;
                    this.task = null;
                    return task();
                }
                return undefined;
            });
        }
        this.timeout = setTimeout(() => {
            this.timeout = null;
            if (this.doResolve) {
                this.doResolve(null);
            }
        }, delay);
        return this.completionPromise;
    }
    isTriggered() {
        return this.timeout !== null;
    }
    cancel() {
        this.cancelTimeout();
        if (this.completionPromise) {
            if (this.doReject) {
                this.doReject(canceled());
            }
            this.completionPromise = null;
        }
    }
    cancelTimeout() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    dispose() {
        this.cancelTimeout();
    }
}
/**
 * A helper to delay execution of a task that is being requested often, while
 * preventing accumulation of consecutive executions, while the task runs.
 *
 * The mail man is clever and waits for a certain amount of time, before going
 * out to deliver letters. While the mail man is going out, more letters arrive
 * and can only be delivered once he is back. Once he is back the mail man will
 * do one more trip to deliver the letters that have accumulated while he was out.
 */
class ThrottledDelayer {
    constructor(defaultDelay) {
        this.delayer = new Delayer(defaultDelay);
        this.throttler = new Throttler();
    }
    trigger(promiseFactory, delay) {
        return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
    }
    cancel() {
        this.delayer.cancel();
    }
    dispose() {
        this.delayer.dispose();
    }
}
function timeout(millis, token) {
    if (!token) {
        return createCancelablePromise(token => timeout(millis, token));
    }
    return new Promise((resolve, reject) => {
        const handle = setTimeout(resolve, millis);
        token.onCancellationRequested(() => {
            clearTimeout(handle);
            reject(canceled());
        });
    });
}
function disposableTimeout(handler, timeout = 0) {
    const timer = setTimeout(handler, timeout);
    return toDisposable(() => clearTimeout(timer));
}
function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
    let index = 0;
    const len = promiseFactories.length;
    const loop = () => {
        if (index >= len) {
            return Promise.resolve(defaultValue);
        }
        const factory = promiseFactories[index++];
        const promise = Promise.resolve(factory());
        return promise.then(result => {
            if (shouldStop(result)) {
                return Promise.resolve(result);
            }
            return loop();
        });
    };
    return loop();
}
class TimeoutTimer {
    constructor(runner, timeout) {
        this._token = -1;
        if (typeof runner === 'function' && typeof timeout === 'number') {
            this.setIfNotSet(runner, timeout);
        }
    }
    dispose() {
        this.cancel();
    }
    cancel() {
        if (this._token !== -1) {
            clearTimeout(this._token);
            this._token = -1;
        }
    }
    cancelAndSet(runner, timeout) {
        this.cancel();
        this._token = setTimeout(() => {
            this._token = -1;
            runner();
        }, timeout);
    }
    setIfNotSet(runner, timeout) {
        if (this._token !== -1) {
            // timer is already set
            return;
        }
        this._token = setTimeout(() => {
            this._token = -1;
            runner();
        }, timeout);
    }
}
class IntervalTimer {
    constructor() {
        this._token = -1;
    }
    dispose() {
        this.cancel();
    }
    cancel() {
        if (this._token !== -1) {
            clearInterval(this._token);
            this._token = -1;
        }
    }
    cancelAndSet(runner, interval) {
        this.cancel();
        this._token = setInterval(() => {
            runner();
        }, interval);
    }
}
class RunOnceScheduler {
    constructor(runner, delay) {
        this.timeoutToken = -1;
        this.runner = runner;
        this.timeout = delay;
        this.timeoutHandler = this.onTimeout.bind(this);
    }
    /**
     * Dispose RunOnceScheduler
     */
    dispose() {
        this.cancel();
        this.runner = null;
    }
    /**
     * Cancel current scheduled runner (if any).
     */
    cancel() {
        if (this.isScheduled()) {
            clearTimeout(this.timeoutToken);
            this.timeoutToken = -1;
        }
    }
    /**
     * Cancel previous runner (if any) & schedule a new runner.
     */
    schedule(delay = this.timeout) {
        this.cancel();
        this.timeoutToken = setTimeout(this.timeoutHandler, delay);
    }
    get delay() {
        return this.timeout;
    }
    set delay(value) {
        this.timeout = value;
    }
    /**
     * Returns true if scheduled.
     */
    isScheduled() {
        return this.timeoutToken !== -1;
    }
    onTimeout() {
        this.timeoutToken = -1;
        if (this.runner) {
            this.doRun();
        }
    }
    doRun() {
        if (this.runner) {
            this.runner();
        }
    }
}
/**
 * Execute the callback the next time the browser is idle
 */
let runWhenIdle;
(function () {
    if (typeof requestIdleCallback !== 'function' || typeof cancelIdleCallback !== 'function') {
        const dummyIdle = Object.freeze({
            didTimeout: true,
            timeRemaining() { return 15; }
        });
        runWhenIdle = (runner) => {
            const handle = setTimeout(() => runner(dummyIdle));
            let disposed = false;
            return {
                dispose() {
                    if (disposed) {
                        return;
                    }
                    disposed = true;
                    clearTimeout(handle);
                }
            };
        };
    }
    else {
        runWhenIdle = (runner, timeout) => {
            const handle = requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
            let disposed = false;
            return {
                dispose() {
                    if (disposed) {
                        return;
                    }
                    disposed = true;
                    cancelIdleCallback(handle);
                }
            };
        };
    }
})();
/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */
class IdleValue {
    constructor(executor) {
        this._didRun = false;
        this._executor = () => {
            try {
                this._value = executor();
            }
            catch (err) {
                this._error = err;
            }
            finally {
                this._didRun = true;
            }
        };
        this._handle = runWhenIdle(() => this._executor());
    }
    dispose() {
        this._handle.dispose();
    }
    get value() {
        if (!this._didRun) {
            this._handle.dispose();
            this._executor();
        }
        if (this._error) {
            throw this._error;
        }
        return this._value;
    }
}
//#endregion
//#region Promises
var Promises;
(function (Promises) {
    /**
     * A polyfill of `Promise.allSettled`: returns after all promises have
     * resolved or rejected and provides access to each result or error
     * in the order of the original passed in promises array.
     * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
     */
    function allSettled(promises) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof Promise.allSettled === 'function') {
                return allSettledNative(promises); // in some environments we can benefit from native implementation
            }
            return allSettledShim(promises);
        });
    }
    Promises.allSettled = allSettled;
    function allSettledNative(promises) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.allSettled(promises);
        });
    }
    function allSettledShim(promises) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(promises.map(promise => (promise.then(value => {
                const fulfilled = { status: 'fulfilled', value };
                return fulfilled;
            }, error => {
                const rejected = { status: 'rejected', reason: error };
                return rejected;
            }))));
        });
    }
    /**
     * A drop-in replacement for `Promise.all` with the only difference
     * that the method awaits every promise to either fulfill or reject.
     *
     * Similar to `Promise.all`, only the first error will be returned
     * if any.
     */
    function settled(promises) {
        return __awaiter(this, void 0, void 0, function* () {
            let firstError = undefined;
            const result = yield Promise.all(promises.map(promise => promise.then(value => value, error => {
                if (!firstError) {
                    firstError = error;
                }
                return undefined; // do not rethrow so that other promises can settle
            })));
            if (typeof firstError !== 'undefined') {
                throw firstError;
            }
            return result; // cast is needed and protected by the `throw` above
        });
    }
    Promises.settled = settled;
})(Promises || (Promises = {}));
//#endregion

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var Schemas;
(function (Schemas) {
    /**
     * A schema that is used for models that exist in memory
     * only and that have no correspondence on a server or such.
     */
    Schemas.inMemory = 'inmemory';
    /**
     * A schema that is used for setting files
     */
    Schemas.vscode = 'vscode';
    /**
     * A schema that is used for internal private files
     */
    Schemas.internal = 'private';
    /**
     * A walk-through document.
     */
    Schemas.walkThrough = 'walkThrough';
    /**
     * An embedded code snippet.
     */
    Schemas.walkThroughSnippet = 'walkThroughSnippet';
    Schemas.http = 'http';
    Schemas.https = 'https';
    Schemas.file = 'file';
    Schemas.mailto = 'mailto';
    Schemas.untitled = 'untitled';
    Schemas.data = 'data';
    Schemas.command = 'command';
    Schemas.vscodeRemote = 'vscode-remote';
    Schemas.vscodeRemoteResource = 'vscode-remote-resource';
    Schemas.userData = 'vscode-userdata';
    Schemas.vscodeCustomEditor = 'vscode-custom-editor';
    Schemas.vscodeNotebook = 'vscode-notebook';
    Schemas.vscodeNotebookCell = 'vscode-notebook-cell';
    Schemas.vscodeNotebookCellMetadata = 'vscode-notebook-cell-metadata';
    Schemas.vscodeNotebookCellOutput = 'vscode-notebook-cell-output';
    Schemas.vscodeSettings = 'vscode-settings';
    Schemas.vscodeWorkspaceTrust = 'vscode-workspace-trust';
    Schemas.vscodeTerminal = 'vscode-terminal';
    Schemas.webviewPanel = 'webview-panel';
    /**
     * Scheme used for loading the wrapper html and script in webviews.
     */
    Schemas.vscodeWebview = 'vscode-webview';
    /**
     * Scheme used for extension pages
     */
    Schemas.extension = 'extension';
    /**
     * Scheme used as a replacement of `file` scheme to load
     * files with our custom protocol handler (desktop only).
     */
    Schemas.vscodeFileResource = 'vscode-file';
    /**
     * Scheme used for temporary resources
     */
    Schemas.tmp = 'tmp';
})(Schemas || (Schemas = {}));
class RemoteAuthoritiesImpl {
    constructor() {
        this._hosts = Object.create(null);
        this._ports = Object.create(null);
        this._connectionTokens = Object.create(null);
        this._preferredWebSchema = 'http';
        this._delegate = null;
    }
    setPreferredWebSchema(schema) {
        this._preferredWebSchema = schema;
    }
    rewrite(uri) {
        if (this._delegate) {
            return this._delegate(uri);
        }
        const authority = uri.authority;
        let host = this._hosts[authority];
        if (host && host.indexOf(':') !== -1) {
            host = `[${host}]`;
        }
        const port = this._ports[authority];
        const connectionToken = this._connectionTokens[authority];
        let query = `path=${encodeURIComponent(uri.path)}`;
        if (typeof connectionToken === 'string') {
            query += `&tkn=${encodeURIComponent(connectionToken)}`;
        }
        return URI.from({
            scheme: isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
            authority: `${host}:${port}`,
            path: `/vscode-remote-resource`,
            query
        });
    }
}
const RemoteAuthorities = new RemoteAuthoritiesImpl();
class FileAccessImpl {
    constructor() {
        this.FALLBACK_AUTHORITY = 'vscode-app';
    }
    asBrowserUri(uriOrModule, moduleIdToUrl, __forceCodeFileUri) {
        const uri = this.toUri(uriOrModule, moduleIdToUrl);
        // Handle remote URIs via `RemoteAuthorities`
        if (uri.scheme === Schemas.vscodeRemote) {
            return RemoteAuthorities.rewrite(uri);
        }
        // Only convert the URI if we are in a native context and it has `file:` scheme
        // and we have explicitly enabled the conversion (sandbox, or VSCODE_BROWSER_CODE_LOADING)
        if (isNative && (__forceCodeFileUri || isPreferringBrowserCodeLoad) && uri.scheme === Schemas.file) {
            return uri.with({
                scheme: Schemas.vscodeFileResource,
                // We need to provide an authority here so that it can serve
                // as origin for network and loading matters in chromium.
                // If the URI is not coming with an authority already, we
                // add our own
                authority: uri.authority || this.FALLBACK_AUTHORITY,
                query: null,
                fragment: null
            });
        }
        return uri;
    }
    toUri(uriOrModule, moduleIdToUrl) {
        if (URI.isUri(uriOrModule)) {
            return uriOrModule;
        }
        return URI.parse(moduleIdToUrl.toUrl(uriOrModule));
    }
}
const FileAccess = new FileAccessImpl();

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function isFalsyOrWhitespace(str) {
    if (!str || typeof str !== 'string') {
        return true;
    }
    return str.trim().length === 0;
}
const _formatRegexp = /{(\d+)}/g;
/**
 * Helper to produce a string with a variable number of arguments. Insert variable segments
 * into the string using the {n} notation where N is the index of the argument following the string.
 * @param value string to which formatting is applied
 * @param args replacements for {n}-entries
 */
function format(value, ...args) {
    if (args.length === 0) {
        return value;
    }
    return value.replace(_formatRegexp, function (match, group) {
        const idx = parseInt(group, 10);
        return isNaN(idx) || idx < 0 || idx >= args.length ?
            match :
            args[idx];
    });
}
/**
 * Converts HTML characters inside the string to use entities instead. Makes the string safe from
 * being used e.g. in HTMLElement.innerHTML.
 */
function escape(html) {
    return html.replace(/[<>&]/g, function (match) {
        switch (match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            default: return match;
        }
    });
}
/**
 * Escapes regular expression characters in a given string
 */
function escapeRegExpCharacters(value) {
    return value.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, '\\$&');
}
/**
 * Removes all occurrences of needle from the beginning and end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim (default is a blank)
 */
function trim(haystack, needle = ' ') {
    const trimmed = ltrim(haystack, needle);
    return rtrim(trimmed, needle);
}
/**
 * Removes all occurrences of needle from the beginning of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
function ltrim(haystack, needle) {
    if (!haystack || !needle) {
        return haystack;
    }
    const needleLen = needle.length;
    if (needleLen === 0 || haystack.length === 0) {
        return haystack;
    }
    let offset = 0;
    while (haystack.indexOf(needle, offset) === offset) {
        offset = offset + needleLen;
    }
    return haystack.substring(offset);
}
/**
 * Removes all occurrences of needle from the end of haystack.
 * @param haystack string to trim
 * @param needle the thing to trim
 */
function rtrim(haystack, needle) {
    if (!haystack || !needle) {
        return haystack;
    }
    const needleLen = needle.length, haystackLen = haystack.length;
    if (needleLen === 0 || haystackLen === 0) {
        return haystack;
    }
    let offset = haystackLen, idx = -1;
    while (true) {
        idx = haystack.lastIndexOf(needle, offset - 1);
        if (idx === -1 || idx + needleLen !== offset) {
            break;
        }
        if (idx === 0) {
            return '';
        }
        offset = idx;
    }
    return haystack.substring(0, offset);
}
function convertSimple2RegExpPattern(pattern) {
    return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, '\\$&').replace(/[\*]/g, '.*');
}
function stripWildcards(pattern) {
    return pattern.replace(/\*/g, '');
}
function createRegExp(searchString, isRegex, options = {}) {
    if (!searchString) {
        throw new Error('Cannot create regex from empty string');
    }
    if (!isRegex) {
        searchString = escapeRegExpCharacters(searchString);
    }
    if (options.wholeWord) {
        if (!/\B/.test(searchString.charAt(0))) {
            searchString = '\\b' + searchString;
        }
        if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
            searchString = searchString + '\\b';
        }
    }
    let modifiers = '';
    if (options.global) {
        modifiers += 'g';
    }
    if (!options.matchCase) {
        modifiers += 'i';
    }
    if (options.multiline) {
        modifiers += 'm';
    }
    if (options.unicode) {
        modifiers += 'u';
    }
    return new RegExp(searchString, modifiers);
}
function regExpLeadsToEndlessLoop(regexp) {
    // Exit early if it's one of these special cases which are meant to match
    // against an empty string
    if (regexp.source === '^' || regexp.source === '^$' || regexp.source === '$' || regexp.source === '^\\s*$') {
        return false;
    }
    // We check against an empty string. If the regular expression doesn't advance
    // (e.g. ends in an endless loop) it will match an empty string.
    const match = regexp.exec('');
    return !!(match && regexp.lastIndex === 0);
}
function regExpFlags(regexp) {
    return (regexp.global ? 'g' : '')
        + (regexp.ignoreCase ? 'i' : '')
        + (regexp.multiline ? 'm' : '')
        + (regexp /* standalone editor compilation */.unicode ? 'u' : '');
}
function splitLines(str) {
    return str.split(/\r\n|\r|\n/);
}
/**
 * Returns first index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
function firstNonWhitespaceIndex(str) {
    for (let i = 0, len = str.length; i < len; i++) {
        const chCode = str.charCodeAt(i);
        if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
            return i;
        }
    }
    return -1;
}
/**
 * Returns the leading whitespace of the string.
 * If the string contains only whitespaces, returns entire string
 */
function getLeadingWhitespace(str, start = 0, end = str.length) {
    for (let i = start; i < end; i++) {
        const chCode = str.charCodeAt(i);
        if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
            return str.substring(start, i);
        }
    }
    return str.substring(start, end);
}
/**
 * Returns last index of the string that is not whitespace.
 * If string is empty or contains only whitespaces, returns -1
 */
function lastNonWhitespaceIndex(str, startIndex = str.length - 1) {
    for (let i = startIndex; i >= 0; i--) {
        const chCode = str.charCodeAt(i);
        if (chCode !== 32 /* Space */ && chCode !== 9 /* Tab */) {
            return i;
        }
    }
    return -1;
}
function compare(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a > b) {
        return 1;
    }
    else {
        return 0;
    }
}
function compareSubstring(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
    for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
        let codeA = a.charCodeAt(aStart);
        let codeB = b.charCodeAt(bStart);
        if (codeA < codeB) {
            return -1;
        }
        else if (codeA > codeB) {
            return 1;
        }
    }
    const aLen = aEnd - aStart;
    const bLen = bEnd - bStart;
    if (aLen < bLen) {
        return -1;
    }
    else if (aLen > bLen) {
        return 1;
    }
    return 0;
}
function compareIgnoreCase(a, b) {
    return compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
}
function compareSubstringIgnoreCase(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
    for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
        let codeA = a.charCodeAt(aStart);
        let codeB = b.charCodeAt(bStart);
        if (codeA === codeB) {
            // equal
            continue;
        }
        const diff = codeA - codeB;
        if (diff === 32 && isUpperAsciiLetter(codeB)) { //codeB =[65-90] && codeA =[97-122]
            continue;
        }
        else if (diff === -32 && isUpperAsciiLetter(codeA)) { //codeB =[97-122] && codeA =[65-90]
            continue;
        }
        if (isLowerAsciiLetter(codeA) && isLowerAsciiLetter(codeB)) {
            //
            return diff;
        }
        else {
            return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
        }
    }
    const aLen = aEnd - aStart;
    const bLen = bEnd - bStart;
    if (aLen < bLen) {
        return -1;
    }
    else if (aLen > bLen) {
        return 1;
    }
    return 0;
}
function isLowerAsciiLetter(code) {
    return code >= 97 /* a */ && code <= 122 /* z */;
}
function isUpperAsciiLetter(code) {
    return code >= 65 /* A */ && code <= 90 /* Z */;
}
function isAsciiLetter(code) {
    return isLowerAsciiLetter(code) || isUpperAsciiLetter(code);
}
function equalsIgnoreCase(a, b) {
    return a.length === b.length && doEqualsIgnoreCase(a, b);
}
function doEqualsIgnoreCase(a, b, stopAt = a.length) {
    for (let i = 0; i < stopAt; i++) {
        const codeA = a.charCodeAt(i);
        const codeB = b.charCodeAt(i);
        if (codeA === codeB) {
            continue;
        }
        // a-z A-Z
        if (isAsciiLetter(codeA) && isAsciiLetter(codeB)) {
            const diff = Math.abs(codeA - codeB);
            if (diff !== 0 && diff !== 32) {
                return false;
            }
        }
        // Any other charcode
        else {
            if (String.fromCharCode(codeA).toLowerCase() !== String.fromCharCode(codeB).toLowerCase()) {
                return false;
            }
        }
    }
    return true;
}
function startsWithIgnoreCase(str, candidate) {
    const candidateLength = candidate.length;
    if (candidate.length > str.length) {
        return false;
    }
    return doEqualsIgnoreCase(str, candidate, candidateLength);
}
/**
 * @returns the length of the common prefix of the two strings.
 */
function commonPrefixLength(a, b) {
    let i, len = Math.min(a.length, b.length);
    for (i = 0; i < len; i++) {
        if (a.charCodeAt(i) !== b.charCodeAt(i)) {
            return i;
        }
    }
    return len;
}
/**
 * @returns the length of the common suffix of the two strings.
 */
function commonSuffixLength(a, b) {
    let i, len = Math.min(a.length, b.length);
    const aLastIndex = a.length - 1;
    const bLastIndex = b.length - 1;
    for (i = 0; i < len; i++) {
        if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
            return i;
        }
    }
    return len;
}
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
function isHighSurrogate(charCode) {
    return (0xD800 <= charCode && charCode <= 0xDBFF);
}
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
function isLowSurrogate(charCode) {
    return (0xDC00 <= charCode && charCode <= 0xDFFF);
}
/**
 * See http://en.wikipedia.org/wiki/Surrogate_pair
 */
function computeCodePoint(highSurrogate, lowSurrogate) {
    return ((highSurrogate - 0xD800) << 10) + (lowSurrogate - 0xDC00) + 0x10000;
}
/**
 * get the code point that begins at offset `offset`
 */
function getNextCodePoint(str, len, offset) {
    const charCode = str.charCodeAt(offset);
    if (isHighSurrogate(charCode) && offset + 1 < len) {
        const nextCharCode = str.charCodeAt(offset + 1);
        if (isLowSurrogate(nextCharCode)) {
            return computeCodePoint(charCode, nextCharCode);
        }
    }
    return charCode;
}
/**
 * get the code point that ends right before offset `offset`
 */
function getPrevCodePoint(str, offset) {
    const charCode = str.charCodeAt(offset - 1);
    if (isLowSurrogate(charCode) && offset > 1) {
        const prevCharCode = str.charCodeAt(offset - 2);
        if (isHighSurrogate(prevCharCode)) {
            return computeCodePoint(prevCharCode, charCode);
        }
    }
    return charCode;
}
function nextCharLength(str, offset) {
    const graphemeBreakTree = GraphemeBreakTree.getInstance();
    const initialOffset = offset;
    const len = str.length;
    const initialCodePoint = getNextCodePoint(str, len, offset);
    offset += (initialCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
    let graphemeBreakType = graphemeBreakTree.getGraphemeBreakType(initialCodePoint);
    while (offset < len) {
        const nextCodePoint = getNextCodePoint(str, len, offset);
        const nextGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(nextCodePoint);
        if (breakBetweenGraphemeBreakType(graphemeBreakType, nextGraphemeBreakType)) {
            break;
        }
        offset += (nextCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
        graphemeBreakType = nextGraphemeBreakType;
    }
    return (offset - initialOffset);
}
function prevCharLength(str, offset) {
    const graphemeBreakTree = GraphemeBreakTree.getInstance();
    const initialOffset = offset;
    const initialCodePoint = getPrevCodePoint(str, offset);
    offset -= (initialCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
    let graphemeBreakType = graphemeBreakTree.getGraphemeBreakType(initialCodePoint);
    while (offset > 0) {
        const prevCodePoint = getPrevCodePoint(str, offset);
        const prevGraphemeBreakType = graphemeBreakTree.getGraphemeBreakType(prevCodePoint);
        if (breakBetweenGraphemeBreakType(prevGraphemeBreakType, graphemeBreakType)) {
            break;
        }
        offset -= (prevCodePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1);
        graphemeBreakType = prevGraphemeBreakType;
    }
    return (initialOffset - offset);
}
/**
 * A manual decoding of a UTF8 string.
 * Use only in environments which do not offer native conversion methods!
 */
function decodeUTF8(buffer) {
    // https://en.wikipedia.org/wiki/UTF-8
    const len = buffer.byteLength;
    const result = [];
    let offset = 0;
    while (offset < len) {
        const v0 = buffer[offset];
        let codePoint;
        if (v0 >= 0b11110000 && offset + 3 < len) {
            // 4 bytes
            codePoint = ((((buffer[offset++] & 0b00000111) << 18) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 12) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 6) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 0) >>> 0));
        }
        else if (v0 >= 0b11100000 && offset + 2 < len) {
            // 3 bytes
            codePoint = ((((buffer[offset++] & 0b00001111) << 12) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 6) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 0) >>> 0));
        }
        else if (v0 >= 0b11000000 && offset + 1 < len) {
            // 2 bytes
            codePoint = ((((buffer[offset++] & 0b00011111) << 6) >>> 0)
                | (((buffer[offset++] & 0b00111111) << 0) >>> 0));
        }
        else {
            // 1 byte
            codePoint = buffer[offset++];
        }
        if ((codePoint >= 0 && codePoint <= 0xD7FF) || (codePoint >= 0xE000 && codePoint <= 0xFFFF)) {
            // Basic Multilingual Plane
            result.push(String.fromCharCode(codePoint));
        }
        else if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
            // Supplementary Planes
            const uPrime = codePoint - 0x10000;
            const w1 = 0xD800 + ((uPrime & 0b11111111110000000000) >>> 10);
            const w2 = 0xDC00 + ((uPrime & 0b00000000001111111111) >>> 0);
            result.push(String.fromCharCode(w1));
            result.push(String.fromCharCode(w2));
        }
        else {
            // illegal code point
            result.push(String.fromCharCode(0xFFFD));
        }
    }
    return result.join('');
}
/**
 * Generated using https://github.com/alexdima/unicode-utils/blob/master/generate-rtl-test.js
 */
const CONTAINS_RTL = /(?:[\u05BE\u05C0\u05C3\u05C6\u05D0-\u05F4\u0608\u060B\u060D\u061B-\u064A\u066D-\u066F\u0671-\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u0710\u0712-\u072F\u074D-\u07A5\u07B1-\u07EA\u07F4\u07F5\u07FA-\u0815\u081A\u0824\u0828\u0830-\u0858\u085E-\u08BD\u200F\uFB1D\uFB1F-\uFB28\uFB2A-\uFD3D\uFD50-\uFDFC\uFE70-\uFEFC]|\uD802[\uDC00-\uDD1B\uDD20-\uDE00\uDE10-\uDE33\uDE40-\uDEE4\uDEEB-\uDF35\uDF40-\uDFFF]|\uD803[\uDC00-\uDCFF]|\uD83A[\uDC00-\uDCCF\uDD00-\uDD43\uDD50-\uDFFF]|\uD83B[\uDC00-\uDEBB])/;
/**
 * Returns true if `str` contains any Unicode character that is classified as "R" or "AL".
 */
function containsRTL(str) {
    return CONTAINS_RTL.test(str);
}
/**
 * Generated using https://github.com/alexdima/unicode-utils/blob/master/generate-emoji-test.js
 */
const CONTAINS_EMOJI = /(?:[\u231A\u231B\u23F0\u23F3\u2600-\u27BF\u2B50\u2B55]|\uD83C[\uDDE6-\uDDFF\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD00-\uDDFF\uDE70-\uDED6])/;
function containsEmoji(str) {
    return CONTAINS_EMOJI.test(str);
}
const IS_BASIC_ASCII = /^[\t\n\r\x20-\x7E]*$/;
/**
 * Returns true if `str` contains only basic ASCII characters in the range 32 - 126 (including 32 and 126) or \n, \r, \t
 */
function isBasicASCII(str) {
    return IS_BASIC_ASCII.test(str);
}
const UNUSUAL_LINE_TERMINATORS = /[\u2028\u2029]/; // LINE SEPARATOR (LS) or PARAGRAPH SEPARATOR (PS)
/**
 * Returns true if `str` contains unusual line terminators, like LS or PS
 */
function containsUnusualLineTerminators(str) {
    return UNUSUAL_LINE_TERMINATORS.test(str);
}
function containsFullWidthCharacter(str) {
    for (let i = 0, len = str.length; i < len; i++) {
        if (isFullWidthCharacter(str.charCodeAt(i))) {
            return true;
        }
    }
    return false;
}
function isFullWidthCharacter(charCode) {
    // Do a cheap trick to better support wrapping of wide characters, treat them as 2 columns
    // http://jrgraphix.net/research/unicode_blocks.php
    //          2E80 — 2EFF   CJK Radicals Supplement
    //          2F00 — 2FDF   Kangxi Radicals
    //          2FF0 — 2FFF   Ideographic Description Characters
    //          3000 — 303F   CJK Symbols and Punctuation
    //          3040 — 309F   Hiragana
    //          30A0 — 30FF   Katakana
    //          3100 — 312F   Bopomofo
    //          3130 — 318F   Hangul Compatibility Jamo
    //          3190 — 319F   Kanbun
    //          31A0 — 31BF   Bopomofo Extended
    //          31F0 — 31FF   Katakana Phonetic Extensions
    //          3200 — 32FF   Enclosed CJK Letters and Months
    //          3300 — 33FF   CJK Compatibility
    //          3400 — 4DBF   CJK Unified Ideographs Extension A
    //          4DC0 — 4DFF   Yijing Hexagram Symbols
    //          4E00 — 9FFF   CJK Unified Ideographs
    //          A000 — A48F   Yi Syllables
    //          A490 — A4CF   Yi Radicals
    //          AC00 — D7AF   Hangul Syllables
    // [IGNORE] D800 — DB7F   High Surrogates
    // [IGNORE] DB80 — DBFF   High Private Use Surrogates
    // [IGNORE] DC00 — DFFF   Low Surrogates
    // [IGNORE] E000 — F8FF   Private Use Area
    //          F900 — FAFF   CJK Compatibility Ideographs
    // [IGNORE] FB00 — FB4F   Alphabetic Presentation Forms
    // [IGNORE] FB50 — FDFF   Arabic Presentation Forms-A
    // [IGNORE] FE00 — FE0F   Variation Selectors
    // [IGNORE] FE20 — FE2F   Combining Half Marks
    // [IGNORE] FE30 — FE4F   CJK Compatibility Forms
    // [IGNORE] FE50 — FE6F   Small Form Variants
    // [IGNORE] FE70 — FEFF   Arabic Presentation Forms-B
    //          FF00 — FFEF   Halfwidth and Fullwidth Forms
    //               [https://en.wikipedia.org/wiki/Halfwidth_and_fullwidth_forms]
    //               of which FF01 - FF5E fullwidth ASCII of 21 to 7E
    // [IGNORE]    and FF65 - FFDC halfwidth of Katakana and Hangul
    // [IGNORE] FFF0 — FFFF   Specials
    charCode = +charCode; // @perf
    return ((charCode >= 0x2E80 && charCode <= 0xD7AF)
        || (charCode >= 0xF900 && charCode <= 0xFAFF)
        || (charCode >= 0xFF01 && charCode <= 0xFF5E));
}
/**
 * A fast function (therefore imprecise) to check if code points are emojis.
 * Generated using https://github.com/alexdima/unicode-utils/blob/master/generate-emoji-test.js
 */
function isEmojiImprecise(x) {
    return ((x >= 0x1F1E6 && x <= 0x1F1FF) || (x === 8986) || (x === 8987) || (x === 9200)
        || (x === 9203) || (x >= 9728 && x <= 10175) || (x === 11088) || (x === 11093)
        || (x >= 127744 && x <= 128591) || (x >= 128640 && x <= 128764)
        || (x >= 128992 && x <= 129003) || (x >= 129280 && x <= 129535)
        || (x >= 129648 && x <= 129750));
}
// -- UTF-8 BOM
const UTF8_BOM_CHARACTER = String.fromCharCode(65279 /* UTF8_BOM */);
function startsWithUTF8BOM(str) {
    return !!(str && str.length > 0 && str.charCodeAt(0) === 65279 /* UTF8_BOM */);
}
function containsUppercaseCharacter(target, ignoreEscapedChars = false) {
    if (!target) {
        return false;
    }
    if (ignoreEscapedChars) {
        target = target.replace(/\\./g, '');
    }
    return target.toLowerCase() !== target;
}
/**
 * Produces 'a'-'z', followed by 'A'-'Z'... followed by 'a'-'z', etc.
 */
function singleLetterHash(n) {
    const LETTERS_CNT = (90 /* Z */ - 65 /* A */ + 1);
    n = n % (2 * LETTERS_CNT);
    if (n < LETTERS_CNT) {
        return String.fromCharCode(97 /* a */ + n);
    }
    return String.fromCharCode(65 /* A */ + n - LETTERS_CNT);
}
//#region Unicode Grapheme Break
function getGraphemeBreakType(codePoint) {
    const graphemeBreakTree = GraphemeBreakTree.getInstance();
    return graphemeBreakTree.getGraphemeBreakType(codePoint);
}
function breakBetweenGraphemeBreakType(breakTypeA, breakTypeB) {
    // http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Boundary_Rules
    // !!! Let's make the common case a bit faster
    if (breakTypeA === 0 /* Other */) {
        // see https://www.unicode.org/Public/13.0.0/ucd/auxiliary/GraphemeBreakTest-13.0.0d10.html#table
        return (breakTypeB !== 5 /* Extend */ && breakTypeB !== 7 /* SpacingMark */);
    }
    // Do not break between a CR and LF. Otherwise, break before and after controls.
    // GB3                                        CR × LF
    // GB4                       (Control | CR | LF) ÷
    // GB5                                           ÷ (Control | CR | LF)
    if (breakTypeA === 2 /* CR */) {
        if (breakTypeB === 3 /* LF */) {
            return false; // GB3
        }
    }
    if (breakTypeA === 4 /* Control */ || breakTypeA === 2 /* CR */ || breakTypeA === 3 /* LF */) {
        return true; // GB4
    }
    if (breakTypeB === 4 /* Control */ || breakTypeB === 2 /* CR */ || breakTypeB === 3 /* LF */) {
        return true; // GB5
    }
    // Do not break Hangul syllable sequences.
    // GB6                                         L × (L | V | LV | LVT)
    // GB7                                  (LV | V) × (V | T)
    // GB8                                 (LVT | T) × T
    if (breakTypeA === 8 /* L */) {
        if (breakTypeB === 8 /* L */ || breakTypeB === 9 /* V */ || breakTypeB === 11 /* LV */ || breakTypeB === 12 /* LVT */) {
            return false; // GB6
        }
    }
    if (breakTypeA === 11 /* LV */ || breakTypeA === 9 /* V */) {
        if (breakTypeB === 9 /* V */ || breakTypeB === 10 /* T */) {
            return false; // GB7
        }
    }
    if (breakTypeA === 12 /* LVT */ || breakTypeA === 10 /* T */) {
        if (breakTypeB === 10 /* T */) {
            return false; // GB8
        }
    }
    // Do not break before extending characters or ZWJ.
    // GB9                                           × (Extend | ZWJ)
    if (breakTypeB === 5 /* Extend */ || breakTypeB === 13 /* ZWJ */) {
        return false; // GB9
    }
    // The GB9a and GB9b rules only apply to extended grapheme clusters:
    // Do not break before SpacingMarks, or after Prepend characters.
    // GB9a                                          × SpacingMark
    // GB9b                                  Prepend ×
    if (breakTypeB === 7 /* SpacingMark */) {
        return false; // GB9a
    }
    if (breakTypeA === 1 /* Prepend */) {
        return false; // GB9b
    }
    // Do not break within emoji modifier sequences or emoji zwj sequences.
    // GB11    \p{Extended_Pictographic} Extend* ZWJ × \p{Extended_Pictographic}
    if (breakTypeA === 13 /* ZWJ */ && breakTypeB === 14 /* Extended_Pictographic */) {
        // Note: we are not implementing the rule entirely here to avoid introducing states
        return false; // GB11
    }
    // GB12                          sot (RI RI)* RI × RI
    // GB13                        [^RI] (RI RI)* RI × RI
    if (breakTypeA === 6 /* Regional_Indicator */ && breakTypeB === 6 /* Regional_Indicator */) {
        // Note: we are not implementing the rule entirely here to avoid introducing states
        return false; // GB12 & GB13
    }
    // GB999                                     Any ÷ Any
    return true;
}
class GraphemeBreakTree {
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
        // !!! Let's make 7bit ASCII a bit faster: 0..31
        if (codePoint < 32) {
            if (codePoint === 10 /* LineFeed */) {
                return 3 /* LF */;
            }
            if (codePoint === 13 /* CarriageReturn */) {
                return 2 /* CR */;
            }
            return 4 /* Control */;
        }
        // !!! Let's make 7bit ASCII a bit faster: 32..126
        if (codePoint < 127) {
            return 0 /* Other */;
        }
        const data = this._data;
        const nodeCount = data.length / 3;
        let nodeIndex = 1;
        while (nodeIndex <= nodeCount) {
            if (codePoint < data[3 * nodeIndex]) {
                // go left
                nodeIndex = 2 * nodeIndex;
            }
            else if (codePoint > data[3 * nodeIndex + 1]) {
                // go right
                nodeIndex = 2 * nodeIndex + 1;
            }
            else {
                // hit
                return data[3 * nodeIndex + 2];
            }
        }
        return 0 /* Other */;
    }
}
GraphemeBreakTree._INSTANCE = null;
function getGraphemeBreakRawData() {
    // generated using https://github.com/alexdima/unicode-utils/blob/master/generate-grapheme-break.js
    return JSON.parse('[0,0,0,51592,51592,11,44424,44424,11,72251,72254,5,7150,7150,7,48008,48008,11,55176,55176,11,128420,128420,14,3276,3277,5,9979,9980,14,46216,46216,11,49800,49800,11,53384,53384,11,70726,70726,5,122915,122916,5,129320,129327,14,2558,2558,5,5906,5908,5,9762,9763,14,43360,43388,8,45320,45320,11,47112,47112,11,48904,48904,11,50696,50696,11,52488,52488,11,54280,54280,11,70082,70083,1,71350,71350,7,73111,73111,5,127892,127893,14,128726,128727,14,129473,129474,14,2027,2035,5,2901,2902,5,3784,3789,5,6754,6754,5,8418,8420,5,9877,9877,14,11088,11088,14,44008,44008,5,44872,44872,11,45768,45768,11,46664,46664,11,47560,47560,11,48456,48456,11,49352,49352,11,50248,50248,11,51144,51144,11,52040,52040,11,52936,52936,11,53832,53832,11,54728,54728,11,69811,69814,5,70459,70460,5,71096,71099,7,71998,71998,5,72874,72880,5,119149,119149,7,127374,127374,14,128335,128335,14,128482,128482,14,128765,128767,14,129399,129400,14,129680,129685,14,1476,1477,5,2377,2380,7,2759,2760,5,3137,3140,7,3458,3459,7,4153,4154,5,6432,6434,5,6978,6978,5,7675,7679,5,9723,9726,14,9823,9823,14,9919,9923,14,10035,10036,14,42736,42737,5,43596,43596,5,44200,44200,11,44648,44648,11,45096,45096,11,45544,45544,11,45992,45992,11,46440,46440,11,46888,46888,11,47336,47336,11,47784,47784,11,48232,48232,11,48680,48680,11,49128,49128,11,49576,49576,11,50024,50024,11,50472,50472,11,50920,50920,11,51368,51368,11,51816,51816,11,52264,52264,11,52712,52712,11,53160,53160,11,53608,53608,11,54056,54056,11,54504,54504,11,54952,54952,11,68108,68111,5,69933,69940,5,70197,70197,7,70498,70499,7,70845,70845,5,71229,71229,5,71727,71735,5,72154,72155,5,72344,72345,5,73023,73029,5,94095,94098,5,121403,121452,5,126981,127182,14,127538,127546,14,127990,127990,14,128391,128391,14,128445,128449,14,128500,128505,14,128752,128752,14,129160,129167,14,129356,129356,14,129432,129442,14,129648,129651,14,129751,131069,14,173,173,4,1757,1757,1,2274,2274,1,2494,2494,5,2641,2641,5,2876,2876,5,3014,3016,7,3262,3262,7,3393,3396,5,3570,3571,7,3968,3972,5,4228,4228,7,6086,6086,5,6679,6680,5,6912,6915,5,7080,7081,5,7380,7392,5,8252,8252,14,9096,9096,14,9748,9749,14,9784,9786,14,9833,9850,14,9890,9894,14,9938,9938,14,9999,9999,14,10085,10087,14,12349,12349,14,43136,43137,7,43454,43456,7,43755,43755,7,44088,44088,11,44312,44312,11,44536,44536,11,44760,44760,11,44984,44984,11,45208,45208,11,45432,45432,11,45656,45656,11,45880,45880,11,46104,46104,11,46328,46328,11,46552,46552,11,46776,46776,11,47000,47000,11,47224,47224,11,47448,47448,11,47672,47672,11,47896,47896,11,48120,48120,11,48344,48344,11,48568,48568,11,48792,48792,11,49016,49016,11,49240,49240,11,49464,49464,11,49688,49688,11,49912,49912,11,50136,50136,11,50360,50360,11,50584,50584,11,50808,50808,11,51032,51032,11,51256,51256,11,51480,51480,11,51704,51704,11,51928,51928,11,52152,52152,11,52376,52376,11,52600,52600,11,52824,52824,11,53048,53048,11,53272,53272,11,53496,53496,11,53720,53720,11,53944,53944,11,54168,54168,11,54392,54392,11,54616,54616,11,54840,54840,11,55064,55064,11,65438,65439,5,69633,69633,5,69837,69837,1,70018,70018,7,70188,70190,7,70368,70370,7,70465,70468,7,70712,70719,5,70835,70840,5,70850,70851,5,71132,71133,5,71340,71340,7,71458,71461,5,71985,71989,7,72002,72002,7,72193,72202,5,72281,72283,5,72766,72766,7,72885,72886,5,73104,73105,5,92912,92916,5,113824,113827,4,119173,119179,5,121505,121519,5,125136,125142,5,127279,127279,14,127489,127490,14,127570,127743,14,127900,127901,14,128254,128254,14,128369,128370,14,128400,128400,14,128425,128432,14,128468,128475,14,128489,128494,14,128715,128720,14,128745,128745,14,128759,128760,14,129004,129023,14,129296,129304,14,129340,129342,14,129388,129392,14,129404,129407,14,129454,129455,14,129485,129487,14,129659,129663,14,129719,129727,14,917536,917631,5,13,13,2,1160,1161,5,1564,1564,4,1807,1807,1,2085,2087,5,2363,2363,7,2402,2403,5,2507,2508,7,2622,2624,7,2691,2691,7,2786,2787,5,2881,2884,5,3006,3006,5,3072,3072,5,3170,3171,5,3267,3268,7,3330,3331,7,3406,3406,1,3538,3540,5,3655,3662,5,3897,3897,5,4038,4038,5,4184,4185,5,4352,4447,8,6068,6069,5,6155,6157,5,6448,6449,7,6742,6742,5,6783,6783,5,6966,6970,5,7042,7042,7,7143,7143,7,7212,7219,5,7412,7412,5,8206,8207,4,8294,8303,4,8596,8601,14,9410,9410,14,9742,9742,14,9757,9757,14,9770,9770,14,9794,9794,14,9828,9828,14,9855,9855,14,9882,9882,14,9900,9903,14,9929,9933,14,9963,9967,14,9987,9988,14,10006,10006,14,10062,10062,14,10175,10175,14,11744,11775,5,42607,42607,5,43043,43044,7,43263,43263,5,43444,43445,7,43569,43570,5,43698,43700,5,43766,43766,5,44032,44032,11,44144,44144,11,44256,44256,11,44368,44368,11,44480,44480,11,44592,44592,11,44704,44704,11,44816,44816,11,44928,44928,11,45040,45040,11,45152,45152,11,45264,45264,11,45376,45376,11,45488,45488,11,45600,45600,11,45712,45712,11,45824,45824,11,45936,45936,11,46048,46048,11,46160,46160,11,46272,46272,11,46384,46384,11,46496,46496,11,46608,46608,11,46720,46720,11,46832,46832,11,46944,46944,11,47056,47056,11,47168,47168,11,47280,47280,11,47392,47392,11,47504,47504,11,47616,47616,11,47728,47728,11,47840,47840,11,47952,47952,11,48064,48064,11,48176,48176,11,48288,48288,11,48400,48400,11,48512,48512,11,48624,48624,11,48736,48736,11,48848,48848,11,48960,48960,11,49072,49072,11,49184,49184,11,49296,49296,11,49408,49408,11,49520,49520,11,49632,49632,11,49744,49744,11,49856,49856,11,49968,49968,11,50080,50080,11,50192,50192,11,50304,50304,11,50416,50416,11,50528,50528,11,50640,50640,11,50752,50752,11,50864,50864,11,50976,50976,11,51088,51088,11,51200,51200,11,51312,51312,11,51424,51424,11,51536,51536,11,51648,51648,11,51760,51760,11,51872,51872,11,51984,51984,11,52096,52096,11,52208,52208,11,52320,52320,11,52432,52432,11,52544,52544,11,52656,52656,11,52768,52768,11,52880,52880,11,52992,52992,11,53104,53104,11,53216,53216,11,53328,53328,11,53440,53440,11,53552,53552,11,53664,53664,11,53776,53776,11,53888,53888,11,54000,54000,11,54112,54112,11,54224,54224,11,54336,54336,11,54448,54448,11,54560,54560,11,54672,54672,11,54784,54784,11,54896,54896,11,55008,55008,11,55120,55120,11,64286,64286,5,66272,66272,5,68900,68903,5,69762,69762,7,69817,69818,5,69927,69931,5,70003,70003,5,70070,70078,5,70094,70094,7,70194,70195,7,70206,70206,5,70400,70401,5,70463,70463,7,70475,70477,7,70512,70516,5,70722,70724,5,70832,70832,5,70842,70842,5,70847,70848,5,71088,71089,7,71102,71102,7,71219,71226,5,71231,71232,5,71342,71343,7,71453,71455,5,71463,71467,5,71737,71738,5,71995,71996,5,72000,72000,7,72145,72147,7,72160,72160,5,72249,72249,7,72273,72278,5,72330,72342,5,72752,72758,5,72850,72871,5,72882,72883,5,73018,73018,5,73031,73031,5,73109,73109,5,73461,73462,7,94031,94031,5,94192,94193,7,119142,119142,7,119155,119162,4,119362,119364,5,121476,121476,5,122888,122904,5,123184,123190,5,126976,126979,14,127184,127231,14,127344,127345,14,127405,127461,14,127514,127514,14,127561,127567,14,127778,127779,14,127896,127896,14,127985,127986,14,127995,127999,5,128326,128328,14,128360,128366,14,128378,128378,14,128394,128397,14,128405,128406,14,128422,128423,14,128435,128443,14,128453,128464,14,128479,128480,14,128484,128487,14,128496,128498,14,128640,128709,14,128723,128724,14,128736,128741,14,128747,128748,14,128755,128755,14,128762,128762,14,128981,128991,14,129096,129103,14,129292,129292,14,129311,129311,14,129329,129330,14,129344,129349,14,129360,129374,14,129394,129394,14,129402,129402,14,129413,129425,14,129445,129450,14,129466,129471,14,129483,129483,14,129511,129535,14,129653,129655,14,129667,129670,14,129705,129711,14,129731,129743,14,917505,917505,4,917760,917999,5,10,10,3,127,159,4,768,879,5,1471,1471,5,1536,1541,1,1648,1648,5,1767,1768,5,1840,1866,5,2070,2073,5,2137,2139,5,2307,2307,7,2366,2368,7,2382,2383,7,2434,2435,7,2497,2500,5,2519,2519,5,2563,2563,7,2631,2632,5,2677,2677,5,2750,2752,7,2763,2764,7,2817,2817,5,2879,2879,5,2891,2892,7,2914,2915,5,3008,3008,5,3021,3021,5,3076,3076,5,3146,3149,5,3202,3203,7,3264,3265,7,3271,3272,7,3298,3299,5,3390,3390,5,3402,3404,7,3426,3427,5,3535,3535,5,3544,3550,7,3635,3635,7,3763,3763,7,3893,3893,5,3953,3966,5,3981,3991,5,4145,4145,7,4157,4158,5,4209,4212,5,4237,4237,5,4520,4607,10,5970,5971,5,6071,6077,5,6089,6099,5,6277,6278,5,6439,6440,5,6451,6456,7,6683,6683,5,6744,6750,5,6765,6770,7,6846,6846,5,6964,6964,5,6972,6972,5,7019,7027,5,7074,7077,5,7083,7085,5,7146,7148,7,7154,7155,7,7222,7223,5,7394,7400,5,7416,7417,5,8204,8204,5,8233,8233,4,8288,8292,4,8413,8416,5,8482,8482,14,8986,8987,14,9193,9203,14,9654,9654,14,9733,9733,14,9745,9745,14,9752,9752,14,9760,9760,14,9766,9766,14,9774,9775,14,9792,9792,14,9800,9811,14,9825,9826,14,9831,9831,14,9852,9853,14,9872,9873,14,9880,9880,14,9885,9887,14,9896,9897,14,9906,9916,14,9926,9927,14,9936,9936,14,9941,9960,14,9974,9974,14,9982,9985,14,9992,9997,14,10002,10002,14,10017,10017,14,10055,10055,14,10071,10071,14,10145,10145,14,11013,11015,14,11503,11505,5,12334,12335,5,12951,12951,14,42612,42621,5,43014,43014,5,43047,43047,7,43204,43205,5,43335,43345,5,43395,43395,7,43450,43451,7,43561,43566,5,43573,43574,5,43644,43644,5,43710,43711,5,43758,43759,7,44005,44005,5,44012,44012,7,44060,44060,11,44116,44116,11,44172,44172,11,44228,44228,11,44284,44284,11,44340,44340,11,44396,44396,11,44452,44452,11,44508,44508,11,44564,44564,11,44620,44620,11,44676,44676,11,44732,44732,11,44788,44788,11,44844,44844,11,44900,44900,11,44956,44956,11,45012,45012,11,45068,45068,11,45124,45124,11,45180,45180,11,45236,45236,11,45292,45292,11,45348,45348,11,45404,45404,11,45460,45460,11,45516,45516,11,45572,45572,11,45628,45628,11,45684,45684,11,45740,45740,11,45796,45796,11,45852,45852,11,45908,45908,11,45964,45964,11,46020,46020,11,46076,46076,11,46132,46132,11,46188,46188,11,46244,46244,11,46300,46300,11,46356,46356,11,46412,46412,11,46468,46468,11,46524,46524,11,46580,46580,11,46636,46636,11,46692,46692,11,46748,46748,11,46804,46804,11,46860,46860,11,46916,46916,11,46972,46972,11,47028,47028,11,47084,47084,11,47140,47140,11,47196,47196,11,47252,47252,11,47308,47308,11,47364,47364,11,47420,47420,11,47476,47476,11,47532,47532,11,47588,47588,11,47644,47644,11,47700,47700,11,47756,47756,11,47812,47812,11,47868,47868,11,47924,47924,11,47980,47980,11,48036,48036,11,48092,48092,11,48148,48148,11,48204,48204,11,48260,48260,11,48316,48316,11,48372,48372,11,48428,48428,11,48484,48484,11,48540,48540,11,48596,48596,11,48652,48652,11,48708,48708,11,48764,48764,11,48820,48820,11,48876,48876,11,48932,48932,11,48988,48988,11,49044,49044,11,49100,49100,11,49156,49156,11,49212,49212,11,49268,49268,11,49324,49324,11,49380,49380,11,49436,49436,11,49492,49492,11,49548,49548,11,49604,49604,11,49660,49660,11,49716,49716,11,49772,49772,11,49828,49828,11,49884,49884,11,49940,49940,11,49996,49996,11,50052,50052,11,50108,50108,11,50164,50164,11,50220,50220,11,50276,50276,11,50332,50332,11,50388,50388,11,50444,50444,11,50500,50500,11,50556,50556,11,50612,50612,11,50668,50668,11,50724,50724,11,50780,50780,11,50836,50836,11,50892,50892,11,50948,50948,11,51004,51004,11,51060,51060,11,51116,51116,11,51172,51172,11,51228,51228,11,51284,51284,11,51340,51340,11,51396,51396,11,51452,51452,11,51508,51508,11,51564,51564,11,51620,51620,11,51676,51676,11,51732,51732,11,51788,51788,11,51844,51844,11,51900,51900,11,51956,51956,11,52012,52012,11,52068,52068,11,52124,52124,11,52180,52180,11,52236,52236,11,52292,52292,11,52348,52348,11,52404,52404,11,52460,52460,11,52516,52516,11,52572,52572,11,52628,52628,11,52684,52684,11,52740,52740,11,52796,52796,11,52852,52852,11,52908,52908,11,52964,52964,11,53020,53020,11,53076,53076,11,53132,53132,11,53188,53188,11,53244,53244,11,53300,53300,11,53356,53356,11,53412,53412,11,53468,53468,11,53524,53524,11,53580,53580,11,53636,53636,11,53692,53692,11,53748,53748,11,53804,53804,11,53860,53860,11,53916,53916,11,53972,53972,11,54028,54028,11,54084,54084,11,54140,54140,11,54196,54196,11,54252,54252,11,54308,54308,11,54364,54364,11,54420,54420,11,54476,54476,11,54532,54532,11,54588,54588,11,54644,54644,11,54700,54700,11,54756,54756,11,54812,54812,11,54868,54868,11,54924,54924,11,54980,54980,11,55036,55036,11,55092,55092,11,55148,55148,11,55216,55238,9,65056,65071,5,65529,65531,4,68097,68099,5,68159,68159,5,69446,69456,5,69688,69702,5,69808,69810,7,69815,69816,7,69821,69821,1,69888,69890,5,69932,69932,7,69957,69958,7,70016,70017,5,70067,70069,7,70079,70080,7,70089,70092,5,70095,70095,5,70191,70193,5,70196,70196,5,70198,70199,5,70367,70367,5,70371,70378,5,70402,70403,7,70462,70462,5,70464,70464,5,70471,70472,7,70487,70487,5,70502,70508,5,70709,70711,7,70720,70721,7,70725,70725,7,70750,70750,5,70833,70834,7,70841,70841,7,70843,70844,7,70846,70846,7,70849,70849,7,71087,71087,5,71090,71093,5,71100,71101,5,71103,71104,5,71216,71218,7,71227,71228,7,71230,71230,7,71339,71339,5,71341,71341,5,71344,71349,5,71351,71351,5,71456,71457,7,71462,71462,7,71724,71726,7,71736,71736,7,71984,71984,5,71991,71992,7,71997,71997,7,71999,71999,1,72001,72001,1,72003,72003,5,72148,72151,5,72156,72159,7,72164,72164,7,72243,72248,5,72250,72250,1,72263,72263,5,72279,72280,7,72324,72329,1,72343,72343,7,72751,72751,7,72760,72765,5,72767,72767,5,72873,72873,7,72881,72881,7,72884,72884,7,73009,73014,5,73020,73021,5,73030,73030,1,73098,73102,7,73107,73108,7,73110,73110,7,73459,73460,5,78896,78904,4,92976,92982,5,94033,94087,7,94180,94180,5,113821,113822,5,119141,119141,5,119143,119145,5,119150,119154,5,119163,119170,5,119210,119213,5,121344,121398,5,121461,121461,5,121499,121503,5,122880,122886,5,122907,122913,5,122918,122922,5,123628,123631,5,125252,125258,5,126980,126980,14,127183,127183,14,127245,127247,14,127340,127343,14,127358,127359,14,127377,127386,14,127462,127487,6,127491,127503,14,127535,127535,14,127548,127551,14,127568,127569,14,127744,127777,14,127780,127891,14,127894,127895,14,127897,127899,14,127902,127984,14,127987,127989,14,127991,127994,14,128000,128253,14,128255,128317,14,128329,128334,14,128336,128359,14,128367,128368,14,128371,128377,14,128379,128390,14,128392,128393,14,128398,128399,14,128401,128404,14,128407,128419,14,128421,128421,14,128424,128424,14,128433,128434,14,128444,128444,14,128450,128452,14,128465,128467,14,128476,128478,14,128481,128481,14,128483,128483,14,128488,128488,14,128495,128495,14,128499,128499,14,128506,128591,14,128710,128714,14,128721,128722,14,128725,128725,14,128728,128735,14,128742,128744,14,128746,128746,14,128749,128751,14,128753,128754,14,128756,128758,14,128761,128761,14,128763,128764,14,128884,128895,14,128992,129003,14,129036,129039,14,129114,129119,14,129198,129279,14,129293,129295,14,129305,129310,14,129312,129319,14,129328,129328,14,129331,129338,14,129343,129343,14,129351,129355,14,129357,129359,14,129375,129387,14,129393,129393,14,129395,129398,14,129401,129401,14,129403,129403,14,129408,129412,14,129426,129431,14,129443,129444,14,129451,129453,14,129456,129465,14,129472,129472,14,129475,129482,14,129484,129484,14,129488,129510,14,129536,129647,14,129652,129652,14,129656,129658,14,129664,129666,14,129671,129679,14,129686,129704,14,129712,129718,14,129728,129730,14,129744,129750,14,917504,917504,4,917506,917535,4,917632,917759,4,918000,921599,4,0,9,4,11,12,4,14,31,4,169,169,14,174,174,14,1155,1159,5,1425,1469,5,1473,1474,5,1479,1479,5,1552,1562,5,1611,1631,5,1750,1756,5,1759,1764,5,1770,1773,5,1809,1809,5,1958,1968,5,2045,2045,5,2075,2083,5,2089,2093,5,2259,2273,5,2275,2306,5,2362,2362,5,2364,2364,5,2369,2376,5,2381,2381,5,2385,2391,5,2433,2433,5,2492,2492,5,2495,2496,7,2503,2504,7,2509,2509,5,2530,2531,5,2561,2562,5,2620,2620,5,2625,2626,5,2635,2637,5,2672,2673,5,2689,2690,5,2748,2748,5,2753,2757,5,2761,2761,7,2765,2765,5,2810,2815,5,2818,2819,7,2878,2878,5,2880,2880,7,2887,2888,7,2893,2893,5,2903,2903,5,2946,2946,5,3007,3007,7,3009,3010,7,3018,3020,7,3031,3031,5,3073,3075,7,3134,3136,5,3142,3144,5,3157,3158,5,3201,3201,5,3260,3260,5,3263,3263,5,3266,3266,5,3270,3270,5,3274,3275,7,3285,3286,5,3328,3329,5,3387,3388,5,3391,3392,7,3398,3400,7,3405,3405,5,3415,3415,5,3457,3457,5,3530,3530,5,3536,3537,7,3542,3542,5,3551,3551,5,3633,3633,5,3636,3642,5,3761,3761,5,3764,3772,5,3864,3865,5,3895,3895,5,3902,3903,7,3967,3967,7,3974,3975,5,3993,4028,5,4141,4144,5,4146,4151,5,4155,4156,7,4182,4183,7,4190,4192,5,4226,4226,5,4229,4230,5,4253,4253,5,4448,4519,9,4957,4959,5,5938,5940,5,6002,6003,5,6070,6070,7,6078,6085,7,6087,6088,7,6109,6109,5,6158,6158,4,6313,6313,5,6435,6438,7,6441,6443,7,6450,6450,5,6457,6459,5,6681,6682,7,6741,6741,7,6743,6743,7,6752,6752,5,6757,6764,5,6771,6780,5,6832,6845,5,6847,6848,5,6916,6916,7,6965,6965,5,6971,6971,7,6973,6977,7,6979,6980,7,7040,7041,5,7073,7073,7,7078,7079,7,7082,7082,7,7142,7142,5,7144,7145,5,7149,7149,5,7151,7153,5,7204,7211,7,7220,7221,7,7376,7378,5,7393,7393,7,7405,7405,5,7415,7415,7,7616,7673,5,8203,8203,4,8205,8205,13,8232,8232,4,8234,8238,4,8265,8265,14,8293,8293,4,8400,8412,5,8417,8417,5,8421,8432,5,8505,8505,14,8617,8618,14,9000,9000,14,9167,9167,14,9208,9210,14,9642,9643,14,9664,9664,14,9728,9732,14,9735,9741,14,9743,9744,14,9746,9746,14,9750,9751,14,9753,9756,14,9758,9759,14,9761,9761,14,9764,9765,14,9767,9769,14,9771,9773,14,9776,9783,14,9787,9791,14,9793,9793,14,9795,9799,14,9812,9822,14,9824,9824,14,9827,9827,14,9829,9830,14,9832,9832,14,9851,9851,14,9854,9854,14,9856,9861,14,9874,9876,14,9878,9879,14,9881,9881,14,9883,9884,14,9888,9889,14,9895,9895,14,9898,9899,14,9904,9905,14,9917,9918,14,9924,9925,14,9928,9928,14,9934,9935,14,9937,9937,14,9939,9940,14,9961,9962,14,9968,9973,14,9975,9978,14,9981,9981,14,9986,9986,14,9989,9989,14,9998,9998,14,10000,10001,14,10004,10004,14,10013,10013,14,10024,10024,14,10052,10052,14,10060,10060,14,10067,10069,14,10083,10084,14,10133,10135,14,10160,10160,14,10548,10549,14,11035,11036,14,11093,11093,14,11647,11647,5,12330,12333,5,12336,12336,14,12441,12442,5,12953,12953,14,42608,42610,5,42654,42655,5,43010,43010,5,43019,43019,5,43045,43046,5,43052,43052,5,43188,43203,7,43232,43249,5,43302,43309,5,43346,43347,7,43392,43394,5,43443,43443,5,43446,43449,5,43452,43453,5,43493,43493,5,43567,43568,7,43571,43572,7,43587,43587,5,43597,43597,7,43696,43696,5,43703,43704,5,43713,43713,5,43756,43757,5,43765,43765,7,44003,44004,7,44006,44007,7,44009,44010,7,44013,44013,5,44033,44059,12,44061,44087,12,44089,44115,12,44117,44143,12,44145,44171,12,44173,44199,12,44201,44227,12,44229,44255,12,44257,44283,12,44285,44311,12,44313,44339,12,44341,44367,12,44369,44395,12,44397,44423,12,44425,44451,12,44453,44479,12,44481,44507,12,44509,44535,12,44537,44563,12,44565,44591,12,44593,44619,12,44621,44647,12,44649,44675,12,44677,44703,12,44705,44731,12,44733,44759,12,44761,44787,12,44789,44815,12,44817,44843,12,44845,44871,12,44873,44899,12,44901,44927,12,44929,44955,12,44957,44983,12,44985,45011,12,45013,45039,12,45041,45067,12,45069,45095,12,45097,45123,12,45125,45151,12,45153,45179,12,45181,45207,12,45209,45235,12,45237,45263,12,45265,45291,12,45293,45319,12,45321,45347,12,45349,45375,12,45377,45403,12,45405,45431,12,45433,45459,12,45461,45487,12,45489,45515,12,45517,45543,12,45545,45571,12,45573,45599,12,45601,45627,12,45629,45655,12,45657,45683,12,45685,45711,12,45713,45739,12,45741,45767,12,45769,45795,12,45797,45823,12,45825,45851,12,45853,45879,12,45881,45907,12,45909,45935,12,45937,45963,12,45965,45991,12,45993,46019,12,46021,46047,12,46049,46075,12,46077,46103,12,46105,46131,12,46133,46159,12,46161,46187,12,46189,46215,12,46217,46243,12,46245,46271,12,46273,46299,12,46301,46327,12,46329,46355,12,46357,46383,12,46385,46411,12,46413,46439,12,46441,46467,12,46469,46495,12,46497,46523,12,46525,46551,12,46553,46579,12,46581,46607,12,46609,46635,12,46637,46663,12,46665,46691,12,46693,46719,12,46721,46747,12,46749,46775,12,46777,46803,12,46805,46831,12,46833,46859,12,46861,46887,12,46889,46915,12,46917,46943,12,46945,46971,12,46973,46999,12,47001,47027,12,47029,47055,12,47057,47083,12,47085,47111,12,47113,47139,12,47141,47167,12,47169,47195,12,47197,47223,12,47225,47251,12,47253,47279,12,47281,47307,12,47309,47335,12,47337,47363,12,47365,47391,12,47393,47419,12,47421,47447,12,47449,47475,12,47477,47503,12,47505,47531,12,47533,47559,12,47561,47587,12,47589,47615,12,47617,47643,12,47645,47671,12,47673,47699,12,47701,47727,12,47729,47755,12,47757,47783,12,47785,47811,12,47813,47839,12,47841,47867,12,47869,47895,12,47897,47923,12,47925,47951,12,47953,47979,12,47981,48007,12,48009,48035,12,48037,48063,12,48065,48091,12,48093,48119,12,48121,48147,12,48149,48175,12,48177,48203,12,48205,48231,12,48233,48259,12,48261,48287,12,48289,48315,12,48317,48343,12,48345,48371,12,48373,48399,12,48401,48427,12,48429,48455,12,48457,48483,12,48485,48511,12,48513,48539,12,48541,48567,12,48569,48595,12,48597,48623,12,48625,48651,12,48653,48679,12,48681,48707,12,48709,48735,12,48737,48763,12,48765,48791,12,48793,48819,12,48821,48847,12,48849,48875,12,48877,48903,12,48905,48931,12,48933,48959,12,48961,48987,12,48989,49015,12,49017,49043,12,49045,49071,12,49073,49099,12,49101,49127,12,49129,49155,12,49157,49183,12,49185,49211,12,49213,49239,12,49241,49267,12,49269,49295,12,49297,49323,12,49325,49351,12,49353,49379,12,49381,49407,12,49409,49435,12,49437,49463,12,49465,49491,12,49493,49519,12,49521,49547,12,49549,49575,12,49577,49603,12,49605,49631,12,49633,49659,12,49661,49687,12,49689,49715,12,49717,49743,12,49745,49771,12,49773,49799,12,49801,49827,12,49829,49855,12,49857,49883,12,49885,49911,12,49913,49939,12,49941,49967,12,49969,49995,12,49997,50023,12,50025,50051,12,50053,50079,12,50081,50107,12,50109,50135,12,50137,50163,12,50165,50191,12,50193,50219,12,50221,50247,12,50249,50275,12,50277,50303,12,50305,50331,12,50333,50359,12,50361,50387,12,50389,50415,12,50417,50443,12,50445,50471,12,50473,50499,12,50501,50527,12,50529,50555,12,50557,50583,12,50585,50611,12,50613,50639,12,50641,50667,12,50669,50695,12,50697,50723,12,50725,50751,12,50753,50779,12,50781,50807,12,50809,50835,12,50837,50863,12,50865,50891,12,50893,50919,12,50921,50947,12,50949,50975,12,50977,51003,12,51005,51031,12,51033,51059,12,51061,51087,12,51089,51115,12,51117,51143,12,51145,51171,12,51173,51199,12,51201,51227,12,51229,51255,12,51257,51283,12,51285,51311,12,51313,51339,12,51341,51367,12,51369,51395,12,51397,51423,12,51425,51451,12,51453,51479,12,51481,51507,12,51509,51535,12,51537,51563,12,51565,51591,12,51593,51619,12,51621,51647,12,51649,51675,12,51677,51703,12,51705,51731,12,51733,51759,12,51761,51787,12,51789,51815,12,51817,51843,12,51845,51871,12,51873,51899,12,51901,51927,12,51929,51955,12,51957,51983,12,51985,52011,12,52013,52039,12,52041,52067,12,52069,52095,12,52097,52123,12,52125,52151,12,52153,52179,12,52181,52207,12,52209,52235,12,52237,52263,12,52265,52291,12,52293,52319,12,52321,52347,12,52349,52375,12,52377,52403,12,52405,52431,12,52433,52459,12,52461,52487,12,52489,52515,12,52517,52543,12,52545,52571,12,52573,52599,12,52601,52627,12,52629,52655,12,52657,52683,12,52685,52711,12,52713,52739,12,52741,52767,12,52769,52795,12,52797,52823,12,52825,52851,12,52853,52879,12,52881,52907,12,52909,52935,12,52937,52963,12,52965,52991,12,52993,53019,12,53021,53047,12,53049,53075,12,53077,53103,12,53105,53131,12,53133,53159,12,53161,53187,12,53189,53215,12,53217,53243,12,53245,53271,12,53273,53299,12,53301,53327,12,53329,53355,12,53357,53383,12,53385,53411,12,53413,53439,12,53441,53467,12,53469,53495,12,53497,53523,12,53525,53551,12,53553,53579,12,53581,53607,12,53609,53635,12,53637,53663,12,53665,53691,12,53693,53719,12,53721,53747,12,53749,53775,12,53777,53803,12,53805,53831,12,53833,53859,12,53861,53887,12,53889,53915,12,53917,53943,12,53945,53971,12,53973,53999,12,54001,54027,12,54029,54055,12,54057,54083,12,54085,54111,12,54113,54139,12,54141,54167,12,54169,54195,12,54197,54223,12,54225,54251,12,54253,54279,12,54281,54307,12,54309,54335,12,54337,54363,12,54365,54391,12,54393,54419,12,54421,54447,12,54449,54475,12,54477,54503,12,54505,54531,12,54533,54559,12,54561,54587,12,54589,54615,12,54617,54643,12,54645,54671,12,54673,54699,12,54701,54727,12,54729,54755,12,54757,54783,12,54785,54811,12,54813,54839,12,54841,54867,12,54869,54895,12,54897,54923,12,54925,54951,12,54953,54979,12,54981,55007,12,55009,55035,12,55037,55063,12,55065,55091,12,55093,55119,12,55121,55147,12,55149,55175,12,55177,55203,12,55243,55291,10,65024,65039,5,65279,65279,4,65520,65528,4,66045,66045,5,66422,66426,5,68101,68102,5,68152,68154,5,68325,68326,5,69291,69292,5,69632,69632,7,69634,69634,7,69759,69761,5]');
}
//#endregion
/**
 * Computes the offset after performing a left delete on the given string,
 * while considering unicode grapheme/emoji rules.
*/
function getLeftDeleteOffset(offset, str) {
    if (offset === 0) {
        return 0;
    }
    // Try to delete emoji part.
    const emojiOffset = getOffsetBeforeLastEmojiComponent(offset, str);
    if (emojiOffset !== undefined) {
        return emojiOffset;
    }
    // Otherwise, just skip a single code point.
    const codePoint = getPrevCodePoint(str, offset);
    offset -= getUTF16Length(codePoint);
    return offset;
}
function getOffsetBeforeLastEmojiComponent(offset, str) {
    // See https://www.unicode.org/reports/tr51/tr51-14.html#EBNF_and_Regex for the
    // structure of emojis.
    let codePoint = getPrevCodePoint(str, offset);
    offset -= getUTF16Length(codePoint);
    // Skip modifiers
    while ((isEmojiModifier(codePoint) || codePoint === 65039 /* emojiVariantSelector */ || codePoint === 8419 /* enclosingKeyCap */)) {
        if (offset === 0) {
            // Cannot skip modifier, no preceding emoji base.
            return undefined;
        }
        codePoint = getPrevCodePoint(str, offset);
        offset -= getUTF16Length(codePoint);
    }
    // Expect base emoji
    if (!isEmojiImprecise(codePoint)) {
        // Unexpected code point, not a valid emoji.
        return undefined;
    }
    if (offset >= 0) {
        // Skip optional ZWJ code points that combine multiple emojis.
        // In theory, we should check if that ZWJ actually combines multiple emojis
        // to prevent deleting ZWJs in situations we didn't account for.
        const optionalZwjCodePoint = getPrevCodePoint(str, offset);
        if (optionalZwjCodePoint === 8205 /* zwj */) {
            offset -= getUTF16Length(optionalZwjCodePoint);
        }
    }
    return offset;
}
function getUTF16Length(codePoint) {
    return codePoint >= 65536 /* UNICODE_SUPPLEMENTARY_PLANE_BEGIN */ ? 2 : 1;
}
function isEmojiModifier(codePoint) {
    return 0x1F3FB <= codePoint && codePoint <= 0x1F3FF;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var _a$1, _b;
class StringIterator {
    constructor() {
        this._value = '';
        this._pos = 0;
    }
    reset(key) {
        this._value = key;
        this._pos = 0;
        return this;
    }
    next() {
        this._pos += 1;
        return this;
    }
    hasNext() {
        return this._pos < this._value.length - 1;
    }
    cmp(a) {
        const aCode = a.charCodeAt(0);
        const thisCode = this._value.charCodeAt(this._pos);
        return aCode - thisCode;
    }
    value() {
        return this._value[this._pos];
    }
}
class ConfigKeysIterator {
    constructor(_caseSensitive = true) {
        this._caseSensitive = _caseSensitive;
    }
    reset(key) {
        this._value = key;
        this._from = 0;
        this._to = 0;
        return this.next();
    }
    hasNext() {
        return this._to < this._value.length;
    }
    next() {
        // this._data = key.split(/[\\/]/).filter(s => !!s);
        this._from = this._to;
        let justSeps = true;
        for (; this._to < this._value.length; this._to++) {
            const ch = this._value.charCodeAt(this._to);
            if (ch === 46 /* Period */) {
                if (justSeps) {
                    this._from++;
                }
                else {
                    break;
                }
            }
            else {
                justSeps = false;
            }
        }
        return this;
    }
    cmp(a) {
        return this._caseSensitive
            ? compareSubstring(a, this._value, 0, a.length, this._from, this._to)
            : compareSubstringIgnoreCase(a, this._value, 0, a.length, this._from, this._to);
    }
    value() {
        return this._value.substring(this._from, this._to);
    }
}
class PathIterator {
    constructor(_splitOnBackslash = true, _caseSensitive = true) {
        this._splitOnBackslash = _splitOnBackslash;
        this._caseSensitive = _caseSensitive;
    }
    reset(key) {
        this._value = key.replace(/\\$|\/$/, '');
        this._from = 0;
        this._to = 0;
        return this.next();
    }
    hasNext() {
        return this._to < this._value.length;
    }
    next() {
        // this._data = key.split(/[\\/]/).filter(s => !!s);
        this._from = this._to;
        let justSeps = true;
        for (; this._to < this._value.length; this._to++) {
            const ch = this._value.charCodeAt(this._to);
            if (ch === 47 /* Slash */ || this._splitOnBackslash && ch === 92 /* Backslash */) {
                if (justSeps) {
                    this._from++;
                }
                else {
                    break;
                }
            }
            else {
                justSeps = false;
            }
        }
        return this;
    }
    cmp(a) {
        return this._caseSensitive
            ? compareSubstring(a, this._value, 0, a.length, this._from, this._to)
            : compareSubstringIgnoreCase(a, this._value, 0, a.length, this._from, this._to);
    }
    value() {
        return this._value.substring(this._from, this._to);
    }
}
class UriIterator {
    constructor(_ignorePathCasing) {
        this._ignorePathCasing = _ignorePathCasing;
        this._states = [];
        this._stateIdx = 0;
    }
    reset(key) {
        this._value = key;
        this._states = [];
        if (this._value.scheme) {
            this._states.push(1 /* Scheme */);
        }
        if (this._value.authority) {
            this._states.push(2 /* Authority */);
        }
        if (this._value.path) {
            this._pathIterator = new PathIterator(false, !this._ignorePathCasing(key));
            this._pathIterator.reset(key.path);
            if (this._pathIterator.value()) {
                this._states.push(3 /* Path */);
            }
        }
        if (this._value.query) {
            this._states.push(4 /* Query */);
        }
        if (this._value.fragment) {
            this._states.push(5 /* Fragment */);
        }
        this._stateIdx = 0;
        return this;
    }
    next() {
        if (this._states[this._stateIdx] === 3 /* Path */ && this._pathIterator.hasNext()) {
            this._pathIterator.next();
        }
        else {
            this._stateIdx += 1;
        }
        return this;
    }
    hasNext() {
        return (this._states[this._stateIdx] === 3 /* Path */ && this._pathIterator.hasNext())
            || this._stateIdx < this._states.length - 1;
    }
    cmp(a) {
        if (this._states[this._stateIdx] === 1 /* Scheme */) {
            return compareIgnoreCase(a, this._value.scheme);
        }
        else if (this._states[this._stateIdx] === 2 /* Authority */) {
            return compareIgnoreCase(a, this._value.authority);
        }
        else if (this._states[this._stateIdx] === 3 /* Path */) {
            return this._pathIterator.cmp(a);
        }
        else if (this._states[this._stateIdx] === 4 /* Query */) {
            return compare(a, this._value.query);
        }
        else if (this._states[this._stateIdx] === 5 /* Fragment */) {
            return compare(a, this._value.fragment);
        }
        throw new Error();
    }
    value() {
        if (this._states[this._stateIdx] === 1 /* Scheme */) {
            return this._value.scheme;
        }
        else if (this._states[this._stateIdx] === 2 /* Authority */) {
            return this._value.authority;
        }
        else if (this._states[this._stateIdx] === 3 /* Path */) {
            return this._pathIterator.value();
        }
        else if (this._states[this._stateIdx] === 4 /* Query */) {
            return this._value.query;
        }
        else if (this._states[this._stateIdx] === 5 /* Fragment */) {
            return this._value.fragment;
        }
        throw new Error();
    }
}
class TernarySearchTreeNode {
    isEmpty() {
        return !this.left && !this.mid && !this.right && !this.value;
    }
}
class TernarySearchTree {
    constructor(segments) {
        this._iter = segments;
    }
    static forUris(ignorePathCasing = () => false) {
        return new TernarySearchTree(new UriIterator(ignorePathCasing));
    }
    static forStrings() {
        return new TernarySearchTree(new StringIterator());
    }
    static forConfigKeys() {
        return new TernarySearchTree(new ConfigKeysIterator());
    }
    clear() {
        this._root = undefined;
    }
    set(key, element) {
        const iter = this._iter.reset(key);
        let node;
        if (!this._root) {
            this._root = new TernarySearchTreeNode();
            this._root.segment = iter.value();
        }
        node = this._root;
        while (true) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                // left
                if (!node.left) {
                    node.left = new TernarySearchTreeNode();
                    node.left.segment = iter.value();
                }
                node = node.left;
            }
            else if (val < 0) {
                // right
                if (!node.right) {
                    node.right = new TernarySearchTreeNode();
                    node.right.segment = iter.value();
                }
                node = node.right;
            }
            else if (iter.hasNext()) {
                // mid
                iter.next();
                if (!node.mid) {
                    node.mid = new TernarySearchTreeNode();
                    node.mid.segment = iter.value();
                }
                node = node.mid;
            }
            else {
                break;
            }
        }
        const oldElement = node.value;
        node.value = element;
        node.key = key;
        return oldElement;
    }
    get(key) {
        var _c;
        return (_c = this._getNode(key)) === null || _c === void 0 ? void 0 : _c.value;
    }
    _getNode(key) {
        const iter = this._iter.reset(key);
        let node = this._root;
        while (node) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                // left
                node = node.left;
            }
            else if (val < 0) {
                // right
                node = node.right;
            }
            else if (iter.hasNext()) {
                // mid
                iter.next();
                node = node.mid;
            }
            else {
                break;
            }
        }
        return node;
    }
    has(key) {
        const node = this._getNode(key);
        return !((node === null || node === void 0 ? void 0 : node.value) === undefined && (node === null || node === void 0 ? void 0 : node.mid) === undefined);
    }
    delete(key) {
        return this._delete(key, false);
    }
    deleteSuperstr(key) {
        return this._delete(key, true);
    }
    _delete(key, superStr) {
        const iter = this._iter.reset(key);
        const stack = [];
        let node = this._root;
        // find and unset node
        while (node) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                // left
                stack.push([1, node]);
                node = node.left;
            }
            else if (val < 0) {
                // right
                stack.push([-1, node]);
                node = node.right;
            }
            else if (iter.hasNext()) {
                // mid
                iter.next();
                stack.push([0, node]);
                node = node.mid;
            }
            else {
                if (superStr) {
                    // remove children
                    node.left = undefined;
                    node.mid = undefined;
                    node.right = undefined;
                }
                else {
                    // remove element
                    node.value = undefined;
                }
                // clean up empty nodes
                while (stack.length > 0 && node.isEmpty()) {
                    let [dir, parent] = stack.pop();
                    switch (dir) {
                        case 1:
                            parent.left = undefined;
                            break;
                        case 0:
                            parent.mid = undefined;
                            break;
                        case -1:
                            parent.right = undefined;
                            break;
                    }
                    node = parent;
                }
                break;
            }
        }
    }
    findSubstr(key) {
        const iter = this._iter.reset(key);
        let node = this._root;
        let candidate = undefined;
        while (node) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                // left
                node = node.left;
            }
            else if (val < 0) {
                // right
                node = node.right;
            }
            else if (iter.hasNext()) {
                // mid
                iter.next();
                candidate = node.value || candidate;
                node = node.mid;
            }
            else {
                break;
            }
        }
        return node && node.value || candidate;
    }
    findSuperstr(key) {
        const iter = this._iter.reset(key);
        let node = this._root;
        while (node) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                // left
                node = node.left;
            }
            else if (val < 0) {
                // right
                node = node.right;
            }
            else if (iter.hasNext()) {
                // mid
                iter.next();
                node = node.mid;
            }
            else {
                // collect
                if (!node.mid) {
                    return undefined;
                }
                else {
                    return this._entries(node.mid);
                }
            }
        }
        return undefined;
    }
    forEach(callback) {
        for (const [key, value] of this) {
            callback(value, key);
        }
    }
    *[Symbol.iterator]() {
        yield* this._entries(this._root);
    }
    *_entries(node, i = 0) {
        if (i > 5000) {
            console.log('potential CYCLE detected', new Error().stack);
            return;
        }
        if (node) {
            // left
            yield* this._entries(node.left, i++);
            // node
            if (node.value) {
                // callback(node.value, this._iter.join(parts));
                yield [node.key, node.value];
            }
            // mid
            yield* this._entries(node.mid, i++);
            // right
            yield* this._entries(node.right, i++);
        }
    }
}
class ResourceMap {
    constructor(mapOrKeyFn, toKey) {
        this[_a$1] = 'ResourceMap';
        if (mapOrKeyFn instanceof ResourceMap) {
            this.map = new Map(mapOrKeyFn.map);
            this.toKey = toKey !== null && toKey !== void 0 ? toKey : ResourceMap.defaultToKey;
        }
        else {
            this.map = new Map();
            this.toKey = mapOrKeyFn !== null && mapOrKeyFn !== void 0 ? mapOrKeyFn : ResourceMap.defaultToKey;
        }
    }
    set(resource, value) {
        this.map.set(this.toKey(resource), value);
        return this;
    }
    get(resource) {
        return this.map.get(this.toKey(resource));
    }
    has(resource) {
        return this.map.has(this.toKey(resource));
    }
    get size() {
        return this.map.size;
    }
    clear() {
        this.map.clear();
    }
    delete(resource) {
        return this.map.delete(this.toKey(resource));
    }
    forEach(clb, thisArg) {
        if (typeof thisArg !== 'undefined') {
            clb = clb.bind(thisArg);
        }
        for (let [index, value] of this.map) {
            clb(value, URI.parse(index), this);
        }
    }
    values() {
        return this.map.values();
    }
    *keys() {
        for (let key of this.map.keys()) {
            yield URI.parse(key);
        }
    }
    *entries() {
        for (let tuple of this.map.entries()) {
            yield [URI.parse(tuple[0]), tuple[1]];
        }
    }
    *[(_a$1 = Symbol.toStringTag, Symbol.iterator)]() {
        for (let item of this.map) {
            yield [URI.parse(item[0]), item[1]];
        }
    }
}
ResourceMap.defaultToKey = (resource) => resource.toString();
class LinkedMap {
    constructor() {
        this[_b] = 'LinkedMap';
        this._map = new Map();
        this._head = undefined;
        this._tail = undefined;
        this._size = 0;
        this._state = 0;
    }
    clear() {
        this._map.clear();
        this._head = undefined;
        this._tail = undefined;
        this._size = 0;
        this._state++;
    }
    isEmpty() {
        return !this._head && !this._tail;
    }
    get size() {
        return this._size;
    }
    get first() {
        var _c;
        return (_c = this._head) === null || _c === void 0 ? void 0 : _c.value;
    }
    get last() {
        var _c;
        return (_c = this._tail) === null || _c === void 0 ? void 0 : _c.value;
    }
    has(key) {
        return this._map.has(key);
    }
    get(key, touch = 0 /* None */) {
        const item = this._map.get(key);
        if (!item) {
            return undefined;
        }
        if (touch !== 0 /* None */) {
            this.touch(item, touch);
        }
        return item.value;
    }
    set(key, value, touch = 0 /* None */) {
        let item = this._map.get(key);
        if (item) {
            item.value = value;
            if (touch !== 0 /* None */) {
                this.touch(item, touch);
            }
        }
        else {
            item = { key, value, next: undefined, previous: undefined };
            switch (touch) {
                case 0 /* None */:
                    this.addItemLast(item);
                    break;
                case 1 /* AsOld */:
                    this.addItemFirst(item);
                    break;
                case 2 /* AsNew */:
                    this.addItemLast(item);
                    break;
                default:
                    this.addItemLast(item);
                    break;
            }
            this._map.set(key, item);
            this._size++;
        }
        return this;
    }
    delete(key) {
        return !!this.remove(key);
    }
    remove(key) {
        const item = this._map.get(key);
        if (!item) {
            return undefined;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
    }
    shift() {
        if (!this._head && !this._tail) {
            return undefined;
        }
        if (!this._head || !this._tail) {
            throw new Error('Invalid list');
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
    }
    forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
            if (thisArg) {
                callbackfn.bind(thisArg)(current.value, current.key, this);
            }
            else {
                callbackfn(current.value, current.key, this);
            }
            if (this._state !== state) {
                throw new Error(`LinkedMap got modified during iteration.`);
            }
            current = current.next;
        }
    }
    keys() {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]() {
                return iterator;
            },
            next() {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: current.key, done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    values() {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]() {
                return iterator;
            },
            next() {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: current.value, done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    entries() {
        const map = this;
        const state = this._state;
        let current = this._head;
        const iterator = {
            [Symbol.iterator]() {
                return iterator;
            },
            next() {
                if (map._state !== state) {
                    throw new Error(`LinkedMap got modified during iteration.`);
                }
                if (current) {
                    const result = { value: [current.key, current.value], done: false };
                    current = current.next;
                    return result;
                }
                else {
                    return { value: undefined, done: true };
                }
            }
        };
        return iterator;
    }
    [(_b = Symbol.toStringTag, Symbol.iterator)]() {
        return this.entries();
    }
    trimOld(newSize) {
        if (newSize >= this.size) {
            return;
        }
        if (newSize === 0) {
            this.clear();
            return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
            this._map.delete(current.key);
            current = current.next;
            currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
            current.previous = undefined;
        }
        this._state++;
    }
    addItemFirst(item) {
        // First time Insert
        if (!this._head && !this._tail) {
            this._tail = item;
        }
        else if (!this._head) {
            throw new Error('Invalid list');
        }
        else {
            item.next = this._head;
            this._head.previous = item;
        }
        this._head = item;
        this._state++;
    }
    addItemLast(item) {
        // First time Insert
        if (!this._head && !this._tail) {
            this._head = item;
        }
        else if (!this._tail) {
            throw new Error('Invalid list');
        }
        else {
            item.previous = this._tail;
            this._tail.next = item;
        }
        this._tail = item;
        this._state++;
    }
    removeItem(item) {
        if (item === this._head && item === this._tail) {
            this._head = undefined;
            this._tail = undefined;
        }
        else if (item === this._head) {
            // This can only happen if size === 1 which is handled
            // by the case above.
            if (!item.next) {
                throw new Error('Invalid list');
            }
            item.next.previous = undefined;
            this._head = item.next;
        }
        else if (item === this._tail) {
            // This can only happen if size === 1 which is handled
            // by the case above.
            if (!item.previous) {
                throw new Error('Invalid list');
            }
            item.previous.next = undefined;
            this._tail = item.previous;
        }
        else {
            const next = item.next;
            const previous = item.previous;
            if (!next || !previous) {
                throw new Error('Invalid list');
            }
            next.previous = previous;
            previous.next = next;
        }
        item.next = undefined;
        item.previous = undefined;
        this._state++;
    }
    touch(item, touch) {
        if (!this._head || !this._tail) {
            throw new Error('Invalid list');
        }
        if ((touch !== 1 /* AsOld */ && touch !== 2 /* AsNew */)) {
            return;
        }
        if (touch === 1 /* AsOld */) {
            if (item === this._head) {
                return;
            }
            const next = item.next;
            const previous = item.previous;
            // Unlink the item
            if (item === this._tail) {
                // previous must be defined since item was not head but is tail
                // So there are more than on item in the map
                previous.next = undefined;
                this._tail = previous;
            }
            else {
                // Both next and previous are not undefined since item was neither head nor tail.
                next.previous = previous;
                previous.next = next;
            }
            // Insert the node at head
            item.previous = undefined;
            item.next = this._head;
            this._head.previous = item;
            this._head = item;
            this._state++;
        }
        else if (touch === 2 /* AsNew */) {
            if (item === this._tail) {
                return;
            }
            const next = item.next;
            const previous = item.previous;
            // Unlink the item.
            if (item === this._head) {
                // next must be defined since item was not tail but is head
                // So there are more than on item in the map
                next.previous = undefined;
                this._head = next;
            }
            else {
                // Both next and previous are not undefined since item was neither head nor tail.
                next.previous = previous;
                previous.next = next;
            }
            item.next = undefined;
            item.previous = this._tail;
            this._tail.next = item;
            this._tail = item;
            this._state++;
        }
    }
    toJSON() {
        const data = [];
        this.forEach((value, key) => {
            data.push([key, value]);
        });
        return data;
    }
    fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
            this.set(key, value);
        }
    }
}
class LRUCache extends LinkedMap {
    constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
    }
    get limit() {
        return this._limit;
    }
    set limit(limit) {
        this._limit = limit;
        this.checkTrim();
    }
    get(key, touch = 2 /* AsNew */) {
        return super.get(key, touch);
    }
    peek(key) {
        return super.get(key, 0 /* None */);
    }
    set(key, value) {
        super.set(key, value, 2 /* AsNew */);
        this.checkTrim();
        return this;
    }
    checkTrim() {
        if (this.size > this._limit) {
            this.trimOld(Math.round(this._limit * this._ratio));
        }
    }
}

const hasBuffer = (typeof Buffer !== 'undefined');
const hasTextDecoder = (typeof TextDecoder !== 'undefined');
let textDecoder;
class VSBuffer {
    constructor(buffer) {
        this.buffer = buffer;
        this.byteLength = this.buffer.byteLength;
    }
    static wrap(actual) {
        if (hasBuffer && !(Buffer.isBuffer(actual))) {
            // https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
            // Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
            actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
        }
        return new VSBuffer(actual);
    }
    toString() {
        if (hasBuffer) {
            return this.buffer.toString();
        }
        else if (hasTextDecoder) {
            if (!textDecoder) {
                textDecoder = new TextDecoder();
            }
            return textDecoder.decode(this.buffer);
        }
        else {
            return decodeUTF8(this.buffer);
        }
    }
}
function readUInt16LE(source, offset) {
    return (((source[offset + 0] << 0) >>> 0) |
        ((source[offset + 1] << 8) >>> 0));
}
function writeUInt16LE(destination, value, offset) {
    destination[offset + 0] = (value & 0b11111111);
    value = value >>> 8;
    destination[offset + 1] = (value & 0b11111111);
}
function readUInt32BE(source, offset) {
    return (source[offset] * Math.pow(2, 24)
        + source[offset + 1] * Math.pow(2, 16)
        + source[offset + 2] * Math.pow(2, 8)
        + source[offset + 3]);
}
function writeUInt32BE(destination, value, offset) {
    destination[offset + 3] = value;
    value = value >>> 8;
    destination[offset + 2] = value;
    value = value >>> 8;
    destination[offset + 1] = value;
    value = value >>> 8;
    destination[offset] = value;
}
function readUInt8(source, offset) {
    return source[offset];
}
function writeUInt8(destination, value, offset) {
    destination[offset] = value;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Takes a Windows OS path and changes backward slashes to forward slashes.
 * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
 * Using it on a Linux or MaxOS path might change it.
 */
function toSlashes(osPath) {
    return osPath.replace(/[\\/]/g, posix.sep);
}
/**
 * Takes a Windows OS path (using backward or forward slashes) and turns it into a posix path:
 * - turns backward slashes into forward slashes
 * - makes it absolute if it starts with a drive letter
 * This should only be done for OS paths from Windows (or user provided paths potentially from Windows).
 * Using it on a Linux or MaxOS path might change it.
 */
function toPosixPath(osPath) {
    if (osPath.indexOf('/') === -1) {
        osPath = toSlashes(osPath);
    }
    if (/^[a-zA-Z]:(\/|$)/.test(osPath)) { // starts with a drive letter
        osPath = '/' + osPath;
    }
    return osPath;
}
function isEqualOrParent(base, parentCandidate, ignoreCase, separator = sep) {
    if (base === parentCandidate) {
        return true;
    }
    if (!base || !parentCandidate) {
        return false;
    }
    if (parentCandidate.length > base.length) {
        return false;
    }
    if (ignoreCase) {
        const beginsWith = startsWithIgnoreCase(base, parentCandidate);
        if (!beginsWith) {
            return false;
        }
        if (parentCandidate.length === base.length) {
            return true; // same path, different casing
        }
        let sepOffset = parentCandidate.length;
        if (parentCandidate.charAt(parentCandidate.length - 1) === separator) {
            sepOffset--; // adjust the expected sep offset in case our candidate already ends in separator character
        }
        return base.charAt(sepOffset) === separator;
    }
    if (parentCandidate.charAt(parentCandidate.length - 1) !== separator) {
        parentCandidate += separator;
    }
    return base.indexOf(parentCandidate) === 0;
}
function isWindowsDriveLetter(char0) {
    return char0 >= 65 /* A */ && char0 <= 90 /* Z */ || char0 >= 97 /* a */ && char0 <= 122 /* z */;
}
function isRootOrDriveLetter(path) {
    const pathNormalized = normalize(path);
    if (isWindows) {
        if (path.length > 3) {
            return false;
        }
        return hasDriveLetter(pathNormalized) &&
            (path.length === 2 || pathNormalized.charCodeAt(2) === 92 /* Backslash */);
    }
    return pathNormalized === posix.sep;
}
function hasDriveLetter(path) {
    if (isWindows) {
        return isWindowsDriveLetter(path.charCodeAt(0)) && path.charCodeAt(1) === 58 /* Colon */;
    }
    return false;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function originalFSPath(uri) {
    return uriToFsPath(uri, true);
}
class ExtUri {
    constructor(_ignorePathCasing) {
        this._ignorePathCasing = _ignorePathCasing;
    }
    compare(uri1, uri2, ignoreFragment = false) {
        if (uri1 === uri2) {
            return 0;
        }
        return compare(this.getComparisonKey(uri1, ignoreFragment), this.getComparisonKey(uri2, ignoreFragment));
    }
    isEqual(uri1, uri2, ignoreFragment = false) {
        if (uri1 === uri2) {
            return true;
        }
        if (!uri1 || !uri2) {
            return false;
        }
        return this.getComparisonKey(uri1, ignoreFragment) === this.getComparisonKey(uri2, ignoreFragment);
    }
    getComparisonKey(uri, ignoreFragment = false) {
        return uri.with({
            path: this._ignorePathCasing(uri) ? uri.path.toLowerCase() : undefined,
            fragment: ignoreFragment ? null : undefined
        }).toString();
    }
    // --- path math
    joinPath(resource, ...pathFragment) {
        return URI.joinPath(resource, ...pathFragment);
    }
    basenameOrAuthority(resource) {
        return basename$1(resource) || resource.authority;
    }
    basename(resource) {
        return posix.basename(resource.path);
    }
    dirname(resource) {
        if (resource.path.length === 0) {
            return resource;
        }
        let dirname$1;
        if (resource.scheme === Schemas.file) {
            dirname$1 = URI.file(dirname(originalFSPath(resource))).path;
        }
        else {
            dirname$1 = posix.dirname(resource.path);
            if (resource.authority && dirname$1.length && dirname$1.charCodeAt(0) !== 47 /* Slash */) {
                console.error(`dirname("${resource.toString})) resulted in a relative path`);
                dirname$1 = '/'; // If a URI contains an authority component, then the path component must either be empty or begin with a CharCode.Slash ("/") character
            }
        }
        return resource.with({
            path: dirname$1
        });
    }
    normalizePath(resource) {
        if (!resource.path.length) {
            return resource;
        }
        let normalizedPath;
        if (resource.scheme === Schemas.file) {
            normalizedPath = URI.file(normalize(originalFSPath(resource))).path;
        }
        else {
            normalizedPath = posix.normalize(resource.path);
        }
        return resource.with({
            path: normalizedPath
        });
    }
    resolvePath(base, path) {
        if (base.scheme === Schemas.file) {
            const newURI = URI.file(resolve(originalFSPath(base), path));
            return base.with({
                authority: newURI.authority,
                path: newURI.path
            });
        }
        path = toPosixPath(path); // we allow path to be a windows path
        return base.with({
            path: posix.resolve(base.path, path)
        });
    }
}
/**
 * Unbiased utility that takes uris "as they are". This means it can be interchanged with
 * uri#toString() usages. The following is true
 * ```
 * assertEqual(aUri.toString() === bUri.toString(), exturi.isEqual(aUri, bUri))
 * ```
 */
const extUri = new ExtUri(() => false);
const isEqual = extUri.isEqual.bind(extUri);
const basenameOrAuthority = extUri.basenameOrAuthority.bind(extUri);
const basename$1 = extUri.basename.bind(extUri);
const dirname$1 = extUri.dirname.bind(extUri);
const joinPath = extUri.joinPath.bind(extUri);
const normalizePath = extUri.normalizePath.bind(extUri);
const resolvePath = extUri.resolvePath.bind(extUri);
/**
 * Data URI related helpers.
 */
var DataUri;
(function (DataUri) {
    DataUri.META_DATA_LABEL = 'label';
    DataUri.META_DATA_DESCRIPTION = 'description';
    DataUri.META_DATA_SIZE = 'size';
    DataUri.META_DATA_MIME = 'mime';
    function parseMetaData(dataUri) {
        const metadata = new Map();
        // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
        // the metadata is: size:2313;label:SomeLabel;description:SomeDescription
        const meta = dataUri.path.substring(dataUri.path.indexOf(';') + 1, dataUri.path.lastIndexOf(';'));
        meta.split(';').forEach(property => {
            const [key, value] = property.split(':');
            if (key && value) {
                metadata.set(key, value);
            }
        });
        // Given a URI of:  data:image/png;size:2313;label:SomeLabel;description:SomeDescription;base64,77+9UE5...
        // the mime is: image/png
        const mime = dataUri.path.substring(0, dataUri.path.indexOf(';'));
        if (mime) {
            metadata.set(DataUri.META_DATA_MIME, mime);
        }
        return metadata;
    }
    DataUri.parseMetaData = parseMetaData;
})(DataUri || (DataUri = {}));

/**
 * Vertical Lane in the overview ruler of the editor.
 */
var OverviewRulerLane;
(function (OverviewRulerLane) {
    OverviewRulerLane[OverviewRulerLane["Left"] = 1] = "Left";
    OverviewRulerLane[OverviewRulerLane["Center"] = 2] = "Center";
    OverviewRulerLane[OverviewRulerLane["Right"] = 4] = "Right";
    OverviewRulerLane[OverviewRulerLane["Full"] = 7] = "Full";
})(OverviewRulerLane || (OverviewRulerLane = {}));
/**
 * Position in the minimap to render the decoration.
 */
var MinimapPosition;
(function (MinimapPosition) {
    MinimapPosition[MinimapPosition["Inline"] = 1] = "Inline";
    MinimapPosition[MinimapPosition["Gutter"] = 2] = "Gutter";
})(MinimapPosition || (MinimapPosition = {}));
class TextModelResolvedOptions {
    /**
     * @internal
     */
    constructor(src) {
        this.tabSize = Math.max(1, src.tabSize | 0);
        this.indentSize = src.tabSize | 0;
        this.insertSpaces = Boolean(src.insertSpaces);
        this.defaultEOL = src.defaultEOL | 0;
        this.trimAutoWhitespace = Boolean(src.trimAutoWhitespace);
    }
    /**
     * @internal
     */
    equals(other) {
        return (this.tabSize === other.tabSize
            && this.indentSize === other.indentSize
            && this.insertSpaces === other.insertSpaces
            && this.defaultEOL === other.defaultEOL
            && this.trimAutoWhitespace === other.trimAutoWhitespace);
    }
    /**
     * @internal
     */
    createChangeEvent(newOpts) {
        return {
            tabSize: this.tabSize !== newOpts.tabSize,
            indentSize: this.indentSize !== newOpts.indentSize,
            insertSpaces: this.insertSpaces !== newOpts.insertSpaces,
            trimAutoWhitespace: this.trimAutoWhitespace !== newOpts.trimAutoWhitespace,
        };
    }
}
class FindMatch {
    /**
     * @internal
     */
    constructor(range, matches) {
        this.range = range;
        this.matches = matches;
    }
}
/**
 * @internal
 */
class ValidAnnotatedEditOperation {
    constructor(identifier, range, text, forceMoveMarkers, isAutoWhitespaceEdit, _isTracked) {
        this.identifier = identifier;
        this.range = range;
        this.text = text;
        this.forceMoveMarkers = forceMoveMarkers;
        this.isAutoWhitespaceEdit = isAutoWhitespaceEdit;
        this._isTracked = _isTracked;
    }
}
/**
 * @internal
 */
class ApplyEditsResult {
    constructor(reverseEdits, changes, trimAutoWhitespaceLineNumbers) {
        this.reverseEdits = reverseEdits;
        this.changes = changes;
        this.trimAutoWhitespaceLineNumbers = trimAutoWhitespaceLineNumbers;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Return a hash value for an object.
 */
function hash(obj) {
    return doHash(obj, 0);
}
function doHash(obj, hashVal) {
    switch (typeof obj) {
        case 'object':
            if (obj === null) {
                return numberHash(349, hashVal);
            }
            else if (Array.isArray(obj)) {
                return arrayHash(obj, hashVal);
            }
            return objectHash(obj, hashVal);
        case 'string':
            return stringHash(obj, hashVal);
        case 'boolean':
            return booleanHash(obj, hashVal);
        case 'number':
            return numberHash(obj, hashVal);
        case 'undefined':
            return numberHash(937, hashVal);
        default:
            return numberHash(617, hashVal);
    }
}
function numberHash(val, initialHashVal) {
    return (((initialHashVal << 5) - initialHashVal) + val) | 0; // hashVal * 31 + ch, keep as int32
}
function booleanHash(b, initialHashVal) {
    return numberHash(b ? 433 : 863, initialHashVal);
}
function stringHash(s, hashVal) {
    hashVal = numberHash(149417, hashVal);
    for (let i = 0, length = s.length; i < length; i++) {
        hashVal = numberHash(s.charCodeAt(i), hashVal);
    }
    return hashVal;
}
function arrayHash(arr, initialHashVal) {
    initialHashVal = numberHash(104579, initialHashVal);
    return arr.reduce((hashVal, item) => doHash(item, hashVal), initialHashVal);
}
function objectHash(obj, initialHashVal) {
    initialHashVal = numberHash(181387, initialHashVal);
    return Object.keys(obj).sort().reduce((hashVal, key) => {
        hashVal = stringHash(key, hashVal);
        return doHash(obj[key], hashVal);
    }, initialHashVal);
}
function leftRotate(value, bits, totalBits = 32) {
    // delta + bits = totalBits
    const delta = totalBits - bits;
    // All ones, expect `delta` zeros aligned to the right
    const mask = ~((1 << delta) - 1);
    // Join (value left-shifted `bits` bits) with (masked value right-shifted `delta` bits)
    return ((value << bits) | ((mask & value) >>> delta)) >>> 0;
}
function fill(dest, index = 0, count = dest.byteLength, value = 0) {
    for (let i = 0; i < count; i++) {
        dest[index + i] = value;
    }
}
function leftPad(value, length, char = '0') {
    while (value.length < length) {
        value = char + value;
    }
    return value;
}
function toHexString(bufferOrValue, bitsize = 32) {
    if (bufferOrValue instanceof ArrayBuffer) {
        return Array.from(new Uint8Array(bufferOrValue)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    return leftPad((bufferOrValue >>> 0).toString(16), bitsize / 4);
}
/**
 * A SHA1 implementation that works with strings and does not allocate.
 */
class StringSHA1 {
    constructor() {
        this._h0 = 0x67452301;
        this._h1 = 0xEFCDAB89;
        this._h2 = 0x98BADCFE;
        this._h3 = 0x10325476;
        this._h4 = 0xC3D2E1F0;
        this._buff = new Uint8Array(64 /* BLOCK_SIZE */ + 3 /* to fit any utf-8 */);
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
        }
        else {
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
                    }
                    else {
                        // illegal => unicode replacement character
                        codePoint = 65533 /* UNICODE_REPLACEMENT */;
                    }
                }
                else {
                    // last character is a surrogate pair
                    leftoverHighSurrogate = charCode;
                    break;
                }
            }
            else if (isLowSurrogate(charCode)) {
                // illegal => unicode replacement character
                codePoint = 65533 /* UNICODE_REPLACEMENT */;
            }
            buffLen = this._push(buff, buffLen, codePoint);
            offset++;
            if (offset < strLen) {
                charCode = str.charCodeAt(offset);
            }
            else {
                break;
            }
        }
        this._buffLen = buffLen;
        this._leftoverHighSurrogate = leftoverHighSurrogate;
    }
    _push(buff, buffLen, codePoint) {
        if (codePoint < 0x0080) {
            buff[buffLen++] = codePoint;
        }
        else if (codePoint < 0x0800) {
            buff[buffLen++] = 0b11000000 | ((codePoint & 0b00000000000000000000011111000000) >>> 6);
            buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
        }
        else if (codePoint < 0x10000) {
            buff[buffLen++] = 0b11100000 | ((codePoint & 0b00000000000000001111000000000000) >>> 12);
            buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
            buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
        }
        else {
            buff[buffLen++] = 0b11110000 | ((codePoint & 0b00000000000111000000000000000000) >>> 18);
            buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000111111000000000000) >>> 12);
            buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
            buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
        }
        if (buffLen >= 64 /* BLOCK_SIZE */) {
            this._step();
            buffLen -= 64 /* BLOCK_SIZE */;
            this._totalLen += 64 /* BLOCK_SIZE */;
            // take last 3 in case of UTF8 overflow
            buff[0] = buff[64 /* BLOCK_SIZE */ + 0];
            buff[1] = buff[64 /* BLOCK_SIZE */ + 1];
            buff[2] = buff[64 /* BLOCK_SIZE */ + 2];
        }
        return buffLen;
    }
    digest() {
        if (!this._finished) {
            this._finished = true;
            if (this._leftoverHighSurrogate) {
                // illegal => unicode replacement character
                this._leftoverHighSurrogate = 0;
                this._buffLen = this._push(this._buff, this._buffLen, 65533 /* UNICODE_REPLACEMENT */);
            }
            this._totalLen += this._buffLen;
            this._wrapUp();
        }
        return toHexString(this._h0) + toHexString(this._h1) + toHexString(this._h2) + toHexString(this._h3) + toHexString(this._h4);
    }
    _wrapUp() {
        this._buff[this._buffLen++] = 0x80;
        fill(this._buff, this._buffLen);
        if (this._buffLen > 56) {
            this._step();
            fill(this._buff);
        }
        // this will fit because the mantissa can cover up to 52 bits
        const ml = 8 * this._totalLen;
        this._buffDV.setUint32(56, Math.floor(ml / 4294967296), false);
        this._buffDV.setUint32(60, ml % 4294967296, false);
        this._step();
    }
    _step() {
        const bigBlock32 = StringSHA1._bigBlock32;
        const data = this._buffDV;
        for (let j = 0; j < 64 /* 16*4 */; j += 4) {
            bigBlock32.setUint32(j, data.getUint32(j, false), false);
        }
        for (let j = 64; j < 320 /* 80*4 */; j += 4) {
            bigBlock32.setUint32(j, leftRotate((bigBlock32.getUint32(j - 12, false) ^ bigBlock32.getUint32(j - 32, false) ^ bigBlock32.getUint32(j - 56, false) ^ bigBlock32.getUint32(j - 64, false)), 1), false);
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
                f = (b & c) | ((~b) & d);
                k = 0x5A827999;
            }
            else if (j < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            }
            else if (j < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8F1BBCDC;
            }
            else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }
            temp = (leftRotate(a, 5) + f + e + k + bigBlock32.getUint32(j * 4, false)) & 0xffffffff;
            e = d;
            d = c;
            c = leftRotate(b, 30);
            b = a;
            a = temp;
        }
        this._h0 = (this._h0 + a) & 0xffffffff;
        this._h1 = (this._h1 + b) & 0xffffffff;
        this._h2 = (this._h2 + c) & 0xffffffff;
        this._h3 = (this._h3 + d) & 0xffffffff;
        this._h4 = (this._h4 + e) & 0xffffffff;
    }
}
StringSHA1._bigBlock32 = new DataView(new ArrayBuffer(320)); // 80 * 4 = 320

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
class MovingAverage {
    constructor() {
        this._n = 1;
        this._val = 0;
    }
    update(value) {
        this._val = this._val + (value - this._val) / this._n;
        this._n += 1;
        return this;
    }
    get value() {
        return this._val;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const GLOBSTAR = '**';
const GLOB_SPLIT = '/';
const PATH_REGEX = '[/\\\\]'; // any slash or backslash
const NO_PATH_REGEX = '[^/\\\\]'; // any non-slash and non-backslash
const ALL_FORWARD_SLASHES = /\//g;
function starsToRegExp(starCount) {
    switch (starCount) {
        case 0:
            return '';
        case 1:
            return `${NO_PATH_REGEX}*?`; // 1 star matches any number of characters except path separator (/ and \) - non greedy (?)
        default:
            // Matches:  (Path Sep OR Path Val followed by Path Sep OR Path Sep followed by Path Val) 0-many times
            // Group is non capturing because we don't need to capture at all (?:...)
            // Overall we use non-greedy matching because it could be that we match too much
            return `(?:${PATH_REGEX}|${NO_PATH_REGEX}+${PATH_REGEX}|${PATH_REGEX}${NO_PATH_REGEX}+)*?`;
    }
}
function splitGlobAware(pattern, splitChar) {
    if (!pattern) {
        return [];
    }
    const segments = [];
    let inBraces = false;
    let inBrackets = false;
    let curVal = '';
    for (const char of pattern) {
        switch (char) {
            case splitChar:
                if (!inBraces && !inBrackets) {
                    segments.push(curVal);
                    curVal = '';
                    continue;
                }
                break;
            case '{':
                inBraces = true;
                break;
            case '}':
                inBraces = false;
                break;
            case '[':
                inBrackets = true;
                break;
            case ']':
                inBrackets = false;
                break;
        }
        curVal += char;
    }
    // Tail
    if (curVal) {
        segments.push(curVal);
    }
    return segments;
}
function parseRegExp(pattern) {
    if (!pattern) {
        return '';
    }
    let regEx = '';
    // Split up into segments for each slash found
    const segments = splitGlobAware(pattern, GLOB_SPLIT);
    // Special case where we only have globstars
    if (segments.every(s => s === GLOBSTAR)) {
        regEx = '.*';
    }
    // Build regex over segments
    else {
        let previousSegmentWasGlobStar = false;
        segments.forEach((segment, index) => {
            // Globstar is special
            if (segment === GLOBSTAR) {
                // if we have more than one globstar after another, just ignore it
                if (!previousSegmentWasGlobStar) {
                    regEx += starsToRegExp(2);
                    previousSegmentWasGlobStar = true;
                }
                return;
            }
            // States
            let inBraces = false;
            let braceVal = '';
            let inBrackets = false;
            let bracketVal = '';
            for (const char of segment) {
                // Support brace expansion
                if (char !== '}' && inBraces) {
                    braceVal += char;
                    continue;
                }
                // Support brackets
                if (inBrackets && (char !== ']' || !bracketVal) /* ] is literally only allowed as first character in brackets to match it */) {
                    let res;
                    // range operator
                    if (char === '-') {
                        res = char;
                    }
                    // negation operator (only valid on first index in bracket)
                    else if ((char === '^' || char === '!') && !bracketVal) {
                        res = '^';
                    }
                    // glob split matching is not allowed within character ranges
                    // see http://man7.org/linux/man-pages/man7/glob.7.html
                    else if (char === GLOB_SPLIT) {
                        res = '';
                    }
                    // anything else gets escaped
                    else {
                        res = escapeRegExpCharacters(char);
                    }
                    bracketVal += res;
                    continue;
                }
                switch (char) {
                    case '{':
                        inBraces = true;
                        continue;
                    case '[':
                        inBrackets = true;
                        continue;
                    case '}':
                        const choices = splitGlobAware(braceVal, ',');
                        // Converts {foo,bar} => [foo|bar]
                        const braceRegExp = `(?:${choices.map(c => parseRegExp(c)).join('|')})`;
                        regEx += braceRegExp;
                        inBraces = false;
                        braceVal = '';
                        break;
                    case ']':
                        regEx += ('[' + bracketVal + ']');
                        inBrackets = false;
                        bracketVal = '';
                        break;
                    case '?':
                        regEx += NO_PATH_REGEX; // 1 ? matches any single character except path separator (/ and \)
                        continue;
                    case '*':
                        regEx += starsToRegExp(1);
                        continue;
                    default:
                        regEx += escapeRegExpCharacters(char);
                }
            }
            // Tail: Add the slash we had split on if there is more to come and the remaining pattern is not a globstar
            // For example if pattern: some/**/*.js we want the "/" after some to be included in the RegEx to prevent
            // a folder called "something" to match as well.
            // However, if pattern: some/**, we tolerate that we also match on "something" because our globstar behaviour
            // is to match 0-N segments.
            if (index < segments.length - 1 && (segments[index + 1] !== GLOBSTAR || index + 2 < segments.length)) {
                regEx += PATH_REGEX;
            }
            // reset state
            previousSegmentWasGlobStar = false;
        });
    }
    return regEx;
}
// regexes to check for trival glob patterns that just check for String#endsWith
const T1 = /^\*\*\/\*\.[\w\.-]+$/; // **/*.something
const T2 = /^\*\*\/([\w\.-]+)\/?$/; // **/something
const T3 = /^{\*\*\/[\*\.]?[\w\.-]+\/?(,\*\*\/[\*\.]?[\w\.-]+\/?)*}$/; // {**/*.something,**/*.else} or {**/package.json,**/project.json}
const T3_2 = /^{\*\*\/[\*\.]?[\w\.-]+(\/(\*\*)?)?(,\*\*\/[\*\.]?[\w\.-]+(\/(\*\*)?)?)*}$/; // Like T3, with optional trailing /**
const T4 = /^\*\*((\/[\w\.-]+)+)\/?$/; // **/something/else
const T5 = /^([\w\.-]+(\/[\w\.-]+)*)\/?$/; // something/else
const CACHE = new LRUCache(10000); // bounded to 10000 elements
const FALSE = function () {
    return false;
};
const NULL = function () {
    return null;
};
function parsePattern(arg1, options) {
    if (!arg1) {
        return NULL;
    }
    // Handle IRelativePattern
    let pattern;
    if (typeof arg1 !== 'string') {
        pattern = arg1.pattern;
    }
    else {
        pattern = arg1;
    }
    // Whitespace trimming
    pattern = pattern.trim();
    // Check cache
    const patternKey = `${pattern}_${!!options.trimForExclusions}`;
    let parsedPattern = CACHE.get(patternKey);
    if (parsedPattern) {
        return wrapRelativePattern(parsedPattern, arg1);
    }
    // Check for Trivias
    let match;
    if (T1.test(pattern)) { // common pattern: **/*.txt just need endsWith check
        const base = pattern.substr(4); // '**/*'.length === 4
        parsedPattern = function (path, basename) {
            return typeof path === 'string' && path.endsWith(base) ? pattern : null;
        };
    }
    else if (match = T2.exec(trimForExclusions(pattern, options))) { // common pattern: **/some.txt just need basename check
        parsedPattern = trivia2(match[1], pattern);
    }
    else if ((options.trimForExclusions ? T3_2 : T3).test(pattern)) { // repetition of common patterns (see above) {**/*.txt,**/*.png}
        parsedPattern = trivia3(pattern, options);
    }
    else if (match = T4.exec(trimForExclusions(pattern, options))) { // common pattern: **/something/else just need endsWith check
        parsedPattern = trivia4and5(match[1].substr(1), pattern, true);
    }
    else if (match = T5.exec(trimForExclusions(pattern, options))) { // common pattern: something/else just need equals check
        parsedPattern = trivia4and5(match[1], pattern, false);
    }
    // Otherwise convert to pattern
    else {
        parsedPattern = toRegExp(pattern);
    }
    // Cache
    CACHE.set(patternKey, parsedPattern);
    return wrapRelativePattern(parsedPattern, arg1);
}
function wrapRelativePattern(parsedPattern, arg2) {
    if (typeof arg2 === 'string') {
        return parsedPattern;
    }
    return function (path, basename) {
        if (!isEqualOrParent(path, arg2.base)) {
            return null;
        }
        return parsedPattern(relative(arg2.base, path), basename);
    };
}
function trimForExclusions(pattern, options) {
    return options.trimForExclusions && pattern.endsWith('/**') ? pattern.substr(0, pattern.length - 2) : pattern; // dropping **, tailing / is dropped later
}
// common pattern: **/some.txt just need basename check
function trivia2(base, originalPattern) {
    const slashBase = `/${base}`;
    const backslashBase = `\\${base}`;
    const parsedPattern = function (path, basename) {
        if (typeof path !== 'string') {
            return null;
        }
        if (basename) {
            return basename === base ? originalPattern : null;
        }
        return path === base || path.endsWith(slashBase) || path.endsWith(backslashBase) ? originalPattern : null;
    };
    const basenames = [base];
    parsedPattern.basenames = basenames;
    parsedPattern.patterns = [originalPattern];
    parsedPattern.allBasenames = basenames;
    return parsedPattern;
}
// repetition of common patterns (see above) {**/*.txt,**/*.png}
function trivia3(pattern, options) {
    const parsedPatterns = aggregateBasenameMatches(pattern.slice(1, -1).split(',')
        .map(pattern => parsePattern(pattern, options))
        .filter(pattern => pattern !== NULL), pattern);
    const n = parsedPatterns.length;
    if (!n) {
        return NULL;
    }
    if (n === 1) {
        return parsedPatterns[0];
    }
    const parsedPattern = function (path, basename) {
        for (let i = 0, n = parsedPatterns.length; i < n; i++) {
            if (parsedPatterns[i](path, basename)) {
                return pattern;
            }
        }
        return null;
    };
    const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
    if (withBasenames) {
        parsedPattern.allBasenames = withBasenames.allBasenames;
    }
    const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
    if (allPaths.length) {
        parsedPattern.allPaths = allPaths;
    }
    return parsedPattern;
}
// common patterns: **/something/else just need endsWith check, something/else just needs and equals check
function trivia4and5(targetPath, pattern, matchPathEnds) {
    const usingPosixSep = sep === posix.sep;
    const nativePath = usingPosixSep ? targetPath : targetPath.replace(ALL_FORWARD_SLASHES, sep);
    const nativePathEnd = sep + nativePath;
    const targetPathEnd = posix.sep + targetPath;
    const parsedPattern = matchPathEnds ? function (testPath, basename) {
        return typeof testPath === 'string' &&
            ((testPath === nativePath || testPath.endsWith(nativePathEnd))
                || !usingPosixSep && (testPath === targetPath || testPath.endsWith(targetPathEnd)))
            ? pattern : null;
    } : function (testPath, basename) {
        return typeof testPath === 'string' &&
            (testPath === nativePath
                || (!usingPosixSep && testPath === targetPath))
            ? pattern : null;
    };
    parsedPattern.allPaths = [(matchPathEnds ? '*/' : './') + targetPath];
    return parsedPattern;
}
function toRegExp(pattern) {
    try {
        const regExp = new RegExp(`^${parseRegExp(pattern)}$`);
        return function (path) {
            regExp.lastIndex = 0; // reset RegExp to its initial state to reuse it!
            return typeof path === 'string' && regExp.test(path) ? pattern : null;
        };
    }
    catch (error) {
        return NULL;
    }
}
function match(arg1, path, hasSibling) {
    if (!arg1 || typeof path !== 'string') {
        return false;
    }
    return parse(arg1)(path, undefined, hasSibling);
}
function parse(arg1, options = {}) {
    if (!arg1) {
        return FALSE;
    }
    // Glob with String
    if (typeof arg1 === 'string' || isRelativePattern(arg1)) {
        const parsedPattern = parsePattern(arg1, options);
        if (parsedPattern === NULL) {
            return FALSE;
        }
        const resultPattern = function (path, basename) {
            return !!parsedPattern(path, basename);
        };
        if (parsedPattern.allBasenames) {
            resultPattern.allBasenames = parsedPattern.allBasenames;
        }
        if (parsedPattern.allPaths) {
            resultPattern.allPaths = parsedPattern.allPaths;
        }
        return resultPattern;
    }
    // Glob with Expression
    return parsedExpression(arg1, options);
}
function isRelativePattern(obj) {
    const rp = obj;
    return rp && typeof rp.base === 'string' && typeof rp.pattern === 'string';
}
function parsedExpression(expression, options) {
    const parsedPatterns = aggregateBasenameMatches(Object.getOwnPropertyNames(expression)
        .map(pattern => parseExpressionPattern(pattern, expression[pattern], options))
        .filter(pattern => pattern !== NULL));
    const n = parsedPatterns.length;
    if (!n) {
        return NULL;
    }
    if (!parsedPatterns.some(parsedPattern => !!parsedPattern.requiresSiblings)) {
        if (n === 1) {
            return parsedPatterns[0];
        }
        const resultExpression = function (path, basename) {
            for (let i = 0, n = parsedPatterns.length; i < n; i++) {
                // Pattern matches path
                const result = parsedPatterns[i](path, basename);
                if (result) {
                    return result;
                }
            }
            return null;
        };
        const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
        if (withBasenames) {
            resultExpression.allBasenames = withBasenames.allBasenames;
        }
        const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
        if (allPaths.length) {
            resultExpression.allPaths = allPaths;
        }
        return resultExpression;
    }
    const resultExpression = function (path, basename$1, hasSibling) {
        let name = undefined;
        for (let i = 0, n = parsedPatterns.length; i < n; i++) {
            // Pattern matches path
            const parsedPattern = parsedPatterns[i];
            if (parsedPattern.requiresSiblings && hasSibling) {
                if (!basename$1) {
                    basename$1 = basename(path);
                }
                if (!name) {
                    name = basename$1.substr(0, basename$1.length - extname(path).length);
                }
            }
            const result = parsedPattern(path, basename$1, name, hasSibling);
            if (result) {
                return result;
            }
        }
        return null;
    };
    const withBasenames = parsedPatterns.find(pattern => !!pattern.allBasenames);
    if (withBasenames) {
        resultExpression.allBasenames = withBasenames.allBasenames;
    }
    const allPaths = parsedPatterns.reduce((all, current) => current.allPaths ? all.concat(current.allPaths) : all, []);
    if (allPaths.length) {
        resultExpression.allPaths = allPaths;
    }
    return resultExpression;
}
function parseExpressionPattern(pattern, value, options) {
    if (value === false) {
        return NULL; // pattern is disabled
    }
    const parsedPattern = parsePattern(pattern, options);
    if (parsedPattern === NULL) {
        return NULL;
    }
    // Expression Pattern is <boolean>
    if (typeof value === 'boolean') {
        return parsedPattern;
    }
    // Expression Pattern is <SiblingClause>
    if (value) {
        const when = value.when;
        if (typeof when === 'string') {
            const result = (path, basename, name, hasSibling) => {
                if (!hasSibling || !parsedPattern(path, basename)) {
                    return null;
                }
                const clausePattern = when.replace('$(basename)', name);
                const matched = hasSibling(clausePattern);
                return isThenable(matched) ?
                    matched.then(m => m ? pattern : null) :
                    matched ? pattern : null;
            };
            result.requiresSiblings = true;
            return result;
        }
    }
    // Expression is Anything
    return parsedPattern;
}
function aggregateBasenameMatches(parsedPatterns, result) {
    const basenamePatterns = parsedPatterns.filter(parsedPattern => !!parsedPattern.basenames);
    if (basenamePatterns.length < 2) {
        return parsedPatterns;
    }
    const basenames = basenamePatterns.reduce((all, current) => {
        const basenames = current.basenames;
        return basenames ? all.concat(basenames) : all;
    }, []);
    let patterns;
    if (result) {
        patterns = [];
        for (let i = 0, n = basenames.length; i < n; i++) {
            patterns.push(result);
        }
    }
    else {
        patterns = basenamePatterns.reduce((all, current) => {
            const patterns = current.patterns;
            return patterns ? all.concat(patterns) : all;
        }, []);
    }
    const aggregate = function (path, basename) {
        if (typeof path !== 'string') {
            return null;
        }
        if (!basename) {
            let i;
            for (i = path.length; i > 0; i--) {
                const ch = path.charCodeAt(i - 1);
                if (ch === 47 /* Slash */ || ch === 92 /* Backslash */) {
                    break;
                }
            }
            basename = path.substr(i);
        }
        const index = basenames.indexOf(basename);
        return index !== -1 ? patterns[index] : null;
    };
    aggregate.basenames = basenames;
    aggregate.patterns = patterns;
    aggregate.allBasenames = basenames;
    const aggregatedPatterns = parsedPatterns.filter(parsedPattern => !parsedPattern.basenames);
    aggregatedPatterns.push(aggregate);
    return aggregatedPatterns;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function score(selector, candidateUri, candidateLanguage, candidateIsSynchronized) {
    if (Array.isArray(selector)) {
        // array -> take max individual value
        let ret = 0;
        for (const filter of selector) {
            const value = score(filter, candidateUri, candidateLanguage, candidateIsSynchronized);
            if (value === 10) {
                return value; // already at the highest
            }
            if (value > ret) {
                ret = value;
            }
        }
        return ret;
    }
    else if (typeof selector === 'string') {
        if (!candidateIsSynchronized) {
            return 0;
        }
        // short-hand notion, desugars to
        // 'fooLang' -> { language: 'fooLang'}
        // '*' -> { language: '*' }
        if (selector === '*') {
            return 5;
        }
        else if (selector === candidateLanguage) {
            return 10;
        }
        else {
            return 0;
        }
    }
    else if (selector) {
        // filter -> select accordingly, use defaults for scheme
        const { language, pattern, scheme, hasAccessToAllModels } = selector; // TODO: microsoft/TypeScript#42768
        if (!candidateIsSynchronized && !hasAccessToAllModels) {
            return 0;
        }
        let ret = 0;
        if (scheme) {
            if (scheme === candidateUri.scheme) {
                ret = 10;
            }
            else if (scheme === '*') {
                ret = 5;
            }
            else {
                return 0;
            }
        }
        if (language) {
            if (language === candidateLanguage) {
                ret = 10;
            }
            else if (language === '*') {
                ret = Math.max(ret, 5);
            }
            else {
                return 0;
            }
        }
        if (pattern) {
            let normalizedPattern;
            if (typeof pattern === 'string') {
                normalizedPattern = pattern;
            }
            else {
                // Since this pattern has a `base` property, we need
                // to normalize this path first before passing it on
                // because we will compare it against `Uri.fsPath`
                // which uses platform specific separators.
                // Refs: https://github.com/microsoft/vscode/issues/99938
                normalizedPattern = Object.assign(Object.assign({}, pattern), { base: normalize(pattern.base) });
            }
            if (normalizedPattern === candidateUri.fsPath || match(normalizedPattern, candidateUri.fsPath)) {
                ret = 10;
            }
            else {
                return 0;
            }
        }
        return ret;
    }
    else {
        return 0;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const IModelService = createDecorator('modelService');
function shouldSynchronizeModel(model) {
    return (!model.isTooLargeForSyncing() && !model.isForSimpleWidget);
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function isExclusive(selector) {
    if (typeof selector === 'string') {
        return false;
    }
    else if (Array.isArray(selector)) {
        return selector.every(isExclusive);
    }
    else {
        return !!selector.exclusive; // TODO: microsoft/TypeScript#42768
    }
}
class LanguageFeatureRegistry {
    constructor() {
        this._clock = 0;
        this._entries = [];
        this._onDidChange = new Emitter();
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    register(selector, provider) {
        let entry = {
            selector,
            provider,
            _score: -1,
            _time: this._clock++
        };
        this._entries.push(entry);
        this._lastCandidate = undefined;
        this._onDidChange.fire(this._entries.length);
        return toDisposable(() => {
            if (entry) {
                let idx = this._entries.indexOf(entry);
                if (idx >= 0) {
                    this._entries.splice(idx, 1);
                    this._lastCandidate = undefined;
                    this._onDidChange.fire(this._entries.length);
                    entry = undefined;
                }
            }
        });
    }
    has(model) {
        return this.all(model).length > 0;
    }
    all(model) {
        if (!model) {
            return [];
        }
        this._updateScores(model);
        const result = [];
        // from registry
        for (let entry of this._entries) {
            if (entry._score > 0) {
                result.push(entry.provider);
            }
        }
        return result;
    }
    ordered(model) {
        const result = [];
        this._orderedForEach(model, entry => result.push(entry.provider));
        return result;
    }
    orderedGroups(model) {
        const result = [];
        let lastBucket;
        let lastBucketScore;
        this._orderedForEach(model, entry => {
            if (lastBucket && lastBucketScore === entry._score) {
                lastBucket.push(entry.provider);
            }
            else {
                lastBucketScore = entry._score;
                lastBucket = [entry.provider];
                result.push(lastBucket);
            }
        });
        return result;
    }
    _orderedForEach(model, callback) {
        if (!model) {
            return;
        }
        this._updateScores(model);
        for (const entry of this._entries) {
            if (entry._score > 0) {
                callback(entry);
            }
        }
    }
    _updateScores(model) {
        let candidate = {
            uri: model.uri.toString(),
            language: model.getLanguageIdentifier().language
        };
        if (this._lastCandidate
            && this._lastCandidate.language === candidate.language
            && this._lastCandidate.uri === candidate.uri) {
            // nothing has changed
            return;
        }
        this._lastCandidate = candidate;
        for (let entry of this._entries) {
            entry._score = score(entry.selector, model.uri, model.getLanguageIdentifier().language, shouldSynchronizeModel(model));
            if (isExclusive(entry.selector) && entry._score > 0) {
                // support for one exclusive selector that overwrites
                // any other selector
                for (let entry of this._entries) {
                    entry._score = 0;
                }
                entry._score = 1000;
                break;
            }
        }
        // needs sorting
        this._entries.sort(LanguageFeatureRegistry._compareByScoreAndTime);
    }
    static _compareByScoreAndTime(a, b) {
        if (a._score < b._score) {
            return 1;
        }
        else if (a._score > b._score) {
            return -1;
        }
        else if (a._time < b._time) {
            return 1;
        }
        else if (a._time > b._time) {
            return -1;
        }
        else {
            return 0;
        }
    }
}
/**
 * Keeps moving average per model and set of providers so that requests
 * can be debounce according to the provider performance
 */
class LanguageFeatureRequestDelays {
    constructor(_registry, min, max = Number.MAX_SAFE_INTEGER) {
        this._registry = _registry;
        this.min = min;
        this.max = max;
        this._cache = new LRUCache(50, 0.7);
    }
    _key(model) {
        return model.id + hash(this._registry.all(model));
    }
    _clamp(value) {
        if (value === undefined) {
            return this.min;
        }
        else {
            return Math.min(this.max, Math.max(this.min, Math.floor(value * 1.3)));
        }
    }
    get(model) {
        const key = this._key(model);
        const avg = this._cache.get(key);
        return this._clamp(avg === null || avg === void 0 ? void 0 : avg.value);
    }
    update(model, value) {
        const key = this._key(model);
        let avg = this._cache.get(key);
        if (!avg) {
            avg = new MovingAverage();
            this._cache.set(key, avg);
        }
        avg.update(value);
        return this.get(model);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class TokenizationRegistryImpl {
    constructor() {
        this._map = new Map();
        this._promises = new Map();
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._colorMap = null;
    }
    fire(languages) {
        this._onDidChange.fire({
            changedLanguages: languages,
            changedColorMap: false
        });
    }
    register(language, support) {
        this._map.set(language, support);
        this.fire([language]);
        return toDisposable(() => {
            if (this._map.get(language) !== support) {
                return;
            }
            this._map.delete(language);
            this.fire([language]);
        });
    }
    registerPromise(language, supportPromise) {
        let registration = null;
        let isDisposed = false;
        this._promises.set(language, supportPromise.then(support => {
            this._promises.delete(language);
            if (isDisposed || !support) {
                return;
            }
            registration = this.register(language, support);
        }));
        return toDisposable(() => {
            isDisposed = true;
            if (registration) {
                registration.dispose();
            }
        });
    }
    getPromise(language) {
        const support = this.get(language);
        if (support) {
            return Promise.resolve(support);
        }
        const promise = this._promises.get(language);
        if (promise) {
            return promise.then(_ => this.get(language));
        }
        return null;
    }
    get(language) {
        return (this._map.get(language) || null);
    }
    setColorMap(colorMap) {
        this._colorMap = colorMap;
        this._onDidChange.fire({
            changedLanguages: Array.from(this._map.keys()),
            changedColorMap: true
        });
    }
    getColorMap() {
        return this._colorMap;
    }
    getDefaultBackground() {
        if (this._colorMap && this._colorMap.length > 2 /* DefaultBackground */) {
            return this._colorMap[2 /* DefaultBackground */];
        }
        return null;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class Registry {
    constructor() {
        this._icons = new Map();
        this._onDidRegister = new Emitter();
    }
    add(icon) {
        const existing = this._icons.get(icon.id);
        if (!existing) {
            this._icons.set(icon.id, icon);
            this._onDidRegister.fire(icon);
        }
        else if (icon.description) {
            existing.description = icon.description;
        }
        else {
            console.error(`Duplicate registration of codicon ${icon.id}`);
        }
    }
    get(id) {
        return this._icons.get(id);
    }
    get all() {
        return this._icons.values();
    }
    get onDidRegister() {
        return this._onDidRegister.event;
    }
}
const _registry = new Registry();
const iconRegistry = _registry;
function registerCodicon(id, def) {
    return new Codicon(id, def);
}
// Selects all codicon names encapsulated in the `$()` syntax and wraps the
// results with spaces so that screen readers can read the text better.
function getCodiconAriaLabel(text) {
    if (!text) {
        return '';
    }
    return text.replace(/\$\((.*?)\)/g, (_match, codiconName) => ` ${codiconName} `).trim();
}
class Codicon {
    constructor(id, definition, description) {
        this.id = id;
        this.definition = definition;
        this.description = description;
        _registry.add(this);
    }
    get classNames() { return 'codicon codicon-' + this.id; }
    // classNamesArray is useful for migrating to ES6 classlist
    get classNamesArray() { return ['codicon', 'codicon-' + this.id]; }
    get cssSelector() { return '.codicon.codicon-' + this.id; }
}
var CSSIcon;
(function (CSSIcon) {
    CSSIcon.iconNameSegment = '[A-Za-z0-9]+';
    CSSIcon.iconNameExpression = '[A-Za-z0-9\\-]+';
    CSSIcon.iconModifierExpression = '~[A-Za-z]+';
    const cssIconIdRegex = new RegExp(`^(${CSSIcon.iconNameExpression})(${CSSIcon.iconModifierExpression})?$`);
    function asClassNameArray(icon) {
        if (icon instanceof Codicon) {
            return ['codicon', 'codicon-' + icon.id];
        }
        const match = cssIconIdRegex.exec(icon.id);
        if (!match) {
            return asClassNameArray(Codicon.error);
        }
        let [, id, modifier] = match;
        const classNames = ['codicon', 'codicon-' + id];
        if (modifier) {
            classNames.push('codicon-modifier-' + modifier.substr(1));
        }
        return classNames;
    }
    CSSIcon.asClassNameArray = asClassNameArray;
    function asClassName(icon) {
        return asClassNameArray(icon).join(' ');
    }
    CSSIcon.asClassName = asClassName;
    function asCSSSelector(icon) {
        return '.' + asClassNameArray(icon).join('.');
    }
    CSSIcon.asCSSSelector = asCSSSelector;
})(CSSIcon || (CSSIcon = {}));
(function (Codicon) {
    // built-in icons, with image name
    Codicon.add = new Codicon('add', { fontCharacter: '\\ea60' });
    Codicon.plus = new Codicon('plus', { fontCharacter: '\\ea60' });
    Codicon.gistNew = new Codicon('gist-new', { fontCharacter: '\\ea60' });
    Codicon.repoCreate = new Codicon('repo-create', { fontCharacter: '\\ea60' });
    Codicon.lightbulb = new Codicon('lightbulb', { fontCharacter: '\\ea61' });
    Codicon.lightBulb = new Codicon('light-bulb', { fontCharacter: '\\ea61' });
    Codicon.repo = new Codicon('repo', { fontCharacter: '\\ea62' });
    Codicon.repoDelete = new Codicon('repo-delete', { fontCharacter: '\\ea62' });
    Codicon.gistFork = new Codicon('gist-fork', { fontCharacter: '\\ea63' });
    Codicon.repoForked = new Codicon('repo-forked', { fontCharacter: '\\ea63' });
    Codicon.gitPullRequest = new Codicon('git-pull-request', { fontCharacter: '\\ea64' });
    Codicon.gitPullRequestAbandoned = new Codicon('git-pull-request-abandoned', { fontCharacter: '\\ea64' });
    Codicon.recordKeys = new Codicon('record-keys', { fontCharacter: '\\ea65' });
    Codicon.keyboard = new Codicon('keyboard', { fontCharacter: '\\ea65' });
    Codicon.tag = new Codicon('tag', { fontCharacter: '\\ea66' });
    Codicon.tagAdd = new Codicon('tag-add', { fontCharacter: '\\ea66' });
    Codicon.tagRemove = new Codicon('tag-remove', { fontCharacter: '\\ea66' });
    Codicon.person = new Codicon('person', { fontCharacter: '\\ea67' });
    Codicon.personFollow = new Codicon('person-follow', { fontCharacter: '\\ea67' });
    Codicon.personOutline = new Codicon('person-outline', { fontCharacter: '\\ea67' });
    Codicon.personFilled = new Codicon('person-filled', { fontCharacter: '\\ea67' });
    Codicon.gitBranch = new Codicon('git-branch', { fontCharacter: '\\ea68' });
    Codicon.gitBranchCreate = new Codicon('git-branch-create', { fontCharacter: '\\ea68' });
    Codicon.gitBranchDelete = new Codicon('git-branch-delete', { fontCharacter: '\\ea68' });
    Codicon.sourceControl = new Codicon('source-control', { fontCharacter: '\\ea68' });
    Codicon.mirror = new Codicon('mirror', { fontCharacter: '\\ea69' });
    Codicon.mirrorPublic = new Codicon('mirror-public', { fontCharacter: '\\ea69' });
    Codicon.star = new Codicon('star', { fontCharacter: '\\ea6a' });
    Codicon.starAdd = new Codicon('star-add', { fontCharacter: '\\ea6a' });
    Codicon.starDelete = new Codicon('star-delete', { fontCharacter: '\\ea6a' });
    Codicon.starEmpty = new Codicon('star-empty', { fontCharacter: '\\ea6a' });
    Codicon.comment = new Codicon('comment', { fontCharacter: '\\ea6b' });
    Codicon.commentAdd = new Codicon('comment-add', { fontCharacter: '\\ea6b' });
    Codicon.alert = new Codicon('alert', { fontCharacter: '\\ea6c' });
    Codicon.warning = new Codicon('warning', { fontCharacter: '\\ea6c' });
    Codicon.search = new Codicon('search', { fontCharacter: '\\ea6d' });
    Codicon.searchSave = new Codicon('search-save', { fontCharacter: '\\ea6d' });
    Codicon.logOut = new Codicon('log-out', { fontCharacter: '\\ea6e' });
    Codicon.signOut = new Codicon('sign-out', { fontCharacter: '\\ea6e' });
    Codicon.logIn = new Codicon('log-in', { fontCharacter: '\\ea6f' });
    Codicon.signIn = new Codicon('sign-in', { fontCharacter: '\\ea6f' });
    Codicon.eye = new Codicon('eye', { fontCharacter: '\\ea70' });
    Codicon.eyeUnwatch = new Codicon('eye-unwatch', { fontCharacter: '\\ea70' });
    Codicon.eyeWatch = new Codicon('eye-watch', { fontCharacter: '\\ea70' });
    Codicon.circleFilled = new Codicon('circle-filled', { fontCharacter: '\\ea71' });
    Codicon.primitiveDot = new Codicon('primitive-dot', { fontCharacter: '\\ea71' });
    Codicon.closeDirty = new Codicon('close-dirty', { fontCharacter: '\\ea71' });
    Codicon.debugBreakpoint = new Codicon('debug-breakpoint', { fontCharacter: '\\ea71' });
    Codicon.debugBreakpointDisabled = new Codicon('debug-breakpoint-disabled', { fontCharacter: '\\ea71' });
    Codicon.debugHint = new Codicon('debug-hint', { fontCharacter: '\\ea71' });
    Codicon.primitiveSquare = new Codicon('primitive-square', { fontCharacter: '\\ea72' });
    Codicon.edit = new Codicon('edit', { fontCharacter: '\\ea73' });
    Codicon.pencil = new Codicon('pencil', { fontCharacter: '\\ea73' });
    Codicon.info = new Codicon('info', { fontCharacter: '\\ea74' });
    Codicon.issueOpened = new Codicon('issue-opened', { fontCharacter: '\\ea74' });
    Codicon.gistPrivate = new Codicon('gist-private', { fontCharacter: '\\ea75' });
    Codicon.gitForkPrivate = new Codicon('git-fork-private', { fontCharacter: '\\ea75' });
    Codicon.lock = new Codicon('lock', { fontCharacter: '\\ea75' });
    Codicon.mirrorPrivate = new Codicon('mirror-private', { fontCharacter: '\\ea75' });
    Codicon.close = new Codicon('close', { fontCharacter: '\\ea76' });
    Codicon.removeClose = new Codicon('remove-close', { fontCharacter: '\\ea76' });
    Codicon.x = new Codicon('x', { fontCharacter: '\\ea76' });
    Codicon.repoSync = new Codicon('repo-sync', { fontCharacter: '\\ea77' });
    Codicon.sync = new Codicon('sync', { fontCharacter: '\\ea77' });
    Codicon.clone = new Codicon('clone', { fontCharacter: '\\ea78' });
    Codicon.desktopDownload = new Codicon('desktop-download', { fontCharacter: '\\ea78' });
    Codicon.beaker = new Codicon('beaker', { fontCharacter: '\\ea79' });
    Codicon.microscope = new Codicon('microscope', { fontCharacter: '\\ea79' });
    Codicon.vm = new Codicon('vm', { fontCharacter: '\\ea7a' });
    Codicon.deviceDesktop = new Codicon('device-desktop', { fontCharacter: '\\ea7a' });
    Codicon.file = new Codicon('file', { fontCharacter: '\\ea7b' });
    Codicon.fileText = new Codicon('file-text', { fontCharacter: '\\ea7b' });
    Codicon.more = new Codicon('more', { fontCharacter: '\\ea7c' });
    Codicon.ellipsis = new Codicon('ellipsis', { fontCharacter: '\\ea7c' });
    Codicon.kebabHorizontal = new Codicon('kebab-horizontal', { fontCharacter: '\\ea7c' });
    Codicon.mailReply = new Codicon('mail-reply', { fontCharacter: '\\ea7d' });
    Codicon.reply = new Codicon('reply', { fontCharacter: '\\ea7d' });
    Codicon.organization = new Codicon('organization', { fontCharacter: '\\ea7e' });
    Codicon.organizationFilled = new Codicon('organization-filled', { fontCharacter: '\\ea7e' });
    Codicon.organizationOutline = new Codicon('organization-outline', { fontCharacter: '\\ea7e' });
    Codicon.newFile = new Codicon('new-file', { fontCharacter: '\\ea7f' });
    Codicon.fileAdd = new Codicon('file-add', { fontCharacter: '\\ea7f' });
    Codicon.newFolder = new Codicon('new-folder', { fontCharacter: '\\ea80' });
    Codicon.fileDirectoryCreate = new Codicon('file-directory-create', { fontCharacter: '\\ea80' });
    Codicon.trash = new Codicon('trash', { fontCharacter: '\\ea81' });
    Codicon.trashcan = new Codicon('trashcan', { fontCharacter: '\\ea81' });
    Codicon.history = new Codicon('history', { fontCharacter: '\\ea82' });
    Codicon.clock = new Codicon('clock', { fontCharacter: '\\ea82' });
    Codicon.folder = new Codicon('folder', { fontCharacter: '\\ea83' });
    Codicon.fileDirectory = new Codicon('file-directory', { fontCharacter: '\\ea83' });
    Codicon.symbolFolder = new Codicon('symbol-folder', { fontCharacter: '\\ea83' });
    Codicon.logoGithub = new Codicon('logo-github', { fontCharacter: '\\ea84' });
    Codicon.markGithub = new Codicon('mark-github', { fontCharacter: '\\ea84' });
    Codicon.github = new Codicon('github', { fontCharacter: '\\ea84' });
    Codicon.terminal = new Codicon('terminal', { fontCharacter: '\\ea85' });
    Codicon.console = new Codicon('console', { fontCharacter: '\\ea85' });
    Codicon.repl = new Codicon('repl', { fontCharacter: '\\ea85' });
    Codicon.zap = new Codicon('zap', { fontCharacter: '\\ea86' });
    Codicon.symbolEvent = new Codicon('symbol-event', { fontCharacter: '\\ea86' });
    Codicon.error = new Codicon('error', { fontCharacter: '\\ea87' });
    Codicon.stop = new Codicon('stop', { fontCharacter: '\\ea87' });
    Codicon.variable = new Codicon('variable', { fontCharacter: '\\ea88' });
    Codicon.symbolVariable = new Codicon('symbol-variable', { fontCharacter: '\\ea88' });
    Codicon.array = new Codicon('array', { fontCharacter: '\\ea8a' });
    Codicon.symbolArray = new Codicon('symbol-array', { fontCharacter: '\\ea8a' });
    Codicon.symbolModule = new Codicon('symbol-module', { fontCharacter: '\\ea8b' });
    Codicon.symbolPackage = new Codicon('symbol-package', { fontCharacter: '\\ea8b' });
    Codicon.symbolNamespace = new Codicon('symbol-namespace', { fontCharacter: '\\ea8b' });
    Codicon.symbolObject = new Codicon('symbol-object', { fontCharacter: '\\ea8b' });
    Codicon.symbolMethod = new Codicon('symbol-method', { fontCharacter: '\\ea8c' });
    Codicon.symbolFunction = new Codicon('symbol-function', { fontCharacter: '\\ea8c' });
    Codicon.symbolConstructor = new Codicon('symbol-constructor', { fontCharacter: '\\ea8c' });
    Codicon.symbolBoolean = new Codicon('symbol-boolean', { fontCharacter: '\\ea8f' });
    Codicon.symbolNull = new Codicon('symbol-null', { fontCharacter: '\\ea8f' });
    Codicon.symbolNumeric = new Codicon('symbol-numeric', { fontCharacter: '\\ea90' });
    Codicon.symbolNumber = new Codicon('symbol-number', { fontCharacter: '\\ea90' });
    Codicon.symbolStructure = new Codicon('symbol-structure', { fontCharacter: '\\ea91' });
    Codicon.symbolStruct = new Codicon('symbol-struct', { fontCharacter: '\\ea91' });
    Codicon.symbolParameter = new Codicon('symbol-parameter', { fontCharacter: '\\ea92' });
    Codicon.symbolTypeParameter = new Codicon('symbol-type-parameter', { fontCharacter: '\\ea92' });
    Codicon.symbolKey = new Codicon('symbol-key', { fontCharacter: '\\ea93' });
    Codicon.symbolText = new Codicon('symbol-text', { fontCharacter: '\\ea93' });
    Codicon.symbolReference = new Codicon('symbol-reference', { fontCharacter: '\\ea94' });
    Codicon.goToFile = new Codicon('go-to-file', { fontCharacter: '\\ea94' });
    Codicon.symbolEnum = new Codicon('symbol-enum', { fontCharacter: '\\ea95' });
    Codicon.symbolValue = new Codicon('symbol-value', { fontCharacter: '\\ea95' });
    Codicon.symbolRuler = new Codicon('symbol-ruler', { fontCharacter: '\\ea96' });
    Codicon.symbolUnit = new Codicon('symbol-unit', { fontCharacter: '\\ea96' });
    Codicon.activateBreakpoints = new Codicon('activate-breakpoints', { fontCharacter: '\\ea97' });
    Codicon.archive = new Codicon('archive', { fontCharacter: '\\ea98' });
    Codicon.arrowBoth = new Codicon('arrow-both', { fontCharacter: '\\ea99' });
    Codicon.arrowDown = new Codicon('arrow-down', { fontCharacter: '\\ea9a' });
    Codicon.arrowLeft = new Codicon('arrow-left', { fontCharacter: '\\ea9b' });
    Codicon.arrowRight = new Codicon('arrow-right', { fontCharacter: '\\ea9c' });
    Codicon.arrowSmallDown = new Codicon('arrow-small-down', { fontCharacter: '\\ea9d' });
    Codicon.arrowSmallLeft = new Codicon('arrow-small-left', { fontCharacter: '\\ea9e' });
    Codicon.arrowSmallRight = new Codicon('arrow-small-right', { fontCharacter: '\\ea9f' });
    Codicon.arrowSmallUp = new Codicon('arrow-small-up', { fontCharacter: '\\eaa0' });
    Codicon.arrowUp = new Codicon('arrow-up', { fontCharacter: '\\eaa1' });
    Codicon.bell = new Codicon('bell', { fontCharacter: '\\eaa2' });
    Codicon.bold = new Codicon('bold', { fontCharacter: '\\eaa3' });
    Codicon.book = new Codicon('book', { fontCharacter: '\\eaa4' });
    Codicon.bookmark = new Codicon('bookmark', { fontCharacter: '\\eaa5' });
    Codicon.debugBreakpointConditionalUnverified = new Codicon('debug-breakpoint-conditional-unverified', { fontCharacter: '\\eaa6' });
    Codicon.debugBreakpointConditional = new Codicon('debug-breakpoint-conditional', { fontCharacter: '\\eaa7' });
    Codicon.debugBreakpointConditionalDisabled = new Codicon('debug-breakpoint-conditional-disabled', { fontCharacter: '\\eaa7' });
    Codicon.debugBreakpointDataUnverified = new Codicon('debug-breakpoint-data-unverified', { fontCharacter: '\\eaa8' });
    Codicon.debugBreakpointData = new Codicon('debug-breakpoint-data', { fontCharacter: '\\eaa9' });
    Codicon.debugBreakpointDataDisabled = new Codicon('debug-breakpoint-data-disabled', { fontCharacter: '\\eaa9' });
    Codicon.debugBreakpointLogUnverified = new Codicon('debug-breakpoint-log-unverified', { fontCharacter: '\\eaaa' });
    Codicon.debugBreakpointLog = new Codicon('debug-breakpoint-log', { fontCharacter: '\\eaab' });
    Codicon.debugBreakpointLogDisabled = new Codicon('debug-breakpoint-log-disabled', { fontCharacter: '\\eaab' });
    Codicon.briefcase = new Codicon('briefcase', { fontCharacter: '\\eaac' });
    Codicon.broadcast = new Codicon('broadcast', { fontCharacter: '\\eaad' });
    Codicon.browser = new Codicon('browser', { fontCharacter: '\\eaae' });
    Codicon.bug = new Codicon('bug', { fontCharacter: '\\eaaf' });
    Codicon.calendar = new Codicon('calendar', { fontCharacter: '\\eab0' });
    Codicon.caseSensitive = new Codicon('case-sensitive', { fontCharacter: '\\eab1' });
    Codicon.check = new Codicon('check', { fontCharacter: '\\eab2' });
    Codicon.checklist = new Codicon('checklist', { fontCharacter: '\\eab3' });
    Codicon.chevronDown = new Codicon('chevron-down', { fontCharacter: '\\eab4' });
    Codicon.chevronLeft = new Codicon('chevron-left', { fontCharacter: '\\eab5' });
    Codicon.chevronRight = new Codicon('chevron-right', { fontCharacter: '\\eab6' });
    Codicon.chevronUp = new Codicon('chevron-up', { fontCharacter: '\\eab7' });
    Codicon.chromeClose = new Codicon('chrome-close', { fontCharacter: '\\eab8' });
    Codicon.chromeMaximize = new Codicon('chrome-maximize', { fontCharacter: '\\eab9' });
    Codicon.chromeMinimize = new Codicon('chrome-minimize', { fontCharacter: '\\eaba' });
    Codicon.chromeRestore = new Codicon('chrome-restore', { fontCharacter: '\\eabb' });
    Codicon.circleOutline = new Codicon('circle-outline', { fontCharacter: '\\eabc' });
    Codicon.debugBreakpointUnverified = new Codicon('debug-breakpoint-unverified', { fontCharacter: '\\eabc' });
    Codicon.circleSlash = new Codicon('circle-slash', { fontCharacter: '\\eabd' });
    Codicon.circuitBoard = new Codicon('circuit-board', { fontCharacter: '\\eabe' });
    Codicon.clearAll = new Codicon('clear-all', { fontCharacter: '\\eabf' });
    Codicon.clippy = new Codicon('clippy', { fontCharacter: '\\eac0' });
    Codicon.closeAll = new Codicon('close-all', { fontCharacter: '\\eac1' });
    Codicon.cloudDownload = new Codicon('cloud-download', { fontCharacter: '\\eac2' });
    Codicon.cloudUpload = new Codicon('cloud-upload', { fontCharacter: '\\eac3' });
    Codicon.code = new Codicon('code', { fontCharacter: '\\eac4' });
    Codicon.collapseAll = new Codicon('collapse-all', { fontCharacter: '\\eac5' });
    Codicon.colorMode = new Codicon('color-mode', { fontCharacter: '\\eac6' });
    Codicon.commentDiscussion = new Codicon('comment-discussion', { fontCharacter: '\\eac7' });
    Codicon.compareChanges = new Codicon('compare-changes', { fontCharacter: '\\eafd' });
    Codicon.creditCard = new Codicon('credit-card', { fontCharacter: '\\eac9' });
    Codicon.dash = new Codicon('dash', { fontCharacter: '\\eacc' });
    Codicon.dashboard = new Codicon('dashboard', { fontCharacter: '\\eacd' });
    Codicon.database = new Codicon('database', { fontCharacter: '\\eace' });
    Codicon.debugContinue = new Codicon('debug-continue', { fontCharacter: '\\eacf' });
    Codicon.debugDisconnect = new Codicon('debug-disconnect', { fontCharacter: '\\ead0' });
    Codicon.debugPause = new Codicon('debug-pause', { fontCharacter: '\\ead1' });
    Codicon.debugRestart = new Codicon('debug-restart', { fontCharacter: '\\ead2' });
    Codicon.debugStart = new Codicon('debug-start', { fontCharacter: '\\ead3' });
    Codicon.debugStepInto = new Codicon('debug-step-into', { fontCharacter: '\\ead4' });
    Codicon.debugStepOut = new Codicon('debug-step-out', { fontCharacter: '\\ead5' });
    Codicon.debugStepOver = new Codicon('debug-step-over', { fontCharacter: '\\ead6' });
    Codicon.debugStop = new Codicon('debug-stop', { fontCharacter: '\\ead7' });
    Codicon.debug = new Codicon('debug', { fontCharacter: '\\ead8' });
    Codicon.deviceCameraVideo = new Codicon('device-camera-video', { fontCharacter: '\\ead9' });
    Codicon.deviceCamera = new Codicon('device-camera', { fontCharacter: '\\eada' });
    Codicon.deviceMobile = new Codicon('device-mobile', { fontCharacter: '\\eadb' });
    Codicon.diffAdded = new Codicon('diff-added', { fontCharacter: '\\eadc' });
    Codicon.diffIgnored = new Codicon('diff-ignored', { fontCharacter: '\\eadd' });
    Codicon.diffModified = new Codicon('diff-modified', { fontCharacter: '\\eade' });
    Codicon.diffRemoved = new Codicon('diff-removed', { fontCharacter: '\\eadf' });
    Codicon.diffRenamed = new Codicon('diff-renamed', { fontCharacter: '\\eae0' });
    Codicon.diff = new Codicon('diff', { fontCharacter: '\\eae1' });
    Codicon.discard = new Codicon('discard', { fontCharacter: '\\eae2' });
    Codicon.editorLayout = new Codicon('editor-layout', { fontCharacter: '\\eae3' });
    Codicon.emptyWindow = new Codicon('empty-window', { fontCharacter: '\\eae4' });
    Codicon.exclude = new Codicon('exclude', { fontCharacter: '\\eae5' });
    Codicon.extensions = new Codicon('extensions', { fontCharacter: '\\eae6' });
    Codicon.eyeClosed = new Codicon('eye-closed', { fontCharacter: '\\eae7' });
    Codicon.fileBinary = new Codicon('file-binary', { fontCharacter: '\\eae8' });
    Codicon.fileCode = new Codicon('file-code', { fontCharacter: '\\eae9' });
    Codicon.fileMedia = new Codicon('file-media', { fontCharacter: '\\eaea' });
    Codicon.filePdf = new Codicon('file-pdf', { fontCharacter: '\\eaeb' });
    Codicon.fileSubmodule = new Codicon('file-submodule', { fontCharacter: '\\eaec' });
    Codicon.fileSymlinkDirectory = new Codicon('file-symlink-directory', { fontCharacter: '\\eaed' });
    Codicon.fileSymlinkFile = new Codicon('file-symlink-file', { fontCharacter: '\\eaee' });
    Codicon.fileZip = new Codicon('file-zip', { fontCharacter: '\\eaef' });
    Codicon.files = new Codicon('files', { fontCharacter: '\\eaf0' });
    Codicon.filter = new Codicon('filter', { fontCharacter: '\\eaf1' });
    Codicon.flame = new Codicon('flame', { fontCharacter: '\\eaf2' });
    Codicon.foldDown = new Codicon('fold-down', { fontCharacter: '\\eaf3' });
    Codicon.foldUp = new Codicon('fold-up', { fontCharacter: '\\eaf4' });
    Codicon.fold = new Codicon('fold', { fontCharacter: '\\eaf5' });
    Codicon.folderActive = new Codicon('folder-active', { fontCharacter: '\\eaf6' });
    Codicon.folderOpened = new Codicon('folder-opened', { fontCharacter: '\\eaf7' });
    Codicon.gear = new Codicon('gear', { fontCharacter: '\\eaf8' });
    Codicon.gift = new Codicon('gift', { fontCharacter: '\\eaf9' });
    Codicon.gistSecret = new Codicon('gist-secret', { fontCharacter: '\\eafa' });
    Codicon.gist = new Codicon('gist', { fontCharacter: '\\eafb' });
    Codicon.gitCommit = new Codicon('git-commit', { fontCharacter: '\\eafc' });
    Codicon.gitCompare = new Codicon('git-compare', { fontCharacter: '\\eafd' });
    Codicon.gitMerge = new Codicon('git-merge', { fontCharacter: '\\eafe' });
    Codicon.githubAction = new Codicon('github-action', { fontCharacter: '\\eaff' });
    Codicon.githubAlt = new Codicon('github-alt', { fontCharacter: '\\eb00' });
    Codicon.globe = new Codicon('globe', { fontCharacter: '\\eb01' });
    Codicon.grabber = new Codicon('grabber', { fontCharacter: '\\eb02' });
    Codicon.graph = new Codicon('graph', { fontCharacter: '\\eb03' });
    Codicon.gripper = new Codicon('gripper', { fontCharacter: '\\eb04' });
    Codicon.heart = new Codicon('heart', { fontCharacter: '\\eb05' });
    Codicon.home = new Codicon('home', { fontCharacter: '\\eb06' });
    Codicon.horizontalRule = new Codicon('horizontal-rule', { fontCharacter: '\\eb07' });
    Codicon.hubot = new Codicon('hubot', { fontCharacter: '\\eb08' });
    Codicon.inbox = new Codicon('inbox', { fontCharacter: '\\eb09' });
    Codicon.issueClosed = new Codicon('issue-closed', { fontCharacter: '\\eb0a' });
    Codicon.issueReopened = new Codicon('issue-reopened', { fontCharacter: '\\eb0b' });
    Codicon.issues = new Codicon('issues', { fontCharacter: '\\eb0c' });
    Codicon.italic = new Codicon('italic', { fontCharacter: '\\eb0d' });
    Codicon.jersey = new Codicon('jersey', { fontCharacter: '\\eb0e' });
    Codicon.json = new Codicon('json', { fontCharacter: '\\eb0f' });
    Codicon.kebabVertical = new Codicon('kebab-vertical', { fontCharacter: '\\eb10' });
    Codicon.key = new Codicon('key', { fontCharacter: '\\eb11' });
    Codicon.law = new Codicon('law', { fontCharacter: '\\eb12' });
    Codicon.lightbulbAutofix = new Codicon('lightbulb-autofix', { fontCharacter: '\\eb13' });
    Codicon.linkExternal = new Codicon('link-external', { fontCharacter: '\\eb14' });
    Codicon.link = new Codicon('link', { fontCharacter: '\\eb15' });
    Codicon.listOrdered = new Codicon('list-ordered', { fontCharacter: '\\eb16' });
    Codicon.listUnordered = new Codicon('list-unordered', { fontCharacter: '\\eb17' });
    Codicon.liveShare = new Codicon('live-share', { fontCharacter: '\\eb18' });
    Codicon.loading = new Codicon('loading', { fontCharacter: '\\eb19' });
    Codicon.location = new Codicon('location', { fontCharacter: '\\eb1a' });
    Codicon.mailRead = new Codicon('mail-read', { fontCharacter: '\\eb1b' });
    Codicon.mail = new Codicon('mail', { fontCharacter: '\\eb1c' });
    Codicon.markdown = new Codicon('markdown', { fontCharacter: '\\eb1d' });
    Codicon.megaphone = new Codicon('megaphone', { fontCharacter: '\\eb1e' });
    Codicon.mention = new Codicon('mention', { fontCharacter: '\\eb1f' });
    Codicon.milestone = new Codicon('milestone', { fontCharacter: '\\eb20' });
    Codicon.mortarBoard = new Codicon('mortar-board', { fontCharacter: '\\eb21' });
    Codicon.move = new Codicon('move', { fontCharacter: '\\eb22' });
    Codicon.multipleWindows = new Codicon('multiple-windows', { fontCharacter: '\\eb23' });
    Codicon.mute = new Codicon('mute', { fontCharacter: '\\eb24' });
    Codicon.noNewline = new Codicon('no-newline', { fontCharacter: '\\eb25' });
    Codicon.note = new Codicon('note', { fontCharacter: '\\eb26' });
    Codicon.octoface = new Codicon('octoface', { fontCharacter: '\\eb27' });
    Codicon.openPreview = new Codicon('open-preview', { fontCharacter: '\\eb28' });
    Codicon.package_ = new Codicon('package', { fontCharacter: '\\eb29' });
    Codicon.paintcan = new Codicon('paintcan', { fontCharacter: '\\eb2a' });
    Codicon.pin = new Codicon('pin', { fontCharacter: '\\eb2b' });
    Codicon.play = new Codicon('play', { fontCharacter: '\\eb2c' });
    Codicon.run = new Codicon('run', { fontCharacter: '\\eb2c' });
    Codicon.plug = new Codicon('plug', { fontCharacter: '\\eb2d' });
    Codicon.preserveCase = new Codicon('preserve-case', { fontCharacter: '\\eb2e' });
    Codicon.preview = new Codicon('preview', { fontCharacter: '\\eb2f' });
    Codicon.project = new Codicon('project', { fontCharacter: '\\eb30' });
    Codicon.pulse = new Codicon('pulse', { fontCharacter: '\\eb31' });
    Codicon.question = new Codicon('question', { fontCharacter: '\\eb32' });
    Codicon.quote = new Codicon('quote', { fontCharacter: '\\eb33' });
    Codicon.radioTower = new Codicon('radio-tower', { fontCharacter: '\\eb34' });
    Codicon.reactions = new Codicon('reactions', { fontCharacter: '\\eb35' });
    Codicon.references = new Codicon('references', { fontCharacter: '\\eb36' });
    Codicon.refresh = new Codicon('refresh', { fontCharacter: '\\eb37' });
    Codicon.regex = new Codicon('regex', { fontCharacter: '\\eb38' });
    Codicon.remoteExplorer = new Codicon('remote-explorer', { fontCharacter: '\\eb39' });
    Codicon.remote = new Codicon('remote', { fontCharacter: '\\eb3a' });
    Codicon.remove = new Codicon('remove', { fontCharacter: '\\eb3b' });
    Codicon.replaceAll = new Codicon('replace-all', { fontCharacter: '\\eb3c' });
    Codicon.replace = new Codicon('replace', { fontCharacter: '\\eb3d' });
    Codicon.repoClone = new Codicon('repo-clone', { fontCharacter: '\\eb3e' });
    Codicon.repoForcePush = new Codicon('repo-force-push', { fontCharacter: '\\eb3f' });
    Codicon.repoPull = new Codicon('repo-pull', { fontCharacter: '\\eb40' });
    Codicon.repoPush = new Codicon('repo-push', { fontCharacter: '\\eb41' });
    Codicon.report = new Codicon('report', { fontCharacter: '\\eb42' });
    Codicon.requestChanges = new Codicon('request-changes', { fontCharacter: '\\eb43' });
    Codicon.rocket = new Codicon('rocket', { fontCharacter: '\\eb44' });
    Codicon.rootFolderOpened = new Codicon('root-folder-opened', { fontCharacter: '\\eb45' });
    Codicon.rootFolder = new Codicon('root-folder', { fontCharacter: '\\eb46' });
    Codicon.rss = new Codicon('rss', { fontCharacter: '\\eb47' });
    Codicon.ruby = new Codicon('ruby', { fontCharacter: '\\eb48' });
    Codicon.saveAll = new Codicon('save-all', { fontCharacter: '\\eb49' });
    Codicon.saveAs = new Codicon('save-as', { fontCharacter: '\\eb4a' });
    Codicon.save = new Codicon('save', { fontCharacter: '\\eb4b' });
    Codicon.screenFull = new Codicon('screen-full', { fontCharacter: '\\eb4c' });
    Codicon.screenNormal = new Codicon('screen-normal', { fontCharacter: '\\eb4d' });
    Codicon.searchStop = new Codicon('search-stop', { fontCharacter: '\\eb4e' });
    Codicon.server = new Codicon('server', { fontCharacter: '\\eb50' });
    Codicon.settingsGear = new Codicon('settings-gear', { fontCharacter: '\\eb51' });
    Codicon.settings = new Codicon('settings', { fontCharacter: '\\eb52' });
    Codicon.shield = new Codicon('shield', { fontCharacter: '\\eb53' });
    Codicon.smiley = new Codicon('smiley', { fontCharacter: '\\eb54' });
    Codicon.sortPrecedence = new Codicon('sort-precedence', { fontCharacter: '\\eb55' });
    Codicon.splitHorizontal = new Codicon('split-horizontal', { fontCharacter: '\\eb56' });
    Codicon.splitVertical = new Codicon('split-vertical', { fontCharacter: '\\eb57' });
    Codicon.squirrel = new Codicon('squirrel', { fontCharacter: '\\eb58' });
    Codicon.starFull = new Codicon('star-full', { fontCharacter: '\\eb59' });
    Codicon.starHalf = new Codicon('star-half', { fontCharacter: '\\eb5a' });
    Codicon.symbolClass = new Codicon('symbol-class', { fontCharacter: '\\eb5b' });
    Codicon.symbolColor = new Codicon('symbol-color', { fontCharacter: '\\eb5c' });
    Codicon.symbolConstant = new Codicon('symbol-constant', { fontCharacter: '\\eb5d' });
    Codicon.symbolEnumMember = new Codicon('symbol-enum-member', { fontCharacter: '\\eb5e' });
    Codicon.symbolField = new Codicon('symbol-field', { fontCharacter: '\\eb5f' });
    Codicon.symbolFile = new Codicon('symbol-file', { fontCharacter: '\\eb60' });
    Codicon.symbolInterface = new Codicon('symbol-interface', { fontCharacter: '\\eb61' });
    Codicon.symbolKeyword = new Codicon('symbol-keyword', { fontCharacter: '\\eb62' });
    Codicon.symbolMisc = new Codicon('symbol-misc', { fontCharacter: '\\eb63' });
    Codicon.symbolOperator = new Codicon('symbol-operator', { fontCharacter: '\\eb64' });
    Codicon.symbolProperty = new Codicon('symbol-property', { fontCharacter: '\\eb65' });
    Codicon.wrench = new Codicon('wrench', { fontCharacter: '\\eb65' });
    Codicon.wrenchSubaction = new Codicon('wrench-subaction', { fontCharacter: '\\eb65' });
    Codicon.symbolSnippet = new Codicon('symbol-snippet', { fontCharacter: '\\eb66' });
    Codicon.tasklist = new Codicon('tasklist', { fontCharacter: '\\eb67' });
    Codicon.telescope = new Codicon('telescope', { fontCharacter: '\\eb68' });
    Codicon.textSize = new Codicon('text-size', { fontCharacter: '\\eb69' });
    Codicon.threeBars = new Codicon('three-bars', { fontCharacter: '\\eb6a' });
    Codicon.thumbsdown = new Codicon('thumbsdown', { fontCharacter: '\\eb6b' });
    Codicon.thumbsup = new Codicon('thumbsup', { fontCharacter: '\\eb6c' });
    Codicon.tools = new Codicon('tools', { fontCharacter: '\\eb6d' });
    Codicon.triangleDown = new Codicon('triangle-down', { fontCharacter: '\\eb6e' });
    Codicon.triangleLeft = new Codicon('triangle-left', { fontCharacter: '\\eb6f' });
    Codicon.triangleRight = new Codicon('triangle-right', { fontCharacter: '\\eb70' });
    Codicon.triangleUp = new Codicon('triangle-up', { fontCharacter: '\\eb71' });
    Codicon.twitter = new Codicon('twitter', { fontCharacter: '\\eb72' });
    Codicon.unfold = new Codicon('unfold', { fontCharacter: '\\eb73' });
    Codicon.unlock = new Codicon('unlock', { fontCharacter: '\\eb74' });
    Codicon.unmute = new Codicon('unmute', { fontCharacter: '\\eb75' });
    Codicon.unverified = new Codicon('unverified', { fontCharacter: '\\eb76' });
    Codicon.verified = new Codicon('verified', { fontCharacter: '\\eb77' });
    Codicon.versions = new Codicon('versions', { fontCharacter: '\\eb78' });
    Codicon.vmActive = new Codicon('vm-active', { fontCharacter: '\\eb79' });
    Codicon.vmOutline = new Codicon('vm-outline', { fontCharacter: '\\eb7a' });
    Codicon.vmRunning = new Codicon('vm-running', { fontCharacter: '\\eb7b' });
    Codicon.watch = new Codicon('watch', { fontCharacter: '\\eb7c' });
    Codicon.whitespace = new Codicon('whitespace', { fontCharacter: '\\eb7d' });
    Codicon.wholeWord = new Codicon('whole-word', { fontCharacter: '\\eb7e' });
    Codicon.window = new Codicon('window', { fontCharacter: '\\eb7f' });
    Codicon.wordWrap = new Codicon('word-wrap', { fontCharacter: '\\eb80' });
    Codicon.zoomIn = new Codicon('zoom-in', { fontCharacter: '\\eb81' });
    Codicon.zoomOut = new Codicon('zoom-out', { fontCharacter: '\\eb82' });
    Codicon.listFilter = new Codicon('list-filter', { fontCharacter: '\\eb83' });
    Codicon.listFlat = new Codicon('list-flat', { fontCharacter: '\\eb84' });
    Codicon.listSelection = new Codicon('list-selection', { fontCharacter: '\\eb85' });
    Codicon.selection = new Codicon('selection', { fontCharacter: '\\eb85' });
    Codicon.listTree = new Codicon('list-tree', { fontCharacter: '\\eb86' });
    Codicon.debugBreakpointFunctionUnverified = new Codicon('debug-breakpoint-function-unverified', { fontCharacter: '\\eb87' });
    Codicon.debugBreakpointFunction = new Codicon('debug-breakpoint-function', { fontCharacter: '\\eb88' });
    Codicon.debugBreakpointFunctionDisabled = new Codicon('debug-breakpoint-function-disabled', { fontCharacter: '\\eb88' });
    Codicon.debugStackframeActive = new Codicon('debug-stackframe-active', { fontCharacter: '\\eb89' });
    Codicon.debugStackframeDot = new Codicon('debug-stackframe-dot', { fontCharacter: '\\eb8a' });
    Codicon.debugStackframe = new Codicon('debug-stackframe', { fontCharacter: '\\eb8b' });
    Codicon.debugStackframeFocused = new Codicon('debug-stackframe-focused', { fontCharacter: '\\eb8b' });
    Codicon.debugBreakpointUnsupported = new Codicon('debug-breakpoint-unsupported', { fontCharacter: '\\eb8c' });
    Codicon.symbolString = new Codicon('symbol-string', { fontCharacter: '\\eb8d' });
    Codicon.debugReverseContinue = new Codicon('debug-reverse-continue', { fontCharacter: '\\eb8e' });
    Codicon.debugStepBack = new Codicon('debug-step-back', { fontCharacter: '\\eb8f' });
    Codicon.debugRestartFrame = new Codicon('debug-restart-frame', { fontCharacter: '\\eb90' });
    Codicon.callIncoming = new Codicon('call-incoming', { fontCharacter: '\\eb92' });
    Codicon.callOutgoing = new Codicon('call-outgoing', { fontCharacter: '\\eb93' });
    Codicon.menu = new Codicon('menu', { fontCharacter: '\\eb94' });
    Codicon.expandAll = new Codicon('expand-all', { fontCharacter: '\\eb95' });
    Codicon.feedback = new Codicon('feedback', { fontCharacter: '\\eb96' });
    Codicon.groupByRefType = new Codicon('group-by-ref-type', { fontCharacter: '\\eb97' });
    Codicon.ungroupByRefType = new Codicon('ungroup-by-ref-type', { fontCharacter: '\\eb98' });
    Codicon.account = new Codicon('account', { fontCharacter: '\\eb99' });
    Codicon.bellDot = new Codicon('bell-dot', { fontCharacter: '\\eb9a' });
    Codicon.debugConsole = new Codicon('debug-console', { fontCharacter: '\\eb9b' });
    Codicon.library = new Codicon('library', { fontCharacter: '\\eb9c' });
    Codicon.output = new Codicon('output', { fontCharacter: '\\eb9d' });
    Codicon.runAll = new Codicon('run-all', { fontCharacter: '\\eb9e' });
    Codicon.syncIgnored = new Codicon('sync-ignored', { fontCharacter: '\\eb9f' });
    Codicon.pinned = new Codicon('pinned', { fontCharacter: '\\eba0' });
    Codicon.githubInverted = new Codicon('github-inverted', { fontCharacter: '\\eba1' });
    Codicon.debugAlt = new Codicon('debug-alt', { fontCharacter: '\\eb91' });
    Codicon.serverProcess = new Codicon('server-process', { fontCharacter: '\\eba2' });
    Codicon.serverEnvironment = new Codicon('server-environment', { fontCharacter: '\\eba3' });
    Codicon.pass = new Codicon('pass', { fontCharacter: '\\eba4' });
    Codicon.stopCircle = new Codicon('stop-circle', { fontCharacter: '\\eba5' });
    Codicon.playCircle = new Codicon('play-circle', { fontCharacter: '\\eba6' });
    Codicon.record = new Codicon('record', { fontCharacter: '\\eba7' });
    Codicon.debugAltSmall = new Codicon('debug-alt-small', { fontCharacter: '\\eba8' });
    Codicon.vmConnect = new Codicon('vm-connect', { fontCharacter: '\\eba9' });
    Codicon.cloud = new Codicon('cloud', { fontCharacter: '\\ebaa' });
    Codicon.merge = new Codicon('merge', { fontCharacter: '\\ebab' });
    Codicon.exportIcon = new Codicon('export', { fontCharacter: '\\ebac' });
    Codicon.graphLeft = new Codicon('graph-left', { fontCharacter: '\\ebad' });
    Codicon.magnet = new Codicon('magnet', { fontCharacter: '\\ebae' });
    Codicon.notebook = new Codicon('notebook', { fontCharacter: '\\ebaf' });
    Codicon.redo = new Codicon('redo', { fontCharacter: '\\ebb0' });
    Codicon.checkAll = new Codicon('check-all', { fontCharacter: '\\ebb1' });
    Codicon.pinnedDirty = new Codicon('pinned-dirty', { fontCharacter: '\\ebb2' });
    Codicon.passFilled = new Codicon('pass-filled', { fontCharacter: '\\ebb3' });
    Codicon.circleLargeFilled = new Codicon('circle-large-filled', { fontCharacter: '\\ebb4' });
    Codicon.circleLargeOutline = new Codicon('circle-large-outline', { fontCharacter: '\\ebb5' });
    Codicon.combine = new Codicon('combine', { fontCharacter: '\\ebb6' });
    Codicon.gather = new Codicon('gather', { fontCharacter: '\\ebb6' });
    Codicon.table = new Codicon('table', { fontCharacter: '\\ebb7' });
    Codicon.variableGroup = new Codicon('variable-group', { fontCharacter: '\\ebb8' });
    Codicon.typeHierarchy = new Codicon('type-hierarchy', { fontCharacter: '\\ebb9' });
    Codicon.typeHierarchySub = new Codicon('type-hierarchy-sub', { fontCharacter: '\\ebba' });
    Codicon.typeHierarchySuper = new Codicon('type-hierarchy-super', { fontCharacter: '\\ebbb' });
    Codicon.gitPullRequestCreate = new Codicon('git-pull-request-create', { fontCharacter: '\\ebbc' });
    Codicon.runAbove = new Codicon('run-above', { fontCharacter: '\\ebbd' });
    Codicon.runBelow = new Codicon('run-below', { fontCharacter: '\\ebbe' });
    Codicon.notebookTemplate = new Codicon('notebook-template', { fontCharacter: '\\ebbf' });
    Codicon.debugRerun = new Codicon('debug-rerun', { fontCharacter: '\\ebc0' });
    Codicon.workspaceTrusted = new Codicon('workspace-trusted', { fontCharacter: '\\ebc1' });
    Codicon.workspaceUntrusted = new Codicon('workspace-untrusted', { fontCharacter: '\\ebc2' });
    Codicon.workspaceUnspecified = new Codicon('workspace-unspecified', { fontCharacter: '\\ebc3' });
    Codicon.terminalCmd = new Codicon('terminal-cmd', { fontCharacter: '\\ebc4' });
    Codicon.terminalDebian = new Codicon('terminal-debian', { fontCharacter: '\\ebc5' });
    Codicon.terminalLinux = new Codicon('terminal-linux', { fontCharacter: '\\ebc6' });
    Codicon.terminalPowershell = new Codicon('terminal-powershell', { fontCharacter: '\\ebc7' });
    Codicon.terminalTmux = new Codicon('terminal-tmux', { fontCharacter: '\\ebc8' });
    Codicon.terminalUbuntu = new Codicon('terminal-ubuntu', { fontCharacter: '\\ebc9' });
    Codicon.terminalBash = new Codicon('terminal-bash', { fontCharacter: '\\ebca' });
    Codicon.arrowSwap = new Codicon('arrow-swap', { fontCharacter: '\\ebcb' });
    Codicon.copy = new Codicon('copy', { fontCharacter: '\\ebcc' });
    Codicon.personAdd = new Codicon('person-add', { fontCharacter: '\\ebcd' });
    Codicon.filterFilled = new Codicon('filter-filled', { fontCharacter: '\\ebce' });
    Codicon.wand = new Codicon('wand', { fontCharacter: '\\ebcf' });
    Codicon.debugLineByLine = new Codicon('debug-line-by-line', { fontCharacter: '\\ebd0' });
    Codicon.inspect = new Codicon('inspect', { fontCharacter: '\\ebd1' });
    Codicon.dropDownButton = new Codicon('drop-down-button', Codicon.chevronDown.definition);
})(Codicon || (Codicon = {}));

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * @internal
 */
class LanguageIdentifier {
    constructor(language, id) {
        this.language = language;
        this.id = id;
    }
}
/**
 * @internal
 */
class TokenMetadata {
    static getLanguageId(metadata) {
        return (metadata & 255 /* LANGUAGEID_MASK */) >>> 0 /* LANGUAGEID_OFFSET */;
    }
    static getTokenType(metadata) {
        return (metadata & 1792 /* TOKEN_TYPE_MASK */) >>> 8 /* TOKEN_TYPE_OFFSET */;
    }
    static getFontStyle(metadata) {
        return (metadata & 14336 /* FONT_STYLE_MASK */) >>> 11 /* FONT_STYLE_OFFSET */;
    }
    static getForeground(metadata) {
        return (metadata & 8372224 /* FOREGROUND_MASK */) >>> 14 /* FOREGROUND_OFFSET */;
    }
    static getBackground(metadata) {
        return (metadata & 4286578688 /* BACKGROUND_MASK */) >>> 23 /* BACKGROUND_OFFSET */;
    }
    static getClassNameFromMetadata(metadata) {
        let foreground = this.getForeground(metadata);
        let className = 'mtk' + foreground;
        let fontStyle = this.getFontStyle(metadata);
        if (fontStyle & 1 /* Italic */) {
            className += ' mtki';
        }
        if (fontStyle & 2 /* Bold */) {
            className += ' mtkb';
        }
        if (fontStyle & 4 /* Underline */) {
            className += ' mtku';
        }
        return className;
    }
    static getInlineStyleFromMetadata(metadata, colorMap) {
        const foreground = this.getForeground(metadata);
        const fontStyle = this.getFontStyle(metadata);
        let result = `color: ${colorMap[foreground]};`;
        if (fontStyle & 1 /* Italic */) {
            result += 'font-style: italic;';
        }
        if (fontStyle & 2 /* Bold */) {
            result += 'font-weight: bold;';
        }
        if (fontStyle & 4 /* Underline */) {
            result += 'text-decoration: underline;';
        }
        return result;
    }
}
/**
 * @internal
 */
const completionKindToCssClass = (function () {
    let data = Object.create(null);
    data[0 /* Method */] = 'symbol-method';
    data[1 /* Function */] = 'symbol-function';
    data[2 /* Constructor */] = 'symbol-constructor';
    data[3 /* Field */] = 'symbol-field';
    data[4 /* Variable */] = 'symbol-variable';
    data[5 /* Class */] = 'symbol-class';
    data[6 /* Struct */] = 'symbol-struct';
    data[7 /* Interface */] = 'symbol-interface';
    data[8 /* Module */] = 'symbol-module';
    data[9 /* Property */] = 'symbol-property';
    data[10 /* Event */] = 'symbol-event';
    data[11 /* Operator */] = 'symbol-operator';
    data[12 /* Unit */] = 'symbol-unit';
    data[13 /* Value */] = 'symbol-value';
    data[14 /* Constant */] = 'symbol-constant';
    data[15 /* Enum */] = 'symbol-enum';
    data[16 /* EnumMember */] = 'symbol-enum-member';
    data[17 /* Keyword */] = 'symbol-keyword';
    data[27 /* Snippet */] = 'symbol-snippet';
    data[18 /* Text */] = 'symbol-text';
    data[19 /* Color */] = 'symbol-color';
    data[20 /* File */] = 'symbol-file';
    data[21 /* Reference */] = 'symbol-reference';
    data[22 /* Customcolor */] = 'symbol-customcolor';
    data[23 /* Folder */] = 'symbol-folder';
    data[24 /* TypeParameter */] = 'symbol-type-parameter';
    data[25 /* User */] = 'account';
    data[26 /* Issue */] = 'issues';
    return function (kind) {
        const name = data[kind];
        let codicon = name && iconRegistry.get(name);
        if (!codicon) {
            console.info('No codicon found for CompletionItemKind ' + kind);
            codicon = Codicon.symbolProperty;
        }
        return codicon.classNames;
    };
})();
/**
 * @internal
 */
let completionKindFromString = (function () {
    let data = Object.create(null);
    data['method'] = 0 /* Method */;
    data['function'] = 1 /* Function */;
    data['constructor'] = 2 /* Constructor */;
    data['field'] = 3 /* Field */;
    data['variable'] = 4 /* Variable */;
    data['class'] = 5 /* Class */;
    data['struct'] = 6 /* Struct */;
    data['interface'] = 7 /* Interface */;
    data['module'] = 8 /* Module */;
    data['property'] = 9 /* Property */;
    data['event'] = 10 /* Event */;
    data['operator'] = 11 /* Operator */;
    data['unit'] = 12 /* Unit */;
    data['value'] = 13 /* Value */;
    data['constant'] = 14 /* Constant */;
    data['enum'] = 15 /* Enum */;
    data['enum-member'] = 16 /* EnumMember */;
    data['enumMember'] = 16 /* EnumMember */;
    data['keyword'] = 17 /* Keyword */;
    data['snippet'] = 27 /* Snippet */;
    data['text'] = 18 /* Text */;
    data['color'] = 19 /* Color */;
    data['file'] = 20 /* File */;
    data['reference'] = 21 /* Reference */;
    data['customcolor'] = 22 /* Customcolor */;
    data['folder'] = 23 /* Folder */;
    data['type-parameter'] = 24 /* TypeParameter */;
    data['typeParameter'] = 24 /* TypeParameter */;
    data['account'] = 25 /* User */;
    data['issue'] = 26 /* Issue */;
    return function (value, strict) {
        let res = data[value];
        if (typeof res === 'undefined' && !strict) {
            res = 9 /* Property */;
        }
        return res;
    };
})();
/**
 * How an {@link InlineCompletionsProvider inline completion provider} was triggered.
 */
var InlineCompletionTriggerKind;
(function (InlineCompletionTriggerKind) {
    /**
     * Completion was triggered automatically while editing.
     * It is sufficient to return a single completion item in this case.
     */
    InlineCompletionTriggerKind[InlineCompletionTriggerKind["Automatic"] = 0] = "Automatic";
    /**
     * Completion was triggered explicitly by a user gesture.
     * Return multiple completion items to enable cycling through them.
     */
    InlineCompletionTriggerKind[InlineCompletionTriggerKind["Explicit"] = 1] = "Explicit";
})(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
var SignatureHelpTriggerKind;
(function (SignatureHelpTriggerKind) {
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
})(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
/**
 * A document highlight kind.
 */
var DocumentHighlightKind;
(function (DocumentHighlightKind) {
    /**
     * A textual occurrence.
     */
    DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
    /**
     * Read-access of a symbol, like reading a variable.
     */
    DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
    /**
     * Write-access of a symbol, like writing to a variable.
     */
    DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
/**
 * @internal
 */
function isLocationLink(thing) {
    return thing
        && URI.isUri(thing.uri)
        && Range.isIRange(thing.range)
        && (Range.isIRange(thing.originSelectionRange) || Range.isIRange(thing.targetSelectionRange));
}
/**
 * @internal
 */
var SymbolKinds;
(function (SymbolKinds) {
    const byName = new Map();
    byName.set('file', 0 /* File */);
    byName.set('module', 1 /* Module */);
    byName.set('namespace', 2 /* Namespace */);
    byName.set('package', 3 /* Package */);
    byName.set('class', 4 /* Class */);
    byName.set('method', 5 /* Method */);
    byName.set('property', 6 /* Property */);
    byName.set('field', 7 /* Field */);
    byName.set('constructor', 8 /* Constructor */);
    byName.set('enum', 9 /* Enum */);
    byName.set('interface', 10 /* Interface */);
    byName.set('function', 11 /* Function */);
    byName.set('variable', 12 /* Variable */);
    byName.set('constant', 13 /* Constant */);
    byName.set('string', 14 /* String */);
    byName.set('number', 15 /* Number */);
    byName.set('boolean', 16 /* Boolean */);
    byName.set('array', 17 /* Array */);
    byName.set('object', 18 /* Object */);
    byName.set('key', 19 /* Key */);
    byName.set('null', 20 /* Null */);
    byName.set('enum-member', 21 /* EnumMember */);
    byName.set('struct', 22 /* Struct */);
    byName.set('event', 23 /* Event */);
    byName.set('operator', 24 /* Operator */);
    byName.set('type-parameter', 25 /* TypeParameter */);
    const byKind = new Map();
    byKind.set(0 /* File */, 'file');
    byKind.set(1 /* Module */, 'module');
    byKind.set(2 /* Namespace */, 'namespace');
    byKind.set(3 /* Package */, 'package');
    byKind.set(4 /* Class */, 'class');
    byKind.set(5 /* Method */, 'method');
    byKind.set(6 /* Property */, 'property');
    byKind.set(7 /* Field */, 'field');
    byKind.set(8 /* Constructor */, 'constructor');
    byKind.set(9 /* Enum */, 'enum');
    byKind.set(10 /* Interface */, 'interface');
    byKind.set(11 /* Function */, 'function');
    byKind.set(12 /* Variable */, 'variable');
    byKind.set(13 /* Constant */, 'constant');
    byKind.set(14 /* String */, 'string');
    byKind.set(15 /* Number */, 'number');
    byKind.set(16 /* Boolean */, 'boolean');
    byKind.set(17 /* Array */, 'array');
    byKind.set(18 /* Object */, 'object');
    byKind.set(19 /* Key */, 'key');
    byKind.set(20 /* Null */, 'null');
    byKind.set(21 /* EnumMember */, 'enum-member');
    byKind.set(22 /* Struct */, 'struct');
    byKind.set(23 /* Event */, 'event');
    byKind.set(24 /* Operator */, 'operator');
    byKind.set(25 /* TypeParameter */, 'type-parameter');
    /**
     * @internal
     */
    function fromString(value) {
        return byName.get(value);
    }
    SymbolKinds.fromString = fromString;
    /**
     * @internal
     */
    function toString(kind) {
        return byKind.get(kind);
    }
    SymbolKinds.toString = toString;
    /**
     * @internal
     */
    function toCssClassName(kind, inline) {
        const symbolName = byKind.get(kind);
        let codicon = symbolName && iconRegistry.get('symbol-' + symbolName);
        if (!codicon) {
            console.info('No codicon found for SymbolKind ' + kind);
            codicon = Codicon.symbolProperty;
        }
        return `${inline ? 'inline' : 'block'} ${codicon.classNames}`;
    }
    SymbolKinds.toCssClassName = toCssClassName;
})(SymbolKinds || (SymbolKinds = {}));
class FoldingRangeKind {
    /**
     * Creates a new {@link FoldingRangeKind}.
     *
     * @param value of the kind.
     */
    constructor(value) {
        this.value = value;
    }
}
/**
 * Kind for folding range representing a comment. The value of the kind is 'comment'.
 */
FoldingRangeKind.Comment = new FoldingRangeKind('comment');
/**
 * Kind for folding range representing a import. The value of the kind is 'imports'.
 */
FoldingRangeKind.Imports = new FoldingRangeKind('imports');
/**
 * Kind for folding range representing regions (for example marked by `#region`, `#endregion`).
 * The value of the kind is 'region'.
 */
FoldingRangeKind.Region = new FoldingRangeKind('region');
var InlayHintKind;
(function (InlayHintKind) {
    InlayHintKind[InlayHintKind["Other"] = 0] = "Other";
    InlayHintKind[InlayHintKind["Type"] = 1] = "Type";
    InlayHintKind[InlayHintKind["Parameter"] = 2] = "Parameter";
})(InlayHintKind || (InlayHintKind = {}));
// --- feature registries ------
/**
 * @internal
 */
const ReferenceProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const RenameProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const CompletionProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const InlineCompletionsProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const SignatureHelpProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const HoverProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const DocumentSymbolProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const DocumentHighlightProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const LinkedEditingRangeProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const DefinitionProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const DeclarationProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const ImplementationProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const TypeDefinitionProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const CodeLensProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const InlayHintsProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const CodeActionProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const DocumentFormattingEditProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const DocumentRangeFormattingEditProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const OnTypeFormattingEditProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const LinkProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const ColorProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const SelectionRangeRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const FoldingRangeProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const DocumentSemanticTokensProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const DocumentRangeSemanticTokensProviderRegistry = new LanguageFeatureRegistry();
/**
 * @internal
 */
const TokenizationRegistry = new TokenizationRegistryImpl();

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class NullStateImpl {
    clone() {
        return this;
    }
    equals(other) {
        return (this === other);
    }
}
const NULL_STATE = new NullStateImpl();
const NULL_MODE_ID = 'vs.editor.nullMode';
const NULL_LANGUAGE_IDENTIFIER = new LanguageIdentifier(NULL_MODE_ID, 0 /* Null */);
function nullTokenize(modeId, buffer, state, deltaOffset) {
    return new TokenizationResult([new Token(deltaOffset, '', modeId)], state);
}
function nullTokenize2(languageId, buffer, state, deltaOffset) {
    let tokens = new Uint32Array(2);
    tokens[0] = deltaOffset;
    tokens[1] = ((languageId << 0 /* LANGUAGEID_OFFSET */)
        | (0 /* Other */ << 8 /* TOKEN_TYPE_OFFSET */)
        | (0 /* None */ << 11 /* FONT_STYLE_OFFSET */)
        | (1 /* DefaultForeground */ << 14 /* FOREGROUND_OFFSET */)
        | (2 /* DefaultBackground */ << 23 /* BACKGROUND_OFFSET */)) >>> 0;
    return new TokenizationResult2(tokens, state === null ? NULL_STATE : state);
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * Describes what to do with the indentation when pressing Enter.
 */
var IndentAction;
(function (IndentAction) {
    /**
     * Insert new line and copy the previous line's indentation.
     */
    IndentAction[IndentAction["None"] = 0] = "None";
    /**
     * Insert new line and indent once (relative to the previous line's indentation).
     */
    IndentAction[IndentAction["Indent"] = 1] = "Indent";
    /**
     * Insert two new lines:
     *  - the first one indented which will hold the cursor
     *  - the second one at the same indentation level
     */
    IndentAction[IndentAction["IndentOutdent"] = 2] = "IndentOutdent";
    /**
     * Insert new line and outdent once (relative to the previous line's indentation).
     */
    IndentAction[IndentAction["Outdent"] = 3] = "Outdent";
})(IndentAction || (IndentAction = {}));
/**
 * @internal
 */
class StandardAutoClosingPairConditional {
    constructor(source) {
        this.open = source.open;
        this.close = source.close;
        // initially allowed in all tokens
        this._standardTokenMask = 0;
        if (Array.isArray(source.notIn)) {
            for (let i = 0, len = source.notIn.length; i < len; i++) {
                const notIn = source.notIn[i];
                switch (notIn) {
                    case 'string':
                        this._standardTokenMask |= 2 /* String */;
                        break;
                    case 'comment':
                        this._standardTokenMask |= 1 /* Comment */;
                        break;
                    case 'regex':
                        this._standardTokenMask |= 4 /* RegEx */;
                        break;
                }
            }
        }
    }
    isOK(standardToken) {
        return (this._standardTokenMask & standardToken) === 0;
    }
}
/**
 * @internal
 */
class AutoClosingPairs {
    constructor(autoClosingPairs) {
        this.autoClosingPairsOpenByStart = new Map();
        this.autoClosingPairsOpenByEnd = new Map();
        this.autoClosingPairsCloseByStart = new Map();
        this.autoClosingPairsCloseByEnd = new Map();
        this.autoClosingPairsCloseSingleChar = new Map();
        for (const pair of autoClosingPairs) {
            appendEntry(this.autoClosingPairsOpenByStart, pair.open.charAt(0), pair);
            appendEntry(this.autoClosingPairsOpenByEnd, pair.open.charAt(pair.open.length - 1), pair);
            appendEntry(this.autoClosingPairsCloseByStart, pair.close.charAt(0), pair);
            appendEntry(this.autoClosingPairsCloseByEnd, pair.close.charAt(pair.close.length - 1), pair);
            if (pair.close.length === 1 && pair.open.length === 1) {
                appendEntry(this.autoClosingPairsCloseSingleChar, pair.close, pair);
            }
        }
    }
}
function appendEntry(target, key, value) {
    if (target.has(key)) {
        target.get(key).push(value);
    }
    else {
        target.set(key, [value]);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function createScopedLineTokens(context, offset) {
    let tokenCount = context.getCount();
    let tokenIndex = context.findTokenIndexAtOffset(offset);
    let desiredLanguageId = context.getLanguageId(tokenIndex);
    let lastTokenIndex = tokenIndex;
    while (lastTokenIndex + 1 < tokenCount && context.getLanguageId(lastTokenIndex + 1) === desiredLanguageId) {
        lastTokenIndex++;
    }
    let firstTokenIndex = tokenIndex;
    while (firstTokenIndex > 0 && context.getLanguageId(firstTokenIndex - 1) === desiredLanguageId) {
        firstTokenIndex--;
    }
    return new ScopedLineTokens(context, desiredLanguageId, firstTokenIndex, lastTokenIndex + 1, context.getStartOffset(firstTokenIndex), context.getEndOffset(lastTokenIndex));
}
class ScopedLineTokens {
    constructor(actual, languageId, firstTokenIndex, lastTokenIndex, firstCharOffset, lastCharOffset) {
        this._actual = actual;
        this.languageId = languageId;
        this._firstTokenIndex = firstTokenIndex;
        this._lastTokenIndex = lastTokenIndex;
        this.firstCharOffset = firstCharOffset;
        this._lastCharOffset = lastCharOffset;
    }
    getLineContent() {
        const actualLineContent = this._actual.getLineContent();
        return actualLineContent.substring(this.firstCharOffset, this._lastCharOffset);
    }
    getActualLineContentBefore(offset) {
        const actualLineContent = this._actual.getLineContent();
        return actualLineContent.substring(0, this.firstCharOffset + offset);
    }
    getTokenCount() {
        return this._lastTokenIndex - this._firstTokenIndex;
    }
    findTokenIndexAtOffset(offset) {
        return this._actual.findTokenIndexAtOffset(offset + this.firstCharOffset) - this._firstTokenIndex;
    }
    getStandardTokenType(tokenIndex) {
        return this._actual.getStandardTokenType(tokenIndex + this._firstTokenIndex);
    }
}
function ignoreBracketsInToken(standardTokenType) {
    return (standardTokenType & 7 /* value */) !== 0;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class CharacterPairSupport {
    constructor(config) {
        if (config.autoClosingPairs) {
            this._autoClosingPairs = config.autoClosingPairs.map(el => new StandardAutoClosingPairConditional(el));
        }
        else if (config.brackets) {
            this._autoClosingPairs = config.brackets.map(b => new StandardAutoClosingPairConditional({ open: b[0], close: b[1] }));
        }
        else {
            this._autoClosingPairs = [];
        }
        if (config.__electricCharacterSupport && config.__electricCharacterSupport.docComment) {
            const docComment = config.__electricCharacterSupport.docComment;
            // IDocComment is legacy, only partially supported
            this._autoClosingPairs.push(new StandardAutoClosingPairConditional({ open: docComment.open, close: docComment.close || '' }));
        }
        this._autoCloseBefore = typeof config.autoCloseBefore === 'string' ? config.autoCloseBefore : CharacterPairSupport.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED;
        this._surroundingPairs = config.surroundingPairs || this._autoClosingPairs;
    }
    getAutoClosingPairs() {
        return this._autoClosingPairs;
    }
    getAutoCloseBeforeSet() {
        return this._autoCloseBefore;
    }
    static shouldAutoClosePair(autoClosingPair, context, column) {
        // Always complete on empty line
        if (context.getTokenCount() === 0) {
            return true;
        }
        const tokenIndex = context.findTokenIndexAtOffset(column - 2);
        const standardTokenType = context.getStandardTokenType(tokenIndex);
        return autoClosingPair.isOK(standardTokenType);
    }
    getSurroundingPairs() {
        return this._surroundingPairs;
    }
}
CharacterPairSupport.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED = ';:.,=}])> \n\t';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
let _utf16LE_TextDecoder;
function getUTF16LE_TextDecoder() {
    if (!_utf16LE_TextDecoder) {
        _utf16LE_TextDecoder = new TextDecoder('UTF-16LE');
    }
    return _utf16LE_TextDecoder;
}
let _utf16BE_TextDecoder;
function getUTF16BE_TextDecoder() {
    if (!_utf16BE_TextDecoder) {
        _utf16BE_TextDecoder = new TextDecoder('UTF-16BE');
    }
    return _utf16BE_TextDecoder;
}
let _platformTextDecoder;
function getPlatformTextDecoder() {
    if (!_platformTextDecoder) {
        _platformTextDecoder = isLittleEndian() ? getUTF16LE_TextDecoder() : getUTF16BE_TextDecoder();
    }
    return _platformTextDecoder;
}
const hasTextDecoder$1 = (typeof TextDecoder !== 'undefined');
let createStringBuilder;
let decodeUTF16LE;
if (hasTextDecoder$1) {
    createStringBuilder = (capacity) => new StringBuilder(capacity);
    decodeUTF16LE = standardDecodeUTF16LE;
}
else {
    createStringBuilder = (capacity) => new CompatStringBuilder();
    decodeUTF16LE = compatDecodeUTF16LE;
}
function standardDecodeUTF16LE(source, offset, len) {
    const view = new Uint16Array(source.buffer, offset, len);
    if (len > 0 && (view[0] === 0xFEFF || view[0] === 0xFFFE)) {
        // UTF16 sometimes starts with a BOM https://de.wikipedia.org/wiki/Byte_Order_Mark
        // It looks like TextDecoder.decode will eat up a leading BOM (0xFEFF or 0xFFFE)
        // We don't want that behavior because we know the string is UTF16LE and the BOM should be maintained
        // So we use the manual decoder
        return compatDecodeUTF16LE(source, offset, len);
    }
    return getUTF16LE_TextDecoder().decode(view);
}
function compatDecodeUTF16LE(source, offset, len) {
    let result = [];
    let resultLen = 0;
    for (let i = 0; i < len; i++) {
        const charCode = readUInt16LE(source, offset);
        offset += 2;
        result[resultLen++] = String.fromCharCode(charCode);
    }
    return result.join('');
}
class StringBuilder {
    constructor(capacity) {
        this._capacity = capacity | 0;
        this._buffer = new Uint16Array(this._capacity);
        this._completedStrings = null;
        this._bufferLength = 0;
    }
    reset() {
        this._completedStrings = null;
        this._bufferLength = 0;
    }
    build() {
        if (this._completedStrings !== null) {
            this._flushBuffer();
            return this._completedStrings.join('');
        }
        return this._buildBuffer();
    }
    _buildBuffer() {
        if (this._bufferLength === 0) {
            return '';
        }
        const view = new Uint16Array(this._buffer.buffer, 0, this._bufferLength);
        return getPlatformTextDecoder().decode(view);
    }
    _flushBuffer() {
        const bufferString = this._buildBuffer();
        this._bufferLength = 0;
        if (this._completedStrings === null) {
            this._completedStrings = [bufferString];
        }
        else {
            this._completedStrings[this._completedStrings.length] = bufferString;
        }
    }
    write1(charCode) {
        const remainingSpace = this._capacity - this._bufferLength;
        if (remainingSpace <= 1) {
            if (remainingSpace === 0 || isHighSurrogate(charCode)) {
                this._flushBuffer();
            }
        }
        this._buffer[this._bufferLength++] = charCode;
    }
    appendASCII(charCode) {
        if (this._bufferLength === this._capacity) {
            // buffer is full
            this._flushBuffer();
        }
        this._buffer[this._bufferLength++] = charCode;
    }
    appendASCIIString(str) {
        const strLen = str.length;
        if (this._bufferLength + strLen >= this._capacity) {
            // This string does not fit in the remaining buffer space
            this._flushBuffer();
            this._completedStrings[this._completedStrings.length] = str;
            return;
        }
        for (let i = 0; i < strLen; i++) {
            this._buffer[this._bufferLength++] = str.charCodeAt(i);
        }
    }
}
class CompatStringBuilder {
    constructor() {
        this._pieces = [];
        this._piecesLen = 0;
    }
    reset() {
        this._pieces = [];
        this._piecesLen = 0;
    }
    build() {
        return this._pieces.join('');
    }
    write1(charCode) {
        this._pieces[this._piecesLen++] = String.fromCharCode(charCode);
    }
    appendASCII(charCode) {
        this._pieces[this._piecesLen++] = String.fromCharCode(charCode);
    }
    appendASCIIString(str) {
        this._pieces[this._piecesLen++] = str;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class RichEditBracket {
    constructor(languageIdentifier, index, open, close, forwardRegex, reversedRegex) {
        this.languageIdentifier = languageIdentifier;
        this.index = index;
        this.open = open;
        this.close = close;
        this.forwardRegex = forwardRegex;
        this.reversedRegex = reversedRegex;
        this._openSet = RichEditBracket._toSet(this.open);
        this._closeSet = RichEditBracket._toSet(this.close);
    }
    isOpen(text) {
        return this._openSet.has(text);
    }
    isClose(text) {
        return this._closeSet.has(text);
    }
    static _toSet(arr) {
        const result = new Set();
        for (const element of arr) {
            result.add(element);
        }
        return result;
    }
}
function groupFuzzyBrackets(brackets) {
    const N = brackets.length;
    brackets = brackets.map(b => [b[0].toLowerCase(), b[1].toLowerCase()]);
    const group = [];
    for (let i = 0; i < N; i++) {
        group[i] = i;
    }
    const areOverlapping = (a, b) => {
        const [aOpen, aClose] = a;
        const [bOpen, bClose] = b;
        return (aOpen === bOpen || aOpen === bClose || aClose === bOpen || aClose === bClose);
    };
    const mergeGroups = (g1, g2) => {
        const newG = Math.min(g1, g2);
        const oldG = Math.max(g1, g2);
        for (let i = 0; i < N; i++) {
            if (group[i] === oldG) {
                group[i] = newG;
            }
        }
    };
    // group together brackets that have the same open or the same close sequence
    for (let i = 0; i < N; i++) {
        const a = brackets[i];
        for (let j = i + 1; j < N; j++) {
            const b = brackets[j];
            if (areOverlapping(a, b)) {
                mergeGroups(group[i], group[j]);
            }
        }
    }
    const result = [];
    for (let g = 0; g < N; g++) {
        let currentOpen = [];
        let currentClose = [];
        for (let i = 0; i < N; i++) {
            if (group[i] === g) {
                const [open, close] = brackets[i];
                currentOpen.push(open);
                currentClose.push(close);
            }
        }
        if (currentOpen.length > 0) {
            result.push({
                open: currentOpen,
                close: currentClose
            });
        }
    }
    return result;
}
class RichEditBrackets {
    constructor(languageIdentifier, _brackets) {
        const brackets = groupFuzzyBrackets(_brackets);
        this.brackets = brackets.map((b, index) => {
            return new RichEditBracket(languageIdentifier, index, b.open, b.close, getRegexForBracketPair(b.open, b.close, brackets, index), getReversedRegexForBracketPair(b.open, b.close, brackets, index));
        });
        this.forwardRegex = getRegexForBrackets(this.brackets);
        this.reversedRegex = getReversedRegexForBrackets(this.brackets);
        this.textIsBracket = {};
        this.textIsOpenBracket = {};
        this.maxBracketLength = 0;
        for (const bracket of this.brackets) {
            for (const open of bracket.open) {
                this.textIsBracket[open] = bracket;
                this.textIsOpenBracket[open] = true;
                this.maxBracketLength = Math.max(this.maxBracketLength, open.length);
            }
            for (const close of bracket.close) {
                this.textIsBracket[close] = bracket;
                this.textIsOpenBracket[close] = false;
                this.maxBracketLength = Math.max(this.maxBracketLength, close.length);
            }
        }
    }
}
function collectSuperstrings(str, brackets, currentIndex, dest) {
    for (let i = 0, len = brackets.length; i < len; i++) {
        if (i === currentIndex) {
            continue;
        }
        const bracket = brackets[i];
        for (const open of bracket.open) {
            if (open.indexOf(str) >= 0) {
                dest.push(open);
            }
        }
        for (const close of bracket.close) {
            if (close.indexOf(str) >= 0) {
                dest.push(close);
            }
        }
    }
}
function lengthcmp(a, b) {
    return a.length - b.length;
}
function unique(arr) {
    if (arr.length <= 1) {
        return arr;
    }
    const result = [];
    const seen = new Set();
    for (const element of arr) {
        if (seen.has(element)) {
            continue;
        }
        result.push(element);
        seen.add(element);
    }
    return result;
}
function getRegexForBracketPair(open, close, brackets, currentIndex) {
    // search in all brackets for other brackets that are a superstring of these brackets
    let pieces = [];
    pieces = pieces.concat(open);
    pieces = pieces.concat(close);
    for (let i = 0, len = pieces.length; i < len; i++) {
        collectSuperstrings(pieces[i], brackets, currentIndex, pieces);
    }
    pieces = unique(pieces);
    pieces.sort(lengthcmp);
    pieces.reverse();
    return createBracketOrRegExp(pieces);
}
function getReversedRegexForBracketPair(open, close, brackets, currentIndex) {
    // search in all brackets for other brackets that are a superstring of these brackets
    let pieces = [];
    pieces = pieces.concat(open);
    pieces = pieces.concat(close);
    for (let i = 0, len = pieces.length; i < len; i++) {
        collectSuperstrings(pieces[i], brackets, currentIndex, pieces);
    }
    pieces = unique(pieces);
    pieces.sort(lengthcmp);
    pieces.reverse();
    return createBracketOrRegExp(pieces.map(toReversedString));
}
function getRegexForBrackets(brackets) {
    let pieces = [];
    for (const bracket of brackets) {
        for (const open of bracket.open) {
            pieces.push(open);
        }
        for (const close of bracket.close) {
            pieces.push(close);
        }
    }
    pieces = unique(pieces);
    return createBracketOrRegExp(pieces);
}
function getReversedRegexForBrackets(brackets) {
    let pieces = [];
    for (const bracket of brackets) {
        for (const open of bracket.open) {
            pieces.push(open);
        }
        for (const close of bracket.close) {
            pieces.push(close);
        }
    }
    pieces = unique(pieces);
    return createBracketOrRegExp(pieces.map(toReversedString));
}
function prepareBracketForRegExp(str) {
    // This bracket pair uses letters like e.g. "begin" - "end"
    const insertWordBoundaries = (/^[\w ]+$/.test(str));
    str = escapeRegExpCharacters(str);
    return (insertWordBoundaries ? `\\b${str}\\b` : str);
}
function createBracketOrRegExp(pieces) {
    let regexStr = `(${pieces.map(prepareBracketForRegExp).join(')|(')})`;
    return createRegExp(regexStr, true);
}
const toReversedString = (function () {
    function reverse(str) {
        if (hasTextDecoder$1) {
            // create a Uint16Array and then use a TextDecoder to create a string
            const arr = new Uint16Array(str.length);
            let offset = 0;
            for (let i = str.length - 1; i >= 0; i--) {
                arr[offset++] = str.charCodeAt(i);
            }
            return getPlatformTextDecoder().decode(arr);
        }
        else {
            let result = [], resultLen = 0;
            for (let i = str.length - 1; i >= 0; i--) {
                result[resultLen++] = str.charAt(i);
            }
            return result.join('');
        }
    }
    let lastInput = null;
    let lastOutput = null;
    return function toReversedString(str) {
        if (lastInput !== str) {
            lastInput = str;
            lastOutput = reverse(lastInput);
        }
        return lastOutput;
    };
})();
class BracketsUtils {
    static _findPrevBracketInText(reversedBracketRegex, lineNumber, reversedText, offset) {
        let m = reversedText.match(reversedBracketRegex);
        if (!m) {
            return null;
        }
        let matchOffset = reversedText.length - (m.index || 0);
        let matchLength = m[0].length;
        let absoluteMatchOffset = offset + matchOffset;
        return new Range(lineNumber, absoluteMatchOffset - matchLength + 1, lineNumber, absoluteMatchOffset + 1);
    }
    static findPrevBracketInRange(reversedBracketRegex, lineNumber, lineText, startOffset, endOffset) {
        // Because JS does not support backwards regex search, we search forwards in a reversed string with a reversed regex ;)
        const reversedLineText = toReversedString(lineText);
        const reversedSubstr = reversedLineText.substring(lineText.length - endOffset, lineText.length - startOffset);
        return this._findPrevBracketInText(reversedBracketRegex, lineNumber, reversedSubstr, startOffset);
    }
    static findNextBracketInText(bracketRegex, lineNumber, text, offset) {
        let m = text.match(bracketRegex);
        if (!m) {
            return null;
        }
        let matchOffset = m.index || 0;
        let matchLength = m[0].length;
        if (matchLength === 0) {
            return null;
        }
        let absoluteMatchOffset = offset + matchOffset;
        return new Range(lineNumber, absoluteMatchOffset + 1, lineNumber, absoluteMatchOffset + 1 + matchLength);
    }
    static findNextBracketInRange(bracketRegex, lineNumber, lineText, startOffset, endOffset) {
        const substr = lineText.substring(startOffset, endOffset);
        return this.findNextBracketInText(bracketRegex, lineNumber, substr, startOffset);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class BracketElectricCharacterSupport {
    constructor(richEditBrackets) {
        this._richEditBrackets = richEditBrackets;
    }
    getElectricCharacters() {
        let result = [];
        if (this._richEditBrackets) {
            for (const bracket of this._richEditBrackets.brackets) {
                for (const close of bracket.close) {
                    const lastChar = close.charAt(close.length - 1);
                    result.push(lastChar);
                }
            }
        }
        // Filter duplicate entries
        result = result.filter((item, pos, array) => {
            return array.indexOf(item) === pos;
        });
        return result;
    }
    onElectricCharacter(character, context, column) {
        if (!this._richEditBrackets || this._richEditBrackets.brackets.length === 0) {
            return null;
        }
        const tokenIndex = context.findTokenIndexAtOffset(column - 1);
        if (ignoreBracketsInToken(context.getStandardTokenType(tokenIndex))) {
            return null;
        }
        const reversedBracketRegex = this._richEditBrackets.reversedRegex;
        const text = context.getLineContent().substring(0, column - 1) + character;
        const r = BracketsUtils.findPrevBracketInRange(reversedBracketRegex, 1, text, 0, text.length);
        if (!r) {
            return null;
        }
        const bracketText = text.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
        const isOpen = this._richEditBrackets.textIsOpenBracket[bracketText];
        if (isOpen) {
            return null;
        }
        const textBeforeBracket = context.getActualLineContentBefore(r.startColumn - 1);
        if (!/^\s*$/.test(textBeforeBracket)) {
            // There is other text on the line before the bracket
            return null;
        }
        return {
            matchOpenBracket: bracketText
        };
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function resetGlobalRegex(reg) {
    if (reg.global) {
        reg.lastIndex = 0;
    }
    return true;
}
class IndentRulesSupport {
    constructor(indentationRules) {
        this._indentationRules = indentationRules;
    }
    shouldIncrease(text) {
        if (this._indentationRules) {
            if (this._indentationRules.increaseIndentPattern && resetGlobalRegex(this._indentationRules.increaseIndentPattern) && this._indentationRules.increaseIndentPattern.test(text)) {
                return true;
            }
            // if (this._indentationRules.indentNextLinePattern && this._indentationRules.indentNextLinePattern.test(text)) {
            // 	return true;
            // }
        }
        return false;
    }
    shouldDecrease(text) {
        if (this._indentationRules && this._indentationRules.decreaseIndentPattern && resetGlobalRegex(this._indentationRules.decreaseIndentPattern) && this._indentationRules.decreaseIndentPattern.test(text)) {
            return true;
        }
        return false;
    }
    shouldIndentNextLine(text) {
        if (this._indentationRules && this._indentationRules.indentNextLinePattern && resetGlobalRegex(this._indentationRules.indentNextLinePattern) && this._indentationRules.indentNextLinePattern.test(text)) {
            return true;
        }
        return false;
    }
    shouldIgnore(text) {
        // the text matches `unIndentedLinePattern`
        if (this._indentationRules && this._indentationRules.unIndentedLinePattern && resetGlobalRegex(this._indentationRules.unIndentedLinePattern) && this._indentationRules.unIndentedLinePattern.test(text)) {
            return true;
        }
        return false;
    }
    getIndentMetadata(text) {
        let ret = 0;
        if (this.shouldIncrease(text)) {
            ret += 1 /* INCREASE_MASK */;
        }
        if (this.shouldDecrease(text)) {
            ret += 2 /* DECREASE_MASK */;
        }
        if (this.shouldIndentNextLine(text)) {
            ret += 4 /* INDENT_NEXTLINE_MASK */;
        }
        if (this.shouldIgnore(text)) {
            ret += 8 /* UNINDENT_MASK */;
        }
        return ret;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class OnEnterSupport {
    constructor(opts) {
        opts = opts || {};
        opts.brackets = opts.brackets || [
            ['(', ')'],
            ['{', '}'],
            ['[', ']']
        ];
        this._brackets = [];
        opts.brackets.forEach((bracket) => {
            const openRegExp = OnEnterSupport._createOpenBracketRegExp(bracket[0]);
            const closeRegExp = OnEnterSupport._createCloseBracketRegExp(bracket[1]);
            if (openRegExp && closeRegExp) {
                this._brackets.push({
                    open: bracket[0],
                    openRegExp: openRegExp,
                    close: bracket[1],
                    closeRegExp: closeRegExp,
                });
            }
        });
        this._regExpRules = opts.onEnterRules || [];
    }
    onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
        // (1): `regExpRules`
        if (autoIndent >= 3 /* Advanced */) {
            for (let i = 0, len = this._regExpRules.length; i < len; i++) {
                let rule = this._regExpRules[i];
                const regResult = [{
                        reg: rule.beforeText,
                        text: beforeEnterText
                    }, {
                        reg: rule.afterText,
                        text: afterEnterText
                    }, {
                        reg: rule.previousLineText,
                        text: previousLineText
                    }].every((obj) => {
                    if (!obj.reg) {
                        return true;
                    }
                    obj.reg.lastIndex = 0; // To disable the effect of the "g" flag.
                    return obj.reg.test(obj.text);
                });
                if (regResult) {
                    return rule.action;
                }
            }
        }
        // (2): Special indent-outdent
        if (autoIndent >= 2 /* Brackets */) {
            if (beforeEnterText.length > 0 && afterEnterText.length > 0) {
                for (let i = 0, len = this._brackets.length; i < len; i++) {
                    let bracket = this._brackets[i];
                    if (bracket.openRegExp.test(beforeEnterText) && bracket.closeRegExp.test(afterEnterText)) {
                        return { indentAction: IndentAction.IndentOutdent };
                    }
                }
            }
        }
        // (4): Open bracket based logic
        if (autoIndent >= 2 /* Brackets */) {
            if (beforeEnterText.length > 0) {
                for (let i = 0, len = this._brackets.length; i < len; i++) {
                    let bracket = this._brackets[i];
                    if (bracket.openRegExp.test(beforeEnterText)) {
                        return { indentAction: IndentAction.Indent };
                    }
                }
            }
        }
        return null;
    }
    static _createOpenBracketRegExp(bracket) {
        let str = escapeRegExpCharacters(bracket);
        if (!/\B/.test(str.charAt(0))) {
            str = '\\b' + str;
        }
        str += '\\s*$';
        return OnEnterSupport._safeRegExp(str);
    }
    static _createCloseBracketRegExp(bracket) {
        let str = escapeRegExpCharacters(bracket);
        if (!/\B/.test(str.charAt(str.length - 1))) {
            str = str + '\\b';
        }
        str = '^\\s*' + str;
        return OnEnterSupport._safeRegExp(str);
    }
    static _safeRegExp(def) {
        try {
            return new RegExp(def);
        }
        catch (err) {
            onUnexpectedError(err);
            return null;
        }
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class RichEditSupport {
    constructor(languageIdentifier, rawConf) {
        this._languageIdentifier = languageIdentifier;
        this._brackets = null;
        this._electricCharacter = null;
        this._conf = rawConf;
        this._onEnterSupport = (this._conf.brackets || this._conf.indentationRules || this._conf.onEnterRules ? new OnEnterSupport(this._conf) : null);
        this.comments = RichEditSupport._handleComments(this._conf);
        this.characterPair = new CharacterPairSupport(this._conf);
        this.wordDefinition = this._conf.wordPattern || DEFAULT_WORD_REGEXP;
        this.indentationRules = this._conf.indentationRules;
        if (this._conf.indentationRules) {
            this.indentRulesSupport = new IndentRulesSupport(this._conf.indentationRules);
        }
        else {
            this.indentRulesSupport = null;
        }
        this.foldingRules = this._conf.folding || {};
    }
    get brackets() {
        if (!this._brackets && this._conf.brackets) {
            this._brackets = new RichEditBrackets(this._languageIdentifier, this._conf.brackets);
        }
        return this._brackets;
    }
    get electricCharacter() {
        if (!this._electricCharacter) {
            this._electricCharacter = new BracketElectricCharacterSupport(this.brackets);
        }
        return this._electricCharacter;
    }
    onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText) {
        if (!this._onEnterSupport) {
            return null;
        }
        return this._onEnterSupport.onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText);
    }
    static _handleComments(conf) {
        let commentRule = conf.comments;
        if (!commentRule) {
            return null;
        }
        // comment configuration
        let comments = {};
        if (commentRule.lineComment) {
            comments.lineCommentToken = commentRule.lineComment;
        }
        if (commentRule.blockComment) {
            let [blockStart, blockEnd] = commentRule.blockComment;
            comments.blockCommentStartToken = blockStart;
            comments.blockCommentEndToken = blockEnd;
        }
        return comments;
    }
}
class LanguageConfigurationChangeEvent {
    constructor(languageIdentifier) {
        this.languageIdentifier = languageIdentifier;
    }
}
class LanguageConfigurationEntry {
    constructor(configuration, priority, order) {
        this.configuration = configuration;
        this.priority = priority;
        this.order = order;
    }
    static cmp(a, b) {
        if (a.priority === b.priority) {
            // higher order last
            return a.order - b.order;
        }
        // higher priority last
        return a.priority - b.priority;
    }
}
class LanguageConfigurationEntries {
    constructor(languageIdentifier) {
        this.languageIdentifier = languageIdentifier;
        this._resolved = null;
        this._entries = [];
        this._order = 0;
        this._resolved = null;
    }
    register(configuration, priority) {
        const entry = new LanguageConfigurationEntry(configuration, priority, ++this._order);
        this._entries.push(entry);
        this._resolved = null;
        return toDisposable(() => {
            for (let i = 0; i < this._entries.length; i++) {
                if (this._entries[i] === entry) {
                    this._entries.splice(i, 1);
                    this._resolved = null;
                    break;
                }
            }
        });
    }
    getRichEditSupport() {
        if (!this._resolved) {
            const config = this._resolve();
            if (config) {
                this._resolved = new RichEditSupport(this.languageIdentifier, config);
            }
        }
        return this._resolved;
    }
    _resolve() {
        if (this._entries.length === 0) {
            return null;
        }
        this._entries.sort(LanguageConfigurationEntry.cmp);
        const result = {};
        for (const entry of this._entries) {
            const conf = entry.configuration;
            result.comments = conf.comments || result.comments;
            result.brackets = conf.brackets || result.brackets;
            result.wordPattern = conf.wordPattern || result.wordPattern;
            result.indentationRules = conf.indentationRules || result.indentationRules;
            result.onEnterRules = conf.onEnterRules || result.onEnterRules;
            result.autoClosingPairs = conf.autoClosingPairs || result.autoClosingPairs;
            result.surroundingPairs = conf.surroundingPairs || result.surroundingPairs;
            result.autoCloseBefore = conf.autoCloseBefore || result.autoCloseBefore;
            result.folding = conf.folding || result.folding;
            result.__electricCharacterSupport = conf.__electricCharacterSupport || result.__electricCharacterSupport;
        }
        return result;
    }
}
class LanguageConfigurationRegistryImpl {
    constructor() {
        this._entries2 = new Map();
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
    }
    /**
     * @param priority Use a higher number for higher priority
     */
    register(languageIdentifier, configuration, priority = 0) {
        let entries = this._entries2.get(languageIdentifier.id);
        if (!entries) {
            entries = new LanguageConfigurationEntries(languageIdentifier);
            this._entries2.set(languageIdentifier.id, entries);
        }
        const disposable = entries.register(configuration, priority);
        this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageIdentifier));
        return toDisposable(() => {
            disposable.dispose();
            this._onDidChange.fire(new LanguageConfigurationChangeEvent(languageIdentifier));
        });
    }
    _getRichEditSupport(languageId) {
        const entries = this._entries2.get(languageId);
        return entries ? entries.getRichEditSupport() : null;
    }
    getIndentationRules(languageId) {
        const value = this._getRichEditSupport(languageId);
        return value ? value.indentationRules || null : null;
    }
    // begin electricCharacter
    _getElectricCharacterSupport(languageId) {
        let value = this._getRichEditSupport(languageId);
        if (!value) {
            return null;
        }
        return value.electricCharacter || null;
    }
    getElectricCharacters(languageId) {
        let electricCharacterSupport = this._getElectricCharacterSupport(languageId);
        if (!electricCharacterSupport) {
            return [];
        }
        return electricCharacterSupport.getElectricCharacters();
    }
    /**
     * Should return opening bracket type to match indentation with
     */
    onElectricCharacter(character, context, column) {
        let scopedLineTokens = createScopedLineTokens(context, column - 1);
        let electricCharacterSupport = this._getElectricCharacterSupport(scopedLineTokens.languageId);
        if (!electricCharacterSupport) {
            return null;
        }
        return electricCharacterSupport.onElectricCharacter(character, scopedLineTokens, column - scopedLineTokens.firstCharOffset);
    }
    // end electricCharacter
    getComments(languageId) {
        let value = this._getRichEditSupport(languageId);
        if (!value) {
            return null;
        }
        return value.comments || null;
    }
    // begin characterPair
    _getCharacterPairSupport(languageId) {
        let value = this._getRichEditSupport(languageId);
        if (!value) {
            return null;
        }
        return value.characterPair || null;
    }
    getAutoClosingPairs(languageId) {
        const characterPairSupport = this._getCharacterPairSupport(languageId);
        return new AutoClosingPairs(characterPairSupport ? characterPairSupport.getAutoClosingPairs() : []);
    }
    getAutoCloseBeforeSet(languageId) {
        let characterPairSupport = this._getCharacterPairSupport(languageId);
        if (!characterPairSupport) {
            return CharacterPairSupport.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED;
        }
        return characterPairSupport.getAutoCloseBeforeSet();
    }
    getSurroundingPairs(languageId) {
        let characterPairSupport = this._getCharacterPairSupport(languageId);
        if (!characterPairSupport) {
            return [];
        }
        return characterPairSupport.getSurroundingPairs();
    }
    shouldAutoClosePair(autoClosingPair, context, column) {
        const scopedLineTokens = createScopedLineTokens(context, column - 1);
        return CharacterPairSupport.shouldAutoClosePair(autoClosingPair, scopedLineTokens, column - scopedLineTokens.firstCharOffset);
    }
    // end characterPair
    getWordDefinition(languageId) {
        let value = this._getRichEditSupport(languageId);
        if (!value) {
            return ensureValidWordDefinition(null);
        }
        return ensureValidWordDefinition(value.wordDefinition || null);
    }
    getFoldingRules(languageId) {
        let value = this._getRichEditSupport(languageId);
        if (!value) {
            return {};
        }
        return value.foldingRules;
    }
    // begin Indent Rules
    getIndentRulesSupport(languageId) {
        let value = this._getRichEditSupport(languageId);
        if (!value) {
            return null;
        }
        return value.indentRulesSupport || null;
    }
    /**
     * Get nearest preceiding line which doesn't match unIndentPattern or contains all whitespace.
     * Result:
     * -1: run into the boundary of embedded languages
     * 0: every line above are invalid
     * else: nearest preceding line of the same language
     */
    getPrecedingValidLine(model, lineNumber, indentRulesSupport) {
        let languageID = model.getLanguageIdAtPosition(lineNumber, 0);
        if (lineNumber > 1) {
            let lastLineNumber;
            let resultLineNumber = -1;
            for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
                if (model.getLanguageIdAtPosition(lastLineNumber, 0) !== languageID) {
                    return resultLineNumber;
                }
                let text = model.getLineContent(lastLineNumber);
                if (indentRulesSupport.shouldIgnore(text) || /^\s+$/.test(text) || text === '') {
                    resultLineNumber = lastLineNumber;
                    continue;
                }
                return lastLineNumber;
            }
        }
        return -1;
    }
    /**
     * Get inherited indentation from above lines.
     * 1. Find the nearest preceding line which doesn't match unIndentedLinePattern.
     * 2. If this line matches indentNextLinePattern or increaseIndentPattern, it means that the indent level of `lineNumber` should be 1 greater than this line.
     * 3. If this line doesn't match any indent rules
     *   a. check whether the line above it matches indentNextLinePattern
     *   b. If not, the indent level of this line is the result
     *   c. If so, it means the indent of this line is *temporary*, go upward utill we find a line whose indent is not temporary (the same workflow a -> b -> c).
     * 4. Otherwise, we fail to get an inherited indent from aboves. Return null and we should not touch the indent of `lineNumber`
     *
     * This function only return the inherited indent based on above lines, it doesn't check whether current line should decrease or not.
     */
    getInheritIndentForLine(autoIndent, model, lineNumber, honorIntentialIndent = true) {
        if (autoIndent < 4 /* Full */) {
            return null;
        }
        const indentRulesSupport = this.getIndentRulesSupport(model.getLanguageIdentifier().id);
        if (!indentRulesSupport) {
            return null;
        }
        if (lineNumber <= 1) {
            return {
                indentation: '',
                action: null
            };
        }
        const precedingUnIgnoredLine = this.getPrecedingValidLine(model, lineNumber, indentRulesSupport);
        if (precedingUnIgnoredLine < 0) {
            return null;
        }
        else if (precedingUnIgnoredLine < 1) {
            return {
                indentation: '',
                action: null
            };
        }
        const precedingUnIgnoredLineContent = model.getLineContent(precedingUnIgnoredLine);
        if (indentRulesSupport.shouldIncrease(precedingUnIgnoredLineContent) || indentRulesSupport.shouldIndentNextLine(precedingUnIgnoredLineContent)) {
            return {
                indentation: getLeadingWhitespace(precedingUnIgnoredLineContent),
                action: IndentAction.Indent,
                line: precedingUnIgnoredLine
            };
        }
        else if (indentRulesSupport.shouldDecrease(precedingUnIgnoredLineContent)) {
            return {
                indentation: getLeadingWhitespace(precedingUnIgnoredLineContent),
                action: null,
                line: precedingUnIgnoredLine
            };
        }
        else {
            // precedingUnIgnoredLine can not be ignored.
            // it doesn't increase indent of following lines
            // it doesn't increase just next line
            // so current line is not affect by precedingUnIgnoredLine
            // and then we should get a correct inheritted indentation from above lines
            if (precedingUnIgnoredLine === 1) {
                return {
                    indentation: getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
                    action: null,
                    line: precedingUnIgnoredLine
                };
            }
            const previousLine = precedingUnIgnoredLine - 1;
            const previousLineIndentMetadata = indentRulesSupport.getIndentMetadata(model.getLineContent(previousLine));
            if (!(previousLineIndentMetadata & (1 /* INCREASE_MASK */ | 2 /* DECREASE_MASK */)) &&
                (previousLineIndentMetadata & 4 /* INDENT_NEXTLINE_MASK */)) {
                let stopLine = 0;
                for (let i = previousLine - 1; i > 0; i--) {
                    if (indentRulesSupport.shouldIndentNextLine(model.getLineContent(i))) {
                        continue;
                    }
                    stopLine = i;
                    break;
                }
                return {
                    indentation: getLeadingWhitespace(model.getLineContent(stopLine + 1)),
                    action: null,
                    line: stopLine + 1
                };
            }
            if (honorIntentialIndent) {
                return {
                    indentation: getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
                    action: null,
                    line: precedingUnIgnoredLine
                };
            }
            else {
                // search from precedingUnIgnoredLine until we find one whose indent is not temporary
                for (let i = precedingUnIgnoredLine; i > 0; i--) {
                    const lineContent = model.getLineContent(i);
                    if (indentRulesSupport.shouldIncrease(lineContent)) {
                        return {
                            indentation: getLeadingWhitespace(lineContent),
                            action: IndentAction.Indent,
                            line: i
                        };
                    }
                    else if (indentRulesSupport.shouldIndentNextLine(lineContent)) {
                        let stopLine = 0;
                        for (let j = i - 1; j > 0; j--) {
                            if (indentRulesSupport.shouldIndentNextLine(model.getLineContent(i))) {
                                continue;
                            }
                            stopLine = j;
                            break;
                        }
                        return {
                            indentation: getLeadingWhitespace(model.getLineContent(stopLine + 1)),
                            action: null,
                            line: stopLine + 1
                        };
                    }
                    else if (indentRulesSupport.shouldDecrease(lineContent)) {
                        return {
                            indentation: getLeadingWhitespace(lineContent),
                            action: null,
                            line: i
                        };
                    }
                }
                return {
                    indentation: getLeadingWhitespace(model.getLineContent(1)),
                    action: null,
                    line: 1
                };
            }
        }
    }
    getGoodIndentForLine(autoIndent, virtualModel, languageId, lineNumber, indentConverter) {
        if (autoIndent < 4 /* Full */) {
            return null;
        }
        const richEditSupport = this._getRichEditSupport(languageId);
        if (!richEditSupport) {
            return null;
        }
        const indentRulesSupport = this.getIndentRulesSupport(languageId);
        if (!indentRulesSupport) {
            return null;
        }
        const indent = this.getInheritIndentForLine(autoIndent, virtualModel, lineNumber);
        const lineContent = virtualModel.getLineContent(lineNumber);
        if (indent) {
            const inheritLine = indent.line;
            if (inheritLine !== undefined) {
                const enterResult = richEditSupport.onEnter(autoIndent, '', virtualModel.getLineContent(inheritLine), '');
                if (enterResult) {
                    let indentation = getLeadingWhitespace(virtualModel.getLineContent(inheritLine));
                    if (enterResult.removeText) {
                        indentation = indentation.substring(0, indentation.length - enterResult.removeText);
                    }
                    if ((enterResult.indentAction === IndentAction.Indent) ||
                        (enterResult.indentAction === IndentAction.IndentOutdent)) {
                        indentation = indentConverter.shiftIndent(indentation);
                    }
                    else if (enterResult.indentAction === IndentAction.Outdent) {
                        indentation = indentConverter.unshiftIndent(indentation);
                    }
                    if (indentRulesSupport.shouldDecrease(lineContent)) {
                        indentation = indentConverter.unshiftIndent(indentation);
                    }
                    if (enterResult.appendText) {
                        indentation += enterResult.appendText;
                    }
                    return getLeadingWhitespace(indentation);
                }
            }
            if (indentRulesSupport.shouldDecrease(lineContent)) {
                if (indent.action === IndentAction.Indent) {
                    return indent.indentation;
                }
                else {
                    return indentConverter.unshiftIndent(indent.indentation);
                }
            }
            else {
                if (indent.action === IndentAction.Indent) {
                    return indentConverter.shiftIndent(indent.indentation);
                }
                else {
                    return indent.indentation;
                }
            }
        }
        return null;
    }
    getIndentForEnter(autoIndent, model, range, indentConverter) {
        if (autoIndent < 4 /* Full */) {
            return null;
        }
        model.forceTokenization(range.startLineNumber);
        const lineTokens = model.getLineTokens(range.startLineNumber);
        const scopedLineTokens = createScopedLineTokens(lineTokens, range.startColumn - 1);
        const scopedLineText = scopedLineTokens.getLineContent();
        let embeddedLanguage = false;
        let beforeEnterText;
        if (scopedLineTokens.firstCharOffset > 0 && lineTokens.getLanguageId(0) !== scopedLineTokens.languageId) {
            // we are in the embeded language content
            embeddedLanguage = true; // if embeddedLanguage is true, then we don't touch the indentation of current line
            beforeEnterText = scopedLineText.substr(0, range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            beforeEnterText = lineTokens.getLineContent().substring(0, range.startColumn - 1);
        }
        let afterEnterText;
        if (range.isEmpty()) {
            afterEnterText = scopedLineText.substr(range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            const endScopedLineTokens = this.getScopedLineTokens(model, range.endLineNumber, range.endColumn);
            afterEnterText = endScopedLineTokens.getLineContent().substr(range.endColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        const indentRulesSupport = this.getIndentRulesSupport(scopedLineTokens.languageId);
        if (!indentRulesSupport) {
            return null;
        }
        const beforeEnterResult = beforeEnterText;
        const beforeEnterIndent = getLeadingWhitespace(beforeEnterText);
        const virtualModel = {
            getLineTokens: (lineNumber) => {
                return model.getLineTokens(lineNumber);
            },
            getLanguageIdentifier: () => {
                return model.getLanguageIdentifier();
            },
            getLanguageIdAtPosition: (lineNumber, column) => {
                return model.getLanguageIdAtPosition(lineNumber, column);
            },
            getLineContent: (lineNumber) => {
                if (lineNumber === range.startLineNumber) {
                    return beforeEnterResult;
                }
                else {
                    return model.getLineContent(lineNumber);
                }
            }
        };
        const currentLineIndent = getLeadingWhitespace(lineTokens.getLineContent());
        const afterEnterAction = this.getInheritIndentForLine(autoIndent, virtualModel, range.startLineNumber + 1);
        if (!afterEnterAction) {
            const beforeEnter = embeddedLanguage ? currentLineIndent : beforeEnterIndent;
            return {
                beforeEnter: beforeEnter,
                afterEnter: beforeEnter
            };
        }
        let afterEnterIndent = embeddedLanguage ? currentLineIndent : afterEnterAction.indentation;
        if (afterEnterAction.action === IndentAction.Indent) {
            afterEnterIndent = indentConverter.shiftIndent(afterEnterIndent);
        }
        if (indentRulesSupport.shouldDecrease(afterEnterText)) {
            afterEnterIndent = indentConverter.unshiftIndent(afterEnterIndent);
        }
        return {
            beforeEnter: embeddedLanguage ? currentLineIndent : beforeEnterIndent,
            afterEnter: afterEnterIndent
        };
    }
    /**
     * We should always allow intentional indentation. It means, if users change the indentation of `lineNumber` and the content of
     * this line doesn't match decreaseIndentPattern, we should not adjust the indentation.
     */
    getIndentActionForType(autoIndent, model, range, ch, indentConverter) {
        if (autoIndent < 4 /* Full */) {
            return null;
        }
        const scopedLineTokens = this.getScopedLineTokens(model, range.startLineNumber, range.startColumn);
        if (scopedLineTokens.firstCharOffset) {
            // this line has mixed languages and indentation rules will not work
            return null;
        }
        const indentRulesSupport = this.getIndentRulesSupport(scopedLineTokens.languageId);
        if (!indentRulesSupport) {
            return null;
        }
        const scopedLineText = scopedLineTokens.getLineContent();
        const beforeTypeText = scopedLineText.substr(0, range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        // selection support
        let afterTypeText;
        if (range.isEmpty()) {
            afterTypeText = scopedLineText.substr(range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            const endScopedLineTokens = this.getScopedLineTokens(model, range.endLineNumber, range.endColumn);
            afterTypeText = endScopedLineTokens.getLineContent().substr(range.endColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        // If previous content already matches decreaseIndentPattern, it means indentation of this line should already be adjusted
        // Users might change the indentation by purpose and we should honor that instead of readjusting.
        if (!indentRulesSupport.shouldDecrease(beforeTypeText + afterTypeText) && indentRulesSupport.shouldDecrease(beforeTypeText + ch + afterTypeText)) {
            // after typing `ch`, the content matches decreaseIndentPattern, we should adjust the indent to a good manner.
            // 1. Get inherited indent action
            const r = this.getInheritIndentForLine(autoIndent, model, range.startLineNumber, false);
            if (!r) {
                return null;
            }
            let indentation = r.indentation;
            if (r.action !== IndentAction.Indent) {
                indentation = indentConverter.unshiftIndent(indentation);
            }
            return indentation;
        }
        return null;
    }
    getIndentMetadata(model, lineNumber) {
        const indentRulesSupport = this.getIndentRulesSupport(model.getLanguageIdentifier().id);
        if (!indentRulesSupport) {
            return null;
        }
        if (lineNumber < 1 || lineNumber > model.getLineCount()) {
            return null;
        }
        return indentRulesSupport.getIndentMetadata(model.getLineContent(lineNumber));
    }
    // end Indent Rules
    // begin onEnter
    getEnterAction(autoIndent, model, range) {
        const scopedLineTokens = this.getScopedLineTokens(model, range.startLineNumber, range.startColumn);
        const richEditSupport = this._getRichEditSupport(scopedLineTokens.languageId);
        if (!richEditSupport) {
            return null;
        }
        const scopedLineText = scopedLineTokens.getLineContent();
        const beforeEnterText = scopedLineText.substr(0, range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        // selection support
        let afterEnterText;
        if (range.isEmpty()) {
            afterEnterText = scopedLineText.substr(range.startColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        else {
            const endScopedLineTokens = this.getScopedLineTokens(model, range.endLineNumber, range.endColumn);
            afterEnterText = endScopedLineTokens.getLineContent().substr(range.endColumn - 1 - scopedLineTokens.firstCharOffset);
        }
        let previousLineText = '';
        if (range.startLineNumber > 1 && scopedLineTokens.firstCharOffset === 0) {
            // This is not the first line and the entire line belongs to this mode
            const oneLineAboveScopedLineTokens = this.getScopedLineTokens(model, range.startLineNumber - 1);
            if (oneLineAboveScopedLineTokens.languageId === scopedLineTokens.languageId) {
                // The line above ends with text belonging to the same mode
                previousLineText = oneLineAboveScopedLineTokens.getLineContent();
            }
        }
        const enterResult = richEditSupport.onEnter(autoIndent, previousLineText, beforeEnterText, afterEnterText);
        if (!enterResult) {
            return null;
        }
        const indentAction = enterResult.indentAction;
        let appendText = enterResult.appendText;
        const removeText = enterResult.removeText || 0;
        // Here we add `\t` to appendText first because enterAction is leveraging appendText and removeText to change indentation.
        if (!appendText) {
            if ((indentAction === IndentAction.Indent) ||
                (indentAction === IndentAction.IndentOutdent)) {
                appendText = '\t';
            }
            else {
                appendText = '';
            }
        }
        else if (indentAction === IndentAction.Indent) {
            appendText = '\t' + appendText;
        }
        let indentation = this.getIndentationAtPosition(model, range.startLineNumber, range.startColumn);
        if (removeText) {
            indentation = indentation.substring(0, indentation.length - removeText);
        }
        return {
            indentAction: indentAction,
            appendText: appendText,
            removeText: removeText,
            indentation: indentation
        };
    }
    getIndentationAtPosition(model, lineNumber, column) {
        const lineText = model.getLineContent(lineNumber);
        let indentation = getLeadingWhitespace(lineText);
        if (indentation.length > column - 1) {
            indentation = indentation.substring(0, column - 1);
        }
        return indentation;
    }
    getScopedLineTokens(model, lineNumber, columnNumber) {
        model.forceTokenization(lineNumber);
        const lineTokens = model.getLineTokens(lineNumber);
        const column = (typeof columnNumber === 'undefined' ? model.getLineMaxColumn(lineNumber) - 1 : columnNumber - 1);
        return createScopedLineTokens(lineTokens, column);
    }
    // end onEnter
    getBracketsSupport(languageId) {
        const value = this._getRichEditSupport(languageId);
        if (!value) {
            return null;
        }
        return value.brackets || null;
    }
}
const LanguageConfigurationRegistry = new LanguageConfigurationRegistryImpl();

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function toUint8(v) {
    if (v < 0) {
        return 0;
    }
    if (v > 255 /* MAX_UINT_8 */) {
        return 255 /* MAX_UINT_8 */;
    }
    return v | 0;
}
function toUint32(v) {
    if (v < 0) {
        return 0;
    }
    if (v > 4294967295 /* MAX_UINT_32 */) {
        return 4294967295 /* MAX_UINT_32 */;
    }
    return v | 0;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * A fast character classifier that uses a compact array for ASCII values.
 */
class CharacterClassifier {
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
        }
        else {
            this._map.set(charCode, value);
        }
    }
    get(charCode) {
        if (charCode >= 0 && charCode < 256) {
            return this._asciiMap[charCode];
        }
        else {
            return (this._map.get(charCode) || this._defaultValue);
        }
    }
}
class CharacterSet {
    constructor() {
        this._actual = new CharacterClassifier(0 /* False */);
    }
    add(charCode) {
        this._actual.set(charCode, 1 /* True */);
    }
    has(charCode) {
        return (this._actual.get(charCode) === 1 /* True */);
    }
}

/**
 * Returns the last element of an array.
 * @param array The array.
 * @param n Which element from the end (default is zero).
 */
function tail(array, n = 0) {
    return array[array.length - (1 + n)];
}
function tail2(arr) {
    if (arr.length === 0) {
        throw new Error('Invalid tail call');
    }
    return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
}
function equals(one, other, itemEquals = (a, b) => a === b) {
    if (one === other) {
        return true;
    }
    if (!one || !other) {
        return false;
    }
    if (one.length !== other.length) {
        return false;
    }
    for (let i = 0, len = one.length; i < len; i++) {
        if (!itemEquals(one[i], other[i])) {
            return false;
        }
    }
    return true;
}
function binarySearch(array, key, comparator) {
    let low = 0, high = array.length - 1;
    while (low <= high) {
        const mid = ((low + high) / 2) | 0;
        const comp = comparator(array[mid], key);
        if (comp < 0) {
            low = mid + 1;
        }
        else if (comp > 0) {
            high = mid - 1;
        }
        else {
            return mid;
        }
    }
    return -(low + 1);
}
/**
 * Takes a sorted array and a function p. The array is sorted in such a way that all elements where p(x) is false
 * are located before all elements where p(x) is true.
 * @returns the least x for which p(x) is true or array.length if no element fullfills the given function.
 */
function findFirstInSorted(array, p) {
    let low = 0, high = array.length;
    if (high === 0) {
        return 0; // no children
    }
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (p(array[mid])) {
            high = mid;
        }
        else {
            low = mid + 1;
        }
    }
    return low;
}
function quickSelect(nth, data, compare) {
    nth = nth | 0;
    if (nth >= data.length) {
        throw new TypeError('invalid index');
    }
    let pivotValue = data[Math.floor(data.length * Math.random())];
    let lower = [];
    let higher = [];
    let pivots = [];
    for (let value of data) {
        const val = compare(value, pivotValue);
        if (val < 0) {
            lower.push(value);
        }
        else if (val > 0) {
            higher.push(value);
        }
        else {
            pivots.push(value);
        }
    }
    if (nth < lower.length) {
        return quickSelect(nth, lower, compare);
    }
    else if (nth < lower.length + pivots.length) {
        return pivots[0];
    }
    else {
        return quickSelect(nth - (lower.length + pivots.length), higher, compare);
    }
}
function groupBy(data, compare) {
    const result = [];
    let currentGroup = undefined;
    for (const element of data.slice(0).sort(compare)) {
        if (!currentGroup || compare(currentGroup[0], element) !== 0) {
            currentGroup = [element];
            result.push(currentGroup);
        }
        else {
            currentGroup.push(element);
        }
    }
    return result;
}
/**
 * @returns New array with all falsy values removed. The original array IS NOT modified.
 */
function coalesce(array) {
    return array.filter(e => !!e);
}
/**
 * @returns false if the provided object is an array and not empty.
 */
function isFalsyOrEmpty(obj) {
    return !Array.isArray(obj) || obj.length === 0;
}
function isNonEmptyArray(obj) {
    return Array.isArray(obj) && obj.length > 0;
}
/**
 * Removes duplicates from the given array. The optional keyFn allows to specify
 * how elements are checked for equalness by returning a unique string for each.
 */
function distinct(array, keyFn) {
    if (!keyFn) {
        return array.filter((element, position) => {
            return array.indexOf(element) === position;
        });
    }
    const seen = Object.create(null);
    return array.filter((elem) => {
        const key = keyFn(elem);
        if (seen[key]) {
            return false;
        }
        seen[key] = true;
        return true;
    });
}
function distinctES6(array) {
    const seen = new Set();
    return array.filter(element => {
        if (seen.has(element)) {
            return false;
        }
        seen.add(element);
        return true;
    });
}
function firstOrDefault(array, notFoundValue) {
    return array.length > 0 ? array[0] : notFoundValue;
}
function flatten(arr) {
    return [].concat(...arr);
}
function range(arg, to) {
    let from = typeof to === 'number' ? arg : 0;
    if (typeof to === 'number') {
        from = arg;
    }
    else {
        from = 0;
        to = arg;
    }
    const result = [];
    if (from <= to) {
        for (let i = from; i < to; i++) {
            result.push(i);
        }
    }
    else {
        for (let i = from; i > to; i--) {
            result.push(i);
        }
    }
    return result;
}
/**
 * Insert `insertArr` inside `target` at `insertIndex`.
 * Please don't touch unless you understand https://jsperf.com/inserting-an-array-within-an-array
 */
function arrayInsert(target, insertIndex, insertArr) {
    const before = target.slice(0, insertIndex);
    const after = target.slice(insertIndex);
    return before.concat(insertArr, after);
}
/**
 * Pushes an element to the start of the array, if found.
 */
function pushToStart(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
        arr.unshift(value);
    }
}
/**
 * Pushes an element to the end of the array, if found.
 */
function pushToEnd(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
        arr.push(value);
    }
}
function asArray(x) {
    return Array.isArray(x) ? x : [x];
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class LineTokens {
    constructor(tokens, text) {
        this._tokens = tokens;
        this._tokensCount = (this._tokens.length >>> 1);
        this._text = text;
    }
    static createEmpty(lineContent) {
        const defaultMetadata = ((0 /* None */ << 11 /* FONT_STYLE_OFFSET */)
            | (1 /* DefaultForeground */ << 14 /* FOREGROUND_OFFSET */)
            | (2 /* DefaultBackground */ << 23 /* BACKGROUND_OFFSET */)) >>> 0;
        const tokens = new Uint32Array(2);
        tokens[0] = lineContent.length;
        tokens[1] = defaultMetadata;
        return new LineTokens(tokens, lineContent);
    }
    equals(other) {
        if (other instanceof LineTokens) {
            return this.slicedEquals(other, 0, this._tokensCount);
        }
        return false;
    }
    slicedEquals(other, sliceFromTokenIndex, sliceTokenCount) {
        if (this._text !== other._text) {
            return false;
        }
        if (this._tokensCount !== other._tokensCount) {
            return false;
        }
        const from = (sliceFromTokenIndex << 1);
        const to = from + (sliceTokenCount << 1);
        for (let i = from; i < to; i++) {
            if (this._tokens[i] !== other._tokens[i]) {
                return false;
            }
        }
        return true;
    }
    getLineContent() {
        return this._text;
    }
    getCount() {
        return this._tokensCount;
    }
    getStartOffset(tokenIndex) {
        if (tokenIndex > 0) {
            return this._tokens[(tokenIndex - 1) << 1];
        }
        return 0;
    }
    getMetadata(tokenIndex) {
        const metadata = this._tokens[(tokenIndex << 1) + 1];
        return metadata;
    }
    getLanguageId(tokenIndex) {
        const metadata = this._tokens[(tokenIndex << 1) + 1];
        return TokenMetadata.getLanguageId(metadata);
    }
    getStandardTokenType(tokenIndex) {
        const metadata = this._tokens[(tokenIndex << 1) + 1];
        return TokenMetadata.getTokenType(metadata);
    }
    getForeground(tokenIndex) {
        const metadata = this._tokens[(tokenIndex << 1) + 1];
        return TokenMetadata.getForeground(metadata);
    }
    getClassName(tokenIndex) {
        const metadata = this._tokens[(tokenIndex << 1) + 1];
        return TokenMetadata.getClassNameFromMetadata(metadata);
    }
    getInlineStyle(tokenIndex, colorMap) {
        const metadata = this._tokens[(tokenIndex << 1) + 1];
        return TokenMetadata.getInlineStyleFromMetadata(metadata, colorMap);
    }
    getEndOffset(tokenIndex) {
        return this._tokens[tokenIndex << 1];
    }
    /**
     * Find the token containing offset `offset`.
     * @param offset The search offset
     * @return The index of the token containing the offset.
     */
    findTokenIndexAtOffset(offset) {
        return LineTokens.findIndexInTokensArray(this._tokens, offset);
    }
    inflate() {
        return this;
    }
    sliceAndInflate(startOffset, endOffset, deltaOffset) {
        return new SlicedLineTokens(this, startOffset, endOffset, deltaOffset);
    }
    static convertToEndOffset(tokens, lineTextLength) {
        const tokenCount = (tokens.length >>> 1);
        const lastTokenIndex = tokenCount - 1;
        for (let tokenIndex = 0; tokenIndex < lastTokenIndex; tokenIndex++) {
            tokens[tokenIndex << 1] = tokens[(tokenIndex + 1) << 1];
        }
        tokens[lastTokenIndex << 1] = lineTextLength;
    }
    static findIndexInTokensArray(tokens, desiredIndex) {
        if (tokens.length <= 2) {
            return 0;
        }
        let low = 0;
        let high = (tokens.length >>> 1) - 1;
        while (low < high) {
            const mid = low + Math.floor((high - low) / 2);
            const endOffset = tokens[(mid << 1)];
            if (endOffset === desiredIndex) {
                return mid + 1;
            }
            else if (endOffset < desiredIndex) {
                low = mid + 1;
            }
            else if (endOffset > desiredIndex) {
                high = mid;
            }
        }
        return low;
    }
}
class SlicedLineTokens {
    constructor(source, startOffset, endOffset, deltaOffset) {
        this._source = source;
        this._startOffset = startOffset;
        this._endOffset = endOffset;
        this._deltaOffset = deltaOffset;
        this._firstTokenIndex = source.findTokenIndexAtOffset(startOffset);
        this._tokensCount = 0;
        for (let i = this._firstTokenIndex, len = source.getCount(); i < len; i++) {
            const tokenStartOffset = source.getStartOffset(i);
            if (tokenStartOffset >= endOffset) {
                break;
            }
            this._tokensCount++;
        }
    }
    equals(other) {
        if (other instanceof SlicedLineTokens) {
            return (this._startOffset === other._startOffset
                && this._endOffset === other._endOffset
                && this._deltaOffset === other._deltaOffset
                && this._source.slicedEquals(other._source, this._firstTokenIndex, this._tokensCount));
        }
        return false;
    }
    getCount() {
        return this._tokensCount;
    }
    getForeground(tokenIndex) {
        return this._source.getForeground(this._firstTokenIndex + tokenIndex);
    }
    getEndOffset(tokenIndex) {
        const tokenEndOffset = this._source.getEndOffset(this._firstTokenIndex + tokenIndex);
        return Math.min(this._endOffset, tokenEndOffset) - this._startOffset + this._deltaOffset;
    }
    getClassName(tokenIndex) {
        return this._source.getClassName(this._firstTokenIndex + tokenIndex);
    }
    getInlineStyle(tokenIndex, colorMap) {
        return this._source.getInlineStyle(this._firstTokenIndex + tokenIndex, colorMap);
    }
    findTokenIndexAtOffset(offset) {
        return this._source.findTokenIndexAtOffset(offset + this._startOffset - this._deltaOffset) - this._firstTokenIndex;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function escapeNewLine(str) {
    return (str
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r'));
}
class TextChange {
    constructor(oldPosition, oldText, newPosition, newText) {
        this.oldPosition = oldPosition;
        this.oldText = oldText;
        this.newPosition = newPosition;
        this.newText = newText;
    }
    get oldLength() {
        return this.oldText.length;
    }
    get oldEnd() {
        return this.oldPosition + this.oldText.length;
    }
    get newLength() {
        return this.newText.length;
    }
    get newEnd() {
        return this.newPosition + this.newText.length;
    }
    toString() {
        if (this.oldText.length === 0) {
            return `(insert@${this.oldPosition} "${escapeNewLine(this.newText)}")`;
        }
        if (this.newText.length === 0) {
            return `(delete@${this.oldPosition} "${escapeNewLine(this.oldText)}")`;
        }
        return `(replace@${this.oldPosition} "${escapeNewLine(this.oldText)}" with "${escapeNewLine(this.newText)}")`;
    }
    static _writeStringSize(str) {
        return (4 + 2 * str.length);
    }
    static _writeString(b, str, offset) {
        const len = str.length;
        writeUInt32BE(b, len, offset);
        offset += 4;
        for (let i = 0; i < len; i++) {
            writeUInt16LE(b, str.charCodeAt(i), offset);
            offset += 2;
        }
        return offset;
    }
    static _readString(b, offset) {
        const len = readUInt32BE(b, offset);
        offset += 4;
        return decodeUTF16LE(b, offset, len);
    }
    writeSize() {
        return (+4 // oldPosition
            + 4 // newPosition
            + TextChange._writeStringSize(this.oldText)
            + TextChange._writeStringSize(this.newText));
    }
    write(b, offset) {
        writeUInt32BE(b, this.oldPosition, offset);
        offset += 4;
        writeUInt32BE(b, this.newPosition, offset);
        offset += 4;
        offset = TextChange._writeString(b, this.oldText, offset);
        offset = TextChange._writeString(b, this.newText, offset);
        return offset;
    }
    static read(b, offset, dest) {
        const oldPosition = readUInt32BE(b, offset);
        offset += 4;
        const newPosition = readUInt32BE(b, offset);
        offset += 4;
        const oldText = TextChange._readString(b, offset);
        offset += TextChange._writeStringSize(oldText);
        const newText = TextChange._readString(b, offset);
        offset += TextChange._writeStringSize(newText);
        dest.push(new TextChange(oldPosition, oldText, newPosition, newText));
        return offset;
    }
}
function compressConsecutiveTextChanges(prevEdits, currEdits) {
    if (prevEdits === null || prevEdits.length === 0) {
        return currEdits;
    }
    const compressor = new TextChangeCompressor(prevEdits, currEdits);
    return compressor.compress();
}
class TextChangeCompressor {
    constructor(prevEdits, currEdits) {
        this._prevEdits = prevEdits;
        this._currEdits = currEdits;
        this._result = [];
        this._resultLen = 0;
        this._prevLen = this._prevEdits.length;
        this._prevDeltaOffset = 0;
        this._currLen = this._currEdits.length;
        this._currDeltaOffset = 0;
    }
    compress() {
        let prevIndex = 0;
        let currIndex = 0;
        let prevEdit = this._getPrev(prevIndex);
        let currEdit = this._getCurr(currIndex);
        while (prevIndex < this._prevLen || currIndex < this._currLen) {
            if (prevEdit === null) {
                this._acceptCurr(currEdit);
                currEdit = this._getCurr(++currIndex);
                continue;
            }
            if (currEdit === null) {
                this._acceptPrev(prevEdit);
                prevEdit = this._getPrev(++prevIndex);
                continue;
            }
            if (currEdit.oldEnd <= prevEdit.newPosition) {
                this._acceptCurr(currEdit);
                currEdit = this._getCurr(++currIndex);
                continue;
            }
            if (prevEdit.newEnd <= currEdit.oldPosition) {
                this._acceptPrev(prevEdit);
                prevEdit = this._getPrev(++prevIndex);
                continue;
            }
            if (currEdit.oldPosition < prevEdit.newPosition) {
                const [e1, e2] = TextChangeCompressor._splitCurr(currEdit, prevEdit.newPosition - currEdit.oldPosition);
                this._acceptCurr(e1);
                currEdit = e2;
                continue;
            }
            if (prevEdit.newPosition < currEdit.oldPosition) {
                const [e1, e2] = TextChangeCompressor._splitPrev(prevEdit, currEdit.oldPosition - prevEdit.newPosition);
                this._acceptPrev(e1);
                prevEdit = e2;
                continue;
            }
            // At this point, currEdit.oldPosition === prevEdit.newPosition
            let mergePrev;
            let mergeCurr;
            if (currEdit.oldEnd === prevEdit.newEnd) {
                mergePrev = prevEdit;
                mergeCurr = currEdit;
                prevEdit = this._getPrev(++prevIndex);
                currEdit = this._getCurr(++currIndex);
            }
            else if (currEdit.oldEnd < prevEdit.newEnd) {
                const [e1, e2] = TextChangeCompressor._splitPrev(prevEdit, currEdit.oldLength);
                mergePrev = e1;
                mergeCurr = currEdit;
                prevEdit = e2;
                currEdit = this._getCurr(++currIndex);
            }
            else {
                const [e1, e2] = TextChangeCompressor._splitCurr(currEdit, prevEdit.newLength);
                mergePrev = prevEdit;
                mergeCurr = e1;
                prevEdit = this._getPrev(++prevIndex);
                currEdit = e2;
            }
            this._result[this._resultLen++] = new TextChange(mergePrev.oldPosition, mergePrev.oldText, mergeCurr.newPosition, mergeCurr.newText);
            this._prevDeltaOffset += mergePrev.newLength - mergePrev.oldLength;
            this._currDeltaOffset += mergeCurr.newLength - mergeCurr.oldLength;
        }
        const merged = TextChangeCompressor._merge(this._result);
        const cleaned = TextChangeCompressor._removeNoOps(merged);
        return cleaned;
    }
    _acceptCurr(currEdit) {
        this._result[this._resultLen++] = TextChangeCompressor._rebaseCurr(this._prevDeltaOffset, currEdit);
        this._currDeltaOffset += currEdit.newLength - currEdit.oldLength;
    }
    _getCurr(currIndex) {
        return (currIndex < this._currLen ? this._currEdits[currIndex] : null);
    }
    _acceptPrev(prevEdit) {
        this._result[this._resultLen++] = TextChangeCompressor._rebasePrev(this._currDeltaOffset, prevEdit);
        this._prevDeltaOffset += prevEdit.newLength - prevEdit.oldLength;
    }
    _getPrev(prevIndex) {
        return (prevIndex < this._prevLen ? this._prevEdits[prevIndex] : null);
    }
    static _rebaseCurr(prevDeltaOffset, currEdit) {
        return new TextChange(currEdit.oldPosition - prevDeltaOffset, currEdit.oldText, currEdit.newPosition, currEdit.newText);
    }
    static _rebasePrev(currDeltaOffset, prevEdit) {
        return new TextChange(prevEdit.oldPosition, prevEdit.oldText, prevEdit.newPosition + currDeltaOffset, prevEdit.newText);
    }
    static _splitPrev(edit, offset) {
        const preText = edit.newText.substr(0, offset);
        const postText = edit.newText.substr(offset);
        return [
            new TextChange(edit.oldPosition, edit.oldText, edit.newPosition, preText),
            new TextChange(edit.oldEnd, '', edit.newPosition + offset, postText)
        ];
    }
    static _splitCurr(edit, offset) {
        const preText = edit.oldText.substr(0, offset);
        const postText = edit.oldText.substr(offset);
        return [
            new TextChange(edit.oldPosition, preText, edit.newPosition, edit.newText),
            new TextChange(edit.oldPosition + offset, postText, edit.newEnd, '')
        ];
    }
    static _merge(edits) {
        if (edits.length === 0) {
            return edits;
        }
        let result = [], resultLen = 0;
        let prev = edits[0];
        for (let i = 1; i < edits.length; i++) {
            const curr = edits[i];
            if (prev.oldEnd === curr.oldPosition) {
                // Merge into `prev`
                prev = new TextChange(prev.oldPosition, prev.oldText + curr.oldText, prev.newPosition, prev.newText + curr.newText);
            }
            else {
                result[resultLen++] = prev;
                prev = curr;
            }
        }
        result[resultLen++] = prev;
        return result;
    }
    static _removeNoOps(edits) {
        if (edits.length === 0) {
            return edits;
        }
        let result = [], resultLen = 0;
        for (let i = 0; i < edits.length; i++) {
            const edit = edits[i];
            if (edit.oldText === edit.newText) {
                continue;
            }
            result[resultLen++] = edit;
        }
        return result;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function uriGetComparisonKey(resource) {
    return resource.toString();
}
class SingleModelEditStackData {
    constructor(beforeVersionId, afterVersionId, beforeEOL, afterEOL, beforeCursorState, afterCursorState, changes) {
        this.beforeVersionId = beforeVersionId;
        this.afterVersionId = afterVersionId;
        this.beforeEOL = beforeEOL;
        this.afterEOL = afterEOL;
        this.beforeCursorState = beforeCursorState;
        this.afterCursorState = afterCursorState;
        this.changes = changes;
    }
    static create(model, beforeCursorState) {
        const alternativeVersionId = model.getAlternativeVersionId();
        const eol = getModelEOL(model);
        return new SingleModelEditStackData(alternativeVersionId, alternativeVersionId, eol, eol, beforeCursorState, beforeCursorState, []);
    }
    append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
        if (textChanges.length > 0) {
            this.changes = compressConsecutiveTextChanges(this.changes, textChanges);
        }
        this.afterEOL = afterEOL;
        this.afterVersionId = afterVersionId;
        this.afterCursorState = afterCursorState;
    }
    static _writeSelectionsSize(selections) {
        return 4 + 4 * 4 * (selections ? selections.length : 0);
    }
    static _writeSelections(b, selections, offset) {
        writeUInt32BE(b, (selections ? selections.length : 0), offset);
        offset += 4;
        if (selections) {
            for (const selection of selections) {
                writeUInt32BE(b, selection.selectionStartLineNumber, offset);
                offset += 4;
                writeUInt32BE(b, selection.selectionStartColumn, offset);
                offset += 4;
                writeUInt32BE(b, selection.positionLineNumber, offset);
                offset += 4;
                writeUInt32BE(b, selection.positionColumn, offset);
                offset += 4;
            }
        }
        return offset;
    }
    static _readSelections(b, offset, dest) {
        const count = readUInt32BE(b, offset);
        offset += 4;
        for (let i = 0; i < count; i++) {
            const selectionStartLineNumber = readUInt32BE(b, offset);
            offset += 4;
            const selectionStartColumn = readUInt32BE(b, offset);
            offset += 4;
            const positionLineNumber = readUInt32BE(b, offset);
            offset += 4;
            const positionColumn = readUInt32BE(b, offset);
            offset += 4;
            dest.push(new Selection(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn));
        }
        return offset;
    }
    serialize() {
        let necessarySize = (+4 // beforeVersionId
            + 4 // afterVersionId
            + 1 // beforeEOL
            + 1 // afterEOL
            + SingleModelEditStackData._writeSelectionsSize(this.beforeCursorState)
            + SingleModelEditStackData._writeSelectionsSize(this.afterCursorState)
            + 4 // change count
        );
        for (const change of this.changes) {
            necessarySize += change.writeSize();
        }
        const b = new Uint8Array(necessarySize);
        let offset = 0;
        writeUInt32BE(b, this.beforeVersionId, offset);
        offset += 4;
        writeUInt32BE(b, this.afterVersionId, offset);
        offset += 4;
        writeUInt8(b, this.beforeEOL, offset);
        offset += 1;
        writeUInt8(b, this.afterEOL, offset);
        offset += 1;
        offset = SingleModelEditStackData._writeSelections(b, this.beforeCursorState, offset);
        offset = SingleModelEditStackData._writeSelections(b, this.afterCursorState, offset);
        writeUInt32BE(b, this.changes.length, offset);
        offset += 4;
        for (const change of this.changes) {
            offset = change.write(b, offset);
        }
        return b.buffer;
    }
    static deserialize(source) {
        const b = new Uint8Array(source);
        let offset = 0;
        const beforeVersionId = readUInt32BE(b, offset);
        offset += 4;
        const afterVersionId = readUInt32BE(b, offset);
        offset += 4;
        const beforeEOL = readUInt8(b, offset);
        offset += 1;
        const afterEOL = readUInt8(b, offset);
        offset += 1;
        const beforeCursorState = [];
        offset = SingleModelEditStackData._readSelections(b, offset, beforeCursorState);
        const afterCursorState = [];
        offset = SingleModelEditStackData._readSelections(b, offset, afterCursorState);
        const changeCount = readUInt32BE(b, offset);
        offset += 4;
        const changes = [];
        for (let i = 0; i < changeCount; i++) {
            offset = TextChange.read(b, offset, changes);
        }
        return new SingleModelEditStackData(beforeVersionId, afterVersionId, beforeEOL, afterEOL, beforeCursorState, afterCursorState, changes);
    }
}
class SingleModelEditStackElement {
    constructor(model, beforeCursorState) {
        this.model = model;
        this._data = SingleModelEditStackData.create(model, beforeCursorState);
    }
    get type() {
        return 0 /* Resource */;
    }
    get resource() {
        if (URI.isUri(this.model)) {
            return this.model;
        }
        return this.model.uri;
    }
    get label() {
        return localize('edit', "Typing");
    }
    toString() {
        const data = (this._data instanceof SingleModelEditStackData ? this._data : SingleModelEditStackData.deserialize(this._data));
        return data.changes.map(change => change.toString()).join(', ');
    }
    matchesResource(resource) {
        const uri = (URI.isUri(this.model) ? this.model : this.model.uri);
        return (uri.toString() === resource.toString());
    }
    setModel(model) {
        this.model = model;
    }
    canAppend(model) {
        return (this.model === model && this._data instanceof SingleModelEditStackData);
    }
    append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
        if (this._data instanceof SingleModelEditStackData) {
            this._data.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
        }
    }
    close() {
        if (this._data instanceof SingleModelEditStackData) {
            this._data = this._data.serialize();
        }
    }
    open() {
        if (!(this._data instanceof SingleModelEditStackData)) {
            this._data = SingleModelEditStackData.deserialize(this._data);
        }
    }
    undo() {
        if (URI.isUri(this.model)) {
            // don't have a model
            throw new Error(`Invalid SingleModelEditStackElement`);
        }
        if (this._data instanceof SingleModelEditStackData) {
            this._data = this._data.serialize();
        }
        const data = SingleModelEditStackData.deserialize(this._data);
        this.model._applyUndo(data.changes, data.beforeEOL, data.beforeVersionId, data.beforeCursorState);
    }
    redo() {
        if (URI.isUri(this.model)) {
            // don't have a model
            throw new Error(`Invalid SingleModelEditStackElement`);
        }
        if (this._data instanceof SingleModelEditStackData) {
            this._data = this._data.serialize();
        }
        const data = SingleModelEditStackData.deserialize(this._data);
        this.model._applyRedo(data.changes, data.afterEOL, data.afterVersionId, data.afterCursorState);
    }
    heapSize() {
        if (this._data instanceof SingleModelEditStackData) {
            this._data = this._data.serialize();
        }
        return this._data.byteLength + 168 /*heap overhead*/;
    }
}
class MultiModelEditStackElement {
    constructor(label, editStackElements) {
        this.type = 1 /* Workspace */;
        this.label = label;
        this._isOpen = true;
        this._editStackElementsArr = editStackElements.slice(0);
        this._editStackElementsMap = new Map();
        for (const editStackElement of this._editStackElementsArr) {
            const key = uriGetComparisonKey(editStackElement.resource);
            this._editStackElementsMap.set(key, editStackElement);
        }
        this._delegate = null;
    }
    get resources() {
        return this._editStackElementsArr.map(editStackElement => editStackElement.resource);
    }
    prepareUndoRedo() {
        if (this._delegate) {
            return this._delegate.prepareUndoRedo(this);
        }
    }
    matchesResource(resource) {
        const key = uriGetComparisonKey(resource);
        return (this._editStackElementsMap.has(key));
    }
    setModel(model) {
        const key = uriGetComparisonKey(URI.isUri(model) ? model : model.uri);
        if (this._editStackElementsMap.has(key)) {
            this._editStackElementsMap.get(key).setModel(model);
        }
    }
    canAppend(model) {
        if (!this._isOpen) {
            return false;
        }
        const key = uriGetComparisonKey(model.uri);
        if (this._editStackElementsMap.has(key)) {
            const editStackElement = this._editStackElementsMap.get(key);
            return editStackElement.canAppend(model);
        }
        return false;
    }
    append(model, textChanges, afterEOL, afterVersionId, afterCursorState) {
        const key = uriGetComparisonKey(model.uri);
        const editStackElement = this._editStackElementsMap.get(key);
        editStackElement.append(model, textChanges, afterEOL, afterVersionId, afterCursorState);
    }
    close() {
        this._isOpen = false;
    }
    open() {
        // cannot reopen
    }
    undo() {
        this._isOpen = false;
        for (const editStackElement of this._editStackElementsArr) {
            editStackElement.undo();
        }
    }
    redo() {
        for (const editStackElement of this._editStackElementsArr) {
            editStackElement.redo();
        }
    }
    heapSize(resource) {
        const key = uriGetComparisonKey(resource);
        if (this._editStackElementsMap.has(key)) {
            const editStackElement = this._editStackElementsMap.get(key);
            return editStackElement.heapSize();
        }
        return 0;
    }
    split() {
        return this._editStackElementsArr;
    }
    toString() {
        let result = [];
        for (const editStackElement of this._editStackElementsArr) {
            result.push(`${basename$1(editStackElement.resource)}: ${editStackElement}`);
        }
        return `{${result.join(', ')}}`;
    }
}
function getModelEOL(model) {
    const eol = model.getEOL();
    if (eol === '\n') {
        return 0 /* LF */;
    }
    else {
        return 1 /* CRLF */;
    }
}
function isEditStackElement(element) {
    if (!element) {
        return false;
    }
    return ((element instanceof SingleModelEditStackElement) || (element instanceof MultiModelEditStackElement));
}
class EditStack {
    constructor(model, undoRedoService) {
        this._model = model;
        this._undoRedoService = undoRedoService;
    }
    pushStackElement() {
        const lastElement = this._undoRedoService.getLastElement(this._model.uri);
        if (isEditStackElement(lastElement)) {
            lastElement.close();
        }
    }
    popStackElement() {
        const lastElement = this._undoRedoService.getLastElement(this._model.uri);
        if (isEditStackElement(lastElement)) {
            lastElement.open();
        }
    }
    clear() {
        this._undoRedoService.removeElements(this._model.uri);
    }
    _getOrCreateEditStackElement(beforeCursorState) {
        const lastElement = this._undoRedoService.getLastElement(this._model.uri);
        if (isEditStackElement(lastElement) && lastElement.canAppend(this._model)) {
            return lastElement;
        }
        const newElement = new SingleModelEditStackElement(this._model, beforeCursorState);
        this._undoRedoService.pushElement(newElement);
        return newElement;
    }
    pushEOL(eol) {
        const editStackElement = this._getOrCreateEditStackElement(null);
        this._model.setEOL(eol);
        editStackElement.append(this._model, [], getModelEOL(this._model), this._model.getAlternativeVersionId(), null);
    }
    pushEditOperation(beforeCursorState, editOperations, cursorStateComputer) {
        const editStackElement = this._getOrCreateEditStackElement(beforeCursorState);
        const inverseEditOperations = this._model.applyEdits(editOperations, true);
        const afterCursorState = EditStack._computeCursorState(cursorStateComputer, inverseEditOperations);
        const textChanges = inverseEditOperations.map((op, index) => ({ index: index, textChange: op.textChange }));
        textChanges.sort((a, b) => {
            if (a.textChange.oldPosition === b.textChange.oldPosition) {
                return a.index - b.index;
            }
            return a.textChange.oldPosition - b.textChange.oldPosition;
        });
        editStackElement.append(this._model, textChanges.map(op => op.textChange), getModelEOL(this._model), this._model.getAlternativeVersionId(), afterCursorState);
        return afterCursorState;
    }
    static _computeCursorState(cursorStateComputer, inverseEditOperations) {
        try {
            return cursorStateComputer ? cursorStateComputer(inverseEditOperations) : null;
        }
        catch (e) {
            onUnexpectedError(e);
            return null;
        }
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class SpacesDiffResult {
    constructor() {
        this.spacesDiff = 0;
        this.looksLikeAlignment = false;
    }
}
/**
 * Compute the diff in spaces between two line's indentation.
 */
function spacesDiff(a, aLength, b, bLength, result) {
    result.spacesDiff = 0;
    result.looksLikeAlignment = false;
    // This can go both ways (e.g.):
    //  - a: "\t"
    //  - b: "\t    "
    //  => This should count 1 tab and 4 spaces
    let i;
    for (i = 0; i < aLength && i < bLength; i++) {
        let aCharCode = a.charCodeAt(i);
        let bCharCode = b.charCodeAt(i);
        if (aCharCode !== bCharCode) {
            break;
        }
    }
    let aSpacesCnt = 0, aTabsCount = 0;
    for (let j = i; j < aLength; j++) {
        let aCharCode = a.charCodeAt(j);
        if (aCharCode === 32 /* Space */) {
            aSpacesCnt++;
        }
        else {
            aTabsCount++;
        }
    }
    let bSpacesCnt = 0, bTabsCount = 0;
    for (let j = i; j < bLength; j++) {
        let bCharCode = b.charCodeAt(j);
        if (bCharCode === 32 /* Space */) {
            bSpacesCnt++;
        }
        else {
            bTabsCount++;
        }
    }
    if (aSpacesCnt > 0 && aTabsCount > 0) {
        return;
    }
    if (bSpacesCnt > 0 && bTabsCount > 0) {
        return;
    }
    let tabsDiff = Math.abs(aTabsCount - bTabsCount);
    let spacesDiff = Math.abs(aSpacesCnt - bSpacesCnt);
    if (tabsDiff === 0) {
        // check if the indentation difference might be caused by alignment reasons
        // sometime folks like to align their code, but this should not be used as a hint
        result.spacesDiff = spacesDiff;
        if (spacesDiff > 0 && 0 <= bSpacesCnt - 1 && bSpacesCnt - 1 < a.length && bSpacesCnt < b.length) {
            if (b.charCodeAt(bSpacesCnt) !== 32 /* Space */ && a.charCodeAt(bSpacesCnt - 1) === 32 /* Space */) {
                if (a.charCodeAt(a.length - 1) === 44 /* Comma */) {
                    // This looks like an alignment desire: e.g.
                    // const a = b + c,
                    //       d = b - c;
                    result.looksLikeAlignment = true;
                }
            }
        }
        return;
    }
    if (spacesDiff % tabsDiff === 0) {
        result.spacesDiff = spacesDiff / tabsDiff;
        return;
    }
}
function guessIndentation(source, defaultTabSize, defaultInsertSpaces) {
    // Look at most at the first 10k lines
    const linesCount = Math.min(source.getLineCount(), 10000);
    let linesIndentedWithTabsCount = 0; // number of lines that contain at least one tab in indentation
    let linesIndentedWithSpacesCount = 0; // number of lines that contain only spaces in indentation
    let previousLineText = ''; // content of latest line that contained non-whitespace chars
    let previousLineIndentation = 0; // index at which latest line contained the first non-whitespace char
    const ALLOWED_TAB_SIZE_GUESSES = [2, 4, 6, 8, 3, 5, 7]; // prefer even guesses for `tabSize`, limit to [2, 8].
    const MAX_ALLOWED_TAB_SIZE_GUESS = 8; // max(ALLOWED_TAB_SIZE_GUESSES) = 8
    let spacesDiffCount = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // `tabSize` scores
    let tmp = new SpacesDiffResult();
    for (let lineNumber = 1; lineNumber <= linesCount; lineNumber++) {
        let currentLineLength = source.getLineLength(lineNumber);
        let currentLineText = source.getLineContent(lineNumber);
        // if the text buffer is chunk based, so long lines are cons-string, v8 will flattern the string when we check charCode.
        // checking charCode on chunks directly is cheaper.
        const useCurrentLineText = (currentLineLength <= 65536);
        let currentLineHasContent = false; // does `currentLineText` contain non-whitespace chars
        let currentLineIndentation = 0; // index at which `currentLineText` contains the first non-whitespace char
        let currentLineSpacesCount = 0; // count of spaces found in `currentLineText` indentation
        let currentLineTabsCount = 0; // count of tabs found in `currentLineText` indentation
        for (let j = 0, lenJ = currentLineLength; j < lenJ; j++) {
            let charCode = (useCurrentLineText ? currentLineText.charCodeAt(j) : source.getLineCharCode(lineNumber, j));
            if (charCode === 9 /* Tab */) {
                currentLineTabsCount++;
            }
            else if (charCode === 32 /* Space */) {
                currentLineSpacesCount++;
            }
            else {
                // Hit non whitespace character on this line
                currentLineHasContent = true;
                currentLineIndentation = j;
                break;
            }
        }
        // Ignore empty or only whitespace lines
        if (!currentLineHasContent) {
            continue;
        }
        if (currentLineTabsCount > 0) {
            linesIndentedWithTabsCount++;
        }
        else if (currentLineSpacesCount > 1) {
            linesIndentedWithSpacesCount++;
        }
        spacesDiff(previousLineText, previousLineIndentation, currentLineText, currentLineIndentation, tmp);
        if (tmp.looksLikeAlignment) {
            // if defaultInsertSpaces === true && the spaces count == tabSize, we may want to count it as valid indentation
            //
            // - item1
            //   - item2
            //
            // otherwise skip this line entirely
            //
            // const a = 1,
            //       b = 2;
            if (!(defaultInsertSpaces && defaultTabSize === tmp.spacesDiff)) {
                continue;
            }
        }
        let currentSpacesDiff = tmp.spacesDiff;
        if (currentSpacesDiff <= MAX_ALLOWED_TAB_SIZE_GUESS) {
            spacesDiffCount[currentSpacesDiff]++;
        }
        previousLineText = currentLineText;
        previousLineIndentation = currentLineIndentation;
    }
    let insertSpaces = defaultInsertSpaces;
    if (linesIndentedWithTabsCount !== linesIndentedWithSpacesCount) {
        insertSpaces = (linesIndentedWithTabsCount < linesIndentedWithSpacesCount);
    }
    let tabSize = defaultTabSize;
    // Guess tabSize only if inserting spaces...
    if (insertSpaces) {
        let tabSizeScore = (insertSpaces ? 0 : 0.1 * linesCount);
        // console.log("score threshold: " + tabSizeScore);
        ALLOWED_TAB_SIZE_GUESSES.forEach((possibleTabSize) => {
            let possibleTabSizeScore = spacesDiffCount[possibleTabSize];
            if (possibleTabSizeScore > tabSizeScore) {
                tabSizeScore = possibleTabSizeScore;
                tabSize = possibleTabSize;
            }
        });
        // Let a tabSize of 2 win even if it is not the maximum
        // (only in case 4 was guessed)
        if (tabSize === 4 && spacesDiffCount[4] > 0 && spacesDiffCount[2] > 0 && spacesDiffCount[2] >= spacesDiffCount[4] / 2) {
            tabSize = 2;
        }
    }
    // console.log('--------------------------');
    // console.log('linesIndentedWithTabsCount: ' + linesIndentedWithTabsCount + ', linesIndentedWithSpacesCount: ' + linesIndentedWithSpacesCount);
    // console.log('spacesDiffCount: ' + spacesDiffCount);
    // console.log('tabSize: ' + tabSize + ', tabSizeScore: ' + tabSizeScore);
    return {
        insertSpaces: insertSpaces,
        tabSize: tabSize
    };
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function getNodeColor(node) {
    return ((node.metadata & 1 /* ColorMask */) >>> 0 /* ColorOffset */);
}
function setNodeColor(node, color) {
    node.metadata = ((node.metadata & 254 /* ColorMaskInverse */) | (color << 0 /* ColorOffset */));
}
function getNodeIsVisited(node) {
    return ((node.metadata & 2 /* IsVisitedMask */) >>> 1 /* IsVisitedOffset */) === 1;
}
function setNodeIsVisited(node, value) {
    node.metadata = ((node.metadata & 253 /* IsVisitedMaskInverse */) | ((value ? 1 : 0) << 1 /* IsVisitedOffset */));
}
function getNodeIsForValidation(node) {
    return ((node.metadata & 4 /* IsForValidationMask */) >>> 2 /* IsForValidationOffset */) === 1;
}
function setNodeIsForValidation(node, value) {
    node.metadata = ((node.metadata & 251 /* IsForValidationMaskInverse */) | ((value ? 1 : 0) << 2 /* IsForValidationOffset */));
}
function getNodeIsInOverviewRuler(node) {
    return ((node.metadata & 8 /* IsInOverviewRulerMask */) >>> 3 /* IsInOverviewRulerOffset */) === 1;
}
function setNodeIsInOverviewRuler(node, value) {
    node.metadata = ((node.metadata & 247 /* IsInOverviewRulerMaskInverse */) | ((value ? 1 : 0) << 3 /* IsInOverviewRulerOffset */));
}
function getNodeStickiness(node) {
    return ((node.metadata & 48 /* StickinessMask */) >>> 4 /* StickinessOffset */);
}
function _setNodeStickiness(node, stickiness) {
    node.metadata = ((node.metadata & 207 /* StickinessMaskInverse */) | (stickiness << 4 /* StickinessOffset */));
}
function getCollapseOnReplaceEdit(node) {
    return ((node.metadata & 64 /* CollapseOnReplaceEditMask */) >>> 6 /* CollapseOnReplaceEditOffset */) === 1;
}
function setCollapseOnReplaceEdit(node, value) {
    node.metadata = ((node.metadata & 191 /* CollapseOnReplaceEditMaskInverse */) | ((value ? 1 : 0) << 6 /* CollapseOnReplaceEditOffset */));
}
class IntervalNode {
    constructor(id, start, end) {
        this.metadata = 0;
        this.parent = this;
        this.left = this;
        this.right = this;
        setNodeColor(this, 1 /* Red */);
        this.start = start;
        this.end = end;
        // FORCE_OVERFLOWING_TEST: this.delta = start;
        this.delta = 0;
        this.maxEnd = end;
        this.id = id;
        this.ownerId = 0;
        this.options = null;
        setNodeIsForValidation(this, false);
        _setNodeStickiness(this, 1 /* NeverGrowsWhenTypingAtEdges */);
        setNodeIsInOverviewRuler(this, false);
        setCollapseOnReplaceEdit(this, false);
        this.cachedVersionId = 0;
        this.cachedAbsoluteStart = start;
        this.cachedAbsoluteEnd = end;
        this.range = null;
        setNodeIsVisited(this, false);
    }
    reset(versionId, start, end, range) {
        this.start = start;
        this.end = end;
        this.maxEnd = end;
        this.cachedVersionId = versionId;
        this.cachedAbsoluteStart = start;
        this.cachedAbsoluteEnd = end;
        this.range = range;
    }
    setOptions(options) {
        this.options = options;
        let className = this.options.className;
        setNodeIsForValidation(this, (className === "squiggly-error" /* EditorErrorDecoration */
            || className === "squiggly-warning" /* EditorWarningDecoration */
            || className === "squiggly-info" /* EditorInfoDecoration */));
        _setNodeStickiness(this, this.options.stickiness);
        setNodeIsInOverviewRuler(this, (this.options.overviewRuler && this.options.overviewRuler.color) ? true : false);
        setCollapseOnReplaceEdit(this, this.options.collapseOnReplaceEdit);
    }
    setCachedOffsets(absoluteStart, absoluteEnd, cachedVersionId) {
        if (this.cachedVersionId !== cachedVersionId) {
            this.range = null;
        }
        this.cachedVersionId = cachedVersionId;
        this.cachedAbsoluteStart = absoluteStart;
        this.cachedAbsoluteEnd = absoluteEnd;
    }
    detach() {
        this.parent = null;
        this.left = null;
        this.right = null;
    }
}
const SENTINEL = new IntervalNode(null, 0, 0);
SENTINEL.parent = SENTINEL;
SENTINEL.left = SENTINEL;
SENTINEL.right = SENTINEL;
setNodeColor(SENTINEL, 0 /* Black */);
class IntervalTree {
    constructor() {
        this.root = SENTINEL;
        this.requestNormalizeDelta = false;
    }
    intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId) {
        if (this.root === SENTINEL) {
            return [];
        }
        return intervalSearch(this, start, end, filterOwnerId, filterOutValidation, cachedVersionId);
    }
    search(filterOwnerId, filterOutValidation, cachedVersionId) {
        if (this.root === SENTINEL) {
            return [];
        }
        return search(this, filterOwnerId, filterOutValidation, cachedVersionId);
    }
    /**
     * Will not set `cachedAbsoluteStart` nor `cachedAbsoluteEnd` on the returned nodes!
     */
    collectNodesFromOwner(ownerId) {
        return collectNodesFromOwner(this, ownerId);
    }
    /**
     * Will not set `cachedAbsoluteStart` nor `cachedAbsoluteEnd` on the returned nodes!
     */
    collectNodesPostOrder() {
        return collectNodesPostOrder(this);
    }
    insert(node) {
        rbTreeInsert(this, node);
        this._normalizeDeltaIfNecessary();
    }
    delete(node) {
        rbTreeDelete(this, node);
        this._normalizeDeltaIfNecessary();
    }
    resolveNode(node, cachedVersionId) {
        const initialNode = node;
        let delta = 0;
        while (node !== this.root) {
            if (node === node.parent.right) {
                delta += node.parent.delta;
            }
            node = node.parent;
        }
        const nodeStart = initialNode.start + delta;
        const nodeEnd = initialNode.end + delta;
        initialNode.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
    }
    acceptReplace(offset, length, textLength, forceMoveMarkers) {
        // Our strategy is to remove all directly impacted nodes, and then add them back to the tree.
        // (1) collect all nodes that are intersecting this edit as nodes of interest
        const nodesOfInterest = searchForEditing(this, offset, offset + length);
        // (2) remove all nodes that are intersecting this edit
        for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
            const node = nodesOfInterest[i];
            rbTreeDelete(this, node);
        }
        this._normalizeDeltaIfNecessary();
        // (3) edit all tree nodes except the nodes of interest
        noOverlapReplace(this, offset, offset + length, textLength);
        this._normalizeDeltaIfNecessary();
        // (4) edit the nodes of interest and insert them back in the tree
        for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
            const node = nodesOfInterest[i];
            node.start = node.cachedAbsoluteStart;
            node.end = node.cachedAbsoluteEnd;
            nodeAcceptEdit(node, offset, (offset + length), textLength, forceMoveMarkers);
            node.maxEnd = node.end;
            rbTreeInsert(this, node);
        }
        this._normalizeDeltaIfNecessary();
    }
    _normalizeDeltaIfNecessary() {
        if (!this.requestNormalizeDelta) {
            return;
        }
        this.requestNormalizeDelta = false;
        normalizeDelta(this);
    }
}
//#region Delta Normalization
function normalizeDelta(T) {
    let node = T.root;
    let delta = 0;
    while (node !== SENTINEL) {
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            // go left
            node = node.left;
            continue;
        }
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            // go right
            delta += node.delta;
            node = node.right;
            continue;
        }
        // handle current node
        node.start = delta + node.start;
        node.end = delta + node.end;
        node.delta = 0;
        recomputeMaxEnd(node);
        setNodeIsVisited(node, true);
        // going up from this node
        setNodeIsVisited(node.left, false);
        setNodeIsVisited(node.right, false);
        if (node === node.parent.right) {
            delta -= node.parent.delta;
        }
        node = node.parent;
    }
    setNodeIsVisited(T.root, false);
}
function adjustMarkerBeforeColumn(markerOffset, markerStickToPreviousCharacter, checkOffset, moveSemantics) {
    if (markerOffset < checkOffset) {
        return true;
    }
    if (markerOffset > checkOffset) {
        return false;
    }
    if (moveSemantics === 1 /* ForceMove */) {
        return false;
    }
    if (moveSemantics === 2 /* ForceStay */) {
        return true;
    }
    return markerStickToPreviousCharacter;
}
/**
 * This is a lot more complicated than strictly necessary to maintain the same behaviour
 * as when decorations were implemented using two markers.
 */
function nodeAcceptEdit(node, start, end, textLength, forceMoveMarkers) {
    const nodeStickiness = getNodeStickiness(node);
    const startStickToPreviousCharacter = (nodeStickiness === 0 /* AlwaysGrowsWhenTypingAtEdges */
        || nodeStickiness === 2 /* GrowsOnlyWhenTypingBefore */);
    const endStickToPreviousCharacter = (nodeStickiness === 1 /* NeverGrowsWhenTypingAtEdges */
        || nodeStickiness === 2 /* GrowsOnlyWhenTypingBefore */);
    const deletingCnt = (end - start);
    const insertingCnt = textLength;
    const commonLength = Math.min(deletingCnt, insertingCnt);
    const nodeStart = node.start;
    let startDone = false;
    const nodeEnd = node.end;
    let endDone = false;
    if (start <= nodeStart && nodeEnd <= end && getCollapseOnReplaceEdit(node)) {
        // This edit encompasses the entire decoration range
        // and the decoration has asked to become collapsed
        node.start = start;
        startDone = true;
        node.end = start;
        endDone = true;
    }
    {
        const moveSemantics = forceMoveMarkers ? 1 /* ForceMove */ : (deletingCnt > 0 ? 2 /* ForceStay */ : 0 /* MarkerDefined */);
        if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start, moveSemantics)) {
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start, moveSemantics)) {
            endDone = true;
        }
    }
    if (commonLength > 0 && !forceMoveMarkers) {
        const moveSemantics = (deletingCnt > insertingCnt ? 2 /* ForceStay */ : 0 /* MarkerDefined */);
        if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start + commonLength, moveSemantics)) {
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start + commonLength, moveSemantics)) {
            endDone = true;
        }
    }
    {
        const moveSemantics = forceMoveMarkers ? 1 /* ForceMove */ : 0 /* MarkerDefined */;
        if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, end, moveSemantics)) {
            node.start = start + insertingCnt;
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, end, moveSemantics)) {
            node.end = start + insertingCnt;
            endDone = true;
        }
    }
    // Finish
    const deltaColumn = (insertingCnt - deletingCnt);
    if (!startDone) {
        node.start = Math.max(0, nodeStart + deltaColumn);
    }
    if (!endDone) {
        node.end = Math.max(0, nodeEnd + deltaColumn);
    }
    if (node.start > node.end) {
        node.end = node.start;
    }
}
function searchForEditing(T, start, end) {
    // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
    // Now, it is known that two intervals A and B overlap only when both
    // A.low <= B.high and A.high >= B.low. When searching the trees for
    // nodes overlapping with a given interval, you can immediately skip:
    //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
    //  b) all nodes that have their maximum 'high' value below the start of the given interval.
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    let result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            // first time seeing this node
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < start) {
                // cover case b) from above
                // there is no need to search this node or its children
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                // go left
                node = node.left;
                continue;
            }
        }
        // handle current node
        nodeStart = delta + node.start;
        if (nodeStart > end) {
            // cover case a) from above
            // there is no need to search this node or its right subtree
            setNodeIsVisited(node, true);
            continue;
        }
        nodeEnd = delta + node.end;
        if (nodeEnd >= start) {
            node.setCachedOffsets(nodeStart, nodeEnd, 0);
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            // go right
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function noOverlapReplace(T, start, end, textLength) {
    // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
    // Now, it is known that two intervals A and B overlap only when both
    // A.low <= B.high and A.high >= B.low. When searching the trees for
    // nodes overlapping with a given interval, you can immediately skip:
    //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
    //  b) all nodes that have their maximum 'high' value below the start of the given interval.
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    const editDelta = (textLength - (end - start));
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            recomputeMaxEnd(node);
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            // first time seeing this node
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < start) {
                // cover case b) from above
                // there is no need to search this node or its children
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                // go left
                node = node.left;
                continue;
            }
        }
        // handle current node
        nodeStart = delta + node.start;
        if (nodeStart > end) {
            node.start += editDelta;
            node.end += editDelta;
            node.delta += editDelta;
            if (node.delta < -1073741824 /* MIN_SAFE_DELTA */ || node.delta > 1073741824 /* MAX_SAFE_DELTA */) {
                T.requestNormalizeDelta = true;
            }
            // cover case a) from above
            // there is no need to search this node or its right subtree
            setNodeIsVisited(node, true);
            continue;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            // go right
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
}
//#endregion
//#region Searching
function collectNodesFromOwner(T, ownerId) {
    let node = T.root;
    let result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            // go left
            node = node.left;
            continue;
        }
        // handle current node
        if (node.ownerId === ownerId) {
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            // go right
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function collectNodesPostOrder(T) {
    let node = T.root;
    let result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            // go left
            node = node.left;
            continue;
        }
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            // go right
            node = node.right;
            continue;
        }
        // handle current node
        result[resultLen++] = node;
        setNodeIsVisited(node, true);
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function search(T, filterOwnerId, filterOutValidation, cachedVersionId) {
    let node = T.root;
    let delta = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    let result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            // go left
            node = node.left;
            continue;
        }
        // handle current node
        nodeStart = delta + node.start;
        nodeEnd = delta + node.end;
        node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
        let include = true;
        if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
            include = false;
        }
        if (filterOutValidation && getNodeIsForValidation(node)) {
            include = false;
        }
        if (include) {
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            // go right
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function intervalSearch(T, intervalStart, intervalEnd, filterOwnerId, filterOutValidation, cachedVersionId) {
    // https://en.wikipedia.org/wiki/Interval_tree#Augmented_tree
    // Now, it is known that two intervals A and B overlap only when both
    // A.low <= B.high and A.high >= B.low. When searching the trees for
    // nodes overlapping with a given interval, you can immediately skip:
    //  a) all nodes to the right of nodes whose low value is past the end of the given interval.
    //  b) all nodes that have their maximum 'high' value below the start of the given interval.
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    let result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            // going up from this node
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            // first time seeing this node
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < intervalStart) {
                // cover case b) from above
                // there is no need to search this node or its children
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                // go left
                node = node.left;
                continue;
            }
        }
        // handle current node
        nodeStart = delta + node.start;
        if (nodeStart > intervalEnd) {
            // cover case a) from above
            // there is no need to search this node or its right subtree
            setNodeIsVisited(node, true);
            continue;
        }
        nodeEnd = delta + node.end;
        if (nodeEnd >= intervalStart) {
            // There is overlap
            node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
            let include = true;
            if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                include = false;
            }
            if (filterOutValidation && getNodeIsForValidation(node)) {
                include = false;
            }
            if (include) {
                result[resultLen++] = node;
            }
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            // go right
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
//#endregion
//#region Insertion
function rbTreeInsert(T, newNode) {
    if (T.root === SENTINEL) {
        newNode.parent = SENTINEL;
        newNode.left = SENTINEL;
        newNode.right = SENTINEL;
        setNodeColor(newNode, 0 /* Black */);
        T.root = newNode;
        return T.root;
    }
    treeInsert(T, newNode);
    recomputeMaxEndWalkToRoot(newNode.parent);
    // repair tree
    let x = newNode;
    while (x !== T.root && getNodeColor(x.parent) === 1 /* Red */) {
        if (x.parent === x.parent.parent.left) {
            const y = x.parent.parent.right;
            if (getNodeColor(y) === 1 /* Red */) {
                setNodeColor(x.parent, 0 /* Black */);
                setNodeColor(y, 0 /* Black */);
                setNodeColor(x.parent.parent, 1 /* Red */);
                x = x.parent.parent;
            }
            else {
                if (x === x.parent.right) {
                    x = x.parent;
                    leftRotate$1(T, x);
                }
                setNodeColor(x.parent, 0 /* Black */);
                setNodeColor(x.parent.parent, 1 /* Red */);
                rightRotate(T, x.parent.parent);
            }
        }
        else {
            const y = x.parent.parent.left;
            if (getNodeColor(y) === 1 /* Red */) {
                setNodeColor(x.parent, 0 /* Black */);
                setNodeColor(y, 0 /* Black */);
                setNodeColor(x.parent.parent, 1 /* Red */);
                x = x.parent.parent;
            }
            else {
                if (x === x.parent.left) {
                    x = x.parent;
                    rightRotate(T, x);
                }
                setNodeColor(x.parent, 0 /* Black */);
                setNodeColor(x.parent.parent, 1 /* Red */);
                leftRotate$1(T, x.parent.parent);
            }
        }
    }
    setNodeColor(T.root, 0 /* Black */);
    return newNode;
}
function treeInsert(T, z) {
    let delta = 0;
    let x = T.root;
    const zAbsoluteStart = z.start;
    const zAbsoluteEnd = z.end;
    while (true) {
        const cmp = intervalCompare(zAbsoluteStart, zAbsoluteEnd, x.start + delta, x.end + delta);
        if (cmp < 0) {
            // this node should be inserted to the left
            // => it is not affected by the node's delta
            if (x.left === SENTINEL) {
                z.start -= delta;
                z.end -= delta;
                z.maxEnd -= delta;
                x.left = z;
                break;
            }
            else {
                x = x.left;
            }
        }
        else {
            // this node should be inserted to the right
            // => it is not affected by the node's delta
            if (x.right === SENTINEL) {
                z.start -= (delta + x.delta);
                z.end -= (delta + x.delta);
                z.maxEnd -= (delta + x.delta);
                x.right = z;
                break;
            }
            else {
                delta += x.delta;
                x = x.right;
            }
        }
    }
    z.parent = x;
    z.left = SENTINEL;
    z.right = SENTINEL;
    setNodeColor(z, 1 /* Red */);
}
//#endregion
//#region Deletion
function rbTreeDelete(T, z) {
    let x;
    let y;
    // RB-DELETE except we don't swap z and y in case c)
    // i.e. we always delete what's pointed at by z.
    if (z.left === SENTINEL) {
        x = z.right;
        y = z;
        // x's delta is no longer influenced by z's delta
        x.delta += z.delta;
        if (x.delta < -1073741824 /* MIN_SAFE_DELTA */ || x.delta > 1073741824 /* MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
        x.start += z.delta;
        x.end += z.delta;
    }
    else if (z.right === SENTINEL) {
        x = z.left;
        y = z;
    }
    else {
        y = leftest(z.right);
        x = y.right;
        // y's delta is no longer influenced by z's delta,
        // but we don't want to walk the entire right-hand-side subtree of x.
        // we therefore maintain z's delta in y, and adjust only x
        x.start += y.delta;
        x.end += y.delta;
        x.delta += y.delta;
        if (x.delta < -1073741824 /* MIN_SAFE_DELTA */ || x.delta > 1073741824 /* MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
        y.start += z.delta;
        y.end += z.delta;
        y.delta = z.delta;
        if (y.delta < -1073741824 /* MIN_SAFE_DELTA */ || y.delta > 1073741824 /* MAX_SAFE_DELTA */) {
            T.requestNormalizeDelta = true;
        }
    }
    if (y === T.root) {
        T.root = x;
        setNodeColor(x, 0 /* Black */);
        z.detach();
        resetSentinel();
        recomputeMaxEnd(x);
        T.root.parent = SENTINEL;
        return;
    }
    let yWasRed = (getNodeColor(y) === 1 /* Red */);
    if (y === y.parent.left) {
        y.parent.left = x;
    }
    else {
        y.parent.right = x;
    }
    if (y === z) {
        x.parent = y.parent;
    }
    else {
        if (y.parent === z) {
            x.parent = y;
        }
        else {
            x.parent = y.parent;
        }
        y.left = z.left;
        y.right = z.right;
        y.parent = z.parent;
        setNodeColor(y, getNodeColor(z));
        if (z === T.root) {
            T.root = y;
        }
        else {
            if (z === z.parent.left) {
                z.parent.left = y;
            }
            else {
                z.parent.right = y;
            }
        }
        if (y.left !== SENTINEL) {
            y.left.parent = y;
        }
        if (y.right !== SENTINEL) {
            y.right.parent = y;
        }
    }
    z.detach();
    if (yWasRed) {
        recomputeMaxEndWalkToRoot(x.parent);
        if (y !== z) {
            recomputeMaxEndWalkToRoot(y);
            recomputeMaxEndWalkToRoot(y.parent);
        }
        resetSentinel();
        return;
    }
    recomputeMaxEndWalkToRoot(x);
    recomputeMaxEndWalkToRoot(x.parent);
    if (y !== z) {
        recomputeMaxEndWalkToRoot(y);
        recomputeMaxEndWalkToRoot(y.parent);
    }
    // RB-DELETE-FIXUP
    let w;
    while (x !== T.root && getNodeColor(x) === 0 /* Black */) {
        if (x === x.parent.left) {
            w = x.parent.right;
            if (getNodeColor(w) === 1 /* Red */) {
                setNodeColor(w, 0 /* Black */);
                setNodeColor(x.parent, 1 /* Red */);
                leftRotate$1(T, x.parent);
                w = x.parent.right;
            }
            if (getNodeColor(w.left) === 0 /* Black */ && getNodeColor(w.right) === 0 /* Black */) {
                setNodeColor(w, 1 /* Red */);
                x = x.parent;
            }
            else {
                if (getNodeColor(w.right) === 0 /* Black */) {
                    setNodeColor(w.left, 0 /* Black */);
                    setNodeColor(w, 1 /* Red */);
                    rightRotate(T, w);
                    w = x.parent.right;
                }
                setNodeColor(w, getNodeColor(x.parent));
                setNodeColor(x.parent, 0 /* Black */);
                setNodeColor(w.right, 0 /* Black */);
                leftRotate$1(T, x.parent);
                x = T.root;
            }
        }
        else {
            w = x.parent.left;
            if (getNodeColor(w) === 1 /* Red */) {
                setNodeColor(w, 0 /* Black */);
                setNodeColor(x.parent, 1 /* Red */);
                rightRotate(T, x.parent);
                w = x.parent.left;
            }
            if (getNodeColor(w.left) === 0 /* Black */ && getNodeColor(w.right) === 0 /* Black */) {
                setNodeColor(w, 1 /* Red */);
                x = x.parent;
            }
            else {
                if (getNodeColor(w.left) === 0 /* Black */) {
                    setNodeColor(w.right, 0 /* Black */);
                    setNodeColor(w, 1 /* Red */);
                    leftRotate$1(T, w);
                    w = x.parent.left;
                }
                setNodeColor(w, getNodeColor(x.parent));
                setNodeColor(x.parent, 0 /* Black */);
                setNodeColor(w.left, 0 /* Black */);
                rightRotate(T, x.parent);
                x = T.root;
            }
        }
    }
    setNodeColor(x, 0 /* Black */);
    resetSentinel();
}
function leftest(node) {
    while (node.left !== SENTINEL) {
        node = node.left;
    }
    return node;
}
function resetSentinel() {
    SENTINEL.parent = SENTINEL;
    SENTINEL.delta = 0; // optional
    SENTINEL.start = 0; // optional
    SENTINEL.end = 0; // optional
}
//#endregion
//#region Rotations
function leftRotate$1(T, x) {
    const y = x.right; // set y.
    y.delta += x.delta; // y's delta is no longer influenced by x's delta
    if (y.delta < -1073741824 /* MIN_SAFE_DELTA */ || y.delta > 1073741824 /* MAX_SAFE_DELTA */) {
        T.requestNormalizeDelta = true;
    }
    y.start += x.delta;
    y.end += x.delta;
    x.right = y.left; // turn y's left subtree into x's right subtree.
    if (y.left !== SENTINEL) {
        y.left.parent = x;
    }
    y.parent = x.parent; // link x's parent to y.
    if (x.parent === SENTINEL) {
        T.root = y;
    }
    else if (x === x.parent.left) {
        x.parent.left = y;
    }
    else {
        x.parent.right = y;
    }
    y.left = x; // put x on y's left.
    x.parent = y;
    recomputeMaxEnd(x);
    recomputeMaxEnd(y);
}
function rightRotate(T, y) {
    const x = y.left;
    y.delta -= x.delta;
    if (y.delta < -1073741824 /* MIN_SAFE_DELTA */ || y.delta > 1073741824 /* MAX_SAFE_DELTA */) {
        T.requestNormalizeDelta = true;
    }
    y.start -= x.delta;
    y.end -= x.delta;
    y.left = x.right;
    if (x.right !== SENTINEL) {
        x.right.parent = y;
    }
    x.parent = y.parent;
    if (y.parent === SENTINEL) {
        T.root = x;
    }
    else if (y === y.parent.right) {
        y.parent.right = x;
    }
    else {
        y.parent.left = x;
    }
    x.right = y;
    y.parent = x;
    recomputeMaxEnd(y);
    recomputeMaxEnd(x);
}
//#endregion
//#region max end computation
function computeMaxEnd(node) {
    let maxEnd = node.end;
    if (node.left !== SENTINEL) {
        const leftMaxEnd = node.left.maxEnd;
        if (leftMaxEnd > maxEnd) {
            maxEnd = leftMaxEnd;
        }
    }
    if (node.right !== SENTINEL) {
        const rightMaxEnd = node.right.maxEnd + node.delta;
        if (rightMaxEnd > maxEnd) {
            maxEnd = rightMaxEnd;
        }
    }
    return maxEnd;
}
function recomputeMaxEnd(node) {
    node.maxEnd = computeMaxEnd(node);
}
function recomputeMaxEndWalkToRoot(node) {
    while (node !== SENTINEL) {
        const maxEnd = computeMaxEnd(node);
        if (node.maxEnd === maxEnd) {
            // no need to go further
            return;
        }
        node.maxEnd = maxEnd;
        node = node.parent;
    }
}
//#endregion
//#region utils
function intervalCompare(aStart, aEnd, bStart, bEnd) {
    if (aStart === bStart) {
        return aEnd - bEnd;
    }
    return aStart - bStart;
}
//#endregion

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class TreeNode {
    constructor(piece, color) {
        this.piece = piece;
        this.color = color;
        this.size_left = 0;
        this.lf_left = 0;
        this.parent = this;
        this.left = this;
        this.right = this;
    }
    next() {
        if (this.right !== SENTINEL$1) {
            return leftest$1(this.right);
        }
        let node = this;
        while (node.parent !== SENTINEL$1) {
            if (node.parent.left === node) {
                break;
            }
            node = node.parent;
        }
        if (node.parent === SENTINEL$1) {
            return SENTINEL$1;
        }
        else {
            return node.parent;
        }
    }
    prev() {
        if (this.left !== SENTINEL$1) {
            return righttest(this.left);
        }
        let node = this;
        while (node.parent !== SENTINEL$1) {
            if (node.parent.right === node) {
                break;
            }
            node = node.parent;
        }
        if (node.parent === SENTINEL$1) {
            return SENTINEL$1;
        }
        else {
            return node.parent;
        }
    }
    detach() {
        this.parent = null;
        this.left = null;
        this.right = null;
    }
}
const SENTINEL$1 = new TreeNode(null, 0 /* Black */);
SENTINEL$1.parent = SENTINEL$1;
SENTINEL$1.left = SENTINEL$1;
SENTINEL$1.right = SENTINEL$1;
SENTINEL$1.color = 0 /* Black */;
function leftest$1(node) {
    while (node.left !== SENTINEL$1) {
        node = node.left;
    }
    return node;
}
function righttest(node) {
    while (node.right !== SENTINEL$1) {
        node = node.right;
    }
    return node;
}
function calculateSize(node) {
    if (node === SENTINEL$1) {
        return 0;
    }
    return node.size_left + node.piece.length + calculateSize(node.right);
}
function calculateLF(node) {
    if (node === SENTINEL$1) {
        return 0;
    }
    return node.lf_left + node.piece.lineFeedCnt + calculateLF(node.right);
}
function resetSentinel$1() {
    SENTINEL$1.parent = SENTINEL$1;
}
function leftRotate$2(tree, x) {
    let y = x.right;
    // fix size_left
    y.size_left += x.size_left + (x.piece ? x.piece.length : 0);
    y.lf_left += x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
    x.right = y.left;
    if (y.left !== SENTINEL$1) {
        y.left.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === SENTINEL$1) {
        tree.root = y;
    }
    else if (x.parent.left === x) {
        x.parent.left = y;
    }
    else {
        x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
}
function rightRotate$1(tree, y) {
    let x = y.left;
    y.left = x.right;
    if (x.right !== SENTINEL$1) {
        x.right.parent = y;
    }
    x.parent = y.parent;
    // fix size_left
    y.size_left -= x.size_left + (x.piece ? x.piece.length : 0);
    y.lf_left -= x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
    if (y.parent === SENTINEL$1) {
        tree.root = x;
    }
    else if (y === y.parent.right) {
        y.parent.right = x;
    }
    else {
        y.parent.left = x;
    }
    x.right = y;
    y.parent = x;
}
function rbDelete(tree, z) {
    let x;
    let y;
    if (z.left === SENTINEL$1) {
        y = z;
        x = y.right;
    }
    else if (z.right === SENTINEL$1) {
        y = z;
        x = y.left;
    }
    else {
        y = leftest$1(z.right);
        x = y.right;
    }
    if (y === tree.root) {
        tree.root = x;
        // if x is null, we are removing the only node
        x.color = 0 /* Black */;
        z.detach();
        resetSentinel$1();
        tree.root.parent = SENTINEL$1;
        return;
    }
    let yWasRed = (y.color === 1 /* Red */);
    if (y === y.parent.left) {
        y.parent.left = x;
    }
    else {
        y.parent.right = x;
    }
    if (y === z) {
        x.parent = y.parent;
        recomputeTreeMetadata(tree, x);
    }
    else {
        if (y.parent === z) {
            x.parent = y;
        }
        else {
            x.parent = y.parent;
        }
        // as we make changes to x's hierarchy, update size_left of subtree first
        recomputeTreeMetadata(tree, x);
        y.left = z.left;
        y.right = z.right;
        y.parent = z.parent;
        y.color = z.color;
        if (z === tree.root) {
            tree.root = y;
        }
        else {
            if (z === z.parent.left) {
                z.parent.left = y;
            }
            else {
                z.parent.right = y;
            }
        }
        if (y.left !== SENTINEL$1) {
            y.left.parent = y;
        }
        if (y.right !== SENTINEL$1) {
            y.right.parent = y;
        }
        // update metadata
        // we replace z with y, so in this sub tree, the length change is z.item.length
        y.size_left = z.size_left;
        y.lf_left = z.lf_left;
        recomputeTreeMetadata(tree, y);
    }
    z.detach();
    if (x.parent.left === x) {
        let newSizeLeft = calculateSize(x);
        let newLFLeft = calculateLF(x);
        if (newSizeLeft !== x.parent.size_left || newLFLeft !== x.parent.lf_left) {
            let delta = newSizeLeft - x.parent.size_left;
            let lf_delta = newLFLeft - x.parent.lf_left;
            x.parent.size_left = newSizeLeft;
            x.parent.lf_left = newLFLeft;
            updateTreeMetadata(tree, x.parent, delta, lf_delta);
        }
    }
    recomputeTreeMetadata(tree, x.parent);
    if (yWasRed) {
        resetSentinel$1();
        return;
    }
    // RB-DELETE-FIXUP
    let w;
    while (x !== tree.root && x.color === 0 /* Black */) {
        if (x === x.parent.left) {
            w = x.parent.right;
            if (w.color === 1 /* Red */) {
                w.color = 0 /* Black */;
                x.parent.color = 1 /* Red */;
                leftRotate$2(tree, x.parent);
                w = x.parent.right;
            }
            if (w.left.color === 0 /* Black */ && w.right.color === 0 /* Black */) {
                w.color = 1 /* Red */;
                x = x.parent;
            }
            else {
                if (w.right.color === 0 /* Black */) {
                    w.left.color = 0 /* Black */;
                    w.color = 1 /* Red */;
                    rightRotate$1(tree, w);
                    w = x.parent.right;
                }
                w.color = x.parent.color;
                x.parent.color = 0 /* Black */;
                w.right.color = 0 /* Black */;
                leftRotate$2(tree, x.parent);
                x = tree.root;
            }
        }
        else {
            w = x.parent.left;
            if (w.color === 1 /* Red */) {
                w.color = 0 /* Black */;
                x.parent.color = 1 /* Red */;
                rightRotate$1(tree, x.parent);
                w = x.parent.left;
            }
            if (w.left.color === 0 /* Black */ && w.right.color === 0 /* Black */) {
                w.color = 1 /* Red */;
                x = x.parent;
            }
            else {
                if (w.left.color === 0 /* Black */) {
                    w.right.color = 0 /* Black */;
                    w.color = 1 /* Red */;
                    leftRotate$2(tree, w);
                    w = x.parent.left;
                }
                w.color = x.parent.color;
                x.parent.color = 0 /* Black */;
                w.left.color = 0 /* Black */;
                rightRotate$1(tree, x.parent);
                x = tree.root;
            }
        }
    }
    x.color = 0 /* Black */;
    resetSentinel$1();
}
function fixInsert(tree, x) {
    recomputeTreeMetadata(tree, x);
    while (x !== tree.root && x.parent.color === 1 /* Red */) {
        if (x.parent === x.parent.parent.left) {
            const y = x.parent.parent.right;
            if (y.color === 1 /* Red */) {
                x.parent.color = 0 /* Black */;
                y.color = 0 /* Black */;
                x.parent.parent.color = 1 /* Red */;
                x = x.parent.parent;
            }
            else {
                if (x === x.parent.right) {
                    x = x.parent;
                    leftRotate$2(tree, x);
                }
                x.parent.color = 0 /* Black */;
                x.parent.parent.color = 1 /* Red */;
                rightRotate$1(tree, x.parent.parent);
            }
        }
        else {
            const y = x.parent.parent.left;
            if (y.color === 1 /* Red */) {
                x.parent.color = 0 /* Black */;
                y.color = 0 /* Black */;
                x.parent.parent.color = 1 /* Red */;
                x = x.parent.parent;
            }
            else {
                if (x === x.parent.left) {
                    x = x.parent;
                    rightRotate$1(tree, x);
                }
                x.parent.color = 0 /* Black */;
                x.parent.parent.color = 1 /* Red */;
                leftRotate$2(tree, x.parent.parent);
            }
        }
    }
    tree.root.color = 0 /* Black */;
}
function updateTreeMetadata(tree, x, delta, lineFeedCntDelta) {
    // node length change or line feed count change
    while (x !== tree.root && x !== SENTINEL$1) {
        if (x.parent.left === x) {
            x.parent.size_left += delta;
            x.parent.lf_left += lineFeedCntDelta;
        }
        x = x.parent;
    }
}
function recomputeTreeMetadata(tree, x) {
    let delta = 0;
    let lf_delta = 0;
    if (x === tree.root) {
        return;
    }
    if (delta === 0) {
        // go upwards till the node whose left subtree is changed.
        while (x !== tree.root && x === x.parent.right) {
            x = x.parent;
        }
        if (x === tree.root) {
            // well, it means we add a node to the end (inorder)
            return;
        }
        // x is the node whose right subtree is changed.
        x = x.parent;
        delta = calculateSize(x.left) - x.size_left;
        lf_delta = calculateLF(x.left) - x.lf_left;
        x.size_left += delta;
        x.lf_left += lf_delta;
    }
    // go upwards till root. O(logN)
    while (x !== tree.root && (delta !== 0 || lf_delta !== 0)) {
        if (x.parent.left === x) {
            x.parent.size_left += delta;
            x.parent.lf_left += lf_delta;
        }
        x = x.parent;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class WordCharacterClassifier extends CharacterClassifier {
    constructor(wordSeparators) {
        super(0 /* Regular */);
        for (let i = 0, len = wordSeparators.length; i < len; i++) {
            this.set(wordSeparators.charCodeAt(i), 2 /* WordSeparator */);
        }
        this.set(32 /* Space */, 1 /* Whitespace */);
        this.set(9 /* Tab */, 1 /* Whitespace */);
    }
}
function once(computeFn) {
    let cache = {}; // TODO@Alex unbounded cache
    return (input) => {
        if (!cache.hasOwnProperty(input)) {
            cache[input] = computeFn(input);
        }
        return cache[input];
    };
}
const getMapForWordSeparators = once((input) => new WordCharacterClassifier(input));

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const LIMIT_FIND_COUNT = 999;
class SearchParams {
    constructor(searchString, isRegex, matchCase, wordSeparators) {
        this.searchString = searchString;
        this.isRegex = isRegex;
        this.matchCase = matchCase;
        this.wordSeparators = wordSeparators;
    }
    parseSearchRequest() {
        if (this.searchString === '') {
            return null;
        }
        // Try to create a RegExp out of the params
        let multiline;
        if (this.isRegex) {
            multiline = isMultilineRegexSource(this.searchString);
        }
        else {
            multiline = (this.searchString.indexOf('\n') >= 0);
        }
        let regex = null;
        try {
            regex = createRegExp(this.searchString, this.isRegex, {
                matchCase: this.matchCase,
                wholeWord: false,
                multiline: multiline,
                global: true,
                unicode: true
            });
        }
        catch (err) {
            return null;
        }
        if (!regex) {
            return null;
        }
        let canUseSimpleSearch = (!this.isRegex && !multiline);
        if (canUseSimpleSearch && this.searchString.toLowerCase() !== this.searchString.toUpperCase()) {
            // casing might make a difference
            canUseSimpleSearch = this.matchCase;
        }
        return new SearchData(regex, this.wordSeparators ? getMapForWordSeparators(this.wordSeparators) : null, canUseSimpleSearch ? this.searchString : null);
    }
}
function isMultilineRegexSource(searchString) {
    if (!searchString || searchString.length === 0) {
        return false;
    }
    for (let i = 0, len = searchString.length; i < len; i++) {
        const chCode = searchString.charCodeAt(i);
        if (chCode === 92 /* Backslash */) {
            // move to next char
            i++;
            if (i >= len) {
                // string ends with a \
                break;
            }
            const nextChCode = searchString.charCodeAt(i);
            if (nextChCode === 110 /* n */ || nextChCode === 114 /* r */ || nextChCode === 87 /* W */ || nextChCode === 119 /* w */) {
                return true;
            }
        }
    }
    return false;
}
class SearchData {
    constructor(regex, wordSeparators, simpleSearch) {
        this.regex = regex;
        this.wordSeparators = wordSeparators;
        this.simpleSearch = simpleSearch;
    }
}
function createFindMatch(range, rawMatches, captureMatches) {
    if (!captureMatches) {
        return new FindMatch(range, null);
    }
    let matches = [];
    for (let i = 0, len = rawMatches.length; i < len; i++) {
        matches[i] = rawMatches[i];
    }
    return new FindMatch(range, matches);
}
class LineFeedCounter {
    constructor(text) {
        let lineFeedsOffsets = [];
        let lineFeedsOffsetsLen = 0;
        for (let i = 0, textLen = text.length; i < textLen; i++) {
            if (text.charCodeAt(i) === 10 /* LineFeed */) {
                lineFeedsOffsets[lineFeedsOffsetsLen++] = i;
            }
        }
        this._lineFeedsOffsets = lineFeedsOffsets;
    }
    findLineFeedCountBeforeOffset(offset) {
        const lineFeedsOffsets = this._lineFeedsOffsets;
        let min = 0;
        let max = lineFeedsOffsets.length - 1;
        if (max === -1) {
            // no line feeds
            return 0;
        }
        if (offset <= lineFeedsOffsets[0]) {
            // before first line feed
            return 0;
        }
        while (min < max) {
            const mid = min + ((max - min) / 2 >> 0);
            if (lineFeedsOffsets[mid] >= offset) {
                max = mid - 1;
            }
            else {
                if (lineFeedsOffsets[mid + 1] >= offset) {
                    // bingo!
                    min = mid;
                    max = mid;
                }
                else {
                    min = mid + 1;
                }
            }
        }
        return min + 1;
    }
}
class TextModelSearch {
    static findMatches(model, searchParams, searchRange, captureMatches, limitResultCount) {
        const searchData = searchParams.parseSearchRequest();
        if (!searchData) {
            return [];
        }
        if (searchData.regex.multiline) {
            return this._doFindMatchesMultiline(model, searchRange, new Searcher(searchData.wordSeparators, searchData.regex), captureMatches, limitResultCount);
        }
        return this._doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount);
    }
    /**
     * Multiline search always executes on the lines concatenated with \n.
     * We must therefore compensate for the count of \n in case the model is CRLF
     */
    static _getMultilineMatchRange(model, deltaOffset, text, lfCounter, matchIndex, match0) {
        let startOffset;
        let lineFeedCountBeforeMatch = 0;
        if (lfCounter) {
            lineFeedCountBeforeMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex);
            startOffset = deltaOffset + matchIndex + lineFeedCountBeforeMatch /* add as many \r as there were \n */;
        }
        else {
            startOffset = deltaOffset + matchIndex;
        }
        let endOffset;
        if (lfCounter) {
            let lineFeedCountBeforeEndOfMatch = lfCounter.findLineFeedCountBeforeOffset(matchIndex + match0.length);
            let lineFeedCountInMatch = lineFeedCountBeforeEndOfMatch - lineFeedCountBeforeMatch;
            endOffset = startOffset + match0.length + lineFeedCountInMatch /* add as many \r as there were \n */;
        }
        else {
            endOffset = startOffset + match0.length;
        }
        const startPosition = model.getPositionAt(startOffset);
        const endPosition = model.getPositionAt(endOffset);
        return new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
    }
    static _doFindMatchesMultiline(model, searchRange, searcher, captureMatches, limitResultCount) {
        const deltaOffset = model.getOffsetAt(searchRange.getStartPosition());
        // We always execute multiline search over the lines joined with \n
        // This makes it that \n will match the EOL for both CRLF and LF models
        // We compensate for offset errors in `_getMultilineMatchRange`
        const text = model.getValueInRange(searchRange, 1 /* LF */);
        const lfCounter = (model.getEOL() === '\r\n' ? new LineFeedCounter(text) : null);
        const result = [];
        let counter = 0;
        let m;
        searcher.reset(0);
        while ((m = searcher.next(text))) {
            result[counter++] = createFindMatch(this._getMultilineMatchRange(model, deltaOffset, text, lfCounter, m.index, m[0]), m, captureMatches);
            if (counter >= limitResultCount) {
                return result;
            }
        }
        return result;
    }
    static _doFindMatchesLineByLine(model, searchRange, searchData, captureMatches, limitResultCount) {
        const result = [];
        let resultLen = 0;
        // Early case for a search range that starts & stops on the same line number
        if (searchRange.startLineNumber === searchRange.endLineNumber) {
            const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1, searchRange.endColumn - 1);
            resultLen = this._findMatchesInLine(searchData, text, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
            return result;
        }
        // Collect results from first line
        const text = model.getLineContent(searchRange.startLineNumber).substring(searchRange.startColumn - 1);
        resultLen = this._findMatchesInLine(searchData, text, searchRange.startLineNumber, searchRange.startColumn - 1, resultLen, result, captureMatches, limitResultCount);
        // Collect results from middle lines
        for (let lineNumber = searchRange.startLineNumber + 1; lineNumber < searchRange.endLineNumber && resultLen < limitResultCount; lineNumber++) {
            resultLen = this._findMatchesInLine(searchData, model.getLineContent(lineNumber), lineNumber, 0, resultLen, result, captureMatches, limitResultCount);
        }
        // Collect results from last line
        if (resultLen < limitResultCount) {
            const text = model.getLineContent(searchRange.endLineNumber).substring(0, searchRange.endColumn - 1);
            resultLen = this._findMatchesInLine(searchData, text, searchRange.endLineNumber, 0, resultLen, result, captureMatches, limitResultCount);
        }
        return result;
    }
    static _findMatchesInLine(searchData, text, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
        const wordSeparators = searchData.wordSeparators;
        if (!captureMatches && searchData.simpleSearch) {
            const searchString = searchData.simpleSearch;
            const searchStringLen = searchString.length;
            const textLength = text.length;
            let lastMatchIndex = -searchStringLen;
            while ((lastMatchIndex = text.indexOf(searchString, lastMatchIndex + searchStringLen)) !== -1) {
                if (!wordSeparators || isValidMatch(wordSeparators, text, textLength, lastMatchIndex, searchStringLen)) {
                    result[resultLen++] = new FindMatch(new Range(lineNumber, lastMatchIndex + 1 + deltaOffset, lineNumber, lastMatchIndex + 1 + searchStringLen + deltaOffset), null);
                    if (resultLen >= limitResultCount) {
                        return resultLen;
                    }
                }
            }
            return resultLen;
        }
        const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
        let m;
        // Reset regex to search from the beginning
        searcher.reset(0);
        do {
            m = searcher.next(text);
            if (m) {
                result[resultLen++] = createFindMatch(new Range(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset), m, captureMatches);
                if (resultLen >= limitResultCount) {
                    return resultLen;
                }
            }
        } while (m);
        return resultLen;
    }
    static findNextMatch(model, searchParams, searchStart, captureMatches) {
        const searchData = searchParams.parseSearchRequest();
        if (!searchData) {
            return null;
        }
        const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
        if (searchData.regex.multiline) {
            return this._doFindNextMatchMultiline(model, searchStart, searcher, captureMatches);
        }
        return this._doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches);
    }
    static _doFindNextMatchMultiline(model, searchStart, searcher, captureMatches) {
        const searchTextStart = new Position(searchStart.lineNumber, 1);
        const deltaOffset = model.getOffsetAt(searchTextStart);
        const lineCount = model.getLineCount();
        // We always execute multiline search over the lines joined with \n
        // This makes it that \n will match the EOL for both CRLF and LF models
        // We compensate for offset errors in `_getMultilineMatchRange`
        const text = model.getValueInRange(new Range(searchTextStart.lineNumber, searchTextStart.column, lineCount, model.getLineMaxColumn(lineCount)), 1 /* LF */);
        const lfCounter = (model.getEOL() === '\r\n' ? new LineFeedCounter(text) : null);
        searcher.reset(searchStart.column - 1);
        let m = searcher.next(text);
        if (m) {
            return createFindMatch(this._getMultilineMatchRange(model, deltaOffset, text, lfCounter, m.index, m[0]), m, captureMatches);
        }
        if (searchStart.lineNumber !== 1 || searchStart.column !== 1) {
            // Try again from the top
            return this._doFindNextMatchMultiline(model, new Position(1, 1), searcher, captureMatches);
        }
        return null;
    }
    static _doFindNextMatchLineByLine(model, searchStart, searcher, captureMatches) {
        const lineCount = model.getLineCount();
        const startLineNumber = searchStart.lineNumber;
        // Look in first line
        const text = model.getLineContent(startLineNumber);
        const r = this._findFirstMatchInLine(searcher, text, startLineNumber, searchStart.column, captureMatches);
        if (r) {
            return r;
        }
        for (let i = 1; i <= lineCount; i++) {
            const lineIndex = (startLineNumber + i - 1) % lineCount;
            const text = model.getLineContent(lineIndex + 1);
            const r = this._findFirstMatchInLine(searcher, text, lineIndex + 1, 1, captureMatches);
            if (r) {
                return r;
            }
        }
        return null;
    }
    static _findFirstMatchInLine(searcher, text, lineNumber, fromColumn, captureMatches) {
        // Set regex to search from column
        searcher.reset(fromColumn - 1);
        const m = searcher.next(text);
        if (m) {
            return createFindMatch(new Range(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
        }
        return null;
    }
    static findPreviousMatch(model, searchParams, searchStart, captureMatches) {
        const searchData = searchParams.parseSearchRequest();
        if (!searchData) {
            return null;
        }
        const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
        if (searchData.regex.multiline) {
            return this._doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches);
        }
        return this._doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches);
    }
    static _doFindPreviousMatchMultiline(model, searchStart, searcher, captureMatches) {
        const matches = this._doFindMatchesMultiline(model, new Range(1, 1, searchStart.lineNumber, searchStart.column), searcher, captureMatches, 10 * LIMIT_FIND_COUNT);
        if (matches.length > 0) {
            return matches[matches.length - 1];
        }
        const lineCount = model.getLineCount();
        if (searchStart.lineNumber !== lineCount || searchStart.column !== model.getLineMaxColumn(lineCount)) {
            // Try again with all content
            return this._doFindPreviousMatchMultiline(model, new Position(lineCount, model.getLineMaxColumn(lineCount)), searcher, captureMatches);
        }
        return null;
    }
    static _doFindPreviousMatchLineByLine(model, searchStart, searcher, captureMatches) {
        const lineCount = model.getLineCount();
        const startLineNumber = searchStart.lineNumber;
        // Look in first line
        const text = model.getLineContent(startLineNumber).substring(0, searchStart.column - 1);
        const r = this._findLastMatchInLine(searcher, text, startLineNumber, captureMatches);
        if (r) {
            return r;
        }
        for (let i = 1; i <= lineCount; i++) {
            const lineIndex = (lineCount + startLineNumber - i - 1) % lineCount;
            const text = model.getLineContent(lineIndex + 1);
            const r = this._findLastMatchInLine(searcher, text, lineIndex + 1, captureMatches);
            if (r) {
                return r;
            }
        }
        return null;
    }
    static _findLastMatchInLine(searcher, text, lineNumber, captureMatches) {
        let bestResult = null;
        let m;
        searcher.reset(0);
        while ((m = searcher.next(text))) {
            bestResult = createFindMatch(new Range(lineNumber, m.index + 1, lineNumber, m.index + 1 + m[0].length), m, captureMatches);
        }
        return bestResult;
    }
}
function leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
    if (matchStartIndex === 0) {
        // Match starts at start of string
        return true;
    }
    const charBefore = text.charCodeAt(matchStartIndex - 1);
    if (wordSeparators.get(charBefore) !== 0 /* Regular */) {
        // The character before the match is a word separator
        return true;
    }
    if (charBefore === 13 /* CarriageReturn */ || charBefore === 10 /* LineFeed */) {
        // The character before the match is line break or carriage return.
        return true;
    }
    if (matchLength > 0) {
        const firstCharInMatch = text.charCodeAt(matchStartIndex);
        if (wordSeparators.get(firstCharInMatch) !== 0 /* Regular */) {
            // The first character inside the match is a word separator
            return true;
        }
    }
    return false;
}
function rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength) {
    if (matchStartIndex + matchLength === textLength) {
        // Match ends at end of string
        return true;
    }
    const charAfter = text.charCodeAt(matchStartIndex + matchLength);
    if (wordSeparators.get(charAfter) !== 0 /* Regular */) {
        // The character after the match is a word separator
        return true;
    }
    if (charAfter === 13 /* CarriageReturn */ || charAfter === 10 /* LineFeed */) {
        // The character after the match is line break or carriage return.
        return true;
    }
    if (matchLength > 0) {
        const lastCharInMatch = text.charCodeAt(matchStartIndex + matchLength - 1);
        if (wordSeparators.get(lastCharInMatch) !== 0 /* Regular */) {
            // The last character in the match is a word separator
            return true;
        }
    }
    return false;
}
function isValidMatch(wordSeparators, text, textLength, matchStartIndex, matchLength) {
    return (leftIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength)
        && rightIsWordBounday(wordSeparators, text, textLength, matchStartIndex, matchLength));
}
class Searcher {
    constructor(wordSeparators, searchRegex) {
        this._wordSeparators = wordSeparators;
        this._searchRegex = searchRegex;
        this._prevMatchStartIndex = -1;
        this._prevMatchLength = 0;
    }
    reset(lastIndex) {
        this._searchRegex.lastIndex = lastIndex;
        this._prevMatchStartIndex = -1;
        this._prevMatchLength = 0;
    }
    next(text) {
        const textLength = text.length;
        let m;
        do {
            if (this._prevMatchStartIndex + this._prevMatchLength === textLength) {
                // Reached the end of the line
                return null;
            }
            m = this._searchRegex.exec(text);
            if (!m) {
                return null;
            }
            const matchStartIndex = m.index;
            const matchLength = m[0].length;
            if (matchStartIndex === this._prevMatchStartIndex && matchLength === this._prevMatchLength) {
                if (matchLength === 0) {
                    // the search result is an empty string and won't advance `regex.lastIndex`, so `regex.exec` will stuck here
                    // we attempt to recover from that by advancing by two if surrogate pair found and by one otherwise
                    if (getNextCodePoint(text, textLength, this._searchRegex.lastIndex) > 0xFFFF) {
                        this._searchRegex.lastIndex += 2;
                    }
                    else {
                        this._searchRegex.lastIndex += 1;
                    }
                    continue;
                }
                // Exit early if the regex matches the same range twice
                return null;
            }
            this._prevMatchStartIndex = matchStartIndex;
            this._prevMatchLength = matchLength;
            if (!this._wordSeparators || isValidMatch(this._wordSeparators, text, textLength, matchStartIndex, matchLength)) {
                return m;
            }
        } while (m);
        return null;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// const lfRegex = new RegExp(/\r\n|\r|\n/g);
const AverageBufferSize = 65535;
function createUintArray(arr) {
    let r;
    if (arr[arr.length - 1] < 65536) {
        r = new Uint16Array(arr.length);
    }
    else {
        r = new Uint32Array(arr.length);
    }
    r.set(arr, 0);
    return r;
}
class LineStarts {
    constructor(lineStarts, cr, lf, crlf, isBasicASCII) {
        this.lineStarts = lineStarts;
        this.cr = cr;
        this.lf = lf;
        this.crlf = crlf;
        this.isBasicASCII = isBasicASCII;
    }
}
function createLineStartsFast(str, readonly = true) {
    let r = [0], rLength = 1;
    for (let i = 0, len = str.length; i < len; i++) {
        const chr = str.charCodeAt(i);
        if (chr === 13 /* CarriageReturn */) {
            if (i + 1 < len && str.charCodeAt(i + 1) === 10 /* LineFeed */) {
                // \r\n... case
                r[rLength++] = i + 2;
                i++; // skip \n
            }
            else {
                // \r... case
                r[rLength++] = i + 1;
            }
        }
        else if (chr === 10 /* LineFeed */) {
            r[rLength++] = i + 1;
        }
    }
    if (readonly) {
        return createUintArray(r);
    }
    else {
        return r;
    }
}
function createLineStarts(r, str) {
    r.length = 0;
    r[0] = 0;
    let rLength = 1;
    let cr = 0, lf = 0, crlf = 0;
    let isBasicASCII = true;
    for (let i = 0, len = str.length; i < len; i++) {
        const chr = str.charCodeAt(i);
        if (chr === 13 /* CarriageReturn */) {
            if (i + 1 < len && str.charCodeAt(i + 1) === 10 /* LineFeed */) {
                // \r\n... case
                crlf++;
                r[rLength++] = i + 2;
                i++; // skip \n
            }
            else {
                cr++;
                // \r... case
                r[rLength++] = i + 1;
            }
        }
        else if (chr === 10 /* LineFeed */) {
            lf++;
            r[rLength++] = i + 1;
        }
        else {
            if (isBasicASCII) {
                if (chr !== 9 /* Tab */ && (chr < 32 || chr > 126)) {
                    isBasicASCII = false;
                }
            }
        }
    }
    const result = new LineStarts(createUintArray(r), cr, lf, crlf, isBasicASCII);
    r.length = 0;
    return result;
}
class Piece {
    constructor(bufferIndex, start, end, lineFeedCnt, length) {
        this.bufferIndex = bufferIndex;
        this.start = start;
        this.end = end;
        this.lineFeedCnt = lineFeedCnt;
        this.length = length;
    }
}
class StringBuffer {
    constructor(buffer, lineStarts) {
        this.buffer = buffer;
        this.lineStarts = lineStarts;
    }
}
/**
 * Readonly snapshot for piece tree.
 * In a real multiple thread environment, to make snapshot reading always work correctly, we need to
 * 1. Make TreeNode.piece immutable, then reading and writing can run in parallel.
 * 2. TreeNode/Buffers normalization should not happen during snapshot reading.
 */
class PieceTreeSnapshot {
    constructor(tree, BOM) {
        this._pieces = [];
        this._tree = tree;
        this._BOM = BOM;
        this._index = 0;
        if (tree.root !== SENTINEL$1) {
            tree.iterate(tree.root, node => {
                if (node !== SENTINEL$1) {
                    this._pieces.push(node.piece);
                }
                return true;
            });
        }
    }
    read() {
        if (this._pieces.length === 0) {
            if (this._index === 0) {
                this._index++;
                return this._BOM;
            }
            else {
                return null;
            }
        }
        if (this._index > this._pieces.length - 1) {
            return null;
        }
        if (this._index === 0) {
            return this._BOM + this._tree.getPieceContent(this._pieces[this._index++]);
        }
        return this._tree.getPieceContent(this._pieces[this._index++]);
    }
}
class PieceTreeSearchCache {
    constructor(limit) {
        this._limit = limit;
        this._cache = [];
    }
    get(offset) {
        for (let i = this._cache.length - 1; i >= 0; i--) {
            let nodePos = this._cache[i];
            if (nodePos.nodeStartOffset <= offset && nodePos.nodeStartOffset + nodePos.node.piece.length >= offset) {
                return nodePos;
            }
        }
        return null;
    }
    get2(lineNumber) {
        for (let i = this._cache.length - 1; i >= 0; i--) {
            let nodePos = this._cache[i];
            if (nodePos.nodeStartLineNumber && nodePos.nodeStartLineNumber < lineNumber && nodePos.nodeStartLineNumber + nodePos.node.piece.lineFeedCnt >= lineNumber) {
                return nodePos;
            }
        }
        return null;
    }
    set(nodePosition) {
        if (this._cache.length >= this._limit) {
            this._cache.shift();
        }
        this._cache.push(nodePosition);
    }
    validate(offset) {
        let hasInvalidVal = false;
        let tmp = this._cache;
        for (let i = 0; i < tmp.length; i++) {
            let nodePos = tmp[i];
            if (nodePos.node.parent === null || nodePos.nodeStartOffset >= offset) {
                tmp[i] = null;
                hasInvalidVal = true;
                continue;
            }
        }
        if (hasInvalidVal) {
            let newArr = [];
            for (const entry of tmp) {
                if (entry !== null) {
                    newArr.push(entry);
                }
            }
            this._cache = newArr;
        }
    }
}
class PieceTreeBase {
    constructor(chunks, eol, eolNormalized) {
        this.create(chunks, eol, eolNormalized);
    }
    create(chunks, eol, eolNormalized) {
        this._buffers = [
            new StringBuffer('', [0])
        ];
        this._lastChangeBufferPos = { line: 0, column: 0 };
        this.root = SENTINEL$1;
        this._lineCnt = 1;
        this._length = 0;
        this._EOL = eol;
        this._EOLLength = eol.length;
        this._EOLNormalized = eolNormalized;
        let lastNode = null;
        for (let i = 0, len = chunks.length; i < len; i++) {
            if (chunks[i].buffer.length > 0) {
                if (!chunks[i].lineStarts) {
                    chunks[i].lineStarts = createLineStartsFast(chunks[i].buffer);
                }
                let piece = new Piece(i + 1, { line: 0, column: 0 }, { line: chunks[i].lineStarts.length - 1, column: chunks[i].buffer.length - chunks[i].lineStarts[chunks[i].lineStarts.length - 1] }, chunks[i].lineStarts.length - 1, chunks[i].buffer.length);
                this._buffers.push(chunks[i]);
                lastNode = this.rbInsertRight(lastNode, piece);
            }
        }
        this._searchCache = new PieceTreeSearchCache(1);
        this._lastVisitedLine = { lineNumber: 0, value: '' };
        this.computeBufferMetadata();
    }
    normalizeEOL(eol) {
        let averageBufferSize = AverageBufferSize;
        let min = averageBufferSize - Math.floor(averageBufferSize / 3);
        let max = min * 2;
        let tempChunk = '';
        let tempChunkLen = 0;
        let chunks = [];
        this.iterate(this.root, node => {
            let str = this.getNodeContent(node);
            let len = str.length;
            if (tempChunkLen <= min || tempChunkLen + len < max) {
                tempChunk += str;
                tempChunkLen += len;
                return true;
            }
            // flush anyways
            let text = tempChunk.replace(/\r\n|\r|\n/g, eol);
            chunks.push(new StringBuffer(text, createLineStartsFast(text)));
            tempChunk = str;
            tempChunkLen = len;
            return true;
        });
        if (tempChunkLen > 0) {
            let text = tempChunk.replace(/\r\n|\r|\n/g, eol);
            chunks.push(new StringBuffer(text, createLineStartsFast(text)));
        }
        this.create(chunks, eol, true);
    }
    // #region Buffer API
    getEOL() {
        return this._EOL;
    }
    setEOL(newEOL) {
        this._EOL = newEOL;
        this._EOLLength = this._EOL.length;
        this.normalizeEOL(newEOL);
    }
    createSnapshot(BOM) {
        return new PieceTreeSnapshot(this, BOM);
    }
    getOffsetAt(lineNumber, column) {
        let leftLen = 0; // inorder
        let x = this.root;
        while (x !== SENTINEL$1) {
            if (x.left !== SENTINEL$1 && x.lf_left + 1 >= lineNumber) {
                x = x.left;
            }
            else if (x.lf_left + x.piece.lineFeedCnt + 1 >= lineNumber) {
                leftLen += x.size_left;
                // lineNumber >= 2
                let accumualtedValInCurrentIndex = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                return leftLen += accumualtedValInCurrentIndex + column - 1;
            }
            else {
                lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                leftLen += x.size_left + x.piece.length;
                x = x.right;
            }
        }
        return leftLen;
    }
    getPositionAt(offset) {
        offset = Math.floor(offset);
        offset = Math.max(0, offset);
        let x = this.root;
        let lfCnt = 0;
        let originalOffset = offset;
        while (x !== SENTINEL$1) {
            if (x.size_left !== 0 && x.size_left >= offset) {
                x = x.left;
            }
            else if (x.size_left + x.piece.length >= offset) {
                let out = this.getIndexOf(x, offset - x.size_left);
                lfCnt += x.lf_left + out.index;
                if (out.index === 0) {
                    let lineStartOffset = this.getOffsetAt(lfCnt + 1, 1);
                    let column = originalOffset - lineStartOffset;
                    return new Position(lfCnt + 1, column + 1);
                }
                return new Position(lfCnt + 1, out.remainder + 1);
            }
            else {
                offset -= x.size_left + x.piece.length;
                lfCnt += x.lf_left + x.piece.lineFeedCnt;
                if (x.right === SENTINEL$1) {
                    // last node
                    let lineStartOffset = this.getOffsetAt(lfCnt + 1, 1);
                    let column = originalOffset - offset - lineStartOffset;
                    return new Position(lfCnt + 1, column + 1);
                }
                else {
                    x = x.right;
                }
            }
        }
        return new Position(1, 1);
    }
    getValueInRange(range, eol) {
        if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
            return '';
        }
        let startPosition = this.nodeAt2(range.startLineNumber, range.startColumn);
        let endPosition = this.nodeAt2(range.endLineNumber, range.endColumn);
        let value = this.getValueInRange2(startPosition, endPosition);
        if (eol) {
            if (eol !== this._EOL || !this._EOLNormalized) {
                return value.replace(/\r\n|\r|\n/g, eol);
            }
            if (eol === this.getEOL() && this._EOLNormalized) {
                return value;
            }
            return value.replace(/\r\n|\r|\n/g, eol);
        }
        return value;
    }
    getValueInRange2(startPosition, endPosition) {
        if (startPosition.node === endPosition.node) {
            let node = startPosition.node;
            let buffer = this._buffers[node.piece.bufferIndex].buffer;
            let startOffset = this.offsetInBuffer(node.piece.bufferIndex, node.piece.start);
            return buffer.substring(startOffset + startPosition.remainder, startOffset + endPosition.remainder);
        }
        let x = startPosition.node;
        let buffer = this._buffers[x.piece.bufferIndex].buffer;
        let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
        let ret = buffer.substring(startOffset + startPosition.remainder, startOffset + x.piece.length);
        x = x.next();
        while (x !== SENTINEL$1) {
            let buffer = this._buffers[x.piece.bufferIndex].buffer;
            let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
            if (x === endPosition.node) {
                ret += buffer.substring(startOffset, startOffset + endPosition.remainder);
                break;
            }
            else {
                ret += buffer.substr(startOffset, x.piece.length);
            }
            x = x.next();
        }
        return ret;
    }
    getLinesContent() {
        let lines = [];
        let linesLength = 0;
        let currentLine = '';
        let danglingCR = false;
        this.iterate(this.root, node => {
            if (node === SENTINEL$1) {
                return true;
            }
            const piece = node.piece;
            let pieceLength = piece.length;
            if (pieceLength === 0) {
                return true;
            }
            const buffer = this._buffers[piece.bufferIndex].buffer;
            const lineStarts = this._buffers[piece.bufferIndex].lineStarts;
            const pieceStartLine = piece.start.line;
            const pieceEndLine = piece.end.line;
            let pieceStartOffset = lineStarts[pieceStartLine] + piece.start.column;
            if (danglingCR) {
                if (buffer.charCodeAt(pieceStartOffset) === 10 /* LineFeed */) {
                    // pretend the \n was in the previous piece..
                    pieceStartOffset++;
                    pieceLength--;
                }
                lines[linesLength++] = currentLine;
                currentLine = '';
                danglingCR = false;
                if (pieceLength === 0) {
                    return true;
                }
            }
            if (pieceStartLine === pieceEndLine) {
                // this piece has no new lines
                if (!this._EOLNormalized && buffer.charCodeAt(pieceStartOffset + pieceLength - 1) === 13 /* CarriageReturn */) {
                    danglingCR = true;
                    currentLine += buffer.substr(pieceStartOffset, pieceLength - 1);
                }
                else {
                    currentLine += buffer.substr(pieceStartOffset, pieceLength);
                }
                return true;
            }
            // add the text before the first line start in this piece
            currentLine += (this._EOLNormalized
                ? buffer.substring(pieceStartOffset, Math.max(pieceStartOffset, lineStarts[pieceStartLine + 1] - this._EOLLength))
                : buffer.substring(pieceStartOffset, lineStarts[pieceStartLine + 1]).replace(/(\r\n|\r|\n)$/, ''));
            lines[linesLength++] = currentLine;
            for (let line = pieceStartLine + 1; line < pieceEndLine; line++) {
                currentLine = (this._EOLNormalized
                    ? buffer.substring(lineStarts[line], lineStarts[line + 1] - this._EOLLength)
                    : buffer.substring(lineStarts[line], lineStarts[line + 1]).replace(/(\r\n|\r|\n)$/, ''));
                lines[linesLength++] = currentLine;
            }
            if (!this._EOLNormalized && buffer.charCodeAt(lineStarts[pieceEndLine] + piece.end.column - 1) === 13 /* CarriageReturn */) {
                danglingCR = true;
                if (piece.end.column === 0) {
                    // The last line ended with a \r, let's undo the push, it will be pushed by next iteration
                    linesLength--;
                }
                else {
                    currentLine = buffer.substr(lineStarts[pieceEndLine], piece.end.column - 1);
                }
            }
            else {
                currentLine = buffer.substr(lineStarts[pieceEndLine], piece.end.column);
            }
            return true;
        });
        if (danglingCR) {
            lines[linesLength++] = currentLine;
            currentLine = '';
        }
        lines[linesLength++] = currentLine;
        return lines;
    }
    getLength() {
        return this._length;
    }
    getLineCount() {
        return this._lineCnt;
    }
    getLineContent(lineNumber) {
        if (this._lastVisitedLine.lineNumber === lineNumber) {
            return this._lastVisitedLine.value;
        }
        this._lastVisitedLine.lineNumber = lineNumber;
        if (lineNumber === this._lineCnt) {
            this._lastVisitedLine.value = this.getLineRawContent(lineNumber);
        }
        else if (this._EOLNormalized) {
            this._lastVisitedLine.value = this.getLineRawContent(lineNumber, this._EOLLength);
        }
        else {
            this._lastVisitedLine.value = this.getLineRawContent(lineNumber).replace(/(\r\n|\r|\n)$/, '');
        }
        return this._lastVisitedLine.value;
    }
    _getCharCode(nodePos) {
        if (nodePos.remainder === nodePos.node.piece.length) {
            // the char we want to fetch is at the head of next node.
            let matchingNode = nodePos.node.next();
            if (!matchingNode) {
                return 0;
            }
            let buffer = this._buffers[matchingNode.piece.bufferIndex];
            let startOffset = this.offsetInBuffer(matchingNode.piece.bufferIndex, matchingNode.piece.start);
            return buffer.buffer.charCodeAt(startOffset);
        }
        else {
            let buffer = this._buffers[nodePos.node.piece.bufferIndex];
            let startOffset = this.offsetInBuffer(nodePos.node.piece.bufferIndex, nodePos.node.piece.start);
            let targetOffset = startOffset + nodePos.remainder;
            return buffer.buffer.charCodeAt(targetOffset);
        }
    }
    getLineCharCode(lineNumber, index) {
        let nodePos = this.nodeAt2(lineNumber, index + 1);
        return this._getCharCode(nodePos);
    }
    getLineLength(lineNumber) {
        if (lineNumber === this.getLineCount()) {
            let startOffset = this.getOffsetAt(lineNumber, 1);
            return this.getLength() - startOffset;
        }
        return this.getOffsetAt(lineNumber + 1, 1) - this.getOffsetAt(lineNumber, 1) - this._EOLLength;
    }
    findMatchesInNode(node, searcher, startLineNumber, startColumn, startCursor, endCursor, searchData, captureMatches, limitResultCount, resultLen, result) {
        let buffer = this._buffers[node.piece.bufferIndex];
        let startOffsetInBuffer = this.offsetInBuffer(node.piece.bufferIndex, node.piece.start);
        let start = this.offsetInBuffer(node.piece.bufferIndex, startCursor);
        let end = this.offsetInBuffer(node.piece.bufferIndex, endCursor);
        let m;
        // Reset regex to search from the beginning
        let ret = { line: 0, column: 0 };
        let searchText;
        let offsetInBuffer;
        if (searcher._wordSeparators) {
            searchText = buffer.buffer.substring(start, end);
            offsetInBuffer = (offset) => offset + start;
            searcher.reset(0);
        }
        else {
            searchText = buffer.buffer;
            offsetInBuffer = (offset) => offset;
            searcher.reset(start);
        }
        do {
            m = searcher.next(searchText);
            if (m) {
                if (offsetInBuffer(m.index) >= end) {
                    return resultLen;
                }
                this.positionInBuffer(node, offsetInBuffer(m.index) - startOffsetInBuffer, ret);
                let lineFeedCnt = this.getLineFeedCnt(node.piece.bufferIndex, startCursor, ret);
                let retStartColumn = ret.line === startCursor.line ? ret.column - startCursor.column + startColumn : ret.column + 1;
                let retEndColumn = retStartColumn + m[0].length;
                result[resultLen++] = createFindMatch(new Range(startLineNumber + lineFeedCnt, retStartColumn, startLineNumber + lineFeedCnt, retEndColumn), m, captureMatches);
                if (offsetInBuffer(m.index) + m[0].length >= end) {
                    return resultLen;
                }
                if (resultLen >= limitResultCount) {
                    return resultLen;
                }
            }
        } while (m);
        return resultLen;
    }
    findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
        const result = [];
        let resultLen = 0;
        const searcher = new Searcher(searchData.wordSeparators, searchData.regex);
        let startPosition = this.nodeAt2(searchRange.startLineNumber, searchRange.startColumn);
        if (startPosition === null) {
            return [];
        }
        let endPosition = this.nodeAt2(searchRange.endLineNumber, searchRange.endColumn);
        if (endPosition === null) {
            return [];
        }
        let start = this.positionInBuffer(startPosition.node, startPosition.remainder);
        let end = this.positionInBuffer(endPosition.node, endPosition.remainder);
        if (startPosition.node === endPosition.node) {
            this.findMatchesInNode(startPosition.node, searcher, searchRange.startLineNumber, searchRange.startColumn, start, end, searchData, captureMatches, limitResultCount, resultLen, result);
            return result;
        }
        let startLineNumber = searchRange.startLineNumber;
        let currentNode = startPosition.node;
        while (currentNode !== endPosition.node) {
            let lineBreakCnt = this.getLineFeedCnt(currentNode.piece.bufferIndex, start, currentNode.piece.end);
            if (lineBreakCnt >= 1) {
                // last line break position
                let lineStarts = this._buffers[currentNode.piece.bufferIndex].lineStarts;
                let startOffsetInBuffer = this.offsetInBuffer(currentNode.piece.bufferIndex, currentNode.piece.start);
                let nextLineStartOffset = lineStarts[start.line + lineBreakCnt];
                let startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn : 1;
                resultLen = this.findMatchesInNode(currentNode, searcher, startLineNumber, startColumn, start, this.positionInBuffer(currentNode, nextLineStartOffset - startOffsetInBuffer), searchData, captureMatches, limitResultCount, resultLen, result);
                if (resultLen >= limitResultCount) {
                    return result;
                }
                startLineNumber += lineBreakCnt;
            }
            let startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn - 1 : 0;
            // search for the remaining content
            if (startLineNumber === searchRange.endLineNumber) {
                const text = this.getLineContent(startLineNumber).substring(startColumn, searchRange.endColumn - 1);
                resultLen = this._findMatchesInLine(searchData, searcher, text, searchRange.endLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
                return result;
            }
            resultLen = this._findMatchesInLine(searchData, searcher, this.getLineContent(startLineNumber).substr(startColumn), startLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
            if (resultLen >= limitResultCount) {
                return result;
            }
            startLineNumber++;
            startPosition = this.nodeAt2(startLineNumber, 1);
            currentNode = startPosition.node;
            start = this.positionInBuffer(startPosition.node, startPosition.remainder);
        }
        if (startLineNumber === searchRange.endLineNumber) {
            let startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn - 1 : 0;
            const text = this.getLineContent(startLineNumber).substring(startColumn, searchRange.endColumn - 1);
            resultLen = this._findMatchesInLine(searchData, searcher, text, searchRange.endLineNumber, startColumn, resultLen, result, captureMatches, limitResultCount);
            return result;
        }
        let startColumn = startLineNumber === searchRange.startLineNumber ? searchRange.startColumn : 1;
        resultLen = this.findMatchesInNode(endPosition.node, searcher, startLineNumber, startColumn, start, end, searchData, captureMatches, limitResultCount, resultLen, result);
        return result;
    }
    _findMatchesInLine(searchData, searcher, text, lineNumber, deltaOffset, resultLen, result, captureMatches, limitResultCount) {
        const wordSeparators = searchData.wordSeparators;
        if (!captureMatches && searchData.simpleSearch) {
            const searchString = searchData.simpleSearch;
            const searchStringLen = searchString.length;
            const textLength = text.length;
            let lastMatchIndex = -searchStringLen;
            while ((lastMatchIndex = text.indexOf(searchString, lastMatchIndex + searchStringLen)) !== -1) {
                if (!wordSeparators || isValidMatch(wordSeparators, text, textLength, lastMatchIndex, searchStringLen)) {
                    result[resultLen++] = new FindMatch(new Range(lineNumber, lastMatchIndex + 1 + deltaOffset, lineNumber, lastMatchIndex + 1 + searchStringLen + deltaOffset), null);
                    if (resultLen >= limitResultCount) {
                        return resultLen;
                    }
                }
            }
            return resultLen;
        }
        let m;
        // Reset regex to search from the beginning
        searcher.reset(0);
        do {
            m = searcher.next(text);
            if (m) {
                result[resultLen++] = createFindMatch(new Range(lineNumber, m.index + 1 + deltaOffset, lineNumber, m.index + 1 + m[0].length + deltaOffset), m, captureMatches);
                if (resultLen >= limitResultCount) {
                    return resultLen;
                }
            }
        } while (m);
        return resultLen;
    }
    // #endregion
    // #region Piece Table
    insert(offset, value, eolNormalized = false) {
        this._EOLNormalized = this._EOLNormalized && eolNormalized;
        this._lastVisitedLine.lineNumber = 0;
        this._lastVisitedLine.value = '';
        if (this.root !== SENTINEL$1) {
            let { node, remainder, nodeStartOffset } = this.nodeAt(offset);
            let piece = node.piece;
            let bufferIndex = piece.bufferIndex;
            let insertPosInBuffer = this.positionInBuffer(node, remainder);
            if (node.piece.bufferIndex === 0 &&
                piece.end.line === this._lastChangeBufferPos.line &&
                piece.end.column === this._lastChangeBufferPos.column &&
                (nodeStartOffset + piece.length === offset) &&
                value.length < AverageBufferSize) {
                // changed buffer
                this.appendToNode(node, value);
                this.computeBufferMetadata();
                return;
            }
            if (nodeStartOffset === offset) {
                this.insertContentToNodeLeft(value, node);
                this._searchCache.validate(offset);
            }
            else if (nodeStartOffset + node.piece.length > offset) {
                // we are inserting into the middle of a node.
                let nodesToDel = [];
                let newRightPiece = new Piece(piece.bufferIndex, insertPosInBuffer, piece.end, this.getLineFeedCnt(piece.bufferIndex, insertPosInBuffer, piece.end), this.offsetInBuffer(bufferIndex, piece.end) - this.offsetInBuffer(bufferIndex, insertPosInBuffer));
                if (this.shouldCheckCRLF() && this.endWithCR(value)) {
                    let headOfRight = this.nodeCharCodeAt(node, remainder);
                    if (headOfRight === 10 /** \n */) {
                        let newStart = { line: newRightPiece.start.line + 1, column: 0 };
                        newRightPiece = new Piece(newRightPiece.bufferIndex, newStart, newRightPiece.end, this.getLineFeedCnt(newRightPiece.bufferIndex, newStart, newRightPiece.end), newRightPiece.length - 1);
                        value += '\n';
                    }
                }
                // reuse node for content before insertion point.
                if (this.shouldCheckCRLF() && this.startWithLF(value)) {
                    let tailOfLeft = this.nodeCharCodeAt(node, remainder - 1);
                    if (tailOfLeft === 13 /** \r */) {
                        let previousPos = this.positionInBuffer(node, remainder - 1);
                        this.deleteNodeTail(node, previousPos);
                        value = '\r' + value;
                        if (node.piece.length === 0) {
                            nodesToDel.push(node);
                        }
                    }
                    else {
                        this.deleteNodeTail(node, insertPosInBuffer);
                    }
                }
                else {
                    this.deleteNodeTail(node, insertPosInBuffer);
                }
                let newPieces = this.createNewPieces(value);
                if (newRightPiece.length > 0) {
                    this.rbInsertRight(node, newRightPiece);
                }
                let tmpNode = node;
                for (let k = 0; k < newPieces.length; k++) {
                    tmpNode = this.rbInsertRight(tmpNode, newPieces[k]);
                }
                this.deleteNodes(nodesToDel);
            }
            else {
                this.insertContentToNodeRight(value, node);
            }
        }
        else {
            // insert new node
            let pieces = this.createNewPieces(value);
            let node = this.rbInsertLeft(null, pieces[0]);
            for (let k = 1; k < pieces.length; k++) {
                node = this.rbInsertRight(node, pieces[k]);
            }
        }
        // todo, this is too brutal. Total line feed count should be updated the same way as lf_left.
        this.computeBufferMetadata();
    }
    delete(offset, cnt) {
        this._lastVisitedLine.lineNumber = 0;
        this._lastVisitedLine.value = '';
        if (cnt <= 0 || this.root === SENTINEL$1) {
            return;
        }
        let startPosition = this.nodeAt(offset);
        let endPosition = this.nodeAt(offset + cnt);
        let startNode = startPosition.node;
        let endNode = endPosition.node;
        if (startNode === endNode) {
            let startSplitPosInBuffer = this.positionInBuffer(startNode, startPosition.remainder);
            let endSplitPosInBuffer = this.positionInBuffer(startNode, endPosition.remainder);
            if (startPosition.nodeStartOffset === offset) {
                if (cnt === startNode.piece.length) { // delete node
                    let next = startNode.next();
                    rbDelete(this, startNode);
                    this.validateCRLFWithPrevNode(next);
                    this.computeBufferMetadata();
                    return;
                }
                this.deleteNodeHead(startNode, endSplitPosInBuffer);
                this._searchCache.validate(offset);
                this.validateCRLFWithPrevNode(startNode);
                this.computeBufferMetadata();
                return;
            }
            if (startPosition.nodeStartOffset + startNode.piece.length === offset + cnt) {
                this.deleteNodeTail(startNode, startSplitPosInBuffer);
                this.validateCRLFWithNextNode(startNode);
                this.computeBufferMetadata();
                return;
            }
            // delete content in the middle, this node will be splitted to nodes
            this.shrinkNode(startNode, startSplitPosInBuffer, endSplitPosInBuffer);
            this.computeBufferMetadata();
            return;
        }
        let nodesToDel = [];
        let startSplitPosInBuffer = this.positionInBuffer(startNode, startPosition.remainder);
        this.deleteNodeTail(startNode, startSplitPosInBuffer);
        this._searchCache.validate(offset);
        if (startNode.piece.length === 0) {
            nodesToDel.push(startNode);
        }
        // update last touched node
        let endSplitPosInBuffer = this.positionInBuffer(endNode, endPosition.remainder);
        this.deleteNodeHead(endNode, endSplitPosInBuffer);
        if (endNode.piece.length === 0) {
            nodesToDel.push(endNode);
        }
        // delete nodes in between
        let secondNode = startNode.next();
        for (let node = secondNode; node !== SENTINEL$1 && node !== endNode; node = node.next()) {
            nodesToDel.push(node);
        }
        let prev = startNode.piece.length === 0 ? startNode.prev() : startNode;
        this.deleteNodes(nodesToDel);
        this.validateCRLFWithNextNode(prev);
        this.computeBufferMetadata();
    }
    insertContentToNodeLeft(value, node) {
        // we are inserting content to the beginning of node
        let nodesToDel = [];
        if (this.shouldCheckCRLF() && this.endWithCR(value) && this.startWithLF(node)) {
            // move `\n` to new node.
            let piece = node.piece;
            let newStart = { line: piece.start.line + 1, column: 0 };
            let nPiece = new Piece(piece.bufferIndex, newStart, piece.end, this.getLineFeedCnt(piece.bufferIndex, newStart, piece.end), piece.length - 1);
            node.piece = nPiece;
            value += '\n';
            updateTreeMetadata(this, node, -1, -1);
            if (node.piece.length === 0) {
                nodesToDel.push(node);
            }
        }
        let newPieces = this.createNewPieces(value);
        let newNode = this.rbInsertLeft(node, newPieces[newPieces.length - 1]);
        for (let k = newPieces.length - 2; k >= 0; k--) {
            newNode = this.rbInsertLeft(newNode, newPieces[k]);
        }
        this.validateCRLFWithPrevNode(newNode);
        this.deleteNodes(nodesToDel);
    }
    insertContentToNodeRight(value, node) {
        // we are inserting to the right of this node.
        if (this.adjustCarriageReturnFromNext(value, node)) {
            // move \n to the new node.
            value += '\n';
        }
        let newPieces = this.createNewPieces(value);
        let newNode = this.rbInsertRight(node, newPieces[0]);
        let tmpNode = newNode;
        for (let k = 1; k < newPieces.length; k++) {
            tmpNode = this.rbInsertRight(tmpNode, newPieces[k]);
        }
        this.validateCRLFWithPrevNode(newNode);
    }
    positionInBuffer(node, remainder, ret) {
        let piece = node.piece;
        let bufferIndex = node.piece.bufferIndex;
        let lineStarts = this._buffers[bufferIndex].lineStarts;
        let startOffset = lineStarts[piece.start.line] + piece.start.column;
        let offset = startOffset + remainder;
        // binary search offset between startOffset and endOffset
        let low = piece.start.line;
        let high = piece.end.line;
        let mid = 0;
        let midStop = 0;
        let midStart = 0;
        while (low <= high) {
            mid = low + ((high - low) / 2) | 0;
            midStart = lineStarts[mid];
            if (mid === high) {
                break;
            }
            midStop = lineStarts[mid + 1];
            if (offset < midStart) {
                high = mid - 1;
            }
            else if (offset >= midStop) {
                low = mid + 1;
            }
            else {
                break;
            }
        }
        if (ret) {
            ret.line = mid;
            ret.column = offset - midStart;
            return null;
        }
        return {
            line: mid,
            column: offset - midStart
        };
    }
    getLineFeedCnt(bufferIndex, start, end) {
        // we don't need to worry about start: abc\r|\n, or abc|\r, or abc|\n, or abc|\r\n doesn't change the fact that, there is one line break after start.
        // now let's take care of end: abc\r|\n, if end is in between \r and \n, we need to add line feed count by 1
        if (end.column === 0) {
            return end.line - start.line;
        }
        let lineStarts = this._buffers[bufferIndex].lineStarts;
        if (end.line === lineStarts.length - 1) { // it means, there is no \n after end, otherwise, there will be one more lineStart.
            return end.line - start.line;
        }
        let nextLineStartOffset = lineStarts[end.line + 1];
        let endOffset = lineStarts[end.line] + end.column;
        if (nextLineStartOffset > endOffset + 1) { // there are more than 1 character after end, which means it can't be \n
            return end.line - start.line;
        }
        // endOffset + 1 === nextLineStartOffset
        // character at endOffset is \n, so we check the character before first
        // if character at endOffset is \r, end.column is 0 and we can't get here.
        let previousCharOffset = endOffset - 1; // end.column > 0 so it's okay.
        let buffer = this._buffers[bufferIndex].buffer;
        if (buffer.charCodeAt(previousCharOffset) === 13) {
            return end.line - start.line + 1;
        }
        else {
            return end.line - start.line;
        }
    }
    offsetInBuffer(bufferIndex, cursor) {
        let lineStarts = this._buffers[bufferIndex].lineStarts;
        return lineStarts[cursor.line] + cursor.column;
    }
    deleteNodes(nodes) {
        for (let i = 0; i < nodes.length; i++) {
            rbDelete(this, nodes[i]);
        }
    }
    createNewPieces(text) {
        if (text.length > AverageBufferSize) {
            // the content is large, operations like substring, charCode becomes slow
            // so here we split it into smaller chunks, just like what we did for CR/LF normalization
            let newPieces = [];
            while (text.length > AverageBufferSize) {
                const lastChar = text.charCodeAt(AverageBufferSize - 1);
                let splitText;
                if (lastChar === 13 /* CarriageReturn */ || (lastChar >= 0xD800 && lastChar <= 0xDBFF)) {
                    // last character is \r or a high surrogate => keep it back
                    splitText = text.substring(0, AverageBufferSize - 1);
                    text = text.substring(AverageBufferSize - 1);
                }
                else {
                    splitText = text.substring(0, AverageBufferSize);
                    text = text.substring(AverageBufferSize);
                }
                let lineStarts = createLineStartsFast(splitText);
                newPieces.push(new Piece(this._buffers.length, /* buffer index */ { line: 0, column: 0 }, { line: lineStarts.length - 1, column: splitText.length - lineStarts[lineStarts.length - 1] }, lineStarts.length - 1, splitText.length));
                this._buffers.push(new StringBuffer(splitText, lineStarts));
            }
            let lineStarts = createLineStartsFast(text);
            newPieces.push(new Piece(this._buffers.length, /* buffer index */ { line: 0, column: 0 }, { line: lineStarts.length - 1, column: text.length - lineStarts[lineStarts.length - 1] }, lineStarts.length - 1, text.length));
            this._buffers.push(new StringBuffer(text, lineStarts));
            return newPieces;
        }
        let startOffset = this._buffers[0].buffer.length;
        const lineStarts = createLineStartsFast(text, false);
        let start = this._lastChangeBufferPos;
        if (this._buffers[0].lineStarts[this._buffers[0].lineStarts.length - 1] === startOffset
            && startOffset !== 0
            && this.startWithLF(text)
            && this.endWithCR(this._buffers[0].buffer) // todo, we can check this._lastChangeBufferPos's column as it's the last one
        ) {
            this._lastChangeBufferPos = { line: this._lastChangeBufferPos.line, column: this._lastChangeBufferPos.column + 1 };
            start = this._lastChangeBufferPos;
            for (let i = 0; i < lineStarts.length; i++) {
                lineStarts[i] += startOffset + 1;
            }
            this._buffers[0].lineStarts = this._buffers[0].lineStarts.concat(lineStarts.slice(1));
            this._buffers[0].buffer += '_' + text;
            startOffset += 1;
        }
        else {
            if (startOffset !== 0) {
                for (let i = 0; i < lineStarts.length; i++) {
                    lineStarts[i] += startOffset;
                }
            }
            this._buffers[0].lineStarts = this._buffers[0].lineStarts.concat(lineStarts.slice(1));
            this._buffers[0].buffer += text;
        }
        const endOffset = this._buffers[0].buffer.length;
        let endIndex = this._buffers[0].lineStarts.length - 1;
        let endColumn = endOffset - this._buffers[0].lineStarts[endIndex];
        let endPos = { line: endIndex, column: endColumn };
        let newPiece = new Piece(0, /** todo@peng */ start, endPos, this.getLineFeedCnt(0, start, endPos), endOffset - startOffset);
        this._lastChangeBufferPos = endPos;
        return [newPiece];
    }
    getLineRawContent(lineNumber, endOffset = 0) {
        let x = this.root;
        let ret = '';
        let cache = this._searchCache.get2(lineNumber);
        if (cache) {
            x = cache.node;
            let prevAccumulatedValue = this.getAccumulatedValue(x, lineNumber - cache.nodeStartLineNumber - 1);
            let buffer = this._buffers[x.piece.bufferIndex].buffer;
            let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
            if (cache.nodeStartLineNumber + x.piece.lineFeedCnt === lineNumber) {
                ret = buffer.substring(startOffset + prevAccumulatedValue, startOffset + x.piece.length);
            }
            else {
                let accumulatedValue = this.getAccumulatedValue(x, lineNumber - cache.nodeStartLineNumber);
                return buffer.substring(startOffset + prevAccumulatedValue, startOffset + accumulatedValue - endOffset);
            }
        }
        else {
            let nodeStartOffset = 0;
            const originalLineNumber = lineNumber;
            while (x !== SENTINEL$1) {
                if (x.left !== SENTINEL$1 && x.lf_left >= lineNumber - 1) {
                    x = x.left;
                }
                else if (x.lf_left + x.piece.lineFeedCnt > lineNumber - 1) {
                    let prevAccumulatedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                    let accumulatedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 1);
                    let buffer = this._buffers[x.piece.bufferIndex].buffer;
                    let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                    nodeStartOffset += x.size_left;
                    this._searchCache.set({
                        node: x,
                        nodeStartOffset,
                        nodeStartLineNumber: originalLineNumber - (lineNumber - 1 - x.lf_left)
                    });
                    return buffer.substring(startOffset + prevAccumulatedValue, startOffset + accumulatedValue - endOffset);
                }
                else if (x.lf_left + x.piece.lineFeedCnt === lineNumber - 1) {
                    let prevAccumulatedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                    let buffer = this._buffers[x.piece.bufferIndex].buffer;
                    let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                    ret = buffer.substring(startOffset + prevAccumulatedValue, startOffset + x.piece.length);
                    break;
                }
                else {
                    lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                    nodeStartOffset += x.size_left + x.piece.length;
                    x = x.right;
                }
            }
        }
        // search in order, to find the node contains end column
        x = x.next();
        while (x !== SENTINEL$1) {
            let buffer = this._buffers[x.piece.bufferIndex].buffer;
            if (x.piece.lineFeedCnt > 0) {
                let accumulatedValue = this.getAccumulatedValue(x, 0);
                let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                ret += buffer.substring(startOffset, startOffset + accumulatedValue - endOffset);
                return ret;
            }
            else {
                let startOffset = this.offsetInBuffer(x.piece.bufferIndex, x.piece.start);
                ret += buffer.substr(startOffset, x.piece.length);
            }
            x = x.next();
        }
        return ret;
    }
    computeBufferMetadata() {
        let x = this.root;
        let lfCnt = 1;
        let len = 0;
        while (x !== SENTINEL$1) {
            lfCnt += x.lf_left + x.piece.lineFeedCnt;
            len += x.size_left + x.piece.length;
            x = x.right;
        }
        this._lineCnt = lfCnt;
        this._length = len;
        this._searchCache.validate(this._length);
    }
    // #region node operations
    getIndexOf(node, accumulatedValue) {
        let piece = node.piece;
        let pos = this.positionInBuffer(node, accumulatedValue);
        let lineCnt = pos.line - piece.start.line;
        if (this.offsetInBuffer(piece.bufferIndex, piece.end) - this.offsetInBuffer(piece.bufferIndex, piece.start) === accumulatedValue) {
            // we are checking the end of this node, so a CRLF check is necessary.
            let realLineCnt = this.getLineFeedCnt(node.piece.bufferIndex, piece.start, pos);
            if (realLineCnt !== lineCnt) {
                // aha yes, CRLF
                return { index: realLineCnt, remainder: 0 };
            }
        }
        return { index: lineCnt, remainder: pos.column };
    }
    getAccumulatedValue(node, index) {
        if (index < 0) {
            return 0;
        }
        let piece = node.piece;
        let lineStarts = this._buffers[piece.bufferIndex].lineStarts;
        let expectedLineStartIndex = piece.start.line + index + 1;
        if (expectedLineStartIndex > piece.end.line) {
            return lineStarts[piece.end.line] + piece.end.column - lineStarts[piece.start.line] - piece.start.column;
        }
        else {
            return lineStarts[expectedLineStartIndex] - lineStarts[piece.start.line] - piece.start.column;
        }
    }
    deleteNodeTail(node, pos) {
        const piece = node.piece;
        const originalLFCnt = piece.lineFeedCnt;
        const originalEndOffset = this.offsetInBuffer(piece.bufferIndex, piece.end);
        const newEnd = pos;
        const newEndOffset = this.offsetInBuffer(piece.bufferIndex, newEnd);
        const newLineFeedCnt = this.getLineFeedCnt(piece.bufferIndex, piece.start, newEnd);
        const lf_delta = newLineFeedCnt - originalLFCnt;
        const size_delta = newEndOffset - originalEndOffset;
        const newLength = piece.length + size_delta;
        node.piece = new Piece(piece.bufferIndex, piece.start, newEnd, newLineFeedCnt, newLength);
        updateTreeMetadata(this, node, size_delta, lf_delta);
    }
    deleteNodeHead(node, pos) {
        const piece = node.piece;
        const originalLFCnt = piece.lineFeedCnt;
        const originalStartOffset = this.offsetInBuffer(piece.bufferIndex, piece.start);
        const newStart = pos;
        const newLineFeedCnt = this.getLineFeedCnt(piece.bufferIndex, newStart, piece.end);
        const newStartOffset = this.offsetInBuffer(piece.bufferIndex, newStart);
        const lf_delta = newLineFeedCnt - originalLFCnt;
        const size_delta = originalStartOffset - newStartOffset;
        const newLength = piece.length + size_delta;
        node.piece = new Piece(piece.bufferIndex, newStart, piece.end, newLineFeedCnt, newLength);
        updateTreeMetadata(this, node, size_delta, lf_delta);
    }
    shrinkNode(node, start, end) {
        const piece = node.piece;
        const originalStartPos = piece.start;
        const originalEndPos = piece.end;
        // old piece, originalStartPos, start
        const oldLength = piece.length;
        const oldLFCnt = piece.lineFeedCnt;
        const newEnd = start;
        const newLineFeedCnt = this.getLineFeedCnt(piece.bufferIndex, piece.start, newEnd);
        const newLength = this.offsetInBuffer(piece.bufferIndex, start) - this.offsetInBuffer(piece.bufferIndex, originalStartPos);
        node.piece = new Piece(piece.bufferIndex, piece.start, newEnd, newLineFeedCnt, newLength);
        updateTreeMetadata(this, node, newLength - oldLength, newLineFeedCnt - oldLFCnt);
        // new right piece, end, originalEndPos
        let newPiece = new Piece(piece.bufferIndex, end, originalEndPos, this.getLineFeedCnt(piece.bufferIndex, end, originalEndPos), this.offsetInBuffer(piece.bufferIndex, originalEndPos) - this.offsetInBuffer(piece.bufferIndex, end));
        let newNode = this.rbInsertRight(node, newPiece);
        this.validateCRLFWithPrevNode(newNode);
    }
    appendToNode(node, value) {
        if (this.adjustCarriageReturnFromNext(value, node)) {
            value += '\n';
        }
        const hitCRLF = this.shouldCheckCRLF() && this.startWithLF(value) && this.endWithCR(node);
        const startOffset = this._buffers[0].buffer.length;
        this._buffers[0].buffer += value;
        const lineStarts = createLineStartsFast(value, false);
        for (let i = 0; i < lineStarts.length; i++) {
            lineStarts[i] += startOffset;
        }
        if (hitCRLF) {
            let prevStartOffset = this._buffers[0].lineStarts[this._buffers[0].lineStarts.length - 2];
            this._buffers[0].lineStarts.pop();
            // _lastChangeBufferPos is already wrong
            this._lastChangeBufferPos = { line: this._lastChangeBufferPos.line - 1, column: startOffset - prevStartOffset };
        }
        this._buffers[0].lineStarts = this._buffers[0].lineStarts.concat(lineStarts.slice(1));
        const endIndex = this._buffers[0].lineStarts.length - 1;
        const endColumn = this._buffers[0].buffer.length - this._buffers[0].lineStarts[endIndex];
        const newEnd = { line: endIndex, column: endColumn };
        const newLength = node.piece.length + value.length;
        const oldLineFeedCnt = node.piece.lineFeedCnt;
        const newLineFeedCnt = this.getLineFeedCnt(0, node.piece.start, newEnd);
        const lf_delta = newLineFeedCnt - oldLineFeedCnt;
        node.piece = new Piece(node.piece.bufferIndex, node.piece.start, newEnd, newLineFeedCnt, newLength);
        this._lastChangeBufferPos = newEnd;
        updateTreeMetadata(this, node, value.length, lf_delta);
    }
    nodeAt(offset) {
        let x = this.root;
        let cache = this._searchCache.get(offset);
        if (cache) {
            return {
                node: cache.node,
                nodeStartOffset: cache.nodeStartOffset,
                remainder: offset - cache.nodeStartOffset
            };
        }
        let nodeStartOffset = 0;
        while (x !== SENTINEL$1) {
            if (x.size_left > offset) {
                x = x.left;
            }
            else if (x.size_left + x.piece.length >= offset) {
                nodeStartOffset += x.size_left;
                let ret = {
                    node: x,
                    remainder: offset - x.size_left,
                    nodeStartOffset
                };
                this._searchCache.set(ret);
                return ret;
            }
            else {
                offset -= x.size_left + x.piece.length;
                nodeStartOffset += x.size_left + x.piece.length;
                x = x.right;
            }
        }
        return null;
    }
    nodeAt2(lineNumber, column) {
        let x = this.root;
        let nodeStartOffset = 0;
        while (x !== SENTINEL$1) {
            if (x.left !== SENTINEL$1 && x.lf_left >= lineNumber - 1) {
                x = x.left;
            }
            else if (x.lf_left + x.piece.lineFeedCnt > lineNumber - 1) {
                let prevAccumualtedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                let accumulatedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 1);
                nodeStartOffset += x.size_left;
                return {
                    node: x,
                    remainder: Math.min(prevAccumualtedValue + column - 1, accumulatedValue),
                    nodeStartOffset
                };
            }
            else if (x.lf_left + x.piece.lineFeedCnt === lineNumber - 1) {
                let prevAccumualtedValue = this.getAccumulatedValue(x, lineNumber - x.lf_left - 2);
                if (prevAccumualtedValue + column - 1 <= x.piece.length) {
                    return {
                        node: x,
                        remainder: prevAccumualtedValue + column - 1,
                        nodeStartOffset
                    };
                }
                else {
                    column -= x.piece.length - prevAccumualtedValue;
                    break;
                }
            }
            else {
                lineNumber -= x.lf_left + x.piece.lineFeedCnt;
                nodeStartOffset += x.size_left + x.piece.length;
                x = x.right;
            }
        }
        // search in order, to find the node contains position.column
        x = x.next();
        while (x !== SENTINEL$1) {
            if (x.piece.lineFeedCnt > 0) {
                let accumulatedValue = this.getAccumulatedValue(x, 0);
                let nodeStartOffset = this.offsetOfNode(x);
                return {
                    node: x,
                    remainder: Math.min(column - 1, accumulatedValue),
                    nodeStartOffset
                };
            }
            else {
                if (x.piece.length >= column - 1) {
                    let nodeStartOffset = this.offsetOfNode(x);
                    return {
                        node: x,
                        remainder: column - 1,
                        nodeStartOffset
                    };
                }
                else {
                    column -= x.piece.length;
                }
            }
            x = x.next();
        }
        return null;
    }
    nodeCharCodeAt(node, offset) {
        if (node.piece.lineFeedCnt < 1) {
            return -1;
        }
        let buffer = this._buffers[node.piece.bufferIndex];
        let newOffset = this.offsetInBuffer(node.piece.bufferIndex, node.piece.start) + offset;
        return buffer.buffer.charCodeAt(newOffset);
    }
    offsetOfNode(node) {
        if (!node) {
            return 0;
        }
        let pos = node.size_left;
        while (node !== this.root) {
            if (node.parent.right === node) {
                pos += node.parent.size_left + node.parent.piece.length;
            }
            node = node.parent;
        }
        return pos;
    }
    // #endregion
    // #region CRLF
    shouldCheckCRLF() {
        return !(this._EOLNormalized && this._EOL === '\n');
    }
    startWithLF(val) {
        if (typeof val === 'string') {
            return val.charCodeAt(0) === 10;
        }
        if (val === SENTINEL$1 || val.piece.lineFeedCnt === 0) {
            return false;
        }
        let piece = val.piece;
        let lineStarts = this._buffers[piece.bufferIndex].lineStarts;
        let line = piece.start.line;
        let startOffset = lineStarts[line] + piece.start.column;
        if (line === lineStarts.length - 1) {
            // last line, so there is no line feed at the end of this line
            return false;
        }
        let nextLineOffset = lineStarts[line + 1];
        if (nextLineOffset > startOffset + 1) {
            return false;
        }
        return this._buffers[piece.bufferIndex].buffer.charCodeAt(startOffset) === 10;
    }
    endWithCR(val) {
        if (typeof val === 'string') {
            return val.charCodeAt(val.length - 1) === 13;
        }
        if (val === SENTINEL$1 || val.piece.lineFeedCnt === 0) {
            return false;
        }
        return this.nodeCharCodeAt(val, val.piece.length - 1) === 13;
    }
    validateCRLFWithPrevNode(nextNode) {
        if (this.shouldCheckCRLF() && this.startWithLF(nextNode)) {
            let node = nextNode.prev();
            if (this.endWithCR(node)) {
                this.fixCRLF(node, nextNode);
            }
        }
    }
    validateCRLFWithNextNode(node) {
        if (this.shouldCheckCRLF() && this.endWithCR(node)) {
            let nextNode = node.next();
            if (this.startWithLF(nextNode)) {
                this.fixCRLF(node, nextNode);
            }
        }
    }
    fixCRLF(prev, next) {
        let nodesToDel = [];
        // update node
        let lineStarts = this._buffers[prev.piece.bufferIndex].lineStarts;
        let newEnd;
        if (prev.piece.end.column === 0) {
            // it means, last line ends with \r, not \r\n
            newEnd = { line: prev.piece.end.line - 1, column: lineStarts[prev.piece.end.line] - lineStarts[prev.piece.end.line - 1] - 1 };
        }
        else {
            // \r\n
            newEnd = { line: prev.piece.end.line, column: prev.piece.end.column - 1 };
        }
        const prevNewLength = prev.piece.length - 1;
        const prevNewLFCnt = prev.piece.lineFeedCnt - 1;
        prev.piece = new Piece(prev.piece.bufferIndex, prev.piece.start, newEnd, prevNewLFCnt, prevNewLength);
        updateTreeMetadata(this, prev, -1, -1);
        if (prev.piece.length === 0) {
            nodesToDel.push(prev);
        }
        // update nextNode
        let newStart = { line: next.piece.start.line + 1, column: 0 };
        const newLength = next.piece.length - 1;
        const newLineFeedCnt = this.getLineFeedCnt(next.piece.bufferIndex, newStart, next.piece.end);
        next.piece = new Piece(next.piece.bufferIndex, newStart, next.piece.end, newLineFeedCnt, newLength);
        updateTreeMetadata(this, next, -1, -1);
        if (next.piece.length === 0) {
            nodesToDel.push(next);
        }
        // create new piece which contains \r\n
        let pieces = this.createNewPieces('\r\n');
        this.rbInsertRight(prev, pieces[0]);
        // delete empty nodes
        for (let i = 0; i < nodesToDel.length; i++) {
            rbDelete(this, nodesToDel[i]);
        }
    }
    adjustCarriageReturnFromNext(value, node) {
        if (this.shouldCheckCRLF() && this.endWithCR(value)) {
            let nextNode = node.next();
            if (this.startWithLF(nextNode)) {
                // move `\n` forward
                value += '\n';
                if (nextNode.piece.length === 1) {
                    rbDelete(this, nextNode);
                }
                else {
                    const piece = nextNode.piece;
                    const newStart = { line: piece.start.line + 1, column: 0 };
                    const newLength = piece.length - 1;
                    const newLineFeedCnt = this.getLineFeedCnt(piece.bufferIndex, newStart, piece.end);
                    nextNode.piece = new Piece(piece.bufferIndex, newStart, piece.end, newLineFeedCnt, newLength);
                    updateTreeMetadata(this, nextNode, -1, -1);
                }
                return true;
            }
        }
        return false;
    }
    // #endregion
    // #endregion
    // #region Tree operations
    iterate(node, callback) {
        if (node === SENTINEL$1) {
            return callback(SENTINEL$1);
        }
        let leftRet = this.iterate(node.left, callback);
        if (!leftRet) {
            return leftRet;
        }
        return callback(node) && this.iterate(node.right, callback);
    }
    getNodeContent(node) {
        if (node === SENTINEL$1) {
            return '';
        }
        let buffer = this._buffers[node.piece.bufferIndex];
        let currentContent;
        let piece = node.piece;
        let startOffset = this.offsetInBuffer(piece.bufferIndex, piece.start);
        let endOffset = this.offsetInBuffer(piece.bufferIndex, piece.end);
        currentContent = buffer.buffer.substring(startOffset, endOffset);
        return currentContent;
    }
    getPieceContent(piece) {
        let buffer = this._buffers[piece.bufferIndex];
        let startOffset = this.offsetInBuffer(piece.bufferIndex, piece.start);
        let endOffset = this.offsetInBuffer(piece.bufferIndex, piece.end);
        let currentContent = buffer.buffer.substring(startOffset, endOffset);
        return currentContent;
    }
    /**
     *      node              node
     *     /  \              /  \
     *    a   b    <----   a    b
     *                         /
     *                        z
     */
    rbInsertRight(node, p) {
        let z = new TreeNode(p, 1 /* Red */);
        z.left = SENTINEL$1;
        z.right = SENTINEL$1;
        z.parent = SENTINEL$1;
        z.size_left = 0;
        z.lf_left = 0;
        let x = this.root;
        if (x === SENTINEL$1) {
            this.root = z;
            z.color = 0 /* Black */;
        }
        else if (node.right === SENTINEL$1) {
            node.right = z;
            z.parent = node;
        }
        else {
            let nextNode = leftest$1(node.right);
            nextNode.left = z;
            z.parent = nextNode;
        }
        fixInsert(this, z);
        return z;
    }
    /**
     *      node              node
     *     /  \              /  \
     *    a   b     ---->   a    b
     *                       \
     *                        z
     */
    rbInsertLeft(node, p) {
        let z = new TreeNode(p, 1 /* Red */);
        z.left = SENTINEL$1;
        z.right = SENTINEL$1;
        z.parent = SENTINEL$1;
        z.size_left = 0;
        z.lf_left = 0;
        if (this.root === SENTINEL$1) {
            this.root = z;
            z.color = 0 /* Black */;
        }
        else if (node.left === SENTINEL$1) {
            node.left = z;
            z.parent = node;
        }
        else {
            let prevNode = righttest(node.left); // a
            prevNode.right = z;
            z.parent = prevNode;
        }
        fixInsert(this, z);
        return z;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function countEOL(text) {
    let eolCount = 0;
    let firstLineLength = 0;
    let lastLineStart = 0;
    let eol = 0 /* Unknown */;
    for (let i = 0, len = text.length; i < len; i++) {
        const chr = text.charCodeAt(i);
        if (chr === 13 /* CarriageReturn */) {
            if (eolCount === 0) {
                firstLineLength = i;
            }
            eolCount++;
            if (i + 1 < len && text.charCodeAt(i + 1) === 10 /* LineFeed */) {
                // \r\n... case
                eol |= 2 /* CRLF */;
                i++; // skip \n
            }
            else {
                // \r... case
                eol |= 3 /* Invalid */;
            }
            lastLineStart = i + 1;
        }
        else if (chr === 10 /* LineFeed */) {
            // \n... case
            eol |= 1 /* LF */;
            if (eolCount === 0) {
                firstLineLength = i;
            }
            eolCount++;
            lastLineStart = i + 1;
        }
    }
    if (eolCount === 0) {
        firstLineLength = text.length;
    }
    return [eolCount, firstLineLength, text.length - lastLineStart, eol];
}
function getDefaultMetadata(topLevelLanguageId) {
    return ((topLevelLanguageId << 0 /* LANGUAGEID_OFFSET */)
        | (0 /* Other */ << 8 /* TOKEN_TYPE_OFFSET */)
        | (0 /* None */ << 11 /* FONT_STYLE_OFFSET */)
        | (1 /* DefaultForeground */ << 14 /* FOREGROUND_OFFSET */)
        | (2 /* DefaultBackground */ << 23 /* BACKGROUND_OFFSET */)) >>> 0;
}
const EMPTY_LINE_TOKENS = (new Uint32Array(0)).buffer;
class MultilineTokensBuilder {
    constructor() {
        this.tokens = [];
    }
    add(lineNumber, lineTokens) {
        if (this.tokens.length > 0) {
            const last = this.tokens[this.tokens.length - 1];
            const lastLineNumber = last.startLineNumber + last.tokens.length - 1;
            if (lastLineNumber + 1 === lineNumber) {
                // append
                last.tokens.push(lineTokens);
                return;
            }
        }
        this.tokens.push(new MultilineTokens(lineNumber, [lineTokens]));
    }
}
class SparseEncodedTokens {
    constructor(tokens) {
        this._tokens = tokens;
        this._tokenCount = tokens.length / 4;
    }
    toString(startLineNumber) {
        let pieces = [];
        for (let i = 0; i < this._tokenCount; i++) {
            pieces.push(`(${this._getDeltaLine(i) + startLineNumber},${this._getStartCharacter(i)}-${this._getEndCharacter(i)})`);
        }
        return `[${pieces.join(',')}]`;
    }
    getMaxDeltaLine() {
        const tokenCount = this._getTokenCount();
        if (tokenCount === 0) {
            return -1;
        }
        return this._getDeltaLine(tokenCount - 1);
    }
    getRange() {
        const tokenCount = this._getTokenCount();
        if (tokenCount === 0) {
            return null;
        }
        const startChar = this._getStartCharacter(0);
        const maxDeltaLine = this._getDeltaLine(tokenCount - 1);
        const endChar = this._getEndCharacter(tokenCount - 1);
        return new Range(0, startChar + 1, maxDeltaLine, endChar + 1);
    }
    _getTokenCount() {
        return this._tokenCount;
    }
    _getDeltaLine(tokenIndex) {
        return this._tokens[4 * tokenIndex];
    }
    _getStartCharacter(tokenIndex) {
        return this._tokens[4 * tokenIndex + 1];
    }
    _getEndCharacter(tokenIndex) {
        return this._tokens[4 * tokenIndex + 2];
    }
    isEmpty() {
        return (this._getTokenCount() === 0);
    }
    getLineTokens(deltaLine) {
        let low = 0;
        let high = this._getTokenCount() - 1;
        while (low < high) {
            const mid = low + Math.floor((high - low) / 2);
            const midDeltaLine = this._getDeltaLine(mid);
            if (midDeltaLine < deltaLine) {
                low = mid + 1;
            }
            else if (midDeltaLine > deltaLine) {
                high = mid - 1;
            }
            else {
                let min = mid;
                while (min > low && this._getDeltaLine(min - 1) === deltaLine) {
                    min--;
                }
                let max = mid;
                while (max < high && this._getDeltaLine(max + 1) === deltaLine) {
                    max++;
                }
                return new LineTokens2(this._tokens.subarray(4 * min, 4 * max + 4));
            }
        }
        if (this._getDeltaLine(low) === deltaLine) {
            return new LineTokens2(this._tokens.subarray(4 * low, 4 * low + 4));
        }
        return null;
    }
    clear() {
        this._tokenCount = 0;
    }
    removeTokens(startDeltaLine, startChar, endDeltaLine, endChar) {
        const tokens = this._tokens;
        const tokenCount = this._tokenCount;
        let newTokenCount = 0;
        let hasDeletedTokens = false;
        let firstDeltaLine = 0;
        for (let i = 0; i < tokenCount; i++) {
            const srcOffset = 4 * i;
            const tokenDeltaLine = tokens[srcOffset];
            const tokenStartCharacter = tokens[srcOffset + 1];
            const tokenEndCharacter = tokens[srcOffset + 2];
            const tokenMetadata = tokens[srcOffset + 3];
            if ((tokenDeltaLine > startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar))
                && (tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar))) {
                hasDeletedTokens = true;
            }
            else {
                if (newTokenCount === 0) {
                    firstDeltaLine = tokenDeltaLine;
                }
                if (hasDeletedTokens) {
                    // must move the token to the left
                    const destOffset = 4 * newTokenCount;
                    tokens[destOffset] = tokenDeltaLine - firstDeltaLine;
                    tokens[destOffset + 1] = tokenStartCharacter;
                    tokens[destOffset + 2] = tokenEndCharacter;
                    tokens[destOffset + 3] = tokenMetadata;
                }
                newTokenCount++;
            }
        }
        this._tokenCount = newTokenCount;
        return firstDeltaLine;
    }
    split(startDeltaLine, startChar, endDeltaLine, endChar) {
        const tokens = this._tokens;
        const tokenCount = this._tokenCount;
        let aTokens = [];
        let bTokens = [];
        let destTokens = aTokens;
        let destOffset = 0;
        let destFirstDeltaLine = 0;
        for (let i = 0; i < tokenCount; i++) {
            const srcOffset = 4 * i;
            const tokenDeltaLine = tokens[srcOffset];
            const tokenStartCharacter = tokens[srcOffset + 1];
            const tokenEndCharacter = tokens[srcOffset + 2];
            const tokenMetadata = tokens[srcOffset + 3];
            if ((tokenDeltaLine > startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter >= startChar))) {
                if ((tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter <= endChar))) {
                    // this token is touching the range
                    continue;
                }
                else {
                    // this token is after the range
                    if (destTokens !== bTokens) {
                        // this token is the first token after the range
                        destTokens = bTokens;
                        destOffset = 0;
                        destFirstDeltaLine = tokenDeltaLine;
                    }
                }
            }
            destTokens[destOffset++] = tokenDeltaLine - destFirstDeltaLine;
            destTokens[destOffset++] = tokenStartCharacter;
            destTokens[destOffset++] = tokenEndCharacter;
            destTokens[destOffset++] = tokenMetadata;
        }
        return [new SparseEncodedTokens(new Uint32Array(aTokens)), new SparseEncodedTokens(new Uint32Array(bTokens)), destFirstDeltaLine];
    }
    acceptDeleteRange(horizontalShiftForFirstLineTokens, startDeltaLine, startCharacter, endDeltaLine, endCharacter) {
        // This is a bit complex, here are the cases I used to think about this:
        //
        // 1. The token starts before the deletion range
        // 1a. The token is completely before the deletion range
        //               -----------
        //                          xxxxxxxxxxx
        // 1b. The token starts before, the deletion range ends after the token
        //               -----------
        //                      xxxxxxxxxxx
        // 1c. The token starts before, the deletion range ends precisely with the token
        //               ---------------
        //                      xxxxxxxx
        // 1d. The token starts before, the deletion range is inside the token
        //               ---------------
        //                    xxxxx
        //
        // 2. The token starts at the same position with the deletion range
        // 2a. The token starts at the same position, and ends inside the deletion range
        //               -------
        //               xxxxxxxxxxx
        // 2b. The token starts at the same position, and ends at the same position as the deletion range
        //               ----------
        //               xxxxxxxxxx
        // 2c. The token starts at the same position, and ends after the deletion range
        //               -------------
        //               xxxxxxx
        //
        // 3. The token starts inside the deletion range
        // 3a. The token is inside the deletion range
        //                -------
        //             xxxxxxxxxxxxx
        // 3b. The token starts inside the deletion range, and ends at the same position as the deletion range
        //                ----------
        //             xxxxxxxxxxxxx
        // 3c. The token starts inside the deletion range, and ends after the deletion range
        //                ------------
        //             xxxxxxxxxxx
        //
        // 4. The token starts after the deletion range
        //                  -----------
        //          xxxxxxxx
        //
        const tokens = this._tokens;
        const tokenCount = this._tokenCount;
        const deletedLineCount = (endDeltaLine - startDeltaLine);
        let newTokenCount = 0;
        let hasDeletedTokens = false;
        for (let i = 0; i < tokenCount; i++) {
            const srcOffset = 4 * i;
            let tokenDeltaLine = tokens[srcOffset];
            let tokenStartCharacter = tokens[srcOffset + 1];
            let tokenEndCharacter = tokens[srcOffset + 2];
            const tokenMetadata = tokens[srcOffset + 3];
            if (tokenDeltaLine < startDeltaLine || (tokenDeltaLine === startDeltaLine && tokenEndCharacter <= startCharacter)) {
                // 1a. The token is completely before the deletion range
                // => nothing to do
                newTokenCount++;
                continue;
            }
            else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter < startCharacter) {
                // 1b, 1c, 1d
                // => the token survives, but it needs to shrink
                if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                    // 1d. The token starts before, the deletion range is inside the token
                    // => the token shrinks by the deletion character count
                    tokenEndCharacter -= (endCharacter - startCharacter);
                }
                else {
                    // 1b. The token starts before, the deletion range ends after the token
                    // 1c. The token starts before, the deletion range ends precisely with the token
                    // => the token shrinks its ending to the deletion start
                    tokenEndCharacter = startCharacter;
                }
            }
            else if (tokenDeltaLine === startDeltaLine && tokenStartCharacter === startCharacter) {
                // 2a, 2b, 2c
                if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                    // 2c. The token starts at the same position, and ends after the deletion range
                    // => the token shrinks by the deletion character count
                    tokenEndCharacter -= (endCharacter - startCharacter);
                }
                else {
                    // 2a. The token starts at the same position, and ends inside the deletion range
                    // 2b. The token starts at the same position, and ends at the same position as the deletion range
                    // => the token is deleted
                    hasDeletedTokens = true;
                    continue;
                }
            }
            else if (tokenDeltaLine < endDeltaLine || (tokenDeltaLine === endDeltaLine && tokenStartCharacter < endCharacter)) {
                // 3a, 3b, 3c
                if (tokenDeltaLine === endDeltaLine && tokenEndCharacter > endCharacter) {
                    // 3c. The token starts inside the deletion range, and ends after the deletion range
                    // => the token moves left and shrinks
                    if (tokenDeltaLine === startDeltaLine) {
                        // the deletion started on the same line as the token
                        // => the token moves left and shrinks
                        tokenStartCharacter = startCharacter;
                        tokenEndCharacter = tokenStartCharacter + (tokenEndCharacter - endCharacter);
                    }
                    else {
                        // the deletion started on a line above the token
                        // => the token moves to the beginning of the line
                        tokenStartCharacter = 0;
                        tokenEndCharacter = tokenStartCharacter + (tokenEndCharacter - endCharacter);
                    }
                }
                else {
                    // 3a. The token is inside the deletion range
                    // 3b. The token starts inside the deletion range, and ends at the same position as the deletion range
                    // => the token is deleted
                    hasDeletedTokens = true;
                    continue;
                }
            }
            else if (tokenDeltaLine > endDeltaLine) {
                // 4. (partial) The token starts after the deletion range, on a line below...
                if (deletedLineCount === 0 && !hasDeletedTokens) {
                    // early stop, there is no need to walk all the tokens and do nothing...
                    newTokenCount = tokenCount;
                    break;
                }
                tokenDeltaLine -= deletedLineCount;
            }
            else if (tokenDeltaLine === endDeltaLine && tokenStartCharacter >= endCharacter) {
                // 4. (continued) The token starts after the deletion range, on the last line where a deletion occurs
                if (horizontalShiftForFirstLineTokens && tokenDeltaLine === 0) {
                    tokenStartCharacter += horizontalShiftForFirstLineTokens;
                    tokenEndCharacter += horizontalShiftForFirstLineTokens;
                }
                tokenDeltaLine -= deletedLineCount;
                tokenStartCharacter -= (endCharacter - startCharacter);
                tokenEndCharacter -= (endCharacter - startCharacter);
            }
            else {
                throw new Error(`Not possible!`);
            }
            const destOffset = 4 * newTokenCount;
            tokens[destOffset] = tokenDeltaLine;
            tokens[destOffset + 1] = tokenStartCharacter;
            tokens[destOffset + 2] = tokenEndCharacter;
            tokens[destOffset + 3] = tokenMetadata;
            newTokenCount++;
        }
        this._tokenCount = newTokenCount;
    }
    acceptInsertText(deltaLine, character, eolCount, firstLineLength, lastLineLength, firstCharCode) {
        // Here are the cases I used to think about this:
        //
        // 1. The token is completely before the insertion point
        //            -----------   |
        // 2. The token ends precisely at the insertion point
        //            -----------|
        // 3. The token contains the insertion point
        //            -----|------
        // 4. The token starts precisely at the insertion point
        //            |-----------
        // 5. The token is completely after the insertion point
        //            |   -----------
        //
        const isInsertingPreciselyOneWordCharacter = (eolCount === 0
            && firstLineLength === 1
            && ((firstCharCode >= 48 /* Digit0 */ && firstCharCode <= 57 /* Digit9 */)
                || (firstCharCode >= 65 /* A */ && firstCharCode <= 90 /* Z */)
                || (firstCharCode >= 97 /* a */ && firstCharCode <= 122 /* z */)));
        const tokens = this._tokens;
        const tokenCount = this._tokenCount;
        for (let i = 0; i < tokenCount; i++) {
            const offset = 4 * i;
            let tokenDeltaLine = tokens[offset];
            let tokenStartCharacter = tokens[offset + 1];
            let tokenEndCharacter = tokens[offset + 2];
            if (tokenDeltaLine < deltaLine || (tokenDeltaLine === deltaLine && tokenEndCharacter < character)) {
                // 1. The token is completely before the insertion point
                // => nothing to do
                continue;
            }
            else if (tokenDeltaLine === deltaLine && tokenEndCharacter === character) {
                // 2. The token ends precisely at the insertion point
                // => expand the end character only if inserting precisely one character that is a word character
                if (isInsertingPreciselyOneWordCharacter) {
                    tokenEndCharacter += 1;
                }
                else {
                    continue;
                }
            }
            else if (tokenDeltaLine === deltaLine && tokenStartCharacter < character && character < tokenEndCharacter) {
                // 3. The token contains the insertion point
                if (eolCount === 0) {
                    // => just expand the end character
                    tokenEndCharacter += firstLineLength;
                }
                else {
                    // => cut off the token
                    tokenEndCharacter = character;
                }
            }
            else {
                // 4. or 5.
                if (tokenDeltaLine === deltaLine && tokenStartCharacter === character) {
                    // 4. The token starts precisely at the insertion point
                    // => grow the token (by keeping its start constant) only if inserting precisely one character that is a word character
                    // => otherwise behave as in case 5.
                    if (isInsertingPreciselyOneWordCharacter) {
                        continue;
                    }
                }
                // => the token must move and keep its size constant
                if (tokenDeltaLine === deltaLine) {
                    tokenDeltaLine += eolCount;
                    // this token is on the line where the insertion is taking place
                    if (eolCount === 0) {
                        tokenStartCharacter += firstLineLength;
                        tokenEndCharacter += firstLineLength;
                    }
                    else {
                        const tokenLength = tokenEndCharacter - tokenStartCharacter;
                        tokenStartCharacter = lastLineLength + (tokenStartCharacter - character);
                        tokenEndCharacter = tokenStartCharacter + tokenLength;
                    }
                }
                else {
                    tokenDeltaLine += eolCount;
                }
            }
            tokens[offset] = tokenDeltaLine;
            tokens[offset + 1] = tokenStartCharacter;
            tokens[offset + 2] = tokenEndCharacter;
        }
    }
}
class LineTokens2 {
    constructor(tokens) {
        this._tokens = tokens;
    }
    getCount() {
        return this._tokens.length / 4;
    }
    getStartCharacter(tokenIndex) {
        return this._tokens[4 * tokenIndex + 1];
    }
    getEndCharacter(tokenIndex) {
        return this._tokens[4 * tokenIndex + 2];
    }
    getMetadata(tokenIndex) {
        return this._tokens[4 * tokenIndex + 3];
    }
}
class MultilineTokens2 {
    constructor(startLineNumber, tokens) {
        this.startLineNumber = startLineNumber;
        this.tokens = tokens;
        this.endLineNumber = this.startLineNumber + this.tokens.getMaxDeltaLine();
    }
    toString() {
        return this.tokens.toString(this.startLineNumber);
    }
    _updateEndLineNumber() {
        this.endLineNumber = this.startLineNumber + this.tokens.getMaxDeltaLine();
    }
    isEmpty() {
        return this.tokens.isEmpty();
    }
    getLineTokens(lineNumber) {
        if (this.startLineNumber <= lineNumber && lineNumber <= this.endLineNumber) {
            return this.tokens.getLineTokens(lineNumber - this.startLineNumber);
        }
        return null;
    }
    getRange() {
        const deltaRange = this.tokens.getRange();
        if (!deltaRange) {
            return deltaRange;
        }
        return new Range(this.startLineNumber + deltaRange.startLineNumber, deltaRange.startColumn, this.startLineNumber + deltaRange.endLineNumber, deltaRange.endColumn);
    }
    removeTokens(range) {
        const startLineIndex = range.startLineNumber - this.startLineNumber;
        const endLineIndex = range.endLineNumber - this.startLineNumber;
        this.startLineNumber += this.tokens.removeTokens(startLineIndex, range.startColumn - 1, endLineIndex, range.endColumn - 1);
        this._updateEndLineNumber();
    }
    split(range) {
        // split tokens to two:
        // a) all the tokens before `range`
        // b) all the tokens after `range`
        const startLineIndex = range.startLineNumber - this.startLineNumber;
        const endLineIndex = range.endLineNumber - this.startLineNumber;
        const [a, b, bDeltaLine] = this.tokens.split(startLineIndex, range.startColumn - 1, endLineIndex, range.endColumn - 1);
        return [new MultilineTokens2(this.startLineNumber, a), new MultilineTokens2(this.startLineNumber + bDeltaLine, b)];
    }
    applyEdit(range, text) {
        const [eolCount, firstLineLength, lastLineLength] = countEOL(text);
        this.acceptEdit(range, eolCount, firstLineLength, lastLineLength, text.length > 0 ? text.charCodeAt(0) : 0 /* Null */);
    }
    acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode) {
        this._acceptDeleteRange(range);
        this._acceptInsertText(new Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength, lastLineLength, firstCharCode);
        this._updateEndLineNumber();
    }
    _acceptDeleteRange(range) {
        if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
            // Nothing to delete
            return;
        }
        const firstLineIndex = range.startLineNumber - this.startLineNumber;
        const lastLineIndex = range.endLineNumber - this.startLineNumber;
        if (lastLineIndex < 0) {
            // this deletion occurs entirely before this block, so we only need to adjust line numbers
            const deletedLinesCount = lastLineIndex - firstLineIndex;
            this.startLineNumber -= deletedLinesCount;
            return;
        }
        const tokenMaxDeltaLine = this.tokens.getMaxDeltaLine();
        if (firstLineIndex >= tokenMaxDeltaLine + 1) {
            // this deletion occurs entirely after this block, so there is nothing to do
            return;
        }
        if (firstLineIndex < 0 && lastLineIndex >= tokenMaxDeltaLine + 1) {
            // this deletion completely encompasses this block
            this.startLineNumber = 0;
            this.tokens.clear();
            return;
        }
        if (firstLineIndex < 0) {
            const deletedBefore = -firstLineIndex;
            this.startLineNumber -= deletedBefore;
            this.tokens.acceptDeleteRange(range.startColumn - 1, 0, 0, lastLineIndex, range.endColumn - 1);
        }
        else {
            this.tokens.acceptDeleteRange(0, firstLineIndex, range.startColumn - 1, lastLineIndex, range.endColumn - 1);
        }
    }
    _acceptInsertText(position, eolCount, firstLineLength, lastLineLength, firstCharCode) {
        if (eolCount === 0 && firstLineLength === 0) {
            // Nothing to insert
            return;
        }
        const lineIndex = position.lineNumber - this.startLineNumber;
        if (lineIndex < 0) {
            // this insertion occurs before this block, so we only need to adjust line numbers
            this.startLineNumber += eolCount;
            return;
        }
        const tokenMaxDeltaLine = this.tokens.getMaxDeltaLine();
        if (lineIndex >= tokenMaxDeltaLine + 1) {
            // this insertion occurs after this block, so there is nothing to do
            return;
        }
        this.tokens.acceptInsertText(lineIndex, position.column - 1, eolCount, firstLineLength, lastLineLength, firstCharCode);
    }
}
class MultilineTokens {
    constructor(startLineNumber, tokens) {
        this.startLineNumber = startLineNumber;
        this.tokens = tokens;
    }
}
function toUint32Array(arr) {
    if (arr instanceof Uint32Array) {
        return arr;
    }
    else {
        return new Uint32Array(arr);
    }
}
class TokensStore2 {
    constructor() {
        this._pieces = [];
        this._isComplete = false;
    }
    flush() {
        this._pieces = [];
        this._isComplete = false;
    }
    isEmpty() {
        return (this._pieces.length === 0);
    }
    set(pieces, isComplete) {
        this._pieces = pieces || [];
        this._isComplete = isComplete;
    }
    setPartial(_range, pieces) {
        // console.log(`setPartial ${_range} ${pieces.map(p => p.toString()).join(', ')}`);
        let range = _range;
        if (pieces.length > 0) {
            const _firstRange = pieces[0].getRange();
            const _lastRange = pieces[pieces.length - 1].getRange();
            if (!_firstRange || !_lastRange) {
                return _range;
            }
            range = _range.plusRange(_firstRange).plusRange(_lastRange);
        }
        let insertPosition = null;
        for (let i = 0, len = this._pieces.length; i < len; i++) {
            const piece = this._pieces[i];
            if (piece.endLineNumber < range.startLineNumber) {
                // this piece is before the range
                continue;
            }
            if (piece.startLineNumber > range.endLineNumber) {
                // this piece is after the range, so mark the spot before this piece
                // as a good insertion position and stop looping
                insertPosition = insertPosition || { index: i };
                break;
            }
            // this piece might intersect with the range
            piece.removeTokens(range);
            if (piece.isEmpty()) {
                // remove the piece if it became empty
                this._pieces.splice(i, 1);
                i--;
                len--;
                continue;
            }
            if (piece.endLineNumber < range.startLineNumber) {
                // after removal, this piece is before the range
                continue;
            }
            if (piece.startLineNumber > range.endLineNumber) {
                // after removal, this piece is after the range
                insertPosition = insertPosition || { index: i };
                continue;
            }
            // after removal, this piece contains the range
            const [a, b] = piece.split(range);
            if (a.isEmpty()) {
                // this piece is actually after the range
                insertPosition = insertPosition || { index: i };
                continue;
            }
            if (b.isEmpty()) {
                // this piece is actually before the range
                continue;
            }
            this._pieces.splice(i, 1, a, b);
            i++;
            len++;
            insertPosition = insertPosition || { index: i };
        }
        insertPosition = insertPosition || { index: this._pieces.length };
        if (pieces.length > 0) {
            this._pieces = arrayInsert(this._pieces, insertPosition.index, pieces);
        }
        // console.log(`I HAVE ${this._pieces.length} pieces`);
        // console.log(`${this._pieces.map(p => p.toString()).join('\n')}`);
        return range;
    }
    isComplete() {
        return this._isComplete;
    }
    addSemanticTokens(lineNumber, aTokens) {
        const pieces = this._pieces;
        if (pieces.length === 0) {
            return aTokens;
        }
        const pieceIndex = TokensStore2._findFirstPieceWithLine(pieces, lineNumber);
        const bTokens = pieces[pieceIndex].getLineTokens(lineNumber);
        if (!bTokens) {
            return aTokens;
        }
        const aLen = aTokens.getCount();
        const bLen = bTokens.getCount();
        let aIndex = 0;
        let result = [], resultLen = 0;
        let lastEndOffset = 0;
        const emitToken = (endOffset, metadata) => {
            if (endOffset === lastEndOffset) {
                return;
            }
            lastEndOffset = endOffset;
            result[resultLen++] = endOffset;
            result[resultLen++] = metadata;
        };
        for (let bIndex = 0; bIndex < bLen; bIndex++) {
            const bStartCharacter = bTokens.getStartCharacter(bIndex);
            const bEndCharacter = bTokens.getEndCharacter(bIndex);
            const bMetadata = bTokens.getMetadata(bIndex);
            const bMask = (((bMetadata & 1 /* SEMANTIC_USE_ITALIC */) ? 2048 /* ITALIC_MASK */ : 0)
                | ((bMetadata & 2 /* SEMANTIC_USE_BOLD */) ? 4096 /* BOLD_MASK */ : 0)
                | ((bMetadata & 4 /* SEMANTIC_USE_UNDERLINE */) ? 8192 /* UNDERLINE_MASK */ : 0)
                | ((bMetadata & 8 /* SEMANTIC_USE_FOREGROUND */) ? 8372224 /* FOREGROUND_MASK */ : 0)
                | ((bMetadata & 16 /* SEMANTIC_USE_BACKGROUND */) ? 4286578688 /* BACKGROUND_MASK */ : 0)) >>> 0;
            const aMask = (~bMask) >>> 0;
            // push any token from `a` that is before `b`
            while (aIndex < aLen && aTokens.getEndOffset(aIndex) <= bStartCharacter) {
                emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
                aIndex++;
            }
            // push the token from `a` if it intersects the token from `b`
            if (aIndex < aLen && aTokens.getStartOffset(aIndex) < bStartCharacter) {
                emitToken(bStartCharacter, aTokens.getMetadata(aIndex));
            }
            // skip any tokens from `a` that are contained inside `b`
            while (aIndex < aLen && aTokens.getEndOffset(aIndex) < bEndCharacter) {
                emitToken(aTokens.getEndOffset(aIndex), (aTokens.getMetadata(aIndex) & aMask) | (bMetadata & bMask));
                aIndex++;
            }
            if (aIndex < aLen) {
                emitToken(bEndCharacter, (aTokens.getMetadata(aIndex) & aMask) | (bMetadata & bMask));
                if (aTokens.getEndOffset(aIndex) === bEndCharacter) {
                    // `a` ends exactly at the same spot as `b`!
                    aIndex++;
                }
            }
            else {
                const aMergeIndex = Math.min(Math.max(0, aIndex - 1), aLen - 1);
                // push the token from `b`
                emitToken(bEndCharacter, (aTokens.getMetadata(aMergeIndex) & aMask) | (bMetadata & bMask));
            }
        }
        // push the remaining tokens from `a`
        while (aIndex < aLen) {
            emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
            aIndex++;
        }
        return new LineTokens(new Uint32Array(result), aTokens.getLineContent());
    }
    static _findFirstPieceWithLine(pieces, lineNumber) {
        let low = 0;
        let high = pieces.length - 1;
        while (low < high) {
            let mid = low + Math.floor((high - low) / 2);
            if (pieces[mid].endLineNumber < lineNumber) {
                low = mid + 1;
            }
            else if (pieces[mid].startLineNumber > lineNumber) {
                high = mid - 1;
            }
            else {
                while (mid > low && pieces[mid - 1].startLineNumber <= lineNumber && lineNumber <= pieces[mid - 1].endLineNumber) {
                    mid--;
                }
                return mid;
            }
        }
        return low;
    }
    //#region Editing
    acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode) {
        for (const piece of this._pieces) {
            piece.acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode);
        }
    }
}
class TokensStore {
    constructor() {
        this._lineTokens = [];
        this._len = 0;
    }
    flush() {
        this._lineTokens = [];
        this._len = 0;
    }
    getTokens(topLevelLanguageId, lineIndex, lineText) {
        let rawLineTokens = null;
        if (lineIndex < this._len) {
            rawLineTokens = this._lineTokens[lineIndex];
        }
        if (rawLineTokens !== null && rawLineTokens !== EMPTY_LINE_TOKENS) {
            return new LineTokens(toUint32Array(rawLineTokens), lineText);
        }
        let lineTokens = new Uint32Array(2);
        lineTokens[0] = lineText.length;
        lineTokens[1] = getDefaultMetadata(topLevelLanguageId);
        return new LineTokens(lineTokens, lineText);
    }
    static _massageTokens(topLevelLanguageId, lineTextLength, _tokens) {
        const tokens = _tokens ? toUint32Array(_tokens) : null;
        if (lineTextLength === 0) {
            let hasDifferentLanguageId = false;
            if (tokens && tokens.length > 1) {
                hasDifferentLanguageId = (TokenMetadata.getLanguageId(tokens[1]) !== topLevelLanguageId);
            }
            if (!hasDifferentLanguageId) {
                return EMPTY_LINE_TOKENS;
            }
        }
        if (!tokens || tokens.length === 0) {
            const tokens = new Uint32Array(2);
            tokens[0] = lineTextLength;
            tokens[1] = getDefaultMetadata(topLevelLanguageId);
            return tokens.buffer;
        }
        // Ensure the last token covers the end of the text
        tokens[tokens.length - 2] = lineTextLength;
        if (tokens.byteOffset === 0 && tokens.byteLength === tokens.buffer.byteLength) {
            // Store directly the ArrayBuffer pointer to save an object
            return tokens.buffer;
        }
        return tokens;
    }
    _ensureLine(lineIndex) {
        while (lineIndex >= this._len) {
            this._lineTokens[this._len] = null;
            this._len++;
        }
    }
    _deleteLines(start, deleteCount) {
        if (deleteCount === 0) {
            return;
        }
        if (start + deleteCount > this._len) {
            deleteCount = this._len - start;
        }
        this._lineTokens.splice(start, deleteCount);
        this._len -= deleteCount;
    }
    _insertLines(insertIndex, insertCount) {
        if (insertCount === 0) {
            return;
        }
        let lineTokens = [];
        for (let i = 0; i < insertCount; i++) {
            lineTokens[i] = null;
        }
        this._lineTokens = arrayInsert(this._lineTokens, insertIndex, lineTokens);
        this._len += insertCount;
    }
    setTokens(topLevelLanguageId, lineIndex, lineTextLength, _tokens, checkEquality) {
        const tokens = TokensStore._massageTokens(topLevelLanguageId, lineTextLength, _tokens);
        this._ensureLine(lineIndex);
        const oldTokens = this._lineTokens[lineIndex];
        this._lineTokens[lineIndex] = tokens;
        if (checkEquality) {
            return !TokensStore._equals(oldTokens, tokens);
        }
        return false;
    }
    static _equals(_a, _b) {
        if (!_a || !_b) {
            return !_a && !_b;
        }
        const a = toUint32Array(_a);
        const b = toUint32Array(_b);
        if (a.length !== b.length) {
            return false;
        }
        for (let i = 0, len = a.length; i < len; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    //#region Editing
    acceptEdit(range, eolCount, firstLineLength) {
        this._acceptDeleteRange(range);
        this._acceptInsertText(new Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
    }
    _acceptDeleteRange(range) {
        const firstLineIndex = range.startLineNumber - 1;
        if (firstLineIndex >= this._len) {
            return;
        }
        if (range.startLineNumber === range.endLineNumber) {
            if (range.startColumn === range.endColumn) {
                // Nothing to delete
                return;
            }
            this._lineTokens[firstLineIndex] = TokensStore._delete(this._lineTokens[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
            return;
        }
        this._lineTokens[firstLineIndex] = TokensStore._deleteEnding(this._lineTokens[firstLineIndex], range.startColumn - 1);
        const lastLineIndex = range.endLineNumber - 1;
        let lastLineTokens = null;
        if (lastLineIndex < this._len) {
            lastLineTokens = TokensStore._deleteBeginning(this._lineTokens[lastLineIndex], range.endColumn - 1);
        }
        // Take remaining text on last line and append it to remaining text on first line
        this._lineTokens[firstLineIndex] = TokensStore._append(this._lineTokens[firstLineIndex], lastLineTokens);
        // Delete middle lines
        this._deleteLines(range.startLineNumber, range.endLineNumber - range.startLineNumber);
    }
    _acceptInsertText(position, eolCount, firstLineLength) {
        if (eolCount === 0 && firstLineLength === 0) {
            // Nothing to insert
            return;
        }
        const lineIndex = position.lineNumber - 1;
        if (lineIndex >= this._len) {
            return;
        }
        if (eolCount === 0) {
            // Inserting text on one line
            this._lineTokens[lineIndex] = TokensStore._insert(this._lineTokens[lineIndex], position.column - 1, firstLineLength);
            return;
        }
        this._lineTokens[lineIndex] = TokensStore._deleteEnding(this._lineTokens[lineIndex], position.column - 1);
        this._lineTokens[lineIndex] = TokensStore._insert(this._lineTokens[lineIndex], position.column - 1, firstLineLength);
        this._insertLines(position.lineNumber, eolCount);
    }
    static _deleteBeginning(lineTokens, toChIndex) {
        if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
            return lineTokens;
        }
        return TokensStore._delete(lineTokens, 0, toChIndex);
    }
    static _deleteEnding(lineTokens, fromChIndex) {
        if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
            return lineTokens;
        }
        const tokens = toUint32Array(lineTokens);
        const lineTextLength = tokens[tokens.length - 2];
        return TokensStore._delete(lineTokens, fromChIndex, lineTextLength);
    }
    static _delete(lineTokens, fromChIndex, toChIndex) {
        if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS || fromChIndex === toChIndex) {
            return lineTokens;
        }
        const tokens = toUint32Array(lineTokens);
        const tokensCount = (tokens.length >>> 1);
        // special case: deleting everything
        if (fromChIndex === 0 && tokens[tokens.length - 2] === toChIndex) {
            return EMPTY_LINE_TOKENS;
        }
        const fromTokenIndex = LineTokens.findIndexInTokensArray(tokens, fromChIndex);
        const fromTokenStartOffset = (fromTokenIndex > 0 ? tokens[(fromTokenIndex - 1) << 1] : 0);
        const fromTokenEndOffset = tokens[fromTokenIndex << 1];
        if (toChIndex < fromTokenEndOffset) {
            // the delete range is inside a single token
            const delta = (toChIndex - fromChIndex);
            for (let i = fromTokenIndex; i < tokensCount; i++) {
                tokens[i << 1] -= delta;
            }
            return lineTokens;
        }
        let dest;
        let lastEnd;
        if (fromTokenStartOffset !== fromChIndex) {
            tokens[fromTokenIndex << 1] = fromChIndex;
            dest = ((fromTokenIndex + 1) << 1);
            lastEnd = fromChIndex;
        }
        else {
            dest = (fromTokenIndex << 1);
            lastEnd = fromTokenStartOffset;
        }
        const delta = (toChIndex - fromChIndex);
        for (let tokenIndex = fromTokenIndex + 1; tokenIndex < tokensCount; tokenIndex++) {
            const tokenEndOffset = tokens[tokenIndex << 1] - delta;
            if (tokenEndOffset > lastEnd) {
                tokens[dest++] = tokenEndOffset;
                tokens[dest++] = tokens[(tokenIndex << 1) + 1];
                lastEnd = tokenEndOffset;
            }
        }
        if (dest === tokens.length) {
            // nothing to trim
            return lineTokens;
        }
        let tmp = new Uint32Array(dest);
        tmp.set(tokens.subarray(0, dest), 0);
        return tmp.buffer;
    }
    static _append(lineTokens, _otherTokens) {
        if (_otherTokens === EMPTY_LINE_TOKENS) {
            return lineTokens;
        }
        if (lineTokens === EMPTY_LINE_TOKENS) {
            return _otherTokens;
        }
        if (lineTokens === null) {
            return lineTokens;
        }
        if (_otherTokens === null) {
            // cannot determine combined line length...
            return null;
        }
        const myTokens = toUint32Array(lineTokens);
        const otherTokens = toUint32Array(_otherTokens);
        const otherTokensCount = (otherTokens.length >>> 1);
        let result = new Uint32Array(myTokens.length + otherTokens.length);
        result.set(myTokens, 0);
        let dest = myTokens.length;
        const delta = myTokens[myTokens.length - 2];
        for (let i = 0; i < otherTokensCount; i++) {
            result[dest++] = otherTokens[(i << 1)] + delta;
            result[dest++] = otherTokens[(i << 1) + 1];
        }
        return result.buffer;
    }
    static _insert(lineTokens, chIndex, textLength) {
        if (lineTokens === null || lineTokens === EMPTY_LINE_TOKENS) {
            // nothing to do
            return lineTokens;
        }
        const tokens = toUint32Array(lineTokens);
        const tokensCount = (tokens.length >>> 1);
        let fromTokenIndex = LineTokens.findIndexInTokensArray(tokens, chIndex);
        if (fromTokenIndex > 0) {
            const fromTokenStartOffset = tokens[(fromTokenIndex - 1) << 1];
            if (fromTokenStartOffset === chIndex) {
                fromTokenIndex--;
            }
        }
        for (let tokenIndex = fromTokenIndex; tokenIndex < tokensCount; tokenIndex++) {
            tokens[tokenIndex << 1] += textLength;
        }
        return lineTokens;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class PieceTreeTextBuffer extends Disposable {
    constructor(chunks, BOM, eol, containsRTL, containsUnusualLineTerminators, isBasicASCII, eolNormalized) {
        super();
        this._onDidChangeContent = this._register(new Emitter());
        this._BOM = BOM;
        this._mightContainNonBasicASCII = !isBasicASCII;
        this._mightContainRTL = containsRTL;
        this._mightContainUnusualLineTerminators = containsUnusualLineTerminators;
        this._pieceTree = new PieceTreeBase(chunks, eol, eolNormalized);
    }
    mightContainRTL() {
        return this._mightContainRTL;
    }
    mightContainUnusualLineTerminators() {
        return this._mightContainUnusualLineTerminators;
    }
    resetMightContainUnusualLineTerminators() {
        this._mightContainUnusualLineTerminators = false;
    }
    mightContainNonBasicASCII() {
        return this._mightContainNonBasicASCII;
    }
    getBOM() {
        return this._BOM;
    }
    getEOL() {
        return this._pieceTree.getEOL();
    }
    createSnapshot(preserveBOM) {
        return this._pieceTree.createSnapshot(preserveBOM ? this._BOM : '');
    }
    getOffsetAt(lineNumber, column) {
        return this._pieceTree.getOffsetAt(lineNumber, column);
    }
    getPositionAt(offset) {
        return this._pieceTree.getPositionAt(offset);
    }
    getRangeAt(start, length) {
        let end = start + length;
        const startPosition = this.getPositionAt(start);
        const endPosition = this.getPositionAt(end);
        return new Range(startPosition.lineNumber, startPosition.column, endPosition.lineNumber, endPosition.column);
    }
    getValueInRange(range, eol = 0 /* TextDefined */) {
        if (range.isEmpty()) {
            return '';
        }
        const lineEnding = this._getEndOfLine(eol);
        return this._pieceTree.getValueInRange(range, lineEnding);
    }
    getValueLengthInRange(range, eol = 0 /* TextDefined */) {
        if (range.isEmpty()) {
            return 0;
        }
        if (range.startLineNumber === range.endLineNumber) {
            return (range.endColumn - range.startColumn);
        }
        let startOffset = this.getOffsetAt(range.startLineNumber, range.startColumn);
        let endOffset = this.getOffsetAt(range.endLineNumber, range.endColumn);
        return endOffset - startOffset;
    }
    getCharacterCountInRange(range, eol = 0 /* TextDefined */) {
        if (this._mightContainNonBasicASCII) {
            // we must count by iterating
            let result = 0;
            const fromLineNumber = range.startLineNumber;
            const toLineNumber = range.endLineNumber;
            for (let lineNumber = fromLineNumber; lineNumber <= toLineNumber; lineNumber++) {
                const lineContent = this.getLineContent(lineNumber);
                const fromOffset = (lineNumber === fromLineNumber ? range.startColumn - 1 : 0);
                const toOffset = (lineNumber === toLineNumber ? range.endColumn - 1 : lineContent.length);
                for (let offset = fromOffset; offset < toOffset; offset++) {
                    if (isHighSurrogate(lineContent.charCodeAt(offset))) {
                        result = result + 1;
                        offset = offset + 1;
                    }
                    else {
                        result = result + 1;
                    }
                }
            }
            result += this._getEndOfLine(eol).length * (toLineNumber - fromLineNumber);
            return result;
        }
        return this.getValueLengthInRange(range, eol);
    }
    getLength() {
        return this._pieceTree.getLength();
    }
    getLineCount() {
        return this._pieceTree.getLineCount();
    }
    getLinesContent() {
        return this._pieceTree.getLinesContent();
    }
    getLineContent(lineNumber) {
        return this._pieceTree.getLineContent(lineNumber);
    }
    getLineCharCode(lineNumber, index) {
        return this._pieceTree.getLineCharCode(lineNumber, index);
    }
    getLineLength(lineNumber) {
        return this._pieceTree.getLineLength(lineNumber);
    }
    getLineFirstNonWhitespaceColumn(lineNumber) {
        const result = firstNonWhitespaceIndex(this.getLineContent(lineNumber));
        if (result === -1) {
            return 0;
        }
        return result + 1;
    }
    getLineLastNonWhitespaceColumn(lineNumber) {
        const result = lastNonWhitespaceIndex(this.getLineContent(lineNumber));
        if (result === -1) {
            return 0;
        }
        return result + 2;
    }
    _getEndOfLine(eol) {
        switch (eol) {
            case 1 /* LF */:
                return '\n';
            case 2 /* CRLF */:
                return '\r\n';
            case 0 /* TextDefined */:
                return this.getEOL();
            default:
                throw new Error('Unknown EOL preference');
        }
    }
    setEOL(newEOL) {
        this._pieceTree.setEOL(newEOL);
    }
    applyEdits(rawOperations, recordTrimAutoWhitespace, computeUndoEdits) {
        let mightContainRTL = this._mightContainRTL;
        let mightContainUnusualLineTerminators = this._mightContainUnusualLineTerminators;
        let mightContainNonBasicASCII = this._mightContainNonBasicASCII;
        let canReduceOperations = true;
        let operations = [];
        for (let i = 0; i < rawOperations.length; i++) {
            let op = rawOperations[i];
            if (canReduceOperations && op._isTracked) {
                canReduceOperations = false;
            }
            let validatedRange = op.range;
            if (op.text) {
                let textMightContainNonBasicASCII = true;
                if (!mightContainNonBasicASCII) {
                    textMightContainNonBasicASCII = !isBasicASCII(op.text);
                    mightContainNonBasicASCII = textMightContainNonBasicASCII;
                }
                if (!mightContainRTL && textMightContainNonBasicASCII) {
                    // check if the new inserted text contains RTL
                    mightContainRTL = containsRTL(op.text);
                }
                if (!mightContainUnusualLineTerminators && textMightContainNonBasicASCII) {
                    // check if the new inserted text contains unusual line terminators
                    mightContainUnusualLineTerminators = containsUnusualLineTerminators(op.text);
                }
            }
            let validText = '';
            let eolCount = 0;
            let firstLineLength = 0;
            let lastLineLength = 0;
            if (op.text) {
                let strEOL;
                [eolCount, firstLineLength, lastLineLength, strEOL] = countEOL(op.text);
                const bufferEOL = this.getEOL();
                const expectedStrEOL = (bufferEOL === '\r\n' ? 2 /* CRLF */ : 1 /* LF */);
                if (strEOL === 0 /* Unknown */ || strEOL === expectedStrEOL) {
                    validText = op.text;
                }
                else {
                    validText = op.text.replace(/\r\n|\r|\n/g, bufferEOL);
                }
            }
            operations[i] = {
                sortIndex: i,
                identifier: op.identifier || null,
                range: validatedRange,
                rangeOffset: this.getOffsetAt(validatedRange.startLineNumber, validatedRange.startColumn),
                rangeLength: this.getValueLengthInRange(validatedRange),
                text: validText,
                eolCount: eolCount,
                firstLineLength: firstLineLength,
                lastLineLength: lastLineLength,
                forceMoveMarkers: Boolean(op.forceMoveMarkers),
                isAutoWhitespaceEdit: op.isAutoWhitespaceEdit || false
            };
        }
        // Sort operations ascending
        operations.sort(PieceTreeTextBuffer._sortOpsAscending);
        let hasTouchingRanges = false;
        for (let i = 0, count = operations.length - 1; i < count; i++) {
            let rangeEnd = operations[i].range.getEndPosition();
            let nextRangeStart = operations[i + 1].range.getStartPosition();
            if (nextRangeStart.isBeforeOrEqual(rangeEnd)) {
                if (nextRangeStart.isBefore(rangeEnd)) {
                    // overlapping ranges
                    throw new Error('Overlapping ranges are not allowed!');
                }
                hasTouchingRanges = true;
            }
        }
        if (canReduceOperations) {
            operations = this._reduceOperations(operations);
        }
        // Delta encode operations
        let reverseRanges = (computeUndoEdits || recordTrimAutoWhitespace ? PieceTreeTextBuffer._getInverseEditRanges(operations) : []);
        let newTrimAutoWhitespaceCandidates = [];
        if (recordTrimAutoWhitespace) {
            for (let i = 0; i < operations.length; i++) {
                let op = operations[i];
                let reverseRange = reverseRanges[i];
                if (op.isAutoWhitespaceEdit && op.range.isEmpty()) {
                    // Record already the future line numbers that might be auto whitespace removal candidates on next edit
                    for (let lineNumber = reverseRange.startLineNumber; lineNumber <= reverseRange.endLineNumber; lineNumber++) {
                        let currentLineContent = '';
                        if (lineNumber === reverseRange.startLineNumber) {
                            currentLineContent = this.getLineContent(op.range.startLineNumber);
                            if (firstNonWhitespaceIndex(currentLineContent) !== -1) {
                                continue;
                            }
                        }
                        newTrimAutoWhitespaceCandidates.push({ lineNumber: lineNumber, oldContent: currentLineContent });
                    }
                }
            }
        }
        let reverseOperations = null;
        if (computeUndoEdits) {
            let reverseRangeDeltaOffset = 0;
            reverseOperations = [];
            for (let i = 0; i < operations.length; i++) {
                const op = operations[i];
                const reverseRange = reverseRanges[i];
                const bufferText = this.getValueInRange(op.range);
                const reverseRangeOffset = op.rangeOffset + reverseRangeDeltaOffset;
                reverseRangeDeltaOffset += (op.text.length - bufferText.length);
                reverseOperations[i] = {
                    sortIndex: op.sortIndex,
                    identifier: op.identifier,
                    range: reverseRange,
                    text: bufferText,
                    textChange: new TextChange(op.rangeOffset, bufferText, reverseRangeOffset, op.text)
                };
            }
            // Can only sort reverse operations when the order is not significant
            if (!hasTouchingRanges) {
                reverseOperations.sort((a, b) => a.sortIndex - b.sortIndex);
            }
        }
        this._mightContainRTL = mightContainRTL;
        this._mightContainUnusualLineTerminators = mightContainUnusualLineTerminators;
        this._mightContainNonBasicASCII = mightContainNonBasicASCII;
        const contentChanges = this._doApplyEdits(operations);
        let trimAutoWhitespaceLineNumbers = null;
        if (recordTrimAutoWhitespace && newTrimAutoWhitespaceCandidates.length > 0) {
            // sort line numbers auto whitespace removal candidates for next edit descending
            newTrimAutoWhitespaceCandidates.sort((a, b) => b.lineNumber - a.lineNumber);
            trimAutoWhitespaceLineNumbers = [];
            for (let i = 0, len = newTrimAutoWhitespaceCandidates.length; i < len; i++) {
                let lineNumber = newTrimAutoWhitespaceCandidates[i].lineNumber;
                if (i > 0 && newTrimAutoWhitespaceCandidates[i - 1].lineNumber === lineNumber) {
                    // Do not have the same line number twice
                    continue;
                }
                let prevContent = newTrimAutoWhitespaceCandidates[i].oldContent;
                let lineContent = this.getLineContent(lineNumber);
                if (lineContent.length === 0 || lineContent === prevContent || firstNonWhitespaceIndex(lineContent) !== -1) {
                    continue;
                }
                trimAutoWhitespaceLineNumbers.push(lineNumber);
            }
        }
        this._onDidChangeContent.fire();
        return new ApplyEditsResult(reverseOperations, contentChanges, trimAutoWhitespaceLineNumbers);
    }
    /**
     * Transform operations such that they represent the same logic edit,
     * but that they also do not cause OOM crashes.
     */
    _reduceOperations(operations) {
        if (operations.length < 1000) {
            // We know from empirical testing that a thousand edits work fine regardless of their shape.
            return operations;
        }
        // At one point, due to how events are emitted and how each operation is handled,
        // some operations can trigger a high amount of temporary string allocations,
        // that will immediately get edited again.
        // e.g. a formatter inserting ridiculous ammounts of \n on a model with a single line
        // Therefore, the strategy is to collapse all the operations into a huge single edit operation
        return [this._toSingleEditOperation(operations)];
    }
    _toSingleEditOperation(operations) {
        let forceMoveMarkers = false;
        const firstEditRange = operations[0].range;
        const lastEditRange = operations[operations.length - 1].range;
        const entireEditRange = new Range(firstEditRange.startLineNumber, firstEditRange.startColumn, lastEditRange.endLineNumber, lastEditRange.endColumn);
        let lastEndLineNumber = firstEditRange.startLineNumber;
        let lastEndColumn = firstEditRange.startColumn;
        const result = [];
        for (let i = 0, len = operations.length; i < len; i++) {
            const operation = operations[i];
            const range = operation.range;
            forceMoveMarkers = forceMoveMarkers || operation.forceMoveMarkers;
            // (1) -- Push old text
            result.push(this.getValueInRange(new Range(lastEndLineNumber, lastEndColumn, range.startLineNumber, range.startColumn)));
            // (2) -- Push new text
            if (operation.text.length > 0) {
                result.push(operation.text);
            }
            lastEndLineNumber = range.endLineNumber;
            lastEndColumn = range.endColumn;
        }
        const text = result.join('');
        const [eolCount, firstLineLength, lastLineLength] = countEOL(text);
        return {
            sortIndex: 0,
            identifier: operations[0].identifier,
            range: entireEditRange,
            rangeOffset: this.getOffsetAt(entireEditRange.startLineNumber, entireEditRange.startColumn),
            rangeLength: this.getValueLengthInRange(entireEditRange, 0 /* TextDefined */),
            text: text,
            eolCount: eolCount,
            firstLineLength: firstLineLength,
            lastLineLength: lastLineLength,
            forceMoveMarkers: forceMoveMarkers,
            isAutoWhitespaceEdit: false
        };
    }
    _doApplyEdits(operations) {
        operations.sort(PieceTreeTextBuffer._sortOpsDescending);
        let contentChanges = [];
        // operations are from bottom to top
        for (let i = 0; i < operations.length; i++) {
            let op = operations[i];
            const startLineNumber = op.range.startLineNumber;
            const startColumn = op.range.startColumn;
            const endLineNumber = op.range.endLineNumber;
            const endColumn = op.range.endColumn;
            if (startLineNumber === endLineNumber && startColumn === endColumn && op.text.length === 0) {
                // no-op
                continue;
            }
            if (op.text) {
                // replacement
                this._pieceTree.delete(op.rangeOffset, op.rangeLength);
                this._pieceTree.insert(op.rangeOffset, op.text, true);
            }
            else {
                // deletion
                this._pieceTree.delete(op.rangeOffset, op.rangeLength);
            }
            const contentChangeRange = new Range(startLineNumber, startColumn, endLineNumber, endColumn);
            contentChanges.push({
                range: contentChangeRange,
                rangeLength: op.rangeLength,
                text: op.text,
                rangeOffset: op.rangeOffset,
                forceMoveMarkers: op.forceMoveMarkers
            });
        }
        return contentChanges;
    }
    findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
        return this._pieceTree.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
    }
    /**
     * Assumes `operations` are validated and sorted ascending
     */
    static _getInverseEditRanges(operations) {
        let result = [];
        let prevOpEndLineNumber = 0;
        let prevOpEndColumn = 0;
        let prevOp = null;
        for (let i = 0, len = operations.length; i < len; i++) {
            let op = operations[i];
            let startLineNumber;
            let startColumn;
            if (prevOp) {
                if (prevOp.range.endLineNumber === op.range.startLineNumber) {
                    startLineNumber = prevOpEndLineNumber;
                    startColumn = prevOpEndColumn + (op.range.startColumn - prevOp.range.endColumn);
                }
                else {
                    startLineNumber = prevOpEndLineNumber + (op.range.startLineNumber - prevOp.range.endLineNumber);
                    startColumn = op.range.startColumn;
                }
            }
            else {
                startLineNumber = op.range.startLineNumber;
                startColumn = op.range.startColumn;
            }
            let resultRange;
            if (op.text.length > 0) {
                // the operation inserts something
                const lineCount = op.eolCount + 1;
                if (lineCount === 1) {
                    // single line insert
                    resultRange = new Range(startLineNumber, startColumn, startLineNumber, startColumn + op.firstLineLength);
                }
                else {
                    // multi line insert
                    resultRange = new Range(startLineNumber, startColumn, startLineNumber + lineCount - 1, op.lastLineLength + 1);
                }
            }
            else {
                // There is nothing to insert
                resultRange = new Range(startLineNumber, startColumn, startLineNumber, startColumn);
            }
            prevOpEndLineNumber = resultRange.endLineNumber;
            prevOpEndColumn = resultRange.endColumn;
            result.push(resultRange);
            prevOp = op;
        }
        return result;
    }
    static _sortOpsAscending(a, b) {
        let r = Range.compareRangesUsingEnds(a.range, b.range);
        if (r === 0) {
            return a.sortIndex - b.sortIndex;
        }
        return r;
    }
    static _sortOpsDescending(a, b) {
        let r = Range.compareRangesUsingEnds(a.range, b.range);
        if (r === 0) {
            return b.sortIndex - a.sortIndex;
        }
        return -r;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class PieceTreeTextBufferFactory {
    constructor(_chunks, _bom, _cr, _lf, _crlf, _containsRTL, _containsUnusualLineTerminators, _isBasicASCII, _normalizeEOL) {
        this._chunks = _chunks;
        this._bom = _bom;
        this._cr = _cr;
        this._lf = _lf;
        this._crlf = _crlf;
        this._containsRTL = _containsRTL;
        this._containsUnusualLineTerminators = _containsUnusualLineTerminators;
        this._isBasicASCII = _isBasicASCII;
        this._normalizeEOL = _normalizeEOL;
    }
    _getEOL(defaultEOL) {
        const totalEOLCount = this._cr + this._lf + this._crlf;
        const totalCRCount = this._cr + this._crlf;
        if (totalEOLCount === 0) {
            // This is an empty file or a file with precisely one line
            return (defaultEOL === 1 /* LF */ ? '\n' : '\r\n');
        }
        if (totalCRCount > totalEOLCount / 2) {
            // More than half of the file contains \r\n ending lines
            return '\r\n';
        }
        // At least one line more ends in \n
        return '\n';
    }
    create(defaultEOL) {
        const eol = this._getEOL(defaultEOL);
        let chunks = this._chunks;
        if (this._normalizeEOL &&
            ((eol === '\r\n' && (this._cr > 0 || this._lf > 0))
                || (eol === '\n' && (this._cr > 0 || this._crlf > 0)))) {
            // Normalize pieces
            for (let i = 0, len = chunks.length; i < len; i++) {
                let str = chunks[i].buffer.replace(/\r\n|\r|\n/g, eol);
                let newLineStart = createLineStartsFast(str);
                chunks[i] = new StringBuffer(str, newLineStart);
            }
        }
        const textBuffer = new PieceTreeTextBuffer(chunks, this._bom, eol, this._containsRTL, this._containsUnusualLineTerminators, this._isBasicASCII, this._normalizeEOL);
        return { textBuffer: textBuffer, disposable: textBuffer };
    }
}
class PieceTreeTextBufferBuilder {
    constructor() {
        this.chunks = [];
        this.BOM = '';
        this._hasPreviousChar = false;
        this._previousChar = 0;
        this._tmpLineStarts = [];
        this.cr = 0;
        this.lf = 0;
        this.crlf = 0;
        this.containsRTL = false;
        this.containsUnusualLineTerminators = false;
        this.isBasicASCII = true;
    }
    acceptChunk(chunk) {
        if (chunk.length === 0) {
            return;
        }
        if (this.chunks.length === 0) {
            if (startsWithUTF8BOM(chunk)) {
                this.BOM = UTF8_BOM_CHARACTER;
                chunk = chunk.substr(1);
            }
        }
        const lastChar = chunk.charCodeAt(chunk.length - 1);
        if (lastChar === 13 /* CarriageReturn */ || (lastChar >= 0xD800 && lastChar <= 0xDBFF)) {
            // last character is \r or a high surrogate => keep it back
            this._acceptChunk1(chunk.substr(0, chunk.length - 1), false);
            this._hasPreviousChar = true;
            this._previousChar = lastChar;
        }
        else {
            this._acceptChunk1(chunk, false);
            this._hasPreviousChar = false;
            this._previousChar = lastChar;
        }
    }
    _acceptChunk1(chunk, allowEmptyStrings) {
        if (!allowEmptyStrings && chunk.length === 0) {
            // Nothing to do
            return;
        }
        if (this._hasPreviousChar) {
            this._acceptChunk2(String.fromCharCode(this._previousChar) + chunk);
        }
        else {
            this._acceptChunk2(chunk);
        }
    }
    _acceptChunk2(chunk) {
        const lineStarts = createLineStarts(this._tmpLineStarts, chunk);
        this.chunks.push(new StringBuffer(chunk, lineStarts.lineStarts));
        this.cr += lineStarts.cr;
        this.lf += lineStarts.lf;
        this.crlf += lineStarts.crlf;
        if (this.isBasicASCII) {
            this.isBasicASCII = lineStarts.isBasicASCII;
        }
        if (!this.isBasicASCII && !this.containsRTL) {
            // No need to check if it is basic ASCII
            this.containsRTL = containsRTL(chunk);
        }
        if (!this.isBasicASCII && !this.containsUnusualLineTerminators) {
            // No need to check if it is basic ASCII
            this.containsUnusualLineTerminators = containsUnusualLineTerminators(chunk);
        }
    }
    finish(normalizeEOL = true) {
        this._finish();
        return new PieceTreeTextBufferFactory(this.chunks, this.BOM, this.cr, this.lf, this.crlf, this.containsRTL, this.containsUnusualLineTerminators, this.isBasicASCII, normalizeEOL);
    }
    _finish() {
        if (this.chunks.length === 0) {
            this._acceptChunk1('', true);
        }
        if (this._hasPreviousChar) {
            this._hasPreviousChar = false;
            // recreate last chunk
            let lastChunk = this.chunks[this.chunks.length - 1];
            lastChunk.buffer += String.fromCharCode(this._previousChar);
            let newLineStarts = createLineStartsFast(lastChunk.buffer);
            lastChunk.lineStarts = newLineStarts;
            if (this._previousChar === 13 /* CarriageReturn */) {
                this.cr++;
            }
        }
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/**
 * An event describing that a model has been reset to a new value.
 * @internal
 */
class ModelRawFlush {
    constructor() {
        this.changeType = 1 /* Flush */;
    }
}
/**
 * An event describing that a line has changed in a model.
 * @internal
 */
class ModelRawLineChanged {
    constructor(lineNumber, detail) {
        this.changeType = 2 /* LineChanged */;
        this.lineNumber = lineNumber;
        this.detail = detail;
    }
}
/**
 * An event describing that line(s) have been deleted in a model.
 * @internal
 */
class ModelRawLinesDeleted {
    constructor(fromLineNumber, toLineNumber) {
        this.changeType = 3 /* LinesDeleted */;
        this.fromLineNumber = fromLineNumber;
        this.toLineNumber = toLineNumber;
    }
}
/**
 * An event describing that line(s) have been inserted in a model.
 * @internal
 */
class ModelRawLinesInserted {
    constructor(fromLineNumber, toLineNumber, detail) {
        this.changeType = 4 /* LinesInserted */;
        this.fromLineNumber = fromLineNumber;
        this.toLineNumber = toLineNumber;
        this.detail = detail;
    }
}
/**
 * An event describing that a model has had its EOL changed.
 * @internal
 */
class ModelRawEOLChanged {
    constructor() {
        this.changeType = 5 /* EOLChanged */;
    }
}
/**
 * An event describing a change in the text of a model.
 * @internal
 */
class ModelRawContentChangedEvent {
    constructor(changes, versionId, isUndoing, isRedoing) {
        this.changes = changes;
        this.versionId = versionId;
        this.isUndoing = isUndoing;
        this.isRedoing = isRedoing;
        this.resultingSelection = null;
    }
    containsEvent(type) {
        for (let i = 0, len = this.changes.length; i < len; i++) {
            const change = this.changes[i];
            if (change.changeType === type) {
                return true;
            }
        }
        return false;
    }
    static merge(a, b) {
        const changes = [].concat(a.changes).concat(b.changes);
        const versionId = b.versionId;
        const isUndoing = (a.isUndoing || b.isUndoing);
        const isRedoing = (a.isRedoing || b.isRedoing);
        return new ModelRawContentChangedEvent(changes, versionId, isUndoing, isRedoing);
    }
}
/**
 * @internal
 */
class InternalModelContentChangeEvent {
    constructor(rawContentChangedEvent, contentChangedEvent) {
        this.rawContentChangedEvent = rawContentChangedEvent;
        this.contentChangedEvent = contentChangedEvent;
    }
    merge(other) {
        const rawContentChangedEvent = ModelRawContentChangedEvent.merge(this.rawContentChangedEvent, other.rawContentChangedEvent);
        const contentChangedEvent = InternalModelContentChangeEvent._mergeChangeEvents(this.contentChangedEvent, other.contentChangedEvent);
        return new InternalModelContentChangeEvent(rawContentChangedEvent, contentChangedEvent);
    }
    static _mergeChangeEvents(a, b) {
        const changes = [].concat(a.changes).concat(b.changes);
        const eol = b.eol;
        const versionId = b.versionId;
        const isUndoing = (a.isUndoing || b.isUndoing);
        const isRedoing = (a.isRedoing || b.isRedoing);
        const isFlush = (a.isFlush || b.isFlush);
        return {
            changes: changes,
            eol: eol,
            versionId: versionId,
            isUndoing: isUndoing,
            isRedoing: isRedoing,
            isFlush: isFlush
        };
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class TokenizationStateStore {
    constructor() {
        this._beginState = [];
        this._valid = [];
        this._len = 0;
        this._invalidLineStartIndex = 0;
    }
    _reset(initialState) {
        this._beginState = [];
        this._valid = [];
        this._len = 0;
        this._invalidLineStartIndex = 0;
        if (initialState) {
            this._setBeginState(0, initialState);
        }
    }
    flush(initialState) {
        this._reset(initialState);
    }
    get invalidLineStartIndex() {
        return this._invalidLineStartIndex;
    }
    _invalidateLine(lineIndex) {
        if (lineIndex < this._len) {
            this._valid[lineIndex] = false;
        }
        if (lineIndex < this._invalidLineStartIndex) {
            this._invalidLineStartIndex = lineIndex;
        }
    }
    _isValid(lineIndex) {
        if (lineIndex < this._len) {
            return this._valid[lineIndex];
        }
        return false;
    }
    getBeginState(lineIndex) {
        if (lineIndex < this._len) {
            return this._beginState[lineIndex];
        }
        return null;
    }
    _ensureLine(lineIndex) {
        while (lineIndex >= this._len) {
            this._beginState[this._len] = null;
            this._valid[this._len] = false;
            this._len++;
        }
    }
    _deleteLines(start, deleteCount) {
        if (deleteCount === 0) {
            return;
        }
        if (start + deleteCount > this._len) {
            deleteCount = this._len - start;
        }
        this._beginState.splice(start, deleteCount);
        this._valid.splice(start, deleteCount);
        this._len -= deleteCount;
    }
    _insertLines(insertIndex, insertCount) {
        if (insertCount === 0) {
            return;
        }
        let beginState = [];
        let valid = [];
        for (let i = 0; i < insertCount; i++) {
            beginState[i] = null;
            valid[i] = false;
        }
        this._beginState = arrayInsert(this._beginState, insertIndex, beginState);
        this._valid = arrayInsert(this._valid, insertIndex, valid);
        this._len += insertCount;
    }
    _setValid(lineIndex, valid) {
        this._ensureLine(lineIndex);
        this._valid[lineIndex] = valid;
    }
    _setBeginState(lineIndex, beginState) {
        this._ensureLine(lineIndex);
        this._beginState[lineIndex] = beginState;
    }
    setEndState(linesLength, lineIndex, endState) {
        this._setValid(lineIndex, true);
        this._invalidLineStartIndex = lineIndex + 1;
        // Check if this was the last line
        if (lineIndex === linesLength - 1) {
            return;
        }
        // Check if the end state has changed
        const previousEndState = this.getBeginState(lineIndex + 1);
        if (previousEndState === null || !endState.equals(previousEndState)) {
            this._setBeginState(lineIndex + 1, endState);
            this._invalidateLine(lineIndex + 1);
            return;
        }
        // Perhaps we can skip tokenizing some lines...
        let i = lineIndex + 1;
        while (i < linesLength) {
            if (!this._isValid(i)) {
                break;
            }
            i++;
        }
        this._invalidLineStartIndex = i;
    }
    setFakeTokens(lineIndex) {
        this._setValid(lineIndex, false);
    }
    //#region Editing
    applyEdits(range, eolCount) {
        const deletingLinesCnt = range.endLineNumber - range.startLineNumber;
        const insertingLinesCnt = eolCount;
        const editingLinesCnt = Math.min(deletingLinesCnt, insertingLinesCnt);
        for (let j = editingLinesCnt; j >= 0; j--) {
            this._invalidateLine(range.startLineNumber + j - 1);
        }
        this._acceptDeleteRange(range);
        this._acceptInsertText(new Position(range.startLineNumber, range.startColumn), eolCount);
    }
    _acceptDeleteRange(range) {
        const firstLineIndex = range.startLineNumber - 1;
        if (firstLineIndex >= this._len) {
            return;
        }
        this._deleteLines(range.startLineNumber, range.endLineNumber - range.startLineNumber);
    }
    _acceptInsertText(position, eolCount) {
        const lineIndex = position.lineNumber - 1;
        if (lineIndex >= this._len) {
            return;
        }
        this._insertLines(position.lineNumber, eolCount);
    }
}
class TextModelTokenization extends Disposable {
    constructor(textModel) {
        super();
        this._isDisposed = false;
        this._textModel = textModel;
        this._tokenizationStateStore = new TokenizationStateStore();
        this._tokenizationSupport = null;
        this._register(TokenizationRegistry.onDidChange((e) => {
            const languageIdentifier = this._textModel.getLanguageIdentifier();
            if (e.changedLanguages.indexOf(languageIdentifier.language) === -1) {
                return;
            }
            this._resetTokenizationState();
            this._textModel.clearTokens();
        }));
        this._register(this._textModel.onDidChangeRawContentFast((e) => {
            if (e.containsEvent(1 /* Flush */)) {
                this._resetTokenizationState();
                return;
            }
        }));
        this._register(this._textModel.onDidChangeContentFast((e) => {
            for (let i = 0, len = e.changes.length; i < len; i++) {
                const change = e.changes[i];
                const [eolCount] = countEOL(change.text);
                this._tokenizationStateStore.applyEdits(change.range, eolCount);
            }
            this._beginBackgroundTokenization();
        }));
        this._register(this._textModel.onDidChangeAttached(() => {
            this._beginBackgroundTokenization();
        }));
        this._register(this._textModel.onDidChangeLanguage(() => {
            this._resetTokenizationState();
            this._textModel.clearTokens();
        }));
        this._resetTokenizationState();
    }
    dispose() {
        this._isDisposed = true;
        super.dispose();
    }
    _resetTokenizationState() {
        const [tokenizationSupport, initialState] = initializeTokenization(this._textModel);
        this._tokenizationSupport = tokenizationSupport;
        this._tokenizationStateStore.flush(initialState);
        this._beginBackgroundTokenization();
    }
    _beginBackgroundTokenization() {
        if (this._textModel.isAttachedToEditor() && this._hasLinesToTokenize()) {
            setImmediate(() => {
                if (this._isDisposed) {
                    // disposed in the meantime
                    return;
                }
                this._revalidateTokensNow();
            });
        }
    }
    _revalidateTokensNow(toLineNumber = this._textModel.getLineCount()) {
        const MAX_ALLOWED_TIME = 1;
        const builder = new MultilineTokensBuilder();
        const sw = StopWatch.create(false);
        while (this._hasLinesToTokenize()) {
            if (sw.elapsed() > MAX_ALLOWED_TIME) {
                // Stop if MAX_ALLOWED_TIME is reached
                break;
            }
            const tokenizedLineNumber = this._tokenizeOneInvalidLine(builder);
            if (tokenizedLineNumber >= toLineNumber) {
                break;
            }
        }
        this._beginBackgroundTokenization();
        this._textModel.setTokens(builder.tokens);
    }
    tokenizeViewport(startLineNumber, endLineNumber) {
        const builder = new MultilineTokensBuilder();
        this._tokenizeViewport(builder, startLineNumber, endLineNumber);
        this._textModel.setTokens(builder.tokens);
    }
    reset() {
        this._resetTokenizationState();
        this._textModel.clearTokens();
    }
    forceTokenization(lineNumber) {
        const builder = new MultilineTokensBuilder();
        this._updateTokensUntilLine(builder, lineNumber);
        this._textModel.setTokens(builder.tokens);
    }
    isCheapToTokenize(lineNumber) {
        if (!this._tokenizationSupport) {
            return true;
        }
        const firstInvalidLineNumber = this._tokenizationStateStore.invalidLineStartIndex + 1;
        if (lineNumber > firstInvalidLineNumber) {
            return false;
        }
        if (lineNumber < firstInvalidLineNumber) {
            return true;
        }
        if (this._textModel.getLineLength(lineNumber) < 2048 /* CHEAP_TOKENIZATION_LENGTH_LIMIT */) {
            return true;
        }
        return false;
    }
    _hasLinesToTokenize() {
        if (!this._tokenizationSupport) {
            return false;
        }
        return (this._tokenizationStateStore.invalidLineStartIndex < this._textModel.getLineCount());
    }
    _tokenizeOneInvalidLine(builder) {
        if (!this._hasLinesToTokenize()) {
            return this._textModel.getLineCount() + 1;
        }
        const lineNumber = this._tokenizationStateStore.invalidLineStartIndex + 1;
        this._updateTokensUntilLine(builder, lineNumber);
        return lineNumber;
    }
    _updateTokensUntilLine(builder, lineNumber) {
        if (!this._tokenizationSupport) {
            return;
        }
        const languageIdentifier = this._textModel.getLanguageIdentifier();
        const linesLength = this._textModel.getLineCount();
        const endLineIndex = lineNumber - 1;
        // Validate all states up to and including endLineIndex
        for (let lineIndex = this._tokenizationStateStore.invalidLineStartIndex; lineIndex <= endLineIndex; lineIndex++) {
            const text = this._textModel.getLineContent(lineIndex + 1);
            const lineStartState = this._tokenizationStateStore.getBeginState(lineIndex);
            const r = safeTokenize(languageIdentifier, this._tokenizationSupport, text, true, lineStartState);
            builder.add(lineIndex + 1, r.tokens);
            this._tokenizationStateStore.setEndState(linesLength, lineIndex, r.endState);
            lineIndex = this._tokenizationStateStore.invalidLineStartIndex - 1; // -1 because the outer loop increments it
        }
    }
    _tokenizeViewport(builder, startLineNumber, endLineNumber) {
        if (!this._tokenizationSupport) {
            // nothing to do
            return;
        }
        if (endLineNumber <= this._tokenizationStateStore.invalidLineStartIndex) {
            // nothing to do
            return;
        }
        if (startLineNumber <= this._tokenizationStateStore.invalidLineStartIndex) {
            // tokenization has reached the viewport start...
            this._updateTokensUntilLine(builder, endLineNumber);
            return;
        }
        let nonWhitespaceColumn = this._textModel.getLineFirstNonWhitespaceColumn(startLineNumber);
        let fakeLines = [];
        let initialState = null;
        for (let i = startLineNumber - 1; nonWhitespaceColumn > 0 && i >= 1; i--) {
            let newNonWhitespaceIndex = this._textModel.getLineFirstNonWhitespaceColumn(i);
            if (newNonWhitespaceIndex === 0) {
                continue;
            }
            if (newNonWhitespaceIndex < nonWhitespaceColumn) {
                initialState = this._tokenizationStateStore.getBeginState(i - 1);
                if (initialState) {
                    break;
                }
                fakeLines.push(this._textModel.getLineContent(i));
                nonWhitespaceColumn = newNonWhitespaceIndex;
            }
        }
        if (!initialState) {
            initialState = this._tokenizationSupport.getInitialState();
        }
        const languageIdentifier = this._textModel.getLanguageIdentifier();
        let state = initialState;
        for (let i = fakeLines.length - 1; i >= 0; i--) {
            let r = safeTokenize(languageIdentifier, this._tokenizationSupport, fakeLines[i], false, state);
            state = r.endState;
        }
        for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            let text = this._textModel.getLineContent(lineNumber);
            let r = safeTokenize(languageIdentifier, this._tokenizationSupport, text, true, state);
            builder.add(lineNumber, r.tokens);
            this._tokenizationStateStore.setFakeTokens(lineNumber - 1);
            state = r.endState;
        }
    }
}
function initializeTokenization(textModel) {
    const languageIdentifier = textModel.getLanguageIdentifier();
    let tokenizationSupport = (textModel.isTooLargeForTokenization()
        ? null
        : TokenizationRegistry.get(languageIdentifier.language));
    let initialState = null;
    if (tokenizationSupport) {
        try {
            initialState = tokenizationSupport.getInitialState();
        }
        catch (e) {
            onUnexpectedError(e);
            tokenizationSupport = null;
        }
    }
    return [tokenizationSupport, initialState];
}
function safeTokenize(languageIdentifier, tokenizationSupport, text, hasEOL, state) {
    let r = null;
    if (tokenizationSupport) {
        try {
            r = tokenizationSupport.tokenize2(text, hasEOL, state.clone(), 0);
        }
        catch (e) {
            onUnexpectedError(e);
        }
    }
    if (!r) {
        r = nullTokenize2(languageIdentifier.id, text, state, 0);
    }
    LineTokens.convertToEndOffset(r.tokens, text.length);
    return r;
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function roundFloat(number, decimalPoints) {
    const decimal = Math.pow(10, decimalPoints);
    return Math.round(number * decimal) / decimal;
}
class RGBA {
    constructor(r, g, b, a = 1) {
        this.r = Math.min(255, Math.max(0, r)) | 0;
        this.g = Math.min(255, Math.max(0, g)) | 0;
        this.b = Math.min(255, Math.max(0, b)) | 0;
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
    }
}
class HSLA {
    constructor(h, s, l, a) {
        this.h = Math.max(Math.min(360, h), 0) | 0;
        this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
        this.l = roundFloat(Math.max(Math.min(1, l), 0), 3);
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.h === b.h && a.s === b.s && a.l === b.l && a.a === b.a;
    }
    /**
     * Converts an RGB color value to HSL. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h in the set [0, 360], s, and l in the set [0, 1].
     */
    static fromRGBA(rgba) {
        const r = rgba.r / 255;
        const g = rgba.g / 255;
        const b = rgba.b / 255;
        const a = rgba.a;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (min + max) / 2;
        const chroma = max - min;
        if (chroma > 0) {
            s = Math.min((l <= 0.5 ? chroma / (2 * l) : chroma / (2 - (2 * l))), 1);
            switch (max) {
                case r:
                    h = (g - b) / chroma + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / chroma + 2;
                    break;
                case b:
                    h = (r - g) / chroma + 4;
                    break;
            }
            h *= 60;
            h = Math.round(h);
        }
        return new HSLA(h, s, l, a);
    }
    static _hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    /**
     * Converts an HSL color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
     * Assumes h in the set [0, 360] s, and l are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     */
    static toRGBA(hsla) {
        const h = hsla.h / 360;
        const { s, l, a } = hsla;
        let r, g, b;
        if (s === 0) {
            r = g = b = l; // achromatic
        }
        else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = HSLA._hue2rgb(p, q, h + 1 / 3);
            g = HSLA._hue2rgb(p, q, h);
            b = HSLA._hue2rgb(p, q, h - 1 / 3);
        }
        return new RGBA(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a);
    }
}
class HSVA {
    constructor(h, s, v, a) {
        this.h = Math.max(Math.min(360, h), 0) | 0;
        this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
        this.v = roundFloat(Math.max(Math.min(1, v), 0), 3);
        this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
    }
    static equals(a, b) {
        return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
    }
    // from http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
    static fromRGBA(rgba) {
        const r = rgba.r / 255;
        const g = rgba.g / 255;
        const b = rgba.b / 255;
        const cmax = Math.max(r, g, b);
        const cmin = Math.min(r, g, b);
        const delta = cmax - cmin;
        const s = cmax === 0 ? 0 : (delta / cmax);
        let m;
        if (delta === 0) {
            m = 0;
        }
        else if (cmax === r) {
            m = ((((g - b) / delta) % 6) + 6) % 6;
        }
        else if (cmax === g) {
            m = ((b - r) / delta) + 2;
        }
        else {
            m = ((r - g) / delta) + 4;
        }
        return new HSVA(Math.round(m * 60), s, cmax, rgba.a);
    }
    // from http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
    static toRGBA(hsva) {
        const { h, s, v, a } = hsva;
        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;
        let [r, g, b] = [0, 0, 0];
        if (h < 60) {
            r = c;
            g = x;
        }
        else if (h < 120) {
            r = x;
            g = c;
        }
        else if (h < 180) {
            g = c;
            b = x;
        }
        else if (h < 240) {
            g = x;
            b = c;
        }
        else if (h < 300) {
            r = x;
            b = c;
        }
        else if (h <= 360) {
            r = c;
            b = x;
        }
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return new RGBA(r, g, b, a);
    }
}
class Color {
    constructor(arg) {
        if (!arg) {
            throw new Error('Color needs a value');
        }
        else if (arg instanceof RGBA) {
            this.rgba = arg;
        }
        else if (arg instanceof HSLA) {
            this._hsla = arg;
            this.rgba = HSLA.toRGBA(arg);
        }
        else if (arg instanceof HSVA) {
            this._hsva = arg;
            this.rgba = HSVA.toRGBA(arg);
        }
        else {
            throw new Error('Invalid color ctor argument');
        }
    }
    static fromHex(hex) {
        return Color.Format.CSS.parseHex(hex) || Color.red;
    }
    get hsla() {
        if (this._hsla) {
            return this._hsla;
        }
        else {
            return HSLA.fromRGBA(this.rgba);
        }
    }
    get hsva() {
        if (this._hsva) {
            return this._hsva;
        }
        return HSVA.fromRGBA(this.rgba);
    }
    equals(other) {
        return !!other && RGBA.equals(this.rgba, other.rgba) && HSLA.equals(this.hsla, other.hsla) && HSVA.equals(this.hsva, other.hsva);
    }
    /**
     * http://www.w3.org/TR/WCAG20/#relativeluminancedef
     * Returns the number in the set [0, 1]. O => Darkest Black. 1 => Lightest white.
     */
    getRelativeLuminance() {
        const R = Color._relativeLuminanceForComponent(this.rgba.r);
        const G = Color._relativeLuminanceForComponent(this.rgba.g);
        const B = Color._relativeLuminanceForComponent(this.rgba.b);
        const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
        return roundFloat(luminance, 4);
    }
    static _relativeLuminanceForComponent(color) {
        const c = color / 255;
        return (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
    }
    /**
     *	http://24ways.org/2010/calculating-color-contrast
     *  Return 'true' if lighter color otherwise 'false'
     */
    isLighter() {
        const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1000;
        return yiq >= 128;
    }
    isLighterThan(another) {
        const lum1 = this.getRelativeLuminance();
        const lum2 = another.getRelativeLuminance();
        return lum1 > lum2;
    }
    isDarkerThan(another) {
        const lum1 = this.getRelativeLuminance();
        const lum2 = another.getRelativeLuminance();
        return lum1 < lum2;
    }
    lighten(factor) {
        return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l + this.hsla.l * factor, this.hsla.a));
    }
    darken(factor) {
        return new Color(new HSLA(this.hsla.h, this.hsla.s, this.hsla.l - this.hsla.l * factor, this.hsla.a));
    }
    transparent(factor) {
        const { r, g, b, a } = this.rgba;
        return new Color(new RGBA(r, g, b, a * factor));
    }
    isTransparent() {
        return this.rgba.a === 0;
    }
    isOpaque() {
        return this.rgba.a === 1;
    }
    opposite() {
        return new Color(new RGBA(255 - this.rgba.r, 255 - this.rgba.g, 255 - this.rgba.b, this.rgba.a));
    }
    toString() {
        return '' + Color.Format.CSS.format(this);
    }
    static getLighterColor(of, relative, factor) {
        if (of.isLighterThan(relative)) {
            return of;
        }
        factor = factor ? factor : 0.5;
        const lum1 = of.getRelativeLuminance();
        const lum2 = relative.getRelativeLuminance();
        factor = factor * (lum2 - lum1) / lum2;
        return of.lighten(factor);
    }
    static getDarkerColor(of, relative, factor) {
        if (of.isDarkerThan(relative)) {
            return of;
        }
        factor = factor ? factor : 0.5;
        const lum1 = of.getRelativeLuminance();
        const lum2 = relative.getRelativeLuminance();
        factor = factor * (lum1 - lum2) / lum1;
        return of.darken(factor);
    }
}
Color.white = new Color(new RGBA(255, 255, 255, 1));
Color.black = new Color(new RGBA(0, 0, 0, 1));
Color.red = new Color(new RGBA(255, 0, 0, 1));
Color.blue = new Color(new RGBA(0, 0, 255, 1));
Color.cyan = new Color(new RGBA(0, 255, 255, 1));
Color.lightgrey = new Color(new RGBA(211, 211, 211, 1));
Color.transparent = new Color(new RGBA(0, 0, 0, 0));
(function (Color) {
    (function (Format) {
        (function (CSS) {
            function formatRGB(color) {
                if (color.rgba.a === 1) {
                    return `rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`;
                }
                return Color.Format.CSS.formatRGBA(color);
            }
            CSS.formatRGB = formatRGB;
            function formatRGBA(color) {
                return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${+(color.rgba.a).toFixed(2)})`;
            }
            CSS.formatRGBA = formatRGBA;
            function formatHSL(color) {
                if (color.hsla.a === 1) {
                    return `hsl(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%)`;
                }
                return Color.Format.CSS.formatHSLA(color);
            }
            CSS.formatHSL = formatHSL;
            function formatHSLA(color) {
                return `hsla(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%, ${color.hsla.a.toFixed(2)})`;
            }
            CSS.formatHSLA = formatHSLA;
            function _toTwoDigitHex(n) {
                const r = n.toString(16);
                return r.length !== 2 ? '0' + r : r;
            }
            /**
             * Formats the color as #RRGGBB
             */
            function formatHex(color) {
                return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}`;
            }
            CSS.formatHex = formatHex;
            /**
             * Formats the color as #RRGGBBAA
             * If 'compact' is set, colors without transparancy will be printed as #RRGGBB
             */
            function formatHexA(color, compact = false) {
                if (compact && color.rgba.a === 1) {
                    return Color.Format.CSS.formatHex(color);
                }
                return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}${_toTwoDigitHex(Math.round(color.rgba.a * 255))}`;
            }
            CSS.formatHexA = formatHexA;
            /**
             * The default format will use HEX if opaque and RGBA otherwise.
             */
            function format(color) {
                if (color.isOpaque()) {
                    return Color.Format.CSS.formatHex(color);
                }
                return Color.Format.CSS.formatRGBA(color);
            }
            CSS.format = format;
            /**
             * Converts an Hex color value to a Color.
             * returns r, g, and b are contained in the set [0, 255]
             * @param hex string (#RGB, #RGBA, #RRGGBB or #RRGGBBAA).
             */
            function parseHex(hex) {
                const length = hex.length;
                if (length === 0) {
                    // Invalid color
                    return null;
                }
                if (hex.charCodeAt(0) !== 35 /* Hash */) {
                    // Does not begin with a #
                    return null;
                }
                if (length === 7) {
                    // #RRGGBB format
                    const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                    const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                    const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                    return new Color(new RGBA(r, g, b, 1));
                }
                if (length === 9) {
                    // #RRGGBBAA format
                    const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
                    const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
                    const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
                    const a = 16 * _parseHexDigit(hex.charCodeAt(7)) + _parseHexDigit(hex.charCodeAt(8));
                    return new Color(new RGBA(r, g, b, a / 255));
                }
                if (length === 4) {
                    // #RGB format
                    const r = _parseHexDigit(hex.charCodeAt(1));
                    const g = _parseHexDigit(hex.charCodeAt(2));
                    const b = _parseHexDigit(hex.charCodeAt(3));
                    return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b));
                }
                if (length === 5) {
                    // #RGBA format
                    const r = _parseHexDigit(hex.charCodeAt(1));
                    const g = _parseHexDigit(hex.charCodeAt(2));
                    const b = _parseHexDigit(hex.charCodeAt(3));
                    const a = _parseHexDigit(hex.charCodeAt(4));
                    return new Color(new RGBA(16 * r + r, 16 * g + g, 16 * b + b, (16 * a + a) / 255));
                }
                // Invalid color
                return null;
            }
            CSS.parseHex = parseHex;
            function _parseHexDigit(charCode) {
                switch (charCode) {
                    case 48 /* Digit0 */: return 0;
                    case 49 /* Digit1 */: return 1;
                    case 50 /* Digit2 */: return 2;
                    case 51 /* Digit3 */: return 3;
                    case 52 /* Digit4 */: return 4;
                    case 53 /* Digit5 */: return 5;
                    case 54 /* Digit6 */: return 6;
                    case 55 /* Digit7 */: return 7;
                    case 56 /* Digit8 */: return 8;
                    case 57 /* Digit9 */: return 9;
                    case 97 /* a */: return 10;
                    case 65 /* A */: return 10;
                    case 98 /* b */: return 11;
                    case 66 /* B */: return 11;
                    case 99 /* c */: return 12;
                    case 67 /* C */: return 12;
                    case 100 /* d */: return 13;
                    case 68 /* D */: return 13;
                    case 101 /* e */: return 14;
                    case 69 /* E */: return 14;
                    case 102 /* f */: return 15;
                    case 70 /* F */: return 15;
                }
                return 0;
            }
        })(Format.CSS || (Format.CSS = {}));
    })(Color.Format || (Color.Format = {}));
})(Color || (Color = {}));

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function createTextBufferBuilder() {
    return new PieceTreeTextBufferBuilder();
}
function createTextBufferFactory(text) {
    const builder = createTextBufferBuilder();
    builder.acceptChunk(text);
    return builder.finish();
}
function createTextBuffer(value, defaultEOL) {
    const factory = (typeof value === 'string' ? createTextBufferFactory(value) : value);
    return factory.create(defaultEOL);
}
let MODEL_ID = 0;
const LIMIT_FIND_COUNT$1 = 999;
const LONG_LINE_BOUNDARY = 10000;
class TextModelSnapshot {
    constructor(source) {
        this._source = source;
        this._eos = false;
    }
    read() {
        if (this._eos) {
            return null;
        }
        let result = [], resultCnt = 0, resultLength = 0;
        do {
            let tmp = this._source.read();
            if (tmp === null) {
                // end-of-stream
                this._eos = true;
                if (resultCnt === 0) {
                    return null;
                }
                else {
                    return result.join('');
                }
            }
            if (tmp.length > 0) {
                result[resultCnt++] = tmp;
                resultLength += tmp.length;
            }
            if (resultLength >= 64 * 1024) {
                return result.join('');
            }
        } while (true);
    }
}
const invalidFunc = () => { throw new Error(`Invalid change accessor`); };
class BracketSearchCanceled {
    constructor() {
        this._searchCanceledBrand = undefined;
    }
}
BracketSearchCanceled.INSTANCE = new BracketSearchCanceled();
function stripBracketSearchCanceled(result) {
    if (result instanceof BracketSearchCanceled) {
        return null;
    }
    return result;
}
class TextModel extends Disposable {
    //#endregion
    constructor(source, creationOptions, languageIdentifier, associatedResource = null, undoRedoService) {
        super();
        //#region Events
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        this._onDidChangeDecorations = this._register(new DidChangeDecorationsEmitter());
        this.onDidChangeDecorations = this._onDidChangeDecorations.event;
        this._onDidChangeLanguage = this._register(new Emitter());
        this.onDidChangeLanguage = this._onDidChangeLanguage.event;
        this._onDidChangeLanguageConfiguration = this._register(new Emitter());
        this.onDidChangeLanguageConfiguration = this._onDidChangeLanguageConfiguration.event;
        this._onDidChangeTokens = this._register(new Emitter());
        this.onDidChangeTokens = this._onDidChangeTokens.event;
        this._onDidChangeOptions = this._register(new Emitter());
        this.onDidChangeOptions = this._onDidChangeOptions.event;
        this._onDidChangeAttached = this._register(new Emitter());
        this.onDidChangeAttached = this._onDidChangeAttached.event;
        this._eventEmitter = this._register(new DidChangeContentEmitter());
        // Generate a new unique model id
        MODEL_ID++;
        this.id = '$model' + MODEL_ID;
        this.isForSimpleWidget = creationOptions.isForSimpleWidget;
        if (typeof associatedResource === 'undefined' || associatedResource === null) {
            this._associatedResource = URI.parse('inmemory://model/' + MODEL_ID);
        }
        else {
            this._associatedResource = associatedResource;
        }
        this._undoRedoService = undoRedoService;
        this._attachedEditorCount = 0;
        const { textBuffer, disposable } = createTextBuffer(source, creationOptions.defaultEOL);
        this._buffer = textBuffer;
        this._bufferDisposable = disposable;
        this._options = TextModel.resolveOptions(this._buffer, creationOptions);
        const bufferLineCount = this._buffer.getLineCount();
        const bufferTextLength = this._buffer.getValueLengthInRange(new Range(1, 1, bufferLineCount, this._buffer.getLineLength(bufferLineCount) + 1), 0 /* TextDefined */);
        // !!! Make a decision in the ctor and permanently respect this decision !!!
        // If a model is too large at construction time, it will never get tokenized,
        // under no circumstances.
        if (creationOptions.largeFileOptimizations) {
            this._isTooLargeForTokenization = ((bufferTextLength > TextModel.LARGE_FILE_SIZE_THRESHOLD)
                || (bufferLineCount > TextModel.LARGE_FILE_LINE_COUNT_THRESHOLD));
        }
        else {
            this._isTooLargeForTokenization = false;
        }
        this._isTooLargeForSyncing = (bufferTextLength > TextModel.MODEL_SYNC_LIMIT);
        this._versionId = 1;
        this._alternativeVersionId = 1;
        this._initialUndoRedoSnapshot = null;
        this._isDisposed = false;
        this._isDisposing = false;
        this._languageIdentifier = languageIdentifier || NULL_LANGUAGE_IDENTIFIER;
        this._languageRegistryListener = LanguageConfigurationRegistry.onDidChange((e) => {
            if (e.languageIdentifier.id === this._languageIdentifier.id) {
                this._onDidChangeLanguageConfiguration.fire({});
            }
        });
        this._instanceId = singleLetterHash(MODEL_ID);
        this._lastDecorationId = 0;
        this._decorations = Object.create(null);
        this._decorationsTree = new DecorationsTrees();
        this._commandManager = new EditStack(this, undoRedoService);
        this._isUndoing = false;
        this._isRedoing = false;
        this._trimAutoWhitespaceLines = null;
        this._tokens = new TokensStore();
        this._tokens2 = new TokensStore2();
        this._tokenization = new TextModelTokenization(this);
    }
    static resolveOptions(textBuffer, options) {
        if (options.detectIndentation) {
            const guessedIndentation = guessIndentation(textBuffer, options.tabSize, options.insertSpaces);
            return new TextModelResolvedOptions({
                tabSize: guessedIndentation.tabSize,
                indentSize: guessedIndentation.tabSize,
                insertSpaces: guessedIndentation.insertSpaces,
                trimAutoWhitespace: options.trimAutoWhitespace,
                defaultEOL: options.defaultEOL
            });
        }
        return new TextModelResolvedOptions({
            tabSize: options.tabSize,
            indentSize: options.indentSize,
            insertSpaces: options.insertSpaces,
            trimAutoWhitespace: options.trimAutoWhitespace,
            defaultEOL: options.defaultEOL
        });
    }
    onDidChangeRawContentFast(listener) {
        return this._eventEmitter.fastEvent((e) => listener(e.rawContentChangedEvent));
    }
    onDidChangeContentFast(listener) {
        return this._eventEmitter.fastEvent((e) => listener(e.contentChangedEvent));
    }
    onDidChangeContent(listener) {
        return this._eventEmitter.slowEvent((e) => listener(e.contentChangedEvent));
    }
    dispose() {
        this._isDisposing = true;
        this._onWillDispose.fire();
        this._languageRegistryListener.dispose();
        this._tokenization.dispose();
        this._isDisposed = true;
        super.dispose();
        this._bufferDisposable.dispose();
        this._isDisposing = false;
        // Manually release reference to previous text buffer to avoid large leaks
        // in case someone leaks a TextModel reference
        const emptyDisposedTextBuffer = new PieceTreeTextBuffer([], '', '\n', false, false, true, true);
        emptyDisposedTextBuffer.dispose();
        this._buffer = emptyDisposedTextBuffer;
    }
    _assertNotDisposed() {
        if (this._isDisposed) {
            throw new Error('Model is disposed!');
        }
    }
    _emitContentChangedEvent(rawChange, change) {
        if (this._isDisposing) {
            // Do not confuse listeners by emitting any event after disposing
            return;
        }
        this._eventEmitter.fire(new InternalModelContentChangeEvent(rawChange, change));
    }
    setValue(value) {
        this._assertNotDisposed();
        if (value === null) {
            // There's nothing to do
            return;
        }
        const { textBuffer, disposable } = createTextBuffer(value, this._options.defaultEOL);
        this._setValueFromTextBuffer(textBuffer, disposable);
    }
    _createContentChanged2(range, rangeOffset, rangeLength, text, isUndoing, isRedoing, isFlush) {
        return {
            changes: [{
                    range: range,
                    rangeOffset: rangeOffset,
                    rangeLength: rangeLength,
                    text: text,
                }],
            eol: this._buffer.getEOL(),
            versionId: this.getVersionId(),
            isUndoing: isUndoing,
            isRedoing: isRedoing,
            isFlush: isFlush
        };
    }
    _setValueFromTextBuffer(textBuffer, textBufferDisposable) {
        this._assertNotDisposed();
        const oldFullModelRange = this.getFullModelRange();
        const oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
        const endLineNumber = this.getLineCount();
        const endColumn = this.getLineMaxColumn(endLineNumber);
        this._buffer = textBuffer;
        this._bufferDisposable.dispose();
        this._bufferDisposable = textBufferDisposable;
        this._increaseVersionId();
        // Flush all tokens
        this._tokens.flush();
        this._tokens2.flush();
        // Destroy all my decorations
        this._decorations = Object.create(null);
        this._decorationsTree = new DecorationsTrees();
        // Destroy my edit history and settings
        this._commandManager.clear();
        this._trimAutoWhitespaceLines = null;
        this._emitContentChangedEvent(new ModelRawContentChangedEvent([
            new ModelRawFlush()
        ], this._versionId, false, false), this._createContentChanged2(new Range(1, 1, endLineNumber, endColumn), 0, oldModelValueLength, this.getValue(), false, false, true));
    }
    setEOL(eol) {
        this._assertNotDisposed();
        const newEOL = (eol === 1 /* CRLF */ ? '\r\n' : '\n');
        if (this._buffer.getEOL() === newEOL) {
            // Nothing to do
            return;
        }
        const oldFullModelRange = this.getFullModelRange();
        const oldModelValueLength = this.getValueLengthInRange(oldFullModelRange);
        const endLineNumber = this.getLineCount();
        const endColumn = this.getLineMaxColumn(endLineNumber);
        this._onBeforeEOLChange();
        this._buffer.setEOL(newEOL);
        this._increaseVersionId();
        this._onAfterEOLChange();
        this._emitContentChangedEvent(new ModelRawContentChangedEvent([
            new ModelRawEOLChanged()
        ], this._versionId, false, false), this._createContentChanged2(new Range(1, 1, endLineNumber, endColumn), 0, oldModelValueLength, this.getValue(), false, false, false));
    }
    _onBeforeEOLChange() {
        // Ensure all decorations get their `range` set.
        const versionId = this.getVersionId();
        const allDecorations = this._decorationsTree.search(0, false, false, versionId);
        this._ensureNodesHaveRanges(allDecorations);
    }
    _onAfterEOLChange() {
        // Transform back `range` to offsets
        const versionId = this.getVersionId();
        const allDecorations = this._decorationsTree.collectNodesPostOrder();
        for (let i = 0, len = allDecorations.length; i < len; i++) {
            const node = allDecorations[i];
            const delta = node.cachedAbsoluteStart - node.start;
            const startOffset = this._buffer.getOffsetAt(node.range.startLineNumber, node.range.startColumn);
            const endOffset = this._buffer.getOffsetAt(node.range.endLineNumber, node.range.endColumn);
            node.cachedAbsoluteStart = startOffset;
            node.cachedAbsoluteEnd = endOffset;
            node.cachedVersionId = versionId;
            node.start = startOffset - delta;
            node.end = endOffset - delta;
            recomputeMaxEnd(node);
        }
    }
    onBeforeAttached() {
        this._attachedEditorCount++;
        if (this._attachedEditorCount === 1) {
            this._onDidChangeAttached.fire(undefined);
        }
    }
    onBeforeDetached() {
        this._attachedEditorCount--;
        if (this._attachedEditorCount === 0) {
            this._onDidChangeAttached.fire(undefined);
        }
    }
    isAttachedToEditor() {
        return this._attachedEditorCount > 0;
    }
    getAttachedEditorCount() {
        return this._attachedEditorCount;
    }
    isTooLargeForSyncing() {
        return this._isTooLargeForSyncing;
    }
    isTooLargeForTokenization() {
        return this._isTooLargeForTokenization;
    }
    isDisposed() {
        return this._isDisposed;
    }
    isDominatedByLongLines() {
        this._assertNotDisposed();
        if (this.isTooLargeForTokenization()) {
            // Cannot word wrap huge files anyways, so it doesn't really matter
            return false;
        }
        let smallLineCharCount = 0;
        let longLineCharCount = 0;
        const lineCount = this._buffer.getLineCount();
        for (let lineNumber = 1; lineNumber <= lineCount; lineNumber++) {
            const lineLength = this._buffer.getLineLength(lineNumber);
            if (lineLength >= LONG_LINE_BOUNDARY) {
                longLineCharCount += lineLength;
            }
            else {
                smallLineCharCount += lineLength;
            }
        }
        return (longLineCharCount > smallLineCharCount);
    }
    get uri() {
        return this._associatedResource;
    }
    //#region Options
    getOptions() {
        this._assertNotDisposed();
        return this._options;
    }
    getFormattingOptions() {
        return {
            tabSize: this._options.indentSize,
            insertSpaces: this._options.insertSpaces
        };
    }
    updateOptions(_newOpts) {
        this._assertNotDisposed();
        let tabSize = (typeof _newOpts.tabSize !== 'undefined') ? _newOpts.tabSize : this._options.tabSize;
        let indentSize = (typeof _newOpts.indentSize !== 'undefined') ? _newOpts.indentSize : this._options.indentSize;
        let insertSpaces = (typeof _newOpts.insertSpaces !== 'undefined') ? _newOpts.insertSpaces : this._options.insertSpaces;
        let trimAutoWhitespace = (typeof _newOpts.trimAutoWhitespace !== 'undefined') ? _newOpts.trimAutoWhitespace : this._options.trimAutoWhitespace;
        let newOpts = new TextModelResolvedOptions({
            tabSize: tabSize,
            indentSize: indentSize,
            insertSpaces: insertSpaces,
            defaultEOL: this._options.defaultEOL,
            trimAutoWhitespace: trimAutoWhitespace
        });
        if (this._options.equals(newOpts)) {
            return;
        }
        let e = this._options.createChangeEvent(newOpts);
        this._options = newOpts;
        this._onDidChangeOptions.fire(e);
    }
    detectIndentation(defaultInsertSpaces, defaultTabSize) {
        this._assertNotDisposed();
        let guessedIndentation = guessIndentation(this._buffer, defaultTabSize, defaultInsertSpaces);
        this.updateOptions({
            insertSpaces: guessedIndentation.insertSpaces,
            tabSize: guessedIndentation.tabSize,
            indentSize: guessedIndentation.tabSize, // TODO@Alex: guess indentSize independent of tabSize
        });
    }
    static _normalizeIndentationFromWhitespace(str, indentSize, insertSpaces) {
        let spacesCnt = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) === '\t') {
                spacesCnt += indentSize;
            }
            else {
                spacesCnt++;
            }
        }
        let result = '';
        if (!insertSpaces) {
            let tabsCnt = Math.floor(spacesCnt / indentSize);
            spacesCnt = spacesCnt % indentSize;
            for (let i = 0; i < tabsCnt; i++) {
                result += '\t';
            }
        }
        for (let i = 0; i < spacesCnt; i++) {
            result += ' ';
        }
        return result;
    }
    static normalizeIndentation(str, indentSize, insertSpaces) {
        let firstNonWhitespaceIndex$1 = firstNonWhitespaceIndex(str);
        if (firstNonWhitespaceIndex$1 === -1) {
            firstNonWhitespaceIndex$1 = str.length;
        }
        return TextModel._normalizeIndentationFromWhitespace(str.substring(0, firstNonWhitespaceIndex$1), indentSize, insertSpaces) + str.substring(firstNonWhitespaceIndex$1);
    }
    normalizeIndentation(str) {
        this._assertNotDisposed();
        return TextModel.normalizeIndentation(str, this._options.indentSize, this._options.insertSpaces);
    }
    //#endregion
    //#region Reading
    getVersionId() {
        this._assertNotDisposed();
        return this._versionId;
    }
    mightContainRTL() {
        return this._buffer.mightContainRTL();
    }
    mightContainUnusualLineTerminators() {
        return this._buffer.mightContainUnusualLineTerminators();
    }
    removeUnusualLineTerminators(selections = null) {
        const matches = this.findMatches(UNUSUAL_LINE_TERMINATORS.source, false, true, false, null, false, 1073741824 /* MAX_SAFE_SMALL_INTEGER */);
        this._buffer.resetMightContainUnusualLineTerminators();
        this.pushEditOperations(selections, matches.map(m => ({ range: m.range, text: null })), () => null);
    }
    mightContainNonBasicASCII() {
        return this._buffer.mightContainNonBasicASCII();
    }
    getAlternativeVersionId() {
        this._assertNotDisposed();
        return this._alternativeVersionId;
    }
    getInitialUndoRedoSnapshot() {
        this._assertNotDisposed();
        return this._initialUndoRedoSnapshot;
    }
    getOffsetAt(rawPosition) {
        this._assertNotDisposed();
        let position = this._validatePosition(rawPosition.lineNumber, rawPosition.column, 0 /* Relaxed */);
        return this._buffer.getOffsetAt(position.lineNumber, position.column);
    }
    getPositionAt(rawOffset) {
        this._assertNotDisposed();
        let offset = (Math.min(this._buffer.getLength(), Math.max(0, rawOffset)));
        return this._buffer.getPositionAt(offset);
    }
    _increaseVersionId() {
        this._versionId = this._versionId + 1;
        this._alternativeVersionId = this._versionId;
    }
    _overwriteVersionId(versionId) {
        this._versionId = versionId;
    }
    _overwriteAlternativeVersionId(newAlternativeVersionId) {
        this._alternativeVersionId = newAlternativeVersionId;
    }
    _overwriteInitialUndoRedoSnapshot(newInitialUndoRedoSnapshot) {
        this._initialUndoRedoSnapshot = newInitialUndoRedoSnapshot;
    }
    getValue(eol, preserveBOM = false) {
        this._assertNotDisposed();
        const fullModelRange = this.getFullModelRange();
        const fullModelValue = this.getValueInRange(fullModelRange, eol);
        if (preserveBOM) {
            return this._buffer.getBOM() + fullModelValue;
        }
        return fullModelValue;
    }
    createSnapshot(preserveBOM = false) {
        return new TextModelSnapshot(this._buffer.createSnapshot(preserveBOM));
    }
    getValueLength(eol, preserveBOM = false) {
        this._assertNotDisposed();
        const fullModelRange = this.getFullModelRange();
        const fullModelValue = this.getValueLengthInRange(fullModelRange, eol);
        if (preserveBOM) {
            return this._buffer.getBOM().length + fullModelValue;
        }
        return fullModelValue;
    }
    getValueInRange(rawRange, eol = 0 /* TextDefined */) {
        this._assertNotDisposed();
        return this._buffer.getValueInRange(this.validateRange(rawRange), eol);
    }
    getValueLengthInRange(rawRange, eol = 0 /* TextDefined */) {
        this._assertNotDisposed();
        return this._buffer.getValueLengthInRange(this.validateRange(rawRange), eol);
    }
    getCharacterCountInRange(rawRange, eol = 0 /* TextDefined */) {
        this._assertNotDisposed();
        return this._buffer.getCharacterCountInRange(this.validateRange(rawRange), eol);
    }
    getLineCount() {
        this._assertNotDisposed();
        return this._buffer.getLineCount();
    }
    getLineContent(lineNumber) {
        this._assertNotDisposed();
        if (lineNumber < 1 || lineNumber > this.getLineCount()) {
            throw new Error('Illegal value for lineNumber');
        }
        return this._buffer.getLineContent(lineNumber);
    }
    getLineLength(lineNumber) {
        this._assertNotDisposed();
        if (lineNumber < 1 || lineNumber > this.getLineCount()) {
            throw new Error('Illegal value for lineNumber');
        }
        return this._buffer.getLineLength(lineNumber);
    }
    getLinesContent() {
        this._assertNotDisposed();
        return this._buffer.getLinesContent();
    }
    getEOL() {
        this._assertNotDisposed();
        return this._buffer.getEOL();
    }
    getEndOfLineSequence() {
        this._assertNotDisposed();
        return (this._buffer.getEOL() === '\n'
            ? 0 /* LF */
            : 1 /* CRLF */);
    }
    getLineMinColumn(lineNumber) {
        this._assertNotDisposed();
        return 1;
    }
    getLineMaxColumn(lineNumber) {
        this._assertNotDisposed();
        if (lineNumber < 1 || lineNumber > this.getLineCount()) {
            throw new Error('Illegal value for lineNumber');
        }
        return this._buffer.getLineLength(lineNumber) + 1;
    }
    getLineFirstNonWhitespaceColumn(lineNumber) {
        this._assertNotDisposed();
        if (lineNumber < 1 || lineNumber > this.getLineCount()) {
            throw new Error('Illegal value for lineNumber');
        }
        return this._buffer.getLineFirstNonWhitespaceColumn(lineNumber);
    }
    getLineLastNonWhitespaceColumn(lineNumber) {
        this._assertNotDisposed();
        if (lineNumber < 1 || lineNumber > this.getLineCount()) {
            throw new Error('Illegal value for lineNumber');
        }
        return this._buffer.getLineLastNonWhitespaceColumn(lineNumber);
    }
    /**
     * Validates `range` is within buffer bounds, but allows it to sit in between surrogate pairs, etc.
     * Will try to not allocate if possible.
     */
    _validateRangeRelaxedNoAllocations(range) {
        const linesCount = this._buffer.getLineCount();
        const initialStartLineNumber = range.startLineNumber;
        const initialStartColumn = range.startColumn;
        let startLineNumber = Math.floor((typeof initialStartLineNumber === 'number' && !isNaN(initialStartLineNumber)) ? initialStartLineNumber : 1);
        let startColumn = Math.floor((typeof initialStartColumn === 'number' && !isNaN(initialStartColumn)) ? initialStartColumn : 1);
        if (startLineNumber < 1) {
            startLineNumber = 1;
            startColumn = 1;
        }
        else if (startLineNumber > linesCount) {
            startLineNumber = linesCount;
            startColumn = this.getLineMaxColumn(startLineNumber);
        }
        else {
            if (startColumn <= 1) {
                startColumn = 1;
            }
            else {
                const maxColumn = this.getLineMaxColumn(startLineNumber);
                if (startColumn >= maxColumn) {
                    startColumn = maxColumn;
                }
            }
        }
        const initialEndLineNumber = range.endLineNumber;
        const initialEndColumn = range.endColumn;
        let endLineNumber = Math.floor((typeof initialEndLineNumber === 'number' && !isNaN(initialEndLineNumber)) ? initialEndLineNumber : 1);
        let endColumn = Math.floor((typeof initialEndColumn === 'number' && !isNaN(initialEndColumn)) ? initialEndColumn : 1);
        if (endLineNumber < 1) {
            endLineNumber = 1;
            endColumn = 1;
        }
        else if (endLineNumber > linesCount) {
            endLineNumber = linesCount;
            endColumn = this.getLineMaxColumn(endLineNumber);
        }
        else {
            if (endColumn <= 1) {
                endColumn = 1;
            }
            else {
                const maxColumn = this.getLineMaxColumn(endLineNumber);
                if (endColumn >= maxColumn) {
                    endColumn = maxColumn;
                }
            }
        }
        if (initialStartLineNumber === startLineNumber
            && initialStartColumn === startColumn
            && initialEndLineNumber === endLineNumber
            && initialEndColumn === endColumn
            && range instanceof Range
            && !(range instanceof Selection)) {
            return range;
        }
        return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
    }
    _isValidPosition(lineNumber, column, validationType) {
        if (typeof lineNumber !== 'number' || typeof column !== 'number') {
            return false;
        }
        if (isNaN(lineNumber) || isNaN(column)) {
            return false;
        }
        if (lineNumber < 1 || column < 1) {
            return false;
        }
        if ((lineNumber | 0) !== lineNumber || (column | 0) !== column) {
            return false;
        }
        const lineCount = this._buffer.getLineCount();
        if (lineNumber > lineCount) {
            return false;
        }
        if (column === 1) {
            return true;
        }
        const maxColumn = this.getLineMaxColumn(lineNumber);
        if (column > maxColumn) {
            return false;
        }
        if (validationType === 1 /* SurrogatePairs */) {
            // !!At this point, column > 1
            const charCodeBefore = this._buffer.getLineCharCode(lineNumber, column - 2);
            if (isHighSurrogate(charCodeBefore)) {
                return false;
            }
        }
        return true;
    }
    _validatePosition(_lineNumber, _column, validationType) {
        const lineNumber = Math.floor((typeof _lineNumber === 'number' && !isNaN(_lineNumber)) ? _lineNumber : 1);
        const column = Math.floor((typeof _column === 'number' && !isNaN(_column)) ? _column : 1);
        const lineCount = this._buffer.getLineCount();
        if (lineNumber < 1) {
            return new Position(1, 1);
        }
        if (lineNumber > lineCount) {
            return new Position(lineCount, this.getLineMaxColumn(lineCount));
        }
        if (column <= 1) {
            return new Position(lineNumber, 1);
        }
        const maxColumn = this.getLineMaxColumn(lineNumber);
        if (column >= maxColumn) {
            return new Position(lineNumber, maxColumn);
        }
        if (validationType === 1 /* SurrogatePairs */) {
            // If the position would end up in the middle of a high-low surrogate pair,
            // we move it to before the pair
            // !!At this point, column > 1
            const charCodeBefore = this._buffer.getLineCharCode(lineNumber, column - 2);
            if (isHighSurrogate(charCodeBefore)) {
                return new Position(lineNumber, column - 1);
            }
        }
        return new Position(lineNumber, column);
    }
    validatePosition(position) {
        const validationType = 1 /* SurrogatePairs */;
        this._assertNotDisposed();
        // Avoid object allocation and cover most likely case
        if (position instanceof Position) {
            if (this._isValidPosition(position.lineNumber, position.column, validationType)) {
                return position;
            }
        }
        return this._validatePosition(position.lineNumber, position.column, validationType);
    }
    _isValidRange(range, validationType) {
        const startLineNumber = range.startLineNumber;
        const startColumn = range.startColumn;
        const endLineNumber = range.endLineNumber;
        const endColumn = range.endColumn;
        if (!this._isValidPosition(startLineNumber, startColumn, 0 /* Relaxed */)) {
            return false;
        }
        if (!this._isValidPosition(endLineNumber, endColumn, 0 /* Relaxed */)) {
            return false;
        }
        if (validationType === 1 /* SurrogatePairs */) {
            const charCodeBeforeStart = (startColumn > 1 ? this._buffer.getLineCharCode(startLineNumber, startColumn - 2) : 0);
            const charCodeBeforeEnd = (endColumn > 1 && endColumn <= this._buffer.getLineLength(endLineNumber) ? this._buffer.getLineCharCode(endLineNumber, endColumn - 2) : 0);
            const startInsideSurrogatePair = isHighSurrogate(charCodeBeforeStart);
            const endInsideSurrogatePair = isHighSurrogate(charCodeBeforeEnd);
            if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
                return true;
            }
            return false;
        }
        return true;
    }
    validateRange(_range) {
        const validationType = 1 /* SurrogatePairs */;
        this._assertNotDisposed();
        // Avoid object allocation and cover most likely case
        if ((_range instanceof Range) && !(_range instanceof Selection)) {
            if (this._isValidRange(_range, validationType)) {
                return _range;
            }
        }
        const start = this._validatePosition(_range.startLineNumber, _range.startColumn, 0 /* Relaxed */);
        const end = this._validatePosition(_range.endLineNumber, _range.endColumn, 0 /* Relaxed */);
        const startLineNumber = start.lineNumber;
        const startColumn = start.column;
        const endLineNumber = end.lineNumber;
        const endColumn = end.column;
        {
            const charCodeBeforeStart = (startColumn > 1 ? this._buffer.getLineCharCode(startLineNumber, startColumn - 2) : 0);
            const charCodeBeforeEnd = (endColumn > 1 && endColumn <= this._buffer.getLineLength(endLineNumber) ? this._buffer.getLineCharCode(endLineNumber, endColumn - 2) : 0);
            const startInsideSurrogatePair = isHighSurrogate(charCodeBeforeStart);
            const endInsideSurrogatePair = isHighSurrogate(charCodeBeforeEnd);
            if (!startInsideSurrogatePair && !endInsideSurrogatePair) {
                return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
            }
            if (startLineNumber === endLineNumber && startColumn === endColumn) {
                // do not expand a collapsed range, simply move it to a valid location
                return new Range(startLineNumber, startColumn - 1, endLineNumber, endColumn - 1);
            }
            if (startInsideSurrogatePair && endInsideSurrogatePair) {
                // expand range at both ends
                return new Range(startLineNumber, startColumn - 1, endLineNumber, endColumn + 1);
            }
            if (startInsideSurrogatePair) {
                // only expand range at the start
                return new Range(startLineNumber, startColumn - 1, endLineNumber, endColumn);
            }
            // only expand range at the end
            return new Range(startLineNumber, startColumn, endLineNumber, endColumn + 1);
        }
    }
    modifyPosition(rawPosition, offset) {
        this._assertNotDisposed();
        let candidate = this.getOffsetAt(rawPosition) + offset;
        return this.getPositionAt(Math.min(this._buffer.getLength(), Math.max(0, candidate)));
    }
    getFullModelRange() {
        this._assertNotDisposed();
        const lineCount = this.getLineCount();
        return new Range(1, 1, lineCount, this.getLineMaxColumn(lineCount));
    }
    findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount) {
        return this._buffer.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
    }
    findMatches(searchString, rawSearchScope, isRegex, matchCase, wordSeparators, captureMatches, limitResultCount = LIMIT_FIND_COUNT$1) {
        this._assertNotDisposed();
        let searchRanges = null;
        if (rawSearchScope !== null) {
            if (!Array.isArray(rawSearchScope)) {
                rawSearchScope = [rawSearchScope];
            }
            if (rawSearchScope.every((searchScope) => Range.isIRange(searchScope))) {
                searchRanges = rawSearchScope.map((searchScope) => this.validateRange(searchScope));
            }
        }
        if (searchRanges === null) {
            searchRanges = [this.getFullModelRange()];
        }
        searchRanges = searchRanges.sort((d1, d2) => d1.startLineNumber - d2.startLineNumber || d1.startColumn - d2.startColumn);
        const uniqueSearchRanges = [];
        uniqueSearchRanges.push(searchRanges.reduce((prev, curr) => {
            if (Range.areIntersecting(prev, curr)) {
                return prev.plusRange(curr);
            }
            uniqueSearchRanges.push(prev);
            return curr;
        }));
        let matchMapper;
        if (!isRegex && searchString.indexOf('\n') < 0) {
            // not regex, not multi line
            const searchParams = new SearchParams(searchString, isRegex, matchCase, wordSeparators);
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return [];
            }
            matchMapper = (searchRange) => this.findMatchesLineByLine(searchRange, searchData, captureMatches, limitResultCount);
        }
        else {
            matchMapper = (searchRange) => TextModelSearch.findMatches(this, new SearchParams(searchString, isRegex, matchCase, wordSeparators), searchRange, captureMatches, limitResultCount);
        }
        return uniqueSearchRanges.map(matchMapper).reduce((arr, matches) => arr.concat(matches), []);
    }
    findNextMatch(searchString, rawSearchStart, isRegex, matchCase, wordSeparators, captureMatches) {
        this._assertNotDisposed();
        const searchStart = this.validatePosition(rawSearchStart);
        if (!isRegex && searchString.indexOf('\n') < 0) {
            const searchParams = new SearchParams(searchString, isRegex, matchCase, wordSeparators);
            const searchData = searchParams.parseSearchRequest();
            if (!searchData) {
                return null;
            }
            const lineCount = this.getLineCount();
            let searchRange = new Range(searchStart.lineNumber, searchStart.column, lineCount, this.getLineMaxColumn(lineCount));
            let ret = this.findMatchesLineByLine(searchRange, searchData, captureMatches, 1);
            TextModelSearch.findNextMatch(this, new SearchParams(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
            if (ret.length > 0) {
                return ret[0];
            }
            searchRange = new Range(1, 1, searchStart.lineNumber, this.getLineMaxColumn(searchStart.lineNumber));
            ret = this.findMatchesLineByLine(searchRange, searchData, captureMatches, 1);
            if (ret.length > 0) {
                return ret[0];
            }
            return null;
        }
        return TextModelSearch.findNextMatch(this, new SearchParams(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
    }
    findPreviousMatch(searchString, rawSearchStart, isRegex, matchCase, wordSeparators, captureMatches) {
        this._assertNotDisposed();
        const searchStart = this.validatePosition(rawSearchStart);
        return TextModelSearch.findPreviousMatch(this, new SearchParams(searchString, isRegex, matchCase, wordSeparators), searchStart, captureMatches);
    }
    //#endregion
    //#region Editing
    pushStackElement() {
        this._commandManager.pushStackElement();
    }
    popStackElement() {
        this._commandManager.popStackElement();
    }
    pushEOL(eol) {
        const currentEOL = (this.getEOL() === '\n' ? 0 /* LF */ : 1 /* CRLF */);
        if (currentEOL === eol) {
            return;
        }
        try {
            this._onDidChangeDecorations.beginDeferredEmit();
            this._eventEmitter.beginDeferredEmit();
            if (this._initialUndoRedoSnapshot === null) {
                this._initialUndoRedoSnapshot = this._undoRedoService.createSnapshot(this.uri);
            }
            this._commandManager.pushEOL(eol);
        }
        finally {
            this._eventEmitter.endDeferredEmit();
            this._onDidChangeDecorations.endDeferredEmit();
        }
    }
    _validateEditOperation(rawOperation) {
        if (rawOperation instanceof ValidAnnotatedEditOperation) {
            return rawOperation;
        }
        return new ValidAnnotatedEditOperation(rawOperation.identifier || null, this.validateRange(rawOperation.range), rawOperation.text, rawOperation.forceMoveMarkers || false, rawOperation.isAutoWhitespaceEdit || false, rawOperation._isTracked || false);
    }
    _validateEditOperations(rawOperations) {
        const result = [];
        for (let i = 0, len = rawOperations.length; i < len; i++) {
            result[i] = this._validateEditOperation(rawOperations[i]);
        }
        return result;
    }
    pushEditOperations(beforeCursorState, editOperations, cursorStateComputer) {
        try {
            this._onDidChangeDecorations.beginDeferredEmit();
            this._eventEmitter.beginDeferredEmit();
            return this._pushEditOperations(beforeCursorState, this._validateEditOperations(editOperations), cursorStateComputer);
        }
        finally {
            this._eventEmitter.endDeferredEmit();
            this._onDidChangeDecorations.endDeferredEmit();
        }
    }
    _pushEditOperations(beforeCursorState, editOperations, cursorStateComputer) {
        if (this._options.trimAutoWhitespace && this._trimAutoWhitespaceLines) {
            // Go through each saved line number and insert a trim whitespace edit
            // if it is safe to do so (no conflicts with other edits).
            let incomingEdits = editOperations.map((op) => {
                return {
                    range: this.validateRange(op.range),
                    text: op.text
                };
            });
            // Sometimes, auto-formatters change ranges automatically which can cause undesired auto whitespace trimming near the cursor
            // We'll use the following heuristic: if the edits occur near the cursor, then it's ok to trim auto whitespace
            let editsAreNearCursors = true;
            if (beforeCursorState) {
                for (let i = 0, len = beforeCursorState.length; i < len; i++) {
                    let sel = beforeCursorState[i];
                    let foundEditNearSel = false;
                    for (let j = 0, lenJ = incomingEdits.length; j < lenJ; j++) {
                        let editRange = incomingEdits[j].range;
                        let selIsAbove = editRange.startLineNumber > sel.endLineNumber;
                        let selIsBelow = sel.startLineNumber > editRange.endLineNumber;
                        if (!selIsAbove && !selIsBelow) {
                            foundEditNearSel = true;
                            break;
                        }
                    }
                    if (!foundEditNearSel) {
                        editsAreNearCursors = false;
                        break;
                    }
                }
            }
            if (editsAreNearCursors) {
                for (let i = 0, len = this._trimAutoWhitespaceLines.length; i < len; i++) {
                    let trimLineNumber = this._trimAutoWhitespaceLines[i];
                    let maxLineColumn = this.getLineMaxColumn(trimLineNumber);
                    let allowTrimLine = true;
                    for (let j = 0, lenJ = incomingEdits.length; j < lenJ; j++) {
                        let editRange = incomingEdits[j].range;
                        let editText = incomingEdits[j].text;
                        if (trimLineNumber < editRange.startLineNumber || trimLineNumber > editRange.endLineNumber) {
                            // `trimLine` is completely outside this edit
                            continue;
                        }
                        // At this point:
                        //   editRange.startLineNumber <= trimLine <= editRange.endLineNumber
                        if (trimLineNumber === editRange.startLineNumber && editRange.startColumn === maxLineColumn
                            && editRange.isEmpty() && editText && editText.length > 0 && editText.charAt(0) === '\n') {
                            // This edit inserts a new line (and maybe other text) after `trimLine`
                            continue;
                        }
                        if (trimLineNumber === editRange.startLineNumber && editRange.startColumn === 1
                            && editRange.isEmpty() && editText && editText.length > 0 && editText.charAt(editText.length - 1) === '\n') {
                            // This edit inserts a new line (and maybe other text) before `trimLine`
                            continue;
                        }
                        // Looks like we can't trim this line as it would interfere with an incoming edit
                        allowTrimLine = false;
                        break;
                    }
                    if (allowTrimLine) {
                        const trimRange = new Range(trimLineNumber, 1, trimLineNumber, maxLineColumn);
                        editOperations.push(new ValidAnnotatedEditOperation(null, trimRange, null, false, false, false));
                    }
                }
            }
            this._trimAutoWhitespaceLines = null;
        }
        if (this._initialUndoRedoSnapshot === null) {
            this._initialUndoRedoSnapshot = this._undoRedoService.createSnapshot(this.uri);
        }
        return this._commandManager.pushEditOperation(beforeCursorState, editOperations, cursorStateComputer);
    }
    _applyUndo(changes, eol, resultingAlternativeVersionId, resultingSelection) {
        const edits = changes.map((change) => {
            const rangeStart = this.getPositionAt(change.newPosition);
            const rangeEnd = this.getPositionAt(change.newEnd);
            return {
                range: new Range(rangeStart.lineNumber, rangeStart.column, rangeEnd.lineNumber, rangeEnd.column),
                text: change.oldText
            };
        });
        this._applyUndoRedoEdits(edits, eol, true, false, resultingAlternativeVersionId, resultingSelection);
    }
    _applyRedo(changes, eol, resultingAlternativeVersionId, resultingSelection) {
        const edits = changes.map((change) => {
            const rangeStart = this.getPositionAt(change.oldPosition);
            const rangeEnd = this.getPositionAt(change.oldEnd);
            return {
                range: new Range(rangeStart.lineNumber, rangeStart.column, rangeEnd.lineNumber, rangeEnd.column),
                text: change.newText
            };
        });
        this._applyUndoRedoEdits(edits, eol, false, true, resultingAlternativeVersionId, resultingSelection);
    }
    _applyUndoRedoEdits(edits, eol, isUndoing, isRedoing, resultingAlternativeVersionId, resultingSelection) {
        try {
            this._onDidChangeDecorations.beginDeferredEmit();
            this._eventEmitter.beginDeferredEmit();
            this._isUndoing = isUndoing;
            this._isRedoing = isRedoing;
            this.applyEdits(edits, false);
            this.setEOL(eol);
            this._overwriteAlternativeVersionId(resultingAlternativeVersionId);
        }
        finally {
            this._isUndoing = false;
            this._isRedoing = false;
            this._eventEmitter.endDeferredEmit(resultingSelection);
            this._onDidChangeDecorations.endDeferredEmit();
        }
    }
    applyEdits(rawOperations, computeUndoEdits = false) {
        try {
            this._onDidChangeDecorations.beginDeferredEmit();
            this._eventEmitter.beginDeferredEmit();
            const operations = this._validateEditOperations(rawOperations);
            return this._doApplyEdits(operations, computeUndoEdits);
        }
        finally {
            this._eventEmitter.endDeferredEmit();
            this._onDidChangeDecorations.endDeferredEmit();
        }
    }
    _doApplyEdits(rawOperations, computeUndoEdits) {
        const oldLineCount = this._buffer.getLineCount();
        const result = this._buffer.applyEdits(rawOperations, this._options.trimAutoWhitespace, computeUndoEdits);
        const newLineCount = this._buffer.getLineCount();
        const contentChanges = result.changes;
        this._trimAutoWhitespaceLines = result.trimAutoWhitespaceLineNumbers;
        if (contentChanges.length !== 0) {
            let rawContentChanges = [];
            let lineCount = oldLineCount;
            for (let i = 0, len = contentChanges.length; i < len; i++) {
                const change = contentChanges[i];
                const [eolCount, firstLineLength, lastLineLength] = countEOL(change.text);
                this._tokens.acceptEdit(change.range, eolCount, firstLineLength);
                this._tokens2.acceptEdit(change.range, eolCount, firstLineLength, lastLineLength, change.text.length > 0 ? change.text.charCodeAt(0) : 0 /* Null */);
                this._onDidChangeDecorations.fire();
                this._decorationsTree.acceptReplace(change.rangeOffset, change.rangeLength, change.text.length, change.forceMoveMarkers);
                const startLineNumber = change.range.startLineNumber;
                const endLineNumber = change.range.endLineNumber;
                const deletingLinesCnt = endLineNumber - startLineNumber;
                const insertingLinesCnt = eolCount;
                const editingLinesCnt = Math.min(deletingLinesCnt, insertingLinesCnt);
                const changeLineCountDelta = (insertingLinesCnt - deletingLinesCnt);
                for (let j = editingLinesCnt; j >= 0; j--) {
                    const editLineNumber = startLineNumber + j;
                    const currentEditLineNumber = newLineCount - lineCount - changeLineCountDelta + editLineNumber;
                    rawContentChanges.push(new ModelRawLineChanged(editLineNumber, this.getLineContent(currentEditLineNumber)));
                }
                if (editingLinesCnt < deletingLinesCnt) {
                    // Must delete some lines
                    const spliceStartLineNumber = startLineNumber + editingLinesCnt;
                    rawContentChanges.push(new ModelRawLinesDeleted(spliceStartLineNumber + 1, endLineNumber));
                }
                if (editingLinesCnt < insertingLinesCnt) {
                    // Must insert some lines
                    const spliceLineNumber = startLineNumber + editingLinesCnt;
                    const cnt = insertingLinesCnt - editingLinesCnt;
                    const fromLineNumber = newLineCount - lineCount - cnt + spliceLineNumber + 1;
                    let newLines = [];
                    for (let i = 0; i < cnt; i++) {
                        let lineNumber = fromLineNumber + i;
                        newLines[lineNumber - fromLineNumber] = this.getLineContent(lineNumber);
                    }
                    rawContentChanges.push(new ModelRawLinesInserted(spliceLineNumber + 1, startLineNumber + insertingLinesCnt, newLines));
                }
                lineCount += changeLineCountDelta;
            }
            this._increaseVersionId();
            this._emitContentChangedEvent(new ModelRawContentChangedEvent(rawContentChanges, this.getVersionId(), this._isUndoing, this._isRedoing), {
                changes: contentChanges,
                eol: this._buffer.getEOL(),
                versionId: this.getVersionId(),
                isUndoing: this._isUndoing,
                isRedoing: this._isRedoing,
                isFlush: false
            });
        }
        return (result.reverseEdits === null ? undefined : result.reverseEdits);
    }
    undo() {
        return this._undoRedoService.undo(this.uri);
    }
    canUndo() {
        return this._undoRedoService.canUndo(this.uri);
    }
    redo() {
        return this._undoRedoService.redo(this.uri);
    }
    canRedo() {
        return this._undoRedoService.canRedo(this.uri);
    }
    //#endregion
    //#region Decorations
    changeDecorations(callback, ownerId = 0) {
        this._assertNotDisposed();
        try {
            this._onDidChangeDecorations.beginDeferredEmit();
            return this._changeDecorations(ownerId, callback);
        }
        finally {
            this._onDidChangeDecorations.endDeferredEmit();
        }
    }
    _changeDecorations(ownerId, callback) {
        let changeAccessor = {
            addDecoration: (range, options) => {
                return this._deltaDecorationsImpl(ownerId, [], [{ range: range, options: options }])[0];
            },
            changeDecoration: (id, newRange) => {
                this._changeDecorationImpl(id, newRange);
            },
            changeDecorationOptions: (id, options) => {
                this._changeDecorationOptionsImpl(id, _normalizeOptions(options));
            },
            removeDecoration: (id) => {
                this._deltaDecorationsImpl(ownerId, [id], []);
            },
            deltaDecorations: (oldDecorations, newDecorations) => {
                if (oldDecorations.length === 0 && newDecorations.length === 0) {
                    // nothing to do
                    return [];
                }
                return this._deltaDecorationsImpl(ownerId, oldDecorations, newDecorations);
            }
        };
        let result = null;
        try {
            result = callback(changeAccessor);
        }
        catch (e) {
            onUnexpectedError(e);
        }
        // Invalidate change accessor
        changeAccessor.addDecoration = invalidFunc;
        changeAccessor.changeDecoration = invalidFunc;
        changeAccessor.changeDecorationOptions = invalidFunc;
        changeAccessor.removeDecoration = invalidFunc;
        changeAccessor.deltaDecorations = invalidFunc;
        return result;
    }
    deltaDecorations(oldDecorations, newDecorations, ownerId = 0) {
        this._assertNotDisposed();
        if (!oldDecorations) {
            oldDecorations = [];
        }
        if (oldDecorations.length === 0 && newDecorations.length === 0) {
            // nothing to do
            return [];
        }
        try {
            this._onDidChangeDecorations.beginDeferredEmit();
            return this._deltaDecorationsImpl(ownerId, oldDecorations, newDecorations);
        }
        finally {
            this._onDidChangeDecorations.endDeferredEmit();
        }
    }
    _getTrackedRange(id) {
        return this.getDecorationRange(id);
    }
    _setTrackedRange(id, newRange, newStickiness) {
        const node = (id ? this._decorations[id] : null);
        if (!node) {
            if (!newRange) {
                // node doesn't exist, the request is to delete => nothing to do
                return null;
            }
            // node doesn't exist, the request is to set => add the tracked range
            return this._deltaDecorationsImpl(0, [], [{ range: newRange, options: TRACKED_RANGE_OPTIONS[newStickiness] }])[0];
        }
        if (!newRange) {
            // node exists, the request is to delete => delete node
            this._decorationsTree.delete(node);
            delete this._decorations[node.id];
            return null;
        }
        // node exists, the request is to set => change the tracked range and its options
        const range = this._validateRangeRelaxedNoAllocations(newRange);
        const startOffset = this._buffer.getOffsetAt(range.startLineNumber, range.startColumn);
        const endOffset = this._buffer.getOffsetAt(range.endLineNumber, range.endColumn);
        this._decorationsTree.delete(node);
        node.reset(this.getVersionId(), startOffset, endOffset, range);
        node.setOptions(TRACKED_RANGE_OPTIONS[newStickiness]);
        this._decorationsTree.insert(node);
        return node.id;
    }
    removeAllDecorationsWithOwnerId(ownerId) {
        if (this._isDisposed) {
            return;
        }
        const nodes = this._decorationsTree.collectNodesFromOwner(ownerId);
        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            this._decorationsTree.delete(node);
            delete this._decorations[node.id];
        }
    }
    getDecorationOptions(decorationId) {
        const node = this._decorations[decorationId];
        if (!node) {
            return null;
        }
        return node.options;
    }
    getDecorationRange(decorationId) {
        const node = this._decorations[decorationId];
        if (!node) {
            return null;
        }
        const versionId = this.getVersionId();
        if (node.cachedVersionId !== versionId) {
            this._decorationsTree.resolveNode(node, versionId);
        }
        if (node.range === null) {
            node.range = this._getRangeAt(node.cachedAbsoluteStart, node.cachedAbsoluteEnd);
        }
        return node.range;
    }
    getLineDecorations(lineNumber, ownerId = 0, filterOutValidation = false) {
        if (lineNumber < 1 || lineNumber > this.getLineCount()) {
            return [];
        }
        return this.getLinesDecorations(lineNumber, lineNumber, ownerId, filterOutValidation);
    }
    getLinesDecorations(_startLineNumber, _endLineNumber, ownerId = 0, filterOutValidation = false) {
        let lineCount = this.getLineCount();
        let startLineNumber = Math.min(lineCount, Math.max(1, _startLineNumber));
        let endLineNumber = Math.min(lineCount, Math.max(1, _endLineNumber));
        let endColumn = this.getLineMaxColumn(endLineNumber);
        return this._getDecorationsInRange(new Range(startLineNumber, 1, endLineNumber, endColumn), ownerId, filterOutValidation);
    }
    getDecorationsInRange(range, ownerId = 0, filterOutValidation = false) {
        let validatedRange = this.validateRange(range);
        return this._getDecorationsInRange(validatedRange, ownerId, filterOutValidation);
    }
    getOverviewRulerDecorations(ownerId = 0, filterOutValidation = false) {
        const versionId = this.getVersionId();
        const result = this._decorationsTree.search(ownerId, filterOutValidation, true, versionId);
        return this._ensureNodesHaveRanges(result);
    }
    getAllDecorations(ownerId = 0, filterOutValidation = false) {
        const versionId = this.getVersionId();
        const result = this._decorationsTree.search(ownerId, filterOutValidation, false, versionId);
        return this._ensureNodesHaveRanges(result);
    }
    _getDecorationsInRange(filterRange, filterOwnerId, filterOutValidation) {
        const startOffset = this._buffer.getOffsetAt(filterRange.startLineNumber, filterRange.startColumn);
        const endOffset = this._buffer.getOffsetAt(filterRange.endLineNumber, filterRange.endColumn);
        const versionId = this.getVersionId();
        const result = this._decorationsTree.intervalSearch(startOffset, endOffset, filterOwnerId, filterOutValidation, versionId);
        return this._ensureNodesHaveRanges(result);
    }
    _ensureNodesHaveRanges(nodes) {
        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            if (node.range === null) {
                node.range = this._getRangeAt(node.cachedAbsoluteStart, node.cachedAbsoluteEnd);
            }
        }
        return nodes;
    }
    _getRangeAt(start, end) {
        return this._buffer.getRangeAt(start, end - start);
    }
    _changeDecorationImpl(decorationId, _range) {
        const node = this._decorations[decorationId];
        if (!node) {
            return;
        }
        const range = this._validateRangeRelaxedNoAllocations(_range);
        const startOffset = this._buffer.getOffsetAt(range.startLineNumber, range.startColumn);
        const endOffset = this._buffer.getOffsetAt(range.endLineNumber, range.endColumn);
        this._decorationsTree.delete(node);
        node.reset(this.getVersionId(), startOffset, endOffset, range);
        this._decorationsTree.insert(node);
        this._onDidChangeDecorations.checkAffectedAndFire(node.options);
    }
    _changeDecorationOptionsImpl(decorationId, options) {
        const node = this._decorations[decorationId];
        if (!node) {
            return;
        }
        const nodeWasInOverviewRuler = (node.options.overviewRuler && node.options.overviewRuler.color ? true : false);
        const nodeIsInOverviewRuler = (options.overviewRuler && options.overviewRuler.color ? true : false);
        this._onDidChangeDecorations.checkAffectedAndFire(node.options);
        this._onDidChangeDecorations.checkAffectedAndFire(options);
        if (nodeWasInOverviewRuler !== nodeIsInOverviewRuler) {
            // Delete + Insert due to an overview ruler status change
            this._decorationsTree.delete(node);
            node.setOptions(options);
            this._decorationsTree.insert(node);
        }
        else {
            node.setOptions(options);
        }
    }
    _deltaDecorationsImpl(ownerId, oldDecorationsIds, newDecorations) {
        const versionId = this.getVersionId();
        const oldDecorationsLen = oldDecorationsIds.length;
        let oldDecorationIndex = 0;
        const newDecorationsLen = newDecorations.length;
        let newDecorationIndex = 0;
        let result = new Array(newDecorationsLen);
        while (oldDecorationIndex < oldDecorationsLen || newDecorationIndex < newDecorationsLen) {
            let node = null;
            if (oldDecorationIndex < oldDecorationsLen) {
                // (1) get ourselves an old node
                do {
                    node = this._decorations[oldDecorationsIds[oldDecorationIndex++]];
                } while (!node && oldDecorationIndex < oldDecorationsLen);
                // (2) remove the node from the tree (if it exists)
                if (node) {
                    this._decorationsTree.delete(node);
                    this._onDidChangeDecorations.checkAffectedAndFire(node.options);
                }
            }
            if (newDecorationIndex < newDecorationsLen) {
                // (3) create a new node if necessary
                if (!node) {
                    const internalDecorationId = (++this._lastDecorationId);
                    const decorationId = `${this._instanceId};${internalDecorationId}`;
                    node = new IntervalNode(decorationId, 0, 0);
                    this._decorations[decorationId] = node;
                }
                // (4) initialize node
                const newDecoration = newDecorations[newDecorationIndex];
                const range = this._validateRangeRelaxedNoAllocations(newDecoration.range);
                const options = _normalizeOptions(newDecoration.options);
                const startOffset = this._buffer.getOffsetAt(range.startLineNumber, range.startColumn);
                const endOffset = this._buffer.getOffsetAt(range.endLineNumber, range.endColumn);
                node.ownerId = ownerId;
                node.reset(versionId, startOffset, endOffset, range);
                node.setOptions(options);
                this._onDidChangeDecorations.checkAffectedAndFire(options);
                this._decorationsTree.insert(node);
                result[newDecorationIndex] = node.id;
                newDecorationIndex++;
            }
            else {
                if (node) {
                    delete this._decorations[node.id];
                }
            }
        }
        return result;
    }
    setTokens(tokens) {
        if (tokens.length === 0) {
            return;
        }
        let ranges = [];
        for (let i = 0, len = tokens.length; i < len; i++) {
            const element = tokens[i];
            let minChangedLineNumber = 0;
            let maxChangedLineNumber = 0;
            let hasChange = false;
            for (let j = 0, lenJ = element.tokens.length; j < lenJ; j++) {
                const lineNumber = element.startLineNumber + j;
                if (hasChange) {
                    this._tokens.setTokens(this._languageIdentifier.id, lineNumber - 1, this._buffer.getLineLength(lineNumber), element.tokens[j], false);
                    maxChangedLineNumber = lineNumber;
                }
                else {
                    const lineHasChange = this._tokens.setTokens(this._languageIdentifier.id, lineNumber - 1, this._buffer.getLineLength(lineNumber), element.tokens[j], true);
                    if (lineHasChange) {
                        hasChange = true;
                        minChangedLineNumber = lineNumber;
                        maxChangedLineNumber = lineNumber;
                    }
                }
            }
            if (hasChange) {
                ranges.push({ fromLineNumber: minChangedLineNumber, toLineNumber: maxChangedLineNumber });
            }
        }
        if (ranges.length > 0) {
            this._emitModelTokensChangedEvent({
                tokenizationSupportChanged: false,
                semanticTokensApplied: false,
                ranges: ranges
            });
        }
    }
    setSemanticTokens(tokens, isComplete) {
        this._tokens2.set(tokens, isComplete);
        this._emitModelTokensChangedEvent({
            tokenizationSupportChanged: false,
            semanticTokensApplied: tokens !== null,
            ranges: [{ fromLineNumber: 1, toLineNumber: this.getLineCount() }]
        });
    }
    hasCompleteSemanticTokens() {
        return this._tokens2.isComplete();
    }
    hasSomeSemanticTokens() {
        return !this._tokens2.isEmpty();
    }
    setPartialSemanticTokens(range, tokens) {
        if (this.hasCompleteSemanticTokens()) {
            return;
        }
        const changedRange = this._tokens2.setPartial(range, tokens);
        this._emitModelTokensChangedEvent({
            tokenizationSupportChanged: false,
            semanticTokensApplied: true,
            ranges: [{ fromLineNumber: changedRange.startLineNumber, toLineNumber: changedRange.endLineNumber }]
        });
    }
    tokenizeViewport(startLineNumber, endLineNumber) {
        startLineNumber = Math.max(1, startLineNumber);
        endLineNumber = Math.min(this._buffer.getLineCount(), endLineNumber);
        this._tokenization.tokenizeViewport(startLineNumber, endLineNumber);
    }
    clearTokens() {
        this._tokens.flush();
        this._emitModelTokensChangedEvent({
            tokenizationSupportChanged: true,
            semanticTokensApplied: false,
            ranges: [{
                    fromLineNumber: 1,
                    toLineNumber: this._buffer.getLineCount()
                }]
        });
    }
    _emitModelTokensChangedEvent(e) {
        if (!this._isDisposing) {
            this._onDidChangeTokens.fire(e);
        }
    }
    resetTokenization() {
        this._tokenization.reset();
    }
    forceTokenization(lineNumber) {
        if (lineNumber < 1 || lineNumber > this.getLineCount()) {
            throw new Error('Illegal value for lineNumber');
        }
        this._tokenization.forceTokenization(lineNumber);
    }
    isCheapToTokenize(lineNumber) {
        return this._tokenization.isCheapToTokenize(lineNumber);
    }
    tokenizeIfCheap(lineNumber) {
        if (this.isCheapToTokenize(lineNumber)) {
            this.forceTokenization(lineNumber);
        }
    }
    getLineTokens(lineNumber) {
        if (lineNumber < 1 || lineNumber > this.getLineCount()) {
            throw new Error('Illegal value for lineNumber');
        }
        return this._getLineTokens(lineNumber);
    }
    _getLineTokens(lineNumber) {
        const lineText = this.getLineContent(lineNumber);
        const syntacticTokens = this._tokens.getTokens(this._languageIdentifier.id, lineNumber - 1, lineText);
        return this._tokens2.addSemanticTokens(lineNumber, syntacticTokens);
    }
    getLanguageIdentifier() {
        return this._languageIdentifier;
    }
    getModeId() {
        return this._languageIdentifier.language;
    }
    setMode(languageIdentifier) {
        if (this._languageIdentifier.id === languageIdentifier.id) {
            // There's nothing to do
            return;
        }
        let e = {
            oldLanguage: this._languageIdentifier.language,
            newLanguage: languageIdentifier.language
        };
        this._languageIdentifier = languageIdentifier;
        this._onDidChangeLanguage.fire(e);
        this._onDidChangeLanguageConfiguration.fire({});
    }
    getLanguageIdAtPosition(lineNumber, column) {
        const position = this.validatePosition(new Position(lineNumber, column));
        const lineTokens = this.getLineTokens(position.lineNumber);
        return lineTokens.getLanguageId(lineTokens.findTokenIndexAtOffset(position.column - 1));
    }
    // Having tokens allows implementing additional helper methods
    getWordAtPosition(_position) {
        this._assertNotDisposed();
        const position = this.validatePosition(_position);
        const lineContent = this.getLineContent(position.lineNumber);
        const lineTokens = this._getLineTokens(position.lineNumber);
        const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
        // (1). First try checking right biased word
        const [rbStartOffset, rbEndOffset] = TextModel._findLanguageBoundaries(lineTokens, tokenIndex);
        const rightBiasedWord = getWordAtText(position.column, LanguageConfigurationRegistry.getWordDefinition(lineTokens.getLanguageId(tokenIndex)), lineContent.substring(rbStartOffset, rbEndOffset), rbStartOffset);
        // Make sure the result touches the original passed in position
        if (rightBiasedWord && rightBiasedWord.startColumn <= _position.column && _position.column <= rightBiasedWord.endColumn) {
            return rightBiasedWord;
        }
        // (2). Else, if we were at a language boundary, check the left biased word
        if (tokenIndex > 0 && rbStartOffset === position.column - 1) {
            // edge case, where `position` sits between two tokens belonging to two different languages
            const [lbStartOffset, lbEndOffset] = TextModel._findLanguageBoundaries(lineTokens, tokenIndex - 1);
            const leftBiasedWord = getWordAtText(position.column, LanguageConfigurationRegistry.getWordDefinition(lineTokens.getLanguageId(tokenIndex - 1)), lineContent.substring(lbStartOffset, lbEndOffset), lbStartOffset);
            // Make sure the result touches the original passed in position
            if (leftBiasedWord && leftBiasedWord.startColumn <= _position.column && _position.column <= leftBiasedWord.endColumn) {
                return leftBiasedWord;
            }
        }
        return null;
    }
    static _findLanguageBoundaries(lineTokens, tokenIndex) {
        const languageId = lineTokens.getLanguageId(tokenIndex);
        // go left until a different language is hit
        let startOffset = 0;
        for (let i = tokenIndex; i >= 0 && lineTokens.getLanguageId(i) === languageId; i--) {
            startOffset = lineTokens.getStartOffset(i);
        }
        // go right until a different language is hit
        let endOffset = lineTokens.getLineContent().length;
        for (let i = tokenIndex, tokenCount = lineTokens.getCount(); i < tokenCount && lineTokens.getLanguageId(i) === languageId; i++) {
            endOffset = lineTokens.getEndOffset(i);
        }
        return [startOffset, endOffset];
    }
    getWordUntilPosition(position) {
        const wordAtPosition = this.getWordAtPosition(position);
        if (!wordAtPosition) {
            return {
                word: '',
                startColumn: position.column,
                endColumn: position.column
            };
        }
        return {
            word: wordAtPosition.word.substr(0, position.column - wordAtPosition.startColumn),
            startColumn: wordAtPosition.startColumn,
            endColumn: position.column
        };
    }
    findMatchingBracketUp(_bracket, _position) {
        let bracket = _bracket.toLowerCase();
        let position = this.validatePosition(_position);
        let lineTokens = this._getLineTokens(position.lineNumber);
        let languageId = lineTokens.getLanguageId(lineTokens.findTokenIndexAtOffset(position.column - 1));
        let bracketsSupport = LanguageConfigurationRegistry.getBracketsSupport(languageId);
        if (!bracketsSupport) {
            return null;
        }
        let data = bracketsSupport.textIsBracket[bracket];
        if (!data) {
            return null;
        }
        return stripBracketSearchCanceled(this._findMatchingBracketUp(data, position, null));
    }
    matchBracket(position) {
        return this._matchBracket(this.validatePosition(position));
    }
    _establishBracketSearchOffsets(position, lineTokens, modeBrackets, tokenIndex) {
        const tokenCount = lineTokens.getCount();
        const currentLanguageId = lineTokens.getLanguageId(tokenIndex);
        // limit search to not go before `maxBracketLength`
        let searchStartOffset = Math.max(0, position.column - 1 - modeBrackets.maxBracketLength);
        for (let i = tokenIndex - 1; i >= 0; i--) {
            const tokenEndOffset = lineTokens.getEndOffset(i);
            if (tokenEndOffset <= searchStartOffset) {
                break;
            }
            if (ignoreBracketsInToken(lineTokens.getStandardTokenType(i)) || lineTokens.getLanguageId(i) !== currentLanguageId) {
                searchStartOffset = tokenEndOffset;
                break;
            }
        }
        // limit search to not go after `maxBracketLength`
        let searchEndOffset = Math.min(lineTokens.getLineContent().length, position.column - 1 + modeBrackets.maxBracketLength);
        for (let i = tokenIndex + 1; i < tokenCount; i++) {
            const tokenStartOffset = lineTokens.getStartOffset(i);
            if (tokenStartOffset >= searchEndOffset) {
                break;
            }
            if (ignoreBracketsInToken(lineTokens.getStandardTokenType(i)) || lineTokens.getLanguageId(i) !== currentLanguageId) {
                searchEndOffset = tokenStartOffset;
                break;
            }
        }
        return { searchStartOffset, searchEndOffset };
    }
    _matchBracket(position) {
        const lineNumber = position.lineNumber;
        const lineTokens = this._getLineTokens(lineNumber);
        const lineText = this._buffer.getLineContent(lineNumber);
        const tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
        if (tokenIndex < 0) {
            return null;
        }
        const currentModeBrackets = LanguageConfigurationRegistry.getBracketsSupport(lineTokens.getLanguageId(tokenIndex));
        // check that the token is not to be ignored
        if (currentModeBrackets && !ignoreBracketsInToken(lineTokens.getStandardTokenType(tokenIndex))) {
            let { searchStartOffset, searchEndOffset } = this._establishBracketSearchOffsets(position, lineTokens, currentModeBrackets, tokenIndex);
            // it might be the case that [currentTokenStart -> currentTokenEnd] contains multiple brackets
            // `bestResult` will contain the most right-side result
            let bestResult = null;
            while (true) {
                const foundBracket = BracketsUtils.findNextBracketInRange(currentModeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (!foundBracket) {
                    // there are no more brackets in this text
                    break;
                }
                // check that we didn't hit a bracket too far away from position
                if (foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
                    const foundBracketText = lineText.substring(foundBracket.startColumn - 1, foundBracket.endColumn - 1).toLowerCase();
                    const r = this._matchFoundBracket(foundBracket, currentModeBrackets.textIsBracket[foundBracketText], currentModeBrackets.textIsOpenBracket[foundBracketText], null);
                    if (r) {
                        if (r instanceof BracketSearchCanceled) {
                            return null;
                        }
                        bestResult = r;
                    }
                }
                searchStartOffset = foundBracket.endColumn - 1;
            }
            if (bestResult) {
                return bestResult;
            }
        }
        // If position is in between two tokens, try also looking in the previous token
        if (tokenIndex > 0 && lineTokens.getStartOffset(tokenIndex) === position.column - 1) {
            const prevTokenIndex = tokenIndex - 1;
            const prevModeBrackets = LanguageConfigurationRegistry.getBracketsSupport(lineTokens.getLanguageId(prevTokenIndex));
            // check that previous token is not to be ignored
            if (prevModeBrackets && !ignoreBracketsInToken(lineTokens.getStandardTokenType(prevTokenIndex))) {
                let { searchStartOffset, searchEndOffset } = this._establishBracketSearchOffsets(position, lineTokens, prevModeBrackets, prevTokenIndex);
                const foundBracket = BracketsUtils.findPrevBracketInRange(prevModeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                // check that we didn't hit a bracket too far away from position
                if (foundBracket && foundBracket.startColumn <= position.column && position.column <= foundBracket.endColumn) {
                    const foundBracketText = lineText.substring(foundBracket.startColumn - 1, foundBracket.endColumn - 1).toLowerCase();
                    const r = this._matchFoundBracket(foundBracket, prevModeBrackets.textIsBracket[foundBracketText], prevModeBrackets.textIsOpenBracket[foundBracketText], null);
                    if (r) {
                        if (r instanceof BracketSearchCanceled) {
                            return null;
                        }
                        return r;
                    }
                }
            }
        }
        return null;
    }
    _matchFoundBracket(foundBracket, data, isOpen, continueSearchPredicate) {
        if (!data) {
            return null;
        }
        const matched = (isOpen
            ? this._findMatchingBracketDown(data, foundBracket.getEndPosition(), continueSearchPredicate)
            : this._findMatchingBracketUp(data, foundBracket.getStartPosition(), continueSearchPredicate));
        if (!matched) {
            return null;
        }
        if (matched instanceof BracketSearchCanceled) {
            return matched;
        }
        return [foundBracket, matched];
    }
    _findMatchingBracketUp(bracket, position, continueSearchPredicate) {
        // console.log('_findMatchingBracketUp: ', 'bracket: ', JSON.stringify(bracket), 'startPosition: ', String(position));
        const languageId = bracket.languageIdentifier.id;
        const reversedBracketRegex = bracket.reversedRegex;
        let count = -1;
        let totalCallCount = 0;
        const searchPrevMatchingBracketInRange = (lineNumber, lineText, searchStartOffset, searchEndOffset) => {
            while (true) {
                if (continueSearchPredicate && (++totalCallCount) % 100 === 0 && !continueSearchPredicate()) {
                    return BracketSearchCanceled.INSTANCE;
                }
                const r = BracketsUtils.findPrevBracketInRange(reversedBracketRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (!r) {
                    break;
                }
                const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
                if (bracket.isOpen(hitText)) {
                    count++;
                }
                else if (bracket.isClose(hitText)) {
                    count--;
                }
                if (count === 0) {
                    return r;
                }
                searchEndOffset = r.startColumn - 1;
            }
            return null;
        };
        for (let lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
            const lineTokens = this._getLineTokens(lineNumber);
            const tokenCount = lineTokens.getCount();
            const lineText = this._buffer.getLineContent(lineNumber);
            let tokenIndex = tokenCount - 1;
            let searchStartOffset = lineText.length;
            let searchEndOffset = lineText.length;
            if (lineNumber === position.lineNumber) {
                tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                searchStartOffset = position.column - 1;
                searchEndOffset = position.column - 1;
            }
            let prevSearchInToken = true;
            for (; tokenIndex >= 0; tokenIndex--) {
                const searchInToken = (lineTokens.getLanguageId(tokenIndex) === languageId && !ignoreBracketsInToken(lineTokens.getStandardTokenType(tokenIndex)));
                if (searchInToken) {
                    // this token should be searched
                    if (prevSearchInToken) {
                        // the previous token should be searched, simply extend searchStartOffset
                        searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                    }
                    else {
                        // the previous token should not be searched
                        searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                        searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                    }
                }
                else {
                    // this token should not be searched
                    if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
                        const r = searchPrevMatchingBracketInRange(lineNumber, lineText, searchStartOffset, searchEndOffset);
                        if (r) {
                            return r;
                        }
                    }
                }
                prevSearchInToken = searchInToken;
            }
            if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
                const r = searchPrevMatchingBracketInRange(lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (r) {
                    return r;
                }
            }
        }
        return null;
    }
    _findMatchingBracketDown(bracket, position, continueSearchPredicate) {
        // console.log('_findMatchingBracketDown: ', 'bracket: ', JSON.stringify(bracket), 'startPosition: ', String(position));
        const languageId = bracket.languageIdentifier.id;
        const bracketRegex = bracket.forwardRegex;
        let count = 1;
        let totalCallCount = 0;
        const searchNextMatchingBracketInRange = (lineNumber, lineText, searchStartOffset, searchEndOffset) => {
            while (true) {
                if (continueSearchPredicate && (++totalCallCount) % 100 === 0 && !continueSearchPredicate()) {
                    return BracketSearchCanceled.INSTANCE;
                }
                const r = BracketsUtils.findNextBracketInRange(bracketRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (!r) {
                    break;
                }
                const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
                if (bracket.isOpen(hitText)) {
                    count++;
                }
                else if (bracket.isClose(hitText)) {
                    count--;
                }
                if (count === 0) {
                    return r;
                }
                searchStartOffset = r.endColumn - 1;
            }
            return null;
        };
        const lineCount = this.getLineCount();
        for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
            const lineTokens = this._getLineTokens(lineNumber);
            const tokenCount = lineTokens.getCount();
            const lineText = this._buffer.getLineContent(lineNumber);
            let tokenIndex = 0;
            let searchStartOffset = 0;
            let searchEndOffset = 0;
            if (lineNumber === position.lineNumber) {
                tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                searchStartOffset = position.column - 1;
                searchEndOffset = position.column - 1;
            }
            let prevSearchInToken = true;
            for (; tokenIndex < tokenCount; tokenIndex++) {
                const searchInToken = (lineTokens.getLanguageId(tokenIndex) === languageId && !ignoreBracketsInToken(lineTokens.getStandardTokenType(tokenIndex)));
                if (searchInToken) {
                    // this token should be searched
                    if (prevSearchInToken) {
                        // the previous token should be searched, simply extend searchEndOffset
                        searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                    }
                    else {
                        // the previous token should not be searched
                        searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                        searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                    }
                }
                else {
                    // this token should not be searched
                    if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
                        const r = searchNextMatchingBracketInRange(lineNumber, lineText, searchStartOffset, searchEndOffset);
                        if (r) {
                            return r;
                        }
                    }
                }
                prevSearchInToken = searchInToken;
            }
            if (prevSearchInToken && searchStartOffset !== searchEndOffset) {
                const r = searchNextMatchingBracketInRange(lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (r) {
                    return r;
                }
            }
        }
        return null;
    }
    findPrevBracket(_position) {
        const position = this.validatePosition(_position);
        let languageId = -1;
        let modeBrackets = null;
        for (let lineNumber = position.lineNumber; lineNumber >= 1; lineNumber--) {
            const lineTokens = this._getLineTokens(lineNumber);
            const tokenCount = lineTokens.getCount();
            const lineText = this._buffer.getLineContent(lineNumber);
            let tokenIndex = tokenCount - 1;
            let searchStartOffset = lineText.length;
            let searchEndOffset = lineText.length;
            if (lineNumber === position.lineNumber) {
                tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                searchStartOffset = position.column - 1;
                searchEndOffset = position.column - 1;
                const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                if (languageId !== tokenLanguageId) {
                    languageId = tokenLanguageId;
                    modeBrackets = LanguageConfigurationRegistry.getBracketsSupport(languageId);
                }
            }
            let prevSearchInToken = true;
            for (; tokenIndex >= 0; tokenIndex--) {
                const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                if (languageId !== tokenLanguageId) {
                    // language id change!
                    if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                        const r = BracketsUtils.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                        if (r) {
                            return this._toFoundBracket(modeBrackets, r);
                        }
                        prevSearchInToken = false;
                    }
                    languageId = tokenLanguageId;
                    modeBrackets = LanguageConfigurationRegistry.getBracketsSupport(languageId);
                }
                const searchInToken = (!!modeBrackets && !ignoreBracketsInToken(lineTokens.getStandardTokenType(tokenIndex)));
                if (searchInToken) {
                    // this token should be searched
                    if (prevSearchInToken) {
                        // the previous token should be searched, simply extend searchStartOffset
                        searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                    }
                    else {
                        // the previous token should not be searched
                        searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                        searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                    }
                }
                else {
                    // this token should not be searched
                    if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                        const r = BracketsUtils.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                        if (r) {
                            return this._toFoundBracket(modeBrackets, r);
                        }
                    }
                }
                prevSearchInToken = searchInToken;
            }
            if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                const r = BracketsUtils.findPrevBracketInRange(modeBrackets.reversedRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (r) {
                    return this._toFoundBracket(modeBrackets, r);
                }
            }
        }
        return null;
    }
    findNextBracket(_position) {
        const position = this.validatePosition(_position);
        const lineCount = this.getLineCount();
        let languageId = -1;
        let modeBrackets = null;
        for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
            const lineTokens = this._getLineTokens(lineNumber);
            const tokenCount = lineTokens.getCount();
            const lineText = this._buffer.getLineContent(lineNumber);
            let tokenIndex = 0;
            let searchStartOffset = 0;
            let searchEndOffset = 0;
            if (lineNumber === position.lineNumber) {
                tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                searchStartOffset = position.column - 1;
                searchEndOffset = position.column - 1;
                const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                if (languageId !== tokenLanguageId) {
                    languageId = tokenLanguageId;
                    modeBrackets = LanguageConfigurationRegistry.getBracketsSupport(languageId);
                }
            }
            let prevSearchInToken = true;
            for (; tokenIndex < tokenCount; tokenIndex++) {
                const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                if (languageId !== tokenLanguageId) {
                    // language id change!
                    if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                        const r = BracketsUtils.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                        if (r) {
                            return this._toFoundBracket(modeBrackets, r);
                        }
                        prevSearchInToken = false;
                    }
                    languageId = tokenLanguageId;
                    modeBrackets = LanguageConfigurationRegistry.getBracketsSupport(languageId);
                }
                const searchInToken = (!!modeBrackets && !ignoreBracketsInToken(lineTokens.getStandardTokenType(tokenIndex)));
                if (searchInToken) {
                    // this token should be searched
                    if (prevSearchInToken) {
                        // the previous token should be searched, simply extend searchEndOffset
                        searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                    }
                    else {
                        // the previous token should not be searched
                        searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                        searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                    }
                }
                else {
                    // this token should not be searched
                    if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                        const r = BracketsUtils.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                        if (r) {
                            return this._toFoundBracket(modeBrackets, r);
                        }
                    }
                }
                prevSearchInToken = searchInToken;
            }
            if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                const r = BracketsUtils.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (r) {
                    return this._toFoundBracket(modeBrackets, r);
                }
            }
        }
        return null;
    }
    findEnclosingBrackets(_position, maxDuration) {
        let continueSearchPredicate;
        if (typeof maxDuration === 'undefined') {
            continueSearchPredicate = null;
        }
        else {
            const startTime = Date.now();
            continueSearchPredicate = () => {
                return (Date.now() - startTime <= maxDuration);
            };
        }
        const position = this.validatePosition(_position);
        const lineCount = this.getLineCount();
        const savedCounts = new Map();
        let counts = [];
        const resetCounts = (languageId, modeBrackets) => {
            if (!savedCounts.has(languageId)) {
                let tmp = [];
                for (let i = 0, len = modeBrackets ? modeBrackets.brackets.length : 0; i < len; i++) {
                    tmp[i] = 0;
                }
                savedCounts.set(languageId, tmp);
            }
            counts = savedCounts.get(languageId);
        };
        let totalCallCount = 0;
        const searchInRange = (modeBrackets, lineNumber, lineText, searchStartOffset, searchEndOffset) => {
            while (true) {
                if (continueSearchPredicate && (++totalCallCount) % 100 === 0 && !continueSearchPredicate()) {
                    return BracketSearchCanceled.INSTANCE;
                }
                const r = BracketsUtils.findNextBracketInRange(modeBrackets.forwardRegex, lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (!r) {
                    break;
                }
                const hitText = lineText.substring(r.startColumn - 1, r.endColumn - 1).toLowerCase();
                const bracket = modeBrackets.textIsBracket[hitText];
                if (bracket) {
                    if (bracket.isOpen(hitText)) {
                        counts[bracket.index]++;
                    }
                    else if (bracket.isClose(hitText)) {
                        counts[bracket.index]--;
                    }
                    if (counts[bracket.index] === -1) {
                        return this._matchFoundBracket(r, bracket, false, continueSearchPredicate);
                    }
                }
                searchStartOffset = r.endColumn - 1;
            }
            return null;
        };
        let languageId = -1;
        let modeBrackets = null;
        for (let lineNumber = position.lineNumber; lineNumber <= lineCount; lineNumber++) {
            const lineTokens = this._getLineTokens(lineNumber);
            const tokenCount = lineTokens.getCount();
            const lineText = this._buffer.getLineContent(lineNumber);
            let tokenIndex = 0;
            let searchStartOffset = 0;
            let searchEndOffset = 0;
            if (lineNumber === position.lineNumber) {
                tokenIndex = lineTokens.findTokenIndexAtOffset(position.column - 1);
                searchStartOffset = position.column - 1;
                searchEndOffset = position.column - 1;
                const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                if (languageId !== tokenLanguageId) {
                    languageId = tokenLanguageId;
                    modeBrackets = LanguageConfigurationRegistry.getBracketsSupport(languageId);
                    resetCounts(languageId, modeBrackets);
                }
            }
            let prevSearchInToken = true;
            for (; tokenIndex < tokenCount; tokenIndex++) {
                const tokenLanguageId = lineTokens.getLanguageId(tokenIndex);
                if (languageId !== tokenLanguageId) {
                    // language id change!
                    if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                        const r = searchInRange(modeBrackets, lineNumber, lineText, searchStartOffset, searchEndOffset);
                        if (r) {
                            return stripBracketSearchCanceled(r);
                        }
                        prevSearchInToken = false;
                    }
                    languageId = tokenLanguageId;
                    modeBrackets = LanguageConfigurationRegistry.getBracketsSupport(languageId);
                    resetCounts(languageId, modeBrackets);
                }
                const searchInToken = (!!modeBrackets && !ignoreBracketsInToken(lineTokens.getStandardTokenType(tokenIndex)));
                if (searchInToken) {
                    // this token should be searched
                    if (prevSearchInToken) {
                        // the previous token should be searched, simply extend searchEndOffset
                        searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                    }
                    else {
                        // the previous token should not be searched
                        searchStartOffset = lineTokens.getStartOffset(tokenIndex);
                        searchEndOffset = lineTokens.getEndOffset(tokenIndex);
                    }
                }
                else {
                    // this token should not be searched
                    if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                        const r = searchInRange(modeBrackets, lineNumber, lineText, searchStartOffset, searchEndOffset);
                        if (r) {
                            return stripBracketSearchCanceled(r);
                        }
                    }
                }
                prevSearchInToken = searchInToken;
            }
            if (modeBrackets && prevSearchInToken && searchStartOffset !== searchEndOffset) {
                const r = searchInRange(modeBrackets, lineNumber, lineText, searchStartOffset, searchEndOffset);
                if (r) {
                    return stripBracketSearchCanceled(r);
                }
            }
        }
        return null;
    }
    _toFoundBracket(modeBrackets, r) {
        if (!r) {
            return null;
        }
        let text = this.getValueInRange(r);
        text = text.toLowerCase();
        let data = modeBrackets.textIsBracket[text];
        if (!data) {
            return null;
        }
        return {
            range: r,
            open: data.open,
            close: data.close,
            isOpen: modeBrackets.textIsOpenBracket[text]
        };
    }
    /**
     * Returns:
     *  - -1 => the line consists of whitespace
     *  - otherwise => the indent level is returned value
     */
    static computeIndentLevel(line, tabSize) {
        let indent = 0;
        let i = 0;
        let len = line.length;
        while (i < len) {
            let chCode = line.charCodeAt(i);
            if (chCode === 32 /* Space */) {
                indent++;
            }
            else if (chCode === 9 /* Tab */) {
                indent = indent - indent % tabSize + tabSize;
            }
            else {
                break;
            }
            i++;
        }
        if (i === len) {
            return -1; // line only consists of whitespace
        }
        return indent;
    }
    _computeIndentLevel(lineIndex) {
        return TextModel.computeIndentLevel(this._buffer.getLineContent(lineIndex + 1), this._options.tabSize);
    }
    getActiveIndentGuide(lineNumber, minLineNumber, maxLineNumber) {
        this._assertNotDisposed();
        const lineCount = this.getLineCount();
        if (lineNumber < 1 || lineNumber > lineCount) {
            throw new Error('Illegal value for lineNumber');
        }
        const foldingRules = LanguageConfigurationRegistry.getFoldingRules(this._languageIdentifier.id);
        const offSide = Boolean(foldingRules && foldingRules.offSide);
        let up_aboveContentLineIndex = -2; /* -2 is a marker for not having computed it */
        let up_aboveContentLineIndent = -1;
        let up_belowContentLineIndex = -2; /* -2 is a marker for not having computed it */
        let up_belowContentLineIndent = -1;
        const up_resolveIndents = (lineNumber) => {
            if (up_aboveContentLineIndex !== -1 && (up_aboveContentLineIndex === -2 || up_aboveContentLineIndex > lineNumber - 1)) {
                up_aboveContentLineIndex = -1;
                up_aboveContentLineIndent = -1;
                // must find previous line with content
                for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
                    let indent = this._computeIndentLevel(lineIndex);
                    if (indent >= 0) {
                        up_aboveContentLineIndex = lineIndex;
                        up_aboveContentLineIndent = indent;
                        break;
                    }
                }
            }
            if (up_belowContentLineIndex === -2) {
                up_belowContentLineIndex = -1;
                up_belowContentLineIndent = -1;
                // must find next line with content
                for (let lineIndex = lineNumber; lineIndex < lineCount; lineIndex++) {
                    let indent = this._computeIndentLevel(lineIndex);
                    if (indent >= 0) {
                        up_belowContentLineIndex = lineIndex;
                        up_belowContentLineIndent = indent;
                        break;
                    }
                }
            }
        };
        let down_aboveContentLineIndex = -2; /* -2 is a marker for not having computed it */
        let down_aboveContentLineIndent = -1;
        let down_belowContentLineIndex = -2; /* -2 is a marker for not having computed it */
        let down_belowContentLineIndent = -1;
        const down_resolveIndents = (lineNumber) => {
            if (down_aboveContentLineIndex === -2) {
                down_aboveContentLineIndex = -1;
                down_aboveContentLineIndent = -1;
                // must find previous line with content
                for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
                    let indent = this._computeIndentLevel(lineIndex);
                    if (indent >= 0) {
                        down_aboveContentLineIndex = lineIndex;
                        down_aboveContentLineIndent = indent;
                        break;
                    }
                }
            }
            if (down_belowContentLineIndex !== -1 && (down_belowContentLineIndex === -2 || down_belowContentLineIndex < lineNumber - 1)) {
                down_belowContentLineIndex = -1;
                down_belowContentLineIndent = -1;
                // must find next line with content
                for (let lineIndex = lineNumber; lineIndex < lineCount; lineIndex++) {
                    let indent = this._computeIndentLevel(lineIndex);
                    if (indent >= 0) {
                        down_belowContentLineIndex = lineIndex;
                        down_belowContentLineIndent = indent;
                        break;
                    }
                }
            }
        };
        let startLineNumber = 0;
        let goUp = true;
        let endLineNumber = 0;
        let goDown = true;
        let indent = 0;
        let initialIndent = 0;
        for (let distance = 0; goUp || goDown; distance++) {
            const upLineNumber = lineNumber - distance;
            const downLineNumber = lineNumber + distance;
            if (distance > 1 && (upLineNumber < 1 || upLineNumber < minLineNumber)) {
                goUp = false;
            }
            if (distance > 1 && (downLineNumber > lineCount || downLineNumber > maxLineNumber)) {
                goDown = false;
            }
            if (distance > 50000) {
                // stop processing
                goUp = false;
                goDown = false;
            }
            let upLineIndentLevel = -1;
            if (goUp) {
                // compute indent level going up
                const currentIndent = this._computeIndentLevel(upLineNumber - 1);
                if (currentIndent >= 0) {
                    // This line has content (besides whitespace)
                    // Use the line's indent
                    up_belowContentLineIndex = upLineNumber - 1;
                    up_belowContentLineIndent = currentIndent;
                    upLineIndentLevel = Math.ceil(currentIndent / this._options.indentSize);
                }
                else {
                    up_resolveIndents(upLineNumber);
                    upLineIndentLevel = this._getIndentLevelForWhitespaceLine(offSide, up_aboveContentLineIndent, up_belowContentLineIndent);
                }
            }
            let downLineIndentLevel = -1;
            if (goDown) {
                // compute indent level going down
                const currentIndent = this._computeIndentLevel(downLineNumber - 1);
                if (currentIndent >= 0) {
                    // This line has content (besides whitespace)
                    // Use the line's indent
                    down_aboveContentLineIndex = downLineNumber - 1;
                    down_aboveContentLineIndent = currentIndent;
                    downLineIndentLevel = Math.ceil(currentIndent / this._options.indentSize);
                }
                else {
                    down_resolveIndents(downLineNumber);
                    downLineIndentLevel = this._getIndentLevelForWhitespaceLine(offSide, down_aboveContentLineIndent, down_belowContentLineIndent);
                }
            }
            if (distance === 0) {
                initialIndent = upLineIndentLevel;
                continue;
            }
            if (distance === 1) {
                if (downLineNumber <= lineCount && downLineIndentLevel >= 0 && initialIndent + 1 === downLineIndentLevel) {
                    // This is the beginning of a scope, we have special handling here, since we want the
                    // child scope indent to be active, not the parent scope
                    goUp = false;
                    startLineNumber = downLineNumber;
                    endLineNumber = downLineNumber;
                    indent = downLineIndentLevel;
                    continue;
                }
                if (upLineNumber >= 1 && upLineIndentLevel >= 0 && upLineIndentLevel - 1 === initialIndent) {
                    // This is the end of a scope, just like above
                    goDown = false;
                    startLineNumber = upLineNumber;
                    endLineNumber = upLineNumber;
                    indent = upLineIndentLevel;
                    continue;
                }
                startLineNumber = lineNumber;
                endLineNumber = lineNumber;
                indent = initialIndent;
                if (indent === 0) {
                    // No need to continue
                    return { startLineNumber, endLineNumber, indent };
                }
            }
            if (goUp) {
                if (upLineIndentLevel >= indent) {
                    startLineNumber = upLineNumber;
                }
                else {
                    goUp = false;
                }
            }
            if (goDown) {
                if (downLineIndentLevel >= indent) {
                    endLineNumber = downLineNumber;
                }
                else {
                    goDown = false;
                }
            }
        }
        return { startLineNumber, endLineNumber, indent };
    }
    getLinesIndentGuides(startLineNumber, endLineNumber) {
        this._assertNotDisposed();
        const lineCount = this.getLineCount();
        if (startLineNumber < 1 || startLineNumber > lineCount) {
            throw new Error('Illegal value for startLineNumber');
        }
        if (endLineNumber < 1 || endLineNumber > lineCount) {
            throw new Error('Illegal value for endLineNumber');
        }
        const foldingRules = LanguageConfigurationRegistry.getFoldingRules(this._languageIdentifier.id);
        const offSide = Boolean(foldingRules && foldingRules.offSide);
        let result = new Array(endLineNumber - startLineNumber + 1);
        let aboveContentLineIndex = -2; /* -2 is a marker for not having computed it */
        let aboveContentLineIndent = -1;
        let belowContentLineIndex = -2; /* -2 is a marker for not having computed it */
        let belowContentLineIndent = -1;
        for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            let resultIndex = lineNumber - startLineNumber;
            const currentIndent = this._computeIndentLevel(lineNumber - 1);
            if (currentIndent >= 0) {
                // This line has content (besides whitespace)
                // Use the line's indent
                aboveContentLineIndex = lineNumber - 1;
                aboveContentLineIndent = currentIndent;
                result[resultIndex] = Math.ceil(currentIndent / this._options.indentSize);
                continue;
            }
            if (aboveContentLineIndex === -2) {
                aboveContentLineIndex = -1;
                aboveContentLineIndent = -1;
                // must find previous line with content
                for (let lineIndex = lineNumber - 2; lineIndex >= 0; lineIndex--) {
                    let indent = this._computeIndentLevel(lineIndex);
                    if (indent >= 0) {
                        aboveContentLineIndex = lineIndex;
                        aboveContentLineIndent = indent;
                        break;
                    }
                }
            }
            if (belowContentLineIndex !== -1 && (belowContentLineIndex === -2 || belowContentLineIndex < lineNumber - 1)) {
                belowContentLineIndex = -1;
                belowContentLineIndent = -1;
                // must find next line with content
                for (let lineIndex = lineNumber; lineIndex < lineCount; lineIndex++) {
                    let indent = this._computeIndentLevel(lineIndex);
                    if (indent >= 0) {
                        belowContentLineIndex = lineIndex;
                        belowContentLineIndent = indent;
                        break;
                    }
                }
            }
            result[resultIndex] = this._getIndentLevelForWhitespaceLine(offSide, aboveContentLineIndent, belowContentLineIndent);
        }
        return result;
    }
    _getIndentLevelForWhitespaceLine(offSide, aboveContentLineIndent, belowContentLineIndent) {
        if (aboveContentLineIndent === -1 || belowContentLineIndent === -1) {
            // At the top or bottom of the file
            return 0;
        }
        else if (aboveContentLineIndent < belowContentLineIndent) {
            // we are inside the region above
            return (1 + Math.floor(aboveContentLineIndent / this._options.indentSize));
        }
        else if (aboveContentLineIndent === belowContentLineIndent) {
            // we are in between two regions
            return Math.ceil(belowContentLineIndent / this._options.indentSize);
        }
        else {
            if (offSide) {
                // same level as region below
                return Math.ceil(belowContentLineIndent / this._options.indentSize);
            }
            else {
                // we are inside the region that ends below
                return (1 + Math.floor(belowContentLineIndent / this._options.indentSize));
            }
        }
    }
    //#endregion
    normalizePosition(position, affinity) {
        return position;
    }
    /**
     * Gets the column at which indentation stops at a given line.
     * @internal
    */
    getLineIndentColumn(lineNumber) {
        // Columns start with 1.
        return indentOfLine(this.getLineContent(lineNumber)) + 1;
    }
}
TextModel.MODEL_SYNC_LIMIT = 50 * 1024 * 1024; // 50 MB
TextModel.LARGE_FILE_SIZE_THRESHOLD = 20 * 1024 * 1024; // 20 MB;
TextModel.LARGE_FILE_LINE_COUNT_THRESHOLD = 300 * 1000; // 300K lines
TextModel.DEFAULT_CREATION_OPTIONS = {
    isForSimpleWidget: false,
    tabSize: EDITOR_MODEL_DEFAULTS.tabSize,
    indentSize: EDITOR_MODEL_DEFAULTS.indentSize,
    insertSpaces: EDITOR_MODEL_DEFAULTS.insertSpaces,
    detectIndentation: false,
    defaultEOL: 1 /* LF */,
    trimAutoWhitespace: EDITOR_MODEL_DEFAULTS.trimAutoWhitespace,
    largeFileOptimizations: EDITOR_MODEL_DEFAULTS.largeFileOptimizations,
};
function indentOfLine(line) {
    let indent = 0;
    for (const c of line) {
        if (c === ' ' || c === '\t') {
            indent++;
        }
        else {
            break;
        }
    }
    return indent;
}
//#region Decorations
class DecorationsTrees {
    constructor() {
        this._decorationsTree0 = new IntervalTree();
        this._decorationsTree1 = new IntervalTree();
    }
    intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId) {
        const r0 = this._decorationsTree0.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId);
        const r1 = this._decorationsTree1.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId);
        return r0.concat(r1);
    }
    search(filterOwnerId, filterOutValidation, overviewRulerOnly, cachedVersionId) {
        if (overviewRulerOnly) {
            return this._decorationsTree1.search(filterOwnerId, filterOutValidation, cachedVersionId);
        }
        else {
            const r0 = this._decorationsTree0.search(filterOwnerId, filterOutValidation, cachedVersionId);
            const r1 = this._decorationsTree1.search(filterOwnerId, filterOutValidation, cachedVersionId);
            return r0.concat(r1);
        }
    }
    collectNodesFromOwner(ownerId) {
        const r0 = this._decorationsTree0.collectNodesFromOwner(ownerId);
        const r1 = this._decorationsTree1.collectNodesFromOwner(ownerId);
        return r0.concat(r1);
    }
    collectNodesPostOrder() {
        const r0 = this._decorationsTree0.collectNodesPostOrder();
        const r1 = this._decorationsTree1.collectNodesPostOrder();
        return r0.concat(r1);
    }
    insert(node) {
        if (getNodeIsInOverviewRuler(node)) {
            this._decorationsTree1.insert(node);
        }
        else {
            this._decorationsTree0.insert(node);
        }
    }
    delete(node) {
        if (getNodeIsInOverviewRuler(node)) {
            this._decorationsTree1.delete(node);
        }
        else {
            this._decorationsTree0.delete(node);
        }
    }
    resolveNode(node, cachedVersionId) {
        if (getNodeIsInOverviewRuler(node)) {
            this._decorationsTree1.resolveNode(node, cachedVersionId);
        }
        else {
            this._decorationsTree0.resolveNode(node, cachedVersionId);
        }
    }
    acceptReplace(offset, length, textLength, forceMoveMarkers) {
        this._decorationsTree0.acceptReplace(offset, length, textLength, forceMoveMarkers);
        this._decorationsTree1.acceptReplace(offset, length, textLength, forceMoveMarkers);
    }
}
function cleanClassName(className) {
    return className.replace(/[^a-z0-9\-_]/gi, ' ');
}
class DecorationOptions {
    constructor(options) {
        this.color = options.color || '';
        this.darkColor = options.darkColor || '';
    }
}
class ModelDecorationOverviewRulerOptions extends DecorationOptions {
    constructor(options) {
        super(options);
        this._resolvedColor = null;
        this.position = (typeof options.position === 'number' ? options.position : OverviewRulerLane.Center);
    }
    getColor(theme) {
        if (!this._resolvedColor) {
            if (theme.type !== 'light' && this.darkColor) {
                this._resolvedColor = this._resolveColor(this.darkColor, theme);
            }
            else {
                this._resolvedColor = this._resolveColor(this.color, theme);
            }
        }
        return this._resolvedColor;
    }
    invalidateCachedColor() {
        this._resolvedColor = null;
    }
    _resolveColor(color, theme) {
        if (typeof color === 'string') {
            return color;
        }
        let c = color ? theme.getColor(color.id) : null;
        if (!c) {
            return '';
        }
        return c.toString();
    }
}
class ModelDecorationMinimapOptions extends DecorationOptions {
    constructor(options) {
        super(options);
        this.position = options.position;
    }
    getColor(theme) {
        if (!this._resolvedColor) {
            if (theme.type !== 'light' && this.darkColor) {
                this._resolvedColor = this._resolveColor(this.darkColor, theme);
            }
            else {
                this._resolvedColor = this._resolveColor(this.color, theme);
            }
        }
        return this._resolvedColor;
    }
    invalidateCachedColor() {
        this._resolvedColor = undefined;
    }
    _resolveColor(color, theme) {
        if (typeof color === 'string') {
            return Color.fromHex(color);
        }
        return theme.getColor(color.id);
    }
}
class ModelDecorationOptions {
    constructor(options) {
        this.description = options.description;
        this.stickiness = options.stickiness || 0 /* AlwaysGrowsWhenTypingAtEdges */;
        this.zIndex = options.zIndex || 0;
        this.className = options.className ? cleanClassName(options.className) : null;
        this.hoverMessage = options.hoverMessage || null;
        this.glyphMarginHoverMessage = options.glyphMarginHoverMessage || null;
        this.isWholeLine = options.isWholeLine || false;
        this.showIfCollapsed = options.showIfCollapsed || false;
        this.collapseOnReplaceEdit = options.collapseOnReplaceEdit || false;
        this.overviewRuler = options.overviewRuler ? new ModelDecorationOverviewRulerOptions(options.overviewRuler) : null;
        this.minimap = options.minimap ? new ModelDecorationMinimapOptions(options.minimap) : null;
        this.glyphMarginClassName = options.glyphMarginClassName ? cleanClassName(options.glyphMarginClassName) : null;
        this.linesDecorationsClassName = options.linesDecorationsClassName ? cleanClassName(options.linesDecorationsClassName) : null;
        this.firstLineDecorationClassName = options.firstLineDecorationClassName ? cleanClassName(options.firstLineDecorationClassName) : null;
        this.marginClassName = options.marginClassName ? cleanClassName(options.marginClassName) : null;
        this.inlineClassName = options.inlineClassName ? cleanClassName(options.inlineClassName) : null;
        this.inlineClassNameAffectsLetterSpacing = options.inlineClassNameAffectsLetterSpacing || false;
        this.beforeContentClassName = options.beforeContentClassName ? cleanClassName(options.beforeContentClassName) : null;
        this.afterContentClassName = options.afterContentClassName ? cleanClassName(options.afterContentClassName) : null;
    }
    static register(options) {
        return new ModelDecorationOptions(options);
    }
    static createDynamic(options) {
        return new ModelDecorationOptions(options);
    }
}
ModelDecorationOptions.EMPTY = ModelDecorationOptions.register({ description: 'empty' });
/**
 * The order carefully matches the values of the enum.
 */
const TRACKED_RANGE_OPTIONS = [
    ModelDecorationOptions.register({ description: 'tracked-range-always-grows-when-typing-at-edges', stickiness: 0 /* AlwaysGrowsWhenTypingAtEdges */ }),
    ModelDecorationOptions.register({ description: 'tracked-range-never-grows-when-typing-at-edges', stickiness: 1 /* NeverGrowsWhenTypingAtEdges */ }),
    ModelDecorationOptions.register({ description: 'tracked-range-grows-only-when-typing-before', stickiness: 2 /* GrowsOnlyWhenTypingBefore */ }),
    ModelDecorationOptions.register({ description: 'tracked-range-grows-only-when-typing-after', stickiness: 3 /* GrowsOnlyWhenTypingAfter */ }),
];
function _normalizeOptions(options) {
    if (options instanceof ModelDecorationOptions) {
        return options;
    }
    return ModelDecorationOptions.createDynamic(options);
}
class DidChangeDecorationsEmitter extends Disposable {
    constructor() {
        super();
        this._actual = this._register(new Emitter());
        this.event = this._actual.event;
        this._deferredCnt = 0;
        this._shouldFire = false;
        this._affectsMinimap = false;
        this._affectsOverviewRuler = false;
    }
    beginDeferredEmit() {
        this._deferredCnt++;
    }
    endDeferredEmit() {
        this._deferredCnt--;
        if (this._deferredCnt === 0) {
            if (this._shouldFire) {
                const event = {
                    affectsMinimap: this._affectsMinimap,
                    affectsOverviewRuler: this._affectsOverviewRuler,
                };
                this._shouldFire = false;
                this._affectsMinimap = false;
                this._affectsOverviewRuler = false;
                this._actual.fire(event);
            }
        }
    }
    checkAffectedAndFire(options) {
        if (!this._affectsMinimap) {
            this._affectsMinimap = options.minimap && options.minimap.position ? true : false;
        }
        if (!this._affectsOverviewRuler) {
            this._affectsOverviewRuler = options.overviewRuler && options.overviewRuler.color ? true : false;
        }
        this._shouldFire = true;
    }
    fire() {
        this._affectsMinimap = true;
        this._affectsOverviewRuler = true;
        this._shouldFire = true;
    }
}
//#endregion
class DidChangeContentEmitter extends Disposable {
    constructor() {
        super();
        /**
         * Both `fastEvent` and `slowEvent` work the same way and contain the same events, but first we invoke `fastEvent` and then `slowEvent`.
         */
        this._fastEmitter = this._register(new Emitter());
        this.fastEvent = this._fastEmitter.event;
        this._slowEmitter = this._register(new Emitter());
        this.slowEvent = this._slowEmitter.event;
        this._deferredCnt = 0;
        this._deferredEvent = null;
    }
    beginDeferredEmit() {
        this._deferredCnt++;
    }
    endDeferredEmit(resultingSelection = null) {
        this._deferredCnt--;
        if (this._deferredCnt === 0) {
            if (this._deferredEvent !== null) {
                this._deferredEvent.rawContentChangedEvent.resultingSelection = resultingSelection;
                const e = this._deferredEvent;
                this._deferredEvent = null;
                this._fastEmitter.fire(e);
                this._slowEmitter.fire(e);
            }
        }
    }
    fire(e) {
        if (this._deferredCnt > 0) {
            if (this._deferredEvent) {
                this._deferredEvent = this._deferredEvent.merge(e);
            }
            else {
                this._deferredEvent = e;
            }
            return;
        }
        this._fastEmitter.fire(e);
        this._slowEmitter.fire(e);
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const MAX_FOLDING_REGIONS = 0xFFFF;
const MAX_LINE_NUMBER = 0xFFFFFF;
const MASK_INDENT = 0xFF000000;
class FoldingRegions {
    constructor(startIndexes, endIndexes, types) {
        if (startIndexes.length !== endIndexes.length || startIndexes.length > MAX_FOLDING_REGIONS) {
            throw new Error('invalid startIndexes or endIndexes size');
        }
        this._startIndexes = startIndexes;
        this._endIndexes = endIndexes;
        this._collapseStates = new Uint32Array(Math.ceil(startIndexes.length / 32));
        this._types = types;
        this._parentsComputed = false;
    }
    ensureParentIndices() {
        if (!this._parentsComputed) {
            this._parentsComputed = true;
            let parentIndexes = [];
            let isInsideLast = (startLineNumber, endLineNumber) => {
                let index = parentIndexes[parentIndexes.length - 1];
                return this.getStartLineNumber(index) <= startLineNumber && this.getEndLineNumber(index) >= endLineNumber;
            };
            for (let i = 0, len = this._startIndexes.length; i < len; i++) {
                let startLineNumber = this._startIndexes[i];
                let endLineNumber = this._endIndexes[i];
                if (startLineNumber > MAX_LINE_NUMBER || endLineNumber > MAX_LINE_NUMBER) {
                    throw new Error('startLineNumber or endLineNumber must not exceed ' + MAX_LINE_NUMBER);
                }
                while (parentIndexes.length > 0 && !isInsideLast(startLineNumber, endLineNumber)) {
                    parentIndexes.pop();
                }
                let parentIndex = parentIndexes.length > 0 ? parentIndexes[parentIndexes.length - 1] : -1;
                parentIndexes.push(i);
                this._startIndexes[i] = startLineNumber + ((parentIndex & 0xFF) << 24);
                this._endIndexes[i] = endLineNumber + ((parentIndex & 0xFF00) << 16);
            }
        }
    }
    get length() {
        return this._startIndexes.length;
    }
    getStartLineNumber(index) {
        return this._startIndexes[index] & MAX_LINE_NUMBER;
    }
    getEndLineNumber(index) {
        return this._endIndexes[index] & MAX_LINE_NUMBER;
    }
    getType(index) {
        return this._types ? this._types[index] : undefined;
    }
    hasTypes() {
        return !!this._types;
    }
    isCollapsed(index) {
        let arrayIndex = (index / 32) | 0;
        let bit = index % 32;
        return (this._collapseStates[arrayIndex] & (1 << bit)) !== 0;
    }
    setCollapsed(index, newState) {
        let arrayIndex = (index / 32) | 0;
        let bit = index % 32;
        let value = this._collapseStates[arrayIndex];
        if (newState) {
            this._collapseStates[arrayIndex] = value | (1 << bit);
        }
        else {
            this._collapseStates[arrayIndex] = value & ~(1 << bit);
        }
    }
    toRegion(index) {
        return new FoldingRegion(this, index);
    }
    getParentIndex(index) {
        this.ensureParentIndices();
        let parent = ((this._startIndexes[index] & MASK_INDENT) >>> 24) + ((this._endIndexes[index] & MASK_INDENT) >>> 16);
        if (parent === MAX_FOLDING_REGIONS) {
            return -1;
        }
        return parent;
    }
    contains(index, line) {
        return this.getStartLineNumber(index) <= line && this.getEndLineNumber(index) >= line;
    }
    findIndex(line) {
        let low = 0, high = this._startIndexes.length;
        if (high === 0) {
            return -1; // no children
        }
        while (low < high) {
            let mid = Math.floor((low + high) / 2);
            if (line < this.getStartLineNumber(mid)) {
                high = mid;
            }
            else {
                low = mid + 1;
            }
        }
        return low - 1;
    }
    findRange(line) {
        let index = this.findIndex(line);
        if (index >= 0) {
            let endLineNumber = this.getEndLineNumber(index);
            if (endLineNumber >= line) {
                return index;
            }
            index = this.getParentIndex(index);
            while (index !== -1) {
                if (this.contains(index, line)) {
                    return index;
                }
                index = this.getParentIndex(index);
            }
        }
        return -1;
    }
    toString() {
        let res = [];
        for (let i = 0; i < this.length; i++) {
            res[i] = `[${this.isCollapsed(i) ? '+' : '-'}] ${this.getStartLineNumber(i)}/${this.getEndLineNumber(i)}`;
        }
        return res.join(', ');
    }
}
class FoldingRegion {
    constructor(ranges, index) {
        this.ranges = ranges;
        this.index = index;
    }
    get startLineNumber() {
        return this.ranges.getStartLineNumber(this.index);
    }
    get endLineNumber() {
        return this.ranges.getEndLineNumber(this.index);
    }
    get regionIndex() {
        return this.index;
    }
    get parentIndex() {
        return this.ranges.getParentIndex(this.index);
    }
    get isCollapsed() {
        return this.ranges.isCollapsed(this.index);
    }
    containedBy(range) {
        return range.startLineNumber <= this.startLineNumber && range.endLineNumber >= this.endLineNumber;
    }
    containsLine(lineNumber) {
        return this.startLineNumber <= lineNumber && lineNumber <= this.endLineNumber;
    }
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const MAX_FOLDING_REGIONS_FOR_INDENT_LIMIT = 5000;
const ID_INDENT_PROVIDER = 'indent';
class IndentRangeProvider {
    constructor(editorModel) {
        this.editorModel = editorModel;
        this.id = ID_INDENT_PROVIDER;
    }
    dispose() {
    }
    compute(cancelationToken) {
        let foldingRules = LanguageConfigurationRegistry.getFoldingRules(this.editorModel.getLanguageIdentifier().id);
        let offSide = foldingRules && !!foldingRules.offSide;
        let markers = foldingRules && foldingRules.markers;
        return Promise.resolve(computeRanges(this.editorModel, offSide, markers));
    }
}
// public only for testing
class RangesCollector {
    constructor(foldingRangesLimit) {
        this._startIndexes = [];
        this._endIndexes = [];
        this._indentOccurrences = [];
        this._length = 0;
        this._foldingRangesLimit = foldingRangesLimit;
    }
    insertFirst(startLineNumber, endLineNumber, indent) {
        if (startLineNumber > MAX_LINE_NUMBER || endLineNumber > MAX_LINE_NUMBER) {
            return;
        }
        let index = this._length;
        this._startIndexes[index] = startLineNumber;
        this._endIndexes[index] = endLineNumber;
        this._length++;
        if (indent < 1000) {
            this._indentOccurrences[indent] = (this._indentOccurrences[indent] || 0) + 1;
        }
    }
    toIndentRanges(model) {
        if (this._length <= this._foldingRangesLimit) {
            // reverse and create arrays of the exact length
            let startIndexes = new Uint32Array(this._length);
            let endIndexes = new Uint32Array(this._length);
            for (let i = this._length - 1, k = 0; i >= 0; i--, k++) {
                startIndexes[k] = this._startIndexes[i];
                endIndexes[k] = this._endIndexes[i];
            }
            return new FoldingRegions(startIndexes, endIndexes);
        }
        else {
            let entries = 0;
            let maxIndent = this._indentOccurrences.length;
            for (let i = 0; i < this._indentOccurrences.length; i++) {
                let n = this._indentOccurrences[i];
                if (n) {
                    if (n + entries > this._foldingRangesLimit) {
                        maxIndent = i;
                        break;
                    }
                    entries += n;
                }
            }
            const tabSize = model.getOptions().tabSize;
            // reverse and create arrays of the exact length
            let startIndexes = new Uint32Array(this._foldingRangesLimit);
            let endIndexes = new Uint32Array(this._foldingRangesLimit);
            for (let i = this._length - 1, k = 0; i >= 0; i--) {
                let startIndex = this._startIndexes[i];
                let lineContent = model.getLineContent(startIndex);
                let indent = TextModel.computeIndentLevel(lineContent, tabSize);
                if (indent < maxIndent || (indent === maxIndent && entries++ < this._foldingRangesLimit)) {
                    startIndexes[k] = startIndex;
                    endIndexes[k] = this._endIndexes[i];
                    k++;
                }
            }
            return new FoldingRegions(startIndexes, endIndexes);
        }
    }
}
function computeRanges(model, offSide, markers, foldingRangesLimit = MAX_FOLDING_REGIONS_FOR_INDENT_LIMIT) {
    const tabSize = model.getOptions().tabSize;
    let result = new RangesCollector(foldingRangesLimit);
    let pattern = undefined;
    if (markers) {
        pattern = new RegExp(`(${markers.start.source})|(?:${markers.end.source})`);
    }
    let previousRegions = [];
    let line = model.getLineCount() + 1;
    previousRegions.push({ indent: -1, endAbove: line, line }); // sentinel, to make sure there's at least one entry
    for (let line = model.getLineCount(); line > 0; line--) {
        let lineContent = model.getLineContent(line);
        let indent = TextModel.computeIndentLevel(lineContent, tabSize);
        let previous = previousRegions[previousRegions.length - 1];
        if (indent === -1) {
            if (offSide) {
                // for offSide languages, empty lines are associated to the previous block
                // note: the next block is already written to the results, so this only
                // impacts the end position of the block before
                previous.endAbove = line;
            }
            continue; // only whitespace
        }
        let m;
        if (pattern && (m = lineContent.match(pattern))) {
            // folding pattern match
            if (m[1]) { // start pattern match
                // discard all regions until the folding pattern
                let i = previousRegions.length - 1;
                while (i > 0 && previousRegions[i].indent !== -2) {
                    i--;
                }
                if (i > 0) {
                    previousRegions.length = i + 1;
                    previous = previousRegions[i];
                    // new folding range from pattern, includes the end line
                    result.insertFirst(line, previous.line, indent);
                    previous.line = line;
                    previous.indent = indent;
                    previous.endAbove = line;
                    continue;
                }
            }
            else { // end pattern match
                previousRegions.push({ indent: -2, endAbove: line, line });
                continue;
            }
        }
        if (previous.indent > indent) {
            // discard all regions with larger indent
            do {
                previousRegions.pop();
                previous = previousRegions[previousRegions.length - 1];
            } while (previous.indent > indent);
            // new folding range
            let endLineNumber = previous.endAbove - 1;
            if (endLineNumber - line >= 1) { // needs at east size 1
                result.insertFirst(line, endLineNumber, indent);
            }
        }
        if (previous.indent === indent) {
            previous.endAbove = line;
        }
        else { // previous.indent < indent
            // new region with a bigger indent
            previousRegions.push({ indent, endAbove: line, line });
        }
    }
    return result.toIndentRanges(model);
}

export { createStringBuilder as $, CharacterClassifier as A, StopWatch as B, CancellationTokenSource as C, Disposable as D, Emitter as E, FileAccess as F, getWordAtText as G, ensureValidWordDefinition as H, Iterable as I, IModelService as J, LinkProviderRegistry as K, LinkedList as L, CompletionProviderRegistry as M, isNonEmptyArray as N, timeout as O, Position as P, LanguageConfigurationRegistry as Q, Range as R, Selection as S, Token as T, URI as U, VSBuffer as V, IntervalTimer as W, canceled as X, regExpFlags as Y, dispose as Z, isHighSurrogate as _, Event as a, IInstantiationService as a$, isFullWidthCharacter as a0, isBasicASCII as a1, containsRTL as a2, TokenizationRegistry as a3, NULL_MODE_ID as a4, NULL_STATE as a5, TokenizationResult2 as a6, TokenizationResult as a7, startsWithUTF8BOM as a8, LineTokens as a9, RunOnceScheduler as aA, Color as aB, RGBA as aC, getMapForWordSeparators as aD, EditorOptions as aE, prevCharLength as aF, nextCharLength as aG, getLeftDeleteOffset as aH, isLowerAsciiLetter as aI, isUpperAsciiLetter as aJ, IndentAction as aK, getLeadingWhitespace as aL, registerCodicon as aM, Codicon as aN, toUint8 as aO, MinimapPosition as aP, MINIMAP_GUTTER_WIDTH as aQ, EditorLayoutInfoComputer as aR, TextEditorCursorStyle as aS, escape as aT, nullTokenize2 as aU, singleLetterHash as aV, arrayInsert as aW, ModelDecorationOptions as aX, filterValidationDecorations as aY, EDITOR_FONT_DEFAULTS as aZ, isLowSurrogate as a_, localize as aa, EDITOR_MODEL_DEFAULTS as ab, editorOptionsRegistry as ac, ComputeOptionsMemory as ad, equals as ae, ConfigurationChangedEvent as af, ValidatedEditorOptions as ag, distinct as ah, OS as ai, ImmortalReference as aj, isLinux as ak, format as al, userAgent as am, isFalsyOrWhitespace as an, CSSIcon as ao, EditorFontLigatures as ap, tail as aq, getNextCodePoint as ar, getGraphemeBreakType as as, breakBetweenGraphemeBreakType as at, isEmojiImprecise as au, TextModel as av, commonSuffixLength as aw, commonPrefixLength as ax, containsEmoji as ay, containsFullWidthCharacter as az, isMacintosh as b, isFalsyOrEmpty as b$, CodeActionProviderRegistry as b0, CodeLensProviderRegistry as b1, DefinitionProviderRegistry as b2, DeclarationProviderRegistry as b3, ImplementationProviderRegistry as b4, TypeDefinitionProviderRegistry as b5, HoverProviderRegistry as b6, DocumentHighlightProviderRegistry as b7, DocumentSymbolProviderRegistry as b8, ReferenceProviderRegistry as b9, isEditStackElement as bA, StringSHA1 as bB, isPromiseCanceledError as bC, TernarySearchTree as bD, PauseableEmitter as bE, MutableDisposable as bF, LRUCache as bG, convertSimple2RegExpPattern as bH, ltrim as bI, rtrim as bJ, combinedDisposable as bK, illegalState as bL, optional as bM, _util as bN, IdleValue as bO, disposableTimeout as bP, binarySearch as bQ, EventBufferer as bR, clamp as bS, range as bT, tail2 as bU, Relay as bV, distinctES6 as bW, Promises as bX, createCancelablePromise as bY, pushToStart as bZ, pushToEnd as b_, RenameProviderRegistry as ba, DocumentFormattingEditProviderRegistry as bb, DocumentRangeFormattingEditProviderRegistry as bc, SignatureHelpProviderRegistry as bd, InlayHintsProviderRegistry as be, Delayer as bf, setImmediate as bg, iconRegistry as bh, boolean as bi, stringSet as bj, OverviewRulerLane as bk, posix as bl, DataUri as bm, basename as bn, match as bo, LanguageIdentifier as bp, regExpLeadsToEndlessLoop as bq, NULL_LANGUAGE_IDENTIFIER as br, firstOrDefault as bs, TokenMetadata as bt, MultilineTokens2 as bu, SparseEncodedTokens as bv, isLittleEndian as bw, onUnexpectedExternalError as bx, DocumentSemanticTokensProviderRegistry as by, DocumentRangeSemanticTokensProviderRegistry as bz, createDecorator as c, ThrottledDelayer as c0, isDisposable as c1, getCodiconAriaLabel as c2, coalesce as c3, TextModelResolvedOptions as c4, FindMatch as c5, nullTokenize as c6, FoldingRangeKind as c7, LinkedEditingRangeProviderRegistry as c8, OnTypeFormattingEditProviderRegistry as c9, HSVA as cA, extUri as cB, raceCancellation as cC, isLocationLink as cD, containsUppercaseCharacter as cE, findFirstInSorted as cF, SearchParams as cG, FoldingRegions as cH, MAX_LINE_NUMBER as cI, IndentRangeProvider as cJ, first as cK, originalFSPath as cL, joinPath as cM, SignatureHelpTriggerKind as cN, DocumentHighlightKind as cO, sep as cP, stripWildcards as cQ, trim as cR, SymbolKinds as cS, ColorProviderRegistry as ca, FoldingRangeProviderRegistry as cb, SelectionRangeRegistry as cc, InlineCompletionsProviderRegistry as cd, asArray as ce, flatten as cf, isEqual as cg, escapeRegExpCharacters as ch, runWhenIdle as ci, LanguageFeatureRequestDelays as cj, hash as ck, basename$1 as cl, isRootOrDriveLetter as cm, hasDriveLetter as cn, compare as co, resolvePath as cp, InlineCompletionTriggerKind as cq, dirname as cr, dirname$1 as cs, groupBy as ct, completionKindFromString as cu, compareIgnoreCase as cv, quickSelect as cw, basenameOrAuthority as cx, completionKindToCssClass as cy, CharacterSet as cz, isWindows as d, isNative as e, RemoteAuthorities as f, isIOS as g, DisposableStore as h, illegalArgument as i, TimeoutTimer as j, equalsIgnoreCase as k, Schemas as l, ResourceMap as m, normalizePath as n, onUnexpectedError as o, CancellationToken as p, isWeb as q, transformErrorForSerialization as r, startsWithIgnoreCase as s, toDisposable as t, globals as u, stringHash as v, firstNonWhitespaceIndex as w, lastNonWhitespaceIndex as x, toUint32 as y, splitLines as z };
