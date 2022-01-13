# Github PR diff checker

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
        uses: bonitasoft/pr-diff-checker-action@TAG_VERSION
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          diffDoesNotContain: '["http://documentation.mydomain","link:"]'
          extensionsToCheck: '[".adoc"]'
```

An example is also provided in .github/workflows/ in this repository.


## Release a new version

To release a new version:
* upgrade the field `version` in the package.json.
* Run `npm ci && npm run package`
* Commit the dist folder
* From this commit, tag the repository and push commit and tag.
* You can now use this version in your GitHub action.


## License

This is a modification and inspiration from [JJ/github-pr-contains-action](https://github.com/JJ/github-pr-contains-action/) and is released under the MIT license.
