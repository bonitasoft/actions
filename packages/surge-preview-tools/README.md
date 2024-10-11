# surge-preview-tools action

Companion of the [surge-preview action](https://github.com/afc163/surge-preview).

It helps to detect if the `surge-preview` action can/should be run:
- validate the provided surge token i.e. is related to a valid login 
- detect if the deployment already exists. Avoid teardown error when the deployment does not exist or has not been created by the provided surge account

The action provides outputs that let manage such use cases.

Work with workflow triggered by the following events:
- `pull_request`
- `workflow_run`

## Usage 

See [action.yml](./action.yml) for inputs and outputs.


### `pull_request` event

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
          dist: site
          failOnError: true
          teardown: true
          build: |
            ls -lh site
```

### `workflow_run` event

In the following, the outputs of the `surge-preview-tools` action are used to decide if the `surge-preview` action can run.

**Note**:
- the `surge-preview-tools` action supports `workflow_run` event as of version 3.2.0.
- the `surge-preview` action supports `workflow_run` event as of [version 1.8.0](https://github.com/afc163/surge-preview/commit/4628aab4d29c2679cbce5aff7f45eac8ff219609).

When running the `surge-preview-tools` action in a workflow triggered by `workflow_run` event, the following permissions must be granted to the `GITHUB_TOKEN`:
- metadata: read
- pull-requests: read


```yaml
name: Surge PR Preview - Deploy Stage

on:
  workflow_run:
    workflows: ["Surge PR Preview - Build Stage"] # The name of the workflow that will trigger this workflow
    types:
      - completed

jobs:
  # MUST be unique across all surge preview deployments for a repository as the job id is used in the deployment URL
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.event == 'pull_request' && github.event.workflow_run.conclusion == 'success' }}

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

      - name: Download the site previously built
        uses: dawidd6/action-download-artifact@v3
        with:
          workflow: ${{ github.event.workflow_run.workflow_id }}
          name: pr-build-dist  # must be kept in sync with the artifact name downloaded in the build stage
          path: site/

      - name: Publish Demo preview
        if: steps.surge-preview-tools.outputs.can-run-surge-command == 'true'
        uses: afc163/surge-preview@v1
        with:
          surge_token: ${{ secrets.SURGE_TOKEN }}
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
