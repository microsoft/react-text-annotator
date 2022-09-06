/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerConfigStore, LabelerConfigStoreParameters } from '../stores/LabelerConfigStore';

/**
 * Syncs the configs provided by the user to the labeler
 * with the configs stored in the config store.
 *
 * @param labelerConfigs The labeler configs to updated the store with.
 * @param configStore The store that contains the configurations for the labeler.
 */
export const useLabelerConfigSyncer = (labelerConfigs: LabelerConfigStoreParameters, configStore: LabelerConfigStore) => {
    React.useEffect(() => {
        if (labelerConfigs) {
            configStore.updateConfigs(labelerConfigs);
        }
    }, [labelerConfigs]);
};
