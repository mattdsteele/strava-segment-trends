package main

import (
	"fmt"
	"os"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	faunaSecret := os.Getenv("FAUNA_SECRET")
	db := trends.InitDb(faunaSecret)
	segment := db.CreateSegment(10815130)
	fmt.Println(segment.CreateSegment.Id)
}
