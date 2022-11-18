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

In the past, Bonitasoft repositories were using various public actions and the checks done by these actions were not the same. We expect more consistency with this new action.
For more details about the actions previously used and their limitations, see [bonita-documentation-site#422](https://github.com/bonitasoft/bonita-documentation-site/issues/422) and [#82](https://github.com/bonitasoft/actions/issues/82).

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

In the example above, the workflow can also be triggered on the `pull_request_target` event. This allows to create comments when the Pull Request is created from a forked repository.

Using `pull_request_target` is valid here as the workflow doesn't generate anything from the code, it only checks the Pull Request metadata , see
- https://github.blog/2020-08-03-github-actions-improvements-for-fork-and-pull-request-workflows/#improvements-for-public-repository-forks
- https://securitylab.github.com/research/github-actions-preventing-pwn-requests/
