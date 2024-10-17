import getTeamTimes from './team_times.js';
import express from 'express'
import path from 'path'
import { port, submission_update_interval } from './server_config.js'

import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
const scheduler = new ToadScheduler()

let app = express()
app.use(express.static('public'))

let team_sizes = {}

const task = new AsyncTask(
  'Getting team times', 
  async () => { team_sizes = await getTeamTimes(team_sizes); },
  (err) => { console.error(err) }
)
  
// Schedule run to run every 5 minutes
const job = new SimpleIntervalJob({ seconds: submission_update_interval }, task)
scheduler.addSimpleIntervalJob(job)

app.get('/', (req, res) => {
  res.sendFile(path.resolve("./index.html"))
})


app.get('/api/team_times', (req, res) => {
  res.send(team_sizes)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

team_sizes = await getTeamTimes(team_sizes)
