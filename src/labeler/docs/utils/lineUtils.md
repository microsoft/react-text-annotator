# Introduction

In this document we describe the functions used to make some operations on text lines.

# `getLineElementByIndex` function

Gets the line DOM element with the given index from the given HTML container and is used for a11y stuff.

# `getLineInfos` function

Breaks the text into lines based on:

-   The `\n` characters in the original text.
-   Each of these lines are then further broken into more lines if the number of characters in it exceeds the maximum number of allowable characters taking the word breaking mode of the config store into consideration.

# `getTokens` function

Calculates all tokens in all line of the given text based on whether the labeler is tokenized by character or word.

-   If tokenizationType is word, it splits the line text with spaces or `\n` so each word is a token.
-   If tokenizationType is character, it splits the line text into characters (the default behavior) so each character is a token.

# `getCharAndTokenMapping` function

Calculates the mappers needed to update annotation token ranges when passing to/from the labeler. That's because there are two modes of tokenization in the labeler, character and word tokenization. So we need to map each index in the labeler text to the corresponding token index and map each token index to the start and end indices of that token in the labeler text.

# `lineRendererSelectionInteractions` function

Handles the effects key interactions from a line or tokens inside a line have on the selection store.

# `lineRendererA11yInteractions` function

Handles the effects key interactions from a line or tokens inside a line have on the a11y store.

# `onLineRendererKeyDown` function

Handles all selection and a11y actions fired from a line in a labeler. The event is considered consumed and thus blocked from propagation if any of the selection or a11y actions are fired on it.

# `getMaxLineWidthAndSvgXOffset` function

Gets the max width of the labeler lines and x offset of the svg layer.

# `getTargetIndex`function

Gets the indices of previous and next lines to focus based on the current direction.
