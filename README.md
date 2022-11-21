# Bonitasoft GitHub Actions

Centralized repository providing GitHub Actions developed by Bonitasoft and used in our CI/CD pipelines.

## Usage

To use an action from this repository:

```yaml
 steps:
   - name: Send message to Slack channel
     uses: bonitasoft/actions/packages/notify-slack@TAGNAME
```

See the [actions list](packages) for more details

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
