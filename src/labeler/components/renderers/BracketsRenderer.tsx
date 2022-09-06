/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { bracketDataAttribute, BRACKET_OFFSET } from '../../utils/labelerConstants';
import { useLabelerStore } from '../../utils/labelerStoreContext';
import { getNewLabelerTokenElementByIndex } from '../../utils/tokenUtils';
import styled from 'styled-components';

export type NewBracketsRendererProps = {
    containerRef: HTMLDivElement;
};

const InnerBracket = styled.span({
    fontSize: 24,
    fontWeight: 500,
    lineHeight: 0.5,
    position: 'absolute',
    pointerEvents: 'none'
});

const bracketDataAttrObj = { [bracketDataAttribute]: true };

const getTokenCoords = (element: Element, isStartingBracket: boolean) => {
    const { top, left, right } = element.getBoundingClientRect();
    const x = (isStartingBracket ? left : right) + BRACKET_OFFSET;

    return { y: top, x };
};

const Bracket = ({ x, y, isStartingBracket }: { x: number; y: number; isStartingBracket: boolean }) => (
    <InnerBracket {...bracketDataAttrObj} style={{ visibility: 'visible', left: x, top: y }}>
        {isStartingBracket ? '[' : ']'}
    </InnerBracket>
);

export const BracketsRenderer = observer((props: NewBracketsRendererProps) => {
    const { containerRef } = props;
    const { selectionStore, configStore } = useLabelerStore();

    if (!containerRef) {
        return null;
    }

    const hoverStartTarget = getNewLabelerTokenElementByIndex(
        containerRef,
        configStore.isRtl ? selectionStore.hoverEnd : selectionStore.hoverStart
    );
    const hoverEndTarget = getNewLabelerTokenElementByIndex(
        containerRef,
        configStore.isRtl ? selectionStore.hoverStart : selectionStore.hoverEnd
    );
    const selectionStartTarget = getNewLabelerTokenElementByIndex(
        containerRef,
        configStore.isRtl ? selectionStore.selectionEnd : selectionStore.selectionStart
    );
    const selectionEndTarget = getNewLabelerTokenElementByIndex(
        containerRef,
        configStore.isRtl ? selectionStore.selectionStart : selectionStore.selectionEnd
    );

    return ReactDOM.createPortal(
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, visibility: 'hidden' }}>
            {hoverStartTarget && <Bracket isStartingBracket {...getTokenCoords(hoverStartTarget, true)} />}
            {hoverEndTarget && <Bracket isStartingBracket={false} {...getTokenCoords(hoverEndTarget, false)} />}
            {selectionStartTarget && <Bracket isStartingBracket {...getTokenCoords(selectionStartTarget, true)} />}
            {selectionEndTarget && <Bracket isStartingBracket={false} {...getTokenCoords(selectionEndTarget, false)} />}
        </div>,
        document.body
    );
});
