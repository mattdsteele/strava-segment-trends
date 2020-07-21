package main

import (
	"os"

	trends "github.com/mattdsteele/strava-segment-trends"
)

func main() {
	faunaSecret := os.Getenv("FAUNA_SECRET")
	db := trends.InitDb(faunaSecret)
	db.GetQueries()
}
