/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { watchResize } from '../utils/resizeWatcher';

export const useResizeWatcher = (containerRef: React.MutableRefObject<HTMLDivElement>, callback: () => void) => {
    React.useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const watcher = watchResize(containerRef.current, callback);

        return () => watcher?.unobserve();
    }, [containerRef.current]);
};
