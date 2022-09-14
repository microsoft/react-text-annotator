/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import debounce from 'lodash.debounce';
import { observer } from 'mobx-react';
import * as React from 'react';
import { SvgLayoutController } from '../../components/controllers/SvgLayoutController';
import { BracketsRenderer } from '../../components/renderers/BracketsRenderer';
import { LineRenderer } from '../../components/renderers/LineRenderer';
import { useInitializeLayoutController } from '../../hooks/useInitializeLayoutController';
import { useLabelerDimensionsSetterAfterScrolling } from '../../hooks/useLabelerDimensionsSetterAfterScrolling';
import { useLabelerGlobalEventListeners } from '../../hooks/useLabelerGlobalEventListeners';
import { useResizeWatcher } from '../../hooks/useResizeWatcher';
import { useVirtualizer } from '../../hooks/useVirtualizer';
import { LabelerA11yStore } from '../../stores/LabelerA11yStore';
import { LabelerStore } from '../../stores/LabelerStore';
import { LineStore } from '../../stores/LineStore';
import {
    AnnotationData,
    AnnotationKind,
    GlobalEventExceptionPredicates,
    ISvgRenderer,
    ISvgRendererPropsFactory,
    ITokenRendererProps,
    ITokenStore,
    LineHeightCalculator,
    SvgRendererKind,
    TokenPaddingCalculator,
    TokenToCharMapType
} from '../../types/labelerTypes';
import { annotationDataToAnnotationDomData } from '../../utils/annotationUtils';
import {
    LABELER_HORIZONTAL_PADDING,
    LABELER_VERTICAL_PADDING,
    LINE_HEIGHT_CHANGE_DEBOUNCE,
    LINE_VIRTUALIZATION_RENDER_DEBOUNCE,
    LabelerKeyCodes
} from '../../utils/labelerConstants';
import { useLabelerStore } from '../../utils/labelerStoreContext';
import { getMaxLineWidthAndSvgXOffset, getTargetIndex } from '../../utils/lineUtils';
import {
    calculateLabelTokenPadding,
    calculatePredictionTokenPadding,
    calculateRelationTokenPadding
} from '../../utils/tokenUtils';
import styled from 'styled-components';

export type LayoutControllerProps<T extends ITokenStore> = {
    text: string;
    labelerHeight?: string;
    labelerOverflow?: string;
    lineStores: LineStore<T>[];
    tokenToCharMap: TokenToCharMapType;
    getLineHeight?: LineHeightCalculator;
    tokenPaddingCalculators?: TokenPaddingCalculator[];
    onSvgRenderMap?: Map<SvgRendererKind, ISvgRenderer>;
    globalEventExceptionSelectors?: GlobalEventExceptionPredicates;
    onRenderAnnotationColor?: (annotation: AnnotationData) => string;
    onTokenRender: (props: ITokenRendererProps<T>) => React.ReactNode;
    annotationToSvgPropsMap?: Map<AnnotationKind, ISvgRendererPropsFactory>;
};

const Root = styled.div<{ labelerHeight: string; labelerOverflow: string; isRtl: boolean }>(props => ({
    flex: 1,
    fontSize: 14,
    display: 'flex',
    userSelect: 'none',
    position: 'relative',
    boxSizing: 'border-box',
    flexDirection: 'column',
    height: props.labelerHeight,
    overflow: props.labelerOverflow,
    direction: props.isRtl ? 'rtl' : 'ltr',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace;',
    padding: `${LABELER_VERTICAL_PADDING}px ${LABELER_HORIZONTAL_PADDING}px`
}));

/**
 * Handles key down events that propagated from elements inside
 * the labeler but were not handled by them.
 *
 * @param event The event fired when the key was pressed.
 * @param a11yStore The store that contains a11y and focus
 * state of the labeler.
 */
const onKeyDown = (event: React.KeyboardEvent, a11yStore: LabelerA11yStore) => {
    if (event.key === LabelerKeyCodes.Tab) {
        a11yStore.blurCurrentToken();
        a11yStore.blurCurrentAnnotation();
    }
};

const updateLabelerDimensions = (labelerStore: LabelerStore, rootRef: React.MutableRefObject<HTMLDivElement>) => {
    const { maxLineWidth, svgXOffset } = getMaxLineWidthAndSvgXOffset(rootRef.current, labelerStore.configStore.isRtl);
    labelerStore.setLabelerDimensions(maxLineWidth, rootRef.current.scrollHeight, rootRef.current.offsetWidth, svgXOffset);
};

const updateLabelerDimensionsWithDebounce = debounce(updateLabelerDimensions, LINE_HEIGHT_CHANGE_DEBOUNCE);

const defaultPaddingCalculators = [calculateLabelTokenPadding, calculateRelationTokenPadding, calculatePredictionTokenPadding];

/**
 * This component is responsible for creating and laying
 * out lines, mounting the SVG layout controller and passing
 * the correct data to it, mounting any global even listeners,
 * and managing virtualization of lines.
 */
export const LayoutController = observer(
    React.forwardRef(<T extends ITokenStore>(props: LayoutControllerProps<T>, rootRef: React.MutableRefObject<HTMLDivElement>) => {
        const {
            text,
            lineStores,
            labelerHeight,
            onTokenRender,
            getLineHeight,
            onSvgRenderMap,
            tokenToCharMap,
            labelerOverflow,
            annotationToSvgPropsMap,
            onRenderAnnotationColor,
            globalEventExceptionSelectors = {},
            tokenPaddingCalculators = defaultPaddingCalculators
        } = props;

        const labelerStore = useLabelerStore();
        const { isMounted, a11yStore, annotationStore, configStore, selectionStore, virtualizationStore } = labelerStore;
        const annotationDomData = annotationStore.annotations.map(annotation =>
            annotationDataToAnnotationDomData({ annotation, lineStores, onRenderAnnotationColor })
        );

        useLabelerDimensionsSetterAfterScrolling({ labelerStore, rootRef });
        useResizeWatcher(rootRef, () => updateLabelerDimensions(labelerStore, rootRef));
        useInitializeLayoutController({ rootRef, lineStores, selectionStore, a11yStore, annotationStore });
        useLabelerGlobalEventListeners({ containerRef: rootRef, text, selectionStore, tokenToCharMap, globalEventExceptionSelectors });
        useVirtualizer({
            annotationDomData,
            virtualizationStore,
            containerRef: rootRef,
            isLabelerMounted: isMounted,
            isVirtualizationEnabled: configStore.enableVirtualization
        });

        const onLineHeightChange = React.useCallback(
            (lineIndex: number, lineHeight: number) => {
                updateLabelerDimensionsWithDebounce(labelerStore, rootRef);
                virtualizationStore.updateLineHeight(lineIndex, lineHeight);
            },
            [rootRef.current]
        );

        const onLineRendered = React.useCallback(
            configStore.enableVirtualization
                ? debounce(() => virtualizationStore.markLinesAsRendered(), LINE_VIRTUALIZATION_RENDER_DEBOUNCE)
                : () => undefined,
            [configStore.enableVirtualization]
        );

        const onRenderLine = (index: number) => (
            <LineRenderer<T>
                onRendered={onLineRendered}
                targetIndex={getTargetIndex(lineStores, lineStores[index].index)}
                key={lineStores[index].index}
                lineStore={lineStores[index]}
                onTokenRender={onTokenRender}
                getLineHeight={getLineHeight}
                onHeightChange={onLineHeightChange}
                tokenPaddingCalculators={tokenPaddingCalculators}
            />
        );

        const handleClick = React.useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

        const handleKeyDown = React.useCallback((e: React.KeyboardEvent) => onKeyDown(e, a11yStore), [a11yStore]);

        return (
            <Root
                ref={rootRef}
                onClick={handleClick}
                isRtl={configStore.isRtl}
                onKeyDown={handleKeyDown}
                labelerHeight={labelerHeight}
                labelerOverflow={labelerOverflow}>
                {lineStores.map((_, index) => onRenderLine(index))}

                <BracketsRenderer containerRef={rootRef.current} />

                <SvgLayoutController
                    containerRef={rootRef}
                    lineStores={lineStores}
                    onSvgRenderMap={onSvgRenderMap}
                    annotationsDomData={annotationDomData}
                    annotationToSvgPropsMap={annotationToSvgPropsMap}
                />
            </Root>
        );
    })
);

LayoutController.displayName = 'LayoutController';
