/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import debounce from 'lodash.debounce';
import { computed } from 'mobx';
import * as React from 'react';
import { LabelerAnnotationsStore } from '../stores/LabelerAnnotationsStore';
import { AnnotationData } from '../types/labelerTypes';
import { getAnnotationTokenRangeAfterResizing } from '../utils/annotationUtils';
import { addDomEventListener, getLifetime } from '../utils/eventUtils';
import { tokenIndexDataAttribute } from '../utils/labelerConstants';
import { getElementWithAttribute } from '../utils/tokenUtils';

/**
 * This hook controls annotations resizing behavior. It registers
 * event handlers on the document level whenever the user starts
 * dragging an annotation and removes them whenever the user cancels
 * or stops resizing an annotation.
 */
export const useAnnotationResizer = (
    annotationStore: LabelerAnnotationsStore,
    onAnnotationResize: (annotation: AnnotationData) => void
) => {
    const [isResizing, setIsResizing] = React.useState(false);

    const onResize = React.useCallback((annotationId: string, knob: 'start' | 'end') => {
        const lifetime = getLifetime();
        const annotation = computed(() => annotationStore.annotations.filter(a => a.id === annotationId)[0]).get();

        setIsResizing(true);

        const stopResizing = () => {
            lifetime.dispose();
            setIsResizing(false);
            annotationStore.stopAnnotationResize();
        };

        const resize = debounce((e: MouseEvent) => {
            const targetElements = document.elementsFromPoint(e.x, e.y);
            const token = getElementWithAttribute(targetElements, tokenIndexDataAttribute);

            if (!token) {
                return;
            }

            const tokenIndex = parseInt(token.getAttribute(tokenIndexDataAttribute), 10);
            const { knob: newKnob, startIndex, endIndex } = getAnnotationTokenRangeAfterResizing(annotation, knob, tokenIndex);

            if (newKnob === 'start' && annotation.startToken !== startIndex) {
                annotationStore.startAnnotationResize(annotationId, startIndex, annotation.endToken);
            } else if (newKnob === 'end' && annotation.endToken !== endIndex) {
                annotationStore.startAnnotationResize(annotationId, annotation.startToken, endIndex);
            }
        }, 30);

        addDomEventListener(lifetime, document.body, 'mouseup', e => {
            stopResizing();
            e?.stopPropagation();
            onAnnotationResize(annotation);
        });
        addDomEventListener(lifetime, document.body, 'mousemove', resize);
        addDomEventListener(lifetime, document.body, 'mouseleave', stopResizing);
    }, []);

    return { onResize, isResizing };
};
