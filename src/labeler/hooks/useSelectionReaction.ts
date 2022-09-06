/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { reaction } from 'mobx';
import * as React from 'react';
import { LabelerSelectionStore } from '../stores/LabelerSelectionStore';
import { getNewLabelerTokenElementByIndex } from '../utils/tokenUtils';

/**
 * Creates a side effect to react whenever the selection state
 * changes to inform the user of the labeler that selection
 * has changed. Note that the callback is passed only when the
 * user has finished "dragging" the mouse to avoid many calls to
 * the callback.
 *
 * @param selectionStore The store that contains the selection state.
 * @param onSelectionChange A callback to fire when selection changes.
 */
export const useSelectionReaction = (
    selectionStore: LabelerSelectionStore,
    rootRef: React.MutableRefObject<HTMLDivElement>,
    onSelectionChange: (selectionStart: number, selectionEnd: number, targets: { start: Element; end: Element }) => void
) => {
    React.useEffect(
        () =>
            reaction(
                () => ({
                    isDragging: selectionStore.isDragging,
                    selectionEnd: selectionStore.selectionEnd,
                    selectionStart: selectionStore.selectionStart,
                    isSelectionInProgress: selectionStore.isSelectionInProgress
                }),
                data => {
                    if (data.isSelectionInProgress && !data.isDragging) {
                        onSelectionChange(data.selectionStart, data.selectionEnd, {
                            end: getNewLabelerTokenElementByIndex(rootRef.current, data.selectionEnd),
                            start: getNewLabelerTokenElementByIndex(rootRef.current, data.selectionStart)
                        });
                    }
                }
            ),
        [onSelectionChange]
    );
};
