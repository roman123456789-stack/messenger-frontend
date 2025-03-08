import React, { useState } from "react";
import { getSocket } from "../../utilits/socket";
import styles from "./SearchUsers.module.css";
const SearchUsers = ({
    selectedUser, 
    setUser, 
    setShowSearchUsers, 
    setDialogue, 
    selectedDialogue,
    setShowMessages, 
    setShowProfile
}) => {
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");
    const token = localStorage.getItem("token");
    const close = function (){
        setShowSearchUsers(false);
        setUser([]);
    }
    const createGroup = async function(userId){
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/create/new/group/${userId}`, {
            method: "POST",
            headers:{
                "token": `${token}`,
            }
        });
        const data = await response.json();
        return data;
    }
    const setGroup = async (dialogue) => {
        try {
            setShowMessages(true);
            await new Promise((resolve) => {
                setDialogue([]); // Сбрасываем состояние
                setShowProfile(false);
                setTimeout(resolve, 50); // Даем React время обработать изменения
            });
            setDialogue(dialogue);
        } catch (error) {
            console.error("Ошибка установки диалога", error);
        }
    }
    const setUserInfo = async function(user){
        setUser(user);
        try {
            setDialogue([]);
            console.log(user);
            const userId = user.user_id;
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/check/group/is/exist/${userId}`, {
                method: "GET",
                headers: {
                    "token": `${token}`,
                }
            });

            if (!response.ok) {
                throw new Error("Ошибка запроса");
            }
            const data = await response.json();
            console.log(`Информация по запросу для существующего диалога ${data.group_id}`);

            if (data.group_id === null) {
                console.log("Диалог не существует");
                console.log("Создание диалога...");
                try {
                    const data = await createGroup(userId);
                    console.log(`Информация по запросу для созданного диалога ${data.group_id}`);
                    await setGroup(data);
                    const socket = getSocket();

                    console.log("Emitting newDialogue with dialogueId:", data.group_id);
                    socket.emit('newDialogue', data.group_id);
                    
                    return setShowSearchUsers(false);
                } catch (error) {
                    console.error(`Ошибка создания диалога ${error}`)
                }
            }
            
            try {
                console.log("Диалог существует");
                console.log("Диалог открывается...");
                setGroup(data);
                setShowSearchUsers(false);

            } catch (error) {
                console.log(error.message);
            }

        } catch (error) {
            console.log(error.message);
        }
    };
    const getUsers = async (data)=>{
        setQuery(data);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/search/${data}`, {
                method: "GET",
                headers: {
                    "token": `${token}`,
                }
            });
            if (!response.ok) {
                throw new Error("Ошибка получения данных");
            }
            const result = await response.json();
            setUsers(result);
        } catch (error) {
            console.warn(error);
        }
    }
 
    return(
        <>
            <div key={0} className={styles["search"]}>
                <button onClick={close} className={styles["search-menu-button"]}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#a8a5a5">
                        <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                    </svg>
                </button>
                <form onSubmit={(e)=>{e.preventDefault()}} className={styles["search-form"]}>
                    <input autoFocus onChange={(e)=>{getUsers(e.target.value)}} type="text" className={styles["search-input"]} placeholder="Поиск" />
                </form>
            </div>
                {users && users.length > 0 ? (
                    <div className={styles["results"]}>
                        {users.map((user, index) => (
                            <div key={index} onClick={()=>{setUserInfo(user)}} className={styles["container-result"]}>
                                <div className={styles["result-image"]}>
                                    <img src={user.image_path ? user.image_path : "images/no-image.jfif"} alt="" />
                                </div>
                                <div className={styles["result-name"]}>{user.user_initials}</div>
                                <div className={styles["result-nickname"]}>{user.user_nickname}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                       query ? (<div style={{textAlign: "center", color: "#a8a5a5"}}>Пользователи не найдены</div>) 
                       : (<div style={{textAlign: "center", color: "#a8a5a5"}}>Начните вводить ник @nickname или имя</div>) 
                    )}
            </>
        );
    };
    
export default SearchUsers;






