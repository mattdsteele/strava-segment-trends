package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/machinebox/graphql"
	strava "github.com/strava/go.strava"
)

func main() {
	id := os.Getenv("STRAVA_CLIENT_ID")
	client := strava.NewClient(id)
	var gravelRoadSegment int64 = 4035066
	svc, err := strava.NewSegmentsService(client).Get(gravelRoadSegment).Do()
	if err != nil {
		panic(err)
	}
	fmt.Println("got to here")
	fmt.Printf("%s ridden %d times, by %d athletes in %s, created %s", svc.Name, svc.EffortCount, svc.AthleteCount, svc.City, svc.CreatedAt)

	faunaSecret := os.Getenv("FAUNA_SECRET")
	fmt.Println(faunaSecret)
	gc := graphql.NewClient("https://graphql.fauna.com/graphql")
	ctx := context.Background()
	req := graphql.NewRequest(`
query($athlete:Int!) {
  userById(athleteId:$athlete) {
    athleteId
    _id
    expiresAt
    refreshToken
    accessToken
  }
}
	`)
	req.Var("athlete", 1751710)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", faunaSecret))
	type UserByID struct {
		AthleteId    int    `json:athleteId`
		ExpiresAt    string `json:expiresAt`
		RefreshToken string `json:"refreshToken"`
		Access       string `json:"accessToken"`
	}
	type Query struct {
		UserById UserByID `json:userById`
	}
	var resp Query
	err = gc.Run(ctx, req, &resp)
	if err != nil {
		panic(err)
	}
	f, _ := time.Parse(time.RFC3339, resp.UserById.ExpiresAt)
	fmt.Println(f.Year())
	fmt.Println(resp.UserById.ExpiresAt)
}
