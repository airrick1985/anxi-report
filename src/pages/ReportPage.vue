<template>
  <v-container class="py-6">
    <h2 class="text-h5 mb-4">戶別：{{ unitId }}</h2>

    <v-alert v-if="error" type="error" class="mb-4" closable>{{ error }}</v-alert>
    <div v-if="loading" class="text-center pa-4">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="records.length > 0" class="record-list">
      <v-card v-for="r in records" :key="r.key" class="mb-4 pa-4" elevation="2">
        <div class="info-group">
          <div><strong>建檔時間：</strong>{{ r.createdAt }}</div>
          <div><strong>驗屋日期：</strong>{{ r.inspectionDate }}</div>
          <div><strong>階段：</strong>{{ r.inspectionStage }}</div>
          <div><strong>區域：</strong>{{ r.area }}</div>
          <div><strong>分類：</strong>{{ r.category }}</div>
          <div><strong>細項：</strong>{{ r.subcategory }}</div>
          <div><strong>說明：</strong>{{ r.description }}</div>
        </div>

        <v-divider class="my-3"></v-divider>

        <div class="photo-grid">
          <v-img
            v-for="(url, idx) in getRecordPhotos(r)"
            :key="`${r.key}-photo-${idx}`"
            :src="url"
            class="photo-thumb"
            :alt="`缺失照片${idx + 1}`"
            @click="zoomImage(url)"
            @error="(e) => handleImageError(e, url, r.key, `photo${idx+1}`)"
            @load="() => handleImageLoad(url, r.key, `photo${idx+1}`)"
            contain
          >
            <template #placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="grey-lighten-2" size="32" />
              </v-row>
            </template>
            <template #error>
              <v-row class="fill-height ma-0" align="center" justify="center" style="background-color: rgba(255,0,0,0.1);">
                <v-icon color="red-darken-2" size="small">mdi-alert-circle-outline</v-icon>
                <span class="ml-2 red--text">無法載入</span>
              </v-row>
            </template>
          </v-img>
        </div>
      </v-card>
    </div>

    <v-alert v-else type="info" class="mt-4">沒有找到相關紀錄。</v-alert>

    <v-dialog v-model="zoomDialog" max-width="90vw" transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar color="primary" dark class="px-2">
          <v-toolbar-title>照片預覽</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" @click="zoomDialog = false"></v-btn>
        </v-toolbar>
        <v-card-text class="pa-2 d-flex justify-center align-center" style="min-height: 50vh;">
          <v-img :src="zoomUrl" max-height="80vh" contain />
        </v-card-text>
      </v-card>
    </v-dialog>
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
const zoomDialog = ref(false);
const zoomUrl = ref('');

function getRecordPhotos(record) {
  const urls = [record.photo1, record.photo2, record.photo3, record.photo4];
  return urls
    .map((url) => {
      const m = url?.match(/\/d\/([a-zA-Z0-9_-]+)/) || url?.match(/id=([a-zA-Z0-9_-]+)/);
      return m ? `https://lh3.googleusercontent.com/d/${m[1]}=w800` : '';
    })
    .filter(Boolean);
}

function zoomImage(url) {
  zoomUrl.value = url;
  zoomDialog.value = true;
}
function handleImageError(e, url, key, field) {
  console.error('❌ 圖片載入失敗:', url, key, field);
}
function handleImageLoad(url, key, field) {
  console.log('✅ 圖片成功載入:', url);
}

onMounted(async () => {
  if (!unitId || !token) {
    error.value = '缺少必要參數 (戶別或 token)。';
    loading.value = false;
    return;
  }
  try {
    const res = await fetch('https://vercel-proxy-api2.vercel.app/api/inspection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_shared_inspection_records',
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
    error.value = '讀取資料時出現錯誤：' + e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.info-group {
  font-size: 14px;
  line-height: 1.6;
}
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}
.photo-thumb {
  width: 120px;
  height: 90px;
  border-radius: 6px;
  border: 1px solid #ccc;
  cursor: pointer;
}
@media (max-width: 600px) {
  .photo-grid {
    flex-direction: column;
  }
  .photo-thumb {
    width: 100%;
    height: auto;
    max-height: 180px;
    object-fit: contain;
  }
}
</style>
