<template>
  <v-container class="py-6">
 <h2 class="text-h5 sticky-title d-flex justify-space-between align-center">
  戶別：{{ unitId }}
  <v-btn color="primary" size="small" @click="openConfirmDialog">點擊確認</v-btn>
</h2>

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

  <!-- ✅ 確認驗屋資料 Dialog -->
<v-dialog v-model="confirmDialog" max-width="500px">
  <v-card>
    <v-card-title>確認驗屋資料</v-card-title>
    <v-card-text>
      <v-text-field label="戶別" v-model="confirmForm.unit" readonly />
      <v-text-field label="產權人" v-model="confirmForm.owner" readonly />
      <v-text-field label="電話" v-model="confirmForm.phone" required />
      <v-text-field label="EMAIL" v-model="confirmForm.email" required />
      <v-checkbox
        v-model="confirmForm.agree"
        label="本人確認已詳閱本次驗屋紀錄，並同意於後續複驗時，以本紀錄作為判斷依據。"
        required
      />
      <v-btn
        color="secondary"
        @click="openSignaturePad"
        :disabled="!confirmForm.phone || !confirmForm.email || !confirmForm.agree"
      >
        點擊簽名
      </v-btn>

      <div v-if="signatureImage" class="mt-4">
        <p>簽名預覽：</p>
        <img :src="signatureImage" style="max-width: 100%; border: 1px solid #ccc;" />
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click="confirmDialog = false">取消</v-btn>
      <v-btn
        color="primary"
        @click="submitConfirmation"
        :disabled="!signatureImage"
      >送出</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- ✅ 簽名板 Dialog -->
<v-dialog v-model="signatureDialog" max-width="600">
  <SignaturePad
    v-model="signatureDialog"
    @done="onSignatureDone"
    @cancel="signatureDialog = false"
  />
</v-dialog>

<v-overlay :model-value="confirmLoading" persistent class="d-flex align-center justify-center">
  <v-progress-circular color="primary" indeterminate size="64" />
</v-overlay>

</template>

<script setup>
import { ref, reactive, onMounted, toRaw } from 'vue';
import { useRoute } from 'vue-router';
import SignaturePad from '@/components/SignaturePad.vue';

const route = useRoute();
const unitId = route.query.u;
const token = route.query.t;
const projectName = ref(route.query.p ? decodeURIComponent(route.query.p) : ''); // ✅ 獲取並解碼 projectName

const records = ref([]);
const loading = ref(true);
const error = ref('');
const zoomDialog = ref(false);
const zoomUrl = ref('');

const confirmDialog = ref(false);
const signatureDialog = ref(false);
const confirmLoading = ref(false);

const confirmForm = reactive({
  unit: '',
  owner: '',
  phone: '',
  email: '',
  agree: false
});

const signatureImage = ref(null);

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

async function openConfirmDialog() {
    if (!projectName.value) {
      error.value = '無法確定建案資訊，無法開啟確認對話框。';
      // toast.error(error.value); // 如果你集成了 toast
      alert(error.value); // 簡單提示
      return;
  }
  confirmLoading.value = true;
  try {
    const res = await fetch('https://vercel-proxy-api2.vercel.app/api/metadata', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
    action: 'get_house_detail',
    unitId,
    projectName: projectName.value, 
    token: 'anxi111003'
  })
    });
    const json = await res.json();
    const data = json.data || {};

    confirmForm.unit = unitId;
    confirmForm.owner = data.owner || '';
    confirmForm.phone = data.phone || '';
    confirmForm.email = data.email || '';
    confirmForm.agree = false;
    signatureImage.value = null;
    confirmDialog.value = true;
  } catch (e) {
    error.value = '讀取戶別資料失敗：' + e.message;
  } finally {
    confirmLoading.value = false;
  }
}



function openSignaturePad() {
  signatureDialog.value = true;
}

function onSignatureDone(dataUrl) {
  signatureImage.value = dataUrl;
  signatureDialog.value = false;
}

// ReportPage.vue 中的 methods 加入此函式：

async function submitConfirmation() {
   if (!projectName.value) {
      alert('錯誤：無法確定建案資訊，無法送出確認。');
      return;
  }

  if (!signatureImage.value) return;
  confirmLoading.value = true;

  try {
    // 1️⃣ 上傳簽名圖檔至 Drive
    const base64 = signatureImage.value.split(',')[1];
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const filename = `${confirmForm.unit}_${confirmForm.owner}_${yyyy}-${mm}-${dd}.png`;

    const uploadRes = await fetch('https://vercel-proxy-api2.vercel.app/api/inspection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upload_signature',
        token: 'anxi111003',
        filename,
        base64,
        projectName: projectName.value
      })
    });

    const uploadJson = await uploadRes.json();
    if (uploadJson.status !== 'success') throw new Error('簽名圖檔上傳失敗');

    const fileUrl = uploadJson.url;

    // 2️⃣ 呼叫 confirm_inspection API 寫入資料
    const confirmRes = await fetch('https://vercel-proxy-api2.vercel.app/api/inspection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'confirm_inspection',
        token: 'anxi111003',
        unitId: confirmForm.unit,
        owner: confirmForm.owner,
        phone: confirmForm.phone,
        email: confirmForm.email,
        signatureUrl: fileUrl,
        projectName: projectName.value
      })
    });

    const confirmJson = await confirmRes.json();
    if (confirmJson.status !== 'success') throw new Error('寫入試算表失敗');

    // ✅ 顯示成功提示
    alert('確認已送出！');
    confirmDialog.value = false;
  } catch (e) {
    alert('送出錯誤：' + e.message);
  } finally {
    confirmLoading.value = false;
  }
}

onMounted(async () => {
  if (!unitId || !token || !projectName.value) {
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
        token,
        projectName: projectName.value 
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
.sticky-title {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  padding: 16px 20px;
  margin: 0 -16px; /* 拉開與左右 padding 的距離，延伸滿整列 */
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-weight: bold;
  font-size: 20px;
}
</style>