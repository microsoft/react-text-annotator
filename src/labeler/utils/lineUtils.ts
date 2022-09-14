/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerA11yStore } from '../stores/LabelerA11yStore';
import { LabelerConfigStore } from '../stores/LabelerConfigStore';
import { LabelerSelectionStore } from '../stores/LabelerSelectionStore';
import { LineStore } from '../stores/LineStore';
import { TokenStore } from '../stores/TokenStore';
import { CharToTokenMapType, ITokenStore, TargetIndex, TokenToCharMapType } from '../types/labelerTypes';
import {
    LABELER_HORIZONTAL_PADDING,
    lineDataAttribute,
    lineIndexDataAttribute,
    LabelerKeyCodes,
    nextLineChars
} from '../utils/labelerConstants';
import { isCharacterCjk } from '../utils/languageUtils';

type LineDto = { lineNumber: number; tokenRangeIndices: [number, number] };

/**
 * Gets the line DOM element with the given index from the
 * given HTML container.
 *
 * @param ref The HTML element to search in.
 * @param index The index of the line to get.
 * @returns The line HTML element.
 */
export const getLineElementByIndex = (ref: HTMLElement, index: number) =>
    ref.querySelector(`[${lineDataAttribute}][${lineIndexDataAttribute}="${index}"]`);

/**
 * Breaks the text into lines based on:
 * - The `\n` characters in the original text.
 * - Each of these lines are then further broken into more lines if the number
 *   of characters in it exceeds the maximum number of allowable characters.
 *
 * Check the unit tests for sample input/output. Also check `labeler.md` for
 * more information.
 *
 * @param text The text to break into lines.
 * @param maxCharCountPerLine The maximum number of characters allowed in each line.
 * @param configStore The labeler configuration store to access some configs
 *
 * @returns An array of lines - the original line number and a token range (start token index, end token index).
 */
export const getLineInfos = (text: string, maxCharCountPerLine: number, configStore: LabelerConfigStore): LineDto[] => {
    if (!text) {
        return [];
    }

    const lines: LineDto[] = [];

    let lineNumber = 1;
    let lastSpaceIndex = -1;
    let currentLineLength = 0;
    let currentLineStartIndex = 0;

    const { wordBreak } = configStore;

    const setLineData = (
        _lineNumber: number,
        _tokenRangeIndices: [number, number],
        _currentLineLength: number,
        _currentLineStartIndex: number,
        _lastSpaceIndex: number
    ) => {
        lines.push({
            lineNumber: _lineNumber,
            tokenRangeIndices: _tokenRangeIndices
        });
        currentLineLength = _currentLineLength;
        lastSpaceIndex = _lastSpaceIndex;
        currentLineStartIndex = _currentLineStartIndex;
    };

    for (let index = 0; index < text.length; index++) {
        currentLineLength++;

        if (text[index] === '\n') {
            setLineData(lineNumber, [currentLineStartIndex, currentLineStartIndex + currentLineLength - 1], 0, index + 1, -1);
            lineNumber++;
        } else if (currentLineLength > maxCharCountPerLine) {
            if (text[index] === ' ') {
                setLineData(lineNumber, [currentLineStartIndex, index - 1], 1, index, index);
            } else if (wordBreak === 'normal') {
                if (isCharacterCjk(text[index])) {
                    setLineData(lineNumber, [currentLineStartIndex, index - 1], 1, index, -1);
                } else if (lastSpaceIndex !== -1) {
                    setLineData(lineNumber, [currentLineStartIndex, lastSpaceIndex], index - lastSpaceIndex, lastSpaceIndex + 1, -1);
                }
            } else if (wordBreak === 'breakAll') {
                setLineData(lineNumber, [currentLineStartIndex, index - 1], 1, index, -1);
            } else if (lastSpaceIndex !== -1) {
                setLineData(lineNumber, [currentLineStartIndex, lastSpaceIndex], index - lastSpaceIndex, lastSpaceIndex + 1, -1);
            }
        } else if (text[index] === ' ') {
            lastSpaceIndex = index;
        }
    }

    if (currentLineLength) {
        lines.push({
            lineNumber,
            tokenRangeIndices: [currentLineStartIndex, currentLineStartIndex + currentLineLength - 1]
        });
    }

    return lines;
};

/**
 * This util method calculates all tokens in all line of the given text based
 * on whether the labeler is tokenized by character or word.
 * If tokenizationType is word, it splits the line text with spaces or `\n` so each word is a token.
 * If tokenizationType is character, it splits the line text into characters (the default behavior) so each character is a token.
 *
 * @param text The text of the labeler.
 * @param lines The line DtoS after splitting the text, to calculate tokens of each line.
 * @param configStore The labeler configuration store to access some configs.
 * @returns list of all tokens in the text.
 */
export const getTokens = (text: string, lines: LineDto[], configStore: LabelerConfigStore) => {
    if (!text) {
        return [];
    }

    const { tokenizationType } = configStore;

    const tokens: string[] = [];

    lines.forEach(line => {
        let currentWord = '';

        for (let index = line.tokenRangeIndices[0]; index <= line.tokenRangeIndices[1]; index++) {
            if (tokenizationType === 'character') {
                tokens.push(text[index]);
            } else if (text[index] in nextLineChars || text[index] === ' ') {
                if (currentWord.length) {
                    tokens.push(currentWord);
                    currentWord = '';
                }
                tokens.push(text[index]);
            } else {
                currentWord += text[index];
            }
        }

        if (currentWord.length) {
            tokens.push(currentWord);
        }
    });

    return tokens;
};

/**
 * This util method calculates the mappers needed to update annotation token ranges when passing to/from the labeler.
 * That's because there are two modes of tokenization in the labeler, character and word tokenization.
 * So we need to map each index in the labeler text to the corresponding token index.
 * and map each token index to the start and end indices of that token in the labeler text.
 *
 * @param text The text of the labeler.
 * @param lines The line DtoS after splitting the text.
 * @param configStore The labeler configuration store to access some configs
 * @returns index-to-token and token-to-char maps
 */
export const getCharAndTokenMapping = (text: string, lines: LineDto[], configStore: LabelerConfigStore) => {
    const charToTokenMap: CharToTokenMapType = new Map();
    const tokenToCharMap: TokenToCharMapType = new Map();

    if (!text) {
        return { charToTokenMap, tokenToCharMap };
    }

    const { tokenizationType } = configStore;

    let tokenNumber = 0;

    lines.forEach(line => {
        let currentWord = '';

        for (let index = line.tokenRangeIndices[0]; index <= line.tokenRangeIndices[1]; index++) {
            if (tokenizationType === 'character') {
                charToTokenMap.set(index, index);
                tokenToCharMap.set(index, { startIndex: index, endIndex: index });
                tokenNumber++;
            } else if (text[index] in nextLineChars || text[index] === ' ') {
                if (currentWord.length) {
                    tokenToCharMap.set(tokenNumber, { startIndex: index - currentWord.length, endIndex: index - 1 });
                    tokenNumber++;
                    currentWord = '';
                }
                charToTokenMap.set(index, tokenNumber);
                tokenToCharMap.set(tokenNumber, { startIndex: index, endIndex: index });
                tokenNumber++;
            } else {
                charToTokenMap.set(index, tokenNumber);
                currentWord += text[index];
            }
        }

        if (currentWord.length) {
            tokenToCharMap.set(tokenNumber, {
                startIndex: line.tokenRangeIndices[1] - currentWord.length + 1,
                endIndex: line.tokenRangeIndices[1]
            });
            tokenNumber++;
        }
    });

    return { charToTokenMap, tokenToCharMap };
};

/**
 * Handles the effects key interactions from a line or tokens inside
 * a line have on the selection store.
 *
 * @param event The key pressed's event.
 * @param lineRef The reference to the current line's HTML element.
 * @param lineStore The underlying store for the current line element.
 * @param selectionStore The store that saves the current selection state.
 */
const lineRendererSelectionInteractions = <T extends ITokenStore>({
    event,
    lineStore,
    selectionStore
}: {
    lineRef: HTMLDivElement;
    lineStore: LineStore<T>;
    event: React.KeyboardEvent;
    selectionStore: LabelerSelectionStore;
}): boolean => {
    if (event.key === LabelerKeyCodes.ArrowRight || event.key === LabelerKeyCodes.ArrowLeft) {
        const tokenIndex = lineStore.tokenRangeIndices[event.key === LabelerKeyCodes.ArrowRight ? 0 : 1];

        selectionStore.unHover();

        if (event.shiftKey) {
            selectionStore.select(tokenIndex);
        } else {
            selectionStore.hover(tokenIndex);
        }

        return true;
    }

    return false;
};

/**
 * Handles the effects key interactions from a line or tokens inside
 * a line have on the a11y store.
 *
 * @param event The key pressed's event.
 * @param lineRef The reference to the current line's HTML element.
 * @param lineStore The underlying store for the current line element.
 * @param a11yStore The store that saves the current a11y state.
 */
const lineRendererA11yInteractions = <T extends ITokenStore>({
    event,
    lineStore,
    a11yStore,
    targetIndex = undefined
}: {
    lineRef: HTMLDivElement;
    lineStore: LineStore<T>;
    event: React.KeyboardEvent;
    a11yStore: LabelerA11yStore;
    targetIndex?: TargetIndex;
}): boolean => {
    if (event.key === LabelerKeyCodes.ArrowUp || event.key === LabelerKeyCodes.ArrowDown) {
        const direction = event.key === LabelerKeyCodes.ArrowDown ? 'next' : 'previous';
        if (targetIndex) {
            a11yStore.focusLineByDirection(direction, undefined, targetIndex);
        } else {
            a11yStore.focusLineByDirection(direction);
        }

        return true;
    }

    if (event.key === LabelerKeyCodes.ArrowRight || event.key === LabelerKeyCodes.ArrowLeft) {
        const firstOrLastTokenIndex = lineStore.tokenRangeIndices[event.key === LabelerKeyCodes.ArrowRight ? 0 : 1];
        a11yStore.focusTokenByIndex(firstOrLastTokenIndex);

        return true;
    }

    if (event.key === LabelerKeyCodes.Home || event.key === LabelerKeyCodes.End) {
        const direction = event.key === LabelerKeyCodes.Home ? 'first' : 'last';

        a11yStore.focusLineByDirection(direction);

        return true;
    }

    return false;
};

/**
 * The handler function that handles all selection and a11y
 * actions fired from a line in a labeler. The event is
 * considered consumed and thus blocked from propagation if
 * any of the selection or a11y actions are fired on it.
 *
 * @param event The original key down event fired.
 * @param lineRef The reference to the line DOM element.
 * @param lineStore The backing data store for this line.
 * @param a11yStore The store containing a11y state for
 * the labeler.
 * @param selectionStore The store containing the selection
 * state for the labeler.
 */
export const onLineRendererKeyDown = <T extends ITokenStore>({
    event,
    lineRef,
    lineStore,
    a11yStore,
    selectionStore,
    targetIndex = undefined
}: {
    lineStore: LineStore<T>;
    lineRef: HTMLDivElement;
    event: React.KeyboardEvent;
    a11yStore: LabelerA11yStore;
    selectionStore: LabelerSelectionStore;
    targetIndex: TargetIndex;
}) => {
    const isEventConsumedBySelection = lineRendererSelectionInteractions({ event, lineRef, lineStore, selectionStore });
    const isEventConsumedByA11y = lineRendererA11yInteractions({ event, lineStore, lineRef, a11yStore, targetIndex });

    if (isEventConsumedBySelection || isEventConsumedByA11y) {
        event.preventDefault();
        event.stopPropagation();
    }
};

/**
 * Gets the max width of the labeler lines and x offset of the svg layer.
 *
 * @param rootRef The reference of the labeler Dom element.
 * @param isRtl Whether the labeler is in rtl mode or not.
 * @returns The max width of the labeler lines and x offset of the svg layer.
 */
export const getMaxLineWidthAndSvgXOffset = (rootRef: HTMLDivElement, isRtl: boolean) => {
    const { width: rootWidth } = rootRef.getBoundingClientRect();
    const lineDomElements = rootRef.querySelectorAll(`[${lineDataAttribute}]`);
    const lineEndRects = Array.from(lineDomElements)
        .map(l => l.lastElementChild?.getBoundingClientRect())
        .filter(Boolean);

    const maxLineWidth = lineEndRects.reduce((max, l) => Math.max(max, l.width), 0) + 2 * LABELER_HORIZONTAL_PADDING;

    return {
        maxLineWidth,
        svgXOffset: isRtl ? rootWidth - maxLineWidth : 0
    };
};

const isLineFocusable = (tokensStore: TokenStore[]) =>
    tokensStore.some(token => nextLineChars.indexOf(token.text) === -1 && token.text.trim().length !== 0);

export const getTargetIndex = (lineStores: LineStore<TokenStore>[], index: number): TargetIndex => {
    let targetIndex;

    const linesLength = lineStores.length;
    const nextLineIndex = (index + 1) % linesLength;
    const previousLineIndex = index === 0 ? linesLength - 1 : index - 1;

    if (isLineFocusable(lineStores[nextLineIndex].tokenStores) && isLineFocusable(lineStores[previousLineIndex].tokenStores)) {
        return targetIndex;
    }

    for (let i = nextLineIndex; i < linesLength; i++) {
        if (isLineFocusable(lineStores[i].tokenStores)) {
            targetIndex = { previous: previousLineIndex, next: i };
            break;
        }
        if (i === linesLength - 1) {
            i = 0;
        }
    }

    for (let i = previousLineIndex; i > -1; i--) {
        if (isLineFocusable(lineStores[i].tokenStores)) {
            targetIndex = { ...targetIndex, previous: i };
            break;
        }
        if (i === 0) {
            i = linesLength - 1;
        }
    }

    return targetIndex;
};
