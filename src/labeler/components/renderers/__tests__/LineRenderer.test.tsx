/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { LineRenderer, LineRendererProps } from '../../../components/renderers/LineRenderer';
import { LabelerStore } from '../../../stores/LabelerStore';
import { LineStore } from '../../../stores/LineStore';
import { TokenStore } from '../../../stores/TokenStore';
import { ITokenStore, noopUndefined } from '../../../types/labelerTypes';
import { lineDataAttribute, lineIndexDataAttribute } from '../../../utils/labelerConstants';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';
import { calculateLabelTokenPadding } from '../../../utils/tokenUtils';

describe('LineRenderer unit tests', () => {
    let mockLabelerStore: LabelerStore;

    const Wrapper = (props: Partial<LineRendererProps<ITokenStore>>) => (
        <LabelerMockProvider labelerStore={mockLabelerStore}>
            <LineRenderer
                onRendered={noopUndefined}
                tokenPaddingCalculators={[]}
                onTokenRender={noopUndefined}
                onHeightChange={noopUndefined}
                {...(props as LineRendererProps<ITokenStore>)}
            />
        </LabelerMockProvider>
    );

    const getRootStylesObject = (wrapper: ReactWrapper) =>
        getComputedStyle(
            wrapper
                .find('div')
                .at(0)
                .getDOMNode()
        );

    beforeEach(() => {
        mockLabelerStore = new LabelerStore();
    });

    it('should add correct attributes to line from line store', () => {
        const mockLineStore = new LineStore(1, 1, []);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} />);

        expect(
            wrapper
                .find('div')
                .first()
                .prop(lineDataAttribute)
        ).toBeTruthy();

        expect(
            wrapper
                .find('div')
                .first()
                .prop(lineIndexDataAttribute)
        ).toEqual('1');
    });

    it('should render tokens from the line store', () => {
        const mockTokensArray = [new TokenStore(0, 'O'), new TokenStore(1, 'A')];
        const mockOnTokenRender = ({ tokenStore }: { tokenStore: TokenStore }) => <span key={tokenStore.index}>{tokenStore.text}</span>;
        const mockLineStore = new LineStore(1, 1, mockTokensArray);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} onTokenRender={mockOnTokenRender} />);

        expect(wrapper.find('span')).toHaveLength(2);
        wrapper.find('span').forEach((s, index) => expect(s.text()).toEqual(mockTokensArray[index].text));
    });

    it('should pass correct default padding values to the real line when no annotations exist', () => {
        const mockLineStore = new LineStore(1, 1, []);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} />);

        expect(getRootStylesObject(wrapper)).toEqual(expect.objectContaining({ paddingTop: '6px', paddingBottom: '6px' }));
    });

    it('should pass correct padding values to the real line when exist', () => {
        const mockLineStore = new LineStore(0, 1, [new TokenStore(0, '7')]);
        mockLabelerStore.annotationStore.initialize(1);
        mockLabelerStore.annotationStore.setAnnotations([{ startToken: 0, endToken: 0, id: '7ammo', kind: 'label', name: '7ammoLabel' }]);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} tokenPaddingCalculators={[calculateLabelTokenPadding]} />);

        expect(getRootStylesObject(wrapper)).toEqual(expect.objectContaining({ paddingTop: '6px', paddingBottom: '20px' }));
    });

    it('should call onRendered when the line is rendered', () => {
        const mockOnRendered = jest.fn();
        const mockLineStore = new LineStore(1, 1, []);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} onRendered={mockOnRendered} />);
        wrapper.update();

        expect(mockOnRendered).toHaveBeenCalled();
    });

    it('should call onHeightChange when the line is rendered', () => {
        const mockOnHeightChange = jest.fn();
        const mockLineStore = new LineStore(1, 1, []);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} onHeightChange={mockOnHeightChange} />);
        wrapper.update();

        expect(mockOnHeightChange).toHaveBeenCalledWith(1, 29);
    });

    it('should call onHeightChange when the token padding changes', () => {
        const mockOnHeightChange = jest.fn();
        const mockLineStore = new LineStore(0, 1, [new TokenStore(0, '7')]);
        mockLabelerStore.annotationStore.initialize(1);

        const wrapper = mount(
            <Wrapper lineStore={mockLineStore} onHeightChange={mockOnHeightChange} tokenPaddingCalculators={[calculateLabelTokenPadding]} />
        );
        wrapper.update();

        mockLabelerStore.annotationStore.setAnnotations([{ startToken: 0, endToken: 0, id: '7ammo', kind: 'label', name: '7ammoLabel' }]);

        expect(mockOnHeightChange).toHaveBeenCalledTimes(2);
    });

    it('should render real line when virtualization is not enabled', () => {
        const mockLineStore = new LineStore(1, 1, []);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} />);
        const lineWrapper = wrapper.find('[data-automation-id="lineWrapper"]').first();

        expect(lineWrapper.exists()).toBeTruthy();
    });

    it('should render virtual line when virtualization is enabled and line is out of virtualization bounds', () => {
        const mockLineStore = new LineStore(1, 1, []);
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} />);
        const lineWrapper = wrapper.find('[data-automation-id="lineWrapper"]').first();

        expect(lineWrapper.exists()).toBeFalsy();
    });

    it('should pass padding values to the virtual line when virtualization is enabled', () => {
        const mockLineStore = new LineStore(1, 1, []);
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} />);
        const lineWrapper = wrapper.find('[data-automation-id="lineWrapper"]').first();

        expect(lineWrapper.exists()).toBeFalsy();
        expect(getRootStylesObject(wrapper)).toEqual(expect.objectContaining({ minHeight: '29px' }));
    });

    it('should render real line if virtualization is enabled but line is within virtualization boundaries', () => {
        const mockLineStore = new LineStore(1, 1, []);
        mockLabelerStore.virtualizationStore.setLines(0, 2);
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} />);

        const lineWrapper = wrapper.find('[data-automation-id="lineWrapper"]').first();

        expect(lineWrapper.exists()).toBeTruthy();
    });

    it('should render virtual line if virtualization is enabled and line is outside virtualization boundaries', () => {
        const mockLineStore = new LineStore(1, 1, []);
        mockLabelerStore.virtualizationStore.setLines(2, 4);
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<Wrapper lineStore={mockLineStore} />);

        const lineWrapper = wrapper.find('[data-automation-id="lineWrapper"]').first();

        expect(lineWrapper.exists()).toBeFalsy();
    });
});
