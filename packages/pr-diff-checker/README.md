# GitHub PR diff checker

This action checks the diff in a PR, and fails if one or more of the set criteria isn't met.

# Using this action

You need to add this in a file in `.github/workflows` and set appropriate options.

```
name: Check PR content

on: [pull_request]

jobs:
  check_pr:
    runs-on: ubuntu-latest
    name: Check for forbidden string
    steps:
      - name: Scan forbidden string
        uses: bonitasoft/actions/packages/pr-diff-checker@TAG_VERSION
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          diffDoesNotContain: '["http://documentation.mydomain","link:"]'
          extensionsToCheck: '[".adoc"]'
```

An example is also provided in .github/workflows/ in this repository.


## Development

**Node version**: see the [.nvmrc](.nvmrc) file 

As for all JavaScript actions, the `dist` folder must be committed.

So when changing the JS code or when updating the production dependencies (that are bundled in the final distribution),
please regenerate the content of the `dist` folder.
* Run `npm ci && npm run package`
* Commit the dist folder


## License

This is a modification and inspiration from [JJ/github-pr-contains-action](https://github.com/JJ/github-pr-contains-action/) and is released under the MIT license.
