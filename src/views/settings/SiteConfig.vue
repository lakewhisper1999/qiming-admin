<template>
  <div class="page-container" style="max-width:600px">
    <el-card header="站点设置">
      <el-form :model="config" label-width="100px">
        <el-form-item label="站点名称">
          <el-input v-model="config.site_name" />
        </el-form-item>
        <el-form-item label="站点描述">
          <el-input v-model="config.site_description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="Logo URL">
          <el-input v-model="config.site_logo" placeholder="站点Logo图片URL" />
        </el-form-item>
        <el-form-item label="关于内容">
          <el-input v-model="config.about_content" type="textarea" :rows="5" placeholder="关于页面的 Markdown 内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="handleSave">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../utils/request'

const config = reactive({
  site_name: '',
  site_description: '',
  site_logo: '',
  about_content: ''
})
const saving = ref(false)

onMounted(async () => {
  try {
    const res = await request.get('/admin/site-config')
    if (res.data) {
      res.data.forEach(item => {
        if (config.hasOwnProperty(item.configKey)) {
          config[item.configKey] = item.configValue || ''
        }
      })
    }
  } catch { /* ignore */ }
})

async function handleSave() {
  saving.value = true
  try {
    const payload = Object.entries(config).map(([configKey, configValue]) => ({
      configKey,
      configValue: configValue || ''
    }))
    await request.put('/admin/site-config', payload)
    ElMessage.success('保存成功')
  } finally { saving.value = false }
}
</script>
