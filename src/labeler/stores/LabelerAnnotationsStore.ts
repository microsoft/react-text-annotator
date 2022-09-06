/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import range from 'lodash.range';
import { action, computed, observable } from 'mobx';
import { AnnotationData } from '../types/labelerTypes';

/**
 * This store contains the annotations that are displayed
 * in the labeler. Read more about how this store works to
 * support annotation resizing in `labelingStores.md`.
 */
export class LabelerAnnotationsStore {
    @observable.deep public annotations: AnnotationData[];

    private _tokenCount: number;

    constructor() {
        this.annotations = [];
    }

    @computed
    public get annotationsPerTokenMap(): Map<number, AnnotationData[]> {
        const initialEntries: [number, AnnotationData[]][] = Array.from({ length: this._tokenCount }, (_, index) => [index, []]);
        const map = new Map<number, AnnotationData[]>(initialEntries);

        this.annotations.forEach(a => range(a.startToken, a.endToken + 1).forEach(index => map.get(index).push(a)));

        return map;
    }

    @action
    public initialize(tokenCount: number) {
        this._tokenCount = tokenCount;
    }

    @action
    public setAnnotations(annotations: AnnotationData[]) {
        this.annotations = Array.from(annotations);
    }

    @action
    public startAnnotationResize(annotationId: string, startIndex: number, endIndex: number) {
        const annotationToUpdate = this.annotations.find(a => a.id === annotationId);
        this.annotations.forEach(a => {
            a.opacity = 0.5;
        });

        annotationToUpdate.opacity = 1;
        annotationToUpdate.endToken = endIndex;
        annotationToUpdate.startToken = startIndex;
    }

    @action
    public stopAnnotationResize() {
        this.annotations.forEach(a => {
            a.opacity = 1;
        });
    }
}
