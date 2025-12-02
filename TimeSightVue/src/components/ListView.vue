<script setup>
    import axios from 'axios';
    try {
        const API = "http://localhost:3000";
    //const hardUser = await axios.get(`${API}/user/1`);
    //const groupsIn = await axios.get(`${API}/user/${hardUser}/gruppe`);

        const groupsIn = await axios.get(`${API}/user/1/gruppe`);
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

            toDoTermine.push(toDoTermineIn.data);
            overTermine = overTermineIn.data;
            doneTermine = doneTermineIn.data;            
        }
        console.log(toDoTermine);
        console.log(overTermineIn);
        console.log(doneTermineIn);
    } catch (err){
        console.log(err);
    };
</script>

<template>
    <h1>hallo</h1>
</template>

<style scoped>

</style>
