/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerStore } from '../stores/LabelerStore';
import { getMaxLineWidthAndSvgXOffset } from '../utils/lineUtils';

/**
 * This hook is used to update the scroll width of the labeler when
 * the virtualization is enabled and while scrolling, that's to keep the
 * max width of the labeler lines.
 *
 * @param rootRef The reference of the labeler Dom element.
 * @param labelerStore The utility store of the labeler.
 */
export const useLabelerDimensionsSetterAfterScrolling = ({
    rootRef,
    labelerStore
}: {
    labelerStore: LabelerStore;
    rootRef: React.MutableRefObject<HTMLDivElement>;
}) => {
    const { isMounted, configStore, virtualizationStore } = labelerStore;

    React.useEffect(() => {
        if (isMounted) {
            const { maxLineWidth, svgXOffset } = getMaxLineWidthAndSvgXOffset(rootRef.current, configStore.isRtl);
            labelerStore.setLabelerDimensionsAfterScrolling(maxLineWidth, svgXOffset);
        }
    }, [
        isMounted,
        configStore.isRtl,
        virtualizationStore?.endingLine,
        configStore.enableVirtualization,
        virtualizationStore?.startingLine
    ]);
};
