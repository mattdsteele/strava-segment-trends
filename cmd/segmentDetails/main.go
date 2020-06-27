package main

import (
	"fmt"
	"os"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	faunaSecret := os.Getenv("FAUNA_SECRET")
	db := trends.InitDb(faunaSecret)
	segmentIds := db.AllSegmentIds()
	fmt.Printf("found %d segments\n", len(segmentIds))
}
