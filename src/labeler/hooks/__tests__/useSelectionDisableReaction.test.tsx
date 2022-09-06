/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import { observer } from 'mobx-react';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { useSelectionDisableReaction } from '../../hooks/useSelectionDisableReaction';
import { LabelerStore } from '../../stores/LabelerStore';

describe('useSelectionDisableReaction unit tests', () => {
    const mockLabelerStore = new LabelerStore();
    const unHoverSpy = jest.spyOn(mockLabelerStore.selectionStore, 'unHover');
    const cancelSelectionSpy = jest.spyOn(mockLabelerStore.selectionStore, 'cancelSelection');

    const Wrapper = observer(() => {
        useSelectionDisableReaction(mockLabelerStore);

        return <>{mockLabelerStore.configStore.isSelectionDisabled}</>;
    });

    beforeEach(() => {
        jest.resetAllMocks();
        mockLabelerStore.configStore.setIsDisabled(false);
    });

    it('should call un-hover and cancel selection whenever isSelectionDisabled is true', () => {
        mount(<Wrapper />);

        expect(unHoverSpy).not.toHaveBeenCalled();
        expect(cancelSelectionSpy).not.toHaveBeenCalled();

        act(() => mockLabelerStore.configStore.setIsSelectionDisabled(true));

        expect(unHoverSpy).toHaveBeenCalled();
        expect(cancelSelectionSpy).toHaveBeenCalled();
    });

    it('should not call un-hover and cancel selection whenever isSelectionDisabled is false', () => {
        mount(<Wrapper />);

        expect(unHoverSpy).not.toHaveBeenCalled();
        expect(cancelSelectionSpy).not.toHaveBeenCalled();

        act(() => mockLabelerStore.configStore.setIsSelectionDisabled(false));

        expect(unHoverSpy).not.toHaveBeenCalled();
        expect(cancelSelectionSpy).not.toHaveBeenCalled();
    });
});
