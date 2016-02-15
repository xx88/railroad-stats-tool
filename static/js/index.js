$(function() {

var dataTable = "#tbl-data";
var calTableBtn = "#btn-cal-table";
var calCsvBtn = "#btn-cal-csv";
var addRowBtn = "#btn-addrow";
var exampleTableBtn = "#btn-example-table";
var exampleCsvBtn = "#btn-example-csv";
var dataText = "#text-data";
var intervalSelect = "#sel-interval";
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
  return $(dataTable + " tbody tr:eq({0})".format(r));
}

function getCell(r, c) {
  return $(dataTable + " tbody tr:eq({0}) td:eq({1})".format(r, c));
}

function validate(data) {
  var result = {
    error: [],
    data: [],
    msg: ""
  };
  for(var i=0;i<data.length;++i) {
    var nNaN = [], nMiss = [], nCorrect = 0;
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
      data[i][j] = parseFloat(data[i][j]);
      if(isNaN(data[i][j])) {
        nNaN.push([i, j]);
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
    if(nCorrect < 4) {
      result.error = [[i, nCorrect+1]];
      result.msg = "Data is missing!";
      return result;
    }
    result.data.push(data[i]);
  }
  return result;
}

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
        chartData[j].push(data[i][j]);
      }
    }
    drawChart($(intervalSelect).val());
  });
}

/***********************************************************/
/*                    Event Listeners                      */
/***********************************************************/

$(calTableBtn).click(function() {
  var data = [];
  $(dataTable + " tbody td").removeClass(errClass);
  $(dataTable + " tbody tr").each(function(i) {
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

$(intervalSelect).change(function() {
  drawChart($(this).val());
});

$(exampleTableBtn).click(function() {
  $(dataTable + " tbody td").removeClass(errClass);
  var rows = $(dataTable + " tbody tr").length;
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
