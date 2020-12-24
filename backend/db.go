package trends

import (
	"context"
	"fmt"
	"time"

	"github.com/machinebox/graphql"
)

type Db struct {
	client *graphql.Client
	secret string
	ctx    *context.Context
}

type Store interface {
	AllSegmentIds() (ids []int)
	GetSegment(segmentId int) Segment
	AddCount(segmentId, athleteCount, effortCount int) *Count
}

func InitDb(faunaSecret string) Store {
	db := new(Db)
	db.make(faunaSecret)
	return db
}

func (db *Db) make(faunaSecret string) {
	gc := graphql.NewClient("https://graphql.fauna.com/graphql")
	ctx := context.Background()
	db.client = gc
	db.ctx = &ctx
	db.secret = faunaSecret
}

var mutationReq = `
mutation($segmentId:Int!) {
  createSegment(data: {
		segmentId: $segmentId
	}) {
		_id
		segmentId
		counts {
			data {
				ts
				effortCount
				athleteCount
			}
		}
  }
}
`

type Count struct {
	Id        string `json:"_id" firestore:"id,omitempty"`
	Ts        string `json:"ts" firestore:"ts"`
	Efforts   int    `json:"effortCount" firestore:"effortCount"`
	Athletes  int    `json:"athleteCount" firestore:"athleteCount"`
	SegmentId int    `firestore:"segmentId"`
}
type CountWrapper struct {
	Data []Count `json: "data"`
}
type Segment struct {
	Id        string       `json:"_id"`
	SegmentId int          `json:"segmentId"`
	Counts    CountWrapper `json:"counts"`
}
type CreateSegmentMutation struct {
	CreateSegment Segment `json:"createSegment"`
}

func (d Db) CreateSegment(segmentId int) CreateSegmentMutation {
	req := graphql.NewRequest(mutationReq)
	req.Var("segmentId", segmentId)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", d.secret))
	var res CreateSegmentMutation
	ctx := d.ctx
	err := d.client.Run(*ctx, req, &res)
	if err != nil {
		panic(err)
	}
	fmt.Println(res)
	return res
}

func (d Db) AllSegmentIds() (ids []int) {
	req := graphql.NewRequest(`
	query {
		allSegments {
			data {
				segmentId
			}
		}
	}
	`)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", d.secret))
	type AllSegments struct {
		Segments []Segment `json:"data"`
	}
	type Wrapper struct {
		AllSegments AllSegments `json:"allSegments"`
	}
	var resp Wrapper
	err := d.client.Run(*d.ctx, req, &resp)
	if err != nil {
		panic(err)
	}
	for _, s := range resp.AllSegments.Segments {
		ids = append(ids, s.SegmentId)
	}
	return ids
}

func (d Db) GetSegment(segmentId int) Segment {
	req := graphql.NewRequest(`
	query($segmentId:Int!) {
		segmentById(segmentId:$segmentId) {
			_id
			segmentId
			counts(_size: 1000) {
				data {
					_id
					ts
					effortCount
					athleteCount
				}
			}
		}
	}
	`)
	req.Var("segmentId", segmentId)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", d.secret))
	type SegmentWrapper struct {
		Wrapper Segment `json:"segmentById"`
	}
	var resp SegmentWrapper
	err := d.client.Run(*d.ctx, req, &resp)
	if err != nil {
		panic(err)
	}
	return resp.Wrapper
}

func (d Db) AddCount(segmentId, athleteCount, effortCount int) *Count {
	segment := d.GetSegment(segmentId)
	if len(segment.Counts.Data) > 0 {
		recentCount := segment.Counts.Data[len(segment.Counts.Data)-1]
		if recentCount.Efforts == effortCount {
			fmt.Printf("Segment has same count as last check: %d", effortCount)
			return nil
		}
	}
	return d.updateCount(segment, athleteCount, effortCount)
}

func (d Db) updateCount(segment Segment, athleteCount, effortCount int) *Count {
	req := graphql.NewRequest(`
	mutation($segmentRef:ID!, $effortCount:Int!, $athleteCount:Int!, $ts: Time!) {
		createCount(data: {segment: {connect: $segmentRef}, effortCount: $effortCount, athleteCount: $athleteCount, ts: $ts}) {
			_id
			ts
			effortCount
			athleteCount
		}
	}
`)
	req.Var("segmentRef", segment.Id)
	req.Var("effortCount", effortCount)
	req.Var("athleteCount", athleteCount)
	req.Var("ts", time.Now().UTC().Format(time.RFC3339))
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", d.secret))
	type CreateCountWrapper struct {
		Wrapper Count `json:"createCount"`
	}
	var res CreateCountWrapper
	err := d.client.Run(*d.ctx, req, &res)
	if err != nil {
		panic(err)
	}
	return &res.Wrapper
}
