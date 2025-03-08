import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { disconnectSocket } from "../../utilits/socket";
import Settings from "./Settings";
import styles from "./LeftMenu.module.css";


const LeftMenu = ({setShowSelfProfile, showMenu, setShowMenu})=>{
    const [showSettings, setShowSettings] = useState(false);
    const navigate = useNavigate();
    const closeMenu = function(){
        setShowMenu(false);
    };
    const openSelfProfile = function(){
        closeMenu();
        setShowSelfProfile(true);
    };
    const openSettings = function(){
        setShowSettings(true);
    };
    const closeSettings = function(){
        setShowSettings(false);
    }
    const logout = function(){
        disconnectSocket();
        localStorage.removeItem("token");
        navigate("/autorization");
    };
    return (
        showSettings ? (<Settings closeSettings={closeSettings} showSettings={showSettings}/>) :
        showMenu && !showSettings ? (
            <div className={styles["wrapper-left-menu"]}>
                <div className={styles["wrapper-button"]}>
                    <button onClick={closeMenu} className={styles["search-menu-button"]}>
                        <svg className={styles["back-svg"]} xmlns="http://www.w3.org/2000/svg" 
                            height="30px" 
                            viewBox="0 -960 960 960" 
                            width="30px" 
                            fill="#a8a5a5">
                            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                        </svg>
                    </button>
                </div>
                {/* Пункт меню "Профиль" */}
                <div onClick={openSelfProfile} className={styles["profile"]}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="#a8a5a5"
                        className={styles["icon"]}
                    >
                        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/>
                    </svg>
                <div className={styles["menu-text"]}>Профиль</div>
                </div>
        
                {/* Пункт меню "Настройки" */}
                <div onClick={openSettings} className={styles["settings"]}>
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        className={styles["icon"]}
                        fill="#a8a5a5"
                    >
                        <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/>
                    </svg>
                <div className={styles["menu-text"]}>Настройки</div>
                </div>
                {/* Пункт меню поделиться с друзьями */}
                <div className={styles["share"]}>
                    <svg xmlns="http://www.w3.org/2000/svg" 
                        height="24px" 
                        viewBox="0 -960 960 960" 
                        width="24px" 
                        fill="#a8a5a5">
                            <path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z"/>
                    </svg>
                    <div className={styles["share-text"]}>Поделиться с друзьями</div>
                </div>
                {/* Пункт меню Выйти */}
                <div onClick={logout} className={styles["logout"]}>
                <svg xmlns="http://www.w3.org/2000/svg" 
                    height="24px" 
                    viewBox="0 -960 960 960" 
                    width="24px" 
                    fill="#EA3323">
                        <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
                </svg>
                    <div className={styles["logout-text"]}>Выйти из акканута</div>
                </div>
            </div>)
            : (<div>Меню не отображается</div>)
    )
}

export default LeftMenu;