# Bonitasoft GitHub Actions

Centralized repository providing GitHub Actions developed by Bonitasoft and used in our CI/CD pipelines.

## Usage

To use an action from this repository:

```yaml
 [...]
 steps:
   - name: Send message to Slack channel
     uses: bonitasoft/actions/packages/notify-slack@TAGNAME
  [...]
```

See the [actions list](packages) for more details

## Available tags

**_TODO_**

## Release process

Go to [GitHub release](https://github.com/bonitasoft/actions/releases)

Then
- create a new draft release
- for tag, use **v**x.y.z (do not forget the 'v' prefix)
- for name, same value as tag without the 'v'
- use the auto-generated release notes (do some cleanup if necessary)
- publish to create the git tag and make the release publicly available. Major (v1, v2) and minor (v1.1, v1.2) tags will be automatically created
