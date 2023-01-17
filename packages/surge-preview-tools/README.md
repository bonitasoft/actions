# surge-preview-tools action

Companion of the [surge-preview action](https://github.com/afc163/surge-preview).

It helps to detect if the `surge-preview` action can/should be run:
- validate the provided surge token i.e. is related to a valid login 
- detect if the deployment already exists. Avoid teardown error when the deployment doesn't exist or has not been created by the provided surge account

The action provides outputs that let manage such use cases.

Limitations
- for Pull Request only

## Usage 

See [action.yml](./action.yml) for inputs and outputs.

In the following, the outputs of the `surge-preview-tools` action are used to decide if the `surge-preview` action can run.

```yaml
name: Surge Preview for Pull Request

on:
  pull_request:
    # To manage 'surge-preview' action teardown, add default event types + closed event type
    types: [opened, synchronize, reopened, closed]
    branches:
      - master

jobs:
  publish_demo:
    runs-on: ubuntu-latest
    permissions:
      # This permission is only required by surge-preview when it is configured to create Pull Request comment
      pull-requests: write
    steps:
      - uses: bonitasoft/actions/packages/surge-preview-tools@TAGNAME
        id: surge-preview-tools
        with:
          surge-token: ${{ secrets.SURGE_TOKEN }}
      - name: Echo surge preview tools output
        run: |
          echo "can-run-surge-command: ${{ steps.surge-preview-tools.outputs.can-run-surge-command }}"
          echo "domain-exist: ${{ steps.surge-preview-tools.outputs.domain-exist }}" 
          echo "preview-url: ${{ steps.surge-preview-tools.outputs.preview-url }}" 
          echo "surge-token-valid: ${{ steps.surge-preview-tools.outputs.surge-token-valid }}"
      - name: Build fake demo
        if: ${{ github.event.action != 'closed' }}
        env:
          PR_NUMBER: ${{ github.event.pull_request.number }}
        run: |
          mkdir site
          echo "This is a preview site for <b>PR #${PR_NUMBER}</b>" > site/index.html
      - name: Publish Demo preview
        if: steps.surge-preview-tools.outputs.can-run-surge-command == 'true'
        uses: afc163/surge-preview@v1
        with:
          surge_token: ${{ secrets.SURGE_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          dist: site
          failOnError: true
          teardown: true
          build: |
            ls -lh site
```


## Build

**Node version**: see the [.nvmrc](.nvmrc) file

`npm run all`

When committing, do not forget to also commit the `dist` folder.


### Running tests

If you want to run test in your IDE without calling the npm test script (to run a specific test for instance), add the
`--experimental-vm-modules` option to the node command running Jest.

For more details, see https://jestjs.io/docs/ecmascript-modules.



## Resources

- https://github.com/afc163/surge-preview
- https://github.com/adrianjost/actions-surge.sh-teardown: for surge cli output parsing
- https://github.com/actions/javascript-action
