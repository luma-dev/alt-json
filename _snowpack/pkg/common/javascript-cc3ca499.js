import { conf as conf$1, language as language$1 } from './typescript-f128d192.js';
import './editor.main-9837ee51.js';
import './indentRangeProvider-881f1573.js';
import './process-c22ef109.js';
import './_commonjsHelpers-98c08ccd.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var conf = conf$1;
var language = {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: 'invalid',
    tokenPostfix: '.js',
    keywords: [
        'break',
        'case',
        'catch',
        'class',
        'continue',
        'const',
        'constructor',
        'debugger',
        'default',
        'delete',
        'do',
        'else',
        'export',
        'extends',
        'false',
        'finally',
        'for',
        'from',
        'function',
        'get',
        'if',
        'import',
        'in',
        'instanceof',
        'let',
        'new',
        'null',
        'return',
        'set',
        'super',
        'switch',
        'symbol',
        'this',
        'throw',
        'true',
        'try',
        'typeof',
        'undefined',
        'var',
        'void',
        'while',
        'with',
        'yield',
        'async',
        'await',
        'of'
    ],
    typeKeywords: [],
    operators: language$1.operators,
    symbols: language$1.symbols,
    escapes: language$1.escapes,
    digits: language$1.digits,
    octaldigits: language$1.octaldigits,
    binarydigits: language$1.binarydigits,
    hexdigits: language$1.hexdigits,
    regexpctl: language$1.regexpctl,
    regexpesc: language$1.regexpesc,
    tokenizer: language$1.tokenizer
};

export { conf, language };