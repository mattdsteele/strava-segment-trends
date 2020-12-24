package main

import (
	"context"
	"fmt"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	ctx := context.Background()
	db := trends.InitFirestore(ctx)
	segmentIds := db.AllSegmentIds()
	fmt.Printf("found %d segments\n", len(segmentIds))
	db.AddCount(1692340, 999, 1000)
	fmt.Println("wrote teh count")
}
