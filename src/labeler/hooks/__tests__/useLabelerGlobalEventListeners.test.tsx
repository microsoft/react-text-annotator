/**
 * Copyright (c) Microsoft. All rights reserved.
 */
import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { useLabelerGlobalEventListeners } from '../../hooks/useLabelerGlobalEventListeners';
import { LabelerConfigStore } from '../../stores/LabelerConfigStore';
import { LabelerSelectionStore } from '../../stores/LabelerSelectionStore';
import { GlobalEventExceptionPredicates, TokenToCharMapType } from '../../types/labelerTypes';
import { bracketDataAttribute, LabelerKeyCodes, tokenDataAttribute } from '../../utils/labelerConstants';

describe('useLabelerGlobalEventListeners unit tests', () => {
    const id = 'mockId';
    let wrapper: ReactWrapper;
    let container: HTMLDivElement;
    let mockSelectAll: jest.SpyInstance;
    const text = '7ammo Understanding';
    let mockCancelSelection: jest.SpyInstance;
    let mockSelectionStore: LabelerSelectionStore;
    const tokenToCharMap: TokenToCharMapType = new Map();
    text.split('').map((_, index) => tokenToCharMap.set(index, { startIndex: index, endIndex: index }));

    const MockWrapper = ({
        selectionStore,
        globalEventExceptionSelectors = {}
    }: {
        selectionStore: LabelerSelectionStore;
        globalEventExceptionSelectors?: GlobalEventExceptionPredicates;
    }) => {
        const mockRef = React.useRef<HTMLDivElement>();
        useLabelerGlobalEventListeners({
            text,
            selectionStore,
            tokenToCharMap,
            containerRef: mockRef as any,
            globalEventExceptionSelectors
        });

        return <div id={id} ref={mockRef}></div>;
    };

    beforeEach(() => {
        container = document.createElement('div');
        document.body.append(container);

        mockSelectionStore = new LabelerSelectionStore(new LabelerConfigStore());
        mockSelectAll = jest.spyOn(mockSelectionStore, 'selectAll');
        mockCancelSelection = jest.spyOn(mockSelectionStore, 'cancelSelection');

        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    afterEach(() => wrapper.unmount());

    it('should cancel selection if selection is in progress and Escape is pressed', () => {
        mockSelectionStore.select(10);

        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: LabelerKeyCodes.Escape }));

        expect(mockCancelSelection).toHaveBeenCalled();
    });

    it('should not cancel selection if no selection is in progress and Escape is pressed', () => {
        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: LabelerKeyCodes.Escape }));

        expect(mockCancelSelection).not.toHaveBeenCalled();
    });

    it('should copy selected text when copy shortcut is pressed', () => {
        mockSelectionStore.select(0);
        mockSelectionStore.select(4);

        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'C', ctrlKey: true }));

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('7ammo');
    });

    it('should not copy if there is no selected text and copy shortcut is pressed', () => {
        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'C', ctrlKey: true }));

        expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    });

    it('should select all when ctrl + a are pressed', () => {
        mockSelectionStore.select(0);
        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', ctrlKey: true }));

        expect(mockSelectAll).toHaveBeenCalled();
    });

    it('should not call prevent default when keys are not handled', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'B' });
        const mockPreventDefault = jest.spyOn(keyboardEvent, 'preventDefault');

        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(keyboardEvent);

        expect(mockPreventDefault).not.toHaveBeenCalled();
    });

    it('should cancel selection if click is outside labeler', () => {
        (document as any).hasAttribute = jest.fn();

        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(new MouseEvent('mousedown'));

        expect(mockCancelSelection).toHaveBeenCalled();
    });

    it('should cancel selection if clicked element is inside labeler but is not a token or bracket', () => {
        (document as any).hasAttribute = jest.fn().mockReturnValue(false);

        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(new MouseEvent('mousedown'));

        expect(mockCancelSelection).toHaveBeenCalled();
    });

    it('should not cancel selection if clicked element is a token is inside labeler', () => {
        (document as any).hasAttribute = jest.fn().mockImplementation(attr => attr === tokenDataAttribute);

        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />, { attachTo: container });
        document.getElementById(id).dispatchEvent(new MouseEvent('mousedown'));

        expect(mockCancelSelection).not.toHaveBeenCalled();
    });

    it('should not cancel selection if clicked element is a bracket is inside labeler', () => {
        (document as any).hasAttribute = jest.fn().mockImplementation(attr => attr === bracketDataAttribute);

        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />, { attachTo: container });
        document.getElementById(id).dispatchEvent(new MouseEvent('mousedown'));

        expect(mockCancelSelection).not.toHaveBeenCalled();
    });

    it('should cancel selection on wheel event if selection is in progress', () => {
        mockSelectionStore.select(0);
        wrapper = mount(<MockWrapper selectionStore={mockSelectionStore} />);
        document.dispatchEvent(new WheelEvent('wheel'));

        expect(mockCancelSelection).toHaveBeenCalled();
    });

    it('should not cancel selection on wheel event when predicate returns true', () => {
        wrapper = mount(
            <MockWrapper
                selectionStore={mockSelectionStore}
                globalEventExceptionSelectors={{ onWheel: e => (e.target as HTMLElement).id === id }}
            />,
            { attachTo: container }
        );
        document.getElementById(id).dispatchEvent(new WheelEvent('wheel'));

        expect(mockCancelSelection).not.toHaveBeenCalled();
    });

    it('should not cancel selection if mouse down predicate returns true', () => {
        container.hasAttribute = jest.fn().mockReturnValue(false);
        container.className = 'mockClass';

        wrapper = mount(
            <MockWrapper
                selectionStore={mockSelectionStore}
                globalEventExceptionSelectors={{ onMouseDown: e => (e.target as HTMLElement).className === 'mockClass' }}
            />,
            { attachTo: container }
        );
        container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

        expect(mockCancelSelection).not.toHaveBeenCalled();
    });

    it('should not cancel selection if key down predicate returns true', () => {
        container.className = 'mockClass';
        mockSelectionStore.select(10);

        wrapper = mount(
            <MockWrapper
                selectionStore={mockSelectionStore}
                globalEventExceptionSelectors={{ onKeyDown: e => (e.target as HTMLElement).className === 'mockClass' }}
            />
        );
        container.dispatchEvent(new KeyboardEvent('keydown', { key: LabelerKeyCodes.Escape, bubbles: true }));

        expect(mockCancelSelection).not.toHaveBeenCalled();
    });
});
