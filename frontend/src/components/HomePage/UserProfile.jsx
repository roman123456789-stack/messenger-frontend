import React, { useState, useRef, useEffect } from "react";
import styles from "./UserProfile.module.css";
const UserProfile = ({selectedDialogue, setShowMessages, showProfile, setShowProfile }) => {
    const [profile, setProfile] = useState([]);
    const [profileImages, setProfileImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    function formatDateToISO(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы нумеруются с 0
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    const handlePrev = function (){
        const newIndex = currentIndex === 0 ? profileImages.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const handleNext = function(){
        const newIndex = currentIndex === profileImages.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };
    const closeProfile = function(){
        setShowProfile(false);
        setShowMessages(true);
    }
    useEffect(()=>{
        const token = localStorage.getItem("token");
        try {
            const getProfile = async function(){
                const response = await fetch((`${process.env.REACT_APP_API_URL}/api/get/user/profile/${selectedDialogue.group_id}`),{
                    method: "GET",
                    headers: {
                        "token": `${token}`,
                    }
                });
                if (!response.ok) {
                    throw new Error("Ошибка получения данных");   
                };
                const data = await response.json();
                setProfile(data.user);
                setProfileImages(data.userImages);
            }
            getProfile();
        } 
        catch (error) {
            console.error(error.message);
        }

    }, [showProfile])
    return (
        showProfile && profile ? (
            <>
                <div className={styles["user-images"]}>
                    <div 
                        id="customCarousel" 
                        className={`${styles["carousel"]} carousel slide`} 
                        data-bs-ride="carousel"
                    >
                        {/* Индикаторы */}
                        {profileImages.length > 1 ? 
                            (
                                <div className={`${styles["carousel-indicators"]}`}>
                                    {[...Array(profileImages.length).keys()].map((index) => (
                                        <button 
                                            key={index} 
                                            type="button" 
                                            onClick={() => setCurrentIndex(index)}
                                            className={`${index === currentIndex ? styles["active"] : ""}`} 
                                            aria-current={index === currentIndex ? 'true' : undefined} 
                                            aria-label={`Слайд ${index + 1}`}
                                        ></button>
                                    ))}
                                </div>
                            ) : (<div></div>)
                        }
                        

                         {/* Слайды */}
                        <div className={`${styles["carousel-inner"]} carousel-inner`} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                            {profileImages.length > 0 ? 
                                (
                                    profileImages.map((image, index)=>(
                                        <div key={index} className={`${styles["carousel-item"]} carousel-item`}>
                                            <img 
                                                src={image.image_path} 
                                                className={`${styles["d-block"]} d-block w-100`} 
                                                alt={`Изображение ${index}`}
                                            />
                                        </div>
                                    ))
                                ) : 
                                (
                                    <div key={0} className={`${styles["carousel-item"]} carousel-item`}>
                                            <img 
                                                src={"/images/no-image.jfif"}
                                                className={`${styles["d-block"]} d-block w-100`} 
                                                alt={`Изображение ${0}`}
                                            />
                                    </div>
                                )
                            }   
                        </div>

                        {profileImages.length > 0 ? 
                            (
                                <>
                                    {/* Кнопки управления */}
                                    <button className={styles["back-button"]}  onClick={closeProfile}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#fff"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
                                    </button>
                                    <button 
                                        className={`${styles["carousel-control-prev"]} carousel-control-prev`} 
                                        type="button" 
                                        onClick={handlePrev}
                                    >
                                        <span 
                                            className={`${styles["carousel-control-prev-icon"]} carousel-control-prev-icon`} 
                                            aria-hidden="true"
                                        ></span>
                                    </button>
                                    <button 
                                        className={`${styles["carousel-control-next"]} carousel-control-next`} 
                                        type="button" 
                                        onClick={handleNext}
                                    >
                                        <span 
                                            className={`${styles["carousel-control-next-icon"]} carousel-control-next-icon`} 
                                            aria-hidden="true"
                                        ></span>
                                    </button>
                                </>
                            ) : 
                            ( 
                                <button className={styles["back-button"]}  onClick={closeProfile}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#fff"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
                                </button>
                            )
                        }

                        <div className={styles["user-initials"]}>
                            {profile.user_initials}
                        </div>
                        <div className={styles["user-last-time"]}>
                            was there {profile.user_last_time ? ((new Date(profile.user_last_time)).toLocaleDateString() < new Date() ? (new Date(profile.user_last_time)).toLocaleDateString() : (new Date(profile.user_last_time)).toLocaleTimeString()) : "recently"}
                        </div>
                    </div>
                </div>
                
                <div className={styles["container-common-information"]}>
                        <div className={styles["wrapper-nickname"]}>
                            <div className={styles["label-nickname"]}>Ник</div>
                            <div className={styles["user-nickname"]}>{profile.user_nickname ? profile.user_nickname : "Неизвестно"}</div>
                        </div>
                        <div className={styles["wrapper-birthday"]}>
                            <div className={styles["label-birthday"]}>День рождения</div>
                            <div className={styles["user-birthday"]}><input type="date" disabled value={profile.user_birthday ? (formatDateToISO(profile.user_birthday)) : "Неизвестно"}/></div>
                        </div>
                        <div className={styles["wrapper-bio"]}>
                            <div className={styles["label-bio"]}>О себе</div>
                            <div className={styles["user-bio"]}>
                                {profile.user_bio ? profile.user_bio : "No bio"}
                            </div>
                        </div>
                </div>
            </>) : (<div>Профиль не отображается</div>)
    );
};

export default UserProfile;