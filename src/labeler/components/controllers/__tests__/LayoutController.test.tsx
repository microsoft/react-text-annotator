/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount } from 'enzyme';
import * as React from 'react';
import { LabelerStore } from '../../../stores/LabelerStore';
import { LineStore } from '../../../stores/LineStore';
import { TokenStore } from '../../../stores/TokenStore';
import {
    LINE_HEIGHT_CHANGE_DEBOUNCE,
    LINE_VIRTUALIZATION_RENDER_DEBOUNCE,
    LabelerKeyCodes
} from '../../../utils/labelerConstants';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';
import {
    calculateLabelTokenPadding,
    calculatePredictionTokenPadding,
    calculateRelationTokenPadding
} from '../../../utils/tokenUtils';
import { LineRenderer } from '../../renderers/LineRenderer';
import { TokenRenderer } from '../../renderers/TokenRenderer';
import { LayoutController } from '../LayoutController';
import { ITokenRendererProps } from '../../../types/labelerTypes';

describe('LayoutController unit tests', () => {
    let mockLabelerStore: LabelerStore;
    const mockLineStores = [
        new LineStore(0, 1, [new TokenStore(0, 'A'), new TokenStore(1, 'A')]),
        new LineStore(1, 2, [new TokenStore(2, 'A'), new TokenStore(3, 'A')])
    ];
    const mockTokenRenderer = (props: ITokenRendererProps<TokenStore>) => <TokenRenderer key={props.tokenStore.index} {...props} />;
    const mockCalculators = [calculateLabelTokenPadding, calculateRelationTokenPadding, calculatePredictionTokenPadding];

    const Wrapper = ({ lineStores = mockLineStores }: { lineStores?: LineStore<TokenStore>[] }) => {
        const ref = React.useRef();

        return (
            <LabelerMockProvider labelerStore={mockLabelerStore}>
                <LayoutController text="" tokenToCharMap={new Map()} ref={ref} lineStores={lineStores} onTokenRender={mockTokenRenderer} />
            </LabelerMockProvider>
        );
    };

    beforeEach(() => {
        jest.useFakeTimers();
        mockLabelerStore = new LabelerStore();
    });

    it('should render line renderers for each line store passed', () => {
        const wrapper = mount(<Wrapper />);

        expect(wrapper.find(LineRenderer).length).toBe(2);
        wrapper.find(LineRenderer).forEach(l => expect(l.prop('onTokenRender')).toBe(mockTokenRenderer));
        wrapper.find(LineRenderer).forEach((l, index) => expect(l.prop('lineStore')).toBe(mockLineStores[index]));
        wrapper.find(LineRenderer).forEach(l => expect(l.prop('tokenPaddingCalculators')).toEqual(mockCalculators));
    });

    it('should blur annotations and tokens when tab is pressed', () => {
        const wrapper = mount(<Wrapper />);
        const mockBlurCurrentToken = jest.spyOn(mockLabelerStore.a11yStore, 'blurCurrentToken');
        const mockBlurCurrentAnnotation = jest.spyOn(mockLabelerStore.a11yStore, 'blurCurrentAnnotation');

        wrapper
            .find('div')
            .first()
            .simulate('keydown', { key: LabelerKeyCodes.Tab });

        expect(mockBlurCurrentToken).toHaveBeenCalled();
        expect(mockBlurCurrentAnnotation).toHaveBeenCalled();
    });

    it('should stop click propagation', () => {
        const wrapper = mount(<Wrapper />);
        const spy = jest.fn();

        wrapper
            .find('div')
            .first()
            .simulate('click', { stopPropagation: spy });

        expect(spy).toHaveBeenCalled();
    });

    it('should mark lines as synced when lines are rendered and virtualization is enabled', () => {
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<Wrapper />);

        wrapper.update();
        jest.advanceTimersByTime(LINE_VIRTUALIZATION_RENDER_DEBOUNCE);

        expect(mockLabelerStore.virtualizationStore.areLinesRendered).toBeTruthy();
    });

    it('should not mark lines as synced when lines are rendered and virtualization is not enabled', () => {
        const wrapper = mount(<Wrapper />);

        wrapper.update();
        jest.advanceTimersByTime(LINE_VIRTUALIZATION_RENDER_DEBOUNCE);

        expect(mockLabelerStore.virtualizationStore.areLinesRendered).toBeFalsy();
    });

    it('should set labeler dimensions when line heights change', () => {
        const wrapper = mount(<Wrapper />);

        wrapper.update();
        jest.advanceTimersByTime(LINE_HEIGHT_CHANGE_DEBOUNCE);

        expect(mockLabelerStore.labelerScrollWidth).not.toBeNaN();
        expect(mockLabelerStore.labelerScrollHeight).not.toBeNaN();
    });
});
