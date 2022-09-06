/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { LabelerConfigStoreParameters } from '../../stores/LabelerConfigStore';
import { LabelerStore } from '../../stores/LabelerStore';

describe('LabelerStore unit tests', () => {
    it('should initialize labeler dimensions to Zero', () => {
        const mockLabelerStore = new LabelerStore();

        expect(mockLabelerStore.labelerScrollWidth).toBe(0);
        expect(mockLabelerStore.labelerScrollHeight).toBe(0);
    });

    it('should set default configs to LabelerConfigStore', () => {
        const mockConfigs: LabelerConfigStoreParameters = { isRtl: true, areAnnotationNamesHidden: true };
        const mockLabelerStore = new LabelerStore();
        mockLabelerStore.configStore.updateConfigs(mockConfigs);

        expect(mockLabelerStore.configStore.isRtl).toEqual(true);
        expect(mockLabelerStore.configStore.areAnnotationNamesHidden).toEqual(true);
    });

    it('should set initial configs to LabelerConfigStore', () => {
        const mockConfigs: LabelerConfigStoreParameters = {
            isRtl: true,
            areAnnotationNamesHidden: true,
            isAnnotationResizingEnabled: false
        };
        const mockLabelerStore = new LabelerStore({ initialConfigs: mockConfigs });

        expect(mockLabelerStore.configStore.isRtl).toEqual(true);
        expect(mockLabelerStore.configStore.areAnnotationNamesHidden).toEqual(true);
        expect(mockLabelerStore.configStore.isAnnotationResizingEnabled).toEqual(false);
    });

    it('should not break if initial configs are not passed', () => {
        const mockLabelerStore = new LabelerStore();
        expect(mockLabelerStore.configStore.isRtl).toEqual(false);
        expect(mockLabelerStore.configStore.areAnnotationNamesHidden).toEqual(false);
        expect(mockLabelerStore.configStore.isAnnotationResizingEnabled).toEqual(false);
    });
});
