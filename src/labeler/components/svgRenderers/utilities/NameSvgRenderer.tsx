/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import React from 'react';
import { Point, Position } from '../../../types/labelerTypes';
import { NAME_FONT_SIZE } from '../../../utils/labelerConstants';
import styled from 'styled-components';

export type NameSvgRendererProps = {
    name: string;
    color: string;
    width: number;
    xOffset?: number;
    yOffset?: number;
    position?: Position;
    onClick?: () => void;
    topLeftBasePoint: Point;
    onRenderName?: (name: string) => React.ReactNode;
};

const Name = styled.span<{ isRtl: boolean }>(props => ({
    userSelect: 'none',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    pointerEvents: 'all',
    display: 'inline-block',
    textOverflow: 'ellipsis',
    height: `${NAME_FONT_SIZE + 1}px`,
    direction: props.isRtl ? 'rtl' : 'ltr',
    '&:hover': { overflow: 'visible' }
}));

const NameContainer = styled.span({
    display: 'flex',
    alignItems: 'center',
    height: NAME_FONT_SIZE,
    fontSize: NAME_FONT_SIZE,
    lineHeight: `${NAME_FONT_SIZE}px`
});

const Root = styled.foreignObject<{ isClickable: boolean }>(({ isClickable }) => ({
    pointerEvents: 'none',
    ...(!isClickable ? {} : { '&:hover': { fontWeight: 'bold', cursor: 'pointer' } })
}));

const getJustifyContent = (position: Position) => {
    switch (position) {
        case 'end':
            return 'flex-end';
        case 'middle':
            return 'center';
        case 'start':
        default:
            return 'flex-start';
    }
};

const setForeignObjectWidth = (element: SVGForeignObjectElement, value: number) => {
    element.width.baseVal.value = value;
};

export const NameSvgRenderer = observer((props: NameSvgRendererProps) => {
    const { color, name, onRenderName, topLeftBasePoint, xOffset = 0, yOffset = 0, width, position, onClick } = props;

    const nameRef = React.useRef<HTMLSpanElement>();
    const nameButtonRef = React.useRef<HTMLDivElement>();
    const foreignObjectRef = React.useRef<SVGForeignObjectElement>();

    const onNameMouseOver = () => {
        if (nameRef.current.scrollWidth > width) {
            nameRef.current.style.backgroundColor = 'white';
            nameButtonRef.current.style.width = `${nameRef.current.scrollWidth}px`;
            setForeignObjectWidth(foreignObjectRef.current, nameRef.current.scrollWidth);
            if (position === 'end') {
                foreignObjectRef.current.setAttribute('x', `${topLeftBasePoint.x + xOffset - nameRef.current.scrollWidth + width}`);
            }
        }
    };

    const onNameMouseOut = () => {
        if (nameRef.current.scrollWidth > width) {
            nameButtonRef.current.style.width = `${width}px`;
            nameRef.current.style.backgroundColor = 'transparent';
            setForeignObjectWidth(foreignObjectRef.current, width);
            if (position === 'end') {
                foreignObjectRef.current.setAttribute('x', `${topLeftBasePoint.x + xOffset}`);
            }
        }
    };

    return (
        <Root
            height={10}
            width={width}
            ref={foreignObjectRef}
            data-automation-id="nameRoot"
            isClickable={Boolean(onClick)}
            x={topLeftBasePoint.x + xOffset}
            y={topLeftBasePoint.y + yOffset}>
            <NameContainer
                role="button"
                onClick={onClick}
                ref={nameButtonRef}
                onMouseLeave={onNameMouseOut}
                onMouseEnter={onNameMouseOver}
                style={{ color, width, justifyContent: getJustifyContent(position) }}>
                <Name data-automation-id="nameSpan" ref={nameRef} isRtl={position === 'end'}>
                    {onRenderName?.(name) ?? name}
                </Name>
            </NameContainer>
        </Root>
    );
});
