import React, { useState, useRef, useEffect } from "react";
import styles from "./SelfProfileDisplaySelectedPhoto.module.css";
import { getSocket } from "../../utilits/socket";

const SelfProfileDisplaySelectedPhoto = ({selectedPhoto, setPhoto, photoIsSended, setPhotoIsSended}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    // Открываем окно отображения файлов, если они выбраны
    useEffect(() => {
        if (selectedPhoto.length > 0) {
            setModalIsOpen(true);
        }
    }, [selectedPhoto]);
     
    const closeModal = ()=>{
        setModalIsOpen(false);
        setPhoto([]);
    }

    const handleSubmitFiles = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        selectedPhoto.forEach((file)=>{
            formData.append("file", file);
        });
        console.log(Array.from(formData));
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/insert/profile/photo`, { //!исправить
                method: "POST",
                headers: {"token": `${token}`},
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`)
            }
            setPhotoIsSended(true);
            const data = await response.json();
            console.log(data.message);
            closeModal();
        } catch (error) {
            console.log(`Ошибка: ${error}`);
            closeModal();
            setPhotoIsSended(false);
        }
    };
    const renderFiles = ()=>{
        return selectedPhoto.map((file, index)=>{
            if (file.type.startsWith("image/")) {
                return(
                    <div key={index} className={styles["wrapper-image"]}>
                        {file.type.startsWith("image/") ? (<img src={URL.createObjectURL(file)} alt="Test Image" />):<></>}
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
                        <span>Добавить фото профиля</span>
                    </div>
                    <div className={styles["common-wrapper-images"]}>{renderFiles()}</div>
                    
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

export default SelfProfileDisplaySelectedPhoto;