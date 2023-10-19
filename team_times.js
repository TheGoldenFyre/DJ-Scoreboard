import got, {Options} from 'got';

const baseUrl = "http://192.168.2.73:12345"
// const baseUrl = "https://domjudge.plopmenz.com"

const options = new Options({
    responseType: 'json',
    headers: {
      Authorization: 'Basic ' + btoa("admin:hTu6xcbxDhRVWsHs")
    }
});

async function getTeamTimes(current_times) {
  await got.get(`${baseUrl}/api/v4/contests/2/submissions`, options)
  .then(async res => {
    const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';
    console.log('Getting new team scores: ', headerDate);
    let updated_submissions = res.body;

    // for each of the submissions, check if its newer than the one we have for a certain team / problem combo.
    for (let i = 0; i < updated_submissions.length; i++) {
      let team_id    = updated_submissions[i].team_id;
      let problem_id = updated_submissions[i].problem_id;
      let sub_id     = parseInt(updated_submissions[i].id);

      // If no previous submissions exist for a team, initialize now.
      if (current_times[team_id] == undefined) {
        let name = await getTeamName(team_id);
        current_times[team_id] = { name: name };
        let sub_state = await getSubmissionState(sub_id)
        current_times[team_id][problem_id] = sub_state;
      }

      // If there are no previous submissions for this problem by the team, we can initialize as well
      if (current_times[team_id][problem_id] == undefined) {
        let sub_state = await getSubmissionState(sub_id)
        current_times[team_id][problem_id] = sub_state;
      }

      // Otherwise, only update if the submission is newer. 
      if (current_times[team_id][problem_id].sub_id < sub_id) {
        console.log(`Updating score for team ${team_id}, problem ${problem_id}.`)
        console.log(`Old submission id: ${current_times[team_id][problem_id].sub_id}, new: ${sub_id}`);
        let sub_state = await getSubmissionState(sub_id)
        current_times[team_id][problem_id] = sub_state;
      }
    }
    })
    .catch(err => {
      console.log('Error: ', err.message);
    });

    return current_times;
}

// Gets the code size and final state of the run. 
async function getSubmissionState(sub_id) {
  let result = {};
  // First, get the length of the submission
  await got.get(`${baseUrl}/api/v4/contests/2/submissions/${sub_id}/source-code`, options)
  .then(async res_source_code => {
    let source_code_length = atob(res_source_code.body[0].source).length;
    
    // Then, get the judgement state.
    await got.get(`${baseUrl}/api/v4/contests/2/judgements?strict=false&submission_id=${sub_id}`, options)
    .then(async res_judgement => {
      
      if (!res_judgement.body || res_judgement.body.length == 0) {
        result = { sub_id: sub_id, length: 999999, status: "Tests did not yet pass!" };
        return;
      }
      
      // Check if latest judgement was accepted
      if (res_judgement.body[res_judgement.body.length - 1].judgement_type_id == "AC") {
        result = { sub_id: sub_id, length: source_code_length, status: "Accepted." };
        return;
      }
      else {
        result = { sub_id: sub_id, length: 999999, status: "Tests failed." };
        return;
      }
    })
  })
  
  return result;
}

async function getTeamName(team_id) { 
  let result;
  await got.get(`${baseUrl}/api/v4/contests/2/teams/${team_id}?strict=false`, options)
  .then(async res => {
    result = res.body.name
  })

  return result
}

export default getTeamTimes