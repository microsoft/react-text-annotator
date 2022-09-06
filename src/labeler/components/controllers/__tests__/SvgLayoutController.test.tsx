/**
 * Copyright (c) Microsoft. All rights reserved.
 */

const l = { x: 0, y: 1 };
const m1 = { startToken: 0, endToken: 1, name: '7ammo1', kind: 'label' };
const m2 = { startToken: 5, endToken: 10, name: '7ammo2', kind: 'label' };
const labelAnnotationToSvgPropsFactory = jest.fn().mockImplementation(m => {
    return { ...m.data, kind: 'underline', linePoints: [[l, l]] };
});
const getSvgRendererKey = jest.fn().mockImplementation(() => getId());
jest.mock('../../../utils/svgUtils', () => ({ labelAnnotationToSvgPropsFactory, getSvgRendererKey }));

import { getId } from '@fluentui/utilities';
import { mount } from 'enzyme';
import * as React from 'react';
import { SvgLayoutController } from '../../../components/controllers/SvgLayoutController';
import { SvgRootRenderer } from '../../../components/svgRenderers/SvgRootRenderer';
import { LabelerStore } from '../../../stores/LabelerStore';
import { LineStore } from '../../../stores/LineStore';
import { TokenStore } from '../../../stores/TokenStore';
import { AnnotationDomData } from '../../../types/labelerTypes';
import { LabelerMockProvider } from '../../../utils/LabelerMockProvider';

describe('SvgLayoutController unit tests', () => {
    let mockLabelerStore: LabelerStore;

    const s = { startToken: 0, endToken: 0, lineIndex: 0 };
    const mockLineStores = [new LineStore(0, 1, [new TokenStore(0, 'A')]), new LineStore(1, 2, [new TokenStore(1, 'B')])];
    const mockAnnotations: AnnotationDomData[] = [
        { ...m1, lineSegments: [s], id: 'annotation_1' },
        { ...m2, lineSegments: [s], id: 'annotation_2' }
    ];

    const MockWrapper = (props: { annotationsDomData?: AnnotationDomData[] }) => {
        const { annotationsDomData = mockAnnotations } = props;
        const ref = React.useRef();

        return (
            <div ref={ref}>
                <LabelerMockProvider labelerStore={mockLabelerStore}>
                    <SvgLayoutController containerRef={ref} lineStores={mockLineStores} annotationsDomData={annotationsDomData} />
                </LabelerMockProvider>
            </div>
        );
    };

    beforeEach(() => (mockLabelerStore = new LabelerStore()));

    it('should not render SVG elements until labeler is mounted', () => {
        const wrapper = mount(<MockWrapper />);

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps')).toEqual([]);
    });

    it('should re-render SVG props when labeler is mounted', () => {
        const wrapper = mount(<MockWrapper />);

        mockLabelerStore.onLabelerMount();
        wrapper.update();

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps').length).toEqual(2);
    });

    it('should re-render the SVG elements when annotations change', () => {
        const wrapper = mount(<MockWrapper />);

        mockLabelerStore.onLabelerMount();
        wrapper.update();

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps').length).toEqual(2);

        wrapper.setProps({ annotationsDomData: mockAnnotations.slice(1) });
        wrapper.update();

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps').length).toEqual(1);
    });

    it('should sort annotations in descending order when rtl mode is off', () => {
        mockLabelerStore.configStore.setIsRtl(false);
        const wrapper = mount(<MockWrapper />);
        mockLabelerStore.onLabelerMount();
        wrapper.update();

        const svgProps = wrapper
            .find(SvgRootRenderer)
            .prop('svgRenderersProps')
            .map(s => s.startToken);

        expect(svgProps).toEqual([5, 0]);
    });

    it('should sort annotations in ascending order when rtl mode is on', () => {
        mockLabelerStore.configStore.setIsRtl(true);
        const wrapper = mount(<MockWrapper />);
        mockLabelerStore.onLabelerMount();
        wrapper.update();

        const svgProps = wrapper
            .find(SvgRootRenderer)
            .prop('svgRenderersProps')
            .map(s => s.startToken);

        expect(svgProps).toEqual([0, 5]);
    });

    it('should not render SVG elements when virtualization is enabled and lines are not reconciled', () => {
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<MockWrapper />);

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps')).toEqual([]);
    });

    it('should re-render the SVG elements when virtualization is enabled and lines are reconciled', () => {
        mockLabelerStore.configStore.setEnableVirtualization(true);
        mockLabelerStore.onLabelerMount();

        const wrapper = mount(<MockWrapper />);

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps').length).toEqual(0);

        mockLabelerStore.virtualizationStore.setLines(0, 1);
        mockLabelerStore.virtualizationStore.markLinesAsRendered();
        wrapper.update();

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps').length).toEqual(2);
    });

    it('should not render SVG elements when virtualization is enabled and lines are not reconciled', () => {
        mockLabelerStore.onLabelerMount();
        mockLabelerStore.virtualizationStore.setLines(0, 1);
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<MockWrapper />);

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps').length).toEqual(0);
    });

    it('should not render SVG elements when virtualization is enabled and annotations are not within line range', () => {
        mockLabelerStore.onLabelerMount();
        mockLabelerStore.virtualizationStore.setLines(2, 3);
        mockLabelerStore.virtualizationStore.markLinesAsRendered();
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<MockWrapper />);

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps').length).toEqual(0);
    });

    it('should render SVG elements when virtualization is enabled and annotations are within line range', () => {
        mockLabelerStore.onLabelerMount();
        mockLabelerStore.virtualizationStore.setLines(0, 1);
        mockLabelerStore.configStore.setEnableVirtualization(true);

        const wrapper = mount(<MockWrapper />);
        mockLabelerStore.virtualizationStore.markLinesAsRendered();
        wrapper.update();

        expect(wrapper.find(SvgRootRenderer).prop('svgRenderersProps').length).toEqual(2);
    });
});
