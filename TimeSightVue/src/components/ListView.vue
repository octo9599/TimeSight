<script setup>
import axios from 'axios';
const API = "http://localhost:3000";

import { ref, onMounted, toRaw } from "vue";
import { fetchData, formatDate } from "./DataAccess.js";

const toDoTermine = ref([]);
const overTermine = ref([]);
const doneTermine = ref([]);
const dates = ref(new Set());

onMounted(async () => {
    const data = await fetchData();
    toDoTermine.value = data.toDoTermine;
    overTermine.value = data.overTermine;
    doneTermine.value = data.doneTermine;
    dates.value = data.dates;

    console.log(dates.value);
});
</script>

<template>
    <dl>
        <template v-for="date in dates">
            <dt><h3>{{ formatDate(date) }}</h3></dt>
            <dd> example </dd>
        </template>
    </dl>
</template>

<style scoped>
dt {
    margin-left: 1%;
}
dd {
    margin: 1% 20% 1% 3%;
    padding: 1%;
    border-radius: 1em;
    background-color: var(--field-dark);
}
</style>
