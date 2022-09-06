# Introduction

The labeling stores are the backing data and operations that are required to render and interact correctly with the labeler's components (lines, tokens, labels, etc.). Each building block has a store as its data source.

-   **TokenStore**: Used as the data source for token renderers. Since we support multiple types of tokens, all token stores implement an `ITokenStore` interface.
-   **LineStore**: Used as the data source for line renderers. Must contain an array of token stores for the line to render.

# LabelerStore

It’s the utility store that contains references of all stores used in the labeler in addition to some variables, It can be passed to multiple layers of the labeler to act as an event bus between these layers.

# TokenStore

This is the token store used in the labeler, it extends BaseTokenStore and just calls super in the constructor.

Any customization in the future for the token will be added to this class.

# LineStore

It's a generic class that stores some info about line and its tokens.

# LabelerSelectionStore

It stores and updates all variables related to the selection state of the labeler.

# LabelerConfigStore

It stores and updates all configuration values used in the labeler

# LabelerVirtualizationStore

It contains virtualization state pertinent to rendering the correct lines and SVG annotations in the labeler.

# LabelerAnnotationsStore

It stores a deep copy of the annotations passed to the labeler and makes some actions on them.

# LabelerA11yStore

The `LabelerA11yStore` controls the state that backs keyboard accessibility across the labeler. It controls how keyboard focus moves between lines and tokens. The `LabelerA11yStore` methods are called by keyboard event handlers on `LineRenderer` and `TokenRenderer` components. Currently, the `LabelerA11yStore` governs accessibility with the following rules:

-   Up and Down arrow keys moves the focus between lines. The focus navigation is circular. Meaning that if the focus is on the last line, pressing a down arrow key will move the focus back to the first line. The same behavior happens for the up arrow key when the focus is on the first line.
-   Left and right arrow keys moves the focus between tokens. Token focus is not circular by default. That means, when the focus reaches the last token in the labeler, it will remain there until the user decides to the move the focus backwards.
-   The Home and End buttons move the focus to the first/last lines or tokens in the line respectively.
-   Ctrl + Home/End buttons move focus to the absolute first/last token in the labeler, not the first/last token in the line.

The `LabelerA11yStore` needs to be initialized with the line count, token count, and the ref to the HTML container of the labeler at initialization. It needs the:

-   Line count: To be able to focus the last line when the End button is clicked and to know when to circle back focus to the first line when the last one is reached.
-   Token count: To be able to focus the last token when the Ctrl + End button is clicked and to be able to stop focus movement when the last token is reached.
-   Container ref: To be able to access the HTML elements, apply `tabIndex` attributes, and call the `focus` function to set them as active.

---
