/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { Point } from '../../../types/labelerTypes';

export type Direction = 'up' | 'down' | 'right' | 'left';

export type ArrowheadSvgRendererProps = {
    origin: Point;
    color: string;
    strokeWidth: number;
    direction: Direction;
};

/**
 * Since we render the points to draw the arrow pointing down
 * by default, this function applies the correct rotation angle
 * to have the arrow point the given direction.
 *
 * @param direction The direction to point the arrow to.
 */
const getRotationAngleFromDirection = (direction: Direction) => {
    switch (direction) {
        case 'up':
            return 180;
        case 'right':
            return 270;
        case 'left':
            return 90;
        case 'down':
        default:
            return 0;
    }
};

export const ArrowheadSvgRenderer = (props: ArrowheadSvgRendererProps) => {
    const { origin, direction, color, strokeWidth } = props;

    const arrowWidth = 5;
    const arrowHeight = 5;
    const linePoints = `${origin.x + arrowWidth},${origin.y - arrowHeight} ${origin.x},${origin.y} ${origin.x - arrowWidth}
    ,${origin.y - arrowHeight}`;

    return (
        <polyline
            stroke={color}
            points={linePoints}
            strokeLinecap="round"
            strokeWidth={strokeWidth}
            transform={`rotate(${getRotationAngleFromDirection(direction)}, ${origin.x}, ${origin.y})`}
        />
    );
};
