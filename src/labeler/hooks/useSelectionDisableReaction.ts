/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerConfigStore } from '../stores/LabelerConfigStore';
import { LabelerSelectionStore } from '../stores/LabelerSelectionStore';

/**
 * A simple hook to cancel selection and hover states
 * whenever the selection is disabled flag is true.
 *
 * @param configStore The store that contains the is
 * selection disabled flag.
 * @param selectionStore The store that contains the
 * data that controls the selection state of the labeler.
 */
export const useSelectionDisableReaction = ({
    configStore,
    selectionStore
}: {
    configStore: LabelerConfigStore;
    selectionStore: LabelerSelectionStore;
}) => {
    React.useEffect(() => {
        if (configStore.isSelectionDisabled) {
            selectionStore.unHover();
            selectionStore.cancelSelection();
        }
    }, [configStore.isSelectionDisabled]);
};
