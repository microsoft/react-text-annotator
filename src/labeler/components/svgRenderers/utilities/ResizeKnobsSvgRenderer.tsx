/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import { noopUndefined, Point } from '../../../types/labelerTypes';
import { RESIZE_HANDLE_SIZE_LARGE } from '../../../utils/labelerConstants';
import { useLabelerStore } from '../../../utils/labelerStoreContext';
import styled from 'styled-components';

export type ResizeHandlersSvgRendererProps = {
    color: string;
    isResizingEnabled?: boolean;
    onHandlesKeydown?: (knobPosition: 'start' | 'end') => void;
    coordinates: [{ point: Point; position: 'start' | 'end' }, { point: Point; position: 'start' | 'end' }];
};

const ResizeKnobRect = styled.rect({
    fillOpacity: 1,
    strokeWidth: 0,
    pointerEvents: 'all'
});

export const ResizeKnobsSvgRenderer = observer((props: ResizeHandlersSvgRendererProps) => {
    const { coordinates, color, isResizingEnabled = true, onHandlesKeydown = noopUndefined } = props;

    const { configStore } = useLabelerStore();

    const isKnobResizingEnabled = configStore.isAnnotationResizingEnabled && isResizingEnabled;

    const cursor = isKnobResizingEnabled ? 'pointer' : 'default';

    return (
        <g>
            {coordinates.map((knobCoordinate, index: number) => {
                const knobOrigin: Point = {
                    x: knobCoordinate.point.x - RESIZE_HANDLE_SIZE_LARGE / 2,
                    y: knobCoordinate.point.y - RESIZE_HANDLE_SIZE_LARGE / 2
                };

                const rectTransformOriginPoint: Point = {
                    x: knobCoordinate.point.x + RESIZE_HANDLE_SIZE_LARGE / 2,
                    y: knobCoordinate.point.y + RESIZE_HANDLE_SIZE_LARGE / 2
                };

                return (
                    <g
                        key={`resize-knob-${index}`}
                        onMouseDown={() => {
                            if (isKnobResizingEnabled) {
                                onHandlesKeydown(knobCoordinate.position);
                            }
                        }}>
                        <ResizeKnobRect
                            fill={color}
                            x={knobOrigin.x}
                            y={knobOrigin.y}
                            width={RESIZE_HANDLE_SIZE_LARGE}
                            height={RESIZE_HANDLE_SIZE_LARGE}
                            style={{ cursor, transformOrigin: `${knobCoordinate.point.x}px ${knobCoordinate.point.y}px` }}
                        />

                        <rect
                            fillOpacity={0}
                            width={2 * RESIZE_HANDLE_SIZE_LARGE}
                            height={2 * RESIZE_HANDLE_SIZE_LARGE}
                            x={knobOrigin.x - RESIZE_HANDLE_SIZE_LARGE / 2}
                            y={knobOrigin.y - RESIZE_HANDLE_SIZE_LARGE / 2}
                            style={{
                                cursor,
                                pointerEvents: 'all',
                                transformOrigin: `${rectTransformOriginPoint.x}px ${rectTransformOriginPoint.y}px`
                            }}
                        />
                    </g>
                );
            })}
        </g>
    );
});
