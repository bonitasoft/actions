# `list-branches` - **Github Action**

This action will list and return branches in JSON filtered by input regex

## Input

| Name          | Description                                                 |
| ------------- |-------------------------------------------------------------|
| `branches_list` | The list branches separate by space: master dev release-.* |

## Output


| Name          | Description                      |
| ------------- |----------------------------------|
| `branches` | Json object who contains each branch|

To use it before another workflow use:

```
 fromJSON(xxxx.outputs.branches)
```


## Example Workflow File

```yaml
name: List branches and run matrix job

on: 
  workflow-dispatch:    

jobs:
  list-branches:
      runs-on: ubuntu-22.04
      outputs:
        branches: ${{ steps.listBranches.outputs.branches }}
      steps:
        - name: Checkout source
          uses: actions/checkout@v3
        - name: List branches on repository
          id: listBranches
          uses: bonitasoft/actions/packages/list-branches@v1
          with:
            branches_list: "dev master release-7.14.*"

  download-l10n-from-crowdin:
      runs-on: ubuntu-22.04
      needs: list-branches
      strategy:
        max-parallel: 1
        fail-fast: false
        matrix:
          branch: ${{ fromJSON(needs.listBranches.outputs.branches) }}
      steps:
        - name: Checkout Repo
          uses: actions/checkout@v3
          with:
            ref: ${{ matrix.branch }}
            path: ./repo
            fetch-depth: '1'
```
