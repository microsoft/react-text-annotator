/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerConfigStore } from '../../stores/LabelerConfigStore';
import { LabelerSelectionStore } from '../../stores/LabelerSelectionStore';

describe('LabelerSelectionStore unit tests', () => {
    const mockConfigStore = new LabelerConfigStore();
    let mockSelectionStore: LabelerSelectionStore;

    beforeEach(() => {
        mockConfigStore.setIsSelectionDisabled(false);
        mockSelectionStore = new LabelerSelectionStore(mockConfigStore);
    });

    it('should initialize labeler selection store correctly', () => {
        mockSelectionStore.initialize(10, 100);

        expect(mockSelectionStore.lineCount).toEqual(10);
        expect(mockSelectionStore.tokenCount).toEqual(100);
    });

    it('should isHovered be truthy when either the hover start or end is not null', () => {
        mockSelectionStore.hover(0);

        expect(mockSelectionStore.isHovered).toBeTruthy();
    });

    it('should isHovered be falsy when hover indices are null', () => {
        expect(mockSelectionStore.hoverStart).toEqual(-1);
        expect(mockSelectionStore.hoverEnd).toEqual(-1);
        expect(mockSelectionStore.isHovered).toBeFalsy();
    });

    it('should return isSelectionInProgress as false if selection is disabled', () => {
        mockSelectionStore.select(0);
        mockConfigStore.setIsSelectionDisabled(true);

        expect(mockConfigStore.isSelectionDisabled).toBeTruthy();
        expect(mockSelectionStore.isSelectionInProgress).toBeFalsy();
    });

    it('should return isSelectionInProgress as false if no selection is made', () => {
        expect(mockSelectionStore.isSelectionInProgress).toBeFalsy();
    });

    it('should not hover if selection is disabled', () => {
        mockConfigStore.setIsSelectionDisabled(true);
        mockSelectionStore.hover(0);

        expect(mockSelectionStore.hoverStart).toEqual(-1);
        expect(mockSelectionStore.hoverEnd).toEqual(-1);
    });

    it('should mark start hover as the given index if hovered with no active selection', () => {
        mockSelectionStore.hover(0);

        expect(mockSelectionStore.hoverStart).toEqual(0);
        expect(mockSelectionStore.hoverEnd).toEqual(-1);
    });

    it('should update hover start index if hover index is smaller than selection start', () => {
        mockSelectionStore.select(5);
        mockSelectionStore.hover(0);

        expect(mockSelectionStore.hoverStart).toEqual(0);
        expect(mockSelectionStore.hoverEnd).toEqual(-1);
    });

    it('should update hover end index if hover index is greater than selection start', () => {
        mockSelectionStore.select(5);
        mockSelectionStore.hover(8);

        expect(mockSelectionStore.hoverStart).toEqual(-1);
        expect(mockSelectionStore.hoverEnd).toEqual(8);
    });

    it('should mark hover start and end as null if unHover and selection is disabled', () => {
        mockSelectionStore.hover(0);
        mockConfigStore.setIsSelectionDisabled(true);
        mockSelectionStore.unHover();

        expect(mockSelectionStore.hoverStart).toEqual(-1);
        expect(mockSelectionStore.hoverEnd).toEqual(-1);
    });

    it('should mark hover start and end as null when unHover is called', () => {
        mockSelectionStore.hover(0);
        mockSelectionStore.unHover();

        expect(mockSelectionStore.hoverStart).toEqual(-1);
        expect(mockSelectionStore.hoverEnd).toEqual(-1);
    });

    it('should do nothing if select is called and selection is disabled', () => {
        mockConfigStore.setIsSelectionDisabled(true);
        mockSelectionStore.select(0);

        expect(mockSelectionStore.selectionStart).toEqual(-1);
        expect(mockSelectionStore.selectionEnd).toEqual(-1);
    });

    it('should mark selection start and end as the given token when there is no selection in progress and select is called', () => {
        mockSelectionStore.select(0);

        expect(mockSelectionStore.selectionStart).toEqual(0);
        expect(mockSelectionStore.selectionEnd).toEqual(0);
    });

    it('should update selection start when select is called with a token index that is smaller than current selection start', () => {
        mockSelectionStore.select(5);
        mockSelectionStore.select(3);

        expect(mockSelectionStore.selectionStart).toEqual(3);
        expect(mockSelectionStore.selectionEnd).toEqual(5);
    });

    it('should update selection end when select is called with a token index that is greater than current selection start', () => {
        mockSelectionStore.select(5);
        mockSelectionStore.select(8);

        expect(mockSelectionStore.selectionStart).toEqual(5);
        expect(mockSelectionStore.selectionEnd).toEqual(8);
    });

    it('should do nothing when select all is called and selection is disabled', () => {
        mockConfigStore.setIsSelectionDisabled(true);
        mockSelectionStore.selectAll();

        expect(mockSelectionStore.selectionStart).toEqual(-1);
        expect(mockSelectionStore.selectionEnd).toEqual(-1);
    });

    it('should mark indices correctly when select all is called', () => {
        mockSelectionStore.initialize(1, 11);
        mockSelectionStore.selectAll();

        expect(mockSelectionStore.selectionStart).toEqual(0);
        expect(mockSelectionStore.selectionEnd).toEqual(10);
    });

    it('should reset selection indices when cancel selection is called and selection is disabled', () => {
        mockSelectionStore.initialize(1, 11);

        mockSelectionStore.selectAll();
        mockConfigStore.setIsSelectionDisabled(true);
        mockSelectionStore.cancelSelection();

        expect(mockSelectionStore.selectionStart).toEqual(-1);
        expect(mockSelectionStore.selectionEnd).toEqual(-1);
    });

    it('should reset selection indices when cancel selection is called', () => {
        mockSelectionStore.initialize(1, 10);

        mockSelectionStore.selectAll();
        mockSelectionStore.cancelSelection();

        expect(mockSelectionStore.selectionStart).toEqual(-1);
        expect(mockSelectionStore.selectionEnd).toEqual(-1);
    });

    it('should do nothing when is dragging is set and selection is disabled', () => {
        mockConfigStore.setIsSelectionDisabled(true);
        mockSelectionStore.setIsDragging(true);

        expect(mockSelectionStore.isDragging).toBeFalsy();
    });

    it('should set isDragging with the given value when selection is not disabled', () => {
        mockSelectionStore.setIsDragging(true);

        expect(mockSelectionStore.isDragging).toBeTruthy();
    });
});
