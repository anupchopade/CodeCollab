import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  
  // Test doc:join event
  socket.emit('doc:join', {
    projectId: 'test-project-123',
    fileId: 'test-file-456',
    userId: 'test-user-789'
  });
});

socket.on('user:joined', (data) => {
  console.log('�� User joined event received:', data);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});