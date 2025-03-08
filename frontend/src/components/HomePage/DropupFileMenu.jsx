import React, { useState, useRef, useEffect } from "react";
import styles from "./DropupFileMenu.module.css"; // Стили для выпадающего списка
import DisplaySelectedFiles from "./DisplaySelectedFiles";

const DropupFileMenu = ({setFiles}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropupRef = useRef(null);

    // Функция для переключения видимости списка
    const toggleDropup = () => {
        setIsOpen(!isOpen);
    };

    // Закрытие списка при клике вне его области
    const handleClickOutside = (event) => {
        if (dropupRef.current && !dropupRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    // Добавляем обработчик клика вне компонента
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelectPhotoAndVideo = (event) => {
        const files = event.target.files;
        console.log(files);
        if (files.length > 0) {
            setFiles(Array.from(files));
        }
        setIsOpen(false);
    };
    const handleSelectDocument = (event) => {
        const files = event.target.files;
        console.log(files);
        if (files.length > 0) {
            setFiles(Array.from(files));
        }
        setIsOpen(false);
    };

    return (
        <div className={`${styles["dropup-container"]} ${styles["message-attach-button"]}`} ref={dropupRef}>
            <label onClick={toggleDropup} className={styles["message-attach-button"]}><img className={styles["search-menu-img"]} src="images/attach.svg" alt=""/></label>
            {/* Выпадающий список */}
            {isOpen && (
                <div className={styles["dropup-content"]}>

                    <label htmlFor="PhotoOrVideoInput">
                            <input 
                                id="PhotoOrVideoInput"
                                type="file"
                                accept="image/*, video/*"
                                multiple 
                                style={{display: "none"}}
                                onChange={handleSelectPhotoAndVideo}
                            />
                            <img src="/images/attach_photo.svg"></img>&nbsp;Фото или Видео
                    </label>

                    <label htmlFor="Document">
                        <img src="/images/attach_document.svg"></img>&nbsp;Документ
                        <input 
                            id="Document"
                            type="file" 
                            multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.zip,.rar,.7z,.tar,.gz,.js,.ts,.py,.java,.c,.cpp,.h,.html,.css,.json,.xml,.md,.yaml,.yml,.env,.ini,.toml,.sql,.gitignore,.gitattributes,Dockerfile"
                            style={{display: "none"}}
                            onChange={handleSelectDocument}
                        />
                    </label>
                </div>
            )}
        </div>
    );
};

export default DropupFileMenu;