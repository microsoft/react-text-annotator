/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import * as React from 'react';
import { SvgRendererProps, SvgRootRenderer } from '../../../components/svgRenderers/SvgRootRenderer';
import { LabelerStore } from '../../../stores/LabelerStore';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';

describe('SvgRootRenderer unit tests', () => {
    const mockLabelerStore = new LabelerStore();

    const Wrapper = (props: Partial<SvgRendererProps>) => (
        <LabelerMockProvider labelerStore={mockLabelerStore}>
            <SvgRootRenderer svgRenderersProps={[]} {...props} />
        </LabelerMockProvider>
    );

    beforeEach(() => {
        mockLabelerStore.setLabelerDimensions(0, 0, 0, 0);
    });

    it('should suppress mouse down events', () => {
        const wrapper = mount(<Wrapper />);
        const mockEvent = { stopPropagation: jest.fn() };

        wrapper.find('svg').simulate('mousedown', mockEvent);
        expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should set labeler dimensions with height and width in the labeler store', () => {
        mockLabelerStore.setLabelerDimensions(10, 10, 10, 0);
        const wrapper = mount(<Wrapper />);
        const styles = getComputedStyle(wrapper.find('svg').getDOMNode());

        expect(styles).toEqual(expect.objectContaining({ height: '10px', width: '10px' }));
    });

    it('should set labeler dimensions with 100% if the labeler store dimensions are not set', () => {
        const wrapper = mount(<Wrapper />);
        const styles = getComputedStyle(wrapper.find('svg').getDOMNode());

        expect(styles).toEqual(expect.objectContaining({ height: '100%', width: '100%' }));
    });
});
