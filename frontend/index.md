# Hello world

{% for data in segments %}

## {{data.name}} [({{data.segmentId}})](https://www.strava.com/segments/{{data.segmentId}})

<ul>
{% for count in data.counts.data %}
<li> {{count.ts}} - {{count.effortCount}} ({{count.athleteCount}})</li>
  {% endfor %}
</ul>

{% endfor %}
