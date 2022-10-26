import got, {Options} from 'got';

const options = new Options({
    responseType: 'json',
    headers: {
      Authorization: 'Basic ' + btoa("admin:kCCp1NjpJCkCtyCt")
    }
});

async function getTeamTimes() {
    let team_times = []
    team_times = await got.get('https://domjudge.plopmenz.com/api/v4/contests/2/judgements', options)
    .then(async res => {
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
      console.log('Getting new team times: ', headerDate);
  
      
      let latest_times = {}
      for (let i = 0; i < res.body.length; i++) {
          let team_id = await got.get(`https://domjudge.plopmenz.com/api/v4/contests/2/submissions/${res.body[i].submission_id}`, options)
                             .json()
          team_id = team_id.team_id
          
          if (res.body[i].judgement_type_id == "AC") latest_times[team_id] = res.body[i].max_run_time
      }
  
      for (let i = 0; i < Object.keys(latest_times).length; i++) {
          let team_name = await got.get(`https://domjudge.plopmenz.com/api/v4/contests/2/teams/${Object.keys(latest_times)[i]}`, options)
                             .json()
  
          team_name = team_name.name
          team_times.push({ team_name: team_name, run_time: latest_times[Object.keys(latest_times)[i]] }) 
      }
      
      console.log("Internal team times updated")
      return team_times.sort((a, b) => a.run_time - b.run_time)
    })
    .catch(err => {
      console.log('Error: ', err.message);
    });

    return team_times;
}

export default getTeamTimes