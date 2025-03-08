import React, { useState, useEffect } from "react";
import styles from "./Search.module.css";

const Search = ({setMessage, setShowSearchUsers, setShowMenu}) => {
    const openSearchUsers = function () {
        setShowSearchUsers(true);
        setMessage("");
    }
    const openMenu = function(){
        setShowMenu(true);
        setMessage("");
    }

    return(
            <>
                <button onClick={openMenu} className={styles["search-menu-button"]}><svg className={styles["search-menu-img"]} xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="25px" fill="#a8a5a5"><path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/></svg></button>
                <form onClick={openSearchUsers} className={styles["search-form"]}>
                    <input type="text" className={styles["search-input"]} placeholder="Поиск" />
                </form>
            </>
    );
};

export default Search;