<template>
  <v-container class="py-6">
    <h2 class="text-h5 mb-4">戶別：{{ unitId }}</h2>

    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
    >{{ error }}</v-alert>

    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
    />

    <v-table v-else class="elevation-1">
      <thead>
        <tr>
          <th>建檔時間</th>
          <th>驗屋日期</th>
          <th>階段</th>
          <th>區域</th>
          <th>分類</th>
          <th>細項</th>
          <th>說明</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in records" :key="r.key">
          <td>{{ r.createdAt }}</td>
          <td>{{ r.inspectionDate }}</td>
          <td>{{ r.inspectionStage }}</td>
          <td>{{ r.area }}</td>
          <td>{{ r.category }}</td>
          <td>{{ r.subcategory }}</td>
          <td>{{ r.description }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const unitId = route.query.u;
const token = route.query.t;

const records = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  if (!unitId || !token) {
    error.value = '缺少必要參數';
    loading.value = false;
    return;
  }

  try {
    const res = await fetch('https://vercel-proxy-api2.vercel.app/api/inspection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_inspection_records',
        unitId,
        token
      })
    });
    const json = await res.json();
    if (json.status === 'success') {
      records.value = json.records || [];
    } else {
      error.value = json.message || '讀取失敗';
    }
  } catch (e) {
    error.value = '連線錯誤：' + e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
th {
  font-weight: bold;
  background-color: #f8f8f8;
  text-align: left;
  padding: 8px;
}
td {
  padding: 8px;
  vertical-align: top;
  font-size: 14px;
  border-bottom: 1px solid #eee;
}
</style>
