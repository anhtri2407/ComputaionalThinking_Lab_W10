import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../../services/api';
import './ChatBot.css';

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Xin chào! 👋 Tôi là trợ lý du lịch Việt Nam. Hỏi tôi về các địa điểm như Hà Nội, Đà Nẵng, Hội An nhé!'
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        setInputText('');

        // Add user message to chat
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await sendChatMessage(userMessage, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickQuestions = [
        'Hà Nội',
        'Đà Nẵng',
        'Hội An',
        'Phở'
    ];

    return (
        <>
            {/* Floating Chat Button */}
            <button
                className="chatbot-fab"
                onClick={() => setIsOpen(!isOpen)}
                title="Trợ lý du lịch AI"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="chatbot-popup">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <span className="chatbot-avatar">🤖</span>
                            <div>
                                <h3>Trợ lý Du lịch AI</h3>
                                <span className="chatbot-status">● Online</span>
                            </div>
                        </div>
                        <button
                            className="chatbot-close-btn"
                            onClick={() => setIsOpen(false)}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chatbot-message ${msg.role}`}
                            >
                                {msg.role === 'assistant' && (
                                    <span className="message-avatar">🤖</span>
                                )}
                                <div className="message-content">
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chatbot-message assistant">
                                <span className="message-avatar">🤖</span>
                                <div className="message-content typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    <div className="chatbot-quick-questions">
                        {quickQuestions.map((q, index) => (
                            <button
                                key={index}
                                className="quick-question-btn"
                                onClick={() => {
                                    setInputText(q);
                                }}
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Hỏi về du lịch Việt Nam..."
                            disabled={isLoading}
                        />
                        <button
                            className="chatbot-send-btn"
                            onClick={handleSend}
                            disabled={isLoading || !inputText.trim()}
                        >
                            {isLoading ? '...' : '➤'}
                        </button>
                    </div>
                </div>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    className="chatbot-overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

export default ChatBot;
