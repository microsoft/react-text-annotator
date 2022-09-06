/**
 * Copyright (c) Microsoft. All rights reserved.
 */

import { UnderlineSvgRendererProps } from '../../components/svgRenderers/shapes/UnderlineSvgRenderer';
import { LineStore } from '../../stores/LineStore';
import { AnnotationData, ITokenStore, Point } from '../../types/labelerTypes';
import { labelAnnotationToSvgPropsFactory, predictionAnnotationToSvgPropsFactory } from '../../utils/svgUtils';

describe('svgUtils unit tests', () => {
    let callCount = 0;
    const getMockProps = (
        isRtl: boolean = false,
        scrollOffset: Point = { x: 0, y: 0 },
        lineStores: LineStore<ITokenStore>[] = [],
        containerCoordinates: Point = { x: 0, y: 0 },
        annotationsPerTokenMap: Map<number, AnnotationData[]> = new Map(),
        getTokenElementByIndex: any = () => ({ getBoundingClientRect: () => ({}) })
    ) => ({ isRtl, lineStores, scrollOffset, containerCoordinates, getTokenElementByIndex, annotationsPerTokenMap });

    const getMockBoundClientRect = (left: number, right: number, top: number, bottom: number) => ({ left, right, top, bottom });
    const getMockTokenElementByIndex: any = jest.fn().mockImplementation(() => {
        return (() => {
            callCount++;
            switch (callCount) {
                case 1:
                    return { getBoundingClientRect: () => getMockBoundClientRect(10, 20, 50, 20) };
                case 2:
                    return { getBoundingClientRect: () => getMockBoundClientRect(60, 70, 50, 20) };
                case 3:
                    return { getBoundingClientRect: () => getMockBoundClientRect(0, 10, 70, 40) };
                case 4:
                    return { getBoundingClientRect: () => getMockBoundClientRect(90, 100, 70, 40) };
                case 5:
                    return { getBoundingClientRect: () => getMockBoundClientRect(0, 10, 90, 60) };
                case 6:
                    return { getBoundingClientRect: () => getMockBoundClientRect(40, 50, 90, 60) };
            }
        })();
    });
    const mockLineSegments = [{ startToken: 0, endToken: 0, lineIndex: 0 }];

    describe('labelAnnotationToSvgPropsFactory unit tests', () => {
        beforeEach(() => {
            callCount = 0;
            jest.clearAllMocks();
        });

        it('should generate correct label svg data from annotation', () => {
            const data = labelAnnotationToSvgPropsFactory({
                ...getMockProps(),
                data: {
                    endToken: 5,
                    color: 'red',
                    kind: 'label',
                    startToken: 0,
                    name: '7ammo',
                    id: 'annotation_1',
                    lineSegments: mockLineSegments
                }
            });

            expect(data).toEqual(
                expect.objectContaining({
                    endLine: 0,
                    endToken: 5,
                    startLine: 0,
                    color: 'red',
                    name: '7ammo',
                    startToken: 0,
                    kind: 'underline',
                    strokeStyle: 'solid'
                })
            );
        });

        it('should generate dashed stroke when kind is negative label', () => {
            const output = labelAnnotationToSvgPropsFactory({
                ...getMockProps(),
                data: {
                    endToken: 5,
                    color: 'red',
                    startToken: 0,
                    name: '7ammo',
                    id: 'annotation_1',
                    kind: 'negativeLabel',
                    lineSegments: mockLineSegments
                }
            });

            expect((output as UnderlineSvgRendererProps).strokeStyle).toEqual('dashed');
        });

        it('should generate calculate the start and end line', () => {
            const output = labelAnnotationToSvgPropsFactory({
                ...getMockProps(),
                data: {
                    endToken: 5,
                    color: 'red',
                    kind: 'label',
                    startToken: 0,
                    name: '7ammo',
                    id: 'annotation_1',
                    lineSegments: [...mockLineSegments, { startToken: 0, endToken: 0, lineIndex: 5 }]
                }
            });

            expect(output.startLine).toEqual(0);
            expect(output.endLine).toEqual(5);
        });

        it('should calculate points correctly for a one line label', () => {
            const output = labelAnnotationToSvgPropsFactory({
                ...getMockProps(),
                getTokenElementByIndex: getMockTokenElementByIndex,
                data: {
                    endToken: 5,
                    color: 'red',
                    kind: 'label',
                    startToken: 0,
                    name: '7ammo',
                    id: 'annotation_1',
                    lineSegments: mockLineSegments
                }
            });

            expect(getMockTokenElementByIndex).toHaveBeenCalledTimes(2);
            expect(getMockTokenElementByIndex).toHaveBeenNthCalledWith(1, 0);
            expect(getMockTokenElementByIndex).toHaveBeenNthCalledWith(2, 0);
            expect(output.linePoints).toEqual([
                [
                    { x: 10, y: 20 },
                    { x: 70, y: 20 }
                ]
            ]);
        });

        it('should calculate points correctly for a one line label when rtl is on', () => {
            const output = labelAnnotationToSvgPropsFactory({
                ...getMockProps(),
                isRtl: true,
                scrollOffset: { x: 10, y: 10 },
                getTokenElementByIndex: getMockTokenElementByIndex,
                data: {
                    endToken: 5,
                    color: 'red',
                    kind: 'label',
                    startToken: 0,
                    name: '7ammo',
                    id: 'annotation_1',
                    lineSegments: mockLineSegments
                }
            });

            expect(output.linePoints).toEqual([
                [
                    { x: 70, y: 30 },
                    { x: 30, y: 30 }
                ]
            ]);
        });

        it('should calculate points correctly for a multi line label', () => {
            const output = labelAnnotationToSvgPropsFactory({
                ...getMockProps(),
                getTokenElementByIndex: getMockTokenElementByIndex,
                scrollOffset: { x: 10, y: 10 },
                data: {
                    endToken: 5,
                    color: 'red',
                    kind: 'label',
                    startToken: 0,
                    name: '7ammo',
                    id: 'annotation_1',
                    lineSegments: [...mockLineSegments, ...mockLineSegments, ...mockLineSegments]
                }
            });

            expect(getMockTokenElementByIndex).toHaveBeenCalledTimes(6);
            expect(output.linePoints).toEqual([
                [
                    { x: 20, y: 30 },
                    { x: 80, y: 30 }
                ],
                [
                    { x: 10, y: 50 },
                    { x: 110, y: 50 }
                ],
                [
                    { x: 10, y: 70 },
                    { x: 60, y: 70 }
                ]
            ]);
        });
    });

    describe('predictionAnnotationToSvgPropsFactory unit tests', () => {
        beforeEach(() => {
            callCount = 0;
            jest.clearAllMocks();
        });

        it('should generate correct prediction svg data from annotation', () => {
            const data = predictionAnnotationToSvgPropsFactory({
                ...getMockProps(),
                data: {
                    endToken: 5,
                    color: 'red',
                    startToken: 0,
                    name: '7ammo',
                    kind: 'prediction',
                    id: 'annotation_1',
                    lineSegments: mockLineSegments
                }
            });

            expect(data).toEqual(
                expect.objectContaining({
                    endLine: 0,
                    endToken: 5,
                    kind: 'box',
                    startLine: 0,
                    color: 'red',
                    name: '7ammo',
                    startToken: 0
                })
            );
        });

        it('should generate calculate the start and end line', () => {
            const output = predictionAnnotationToSvgPropsFactory({
                ...getMockProps(),
                data: {
                    endToken: 5,
                    color: 'red',
                    startToken: 0,
                    name: '7ammo',
                    kind: 'prediction',
                    id: 'annotation_1',
                    lineSegments: [...mockLineSegments, { startToken: 0, endToken: 0, lineIndex: 5 }]
                }
            });

            expect(output.startLine).toEqual(0);
            expect(output.endLine).toEqual(5);
        });

        it('should calculate points correctly for a one prediction label', () => {
            const output = predictionAnnotationToSvgPropsFactory({
                ...getMockProps(),
                getTokenElementByIndex: getMockTokenElementByIndex,
                data: {
                    endToken: 5,
                    color: 'red',
                    startToken: 0,
                    name: '7ammo',
                    kind: 'prediction',
                    id: 'annotation_1',
                    lineSegments: mockLineSegments
                }
            });

            expect(getMockTokenElementByIndex).toHaveBeenCalledTimes(2);
            expect(getMockTokenElementByIndex).toHaveBeenNthCalledWith(1, 0);
            expect(getMockTokenElementByIndex).toHaveBeenNthCalledWith(2, 0);
            expect(output.linePoints).toEqual([
                [
                    { x: 10, y: 50 },
                    { x: 70, y: 50 }
                ],
                [
                    { x: 10, y: 20 },
                    { x: 70, y: 20 }
                ],
                [
                    { x: 10, y: 50 },
                    { x: 10, y: 20 }
                ],
                [
                    { x: 70, y: 20 },
                    { x: 70, y: 50 }
                ]
            ]);
        });

        it('should calculate points correctly for a multi line prediction', () => {
            const output = predictionAnnotationToSvgPropsFactory({
                ...getMockProps(),
                getTokenElementByIndex: getMockTokenElementByIndex,
                scrollOffset: { x: 10, y: 10 },
                data: {
                    endToken: 5,
                    color: 'red',
                    startToken: 0,
                    name: '7ammo',
                    kind: 'prediction',
                    id: 'annotation_1',
                    lineSegments: [...mockLineSegments, ...mockLineSegments, ...mockLineSegments]
                }
            });

            expect(getMockTokenElementByIndex).toHaveBeenCalledTimes(6);
            expect(output.linePoints).toEqual([
                [
                    { x: 20, y: 60 },
                    { x: 80, y: 60 }
                ],
                [
                    { x: 20, y: 30 },
                    { x: 80, y: 30 }
                ],
                [
                    { x: 10, y: 80 },
                    { x: 110, y: 80 }
                ],
                [
                    { x: 10, y: 50 },
                    { x: 110, y: 50 }
                ],
                [
                    { x: 10, y: 100 },
                    { x: 60, y: 100 }
                ],
                [
                    { x: 10, y: 70 },
                    { x: 60, y: 70 }
                ],
                [
                    { x: 20, y: 60 },
                    { x: 20, y: 30 }
                ],
                [
                    { x: 60, y: 70 },
                    { x: 60, y: 100 }
                ]
            ]);
        });
    });
});
