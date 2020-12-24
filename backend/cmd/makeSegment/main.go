package main

import (
	"context"
	"fmt"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	db := trends.InitFirestore(context.Background())
	segments := []int{8417986, 799024, 9729664, 18804054, 2843721}
	for _, segment := range segments {
		s := trends.Segment{
			SegmentId: segment,
		}
		db.CreateSegment(s)
		fmt.Printf("created segment %d\n", s.SegmentId)
	}
}
