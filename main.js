var btnRefresh = document.querySelector('#refresh'),
    btnPost = document.querySelector('#post'),
    btnDelete = document.querySelector('#delete'),
    btnChange = document.querySelector('#change'),
    DONE = 4,
    OK = 200;

// disables form default validation mechanisms.
function validateMyForm(){
    return false;
}


/**
 * AJAX Request function with callback and optional request headers.
 * @param request      - type of request. accepts 'GET', 'POST', 'PUT' & 'DELETE'
 *
 * @param url          - path on the server:
 *                       GET    = https://hidden-headland-7200.herokuapp.com/
 *                       POST   = https://hidden-headland-7200.herokuapp.com/new/
 *                       PUT    = https://hidden-headland-7200.herokuapp.com/edit/<_id-number-here>
 *                       DELETE = https://hidden-headland-7200.herokuapp.com/delete/<_id-number-here>
 *
 * @param callback     - function to execute on readyState === 4 (DONE).
 *
 * @param body         - the body of the request. accepts empty, null and JSON string.
 *       (optional)
 *
 * @param headers      - request headers. if needed, syntax is a single string separated
 *       (optional)      by a colon ':'. In example - <code>'Content-Type:application/json'</code>
 *                       multiple request headers is handled with array of same syntaxed strings.
 *
 * @param responseType - a string of expected response types. can be left blank defaults to 'json'
 *       (optional)
 */
function ajax(request, url, callback, body, headers, responseType){
    // 7nth param is the onclick event.
    // stops it from bubbling to the <form>
    arguments[6].stopPropagation();

    var xhr  = new XMLHttpRequest(),
        DONE = 4,
        OK   = 200,
        args;

    // open request
    xhr.open(request, url);

    // set request headers based on typeof headers.
    //if headers is a string. This means that there's only one request header to set
    if ( typeof headers === 'string' && !!headers){
        //split strings into arguments array. always a length of 2.
        args = headers.split(':');

        // set headers based on the array.
        xhr.setRequestHeader(args[0], args[1]);
    }

    // if headers is an array. This means that there's more than one request header to set
    else if( headers instanceof Array ){

        // loop over all setRequestHeader arguments
        headers.forEach(function(el){
            if (typeof el === 'string'){

                //split every arument to an aray of the two arguments required for setRequestHeader
                args = el.split(":");

                // evoke setRequestHeader for each of the arguments supplied.
                xhr.setRequestHeader(args[0], args[1]);
        }});

    }

    // setting expected response type. defaults to 'json'
    xhr.responseType = responseType || 'json';

    xhr.onreadystatechange = function(){

        // if DONE and OK
        if(xhr.readyState === DONE && xhr.status === OK){
            console.log(xhr.response.message);
            callback(xhr); // evoke callback with xhr object as first argument.

        // if DONE but not OK
        } else if (xhr.readyState === DONE && xhr.status !== OK){
            console.log('bad request');
        }
    };

    // sends the request.
    // if body exists and or it's a null => send request with specified body
    // else send request with no body
    body || body === null ? xhr.send(body) : xhr.send();

    console.log('request ' + request + ' has been sent');
}


/*// function bound to onclick of refresh <button> element.
// refreshes the message board and gets all new messages and changes
function msgRefresh(ev) {

    //stops bubbling to form tag
    ev.stopPropagation();

    // creating request object
    var xhr = new XMLHttpRequest();

    // defining request properties
    xhr.open('get', 'https://hidden-headland-7200.herokuapp.com/');

    // defining that the response will be json and
    // json will be automatically parsed into object
    xhr.responseType = 'json';

    // adding event listener that fires only when request if OK
    // and done loading. callback makes a message HTML structure.
    xhr.onreadystatechange = function () {

        if (xhr.readyState === DONE) { // when done. readyState is 4.
            if (xhr.status === OK) { // when ok. status is 200

                // the json object with
                // an array of object messages
                var messages = xhr.response,

                // string that will later be concatenated into the
                // innerHTML.
                    string = '',

                // caching the <section class="msgBoard"> tag.
                    msgBoard = document.querySelector('.msgBoard');

                // looping over all the message objects
                for (var i = 0; i < messages.length; i++){
                    string += '<article class="msg"><h1>' + messages[i].name + '</h1><p> ID:' + messages[i]._id + '</p><p>' + messages[i].message + '</p></article>';
                }

                // assigning messages to msgBoard
                msgBoard.innerHTML = string;


            } else {
                console.log("could not get messages");
            }
        }
    };

    xhr.send();
    console.log("request msgRefresh sent");
}


// Post message function. it's bound to Post <button id="post"> click event.
// posts the message composed from the usrName input field and the msgBody field
function msgPost(ev) {

    // stops propagation to form tag
    ev.stopPropagation();

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://hidden-headland-7200.herokuapp.com/new'); // NOTE: the url is a bit different. `/new `

    // asigning a header to the request that states the sent data format, the type of the content.
    // server excpects json format.
    xhr.setRequestHeader('Content-Type', 'application/json');

    // sets the stage for the response from the server. automatically parses the recieved json.
    xhr.responseType = 'json';

    // feed back to console on request success / fail
    xhr.onreadystatechange = function () {

        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                var feedback = xhr.response.message;
                console.log("message status: " + feedback);

                // upon success simulates click event on refresh button to load new posts
                btnRefresh.click();

            } else {
                console.log("an error occurred");
            }
        }
    };

    // send the request and puts the details in a json on the body of the request.
    xhr.send('{"message":"'+ msgBody.value + '","name":"' + usrName.value +'"}');
    console.log("request msgPost sent");
}


// request function to delete a message from the board
// server checks the IP matches creator. id must be provided
function msgChange(ev) {

    ev.stopPropagation();
    var xhr = new XMLHttpRequest();

    // NOTE: the url is a bit different. `/edit/ ` and query for id value should be concatenated at the end. id number only
    xhr.open('PUT', 'https://hidden-headland-7200.herokuapp.com/edit/' + msgId.value);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    xhr.onreadystatechange = function () {

        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                var feedback = xhr.response.message;
                console.log("message status: " + feedback);
                btnRefresh.click();

            } else {
                console.log("an error occurred");
            }
        }
    };
    xhr.send('{"message":"'+ msgBody.value + '","name":"' + usrName.value +'"}');
    console.log("request msgChange sent");
}


function msgDelete(ev){

    ev.stopPropagation();
    var xhr = new XMLHttpRequest();

    // NOTE: the url is a bit different. `/delete/ ` and query for id value should be concatenated at the end. id number only
    xhr.open('DELETE', 'https://hidden-headland-7200.herokuapp.com/delete/' + msgId.value);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    xhr.onreadystatechange = function () {

        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                var feedback = xhr.response.message;
                console.log("message status: " + feedback);
                btnRefresh.click();

            } else {
                console.log("an error occurred");
            }
        }
    };
    xhr.send();
    console.log("request msgDelete sent");
}

btnRefresh.onclick = msgRefresh;
btnPost.onclick = msgPost;
btnDelete.onclick = msgDelete;
btnChange.onclick = msgChange;*/



/*
* ================================================================================================================
*                                           Refresh button event
* ================================================================================================================
* */
                    // arrow function is to prevent ajax(); from firing until event dispatches
btnRefresh.onclick = event => {ajax('GET', 'https://hidden-headland-7200.herokuapp.com/', function(xhr){
    // the json object with
    // an array of object messages
    var messages = xhr.response,

    // string that will later be concatenated into the
    // innerHTML.
        string = '',

    // caching the <section class="msgBoard"> tag.
        msgBoard = document.querySelector('.msgBoard');

    // looping over all the message objects
    for (var i = 0; i < messages.length; i++){
        string += '<article class="msg"><h1>' + messages[i].name + '</h1><p> ID:' + messages[i]._id + '</p><p>' + messages[i].message + '</p></article>';
    }

    // assigning messages to msgBoard
    msgBoard.innerHTML = string;
},'','','',event)}


/*
 * ================================================================================================================
 *                                           Post button event
 * ================================================================================================================
 * */

btnPost.onclick = event => {ajax('POST', 'https://hidden-headland-7200.herokuapp.com/new', function(xhr){
    var feedback = xhr.response.message;
    console.log("message status: " + feedback);

    // upon success simulates click event on refresh button to load new posts
    btnRefresh.click();

    //body argument                                                    headers argument   responseType argument
},'{"message":"'+ msgBody.value + '","name":"' + usrName.value +'"}','Content-Type:application/json','json',event)}


/*
 * ================================================================================================================
 *                                           Delete button event
 * ================================================================================================================
 * */

btnDelete.onclick = event => {ajax('DELETE', ('https://hidden-headland-7200.herokuapp.com/delete/' + msgId.value), function(xhr){
    var feedback = xhr.response.message;
    console.log("message status: " + feedback);
    btnRefresh.click();

},'','Content-Type:application/json','json',event)}


/*
 * ================================================================================================================
 *                                           Edit button event
 * ================================================================================================================
 * */

btnChange.onclick = event => {ajax('PUT', ('https://hidden-headland-7200.herokuapp.com/edit/' + msgId.value), function(xhr){
    var feedback = xhr.response.message;
    console.log("message status: " + feedback);
    btnRefresh.click();

},'{"message":"'+ msgBody.value + '","name":"' + usrName.value +'"}','Content-Type:application/json','json',event)}
