
const User = require('../models/user')
const Planner = require('../models/planner')
const Task = require('../models/task')

const eventConnectionHandler = (socket_Server, io) => {

  socket_Server.on('joinRoom', async (data) => {
    const {plannerId , userId} = data

    const isUserConnected =  await User.findOne({ socketId: socket_Server.id })
    if(isUserConnected) return

    await User.findOneAndUpdate(
      { _id: userId },
      { socketId: socket_Server.id } )

    socket_Server.join(plannerId)

  })

  socket_Server.on('exitRoom', async (exitData) => {

    const isUserConnected =  await User.findOne({ socketId: socket_Server.id })
    if(isUserConnected){
      await User.findOneAndUpdate(
        { _id: isUserConnected._id },
        { socketId: '' } )

        socket_Server.leave(socket_Server.id)
      }

  })

  socket_Server.on('disconnect', async () => {

    const isUserConnected =  await User.findOne({ socketId: socket_Server.id })
    if(isUserConnected){
      await User.findOneAndUpdate(
        { _id: isUserConnected._id },
        { socketId: '' } )

        socket_Server.leave(socket_Server.id)
      }
  })

 
}

module.exports = eventConnectionHandler
