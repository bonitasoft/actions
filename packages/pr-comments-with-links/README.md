# PR Comments With Links

This action checks the diff in a PR, and fails if one or more of the set criteria isn't met.
If action failed, a comment with details will be written in the Pull Request

## Using this action

See [action.yml](./action.yml) for the detailed list of inputs and outputs.

### Permissions

Set the `pull-requests` permission to `write` to allow the action to post comments on the PR.
Set the `github-token` if you want to use a personal access token, by default the value is `${{ secrets.GITHUB_TOKEN }}`

```
name: Comment PR with links

on: [pull_request]

jobs:
  check_contribution:
    runs-on: ubuntu-22.04
    permissions:
      pull-requests: write # post comments with link of the updated files
    steps:
      - name: Comment PR with links
        uses: bonitasoft/actions/packages/pr-comments-with-links@v1.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }} // optional          
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
