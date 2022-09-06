/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { RelationSvgRendererProps } from '../components/svgRenderers/shapes/RelationSvgRenderer';
import { UnderlineSvgRendererProps } from '../components/svgRenderers/shapes/UnderlineSvgRenderer';
import { LineStore } from '../stores/LineStore';
import { labelerTheme } from '../theming/labelerTheme';
import {
    AnnotationData,
    AnnotationDomData,
    AnnotationDomLineData,
    ISvgRendererProps,
    ISvgRendererPropsFactory,
    ITokenStore,
    Point
} from '../types/labelerTypes';
import { getUniqueAnnotationsPerLine } from '../utils/annotationUtils';
import {
    LABELER_HORIZONTAL_PADDING,
    TOKEN_PREDICTION_Y_PADDING,
    TOKEN_RELATION_PADDING,
    TOKEN_UNDERLINE_PADDING
} from '../utils/labelerConstants';

export const getSvgRendererKey = (props: ISvgRendererProps): string =>
    `${props.name}_${props.kind}_${props.color}_${props.linePoints[0][0].x}_${props.linePoints[0][0].y}`;

const toSvgRenderProps = (
    kind: string,
    isRtl: boolean,
    data: AnnotationDomData,
    linePoints: [Point, Point][],
    strokeStyle: 'dashed' | 'solid' = 'solid'
): UnderlineSvgRendererProps | RelationSvgRendererProps => ({
    kind,
    linePoints,
    strokeStyle,
    name: data.name,
    opacity: data.opacity,
    onClick: data.onClick,
    onResize: data.onResize,
    endToken: data.endToken,
    isReversed: data.isReversed,
    startToken: data.startToken,
    namePosition: isRtl ? 'end' : 'start',
    isResizingEnabled: data.isResizingEnabled,
    startLine: data.lineSegments[0].lineIndex,
    color: data.color ?? labelerTheme.annotation.defaultColor,
    endLine: data.lineSegments[data.lineSegments.length - 1].lineIndex
});

/**
 * Creates the required SVG properties to render a label
 * or a negative label based on the label annotation passed
 * in the parameters.
 *
 * Read more about how this function works in `svgUtils.md`.
 *
 * @param param0.data The relation annotation data.
 * @param param0.scrollOffset The offset due to scrolling in the main container.
 * @param param0.containerCoordinates The x and y coordinates of the root container.
 * @param param0.getTokenElementByIndex A helper function to get a token HTML
 * element by a given index.
 */
export const labelAnnotationToSvgPropsFactory: ISvgRendererPropsFactory = ({
    data,
    isRtl,
    scrollOffset,
    containerCoordinates,
    getTokenElementByIndex
}): UnderlineSvgRendererProps => {
    const linePoints: [Point, Point][] = [];
    const labelLevel = (data.level ?? 0) * TOKEN_UNDERLINE_PADDING;
    const containerOffset: Point = { x: scrollOffset.x - containerCoordinates.x, y: scrollOffset.y - containerCoordinates.y };

    const getLinePointsForRects = (startRect: DOMRect, endRect: DOMRect): [Point, Point] => {
        const rtlSafeStartRect = isRtl ? endRect : startRect;
        const rtlSafeEndRect = isRtl ? startRect : endRect;
        const yOffset = containerOffset.y + labelLevel;

        return [
            { x: rtlSafeStartRect.left + containerOffset.x, y: rtlSafeStartRect.bottom + yOffset },
            { x: rtlSafeEndRect.right + containerOffset.x, y: rtlSafeStartRect.bottom + yOffset }
        ];
    };

    for (const iThLine of data.lineSegments) {
        const ithLineFirstTokenRect = getTokenElementByIndex(iThLine.startToken).getBoundingClientRect();
        const ithLineLastTokenRect = getTokenElementByIndex(iThLine.endToken).getBoundingClientRect();

        linePoints.push(getLinePointsForRects(ithLineFirstTokenRect, ithLineLastTokenRect));
    }

    return toSvgRenderProps('underline', isRtl, data, linePoints, data.kind === 'negativeLabel' ? 'dashed' : 'solid');
};

/**
 * Gets the level at which the relation svg line should be
 * rendered when it passes through the text line represented
 * by the line store.
 *
 * This is useful when you have multiple intersecting relations
 * to ensure that each of the intersecting relations appear on
 * a different line.
 *
 * Read `svgUtils.md` for more information.
 *
 * @param lineStore The line store of the line that the current
 * relation is passing through.
 * @param relationData The annotation data of the relation that
 * is being rendered.
 * @param annotationsPerTokenMap A map of annotations array that
 * pass through per each token.
 */
const getRelationLevel = (
    relationData: AnnotationData,
    lineStore: LineStore<ITokenStore>,
    annotationsPerTokenMap: Map<number, AnnotationData[]>
) => {
    const [lineStartIndex, lineEndIndex] = lineStore.tokenRangeIndices;
    const annotations = getUniqueAnnotationsPerLine(lineStore, annotationsPerTokenMap).filter(a => a.kind === 'relation');
    const relationLevels: boolean[][] = Array(lineStore.tokenStores.length)
        .fill(null)
        .map(() => Array(annotations.length).fill(false));

    for (const annotation of annotations) {
        const annotationStartToken = Math.max(annotation.startToken, lineStartIndex) - lineStartIndex;
        const annotationEndToken = Math.min(annotation.endToken, lineEndIndex) - lineStartIndex;

        if (relationData.id === annotation.id) {
            const relationStartToken = Math.max(relationData.startToken, lineStartIndex) - lineStartIndex;

            return relationLevels[relationStartToken].findIndex(b => !b) + 1;
        }

        const relationLevelToOccupy = relationLevels[annotationStartToken].findIndex(b => !b);

        for (let j = annotationStartToken; j <= annotationEndToken; j++) {
            relationLevels[j][relationLevelToOccupy] = true;
        }
    }
};

/**
 * Creates the required SVG properties to render a relation
 * arrow based on the annotation passed in the parameters.
 *
 * Read more about how this function works in `svgUtils.md`.
 *
 * @param data The relation annotation data.
 * @param lineStores The line stores that contain the line data.
 * @param scrollOffset The offset due to scrolling in the main container.
 * @param containerCoordinates The x and y coordinates of the root container.
 * @param getTokenElementByIndex A helper function to get a token HTML
 * element by a given index.
 * @param annotationsPerTokenMap A map of annotations array that pass through
 * per each token.
 */
export const relationAnnotationToSvgPropsFactory: ISvgRendererPropsFactory = ({
    data,
    isRtl,
    lineStores,
    scrollOffset,
    containerCoordinates,
    annotationsPerTokenMap,
    getTokenElementByIndex
}): RelationSvgRendererProps => {
    const linePoints: [Point, Point][] = [];
    const containerOffset: Point = { x: scrollOffset.x - containerCoordinates.x, y: scrollOffset.y - containerCoordinates.y };

    const firstLineSegment = data.lineSegments[0];
    const firstLineStore = lineStores[firstLineSegment.lineIndex];
    const firstTokenRect = getTokenElementByIndex(firstLineSegment.startToken).getBoundingClientRect();
    const firstLineLevelOffset = getRelationLevel(data, firstLineStore, annotationsPerTokenMap) * TOKEN_RELATION_PADDING;

    const lastLineSegment = data.lineSegments[data.lineSegments.length - 1];
    const lastLineStore = lineStores[lastLineSegment.lineIndex];

    if (data.lineSegments.length === 1) {
        const endTokenRect = getTokenElementByIndex(firstLineSegment.endToken).getBoundingClientRect();

        linePoints.push(
            [
                { x: firstTokenRect.left + containerOffset.x, y: firstTokenRect.top + containerOffset.y },
                { x: firstTokenRect.left + containerOffset.x, y: firstTokenRect.top + containerOffset.y - firstLineLevelOffset }
            ],
            [
                { x: firstTokenRect.left + containerOffset.x, y: firstTokenRect.top + containerOffset.y - firstLineLevelOffset },
                { x: endTokenRect.left + containerOffset.x, y: endTokenRect.top + containerOffset.y - firstLineLevelOffset }
            ],
            [
                { x: endTokenRect.left + containerOffset.x, y: endTokenRect.top + containerOffset.y - firstLineLevelOffset },
                { x: endTokenRect.left + containerOffset.x, y: endTokenRect.top + containerOffset.y }
            ]
        );
    } else {
        const firstTokenInFirstLineRect = getTokenElementByIndex(firstLineStore.tokenRangeIndices[0]).getBoundingClientRect();
        const lastTokenInFirstLineRect = getTokenElementByIndex(firstLineStore.tokenRangeIndices[1]).getBoundingClientRect();
        const lastTokenInLastLineRect = getTokenElementByIndex(lastLineSegment.endToken).getBoundingClientRect();

        const lastLineLevelOffset = getRelationLevel(data, lastLineStore, annotationsPerTokenMap) * TOKEN_RELATION_PADDING;

        const firstLineDistanceToLeftmostToken = Math.abs(firstLineSegment.startToken - firstLineStore.tokenRangeIndices[0]);
        const firstLineDistanceToRightmostToken = Math.abs(firstLineSegment.startToken - firstLineStore.tokenRangeIndices[1]);
        const lastLineDistanceToLeftmostToken = Math.abs(lastLineSegment.endToken - lastLineStore.tokenRangeIndices[0]);
        const lastLineDistanceToRightmostToken = Math.abs(lastLineSegment.endToken - lastLineStore.tokenRangeIndices[1]);

        const totalDistanceRight = firstLineDistanceToRightmostToken + lastLineDistanceToRightmostToken;
        const totalDistanceLeft = firstLineDistanceToLeftmostToken + lastLineDistanceToLeftmostToken;

        const directionToDraw = totalDistanceLeft < totalDistanceRight ? 'left' : 'right';
        const directionalX =
            directionToDraw === 'left'
                ? firstTokenInFirstLineRect.left + containerOffset.x - LABELER_HORIZONTAL_PADDING / 2
                : lastTokenInFirstLineRect.right + containerOffset.x + LABELER_HORIZONTAL_PADDING / 2;

        linePoints.push(
            [
                { x: firstTokenRect.left + containerOffset.x, y: firstTokenRect.top + containerOffset.y },
                { x: firstTokenRect.left + containerOffset.x, y: firstTokenRect.top + containerOffset.y - firstLineLevelOffset }
            ],
            [
                { x: firstTokenRect.left + containerOffset.x, y: firstTokenRect.top + containerOffset.y - firstLineLevelOffset },
                { x: directionalX, y: firstTokenRect.top + containerOffset.y - firstLineLevelOffset }
            ],
            [
                { x: directionalX, y: firstTokenRect.top + containerOffset.y - firstLineLevelOffset },
                { x: directionalX, y: lastTokenInLastLineRect.top + containerOffset.y - lastLineLevelOffset }
            ],
            [
                { x: directionalX, y: lastTokenInLastLineRect.top + containerOffset.y - lastLineLevelOffset },
                {
                    x: lastTokenInLastLineRect.left + containerOffset.x,
                    y: lastTokenInLastLineRect.top + containerOffset.y - lastLineLevelOffset
                }
            ],
            [
                {
                    x: lastTokenInLastLineRect.left + containerOffset.x,
                    y: lastTokenInLastLineRect.top + containerOffset.y - lastLineLevelOffset
                },
                { x: lastTokenInLastLineRect.left + containerOffset.x, y: lastTokenInLastLineRect.top + containerOffset.y }
            ]
        );
    }

    return toSvgRenderProps('relation', isRtl, data, linePoints);
};

/**
 * Creates the required SVG properties to render a prediction
 * based on the label annotation passed in the parameters.
 *
 * Read more about how this function works in `svgUtils.md`.
 *
 * @param param0.data The relation annotation data.
 * @param param0.scrollOffset The offset due to scrolling in the main container.
 * @param param0.containerCoordinates The x and y coordinates of the root container.
 * @param param0.getTokenElementByIndex A helper function to get a token HTML
 * element by a given index.
 */
export const predictionAnnotationToSvgPropsFactory: ISvgRendererPropsFactory = ({
    data,
    isRtl,
    scrollOffset,
    containerCoordinates,
    getTokenElementByIndex
}): ISvgRendererProps => {
    const linePoints: [Point, Point][] = [];
    const predictionLevel = (data.level ?? 0) * TOKEN_PREDICTION_Y_PADDING;
    const containerOffset: Point = { x: scrollOffset.x - containerCoordinates.x, y: scrollOffset.y - containerCoordinates.y };

    const getHorizontalLinePointsForLineSegment = (line: AnnotationDomLineData): [Point, Point][] => {
        const startRect = getTokenElementByIndex(line.startToken).getBoundingClientRect();
        const endRect = getTokenElementByIndex(line.endToken).getBoundingClientRect();

        return [
            [
                {
                    x: startRect.left + containerOffset.x,
                    y: startRect.top + containerOffset.y - predictionLevel
                },
                {
                    x: endRect.right + containerOffset.x,
                    y: endRect.top + containerOffset.y - predictionLevel
                }
            ],
            [
                {
                    x: startRect.left + containerOffset.x,
                    y: startRect.bottom + containerOffset.y + predictionLevel
                },
                {
                    x: endRect.right + containerOffset.x,
                    y: endRect.bottom + containerOffset.y + predictionLevel
                }
            ]
        ];
    };

    const getVerticalLinePointsFromHorizontalLines = (horizontalLinePoints: [Point, Point][]): [Point, Point][] => [
        [
            { x: horizontalLinePoints[0][0].x, y: horizontalLinePoints[0][0].y },
            { x: horizontalLinePoints[0][0].x, y: horizontalLinePoints[1][0].y }
        ],
        [
            {
                x: horizontalLinePoints[horizontalLinePoints.length - 1][1].x,
                y: horizontalLinePoints[horizontalLinePoints.length - 1][1].y
            },
            {
                x: horizontalLinePoints[horizontalLinePoints.length - 1][1].x,
                y: horizontalLinePoints[horizontalLinePoints.length - 2][1].y
            }
        ]
    ];

    for (const iThLine of data.lineSegments) {
        linePoints.push(...getHorizontalLinePointsForLineSegment(iThLine));
    }

    linePoints.push(...getVerticalLinePointsFromHorizontalLines(linePoints));

    return toSvgRenderProps('box', isRtl, data, linePoints);
};
