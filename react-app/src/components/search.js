import React from 'react';
import SearchIcon from '@mui/icons-material/Search';

const Search = (props) => {
    return (
        <div id = "search" key={props.value}>
            <input value = {props.value} type = "search" onBlur={props.onBlur}></input>
            <SearchIcon></SearchIcon>
        </div>
    )
}
export default Search;