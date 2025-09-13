 import File from '../models/File.js';

export function handleDocumentEvents(socket, io) {
    // Document join event
    socket.on('doc:join', async (data) => {
      try {
        // Validation
        const{projectId,fileId,userId}=data;
        if (!projectId || !fileId || !userId) {
            socket.emit('error', { message: 'Missing required data' });
            return;
          }

        // Room joining (both file-specific and project-wide)
        const fileRoomName=`project-${projectId}-file-${fileId}`;
        const projectRoomName=`project-${projectId}`;
        
        console.log(`🔍 [DEBUG] User ${userId} joining rooms: ${fileRoomName} and ${projectRoomName}`);
        socket.join(fileRoomName);
        socket.join(projectRoomName);
        
        // Check room membership
        const fileRoom = io.sockets.adapter.rooms.get(fileRoomName);
        const projectRoom = io.sockets.adapter.rooms.get(projectRoomName);
        console.log(`🔍 [DEBUG] File room size: ${fileRoom ? fileRoom.size : 0}, Project room size: ${projectRoom ? projectRoom.size : 0}`);
        
        // User tracking
        socket.currentRoom=fileRoomName;
        socket.currentProject=projectId;
        socket.currentFile=fileId;
        socket.currentUser=userId;
        // Notification to all users in the room (including current user)
        io.to(fileRoomName).emit('user:joined',{
            userId,
            fileId,
            projectId,
            userName:userId,
            message:`User ${userId} joined the document`
        });
        console.log(`✅ User ${userId} joined file ${fileId} in project ${projectId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join document' });
      }
    });
  
    // Document leave event
    socket.on('doc:leave', (data) => {
        try {
          // 1. Room leaving
          if (socket.currentRoom) {
            socket.leave(socket.currentRoom);
            
            // 2. Notification to all users in the room
            io.to(socket.currentRoom).emit('user:left', {
              userId: socket.currentUser,
              fileId: socket.currentFile,
              projectId: socket.currentProject,
              message: `User ${socket.currentUser} left the document`
            });
      
            console.log(`❌ User ${socket.currentUser} left file ${socket.currentFile}`);
          }
      
          // 3. Cleanup
          socket.currentRoom = null;
          socket.currentFile = null;
          socket.currentProject = null;
          socket.currentUser = null;
        } catch (error) {
          console.error('Error in doc:leave:', error);
          socket.emit('error', { message: 'Failed to leave document' });
        }
      });
  
    // Document operations event
    socket.on('doc:ops', (data) => {
      try {
        const{projectId,fileId,operations,userId,timestamp,sessionId}=data;

        //validation
        if(!projectId || !fileId || !operations || !userId){
            socket.emit('error',{message:'Missing required data for operations'});
            return;
        }
        //roomName
        const roomName=`project-${projectId}-file-${fileId}`;

        //broadcast to other users in room (excluding sender)
        socket.to(roomName).emit('doc:ops:received',{
            operations,
            userId,
            fileId,
            projectId,
            timestamp:timestamp || Date.now(),
            sessionId,
            operationType: 'ot' // Mark as Operational Transform operation
        });
        console.log(`✅ User ${userId} (session: ${sessionId}) applied OT operations to file ${fileId} in project ${projectId}`);
      } catch (error) {
        console.error('Error in doc:ops:', error);
        socket.emit('error', { message: 'Failed to apply operations' });
      }
    });
  
    // Document snapshot request
    socket.on('doc:requestSnapshot', async (data) => {
        try {
          const { projectId, fileId } = data;
          
          // 1. Validation
          if (!projectId || !fileId) {
            socket.emit('error', { message: 'Missing projectId or fileId' });
            return;
          }
      
          // 2. Get document state from database
          const file = await File.findOne({ _id: fileId, project: projectId });
          
          if (!file) {
            socket.emit('error', { message: 'File not found' });
            return;
          }
          
          // 3. Send snapshot to requesting user
          socket.emit('doc:snapshot', {
            fileId,
            projectId,
            content: file.content || '', // Use actual file content
            timestamp: Date.now()
          });
      
          console.log(`📸 Snapshot sent for file ${fileId} (${file.name}) to user ${socket.currentUser}`);
        } catch (error) {
          console.error('Error in doc:requestSnapshot:', error);
          socket.emit('error', { message: 'Failed to get document snapshot' });
        }
      });
  }
