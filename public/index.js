function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  }
  xmlHttp.open("GET", theUrl, true); // true for asynchronous 
  xmlHttp.send(null);
}
let title = "";
let problems = [];
httpGetAsync("./api/config", (data) => {
  const parsed = JSON.parse(data)
  title = parsed.title
  problems = parsed.problems
  $("#title").text(title);
})

function getTimes() {
  console.log(problems)

  console.log(problems.map(x => x.name))

  if (!(problems?.length)) {
    setTimeout(() => getTimes(), 1000)
  }

  $("#score-container").empty();
  $("#score-container").append(`
    <tr>
      <th>Naam</th>
      ${problems.reduce((header, problem) => header += `<th>${problem.name}</th>`, "")}
      <th>Score</th>
    </tr>
  `)
  $("#score-container").append(`
    <tr>
        
    </tr>
  `)
  httpGetAsync("./api/team_times", (res) => {
    const scores = JSON.parse(res)
    const tc = $("#score-container")
    const team_ids = Object.keys(scores);

    // Initialize team points
    let team_points = {};
    for (let j = 0; j < team_ids.length; j++) {
      team_points[team_ids[j]] = 0;
    }

    // Determine every teams position on the problem leaderboard.
    for (let i = 0; i < problems.length; i++) {
      let top_list = [];
      for (let j = 0; j < team_ids.length; j++) {
        if (scores[team_ids[j]][problems[i].dj_id] == undefined || scores[team_ids[j]][problems[i].dj_id].length == 999999) continue;

        top_list.push({ score: scores[team_ids[j]][problems[i].dj_id].length, team: team_ids[j] });
      }
      top_list.sort((a, b) => a.score - b.score);

      let div = 0;
      let prevScore = -1;
      for (let j = 0; j < top_list.length; j++) {
        if (prevScore != top_list[j].score) {
          div++;
          prevScore = top_list[j].score;
        }

        team_points[top_list[j].team] += Math.floor(problems[i].points / div);
      }
    }

    for (let i = 0; i < team_ids.length; i++) {
      let scoreStrings = ""
      for (let j = 0; j < problems.length; j++) {
        if (scores[team_ids[i]][problems[j].dj_id] == undefined || scores[team_ids[i]][problems[j].dj_id].length == 999999) {
          scoreStrings += "<td> - </td>"
        }
        else {
          scoreStrings += `<td> ${scores[team_ids[i]][problems[j].dj_id].length} </td>`
        }
      }
      tc.append(`
            <tr class="teaminfo">
                <td class="teamname">
                    ${scores[team_ids[i]].name}
                </td>
                ${scoreStrings}
                <td>
                    ${team_points[team_ids[i]]}
                </td>
            </tr>
            `)
    }
  })
}

getTimes();

setInterval(() => {
  getTimes()
}, 60 * 1000);