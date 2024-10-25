import SockJS from 'sockjs-client';
import { Client, Frame, Message } from '@stomp/stompjs';
import { getToken } from "@/utils";

// define the type of message handler
type MessageHandler = (payload: WarningRecords) => void;

// define the interface of warning records
interface WarningRecords {
    id: number;
    description: string;
    date: string;
    risk: 'high' | 'low';
}

class WebSocketService {
    private stompClient: Client | null;
    private messageHandlers: Set<MessageHandler>;
    private reconnectAttempts: number;
    private readonly maxReconnectAttempts: number;
    private readonly reconnectInterval: number;

    constructor() {
        this.stompClient = null;
        this.messageHandlers = new Set();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
    }

    /**
     * 建立WebSocket连接
     */
    public connect(): void {
        if (this.stompClient?.connected) {
            console.log('WebSocket already connected');
            return;
        }

        const token = getToken();
        const socket = new SockJS(`http://localhost:8080/ws`);

        this.stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: { Authorization: `Bearer ${token}` },
            debug: (str) => console.log('STOMP debug:', str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: this.handleConnect.bind(this),
            onDisconnect: this.handleDisconnect.bind(this),
            onStompError: (frame: Frame) => {
                console.error('STOMP error:', frame);
                this.handleDisconnect();
            }
        });

        this.stompClient.activate();
    }

    /**
     * 处理连接成功的回调
     */
    private handleConnect(): void {
        console.log('STOMP connection established');
        localStorage.setItem('webSocketConnected', 'true');
        this.reconnectAttempts = 0;
        this.subscribeToTopics();
    }

    /**
     * 订阅相关主题
     */
    private subscribeToTopics(): void {
        if (this.stompClient) {
            this.stompClient.subscribe('/topic/analysis-result/*', this.handleMessage.bind(this));
        }
    }

    /**
     * 处理接收到的消息
     * @param message 接收到的消息
     */
    private handleMessage(message: Message): void {
        console.log('Received message:', message);
        try {
            const content = message.body;
            const textContentMatch = content.match(/textContent=([^.]+\.)/);
            if (textContentMatch) {
                let description = textContentMatch[1].trim();
                // 移除开头和结尾的引号（如果存在）
                description = description.replace(/^["']|["']$/g, '');

                const risk = description.toLowerCase().includes('warning') ? 'high' : 'low';

                if (risk === 'high') {
                    const payload: WarningRecords = {
                        id: Date.now(),
                        description,
                        date: new Date().toISOString().split('T')[0],
                        risk
                    };

                    console.log('Processed high-risk payload:', payload);
                    this.updateSessionStorage(payload);
                    this.messageHandlers.forEach(handler => handler(payload));
                } else {
                    console.log('Ignoring low-risk message:', description);
                }
            } else {
                console.log('No valid content found in the message');
            }
        } catch (error) {
            console.error('Error processing message:', error);
            console.error('Original message:', message.body);
        }
    }

    /**
     * 更新会话存储中的可疑交易
     * @param payload 新的可疑交易
     */
    private updateSessionStorage(payload: WarningRecords): void {
        const storedTransactions: WarningRecords[] = JSON.parse(sessionStorage.getItem('warningRecords') || '[]');
        const updatedTransactions = [payload, ...storedTransactions].slice(0, 5);
        sessionStorage.setItem('warningRecords', JSON.stringify(updatedTransactions));
    }

    /**
     * 处理断开连接的回调
     */
    private handleDisconnect(): void {
        console.log('STOMP connection closed');
        localStorage.removeItem('webSocketConnected');
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            setTimeout(() => this.connect(), this.reconnectInterval);
        } else {
            console.error('Max reconnect attempts reached. Please refresh the page.');
        }
    }

    /**
     * 检查是否已连接
     * @returns 是否已连接
     */
    public isConnected(): boolean {
        return this.stompClient?.connected ?? false;
    }

    /**
     * 处理用户登出
     */
    public handleLogout(): void {
        this.disconnect();
    }

    /**
     * 断开WebSocket连接
     */
    public disconnect(): void {
        this.stompClient?.deactivate();
        localStorage.removeItem('webSocketConnected');
        this.reconnectAttempts = 0;
    }

    /**
     * 添加消息处理器
     * @param handler 消息处理器函数
     */
    public addMessageHandler(handler: MessageHandler): void {
        this.messageHandlers.add(handler);
    }

    /**
     * 移除消息处理器
     * @param handler 要移除的消息处理器函数
     */
    public removeMessageHandler(handler: MessageHandler): void {
        this.messageHandlers.delete(handler);
    }
}

export default new WebSocketService();