package trends

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"google.golang.org/api/sheets/v4"
)

type Sheets struct {
	sheetsService *sheets.Service
	sheetID       string
}

func InitSheets(sheetID string) *Sheets {
	s := new(Sheets)
	s.sheetID = sheetID
	sheetsService, err := sheets.NewService(context.Background())
	s.sheetsService = sheetsService
	if err != nil {
		panic(err)
	}
	return s
}

func (s *Sheets) SheetTitles() (titles []string) {
	sheetMeta, err := s.sheetsService.Spreadsheets.Get(s.sheetID).Do()
	if err != nil {
		panic(err)
	}
	for _, s := range sheetMeta.Sheets {
		titles = append(titles, s.Properties.Title)
	}
	return titles
}

func (s *Sheets) sheetTitleById(segmentID int) (string, error) {
	for _, t := range s.SheetTitles() {
		if strings.Contains(t, strconv.Itoa(segmentID)) {
			return t, nil
		}
	}
	return "", errors.New("Unable to find sheet")
}

func (s *Sheets) AddCount(segmentId, athleteCount, effortCount int) {
	t, err := s.sheetTitleById(segmentId)
	if err != nil {
		panic(err)
	}
	fmt.Println("found title", t)

	var vr sheets.ValueRange
	vr.Values = append(vr.Values, []interface{}{"Date", athleteCount, effortCount})
	_, err = s.sheetsService.Spreadsheets.Values.Append(s.sheetID, fmt.Sprintf("%s!A1:A1", t), &vr).ValueInputOption("USER_ENTERED").Do()
}
