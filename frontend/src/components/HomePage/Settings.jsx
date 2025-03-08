import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { disconnectSocket } from "../../utilits/socket";
import styles from "./Settings.module.css";

const Settings = ({showSettings, closeSettings})=>{
    const today = new Date();
    const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const navigate = useNavigate();
    const [initialNickname, setInitialNickname] = useState("");
    const [initialUsername, setInitialUsername] = useState("");
    const [initialBirthday, setInitialBirthday] = useState("");
    const [inavlidNicknameError, setInvalidNicknameError] = useState("");
    const [inavlidUsernameError, setInvalidUsernameError] = useState("");
    const [responseIsOk, setResponseIsOk] = useState(false);
    const [formData, setFormData] = useState({});
    const regex = /^[a-zA-Z0-9_@]+$/;
    const regexUsername = /^[a-zA-Z0-9а-яА-Я](?:[a-zA-Z0-9а-яА-Я]| (?=[a-zA-Z0-9а-яА-Я]))*$/u;
    // Форматирование даты дня рождения
    function formatDateToISO(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы нумеруются с 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    // Загрузка из базы данных
    useEffect(()=>{
        try {
            const token = localStorage.getItem("token");
            const getProfileData = async function(){
                const response = await fetch((`${process.env.REACT_APP_API_URL}/api/get/self/profile`),{
                    method: "GET",
                    headers: {
                        "token": `${token}`,
                    }
                });
                if (!response.ok) {
                    console.log(response.status);
                    throw new Error("Ошибка получения данных");   
                };
                const data = await response.json();
                console.log(data);
                setFormData({
                    user_initials: data.user.user_initials || "",
                    user_birthday: data.user.user_birthday || "",
                    user_bio: data.user.user_bio || "",
                    user_nickname: data.user.user_nickname || ""
                });
                setInitialNickname(data.user.user_nickname || "");
                setInitialUsername(data.user.user_initials || "");
                setInitialBirthday(data.user.user_birthday || "");
                console.log(initialBirthday);
            } 
            getProfileData();
        } catch (error) {
            console.error(error.message);
        }
    }, [showSettings]);

    // Проверка никнейма
    const checkNickname = async function(nickname) {
        try {
            if (nickname.startsWith("@")) {
                if (nickname.length < 6) {
                    setInvalidNicknameError("Никнейм должен быть длиннее 5 символов");
                    return;    
                }
                if (!regex.test(nickname)) {
                    setInvalidNicknameError("Никнейм может содержать только символы a-z, A-Z и _");
                    return;
                }
                if (nickname.indexOf("@") !== nickname.lastIndexOf("@")) {
                    setInvalidNicknameError("@ только в начале");
                    return;
                }
                const token = localStorage.getItem("token");
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/check/nickname/is/valid/${nickname}`, {
                    headers: {"token": `${token}`},
                });
                if (!response.ok) {
                    throw new Error("Ошибка сервера");    
                }
                const data = await response.json();
                if (data.user === null) {
                    setInvalidNicknameError("");
                }
                else{
                    setInvalidNicknameError("Никнейм уже существует");
                }
            }
            else{
                setInvalidNicknameError("Никнейм должен начинаться с @");
                return;
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    // Проверка имени пользователя
    const checkUsername = function(username) {
        try {
            if (!regexUsername.test(username)) {
                setInvalidUsernameError("Имя некорректно");
                return;
            }
            setInvalidUsernameError("");
        }
        catch (error) {
            console.log(error.message);
        }
    }

    // Сохраняем данные формы
    const handleChange = async function(e){
        try {
            const {name, value} = e.target;
            setFormData((prev)=>({
                ...prev, 
                [name]: value,
            }));
            if (e.target.name === "user_nickname" && e.target.value !== initialNickname) {
                await checkNickname(e.target.value);
            }
            if (e.target.name === "user_initials") {
                checkUsername(e.target.value);
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    // Ручное отправление данных    
    const handleSubmit = async function(e){
        e.preventDefault();
        try {
            if (inavlidNicknameError.length === 0 && inavlidUsernameError.length === 0) {
                const token = localStorage.getItem("token");
                if (initialBirthday === "" && formData.user_birthday !== "") {
                    formData.user_birthday = (new Date(formData.user_birthday)).toISOString().split("T")[0];
                }
                const updatedFields = JSON.stringify(formData);
                console.log(updatedFields);
                const setProfileData = async function(){
                    const response = await fetch((`${process.env.REACT_APP_API_URL}/api/update/self/profile/${updatedFields}`),{
                        method: "POST",
                        headers: {
                            "token": `${token}`,
                        }
                    });
                    if (!response.ok) {
                        console.log(response.status);
                        setResponseIsOk(false);
                        throw new Error("Ошибка получения данных");   
                    };
                    setResponseIsOk(true);
                    const data = await response.json();
                } 
                setProfileData();
            }
            else{
                return;
            }
        } catch (error) {
            console.error(error.message);
        }
    }
    // Удаление акканута
    const deleteAccount = function(){
        try {
            const token = localStorage.getItem("token");
            const response = fetch(`${process.env.REACT_APP_API_URL}/api/delete/account`, {
                method: "POST",
                headers: {"token": `${token}`},
            });
            if (response.ok) {
                throw new Error("Ошибка удаления профиля");
            }
            disconnectSocket();
            navigate("/");
            return localStorage.removeItem("token");
            
        } catch (error) {
            console.log(error.message);
        }
    }
    return (
        showSettings ? (
            <div className={styles.container}>
                <div className={styles["wrapper-button"]}>
                    <button onClick={closeSettings} className={styles["search-menu-button"]}>
                        <svg className={styles["back-svg"]} xmlns="http://www.w3.org/2000/svg" 
                            height="30px" 
                            viewBox="0 -960 960 960" 
                            width="30px" 
                            fill="#a8a5a5">
                            <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
                        </svg>
                    </button>
                </div>
                <h2>Изменить данные профиля</h2>
                {responseIsOk ? (responseIsOk ? <h3 style={{color: "green", textAlign: "center", paddingBottom: "10px"}}>Данные успешно изменены</h3> : <h3 style={{color: "red", textAlign: "center", paddingBottom: "10px"}}>Ошибка изменения данных</h3>) : (<div></div>)}
                <div className={styles.wrapper}>
                    <div className={styles.field}>
                        <input
                            onChange={(e)=>{handleChange(e)}}
                            className={styles.input}
                            name="user_initials"
                            value={formData.user_initials}
                            placeholder="Имя"
                            type="text"
                        />
                        {formData.user_username === initialUsername ? 
                            (<div></div>) : 
                            (inavlidUsernameError ? <div style={{color: "red", width: "80%"}}>{inavlidUsernameError}</div> : <div></div>)
                        }
                    </div>
                    <div className={styles.field}>
                        <input
                            onChange={(e)=>{handleChange(e)}}
                            className={styles.input}
                            name="user_nickname"
                            value={formData.user_nickname}
                            placeholder="@nickname"
                            type="text"
                        />
                        {formData.user_nickname === initialNickname ? 
                            (<div></div>) : 
                            (inavlidNicknameError ? <div style={{color: "red", width: "80%"}}>{inavlidNicknameError}</div> : <div style={{color: "green"}}>Никнейм свободен</div>)
                        }
                    </div>
                    {!initialBirthday ? (
                        <div className={styles.field}>
                            <input
                                onChange={(e)=>{handleChange(e)}}
                                className={styles.input}
                                value={formData.user_birthday}
                                name="user_birthday"
                                placeholder="День рождения"
                                type="date"
                                />
                        </div>
                    ) : (
                        <div className={styles.field}>
                                <input
                                    className={styles.input}
                                    value={formatDateToISO(formData.user_birthday)}
                                    name="user_birthday"
                                    type="date"
                                    max={maxDate}
                                    disabled
                                />
                            </div>
                    )}
                    <div className={styles.field}>
                        <input
                            onChange={(e)=>{handleChange(e)}}
                            className={styles.input || "none"}
                            name="user_bio"
                            value={formData.user_bio}
                            placeholder="О себе"
                            type="text"
                        />
                    </div>
                </div>
                <div className={styles["wrapper-button-submit"]}>
                    <button onClick={(e)=>{handleSubmit(e)}} type="submit">Сохранить</button>
                </div>
                <div className={styles["wrapper-button-submit"]}>
                    <button onClick={deleteAccount} style={{backgroundColor: "red"}} type="submit">Удалить акканут</button>
                </div>
            </div>) : (<div>Загружаем настройки</div>)
    );
};

export default Settings;