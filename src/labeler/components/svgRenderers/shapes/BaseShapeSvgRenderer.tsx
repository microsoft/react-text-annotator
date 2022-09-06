/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import { TooltipRenderer } from '../../../components/svgRenderers/utilities/TooltipRenderer';
import { IKeyedSvgRendererProps } from '../../../types/labelerTypes';
import { onAnnotationKeyDown } from '../../../utils/annotationUtils';
import {
    annotationDataAttribute,
    annotationEndLineIndexDataAttribute,
    annotationEndTokenIndexDataAttribute,
    annotationIndexDataAttribute,
    annotationStartLineIndexDataAttribute,
    annotationStartTokenIndexDataAttribute
} from '../../../utils/labelerConstants';
import { useLabelerStore } from '../../../utils/labelerStoreContext';

export const BaseShapeSvgRenderer = observer((props: React.PropsWithChildren<IKeyedSvgRendererProps>) => {
    const { annotationKey, startToken, startLine, endToken, endLine, children, onClick, opacity = 1, isClickable, onRenderTooltip } = props;
    const { a11yStore, configStore } = useLabelerStore();
    const [toolTipData, setTooltipData] = React.useState<{ isVisible: boolean; x: number; y: number }>(null);

    const cursorType = isClickable && configStore.areAnnotationsClickable ? 'pointer' : 'default';

    const annotationDataAttributes = {
        [annotationDataAttribute]: true,
        [annotationIndexDataAttribute]: annotationKey,
        [annotationEndLineIndexDataAttribute]: endLine,
        [annotationEndTokenIndexDataAttribute]: endToken,
        [annotationStartLineIndexDataAttribute]: startLine,
        [annotationStartTokenIndexDataAttribute]: startToken
    };

    const handleAnnotationClick = React.useCallback(
        (event: React.MouseEvent<SVGElement, MouseEvent>) => {
            handleAnnotationUnHover();
            if (isClickable && configStore.areAnnotationsClickable) {
                onClick(event);
            }
        },
        [onClick]
    );

    const handleAnnotationHover = React.useCallback((event: React.MouseEvent<SVGElement, MouseEvent>) => {
        setTooltipData({ isVisible: true, x: event.clientX, y: event.clientY });
    }, []);

    const handleAnnotationUnHover = React.useCallback(() => {
        setTooltipData({ ...toolTipData, isVisible: false });
    }, []);

    return (
        <g
            style={{ opacity }}
            cursor={cursorType}
            {...annotationDataAttributes}
            onClick={handleAnnotationClick}
            onMouseOver={handleAnnotationHover}
            onMouseLeave={handleAnnotationUnHover}
            onKeyDown={event => onAnnotationKeyDown({ event, a11yStore })}>
            {children}
            {toolTipData?.isVisible && onRenderTooltip && (
                <TooltipRenderer onRenderTooltip={onRenderTooltip} x={toolTipData.x} y={toolTipData.y} />
            )}
        </g>
    );
});
