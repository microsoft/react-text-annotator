/**
 * Copyright (c) Microsoft. All rights reserved.
 */

 import { observer, useLocalStore } from 'mobx-react';
 import * as React from 'react';
 import { LayoutController } from './components/controllers/LayoutController';
 import { useAnnotationIndexConverter } from './hooks/useAnnotationIndexConverter';
 import { useAnnotationResizer } from './hooks/useAnnotationResizer';
 import { useCalculateLineInfos } from './hooks/useCalculateLineInfos';
 import { useLabelerConfigSyncer } from './hooks/useLabelerConfigsSyncer';
 import { useSelectionDisableReaction } from './hooks/useSelectionDisableReaction';
 import { useSelectionReaction } from './hooks/useSelectionReaction';
 import { useTokenEventListeners } from './hooks/useTokenEventListeners';
 import { LabelerConfigStore } from './stores/LabelerConfigStore';
 import { LabelerSelectionStore } from './stores/LabelerSelectionStore';
 import { LabelerStore } from './stores/LabelerStore';
 import { TokenStore } from './stores/TokenStore';
 import { labelerTheme } from './theming/labelerTheme';
 import { LabelerProps } from './types/labelerProps';
 import {
     AnnotationData,
     ITokenStore,
     noopEmptyObject,
     noopUndefined,
     TokenEventListenersProp
 } from './types/labelerTypes';
 import { reverseAnnotation } from './utils/annotationUtils';
 import {
     LABELER_DEFAULT_HEIGHT,
     LABELER_DEFAULT_OVERFLOW,
     MAX_CHARACTERS_PER_LINE,
     tokenIndexDataAttribute
 } from './utils/labelerConstants';
 import { LabelerStoreContext } from './utils/labelerStoreContext';
 import { ThemeProvider } from 'styled-components';
 import useDeepCompareEffect from 'use-deep-compare-effect';
 
 export type LabelerRef = { configStore: LabelerConfigStore; selectionStore: LabelerSelectionStore };
 
 const defaultRenderAnnotationColor = (data: AnnotationData) => data.color;
 const defaultTokenStoreFactory = (token: string, index: number) => new TokenStore(index, token);
 const defaultTokenEventListeners: TokenEventListenersProp = { factory: noopEmptyObject, deps: [] };
 
 export const Labeler = observer(
     React.forwardRef(<T extends ITokenStore>(props: LabelerProps<T>, labelerRef: React.MutableRefObject<LabelerRef>) => {
         const {
             text,
             onTokenRender,
             getLineHeight,
             onSvgRenderMap,
             labelerConfigs,
             annotations = [],
             theme = labelerTheme,
             annotationToSvgPropsMap,
             tokenPaddingCalculators,
             annotationIdToScrollIntoView,
             globalEventExceptionSelectors,
             onSelectionChange = noopUndefined,
             onAnnotationClick = noopUndefined,
             onAnnotationResize = noopUndefined,
             labelerHeight = LABELER_DEFAULT_HEIGHT,
             labelerOverflow = LABELER_DEFAULT_OVERFLOW,
             tokenStoreFactory = defaultTokenStoreFactory,
             maxCharactersPerLine = MAX_CHARACTERS_PER_LINE,
             onRenderAnnotationColor = defaultRenderAnnotationColor,
             tokenEventListenersWithDeps = defaultTokenEventListeners
         } = props;
 
         const layoutControllerRef = React.useRef<HTMLDivElement>();
         const labelerStore = useLocalStore(() => new LabelerStore({ initialConfigs: labelerConfigs }));
         const { configStore, selectionStore, annotationStore } = labelerStore;
 
         const { lineStores, charToTokenMap, tokenToCharMap } = useCalculateLineInfos(
             text,
             maxCharactersPerLine,
             labelerStore.configStore,
             tokenStoreFactory
         );
 
         const onAnnotationClickWrapper = useAnnotationIndexConverter(tokenToCharMap, onAnnotationClick);
         const onAnnotationResizeWrapper = useAnnotationIndexConverter(tokenToCharMap, onAnnotationResize);
         const onRenderAnnotationColorWrapper = useAnnotationIndexConverter(tokenToCharMap, onRenderAnnotationColor);
         const onSelectionChangeWrapper = (selectionStart: number, selectionEnd: number, targets: { start: Element; end: Element }) =>
             onSelectionChange(tokenToCharMap.get(selectionStart).startIndex, tokenToCharMap.get(selectionEnd).endIndex, targets);
 
         const { onResize } = useAnnotationResizer(annotationStore, onAnnotationResizeWrapper);
 
         useLabelerConfigSyncer(labelerConfigs, configStore);
         React.useEffect(() => labelerStore.onLabelerMount(), []);
         useSelectionDisableReaction({ configStore, selectionStore });
         useTokenEventListeners(labelerStore, tokenEventListenersWithDeps);
         React.useImperativeHandle(labelerRef, () => ({ configStore, selectionStore }), []);
         useSelectionReaction(selectionStore, layoutControllerRef, onSelectionChangeWrapper);
 
         const handleAnnotationClick = React.useCallback(
             (annotation: AnnotationData) => (event: React.MouseEvent<SVGElement, MouseEvent>) => {
                 if (annotation.onClick) {
                     annotation.onClick(event);
                 } else {
                     onAnnotationClickWrapper(annotation, event);
                 }
             },
             [onAnnotationClickWrapper, configStore.areAnnotationsClickable]
         );
 
         const handleAnnotationResize = React.useCallback(
             (annotationId: string) => (knob: 'start' | 'end') => onResize(annotationId, knob),
             [onAnnotationResizeWrapper]
         );
 
         useDeepCompareEffect(() => {
             if (!charToTokenMap?.size) {
                 return;
             }
 
             const processedAnnotations = annotations
                 .map(reverseAnnotation)
                 .map(a => ({
                     ...a,
                     isClickable: a.isClickable ?? true,
                     endToken: charToTokenMap.get(a.endToken),
                     startToken: charToTokenMap.get(a.startToken)
                 }))
                 .map(a => ({ ...a, onClick: handleAnnotationClick(a), onResize: handleAnnotationResize(a.id) }));
 
             annotationStore.setAnnotations(processedAnnotations);
         }, [annotations, charToTokenMap, annotationIdToScrollIntoView]);
 
         React.useEffect(() => {
             if (annotationIdToScrollIntoView && lineStores) {
                 const firstTokenIndex = annotationStore?.annotations.find(a => a.id === annotationIdToScrollIntoView)?.startToken;
                 const tokenElement = document.querySelector(`[${tokenIndexDataAttribute}="${firstTokenIndex}"]`);
                 tokenElement?.scrollIntoView();
             }
         }, [annotationStore?.annotations, lineStores, annotationIdToScrollIntoView]);
 
         return (
             <LabelerStoreContext.Provider value={labelerStore}>
                 <ThemeProvider theme={theme}>
                     <LayoutController
                         text={text}
                         lineStores={lineStores}
                         ref={layoutControllerRef}
                         onTokenRender={onTokenRender}
                         labelerHeight={labelerHeight}
                         getLineHeight={getLineHeight}
                         onSvgRenderMap={onSvgRenderMap}
                         tokenToCharMap={tokenToCharMap}
                         labelerOverflow={labelerOverflow}
                         annotationToSvgPropsMap={annotationToSvgPropsMap}
                         tokenPaddingCalculators={tokenPaddingCalculators}
                         globalEventExceptionSelectors={globalEventExceptionSelectors}
                         onRenderAnnotationColor={(annotation: AnnotationData) => onRenderAnnotationColorWrapper(annotation) as string}
                     />
                 </ThemeProvider>
             </LabelerStoreContext.Provider>
         );
     })
 );
 
 Labeler.displayName = 'Labeler';
 