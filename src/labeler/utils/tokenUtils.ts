/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerA11yStore } from '../stores/LabelerA11yStore';
import { LabelerSelectionStore } from '../stores/LabelerSelectionStore';
import { LineStore } from '../stores/LineStore';
import { AnnotationData, ITokenStore, TokenEventListenersFactory, TokenPaddingCalculator } from '../types/labelerTypes';
import {
    LabelerKeyCodes,
    RELATION_NAME_Y_OFFSET,
    RELATION_STROKE_WIDTH,
    tokenDataAttribute,
    tokenIndexDataAttribute,
    TOKEN_DEFAULT_PADDING,
    TOKEN_PREDICTION_Y_PADDING,
    TOKEN_RELATION_PADDING,
    TOKEN_UNDERLINE_PADDING
} from '../utils/labelerConstants';

/**
 * Searches the DOM in the given container for the token
 * with the given index.
 *
 * @param ref The reference of the container to search in.
 * @param index The index of the token to find.
 * @returns The token HTML element.
 */
export const getNewLabelerTokenElementByIndex = (ref: HTMLElement, index: number) =>
    ref.querySelector(`[${tokenDataAttribute}][${tokenIndexDataAttribute}="${index}"]`);

const calculatePaddingByLevel = (annotationCount: number, maxAnnotationLevel: number, levelPaddingMultiplier: number) => {
    if (annotationCount === 0) {
        return 0;
    }

    if (maxAnnotationLevel === 0) {
        return TOKEN_DEFAULT_PADDING * 1.5;
    }

    return maxAnnotationLevel * levelPaddingMultiplier;
};

/**
 * Labels need space under tokens. If a token has more than one
 * label, it needs multiple levels of padding for the multiple
 * levels of labels.
 *
 * Note that we add an additional level in the
 * max level calculations. That is even level 0 labels need
 * token padding to ensure that they don't overlap with annotations
 * on the line below them.
 *
 * @param tokenStore The token store of the token getting
 * the padding levels for.
 * @param annotationsPerToken An array of the annotations that
 * pass through this token.
 * @returns A tuple that indicates the top and bottom padding needed.
 */
export const calculateLabelTokenPadding: TokenPaddingCalculator = (_tokenStore, annotationsPerToken) => {
    const labelAnnotations = annotationsPerToken.filter(a => a.kind === 'label' || a.kind === 'negativeLabel');
    const maxLevel = labelAnnotations.reduce((acc, a) => Math.max(acc, (a.level ?? 0) + 1), 0);

    return [0, calculatePaddingByLevel(labelAnnotations.length, maxLevel, TOKEN_UNDERLINE_PADDING)];
};

/**
 * Relations need space above tokens. If a token has more than one
 * relation, it needs multiple levels of top padding for the multiple
 * levels of relations.
 *
 * @param tokenStore The token store of the token getting
 * the padding levels for.
 * @param annotationsPerToken An array of the annotations that
 * pass through this token.
 * @returns A tuple that indicates the top and bottom padding needed.
 */
export const calculateRelationTokenPadding: TokenPaddingCalculator = (_tokenStore, annotationsPerToken) => {
    const relationsCount = annotationsPerToken.filter(a => a.kind === 'relation').length;

    return [relationsCount ? relationsCount * TOKEN_RELATION_PADDING + RELATION_STROKE_WIDTH + RELATION_NAME_Y_OFFSET : 0, 0];
};

/**
 * Predictions need space under tokens. If a token has more than one
 * prediction, it needs multiple levels of padding for the multiple
 * levels of predictions.
 *
 * @param tokenStore The token store of the token getting
 * the padding levels for.
 * @param annotationsPerToken An array of the annotations that
 * pass through this token.
 * @returns A tuple that indicates the top and bottom padding needed.
 */
export const calculatePredictionTokenPadding: TokenPaddingCalculator = (_tokenStore, annotationsPerToken) => {
    const predictionAnnotations = annotationsPerToken.filter(a => a.kind === 'prediction');
    const maxLevel = predictionAnnotations.reduce((acc, a) => Math.max(acc, a.level ?? 0), 0);
    const padding = calculatePaddingByLevel(predictionAnnotations.length, maxLevel, TOKEN_PREDICTION_Y_PADDING);

    return [padding, padding];
};

/**
 * Calculates the maximum top and bottom padding steps
 * for the given tokens given the padding calculators.
 *
 * For example, for each token, the following is run:
 * - An entity labeling padding calculator returned 3 as the
 *   top padding due to the existence of 3 levels of entities.
 * - A relations padding calculator returned 4 as the top
 *   padding due to the existence of 4 levels of relations.
 * - The returned value for the top padding is then 4.
 *
 * The maximum value of all tokens provided is returned.
 *
 * @param stores The token store underlying this specific token.
 * @param calculators An array of functions that calculate padding levels.
 */
export const calculateMaxTokenPadding = (
    stores: ITokenStore[],
    calculators: TokenPaddingCalculator[],
    annotationsPerTokenMap: Map<number, AnnotationData[]>
): [number, number] => {
    const getMaxTokenPadding = (store: ITokenStore) =>
        calculators.reduce(
            (accumulator, calculator) => {
                const [calculatorPaddingTop, calculatorPaddingBottom] = calculator(store, annotationsPerTokenMap.get(store.index) ?? []);

                return [Math.max(calculatorPaddingTop, accumulator[0]), Math.max(calculatorPaddingBottom, accumulator[1])];
            },
            [0, 0]
        );

    return stores.reduce(
        (accumulator, store) => {
            const [tokenPaddingTop, tokenPaddingBottom] = getMaxTokenPadding(store);

            return [Math.max(tokenPaddingTop, accumulator[0]), Math.max(tokenPaddingBottom, accumulator[1])];
        },
        [0, 0]
    );
};

/**
 * Handles token selection interactions when accessed via
 * a keyboard.
 *
 * @param tokenStore The store backing the token that was pressed.
 * @param lineStore The store backing the line the token exists in.
 * @param event The event that was fired when the user pressed a key.
 * @param selectionStore The store that contains state to control
 * labeler text selection.
 * @returns True if the event was handled in this function and false
 * otherwise.
 */
const tokenRendererSelectionInteractions = <T extends ITokenStore>({
    event,
    lineStore,
    tokenStore,
    selectionStore
}: {
    tokenStore: ITokenStore;
    lineStore: LineStore<T>;
    event: React.KeyboardEvent;
    selectionStore: LabelerSelectionStore;
}) => {
    if (event.key === LabelerKeyCodes.Enter || event.key === LabelerKeyCodes.Space) {
        selectionStore.select(tokenStore.index);

        return true;
    }

    if (event.key === LabelerKeyCodes.ArrowRight || event.key === LabelerKeyCodes.ArrowLeft) {
        const nextTokenIndex = event.key === LabelerKeyCodes.ArrowRight ? tokenStore.index + 1 : tokenStore.index - 1;
        const isOutOfBounds = event.key === LabelerKeyCodes.ArrowRight ? nextTokenIndex >= selectionStore.tokenCount : nextTokenIndex < 0;

        if (isOutOfBounds) {
            return false;
        }

        selectionStore.unHover();

        if (event.shiftKey) {
            /**
             * Start selection at current token if there was
             * no selection in the first place.
             */
            if (!selectionStore.isSelectionInProgress) {
                selectionStore.select(tokenStore.index);
            }

            selectionStore.select(nextTokenIndex);
        } else {
            selectionStore.hover(nextTokenIndex);
        }

        return true;
    }

    if (event.key === LabelerKeyCodes.Home || event.key === LabelerKeyCodes.End) {
        const absoluteIndex = event.key === LabelerKeyCodes.Home ? 0 : selectionStore.tokenCount - 1;
        const firstOrLastTokenInLineIndex = lineStore.tokenRangeIndices[event.key === LabelerKeyCodes.Home ? 0 : 1];

        selectionStore.unHover();

        if (event.shiftKey && event.ctrlKey) {
            selectionStore.select(absoluteIndex);
        } else if (event.shiftKey) {
            selectionStore.select(firstOrLastTokenInLineIndex);
        } else if (event.ctrlKey) {
            selectionStore.hover(absoluteIndex);
        } else {
            selectionStore.hover(firstOrLastTokenInLineIndex);
        }

        return true;
    }

    return false;
};

/**
 * Handles token a11y interactions when accessed via
 * a keyboard. Ensures that the correct tokens are focused based
 * on the current focus state of the labeler.
 *
 * @param tokenStore The store backing the token that was pressed.
 * @param lineStore The store backing the line the token exists in.
 * @param event The event that was fired when the user pressed a key.
 * @param a11yStore The store that contains state to control labeler
 * text a11y focus.
 * @returns True if the event was handled in this function and false
 * otherwise.
 */
const tokenRendererA11yInteractions = <T extends ITokenStore>({
    event,
    a11yStore,
    lineStore
}: {
    tokenStore: ITokenStore;
    lineStore: LineStore<T>;
    event: React.KeyboardEvent;
    a11yStore: LabelerA11yStore;
}) => {
    if (event.key === LabelerKeyCodes.ArrowRight || event.key === LabelerKeyCodes.ArrowLeft) {
        const direction = event.key === LabelerKeyCodes.ArrowRight ? 'next' : 'previous';
        a11yStore.focusTokenByDirection(direction);

        return true;
    }

    if ((event.key === LabelerKeyCodes.ArrowUp || event.key === LabelerKeyCodes.ArrowDown) && event.ctrlKey) {
        const direction = event.key === LabelerKeyCodes.ArrowDown ? 'next' : 'previous';
        a11yStore.focusAnnotationByDirection(direction);

        return true;
    }

    if (event.key === LabelerKeyCodes.Home || event.key === LabelerKeyCodes.End) {
        const direction = event.key === LabelerKeyCodes.Home ? 'first' : 'last';
        const index = lineStore.tokenRangeIndices[event.key === LabelerKeyCodes.Home ? 0 : 1];

        if (event.ctrlKey) {
            a11yStore.focusTokenByDirection(direction);
        } else {
            a11yStore.focusTokenByIndex(index);
        }

        return true;
    }

    if (event.key === LabelerKeyCodes.Escape) {
        a11yStore.focusLineByIndex(lineStore.index);

        return true;
    }
};

/**
 * Creates a factory function that creates an object that contains
 * event listeners for user interactions to be attached on tokens.
 *
 * @param selectionStore The labeling selection store that governs
 * the hover and selection state of the labeler.
 * @param tokenStore The token store of the token that the events
 * will be attached to.
 */
export const getTokenEventListenersFactory = ({
    a11yStore,
    selectionStore
}: {
    a11yStore: LabelerA11yStore;
    selectionStore: LabelerSelectionStore;
}): TokenEventListenersFactory => ({ tokenStore, lineStore }: { tokenStore: ITokenStore; lineStore: LineStore<ITokenStore> }) => ({
    onMouseEnter: () => {
        if (selectionStore.isDragging) {
            selectionStore.select(tokenStore.index);
        } else {
            selectionStore.hover(tokenStore.index);
        }
    },
    onMouseDown: e => {
        e.stopPropagation();
        selectionStore.setIsDragging(true);
        selectionStore.select(tokenStore.index);
    },
    onMouseUp: e => {
        e.stopPropagation();
        selectionStore.setIsDragging(false);
    },
    onMouseLeave: () => {
        selectionStore.unHover();
    },
    onKeyDown: e => {
        selectionStore.setIsDragging(false);

        const isEventConsumedByA11y = tokenRendererA11yInteractions({
            event: e,
            tokenStore,
            a11yStore,
            lineStore
        });
        const isEventConsumedBySelection = tokenRendererSelectionInteractions({ event: e, tokenStore, selectionStore, lineStore });

        if (isEventConsumedBySelection || isEventConsumedByA11y) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
});

/**
 * Get the element that contains the given attribute in the given
 * array of elements or html collection.
 *
 * @param elements The elements that may contain element with the given attribute.
 * @param attribute The attribute to search for.
 * @returns The element that contains the given attribute.
 */
export const getElementWithAttribute = (elements: Element[] | HTMLCollection, attribute: string): Element => {
    for (const element of elements) {
        if (element.hasAttribute(attribute)) {
            return element;
        }
        const childWithAttribute = getElementWithAttribute(element.children, attribute);
        if (childWithAttribute) {
            return childWithAttribute;
        }
    }

    return null;
};
