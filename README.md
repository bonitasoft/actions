# Bonitasoft GitHub Actions

Centralized repository providing GitHub Actions developed by Bonitasoft and used in our CI/CD pipelines.


## List of actions

- [list-branches](packages/list-branches): list and return branches in JSON filtered by input regex.
- [pr-antora-content-guidelines-checker](packages/pr-antora-content-guidelines-checker): to check contributions done to the AsciiDoc content of a repository used to produced documentation generated with Antora. Check the diff of a Pull Request, and fail if one or more of the set criteria isn't met.
- [pr-title-conventional-commits](packages/pr-title-conventional-commits): check that the Pull Request title follows guidelines of [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).
- [surge-preview-tools](packages/surge-preview-tools): companion of the [surge-preview action](https://github.com/afc163/surge-preview).

Do you think something is missing? See the [packages' folder](packages).


## How-to use

Each action describes how to use it by documenting its inputs and outputs.

Here is a general rule:
- Use the hash of a commit or a tag to declare the version of the action you want to use.
- Do not use the `main` branch, which can be unstable.

For example, here is how to use the [surge-preview-tools](packages/surge-preview-tools) with a specific version (replace `TAGNAME` by the actual tag value):
```yaml
 steps:
   - name: Send message to Slack channel
     uses: bonitasoft/actions/packages/surge-preview-tools@TAGNAME
     # the rest of the configuration goes here
```

## Available tags

This repository follow [Semantic Versioning](https://semver.org/) and tags follow the `vX.Y.Z` patterns. In addition, the repository also provides tags for major and minor versions.

For example
- when releasing version `1.1.1`, the following tags are available: `v1.1.1`, `v1.1` and `v1`
- then when releasing version `1.1.2`, a new `v1.1.2` tag is created. The `v1.1` and `v1` tags are updated to reference the tag of the newly released version.

The list of tags is available in the [repository at GitHub](https://github.com/bonitasoft/actions/tags). 


## Release process

Go to [GitHub release](https://github.com/bonitasoft/actions/releases)

Then
- create a new draft release
- for tag, use **v**x.y.z (do not forget the 'v' prefix)
- for name, same value as tag without the 'v'
- use the auto-generated release notes (do some cleanup if necessary). **Don't use** `previous tag: auto`, select the tag of the previous release! `auto` selects the major version tag (v1, v2, ...) that changes each time a new release is published
- add a short description about the release content (highlight some features, warn about breaking changes, ...)
- publish to create the git tag and make the release publicly available. Major (v1, v2) and minor (v1.1, v1.2) tags will be automatically created
