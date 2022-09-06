/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { observer } from 'mobx-react';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { TOOLTIP_MAX_HEIGHT, TOOLTIP_MAX_WIDTH } from '../../../utils/labelerConstants';
import { useLabelerStore } from '../../../utils/labelerStoreContext';
import styled, { useTheme } from 'styled-components';

type TooltipRendererProps = {
    x: number;
    y: number;
    onRenderTooltip: () => JSX.Element;
};

type toolTipDirections = Partial<{ left: string; right: string; top: string; bottom: string }>;

const Tooltip = styled.div<{ directionProps: { [key: string]: string }; textColor: string; backgroundColor: string }>(props => ({
    zIndex: 1,
    padding: '5px',
    display: 'block',
    position: 'fixed',
    borderRadius: '2px',
    color: props.textColor,
    ...props.directionProps,
    border: '1px solid black',
    maxWidth: TOOLTIP_MAX_WIDTH,
    maxHeight: TOOLTIP_MAX_HEIGHT,
    boxShadow: '0px 3.2px 7.2px 0px #000',
    backgroundColor: props.backgroundColor
}));

export const getTooltipDirections = (clickX: number, clickY: number) => {
    const directions: toolTipDirections = {};

    if (window.innerWidth - clickX > TOOLTIP_MAX_WIDTH) {
        directions.left = `${clickX}px`;
    } else {
        directions.right = `${window.innerWidth - clickX + 5}px`;
    }

    if (window.innerHeight - clickY > TOOLTIP_MAX_HEIGHT || clickY < TOOLTIP_MAX_HEIGHT) {
        directions.top = `${clickY + 5}px`;
    } else {
        directions.bottom = `${window.innerHeight - clickY + 25}px`;
    }

    return directions;
};

export const TooltipRenderer = observer((props: TooltipRendererProps) => {
    const { onRenderTooltip, x, y } = props;
    const theme = useTheme();
    const { configStore } = useLabelerStore();

    const toolTipColors = React.useMemo(
        () => ({
            textColor: configStore.areTooltipsInDarkMode ? theme.tooltip.lightTextColor : theme.tooltip.darkTextColor,
            backgroundColor: configStore.areTooltipsInDarkMode ? theme.tooltip.darkBackgroundColor : theme.tooltip.lightBackgroundColor
        }),
        [configStore.areTooltipsInDarkMode, theme.tooltip]
    );

    return ReactDOM.createPortal(
        <Tooltip
            directionProps={getTooltipDirections(x, y)}
            textColor={toolTipColors.textColor}
            backgroundColor={toolTipColors.backgroundColor}>
            {onRenderTooltip()}
        </Tooltip>,
        document.body
    );
});
