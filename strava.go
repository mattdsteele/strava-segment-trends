package trends

import (
	strava "github.com/strava/go.strava"
)

type Strava struct {
	client *strava.Client
}

func InitStrava(token string) *Strava {
	s := new(Strava)
	c := strava.NewClient(token)
	s.client = c
	return s
}

func (s Strava) Stats(segmentId int64) *strava.SegmentDetailed {
	segmentStats, err := strava.NewSegmentsService(s.client).Get(segmentId).Do()
	if err != nil {
		panic(err)
	}
	return segmentStats
}
