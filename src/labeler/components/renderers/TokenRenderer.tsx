/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { TokenStore } from '../../stores/TokenStore';
import { ITokenRendererProps } from '../../types/labelerTypes';
import { tokenDataAttribute, tokenIndexDataAttribute, TOKEN_CLASS_NAME } from '../../utils/labelerConstants';
import { useLabelerStore } from '../../utils/labelerStoreContext';
import { useTheme } from 'styled-components';

export const TokenRenderer = observer((props: ITokenRendererProps<TokenStore>) => {
    const { tokenStore, lineStore } = props;

    const theme = useTheme();
    const { selectionStore, tokenEventListenersFactory, configStore } = useLabelerStore();

    const innerDataAttributes = { [tokenDataAttribute]: true, [tokenIndexDataAttribute]: `${tokenStore.index}` };
    const tokenEventListeners = React.useMemo(
        () => (configStore.isSelectionDisabled ? {} : tokenEventListenersFactory?.({ tokenStore, lineStore })),
        [lineStore, configStore.isSelectionDisabled, tokenEventListenersFactory]
    );

    const isTokenInSelection = computed(
        () => selectionStore.selectionStart <= tokenStore.index && tokenStore.index <= selectionStore.selectionEnd
    ).get();

    const backgroundColor: string = isTokenInSelection ? theme.token.selectedTokenBackground : 'transparent';

    return (
        <span className={TOKEN_CLASS_NAME} {...tokenEventListeners} {...innerDataAttributes} style={{ backgroundColor }}>
            {tokenStore.text}
        </span>
    );
});
