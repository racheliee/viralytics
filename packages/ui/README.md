## Notes

- The `ThemeProvider` causes hydration errors when there is an extension that mutates the HTML document
  - Related extensions:
    - Refined GitHub
    - Dark Reader
    - Reader Mode extensions
    - Anything accessibility or theme-related
  - These can mutate your HTML before React gets to hydrate it, causing hydration errors that seem like the frontend is broken
