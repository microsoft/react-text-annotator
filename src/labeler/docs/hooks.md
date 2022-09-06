# Introduction

In this document we describe the hooks used in the labeler

# `useAnnotationIndexConverter` hook

Wraps a callback function passed to the labeler and received an annotation data as parameter, and that's to update the annotation token ranges using the token-to-char map calculated after getting line infos.

# `useAnnotationResizer` hook

Controls annotations resizing behavior. It registers event handlers on the document level whenever the user starts dragging an annotation and removes them whenever the user cancels or stops resizing an annotation.

# `useCalculateLineInfos` hook

Calculates line infos of the labeler text, this includes line indices, token ranges and token texts. also calculates the mapping needed to update annotation ranges when passing to/from the labeler.

# `useInitializeLayoutController` hook

Initializes the number of lines and tokens in annotation store, selection store and a11y store.

# `useLabelerConfigSyncer` hook

Syncs the configs provided by the user to the labeler with the configs stored in the config store.

# `useLabelerDimensionsSetterAfterScrolling` hook

Updates the scroll width of the labeler when the virtualization is enabled and while scrolling, that's to keep the max width of the labeler lines.

# `useLabelerGlobalEventListeners` hook

Adds global event listeners such as keydown, wheel and mousedown to the document to update the selection store.

# `useResizeWatcher` hook

Updates the labeler dimensions on changing the screen size by zooming in/out or resizing.

# `useSelectionDisableReaction` hook

Cancels selection and hover states whenever the selection is disabled flag is true.

# `useSelectionReaction` hook

Creates a side effect to react whenever the selection state changes to inform the user of the labeler that selection has changed. Note that the callback is passed only when the user has finished "dragging" the mouse to avoid many calls to the callback.

# `useTokenEventListeners` hook

Merges the user defined token event listeners with the default token event listeners that our labeler supports.

# `useVirtualizer` hook

Tracks scrolling and annotation changes in the labeler to calculate the start and end line indices of the lines to virtual render in the labeler viewport. Updates the `LabelerVirtualizationStore` with the new line indices whenever a change requiring re-evaluation occurs. It also accounts for the annotations visible in the viewport to expand the virtual rendering line indices to ensure annotations visible in the viewport are rendered correctly.
