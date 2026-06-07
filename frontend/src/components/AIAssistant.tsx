import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './AIAssistant.css'; 

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatMessagesRef = useRef<HTMLDivElement>(null);

    const token = localStorage.getItem('token') || 'guest';
    const storageKey = `belibeli_chat_history_${token}`;

    const [history, setHistory] = useState<ChatMessage[]>(() => {
        const savedHistory = localStorage.getItem(storageKey);
        return savedHistory ? JSON.parse(savedHistory) : [
            { role: 'assistant', content: 'Hey there! 🌟 I am your BeliBeli Personal Stylist. Looking for an outfit recommendation or shopping on a budget? Ask me anything!' }
        ];
    });


    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(history));
    }, [history, storageKey]);

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTo({
                top: chatMessagesRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [history, isTyping]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userText = message;
        setMessage(''); 
        
        const updatedHistory = [...history, { role: 'user', content: userText } as ChatMessage];
        setHistory(updatedHistory);
        setIsTyping(true);

        try {
            const backendHistory = updatedHistory.slice(0, -1).map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await fetch('http://127.0.0.1:8000/api/products/ai-assistant/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userText,
                    history: backendHistory
                })
            });

            if (response.ok) {
                const data = await response.json();
                setHistory([...updatedHistory, { role: 'assistant', content: data.reply }]);
            } else {
                setHistory([...updatedHistory, { role: 'assistant', content: "Oops! My fashion circuits crossed. Please try asking again shortly!" }]);
            }
        } catch (err) {
            console.error("AI Assistant connection error:", err);
            setHistory([...updatedHistory, { role: 'assistant', content: "Connection failed. Make sure your backend server is active!" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="ai-assistant-container">
            {!isOpen && (
                <button className="ai-floating-bubble" onClick={() => setIsOpen(true)}>
                    <Sparkles className="sparkle-icon" size={16} />
                    <MessageSquare size={24} />
                </button>
            )}

            {isOpen && (
                <div className="ai-chat-window">
                    <div className="ai-chat-header">
                        <div className="header-info">
                            <Sparkles size={18} color="#ffb703" fill="#ffb703" />
                            <h3>BeliBeli AI Stylist</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button className="close-chat-btn" onClick={() => setIsOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="ai-chat-messages" ref={chatMessagesRef}>
                        {history.map((msg, idx) => (
                            <div key={idx} className={`chat-bubble-row ${msg.role}`}>
                                <div className={`chat-bubble ${msg.role}`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="chat-bubble-row assistant">
                                <div className="chat-bubble assistant typing-dots">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <form className="ai-chat-input-form" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Ask about shoes, gray t-shirts, outfits..." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" disabled={isTyping}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}