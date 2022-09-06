/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import { MultiLineSvgRenderer } from '../../../components/svgRenderers/utilities/MultiLineSvgRenderer';
import { NameSvgRenderer } from '../../../components/svgRenderers/utilities/NameSvgRenderer';
import { ResizeKnobsSvgRenderer } from '../../../components/svgRenderers/utilities/ResizeKnobsSvgRenderer';
import { ISvgRenderer, ISvgRendererProps, Point, Position } from '../../../types/labelerTypes';
import { RESIZE_HANDLE_X_OFFSET, UNDERLINE_NAME_Y_OFFSET, UNDERLINE_STROKE_WIDTH } from '../../../utils/labelerConstants';
import { useLabelerStore } from '../../../utils/labelerStoreContext';

export type UnderlineSvgRendererProps = ISvgRendererProps & {
    namePosition?: Position;
    strokeStyle?: 'solid' | 'dashed';
};

export const UnderlineSvgRenderer: ISvgRenderer = observer((props: UnderlineSvgRendererProps) => {
    const { name, onRenderName, isResizingEnabled, color, namePosition = 'start', linePoints, strokeStyle = 'solid', onResize } = props;
    const { configStore } = useLabelerStore();

    const [firstPoint, secondPoint] = linePoints[0];
    const [beforeLastPoint, lastPoint] = linePoints[linePoints.length - 1];
    const nameWidth = Math.abs(secondPoint.x - firstPoint.x);

    const nameOriginPoint: Point = { x: firstPoint.x, y: firstPoint.y + UNDERLINE_NAME_Y_OFFSET };
    const knobCoordinates: [{ point: Point; position: 'start' | 'end' }, { point: Point; position: 'start' | 'end' }] = [
        {
            point: { x: configStore.isRtl ? beforeLastPoint.x : lastPoint.x - RESIZE_HANDLE_X_OFFSET, y: lastPoint.y },
            position: 'end'
        },
        {
            point: { x: configStore.isRtl ? secondPoint.x : firstPoint.x + RESIZE_HANDLE_X_OFFSET, y: firstPoint.y },
            position: 'start'
        }
    ];

    return (
        <>
            <MultiLineSvgRenderer
                color={color}
                strokeLinecap="butt"
                linePoints={linePoints}
                strokeWidth={UNDERLINE_STROKE_WIDTH}
                strokeDasharray={strokeStyle === 'dashed' ? '2,2' : undefined}
            />

            <ResizeKnobsSvgRenderer
                color={color}
                onHandlesKeydown={onResize}
                coordinates={knobCoordinates}
                isResizingEnabled={isResizingEnabled}
            />

            {!configStore.areAnnotationNamesHidden && (
                <NameSvgRenderer
                    name={name}
                    color={color}
                    width={nameWidth}
                    position={namePosition}
                    onRenderName={onRenderName}
                    topLeftBasePoint={nameOriginPoint}
                />
            )}
        </>
    );
});
