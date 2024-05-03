import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import SearchIcon from '@mui/icons-material/Search';

const Search = (props) => {
    return (
        <div id = "search">
            <input type = "search" onBlur={props.onBlur}></input>
            <SearchIcon></SearchIcon>
        </div>
    )
}
export default Search;