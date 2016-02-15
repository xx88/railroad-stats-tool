$(function() {

function findRow(r) {
  ++r;
  return $("#tbl-data tr:eq(" + r + ")");
}

function validate(data) {
  var result = [];
  for(var i=0;i<data.length;++i) {
    var countNaN = 0;
    for(var j=0;j<data[i].length;++j) {
      if(j == 0) {
         if(data[i][j].length == 0) data[i][j] = i + 1;
         data[i][j] = String(data[i][j]);
      }
      else if(isNaN(data[i][j])) countNaN++;
    }
    if(countNaN == 0) {
      result.push(data[i]);
    }
    else if(countNaN < 4) {
      findRow(i).addClass("cell-warn");
      alert("Error Data in this row!");
      return false;
    }
  }
  if(result.length == 0) {
    alert("Missing data!");
    return false;
  }
  return result;
}

$("#btn-submit").click(function() {
  var data = [];
  $("#tbl-data tr:gt(0)").each(function(i) {
    var tmp = [];
    $(this).removeClass("cell-warn");
    $(this).find("span").each(function(j) {
      var val = $(this).text();
      if(j > 0) val = parseFloat(val);
      tmp.push(val);
    });
    data.push(tmp);
  });
  data = validate(data);
  if(!data) {
    return false;
  }
  $.ajax({
    type: "POST",
    url: "estimate", 
    data: JSON.stringify({"data": data}),
    contentType: "application/json",
    dataType: 'json'
  }).done(function(result) {
    var data = result['data'];
    chartData["wald"] = [];
    chartData["wilson"] = [];
    chartData["approx2"] = [];
    chartData["exact"] = [];
    for(var i=0;i<data.length;++i) {
      for(var j in data[i]) {
        chartData[j].push(data[i][j]);
      }
    }
    drawChart("wald");
  });
});

var chartData = {
  "wald": [],
  "wilson": [],
  "approx2": [],
  "exact": []
};

$("#btn-addrow").click(function() {
  var n = parseInt($('#txt-rows').val());
  if(isNaN(n) || n <= 0) n = 1;
  while(n-- > 0) {
    $("#tbl-data tbody").append([
      "<tr>",
      "<td><span contenteditable></span></td>",
      "<td><span contenteditable></span></td>",
      "<td><span contenteditable></span></td>",
      "<td><span contenteditable></span></td>",
      "<td><span contenteditable></span></td>",
      "</tr>"].join());
  }
});

$("#sel-interval").change(function() {
  drawChart($(this).val());
});

$("#btn-upload").click(function() {
});

google.charts.load('current', {'packages':['corechart']});
//google.charts.setOnLoadCallback(drawChart);

function drawChart(dataType) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'x');
  data.addColumn('number', 'values');
  data.addColumn({id:'lb', type:'number', role:'interval'});
  data.addColumn({id:'ub', type:'number', role:'interval'});
  if(chartData[dataType].length == 0) {
    alert("Missing data!");
    return false;
  }
  data.addRows(chartData[dataType]);

  var options= {
    title: "Estimate of " + dataType + " interval",
    curveType: 'function',
    series: [{'color': '#D9544C'}],
    intervals: { style: 'bars' },
    legend: 'none',
    width: 960,
    height: 500
  };

  var chart = new google.visualization.LineChart(document.getElementById('div-chart'));
  chart.draw(data, options);
}

});
