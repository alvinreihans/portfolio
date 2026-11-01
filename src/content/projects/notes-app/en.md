## Overview

A personal notes app built with React (Create React App) and hosted on GitHub Pages, which started as an exercise from a Dicoding class.

## Features

- Adding a note with a title of up to 50 characters, with a live counter of the characters left.
- Searching notes by title, ignoring upper and lower case.
- Separate active and archived notes, moving notes between them, and deleting notes.
- Notes are kept in localStorage, so they are still there after the browser is closed.
- A responsive grid of one, two, or four columns with a dark theme.

## Architecture

```flow
Note form (title max. 50) -> *NoteApp (state + search) -> localStorage
```

One component, `NoteApp`, holds the list of notes and the search query. The other components only display data and receive functions through props. Saving to localStorage uses a custom hook rather than hand-written `useEffect` code.
