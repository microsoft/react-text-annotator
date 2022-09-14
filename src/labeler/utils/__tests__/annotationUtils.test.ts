/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { getId } from '@fluentui/react/lib/Utilities';
import range from 'lodash.range';
import { LabelerA11yStore } from '../../stores/LabelerA11yStore';
import { LineStore } from '../../stores/LineStore';
import { TokenStore } from '../../stores/TokenStore';
import { AnnotationData, AnnotationDomData, noop } from '../../types/labelerTypes';
import {
    annotationDataToAnnotationDomData,
    getAnnotationElementByKey,
    getAnnotationElementsByTokenIndex,
    getAnnotationTokenRangeAfterResizing,
    isAnnotationWithinIndices,
    onAnnotationKeyDown,
    reverseAnnotation,
    sortAnnotations
} from '../../utils/annotationUtils';
import {
    annotationDataAttribute,
    annotationEndTokenIndexDataAttribute,
    annotationIndexDataAttribute,
    annotationStartTokenIndexDataAttribute,
    LabelerKeyCodes
} from '../../utils/labelerConstants';

describe('annotationUtils unit tests', () => {
    describe('getAnnotationElementByKey and getAnnotationElementsByTokenIndex unit tests', () => {
        it('should call query selector on ref with correct values', () => {
            const spy = jest.fn();

            getAnnotationElementByKey({ querySelector: spy } as any, '7ammo');
            expect(spy).toHaveBeenCalledWith(`[${annotationDataAttribute}][${annotationIndexDataAttribute}="7ammo"]`);
        });

        it('should call query selector on ref with correct values', () => {
            const spy = jest.fn().mockReturnValue([]);

            getAnnotationElementsByTokenIndex({ querySelectorAll: spy } as any, 10);
            expect(spy).toHaveBeenCalledWith(`[${annotationDataAttribute}]`);
        });

        it('should filter annotations that have start and end tokens intersecting with the given token index', () => {
            const fnGen = (attr1: string, attr2: string, value1: number, value2: number) => (input: string) =>
                input === attr1 ? value1 : input === attr2 ? value2 : undefined;

            const sA = annotationStartTokenIndexDataAttribute;
            const eA = annotationEndTokenIndexDataAttribute;

            const spy = jest.fn().mockReturnValue([
                { id: 1, getAttribute: fnGen(sA, eA, 1, 2) },
                { id: 2, getAttribute: fnGen(sA, eA, 5, 10) },
                { id: 3, getAttribute: fnGen(sA, eA, 8, 12) },
                { id: 4, getAttribute: fnGen(sA, eA, 10, 10) },
                { id: 5, getAttribute: fnGen(sA, eA, 10, 11) },
                { id: 6, getAttribute: fnGen(sA, eA, 12, 14) }
            ]);

            const data = getAnnotationElementsByTokenIndex({ querySelectorAll: spy } as any, 10);

            expect(data.map(d => d.id)).toEqual([2, 3, 4, 5]);
        });
    });

    describe('isAnnotationWithinIndices unit tests', () => {
        const getMockData = (startLine: number, endLine: number): AnnotationDomData => ({
            id: '7ammo',
            kind: 'label',
            name: '7ammo',
            startToken: 0,
            endToken: 10,
            lineSegments: [
                { lineIndex: startLine, startToken: 0, endToken: 10 },
                { lineIndex: endLine, startToken: 0, endToken: 10 }
            ]
        });

        it('should return true when annotation is within given line indices', () => {
            expect(isAnnotationWithinIndices(getMockData(0, 0), 0, 10)).toBeTruthy();
            expect(isAnnotationWithinIndices(getMockData(2, 2), 0, 10)).toBeTruthy();
            expect(isAnnotationWithinIndices(getMockData(8, 12), 0, 10)).toBeTruthy();
            expect(isAnnotationWithinIndices(getMockData(3, 7), 5, 10)).toBeTruthy();
            expect(isAnnotationWithinIndices(getMockData(7, 7), 5, 10)).toBeTruthy();
        });

        it('should return false when annotation is not within given line indices', () => {
            expect(isAnnotationWithinIndices(getMockData(11, 12), 0, 10)).toBeFalsy();
            expect(isAnnotationWithinIndices(getMockData(12, 12), 0, 10)).toBeFalsy();
            expect(isAnnotationWithinIndices(getMockData(3, 4), 5, 10)).toBeFalsy();
            expect(isAnnotationWithinIndices(getMockData(11, 13), 5, 10)).toBeFalsy();
        });
    });

    describe('sortAnnotations unit tests', () => {
        it('should sort a before b when start token of a is smaller than b and reverse when descending', () => {
            const a: AnnotationData = { id: 'annotation_1', startToken: 10, endToken: 15, name: '7ammo', kind: 'label' };
            const b: AnnotationData = { id: 'annotation_2', startToken: 13, endToken: 19, name: '7ammo', kind: 'label' };

            expect(sortAnnotations('ascending')(a, b)).toEqual(-1);
            expect(sortAnnotations('descending')(a, b)).toEqual(1);
        });

        it('should sort b before a when start token of a is larger than b and reverse when descending', () => {
            const a: AnnotationData = { id: 'annotation_1', startToken: 15, endToken: 15, name: '7ammo', kind: 'label' };
            const b: AnnotationData = { id: 'annotation_2', startToken: 13, endToken: 19, name: '7ammo', kind: 'label' };

            expect(sortAnnotations('ascending')(a, b)).toEqual(1);
            expect(sortAnnotations('descending')(a, b)).toEqual(-1);
        });

        it('should sort a before b when start tokens are equal and a end token is smaller than b and reverse when descending', () => {
            const a: AnnotationData = { id: 'annotation_1', startToken: 15, endToken: 15, name: '7ammo', kind: 'label' };
            const b: AnnotationData = { id: 'annotation_2', startToken: 15, endToken: 19, name: '7ammo', kind: 'label' };

            expect(sortAnnotations('ascending')(a, b)).toEqual(-1);
            expect(sortAnnotations('descending')(a, b)).toEqual(1);
        });

        it('should sort b before a when start tokens are equal and b end token is smaller than a and reverse when descending', () => {
            const a: AnnotationData = { id: 'annotation_1', startToken: 15, endToken: 20, name: '7ammo', kind: 'label' };
            const b: AnnotationData = { id: 'annotation_2', startToken: 15, endToken: 18, name: '7ammo', kind: 'label' };

            expect(sortAnnotations('ascending')(a, b)).toEqual(1);
            expect(sortAnnotations('descending')(a, b)).toEqual(-1);
        });

        it('should sort b before a when both start and end tokens are equal and reverse when descending', () => {
            const a: AnnotationData = { id: 'annotation_1', startToken: 15, endToken: 20, name: '7ammo', kind: 'label' };
            const b: AnnotationData = { id: 'annotation_2', startToken: 15, endToken: 18, name: '7ammo', kind: 'label' };

            expect(sortAnnotations('ascending')(a, b)).toEqual(1);
            expect(sortAnnotations('descending')(a, b)).toEqual(-1);
        });
    });

    describe('reverseAnnotation unit tests', () => {
        it('should not reverse annotations if start token is smaller than end token', () => {
            let mockAnnotation = reverseAnnotation({ id: 'annotation_1', startToken: 0, endToken: 10, name: '7ammo', kind: 'label' });
            expect(mockAnnotation.isReversed).toBeUndefined();

            mockAnnotation = reverseAnnotation({ id: 'annotation_2', startToken: 10, endToken: 10, name: '7ammo', kind: 'label' });
            expect(mockAnnotation.isReversed).toBeUndefined();
        });

        it('should reverse annotations if start token is larger than end token', () => {
            let mockAnnotation = reverseAnnotation({ id: 'annotation_1', startToken: 15, endToken: 10, name: '7ammo', kind: 'label' });
            expect(mockAnnotation.isReversed).toBeTruthy();
            expect(mockAnnotation.startToken).toEqual(10);
            expect(mockAnnotation.endToken).toEqual(15);

            mockAnnotation = reverseAnnotation({ id: 'annotation_2', startToken: 15, endToken: 14, name: '7ammo', kind: 'label' });
            expect(mockAnnotation.isReversed).toBeTruthy();
            expect(mockAnnotation.startToken).toEqual(14);
            expect(mockAnnotation.endToken).toEqual(15);
        });
    });

    describe('annotationDataToAnnotationDomData unit tests', () => {
        const generateMockTokens = (count: number, start: number = 0) => range(start, start + count).map(c => new TokenStore(c, getId()));

        it('should spread the original annotation data is as in the output', () => {
            let mockAnnotation: AnnotationData = { id: 'annotation_1', startToken: 0, endToken: 4, kind: 'label', name: '7ammo' };
            let mockLineStores = [new LineStore(0, 1, generateMockTokens(5))];

            expect(annotationDataToAnnotationDomData({ annotation: mockAnnotation, lineStores: mockLineStores })).toEqual(
                expect.objectContaining({ id: 'annotation_1', startToken: 0, endToken: 4, kind: 'label', name: '7ammo' })
            );
        });

        it('should use annotation color if onRenderColor is defined', () => {
            let mockAnnotation: AnnotationData = {
                endToken: 4,
                startToken: 0,
                kind: 'label',
                name: '7ammo',
                color: 'yellow',
                id: 'annotation_1'
            };
            let mockLineStores = [new LineStore(0, 1, generateMockTokens(5))];

            expect(annotationDataToAnnotationDomData({ annotation: mockAnnotation, lineStores: mockLineStores }).color).toEqual('yellow');
        });

        it('should use onRenderColor function to get color if it is defined', () => {
            let mockAnnotation: AnnotationData = {
                endToken: 4,
                startToken: 0,
                kind: 'label',
                name: '7ammo',
                color: 'yellow',
                id: 'annotation_1'
            };
            let mockLineStores = [new LineStore(0, 1, generateMockTokens(5))];

            expect(
                annotationDataToAnnotationDomData({
                    annotation: mockAnnotation,
                    lineStores: mockLineStores,
                    onRenderAnnotationColor: () => 'red'
                }).color
            ).toEqual('red');
        });

        it('should calculate line segments correctly on one line', () => {
            let mockAnnotation: AnnotationData = {
                endToken: 4,
                startToken: 0,
                kind: 'label',
                name: '7ammo',
                color: 'yellow',
                id: 'annotation_1'
            };
            let mockLineStores = [new LineStore(0, 1, generateMockTokens(5))];
            const annotationData = annotationDataToAnnotationDomData({ annotation: mockAnnotation, lineStores: mockLineStores });

            expect(annotationData.lineSegments.length).toEqual(1);
            expect(annotationData.lineSegments[0].endToken).toEqual(4);
            expect(annotationData.lineSegments[0].lineIndex).toEqual(0);
            expect(annotationData.lineSegments[0].startToken).toEqual(0);
        });

        it('should calculate line segments correctly on multiple lines', () => {
            let mockAnnotation: AnnotationData = {
                endToken: 9,
                startToken: 3,
                kind: 'label',
                name: '7ammo',
                color: 'yellow',
                id: 'annotation_1'
            };
            let mockLineStores = [new LineStore(0, 1, generateMockTokens(5)), new LineStore(1, 1, generateMockTokens(5, 5))];
            const annotationData = annotationDataToAnnotationDomData({ annotation: mockAnnotation, lineStores: mockLineStores });

            expect(annotationData.lineSegments.length).toEqual(2);
            expect(annotationData.lineSegments[0].endToken).toEqual(4);
            expect(annotationData.lineSegments[0].lineIndex).toEqual(0);
            expect(annotationData.lineSegments[0].startToken).toEqual(3);

            expect(annotationData.lineSegments[1].endToken).toEqual(9);
            expect(annotationData.lineSegments[1].lineIndex).toEqual(1);
            expect(annotationData.lineSegments[1].startToken).toEqual(5);
        });

        it('should calculate line segments correctly on multiple lines (2)', () => {
            let mockAnnotation: AnnotationData = {
                endToken: 12,
                startToken: 3,
                kind: 'label',
                name: '7ammo',
                color: 'yellow',
                id: 'annotation_1'
            };
            let mockLineStores = [
                new LineStore(0, 1, generateMockTokens(5)),
                new LineStore(1, 1, generateMockTokens(5, 5)),
                new LineStore(2, 1, generateMockTokens(5, 10))
            ];
            const annotationData = annotationDataToAnnotationDomData({ annotation: mockAnnotation, lineStores: mockLineStores });

            expect(annotationData.lineSegments.length).toEqual(3);
            expect(annotationData.lineSegments[0].endToken).toEqual(4);
            expect(annotationData.lineSegments[0].lineIndex).toEqual(0);
            expect(annotationData.lineSegments[0].startToken).toEqual(3);

            expect(annotationData.lineSegments[1].endToken).toEqual(9);
            expect(annotationData.lineSegments[1].lineIndex).toEqual(1);
            expect(annotationData.lineSegments[1].startToken).toEqual(5);

            expect(annotationData.lineSegments[2].endToken).toEqual(12);
            expect(annotationData.lineSegments[2].lineIndex).toEqual(2);
            expect(annotationData.lineSegments[2].startToken).toEqual(10);
        });
    });

    describe('onAnnotationKeyDown unit tests', () => {
        const mockA11yStore = new LabelerA11yStore();
        let mockFocusLineByIndex: jest.SpyInstance;
        let mockFocusLineByDirection: jest.SpyInstance;
        let mockBlurCurrentAnnotation: jest.SpyInstance;
        let mockFocusTokenByDirection: jest.SpyInstance;
        let mockFocusAnnotationByDirection: jest.SpyInstance;
        const mockEvent = { stopPropagation: noop, preventDefault: noop };

        beforeEach(() => {
            mockFocusLineByIndex = jest.spyOn(mockA11yStore, 'focusLineByIndex').mockImplementation(noop);
            mockFocusLineByDirection = jest.spyOn(mockA11yStore, 'focusLineByDirection').mockImplementation(noop);
            mockFocusTokenByDirection = jest.spyOn(mockA11yStore, 'focusTokenByDirection').mockImplementation(noop);
            mockBlurCurrentAnnotation = jest.spyOn(mockA11yStore, 'blurCurrentAnnotation').mockImplementation(noop);
            mockFocusAnnotationByDirection = jest.spyOn(mockA11yStore, 'focusAnnotationByDirection').mockImplementation(noop);

            jest.clearAllMocks();
        });

        it('should focus annotation by direction correctly when ctrl and Arrow up or down is pressed', () => {
            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.ArrowDown, ctrlKey: true } as any, a11yStore: mockA11yStore });
            expect(mockFocusAnnotationByDirection).toHaveBeenLastCalledWith('next');

            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.ArrowUp, ctrlKey: true } as any, a11yStore: mockA11yStore });
            expect(mockFocusAnnotationByDirection).toHaveBeenLastCalledWith('previous');
        });

        it('should focus line by direction correctly when Arrow up or down is pressed', () => {
            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.ArrowDown } as any, a11yStore: mockA11yStore });
            expect(mockFocusLineByDirection).toHaveBeenLastCalledWith('next');

            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.ArrowUp } as any, a11yStore: mockA11yStore });
            expect(mockFocusLineByDirection).toHaveBeenLastCalledWith('previous');
        });

        it('should focus annotation by direction correctly when Home or End is pressed', () => {
            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.Home } as any, a11yStore: mockA11yStore });
            expect(mockFocusAnnotationByDirection).toHaveBeenLastCalledWith('first');

            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.End } as any, a11yStore: mockA11yStore });
            expect(mockFocusAnnotationByDirection).toHaveBeenLastCalledWith('last');
        });

        it('should focus tokens and blur annotation when right or left is pressed', () => {
            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.ArrowRight } as any, a11yStore: mockA11yStore });
            expect(mockFocusTokenByDirection).toHaveBeenLastCalledWith('next');

            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.ArrowLeft } as any, a11yStore: mockA11yStore });
            expect(mockFocusTokenByDirection).toHaveBeenLastCalledWith('previous');

            expect(mockBlurCurrentAnnotation).toHaveBeenCalledTimes(2);
        });

        it('should focus last focused line when Escape is clicked', () => {
            mockA11yStore.focusedLineIndex = 1;

            onAnnotationKeyDown({ event: { ...mockEvent, key: LabelerKeyCodes.Escape } as any, a11yStore: mockA11yStore });
            expect(mockBlurCurrentAnnotation).toHaveBeenCalled();
            expect(mockFocusLineByIndex).toHaveBeenLastCalledWith(1);
        });

        it('should not stop even default or propagation if keys are not handled', () => {
            const preventDefault = jest.fn();
            const stopPropagation = jest.fn();
            onAnnotationKeyDown({ event: { preventDefault, stopPropagation, key: 'A' } as any, a11yStore: mockA11yStore });

            expect(preventDefault).not.toHaveBeenCalled();
            expect(stopPropagation).not.toHaveBeenCalled();
        });
    });

    describe('getAnnotationTokenRangeAfterResizing unit tests', () => {
        it('should get new token range correctly when dragging the start knob to left', () => {
            const mockAnnotation: AnnotationData = {
                endToken: 10,
                name: '7ammo',
                startToken: 5,
                kind: 'label',
                id: 'annotation_1'
            };

            const expectedRange = {
                endIndex: 10,
                startIndex: 2,
                knob: 'start'
            };

            expect(getAnnotationTokenRangeAfterResizing(mockAnnotation, 'start', 2)).toEqual(expectedRange);
        });

        it('should get new token range correctly when dragging the start knob to right', () => {
            const mockAnnotation: AnnotationData = {
                endToken: 10,
                kind: 'label',
                name: '7ammo',
                startToken: 5,
                id: 'annotation_1'
            };

            const expectedRange = {
                knob: 'end',
                endIndex: 15,
                startIndex: 5
            };

            expect(getAnnotationTokenRangeAfterResizing(mockAnnotation, 'start', 15)).toEqual(expectedRange);
        });

        it('should get new token range correctly when dragging the end knob to right', () => {
            const mockAnnotation: AnnotationData = {
                endToken: 10,
                name: '7ammo',
                kind: 'label',
                startToken: 5,
                id: 'annotation_1'
            };

            const expectedRange = {
                knob: 'end',
                endIndex: 15,
                startIndex: 5
            };

            expect(getAnnotationTokenRangeAfterResizing(mockAnnotation, 'end', 15)).toEqual(expectedRange);
        });

        it('should get new token range correctly when dragging the end knob to left', () => {
            const mockAnnotation: AnnotationData = {
                endToken: 10,
                kind: 'label',
                name: '7ammo',
                startToken: 5,
                id: 'annotation_1'
            };

            const expectedRange = {
                endIndex: 10,
                startIndex: 2,
                knob: 'start'
            };

            expect(getAnnotationTokenRangeAfterResizing(mockAnnotation, 'end', 2)).toEqual(expectedRange);
        });
    });
});
