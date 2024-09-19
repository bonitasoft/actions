# PR Comments With Links

This action publish a comment on the pull request with the link to the added/updated/removed page to the preview.

## Which files are checked

The action will check all `.adoc` files includes in a subfolder `pages` of the `modules` folder.

## Using this action

See [action.yml](./action.yml) for the detailed list of inputs and outputs.

### Permissions

Set the `pull-requests` permission to `write` to allow the action to post comments on the PR.
Set the `github-token` if you want to use a personal access token, by default the value is `${{ secrets.GITHUB_TOKEN }}`

```
name: Comment PR with links

on: [pull_request]

jobs:
  comment_pr_with_links:
    runs-on: ubuntu-22.04
    permissions:
      pull-requests: write
    steps:      
        - name: Comments PR with links
           uses: bonitasoft/actions/packages/doc-contribs/pr-comments-with-links@vX
           with:
                site-url: https://example.com
                component-name: bonita
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
