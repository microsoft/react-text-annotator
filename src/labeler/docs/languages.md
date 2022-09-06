# Introduction

In this document, we list out the philosophy that we are following with the labeler regarding to language support. The labeler is meant to be a component that enables users to annotate their textual data as efficiently and easily as possible. It is NOT meant to be a language tokenization service.

Since there are many, many languages out there, each with their specific nuances, it is very difficult to account for each of these cases in our labeler. Therefore we decided that our implementation be as language agnostic as possible, while abiding by specific principles.

---

# Language support principles

Our labeler implementation will ensure:

-   Correctness and coherency of the annotations rendered on the text and the indices provided in the data structures. In other words, we prioritize the labeler displaying the correct annotations and preventing users from making unexpected selections that would result in annotation indices that are incorrect. A good example for this is the Arabic language, which has multiple diacritics that are rendered as part of a word. If the labeler renders Arabic language by character, the letters and their diacritics would account for different character indices, which can result in annotations that have the letter selected without its diacritic. This can be both confusing and erroneous for the user.

-   Prioritize generalization over customization. Instead of adding specific rules to adopt each language, we instead provide tools and configurations that the users of the labeler can set to reach their desired outcome. For example, we provide configurations like `wordBreak` and different tokenization methods (by character vs by whitespace) that users can use to render different languages in different ways based on the rules and structure of that language.

-   Be as language agnostic as possible. It follows from the previous point that our implementation will try to minimize the usage of specific unicode ranges or character codes as much as possible. There are some cases (like `wordBreak` normal mode) where that is impossible, but the general rule is to avoid conditioning on languages or locales.

---
