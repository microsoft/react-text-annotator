# Introduction

This document explains any additional information that would otherwise be noisy to add inline in the types file.

---

# `AnnotationData` type

represents the annotation passed to the labeler to be drawn

## `isReversed`

One of the peculiar properties on the `AnnotationData` type is the `isReversed` boolean property. To explain what this property is about, consider that there are cases - such as in relation annotation types - where an annotation arrow can point backwards against the order of the text. For example:

```
                          Symptom
              ┌────────────────────────────┐
              ▼                            |
Omar felt feverish as a symptom of his vaccination
```

Assume that the tokens here are words for simplicity. That means the annotation object's token indices are:

```json
{
    "startToken": 8,
    "endToken": 2
}
```

Having a start token that is larger than the end token is breaks the assumptions that the `Labeler` was built around since it was designed to flow annotations from small start token values to larger end tokens, not the opposite. Ergo, every calculation done to process tokens or annotations would need to be adjusted to account for this fact. To counter this problem, we have two choices:

1. Account for the case of having annotations with larger start tokens and smaller end tokens in every layer of the `Labeler`'s calculations and assumptions.

2. Introduce a boolean property in annotations named `isReversed` that works as follows:
    - If `isReversed` is false - which is the default value - no changes are observed.
    - If `isReversed` is true, then the annotation in actuality flows in the opposite direction. That means the `startToken` value is in fact the `endToken` value and vice versa.

```json
{
    "startToken": 2,
    "endToken": 8,
    "isReversed": true
}
```

# `AnnotationKind` type

represents the kind of the annotation: 'label' | 'negativeLabel' | 'relation' | string;

-   **Label**:

```
Hello! My name is 7ammo Understanding.
                  ■─────────────────■
```

-   **Negative label**:

```
Hello! My name is 7ammo Understanding.
                  ■------------------■
```

-   **Relation label**:

```
                  ■─────────────────■
                  |                 |
                  |                 ▼
Hello! My name is 7ammo Understanding.

```

# `AnnotationDomLineData` type

represents a horizontal line of the annotation within its start and end indices.

# `AnnotationDomData` type

represents the annotation, it contains the same props of AnnotationData plus lineSegments, that will help the SVG layer to draw the annotation.

# `SvgRendererKind` type

the kind of the SVG shape to draw: 'Underline' | 'Relation', each kind is corresponding to an annotation kind.

-   Underline -> label & negative label
-   Relation -> relation

# `ISvgRendererProps` type

represents the props needed to draw the SVG shape of the annotation.

# `ISvgRendererPropsFactory` type

factory method that takes some parameters and returns `ISvgRendererProps`, this method is used to transform the annotation data passed to the labeler in the html layout to svg props in the SVG layout. There is a factory method for each annotation kind that transforms this kind to the svg props (see svg utils for more details).

# `IKeyedSvgRendererProps` type

the same as `ISvgRendererProps` with additional annotationKey which is considered as an id of the svg shape.

# `ITokenStore` type

represents the data of the token in the line.

# `TokenPaddingCalculator` type

method calculates the max padding (top and bottom) of a token given its token store and all annotations assigned to it, this will help us to calculate the max padding in a line (array of tokens) by getting the max of all padding values of its tokens to render the lines in a right way.

# `LineHeightCalculator` type

method calculates the height of a line given top and bottom padding and lineStore (to get the max height of its tokens), the default height is **paddingTop** + **paddingBottom** + **Token_Default_Height**

# `TokenEventListenersFactory` type

factory method that takes line and token stores and returns an object of event listeners for that token.

# `CharToTokenMapType` type

maps each character index in the text to its corresponding token index (many characters may point to the same token, in word tokenization mode)

# `TokenToCharMapType` type

maps each token index to its corresponding characters range in the text.

# `GlobalEventExceptionPredicates` type

The labeler reacts to global (document level) events. In some cases, users of the labeler might want to suppress this default behavior in some cases.

For example, the selection store cancels the selection whenever the wheel event is fired. However in our usage of the labeler, we display a contextual menu with a list of entities that text can be tagged with. This list is scrollable in itself. We would want to cancel the token selection if the user scrolls through that list.

This type consists of a map of DOM event keys and predicate functions that receive the event object received when the event was triggered. If the predicate function returns true, the default event handling the labeler performs is skipped.

Example:

```typescript
const exceptionsMap = {
    onWheel: (e: Event) => e.target.className.includes('.contextualMenu'),
    onMouseDown: (e: Event) => e.target.matches('.token')
};
```

The above exception map would cause the default behavior of the global event handlers of the labeler for the mouse down and wheel events to be skipped if the target element of the event contained a class name of `contextualMenu` or `token`.

---
