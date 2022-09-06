/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { NameSvgRenderer, NameSvgRendererProps } from '../../../../components/svgRenderers/utilities/NameSvgRenderer';
import { LabelerStore } from '../../../../stores/LabelerStore';
import { LabelerMockProvider } from '../../../../utils/LabelerMockProvider';

describe('NameSvgRenderer unit tests', () => {
    const mockLabelerStore = new LabelerStore();
    const getRoot = (wrapper: ReactWrapper) => wrapper.find('[data-automation-id="nameRoot"]').first();
    const nameSvgRendererProps: NameSvgRendererProps = { width: 50, color: 'red', name: '7ammo', topLeftBasePoint: { x: 10, y: 10 } };

    const NameWrapper = () => (
        <LabelerMockProvider labelerStore={mockLabelerStore}>
            <NameSvgRenderer {...nameSvgRendererProps} />
        </LabelerMockProvider>
    );

    it('should set the name position correctly', () => {
        const wrapper = mount(<NameWrapper />);
        const xPosition = getRoot(wrapper).prop('x');

        expect(xPosition).toEqual(10);
    });
});
