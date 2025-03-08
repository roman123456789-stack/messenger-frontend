import React, { useEffect, useState } from "react";
import UserProfile from "./UserProfile";
import styles from "./Header.module.css";
const Header = ({
    selectedUser, 
    setUser, 
    setShowMessages, 
    selectedDialogue, 
    setDialogue, 
    setShowProfile}) =>
         
{
    const [lastDateAndStatus, setLastDateAndStatus] = useState([]);
    const token = localStorage.getItem("token");
    const closeDialogue = function() {
        setDialogue([]);
        setUser({});
    }
    const openProfile = function(){
        setShowMessages(false);
        setShowProfile(true);
    }
    const displayDate = function(date){
        const formatedDate = new Date(date).toLocaleString().split(",");
        const currentDate = new Date().toLocaleString().split(",");
        if (currentDate[0] === formatedDate[0]) {
            return formatedDate[1];
        }
        else{
            return formatedDate;
        }
    }
    useEffect(()=>{
        const getLastDateAndStatus = async function(){
            if (selectedDialogue) {
                try {
                    console.log(selectedDialogue);
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/status/other/user/${selectedDialogue.group_id}`, {
                        method: "GET",
                        headers: {"token": `${token}`}
                    });
                    const data = await response.json();
                    console.log(data);
                    if (!response.ok) {
                        throw new Error(`Ошибка получения статуса: ${data.message}`);
                    };
                    setLastDateAndStatus(data.result)
                } catch (error) {
                    console.log(error);
                }
            }
        };
        getLastDateAndStatus();
    }, []);
    return(
        <div className={styles["container-header"]}>
            <button onClick={closeDialogue} className={styles["header-back-button"]}><img src="../images/back.svg"/></button>
            <div onClick={openProfile} className={styles["header-user-image-div"]}>
                <img className={styles["header-user-image"]} src={( selectedDialogue.image_path ? selectedDialogue.image_path : (selectedUser.image_path ? selectedUser.image_path : "images/no-image.jfif"))} alt="" />
            </div>
            <div className={styles["header-username"]}>
                <p>{Object.keys(selectedUser).length > 0 ? selectedUser["user_initials"] : selectedDialogue["dialogue_name"]}</p>
            </div>
            <div className={styles["header-last-visit"]}>
                <p>{lastDateAndStatus["user_status"] === "offline" ? ("was there: " + displayDate(new Date(lastDateAndStatus["user_last_time"]))) : lastDateAndStatus["user_status"]}</p>
            </div>
            <div className={styles["header-call"]}>
                <button className={styles["header-call-button"]}><img className={styles["header-call-item"]} src="images/call.svg" alt="" /></button>
            </div>
            <div className={styles["header-search"]}>
                <button className={styles["header-search-button"]}><img className={styles["header-search-item"]} src="images/search.svg" alt="" /></button>
            </div>
        </div>
    );
};

export default Header;