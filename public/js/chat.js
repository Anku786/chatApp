const socket = io();

// 1
// socket.on('countUpdated',(count)=>{
//     console.log('count updated',count)
// })

// document.querySelector('#inc').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })

// 2

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Template
const messageTemplateSender = document.querySelector('#message-template-sender').innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
var check = null;
const messageTemplateReciever = document.querySelector('#message-template-receiver').innerHTML;



// Options
const { username, room } = Qs.parse(location.search,{ ignoreQueryPrefix : true });
console.log('a',username)
console.log('b',room)
const autoScroll = () =>{
    //New message element
    const $newMessage = $messages.lastElementChild;

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible Height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //How far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message',(msg)=>{
    if(check === msg.username){
        const html = Mustache.render(messageTemplateSender,{
            username : msg.username ,
            message : msg.text ,
            createdAt : moment(msg.createdAt).format('h:mm a')
        });
        $messages.insertAdjacentHTML('beforeend',html);
    }
    else{
    const html = Mustache.render(messageTemplateReciever,{
        username : msg.username ,
        message : msg.text ,
        createdAt : moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
}
    autoScroll();
});



socket.on('locationMessage',(location)=>{
    const html = Mustache.render(locationTemplate,{
        username : location.username ,
        url : location.url ,
        createdAt : moment(location.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
});
socket.on('roomData',({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        username : check,
        room ,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    // disable form
    $messageFormButton.setAttribute('disabled','disabled');

    const message = document.querySelector('input').value;
    socket.emit('sendMessage',message,(error)=>{
        // enable form
        $messageFormButton.removeAttribute('disabled');
        // input clear
        $messageFormInput.value = ''
        $messageFormInput.focus();

        if(error){
            return console.log(error)
        }
        console.log('Message Delivered!!')
    })
})

$locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by browser')
    }
    $locationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        const data = {
            'latitude' : position.coords.latitude,
            'longitude' : position.coords.longitude
        }
        socket.emit('sendLocation',data,()=>{
            $locationButton.removeAttribute('disabled');
            console.log('Location Shared')
        })
    })
});

socket.emit('join', {username,room}, (error)=>{
    check = username
    if(error){
        alert(error)
        location.href = "/"
    }
});

