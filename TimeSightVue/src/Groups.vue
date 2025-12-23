<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { fetchData } from "@/components/DataAccess.mjs";

const groups = ref([]);

onMounted(async () => {
  try {
    const data = (await fetchData()).groupsIn.data;
    console.log(data);
    groups.value = data || [];
    console.log('Groups data:', groups.value);
  } catch (error) {
    console.error('Error fetching groups:', error);
  }
});
</script>

<template>
  <div>
    <ul v-if="groups.length">
      <li v-for="group in groups" :key="group.pk_group_id">
        <p>{{ group.gruppenname }}</p>
      </li>
    </ul>
    <p v-else>No groups found or loading...</p>
  </div>
</template>

<style scoped></style>