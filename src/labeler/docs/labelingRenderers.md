# Introduction

Labeling renderers are the UI layer for the labeler. Currently, there are two main types of labeling renderers:

-   TokenRenderers
-   LineRenderers

---

## Token Renderers

A token renderer is any component that uses the `ITokenRendererProps` interface. It is the most basic component in our labeler and it is generally responsible for rendering one token. Each token renderer type renders the token text and properties in it's unique way. Our labeler allows its consumers to pass in their custom rendering function to render the tokens. A token renderer is backed by a token store that implements an `ITokenStore` interface. This ensures extensibility of our labeler to support multiple rendering formats without any changes to the data layer.

---

## Line Renderers

A line renderer renders a line of text. Each line renderer is responsible for rendering a group of tokens. A document or an utterance is simply an array of line components listed one after the other. The line renderer is backed by a line store as its data source. Currently, we have no need to support multiple types of line renderers or line stores. Therefore, we use concrete classes rather than interfaces. If for any reason we need a different type of line in the future, a similar treatment to the token renderer and their backing token stores will be applied.

---
