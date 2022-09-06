/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import { MultiLineSvgRenderer } from '../../../components/svgRenderers/utilities/MultiLineSvgRenderer';
import { NameSvgRenderer } from '../../../components/svgRenderers/utilities/NameSvgRenderer';
import { ResizeKnobsSvgRenderer } from '../../../components/svgRenderers/utilities/ResizeKnobsSvgRenderer';
import { ISvgRenderer, ISvgRendererProps, Point } from '../../../types/labelerTypes';
import { PREDICTION_NAME_Y_OFFSET, PREDICTION_STROKE_WIDTH } from '../../../utils/labelerConstants';
import { useLabelerStore } from '../../../utils/labelerStoreContext';

const getBoxNameOriginPointAndWidth = (boxPoints: [Point, Point][], isRtl: boolean) => {
    const [firstLine] = boxPoints.filter(l => l[0].y === l[1].y).sort((a, b) => (a[0].y < b[0].y ? -1 : 1));

    return {
        nameOriginPoint: { x: firstLine[isRtl ? 1 : 0].x, y: firstLine[0].y - PREDICTION_NAME_Y_OFFSET },
        nameWidth: Math.abs(firstLine[1].x - firstLine[0].x)
    };
};

const getBoxKnobCoordinates = (
    boxPoints: [Point, Point][],
    isRtl: boolean
): [{ point: Point; position: 'start' | 'end' }, { point: Point; position: 'start' | 'end' }] => {
    const [firstLine, lastLine] = boxPoints
        .filter(l => l[0].x === l[1].x)
        .sort((a, b) => {
            if (Math.max(a[0].y, a[1].y) < Math.min(b[0].y, b[1].y)) {
                return -1;
            }
            if (Math.min(a[0].y, a[1].y) > Math.max(b[0].y, b[1].y)) {
                return 1;
            }

            if (a[0].x < b[0].x) {
                return isRtl ? 1 : -1;
            }

            return isRtl ? -1 : 1;
        });

    return [
        { point: { x: firstLine[0].x, y: Math.min(firstLine[0].y, firstLine[1].y) }, position: 'start' },
        { point: { x: lastLine[0].x, y: Math.max(lastLine[0].y, lastLine[1].y) }, position: 'end' }
    ];
};

export const BoxSvgRenderer: ISvgRenderer = observer((props: ISvgRendererProps) => {
    const { name, onRenderName, isResizingEnabled, color, namePosition, linePoints, onResize } = props;
    const { configStore } = useLabelerStore();

    const { nameOriginPoint, nameWidth } = getBoxNameOriginPointAndWidth(linePoints, configStore.isRtl);
    const knobCoordinates = getBoxKnobCoordinates(linePoints, configStore.isRtl);

    return (
        <>
            <MultiLineSvgRenderer color={color} linePoints={linePoints} strokeDasharray="2,2" strokeWidth={PREDICTION_STROKE_WIDTH} />

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
