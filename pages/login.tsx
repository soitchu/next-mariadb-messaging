import React, { useRef } from "react";
import { Button, Input } from "@nextui-org/react";
import styles from "../styles/Auth/login.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {

  const usernameInput = useRef(null);
  const passwordInput = useRef(null);


  async function logIn(event) {
    event.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: usernameInput.current.value,
          password: passwordInput.current.value
        })
      });

      if (response.ok) {
        toast("Logged in! Redirecting...");

        setTimeout(() => {
          window.location.href = "/chat";
        }, 2000);
      } else {
        toast((await response.json()).message);
      }


    } catch (err) {
      toast.error(err.toString());
    }
  }


  return (
    <div className={styles.loginBackground} >
      <div className={styles.backdrop}></div>
      <form className={styles.loginCon} onSubmit={logIn}>
        <Input type="text" label="Username" className={styles.inputBox} autoComplete="off" ref={usernameInput} />
        <Input type="password" label="Password" className={styles.inputBox} ref={passwordInput} />
        <a className={styles.link} onClick={() => {
          window.location.href = "/register";
        }}>
          Don't have an account? Register here.
        </a>
        <Button type="submit" color="primary" className={styles.button} onClick={logIn}>
          Log in
        </Button>
        <ToastContainer
          draggable
          pauseOnHover
          theme="dark"
        />
      </form>
    </div>
  );
}
