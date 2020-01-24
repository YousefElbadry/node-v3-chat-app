const socket = io();
moment.locale('ja');
// socket.on('countUpdated', (count) => { // the paramter name is not important but the order of the parameters is
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clicked');
//     socket.emit('increment');
// });

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $location = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const urlTemplate = document.querySelector('#url-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
// Options
const {username, room} =Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    console.log('newMessageStyles', newMessageMargin);

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container ie: total height of the container (bigger than the visible height)
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?, scrollTop gives us -as a number- the amount of distance we scrolled from the top 
    // since there is no scrollBottom we're going to take scrollTop: the distance between the top of the content and top of the scrollbar and we're going to add the scrollbar height which is the visible height of the container 
    const scrollOffset = $messages.scrollTop + visibleHeight
    
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }

}

socket.on('message', (message) => {
    console.log(message);
    // we provide data as the second argument to the render method and it's an object and we can provide as many key-value pairs as we want
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm A')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', (message) => {
    console.log(message);
    // we provide data as the second argument to the render method and it's an object and we can provide as many key-value pairs as we want
    const html = Mustache.render(urlTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('hh:mm A')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('roomData', ({room, users}) => {
    const html  =Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

// document.querySelector('#send').addEventListener('click', () => {
//     const inputEl =document.getElementById('message');
    
//     socket.emit('sendMessage', inputEl.value);
// })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // disable
    $messageFormButton.setAttribute('disabled', 'disabled');

    // e.target = form
    // e.target.elements = form elements you can access any of them by their name
    const message = e.target.elements.message.value
    // client sets a callback function that the server executes sending the arguments back to the client
    // and the client recieves these arguments and manipulates them
    socket.emit('sendMessage', message, (error) => {
        // re-enable
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        // console.log('The message was delivered',serverMessage);
        if (error) {
            console.log(error)
        } 
        else {
            console.log('Message Delivered');
        } 
    });
});

$location.addEventListener('click', ()=> {
    // disable
    $location.setAttribute('disabled', 'disabled');

    // if this property doesn't exist: it means that the browser/OS doesn't have support for the geolocation functionality
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }
    // currently doesn;t support the Promise API so we can't use promises or async/await so we'll use the callback fn 
    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('sendLocation',{latitude: position.coords.latitude,
            longitude: position.coords.longitude}, (locationShared) => {
                // re-enable
                $location.removeAttribute('disabled');

                console.log(locationShared)
            })
    })
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href= "/";
    }
})