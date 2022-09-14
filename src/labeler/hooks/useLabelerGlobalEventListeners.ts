/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerSelectionStore } from '../stores/LabelerSelectionStore';
import { GlobalEventExceptionPredicates, TokenToCharMapType } from '../types/labelerTypes';
import { copyKey, selectAllKey } from '../utils/keyboardUtils';
import { bracketDataAttribute, LabelerKeyCodes, tokenDataAttribute } from '../utils/labelerConstants';

export const useLabelerGlobalEventListeners = ({
    text,
    containerRef,
    selectionStore,
    tokenToCharMap,
    globalEventExceptionSelectors
}: {
    text: string;
    tokenToCharMap: TokenToCharMapType;
    selectionStore: LabelerSelectionStore;
    containerRef: React.MutableRefObject<HTMLElement>;
    globalEventExceptionSelectors?: GlobalEventExceptionPredicates;
}) => {
    const keyDownCallback = async (e: KeyboardEvent) => {
        if (globalEventExceptionSelectors?.onKeyDown?.(e)) {
            return;
        }

        let handled = true;

        if (selectionStore.isSelectionInProgress && e.key === LabelerKeyCodes.Escape) {
            selectionStore.cancelSelection();
        } else if (selectionStore.isSelectionInProgress && copyKey(e) && navigator.clipboard) {
            await navigator.clipboard.writeText(
                text.slice(
                    tokenToCharMap.get(selectionStore.selectionStart).startIndex,
                    tokenToCharMap.get(selectionStore.selectionEnd).endIndex + 1
                )
            );
        } else if (selectAllKey(e) && selectionStore.isSelectionInProgress) {
            selectionStore.selectAll();
        } else {
            handled = false;
        }

        if (handled) {
            e.preventDefault();
        }
    };

    const mouseDownCallback = (e: MouseEvent) => {
        if (globalEventExceptionSelectors?.onMouseDown?.(e)) {
            return;
        }

        const clickedElement = <HTMLElement>e.target;
        const isInsideLabeler = containerRef.current?.contains(clickedElement);
        const isToken = clickedElement.hasAttribute(tokenDataAttribute);
        const isBracket = clickedElement.hasAttribute(bracketDataAttribute);

        if (!(isInsideLabeler && (isToken || isBracket))) {
            selectionStore.cancelSelection();
        }
    };

    const mouseWheelCallback = (e: WheelEvent) => {
        if (globalEventExceptionSelectors?.onWheel?.(e)) {
            return;
        }

        if (selectionStore.isSelectionInProgress) {
            selectionStore.cancelSelection();
        }
    };

    React.useEffect(() => {
        document.addEventListener('keydown', keyDownCallback);
        document.addEventListener('wheel', mouseWheelCallback);
        document.addEventListener('mousedown', mouseDownCallback);

        return () => {
            document.removeEventListener('keydown', keyDownCallback);
            document.removeEventListener('wheel', mouseDownCallback);
            document.removeEventListener('mousedown', mouseDownCallback);
        };
    }, [text, containerRef, selectionStore]);
};
