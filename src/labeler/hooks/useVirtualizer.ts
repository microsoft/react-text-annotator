/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import debounce from 'lodash.debounce';
import React from 'react';
import { LabelerVirtualizationStore } from '../stores/LabelerVirtualizationStore';
import { AnnotationDomData } from '../types/labelerTypes';
import { isAnnotationWithinIndices, sortAnnotations } from '../utils/annotationUtils';
import { VIRTUALIZATION_RENDER_AHEAD, VIRTUALIZATION_SCROLL_DEBOUNCE } from '../utils/labelerConstants';

/**
 * Gets the Y coordinates of the lines by summating their heights.
 * Read more about this in this article:
 *
 * https://dev.to/adamklein/build-your-own-virtual-scroll-part-i-11ib
 *
 * @param lineHeights An array containing the pixel heights of each line.
 * @returns An array containing the start Y-coordinate of each line.
 */
const getLineYPositions = (lineHeights: number[]) => {
    const results: number[] = [0];

    for (let i = 1; i < lineHeights.length; i++) {
        results.push(results[i - 1] + lineHeights[i]);
    }

    return results;
};

/**
 * Given the current scroll position in the virtual container, this
 * function gets the closest Y-coordinate to that value to get the
 * first visible line to show in the container. Read more about the
 * math of this in this article:
 *
 * https://dev.to/adamklein/build-your-own-virtual-scroll-part-i-11ib
 *
 * @param scrollTop The current scroll top value of the container.
 * @param linePositions The array of line Y-coordinates.
 * @param lineCount The number of lines in the labeler
 * @returns The index of the line to start virtual rendering at.
 */
const findStartLineIndex = (scrollTop: number, linePositions: number[], lineCount: number) => {
    let startRange = 0;
    let endRange = lineCount - 1;

    while (endRange !== startRange) {
        const middle = Math.floor((endRange - startRange) / 2 + startRange);

        if (linePositions[middle] <= scrollTop && linePositions[middle + 1] > scrollTop) {
            return middle;
        }

        if (middle === startRange) {
            return endRange;
        }

        if (linePositions[middle] <= scrollTop) {
            startRange = middle;
        } else {
            endRange = middle;
        }
    }

    return lineCount;
};

/**
 * Gets the ending line index based on the starting line index and
 * the labeler height. Read more about the math of this in this
 * article:
 *
 * https://dev.to/adamklein/build-your-own-virtual-scroll-part-i-11ib
 *
 * @param linePositions The array of line positions.
 * @param startLine The starting line index.
 * @param lineCount The number of lines in the labeler.
 * @param labelerHeight The labeler viewport height.
 * @returns The index of the line to end virtual rendering at.
 */
const findEndLineIndex = (linePositions: number[], startLine: number, lineCount: number, labelerHeight: number) => {
    let endNode;

    for (endNode = startLine; endNode < lineCount; endNode++) {
        if (linePositions[endNode] > linePositions[startLine] + labelerHeight) {
            return endNode;
        }
    }
    return endNode;
};

/**
 * Tracks the scroll top value of the given container. Debounces
 * updates to the scroll value to ensure no unnecessary render cycles
 * hinder performance.
 *
 * @param containerRef The container to track the scroll value for.
 * @returns The vertical scroll offset value for the container.
 */
const useScrollTracker = (containerRef: React.MutableRefObject<HTMLDivElement>) => {
    const [scrollTop, setScrollTop] = React.useState(0);

    const onScroll = React.useCallback(
        debounce((e: WheelEvent) => setScrollTop((e.target as HTMLDivElement).scrollTop), VIRTUALIZATION_SCROLL_DEBOUNCE),
        []
    );

    React.useEffect(() => {
        setScrollTop(containerRef.current.scrollTop);
        containerRef.current.addEventListener('scroll', onScroll);

        return () => containerRef.current.removeEventListener('scroll', onScroll);
    }, [containerRef]);

    return scrollTop;
};

/**
 * Tracks scrolling and annotation changes in the labeler to calculate
 * the start and end line indices of the lines to virtual render in the
 * labeler viewport. Updates the `LabelerVirtualizationStore` with the
 * new line indices whenever a change requiring re-evaluation occurs. It
 * also accounts for the annotations visible in the viewport to expand the
 * virtual rendering line indices to ensure annotations visible in the
 * viewport are rendered correctly.
 *
 * Learn more about this hook in `virtualization.md`.
 *
 * @param containerRef The labeler container.
 * @param isLabelerMounted Whether the labeler was fully mounted or not.
 * @param annotationDomData The current annotations added to the labeler.
 * @param virtualizationStore A store that keeps virtualization state.
 * @param isVirtualizationEnabled Whether the labeler is in virtual
 * rendering mode or not.
 */
export const useVirtualizer = ({
    containerRef,
    isLabelerMounted,
    annotationDomData,
    virtualizationStore,
    isVirtualizationEnabled
}: {
    isLabelerMounted: boolean;
    isVirtualizationEnabled: boolean;
    annotationDomData: AnnotationDomData[];
    virtualizationStore: LabelerVirtualizationStore;
    containerRef: React.MutableRefObject<HTMLDivElement>;
}) => {
    const scrollTop = useScrollTracker(containerRef);

    React.useLayoutEffect(() => {
        if (!isLabelerMounted || !isVirtualizationEnabled || virtualizationStore.lineHeights.length === 0) {
            return;
        }

        const lineCount = virtualizationStore.lineHeights.length;
        const linePositions = getLineYPositions(virtualizationStore.lineHeights);
        const firstVisibleLineIndex = findStartLineIndex(scrollTop, linePositions, lineCount);
        const lastVisibleLineIndex = findEndLineIndex(linePositions, firstVisibleLineIndex, lineCount, containerRef.current.offsetHeight);

        let startLine = Math.max(0, firstVisibleLineIndex - VIRTUALIZATION_RENDER_AHEAD);
        let endLine = Math.min(lineCount - 1, lastVisibleLineIndex + VIRTUALIZATION_RENDER_AHEAD);

        const annotationsInRange = annotationDomData
            .filter(a => isAnnotationWithinIndices(a, startLine, endLine))
            .sort(sortAnnotations('ascending'));

        if (annotationsInRange.length) {
            const firstAnnotation = annotationsInRange[0];
            const firstLineIndex = firstAnnotation.lineSegments[0].lineIndex;
            const lastAnnotation = annotationsInRange[annotationsInRange.length - 1];
            const lastLineIndex = lastAnnotation.lineSegments[lastAnnotation.lineSegments.length - 1].lineIndex;

            if (firstLineIndex < startLine) {
                startLine = firstLineIndex;
            }

            if (lastLineIndex > endLine) {
                endLine = lastLineIndex;
            }
        }

        virtualizationStore.setLines(startLine, endLine);
    }, [isLabelerMounted, isVirtualizationEnabled, scrollTop, virtualizationStore.lineHeights, annotationDomData]);
};
