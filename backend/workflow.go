package trends

import (
	"fmt"
	"time"
)

type Trends struct {
	Strava *Strava
	Db     *Db
}

func (t *Trends) Populate() {
	segmentIds := t.Db.AllSegmentIds()
	// first, verify token is not expired
	newToken := t.Strava.RenewToken()
	if newToken != nil {
		fmt.Println("got new access token!")
		fmt.Printf("access:  %s\n", newToken.AccessToken)
		fmt.Printf("refresh: %s\n", newToken.RefreshToken)
		fmt.Printf("expiry:  %s\n", newToken.Expiry.UTC().Format(time.RFC3339))
	}

	for _, segmentID := range segmentIds {
		stats := t.Strava.Stats(int64(segmentID))
		count := t.Db.AddCount(segmentID, stats.AthleteCount, stats.EffortCount)
		fmt.Println(count)
	}
}
