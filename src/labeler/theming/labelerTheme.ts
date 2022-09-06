/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { DefaultTheme } from 'styled-components';

export const labelerTheme: DefaultTheme = {
    annotation: {
        defaultColor: 'black'
    },
    line: {
        borderColor: 'white',
        outlineColor: '#605e5c'
    },
    token: {
        borderColor: 'white',
        outlineColor: '#605e5c',
        selectedTokenBackground: 'rgba(105, 175, 229, 0.3)'
    },
    tooltip: {
        darkTextColor: 'black',
        lightTextColor: 'white',
        darkBackgroundColor: 'black',
        lightBackgroundColor: 'white'
    }
};
