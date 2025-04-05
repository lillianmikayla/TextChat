// Generate a unique identifier for each tab
if (!localStorage.getItem('tab_id')) {
    localStorage.setItem('tab_id', Math.floor(Math.random() * 10000000));
}
const tab_id = localStorage.getItem('tab_id');

// Track the order of tabs
if (!localStorage.getItem('tab_order')) {
    localStorage.setItem('tab_order', 0);
}
const tab_order = parseInt(localStorage.getItem('tab_order')) + 1;
localStorage.setItem('tab_order', tab_order);
let username = '';

function startSession() {
    username = document.getElementById('username').value;
    if (username) {
        document.getElementById('content').innerHTML = `
         <div style="position:fixed; top:0; left:0; width:100%; background:#808080; display:flex;">
            <div style="float:left; width:100%; display:flex; flex-flow:column; justify-content:space-around;">
                <table width="100%">
                    <tr>
                        <td>
                            <textarea id="chat_text" oninput="auto_grow_text_area(this)" style="box-sizing: border-box;"></textarea>
                            </td><td valign="bottom" width="80px">
                            <button onclick="on_post_message()">Post</button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <br><br><br><br>
        <table id="chats" width="100%"></table>`;
    }
    else {
        alert('Please enter a username');
    }
}

function scrub(text) {
    if (!text) {
        text = '';
    }
    text = text.replace(/&/g, '&amp;');
    text = text.replace(/>/g, '&gt;');
    text = text.replace(/</g, '&lt;');
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/  /g, ' &nbsp;');
    return text;
}

function post_message(is_me, timestamp, text, username) {
    timestamp = scrub(timestamp);
    text = scrub(text);
    username = scrub(username);
    let chats_table = document.getElementById('chats');
    let new_row = chats_table.insertRow();
    let cell = new_row.insertCell(0);
    let s = [];
    s.push('<div class="');
    s.push(is_me ? 'bubble_right' : 'bubble_left');
    s.push('">');
    s.push(`<span class="date_stamp">${timestamp}</span>`);
    s.push(` <span class="username">${username}</span>`);
    s.push(`<br>`);
    s.push(`<code>${text}</code>`);
    s.push(`</span>`);
    cell.innerHTML = s.join('');
    cell.scrollIntoView({behavior:'smooth'});
}

async function on_post_message() {
    let text_area = document.getElementById('chat_text');
    const message = {
        tab_id: tab_id,
        tab_order: tab_order,
        timestamp: new Date().toISOString(),
        text: text_area.value,
        username: username // Ensure username is included
    };
    const response = await fetch('/ajax', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    });
    const data = await response.json();
    if (data.status === 'ok') {
        post_message(true, message.timestamp, message.text, message.username); // Pass username to post_message
        text_area.value = '';
        text_area.style.height = 'auto'; // Reset the height of the textbox
        auto_grow_text_area(text_area);
    }
}

async function fetch_messages() {
    const response = await fetch('/ajax');
    const data = await response.json();
    document.getElementById('chats').innerHTML = '';
    data.forEach(message => {
        const is_me = message.tab_id === tab_id && message.tab_order === tab_order;
        post_message(is_me, message.timestamp, message.text, message.username); // Ensure username is passed
    });
}

function auto_grow_text_area(el) {
	el.style.height = "5px";
    el.style.height = (el.scrollHeight)+"px";
}

function main() {
    // Set up the compose area
    let chat_text = document.getElementById('chat_text');
    if (chat_text) {
        auto_grow_text_area(chat_text);
    }
}

setInterval(fetch_messages, 500);

window.onload = () => {
    main();
    setInterval(fetch_messages, 500);
};