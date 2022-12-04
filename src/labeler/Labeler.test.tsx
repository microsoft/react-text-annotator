/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { Labeler } from './Labeler';
import { LabelerA11yStore } from './stores/LabelerA11yStore';
import { LabelerAnnotationsStore } from './stores/LabelerAnnotationsStore';
import { LabelerConfigStore } from './stores/LabelerConfigStore';
import { LabelerSelectionStore } from './stores/LabelerSelectionStore';
import { LabelerVirtualizationStore } from './stores/LabelerVirtualizationStore';
import { AnnotationData, noop, noopUndefined } from './types/labelerTypes';

const onLabelerMount = jest.fn();
const setTokenEventListenersFactory = jest.fn();
const mockConfigStore = new LabelerConfigStore();
let annotationStore = new LabelerAnnotationsStore();

jest.mock('./stores/LabelerStore', () => ({
    LabelerStore: function() {
        return {
            onLabelerMount,
            configStore: mockConfigStore,
            setTokenEventListenersFactory,
            annotationStore: annotationStore,
            a11yStore: new LabelerA11yStore(),
            virtualizationStore: new LabelerVirtualizationStore(),
            selectionStore: new LabelerSelectionStore(mockConfigStore)
        };
    }
}));

describe('Labeler unit tests', () => {
    beforeEach(() => {
        annotationStore = new LabelerAnnotationsStore();
        jest.resetAllMocks();
    });

    it('should mark labeler as mounted at initialization', () => {
        const wrapper = mount(<Labeler text="" annotations={[]} />);

        wrapper.update();

        expect(onLabelerMount).toHaveBeenCalled();
    });

    it('should merge and pass in token listeners to layout controller', () => {
        const wrapper = mount(
            <Labeler text="7ammo" annotations={[]} tokenEventListenersWithDeps={{ factory: _ => ({ onClick: noop }), deps: [] }} />
        );

        wrapper.update();

        const factory = setTokenEventListenersFactory.mock.calls[0][0];
        const eventKeys = Object.keys(factory({}));

        expect(eventKeys).toContain('onClick');
        expect(eventKeys).toContain('onMouseDown');
    });

    it('should reverse annotations if start index is larger than end index', () => {
        const mockAnnotations = [
            { id: 'annotation_1', name: '7ammoStart', kind: 'label', startToken: 0, endToken: 2 },
            { id: 'annotation_2', name: '7ammoMiddle', kind: 'label', startToken: 1, endToken: 0 }
        ];
        const wrapper = mount(<Labeler text="7ammo" annotations={mockAnnotations} />);
        wrapper.update();

        const reversedAnnotations: AnnotationData[] = annotationStore.annotations;

        expect(reversedAnnotations[0].isReversed).toBeUndefined();
        expect(reversedAnnotations[0].startToken).toEqual(0);
        expect(reversedAnnotations[0].endToken).toEqual(2);

        expect(reversedAnnotations[1].isReversed).toBeTruthy();
        expect(reversedAnnotations[1].startToken).toEqual(0);
        expect(reversedAnnotations[1].endToken).toEqual(1);
    });

    it('should set annotation onClick to onAnnotationClick passed to the labeler if the annotation does not contain onClick function', () => {
        const onAnnotationClick = jest.fn();

        const mockAnnotations = [{ id: 'annotation_1', name: '7ammoStart', kind: 'label', startToken: 0, endToken: 2 }];
        const wrapper = mount(<Labeler text="7ammo" annotations={mockAnnotations} onAnnotationClick={onAnnotationClick} />);
        wrapper.update();

        const reversedAnnotations: AnnotationData[] = annotationStore.annotations;
        reversedAnnotations[0].onClick(noopUndefined());

        expect(onAnnotationClick).toBeCalled();
    });

    it('should set annotation onClick to onClick function passed to the annotation.', () => {
        const onAnnotationClick1 = jest.fn();
        const onAnnotationClick2 = jest.fn();

        const mockAnnotations = [
            { id: 'annotation_1', name: '7ammoStart', kind: 'label', startToken: 0, endToken: 2, onClick: onAnnotationClick2 }
        ];
        const wrapper = mount(<Labeler text="7ammo" annotations={mockAnnotations} onAnnotationClick={onAnnotationClick1} />);
        wrapper.update();

        const reversedAnnotations: AnnotationData[] = annotationStore.annotations;
        reversedAnnotations[0].onClick(noopUndefined());

        expect(onAnnotationClick2).toBeCalled();
    });

    it('should call onAnnotationResize passed to the labeler if the annotation is resized', () => {
        const onAnnotationResize = jest.fn();
        const map: any = {};
        document.body.addEventListener = jest.fn((event, callback) => {
            map[event] = callback;
        });

        const mockAnnotations = [{ id: 'annotation_1', name: '7ammoStart', kind: 'label', startToken: 0, endToken: 2 }];

        const wrapper = mount(<Labeler text="7ammo" annotations={mockAnnotations} onAnnotationResize={onAnnotationResize} />);
        act(() => {
            wrapper.update();

            const reversedAnnotations: AnnotationData[] = annotationStore.annotations;
            reversedAnnotations[0].onResize('start');
            map.mouseup();

            expect(onAnnotationResize).toBeCalled();
        });
    });
});
