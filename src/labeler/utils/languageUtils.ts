/**
 * Copyright (c) Microsoft. All rights reserved.
 */

// CJK unicode ranges
const hangul = [4352, 4607];
const lisu = [42192, 42239];
const miao = [93952, 94111];
const kanbun = [12688, 12703];
const nushu = [110960, 111359];
const tangut = [94208, 100343];
const hiragana = [12352, 12447];
const katakana = [12448, 12543];
const bopomofo = [12704, 12591];
const cjkUnified = [19968, 40959];
const cjkStrokes = [12736, 12783];
const smallKana = [110896, 110959];
const cjkExtensionA = [13312, 19903];
const cjkIdeographic = [12272, 12287];
const kangxiRadicals = [12032, 12255];
const lisuSupplement = [73648, 73663];
const hangulExtendedA = [43360, 43391];
const hangulExtendedB = [55216, 55295];
const hangulSyllables = [44032, 55215];
const cjkExtensionB = [131072, 173791];
const cjkExtensionC = [173824, 177976];
const cjkExtensionD = [177984, 178205];
const cjkExtensionE = [178208, 183969];
const cjkExtensionF = [183984, 191456];
const cjkExtensionG = [196608, 201546];
const kanaExtendedA = [110848, 110895];
const kanaExtendedB = [110576, 110591];
const kanaSupplement = [110592, 110847];
const cjkCompatibility = [63744, 64255];
const katakanaPhonetic = [12784, 12799];
const tangutComponents = [100352, 101119];
const tangutSupplement = [101632, 101640];
const halfWidthCharacters = [65280, 65519];
const cjkRadicalSupplement = [11904, 12031];
const cjkCompatibilitySupplement = [194560, 195103];

const cjkUnicodeRanges = [
    lisu,
    miao,
    nushu,
    hangul,
    kanbun,
    tangut,
    bopomofo,
    hiragana,
    katakana,
    smallKana,
    cjkUnified,
    cjkStrokes,
    kanaExtendedA,
    kanaExtendedB,
    cjkExtensionA,
    cjkExtensionB,
    cjkExtensionC,
    cjkExtensionD,
    cjkExtensionE,
    cjkExtensionF,
    cjkExtensionG,
    kangxiRadicals,
    cjkIdeographic,
    kanaSupplement,
    lisuSupplement,
    hangulExtendedA,
    hangulExtendedB,
    hangulSyllables,
    cjkCompatibility,
    katakanaPhonetic,
    tangutComponents,
    tangutSupplement,
    halfWidthCharacters,
    cjkRadicalSupplement,
    cjkCompatibilitySupplement
];

export const isCharacterCjk = (c: string) => {
    const decimalUnicode = c.charCodeAt(0);

    return cjkUnicodeRanges.find(r => r[0] <= decimalUnicode && decimalUnicode <= r[1]) !== undefined;
};
