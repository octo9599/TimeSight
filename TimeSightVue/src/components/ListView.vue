<script setup>
    
    import axios from 'axios';
    
        const API = "http://localhost:3000";
    //const hardUser = await axios.get(`${API}/user/1`);
    //const groupsIn = await axios.get(`${API}/user/${hardUser}/gruppe`);

        //const groupsIn = await axios.get(`${API}/user/1/gruppe`);

        axios.get(`${API}/user/1/gruppe`)
            .then(async (groupsIn) => {

                const groupsData = groupsIn.data;
                const groups = [];
                for (const group of groupsData) {
                    groups.push(group.pk_group_id);
                }
                let toDoTermineIn = [];
                let overTermineIn = [];
                let doneTermineIn = [];
                let toDoTermine = [];
                let overTermine = [];
                let doneTermine = [];
                for (const group of groups) {
                    toDoTermineIn.push(await axios.get(`${API}/gruppe/${group}/termin`));

                    overTermineIn.push(await axios.get(`${API}/gruppe/${group}/termin`, {
                    params: {
                        is_past_due: 1,
                    }}));

                    doneTermineIn.push(await axios.get(`${API}/gruppe/${group}/termin`, {
                    params: {
                        ist_erledigt: 1,
                    }}));    
                }
                for (const termin of toDoTermineIn) {
                    toDoTermine.push(termin.data);
                }
                for (const termin of overTermineIn) {
                    overTermine.push(termin.data);
                }
                for (const termin of doneTermineIn) {
                    doneTermine.push(termin.data);
                }
                console.log(toDoTermine);
                console.log(overTermine);
                console.log(doneTermine);
            })
            .catch((err) => {
                console.log(err);
            });

</script>

<template>
    <h1>hello</h1>
</template>

<style>

</style>
