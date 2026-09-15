/* ==========================================================================
   Analytics Page Script
   ========================================================================== */



   function renderDonut(canvasId, legendId, segments) {

    const canvas = document.getElementById(canvasId);
    const legend = document.getElementById(legendId);

    if (!canvas) return;

    CafeCharts.drawDonutChart(canvas, segments);

    if (legend) {

        legend.innerHTML = segments.map(seg => `
            <div class="donut-legend-item">

                <span
                    class="donut-legend-dot"
                    style="background:${seg.color}"
                ></span>

                <span>${seg.label}</span>

                <strong>${seg.value}%</strong>

            </div>
        `).join('');

    }
}



document.addEventListener('DOMContentLoaded', () => {
  CafeShell.mount({ page: 'analytics', title: 'آمار بازدید', breadcrumb: 'کافه مدن / آمار بازدید' });
  renderStats();
  initChart();
  renderDonut('source-donut', 'source-legend', [
    { label: 'جستجوی گوگل', value: 52, color: '#F3B300' },
    { label: 'شبکه‌های اجتماعی', value: 28, color: '#2B2B26' },
    { label: 'مستقیم', value: 13, color: '#C8C3B8' },
    { label: 'سایر منابع', value: 7, color: '#E7E2D6' }
  ]);
  renderDonut('device-donut', 'device-legend', [
    { label: 'موبایل', value: 64, color: '#F3B300' },
    { label: 'دسکتاپ', value: 30, color: '#2B2B26' },
    { label: 'تبلت', value: 6, color: '#C8C3B8' }
  ]);
});


async function loadChart(range){

    const res = await fetch(`/api/visit/chart?range=${range}`);

    const result = await res.json();


    const data = result.labels.map((label,index)=>({

        label: label,
        value: result.data[index]

    }));


    console.log("MONGO CHART:", data);


    CafeCharts.drawAreaChart(
        document.getElementById("analytics-chart"),
        data
    );

}


async function renderStats() {

    const res = await fetch("/api/visit/stats");

    const stats = await res.json();


    const cards = [
    {
        label: 'بازدید امروز',
        value: stats.today,
        icon:'👁',
        range:'daily'
    },
    {
        label: 'بازدید هفتگی',
        value: stats.weekly,
        icon:'👁',
        range:'weekly'
    },
    {
        label: 'بازدید ماهانه',
        value: stats.monthly,
        icon:'👁',
        range:'monthly'
    },
    {
        label: 'بازدید سالانه',
        value: stats.yearly,
        icon:'👁',
        range:'yearly'
    }
];


  document.getElementById('analytics-stats').innerHTML =
cards.map(c => `

<div class="stat-card">

    <div class="stat-card__top">
        <div class="stat-card__icon">
            ${c.icon}
        </div>
    </div>


    <div class="stat-card__value">
        ${CafeUtils.formatNumber(c.value)}
    </div>


    <div style="font-size: 1rem;" class="stat-card__label">
        ${c.label}
    </div>


    <button 
    style="font-size: 1rem;"
    class="view-chart-btn" 
    data-range="${c.range}"
>
    👁 مشاهده نمودار
</button>


</div>

`).join('');



document.querySelectorAll(".view-chart-btn")
.forEach(btn=>{

    btn.addEventListener("click",()=>{


        const range = btn.dataset.range;


        document.querySelectorAll('#range-tabs button')
        .forEach(b=>{

            b.classList.remove("is-active");

            if(b.dataset.range === range){
                b.classList.add("is-active");
            }

        });


        


        loadChart(range);


    });


});

}

function initChart() {

  const canvas = document.getElementById('analytics-chart');

  let range = 'weekly';


async function render(){

    const res = await fetch(`/api/visit/chart?range=${range}`);

    const result = await res.json();


    const data = result.labels.map((label,index)=>({
        label:label,
        value:result.data[index]
    }));


    console.log("CURRENT RANGE:",range);
    console.log("CHART DATA:",data);


    const ctx = canvas.getContext("2d");

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    CafeCharts.drawAreaChart(canvas,data);

}


  render();


  window.addEventListener(
      'resize',
      CafeUtils.debounce(render,200)
  );


  document.querySelectorAll('#range-tabs button')
  .forEach(btn => {

      btn.addEventListener('click',()=>{


          document.querySelectorAll('#range-tabs button')
          .forEach(b=>b.classList.remove('is-active'));


          btn.classList.add('is-active');


          range = btn.dataset.range;


          render();


      });

  });

}


