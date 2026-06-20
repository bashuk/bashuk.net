# bashuk.net

Hugo blog for `bashuk.net`, using the Book theme as a Git submodule.

## Local development

```sh
hugo server --buildDrafts
```

The local site is available at the URL printed by Hugo, usually `http://localhost:1313/`.

## Publishing

Pushes to `main` trigger `.github/workflows/hugo.yaml`, which builds the Hugo site and deploys the generated static files to GitHub Pages.

The source repository can be private if the GitHub account has a plan that supports Pages from private repositories. The published website is public.
