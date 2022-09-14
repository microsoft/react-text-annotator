/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerA11yStore } from '../stores/LabelerA11yStore';
import { LineStore } from '../stores/LineStore';
import { AnnotationData, AnnotationDomData, AnnotationDomLineData, ITokenStore } from '../types/labelerTypes';
import {
    annotationDataAttribute,
    annotationEndTokenIndexDataAttribute,
    annotationIndexDataAttribute,
    annotationStartTokenIndexDataAttribute,
    LabelerKeyCodes
} from '../utils/labelerConstants';

export const getAnnotationElementByKey = (ref: HTMLElement, annotationKey: string) =>
    ref.querySelector(`[${annotationDataAttribute}][${annotationIndexDataAttribute}="${annotationKey}"]`);

export const getAnnotationElementsByTokenIndex = (ref: HTMLElement, tokenIndex: number): Element[] =>
    Array.from(ref.querySelectorAll(`[${annotationDataAttribute}]`)).filter(
        e =>
            parseInt(e.getAttribute(annotationStartTokenIndexDataAttribute), 10) <= tokenIndex &&
            tokenIndex <= parseInt(e.getAttribute(annotationEndTokenIndexDataAttribute), 10)
    );

export const sortAnnotations = (order: 'ascending' | 'descending') => (a: AnnotationData, b: AnnotationData) => {
    const sortMultiplier = order === 'ascending' ? 1 : -1;

    if (a.startToken < b.startToken) {
        return -1 * sortMultiplier;
    }

    if (a.startToken > b.startToken) {
        return 1 * sortMultiplier;
    }

    if (a.endToken < b.endToken) {
        return -1 * sortMultiplier;
    }

    return 1 * sortMultiplier;
};

export const isAnnotationWithinIndices = (a: AnnotationDomData, startLine: number, endLine: number) => {
    const annotationStartLine = a.lineSegments[0].lineIndex;
    const annotationEndLine = a.lineSegments[a.lineSegments.length - 1].lineIndex;

    return (
        (startLine <= annotationEndLine && annotationEndLine <= endLine) ||
        (startLine <= annotationStartLine && annotationStartLine <= endLine)
    );
};

/**
 * Gets an array of the unique annotations per line which
 * is gathered by aggregating the annotations per token
 * for each token in the line.
 *
 * @param lineStore The line store to get the annotations for.
 * @param annotationsPerTokenMap The annotations per token map.
 * @returns An array of annotations per line.
 */
export const getUniqueAnnotationsPerLine = <T extends ITokenStore>(
    lineStore: LineStore<T>,
    annotationsPerTokenMap: Map<number, AnnotationData[]>
): AnnotationData[] => {
    const annotationsMap = lineStore.tokenStores.reduce((map: Map<string, AnnotationData>, tokenStore) => {
        const annotations = annotationsPerTokenMap.get(tokenStore.index);
        annotations.forEach(a => map.set(a.id, a));

        return map;
    }, new Map<string, AnnotationData>());

    return Array.from(annotationsMap.values()).sort(sortAnnotations('ascending'));
};

/**
 * Reveres the given annotation by swapping its start and
 * end tokens, and setting the reversed flag to true. This
 * is useful for annotations that have a start index that
 * is larger than the end index, since our labeler is built
 * under the assumption of having always having the start
 * index smaller than the end index.
 *
 * @param a The annotation to reverse.
 * @returns The annotation with reversed start and end tokens
 * and the reverse flag set.
 */
export const reverseAnnotation = (a: AnnotationData): AnnotationData =>
    a.startToken > a.endToken ? { ...a, startToken: a.endToken, endToken: a.startToken, isReversed: true } : a;

/**
 * Converts the given annotation data to data augmented
 * with DOM specific data that is essential for renderers
 * to render the final SVG shape for the annotation.
 *
 * Read more about the flow of data in `labeler.md`.
 *
 * @param param0.data The annotation to get the DOM data for.
 * @param param0.lineStores The current line stores in the document.
 * @param param0.onRenderAnnotationColor A factory function that
 * generates a color for the annotation.
 */
export const annotationDataToAnnotationDomData = <T extends ITokenStore>({
    annotation,
    lineStores,
    onRenderAnnotationColor
}: {
    annotation: AnnotationData;
    lineStores: LineStore<T>[];
    onRenderAnnotationColor?: (data: AnnotationData) => string;
}): AnnotationDomData => {
    const startLine = lineStores.find(
        l => l.tokenRangeIndices[0] <= annotation.startToken && annotation.startToken <= l.tokenRangeIndices[1]
    );
    const endLine = lineStores.find(l => l.tokenRangeIndices[0] <= annotation.endToken && annotation.endToken <= l.tokenRangeIndices[1]);
    const lineSegments: AnnotationDomLineData[] = [];

    if (startLine.index === endLine.index) {
        lineSegments.push({ startToken: annotation.startToken, endToken: annotation.endToken, lineIndex: startLine.index });
    } else {
        lineSegments.push({ startToken: annotation.startToken, endToken: startLine.tokenRangeIndices[1], lineIndex: startLine.index });

        for (let i = startLine.index + 1; i < endLine.index; i++) {
            lineSegments.push({
                lineIndex: lineStores[i].index,
                endToken: lineStores[i].tokenRangeIndices[1],
                startToken: lineStores[i].tokenRangeIndices[0]
            });
        }

        lineSegments.push({ startToken: endLine.tokenRangeIndices[0], endToken: annotation.endToken, lineIndex: endLine.index });
    }

    return { ...annotation, color: onRenderAnnotationColor?.(annotation) ?? annotation.color, lineSegments };
};

/**
 * A handler function for when an annotation is focused and
 * a key is pressed.
 *
 * @param event The event fired when the user pressed a key.
 * @param a11yStore The store that controls the state for
 * a11y focus.
 */
export const onAnnotationKeyDown = ({ event, a11yStore }: { a11yStore: LabelerA11yStore; event: React.KeyboardEvent }) => {
    let isHandled: boolean = true;

    if (event.key === LabelerKeyCodes.ArrowUp || event.key === LabelerKeyCodes.ArrowDown) {
        const direction = event.key === LabelerKeyCodes.ArrowDown ? 'next' : 'previous';

        if (event.ctrlKey) {
            a11yStore.focusAnnotationByDirection(direction);
        } else {
            a11yStore.blurCurrentAnnotation();
            a11yStore.focusLineByDirection(direction);
        }
    } else if (event.key === LabelerKeyCodes.Home || event.key === LabelerKeyCodes.End) {
        const direction = event.key === LabelerKeyCodes.Home ? 'first' : 'last';
        a11yStore.focusAnnotationByDirection(direction);
    } else if (event.key === LabelerKeyCodes.ArrowRight || event.key === LabelerKeyCodes.ArrowLeft) {
        const direction = event.key === LabelerKeyCodes.ArrowRight ? 'next' : 'previous';
        a11yStore.blurCurrentAnnotation();
        a11yStore.focusTokenByDirection(direction);
    } else if (event.key === LabelerKeyCodes.Escape) {
        a11yStore.blurCurrentAnnotation();
        a11yStore.focusLineByIndex(a11yStore.focusedLineIndex);
    } else {
        isHandled = false;
    }

    if (isHandled) {
        event.stopPropagation();
        event.preventDefault();
    }
};

/**
 * Get the new token range of an annotation after resizing.
 *
 * @param annotation The resized annotation.
 * @param knob The position of the dragged knob.
 * @param tokenIndex The index of the last token after dragging.
 * @returns The new token range: startIndex and endIndex, and the new knob position.
 */

export const getAnnotationTokenRangeAfterResizing = (
    annotation: AnnotationData,
    knob: 'start' | 'end',
    tokenIndex: number
): {
    endIndex: number;
    startIndex: number;
    knob: 'start' | 'end';
} => {
    if (knob === 'start') {
        if (tokenIndex > annotation.endToken) {
            return { knob: 'end', endIndex: tokenIndex, startIndex: annotation.startToken };
        }
        return { knob, startIndex: tokenIndex, endIndex: annotation.endToken };
    }
    if (knob === 'end') {
        if (tokenIndex < annotation.startToken) {
            return { knob: 'start', startIndex: tokenIndex, endIndex: annotation.endToken };
        }
        return { knob, endIndex: tokenIndex, startIndex: annotation.startToken };
    }
};
