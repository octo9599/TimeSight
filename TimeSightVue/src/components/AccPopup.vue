<script setup>

</script>

<template>
    <div id="content">
        <router-link class="links" to="/account">Account</router-link>
        <button id="mode-btn"> LightMode</button> 
        <router-link class="links" id="logout" to="/logout">Log out</router-link>
    </div>
</template>

<style scoped>
    #content {
        background-color: var(--main-dark);
        display: flex;
        flex-direction: column;
        align-items: end;
        font-size: large;
        border-style: solid;
        border-radius: 5px;
        border-color: var(--field-dark); 
        padding-right: 10px;
        padding-left: 15px;
        padding-top: 15px;
        padding-bottom: 15px;
        margin-top: 7%;
        margin-right:3%;
        gap: 1rem;
    }
    
    .links {
        text-decoration: none;
        color: var(--text-dark);
    }

    #mode-btn {
        border: none;
        background-color: var(--main-dark);
        color: var(--text-dark);
        padding:0;
        font-size: large;
    }

    #logout {
        color: red;
    }
</style>