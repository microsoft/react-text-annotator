/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import { RTL_ANNOTATION_X_OFFSET } from '../../utils/labelerConstants';
import { SvgRootRenderer } from '../../components/svgRenderers/SvgRootRenderer';
import { LineStore } from '../../stores/LineStore';
import {
    AnnotationDomData,
    AnnotationKind,
    IKeyedSvgRendererProps,
    ISvgRenderer,
    ISvgRendererPropsFactory,
    ITokenStore,
    SvgRendererKind
} from '../../types/labelerTypes';
import { isAnnotationWithinIndices, sortAnnotations } from '../../utils/annotationUtils';
import { useLabelerStore } from '../../utils/labelerStoreContext';
import {
    labelAnnotationToSvgPropsFactory,
    predictionAnnotationToSvgPropsFactory,
    relationAnnotationToSvgPropsFactory
} from '../../utils/svgUtils';
import { getNewLabelerTokenElementByIndex } from '../../utils/tokenUtils';

export type SvgControllerProps<T extends ITokenStore> = {
    lineStores: LineStore<T>[];
    containerRef: React.MutableRefObject<HTMLDivElement>;
    annotationsDomData: AnnotationDomData[];
    onSvgRenderMap?: Map<SvgRendererKind, ISvgRenderer>;
    annotationToSvgPropsMap?: Map<AnnotationKind, ISvgRendererPropsFactory>;
};

const defaultAnnotationRenderMap: Map<AnnotationKind, ISvgRendererPropsFactory> = new Map([
    ['label', labelAnnotationToSvgPropsFactory],
    ['relation', relationAnnotationToSvgPropsFactory],
    ['negativeLabel', labelAnnotationToSvgPropsFactory],
    ['prediction', predictionAnnotationToSvgPropsFactory]
]);

export const SvgLayoutController = observer(<T extends ITokenStore>(props: SvgControllerProps<T>) => {
    const { lineStores, containerRef, onSvgRenderMap, annotationsDomData, annotationToSvgPropsMap = defaultAnnotationRenderMap } = props;

    const labelerStore = useLabelerStore();
    const { isMounted, configStore, annotationStore, virtualizationStore } = labelerStore;
    const [svgRenderersProps, setSvgRendererProps] = React.useState<IKeyedSvgRendererProps[]>([]);

    React.useLayoutEffect(() => {
        if (!isMounted || !containerRef?.current) {
            return;
        }

        if (configStore.enableVirtualization && !virtualizationStore.areLinesRendered) {
            return;
        }

        const filteredAnnotationsDomData = configStore.enableVirtualization
            ? annotationsDomData.filter(a => isAnnotationWithinIndices(a, virtualizationStore.startingLine, virtualizationStore.endingLine))
            : annotationsDomData;

        const rendererProps = filteredAnnotationsDomData
            // Read more about why annotations might be reversed in `svgRenderers.md`.
            .sort(sortAnnotations(configStore.isRtl ? 'ascending' : 'descending'))
            .map<IKeyedSvgRendererProps>(data => ({
                annotationKey: data.id,
                isClickable: data.isClickable,
                onRenderName: data.onRenderName,
                onRenderTooltip: data.onRenderTooltip,
                ...annotationToSvgPropsMap.get(data.kind)({
                    data,
                    lineStores,
                    isRtl: configStore.isRtl,
                    annotationsPerTokenMap: annotationStore.annotationsPerTokenMap,
                    containerCoordinates: containerRef.current.getBoundingClientRect(),
                    scrollOffset: {
                         x:
                            containerRef.current.scrollLeft -
                            (configStore.isRtl
                                ? !configStore.enableVirtualization
                                    ? labelerStore.svgLayerXOffset
                                    : containerRef.current.scrollHeight > containerRef.current.clientHeight
                                    ? labelerStore.svgLayerXOffset - RTL_ANNOTATION_X_OFFSET
                                    : 0
                                : 0),
                        y: containerRef.current.scrollTop
                    },
                    getTokenElementByIndex: index => getNewLabelerTokenElementByIndex(containerRef.current, index)
                })
            }));

        setSvgRendererProps(rendererProps);
    }, [
        isMounted,
        lineStores,
        configStore.isRtl,
        annotationsDomData,
        labelerStore.svgLayerXOffset,
        virtualizationStore.endingLine,
        labelerStore.labelerOffsetWidth,
        virtualizationStore.startingLine,
        configStore.enableVirtualization,
        virtualizationStore.areLinesRendered,
        annotationStore.annotationsPerTokenMap
    ]);

    return <SvgRootRenderer svgRenderersProps={svgRenderersProps} onSvgRenderMap={onSvgRenderMap} />;
});
