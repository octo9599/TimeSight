<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import { API } from "@/components/DataAccess.mjs";

const username = ref("");
const password = ref("");
const password_check = ref("");

const failed = ref("");

const userStore = useUserStore();
const emit = defineEmits(['switch']);

function notifyParent() {
  emit('switch');
}

async function signupSubmit() {
  try {
    if (password.value != password_check.value) {
      throw Error("Passwort-Felder stimmen nicht überein.")
    }

    const existing_user = (await axios.get(`${API}/user`, {params: {username: username.value}})).data;
    if(existing_user[0]) {
      throw Error("Username ist bereits vergeben.");
    }

    await axios.post(`${API}/user`, {
      username: username.value,
      passwort: password.value
    });

    await axios.post(`${API}/login`, {
      username: username.value,
      passwort: password.value
    }, { withCredentials: true });

    window.location.reload();
  } catch (err) {
    console.log(err);
    if(err.status) {
      failed.value = `Error Code ${err.status}: Something went wrong during signup process.`;
    } else {
      failed.value = err.message;
    }
  }
}
</script>

<template>
  <form @submit.prevent="signupSubmit" class="auth-card">
    <div class="brand-row">
      <div class="brand-logo">TimeSight</div>
    </div>

    <div class="headline">
      <div class="h1">Account erstellen</div>
      <div class="h2">Registriere dich</div>
    </div>

    <input type="text" placeholder="Username" v-model="username" required />
    <input type="password" placeholder="Passwort" v-model="password" required />
    <input type="password" placeholder="Passwort bestätigen" v-model="password_check" required />

    <button type="submit" class="btn-primary">Signup</button>

    <div id="error">{{ failed }}</div>

    <div class="divider"></div>

    <div class="auth-switch">
      <span>Du hast schon ein Konto?</span>
      <button type="button" class="link-btn" @click="notifyParent">
        Jetzt anmelden
      </button>
    </div>
  </form>
</template>

<style scoped>

#error {
  color:crimson;
}

br{ display:none; }

/* Card zentriert */
.auth-card{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: min(520px, 92vw);
  padding: 26px;

  background: var(--main);
  border: 6px solid var(--field);
  border-radius: 8px;

  font-family: "Goodland", system-ui, sans-serif;
  color: var(--text);
}

/* Brand */
.brand-row{
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}

.brand-logo{
  font-weight: 400;
  letter-spacing: .6px;
  font-size: 18px;
  color: var(--text);
}

/* Headline */
.headline{
  text-align: left;
  margin-bottom: 14px;
}

.h1{
  font-size: 18px;
  font-weight: 400;
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

  color: var(--text);
  background: var(--field);
  border: 2px solid var(--text);
  border-radius: 6px;
  outline: none;
}

input::placeholder{
  color: rgba(219, 241, 255, 0.65);
}

input:focus{
  border-color: var(--accent);
}

/* Primary Button */
.btn-primary{
  margin-top: 16px;
  width: 100%;
  height: 42px;

  font-family: "Goodland", system-ui, sans-serif;
  font-size: 14px;
  font-weight: 800;

  color: var(--text);
  background: var(--today);
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

/* "Schon ein Konto?" Row */
.auth-switch{
  text-align: center;
  font-family: "Goodland", system-ui, sans-serif;
  font-size: 13px;
  color: var(--text);
}

.link-btn{
  margin-left: 6px;
  padding: 0;

  background: none;
  border: none;

  font-family: "Goodland", system-ui, sans-serif;
  font-size: 13px;
  font-weight: 800;

  color: var(--accent);
  cursor: pointer;
}

.link-btn:hover{
  text-decoration: underline;
}

/* Mobile */
@media (max-width: 420px){
  .auth-card{ padding: 20px; }
}
</style>
