/**
 * Copyright (c) Microsoft. All rights reserved.
 */

// Data attribute names
export const a11yTabIndexAttribute = 'tabindex';
export const lineDataAttribute = 'data-is-line';
export const tokenDataAttribute = 'data-is-token';
export const bracketDataAttribute = 'data-is-bracket';
export const lineIndexDataAttribute = 'data-line-index';
export const tokenIndexDataAttribute = 'data-token-index';
export const annotationDataAttribute = 'data-is-annotation';
export const annotationIndexDataAttribute = 'data-annotation-index';
export const annotationEndLineIndexDataAttribute = 'data-annotation-end-line-index';
export const annotationEndTokenIndexDataAttribute = 'data-annotation-end-token-index';
export const annotationStartLineIndexDataAttribute = 'data-annotation-start-line-index';
export const annotationStartTokenIndexDataAttribute = 'data-annotation-start-token-index';

// Constants
export const LABELER_VERTICAL_PADDING = 10;
export const MAX_CHARACTERS_PER_LINE = 100;
export const LABELER_HORIZONTAL_PADDING = 10;
export const VIRTUALIZATION_RENDER_AHEAD = 2;
export const LINE_HEIGHT_CHANGE_DEBOUNCE = 50;
export const VIRTUALIZATION_SCROLL_DEBOUNCE = 50;
export const LINE_VIRTUALIZATION_RENDER_DEBOUNCE = 50;

export const UNDERLINE_STROKE_WIDTH = 2;
export const UNDERLINE_NAME_Y_OFFSET = 4;
export const TOKEN_UNDERLINE_PADDING = 20;

export const TOKEN_Z_INDEX = 1;
export const TOKEN_DEFAULT_HEIGHT = 17;
export const TOKEN_DEFAULT_PADDING = 6;
export const TOKEN_CLASS_NAME = 'inner-token';

export const RELATION_STROKE_WIDTH = 2;
export const RELATION_NAME_Y_OFFSET = 10;
export const TOKEN_RELATION_PADDING = 18;

export const PREDICTION_STROKE_WIDTH = 1;
export const PREDICTION_NAME_Y_OFFSET = 10;
export const TOKEN_PREDICTION_Y_PADDING = 20;

export const RESIZE_HANDLE_X_OFFSET = 2;
export const RESIZE_HANDLE_SIZE_LARGE = 4;

export const NAME_FONT_SIZE = 10;
export const BRACKET_OFFSET = -4;
export const TOOLTIP_MAX_WIDTH = 300;
export const TOOLTIP_MAX_HEIGHT = 300;
export const RTL_ANNOTATION_X_OFFSET = 4;

export const LABELER_DEFAULT_HEIGHT = '100%';
export const LABELER_DEFAULT_OVERFLOW = 'auto';

export const nextLineChars = ['\r', '\n'];

export const LabelerKeyCodes = {
    Tab: 'Tab',
    Space: ' ',
    End: 'End',
    Home: 'Home',
    Enter: 'Enter',
    OpenBraces: '{',
    CloseBraces: '}',
    Escape: 'Escape',
    Delete: 'Delete',
    ArrowUp: 'ArrowUp',
    Backspace: 'Backspace',
    ArrowLeft: 'ArrowLeft',
    ArrowDown: 'ArrowDown',
    ArrowRight: 'ArrowRight'
};
