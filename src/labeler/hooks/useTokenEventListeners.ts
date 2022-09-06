/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerStore } from '../stores/LabelerStore';
import { LineStore } from '../stores/LineStore';
import { ITokenStore, TokenEventListenersProp } from '../types/labelerTypes';
import { mergeFunctionObjects } from '../utils/mergeFunctionObjects';
import { getTokenEventListenersFactory } from '../utils/tokenUtils';

/**
 * Merges the user defined token event listeners with the default
 * token event listeners that our labeler supports.
 *
 * @param labelerStore The labeler store that contains all labeler relevant state.
 * @param tokenEventListenersWithDeps An array of dependencies that if changed, should
 * re-change the token event listeners function.
 */
export const useTokenEventListeners = (labelerStore: LabelerStore, tokenEventListenersWithDeps: TokenEventListenersProp) => {
    React.useEffect(() => {
        const tokenEventListenersFactory = (params: { tokenStore: ITokenStore; lineStore: LineStore<ITokenStore> }) => {
            const { a11yStore, selectionStore } = labelerStore;

            const userDefinedEventListeners = tokenEventListenersWithDeps.factory(params);
            const defaultEventListeners = getTokenEventListenersFactory({ a11yStore, selectionStore })(params);

            return mergeFunctionObjects(userDefinedEventListeners, defaultEventListeners);
        };

        labelerStore.setTokenEventListenersFactory(tokenEventListenersFactory);
    }, [...tokenEventListenersWithDeps.deps]);
};
