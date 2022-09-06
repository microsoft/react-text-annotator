/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerConfigStore } from '../../stores/LabelerConfigStore';

describe('LabelerConfigStore unit tests', () => {
    it('should initialize labeler config store correctly', () => {
        const mockStore = new LabelerConfigStore({
            isRtl: true,
            isDisabled: false,
            isSelectionDisabled: true,
            enableVirtualization: true,
            areTooltipsInDarkMode: false,
            areAnnotationsClickable: true,
            areAnnotationNamesHidden: true,
            isAnnotationResizingEnabled: false
        });

        expect(mockStore.isRtl).toEqual(true);
        expect(mockStore.isDisabled).toEqual(false);
        expect(mockStore.isSelectionDisabled).toEqual(true);
        expect(mockStore.enableVirtualization).toEqual(true);
        expect(mockStore.areTooltipsInDarkMode).toEqual(false);
        expect(mockStore.areAnnotationsClickable).toEqual(true);
        expect(mockStore.areAnnotationNamesHidden).toEqual(true);
        expect(mockStore.isAnnotationResizingEnabled).toEqual(false);
    });

    it('should set defaults correctly if no initial configs are provided', () => {
        const mockStore = new LabelerConfigStore();

        expect(mockStore.isRtl).toEqual(false);
        expect(mockStore.isDisabled).toEqual(false);
        expect(mockStore.isSelectionDisabled).toEqual(false);
        expect(mockStore.areTooltipsInDarkMode).toEqual(true);
        expect(mockStore.enableVirtualization).toEqual(false);
        expect(mockStore.areAnnotationsClickable).toEqual(true);
        expect(mockStore.areAnnotationNamesHidden).toEqual(false);
    });

    it('should set areAnnotationsClickable and isSelectionDisabled correctly after changing isDisabled', () => {
        const mockStore = new LabelerConfigStore();
        mockStore.setIsDisabled(true);

        expect(mockStore.isDisabled).toEqual(true);
        expect(mockStore.isSelectionDisabled).toEqual(true);
        expect(mockStore.areAnnotationsClickable).toEqual(false);
    });

    it('should set isDisabled correctly after changing areAnnotationsClickable', () => {
        const mockStore = new LabelerConfigStore();
        mockStore.setIsDisabled(true);
        mockStore.setAreAnnotationsClickable(true);

        expect(mockStore.isDisabled).toEqual(false);
    });

    it('should set isDisabled correctly after changing isSelectionDisabled', () => {
        const mockStore = new LabelerConfigStore();
        mockStore.setIsDisabled(true);
        mockStore.setIsSelectionDisabled(false);

        expect(mockStore.isDisabled).toEqual(false);
    });

    it('should update configs correctly', () => {
        const mockStore = new LabelerConfigStore();

        expect(mockStore.isRtl).toEqual(false);
        expect(mockStore.isDisabled).toEqual(false);

        mockStore.updateConfigs({ isRtl: true, isDisabled: true });

        expect(mockStore.isRtl).toEqual(true);
        expect(mockStore.isDisabled).toEqual(true);
        expect(mockStore.isSelectionDisabled).toEqual(true);
        expect(mockStore.areAnnotationsClickable).toEqual(false);
        expect(mockStore.areAnnotationNamesHidden).toEqual(false);
        expect(mockStore.isAnnotationResizingEnabled).toEqual(false);
    });
});
