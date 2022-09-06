/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { useSelectionReaction } from '../../hooks/useSelectionReaction';
import { LabelerConfigStore } from '../../stores/LabelerConfigStore';
import { LabelerSelectionStore } from '../../stores/LabelerSelectionStore';
import { tokenDataAttribute, tokenIndexDataAttribute } from '../../utils/labelerConstants';

describe('useSelectionReaction unit tests', () => {
    const mockOnTokenSelect = jest.fn();
    let wrapper: ReactWrapper;
    let mockSelectionStore: LabelerSelectionStore;

    const MockWrapper = ({ selectionStore }: { selectionStore: LabelerSelectionStore }) => {
        const ref = React.useRef();

        useSelectionReaction(selectionStore, ref, mockOnTokenSelect);

        return (
            <div ref={ref}>
                <span {...{ [tokenDataAttribute]: 'true', [tokenIndexDataAttribute]: '2' }}></span>
                <span {...{ [tokenDataAttribute]: 'true', [tokenIndexDataAttribute]: '10' }}></span>
            </div>
        );
    };

    beforeEach(() => {
        mockSelectionStore = new LabelerSelectionStore(new LabelerConfigStore());

        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    afterEach(() => wrapper.unmount());

    it('should call onTokenSelect correctly after selecting one token', () => {
        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);

        mockSelectionStore.select(2);

        expect(mockOnTokenSelect).toBeCalledWith(2, 2, {
            start: wrapper
                .find('span')
                .first()
                .getDOMNode(),
            end: wrapper
                .find('span')
                .first()
                .getDOMNode()
        });
    });

    it('should call onTokenSelect correctly after selecting two distant tokens', () => {
        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);

        mockSelectionStore.select(2);
        mockSelectionStore.select(10);

        expect(mockOnTokenSelect).toBeCalledWith(2, 10, {
            start: wrapper
                .find('span')
                .first()
                .getDOMNode(),
            end: wrapper
                .find('span')
                .last()
                .getDOMNode()
        });
    });
});
