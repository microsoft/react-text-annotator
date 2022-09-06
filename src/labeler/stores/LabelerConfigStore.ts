/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { action, observable } from 'mobx';

export type LabelerConfigStoreParameters = Partial<
    Pick<
        LabelerConfigStore,
        | 'isRtl'
        | 'wordBreak'
        | 'isDisabled'
        | 'tokenizationType'
        | 'isSelectionDisabled'
        | 'enableVirtualization'
        | 'areTooltipsInDarkMode'
        | 'areAnnotationsClickable'
        | 'areAnnotationNamesHidden'
        | 'isAnnotationResizingEnabled'
    >
>;

/**
 * Controls view configurations for the labeler.
 */
export class LabelerConfigStore {
    @observable public isRtl: boolean;

    @observable public isDisabled: boolean;

    @observable public isSelectionDisabled: boolean;

    @observable public enableVirtualization: boolean;

    @observable public areTooltipsInDarkMode: boolean;

    @observable public areAnnotationsClickable: boolean;

    @observable public areAnnotationNamesHidden: boolean;

    @observable public isAnnotationResizingEnabled: boolean;

    @observable public tokenizationType: 'word' | 'character';

    @observable public wordBreak: 'normal' | 'breakAll' | 'keepAll';

    constructor(initialParams?: LabelerConfigStoreParameters) {
        this.isRtl = initialParams?.isRtl ?? false;
        this.isDisabled = initialParams?.isDisabled ?? false;
        this.wordBreak = initialParams?.wordBreak ?? 'normal';
        this.tokenizationType = initialParams?.tokenizationType ?? 'character';
        this.enableVirtualization = initialParams?.enableVirtualization ?? false;
        this.areTooltipsInDarkMode = initialParams?.areTooltipsInDarkMode ?? true;
        this.areAnnotationNamesHidden = initialParams?.areAnnotationNamesHidden ?? false;
        this.isSelectionDisabled = this.isDisabled ? true : initialParams?.isSelectionDisabled ?? false;
        this.areAnnotationsClickable = this.isDisabled ? false : initialParams?.areAnnotationsClickable ?? true;
        this.isAnnotationResizingEnabled = this.isDisabled ? false : initialParams?.isAnnotationResizingEnabled ?? false;
    }

    @action
    public setIsRtl(value: boolean) {
        this.isRtl = value;
    }

    @action
    public setIsDisabled(value: boolean) {
        this.isDisabled = value;
        this.areAnnotationsClickable = !value;
        this.isSelectionDisabled = value;
    }

    @action
    public setAreAnnotationsClickable(value: boolean) {
        if (value) {
            this.isDisabled = false;
        }
        this.areAnnotationsClickable = value;
    }

    @action
    public setIsSelectionDisabled(value: boolean) {
        if (!value) {
            this.isDisabled = false;
        }
        this.isSelectionDisabled = value;
    }

    @action
    public setEnableVirtualization(value: boolean) {
        this.enableVirtualization = value;
    }

    @action
    public setAreAnnotationNamesHidden(value: boolean) {
        this.areAnnotationNamesHidden = value;
    }

    @action
    public setIsAnnotationResizingEnabled(value: boolean) {
        this.isAnnotationResizingEnabled = value;
    }

    @action
    public setAreTooltipsInDarkMode(value: boolean) {
        this.areTooltipsInDarkMode = value;
    }

    @action
    public updateConfigs(params: LabelerConfigStoreParameters) {
        this.isRtl = params.isRtl ?? this.isRtl;
        this.isDisabled = params.isDisabled ?? this.isDisabled;
        this.enableVirtualization = params.enableVirtualization ?? this.enableVirtualization;
        this.areTooltipsInDarkMode = params.areTooltipsInDarkMode ?? this.areTooltipsInDarkMode;
        this.areAnnotationNamesHidden = params.areAnnotationNamesHidden ?? this.areAnnotationNamesHidden;
        this.isSelectionDisabled = this.isDisabled ? true : params.isSelectionDisabled ?? this.isSelectionDisabled;
        this.areAnnotationsClickable = this.isDisabled ? false : params.areAnnotationsClickable ?? this.areAnnotationsClickable;
        this.isAnnotationResizingEnabled = this.isDisabled ? false : params.isAnnotationResizingEnabled ?? this.isAnnotationResizingEnabled;
    }
}
