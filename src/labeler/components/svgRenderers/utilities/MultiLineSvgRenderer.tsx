/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { Point } from '../../../types/labelerTypes';

export type MultiLineSvgRendererProps = {
    color: string;
    strokeWidth: string | number;
    linePoints: [Point, Point][];
    strokeDasharray?: string | number;
    strokeLinecap?: 'butt' | 'round' | 'square' | 'inherit';
};

export const MultiLineSvgRenderer = (props: MultiLineSvgRendererProps) => {
    const { color, strokeWidth, strokeLinecap = 'round', linePoints, strokeDasharray } = props;

    return (
        <>
            {linePoints.map((points, index) => (
                <polyline
                    key={index}
                    fill={color}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap={strokeLinecap}
                    strokeDasharray={strokeDasharray}
                    points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
                />
            ))}
        </>
    );
};
