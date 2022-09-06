/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerConfigStore } from '../stores/LabelerConfigStore';
import { LineStore } from '../stores/LineStore';
import { ITokenStore } from '../types/labelerTypes';
import { getCharAndTokenMapping, getLineInfos, getTokens } from '../utils/lineUtils';

/**
 * This hook calculates line infos of the labeler text, this includes line indices, token ranges and token texts
 * also calculates the mapping needed to update annotation ranges when passing to/from the labeler.
 *
 * @param text the labeler text
 * @param maxCharactersPerLine the max chars per line
 * @param configStore the labeler configuration store
 * @param tokenStoreFactory the factory to create token store from token text and index
 * @returns line stores of the text, index-to-token map and token-to-char map
 */
export const useCalculateLineInfos = <T extends ITokenStore>(
    text: string,
    maxCharactersPerLine: number,
    configStore: LabelerConfigStore,
    tokenStoreFactory: (token: string, index: number) => T
) => {
    const lineInfosData = React.useMemo(() => {
        const lineInfos = getLineInfos(text, maxCharactersPerLine, configStore);
        const tokens = getTokens(text, lineInfos, configStore).map(tokenStoreFactory);
        const { charToTokenMap, tokenToCharMap } = getCharAndTokenMapping(text, lineInfos, configStore);

        return {
            charToTokenMap,
            tokenToCharMap,
            lineStores: lineInfos.map(
                (l, i) =>
                    new LineStore(
                        i,
                        l.lineNumber,
                        tokens.slice(
                            configStore.tokenizationType === 'word' ? charToTokenMap.get(l.tokenRangeIndices[0]) : l.tokenRangeIndices[0],
                            configStore.tokenizationType === 'word'
                                ? charToTokenMap.get(l.tokenRangeIndices[1]) + 1
                                : l.tokenRangeIndices[1] + 1
                        ),
                        text.substring(l.tokenRangeIndices[0], l.tokenRangeIndices[1] + 1)
                    )
            )
        };
    }, [text, configStore.tokenizationType, configStore.wordBreak, tokenStoreFactory, maxCharactersPerLine]);

    return lineInfosData;
};
