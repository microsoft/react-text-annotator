# react-text-annotator

react-text-annotator is a labeler component that:

-   Lays out text and overlays textual decorations like labels, predictions, and relations based on given data.
-   Handles user interactions on tokens.
-   Is extensible to allow for custom rendering of tokens and decoration overlays.
-   Is accessible to use with full keyboard interactions.

This labeler is character tokenized, meaning that it will break all text sent in its props to character level tokens. Tokens are split to lines based on line breaks in the original text and the maximum number of characters allowed in each line. The labeler also ensures that contiguous words in the original text are not split across multiple lines.


# Examples
Here are some example of how to use the labeler component:

```js
    const annotations: AnnotationData[] = [
        {
            id: 'id1',
            color: 'red',
            endToken: 15,
            startToken: 5,
            name: 'label',
            kind: 'label'
        },
        {
            id: 'id2',
            color: 'blue',
            endToken: 25,
            startToken: 10,
            name: 'relation',
            kind: 'relation'
        }
    ];

    const labelerText = 'This is sample text to test the labeler functionality.';

    return <Labeler text={labelerText} annotations={annotations} />;
```
the result is:

![result-1](src/labeler/docs/labeler-result-1.png)

--- 

```js
 const annotations: AnnotationData[] = [
        {
            id: 'id1',
            color: 'red',
            endToken: 15,
            startToken: 2,
            name: 'label',
            kind: 'label'
        }
    ];

    const labelerText = `اسمي محمد و اعمل لدى شركة ميكروسوفت`;

    return <Labeler text={labelerText} annotations={annotations} labelerConfigs={{ isRtl: true, tokenizationType: 'word' }} />;
```

the result is:

![result-2](src/labeler/docs/labeler-result-2.png)