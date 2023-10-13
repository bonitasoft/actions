# GitHub PR diff checker

This action checks the diff in a PR, and fails if one or more of the set criteria isn't met.

# Using this action

You need to add this in a file in `.github/workflows` and set appropriate options.

```
name: Check PR content

on: [pull_request]

jobs:
  check_contribution:
    runs-on: ubuntu-22.04
    permissions:
      pull-requests: write
    steps:
      - name: Check contribution guidelines
        uses: bonitasoft/actions/packages/pr-files-checker@v1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          attributes-to-check: ':description:'          
          files-to-check: 'adoc'
          forbidden-pattern-to-check: 'https://documentation.bonitasoft.com, link:'
```

An example is also provided in .github/workflows/ in this repository.


## Development

**Node version**: see the [.nvmrc](.nvmrc) file 

As for all JavaScript actions, the `dist` folder must be committed.

So when changing the JS code or when updating the production dependencies (that are bundled in the final distribution),
please regenerate the content of the `dist` folder.
* Run `npm ci && npm run package:all`
* Commit the dist folder


## License

This is released under the MIT license.
