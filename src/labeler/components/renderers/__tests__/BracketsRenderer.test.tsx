/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import * as React from 'react';
import { BracketsRenderer } from '../../../components/renderers/BracketsRenderer';
import { LabelerStore } from '../../../stores/LabelerStore';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';

describe('BracketsRenderer unit tests', () => {
    const mockQuerySelector = jest.fn();
    const mockLabelerStore = new LabelerStore();
    const mockContainer = { querySelector: mockQuerySelector };

    const getMockElementClientRect = (top: number = 0, left: number = 0, right: number = 0) => ({
        getBoundingClientRect: () => ({ top, left, right })
    });

    const Wrapper = () => (
        <LabelerMockProvider labelerStore={mockLabelerStore}>
            <BracketsRenderer containerRef={mockContainer as any} />
        </LabelerMockProvider>
    );

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        mockLabelerStore.selectionStore.unHover();
        mockLabelerStore.configStore.setIsRtl(false);
        mockLabelerStore.selectionStore.cancelSelection();
        mockLabelerStore.selectionStore.setIsDragging(false);
    });

    it('should render left bracket based on token position when hover start is set', () => {
        mockLabelerStore.selectionStore.hover(5);
        mockQuerySelector.mockReturnValueOnce(getMockElementClientRect(10, 10, 10));

        const wrapper = mount(<Wrapper />);

        expect(mockQuerySelector).toHaveBeenCalledWith('[data-is-token][data-token-index="5"]');
        expect(wrapper.find('span').text()).toEqual('[');
        expect(wrapper.find('span').prop('style')).toEqual(expect.objectContaining({ top: 10, left: 6 }));
    });

    it('should render right bracket based on token position when hover start is set and rtl is true', () => {
        mockLabelerStore.selectionStore.hover(5);
        mockLabelerStore.configStore.setIsRtl(true);
        mockQuerySelector.mockReturnValueOnce(undefined).mockReturnValueOnce(getMockElementClientRect(10, 10, 10));

        const wrapper = mount(<Wrapper />);

        expect(wrapper.find('span').text()).toEqual(']');
    });

    it('should render brackets correctly when hover end is set', () => {
        mockLabelerStore.selectionStore.hover(5);
        mockLabelerStore.selectionStore.select(5);
        mockLabelerStore.selectionStore.hover(10);
        mockQuerySelector.mockClear();

        mount(<Wrapper />);

        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, '[data-is-token][data-token-index="5"]');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(2, '[data-is-token][data-token-index="10"]');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(3, '[data-is-token][data-token-index="5"]');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(4, '[data-is-token][data-token-index="5"]');
    });

    it('should render brackets correctly when selection start and end are set', () => {
        mockLabelerStore.selectionStore.select(5);
        mockQuerySelector.mockClear();

        mount(<Wrapper />);

        expect(mockQuerySelector).toHaveBeenNthCalledWith(1, '[data-is-token][data-token-index="-1"]');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(2, '[data-is-token][data-token-index="-1"]');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(3, '[data-is-token][data-token-index="5"]');
        expect(mockQuerySelector).toHaveBeenNthCalledWith(4, '[data-is-token][data-token-index="5"]');
    });
});
