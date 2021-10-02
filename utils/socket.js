
const User = require('../models/user')
const Planner = require('../models/planner')
const Task = require('../models/task')

const eventConnectionHandler = (socket_Server, io) => {




  socket_Server.on('joinRoom', (data) => {

    socket_Server.join(data.plannerId)

    io.to(data.plannerId).emit('teste', {
      teste: 'Chat-Bot',
    })

    // const User =  await User.findOne({ socketID: socket_Server.id })

  })

  socket_Server.on('exitRoom', async (exitData) => {

    socket_Server.leave(exitData.plannerId)
  })

  socket_Server.on('disconnect', async () => {
    // socket_Server.leave(await rooms.getUserRoomName(socket_Server.id))
  })

  // {
  //   _id: 6154f531cea48e18b0764c5d,
  //   StageId: '614bafc0bb097b367458e4c5',
  //   TaskId: '6154f531cea48e18b0764c59'
  // }
  socket_Server.on('changeTask', async (exitData) => {
    const { columns, plannerId, userId } = exitData

    let planner
    if (plannerId.match(/^[0-9a-fA-F]{24}$/)) {
      planner = await Planner.findOne({ _id: plannerId })
    }

    const col = []
    Object.entries(columns).forEach((el) => {
      col[el[0]] = el[1]
    })

    const tasks = []
    col.forEach((el) => {
      el.tasks?.forEach((tsk) => {
        tasks.push({
          StageId: tsk.StageId,
          TaskId: tsk._id
        })
      })
    })

    console.log(planner)
    // plan.tasks = tasks

    
    // io.to(roomID).emit('SetNewPlannerInfo', newPlannerInfo)      

    // await Planner.findOneAndReplace({_id: plannerId}, plan)
  })


}

async function changeTask(data) {

  const newMessage = {
    name: data.UserName,
    message: data.message,
    id: data.User_ID,
    roomName: data.roomName
  }

  rooms.updateMessageRoom(data.room_ID, newMessage, io)


}

module.exports = eventConnectionHandler
