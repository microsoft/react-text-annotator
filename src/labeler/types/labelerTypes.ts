/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { DOMAttributes } from 'react';
import { LineStore } from '../stores/LineStore';

export const noop = () => {};
export const noopEmptyObject = () => ({});
export const noopUndefined = (): undefined => undefined;

export type DisposableAdditionOptions = Partial<{
    ignoreAfterDisposal: boolean;
}>;

export type DisposableLifetime = Lifetime & {
    /**
     * Disposes the life time.
     */
    dispose: () => void;
};

export type Disposable = () => void;

export type Lifetime = {
    /**
     * Adds a disposable to the life time.
     */
    add: (disposable: Disposable, options?: DisposableAdditionOptions) => void;
    /**
     * Checks if the life time is disposed.
     */
    isDisposed: boolean;
};

export type ITokenStore = { text: string; index: number };
export type TokenPaddingCalculator = (tokenStore: ITokenStore, annotationsPerToken: AnnotationData[]) => [number, number];
export type ITokenRendererProps<T extends ITokenStore> = { tokenStore: T; lineStore: LineStore<T> };
export type LineHeightCalculator = <T extends ITokenStore>(params: {
    paddingTop: number;
    paddingBottom: number;
    lineStore: LineStore<T>;
}) => number;

type EventDomAttributes = Omit<DOMAttributes<HTMLElement>, 'children' | 'dangerouslySetInnerHTML'>;
export type TokenEventListenersFactory = (params: {
    tokenStore: ITokenStore;
    lineStore: LineStore<ITokenStore>;
}) => {
    [K in keyof EventDomAttributes]: EventDomAttributes[K];
};
export type TokenEventListenersProp = { factory: TokenEventListenersFactory; deps: React.DependencyList };
export type GlobalEventExceptionPredicates = { [K in keyof EventDomAttributes]: (event: Event) => boolean };

export type Point = { x: number; y: number };
export type Position = 'start' | 'middle' | 'end';

export type SvgRendererKind = 'underline' | 'relation' | 'box' | string;
export type ISvgRenderer = (props: ISvgRendererProps) => JSX.Element;
export type ISvgRendererPropsFactory = (params: {
    isRtl: boolean;
    scrollOffset: Point;
    data: AnnotationDomData;
    containerCoordinates: Point;
    lineStores: LineStore<ITokenStore>[];
    getTokenElementByIndex: (index: number) => Element;
    annotationsPerTokenMap: Map<number, AnnotationData[]>;
}) => ISvgRendererProps;
export type ISvgRendererProps = {
    name: string;
    color: string;
    endLine: number;
    opacity?: number;
    endToken: number;
    startLine: number;
    startToken: number;
    isClickable?: boolean;
    kind: SvgRendererKind;
    namePosition: Position;
    isResizingEnabled?: boolean;
    linePoints: [Point, Point][];
    onRenderTooltip?: () => JSX.Element;
    onResize?: (knob: 'start' | 'end') => void;
    onRenderName?: (name: string) => JSX.Element;
    onClick: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
};
export type IKeyedSvgRendererProps = { annotationKey: string } & ISvgRendererProps;

export type AnnotationKind = 'label' | 'negativeLabel' | 'relation' | 'prediction' | string;
export type AnnotationDomData = AnnotationData & { lineSegments: AnnotationDomLineData[] };
export type AnnotationDomLineData = { endToken: number; lineIndex: number; startToken: number };
export type AnnotationData = {
    id: string;
    name: string;
    color?: string;
    /**
     * Refers to the depth of the annotation
     * in multi-level annotation structures.
     */
    level?: number;
    opacity?: number;
    endToken: number;
    startToken: number;
    /**
     * Whether the annotation originally had a larger
     * start token than an end token or not. Please refer
     * to `labelerTypes.md` for more information.
     */
    isReversed?: boolean;
    kind: AnnotationKind;
    'aria-label'?: string;
    isClickable?: boolean;
    isResizingEnabled?: boolean;
    onRenderName?: (name: string) => JSX.Element;
    onRenderTooltip?: () => JSX.Element;
    onResize?: (knob: 'start' | 'end') => void;
    onClick?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
};

export type CharToTokenMapType = Map<number, number>;
export type TokenToCharMapType = Map<number, { startIndex: number; endIndex: number }>;

export type TargetIndex = { previous: number; next: number };
