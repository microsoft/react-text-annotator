/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import * as React from 'react';
import { TokenRenderer } from '../../../components/renderers/TokenRenderer';
import { LabelerStore } from '../../../stores/LabelerStore';
import { LineStore } from '../../../stores/LineStore';
import { TokenStore } from '../../../stores/TokenStore';
import { tokenDataAttribute, tokenIndexDataAttribute } from '../../../utils/labelerConstants';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';

describe('TokenRenderer unit tests', () => {
    const mockLabelerStore = new LabelerStore();
    const mockTokenStore = new TokenStore(1, 'Hello world');
    const mockLineStore = new LineStore(0, 1, [mockTokenStore]);

    const Wrapper = () => (
        <LabelerMockProvider labelerStore={mockLabelerStore}>
            <TokenRenderer tokenStore={mockTokenStore} lineStore={mockLineStore} />
        </LabelerMockProvider>
    );

    beforeEach(() => {
        mockLabelerStore.selectionStore.unHover();
        mockLabelerStore.selectionStore.cancelSelection();
        mockLabelerStore.selectionStore.setIsDragging(false);
        mockLabelerStore.configStore.setIsSelectionDisabled(false);
    });

    it('should render token store text correctly', () => {
        const wrapper = mount(<Wrapper />);

        expect(wrapper.text()).toEqual('Hello world');
    });

    it('should have a transparent background if token is not part of the selection', () => {
        const wrapper = mount(<Wrapper />);

        const innerSpan = wrapper.find(`[${tokenDataAttribute}]`).at(0);
        expect(innerSpan.prop('style')).toEqual(expect.objectContaining({ backgroundColor: 'transparent' }));
    });

    it('should have a non transparent background if token is part of the selection', () => {
        mockLabelerStore.selectionStore.select(0);
        mockLabelerStore.selectionStore.select(2);
        const wrapper = mount(<Wrapper />);

        const innerSpan = wrapper.find(`[${tokenDataAttribute}]`).at(0);
        expect(innerSpan.prop('style')).toEqual(expect.objectContaining({ backgroundColor: expect.not.stringContaining('transparent') }));
    });

    it('should not attach event listeners if selection is disabled', () => {
        const mock = jest.fn();
        mockLabelerStore.configStore.setIsSelectionDisabled(true);
        mockLabelerStore.setTokenEventListenersFactory(_ => ({ onMouseDown: mock }));

        const wrapper = mount(<Wrapper />);
        const parentSpan = wrapper.find(`[${tokenIndexDataAttribute}="1"]`).at(0);
        parentSpan.simulate('mousedown');

        expect(mock).not.toHaveBeenCalled();
    });

    it('should attach event listeners if selection is enabled', () => {
        const mock = jest.fn();
        mockLabelerStore.setTokenEventListenersFactory(_ => ({ onMouseDown: mock }));

        const wrapper = mount(<Wrapper />);
        const parentSpan = wrapper.find(`[${tokenIndexDataAttribute}="1"]`).at(0);
        parentSpan.simulate('mousedown');

        expect(mock).toHaveBeenCalled();
    });
});
