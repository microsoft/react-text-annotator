/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerA11yStore } from '../../stores/LabelerA11yStore';
import { LabelerConfigStore } from '../../stores/LabelerConfigStore';
import { LabelerSelectionStore } from '../../stores/LabelerSelectionStore';
import { LineStore } from '../../stores/LineStore';
import { TokenStore } from '../../stores/TokenStore';
import { noop } from '../../types/labelerTypes';
import { lineDataAttribute, lineIndexDataAttribute, LabelerKeyCodes } from '../../utils/labelerConstants';
import {
    getCharAndTokenMapping,
    getLineElementByIndex,
    getLineInfos,
    getTokens,
    onLineRendererKeyDown
} from '../../utils/lineUtils';

describe('lineUtils unit tests', () => {
    describe('getLineElementByIndex unit tests', () => {
        it('should call query selector on ref with correct values', () => {
            const spy = jest.fn();

            getLineElementByIndex({ querySelector: spy } as any, 1);
            expect(spy).toHaveBeenCalledWith(`[${lineDataAttribute}][${lineIndexDataAttribute}="${1}"]`);
        });
    });

    describe('getLineInfos unit tests', () => {
        let mockConfigStore: LabelerConfigStore;

        beforeEach(() => (mockConfigStore = new LabelerConfigStore()));

        it('should calculate lines correctly in normal wordBreak with English text (1)', () => {
            const lines = getLineInfos('aaaa\nMy name is omar\naaaa', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 4] },
                { lineNumber: 2, tokenRangeIndices: [5, 7] },
                { lineNumber: 2, tokenRangeIndices: [8, 12] },
                { lineNumber: 2, tokenRangeIndices: [13, 15] },
                { lineNumber: 2, tokenRangeIndices: [16, 20] },
                { lineNumber: 3, tokenRangeIndices: [21, 24] }
            ]);
        });

        it('should calculate lines correctly in normal wordBreak with English text (2)', () => {
            const lines = getLineInfos('aaaa\nMy name is omar\naaaa', 10, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 4] },
                { lineNumber: 2, tokenRangeIndices: [5, 14] },
                { lineNumber: 2, tokenRangeIndices: [15, 20] },
                { lineNumber: 3, tokenRangeIndices: [21, 24] }
            ]);
        });

        it('should calculate lines correctly in normal wordBreak with English text (3)', () => {
            const lines = getLineInfos('aaaa\nMyNameIsKhanFromTheEpiglottis\naaaa', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 4] },
                { lineNumber: 2, tokenRangeIndices: [5, 34] },
                { lineNumber: 3, tokenRangeIndices: [35, 38] }
            ]);
        });

        it('should calculate lines correctly in normal wordBreak with English text (4)', () => {
            const lines = getLineInfos('', 5, mockConfigStore);

            expect(lines).toEqual([]);
        });

        it('should calculate lines correctly in normal wordBreak with English text (5)', () => {
            const lines = getLineInfos('\n\n', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 0] },
                { lineNumber: 2, tokenRangeIndices: [1, 1] }
            ]);
        });

        it('should calculate lines correctly in normal wordBreak with English text (6)', () => {
            const lines = getLineInfos('aaaa\n\n\nOmar is amazing\n\naaaa', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 4] },
                { lineNumber: 2, tokenRangeIndices: [5, 5] },
                { lineNumber: 3, tokenRangeIndices: [6, 6] },
                { lineNumber: 4, tokenRangeIndices: [7, 11] },
                { lineNumber: 4, tokenRangeIndices: [12, 14] },
                { lineNumber: 4, tokenRangeIndices: [15, 22] },
                { lineNumber: 5, tokenRangeIndices: [23, 23] },
                { lineNumber: 6, tokenRangeIndices: [24, 27] }
            ]);
        });

        it('should calculate lines correctly in normal wordBreak with Chinese text (1)', () => {
            const lines = getLineInfos('者則是范睢者則是范睢者則是范睢', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 4] },
                { lineNumber: 1, tokenRangeIndices: [5, 9] },
                { lineNumber: 1, tokenRangeIndices: [10, 14] }
            ]);
        });

        it('should calculate lines correctly in normal wordBreak with Chinese text (2)', () => {
            const lines = getLineInfos('者則\n是范睢者則是范睢者則是范睢', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 2] },
                { lineNumber: 2, tokenRangeIndices: [3, 7] },
                { lineNumber: 2, tokenRangeIndices: [8, 12] },
                { lineNumber: 2, tokenRangeIndices: [13, 15] }
            ]);
        });

        it('should calculate lines correctly in normal wordBreak with Chinese text (3)', () => {
            const lines = getLineInfos('者則 是范睢 者則是范睢者則是范睢', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 4] },
                { lineNumber: 1, tokenRangeIndices: [5, 9] },
                { lineNumber: 1, tokenRangeIndices: [10, 14] },
                { lineNumber: 1, tokenRangeIndices: [15, 16] }
            ]);
        });

        it('should calculate lines correctly in normal wordBreak with Chinese and English text (3)', () => {
            const lines = getLineInfos('者則 是7ammo睢 者則是范睢者則是范睢', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 2] },
                { lineNumber: 1, tokenRangeIndices: [3, 8] },
                { lineNumber: 1, tokenRangeIndices: [9, 13] },
                { lineNumber: 1, tokenRangeIndices: [14, 18] },
                { lineNumber: 1, tokenRangeIndices: [19, 20] }
            ]);
        });

        it('should calculate lines correctly in breakAll wordBreak (1)', () => {
            mockConfigStore = new LabelerConfigStore({ wordBreak: 'breakAll' });
            const lines = getLineInfos('7ammoEl者則是范', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 4] },
                { lineNumber: 1, tokenRangeIndices: [5, 9] },
                { lineNumber: 1, tokenRangeIndices: [10, 10] }
            ]);
        });

        it('should calculate lines correctly in breakAll wordBreak (2)', () => {
            mockConfigStore = new LabelerConfigStore({ wordBreak: 'breakAll' });
            const lines = getLineInfos('7a\nmmoEl者 則是范', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 2] },
                { lineNumber: 2, tokenRangeIndices: [3, 7] },
                { lineNumber: 2, tokenRangeIndices: [8, 12] }
            ]);
        });

        it('should calculate lines correctly in keepAll wordBreak (1)', () => {
            mockConfigStore = new LabelerConfigStore({ wordBreak: 'keepAll' });
            const lines = getLineInfos('7ammoEl者則是范則是范則是范', 5, mockConfigStore);

            expect(lines).toEqual([{ lineNumber: 1, tokenRangeIndices: [0, 16] }]);
        });

        it('should calculate lines correctly in keepAll wordBreak (2)', () => {
            mockConfigStore = new LabelerConfigStore({ wordBreak: 'keepAll' });
            const lines = getLineInfos('7a\nmmoEl者則是范則是范則是范', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 2] },
                { lineNumber: 2, tokenRangeIndices: [3, 17] }
            ]);
        });

        it('should calculate lines correctly in keepAll wordBreak (3)', () => {
            mockConfigStore = new LabelerConfigStore({ wordBreak: 'keepAll' });
            const lines = getLineInfos('7a\nmmoEl者則是 范則是范則是范', 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 2] },
                { lineNumber: 2, tokenRangeIndices: [3, 10] },
                { lineNumber: 2, tokenRangeIndices: [11, 11] },
                { lineNumber: 2, tokenRangeIndices: [12, 18] }
            ]);
        });

        it('should calculate lines correctly when tokenization type is word', () => {
            mockConfigStore = new LabelerConfigStore({ isRtl: true, tokenizationType: 'word' });
            const lines = getLineInfos(`اسمي حمو و اعمل لدى ميكروسوفت`, 5, mockConfigStore);

            expect(lines).toEqual([
                { lineNumber: 1, tokenRangeIndices: [0, 4] },
                { lineNumber: 1, tokenRangeIndices: [5, 9] },
                { lineNumber: 1, tokenRangeIndices: [10, 14] },
                { lineNumber: 1, tokenRangeIndices: [15, 19] },
                { lineNumber: 1, tokenRangeIndices: [20, 28] }
            ]);
        });

        it('should calculate tokens correctly when tokenization type is character', () => {
            mockConfigStore = new LabelerConfigStore({ tokenizationType: 'character' });
            const text = `اسمي حمو و اعمل لدى ميكروسوفت`;
            const lines = getLineInfos(text, 5, mockConfigStore);
            const tokens = getTokens(text, lines, mockConfigStore);

            expect(tokens.length).toBe(29);
        });

        it('should calculate tokens correctly when tokenization type is word', () => {
            mockConfigStore = new LabelerConfigStore({ isRtl: true, tokenizationType: 'word' });
            const text = `اسمي حمو و اعمل لدى ميكروسوفت`;
            const lines = getLineInfos(text, 5, mockConfigStore);
            const tokens = getTokens(text, lines, mockConfigStore);

            expect(tokens.length).toBe(11);
        });

        it('should calculate token mappers correctly when tokenization type is word', () => {
            mockConfigStore = new LabelerConfigStore({ isRtl: true, tokenizationType: 'word' });
            const text = `اسمي حمو و اعمل لدى ميكروسوفت`;
            const lines = getLineInfos(text, 50, mockConfigStore);
            const { charToTokenMap, tokenToCharMap } = getCharAndTokenMapping(text, lines, mockConfigStore);

            expect(charToTokenMap.size).toBe(29);
            expect(charToTokenMap.get(8)).toBe(3);
            expect(charToTokenMap.get(26)).toBe(10);

            expect(tokenToCharMap.size).toBe(11);
            expect(tokenToCharMap.get(0)).toMatchObject({ startIndex: 0, endIndex: 3 });
            expect(tokenToCharMap.get(6)).toMatchObject({ startIndex: 11, endIndex: 14 });
        });
    });

    describe('onLineRendererKeyDown unit tests', () => {
        let mockHover: jest.SpyInstance;
        let mockSelect: jest.SpyInstance;
        let mockUnHover: jest.SpyInstance;
        let mockA11yStore: LabelerA11yStore;
        let mockFocusTokenByIndex: jest.SpyInstance;
        let mockFocusLineByDirection: jest.SpyInstance;
        let mockSelectionStore = new LabelerSelectionStore(new LabelerConfigStore());
        let mockEvents = { stopPropagation: noop, preventDefault: noop };
        let mockParams: Partial<Parameters<typeof onLineRendererKeyDown>>[0];
        const mockLineStore = new LineStore(0, 1, [new TokenStore(0, '7'), new TokenStore(1, 'a'), new TokenStore(2, 'm')]);

        beforeEach(() => {
            mockA11yStore = new LabelerA11yStore();
            mockSelectionStore = new LabelerSelectionStore(new LabelerConfigStore());

            mockFocusTokenByIndex = jest.spyOn(mockA11yStore, 'focusTokenByIndex').mockImplementation(noop);
            mockFocusLineByDirection = jest.spyOn(mockA11yStore, 'focusLineByDirection').mockImplementation(noop);

            mockHover = jest.spyOn(mockSelectionStore, 'hover').mockImplementation(noop);
            mockSelect = jest.spyOn(mockSelectionStore, 'select').mockImplementation(noop);
            mockUnHover = jest.spyOn(mockSelectionStore, 'unHover').mockImplementation(noop);

            mockParams = {
                event: undefined,
                lineRef: undefined,
                targetIndex: undefined,
                a11yStore: mockA11yStore,
                lineStore: mockLineStore,
                selectionStore: mockSelectionStore
            };
        });

        it('should not stop or prevent events for keys that are not used', () => {
            const mockStopPropagation = jest.fn();
            const mockPreventDefault = jest.fn();

            onLineRendererKeyDown({
                ...mockParams,
                event: <any>{ key: 'O', stopPropagation: mockStopPropagation, preventDefault: mockPreventDefault }
            });

            expect(mockPreventDefault).not.toHaveBeenCalled();
            expect(mockStopPropagation).not.toHaveBeenCalled();
        });

        it('should stop and prevent events for keys that are not used', () => {
            const mockStopPropagation = jest.fn();
            const mockPreventDefault = jest.fn();

            onLineRendererKeyDown({
                ...mockParams,
                event: <any>{ key: LabelerKeyCodes.ArrowRight, stopPropagation: mockStopPropagation, preventDefault: mockPreventDefault }
            });

            expect(mockPreventDefault).toHaveBeenCalled();
            expect(mockStopPropagation).toHaveBeenCalled();
        });

        it('should focus line by correct direction when up or down arrow is pressed', () => {
            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.ArrowDown, ...mockEvents } });
            expect(mockFocusLineByDirection).toHaveBeenLastCalledWith('next');

            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.ArrowUp, ...mockEvents } });
            expect(mockFocusLineByDirection).toHaveBeenLastCalledWith('previous');
        });

        it('should focus first or last token in line right or left arrow is pressed', () => {
            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.ArrowRight, ...mockEvents } });
            expect(mockFocusTokenByIndex).toHaveBeenLastCalledWith(0);

            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.ArrowLeft, ...mockEvents } });
            expect(mockFocusTokenByIndex).toHaveBeenLastCalledWith(2);
        });

        it('should focus correct line when home or end key is pressed', () => {
            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.Home, ...mockEvents } });
            expect(mockFocusLineByDirection).toHaveBeenLastCalledWith('first');

            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.End, ...mockEvents } });
            expect(mockFocusLineByDirection).toHaveBeenLastCalledWith('last');
        });

        it('should select first or last token if shift key is pressed and right or left arrow is pressed', () => {
            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.ArrowRight, shiftKey: true, ...mockEvents } });
            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith(0);

            mockUnHover.mockClear();

            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.ArrowLeft, shiftKey: true, ...mockEvents } });
            expect(mockSelect).toHaveBeenCalledWith(2);
        });

        it('should hover first or last token if right or left arrow is pressed and shift is not pressed', () => {
            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.ArrowRight, ...mockEvents } });
            expect(mockUnHover).toHaveBeenCalled();
            expect(mockHover).toHaveBeenLastCalledWith(0);

            mockUnHover.mockClear();

            onLineRendererKeyDown({ ...mockParams, event: <any>{ key: LabelerKeyCodes.ArrowLeft, shiftKey: true, ...mockEvents } });
            expect(mockSelect).toHaveBeenCalledWith(2);
        });
    });
});
