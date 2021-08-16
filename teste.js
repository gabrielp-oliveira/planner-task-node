
 const startStage = {
    plannerDescription: 'planejamento e controle do portal web, assim como suas aplicaçoes.',   
    plaannerName: 'Squad Web'
    }

const addParticipantsStage = [ { email: 'gabriel.oliveira@petros.com.br', acess: 'intermediate' } ]

const newStages = [
  {
    StageName: 'Approved Ideas',
    pos: 0,
    StageDesc: 'ideas already analyzed and already approved by the team or analyst.'
  },
  {
    StageName: 'Planning and scale',
    pos: 1,
    StageDesc: 'planning stage and resource counts, also being made the scale of the person responsible for it.'
  },
  {
    StageName: 'To do',
    pos: 2,
    StageDesc: 'awaiting start of task progress'
  },
  {
    StageName: 'Out of Range',
    pos: 3,
    StageDesc: 'special tasks that require special attention.'
  },
  {
    StageName: 'In Progress',
    pos: 4,
    StageDesc: 'tasks in progress, already being worked on and discussed.'
  },
  {
    StageName: 'Tests',
    pos: 5,
    StageDesc: 'testing stage, not only being tested by the analyst, but can also be tested by the requester or user.'
  },
  {
    StageName: 'Awaiting approval',
    pos: 6,
    StageDesc: 'waiting for the requester to approve the task.'
  },
  {
    StageName: 'Implantation',
    pos: 7,
    StageDesc: 'step to move the task to the final environment'
  },
  {
    StageName: 'Production',
    pos: 8,
    StageDesc: 'already in production, enabling testing in the final environment of the task.'  },
  {
    StageName: 'Done',
    pos: 9,
    StageDesc: 'task performed successfully.'
  }
]

module.exports = {startStage, addParticipantsStage, newStages}
