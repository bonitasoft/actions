# PR files contribution guideline checker

This action checks the diff in a PR, and fails if one or more of the set criteria isn't met.

## Using this action

See [action.yml](./action.yml) for the detailed list of inputs and outputs.

### Permissions

Set the `pull-requests` permission to `write` to allow the action to post comments on the PR.
Set the `github-token` if you want use a personnal access token, by default the value is `${{ secrets.GITHUB_TOKEN }}`

```
name: Check PR content

on: [pull_request]

jobs:
  check_contribution:
    runs-on: ubuntu-22.04
    permissions:
      pull-requests: write # post comments when the Pull Request title doesn't match the "Guidelines" rules
    steps:
      - name: Check contribution guidelines
        uses: bonitasoft/actions/packages/pr-files-checker@v1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }} // optional
          attributes-to-check: ':description:'
          files-to-check: 'adoc'
          forbidden-pattern-to-check: 'https://documentation.bonitasoft.com, link:'
```

An example is also provided in [bonita-labs-doc repository](https://github.com/bonitasoft/bonita-labs-doc/blob/master/.github/workflows/check-contribution.yml).


## Development

**Node version**: see the [.nvmrc](.nvmrc) file 

As for all JavaScript actions, the `dist` folder must be committed.

So when changing the JS code or when updating the production dependencies (that are bundled in the final distribution),
please regenerate the content of the `dist` folder.
* Run `npm ci && npm run package:all`
* Commit the dist folder


## License

This is released under the MIT license.
