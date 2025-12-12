<script setup>
import axios from 'axios';
const API = "http://localhost:3000";

import { ref, onMounted, toRaw } from "vue";
import { fetchTermine } from "./DataAccess.js";

const toDoTermine = ref([]);
const overTermine = ref([]);
const doneTermine = ref([]);
const dates = ref(new Set());

onMounted(async () => {
    const data = await fetchTermine();
    toDoTermine.value = data.toDoTermine;
    overTermine.value = data.overTermine;
    doneTermine.value = data.doneTermine;
    dates.value = data.dates;

    console.log(dates.value);
});
</script>

<template>
    <h1>hello</h1>
</template>

<style></style>
