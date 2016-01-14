/**
 * # Chat Module #
 *
 *
 * ## to operate, chat module requires a HTML structure as follows: ##
 *
 *  <form id="chatInput">
 *      <section>
 *          <label for="usrName" value="name"></label>
 *           <input type="text" id="usrName"/>
 *      </section>
 *      <section>
 *          <label for="msgId">Message ID:</label>
 *          <input id="msgId"/>
 *       </section>
 *       <section>
 *          <label for="msgBody" value="message body"></label>
 *          <input id="msgBody"/>
 *       </section>
 *       <button id="refresh"></button>
 *       <button id="post">Send</button>
 *       <button id="change">Edit</button>
 *       <button id="delete">Delete</button>
 *  </form>
 *  <section class="msgBoard"></section>
 *
 * ### The message board tag will be filled with the messages with the following structure: ###
 *
 *      <article class="message">
 *          <h1></h1> // the name of the sender
 *
 *          // contains: "ID:" + (id number...). the data-layout attribute should be used to hide this element.
 *          <p data-layout="hide"></p>
 *
 *          <p></p> // contains the message text.
 *      </article>
 */
var chatModule = function () {

    var btnRefresh = document.querySelector('#refresh'),
        btnPost = document.querySelector('#post'),
        btnDelete = document.querySelector('#delete'),
        btnChange = document.querySelector('#change'),
        form = document.querySelector('#chatInput'),
        DONE = 4,
        OK = 200,
        url = 'https://hidden-headland-7200.herokuapp.com/',
        msgArray; // variable will be assigned with all messages elements

    // disables form default validation mechanisms.
    form.onsubmit = event => {
        event.preventDefault();return function validateMyForm() {
            return false;
        }();
    };

    /**
     * @module -  The Core module. includes the ajax function.
     * @function - the ajax function
     * @type {{ajax}}
     * @exports - an API with an core.ajax(); method
     */
    var core = function () {

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
        function ajax(request, url, callback, body, headers, responseType) {

            // create promise on JAX Requests
            var promise = new Promise(function (resolve, reject) {

                var xhr = new XMLHttpRequest(),
                    args;

                // open request
                xhr.open(request, url);

                // set request headers based on typeof headers.
                //if headers is a string. This means that there's only one request header to set
                if (typeof headers === 'string' && !!headers) {
                    //split strings into arguments array. always a length of 2.
                    args = headers.split(':');

                    // set headers based on the array.
                    xhr.setRequestHeader(args[0], args[1]);
                }

                // if headers is an array. This means that there's more than one request header to set
                else if (headers instanceof Array) {

                        // loop over all setRequestHeader arguments
                        headers.forEach(function (el) {
                            if (typeof el === 'string') {

                                //split every arument to an aray of the two arguments required for setRequestHeader
                                args = el.split(":");

                                // evoke setRequestHeader for each of the arguments supplied.
                                xhr.setRequestHeader(args[0], args[1]);
                            }
                        });
                    }

                // setting expected response type. defaults to 'json'
                xhr.responseType = responseType || 'json';

                xhr.onreadystatechange = function () {

                    // if DONE and OK
                    if (xhr.readyState === DONE && xhr.status === OK) {
                        if (xhr.response !== null) {
                            console.log(xhr.response.message || "no response");
                        }
                        callback(xhr, resolve); // evoke callback with xhr object as first argument.
                        // and the resolve function as second!
                        // user can evoke a .then function by the resolve
                        // function they add to the callback!

                        // if DONE but not OK
                    } else if (xhr.readyState === DONE && xhr.status !== OK) {
                            console.log('bad request');
                            reject('request failed'); // on failure evoke reject function to promise
                        }
                };

                // sends the request.
                // if body exists and or it's a null => send request with specified body
                // else send request with no body
                body || body === null ? xhr.send(body) : xhr.send();

                console.log('request ' + request + ' has been sent');
            });

            return promise; // send the promise down the chain
        }

        // returns core API
        return {
            ajax: ajax
        };
    }();

    var utils = function () {

        /*
         * ================================================================================================================
         *                                           Message Action Utility
         * ================================================================================================================
         * */

        // function assigns event listeners to all messages every refresh.
        function messageAction() {

            // assign all present messages with an event listener
            for (var j = 0; j < msgArray.length; j++) {
                msgArray[j].addEventListener('click', function () {

                    //onclick - assign the clicked element with a selected state.

                    // if it has one already remove the attribute.
                    if (this.hasAttribute('data-state')) {
                        this.removeAttribute('data-state');
                    } else {
                        //when clicked remove all selected states
                        for (var i = 0; i < msgArray.length; i++) {
                            msgArray[i].removeAttribute('data-state');
                        }
                        // and assign the clicked element with a selected state.
                        this.setAttribute('data-state', 'selected');
                    }

                    // insert the id value of current selected message to the msgId input field
                    msgId.value = this.childNodes[1].textContent.slice(4);

                    // if a message is currently selected - unhide edit and delete button
                    if (this.hasAttribute('data-state')) {
                        btnChange.setAttribute('data-state', 'selected');
                        btnDelete.setAttribute('data-state', 'selected');
                    } else {
                        // if it isn't hide it
                        btnChange.removeAttribute('data-state');
                        btnDelete.removeAttribute('data-state');
                    }
                });
            }
        }

        /*
         *============================================= END OF MESSAGE ACTION UTIL =====================================
         * */

        /*
         * ================================================================================================================
         *                                       Auto Scroll to bottom Util
         * ================================================================================================================
         * */

        function scrollToBottom(msgBoard) {
            msgBoard.scrollTop = msgBoard.scrollHeight;
        }

        /*
         *==================================== END OF AUTO SCROLL TO BOTTOM UTIL ==========================================
         * */

        /*
         * ================================================================================================================
         *                                           Refresh button callback
         * ================================================================================================================
         * */
        // arrow function is to prevent ajax(); from firing until event dispatches
        // also, an 'event' parameter is sent with the arrow function and is p-heightassed as the
        // last argument to ajax(); function.
        function refresh(event) {

            // stop event bubbling to form
            if (event) event.stopPropagation();

            // return ! Promised ! AJAX request to get messages
            return core.ajax('GET', url, function (xhr, resolve) {

                // the json object with
                // an array of object messages
                var messages = xhr.response,

                // string that will later be concatenated into the
                // innerHTML.
                string = '',

                // caching the <section class="msgBoard"> tag.
                msgBoard = document.querySelector('.msgBoard');

                // looping over all the message objects
                for (var i = 0; i < messages.length; i++) {
                    string += '<article class="msg"><h1>' + messages[i].name + '</h1><p data-layout="hide"> ID:' + messages[i]._id + '</p><p>' + messages[i].message + '</p></article>';
                }

                // assigning messages to msgBoard
                msgBoard.innerHTML = string;

                resolve(msgBoard); // sends the msgBoard element to the .then method

                //after all messages pushed to DOM - select all in array like.
                msgArray = document.querySelectorAll('.msg');

                messageAction();
            });
        }

        /*
         * ================================================================================================================
         *                                           Post button event
         * ================================================================================================================
         * */

        function post(event) {

            event.stopPropagation();

            return core.ajax('POST', url + 'new', function (xhr, resolve) {
                var feedback = xhr.response !== null ? xhr.response.message : "no response";
                console.log("message status: " + feedback);

                resolve(event);
            }, '{"message":"' + msgBody.value + '","name":"' + usrName.value + '"}', 'Content-Type:application/json', 'json').then(refresh);
        }

        /*
         * ================================================================================================================
         *                                           Delete button event
         * ================================================================================================================
         * */

        function dell(event) {

            event.stopPropagation();

            return core.ajax('DELETE', url + 'delete/' + msgId.value, function (xhr, resolve) {
                var feedback = xhr.response !== null ? xhr.response.message : "no response";
                console.log("message status: " + feedback);

                resolve(event);
            }, '', 'Content-Type:application/json', 'json').then(refresh);
        }

        /*
         * ================================================================================================================
         *                                           Edit button event
         * ================================================================================================================
         * */

        function change(event) {

            event.stopPropagation();

            return core.ajax('PUT', url + 'edit/' + msgId.value, function (xhr, resolve) {
                var feedback = xhr.response !== null ? xhr.response.message : "no response";
                console.log("message status: " + feedback);

                resolve(event);
            }, '{"message":"' + msgBody.value + '","name":"' + usrName.value + '"}', 'Content-Type:application/json', 'json').then(refresh);
        }

        //return utils api
        return {
            refresh: refresh,
            send: post,
            edit: change,
            remove: dell,
            scrollToBottom: scrollToBottom
        };
    }();

    document.addEventListener('DOMContentLoaded', function () {
        console.log('DOM fully loaded and parsed');

        //initializing event listeners
        btnRefresh.onclick = event => {
            utils.refresh(event).then(utils.scrollToBottom);
        };
        btnPost.onclick = event => {
            utils.send(event).then(utils.scrollToBottom);
        };
        btnChange.onclick = utils.edit;
        btnDelete.onclick = utils.remove;
    });

    // fire refresh when page is fully loaded.
    window.addEventListener('load', function () {
        console.log('page finished loading');

        // first initial firing
        utils.refresh().then(utils.scrollToBottom);

        // automatic 30 sec refresh.
        setInterval(utils.refresh, 30000);
    });
}();

/**
 * =============================================================================================================
 *                                              END OF CHAT MODULE
 * =============================================================================================================
 */

//# sourceMappingURL=main-compiled.js.map