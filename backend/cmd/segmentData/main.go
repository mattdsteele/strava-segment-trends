package main

import (
	"context"
	"fmt"
	"os"
	"time"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	stravaAccessToken := os.Getenv("STRAVA_ACCESS_TOKEN")
	stravaRefreshToken := os.Getenv("STRAVA_REFRESH_TOKEN")
	stravaExpiryStr := os.Getenv("STRAVA_EXPIRY")
	stravaExpiry, _ := time.Parse(time.RFC3339, stravaExpiryStr)

	strava := trends.InitWithRefresh(trends.StravaConfig{
		AccessToken:  stravaAccessToken,
		RefreshToken: stravaRefreshToken,
		Expiry:       stravaExpiry,
		ClientId:     os.Getenv("STRAVA_CLIENT_ID"),
		ClientSecret: os.Getenv("STRAVA_CLIENT_SECRET"),
	})
	var db trends.Store
	db = trends.InitFirestore(context.Background())

	t := &trends.Trends{
		Strava: strava,
		Db:     db,
	}
	for {
		t.Populate()
		fmt.Println("sleeping...")
		time.Sleep(30 * time.Minute)
	}
}
