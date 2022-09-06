/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerA11yStore } from '../../stores/LabelerA11yStore';
import {
    a11yTabIndexAttribute,
    annotationDataAttribute,
    annotationIndexDataAttribute,
    lineDataAttribute,
    lineIndexDataAttribute,
    tokenDataAttribute,
    tokenIndexDataAttribute
} from '../../utils/labelerConstants';

describe('LabelerA11yStore unit tests', () => {
    let mockFocus = jest.fn();
    let mockStore: LabelerA11yStore;
    let mockSetAttribute = jest.fn();
    let mockQuerySelector = jest.fn();
    let mockQuerySelectorAll = jest.fn();
    let mockRemoveAttribute = jest.fn();
    let mockGetBoundingClientRect = jest.fn();
    const mockRef: Partial<HTMLDivElement> = { querySelector: mockQuerySelector, querySelectorAll: mockQuerySelectorAll };

    const generateMockAnnotationElements = (tokenIndex: number, yCoords: number[]) => {
        const mockGetAttribute = (param: string, y: number) => (param === annotationIndexDataAttribute ? `${y}` : `${tokenIndex}`);

        return yCoords.map(y => ({ getBoundingClientRect: () => ({ y }), getAttribute: (p: string) => mockGetAttribute(p, y) }));
    };

    beforeEach(() => {
        jest.resetAllMocks();
        mockStore = new LabelerA11yStore();
        mockQuerySelector.mockReturnValue({
            focus: mockFocus,
            setAttribute: mockSetAttribute,
            removeAttribute: mockRemoveAttribute,
            getBoundingClientRect: mockGetBoundingClientRect
        });
        mockStore.initialize(<HTMLDivElement>mockRef, 10, 100);
        jest.clearAllMocks();
    });

    it('should initialize labeler a11y store correctly', () => {
        mockStore.initialize(<HTMLDivElement>mockRef, 10, 100);

        expect(mockStore.lineCount).toEqual(10);
        expect(mockStore.tokenCount).toEqual(100);
        expect(mockStore.focusedLineIndex).toEqual(0);
        expect(mockStore.containerRef).toEqual(mockRef);
        expect(mockRef.querySelector).toHaveBeenCalledWith(`[${lineDataAttribute}][${lineIndexDataAttribute}="0"]`);
        expect(mockSetAttribute).toHaveBeenCalledWith(a11yTabIndexAttribute, '0');
    });

    it('should initialize labeler a11y store correctly even if there are no lines', () => {
        mockQuerySelector.mockReturnValue(undefined);
        mockStore.initialize(<HTMLDivElement>mockRef, 0, 0);

        expect(mockStore.lineCount).toEqual(0);
        expect(mockStore.tokenCount).toEqual(0);
        expect(mockStore.focusedLineIndex).toEqual(0);
        expect(mockStore.containerRef).toEqual(mockRef);
        expect(mockRef.querySelector).toHaveBeenCalledWith(`[${lineDataAttribute}][${lineIndexDataAttribute}="0"]`);
        expect(mockSetAttribute).not.toHaveBeenCalled();
    });

    it('should query correct line element and update its attributes and state when focusing line', () => {
        mockStore.focusLineByIndex(5);

        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="5"]`);
        expect(mockSetAttribute).toHaveBeenCalledWith(a11yTabIndexAttribute, '0');
        expect(mockFocus).toHaveBeenCalled();
        expect(mockStore.focusedLineIndex).toEqual(5);
    });

    it('should blur current focused line when focusing another line', () => {
        mockStore.focusedLineIndex = 1;
        mockStore.focusLineByIndex(5);

        expect(mockQuerySelector).toHaveBeenNthCalledWith(2, `[${lineDataAttribute}][${lineIndexDataAttribute}="1"]`);
        expect(mockRemoveAttribute).toHaveBeenCalledWith(a11yTabIndexAttribute);
    });

    it('should focus correct line index with different directions', () => {
        mockStore.focusLineByDirection('first');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="0"]`);
        mockQuerySelector.mockClear();

        mockStore.focusLineByDirection('last');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="9"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedLineIndex = 5;
        mockStore.focusLineByDirection('next');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="6"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedLineIndex = 9;
        mockStore.focusLineByDirection('next');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="0"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedLineIndex = 9;
        mockStore.focusLineByDirection('next', false);
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="9"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedLineIndex = 5;
        mockStore.focusLineByDirection('previous');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="4"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedLineIndex = 0;
        mockStore.focusLineByDirection('previous');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="9"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedLineIndex = 0;
        mockStore.focusLineByDirection('previous', false);
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="0"]`);
        mockQuerySelector.mockClear();
    });

    it('should blur current token if it exists when focusing new line', () => {
        mockStore.focusedTokenIndex = 20;
        mockStore.focusLineByDirection('next');

        expect(mockQuerySelector).toHaveBeenLastCalledWith(`[${tokenDataAttribute}][${tokenIndexDataAttribute}="20"]`);
        expect(mockStore.focusedTokenIndex).toBeNull();
    });

    it('should not blur current token if no token was focused when focusing new line', () => {
        mockStore.focusLineByDirection('next');

        expect(mockQuerySelector).not.toHaveBeenLastCalledWith(`[${tokenDataAttribute}][${tokenIndexDataAttribute}="20"]`);
        expect(mockStore.focusedTokenIndex).toBeNull();
    });

    it('should query correct token element and update its attributes and state when focusing token', () => {
        mockStore.focusTokenByIndex(5);

        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="5"]`);
        expect(mockSetAttribute).toHaveBeenCalledWith(a11yTabIndexAttribute, '0');
        expect(mockFocus).toHaveBeenCalled();
        expect(mockStore.focusedTokenIndex).toEqual(5);
    });

    it('should blur current focused token when focusing another token', () => {
        mockStore.focusedTokenIndex = 1;
        mockStore.focusTokenByIndex(5);

        expect(mockQuerySelector).toHaveBeenNthCalledWith(2, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="1"]`);
        expect(mockRemoveAttribute).toHaveBeenCalledWith(a11yTabIndexAttribute);
    });

    it('should focus correct token index with different directions', () => {
        mockStore.focusTokenByDirection('first');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="0"]`);
        expect(mockQuerySelector).toHaveBeenNthCalledWith(3, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="0"]`);
        mockQuerySelector.mockClear();

        mockStore.focusTokenByDirection('last');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${lineDataAttribute}][${lineIndexDataAttribute}="9"]`);
        expect(mockQuerySelector).toHaveBeenNthCalledWith(3, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="99"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedTokenIndex = 5;
        mockStore.focusTokenByDirection('next');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="6"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedTokenIndex = 99;
        mockStore.focusTokenByDirection('next', true);
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="0"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedTokenIndex = 99;
        mockStore.focusTokenByDirection('next', false);
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="99"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedTokenIndex = 5;
        mockStore.focusTokenByDirection('previous');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="4"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedTokenIndex = 0;
        mockStore.focusTokenByDirection('previous', true);
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="99"]`);
        mockQuerySelector.mockClear();

        mockStore.focusedTokenIndex = 0;
        mockStore.focusTokenByDirection('previous', false);
        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, `[${tokenDataAttribute}][${tokenIndexDataAttribute}="0"]`);
        mockQuerySelector.mockClear();
    });

    it('should not query Dom if no current token is focused and blur token is called', () => {
        mockStore.blurCurrentToken();

        expect(mockQuerySelector).not.toHaveBeenCalled();
    });

    it('should query correct selectors if blur token is called', () => {
        mockStore.focusedTokenIndex = 10;
        mockStore.blurCurrentToken();

        expect(mockQuerySelector).toHaveBeenCalledWith(`[${tokenDataAttribute}][${tokenIndexDataAttribute}="10"]`);
        expect(mockRemoveAttribute).toHaveBeenCalledWith(a11yTabIndexAttribute);
        expect(mockStore.focusedTokenIndex).toBeNull();
    });

    it('should query for current focused annotation if it is focused when calling focus annotation by direction', () => {
        mockStore.focusedAnnotationKey = '7ammo';
        mockGetBoundingClientRect.mockReturnValue({ y: 0 });
        mockQuerySelectorAll.mockReturnValue([{ getBoundingClientRect: () => ({ y: 0 }), getAttribute: () => '0' }]);

        mockStore.focusAnnotationByDirection('next');

        expect(mockQuerySelector).toHaveBeenCalledWith(`[${annotationDataAttribute}][${annotationIndexDataAttribute}="7ammo"]`);
    });

    it('should query for current focused token if no annotation is focused when calling focus annotation by direction', () => {
        mockStore.focusedTokenIndex = 10;
        mockGetBoundingClientRect.mockReturnValue({ y: 0 });
        mockQuerySelectorAll.mockReturnValue([{ getBoundingClientRect: () => ({ y: 0 }), getAttribute: () => '10' }]);

        mockStore.focusAnnotationByDirection('next');

        expect(mockQuerySelector).toHaveBeenCalledWith(`[${tokenDataAttribute}][${tokenIndexDataAttribute}="10"]`);
    });

    it('should pick the nearest annotation to the focused token or annotation when token is focused', () => {
        mockStore.focusedTokenIndex = 10;
        mockGetBoundingClientRect.mockReturnValue({ y: 10 });
        mockQuerySelectorAll.mockReturnValue(generateMockAnnotationElements(10, [5, 11, 15]));

        mockStore.focusAnnotationByDirection('next');

        expect(mockQuerySelector).toHaveBeenLastCalledWith(`[${annotationDataAttribute}][${annotationIndexDataAttribute}="11"]`);
    });

    it('should pick the nearest annotation to the focused token or annotation when annotation is focused', () => {
        mockStore.focusedAnnotationKey = '11';
        mockStore.focusedTokenIndex = 10;
        mockGetBoundingClientRect.mockReturnValue({ y: 4 });
        mockQuerySelectorAll.mockReturnValue(generateMockAnnotationElements(10, [5, 11]));

        mockStore.focusAnnotationByDirection('next');

        expect(mockQuerySelector).toHaveBeenLastCalledWith(`[${annotationDataAttribute}][${annotationIndexDataAttribute}="11"]`);
    });

    it('should pick the annotation in circular fashion when previous is picked', () => {
        mockStore.focusedTokenIndex = 10;
        mockGetBoundingClientRect.mockReturnValue({ y: 4 });
        mockQuerySelectorAll.mockReturnValue(generateMockAnnotationElements(10, [5, 11]));

        mockStore.focusAnnotationByDirection('previous');

        expect(mockQuerySelector).toHaveBeenLastCalledWith(`[${annotationDataAttribute}][${annotationIndexDataAttribute}="11"]`);
    });

    it('should do nothing if there were no annotations found', () => {
        mockStore.focusedTokenIndex = 10;
        mockGetBoundingClientRect.mockReturnValue({ y: 4 });
        mockQuerySelectorAll.mockReturnValue(generateMockAnnotationElements(10, []));

        mockStore.focusAnnotationByDirection('previous');

        expect(mockQuerySelector).toHaveBeenCalledTimes(1);
    });
});
