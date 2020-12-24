package trends

type Store interface {
	AllSegmentIds() (ids []int)
	GetSegment(segmentId int) Segment
	AddCount(segmentId, athleteCount, effortCount int) *Count
	CreateSegment(segment Segment)
}
