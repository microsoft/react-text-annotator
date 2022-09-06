/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { ITokenStore } from '../types/labelerTypes';

export class BaseTokenStore implements ITokenStore {
    public readonly text: string;

    public readonly index: number;

    constructor(index: number, text: string) {
        this.index = index;
        this.text = text;
    }
}
