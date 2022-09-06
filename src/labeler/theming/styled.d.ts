/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        annotation: {
            defaultColor: string;
        };
        line: {
            borderColor: string;
            outlineColor: string;
        };
        token: {
            borderColor: string;
            outlineColor: string;
            selectedTokenBackground: string;
        };
        tooltip: {
            darkTextColor: string;
            lightTextColor: string;
            darkBackgroundColor: string;
            lightBackgroundColor: string;
        };
    }
}
