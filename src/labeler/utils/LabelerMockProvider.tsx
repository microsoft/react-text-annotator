/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { LabelerStore } from '../stores/LabelerStore';
import { labelerTheme } from '../theming/labelerTheme';
import { LabelerStoreContext } from '../utils/labelerStoreContext';
import { DefaultTheme, ThemeProvider } from 'styled-components';

type LabelerMockProviderProps = {
    theme?: DefaultTheme;
    labelerStore?: LabelerStore;
};

export const LabelerMockProvider = (props: React.PropsWithChildren<LabelerMockProviderProps>) => {
    const { labelerStore = new LabelerStore(), theme = labelerTheme } = props;

    return (
        <LabelerStoreContext.Provider value={labelerStore}>
            <ThemeProvider theme={theme}>{props.children}</ThemeProvider>
        </LabelerStoreContext.Provider>
    );
};
