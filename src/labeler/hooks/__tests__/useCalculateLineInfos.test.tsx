/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import * as React from 'react';
import { useCalculateLineInfos } from '../../hooks/useCalculateLineInfos';
import { LabelerConfigStore } from '../../stores/LabelerConfigStore';
import { LineStore } from '../../stores/LineStore';
import { TokenStore } from '../../stores/TokenStore';
import { CharToTokenMapType, TokenToCharMapType } from '../../types/labelerTypes';

describe('useCalculateLineInfos unit tests', () => {
    let mockConfigStore: LabelerConfigStore;
    let maxCharactersPerLine: number;
    let mockLineStores: LineStore<TokenStore>[];
    let mockCharToTokenMap: CharToTokenMapType;
    let mockTokenToCharMap: TokenToCharMapType;
    const tokenStoreFactory = (token: string, index: number) => new TokenStore(index, token);

    const MockWrapper = ({ text }: { text: string }) => {
        let { lineStores, charToTokenMap, tokenToCharMap } = useCalculateLineInfos(
            text,
            maxCharactersPerLine,
            mockConfigStore,
            tokenStoreFactory
        );
        mockLineStores = lineStores;
        mockTokenToCharMap = tokenToCharMap;
        mockCharToTokenMap = charToTokenMap;

        return <></>;
    };

    beforeEach(() => {
        maxCharactersPerLine = 100;
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it('should return line infos correctly when tokenization type is character', () => {
        mockConfigStore = new LabelerConfigStore({ isRtl: false, tokenizationType: 'character' });
        const text = 'My name is 7ammo and I am working for Microsoft';

        mount(<MockWrapper text={text} />);

        expect(mockLineStores.length).toBe(1);
        expect(mockLineStores[0]).toMatchObject({ index: 0, lineNumber: 1 });

        expect(mockCharToTokenMap.size).toBe(47);
        expect(mockCharToTokenMap.get(8)).toBe(8);
        expect(mockCharToTokenMap.get(46)).toBe(46);

        expect(mockTokenToCharMap.size).toBe(47);
        expect(mockTokenToCharMap.get(8)).toMatchObject({ startIndex: 8, endIndex: 8 });
        expect(mockTokenToCharMap.get(46)).toMatchObject({ startIndex: 46, endIndex: 46 });
    });

    it('should return line infos correctly tokenization type is word', () => {
        mockConfigStore = new LabelerConfigStore({ isRtl: true, tokenizationType: 'word' });
        const text = `اسمي حمو و اعمل لدى ميكروسوفت`;

        mount(<MockWrapper text={text} />);

        expect(mockLineStores.length).toBe(1);
        expect(mockLineStores[0]).toMatchObject({ index: 0, lineNumber: 1 });

        expect(mockCharToTokenMap.size).toBe(29);
        expect(mockCharToTokenMap.get(8)).toBe(3);
        expect(mockCharToTokenMap.get(26)).toBe(10);

        expect(mockTokenToCharMap.size).toBe(11);
        expect(mockTokenToCharMap.get(0)).toMatchObject({ startIndex: 0, endIndex: 3 });
        expect(mockTokenToCharMap.get(6)).toMatchObject({ startIndex: 11, endIndex: 14 });
    });
});
