# Introduction

In this document we describe the factory functions of type `ISvgRendererPropsFactory` that convert annotations to SVG properties that can be passed to an SVG renderer to be rendered to SVG elements. Currently, we support 3 types of built-in annotations:

-   Labels/Negative labels
-   Relations
-   Predictions

# The `labelAnnotationToSvgPropsFactory` function

This factory function is used to render SVG points for labels. The way the data is as follows:

-   Primitive data like name, start token, end token, color, etc. are passed through directly.
-   Line points are calculated based on the shape being drawn.

In the following paragraphs we will be describing how the line points for an underline SVG renderer are calculated. Label annotations can come in two cases:

-   Single line label annotations: These are annotations that have start and end tokens in the same line.
-   Multi line label annotations: These are annotations that have start and end tokens on different lines.

## Single line label annotations

Generating SVG points for single line label annotations is a relatively easier task. To explain how its done, consider the following diagram.

```
Hello! My name is 7ammo Understanding.
                  ■─────────────────■
```

Zooming in onto the utterance above shows that the label starts from the bottom left corner of the token '7' and ends at the bottom right corner of the token 'g'. In other words, to draw the line for this label, we need to generate two points (sX, sY) and (eX, eY).

> Note: Since the tokens are on a straight line, we are guaranteed that sY and eY are equal.

```
    ┌───────┐                                  ┌───────┐
    │   7   │ A M M O  U N D E R S T A N D I N │   G   │
    ■───────┘                                  └───────■
(sX, sY)                                           (eX, eY)

■──────────────────────────────────────────────────────■
```

The algorithm to calculate the SVG line coordinates is as follows:

1. Get the client bounding rect of the start token of the annotation. Use it to find (sX, sY).
2. Get the client bounding rect of the end token of the annotation. Use it to find (eX, eY).
3. Calculate the x-offset and y-offset that should be added to the two points (sX, sY) and (eX, eY). The following can affect offset:
   a. Container offset: This is a constant offset that needs to be added to all x and y coordinates to account for the offset of the entire labeler in the page. Surely the labeler can not be guaranteed to be rendered at the DOM origin point (0, 0). That is why we need to compensate by adding the entire labeler container x and y coordinates as an offset to the annotation calculations.
   b. Scroll offset: This is an offset generated from the fact that the labeler can be in a div that scrolls right or left and the annotation points need to be added that value.
   c. Annotation level: A constant offset variable is multiplied by the level of the label to ensure that the line moves lower than the tokens by the amount of "steps" that it needed as per its level. A higher level value means a higher y-value and the lower the diagram moves.

The following diagram shows how the y-coordinates of the labels are calculated based on their level. The labels `FirsName` and `LastName` are at level `0`, thus their height is an addition of the coordinate of the token and the constant `levelOffset` multiplied by their level, which is `0`.

```
    ┌───────┐                                  ┌───────┐
    │   7   │ A M M O  U N D E R S T A N D I N │   G   │
    ■───────┘                                  └───────■
(sX, sY)                                           (eX, eY)

■───────────────────■  ■───────────────────────────────■ --> Y value = eY + levelOffset * 0
FirstName              LastName

■──────────────────────────────────────────────────────■ --> Y value = eY + levelOffset * 1
FullName
```

Therefore, we see that the coordinates of the starting point of a label can be denoted by the following equation. Let `(lsX, lsY)` and `(leX, leY)` be the starting and ending coordinates of a label `l` respectively. Let `lLevel` be the level of the label `l.

```
lsX = sX;
lsY = sY + containerOffset.y + scrollOffset.y + levelOffset * lLevel
esX = eX;
esY = eY + containerOffset.y + scrollOffset.y + levelOffset * lLevel
```

## Multi-line label annotations

We extend the same concept that we've shown in the previous section to support multiple line annotations. Assume that the previous algorithm is denoted by `g(l)` where `l` is the line segment to get the points for. Extending to multi-line support is a simple process of repeating the same function on all line segments of the annotation.

For each line segment of the annotation dom data:

1. Apply g(l) on the ith line segment.
2. Push the points calculated to the final array of points.

---

# The `predictionAnnotationToSvgPropsFactory` function

This factory function is used to render SVG points for predictions. The way the data is passed is as follows:

-   Primitive data like name, start token, end token, color, etc. are passed through directly.
-   Line points are calculated based on the shape being drawn.

Prediction annotations can come in two cases:

-   Single line prediction annotations: These are annotations that have start and end tokens in the same line.
-   Multi line prediction annotations: These are annotations that have start and end tokens on different lines.

## Single line prediction annotations example:

```
       ■──────────┐
Hello! │My name is│ 7ammo
       └──────────■
```

## Multi-line prediction annotations examples:

```
       ■─────────────────
Hello! │My name is 7ammo.
       └─────────────────

────────────────┐
And I am writing│ documentation right now.
────────────────■

```

```
       ■────────────────
Hello! │My name is 7ammo
       └────────────────

────────────────────────────────────────
And I am writing documentation right now
────────────────────────────────────────

──────────────┐
for prediction│ annotation.
──────────────■

```

Note that the input line segments are the data structure that holds the coordinate points of each line not including any parallel lines. The algorithm to calculate the box line points is as follows:

1.  Define function `getHorizontalLinePointsForLineSegment(line)` where `line` is a line segment, this function calculates and returns two horizontal lines based on the data in `line` as follows:

    -   Gets the `startRect` and `endRect` values, which are the start and end token elements of the `line` currently being processed.
    -   Using the `containerOffset` point and the prediction level, the horizontal lines are:
        a- FirstLine =

    ```
        [
            {
                x: startRect.left + containerOffset.x,
                y: startRect.top + containerOffset.y - predictionLevel
            },
            {
                x: endRect.right + containerOffset.x,
                y: endRect.top + containerOffset.y - predictionLevel
            }
        ]
    ```

        b- SecondLine =

    ```
        [
            {
                x: startRect.left + containerOffset.x,
                y: startRect.bottom + containerOffset.y + predictionLevel
            },
            {
                x: endRect.right + containerOffset.x,
                y: endRect.bottom + containerOffset.y + predictionLevel
            }
        ]
    ```

2.  Define function `getVerticalLinePointsFromHorizontalLines(horizontalLinePoints)` where `horizontalLinePoints` are the generated horizontal lines from `getHorizontalLinePointsForLineSegment`, it calculates and returns the two vertical lines of the box shape as follows:

    -   Calculates the first vertical line from the first two horizontal lines:

    ```
        [
            { x: horizontalLinePoints[0][0].x, y: horizontalLinePoints[0][0].y },
            { x: horizontalLinePoints[0][0].x, y: horizontalLinePoints[1][0].y }
        ]
    ```

    -   Calculates the second vertical line from the last two horizontal lines:

    ```
        [
            {
                x: horizontalLinePoints[horizontalLinePoints.length - 1][1].x,
                y: horizontalLinePoints[horizontalLinePoints.length - 1][1].y
            },
            {
                x: horizontalLinePoints[horizontalLinePoints.length - 1][1].x,
                y: horizontalLinePoints[horizontalLinePoints.length - 2][1].y
            }
        ]
    ```

3.  For each line segment, get the horizontal lines using the `getHorizontalLinePointsForLineSegment` function. Push the resulting lines to the final line points array.
4.  Pass the generated horizontal lines in step (3) to `getVerticalLinePointsFromHorizontalLines` generate the vertical lines that bound the prediction box and push the resulting lines to the final line points array.
5.  Return all generated lines, horizontal and vertical.
