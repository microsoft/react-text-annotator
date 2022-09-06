/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import { BaseShapeSvgRenderer } from '../../components/svgRenderers/shapes/BaseShapeSvgRenderer';
import { BoxSvgRenderer } from '../../components/svgRenderers/shapes/BoxSvgRenderer';
import { RelationSvgRenderer } from '../../components/svgRenderers/shapes/RelationSvgRenderer';
import { UnderlineSvgRenderer } from '../../components/svgRenderers/shapes/UnderlineSvgRenderer';
import { IKeyedSvgRendererProps, ISvgRenderer, SvgRendererKind } from '../../types/labelerTypes';
import { useLabelerStore } from '../../utils/labelerStoreContext';
import { getSvgRendererKey } from '../../utils/svgUtils';
import styled from 'styled-components';

export type SvgRendererProps = {
    svgRenderersProps: IKeyedSvgRendererProps[];
    onSvgRenderMap?: Map<SvgRendererKind, ISvgRenderer>;
};

const SvgRoot = styled.svg<{ isRtl: boolean; scrollWidth: number; scrollHeight: number }>(props => ({
    top: 0,
    fillOpacity: 0,
    position: 'absolute',
    shapeRendering: 'crispEdges',
    left: props.isRtl ? 'auto' : 0,
    right: props.isRtl ? 0 : 'auto',
    width: !props.scrollWidth ? '100%' : props.scrollWidth,
    height: !props.scrollHeight ? '100%' : props.scrollHeight
}));

const defaultSvgShapeRenderMap: Map<SvgRendererKind, ISvgRenderer> = new Map([
    ['box', props => <BoxSvgRenderer key={getSvgRendererKey(props)} {...props} />],
    ['relation', props => <RelationSvgRenderer key={getSvgRendererKey(props)} {...props} />],
    ['underline', props => <UnderlineSvgRenderer key={getSvgRendererKey(props)} {...props} />]
]);

export const SvgRootRenderer = observer((props: SvgRendererProps) => {
    const { svgRenderersProps, onSvgRenderMap = defaultSvgShapeRenderMap } = props;
    const labelerStore = useLabelerStore();

    const shapes = svgRenderersProps.map(rendererProps => (
        <BaseShapeSvgRenderer key={rendererProps.annotationKey} {...rendererProps}>
            {onSvgRenderMap.get(rendererProps.kind)(rendererProps)}
        </BaseShapeSvgRenderer>
    ));

    const handleMouseDown = React.useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

    return (
        <SvgRoot
            onMouseDown={handleMouseDown}
            isRtl={labelerStore.configStore.isRtl}
            scrollHeight={labelerStore.labelerScrollHeight}
            scrollWidth={labelerStore.labelerScrollWidth}>
            {shapes}
        </SvgRoot>
    );
});
