google.charts.load('current', {'packages':['sankey','corechart','bar','calendar']});
google.charts.setOnLoadCallback(loadData);

let rawData = [];

function parseCSV(csv) {
  const rows = csv.trim().split('\n');
  const headers = rows[0].split(',');
  return rows.slice(1).map(row => {
    const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    let obj = {};
    headers.forEach((h, i) => {
      if (cols[i]) {
        obj[h.trim()] = cols[i].replace(/"/g, '').replace(/,/g,'');
      } else {
        obj[h.trim()] = null;
      }
    });
    return obj;
  });
}

function loadData() {
  fetch('C19C_Porcentaje_numero_personas_de_componentes_de_carencia_social_por_estado_08_18.csv')
    .then(response => response.text())
    .then(csv => {
      rawData = parseCSV(csv);
      console.log("Rows loaded:", rawData.length);
      drawCharts();
    })
    .catch(error => console.error("Error loading CSV:", error));
}
function drawCharts() {
  drawChartP1();
  drawChartP2();
  drawChartP3();
  drawChartP4();
  drawChartP5();
}
function drawChartP1() {
  const years = ['2008','2010','2012','2014','2016','2018'];
  let dataArray = [['Año','Porcentaje promedio']];
  years.forEach(year => {
    let sum = 0;
    rawData.forEach(d => {
      sum += parseFloat(d[`porcentaje_de_la_poblacion_ocupada_sin_acceso_a_la_seguridad_social_${year}`]);
    });
    dataArray.push([year, sum / rawData.length]);
  });

   var options = {
    height: 400,
    curveType: 'function',
    legend: { position: 'bottom' },
    hAxis: {
      title: 'Año'
    },
    vAxis: {
      title: 'Porcentaje (%)',
      viewWindow: { min: 30, max: 85 }
    },
    lineWidth: 3,
    pointSize: 6,
    animation: {
      startup: true,
      duration: 1000,
      easing: 'out'
    }
  };

  var data = google.visualization.arrayToDataTable(dataArray);
  var chart = new google.visualization.LineChart(document.getElementById('p1Chart'));
  chart.draw(data, options);
}

function drawChartP2() {
  let year = '2018';
  let sorted = rawData.map(d => ({
    estado: d.estado_1,
    valor: parseFloat(d[`porcentaje_de_la_poblacion_ocupada_sin_acceso_a_la_seguridad_social_${year}`])
  }))
  .sort((a,b) => b.valor - a.valor)
  .slice(0,10);
  let dataArray = [['Estado','%']];
  sorted.forEach(d => dataArray.push([d.estado, d.valor]));

  var options = {

    hAxis: {
      title: 'Miles de personas'
    },

    animation: {
      startup: true,
      duration: 800,
      easing: 'out'
    }
  };

  var data = google.visualization.arrayToDataTable(dataArray);
  var chart = new google.visualization.BarChart(document.getElementById('p2Chart'));
  chart.draw(data, options);
}

function drawChartP3() {
  const years = ['2008','2010','2012','2014','2016','2018'];
  let dataArray = [['Año','Ocupados (miles)','No económicamente activa (miles)']];
  const mexico = rawData.find(d => d.estado_1 === 'estados_unidos_mexicanos');
  years.forEach(year => {
    dataArray.push([
      year,
      parseFloat(mexico[`miles_de_personas_ocupadas_sin_acceso_a_la_seguridad social_${year}`]),
      parseFloat(mexico[`miles_de_personas_no_economicamente_activa_sin_acceso_a_la_seguridad_social_${year}`])
    ]);
  });
  var data = google.visualization.arrayToDataTable(dataArray);
  var options = {
    curveType: 'function',
    legend: { position: 'bottom' },
    hAxis: { title: 'Año' },
    vAxis: { title: 'Miles de personas' }
  };
  var chart = new google.visualization.LineChart(
    document.getElementById('p3Chart')
  );
  chart.draw(data, options);
}

function drawChartP4() {

  const year = '2018';

  const mexico = rawData.find(
    d => d.estado_1 === 'estados_unidos_mexicanos'
  );

  let dataArray = [
    ['Grupo', 'Miles de personas'],
    [
      'Ocupados',
      parseFloat(
        mexico[`miles_de_personas_ocupadas_sin_acceso_a_la_seguridad social_${year}`]
      )
    ],
    [
      'No económicamente activa',
      parseFloat(
        mexico[`miles_de_personas_no_economicamente_activa_sin_acceso_a_la_seguridad_social_${year}`]
      )
    ],
    [
      '65 años o más',
      parseFloat(
        mexico[`miles_de_personas_de_65_anios_o_mas_sin_acceso_a_la_seguridad_social_${year}`]
      )
    ]
  ];

  var data = google.visualization.arrayToDataTable(dataArray);
  var options = {
    pieHole: 0.4, // lo hace donut, más moderno
    legend: { position: 'bottom' }
  };
  var chart = new google.visualization.PieChart(
    document.getElementById('p4Chart')
  );
  chart.draw(data, options);
}

function drawChartP5() {
  let year = '2018';
  let dataArray = [['Estado','Porcentaje','Miles','Estado','Miles']];
  rawData
  .filter(d => d.estado_1 !== 'estados_unidos_mexicanos') 
  .forEach(d => {
    dataArray.push([
  	d.estado_1,
	parseFloat(d[`porcentaje_de_la_poblacion_ocupada_sin_acceso_a_la_seguridad_social_${year}`]),
	parseFloat(d[`porcentaje_de_la_poblacion_no_economicamente_activa_sin_acceso_a_la_seguridad_social_${year}`]),
	d.estado_1,
	parseFloat(d[`miles_de_personas_de_65_anios_o_mas_sin_acceso_a_la_seguridad_social_${year}`])
	]);
  });
  var options = {
    height: 300,
    hAxis: {
      title: '% Población ocupada sin acceso',
      viewWindow: {
        min: 20,
        max: 90
      }
    },
    vAxis: {
      title: '% Población no económicamente activa sin acceso',
      viewWindow: {
        min: 20,
        max: 90
      }
    },
    bubble: { textStyle: { fontSize: 10 } }
  };
  var data = google.visualization.arrayToDataTable(dataArray);
  var chart = new google.visualization.BubbleChart(document.getElementById('p5Chart'));
  chart.draw(data, options);
}


/*
function drawChartP4() {
  let year = '2018';
  let totalOcupada = 0;
  let totalNoActiva = 0;
  let total65 = 0;
  rawData.forEach(d => {
    totalOcupada += parseFloat(d[`miles_de_personas_ocupadas_sin_acceso_a_la_seguridad social_${year}`]);
    totalNoActiva += parseFloat(d[`miles_de_personas_no_economicamente_activa_sin_acceso_a_la_seguridad social_${year}`]);
    total65 += parseFloat(d[`miles_de_personas_de_65_anios_o_mas_sin_acceso_a_la_seguridad social_${year}`]);
  });
  var data = google.visualization.arrayToDataTable([
    ['Grupo','Miles'],
    ['Ocupada', totalOcupada],
    ['No Económicamente Activa', totalNoActiva],
    ['65 años o más', total65]
  ]);
  var chart = new google.visualization.PieChart(document.getElementById('p4Chart'));
  chart.draw(data, { legend:'right' });
}

function drawChartP5() {
  const years = ['2008','2010','2012','2014','2016','2018'];
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn({ type: 'date', id: 'Date' });
  dataTable.addColumn({ type: 'number', id: 'Miles' });
  years.forEach(year => {
    let total = 0;
    rawData.forEach(d => {
      total += parseFloat(d[`miles_de_personas_ocupadas_sin_acceso_a_la_seguridad social_${year}`]);
    });
    dataTable.addRow([ new Date(parseInt(year), 0, 1), total ]);
  });
  var chart = new google.visualization.Calendar(document.getElementById('p5Chart'));
  chart.draw(dataTable, { height: 300 });
}*/