package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"

	trends "github.com/mattdsteele/strava-segment-trends"
)

const (
	mapBoxURL = "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/%s/auto/300x200?logo=false&access_token=%s"
)

// need overlay interface for types path, geojson, marker, style, etc
// single function for formatting url
// pass array of overlays to createStaticMap and have it call func on each

type pathOverlay struct {
	strokeWidth   float32
	strokeColor   string
	strokeOpacity float32
	polyline      string
}

// path-{strokeWidth}+{strokeColor}-{strokeOpacity}+{fillColor}-{fillOpacity}({polyline})
func (p *pathOverlay) Format() (s string) {
	s = "path"

	if p.strokeWidth != 0.0 {
		s += fmt.Sprintf("-%.1f", p.strokeWidth)
	}
	if p.strokeColor != "" {
		s += fmt.Sprintf("+%s", p.strokeColor)
	}
	if p.strokeOpacity != 0.0 {
		s += fmt.Sprintf("-%.1f", p.strokeOpacity)
	}
	if p.polyline != "" {
		encoded := url.QueryEscape(string(p.polyline))
		s += fmt.Sprintf("(%s)", encoded)
	}
	return
}

func main() {
	segmentIDs := []int{1692340}
	//segmentIDs := getStravaSegmentIDs()
	generateMaps(segmentIDs)
}

func generateMaps(segmentIDs []int) {
	stravaClient := createStravaClient()
	overlay := pathOverlay{strokeWidth: 2, strokeColor: "f00"}

	for _, id := range segmentIDs {
		overlay.polyline = string(stravaClient.Stats(int64(id)).Map.Polyline)
		path := overlay.Format()
		url := fmt.Sprintf(mapBoxURL, path, os.Getenv("MAPBOX_ACCESS_TOKEN"))
		fmt.Println(url)
		fileName := fmt.Sprintf("map-%d.png", id)
		createStaticMap(url, fileName)
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

func createStaticMap(url string, fileName string) {
	resp, err := http.Get(url)
	checkError(err)
	defer resp.Body.Close()

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
