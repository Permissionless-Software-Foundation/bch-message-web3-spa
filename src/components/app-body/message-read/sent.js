import React, { useState } from 'react'
import MessageActions from './message-actions'
import MessageList from './message-list'
import Read from './read'

const SentMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState(null)

  const sentMessages = [
    {
      id: 1,
      sender: 'You',
      recipient: 'bitcoincash:qr2gfwz0lu7qvn4h5ppchgr9n8v6kq6m35gs837f5l',
      subject: 'Re: Welcome Message',
      time: '02/04/2025 12:30:00',
      message: 'Thank you for the welcome! I\'m excited to try out this decentralized messaging system. Quick question - how long does it typically take for messages to be confirmed on the blockchain?'
    },
    {
      id: 2,
      sender: 'You',
      recipient: 'bitcoincash:qqwm8j2m9jkg6zqjr9gqp93tfu99t0mrru7907g8yc',
      subject: 'Project Update',
      time: '03/04/2025 15:00:00',
      message: 'I\'ve reviewed the latest changes to the project and everything looks good. The implementation of the messaging protocol is working as expected. Let\'s schedule a call to discuss the next steps.'
    },
    {
      id: 3,
      sender: 'You',
      recipient: 'bitcoincash:qzl6k0wvdd5ky99hp9nl3w8vrmz6c7s4yvfs8q2k3l',
      subject: 'Re: Transaction proposal',
      time: '03/04/2025 17:00:00',
      message: 'I\'ve reviewed your transaction proposal and I\'m interested in proceeding. Could you please provide more details about the timeline and specific requirements? Looking forward to your response.'
    }
  ]

  return (
    <>
      {!selectedMessage
        ? (
          <>
            <MessageActions />
            <MessageList messages={sentMessages} onMessageSelect={setSelectedMessage} />
          </>
          )
        : (
          <Read message={selectedMessage} onBack={() => setSelectedMessage(null)} />
          )}
    </>
  )
}

export default SentMessages
