package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	addSegmentCmd := flag.NewFlagSet("add", flag.ExitOnError)
	pSegmentToAdd := addSegmentCmd.Int64("segmentId", 0, "Strava segment identifier")
	pTrailName := addSegmentCmd.String("trailName", "", "Trail the segment is part of")
	pWeatherStation := addSegmentCmd.String("weatherStation", "", "Weather station identifier")

	delSegmentCmd := flag.NewFlagSet("del", flag.ExitOnError)
	pSegmentToDel := delSegmentCmd.Int64("segmentId", 0, "Strava segment identifier")

	if len(os.Args) < 2 {
		fmt.Println("expected 'add' or 'remove' subcommands")
		os.Exit(1)
	}

	switch os.Args[1] {

	case "add":
		addSegmentCmd.Parse(os.Args[2:])
		addSegment(*pSegmentToAdd, *pTrailName, *pWeatherStation)
	case "del":
		delSegmentCmd.Parse(os.Args[2:])
		deleteSegment(*pSegmentToDel)
	default:
		fmt.Println("expected 'add' or 'remove' subcommands")
		os.Exit(1)
	}
}

func addSegment(segmentID int64, trailName string, weatherStationID string) {
	fmt.Printf("SegmentID %d successfully added", segmentID)
}

func deleteSegment(segmentID int64) {
	fmt.Printf("SegmentID %d successfully deleted", segmentID)
}

// func createStravaClient() *Strava {
// 	stravaExpiryStr := os.Getenv("STRAVA_EXPIRY")
// 	stravaExpiry, _ := time.Parse(time.RFC3339, stravaExpiryStr)

// 	strava := InitWithRefresh(StravaConfig{
// 		AccessToken:  os.Getenv("STRAVA_ACCESS_TOKEN"),
// 		RefreshToken: os.Getenv("STRAVA_REFRESH_TOKEN"),
// 		Expiry:       stravaExpiry,
// 		ClientId:     os.Getenv("STRAVA_CLIENT_ID"),
// 		ClientSecret: os.Getenv("STRAVA_CLIENT_SECRET"),
// 	})

// 	return strava
// }
