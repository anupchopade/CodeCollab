import { io } from 'socket.io-client';
class SocketService {
    constructor(){
        this.socket=null;

    }
    connect(){
        this.socket=io('http://localhost:5000',{
            autoConnect:true,
            reconnection:true,
            reconnectionDelay:1000,
            reconnectionAttempts:5
        });
        this.socket.on('connect',()=>{
            console.log('✅ Connected to socket server:',this.socket.id);
        });
        this.socket.on('disconnect',()=>{
            console.log('❌ Disconnected from socket server');
        });
        return this.socket;

    }

    disconnect(){
        if(this.socket){
            this.socket.disconnect();
            this.socket=null;
        }
    }
    getSocket(){

        return this.socket;
    }
}
export default new SocketService();