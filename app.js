// ===== STATE =====
let currentUser = null;
let employees   = JSON.parse(localStorage.getItem('ems_employees'))   || [...DEFAULT_EMPLOYEES];
let departments = JSON.parse(localStorage.getItem('ems_departments')) || [...DEFAULT_DEPARTMENTS];
let users       = JSON.parse(localStorage.getItem('ems_users'))       || [...DEFAULT_USERS];
let activityLog = JSON.parse(localStorage.getItem('ems_activity'))    || [...DEFAULT_ACTIVITY];
let editingId   = null;
let editingDept = null;
let deleteTarget= null;
let deleteType  = null;
let sortCol     = 'id';
let sortDir     = 1;
let currentPage = 1;
const PAGE_SIZE = 10;
let notifications = [];

// ===== SAVE =====
function save() {
  localStorage.setItem('ems_employees',   JSON.stringify(employees));
  localStorage.setItem('ems_departments', JSON.stringify(departments));
  localStorage.setItem('ems_users',       JSON.stringify(users));
  localStorage.setItem('ems_activity',    JSON.stringify(activityLog));
}

// ===== AUTH =====
function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');

  if (!u || !p) { errEl.textContent = '⚠️ Please enter username and password.'; return; }

  const user = users.find(x => x.username === u && x.password === p);
  if (!user) { errEl.textContent = '❌ Invalid credentials. Please try again.'; return; }

  currentUser = user;
  sessionStorage.setItem('ems_session', JSON.stringify(user));
  errEl.textContent = '';
  bootApp();
}

function handleLogout() {
  currentUser = null;
  sessionStorage.removeItem('ems_session');
  document.getElementById('mainApp').style.display  = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function togglePass() {
  const inp = document.getElementById('loginPass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ===== BOOT =====
function bootApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('mainApp').style.display   = 'flex';

  document.getElementById('suName').textContent   = currentUser.name;
  document.getElementById('suRole').textContent   = currentUser.role;
  document.getElementById('suAvatar').textContent = currentUser.name[0].toUpperCase();

  // Permission based UI
  const canWrite  = currentUser.permissions.includes('write');
  const canDelete = currentUser.permissions.includes('delete');
  document.getElementById('addEmpBtn').style.display  = canWrite  ? '' : 'none';
  document.getElementById('addDeptBtn').style.display = canWrite  ? '' : 'none';

  populateDeptDropdowns();
  populateRoleFilter();
  renderDashboard();
  renderEmployeeTable();
  renderDepartments();
  renderReports();
  renderSettings();
  buildNotifications();
  showSection('dashboard', document.querySelector('.nav-item'));
}

// ===== SESSION RESTORE =====
window.addEventListener('DOMContentLoaded', () => {
  const saved = sessionStorage.getItem('ems_session');
  if (saved) { currentUser = JSON.parse(saved); bootApp(); }
  else { document.getElementById('loginPage').style.display = 'flex'; }
  const theme = localStorage.getItem('ems_theme') || 'dark';
  document.body.setAttribute('data-theme', theme);
});

// ===== NAVIGATION =====
function showSection(name, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`sec-${name}`).classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('pageTitle').textContent  = capitalize(name);
  document.getElementById('breadcrumb').textContent = `Home / ${capitalize(name)}`;
  if (name === 'reports') setTimeout(renderReports, 50);
  return false;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ===== POPULATE DROPDOWNS =====
function populateDeptDropdowns() {
  const opts = departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  document.getElementById('fDepartment').innerHTML = '<option value="">Select Department</option>' + opts;
  document.getElementById('deptFilter').innerHTML  = '<option value="">All Departments</option>' + opts;
}
function populateRoleFilter() {
  const roles = [...new Set(employees.map(e => e.role))].sort();
  document.getElementById('roleFilter').innerHTML = '<option value="">All Roles</option>' +
    roles.map(r => `<option value="${r}">${r}</option>`).join('');
}

// ===== DASHBOARD =====
function renderDashboard() {
  const total    = employees.length;
  const active   = employees.filter(e => e.status === 'Active').length;
  const onLeave  = employees.filter(e => e.status === 'On Leave').length;
  const inactive = employees.filter(e => e.status === 'Inactive').length;
  const avgSal   = Math.round(employees.reduce((s,e) => s+e.salary, 0) / total);

  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card" style="--accent-c:#6366f1">
      <div class="stat-icon">👥</div>
      <div class="stat-val">${total}</div>
      <div class="stat-label">Total Employees</div>
      <div class="stat-sub">${departments.length} departments</div>
    </div>
    <div class="stat-card" style="--accent-c:#10b981">
      <div class="stat-icon">✅</div>
      <div class="stat-val">${active}</div>
      <div class="stat-label">Active</div>
      <div class="stat-sub">${Math.round(active/total*100)}% of total</div>
    </div>
    <div class="stat-card" style="--accent-c:#f59e0b">
      <div class="stat-icon">🏖️</div>
      <div class="stat-val">${onLeave}</div>
      <div class="stat-label">On Leave</div>
      <div class="stat-sub">${inactive} inactive</div>
    </div>
    <div class="stat-card" style="--accent-c:#3b82f6">
      <div class="stat-icon">💰</div>
      <div class="stat-val">₹${(avgSal/1000).toFixed(1)}k</div>
      <div class="stat-label">Avg Salary</div>
      <div class="stat-sub">Per month</div>
    </div>
  `;

  // Recent employees
  const recent = [...employees].sort((a,b) => new Date(b.joinDate)-new Date(a.joinDate)).slice(0,5);
  document.getElementById('recentEmployees').innerHTML = recent.map(e => `
    <div class="mini-row">
      <div class="mini-avatar" style="background:${deptColor(e.department)}">${e.firstName[0]}</div>
      <div>
        <div class="mini-name">${e.firstName} ${e.lastName}</div>
        <div class="mini-info">${e.role} · ${e.department}</div>
      </div>
      <div class="status-badge ${statusClass(e.status)}">${e.status}</div>
    </div>
  `).join('');

  // Dept overview
  document.getElementById('deptOverview').innerHTML = departments.map(d => {
    const count = employees.filter(e => e.department === d.name).length;
    const pct   = Math.round(count/employees.length*100) || 0;
    return `
    <div class="dept-row">
      <div class="dept-dot" style="background:${d.color}"></div>
      <div style="flex:1">
        <div class="dept-row-name">${d.name}</div>
        <div class="dept-bar-wrap"><div class="dept-bar" style="width:${pct}%;background:${d.color}"></div></div>
      </div>
      <div class="dept-count">${count}</div>
    </div>`;
  }).join('');

  // Activity log
  document.getElementById('activityLog').innerHTML = activityLog.slice(0,8).map(a => `
    <div class="activity-item">
      <div class="act-icon ${a.type}">${a.type==='add'?'➕':a.type==='edit'?'✏️':'🗑️'}</div>
      <div>
        <div class="act-msg">${a.msg}</div>
        <div class="act-meta">${a.time} · by ${a.user}</div>
      </div>
    </div>
  `).join('');
}

// ===== EMPLOYEE TABLE =====
function getFilteredEmployees() {
  const dept   = document.getElementById('deptFilter').value;
  const status = document.getElementById('statusFilter').value;
  const role   = document.getElementById('roleFilter').value;
  const search = document.getElementById('globalSearch').value.toLowerCase();

  return employees.filter(e => {
    const nameMatch = `${e.firstName} ${e.lastName} ${e.email} ${e.id}`.toLowerCase().includes(search);
    return nameMatch &&
      (!dept   || e.department === dept) &&
      (!status || e.status === status) &&
      (!role   || e.role === role);
  }).sort((a,b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (sortCol==='salary') { va=+va; vb=+vb; }
    return va < vb ? -sortDir : va > vb ? sortDir : 0;
  });
}

function renderEmployeeTable() {
  const filtered = getFilteredEmployees();
  const total    = filtered.length;
  const pages    = Math.ceil(total/PAGE_SIZE) || 1;
  if (currentPage > pages) currentPage = 1;
  const slice = filtered.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
  const canWrite  = currentUser?.permissions.includes('write');
  const canDelete = currentUser?.permissions.includes('delete');

  document.getElementById('empTableBody').innerHTML = slice.length ? slice.map(e => `
    <tr>
      <td><code>${e.id}</code></td>
      <td>
        <div class="td-name">
          <div class="td-avatar" style="background:${deptColor(e.department)}">${e.firstName[0]}</div>
          <div>
            <div>${e.firstName} ${e.lastName}</div>
            <div class="td-email">${e.email}</div>
          </div>
        </div>
      </td>
      <td><span class="dept-chip" style="--dc:${deptColor(e.department)}">${e.department}</span></td>
      <td>${e.role}</td>
      <td>₹${Number(e.salary).toLocaleString('en-IN')}</td>
      <td>${formatDate(e.joinDate)}</td>
      <td><span class="status-badge ${statusClass(e.status)}">${e.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="act-btn view" onclick="viewEmployee('${e.id}')" title="View">👁</button>
          ${canWrite  ? `<button class="act-btn edit" onclick="openModal('edit','${e.id}')" title="Edit">✏️</button>` : ''}
          ${canDelete ? `<button class="act-btn del"  onclick="confirmDelete('emp','${e.id}')" title="Delete">🗑️</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="8" class="no-data">No employees found 😕</td></tr>`;

  document.getElementById('tableInfo').textContent =
    `Showing ${(currentPage-1)*PAGE_SIZE+1}–${Math.min(currentPage*PAGE_SIZE,total)} of ${total} employees`;

  // Pagination
  let pages_html = '';
  for (let i=1;i<=pages;i++) {
    pages_html += `<button class="page-btn ${i===currentPage?'active':''}" onclick="goPage(${i})">${i}</button>`;
  }
  document.getElementById('pagination').innerHTML =
    `<button class="page-btn" onclick="goPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>
    ${pages_html}
    <button class="page-btn" onclick="goPage(${currentPage+1})" ${currentPage===pages?'disabled':''}>›</button>`;
}

function goPage(p) {
  const pages = Math.ceil(getFilteredEmployees().length/PAGE_SIZE);
  if (p<1||p>pages) return;
  currentPage = p;
  renderEmployeeTable();
}

function sortTable(col) {
  if (sortCol===col) sortDir*=-1; else { sortCol=col; sortDir=1; }
  renderEmployeeTable();
}

function globalSearchFn() {
  currentPage = 1;
  renderEmployeeTable();
}

// ===== ADD / EDIT MODAL =====
function openModal(mode, id=null) {
  editingId = id;
  document.getElementById('empModal').style.display = 'flex';
  populateDeptDropdowns();

  if (mode==='edit' && id) {
    const e = employees.find(x => x.id===id);
    document.getElementById('modalTitle').textContent    = '✏️ Edit Employee';
    document.getElementById('modalSaveBtn').textContent  = 'Update Employee';
    document.getElementById('fFirstName').value = e.firstName;
    document.getElementById('fLastName').value  = e.lastName;
    document.getElementById('fEmail').value     = e.email;
    document.getElementById('fPhone').value     = e.phone;
    document.getElementById('fDepartment').value= e.department;
    document.getElementById('fRole').value      = e.role;
    document.getElementById('fSalary').value    = e.salary;
    document.getElementById('fJoinDate').value  = e.joinDate;
    document.getElementById('fStatus').value    = e.status;
    document.getElementById('fGender').value    = e.gender;
    document.getElementById('fAddress').value   = e.address || '';
  } else {
    document.getElementById('modalTitle').textContent   = '➕ Add Employee';
    document.getElementById('modalSaveBtn').textContent = 'Save Employee';
    clearForm();
  }
  clearErrors();
}

function closeModal() { document.getElementById('empModal').style.display='none'; editingId=null; }

function clearForm() {
  ['fFirstName','fLastName','fEmail','fPhone','fRole','fSalary','fAddress'].forEach(id => document.getElementById(id).value='');
  document.getElementById('fDepartment').value = '';
  document.getElementById('fStatus').value     = 'Active';
  document.getElementById('fGender').value     = 'Male';
  document.getElementById('fJoinDate').value   = new Date().toISOString().split('T')[0];
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent='');
}

// ===== VALIDATION =====
function validateEmployee() {
  clearErrors();
  let valid = true;
  const rules = [
    { id:'fFirstName', msg:'First name is required', check: v => v.trim().length >= 2 },
    { id:'fLastName',  msg:'Last name is required',  check: v => v.trim().length >= 1 },
    { id:'fEmail',     msg:'Valid email required',   check: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
    { id:'fPhone',     msg:'10-digit phone required',check: v => /^\d{10}$/.test(v.replace(/\s/g,'')) },
    { id:'fDepartment',msg:'Select a department',    check: v => v !== '' },
    { id:'fRole',      msg:'Role is required',       check: v => v.trim().length >= 2 },
    { id:'fSalary',    msg:'Salary must be ≥ ₹5000', check: v => +v >= 5000 },
    { id:'fJoinDate',  msg:'Join date is required',  check: v => v !== '' },
  ];
  rules.forEach(r => {
    const val = document.getElementById(r.id).value;
    if (!r.check(val)) {
      document.getElementById(`e-${r.id}`).textContent = r.msg;
      valid = false;
    }
  });
  // Email uniqueness
  const email = document.getElementById('fEmail').value.trim().toLowerCase();
  const duplicate = employees.find(e => e.email.toLowerCase()===email && e.id!==editingId);
  if (duplicate) { document.getElementById('e-fEmail').textContent='Email already exists'; valid=false; }
  return valid;
}

// ===== SAVE EMPLOYEE =====
function saveEmployee() {
  if (!validateEmployee()) return;
  const data = {
    firstName:  document.getElementById('fFirstName').value.trim(),
    lastName:   document.getElementById('fLastName').value.trim(),
    email:      document.getElementById('fEmail').value.trim(),
    phone:      document.getElementById('fPhone').value.trim(),
    department: document.getElementById('fDepartment').value,
    role:       document.getElementById('fRole').value.trim(),
    salary:     +document.getElementById('fSalary').value,
    joinDate:   document.getElementById('fJoinDate').value,
    status:     document.getElementById('fStatus').value,
    gender:     document.getElementById('fGender').value,
    address:    document.getElementById('fAddress').value.trim(),
  };

  if (editingId) {
    const idx = employees.findIndex(e => e.id===editingId);
    employees[idx] = { ...employees[idx], ...data };
    logActivity(`Employee ${editingId} updated`, 'edit');
    showToast('✅ Employee updated successfully!');
  } else {
    const newId = 'EMP' + String(employees.length+1).padStart(3,'0');
    employees.push({ id:newId, ...data });
    logActivity(`New employee ${newId} (${data.firstName} ${data.lastName}) added`, 'add');
    showToast('✅ Employee added successfully!');
    addNotification(`New employee ${data.firstName} ${data.lastName} added`);
  }

  save();
  closeModal();
  renderEmployeeTable();
  renderDashboard();
  populateRoleFilter();
}

// ===== VIEW EMPLOYEE =====
function viewEmployee(id) {
  const e = employees.find(x => x.id===id);
  document.getElementById('viewModalContent').innerHTML = `
    <div class="emp-profile">
      <div class="ep-header" style="background:${deptColor(e.department)}22;border-bottom:3px solid ${deptColor(e.department)}">
        <div class="ep-avatar" style="background:${deptColor(e.department)}">${e.firstName[0]}${e.lastName[0]}</div>
        <div>
          <h2>${e.firstName} ${e.lastName}</h2>
          <div class="ep-role">${e.role}</div>
          <div class="ep-dept" style="color:${deptColor(e.department)}">${e.department}</div>
          <span class="status-badge ${statusClass(e.status)}">${e.status}</span>
        </div>
        <div class="ep-id"><code>${e.id}</code></div>
      </div>
      <div class="ep-grid">
        <div class="ep-field"><span>📧 Email</span><strong>${e.email}</strong></div>
        <div class="ep-field"><span>📞 Phone</span><strong>${e.phone}</strong></div>
        <div class="ep-field"><span>💰 Salary</span><strong>₹${Number(e.salary).toLocaleString('en-IN')}/mo</strong></div>
        <div class="ep-field"><span>📅 Joined</span><strong>${formatDate(e.joinDate)}</strong></div>
        <div class="ep-field"><span>⚧ Gender</span><strong>${e.gender}</strong></div>
        <div class="ep-field"><span>📍 Address</span><strong>${e.address||'—'}</strong></div>
      </div>
    </div>
  `;
  document.getElementById('viewModal').style.display='flex';
}

// ===== DELETE =====
function confirmDelete(type, id) {
  deleteTarget = id; deleteType = type;
  const e = type==='emp' ? employees.find(x=>x.id===id) : departments.find(x=>x.id===id);
  document.getElementById('deleteMsg').textContent =
    type==='emp'
    ? `Delete employee "${e.firstName} ${e.lastName}" (${e.id})?`
    : `Delete department "${e.name}"? This won't remove existing employees.`;
  document.getElementById('confirmDeleteBtn').onclick = executeDelete;
  document.getElementById('deleteModal').style.display='flex';
}

function executeDelete() {
  if (deleteType==='emp') {
    const e = employees.find(x=>x.id===deleteTarget);
    employees = employees.filter(x=>x.id!==deleteTarget);
    logActivity(`Employee ${deleteTarget} (${e.firstName} ${e.lastName}) deleted`, 'delete');
    showToast('🗑️ Employee deleted.');
    renderEmployeeTable();
    renderDashboard();
  } else {
    const d = departments.find(x=>x.id===deleteTarget);
    departments = departments.filter(x=>x.id!==deleteTarget);
    logActivity(`Department "${d.name}" deleted`, 'delete');
    showToast('🗑️ Department deleted.');
    renderDepartments();
    renderDashboard();
    populateDeptDropdowns();
  }
  save();
  document.getElementById('deleteModal').style.display='none';
}

// ===== DEPARTMENTS =====
function renderDepartments() {
  document.getElementById('deptGrid').innerHTML = departments.map(d => {
    const count = employees.filter(e => e.department===d.name).length;
    const canWrite  = currentUser?.permissions.includes('write');
    const canDelete = currentUser?.permissions.includes('delete');
    return `
    <div class="dept-card" style="--dc:${d.color}">
      <div class="dc-top">
        <div class="dc-icon" style="background:${d.color}22;color:${d.color}">🏢</div>
        <div class="dc-actions">
          ${canWrite  ? `<button onclick="openDeptModal('${d.id}')" class="act-btn edit">✏️</button>` : ''}
          ${canDelete ? `<button onclick="confirmDelete('dept','${d.id}')" class="act-btn del">🗑️</button>` : ''}
        </div>
      </div>
      <h3>${d.name}</h3>
      <div class="dc-head">👤 ${d.head}</div>
      <p class="dc-desc">${d.desc}</p>
      <div class="dc-footer">
        <div class="dc-count"><strong>${count}</strong> employees</div>
        <div class="dc-bar-wrap"><div class="dc-bar" style="width:${Math.min(count*10,100)}%;background:${d.color}"></div></div>
      </div>
    </div>`;
  }).join('');
}

function openDeptModal(id=null) {
  editingDept = id;
  document.getElementById('deptModal').style.display='flex';
  if (id) {
    const d = departments.find(x=>x.id===id);
    document.getElementById('deptModalTitle').textContent = '✏️ Edit Department';
    document.getElementById('deptName').value = d.name;
    document.getElementById('deptHead').value = d.head;
    document.getElementById('deptDesc').value = d.desc;
  } else {
    document.getElementById('deptModalTitle').textContent = '➕ Add Department';
    document.getElementById('deptName').value = '';
    document.getElementById('deptHead').value = '';
    document.getElementById('deptDesc').value = '';
  }
  document.getElementById('e-deptName').textContent = '';
}

function saveDept() {
  const name = document.getElementById('deptName').value.trim();
  if (!name) { document.getElementById('e-deptName').textContent='Department name required'; return; }

  const head = document.getElementById('deptHead').value.trim();
  const desc = document.getElementById('deptDesc').value.trim();
  const colors = ['#6366f1','#f59e0b','#10b981','#ec4899','#3b82f6','#8b5cf6','#ef4444','#14b8a6'];

  if (editingDept) {
    const idx = departments.findIndex(d=>d.id===editingDept);
    departments[idx] = { ...departments[idx], name, head, desc };
    logActivity(`Department "${name}" updated`, 'edit');
    showToast('✅ Department updated!');
  } else {
    const newId = 'D' + String(departments.length+1).padStart(3,'0');
    departments.push({ id:newId, name, head, desc, color:colors[departments.length%colors.length] });
    logActivity(`New department "${name}" added`, 'add');
    showToast('✅ Department added!');
  }
  save();
  renderDepartments();
  renderDashboard();
  populateDeptDropdowns();
  document.getElementById('deptModal').style.display='none';
}

// ===== REPORTS =====
function renderReports() {
  drawSalaryChart();
  drawDeptChart();
  drawJoinChart();
}

function drawSalaryChart() {
  const canvas = document.getElementById('salaryChart');
  const ctx = canvas.getContext('2d');
  const ranges = [
    { label:'<40k', min:0,    max:40000 },
    { label:'40-60k', min:40000, max:60000 },
    { label:'60-80k', min:60000, max:80000 },
    { label:'80-100k',min:80000, max:100000 },
    { label:'>100k', min:100000,max:Infinity },
  ];
  const counts = ranges.map(r => employees.filter(e=>e.salary>=r.min&&e.salary<r.max).length);
  drawBarChart(ctx, canvas, ranges.map(r=>r.label), counts, '#6366f1');
}

function drawDeptChart() {
  const canvas = document.getElementById('deptChart');
  const ctx = canvas.getContext('2d');
  const labels = departments.map(d=>d.name);
  const counts  = departments.map(d=>employees.filter(e=>e.department===d.name).length);
  const colors  = departments.map(d=>d.color);
  drawBarChart(ctx, canvas, labels, counts, colors);
}

function drawJoinChart() {
  const canvas = document.getElementById('joinChart');
  const ctx = canvas.getContext('2d');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const counts  = months.map((_,i) => employees.filter(e=>new Date(e.joinDate).getMonth()===i).length);
  drawBarChart(ctx, canvas, months, counts, '#10b981');
}

function drawBarChart(ctx, canvas, labels, data, color) {
  const W = canvas.width, H = canvas.height;
  const pad = { top:20, right:20, bottom:40, left:45 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const maxVal = Math.max(...data, 1);
  const isDark = document.body.getAttribute('data-theme')==='light';
  const textColor = isDark ? '#475569' : '#94a3b8';
  const gridColor = isDark ? '#e2e8f0' : '#1e293b';

  ctx.clearRect(0,0,W,H);

  // Grid lines
  for (let i=0;i<=4;i++) {
    const y = pad.top + chartH - (i/4)*chartH;
    ctx.beginPath(); ctx.strokeStyle=gridColor; ctx.lineWidth=0.5;
    ctx.moveTo(pad.left,y); ctx.lineTo(pad.left+chartW,y); ctx.stroke();
    ctx.fillStyle=textColor; ctx.font='11px JetBrains Mono';
    ctx.fillText(Math.round(maxVal*i/4), 2, y+4);
  }

  const bw = Math.max((chartW/labels.length)-8, 10);
  labels.forEach((lbl,i) => {
    const x   = pad.left + i*(chartW/labels.length) + (chartW/labels.length-bw)/2;
    const h   = (data[i]/maxVal)*chartH;
    const y   = pad.top + chartH - h;
    const col = Array.isArray(color) ? color[i] : color;
    const grad = ctx.createLinearGradient(0,y,0,pad.top+chartH);
    grad.addColorStop(0, col);
    grad.addColorStop(1, col+'44');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, bw, h, [4,4,0,0]);
    ctx.fill();
    // Label
    ctx.fillStyle=textColor; ctx.font='10px Space Grotesk';
    ctx.textAlign='center';
    ctx.fillText(lbl, x+bw/2, H-6);
    // Value
    if (data[i]>0) { ctx.fillStyle=col; ctx.fillText(data[i], x+bw/2, y-4); }
  });
  ctx.textAlign='left';
}

// ===== SETTINGS =====
function renderSettings() {
  document.getElementById('adminAccounts').innerHTML = users.map(u => `
    <div class="admin-row">
      <div class="mini-avatar" style="background:#6366f1">${u.name[0]}</div>
      <div>
        <div class="mini-name">${u.name}</div>
        <div class="mini-info">${u.role} · ${u.username}</div>
      </div>
      <div class="perm-chips">${u.permissions.map(p=>`<span class="perm-chip">${p}</span>`).join('')}</div>
    </div>
  `).join('');
}

function changePassword() {
  const cur = document.getElementById('curPass').value;
  const nw  = document.getElementById('newPass').value;
  const con = document.getElementById('conPass').value;
  const u   = users.find(x=>x.username===currentUser.username);
  if (cur !== u.password)    { showToast('❌ Current password wrong!', 'error'); return; }
  if (nw.length < 6)         { showToast('❌ New password min 6 chars!', 'error'); return; }
  if (nw !== con)            { showToast('❌ Passwords do not match!', 'error'); return; }
  u.password = nw;
  currentUser.password = nw;
  sessionStorage.setItem('ems_session', JSON.stringify(currentUser));
  save();
  ['curPass','newPass','conPass'].forEach(id => document.getElementById(id).value='');
  showToast('✅ Password changed successfully!');
}

function setTheme(theme, btn) {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('ems_theme', theme);
  document.querySelectorAll('.theme-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  setTimeout(renderReports, 100);
}

function resetData() {
  if (!confirm('Reset all data to default? This cannot be undone!')) return;
  employees   = [...DEFAULT_EMPLOYEES];
  departments = [...DEFAULT_DEPARTMENTS];
  activityLog = [...DEFAULT_ACTIVITY];
  save();
  renderDashboard(); renderEmployeeTable(); renderDepartments(); populateDeptDropdowns(); populateRoleFilter();
  showToast('✅ Data reset to default!');
}

// ===== EXPORT CSV =====
function exportCSV() {
  const headers = ['ID','First Name','Last Name','Email','Phone','Department','Role','Salary','Join Date','Status','Gender'];
  const rows    = employees.map(e => [e.id,e.firstName,e.lastName,e.email,e.phone,e.department,e.role,e.salary,e.joinDate,e.status,e.gender]);
  const csv     = [headers, ...rows].map(r=>r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  showToast('⬇️ CSV exported!');
}

// ===== NOTIFICATIONS =====
function buildNotifications() {
  notifications = [
    { msg:'3 employees have birthdays this week 🎂', time:'Just now' },
    { msg:'2 employees on leave today', time:'1 hour ago' },
    { msg:'Monthly salary report due tomorrow', time:'5 hours ago' },
  ];
  document.getElementById('notifDot').style.display = notifications.length ? '' : 'none';
  document.getElementById('notifList').innerHTML = notifications.map(n=>`
    <div class="notif-item"><div class="notif-msg">${n.msg}</div><div class="notif-time">${n.time}</div></div>
  `).join('');
}
function addNotification(msg) {
  notifications.unshift({ msg, time:'Just now' });
  buildNotifications();
}
function toggleNotif() {
  const p = document.getElementById('notifPanel');
  p.style.display = p.style.display==='none' ? 'block' : 'none';
}

// ===== ACTIVITY LOG =====
function logActivity(msg, type) {
  activityLog.unshift({ msg, time:'Just now', type, user:currentUser.username });
  if (activityLog.length > 50) activityLog.pop();
}

// ===== HELPERS =====
function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}
function statusClass(s) { return s==='Active'?'s-active':s==='Inactive'?'s-inactive':'s-leave'; }
function deptColor(name) {
  const d = departments.find(x=>x.name===name);
  return d ? d.color : '#6366f1';
}
function capitalize(s) { return s.charAt(0).toUpperCase()+s.slice(1); }

// ===== TOAST =====
function showToast(msg, type='success') {
  const t = document.createElement('div');
  t.className = `toast ${type==='error'?'t-error':'t-success'}`;
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(()=>t.classList.add('show'),10);
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); },3500);
}

// Close panels on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('#notifPanel') && !e.target.closest('.notif-btn'))
    document.getElementById('notifPanel').style.display='none';
});
document.querySelectorAll('.modal-overlay').forEach(el=>{
  el.addEventListener('click',e=>{ if(e.target===el) el.style.display='none'; });
});
