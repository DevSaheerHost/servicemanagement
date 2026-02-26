

let allJobs = {};

// DOM refs

const $=s=>document.querySelector(s)
const shopnameInput = $('#shopname')
const usernameInput = $('#username')
const phoneInput = $('#phone')
const loginbtn = $('#loginbtn')

const jobTable = document.getElementById("jobTable");
const staffFilter = document.getElementById("staffFilter");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const searchInput = document.getElementById("searchInput");

const totalJobs = document.getElementById("totalJobs");
const totalRevenue = document.getElementById("totalRevenue");
const totalProfit = document.getElementById("totalProfit");

const bottomNavs = document.querySelectorAll('#bottomNav span')

const staffTable =
  document.getElementById("staffTable");
let currentStaff =
  localStorage.getItem("staff");
let shopname =
  localStorage.getItem("shopname");

const filteredJobs = {};

document.querySelector('button.logout').onclick=()=>{
localStorage.clear()
location.reload(true)
}
//console.log(currentStaff)


if (!localStorage.getItem("firstOpenDone")) {
  
  setTimeout(()=>runFirstTimeFunction(), 1000)
}

function runFirstTimeFunction() {
  localStorage.setItem("firstOpenDone", "1");
  document.querySelector('span.settings').classList.add('newDot')
}



import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  onValue ,
  update,
  push
} 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";



// 🔧 Config
const firebaseConfig = {
  apiKey: "AIzaSyDtyV0ITiEiVGucS2rAeSaQViANOaeKNDA",
  authDomain: "fir-66ffa.firebaseapp.com",
  databaseURL: "https://fir-66ffa-default-rtdb.firebaseio.com",
  projectId: "fir-66ffa",
  storageBucket: "fir-66ffa.appspot.com",
  messagingSenderId: "45530868218",
  appId: "1:45530868218:web:5cb9dbbb6e72e2ec991c43",
  measurementId: "G-FXQBN5H0XL"
};


// 🚀 Init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);





function clearInputs(){
  device.value = "";
  complaint.value = "";
  spareName.value = "";
  spareCost.value = "";
  serviceCharge.value = "";
}



function formatLocal(date){
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,"0");
  const d = String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}



const now = new Date();

fromDate.value = formatLocal(
  new Date(now.getFullYear(), now.getMonth(), 1)
);

toDate.value = formatLocal(now);










if (!currentStaff || !shopname) {

  // const name = prompt("Please enter your name:")?.trim().toLowerCase();
  // const shop = prompt("Enter shop name:")?.trim().toLowerCase();
  location.hash='auth'

  // if (name && shop) {
  //   localStorage.setItem("staff", name);
  //   localStorage.setItem("shopname", shop);
  //   staffLogin(name, shop);
  // } else {
  //   alert("Name and shop are required.");
  //   location.reload()
  // }
  $('#bottomNav').remove()

loginbtn.onclick=()=>{
  const name = usernameInput.value.trim()
  const shopname = shopnameInput.value.trim().toLowerCase()
  const number = phoneInput.value.trim()
  if (name && shopname && number && number.length === 10) {
    loginbtn.disabled=true
    loginbtn.textContent='Please wait...'
    staffLogin(name, shopname, number)
  }else{
    alert('please check all inputs')
  }
}



} else {
  logOpenInfoToFbDb()
  loadJobs();
  document.querySelector('#shopNameTitle').textContent=`${shopname?.toUpperCase() || ''} Service Management`
}



// 📌 Generate Serial
async function generateSN(){

  const snap = await get(ref(db,`shop-service/${shopname}/jobs`));

  if(!snap.exists()) return "1001";

  const count = Object.keys(snap.val()).length + 1001;
  return count;
}


// ➕ Add Job
async function addJob(){

  const sn = await generateSN();

  const job = {
    device: device.value,
    complaint: complaint.value,
    spareName: spareName.value,
    spareCost: +spareCost.value || 0,
    serviceCharge: +serviceCharge.value || 0,
    staff: currentStaff,
    status: "Pending",
    date: Date.now()
  };

  await set(
    ref(db,`shop-service/${shopname}/jobs/`+sn),
    job
  ).then(()=>{

    clearInputs();   // 🔥 clear after save success
    location.replace('/#')
  }).catch(err=>{

    console.error("Job save failed:", err);

  });;

}
window.addJob = addJob; // expose to HTML








if(!currentStaff){
  loginScreen.style.display="block";
  appScreen.style.display="none";
}




function loadJobs(){

  onValue(
    ref(db,`shop-service/${shopname}/jobs`),
    snap=>{

      allJobs = snap.val() || {};

      populateStaffFilter();
      applyFilters();

    }
  );

}

//loadJobs();



function populateStaffFilter(){

  const staffSet = new Set();

  Object.values(allJobs).forEach(job=>{
    if(job.staff){
      staffSet.add(job.staff);
    }
  });

  staffFilter.innerHTML =
    `<option value="all">All Staff</option>`;

  staffSet.forEach(name=>{
    staffFilter.innerHTML +=
      `<option value="${name}">
        ${name}
      </option>`;
  });

}


// Read from localStorage (convert to boolean)
let newUI = localStorage.getItem('newUI') === 'true';

// Set checkbox state on load
const toggle = document.querySelector('#newUI');
toggle.checked = newUI;

// When toggle changes
toggle.addEventListener('change', (e) => {
  newUI = e.target.checked;
  localStorage.setItem('newUI', newUI);
  applyFilters()
  pushUiFeedback(newUI);
});


function pushUiFeedback(uiState) {

  const feedbackRef = ref(db, `ui-feedback/${shopname}`);
  const newRef = push(feedbackRef); // generates pushKey

  set(newRef, {
    user: currentStaff,
    newLook: uiState,
    timestamp: new Date().toLocaleString()
  });
}




const getListUi = (job, sn) => {

  if (!newUI) {
    return `
<tr>
  <td>${sn}</td>
  <td>${job.device}</td>
  <td>${job.staff}</td>
  <td>₹${job.serviceCharge}</td>
  <td>
    <select onchange="updateStatus('${sn}', this.value)">
      <option value="Pending" ${job.status==="Pending"?"selected":""}>
        Pending
      </option>
      <option value="Done" ${job.status==="Done"?"selected":""}>
        Done
      </option>
    </select>
  </td>
</tr>`;
  }

  // Modern Card UI
  return `
<div class="job-card">
  <div class="job-card-header">
    <span class="job-id">#${sn}</span>
    <span class="job-status ${job.status.toLowerCase()}">
      ${job.status}
    </span>
  </div>

  <div class="job-card-body">
    <p class="device">${job.device}</p>
    <p class="staff">👨‍🔧 ${job.staff}</p>
    <p class="charge">₹${job.serviceCharge}</p>
  </div>

  <div class="job-card-footer">
    <select onchange="updateStatus('${sn}', this.value)">
      <option value="Pending" ${job.status==="Pending"?"selected":""}>
        Pending
      </option>
      <option value="Done" ${job.status==="Done"?"selected":""}>
        Done
      </option>
    </select>
  </div>
</div>
`;
};
function applyFilters(){
  
  const from = new Date(fromDate.value).getTime() || 0;
  //const to = new Date(toDate.value).getTime() || Infinity;
  const to =
  new Date(toDate.value).getTime()
  + 86400000 - 1
  || Infinity;
  const staff = staffFilter.value;
  const search = searchInput.value.toLowerCase();

  jobTable.innerHTML="";
  document.querySelector('#joblist').innerHTML=''


  let revenue=0;
  let spare=0;
  let total=0;

  const filteredJobs = {};   // ⚠️ REQUIRED

  Object.entries(allJobs)
  .sort((a, b) => b[1].date - a[1].date) // latest first
  .forEach(([sn,job])=>{
    if(job.date < from || job.date > to) return;
    if(staff !== "all" && job.staff !== staff) return;

    const text = `
      ${sn}
      ${job.device}
      ${job.complaint}
    `.toLowerCase();

    if(!text.includes(search)) return;


    // ✅ ADD THIS
    filteredJobs[sn] = job;


    total++;
    revenue += job.serviceCharge;
    spare += job.spareCost;

    
    
    if(newUI){
      document.querySelector('#jTble').classList.add('hidden')
    document.querySelector('#joblist').innerHTML+= getListUi(job, sn)
    }else{
      jobTable.innerHTML += getListUi(job, sn)
      document.querySelector('#jTble').classList.remove('hidden')

    }

  });

  totalJobs.textContent = total;
  totalRevenue.textContent = "₹"+revenue;
  totalProfit.textContent = "₹"+(revenue-spare);


  // ✅ CALL HERE
  renderStaffPerformance(filteredJobs);

renderMonthlyChart(filteredJobs);

renderDailyChart(filteredJobs);

renderStatusChart(filteredJobs);

renderSpareChart(filteredJobs);

}





fromDate.onchange = applyFilters;
toDate.onchange = applyFilters;
staffFilter.onchange = applyFilters;
searchInput.oninput = applyFilters;
























const CURRENTVERSION = "1.1";
const VERSIONKEY = "app_version";

if (localStorage.getItem(VERSIONKEY) !== CURRENTVERSION) {

  localStorage.clear();

  localStorage.setItem(VERSIONKEY, CURRENTVERSION);

  location.reload();
}


async function staffLogin(name, shop, number){

  name = name?.trim().toLowerCase();
  number = number?.trim();

  if(!name || !number){
    alert("Enter valid name and number");
    return;
  }

  const staffRef = ref(db, `shop-service/${shop}/staff/${name}`);
  const snap = await get(staffRef);
    loginbtn.textContent='loading...'
  const now = Date.now();

  if(snap.exists()){
    
  loginbtn.textContent = 'Staff exist'
    const staffData = snap.val();

    // 🔐 If number already exists → validate
    if(staffData.number){
  loginbtn.textContent = 'Number already available'

      if(staffData.number !== number){
        alert("Invalid number. Access denied.");
        loginbtn.textContent = 'LogIn';
        loginbtn.disabled=false;

        return;
      }

    } 
    // 🆕 Old staff (no number) → set number now
    else {
  loginbtn.textContent = 'number not exist'

      await update(staffRef,{
        number: number
      });

      console.log("Number added to old staff");
  loginbtn.textContent = 'Number added'

    }

    // Update login time
    await update(staffRef,{
      lastLogin: now
    });

  loginbtn.textContent = 'login success'

    console.log("Staff logged in");

  }

  else{
  loginbtn.textContent = 'creating...'

    await set(staffRef,{
      name,
      number,
      createdAt: now,
      lastLogin: now,
      totalJobs: 0
    });
  loginbtn.textContent = 'Staff Created success'

    console.log("New staff created");

  }

  localStorage.setItem("staff", name);
  localStorage.setItem("shopname", shop);

  currentStaff = name;
location.reload()
  enterApp();
}
window.staffLogin = staffLogin;




function checkSession(){

  const saved =
    localStorage.getItem("staff");

  if(saved){
    currentStaff = saved;
    enterApp();
  }

}





function enterApp(){

  loginScreen.style.display="none";

  appScreen.style.display="block";

  loadJobs();

}




let staffChartInstance = null;

function renderStaffPerformance(filteredJobs){

  const stats = {};

  Object.entries(filteredJobs)
  .forEach(([sn,job])=>{

    const name = job.staff || "Unknown";

    if(!stats[name]){
      stats[name] = {
        jobs: 0,
        revenue: 0,
        spare: 0
      };
    }

    stats[name].jobs++;
    stats[name].revenue += job.serviceCharge || 0;
    stats[name].spare += job.spareCost || 0;

  });


  // ---------- TABLE RENDER ----------
  staffTable.innerHTML="";

  Object.entries(stats)
  .forEach(([name,data])=>{

    const profit =
      data.revenue - data.spare;

    staffTable.innerHTML += `
      <tr>
        <td>${name}</td>
        <td>${data.jobs}</td>
        <td>₹${data.revenue}</td>
        <td>₹${data.spare}</td>
        <td>₹${profit}</td>
      </tr>
    `;
  });


  // ---------- CHART DATA ----------
  const labels = [];
  const revenues = [];
  const profits = [];

  Object.entries(stats)
  .forEach(([name,data])=>{

    labels.push(name);
    revenues.push(data.revenue);
    profits.push(data.revenue - data.spare);

  });


  renderStaffChart(
    labels,
    revenues,
    profits
  );

}




function renderStaffChart(
  labels,
  revenues,
  profits
){

  const ctx =
    document
    .getElementById("staffChart");


  // Destroy old chart
  if(staffChartInstance){
    staffChartInstance.destroy();
  }


  staffChartInstance =
    new Chart(ctx,{

      type: "bar",

      data: {

        labels,

        datasets: [

          {
            label: "Revenue",
            data: revenues
          },

          {
            label: "Profit",
            data: profits
          }

        ]

      },

      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top"
          }
        }
      }

    });

}








let monthlyChartInstance = null;

function renderMonthlyChart(filteredJobs){

  const stats = {};

  Object.values(filteredJobs)
  .forEach(job=>{

    const date = new Date(job.date);

    const key =
      date.getFullYear() + "-" +
      String(date.getMonth()+1)
      .padStart(2,"0");


    if(!stats[key]){

      stats[key] = {
        revenue: 0,
        spare: 0
      };

    }

    stats[key].revenue +=
      job.serviceCharge || 0;

    stats[key].spare +=
      job.spareCost || 0;

  });


  // ---------- Prepare chart arrays ----------
  const labels = [];
  const revenues = [];
  const profits = [];

  Object.entries(stats)
  .sort()   // chronological order
  .forEach(([month,data])=>{

    labels.push(month);
    revenues.push(data.revenue);
    profits.push(
      data.revenue - data.spare
    );

  });


  drawMonthlyChart(
    labels,
    revenues,
    profits
  );

}









function drawMonthlyChart(
  labels,
  revenues,
  profits
){

  const ctx =
    document.getElementById(
      "monthlyChart"
    );


  if(monthlyChartInstance){
    monthlyChartInstance.destroy();
  }


  monthlyChartInstance =
    new Chart(ctx,{

      type: "line",

      data: {

        labels,

        datasets: [

          {
            label: "Revenue",
            data: revenues,
            tension: 0.3
          },

          {
            label: "Profit",
            data: profits,
            tension: 0.3
          }

        ]

      },

      options:{
        responsive:true
      }

    });

}

















let dailyChartInstance = null;

function renderDailyChart(filteredJobs){

  const stats = {};

  Object.values(filteredJobs)
  .forEach(job=>{

    const date = new Date(job.date);

    const key =
      date.getFullYear() + "-" +
      String(date.getMonth()+1)
      .padStart(2,"0") + "-" +
      String(date.getDate())
      .padStart(2,"0");


    if(!stats[key]){
      stats[key] = 0;
    }

    stats[key]++;

  });


  // ---------- Prepare chart arrays ----------
  const labels = [];
  const jobCounts = [];

  Object.entries(stats)
  .sort()
  .forEach(([date,count])=>{

    labels.push(date);
    jobCounts.push(count);

  });


  drawDailyChart(
    labels,
    jobCounts
  );

}






function drawDailyChart(
  labels,
  jobCounts
){

  const ctx =
    document.getElementById(
      "dailyChart"
    );


  if(dailyChartInstance){
    dailyChartInstance.destroy();
  }


  dailyChartInstance =
    new Chart(ctx,{

      type: "line",

      data:{

        labels,

        datasets:[

          {
            label: "Jobs Per Day",
            data: jobCounts,
            tension: 0.3
          }

        ]

      },

      options:{
        responsive:true
      }

    });

}














let statusChartInstance = null;

function renderStatusChart(filteredJobs){

  let pending = 0;
  let done = 0;

  Object.values(filteredJobs)
  .forEach(job=>{

    if(job.status === "Done"){
      done++;
    }
    else{
      pending++;
    }

  });


  drawStatusChart(
    pending,
    done
  );

}







function drawStatusChart(
  pending,
  done
){

  const ctx =
    document.getElementById(
      "statusChart"
    );


  if(statusChartInstance){
    statusChartInstance.destroy();
  }


  statusChartInstance =
    new Chart(ctx,{

      type: "pie",

      data:{

        labels:[
          "Pending",
          "Done"
        ],

        datasets:[

          {
            data:[
              pending,
              done
            ]
          }

        ]

      },

      options:{
        responsive:true
      }

    });

}

















let spareChartInstance = null;

function renderSpareChart(filteredJobs){

  const stats = {};

  Object.values(filteredJobs)
  .forEach(job=>{

    let spare =
  job.spareName || "No Spare";

// Normalize
spare = spare
  .trim()
  .toLowerCase();
  
    if(!stats[spare]){

      stats[spare] = {
        count: 0,
        cost: 0
      };

    }

    stats[spare].count++;

    stats[spare].cost +=
      job.spareCost || 0;

  });


  // ---------- Prepare chart arrays ----------
  const labels = [];
  const counts = [];

  
  
  Object.entries(stats)
.forEach(([name,data])=>{

  labels.push(
    formatLabel(name)
  );

  counts.push(data.count);
   // counts.push(data.cost);

});


  drawSpareChart(
    labels,
    counts
  );

}





function drawSpareChart(
  labels,
  counts
){

  const ctx =
    document.getElementById(
      "spareChart"
    );


  if(spareChartInstance){
    spareChartInstance.destroy();
  }


  spareChartInstance =
    new Chart(ctx,{

      type: "doughnut",

      data:{

        labels,

        datasets:[

          {
            data: counts
          }

        ]

      },

      options:{
        responsive:true
      }

    });

}








async function updateStatus(
  sn,
  status
){

  await update(

    ref(
      db,
      `shop-service/${shopname}/jobs/`+sn
    ),

    { status }

  );

}
window.updateStatus =
  updateStatus;
  
  
  function formatLabel(text){

  return text
    .split(" ")
    .map(word=>
      word.charAt(0)
      .toUpperCase() +
      word.slice(1)
    )
    .join(" ");

} 


function formatTS(ms){

  const d = new Date(ms);

  const day   = String(d.getDate()).padStart(2,"0");
  const month = String(d.getMonth()+1).padStart(2,"0");
  const year  = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2,"0");

  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  hours = String(hours).padStart(2,"0");

  return `${hours}:${minutes} ${ampm} - ${day}/${month}/${year}`;
}


function loadStaffList(){
const staffListEl = document.querySelector("#staffList")
  onValue(
    ref(db,`shop-service/${shopname}/staff`),
    snap=>{

      const allStaffs = snap.val() || {};
      staffListEl.innerHTML=''

      Object.entries(allStaffs).forEach(s=>{
        const sameStaff = s[0]==currentStaff
        staffListEl.innerHTML += `
         <div class="list-item ${sameStaff?'same':''}">
        <p class="staff-name">${sameStaff? s[0] + '<span>YOU</span>' : s[0]}</p>
        ${s[1].number?`<p class='staffNumber'>${s[1].number}</p>
`:''}
        <p class='date'>${formatTS(s[1].lastLogin)}</p>
      </div>`
      })

    }
  );

}
loadStaffList();










/* =========================
   ROUTES MAP
========================= */

const routes = {
  "/": "home",
  "analysis": "analysis",
  "settings": "settings",
  "create": "create",
  'auth': 'auth'
};
//location.hash='#/create'

/* =========================
   PAGE RENDERER
========================= */

function renderPage(page) {
  
  // Hide all pages
  document.querySelectorAll(".page").forEach((el) => {
    el.classList.add("hidden");
  });

  // Find requested page
  const current = document.getElementById(page);

  // If page exists → show
  if (current) {
    current.classList.remove("hidden");
  } 
  // Else → show 404
  else {
    //document.getElementById("notfound").classList.remove("hidden");
    
  }
 // if(page==='create')$('#title').focus()
}


/* =========================
   ROUTER ENGINE
========================= */

function router() {

  const hash = location.hash || "#/";
  const path = hash.replace("#", "");
  const page = routes[path] || 'notfound';
  console.log(hash, path, page)
  renderPage(page);
}






/* =========================
   LIFECYCLE BOOT
========================= */

window.addEventListener("hashchange", router);
window.addEventListener("load", ()=>{
  router()
  document.querySelector('#bottomNav').style.display='flex'
});

// bottom nav switch function 

 
 
 location.replace(`/#`)
 bottomNavs.forEach(n=>{
  n.onclick = (e)=>{
    const link = e.currentTarget.dataset.link;
   //location.hash = link
    bottomNavs.forEach(e=>e.classList.remove('active'))
    e.currentTarget.classList.add('active')
   location.replace(`/#${link}`)
   e.currentTarget.classList.remove('newDot');
  }
});




/* ============================ GET DEVICE ======================*/

function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screen: {
      width: screen.width,
      height: screen.height
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    online: navigator.onLine,
    timestamp: new Date().toISOString()
  };
}



/* ========= format error =========*/
function formatError(error) {
  return {
    message: error?.message || "Unknown error",
    stack: error?.stack || "No stack trace",
    name: error?.name || "Error",
  };
}



/* =========== send to fb db  ==========*/


async function logErrorToFirebase(error, extra = {}) {
  try {
    const errorPath= `app-errors/${shopname || 'invalidShop'}`
    const errorRef = ref(db, errorPath);

    const payload = {
      error: formatError(error),
      device: getDeviceInfo(),
      extra,
      currentStaff,
    };

    await push(errorRef, payload);

  } catch (e) {
    console.error("Failed to log error:", e);
  }
}



/* ============ CACH ALL GLOBAL ERRORS ============== */
window.addEventListener("error", function (event) {
  logErrorToFirebase(event.error || event.message, {
    type: "UNCAUGHT_ERROR",
    file: event.filename,
    line: event.lineno,
    column: event.colno
  });
});


/*========== UNHANDLED PROMISES =========== */
window.addEventListener("unhandledrejection", function (event) {
  logErrorToFirebase(event.reason, {
    type: "UNHANDLED_PROMISE"
  });
});




/* ========= Fake error ========*/
// try {
//   riskyFunction();
// } catch (err) {
//   logErrorToFirebase(err, {
//     function: "riskyFunction",
//     customNote: "While creating job"
//   });
// }




/* ========= To log app opening times to db ======== */

async function logOpenInfoToFbDb() {
  try {

    const now = new Date();

    const formattedDate = `${String(now.getDate()).padStart(2,'0')}-${String(now.getMonth()+1).padStart(2,'0')}-${now.getFullYear()}`;

    const appOpenPath = `app-opened/${shopname || 'invalidShop'}/${formattedDate}`;

    const openPathRef = ref(db, appOpenPath);

    const payload = {
      device: getDeviceInfo(),
      currentStaff,
      time: now.toISOString(),
      timestamp: Date.now()
    };

    await push(openPathRef, payload);

  } catch (e) {
    console.error("Failed to log :", e);
  }
}



if (!currentStaff || !shopname) {
  location.hash = 'auth'
}