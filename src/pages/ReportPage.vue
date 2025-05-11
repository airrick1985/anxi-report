<template>
  <v-container class="py-6">
    <h2 class="text-h5 mb-4">戶別：{{ unitId }}</h2>

    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <v-progress-circular v-if="loading" indeterminate color="primary" />

    <v-table v-else class="elevation-1">
      <thead>
        <tr>
          <th>建檔時間</th>
          <th>驗屋日期</th>
          <th>階段</th>
          <th>區域</th>
          <th>分類</th>
          <th>細項</th>
          <th>說明與照片</th>
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
          <td>
            <div>{{ r.description }}</div>
            <div class="photo-row">
              <img
                v-for="(url, idx) in [r.photo1, r.photo2, r.photo3, r.photo4]"
                v-if="url"
                :key="idx"
                :src="url"
                alt="缺失照片"
                class="photo-thumb"
                @click="zoomImage(url)"
                @error="() => console.error('❌ 載入失敗:', url)"
                @load="() => console.log('✅ 成功載入:', url)"
              />
            </div>
            <pre v-if="r.photo1" style="font-size: 10px; color: #888;">{{ r.photo1 }}</pre>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-dialog v-model="zoomDialog" max-width="90vw">
      <v-card>
        <v-img :src="zoomUrl" max-height="80vh" contain />
        <v-card-actions class="justify-end">
          <v-btn text @click="zoomDialog = false">關閉</v-btn>
        </v-card-actions>
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

function zoomImage(url) {
  zoomUrl.value = url;
  zoomDialog.value = true;
}

// 此函數目前在此組件中未被直接用於圖片顯示，
// 因為後端 API (get_shared_inspection_records) 已提供轉換後的 URL。
// 保留它以防其他地方可能需要處理原始 Google Drive 分享連結。
function transformDriveUrl(originalUrl) {
  if (!originalUrl) return '';
  // 此正規表達式用於轉換 /file/d/FILE_ID/view?usp=sharing 格式的連結
  const matchFileD = originalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD) {
    return `https://drive.google.com/uc?export=view&id=${matchFileD[1]}`;
  }
  // 如果 URL 已經是 /uc?id=FILE_ID 格式，則直接返回
  if (originalUrl.includes('/uc?export=view&id=') || originalUrl.includes('/uc?id=')) {
    return originalUrl;
  }
  // 如果以上格式都不匹配，返回原始 URL 或空字串（視情況處理）
  // 在此，如果不是已知的 Drive URL 格式，我們返回原始 URL，讓瀏覽器嘗試解析
  return originalUrl;
}


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
        action: 'get_shared_inspection_records',
        unitId,
        token
      })
    });
    const json = await res.json();
    if (json.status === 'success') {
      records.value = json.records || [];
      if (records.value.length > 0 && records.value[0].photo1) {
        console.log("API回傳的第一筆紀錄 photo1 URL:", records.value[0].photo1);
      }
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
.photo-row {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.photo-thumb {
  max-width: 120px;
  max-height: 100px;
  object-fit: contain;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: zoom-in;
}
</style>