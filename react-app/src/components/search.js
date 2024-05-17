import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import {useRef, useEffect} from 'react';


const Search = (props) => {
    const searchRef = useRef(null);
    useEffect(() => {
        let inputElement = searchRef.current;
        if (props.value) {
            inputElement.value = props.value;
        }
    });

    function update(e) {
        let inputElement = searchRef.current;
        inputElement.value = e.target.value;
    }
    return (
        <div id = "search" key={props.value}>
            <input  ref={searchRef} type = "search" onChange={update} onBlur={props.onBlur}></input>
            <SearchIcon></SearchIcon>
        </div>
    )
}
export default Search;