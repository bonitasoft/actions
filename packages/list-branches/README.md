# `list-branches` - **Github Action**

This action will list and return branches in JSON filtered by input regex

## Input

| Name          | Description                                               |
| ------------- |-----------------------------------------------------------|
| `branches_list` | The list branches separate by `,`: master,dev,release-.*, |

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
      runs-on: ubuntu-20.04
      steps:
         - name: List branches on repository            
           uses: bonitasoft/actions/packages/list-branches@main
           with:
            branches_list: 'master,dev,release-.*'
    download-l10n-from-crowdin:
      runs-on: ubuntu-20.04
      needs: list-branches
      strategy:
        max-parallel: 1
        fail-fast: false
        matrix:
          branch: ${{ fromJSON(needs.list-branches.outputs.branches) }}
      steps:
        - name: Checkout Repo
          uses: actions/checkout@v2
          with:
            ref: ${{ matrix.branch }}
            path: ./repo
            fetch-depth: '1'
```
