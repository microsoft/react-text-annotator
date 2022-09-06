# Introduction

In this document we describe the functions used to make some operations on annotations.

# `getAnnotationElementByKey` function

Gets annotation element by the given key inside the given html element reference and used to focus this annotation in a11y stuff.

# `getAnnotationElementsByTokenIndex` function

Gets the annotation element of the given token index inside the given html element reference and used to focus this annotation in a11y stuff.

# `sortAnnotations` function

Compare function to sord annotations and used to determine the order of the elements.

# `isAnnotationWithinIndices` function

Checks whether the given annotation is within the given start and end line indices or not and used to filter annotations when virtualization is enabled.

# `getUniqueAnnotationsPerLine` function

Gets an array of the unique annotations per line which is gathered by aggregating the annotations per token for each token in the line.

# `reverseAnnotation` function

Reveres the given annotation by swapping its start and end tokens, and setting the reversed flag to true. This is useful for annotations that have a start index that is larger than the end index, since our labeler is built under the assumption of having always having the start index smaller than the end index.

# `annotationDataToAnnotationDomData` function

Converts the given annotation data to data augmented with DOM specific data that is essential for renderers to render the final SVG shape for the annotation.

# `onAnnotationKeyDown` function

A handler function for when an annotation is focused and a key is pressed.

# `getAnnotationTokenRangeAfterResizing` function

Gets the new token range of an annotation after resizing.
