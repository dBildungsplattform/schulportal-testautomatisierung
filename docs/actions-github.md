# Actions

## Structure

The actual workflow is in `run-playwright.yml`. This workflow can be used directly via "Run workflow" in Github's Actions GUI or from other workflows. Additionally we defined the following workflows, which function as triggers for the main workflow:

| file                                  | function                                                           |
| ------------------------------------- | ------------------------------------------------------------------ |
| `run-playwright-pullrequest-main.yml` | runs the workflow on push to any branch with an open PR to main. |
| `run-playwright-push-main.yml`        | runs the workflow after push to main                             |
| `run-playwright-scheduled.yml`        | runs the workflows on a schedule with different browsers           |
