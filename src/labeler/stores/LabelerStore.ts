/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { action, observable } from 'mobx';
import { LabelerA11yStore } from '../stores/LabelerA11yStore';
import { LabelerAnnotationsStore } from '../stores/LabelerAnnotationsStore';
import { LabelerConfigStore, LabelerConfigStoreParameters } from '../stores/LabelerConfigStore';
import { LabelerSelectionStore } from '../stores/LabelerSelectionStore';
import { LabelerVirtualizationStore } from '../stores/LabelerVirtualizationStore';
import { TokenEventListenersFactory } from '../types/labelerTypes';

/**
 * The `LabelerStore` is used to as a utility store
 * that is can be passed to multiple layers of the labeler
 * to act as an event bus between the different layers
 * when needed.
 *
 * @param isMounted A flag to indicate that the labeler
 * DOM element was mounted and thus the labeler div
 * container ref is now defined and can be referenced.
 *
 * @param selectionStore A store to control the selection
 * state of the tokens in the labeler.
 *
 * @param configStore A store to control various global
 * configurations applied on the labeler. Open the store
 * class for more details.
 */
export class LabelerStore {
    public a11yStore: LabelerA11yStore;

    public configStore: LabelerConfigStore;

    public selectionStore: LabelerSelectionStore;

    public annotationStore: LabelerAnnotationsStore;

    public virtualizationStore: LabelerVirtualizationStore;

    @observable public isMounted: boolean;

    @observable public svgLayerXOffset: number;

    @observable public labelerOffsetWidth: number;

    @observable public labelerScrollWidth: number;

    @observable public labelerScrollHeight: number;

    @observable public tokenEventListenersFactory: TokenEventListenersFactory;

    constructor(params?: { initialConfigs?: LabelerConfigStoreParameters }) {
        this.isMounted = false;
        this.svgLayerXOffset = 0;
        this.labelerScrollWidth = 0;
        this.labelerOffsetWidth = 0;
        this.labelerScrollHeight = 0;
        this.a11yStore = new LabelerA11yStore();
        this.annotationStore = new LabelerAnnotationsStore();
        this.virtualizationStore = new LabelerVirtualizationStore();
        this.configStore = new LabelerConfigStore(params?.initialConfigs);
        this.selectionStore = new LabelerSelectionStore(this.configStore);
    }

    @action
    public onLabelerMount() {
        this.isMounted = true;
    }

    @action
    public setTokenEventListenersFactory(factory: TokenEventListenersFactory) {
        this.tokenEventListenersFactory = factory;
    }

    @action
    public setLabelerDimensionsAfterScrolling(scrollWidth: number, svgLayerXOffset: number) {
        this.svgLayerXOffset = svgLayerXOffset;
        this.labelerScrollWidth = scrollWidth;
    }

    @action
    public setLabelerDimensions(scrollWidth: number, scrollHeight: number, offsetWidth: number, svgLayerXOffset: number) {
        this.labelerScrollWidth = scrollWidth;
        this.labelerOffsetWidth = offsetWidth;
        this.svgLayerXOffset = svgLayerXOffset;
        this.labelerScrollHeight = scrollHeight;
    }
}
