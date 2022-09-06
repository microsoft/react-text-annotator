/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import {
    ArrowheadSvgRenderer,
    ArrowheadSvgRendererProps
} from '../../../components/svgRenderers/utilities/ArrowheadSvgRenderer';
import { MultiLineSvgRenderer } from '../../../components/svgRenderers/utilities/MultiLineSvgRenderer';
import { NameSvgRenderer } from '../../../components/svgRenderers/utilities/NameSvgRenderer';
import { ISvgRenderer, ISvgRendererProps, Point } from '../../../types/labelerTypes';
import { RELATION_NAME_Y_OFFSET, RELATION_STROKE_WIDTH } from '../../../utils/labelerConstants';
import { useLabelerStore } from '../../../utils/labelerStoreContext';
import styled from 'styled-components';

export type RelationSvgRendererProps = ISvgRendererProps & {
    /**
     * Controls whether the arrowhead should be at the start
     * or the end of the line. If `true`, the arrowhead should
     * be draw at the start of the line and vice versa.
     *
     * @default false
     */
    isReversed?: boolean;
};

const RelationRoot = styled.g({ opacity: 0.5, '&:hover': { opacity: 1 } });

const getLongestHorizontalLine = (linePoints: [Point, Point][]) => {
    const getHorizontalDistance = (line: [Point, Point]) => Math.abs(line[0].x - line[1].x);

    return linePoints.reduce(
        (longestLine, currentLine) => (getHorizontalDistance(longestLine) < getHorizontalDistance(currentLine) ? currentLine : longestLine),
        [
            { x: 0, y: 0 },
            { x: 0, y: 0 }
        ]
    );
};

const getArrowDirectionFromLine = (linePoints: [Point, Point]): ArrowheadSvgRendererProps['direction'] => {
    const [startPoint, endPoint] = linePoints;

    if (startPoint.x < endPoint.x) {
        return 'right';
    }
    if (startPoint.x > endPoint.x) {
        return 'left';
    }
    if (startPoint.y > endPoint.y) {
        return 'up';
    }
    return 'down';
};

export const RelationSvgRenderer: ISvgRenderer = observer((props: RelationSvgRendererProps) => {
    const { name, onRenderName, color, isReversed = false, linePoints } = props;
    const { configStore } = useLabelerStore();

    const [longestLineFirstPoint, longestLineSecondPoint] = getLongestHorizontalLine(linePoints);
    const longestLineLeftPoint = longestLineFirstPoint.x < longestLineSecondPoint.x ? longestLineFirstPoint : longestLineSecondPoint;
    const nameWidth = Math.abs(longestLineFirstPoint.x - longestLineSecondPoint.x);

    const [firstPoint, secondPoint] = linePoints[0];
    const [secondLastPoint, lastPoint] = linePoints[linePoints.length - 1];

    const arrowOrigin = isReversed ? firstPoint : lastPoint;
    const arrowDirection = isReversed
        ? getArrowDirectionFromLine([secondPoint, firstPoint])
        : getArrowDirectionFromLine([secondLastPoint, lastPoint]);

    return (
        <RelationRoot>
            <MultiLineSvgRenderer color={color} linePoints={linePoints} strokeWidth={RELATION_STROKE_WIDTH} />

            <ArrowheadSvgRenderer color={color} origin={arrowOrigin} direction={arrowDirection} strokeWidth={RELATION_STROKE_WIDTH} />

            {!configStore.areAnnotationNamesHidden && (
                <NameSvgRenderer
                    name={name}
                    color={color}
                    width={nameWidth}
                    position="middle"
                    onRenderName={onRenderName}
                    yOffset={-RELATION_NAME_Y_OFFSET}
                    topLeftBasePoint={longestLineLeftPoint}
                />
            )}
        </RelationRoot>
    );
});
