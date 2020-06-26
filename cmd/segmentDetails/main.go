package main

import (
	"fmt"
	"os"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	faunaSecret := os.Getenv("FAUNA_SECRET")
	db := trends.InitDb(faunaSecret)
	segmentId := 10815130
	segment := db.GetSegment(segmentId)
	fmt.Println(segment.Id)

	count := db.AddCount(segmentId, 22, 33)
	fmt.Println(count)
}
