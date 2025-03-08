import React, { useState, useEffect } from "react";
import { getSocket, initSocket } from "../../utilits/socket";
import styles from "./Dialogues.module.css";
import Histories from "./Histories";

const Dialogues = ({
    setUser, 
    setShowProfile, 
    setMessage, 
    setShowMessages, 
    setDialogue, 
    selectedDialogue,
    setShowSearchUsers, 
    newMessage,
}) => {
    const [dialogues, setDialogues] = useState([]); // Хранение данных диалогов
    const [loading, setLoading] = useState(true); // Статус загрузки
    let userId;// Id текущего юзера
    const socket = getSocket();
    // Получаем список диалогов
    const fetchDialogues = async () => {
        try {
            const token = localStorage.getItem("token");
                const response = await fetch(`${process.env.REACT_APP_API_URL}/home/api/dialogues`, {
                method: "GET", 
                headers: {"token": `${token}`}
            });
            const data = await response.json();

            userId = data.userId;

            data.dialogues.forEach((dialogue)=>{
                localStorage.removeItem(
                    `encryption_key_${dialogue.group_id}`,
                    dialogue.encryption_key
                );
                localStorage.setItem(
                    `encryption_key_${dialogue.group_id}`,
                    dialogue.encryption_key
                );
            })
            data.dialogues.forEach((dialogue)=>{
                const encryptionKey = localStorage.getItem(`encryption_key_${dialogue.group_id}`);
                if (dialogue.message) {
                    dialogue.message = decryptMessage(dialogue.message, encryptionKey);
                }
            })
            setDialogues(data.dialogues);
            // console.log("Загрузка данных успешна", data);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      } finally {
            setLoading(false);
      }
    };
    
    const openSearchUsers = function(){
        setShowSearchUsers(true);
        localStorage.removeItem("isSeenModal");
    };

    
       // Обновление диалогов
       useEffect(() => {
        if (!socket) return;

        // Обработчик нового сообщения
        const handleNewMessage = async (message) => {
            console.log("Получено новое сообщение:", message);
    
            // Получаем ключ шифрования для диалога
            const encryptionKey = localStorage.getItem(`encryption_key_${message.group_id}`);
            if (!encryptionKey) {
                console.error(`Encryption key not found for dialogue ${message.group_id}`);
                return;
            }
    
            // Расшифровываем сообщение
            try {
                if (message) {
                    message.message = await decryptMessage(message.message, encryptionKey);
                }
            } catch (error) {
                console.error("Ошибка расшифровки сообщения:", error);
                return;
            }
            // Обновляем существующий диалог
            setDialogues((prevDialogues) =>
                prevDialogues
                    .map((dialogue) => {
                        if (dialogue.group_id === message.group_id) {
                            console.log(`Обновляем диалог ${message.group_id}`);
                            console.log(userId, message);
                            console.log(dialogue.count_unread_messages + 1);
                            return {
                                ...dialogue,
                                message: message.message || null,
                                sended_at: message.sended_at || dialogue.sended_at,
                                user_initials: message.user_initials || dialogue.user_initials,
                                media_type: message.media_type || dialogue.media_type,
                                count_unread_messages: userId !== message.user_id
                                    ? ((dialogue.count_unread_messages ?? 0) + 1)
                                    : undefined
                            };
                        }
                        return dialogue;
                    })
                    .sort((a, b) => new Date(b.sended_at) - new Date(a.sended_at))
            );
        };

        // Обработчик нового диалога с новым сообщением
        const handleUpdateDialogues = (newDialogueId) => {
            console.log("Получен новый диалог:", newDialogueId);
            socket.emit("newDialogue", newDialogueId);
            fetchDialogues();
        };

        // Подписываемся на события WebSocket
        socket.on("newMessage", handleNewMessage);
        socket.on("updateDialogues", handleUpdateDialogues);

        // Очистка подписок при размонтировании
        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("updateDialogues", handleUpdateDialogues);
        };
    }, [socket]);
    
    useEffect(() => {
        fetchDialogues();
        console.log(`ДИАЛОГИ ЗАГРУЖЕНЫ`);
    }, []);
    
    if (loading) {
        return <div className={styles["wrapper-loading"]}><svg className={styles["loading"]} xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M482-160q-134 0-228-93t-94-227v-7l-64 64-56-56 160-160 160 160-56 56-64-64v7q0 100 70.5 170T482-240q26 0 51-6t49-18l60 60q-38 22-78 33t-82 11Zm278-161L600-481l56-56 64 64v-7q0-100-70.5-170T478-720q-26 0-51 6t-49 18l-60-60q38-22 78-33t82-11q134 0 228 93t94 227v7l64-64 56 56-160 160Z"/></svg></div>;
    }
// Выбираем диалог
    const handleClickDialogue = async (dialogue) => {
        try {
            console.log("Вызвался handleClickDialogue!");
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/set/messages/is/readed/${dialogue.group_id}`, {
                method: "POST",
                headers: {"token": `${token}`},
            });
            if (!response.ok) {
                console.error("Ошибка при сбросе количества непрочитанных сообщений");
            }
        } catch (error) {
            console.error("Ошибка", error);
        }finally{
            setUser([]);
            setShowMessages(true);
            await new Promise((resolve) => {
                setMessage("");
                setDialogue([]); // Сбрасываем состояние
                setShowProfile(false);
                setTimeout(resolve, 50); // Даем React время обработать изменения
            });
            setDialogue(dialogue);
        }
    }
    
    return(
        <div className={styles["common-wrapper-dialogues"]}>
            <Histories/>
            {dialogues?.length > 0 ? ( 
                dialogues.map((dialogue) => (
                    <div key={dialogue.group_id} className={styles["container-dialogue"]} onClick={()=>{handleClickDialogue(dialogue)}}>
                        <div className={styles["dialogue-image-div"]}>
                            <img src={dialogue.image_path || "/images/no-image.jfif"} className={styles["dialogue-image"]} alt="" />
                        </div>
                        <div className={styles["dialogue-name"]}>
                            <p>{dialogue.dialogue_name}</p>
                        </div>
                        <div className={styles["dialogue-last-message"]}>
                            <div className={styles["dialogue-last-message-sender"]}>
                                <p>{dialogue.user_initials}:&nbsp;</p>
                            </div>
                            <div className={styles["dialogue-last-message-text"]}>
                            <p>
                                {dialogue.message 
                                    ? dialogue.message 
                                    : dialogue.media_type 
                                    ? (dialogue.media_type.startsWith("image/") 
                                        ? "Фото" 
                                        : dialogue.media_type.startsWith("video/") 
                                            ? "Видео" 
                                            : "Документ")
                                    : "Нет сообщения"}
                            </p>
                            </div>
                            
                        </div>
                        <div className={styles["dialogue-time-last-message"]}>
                            <p>{new Date(dialogue.sended_at).toLocaleTimeString().slice(0, 5)}</p>
                        </div>
                        {
                            dialogue.count_unread_messages ? (
                            <div className={styles["dialogue-count-unread-messages"]}>
                                <div className={styles["inner-unread-messages"]}>{dialogue.count_unread_messages}</div>
                            </div>) : <></>
                        }
                        <input value={dialogue.group_id} type="hidden" />
                    </div>                      
                ))) 
                : (
                    localStorage.getItem("isSeenModal") ? (<div className={styles["overlay"]}>
                        <div onClick={openSearchUsers}
                            className={styles["no-dialogues"]}>
                                <p className={styles["no-dialogues-text"]}>Начать общение</p>
                        </div>
                    </div>) : (<div></div>)
                )
            }
        </div>

    );
};

export default Dialogues;

async function decryptMessage(encryptedMessage, encryptionKeyHex) {
    try {
        const keyArray = new Uint8Array(
            Array.from(encryptionKeyHex.match(/.{2}/g), (byte) => parseInt(byte, 16))
        );

        const [ivHex, contentHex] = encryptedMessage.split(":");
        const iv = new Uint8Array(
            Array.from(ivHex.match(/.{2}/g), (byte) => parseInt(byte, 16))
        );
        const content = new Uint8Array(
            Array.from(contentHex.match(/.{2}/g), (byte) => parseInt(byte, 16))
        );

        const importedKey = await window.crypto.subtle.importKey(
            "raw",
            keyArray,
            { name: "AES-CBC" },
            false,
            ["decrypt"]
        );

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: iv,
            },
            importedKey,
            content
        );
        if (!decrypted) {
            return null;
        }
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    } catch (error) {
        console.error("Ошибка расшифровки:", error);
        return encryptedMessage; // Возвращаем зашифрованное сообщение при ошибке
    }
}
