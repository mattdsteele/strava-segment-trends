package main

import (
	"fmt"
	"os"
	"time"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	faunaSecret := os.Getenv("FAUNA_SECRET")
	stravaAccessToken := os.Getenv("STRAVA_ACCESS_TOKEN")
	stravaRefreshToken := os.Getenv("STRAVA_REFRESH_TOKEN")
	stravaExpiryStr := os.Getenv("STRAVA_EXPIRY")
	stravaExpiry, _ := time.Parse(time.RFC3339, stravaExpiryStr)

	strava := trends.InitWithRefresh(stravaAccessToken, stravaRefreshToken, stravaExpiry)
	db := trends.InitDb(faunaSecret)
	segmentIds := db.AllSegmentIds()
	for {
		// first, verify token is not expired
		newToken := strava.RenewToken()
		if newToken != nil {
			fmt.Println("got new access token!")
			fmt.Printf("access:  %s\n", newToken.AccessToken)
			fmt.Printf("refresh: %s\n", newToken.RefreshToken)
			fmt.Printf("expiry:  %s\n", newToken.Expiry.UTC().Format(time.RFC3339))
		}

		for _, segmentID := range segmentIds {
			stats := strava.Stats(int64(segmentID))
			count := db.AddCount(segmentID, stats.AthleteCount, stats.EffortCount)
			fmt.Println(count)
		}
		fmt.Println("sleeping...")
		time.Sleep(1 * time.Hour)
	}
}
