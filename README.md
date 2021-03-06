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

### Release process

Go to [GitHub release](https://github.com/bonitasoft/actions/releases)

Then
- create a new draft release
- for tag, use **v**x.y.z (do not forget the trailing 'v')
- for name, same value as tag without the 'v'
- use the auto-generated release notes (do some cleanup if necessary)
- publish to create the git tag and make the release publicly available

<!--
When you update or add an action don't forget to push a tag v1, v2, v3 etc 
-->

## Troubleshooting
Renamed from pr-diff-checker-action
