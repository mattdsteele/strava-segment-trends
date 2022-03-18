package trends

import "time"

type Store interface {
	AllSegmentIds() (ids []int)
	GetSegment(segmentId int) Segment
	AddCount(segmentId, athleteCount, effortCount int) *Count
	CreateSegment(segment Segment)
}

type Count struct {
	Id        string    `json:"_id" firestore:"id,omitempty"`
	Ts        time.Time `json:"ts" firestore:"ts"`
	Efforts   int       `json:"effortCount" firestore:"effortCount"`
	Athletes  int       `json:"athleteCount" firestore:"athleteCount"`
	SegmentId int       `firestore:"segmentId"`
}
type CountWrapper struct {
	Data []Count `json: "data"`
}
type Segment struct {
	Id        string       `json:"_id"`
	SegmentId int          `json:"segmentId"`
	Counts    CountWrapper `json:"counts"`
}
