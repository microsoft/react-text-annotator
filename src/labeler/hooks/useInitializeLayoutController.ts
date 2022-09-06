/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerA11yStore } from '../stores/LabelerA11yStore';
import { LabelerAnnotationsStore } from '../stores/LabelerAnnotationsStore';
import { LabelerSelectionStore } from '../stores/LabelerSelectionStore';
import { LineStore } from '../stores/LineStore';
import { ITokenStore } from '../types/labelerTypes';

export const useInitializeLayoutController = <T extends ITokenStore>({
    rootRef,
    a11yStore,
    lineStores,
    selectionStore,
    annotationStore
}: {
    lineStores: LineStore<T>[];
    a11yStore: LabelerA11yStore;
    selectionStore: LabelerSelectionStore;
    annotationStore: LabelerAnnotationsStore;
    rootRef: React.MutableRefObject<HTMLDivElement>;
}) => {
    React.useLayoutEffect(() => {
        if (!rootRef.current) {
            return;
        }

        const tokenCount = lineStores.length ? lineStores[lineStores.length - 1].tokenRangeIndices[1] + 1 : 0;

        annotationStore.initialize(tokenCount);
        selectionStore.initialize(lineStores.length, tokenCount);
        a11yStore.initialize(rootRef.current, lineStores.length, tokenCount);
    }, [rootRef.current, lineStores]);
};
