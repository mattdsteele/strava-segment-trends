package main

import (
	"fmt"
	"os"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	faunaSecret := os.Getenv("FAUNA_SECRET")
	db := trends.InitDb(faunaSecret)
	segments := []int{4481947, 18808579, 1692340, 5904281, 5904382}
	for _, segment := range segments {
		s := db.CreateSegment(segment)
		fmt.Printf("created segment %d\n", s.CreateSegment.SegmentId)
	}
}
