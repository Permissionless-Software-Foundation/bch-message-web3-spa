import React, { useEffect, useState, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import './styles.css'
import NostrBrowser from '../../../services/nostr'
import EncryptLib from 'bch-encrypt-lib'
import { Buffer } from 'buffer'

const MessageRead = ({ message, onClose, appData }) => {
  const [msgRead, setMsgRead] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [decryptedMsg, setDecryptedMsg] = useState(null)

  // Handle the message data format
  const handleMsgData = useCallback((clearMsg) => {
    let msg = clearMsg
    try {
      // Verify if the message is a JSON object
      msg = JSON.parse(msg)
      console.log('msg', msg)
      if (msg.message) {
        msg = msg.message
      }
      // Verify if the message contains data
      if (msg.data) {
        msg = JSON.stringify(msg.data)
      }
    } catch (error) {
      // skip
    }
    return msg
  }, [])

  useEffect(() => {
    const decryptMsg = async () => {
      try {
        setDecryptedMsg(null)
        setIsLoading(true)
        const nostrBrowser = new NostrBrowser({ bchWallet: appData.wallet })
        const msgRead = await nostrBrowser.msgRead(message.txid)
        console.log('msgRead', msgRead)
        setMsgRead(msgRead)

        // decrypt message
        // Instantiate the encryptLib with the bchjs instance from the appData
        const encryptLib = new EncryptLib({ bchjs: appData.wallet.bchjs })

        console.log('this.bchWallet.walletInfo.privateKey', appData.wallet.walletInfo.privateKey)
        const messageHex = await encryptLib.encryption.decryptFile(
          appData.wallet.walletInfo.privateKey,
          msgRead.message
        )
        console.log('message hex', messageHex)

        const buf = Buffer.from(messageHex, 'hex')
        const decryptedMsg = buf.toString('utf8')
        // console.log('Message :', decryptedMsg)
        const msg = handleMsgData(decryptedMsg)
        setDecryptedMsg(msg)
        setIsLoading(false)
      } catch (error) {
        console.error('Error in decryptFile(): ', error)
        setIsLoading(false)
      }
    }
    console.log('message.message', message)
    if (!isLoading && !decryptedMsg) {
      decryptMsg()
    }
  }, [message.message, appData.wallet, decryptedMsg, isLoading, message, handleMsgData])

  return (

    <div className='message-read'>
      <div className='message-header'>
        <div className='message-header-content'>
          <div className='message-from'>
            <span className='label'>From:</span> {message.sender}
          </div>
          <div className='message-subject'>
            <span className='label'>Subject:</span> {message.subject}
          </div>
        </div>
        <OverlayTrigger
          placement='top'
          onClick={onClose}
          overlay={<Tooltip>Close message</Tooltip>}
        >
          <div className='close-button' onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </div>
        </OverlayTrigger>
      </div>
      {msgRead && (
        <>
          <div className='message-content'>
            <span>{decryptedMsg}</span>
          </div>
        </>
      )}
      {isLoading && (
        <div className='d-flex justify-content-center align-items-center message-content'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageRead
