/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import * as React from 'react';
import { AnnotationData, TokenToCharMapType } from '../types/labelerTypes';

type LabelerCallbackArgument = React.MouseEvent<SVGElement, MouseEvent>;
type LabelerCallback = (annotation: AnnotationData, ...args: LabelerCallbackArgument[]) => void | string;
/**
 * This hook wraps a callback function passed to the labeler and received an annotation data as parameter,
 * and that's to update the annotation token ranges using the token-to-char map calculated after getting line infos.
 *
 * @param tokenToCharMap token-to-char map that maps each token index
 *  to the start and the end indices of the token in the real text
 * @param callback the callback passed to the labeler to wrap.
 * @returns the wrapped callback after updating annotation token ranges.
 */
export const useAnnotationIndexConverter = (tokenToCharMap: TokenToCharMapType, callback: LabelerCallback) =>
    React.useCallback(
        (annotation: AnnotationData, ...args: LabelerCallbackArgument[]) =>
            callback(
                {
                    ...annotation,
                    endToken: tokenToCharMap.get(annotation.endToken).endIndex,
                    startToken: tokenToCharMap.get(annotation.startToken).startIndex
                },
                ...args
            ),
        [callback]
    );
