import React, { useEffect, useState } from "react";
import styles from "./Histories.module.css";

const Histories = ()=>{
    useEffect(()=>{
        const scrollBar = document.getElementById("wrapper-histories");
        scrollBar.addEventListener("wheel", (e) => {
            e.preventDefault();

            const isScrollingDown = e.deltaY > 0;

            const scrollStep = 20; 

            if (isScrollingDown) {
                scrollBar.scrollLeft += scrollStep;
            } else {
                scrollBar.scrollLeft -= scrollStep;
            }
        });
    }, []);
    return (
        <div className={styles.wrapper}>
            <div className={styles['wrapper-histories']} id="wrapper-histories">
                <div className={styles['wrapper-history']}>
                    <div className={styles['image-preview-history']}>
                        <img className={styles["add-history-background"]} src="/images/test_dialogue_image.webp" alt="" />
                        <svg xmlns="http://www.w3.org/2000/svg" 
                            className={styles["add-history"]}
                            height="40px" 
                            viewBox="0 -960 960 960" 
                            width="40px" 
                            fill="#fff">
                                <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
                        </svg>
                    </div>
                    <div className={styles['username-owner-history']}>
                        <p>Роман Рома Роман</p>
                    </div>
                </div>
                <div className={styles['wrapper-history']}>
                    <div className={styles['image-preview-history']}>
                        <img className={styles["history-owner-image"]} src="/images/test_dialogue_image.webp" alt="" />
                    </div>
                    <div className={styles['username-owner-history']}>
                        <p>2</p>
                    </div>
                </div>
                
            </div>
        </div>
    );
}

export default Histories;