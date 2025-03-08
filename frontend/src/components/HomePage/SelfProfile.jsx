import React, { useState, useRef, useEffect } from "react";
import SelfProfileDisplaySelectedPhoto from "./SelfProfileDisplaySelectedPhoto";
import styles from "./SelfProfile.module.css";
const UserProfile = ({setShowMessages, showSelfProfile, setShowSelfProfile}) => {
    const [profile, setProfile] = useState([]);
    const [profileImages, setProfileImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedPhoto, setPhoto] = useState([]);
    const [photoIsSended, setPhotoIsSended] = useState(false);

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
        setShowSelfProfile(false);
    }
    const selectPhoto = function(file){
        const photo = Array.from(file);
        setPhoto(photo);
    }
    useEffect(()=>{
        const token = localStorage.getItem("token");
        try {
            const getProfile = async function(){
                const response = await fetch((`${process.env.REACT_APP_API_URL}/api/get/self/profile`),{
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
            setPhotoIsSended(false);
        } 
        catch (error) {
            console.error(error.message);
        }
    }, [photoIsSended])

    return (
        showSelfProfile && profile ? (
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
                            online
                        </div>
                    </div>
                </div>
                
                <div className={styles["container-common-information"]}>
                    {/* Добавляем фото профиля */}
                    <div className={styles["wrapper-add-profile-photo"]}>
                        <label className={styles["label-add-profile-photo"]} htmlFor="profilePhotoInput">
                            <input onChange={(e)=>{selectPhoto(e.target.files)}} id="profilePhotoInput" type="file" style={{display: "none"}} accept="image/*"/>
                            <svg xmlns="http://www.w3.org/2000/svg" 
                                height="30px" 
                                viewBox="0 -960 960 960" 
                                width="30px" 
                                fill="#5ebcd6">
                                    <path d="M440-440ZM120-120q-33 0-56.5-23.5T40-200v-480q0-33 23.5-56.5T120-760h126l74-80h240v80H355l-73 80H120v480h640v-360h80v360q0 33-23.5 56.5T760-120H120Zm640-560v-80h-80v-80h80v-80h80v80h80v80h-80v80h-80ZM440-260q75 0 127.5-52.5T620-440q0-75-52.5-127.5T440-620q-75 0-127.5 52.5T260-440q0 75 52.5 127.5T440-260Zm0-80q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29Z"/>
                            </svg>
                            <div className={styles["add-profile-photo-text"]}>{profileImages.length === 0 ? "Выбрать фото профиля" : "Добавить фото профиля"}</div>
                        </label>
                    </div>
                    {/* Показываем модалку, если пользователь выбрал фото */}
                    {selectedPhoto.length > 0 ? 
                        <SelfProfileDisplaySelectedPhoto
                            photoIsSended={photoIsSended}
                            setPhotoIsSended={setPhotoIsSended} 
                            selectedPhoto={selectedPhoto} 
                            setPhoto={setPhoto}
                        /> : <></>}
                    
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