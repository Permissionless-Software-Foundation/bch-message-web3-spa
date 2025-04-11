/*
  This component provides a form for sending encrypted messages using BCH addresses.
  It allows users to input a recipient's BCH address, a subject, and a message.
*/

import React, { useState } from 'react'
import { Container, Form, Button, Modal } from 'react-bootstrap'
import EncryptLib from 'bch-encrypt-lib'
import NostrBrowser from '../../../services/nostr'
import { Buffer } from 'buffer'

function MessageSend (props) {
  const { appData } = props
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [progressStep, setProgressStep] = useState('')

  // form data
  const [formData, setFormData] = useState({
    address: '',
    subject: '',
    message: ''
  })

  // handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      setShowModal(true)

      // encrypt the message
      setProgressStep('Encrypting message...')
      const encryptedStr = await encryptMessage(formData)

      // upload the message to nostr
      setProgressStep('Uploading to Nostr...')
      const nostrBrowser = new NostrBrowser({ bchWallet: appData.wallet })
      const { eventId } = await nostrBrowser.buildMessage({ encryptedStr })
      // send the message signal
      setProgressStep('Sending message signal...')
      const signal = await nostrBrowser.sendMsgSignal({
        addr: formData.address,
        subject: formData.subject,
        eventId
      })

      const explorerUrl = `https://blockchair.com/bitcoin-cash/transaction/${signal.txid}`
      const explorerLink = (<span>Success: <a href={`${explorerUrl}`} target='_blank' rel='noreferrer'>Block Explorer</a></span>)

      setProgressStep(explorerLink)
      // Keep modal open for a moment to show success
      setIsLoading(false)
    } catch (error) {
      setProgressStep(<span style={{ color: 'red' }}>Error: {error.message}</span>)
      console.error('Error sending message:', error)
      setIsLoading(false)
    }
  }

  // Look up the reciever's public key from the blockchain, use it to encrypt
  // the message, and return the encrypted message.
  const encryptMessage = async (formData) => {
    try {
      const { message } = formData
      let msgtToSend = message

      msgtToSend = JSON.stringify({ message })

      // Instantiate the encryptLib with the bchjs instance from the appData
      const encryptLib = new EncryptLib({ bchjs: appData.wallet.bchjs })
      // Get the public key for the given address
      const pubKey = await appData.wallet.getPubKey(formData.address)
      // Convert the message to a buffer and then to a hex string
      const buff = Buffer.from(msgtToSend)
      const hex = buff.toString('hex')

      // Encrypt the message using the public key
      const encryptedMessage = await encryptLib.encryption.encryptFile(pubKey, hex)

      return encryptedMessage
    } catch (err) {
      console.error('Error encrypting message:', err)
      throw new Error(
        `Could not find public key on the blockchain for address ${formData.address}.
        An address must make at least 1 transaction to be able to lookup their public key for encryption.
        If you think this is a mistake, try again.
        `
      )
    }
  }

  return (
    <Container>
      <h2>Send Encrypted Message</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className='mb-3' controlId='address'>
          <Form.Label>BCH Address:</Form.Label>
          <Form.Control
            type='text'
            name='address'
            value={formData.address}
            onChange={handleInputChange}
            placeholder='bitcoincash:q...'
            required
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='subject'>
          <Form.Label>Subject:</Form.Label>
          <Form.Control
            type='text'
            name='subject'
            value={formData.subject}
            onChange={handleInputChange}
            placeholder='Message subject'
            required
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='message'>
          <Form.Label>Message:</Form.Label>
          <Form.Control
            as='textarea'
            name='message'
            value={formData.message}
            onChange={handleInputChange}
            rows={6}
            placeholder='Enter your message'
            required
          />
        </Form.Group>

        <div className='d-flex justify-content-center'>
          <Button variant='primary' type='submit'>
            Send Message
          </Button>
        </div>
      </Form>
      <br />
      <br />

      <Modal show={showModal} centered backdrop='static'>
        <Modal.Header closeButton onHide={() => setShowModal(false)}>
          <Modal.Title>Sending Message</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center py-4'>
          <div className='mb-3'>
            {progressStep}
          </div>
          {isLoading && (
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  )
}

export default MessageSend
