<template>
  <div class="page-container" style="max-width:600px">
    <el-card header="个人信息">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input :model-value="info.nickname || '管理员'" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickname" placeholder="新昵称" />
        </el-form-item>
        <el-form-item label="头像URL">
          <el-input v-model="form.avatar" placeholder="头像URL" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="updating" @click="handleUpdate">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card header="修改密码" style="margin-top:20px">
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdEl" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="pwding" @click="handleChangePwd">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card header="关于我（前台展示）" style="margin-top:20px">
      <el-form :model="aboutForm" label-width="80px">
        <el-form-item label="副标题">
          <el-input v-model="aboutForm.subtitle" placeholder="例：视觉设计爱好者+码农" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="aboutForm.content" type="textarea" :rows="5" placeholder="关于我的介绍内容，支持换行..." />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="aboutSaving" @click="handleSaveAbout">保存</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../utils/request'

const info = JSON.parse(localStorage.getItem('admin_info') || '{}')

const form = reactive({ nickname: info.nickname || '', avatar: info.avatar || '' })
const updating = ref(false)

async function handleUpdate() {
  updating.value = true
  try {
    await request.put('/admin/profile', { nickname: form.nickname, avatar: form.avatar })
    info.nickname = form.nickname
    info.avatar = form.avatar
    localStorage.setItem('admin_info', JSON.stringify(info))
    ElMessage.success('保存成功')
  } finally { updating.value = false }
}

const pwdEl = ref()
const pwding = ref(false)
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (rule, value, callback) => value === pwdForm.newPassword ? callback() : callback(new Error('两次密码不一致')), trigger: 'blur' }
  ]
}

async function handleChangePwd() {
  const valid = await pwdEl.value.validate().catch(() => false)
  if (!valid) return
  pwding.value = true
  try {
    await request.put('/admin/profile/password', { oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
    ElMessage.success('密码修改成功，请重新登录')
    localStorage.removeItem('admin_token')
    location.reload()
  } finally { pwding.value = false }
}

// ===== 关于我管理 =====
const aboutForm = reactive({ subtitle: '', content: '' })
const aboutSaving = ref(false)

onMounted(fetchAbout)

async function fetchAbout() {
  try {
    const res = await request.get('/admin/site-config')
    const list = res.data || []
    const subtitle = list.find(c => c.configKey === 'about_subtitle')
    const content = list.find(c => c.configKey === 'about_content')
    if (subtitle) aboutForm.subtitle = subtitle.configValue || ''
    if (content) aboutForm.content = content.configValue || ''
  } catch { /* 忽略 */ }
}

async function handleSaveAbout() {
  aboutSaving.value = true
  try {
    await request.put('/admin/site-config', [
      { configKey: 'about_subtitle', configValue: aboutForm.subtitle },
      { configKey: 'about_content', configValue: aboutForm.content }
    ])
    ElMessage.success('关于我保存成功')
  } finally { aboutSaving.value = false }
}
</script>
