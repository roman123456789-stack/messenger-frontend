import React, { useState } from "react";
import styles from "./Registration.module.css";
import { Link, useNavigate } from "react-router-dom";
import { initSocket, disconnectSocket } from "../../utilits/socket";

const Registration = () => {
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e)=>{
        e.preventDefault();
        try{
            localStorage.removeItem("token");
            disconnectSocket();
            const response = await fetch(`${process.env.REACT_APP_API_URL}/registration`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password}),
            });
            if (!response.ok) {
                throw new Error("Ошибка запроса");
            }
            const data = await response.json();
            console.log(data);
            
            localStorage.setItem("token", data.token);
            
            const socket = initSocket(data.token);
            socket.on("connect_error", (err) => {
                console.error("Connection error:", err.message);
                setError("Ошибка подключения к серверу");
                localStorage.removeItem("token");
                disconnectSocket();
            });
            socket.on("connect", ()=>{
                console.log("Подключение успешно");
                localStorage.setItem("isSeenModal", 0)
                navigate("/home");
            });
        }
        catch(err){
            console.log(err.message || "Ошибка регистрации");
            setError(err.message || "Ошибка регистрации");
        }
    }
    return(
        <div className={styles["container"]}>
            <form className={styles["form-autorization"]} onSubmit={handleSubmit} method="post">
                <div className="" style={{textAlign: 'center', fontWeight: '900', color: '#fff', fontSize: '25px'}}>Регистрация</div>
                <div className={styles["wrapper-input"]}>
                    <input autoFocus name="email" onChange={e =>{setEmail(e.target.value)}} className={styles["form-inputs"]} type="email" placeholder="email" required />
                </div>
                <div className={styles["wrapper-input"]}>
                    <input minLength={8} name="password" onChange={e =>{setPassword(e.target.value)}} className={styles["form-inputs"]} type="password" placeholder="password" required />
                </div>
                <button className={styles["form-button"]} type="submit">Зарегистрироваться</button>
                <div style={{marginRight: '20px', marginTop: '30px'}} className={styles["registration-ref"]}>Есть аккаунт?&nbsp;<Link to="/autorization" className={styles["registration-ref"]}> Войти </Link></div>
                </form>
        </div>   
    );
};
export default Registration;