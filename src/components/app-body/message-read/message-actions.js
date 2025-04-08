import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import {
  faSync,
  faAngleLeft,
  faAngleRight
} from '@fortawesome/free-solid-svg-icons'

const MessageActions = (props) => {
  const { onRefresh, onPageChange, totalPages, currentPage } = props

  const handlePageChange = (newPage) => {
    onPageChange(newPage)
  }

  return (
    <div className='message-actions'>

      <OverlayTrigger placement='top' overlay={<Tooltip>Refresh</Tooltip>}>
        <button><FontAwesomeIcon icon={faSync} onClick={onRefresh} /></button>
      </OverlayTrigger>
      <span className='pagination'>{currentPage} / {totalPages}</span>
      <OverlayTrigger placement='top' overlay={<Tooltip>Previous</Tooltip>}>
        <button
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <FontAwesomeIcon icon={faAngleLeft} />
        </button>
      </OverlayTrigger>
      <OverlayTrigger placement='top' overlay={<Tooltip>Next</Tooltip>}>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <FontAwesomeIcon icon={faAngleRight} />
        </button>
      </OverlayTrigger>
    </div>
  )
}

export default MessageActions
