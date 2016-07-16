//----------DEFAULT VARIABLES----------

var usingFiles = false; //True if the user uploaded his own JSON
var failCount = 0; //Counts how many times getData tries the request if there is a failure
var rawEfficencyData; //contains the efficiency's data (first 3 chart)
var rawActivityData; //contains the activities's data  (last chart)

//objects that will be used for the requests with default values
var queries = {
    activities: {
        perspective: 'rank',
        restrict_kind: 'activity'
    },
    efficiency: {
        perspective: 'interval',
        restrict_kind: 'efficiency',
    }
};


$("document").ready(function() {
    //handling upload event
    $('#fileEfficency').on('change', fileUploaded);
    $('#fileActivity').on('change', fileUploaded);


    //redraw the efficiency chart when the value change
    $('#trendLineSpinner').on('change', function(event) {
        fullEfficiencyChart(rawEfficencyData);
    });

    $('#activitiesNumberSpinner').on('change', function(event) {
        activityChart(rawActivityData);
    });

});


function rescuetimeInit() {
    var key = "";
    if (key.length > 5) {
        usingFiles = false;

        queries.efficiency.key = queries.activities.key = key;
        queries.efficiency.restrict_begin = queries.activities.restrict_begin = "2016-07-16";
        queries.efficiency.restrict_end = queries.activities.restrict_end = "2016-07-16";
        queries.efficiency.interval = queries.activities.interval = 'hour';
        queries.efficiency.format = queries.activities.format = 'json';

        //activities data
		getData(queries.activities);

        //efficiency data
        getData(queries.efficiency);

        $('#downloadSection').empty();
        $('.spinner').show();
        $('.chart').show();

    } else {
        alert('Please insert your api key');
    }
}

//get the data using rescuetime api
function getData(params) {
    var rescuetimeAPI = 'https://www.rescuetime.com/anapi/data?';
    $.getJSON('https://allow-any-origin.appspot.com/' + rescuetimeAPI, {
            key: params.key,
            perspective: params.perspective,
            restrict_kind: params.restrict_kind,
            interval: params.interval,
            restrict_begin: params.restrict_begin,
            restrict_end: params.restrict_end,
            format: params.format
        })
        .done(function(data) {
            if (data.error) {
                alert(data.messages);
            }
            if (params.restrict_kind === 'efficiency') {
                fullEfficiencyChart(data.rows); //draw the efficency chart for the period
                combinedCharts(data.rows); //draw the chats with efficency and totaltime combined
                rawEfficencyData = data.rows;
            } else if (params.restrict_kind === 'activity') {
                activityChart(data.rows); //draw the chart with the list of the top activities
                rawActivityData = data.rows;
            }

//            if (document.getElementById('download').checked) {
//                startDownload(data, params.restrict_kind); //start the download of the files for the selected period
//            }

            $('.spinner').hide();
        }).fail(function(jqxhr, textStatus, error) {
            failCount++;
            if (failCount < 3) {
                setTimeout(getData(params), failCount * 300);
            } else {
                var modal = $('<div class="modal fade bs-modal-sm" tabindex="-1" role="dialog"> <div class="modal-dialog modal-sm"> <div class="modal-content">Error retriving your data. Please try again later. If you keep getting this error please open an issue on GitHub or send an email to davide.bonte@gmail.com </div></div></div>');
                modal.modal('show');
            }
            //TODO: add retry for 403 over quota?
            var err = textStatus + ', ' + error;
            console.log('Request Failed: ' + err);
        });
}


function checkFiles() {
    $(".chart").show();
    usingFiles = true;
    $("#act-display").empty();
    // TODO: add check per vedere se ho effetivamente caricato dei file e vedere se sono validi
    if (rawEfficencyData) {
        fullEfficiencyChart(rawEfficencyData);
        combinedCharts(rawEfficencyData);
    }
    if (rawActivityData) {
        activityChart(rawActivityData);
    }
}

//load the uploaded file in the variables
function fileUploaded(event) {
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        if (event.target.id === 'fileEfficency') {
            rawEfficencyData = (JSON.parse(e.target.result)).rows;
        } else if (event.target.id === 'fileActivity') {
            rawActivityData = (JSON.parse(e.target.result)).rows;
        }
    };

    reader.readAsText(file);
}

//add and automatically start the download for the files
function startDownload(data, type) {
    var JSONString = JSON.stringify(data);
    var file = "text/json;charset=utf-8," + encodeURIComponent(JSONString);
    $('<a>', {
      href:"data:"+ file,
      download: type + "_"+ document.getElementById('from').value + "_to_"+ document.getElementById('to').value +".json",
      id:"download"+type,
      text:"Download "+type + " data"
    }).appendTo('#downloadSection');
    $('<br>').appendTo('#downloadSection');
    $('#download' + type).get(0).click();
}


/***************
 *****CHARTS****
 ***************/

function fullEfficiencyChart(data) {
    var normalizedData = [];
    data.forEach(function(point) {
        normalizedData.push([new Date(point[0]).getTime(), (point[4] * point[1]) / 3600]);
        // normalizedData.push([new Date(point[0]).getTime(), point[4]]);
    });


    $('#efficiency_chart').highcharts('StockChart', {
        chart: {
            height: Math.max(window.innerHeight - 100, 350)
        },
        rangeSelector: {
            buttons: [{
                type: 'day',
                count: 1,
                text: '1D'
            }, {
                type: 'week',
                count: 1,
                text: '1W'
            }, {
                type: 'month',
                count: 1,
                text: '1M'
            }, {
                type: 'year',
                count: 1,
                text: '1Y'
            }, {
                type: 'all',
                count: 1,
                text: 'All'
            }],
            selected: 5,
            inputEnabled: true
        },

        title: {
            text: 'Productivity for the selected range'
        },

        series: [{
            name: 'Efficiency',
            type: 'scatter',
            pointWith: 1,
            data: normalizedData,
            color: '#D6DCEA',
            tooltip: {
                valueDecimals: 2
            },
            regression: true,
            regressionSettings: {
                type: 'loess',
                color: '#1111cc',
                loessSmooth: 10

            },
        }]
    });
    Highcharts.setOptions(Highcharts.theme);

}


function combinedCharts(data) {
    var hours = initializeArray(24);
    var days = initializeArray(7);
    var hour = 0;
    var day = 0;
    data.forEach(function(element) {
        hour = parseInt(element[0].substr(11, 2),10); //note: I can't use Date() because rescuetime log the date based on user's system time which is in GMT but when using Date() on the string in the JSON is converted in UTC :(
        day = new Date(element[0].substr(0, 10)).getDay();

        hours[hour].totalTime += element[1]; //sum of the total time for a given hour
        hours[hour].totalEfficency += (element[4] * element[1]) / 3600; //normalize the data
        hours[hour].count++; //how many entries for a given hour. Used to calculate the average efficency

        days[day].totalTime += element[1];
        days[day].totalEfficency += (element[4] * element[1]) / 3600;
        days[day].count++;
    });

    displayCombined('#combo_hour_chart', calcAvg(hours));
    displayCombined('#combo_day_chart', calcAvg(days));
}

//inizialize the array with the default object
function initializeArray(length) {
    var array = [];
    for (var i = 0; i < length; i++) {
        array.push({
            totalTime: 0,
            totalEfficency: 0,
            avgEfficency: 0,
            count: 0
        });
    }
    return array;
}

//calculate the average efficency for the given period (day or hour)
function calcAvg(array) {
    array.forEach(function(element) {
        element.avgEfficency = element.totalEfficency / element.count;
    });
    return array;
}

//create the chart with total time and average efficency
function displayCombined(DOMChart, data) {
    var totalTime = [];
    data.forEach(function(item) {
        totalTime.push(item.totalTime / 3600);
    });
    var avgEfficency = [];
    data.forEach(function(item) {
        avgEfficency.push(item.avgEfficency || 0);
    });
    var categories = [];
    if (avgEfficency.length === 7) {
        categories = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }

    $(DOMChart).highcharts({
        chart: {
            zoomType: 'xy'
        },

        xAxis: [{
            categories: categories,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}%',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: 'Efficiency',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            min: 0,
            max: 100
        }, { // Secondary yAxis
            title: {
                text: 'Total Time',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            labels: {
                format: '{value} H',
                style: {
                    color: Highcharts.getOptions().colors[0]
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 50,
            verticalAlign: 'top',
            y: 50,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: [{
            name: 'Total Time',
            type: 'column',
            yAxis: 1,
            data: totalTime,
            tooltip: {
                pointFormat: 'Total Time: {point.y:.2f} hh<br>'
            }

        }, {
            name: 'Efficiency',
            type: 'spline',
            data: avgEfficency,
            tooltip: {
                pointFormat: 'Efficiency: {point.y:.2f} %'
            }
        }]
    });
}

//chart with the total time
function activityChart(data) {
    // ["Rank", "Time Spent (seconds)", "Number of People", "Activity", "Category", "Productivity"]
    var categories = {
        veryDistracting: {
            total: 0,
            color: '#C5392F'
        },
        distracting: {
            total: 0,
            color: '#92343B'
        },
        neutral: {
            total: 0,
            color: '#655568'
        },
        productive: {
            total: 0,
            color: '#395B96'
        },
        veryProductive: {
            total: 0,
            color: '#2F78BD'
        }
    };
    var activityData = [];
    var totalSeconds = 0;

    //colors the bars
    data.forEach(function(activity) {
        totalSeconds += activity[1];
        switch (activity[5]) {
            case -2:
                activityData.push({
                    color: categories.veryDistracting.color,
                    y: activity[1],
                    name: activity[3]
                });
                categories.veryDistracting.total += activity[1];
                break;
            case -1:
                activityData.push({
                    color: categories.distracting.color,
                    y: activity[1],
                    name: activity[3]
                });
                categories.distracting.total += activity[1];
                break;
            case 0:
                activityData.push({
                    color: categories.neutral.color,
                    y: activity[1],
                    name: activity[3]
                });
                categories.neutral.total += activity[1];
                break;
            case 1:
                activityData.push({
                    color: categories.productive.color,
                    y: activity[1],
                    name: activity[3]
                });
                categories.productive.total += activity[1];
                break;
            case 2:
                activityData.push({
                    color: categories.veryProductive.color,
                    y: activity[1],
                    name: activity[3]
                });
                categories.veryProductive.total += activity[1];
                break;
        }
    });

    $('#act_chart').highcharts({
        chart: {
            height: (30 * 20)
        },
        title: {
            text: 'Activities'
        },
        subtitle: {
            text: '<strong>Total time recorded (hh:mm:ss) : ' + timeFormatter(totalSeconds) + '<br>' +avgPerDay(totalSeconds)+'</strong>'
        },
        tooltip: {
            formatter: function() {
                return 'Total: ' +
                    timeFormatter(this.y) + '<br>'+avgPerDay(this.y) ;
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    allowPointSelect: true,
                    enabled: true,
                    formatter: function() {
                        return timeFormatter(this.y);
                    }

                }
            }
        },
        xAxis: {
            categories: function() {
                var result = [];
                return activityData.map(function(item) {
                    return item.name;
                }).slice(0, 30);
            }
        },
        yAxis: {
            labels: {
                formatter: function() {
                    return timeFormatter(this.value);
                }
            }
        },
        series: [{
            type: 'bar',
            name: 'Activities',
            data: activityData.slice(0, 30),
            showInLegend: false
        }, {
            type: 'pie',
            name: 'Total consumption',
            data: [{
                name: 'Very Productive',
                y: categories.veryProductive.total,
                color: categories.veryProductive.color
            }, {
                name: 'Productive',
                y: categories.productive.total,
                color: categories.productive.color
            }, {
                name: 'Neutral',
                y: categories.neutral.total,
                color: categories.neutral.color
            }, {
                name: 'Distracting',
                y: categories.distracting.total,
                color: categories.distracting.color
            }, {
                name: 'Very Distracting',
                y: categories.veryDistracting.total,
                color: categories.veryDistracting.color
            }],
            center: ['85%', '70%'],
            size: 200,
            showInLegend: true

        }]
    });
}

function avgPerDay(time){
  if(!usingFiles){
    var fromDate = new Date("2016-07-16");
    var toDate = new Date("2016-07-16");
    var timeDiff = Math.abs(toDate.getTime() - fromDate.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    var avgPerDay = time / diffDays;
    return 'Average time per day: ' + timeFormatter(Math.ceil(avgPerDay));
  }
  return '';
}

//seconds to a readable format
function timeFormatter(totalSeconds) {
    var hours = parseInt(totalSeconds / 3600, 10);
    var minutes = parseInt(totalSeconds / 60, 10) % 60;
    var seconds = totalSeconds % 60;
    return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
}
