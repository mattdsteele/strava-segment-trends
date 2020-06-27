package trends

import (
	"context"
	"fmt"
	"time"

	strava "github.com/strava/go.strava"
	"golang.org/x/oauth2"
)

type Strava struct {
	client *strava.Client
	token  *oauth2.Token
	cfg    *oauth2.Config
}

type StravaConfig struct {
	AccessToken  string
	RefreshToken string
	Expiry       time.Time
	ClientId     string
	ClientSecret string
}

func InitWithRefresh(config StravaConfig) *Strava {
	authorizeUrl := "https://www.strava.com/oauth/token"
	cfg := oauth2.Config{
		ClientID:     config.ClientId,
		ClientSecret: config.ClientSecret,
		Endpoint: oauth2.Endpoint{
			TokenURL: authorizeUrl,
		},
	}
	tkn := oauth2.Token{
		AccessToken:  config.AccessToken,
		RefreshToken: config.RefreshToken,
		Expiry:       config.Expiry,
	}
	tokenSrc := cfg.TokenSource(context.Background(), &tkn)
	client := oauth2.NewClient(context.Background(), tokenSrc)
	c := strava.NewClient(config.AccessToken, client)

	s := new(Strava)
	s.client = c
	s.cfg = &cfg
	s.token = &tkn

	return s
}

func (s *Strava) RenewToken() *oauth2.Token {
	if s.token.Expiry.After(time.Now()) {
		fmt.Printf("token not invalid yet: %s\n", s.token.Expiry.Format(time.RFC3339))
	}
	src := s.cfg.TokenSource(context.Background(), s.token)
	newToken, err := src.Token()
	if err != nil {
		panic(err)
	}
	if newToken.AccessToken != s.token.AccessToken {
		s.token = newToken
		return newToken
	}
	return nil
}

func (s Strava) Stats(segmentId int64) *strava.SegmentDetailed {
	segmentStats, err := strava.NewSegmentsService(s.client).Get(segmentId).Do()
	if err != nil {
		panic(err)
	}
	return segmentStats
}
