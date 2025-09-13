import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('✅ Connected to server:', socket.id);
  
  // Test 1: Join document
  console.log('🧪 Testing doc:join...');
  socket.emit('doc:join', {
    projectId: 'test-project-123',
    fileId: 'test-file-456',
    userId: 'test-user-789'
  });
  
  // Test 2: Send operations (after 2 seconds)
  setTimeout(() => {
    console.log('🧪 Testing doc:ops...');
    socket.emit('doc:ops', {
      projectId: 'test-project-123',
      fileId: 'test-file-456',
      operations: [{ type: 'insert', position: 0, text: 'Hello World' }],
      userId: 'test-user-789',
      timestamp: Date.now()
    });
  }, 2000);
  
  // Test 3: Request snapshot (after 4 seconds)
  setTimeout(() => {
    console.log('🧪 Testing doc:requestSnapshot...');
    socket.emit('doc:requestSnapshot', {
      projectId: 'test-project-123',
      fileId: 'test-file-456'
    });
  }, 4000);
  
  // Test 4: Leave document (after 6 seconds)
  setTimeout(() => {
    console.log('�� Testing doc:leave...');
    socket.emit('doc:leave', {
      projectId: 'test-project-123',
      fileId: 'test-file-456',
      userId: 'test-user-789'
    });
  }, 6000);
});

// Listen for responses
socket.on('user:joined', (data) => {
  console.log('📢 User joined:', data);
});

socket.on('doc:ops:received', (data) => {
  console.log('�� Operations received:', data);
});

socket.on('doc:snapshot', (data) => {
  console.log('📸 Snapshot received:', data);
});

socket.on('user:left', (data) => {
  console.log('👋 User left:', data);
});

socket.on('error', (error) => {
  console.error('❌ Socket error:', error);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});