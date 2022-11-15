# pr-title-conventional-commits action

Check that the Pull Request title follows guidelines of [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

This action also has the ability to post a comment in the Pull Request conversation with examples, when the PR title is wrong.

![image](https://user-images.githubusercontent.com/12074633/108867820-91325700-75c3-11eb-8820-4b55abe01c35.png)

**Why do I need this action?**

At Bonitasoft, we mainly use "squash and merge" for Pull Requests, and we often use the PR title as base of the merge commit (this can be suggested by GitHub by repository configuration).

We want the commits to conform to `Conventional Commits`, so checking the PR title will be helpful.


**Why developing a new action?**

Having a dedicated action also helps us to change the implementation transparently for the repositories that consumes it, without having
to change every repository configuration if a better action emerges.

This action uses [conventional-commits-pr-action](https://github.com/jef/conventional-commits-pr-action) under the hood. It set other defaults and
provide more features.

## Usage

See [action.yml](./action.yml) for inputs and outputs.


### Permissions

When setting the `comment` input to `true` or `auto` (default), set the `pull-requests` permission to `write`.

### Example

```yaml
on:
  pull_request:
    # trigger when the PR title changes
    types: [opened, edited, reopened]
jobs:
  pr-title:
    runs-on: ubuntu-22.04
    permissions:
      pull-requests: write # post comments when the PR title doesn't match the "Conventional Commits" rules
    steps:
      - name: Check Pull Request title
        uses: bonitasoft/actions/packages/pr-title-conventional-commits@TAGNAME
```
