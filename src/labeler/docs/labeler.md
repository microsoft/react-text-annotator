# Labeler Overview

A labeler is a component that:

-   Lays out text and overlays textual decorations like labels, predictions, and relations based on given data.
-   Handles user interactions on tokens.
-   Is extensible to allow for custom rendering of tokens and decoration overlays.
-   Is accessible to use with full keyboard interactions.

This labeler is character tokenized, meaning that it will break all text sent in its props to character level tokens. Tokens are split to lines based on line breaks in the original text and the maximum number of characters allowed in each line. The labeler also ensures that contiguous words in the original text are not split across multiple lines.

---

# Labeler Data flow

The flow of data in the labeler follows two separate streams as seen in the following diagram. Note that the letters denoted in each box do not have specific meaning and are placed there toe be able to reference them in the rest of the document.

```
                    ┌─────────────┐
                    │     (c)     │
           ┌───────►|  LinesInfo  ├───────────┐
           │        │             │           │
           │        └─────────────┘           │         ┌───────────────────────────────────────────────┐
           │                                  │         | LayoutController                              |
  ┌─────────────┐   ┌─────────────┐   ┌───────▼───────┐ |    ┌─────────────────┐   ┌────────────────┐   |
  │     (a)     │   │     (b)     │   │      (d)      │ |    │       (e)       │   |       (f)      |   |
  │   RawText   ├──►| TokenStores ├──►│  LineStores   ├─────►│  LineRenderers  ├──►│ TokenRenderers │   |
  │             │   │             │   │               │ |    │                 │   |                |   |
  └─────────────┘   └─────────────┘   └───────────────┘ |    └─────────────────┘   └────────────────┘   |
                                             │          | ┌───────────────────────────────────────────┐ |
                                   ┌─────────│──────────┘ |  SvgLayoutController                      | |
  ┌─────────────┐                  |  ┌──────▼──────┐     |  ┌─────────────────┐   ┌────────────────┐ | |
  │     (A)     │                  |  │     (B)     │     |  │       (C)       │   │      (D)       │ | |
  │ Annotations ├────────────────────►│ Annotations ├───────►│    ISvgRender   ├──►│  SvgRenderers  │ | |
  │             │                  |  │   DomData   │     |  │      Props      │   │                │ | |
  └─────────────┘                  |  │             │     |  │                 │   |                | | |
                                   |  └─────────────┘     |  └─────────────────┘   └────────────────┘ | |
                                   |                      └───────────────────────────────────────────┘ |
                                   └────────────────────────────────────────────────────────────────────┘
```

We will start exploring each data transformation in more detail in the following document sections.

---

## Block (a) to (b): Converting raw text to token stores.

The labeler starts by splitting the text to character level tokens. It uses a token factory to generate a token store for each token (a character). A token store is a data structure used to provide data to a token renderer that renders an actual token.

A token factory is a factory function that creates instances of token stores that implement the interface `ITokenStore`. This allows the labeler to support any token data structure that can be rendered in any way the user wants, as long as token store abides by the `ITokenStore` interface.

The default token factory creates instances of the `TokenStore` class, which represents the most basic token type that can be rendered.

The `ITokenStore` interface defines that each token needs - among other future properties - an index, text (in our case, one character), and annotations that are associated with this token. In order to provide that, the labeler calculates a hash map of all tokens and their associated annotations to be able to create the token stores and store the associated annotations in each token.

---

## Block (a) to (c): Splitting text/tokens to lines

The next step the labeler does is to break the raw text into separate lines. The labeler does so through two steps:

1. Breaking the text on line breaks (`\n` characters).
2. Breaking those lines again based on a `maximumCharacterPerLineValue`.

The labeler keeps track of each broken line's index and original number (according to the original line breaks in the text). To clarify these two steps, consider the following example.

Assume the following raw text, and assume a labeler with a `maximumCharacterPerLineValue` of 20.

Original Text:

```
Hello! How are you?\nMy name is Omar Sourour and I love writing documentation!\nIt saves a lot of time in the future.
```

### Step 1

Break lines based on break characters. Notice that the line index is 0 based while the line number that represents the actual line number in the original text is 1 based.

```
(Line number 1, index 0) Hello! How are you?
(Line number 2, index 1) My name is Omar Sourour and I love writing documentation!
(Line number 3, index 2) It saves a lot of time in the future.
```

### Step 2

Break each line based on the maximum number of characters allowed in each line. Notice how the line number represents the original line that the segment of text belonged to, while the line index represents the index in the total number line segments after breaking. Another note is that no word will be broken in the middle to two lines.

```
(Line number 1, index 0) Hello! How are you?
(Line number 2, index 1) My name is Omar
(Line number 2, index 2) Sourour and I love
(Line number 2, index 3) writing
(Line number 2, index 4) documentation!
(Line number 3, index 5) It saves a lot of
(Line number 3, index 6) time in the future.
```

Read more about the algorithm of breaking the lines into indices and tokens in `lineUtils.md`. See more examples of text being broken into lines in `lineUtils.test.ts`.

---

## Block (b, c) to (d): Constructing line stores from token stores and line info

The labeler now can create an array of `LineStore` data structures using the data calculated from the previous steps. The line store data structure is the backing data structure used to render one line of text (tokens) in our labeler.

An utterance/document consists of multiple lines, and this can consist of multiple line stores. Each line store contains information about the line's index, number, and the token stores that it contains.

---

## Block (d) to (e): Pass line stores to `LayoutController` for rendering

Whilst the `Labeler`'s concern is to get raw data via its props and convert it to data structures it understands, the `LayoutController` is responsible for rendering these data-structures into actual HTML and SVG elements. In other words, the `Labeler` deals with data, and the `LayoutController` deals with rendering. This separation of concerns allows us to change how the data is rendered without affecting the shape of the data that is passed in. It also allows to easily unit test the labeler's data manipulations without having to worry about how the data will be rendered down in the pipeline.

The `LayoutController` renders the given text and annotations into HTML and SVG elements.

-   Tokens and lines are rendered into HTML `span` and `div` elements.
-   Labels, predictions, relations, etc. are rendered into SVG elements.

As we will see in a few sections, the `LayoutController` delegates the calculation of SVG points to the `SvgLayoutController`, which takes in annotation data and calculates the positions of the SVG elements that should be drawn accordingly.

Each `LineStore` data structure is passed to a line renderer that accepts props that abide by the interface `LineRendererProps`. That means that we can potentially support multiple ways of rendering a line. Currently, we have no need to do this, but it can be easily supported in the future if required.

Read more about the specific properties the `LineRenderer` requires in `labelingRenderers.md`. Read more about an important step in rendering lines which is calculating token padding in `tokenUtils.md`.

---

## Block (e) to (f): Rendering token stores via token renderers inside lines

As mentioned in previous sections, each line consists of multiple tokens. When a `LineStore` is rendered via a `LineRenderer`, each token inside this line is rendered via a `TokenRenderer`. A token renderer is any renderer that accepts props that abide by the interface `ITokenRendererProps`. As mentioned before, this allows the labeler to support multiple ways to render tokens based on any consumer provided renderer.

---

## Block (A) to (B): Constructing DOM-aware annotation data structures from raw annotations

In a parallel data flow pipeline, raw `Annotation` objects are passed to the labeler. An `Annotation` object represents a decoration that can be applied to one or (usually) multiple tokens. Examples of annotations are labels, predictions, relations, etc. Each annotation has an extensible `kind` property, which allows the user to provide any custom type of annotation as long as it abides by the `Annotation` interface.

Annotations provided by the user define a name, a start token index, an end token index, and other properties that describe the annotation. We do not expect the user to know whether this specific annotation will span one line or multiple lines, whether it will require padding from tokens to render it correctly or not, or any other internal `Labeler` or DOM related information.

That is why the first step the `LayoutController` applies to annotations is to convert them to into a more DOM-aware data structure `AnnotationDomData`. An `AnnotationDomData` object augments the original `Annotation` data with details about which line index the annotation starts and ends along with the start token and end token indices the annotation spans within that specific line index. For example, consider the following text annotated by a label (denoted by the underline):

```
Hello! My name is Omar
          ■───────────
Sourour, and I love writing documentation!
──────■
```

The original `Annotation` object would contain properties like this:

```json
{ "startToken": 10, "endToken": 29, "kind": "label" }
```

The `AnnotationDomData` object would augment it with the properties like this:

```json
{
    "startToken": 10,
    "endToken": 29,
    "kind": "label",
    "lineSegments": [
        { "lineIndex": 0, "startToken": 10, "endToken": 21 },
        { "lineIndex": 1, "startToken": 23, "endToken": 29 }
    ]
}
```

Read more about the conversion function in `annotationUtils.md`.

---

## Block (B) to (C): Constructing SVG renderer props from DOM-aware annotations

The most complicated step is to convert `AnnotationDomData` to `ISvgRendererProps` data structures. `ISvgRendererProps` is the interface that SVG renderers understand to draw SVG shapes on the screen. It contains `linePoints`, which is an array of `Point` tuples that describe the coordinates of the lines to draw.

Each annotation type has it's own utility function that implements the `ISvgRendererPropsFactory` interface which converts annotations to props for a specific type of SVG renderer. Users of the `Labeler` can also override those default functions by providing a hashmap `Map<AnnotationKind, ISvgRendererPropsFactory>`.

Read more about the default factory functions in `svgUtils.md`.

---

## Block (C) to (D): Rendering SVG shapes from ISvgRendererProps

The final step in the data flow diagram is to actually draw the SVG shapes that denote annotations. Each shape has its specific renderer that implements the `ISvgRenderer` interface that accepts `ISvgRendererProps` and outputs `JSX` SVG elements.

Once again, the users of the `Labeler` can override the default renderers by providing a hashmap `Map<SvgRendererKind, ISvgRenderer>` that maps each renderer kind to a rendering function that renders SVG elements (or whatever the user wants to render).

---

# Labeler interactions handling

In the previous section we described how data flows in and out of the labeler. In this section we describe how the labeler manages interactions with this data. In other words, we will discuss how the labeler handles user events with its constituent visuals (tokens, annotations, etc.).

## Handling token interactions

In order to enable actual labeling, it is imperative to allow the user to interact with tokens to be able to hover and select them. That is implemented by attaching event listeners on each token rendered by the label for required events (mouse click, hover, drag, etc.).

The `TokenEventListenersFactory` type defines a factory function that given an `ITokenStore` and a `LineStore`, creates an object containing event handlers that are ready to be attached to tokens. The `Labeler` uses default token event handlers defined in the `Labeler` utilities for commonly used and required events.

The `Labeler` also allows the user to pass in a custom factory that abides by the `TokenEventListenersFactory` type to create custom event handlers to augment the default ones. The `Labeler` then merges both functions (the default and custom ones) and fires them both when triggered. To explain, consider the following example:

```js
defaultEventListeners: {
    onMouseDown: () => console.log('Default handler for mouse down'),
    onMouseUp: () => console.log('Default handler for mouse up')
}

customEventListeners: {
    onMouseDown: () => console.log('Custom handler for mouse down'),
    onMouseUp: () => console.log('Custom handler for mouse up'),
}


// Combine both default and custom event listeners. It's output would be as if we had created functions like these from the beginning:

mergedEventListeners: {
    onMouseDown: () => {
        console.log('Default handler for mouse down');
        console.log('Custom handler for mouse down');
    },
    onMouseUp: () => {
        console.log('Default handler for mouse up');
        console.log('Custom handler for mouse up');
    }
}
```

---
