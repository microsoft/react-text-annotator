/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { ITokenStore } from '../types/labelerTypes';

/**
 * @class
 * Represents the data needed to render a line in the
 * labeler. Rendered by the `LineRenderer` component.
 *
 * @param lineNumber The original line number that this line belonged
 * to in the document broken by `\n` characters.
 * @param index The line specific index in the array of all line stores.
 * @param tokenStores The tokens that are part of this line.
 */
export class LineStore<T extends ITokenStore> {
    public readonly index: number;

    public readonly tokenStores: T[];

    public readonly lineText: string;

    public readonly lineNumber: number;

    constructor(index: number, lineNumber: number, tokenStores: T[], lineText?: string) {
        this.index = index;
        this.lineText = lineText;
        this.lineNumber = lineNumber;
        this.tokenStores = tokenStores;
    }

    public get tokenRangeIndices(): [number, number] {
        return [this.tokenStores[0].index, this.tokenStores[this.tokenStores.length - 1].index];
    }
}
