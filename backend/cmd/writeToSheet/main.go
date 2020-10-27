package main

import (
	"context"
	"fmt"
	"os"

	trends "github.com/mattdsteele/strava-segment-trends"
	"google.golang.org/api/sheets/v4"
)

func main() {
	ctx := context.Background()
	sheetsService, err := sheets.NewService(ctx)
	if err != nil {
		panic(err)
	}
	sheetID := os.Getenv("GSHEET_ID")
	_, err = sheetsService.Spreadsheets.Values.Get(sheetID, "A1:A1").Do()
	if err != nil {
		panic(err)
	}

	s := trends.InitSheets(sheetID)
	fmt.Println(s.SheetTitles())

	s.AddCount(10815130, 123, 234)
	s.AddCount(10815130, 432, 232)
}
