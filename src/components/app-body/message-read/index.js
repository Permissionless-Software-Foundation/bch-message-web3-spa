import React, { useState, useCallback, useEffect } from 'react'
import './styles.css'
import SearchBar from './search-bar'
import MessageActions from './message-actions'
import MessageList from './message-list'
import Read from './read'
import NostrBrowser from '../../../services/nostr'

const MessageRead = (props) => {
  const { appData } = props
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const messagesPerPage = 10
  const [currentMessages, setCurrentMessages] = useState([])
  const [totalPages, setTotalPages] = useState(0)

  // Get Wallet Messages
  const getMessages = useCallback(async () => {
    setIsLoading(true)
    const nostrBrowser = new NostrBrowser({ bchWallet: appData.wallet })
    const messages = await nostrBrowser.checkMessages()

    // Create mock data instead of fetching from NostrBrowser
    // This mock is used for testing purposes
    /*     const messages = Array.from({ length: 30 }, (_, index) => ({
      id: `msg-${index + 1}`,
      subject: `Test Message ${index + 1}`,
      content: `This is the content for message ${index + 1}. Lorem ipsum dolor sit amet.`,
      sender: `sender${index + 1}@example.com`,
      time: new Date(Date.now() - index * 86400000).toISOString(), // Each message 1 day apart
      read: Math.random() > 0.5 // Randomly set read status
    }));  */

    setMessages(messages)
    setIsLoading(false)
    setSuccess(true)
  }, [appData.wallet])

  // Load messages when component  mount
  useEffect(() => {
    if (!isLoading && !success) {
      console.log('getMessages')
      getMessages()
    }
  }, [isLoading, getMessages, success])

  // filter messages by subject
  const filteredMessages = useCallback(() => {
    if (!searchTerm) return messages
    return messages.filter(message =>
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [messages, searchTerm])

  // Handling pagination calculations
  useEffect(() => {
    const indexOfLastMessage = currentPage * messagesPerPage
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage
    const filtered = filteredMessages()
    console.log('filtered', filtered.slice(indexOfFirstMessage, indexOfLastMessage))
    setCurrentMessages(filtered.slice(indexOfFirstMessage, indexOfLastMessage))
    setTotalPages(Math.ceil(filtered.length / messagesPerPage))
  }, [currentPage, messagesPerPage, filteredMessages])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div className='message-container'>
      <div className='message-header'>
        <div className='tabs'>
          <button
            className={`tab ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setActiveTab('inbox')}
          >
            Inbox
          </button>

        </div>
        {!selectedMessage && <SearchBar onSearch={setSearchTerm} />}
      </div>

      {activeTab === 'inbox' && (
        <>
          {!selectedMessage && !isLoading && (
            <>
              <MessageActions
                onRefresh={getMessages}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              <MessageList
                messages={currentMessages}
                onMessageSelect={setSelectedMessage}
              />
            </>
          )}
          {isLoading && (
            <div className='text-center'>
              <div className='d-flex justify-content-center align-items-center message-list'>
                <div className='spinner-border text-primary' role='status'>
                  <span className='visually-hidden'>Loading...</span>
                </div>
              </div>
            </div>
          )}

          {selectedMessage && (
            <Read message={selectedMessage} onClose={() => setSelectedMessage(null)} appData={appData} />
          )}
        </>
      )}

    </div>
  )
}

export default MessageRead
