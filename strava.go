package trends

import (
	"context"
	"fmt"
	"os"
	"time"

	strava "github.com/strava/go.strava"
	"golang.org/x/oauth2"
)

type Strava struct {
	client *strava.Client
	token  *oauth2.Token
	cfg    *oauth2.Config
}

func InitStrava(token string) *Strava {
	s := new(Strava)
	c := strava.NewClient(token)
	s.client = c
	return s
}

func InitWithRefresh(accessToken, refreshToken string, expiry time.Time) *Strava {
	authorizeUrl := "https://www.strava.com/oauth/token"
	cfg := oauth2.Config{
		ClientID:     os.Getenv("STRAVA_CLIENT_ID"),
		ClientSecret: os.Getenv("STRAVA_CLIENT_SECRET"),
		Endpoint: oauth2.Endpoint{
			TokenURL: authorizeUrl,
		},
	}
	tkn := oauth2.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Expiry:       expiry,
	}
	tokenSrc := cfg.TokenSource(context.Background(), &tkn)
	client := oauth2.NewClient(context.Background(), tokenSrc)
	c := strava.NewClient(accessToken, client)

	s := new(Strava)
	s.client = c
	s.cfg = &cfg
	s.token = &tkn

	return s
}

func (s Strava) RenewToken() *oauth2.Token {
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
