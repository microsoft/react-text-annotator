/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import debounce from 'lodash.debounce';
import { action, observable } from 'mobx';
import { LINE_HEIGHT_CHANGE_DEBOUNCE } from '../utils/labelerConstants';

export class LabelerVirtualizationStore {
    @observable public endingLine: number;

    @observable public startingLine: number;

    @observable public lineHeights: number[];

    @observable public areLinesRendered: boolean;

    private _lineHeights: number[];

    constructor() {
        this.lineHeights = [];
        this.endingLine = NaN;
        this._lineHeights = [];
        this.startingLine = NaN;
        this.areLinesRendered = false;
    }

    @action
    public setLines(start: number, end: number) {
        if (this.startingLine !== start || this.endingLine !== end) {
            this.areLinesRendered = false;
        }

        this.endingLine = end;
        this.startingLine = start;
    }

    @action
    public markLinesAsRendered() {
        this.areLinesRendered = true;
    }

    public updateLineHeight(lineIndex: number, lineHeight: number) {
        this._lineHeights[lineIndex] = lineHeight;
        this._updateLineHeightsObservable();
    }

    private _updateLineHeightsObservable = debounce(
        action(() => {
            this.lineHeights = this._lineHeights;
        }),
        LINE_HEIGHT_CHANGE_DEBOUNCE
    );
}
