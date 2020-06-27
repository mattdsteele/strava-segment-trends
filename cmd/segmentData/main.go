package main

import (
	"fmt"
	"os"
	"time"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	faunaSecret := os.Getenv("FAUNA_SECRET")
	stravaToken := os.Getenv("STRAVA_CLIENT_ID")
	strava := trends.InitStrava(stravaToken)
	segmentID := 10815130
	for {
		stats := strava.Stats(int64(segmentID))
		db := trends.InitDb(faunaSecret)
		count := db.AddCount(segmentID, stats.AthleteCount, stats.EffortCount)
		fmt.Println(count)
		fmt.Println("sleeping...")
		time.Sleep(1 * time.Hour)
	}
}
