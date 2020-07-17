package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"

	trends "github.com/mattdsteele/strava-segment-trends"
	strava "github.com/strava/go.strava"
)

type mapRequestData = struct {
	url      string
	token    string
	polyline strava.Polyline
}

func main() {
	stravaClient := createStravaClient()
	segmentIDs := getStravaSegmentIDs()

	mapData := mapRequestData{
		url:   "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/path(%s)/auto/300x200?logo=false&access_token=%s",
		token: os.Getenv("MAPBOX_ACCESS_TOKEN"),
	}

	for _, id := range segmentIDs {
		mapData.polyline = stravaClient.Stats(int64(id)).Map.Polyline
		createStaticMap(id, mapData)
	}
}

func createStravaClient() *trends.Strava {
	stravaExpiryStr := os.Getenv("STRAVA_EXPIRY")
	stravaExpiry, _ := time.Parse(time.RFC3339, stravaExpiryStr)

	strava := trends.InitWithRefresh(trends.StravaConfig{
		AccessToken:  os.Getenv("STRAVA_ACCESS_TOKEN"),
		RefreshToken: os.Getenv("STRAVA_REFRESH_TOKEN"),
		Expiry:       stravaExpiry,
		ClientId:     os.Getenv("STRAVA_CLIENT_ID"),
		ClientSecret: os.Getenv("STRAVA_CLIENT_SECRET"),
	})

	return strava
}

func getStravaSegmentIDs() []int {
	db := trends.InitDb(os.Getenv("FAUNA_SECRET"))
	segmentIds := db.AllSegmentIds()

	return segmentIds
}

func createStaticMap(segmentID int, data mapRequestData) {
	urlEncodedLine := url.QueryEscape(string(data.polyline))
	url := fmt.Sprintf(data.url, urlEncodedLine, data.token)

	fmt.Println(url)

	resp, err := http.Get(url)
	checkError(err)
	defer resp.Body.Close()

	fileName := fmt.Sprintf("map-%d.png", segmentID)
	file := createFile(&fileName)

	_, err = io.Copy(file, resp.Body)
	checkError(err)
	defer file.Close()
}

func createFile(fileName *string) *os.File {
	file, err := os.Create(*fileName)

	checkError(err)
	return file
}

func checkError(err error) {
	if err != nil {
		panic(err)
	}
}
