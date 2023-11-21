import React, { useRef } from "react";
import { Button, Input } from "@nextui-org/react";
import styles from "../styles/Auth/login.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Register() {

  const usernameInput = useRef(null);
  const passwordInput = useRef(null);
  const confirmPasswordInput = useRef(null);


  async function register(event) {
    event.preventDefault();

    try {
      if(confirmPasswordInput.current.value !== passwordInput.current.value) {
        throw new Error("Passwords don't match");
      }


      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: usernameInput.current.value,
          password: passwordInput.current.value
        })
      });

      if (response.ok) {
        toast("Registered! Redirecting...", {
          autoClose: 2000
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        toast((await response.json()).message);
      }


    } catch (err) {
      toast.error(err.toString());
    }
  }


  return (
    <div className={styles.loginBackground}>
      <div className={styles.backdrop}></div>
      <form className={styles.loginCon} onSubmit={register}>
        <Input type="text" label="Username" className={styles.inputBox} autoComplete="off" ref={usernameInput} />
        <Input type="password" label="Password" className={styles.inputBox} ref={passwordInput} />
        <Input type="password" label="Confirm the password" className={styles.inputBox} ref={confirmPasswordInput} />

        <Button type="submit" color="primary" className={styles.button} >
          Register
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
