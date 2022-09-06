/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerVirtualizationStore } from '../../stores/LabelerVirtualizationStore';
import { LINE_HEIGHT_CHANGE_DEBOUNCE } from '../../utils/labelerConstants';

describe('LabelerVirtualizationStore unit tests', () => {
    beforeAll(() => jest.useFakeTimers());

    it('should initialize starting and ending line with NaN', () => {
        const mockStore = new LabelerVirtualizationStore();

        expect(isNaN(mockStore.startingLine)).toBeTruthy();
        expect(isNaN(mockStore.endingLine)).toBeTruthy();
        expect(mockStore.areLinesRendered).toBeFalsy();
    });

    it('should set lines and mark lines as not rendered when setting lines', () => {
        const mockStore = new LabelerVirtualizationStore();
        mockStore.setLines(10, 20);

        expect(mockStore.startingLine).toEqual(10);
        expect(mockStore.endingLine).toEqual(20);
        expect(mockStore.areLinesRendered).toBeFalsy();
    });

    it('should set lines and not mark lines as not rendered when setting lines equal to the existing values', () => {
        const mockStore = new LabelerVirtualizationStore();
        mockStore.setLines(10, 20);

        expect(mockStore.startingLine).toEqual(10);
        expect(mockStore.endingLine).toEqual(20);
        expect(mockStore.areLinesRendered).toBeFalsy();

        mockStore.markLinesAsRendered();
        expect(mockStore.areLinesRendered).toBeTruthy();

        mockStore.setLines(10, 20);
        expect(mockStore.areLinesRendered).toBeTruthy();

        mockStore.setLines(10, 30);
        expect(mockStore.areLinesRendered).toBeFalsy();

        mockStore.markLinesAsRendered();
        expect(mockStore.areLinesRendered).toBeTruthy();

        mockStore.setLines(20, 30);
        expect(mockStore.areLinesRendered).toBeFalsy();
    });

    it('should set mark lines as rendered when function is called', () => {
        const mockStore = new LabelerVirtualizationStore();
        mockStore.markLinesAsRendered();

        expect(mockStore.areLinesRendered).toBeTruthy();
    });

    it('should debounce update of line heights', () => {
        const mockStore = new LabelerVirtualizationStore();
        mockStore.updateLineHeight(0, 10);

        expect(mockStore.lineHeights).toEqual([]);

        jest.advanceTimersByTime(LINE_HEIGHT_CHANGE_DEBOUNCE);
        expect(mockStore.lineHeights).toEqual([10]);
    });
});
