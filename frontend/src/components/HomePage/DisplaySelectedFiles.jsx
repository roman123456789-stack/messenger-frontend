import React, { useState, useRef, useEffect } from "react";
import styles from "./DisplaySelectedFiles.module.css";
import { getSocket } from "../../utilits/socket";

const DisplaySelectedFiles = ({newMessage, setNewMessage, selectedFiles, selectedDialogue, setFiles}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isDocument, setIsDocument] = useState(false);
    const [isImageOrVideo, setIsImageOrVideo] = useState(false);
    const [filesIsSended, setFilesIsSended] = useState(false);
    const socket = getSocket();
    // Регистрируем новое сообщение 
        useEffect(() => {
            if (!socket) {
                return;
            }
            console.log(selectedDialogue.group_id);
            const handleNewMessage = (message) => {
                if (message.group_id === selectedDialogue.group_id) {
                    console.log("Новое медиасообщение:", message);
                    setNewMessage(message);
                }
            }; 
            socket.on("newMessage", handleNewMessage);
            setFilesIsSended(false);
            return () => {
              socket.off("newMessage", handleNewMessage);
            };
        }, [filesIsSended]);
    // Открываем окно отображения файлов, если они выбраны
    useEffect(() => {
        if (selectedFiles.length > 0) {
            setModalIsOpen(true);
        }
    }, [selectedFiles]);
     
    const closeModal = ()=>{
        setModalIsOpen(false);
        setFiles([]);
    }
    // Выбираем тип файлов
    useEffect(()=>{
        if (selectedFiles.length > 0) {
            if (selectedFiles[0].type.startsWith("image/") || selectedFiles[0].type.startsWith("video/")) {
                setIsImageOrVideo(true);
            } else {
                setIsDocument(true);
            }
        }
    }, [selectedFiles]);


    const handleSubmitFiles = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        selectedFiles.forEach((file)=>{
            formData.append("file", file);
        });
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/insert/files/${selectedDialogue.group_id}`, {
                method: "POST",
                headers: {"token": `${token}`},
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`)
            }
            setFilesIsSended(true);
            const data = await response.json();
            console.log(data);
            setFiles([]);
            setIsDocument(false);
            setIsImageOrVideo(false);
            setModalIsOpen(false);
        } catch (error) {
            console.log(`Ошибка: ${error}`);
            setModalIsOpen(false);
        }
    };
    const renderFiles = ()=>{
        return selectedFiles.map((file, index)=>{
            if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
                return(
                    <div key={index} className={styles["wrapper-image"]}>
                        {file.type.startsWith("image/") ? (<img src={URL.createObjectURL(file)} alt="Test Image" />) : (<video autoPlay loop src={URL.createObjectURL(file)} alt="Test Image"></video>)}
                        <label htmlFor="">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="30px"
                                viewBox="0 -960 960 960"
                                width="30px"
                                fill="none"
                            >
                                <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" />
                            </svg>
                        </label>
                    </div>
                );
            } else {
                return (
                    <div key={index} className={styles["wrapper-document"]}>
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
                        <div className={styles["filename"]}>{file.name}</div>
                        <div className={styles["filetype"]}>{(file.type).split("/")[1]}</div>
                        <div className={styles["filesize"]}>{(parseInt(file.size)/1_048_576).toFixed(3)} MБ</div>
                        <label htmlFor="">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="30px"
                                viewBox="0 -960 960 960"
                                width="30px"
                                fill="none"
                            >
                                <path d="M312-144q-29.7 0-50.85-21.15Q240-186.3 240-216v-480h-48v-72h192v-48h192v48h192v72h-48v479.57Q720-186 698.85-165T648-144H312Zm336-552H312v480h336v-480ZM384-288h72v-336h-72v336Zm120 0h72v-336h-72v336ZM312-696v480-480Z" />
                            </svg>
                        </label>
                    </div>
                );
            }
        })
    }
    if (modalIsOpen === true) {
        return (
            <div onClick={()=>{setModalIsOpen(false)}} className={styles["modal-overlay"]}>
                <div className={styles["container-files"]}>
                    <div onClick={closeModal} className={styles["label-sendfiles"]}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="24px"
                            viewBox="0 -960 960 960"
                            width="24px"
                            fill="#a8a5a5"
                        >
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                        </svg>
                        <span>Отправить файлы</span>
                    </div>
                    {isImageOrVideo ? (<div className={styles["common-wrapper-images"]}>{renderFiles()}</div>): (<div></div>)}
                    {isDocument ? (<div className={styles["common-wrapper-documents"]}>{renderFiles()}</div>): (<div></div>)}
                    
                    <div className={styles["sendfiles-footer"]}>
                        <button onClick={handleSubmitFiles} className={styles["sendfiles-footer-button"]}>
                            Отправить
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default DisplaySelectedFiles;