package trends

import (
	"fmt"
	"net/url"
)

// MapBoxURL contains tokens that will be replaced before calling the endpoint
// to obtain static map images
const MapBoxURL = "https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/static/%s/auto/800x600?logo=false&setfilter=['==','0','1']&layer_id=road-path-bg&access_token=%s"

// Segment symbology settings
const (
	SegmentColor = "f00"
	SegmentWidth = 3
)

// MapBox is a client that provides mapping functionality...
type MapBox struct {
	URL string
}

// StaticImageFromStyle creates a static PNG or JPEG image...
func (mb MapBox) StaticImageFromStyle(url string) {

}

// PathSymbol defines styles used for representing paths in a map
type PathSymbol struct {
	SegmentColor string
	SegmentWidth float32
}

type pathOverlay struct {
	strokeWidth   float32
	strokeColor   string
	strokeOpacity float32
	polyline      string
}

func (p *pathOverlay) urlParameter() (s string) {
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

// func generateMaps(segmentIDs []int) {
// 	stravaClient := createStravaClient()
// 	overlay := pathOverlay{strokeWidth: segmentWidth, strokeColor: segmentColor}
// 	mapBoxToken := os.Getenv("MAPBOX_ACCESS_TOKEN")

// 	for _, id := range segmentIDs {
// 		overlay.polyline = string(stravaClient.Stats(int64(id)).Map.Polyline)
// 		overlayParam := overlay.urlParameter()

// 		url := fmt.Sprintf(mapBoxURL, overlayParam, mapBoxToken)

// 		fmt.Println(url)

// 		fileName := fmt.Sprintf("map-%d.png", id)
// 		createStaticMap(url, fileName)
// 	}
// }

// func getStravaSegmentIDs() []int {
// 	db := trends.InitDb(os.Getenv("FAUNA_SECRET"))
// 	segmentIds := db.AllSegmentIds()

// 	return segmentIds
// }

// func createStaticMap(url string, fileName string) {
// 	resp, err := http.Get(url)
// 	checkError(err)
// 	defer resp.Body.Close()

// 	file := createFile(&fileName)

// 	_, err = io.Copy(file, resp.Body)
// 	checkError(err)
// 	defer file.Close()
// }

// func createFile(fileName *string) *os.File {
// 	file, err := os.Create(*fileName)

// 	checkError(err)
// 	return file
// }

// func checkError(err error) {
// 	if err != nil {
// 		panic(err)
// 	}
// }
