import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { Send } from 'lucide-react'
import './ChatWidget.css'

export default function ChatWidget() {
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hello. How can I help you?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim()) return

        const userMsg = { role: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const response = await axios.post('http://localhost:5000/chat', {
                question: input
            })

            const aiMsg = { role: 'ai', text: response.data.answer }
            setMessages(prev => [...prev, aiMsg])
        } catch (error) {
            setMessages(prev => [
                ...prev,
                { role: 'ai', text: 'Sorry, something went wrong.' }
            ])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage()
    }

    return (
        <div className="page-center">
            <div className="chat-container">
                {/* Header */}
                <div className="chat-header">
                    AI Assistant
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`message ${msg.role === 'ai' ? 'ai-msg' : 'user-msg'}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                    {loading && <div className="message ai-msg">Thinking...</div>}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="chat-input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={loading}
                    />
                    <button onClick={sendMessage} disabled={loading || !input.trim()}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
