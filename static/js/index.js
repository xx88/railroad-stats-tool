$(function() {

var dataTable = "#tbl-data tbody";
var calTableBtn = "#btn-cal-table";
var calCsvBtn = "#btn-cal-csv";
var addRowBtn = "#btn-addrow";
var exampleTableBtn = "#btn-example-table";
var exampleCsvBtn = "#btn-example-csv";
var dataText = "#text-data";
var intervalSelect = "#sel-interval";
var resultTable = "#tbl-result tbody";
var chartData = {
  "wald": [],
  "wilson": [],
  "approx2": [],
  "exact": []
};
var errClass = "danger";

google.charts.load('current', {'packages':['corechart']});
//google.charts.setOnLoadCallback(drawChart);

String.prototype.format = function() {
  var formatted = this;
  for (var i = 0; i < arguments.length; i++) {
    var regexp = new RegExp('\\{'+i+'\\}', 'gi');
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};

function rand(low, high) {
  return Math.floor(Math.random() * high) + low;
}

function getRow(r) {
  return $(dataTable + " tr:eq({0})".format(r));
}

function getCell(r, c) {
  return $(dataTable + " tr:eq({0}) td:eq({1})".format(r, c));
}

function validate(data) {
  var result = {
    error: [],
    data: [],
    msg: ""
  };
  for(var i=0;i<data.length;++i) {
    var nNaN = [], nMiss = [], nMinus = [], nCorrect = 0;
    for(var j=0;j<data[i].length;++j) {
      if(j == 0) {
         if(data[i][j].length == 0) data[i][j] = "L" + String(i+1);
         else data[i][j] = String(data[i][j]);
         continue;
      }
      if(data[i][j].length == 0) {
        nMiss.push([i, j]);
        continue;
      }
      if(isNaN(data[i][j])) {
        nNaN.push([i, j]);
        continue;
      }
      data[i][j] = parseFloat(data[i][j]);
      if(data[i][j] <= 0) {
        nMinus.push([i, j]);
        continue;
      }
      ++nCorrect;
    }
    if(nMiss.length == 4) {
      continue;
    }
    if(nNaN.length > 0) {
      result.error = nNaN;
      result.msg = "Input not a number!";
      return result;
    }
    if(nMiss.length > 0) {
      result.error = nMiss;
      result.msg = "Data is missing!";
      return result;
    }
    if(nMinus.length > 0) {
      result.error = nMinus;
      result.msg = "Data must be postive!";
      return result;
    }
    if(nCorrect < 4) {
      result.error = [[i, nCorrect+1]];
      result.msg = "Data is missing!";
      return result;
    }
    result.data.push(data[i]);
  }
  return result;
}

function fillResult(dataType) {
  var rows = [];
  for(var i=0;i<chartData[dataType].length;++i) {
    var tmp = "<tr>";
    tmp += "<td>" + chartData[dataType][i][0] + "</td>";
    for(var j=2;j<5;++j) {
      tmp += "<td>" + chartData[dataType][i][j].toFixed(4) + "</td>";
    }
    tmp += "</tr>";
    rows.push(tmp);
  }
  $(resultTable).html(rows.join(''));
}

function drawChart(dataType) {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'x');
  data.addColumn('number', 'Baseline');
  data.addColumn('number', 'Estimate');
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
    intervals: { style: 'bars' },
    legend: { position: 'bottom' },
    series: {
      0: { type: 'steppedArea', areaOpacity: 0, lineDashStyle: [10, 2] },
      1: { pointSize: 8 }
    },
    chartArea: { width : '80%', height: '80%' },
    hAxis: { title: 'Labels' },
    vAxis: { title: 'Estimated Values', minValue: 0 }
  };

  var chart = new google.visualization.LineChart(document.getElementById('div-chart'));
  chart.draw(data, options);
}

function sample(rows) {
  var data = [];
  for(var i=0;i<rows;++i) {
    var tmp = ["L" + String(i+1)];
    tmp.push(rand(1, 100));
    tmp.push(rand(1, 100));
    tmp.push(rand(1000, 5000));
    tmp.push(rand(1000, 5000));
    data.push(tmp);
  }
  return data;
}

function calculate(data) {
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
        var tmp = [data[i][j][0], 1, data[i][j][1], data[i][j][2], data[i][j][3]];
        chartData[j].push(tmp);
      }
    }
    var dataType = $(intervalSelect).val();
    fillResult(dataType);
    drawChart(dataType);
  });
}

/***********************************************************/
/*                    Event Listeners                      */
/***********************************************************/

$(calTableBtn).click(function() {
  var data = [];
  $(dataTable + " td").removeClass(errClass);
  $(dataTable + " tr").each(function(i) {
    var tmp = [];
    $(this).find("span").each(function(j) {
      tmp.push($(this).text());
    });
    data.push(tmp);
  });
  data = validate(data);
  if(data.error.length > 0) {
    for(var i=0;i<data.error.length;++i) {
      var err = data.error[i];
      getCell(err[0], err[1]).addClass(errClass);
    }
    alert(data.msg);
    return false;
  }
  calculate(data.data);
});

$(addRowBtn).click(function() {
  var n = parseInt($('#txt-rows').val());
  if(isNaN(n) || n <= 0) n = 1;
  while(n-- > 0) {
    $(dataTable).append([
      "<tr>",
      "<td><span contenteditable></span></td>",
      "<td><span contenteditable></span></td>",
      "<td><span contenteditable></span></td>",
      "<td><span contenteditable></span></td>",
      "<td><span contenteditable></span></td>",
      "</tr>"].join());
  }
});

$(intervalSelect).change(function() {
  var dataType = $(this).val();
  fillResult(dataType);
  drawChart(dataType);
});

$(exampleTableBtn).click(function() {
  $(dataTable + " td").removeClass(errClass);
  var rows = $(dataTable + " tr").length;
  var data = sample(rows);
  for(var i=0;i<rows;++i) {
    for(var j=0;j<5;++j) {
      getCell(i, j).find("span").html(data[i][j]);
    }
  }
});

$(calCsvBtn).click(function() {
  $(dataText).removeClass(errClass);
  var text = $(dataText).val();
  var data = text.split('\n');
  for(var i=0;i<data.length;++i) {
    data[i] = data[i].split(',');
  } 
  data = validate(data);
  if(data.error.length > 0) {
    alert(data.msg + String(data.error));
    return false;
  }
  calculate(data.data);
});

$(exampleCsvBtn).click(function() {
  var data = sample(6);
  for(var i=0;i<6;++i) {
    data[i] = data[i].join(', ');
  }
  data = data.join('\n');
  $(dataText).val(data);
});

});
