const platformClient = require('platformClient');
var client = platformClient.ApiClient.instance;
//client.setPersistSettings(true, 'optional_prefix');
var clientId = '1a469bb5-7bb7-4fa7-bf4e-6e90191223a8';
redirectUri = 'https://localhost:3000/' // encodeURIComponent(window.location.href);

function predict() {
    authStuff();
}


let authStuff = async () => {

    let it = document.getElementById("interactionType");
    let interactionType = it.options[it.selectedIndex].value;

    // let m = document.getElementById("metric");
    // let metric = m.options[m.selectedIndex].value;
    let metricList = ['tWait', 'tTalk', 'tHandle'];

    console.log(interactionType);

    let body = `
    {
        "interval": "2017-10-11T04:00:00.000Z/2017-11-12T05:00:00.000Z",
        "granularity": "P1D",
        "groupBy": [],
        "views": []
       }
    `;

    var apiInstance = new platformClient.AnalyticsApi();

    let data = await apiInstance.postAnalyticsConversationsAggregatesQuery(body);
    console.log(data);


    let json = {};
    let dataObjArr = [];

    let dataObj = [];
    let dataObjtWait = {};
    let dataObjtTalk = {};
    let dataObjtHeld = {};


    let mediaTypeData = data.results.filter(function (item) {
        return item.group.mediaType === interactionType;
    })[0].data;
    console.log('mediaTypeData');
    console.log(mediaTypeData);

    metricList.forEach((metric,index) => {
        mediaTypeData.forEach((element) => {
            let keyDate = element.interval.split('/')[0];

            let valueStats = element.metrics.filter(function (item) {
                return item.metric === metric;
            });
            if (valueStats.length > 0) {
                valueStats = valueStats[0].stats;
                if(keyDate==='2017-11-11T04:00:00.000Z') {

                    let d = new Date();
                    d = Date.parse(keyDate);
            
                    for (var i = 0; i < 7; i++) {
                        let dd = d - i * 86400000;
                        //console.log(new Date(dd).toISOString());
                        element.metrics.forEach(function (el) {
                            let stats = {};
                            //console.log(el.metric);
                            let keys = Object.keys(el.stats);
                            let random = (Math.random() * 0.4) + 0.8;
                            keys.forEach((elem) => {
                                //console.log(elem + ' - ' + el.stats[elem]);
                                let val = el.stats[elem] * random;
                                val = Math.ceil(val);
                                if(elem!=='ratio' && elem!=='numerator' && elem!=='denominator')
                                    stats[elem] = val;
                            });

                            if (index == 0) {
                                dataObjtWait[new Date(dd).toISOString()] = stats;
                            }
                            else if (index == 1) {
                                dataObjtTalk[new Date(dd).toISOString()] = stats;
                            }
                            else if (index == 2) {
                                dataObjtHeld[new Date(dd).toISOString()] = stats;
                            }
                        });
                    }

                    
                }
                
                // dataObj[keyDate] = valueStats;
            }
        });
    });

    dataObj.push(dataObjtWait, dataObjtTalk, dataObjtHeld);
    console.log('dataObj');
    console.log(dataObj);

    let url = 'https://ccforecast.herokuapp.com/predictPlease';

    dataObj.forEach(data => {
        fetch(url, {
            method: 'post',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                'data': data,
                'predictDays': 1,
                'politeMode': 'please'
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
        .catch(err => console.log(err));

    });



}

client.loginImplicitGrant(clientId, redirectUri)
    .then(function () {
        //alert('I am auth');
        //authStuff();
        new platformClient.UsersApi().getUsersMe()
            .then(function(data) {
                if (data.id === 'f00c71de-edce-46b9-bc41-6692b3b3cc4b') {
                    document.getElementById('predict-selection').style.display = 'none';
                    document.getElementById('metrics-prediction').style.display = 'none';
                } else {
                    document.getElementById('prediction-summary').style.display = 'none';
                }
            })
            .catch(function(error) {
                console.log('There was a failure calling getUsersMe');
                console.error(error);
            });
    })
    .catch(function (response) {
        console.log(`${response.status} - ${response.error.message}`);
        console.log(response.error);
    });



(() => {
    let elements = document.querySelectorAll('.card-link');
    let currentSetting = '';

    for (const node in elements) {
        if (elements.hasOwnProperty(node)) {
            const element = elements[node];
            element.addEventListener('click', (event) => {
                let settingText = event.target.parentElement.previousElementSibling.children[0].textContent;
                currentSetting = settingText;
                document.querySelector('.modal-title').innerHTML = currentSetting;

                $('#modal').modal('toggle');
                return false;
            }, false);
        }
    }

    document.querySelector('.modal-footer .btn-primary').addEventListener('click', () => {
        console.log(currentSetting);
        let values = document.querySelectorAll('.form-row .col .form-control');

        localStorage.setItem(currentSetting, JSON.stringify({ min: values[0].value, max: values[1].value }))

        values[0].value = '';
        values[1].value = '';
        $('#modal').modal('toggle');
    }, false);

})()