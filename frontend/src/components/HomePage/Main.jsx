import React, { useEffect, useRef, useState } from "react";
import {getSocket} from "../../utilits/socket";
import styles from "./Main.module.css";

const Main = ({ newMessage,
    setNewMessage, 
    setMessage, 
    selectedUser, 
    setUser, 
    setDialogue, 
    selectedDialogue,
}) => 
    {

    const [modalIsOpen, setModalIsOpen] = useState(false);// Модальное окно выбранных файлов
    const [selectedFile, setSelectedFile] = useState([]);// Выбранный файл
    const [showButton, setShowButton] = useState(false);//Показать кнопку скролла вниз в сообщениях
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const [messagesList, setMessagesList] = useState([]);// Храним новое сообщение
    const [userId, setUserId] = useState(null);
    const [hasMore, setHasMore] = useState(true); // Есть ли еще сообщения для загрузки
    const [limit, setLimit] = useState(20); // Количество сообщений на странице
    const [offset, setOffset] = useState(0); // Смещение для текущей страницы
    
    const socket = getSocket();
    const openModal = function(message){
        setModalIsOpen(true);
        setSelectedFile(message);
    }
    const closeModal = function(){
        setModalIsOpen(false);
        setSelectedFile([]);
    }
    
    useEffect(() => {
        const loadInitialMessages = async (dialogue) => {
            if (!dialogue || messagesList.length > 0) return; // Если уже есть сообщения, не загружаем заново
    
            try {
                console.log(`Загрузка сообщений из диалога id=#${dialogue.group_id}`);
                const token = localStorage.getItem("token");
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/api/messages/${dialogue.group_id}?limit=${limit}&offset=${offset}`,
                    { method: "GET", headers: { token } }
                );
                const data = await response.json();
                console.log("ВЫВОД!!!!!", data);
                if (data.messages.length < limit) {
                    setHasMore(false); // Если полученных сообщений меньше, чем лимит, значит больше нет
                }
                setUserId(data.userId);
                const decryptedMessages = await Promise.all(
                    data.messages.map(async (message) => {
                        if (!message.message) return message; // Пропускаем медиа-сообщения
                        const encryptionKey = localStorage.getItem(`encryption_key_${message.group_id}`);
                        const decryptedContent = await decryptMessage(message.message, encryptionKey);
                        return { ...message, message: decryptedContent };
                    })
                );
                const decryptedMessagesSorted = decryptedMessages.sort((a, b) => a.message_id - b.message_id);
                setMessagesList(decryptedMessagesSorted);
            } catch (error) {
                console.error("Ошибка загрузки сообщений:", error);
            }
        };
    
        loadInitialMessages(selectedDialogue);
    }, [socket, selectedDialogue]);

    // Обработка прокрутки для загрузки старых сообщений
    useEffect(() => {
        const target = document.getElementById("main");
        if (!target) return;
        console.log(target.scrollTop, hasMore);
        const handleScroll = async () => {
            if (target.scrollTop === 0 && hasMore) {
                await loadMoreMessages();
            }
        };

        target.addEventListener("scroll", handleScroll);

        return () => {
            target.removeEventListener("scroll", handleScroll);
        };
    }, [hasMore, offset]);

    // Загрузка дополнительных сообщений
    const loadMoreMessages = async () => {
        if (!hasMore) return;
    
        try {
            const target = document.getElementById("main");
            if (!target) return;
    
            // Сохраняем текущую позицию скролла
            const currentScrollTop = target.scrollTop;
            const scrollHeightBefore = target.scrollHeight;
    
            const currentOffset = offset;
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/api/messages/${selectedDialogue.group_id}?limit=${limit}&offset=${currentOffset + limit}`,
                { method: "GET", headers: { token: localStorage.getItem("token") } }
            );
            const data = await response.json();
    
            if (data.messages.length < limit) {
                setHasMore(false);
            }
    
            const decryptedMessages = await Promise.all(
                data.messages.map(async (message) => {
                    if (!message.message) return message;
                    const encryptionKey = localStorage.getItem(`encryption_key_${message.group_id}`);
                    const decryptedContent = await decryptMessage(message.message, encryptionKey);
                    return { ...message, message: decryptedContent };
                })
            );
    
            const decryptedMessagesSorted = decryptedMessages.sort((a, b) => a.message_id - b.message_id);
    
            // Добавляем новые сообщения в начало списка
            setMessagesList((prevMessages) => [...decryptedMessagesSorted, ...prevMessages]);
    
            // Восстанавливаем позицию скролла
            setTimeout(() => {
                if (target) {
                    let totalRect = 0;
                    //Высота новых сообщений
                    decryptedMessagesSorted.forEach((message)=>{
                        const target = document.getElementById(`message-${message.message_id}`);
                        totalRect += target.getBoundingClientRect().height + 10;
                    });
                    console.log(totalRect);
                    target.scrollTop = currentScrollTop + totalRect;
                }
            }, 10);
    
            // Обновляем offset после успешной загрузки
            setOffset((prevOffset) => prevOffset + limit);
        } catch (error) {
            console.error("Ошибка загрузки дополнительных сообщений:", error);
        }
    };

    useEffect(()=>{ 
        setNewMessage({});
    }, [selectedDialogue]);

// Ждем новое сообщение 
    useEffect(() => {
        if (!socket) {
            return;
        }
        const handleNewMessage = async (message) => {
            console.log(selectedDialogue.group_id);
            console.log("ДОЖДАЛИСЬ НОВОЕ СООБЩЕНИЕ!!!!!", message);
            if (message.group_id === selectedDialogue.group_id) {
                console.log("Новое сообщение:", message);
                let encryptionKey = localStorage.getItem(`encryption_key_${message.group_id}`);
                if (!encryptionKey) {
                    setTimeout(async() => {
                        encryptionKey = localStorage.getItem(`encryption_key_${message.group_id}`);
                        const decryptedMessage = await decryptMessage(message.message, encryptionKey);
                        message.message = decryptedMessage;
                        setNewMessage(message);
                    }, 500);
                    return;
                }
                const decryptedMessage = await decryptMessage(message.message, encryptionKey);
                message.message = decryptedMessage;
                setNewMessage(message);
            }
        }; 
        socket.on("newMessage", handleNewMessage);
       
        return () => {
          socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedFile]);
    
// Добавляем новое сообщение
    useEffect(() => {
        console.log(newMessage);
        if (!newMessage || !newMessage.sended_at || (!newMessage.media_id && !newMessage.message)) {
            return;
        }
        console.log(newMessage.group_id, selectedDialogue.group_id);
        if (newMessage.group_id === selectedDialogue.group_id) {
            console.log(`Сообщение вставлено в диалог ${newMessage.group_id}`);
            setMessagesList((prevMessages)=>{
                const updatedMessages = [...prevMessages, newMessage];
                console.log(updatedMessages);
                return updatedMessages
            });
            setMessage("");
        }
    }, [newMessage]);

    // Скроллим до <div id="last-message-..."> при открытии диалога и отправке нового сообщения
    useEffect(()=>{
        setTimeout(()=>{
            const lastMessageElement = document.getElementById(`last-message-${selectedDialogue.group_id}`);
            if (lastMessageElement) {
                lastMessageElement.scrollIntoView({behavior: "smooth", block: "end"});
            }
        }, 1000)
    }, [newMessage]);

// Показываем ли кнопку ручного скролла
    useEffect(()=>{

        const target = document.getElementById("main");
        if (!target) return;
        const scrollable = target.scrollHeight > target.clientHeight;
        const handleScroll = () => {
            const currentScrollTop = target.scrollTop;
            if (currentScrollTop < lastScrollTop) {
                setShowButton(true);
            } else {
                setShowButton(false);
            }
            setLastScrollTop(currentScrollTop);
        };
        if (scrollable) {
            target.addEventListener("scroll", handleScroll);
            return () => {
                target.removeEventListener("scroll", handleScroll);
            };
        }
        else{
            setShowButton(false);
            return;
        }
    }, [lastScrollTop, messagesList]);

    if (userId && messagesList.length > 0) {
        return(
            <div id="container-main" className={styles["container-main"]}>
                {messagesList.map((message, index) => {
                        return(
                            // Если текстовые сообщения
                            !message.media_id ? 
                                (<div key={index} id={`message-${message.message_id}`} className={message.user_id === userId ? (styles["main-sender"]) : (styles["main-recipient"])}>
                                    <p className={styles["time-inner-message"]}>{message.message}</p>
                                    {new Date(message.sended_at).toLocaleTimeString().slice(0, 5)}
                                </div>)
    
                            // Если медиа
                            :(
                                // Если изображение
                                message.media_type.startsWith("image") ? (
                                    <div key={index} id={`message-${message.message_id}`} className={message.user_id === userId ? (styles["main-sender"]) : (styles["main-recipient"])}>
                                        <img onClick={()=>{openModal(message)}} src={message.media_path} alt="" />
                                        <div className={styles["time-inner-image"]}>{new Date(message.sended_at).toLocaleTimeString().slice(0, 5)}</div>
                                    </div>
                                ) : 
                                    (
                                        // Если видео
                                        message.media_type.startsWith("video") ? (
                                            <div key={index} id={`message-${message.message_id}`} className={message.user_id === userId ? (styles["main-sender"]) : (styles["main-recipient"])}>
                                                <video onClick={()=>{openModal(message)}} autoPlay loop src={message.media_path}></video>
                                                <div className={styles["time-inner-video"]}>{new Date(message.sended_at).toLocaleTimeString().slice(0, 5)}</div>
                                            </div>
                                        ) 
                                        // Если документ
                                        : (<div key={index} id={`message-${message.message_id}`} className={message.user_id === userId ? (styles["main-sender"]) : (styles["main-recipient"])}>
                                                <div className={styles["time-inner-message"]}>
                                                    <div className={styles["wrapper-file"]}>
                                                        <a href={message.media_path} download>
                                                            <svg
                                                                className={styles["document-image"]}
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                height="55px"
                                                                viewBox="0 -960 960 960"
                                                                width="55px"
                                                                fill="#5f6368"
                                                            >
                                                                <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z" />
                                                            </svg>
                                                        </a>
                                                        <div className={styles["filename"]}>{message.media_name}</div>
                                                        <div className={styles["filetype"]}>{(message.media_type).split("/")[1]}</div>
                                                        <div className={styles["filesize"]}>{message.media_size} MБ</div>
                                                    </div>
                                                    
                                                </div>
                                                {new Date(message.sended_at).toLocaleTimeString().slice(0, 5)}
                                            </div>
                                        )
                                    )
                            )
                        )
                })}
                {modalIsOpen && selectedFile && (
                    <div className={styles["modal-overlay"]} onClick={closeModal}>
                        <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>

                            {/* Если выбрано изображение */}
                            {selectedFile.media_type.startsWith("image") && (
                                <img src={selectedFile.media_path} alt="" className={styles["modal-media"]} />
                            )}

                            {/* Если выбрано видео */}
                            {selectedFile.media_type.startsWith("video") && (
                                <video controls autoPlay src={selectedFile.media_path} className={styles["modal-media"]} />
                            )}

                            {/* Кнопка закрытия */}
                            <button className={styles["close-button"]} onClick={closeModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#fff"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
                            </button>
                        </div>
                    </div>
                )}
                <div id={`last-message-${selectedDialogue.group_id}`} style={{paddingTop: "30px"}}/>
                <a style={{display: showButton ? "block" : "none"}} href={`#last-message-${selectedDialogue.group_id}`}>
                    <div className={styles["wrapper-button-down"]}>
                        <div className={styles["button-down"]}>
                            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#fff"><path d="M480-200 240-440l56-56 184 183 184-183 56 56-240 240Zm0-240L240-680l56-56 184 183 184-183 56 56-240 240Z"/></svg>
                        </div>
                    </div>
                </a>
            </div>
        );
    }

};

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
export default Main;