/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { action, computed, observable } from 'mobx';
import { LabelerConfigStore } from '../stores/LabelerConfigStore';

const NullIndex = -1;

export class LabelerSelectionStore {
    public lineCount: number;

    public tokenCount: number;

    @observable public hoverEnd: number;

    @observable public hoverStart: number;

    @observable public isDragging: boolean;

    @observable public selectionEnd: number;

    @observable public selectionStart: number;

    private _configStore: LabelerConfigStore;

    constructor(configStore: LabelerConfigStore) {
        this.isDragging = false;
        this.hoverEnd = NullIndex;
        this.hoverStart = NullIndex;
        this.selectionEnd = NullIndex;
        this.selectionStart = NullIndex;
        this._configStore = configStore;
    }

    @computed public get isHovered() {
        return this.hoverStart !== NullIndex || this.hoverEnd !== NullIndex;
    }

    @computed public get isSelectionInProgress() {
        return !this._configStore.isSelectionDisabled && (this.selectionStart !== NullIndex || this.selectionEnd !== NullIndex);
    }

    @action
    public initialize(lineCount: number, tokenCount: number) {
        this.lineCount = lineCount;
        this.tokenCount = tokenCount;
    }

    @action
    public hover(tokenIndex: number) {
        if (this._configStore.isSelectionDisabled) {
            return;
        }

        if (!this.isSelectionInProgress) {
            this.hoverStart = tokenIndex;
        } else if (tokenIndex < this.selectionStart) {
            this.hoverStart = tokenIndex;
        } else {
            this.hoverEnd = tokenIndex;
        }
    }

    @action
    public unHover() {
        this.hoverStart = NullIndex;
        this.hoverEnd = NullIndex;
    }

    @action
    public select(tokenIndex: number) {
        if (this._configStore.isSelectionDisabled) {
            return;
        }

        if (!this.isSelectionInProgress) {
            this.selectionStart = tokenIndex;
            this.selectionEnd = tokenIndex;
        } else if (tokenIndex < this.selectionStart) {
            this.selectionStart = tokenIndex;
        } else {
            this.selectionEnd = tokenIndex;
        }
    }

    @action
    public selectAll() {
        if (this._configStore.isSelectionDisabled) {
            return;
        }

        this.selectionStart = 0;
        this.selectionEnd = this.tokenCount - 1;
    }

    @action
    public cancelSelection() {
        this.selectionStart = NullIndex;
        this.selectionEnd = NullIndex;
        this.isDragging = false;
    }

    @action
    public setIsDragging(isDragging: boolean) {
        if (this._configStore.isSelectionDisabled) {
            return;
        }

        this.isDragging = isDragging;
    }
}
