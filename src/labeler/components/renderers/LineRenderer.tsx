/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { comparer, computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { TokenRenderer } from '../../components/renderers/TokenRenderer';
import { LineStore } from '../../stores/LineStore';
import { TokenStore } from '../../stores/TokenStore';
import {
    ITokenRendererProps,
    ITokenStore,
    LineHeightCalculator,
    TargetIndex,
    TokenPaddingCalculator
} from '../../types/labelerTypes';
import {
    lineDataAttribute,
    lineIndexDataAttribute,
    TOKEN_CLASS_NAME,
    TOKEN_DEFAULT_HEIGHT,
    TOKEN_DEFAULT_PADDING,
    TOKEN_Z_INDEX
} from '../../utils/labelerConstants';
import { useLabelerStore } from '../../utils/labelerStoreContext';
import { onLineRendererKeyDown } from '../../utils/lineUtils';
import { calculateMaxTokenPadding } from '../../utils/tokenUtils';
import styled, { useTheme } from 'styled-components';

export type LineRendererProps<T extends ITokenStore> = {
    onRendered: () => void;
    lineStore: LineStore<T>;
    targetIndex: TargetIndex;
    getLineHeight?: LineHeightCalculator;
    tokenPaddingCalculators: TokenPaddingCalculator[];
    onHeightChange: (index: number, height: number) => void;
    onTokenRender: (props: ITokenRendererProps<T>) => React.ReactNode;
};

const LineRoot = styled.div(props => ({
    display: 'flex',
    position: 'relative',
    outline: 'transparent',
    '&:focus-visible': {
        top: -2,
        left: -2,
        right: -2,
        inset: -3,
        bottom: -2,
        borderRadius: '5px',
        border: `1px solid ${props.theme.line.borderColor}`,
        outline: `1px solid ${props.theme.line.outlineColor}`
    },
    [`span.${TOKEN_CLASS_NAME}`]: {
        whiteSpace: 'pre',
        userSelect: 'none',
        position: 'relative',
        zIndex: TOKEN_Z_INDEX,
        display: 'inline-block',
        height: TOKEN_DEFAULT_HEIGHT,
        lineHeight: `${TOKEN_DEFAULT_HEIGHT}px`,
        '&:focus-visible': {
            top: 0,
            left: 0,
            right: 0,
            inset: -1,
            bottom: 0,
            border: `0.5px solid ${props.theme.token.borderColor}`,
            outline: `0.5px solid ${props.theme.token.outlineColor}`
        }
    }
}));

const LineWrapper = styled.div(() => ({ display: 'flex', alignItems: 'baseline', height: TOKEN_DEFAULT_HEIGHT }));

const defaultTokenRenderer = (tokenProps: ITokenRendererProps<TokenStore>) => (
    <TokenRenderer key={tokenProps.tokenStore.index} {...tokenProps} />
);

const getDefaultLineHeight: LineHeightCalculator = ({ paddingTop, paddingBottom }) => TOKEN_DEFAULT_HEIGHT + paddingTop + paddingBottom;

export const LineRenderer = observer(<T extends ITokenStore>(props: LineRendererProps<T>) => {
    const {
        lineStore,
        onRendered,
        targetIndex,
        onHeightChange,
        tokenPaddingCalculators,
        getLineHeight = getDefaultLineHeight,
        onTokenRender = defaultTokenRenderer
    } = props;

    const theme = useTheme();
    const lineRef = React.useRef<HTMLDivElement>();
    const { a11yStore, selectionStore, configStore, annotationStore, virtualizationStore } = useLabelerStore();

    const [paddingTop, paddingBottom] = computed(
        () => {
            const [tokenPaddingTop, tokenPaddingBottom] = calculateMaxTokenPadding(
                lineStore.tokenStores,
                tokenPaddingCalculators,
                annotationStore.annotationsPerTokenMap
            );

            return [tokenPaddingTop || TOKEN_DEFAULT_PADDING, tokenPaddingBottom || TOKEN_DEFAULT_PADDING];
        },
        { equals: comparer.shallow }
    ).get();

    const isRealLine = computed(() => {
        const isLineInViewport = virtualizationStore.startingLine <= lineStore.index && lineStore.index <= virtualizationStore.endingLine;

        return !configStore.enableVirtualization || (configStore.enableVirtualization && isLineInViewport);
    }).get();

    const realLineStyles = { paddingTop, paddingBottom, width: 'fit-content' };
    const virtualLineStyles = { minHeight: getLineHeight({ lineStore, paddingTop, paddingBottom }) };
    const tokens = isRealLine ? lineStore.tokenStores.map(tokenStore => onTokenRender({ tokenStore, lineStore })) : [];
    const commonRendererProps = { theme, ref: lineRef, [lineDataAttribute]: true, [lineIndexDataAttribute]: `${lineStore.index}` };

    const handleKeyDown = React.useCallback(
        event => onLineRendererKeyDown({ event, lineStore, a11yStore, lineRef: lineRef.current, selectionStore, targetIndex }),
        [lineStore, lineRef.current]
    );

    React.useEffect(onRendered);
    React.useLayoutEffect(() => onHeightChange(lineStore.index, getLineHeight({ paddingTop, paddingBottom, lineStore })), [
        lineStore,
        paddingTop,
        paddingBottom
    ]);

    return isRealLine ? (
        <LineRoot aria-label={lineStore.lineText} {...commonRendererProps} onKeyDown={handleKeyDown} style={realLineStyles}>
            <LineWrapper data-automation-id="lineWrapper">{tokens}</LineWrapper>
        </LineRoot>
    ) : (
        <LineRoot {...commonRendererProps} style={virtualLineStyles} />
    );
});
