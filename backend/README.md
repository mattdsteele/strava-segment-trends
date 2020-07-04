# Backend

Populate the FaunaDB with up-to-date Strava usage for each segment

Executed once per hour using a GCP Cloud Scheduler event

Actual GCP function executed is `GetLatestTrends` in `fn.go`
