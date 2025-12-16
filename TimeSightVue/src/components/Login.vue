<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user';

const API = "http://localhost:3000"
const username = ref("");
const password = ref("");

const userStore = useUserStore();

async function loginSubmit() {
  try {
    await axios.post(
      `${API}/login`,
      { username: username.value, passwort: password.value },
      { withCredentials: true }
    );
    window.location.reload();
  } catch (err) {
    console.log(err);
  }
}
</script>

<template>
  <form @submit.prevent="loginSubmit" class="auth-card">
    <div class="brand-row">
      <div class="brand-logo">TimeSight</div>
    </div>

    <div class="headline">
      <div class="h1">Willkommen zurück</div>
      <div class="h2">Melde dich an</div>
    </div>

    <input type="text" placeholder="Username" v-model="username" required />
    <input type="password" placeholder="Passwort" v-model="password" required />

    <button type="button" class="link-forgot" @click="$router.push('/forgot-password')">
      Passwort vergessen
    </button>

    <button type="submit" class="btn-primary">Login</button>

    <div class="divider"></div>

    <div class="signup-row">
      <span>Noch kein Konto?</span>
      <button type="button" class="link-signup" @click="$router.push('/register')">
        Account erstellen
      </button>
    </div>
  </form>
</template>

<style scoped>
/* Card zentriert */
.auth-card{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: min(520px, 92vw);
  padding: 26px;

  background: var(--main-dark);
  border: 6px solid var(--field-dark);
  border-radius: 8px;

  font-family: "Goodland", system-ui, sans-serif;
  color: var(--text-dark);
}

/* Brand */
.brand-row{
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.brand-logo{
  font-weight: 800;
  letter-spacing: .6px;
  font-size: 18px;
  color: var(--text-dark);
}

/* Headline */
.headline{
  text-align: left;
  margin-bottom: 14px;
}

.h1{
  font-size: 18px;
  font-weight: 800;
}

.h2{
  margin-top: 4px;
  font-size: 13px;
  opacity: .9;
}

/* Inputs */
input{
  display: block;
  width: 100%;
  height: 44px;
  margin-top: 12px;
  padding: 0 14px;

  font-family: "Goodland", system-ui, sans-serif;
  font-size: 14px;

  color: var(--text-dark);
  background: var(--field-dark);
  border: 2px solid var(--text-dark);
  border-radius: 6px;
  outline: none;
}

input::placeholder{
  color: rgba(219, 241, 255, 0.65);
}

input:focus{
  border-color: var(--accent-dark);
}

/* Passwort vergessen */
.link-forgot{
  margin-top: 12px;
  padding: 0;
  background: none;
  border: none;

  font-family: "Goodland", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;

  color: var(--accent-dark);
  cursor: pointer;
  text-align: left;
}

.link-forgot:hover{
  text-decoration: underline;
}

/* Primary Button */
.btn-primary{
  margin-top: 16px;
  width: 100%;
  height: 42px;

  font-family: "Goodland", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;

  color: var(--text-dark);
  background: var(--today-dark);
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary:hover{ filter: brightness(1.05); }
.btn-primary:active{ filter: brightness(0.97); }

/* Divider */
.divider{
  margin: 18px 0 14px 0;
  height: 2px;
  background: rgba(219, 241, 255, 0.18);
}

/* Signup Row */
.signup-row{
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  font-size: 13px;
}

.link-signup{
  padding: 0;
  background: none;
  border: none;

  font-family: "Goodland", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 800;

  color: var(--accent-dark);
  cursor: pointer;
}

.link-signup:hover{
  text-decoration: underline;
}

/* Mobile */
@media (max-width: 420px){
  .auth-card{ padding: 20px; }
}
</style>
