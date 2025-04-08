/*
  Implementing nostr natively in the browser, rather than using a library
  intended for node.js
*/

// Global npm libraries
// import { finalizeEvent } from '@chris.troutner/nostr-tools/pure'
// import { Relay } from '@chris.troutner/nostr-tools/relay'
// import BchNostr from 'bch-nostr'
// import * as nip19 from '@chris.troutner/nostr-tools/nip19'

import { finalizeEvent } from 'nostr-tools/pure'
import { Relay } from 'nostr-tools/relay'
import BchNostr from 'bch-nostr'
import * as nip19 from 'nostr-tools/nip19'
import WebSocket from 'ws'

class NostrBrowser {
  constructor (localConfig = {}) {
    if (!localConfig.bchWallet) {
      throw new Error('Instance of minimal-slp-wallet must be passed as wallet property when instantiating the bch-dex-lib library.')
    }

    this.bchWallet = localConfig.bchWallet

    this.bchNostr = new BchNostr({
      relayWs: 'wss://nostr-relay.psfoundation.info',
      topic: 'bch-dex-test-topic-01'
    })
  }

  // Send Message
  async buildMessage (inObj = {}) {
    try {
      // console.log('this.bchWallet: ', this.bchWallet)

      const { encryptedStr } = inObj
      // console.log('encryptedStr: ', encryptedStr)

      const wif = this.bchWallet.walletInfo.privateKey
      // const { privKeyBuf, nostrPubKey } =
      //   this.bchNostr.keys.createNostrPubKeyFromWif({ wif })
      const { privKeyBuf } =
        this.bchNostr.keys.createNostrPubKeyFromWif({ wif })

      const relayWs = 'wss://nostr-relay.psfoundation.info'

      const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: encryptedStr
      }
      // Sign the post
      const signedEvent = finalizeEvent(eventTemplate, privKeyBuf)
      // console.log('signedEvent: ', signedEvent)
      const eventId = signedEvent.id

      // Connect to a relay.
      const relay = await Relay.connect(relayWs, {
        webSocket: WebSocket
      })
      // console.log(`connected to ${relay.url}`)

      // Publish the message to the relay.
      await relay.publish(signedEvent)

      // Close the connection to the relay.
      relay.close()

      // const eventId = await this.bchNostr.post.uploadToNostr(inObj)

      const noteId = this.eventId2note(eventId)

      // const eventId = 'test1'
      // const noteId = 'test2'

      return { eventId, noteId }
    } catch (err) {
      console.log('Error in nostr.js/testNostrUpload()')
      throw err
    }
  }

  // Convert an Event ID into a `noteabc..` syntax that Astral expects.
  // This can be used to generate a link to Astral to display the post.
  eventId2note (eventId) {
    return nip19.noteEncode(eventId)
  }

  // Generate and broadcast a PS001 message signal.
  async sendMsgSignal (inObj) {
    const { addr, subject, eventId } = inObj

    // Create and broadcast a message signal on the BCH blockchain.
    const sendObj = {
      wallet: this.bchWallet,
      addr,
      subject,
      eventId
    }
    const { txid } = await this.bchNostr.signal.sendMsgSignal(sendObj)

    return { txid }
  }

  // Get address messages
  async checkMessages (limit = 0) {
    const checkObj = {
      wallet: this.bchWallet,
      addr: this.bchWallet.walletInfo.cashAddress,
      limit
    }

    const msgs = await this.bchNostr.signal.checkMsgs(checkObj)
    console.log('msgs: ', msgs)

    return msgs
  }

  // Read a message from a transaction id
  async msgRead (txid) {
    try {
      // Retrieve the encrypted message from the Nostr relay.
      const readObj = {
        txid,
        wallet: this.bchWallet
      }
      const result = await this.bchNostr.read.getNostrMsgFromTxid(readObj)
      console.log('result: ', result)
      return result
    } catch (error) {
      console.error('Error in msgRead()')
      throw error
    }
  }
}

export default NostrBrowser
