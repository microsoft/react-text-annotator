/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerStore } from '../stores/LabelerStore';

export const LabelerStoreContext = React.createContext<LabelerStore>(null);
export const useLabelerStore = () => React.useContext(LabelerStoreContext);
