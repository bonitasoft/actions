# `notify-slack` - **Github Action**

This action will send a slack message

## Input

| Name          | Description                                             |
| ------------- |---------------------------------------------------------|
| `CHANNEL_ID` | The slack channel id                                     |
| `MESSAGE`       | The message display in first block of notification    |
| `SLACK_BOT_TOKEN`       | OAuth token of your slack app                 |

## Example Workflow File

```yaml
name: Notify slack

on: [pull_request]

jobs:
    notify-slack:
        runs-on: ubuntu-latest
        steps:
          - name: Send message to Slack channel
            if: ${{ failure() }}
            uses: bonitasoft/actions/packages/notify-slack@main
            with:
              CHANNEL_ID: ${{ secrets.SLACK_UID_CHANNEL_ID }}
              MESSAGE: |
                :x: Build on branch ${{github.ref}} failed
                
                <https://github.com/bonitasoft/actions| Link example>
              SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
```
