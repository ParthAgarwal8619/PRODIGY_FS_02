// ===== AUTH USERS =====
const DEFAULT_USERS = [
  { username:'admin', password:'admin123', role:'Administrator', name:'Admin User', permissions:['read','write','delete','manage'] },
  { username:'hr',    password:'hr123',    role:'HR Manager',    name:'HR Manager', permissions:['read','write'] },
  { username:'viewer',password:'view123',  role:'Viewer',        name:'View Only',  permissions:['read'] },
];

// ===== DEFAULT DEPARTMENTS =====
const DEFAULT_DEPARTMENTS = [
  { id:'D001', name:'Engineering',   head:'Amit Verma',    desc:'Software development and tech infrastructure', color:'#6366f1' },
  { id:'D002', name:'Human Resources', head:'Sunita Mehra', desc:'Recruitment, training and employee welfare', color:'#f59e0b' },
  { id:'D003', name:'Sales',         head:'Rohit Kapoor',  desc:'Revenue generation and client management', color:'#10b981' },
  { id:'D004', name:'Marketing',     head:'Priya Singh',   desc:'Brand building and digital marketing', color:'#ec4899' },
  { id:'D005', name:'Finance',       head:'Vikram Joshi',  desc:'Accounting, budgeting and financial planning', color:'#3b82f6' },
  { id:'D006', name:'Operations',    head:'Neha Gupta',    desc:'Day to day business operations', color:'#8b5cf6' },
];

// ===== DEFAULT EMPLOYEES =====
const DEFAULT_EMPLOYEES = [
  { id:'EMP001', firstName:'Rahul',   lastName:'Sharma',   email:'rahul.sharma@ems.com',   phone:'9876543210', department:'Engineering',     role:'Senior Software Engineer', salary:95000, joinDate:'2021-03-15', status:'Active',   gender:'Male',   address:'12, MG Road, Delhi' },
  { id:'EMP002', firstName:'Priya',   lastName:'Singh',    email:'priya.singh@ems.com',    phone:'9876543211', department:'Marketing',       role:'Marketing Manager',        salary:80000, joinDate:'2020-07-01', status:'Active',   gender:'Female', address:'5, Park Street, Mumbai' },
  { id:'EMP003', firstName:'Amit',    lastName:'Verma',    email:'amit.verma@ems.com',     phone:'9876543212', department:'Engineering',     role:'Tech Lead',                salary:120000,joinDate:'2019-01-10', status:'Active',   gender:'Male',   address:'77, Civil Lines, Pune' },
  { id:'EMP004', firstName:'Sunita',  lastName:'Mehra',    email:'sunita.mehra@ems.com',   phone:'9876543213', department:'Human Resources', role:'HR Manager',               salary:75000, joinDate:'2020-05-20', status:'Active',   gender:'Female', address:'3, Gandhi Nagar, Agra' },
  { id:'EMP005', firstName:'Rohit',   lastName:'Kapoor',   email:'rohit.kapoor@ems.com',   phone:'9876543214', department:'Sales',           role:'Sales Head',               salary:88000, joinDate:'2018-11-05', status:'Active',   gender:'Male',   address:'9, Station Road, Jaipur' },
  { id:'EMP006', firstName:'Neha',    lastName:'Gupta',    email:'neha.gupta@ems.com',     phone:'9876543215', department:'Operations',      role:'Operations Manager',       salary:72000, joinDate:'2021-08-12', status:'Active',   gender:'Female', address:'22, Sadar Bazar, Lucknow' },
  { id:'EMP007', firstName:'Vikram',  lastName:'Joshi',    email:'vikram.joshi@ems.com',   phone:'9876543216', department:'Finance',         role:'CFO',                      salary:150000,joinDate:'2017-04-01', status:'Active',   gender:'Male',   address:'1, Patel Nagar, Ahmedabad' },
  { id:'EMP008', firstName:'Anjali',  lastName:'Patel',    email:'anjali.patel@ems.com',   phone:'9876543217', department:'Engineering',     role:'Frontend Developer',       salary:65000, joinDate:'2022-01-20', status:'Active',   gender:'Female', address:'8, Lal Bagh, Bangalore' },
  { id:'EMP009', firstName:'Suresh',  lastName:'Kumar',    email:'suresh.kumar@ems.com',   phone:'9876543218', department:'Sales',           role:'Sales Executive',          salary:45000, joinDate:'2022-06-15', status:'On Leave', gender:'Male',   address:'14, Anna Nagar, Chennai' },
  { id:'EMP010', firstName:'Meena',   lastName:'Devi',     email:'meena.devi@ems.com',     phone:'9876543219', department:'Finance',         role:'Accountant',               salary:55000, joinDate:'2021-09-30', status:'Active',   gender:'Female', address:'6, Salt Lake, Kolkata' },
  { id:'EMP011', firstName:'Arjun',   lastName:'Rao',      email:'arjun.rao@ems.com',      phone:'9876543220', department:'Engineering',     role:'Backend Developer',        salary:70000, joinDate:'2022-03-01', status:'Active',   gender:'Male',   address:'33, Banjara Hills, Hyderabad' },
  { id:'EMP012', firstName:'Kavita',  lastName:'Nair',     email:'kavita.nair@ems.com',    phone:'9876543221', department:'Human Resources', role:'HR Executive',             salary:42000, joinDate:'2023-02-14', status:'Active',   gender:'Female', address:'17, MG Road, Kochi' },
  { id:'EMP013', firstName:'Deepak',  lastName:'Malhotra', email:'deepak.m@ems.com',       phone:'9876543222', department:'Marketing',       role:'SEO Specialist',           salary:52000, joinDate:'2022-11-01', status:'Inactive', gender:'Male',   address:'44, Civil Lines, Nagpur' },
  { id:'EMP014', firstName:'Pooja',   lastName:'Bansal',   email:'pooja.bansal@ems.com',   phone:'9876543223', department:'Operations',      role:'Operations Executive',     salary:48000, joinDate:'2023-05-10', status:'Active',   gender:'Female', address:'2, Sector 15, Chandigarh' },
  { id:'EMP015', firstName:'Rajesh',  lastName:'Tiwari',   email:'rajesh.tiwari@ems.com',  phone:'9876543224', department:'Engineering',     role:'DevOps Engineer',          salary:85000, joinDate:'2020-12-01', status:'Active',   gender:'Male',   address:'10, Hazratganj, Lucknow' },
];

// ===== DEFAULT ACTIVITY LOG =====
const DEFAULT_ACTIVITY = [
  { msg:'Employee EMP001 record updated', time:'2 hours ago', type:'edit', user:'admin' },
  { msg:'New employee EMP015 added', time:'1 day ago', type:'add', user:'hr' },
  { msg:'Department Finance updated', time:'2 days ago', type:'edit', user:'admin' },
  { msg:'Employee EMP009 status changed to On Leave', time:'3 days ago', type:'edit', user:'hr' },
  { msg:'Employee EMP013 marked Inactive', time:'5 days ago', type:'delete', user:'admin' },
  { msg:'New department Operations added', time:'1 week ago', type:'add', user:'admin' },
];
