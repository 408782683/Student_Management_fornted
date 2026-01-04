<template>
  <main>
    <header>
      <h1>高校实习教务管理前端</h1>
      <p class="helper-text">
        基于 <span class="tag admin">/api</span> 文档的 Vue 3 示例界面，覆盖所有接口，方便管理员、教师、学生联调。
      </p>
    </header>

    <section class="card">
      <div class="section-header">
        <h2>连接设置</h2>
        <span class="helper-text">默认连接后端 http://localhost:8080，可根据实际环境调整</span>
      </div>
      <label>
        API 基地址
        <input v-model="baseUrl" placeholder="http://localhost:8080" />
      </label>
    </section>

    <section class="card">
      <div class="section-header">
        <h2>认证与验证码</h2>
        <span class="tag admin">Auth</span>
      </div>
      <div class="flex-row">
        <label>
          验证码 Key
          <input v-model="auth.key" placeholder="例如 sessionId 或随机值" />
        </label>
        <button class="secondary" @click="loadCaptcha">获取验证码</button>
      </div>
      <div v-if="auth.captchaImage" class="flex-row" style="align-items: center; margin-top: 8px;">
        <img :src="`data:image/png;base64,${auth.captchaImage}`" alt="captcha" style="height: 64px; border-radius: 8px; border: 1px solid #e5e7eb;" />
        <span class="helper-text">输入验证码即可登录</span>
      </div>
      <div class="grid-two-col" style="margin-top: 12px;">
        <label>
          用户名
          <input v-model="auth.username" />
        </label>
        <label>
          密码
          <input v-model="auth.password" type="password" />
        </label>
        <label>
          角色
          <select v-model="auth.role">
            <option value="ADMIN">ADMIN</option>
            <option value="TEACHER">TEACHER</option>
            <option value="STUDENT">STUDENT</option>
          </select>
        </label>
        <label>
          验证码
          <input v-model="auth.captcha" />
        </label>
      </div>
      <div style="margin-top: 12px;">
        <button @click="login">登录</button>
      </div>
      <div v-if="auth.loginResponse" class="response-box" style="margin-top: 12px;">
        {{ formatJson(auth.loginResponse) }}
      </div>
    </section>

    <section class="grid-two-col">
      <div class="card">
        <div class="section-header">
          <h2>教师密码修改</h2>
          <span class="tag teacher">Teacher</span>
        </div>
        <PasswordForm
          v-model:username="teacherPassword.username"
          v-model:old-password="teacherPassword.oldPassword"
          v-model:new-password="teacherPassword.newPassword"
          @submit="() => changePassword('/api/teacher/password', teacherPassword, '教师密码修改')"
        />
      </div>
      <div class="card">
        <div class="section-header">
          <h2>学生密码修改</h2>
          <span class="tag student">Student</span>
        </div>
        <PasswordForm
          v-model:username="studentPassword.username"
          v-model:old-password="studentPassword.oldPassword"
          v-model:new-password="studentPassword.newPassword"
          @submit="() => changePassword('/api/student/password', studentPassword, '学生密码修改')"
        />
      </div>
    </section>

    <section class="card">
      <div class="section-header">
        <h2>管理员：基础数据维护</h2>
        <span class="tag admin">Admin</span>
      </div>
      <div class="grid-two-col">
        <DataForm
          title="学院"
          :model="adminForms.college"
          :fields="collegeFields"
          @update="(payload) => onModelUpdate('college', payload)"
          @submit="saveCollege"
        />
        <DataForm
          title="专业"
          :model="adminForms.major"
          :fields="majorFields"
          @update="(payload) => onModelUpdate('major', payload)"
          @submit="saveMajor"
        />
        <DataForm
          title="课程"
          :model="adminForms.course"
          :fields="courseFields"
          @update="(payload) => onModelUpdate('course', payload)"
          @submit="saveCourse"
        />
        <DataForm
          title="培养计划"
          :model="adminForms.plan"
          :fields="planFields"
          @update="(payload) => onModelUpdate('plan', payload)"
          @submit="savePlan"
        />
        <DataForm
          title="教师"
          :model="adminForms.teacher"
          :fields="teacherFields"
          @update="(payload) => onModelUpdate('teacher', payload)"
          @submit="saveTeacher"
        />
        <DataForm
          title="学生"
          :model="adminForms.student"
          :fields="studentFields"
          @update="(payload) => onModelUpdate('student', payload)"
          @submit="saveStudent"
        />
        <DataForm
          title="班级"
          :model="adminForms.clazz"
          :fields="clazzFields"
          @update="(payload) => onModelUpdate('clazz', payload)"
          @submit="saveClazz"
        />
        <DataForm
          title="教学任务"
          :model="adminForms.assignment"
          :fields="assignmentFields"
          @update="(payload) => onModelUpdate('assignment', payload)"
          @submit="saveAssignment"
        />
      </div>
      <div class="card" style="margin-top: 16px;">
        <h3>删除教师/学生</h3>
        <div class="flex-row">
          <label>教师 ID<input v-model="deleteIds.teacherId" type="number" /></label>
          <button class="secondary" @click="deleteTeacher">删除教师</button>
        </div>
        <div class="flex-row" style="margin-top: 8px;">
          <label>学生 ID<input v-model="deleteIds.studentId" type="number" /></label>
          <button class="secondary" @click="deleteStudent">删除学生</button>
        </div>
      </div>
      <div class="card" style="margin-top: 16px;">
        <h3>课表上传</h3>
        <div class="grid-two-col">
          <label>
            所属类型（TEACHER/STUDENT/CLASS）
            <input v-model="adminForms.timetable.ownerType" />
          </label>
          <label>
            所属 ID
            <input v-model="adminForms.timetable.ownerId" type="number" />
          </label>
          <label>
            学期
            <input v-model="adminForms.timetable.term" />
          </label>
          <label>
            课表文件
            <input type="file" @change="onTimetableFileChange" />
          </label>
        </div>
        <div style="margin-top: 10px;">
          <button @click="uploadTimetable">上传课表</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="section-header">
        <h2>管理员：查询</h2>
        <span class="tag admin">Admin</span>
      </div>
      <div class="grid-two-col">
        <QueryCard title="学院列表" @submit="listColleges">
          <SimpleTable v-if="lists.colleges.length" :rows="lists.colleges" />
        </QueryCard>
        <QueryCard title="专业列表" @submit="listMajors">
          <label>
            学院 ID
            <input v-model="listFilters.major.collegeId" type="number" />
          </label>
          <SimpleTable v-if="lists.majors.length" :rows="lists.majors" />
        </QueryCard>
        <QueryCard title="课程列表" @submit="listCourses">
          <SimpleTable v-if="lists.courses.length" :rows="lists.courses" />
        </QueryCard>
        <QueryCard title="培养计划" @submit="listPlans">
          <div class="flex-row">
            <label>
              学期
              <input v-model="listFilters.plan.term" />
            </label>
            <label>
              专业 ID
              <input v-model="listFilters.plan.majorId" type="number" />
            </label>
          </div>
          <SimpleTable v-if="lists.plans.length" :rows="lists.plans" />
        </QueryCard>
        <QueryCard title="教师列表" @submit="listTeachers">
          <SimpleTable v-if="lists.teachers.length" :rows="lists.teachers" />
        </QueryCard>
        <QueryCard title="学生列表" @submit="listStudents">
          <SimpleTable v-if="lists.students.length" :rows="lists.students" />
        </QueryCard>
        <QueryCard title="班级列表" @submit="listClazzes">
          <label>
            专业 ID
            <input v-model="listFilters.clazz.majorId" type="number" />
          </label>
          <SimpleTable v-if="lists.clazzes.length" :rows="lists.clazzes" />
        </QueryCard>
        <QueryCard title="教学任务列表" @submit="listAssignments">
          <label>
            学期
            <input v-model="listFilters.assignment.term" />
          </label>
          <SimpleTable v-if="lists.assignments.length" :rows="lists.assignments" />
        </QueryCard>
        <QueryCard title="课表列表" @submit="listTimetables">
          <div class="flex-row">
            <label>
              所属类型
              <input v-model="listFilters.timetable.ownerType" />
            </label>
            <label>
              所属 ID（可选）
              <input v-model="listFilters.timetable.ownerId" type="number" />
            </label>
            <label>
              学期
              <input v-model="listFilters.timetable.term" />
            </label>
          </div>
          <SimpleTable v-if="lists.timetables.length" :rows="lists.timetables" />
        </QueryCard>
      </div>
    </section>

    <section class="card">
      <div class="section-header">
        <h2>教师端</h2>
        <span class="tag teacher">Teacher</span>
      </div>
      <div class="grid-two-col">
        <div class="card">
          <h3>成绩录入</h3>
          <div class="grid-two-col">
            <label>学生 ID<input v-model="gradeForm.studentId" type="number" /></label>
            <label>课程 ID<input v-model="gradeForm.courseId" type="number" /></label>
            <label>学期<input v-model="gradeForm.term" /></label>
            <label>分数<input v-model="gradeForm.score" type="number" min="0" max="100" /></label>
          </div>
          <button style="margin-top: 10px;" @click="submitGrade">提交成绩</button>
        </div>

        <div class="card">
          <h3>我的教学任务</h3>
          <div class="flex-row">
            <label>教师 ID<input v-model="teacherQueries.teacherId" type="number" /></label>
            <label>学期<input v-model="teacherQueries.term" /></label>
          </div>
          <div class="flex-row" style="margin-top: 8px; gap: 8px;">
            <button class="secondary" @click="loadTeacherAssignments">查询任务</button>
            <button class="secondary" @click="loadTeacherGrades">查询成绩</button>
            <button class="secondary" @click="loadTeacherTimetable">下载课表</button>
          </div>
          <div class="flex-row" style="margin-top: 8px; align-items: center;">
            <label>导出花名册：班级ID<input v-model="rosterQuery.classId" type="number" /></label>
            <label>学期<input v-model="rosterQuery.term" /></label>
            <button @click="exportRoster">导出花名册</button>
          </div>
          <div v-if="teacherResults.assignments.length" class="response-box" style="margin-top: 8px;">
            {{ formatJson(teacherResults.assignments) }}
          </div>
          <div v-if="teacherResults.grades.length" class="response-box" style="margin-top: 8px;">
            {{ formatJson(teacherResults.grades) }}
          </div>
          <div v-if="teacherResults.timetable" class="response-box" style="margin-top: 8px;">
            {{ formatJson(teacherResults.timetable) }}
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="section-header">
        <h2>学生端</h2>
        <span class="tag student">Student</span>
      </div>
      <div class="grid-two-col">
        <div class="card">
          <h3>成绩查询</h3>
          <div class="flex-row">
            <label>学生 ID<input v-model="studentQueries.studentId" type="number" /></label>
            <label>学期<input v-model="studentQueries.term" /></label>
          </div>
          <button style="margin-top: 8px;" @click="loadStudentGrades">获取成绩</button>
          <div v-if="studentResults.grades.length" class="response-box" style="margin-top: 8px;">
            {{ formatJson(studentResults.grades) }}
          </div>
        </div>
        <div class="card">
          <h3>课表下载</h3>
          <div class="flex-row">
            <label>学生 ID<input v-model="studentQueries.studentId" type="number" /></label>
            <label>学期<input v-model="studentQueries.term" /></label>
          </div>
          <button style="margin-top: 8px;" @click="loadStudentTimetable">获取课表</button>
          <div v-if="studentResults.timetable" class="response-box" style="margin-top: 8px;">
            {{ formatJson(studentResults.timetable) }}
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="section-header">
        <h2>最近响应</h2>
        <span class="helper-text">所有接口调用都会同步到这里便于排查</span>
      </div>
      <div class="response-box">{{ responseLog }}</div>
    </section>
  </main>
</template>

<script setup>
import { defineComponent, reactive, ref } from 'vue';
import { apiRequest, apiRequestBlob } from './apiClient.js';

const baseUrl = ref('http://localhost:8080');
const responseLog = ref('等待调用...');

const auth = reactive({
  key: 'demo-key',
  captchaImage: '',
  username: '',
  password: '',
  role: 'ADMIN',
  captcha: '',
  loginResponse: null,
});

const teacherPassword = reactive({ username: '', oldPassword: '', newPassword: '' });
const studentPassword = reactive({ username: '', oldPassword: '', newPassword: '' });

const adminForms = reactive({
  college: { name: '', code: '', description: '' },
  major: { name: '', code: '', collegeId: '', description: '' },
  course: { code: '', name: '', credit: '', assessmentMethod: '', category: '', nature: '' },
  plan: { term: '', majorId: '', courseId: '' },
  teacher: { teacherNo: '', name: '', title: '', hiredDate: '', collegeId: '', photoUrl: '', phone: '', email: '' },
  student: {
    studentNo: '',
    name: '',
    gender: '',
    birthday: '',
    classId: '',
    photoUrl: '',
    phone: '',
    email: '',
    enrollmentDate: '',
  },
  clazz: { name: '', majorId: '', grade: '', counselor: '' },
  assignment: { termPlanId: '', teacherId: '', courseType: '', remarks: '' },
  timetable: { ownerType: 'TEACHER', ownerId: '', term: '', file: null },
});
const deleteIds = reactive({ teacherId: '', studentId: '' });

const lists = reactive({
  colleges: [],
  majors: [],
  courses: [],
  plans: [],
  teachers: [],
  students: [],
  clazzes: [],
  assignments: [],
  timetables: [],
});

const listFilters = reactive({
  major: { collegeId: '' },
  plan: { term: '', majorId: '' },
  clazz: { majorId: '' },
  assignment: { term: '' },
  timetable: { ownerType: '', ownerId: '', term: '' },
});

const gradeForm = reactive({ studentId: '', courseId: '', term: '', score: '' });
const teacherQueries = reactive({ teacherId: '', term: '' });
const rosterQuery = reactive({ classId: '', term: '' });
const studentQueries = reactive({ studentId: '', term: '' });

const teacherResults = reactive({ assignments: [], grades: [], timetable: null });
const studentResults = reactive({ grades: [], timetable: null });

const collegeFields = [
  { key: 'name', label: '名称' },
  { key: 'code', label: '编码' },
  { key: 'description', label: '描述' },
];
const majorFields = [
  { key: 'name', label: '名称' },
  { key: 'code', label: '编码' },
  { key: 'collegeId', label: '学院 ID', type: 'number' },
  { key: 'description', label: '描述' },
];
const courseFields = [
  { key: 'code', label: '课程代码' },
  { key: 'name', label: '课程名称' },
  { key: 'credit', label: '学分', type: 'number' },
  { key: 'assessmentMethod', label: '考核方式' },
  { key: 'category', label: '类别' },
  { key: 'nature', label: '性质' },
];
const planFields = [
  { key: 'term', label: '学期' },
  { key: 'majorId', label: '专业 ID', type: 'number' },
  { key: 'courseId', label: '课程 ID', type: 'number' },
];
const teacherFields = [
  { key: 'teacherNo', label: '工号' },
  { key: 'name', label: '姓名' },
  { key: 'title', label: '职称' },
  { key: 'hiredDate', label: '入职日期', type: 'date' },
  { key: 'collegeId', label: '学院 ID', type: 'number' },
  { key: 'photoUrl', label: '照片 URL' },
  { key: 'phone', label: '电话' },
  { key: 'email', label: '邮箱' },
];
const studentFields = [
  { key: 'studentNo', label: '学号' },
  { key: 'name', label: '姓名' },
  { key: 'gender', label: '性别' },
  { key: 'birthday', label: '生日', type: 'date' },
  { key: 'classId', label: '班级 ID', type: 'number' },
  { key: 'photoUrl', label: '照片 URL' },
  { key: 'phone', label: '电话' },
  { key: 'email', label: '邮箱' },
  { key: 'enrollmentDate', label: '入学日期', type: 'date' },
];
const clazzFields = [
  { key: 'name', label: '班级名称' },
  { key: 'majorId', label: '专业 ID', type: 'number' },
  { key: 'grade', label: '年级', type: 'number' },
  { key: 'counselor', label: '辅导员' },
];
const assignmentFields = [
  { key: 'termPlanId', label: '培养计划 ID', type: 'number' },
  { key: 'teacherId', label: '教师 ID', type: 'number' },
  { key: 'courseType', label: '课程类型' },
  { key: 'remarks', label: '备注' },
];

function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function logResponse(title, data) {
  responseLog.value = `${title}\n${formatJson(data)}`;
}

async function loadCaptcha() {
  if (!auth.key) return;
  try {
    const res = await apiRequest(baseUrl.value, '/api/auth/captcha', { query: { key: auth.key } });
    auth.captchaImage = res.data || '';
    logResponse('验证码获取成功', res);
  } catch (error) {
    logResponse('验证码获取失败', error.message);
  }
}

async function login() {
  try {
    const res = await apiRequest(baseUrl.value, '/api/auth/login', {
      method: 'POST',
      body: {
        username: auth.username,
        password: auth.password,
        captcha: auth.captcha,
        role: auth.role,
      },
    });
    auth.loginResponse = res;
    logResponse('登录成功', res);
  } catch (error) {
    logResponse('登录失败', error.message);
  }
}

async function changePassword(path, payload, label) {
  try {
    const res = await apiRequest(baseUrl.value, path, { method: 'POST', body: payload });
    logResponse(`${label}成功`, res);
  } catch (error) {
    logResponse(`${label}失败`, error.message);
  }
}

async function saveCollege() {
  await callAdminSaver('/api/admin/college', adminForms.college, '学院保存');
}
async function saveMajor() {
  await callAdminSaver('/api/admin/major', adminForms.major, '专业保存');
}
async function saveCourse() {
  await callAdminSaver('/api/admin/course', adminForms.course, '课程保存');
}
async function savePlan() {
  await callAdminSaver('/api/admin/plan', adminForms.plan, '培养计划保存');
}
async function saveTeacher() {
  await callAdminSaver('/api/admin/teacher', adminForms.teacher, '教师保存');
}
async function saveStudent() {
  await callAdminSaver('/api/admin/student', adminForms.student, '学生保存');
}
async function saveClazz() {
  await callAdminSaver('/api/admin/clazz', adminForms.clazz, '班级保存');
}
async function saveAssignment() {
  await callAdminSaver('/api/admin/assignment', adminForms.assignment, '教学任务保存');
}

async function callAdminSaver(path, payload, label) {
  try {
    const res = await apiRequest(baseUrl.value, path, { method: 'POST', body: payload });
    logResponse(`${label}成功`, res);
  } catch (error) {
    logResponse(`${label}失败`, error.message);
  }
}

async function deleteTeacher() {
  if (!deleteIds.teacherId) return logResponse('删除教师失败', '请填写教师 ID');
  try {
    const res = await apiRequest(baseUrl.value, `/api/admin/teacher/${deleteIds.teacherId}`, { method: 'DELETE' });
    logResponse('删除教师成功', res);
  } catch (error) {
    logResponse('删除教师失败', error.message);
  }
}

async function deleteStudent() {
  if (!deleteIds.studentId) return logResponse('删除学生失败', '请填写学生 ID');
  try {
    const res = await apiRequest(baseUrl.value, `/api/admin/student/${deleteIds.studentId}`, { method: 'DELETE' });
    logResponse('删除学生成功', res);
  } catch (error) {
    logResponse('删除学生失败', error.message);
  }
}

function onTimetableFileChange(event) {
  const [file] = event.target.files;
  adminForms.timetable.file = file || null;
}

async function uploadTimetable() {
  if (!adminForms.timetable.file) {
    logResponse('课表上传失败', '请先选择文件');
    return;
  }
  try {
    const formData = new FormData();
    formData.append('file', adminForms.timetable.file);
    const res = await apiRequest(baseUrl.value, '/api/admin/timetable', {
      method: 'POST',
      query: {
        ownerType: adminForms.timetable.ownerType,
        ownerId: adminForms.timetable.ownerId,
        term: adminForms.timetable.term,
      },
      body: formData,
      isFormData: true,
    });
    logResponse('课表上传成功', res);
  } catch (error) {
    logResponse('课表上传失败', error.message);
  }
}

async function listColleges() {
  await runListQuery('/api/admin/colleges', {}, '学院列表', (data) => (lists.colleges = data.data || []));
}

async function listMajors() {
  await runListQuery('/api/admin/majors', { collegeId: listFilters.major.collegeId }, '专业列表', (data) => (lists.majors = data.data || []));
}

async function listCourses() {
  await runListQuery('/api/admin/courses', {}, '课程列表', (data) => (lists.courses = data.data || []));
}

async function listPlans() {
  await runListQuery(
    '/api/admin/plans',
    { term: listFilters.plan.term, majorId: listFilters.plan.majorId },
    '培养计划列表',
    (data) => (lists.plans = data.data || [])
  );
}

async function listTeachers() {
  await runListQuery('/api/admin/teachers', {}, '教师列表', (data) => (lists.teachers = data.data || []));
}

async function listStudents() {
  await runListQuery('/api/admin/students', {}, '学生列表', (data) => (lists.students = data.data || []));
}

async function listClazzes() {
  await runListQuery('/api/admin/clazzes', { majorId: listFilters.clazz.majorId }, '班级列表', (data) => (lists.clazzes = data.data || []));
}

async function listAssignments() {
  await runListQuery('/api/admin/assignments', { term: listFilters.assignment.term }, '教学任务列表', (data) => (lists.assignments = data.data || []));
}

async function listTimetables() {
  await runListQuery(
    '/api/admin/timetables',
    { ownerType: listFilters.timetable.ownerType, ownerId: listFilters.timetable.ownerId, term: listFilters.timetable.term },
    '课表列表',
    (data) => (lists.timetables = data.data || [])
  );
}

async function runListQuery(path, query, label, onSuccess) {
  try {
    const res = await apiRequest(baseUrl.value, path, { query });
    onSuccess(res);
    logResponse(`${label}获取成功`, res);
  } catch (error) {
    logResponse(`${label}获取失败`, error.message);
  }
}

function onModelUpdate(section, payload) {
  if (!payload || !payload.key) return;
  adminForms[section][payload.key] = payload.value;
}

async function submitGrade() {
  try {
    const res = await apiRequest(baseUrl.value, '/api/teacher/grade', {
      method: 'POST',
      body: {
        studentId: Number(gradeForm.studentId),
        courseId: Number(gradeForm.courseId),
        term: gradeForm.term,
        score: gradeForm.score === '' ? undefined : Number(gradeForm.score),
      },
    });
    logResponse('成绩提交成功', res);
  } catch (error) {
    logResponse('成绩提交失败', error.message);
  }
}

async function loadTeacherAssignments() {
  await runTeacherQuery('/api/teacher/assignments', teacherQueries, '教师任务', (res) => {
    teacherResults.assignments = res.data || [];
  });
}

async function loadTeacherGrades() {
  await runTeacherQuery('/api/teacher/grades', teacherQueries, '教师成绩', (res) => {
    teacherResults.grades = res.data || [];
  });
}

async function loadTeacherTimetable() {
  await runTeacherQuery('/api/teacher/timetable', teacherQueries, '教师课表', (res) => {
    teacherResults.timetable = res.data || null;
  });
}

async function runTeacherQuery(path, queryBase, label, onSuccess) {
  try {
    const res = await apiRequest(baseUrl.value, path, {
      query: { teacherId: queryBase.teacherId, term: queryBase.term },
    });
    onSuccess(res);
    logResponse(`${label}获取成功`, res);
  } catch (error) {
    logResponse(`${label}获取失败`, error.message);
  }
}

async function exportRoster() {
  try {
    const blob = await apiRequestBlob(baseUrl.value, '/api/teacher/roster/export', {
      query: { classId: rosterQuery.classId, term: rosterQuery.term },
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roster-${rosterQuery.classId || 'class'}-${rosterQuery.term || 'term'}.bin`;
    a.click();
    URL.revokeObjectURL(url);
    logResponse('花名册导出成功，已触发下载', { size: blob.size });
  } catch (error) {
    logResponse('花名册导出失败', error.message);
  }
}

async function loadStudentGrades() {
  await runStudentQuery('/api/student/grades', '学生成绩', (res) => {
    studentResults.grades = res.data || [];
  });
}

async function loadStudentTimetable() {
  await runStudentQuery('/api/student/timetable', '学生课表', (res) => {
    studentResults.timetable = res.data || null;
  });
}

async function runStudentQuery(path, label, onSuccess) {
  try {
    const res = await apiRequest(baseUrl.value, path, {
      query: { studentId: studentQueries.studentId, term: studentQueries.term },
    });
    onSuccess(res);
    logResponse(`${label}获取成功`, res);
  } catch (error) {
    logResponse(`${label}获取失败`, error.message);
  }
}

const PasswordForm = defineComponent({
  props: ['username', 'oldPassword', 'newPassword'],
  emits: ['update:username', 'update:oldPassword', 'update:newPassword', 'submit'],
  template: `
    <div class="grid-two-col">
      <label>用户名<input :value="username" @input="$emit('update:username', $event.target.value)" /></label>
      <label>旧密码<input type="password" :value="oldPassword" @input="$emit('update:oldPassword', $event.target.value)" /></label>
      <label>新密码<input type="password" :value="newPassword" @input="$emit('update:newPassword', $event.target.value)" /></label>
    </div>
    <button style="margin-top: 10px;" @click="$emit('submit')">提交</button>
  `,
});

const DataForm = defineComponent({
  props: ['title', 'model', 'fields'],
  emits: ['submit', 'update'],
  template: `
    <div class="card">
      <h3>{{ title }}</h3>
      <div class="grid-two-col">
        <label v-for="field in fields" :key="field.key">
          {{ field.label }}
          <input
            :type="field.type || 'text'"
            :value="model[field.key]"
            @input="$emit('update', { key: field.key, value: $event.target.value })"
          />
        </label>
      </div>
      <button style="margin-top: 10px;" @click="$emit('submit')">保存 {{ title }}</button>
    </div>
  `,
});

const QueryCard = defineComponent({
  props: ['title'],
  emits: ['submit'],
  template: `
    <div class="card">
      <h3 v-if="title">{{ title }}</h3>
      <slot></slot>
      <button style="margin-top: 10px;" @click="$emit('submit')">查询</button>
      <div style="margin-top: 8px;">
        <slot name="results"></slot>
      </div>
    </div>
  `,
});

const SimpleTable = defineComponent({
  props: ['rows'],
  computed: {
    headers() {
      if (!this.rows || !this.rows.length) return [];
      return Object.keys(this.rows[0]);
    },
  },
  template: `
    <table class="table-preview">
      <thead>
        <tr>
          <th v-for="h in headers" :key="h">{{ h }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="idx">
          <td v-for="h in headers" :key="h">{{ row[h] }}</td>
        </tr>
      </tbody>
    </table>
  `,
});
</script>
