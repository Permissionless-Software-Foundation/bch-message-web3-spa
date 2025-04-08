import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

const SearchBar = (props) => {
  const { onSearch } = props
  return (
    <div className='search-bar'>
      <input type='text' placeholder='Search Mail By Subject' onChange={(e) => onSearch(e.target.value)} />
      <button className='search-button'>
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </div>
  )
}

export default SearchBar
