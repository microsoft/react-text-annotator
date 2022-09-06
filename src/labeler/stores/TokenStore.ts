/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { BaseTokenStore } from '../stores/BaseTokenStore';

export class TokenStore extends BaseTokenStore {
    constructor(index: number, text: string) {
        super(index, text);
    }
}
