/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { useAnnotationResizer } from '../../hooks/useAnnotationResizer';
import { LabelerAnnotationsStore } from '../../stores/LabelerAnnotationsStore';
import { AnnotationData } from '../../types/labelerTypes';

describe('useAnnotationResizer unit tests', () => {
    const mockOnAnnotationResize = jest.fn();
    let wrapper: ReactWrapper;
    let mockAnnotationStore: LabelerAnnotationsStore;
    let mockUseAnnotationOnResize: (annotationId: string, knob: 'start' | 'end') => void;
    const mockAnnotations: AnnotationData[] = [{ id: 'annotation_1', name: '7ammo label', kind: 'label', startToken: 5, endToken: 10 }];

    const MockWrapper = ({ annotationStore }: { annotationStore: LabelerAnnotationsStore }) => {
        let { onResize } = useAnnotationResizer(annotationStore, mockOnAnnotationResize);
        mockUseAnnotationOnResize = onResize;
        return <></>;
    };

    beforeEach(() => {
        mockAnnotationStore = new LabelerAnnotationsStore();
        mockAnnotationStore.setAnnotations(mockAnnotations);

        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    afterEach(() => wrapper.unmount());

    it('should call onAnnotationResize correctly after resizing an annotation', () => {
        const map: any = {};
        document.body.addEventListener = jest.fn((event, callback) => {
            map[event] = callback;
        });

        wrapper = mount(<MockWrapper annotationStore={mockAnnotationStore} />);
        mockUseAnnotationOnResize('annotation_1', 'start');

        act(() => {
            map.mouseup();
            expect(mockOnAnnotationResize).toBeCalled();
        });
    });
});
