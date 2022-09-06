# Introduction

SVG renderers are components responsible for rendering SVG polygons and shapes on an SVG element. Each of these renderers specializes in rendering a specific type of element based on the UX designs of our labeler. Our SVG renderers are of two types:

-   Shape renderers
-   Utility renderers

These renderers have no idea who and what provides them with the correct points to be drawn. They are not aware of whether they are labels, predictions, or relations. Nor do they have any information about tokens, lines, or any other labeler concepts. They have one responsibility and one responsibility only. They get data that they know how to render.

---

# Shape renderers

These are the main shapes to be rendered like lines, arrows, boxes, etc. They abide by an `ISvgRendererProps` interface as their input. They are responsible for rendering the main shapes that define labels, predictions, relations, etc.

## The `ISvgRendererProps` interface

Each shape is drawn via a collection of lines. For example, a rectangle is formed using 4 line polygons. A relation arrow is formed by multiple lines to draw the arrow with all its breaks and directional movements. This interface exposes properties for drawing these polygons like their points, color, and name label. Currently we have no requirement to draw circles. But if we ever do, this interface will need to slightly change to support circle arguments as well (radius, x-origin, y-origin).

---

# Utility renderers

These are renderers for utility elements that are parts of the main shape renderers. Some examples of utility renderers are the `NameSvgRenderer` which renders a label/prediction entity name over a label or prediction, or the `ResizeKnobsSvgRenderer` which renderers the resizing rectangles at the end of labels or predictions.

## NameSvgRenderer

The `NameSvgRenderer` is a utility renderer that renders the name to be used for annotations. They are currently used to name labels, predictions, and relations. The `NameSvgRenderer` imposes a specific restriction or consideration that we need to take when rendering annotations. We'll explain this specific case in the following paragraphs.

Since annotation names can be longer than the width of the annotation tokens that they span, often times annotation names rendered by the `NameSvgRenderer` may overlap the names of other neighboring annotations, causing visual mess. To explain, consider the following example of two labels with long names adjacent to each other:

```
My name is 7ammo Understanding.
           ■───■ ■───────────■
           CoolFirstName
                 CoolLastName
```

> The two annotation names are drawn on two lines for demonstration purposes. In the live version of the labeler, they would overlap each other and cause them to be illegible.

The solution to this problem is two fold:

-   Add ellipsis characters whenever a name exceeds the width of its spanned tokens.
-   Show the full name of the annotation when the user hovers over the name.

While this partially solves the problem, when the user hovers over the name and its full width is shown, the same visual mess of overlapping text occurs. To solve that, we add a solid white background color to the name so that one name appears clearly over the other when hovering. To explain, this is what will happen when the user hovers over the first annotation name:

```
My name is 7ammo Understanding.
           ■───■ ■───────────■
          ┌──────────────┐
          | CoolFirstName|tName
          └──────────────┘
```

> Note: The border around `CoolFirstName` is added for visual clarity to explain the concept.

Consequently, in order to show `CoolFirstName` over `CoolLastName`, we need to ensure that it has a larger `z-index`. Unfortunately, SVG does not support the `z-index` property and the only way to ensure that one element is painted over the other is to make sure it **succeeds** it in the DOM. That means, the `NameSvgRenderer` component for `CoolFirstName` must be rendered **after** the component for `CoolLastName` was already rendered. In other words, the DOM must look like this:

```tsx
    <NameSvgRenderer>CoolLastName</NameSvgRenderer>
    <NameSvgRenderer>CoolFirstName</NameSvgRenderer>
```

To ensure that annotations that appear first in the text are rendered last, the `SvgLayoutController` sorts the annotations array in descending order of the start token index.

### RTL Support

When the labeler is RTL mode, the previous explanations are reversed. That is because the labeler is rendered in `reverse-row` direction. To explain this, consider the following example:

```
انا اسمي عمر عصام سرور
■──■      ■──■
LastName  FirstName
```

Following the previous example, we now wish to render the names in this order:

```tsx
    <NameSvgRenderer>FirstName</NameSvgRenderer>
    <NameSvgRenderer>LastName</NameSvgRenderer>
```

This ensures that the `LastName` overlaps the `FirstName` annotation when reading it. Note that this is the exact opposite of the previous case. In other words, although the `FirstName` annotation has a start token index that is smaller than the `LastName` annotation, the `LastName` annotation appears before it when reading from left to right. Therefore, we need to sort the annotations in ascending order.

---
