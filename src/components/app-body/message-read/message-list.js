import React from 'react'

const MessageList = ({ messages, onMessageSelect }) => {
  const handleMessageClick = (message) => {
    onMessageSelect(message)
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const date = new Date(timeString * 1000)
    return date.toLocaleString() // This will format the date according to the user's locale
  }

  return (
    <div className='message-list'>
      {messages.map((message, index) => (
        <div
          key={`message-${index}`}
          className='message-row'
          onClick={() => handleMessageClick(message)}
          style={{ cursor: 'pointer' }}
        >
          <div className='message-number'>#{index + 1}</div>
          <div className='message-sender'>{message.sender}</div>
          <div className='message-subject'>{message.subject}</div>
          <div className='message-time'>{formatTime(message.time)}</div>
        </div>
      ))}
      {messages.length === 0 && (
        <div className='message-row text-center'>
          <div className='message-sender'>No messages found</div>
        </div>
      )}
    </div>
  )
}

export default MessageList
