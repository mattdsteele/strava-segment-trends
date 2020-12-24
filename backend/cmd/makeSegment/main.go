package main

import (
	"fmt"
	"os"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	faunaSecret := os.Getenv("FAUNA_SECRET")
	db := trends.InitDb(faunaSecret)
	segments := []int{8417986, 799024, 9729664, 18804054, 2843721}
	for _, segment := range segments {
		s := trends.Segment{
			SegmentId: segment,
		}
		db.CreateSegment(s)
		fmt.Printf("created segment %d\n", s.SegmentId)
	}
}
