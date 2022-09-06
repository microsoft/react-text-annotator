/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { action, observable } from 'mobx';
import { TargetIndex } from '../types/labelerTypes';
import { getAnnotationElementByKey, getAnnotationElementsByTokenIndex } from '../utils/annotationUtils';
import { a11yTabIndexAttribute, annotationIndexDataAttribute } from '../utils/labelerConstants';
import { getLineElementByIndex } from '../utils/lineUtils';
import { getNewLabelerTokenElementByIndex } from '../utils/tokenUtils';

type FocusDirection = 'next' | 'previous' | 'first' | 'last';
type ElementType = 'line' | 'token' | 'annotation';

const getPropertyByType = (
    elementType: ElementType
): keyof Pick<LabelerA11yStore, 'focusedTokenIndex' | 'focusedLineIndex' | 'focusedAnnotationKey'> => {
    switch (elementType) {
        case 'line':
            return 'focusedLineIndex';
        case 'token':
            return 'focusedTokenIndex';
        case 'annotation':
            return 'focusedAnnotationKey';
        default:
            return undefined;
    }
};

const getSelectorFunctionByType = (elementType: ElementType): ((ref: HTMLElement, index: number | string) => Element) => {
    switch (elementType) {
        case 'line':
            return getLineElementByIndex;
        case 'annotation':
            return getAnnotationElementByKey;
        case 'token':
            return getNewLabelerTokenElementByIndex;
        default:
    }
};

/**
 * Gets the index of the element to focus based on the
 * given direction.
 *
 * @param direction The direction of the next focus step.
 * @param focusedIndex The index of the current focused element.
 * @param firstIndex The index of the first element of what is
 * being focused. Meaning that, if we were cycling between lines,
 * this would be the index of the first line.
 * @param lastIndex The index of the last element of what is
 * being focused. Meaning that, if we were cycling between tokens,
 * this would be the index of the first token.
 * @param isCircular Whether the focus should jump to start if it
 * reaches the end and vice versa.
 */
const getNextIndex = (
    direction: FocusDirection,
    focusedIndex: number,
    firstIndex: number,
    lastIndex: number,
    isCircular: boolean,
    targetIndex: TargetIndex = undefined
) => {
    let index;

    switch (direction) {
        case 'next':
            if (isNaN(focusedIndex)) {
                index = firstIndex;
            } else if (targetIndex) {
                index = targetIndex.next;
            } else if (focusedIndex === lastIndex && isCircular) {
                index = firstIndex;
            } else if (focusedIndex < lastIndex) {
                index = focusedIndex + 1;
            } else {
                index = focusedIndex;
            }
            break;
        case 'previous':
            if (isNaN(focusedIndex)) {
                index = lastIndex;
            } else if (targetIndex) {
                index = targetIndex.previous;
            } else if (focusedIndex === firstIndex && isCircular) {
                index = lastIndex;
            } else if (focusedIndex > firstIndex) {
                index = focusedIndex - 1;
            } else {
                index = focusedIndex;
            }
            break;
        case 'first':
            index = firstIndex;
            break;
        case 'last':
            index = lastIndex;
            break;
        default:
    }

    return index;
};

const searchForNearestValue = (needle: number, haystack: number[]) => {
    let searchStart = 0;
    let middleIndex;
    let searchEnd = haystack.length - 1;

    while (searchStart <= searchEnd) {
        middleIndex = Math.floor((searchStart + searchEnd) / 2);

        if (haystack[middleIndex] < needle) {
            searchStart = middleIndex + 1;
        } else if (haystack[middleIndex] > needle) {
            searchEnd = middleIndex - 1;
        } else {
            return middleIndex;
        }
    }

    return middleIndex;
};

export class LabelerA11yStore {
    public lineCount: number;

    public tokenCount: number;

    public containerRef: HTMLDivElement;

    @observable public focusedLineIndex: number | null = null;

    @observable public focusedTokenIndex: number | null = null;

    @observable public focusedAnnotationKey: string | null = null;

    /**
     * Initializes the store with necessary information for
     * focus calculations.
     *
     * @param containerRef The ref to the DOM element that contains the lines.
     * @param lineCount The number of lines in the text.
     * @param tokenCount The number of tokens in the text.
     */
    @action
    public initialize(containerRef: HTMLDivElement, lineCount: number, tokenCount: number) {
        this.lineCount = lineCount;
        this.tokenCount = tokenCount;
        this.containerRef = containerRef;
        this.focusedLineIndex = 0;

        const firstLine = <HTMLElement>getLineElementByIndex(this.containerRef, 0);
        firstLine?.setAttribute(a11yTabIndexAttribute, '0');
    }

    /**
     * Focuses the line with the given index.
     *
     * @param index The index of the line to focus.
     */
    @action
    public focusLineByIndex(index: number) {
        this._focus('line', index);
    }

    /**
     * Focuses a new line based on the given direction. The
     * direction controls focus relative to the currently
     * focused line as follows:
     *
     * - next: Focuses the line after the current line.
     * - previous: Focuses the line before the current line.
     * - first: Focuses the first line in the text.
     * - last: Focuses the last line in the text.
     *
     * @param direction The direction to control focus movement.
     * @param isCircular If true, when focused on the last line,
     * moving forward jumps focus to the first line, and vice versa.
     */
    @action
    public focusLineByDirection(direction: FocusDirection, isCircular: boolean = true, targetIndex: TargetIndex = undefined) {
        const firstLineIndex = 0;
        const lastLineIndex = this.lineCount - 1;
        const index = getNextIndex(direction, this.focusedLineIndex, firstLineIndex, lastLineIndex, isCircular, targetIndex);

        this._focus('line', index);
        this._blurCurrent('token');
    }

    /**
     * Focuses the token by the given index.
     *
     * @param index The index of the token to focus.
     */
    @action
    public focusTokenByIndex(index: number) {
        this._focus('token', index);
    }

    /**
     * Focuses a new token based on the given direction. The
     * directions controls focus relative to the currently
     * focused token as follows:
     *
     * - next: Focuses the token after the current token.
     * - previous: Focuses the token before the current token.
     * - first: Focuses the first token in the text.
     * - last: Focuses the last token in the text.
     *
     * @param direction The direction to control focus movement.
     * @param isCircular If true, when focused on the last token,
     * moving forward jumps focus to the first token, and vice versa.
     */
    @action
    public focusTokenByDirection(direction: FocusDirection, isCircular: boolean = false) {
        const firstTokenIndex = 0;
        const firstLineIndex = 0;
        const lastTokenIndex = this.tokenCount - 1;
        const lastLineIndex = this.lineCount - 1;
        const index = getNextIndex(direction, this.focusedTokenIndex, firstTokenIndex, lastTokenIndex, isCircular);

        if (direction === 'first') {
            this._focus('line', firstLineIndex, 'noDom');
        }

        if (direction === 'last') {
            this._focus('line', lastLineIndex, 'noDom');
        }

        this._focus('token', index);
    }

    /**
     * Focuses the annotation based on the given direction and
     * the current focused annotation or token (if the focus is
     * not on an annotation).
     *
     * Read more about how this function works in `labelerA11yStore.md`.
     *
     * @param direction The direction to move the focus to.
     * @param isCircular If true, when focused on the last annotation,
     * moving forward jumps focus to the first annotation, and vice versa.
     */
    @action
    public focusAnnotationByDirection(direction: FocusDirection, isCircular: boolean = true) {
        const currentFocusedIndex = this.focusedAnnotationKey ?? this.focusedTokenIndex;
        const currentFocusedElementType = this.focusedAnnotationKey ? 'annotation' : 'token';
        const currentFocusedElement = getSelectorFunctionByType(currentFocusedElementType)(this.containerRef, currentFocusedIndex);
        const currentFocusedElementYCoordinate = currentFocusedElement.getBoundingClientRect().y;

        const annotationElementsWithYCoordinates = getAnnotationElementsByTokenIndex(this.containerRef, this.focusedTokenIndex)
            .map(element => ({ element, yCoord: element.getBoundingClientRect().y }))
            .sort((a, b) => (a.yCoord < b.yCoord ? -1 : 1));

        if (annotationElementsWithYCoordinates.length === 0) {
            return;
        }

        const indexOfNearestAnnotation = searchForNearestValue(
            currentFocusedElementYCoordinate,
            annotationElementsWithYCoordinates.map(e => e.yCoord)
        );
        const nearestAnnotation = annotationElementsWithYCoordinates[indexOfNearestAnnotation];

        let indexToFocus: number;

        if (
            (nearestAnnotation.yCoord < currentFocusedElementYCoordinate && direction === 'previous') ||
            (nearestAnnotation.yCoord > currentFocusedElementYCoordinate && direction === 'next')
        ) {
            indexToFocus = indexOfNearestAnnotation;
        } else {
            indexToFocus = getNextIndex(direction, indexOfNearestAnnotation, 0, annotationElementsWithYCoordinates.length - 1, isCircular);
        }

        this._focus('annotation', annotationElementsWithYCoordinates[indexToFocus].element.getAttribute(annotationIndexDataAttribute));
    }

    /**
     * Blurs the currently focused token.
     */
    @action
    public blurCurrentToken() {
        this._blurCurrent('token');
    }

    /**
     * Blurs the currently focused annotation.
     */
    @action
    public blurCurrentAnnotation() {
        this._blurCurrent('annotation');
    }

    /**
     * Blurs focus off the current focused element of the given
     * type. Blurring involves un-setting the current focused
     * element and removing the tab index attribute from its
     * corresponding HTML element.
     *
     * @param elementType The element type to blur.
     */
    private _blurCurrent(elementType: ElementType) {
        const previousIndex = this[getPropertyByType(elementType)];

        if (previousIndex !== null) {
            const previousFocusedElement = <HTMLElement>getSelectorFunctionByType(elementType)(this.containerRef, previousIndex);
            previousFocusedElement.removeAttribute(a11yTabIndexAttribute);
        }

        (this[getPropertyByType(elementType)] as unknown) = null;
    }

    /**
     * Focuses the element with the given type and index. The focus
     * function has two modes: `default` and `withoutHtml`. This controls
     * whether the HTML element should actually be focused (default mode)
     * or just be marked as focused through state change but without an
     * actual change in the document active element (noDom mode).
     *
     * @param elementType The type of the element to focus.
     * @param index The index of the element to focus.
     * @param mode The focus mode, which controls whether the active element
     * itself would be focused or not.
     */
    private _focus(elementType: ElementType, index: number | string, mode: 'default' | 'noDom' = 'default') {
        const elementToFocus = <HTMLElement>getSelectorFunctionByType(elementType)(this.containerRef, index);

        this._blurCurrent(elementType);

        elementToFocus.setAttribute(a11yTabIndexAttribute, '0');
        (this[getPropertyByType(elementType)] as unknown) = index;

        if (mode === 'default') {
            elementToFocus.focus();
        }
    }
}
