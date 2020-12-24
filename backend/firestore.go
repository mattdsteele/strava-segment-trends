package trends

import (
	"context"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
)

func createClient(ctx context.Context) *firestore.Client {
	// Sets your Google Cloud Platform project ID.
	projectID := "secret-strava"

	client, err := firestore.NewClient(ctx, projectID)
	if err != nil {
		log.Fatalf("Failed to create client: %v", err)
	}
	// Close client when done with
	// defer client.Close()
	return client
}

func InitFirestore(ctx context.Context) Store {
	f := new(Firestore)
	f.client = createClient(ctx)
	f.ctx = ctx
	return f

}

type Firestore struct {
	client *firestore.Client
	ctx    context.Context
}

func (f *Firestore) AllSegmentIds() (ids []int) {
	docs, err := f.client.Collection("segments").Documents(f.ctx).GetAll()
	if err != nil {
		log.Fatalf("failed to get segments, %v", err)
	}
	for _, i := range docs {
		var s Segment
		i.DataTo(&s)
		fmt.Println(s.SegmentId)
		ids = append(ids, s.SegmentId)
	}
	return ids
}

func (f *Firestore) GetSegment(segmentId int) Segment {
	docs, err := f.client.Collection("segments").Where("segmentId", "==", segmentId).Documents(f.ctx).GetAll()
	if err != nil {
		log.Fatalf("failed to get segments, %v", err)
	}
	if len(docs) == 0 {
		log.Fatalf("No segment with id %d found", segmentId)
	}
	var s Segment
	docs[0].DataTo(&s)
	return s
}
func (f *Firestore) AddCount(segmentId, athleteCount, effortCount int) *Count {
	now := time.Now().UTC().Format(time.RFC3339)
	count := Count{
		Ts:        now,
		Athletes:  athleteCount,
		SegmentId: segmentId,
		Efforts:   effortCount,
	}
	_, _, err := f.client.Collection("counts").Add(f.ctx, count)
	if err != nil {
		log.Fatalf("Failed to create count: %v", err)
	}
	return &count
}
