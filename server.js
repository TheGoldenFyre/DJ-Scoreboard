import getTeamTimes from './team_times.js';
import express from 'express'
import path from 'path'

import { ToadScheduler, SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
const scheduler = new ToadScheduler()

let app = express()

let team_sizes = {}

const task = new AsyncTask(
  'Getting team times', 
  async () => { team_sizes = await getTeamTimes(team_sizes); },
  (err) => { console.error(err) }
  )
  
  // Schedule run to run every 5 minutes
  const job = new SimpleIntervalJob({ seconds: 60 }, task)
  scheduler.addSimpleIntervalJob(job)
  
  const port = 6969

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
