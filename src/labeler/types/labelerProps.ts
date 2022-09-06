/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerConfigStoreParameters } from '../stores/LabelerConfigStore';
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
    TokenEventListenersProp,
    TokenPaddingCalculator
} from '../types/labelerTypes';
import { DefaultTheme } from 'styled-components';

export type LabelerProps<T extends ITokenStore> = {
    /**
     * Raw un-tokenized text to display in the labeler. Text
     * is tokenized by characters.
     */
    text: string;

    /**
     * An optional theme object to override the default
     * theme applied to the labeler.
     */
    theme?: DefaultTheme;

    /**
     * CSS class to get applied to the root element.
     */
    className?: string;

    /**
     * The maximum number of characters allowed per a labeler
     * line element. If the number of characters in the original
     * document line exceed this value, the document line is
     * split into two labeler lines. Read more in `labeler.md`.
     *
     * @default 100
     */
    maxCharactersPerLine?: number;

    /**
     * Used when virtualization is enabled. This is used to
     * override the default calculation of line renderer heights.
     * Calculating line heights is important to get an overall
     * height of the virtualization container to render the scroll
     * bar correctly.
     */
    getLineHeight?: LineHeightCalculator;

    /**
     * An array of annotations to decorate the text with. They could
     * be labels, predictions, relations, etc.
     */
    annotations?: Omit<AnnotationData, 'isReversed'>[];

    /**
     * An optional array of strategy functions to calculate the
     * vertical padding a token should get. This is usually based
     * on the annotations that are present on the token.
     */
    tokenPaddingCalculators?: TokenPaddingCalculator[];

    /**
     * A map of Svg renderer kinds and SVG element factory functions.
     * Provide this if you want to override the SVG rendering of
     * SVG elements or to support a new type of SVG element all together.
     */
    onSvgRenderMap?: Map<SvgRendererKind, ISvgRenderer>;

    /**
     * A set of configurations that control visual elements
     * of the labeler. These configurations can be changed after
     * the label is mounted via the labeler's forward ref.
     */
    labelerConfigs?: LabelerConfigStoreParameters;

    /**
     * A factory function that creates custom event handlers
     * for tokens in the labeler. The factory function is cached
     * unless one of the dependencies in the `deps` property is
     * changed. This behaves similar to React.useEffect dependencies.
     */
    tokenEventListenersWithDeps?: TokenEventListenersProp;

    /**
     * A map of predicates per events that are listened to by the labeler
     * on the document level. Whenever the predicate returns true, the event
     * is ignored.
     */
    globalEventExceptionSelectors?: GlobalEventExceptionPredicates;

    /**
     * Callback that gets invoked when an annotation is resized.
     */
    onAnnotationResize?: (annotation: AnnotationData) => void;

    /**
     * A custom function to generate a color given an annotation.
     */
    onRenderAnnotationColor?: (annotation: AnnotationData) => string;

    /**
     * If provided, override the default token rendering to the factory
     * function provided in this parameter. Used if you want to render
     * your custom tokens.
     */
    onTokenRender?: (props: ITokenRendererProps<T>) => React.ReactNode;

    /**
     * A map of annotation kinds and factory functions that can convert
     * annotation data to SVG detailed coordinate data to be rendered.
     * Use this if you want to customize any of the existing SVG shape
     * calculations for supported annotations, or when supporting a new
     * custom annotation kind.
     */
    annotationToSvgPropsMap?: Map<AnnotationKind, ISvgRendererPropsFactory>;

    /**
     * A factory function that creates token stores given required token
     * data. To be used when supporting a new type of token and the backing
     * store needs to be changed as well to support it.
     */
    tokenStoreFactory?: (token: string, index: number) => T;

    /**
     * Callback that gets invoked when an annotation is clicked.
     */
    onAnnotationClick?: (annotation: AnnotationData, event: React.MouseEvent<SVGElement, MouseEvent>) => void;

    /**
     * Callback that gets called when selection is changed.
     */
    onSelectionChange?: (selectionStart: number, selectionEnd: number, targets: { start: Element; end: Element }) => void;

    /**
     * Annotation Id to scroll it into view.
     */
    annotationIdToScrollIntoView?: string;

    /**
     * the height of the labeler, default is 100%
     */
    labelerHeight?: string;

    /**
     * the overflow of the labeler, default is auto
     */
    labelerOverflow?: string;
};
