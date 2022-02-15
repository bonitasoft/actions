# Actions

Centralized repository for all of Event Bonita GitHub Actions used in our CI/CD pipelines

## Usage

To use an action from this repository:

```yaml
 [...]
 steps:
   - name: Send message to Slack channel
     uses: bonitasoft/actions/packages/notify-slack@TAGNAME
  [...]
```

### Tags policies

When you update or add an action don't forget to push a tag v1, v2, v3 etc 


## Troubleshooting
Renamed from pr-diff-checker-action
