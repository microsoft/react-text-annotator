/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerA11yStore } from '../../stores/LabelerA11yStore';
import { LabelerConfigStore } from '../../stores/LabelerConfigStore';
import { LabelerSelectionStore } from '../../stores/LabelerSelectionStore';
import { LineStore } from '../../stores/LineStore';
import { TokenStore } from '../../stores/TokenStore';
import { AnnotationData, noop, noopUndefined } from '../../types/labelerTypes';
import { LabelerKeyCodes, tokenDataAttribute, tokenIndexDataAttribute } from '../../utils/labelerConstants';
import {
    calculateLabelTokenPadding,
    calculateMaxTokenPadding,
    calculatePredictionTokenPadding,
    calculateRelationTokenPadding,
    getElementWithAttribute,
    getNewLabelerTokenElementByIndex,
    getTokenEventListenersFactory
} from '../../utils/tokenUtils';

describe('tokenUtils unit tests', () => {
    const getMockAnnotation = (
        id: string,
        startToken: number,
        endToken: number,
        kind: string = 'label',
        level: number = 0
    ): AnnotationData => ({
        id,
        kind,
        endToken,
        startToken,
        level: level,
        name: `${startToken}_${endToken}`
    });

    describe('getNewLabelerTokenElementByIndex unit tests', () => {
        it('should call query selector on ref with correct values', () => {
            const spy = jest.fn();

            getNewLabelerTokenElementByIndex({ querySelector: spy } as any, 1);
            expect(spy).toHaveBeenCalledWith(`[${tokenDataAttribute}][${tokenIndexDataAttribute}="${1}"]`);
        });
    });

    describe('calculateLabelTokenPadding unit tests', () => {
        it('should calculate padding for labels correctly', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculateLabelTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 1),
                    getMockAnnotation('annotation_2', 2, 3)
                ])
            ).toEqual([0, 20]);
        });

        it('should count negative labels with labels for padding', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculateLabelTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 1),
                    getMockAnnotation('annotation_2', 2, 3, 'negativeLabel')
                ])
            ).toEqual([0, 20]);
        });

        it('should calculate padding for labels with different levels correctly', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculateLabelTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 1),
                    getMockAnnotation('annotation_2', 2, 3, 'label', 1)
                ])
            ).toEqual([0, 40]);
        });

        it('should not count non label annotations for padding', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculateLabelTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 1),
                    getMockAnnotation('annotation_2', 2, 3, 'relation')
                ])
            ).toEqual([0, 20]);
        });

        it('should give zeros for no labels', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculateLabelTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 1, 'relation'),
                    getMockAnnotation('annotation_2', 2, 3, 'relation')
                ])
            ).toEqual([0, 0]);
        });
    });

    describe('calculateRelationTokenPadding unit tests', () => {
        it('should calculate padding for relations correctly', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculateRelationTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 1, 'relation'),
                    getMockAnnotation('annotation_2', 2, 3, 'relation')
                ])
            ).toEqual([48, 0]);
        });

        it('should get no padding when there are no relations', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculateRelationTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 1),
                    getMockAnnotation('annotation_2', 2, 3)
                ])
            ).toEqual([0, 0]);
        });

        it('should not count non relation annotations for padding', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculateRelationTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 1),
                    getMockAnnotation('annotation_2', 2, 3, 'relation')
                ])
            ).toEqual([30, 0]);
        });
    });

    describe('calculatePredictionTokenPadding unit tests', () => {
        it('should calculate vertical padding for predictions correctly when there are no predictions', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculatePredictionTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 2, 'label'),
                    getMockAnnotation('annotation_2', 0, 2, 'relation')
                ])
            ).toEqual([0, 0]);
        });

        it('should calculate vertical padding for a prediction with level 0 correctly', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(calculatePredictionTokenPadding(mockTokenStore, [getMockAnnotation('annotation_1', 0, 2, 'prediction')])).toEqual([
                9,
                9
            ]);
        });

        it('should calculate vertical padding for predictions with levels larger than 0 correctly', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculatePredictionTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 2, 'prediction'),
                    getMockAnnotation('annotation_2', 3, 4, 'prediction', 1)
                ])
            ).toEqual([20, 20]);
        });

        it('should calculate vertical padding for predictions with multiple levels correctly', () => {
            const mockTokenStore = new TokenStore(0, '7ammo');
            expect(
                calculatePredictionTokenPadding(mockTokenStore, [
                    getMockAnnotation('annotation_1', 0, 2, 'prediction'),
                    getMockAnnotation('annotation_2', 3, 4, 'prediction', 2),
                    getMockAnnotation('annotation_3', 3, 4, 'prediction', 4)
                ])
            ).toEqual([80, 80]);
        });
    });

    describe('calculateMaxTokenPadding unit tests', () => {
        it('should calculate the padding steps correctly', () => {
            const mockTokenStores = [new TokenStore(1, 'A'), new TokenStore(2, 'B')];
            const mockCalculators = [
                (tokenStore: TokenStore): [number, number] => (tokenStore.index === 1 ? [5, 5] : [10, 10]),
                (tokenStore: TokenStore): [number, number] => (tokenStore.index === 1 ? [15, 15] : [20, 20])
            ];

            const results = calculateMaxTokenPadding(mockTokenStores, mockCalculators, new Map());
            expect(results).toEqual([20, 20]);
        });
    });

    describe('getTokenEventListenersFactory unit tests', () => {
        const mockA11yStore = new LabelerA11yStore();
        const mockTokenStore = new TokenStore(0, '7');
        const mockSelectionStore = new LabelerSelectionStore(new LabelerConfigStore());
        const mockLineStore = new LineStore(0, 1, [mockTokenStore, new TokenStore(1, 'a'), new TokenStore(2, 'm')]);
        const mockEvent = { stopPropagation: noop, preventDefault: noop };
        const mockAnnotationsPerTokenMap = new Map();
        const eventListeners = (tokenStore: TokenStore = mockTokenStore) =>
            getTokenEventListenersFactory({
                a11yStore: mockA11yStore,
                selectionStore: mockSelectionStore
            })({
                tokenStore,
                lineStore: mockLineStore
            });

        let mockHover: jest.SpyInstance;
        let mockSelect: jest.SpyInstance;
        let mockUnHover: jest.SpyInstance;
        let mockSetIsDragging: jest.SpyInstance;
        let mockFocusLineByIndex: jest.SpyInstance;
        let mockFocusTokenByIndex: jest.SpyInstance;
        let mockFocusTokenByDirection: jest.SpyInstance;
        let mockFocusAnnotationByDirection: jest.SpyInstance;

        beforeEach(() => {
            mockSelectionStore.unHover();
            mockAnnotationsPerTokenMap.clear();
            mockSelectionStore.cancelSelection();
            mockSelectionStore.setIsDragging(false);

            mockFocusLineByIndex = jest.spyOn(mockA11yStore, 'focusLineByIndex').mockImplementation(noop);
            mockFocusTokenByIndex = jest.spyOn(mockA11yStore, 'focusTokenByIndex').mockImplementation(noop);
            mockFocusTokenByDirection = jest.spyOn(mockA11yStore, 'focusTokenByDirection').mockImplementation(noop);
            mockFocusAnnotationByDirection = jest.spyOn(mockA11yStore, 'focusAnnotationByDirection').mockImplementation(noop);

            mockHover = jest.spyOn(mockSelectionStore, 'hover').mockImplementation(noop);
            mockSelect = jest.spyOn(mockSelectionStore, 'select').mockImplementation(noop);
            mockUnHover = jest.spyOn(mockSelectionStore, 'unHover').mockImplementation(noop);
            mockSetIsDragging = jest.spyOn(mockSelectionStore, 'setIsDragging').mockImplementation(noop);

            jest.clearAllMocks();
        });

        it('should mark token as hovered when no dragging is in progress and mouseOver is called', () => {
            eventListeners().onMouseEnter(undefined);
            expect(mockHover).toHaveBeenCalledWith(0);
        });

        it('should mark token as selected when drag is in progress and mouseOver is called', () => {
            mockSetIsDragging.mockRestore();
            mockSelectionStore.setIsDragging(true);

            eventListeners().onMouseEnter(undefined);
            expect(mockSelect).toHaveBeenCalled();
        });

        it('should mark dragging as true when mouseDown is called', () => {
            eventListeners().onMouseDown({ stopPropagation: noopUndefined } as any);
            expect(mockSetIsDragging).toHaveBeenCalledWith(true);
        });

        it('should select the token when mouse is down', () => {
            eventListeners().onMouseDown({ stopPropagation: noopUndefined } as any);
            expect(mockSelect).toHaveBeenCalled();
        });

        it('should set isDragging as false when mouse up is called ', () => {
            mockSelectionStore.setIsDragging(true);
            eventListeners().onMouseUp(<any>mockEvent);
            expect(mockSetIsDragging).toHaveBeenCalledWith(false);
        });

        it('should unHover when mouse leaves token', () => {
            mockSelectionStore.hover(0);
            eventListeners().onMouseLeave(undefined);
            expect(mockUnHover).toHaveBeenCalled();
        });

        it('should focus correct direction when right or left arrow key is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.ArrowRight, ...mockEvent });
            expect(mockFocusTokenByDirection).toHaveBeenLastCalledWith('next');

            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.ArrowLeft, ...mockEvent });
            expect(mockFocusTokenByDirection).toHaveBeenLastCalledWith('previous');
        });

        it('should focus correct first or last token when ctrl, and Home or End key is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Home, ctrlKey: true, ...mockEvent });
            expect(mockFocusTokenByDirection).toHaveBeenLastCalledWith('first');

            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.End, ctrlKey: true, ...mockEvent });
            expect(mockFocusTokenByDirection).toHaveBeenLastCalledWith('last');
        });

        it('should focus annotation when up or down arrow key is pressed with ctrl and annotations have a length of non zero', () => {
            const tokenStore = new TokenStore(0, '7');
            mockAnnotationsPerTokenMap.set(0, [{ name: '7ammo', startToken: 0, endToken: 1, kind: 'label' }]);

            eventListeners(tokenStore).onKeyDown(<any>{ key: LabelerKeyCodes.ArrowDown, ctrlKey: true, ...mockEvent });
            expect(mockFocusAnnotationByDirection).toHaveBeenLastCalledWith('next');

            eventListeners(tokenStore).onKeyDown(<any>{ key: LabelerKeyCodes.ArrowUp, ctrlKey: true, ...mockEvent });
            expect(mockFocusAnnotationByDirection).toHaveBeenLastCalledWith('previous');
        });

        it('should not focus annotation when annotations have a length of zero', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.ArrowDown, ...mockEvent });
            expect(mockFocusAnnotationByDirection).not.toHaveBeenCalled();

            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.ArrowUp, ...mockEvent });
            expect(mockFocusAnnotationByDirection).not.toHaveBeenCalled();
        });

        it('should focus correct first or last token when Home or End key is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Home, ...mockEvent });
            expect(mockFocusTokenByIndex).toHaveBeenLastCalledWith(0);

            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.End, ...mockEvent });
            expect(mockFocusTokenByIndex).toHaveBeenLastCalledWith(2);
        });

        it('should focus the line that contains the token when Escape is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Escape, ...mockEvent });
            expect(mockFocusLineByIndex).toHaveBeenLastCalledWith(0);
        });

        it('should call select with focused token index when token space or Enter is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Enter, ...mockEvent });
            expect(mockSelect).toHaveBeenCalledWith(0);

            mockSelect.mockClear();

            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Space, ...mockEvent });
            expect(mockSelect).toHaveBeenCalledWith(0);
        });

        it('should not do anything if token selection is out of bounds', () => {
            mockSelectionStore.initialize(1, 1);
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.ArrowRight, ...mockEvent });
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.ArrowLeft, ...mockEvent });

            expect(mockSelect).not.toHaveBeenCalled();
            expect(mockUnHover).not.toHaveBeenCalled();
        });

        it('should select current token index and next current index when right arrow and shift is pressed', () => {
            mockSelectionStore.initialize(1, 5);
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.ArrowRight, shiftKey: true, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenNthCalledWith(1, 0);
            expect(mockSelect).toHaveBeenNthCalledWith(2, 1);
            expect(mockHover).not.toHaveBeenCalled();
        });

        it('should hover current token index when right arrow only is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.ArrowRight, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockHover).toHaveBeenCalled();
        });

        it('should select 0 absolute index when Home, Ctrl, and Shift are pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Home, ctrlKey: true, shiftKey: true, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith(0);
        });

        it('should select first token index in line when Home and Shift are pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Home, shiftKey: true, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockHover).not.toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith(0);
        });

        it('should hover over 0 absolute index when Home and Ctrl are pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Home, ctrlKey: true, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).not.toHaveBeenCalled();
            expect(mockHover).toHaveBeenCalledWith(0);
        });

        it('should hover over first token in line when Home is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.Home, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).not.toHaveBeenCalled();
            expect(mockHover).toHaveBeenCalledWith(0);
        });

        it('should select absolute end when End, Ctrl, and Shift is pressed', () => {
            mockSelectionStore.initialize(1, 10);
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.End, ctrlKey: true, shiftKey: true, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith(9);
            expect(mockHover).not.toHaveBeenCalled();
        });

        it('should select line end token when End and Shift is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.End, shiftKey: true, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith(2);
            expect(mockHover).not.toHaveBeenCalled();
        });

        it('should hover over absolute end token when End and Ctrl is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.End, ctrlKey: true, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).not.toHaveBeenCalled();
            expect(mockHover).toHaveBeenCalledWith(9);
        });

        it('should hover over line end token when End is pressed', () => {
            eventListeners().onKeyDown(<any>{ key: LabelerKeyCodes.End, ...mockEvent });

            expect(mockUnHover).toHaveBeenCalled();
            expect(mockSelect).not.toHaveBeenCalled();
            expect(mockHover).toHaveBeenCalledWith(2);
        });
    });

    describe('getElementWithAttribute unit tests', () => {
        it('should get the element with the given attribute correctly', () => {
            const element1 = document.createElement('span');
            element1.setAttribute('hidden', 'true');
            const element2 = document.createElement('span');

            expect(getElementWithAttribute([element1, element2], 'hidden')).toEqual(element1);
            expect(getElementWithAttribute([element1, element2], 'checked')).toEqual(null);
        });

        it('should get the child element with the given attribute correctly', () => {
            const element1 = document.createElement('span');
            const element2 = document.createElement('span');
            element2.setAttribute('hidden', 'true');
            element1.appendChild(element2);
            const element3 = document.createElement('span');

            expect(getElementWithAttribute([element1, element2, element3], 'hidden')).toEqual(element2);
        });
    });
});
