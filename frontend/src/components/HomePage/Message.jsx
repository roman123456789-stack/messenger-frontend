import React, { useEffect, useState } from "react";
import styles from "./Message.module.css";
import DropupFileMenu from "./DropupFileMenu";
import DisplaySelectedFiles from "./DisplaySelectedFiles";

const Message = ({
    newMessage, 
    setNewMessage, 
    selectedUser, 
    setUser, 
    setMessage, 
    message, 
    selectedDialogue, 
    showMenu, 
    showSearchUsers
}) => {
    const [selectedFiles, setFiles] = useState([]); //Выбранные файлы
    const [isSubmited, setIsSubmited] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/insert/message/${selectedDialogue.group_id}`, {
                method: "POST",
                headers: {"token": `${token}`, "Content-Type": "application/json",},
                body: JSON.stringify({"message": `${message}`}),
            });
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`)
            }
            setMessage("");
            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.log(`Ошибка: ${error}`);
        }
    };
    
    return(
        <div id={`${selectedDialogue.group_id}`} key={`${selectedDialogue.group_id}`} className={styles["container-message"]}>
            <div className={styles["message-emoji-button"]}><img className={styles["search-menu-img"]} src="images/emoji.svg" alt="" /></div>
            <DropupFileMenu 
                selectedDialogue={selectedDialogue} 
                selectedFiles={selectedFiles} 
                setFiles={setFiles}
            />
            {selectedFiles.length > 0 && (
                <DisplaySelectedFiles 
                    newMessage={newMessage} 
                    setNewMessage={setNewMessage} 
                    selectedFiles={selectedFiles} 
                    selectedDialogue={selectedDialogue} 
                    setFiles={setFiles}
                />)
            }
            <form onSubmit={handleSubmit} className={styles["message-form"]}>
                <input className={styles["message-input"]} id="message-input" value={message} onChange={(e)=>{setMessage(e.target.value)}} type="text" placeholder="Message" autoComplete="off"/>
                <button className={styles["button-submit"]} type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        height="30px" 
                        viewBox="0 -960 960 960" 
                        width="30px" 
                        fill="#a8a5a5">
                            <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z"/>
                        </svg>
                </button>
            </form>
            <div className={styles["message-micro-button"]}><img style={{paddingLeft: '5px'}} className={styles["search-menu-img"]} src="images/micro.svg" alt="" /></div>
            <input type="hidden" value={`${selectedDialogue.group_id}`}/>
        </div>
    );
};

export default Message;