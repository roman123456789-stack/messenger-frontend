import React, { useEffect, useState } from 'react';
import Header from '../components/HomePage/Header';// Отображение информации о юзере в открытом диалоге
import Main from '../components/HomePage/Main';// Отображение сообщений
import Message from '../components/HomePage/Message';// Ввод сообщения
import Dialogues from '../components/HomePage/Dialogues';// Список диалогов
import SearchUsers from '../components/HomePage/SearchUsers';// Поиск юзеров по никнейму или инициалам
import Search from '../components/HomePage/Search';// Муляж поиска при клике на него открывается настоящий поиск в отдельной странице
import LeftMenu from '../components/HomePage/LeftMenu';// Меню
import UserProfile from '../components/HomePage/UserProfile';// Профиль другого юзера
import SelfProfile from '../components/HomePage/SelfProfile';// Пункт меню, свой профиль
import { useNavigate } from 'react-router-dom';
import { initSocket } from '../utilits/socket';
import '../styles/Home.style.css';

//! Добавить триггер при отправке файлов
const Home = () => {
    const [selectedDialogue, setDialogue] = useState([]); // Выбранный диалог
    const [showMessages, setShowMessages] = useState(false); // Окно с сообщениями, шапкой, набором сообщения 
    const [showSearchUsers, setShowSearchUsers] = useState(false); // Окно поиска пользователей
    const [showMenu, setShowMenu] = useState(false);// Окно меню
    const [showProfile, setShowProfile] = useState(false);// Профиль другого юзера
    const [showSelfProfile, setShowSelfProfile] = useState(false);// Профиль другого юзера
    const [message, setMessage] = useState("");// Отправленное сообщение 
    const [selectedUser, setUser] = useState({});// Выбранный пользователь в поиске
    const [newMessage, setNewMessage] = useState({});// Храним новое сообщение

    const navigate = useNavigate();
    
    const token = localStorage.getItem("token");
    useEffect(()=>{
        const token = localStorage.getItem("token");
        initSocket(token);
        console.log(
            "%cMessenger v1.0.0.0",
            "background: #f70ce0; color: white; border: 1px dashed black; padding: 5px; font-size: 25px;"
          );
    }, []);

    const validationToken = async ()=>{
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/verify`, {
                method: "GET", 
                headers: {"token": token}
            });
            if (!response.ok) {
                throw new Error();   
            }
        } catch (error) {
            console.log("Токен неверный");
            localStorage.removeItem("token");
            return navigate("/autorization");
        }
    }
    validationToken();
    // Если диалог не выбран
    if (selectedDialogue.length === 0) {
        if (showSearchUsers) {
            return (
                <div className='container show-search-users'>
                    <div className={'container-search-users'}>
                        <SearchUsers 
                            setShowProfile={setShowProfile} 
                            setShowMessages={setShowMessages} 
                            setUser={setUser} 
                            selectedUser={selectedUser} 
                            setDialogue={setDialogue} 
                            selectedDialogue={selectedDialogue} 
                            setShowSearchUsers={setShowSearchUsers}
                        />
                    </div>
                </div>
            )
        }
        if (showSelfProfile) {
            return (
                <div className='container show-self-profile'>
                    <div className='container-show-self-profile'>
                        <SelfProfile 
                            showSelfProfile={showSelfProfile} 
                            setShowSelfProfile={setShowSelfProfile}
                        />
                    </div>
                </div>
            )
        }
        if (showMenu) {
            return(
                <div className='container show-menu'>
                    <div className={"container-left-menu"}>
                        <LeftMenu 
                            setShowSelfProfile={setShowSelfProfile} 
                            showMenu={showMenu} 
                            setShowMenu={setShowMenu} 
                        />
                    </div>
                </div>
            );
        }
        else{
            return(
                <div className="container">
                    <div className={'dialogues'}>
                        <Dialogues 
                            setUser={setUser}
                            setShowProfile={setShowProfile} 
                            setMessage={setMessage} 
                            setShowMessages={setShowMessages} 
                            selectedDialogue={selectedDialogue} 
                            setDialogue={setDialogue}
                            setShowSearchUsers={setShowSearchUsers}
                            newMessage={newMessage}
                        />
                    </div>
                    <div className={'search'}>
                        <Search 
                            setMessage={setMessage} 
                            setShowSearchUsers={setShowSearchUsers} 
                            setShowMenu={setShowMenu}
                        />
                    </div>
                </div>
            )
        }
    }
    
    return (
            <div 
                className={`container
                    ${selectedDialogue.length === 0 ? '' : (showMessages ? ' show-messages' : '')} 
                    ${showSearchUsers ? ' show-search-users' : ''} 
                    ${showMenu ? ' show-menu' : ''} 
                    ${showSelfProfile ? ' show-self-profile' : ''} 
                    ${showProfile ? ' show-profile' : ''}`}>
                
                {/* Если ПРОФИЛЬ, то показываем профиль и не показываем блок с сообщениями */}
                {showProfile ?
                    //ПРОФИЛЬ
                    (<div className="container-profile">
                        <UserProfile 
                            selectedDialogue={selectedDialogue} 
                            setShowMessages={setShowMessages} 
                            showProfile={showProfile} 
                            setShowProfile={setShowProfile}
                        />
                    </div>
                ) :
                    // Блок с сообщениями
                (<>
                    <div className={'header'}>
                        <Header 
                            selectedUser={selectedUser} 
                            setUser={setUser} 
                            setShowMessages={setShowMessages} 
                            showProfile={showProfile} 
                            setShowProfile={setShowProfile} 
                            selectedDialogue={selectedDialogue} 
                            setDialogue={setDialogue}
                        />
                    </div>
                    <div id="main" className={'main'}>
                        <Main 
                            setMessage={setMessage}
                            selectedDialogue={selectedDialogue} 
                            selectedUser={selectedUser} 
                            setUser={setUser}
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                        />
                    </div>
                    <div className={'message'}>
                        <Message 
                            selectedUser={selectedUser} 
                            setUser={setUser} 
                            setMessage={setMessage} 
                            message={message} 
                            showMenu={showMenu} 
                            showSearchUsers={showSearchUsers} 
                            selectedDialogue = {selectedDialogue}
                            newMessage = {newMessage}
                            setNewMessage = {setNewMessage}
                        />
                    </div>
                </>)}
                {/* Если показываем блок для поиска юзеров, то не показываем МЕНЮ, ПРОФИЛЬ, ДИАЛОГИ, МУЛЯЖ ПОИСКА*/}
                {showSearchUsers ?
                    (<div className={'container-search-users'}>
                        <SearchUsers 
                            setShowProfile={setShowProfile} 
                            setShowMessages={setShowMessages} 
                            setUser={setUser} 
                            selectedUser={selectedUser} 
                            setDialogue={setDialogue} 
                            selectedDialogue={selectedDialogue} 
                            setShowSearchUsers={setShowSearchUsers}
                        />
                    </div>) 
                    :(
                        // Если не показываем ПОИСК, то показываем МЕНЮ
                        showMenu ? (
                            <div className={"container-left-menu"}>
                                <LeftMenu 
                                    setShowSelfProfile={setShowSelfProfile} 
                                    showMenu={showMenu} 
                                    setShowMenu={setShowMenu} 
                                />
                            </div>
                        ) : //Если не показываем МЕНЮ, то показываем СВОЙ ПРОФИЛЬ
                        (showSelfProfile ? (
                            <div className='container-show-self-profile'>
                                <SelfProfile 
                                    showSelfProfile={showSelfProfile} 
                                    setShowSelfProfile={setShowSelfProfile}
                                />
                            </div>
                            ) : //Если не показываем СВОЙ ПРОФИЛЬ и МЕНЮ, то показываем СПИСОК ДИАЛОГОВ и МУЛЯЖ ПОИСКА
                                (<>
                                    <div className={'dialogues'}>
                                        <Dialogues 
                                            setUser={setUser}
                                            setShowProfile={setShowProfile} 
                                            setMessage={setMessage} 
                                            setShowMessages={setShowMessages} 
                                            selectedDialogue={selectedDialogue} 
                                            setDialogue = {setDialogue}
                                            setShowSearchUsers= {setShowSearchUsers}
                                            newMessage={newMessage}
                                        />
                                    </div>
                                    <div className={'search'}>
                                        <Search 
                                            selectedUser={selectedUser} 
                                            setUser={setUser} 
                                            setMessage={setMessage} 
                                            showMenu={showMenu} 
                                            showSearchUsers={showSearchUsers} 
                                            setShowMenu={setShowMenu} 
                                            setShowSearchUsers={setShowSearchUsers} 
                                        />
                                    </div>
                                </>)
                            )
                )
                } 
            </div>
    )
    

};

export default Home;