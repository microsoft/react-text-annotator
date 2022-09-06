/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerAnnotationsStore } from '../../stores/LabelerAnnotationsStore';
import { AnnotationData } from '../../types/labelerTypes';

describe('LabelerAnnotationsStore unit tests', () => {
    let mockStore: LabelerAnnotationsStore;
    const mockAnnotations: AnnotationData[] = [{ id: 'annotation_1', name: '7ammo label', kind: 'label', startToken: 5, endToken: 10 }];
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

    beforeEach(() => {
        mockStore = new LabelerAnnotationsStore();
    });

    it('should initialize labeler annotation store correctly', () => {
        expect(mockStore.annotations).toEqual([]);
    });

    it('should set annotations correctly', () => {
        mockStore.setAnnotations(mockAnnotations);

        expect(mockStore.annotations).toEqual(mockAnnotations);
    });

    it('should update annotation range correctly', () => {
        mockStore.setAnnotations(mockAnnotations);
        mockStore.startAnnotationResize(mockAnnotations[0].id, 8, mockAnnotations[0].endToken);

        expect(mockStore.annotations[0].startToken).toEqual(8);
        expect(mockStore.annotations[0].endToken).toEqual(10);
    });

    it('should calculate the annotations per token map correctly', () => {
        const mockAnnotations: AnnotationData[] = [
            getMockAnnotation('annotation_1', 0, 5),
            getMockAnnotation('annotation_2', 2, 6),
            getMockAnnotation('annotation_3', 0, 3),
            getMockAnnotation('annotation_4', 7, 9)
        ];

        mockStore.initialize(10);
        mockStore.setAnnotations(mockAnnotations);
        const map = mockStore.annotationsPerTokenMap;

        expect(map.size).toBe(10);
        expect(map.get(0)).toEqual([getMockAnnotation('annotation_1', 0, 5), getMockAnnotation('annotation_3', 0, 3)]);
        expect(map.get(1)).toEqual([getMockAnnotation('annotation_1', 0, 5), getMockAnnotation('annotation_3', 0, 3)]);
        expect(map.get(2)).toEqual([
            getMockAnnotation('annotation_1', 0, 5),
            getMockAnnotation('annotation_2', 2, 6),
            getMockAnnotation('annotation_3', 0, 3)
        ]);
        expect(map.get(3)).toEqual([
            getMockAnnotation('annotation_1', 0, 5),
            getMockAnnotation('annotation_2', 2, 6),
            getMockAnnotation('annotation_3', 0, 3)
        ]);
        expect(map.get(4)).toEqual([getMockAnnotation('annotation_1', 0, 5), getMockAnnotation('annotation_2', 2, 6)]);
        expect(map.get(5)).toEqual([getMockAnnotation('annotation_1', 0, 5), getMockAnnotation('annotation_2', 2, 6)]);
        expect(map.get(6)).toEqual([getMockAnnotation('annotation_2', 2, 6)]);
        expect(map.get(7)).toEqual([getMockAnnotation('annotation_4', 7, 9)]);
        expect(map.get(8)).toEqual([getMockAnnotation('annotation_4', 7, 9)]);
        expect(map.get(9)).toEqual([getMockAnnotation('annotation_4', 7, 9)]);
    });
});
