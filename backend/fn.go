package trends

import (
	"context"
	"os"
	"time"
)

// Message is the payload of a Pub/Sub event. Please refer to the docs for
// additional information regarding Pub/Sub events.
type Message struct {
	Data []byte `json:"data"`
}

func GetLatestTrends(_ context.Context, _ Message) error {
	stravaExpiryStr := os.Getenv("STRAVA_EXPIRY")
	stravaExpiry, _ := time.Parse(time.RFC3339, stravaExpiryStr)
	s := InitWithRefresh(StravaConfig{
		AccessToken:  os.Getenv("STRAVA_ACCESS_TOKEN"),
		RefreshToken: os.Getenv("STRAVA_REFRESH_TOKEN"),
		Expiry:       stravaExpiry,
		ClientId:     os.Getenv("STRAVA_CLIENT_ID"),
		ClientSecret: os.Getenv("STRAVA_CLIENT_SECRET"),
	})
	db := InitDb(os.Getenv("FAUNA_SECRET"))

	t := &Trends{
		Strava: s,
		Db:     db,
	}
	t.Populate()
	// no error
	return nil
}
