import React, {useEffect, useState} from "react";
import styles from "./Autorization.module.css";
import { Link, useNavigate } from "react-router-dom";
import { initSocket, disconnectSocket } from "../../utilits/socket";

const Autorization = () => {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    const navigate = useNavigate();
    
    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            disconnectSocket();
            localStorage.removeItem("token");
            const response = await fetch(`${process.env.REACT_APP_API_URL}/autorization`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            const socket = initSocket(data.token);
            console.log(data);
            
            localStorage.setItem("token", data.token);

            socket.on("connect_error", (err) => {
                console.error("Connection error:", err.message);
                setError("Ошибка подключения к серверу");
                localStorage.removeItem("token");
                disconnectSocket();
            });
            await socket.on("connect", ()=>{
                console.log("Подключение успешно");
                setTimeout(navigate("/home"), 1000);
            });
        }
        catch(err){
            console.log(error || "Ошибка авторизации");
            setError("Ошибка авторизации");
        }
    };

    return(
        <div className={styles["container"]}>
        <form onSubmit={handleSubmit} className={styles["form-autorization"]}>
            <div className="" style={{textAlign: 'center', fontWeight: '900', color: '#fff', fontSize: '25px'}}>Вход</div>
            <div className={styles["wrapper-input"]}>
                <input autoFocus name="email" onChange={e => {setEmail(e.target.value)}} className={styles["form-inputs"]} type="email" placeholder="email" required />
            </div>
            <div className={styles["wrapper-input"]}>
                <input name="password" onChange={e => setPassword(e.target.value)} className={styles["form-inputs"]} type="password" placeholder="password" required />
            </div>
            <button className={styles["form-button"]} type="submit">Войти</button>
            <div style={{marginRight: '20px', marginTop: '30px'}} className={styles["registration-ref"]}>Нет аккаунта?&nbsp;<Link to="/" className={styles["registration-ref"]} >Регистрация</Link></div>
        </form>
    </div>
    );
};
export default Autorization;